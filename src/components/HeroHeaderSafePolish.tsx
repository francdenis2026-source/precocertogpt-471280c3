import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-hero-header-safe-polish";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-hero-header-polish .site-header {
      height: 70px !important;
      background: color-mix(in srgb, var(--bg) 94%, transparent) !important;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent) !important;
      box-shadow: 0 8px 28px rgba(15, 23, 42, .06) !important;
      backdrop-filter: blur(14px) !important;
    }
    body.pc-hero-header-polish .header-inner { min-height: 70px !important; }
    body.pc-hero-header-polish .brand__logo-img { max-height: 54px !important; width: auto !important; }
    body.pc-hero-header-polish .desktop-nav a {
      min-height: 40px !important;
      display: inline-flex !important;
      align-items: center !important;
      border-radius: 10px !important;
      padding-inline: 11px !important;
      font-weight: 700 !important;
    }
    body.pc-hero-header-polish .desktop-nav a:hover { background: var(--surface-2) !important; }

    body.pc-hero-header-polish .hero {
      min-height: 590px !important;
      border-bottom: 1px solid rgba(255,255,255,.06) !important;
    }
    body.pc-hero-header-polish .hero-content {
      min-height: 590px !important;
      padding-top: 92px !important;
      padding-bottom: 54px !important;
    }
    body.pc-hero-header-polish .hero-copy { max-width: 700px !important; }
    body.pc-hero-header-polish .hero h1 {
      font-size: clamp(3rem, 5vw, 4.25rem) !important;
      line-height: 1.01 !important;
      letter-spacing: -.05em !important;
      margin-bottom: 18px !important;
    }
    body.pc-hero-header-polish .hero-copy > p {
      max-width: 620px !important;
      font-size: 1.06rem !important;
      line-height: 1.62 !important;
      color: var(--pc-color-muted) !important;
    }
    body.pc-hero-header-polish .search-combo__form {
      border-radius: 15px !important;
      box-shadow: 0 18px 45px rgba(0,0,0,.22) !important;
    }
    body.pc-hero-header-polish .search-combo__button {
      border-radius: 11px !important;
      font-weight: 850 !important;
    }
    body.pc-hero-header-polish .hero-insight {
      border-radius: 18px !important;
      box-shadow: 0 24px 60px rgba(0,0,0,.22) !important;
    }

    @media (max-width: 820px) {
      body.pc-hero-header-polish .site-header { height: 64px !important; }
      body.pc-hero-header-polish .header-inner { min-height: 64px !important; }
      body.pc-hero-header-polish .brand__logo-img { max-height: 48px !important; }
      body.pc-hero-header-polish .hero { min-height: 0 !important; }
      body.pc-hero-header-polish .hero-content {
        min-height: 0 !important;
        padding-top: 88px !important;
        padding-bottom: 40px !important;
      }
      body.pc-hero-header-polish .hero h1 {
        font-size: clamp(2.35rem, 10vw, 3.25rem) !important;
        line-height: 1.04 !important;
      }
      body.pc-hero-header-polish .hero-copy > p { font-size: 1rem !important; }
    }
  `;
  document.head.appendChild(style);
}

export function HeroHeaderSafePolish() {
  const location = useLocation();

  useEffect(() => {
    ensureStyles();
    const isHome = location.pathname === "/";
    document.body.classList.toggle("pc-hero-header-polish", isHome);
    return () => document.body.classList.remove("pc-hero-header-polish");
  }, [location.pathname]);

  return null;
}
