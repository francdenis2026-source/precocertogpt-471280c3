import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { loadActiveCampaigns, type PlatformCampaign } from "../lib/campaigns";
import "./FestivalAcaiBar.css";

const DISMISS_CHANNEL = "pc:campaign-dismiss";
const DISMISS_EVENT_KEY = "pc:campaign-dismiss-event";
type DismissEvent = { type: "dismiss"; campaignId: string };

// O nome é mantido para compatibilidade. O conteúdo agora vem do gestor de
// campanhas e, quando fechado, reaparece na próxima abertura ou atualização.
export function FestivalAcaiBar() {
  const [campaign, setCampaign] = useState<PlatformCampaign|null>(null);
  const [hidden, setHidden] = useState(false);
  const dismissChannel = useRef<BroadcastChannel|null>(null);

  useEffect(() => {
    let mounted=true;
    const refresh=()=>{setHidden(false);void loadActiveCampaigns().then(rows=>{if(mounted)setCampaign(rows[0]||null)})};
    refresh();window.addEventListener('pc:campaigns-changed',refresh);
    return()=>{mounted=false;window.removeEventListener('pc:campaigns-changed',refresh)};
  }, []);

  useEffect(() => {
    const dismiss = (event: DismissEvent) => {
      if (event.type === "dismiss" && event.campaignId === campaign?.id) setHidden(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== DISMISS_EVENT_KEY || !event.newValue) return;
      try { dismiss(JSON.parse(event.newValue) as DismissEvent); } catch { /* evento inválido */ }
    };

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(DISMISS_CHANNEL);
      channel.onmessage = event => dismiss(event.data as DismissEvent);
      dismissChannel.current = channel;
      return () => { dismissChannel.current = null; channel.close(); };
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [campaign?.id]);

  const closeBanner = () => {
    if (!campaign) return;
    const event: DismissEvent = { type: "dismiss", campaignId: campaign.id };
    setHidden(true);
    if (dismissChannel.current) {
      dismissChannel.current.postMessage(event);
      return;
    }
    try {
      localStorage.setItem(DISMISS_EVENT_KEY, JSON.stringify(event));
      localStorage.removeItem(DISMISS_EVENT_KEY);
    } catch { /* sincronização opcional em navegadores restritivos */ }
  };

  if (!campaign || hidden) return null;
  const content=<>{campaign.imageUrl&&<img src={campaign.imageUrl} width="1024" height="62" alt="" aria-hidden="true"/>}<span><i><Megaphone aria-hidden="true"/></i><b><strong>{campaign.title}</strong>{campaign.subtitle&&<small>{campaign.subtitle}</small>}</b><em>{campaign.linkLabel}</em></span></>;
  const external=/^https?:\/\//i.test(campaign.linkUrl);
  return <div className={`pc-festival-bar theme-${campaign.theme} kind-${campaign.kind}`} role="region" aria-label={campaign.title}>
    {external?<a className="pc-festival-bar__art" href={campaign.linkUrl} target="_blank" rel="noreferrer">{content}</a>:<Link className="pc-festival-bar__art" to={campaign.linkUrl||'/buscar'}>{content}</Link>}
    {campaign.isDismissible&&<button type="button" className="pc-festival-bar__close" onClick={closeBanner} aria-label="Fechar banner"><X aria-hidden="true"/></button>}
  </div>;
}
