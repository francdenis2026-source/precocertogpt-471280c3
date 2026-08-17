import { supabase } from './roles';

export type AdminCatalogSnapshot = { products:any[]; establishments:any[]; coverageGaps:any[] };

export async function loadAdminCatalog():Promise<AdminCatalogSnapshot>{
  if(!supabase) return {products:[],establishments:[],coverageGaps:[]};
  const {data,error}=await supabase.rpc('admin_catalog_snapshot');
  if(error) throw error;
  return (data||{products:[],establishments:[],coverageGaps:[]}) as AdminCatalogSnapshot;
}

export async function loadAdminEstablishmentCatalog(establishmentId:string):Promise<any[]>{
  if(!supabase) return [];
  const {data,error}=await supabase.rpc('admin_establishment_catalog',{_establishment_id:establishmentId});
  if(error) throw error;
  return Array.isArray(data)?data:[];
}

export async function saveAdminProduct(input:{id?:string|null;name:string;brand?:string;category?:string;size?:string;unit?:string;barcode?:string;slug?:string;imageUrl?:string}){
  if(!supabase) return {data:null,error:'Supabase indisponível'};
  const {data,error}=await supabase.rpc('admin_save_product',{_id:input.id||null,_name:input.name,_brand:input.brand||null,_category:input.category||null,_size:input.size||null,_unit:input.unit||null,_barcode:input.barcode||null,_slug:input.slug||null,_image_url:input.imageUrl||null});
  return {data:data as string|null,error:error?.message??null};
}

export async function deleteAdminProduct(id:string,name:string){
  if(!supabase) return {error:'Supabase indisponível'};
  const {error}=await supabase.rpc('admin_delete_product',{_product_id:id,_confirm_name:name});
  return {error:error?.message??null};
}

export async function saveAdminEstablishment(input:{id?:string|null;name:string;neighborhood?:string;kind?:string;slug?:string;shortDescription?:string;logoUrl?:string;isVerified?:boolean;isDemo?:boolean}){
  if(!supabase) return {data:null,error:'Supabase indisponível'};
  const {data,error}=await supabase.rpc('admin_save_establishment',{_id:input.id||null,_name:input.name,_neighborhood:input.neighborhood||null,_kind:input.kind||null,_slug:input.slug||null,_short_description:input.shortDescription||null,_logo_url:input.logoUrl||null,_is_verified:Boolean(input.isVerified),_is_demo:Boolean(input.isDemo)});
  return {data:data as string|null,error:error?.message??null};
}

export async function deleteAdminEstablishment(id:string,name:string,deleteDemoOperation=false){
  if(!supabase) return {error:'Supabase indisponível'};
  const {error}=await supabase.rpc('admin_delete_establishment',{_establishment_id:id,_confirm_name:name,_delete_demo_operation:deleteDemoOperation});
  return {error:error?.message??null};
}

export async function setAdminProductPrice(productId:string,establishmentId:string,value:number){
  if(!supabase) return {error:'Supabase indisponível'};
  const {error}=await supabase.rpc('admin_set_product_price',{_product_id:productId,_establishment_id:establishmentId,_value:value});
  return {error:error?.message??null};
}

export async function deleteAdminProductPrice(productId:string,establishmentId:string){
  if(!supabase) return {error:'Supabase indisponível'};
  const {error}=await supabase.rpc('admin_delete_product_price',{_product_id:productId,_establishment_id:establishmentId});
  return {error:error?.message??null};
}

export async function uploadAdminProductImage(file:File,productKey:string){
  if(!supabase) return {url:null,error:'Supabase indisponível'};
  if(!file.type.startsWith('image/')) return {url:null,error:'Selecione um arquivo de imagem.'};
  if(file.size>5*1024*1024) return {url:null,error:'A imagem deve ter no máximo 5 MB.'};
  const ext=(file.name.split('.').pop()||'webp').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=(productKey||'produto').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'produto';
  const path=`admin/${safe}-${Date.now()}.${ext}`;
  const {error}=await supabase.storage.from('products').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
  if(error) return {url:null,error:error.message};
  const {data}=supabase.storage.from('products').getPublicUrl(path);
  return {url:data.publicUrl,error:null};
}
