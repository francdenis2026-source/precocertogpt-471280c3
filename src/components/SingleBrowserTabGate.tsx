import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, LockKeyhole, MonitorCheck, ShieldCheck } from "lucide-react";
import "./SingleBrowserTabGate.css";
import "./SingleBrowserTabGatePro.css";

const LEASE_KEY = "precocerto:active-browser-tab:v1";
const TAB_KEY = "precocerto:browser-tab-id:v1";
const CHANNEL_NAME = "precocerto:single-browser-tab:v1";
const LEASE_DURATION = 7000;
const HEARTBEAT_INTERVAL = 2000;

type Lease = { tabId: string; expiresAt: number };
type TabStatus = "checking" | "active" | "blocked";

function SessionArtwork() {
  return <svg className="pc-tab-gate__artwork" viewBox="0 0 320 300" role="img" aria-labelledby="pc-session-art-title pc-session-art-description">
    <title id="pc-session-art-title">Sessão protegida do PreçoCerto</title>
    <desc id="pc-session-art-description">Dois dispositivos conectados com apenas uma sessão ativa e protegida.</desc>
    <defs>
      <linearGradient id="pc-session-screen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#183755"/><stop offset="1" stopColor="#0c2238"/></linearGradient>
      <linearGradient id="pc-session-accent" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#62e5ad"/><stop offset="1" stopColor="#23b784"/></linearGradient>
      <filter id="pc-session-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#020b14" floodOpacity=".34"/></filter>
    </defs>
    <circle cx="160" cy="142" r="118" fill="#112d48" opacity=".62"/>
    <circle cx="160" cy="142" r="91" fill="none" stroke="#55dca6" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="5 7"/>
    <path d="M61 224c34-32 64-43 96-34 40 11 60 5 101-30" fill="none" stroke="#5de0ab" strokeOpacity=".2" strokeWidth="2" strokeDasharray="3 8"/>
    <g filter="url(#pc-session-shadow)">
      <rect x="68" y="76" width="184" height="120" rx="15" fill="url(#pc-session-screen)" stroke="#3c6688"/>
      <rect x="81" y="89" width="158" height="92" rx="9" fill="#071a2b"/>
      <path d="M130 210h60M147 196l-5 14m31-14 5 14" stroke="#7291aa" strokeWidth="5" strokeLinecap="round"/>
    </g>
    <g transform="translate(113 101)">
      <path d="M47 0 82 13v25c0 25-14 42-35 51C26 80 12 63 12 38V13L47 0Z" fill="url(#pc-session-accent)"/>
      <path d="m33 44 9 9 20-23" fill="none" stroke="#06251d" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g transform="translate(226 183)">
      <rect width="54" height="84" rx="12" fill="#15334e" stroke="#4a708e"/>
      <rect x="7" y="9" width="40" height="60" rx="7" fill="#071a2b"/>
      <circle cx="27" cy="76" r="3" fill="#62e5ad"/>
    </g>
    <g transform="translate(38 48)"><circle cx="18" cy="18" r="18" fill="#153b51" stroke="#51dca5" strokeOpacity=".5"/><path d="M12 18h12m-6-6v12" stroke="#62e5ad" strokeWidth="2" strokeLinecap="round"/></g>
    <circle cx="274" cy="82" r="5" fill="#62e5ad"/><circle cx="52" cy="183" r="4" fill="#3c6e91"/>
  </svg>;
}

function readLease(): Lease | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEASE_KEY) || "null") as Partial<Lease> | null;
    return parsed && typeof parsed.tabId === "string" && typeof parsed.expiresAt === "number"
      ? { tabId: parsed.tabId, expiresAt: parsed.expiresAt }
      : null;
  } catch {
    return null;
  }
}

function createId() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getTabId() {
  const stored = window.sessionStorage.getItem(TAB_KEY);
  if (stored) return stored;
  const id = createId();
  window.sessionStorage.setItem(TAB_KEY, id);
  return id;
}

