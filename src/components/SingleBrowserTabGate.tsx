import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MonitorCheck, RadioTower } from "lucide-react";
import "./SingleBrowserTabGate.css";

const LEASE_KEY = "precocerto:active-browser-tab:v1";
const TAB_KEY = "precocerto:browser-tab-id:v1";
const CHANNEL_NAME = "precocerto:single-browser-tab:v1";
const LEASE_DURATION = 7000;
const HEARTBEAT_INTERVAL = 2000;

type Lease = { tabId: string; expiresAt: number };
type TabStatus = "checking" | "active" | "blocked";

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
    <section className="pc-tab-gate__panel" role="alert" aria-labelledby="pc-tab-gate-title">
      <span className="pc-tab-gate__icon" aria-hidden="true"><RadioTower /></span>
      <p className="pc-tab-gate__eyebrow">PREÇOCERTO JÁ ESTÁ ABERTO</p>
      <h1 id="pc-tab-gate-title">Use uma aba por vez</h1>
      <p>Outra aba deste navegador está ativa. Isso evita áudio duplicado, compras conflitantes e alterações repetidas.</p>
      <button className="pc-tab-gate__action" type="button" onClick={() => takeoverRef.current()}>
        <MonitorCheck aria-hidden="true" /> Usar o PreçoCerto nesta aba
      </button>
      <small>A outra aba será pausada e bloqueada automaticamente.</small>
    </section>
  </main>;
}

