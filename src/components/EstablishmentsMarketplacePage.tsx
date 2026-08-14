import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Building2, ChevronRight, MapPin, Search, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/roles";
import { getStoreLogoUrl } from "../data/storeLogos";
import "./EstablishmentsMarketplacePage.css";

type Establishment = { id:string; name:string; neighborhood:string|null; brand_color:string|null; kind:string|null; slug:string|null; is_verified:boolean; is_sponsored:boolean; sponsored_until:string|null; logo_url:string|null; short_description:string|null; partner_tier?:string|null };
type Merchant = { id:string; establishment_id:string|null; status:string; online_sales_enabled:boolean; delivery_enabled:boolean; pickup_enabled:boolean; business_type:string; service_settings:any };
type DirectoryItem = Establishment & { merchant?:Merchant; online:boolean; direct:boolean; demo:boolean; sponsored:boolean };

const labels:Record<string,string> = { market:"Mercado", grocery:"Mercado / Mercearia", supermarket:"Supermercado", pizzeria:"Pizzaria", snack_bar:"Lanchonete", bakery:"Padaria", pharmacy:"Farmácia", restaurant:"Restaurante", beverage:"Bebidas", pet_shop:"Pet Shop", cosmetics:"Cosméticos", services:"Serviços", books_author:"Livraria / Autora", other:"Comércio local" };

const dorinhaFallback:DirectoryItem = {
  id:"local-dorinha-barroso",
  name:"Dorinha Barroso · Livros",
  neighborhood:"Feijó",
  brand_color:"var(--pc-color-foreground)",
  kind:"books_author",
  slug:"dorinha-barroso-livros",
  is_verified:true,
  is_sponsored:false,
  sponsored_until:null,
  logo_url:null,
  short_description:"Espaço literário da escritora Dorinha Barroso, com livros, informações sobre a autora e contato direto para compra.",
  partner_tier:null,
  online:false,
  direct:true,
  demo:false,
  sponsored:false,
};

