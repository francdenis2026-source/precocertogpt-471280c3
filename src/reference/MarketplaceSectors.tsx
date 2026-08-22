import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, Croissant, Grid2X2, Pill, Sandwich, Scale, Search, ShoppingBasket, Store, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CatalogPayload } from "../data/catalog";
import { businessGroups, type BusinessGroupId } from "../data/businessTaxonomy";
import { fetchSectorCatalog, prefetchSectorCatalog, sectorProducts, sectorStores, withCatalog } from "../data/sectorCatalog";
import { PublicHeader } from "./ReferenceExperience";
import "./MarketplaceSectors.css";
import "./ExploreLayoutFix.css";
import "./SectorContentArchitecture.css";

gsap.registerPlugin(ScrollTrigger);

/* "Setor" saiu de toda a interface. A palavra é de quem monta a plataforma,
 * não de quem compra: ninguém em Feijó diz "vou olhar o setor de padarias".
 * O que a pessoa quer saber é ONDE COMPRAR uma coisa — então é esse o nome
 * usado na navegação, e cada item é uma "categoria" (palavra que todo mundo
 * já conhece de qualquer loja online). Os identificadores internos e as URLs
 * continuam os mesmos para não quebrar links já existentes. */

export type MarketplaceSectorId = BusinessGroupId | "all";
export type MarketplaceSector = {
  id: BusinessGroupId;
  label: string;
  shortLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  searchHint: string;
  href: string;
  icon: LucideIcon;
  examples: string[];
};

/* Apresentação de cada categoria. A composição dos grupos (quais tipos de
 * negócio entram em cada um) vive em businessTaxonomy.ts — aqui só entra o
 * que é texto e ícone, para os dois nunca saírem de sincronia. */
const PRESENTATION: Record<BusinessGroupId, Pick<MarketplaceSector, "eyebrow" | "title" | "description" | "searchHint" | "icon">> = {
  markets: {
    eyebrow: "COMPRAS DO DIA A DIA",
    title: "Mercados e mercearias de Feijó",
    description: "Compare o preço do arroz, do café, da limpeza e da bebida entre os mercados da cidade antes de sair de casa.",
    searchHint: "Arroz, café, sabão ou o nome do mercado…",
    icon: ShoppingBasket,
  },
  butchers: {
    eyebrow: "CARNES E CORTES",
    title: "Açougues e peixarias de Feijó",
    description: "Carne, frango e peixe: veja quem vende, onde fica e a que preço, sem precisar rodar a cidade perguntando.",
    searchHint: "Carne, frango, peixe ou o nome do açougue…",
    icon: Scale,
  },
  bakery: {
    eyebrow: "PÃO, BOLO E SALGADOS",
    title: "Padarias e confeitarias de Feijó",
    description: "Pão feito na hora, bolo, salgado e doce — com o preço de cada casa à vista.",
    searchHint: "Pão, bolo, salgado ou o nome da padaria…",
    icon: Croissant,
  },
  food: {
    eyebrow: "LANCHE E REFEIÇÃO",
    title: "Lanchonetes, pizzarias e restaurantes",
    description: "Cardápio completo com preço aberto, do hambúrguer à pizza, para decidir antes de pedir.",
    searchHint: "Hambúrguer, pizza, açaí ou o nome da lanchonete…",
    icon: Sandwich,
  },
  pharmacies: {
    eyebrow: "SAÚDE E CUIDADO",
    title: "Farmácias de Feijó",
    description: "Medicamentos, higiene e cuidados pessoais nas farmácias que já publicam preço na plataforma.",
    searchHint: "Remédio, higiene ou o nome da farmácia…",
    icon: Pill,
  },
  books: {
    eyebrow: "CULTURA LOCAL",
    title: "Livros, autores e cultura",
    description: "Autores, obras e projetos culturais da cidade, com espaço próprio — não são tratados como loja de produto.",
    searchHint: "Título, autor ou projeto cultural…",
    icon: BookOpen,
  },
  services: {
    eyebrow: "PROFISSIONAIS DA CIDADE",
    title: "Serviços e profissionais",
    description: "Quem faz o serviço, onde atende e como falar direto — sem produto inventado no meio.",
    searchHint: "Serviço, profissão ou especialidade…",
    icon: BriefcaseBusiness,
  },
  other: {
    eyebrow: "COMÉRCIO LOCAL",
    title: "Outros comércios de Feijó",
    description: "Negócios já cadastrados que ainda não se encaixam numa categoria específica. Assim que o tipo do negócio for informado, cada um vai para o seu lugar.",
    searchHint: "Nome do comércio ou produto…",
    icon: Store,
  },
};

