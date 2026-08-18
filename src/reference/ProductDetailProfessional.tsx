import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, CalendarDays, Heart,
  Home, Info, Layers3, MapPin, PackageSearch, Search, ShieldCheck,
  ShoppingBasket, Store, Tag,
} from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { supabase } from "../lib/supabase";
import "./ProductDetailProfessional.css";
import "./ProductDetailViewportFit.css";
import "./ProductDetailVisualRefinement.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const BASKET_KEY = "precocerto:active_basket_items";
const PENDING_BASKET_KEY = "pc:pending_basket_item";
type BasketEntry = { productId: string; quantity: number };

function cleanBrand(value?: string | null) {
  const brand = (value || "").trim();
  if (!brand || brand === "-" || brand === "—" || brand.toLocaleLowerCase("pt-BR") === "não identificada") return "Não informada";
  return brand;
}

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as BasketEntry[];
    return Array.isArray(parsed) ? parsed.filter(item => item?.productId && item.quantity > 0) : [];
  } catch { return []; }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (source && !failed) return <img className={className} src={source} alt={product.name} loading="eager" onError={() => setFailed(true)} />;
  return <div className={`pdp-image-fallback ${className}`} role="img" aria-label={`Imagem de ${product.name} em atualização`}><PackageSearch /><span>{product.category}<small>Imagem em atualização</small></span></div>;
}

function formatDate(value?: string) {
  if (!value) return "Atualizado recentemente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Atualizado recentemente";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function PriceHistory({ product }: { product: Product }) {
  const points = (product.price_history || []).filter(item => Number.isFinite(item.value)).slice(-7);
  if (!points.length) {
    return <div className="pdp-history-empty"><BarChart3 /><div><strong>Histórico em formação</strong><span>O gráfico aparecerá conforme novas verificações forem registradas.</span></div></div>;
  }
  const values = points.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(.01, max - min);
  const coords = points.map((item, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 82 - ((item.value - min) / spread) * 58;
    return `${x},${y}`;
  }).join(" ");
  return <div className="pdp-chart" aria-label="Histórico recente de preços">
    <svg viewBox="0 0 100 100" role="img" aria-label={`Preço atual ${brl.format(values[values.length - 1])}`} preserveAspectRatio="none">
      <line x1="0" y1="82" x2="100" y2="82" className="pdp-chart-grid" />
      <line x1="0" y1="53" x2="100" y2="53" className="pdp-chart-grid" />
      <line x1="0" y1="24" x2="100" y2="24" className="pdp-chart-grid" />
      <polyline points={coords} className="pdp-chart-line" />
      {points.map((item, index) => {
        const [x, y] = coords.split(" ")[index].split(",");
        return <circle key={`${item.date}-${index}`} cx={x} cy={y} r="1.8" className="pdp-chart-dot" />;
      })}
    </svg>
    <div className="pdp-chart-labels">{points.map(item => <span key={item.date}>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(item.date))}</span>)}</div>
  </div>;
}

