import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, BadgeCheck, Citrus, Clock3, CupSoda, MapPin, MessageCircle, Plus, Sandwich, ShieldCheck, Store, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "../reference/ReferenceExperience";
import { ProductQuickViewModal } from "../components/ProductQuickViewModal";
import type { Product } from "../data/catalog";
import {
  SANDUBA_ADDRESS,
  SANDUBA_MENU,
  SANDUBA_MENU_CATEGORIES,
  SANDUBA_NAME,
  SANDUBA_NEIGHBORHOOD,
  SANDUBA_PHONE,
  SANDUBA_WHATSAPP,
  sandubaItemImages,
  sandubaProducts,
  type MenuItem,
} from "../data/manualEstablishments2";
import "./KellyBurgueriaPage.css";
import "./PontoDoSandubaPage.css";

gsap.registerPlugin(ScrollTrigger);

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// As fotos de fundo do cardápio original trazem preços impressos junto (o
// próprio layout do cardápio sobrepõe texto às fotos), então diferente da
// Kelly Burgueria, aqui os grupos usam o fundo sólido padrão para não
// mostrar um preço "fantasma" errado por trás do título da seção.
const CATEGORY_PHOTOS: Record<string, string> = {};

const CATEGORY_ICONS: Record<string, ReactNode> = {
  "Sanduíches": <Sandwich aria-hidden="true" />,
  "Adicionais": <Plus aria-hidden="true" />,
  "Refrigerantes": <CupSoda aria-hidden="true" />,
  "Suco Natural": <Citrus aria-hidden="true" />,
};

const CATEGORY_NOTES: Record<string, string> = {
  "Sanduíches": "Feitos na hora, no pão e no ponto que você pedir.",
  "Adicionais": "Complemente seu lanche do jeito que preferir.",
  "Refrigerantes": "Geladinhos, prontos pra acompanhar o pedido.",
  "Suco Natural": "Feito na hora.",
};

