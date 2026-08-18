import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Building2, ChevronRight, MapPin, MapPinOff, Search, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/roles";
import { getStoreLogoUrl } from "../data/storeLogos";
import { JsonLd } from "./JsonLd";
import { FeijoMiniMap, isInFeijo, type MapPoint } from "./FeijoMiniMap";
import "./EstablishmentsMarketplacePage.css";

type Establishment = { id:string; name:string; neighborhood:string|null; brand_color:string|null; kind:string|null; slug:string|null; is_verified:boolean; is_sponsored:boolean; sponsored_until:string|null; logo_url:string|null; short_description:string|null; partner_tier?:string|null; latitude?:number|null; longitude?:number|null };
type Merchant = { id:string; establishment_id:string|null; status:string; online_sales_enabled:boolean; delivery_enabled:boolean; pickup_enabled:boolean; business_type:string; service_settings:any; address?:any };
type DirectoryItem = Establishment & { merchant?:Merchant; online:boolean; direct:boolean; demo:boolean; sponsored:boolean; lat:number|null; lng:number|null };

const labels:Record<string,string> = { market:"Mercado", grocery:"Mercado / Mercearia", supermarket:"Supermercado", pizzeria:"Pizzaria", snack_bar:"Lanchonete", bakery:"Padaria", pharmacy:"Farmácia", restaurant:"Restaurante", beverage:"Bebidas", pet_shop:"Pet Shop", cosmetics:"Cosméticos", services:"Serviços", books_author:"Livraria / Autora", other:"Comércio local" };

const number = (value:unknown):number|null => {
  const parsed = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

/** Lê coordenadas reais do cadastro; nunca gera pontos fictícios. */
function readCoordinates(establishment:any, merchant:any){
  const address = merchant?.address ?? {};
  const lat = number(establishment?.latitude) ?? number(address.latitude) ?? number(address.lat);
  const lng = number(establishment?.longitude) ?? number(address.longitude) ?? number(address.lng) ?? number(address.lon);
  return isInFeijo(lat, lng) ? { lat: lat as number, lng: lng as number } : { lat:null, lng:null };
}

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
  short_description:"Espaço literário da escritora Dorinha Barroso, com livros e contato direto para compra.",
  partner_tier:null,
  online:false,
  direct:true,
  demo:false,
  sponsored:false,
  lat:null,
  lng:null,
};

const ESTABLISHMENT_COLUMNS = "id,name,neighborhood,brand_color,kind,slug,is_verified,is_sponsored,sponsored_until,logo_url,short_description,partner_tier";

