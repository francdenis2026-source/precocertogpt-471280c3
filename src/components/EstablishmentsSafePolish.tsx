import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-establishments-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-establishments-polish .pc-est-hero {
      max-width: 1200px !important;
      padding-top: 68px !important;
      padding-bottom: 56px !important;
      gap: 48px !important;
    }

    body.pc-establishments-polish .pc-est-hero h1 {
      max-width: 760px;
      font-size: clamp(2.6rem, 5vw, 4.25rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.045em !important;
      margin: 0 !important;
      text-wrap: balance;
    }

    body.pc-establishments-polish .pc-est-hero h1 span { color: color-mix(in srgb, var(--pc-color-primary) 10%, var(--pc-color-surface)) !important; }
    body.pc-establishments-polish .pc-est-hero p {
      max-width: 720px;
      font-size: 1rem !important;
      line-height: 1.65 !important;
      color: rgba(255,255,255,.78) !important;
    }

    body.pc-establishments-polish .pc-est-explain {
      max-width: 1160px !important;
      border-radius: 18px !important;
      box-shadow: 0 18px 48px rgba(10,35,25,.08) !important;
    }

    body.pc-establishments-polish .pc-est-explain > div {
      min-height: 92px;
      padding: 20px 22px !important;
    }

    body.pc-establishments-polish .pc-est-directory {
      max-width: 1200px !important;
      padding-top: 58px !important;
    }

    body.pc-establishments-polish .pc-est-heading h2 {
      font-size: clamp(2rem, 3.5vw, 2.6rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.035em !important;
      text-wrap: balance;
    }

    body.pc-establishments-polish .pc-est-heading p {
      max-width: 760px;
      font-size: .98rem !important;
      line-height: 1.6 !important;
    }

    body.pc-establishments-polish .pc-est-filters {
      position: sticky;
      top: 14px;
      z-index: 20;
      padding: 10px;
      background: rgba(245,247,246,.92);
      border: 1px solid var(--pc-color-border);
      border-radius: 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(15,55,35,.05);
    }

    body.pc-establishments-polish .pc-est-filters input,
    body.pc-establishments-polish .pc-est-filters select,
    body.pc-establishments-polish .pc-est-filters button {
      min-height: 48px !important;
      font-size: .95rem !important;
    }

    body.pc-establishments-polish .pc-est-grid {
      gap: 18px !important;
    }

    body.pc-establishments-polish .pc-est-card {
      border-radius: 20px !important;
      border-color: var(--pc-color-border) !important;
      box-shadow: 0 8px 28px rgba(11,38,24,.055) !important;
      min-height: 370px !important;
      background: var(--pc-color-surface) !important;
    }

    body.pc-establishments-polish .pc-est-card:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 22px 52px rgba(15,55,35,.11) !important;
      border-color: var(--pc-color-muted) !important;
    }

    body.pc-establishments-polish .pc-est-card img {
      object-fit: contain !important;
      max-width: 100%;
      max-height: 100%;
    }

    body.pc-establishments-polish .pc-est-card h3 {
      font-size: 1.22rem !important;
      line-height: 1.25 !important;
      letter-spacing: -.02em !important;
      text-wrap: pretty;
    }

    body.pc-establishments-polish .pc-est-card p {
      font-size: .9rem !important;
      line-height: 1.5 !important;
    }

    body.pc-establishments-polish .pc-est-card-footer {
      gap: 8px !important;
      padding-top: 14px !important;
    }

    body.pc-establishments-polish .pc-est-card-footer a {
      min-height: 44px !important;
      border-radius: 11px !important;
      font-size: .86rem !important;
      font-weight: 800 !important;
    }

    body.pc-establishments-polish .pc-est-card [style*="font-size: 9px"],
    body.pc-establishments-polish .pc-est-card [style*="fontSize: 9"] {
      font-size: 10px !important;
    }

    body.pc-establishments-polish .pc-est-cta {
      max-width: 1160px !important;
      border-radius: 22px !important;
      box-shadow: 0 18px 50px rgba(10,35,25,.08) !important;
    }

    @media (max-width: 900px) {
      body.pc-establishments-polish .pc-est-hero { padding-top: 56px !important; gap: 28px !important; }
      body.pc-establishments-polish .pc-est-filters { position: static; }
      body.pc-establishments-polish .pc-est-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    }

    @media (max-width: 620px) {
      body.pc-establishments-polish .pc-est-hero {
        padding-top: 42px !important;
        padding-bottom: 40px !important;
      }
      body.pc-establishments-polish .pc-est-hero h1 { font-size: clamp(2.2rem, 11vw, 3rem) !important; }
      body.pc-establishments-polish .pc-est-hero p { font-size: .95rem !important; }
      body.pc-establishments-polish .pc-est-directory { padding-top: 44px !important; }
      body.pc-establishments-polish .pc-est-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
      body.pc-establishments-polish .pc-est-card { min-height: 0 !important; }
      body.pc-establishments-polish .pc-est-card h3 { font-size: 1.15rem !important; }
      body.pc-establishments-polish .pc-est-card p { font-size: .9rem !important; }
      body.pc-establishments-polish .pc-est-filters { padding: 8px; }
      body.pc-establishments-polish .pc-est-card-footer a { font-size: .9rem !important; }
    }
  `;
  document.head.appendChild(style);
}

export function EstablishmentsSafePolish() {
  const location = useLocation();

  useEffect(() => {
    installStyles();
    const active = location.pathname === "/estabelecimentos";
    document.body.classList.toggle("pc-establishments-polish", active);
    return () => document.body.classList.remove("pc-establishments-polish");
  }, [location.pathname]);

  return null;
}
