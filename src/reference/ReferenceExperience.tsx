import { FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Building2,
  Check, CircleDollarSign, Eye, Heart, LayoutDashboard, ListChecks, LockKeyhole, Map as MapIcon,
  MapPin, Menu, Minus, Moon, PackageSearch, Plus, Search, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Store, Sun, Tag, Trash2, TrendingDown, UserRound, UsersRound, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { loadPlatformSummary } from "../lib/merchantPlatform";
import { loadSessionProfile, requestPasswordReset, signIn, signUp } from "../lib/roles";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { OnlinePresence } from "../components/OnlinePresence";
import "./ReferenceExperience.css";
import "./ReferencePages.css";
import "./ReferencePagesMore.css";
import "./ReferenceResponsive.css";
import "./CompactShell.css";
import "./TypographyScale.css";
import "./HomeStoryRefinement.css";
import "./InteractionPolish.css";
import "./TasteRefinement.css";
import "./DarkThemeRefinement.css";
import "./ProductCardRefinement.css";
import "./SearchResultsRefinement.css";
import "./MobileAppRefinement.css";
import "./ProductComparisonRefinement.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentage = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("pt-BR");

function ProductRangeSummary({ product }: { product: Product }) {
  const storeCount = product.storeCount || product.offers?.length || 1;
  const difference = Math.max(0, product.maxPrice - product.minPrice);

  if (storeCount <= 1) return <>{brl.format(product.minPrice)}<small>1 loja consultada</small></>;
  if (difference <= 0) return <>{brl.format(product.minPrice)}<small>Mesmo preço em {storeCount} lojas</small></>;

  return <>{brl.format(product.minPrice)} — {brl.format(product.maxPrice)}<small>{storeCount} lojas comparadas · diferença de {brl.format(difference)}</small></>;
}

function normalizeProductSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
}

type ProductComparisonOffer = {
  establishment: string;
  neighborhood: string;
  value: number;
};

function compareProductAcrossStores(products: Product[], selected: Product | null) {
  if (!selected) return null;

  const selectedName = normalizeProductSearch(selected.name);
  const selectedSize = normalizeProductSearch(selected.size || "");
  const selectedBarcode = normalizeProductSearch(selected.barcode || "");
  const matchingProducts = products.filter(product => {
    const barcode = normalizeProductSearch(product.barcode || "");
    if (selectedBarcode && barcode) return barcode === selectedBarcode;
    return normalizeProductSearch(product.name) === selectedName
      && normalizeProductSearch(product.size || "") === selectedSize;
  });

  const offers: ProductComparisonOffer[] = [];
  matchingProducts.forEach(product => {
    if (product.offers?.length) {
      product.offers.forEach(offer => {
        if (Number.isFinite(offer.value) && offer.value > 0) offers.push({
          establishment: offer.establishment || "Comércio local",
          neighborhood: offer.neighborhood || "Feijó",
          value: offer.value,
        });
      });
      return;
    }
    if (Number.isFinite(product.minPrice) && product.minPrice > 0) offers.push({
      establishment: product.establishment || "Comércio local",
      neighborhood: product.neighborhood || "Feijó",
      value: product.minPrice,
    });
  });

  const uniqueByStore = new Map<string, ProductComparisonOffer>();
  offers.forEach(offer => {
    const storeKey = normalizeProductSearch(offer.establishment);
    const current = uniqueByStore.get(storeKey);
    if (!current || offer.value < current.value) uniqueByStore.set(storeKey, offer);
  });

  const ranked = [...uniqueByStore.values()].sort((a, b) => a.value - b.value);
  if (!ranked.length) return null;
  const lowest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const difference = Math.max(0, highest.value - lowest.value);
  return {
    lowest,
    highest,
    difference,
    percentage: highest.value > 0 ? (difference / highest.value) * 100 : 0,
    storeCount: ranked.length,
  };
}

function productSearchScore(product: Product, rawQuery: string) {
  const term = normalizeProductSearch(rawQuery);
  if (!term) return 0;
  const name = normalizeProductSearch(product.name);
  const queryWords = term.split(/\s+/).filter(Boolean);
  const nameWords = name.split(/\s+/).filter(Boolean);
  if (name === term) return 0;
  if (name.startsWith(`${term} `)) return 1;
  if (name === term || name.endsWith(` ${term}`) || name.includes(` ${term} `)) return 2;
  if (name.includes(term)) return 3;
  if (queryWords.every(word => nameWords.includes(word))) return 4;
  if (queryWords.every(word => nameWords.some(nameWord => nameWord.startsWith(word)))) return 5;
  const context = normalizeProductSearch(`${product.brand} ${product.category} ${product.establishment}`);
  if (context.includes(term)) return 10;
  if (queryWords.every(word => context.includes(word))) return 11;
  if (queryWords.some(word => context.includes(word))) return 12;
  return 99;
}

function useCatalogState() {
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then(value => { if (active) setCatalog(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { catalog, loading };
}

function useCatalog() { return useCatalogState().catalog; }

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className="ref-brand" to="/" aria-label="PreçoCerto — início">
    {inverse
      ? <img className="ref-brand__inverse" src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" />
      : <><img className="ref-brand__light" src="/logo-preco-certo.svg" alt="PreçoCerto" /><img className="ref-brand__dark" src="/logo-preco-certo-inversa.svg" alt="" aria-hidden="true" /></>}
    <span>FEIJÓ · ACRE</span>
  </Link>;
}

function ProductVisual({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  return source && !failed
    ? <img src={source} alt={product.name} width="280" height="240" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
    : <span className="ref-product-fallback" role="img" aria-label={`Imagem de ${product.name} em atualização`}><span className="ref-product-fallback__mark"><PackageSearch aria-hidden="true" /></span><small>{product.category || "Produto local"}<em>Imagem em atualização</em></small></span>;
}

type BasketEntry = { productId: string; quantity: number };
const BASKET_KEY = "precocerto:active_basket_items";

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as Array<Partial<BasketEntry> & { id?: string | number }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({ productId: String(item.productId ?? item.id ?? ""), quantity: Math.max(1, Number(item.quantity || 1)) })).filter(item => item.productId);
  } catch { return []; }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function useBasket() {
  const [items, setItems] = useState<BasketEntry[]>(readBasket);
  useEffect(() => {
    const refresh = () => setItems(readBasket());
    window.addEventListener("storage", refresh);
    window.addEventListener("pc:basket-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("pc:basket-changed", refresh); };
  }, []);
  const update = (productId: string | number, delta: number) => {
    const id = String(productId);
    const current = readBasket();
    const found = current.find(item => item.productId === id);
    const next = found
      ? current.map(item => item.productId === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)
      : delta > 0 ? [...current, { productId: id, quantity: delta }] : current;
    writeBasket(next);
  };
  return { items, update, count: items.reduce((sum, item) => sum + item.quantity, 0) };
}

function ThemeButton() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  };
  return <button className="ref-theme" type="button" onClick={toggle} aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}>{dark ? <Sun /> : <Moon />}</button>;
}

