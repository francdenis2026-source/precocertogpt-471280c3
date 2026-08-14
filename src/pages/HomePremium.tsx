import { FormEvent, KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpen, Check, ChevronRight, HeartPulse, LogIn, MapPin, Menu, Moon,
  PackageSearch, Search, ShieldCheck, ShoppingBasket, Store, Sun, Tag,
  TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { suggestProducts } from "../lib/productSearch";
import { JsonLd } from "../components/JsonLd";
import "./HomePremium.css";

type Theme = "light" | "dark";

const initialCatalog = buildCatalog();
const popularSearches = ["Arroz", "Café", "Leite", "Carne", "Limpeza"];
const categories = [
  { name: "Mercados", description: "Cesta e dia a dia", icon: ShoppingBasket, query: "mercado" },
  { name: "Açougues", description: "Carnes e cortes", icon: Tag, query: "carne" },
  { name: "Farmácias", description: "Saúde e cuidados", icon: HeartPulse, href: "/farmacias" },
  { name: "Livros locais", description: "Autores de Feijó", icon: BookOpen, href: "/dorinha-barroso" },
] as const;

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const cleanMeta = (...values: Array<string | null | undefined>) => values
  .map((value) => value?.trim()).filter((value): value is string => Boolean(value && value !== "-")).join(" · ");
const updatedLabel = (value?: string) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Dados locais disponíveis";
  return `Atualizado ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value))}`;
};

