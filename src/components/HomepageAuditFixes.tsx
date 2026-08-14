import { useEffect } from "react";

function applyHomepageAuditFixes() {
  const home = document.querySelector<HTMLElement>(".pc-home");
  const main = home?.querySelector<HTMLElement>("main#pc-content");
  if (!home || !main) return;

  home.classList.add("pc-audit-polished");

  // Remove the obsolete promotional block instead of merely hiding it.
  main.querySelector(".pc-dynamic-ad")?.remove();

  // Keep DOM/focus order aligned with the visible reading order.
  const hero = main.querySelector<HTMLElement>(".pc-hero");
  const services = main.querySelector<HTMLElement>(".pc-services-strip");
  if (hero && services && hero.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_PRECEDING) {
    main.insertBefore(hero, services);
  }
}

export function HomepageAuditFixes() {
  useEffect(() => {
    let frame = window.requestAnimationFrame(applyHomepageAuditFixes);
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(applyHomepageAuditFixes);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
