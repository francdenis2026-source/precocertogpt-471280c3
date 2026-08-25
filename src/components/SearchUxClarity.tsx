import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function replaceOwnText(element: Element, from: string, to: string) {
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(from)) {
      node.textContent = node.textContent.replace(from, to);
    }
  }
}

function ensureSearchPositionStyles() {
  if (document.getElementById("pc-search-position-fix")) return;
  const style = document.createElement("style");
  style.id = "pc-search-position-fix";
  style.textContent = `
    body:has(.search-command) main,
    body:has(.search-command) .app main {
      padding-top: 0 !important;
    }

    .search-command {
      margin-top: 8px !important;
      padding-top: 0 !important;
    }

    .search-command__intro {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    .search-command__intro h1 {
      margin-top: 0 !important;
    }

    @media (min-width: 761px) {
      .site-header + main .search-command,
      main .search-command:first-child {
        margin-top: 6px !important;
      }
    }

    @media (max-width: 760px) {
      .search-command {
        margin-top: 4px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function ensureSearchHelp() {
  const command = document.querySelector<HTMLElement>(".search-command");
  if (!command || document.querySelector(".search-ux-guide")) return;

  const guide = document.createElement("div");
  guide.className = "search-ux-guide";
  guide.setAttribute("role", "note");
  Object.assign(guide.style, {
    marginTop: "12px",
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--surface-2)",
    color: "var(--muted)",
    fontSize: "0.84rem",
    lineHeight: "1.45",
  });
  guide.innerHTML = "<strong style=\"color:var(--text-main)\">Como usar:</strong> pesquise o produto pelo nome. Nos resultados, veja o menor preço e os estabelecimentos. Use <strong style=\"color:var(--text-main)\">Selecionar para comparar</strong> somente quando quiser colocar itens lado a lado.";
  command.appendChild(guide);
}

function applySearchUx(pathname: string) {
  ensureSearchPositionStyles();

  document.querySelectorAll<HTMLAnchorElement>('a[href="/buscar"]').forEach(link => {
    if (link.textContent?.trim() === "Comparar preços") link.textContent = "Buscar produtos";
  });

  document.querySelectorAll<HTMLElement>(".search-combo__button-text").forEach(label => {
    if (label.textContent?.trim() === "Comparar preços") label.textContent = "Pesquisar";
  });

  document.querySelectorAll<HTMLAnchorElement>(".header-search-button").forEach(link => {
    if (link.getAttribute("aria-label") !== "Pesquisar produtos") link.setAttribute("aria-label", "Pesquisar produtos");
    if (link.getAttribute("title") !== "Pesquisar produtos") link.setAttribute("title", "Pesquisar produtos");
  });

  const heroOffer = document.querySelector<HTMLAnchorElement>('.hero-actions > a.button--white[href="/buscar"]');
  if (heroOffer) {
    heroOffer.href = "/melhores-precos";
    replaceOwnText(heroOffer, "Explorar ofertas", "Ver ofertas de hoje");
  }

  document.querySelectorAll<HTMLAnchorElement>('.visual-product-actions a[href^="/produto/"]').forEach(link => {
    if (link.textContent?.trim() === "Comparar") link.textContent = "Ver preços";
  });

  document.querySelectorAll<HTMLButtonElement>(".professional-compare-button").forEach(button => {
    const text = button.textContent?.trim();
    if (text === "Comparar") {
      for (const node of Array.from(button.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Comparar")) {
          node.textContent = node.textContent.replace("Comparar", "Selecionar para comparar");
        }
      }
    }
    if (button.getAttribute("aria-label") !== "Selecionar este produto para comparação") {
      button.setAttribute("aria-label", "Selecionar este produto para comparação");
    }
  });

  if (pathname === "/buscar") {
    const title = document.querySelector<HTMLElement>(".search-command__intro h1");
    const desiredTitle = "Encontre o produto que você procura";
    if (title && title.textContent?.trim() !== desiredTitle) title.textContent = desiredTitle;

    const intro = document.querySelector<HTMLElement>(".search-command__intro p");
    const desiredIntro = "Digite o nome do produto, encontre rapidamente os preços disponíveis em Feijó e veja onde está mais barato.";
    if (intro && intro.textContent?.trim() !== desiredIntro) intro.textContent = desiredIntro;

    ensureSearchHelp();
  }
}

export function SearchUxClarity() {
  const { pathname } = useLocation();

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      frame = 0;
      applySearchUx(pathname);
    };
    const scheduleApply = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    const root = document.getElementById("root") ?? document.body;
    const observer = new MutationObserver(scheduleApply);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
