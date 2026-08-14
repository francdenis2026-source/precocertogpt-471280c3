import { useEffect } from "react";

const STYLE_ID = "pc-ui-ux-pro-max-foundation";

function installFoundationStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --pc-color-bg: var(--bg);
      --pc-color-surface: var(--surface);
      --pc-color-surface-subtle: var(--surface-2);
      --pc-color-text: var(--text-main);
      --pc-color-text-muted: var(--muted);
      --pc-color-border: var(--border);
      --pc-color-primary: var(--green);
      --pc-radius-control: 10px;
      --pc-radius-card: 16px;
      --pc-space-1: 4px;
      --pc-space-2: 8px;
      --pc-space-3: 12px;
      --pc-space-4: 16px;
      --pc-space-5: 24px;
      --pc-space-6: 32px;
      --pc-motion-fast: 160ms cubic-bezier(.2,.8,.2,1);
      --pc-motion-standard: 220ms cubic-bezier(.2,.8,.2,1);
    }

    html {
      scroll-behavior: smooth;
      text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      scrollbar-gutter: stable;
    }

    body {
      min-width: 320px;
      font-size: 16px;
      line-height: 1.55;
      text-rendering: optimizeLegibility;
    }

    :where(button, a, input, select, textarea, [role="button"]):focus-visible {
      outline: 3px solid color-mix(in srgb, var(--green) 68%, white);
      outline-offset: 3px;
    }

    :where(button, [role="button"], .button, .icon-button, .mobile-menu-button) {
      touch-action: manipulation;
    }

    :where(.button, .icon-button, .mobile-menu-button, .search-combo__clear, .filter-mobile) {
      min-height: 44px;
    }

    :where(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea) {
      min-height: 44px;
      font-size: 1rem;
    }

    :where(.section-heading h2, .hero h1, .generic-hero h1, .result-hero h1, .auth-form h2) {
      text-wrap: balance;
    }

    :where(.section-heading p, .hero-copy > p, .generic-hero p, .result-hero p, .auth-form > p) {
      text-wrap: pretty;
    }

    .visual-product-card,
    .store-card,
    .price-table-card,
    .basket-plan,
    .result-card,
    .generic-main,
    .generic-aside,
    .basket-builder,
    .basket-summary {
      border-radius: var(--pc-radius-card);
    }

    .visual-product-card,
    .store-card,
    .price-table-card,
    .result-card {
      overflow: clip;
    }

    .visual-product-image img,
    .product-visual img,
    .product-thumb img,
    .compact-product img {
      object-fit: contain;
      max-width: 100%;
    }

    .visual-product-name {
      line-height: 1.35;
      text-wrap: pretty;
    }

    :where(.visual-price strong, .search-result-item__price, .price-row strong, .green-price, .result-price strong, .analytics-grid strong) {
      font-variant-numeric: tabular-nums;
    }

    .search-result-item,
    .visual-product-card,
    .store-card,
    .result-card,
    .button,
    .icon-button,
    .desktop-nav a,
    .site-footer a {
      transition-duration: 160ms;
    }

    /* Header e navegação pública */
    .site-header {
      min-height: 72px;
      height: 72px;
    }

    .desktop-nav {
      gap: 22px;
      font-size: .92rem;
      font-weight: 720;
      color: color-mix(in srgb, var(--text-main) 82%, var(--muted));
    }

    .desktop-nav a,
    .text-link {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      font-size: .9rem;
    }

    .brand__word small {
      font-size: .62rem;
      line-height: 1.25;
    }

    /* Heros e chamadas */
    .hero {
      min-height: 500px;
    }

    .hero-content > p,
    .generic-hero p,
    .result-hero p {
      font-size: 1rem;
      line-height: 1.6;
    }

    .eyebrow,
    .hero-live {
      font-size: .75rem;
      line-height: 1.35;
    }

    .hero-trust {
      font-size: .82rem;
      line-height: 1.4;
    }

    .generic-hero {
      padding: clamp(34px, 4vw, 52px);
    }

    .generic-hero h1 {
      font-size: clamp(2.25rem, 4vw, 3.1rem);
    }

    /* Busca: resultados sempre sobre a página */
    .search-combo,
    .page-search-sticky,
    .search-command__box {
      position: relative;
      z-index: 90;
    }

    .search-combo__input,
    .search-combo input {
      font-size: 1rem;
    }

    .suggestions,
    .search-combo__results,
    .search-results-popover {
      z-index: 1600;
      max-height: min(460px, 58vh);
      overflow-y: auto;
      overscroll-behavior: contain;
      box-shadow: 0 24px 70px rgba(6,28,49,.22);
    }

    .suggestions strong,
    .search-result-item__name {
      font-size: .92rem;
      line-height: 1.3;
    }

    .suggestions small,
    .search-result-item__meta,
    .search-result-item__store {
      font-size: .78rem;
      line-height: 1.4;
      color: var(--muted);
    }

    .suggestion-price b,
    .search-result-item__price {
      font-size: 1.05rem;
      font-weight: 850;
    }

    /* Resultados: hierarquia de decisão, não aparência de tabela administrativa */
    .page-title p,
    .results-head p {
      font-size: .94rem;
      line-height: 1.5;
    }

    .location-pill {
      min-height: 44px;
      font-size: .82rem;
    }

    .filter-sidebar {
      top: 90px;
    }

    .filter-title {
      font-size: .95rem;
      font-weight: 800;
    }

    .filter-title button,
    .filter-sidebar > a {
      min-height: 40px;
      font-size: .82rem;
    }

    .filter-sidebar label {
      gap: 8px;
      font-size: .88rem;
      line-height: 1.35;
    }

    .filter-sidebar h3 {
      font-size: .75rem;
      line-height: 1.4;
    }

    .chip-list button {
      min-height: 36px;
      padding-inline: 11px;
      font-size: .78rem;
    }

    .result-hero {
      gap: 22px;
      padding: clamp(22px, 3vw, 30px);
    }

    .result-hero h1 {
      font-size: clamp(1.9rem, 3vw, 2.35rem);
    }

    .best-choice {
      min-height: 34px;
      font-size: .76rem;
    }

    .result-actions button {
      min-height: 40px;
      font-size: .8rem;
    }

    .analytics-grid span {
      font-size: .78rem;
      line-height: 1.35;
    }

    .analytics-grid strong {
      font-size: clamp(1.5rem, 2.2vw, 1.85rem);
    }

    .analytics-grid small {
      font-size: .72rem;
      line-height: 1.4;
    }

    .results-head h2 {
      font-size: 1.55rem;
    }

    .results-head > span {
      font-size: .8rem;
    }

    .result-card {
      min-height: 88px;
      padding: 15px 16px;
    }

    .rank {
      font-size: .75rem;
    }

    .category-tag {
      font-size: .68rem;
      line-height: 1.35;
    }

    .result-info > a,
    .product-cell a,
    .compact-product > div:nth-child(2) > a {
      font-size: .94rem;
      line-height: 1.35;
    }

    .result-info > small,
    .result-info > div,
    .product-cell small,
    .market-cell small,
    .compact-product > div:nth-child(2) > small {
      font-size: .76rem;
      line-height: 1.4;
    }

    .result-market b {
      color: var(--blue);
      font-size: .86rem;
    }

    .result-market small,
    .result-price small,
    .freshness {
      font-size: .74rem;
    }

    .result-price strong,
    .green-price {
      font-size: 1.22rem;
      font-weight: 850;
    }

    .result-card-actions .button,
    .compact-product .button {
      min-height: 40px;
      font-size: .8rem;
    }

    /* Login e cadastro: leitura, confiança e toque */
    .auth-brand-panel {
      min-height: 100dvh;
    }

    .auth-brand-panel h1 {
      font-size: clamp(2.45rem, 4.6vw, 3.65rem);
      line-height: 1.03;
    }

    .auth-brand-panel p {
      font-size: 1rem;
      line-height: 1.62;
    }

    .auth-brand-panel li {
      gap: 10px;
      font-size: .92rem;
      line-height: 1.45;
    }

    .auth-brand-panel > small,
    .auth-back {
      font-size: .78rem;
    }

    .auth-form {
      width: min(100%, 460px);
    }

    .auth-form h2 {
      font-size: clamp(2rem, 3.2vw, 2.55rem);
      line-height: 1.08;
    }

    .auth-form > p {
      color: color-mix(in srgb, var(--text-main) 68%, var(--muted));
      font-size: .98rem;
      line-height: 1.55;
    }

    .auth-form label {
      gap: 8px;
      margin-block: 17px;
      color: var(--text-main);
      font-size: .9rem;
      font-weight: 780;
    }

    .auth-form input {
      min-height: 50px;
      border-radius: 9px;
      padding-inline: 14px;
      color: var(--text-main);
      font-size: 1rem;
    }

    .auth-form input::placeholder {
      color: color-mix(in srgb, var(--muted) 82%, transparent);
      opacity: 1;
    }

    .auth-form label small {
      color: var(--muted);
      font-size: .8rem;
      line-height: 1.45;
      font-weight: 520;
    }

    .auth-form .button {
      min-height: 48px;
      font-size: .92rem;
    }

    .center-link,
    .auth-switch {
      font-size: .88rem;
      line-height: 1.45;
    }

    .center-link {
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Cards, estabelecimentos e cesta */
    .visual-product-name {
      font-size: 1rem;
    }

    .visual-store,
    .store-card strong {
      font-size: .88rem;
    }

    .store-card small,
    .mini-trend,
    .table-footer {
      font-size: .78rem;
      line-height: 1.4;
    }

    .store-card strong,
    .result-market b,
    .market-cell strong {
      color: var(--blue);
      font-weight: 820;
    }

    .builder-head p,
    .basket-items small,
    .coverage small,
    .route-stop small,
    .saving-box small,
    .summary-total small {
      font-size: .76rem;
      line-height: 1.4;
    }

    .basket-items b,
    .route-stop b,
    .saving-box b,
    .summary-total span {
      font-size: .84rem;
    }

    /* Painéis operacionais e administrativos: densos, porém legíveis */
    .admin-sidebar nav a {
      min-height: 40px;
      font-size: .82rem;
      line-height: 1.3;
    }

    .admin-sidebar nav > span,
    .admin-back {
      font-size: .72rem;
    }

    .admin-main > header small {
      font-size: .76rem;
    }

    .admin-main > header h1 {
      font-size: 1.7rem;
    }

    .admin-kpis article > span,
    .admin-kpis small,
    .admin-card-head p,
    .admin-card-foot {
      font-size: .76rem;
      line-height: 1.4;
    }

    .admin-card-head h2 {
      font-size: 1.08rem;
    }

    .admin-card-head .button,
    .admin-filters input,
    .admin-filters > button {
      font-size: .8rem;
    }

    .admin-filters label,
    .admin-filters > button {
      min-height: 40px;
    }

    .admin-tr {
      min-height: 48px;
      font-size: .8rem;
      line-height: 1.35;
    }

    .admin-th,
    .admin-tr small,
    .admin-tr em,
    .audit-row small {
      font-size: .72rem;
    }

    .audit-row b,
    .health-row {
      font-size: .8rem;
    }

    /* Modais e drawers */
    body:has(.admin-modal-overlay),
    body:has(.pc-modal) {
      overflow: hidden;
      overscroll-behavior: none;
    }

    .admin-modal-overlay {
      overscroll-behavior: contain;
    }

    .admin-modal-content {
      max-height: min(88dvh, 760px);
      overflow: hidden;
    }

    .admin-modal-body {
      max-height: calc(min(88dvh, 760px) - 72px);
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .admin-modal-head h3 {
      font-size: 1.15rem;
    }

    .admin-modal-body label,
    .store-form-fields label,
    .store-price-modal label {
      color: var(--text-main);
      font-size: .88rem;
      line-height: 1.35;
    }

    .admin-modal-body input,
    .store-form-fields input,
    .store-form-fields select,
    .store-price-modal input {
      min-height: 44px;
      font-size: .95rem;
    }

    /* Footer principal */
    .site-footer {
      color: rgba(255,255,255,.82);
    }

    .footer-grid > div:first-child p {
      font-size: .9rem;
      line-height: 1.55;
    }

    .footer-grid h3 {
      font-size: .82rem;
    }

    .footer-grid a {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      width: fit-content;
      font-size: .88rem;
    }

    .footer-place {
      font-size: .8rem;
    }

    .footer-bottom {
      font-size: .72rem;
      line-height: 1.45;
    }

    [data-theme="dark"] :where(.result-card, .filter-sidebar, .analytics-grid article, .auth-form, .generic-main, .basket-builder, .basket-summary) {
      color: var(--text-main);
    }

    [data-theme="dark"] .auth-form > p,
    [data-theme="dark"] .auth-form label small,
    [data-theme="dark"] .result-info > small,
    [data-theme="dark"] .result-market small,
    [data-theme="dark"] .results-head p {
      color: var(--pc-color-muted);
    }

    @media (max-width: 820px) {
      .site-header {
        min-height: 64px;
        height: 64px;
      }

      .section-heading h2 {
        line-height: 1.12;
      }

      .search-combo__input,
      input,
      select,
      textarea {
        font-size: 16px;
      }

      .auth-brand-panel {
        min-height: 280px;
      }

      .auth-form-wrap {
        padding-block: 72px 42px;
      }

      .result-card {
        min-height: 82px;
      }

      .filter-mobile {
        min-height: 44px;
        font-size: .86rem;
      }

      .admin-main {
        padding-inline: 16px;
      }
    }

    @media (max-width: 560px) {
      .hero {
        min-height: auto;
      }

      .hero-content > p,
      .section-heading p,
      .basket-plan p,
      .final-cta p {
        font-size: .95rem;
        line-height: 1.55;
      }

      .hero-trust span,
      .category-rail a,
      .visual-store,
      .table-footer,
      .budget-chips a,
      .step-card p {
        font-size: .84rem;
        line-height: 1.45;
      }

      .search-result-item__name,
      .visual-product-name,
      .result-info > a {
        font-size: .95rem;
        line-height: 1.4;
      }

      .search-result-item__meta,
      .search-result-item__store,
      .result-info > small,
      .result-info > div,
      .result-market small {
        font-size: .78rem;
      }

      .search-result-item__price,
      .result-price strong {
        font-size: 1.05rem;
        font-weight: 850;
      }

      .visual-price strong {
        font-size: 1.45rem;
        line-height: 1.1;
      }

      .category-rail a,
      .visual-product-actions .button,
      .suggestions-footer a,
      .budget-chips a {
        min-height: 44px;
      }

      .visual-product-grid,
      .store-grid,
      .category-rail {
        overscroll-behavior-inline: contain;
        scrollbar-width: none;
      }

      .visual-product-grid::-webkit-scrollbar,
      .store-grid::-webkit-scrollbar,
      .category-rail::-webkit-scrollbar {
        display: none;
      }

      .auth-form h2 {
        font-size: 2rem;
      }

      .auth-form > p {
        font-size: .94rem;
      }

      .auth-form label,
      .center-link,
      .auth-switch {
        font-size: .86rem;
      }

      .result-hero {
        border-radius: 16px;
      }

      .analytics-grid {
        gap: 8px;
      }

      .admin-kpis article > span,
      .admin-kpis small,
      .admin-tr,
      .admin-tr small,
      .admin-tr em {
        font-size: .75rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: 0.01ms;
        animation-iteration-count: 1;
        transition-duration: 0.01ms;
      }
    }
  `;

  document.head.appendChild(style);
}

export function UiUxProMaxFoundation() {
  useEffect(() => {
    installFoundationStyles();
  }, []);

  return null;
}
