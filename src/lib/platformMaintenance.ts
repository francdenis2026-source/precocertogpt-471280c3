import { supabase } from './supabase';
import { loadSessionProfile } from './roles';

export type PlatformMaintenanceSettings={
  maintenanceMode:boolean;
  message:string;
  updatedAt:string|null;
};

const FALLBACK:PlatformMaintenanceSettings={
  maintenanceMode:false,
  message:'Estamos realizando melhorias para deixar sua experiência ainda melhor.',
  updatedAt:null,
};

export async function loadPlatformMaintenance():Promise<PlatformMaintenanceSettings>{
  if(!supabase)return FALLBACK;
  const {data,error}=await supabase.from('platform_settings').select('maintenance_mode,maintenance_message,updated_at').eq('id','global').maybeSingle();
  if(error||!data)return FALLBACK;
  return {
    maintenanceMode:Boolean(data.maintenance_mode),
    message:String(data.maintenance_message||FALLBACK.message),
    updatedAt:data.updated_at?String(data.updated_at):null,
  };
}

export async function setPlatformMaintenance(enabled:boolean,message?:string){
  if(!supabase)return{error:'Banco não configurado.'};
  const profile=await loadSessionProfile(true);
  if(!profile?.isAdmin)return{error:'Somente administradores podem alterar o modo manutenção.'};
  const nextMessage=(message||FALLBACK.message).trim();
  const {error}=await supabase.from('platform_settings').update({
    maintenance_mode:enabled,
    maintenance_message:nextMessage,
    updated_at:new Date().toISOString(),
    updated_by:profile.userId,
  }).eq('id','global');
  if(!error&&typeof window!=='undefined')window.dispatchEvent(new Event('pc:maintenance-changed'));
  return{error:error?.message??null};
}
