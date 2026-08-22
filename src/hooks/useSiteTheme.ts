import { useEffect, useState } from "react";
import { readSiteTheme, setSiteTheme, subscribeSiteTheme, type SiteTheme } from "../lib/siteTheme";

export function useSiteTheme() {
  const [theme, setThemeState] = useState<SiteTheme>(readSiteTheme);
  useEffect(() => subscribeSiteTheme(setThemeState), []);
  const setTheme = (next: SiteTheme | ((current: SiteTheme) => SiteTheme)) => {
    const value = typeof next === "function" ? next(readSiteTheme()) : next;
    setSiteTheme(value);
  };
  return { theme, setTheme, toggleTheme: () => setSiteTheme(theme === "dark" ? "light" : "dark") };
}