export const marketplaceSectors: MarketplaceSector[] = businessGroups.map(group => ({
  id: group.id,
  label: group.label,
  shortLabel: group.shortLabel,
  href: group.href,
  examples: group.examples,
  ...PRESENTATION[group.id],
}));

/** As categorias que aparecem na navegação principal. "Outros comércios"
 *  existe como destino honesto para cadastros incompletos, mas não merece
 *  espaço fixo no menu ao lado de "Padarias" e "Açougues". */
export const primarySectors = marketplaceSectors.filter(sector => sector.id !== "other");

export function getMarketplaceSector(value: string | null | undefined) {
  return marketplaceSectors.find(sector => sector.id === value) || null;
}

export function SectorNavigator({ active = "all", compact = false, counts }: { active?: MarketplaceSectorId; compact?: boolean; counts?: Partial<Record<MarketplaceSectorId, number>> }) {
  const warm = () => prefetchSectorCatalog();
  return (
    <nav className={`sector-nav${compact ? " sector-nav--compact" : ""}`} aria-label="Onde comprar">
      <Link className={active === "all" ? "is-active" : ""} to="/explorar">
        <Grid2X2 />
        <span><strong>Ver tudo</strong><small>Todas as categorias</small></span>
      </Link>
      {primarySectors.map(sector => (
        <Link key={sector.id} className={active === sector.id ? "is-active" : ""} to={sector.href} onPointerEnter={warm} onFocus={warm}>
          <sector.icon />
          <span>
            <strong>{sector.shortLabel}</strong>
            <small>{counts?.[sector.id] !== undefined ? `${counts[sector.id]} ${counts[sector.id] === 1 ? "estabelecimento" : "estabelecimentos"}` : sector.examples.slice(0, 2).join(" · ")}</small>
          </span>
        </Link>
      ))}
    </nav>
  );
}

function CulturalProfiles() {
  return (
    <div className="sector-profile-grid">
      <Link to="/dorinha-barroso">
        <BookOpen />
        <span><small>AUTORA</small><strong>Dorinha Barroso</strong><p>Página dedicada para conhecer a autora e seus conteúdos culturais.</p></span>
        <ArrowRight />
      </Link>
      <Link to="/fremix-producoes">
        <Store />
        <span><small>PROJETO CULTURAL</small><strong>Fremix Produções</strong><p>Espaço próprio para iniciativas e conteúdos culturais locais.</p></span>
        <ArrowRight />
      </Link>
    </div>
  );
}

