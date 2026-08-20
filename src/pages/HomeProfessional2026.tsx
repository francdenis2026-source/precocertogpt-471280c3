import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpen, HeartPulse, MapPin, Menu, Moon,
  PackageSearch, Search, ShoppingBasket, Store, Sun, Tag, TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import "./HomeProfessional2026.css";

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const readTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme") || window.localStorage.getItem("precocerto-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function ProductImage({ product, eager = false }: { product: Product; eager?: boolean }) {
  const source = resolveProductImage(product);
  const [failed, setFailed] = useState(false);
  return source && !failed
    ? <img src={source} alt={product.name} width="240" height="200" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} />
    : <span className="hp-product-fallback"><PackageSearch aria-hidden="true" /><small>Imagem em atualização</small></span>;
}

const sectors = [
  { label: "Mercados", detail: "Alimentos e cesta", icon: ShoppingBasket, to: "/mercados" },
  { label: "Açougues", detail: "Carnes e cortes", icon: Tag, to: "/buscar?q=carne" },
  { label: "Farmácias", detail: "Saúde e cuidado", icon: HeartPulse, to: "/farmacias" },
  { label: "Livros locais", detail: "Cultura de Feijó", icon: BookOpen, to: "/livros" },
] as const;

export function HomeProfessional2026() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<CatalogPayload>({ ...initialCatalog, metrics: verifiedDatasetMetrics });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
    window.localStorage.setItem("precocerto-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then(value => { if (active) setCatalog(value); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const products = useMemo(() => catalog.products.filter(product => product.minPrice > 0), [catalog.products]);
  const suggestions = useMemo(() => {
    const term = normalize(query);
    if (term.length < 2) return [];
    return products.filter(product => normalize(`${product.name} ${product.brand || ""} ${product.category || ""}`).includes(term))
      .sort((a, b) => a.minPrice - b.minPrice).slice(0, 5);
  }, [products, query]);
  const featured = useMemo(() => products.filter(product => Boolean(resolveProductImage(product)))
    .sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice)).slice(0, 6), [products]);
  const spotlight = featured[0];

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/buscar?q=${encodeURIComponent(query.trim())}` : "/buscar");
  };

  return <div className="hp-home">
    <header className="hp-header">
      <div className="hp-shell hp-header__inner">
        <Link className="hp-brand" to="/" aria-label="PreçoCerto — página inicial">
          <img className="hp-brand__light" src="/logo-preco-certo.svg" alt="PreçoCerto" />
          <img className="hp-brand__dark" src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" />
          <small>FEIJÓ · ACRE</small>
        </Link>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link>
          <Link to="/explorar" onClick={() => setMenuOpen(false)}>Explorar</Link>
          <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
          <Link to="/cesta-basica" onClick={() => setMenuOpen(false)}>Minha cesta</Link>
        </nav>
        <div className="hp-header__actions">
          <button className="hp-theme" type="button" onClick={() => setTheme(value => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span>{theme === "dark" ? "Claro" : "Escuro"}</span>
          </button>
          <Link className="hp-login" to="/login">Entrar</Link>
          <button className="hp-menu" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main id="conteudo-principal">
      <section className="hp-hero">
        <div className="hp-hero__media" aria-hidden="true" />
        <div className="hp-hero__veil" aria-hidden="true" />
        <div className="hp-shell hp-hero__grid">
          <div className="hp-hero__copy">
            <span className="hp-eyebrow"><MapPin /> COMÉRCIO LOCAL · FEIJÓ</span>
            <h1>Seu dinheiro vai<br /><em>mais longe.</em></h1>
            <p>Compare preços reais do comércio de Feijó e descubra onde cada produto custa menos — antes de sair de casa.</p>
            <form className="hp-search" role="search" onSubmit={submitSearch} onFocus={() => setSearchFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) window.setTimeout(() => setSearchFocused(false), 120); }}>
              <Search aria-hidden="true" />
              <label className="sr-only" htmlFor="hp-search-input">Buscar produto, marca ou categoria</label>
              <input id="hp-search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer economizar hoje?" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && query.trim().length >= 2} aria-controls="hp-search-results" />
              {query && <button className="hp-search__clear" type="button" onClick={() => setQuery("")} aria-label="Limpar pesquisa"><X /></button>}
              <button className="hp-search__submit" type="submit">Comparar <ArrowRight /></button>
              {searchFocused && query.trim().length >= 2 && <div id="hp-search-results" className="hp-search-results">
                <header><strong>Resultados rápidos</strong><span>{suggestions.length} encontrados</span></header>
                {suggestions.length ? suggestions.map(product => <button type="button" key={product.id} onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/produto/${product.slug || product.id}`)}>
                  <i><ProductImage product={product} /></i><span><small>{product.category}</small><strong>{product.name}</strong><em>{product.establishment || "Comércio local"}</em></span><b>{brl.format(product.minPrice)}</b><ArrowRight />
                </button>) : <div className="hp-search-results__empty"><PackageSearch /><span><strong>Produto não encontrado</strong><small>Tente uma palavra mais curta, como “arroz” ou “leite”.</small></span></div>}
                <Link to={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver busca completa <ArrowRight /></Link>
              </div>}
            </form>
            <div className="hp-quick-searches"><span>Buscas rápidas:</span>{["Arroz", "Café", "Leite", "Limpeza"].map(item => <Link key={item} to={`/buscar?q=${item.toLowerCase()}`}>{item}</Link>)}</div>
          </div>

          <aside className="hp-spotlight" aria-label="Destaque de preço">
            <header><span><i /> PREÇO EM DESTAQUE</span><small>Catálogo local</small></header>
            {loading ? <div className="hp-spotlight__loading" aria-busy="true"><i /><i /><i /></div> : spotlight ? <>
              <div className="hp-spotlight__product"><div><ProductImage product={spotlight} eager /></div><span><small>{spotlight.category}</small><strong>{spotlight.name}</strong><em>{spotlight.size || spotlight.brand}</em></span></div>
              <div className="hp-spotlight__prices"><span><small>Menor preço</small><strong>{brl.format(spotlight.minPrice)}</strong></span><span><small>Diferença possível</small><strong>{brl.format(Math.max(0, spotlight.maxPrice - spotlight.minPrice))}</strong></span></div>
              <Link to={`/produto/${spotlight.slug || spotlight.id}`}>Ver comparação completa <ArrowRight /></Link>
            </> : <div className="hp-spotlight__empty">Novos preços serão exibidos aqui.</div>}
          </aside>
        </div>
      </section>

      <section className="hp-sectors hp-shell" aria-labelledby="hp-sectors-title">
        <div className="hp-section-head"><div><span>COMECE POR AQUI</span><h2 id="hp-sectors-title">Tudo o que você procura, bem organizado.</h2></div><Link to="/explorar">Ver todos os setores <ArrowRight /></Link></div>
        <div className="hp-sector-grid">{sectors.map(({ label, detail, icon: Icon, to }) => <Link to={to} key={label}><i><Icon /></i><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight /></Link>)}</div>
      </section>

      <section className="hp-offers hp-shell" aria-labelledby="hp-offers-title">
        <div className="hp-section-head"><div><span>OPORTUNIDADES LOCAIS</span><h2 id="hp-offers-title">Produtos para comparar agora.</h2><p>Uma seleção compacta com preços disponíveis no catálogo.</p></div><Link to="/buscar">Explorar preços <ArrowRight /></Link></div>
        <div className="hp-product-grid">{loading ? Array.from({ length: 4 }, (_, index) => <div className="hp-product-card hp-product-card--loading" key={index} />) : featured.slice(0, 4).map(product => <article className="hp-product-card" key={product.id}>
          <Link to={`/produto/${product.slug || product.id}`} aria-label={`Comparar preços de ${product.name}`}>
            <div className="hp-product-card__media"><ProductImage product={product} /><span><TrendingDown /> comparar</span></div>
            <div className="hp-product-card__body"><small>{product.category}</small><h3>{product.name}</h3><p>{product.size || product.brand || "Produto local"}</p><div><span><small>a partir de</small><strong>{brl.format(product.minPrice)}</strong></span><ArrowRight /></div></div>
          </Link>
        </article>)}</div>
      </section>

      <section className="hp-story">
        <div className="hp-story__media" aria-hidden="true" />
        <div className="hp-shell hp-story__content"><span>COMPARE COM CLAREZA</span><h2>Da pesquisa à escolha,<br />sem complicação.</h2><p>Busque o produto, veja as opções disponíveis e escolha o comércio que faz mais sentido para sua compra.</p><ol><li><b>01</b><span><strong>Pesquise</strong><small>Digite o produto ou a marca.</small></span></li><li><b>02</b><span><strong>Compare</strong><small>Veja preços e estabelecimentos.</small></span></li><li><b>03</b><span><strong>Economize</strong><small>Escolha com mais informação.</small></span></li></ol><Link to="/buscar">Começar uma comparação <ArrowRight /></Link></div>
      </section>

      <section className="hp-local hp-shell">
        <div className="hp-local__copy"><span><Store /> FEITO PARA O COMÉRCIO DE FEIJÓ</span><h2>Mais visibilidade para quem vende.<br />Mais clareza para quem compra.</h2><p>Explore os estabelecimentos cadastrados ou prepare a presença digital do seu negócio no PreçoCerto.</p></div>
        <div className="hp-local__actions"><Link to="/estabelecimentos">Ver estabelecimentos <ArrowRight /></Link><Link to="/lojista">Cadastrar meu negócio <ArrowRight /></Link></div>
      </section>
    </main>

    <footer className="hp-footer"><div className="hp-shell"><Link className="hp-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /><small>FEIJÓ · ACRE</small></Link><p>Compare preços locais e faça escolhas melhores.</p><nav aria-label="Links do rodapé"><Link to="/buscar">Comparar</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/lojista">Para comerciantes</Link><Link to="/contato">Contato</Link></nav></div></footer>
    <nav className="hp-dock" aria-label="Navegação móvel"><Link className="is-active" to="/"><Store /><span>Início</span></Link><Link to="/buscar"><Search /><span>Buscar</span></Link><Link to="/cesta-basica"><ShoppingBasket /><span>Cesta</span></Link><Link to="/estabelecimentos"><MapPin /><span>Lojas</span></Link></nav>
  </div>;
}
