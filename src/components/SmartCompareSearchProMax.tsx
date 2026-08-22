import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BadgeCheck, BrainCircuit, CheckCircle2, ChevronRight, ExternalLink, Heart, Moon, PackageSearch, Scale, Search, ShoppingBasket, SlidersHorizontal, Sparkles, Store, Sun, TrendingDown, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { buildCatalog, type Product } from "../data/catalog";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { parseMeasure, unitPrice } from "../lib/pricing";
import { searchProducts } from "../lib/productSearch";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import "./SmartCompareSearchProMax.css";
import "./SmartCompareSearchWorld.css";

const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const seed=buildCatalog();
type Theme="light"|"dark";
const readTheme=():Theme=>typeof window!=="undefined"&&window.localStorage.getItem("theme")==="dark"?"dark":"light";

function baseIdentity(product:Product){
 const name=normalize(product.name)
  .replace(/\b\d+(?:[.,]\d+)?\s*(kg|quilo|quilos|g|gr|gramas?|mg|l|lt|litros?|ml|un|und|unid|unidades?)\b/g,"")
  .replace(/\b\d+\s*[x×]\s*\d+(?:[.,]\d+)?\s*(kg|g|mg|l|lt|ml|un|und)\b/g,"")
  .replace(/\s+/g," ").trim();
 return [name,normalize(product.brand||""),normalize(product.category||"")].join("|");
}

type ValueVariant={product:Product;unitValue:number;base:"kg"|"L"|"un";quantity:number};
type ValueGroup={key:string;variants:ValueVariant[];best:ValueVariant;savingPct:number};

function buildValueGroups(products:Product[]):ValueGroup[]{
 const groups=new Map<string,ValueVariant[]>();
 for(const product of products){
  const measure=parseMeasure(product.size,product.unit);
  const perUnit=unitPrice(product.minPrice,product.size,product.unit);
  if(!measure||!perUnit||!Number.isFinite(perUnit.value)||perUnit.value<=0) continue;
  const key=`${baseIdentity(product)}|${perUnit.base}`;
  const list=groups.get(key)||[];
  list.push({product,unitValue:perUnit.value,base:perUnit.base,quantity:measure.quantity});
  groups.set(key,list);
 }
 return [...groups.entries()].flatMap(([key,variants])=>{
  const unique=[...new Map(variants.map(v=>[`${v.quantity}|${v.product.minPrice}`,v])).values()];
  if(unique.length<2) return [];
  unique.sort((a,b)=>a.unitValue-b.unitValue||b.quantity-a.quantity);
  const best=unique[0];
  const reference=unique[1];
  const savingPct=reference.unitValue>0?Math.max(0,((reference.unitValue-best.unitValue)/reference.unitValue)*100):0;
  return [{key,variants:unique,best,savingPct}];
 }).sort((a,b)=>b.savingPct-a.savingPct);
}

function ProductThumb({product}:{product:Product}){
 const image=resolveProductImage(product);
 return <div className="scpm-thumb">{image?<img src={image} alt={product.name} width="220" height="180" loading="lazy"/>:<PackageSearch aria-hidden="true"/>}</div>;
}

