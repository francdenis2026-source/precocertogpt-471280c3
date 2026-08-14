import { useEffect } from "react";

function injectStyles() {
  if (document.getElementById("pc-dark-theme-consistency")) return;
  const style = document.createElement("style");
  style.id = "pc-dark-theme-consistency";
  style.textContent = `
    [data-theme='dark'] body.pc-home-rewrite,
    body.pc-home-rewrite[data-theme='dark'] {
      background: var(--bg) !important;
      color: var(--text-main) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .benefits-section,
    [data-theme='dark'] body.pc-home-rewrite .section,
    [data-theme='dark'] body.pc-home-rewrite .professional,
    [data-theme='dark'] body.pc-home-rewrite .site-footer,
    body.pc-home-rewrite[data-theme='dark'] .benefits-section,
    body.pc-home-rewrite[data-theme='dark'] .section,
    body.pc-home-rewrite[data-theme='dark'] .professional,
    body.pc-home-rewrite[data-theme='dark'] .site-footer {
      background: var(--bg) !important;
      color: var(--text-main) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .benefit-card,
    [data-theme='dark'] body.pc-home-rewrite .metrics-float,
    [data-theme='dark'] body.pc-home-rewrite .visual-product-card,
    [data-theme='dark'] body.pc-home-rewrite .basket-feature,
    [data-theme='dark'] body.pc-home-rewrite .basket-plan,
    [data-theme='dark'] body.pc-home-rewrite .store-card,
    [data-theme='dark'] body.pc-home-rewrite .step-card,
    [data-theme='dark'] body.pc-home-rewrite .price-table-card,
    [data-theme='dark'] body.pc-home-rewrite .dashboard-preview,
    body.pc-home-rewrite[data-theme='dark'] .benefit-card,
    body.pc-home-rewrite[data-theme='dark'] .metrics-float,
    body.pc-home-rewrite[data-theme='dark'] .visual-product-card,
    body.pc-home-rewrite[data-theme='dark'] .basket-feature,
    body.pc-home-rewrite[data-theme='dark'] .basket-plan,
    body.pc-home-rewrite[data-theme='dark'] .store-card,
    body.pc-home-rewrite[data-theme='dark'] .step-card,
    body.pc-home-rewrite[data-theme='dark'] .price-table-card,
    body.pc-home-rewrite[data-theme='dark'] .dashboard-preview {
      background: var(--surface) !important;
      color: var(--text-main) !important;
      border-color: var(--border) !important;
      box-shadow: none !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .visual-product-image,
    [data-theme='dark'] body.pc-home-rewrite .mini-trend,
    [data-theme='dark'] body.pc-home-rewrite .price-row,
    [data-theme='dark'] body.pc-home-rewrite .price-table-head,
    [data-theme='dark'] body.pc-home-rewrite .category-rail a,
    body.pc-home-rewrite[data-theme='dark'] .visual-product-image,
    body.pc-home-rewrite[data-theme='dark'] .mini-trend,
    body.pc-home-rewrite[data-theme='dark'] .price-row,
    body.pc-home-rewrite[data-theme='dark'] .price-table-head,
    body.pc-home-rewrite[data-theme='dark'] .category-rail a {
      background: var(--surface-2) !important;
      color: var(--text-main) !important;
      border-color: var(--border) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .section-heading h2,
    [data-theme='dark'] body.pc-home-rewrite .visual-product-name,
    [data-theme='dark'] body.pc-home-rewrite .benefit-card h3,
    [data-theme='dark'] body.pc-home-rewrite .store-card h3,
    [data-theme='dark'] body.pc-home-rewrite .step-card h3,
    [data-theme='dark'] body.pc-home-rewrite .basket-feature h3,
    [data-theme='dark'] body.pc-home-rewrite .basket-plan h3,
    body.pc-home-rewrite[data-theme='dark'] .section-heading h2,
    body.pc-home-rewrite[data-theme='dark'] .visual-product-name,
    body.pc-home-rewrite[data-theme='dark'] .benefit-card h3,
    body.pc-home-rewrite[data-theme='dark'] .store-card h3,
    body.pc-home-rewrite[data-theme='dark'] .step-card h3,
    body.pc-home-rewrite[data-theme='dark'] .basket-feature h3,
    body.pc-home-rewrite[data-theme='dark'] .basket-plan h3 {
      color: var(--text-main) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .section-heading p,
    [data-theme='dark'] body.pc-home-rewrite .benefit-card p,
    [data-theme='dark'] body.pc-home-rewrite .store-card p,
    [data-theme='dark'] body.pc-home-rewrite .step-card p,
    [data-theme='dark'] body.pc-home-rewrite .site-footer p,
    [data-theme='dark'] body.pc-home-rewrite .site-footer a,
    body.pc-home-rewrite[data-theme='dark'] .section-heading p,
    body.pc-home-rewrite[data-theme='dark'] .benefit-card p,
    body.pc-home-rewrite[data-theme='dark'] .store-card p,
    body.pc-home-rewrite[data-theme='dark'] .step-card p,
    body.pc-home-rewrite[data-theme='dark'] .site-footer p,
    body.pc-home-rewrite[data-theme='dark'] .site-footer a {
      color: var(--muted) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .final-cta,
    body.pc-home-rewrite[data-theme='dark'] .final-cta {
      background: linear-gradient(135deg, var(--pc-color-foreground), var(--pc-color-foreground)) !important;
      color: var(--pc-color-surface) !important;
      border: 1px solid var(--pc-color-foreground) !important;
      box-shadow: 0 18px 44px rgba(0,0,0,.28) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .final-cta h2,
    [data-theme='dark'] body.pc-home-rewrite .final-cta p,
    body.pc-home-rewrite[data-theme='dark'] .final-cta h2,
    body.pc-home-rewrite[data-theme='dark'] .final-cta p {
      color: var(--pc-color-surface) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .button--white,
    body.pc-home-rewrite[data-theme='dark'] .button--white {
      background: var(--surface-2) !important;
      color: var(--text-main) !important;
      border-color: var(--border) !important;
    }

    [data-theme='dark'] body.pc-home-rewrite .site-footer,
    body.pc-home-rewrite[data-theme='dark'] .site-footer {
      border-top: 1px solid var(--border) !important;
    }
  `;
  document.head.appendChild(style);
}

export function DarkThemeConsistency() {
  useEffect(() => {
    injectStyles();
  }, []);
  return null;
}
