import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useGSAP, gsap, ScrollTrigger } from "../lib/lightMotion";
import { ArrowRight, BookOpen, CheckCircle2, Feather, MapPin, MessageCircle, Quote, Share2, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import imagimacaoAsset from "../assets/uma-viagem-ao-mundo-da-imaginacao.png.asset.json";
import mentePerversaAsset from "../assets/mente-perversa.png.asset.json";
import superacaoAsset from "../assets/uma-historia-de-superacao.png.asset.json";
import despertarAsset from "../assets/o-despertar-para-o-mundo-literario.png.asset.json";
import { PublicFooter, PublicHeader } from "./ReferenceExperience";
import "./DorinhaEditorialPage.css";

gsap.registerPlugin(ScrollTrigger);

type AssetMeta={url:string};
type Book={id:string;slug:string;name:string;image_url:string|null;description:string|null;price:number;promotional_price:number|null;price_on_request:boolean;available:boolean};
type Merchant={author_name?:string|null;author_bio?:string|null;author_birthplace?:string|null;whatsapp?:string|null};
type Profile={merchant?:Merchant|null;books?:unknown};

const fallbackBooks:Book[]=[
 {id:"imaginação",slug:"uma-viagem-ao-mundo-da-imaginacao",name:"Uma Viagem ao Mundo da Imaginação",image_url:(imagimacaoAsset as AssetMeta).url,description:"Uma obra para atravessar novas paisagens pela força da imaginação e descobrir outros modos de olhar o mundo.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"mente",slug:"mente-perversa",name:"Mente Perversa",image_url:(mentePerversaAsset as AssetMeta).url,description:"Uma narrativa marcada por tensão, escolhas e camadas humanas que convidam o leitor à reflexão.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"superação",slug:"uma-historia-de-superacao",name:"Uma História de Superação",image_url:(superacaoAsset as AssetMeta).url,description:"Resistência, recomeços e a coragem necessária para transformar adversidades em novos caminhos.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"despertar",slug:"o-despertar-para-o-mundo-literario",name:"O Despertar para o Mundo Literário",image_url:(despertarAsset as AssetMeta).url,description:"Um convite para descobrir a literatura como espaço de expressão, memória e transformação.",price:0,promotional_price:null,price_on_request:true,available:true},
];
const asBooks=(value:unknown):Book[]=>Array.isArray(value)?value.filter((item):item is Book=>Boolean(item&&typeof item==="object"&&typeof(item as Book).name==="string")):[];
const cleanPhone=(value:string)=>value.replace(/\D/g,"");
const whatsapp=(phone:string,book?:string)=>`https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(book?`Olá, Dorinha! Conheci o livro “${book}” no PreçoCerto e gostaria de saber valor e disponibilidade.`:"Olá, Dorinha! Conheci seu espaço literário no PreçoCerto e gostaria de saber mais sobre seus livros.")}`;

export function DorinhaEditorialPage(){
 const pageRef=useRef<HTMLDivElement>(null);const[profile,setProfile]=useState<Profile|null>(null);const[copied,setCopied]=useState(false);
 useEffect(()=>{let active=true;document.title="Dorinha Barroso · Literatura acreana | PreçoCerto";void(async()=>{if(!supabase)return;const{data,error}=await supabase.rpc("author_store_public_profile",{_slug:"dorinha-barroso-livros"});if(!active||error||!data)return;try{setProfile((typeof data==="string"?JSON.parse(data):data)as Profile)}catch{return}})();return()=>{active=false}},[]);
 const remoteBooks=useMemo(()=>asBooks(profile?.books),[profile]);
 const books=useMemo(()=>fallbackBooks.map(local=>{const remote=remoteBooks.find(book=>book.slug===local.slug||book.name.toLocaleLowerCase("pt-BR")===local.name.toLocaleLowerCase("pt-BR"));return remote?{...local,...remote,image_url:remote.image_url||local.image_url}:local}),[remoteBooks]);
 const author=profile?.merchant?.author_name||"Dorinha Barroso";const birthplace=profile?.merchant?.author_birthplace||"Acre";const phone=profile?.merchant?.whatsapp||"5568999564762";
 const bio=profile?.merchant?.author_bio||"Escritora acreana que transforma experiências, imaginação e sensibilidade em livros feitos para criar conexão com seus leitores. Sua obra aproxima memória, identidade e novos caminhos de leitura.";
 const share=async()=>{const data={title:"Dorinha Barroso · Literatura acreana",text:"Conheça os livros de Dorinha Barroso no PreçoCerto.",url:window.location.href};if(navigator.share){try{await navigator.share(data);return}catch{setCopied(false)}}try{await navigator.clipboard.writeText(window.location.href);setCopied(true);window.setTimeout(()=>setCopied(false),1600)}catch{setCopied(false)}};
 useGSAP(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;gsap.from(".dorinha-editorial__hero-copy > *, .dorinha-editorial__portrait",{y:18,opacity:0,duration:.65,stagger:.07,ease:"power3.out"});gsap.utils.toArray<HTMLElement>(".dorinha-editorial__reveal").forEach(section=>gsap.from(section,{scrollTrigger:{trigger:section,start:"top 86%",once:true},y:24,opacity:0,duration:.6,ease:"power2.out"}))},{scope:pageRef});
 return <div className="dorinha-editorial" ref={pageRef}>
  <PublicHeader/>
  <main id="conteudo-principal">
   <section className="dorinha-editorial__hero">
    <div className="dorinha-editorial__hero-bg" aria-hidden="true"/>
    <div className="dorinha-editorial__hero-copy">
     <span className="dorinha-editorial__eyebrow"><Feather/> Literatura acreana · página oficial</span>
     <h1>Histórias que preservam <em>memória e imaginação.</em></h1>
     <p>Conheça a trajetória e as obras de <strong>{author}</strong>, uma voz literária construída no Acre.</p>
     <div className="dorinha-editorial__actions"><a href="#obras">Explorar as obras <ArrowRight/></a><a href={whatsapp(phone)} target="_blank" rel="noreferrer"><MessageCircle/> Falar com a autora</a></div>
     <div className="dorinha-editorial__trust"><span><CheckCircle2/> Espaço oficial</span><span><BookOpen/> {books.length} obras apresentadas</span><span><MapPin/> {birthplace}</span></div>
    </div>
    <figure className="dorinha-editorial__portrait"><img src="/dorinha-author-portrait-v2.webp" alt={`Retrato da escritora ${author}`}/><figcaption><small>ESCRITORA ACREANA</small><strong>{author}</strong><span>Literatura feita no Acre</span></figcaption></figure>
   </section>

   <section className="dorinha-editorial__manifest dorinha-editorial__reveal"><span>01 · ACERVO</span><div><h2>Quatro obras.<br/>Diferentes caminhos de leitura.</h2><p>Explore cada título, conheça sua proposta e fale diretamente com a autora para confirmar valor e disponibilidade.</p></div><Quote/></section>

   <section className="dorinha-editorial__catalog dorinha-editorial__reveal" id="obras">
    <header><div><span>Biblioteca da autora</span><h2>Obras de Dorinha Barroso</h2></div><p>Literatura local apresentada com contexto, identidade e contato direto.</p></header>
    <div className="dorinha-editorial__books">{books.map((book,index)=>{const price=book.promotional_price||book.price;const direct=price>0&&!book.price_on_request;return <article key={book.id} style={{"--book-index":index}as CSSProperties}><div className="dorinha-editorial__cover"><b>{String(index+1).padStart(2,"0")}</b>{book.image_url?<img src={book.image_url} alt={`Capa do livro ${book.name}`} loading="lazy"/>:<BookOpen/>}</div><div className="dorinha-editorial__book-copy"><small>{author}</small><h3>{book.name}</h3><p>{book.description}</p><footer><strong>{direct?price.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"Valor sob consulta"}</strong>{direct?<a href={`?comprar=${encodeURIComponent(book.slug)}`}>Comprar direto <ArrowRight/></a>:<a href={whatsapp(phone,book.name)} target="_blank" rel="noreferrer">Consultar <ArrowRight/></a>}</footer></div></article>})}</div>
   </section>

   <section className="dorinha-editorial__author dorinha-editorial__reveal" id="autora"><div className="dorinha-editorial__author-photo"><img src="/dorinha-author-portrait-v2.webp" alt={`Foto de ${author}`} loading="lazy"/><span>Literatura<br/>feita no Acre</span></div><div className="dorinha-editorial__author-copy"><span className="dorinha-editorial__eyebrow"><Sparkles/> A escritora</span><h2>{author}</h2><p>{bio}</p><blockquote>“Escrever é transformar vivências em caminhos que outras pessoas também podem percorrer.”</blockquote><div className="dorinha-editorial__facts"><span><b>{books.length}</b> obras neste acervo</span><span><b>Acre</b> origem literária</span><span><b>Direto</b> contato com a autora</span></div></div></section>

   <section className="dorinha-editorial__contact dorinha-editorial__reveal"><div><MessageCircle/><span>CONTATO DIRETO</span><h2>Encontre a próxima leitura.</h2><p>Converse com Dorinha para saber valores, disponibilidade e formas de receber os livros.</p></div><a href={whatsapp(phone)} target="_blank" rel="noreferrer">Falar com Dorinha <ArrowRight/></a><button type="button" onClick={share}><Share2/> {copied?"Link copiado":"Compartilhar página"}</button></section>
  </main>
  <PublicFooter/>
 </div>
}
