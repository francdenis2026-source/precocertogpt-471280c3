import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, BadgeCheck, BarChart3, CalendarDays, CheckCircle2,
  ChevronRight, Factory, Heart, Home, Info, Layers3, MapPin, Package,
  PackageSearch, PiggyBank, ShieldCheck, ShoppingBasket, Store, Tag, TrendingDown,
} from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { CatalogPayload, Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { supabase } from "../lib/supabase";
import { buildComparableOffers, findComparableProducts, type ComparableOffer } from "../lib/productSearch";
import { PublicFooter, PublicHeader } from "./ReferenceExperience";
import "./ProductDetailUltimate2026.css";

gsap.registerPlugin(ScrollTrigger);
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const round2 = (value: number) => Math.round(value * 100) / 100;
const BASKET_KEY = "precocerto:active_basket_items";
const PENDING_BASKET_KEY = "pc:pending_basket_item";
type BasketEntry = { productId: string; quantity: number };
type ProductExtra = { manufacturer: string; barcode: string };

function cleanValue(value?: string | null, fallback = "Não informado") {
  const text = (value || "").trim();
  if (!text || text === "-" || text === "—" || text.toLocaleLowerCase("pt-BR") === "não identificada") return fallback;
  return text;
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

function ProductImage({ product, compact = false }: { product: Product; compact?: boolean }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (source && !failed) return <img className={compact ? "pdx-image pdx-image--compact" : "pdx-image"} src={source} alt={product.name} width="400" height="400" loading={compact ? "lazy" : "eager"} onError={() => setFailed(true)} />;
  return <div className={compact ? "pdx-image-fallback pdx-image-fallback--compact" : "pdx-image-fallback"} role="img" aria-label={`Imagem de ${product.name} em atualização`}><PackageSearch /><span>Imagem em atualização</span></div>;
}

function formatDate(value?: string) {
  if (!value) return "Atualizado recentemente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Atualizado recentemente";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function PriceComparisonChart({ offers }: { offers: ComparableOffer[] }) {
  const points = offers.filter(item => Number.isFinite(item.value) && item.value > 0).slice(0, 8);
  if (points.length < 2) return <div className="pdx-history-empty"><BarChart3 /><div><strong>Comparação em formação</strong><span>Mais preços serão necessários para montar o panorama entre estabelecimentos.</span></div></div>;
  const values = points.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return <div className="pdx-chart" role="img" aria-label={`Comparação de ${points.length} preços, de ${brl.format(min)} a ${brl.format(max)}`}>
    <div className="pdx-chart-stats"><span><small>Melhor preço</small><strong>{brl.format(min)}</strong></span><span><small>Preço médio</small><strong>{brl.format(average)}</strong></span><span><small>Diferença real</small><strong>{brl.format(max - min)}</strong></span></div>
    <div className="pdx-chart-bars">{points.map((offer, index) => <div className={`pdx-chart-row${index === 0 ? " is-best" : ""}`} key={`${offer.establishmentId}-${offer.productId}`}><div><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó"}</small></div><span><i style={{ width: `${Math.max(8, (offer.value / max) * 100)}%` }} /></span><b>{brl.format(offer.value)}</b></div>)}</div>
  </div>;
}

export function ProductDetailProfessional() {
  const { identifier = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<BasketEntry[]>([]);
  const [message, setMessage] = useState("");
  const [extra, setExtra] = useState<ProductExtra>({ manufacturer: "", barcode: "" });
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    // Reaproveita o catálogo em cache (mesma razão da página de
    // estabelecimento): evita refazer a consulta completa ao banco toda vez
    // que o usuário abre um produto, o que deixava a página lenta.
    fetchCatalog().then(data => { if (active) setCatalog(data); }).finally(() => { if (active) setLoading(false); });
    setBasket(readBasket());
    const sync = () => setBasket(readBasket());
    window.addEventListener("pc:basket-changed", sync);
    return () => { active = false; window.removeEventListener("pc:basket-changed", sync); };
  }, []);

  const product = useMemo(() => catalog?.products.find(item => String(item.id) === identifier || item.slug === identifier), [catalog, identifier]);

  useEffect(() => {
    if (!product?.slug || !identifier || identifier === product.slug) return;
    navigate(`/produto/${product.slug}`, { replace: true });
  }, [identifier, navigate, product?.slug]);

  useEffect(() => {
    if (!product || !supabase) return;
    let active = true;
    void supabase.from("products").select("manufacturer, barcode").eq("id", String(product.id)).maybeSingle().then(({ data, error }) => {
      if (!active || error || !data) return;
      setExtra({ manufacturer: cleanValue((data as { manufacturer?: string | null }).manufacturer, ""), barcode: cleanValue((data as { barcode?: string | null }).barcode, "") });
    });
    return () => { active = false; };
  }, [product]);

  const offers = useMemo(() => product ? (product.offers?.length ? [...product.offers] : [{ establishmentId: product.establishmentId, establishmentSlug: product.establishmentSlug, establishment: product.establishment, neighborhood: product.neighborhood, storeColor: product.storeColor, value: product.minPrice, capturedAt: product.capturedAt }]).sort((a,b)=>a.value-b.value) : [], [product]);
  const comparisonOffers = useMemo(() => !product || !catalog ? [] : buildComparableOffers(catalog.products, product), [catalog, product]);
  const quickOffers = useMemo(() => {
    const cheapestByStore = new Map<string, ComparableOffer>();
    comparisonOffers.forEach(offer => {
      if (!Number.isFinite(offer.value) || offer.value <= 0) return;
      const key = String(offer.establishmentId || offer.establishment);
      const current = cheapestByStore.get(key);
      if (!current || offer.value < current.value) cheapestByStore.set(key, offer);
    });
    return Array.from(cheapestByStore.values()).sort((a, b) => a.value - b.value).slice(0, 6);
  }, [comparisonOffers]);
  const similar = useMemo(() => !product || !catalog ? [] : findComparableProducts(catalog.products, product, 4), [catalog, product]);
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
    writeBasket(next); setBasket(next); setMessage("Produto adicionado à sua lista."); window.setTimeout(() => setMessage(""), 2200);
  };

  useGSAP(() => {
    if (loading || !product || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".pdx-breadcrumb, .pdx-identity > *, .pdx-price-block", { y: 14, opacity: 0, duration: .55, stagger: .05, ease: "power3.out" });
    gsap.from(".pdx-visual", { opacity: 0, duration: .5, delay: .1, ease: "power2.out" });
    gsap.utils.toArray<HTMLElement>(".pdx-commerce-grid > .pdx-card, .pdx-secondary-grid > .pdx-card, .pdx-tech-details").forEach((card, index) => {
      gsap.from(card, { scrollTrigger: { trigger: card, start: "top 88%", once: true }, y: 20, opacity: 0, duration: .5, delay: index * .03, ease: "power2.out" });
    });
  }, { scope: pageRef, dependencies: [loading, product] });

  // Mesmo tratamento de esqueleto da página de estabelecimento: um fundo com
  // a identidade visual da marca e a "forma" da página real (imagem, título,
  // ofertas), em vez de tela em branco com spinner.
  if (loading) return (
    <main className="pdx-skeleton" role="status" aria-live="polite">
      <span className="pdx-skeleton__sr">Carregando produto…</span>
      <div className="pdx-skeleton__grid">
        <span className="pdx-skeleton__image" />
        <div className="pdx-skeleton__core">
          <span className="pdx-skeleton__bar pdx-skeleton__bar--kicker" />
          <span className="pdx-skeleton__bar pdx-skeleton__bar--title" />
          <span className="pdx-skeleton__bar pdx-skeleton__bar--text" />
          <span className="pdx-skeleton__panel" />
        </div>
        <div className="pdx-skeleton__side">
          <span className="pdx-skeleton__panel" />
          <span className="pdx-skeleton__panel" />
        </div>
      </div>
    </main>
  );
  if (!product) return <main className="pdx-state"><PackageSearch/><h1>Produto não encontrado</h1><p>Este item pode ter sido atualizado ou removido.</p><Link to="/buscar">Voltar para a busca</Link></main>;

  const favorite = isFavorite(product.id);
  const brand = cleanValue(product.brand);
  const manufacturer = cleanValue(extra.manufacturer);
  const barcode = cleanValue(extra.barcode || product.barcode);
  const bestOffer = offers[0];
  // Loja de origem deste produto: quando só há uma oferta (caso da Kelly
  // Burgueria, do Ponto do Sanduba e da maioria dos estabelecimentos com
  // cardápio próprio), é sempre essa loja. Com várias ofertas (comparação
  // de preço entre supermercados), usamos a de menor preço, já destacada
  // como principal no bloco de preço acima — não é ambíguo, é a mesma loja
  // que o restante da página já trata como "a oferta".
  const homeStore = offers.length === 1 ? offers[0] : bestOffer;
  const homeStoreHref = homeStore ? `/estabelecimento/${homeStore.establishmentSlug || homeStore.establishmentId}` : "/estabelecimentos";
  // O preço principal precisa vir da mesma coleção que alimenta o ranking.
  // Antes ele usava `product.minPrice`, isto é, o preço do cadastro aberto,
  // mesmo quando a comparação já havia encontrado um equivalente mais barato.
  const selectedEstablishment = searchParams.get("oferta");
  const selectedOffer = selectedEstablishment
    ? comparisonOffers.find(offer => String(offer.establishmentId) === selectedEstablishment)
    : undefined;
  const displayedOffer = selectedOffer || comparisonOffers[0];
  const displayedProduct = displayedOffer && catalog?.products.find(item => String(item.id) === String(displayedOffer.productId));
  const displayedPrice = displayedOffer?.value ?? product.minPrice;
  const displayedStore = displayedOffer?.establishment ?? bestOffer?.establishment;
  const displayedUpdatedAt = formatDate(displayedOffer?.capturedAt || product.updated_at || product.capturedAt);
  const basketTarget = displayedProduct || product;
  const basketTargetQuantity = basket.find(item => item.productId === String(basketTarget.id))?.quantity || 0;
  const priceSpread = quickOffers.length > 1 ? Math.max(0, round2(quickOffers[quickOffers.length - 1].value - quickOffers[0].value)) : 0;
  const isSingleOffer = comparisonOffers.length <= 1;
  const previousPrice = Number(displayedOffer?.previousPrice || displayedProduct?.previousPrice || 0);
  const savingVsPrevious = previousPrice > displayedPrice ? previousPrice - displayedPrice : 0;

  return <div className="pdx-page" ref={pageRef}>
    <PublicHeader/>

    <main id="conteudo-principal" className="pdx-shell">
      <nav className="pdx-breadcrumb" aria-label="Navegação estrutural"><Link to="/"><Home/><span>Início</span></Link><ChevronRight/>{homeStore && <><Link className="pdx-breadcrumb__store" to={homeStoreHref}>{homeStore.establishment}</Link><ChevronRight className="pdx-breadcrumb__store"/></>}<Link to={`/buscar?q=${encodeURIComponent(product.category)}`}>{product.category}</Link><ChevronRight/><span>{product.name}</span></nav>

      <section className={`pdx-product${isSingleOffer ? " pdx-product--single" : ""}`} aria-labelledby="pdx-title">
        <div className="pdx-visual">
          <div className="pdx-image-stage"><span className="pdx-category-badge">{product.category}</span><ProductImage product={product}/></div>
          <div className="pdx-visual-note"><ShieldCheck/><span><strong>Imagem informativa</strong><small>O produto e a embalagem podem sofrer atualização pelo fabricante.</small></span></div>
        </div>

        <div className="pdx-core">
          <div className="pdx-identity"><span className="pdx-brand-pill"><Tag/> {brand}</span><h1 id="pdx-title">{product.name}</h1><p>{product.size || product.unit || "Embalagem não informada"}</p></div>

          <div className="pdx-price-block">
            <div><span>{isSingleOffer ? "PREÇO REGISTRADO" : selectedOffer ? "OFERTA SELECIONADA" : "MENOR PREÇO EQUIVALENTE"} <BadgeCheck/></span><strong>{brl.format(displayedPrice)}</strong><small>{displayedStore ? `em ${displayedStore}` : "preço verificado"}{!isSingleOffer && displayedOffer ? ` · ${displayedOffer.productBrand || "marca não informada"} · ${displayedOffer.productSize || "medida compatível"}` : ""}</small></div>
            <div className={`pdx-price-facts${isSingleOffer ? " pdx-price-facts--compact" : ""}`}>
              <span><Store/><b>{quickOffers.length}</b><small>{isSingleOffer ? "loja consultada" : "lojas exibidas"}</small></span>
              {!isSingleOffer && <span><PiggyBank/><b>{brl.format(priceSpread)}</b><small>economia possível</small></span>}
              <span><CalendarDays/><b>{displayedUpdatedAt}</b><small>última verificação</small></span>
            </div>
            {!isSingleOffer && priceSpread > 0 && <div className="pdx-price-saving"><PiggyBank/> Você pode economizar até {brl.format(priceSpread)} escolhendo {quickOffers[0]?.establishment || "a oferta mais barata"} em vez da opção mais cara.</div>}
            {savingVsPrevious > 0 && <div className="pdx-price-saving"><TrendingDown/> Está {brl.format(savingVsPrevious)} abaixo do último preço registrado.</div>}
          </div>

          <div className="pdx-actions"><button type="button" className={favorite ? "is-active" : ""} onClick={() => void toggleFavorite(product.id)}><Heart fill={favorite ? "currentColor" : "none"}/>{favorite ? "Salvo nos favoritos" : "Salvar nos favoritos"}</button><button type="button" className="pdx-primary-action pc-btn pc-btn--primary" onClick={() => void addToBasket(basketTarget)}><ShoppingBasket/>{basketTargetQuantity ? `Adicionar mais um · ${basketTargetQuantity} na lista` : "Adicionar melhor oferta à lista"}</button></div>

          <div className="pdx-trust"><CheckCircle2/><span><strong>Preço organizado pelo PreçoCerto</strong><small>Use como referência e confirme disponibilidade diretamente com o estabelecimento.</small></span></div>
        </div>

        {!isSingleOffer && <aside className="pdx-quick-compare" aria-label="Comparação rápida de preços">
          <header><span>COMPARAÇÃO RÁPIDA</span><h2>Preços equivalentes</h2><p>{quickOffers.length > 1 ? `${quickOffers.length} melhores ofertas exibidas · mesma família e medida compatível.` : "Preço disponível em um estabelecimento."}</p></header>
          <div className="pdx-quick-compare__list">
            {quickOffers.map((offer, index) => {
              const active = String(displayedOffer?.productId) === String(offer.productId) && String(displayedOffer?.establishmentId) === String(offer.establishmentId);
              const target = `/produto/${offer.productSlug || offer.productId}?oferta=${encodeURIComponent(String(offer.establishmentId))}`;
              return <Link to={target} key={`${offer.establishmentId}-${offer.productId}-${offer.value}`} className={`${index === 0 ? "is-best" : ""}${active ? " is-active" : ""}`} aria-current={active ? "true" : undefined}>
                <span className="pdx-quick-compare__mark">{index === 0 ? <BadgeCheck aria-hidden="true" /> : <Store aria-hidden="true" />}</span>
                <span className="pdx-quick-compare__store"><strong>{offer.establishment}</strong><small>{offer.productBrand || "Marca não informada"} · {offer.productSize || "medida equivalente"}</small></span>
                <span className="pdx-quick-compare__price"><strong>{brl.format(offer.value)}</strong><small>{offer.neighborhood || "Feijó"}</small></span>
                <ChevronRight aria-hidden="true" />
              </Link>;
            })}
          </div>
          {comparisonOffers.length > 1 && <div className="pdx-quick-compare__saving"><PiggyBank aria-hidden="true" /><span><small>ECONOMIA POSSÍVEL</small><strong>{brl.format(priceSpread)}</strong></span></div>}
        </aside>}
      </section>

      {(isSingleOffer || quickOffers.length > 1) && <section className="pdx-commerce-grid">
        {isSingleOffer && <article className="pdx-card pdx-offers pdx-offers--full" aria-labelledby="offers-title">
          <header><div><span>ONDE COMPRAR</span><h2 id="offers-title">Onde encontrar este produto</h2><p>Preço confirmado neste estabelecimento.</p></div><Link to="/estabelecimentos"><MapPin/>Ver estabelecimentos</Link></header>
          <div className="pdx-offer-list">{comparisonOffers.map(offer=><Link to={`/estabelecimento/${offer.establishmentSlug || offer.establishmentId}`} key={`${offer.establishmentId}-${offer.productId}-${offer.value}`}><span className="pdx-rank"><Store aria-hidden="true"/></span><span className="pdx-store-info"><strong>{offer.establishment}</strong><small><MapPin/>{offer.neighborhood || "Feijó"}</small></span><span className="pdx-offer-price"><strong>{brl.format(offer.value)}</strong><small>{formatDate(offer.capturedAt)}</small></span><ArrowRight/></Link>)}</div>
        </article>}

        {!isSingleOffer && <article className="pdx-card pdx-history-card pdx-offers--full"><header><div><span>PANORAMA DE PREÇOS</span><h2>Comparação por estabelecimento</h2><p>Valores atuais das ofertas exibidas, ordenados do menor para o maior.</p></div><Link to={`/buscar?q=${encodeURIComponent(product.name)}`}>Ver similares <ArrowRight/></Link></header><PriceComparisonChart offers={quickOffers}/></article>}
      </section>}

      <details className="pdx-tech-details">
        <summary><span><Info aria-hidden="true" /><span><small>FICHA DO PRODUTO</small><strong>Marca, fabricante e identificação</strong></span></span><ChevronRight aria-hidden="true" /></summary>
        <dl>
          <div><dt><Tag/>Marca</dt><dd>{brand}</dd></div>
          <div><dt><Factory/>Fabricante</dt><dd>{manufacturer}</dd></div>
          <div><dt><Layers3/>Categoria</dt><dd>{product.category}</dd></div>
          <div><dt><Package/>Embalagem</dt><dd>{product.size || product.unit || "Não informada"}</dd></div>
          <div><dt><BadgeCheck/>Código de barras</dt><dd>{barcode}</dd></div>
        </dl>
      </details>

      <section className="pdx-secondary-grid">
        <article className="pdx-card pdx-similar"><header><div><span>ALTERNATIVAS</span><h2>Produtos similares</h2></div></header>{similar.length ? <div className="pdx-similar-grid">{similar.map(item => <Link to={`/produto/${item.slug || item.id}`} key={item.id}><div className="pdx-similar-image"><ProductImage product={item} compact/></div><span className="pdx-similar-copy"><small>{cleanValue(item.brand)} · {item.size || item.unit}</small><strong>{item.name}</strong><em>{item.establishment}</em></span><b>{brl.format(item.minPrice)}</b></Link>)}</div> : <p className="pdx-empty-copy">Nenhum produto similar disponível nesta categoria.</p>}</article>

        <aside className="pdx-card pdx-list-card"><header><div><span>SUA LISTA</span><h2>Lista de compras</h2></div><b>{basket.reduce((sum,item)=>sum+item.quantity,0)} itens</b></header>{basketRows.length ? <div className="pdx-list-preview">{basketRows.slice(0,3).map(({entry,product:item}) => item && <div key={entry.productId}><span>{entry.quantity}×</span><p><strong>{item.name}</strong><small>{cleanValue(item.brand)}</small></p><b>{brl.format(item.minPrice*entry.quantity)}</b></div>)}</div> : <div className="pdx-list-empty"><ShoppingBasket/><span>Sua lista ainda está vazia.</span></div>}<footer><span>Total estimado</span><strong>{brl.format(basketTotal)}</strong></footer><Link to="/cesta-basica">Abrir lista completa <ArrowRight/></Link></aside>
      </section>

      <aside className="pdx-disclaimer"><Info/><div><strong>Catálogo informativo</strong><span>Preços e disponibilidade podem mudar. O PreçoCerto organiza as informações para facilitar sua comparação; a confirmação final deve ser feita com o estabelecimento.</span></div></aside>
    </main>



    <PublicFooter/>
    <div className="pdx-mobile-bar"><div><small>{isSingleOffer ? "Preço registrado" : "Menor equivalente"}</small><strong>{brl.format(displayedPrice)}</strong></div><button type="button" className="pc-btn pc-btn--primary" onClick={() => void addToBasket(basketTarget)}><ShoppingBasket/>{basketTargetQuantity ? `Adicionar (${basketTargetQuantity})` : "Adicionar à lista"}</button></div>
    {message && <div className="pdx-toast" role="status" aria-live="polite">{message}</div>}
  </div>;
}
