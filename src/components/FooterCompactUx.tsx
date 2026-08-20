import { useEffect } from "react";

const STYLE_ID = "pc-footer-compact-ux";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-footer-compact .site-footer {
      padding-top: 16px !important;
      padding-bottom: 6px !important;
      min-height: 0 !important;
      background: #081a14 !important;
      color: #dce9e2 !important;
    }

    body.pc-footer-compact .site-footer a {
      color: #ffffff !important;
      opacity: 0.8 !important;
    }

    body.pc-footer-compact .site-footer a:hover {
      opacity: 1 !important;
      color: #a34827 !important;
    }

    body.pc-footer-compact .site-footer p {
      color: #dce9e2 !important;
      opacity: 0.9 !important;
    }

    body.pc-footer-compact .site-footer .footer-bottom {
      color: rgba(255,255,255,0.6) !important;
    }

    body.pc-footer-compact .site-footer .footer-grid {
      gap: 18px 26px !important;
      padding-top: 0 !important;
      padding-bottom: 12px !important;
      align-items: start !important;
    }

    body.pc-footer-compact .site-footer .footer-grid > div:first-child {
      max-width: 280px !important;
    }

    body.pc-footer-compact .site-footer .brand,
    body.pc-footer-compact .site-footer .brand--compact {
      display: inline-flex !important;
      width: auto !important;
      max-width: 150px !important;
      margin-bottom: 6px !important;
    }

    body.pc-footer-compact .site-footer .brand img,
    body.pc-footer-compact .site-footer .brand svg {
      width: auto !important;
      max-width: 138px !important;
      max-height: 34px !important;
      height: auto !important;
      object-fit: contain !important;
    }

    body.pc-footer-compact .site-footer .footer-grid p {
      margin: 3px 0 7px !important;
      font-size: .76rem !important;
      line-height: 1.35 !important;
      max-width: 260px !important;
    }

    body.pc-footer-compact .site-footer .footer-place {
      margin-top: 4px !important;
      font-size: .72rem !important;
    }

    body.pc-footer-compact .site-footer .footer-grid h3 {
      margin: 0 0 6px !important;
      font-size: .78rem !important;
      line-height: 1.2 !important;
    }

    body.pc-footer-compact .site-footer .footer-grid a {
      padding: 2px 0 !important;
      margin: 0 !important;
      font-size: .74rem !important;
      line-height: 1.35 !important;
    }

    body.pc-footer-compact .site-footer .footer-bottom {
      min-height: 0 !important;
      margin-top: 6px !important;
      padding-top: 6px !important;
      padding-bottom: 4px !important;
      font-size: .65rem !important;
      line-height: 1.25 !important;
      border-top-color: rgba(255,255,255,.06) !important;
    }

    @media (max-width: 820px) {
      body.pc-footer-compact .site-footer {
        padding-top: 18px !important;
      }
      body.pc-footer-compact .site-footer .footer-grid {
        gap: 14px 18px !important;
        padding-bottom: 10px !important;
      }
      body.pc-footer-compact .site-footer .brand img,
      body.pc-footer-compact .site-footer .brand svg {
        max-width: 118px !important;
        max-height: 29px !important;
      }
    }

    @media (max-width: 560px) {
      body.pc-footer-compact .site-footer {
        padding: 14px 0 calc(66px + env(safe-area-inset-bottom)) !important;
      }

      body.pc-footer-compact .site-footer .footer-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 8px 10px !important;
        padding-bottom: 8px !important;
      }

      body.pc-footer-compact .site-footer .footer-grid > div:first-child {
        grid-column: 1 / -1 !important;
        max-width: none !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 12px !important;
      }

      body.pc-footer-compact .site-footer .footer-grid > div:first-child p {
        display: none !important;
      }

      body.pc-footer-compact .site-footer .brand,
      body.pc-footer-compact .site-footer .brand--compact {
        margin: 0 !important;
        max-width: 104px !important;
      }

      body.pc-footer-compact .site-footer .brand img,
      body.pc-footer-compact .site-footer .brand svg {
        max-width: 100px !important;
        max-height: 25px !important;
      }

      body.pc-footer-compact .site-footer .footer-place {
        margin: 0 !important;
        font-size: .66rem !important;
        white-space: nowrap !important;
      }

      body.pc-footer-compact .site-footer .footer-grid h3 {
        margin-bottom: 4px !important;
        font-size: .72rem !important;
      }

      body.pc-footer-compact .site-footer .footer-grid a {
        padding: 1px 0 !important;
        font-size: .69rem !important;
        line-height: 1.28 !important;
      }

      body.pc-footer-compact .site-footer .footer-bottom {
        margin-top: 5px !important;
        padding-top: 6px !important;
        padding-bottom: 0 !important;
        font-size: .62rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function FooterCompactUx() {
  useEffect(() => {
    installStyles();
    document.body.classList.add("pc-footer-compact");
    return () => document.body.classList.remove("pc-footer-compact");
  }, []);
  return null;
}
