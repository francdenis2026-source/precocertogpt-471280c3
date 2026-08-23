import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, PackageSearch, RotateCcw, Search, SlidersHorizontal, Store, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import type { CatalogPayload, Product } from "../data/catalog";
import { fetchSectorCatalog, productHasSectorOffer, sectorStores } from "../data/sectorCatalog";
import { getMarketplaceSector, marketplaceSectors, type MarketplaceSectorId } from "./MarketplaceSectors";
import { resolveProductImage } from "../data/productImageResolver";
import { AppDock, PublicHeader } from "./ReferenceExperience";
import "./MobileSearchDiscovery2026.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
type SortMode = "relevance" | "lowest" | "highest" | "name" | "stores";

function score(product: Product, raw: string) {
  const q = normalize(raw);
  if (!q) return 20;
  const name = normalize(product.name);
  const brand = normalize(product.brand || "");
  const category = normalize(product.category || "");
  const establishment = normalize(product.establishment || "");
  const neighborhood = normalize(product.neighborhood || "");
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.split(/\s+/).some(word => word.startsWith(q))) return 2;
  if (name.includes(q)) return 3;
  if (brand.startsWith(q)) return 4;
  if (brand.includes(q)) return 5;
  if (category.includes(q)) return 6;
  if (establishment.includes(q)) return 7;
  if (neighborhood.includes(q)) return 8;
  const words = q.split(/\s+/).filter(Boolean);
  const haystack = `${name} ${brand} ${category} ${establishment} ${neighborhood}`;
  return words.every(word => haystack.includes(word)) ? 9 : 99;
}

function ProductThumb({ product }: { product: Product }) {
  const src = resolveProductImage(product);
  return src ? <img src={src} alt={product.name} width="84" height="84" loading="lazy" /> : <PackageSearch aria-hidden="true" />;
}