export function ProductDetailProfessional() {
  const { identifier = "" } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<BasketEntry[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetchCatalog("", { force: true })
      .then(data => { if (active) setCatalog(data); })
      .finally(() => { if (active) setLoading(false); });
    setBasket(readBasket());
    const sync = () => setBasket(readBasket());
    window.addEventListener("pc:basket-changed", sync);
    return () => { active = false; window.removeEventListener("pc:basket-changed", sync); };
  }, []);

  const product = useMemo(() => catalog?.products.find(item => String(item.id) === identifier || item.slug === identifier), [catalog, identifier]);
  const offers = useMemo(() => product ? (product.offers?.length ? [...product.offers] : [{ establishmentId: product.establishmentId, establishmentSlug: product.establishmentSlug, establishment: product.establishment, neighborhood: product.neighborhood, storeColor: product.storeColor, value: product.minPrice, capturedAt: product.capturedAt }]).sort((a,b)=>a.value-b.value) : [], [product]);
  const similar = useMemo(() => !product || !catalog ? [] : catalog.products.filter(item => String(item.id) !== String(product.id) && item.category === product.category).sort((a,b) => a.minPrice - b.minPrice).slice(0, 3), [catalog, product]);
  const basketRows = useMemo(() => !catalog ? [] : basket.map(entry => ({ entry, product: catalog.products.find(item => String(item.id) === entry.productId) })).filter(row => row.product), [basket, catalog]);
  const basketTotal = basketRows.reduce((sum, row) => sum + (row.product?.minPrice || 0) * row.entry.quantity, 0);

  const addToBasket = async (target: Product) => {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session?.user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(PENDING_BASKET_KEY, JSON.stringify({ productId: String(target.id), returnTo, createdAt: Date.now() }));
      window.location.assign(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    const current = readBasket();
    const id = String(target.id);
    const existing = current.find(item => item.productId === id);
    const next = existing ? current.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { productId: id, quantity: 1 }];
    writeBasket(next);
    setBasket(next);
    setMessage("Produto adicionado à sua lista.");
    window.setTimeout(() => setMessage(""), 2200);
  };

  if (loading) return <main className="pdp-state"><span className="pdp-loader" /><h1>Carregando produto…</h1></main>;
  if (!product) return <main className="pdp-state"><PackageSearch /><h1>Produto não encontrado</h1><Link to="/buscar">Voltar para a busca</Link></main>;

  const favorite = isFavorite(product.id);
  const image = resolveProductImage(product);
  const quantity = basket.find(item => item.productId === String(product.id))?.quantity || 0;
  const updatedAt = formatDate(product.updated_at || product.capturedAt);
  const productBrand = cleanBrand(product.brand);

  return <div className="pdp-page">
    <header className="pdp-topbar"><Link to="/buscar" className="pdp-back"><ArrowLeft /> <span>Voltar</span></Link><Link className="pdp-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /></Link><nav aria-label="Ações"><Link to="/buscar" aria-label="Buscar"><Search /></Link><Link to="/favoritos" aria-label="Favoritos"><Heart /></Link><Link to="/cesta-basica" className="pdp-bag" aria-label="Lista de compras"><ShoppingBasket />{basket.length > 0 && <b>{basket.reduce((sum,item)=>sum+item.quantity,0)}</b>}</Link></nav></header>

    <main id="conteudo-principal" className="pdp-shell">
      <nav className="pdp-breadcrumb" aria-label="Caminho"><Link to="/"><Home /></Link><ArrowRight /><Link to={`/buscar?q=${encodeURIComponent(product.category)}`}>{product.category}</Link><ArrowRight /><span>{product.name}</span></nav>

      <section className="pdp-hero">
        <div className="pdp-gallery">
          <div className="pdp-main-image"><span>{product.category}</span><ProductImage product={product} /></div>
          <div className="pdp-thumbs">{image ? <button type="button" className="is-active" aria-label="Imagem principal"><img src={image} alt="" /></button> : <button type="button" className="is-active" aria-label="Imagem em atualização"><PackageSearch /></button>}<small>{image ? "Imagem do produto" : "Imagem em atualização"}</small></div>
        </div>

        <section className="pdp-primary">
          <span className="pdp-eyebrow">{product.category}</span><h1>{product.name}</h1><p className="pdp-unit"><strong>Marca: {productBrand}</strong>{product.size || product.unit ? ` · ${product.size || product.unit}` : ""}</p><p className="pdp-updated"><CalendarDays /> Última atualização: <strong>{updatedAt}</strong></p>
          <div className="pdp-price-card"><span>PREÇO VERIFICADO <BadgeCheck /></span><strong>{brl.format(product.minPrice)}</strong><small>{offers.length} {offers.length === 1 ? "loja consultada" : "lojas comparadas"}{offers.length === 1 ? " · comparação ainda indisponível" : product.maxPrice > product.minPrice ? ` · diferença de ${brl.format(product.maxPrice - product.minPrice)}` : " · mesmo preço encontrado"}</small></div>
          <div className="pdp-actions"><button type="button" className={favorite ? "is-active" : ""} onClick={() => void toggleFavorite(product.id)}><Heart fill={favorite ? "currentColor" : "none"} />{favorite ? "Favoritado" : "Favoritar"}</button><button type="button" className="pdp-add" onClick={() => void addToBasket(product)}><ShoppingBasket />{quantity ? `Adicionar mais um (${quantity})` : "Adicionar à lista"}</button></div>
          <section className="pdp-where"><header><div><span>ONDE ENCONTRAR</span><h2>{offers.length > 1 ? "Compare em Feijó" : "Mais barato em Feijó"}</h2></div><Link to="/estabelecimentos"><MapPin /> Ver no mapa</Link></header><div>{offers.slice(0,3).map((offer,index)=><Link className={index === 0 ? "is-best" : ""} to={`/estabelecimento/${offer.establishmentSlug || offer.establishmentId}`} key={`${offer.establishmentId}-${offer.value}`}><b>{index+1}</b><span><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó"} · atualizado hoje</small></span>{index===0&&<em>MENOR PREÇO</em>}<strong>{brl.format(offer.value)}</strong><ArrowRight /></Link>)}</div><Link className="pdp-history-link" to={`/buscar?q=${encodeURIComponent(product.name)}`}><BarChart3 /> Ver histórico de preços e produtos similares <ArrowRight /></Link></section>
        </section>

        <aside className="pdp-meta">
          <div><Layers3 /><span><small>Categoria</small><strong>{product.category}</strong></span></div>
          <div><Tag /><span><small>Marca</small><strong>{productBrand}</strong></span></div>
          <div><Store /><span><small>Unidade / tamanho</small><strong>{product.size || product.unit || "un"}</strong></span></div>
          <div><CalendarDays /><span><small>Preço verificado em</small><strong>{updatedAt}</strong></span></div>
          <div><BadgeCheck /><span><small>Atualizado por</small><strong>PreçoCerto</strong></span></div>
          <footer><ShieldCheck /><span><strong>Informação confiável</strong><small>Preços coletados e organizados para ajudar você a economizar.</small></span></footer>
        </aside>
      </section>

      <section className="pdp-lower-grid">
        <article className="pdp-panel pdp-history-panel"><header><h2>Histórico de preços</h2><span>últimos registros</span></header><PriceHistory product={product} /></article>
        <article className="pdp-panel pdp-similar"><header><h2>Produtos similares</h2></header>{similar.length ? <div>{similar.map(item => <Link to={`/produto/${item.slug || item.id}`} key={item.id}><ProductImage product={item} /><span><strong>{item.name}</strong><small>{cleanBrand(item.brand)} · {item.size || item.unit}</small><b>{brl.format(item.minPrice)}</b><em>{item.establishment}</em></span><button type="button" aria-label={`Adicionar ${item.name} à lista`} onClick={event => { event.preventDefault(); event.stopPropagation(); void addToBasket(item); }}><ShoppingBasket /></button></Link>)}</div> : <p>Nenhum produto similar disponível nesta categoria.</p>}</article>
        <aside className="pdp-panel pdp-basket"><header><h2>Sua lista de compras</h2><span>{basket.reduce((sum,item)=>sum+item.quantity,0)} itens</span></header>{basketRows.slice(0,3).map(({entry,product:item}) => item && <div className="pdp-basket-row" key={entry.productId}><span>{item.name} · {cleanBrand(item.brand)}</span><strong>{brl.format(item.minPrice * entry.quantity)}</strong></div>)}{!basketRows.length && <p>Sua lista ainda está vazia.</p>}<footer><span>Total estimado</span><strong>{brl.format(basketTotal)}</strong></footer><Link to="/cesta-basica">Ver lista completa</Link></aside>
      </section>

      <aside className="pdp-catalog-note"><Info /><strong>Catálogo informativo</strong><span>Consulte disponibilidade e condições diretamente com o estabelecimento quando a venda direta pelo PreçoCerto ainda não estiver habilitada.</span></aside>
    </main>
    {message && <div className="pdp-toast" role="status" aria-live="polite">{message}</div>}
  </div>;
}
