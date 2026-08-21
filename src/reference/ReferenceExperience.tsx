import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Building2,
  Check, Code2, Eye, Heart, Info, LayoutDashboard, LockKeyhole, Mail, Map as MapIcon,
  MapPin, Menu, MessageCircle, Moon, PackageSearch, Plus, Search, ShieldCheck, ShoppingBag, ShoppingBasket,
  SlidersHorizontal, Store, Sun, Tag, TrendingDown, UserRound, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { getStoreLogoUrl } from "../data/storeLogos";
import { loadSessionProfile, requestPasswordReset, signIn, signUp } from "../lib/roles";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { OnlinePresence } from "../components/OnlinePresence";
import { SectorNavigator, getMarketplaceSector } from "./MarketplaceSectors";
import "./ReferenceExperience.css";
import "./ReferencePages.css";
import "./ReferencePagesMore.css";
import "./ReferenceResponsive.css";
import "./CompactShell.css";
import "./TypographyScale.css";
import "./HomeStoryRefinement.css";
import "./InteractionPolish.css";
import "./DarkThemeRefinement.css";
import "./ProductCardRefinement.css";
import "./SearchResultsRefinement.css";
import "./MobileAppRefinement.css";
import "./ProductComparisonRefinement.css";
import "./HomepageCompactDensity.css";
import "./Chrome2026.css";
import "./HomeSmartBasket.css";
import "./Home2026.css";
import "./Stores2026.css";
import "./StoreExperienceAcai2026.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function useCatalogState() {
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then(value => { if (active) setCatalog(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { catalog, loading };
}

function useCatalog() { return useCatalogState().catalog; }

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className="ref-brand" to="/" aria-label="PreçoCerto — início">
    {inverse
      ? <img className="ref-brand__inverse" src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" />
      : <><img className="ref-brand__light" src="/logo-preco-certo.svg" alt="PreçoCerto" /><img className="ref-brand__dark" src="/logo-preco-certo-inversa.svg" alt="" aria-hidden="true" /></>}
    <span>FEIJÓ · ACRE</span>
  </Link>;
}

export type FooterPanel = "contato" | "desenvolvedor" | null;

export function FooterInfoDialogs({ open, onClose }: { open: FooterPanel; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="pc-dev-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      {open === "contato"
        ? <section className="pc-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-contact-title">
            <button className="pc-dev-close" type="button" aria-label="Fechar contato" onClick={onClose}><X /></button>
            <span className="pc-contact-icon"><Mail aria-hidden="true" /></span>
            <div className="pc-contact-copy"><small>CANAL OFICIAL</small><h2 id="pc-contact-title">Fale com o PreçoCerto</h2><p>Dúvidas, sugestões, parcerias, informações sobre lojas virtuais ou suporte à plataforma.</p></div>
            <a className="pc-contact-email" href="mailto:precocerto-fj@proton.me"><Mail /> <span><small>E-mail</small><strong>precocerto-fj@proton.me</strong></span></a>
            <p className="pc-contact-note"><ShieldCheck /> Utilize este endereço para contatos relacionados ao PreçoCerto.</p>
          </section>
        : <section className="pc-dev-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dev-title" aria-describedby="pc-dev-description">
            <button className="pc-dev-close" type="button" aria-label="Fechar informações" onClick={onClose}><X /></button>
            <header className="pc-dev-header">
              <span className="pc-dev-avatar"><Store aria-hidden="true" /></span>
              <div><small>PREÇOCERTO · MARKETPLACE LOCAL</small><h2 id="pc-dev-title">Comércio local em uma plataforma própria.</h2><p>Catálogo, lojas virtuais, gestão de vendas e comparação de preços em um só ecossistema.</p></div>
            </header>
            <p id="pc-dev-description" className="pc-dev-intro">Criado em Feijó-AC, o PreçoCerto aproxima consumidores e negócios locais em um marketplace com comparação de preços, lojas virtuais e gestão de vendas.</p>
            <div className="pc-dev-grid">
              <article><ShoppingBag /><div><strong>Marketplace local</strong><p>Descoberta, catálogo e comparação em uma só vitrine.</p></div></article>
              <article><Building2 /><div><strong>Loja virtual própria</strong><p>Produtos, ofertas e vendas gerenciados pelo comerciante.</p></div></article>
              <article><ShieldCheck /><div><strong>Clareza ao consumidor</strong><p>Catálogos informativos e vendas são identificados com precisão.</p></div></article>
              <article><Info /><div><strong>Decisão bem informada</strong><p>Preços e lojas organizados para uma comparação simples.</p></div></article>
              <article><Code2 /><div><strong>Tecnologia moderna</strong><p>React, TypeScript, Vite e Supabase em uma experiência responsiva.</p></div></article>
              <article><Heart /><div><strong>Feito em Feijó</strong><p>Tecnologia local para fortalecer negócios e consumidores.</p></div></article>
            </div>
            <div className="pc-dev-signature"><span><UserRound /> Desenvolvimento e idealização</span><strong>Franc D’nis</strong><small>Assinatura técnica do projeto</small></div>
            <footer className="pc-dev-footer"><span><MapPin /> Feijó · Acre · Brasil</span><button type="button" onClick={() => onClose()}><MessageCircle /> Fechar</button></footer>
          </section>}
    </div>,
    document.body,
  );
}

