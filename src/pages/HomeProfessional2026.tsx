import { CSSProperties, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpen, Croissant, HeartPulse, MapPin, Menu, MessageCircle, Moon, PackageSearch, Search, ShoppingBasket, Store, Sun, UserRound, X, Scale, Sandwich } from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveCutoutImage, resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { getStoreLogoUrl } from "../data/storeLogos";
import { FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const readTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme") || window.localStorage.getItem("precocerto-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function ProductImage({ product, eager = false, preferCutout = false }: { product: Product; eager?: boolean; preferCutout?: boolean }) {
  const source = (preferCutout && resolveCutoutImage(product)) || resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  return source && !failed
    ? <img src={source} alt={product.name} width="280" height="240" loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
    : <span className="hp-product-fallback"><PackageSearch aria-hidden="true" /><small>Imagem em atualização</small></span>;
}

const sectors = [
  { label: "Mercados", detail: "Compra do mês", icon: ShoppingBasket, to: "/mercados", color: "#168458" },
  { label: "Açougues", detail: "Carnes e cortes", icon: Scale, to: "/acougues", color: "#b94b42" },
  { label: "Padarias", detail: "Pães e salgados", icon: Croissant, to: "/padarias", color: "#b07122" },
  { label: "Lanchonetes", detail: "Lanches e pizzas", icon: Sandwich, to: "/lanchonetes", color: "#d45b32" },
  { label: "Farmácias", detail: "Saúde e cuidado", icon: HeartPulse, to: "/farmacias", color: "#168095" },
  { label: "Livros locais", detail: "Cultura acreana", icon: BookOpen, to: "/livros", color: "#6c5caf" },
] as const;

export function HomeProfessional2026() {
  const navigate = useNavigate();
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
    return products.filter(product => normalize(`${product.name} ${product.brand || ""} ${product.category || ""}`).includes(term)).sort((a, b) => a.minPrice - b.minPrice).slice(0, 5);
  }, [products, query]);
  const [cycle, setCycle] = useState(() => currentCycle());
  useEffect(() => {
    const timer = window.setTimeout(() => setCycle(currentCycle()), msUntilNextCycle() + 250);
    return () => window.clearTimeout(timer);
  }, [cycle]);
  const featured = useMemo(() => buildFeatured(products, cycle, 5), [products, cycle]);
  const spotlight = featured[0];
  const searchOpen = searchFocused && query.trim().length >= 2;

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
  useEffect(() => {
    if (!searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeSearch = (event: KeyboardEvent) => { if (event.key === "Escape") setSearchFocused(false); };
    document.addEventListener("keydown", closeSearch);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeSearch);
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
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveSearchIndex(index => (index + 1) % suggestions.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveSearchIndex(index => index <= 0 ? suggestions.length - 1 : index - 1); }
    else if (event.key === "Home") { event.preventDefault(); setActiveSearchIndex(0); }
    else if (event.key === "End") { event.preventDefault(); setActiveSearchIndex(suggestions.length - 1); }
    else if (event.key === "Enter" && activeSearchIndex >= 0) {
      event.preventDefault();
      const product = suggestions[activeSearchIndex];
      setSearchFocused(false);
      navigate(`/produto/${product.slug || product.id}`);
    } else if (event.key === "Escape") { event.preventDefault(); setSearchFocused(false); setActiveSearchIndex(-1); }
  };

  return <div className="hp-home-v2">
    <header className="hp-header">
      <div className="hp-shell hp-header__inner">
        <Link className="hp-brand" to="/" aria-label="PreçoCerto, página inicial">
          <img className="hp-brand__light" src="/logo-preco-certo.svg?v=9" alt="PreçoCerto" width="142" height="36" />
          <img className="hp-brand__dark" src="/logo-preco-certo-inversa.svg?v=9" alt="PreçoCerto" width="142" height="36" />
          <small>Feijó · Acre</small>
        </Link>
        <nav id="hp-main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link><Link to="/explorar" onClick={() => setMenuOpen(false)}>Onde comprar</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link><Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}>Cesta inteligente</Link>
        </nav>
        <div className="hp-header__actions">
          <button className="hp-theme" type="button" onClick={() => setTheme(value => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun /> : <Moon />}<span>{theme === "dark" ? "Claro" : "Escuro"}</span></button>
          <Link className="hp-login" to="/login">Entrar</Link>
          <button ref={menuButtonRef} className="hp-menu" type="button" aria-expanded={menuOpen} aria-controls="hp-main-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      {searchOpen && <button className="hp-search-scrim" type="button" onClick={() => setSearchFocused(false)} aria-label="Fechar resultados da pesquisa" />}
      <section className="hp-hero" onPointerDown={event => { if (searchOpen && !(event.target as HTMLElement).closest(".hp-search")) setSearchFocused(false); }}>
        <div className="hp-shell hp-hero__layout">
          <div className="hp-hero__copy">
            <span className="hp-eyebrow"><MapPin /> Inteligência de preços em Feijó</span>
            <h1>O preço certo.<br /><em>Perto de você.</em></h1>
            <p>Compare produtos e estabelecimentos locais antes de sair de casa. Informação clara para comprar com mais confiança.</p>
            <form className="hp-search" role="search" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)}>
              <Search aria-hidden="true" /><label className="sr-only" htmlFor="hp-search-input">Buscar produto, marca ou categoria</label>
              <input id="hp-search-input" value={query} onChange={event => { setQuery(event.target.value); setActiveSearchIndex(-1); }} onKeyDown={handleSearchKeyDown} placeholder="Busque arroz, café, leite…" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="hp-search-results" aria-activedescendant={activeSearchIndex >= 0 ? `hp-search-result-${activeSearchIndex}` : undefined} />
              {query && <button className="hp-search__clear" type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}
              <button className="hp-search__submit" type="submit">Comparar <ArrowRight /></button>
              {searchOpen && <div id="hp-search-results" className="hp-search-results" role="listbox">
                <header><strong>Resultados rápidos</strong><span aria-live="polite">{suggestions.length} encontrados</span></header>
                {suggestions.length ? suggestions.map((product, index) => {
                  const store = product.establishment || "Comércio local";
                  const logo = getStoreLogoUrl(store);
                  return <button id={`hp-search-result-${index}`} type="button" key={product.id} role="option" aria-selected={activeSearchIndex === index} className={activeSearchIndex === index ? "is-keyboard-active" : undefined} onMouseEnter={() => setActiveSearchIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/produto/${product.slug || product.id}`)}>
                    <i><ProductImage product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{logo ? <img src={logo} alt="" aria-hidden="true" loading="lazy" /> : <Store />}{store}</em></span><b>{brl.format(product.minPrice)}</b><ArrowRight />
                  </button>;
                }) : <div className="hp-search-results__empty"><PackageSearch /><span><strong>Nenhum resultado</strong><small>Tente uma palavra mais curta, como “arroz”.</small></span></div>}
                <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Abrir busca completa <ArrowRight /></Link>
              </div>}
            </form>
            <div className="hp-quick-searches"><span>Mais buscados</span>{["Arroz", "Café", "Leite", "Limpeza"].map(item => <Link key={item} to={`/buscar?q=${item.toLowerCase()}`}>{item}</Link>)}</div>
          </div>

          <div className="hp-hero__visual">
            <div className="hp-hero__photo" role="img" aria-label="Cliente pesquisando preços em um mercado local" />
            <aside className="hp-spotlight" aria-label="Preço em destaque">
              <header><span><i /> Radar de preços</span><small>Atualização local</small></header>
              {loading ? <div className="hp-spotlight__loading" aria-busy="true"><i /><i /><i /></div> : spotlight ? <>
                <div className="hp-spotlight__product"><div><ProductImage product={spotlight} eager preferCutout /></div><span><small>{spotlight.category}</small><strong>{spotlight.name}</strong><em>{spotlight.size || spotlight.brand}</em></span></div>
                <div className="hp-spotlight__price"><span><small>A partir de</small><strong>{brl.format(spotlight.minPrice)}</strong></span><span><small>Economia possível</small><b>{brl.format(Math.max(0, spotlight.maxPrice - spotlight.minPrice))}</b></span></div>
                <Link to={`/produto/${spotlight.slug || spotlight.id}`}>Ver comparação <ArrowRight /></Link>
              </> : <div className="hp-spotlight__empty">Novos preços serão exibidos aqui.</div>}
            </aside>
          </div>
        </div>
        <div className="hp-shell hp-trust"><span><BadgeCheck /> Dados do comércio local</span><dl><div><dt>{compact.format(catalog.metrics.products)}+</dt><dd>produtos</dd></div><div><dt>{compact.format(catalog.metrics.prices)}+</dt><dd>preços</dd></div><div><dt>{catalog.metrics.stores}+</dt><dd>estabelecimentos</dd></div></dl></div>
      </section>

      <section className="hp-sectors hp-shell" aria-labelledby="hp-sectors-title">
        <div className="hp-section-head"><div><span>Explore Feijó</span><h2 id="hp-sectors-title">Comércio local, organizado.</h2><p>Vá direto ao tipo de estabelecimento que você procura.</p></div><Link to="/explorar">Ver todas as categorias <ArrowRight /></Link></div>
        <div className="hp-sector-grid">{sectors.map(({ label, detail, icon: Icon, to, color }) => <Link to={to} key={label} style={{ "--sector-accent": color } as CSSProperties}><i><Icon /></i><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="hp-offers" aria-labelledby="hp-offers-title"><div className="hp-shell">
        <div className="hp-section-head"><div><span>Oportunidades do catálogo</span><h2 id="hp-offers-title">Preços para comparar agora.</h2><p>Uma seleção rotativa de produtos disponíveis no comércio local.</p></div><Link to="/buscar">Explorar catálogo <ArrowRight /></Link></div>
        <div className="hp-product-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div className="hp-product-card hp-product-card--loading" key={index} aria-hidden="true" />) : featured.slice(0, 4).map((product, index) => <article className={`hp-product-card${index === 0 ? " hp-product-card--feature" : ""}`} key={product.id}><Link to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}><div className="hp-product-card__media"><span>{index === 0 ? "Escolha do dia" : product.category}</span><ProductImage product={product} preferCutout /></div><div className="hp-product-card__body"><small>{product.category}</small><h3>{product.name}</h3><p>{product.size || product.brand || "Produto local"}</p><div><span><small>A partir de</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight /></div></div></Link></article>)}</div>
      </div></section>

      <section className="hp-guide hp-shell" aria-labelledby="hp-guide-title"><div className="hp-guide__image" aria-hidden="true" /><div className="hp-guide__content"><span>Comprar bem pode ser simples</span><h2 id="hp-guide-title">Da pesquisa à escolha em três passos.</h2><ol><li><b>01</b><div><strong>Pesquise</strong><small>Digite o produto ou a marca.</small></div></li><li><b>02</b><div><strong>Compare</strong><small>Veja preços e estabelecimentos.</small></div></li><li><b>03</b><div><strong>Escolha</strong><small>Decida o que faz sentido para você.</small></div></li></ol><Link to="/buscar">Começar uma comparação <ArrowRight /></Link></div></section>
      <section className="hp-business hp-shell"><div><span>Para quem vende em Feijó</span><h2>Seu negócio também pode estar aqui.</h2><p>Mostre seus produtos para consumidores que já estão procurando onde comprar.</p></div><div><Link className="hp-business__primary" to="/lojista">Cadastrar meu negócio <ArrowRight /></Link><Link to="/estabelecimentos">Conhecer os parceiros</Link></div></section>
    </main>

    <footer className="hp-footer"><div className="hp-shell hp-footer__inner"><div className="hp-footer__identity"><Link className="hp-brand" to="/"><img src="/logo-preco-certo-inversa.svg?v=9" alt="PreçoCerto" width="138" height="35" /></Link><p>Compare o comércio de Feijó antes de sair de casa.</p><div><button type="button" onClick={() => setFooterPanel("contato")}><MessageCircle /> Contato</button><button type="button" onClick={() => setFooterPanel("desenvolvedor")}><UserRound /> Desenvolvedor</button></div></div><nav aria-label="Links do rodapé"><div><strong>Plataforma</strong><Link to="/buscar">Comparar preços</Link><Link to="/explorar">Onde comprar</Link><Link to="/cesta-basica">Minha cesta</Link></div><div><strong>Negócios</strong><Link to="/lojista">Seja parceiro</Link><Link to="/painel-lojista">Painel lojista</Link><Link to="/estabelecimentos">Estabelecimentos</Link></div><div><strong>Ajuda</strong><Link to="/fale-conosco">Fale conosco</Link><Link to="/colaborar">Colaborar</Link><Link to="/meus-pedidos">Meus pedidos</Link></div></nav></div><div className="hp-shell hp-footer__meta"><span><BadgeCheck /> Preços locais verificados</span><small>© 2026 PreçoCerto · Feijó, AC <i>dev. &lt;FrancD&apos;nis&gt;</i></small></div></footer>
    <FooterInfoDialogs open={footerPanel} onClose={() => setFooterPanel(null)} />
    <nav className="hp-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-basica"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Lojas</span></Link></nav>
  </div>;
}
