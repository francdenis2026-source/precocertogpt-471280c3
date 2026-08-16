import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Croissant, Grid2X2, MapPin, PackageSearch, Pill, Search, ShoppingBasket, Store, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product, StoreRow } from "../data/catalog";
import "./MarketplaceSectors.css";
import "./ExploreLayoutFix.css";
import "./SectorContentArchitecture.css";

export type MarketplaceSectorId = "all" | "markets" | "pharmacies" | "bakery" | "books" | "services";
export type MarketplaceSector = {
  id: MarketplaceSectorId;
  label: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  searchHint: string;
  href: string;
  icon: LucideIcon;
  productCategories: string[];
  businessKinds: string[];
  highlights: string[];
  examples: string[];
};

export const marketplaceSectors: MarketplaceSector[] = [
  { id:"markets",label:"Mercados, mercearias e açougues",shortLabel:"Mercados",eyebrow:"Compras do dia a dia",title:"Mercados, açougues e itens para casa em um só setor.",description:"Compare alimentos, carnes, bebidas, limpeza e outros itens vendidos por mercados, mercearias e açougues de Feijó.",searchHint:"Arroz, carne, café, limpeza ou mercado…",href:"/mercados",icon:ShoppingBasket,productCategories:["mercearia","acougue","carnes","carne","frango","peixe","laticinios","limpeza","hortifruti","bebidas","higiene","congelados"],businessKinds:["market","grocery","supermarket","beverage","butcher","butchery"],highlights:["Compare preços locais","Encontre açougues e mercados","Monte sua lista"],examples:["Mercados","Mercearias","Açougues","Bebidas","Hortifruti","Limpeza"] },
  { id:"pharmacies",label:"Farmácias e saúde",shortLabel:"Farmácias",eyebrow:"Saúde e cuidados",title:"Farmácias, higiene e cuidados pessoais.",description:"Uma área própria para farmácias, perfumaria, higiene e produtos de saúde, sem misturar com o supermercado.",searchHint:"Farmácia, higiene ou produto de saúde…",href:"/farmacias",icon:Pill,productCategories:["farmacia","medicamentos","saude","higiene","perfumaria","cuidados pessoais"],businessKinds:["pharmacy","health"],highlights:["Farmácias locais","Cuidados pessoais","Consulte disponibilidade"],examples:["Farmácias","Higiene","Perfumaria","Cuidados pessoais"] },
  { id:"bakery",label:"Padarias e alimentação",shortLabel:"Alimentação",eyebrow:"Comida perto de você",title:"Padarias, lanchonetes e alimentação local.",description:"Cardápios, produtos preparados, encomendas e estabelecimentos de alimentação em uma área dedicada.",searchHint:"Pão, bolo, lanche ou padaria…",href:"/padarias",icon:Croissant,productCategories:["padaria","alimentos preparados","lanches","refeicoes","doces","salgados"],businessKinds:["bakery","restaurant","pizzeria","snack_bar","food"],highlights:["Veja produtos e cardápios","Conheça opções locais","Consulte retirada ou entrega"],examples:["Padarias","Lanchonetes","Restaurantes","Doces e salgados"] },
  { id:"books",label:"Livros, autores e cultura",shortLabel:"Livros e cultura",eyebrow:"Cultura e conhecimento",title:"Obras, autores e projetos culturais com contexto próprio.",description:"Perfis editoriais, livros, autores e iniciativas culturais aparecem como conteúdo cultural — não como lojas de supermercado.",searchHint:"Título, autora, autor ou projeto cultural…",href:"/livros",icon:BookOpen,productCategories:["livros","literatura","cultura","educacao"],businessKinds:["books_author","bookstore","publisher","culture"],highlights:["Conheça autores","Descubra obras","Acesse projetos culturais"],examples:["Autores","Livros","Editoras","Projetos culturais"] },
  { id:"services",label:"Serviços e profissionais",shortLabel:"Serviços",eyebrow:"Profissionais locais",title:"Profissionais e serviços locais organizados por especialidade.",description:"Autônomos e prestadores com especialidades, área atendida e formas de contato claras.",searchHint:"Serviço, profissão ou especialidade…",href:"/servicos",icon:BriefcaseBusiness,productCategories:["servicos","profissionais","autonomos"],businessKinds:["services","professional","freelancer"],highlights:["Compare especialidades","Veja a área atendida","Fale com o profissional"],examples:["Autônomos","Profissionais","Serviços locais"] },
];

