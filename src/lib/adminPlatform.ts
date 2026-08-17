import { supabase } from './roles';

export type AdminSnapshot = { summary: Record<string, number>; applications:any[]; merchants:any[]; orders:any[]; users:any[]; prices:any[]; priceMap:any[]; audit:any[]; activity:any[] };
let snapshotCache:{value:AdminSnapshot;at:number}|null=null;
let snapshotRequest:Promise<AdminSnapshot|null>|null=null;
const TTL=30_000;
export function invalidateAdminSnapshot(){snapshotCache=null;}
export async function loadAdminSnapshot(force=false):Promise<AdminSnapshot|null>{
  if(!supabase)return null;
  if(!force&&snapshotCache&&Date.now()-snapshotCache.at<TTL)return snapshotCache.value;
  if(!force&&snapshotRequest)return snapshotRequest;
  snapshotRequest=(async()=>{const{data,error}=await supabase.rpc('admin_control_center_snapshot');if(error)throw error;const value=data as AdminSnapshot;snapshotCache={value,at:Date.now()};return value;})();
  try{return await snapshotRequest;}finally{snapshotRequest=null;}
}
async function mutation(rpc:string,args:any){if(!supabase)return{error:'Supabase indisponível'};const{error}=await supabase.rpc(rpc,args);if(!error)invalidateAdminSnapshot();return{error:error?.message??null};}
export const reviewMerchantApplication=(id:string,decision:'approved'|'rejected',notes?:string)=>mutation('review_merchant_application',{_application_id:id,_decision:decision,_admin_notes:notes||null});
export const updateMerchant=(id:string,values:{status?:'active'|'inactive'|'suspended';onlineSalesEnabled?:boolean})=>mutation('admin_update_merchant',{_merchant_id:id,_status:values.status??null,_online_sales_enabled:values.onlineSalesEnabled??null});
export const setUserRole=(userId:string,role:'super_admin'|'admin'|'moderator'|'merchant_owner'|'merchant_staff'|'consumer',enabled:boolean)=>mutation('admin_set_user_role',{_user_id:userId,_role:role,_enabled:enabled});
export const cancelOrder=(orderId:string,reason:string)=>mutation('admin_cancel_order',{_order_id:orderId,_reason:reason});
