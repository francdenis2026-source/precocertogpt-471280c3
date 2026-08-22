// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initializeSiteTheme, setSiteTheme, SITE_THEME_EVENT } from "../lib/siteTheme";

describe("sincronização do tema entre abas", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("aplica e persiste a seleção recebida de outra aba", () => {
    initializeSiteTheme();
    setSiteTheme("dark");
    const changed = vi.fn();
    window.addEventListener(SITE_THEME_EVENT, changed);

    window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "light" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(localStorage.getItem("precocerto-theme")).toBe("light");
    expect(localStorage.getItem("precocerto:theme")).toBe("light");
    expect(changed).toHaveBeenCalled();
    window.removeEventListener(SITE_THEME_EVENT, changed);
  });
});