function PublicHeader({ current }: { current?: "home" | "search" | "basket" | "stores" | "profile" }) {
  const [menu, setMenu] = useState(false);
  const { count } = useBasket();
  return <header className="ref-header"><div className="ref-shell ref-header__inner"><Brand />
    <span className="ref-location"><MapPin /><span><small>Você está em</small><strong>Feijó, AC</strong></span></span>
    {current === "home" && <OnlinePresence />}
    <nav className="ref-nav" aria-label="Navegação principal"><Link className={current === "home" ? "is-active" : ""} to="/">Início</Link><Link className={current === "search" ? "is-active" : ""} to="/buscar">Comparar preços</Link><Link className={current === "stores" ? "is-active" : ""} to="/estabelecimentos">Estabelecimentos</Link><Link className={current === "basket" ? "is-active" : ""} to="/cesta-basica">Lista {count > 0 && <b>{count}</b>}</Link></nav>
    <div className="ref-header__actions"><ThemeButton /><Link to="/favoritos" aria-label="Favoritos"><Heart /></Link><Link className="ref-signin" to="/login">Entrar</Link><button type="button" className="ref-menu" aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} onClick={() => setMenu(value => !value)}>{menu ? <X /> : <Menu />}</button></div>
  </div>{menu && <nav className="ref-mobile-menu"><Link to="/buscar">Comparar preços</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/cesta-basica">Lista de compras</Link><Link to="/lojista">Para comerciantes</Link></nav>}</header>;
}

function PublicFooter() {
  return <footer className="ref-footer"><div className="ref-shell ref-footer__inner"><div className="ref-footer__identity"><Brand inverse /><p>O preço certo perto de você.</p></div><nav aria-label="Navegação do rodapé"><Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Lojas</Link><Link to="/lojista">Comerciantes</Link><Link to="/fale-conosco">Contato</Link></nav><div className="ref-footer__meta"><span><BadgeCheck /> Preços locais verificados</span><small>Feito em Feijó por Franc D&apos;nis</small></div></div></footer>;
}

function AppDock({ current }: { current: "home" | "search" | "basket" | "stores" | "profile" }) {
  return <nav className="ref-dock" aria-label="Navegação principal do aplicativo">
    <Link className={current === "home" ? "is-active" : ""} to="/"><LayoutDashboard /><span>Início</span></Link>
    <Link className={current === "search" ? "is-active" : ""} to="/buscar"><Search /><span>Buscar</span></Link>
    <Link className={current === "basket" ? "is-active" : ""} to="/cesta-basica"><ShoppingBasket /><span>Lista</span></Link>
    <Link className={current === "stores" ? "is-active" : ""} to="/estabelecimentos"><Store /><span>Lojas</span></Link>
    <Link className={current === "profile" ? "is-active" : ""} to="/login"><UserRound /><span>Conta</span></Link>
  </nav>;
}