const trustedProductImage = (product: Product) => {
  const key = `${product.name} ${product.brand ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const choices = [
    { terms: ["arroz", "bernardo"], url: "/products/arroz-branco-bernardo-1kg.jpg" },
    { terms: ["cafe", "3 coracoes"], url: "/products/cafe-3-coracoes-500g.jpg" },
    { terms: ["leite", "italac"], url: "/products/leite-italac-1l.jpg" },
    { terms: ["feijao", "bernardo"], url: "/products/feijao-carioca-bernardo-1kg.jpg" },
    { terms: ["acucar", "uniao"], url: "/products/acucar-uniao-1kg.jpg" },
  ];
  return choices.find((choice) => choice.terms.every((term) => key.includes(term)))?.url;
};

function ProductVisual({ product, eager = false }: { product: Product; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = resolveProductImage(product) ?? trustedProductImage(product);
  useEffect(() => setFailed(false), [image]);
  if (!image || failed) return <PackageSearch aria-hidden="true" />;
  return <img src={image} alt={product.name} width="220" height="180" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />;
}

const readTheme = (): Theme => typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
function bestOffer(product: Product) {
  return [...(product.offers ?? [])].filter((offer) => Number.isFinite(offer.value) && offer.value > 0).sort((a, b) => a.value - b.value)[0] ?? {
    establishmentId: product.establishmentId, establishmentSlug: product.establishmentSlug,
    establishment: product.establishment, neighborhood: product.neighborhood,
    storeColor: product.storeColor, value: product.minPrice, capturedAt: product.capturedAt,
  };
}

export function HomePremium() {
  const navigate = useNavigate();
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const [resultsPosition, setResultsPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogClosing, setDialogClosing] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [catalog, setCatalog] = useState<CatalogPayload>({ products: initialCatalog.products, stores: initialCatalog.stores, metrics: verifiedDatasetMetrics, updatedAt: initialCatalog.updatedAt });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((result) => { if (active) { setCatalog(result); setCatalogError(false); } })
      .catch(() => { if (active) setCatalogError(true); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let scheduled = false;
    const update = () => { setHeaderScrolled(window.scrollY > 18); scheduled = false; };
    const onScroll = () => { if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeSearch = (event: PointerEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node) && !resultsRef.current?.contains(event.target as Node)) { setSearchOpen(false); setActiveResult(-1); }
    };
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, []);

  const closeDialog = () => {
    setDialogClosing(true);
    window.setTimeout(() => { setSelectedProduct(null); setDialogClosing(false); }, 170);
  };

  useEffect(() => {
    if (!selectedProduct) return;
    dialogTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    const background = [...document.querySelectorAll<HTMLElement>(".pcx-home > :not(.pcx-modal)")];
    background.forEach((element) => element.setAttribute("inert", ""));
    window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { setSelectedProduct(null); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      background.forEach((element) => element.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
      dialogTriggerRef.current?.focus();
    };
  }, [selectedProduct]);

  const suggestions = useMemo(() => query.trim().length < 2 ? [] : suggestProducts(catalog.products, query, 6).filter((product) => product.minPrice > 0), [catalog.products, query]);
  const resultsVisible = searchOpen && query.trim().length >= 2;

  useLayoutEffect(() => {
    if (!resultsVisible) return;
    const updatePosition = () => {
      const areaRect = searchAreaRef.current?.getBoundingClientRect();
      const formRect = searchAreaRef.current?.querySelector(".pcx-search")?.getBoundingClientRect();
      if (areaRect && formRect) setResultsPosition({ top: formRect.bottom, left: areaRect.left, width: areaRect.width });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [resultsVisible]);
  const opportunities = useMemo(() => catalog.products.filter((product) => product.minPrice > 0)
    .sort((a, b) => Number(Boolean(trustedProductImage(b))) - Number(Boolean(trustedProductImage(a)))
      || (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice)).slice(0, 5), [catalog.products]);
  const comparisonProduct = opportunities[0] ?? catalog.products[0];
  const comparisonOffers = useMemo(() => comparisonProduct ? [...(comparisonProduct.offers ?? [])].filter((offer) => offer.value > 0).sort((a, b) => a.value - b.value).slice(0, 3) : [], [comparisonProduct]);
  const headlineSaving = comparisonProduct ? Math.max(0, comparisonProduct.maxPrice - comparisonProduct.minPrice) : 0;
  const selectedOffers = selectedProduct ? (() => {
    const offers = [...(selectedProduct.offers ?? [])].filter((offer) => offer.value > 0).sort((a, b) => a.value - b.value).slice(0, 5);
    return offers.length ? offers : [bestOffer(selectedProduct)];
  })() : [];
  const hasComparison = selectedOffers.length > 1;

  const productsStructuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Produtos com maior variação de preço em Feijó (AC)",
    itemListElement: opportunities.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        ...(product.brand && product.brand !== "-" ? { brand: { "@type": "Brand", name: product.brand } } : {}),
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "BRL",
          lowPrice: Number(product.minPrice.toFixed(2)),
          highPrice: Number(product.maxPrice.toFixed(2)),
          offerCount: (product.offers ?? []).filter((offer) => offer.value > 0).length || 1,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  }), [opportunities]);

  const openProduct = (product: Product) => { setDialogClosing(false); setSelectedProduct(product); };
  const search = (term: string) => navigate(term.trim() ? `/buscar?q=${encodeURIComponent(term.trim())}` : "/buscar");
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = activeResult >= 0 ? suggestions[activeResult] : undefined;
    if (selected) { openProduct(selected); setSearchOpen(false); return; }
    search(query);
  };
  const handleSearchKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { setSearchOpen(false); setActiveResult(-1); return; }
    if (!searchOpen || !suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveResult((current) => (current + 1) % suggestions.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveResult((current) => current <= 0 ? suggestions.length - 1 : current - 1); }
    else if (event.key === "Enter" && activeResult >= 0) { event.preventDefault(); openProduct(suggestions[activeResult]); setSearchOpen(false); }
  };

  return (
    <div className="pcx-home">
      <a className="pcx-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className={`pcx-header${headerScrolled ? " is-scrolled" : ""}`}>
        <div className="pcx-shell pcx-header__inner">
          <Link className="pcx-brand" to="/" aria-label="PreçoCerto — página inicial">
            <span className="pcx-brand__mark"><TrendingDown aria-hidden="true" /></span><span>preço<strong>certo</strong></span>
          </Link>
          <nav className="pcx-nav" aria-label="Navegação principal">
            <Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Lojas</Link><Link to="/farmacias">Farmácias</Link><Link to="/favoritos">Favoritos</Link><Link to="/colaborar">Colaborar</Link>
          </nav>
          <div className="pcx-header__actions">
            <button className="pcx-theme-toggle" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "dark"} title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}>
              <span className="pcx-theme-toggle__thumb" aria-hidden="true" />
              <Sun className="pcx-theme-toggle__sun" aria-hidden="true" />
              <Moon className="pcx-theme-toggle__moon" aria-hidden="true" />
            </button>
            <Link className="pcx-login" to="/login" aria-label="Entrar na plataforma"><LogIn aria-hidden="true" /> Entrar</Link>
            <Link className="pcx-merchant" to="/lojista">Área do lojista <ArrowRight aria-hidden="true" /></Link>
            <button className="pcx-menu-button" type="button" aria-expanded={menuOpen} aria-controls="pcx-mobile-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
          </div>
        </div>
        {menuOpen && <nav id="pcx-mobile-menu" className="pcx-mobile-menu" aria-label="Navegação mobile">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Lojas locais</Link><Link to="/farmacias" onClick={() => setMenuOpen(false)}>Farmácias</Link><Link to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link><Link to="/colaborar" onClick={() => setMenuOpen(false)}>Colaborar</Link><Link to="/login" onClick={() => setMenuOpen(false)}>Entrar na plataforma</Link><Link to="/lojista" onClick={() => setMenuOpen(false)}>Área do lojista</Link>
        </nav>}
      </header>

      <main id="conteudo">
        <JsonLd id="pcx-products-jsonld" data={productsStructuredData} />
        <section className="pcx-hero" aria-labelledby="pcx-title">
          <div className="pcx-shell pcx-hero__grid">
            <div className="pcx-hero__copy">
              <h1 id="pcx-title">Comparação de preços em Feijó: <em>saiba antes</em> onde comprar.</h1>
              <p>Em Feijó, compare o mesmo produto nas lojas da cidade e chegue sabendo onde seu dinheiro rende mais.</p>
              <div className="pcx-search-area" ref={searchAreaRef}>
                <form className="pcx-search" role="search" onSubmit={submitSearch}>
                  <label htmlFor="pcx-search-input">O que você quer comprar?</label>
                  <div className="pcx-search__control"><Search aria-hidden="true" />
                    <input id="pcx-search-input" name="produto" value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); setActiveResult(-1); }} onFocus={() => setSearchOpen(true)} onKeyDown={handleSearchKeys} placeholder="Ex.: arroz, café, leite…" autoComplete="off" aria-autocomplete="list" aria-controls="pcx-search-results" aria-expanded={searchOpen && query.trim().length >= 2} aria-activedescendant={activeResult >= 0 ? `pcx-result-${activeResult}` : undefined} />
                    <button type="submit">Comparar <ArrowRight aria-hidden="true" /></button>
                  </div>
                </form>
                {resultsVisible && typeof document !== "undefined" && createPortal(<div ref={resultsRef} id="pcx-search-results" className="pcx-results pcx-results--floating" role="listbox" aria-label="Sugestões de produtos" style={{ top: resultsPosition.top, left: resultsPosition.left, width: resultsPosition.width }}>
                  {suggestions.length ? suggestions.map((product, index) => { const offer = bestOffer(product); return <button id={`pcx-result-${index}`} key={`${product.id}-${product.establishmentId}`} type="button" role="option" aria-selected={activeResult === index} className={activeResult === index ? "is-active" : ""} onPointerDown={(event) => event.preventDefault()} onClick={() => { openProduct(product); setSearchOpen(false); }}>
                    <span className="pcx-result__image"><ProductVisual product={product} /></span><span className="pcx-result__details"><strong>{product.name}</strong><small>{cleanMeta(product.brand, product.size)}</small><b><Store aria-hidden="true" /> {offer.establishment || "Loja local"}</b></span><span className="pcx-result__price"><small>a partir de</small><strong>{money(product.minPrice)}</strong></span>
                  </button>; }) : <div className="pcx-results__empty"><PackageSearch aria-hidden="true" /><span><strong>Nenhum produto encontrado</strong><small>Tente arroz, leite ou limpeza.</small></span></div>}
                </div>, document.querySelector(".pcx-home") ?? document.body)}
                <div className="pcx-quick" aria-label="Buscas populares"><span>Mais buscados</span>{popularSearches.map((term) => <button key={term} type="button" onClick={() => search(term)}>{term}</button>)}</div>
              </div>
            </div>

            <div className="pcx-hero__visual">
              <figure className="pcx-hero__portrait">
                <img src="/hero-precocerto-comparacao-v2.webp" alt="Pessoa comparando preços pelo celular enquanto faz compras no mercado" width="1776" height="920" fetchPriority="high" />
                <figcaption><span><MapPin aria-hidden="true" /> Feijó, Acre</span><strong>Compare antes de escolher.</strong></figcaption>
              </figure>
              <aside className="pcx-receipt" aria-label="Resumo da melhor oportunidade atual">
              <div className="pcx-receipt__head"><span>RECIBO DE ECONOMIA</span><small>{catalogError ? "base local" : updatedLabel(catalog.updatedAt)}</small></div>
              {comparisonProduct ? <>
                <div className="pcx-receipt__product"><span><ProductVisual product={comparisonProduct} eager /></span><div><small>Oportunidade de hoje</small><h2>{comparisonProduct.name}</h2><p>{cleanMeta(comparisonProduct.brand, comparisonProduct.size)}</p></div></div>
                <div className="pcx-receipt__line"><span>Menor preço</span><strong>{money(comparisonProduct.minPrice)}</strong></div>
                <div className="pcx-receipt__line"><span>Maior preço</span><strong>{money(comparisonProduct.maxPrice)}</strong></div>
                <div className="pcx-receipt__total"><span>Diferença encontrada</span><strong>{money(headlineSaving)}</strong></div>
                <button type="button" onClick={() => openProduct(comparisonProduct)}>Ver onde comprar <ChevronRight aria-hidden="true" /></button>
              </> : <div className="pcx-receipt__loading">Carregando dados locais…</div>}
              </aside>
            </div>
          </div>
        </section>

        <section className="pcx-essentials pcx-shell" aria-labelledby="categorias-title">
          <div className="pcx-section__head"><div><h2 id="categorias-title">Comece pelo essencial.</h2></div><Link to="/buscar">Ver tudo <ArrowRight aria-hidden="true" /></Link></div>
          <div className="pcx-categories">{categories.map((category) => {
            const Icon = category.icon; const content = <><span className="pcx-category__icon"><Icon aria-hidden="true" /></span><span><strong>{category.name}</strong><small>{category.description}</small></span><ChevronRight aria-hidden="true" /></>;
            return "href" in category ? <Link key={category.name} className="pcx-category" to={category.href}>{content}</Link> : <button key={category.name} className="pcx-category" type="button" onClick={() => search(category.query)}>{content}</button>;
          })}</div>
        </section>

        <section className="pcx-market" aria-labelledby="oportunidades-title"><div className="pcx-shell">
          <div className="pcx-section__head"><div><h2 id="oportunidades-title">Diferenças que cabem no bolso.</h2><p>Os produtos com maior variação de preço entre as lojas.</p></div><Link to="/buscar">Comparar mais <ArrowRight aria-hidden="true" /></Link></div>
          <div className="pcx-products" aria-busy={catalogLoading}>{catalogLoading && <span className="pcx-sr-only" role="status" aria-live="polite">Carregando oportunidades…</span>}{catalogLoading ? Array.from({ length: 5 }, (_, index) => <div className="pcx-product pcx-product--skeleton" key={index} aria-hidden="true"><span /><i /><i /></div>) : opportunities.map((product, index) => {
            const saving = Math.max(0, product.maxPrice - product.minPrice); const offer = bestOffer(product);
            return <button key={`${product.id}-${index}`} className="pcx-product" type="button" onClick={() => openProduct(product)} title={`Comparar ${product.name}`}>
              <span className="pcx-product__saving">− {money(saving)}</span><span className="pcx-product__media"><ProductVisual product={product} /></span>
              <span className="pcx-product__body"><small>{cleanMeta(product.brand, product.size) || "Produto local"}</small><strong title={product.name}>{product.name}</strong><span className="pcx-product__store"><Store aria-hidden="true" /><b>{offer.establishment || "Loja local"}</b></span><span className="pcx-product__price"><small>a partir de</small><b>{money(product.minPrice)}</b></span></span>
            </button>;
          })}</div>
        </div></section>

        <section className="pcx-story pcx-story--community"><div className="pcx-shell pcx-story__inner"><div><h2>Preço claro muda o caminho da compra.</h2><p>Consulte antes de sair, compare sem pressa e escolha o comércio que faz sentido para você.</p></div><Link to="/buscar">Pesquisar um produto <ArrowRight aria-hidden="true" /></Link></div></section>

        {comparisonProduct && <section className="pcx-compare" aria-labelledby="comparacao-title"><div className="pcx-shell pcx-compare__grid">
          <div className="pcx-compare__copy"><h2 id="comparacao-title">O mesmo item. Outros preços.</h2><p>O PreçoCerto organiza as ofertas disponíveis e mostra a diferença sem esconder a fonte.</p><ul><li><ShieldCheck aria-hidden="true" /> dados identificados por loja</li><li><Check aria-hidden="true" /> comparação simples e gratuita</li></ul></div>
          <div className="pcx-compare__board"><div className="pcx-compare__title"><span><ProductVisual product={comparisonProduct} /></span><div><small>Comparando agora</small><strong>{comparisonProduct.name}</strong></div></div>{comparisonOffers.map((offer, index) => <div className={`pcx-offer${index === 0 ? " is-best" : ""}`} key={`${offer.establishmentId}-${offer.value}`}><span>{index === 0 ? "Melhor escolha" : `Opção ${index + 1}`}</span><div><strong>{offer.establishment || "Loja local"}</strong><small><MapPin aria-hidden="true" /> {offer.neighborhood || "Feijó"}</small></div><b>{money(offer.value)}</b></div>)}<button type="button" onClick={() => openProduct(comparisonProduct)}>Abrir comparação completa <ArrowRight aria-hidden="true" /></button></div>
        </div></section>}

        <section className="pcx-story pcx-story--merchant"><div className="pcx-shell pcx-story__inner"><div><h2>Sua loja, perto de quem já quer comprar.</h2><p>Atualize preços, apresente seu catálogo e seja encontrado por clientes da cidade.</p></div><Link to="/lojista">Conhecer área do lojista <ArrowRight aria-hidden="true" /></Link></div></section>
      </main>

      <footer className="pcx-footer"><div className="pcx-shell pcx-footer__inner"><Link className="pcx-brand" to="/"><span className="pcx-brand__mark"><TrendingDown aria-hidden="true" /></span><span>preço<strong>certo</strong></span></Link><p>Comparação local para decisões melhores em Feijó.</p><nav aria-label="Links do rodapé"><Link to="/sobre">Sobre</Link><Link to="/contato">Contato</Link><Link to="/privacidade">Privacidade</Link><Link to="/favoritos">Favoritos</Link><Link to="/lojista">Lojistas</Link></nav><div className="pcx-footer__meta"><small>© {new Date().getFullYear()} PreçoCerto</small><button className="pcx-footer__credit pc-dev-credit" type="button" aria-haspopup="dialog" aria-label="Sobre o desenvolvedor Franc D'nis" onClick={() => window.dispatchEvent(new Event("precocerto:developer-about"))}>dev&gt;<strong>Franc D&apos;nis</strong>&gt;</button></div></div></footer>

      {selectedProduct && <div className={`pcx-modal${dialogClosing ? " is-closing" : ""}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
        <section ref={dialogRef} className="pcx-dialog" role="dialog" aria-modal="true" aria-labelledby="pcx-dialog-title">
          <button ref={closeRef} className="pcx-dialog__close" type="button" onClick={closeDialog} aria-label="Fechar comparação"><X aria-hidden="true" /></button>
          <div className="pcx-dialog__media"><ProductVisual product={selectedProduct} eager /></div>
          <div className="pcx-dialog__content"><h2 id="pcx-dialog-title">{selectedProduct.name}</h2><p>{cleanMeta(selectedProduct.brand, selectedProduct.size)}</p>
            <div className={`pcx-dialog__summary${hasComparison ? "" : " is-single"}`}><div><small>Melhor preço</small><strong>{money(selectedProduct.minPrice)}</strong></div>{hasComparison && <><div><small>Maior preço</small><strong>{money(selectedProduct.maxPrice)}</strong></div><div><small>Diferença</small><strong>{money(Math.max(0, selectedProduct.maxPrice - selectedProduct.minPrice))}</strong></div></>}</div>
            <div className="pcx-dialog__offers">{selectedOffers.map((offer, index) => <div key={`${offer.establishmentId}-${offer.value}-${index}`}><span><strong>{offer.establishment || "Loja local"}</strong><small><MapPin aria-hidden="true" /> {offer.neighborhood || "Feijó"}</small></span>{index === 0 && <em>menor preço</em>}<b>{money(offer.value)}</b></div>)}</div>
            <p className="pcx-dialog__source"><ShieldCheck aria-hidden="true" /> Consulte a loja antes de comprar. Preços podem mudar após a coleta.</p>
            <div className="pcx-dialog__actions"><Link to={`/buscar?q=${encodeURIComponent(selectedProduct.name)}`} onClick={closeDialog}>Ver na busca <ArrowRight aria-hidden="true" /></Link><button type="button" onClick={closeDialog}>Continuar explorando</button></div>
          </div>
        </section>
      </div>}
    </div>
  );
}
