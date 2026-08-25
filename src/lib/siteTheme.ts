export type SiteTheme = "light" | "dark";

const THEME_KEYS = ["theme", "precocerto-theme", "precocerto:theme"] as const;
export const SITE_THEME_EVENT = "pc:theme-changed";
let syncStarted = false;

const isTheme = (value: string | null): value is SiteTheme => value === "light" || value === "dark";

export function readSiteTheme(): SiteTheme {
  if (typeof window === "undefined") return "dark";
  for (const key of THEME_KEYS) {
    const saved = window.localStorage.getItem(key);
    if (isTheme(saved)) return saved;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setSiteTheme(theme: SiteTheme, persist = true) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  if (persist) THEME_KEYS.forEach(key => window.localStorage.setItem(key, theme));
  window.dispatchEvent(new CustomEvent<SiteTheme>(SITE_THEME_EVENT, { detail: theme }));
  // Mantém componentes legados sincronizados enquanto usam o evento anterior.
  window.dispatchEvent(new CustomEvent<SiteTheme>("precocerto:theme", { detail: theme }));
}

export function startSiteThemeSync() {
  if (syncStarted || typeof window === "undefined") return;
  syncStarted = true;
  window.addEventListener("storage", event => {
    if (!THEME_KEYS.includes(event.key as typeof THEME_KEYS[number]) || !isTheme(event.newValue)) return;
    setSiteTheme(event.newValue);
  });
}

export function initializeSiteTheme() {
  startSiteThemeSync();
  const theme = readSiteTheme();
  setSiteTheme(theme);
  return theme;
}

export function subscribeSiteTheme(listener: (theme: SiteTheme) => void) {
  const handleTheme = (event: Event) => listener((event as CustomEvent<SiteTheme>).detail);
  window.addEventListener(SITE_THEME_EVENT, handleTheme);
  return () => window.removeEventListener(SITE_THEME_EVENT, handleTheme);
}
