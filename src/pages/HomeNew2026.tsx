import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Croissant, HeartPulse, MapPin, Menu, Moon, PackageSearch, Search, ShoppingBasket, Store, Sun, X } from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveCutoutImage, resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { getStoreLogoUrl } from "../data/storeLogos";
import { FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import "./HomeNew2026.css";

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

const categories = [
  { name: "Mercados", copy: "Compras do dia", to: "/mercados", icon: ShoppingBasket, color: "#16845a" },
  { name: "Açougues", copy: "Carnes e cortes", to: "/acougues", icon: Store, color: "#d45b4f" },
  { name: "Padarias", copy: "Pães e salgados", to: "/padarias", icon: Croissant, color: "#d88a20" },
  { name: "Lanchonetes", copy: "Lanches e pizzas", to: "/lanchonetes", icon: Store, color: "#e46f38" },
  { name: "Farmácias", copy: "Saúde e cuidado", to: "/farmacias", icon: HeartPulse, color: "#139c93" },
  { name: "Livros locais", copy: "Cultura de Feijó", to: "/livros", icon: BookOpen, color: "#7763c8" },
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
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);
  const [cycle, setCycle] = useState(() => currentCycle());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("precocerto-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog().then(value => { if (active) setCatalog(value); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
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
  const featured = useMemo(() => buildFeatured(products, cycle, 4), [products, cycle]);
  const spotlight = featured[0];
  const suggestions = useMemo(() => {
    const term = normalize(query);
    if (term.length < 2) return [];
    return products.filter(product => normalize(`${product.name} ${product.brand || ""} ${product.category || ""}`).includes(term))
      .sort((a, b) => a.minPrice - b.minPrice).slice(0, 5);
  }, [products, query]);
  const searchOpen = focused && query.trim().length >= 2;

  useEffect(() => setActiveIndex(-1), [query]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar");
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
      <div className="nx-shell nx-header__inner">
        <Link className="nx-brand" to="/" aria-label="PreçoCerto, página inicial">
          <img src="/logo-preco-certo.svg?v=9" alt="PreçoCerto" width="150" height="36" />
          <span><MapPin aria-hidden="true" /> Feijó, Acre</span>
        </Link>
        <nav className={menuOpen ? "is-open" : ""} id="nx-navigation" aria-label="Navegação principal">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar</Link>
          <Link to="/explorar" onClick={() => setMenuOpen(false)}>Onde comprar</Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
          <Link to="/cesta-inteligente" onClick={() => setMenuOpen(false)}>Cesta inteligente</Link>
          <Link to="/lojista" onClick={() => setMenuOpen(false)}>Para comerciantes</Link>
        </nav>
        <div className="nx-header__actions">
          <button type="button" className="nx-theme" onClick={() => setTheme(value => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Link className="nx-login" to="/login">Entrar</Link>
          <button ref={menuButtonRef} className="nx-menu" type="button" aria-expanded={menuOpen} aria-controls="nx-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      <FestivalAcaiBar />
      <section className="nx-hero" onPointerDown={event => {
        if (searchOpen && !(event.target as HTMLElement).closest(".nx-search")) setFocused(false);
      }}>
        <div className="nx-shell nx-hero__grid">
          <div className="nx-hero__copy">
            <span className="nx-kicker"><i className="nx-check" aria-hidden="true">✓</i> Comparação local, sem complicação</span>
            <h1>Encontre o melhor preço <em>perto de você.</em></h1>
            <p>Pesquise produtos do comércio de Feijó, compare os valores disponíveis e decida onde comprar.</p>
            <form className="nx-search" role="search" onSubmit={submitSearch} onFocus={() => setFocused(true)}>
              <Search aria-hidden="true" />
              <label className="sr-only" htmlFor="nx-search-input">Buscar produto, marca ou categoria</label>
              <input id="nx-search-input" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder="Digite um produto ou uma marca" autoComplete="off" role="combobox" aria-expanded={searchOpen} aria-controls="nx-search-results" aria-activedescendant={activeIndex >= 0 ? `nx-result-${activeIndex}` : undefined} />
              {query && <button className="nx-search__clear" type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}
              <button className="nx-search__submit" type="submit">Pesquisar <ArrowRight /></button>
              {searchOpen && <div className="nx-results" id="nx-search-results" role="listbox">
                <header><strong>Resultados</strong><span aria-live="polite">{suggestions.length} produtos</span></header>
                {suggestions.length ? suggestions.map((product, index) => {
                  const store = product.establishment || "Comércio local";
                  const logo = getStoreLogoUrl(store);
                  return <button id={`nx-result-${index}`} key={product.id} type="button" role="option" aria-selected={activeIndex === index} className={activeIndex === index ? "is-active" : undefined} onMouseEnter={() => setActiveIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/produto/${product.slug || product.id}`)}>
                    <i><ProductImage product={product} /></i>
                    <span><small>{product.category}</small><strong>{product.name}</strong><em>{logo ? <img src={logo} alt="" aria-hidden="true" /> : <Store aria-hidden="true" />}{store}</em></span>
                    <b>{brl.format(product.minPrice)}</b>
                  </button>;
                }) : <div className="nx-results__empty"><PackageSearch /><span><strong>Nenhum produto encontrado</strong><small>Tente uma palavra mais curta.</small></span></div>}
                <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Abrir busca completa <ArrowRight /></Link>
              </div>}
            </form>
            <div className="nx-hero__links"><span>Comece por:</span>{["Arroz", "Café", "Leite"].map(item => <Link key={item} to={`/buscar?q=${item.toLowerCase()}`}>{item}</Link>)}</div>
          </div>

          <div className="nx-hero__visual">
            <div className="nx-hero__photo" role="img" aria-label="Comércio local de Feijó" />
            <aside className="nx-deal" aria-label="Preço em destaque">
              {loading ? <div className="nx-deal__loading" aria-busy="true"><i /><i /><i /></div> : spotlight ? <>
                <span>Preço em destaque</span>
                <div className="nx-deal__product"><ProductImage product={spotlight} eager /><div><small>{spotlight.category}</small><strong>{spotlight.name}</strong><em>{spotlight.size || spotlight.brand}</em></div></div>
                <footer><div><small>a partir de</small><strong>{brl.format(spotlight.minPrice)}</strong></div><Link to={`/produto/${spotlight.slug || spotlight.id}`} aria-label={`Comparar preços de ${spotlight.name}`}><ArrowRight /></Link></footer>
              </> : <div className="nx-deal__empty">Novos preços serão exibidos aqui.</div>}
            </aside>
          </div>
        </div>
      </section>

      <div className="nx-catalog-band">
      <section className="nx-categories nx-shell" aria-labelledby="nx-categories-title">
        <div className="nx-section-title"><div><span>Comércio local</span><h2 id="nx-categories-title">Onde você quer comprar?</h2></div><Link to="/explorar">Ver todas as categorias <ArrowRight /></Link></div>
        <div className="nx-category-grid">{categories.map(({ name, copy, to, icon: Icon, color }) => <Link key={name} to={to} style={{ "--nx-accent": color } as React.CSSProperties}><i><Icon /></i><span><strong>{name}</strong><small>{copy}</small></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="nx-market nx-shell" aria-labelledby="nx-market-title">
        <div className="nx-market__products">
          <div className="nx-section-title"><div><span>Catálogo local</span><h2 id="nx-market-title">Preços para comparar agora</h2><p>Produtos com valores disponíveis no PreçoCerto.</p></div><Link to="/buscar">Ver catálogo <ArrowRight /></Link></div>
          <div className="nx-product-grid">
            {loading ? Array.from({ length: 3 }, (_, index) => <div className="nx-product-card nx-product-card--loading" key={index} />) : featured.slice(1, 4).map(product => <article className="nx-product-card" key={product.id}>
              <Link to={`/produto/${product.slug || product.id}`}>
                <div className="nx-product-card__media"><ProductImage product={product} /></div>
                <div className="nx-product-card__copy"><small>{product.category}</small><h3>{product.name}</h3><p>{product.size || product.brand || "Produto local"}</p><footer><span><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight /></footer></div>
              </Link>
            </article>)}
          </div>
        </div>
        <aside className="nx-basket">
          <ShoppingBasket aria-hidden="true" />
          <span>Planeje sua compra</span>
          <h2>Monte uma cesta e compare o total.</h2>
          <p>Organize seus produtos, ajuste quantidades e veja as opções disponíveis por estabelecimento.</p>
          <Link to="/cesta-inteligente">Abrir cesta inteligente <ArrowRight /></Link>
          <Link to="/cesta-basica">Ver minha lista</Link>
        </aside>
      </section>

      </div>
      <div className="nx-local-band">
      <section className="nx-local nx-shell">
        <div className="nx-local__copy">
          <span>Feito para Feijó</span>
          <h2>O comércio local mais fácil de encontrar.</h2>
          <p>Explore estabelecimentos por categoria e localização. Se você vende em Feijó, apresente seu negócio a novos clientes.</p>
          <div><Link to="/estabelecimentos">Ver estabelecimentos <ArrowRight /></Link><Link to="/lojista">Cadastrar meu negócio</Link></div>
        </div>
      </section>
      </div>
    </main>

    <footer className="nx-footer">
      <div className="nx-shell nx-footer__main">
        <div className="nx-footer__brand"><img src="/logo-preco-certo-inversa.svg?v=9" alt="PreçoCerto" width="126" height="30" /><p>Informação local para comprar melhor.</p></div>
        <nav aria-label="Links do rodapé"><Link to="/buscar">Comparar preços</Link><Link to="/explorar">Onde comprar</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/lojista">Para comerciantes</Link><button type="button" onClick={() => setFooterPanel("contato")}>Contato</button></nav>
        <div className="nx-footer__meta"><span><i className="nx-check" aria-hidden="true">✓</i> Preços locais organizados</span><small>© 2026 PreçoCerto · Feijó, AC</small></div>
      </div>
    </footer>
    <FooterInfoDialogs open={footerPanel} onClose={() => setFooterPanel(null)} />
    <nav className="nx-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-inteligente"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Locais</span></Link></nav>
  </div>;
}
