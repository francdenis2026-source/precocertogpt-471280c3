import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Play, Radio, Video } from "lucide-react";
import { useLocation } from "react-router-dom";

const CHANNEL="https://www.youtube.com/@Fremixprodu%C3%A7%C3%B5es";
const VIDEOS=[
  "xf9JHTA4E0M",
  "eCINkrCpKR0",
  "QqdUrW6Xi5M",
  "HlCiUaVTWi0",
  "xpz3sAuDdbI",
  "QBh7W_jOUnU",
  "BFr6XhMbHVM",
  "3N4D17FQHyM",
  "7D1bNJsIfmI",
  "Vq8a_94v61s",
];

export function FremixCuratedVideos(){
  const {pathname}=useLocation();
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [active,setActive]=useState(VIDEOS[0]);
  const activeIndex=useMemo(()=>VIDEOS.indexOf(active)+1,[active]);

  useEffect(()=>{
    const isFremix=pathname==="/cultura/fremix-producoes"||pathname==="/fremix-producoes";
    if(!isFremix){setHost(null);return;}
    let own:HTMLElement|null=null;
    const install=()=>{
      const generic=document.getElementById("amostras");
      if(!generic)return false;
      generic.style.display="none";
      const existing=document.getElementById("pc-fremix-curated-videos") as HTMLElement|null;
      if(existing){setHost(existing);return true;}
      own=document.createElement("div");
      own.id="pc-fremix-curated-videos";
      generic.after(own);
      setHost(own);
      return true;
    };
    if(!install()){
      const timer=window.setInterval(()=>{if(install())window.clearInterval(timer)},120);
      window.setTimeout(()=>window.clearInterval(timer),4500);
    }
    return()=>{
      const generic=document.getElementById("amostras");
      if(generic)generic.style.display="";
      own?.remove();
    };
  },[pathname]);

  if(!host)return null;
  return createPortal(
    <section id="amostras-fremix" style={s.dark}>
      <style>{`.fm-curated-card{transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.fm-curated-card:hover{transform:translateY(-3px);border-color:rgba(244,114,182,.55)!important;box-shadow:0 16px 40px rgba(0,0,0,.24)}.fm-curated-card:focus-visible{outline:3px solid var(--pc-color-primary);outline-offset:3px}@media(max-width:900px){.fm-curated-layout{grid-template-columns:1fr!important}.fm-curated-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:560px){.fm-curated-grid{grid-template-columns:1fr!important}.fm-curated-shell{padding-left:16px!important;padding-right:16px!important}.fm-curated-player{min-height:230px!important}.fm-curated-heading{align-items:flex-start!important;flex-direction:column!important}}`}</style>
      <div className="fm-curated-shell" style={s.shell}>
        <div className="fm-curated-heading" style={s.heading}>
          <div>
            <span style={s.eyebrow}><Radio size={13}/> SELEÇÃO FREMIX</span>
            <h2 style={s.title}>Assista às produções escolhidas para esta vitrine.</h2>
            <p style={s.lead}>Uma seleção com 10 vídeos indicados diretamente para o espaço da FreMix no PreçoCerto. Escolha uma capa para trocar o player principal sem sair da página.</p>
          </div>
          <a href={`${CHANNEL}/videos`} target="_blank" rel="noreferrer" style={s.all}>Canal completo <ExternalLink size={16}/></a>
        </div>

        <div className="fm-curated-layout" style={s.layout}>
          <div>
            <div className="fm-curated-player" style={s.player}>
              <iframe
                key={active}
                src={`https://www.youtube-nocookie.com/embed/${active}?rel=0&modestbranding=1`}
                title={`FreMix Produções - vídeo selecionado ${activeIndex}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                style={s.iframe}
              />
            </div>
            <div style={s.playerMeta}>
              <span><Video size={15}/> Vídeo {String(activeIndex).padStart(2,"0")} de {VIDEOS.length}</span>
              <a href={`https://www.youtube.com/watch?v=${active}`} target="_blank" rel="noreferrer">Abrir no YouTube <ExternalLink size={14}/></a>
            </div>
          </div>

          <div className="fm-curated-grid" style={s.grid}>
            {VIDEOS.map((id,index)=>{
              const selected=id===active;
              return <button key={id} type="button" className="fm-curated-card" onClick={()=>setActive(id)} style={{...s.card,...(selected?s.cardActive:{})}} aria-pressed={selected}>
                <div style={s.thumbWrap}>
                  <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={`Amostra ${index+1} do canal FreMix Produções`} loading="lazy" style={s.thumb}/>
                  <span style={s.play}><Play size={18} fill="currentColor"/></span>
                  <small style={s.number}>{String(index+1).padStart(2,"0")}</small>
                </div>
                <span style={s.cardText}>{selected?"Reproduzindo agora":"Assistir nesta página"}</span>
              </button>
            })}
          </div>
        </div>

        <div style={s.note}><strong>Conteúdo oficial externo.</strong><span>Os vídeos permanecem hospedados no YouTube. Créditos, descrição, autoria e informações completas devem ser consultados no canal oficial da FreMix Produções.</span></div>
      </div>
    </section>,host
  );
}

const s:Record<string,React.CSSProperties>={
  dark:{background:"linear-gradient(180deg,var(--pc-color-foreground),var(--pc-color-foreground) 60%,var(--pc-color-foreground))",color:"white"},
  shell:{maxWidth:1240,margin:"0 auto",padding:"78px 24px"},
  heading:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:28,marginBottom:24},
  eyebrow:{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,fontWeight:950,letterSpacing:".14em",color:"color-mix(in srgb, var(--pc-color-primary) 9%, var(--pc-color-surface))"},
  title:{fontFamily:"Georgia,serif",fontSize:"clamp(2.2rem,4.5vw,4rem)",lineHeight:1.02,letterSpacing:"-.045em",maxWidth:820,margin:"9px 0 12px"},
  lead:{maxWidth:780,color:"var(--pc-color-muted)",fontSize:13,lineHeight:1.7,margin:0},
  all:{display:"inline-flex",alignItems:"center",gap:6,padding:"11px 13px",borderRadius:10,border:"1px solid rgba(255,255,255,.14)",color:"white",textDecoration:"none",fontSize:12,fontWeight:850,whiteSpace:"nowrap"},
  layout:{display:"grid",gridTemplateColumns:"minmax(0,1.42fr) minmax(330px,.58fr)",gap:16,alignItems:"start"},
  player:{aspectRatio:"16/9",minHeight:360,borderRadius:19,overflow:"hidden",background:"var(--pc-color-foreground)",border:"1px solid rgba(255,255,255,.1)",boxShadow:"0 30px 75px rgba(0,0,0,.33)"},
  iframe:{width:"100%",height:"100%",border:0,display:"block"},
  playerMeta:{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",padding:"12px 3px",color:"var(--pc-color-muted)",fontSize:11},
  grid:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8},
  card:{padding:0,border:"1px solid rgba(255,255,255,.09)",borderRadius:12,overflow:"hidden",background:"rgba(255,255,255,.045)",color:"white",cursor:"pointer",textAlign:"left"},
  cardActive:{borderColor:"var(--pc-color-primary)",background:"rgba(244,114,182,.09)"},
  thumbWrap:{position:"relative",aspectRatio:"16/9",overflow:"hidden",background:"var(--pc-color-foreground)"},
  thumb:{width:"100%",height:"100%",objectFit:"cover",display:"block"},
  play:{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:38,height:38,borderRadius:"50%",display:"grid",placeItems:"center",background:"rgba(255,23,95,.94)",color:"white",boxShadow:"0 8px 24px rgba(0,0,0,.3)"},
  number:{position:"absolute",left:7,top:7,padding:"4px 6px",borderRadius:6,background:"rgba(9,6,12,.75)",color:"var(--pc-color-muted)",fontWeight:900,fontSize:9},
  cardText:{display:"block",padding:"9px 10px",fontSize:10,fontWeight:800,color:"var(--pc-color-muted)"},
  note:{display:"flex",gap:8,flexWrap:"wrap",marginTop:18,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.09)",fontSize:10,color:"var(--pc-color-muted)"},
};