const normalize = (value:string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
export function getMarketplaceSector(value:string|null|undefined){return marketplaceSectors.find(s=>s.id===value)||null}
export function inferProductSector(category:string):MarketplaceSectorId{
  const n=normalize(category);
  return marketplaceSectors.find(s=>s.productCategories.some(i=>n.includes(normalize(i))))?.id||"markets";
}

function productBelongsToSector(product: Product, sector: MarketplaceSector) {
  const haystack = normalize(`${product.category || ""} ${product.name || ""}`);
  return sector.productCategories.some(term => haystack.includes(normalize(term)));
}

function storeProductCount(store: StoreRow, products: Product[], sector: MarketplaceSector) {
  return products.filter(product => {
    if (!productBelongsToSector(product, sector)) return false;
    if (String(product.establishmentId) === String(store.id)) return true;
    return product.offers?.some(offer => String(offer.establishmentId) === String(store.id)) || false;
  }).length;
}

function storesForSector(catalog: CatalogPayload | null, sector: MarketplaceSector) {
  if (!catalog) return [];
  return catalog.stores
    .map(store => ({ store, count: storeProductCount(store, catalog.products, sector) }))
    .filter(item => item.count > 0 || (!!item.store.kind && sector.businessKinds.includes(item.store.kind)))
    .sort((a,b) => b.count - a.count || a.store.name.localeCompare(b.store.name,"pt-BR"));
}

export function SectorNavigator({active="all",compact=false,counts}:{active?:MarketplaceSectorId;compact?:boolean;counts?:Partial<Record<MarketplaceSectorId,number>>}){
  return <nav className={`sector-nav${compact?" sector-nav--compact":""}`} aria-label="Explorar por setor">
    <Link className={active==="all"?"is-active":""} to="/explorar"><Grid2X2/><span><strong>Todos os setores</strong><small>Visão geral da cidade</small></span></Link>
    {marketplaceSectors.map(s=><Link key={s.id} className={active===s.id?"is-active":""} to={s.href}><s.icon/><span><strong>{s.shortLabel}</strong><small>{counts?.[s.id] !== undefined ? `${counts[s.id]} opções encontradas` : s.examples.slice(0,2).join(" · ")}</small></span></Link>)}
  </nav>
}

function Header({back=false}:{back?:boolean}){return <header className="sector-header"><div className="sector-shell"><Link className="sector-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/></Link><Link to={back?"/":"/explorar"}>{back?"Voltar ao início":"Todos os setores"} <ArrowRight/></Link></div></header>}
function Footer(){return <footer className="sector-footer"><div className="sector-shell"><Link className="sector-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/></Link><span>Feito em Feijó para aproximar pessoas e negócios locais.</span><Link to="/estabelecimentos">Ver estabelecimentos <ArrowRight/></Link></div></footer>}

function LocalStorePreview({catalog,sector}:{catalog:CatalogPayload|null;sector:MarketplaceSector}) {
  const matches = useMemo(() => storesForSector(catalog, sector), [catalog, sector]);
  if (sector.id === "books") return <CulturalProfiles />;
  return <section className="sector-real-content" aria-labelledby={`sector-local-${sector.id}`}>
    <header><div><span>O QUE JÁ EXISTE NESTE SETOR</span><h2 id={`sector-local-${sector.id}`}>Opções locais encontradas</h2><p>Mostramos estabelecimentos quando eles possuem produtos compatíveis com este setor, mesmo que ainda funcionem apenas como catálogo informativo.</p></div><Link to={`/estabelecimentos?setor=${sector.id}`}>Ver diretório completo <ArrowRight/></Link></header>
    {matches.length ? <div className="sector-store-grid">{matches.slice(0,6).map(({store,count}) => <Link to={`/estabelecimento/${store.slug || store.id}`} key={store.id} className="sector-store-card"><i style={{background:store.color}}><Store/></i><span><small>{store.neighborhood || "Feijó"}</small><strong>{store.name}</strong><em>{count} {count===1?"produto":"produtos"} neste setor</em></span><b>CATÁLOGO</b><ArrowRight/></Link>)}</div> : <div className="sector-empty-real"><PackageSearch/><span><strong>Nenhum catálogo encontrado neste setor agora</strong><small>Quando houver produtos classificados aqui, os estabelecimentos aparecerão automaticamente.</small></span></div>}
  </section>;
}

function CulturalProfiles(){return <section className="sector-real-content sector-cultural" aria-labelledby="sector-cultural-title"><header><div><span>PERFIS CULTURAIS</span><h2 id="sector-cultural-title">Autores, obras e projetos</h2><p>Nesta área, pessoas e iniciativas culturais são apresentadas como perfis editoriais, separados do diretório comercial.</p></div></header><div className="sector-profile-grid"><Link to="/dorinha-barroso"><BookOpen/><span><small>AUTORA</small><strong>Dorinha Barroso</strong><p>Perfil dedicado para conhecer a autora e acessar seus conteúdos culturais no PreçoCerto.</p></span><ArrowRight/></Link><Link to="/fremix-producoes"><Store/><span><small>PROJETO CULTURAL</small><strong>Fremix Produções</strong><p>Espaço próprio para conteúdos e iniciativas culturais vinculadas à plataforma.</p></span><ArrowRight/></Link></div></section>}

export function MarketplaceSectorLanding({sector}:{sector:MarketplaceSector}){
  const Icon=sector.icon;
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  useEffect(()=>{let active=true;void fetchCatalog().then(data=>{if(active)setCatalog(data)}).catch(()=>undefined);return()=>{active=false}},[]);
  return <div className={`sector-page sector-page--${sector.id}`}><Header/><main id="conteudo-principal" className="sector-main"><section className="sector-hero"><div className="sector-shell sector-hero__grid"><div className="sector-hero__copy"><span className="sector-eyebrow"><Icon/>{sector.eyebrow}</span><h1>{sector.title}</h1><p>{sector.description}</p><div className="sector-example-chips" aria-label="Exemplos deste setor">{sector.examples.map(example=><span key={example}>{example}</span>)}</div><form action="/buscar" role="search"><input type="hidden" name="setor" value={sector.id}/><label><Search/><span className="sr-only">Pesquisar em {sector.label}</span><input name="q" placeholder={sector.searchHint}/></label><button type="submit">Pesquisar <ArrowRight/></button></form></div><aside><span>ÁREA SELECIONADA</span><Icon/><strong>{sector.label}</strong><p>Veja conteúdo e estabelecimentos realmente relacionados a este setor.</p><Link to="#conteudo-local">Ver opções do setor <ArrowRight/></Link></aside></div></section><section className="sector-content sector-shell"><div className="sector-highlights">{sector.highlights.map((h,i)=><div key={h}><span>0{i+1}</span><BadgeCheck/><strong>{h}</strong></div>)}</div><div id="conteudo-local"><LocalStorePreview catalog={catalog} sector={sector}/></div><div className="sector-content__heading sector-content__heading--secondary"><div><span>TROCAR DE SETOR</span><h2>Continue explorando.</h2></div><p>Os setores organizam o conteúdo pelo que a pessoa procura. Dentro de cada um aparecem os negócios, produtos ou perfis correspondentes.</p></div><SectorNavigator active={sector.id} compact/></section></main><Footer/></div>
}

export function MarketplaceExplorePage(){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  useEffect(()=>{let active=true;void fetchCatalog().then(data=>{if(active)setCatalog(data)}).catch(()=>undefined);return()=>{active=false}},[]);
  const counts=useMemo(()=>Object.fromEntries(marketplaceSectors.map(sector=>[sector.id,storesForSector(catalog,sector).length])) as Partial<Record<MarketplaceSectorId,number>>,[catalog]);
  return <div className="sector-page sector-page--all"><Header back/><main id="conteudo-principal" className="sector-main"><section className="sector-hero sector-hero--explore"><div className="sector-shell sector-hero__grid"><div className="sector-hero__copy"><span className="sector-eyebrow"><Grid2X2/>PREÇOCERTO PARA TODA A CIDADE</span><h1>Escolha o que você procura. Nós organizamos o resto.</h1><p>Em vez de misturar tudo, o PreçoCerto separa produtos, estabelecimentos, alimentação, cultura e serviços em experiências próprias.</p><Link className="sector-primary-link" to="/estabelecimentos">Ver todos os estabelecimentos <ArrowRight/></Link></div><aside><span>COMO FUNCIONA</span><MapPin/><strong>Feijó, Acre</strong><p>Escolha um setor para ver somente negócios, produtos ou perfis relacionados àquela necessidade.</p><div className="sector-trust"><BadgeCheck/> Catálogos aparecem mesmo sem venda direta</div></aside></div></section><section className="sector-content sector-shell"><div className="sector-content__heading"><div><span>ESCOLHA POR SETOR</span><h2>O que você procura hoje?</h2></div><p>Mercados inclui também mercearias e açougues. Cultura reúne autores e projetos editoriais. Cada setor explica claramente o que existe dentro dele.</p></div><SectorNavigator compact counts={counts}/><div className="sector-how"><div><Search/><span><small>01 · ESCOLHA</small><strong>Entre no setor certo</strong></span></div><div><Store/><span><small>02 · VEJA</small><strong>Encontre opções reais de Feijó</strong></span></div><div><MapPin/><span><small>03 · DECIDA</small><strong>Abra catálogo, perfil ou localização</strong></span></div></div></section></main><Footer/></div>
}
