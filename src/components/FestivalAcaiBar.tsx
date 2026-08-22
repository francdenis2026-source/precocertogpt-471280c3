import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { loadActiveCampaigns, type PlatformCampaign } from "../lib/campaigns";
import "./FestivalAcaiBar.css";

// O nome é mantido para compatibilidade. O conteúdo agora vem do gestor de
// campanhas e, quando fechado, reaparece na próxima abertura ou atualização.
export function FestivalAcaiBar() {
  const [campaign, setCampaign] = useState<PlatformCampaign|null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let mounted=true;
    const refresh=()=>{setHidden(false);void loadActiveCampaigns().then(rows=>{if(mounted)setCampaign(rows[0]||null)})};
    refresh();window.addEventListener('pc:campaigns-changed',refresh);
    return()=>{mounted=false;window.removeEventListener('pc:campaigns-changed',refresh)};
  }, []);

  if (!campaign || hidden) return null;
  const content=<>{campaign.imageUrl&&<img src={campaign.imageUrl} width="1024" height="62" alt="" aria-hidden="true"/>}<span><i><Megaphone aria-hidden="true"/></i><b><strong>{campaign.title}</strong>{campaign.subtitle&&<small>{campaign.subtitle}</small>}</b><em>{campaign.linkLabel}</em></span></>;
  const external=/^https?:\/\//i.test(campaign.linkUrl);
  return <div className={`pc-festival-bar theme-${campaign.theme} kind-${campaign.kind}`} role="region" aria-label={campaign.title}>
    {external?<a className="pc-festival-bar__art" href={campaign.linkUrl} target="_blank" rel="noreferrer">{content}</a>:<Link className="pc-festival-bar__art" to={campaign.linkUrl||'/buscar'}>{content}</Link>}
    {campaign.isDismissible&&<button type="button" className="pc-festival-bar__close" onClick={()=>setHidden(true)} aria-label="Fechar banner"><X aria-hidden="true"/></button>}
  </div>;
}
