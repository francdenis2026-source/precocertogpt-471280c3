import { useEffect, useMemo, useState } from "react";
import { Save, ShoppingBasket, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveActiveBasketDraft, type BasketItemConfig } from "../lib/smartBasket";

const ACTIVE_ITEMS_KEY = "precocerto:active_basket_items";
const LEGACY_CART_KEY = "precocerto:basket";
const PENDING_SAVE_KEY = "pc:pending_save_basket";
const RETURN_KEY = "pc:return_after_auth";
const GUEST_DRAFT_KEY = "pc:guest_basket_draft";
const RELOAD_CLEARED_KEY = "pc:guest_reload_cleared";

function readItems(): BasketItemConfig[] {
  try {
    const value = localStorage.getItem(ACTIVE_ITEMS_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function basketCount() {
  const smartItems = readItems().reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0);
  if (smartItems > 0) return smartItems;
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || "[]");
    return Array.isArray(legacy) ? legacy.length : 0;
  } catch {
    return 0;
  }
}

function currentReturnUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function BasketSessionFlow() {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [restored, setRestored] = useState(false);

  const authPage = location.pathname === "/login" || location.pathname === "/cadastro";
  const basketPage = location.pathname === "/cesta" || location.pathname === "/cesta-basica";

  useEffect(() => {
    let alive = true;

    async function finishPendingBasket(user: { id: string }) {
      if (localStorage.getItem(PENDING_SAVE_KEY) !== "true") return;
      let items = readItems();
      if (!items.length) {
        try {
          const pending = JSON.parse(localStorage.getItem(GUEST_DRAFT_KEY) || "[]");
          if (Array.isArray(pending)) items = pending;
        } catch { /* ignore malformed guest draft */ }
      }

      if (items.length) {
        try {
          await saveActiveBasketDraft(user.id, items);
          localStorage.setItem(ACTIVE_ITEMS_KEY, JSON.stringify(items));
          setRestored(true);
        } catch (error) {
          console.error("Falha ao preservar a cesta após autenticação:", error);
        }
      }

      localStorage.removeItem(PENDING_SAVE_KEY);
      localStorage.removeItem(GUEST_DRAFT_KEY);
    }

    async function resolveSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      const user = data.session?.user ?? null;
      setUserId(user?.id ?? null);

      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const isReload = navigation?.type === "reload";
      if (!user && isReload && sessionStorage.getItem(RELOAD_CLEARED_KEY) !== "1" && !authPage) {
        sessionStorage.setItem(RELOAD_CLEARED_KEY, "1");
        localStorage.removeItem(ACTIVE_ITEMS_KEY);
        localStorage.removeItem(LEGACY_CART_KEY);
        window.location.reload();
        return;
      }
      if (!isReload) sessionStorage.removeItem(RELOAD_CLEARED_KEY);

      if (user) {
        await finishPendingBasket(user);
        if (location.pathname === "/login" || location.pathname === "/cadastro") {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect") || localStorage.getItem(RETURN_KEY) || "/";
          localStorage.removeItem(RETURN_KEY);
          window.location.replace(redirect.startsWith("/") ? redirect : "/");
        }
      }
    }

    void resolveSession();
    if (!supabase) return () => { alive = false; };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUserId(user?.id ?? null);
      if (user) {
        window.setTimeout(async () => {
          await finishPendingBasket(user);
          if (window.location.pathname === "/login" || window.location.pathname === "/cadastro") {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect") || localStorage.getItem(RETURN_KEY) || "/";
            localStorage.removeItem(RETURN_KEY);
            window.location.replace(redirect.startsWith("/") ? redirect : "/");
          }
        }, 0);
      }
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [authPage, location.pathname]);

  useEffect(() => {
    const update = () => setCount(basketCount());
    update();
    const timer = window.setInterval(update, 900);
    window.addEventListener("storage", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", update);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!basketPage) return;
    const capture = (event: MouseEvent) => {
      if (userId) return;
      const element = (event.target as HTMLElement | null)?.closest("button,a") as HTMLElement | null;
      if (!element) return;
      const text = (element.textContent || "").toLowerCase();
      const saveIntent = text.includes("salvar") && (text.includes("lista") || text.includes("cesta") || text.includes("compartilhar"));
      if (!saveIntent) return;

      event.preventDefault();
      event.stopPropagation();
      const draft = readItems();
      localStorage.setItem(PENDING_SAVE_KEY, "true");
      localStorage.setItem(RETURN_KEY, currentReturnUrl());
      localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft));
      const redirect = encodeURIComponent(currentReturnUrl());
      window.location.assign(`/login?redirect=${redirect}`);
    };
    document.addEventListener("click", capture, true);
    return () => document.removeEventListener("click", capture, true);
  }, [basketPage, userId]);

  useEffect(() => {
    setDismissed(false);
  }, [count, userId]);

  const message = useMemo(() => {
    if (!count) return "";
    if (!userId) return `Você tem ${count} ${count === 1 ? "item" : "itens"} na sua lista temporária. Entre para salvar antes de sair.`;
    if (restored) return "Sua lista foi preservada e sincronizada após o login. Salve uma versão para guardar este planejamento.";
    return `Sua cesta com ${count} ${count === 1 ? "item" : "itens"} está sincronizada. Salve uma lista para guardar esta versão.`;
  }, [count, restored, userId]);

  if (!count || authPage || dismissed) return null;

  const action = () => {
    if (!userId) {
      const draft = readItems();
      localStorage.setItem(PENDING_SAVE_KEY, "true");
      localStorage.setItem(RETURN_KEY, currentReturnUrl());
      localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft));
      window.location.assign(`/login?redirect=${encodeURIComponent(currentReturnUrl())}`);
      return;
    }
    window.location.assign("/cesta-basica");
  };

  return (
    <aside style={styles.wrap} role="status" aria-live="polite">
      <div style={styles.icon}><ShoppingBasket size={18} /></div>
      <div style={styles.copy}>
        <strong style={styles.title}>{userId ? "Sua lista está protegida" : "Não perca sua lista"}</strong>
        <span style={styles.text}>{message}</span>
      </div>
      <button type="button" onClick={action} style={styles.action}>
        <Save size={15} /> {userId ? "Salvar lista" : "Entrar e salvar"}
      </button>
      <button type="button" onClick={() => setDismissed(true)} style={styles.close} aria-label="Fechar lembrete"><X size={16} /></button>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: "fixed", right: 18, bottom: 18, zIndex: 99990, width: "min(520px, calc(100vw - 32px))", display: "grid", gridTemplateColumns: "42px minmax(0,1fr) auto 30px", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, border: "1px solid rgba(15,118,110,.22)", background: "rgba(255,255,255,.97)", color: "var(--pc-color-foreground)", boxShadow: "0 18px 52px rgba(15,23,42,.18)", backdropFilter: "blur(12px)" },
  icon: { width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--pc-color-background)", color: "var(--pc-color-primary)" },
  copy: { minWidth: 0, display: "grid", gap: 2 },
  title: { fontSize: 13.5 },
  text: { fontSize: 11.5, lineHeight: 1.4, color: "var(--pc-color-muted)" },
  action: { minHeight: 38, border: 0, borderRadius: 10, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, background: "var(--pc-color-foreground)", color: "white", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },
  close: { width: 30, height: 30, border: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "transparent", color: "var(--pc-color-muted)", cursor: "pointer" }
};