function SectorStores({ catalog, sector }: { catalog: CatalogPayload | null; sector: MarketplaceSector }) {
  if (sector.id === "books") {
    return (
      <section className="sector-real-content">
        <header><div><span>CULTURA</span><h2>Perfis com espaço próprio</h2><p>Pessoas e projetos culturais são apresentados como páginas editoriais, e não como loja de produto.</p></div></header>
        <CulturalProfiles />
      </section>
    );
  }
  if (!catalog) {
    return (
      <section className="sector-real-content">
        <div className="sector-empty-real"><span className="sector-loading-dot" /><span><strong>Carregando estabelecimentos</strong><small>Buscando quem está cadastrado nesta categoria.</small></span></div>
      </section>
    );
  }

  const stores = sectorStores(catalog, sector);
  const open = withCatalog(stores);

  if (!stores.length) {
    return (
      <section className="sector-real-content">
        <header><div><span>ESTABELECIMENTOS</span><h2>Nenhum {sector.shortLabel.toLocaleLowerCase("pt-BR")} cadastrado ainda</h2><p>Assim que um negócio desta categoria entrar na plataforma, ele aparece aqui automaticamente.</p></div></header>
        <div className="sector-empty-real">
          <Store />
          <span><strong>É o seu negócio?</strong><small><Link to="/cadastro-lojista">Cadastre gratuitamente</Link> e apareça para quem procura em Feijó.</small></span>
        </div>
      </section>
    );
  }

  return (
    <section className="sector-real-content">
      <header>
        <div>
          <span>ESTABELECIMENTOS</span>
          <h2>{stores.length} {stores.length === 1 ? "opção" : "opções"} em Feijó</h2>
          <p>{open.length ? `${open.length} com preços publicados — clique para abrir o catálogo.` : "Ainda sem preços publicados. Fale direto com o estabelecimento."}</p>
        </div>
        <Link to={`/estabelecimentos?setor=${sector.id}`}>Ver todos <ArrowRight /></Link>
      </header>
      <div className="sector-store-grid">
        {stores.slice(0, 8).map(({ store, count }) => (
          <Link to={`/estabelecimento/${store.slug || store.id}`} key={store.id} className="sector-store-card">
            <i style={{ background: store.color }}><Store /></i>
            <span>
              <small>{store.neighborhood || "Feijó"}</small>
              <strong>{store.name}</strong>
              <em>{count ? `${count} ${count === 1 ? "item com preço" : "itens com preço"}` : "Sem preços publicados"}</em>
            </span>
            <b>{count ? "VER PREÇOS" : "VER PERFIL"}</b>
            <ArrowRight />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceSectorLanding({ sector }: { sector: MarketplaceSector }) {
  const Icon = sector.icon;
  const pageRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  useEffect(() => {
    let active = true;
    void fetchSectorCatalog().then(data => { if (active) setCatalog(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const stores = catalog ? sectorStores(catalog, sector) : [];
  const productCount = catalog ? sectorProducts(catalog, sector).length : 0;

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".sector-eyebrow, .sector-hero__copy h1, .sector-hero__copy p, .sector-example-chips, .sector-hero__actions, .sector-hero > aside", { y: 16, opacity: 0, duration: .55, stagger: .06, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".sector-content > *").forEach(section => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 88%", once: true }, y: 22, opacity: 0, duration: .55, ease: "power2.out" });
    });
  }, { scope: pageRef });

  return (
    <div className={`sector-page sector-page--${sector.id}`} ref={pageRef}>
      <PublicHeader />
      <main id="conteudo-principal" className="sector-main">
        <section className="sector-hero">
          <div className="sector-shell sector-hero__grid">
            <div className="sector-hero__copy">
              <span className="sector-eyebrow"><Icon />{sector.eyebrow}</span>
              <h1>{sector.title}</h1>
              <p>{sector.description}</p>
              <div className="sector-example-chips">{sector.examples.map(example => <span key={example}>{example}</span>)}</div>
              <div className="sector-hero__actions">
                <Link to={`/buscar?setor=${sector.id}`}><Search />Pesquisar aqui</Link>
                <a href="#conteudo-local"><Store />Ver estabelecimentos</a>
              </div>
            </div>
            <aside>
              <span>NESTA CATEGORIA</span>
              <Icon />
              <strong>{sector.label}</strong>
              <div className="sector-hero__metrics">
                <b>{catalog ? stores.length : "—"}</b><small>estabelecimentos</small>
                <b>{catalog ? productCount : "—"}</b><small>itens com preço</small>
              </div>
              <p>Números do que está cadastrado hoje em Feijó.</p>
            </aside>
          </div>
        </section>
        <section className="sector-content sector-shell">
          <div id="conteudo-local"><SectorStores catalog={catalog} sector={sector} /></div>
          <div className="sector-content__heading sector-content__heading--secondary">
            <div><span>CONTINUE PROCURANDO</span><h2>Outras categorias</h2></div>
            <p>Cada tipo de comércio tem sua própria página, com os estabelecimentos que realmente pertencem a ele.</p>
          </div>
          <SectorNavigator active={sector.id} compact />
        </section>
      </main>
    </div>
  );
}
