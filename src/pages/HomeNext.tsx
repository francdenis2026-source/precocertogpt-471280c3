import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BadgePercent, CheckCircle2, Heart, LogIn, MapPin, Menu, Moon, PackageSearch,
  Search, ShieldCheck, ShoppingBasket, Store, Sun, Tag, TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import "./HomeNext.css";
import "./HomeWebChrome2026.css";
import "./HomeSearchPremium2026.css";
import "./HomeReceiptRealistic2026.css";

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const readTheme = (): Theme => typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
const normalizeSearch = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const categoryItems = [
  { label: "Alimentos", query: "alimentos", icon: ShoppingBasket },
  { label: "Bebidas", query: "bebidas", icon: Tag },
  { label: "Limpeza", query: "limpeza", icon: BadgePercent },
  { label: "Higiene", query: "higiene", icon: ShieldCheck },
  { label: "Açougue", query: "carne", icon: TrendingDown },
  { label: "Farmácias", href: "/farmacias", icon: CheckCircle2 },
] as const;

function ProductImage({ product }: { product: Product }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = resolveProductImage(product);
  if (!src || failedSrc === src) return <PackageSearch aria-hidden="true" />;
  return <img src={src} alt={product.name} width="220" height="180" loading="lazy" onError={() => setFailedSrc(src)} />;
}