export function EstablishmentsMarketplacePage(){
  const navigate = useNavigate();
  const [items,setItems] = useState<DirectoryItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [query,setQuery] = useState("");
  const [kind,setKind] = useState("all");
  const [onlyPurchasable,setOnlyPurchasable] = useState(false);
  const showDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";

  useEffect(()=>{ void (async()=>{
    if(!supabase){ setItems([dorinhaFallback]); setLoading(false); return; }
    const [{data:establishments},{data:merchants}] = await Promise.all([
      supabase.from("establishments").select("id,name,neighborhood,brand_color,kind,slug,is_verified,is_sponsored,sponsored_until,logo_url,short_description,partner_tier").order("name"),
      supabase.from("merchants").select("id,establishment_id,status,online_sales_enabled,delivery_enabled,pickup_enabled,business_type,service_settings").eq("status","active"),
    ]);
    const merchantMap = new Map((merchants??[]).filter((row:any)=>row.establishment_id).map((row:any)=>[row.establishment_id,row]));
    const now = Date.now();
    let merged = (establishments??[]).map((establishment:any)=>{
      const merchant:any = merchantMap.get(establishment.id);
      const demo = Boolean(merchant?.service_settings?.demo_mode);
      const direct = Boolean(merchant?.service_settings?.direct_sales_enabled);
      return { ...establishment, merchant, online:Boolean(merchant?.online_sales_enabled), direct, demo, sponsored:Boolean(establishment.is_sponsored && (!establishment.sponsored_until || new Date(establishment.sponsored_until).getTime()>now)) } as DirectoryItem;
    }).filter(item=>showDemo||!item.demo);
    const hasDorinha = merged.some(item=>item.slug==="dorinha-barroso-livros" || item.kind==="books_author" || item.name.toLocaleLowerCase("pt-BR").includes("dorinha barroso"));
    if(!hasDorinha) merged = [...merged, dorinhaFallback];
    merged.sort((a,b)=>Number(b.sponsored)-Number(a.sponsored)||Number(b.online||b.direct)-Number(a.online||a.direct)||Number(b.is_verified)-Number(a.is_verified)||a.name.localeCompare(b.name,"pt-BR"));
    setItems(merged); setLoading(false);
  })(); },[showDemo]);

  const categories = useMemo(()=>Array.from(new Set(items.map(item=>item.merchant?.business_type||item.kind||"other"))).sort(),[items]);
  const filtered = useMemo(()=>items.filter(item=>{
    const q = query.trim().toLocaleLowerCase("pt-BR");
    const segment = item.merchant?.business_type||item.kind||"other";
    const text = `${item.name} ${item.neighborhood??""} ${labels[segment]??""}`.toLocaleLowerCase("pt-BR");
    return (!q||text.includes(q)) && (kind==="all"||segment===kind) && (!onlyPurchasable||item.online||item.direct);
  }),[items,query,kind,onlyPurchasable]);

  const isAuthor = (item:DirectoryItem)=>item.slug==="dorinha-barroso-livros"||(item.merchant?.business_type||item.kind)==="books_author"||item.name.toLocaleLowerCase("pt-BR").includes("dorinha barroso");
  const catalogUrl = (item:DirectoryItem)=>isAuthor(item)?"/autora/dorinha-barroso":`/estabelecimento/${encodeURIComponent(item.slug||item.id)}`;
  const purchasable = items.filter(item=>item.online||item.direct).length;
  const verified = items.filter(item=>item.is_verified).length;

  return <div className="est-page">
    <header className="est-header"><div className="est-shell est-header__inner"><a className="est-brand" href="/" aria-label="PreçoCerto - início"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/><span>Feijó-AC</span></a><nav className="est-nav" aria-label="Navegação de estabelecimentos"><a href="/buscar">Buscar preços</a><a href="/melhores-precos">Melhores preços</a><a href="/cesta-basica">Cesta inteligente</a></nav><a className="est-header__cta" href="/lojista">Sou comerciante</a></div></header>
    <main>
      <section className="est-hero"><div className="est-hero__image" aria-hidden="true"/><div className="est-hero__overlay" aria-hidden="true"/><div className="est-shell est-hero__inner"><div><span className="est-kicker"><MapPin size={15}/> comércio local de Feijó</span><h1>Encontre estabelecimentos e <span>explore cada catálogo.</span></h1><p>Veja mercados, farmácias e outros negócios locais, consulte produtos e preços e entre direto na vitrine de cada estabelecimento.</p><div className="est-hero__actions"><a className="est-btn est-btn--primary" href="#estabelecimentos"><Store size={18}/> Explorar lojas</a><a className="est-btn est-btn--ghost" href="/lojista">Cadastrar meu negócio <ChevronRight size={17}/></a></div></div><aside className="est-stats" aria-label="Resumo dos estabelecimentos"><div className="est-stat"><strong>{items.length}</strong><span>estabelecimentos cadastrados</span></div><div className="est-stat"><strong>{purchasable}</strong><span>com compra disponível</span></div><div className="est-stat"><strong>{verified}</strong><span>cadastros verificados</span></div></aside></div></section>
      <section className="est-strip" aria-label="Como identificar as lojas"><div className="est-shell est-strip__inner"><div className="est-strip__item"><BadgeCheck/><div><strong>Cadastro verificado</strong><small>Identificação confirmada pelo PreçoCerto.</small></div></div><div className="est-strip__item"><ShoppingBag/><div><strong>Catálogo navegável</strong><small>Entre no estabelecimento e veja os produtos.</small></div></div><div className="est-strip__item"><Sparkles/><div><strong>Destaques identificados</strong><small>Parcerias e patrocínios aparecem sinalizados.</small></div></div></div></section>
      <section id="estabelecimentos" className="est-directory"><div className="est-shell"><div className="est-heading"><div><span>Diretório local</span><h2>Escolha onde quer pesquisar.</h2><p>Filtre por nome, bairro ou segmento e entre diretamente no catálogo do estabelecimento.</p></div><a href="/lojista">Cadastrar meu negócio <ChevronRight size={16}/></a></div><div className="est-filters"><label className="est-search"><Search size={18} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar estabelecimento ou bairro" aria-label="Buscar estabelecimento ou bairro"/></label><select className="est-select" value={kind} onChange={event=>setKind(event.target.value)} aria-label="Filtrar por segmento"><option value="all">Todos os segmentos</option>{categories.map(category=><option key={category} value={category}>{labels[category]??category}</option>)}</select><button className={`est-filter${onlyPurchasable?" is-active":""}`} type="button" onClick={()=>setOnlyPurchasable(value=>!value)}><ShoppingBag size={16}/> Compra disponível</button></div>{loading?<div className="est-empty">Carregando estabelecimentos…</div>:<div className="est-grid">{filtered.map(item=>{const segment=item.merchant?.business_type||item.kind||"other";const author=isAuthor(item);const logo=item.logo_url||getStoreLogoUrl(item.name);const target=catalogUrl(item);return <article key={item.id} className="est-card" role="link" tabIndex={0} aria-label={`Abrir catálogo de ${item.name}`} onClick={()=>navigate(target)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();navigate(target)}}}>{item.sponsored&&<div className="est-ribbon">PATROCINADO</div>}<div className="est-card__head"><div className="est-logo" style={{background:item.brand_color||"var(--pc-color-foreground)"}}>{logo?<img src={logo} alt={`Logo ${item.name}`} loading="lazy" onError={event=>{event.currentTarget.style.display="none"}}/>:author?<BookOpen aria-hidden="true"/>:<Store aria-hidden="true"/>}</div><div className="est-badges">{item.partner_tier==="premium"&&<span className="est-badge est-badge--premium"><Sparkles size={12}/> Premium</span>}{item.is_verified&&<span className="est-badge est-badge--verified"><BadgeCheck size={12}/> Verificado</span>}{(item.online||item.direct)&&<span className="est-badge est-badge--online"><ShoppingBag size={12}/> Compra disponível</span>}</div></div><div className="est-card__body"><span className="est-type">{labels[segment]??"Comércio local"}</span><h3>{item.name}</h3><p>{item.short_description||"Explore o catálogo e os preços deste estabelecimento no PreçoCerto."}</p><div className="est-meta">{item.neighborhood&&<span><MapPin size={14}/>{item.neighborhood}</span>}{item.merchant?.delivery_enabled&&<span><Truck size={14}/>Entrega</span>}{item.merchant?.pickup_enabled&&<span><Building2 size={14}/>Retirada</span>}</div><div className="est-enter"><span>{author?"Entrar no espaço da autora":"Entrar no estabelecimento"}</span><ChevronRight size={17}/></div></div><div className="est-card__footer" onClick={event=>event.stopPropagation()}>{author?<a className="est-action--primary" href="/autora/dorinha-barroso"><BookOpen size={16}/> Espaço da autora</a>:item.online&&item.merchant?<a className="est-action--primary" href={`/loja/${item.merchant.id}`}><ShoppingBag size={16}/> Comprar online</a>:<a className="est-action--primary" href={target}><Store size={16}/> Ver catálogo</a>}<a className="est-action--secondary" href={target}>Explorar <ChevronRight size={15}/></a></div></article>})}{!filtered.length&&<div className="est-empty">Nenhum estabelecimento encontrado com esses filtros.</div>}</div>}</div></section>
      <section className="est-cta"><div className="est-shell est-cta__inner"><div><span className="est-kicker">Para comerciantes</span><h2>Seu negócio também pode ter uma vitrine profissional.</h2><p>Cadastre identidade, catálogo e preços e ative vendas online quando estiver pronto.</p></div><a className="est-btn" href="/lojista">Quero fazer parte <ChevronRight size={18}/></a></div></section>
    </main>
    <footer className="est-footer"><div className="est-shell est-footer__inner"><span>PreçoCerto · Feijó-AC</span><a href="/fale-conosco">Fale conosco</a></div></footer>
  </div>
}
