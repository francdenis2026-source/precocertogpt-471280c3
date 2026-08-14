import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-product-cards-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-product-polish .visual-product-card {
      border: 1px solid color-mix(in srgb, var(--border) 86%, transparent) !important;
      box-shadow: 0 8px 24px rgba(15,23,42,.06) !important;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
    }
    body.pc-product-polish .visual-product-card:hover {
      transform: translateY(-3px) !important;
      border-color: color-mix(in srgb, var(--green) 28%, var(--border)) !important;
      box-shadow: 0 16px 36px rgba(15,23,42,.10) !important;
    }
    body.pc-product-polish .visual-product-image {
      display:grid !important;
      place-items:center !important;
      background: linear-gradient(180deg,var(--surface-2),color-mix(in srgb,var(--surface-2) 60%,var(--surface))) !important;
      border-bottom: 1px solid var(--border) !important;
    }
    body.pc-product-polish .visual-product-image img {
      max-width: 88% !important;
      max-height: 88% !important;
      object-fit: contain !important;
      filter: drop-shadow(0 8px 14px rgba(15,23,42,.08));
    }
    body.pc-product-polish .visual-product-content {
      display:flex !important;
      flex-direction:column !important;
      gap:8px !important;
    }
    body.pc-product-polish .visual-product-name {
      font-size: 1.05rem !important;
      line-height: 1.35 !important;
      font-weight: 800 !important;
      color: var(--text-main) !important;
      min-height: 2.8em !important;
    }
    body.pc-product-polish .visual-store {
      color: var(--muted) !important;
      font-size: .86rem !important;
      line-height: 1.4 !important;
    }
    body.pc-product-polish .visual-price {
      display:flex !important;
      align-items:flex-end !important;
      justify-content:space-between !important;
      gap:12px !important;
      margin-top:2px !important;
    }
    body.pc-product-polish .visual-price strong {
      color: var(--green) !important;
      font-size: clamp(1.55rem,2.4vw,1.85rem) !important;
      line-height: 1 !important;
      letter-spacing:-.035em !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums;
    }
    body.pc-product-polish .visual-product-actions {
      margin-top:auto !important;
      gap:8px !important;
    }
    body.pc-product-polish .visual-product-actions .button--primary {
      min-height:46px !important;
      border-radius:12px !important;
      font-weight:850 !important;
    }

    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button,[aria-label*='favorit' i])[aria-pressed='true'],
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button).is-favorite,
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button).active {
      background: color-mix(in srgb,var(--pc-color-danger) 12%,var(--surface)) !important;
      border-color: color-mix(in srgb,var(--pc-color-danger) 38%,var(--border)) !important;
      color:var(--pc-color-danger) !important;
      box-shadow: inset 0 0 0 1px color-mix(in srgb,var(--pc-color-danger) 12%,transparent) !important;
    }
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button,[aria-label*='favorit' i]) svg {
      transition: transform .18s ease, fill .18s ease, color .18s ease;
    }
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button,[aria-label*='favorit' i])[aria-pressed='true'] svg,
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button).is-favorite svg,
    body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button).active svg {
      fill: currentColor !important;
      transform: scale(1.08);
    }

    body.pc-product-polish .price-table-card {
      border:1px solid var(--border) !important;
      box-shadow:0 10px 28px rgba(15,23,42,.06) !important;
    }
    body.pc-product-polish .price-table-head {
      background: color-mix(in srgb,var(--surface-2) 82%,transparent) !important;
      color: var(--muted) !important;
      font-size:.78rem !important;
      letter-spacing:.025em !important;
      text-transform:uppercase;
    }
    body.pc-product-polish .price-row {
      min-height:64px !important;
      transition: background .16s ease !important;
    }
    body.pc-product-polish .price-row:hover {
      background: color-mix(in srgb,var(--surface-2) 58%,transparent) !important;
    }
    body.pc-product-polish .price-row strong,
    body.pc-product-polish .comparison-price,
    body.pc-product-polish .price-value {
      font-variant-numeric:tabular-nums;
    }
    body.pc-product-polish :is(.lowest-price,.best-price,.price--lowest,.comparison-lowest) {
      color: var(--green) !important;
      font-weight:900 !important;
    }
    body.pc-product-polish :is(.average-price,.price--average,.comparison-average) {
      color: var(--text-main) !important;
      font-weight:750 !important;
    }
    body.pc-product-polish :is(.highest-price,.price--highest,.comparison-highest) {
      color: color-mix(in srgb,var(--pc-color-danger) 84%,var(--text-main)) !important;
      font-weight:800 !important;
    }

    @media (max-width: 760px) {
      body.pc-product-polish .visual-product-card {
        min-width:min(84vw,320px) !important;
      }
      body.pc-product-polish .visual-product-content {
        padding:16px !important;
      }
      body.pc-product-polish .visual-product-name {
        font-size:1rem !important;
        min-height:auto !important;
      }
      body.pc-product-polish .visual-store {
        font-size:.875rem !important;
      }
      body.pc-product-polish .visual-price strong {
        font-size:1.6rem !important;
      }
      body.pc-product-polish .price-row {
        align-items:center !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-product-polish .visual-product-card,
      body.pc-product-polish :is(.favorite-button,.favorite-btn,.heart-button,[aria-label*='favorit' i]) svg {
        transition:none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function ProductCardsSafePolish() {
  const location = useLocation();
  useEffect(() => {
    installStyles();
    // The rebuilt homepage owns its product-card geometry and typography.
    // Keep this legacy polish on product/search flows only to avoid cross-layer collisions.
    const eligible = location.pathname.startsWith("/buscar") || location.pathname.startsWith("/produto/") || location.pathname.startsWith("/melhores-precos");
    document.body.classList.toggle("pc-product-polish", eligible);
    return () => document.body.classList.remove("pc-product-polish");
  }, [location.pathname]);
  return null;
}
