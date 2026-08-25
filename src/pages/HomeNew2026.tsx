import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Croissant, HeartPulse, LayoutGrid, MapPin, Menu, Moon, PackageSearch, Search, ShoppingBasket, Store, Sun, X } from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveCutoutImage, resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { getStoreLogoUrl } from "../data/storeLogos";
import { FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { HomeQuickActionsCarousel } from "../components/HomeQuickActionsCarousel";
import { useSiteTheme } from "../hooks/useSiteTheme";
import "./HomeNew2026.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const categories = [
  { name: "Mercados", copy: "Compras do dia", to: "/mercados", icon: ShoppingBasket, color: "#11875d" },
  { name: "Açougues", copy: "Carnes e cortes", to: "/acougues", icon: Store, color: "#d94f45" },
  { name: "Padarias", copy: "Pães e salgados", to: "/padarias", icon: Croissant, color: "#d98412" },
  { name: "Lanchonetes", copy: "Lanches e pizzas", to: "/lanchonetes", icon: Store, color: "#e56335" },
  { name: "Farmácias", copy: "Saúde e cuidado", to: "/farmacias", icon: HeartPulse, color: "#3156d9" },
  { name: "Livros locais", copy: "Cultura de Feijó", to: "/livros", icon: BookOpen, color: "#7048c8" },
] as const;

