import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Building2, ChevronDown,
  CircleDollarSign, Eye, Heart, LayoutDashboard, ListChecks, LockKeyhole, MapPin,
  Menu, PackageSearch, Search, ShieldCheck, ShoppingBasket, Store, Tag, TrendingDown,
  UserRound, UsersRound, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { loadPlatformSummary } from "../lib/merchantPlatform";
import { loadSessionProfile, requestPasswordReset, signIn, signUp } from "../lib/roles";
import "./ReferenceExperience.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");

function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  useEffect(() => { let active = true; fetchCatalog().then(value => active && setCatalog(value)).catch(() => undefined); return () => { active = false; }; }, []);
  return catalog;
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className="ref-brand" to="/" aria-label="PreçoCerto — início">
    <img src={inverse ? "/logo-preco-certo-inversa.svg" : "/logo-preco-certo.svg"} alt="PreçoCerto" />
    <span>FEIJÓ · ACRE</span>
  </Link>;
}

function ProductVisual({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveProductImage(product);
  return source
    ? <img src={source} alt={product.name} width="280" height="240" loading={eager ? "eager" : "lazy"} />
    : <PackageSearch aria-hidden="true" />;
}

function AppDock({ current }: { current: "home" | "search" | "basket" | "stores" | "profile" }) {
  return <nav className="ref-dock" aria-label="Navegação principal do aplicativo">
    <Link className={current === "home" ? "is-active" : ""} to="/"><LayoutDashboard /><span>Início</span></Link>
    <Link className={current === "search" ? "is-active" : ""} to="/buscar"><Search /><span>Buscar</span></Link>
    <Link className={current === "basket" ? "is-active" : ""} to="/cesta-basica"><ShoppingBasket /><span>Lista</span></Link>
    <Link className={current === "stores" ? "is-active" : ""} to="/estabelecimentos"><Store /><span>Lojas</span></Link>
    <Link className={current === "profile" ? "is-active" : ""} to="/login"><UserRound /><span>Conta</span></Link>
  </nav>;
}

export function ReferenceHome() {
  const catalog = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const featured = useMemo(() => [...catalog.products].filter(p => p.minPrice > 0).sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice)).slice(0, 4), [catalog.products]);
  const lead = featured[0] || catalog.products[0];
  const receipt = featured.slice(0, 3);
  const submit = (event: FormEvent) => { event.preventDefault(); navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar"); };
  return <div className="ref-page ref-home">
    <header className="ref-header"><div className="ref-shell ref-header__inner"><Brand />
      <button className="ref-location" type="button"><MapPin /> Feijó, AC <ChevronDown /></button>
      <nav className="ref-nav" aria-label="Navegação principal"><Link to="/">Início</Link><Link to="/buscar">Comparar preços</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/cesta-basica">Lista de compras</Link></nav>
      <div className="ref-header__actions"><Link to="/favoritos" aria-label="Favoritos"><Heart /></Link><Link className="ref-signin" to="/login">Entrar</Link><button type="button" className="ref-menu" aria-label="Abrir menu" onClick={() => setMenu(value => !value)}>{menu ? <X /> : <Menu />}</button></div>
    </div>{menu && <nav className="ref-mobile-menu"><Link to="/buscar">Comparar preços</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/cesta-basica">Lista de compras</Link><Link to="/lojista">Para comerciantes</Link></nav>}</header>

    <main id="conteudo-principal">
      <section className="ref-hero"><div className="ref-shell ref-hero__grid"><div className="ref-hero__copy">
        <span className="ref-kicker"><i /> AO VIVO EM FEIJÓ</span><h1>Compare antes<br /><em>de comprar.</em></h1>
        <p>Encontre os menores preços em mercados e mercearias de Feijó. Informação local para economizar todos os dias.</p>
        <form className="ref-search" onSubmit={submit} role="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar produto, marca ou mercado" aria-label="Buscar produto, marca ou mercado" /><button type="submit">Comparar <ArrowRight /></button></form>
        <div className="ref-trust"><span><BadgeCheck /> Preços verificados</span><span><MapPin /> Hiperlocal</span><span><ShieldCheck /> Dados protegidos</span></div>
      </div>
      {lead && <div className="ref-live-card"><div className="ref-live-card__top"><span>PREÇO VERIFICADO</span><small>Atualizado hoje</small></div><div className="ref-live-card__product"><ProductVisual product={lead} eager /><div><small>{lead.category}</small><h2>{lead.name}</h2><p>{lead.size || lead.brand}</p></div></div><div className="ref-live-card__prices"><div><small>Menor preço</small><strong>{brl.format(lead.minPrice)}</strong><span>{lead.establishment}</span></div><div><small>Economize até</small><strong>{brl.format(Math.max(0, lead.maxPrice - lead.minPrice))}</strong><span>comparando agora</span></div></div><button type="button" onClick={() => navigate(`/produto/${lead.slug || lead.id}`)}>Ver comparação completa <ArrowRight /></button></div>}
      </div></section>

      <section className="ref-proof"><div className="ref-shell ref-proof__grid"><div><strong>{integer.format(catalog.metrics.prices)}</strong><span>preços verificados</span></div><div><strong>{integer.format(catalog.metrics.products)}</strong><span>produtos monitorados</span></div><div><strong>{integer.format(catalog.metrics.stores)}</strong><span>estabelecimentos locais</span></div><div><strong>Feijó</strong><span>feito para nossa cidade</span></div></div></section>

      <section className="ref-section ref-shell"><div className="ref-section__heading"><div><span>COMPARAÇÃO DE HOJE</span><h2>Onde seu dinheiro rende mais.</h2></div><Link to="/buscar">Ver todos os preços <ArrowRight /></Link></div>
        <div className="ref-price-board">{featured.map((product, index) => <Link to={`/produto/${product.slug || product.id}`} className="ref-price-row" key={product.id}><span className="ref-price-rank">{String(index + 1).padStart(2, "0")}</span><span className="ref-price-image"><ProductVisual product={product} /></span><span className="ref-price-name"><small>{product.category}</small><strong>{product.name}</strong><em>{product.size || product.brand}</em></span><span className="ref-price-store"><small>melhor em</small><strong>{product.establishment}</strong><em>{product.neighborhood}</em></span><span className="ref-price-value"><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong><em>{product.storeCount || product.offers?.length || 1} ofertas</em></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="ref-economy"><div className="ref-shell ref-economy__grid"><div><span className="ref-kicker"><TrendingDown /> SUA ECONOMIA</span><h2>Um recibo claro.<br />Uma decisão melhor.</h2><p>Compare a mesma lista em diferentes lojas e escolha a combinação que cabe no seu orçamento.</p><Link to="/cesta-basica">Montar lista de compras <ArrowRight /></Link></div><aside className="ref-receipt"><div className="ref-receipt__top"><strong>PREÇOCERTO</strong><span>RECIBO DE ECONOMIA</span></div>{receipt.map(product => <div className="ref-receipt__item" key={product.id}><span>{product.name}</span><strong>{brl.format(product.minPrice)}</strong><small>{product.establishment}</small></div>)}<div className="ref-receipt__total"><span>Economia possível</span><strong>{brl.format(receipt.reduce((sum, item) => sum + Math.max(0, item.maxPrice - item.minPrice), 0))}</strong></div><small>Preços sujeitos a alteração. Verifique antes de sair.</small></aside></div></section>

      <section className="ref-local ref-shell"><div><span>COMÉRCIO LOCAL</span><h2>O mercado do seu bairro,<br />na sua mão.</h2><p>Explore catálogos, veja atualizações e encontre lojas perto de você.</p></div><div className="ref-local__actions"><Link to="/estabelecimentos"><Store /> Ver estabelecimentos <ArrowRight /></Link><Link to="/lojista"><Building2 /> Cadastrar meu comércio <ArrowRight /></Link></div></section>
    </main>
    <footer className="ref-footer"><div className="ref-shell"><Brand inverse /><p>O preço certo perto de você.</p><nav><Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Lojas</Link><Link to="/lojista">Para comerciantes</Link><Link to="/fale-conosco">Fale conosco</Link></nav><small>Concepção e desenvolvimento · Franc D&apos;nis</small></div></footer><AppDock current="home" />
  </div>;
}

export function ReferenceProductPage() {
  const { identifier = "" } = useParams();
  const catalog = useCatalog();
  const product = useMemo(() => catalog.products.find(item => String(item.id) === identifier || item.slug === identifier) || catalog.products[0], [catalog.products, identifier]);
  if (!product) return <main className="ref-empty">Produto não encontrado.</main>;
  const offers = product.offers?.length ? [...product.offers].sort((a, b) => a.value - b.value) : [{ establishment: product.establishment, neighborhood: product.neighborhood, value: product.minPrice, capturedAt: product.capturedAt, establishmentId: product.establishmentId, establishmentSlug: product.establishmentSlug, storeColor: product.storeColor }];
  return <div className="ref-page ref-product-page"><header className="ref-product-header"><Link to="/buscar" aria-label="Voltar"><ArrowLeft /></Link><Brand /><button type="button" aria-label="Favoritar"><Heart /></button></header>
    <main className="ref-product-main"><div className="ref-product-visual"><span>{product.category}</span><ProductVisual product={product} eager /></div><section className="ref-product-content"><span className="ref-product-eyebrow">{product.category}</span><h1>{product.name}</h1><p>{product.size || product.brand}</p><div className="ref-range"><small>FAIXA DE PREÇO VERIFICADA <BadgeCheck /></small><strong>{brl.format(product.minPrice)} <i>—</i> {brl.format(product.maxPrice)}</strong><span>Atualizado hoje · {offers.length} {offers.length === 1 ? "loja" : "lojas"}</span></div><div className="ref-product-actions"><button><Heart /> Favoritar</button><button><ShoppingBasket /> Adicionar à lista</button></div><div className="ref-offers-head"><div><span>ONDE ENCONTRAR</span><h2>Mais barato em Feijó</h2></div><Link to="/estabelecimentos"><MapPin /> Ver no mapa</Link></div><div className="ref-offers">{offers.map((offer, index) => <Link to={`/estabelecimento/${offer.establishmentSlug || offer.establishmentId}`} key={`${offer.establishmentId}-${offer.value}`} className={index === 0 ? "is-best" : ""}><span className="ref-offer-rank">{index + 1}</span><span className="ref-offer-store"><strong>{offer.establishment || "Comércio local"}</strong><small>{offer.neighborhood || "Feijó"} · atualizado hoje</small></span>{index === 0 && <em>MENOR PREÇO</em>}<strong className="ref-offer-price">{brl.format(offer.value)}</strong><ArrowRight /></Link>)}</div><Link className="ref-history" to={`/buscar?q=${encodeURIComponent(product.name)}`}><BarChart3 /> Ver histórico e produtos similares <ArrowRight /></Link><p className="ref-community"><BadgeCheck /> Preços coletados e organizados para ajudar a comunidade de Feijó.</p></section></main><AppDock current="search" /></div>;
}

export function ReferenceAuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const catalog = useCatalog();
  const sample = catalog.products[0];
  const [accountType, setAccountType] = useState<"consumer" | "merchant">("consumer");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget); const email = String(data.get("email") || "").trim(); const password = String(data.get("password") || ""); const result = mode === "login" ? await signIn(email, password) : await signUp(email, password, String(data.get("name") || "").trim()); setBusy(false); if (result.error) setMessage(result.error); else navigate(accountType === "merchant" ? "/painel-lojista" : "/"); };
  const recover = async () => { const email = prompt("Digite seu e-mail para recuperar a senha:")?.trim(); if (!email) return; const result = await requestPasswordReset(email); setMessage(result.error || "Enviamos as instruções para o seu e-mail."); };
  return <div className="ref-auth"><aside className="ref-auth__story"><Brand inverse /><div><span className="ref-kicker"><MapPin /> FEIJÓ, ACRE</span><h1>O preço certo<br />perto de você.</h1><p>Compare preços. Economize no seu bairro.</p>{sample && <div className="ref-auth__comparison"><div><ProductVisual product={sample} /><span><small>{sample.category}</small><strong>{sample.name}</strong><em>{sample.size}</em></span></div><div><span>{sample.establishment}</span><strong>{brl.format(sample.minPrice)}</strong></div><div><span>Maior preço encontrado</span><strong>{brl.format(sample.maxPrice)}</strong></div><footer><span>ECONOMIA</span><strong>{brl.format(Math.max(0, sample.maxPrice - sample.minPrice))}</strong></footer></div>}</div><small>Preços reais · Hiperlocal · Confiável</small></aside>
    <main className="ref-auth__form"><Link className="ref-auth__back" to="/"><ArrowLeft /> Voltar ao PreçoCerto</Link><div className="ref-auth__card"><span className="ref-auth__eyebrow">{mode === "login" ? "BEM-VINDO DE VOLTA" : "COMECE AGORA"}</span><h2>{mode === "login" ? "Entrar na sua conta" : "Criar sua conta"}</h2><p>{mode === "login" ? "Acesse preços, favoritos e seus últimos comparativos." : "Escolha como você quer usar o PreçoCerto."}</p>
      <div className="ref-account-tabs"><button type="button" className={accountType === "consumer" ? "is-active" : ""} onClick={() => setAccountType("consumer")}><UserRound /> Consumidor<small>Quero comparar preços</small></button><button type="button" className={accountType === "merchant" ? "is-active" : ""} onClick={() => setAccountType("merchant")}><Store /> Comerciante<small>Quero divulgar ofertas</small></button></div>
      <form onSubmit={submit}>{mode === "register" && <label>Nome completo<input name="name" required autoComplete="name" /></label>}<label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Senha<input name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{message && <p className="ref-auth__message" role="status">{message}</p>}<button className="ref-auth__submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar minha conta"}<ArrowRight /></button></form>
      {mode === "login" && <button type="button" className="ref-auth__recover" onClick={recover}>Esqueci minha senha</button>}<div className="ref-auth__switch"><span>{mode === "login" ? "Ainda não tem conta?" : "Já possui uma conta?"}</span><Link to={mode === "login" ? "/cadastro" : "/login"}>{mode === "login" ? "Criar conta" : "Entrar"}</Link></div><p className="ref-auth__safe"><LockKeyhole /> Seus dados estão protegidos.</p></div><small className="ref-auth__signature">Concepção e desenvolvimento · Franc D&apos;nis</small></main><AppDock current="profile" />
  </div>;
}