export function MobileSearchDiscovery2026() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [sector, setSector] = useState<MarketplaceSectorId>((getMarketplaceSector(params.get("setor"))?.id || "all") as MarketplaceSectorId);
  const [store, setStore] = useState(params.get("loja") || "all");
  const [category, setCategory] = useState(params.get("categoria") || "all");
  const [sort, setSort] = useState<SortMode>((params.get("ordem") as SortMode) || "relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(10);

  useEffect(() => {
    let active = true;
    void fetchSectorCatalog().then(data => { if (active) setCatalog(data); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activeSector = getMarketplaceSector(sector);
  const stores = useMemo(() => {
    if (!catalog) return [];
    if (!activeSector) return [...catalog.stores].filter(s => (s.products || 0) > 0).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return sectorStores(catalog, activeSector).map(item => item.store);
  }, [catalog, activeSector]);
  const categories = useMemo(() => {
    if (!catalog) return [];
    const source = activeSector ? catalog.products.filter(p => productHasSectorOffer(p, catalog, activeSector)) : catalog.products;
    return Array.from(new Set(source.map(p => p.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [catalog, activeSector]);

  const activeFilters = [sector !== "all", store !== "all", category !== "all"].filter(Boolean).length;
  const hasRequest = Boolean(appliedQuery.trim()) || activeFilters > 0;
  const results = useMemo(() => {
    if (!catalog || !hasRequest) return [];
    const rows = catalog.products.map(product => ({ product, rank: score(product, appliedQuery) })).filter(({ product, rank }) => {
      if (appliedQuery.trim() && rank === 99) return false;
      if (activeSector && !productHasSectorOffer(product, catalog, activeSector)) return false;
      if (store !== "all" && String(product.establishmentId) !== store && !product.offers?.some(o => String(o.establishmentId) === store)) return false;
      if (category !== "all" && product.category !== category) return false;
      return product.minPrice > 0;
    });
    rows.sort((a, b) => sort === "lowest" ? a.product.minPrice - b.product.minPrice : sort === "highest" ? b.product.minPrice - a.product.minPrice : sort === "name" ? a.product.name.localeCompare(b.product.name, "pt-BR") : sort === "stores" ? (b.product.storeCount || 0) - (a.product.storeCount || 0) : a.rank - b.rank || a.product.minPrice - b.product.minPrice);
    return rows.map(row => row.product);
  }, [catalog, hasRequest, appliedQuery, activeSector, store, category, sort]);

  useEffect(() => setVisible(10), [appliedQuery, sector, store, category, sort]);

  const syncUrl = (nextQuery = appliedQuery) => {
    const next: Record<string, string> = {};
    if (nextQuery.trim()) next.q = nextQuery.trim();
    if (sector !== "all") next.setor = sector;
    if (store !== "all") next.loja = store;
    if (category !== "all") next.categoria = category;
    if (sort !== "relevance") next.ordem = sort;
    setParams(next, { replace: true });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = query.trim();
    setAppliedQuery(next);
    setVisible(10);
    syncUrl(next);
  };
  const applyFilters = () => {
    setAppliedQuery(query.trim());
    syncUrl(query.trim());
    setFiltersOpen(false);
  };
  const reset = () => {
    setQuery(""); setAppliedQuery(""); setSector("all"); setStore("all"); setCategory("all"); setSort("relevance"); setVisible(10); setParams({}, { replace: true });
  };

  return <div className="msearch26-page">
    <PublicHeader current="search" />
    <main id="conteudo-principal" className="msearch26-main">
      <section className="msearch26-hero">
        <span>BUSCA DE PRODUTOS</span>
        <h1>Encontre rápido. Compare melhor.</h1>
        <p>Pesquise no catálogo local e veja preços reais dos estabelecimentos cadastrados.</p>
        <div className="msearch26-metric"><strong>{catalog?.metrics.products || 0}</strong><small>produtos disponíveis</small></div>
      </section>

      <form className="msearch26-search" onSubmit={submit}>
        <div className="msearch26-field"><Search aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Produto, marca ou loja" autoComplete="off" inputMode="search" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}</div>
        <button className="msearch26-submit" type="submit" disabled={!query.trim() && activeFilters === 0}>Pesquisar <ArrowRight /></button>
      </form>

      <section className="msearch26-toolbar">
        <button type="button" className={filtersOpen || activeFilters ? "is-active" : ""} onClick={() => setFiltersOpen(value => !value)}><SlidersHorizontal />Filtros{activeFilters > 0 && <b>{activeFilters}</b>}<ChevronDown /></button>
        {hasRequest && <label><span className="sr-only">Ordenar</span><select value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="relevance">Relevância</option><option value="lowest">Menor preço</option><option value="highest">Maior preço</option><option value="stores">Mais lojas</option><option value="name">A–Z</option></select></label>}
        {hasRequest && <button type="button" className="msearch26-reset" onClick={reset} aria-label="Nova busca"><RotateCcw /></button>}
      </section>

      {filtersOpen && <section className="msearch26-filters">
        <label>Tipo de comércio<select value={sector} onChange={event => setSector(event.target.value as MarketplaceSectorId)}><option value="all">Todos</option>{marketplaceSectors.map(item => <option key={item.id} value={item.id}>{item.shortLabel}</option>)}</select></label>
        <label>Estabelecimento<select value={store} onChange={event => setStore(event.target.value)}><option value="all">Todos</option>{stores.map(item => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
        <label>Categoria<select value={category} onChange={event => setCategory(event.target.value)}><option value="all">Todas</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={applyFilters}>Aplicar filtros</button>
      </section>}

      {!hasRequest ? <section className="msearch26-start">
        <div><PackageSearch /></div><span>COMECE SUA BUSCA</span><h2>O que você quer encontrar?</h2><p>Digite um produto acima ou use um atalho para começar.</p>
        <div className="msearch26-chips">{["Arroz", "Café", "Leite", "Açúcar"].map(item => <button key={item} type="button" onClick={() => { setQuery(item); setAppliedQuery(item); setParams({ q: item.toLowerCase() }, { replace: true }); }}>{item}</button>)}</div>
      </section> : <section className="msearch26-results">
        <header><div><span>RESULTADOS</span><h2>{loading ? "Consultando catálogo…" : `${results.length} ${results.length === 1 ? "produto" : "produtos"}`}</h2></div><small>{appliedQuery ? `para “${appliedQuery}”` : "com seus filtros"}</small></header>
        {!loading && results.length > 0 ? <div className="msearch26-list">{results.slice(0, visible).map(product => <Link to={`/produto/${product.slug || product.id}`} className="msearch26-card" key={product.id}>
          <div className="msearch26-thumb"><ProductThumb product={product} /></div>
          <div className="msearch26-copy"><small>{product.category || "Produto"}</small><strong>{product.name}</strong><span><Store />{product.establishment || "Comércio local"}</span>{product.neighborhood && <em>{product.neighborhood}</em>}</div>
          <div className="msearch26-price"><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong><em>{product.storeCount || product.offers?.length || 1} {(product.storeCount || product.offers?.length || 1) === 1 ? "loja" : "lojas"}</em><ArrowRight /></div>
        </Link>)}</div> : !loading && <div className="msearch26-empty"><PackageSearch /><h2>Nenhum produto encontrado</h2><p>Tente outro nome ou limpe os filtros.</p><button onClick={reset}>Limpar busca</button></div>}
        {visible < results.length && <button className="msearch26-more" onClick={() => setVisible(value => Math.min(value + 10, results.length))}>Mostrar mais produtos <span>{results.length - visible} restantes</span></button>}
      </section>}
    </main>
    <AppDock current="search" />
  </div>;
}
