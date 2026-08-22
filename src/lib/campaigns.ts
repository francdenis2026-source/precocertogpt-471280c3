import { supabase } from './supabase';
import { loadSessionProfile } from './roles';

export type CampaignKind='announcement'|'advertisement';
export type CampaignTheme='indigo'|'emerald'|'amber'|'slate';
export type PlatformCampaign={
  id:string;kind:CampaignKind;placement:'top_bar';title:string;subtitle:string|null;
  imageUrl:string|null;linkUrl:string;linkLabel:string;theme:CampaignTheme;priority:number;
  isActive:boolean;isDismissible:boolean;startsAt:string|null;endsAt:string|null;
  createdAt:string|null;updatedAt:string|null;
};
export type CampaignInput=Omit<PlatformCampaign,'id'|'createdAt'|'updatedAt'> & {id?:string};

const FESTIVAL_FALLBACK:PlatformCampaign={id:'festival-acai-2026',kind:'announcement',placement:'top_bar',title:'Festival do Açaí e Festival de Praia em Feijó',subtitle:'Pesquise e compare preços locais',imageUrl:'/banner-festival-acai-feijo-2026.png',linkUrl:'/buscar',linkLabel:'Comparar preços',theme:'indigo',priority:100,isActive:true,isDismissible:true,startsAt:'2026-08-21T00:00:00-05:00',endsAt:'2026-08-25T00:00:00-05:00',createdAt:null,updatedAt:null};

const fromRow=(row:Record<string,unknown>):PlatformCampaign=>({id:String(row.id),kind:row.kind==='advertisement'?'advertisement':'announcement',placement:'top_bar',title:String(row.title||''),subtitle:row.subtitle?String(row.subtitle):null,imageUrl:row.image_url?String(row.image_url):null,linkUrl:String(row.link_url||'/buscar'),linkLabel:String(row.link_label||'Saiba mais'),theme:(['emerald','amber','slate'].includes(String(row.theme))?String(row.theme):'indigo') as CampaignTheme,priority:Number(row.priority)||0,isActive:Boolean(row.is_active),isDismissible:row.is_dismissible!==false,startsAt:row.starts_at?String(row.starts_at):null,endsAt:row.ends_at?String(row.ends_at):null,createdAt:row.created_at?String(row.created_at):null,updatedAt:row.updated_at?String(row.updated_at):null});
const toRow=(value:CampaignInput,userId:string)=>({kind:value.kind,placement:'top_bar',title:value.title.trim(),subtitle:value.subtitle?.trim()||null,image_url:value.imageUrl?.trim()||null,link_url:value.linkUrl.trim()||'/buscar',link_label:value.linkLabel.trim()||'Saiba mais',theme:value.theme,priority:value.priority,is_active:value.isActive,is_dismissible:value.isDismissible,starts_at:value.startsAt||null,ends_at:value.endsAt||null,updated_at:new Date().toISOString(),updated_by:userId});
const isCurrent=(campaign:PlatformCampaign,now=Date.now())=>campaign.isActive&&(!campaign.startsAt||new Date(campaign.startsAt).getTime()<=now)&&(!campaign.endsAt||new Date(campaign.endsAt).getTime()>now);

export async function loadActiveCampaigns():Promise<PlatformCampaign[]>{
  const fallback=isCurrent(FESTIVAL_FALLBACK)?[FESTIVAL_FALLBACK]:[];
  if(!supabase)return fallback;
  const now=new Date().toISOString();
  const{data,error}=await supabase.from('platform_campaigns').select('*').eq('is_active',true).eq('placement','top_bar').or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gt.${now}`).order('priority',{ascending:false}).order('created_at',{ascending:false});
  if(error)return fallback;
  return (data||[]).map(fromRow).filter(campaign=>isCurrent(campaign));
}

export async function loadAdminCampaigns():Promise<PlatformCampaign[]>{
  if(!supabase)return[];
  const{data,error}=await supabase.from('platform_campaigns').select('*').order('priority',{ascending:false}).order('created_at',{ascending:false});
  if(error)throw error;
  return (data||[]).map(fromRow);
}

export async function saveCampaign(value:CampaignInput){
  if(!supabase)return{error:'Banco não configurado.',campaign:null as PlatformCampaign|null};
  const profile=await loadSessionProfile(true);if(!profile?.isAdmin)return{error:'Acesso administrativo necessário.',campaign:null};
  if(value.endsAt&&value.startsAt&&new Date(value.endsAt)<=new Date(value.startsAt))return{error:'O encerramento precisa acontecer depois do início.',campaign:null};
  const payload={...toRow(value,profile.userId),...(value.id?{}:{created_by:profile.userId})};
  const request=value.id?supabase.from('platform_campaigns').update(payload).eq('id',value.id):supabase.from('platform_campaigns').insert(payload);
  const{data,error}=await request.select('*').single();
  if(!error&&typeof window!=='undefined')window.dispatchEvent(new Event('pc:campaigns-changed'));
  return{error:error?.message??null,campaign:data?fromRow(data):null};
}

export async function deleteCampaign(id:string){if(!supabase)return{error:'Banco não configurado.'};const profile=await loadSessionProfile(true);if(!profile?.isAdmin)return{error:'Acesso administrativo necessário.'};const{error}=await supabase.from('platform_campaigns').delete().eq('id',id);if(!error&&typeof window!=='undefined')window.dispatchEvent(new Event('pc:campaigns-changed'));return{error:error?.message??null};}
export async function uploadCampaignImage(file:File){if(!supabase)return{error:'Banco não configurado.',url:null as string|null};if(!file.type.startsWith('image/'))return{error:'Escolha um arquivo de imagem.',url:null};if(file.size>8*1024*1024)return{error:'A imagem deve ter no máximo 8 MB.',url:null};const ext=(file.name.split('.').pop()||'webp').replace(/[^a-z0-9]/gi,'').toLowerCase();const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;const{error}=await supabase.storage.from('campaigns').upload(path,file,{cacheControl:'3600',upsert:false});if(error)return{error:error.message,url:null};return{error:null,url:supabase.storage.from('campaigns').getPublicUrl(path).data.publicUrl};}
