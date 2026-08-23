import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { requestAuthAction } from "../../lib/authActionPrompt";

type FavoriteContextValue = {
  favoriteIds: string[];
  userId: string | null;
  loading: boolean;
  isFavorite: (productId: string | number) => boolean;
  toggleFavorite: (productId: string | number, returnTo?: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
};

type PendingFavorite = { productId: string; returnTo: string; createdAt: number };
type ToggleFavoriteEvent = CustomEvent<{ productId: string | number; returnTo?: string }>;

const FavoritesContext = createContext<FavoriteContextValue | null>(null);
const PENDING_KEY = "pc:pending_favorite";
const COMPAT_KEY = "precocerto:favorites";

function userCacheKey(userId: string) {
  return `${COMPAT_KEY}:${userId}`;
}

function readCompatibility(userId: string): string[] {
  try {
    const raw = localStorage.getItem(userCacheKey(userId)) ?? localStorage.getItem(COMPAT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function readPending(): PendingFavorite | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) as PendingFavorite : null;
  } catch {
    return null;
  }
}

function saveCompatibility(ids: string[], userId?: string) {
  try {
    localStorage.setItem(COMPAT_KEY, JSON.stringify(ids));
    if (userId) localStorage.setItem(userCacheKey(userId), JSON.stringify(ids));
  } catch { /* compatibilidade opcional */ }
  window.dispatchEvent(new CustomEvent("pc:favorites-changed", { detail: { ids } }));
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadForUser = useCallback(async (id: string | null) => {
    if (!supabase || !id) {
      setFavoriteIds([]);
      setUserId(null);
      saveCompatibility([]);
      setLoading(false);
      return;
    }

    setUserId(id);
    const cachedIds = readCompatibility(id);
    setFavoriteIds(cachedIds);
    const { data, error } = await supabase
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (!error) {
      const ids = (data ?? []).map(row => String(row.product_id));
      setFavoriteIds(ids);
      saveCompatibility(ids, id);
    }
    setLoading(false);
  }, []);

  const consumePending = useCallback(async (id: string) => {
    if (!supabase) return;
    const pending = readPending();
    if (!pending?.productId) return;
    if (Date.now() - pending.createdAt > 30 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_KEY);
      return;
    }

    const { error } = await supabase.from("user_favorites").insert({ user_id: id, product_id: pending.productId });
    if (!error || error.code === "23505") sessionStorage.removeItem(PENDING_KEY);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const id = data.session?.user?.id ?? null;
      if (id) await consumePending(id);
      if (active) await loadForUser(id);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      setTimeout(() => {
        void (async () => {
          if (id) await consumePending(id);
          await loadForUser(id);
        })();
      }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [consumePending, loadForUser]);

  const refreshFavorites = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await loadForUser(data.session?.user?.id ?? null);
  }, [loadForUser]);

  const toggleFavorite = useCallback(async (productId: string | number, returnTo?: string) => {
    const id = String(productId);
    if (!supabase) return false;

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (!sessionUser) {
      const destination = returnTo || `${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ productId: id, returnTo: destination, createdAt: Date.now() } satisfies PendingFavorite));
      requestAuthAction("favorite", destination);
      return false;
    }

    const removing = favoriteIds.includes(id);
    const next = removing ? favoriteIds.filter(value => value !== id) : [id, ...favoriteIds.filter(value => value !== id)];
    setFavoriteIds(next);
    saveCompatibility(next, sessionUser.id);

    const response = removing
      ? await supabase.from("user_favorites").delete().eq("user_id", sessionUser.id).eq("product_id", id)
      : await supabase.from("user_favorites").insert({ user_id: sessionUser.id, product_id: id });

    if (response.error && response.error.code !== "23505") {
      await loadForUser(sessionUser.id);
      window.dispatchEvent(new CustomEvent("pc:set-toast", { detail: { message: "Não foi possível atualizar seus favoritos agora." } }));
      return false;
    }

    window.dispatchEvent(new CustomEvent("pc:set-toast", {
      detail: { message: removing ? "Produto removido dos favoritos." : "Produto salvo nos favoritos." },
    }));
    return true;
  }, [favoriteIds, loadForUser]);

  useEffect(() => {
    const handleExternalToggle = (event: Event) => {
      const { productId, returnTo } = (event as ToggleFavoriteEvent).detail || {};
      if (productId === undefined || productId === null) return;
      void toggleFavorite(productId, returnTo);
    };
    window.addEventListener("pc:toggle-favorite", handleExternalToggle);
    return () => window.removeEventListener("pc:toggle-favorite", handleExternalToggle);
  }, [toggleFavorite]);

  const value = useMemo<FavoriteContextValue>(() => ({
    favoriteIds,
    userId,
    loading,
    isFavorite: (productId) => favoriteIds.includes(String(productId)),
    toggleFavorite,
    refreshFavorites,
  }), [favoriteIds, userId, loading, toggleFavorite, refreshFavorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites precisa estar dentro de FavoritesProvider");
  return context;
}
