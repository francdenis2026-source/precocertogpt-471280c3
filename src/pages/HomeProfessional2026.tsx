import { CSSProperties, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BadgeCheck, BookOpen, Croissant, HeartPulse, MapPin, MessageCircle, Menu, Moon, PackageSearch, Sandwich, Scale, Search, ShoppingBasket, Store, Sun, UserRound, X } from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { primarySectors } from "../reference/MarketplaceSectors";
import { prefetchSectorCatalog } from "../data/sectorCatalog";
import { resolveProductImage, resolveCutoutImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { getStoreLogoUrl } from "../data/storeLogos";
import { FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import "./HomeProfessional2026.css";
import "./HomeRebuildAcai2026.css";
import "./HomeRefineAcai2026.css";
import "./HomePolishAcai2026.css";
import "./HomeLighter2026.css";
import "./HomeSearchOverlay2026.css";
import "./HomeMobileFixes2026.css";
import "./HomeTasteSystem2026.css";

gsap.registerPlugin(ScrollTrigger);

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const readTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme") || window.localStorage.getItem("precocerto-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function ProductImage({ product, eager = false, preferCutout = false }: { product: Product; eager?: boolean; preferCutout?: boolean }) {
  // A vitrine da homepage pede a foto sem fundo branco, porque o cartão tem
  // moldura colorida; as demais telas continuam com a foto de cadastro.
  const source = (preferCutout && resolveCutoutImage(product)) || resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  return source && !failed
    ? <img src={source} alt={product.name} width="240" height="200" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
    : <span className="hp-product-fallback"><PackageSearch aria-hidden="true" /><small>Imagem em atualização</small></span>;
}

// Cada setor recebe uma cor de acento própria, para que a grade deixe de ser
// um bloco monocromático e o usuário reconheça a categoria de relance.
// "Açougues" apontava para /buscar?q=carne porque não existia página de
// açougue — uma busca por palavra não é a mesma coisa que a lista dos
// açougues da cidade, e era parte da confusão de não se achar esse comércio
// no site. Agora cada item leva à página da própria categoria.
const sectors = [
  { label: "Mercados", detail: "Compras do mês", icon: ShoppingBasket, to: "/mercados", color: "#2f9e58" },
  { label: "Açougues", detail: "Carnes e cortes", icon: Scale, to: "/acougues", color: "#d1483f" },
  { label: "Padarias", detail: "Pão e salgados", icon: Croissant, to: "/padarias", color: "#b45309" },
  { label: "Lanchonetes", detail: "Lanche e pizza", icon: Sandwich, to: "/lanchonetes", color: "#e0672a" },
  { label: "Farmácias", detail: "Saúde e cuidado", icon: HeartPulse, to: "/farmacias", color: "#0f9ba6" },
  { label: "Livros locais", detail: "Cultura de Feijó", icon: BookOpen, to: "/livros", color: "#7259c7" },
] as const;

export function HomeProfessional2026() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("precocerto-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then(value => { if (active) setCatalog(value); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const products = useMemo(() => catalog.products.filter(product => product.minPrice > 0), [catalog.products]);
  const suggestions = useMemo(() => {
    const term = normalize(query);
    if (term.length < 2) return [];
    return products.filter(product => normalize(`${product.name} ${product.brand || ""} ${product.category || ""}`).includes(term))
      .sort((a, b) => a.minPrice - b.minPrice).slice(0, 5);
  }, [products, query]);
  // A vitrine troca a cada 30 minutos. O relógio agenda apenas a virada, em vez
  // de acordar de minuto em minuto sem nada a fazer.
  const [cycle, setCycle] = useState(() => currentCycle());
  useEffect(() => {
    const timer = window.setTimeout(() => setCycle(currentCycle()), msUntilNextCycle() + 250);
    return () => window.clearTimeout(timer);
  }, [cycle]);

  const featured = useMemo(() => buildFeatured(products, cycle, 6), [products, cycle]);
  const spotlight = featured[0];

  const searchOpen = searchFocused && query.trim().length >= 2;

  useEffect(() => setActiveSearchIndex(-1), [query]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener("keydown", closeMenu);
    return () => document.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);

  // Com a busca aberta a página atrás não rola: o overlay fica sobre ela e
  // rolar o fundo enquanto se lê os resultados desorienta. A largura da barra
  // de rolagem é compensada para o conteúdo não saltar ao travar.
  useEffect(() => {
    if (!searchOpen) return;
    const { body } = document;
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const overflowAnterior = body.style.overflow;
    const paddingAnterior = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (larguraBarra > 0) body.style.paddingRight = `${larguraBarra}px`;
    const fecharNoEsc = (event: KeyboardEvent) => { if (event.key === "Escape") setSearchFocused(false); };
    document.addEventListener("keydown", fecharNoEsc);
    return () => {
      body.style.overflow = overflowAnterior;
      body.style.paddingRight = paddingAnterior;
      document.removeEventListener("keydown", fecharNoEsc);
    };
  }, [searchOpen]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar");
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || !suggestions.length) {
      if (event.key === "Escape") setSearchFocused(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchIndex(index => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchIndex(index => index <= 0 ? suggestions.length - 1 : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveSearchIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveSearchIndex(suggestions.length - 1);
    } else if (event.key === "Enter" && activeSearchIndex >= 0) {
      event.preventDefault();
      const product = suggestions[activeSearchIndex];
      setSearchFocused(false);
      navigate(`/produto/${product.slug || product.id}`);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSearchFocused(false);
      setActiveSearchIndex(-1);
    }
  };

  // A home era a única página "viva" do site sem nenhum movimento: tudo
  // aparecia de uma vez, sem transição, mesmo as páginas de estabelecimento
  // e da Kelly/Sanduba já tendo esse tratamento (mesmo padrão usado aqui).
  // Diferente daquelas páginas, a hero e as seções da home já existem no DOM
  // desde a primeira renderização (só os cartões de produto trocam de
  // esqueleto pro conteúdo real depois — mesma classe nos dois estados,
  // então a revelação por rolagem funciona igual pra ambos) — por isso roda
  // uma única vez no mount, sem depender do carregamento do catálogo.
  // Entrada em cascata no que já está visível ao abrir (hero e destaque de
  // preço) e revelação ao rolar para o restante das seções, cada uma uma
  // única vez (once: true — não fica reanimando ao rolar pra cima e pra
  // baixo). Só transform/opacity, e nada roda se o usuário pedir menos
  // movimento.
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".hp-eyebrow, .hp-hero__copy h1, .hp-hero__copy>p, .hp-search", { y: 16, opacity: 0, duration: .6, stagger: .07, ease: "power3.out" });
    gsap.from(".hp-spotlight", { y: 16, opacity: 0, duration: .6, delay: .15, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".hp-sectors, .hp-offers, .hp-story, .hp-local").forEach((section) => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 85%", once: true }, y: 24, opacity: 0, duration: .55, ease: "power2.out" });
    });
    gsap.utils.toArray<HTMLElement>([".hp-sector-grid", ".hp-product-grid"]).forEach((grid) => {
      gsap.from(grid.children, { scrollTrigger: { trigger: grid, start: "top 85%", once: true }, y: 18, opacity: 0, duration: .5, stagger: .06, ease: "power2.out" });
    });
  }, { scope: pageRef });

  return <div className="hp-home" ref={pageRef}>
    <FestivalAcaiBar />
    <header className="hp-header">
      <div className="hp-shell hp-header__inner">
        <Link className="hp-brand" to="/" aria-label="PreçoCerto, página inicial">
          <img className="hp-brand__light" src="/logo-preco-certo.svg" alt="PreçoCerto" width="142" height="36" />
          <img className="hp-brand__dark" src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" width="142" height="36" />
          <small>FEIJÓ · ACRE</small>
        </Link>
        <nav id="hp-main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          <Link to="/explorar" onClick={() => setMenuOpen(false)}>Onde comprar</Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link>
          <Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}>Cesta inteligente</Link>
          <Link to="/cesta-basica" onClick={() => setMenuOpen(false)}>Minha cesta</Link>
        </nav>
        <div className="hp-header__actions">
          <button className="hp-theme" type="button" onClick={() => setTheme(value => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span>{theme === "dark" ? "Claro" : "Escuro"}</span>
          </button>
          <Link className="hp-login" to="/login">Entrar</Link>
          <button ref={menuButtonRef} className="hp-menu" type="button" aria-expanded={menuOpen} aria-controls="hp-main-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      {searchOpen && <div className="hp-search-scrim" onMouseDown={() => setSearchFocused(false)} aria-hidden="true" />}

      <section className={`hp-hero${searchOpen ? " is-searching" : ""}`} onPointerDown={event => {
        if (searchOpen && !(event.target as HTMLElement).closest(".hp-search")) setSearchFocused(false);
      }}>
        <div className="hp-hero__media" aria-hidden="true" />
        <div className="hp-hero__veil" aria-hidden="true" />
        <div className="hp-shell hp-hero__grid">
          <div className="hp-hero__copy">
            <span className="hp-eyebrow"><MapPin /> COMÉRCIO LOCAL · FEIJÓ</span>
            <h1>Seu dinheiro vai<br /><em>mais longe.</em></h1>
            <p>Compare preços reais do comércio de Feijó e descubra onde cada produto custa menos, antes de sair de casa.</p>
            <form className="hp-search" role="search" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)}>
              <Search aria-hidden="true" />
              <label className="sr-only" htmlFor="hp-search-input">Buscar produto, marca ou categoria</label>
              <input id="hp-search-input" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder="O que você quer economizar hoje?…" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="hp-search-results" aria-activedescendant={activeSearchIndex >= 0 ? `hp-search-result-${activeSearchIndex}` : undefined} />
              {query && <button className="hp-search__clear" type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}
              <button className="hp-search__submit pc-btn" type="submit">Comparar <ArrowRight /></button>
              {searchOpen && <div id="hp-search-results" className="hp-search-results" role="listbox">
                <header><strong>Resultados rápidos</strong><span aria-live="polite">{suggestions.length} encontrados</span></header>
                {suggestions.length ? suggestions.map((product, index) => {
                  const loja = product.establishment || "Comércio local";
                  const logo = getStoreLogoUrl(loja);
                  return <button id={`hp-search-result-${index}`} type="button" key={product.id} role="option" aria-selected={activeSearchIndex === index} className={activeSearchIndex === index ? "is-keyboard-active" : undefined} onMouseEnter={() => setActiveSearchIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/produto/${product.slug || product.id}`)}>
                    <i><ProductImage product={product} /></i>
                    <span>
                      <small>{product.category}</small>
                      <strong>{product.name}</strong>
                      {/* O estabelecimento é o que o usuário precisa reconhecer:
                          saber onde o preço está vale tanto quanto o preço. */}
                      <em className="hp-result-store">
                        {logo
                          ? <img src={logo} alt="" aria-hidden="true" loading="lazy" />
                          : <Store aria-hidden="true" />}
                        {loja}
                      </em>
                    </span>
                    <b>{brl.format(product.minPrice)}</b><ArrowRight />
                  </button>;
                }) : <div className="hp-search-results__empty"><PackageSearch /><span><strong>Produto não encontrado</strong><small>Tente uma palavra mais curta, como “arroz” ou “leite”.</small></span></div>}
                <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight /></Link>
              </div>}
            </form>

            {/* Atalhos logo abaixo da busca. Uma barra de pesquisa vazia não
                diz o que existe para procurar — quem chega pela primeira vez
                não sabe se o site tem açougue, padaria ou só supermercado.
                Estes atalhos respondem isso na primeira tela, sem exigir que
                a pessoa role a página até a lista de categorias nem adivinhe
                uma palavra de busca. */}
            <nav className="hp-quickcats" aria-label="Onde comprar">
              {primarySectors.map(sector => (
                <Link key={sector.id} to={sector.href} onPointerEnter={prefetchSectorCatalog} onFocus={prefetchSectorCatalog}>
                  <sector.icon aria-hidden="true" />
                  {sector.shortLabel}
                </Link>
              ))}
              <Link className="hp-quickcats__all" to="/explorar">Ver tudo <ArrowRight aria-hidden="true" /></Link>
            </nav>
          </div>

          <aside className="hp-spotlight" aria-label="Destaque de preço">
            <header><span>PREÇO EM DESTAQUE</span><small>Catálogo local</small></header>
            {loading ? <div className="hp-spotlight__loading" aria-busy="true"><i /><i /><i /></div> : spotlight ? <>
              <div className="hp-spotlight__product"><div><ProductImage product={spotlight} eager preferCutout /></div><span><small>{spotlight.category}</small><strong>{spotlight.name}</strong><em>{spotlight.size || spotlight.brand}</em></span></div>
              <div className="hp-spotlight__prices"><span><small>Menor preço</small><strong>{brl.format(spotlight.minPrice)}</strong></span><span><small>Diferença possível</small><strong>{brl.format(Math.max(0, spotlight.maxPrice - spotlight.minPrice))}</strong></span></div>
              <Link to={`/produto/${spotlight.slug || spotlight.id}`}>Comparar preços <ArrowRight /></Link>
            </> : <div className="hp-spotlight__empty">Novos preços serão exibidos aqui.</div>}
          </aside>
        </div>
        <div className="hp-shell hp-quick-searches"><span>Buscas rápidas:</span>{["Arroz", "Café", "Leite", "Limpeza"].map(item => <Link key={item} to={`/buscar?q=${item.toLowerCase()}`}>{item}</Link>)}</div>
      </section>

      <section className="hp-sectors hp-shell" aria-labelledby="hp-sectors-title">
        <div className="hp-section-head"><div><span>COMÉRCIO POR CATEGORIA</span><h2 id="hp-sectors-title">Onde comprar em Feijó.</h2><p>Encontre rapidamente o tipo de estabelecimento que você precisa.</p></div><Link to="/explorar">Ver todas as categorias <ArrowRight /></Link></div>
        <div className="hp-sector-grid">{sectors.map(({ label, detail, icon: Icon, to, color }, index) => <Link to={to} key={label} className={index === 0 ? "hp-sector-grid__lead" : undefined} style={{ "--sector-accent": color } as CSSProperties}><i><Icon /></i><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="hp-offers hp-shell" aria-labelledby="hp-offers-title">
        <div className="hp-section-head"><div><span>OPORTUNIDADES LOCAIS</span><h2 id="hp-offers-title">Produtos para comparar agora.</h2><p>Uma seleção compacta com preços disponíveis no catálogo.</p></div><Link to="/buscar">Explorar preços <ArrowRight /></Link></div>
        <div className="hp-product-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div className="hp-product-card hp-product-card--loading" key={index} />) : featured.slice(0, 4).map(product => <article className="hp-product-card" key={product.id}>
          <Link to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}>
            <div className="hp-product-card__media"><ProductImage product={product} preferCutout /></div>
            <div className="hp-product-card__body"><small>{product.category}</small><h3>{product.name}</h3><p>{product.size || product.brand || "Produto local"}</p><div><span><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight /></div></div>
          </Link>
        </article>)}</div>
      </section>

      <section className="hp-story">
        <div className="hp-story__media" aria-hidden="true" />
        <div className="hp-shell hp-story__content"><span>COMO FUNCIONA</span><h2>Da pesquisa à escolha,<br />sem complicação.</h2><p>Busque o produto, veja as opções disponíveis e escolha o comércio que faz mais sentido para sua compra.</p><ol><li><b>01</b><span><strong>Pesquise</strong><small>Digite o produto ou a marca.</small></span></li><li><b>02</b><span><strong>Compare</strong><small>Veja preços e estabelecimentos.</small></span></li><li><b>03</b><span><strong>Economize</strong><small>Escolha com mais informação.</small></span></li></ol><Link className="pc-btn" to="/buscar">Comparar preços <ArrowRight /></Link></div>
      </section>

      <section className="hp-local hp-shell">
        <div className="hp-local__copy"><h2>O comércio de Feijó, um por um.</h2><p>Veja quem já está no PreçoCerto ou cadastre seu negócio em poucos minutos.</p></div>
        <div className="hp-local__media" aria-hidden="true" /><div className="hp-local__actions"><Link className="pc-btn" to="/estabelecimentos">Ver estabelecimentos <ArrowRight /></Link><Link className="pc-btn" to="/lojista">Cadastrar meu negócio <ArrowRight /></Link></div>
      </section>
    </main>

    <footer className="hp-footer">
      <div className="hp-shell hp-footer__inner">
        <div className="hp-footer__identity">
          <Link className="hp-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" width="130" height="33" /></Link>
          <p>O preço certo perto de você. Compare o comércio de Feijó antes de sair de casa.</p>
          <div className="hp-footer__panel-triggers">
            <button type="button" onClick={() => setFooterPanel("contato")}><MessageCircle aria-hidden="true" /> Contato</button>
            <button type="button" onClick={() => setFooterPanel("desenvolvedor")}><UserRound aria-hidden="true" /> Desenvolvedor</button>
          </div>
        </div>
        <nav aria-label="Links do rodapé" className="hp-footer__nav">
          <div>
            <strong>Plataforma</strong>
            <Link to="/buscar">Comparar preços</Link>
            <Link to="/explorar">Onde comprar</Link>
            <Link to="/estabelecimentos">Estabelecimentos locais</Link>
            <Link to="/cesta-basica">Lista de compras</Link>
          </div>
          <div>
            <strong>Negócios</strong>
            <Link to="/lojista">Seja um parceiro</Link>
            <Link to="/quero-vender">Quero vender</Link>
            <Link to="/painel-lojista">Painel lojista</Link>
          </div>
          <div>
            <strong>Suporte</strong>
            <Link to="/fale-conosco">Fale conosco</Link>
            <Link to="/colaborar">Colaborar</Link>
            <Link to="/meus-pedidos">Rastrear pedido</Link>
          </div>
        </nav>
      </div>
      <div className="hp-shell hp-footer__meta">
        <span><BadgeCheck aria-hidden="true" /> Preços locais verificados</span>
        <small>&copy; 2026 PreçoCerto · Feijó, AC <i className="hp-footer__dev">dev. &lt;FrancD'nis&gt;</i></small>
      </div>
    </footer>
    <FooterInfoDialogs open={footerPanel} onClose={() => setFooterPanel(null)} />
    <nav className="hp-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-basica"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Estabelecimentos</span></Link></nav>
  </div>;
}
