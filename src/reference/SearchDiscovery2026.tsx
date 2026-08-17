import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Building2, ChevronDown, MapPin, PackageSearch, RotateCcw, Search, SlidersHorizontal, Store, Tag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { getMarketplaceSector, inferProductSector, marketplaceSectors, type MarketplaceSectorId } from "./MarketplaceSectors";
import { resolveProductImage } from "../data/productImageResolver";
import "./SearchDiscovery2026.css";

const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();

type SortMode="relevance"|"lowest"|"highest"|"name"|"stores";

function score(product:Product,raw:string){const q=normalize(raw);if(!q)return 20;const name=normalize(product.name);const brand=normalize(product.brand||"");const category=normalize(product.category||"");const establishment=normalize(product.establishment||"");const neighborhood=normalize(product.neighborhood||"");if(name===q)return 0;if(name.startsWith(q))return 1;if(name.includes(q))return 2;if(brand.includes(q))return 3;if(category.includes(q))return 4;if(establishment===q)return 5;if(establishment.includes(q))return 6;if(neighborhood.includes(q))return 7;const words=q.split(/\s+/).filter(Boolean);const haystack=`${name} ${brand} ${category} ${establishment} ${neighborhood}`;return words.every(word=>haystack.includes(word))?8:99}

function ProductThumb({product}:{product:Product}){const src=resolveProductImage(product);return src?<img src={src} alt={product.name} loading="lazy"/>:<PackageSearch/>}

