import { CSSProperties, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpen, Croissant, HeartPulse, MapPin, Menu, Moon, PackageSearch, Search, ShoppingBasket, Store, Sun, X, Scale, Sandwich } from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveCutoutImage, resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { getStoreLogoUrl } from "../data/storeLogos";

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

function ProductImage({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveCutoutImage(product) || resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  return source && !failed
    ? <img src={source} alt={product.name} width="180" height="180" loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
    : <span className="hc-product-fallback"><PackageSearch aria-hidden="true" /><small>Sem imagem</small></span>;
}

const sectors = [
  { label: "Mercados", icon: ShoppingBasket, to: "/mercados", color: "#168fd0" },
  { label: "Açougues", icon: Scale, to: "/acougues", color: "#d2574c" },
  { label: "Padarias", icon: Croissant, to: "/padarias", color: "#c47b24" },
  { label: "Lanchonetes", icon: Sandwich, to: "/lanchonetes", color: "#e05f37" },
  { label: "Farmácias", icon: HeartPulse, to: "/farmacias", color: "#168f83" },
  { label: "Livros", icon: BookOpen, to: "/livros", color: "#7264b8" },
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
  const featured = useMemo(() => buildFeatured(products, cycle, 4), [products, cycle]);
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

  return <div className="hc-home">
    <header className="hc-header">
      <div className="hc-shell hc-header__inner">
        <Link className="hc-brand" to="/" aria-label="PreçoCerto, página inicial">
          <img className="hc-brand__light" src="/logo-preco-certo.svg?v=9" alt="PreçoCerto" width="142" height="36" />
          <img className="hc-brand__dark" src="/logo-preco-certo-inversa.svg?v=9" alt="PreçoCerto" width="142" height="36" />
        </Link>
        <nav id="hc-main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar</Link><Link to="/explorar" onClick={() => setMenuOpen(false)}>Categorias</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Lojas</Link><Link to="/cesta-basica" onClick={() => setMenuOpen(false)}>Minha cesta</Link>
        </nav>
        <div className="hc-header__actions">
          <button className="hc-theme" type="button" onClick={() => setTheme(value => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun /> : <Moon />}</button>
          <Link className="hc-login" to="/login">Entrar</Link>
          <button ref={menuButtonRef} className="hc-menu" type="button" aria-expanded={menuOpen} aria-controls="hc-main-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      {searchOpen && <button className="hc-search-scrim" type="button" onClick={() => setSearchFocused(false)} aria-label="Fechar resultados da pesquisa" />}
      <section className="hc-hero" onPointerDown={event => { if (searchOpen && !(event.target as HTMLElement).closest(".hc-search")) setSearchFocused(false); }}>
        <div className="hc-shell hc-hero__frame">
          <div className="hc-hero__copy">
            <span className="hc-eyebrow"><MapPin /> Feijó, Acre</span>
            <h1>Compare preços.<br />Compre melhor.</h1>
            <p>Encontre produtos e preços do comércio local em poucos segundos.</p>
            <form className="hc-search" role="search" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)}>
              <Search aria-hidden="true" /><label className="sr-only" htmlFor="hc-search-input">Buscar produto, marca ou categoria</label>
              <input id="hc-search-input" value={query} onChange={event => { setQuery(event.target.value); setActiveSearchIndex(-1); }} onKeyDown={handleSearchKeyDown} placeholder="O que você procura?" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="hc-search-results" aria-activedescendant={activeSearchIndex >= 0 ? `hc-search-result-${activeSearchIndex}` : undefined} />
              {query && <button className="hc-search__clear" type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}
              <button className="hc-search__submit" type="submit">Buscar <ArrowRight /></button>
              {searchOpen && <div id="hc-search-results" className="hc-search-results" role="listbox">
                <header><strong>Sugestões</strong><span aria-live="polite">{suggestions.length} resultados</span></header>
                {suggestions.length ? suggestions.map((product, index) => {
                  const store = product.establishment || "Comércio local";
                  const logo = getStoreLogoUrl(store);
                  return <button id={`hc-search-result-${index}`} type="button" key={product.id} role="option" aria-selected={activeSearchIndex === index} className={activeSearchIndex === index ? "is-active" : undefined} onMouseEnter={() => setActiveSearchIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/produto/${product.slug || product.id}`)}><i><ProductImage product={product} /></i><span><strong>{product.name}</strong><small>{logo ? <img src={logo} alt="" aria-hidden="true" loading="lazy" /> : <Store />}{store}</small></span><b>{brl.format(product.minPrice)}</b><ArrowRight /></button>;
                }) : <div className="hc-search-results__empty"><PackageSearch /><span><strong>Não encontramos esse produto</strong><small>Tente uma palavra curta, como arroz ou leite.</small></span></div>}
                <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight /></Link>
              </div>}
            </form>
            <div className="hc-quick">{["Arroz", "Café", "Leite", "Limpeza"].map(item => <Link key={item} to={`/buscar?q=${item.toLowerCase()}`}>{item}</Link>)}</div>
          </div>
          <div className="hc-hero__photo" role="img" aria-label="Cliente comparando o preço de um produto em um mercado local">
            {spotlight && !loading && <Link className="hc-price-ticket" to={`/produto/${spotlight.slug || spotlight.id}`}><span><ProductImage product={spotlight} eager /></span><div><small>Menor preço encontrado</small><strong>{brl.format(spotlight.minPrice)}</strong><em>{spotlight.name}</em></div><ArrowRight /></Link>}
          </div>
        </div>
      </section>

      <section className="hc-discovery hc-shell" aria-label="Categorias e cobertura">
        <div className="hc-sectors">{sectors.map(({ label, icon: Icon, to, color }) => <Link to={to} key={label} style={{ "--sector-color": color } as CSSProperties}><i><Icon /></i><span>{label}</span></Link>)}</div>
        <dl className="hc-metrics"><div><dt>{compact.format(catalog.metrics.products)}+</dt><dd>produtos</dd></div><div><dt>{compact.format(catalog.metrics.prices)}+</dt><dd>preços</dd></div><div><dt>{catalog.metrics.stores}+</dt><dd>lojas</dd></div></dl>
      </section>

      <section className="hc-offers hc-shell" aria-labelledby="hc-offers-title">
        <div className="hc-section-head"><div><h2 id="hc-offers-title">Preços em destaque</h2><p>Produtos selecionados do catálogo local.</p></div><Link to="/buscar">Ver catálogo <ArrowRight /></Link></div>
        <div className="hc-product-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div className="hc-product-card hc-product-card--loading" key={index} aria-hidden="true" />) : featured.map(product => <article className="hc-product-card" key={product.id}><Link to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}><div className="hc-product-card__media"><ProductImage product={product} /></div><div className="hc-product-card__body"><small>{product.category}</small><h3>{product.name}</h3><p>{product.size || product.brand || "Produto local"}</p><div><span><small>A partir de</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight /></div></div></Link></article>)}</div>
      </section>

      <section className="hc-action hc-shell">
        <div className="hc-action__steps"><span><b>1</b> Pesquise</span><ArrowRight /><span><b>2</b> Compare</span><ArrowRight /><span><b>3</b> Escolha</span></div>
        <div className="hc-action__business"><div><strong>Tem um negócio em Feijó?</strong><small>Cadastre seus produtos no PreçoCerto.</small></div><Link to="/lojista">Quero participar <ArrowRight /></Link></div>
      </section>
    </main>

    <footer className="hc-footer"><div className="hc-shell"><Link to="/"><img src="/logo-preco-certo-inversa.svg?v=9" alt="PreçoCerto" width="124" height="32" /></Link><nav aria-label="Links do rodapé"><Link to="/fale-conosco">Contato</Link><Link to="/colaborar">Colaborar</Link><Link to="/painel-lojista">Painel lojista</Link></nav><span><BadgeCheck /> Preços locais verificados</span></div></footer>
    <nav className="hc-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-basica"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Lojas</span></Link></nav>
  </div>;
}
