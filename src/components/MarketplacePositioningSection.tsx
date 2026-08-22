import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-marketplace-positioning-v1";
const SECTION_ID = "pc-marketplace-positioning";

const niches = [
  ["Mercados", "Compare preços e compre onde a venda online estiver ativa."],
  ["Pizzarias", "Tamanhos, sabores, bordas, adicionais, retirada e delivery."],
  ["Lanchonetes", "Combos, personalização, preparo rápido e acompanhamento."],
  ["Padarias", "Produtos, encomendas, itens por peso e pedidos agendados."],
  ["Farmácias", "Catálogo, comparação e fluxos de análise quando necessários."],
  ["Restaurantes", "Cardápio, adicionais, retirada, entrega e operação de cozinha."],
  ["Pet shops", "Produtos, variações e serviços locais em um só ambiente."],
  ["Serviços locais", "Solicitações e agendamentos conectados ao comércio da cidade."],
];

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${SECTION_ID}{background:linear-gradient(180deg,#f8fbf9 0%,#eef6f1 100%);color:#112019;border-top:1px solid rgba(15,23,42,.07);border-bottom:1px solid rgba(15,23,42,.07);padding:30px 20px}
    #${SECTION_ID} *{box-sizing:border-box}
    #${SECTION_ID} .pc-mp-wrap{max-width:1240px;margin:0 auto}
    #${SECTION_ID} .pc-mp-intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,1fr);gap:24px;align-items:center;margin-bottom:14px}
    #${SECTION_ID} .pc-mp-brand{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;background:#dff5e6;color:#14532d;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:16px}
    #${SECTION_ID} .pc-mp-brand i{width:7px;height:7px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 5px rgba(22,163,74,.11)}
    #${SECTION_ID} h2{font-size:clamp(1.65rem,2.7vw,2.55rem);line-height:1.02;letter-spacing:-.045em;margin:0;color:#10271a;max-width:680px}
    #${SECTION_ID} h2 strong{color:#168343;font-weight:900}
    #${SECTION_ID} .pc-mp-lead{font-size:.82rem;line-height:1.5;color:#536259;margin:0;max-width:560px}
    #${SECTION_ID} .pc-mp-slogan{margin-top:7px;font-weight:850;color:#173b27;font-size:.82rem}
    #${SECTION_ID} .pc-mp-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:8px;border-radius:14px;background:#10271a;color:white;margin:12px 0 10px}
    #${SECTION_ID} .pc-mp-flow div{min-height:56px;padding:9px;border-radius:9px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.075);display:flex;align-items:center;gap:7px}
    #${SECTION_ID} .pc-mp-flow b{font-size:12px;color:#86efac}
    #${SECTION_ID} .pc-mp-flow span{font-size:13px;line-height:1.3;color:#edf7f0;font-weight:750}
    #${SECTION_ID} .pc-mp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:9px 0}
    #${SECTION_ID} .pc-mp-card{padding:11px;border-radius:11px;background:#fff;border:1px solid #dfe8e2;min-height:84px;box-shadow:0 5px 16px rgba(15,35,23,.03)}
    #${SECTION_ID} .pc-mp-card strong{display:block;font-size:15px;margin-bottom:7px;color:#163a26}
    #${SECTION_ID} .pc-mp-card p{margin:0;color:#68756d;font-size:10px;line-height:1.35}
    #${SECTION_ID} .pc-mp-sides{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
    #${SECTION_ID} .pc-mp-side{padding:14px;border-radius:12px;border:1px solid #dce7df;background:white}
    #${SECTION_ID} .pc-mp-side--seller{background:#10271a;color:white;border-color:#10271a}
    #${SECTION_ID} .pc-mp-kicker{font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#168343}
    #${SECTION_ID} .pc-mp-side--seller .pc-mp-kicker{color:#86efac}
    #${SECTION_ID} h3{font-size:1.05rem;letter-spacing:-.025em;margin:4px 0 5px}
    #${SECTION_ID} .pc-mp-side p{font-size:10.5px;line-height:1.4;color:#647168;margin:0 0 9px}
    #${SECTION_ID} .pc-mp-side--seller p{color:#c7d6cd}
    #${SECTION_ID} .pc-mp-actions{display:flex;flex-wrap:wrap;gap:8px}
    #${SECTION_ID} .pc-mp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 11px;border-radius:8px;text-decoration:none;font-size:10.5px;font-weight:850;border:1px solid #183d2b}
    #${SECTION_ID} .pc-mp-btn--primary{background:#183d2b;color:white}
    #${SECTION_ID} .pc-mp-btn--light{background:#22c55e;color:#082d17;border-color:#22c55e}
    #${SECTION_ID} .pc-mp-btn--ghost{background:transparent;color:#183d2b}
    #${SECTION_ID} .pc-mp-side--seller .pc-mp-btn--ghost{color:white;border-color:rgba(255,255,255,.25)}
    .pc-marketplace-descriptor{display:inline-flex!important;align-items:center;gap:7px;font-size:11px!important;font-weight:900!important;letter-spacing:.09em!important;text-transform:uppercase!important;color:#86efac!important;background:rgba(34,197,94,.10)!important;border:1px solid rgba(134,239,172,.18)!important;border-radius:999px!important;padding:7px 10px!important;margin-bottom:10px!important;width:max-content!important}
    @media(max-width:900px){#${SECTION_ID}{padding:54px 16px}#${SECTION_ID} .pc-mp-intro{grid-template-columns:1fr;gap:18px}#${SECTION_ID} .pc-mp-flow{grid-template-columns:1fr 1fr}#${SECTION_ID} .pc-mp-grid{grid-template-columns:1fr 1fr}#${SECTION_ID} .pc-mp-sides{grid-template-columns:1fr}}
    @media(max-width:560px){#${SECTION_ID} h2{font-size:2.45rem}#${SECTION_ID} .pc-mp-flow{grid-template-columns:1fr}#${SECTION_ID} .pc-mp-grid{grid-template-columns:1fr}#${SECTION_ID} .pc-mp-side{padding:19px}}
  `;
  document.head.appendChild(style);
}

function buildSection() {
  const section = document.createElement("section");
  section.id = SECTION_ID;
  section.setAttribute("aria-label", "Conheça o PreçoCerto Marketplace Local");
  section.innerHTML = `
    <div class="pc-mp-wrap">
      <div class="pc-mp-intro">
        <div>
          <div class="pc-mp-brand"><i></i> PreçoCerto · Marketplace Local</div>
          <h2>O comércio da sua cidade em uma experiência <strong>mais inteligente.</strong></h2>
        </div>
        <div>
          <p class="pc-mp-lead">O PreçoCerto reúne pesquisa, comparação de preços e compra online em um mesmo ecossistema. Você descobre onde vale mais a pena comprar e, quando o estabelecimento já opera vendas online, pode concluir o pedido pela própria plataforma.</p>
          <div class="pc-mp-slogan">Compare, escolha e compre perto de você.</div>
        </div>
      </div>
      <div class="pc-mp-flow" aria-label="Como funciona">
        <div><b>01</b><span>Pesquise o que você precisa</span></div>
        <div><b>02</b><span>Compare preços e estabelecimentos</span></div>
        <div><b>03</b><span>Escolha a melhor opção para você</span></div>
        <div><b>04</b><span>Compre online nas lojas habilitadas</span></div>
        <div><b>05</b><span>Acompanhe pagamento, preparo e entrega</span></div>
      </div>
      <div class="pc-mp-grid">
        ${niches.map(([name, description]) => `<article class="pc-mp-card"><strong>${name}</strong><p>${description}</p></article>`).join("")}
      </div>
      <div class="pc-mp-sides">
        <article class="pc-mp-side">
          <span class="pc-mp-kicker">Para quem compra</span>
          <h3>Mais informação antes de decidir.</h3>
          <p>Compare, encontre estabelecimentos próximos e veja claramente onde a compra online já está disponível. O PreçoCerto mantém preços e descoberta local úteis mesmo quando uma loja ainda não ativou o marketplace.</p>
          <div class="pc-mp-actions"><a class="pc-mp-btn pc-mp-btn--primary" href="#top">Explorar o marketplace</a><a class="pc-mp-btn pc-mp-btn--ghost" href="/meus-pedidos">Meus pedidos</a></div>
        </article>
        <article class="pc-mp-side pc-mp-side--seller">
          <span class="pc-mp-kicker">Para negócios locais</span>
          <h3>Seu negócio também pode fazer parte.</h3>
          <p>Mercados, pizzarias, lanchonetes, padarias, farmácias, restaurantes e outros negócios podem ter catálogo, pedidos, pagamentos, entregas, financeiro e operação adaptados ao próprio segmento.</p>
          <div class="pc-mp-actions"><a class="pc-mp-btn pc-mp-btn--light" href="/lojista">Quero fazer parte</a><a class="pc-mp-btn pc-mp-btn--ghost" href="/lojista">Conhecer a solução para lojistas</a></div>
        </article>
      </div>
    </div>`;
  return section;
}

function applyBrandPositioning() {
  document.title = "PreçoCerto | Marketplace Local";
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && !heroCopy.querySelector(".pc-marketplace-descriptor")) {
    const descriptor = document.createElement("div");
    descriptor.className = "pc-marketplace-descriptor";
    descriptor.textContent = "PreçoCerto · Marketplace Local";
    heroCopy.insertBefore(descriptor, heroCopy.firstChild);
  }
  if (hero) {
    const paragraph = hero.querySelector(".hero-copy > p");
    if (paragraph && !paragraph.getAttribute("data-pc-marketplace-copy")) {
      paragraph.textContent = "Pesquise, compare e encontre as melhores opções do comércio local. Quando o estabelecimento já vende online, compre pelo próprio PreçoCerto e acompanhe seu pedido.";
      paragraph.setAttribute("data-pc-marketplace-copy", "1");
    }
  }
  const target = document.querySelector(".category-rail") || hero?.nextElementSibling;
  if (!document.getElementById(SECTION_ID)) {
    const section = buildSection();
    if (target?.parentNode) target.parentNode.insertBefore(section, target.nextSibling);
    else document.querySelector("main")?.appendChild(section);
  }
}

export function MarketplacePositioningSection() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/") return;
    installStyles();
    const run = () => applyBrandPositioning();
    run();
    const observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.getElementById(SECTION_ID)?.remove();
      document.querySelector(".pc-marketplace-descriptor")?.remove();
    };
  }, [location.pathname]);
  return null;
}
