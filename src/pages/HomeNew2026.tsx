import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Croissant,
  HeartPulse,
  LayoutGrid,
  MapPin,
  Menu,
  Moon,
  PackageSearch,
  Search,
  ShoppingBasket,
  Store,
  Sun,
  X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveCutoutImage, resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { useSiteTheme } from "../hooks/useSiteTheme";
import { suggestProducts } from "../lib/productSearch";
import "./HomeNew2026.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const categories = [
  { name: "Mercados", copy: "Compras do dia", to: "/mercados", icon: ShoppingBasket },
  { name: "Açougues", copy: "Carnes e cortes", to: "/acougues", icon: Store },
  { name: "Padarias", copy: "Pães e salgados", to: "/padarias", icon: Croissant },
  { name: "Lanchonetes", copy: "Lanches e pizzas", to: "/lanchonetes", icon: Store },
  { name: "Farmácias", copy: "Saúde e cuidado", to: "/farmacias", icon: HeartPulse },
  { name: "Ver tudo", copy: "Todas as categorias", to: "/explorar", icon: LayoutGrid },
] as const;

function ProductImage({ product, eager = false }: { product: Product; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const source = resolveCutoutImage(product) || resolveProductImage(product);

  return source && !failed ? (
    <img
      src={source}
      alt={product.name}
      width="180"
      height="150"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="nx-product-fallback">
      <PackageSearch aria-hidden="true" />
      <small>Imagem em atualização</small>
    </span>
  );
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
  const [cycle, setCycle] = useState(() => currentCycle());
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    document.documentElement.classList.add("nx-home-active");
    return () => document.documentElement.classList.remove("nx-home-active");
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then(value => {
        if (active) {
          setCatalog(value);
          setCatalogError(value.error || "");
        }
      })
      .catch(() => {
        if (active) setCatalogError("Não foi possível atualizar o catálogo agora.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
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
  const featured = useMemo(() => buildFeatured(products, cycle, 5), [products, cycle]);
  const spotlight = featured[0];

  const lastPriceUpdate = useMemo(() => {
    const latest = products.reduce(
      (current, product) => Math.max(current, Date.parse(product.updated_at || product.capturedAt || "") || 0),
      0,
    );
    return latest
      ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(latest)
      : "indisponível";
  }, [products]);

  const suggestions = useMemo(() => {
    if (deferredQuery.trim().length < 2) return [];
    return suggestProducts(products, deferredQuery, 5);
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
      setActiveIndex(index => (index <= 0 ? suggestions.length - 1 : index - 1));
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

  return (
    <div className="nx-home nx-home--impeccable">
      <header className="nx-header">
        <FestivalAcaiBar />
        <div className="nx-shell nx-header__inner">
          <Link className="nx-brand" to="/" aria-label="Preço Certo, página inicial">
            <img src="/logo-preco-certo.svg?v=11" alt="Preço Certo" width="171" height="36" />
            <span><MapPin aria-hidden="true" />Feijó · AC</span>
          </Link>

          <nav className={menuOpen ? "is-open" : ""} id="nx-navigation" aria-label="Navegação principal">
            <Link to="/" className="is-active" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link to="/buscar" onClick={() => setMenuOpen(false)}>Ofertas</Link>
            <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Lojas</Link>
            <Link to="/explorar" onClick={() => setMenuOpen(false)}>Categorias</Link>
            <Link to="/cesta-basica" onClick={() => setMenuOpen(false)}>Lista</Link>
          </nav>

          <div className="nx-header__actions">
            <HeaderRadioPlayer />
            <button
              type="button"
              className="nx-theme"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <Link className="nx-login" to="/login">Entrar / Cadastrar</Link>
            <button
              ref={menuButtonRef}
              className="nx-menu"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="nx-navigation"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen(value => !value)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo-principal">
        <section
          className="nx-hero"
          onPointerDown={event => {
            if (searchOpen && !(event.target as HTMLElement).closest(".nx-live-search")) setFocused(false);
          }}
        >
          <div className="nx-hero__backdrop" aria-hidden="true" />
          <div className="nx-shell nx-hero__grid">
            <div className="nx-hero__copy">
              <span className="nx-hero__kicker"><CheckCircle2 /> Economia local, simples e rápida</span>
              <h1>Compare preços e <em>economize</em> em Feijó</h1>
              <p>Encontre as melhores ofertas do comércio local, compare valores em segundos e escolha onde sua compra vale mais.</p>

              <form className={`nx-live-search${searchOpen ? " is-open" : ""}`} role="search" onSubmit={submitSearch} onFocus={() => setFocused(true)}>
                <div className="nx-live-search__field">
                  <Search aria-hidden="true" />
                  <label className="sr-only" htmlFor="nx-live-search-input">Pesquisar produto no catálogo local</label>
                  <input
                    id="nx-live-search-input"
                    value={query}
                    onChange={event => {
                      setQuery(event.target.value);
                      setActiveIndex(-1);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Buscar produtos, marcas ou lojas..."
                    autoComplete="off"
                    inputMode="search"
                    role="combobox"
                    aria-expanded={searchOpen}
                    aria-controls="nx-live-search-results"
                    aria-activedescendant={activeIndex >= 0 ? `nx-live-result-${activeIndex}` : undefined}
                  />
                  {query && (
                    <button className="nx-live-search__clear" type="button" onClick={() => { setQuery(""); setActiveIndex(-1); }} aria-label="Limpar pesquisa">
                      <X />
                    </button>
                  )}
                </div>

                <span className="nx-live-search__location"><MapPin /> Feijó · AC</span>
                <button className="nx-live-search__submit" type="submit">Buscar ofertas</button>

                {searchOpen && (
                  <div className="nx-live-results" id="nx-live-search-results" role="listbox">
                    {suggestions.length ? suggestions.map((product, index) => (
                      <button
                        id={`nx-live-result-${index}`}
                        key={product.id}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        className={activeIndex === index ? "is-active" : undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => {
                          setFocused(false);
                          navigate(`/produto/${product.slug || product.id}`);
                        }}
                      >
                        <i><ProductImage product={product} /></i>
                        <span><small>{product.category || "Produto"}</small><strong>{product.name}</strong><em>{product.establishment || "Comércio local"}</em></span>
                        <b>{brl.format(product.minPrice)}</b>
                      </button>
                    )) : (
                      <div className="nx-live-results__empty"><PackageSearch /><span>Nenhum resultado exato. Tente outro termo.</span></div>
                    )}
                    <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight /></Link>
                  </div>
                )}
              </form>

              <div className="nx-hero__ctas">
                <Link className="is-primary" to="/buscar"><Search /> Explorar ofertas</Link>
                <Link className="is-secondary" to="/estabelecimentos"><Store /> Explorar lojas</Link>
              </div>

              <div className="nx-hero__facts">
                <span><strong>{products.length || "—"}</strong><small>produtos com preço</small></span>
                <span><strong>Feijó</strong><small>comércio local</small></span>
                <span><strong>{loading ? "Atualizando…" : "Online"}</strong><small>base de preços</small></span>
              </div>

              <div className={`nx-catalog-status${catalogError ? " has-warning" : ""}`} role="status">
                Atualizado em {lastPriceUpdate}
                {catalogError && <span> · exibindo base local</span>}
              </div>
            </div>

            <div className="nx-hero__visual" aria-label="Experiência de compra local">
              <div className="nx-hero__photo" />
              <div className="nx-hero__trust">
                <CheckCircle2 />
                <p><strong>Preço Certo, economia de verdade</strong><span>para você e sua família.</span></p>
              </div>

              {spotlight && (
                <aside className="nx-hero__deal">
                  <span>Oferta em destaque</span>
                  <div><ProductImage product={spotlight} eager /></div>
                  <p><strong>{spotlight.name}</strong><small>{spotlight.establishment || spotlight.category}</small></p>
                  <b>{brl.format(spotlight.minPrice)}</b>
                  <Link to={`/produto/${spotlight.slug || spotlight.id}`} aria-label={`Comparar ${spotlight.name}`}><ArrowRight /></Link>
                </aside>
              )}
            </div>
          </div>
        </section>

        <section className="nx-category-strip nx-shell" aria-label="Categorias em destaque">
          {categories.map(({ name, copy, to, icon: Icon }) => (
            <Link key={name} to={to}>
              <i><Icon /></i>
              <span><strong>{name}</strong><small>{copy}</small></span>
              <ArrowRight />
            </Link>
          ))}
        </section>

        <section className="nx-offers nx-shell" aria-labelledby="nx-offers-title">
          <div className="nx-section-title">
            <div><span>Economize agora</span><h2 id="nx-offers-title">Ofertas em destaque</h2></div>
            <Link to="/buscar">Ver todas <ArrowRight /></Link>
          </div>

          <div className="nx-offer-grid">
            {featured.map((product, index) => (
              <Link className="nx-offer-card" key={product.id} to={`/produto/${product.slug || product.id}`}>
                <div className="nx-offer-card__image"><ProductImage product={product} eager={index === 0} /></div>
                <div className="nx-offer-card__copy">
                  <small>{product.category || "Produto"}</small>
                  <strong>{product.name}</strong>
                  <span>{product.establishment || "Comércio local"}</span>
                  <b>{brl.format(product.minPrice)}</b>
                  <em>Comparar preço <ArrowRight /></em>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="nx-bottom-grid nx-shell">
          <div className="nx-store-panel">
            <div className="nx-section-title">
              <div><span>Comércio de Feijó</span><h2>Lojas em destaque</h2></div>
              <Link to="/estabelecimentos">Ver todas <ArrowRight /></Link>
            </div>
            <div className="nx-store-links">
              <Link to="/mercados"><Store /><span><strong>Mercados</strong><small>Compare preços locais</small></span></Link>
              <Link to="/padarias"><Croissant /><span><strong>Padarias</strong><small>Pães, salgados e mais</small></span></Link>
              <Link to="/farmacias"><HeartPulse /><span><strong>Farmácias</strong><small>Saúde e cuidado</small></span></Link>
            </div>
          </div>

          <div className="nx-basket-panel">
            <div>
              <span>Cesta inteligente</span>
              <h2>Compare a compra inteira.</h2>
              <p>Monte sua lista e descubra onde o total fica mais barato antes de sair de casa.</p>
              <Link to="/cesta-inteligente">Abrir cesta inteligente <ArrowRight /></Link>
            </div>
            <div className="nx-basket-visual" aria-hidden="true"><ShoppingBasket /></div>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-shell nx-footer__grid">
          <div>
            <img src="/logo-preco-certo.svg?v=11" alt="Preço Certo" width="150" height="32" />
            <p>Conectando você às melhores ofertas do comércio local de Feijó.</p>
          </div>
          <nav aria-label="Institucional">
            <strong>Institucional</strong>
            <Link to="/contato">Fale conosco</Link>
            <Link to="/colaborar">Colaborar</Link>
            <Link to="/lojista">Para lojistas</Link>
          </nav>
          <nav aria-label="Atalhos">
            <strong>Atalhos</strong>
            <Link to="/buscar">Buscar</Link>
            <Link to="/estabelecimentos">Lojas</Link>
            <Link to="/cesta-inteligente">Cesta inteligente</Link>
          </nav>
          <div className="nx-footer__note">
            <span>Feijó · Acre</span>
            <small>Preço Certo © 2026</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
