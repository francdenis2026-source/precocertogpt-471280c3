import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP, gsap, ScrollTrigger } from "../lib/lightMotion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Grid2X2,
  Heart,
  MapPin,
  Megaphone,
  PackageSearch,
  Search,
  ShoppingBasket,
  Sparkles,
  Store,
  Tag,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { CatalogPayload, StoreRow } from "../data/catalog";
import {
  fetchSectorCatalog,
  prefetchSectorCatalog,
  sectorStores,
  withCatalog,
} from "../data/sectorCatalog";
import { primarySectors } from "./MarketplaceSectors";
import { PublicFooter, PublicHeader } from "./ReferenceExperience";
import "./SectorHub2026.css";
import "./SectorHubExperienceFixes2026.css";

gsap.registerPlugin(ScrollTrigger);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
const sponsoredIds = new Set(
  String(import.meta.env.VITE_SPONSORED_STORE_IDS || "")
    .split(",")
    .map((v: string) => normalize(v))
    .filter(Boolean),
);
function isSponsored(store: StoreRow) {
  return [store.id, store.slug, store.name].some((v) =>
    sponsoredIds.has(normalize(String(v || ""))),
  );
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export function SectorHub2026() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  useEffect(() => {
    let active = true;
    void fetchSectorCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  /* Todas as categorias principais aparecem sempre, mesmo as que ainda não têm
   * nenhum estabelecimento cadastrado: é assim que quem procura um açougue
   * descobre que o lugar dele existe — e que quem tem um açougue descobre que
   * pode se cadastrar. */
  const sectorData = useMemo(
    () =>
      primarySectors.map((sector) => {
        const stores = catalog ? sectorStores(catalog, sector) : [];
        return { sector, total: stores.length, priced: withCatalog(stores).length };
      }),
    [catalog],
  );
  const featuredStores = useMemo(() => {
    if (!catalog) return [];
    return catalog.stores
      .filter((store) => (store.products || 0) > 0)
      .sort(
        (a, b) =>
          Number(isSponsored(b)) - Number(isSponsored(a)) ||
          (b.products || 0) - (a.products || 0) ||
          a.name.localeCompare(b.name, "pt-BR"),
      )
      .slice(0, 8);
  }, [catalog]);
  const sponsoredVisible = featuredStores.some(isSponsored);

  // Entrada em cascata na hero e revelação por rolagem das demais seções, no
  // mesmo padrão usado nas outras páginas do site. O conteúdo principal já
  // existe no DOM desde a primeira renderização (só os dados do catálogo
  // trocam depois), então roda uma única vez no mount, sem depender do
  // carregamento. Respeita prefers-reduced-motion e anima só transform/opacity.
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(
      ".sector-hub__eyebrow, .sector-hub__hero-copy h1, .sector-hub__hero-copy>p, .sector-hub__hero-stats",
      { y: 16, opacity: 0, duration: .6, stagger: .06, ease: "power3.out" },
    );
    gsap.utils
      .toArray<HTMLElement>([
        ".sector-hub__tools",
        ".sector-hub__stores",
        ".sector-hub__special",
        ".sector-hub__how",
      ])
      .forEach((section) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%", once: true },
          y: 22,
          opacity: 0,
          duration: .55,
          ease: "power2.out",
        });
      });
    gsap.utils
      .toArray<HTMLElement>([
        ".sector-hub__sectors",
        ".sector-hub__tool-grid",
        ".sector-hub__store-grid",
      ])
      .forEach((grid) => {
        gsap.from(grid.children, {
          scrollTrigger: { trigger: grid, start: "top 85%", once: true },
          y: 18,
          opacity: 0,
          duration: .5,
          stagger: .06,
          ease: "power2.out",
        });
      });
  }, { scope: pageRef });

  return (
    <div className="sector-hub" ref={pageRef}>
      <PublicHeader backOnly />
      <main id="conteudo-principal">
        <section className="sector-hub__hero">
          <div className="sector-hub__shell sector-hub__hero-grid">
            <div className="sector-hub__hero-copy">
              <span className="sector-hub__eyebrow">
                <Grid2X2 />
                GUIA DO COMÉRCIO DE FEIJÓ
              </span>
              <h1>
                Onde comprar <em>em Feijó</em>
              </h1>
              <p>
                Escolha o tipo de comércio que você procura e veja quem vende,
                onde fica e por quanto — antes de sair de casa.
              </p>
              <div className="sector-hub__hero-stats">
                <span>
                  <b>{catalog?.metrics.stores ?? "—"}</b> estabelecimentos na
                  cidade
                </span>
                <span>
                  <b>{catalog?.metrics.products ?? "—"}</b> produtos com preço
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="sector-hub__content sector-hub__shell">
          <header id="setores" className="sector-hub__section-head">
            <div>
              <span>Categorias</span>
              <h2>O que você está procurando?</h2>
            </div>
            <p>
              Toque em uma categoria para ver a lista dos estabelecimentos de
              Feijó, com endereço e os preços já publicados.
            </p>
          </header>
          <div className="sector-hub__sectors">
            {sectorData.map(({ sector, total, priced }) => {
              const Icon = sector.icon;
              const body = (
                <div className="sector-hub__sector-copy">
                  <small>{sector.shortLabel}</small>
                  <strong>{sector.label}</strong>
                  <p>{sector.description}</p>
                  {total > 0 ? (
                    <div className="sector-hub__sector-meta">
                      <span>
                        <Store />
                        {plural(total, "estabelecimento", "estabelecimentos")}
                      </span>
                      <span>
                        <Tag />
                        {priced > 0
                          ? `${priced} com preços`
                          : "preços em breve"}
                      </span>
                    </div>
                  ) : (
                    <p className="sector-hub__sector-invite">
                      Ainda sem cadastro —{" "}
                      <Link to="/cadastro-lojista">cadastre o seu</Link>
                    </p>
                  )}
                  <div className="sector-hub__sector-examples">
                    {sector.examples.map((example) => (
                      <span key={example}>{example}</span>
                    ))}
                  </div>
                </div>
              );
              if (total === 0) {
                return (
                  <div
                    key={sector.id}
                    className={`sector-hub__sector sector-hub__sector--${sector.id} sector-hub__sector--empty`}
                  >
                    <div className="sector-hub__sector-icon">
                      <Icon />
                    </div>
                    {body}
                    <Link
                      className="sector-hub__sector-link"
                      to={sector.href}
                      onPointerEnter={prefetchSectorCatalog}
                      onFocus={prefetchSectorCatalog}
                      aria-label={`Ver ${sector.label}`}
                    >
                      <ArrowRight className="sector-hub__arrow" />
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={sector.id}
                  to={sector.href}
                  onPointerEnter={prefetchSectorCatalog}
                  onFocus={prefetchSectorCatalog}
                  className={`sector-hub__sector sector-hub__sector--${sector.id}`}
                >
                  <div className="sector-hub__sector-icon">
                    <Icon />
                  </div>
                  {body}
                  <ArrowRight className="sector-hub__arrow" />
                </Link>
              );
            })}
          </div>
          <section className="sector-hub__tools">
            <div className="sector-hub__tools-copy">
              <span>Ferramentas</span>
              <h2>Pesquise, compare e planeje.</h2>
              <p>
                Procure por produto ou pelo nome da loja, monte a lista do mês e
                guarde o que você compra sempre.
              </p>
            </div>
            <div className="sector-hub__tool-grid">
              <Link to="/buscar">
                <Search />
                <span>
                  <strong>Busca</strong>
                  <small>Ache um produto ou uma loja.</small>
                </span>
                <ArrowRight />
              </Link>
              <Link to="/cesta-inteligente">
                <Sparkles />
                <span>
                  <strong>Cesta Inteligente</strong>
                  <small>Monte a compra pelo seu dinheiro.</small>
                </span>
                <ArrowRight />
              </Link>
              <Link to="/cesta-basica">
                <ShoppingBasket />
                <span>
                  <strong>Lista de compras</strong>
                  <small>Anote tudo que falta em casa.</small>
                </span>
                <ArrowRight />
              </Link>
              <Link to="/favoritos">
                <Heart />
                <span>
                  <strong>Favoritos</strong>
                  <small>Guarde o que você compra sempre.</small>
                </span>
                <ArrowRight />
              </Link>
            </div>
          </section>
          <section className="sector-hub__stores">
            <header>
              <div>
                <span>Negócios locais</span>
                <h2>Lojas que já publicaram preços.</h2>
              </div>
              <Link to="/estabelecimentos">
                Ver todos os estabelecimentos <ArrowRight />
              </Link>
            </header>
            {featuredStores.length ? (
              <>
                <div className="sector-hub__store-grid">
                  {featuredStores.map((store) => {
                    const sponsored = isSponsored(store);
                    return (
                      <Link
                        key={store.id}
                        className={sponsored ? "is-sponsored" : undefined}
                        to={`/estabelecimento/${store.slug || store.id}`}
                      >
                        {sponsored && (
                          <em className="sector-hub__sponsor-badge">
                            <Megaphone />
                            Patrocinado
                          </em>
                        )}
                        <i style={{ background: store.color }}>
                          <Store />
                        </i>
                        <span>
                          <small>{store.neighborhood || "Feijó"}</small>
                          <strong>{store.name}</strong>
                          <em>
                            {plural(
                              store.products || 0,
                              "item com preço",
                              "itens com preço",
                            )}
                          </em>
                        </span>
                        <b>VER PREÇOS</b>
                        <ArrowRight />
                      </Link>
                    );
                  })}
                </div>
                {sponsoredVisible && (
                  <p className="sector-hub__sponsor-note">
                    <Megaphone /> Conteúdo patrocinado recebe identificação
                    visível e não altera preços nem comparação.
                  </p>
                )}
              </>
            ) : (
              <div className="sector-hub__empty">
                <PackageSearch />
                <span>
                  <strong>Nenhuma loja publicou preços ainda</strong>
                  <small>
                    Assim que um estabelecimento publicar o catálogo dele, ele
                    aparece aqui.
                  </small>
                </span>
              </div>
            )}
          </section>
          <section className="sector-hub__special">
            <article>
              <BookOpen />
              <span>
                <small>CULTURA</small>
                <strong>Livros, autores e projetos culturais</strong>
                <p>
                  Conheça quem escreve, publica e produz cultura em Feijó.
                </p>
                <Link to="/livros">
                  Ver livros e autores <ArrowRight />
                </Link>
              </span>
            </article>
            <article>
              <BriefcaseBusiness />
              <span>
                <small>SERVIÇOS</small>
                <strong>Profissionais e prestadores de serviço</strong>
                <p>
                  Quem faz o serviço, onde atende e como falar direto com a
                  pessoa.
                </p>
                <Link to="/servicos">
                  Ver serviços <ArrowRight />
                </Link>
              </span>
            </article>
          </section>
          <section className="sector-hub__how">
            <div>
              <Grid2X2 />
              <span>
                <small>01 · ESCOLHA</small>
                <strong>Abra a categoria do que você precisa</strong>
              </span>
            </div>
            <div>
              <TrendingDown />
              <span>
                <small>02 · COMPARE</small>
                <strong>Veja o preço de cada loja lado a lado</strong>
              </span>
            </div>
            <div>
              <MapPin />
              <span>
                <small>03 · VÁ</small>
                <strong>Compre onde for mais perto ou mais barato</strong>
              </span>
            </div>
          </section>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
