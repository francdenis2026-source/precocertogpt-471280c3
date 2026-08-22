import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP, gsap, ScrollTrigger } from "../lib/lightMotion";
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Clipboard, ExternalLink, Film, Play, RefreshCw, Sparkles, Video } from 'lucide-react';
import { fetchCatalog } from '../data/remoteCatalog';
import { resolveProductImage } from '../data/productImageResolver';
import type { Product } from '../data/catalog';
import './AdminVideoStudio.css';

gsap.registerPlugin(ScrollTrigger);

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const workflowUrl='https://github.com/francdenis2026-source/precocertogpt-26405b4a/actions/workflows/render-remotion-video.yml';

export function AdminVideoStudio(){
 const pageRef=useRef<HTMLDivElement>(null);
 const[products,setProducts]=useState<Product[]>([]),[selected,setSelected]=useState<string[]>([]),[loading,setLoading]=useState(true),[title,setTitle]=useState('Ofertas que fazem seu dinheiro render'),[cta,setCta]=useState('Compare antes de comprar'),[copied,setCopied]=useState(false);
 useEffect(()=>{void fetchCatalog().then(c=>{setProducts(c.products);setSelected(c.products.slice(0,3).map(p=>String(p.id)))}).finally(()=>setLoading(false))},[]);
 const chosen=useMemo(()=>selected.map(id=>products.find(p=>String(p.id)===id)).filter(Boolean) as Product[],[selected,products]);
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):current.length<3?[...current,id]:[...current.slice(1),id]);
 const renderProps=useMemo(()=>JSON.stringify({city:'Feijó, Acre',headline:title,subheadline:'Compare preços locais em segundos e escolha onde sua compra vale mais.',cta,offers:chosen.map(p=>({name:p.name,brand:p.brand,size:p.size,price:p.minPrice,previousPrice:p.previousPrice,store:p.establishment,image:resolveProductImage(p)||'products/arroz-tio-joao-5kg.png'}))}),[chosen,title,cta]);
 const copyProps=async()=>{await navigator.clipboard.writeText(renderProps);setCopied(true);window.setTimeout(()=>setCopied(false),2200)};
 const openProduction=async()=>{try{await navigator.clipboard.writeText(renderProps);setCopied(true)}catch{}window.open(workflowUrl,'_blank','noopener,noreferrer')};
 useGSAP(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.from('.avs-head > *',{y:16,opacity:0,duration:.55,stagger:.06,ease:'power3.out'});
  gsap.utils.toArray<HTMLElement>('.avs-grid, .avs-products, .avs-render').forEach(section=>{
   gsap.from(section,{scrollTrigger:{trigger:section,start:'top 88%',once:true},y:22,opacity:0,duration:.55,ease:'power2.out'});
  });
 },{scope:pageRef});
 return <main className="avs-shell" ref={pageRef}><header className="avs-head"><div><Link to="/admin"><ArrowLeft/>Painel</Link><small>REMOTION STUDIO</small><h1><Video/> Gerador de vídeos</h1><p>Selecione até 3 produtos reais do catálogo e prepare uma campanha vertical do PreçoCerto.</p></div><div className="avs-status"><CheckCircle2/><span>Template ativo</span><strong>1080 × 1920 · 15s</strong></div></header>
 <section className="avs-grid"><article className="avs-panel"><header><div><small>01 · CONTEÚDO</small><h2>Campanha</h2></div><Sparkles/></header><label>Título principal<input value={title} maxLength={62} onChange={e=>setTitle(e.target.value)}/></label><label>Chamada final<input value={cta} maxLength={48} onChange={e=>setCta(e.target.value)}/></label><div className="avs-counter"><strong>{selected.length}/3</strong><span>produtos selecionados</span></div></article>
 <article className="avs-preview"><div className="avs-phone"><div className="avs-video"><span className="avs-brand">PREÇO<strong>CERTO</strong></span><small>FEIJÓ · ACRE</small><h2>{title}</h2><div className="avs-offers">{chosen.map((p,i)=><div className="avs-offer" key={p.id}><div className="avs-img">{resolveProductImage(p)?<img src={resolveProductImage(p)} alt=""/>:<Film/>}</div><span><b>{p.name}</b><small>{p.establishment}</small></span><strong>{money.format(p.minPrice)}</strong><em>{i+1}</em></div>)}</div><div className="avs-cta">{cta}<small>precocerto.app</small></div></div></div><p><Play/> Prévia editorial do template Remotion</p></article></section>
 <section className="avs-products"><header><div><small>02 · CATÁLOGO</small><h2>Escolha as ofertas</h2><p>O vídeo usa preço, estabelecimento e imagem já cadastrados.</p></div>{loading&&<RefreshCw className="spin"/>}</header><div className="avs-product-grid">{products.slice(0,24).map(p=>{const active=selected.includes(String(p.id));return <button className={active?'active':''} key={p.id} onClick={()=>toggle(String(p.id))}><div>{resolveProductImage(p)?<img src={resolveProductImage(p)} alt=""/>:<Film/>}</div><span><b>{p.name}</b><small>{p.establishment} · {p.neighborhood}</small><strong>{money.format(p.minPrice)}</strong></span>{active&&<CheckCircle2/>}</button>})}</div></section>
 <section className="avs-render"><div><small>03 · PRODUÇÃO</small><h2>Gerar MP4 no pipeline seguro</h2><p>A configuração usa exatamente os produtos, preços, imagens, título e CTA selecionados acima. Para não expor credenciais do GitHub no navegador, a renderização roda no GitHub Actions.</p><div className="avs-render-actions"><button onClick={()=>void copyProps()}>{copied?<Check/>:<Clipboard/>}{copied?'Configuração copiada':'Copiar configuração'}</button><button className="primary" disabled={!chosen.length} onClick={()=>void openProduction()}><ExternalLink/>Abrir produção</button></div><small className="avs-hint">Na tela do GitHub, clique em “Run workflow” e cole a configuração no campo “props”. O MP4 fica disponível como artefato ao terminar.</small></div><code>{chosen.length} oferta{chosen.length===1?'':'s'} · MP4 vertical</code></section></main>
}
