import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Moon, PackageSearch, Search, Sun, TrendingDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { buildFeatured, currentCycle, msUntilNextCycle } from "../data/featuredRotation";
import { FestivalAcaiBar } from "../components/FestivalAcaiBar";
import { HeaderRadioPlayer } from "../components/PersistentRadio";
import { useSiteTheme } from "../hooks/useSiteTheme";
import { AppDock, FooterInfoDialogs, type FooterPanel } from "../reference/ReferenceExperience";
import { HomeQuickActionsCarousel } from "../components/HomeQuickActionsCarousel";
import { LocationSwitcher } from "../components/LocationSwitcher";
import { suggestProducts } from "../lib/productSearch";
import "./MobileHome2026.css";

const initialCatalog=buildCatalog();
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

function ProductImage({product}:{product:Product}){const[failed,setFailed]=useState(false);const src=resolveProductImage(product);return src&&!failed?<img src={src} alt={product.name} loading="lazy" onError={()=>setFailed(true)}/>:<span className="mh26-image-fallback"><PackageSearch aria-hidden="true"/><small>Imagem em atualização</small></span>}

export function MobileHome2026(){
 const navigate=useNavigate();
 const{theme,toggleTheme}=useSiteTheme();
 const[catalog,setCatalog]=useState<CatalogPayload>({...initialCatalog,metrics:verifiedDatasetMetrics});
 const[loading,setLoading]=useState(true);
 const[catalogError,setCatalogError]=useState("");
 const[query,setQuery]=useState("");
 const[focused,setFocused]=useState(false);
 const[footerPanel,setFooterPanel]=useState<FooterPanel>(null);
 const[cycle,setCycle]=useState(()=>currentCycle());
 useEffect(()=>{let active=true;fetchCatalog().then(data=>{if(active){setCatalog(data);setCatalogError(data.error||"")}}).catch(()=>{if(active)setCatalogError("Não foi possível atualizar o catálogo agora.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 useEffect(()=>{const timer=window.setTimeout(()=>setCycle(currentCycle()),msUntilNextCycle()+250);return()=>window.clearTimeout(timer)},[cycle]);
 const products=useMemo(()=>catalog.products.filter(p=>p.minPrice>0),[catalog.products]);
 const lastPriceUpdate=useMemo(()=>{const latest=products.reduce((current,product)=>Math.max(current,Date.parse(product.updated_at||product.capturedAt||"")||0),0);return latest?new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(latest):"indisponível"},[products]);
 const results=useMemo(()=>query.trim().length<2?[]:suggestProducts(products,query,5),[query,products]);
 const featured=useMemo(()=>buildFeatured(products,cycle,4),[products,cycle]);
 const open=focused&&query.trim().length>=2;
 return <div className="mh26-page">
  <header className="mh26-header"><FestivalAcaiBar/><div className="mh26-header-row"><Link to="/" className="mh26-logo" aria-label="PreçoCerto — início"><img src="/logo-preco-certo.svg?v=11" alt="PreçoCerto"/></Link><div className="mh26-head-actions"><HeaderRadioPlayer/><button className="mh26-theme" type="button" onClick={toggleTheme} aria-label={theme==="dark"?"Ativar modo claro":"Ativar modo escuro"} title={theme==="dark"?"Modo claro":"Modo escuro"}>{theme==="dark"?<Sun aria-hidden="true"/>:<Moon aria-hidden="true"/>}</button><Link to="/estabelecimentos" aria-label="Ver estabelecimentos próximos"><MapPin aria-hidden="true"/></Link></div></div></header>
  <main id="conteudo-principal">
   <section className="mh26-hero">
    <LocationSwitcher />
    <div className="mh26-hero-copy"><h1>Em Feijó, comparar faz seu dinheiro render.</h1><p>Veja os preços do comércio local e escolha com confiança antes de sair para comprar.</p></div>
    <form className="mh26-search" onSubmit={e=>{e.preventDefault();const q=query.trim();if(q)navigate(`/buscar?q=${encodeURIComponent(q)}`)}} onFocus={()=>setFocused(true)}>
      <label className="mh26-search-label" htmlFor="mh26-query">O que você quer economizar hoje?</label>
      <div className="mh26-search-field"><Search aria-hidden="true"/><input id="mh26-query" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape"){setFocused(false);(e.currentTarget as HTMLInputElement).blur()}}} placeholder="Busque arroz, café, leite…" autoComplete="off" inputMode="search" role="combobox" aria-expanded={open} aria-controls="mh26-search-results"/>{query&&<button className="mh26-search-clear" type="button" aria-label="Limpar pesquisa" onClick={()=>setQuery("")}><X aria-hidden="true"/></button>}<button className="mh26-search-submit" type="submit">Buscar</button></div>
      {open&&<div className="mh26-search-overlay">
        <header><div><small>RESULTADOS AO VIVO</small><strong>{results.length?"Melhores opções":"Nenhum resultado"}</strong></div><span>{loading?"Atualizando…":`${results.length}/5`}</span></header>
        <div className="mh26-search-list" id="mh26-search-results">{results.length?results.map(product=><button type="button" key={product.id} onMouseDown={e=>e.preventDefault()} onClick={()=>navigate(`/produto/${product.slug||product.id}`)}><i><ProductImage product={product}/></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment||"Comércio local"}</em></span><b>{brl.format(product.minPrice)}</b></button>):<div className="mh26-search-empty"><PackageSearch aria-hidden="true"/><span><strong>Não encontramos esse produto.</strong><small>Tente outra palavra ou marca.</small></span></div>}</div>
        <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight/></Link>
      </div>}
    </form>
    <div className="mh26-quick" aria-label="Buscas populares"><span>Populares:</span>{["Arroz","Café","Leite","Açúcar"].map(item=><button key={item} type="button" onClick={()=>{setQuery(item);setFocused(true)}}>{item}</button>)}</div>
    <div className={`mh26-catalog-status${catalogError?" has-warning":""}`} role="status"><span>Atualizado em {lastPriceUpdate}</span>{catalogError&&<><em>Base local ativa.</em><button type="button" onClick={()=>{setLoading(true);fetchCatalog("",{force:true}).then(data=>{setCatalog(data);setCatalogError(data.error||"")}).catch(()=>setCatalogError("A atualização continua indisponível.")).finally(()=>setLoading(false))}}>Atualizar</button></>}</div>
   </section>

   <HomeQuickActionsCarousel />

   <section className="mh26-section"><header><div><small><TrendingDown aria-hidden="true"/> MENOR PREÇO</small><h2>Achados que valem a comparação</h2></div><Link to="/buscar">Ver todos</Link></header><div className="mh26-products">{loading?Array.from({length:3},(_,i)=><div className="mh26-product is-loading" aria-hidden="true" key={i}/>):featured.slice(0,3).map(product=><Link className="mh26-product" to={`/produto/${product.slug||product.id}`} key={product.id}><i><ProductImage product={product}/></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment||product.brand||"Comércio local"}</em></span><b><small>a partir de</small>{brl.format(product.minPrice)}</b></Link>)}</div></section>

   <section className="mh26-local"><div><small>COMÉRCIO LOCAL</small><h2>Encontre onde comprar em Feijó.</h2><p>Mercados, açougues, padarias, farmácias e outros estabelecimentos em um só lugar.</p></div><Link to="/explorar">Explorar categorias <ArrowRight/></Link></section>
  </main>
  <footer className="mh26-footer">
   <div className="mh26-footer-note"><button type="button" onClick={()=>setFooterPanel("desenvolvedor")} aria-haspopup="dialog">Desenvolvido por Franc D’nis</button><button type="button" onClick={()=>setFooterPanel("contato")} aria-haspopup="dialog">Contato</button></div>
  </footer>
  <FooterInfoDialogs open={footerPanel} onClose={()=>setFooterPanel(null)}/>
  <AppDock current="home"/>
 </div>
}