export function SmartCompareSearchProMax(){
 const [params,setParams]=useSearchParams();
 const {isFavorite,toggleFavorite}=useFavorites();
 const initial=params.get("q")||"";
 const [query,setQuery]=useState(initial);
 const [products,setProducts]=useState<Product[]>(seed.products);
 const [loading,setLoading]=useState(true);
 const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);
 const [theme,setTheme]=useState<Theme>(readTheme);
 const modalRef=useRef<HTMLElement>(null);
 const category=params.get("c")||"Todos";

 useEffect(()=>{queueMicrotask(()=>setQuery(params.get("q")||""))},[params]);
 useEffect(()=>{let active=true;fetchCatalog().then(result=>{if(active){setProducts(result.products);setLoading(false)}}).catch(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;window.localStorage.setItem("theme",theme)},[theme]);
 useEffect(()=>{if(!selectedProduct)return;const previous=document.body.style.overflow;const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;document.body.style.overflow="hidden";const focusable=()=>[...(modalRef.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[])].filter(element=>!element.hasAttribute("disabled"));requestAnimationFrame(()=>focusable()[0]?.focus());const keydown=(event:KeyboardEvent)=>{if(event.key==="Escape"){setSelectedProduct(null);return}if(event.key!=="Tab")return;const items=focusable();if(!items.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};window.addEventListener("keydown",keydown);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",keydown);previousFocus?.focus()}},[selectedProduct]);

 const categories=useMemo(()=>["Todos",...Array.from(new Set(products.map(product=>product.category).filter(Boolean))).slice(0,7)] as string[],[products]);
 const results=useMemo(()=>{
  const q=(params.get("q")||"").trim();
  const base=!q?[...products]:searchProducts(products,q);
  return base.filter(p=>p.minPrice>0&&(category==="Todos"||p.category===category)).slice(0,48);
 },[products,params,category]);
 const valueGroups=useMemo(()=>buildValueGroups(results),[results]);
 const insight=valueGroups[0]||null;

 const submit=(event:FormEvent)=>{event.preventDefault();const q=query.trim();const next=new URLSearchParams(params);if(q)next.set("q",q);else next.delete("q");setParams(next);};
 const baseLabel=(base:"kg"|"L"|"un")=>base==="un"?"unidade":base;

 return <main className="scpm-page">
  <header className="scpm-header"><div className="scpm-shell scpm-header__inner"><a className="scpm-brand" href="/" aria-label="PreçoCerto — início"><span>Preço<span>Certo</span></span><small>Feijó-AC</small></a><nav aria-label="Navegação do comparador"><a href="/">Início</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/cesta-basica">Minha cesta</a></nav><div className="scpm-header__tools"><button className="scpm-theme" type="button" onClick={()=>setTheme(value=>value==="dark"?"light":"dark")} aria-label={theme==="dark"?"Ativar modo claro":"Ativar modo escuro"}>{theme==="dark"?<Sun aria-hidden="true"/>:<Moon aria-hidden="true"/>}</button><a className="scpm-header__action" href="/lojista">Para lojistas <ArrowRight/></a></div></div></header>
  <section className="scpm-hero"><div className="scpm-hero__photo" aria-hidden="true"/><div className="scpm-hero__veil" aria-hidden="true"/><div className="scpm-shell scpm-hero__inner"><div><p className="scpm-kicker"><BrainCircuit/> Comparação inteligente</p><h1>Compare por medida. <strong>Compre com contexto.</strong></h1><p>Veja preço por kg, litro ou unidade quando as embalagens permitem uma comparação justa — e escolha o que realmente vale mais.</p></div><div className="scpm-hero__metric"><Scale/><span>O critério é claro</span><strong>Preço proporcional, não só etiqueta.</strong><small>Comparamos somente medidas compatíveis.</small></div></div></section>

  <section className="scpm-searchbar"><div className="scpm-shell"><form onSubmit={submit}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque um produto, marca ou categoria…" aria-label="Buscar produto" autoComplete="off"/><button type="submit">Comparar <ArrowRight/></button></form><div className="scpm-filters" aria-label="Filtrar resultados por categoria"><span><SlidersHorizontal/> Filtrar</span>{categories.map(item=><button key={item} type="button" className={category===item?"is-active":""} aria-pressed={category===item} onClick={()=>{const next=new URLSearchParams(params);if(item==="Todos")next.delete("c");else next.set("c",item);setParams(next)}}>{item}</button>)}<a href="/cesta-basica"><ShoppingBasket/> Minha cesta</a></div></div></section>

  <div className="scpm-shell scpm-content">
   {loading?<div className="scpm-loading"><BrainCircuit/><span>Analisando produtos e apresentações…</span></div>:<>
    {insight&&<section className="scpm-insight" aria-label="Recomendação de melhor custo-benefício"><header><div><span><Sparkles/> Recomendação inteligente</span><h2>Esta apresentação entrega mais pelo seu dinheiro.</h2><p>Comparamos o preço proporcional das embalagens encontradas, não apenas o valor que aparece na etiqueta.</p></div><div className="scpm-insight__score"><TrendingDown/><strong>{insight.savingPct.toFixed(1).replace(".",",")}%</strong><span>melhor custo por {baseLabel(insight.best.base)}</span></div></header><div className="scpm-variants">{insight.variants.slice(0,4).map((variant,index)=>{const best=index===0;return <article className={`scpm-variant${best?" is-best":""}`} key={`${variant.product.id}-${variant.quantity}`}><div className="scpm-variant__top">{best?<span className="scpm-best"><BadgeCheck/> Melhor custo-benefício</span>:<span className="scpm-alt">Outra apresentação</span>}<ProductThumb product={variant.product}/></div><h3>{variant.product.name}</h3><p>{variant.product.size} · {variant.product.establishment}</p><div className="scpm-price-row"><strong>{money(variant.product.minPrice)}</strong><span>{money(variant.unitValue)} / {baseLabel(variant.base)}</span></div>{best&&<small><CheckCircle2/> Recomendada pela relação preço × quantidade</small>}</article>})}</div><footer><Scale/><p><strong>Como calculamos:</strong> convertemos embalagens compatíveis para a mesma base (kg, litro ou unidade) e comparamos o menor preço proporcional. Uma embalagem maior só recebe destaque se realmente tiver custo unitário menor.</p></footer></section>}

    <section className="scpm-results"><div className="scpm-heading"><div><span>Resultados</span><h2>{params.get("q")?`Produtos para “${params.get("q")}”`:"Produtos para comparar"}</h2><p>{results.length} opções encontradas. O preço unitário aparece sempre que a embalagem pode ser convertida com segurança.</p></div></div><div className="scpm-grid">{results.map(product=>{const per=unitPrice(product.minPrice,product.size,product.unit);const saved=isFavorite(product.id);return <article className="scpm-card" key={String(product.id)}><button type="button" className="scpm-card__link" onClick={()=>setSelectedProduct(product)} aria-label={`Abrir detalhes e preços de ${product.name}`}><ProductThumb product={product}/><div className="scpm-card__body"><span className="scpm-category">{product.category||"Produto"}</span><h3>{product.name}</h3><p className="scpm-store"><Store/> {product.establishment}</p><div className="scpm-card__prices"><strong>{money(product.minPrice)}</strong>{per&&<span>{money(per.value)} / {baseLabel(per.base)}</span>}</div><small>{product.size||product.unit}</small><div className="scpm-card__action">Abrir comparação <ChevronRight/></div></div></button><button type="button" className={`scpm-favorite${saved?" is-saved":""}`} aria-pressed={saved} aria-label={saved?`Remover ${product.name} dos favoritos`:`Favoritar ${product.name}`} onClick={()=>void toggleFavorite(product.id)}><Heart fill={saved?"currentColor":"none"}/></button></article>})}</div>{!results.length&&<div className="scpm-empty"><Search/><h3>Nenhum produto encontrado</h3><p>Tente pesquisar por outro nome, marca ou categoria.</p></div>}</section>
   </>}
  </div>
  {selectedProduct&&createPortal(<div className="scpm-modal" role="dialog" aria-modal="true" aria-labelledby="scpm-product-title"><button className="scpm-modal__backdrop" type="button" aria-label="Fechar detalhes do produto" onClick={()=>setSelectedProduct(null)}/><article className="scpm-modal__card" ref={modalRef}><button className="scpm-modal__close" type="button" aria-label="Fechar" onClick={()=>setSelectedProduct(null)}><X aria-hidden="true"/></button><div className="scpm-modal__media"><ProductThumb product={selectedProduct}/></div><div className="scpm-modal__body"><small>{selectedProduct.category||"Produto"}</small><h2 id="scpm-product-title">{selectedProduct.name}</h2><p>{selectedProduct.brand}{selectedProduct.size?` · ${selectedProduct.size}`:""}</p><div className="scpm-modal__prices"><span><small>Menor preço</small><strong>{money(selectedProduct.minPrice)}</strong></span><span><small>Média encontrada</small><strong>{money(selectedProduct.avgPrice)}</strong></span></div><div className="scpm-modal__offers" aria-label="Preços por estabelecimento">{(selectedProduct.offers?.length?selectedProduct.offers:[{establishment:selectedProduct.establishment,neighborhood:selectedProduct.neighborhood,value:selectedProduct.minPrice}]).slice().sort((a,b)=>a.value-b.value).slice(0,5).map((offer,index)=><div className="scpm-modal__offer" key={`${offer.establishment}-${offer.value}-${index}`}><span><b>{offer.establishment}</b><small>{offer.neighborhood||"Feijó-AC"}</small></span><strong>{money(offer.value)}</strong></div>)}</div><div className="scpm-modal__actions"><a className="scpm-modal__primary" href={`/produto/${selectedProduct.slug||selectedProduct.id}`}>Ver página completa <ExternalLink aria-hidden="true"/></a><a className="scpm-modal__secondary" href={`/cesta-basica?produto=${encodeURIComponent(String(selectedProduct.id))}`}>Adicionar à cesta <ArrowRight aria-hidden="true"/></a></div></div></article></div>,document.body)}
 </main>;
}