function ProductImage({ product, eager = false }: { product: Product; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const source = resolveCutoutImage(product) || resolveProductImage(product);
  return source && !failed
    ? <img src={source} alt={product.name} width="180" height="150" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
    : <span className="nx-product-fallback"><PackageSearch aria-hidden="true" /><small>Imagem em atualização</small></span>;
}

export function HomeNew2026() {
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useSiteTheme();
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);
  const [cycle, setCycle] = useState(() => currentCycle());
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog().then(value => { if (active) { setCatalog(value); setCatalogError(value.error || ""); } }).catch(() => { if (active) setCatalogError("Não foi possível atualizar o catálogo agora."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setCycle(currentCycle()), msUntilNextCycle() + 250);
    return () => window.clearTimeout(timer);
  }, [cycle]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  const products = useMemo(() => catalog.products.filter(product => product.minPrice > 0), [catalog.products]);
  const lastPriceUpdate = useMemo(() => {
    const latest = products.reduce((current, product) => Math.max(current, Date.parse(product.updated_at || product.capturedAt || "") || 0), 0);
    return latest ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(latest) : "indisponível";
  }, [products]);
  const featured = useMemo(() => buildFeatured(products, cycle, 4), [products, cycle]);
  const spotlight = featured[0];
  const suggestions = useMemo(() => {
    const term = normalize(deferredQuery);
    if (term.length < 2) return [];
    const ranked = products.map(product => {
      const name = normalize(product.name);
      const brand = normalize(product.brand || "");
      const category = normalize(product.category || "");
      const store = normalize(product.establishment || "");
      const size = normalize(product.size || "");
      let relevance = 99;
      if (name === term) relevance = 0;
      else if (name.startsWith(term)) relevance = 1;
      else if (name.split(/\s+/).some(word => word.startsWith(term))) relevance = 2;
      else if (name.includes(term)) relevance = 3;
      else if (brand === term || brand.startsWith(term)) relevance = 4;
      else if (`${brand} ${category} ${store} ${size}`.includes(term)) relevance = 5;
      return { product, relevance };
    }).filter(item => item.relevance < 99);
    return ranked.sort((a, b) => a.relevance - b.relevance || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
      .slice(0, 5).map(item => item.product);
  }, [deferredQuery, products]);
  const searchOpen = focused && query.trim().length >= 2;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      const product = suggestions[activeIndex];
      setFocused(false);
      navigate(`/produto/${product.slug || product.id}`);
      return;
    }
    navigate(`/buscar?q=${encodeURIComponent(term)}`);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || !suggestions.length) {
      if (event.key === "Escape") setFocused(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => index <= 0 ? suggestions.length - 1 : index - 1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const product = suggestions[activeIndex];
      setFocused(false);
      navigate(`/produto/${product.slug || product.id}`);
    } else if (event.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  return <div className="nx-home">
    <header className="nx-header">
      <FestivalAcaiBar />
      <div className="nx-shell nx-header__inner">
        <Link className="nx-brand" to="/" aria-label="PreçoCerto, página inicial">
          <img src="/logo-preco-certo.svg?v=11" alt="PreçoCerto" width="171" height="36" />
          <span><MapPin aria-hidden="true" /><strong>Feijó</strong><small>· Acre</small></span>
        </Link>
        <nav className={menuOpen ? "is-open" : ""} id="nx-navigation" aria-label="Navegação principal">
          <Link to="/buscar" onClick={() => setMenuOpen(false)} title="Comparar preços" aria-label="Comparar preços"><Search aria-hidden="true" /><span>Comparar</span></Link>
          <Link to="/explorar" onClick={() => setMenuOpen(false)} title="Explorar categorias" aria-label="Explorar categorias"><LayoutGrid aria-hidden="true" /><span>Categorias</span></Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)} title="Ver estabelecimentos" aria-label="Ver estabelecimentos"><MapPin aria-hidden="true" /><span>Locais</span></Link>
          <Link to="/cesta-basica" onClick={() => setMenuOpen(false)} title="Abrir lista de compras" aria-label="Abrir lista de compras"><ShoppingBasket aria-hidden="true" /><span>Lista</span></Link>
        </nav>
        <div className="nx-header__actions">
          <HeaderRadioPlayer />
          <button type="button" className="nx-theme" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>
          <Link className="nx-login" to="/login">Entrar</Link>
          <button ref={menuButtonRef} className="nx-menu" type="button" aria-expanded={menuOpen} aria-controls="nx-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      <section className="nx-hero nx-hero--mobile-pro" onPointerDown={event => {
        if (searchOpen && !(event.target as HTMLElement).closest(".nx-live-search")) setFocused(false);
      }}>
        <div className="nx-shell nx-hero__grid">
          <div className="nx-hero__copy">
            <div className="nx-hero__eyebrow"><span>PREÇOS LOCAIS</span><b>Feijó · Acre</b></div>
            <h1>Compare antes de comprar. <em>Economize de verdade.</em></h1>
            <p>Encontre produtos disponíveis no comércio local, veja os menores preços e escolha onde sua compra vale mais.</p>

            <form className={`nx-live-search${searchOpen ? " is-open" : ""}`} role="search" onSubmit={submitSearch} onFocus={() => setFocused(true)}>
              <div className="nx-live-search__field">
                <Search aria-hidden="true" />
                <label className="sr-only" htmlFor="nx-live-search-input">Pesquisar produto no catálogo local</label>
                <input id="nx-live-search-input" value={query} onChange={event => { setQuery(event.target.value); setActiveIndex(-1); }} onKeyDown={handleSearchKeyDown} placeholder="Busque arroz, café, leite..." autoComplete="off" inputMode="search" role="combobox" aria-expanded={searchOpen} aria-controls="nx-live-search-results" aria-activedescendant={activeIndex >= 0 ? `nx-live-result-${activeIndex}` : undefined} />
                {query && <button className="nx-live-search__clear" type="button" onClick={() => { setQuery(""); setActiveIndex(-1); }} aria-label="Limpar pesquisa"><X /></button>}
              </div>
              <button className="nx-live-search__submit" type="submit">Ver preços <ArrowRight /></button>

              {searchOpen && <div className="nx-live-results" id="nx-live-search-results" role="listbox">
                <div className="nx-live-results__head"><div><span>RESULTADOS AO VIVO</span><strong>{suggestions.length ? "Melhores opções encontradas" : "Nenhum resultado exato"}</strong></div><small>{loading ? "Atualizando catálogo…" : `${suggestions.length} de 5 resultados`}</small></div>
                <div className="nx-live-results__list">
                  {suggestions.length ? suggestions.map((product, index) => {
                    const store = product.establishment || "Comércio local";
                    const logo = getStoreLogoUrl(store);
                    return <button id={`nx-live-result-${index}`} key={product.id} type="button" role="option" aria-selected={activeIndex === index} className={activeIndex === index ? "is-active" : undefined} onMouseEnter={() => setActiveIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => { setFocused(false); navigate(`/produto/${product.slug || product.id}`); }}>
                      <i className="nx-live-result__media"><ProductImage product={product} /></i>
                      <span className="nx-live-result__copy"><small>{product.category || "Produto"}</small><strong>{product.name}</strong><em>{logo ? <img src={logo} alt="" aria-hidden="true" /> : <Store aria-hidden="true" />}{store}</em></span>
                      <span className="nx-live-result__price"><small>a partir de</small><b>{brl.format(product.minPrice)}</b><em>Comparar</em></span>
                    </button>;
                  }) : <div className="nx-live-results__empty"><PackageSearch /><div><strong>Não encontramos esse produto.</strong><span>Tente o nome principal, a marca ou uma palavra menor.</span></div></div>}
                </div>
                <Link className="nx-live-results__all" to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight /></Link>
              </div>}
            </form>

            <div className="nx-hero__links"><span>Buscas rápidas:</span>{["Arroz", "Café", "Leite"].map(item => <button key={item} type="button" onClick={() => { setQuery(item); setFocused(true); }}>{item}</button>)}</div>
            <div className={`nx-catalog-status${catalogError ? " has-warning" : ""}`} role="status"><span>Atualizado em {lastPriceUpdate}</span>{catalogError && <><em>Exibindo a base local.</em><button type="button" onClick={() => { setLoading(true); fetchCatalog("", { force: true }).then(value => { setCatalog(value); setCatalogError(value.error || ""); }).catch(() => setCatalogError("A atualização continua indisponível.")).finally(() => setLoading(false)); }}>Tentar atualizar</button></>}</div>
          </div>

          <div className="nx-hero__visual">
            <div className="nx-hero__photo" role="img" aria-label="Compras no comércio local de Feijó" />
            <div className="nx-hero__visual-shade" aria-hidden="true" />
            <div className="nx-hero__visual-badge"><span>COMPARAÇÃO LOCAL</span><strong>Preço certo, decisão melhor.</strong></div>
            <aside className="nx-deal" aria-label="Preço em destaque">
              {loading ? <div className="nx-deal__loading" aria-busy="true"><i /><i /><i /></div> : spotlight ? <>
                <span>Menor preço em destaque</span>
                <div className="nx-deal__product"><ProductImage product={spotlight} eager /><div><small>{spotlight.category}</small><strong>{spotlight.name}</strong><em>{spotlight.establishment || spotlight.size || spotlight.brand}</em></div></div>
                <footer><div><small>a partir de</small><strong>{brl.format(spotlight.minPrice)}</strong></div><Link to={`/produto/${spotlight.slug || spotlight.id}`} aria-label={`Comparar preços de ${spotlight.name}`}><ArrowRight /></Link></footer>
              </> : <div className="nx-deal__empty">Novos preços serão exibidos aqui.</div>}
            </aside>
          </div>
        </div>
      </section>

      <HomeQuickActionsCarousel />

      <div className="nx-catalog-band">
      <section className="nx-categories nx-shell" aria-labelledby="nx-categories-title">
        <div className="nx-section-title"><div><h2 id="nx-categories-title">Onde você quer comprar?</h2></div><Link to="/explorar">Ver todas as categorias <ArrowRight aria-hidden="true" /></Link></div>
        <div className="nx-category-grid">{categories.map(({ name, copy, to, icon: Icon, color }) => <Link key={name} to={to} style={{ "--nx-accent": color } as React.CSSProperties}><i aria-hidden="true"><Icon /></i><span><strong>{name}</strong><small>{copy}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div>
      </section>

      <section className="nx-market nx-shell" aria-labelledby="nx-market-title">
        <div className="nx-market__products">
          <div className="nx-section-title"><div><h2 id="nx-market-title">Preços para comparar agora</h2><p>Produtos com valores disponíveis no PreçoCerto.</p></div><Link to="/buscar">Ver catálogo <ArrowRight aria-hidden="true" /></Link></div>
          <div className="nx-product-grid" aria-busy={loading}>
            {loading ? Array.from({ length: 3 }, (_, index) => <div className="nx-product-card nx-product-card--loading" key={index} aria-hidden="true" />) : featured.slice(1, 4).map(product => <article className="nx-product-card" key={product.id}>
              <Link to={`/produto/${product.slug || product.id}`}>
                <div className="nx-product-card__media"><ProductImage product={product} /></div>
                <div className="nx-product-card__copy"><small>{product.category}</small><h3>{product.name}</h3><p>{product.establishment || product.size || product.brand || "Comércio local"}</p><footer><span><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong></span><span className="nx-product-card__action">Comparar <ArrowRight /></span></footer></div>
              </Link>
            </article>)}
          </div>
          <span className="sr-only" role="status">{loading ? "Carregando preços" : "Preços carregados"}</span>
        </div>
        <aside className="nx-basket">
          <div className="nx-basket__content">
            <span className="nx-basket__eyebrow"><ShoppingBasket aria-hidden="true" /> COMPRA PLANEJADA</span>
            <h2>Sua cesta pode custar menos.</h2>
            <p>Compare o total e descubra a melhor combinação de preços nos estabelecimentos de Feijó.</p>
            <div className="nx-basket__actions"><Link to="/cesta-inteligente">Montar cesta inteligente <ArrowRight /></Link><Link to="/cesta-basica">Abrir minha lista</Link></div>
          </div>
        </aside>
      </section>

      </div>
      <div className="nx-local-band">
      <section className="nx-local nx-shell">
        <div className="nx-local__copy">
          <h2>O comércio local mais fácil de encontrar.</h2>
          <p>Explore estabelecimentos por categoria e localização. Se você vende em Feijó, apresente seu negócio a novos clientes.</p>
          <div><Link to="/estabelecimentos">Ver estabelecimentos <ArrowRight /></Link><Link to="/lojista">Cadastrar meu negócio</Link></div>
        </div>
      </section>
      </div>
    </main>

    <footer className="nx-footer">
      <div className="nx-shell nx-footer-v2">
        <div className="nx-footer-v2__identity">
          <img src="/logo-preco-certo-inversa.svg?v=11" alt="PreçoCerto" width="143" height="30" />
          <p>Compare antes de comprar no comércio local de Feijó.</p>
        </div>
        <nav className="nx-footer-v2__nav" aria-label="Principais caminhos">
          <Link to="/buscar"><Search aria-hidden="true" /><span>Buscar preços</span></Link>
          <Link to="/estabelecimentos"><MapPin aria-hidden="true" /><span>Onde comprar</span></Link>
          <Link to="/cesta-inteligente"><ShoppingBasket aria-hidden="true" /><span>Cesta inteligente</span></Link>
          <Link to="/lojista"><Store aria-hidden="true" /><span>Área do comerciante</span></Link>
        </nav>
        <span className="nx-footer-v2__place"><MapPin aria-hidden="true" /> Feijó, Acre</span>
        <div className="nx-footer-v2__bottom">
          <small>Desenvolvido por Franc D’nis</small>
          <div className="nx-footer-v2__utility"><button type="button" onClick={() => setFooterPanel("contato")}>Contato</button><button type="button" onClick={() => setFooterPanel("desenvolvedor")} aria-haspopup="dialog">Sobre o desenvolvedor</button></div>
        </div>
      </div>
    </footer>
    <FooterInfoDialogs open={footerPanel} onClose={() => setFooterPanel(null)} />
    <nav className="nx-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-inteligente"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Locais</span></Link></nav>
  </div>;
}