function StoreLogo({ name }: { name: string }) {
  const source = getStoreLogoUrl(name);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  return source && !failed
    ? <img src={source} alt={`Logomarca de ${name}`} loading="lazy" onError={() => setFailed(true)} />
    : <Store aria-hidden="true" />;
}

function ProductVisual({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  return source && !failed
    ? <img src={source} alt={product.name} width="280" height="240" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
    : <span className="ref-product-fallback" role="img" aria-label={`Imagem de ${product.name} em atualização`}><span className="ref-product-fallback__mark"><PackageSearch aria-hidden="true" /></span><small>{product.category || "Produto local"}<em>Imagem em atualização</em></small></span>;
}

type BasketEntry = { productId: string; quantity: number };
const BASKET_KEY = "precocerto:active_basket_items";

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as Array<Partial<BasketEntry> & { id?: string | number }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({ productId: String(item.productId ?? item.id ?? ""), quantity: Math.max(1, Number(item.quantity || 1)) })).filter(item => item.productId);
  } catch { return []; }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function useBasket() {
  const [items, setItems] = useState<BasketEntry[]>(readBasket);
  useEffect(() => {
    const refresh = () => setItems(readBasket());
    window.addEventListener("storage", refresh);
    window.addEventListener("pc:basket-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("pc:basket-changed", refresh); };
  }, []);
  const update = (productId: string | number, delta: number) => {
    const id = String(productId);
    const current = readBasket();
    const found = current.find(item => item.productId === id);
    const next = found
      ? current.map(item => item.productId === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)
      : delta > 0 ? [...current, { productId: id, quantity: delta }] : current;
    writeBasket(next);
  };
  return { items, update, count: items.reduce((sum, item) => sum + item.quantity, 0) };
}

function ThemeButton() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  };
  return <button className="ref-theme" type="button" onClick={toggle} aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}>{dark ? <Sun /> : <Moon />}</button>;
}