export function SearchDiscovery2026(){
 const[params,setParams]=useSearchParams();
 const[catalog,setCatalog]=useState<CatalogPayload|null>(null);
 const[loading,setLoading]=useState(true);
 const[query,setQuery]=useState(params.get("q")||"");
 const deferred=useDeferredValue(query);
 const[sector,setSector]=useState<MarketplaceSectorId>((getMarketplaceSector(params.get("setor"))?.id||"all") as MarketplaceSectorId);
 const[store,setStore]=useState(params.get("loja")||"all");
 const[category,setCategory]=useState(params.get("categoria")||"all");
 const[neighborhood,setNeighborhood]=useState(params.get("bairro")||"all");
 const[minPrice,setMinPrice]=useState(params.get("min")||"");
 const[maxPrice,setMaxPrice]=useState(params.get("max")||"");
 const[sort,setSort]=useState<SortMode>((params.get("ordem") as SortMode)||"relevance");
 const[filtersOpen,setFiltersOpen]=useState(false);
 const[visible,setVisible]=useState(36);

 useEffect(()=>{let active=true;void fetchCatalog().then(data=>{if(active)setCatalog(data)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 const stores=useMemo(()=>catalog?[...catalog.stores].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")):[],[catalog]);
 const categories=useMemo(()=>catalog?Array.from(new Set(catalog.products.filter(p=>sector==="all"||inferProductSector(p.category)===sector).map(p=>p.category).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR")):[],[catalog,sector]);
 const neighborhoods=useMemo(()=>catalog?Array.from(new Set(catalog.stores.map(s=>s.neighborhood).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR")):[],[catalog]);

 const results=useMemo(()=>{
  if(!catalog)return[];
  const min=Number(minPrice.replace(",","."));const max=Number(maxPrice.replace(",","."));
  const rows=catalog.products.map(product=>({product,score:score(product,deferred)})).filter(({product,score:rank})=>{
   if(deferred.trim()&&rank===99)return false;
   if(sector!=="all"&&inferProductSector(product.category)!==sector)return false;
   if(store!=="all"&&String(product.establishmentId)!==store&&!product.offers?.some(o=>String(o.establishmentId)===store))return false;
   if(category!=="all"&&product.category!==category)return false;
   if(neighborhood!=="all"&&normalize(product.neighborhood)!==normalize(neighborhood)&&!product.offers?.some(o=>normalize(o.neighborhood)===normalize(neighborhood)))return false;
   if(Number.isFinite(min)&&min>0&&product.minPrice<min)return false;
   if(Number.isFinite(max)&&max>0&&product.minPrice>max)return false;
   return true;
  });
  rows.sort((a,b)=>sort==="lowest"?a.product.minPrice-b.product.minPrice:sort==="highest"?b.product.minPrice-a.product.minPrice:sort==="name"?a.product.name.localeCompare(b.product.name,"pt-BR"):sort==="stores"?(b.product.storeCount||0)-(a.product.storeCount||0):a.score-b.score||a.product.minPrice-b.product.minPrice);
  return rows.map(r=>r.product);
 },[catalog,deferred,sector,store,category,neighborhood,minPrice,maxPrice,sort]);

 useEffect(()=>setVisible(36),[deferred,sector,store,category,neighborhood,minPrice,maxPrice,sort]);
 useEffect(()=>{if(category!=="all"&&!categories.includes(category))setCategory("all")},[categories,category]);
 const activeFilters=[sector!=="all",store!=="all",category!=="all",neighborhood!=="all",Boolean(minPrice),Boolean(maxPrice)].filter(Boolean).length;
 const syncUrl=()=>{const next:Record<string,string>={};if(query.trim())next.q=query.trim();if(sector!=="all")next.setor=sector;if(store!=="all")next.loja=store;if(category!=="all")next.categoria=category;if(neighborhood!=="all")next.bairro=neighborhood;if(minPrice)next.min=minPrice;if(maxPrice)next.max=maxPrice;if(sort!=="relevance")next.ordem=sort;setParams(next,{replace:true})};
 const submit=(e:FormEvent)=>{e.preventDefault();syncUrl()};
 const reset=()=>{setQuery("");setSector("all");setStore("all");setCategory("all");setNeighborhood("all");setMinPrice("");setMaxPrice("");setSort("relevance");setParams({}, {replace:true})};

 return <div className="search26-page"><header className="search26-top"><div className="search26-shell"><Link to="/" className="search26-brand"><img src="/logo-preco-certo.svg" alt="PreçoCerto"/></Link><nav><Link to="/explorar">Setores</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/cesta-inteligente">Cesta Inteligente</Link></nav></div></header><main id="conteudo-principal" className="search26-shell search26-main">
  <section className="search26-hero"><div><span><Search/> BUSCA INTELIGENTE LOCAL</span><h1>Encontre exatamente onde comprar.</h1><p>Pesquise produtos e refine por estabelecimento, setor, categoria, bairro ou faixa de preço. Os filtros podem ser combinados.</p></div><aside><BadgeCheck/><strong>{catalog?.metrics.products||0} produtos</strong><small>em {catalog?.metrics.stores||0} estabelecimentos locais</small></aside></section>

  <form className="search26-search" onSubmit={submit} role="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Produto, marca, categoria ou estabelecimento…" aria-label="Buscar produtos e estabelecimentos"/><button>Buscar <ArrowRight/></button></form>

  <section className="search26-filterbar"><button type="button" className={filtersOpen||activeFilters?"is-active":""} onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal/>Filtros{activeFilters>0&&<b>{activeFilters}</b>}<ChevronDown/></button><div className="search26-quick"><label><Store/><select value={store} onChange={e=>setStore(e.target.value)}><option value="all">Todos os estabelecimentos</option>{stores.map(s=><option key={s.id} value={String(s.id)}>{s.name}</option>)}</select></label><label><Tag/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todas as categorias</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label><select value={sort} onChange={e=>setSort(e.target.value as SortMode)}><option value="relevance">Mais relevantes</option><option value="lowest">Menor preço</option><option value="highest">Maior preço</option><option value="stores">Mais lojas</option><option value="name">Nome A–Z</option></select></label></div>{activeFilters>0&&<button type="button" className="search26-reset" onClick={reset}><RotateCcw/>Limpar filtros</button>}</section>

  {filtersOpen&&<section className="search26-advanced" aria-label="Filtros avançados"><div><label>Setor<select value={sector} onChange={e=>setSector(e.target.value as MarketplaceSectorId)}><option value="all">Todos os setores</option>{marketplaceSectors.map(s=><option key={s.id} value={s.id}>{s.shortLabel}</option>)}</select></label><label>Bairro<select value={neighborhood} onChange={e=>setNeighborhood(e.target.value)}><option value="all">Todos os bairros</option>{neighborhoods.map(n=><option key={n}>{n}</option>)}</select></label><label>Preço mínimo<input inputMode="decimal" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="R$ 0,00"/></label><label>Preço máximo<input inputMode="decimal" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Sem limite"/></label></div><footer><span><Building2/>Combine filtros para buscar dentro de um estabelecimento específico.</span><button type="button" onClick={syncUrl}>Aplicar e salvar na URL</button></footer></section>}

  <section className="search26-results"><header><div><span>RESULTADOS EM FEIJÓ</span><h2>{loading?"Carregando catálogo…":`${results.length} ${results.length===1?"resultado":"resultados"}`}</h2></div><small>{activeFilters?`${activeFilters} ${activeFilters===1?"filtro ativo":"filtros ativos"}`:"Sem filtros adicionais"}</small></header>{!loading&&results.length>0?<div className="search26-grid">{results.slice(0,visible).map(product=><Link to={`/produto/${product.slug||product.id}`} className="search26-card" key={product.id}><div className="search26-thumb"><ProductThumb product={product}/></div><div className="search26-copy"><small>{product.category} · {product.brand}</small><strong>{product.name}</strong><span><Store/>{product.establishment}<em>{product.neighborhood}</em></span></div><div className="search26-price"><small>menor preço</small><strong>{brl.format(product.minPrice)}</strong><em>{product.storeCount||product.offers?.length||1} {(product.storeCount||product.offers?.length||1)===1?"loja":"lojas"}</em></div><ArrowRight/></Link>)}</div>:!loading&&<div className="search26-empty"><PackageSearch/><h2>Nenhum resultado com esses filtros</h2><p>Remova um filtro ou tente outro nome, estabelecimento ou categoria.</p><button onClick={reset}>Limpar filtros</button></div>}{visible<results.length&&<button className="search26-more" onClick={()=>setVisible(v=>Math.min(v+36,results.length))}>Mostrar mais resultados <span>{results.length-visible} restantes</span></button>}</section>
 </main></div>
}