export function EstablishmentsMarketplacePage(){
  const navigate = useNavigate();
  const [items,setItems] = useState<DirectoryItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const [query,setQuery] = useState("");
  const [kind,setKind] = useState("all");
  const [onlyPurchasable,setOnlyPurchasable] = useState(false);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [mapOpen,setMapOpen] = useState(false);
  const showDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";

  useEffect(()=>{ void (async()=>{
    if(!supabase){ setItems([dorinhaFallback]); setLoading(false); return; }
    // Colunas de coordenada são opcionais no schema: tenta com elas e recua se não existirem.
    let establishments:any[]|null = null;
    const withCoords = await supabase.from("establishments").select(`${ESTABLISHMENT_COLUMNS},latitude,longitude`).order("name");
    if(withCoords.error){
      const base = await supabase.from("establishments").select(ESTABLISHMENT_COLUMNS).order("name");
      if(base.error){ setError(true); setItems([]); setLoading(false); return; }
      establishments = base.data;
    } else establishments = withCoords.data;

    const { data:merchants } = await supabase.from("merchants").select("id,establishment_id,status,online_sales_enabled,delivery_enabled,pickup_enabled,business_type,service_settings,address").eq("status","active");
    const merchantMap = new Map((merchants??[]).filter((row:any)=>row.establishment_id).map((row:any)=>[row.establishment_id,row]));
    const now = Date.now();
    let merged = (establishments??[]).map((establishment:any)=>{
      const merchant:any = merchantMap.get(establishment.id);
      const coords = readCoordinates(establishment, merchant);
      return { ...establishment, merchant, online:Boolean(merchant?.online_sales_enabled), direct:Boolean(merchant?.service_settings?.direct_sales_enabled), demo:Boolean(merchant?.service_settings?.demo_mode), sponsored:Boolean(establishment.is_sponsored && (!establishment.sponsored_until || new Date(establishment.sponsored_until).getTime()>now)), ...coords } as DirectoryItem;
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

  const mapPoints:MapPoint[] = useMemo(()=>filtered.filter(item=>isInFeijo(item.lat,item.lng)).map(item=>({ id:item.id, name:item.name, lat:item.lat as number, lng:item.lng as number, sponsored:item.sponsored, verified:item.is_verified })),[filtered]);
  const missingCount = filtered.length - mapPoints.length;
  const purchasable = items.filter(item=>item.online||item.direct).length;
  const verified = items.filter(item=>item.is_verified).length;

  const openById = (id:string)=>{ const item = items.find(entry=>entry.id===id); if(item) navigate(catalogUrl(item)); };

  const storesStructuredData = useMemo(()=>({
    "@context":"https://schema.org",
    "@type":"ItemList",
    name:"Estabelecimentos comerciais de Feijó (AC)",
    itemListElement: items.map((item,index)=>({
      "@type":"ListItem",
      position:index+1,
      item:{
        "@type":"LocalBusiness",
        name:item.name,
        url:`https://precocerto.live${catalogUrl(item)}`,
        ...(item.short_description?{description:item.short_description}:{}),
        ...(isInFeijo(item.lat,item.lng)?{geo:{"@type":"GeoCoordinates",latitude:item.lat,longitude:item.lng}}:{}),
        address:{
          "@type":"PostalAddress",
          addressLocality: item.neighborhood?`${item.neighborhood}, Feijó`:"Feijó",
          addressRegion:"AC",
          addressCountry:"BR",
        },
        additionalType:labels[item.merchant?.business_type||item.kind||"other"]??"Comércio local",
      },
    })),
  }),[items]);

  return <div className="est-page">
    <header className="est-header"><div className="est-shell est-header__inner">
      <a className="est-brand" href="/" aria-label="PreçoCerto - início"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/><span>Feijó-AC</span></a>
      <nav className="est-nav" aria-label="Navegação de estabelecimentos"><a href="/buscar">Buscar preços</a><a href="/melhores-precos">Melhores preços</a><a href="/cesta-basica">Cesta inteligente</a></nav>
      <a className="est-header__cta" href="/lojista">Sou comerciante</a>
    </div></header>

    <main className="est-main" id="estabelecimentos">
      <JsonLd id="est-stores-jsonld" data={storesStructuredData} />
      <div className="est-shell est-layout">
        <div className="est-top">
          <div className="est-top__title">
            <h1>Estabelecimentos de Feijó <span>com catálogo no PreçoCerto</span></h1>
            <p>Filtre, veja no mapa da cidade e entre direto na vitrine do comércio local.</p>
          </div>
          <dl className="est-summary" aria-label="Resumo do diretório">
            <div><dt>Cadastros</dt><dd>{items.length}</dd></div>
            <div><dt>Compra</dt><dd>{purchasable}</dd></div>
            <div><dt>Verificados</dt><dd>{verified}</dd></div>
          </dl>
        </div>

        <div className="est-filters" role="search">
          <label className="est-search"><Search size={17} aria-hidden="true"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar estabelecimento ou bairro" aria-label="Buscar estabelecimento ou bairro"/></label>
          <select className="est-select" value={kind} onChange={event=>setKind(event.target.value)} aria-label="Filtrar por segmento"><option value="all">Todos os segmentos</option>{categories.map(category=><option key={category} value={category}>{labels[category]??category}</option>)}</select>
          <button className={`est-filter${onlyPurchasable?" is-active":""}`} type="button" aria-pressed={onlyPurchasable} onClick={()=>setOnlyPurchasable(value=>!value)}><ShoppingBag size={15}/> Compra</button>
          <button className={`est-filter est-filter--map${mapOpen?" is-active":""}`} type="button" aria-pressed={mapOpen} aria-controls="est-map-panel" onClick={()=>setMapOpen(value=>!value)}><MapPin size={15}/> Mapa</button>
        </div>

        <div className="est-body">
          <section className="est-list" aria-label="Lista de estabelecimentos" aria-busy={loading}>
            <p className="est-count" role="status">{loading?"Carregando estabelecimentos…":`${filtered.length} ${filtered.length===1?"estabelecimento":"estabelecimentos"}`}{!loading&&missingCount>0&&<span> · {missingCount} sem localização cadastrada</span>}</p>
            <div className="est-scroll">
              {loading && Array.from({length:6}).map((_,index)=><div className="est-skeleton" key={index} aria-hidden="true"/>)}
              {!loading && error && <div className="est-empty">Não foi possível carregar os estabelecimentos agora. Atualize a página em instantes.</div>}
              {!loading && !error && filtered.map(item=>{
                const segment = item.merchant?.business_type||item.kind||"other";
                const author = isAuthor(item);
                const logo = item.logo_url||getStoreLogoUrl(item.name);
                const target = catalogUrl(item);
                const located = isInFeijo(item.lat,item.lng);
                return <article key={item.id} className={`est-card${selectedId===item.id?" is-selected":""}`} aria-current={selectedId===item.id||undefined}>
                  <button type="button" className="est-card__main" onClick={()=>{ setSelectedId(item.id); if(located) setMapOpen(true); }} aria-label={`Selecionar ${item.name} no mapa`}>
                    <span className="est-logo" style={{background:item.brand_color||"var(--pc-color-foreground)"}}>{logo?<img src={logo} alt="" loading="lazy" onError={event=>{event.currentTarget.style.display="none"}}/>:author?<BookOpen aria-hidden="true"/>:<Store aria-hidden="true"/>}</span>
                    <span className="est-card__info">
                      <span className="est-card__row">
                        <strong>{item.name}</strong>
                        <span className="est-badges">
                          {item.sponsored&&<span className="est-badge est-badge--premium"><Sparkles size={11}/> Patrocinado</span>}
                          {item.partner_tier==="premium"&&<span className="est-badge est-badge--premium">Premium</span>}
                          {item.is_verified ? (
                            <span className="est-badge est-badge--verified"><BadgeCheck size={11}/> Verificado</span>
                          ) : (
                            <span className="est-badge est-badge--registered">Cadastrado</span>
                          )}
                          {(item.online||item.direct)&&<span className="est-badge est-badge--online"><ShoppingBag size={11}/> Compra</span>}
                        </span>
                      </span>

                      <span className="est-meta">
                        <span className="est-type">{labels[segment]??"Comércio local"}</span>
                        {item.neighborhood&&<span><MapPin size={12}/>{item.neighborhood}</span>}
                        {item.merchant?.delivery_enabled&&<span><Truck size={12}/>Entrega</span>}
                        {item.merchant?.pickup_enabled&&<span><Building2 size={12}/>Retirada</span>}
                        {!located&&<span className="est-nogeo"><MapPinOff size={12}/>localização não cadastrada</span>}
                      </span>
                    </span>
                  </button>
                  <div className="est-card__actions">
                    {author?<a className="est-action--primary" href="/autora/dorinha-barroso"><BookOpen size={14}/> Autora</a>
                      :item.online&&item.merchant?<a className="est-action--primary" href={`/loja/${item.merchant.id}`}><ShoppingBag size={14}/> Comprar</a>
                      :<a className="est-action--primary" href={target}><Store size={14}/> Catálogo</a>}
                    <a className="est-action--secondary" href={target} aria-label={`Abrir catálogo de ${item.name}`}><ChevronRight size={15}/></a>
                  </div>
                </article>;
              })}
              {!loading && !error && !filtered.length && <div className="est-empty">Nenhum estabelecimento encontrado com esses filtros.</div>}
            </div>
          </section>

          <aside id="est-map-panel" className={`est-map${mapOpen?" is-open":""}`} aria-label="Mapa de Feijó com os estabelecimentos filtrados">
            <FeijoMiniMap points={mapPoints} selectedId={selectedId} missingCount={missingCount} onSelect={setSelectedId} onOpen={openById} />
          </aside>
        </div>
      </div>
    </main>

    <footer className="est-footer"><div className="est-shell est-footer__inner"><span>PreçoCerto · Feijó-AC</span><a href="/lojista">Cadastrar meu negócio</a><a href="/fale-conosco">Fale conosco</a></div></footer>
  </div>;
}