export function HomeNext() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 54);
  const [query, setQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [catalog, setCatalog] = useState<CatalogPayload>({
    products: initialCatalog.products,
    stores: initialCatalog.stores,
    metrics: verifiedDatasetMetrics,
    updatedAt: initialCatalog.updatedAt,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((result) => { if (active) setCatalog(result); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchDialogOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY > 54);
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const featuredProducts = useMemo(() => [...catalog.products]
    .filter((product) => product.minPrice > 0)
    .sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice))
    .slice(0, 5), [catalog.products]);

  const featuredStores = useMemo(() => [...catalog.stores]
    .sort((a, b) => b.products - a.products)
    .slice(0, 5), [catalog.stores]);

  const heroProduct = featuredProducts[0] ?? catalog.products[0];
  const heroSaving = heroProduct ? Math.max(0, heroProduct.maxPrice - heroProduct.minPrice) : 0;
  const normalizedQuery = normalizeSearch(query);
  const hasSearchQuery = normalizedQuery.length > 0;
  const suggestions = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return [];
    const tokens = term.split(/\s+/).filter(Boolean);

    return catalog.products
      .map((product) => {
        const name = normalizeSearch(product.name);
        const brand = normalizeSearch(product.brand || "");
        const category = normalizeSearch(product.category || "");
        const store = normalizeSearch(product.establishment || "");
        const size = normalizeSearch(product.size || "");
        const haystack = `${name} ${brand} ${category} ${store} ${size}`;
        const allTokensMatch = tokens.every((token) => haystack.includes(token));
        if (!allTokensMatch) return null;

        let score = 100;
        if (name === term) score = 0;
        else if (name.startsWith(term)) score = 10;
        else if (name.includes(term)) score = 20;
        else if (brand.startsWith(term)) score = 30;
        else if (brand.includes(term)) score = 40;
        else if (category.includes(term)) score = 50;
        else if (store.includes(term)) score = 60;

        return { product, score };
      })
      .filter((entry): entry is { product: Product; score: number } => Boolean(entry))
      .sort((a, b) => a.score - b.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
      .slice(0, 12)
      .map((entry) => entry.product);
  }, [catalog.products, query]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSearchQuery) {
      setSearchDialogOpen(false);
      return;
    }
    setSelectedProduct(null);
    setSearchDialogOpen(true);
  };

  const updateSearchQuery = (value: string) => {
    setQuery(value);
    setSelectedProduct(null);
    setSearchDialogOpen(normalizeSearch(value).length > 0);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchDialogOpen(false);
    setSelectedProduct(null);
  };

  const searchCategory = (term: string) => {
    setQuery(term);
    setSelectedProduct(null);
    setSearchDialogOpen(true);
  };

  const chooseSuggestion = (product: Product) => {
    setSearchDialogOpen(false);
    setQuery(product.name);
    setSelectedProduct(product);
  };

  return (
    <div className="pcn-home">
      <header className={`pcn-header ${headerScrolled ? "pcn-header--scrolled" : ""}`}>
        <div className="pcn-utility">
          <div className="pcn-shell">
            <span><MapPin aria-hidden="true" /> Feijó, Acre</span>
            <span><i aria-hidden="true" /> Catálogo local em atualização contínua</span>
            <Link to="/colaborar">Viu um preço diferente? Colabore</Link>
          </div>
        </div>
        <div className="pcn-shell pcn-header__inner">
          <Link className="pcn-brand" to="/" aria-label="PreçoCerto — página inicial">
            <span className="pcn-brand__mark"><TrendingDown aria-hidden="true" /></span>
            <span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span>
          </Link>
          <nav className="pcn-nav" aria-label="Navegação principal">
            <Link to="/buscar">Comparar</Link>
            <Link to="/estabelecimentos">Lojas</Link>
            <Link to="/farmacias">Farmácias</Link>
            <Link to="/cesta-basica">Cesta inteligente</Link>
            <Link to="/lojista">Para lojistas</Link>
          </nav>
          <div className="pcn-actions">
            <Link className="pcn-icon-link" to="/favoritos" aria-label="Favoritos"><Heart aria-hidden="true" /></Link>
            <button className="pcn-theme" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label="Alternar tema">
              <Sun aria-hidden="true" /><Moon aria-hidden="true" />
            </button>
            <Link className="pcn-login" to="/login"><LogIn aria-hidden="true" /> Entrar</Link>
            <button className="pcn-menu" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="pcn-mobile-navigation" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <nav className="pcn-mobile-nav" id="pcn-mobile-navigation" aria-label="Navegação móvel">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Pesquisar</Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
          <Link to="/farmacias" onClick={() => setMenuOpen(false)}>Categorias</Link>
          <Link to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link>
          <Link to="/lojista" onClick={() => setMenuOpen(false)}>Para lojistas</Link>
        </nav>}
      </header>

      <main>
        <section className="pcn-hero">
          <div className="pcn-hero__photo" aria-hidden="true" />
          <div className="pcn-hero__veil" aria-hidden="true" />
          <div className="pcn-shell pcn-hero__content">
            <div className="pcn-hero__copy">
              <h1>O mesmo produto.<br /><span>Outro preço.</span></h1>
              <p>Compare os comércios da cidade antes de sair de casa e escolha onde sua compra realmente vale mais.</p>
              <div className="pcn-search-shell">
                <form className="pcn-search" onSubmit={submitSearch} role="search">
                  <Search aria-hidden="true" />
                  <input id="pcn-home-search" value={query} onFocus={() => hasSearchQuery && setSearchDialogOpen(true)} onChange={(event) => updateSearchQuery(event.target.value)} placeholder="Busque produto, marca ou loja" aria-label="Buscar produto, marca ou estabelecimento" autoComplete="off" />
                  {hasSearchQuery && <button className="pcn-search__clear" type="button" onClick={clearSearch} aria-label="Limpar pesquisa" title="Limpar pesquisa"><X aria-hidden="true" /></button>}
                  <button className="pcn-search__submit" type="submit">Buscar <ArrowRight aria-hidden="true" /></button>
                </form>

                {searchDialogOpen && hasSearchQuery && (
                  <div className="pcn-search-dropdown" role="listbox" aria-label="Produtos encontrados">
                    <div className="pcn-search-dropdown__head">
                      <span>Resultados para <b>“{query.trim()}”</b></span>
                      <small>{suggestions.length} {suggestions.length === 1 ? "produto" : "produtos"}</small>
                    </div>
                    <div className="pcn-search-dropdown__list">
                      {suggestions.length ? suggestions.map((product) => (
                        <button key={product.id} type="button" role="option" onClick={() => chooseSuggestion(product)} aria-label={`Abrir ${product.name}`}>
                          <span className="pcn-search-dropdown__thumb"><ProductImage product={product} /></span>
                          <span className="pcn-search-dropdown__info"><b>{product.name}</b><small>{product.establishment || "Comércio local"}</small></span>
                          <strong>{money(product.minPrice)}</strong>
                          <ArrowRight aria-hidden="true" />
                        </button>
                      )) : <p>Nenhum produto relacionado a “{query.trim()}” foi encontrado.</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="pcn-quick">
                <button type="button" onClick={() => searchCategory("arroz")}><Tag /> Arroz</button>
                <button type="button" onClick={() => searchCategory("café")}><ShoppingBasket /> Café</button>
                <button type="button" onClick={() => searchCategory("carne")}><TrendingDown /> Carnes</button>
              </div>
            </div>

            {heroProduct && (
              <aside className="pcn-receipt" aria-label="Resumo de economia do produto em destaque">
                <div className="pcn-receipt__top">
                  <span>PreçoCerto · Feijó-AC</span>
                  <BadgePercent aria-hidden="true" />
                </div>
                <small>Economia encontrada agora</small>
                <strong className="pcn-receipt__saving">{money(heroSaving)}</strong>
                <p>{heroProduct.name}</p>
                <div className="pcn-receipt__rows">
                  <span>Menor preço <b>{money(heroProduct.minPrice)}</b></span>
                  <span>Maior preço <b>{money(heroProduct.maxPrice)}</b></span>
                </div>
                <button type="button" onClick={() => navigate(`/buscar?q=${encodeURIComponent(heroProduct.name)}`)}>
                  Ver comparação <ArrowRight aria-hidden="true" />
                </button>
              </aside>
            )}
          </div>
        </section>

        <section className="pcn-metrics-wrap" aria-label="Resumo do catálogo">
          <div className="pcn-shell pcn-metrics">
            <div><span className="pcn-metric-icon is-blue"><Tag /></span><strong>{catalog.metrics.prices.toLocaleString("pt-BR")}</strong><small>Preços verificados</small></div>
            <div><span className="pcn-metric-icon is-amber"><ShoppingBasket /></span><strong>{catalog.metrics.products.toLocaleString("pt-BR")}</strong><small>Produtos cadastrados</small></div>
            <div><span className="pcn-metric-icon is-green"><BadgePercent /></span><strong>{heroSaving > 0 ? money(heroSaving) : "—"}</strong><small>Diferença encontrada agora</small></div>
            <div><span className="pcn-metric-icon is-violet"><Store /></span><strong>{catalog.metrics.stores}</strong><small>Lojas parceiras</small></div>
            <div><span className="pcn-metric-icon is-amber"><CheckCircle2 /></span><strong>Feijó-AC</strong><small>Nossa cidade</small></div>
          </div>
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><h2>O comércio de Feijó, lado a lado.</h2><p>Abra uma loja para ver catálogo, atualização e preços disponíveis.</p></div><Link to="/estabelecimentos">Ver todas as lojas <ArrowRight /></Link></div>
          <div className="pcn-stores">
            {featuredStores.map((store) => <Link className="pcn-store" key={store.id} to={`/estabelecimento/${store.slug}`}>
              <span className="pcn-store__mark" style={{ background: store.color }}>{store.name.slice(0, 1)}</span>
              <strong>{store.name}</strong><small>{store.neighborhood || "Feijó"}</small><b>{store.products} produtos</b>
            </Link>)}
            <Link className="pcn-store pcn-store--all" to="/estabelecimentos"><span>+</span><strong>Ver todas</strong><small>{catalog.metrics.stores} lojas</small></Link>
          </div>
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><h2>Comece pelo que está na sua lista.</h2></div><Link to="/buscar">Ver todos os produtos <ArrowRight /></Link></div>
          <div className="pcn-categories">
            {categoryItems.map((item) => {
              const Icon = item.icon;
              const content = <><span className="pcn-category__icon"><Icon /></span><strong>{item.label}</strong><small>Encontrar preços</small></>;
              return "href" in item ? <Link className="pcn-category" key={item.label} to={item.href}>{content}</Link> : <button className="pcn-category" key={item.label} type="button" onClick={() => searchCategory(item.query)}>{content}</button>;
            })}
          </div>
        </section>

        <section className="pcn-smart pcn-shell">
          <div className="pcn-smart__copy"><h2>Uma lista. Várias lojas. A rota que pesa menos no bolso.</h2><p>Adicione os itens da semana e deixe o PreçoCerto organizar os melhores preços disponíveis.</p><Link to="/cesta-basica">Montar minha cesta <ArrowRight /></Link></div>
          <div className="pcn-smart__image" aria-hidden="true" />
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><h2>Diferenças que merecem comparação.</h2><p>O mesmo item pode custar bem diferente pela cidade.</p></div><Link to="/buscar">Comparar mais <ArrowRight /></Link></div>
          <div className="pcn-products">
            {featuredProducts.map((product) => <article className="pcn-product" key={product.id}>
              <button className="pcn-product__open" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Ver detalhes de ${product.name}`}>
                <span className="pcn-product__saving">Economize {money(Math.max(0, product.maxPrice - product.minPrice))}</span>
                <span className="pcn-product__media"><ProductImage product={product} /></span>
                <small>{product.brand || "Produto local"}</small><strong>{product.name}</strong>
                <div><span><small>a partir de</small><b>{money(product.minPrice)}</b></span><ArrowRight /></div>
              </button>
            </article>)}
          </div>
        </section>

        <section className="pcn-how pcn-shell">
          <div className="pcn-section__head"><div><h2>Da busca à escolha em quatro passos.</h2></div></div>
          <div className="pcn-how__grid">
            <div><b>01</b><Search /><h3>Pesquise</h3><p>Digite o produto que você quer comprar.</p></div>
            <div><b>02</b><Store /><h3>Compare</h3><p>Veja preços em diferentes estabelecimentos.</p></div>
            <div><b>03</b><ShoppingBasket /><h3>Monte sua cesta</h3><p>Organize sua lista de compras em um só lugar.</p></div>
            <div><b>04</b><BadgePercent /><h3>Economize</h3><p>Escolha onde seu dinheiro rende mais.</p></div>
          </div>
        </section>

        <section className="pcn-merchant pcn-shell">
          <div><h2>Seu comércio no momento em que Feijó decide onde comprar.</h2><p>Publique catálogo, atualize preços e transforme intenção em visita.</p></div>
          <Link to="/lojista">Quero ser parceiro <ArrowRight /></Link>
        </section>
      </main>

      <footer className="pcn-footer">
        <div className="pcn-shell pcn-footer__top">
          <Link className="pcn-brand" to="/"><span className="pcn-brand__mark"><TrendingDown /></span><span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span></Link>
          <p>Preços locais para escolhas mais inteligentes.</p>
          <nav aria-label="Links do rodapé"><Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Lojas</Link><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Contato</Link><Link to="/lojista">Sou lojista</Link></nav>
        </div>
        <div className="pcn-shell pcn-footer__bottom">
          <span>© 2026 PreçoCerto <i aria-hidden="true">·</i> Desenvolvido por Franc Denis</span><span>Feito em Feijó, Acre</span>
        </div>
      </footer>

      {selectedProduct && typeof document !== "undefined" && createPortal(
        <div className="pcn-product-dialog" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="pcn-product-dialog-title">
            <button className="pcn-product-dialog__close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Fechar detalhes"><X /></button>
            <span className="pcn-product-dialog__image"><ProductImage product={selectedProduct} /></span>
            <div>
              <small>{selectedProduct.brand || "Produto local"} · {selectedProduct.category || "Categoria não informada"}</small>
              <h2 id="pcn-product-dialog-title">{selectedProduct.name}</h2>
              <p><Store /> {selectedProduct.establishment || "Comércio local"}</p>
              <p>{selectedProduct.size ? `Tamanho: ${selectedProduct.size}` : ""}{selectedProduct.unit ? ` · Unidade: ${selectedProduct.unit}` : ""}</p>
              {selectedProduct.barcode && <p>Código de barras: <b>{selectedProduct.barcode}</b></p>}
              <div className="pcn-product-dialog__price">
                <span>menor preço</span><strong>{money(selectedProduct.minPrice)}</strong><small>Média {money(selectedProduct.avgPrice)} · Maior {money(selectedProduct.maxPrice)}</small>
              </div>
              <button type="button" onClick={() => setSelectedProduct(null)}>Fechar <X /></button>
            </div>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}