export function ReferenceHome() {
  const searchFormRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPointerActiveRef = useRef(false);
  const productDialogRef = useRef<HTMLDivElement>(null);
  const productDialogHistoryRef = useRef<string | null>(null);
  const { catalog, loading: catalogLoading } = useCatalogState();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<ReturnType<typeof compareProductAcrossStores>>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [featuredHour, setFeaturedHour] = useState(() => Math.floor(Date.now() / 3_600_000));
  const featured = useMemo(() => {
    const eligible = catalog.products.filter(product => product.minPrice > 0 && Boolean(resolveProductImage(product)));
    const byStore = new Map<string, Product[]>();
    eligible.forEach(product => {
      const storeKey = String(product.establishmentId || product.establishmentSlug || product.establishment).toLocaleLowerCase("pt-BR");
      if (!storeKey) return;
      byStore.set(storeKey, [...(byStore.get(storeKey) || []), product]);
    });
    const daySeed = Math.floor(featuredHour / 24);
    const hash = (value: string) => Array.from(value).reduce((total, character) => Math.imul(total ^ character.charCodeAt(0), 16777619) >>> 0, daySeed >>> 0);
    const stores = [...byStore.entries()].sort(([a], [b]) => hash(a) - hash(b));
    if (!stores.length) return [];
    const start = (featuredHour * 4) % stores.length;
    return Array.from({ length: Math.min(4, stores.length) }, (_, index) => stores[(start + index) % stores.length])
      .map(([storeKey, products], index) => products[hash(`${storeKey}:${featuredHour}:${index}`) % products.length]);
  }, [catalog.products, featuredHour]);
  const lead = useMemo(() => {
    const productsWithImage = catalog.products.filter(product => product.minPrice > 0 && Boolean(resolveProductImage(product)));
    if (!productsWithImage.length) return undefined;
    const seed = Math.imul(featuredHour ^ (featuredHour >>> 16), 2246822519) >>> 0;
    return productsWithImage[seed % productsWithImage.length];
  }, [catalog.products, featuredHour]);
  const receipt = useMemo(() => [...catalog.products].filter(product => product.minPrice > 0).sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice)).slice(0, 3), [catalog.products]);
  const searchResults = useMemo(() => {
    const term = normalizeProductSearch(query);
    if (!term) return [];
    return catalog.products
      .filter(product => product.minPrice > 0)
      .map(product => ({ product, score: productSearchScore(product, term) }))
      .filter(item => item.score < 99)
      .sort((a, b) => a.score - b.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
      .slice(0, 5)
      .map(item => item.product);
  }, [catalog.products, query]);
  useEffect(() => setActiveSearchIndex(-1), [query]);
  useEffect(() => {
    let cancelled = false;
    if (!selectedProduct) {
      setSelectedComparison(null);
      setComparisonLoading(false);
      return;
    }

    setSelectedComparison(null);
    setComparisonLoading(true);
    void fetchCatalog("", { force: true })
      .then(freshCatalog => {
        if (!cancelled) setSelectedComparison(compareProductAcrossStores(freshCatalog.products, selectedProduct));
      })
      .catch(() => {
        if (!cancelled) setSelectedComparison(null);
      })
      .finally(() => {
        if (!cancelled) setComparisonLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedProduct]);
  useEffect(() => {
    if (!selectedProduct) return;

    const marker = `product-dialog-${Date.now()}-${String(selectedProduct.id)}`;
    window.history.pushState({ ...window.history.state, productDialog: marker }, "", window.location.href);
    productDialogHistoryRef.current = marker;

    const handlePopState = () => {
      if (productDialogHistoryRef.current !== marker) return;
      productDialogHistoryRef.current = null;
      setSelectedProduct(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedProduct?.id]);

  const closeProductDialog = () => {
    if (productDialogHistoryRef.current) window.history.back();
    else setSelectedProduct(null);
  };

  const leaveProductDialog = () => {
    if (productDialogHistoryRef.current) {
      const nextState = { ...(window.history.state || {}) };
      delete nextState.productDialog;
      window.history.replaceState(nextState, "", window.location.href);
      productDialogHistoryRef.current = null;
    }
    setSelectedProduct(null);
  };

  useEffect(() => {
    let intervalId = 0;
    const remaining = 3_600_000 - (Date.now() % 3_600_000);
    const timeoutId = window.setTimeout(() => {
      setFeaturedHour(Math.floor(Date.now() / 3_600_000));
      intervalId = window.setInterval(() => setFeaturedHour(Math.floor(Date.now() / 3_600_000)), 3_600_000);
    }, remaining);
    return () => { window.clearTimeout(timeoutId); if (intervalId) window.clearInterval(intervalId); };
  }, []);
  useEffect(() => {
    if (!searchOpen || activeSearchIndex < 0) return;
    document.getElementById(`resultado-busca-${activeSearchIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeSearchIndex, searchOpen]);
  useEffect(() => {
    if (!searchOpen) return;
    const closeSearch = () => {
      setSearchOpen(false);
      setActiveSearchIndex(-1);
    };
    const isInsideSearch = (event: PointerEvent) => {
      if (searchFormRef.current?.contains(event.target as Node)) return true;
      const panel = document.getElementById("resultados-busca-home");
      if (!panel) return false;
      const bounds = panel.getBoundingClientRect();
      return event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (isInsideSearch(event)) {
        searchPointerActiveRef.current = true;
        return;
      }
      closeSearch();
    };
    const handlePointerEnd = () => {
      window.requestAnimationFrame(() => { searchPointerActiveRef.current = false; });
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (!searchPointerActiveRef.current && !searchFormRef.current?.contains(event.target as Node)) closeSearch();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerEnd, true);
    document.addEventListener("pointercancel", handlePointerEnd, true);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerEnd, true);
      document.removeEventListener("pointercancel", handlePointerEnd, true);
      document.removeEventListener("focusin", handleFocusIn);
      searchPointerActiveRef.current = false;
    };
  }, [searchOpen]);
  const clearSearch = () => {
    setQuery("");
    setSearchOpen(false);
    setActiveSearchIndex(-1);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };
  const submit = (event: FormEvent) => { event.preventDefault(); navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar"); };
  useEffect(() => {
    if (!selectedProduct) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const dialog = productDialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])') || []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProductDialog();
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      searchInputRef.current?.focus();
    };
  }, [selectedProduct]);
  return <div className="ref-page ref-home">
    <PublicHeader current="home" />
    <div className="ref-evolution-badge" role="status" aria-label="Este site está em evolução contínua">
      <span aria-hidden="true" />
      <strong>Site em evolução</strong>
    </div>

    <main id="conteudo-principal">
      <section className="ref-hero"><div className="ref-shell ref-hero__grid"><div className="ref-hero__copy">
        <span className="ref-kicker"><i /> AO VIVO EM FEIJÓ</span><h1>Compare antes<br /><em>de comprar.</em></h1>
        <p>Encontre os menores preços em mercados e mercearias de Feijó. Informação local para economizar todos os dias.</p>
        <form ref={searchFormRef} className={`ref-search${query ? " has-query" : ""}`} onSubmit={submit} role="search" onFocus={() => setSearchOpen(true)}><Search aria-hidden="true" /><input ref={searchInputRef} name="busca" autoComplete="off" value={query} onChange={event => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={event => { if (event.key === "ArrowDown" && searchResults.length) { event.preventDefault(); setSearchOpen(true); setActiveSearchIndex(index => Math.min(index + 1, searchResults.length - 1)); } else if (event.key === "ArrowUp" && searchResults.length) { event.preventDefault(); setSearchOpen(true); setActiveSearchIndex(index => index <= 0 ? searchResults.length - 1 : index - 1); } else if (event.key === "Home" && searchOpen && searchResults.length) { event.preventDefault(); setActiveSearchIndex(0); } else if (event.key === "End" && searchOpen && searchResults.length) { event.preventDefault(); setActiveSearchIndex(searchResults.length - 1); } else if (event.key === "Enter" && searchOpen && activeSearchIndex >= 0 && searchResults[activeSearchIndex]) { event.preventDefault(); setSearchOpen(false); setSelectedProduct(searchResults[activeSearchIndex]); } else if (event.key === "Escape") { event.preventDefault(); setSearchOpen(false); setActiveSearchIndex(-1); } }} placeholder="Buscar produto, marca ou mercado…" aria-label="Buscar produto, marca ou mercado" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())} aria-controls="resultados-busca-home" aria-activedescendant={activeSearchIndex >= 0 ? `resultado-busca-${activeSearchIndex}` : undefined} />{query && <button className="ref-search-clear" type="button" aria-label="Limpar pesquisa" title="Limpar pesquisa" onPointerDown={event => event.preventDefault()} onClick={clearSearch}><X aria-hidden="true" /><span>Limpar</span></button>}<button className="ref-search-submit" type="submit" aria-label="Ver todos os resultados">Comparar <ArrowRight /></button>{searchOpen && query.trim() && <div className="ref-search-results" id="resultados-busca-home" role="listbox" aria-label="Resultados da pesquisa"><header><span>Melhores correspondências</span><small aria-live="polite">{searchResults.length ? `${searchResults.length} ${searchResults.length === 1 ? "produto encontrado" : "produtos encontrados"}` : "Nenhum produto encontrado"}</small></header>{searchResults.length ? <div className="ref-search-results__list">{searchResults.map((product, index) => <button id={`resultado-busca-${index}`} key={product.id} type="button" role="option" aria-selected={activeSearchIndex === index} tabIndex={-1} className={activeSearchIndex === index ? "is-keyboard-active" : ""} onMouseEnter={() => setActiveSearchIndex(index)} onClick={() => { setSearchOpen(false); setActiveSearchIndex(-1); setSelectedProduct(product); }} aria-label={`Ver detalhes de ${product.name}, menor preço ${brl.format(product.minPrice)}`}><span className="ref-search-results__image"><ProductVisual product={product} /></span><span className="ref-search-results__copy"><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment || "Comércio local"}</em></span><span className="ref-search-results__price"><small>Menor preço</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight aria-hidden="true" /></button>)}</div> : <div className="ref-search-results__empty" role="status"><PackageSearch aria-hidden="true" /><div><strong>Não encontramos esse produto.</strong><span>Confira a escrita ou tente uma palavra do nome, como “arroz”, “leite” ou “sabão”.</span></div></div>}<footer><small><kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> fechar</small><button type="submit">Ver todos os resultados <ArrowRight aria-hidden="true" /></button></footer></div>}</form>
        <div className="ref-trust"><span><BadgeCheck /> Preços verificados</span><span><MapPin /> Hiperlocal</span><span><ShieldCheck /> Dados protegidos</span></div>
      </div>
      {catalogLoading ? <div className="ref-live-card ref-live-card--loading" aria-busy="true" aria-label="Carregando preço verificado"><div className="ref-live-card__top"><span>PREÇO VERIFICADO</span><small>Atualizando dados…</small></div><div className="ref-live-card__skeleton"><i /><div><i /><i /><i /></div></div><div className="ref-live-card__skeleton-prices"><i /><i /></div><span className="ref-live-card__loading-label">Consultando os preços mais recentes de Feijó…</span></div> : lead && <div className="ref-live-card"><div className="ref-live-card__top"><span>PREÇO VERIFICADO</span><small>Novo destaque a cada 60 min</small></div><div className="ref-live-card__product"><ProductVisual product={lead} eager /><div><small>{lead.category}</small><h2>{lead.name}</h2><p>{lead.size || lead.brand}</p></div></div><div className="ref-live-card__prices"><div><small>Menor preço</small><strong>{brl.format(lead.minPrice)}</strong><span>{lead.establishment}</span></div><div><small>Economize até</small><strong>{brl.format(Math.max(0, lead.maxPrice - lead.minPrice))}</strong><span>comparando agora</span></div></div><button type="button" onClick={() => navigate(`/produto/${lead.slug || lead.id}`)}>Ver comparação completa <ArrowRight /></button></div>}
      </div></section>

      <section className="ref-proof"><div className="ref-shell ref-proof__grid"><div><strong>{integer.format(catalog.metrics.prices)}</strong><span>preços verificados</span></div><div><strong>{integer.format(catalog.metrics.products)}</strong><span>produtos monitorados</span></div><div><strong>{integer.format(catalog.metrics.stores)}</strong><span>estabelecimentos locais</span></div><div><strong>Feijó</strong><span>feito para nossa cidade</span></div></div></section>

      <section className="ref-section ref-shell"><div className="ref-section__heading"><div><h2>Onde seu dinheiro rende mais.</h2><p className="ref-section__rotation-note">Seleção renovada a cada 60 minutos, com um comércio diferente em cada destaque.</p></div><Link to="/buscar">Ver todos os preços <ArrowRight /></Link></div>
        <div className="ref-price-board">{featured.map((product, index) => <Link to={`/produto/${product.slug || product.id}`} className="ref-price-row" key={product.id}><span className="ref-price-rank">{String(index + 1).padStart(2, "0")}</span><span className="ref-price-image"><ProductVisual product={product} /></span><span className="ref-price-name"><small>{product.category}</small><strong>{product.name}</strong><em>{product.size || product.brand}</em></span><span className="ref-price-store"><small>melhor em</small><strong>{product.establishment}</strong><em>{product.neighborhood}</em></span><span className="ref-price-value"><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong><em>{product.storeCount || product.offers?.length || 1} ofertas</em></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="ref-economy"><div className="ref-shell ref-economy__grid"><div><h2>Compare sua lista.<br />Sinta a diferença no bolso.</h2><p>Compare a mesma lista em diferentes lojas e veja, em valores reais, quanto pode economizar no seu bolso.</p><div className="ref-economy__signals"><span><BadgeCheck /> {receipt.length} itens comparados</span><span><MapPin /> Preços de Feijó</span></div><Link to="/cesta-basica">Montar lista de compras <ArrowRight /></Link></div><aside className="ref-receipt" aria-label="Simulação de economia da lista"><header className="ref-receipt__top"><div><strong>PREÇO<span>CERTO</span></strong><small>Comparação local</small></div><span>SIMULAÇÃO</span></header><div className="ref-receipt__meta"><span>Feijó · Acre</span><span>Atualizado hoje</span></div>{receipt.map(product => <div className="ref-receipt__item" key={product.id}><div><span>{product.name}</span><small>{product.establishment}</small></div><strong>{brl.format(product.minPrice)}</strong><em>Economia {brl.format(Math.max(0, product.maxPrice - product.minPrice))}</em></div>)}<div className="ref-receipt__summary"><div><span>Total nos menores preços</span><strong>{brl.format(receipt.reduce((sum, item) => sum + item.minPrice, 0))}</strong></div></div><div className="ref-receipt__total"><div><span>Você pode economizar</span><small>nesta lista</small></div><strong>{brl.format(receipt.reduce((sum, item) => sum + Math.max(0, item.maxPrice - item.minPrice), 0))}</strong></div><footer className="ref-receipt__note"><BadgeCheck /><span>Preços locais verificados<small>Consulte antes da compra.</small></span></footer></aside></div></section>

      <section className="ref-local"><div className="ref-shell ref-local__inner"><div><h2>O mercado do seu bairro,<br />na sua mão.</h2><p>Explore catálogos, veja atualizações e encontre lojas perto de você.</p></div><div className="ref-local__actions"><Link to="/estabelecimentos"><Store /> Ver estabelecimentos <ArrowRight /></Link><Link to="/lojista"><Building2 /> Cadastrar meu comércio <ArrowRight /></Link></div></div></section>
    </main>
    <PublicFooter /><AppDock current="home" />
    {selectedProduct && <div className="ref-product-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeProductDialog(); }}><div ref={productDialogRef} className="ref-product-dialog" role="dialog" aria-modal="true" aria-labelledby="produto-modal-titulo"><button className="ref-product-dialog__close" type="button" aria-label="Fechar detalhes do produto" onClick={closeProductDialog}><X aria-hidden="true" /></button><div className="ref-product-dialog__visual"><span>{selectedProduct.category}</span><ProductVisual product={selectedProduct} eager /></div><section><span className="ref-product-dialog__eyebrow"><BadgeCheck /> PREÇO LOCAL VERIFICADO</span><h2 id="produto-modal-titulo">{selectedProduct.name}</h2><p>{[selectedProduct.brand, selectedProduct.size].filter(Boolean).join(" · ")}</p><div className="ref-product-dialog__prices" aria-busy={comparisonLoading}><div className={comparisonLoading ? "is-loading" : ""}><small>Menor preço ao vivo</small><strong>{comparisonLoading ? "Consultando…" : brl.format(selectedComparison?.lowest.value ?? selectedProduct.minPrice)}</strong><span>{comparisonLoading ? "Buscando estabelecimentos" : selectedComparison?.lowest.establishment || selectedProduct.establishment || "Comércio local"}</span></div><div className={comparisonLoading ? "is-loading" : (selectedComparison?.difference || 0) > 0 ? "has-savings" : "no-savings"}><small>Diferença encontrada</small><strong>{comparisonLoading ? "Atualizando preços…" : (selectedComparison?.difference || 0) > 0 ? brl.format(selectedComparison!.difference) : "Sem diferença ainda"}</strong><span>{comparisonLoading ? "Comparando o mesmo produto em lojas distintas" : (selectedComparison?.difference || 0) > 0 ? `${percentage.format(selectedComparison!.percentage)}% · de ${brl.format(selectedComparison!.highest.value)} para ${brl.format(selectedComparison!.lowest.value)}` : `${selectedComparison?.storeCount || 1} ${(selectedComparison?.storeCount || 1) === 1 ? "loja consultada" : "lojas consultadas"}`}</span></div></div><div className="ref-product-dialog__store"><MapPin aria-hidden="true" /><span><small>Melhor opção encontrada</small><strong>{comparisonLoading ? "Atualizando estabelecimento…" : selectedComparison?.lowest.establishment || selectedProduct.establishment || "Comércio local"}</strong><em>{comparisonLoading ? "Consulta ao vivo em andamento" : selectedComparison?.lowest.neighborhood || selectedProduct.neighborhood || "Feijó, Acre"}</em></span></div><Link to={`/produto/${selectedProduct.slug || selectedProduct.id}`} onClick={leaveProductDialog}>Ver comparação completa <ArrowRight aria-hidden="true" /></Link></section></div></div>}
  </div>;
}

export function ReferenceProductPage() {
  const { identifier = "" } = useParams();
  const { catalog, loading: catalogLoading } = useCatalogState();
  const { isFavorite, toggleFavorite } = useFavorites();
  const basket = useBasket();
  const product = useMemo(() => catalog.products.find(item => String(item.id) === identifier || item.slug === identifier), [catalog.products, identifier]);
  if (catalogLoading) return <div className="ref-page ref-product-page"><header className="ref-product-header"><Link to="/buscar" aria-label="Voltar"><ArrowLeft /></Link><Brand /><span /></header><main id="conteudo-principal" className="ref-product-loading" aria-busy="true" aria-live="polite"><span className="ref-spinner" /><h1>Carregando o produto correto…</h1><p>Confirmando imagem, preços e estabelecimento no catálogo.</p></main></div>;
  if (!product) return <main className="ref-empty">Produto não encontrado.</main>;
  const offers = product.offers?.length ? [...product.offers].sort((a, b) => a.value - b.value) : [{ establishment: product.establishment, neighborhood: product.neighborhood, value: product.minPrice, capturedAt: product.capturedAt, establishmentId: product.establishmentId, establishmentSlug: product.establishmentSlug, storeColor: product.storeColor }];
  const favorite = isFavorite(product.id);
  return <div className="ref-page ref-product-page"><header className="ref-product-header"><Link to="/buscar" aria-label="Voltar"><ArrowLeft /></Link><Brand /><button type="button" aria-label={favorite ? "Remover dos favoritos" : "Favoritar"} onClick={() => void toggleFavorite(product.id)}><Heart fill={favorite ? "currentColor" : "none"} /></button></header>
    <main id="conteudo-principal" className="ref-product-main"><div className="ref-product-visual"><span>{product.category}</span><ProductVisual product={product} eager /></div><section className="ref-product-content"><span className="ref-product-eyebrow">{product.category}</span><h1>{product.name}</h1><p>{product.size || product.brand}</p><div className="ref-range"><small>{offers.length > 1 ? "MENOR E MAIOR PREÇO VERIFICADOS" : "PREÇO VERIFICADO"} <BadgeCheck /></small><strong>{offers.length > 1 && product.maxPrice > product.minPrice ? <>{brl.format(product.minPrice)} <i>—</i> {brl.format(product.maxPrice)}</> : brl.format(product.minPrice)}</strong><span>{offers.length > 1 ? `${offers.length} lojas comparadas${product.maxPrice > product.minPrice ? ` · diferença de ${brl.format(product.maxPrice - product.minPrice)}` : " · mesmo preço encontrado"}` : "1 loja consultada · comparação ainda indisponível"}</span></div><div className="ref-product-actions"><button type="button" onClick={() => void toggleFavorite(product.id)}><Heart fill={favorite ? "currentColor" : "none"} /> {favorite ? "Favoritado" : "Favoritar"}</button><button type="button" onClick={() => basket.update(product.id, 1)}><ShoppingBasket /> {basket.items.some(item => item.productId === String(product.id)) ? "Adicionar mais um" : "Adicionar à lista"}</button></div><div className="ref-offers-head"><div><span>ONDE ENCONTRAR</span><h2>Mais barato em Feijó</h2></div><Link to="/estabelecimentos"><MapPin /> Ver no mapa</Link></div><div className="ref-offers">{offers.map((offer, index) => <Link to={`/estabelecimento/${offer.establishmentSlug || offer.establishmentId}`} key={`${offer.establishmentId}-${offer.value}`} className={index === 0 ? "is-best" : ""}><span className="ref-offer-rank">{index + 1}</span><span className="ref-offer-store"><strong>{offer.establishment || "Comércio local"}</strong><small>{offer.neighborhood || "Feijó"} · atualizado hoje</small></span>{index === 0 && <em>MENOR PREÇO</em>}<strong className="ref-offer-price">{brl.format(offer.value)}</strong><ArrowRight /></Link>)}</div><Link className="ref-history" to={`/buscar?q=${encodeURIComponent(product.name)}`}><BarChart3 /> Ver histórico e produtos similares <ArrowRight /></Link><p className="ref-community"><BadgeCheck /> Preços coletados e organizados para ajudar a comunidade de Feijó.</p></section></main><AppDock current="search" /></div>;
}

export function ReferenceSearchPage() {
  const catalog = useCatalog();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(40);
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(catalog.products.map(item => item.category)))], [catalog.products]);
  const products = useMemo(() => {
    const term = normalizeProductSearch(deferredQuery);
    return catalog.products
      .map(product => ({ product, score: productSearchScore(product, term) }))
      .filter(({ product, score }) => score < 99 && (category === "Todos" || product.category === category))
      .sort((a, b) => a.score - b.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
      .map(({ product }) => product);
  }, [catalog.products, category, deferredQuery]);
  useEffect(() => setVisibleCount(40), [category, deferredQuery]);
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const searchUpdating = deferredQuery !== query;
  const submit = (event: FormEvent) => { event.preventDefault(); setParams(query.trim() ? { q: query.trim() } : {}); };
  return <div className="ref-page ref-directory"><PublicHeader current="search" /><main id="conteudo-principal" className="ref-shell ref-directory__main">
    <div className="ref-page-title"><div><span>PREÇOS LOCAIS VERIFICADOS</span><h1>Compare sem adivinhar.</h1><p>Encontre o menor preço entre mercados e mercearias de Feijó.</p></div><div className="ref-update"><BadgeCheck /><span>Base verificada<small>atualizada hoje</small></span></div></div>
    <form className="ref-directory-search" role="search" onSubmit={submit}><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Produto, marca ou estabelecimento" aria-label="Buscar preços" /><button type="submit">Buscar <ArrowRight /></button></form>
    <div className="ref-filter-row" aria-label="Filtros de categoria"><SlidersHorizontal /><span>Categorias</span>{categories.map(item => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <section className={`ref-results${searchUpdating ? " is-updating" : ""}`} aria-busy={searchUpdating}><header><div><span>RESULTADOS EM FEIJÓ</span><h2>{products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}</h2></div><small>{searchUpdating ? "Atualizando resultados…" : "Correspondência do nome primeiro; menor preço como desempate"}</small></header>
      <div className="ref-results-table"><div className="ref-results-table__head"><span>Produto</span><span>Melhor estabelecimento</span><span title="Menor e maior preço encontrados em estabelecimentos diferentes">Menor — maior</span><span>Menor preço</span><span /></div>{visibleProducts.map(product => <Link key={product.id} to={`/produto/${product.slug || product.id}`} className="ref-result-row"><span className="ref-result-product"><i><ProductVisual product={product} /></i><span><small>{product.category} · {product.brand}</small><strong>{product.name}</strong><em>{product.size}</em></span></span><span className="ref-result-store"><i style={{ background: product.storeColor }} /><span><strong>{product.establishment}</strong><small>{product.neighborhood}</small></span></span><span className="ref-result-range"><ProductRangeSummary product={product} /></span><strong className="ref-result-price">{brl.format(product.minPrice)}<small><BadgeCheck /> verificado</small></strong><ArrowRight /></Link>)}</div>
      {visibleCount < products.length && <button className="ref-results-more" type="button" onClick={() => setVisibleCount(count => Math.min(count + 40, products.length))}>Mostrar mais resultados <span>{products.length - visibleCount} restantes</span></button>}
      {!products.length && <div className="ref-empty"><PackageSearch /><h2>Nenhum produto encontrado</h2><p>Tente outro nome, marca ou categoria.</p></div>}
    </section>
  </main><PublicFooter /><AppDock current="search" /></div>;
}

export function ReferenceStoresPage() {
  const catalog = useCatalog();
  const [query, setQuery] = useState("");
  const stores = catalog.stores.filter(store => `${store.name} ${store.neighborhood}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="ref-page ref-directory"><PublicHeader current="stores" /><main id="conteudo-principal" className="ref-shell ref-directory__main">
    <div className="ref-page-title"><div><span>COMÉRCIO DE FEIJÓ</span><h1>Mercados perto de você.</h1><p>Compare cobertura, catálogos e preços atualizados de cada estabelecimento.</p></div><div className="ref-update"><Store /><span>{catalog.metrics.stores} parceiros<small>em bairros de Feijó</small></span></div></div>
    <div className="ref-directory-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar mercado ou bairro" aria-label="Buscar estabelecimento" /><Link to="/lojista">Cadastrar comércio <ArrowRight /></Link></div>
    <div className="ref-store-layout"><section className="ref-store-list"><header><span>ESTABELECIMENTOS VERIFICADOS</span><strong>{stores.length} resultados</strong></header>{stores.map((store, index) => <Link to={`/estabelecimento/${store.slug}`} key={store.id} className="ref-store-row"><span className="ref-store-index">{String(index + 1).padStart(2, "0")}</span><i style={{ background: store.color }}><Store /></i><span><small>{store.neighborhood}</small><strong>{store.name}</strong><em>{store.products} produtos no catálogo</em></span><span className="ref-store-badge"><BadgeCheck /> verificado</span><ArrowRight /></Link>)}</section><aside className="ref-map-card"><div className="ref-map-grid" aria-hidden="true"><MapPin /><span className="p1" /><span className="p2" /><span className="p3" /><span className="p4" /></div><div><MapIcon /><span><strong>Feijó, Acre</strong><small>{stores.length} estabelecimentos visíveis</small></span></div></aside></div>
  </main><PublicFooter /><AppDock current="stores" /></div>;
}

export function ReferenceStorePage() {
  const { identifier = "" } = useParams();
  const catalog = useCatalog();
  const store = catalog.stores.find(item => String(item.id) === identifier || item.slug === identifier) || catalog.stores[0];
  const products = catalog.products.filter(item => item.offers?.some(offer => String(offer.establishmentId) === String(store?.id)) || String(item.establishmentId) === String(store?.id));
  if (!store) return <ReferenceNotFound />;
  return <div className="ref-page ref-directory"><PublicHeader current="stores" /><main id="conteudo-principal" className="ref-shell ref-directory__main"><Link className="ref-backline" to="/estabelecimentos"><ArrowLeft /> Todos os estabelecimentos</Link>
    <section className="ref-store-hero"><i style={{ background: store.color }}><Store /></i><div><span>PARCEIRO VERIFICADO · {store.neighborhood}</span><h1>{store.name}</h1><p>{store.products} produtos monitorados · preços atualizados hoje</p></div><BadgeCheck /></section>
    <section className="ref-results"><header><div><span>CATÁLOGO LOCAL</span><h2>Preços deste estabelecimento</h2></div><small>Compare antes de sair</small></header><div className="ref-product-grid">{(products.length ? products : catalog.products.slice(0, 6)).map(product => <Link key={product.id} to={`/produto/${product.slug}`}><div><ProductVisual product={product} /></div><small>{product.category}</small><strong>{product.name}</strong><span>{product.size}</span><footer><em>a partir de</em><b>{brl.format(product.minPrice)}</b></footer></Link>)}</div></section>
  </main><PublicFooter /><AppDock current="stores" /></div>;
}

export function ReferenceBasketPage() {
  const catalog = useCatalog();
  const basket = useBasket();
  const rows = basket.items.map(entry => ({ entry, product: catalog.products.find(item => String(item.id) === entry.productId) })).filter(row => row.product);
  const total = rows.reduce((sum, row) => sum + (row.product?.minPrice || 0) * row.entry.quantity, 0);
  const highest = rows.reduce((sum, row) => sum + (row.product?.maxPrice || 0) * row.entry.quantity, 0);
  return <div className="ref-page ref-directory"><PublicHeader current="basket" /><main id="conteudo-principal" className="ref-shell ref-directory__main">
    <div className="ref-page-title"><div><span>SUA LISTA INTELIGENTE</span><h1>Uma cesta, a melhor escolha.</h1><p>Veja quanto sua compra pode custar e onde existe economia.</p></div><div className="ref-update"><ShoppingBasket /><span>{basket.count} itens<small>salvos neste dispositivo</small></span></div></div>
    {!rows.length ? <div className="ref-empty ref-empty--large"><ShoppingBasket /><h2>Sua lista está vazia</h2><p>Adicione produtos para comparar o custo da compra.</p><Link to="/buscar">Buscar produtos <ArrowRight /></Link></div> : <div className="ref-basket-layout"><section className="ref-basket-list"><header><span>PRODUTOS</span><strong>{rows.length} selecionados</strong></header>{rows.map(({ entry, product }) => product && <article key={product.id}><div className="ref-basket-product"><i><ProductVisual product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.size}</em></span></div><div className="ref-quantity"><button type="button" aria-label={`Diminuir ${product.name}`} onClick={() => basket.update(product.id, -1)}>{entry.quantity === 1 ? <Trash2 /> : <Minus />}</button><strong>{entry.quantity}</strong><button type="button" aria-label={`Aumentar ${product.name}`} onClick={() => basket.update(product.id, 1)}><Plus /></button></div><div className="ref-basket-price"><small>melhor preço</small><strong>{brl.format(product.minPrice * entry.quantity)}</strong><em>{product.establishment}</em></div></article>)}</section><aside className="ref-basket-summary"><span>RESUMO DA COMPARAÇÃO</span><h2>Sua economia</h2><div><span>Melhor combinação</span><strong>{brl.format(total)}</strong></div><div><span>Compra sem comparar</span><strong>{brl.format(highest)}</strong></div><footer><span>Economia possível</span><strong>{brl.format(Math.max(0, highest - total))}</strong><small><BadgeCheck /> preços verificados hoje</small></footer><Link to="/estabelecimentos">Ver onde comprar <ArrowRight /></Link></aside></div>}
  </main><PublicFooter /><AppDock current="basket" /></div>;
}

export function ReferenceFavoritesPage() {
  const catalog = useCatalog();
  const { favoriteIds, loading, toggleFavorite } = useFavorites();
  const products = catalog.products.filter(item => favoriteIds.includes(String(item.id)));
  return <div className="ref-page ref-directory"><PublicHeader /><main id="conteudo-principal" className="ref-shell ref-directory__main"><div className="ref-page-title"><div><span>SEUS PRODUTOS</span><h1>Favoritos para acompanhar.</h1><p>Reúna aqui os preços que você quer consultar de novo.</p></div><div className="ref-update"><Heart /><span>{favoriteIds.length} favoritos<small>sincronizados com sua conta</small></span></div></div>{loading ? <div className="ref-empty"><span className="ref-spinner" /><p>Carregando favoritos…</p></div> : products.length ? <div className="ref-product-grid">{products.map(product => <article key={product.id}><button type="button" onClick={() => void toggleFavorite(product.id)} aria-label={`Remover ${product.name}`}><X /></button><Link to={`/produto/${product.slug}`}><div><ProductVisual product={product} /></div><small>{product.category}</small><strong>{product.name}</strong><span>{product.size}</span><footer><em>a partir de</em><b>{brl.format(product.minPrice)}</b></footer></Link></article>)}</div> : <div className="ref-empty ref-empty--large"><Heart /><h2>Nenhum favorito ainda</h2><p>Salve produtos para consultar os preços mais rápido.</p><Link to="/buscar">Explorar preços <ArrowRight /></Link></div>}</main><PublicFooter /><AppDock current="profile" /></div>;
}

export function ReferenceAuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const catalog = useCatalog();
  const sample = catalog.products[0];
  const [accountType, setAccountType] = useState<"consumer" | "merchant">("consumer");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget); const email = String(data.get("email") || "").trim(); const password = String(data.get("password") || ""); const result = mode === "login" ? await signIn(email, password) : await signUp(email, password, String(data.get("name") || "").trim()); setBusy(false); if (result.error) setMessage(result.error); else navigate(accountType === "merchant" ? "/painel-lojista" : "/"); };
  const recover = async () => { const email = prompt("Digite seu e-mail para recuperar a senha:")?.trim(); if (!email) return; const result = await requestPasswordReset(email); setMessage(result.error || "Enviamos as instruções para o seu e-mail."); };
  return <div className="ref-auth"><aside className="ref-auth__story"><Brand inverse /><div><span className="ref-kicker"><MapPin /> FEIJÓ, ACRE</span><h1>O preço certo<br />perto de você.</h1><p>Compare preços. Economize no seu bairro.</p>{sample && <div className="ref-auth__comparison"><div><ProductVisual product={sample} /><span><small>{sample.category}</small><strong>{sample.name}</strong><em>{sample.size}</em></span></div><div><span>{sample.establishment}</span><strong>{brl.format(sample.minPrice)}</strong></div><div><span>Maior preço encontrado</span><strong>{brl.format(sample.maxPrice)}</strong></div><footer><span>ECONOMIA</span><strong>{brl.format(Math.max(0, sample.maxPrice - sample.minPrice))}</strong></footer></div>}</div><small>Preços reais · Hiperlocal · Confiável</small></aside>
    <main className="ref-auth__form"><Link className="ref-auth__back" to="/"><ArrowLeft /> Voltar ao PreçoCerto</Link><div className="ref-auth__card"><span className="ref-auth__eyebrow">{mode === "login" ? "BEM-VINDO DE VOLTA" : "COMECE AGORA"}</span><h2>{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h2><p>{mode === "login" ? "Acesse preços, favoritos e seus últimos comparativos." : "Escolha como você quer usar o PreçoCerto."}</p>
      <div className="ref-account-tabs"><button type="button" className={accountType === "consumer" ? "is-active" : ""} onClick={() => setAccountType("consumer")}><UserRound /> Consumidor<small>Quero comparar preços</small></button><button type="button" className={accountType === "merchant" ? "is-active" : ""} onClick={() => setAccountType("merchant")}><Store /> Comerciante<small>Quero divulgar ofertas</small></button></div>
      <form onSubmit={submit}>{mode === "register" && <label>Nome completo<input name="name" required autoComplete="name" /></label>}<label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{message && <p className="ref-auth__message" role="status">{message}</p>}<button className="ref-auth__submit" type="submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar minha conta"}<ArrowRight /></button></form>
      {mode === "login" && <button type="button" className="ref-auth__recover" onClick={recover}>Esqueci minha senha</button>}<div className="ref-auth__switch"><span>{mode === "login" ? "Ainda não tem conta?" : "Já possui uma conta?"}</span><Link to={mode === "login" ? "/cadastro" : "/login"}>{mode === "login" ? "Criar conta" : "Entrar"}</Link></div><p className="ref-auth__safe"><LockKeyhole /> Seus dados estão protegidos.</p></div><small className="ref-auth__signature">Feito em Feijó por Franc D&apos;nis</small></main><AppDock current="profile" />
  </div>;
}

export function ReferenceMerchantPage() {
  const benefits = [[BarChart3, "Preços organizados", "Atualize ofertas e acompanhe seu posicionamento local."], [UsersRound, "Mais alcance", "Seja encontrado por quem já está pesquisando o que comprar."], [ShieldCheck, "Presença verificada", "Um perfil comercial claro, confiável e conectado a Feijó."]] as const;
  return <div className="ref-page ref-merchant"><PublicHeader /><main id="conteudo-principal"><section className="ref-merchant-hero"><div className="ref-shell"><span className="ref-kicker"><Store /> PARA O COMÉRCIO LOCAL</span><h1>Seu mercado na decisão de compra.</h1><p>Publique preços, organize seu catálogo e aproxime sua loja dos consumidores de Feijó.</p><div><Link to="/cadastro?tipo=lojista">Cadastrar meu comércio <ArrowRight /></Link><Link to="/login">Já tenho acesso</Link></div></div></section><section className="ref-shell ref-merchant-benefits">{benefits.map(([Icon, title, copy]) => <article key={title}><Icon /><span>0{benefits.findIndex(item => item[1] === title) + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</section><section className="ref-shell ref-merchant-cta"><div><span>COMECE EM POUCOS PASSOS</span><h2>Uma vitrine útil, não apenas publicidade.</h2></div><ol><li><i>1</i><span><strong>Crie o perfil</strong><small>Informe os dados do comércio.</small></span></li><li><i>2</i><span><strong>Organize o catálogo</strong><small>Cadastre produtos e preços.</small></span></li><li><i>3</i><span><strong>Receba consumidores</strong><small>Apareça nas comparações locais.</small></span></li></ol></section></main><PublicFooter /></div>;
}

export function ReferenceMerchantDashboard() {
  const catalog = useCatalog();
  const rows = catalog.products.slice(0, 6);
  return <div className="ref-admin ref-merchant-admin"><aside className="ref-admin__sidebar"><Brand inverse /><nav><span>GESTÃO</span><Link className="is-active" to="/painel-lojista"><LayoutDashboard /> Visão geral</Link><Link to="/painel-lojista/catalogo"><PackageSearch /> Catálogo</Link><Link to="/painel-lojista/vendas-online"><ShoppingBasket /> Pedidos</Link><span>NEGÓCIO</span><Link to="/painel-lojista/configurar-negocio"><Store /> Minha loja</Link><Link to="/estabelecimentos"><Eye /> Ver no site</Link></nav><small>PreçoCerto · Feijó, Acre</small></aside><main id="conteudo-principal" className="ref-admin__main"><header><div><span>PAINEL DO COMERCIANTE</span><h1>Central Super</h1><p>Preços, estoque e visibilidade do seu catálogo.</p></div><div><ThemeButton /><Link to="/">Ver site</Link></div></header><section className="ref-admin__cards"><article><Tag /><span>Produtos publicados</span><strong>{rows.length}</strong><small>catálogo ativo</small></article><article><BadgeCheck /><span>Preços atualizados</span><strong>92%</strong><small>nas últimas 24 horas</small></article><article><Eye /><span>Visualizações</span><strong>1.284</strong><small>nesta semana</small></article><article><TrendingDown /><span>Melhores preços</span><strong>4</strong><small>liderando comparações</small></article></section><section className="ref-merchant-table"><header><div><span>CATÁLOGO</span><h2>Preços e estoque</h2></div><button type="button"><Plus /> Novo produto</button></header><div className="ref-results-table"><div className="ref-results-table__head"><span>Produto</span><span>Status</span><span>Mercado local</span><span>Seu preço</span><span /></div>{rows.map(product => <div className="ref-result-row" key={product.id}><span className="ref-result-product"><i><ProductVisual product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.size}</em></span></span><span className="ref-status"><Check /> publicado</span><span className="ref-result-range">{brl.format(product.minPrice)} — {brl.format(product.maxPrice)}<small>{product.storeCount} lojas</small></span><strong className="ref-result-price">{brl.format(product.minPrice)}</strong><button type="button" aria-label={`Editar ${product.name}`}>Editar</button></div>)}</div></section></main></div>;
}

type InfoKind = "collaborate" | "contact" | "pharmacies" | "orders" | "culture";
const infoCopy: Record<InfoKind, { eyebrow: string; title: string; copy: string; action: string; to: string }> = {
  collaborate: { eyebrow: "COLABORE COM FEIJÓ", title: "Ajude a manter os preços úteis.", copy: "Compartilhe atualizações e fortaleça uma base local mais transparente para todos.", action: "Entrar para colaborar", to: "/login" },
  contact: { eyebrow: "FALE COM O PREÇOCERTO", title: "Estamos perto para ouvir.", copy: "Envie sua dúvida, sugestão ou proposta de parceria com o comércio local.", action: "Acessar minha conta", to: "/login" },
  pharmacies: { eyebrow: "SAÚDE LOCAL", title: "Farmácias de Feijó.", copy: "A cobertura de preços de farmácias está sendo organizada com verificação e responsabilidade.", action: "Ver estabelecimentos", to: "/estabelecimentos" },
  orders: { eyebrow: "SUAS COMPRAS", title: "Pedidos em um só lugar.", copy: "Entre para acompanhar pagamentos, preparo e entrega dos pedidos feitos nas lojas participantes.", action: "Entrar para continuar", to: "/login" },
  culture: { eyebrow: "CULTURA DE FEIJÓ", title: "Talento local também tem valor.", copy: "Descubra projetos, livros e produções da nossa cidade dentro do ecossistema PreçoCerto.", action: "Explorar estabelecimentos", to: "/estabelecimentos" },
};

export function ReferenceInfoPage({ kind }: { kind: InfoKind }) {
  const content = infoCopy[kind];
  return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>{content.eyebrow}</span><h1>{content.title}</h1><p>{content.copy}</p><Link to={content.to}>{content.action} <ArrowRight /></Link></main><PublicFooter /></div>;
}

export function ReferenceNotFound() {
  return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>PÁGINA NÃO ENCONTRADA</span><h1>Vamos voltar ao preço certo.</h1><p>Este endereço não existe ou foi reorganizado na nova experiência.</p><Link to="/">Ir para a homepage <ArrowRight /></Link></main><PublicFooter /></div>;
}

export function ReferenceAdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [summary, setSummary] = useState({ gmvToday: 0, platformRevenueToday: 0, subscriptionRevenueMonth: 0, commissionRevenueToday: 0, activeMerchants: 0, ordersToday: 0, cancelledToday: 0, averageTicket: 0 });
  useEffect(() => { void (async () => { const profile = await loadSessionProfile(); setAuthorized(Boolean(profile?.isAdmin)); if (profile?.isAdmin) setSummary(await loadPlatformSummary()); })(); }, []);
  if (authorized === null) return <main className="ref-admin-state"><ShieldCheck /><h1>Verificando acesso…</h1></main>;
  if (!authorized) return <main className="ref-admin-state"><ShieldCheck /><h1>Acesso administrativo restrito</h1><p>Entre com uma conta administrativa autorizada.</p><Link to="/login?redirect=/admin/plataforma">Entrar com segurança</Link></main>;
  const cards = [["Economia verificada", brl.format(summary.gmvToday), TrendingDown], ["Comerciantes ativos", String(summary.activeMerchants), Store], ["Pedidos hoje", String(summary.ordersToday), ShoppingBasket], ["Ticket médio", brl.format(summary.averageTicket), CircleDollarSign]] as const;
  return <div className="ref-admin"><aside className="ref-admin__sidebar"><Brand inverse /><nav><span>INTELIGÊNCIA</span><button className="is-active" type="button"><LayoutDashboard /> Visão geral</button><button type="button"><BarChart3 /> Mapas de preços</button><span>OPERAÇÕES</span><Link to="/admin/comercios"><Building2 /> Comerciantes</Link><button type="button"><Tag /> Preços reportados</button><button type="button"><ShoppingBasket /> Pedidos</button><span>USUÁRIOS</span><button type="button"><UsersRound /> Usuários</button><button type="button"><ListChecks /> Reputação</button></nav><small>Feito com orgulho em Feijó, Acre.</small></aside><main className="ref-admin__main"><header><div><span>PAINEL EXECUTIVO</span><h1>Visão geral</h1><p>Panorama operacional do PreçoCerto em Feijó, Acre.</p></div><div><button type="button" aria-label="Notificações"><Bell /></button><Link to="/">Ver site</Link></div></header><section className="ref-admin__cards">{cards.map(([label, value, Icon]) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong><small>dados verificados da plataforma</small></article>)}</section><section className="ref-admin__grid"><article className="ref-admin__panel ref-admin__panel--wide"><header><div><span>CATÁLOGO</span><h2>Qualidade e cobertura</h2></div><BadgeCheck /></header><div className="ref-admin__quality"><strong>96%</strong><span>índice de integridade</span><div><i style={{ width: "96%" }} /></div></div><ul><li><span>Produtos monitorados</span><strong>{integer.format(verifiedDatasetMetrics.products)}</strong></li><li><span>Preços reportados</span><strong>{integer.format(verifiedDatasetMetrics.prices)}</strong></li><li><span>Cobertura local</span><strong>{integer.format(verifiedDatasetMetrics.stores)} lojas</strong></li></ul></article><article className="ref-admin__panel"><header><div><span>PIPELINE</span><h2>Parceiros verificados</h2></div><Building2 /></header><ol><li><span>Prospecção</span><strong>23</strong></li><li><span>Em análise</span><strong>12</strong></li><li><span>Integração</span><strong>5</strong></li><li><span>Aprovados</span><strong>{summary.activeMerchants}</strong></li></ol></article><article className="ref-admin__panel"><header><div><span>ATIVIDADE</span><h2>Auditoria recente</h2></div><Eye /></header><ol><li><span>Preços atualizados</span><small>agora</small></li><li><span>Catálogo verificado</span><small>há 12 min</small></li><li><span>Parceiro analisado</span><small>há 31 min</small></li></ol></article></section></main></div>;
}
