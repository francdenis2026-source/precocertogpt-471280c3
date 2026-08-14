import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-basket-favorites-user-safe-polish";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-user-flow main {
      background: var(--bg);
    }

    body.pc-user-flow :is(.basket-page,.favorites-page,.profile-page,.account-page,.customer-page,.smart-basket,.basket-builder,.basket-results) {
      max-width: 1180px;
      margin-inline: auto;
    }

    body.pc-user-flow :is(.basket-page,.favorites-page,.profile-page,.account-page,.customer-page,.smart-basket,.basket-builder) h1,
    body.pc-user-flow :is(.basket-page,.favorites-page,.profile-page,.account-page,.customer-page,.smart-basket,.basket-builder) h2 {
      text-wrap: balance;
      letter-spacing: -.02em;
    }

    body.pc-user-flow :is(.basket-card,.basket-item,.favorite-card,.favorites-card,.profile-card,.account-card,.user-card,.basket-summary,.basket-plan,.optimization-card) {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(15,23,42,.05);
    }

    body.pc-user-flow :is(.basket-card,.basket-item,.favorite-card,.favorites-card,.profile-card,.account-card,.user-card,.basket-summary,.basket-plan,.optimization-card):hover {
      border-color: color-mix(in srgb, var(--green) 24%, var(--border));
    }

    body.pc-user-flow :is(.basket-total,.basket-price,.favorite-price,.summary-total,.optimization-total,.basket-saving,.savings-value) {
      font-variant-numeric: tabular-nums;
      font-weight: 850;
    }

    body.pc-user-flow :is(.basket-total,.summary-total,.optimization-total) {
      font-size: clamp(1.35rem,2vw,2rem);
      color: var(--text-main);
    }

    body.pc-user-flow :is(.basket-saving,.savings-value,.economy-value,.saving-badge) {
      color: var(--pc-color-primary);
    }

    body.pc-user-flow :is(.basket-item,.favorite-card,.favorites-card) img {
      object-fit: contain;
      background: color-mix(in srgb, var(--surface-2) 65%, transparent);
      border-radius: 12px;
    }

    body.pc-user-flow :is(.favorite-button,.favorite-toggle,[aria-label*="favorit" i],[title*="favorit" i]) {
      min-width: 44px;
      min-height: 44px;
      border-radius: 999px;
      transition: transform .18s ease, background .18s ease, border-color .18s ease;
    }

    body.pc-user-flow :is(.favorite-button,.favorite-toggle,[aria-label*="favorit" i],[title*="favorit" i]):hover {
      transform: translateY(-1px) scale(1.03);
    }

    body.pc-user-flow :is(.favorite-button,.favorite-toggle,[aria-pressed="true"],[data-favorite="true"],[data-favorited="true"]) {
      background: color-mix(in srgb, var(--pc-color-danger) 12%, var(--surface));
      border-color: color-mix(in srgb, var(--pc-color-danger) 38%, var(--border));
      color: var(--pc-color-danger);
    }

    body.pc-user-flow :is(.favorite-button,.favorite-toggle,[aria-pressed="true"],[data-favorite="true"],[data-favorited="true"]) svg {
      fill: currentColor;
      stroke: currentColor;
    }

    body.pc-user-flow :is(.basket-actions,.favorites-actions,.profile-actions,.account-actions,.basket-controls) {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    body.pc-user-flow :is(.basket-actions,.favorites-actions,.profile-actions,.account-actions,.basket-controls) :is(button,a) {
      min-height: 44px;
      font-weight: 800;
    }

    body.pc-user-flow :is(.basket-summary,.optimization-card,.basket-plan) {
      padding: clamp(18px,2vw,26px);
    }

    body.pc-user-flow :is(.basket-summary,.optimization-card,.basket-plan) hr {
      border: 0;
      border-top: 1px solid var(--border);
      margin-block: 14px;
    }

    body.pc-user-flow :is(.basket-item,.favorite-card,.favorites-card) :is(h3,strong) {
      line-height: 1.35;
      text-wrap: pretty;
    }

    body.pc-user-flow :is(.basket-item,.favorite-card,.favorites-card) :is(p,small,.muted,.meta) {
      line-height: 1.5;
    }

    body.pc-user-flow :is(input,select,textarea) {
      min-height: 44px;
    }

    body.pc-user-flow :is(.empty-state,.basket-empty,.favorites-empty,.account-empty) {
      border: 1px dashed var(--border);
      border-radius: 16px;
      padding: clamp(28px,5vw,52px) 20px;
      background: var(--surface);
      text-align: center;
    }

    @media (max-width: 760px) {
      body.pc-user-flow :is(.basket-page,.favorites-page,.profile-page,.account-page,.customer-page,.smart-basket,.basket-builder,.basket-results) {
        padding-inline: 14px !important;
      }

      body.pc-user-flow :is(.basket-grid,.favorites-grid,.profile-grid,.account-grid,.basket-results-grid) {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      body.pc-user-flow :is(.basket-item,.favorite-card,.favorites-card) {
        padding: 14px !important;
      }

      body.pc-user-flow :is(.basket-item,.favorite-card,.favorites-card) img {
        max-height: 116px;
      }

      body.pc-user-flow :is(.basket-actions,.favorites-actions,.profile-actions,.account-actions,.basket-controls) {
        flex-direction: column;
      }

      body.pc-user-flow :is(.basket-actions,.favorites-actions,.profile-actions,.account-actions,.basket-controls) :is(button,a) {
        width: 100%;
        justify-content: center;
      }

      body.pc-user-flow :is(.basket-total,.summary-total,.optimization-total) {
        font-size: 1.45rem;
      }
    }
  `;
  document.head.appendChild(style);
}

export function BasketFavoritesUserSafePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    ensureStyles();
    const userFlow = /cesta|basket|favorit|conta|perfil|cliente|meus-pedidos/i.test(pathname);
    document.body.classList.toggle("pc-user-flow", userFlow);
    return () => document.body.classList.remove("pc-user-flow");
  }, [pathname]);

  return null;
}
