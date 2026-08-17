import { useEffect,useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Construction, Eye, RefreshCw, ShieldCheck, Wrench, X } from 'lucide-react';
import { loadSessionProfile } from '../lib/roles';
import { loadPlatformMaintenance,setPlatformMaintenance,type PlatformMaintenanceSettings } from '../lib/platformMaintenance';
import './PlatformMaintenance.css';

const initial:PlatformMaintenanceSettings={maintenanceMode:false,message:'Estamos realizando melhorias para deixar sua experiência ainda melhor.',updatedAt:null};

export function PlatformMaintenanceGate({children}:{children:React.ReactNode}){
  const location=useLocation();
  const [settings,setSettings]=useState<PlatformMaintenanceSettings|null>(null);
  const refresh=()=>void loadPlatformMaintenance().then(setSettings);
  useEffect(()=>{
    refresh();
    const id=window.setInterval(refresh,30000);
    const onVisible=()=>{if(document.visibilityState==='visible')refresh()};
    window.addEventListener('pc:maintenance-changed',refresh);
    document.addEventListener('visibilitychange',onVisible);
    return()=>{window.clearInterval(id);window.removeEventListener('pc:maintenance-changed',refresh);document.removeEventListener('visibilitychange',onVisible)};
  },[]);
  const bypass=location.pathname.startsWith('/admin')||location.pathname==='/login';
  if(settings?.maintenanceMode&&!bypass)return <MaintenanceScreen settings={settings}/>;
  return <>{children}</>;
}

function MaintenanceScreen({settings}:{settings:PlatformMaintenanceSettings}){
  return <main className="pc-maintenance" id="conteudo-principal">
    <section className="pc-maintenance__visual" aria-hidden="true"><div className="pc-maintenance__visual-shade"/><div className="pc-maintenance__floating-card pc-maintenance__floating-card--one"><CheckCircle2/><span><small>PreçoCerto</small><strong>Melhorias em andamento</strong></span></div><div className="pc-maintenance__floating-card pc-maintenance__floating-card--two"><Wrench/><span><small>Plataforma local</small><strong>Voltamos em breve</strong></span></div></section>
    <section className="pc-maintenance__content"><img src="/logo-preco-certo.svg" alt="PreçoCerto"/><span className="pc-maintenance__eyebrow"><Construction/> MANUTENÇÃO PROGRAMADA</span><h1>Estamos deixando o PreçoCerto ainda melhor.</h1><p>{settings.message}</p><div className="pc-maintenance__status"><i/><span><strong>Serviço temporariamente indisponível</strong><small>Catálogos, comparação de preços e ferramentas voltarão assim que a atualização terminar.</small></span></div><div className="pc-maintenance__trust"><ShieldCheck/><span>Seus dados e cadastros permanecem preservados durante a manutenção.</span></div></section>
  </main>;
}

export function AdminMaintenanceControl(){
  const location=useLocation();
  const [mount,setMount]=useState<Element|null>(null);
  const [open,setOpen]=useState(false);
  const [settings,setSettings]=useState(initial);
  const [authorized,setAuthorized]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState(initial.message);
  const refresh=async()=>{const [profile,next]=await Promise.all([loadSessionProfile(),loadPlatformMaintenance()]);setAuthorized(Boolean(profile?.isAdmin));setSettings(next);setMessage(next.message)};
  useEffect(()=>{if(!location.pathname.startsWith('/admin')){setMount(null);return;}const find=()=>setMount(document.querySelector('.acc-top-actions'));find();const id=window.setInterval(find,500);void refresh();return()=>window.clearInterval(id)},[location.pathname]);
  const toggle=async()=>{const enabling=!settings.maintenanceMode;if(enabling&&!window.confirm('Ativar o modo manutenção agora? Visitantes verão a tela de manutenção até você desativar.'))return;setBusy(true);setError('');const result=await setPlatformMaintenance(enabling,message);setBusy(false);if(result.error){setError(result.error);return;}await refresh();};
  if(!mount||!authorized)return null;
  return createPortal(<><button type="button" className={`acc-maintenance-trigger${settings.maintenanceMode?' is-active':''}`} onClick={()=>setOpen(true)}><Construction/><span>{settings.maintenanceMode?'Manutenção ativa':'Modo manutenção'}</span></button>{open&&<div className="acc-maintenance-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className="acc-maintenance-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-title"><button className="acc-maintenance-close" onClick={()=>setOpen(false)} aria-label="Fechar"><X/></button><div className="acc-maintenance-preview"><img src="/hero-feijo-real-shopper-2026.webp" alt="Prévia visual do modo manutenção"/><div><span><Wrench/> PREÇO CERTO</span><strong>Site em manutenção</strong><small>Experiência pública temporariamente substituída por uma tela profissional.</small></div></div><div className="acc-maintenance-copy"><span className={settings.maintenanceMode?'is-on':'is-off'}><i/>{settings.maintenanceMode?'MODO MANUTENÇÃO ATIVO':'SITE OPERANDO NORMALMENTE'}</span><h2 id="maintenance-title">Controle de disponibilidade</h2><p>Use este recurso quando precisar atualizar catálogos, preços, páginas ou configurações sem expor uma experiência incompleta aos visitantes.</p><label>Mensagem exibida ao público<textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={220}/></label>{error&&<div className="acc-maintenance-error"><AlertTriangle/>{error}</div>}<div className="acc-maintenance-actions"><button className={settings.maintenanceMode?'restore':'activate'} onClick={()=>void toggle()} disabled={busy}>{busy?<RefreshCw className="spin"/>:settings.maintenanceMode?<CheckCircle2/>:<Construction/>}{settings.maintenanceMode?'Reabrir site ao público':'Ativar modo manutenção'}</button><button className="secondary" onClick={()=>setOpen(false)}>Cancelar</button></div><small className="acc-maintenance-note"><Eye/> As rotas administrativas e a tela de login continuam acessíveis durante a manutenção.</small></div></section></div>}</>,mount);
}
