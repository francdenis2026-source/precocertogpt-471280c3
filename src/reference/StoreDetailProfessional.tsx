import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Clock3, Heart, Info, MapPin, PackageSearch, ShieldCheck, Store } from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import "./StoreDetailProfessional.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function ProductImage({ product }: { product: Product }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (source && !failed) return <img src={source} alt={product.name} loading="lazy" onError={() => setFailed(true)} />;
  return <span className="store-pro-fallback" role="img" aria-label={`Imagem de ${product.name} em atualização`}><PackageSearch /><small>{product.category}<em>Imagem em atualização</em></small></span>;
}

export function StoreDetailProfessional() {
  const { identifier = "" } = useParams();
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCatalog("", { force: true })
      .then(data => { if (active) setCatalog(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const store = useMemo(() => catalog?.stores.find(item => String(item.id) === identifier || item.slug === identifier), [catalog, identifier]);
  const products = useMemo(() => {
    if (!catalog || !store) return [];
    const matching = catalog.products.filter(item => item.offers?.some(offer => String(offer.establishmentId) === String(store.id)) || String(item.establishmentId) === String(store.id));
    return (matching.length ? matching : catalog.products).slice(0, 12);
  }, [catalog, store]);

  if (loading) return <main className="store-pro-state"><span className="store-pro-loader" /><h1>Carregando estabelecimento…</h1></main>;
  if (!store || !catalog) return <main className="store-pro-state"><Store /><h1>Estabelecimento não encontrado</h1><Link to="/estabelecimentos">Voltar aos estabelecimentos</Link></main>;

  return <div className="ref-page store-pro-page">
    <main id="conteudo-principal" className="store-pro-shell">
      <Link className="store-pro-back" to="/estabelecimentos"><ArrowLeft /> Todos os estabelecimentos</Link>

      <section className="store-pro-hero" aria-labelledby="store-title">
        <div className="store-pro-hero__overlay" />
        <div className="store-pro-hero__content">
          <div className="store-pro-logo" style={{ background: store.color }}><Store /></div>
          <div className="store-pro-copy">
            <span>CATÁLOGO LOCAL · INFORMAÇÕES DE PREÇO</span>
            <h1 id="store-title">{store.name}</h1>
            <div className="store-pro-meta-line"><b><BadgeCheck /> {store.products} produtos monitorados</b><b><Clock3 /> Preços atualizados hoje</b><em>Catálogo verificado</em></div>
          </div>
          <div className="store-pro-place"><MapPin /> Feijó - AC</div>
          <div className="store-pro-notice"><Info /><span><strong>Catálogo informativo</strong><small>Este estabelecimento ainda não oferece vendas diretas pelo PreçoCerto.</small></span></div>
        </div>
      </section>

      <section className="store-pro-signals" aria-label="Informações do catálogo">
        <article><span><Clock3 /></span><div><strong>Monitoramento diário</strong><small>Preços organizados todos os dias</small></div></article>
        <article><span><ShieldCheck /></span><div><strong>Informações confiáveis</strong><small>Dados para ajudar você a comparar</small></div></article>
        <article><span><Heart /></span><div><strong>Feito para Feijó</strong><small>Projeto independente e local</small></div></article>
        <article><span><CalendarDays /></span><div><strong>Atualização recente</strong><small>Catálogo revisado hoje</small></div></article>
      </section>

      <section className="store-pro-catalog">
        <header><div><span>CATÁLOGO LOCAL</span><h2>Preços deste estabelecimento</h2></div><small>Compare antes de sair</small></header>
        <div className="ref-product-grid store-pro-grid">{products.map(product => <Link key={product.id} to={`/produto/${product.slug || product.id}`}>
          <div><ProductImage product={product} /></div>
          <small>{product.category}</small>
          <strong>{product.name}</strong>
          <span>{product.size || product.unit}</span>
          <footer><em>menor preço</em><b>{brl.format(product.minPrice)}</b></footer>
        </Link>)}</div>
      </section>

      <aside className="store-pro-bottom-note"><ShieldCheck /><strong>Catálogo informativo</strong><span>Consulte disponibilidade e condições diretamente com o estabelecimento enquanto a venda direta pelo PreçoCerto não estiver habilitada.</span><Link to="/fale-conosco">Saiba mais <ArrowRight /></Link></aside>
    </main>
  </div>;
}
