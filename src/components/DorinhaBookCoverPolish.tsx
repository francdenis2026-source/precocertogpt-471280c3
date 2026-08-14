import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BOOK_META: Record<string, string> = {
  "Mente Perversa": "Editora Autografia · 2024",
  "Uma História de Superação": "Biblioteca 24horas · 2025 · 184 páginas",
  "Uma viagem ao mundo da imaginação": "Viseu · 2024 · 164 páginas",
  "O Despertar para o Mundo Literário": "Biblioteca 24horas · 2025 · 222 páginas",
};

export function DorinhaBookCoverPolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    const active = pathname === "/autora/dorinha-barroso" || pathname === "/dorinha-barroso";
    if (!active) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let retryTimer = 0;

    const style = document.createElement("style");
    style.id = "pc-dorinha-real-book-covers";
    style.textContent = `
      .db-book{overflow:hidden!important;border:1px solid var(--pc-color-muted)!important;background:var(--pc-color-surface)!important;box-shadow:0 12px 34px rgba(42,28,30,.07)!important}
      .db-real-cover-shell{position:relative!important;display:grid!important;place-items:center!important;height:210px!important;min-height:0!important;padding:14px!important;overflow:hidden!important;background:linear-gradient(145deg,rgba(24,8,29,.82),rgba(47,19,43,.35) 58%,rgba(226,190,121,.18)),url('/dorinha-hero-editorial-v3.png') center/cover no-repeat,var(--pc-color-foreground)!important;isolation:isolate}
      .db-real-cover-shell:before{content:"";position:absolute;left:11%;right:11%;bottom:18px;height:22px;border-radius:50%;background:rgba(8,3,12,.42);filter:blur(13px);z-index:0}
      .db-real-cover-shell:after{content:none!important;display:none!important}
      .db-cover-placeholder{position:absolute;z-index:1;width:min(72%,132px);height:182px;border:1px solid rgba(245,218,165,.24);border-radius:3px 7px 7px 3px;background:linear-gradient(110deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.12) 42%,rgba(255,255,255,.05) 60%);background-size:240% 100%;box-shadow:0 13px 22px rgba(8,3,12,.22);animation:db-cover-shimmer 1.35s ease-in-out infinite;display:grid;place-items:center;padding:8px;color:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));font-size:10px;font-weight:750;letter-spacing:.03em}
      .db-real-cover-shell.is-loaded .db-cover-placeholder{opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}
      @keyframes db-cover-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
      .db-real-cover-image{position:relative;z-index:2;display:block;width:auto!important;max-width:82%!important;height:182px!important;object-fit:contain!important;object-position:center;border-radius:2px 7px 7px 2px;opacity:0;filter:drop-shadow(-4px 6px 0 rgba(16,5,19,.18)) drop-shadow(0 13px 15px rgba(8,3,12,.38));transform:none;transition:opacity .28s ease,transform .28s ease,filter .28s ease}
      .db-real-cover-shell.is-loaded .db-real-cover-image{opacity:1}
      .db-book:hover .db-real-cover-image{transform:translateY(-3px) scale(1.01);filter:drop-shadow(-4px 7px 0 rgba(54,37,34,.1)) drop-shadow(0 17px 18px rgba(45,28,28,.3))}
      .db-real-cover-badge{display:none!important}
      .db-real-cover-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:color-mix(in srgb, var(--pc-color-accent) 12%, var(--pc-color-surface));box-shadow:0 0 0 3px rgba(226,189,115,.13)}
      .db-editorial-meta{display:flex;align-items:center;min-height:28px;margin:1px 0 9px;padding-bottom:9px;border-bottom:1px solid var(--pc-color-background);color:var(--pc-color-muted);font-size:10.5px;font-weight:700;line-height:1.45;letter-spacing:.01em}
      .db-book [style*="Venda direta"]{letter-spacing:.01em}
      @media(max-width:640px){.db-real-cover-shell{height:188px!important;min-height:0!important;padding:12px!important}.db-real-cover-image{width:auto!important;max-width:72%!important;height:162px!important}}
    `;
    document.getElementById(style.id)?.remove();
    document.head.appendChild(style);

    const install = () => {
        if (cancelled) return;
        const cards = document.querySelectorAll<HTMLElement>(".db-book");
        if (!cards.length) return;

        cards.forEach((card) => {
          const title = card.querySelector("h3")?.textContent?.trim();
          if (!title) return;

          const body = card.children.item(1) as HTMLElement | null;
          if (body && !body.querySelector(".db-editorial-meta")) {
            const metadata = document.createElement("div");
            metadata.className = "db-editorial-meta";
            metadata.textContent = BOOK_META[title] || "Obra de Dorinha Barroso";
            const description = body.querySelector("p");
            if (description) body.insertBefore(metadata, description);
            else body.appendChild(metadata);
          }
        });
      };

    install();
    observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    retryTimer = window.setTimeout(install, 400);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(retryTimer);
      document.getElementById("pc-dorinha-real-book-covers")?.remove();
    };
  }, [pathname]);

  return null;
}
