import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BadgePercent, CheckCircle2, Heart, LogIn, Menu, Moon, PackageSearch,
  Search, ShieldCheck, ShoppingBasket, Store, Sun, Tag, TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import "./HomeNext.css";

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const readTheme = (): Theme => typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark" ? "dark" : "light";

const categoryItems = [
  { label: "Alimentos", query: "alimentos", icon: ShoppingBasket },
  { label: "Bebidas", query: "bebidas", icon: Tag },
  { label: "Limpeza", query: "limpeza", icon: BadgePercent },
  { label: "Higiene", query: "higiene", icon: ShieldCheck },
  { label: "Açougue", query: "carne", icon: TrendingDown },
  { label: "Farmácias", href: "/farmacias", icon: CheckCircle2 },
] as const;

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const src = resolveProductImage(product);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <PackageSearch aria-hidden="true" />;
  return <img src={src} alt={product.name} loading="lazy" onError={() => setFailed(true)} />;
}

export function HomeNext() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<CatalogPayload>({
    products: initialCatalog.products,
    stores: initialCatalog.stores,
    metrics: verifiedDatasetMetrics,
    updatedAt: initialCatalog.updatedAt,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((result) => { if (active) setCatalog(result); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const featuredProducts = useMemo(() => [...catalog.products]
    .filter((product) => product.minPrice > 0)
    .sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice))
    .slice(0, 4), [catalog.products]);

  const featuredStores = useMemo(() => [...catalog.stores]
    .sort((a, b) => b.products - a.products)
    .slice(0, 5), [catalog.stores]);

  const heroProduct = featuredProducts[0] ?? catalog.products[0];
  const heroSaving = heroProduct ? Math.max(0, heroProduct.maxPrice - heroProduct.minPrice) : 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar");
  };

  const searchCategory = (term: string) => navigate(`/buscar?q=${encodeURIComponent(term)}`);

  return (
    <div className="pcn-home">
      <header className="pcn-header">
        <div className="pcn-shell pcn-header__inner">
          <Link className="pcn-brand" to="/" aria-label="PreçoCerto — página inicial">
            <span className="pcn-brand__mark"><TrendingDown aria-hidden="true" /></span>
            <span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span>
          </Link>
          <nav className="pcn-nav" aria-label="Navegação principal">
            <Link to="/buscar">Pesquisar</Link>
            <Link to="/estabelecimentos">Estabelecimentos</Link>
            <Link to="/farmacias">Categorias</Link>
            <Link to="/favoritos">Favoritos</Link>
            <Link to="/lojista">Para lojistas</Link>
          </nav>
          <div className="pcn-actions">
            <Link className="pcn-icon-link" to="/favoritos" aria-label="Favoritos"><Heart aria-hidden="true" /></Link>
            <button className="pcn-theme" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label="Alternar tema">
              <Sun aria-hidden="true" /><Moon aria-hidden="true" />
            </button>
            <Link className="pcn-login" to="/login"><LogIn aria-hidden="true" /> Entrar</Link>
            <button className="pcn-menu" type="button" aria-label="Abrir menu" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <nav className="pcn-mobile-nav">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Pesquisar</Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
          <Link to="/farmacias" onClick={() => setMenuOpen(false)}>Categorias</Link>
          <Link to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link>
          <Link to="/lojista" onClick={() => setMenuOpen(false)}>Para lojistas</Link>
        </nav>}
      </header>

      <main>
        <section className="pcn-hero">
          <div className="pcn-hero__photo" aria-hidden="true" />
          <div className="pcn-hero__veil" aria-hidden="true" />
          <div className="pcn-shell pcn-hero__content">
            <div className="pcn-hero__copy">
              <div className="pcn-eyebrow"><BadgePercent aria-hidden="true" /> Comparador local de preços em Feijó-AC</div>
              <h1>Compare preços.<br /><span>Compre melhor.</span><br />Viva mais.</h1>
              <p>Encontre os menores preços, descubra onde comprar e economize de verdade nos comércios de Feijó.</p>
              <form className="pcn-search" onSubmit={submitSearch} role="search">
                <Search aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto, marca ou estabelecimento..." aria-label="Buscar produto, marca ou estabelecimento" />
                <button type="submit">Buscar <ArrowRight aria-hidden="true" /></button>
              </form>
              <div className="pcn-quick">
                <button type="button" onClick={() => searchCategory("ofertas")}><Tag /> Ofertas</button>
                <button type="button" onClick={() => navigate("/buscar")}><ShoppingBasket /> Monte sua cesta</button>
                <button type="button" onClick={() => searchCategory("carne")}><TrendingDown /> Açougues</button>
              </div>
            </div>

            <aside className="pcn-receipt" aria-label="Resumo de economia">
              <div className="pcn-receipt__top"><span>RECIBO DE ECONOMIA</span><BadgePercent aria-hidden="true" /></div>
              {heroProduct ? <>
                <small>Sua economia pode chegar a</small>
                <strong className="pcn-receipt__saving">{money(heroSaving)}</strong>
                <p>comparando o mesmo produto entre lojas</p>
                <div className="pcn-receipt__rows">
                  <span>Menor preço <b>{money(heroProduct.minPrice)}</b></span>
                  <span>Preço médio <b>{money(heroProduct.avgPrice)}</b></span>
                  <span>Maior preço <b>{money(heroProduct.maxPrice)}</b></span>
                </div>
                <button type="button" onClick={() => navigate(`/buscar?q=${encodeURIComponent(heroProduct.name)}`)}>Ver onde comprar <ArrowRight /></button>
              </> : <p>Carregando oportunidades locais…</p>}
            </aside>
          </div>
        </section>

        <section className="pcn-metrics-wrap">
          <div className="pcn-shell pcn-metrics">
            <div><span className="pcn-metric-icon is-blue"><Tag /></span><strong>{catalog.metrics.prices.toLocaleString("pt-BR")}</strong><small>Preços verificados</small></div>
            <div><span className="pcn-metric-icon is-amber"><ShoppingBasket /></span><strong>{catalog.metrics.products.toLocaleString("pt-BR")}</strong><small>Produtos cadastrados</small></div>
            <div><span className="pcn-metric-icon is-green"><BadgePercent /></span><strong>{heroSaving > 0 ? money(heroSaving) : "Economia"}</strong><small>Diferença encontrada</small></div>
            <div><span className="pcn-metric-icon is-violet"><Store /></span><strong>{catalog.metrics.stores}</strong><small>Lojas parceiras</small></div>
            <div><span className="pcn-metric-icon is-amber"><CheckCircle2 /></span><strong>Feijó-AC</strong><small>Nossa cidade</small></div>
          </div>
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><span>COMÉRCIO LOCAL</span><h2>Estabelecimentos em destaque</h2></div><Link to="/estabelecimentos">Ver todas as lojas <ArrowRight /></Link></div>
          <div className="pcn-stores">
            {featuredStores.map((store) => <Link className="pcn-store" key={store.id} to={`/estabelecimento/${store.slug}`}>
              <span className="pcn-store__mark" style={{ background: store.color }}>{store.name.slice(0, 1)}</span>
              <strong>{store.name}</strong><small>{store.neighborhood || "Feijó"}</small><b>{store.products} produtos</b>
            </Link>)}
            <Link className="pcn-store pcn-store--all" to="/estabelecimentos"><span>+</span><strong>Ver todas</strong><small>{catalog.metrics.stores} lojas</small></Link>
          </div>
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><span>EXPLORE</span><h2>Compre por categorias</h2></div><Link to="/buscar">Ver todos os produtos <ArrowRight /></Link></div>
          <div className="pcn-categories">
            {categoryItems.map((item) => {
              const Icon = item.icon;
              const content = <><span className="pcn-category__icon"><Icon /></span><strong>{item.label}</strong><small>Encontrar preços</small></>;
              return "href" in item ? <Link className="pcn-category" key={item.label} to={item.href}>{content}</Link> : <button className="pcn-category" key={item.label} type="button" onClick={() => searchCategory(item.query)}>{content}</button>;
            })}
          </div>
        </section>

        <section className="pcn-smart pcn-shell">
          <div className="pcn-smart__copy"><span>CESTA INTELIGENTE</span><h2>Monte sua cesta e descubra onde comprar gastando menos.</h2><p>Adicione produtos, compare lojas e veja rapidamente onde sua lista pesa menos no bolso.</p><Link to="/buscar">Montar minha cesta <ArrowRight /></Link></div>
          <div className="pcn-smart__image" aria-hidden="true" />
        </section>

        <section className="pcn-section pcn-shell">
          <div className="pcn-section__head"><div><span>OPORTUNIDADES</span><h2>Produtos com maior diferença de preço</h2></div><Link to="/buscar">Comparar mais <ArrowRight /></Link></div>
          <div className="pcn-products">
            {featuredProducts.map((product) => <Link className="pcn-product" key={product.id} to={`/buscar?q=${encodeURIComponent(product.name)}`}>
              <span className="pcn-product__saving">Economize {money(Math.max(0, product.maxPrice - product.minPrice))}</span>
              <span className="pcn-product__media"><ProductImage product={product} /></span>
              <small>{product.brand || "Produto local"}</small><strong>{product.name}</strong>
              <div><span><small>a partir de</small><b>{money(product.minPrice)}</b></span><ArrowRight /></div>
            </Link>)}
          </div>
        </section>

        <section className="pcn-how pcn-shell">
          <div className="pcn-section__head"><div><span>SIMPLES E RÁPIDO</span><h2>Como funciona?</h2></div></div>
          <div className="pcn-how__grid">
            <div><b>01</b><Search /><h3>Pesquise</h3><p>Digite o produto que você quer comprar.</p></div>
            <div><b>02</b><Store /><h3>Compare</h3><p>Veja preços em diferentes estabelecimentos.</p></div>
            <div><b>03</b><ShoppingBasket /><h3>Monte sua cesta</h3><p>Organize sua lista de compras em um só lugar.</p></div>
            <div><b>04</b><BadgePercent /><h3>Economize</h3><p>Escolha onde seu dinheiro rende mais.</p></div>
          </div>
        </section>

        <section className="pcn-merchant pcn-shell">
          <div><span>PARA COMERCIANTES</span><h2>Seja encontrado por quem já quer comprar.</h2><p>Apresente seu catálogo, atualize seus preços e transforme intenção em venda.</p></div>
          <Link to="/lojista">Quero ser parceiro <ArrowRight /></Link>
        </section>
      </main>

      <footer className="pcn-footer">
        <div className="pcn-shell pcn-footer__grid">
          <div><Link className="pcn-brand" to="/"><span className="pcn-brand__mark"><TrendingDown /></span><span className="pcn-brand__word">Preço<span>Certo</span><small>Feijó-AC</small></span></Link><p>Compare preços locais e compre com mais informação.</p></div>
          <nav><strong>PreçoCerto</strong><Link to="/buscar">Pesquisar</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/favoritos">Favoritos</Link></nav>
          <nav><strong>Ajuda</strong><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Fale conosco</Link><Link to="/farmacias">Farmácias</Link></nav>
          <div><strong>Para lojistas</strong><p>Faça seu comércio aparecer para mais clientes de Feijó.</p><Link className="pcn-footer__cta" to="/lojista">Conhecer área do lojista</Link></div>
        </div>
      </footer>
    </div>
  );
}
