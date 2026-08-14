import { useEffect } from "react";

function applyHomepageAuditFixes() {
  const home = document.querySelector<HTMLElement>(".pc-home");
  const main = home?.querySelector<HTMLElement>("main#pc-content");
  if (!home || !main) return false;

  home.classList.add("pc-audit-polished");

  // Legacy promotional content is not part of the current homepage experience.
  main.querySelector(".pc-dynamic-ad")?.remove();

  // Align DOM/focus order with the visible reading order.
  const hero = main.querySelector<HTMLElement>(".pc-hero");
  const services = main.querySelector<HTMLElement>(".pc-services-strip");
  if (hero && services && (hero.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_PRECEDING)) {
    main.insertBefore(hero, services);
  }

  // Small Web Interface Guidelines fixes that are safe to enforce at runtime.
  const search = home.querySelector<HTMLInputElement>("#pc-home-search");
  if (search) search.placeholder = "Busque arroz, café, carne, leite…";

  home.querySelectorAll<HTMLImageElement>(".pc-logo img, .pc-footer-brand img").forEach((img) => {
    if (!img.width) img.width = 158;
    if (!img.height) img.height = 38;
  });

  return true;
}

export function HomepageAuditFixes() {
  useEffect(() => {
    let frame = 0;
    let attempts = 0;

    const run = () => {
      attempts += 1;
      if (applyHomepageAuditFixes() || attempts >= 6) return;
      frame = window.requestAnimationFrame(run);
    };

    frame = window.requestAnimationFrame(run);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
