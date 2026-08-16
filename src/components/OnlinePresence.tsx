import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { supabase } from "../lib/supabase";

const DEVICE_KEY = "precocerto:presence-device";
const CHANNEL_NAME = "precocerto:online-devices:v1";
const COORDINATION_NAME = "precocerto:presence-coordination:v1";

function getDeviceId() {
  const stored = localStorage.getItem(DEVICE_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function OnlinePresence() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase || typeof BroadcastChannel === "undefined") return;

    const deviceId = getDeviceId();
    const coordinator = new BroadcastChannel(COORDINATION_NAME);
    let active = true;
    let leader = false;
    let releaseLeadership: (() => void) | undefined;
    let realtimeCleanup: (() => Promise<void>) | undefined;

    const publish = (value: number) => {
      if (!active) return;
      setCount(value);
      coordinator.postMessage({ type: "count", value });
    };

    coordinator.onmessage = event => {
      if (event.data?.type === "count" && Number.isInteger(event.data.value)) {
        setCount(Math.max(0, event.data.value));
      }
      if (leader && event.data?.type === "request-count" && count !== null) {
        coordinator.postMessage({ type: "count", value: count });
      }
    };

    const startRealtime = async () => {
      const channel = supabase.channel(CHANNEL_NAME, { config: { presence: { key: deviceId } } });
      const syncCount = () => publish(Object.keys(channel.presenceState()).length);

      channel.on("presence", { event: "sync" }, syncCount);
      channel.subscribe(async status => {
        if (status === "SUBSCRIBED") {
          await channel.track({ deviceId, onlineAt: new Date().toISOString() });
          syncCount();
        }
      });

      realtimeCleanup = async () => {
        await channel.untrack();
        await supabase.removeChannel(channel);
      };
    };

    const tryLeadership = () => {
      if (!active || leader) return;
      const locks = navigator.locks;
      if (!locks) return;

      void locks.request(CHANNEL_NAME, { ifAvailable: true }, async lock => {
        if (!lock || !active) {
          coordinator.postMessage({ type: "request-count" });
          return;
        }
        leader = true;
        await startRealtime();
        await new Promise<void>(resolve => { releaseLeadership = resolve; });
      });
    };

    tryLeadership();
    const retry = window.setInterval(tryLeadership, 7000);
    coordinator.postMessage({ type: "request-count" });

    return () => {
      active = false;
      window.clearInterval(retry);
      coordinator.close();
      void realtimeCleanup?.();
      releaseLeadership?.();
    };
  }, []);

  return <div className={`ref-online${count === null ? " is-connecting" : ""}`} role="status" aria-live="polite" aria-label={count === null ? "Conectando ao contador de usuários" : `${count} ${count === 1 ? "pessoa online" : "pessoas online"}`}>
    <span className="ref-online__signal"><Wifi aria-hidden="true" /></span>
    <strong>{count ?? "—"}</strong>
    <span className="ref-online__label">{count === 1 ? "pessoa online" : "pessoas online"}</span>
  </div>;
}