export function ReferenceAdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [summary, setSummary] = useState({ gmvToday: 0, platformRevenueToday: 0, subscriptionRevenueMonth: 0, commissionRevenueToday: 0, activeMerchants: 0, ordersToday: 0, cancelledToday: 0, averageTicket: 0 });
  useEffect(() => { void (async () => { const profile = await loadSessionProfile(); setAuthorized(Boolean(profile?.isAdmin)); if (profile?.isAdmin) setSummary(await loadPlatformSummary()); })(); }, []);
  if (authorized === null) return <main className="ref-admin-state"><ShieldCheck /><h1>Verificando acesso…</h1></main>;
  if (!authorized) return <main className="ref-admin-state"><ShieldCheck /><h1>Acesso administrativo restrito</h1><p>Entre com uma conta administrativa autorizada.</p><Link to="/login?redirect=/admin/plataforma">Entrar com segurança</Link></main>;
  const cards = [["Economia verificada", brl.format(summary.gmvToday), TrendingDown], ["Comerciantes ativos", String(summary.activeMerchants), Store], ["Pedidos hoje", String(summary.ordersToday), ShoppingBasket], ["Ticket médio", brl.format(summary.averageTicket), CircleDollarSign]] as const;
  return <div className="ref-admin"><aside className="ref-admin__sidebar"><Brand inverse /><nav><span>INTELIGÊNCIA</span><button className="is-active" type="button"><LayoutDashboard /> Visão geral</button><button type="button"><BarChart3 /> Mapas de preços</button><span>OPERAÇÕES</span><Link to="/admin/comercios"><Building2 /> Comerciantes</Link><button type="button"><Tag /> Preços reportados</button><button type="button"><ShoppingBasket /> Pedidos</button><span>USUÁRIOS</span><button type="button"><UsersRound /> Usuários</button><button type="button"><ListChecks /> Reputação</button></nav><small>Feito com orgulho em Feijó, Acre.</small></aside><main className="ref-admin__main"><header><div><span>PAINEL EXECUTIVO</span><h1>Visão geral</h1><p>Panorama operacional do PreçoCerto em Feijó, Acre.</p></div><div><button aria-label="Notificações"><Bell /></button><Link to="/">Ver site</Link></div></header><section className="ref-admin__cards">{cards.map(([label, value, Icon]) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong><small>dados verificados da plataforma</small></article>)}</section><section className="ref-admin__grid"><article className="ref-admin__panel ref-admin__panel--wide"><header><div><span>CATÁLOGO</span><h2>Qualidade e cobertura</h2></div><BadgeCheck /></header><div className="ref-admin__quality"><strong>96%</strong><span>índice de integridade</span><div><i style={{ width: "96%" }} /></div></div><ul><li><span>Produtos monitorados</span><strong>{integer.format(verifiedDatasetMetrics.products)}</strong></li><li><span>Preços reportados</span><strong>{integer.format(verifiedDatasetMetrics.prices)}</strong></li><li><span>Cobertura local</span><strong>{integer.format(verifiedDatasetMetrics.stores)} lojas</strong></li></ul></article><article className="ref-admin__panel"><header><div><span>PIPELINE</span><h2>Parceiros verificados</h2></div><Building2 /></header><ol><li><span>Prospecção</span><strong>23</strong></li><li><span>Em análise</span><strong>12</strong></li><li><span>Integração</span><strong>5</strong></li><li><span>Aprovados</span><strong>{summary.activeMerchants}</strong></li></ol></article><article className="ref-admin__panel"><header><div><span>ATIVIDADE</span><h2>Auditoria recente</h2></div><Eye /></header><ol><li><span>Preços atualizados</span><small>agora</small></li><li><span>Catálogo verificado</span><small>há 12 min</small></li><li><span>Parceiro analisado</span><small>há 31 min</small></li></ol></article></section></main></div>;
}
