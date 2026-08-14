import { useEffect, useState } from "react";
import { FlaskConical, Store } from "lucide-react";
import { useLocation } from "react-router-dom";
import { loadMerchantMemberships, setActiveMerchantId } from "../lib/merchantPlatform";

export function MerchantDemoSwitcher(){
  const location=useLocation();
  const [items,setItems]=useState<any[]>([]);
  const [active,setActive]=useState("");
  const merchantArea=location.pathname.startsWith("/painel-lojista");
  useEffect(()=>{if(!merchantArea)return;void(async()=>{const rows=await loadMerchantMemberships();setItems(rows);const saved=localStorage.getItem("pc:active_merchant_id")||rows[0]?.merchant_id||"";setActive(saved)})()},[merchantArea,location.pathname]);
  if(!merchantArea||items.length<2)return null;
  const demos=items.filter(row=>row.merchants?.service_settings?.demo_mode);
  if(!demos.length)return null;
  return <aside style={s.wrap} aria-label="Selecionar estabelecimento de demonstração">
    <span style={s.badge}><FlaskConical size={13}/> AMBIENTE DEMO</span>
    <Store size={16}/>
    <select value={active} onChange={e=>{const id=e.target.value;setActive(id);setActiveMerchantId(id);window.location.reload()}} style={s.select}>
      {demos.map(row=><option key={row.merchant_id} value={row.merchant_id}>{row.merchants?.name} · {row.merchants?.business_type}</option>)}
    </select>
  </aside>;
}
const s:Record<string,React.CSSProperties>={wrap:{position:"fixed",left:18,bottom:18,zIndex:1200,display:"flex",alignItems:"center",gap:8,padding:"9px 11px",border:"1px solid var(--pc-color-border)",borderRadius:14,background:"rgba(255,255,255,.96)",boxShadow:"0 14px 36px rgba(15,50,32,.14)",backdropFilter:"blur(10px)",fontFamily:"Manrope Variable", Manrope, system-ui, sans-serif"},badge:{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 7px",borderRadius:8,background:"var(--pc-color-background)",color:"var(--pc-color-accent)",fontSize:9,fontWeight:900,letterSpacing:".08em"},select:{maxWidth:280,border:0,outline:0,background:"transparent",color:"var(--pc-color-foreground)",fontWeight:800,fontSize:12,cursor:"pointer"}};