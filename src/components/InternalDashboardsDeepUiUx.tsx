import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-internal-dashboards-deep-uiux";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-internal-deep {
      background: var(--bg);
    }

    body.pc-internal-deep :where(main, section, article, aside, header, nav, form) {
      min-width: 0;
    }

    body.pc-internal-deep :where(h1) {
      font-size: clamp(2rem, 4vw, 3rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -0.045em !important;
      margin-top: 0 !important;
    }

    body.pc-internal-deep :where(h2) {
      font-size: clamp(1.35rem, 2.6vw, 1.9rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -0.025em !important;
    }

    body.pc-internal-deep :where(p, small) {
      line-height: 1.5 !important;
    }

    body.pc-internal-deep :where(button, a, input, select, textarea) {
      transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease !important;
    }

    body.pc-internal-deep :where(button, a[role="button"], a[style*="padding"]) {
      min-height: 44px !important;
    }

    body.pc-internal-deep :where(button:hover, a[role="button"]:hover, a[style*="padding"]:hover) {
      transform: translateY(-1px);
    }

    body.pc-internal-deep :where(button, a, input, select, textarea):focus-visible {
      outline: 3px solid color-mix(in srgb, var(--green) 56%, white) !important;
      outline-offset: 2px !important;
    }

    body.pc-internal-deep :where(article, section[style*="background"], div[style*="background: white"], div[style*="background:\"white\""]) {
      border-color: color-mix(in srgb, var(--border) 92%, transparent) !important;
    }

    body.pc-internal-deep :where(article[style*="borderRadius"], section[style*="borderRadius"], div[style*="borderRadius"]) {
      box-shadow: 0 8px 24px rgba(15,23,42,.055) !important;
    }

    body.pc-internal-deep :where(table) {
      font-size: .92rem !important;
    }

    body.pc-internal-deep :where(th) {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--surface-2) !important;
      font-size: .76rem !important;
      letter-spacing: .045em !important;
      text-transform: uppercase;
    }

    body.pc-internal-deep :where(td, th) {
      padding-block: 11px !important;
    }

    body.pc-internal-deep :where(input, select, textarea) {
      min-height: 44px !important;
      padding-inline: 12px !important;
      border-radius: 11px !important;
      box-shadow: none !important;
    }

    body.pc-internal-deep :where(input, select, textarea):focus {
      border-color: color-mix(in srgb, var(--green) 48%, var(--border)) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 12%, transparent) !important;
    }

    body.pc-merchant-deep > #root > div,
    body.pc-merchant-deep #root > div {
      background: linear-gradient(180deg, color-mix(in srgb,var(--surface-2) 78%,white), var(--bg)) !important;
    }

    body.pc-merchant-deep aside {
      width: min(270px, 24vw) !important;
      padding: 18px !important;
      border-right: 1px solid rgba(255,255,255,.08) !important;
      box-shadow: 10px 0 30px rgba(2,12,20,.08);
    }

    body.pc-merchant-deep aside nav {
      gap: 4px !important;
    }

    body.pc-merchant-deep aside nav button {
      min-height: 44px !important;
      border-radius: 11px !important;
      padding: 10px 12px !important;
      font-size: .9rem !important;
    }

    body.pc-merchant-deep aside nav button:hover {
      background: rgba(255,255,255,.08) !important;
    }

    body.pc-merchant-deep main {
      padding: clamp(20px,3vw,34px) !important;
    }

    body.pc-merchant-deep main > header {
      margin-bottom: 18px !important;
      padding-bottom: 16px !important;
      border-bottom: 1px solid var(--border) !important;
      align-items: center !important;
    }

    body.pc-merchant-deep main > header p {
      max-width: 780px;
    }

    body.pc-merchant-deep main section {
      margin-top: 14px !important;
    }

    body.pc-merchant-deep main section[style*="grid"] {
      gap: 12px !important;
    }

    body.pc-merchant-deep article {
      border-radius: 15px !important;
    }

    body.pc-merchant-deep article:hover {
      border-color: color-mix(in srgb, var(--green) 24%, var(--border)) !important;
    }

    body.pc-merchant-deep article strong[style*="fontSize"] {
      font-variant-numeric: tabular-nums;
      letter-spacing: -.025em !important;
    }

    body.pc-merchant-deep [style*="gridTemplateColumns: repeat(4"],
    body.pc-merchant-deep [style*="gridTemplateColumns:\"repeat(4"] {
      gap: 10px !important;
    }

    body.pc-admin-deep main {
      max-width: 1320px !important;
      margin-inline: auto !important;
      padding: clamp(22px,3vw,38px) !important;
    }

    body.pc-admin-deep main > header {
      margin-bottom: 16px !important;
      padding-bottom: 15px !important;
      border-bottom: 1px solid var(--pc-color-border) !important;
      align-items: center !important;
    }

    body.pc-admin-deep main > header p {
      max-width: 720px;
      font-size: .92rem !important;
    }

    body.pc-admin-deep main > section {
      margin-top: 12px !important;
    }

    body.pc-admin-deep main > section[style*="grid"] {
      gap: 10px !important;
    }

    body.pc-admin-deep article {
      padding: 18px !important;
      border-radius: 14px !important;
    }

    body.pc-admin-deep article strong {
      font-variant-numeric: tabular-nums;
    }

    body.pc-admin-deep section[style*="background"] {
      border-radius: 14px !important;
    }

    @media (max-width: 1100px) {
      body.pc-merchant-deep aside {
        width: 220px !important;
      }
      body.pc-merchant-deep main {
        padding-inline: 20px !important;
      }
      body.pc-admin-deep main > section[style*="grid"] {
        grid-template-columns: repeat(2,minmax(0,1fr)) !important;
      }
    }

    @media (max-width: 820px) {
      body.pc-merchant-deep #root > div:has(> aside) {
        display: block !important;
      }

      body.pc-merchant-deep aside {
        position: sticky !important;
        top: 0 !important;
        z-index: 60 !important;
        width: 100% !important;
        min-height: 0 !important;
        padding: 10px 12px !important;
        border-right: 0 !important;
        border-bottom: 1px solid rgba(255,255,255,.1) !important;
      }

      body.pc-merchant-deep aside > a:first-child,
      body.pc-merchant-deep aside > div {
        display: none !important;
      }

      body.pc-merchant-deep aside nav {
        display: flex !important;
        overflow-x: auto !important;
        gap: 6px !important;
        scrollbar-width: none;
      }

      body.pc-merchant-deep aside nav::-webkit-scrollbar { display:none; }

      body.pc-merchant-deep aside nav button {
        flex: 0 0 auto !important;
        min-width: max-content !important;
        min-height: 42px !important;
        padding-inline: 13px !important;
      }

      body.pc-merchant-deep aside > a:last-child {
        display: none !important;
      }

      body.pc-merchant-deep main {
        padding: 18px 14px 48px !important;
      }

      body.pc-merchant-deep main > header,
      body.pc-admin-deep main > header {
        align-items: flex-start !important;
        flex-direction: column !important;
      }

      body.pc-merchant-deep main > header button,
      body.pc-admin-deep main > header button {
        width: 100% !important;
      }

      body.pc-merchant-deep main section[style*="grid"],
      body.pc-admin-deep main > section[style*="grid"] {
        grid-template-columns: 1fr !important;
      }

      body.pc-merchant-deep [style*="display: grid"],
      body.pc-admin-deep [style*="display: grid"] {
        max-width: 100% !important;
      }

      body.pc-internal-deep :where(.table-wrap,.table-container,[style*="overflowX"]) {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
      }
    }

    @media (max-width: 560px) {
      body.pc-internal-deep :where(h1) {
        font-size: clamp(1.75rem,8vw,2.2rem) !important;
      }
      body.pc-internal-deep :where(h2) {
        font-size: 1.35rem !important;
      }
      body.pc-merchant-deep main,
      body.pc-admin-deep main {
        padding-inline: 12px !important;
      }
      body.pc-merchant-deep article,
      body.pc-admin-deep article,
      body.pc-admin-deep main > section {
        padding: 14px !important;
      }
      body.pc-internal-deep :where(button,input,select,textarea) {
        font-size: 16px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-internal-deep *, body.pc-internal-deep *::before, body.pc-internal-deep *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function InternalDashboardsDeepUiUx() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    const merchant = pathname.startsWith("/painel-lojista");
    const admin = pathname.startsWith("/admin");
    document.body.classList.toggle("pc-internal-deep", merchant || admin);
    document.body.classList.toggle("pc-merchant-deep", merchant);
    document.body.classList.toggle("pc-admin-deep", admin);
    return () => {
      document.body.classList.remove("pc-internal-deep", "pc-merchant-deep", "pc-admin-deep");
    };
  }, [pathname]);

  return null;
}
