import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, BadgePercent, CheckCircle2, Heart, LogIn, MapPin, Menu, Moon, PackageSearch,
  Search, ShieldCheck, ShoppingBasket, Store, Sun, Tag, TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import "./HomeNext.css";
import "./HomeUnified2026.css";
import "../styles/PrecoCertoReform2026.css";

gsap.registerPlugin(ScrollTrigger);

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
  const pageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 54);
  const [query, setQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [catalog, setCatalog] = useState<CatalogPayload>({ products: initialCatalog.products, stores: initialCatalog.stores, metrics: verifiedDatasetMetrics, updatedAt: initialCatalog.updatedAt });

  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; window.localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { let active = true; fetchCatalog().then((result) => { if (active) setCatalog(result); }).catch(() => undefined); return () => { active = false; }; }, []);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setSearchDialogOpen(false); setSelectedProduct(null); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  useEffect(() => {
    if (!selectedProduct) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusable = () => [...(modalRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? [])].filter(element => !element.hasAttribute("disabled"));
    requestAnimationFrame(() => focusable()[0]?.focus());
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable(); if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", trap);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", trap); previousFocus?.focus(); };
  }, [selectedProduct]);
  useEffect(() => { const updateHeader = () => setHeaderScrolled(window.scrollY > 54); window.addEventListener("scroll", updateHeader, { passive: true }); return () => window.removeEventListener("scroll", updateHeader); }, []);

  const featuredProducts = useMemo(() => [...catalog.products].filter((product) => product.minPrice > 0).sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice)).slice(0, 5), [catalog.products]);
  const featuredStores = useMemo(() => [...catalog.stores].sort((a, b) => b.products - a.products).slice(0, 5), [catalog.stores]);
  const heroProduct = featuredProducts[0] ?? catalog.products[0];
  const heroSaving = heroProduct ? Math.max(0, heroProduct.maxPrice - heroProduct.minPrice) : 0;
  const normalizedQuery = normalizeSearch(query);
  const hasSearchQuery = normalizedQuery.length > 0;
  const suggestions = useMemo(() => {
    const term = normalizeSearch(query); if (!term) return []; const tokens = term.split(/\s+/).filter(Boolean);
    return catalog.products.map((product) => {
      const name = normalizeSearch(product.name), brand = normalizeSearch(product.brand || ""), category = normalizeSearch(product.category || ""), store = normalizeSearch(product.establishment || ""), size = normalizeSearch(product.size || "");
      const haystack = `${name} ${brand} ${category} ${store} ${size}`; if (!tokens.every((token) => haystack.includes(token))) return null;
      let score = 100; if (name === term) score = 0; else if (name.startsWith(term)) score = 10; else if (name.includes(term)) score = 20; else if (brand.startsWith(term)) score = 30; else if (brand.includes(term)) score = 40; else if (category.includes(term)) score = 50; else if (store.includes(term)) score = 60;
      return { product, score };
    }).filter((entry): entry is { product: Product; score: number } => Boolean(entry)).sort((a, b) => a.score - b.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR")).slice(0, 12).map((entry) => entry.product);
  }, [catalog.products, query]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!hasSearchQuery) { setSearchDialogOpen(false); return; } setSelectedProduct(null); setSearchDialogOpen(true); };
  const updateSearchQuery = (value: string) => { setQuery(value); setSelectedProduct(null); setSearchDialogOpen(normalizeSearch(value).length > 0); };
  const clearSearch = () => { setQuery(""); setSearchDialogOpen(false); setSelectedProduct(null); };
  const searchCategory = (term: string) => { setQuery(term); setSelectedProduct(null); setSearchDialogOpen(true); };
  const chooseSuggestion = (product: Product) => { setSearchDialogOpen(false); setQuery(product.name); setSelectedProduct(product); };

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".pcn-hero__copy > *", { y: 22, opacity: 0, duration: .65, stagger: .07, ease: "power3.out" });
    gsap.from(".pcn-receipt", { x: 30, rotate: 1.5, opacity: 0, duration: .8, delay: .18, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".pcn-section, .pcn-basket, .pcn-merchant").forEach((section) => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 88%", once: true }, y: 26, opacity: 0, duration: .65, ease: "power2.out" });
    });
  }, { scope: pageRef });

  return <div className="pcn-home pc-next" ref={pageRef}>
    <header className={`pcn-header ${headerScrolled ? "pcn-header--scrolled" : ""}`}>
      <div className="pcn-utility"><div className="pcn-shell"><span><MapPin aria-hidden="true" /> Feijó, Acre</span><span><i aria-hidden="true" /> Catálogo local em atualização contínua</span><Link to="/colaborar">Viu um preço diferente? Colabore</Link></div></div>
      <div className="pcn-shell pcn-header__inner"><Link className="pcn-brand" to="/" aria-label="PreçoCerto — página inicial"><span className="pcn-brand__mark"><TrendingDown aria-hidden="true" /></span><span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span></Link>
        <nav className="pcn-nav" aria-label="Navegação principal"><Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/farmacias">Farmácias</Link><Link to="/cesta-basica">Cesta inteligente</Link><Link to="/lojista">Para lojistas</Link></nav>
        <div className="pcn-actions"><Link className="pcn-icon-link" to="/favoritos" aria-label="Favoritos"><Heart aria-hidden="true" /></Link><button className="pcn-theme" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label="Alternar tema"><Sun aria-hidden="true" /><Moon aria-hidden="true" /></button><Link className="pcn-login" to="/login"><LogIn aria-hidden="true" /> Entrar</Link><button className="pcn-menu" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="pcn-mobile-navigation" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
      {menuOpen && <nav className="pcn-mobile-nav" id="pcn-mobile-navigation" aria-label="Navegação móvel"><Link to="/buscar" onClick={() => setMenuOpen(false)}>Pesquisar</Link><Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link><Link to="/farmacias" onClick={() => setMenuOpen(false)}>Categorias</Link><Link to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link><Link to="/lojista" onClick={() => setMenuOpen(false)}>Para lojistas</Link></nav>}
    </header>
    <main>
      <section className="pcn-hero"><div className="pcn-hero__photo" aria-hidden="true" /><div className="pcn-hero__veil" aria-hidden="true" /><div className="pcn-shell pcn-hero__content"><div className="pcn-hero__copy"><span className="pcn-eyebrow"><CheckCircle2 aria-hidden="true" /> Ao vivo em Feijó · preços verificados</span><h1>Compare antes<br /><span>de comprar.</span></h1><p>Preços locais organizados para você decidir melhor — antes de sair de casa.</p>
        <div className="pcn-search-shell"><form className="pcn-search" onSubmit={submitSearch} role="search"><Search aria-hidden="true" /><input id="pcn-home-search" value={query} onFocus={() => hasSearchQuery && setSearchDialogOpen(true)} onChange={(event) => updateSearchQuery(event.target.value)} placeholder="Busque produto, marca ou loja" aria-label="Buscar produto, marca ou estabelecimento" autoComplete="off" />{hasSearchQuery && <button className="pcn-search__clear" type="button" onClick={clearSearch} aria-label="Limpar pesquisa"><X aria-hidden="true" /></button>}<button className="pcn-search__submit" type="submit">Buscar <ArrowRight aria-hidden="true" /></button></form>
          {searchDialogOpen && hasSearchQuery && <div className="pcn-search-dropdown" role="listbox" aria-label="Produtos encontrados"><div className="pcn-search-dropdown__head"><span>Resultados para <b>“{query.trim()}”</b></span><small>{suggestions.length} {suggestions.length === 1 ? "produto" : "produtos"}</small></div><div className="pcn-search-dropdown__list">{suggestions.length ? suggestions.map((product) => <button key={product.id} type="button" role="option" aria-selected={selectedProduct?.id === product.id} onClick={() => chooseSuggestion(product)} aria-label={`Abrir ${product.name}`}><span className="pcn-search-dropdown__thumb"><ProductImage product={product} /></span><span className="pcn-search-dropdown__info"><b>{product.name}</b><small>{product.establishment || "Comércio local"}</small></span><strong>{money(product.minPrice)}</strong><ArrowRight aria-hidden="true" /></button>) : <p>Nenhum produto relacionado a “{query.trim()}” foi encontrado.</p>}</div></div>}
        </div><div className="pcn-quick"><button type="button" onClick={() => searchCategory("arroz")}><Tag /> Arroz</button><button type="button" onClick={() => searchCategory("café")}><ShoppingBasket /> Café</button><button type="button" onClick={() => searchCategory("carne")}><TrendingDown /> Carnes</button></div></div>
        {heroProduct && <aside className="pcn-receipt" aria-label="Resumo de economia do produto em destaque"><div className="pcn-receipt__top"><span>RECIBO DE ECONOMIA · AGORA</span><BadgePercent aria-hidden="true" /></div><small>Escolhendo o menor preço, você economiza</small><strong className="pcn-receipt__saving">{money(heroSaving)}</strong><p>{heroProduct.name}</p><div className="pcn-receipt__rows"><span>Menor preço <b>{money(heroProduct.minPrice)}</b></span><span>Maior preço <b>{money(heroProduct.maxPrice)}</b></span>{heroProduct.offers?.length ? <span>Comparado em <b>{heroProduct.offers.length} lojas</b></span> : <span>Oferta em <b>{heroProduct.establishment || "comércio local"}</b></span>}</div><button type="button" onClick={() => navigate(`/buscar?q=${encodeURIComponent(heroProduct.name)}`)}>Abrir comparação <ArrowRight aria-hidden="true" /></button><em>Coleta local · verifique antes de sair</em></aside>}
      </div></section>
      <div className="pcn-metrics-wrap" aria-label="Resumo do catálogo"><div className="pcn-shell pcn-metrics"><div><span className="pcn-metric-icon is-blue"><Tag /></span><strong>{catalog.metrics.prices.toLocaleString("pt-BR")}</strong><small>Preços verificados</small></div><div><span className="pcn-metric-icon is-amber"><ShoppingBasket /></span><strong>{catalog.metrics.products.toLocaleString("pt-BR")}</strong><small>Produtos cadastrados</small></div><div><span className="pcn-metric-icon is-green"><BadgePercent /></span><strong>{heroSaving > 0 ? money(heroSaving) : "—"}</strong><small>Diferença encontrada agora</small></div><div><span className="pcn-metric-icon is-violet"><Store /></span><strong>{catalog.metrics.stores}</strong><small>Estabelecimentos parceiros</small></div><div><span className="pcn-metric-icon is-amber"><CheckCircle2 /></span><strong>Feijó-AC</strong><small>Nossa cidade</small></div></div></div>
      <section className="pcn-section pcn-shell"><div className="pcn-section__head"><div><h2>O comércio de Feijó, lado a lado.</h2><p>Abra uma loja para ver catálogo, atualização e preços disponíveis.</p></div><Link to="/estabelecimentos">Ver todas as lojas <ArrowRight /></Link></div><div className="pcn-stores">{featuredStores.map((store) => <Link className="pcn-store" key={store.id} to={`/estabelecimento/${store.slug}`}><span className="pcn-store__mark" style={{ background: store.color }}>{store.name.slice(0, 1)}</span><strong>{store.name}</strong><small>{store.neighborhood || "Feijó"}</small><span>{store.products} produtos <ArrowRight /></span></Link>)}</div></section>
      <section className="pcn-section pcn-products-section"><div className="pcn-shell"><div className="pcn-section__head"><div><h2>Onde a diferença aparece.</h2><p>Produtos reais do catálogo com variação de preço entre estabelecimentos.</p></div><Link to="/buscar">Explorar catálogo <ArrowRight /></Link></div><div className="pcn-products">{featuredProducts.map((product) => <article className="pcn-product" key={product.id}><button className="pcn-product__open" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Abrir detalhes de ${product.name}`}><span className="pcn-product__image"><ProductImage product={product} /></span><span className="pcn-product__copy"><small>{product.category}</small><strong>{product.name}</strong><span>{product.size || product.brand}</span></span><span className="pcn-product__price"><small>a partir de</small><b>{money(product.minPrice)}</b>{product.maxPrice > product.minPrice && <em>até {money(product.maxPrice)}</em>}</span></button></article>)}</div></div></section>
      <section className="pcn-section pcn-shell"><div className="pcn-section__head"><div><h2>Comece pelo que você precisa.</h2><p>Atalhos diretos para categorias frequentes.</p></div></div><div className="pcn-categories">{categoryItems.map(({ label, icon: Icon, ...item }) => "href" in item ? <Link className="pcn-category" key={label} to={item.href}><Icon /><strong>{label}</strong><ArrowRight /></Link> : <button className="pcn-category" key={label} type="button" onClick={() => searchCategory(item.query)}><Icon /><strong>{label}</strong><ArrowRight /></button>)}</div></section>
      <section className="pcn-basket"><div className="pcn-shell pcn-basket__inner"><div><span className="pcn-eyebrow"><ShoppingBasket /> Cesta inteligente</span><h2>Uma lista. Várias lojas.<br />A melhor combinação de preços.</h2><p>Monte sua cesta e deixe o PreçoCerto indicar onde cada item custa menos.</p><Link to="/cesta-basica">Montar minha cesta <ArrowRight /></Link></div><div className="pcn-basket__visual" aria-hidden="true"><span><ShoppingBasket /></span><div><small>Economia potencial</small><strong>{heroSaving > 0 ? money(heroSaving * 2) : "Compare sua cesta"}</strong><em>comparando itens do catálogo</em></div></div></div></section>
      <section className="pcn-merchant"><div className="pcn-shell pcn-merchant__inner"><div><span className="pcn-eyebrow"><Store /> Você tem um comércio em Feijó?</span><h2>Coloque seus preços onde o cliente já está comparando.</h2><p>Cadastre sua loja, mantenha o catálogo atualizado e transforme pesquisa em visita e venda.</p></div><Link to="/lojista">Conhecer área do lojista <ArrowRight /></Link></div></section>
    </main>
    <footer className="pcn-footer"><div className="pcn-shell pcn-footer__top"><div><Link className="pcn-brand pcn-brand--footer" to="/"><span className="pcn-brand__mark"><TrendingDown /></span><span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span></Link><p>Compare antes. Economize de verdade.</p></div><div><strong>Comparar</strong><Link to="/buscar">Buscar produtos</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/farmacias">Farmácias</Link></div><div><strong>PreçoCerto</strong><Link to="/sobre">Sobre</Link><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Fale conosco</Link></div><div><strong>Parceiros</strong><Link to="/lojista">Cadastrar comércio</Link><Link to="/painel-lojista">Painel do lojista</Link></div></div><div className="pcn-shell pcn-footer__bottom"><span>© 2026 PreçoCerto</span></div></footer>
    <nav className="pcn-mobile-dock" aria-label="Navegação principal do aplicativo"><Link aria-current="page" to="/"><TrendingDown/><span>Início</span></Link><Link to="/buscar"><Search/><span>Buscar</span></Link><Link to="/cesta-basica"><ShoppingBasket/><span>Cesta</span></Link><Link to="/estabelecimentos"><Store/><span>Estabelecimentos</span></Link><Link to="/favoritos"><Heart/><span>Favoritos</span></Link></nav>
    {selectedProduct && createPortal(<div className="pcn-modal" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedProduct.name}`}><button className="pcn-modal__backdrop" type="button" aria-label="Fechar detalhes" onClick={() => setSelectedProduct(null)} /><article className="pcn-modal__card" ref={modalRef}><button className="pcn-modal__close" type="button" aria-label="Fechar" onClick={() => setSelectedProduct(null)}><X /></button><div className="pcn-modal__media"><ProductImage product={selectedProduct} /></div><div className="pcn-modal__body"><small>{selectedProduct.category}</small><h2>{selectedProduct.name}</h2><p>{selectedProduct.size || selectedProduct.brand}</p><div className="pcn-modal__prices"><span><small>Menor preço</small><strong>{money(selectedProduct.minPrice)}</strong></span><span><small>Maior preço</small><strong>{money(selectedProduct.maxPrice)}</strong></span></div><button type="button" onClick={() => navigate(`/buscar?q=${encodeURIComponent(selectedProduct.name)}`)}>Comparar este produto <ArrowRight /></button></div></article></div>, document.body)}
  </div>;
}
