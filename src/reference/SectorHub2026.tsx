import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Croissant, Grid2X2, Heart, ListChecks, MapPin, PackageSearch, Pill, Search, ShoppingBasket, Sparkles, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product, StoreRow } from "../data/catalog";
import { marketplaceSectors, type MarketplaceSector } from "./MarketplaceSectors";
import "./SectorHub2026.css";

const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
function belongs(product:Product,sector:MarketplaceSector){const text=normalize(`${product.category||""} ${product.name||""}`);return sector.productCategories.some(term=>text.includes(normalize(term)))}
function storeCount(store:StoreRow,products:Product[],sector:MarketplaceSector){return products.filter(product=>belongs(product,sector)&&(String(product.establishmentId)===String(store.id)||product.offers?.some(offer=>String(offer.establishmentId)===String(store.id)))).length}
function matchesFor(catalog:CatalogPayload|null,sector:MarketplaceSector){if(!catalog)return[];return catalog.stores.map(store=>({store,count:storeCount(store,catalog.products,sector)})).filter(({store,count})=>count>0||Boolean(store.kind&&sector.businessKinds.includes(store.kind))).sort((a,b)=>b.count-a.count||a.store.name.localeCompare(b.store.name,"pt-BR"))}

export function SectorHub2026(){
  const [catalog,setCatalog]=useState<CatalogPayload|null>(null);
  useEffect(()=>{let active=true;void fetchCatalog().then(data=>{if(active)setCatalog(data)}).catch(()=>undefined);return()=>{active=false}},[]);

  const sectorData=useMemo(()=>marketplaceSectors.map(sector=>({sector,stores:matchesFor(catalog,sector),products:catalog?.products.filter(product=>belongs(product,sector)).length||0})),[catalog]);
  const featuredStores=useMemo(()=>{if(!catalog)return[];return [...catalog.stores].sort((a,b)=>(b.products||0)-(a.products||0)||a.name.localeCompare(b.name,"pt-BR")).slice(0,8)},[catalog]);
  const totalSectorStores=sectorData.reduce((sum,item)=>sum+item.stores.length,0);

  return <div className="sector-hub">
    <header className="sector-hub__top"><div className="sector-hub__shell"><Link to="/" className="sector-hub__brand"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/></Link><nav aria-label="Ações rápidas"><Link to="/buscar"><Search/>Buscar</Link><Link to="/cesta-basica"><ListChecks/>Minha lista</Link><Link to="/favoritos"><Heart/>Favoritos</Link></nav></div></header>

    <main id="conteudo-principal">
      <section className="sector-hub__hero"><div className="sector-hub__shell sector-hub__hero-grid"><div className="sector-hub__hero-copy"><span className="sector-hub__eyebrow"><Grid2X2/>EXPLORAR FEIJÓ POR SETOR</span><h1>Tudo o que a plataforma reúne, <em>organizado para encontrar rápido.</em></h1><p>Produtos, mercados, açougues, farmácias, alimentação, cultura e serviços locais em uma central única. Entre pelo que você precisa e veja somente opções relacionadas.</p><form action="/buscar" role="search"><Search/><input name="q" aria-label="Pesquisar na plataforma" placeholder="Busque produto, estabelecimento, serviço ou categoria…"/><button type="submit">Pesquisar <ArrowRight/></button></form><div className="sector-hub__hero-actions"><Link to="/estabelecimentos"><Store/>Todos os estabelecimentos</Link><Link to="/cesta-inteligente"><Sparkles/>Cesta Inteligente</Link></div></div><aside className="sector-hub__summary"><span>VISÃO GERAL</span><strong>PreçoCerto local</strong><p>Uma plataforma para descobrir, comparar e acessar negócios e conteúdos locais sem misturar categorias diferentes.</p><div><article><b>{catalog?.metrics.stores??"—"}</b><small>estabelecimentos</small></article><article><b>{catalog?.metrics.products??"—"}</b><small>produtos</small></article><article><b>{totalSectorStores||"—"}</b><small>opções por setor</small></article></div><small className="sector-hub__catalog-note"><BadgeCheck/> Catálogos também aparecem quando a venda direta ainda não está habilitada.</small></aside></div></section>

      <section className="sector-hub__content sector-hub__shell">
        <header className="sector-hub__section-head"><div><span>SETORES DA PLATAFORMA</span><h2>Escolha pela sua necessidade.</h2></div><p>Cada setor concentra estabelecimentos, produtos ou perfis relacionados. Assim açougues aparecem junto dos mercados, enquanto autores e projetos culturais ficam em uma experiência própria.</p></header>

        <div className="sector-hub__sectors">{sectorData.map(({sector,stores,products})=>{const Icon=sector.icon;return <Link key={sector.id} to={sector.href} className={`sector-hub__sector sector-hub__sector--${sector.id}`}><div className="sector-hub__sector-icon"><Icon/></div><div className="sector-hub__sector-copy"><small>{sector.eyebrow}</small><strong>{sector.label}</strong><p>{sector.description}</p><div className="sector-hub__sector-meta"><span><Store/>{stores.length} {stores.length===1?"opção":"opções"}</span>{products>0&&<span><PackageSearch/>{products} produtos</span>}</div></div><ArrowRight className="sector-hub__arrow"/></Link>})}</div>

        <section className="sector-hub__tools" aria-labelledby="sector-tools-title"><div className="sector-hub__tools-copy"><span>FERRAMENTAS PARA DECIDIR MELHOR</span><h2 id="sector-tools-title">Não é só um diretório.</h2><p>Depois de encontrar o setor certo, use as ferramentas da plataforma para comparar preços, montar listas e planejar a compra.</p></div><div className="sector-hub__tool-grid"><Link to="/buscar"><Search/><span><strong>Comparar preços</strong><small>Pesquise um item e veja ofertas disponíveis.</small></span><ArrowRight/></Link><Link to="/cesta-inteligente"><Sparkles/><span><strong>Cesta Inteligente</strong><small>Monte a cesta de acordo com seu orçamento.</small></span><ArrowRight/></Link><Link to="/cesta-basica"><ShoppingBasket/><span><strong>Lista de compras</strong><small>Organize itens e acompanhe o valor estimado.</small></span><ArrowRight/></Link><Link to="/favoritos"><Heart/><span><strong>Favoritos</strong><small>Guarde produtos para consultar novamente.</small></span><ArrowRight/></Link></div></section>

        <section className="sector-hub__stores" aria-labelledby="sector-stores-title"><header><div><span>NEGÓCIOS LOCAIS</span><h2 id="sector-stores-title">Estabelecimentos em destaque.</h2></div><Link to="/estabelecimentos">Ver diretório completo <ArrowRight/></Link></header>{featuredStores.length?<div className="sector-hub__store-grid">{featuredStores.map(store=><Link key={store.id} to={`/estabelecimento/${store.slug||store.id}`}><i style={{background:store.color}}><Store/></i><span><small>{store.neighborhood||"Feijó"}</small><strong>{store.name}</strong><em>{store.products||0} itens catalogados</em></span><b>VER CATÁLOGO</b><ArrowRight/></Link>)}</div>:<div className="sector-hub__empty"><PackageSearch/><span><strong>Carregando estabelecimentos</strong><small>Os negócios cadastrados aparecerão aqui automaticamente.</small></span></div>}</section>

        <section className="sector-hub__special"><article><BookOpen/><span><small>CULTURA E CONHECIMENTO</small><strong>Autores, livros e projetos culturais</strong><p>Conteúdo cultural tem espaço próprio e não é tratado como supermercado ou estabelecimento comercial comum.</p><Link to="/livros">Explorar cultura <ArrowRight/></Link></span></article><article><BriefcaseBusiness/><span><small>SERVIÇOS LOCAIS</small><strong>Profissionais e especialidades</strong><p>Encontre serviços organizados por área de atuação e acesse as informações relevantes para decidir.</p><Link to="/servicos">Explorar serviços <ArrowRight/></Link></span></article></section>

        <section className="sector-hub__how"><div><TrendingDown/><span><small>01 · COMPARE</small><strong>Encontre preços e opções locais</strong></span></div><div><Store/><span><small>02 · ESCOLHA</small><strong>Abra o catálogo ou perfil certo</strong></span></div><div><MapPin/><span><small>03 · ACESSE</small><strong>Veja localização e informações úteis</strong></span></div></section>
      </section>
    </main>

    <footer className="sector-hub__footer"><div className="sector-hub__shell"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/><span>Comércio, preços, cultura e serviços locais em uma plataforma.</span><Link to="/">Voltar ao início <ArrowRight/></Link></div></footer>
  </div>
}
