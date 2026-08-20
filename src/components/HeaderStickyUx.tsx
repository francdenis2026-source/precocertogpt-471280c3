import { useEffect } from "react";

function injectStyles() {
  if (document.getElementById("pc-sticky-header-ux")) return;
  const style = document.createElement("style");
  style.id = "pc-sticky-header-ux";
  style.textContent = `
    :root { --pc-header-height: 80px; --pc-header-height-scrolled: 68px; }

    .site-header,
    .site-header--absolute,
    .site-header--absolute.site-header--scrolled {
      position: fixed !important;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1200;
    }

    .site-header {
      height: var(--pc-header-height) !important;
      background: color-mix(in srgb, var(--surface) 90%, transparent) !important;
      backdrop-filter: blur(20px) saturate(1.4) !important;
      -webkit-backdrop-filter: blur(20px) saturate(1.4) !important;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 85%, transparent) !important;
      box-shadow: 0 1px 0 rgba(2,16,12,.04);
    }

    .site-header--scrolled {
      height: var(--pc-header-height-scrolled) !important;
      background: color-mix(in srgb, var(--surface) 92%, transparent) !important;
      box-shadow: 0 10px 28px rgba(15,23,42,.10) !important;
      border-bottom-color: var(--border) !important;
    }

    .site-header .header-inner { transition: min-height .25s ease, gap .25s ease; }
    .site-header--scrolled .header-inner { gap: 1.5rem; }

    .site-header .brand__logo-img { transition: height .25s ease, transform .25s ease, filter .25s ease; }
    .site-header--scrolled .brand__logo-img { height: 72px !important; }

    /* Reserva o espaço do header nas páginas internas. A home/hero passa por baixo dele. */
    body:not(:has(.hero)) main,
    body:not(:has(.hero)) .app > main,
    body:not(:has(.hero)) #root > main {
      padding-top: var(--pc-header-height);
    }

    .hero { padding-top: 0 !important; }
    .hero-content { padding-top: calc(var(--pc-header-height) + 34px) !important; }

    html { scroll-padding-top: calc(var(--pc-header-height-scrolled) + 16px); }

    @media (max-width: 760px) {
      :root { --pc-header-height: 68px; --pc-header-height-scrolled: 60px; }
      .site-header .brand__logo-img { height: 68px !important; }
      .site-header--scrolled .brand__logo-img { height: 58px !important; }
      .hero-content { padding-top: calc(var(--pc-header-height) + 20px) !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .site-header, .site-header *, .brand__logo-img { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function HeaderStickyUx() {
  useEffect(() => {
    injectStyles();
  }, []);
  return null;
}
