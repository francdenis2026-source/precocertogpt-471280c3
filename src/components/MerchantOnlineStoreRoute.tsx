import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, Store } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { MerchantStorefront } from "./MerchantStorefront";

type Availability = {
  merchant_id:string;
  establishment_name:string;
  service_live:boolean;
  sales_message:string;
};

export function MerchantOnlineStoreRoute(){
  const {merchantId=""}=useParams();
  const [row,setRow]=useState<Availability|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{void(async()=>{
    setLoading(true);
    if(!supabase){setLoading(false);return;}
    const {data}=await supabase.rpc("marketplace_public_availability");
    const match=(data??[]).find((item:any)=>String(item.merchant_id)===String(merchantId));
    setRow(match??null);
    setLoading(false);
  })()},[merchantId]);

  if(loading)return <main style={s.center}><Clock3 size={24}/><strong>Verificando disponibilidade da loja…</strong></main>;
  if(row?.service_live)return <MerchantStorefront/>;

  return <main style={s.page}>
    <a href="/" style={s.back}><ArrowLeft size={16}/> Voltar ao Preço Certo</a>
    <section style={s.card}>
      <div style={s.visual}><img src="/online-sales-coming-soon.svg" alt="Venda online em preparação" style={s.image}/></div>
      <div style={s.content}>
        <span style={s.kicker}><Clock3 size={15}/> VENDA ONLINE EM PREPARAÇÃO</span>
        <h1 style={s.h1}>{row?.establishment_name||"Este estabelecimento"} ainda não está recebendo pedidos online</h1>
        <p style={s.lead}>{row?.sales_message||"Este estabelecimento ainda não oferece vendas online pelo Preço Certo. Você pode consultar e comparar os preços normalmente."}</p>
        <div style={s.points}><span><CheckCircle2 size={17}/> Os preços continuam disponíveis na comparação</span><span><LockKeyhole size={17}/> A compra será liberada somente quando a operação estiver pronta</span></div>
        <div style={s.actions}><a href="/estabelecimentos" style={s.primary}><Store size={17}/> Ver estabelecimentos</a><a href="/" style={s.secondary}>Continuar comparando preços</a></div>
      </div>
    </section>
  </main>;
}

const s:Record<string,React.CSSProperties>={
  page:{minHeight:"100vh",background:"var(--pc-color-background)",padding:"28px 18px 70px",fontFamily:""Manrope Variable",Manrope,system-ui,sans-serif",color:"var(--pc-color-foreground)"},center:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:""Manrope Variable",Manrope,system-ui,sans-serif",color:"var(--pc-color-muted)"},back:{maxWidth:1120,margin:"0 auto 22px",display:"flex",alignItems:"center",gap:7,color:"var(--pc-color-muted)",fontWeight:750,textDecoration:"none"},card:{maxWidth:1120,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(300px,42%) 1fr",alignItems:"center",gap:"clamp(24px,5vw,58px)",background:"white",border:"1px solid var(--pc-color-border)",borderRadius:28,padding:"clamp(22px,5vw,52px)",boxShadow:"0 22px 60px rgba(18,47,32,.07)"},visual:{display:"flex",justifyContent:"center",alignItems:"center"},image:{width:"100%",maxWidth:430,height:"auto"},content:{minWidth:0},kicker:{display:"inline-flex",alignItems:"center",gap:7,color:"var(--pc-color-primary)",fontSize:11,fontWeight:900,letterSpacing:".12em"},h1:{fontSize:"clamp(30px,4vw,48px)",lineHeight:1.04,letterSpacing:"-.045em",margin:"12px 0 14px"},lead:{color:"var(--pc-color-muted)",fontSize:15,lineHeight:1.7,maxWidth:650},points:{display:"grid",gap:9,margin:"20px 0",color:"var(--pc-color-muted)",fontSize:13,fontWeight:700},actions:{display:"flex",gap:9,flexWrap:"wrap",marginTop:22},primary:{display:"inline-flex",alignItems:"center",gap:7,padding:"12px 16px",borderRadius:12,background:"var(--pc-color-primary-hover)",color:"white",fontWeight:850,textDecoration:"none"},secondary:{display:"inline-flex",alignItems:"center",padding:"12px 16px",borderRadius:12,border:"1px solid var(--pc-color-border)",color:"var(--pc-color-foreground)",fontWeight:800,textDecoration:"none",background:"white"}
};
