import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-public-pages-uiux-audit";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-public-refined {
      --pc-public-radius: 18px;
      --pc-public-shadow: 0 12px 34px rgba(15,23,42,.07);
      --pc-public-shadow-hover: 0 20px 46px rgba(15,23,42,.11);
      --pc-public-section: clamp(42px,5vw,68px);
      overflow-x: hidden;
    }

    body.pc-public-refined :where(.page-shell,.shell) {
      max-width: 1180px;
    }

    body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) {
      min-height: 0 !important;
      padding-block: clamp(42px,5vw,68px) !important;
      border-radius: 0 0 28px 28px;
      overflow: clip;
    }

    body.pc-public-refined :where(.generic-hero h1,.page-title h1,.center-heading h1,.search-page h1,.plans-page h1) {
      font-size: clamp(2rem,4.3vw,3.45rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.045em !important;
      text-wrap: balance;
    }

    body.pc-public-refined :where(.page-title p,.center-heading p,.section-heading p,.search-page p) {
      max-width: 720px;
      font-size: clamp(.98rem,1.5vw,1.08rem) !important;
      line-height: 1.62 !important;
      color: var(--muted) !important;
    }

    body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) :where(h1,h2) {
      color: var(--pc-color-surface) !important;
      text-shadow: 0 2px 18px rgba(0,0,0,.42);
    }

    body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) p {
      max-width: 720px;
      color: var(--pc-color-muted) !important;
      font-size: clamp(.98rem,1.5vw,1.08rem) !important;
      line-height: 1.62 !important;
      text-shadow: 0 2px 16px rgba(0,0,0,.48);
    }

    body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) :where(.eyebrow,.kicker) {
      color: color-mix(in srgb, var(--pc-color-primary) 9%, var(--pc-color-surface)) !important;
    }

    body.pc-public-refined :where(.section,.page-section) {
      padding-block: var(--pc-public-section) !important;
    }

    body.pc-public-refined :where(.section-heading,.page-title,.center-heading) {
      margin-bottom: clamp(18px,2.5vw,28px) !important;
    }

    body.pc-public-refined :where(.section-heading h2,.center-heading h2) {
      font-size: clamp(1.7rem,3vw,2.45rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.035em !important;
      text-wrap: balance;
    }

    body.pc-public-refined :where(.visual-product-card,.store-card,.price-table-card,.basket-plan,.benefit-card,.plan-card,.auth-card,.admin-card,.pc-service-card,.order-card,.search-panel,.compare-card) {
      border-radius: var(--pc-public-radius) !important;
      border: 1px solid color-mix(in srgb,var(--border) 90%,transparent) !important;
      box-shadow: var(--pc-public-shadow) !important;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease !important;
    }

    body.pc-public-refined :where(.visual-product-card,.store-card,.plan-card,.benefit-card,.pc-service-card,.order-card):hover {
      transform: translateY(-3px);
      box-shadow: var(--pc-public-shadow-hover) !important;
      border-color: color-mix(in srgb,var(--green) 24%,var(--border)) !important;
    }

    body.pc-public-refined :where(.visual-product-image,.product-image,.store-logo-container) {
      background: linear-gradient(180deg,var(--surface-2),color-mix(in srgb,var(--surface-2) 62%,var(--surface))) !important;
    }

    body.pc-public-refined :where(.visual-product-image img,.product-image img,.store-card img) {
      object-fit: contain !important;
      transition: transform .22s ease !important;
    }

    body.pc-public-refined .visual-product-card:hover .visual-product-image img,
    body.pc-public-refined .store-card:hover img {
      transform: scale(1.025);
    }

    body.pc-public-refined :where(.button,button,[role="button"]) {
      min-height: 44px;
    }

    body.pc-public-refined :where(.button--primary,.search-combo__button,.plan-card .button,.auth-card .button) {
      font-weight: 850 !important;
      box-shadow: 0 8px 20px color-mix(in srgb,var(--green) 16%,transparent);
      transition: transform .18s ease, box-shadow .18s ease, filter .18s ease !important;
    }

    body.pc-public-refined :where(.button--primary,.search-combo__button,.plan-card .button,.auth-card .button):hover {
      transform: translateY(-1px);
      filter: saturate(1.05);
      box-shadow: 0 13px 28px color-mix(in srgb,var(--green) 22%,transparent);
    }

    body.pc-public-refined :where(input,select,textarea,.search-combo) {
      border-radius: 13px !important;
    }

    body.pc-public-refined :where(input,select,textarea):focus {
      border-color: color-mix(in srgb,var(--green) 55%,var(--border)) !important;
      box-shadow: 0 0 0 4px color-mix(in srgb,var(--green) 12%,transparent) !important;
      outline: none !important;
    }

    body.pc-public-refined :where(.visual-price strong,.price-value,.comparison-price,.search-result-item__price,.price-row strong) {
      font-variant-numeric: tabular-nums;
      letter-spacing: -.025em;
    }

    body.pc-public-refined :where(.price-table-card,.compare-table-wrapper,.admin-table,.store-product-table) {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }

    body.pc-public-refined :where(.filters,.filter-row,.admin-filters,.search-filters) {
      gap: 10px !important;
    }

    body.pc-public-refined :where(.site-footer,footer) {
      margin-top: 0 !important;
    }

    @media (max-width: 900px) {
      body.pc-public-refined :where(.section,.page-section) {
        padding-block: 38px !important;
      }
      body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) {
        padding-block: 36px !important;
        border-radius: 0 0 20px 20px;
      }
      body.pc-public-refined :where(.visual-product-grid,.store-grid,.benefit-grid,.plans-grid,.basket-grid) {
        gap: 12px !important;
      }
      body.pc-public-refined :where(.search-page,.dashboard-preview,.basket-grid,.benefit-grid) {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 620px) {
      body.pc-public-refined :where(.shell,.page-shell) {
        width: calc(100% - 24px) !important;
      }
      body.pc-public-refined :where(.section,.page-section) {
        padding-block: 28px !important;
      }
      body.pc-public-refined :where(.generic-hero,.page-hero,.search-hero,.store-hero,.plans-hero,.auth-hero) {
        padding-block: 28px !important;
      }
      body.pc-public-refined :where(.generic-hero h1,.page-title h1,.center-heading h1,.search-page h1,.plans-page h1) {
        font-size: clamp(1.8rem,8vw,2.45rem) !important;
      }
      body.pc-public-refined :where(.section-heading h2,.center-heading h2) {
        font-size: clamp(1.5rem,6.5vw,2rem) !important;
      }
      body.pc-public-refined :where(.visual-product-card,.store-card,.price-table-card,.basket-plan,.benefit-card,.plan-card,.auth-card,.pc-service-card,.order-card,.search-panel,.compare-card) {
        border-radius: 15px !important;
        box-shadow: 0 8px 24px rgba(15,23,42,.06) !important;
      }
      body.pc-public-refined :where(.visual-product-content,.plan-card,.auth-card,.pc-service-card,.order-card) {
        padding: 16px !important;
      }
      body.pc-public-refined :where(.button,.button--primary,.search-combo__button) {
        min-height: 44px !important;
        font-size: .9rem !important;
      }
      body.pc-public-refined :where(input,select,textarea) {
        font-size: 16px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-public-refined *,body.pc-public-refined *::before,body.pc-public-refined *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function PublicPagesUiUxAudit() {
  const location = useLocation();
  useEffect(() => {
    installStyles();
    const path = location.pathname;
    const excluded = path === "/" || path.startsWith("/admin") || path.startsWith("/painel-lojista");
    document.body.classList.toggle("pc-public-refined", !excluded);
    return () => document.body.classList.remove("pc-public-refined");
  }, [location.pathname]);
  return null;
}