export function SingleBrowserTabGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TabStatus>("checking");
  const statusRef = useRef<TabStatus>("checking");
  const takeoverRef = useRef<() => void>(() => undefined);

  const updateStatus = useCallback((next: TabStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useEffect(() => {
    let tabId = getTabId();
    const instanceId = createId();
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);
    let disposed = false;

    const writeLease = () => {
      window.localStorage.setItem(LEASE_KEY, JSON.stringify({ tabId, expiresAt: Date.now() + LEASE_DURATION }));
    };

    const claimIfAvailable = (force = false) => {
      if (disposed) return;
      const lease = readLease();
      if (force || !lease || lease.expiresAt <= Date.now() || lease.tabId === tabId) {
        writeLease();
        const confirmed = readLease();
        if (confirmed?.tabId === tabId) {
          updateStatus("active");
          channel?.postMessage({ type: "claimed", tabId, instanceId });
          return;
        }
      }
      updateStatus("blocked");
    };

    takeoverRef.current = () => claimIfAvailable(true);

    channel?.addEventListener("message", event => {
      const message = event.data;
      if (!message || message.instanceId === instanceId) return;
      if (message.type === "probe" && message.tabId === tabId) {
        channel.postMessage({ type: "collision", target: message.instanceId, instanceId });
      }
      if (message.type === "collision" && message.target === instanceId) {
        tabId = createId();
        window.sessionStorage.setItem(TAB_KEY, tabId);
        claimIfAvailable();
      }
      if (message.type === "claimed" && message.tabId !== tabId) updateStatus("blocked");
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LEASE_KEY) return;
      const lease = readLease();
      updateStatus(lease?.tabId === tabId ? "active" : "blocked");
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") claimIfAvailable();
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    channel?.postMessage({ type: "probe", tabId, instanceId });

    const startup = window.setTimeout(() => claimIfAvailable(), 90);
    const heartbeat = window.setInterval(() => {
      if (statusRef.current === "active") writeLease();
      else claimIfAvailable();
    }, HEARTBEAT_INTERVAL);

    return () => {
      disposed = true;
      window.clearTimeout(startup);
      window.clearInterval(heartbeat);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      channel?.close();
    };
  }, [updateStatus]);

  if (status === "active") return children;

  if (status === "checking") {
    return <main className="pc-tab-gate pc-tab-gate--checking" aria-label="Verificando sessão do navegador" aria-busy="true" />;
  }

  return <main className="pc-tab-gate" id="conteudo-principal">
    <svg className="pc-tab-gate__backdrop" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><radialGradient id="pc-gate-glow"><stop stopColor="#1e9a76" stopOpacity=".24"/><stop offset="1" stopColor="#07111f" stopOpacity="0"/></radialGradient><pattern id="pc-gate-grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0v54" fill="none" stroke="#94b9d5" strokeOpacity=".055"/></pattern></defs>
      <rect width="1440" height="760" fill="url(#pc-gate-grid)"/><circle cx="230" cy="120" r="420" fill="url(#pc-gate-glow)"/><circle cx="1240" cy="680" r="500" fill="url(#pc-gate-glow)"/>
      <path d="M0 574C224 487 343 662 586 576s392-231 854-83" fill="none" stroke="#62e5ad" strokeOpacity=".08" strokeWidth="2"/>
    </svg>
    <section className="pc-tab-gate__panel" role="alert" aria-labelledby="pc-tab-gate-title">
      <div className="pc-tab-gate__visual"><SessionArtwork/><span><ShieldCheck aria-hidden="true"/> Sessão protegida</span></div>
      <div className="pc-tab-gate__content">
        <span className="pc-tab-gate__icon" aria-hidden="true"><LockKeyhole /></span>
        <p className="pc-tab-gate__eyebrow">ACESSO ATIVO EM OUTRA ABA</p>
        <h1 id="pc-tab-gate-title">Continue com segurança nesta aba.</h1>
        <p>O PreçoCerto mantém somente uma sessão ativa por navegador para proteger suas compras, preferências e reprodução de áudio.</p>
        <button className="pc-tab-gate__action" type="button" onClick={() => takeoverRef.current()}>
          <MonitorCheck aria-hidden="true" /> Continuar nesta aba <ArrowRight aria-hidden="true" />
        </button>
        <small><ShieldCheck aria-hidden="true"/> A outra aba será pausada automaticamente. Nenhum dado será perdido.</small>
      </div>
    </section>
  </main>;
}
