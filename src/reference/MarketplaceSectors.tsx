import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Croissant, Grid2X2, HeartPulse, MapPin, Pill, Plus, Sandwich, Scale, ShieldCheck, ShoppingBasket, Store, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { CatalogPayload } from "../data/catalog";
import { businessGroups, type BusinessGroupId } from "../data/businessTaxonomy";
import { fetchSectorCatalog, prefetchSectorCatalog, sectorStores } from "../data/sectorCatalog";
import { getStoreLogoUrl } from "../data/storeLogos";
import { PublicHeader } from "./ReferenceExperience";
import "./PharmacyDirectory.css";
import "./CulturalProfiles.css";

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

function PharmacyStoreMark({ name, color }: { name: string; color: string }) {
  const [failed, setFailed] = useState(false);
  const logo = getStoreLogoUrl(name);
  const showLogo = Boolean(logo) && !failed;
  return <i className={`pharmacy-establishment__mark${showLogo ? " has-logo" : ""}`} style={{ "--store-color": color } as CSSProperties}>
    {showLogo ? <img src={logo} alt="" loading="lazy" onError={() => setFailed(true)} /> : <Plus aria-hidden="true" />}
  </i>;
}

function CompactSectorDirectory({ catalog, sector }: { catalog: CatalogPayload | null; sector: MarketplaceSector }) {
  const Icon = sector.icon;
  const stores = catalog ? sectorStores(catalog, sector) : [];
  const isPharmacy = sector.id === "pharmacies";
  return <div className={`pharmacy-directory-page${isPharmacy ? " pharmacy-directory-page--pharmacies" : ""}`}>
    <PublicHeader backOnly title={sector.shortLabel} />
    <main id="conteudo-principal" className="pharmacy-directory">
      {isPharmacy ? <header className="pharmacy-directory__hero">
        <div className="pharmacy-directory__hero-copy">
          <span><HeartPulse aria-hidden="true" /> SAÚDE PERTO DE VOCÊ</span>
          <h1>Farmácias em Feijó</h1>
          <p>Encontre estabelecimentos cadastrados, confira a disponibilidade do catálogo e acesse as informações de cada farmácia.</p>
          <div className="pharmacy-directory__hero-meta">
            <strong><ShieldCheck aria-hidden="true" /> Perfis ativos na plataforma</strong>
            <small aria-live="polite">{catalog ? `${stores.length} ${stores.length === 1 ? "estabelecimento" : "estabelecimentos"}` : "Atualizando diretório"}</small>
          </div>
        </div>
      </header> : <header className="pharmacy-directory__heading">
        <div>
          <span><Icon aria-hidden="true" /> {sector.eyebrow}</span>
          <h1>{sector.shortLabel}</h1>
        </div>
        <p aria-live="polite">{sector.id === "books" ? "2 perfis culturais" : catalog ? `${stores.length} ${stores.length === 1 ? "estabelecimento ativo" : "estabelecimentos ativos"}` : "Carregando estabelecimentos"}</p>
      </header>}

      {isPharmacy && <div className="pharmacy-directory__list-heading"><div><span>DIRETÓRIO LOCAL</span><h2>Estabelecimentos cadastrados</h2></div><p>Informações disponíveis no PreçoCerto</p></div>}

      {sector.id === "books" ? <CulturalProfiles /> : !catalog ? <section className="pharmacy-directory__state" aria-busy="true">
        <span className="pharmacy-directory__loader" />
        <strong>Buscando estabelecimentos cadastrados…</strong>
      </section> : stores.length ? <section className="pharmacy-directory__list" aria-label={`${sector.shortLabel} ativos em Feijó`}>
        {stores.map(({ store, count }) => {
          return <article className="pharmacy-establishment" key={store.id}>
          {isPharmacy ? <PharmacyStoreMark name={store.name} color={store.color} /> : <i className="pharmacy-establishment__mark" style={{ "--store-color": store.color } as CSSProperties}><Icon aria-hidden="true" /></i>}
          <div className="pharmacy-establishment__identity">
            <span>{isPharmacy ? <ShieldCheck aria-hidden="true" /> : <BadgeCheck aria-hidden="true" />} ESTABELECIMENTO ATIVO</span>
            <h2>{store.name}</h2>
            <p><MapPin aria-hidden="true" /> {store.neighborhood || "Feijó, Acre"}</p>
          </div>
          <div className="pharmacy-establishment__catalog">
            <small>CATÁLOGO</small>
            <strong>{count ? `${count} ${count === 1 ? "item publicado" : "itens publicados"}` : "Perfil disponível"}</strong>
          </div>
          <Link className="pharmacy-establishment__action" to={`/estabelecimento/${store.slug || store.id}`}>
            Abrir estabelecimento <ArrowRight aria-hidden="true" />
          </Link>
        </article>})}
      </section> : <section className="pharmacy-directory__state">
        <Icon aria-hidden="true" />
        <strong>Nenhum estabelecimento ativo nesta categoria.</strong>
      </section>}
    </main>
  </div>;
}

export function MarketplaceSectorLanding({ sector }: { sector: MarketplaceSector }) {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  useEffect(() => {
    let active = true;
    void fetchSectorCatalog().then(data => { if (active) setCatalog(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <CompactSectorDirectory catalog={catalog} sector={sector} />;
}