const whatsappHref = `https://wa.me/${SANDUBA_WHATSAPP}?text=${encodeURIComponent(`Olá! Vi o cardápio do ${SANDUBA_NAME} no PreçoCerto e queria fazer um pedido.`)}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SANDUBA_NAME}, ${SANDUBA_ADDRESS}`)}`;

export function PontoDoSandubaPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of SANDUBA_MENU) {
      const list = byCategory.get(item.category);
      if (list) list.push(item);
      else byCategory.set(item.category, [item]);
    }
    return SANDUBA_MENU_CATEGORIES.map(category => ({ category, items: byCategory.get(category) || [] })).filter(group => group.items.length);
  }, []);

  // Mesmo padrão da página da Kelly Burgueria: cada item já existe como
  // Product completo (mesmo objeto do catálogo unificado, em
  // /produto/sanduba-...), mapeado por nome para abrir o modal de
  // visualização rápida ao clicar em qualquer item do cardápio.
  const productByName = useMemo(() => new Map(sandubaProducts.map(product => [product.name, product])), []);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Mesmo tratamento de movimento da página da Kelly Burgueria (ver
  // comentário lá): entrada em cascata na hero, cartões de info e grupos do
  // cardápio revelando ao rolar, tudo desligado se o usuário preferir menos
  // movimento.
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(".kelly-hero__logo, .kelly-hero__copy > *", { y: 18, opacity: 0, duration: .6, stagger: .06, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".kelly-info__card, .kelly-notice").forEach((el, index) => {
      gsap.from(el, { y: 14, opacity: 0, duration: .5, delay: .1 + index * .04, ease: "power2.out" });
    });
    gsap.utils.toArray<HTMLElement>(".kelly-menu-group, .kelly-cta").forEach((section) => {
      gsap.from(section, { scrollTrigger: { trigger: section, start: "top 90%", once: true }, y: 22, opacity: 0, duration: .55, ease: "power2.out" });
    });
  }, { scope: pageRef });

  return (
    <div className="ref-page kelly-page sanduba-page" ref={pageRef}>
      <PublicHeader current="stores" title={SANDUBA_NAME} logo="/branding/ponto-do-sanduba-logo.jpg?v=20260822" />
      <main id="conteudo-principal" className="kelly-shell">
        <Link className="kelly-back" to="/estabelecimentos"><ArrowLeft /> Todos os estabelecimentos</Link>

        <section className="kelly-hero sanduba-hero" aria-labelledby="sanduba-title">
          <div className="kelly-hero__content">
            <div className="kelly-hero__logo"><img src="/branding/ponto-do-sanduba-logo.jpg?v=20260822" alt={`Logomarca ${SANDUBA_NAME}`} width="96" height="96" /></div>
            <div className="kelly-hero__copy">
              <span className="kelly-hero__kicker"><UtensilsCrossed aria-hidden="true" /> LANCHONETE &amp; HAMBURGUERIA · FEIJÓ, ACRE</span>
              <h1 id="sanduba-title">{SANDUBA_NAME}</h1>
              <p>X-tudo, sanduíches especiais e lanches rápidos, no Centro de Feijó.</p>
              <div className="kelly-hero__meta">
                <span><MapPin aria-hidden="true" /> {SANDUBA_NEIGHBORHOOD}, Feijó · AC</span>
                <span><BadgeCheck aria-hidden="true" /> Cardápio oficial verificado</span>
              </div>
              <div className="kelly-hero__actions">
                <a className="pc-btn pc-btn--primary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Pedir pelo WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="kelly-hero__visual" aria-hidden="true">
            <img src="/ponto-do-sanduba/hero-burgers.jpg" alt="" />
            <span><BadgeCheck /> Sabor feito na hora</span>
          </div>
        </section>

        <section className="kelly-info" aria-label="Informações do estabelecimento">
          <a className="kelly-info__card" href={mapsHref} target="_blank" rel="noreferrer">
            <MapPin aria-hidden="true" />
            <span><strong>Endereço</strong><small>{SANDUBA_ADDRESS}</small></span>
          </a>
          <a className="kelly-info__card" href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" />
            <span><strong>Pedidos e contato</strong><small>WhatsApp {SANDUBA_PHONE}</small></span>
          </a>
          <div className="kelly-info__card kelly-info__card--static">
            <ShieldCheck aria-hidden="true" />
            <span><strong>Estabelecimento cadastrado</strong><small>Hamburgueria · Centro de Feijó</small></span>
          </div>
          <div className="kelly-info__card kelly-info__card--static">
            <Clock3 aria-hidden="true" />
            <span><strong>Preparo na hora</strong><small>Lanches montados após o pedido</small></span>
          </div>
        </section>

        <section className="kelly-catalog-intro" aria-labelledby="sanduba-menu-title">
          <div>
            <span className="kelly-eyebrow">CARDÁPIO COMPLETO</span>
            <h2 id="sanduba-menu-title">Do clássico ao sanduíche completo</h2>
            <p>Escolha uma categoria e toque no item para conferir todos os detalhes.</p>
          </div>
          <strong>{SANDUBA_MENU.length} opções</strong>
        </section>

        <nav className="kelly-category-nav" aria-label="Categorias do cardápio">
          {groups.map(group => <a key={group.category} href={`#sanduba-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{group.category}<small>{group.items.length}</small></a>)}
        </nav>

        <div className="kelly-notice"><BadgeCheck /><span><strong>Cardápio informado pelo Ponto do Sanduba</strong><small>Preços e disponibilidade podem mudar. Confirme as condições diretamente com o estabelecimento antes de concluir o pedido.</small></span></div>

        <div className="kelly-menu-grid">
        {groups.map(group => (
          <section className="kelly-menu-group" id={`sanduba-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={group.category} aria-labelledby={`sanduba-cat-${group.category}`}>
            <header
              className="kelly-menu-group__head"
              style={CATEGORY_PHOTOS[group.category] ? { backgroundImage: `url('${CATEGORY_PHOTOS[group.category]}')` } : undefined}
            >
              <div className="kelly-menu-group__head-veil" />
              <div className="kelly-menu-group__head-copy">
                <span className="kelly-menu-group__head-icon">{CATEGORY_ICONS[group.category] || <UtensilsCrossed aria-hidden="true" />}</span>
                <h2 id={`sanduba-cat-${group.category}`}>{group.category}</h2>
                {CATEGORY_NOTES[group.category] && <p>{CATEGORY_NOTES[group.category]}</p>}
              </div>
            </header>
            <ul className="kelly-menu-list">
              {group.items.map(item => {
                const image = sandubaItemImages.get(item.name);
                const product = productByName.get(item.name);
                return (
                  <li key={item.name} className={image ? "has-image" : undefined}>
                    <button
                      type="button"
                      className="kelly-menu-list__item-btn"
                      onClick={() => product && setActiveProduct(product)}
                      aria-haspopup="dialog"
                    >
                      {image && <span className="kelly-menu-list__thumb"><img src={image} alt="" loading="lazy" width="64" height="64" /></span>}
                      <span className="kelly-menu-list__copy">
                        <strong>{item.name}</strong>
                        {item.description && <p>{item.description}</p>}
                      </span>
                      <span className="kelly-menu-list__price">{brl.format(item.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        </div>

        <aside className="kelly-cta">
          <div>
            <h2>Bateu a fome?</h2>
            <p>Chame no WhatsApp e faça seu pedido direto com o Ponto do Sanduba.</p>
          </div>
          <div className="kelly-cta__actions">
            <a className="pc-btn pc-btn--primary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Chamar no WhatsApp</a>
            <Link className="pc-btn pc-btn--ghost" to="/estabelecimentos"><Store aria-hidden="true" /> Ver outros estabelecimentos <ArrowRight aria-hidden="true" /></Link>
          </div>
        </aside>
      </main>
      <PublicFooter />
      {activeProduct && <ProductQuickViewModal product={activeProduct} onClose={() => setActiveProduct(null)} />}
    </div>
  );
}