export function PublicHeader({ current }: { current?: "home" | "search" | "basket" | "stores" | "profile" }) {
  const [menu, setMenu] = useState(false);
  const { count } = useBasket();
  useEffect(() => { setMenu(false); }, [current]);
  return <header className="ref-header">
    <div className="ref-shell ref-header__inner">
      <Brand />
      <nav className="ref-nav" aria-label="Navegação principal">
        <Link className={current === "search" ? "is-active" : ""} to="/buscar">Buscar</Link>
        <Link className={current === "stores" ? "is-active" : ""} to="/estabelecimentos">Lojas</Link>
        <Link className={current === "basket" ? "is-active" : ""} to="/cesta-basica">Lista {count > 0 && <b>{count}</b>}</Link>
      </nav>
      <div className="ref-header__utility">
        <span className="ref-location"><MapPin aria-hidden="true" /><span><small>Você está em</small><strong>Feijó, AC</strong></span></span>
        {current === "home" && <OnlinePresence />}
      </div>
      <div className="ref-header__actions">
        <ThemeButton />
        <Link className="ref-favorites-link" to="/favoritos" aria-label="Favoritos"><Heart /></Link>
        <Link className="ref-signin" to="/login">Entrar</Link>
        <button type="button" className="ref-menu" aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} onClick={() => setMenu(value => !value)}>{menu ? <X /> : <Menu />}</button>
      </div>
    </div>
    {menu && <nav className="ref-mobile-menu" aria-label="Menu">
      <Link to="/explorar" onClick={() => setMenu(false)}><SlidersHorizontal aria-hidden="true" /> Explorar setores</Link>
      <Link to="/buscar" onClick={() => setMenu(false)}><Search aria-hidden="true" /> Buscar no PreçoCerto</Link>
      <Link to="/estabelecimentos" onClick={() => setMenu(false)}><Store aria-hidden="true" /> Estabelecimentos</Link>
      <Link to="/cesta-basica" onClick={() => setMenu(false)}><ShoppingBasket aria-hidden="true" /> Lista de compras</Link>
      <Link to="/favoritos" onClick={() => setMenu(false)}><Heart aria-hidden="true" /> Meus favoritos</Link>
      <Link to="/lojista" onClick={() => setMenu(false)}><Building2 aria-hidden="true" /> Para negócios</Link>
      <div className="ref-mobile-menu__footer"><ThemeButton /><span>Alterar tema</span></div>
    </nav>}
  </header>;
}

