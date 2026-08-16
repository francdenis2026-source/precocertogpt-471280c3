import { ArrowRight, BookOpen, BriefcaseBusiness, Croissant, Grid2X2, Pill, ShoppingBasket, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import "./MarketplaceSectors.css";

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
};

export const marketplaceSectors: MarketplaceSector[] = [
  {
    id: "markets", label: "Mercados e mercearias", shortLabel: "Mercados", eyebrow: "Compras do dia a dia",
    title: "Compare alimentos, limpeza e itens para casa.",
    description: "Preços locais de mercados, supermercados e mercearias, organizados para uma comparação direta.",
    searchHint: "Arroz, café, limpeza ou mercado…", href: "/mercados", icon: ShoppingBasket,
    productCategories: ["mercearia", "acougue", "laticinios", "limpeza", "hortifruti", "bebidas", "higiene", "congelados"],
    businessKinds: ["market", "grocery", "supermarket", "beverage"],
  },
  {
    id: "pharmacies", label: "Farmácias e saúde", shortLabel: "Farmácias", eyebrow: "Saúde e cuidados",
    title: "Encontre farmácias e itens de cuidado pessoal.",
    description: "Uma área própria para farmácias, perfumaria, higiene e produtos de saúde, sem misturar com o supermercado.",
    searchHint: "Farmácia, higiene ou produto de saúde…", href: "/farmacias", icon: Pill,
    productCategories: ["farmacia", "medicamentos", "saude", "higiene", "perfumaria", "cuidados pessoais"],
    businessKinds: ["pharmacy", "health"],
  },
  {
    id: "bakery", label: "Padarias e alimentação", shortLabel: "Padarias", eyebrow: "Feito perto de você",
    title: "Cardápios, encomendas e alimentação local.",
    description: "Padarias, lanchonetes e restaurantes com cardápio, horários, retirada e entrega em uma área dedicada.",
    searchHint: "Pão, bolo, lanche ou padaria…", href: "/padarias", icon: Croissant,
    productCategories: ["padaria", "alimentos preparados", "lanches", "refeicoes", "doces", "salgados"],
    businessKinds: ["bakery", "restaurant", "pizzeria", "snack_bar", "food"],
  },
  {
    id: "books", label: "Livros e autores", shortLabel: "Livros", eyebrow: "Cultura e conhecimento",
    title: "Descubra livros, autores e projetos editoriais.",
    description: "Obras, perfis de autores e espaços culturais reunidos em uma vitrine editorial própria.",
    searchHint: "Título, autora, autor ou gênero…", href: "/livros", icon: BookOpen,
    productCategories: ["livros", "literatura", "cultura", "educacao"],
    businessKinds: ["books_author", "bookstore", "publisher", "culture"],
  },
  {
    id: "services", label: "Serviços e profissionais", shortLabel: "Serviços", eyebrow: "Profissionais locais",
    title: "Encontre quem pode resolver o que você precisa.",
    description: "Autônomos e prestadores com especialidades, portfólio, área atendida e formas de contato claras.",
    searchHint: "Serviço, profissão ou especialidade…", href: "/servicos", icon: BriefcaseBusiness,
    productCategories: ["servicos", "profissionais", "autonomos"],
    businessKinds: ["services", "professional", "freelancer"],
  },
];

export function getMarketplaceSector(value: string | null | undefined) {
  return marketplaceSectors.find(sector => sector.id === value) || null;
}

export function inferProductSector(category: string): MarketplaceSectorId {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  return marketplaceSectors.find(sector => sector.productCategories.some(item => normalized.includes(item)))?.id || "markets";
}

export function SectorNavigator({ active = "all", compact = false }: { active?: MarketplaceSectorId; compact?: boolean }) {
  return <nav className={`sector-nav${compact ? " sector-nav--compact" : ""}`} aria-label="Explorar por setor">
    <Link className={active === "all" ? "is-active" : ""} to="/explorar"><Grid2X2 aria-hidden="true" /><span><strong>Todos os setores</strong><small>Escolha o que procura</small></span></Link>
    {marketplaceSectors.map(sector => <Link key={sector.id} className={active === sector.id ? "is-active" : ""} to={sector.href}><sector.icon aria-hidden="true" /><span><strong>{sector.shortLabel}</strong><small>{sector.eyebrow}</small></span></Link>)}
  </nav>;
}

export function MarketplaceSectorLanding({ sector }: { sector: MarketplaceSector }) {
  const Icon = sector.icon;
  return <div className={`sector-page sector-page--${sector.id}`}>
    <header className="sector-header"><div className="sector-shell"><Link className="sector-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /></Link><Link to="/explorar">Todos os setores <Grid2X2 /></Link></div></header>
    <main id="conteudo-principal">
      <section className="sector-hero"><div className="sector-shell sector-hero__grid"><div><span className="sector-eyebrow"><Icon /> {sector.eyebrow}</span><h1>{sector.title}</h1><p>{sector.description}</p><form action="/buscar" role="search"><input type="hidden" name="setor" value={sector.id}/><label><span className="sr-only">Pesquisar em {sector.label}</span><input name="q" placeholder={sector.searchHint}/></label><button type="submit">Pesquisar neste setor <ArrowRight /></button></form></div><aside><span>Você está explorando</span><Icon /><strong>{sector.label}</strong><p>Os resultados desta área priorizam somente negócios e itens relacionados a este setor.</p></aside></div></section>
      <section className="sector-content sector-shell"><div className="sector-content__heading"><div><span>NAVEGAÇÃO ORGANIZADA</span><h2>Procure sem misturar assuntos.</h2></div><p>Pesquise pelo nome do item, estabelecimento ou profissional. Você poderá trocar de setor a qualquer momento.</p></div><SectorNavigator active={sector.id} compact/><div className="sector-next"><div><strong>Vitrines próprias para cada negócio</strong><p>Catálogo, cardápio, portfólio ou obras aparecem no formato adequado a cada atividade.</p></div><Link to={`/estabelecimentos?setor=${sector.id}`}>Ver estabelecimentos <ArrowRight /></Link></div></section>
    </main>
  </div>;
}

export function MarketplaceExplorePage() {
  return <div className="sector-page sector-page--all"><header className="sector-header"><div className="sector-shell"><Link className="sector-brand" to="/"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /></Link><Link to="/">Voltar ao início <ArrowRight /></Link></div></header><main id="conteudo-principal"><section className="sector-hero"><div className="sector-shell"><span className="sector-eyebrow"><Grid2X2 /> PREÇOCERTO PARA TODA A CIDADE</span><h1>O que você procura hoje?</h1><p>Escolha uma área para ver resultados, lojas e profissionais sem misturar categorias diferentes.</p><SectorNavigator /></div></section></main></div>;
}