export function AppDock({ current }: { current: "home" | "search" | "basket" | "stores" | "profile" }) {
  return <nav className="ref-dock" aria-label="Navegação principal do aplicativo">
    <Link className={current === "home" ? "is-active" : ""} to="/" aria-current={current === "home" ? "page" : undefined}><LayoutDashboard aria-hidden="true" /><span>Início</span></Link>
    <Link className={current === "search" ? "is-active" : ""} to="/buscar" aria-current={current === "search" ? "page" : undefined}><Search aria-hidden="true" /><span>Buscar</span></Link>
    <Link className={current === "basket" ? "is-active" : ""} to="/cesta-basica" aria-current={current === "basket" ? "page" : undefined}><ShoppingBasket aria-hidden="true" /><span>Cesta</span></Link>
    <Link className={current === "stores" ? "is-active" : ""} to="/estabelecimentos" aria-current={current === "stores" ? "page" : undefined}><Store aria-hidden="true" /><span>Lojas</span></Link>
    <Link className={current === "profile" ? "is-active" : ""} to="/favoritos" aria-current={current === "profile" ? "page" : undefined}><Heart aria-hidden="true" /><span>Favoritos</span></Link>
  </nav>;
}
export function ReferenceStoresPage() {
  const catalog = useCatalog(); const [params] = useSearchParams(); const activeDirectorySector = getMarketplaceSector(params.get("setor")); const [query, setQuery] = useState(""); const [mapStore, setMapStore] = useState(""); const [visibleStores, setVisibleStores] = useState(6); const stores = catalog.stores.filter(store => { const matchesQuery = normalize(`${store.name} ${store.neighborhood}`).includes(normalize(query)); const matchesSector = !activeDirectorySector || activeDirectorySector.businessKinds.includes(store.kind || "market"); return matchesQuery && matchesSector; }); const listedStores = stores.slice(0, visibleStores); useEffect(() => setVisibleStores(6), [query]); const mapLabel = mapStore || `${activeDirectorySector?.label || "Estabelecimentos"} em Feijó`; const mapQuery = encodeURIComponent(`${mapLabel}, Acre, Brasil`);
  return <div className="ref-page ref-directory ref-stores-page"><PublicHeader current="stores" /><main id="conteudo-principal" className="ref-shell ref-directory__main"><section className="ref-stores-hero"><div><span>{activeDirectorySector ? activeDirectorySector.eyebrow.toLocaleUpperCase("pt-BR") : "COMÉRCIO LOCAL VERIFICADO"}</span><h1>{activeDirectorySector ? activeDirectorySector.label : <>Negócios locais,<br />mais perto.</>}</h1><p>{activeDirectorySector?.description || "Descubra estabelecimentos de Feijó, consulte catálogos e encontre onde comprar melhor."}</p><div><BadgeCheck /> {stores.length} {stores.length === 1 ? "cadastro neste setor" : "cadastros neste setor"}</div></div><Link to="/lojista">Cadastrar meu negócio <ArrowRight /></Link></section><div className="ref-search-sectors"><SectorNavigator active={activeDirectorySector?.id || "all"} compact/></div><div className="ref-stores-toolbar"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={activeDirectorySector ? `Buscar em ${activeDirectorySector.shortLabel}` : "Buscar negócio ou bairro"} aria-label="Buscar estabelecimento" /><span>{stores.length} {stores.length === 1 ? "resultado" : "resultados"}</span></div><section className="ref-stores-directory"><div className="ref-store-cards"><header><div><span>ESTABELECIMENTOS</span><h2>Comércios para explorar</h2></div><small>Catálogos e preços locais</small></header>{listedStores.map(store => <article className={`ref-store-card${mapStore === store.name ? " is-map-active" : ""}`} key={store.id}><button className="ref-store-card__select" type="button" onClick={() => setMapStore(store.name)} aria-label={`Mostrar ${store.name} no mapa`}><i style={{ background: store.color }}><StoreLogo name={store.name} /></i><span><small>{store.neighborhood}</small><strong>{store.name}</strong><em>{store.products} produtos no catálogo</em></span><MapPin aria-hidden="true" /></button><footer><button type="button" onClick={() => setMapStore(store.name)}><MapPin /> Localizar</button><Link to={`/estabelecimento/${store.slug}`}>Abrir catálogo <ArrowRight /></Link></footer></article>)}{visibleStores < stores.length && <button className="ref-stores-more" type="button" onClick={() => setVisibleStores(count => Math.min(count + 6, stores.length))}>Mostrar mais estabelecimentos <span>{stores.length - visibleStores} restantes</span></button>}{!stores.length && <div className="ref-empty"><Store /><h2>Nenhum estabelecimento encontrado</h2><p>Tente buscar por outro nome ou bairro.</p></div>}</div><aside className="ref-stores-map" id="mapa-estabelecimentos"><header><MapIcon /><span><strong>{mapStore || "Mapa do comércio local"}</strong><small>{mapStore ? "Localização pesquisada em Feijó" : `Explore ${activeDirectorySector?.shortLabel.toLocaleLowerCase("pt-BR") || "negócios"} de Feijó`}</small></span></header><iframe key={mapQuery} title={`Mapa de ${mapLabel}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Abrir mapa completo <ArrowRight /></a></aside></section></main><AppDock current="stores" /></div>;
}

export function ReferenceFavoritesPage() { const catalog = useCatalog(); const { favoriteIds, loading, toggleFavorite } = useFavorites(); const products = catalog.products.filter(item => favoriteIds.includes(String(item.id))); return <div className="ref-page ref-directory"><PublicHeader /><main id="conteudo-principal" className="ref-shell ref-directory__main"><div className="ref-page-title"><div><span>SEUS PRODUTOS</span><h1>Favoritos para acompanhar.</h1><p>Reúna aqui os preços que você quer consultar de novo.</p></div><div className="ref-update"><Heart /><span>{favoriteIds.length} favoritos<small>sincronizados com sua conta</small></span></div></div>{loading ? <div className="ref-empty"><span className="ref-spinner" /><p>Carregando favoritos…</p></div> : products.length ? <div className="ref-product-grid">{products.map(product => <article key={product.id}><button type="button" onClick={() => void toggleFavorite(product.id)} aria-label={`Remover ${product.name}`}><X /></button><Link to={`/produto/${product.slug}`}><div><ProductVisual product={product} /></div><small>{product.category}</small><strong>{product.name}</strong><span>{product.size}</span><footer><em>a partir de</em><b>{brl.format(product.minPrice)}</b></footer></Link></article>)}</div> : <div className="ref-empty ref-empty--large"><Heart /><h2>Nenhum favorito ainda</h2><p>Salve produtos para consultar os preços mais rápido.</p><Link to="/buscar">Explorar preços <ArrowRight /></Link></div>}</main><AppDock current="profile" /></div>; }

export function ReferenceAuthPage({ mode }: { mode: "login" | "register" }) { const navigate = useNavigate(); const [accountType, setAccountType] = useState<"consumer" | "merchant">("consumer"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget); const email = String(data.get("email") || "").trim(); const password = String(data.get("password") || ""); const result = mode === "login" ? await signIn(email, password) : await signUp(email, password, String(data.get("name") || "").trim()); setBusy(false); if (result.error) setMessage(result.error); else navigate(accountType === "merchant" ? "/painel-lojista" : "/"); }; const recover = async () => { const email = prompt("Digite seu e-mail para recuperar a senha:")?.trim(); if (!email) return; const result = await requestPasswordReset(email); setMessage(result.error || "Enviamos as instruções para o seu e-mail."); }; return <div className="ref-auth"><aside className="ref-auth__story"><Brand inverse /><div className="ref-auth__hero-copy"><span className="ref-kicker"><MapPin /> FEIJÓ, ACRE</span><h1>Escolhas melhores<br />começam por aqui.</h1><p>Compare preços locais com clareza e compre com mais confiança.</p><div className="ref-auth__trust-grid"><article><BadgeCheck /><span><strong>Preços verificados</strong><small>Informação local atualizada</small></span></article><article><Search /><span><strong>Compare em segundos</strong><small>Produtos e mercados de Feijó</small></span></article></div></div><small>PreçoCerto · Economia perto de você</small></aside><main className="ref-auth__form"><Link className="ref-auth__back" to="/"><ArrowLeft /> Voltar ao PreçoCerto</Link><div className="ref-auth__card"><span className="ref-auth__eyebrow">{mode === "login" ? "BEM-VINDO DE VOLTA" : "COMECE AGORA"}</span><h2>{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h2><p>{mode === "login" ? "Acesse preços, favoritos e seus últimos comparativos." : "Escolha como você quer usar o PreçoCerto."}</p><div className="ref-account-tabs"><button type="button" className={accountType === "consumer" ? "is-active" : ""} onClick={() => setAccountType("consumer")}><UserRound /> Consumidor<small>Quero comparar preços</small></button><button type="button" className={accountType === "merchant" ? "is-active" : ""} onClick={() => setAccountType("merchant")}><Store /> Comerciante<small>Quero divulgar ofertas</small></button></div><form onSubmit={submit}>{mode === "register" && <label>Nome completo<input name="name" required autoComplete="name" /></label>}<label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{message && <p className="ref-auth__message" role="status">{message}</p>}<button className="ref-auth__submit" type="submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar minha conta"}<ArrowRight /></button></form>{mode === "login" && <button type="button" className="ref-auth__recover" onClick={recover}>Esqueci minha senha</button>}<div className="ref-auth__switch"><span>{mode === "login" ? "Ainda não tem conta?" : "Já possui uma conta?"}</span><Link to={mode === "login" ? "/cadastro" : "/login"}>{mode === "login" ? "Criar conta" : "Entrar"}</Link></div><p className="ref-auth__safe"><LockKeyhole /> Seus dados estão protegidos.</p></div></main><AppDock current="profile" /></div>; }

export function ReferenceMerchantDashboard() { const catalog = useCatalog(); const rows = catalog.products.slice(0, 6); return <div className="ref-admin ref-merchant-admin"><aside className="ref-admin__sidebar"><Brand inverse /><nav><span>GESTÃO</span><Link className="is-active" to="/painel-lojista"><LayoutDashboard /> Visão geral</Link><Link to="/painel-lojista/catalogo"><PackageSearch /> Catálogo</Link><Link to="/painel-lojista/vendas-online"><ShoppingBasket /> Pedidos</Link><span>NEGÓCIO</span><Link to="/painel-lojista/configurar-negocio"><Store /> Minha loja</Link><Link to="/estabelecimentos"><Eye /> Ver no site</Link></nav><small>PreçoCerto · Feijó, Acre</small></aside><main id="conteudo-principal" className="ref-admin__main"><header><div><span>PAINEL DO COMERCIANTE</span><h1>Central Super</h1><p>Preços, estoque e visibilidade do seu catálogo.</p></div><div><ThemeButton /><Link to="/">Ver site</Link></div></header><section className="ref-admin__cards"><article><Tag /><span>Produtos publicados</span><strong>{rows.length}</strong><small>catálogo ativo</small></article><article><BadgeCheck /><span>Preços atualizados</span><strong>92%</strong><small>nas últimas 24 horas</small></article><article><Eye /><span>Visualizações</span><strong>1.284</strong><small>nesta semana</small></article><article><TrendingDown /><span>Melhores preços</span><strong>4</strong><small>liderando comparações</small></article></section><section className="ref-merchant-table"><header><div><span>CATÁLOGO</span><h2>Preços e estoque</h2></div><button type="button"><Plus /> Novo produto</button></header><div className="ref-results-table"><div className="ref-results-table__head"><span>Produto</span><span>Status</span><span>Mercado local</span><span>Seu preço</span><span /></div>{rows.map(product => <div className="ref-result-row" key={product.id}><span className="ref-result-product"><i><ProductVisual product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.size}</em></span></span><span className="ref-status"><Check /> publicado</span><span className="ref-result-range">{brl.format(product.minPrice)} — {brl.format(product.maxPrice)}<small>{product.storeCount} lojas</small></span><strong className="ref-result-price">{brl.format(product.minPrice)}</strong><button type="button" aria-label={`Editar ${product.name}`}>Editar</button></div>)}</div></section></main></div>; }

type InfoKind = "collaborate" | "contact" | "pharmacies" | "orders" | "culture";
const infoCopy: Record<InfoKind, { eyebrow: string; title: string; copy: string; action: string; to: string }> = { collaborate: { eyebrow: "COLABORE COM FEIJÓ", title: "Ajude a manter os preços úteis.", copy: "Compartilhe atualizações e fortaleça uma base local mais transparente para todos.", action: "Entrar para colaborar", to: "/login" }, contact: { eyebrow: "FALE COM O PREÇOCERTO", title: "Estamos perto para ouvir.", copy: "Envie sua dúvida, sugestão ou proposta de parceria com o comércio local.", action: "Acessar minha conta", to: "/login" }, pharmacies: { eyebrow: "SAÚDE LOCAL", title: "Farmácias de Feijó.", copy: "A cobertura de preços de farmácias está sendo organizada com verificação e responsabilidade.", action: "Ver estabelecimentos", to: "/estabelecimentos" }, orders: { eyebrow: "SUAS COMPRAS", title: "Pedidos em um só lugar.", copy: "Entre para acompanhar pagamentos, preparo e entrega dos pedidos feitos nas lojas participantes.", action: "Entrar para continuar", to: "/login" }, culture: { eyebrow: "CULTURA DE FEIJÓ", title: "Talento local também tem valor.", copy: "Descubra projetos, livros e produções da nossa cidade dentro do ecossistema PreçoCerto.", action: "Explorar estabelecimentos", to: "/estabelecimentos" } };
export function ReferenceInfoPage({ kind }: { kind: InfoKind }) { const content = infoCopy[kind]; return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>{content.eyebrow}</span><h1>{content.title}</h1><p>{content.copy}</p><Link to={content.to}>{content.action} <ArrowRight /></Link></main></div>; }
export function ReferenceNotFound() { return <div className="ref-page"><PublicHeader /><main id="conteudo-principal" className="ref-info"><span>PÁGINA NÃO ENCONTRADA</span><h1>Vamos voltar ao preço certo.</h1><p>Este endereço não existe ou foi reorganizado na nova experiência.</p><Link to="/">Ir para a homepage <ArrowRight /></Link></main></div>; }
