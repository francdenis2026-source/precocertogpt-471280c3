import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, AtSign, BadgeCheck, Clock3, MapPin, MessageCircle, ShieldCheck, Store, UtensilsCrossed } from "lucide-react";
import { PublicFooter, PublicHeader } from "../reference/ReferenceExperience";
import { ProductQuickViewModal } from "../components/ProductQuickViewModal";
import type { Product } from "../data/catalog";
import {
  KELLY_ADDRESS,
  KELLY_CNPJ,
  KELLY_INSTAGRAM,
  KELLY_MENU,
  KELLY_MENU_CATEGORIES,
  KELLY_NAME,
  KELLY_NEIGHBORHOOD,
  KELLY_PHONE,
  KELLY_WHATSAPP,
  kellyItemImages,
  manualProducts,
  type MenuItem,
} from "../data/manualEstablishments";
import "./KellyBurgueriaPage.css";

gsap.registerPlugin(ScrollTrigger);

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const CATEGORY_PHOTOS: Record<string, string> = {
  "Carne na Chapa": "/kelly-burgueria/carne-chapa.jpg",
  "Bebidas": "/kelly-burgueria/bebidas.jpg",
  "Monte sua Batata": "/kelly-burgueria/fritas.jpg",
};

const CATEGORY_NOTES: Record<string, string> = {
  "Hambúrgueres": "Feitos na hora, no pão e no ponto que você pedir.",
  "Carne na Chapa": "Acompanhamento a consultar no ato do pedido.",
  "Lanches Rápidos": "Pra quem quer algo simples e rápido.",
  "Panquecas": "Recheios de frango, carne, catupiry ou cheddar.",
  "Monte sua Batata": "Porção tradicional, do jeito que a casa faz.",
  "Adicionais": "Complemente seu lanche do jeito que preferir.",
  "Bebidas": "Geladas, do jeito que combina com um bom lanche.",
  "Suco Natural": "Feito na hora.",
};

const whatsappHref = `https://wa.me/${KELLY_WHATSAPP}?text=${encodeURIComponent(`Olá! Vi o cardápio da ${KELLY_NAME} no PreçoCerto e queria fazer um pedido.`)}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${KELLY_NAME}, ${KELLY_ADDRESS}`)}`;

export function KellyBurgueriaPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of KELLY_MENU) {
      const list = byCategory.get(item.category);
      if (list) list.push(item);
      else byCategory.set(item.category, [item]);
    }
    return KELLY_MENU_CATEGORIES.map(category => ({ category, items: byCategory.get(category) || [] })).filter(group => group.items.length);
  }, []);

  // Cada item do cardápio já existe como Product completo (mesmo objeto
  // usado no catálogo unificado, em /produto/kelly-...) — mapeado por nome
  // para abrir o modal de visualização rápida ao clicar em qualquer item.
  const productByName = useMemo(() => new Map(manualProducts.map(product => [product.name, product])), []);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Entrada suave da hero (kicker, título, endereço, botões em cascata) e
  // revelação dos grupos do cardápio ao rolar a página. Respeita
  // prefers-reduced-motion (nenhuma animação roda se o usuário pediu menos
  // movimento) e usa só transform/opacity, que é o que anima sem travar em
  // celular. Cada grupo revela uma única vez (once: true) — não fica
  // reanimando ao rolar pra cima e pra baixo.
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
    <div className="ref-page kelly-page" ref={pageRef}>
      <PublicHeader current="stores" title={KELLY_NAME} logo="/branding/kelly-burgueria-logo.jpg?v=20260822" />
      <main id="conteudo-principal" className="kelly-shell">
        <Link className="kelly-back" to="/estabelecimentos"><ArrowLeft /> Todos os estabelecimentos</Link>

        <section className="kelly-hero" aria-labelledby="kelly-title">
          <div className="kelly-hero__content">
            <div className="kelly-hero__logo"><img src="/branding/kelly-burgueria-logo.jpg?v=20260822" alt={`Logomarca ${KELLY_NAME}`} width="96" height="96" /></div>
            <div className="kelly-hero__copy">
              <span className="kelly-hero__kicker"><UtensilsCrossed aria-hidden="true" /> LANCHONETE &amp; HAMBURGUERIA · FEIJÓ, ACRE</span>
              <h1 id="kelly-title">{KELLY_NAME}</h1>
              <p>Hambúrgueres artesanais, carne na chapa, panquecas e lanches rápidos, feitos na hora no bairro Bela Vista.</p>
              <div className="kelly-hero__meta">
                <span><MapPin aria-hidden="true" /> {KELLY_NEIGHBORHOOD}, Feijó · AC</span>
                <span><BadgeCheck aria-hidden="true" /> Cardápio oficial verificado</span>
              </div>
              <div className="kelly-hero__actions">
                <a className="pc-btn pc-btn--primary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Pedir pelo WhatsApp</a>
                <a className="pc-btn pc-btn--ghost" href={KELLY_INSTAGRAM} target="_blank" rel="noreferrer"><AtSign aria-hidden="true" /> @kellyburgueria</a>
              </div>
            </div>
          </div>
          <div className="kelly-hero__visual" aria-hidden="true">
            <img src="/kelly-burgueria/hero-burger.jpg" alt="" />
            <span><BadgeCheck /> Cardápio verificado</span>
          </div>
        </section>

        <section className="kelly-info" aria-label="Informações do estabelecimento">
          <a className="kelly-info__card" href={mapsHref} target="_blank" rel="noreferrer">
            <MapPin aria-hidden="true" />
            <span><strong>Endereço</strong><small>{KELLY_ADDRESS}</small></span>
          </a>
          <a className="kelly-info__card" href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" />
            <span><strong>Pedidos e contato</strong><small>WhatsApp {KELLY_PHONE}</small></span>
          </a>
          <div className="kelly-info__card kelly-info__card--static">
            <ShieldCheck aria-hidden="true" />
            <span><strong>Estabelecimento registrado</strong><small>CNPJ {KELLY_CNPJ} · Matriz</small></span>
          </div>
          <div className="kelly-info__card kelly-info__card--static">
            <Clock3 aria-hidden="true" />
            <span><strong>Produção artesanal</strong><small>Pedidos preparados na hora</small></span>
          </div>
        </section>

        <section className="kelly-catalog-intro" aria-labelledby="kelly-menu-title">
          <div>
            <span className="kelly-eyebrow">CARDÁPIO COMPLETO</span>
            <h2 id="kelly-menu-title">Escolha o que combina com a sua fome</h2>
            <p>Toque em qualquer item para ver foto, descrição e opções do produto.</p>
          </div>
          <strong>{KELLY_MENU.length} opções</strong>
        </section>

        <nav className="kelly-category-nav" aria-label="Categorias do cardápio">
          {groups.map(group => <a key={group.category} href={`#kelly-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{group.category}</a>)}
        </nav>

        <div className="kelly-notice"><BadgeCheck /><span><strong>Cardápio oficial informado pela Kelly</strong><small>Preços e disponibilidade podem mudar. Confirme as condições diretamente com o estabelecimento antes de concluir o pedido.</small></span></div>

        <div className="kelly-menu-grid">
        {groups.map(group => {
          const sectionId = `kelly-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          return (
          <section className="kelly-menu-group" id={sectionId} key={group.category} aria-labelledby={`kelly-cat-${group.category}`}>
            <header
              className="kelly-menu-group__head"
              style={CATEGORY_PHOTOS[group.category] ? { backgroundImage: `url('${CATEGORY_PHOTOS[group.category]}')` } : undefined}
            >
              <div className="kelly-menu-group__head-veil" />
              <div className="kelly-menu-group__head-copy">
                <h2 id={`kelly-cat-${group.category}`}>{group.category}</h2>
                {CATEGORY_NOTES[group.category] && <p>{CATEGORY_NOTES[group.category]}</p>}
              </div>
            </header>
            <ul className="kelly-menu-list">
              {group.items.map(item => {
                const image = kellyItemImages.get(item.name);
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
        )})}
        </div>

        <aside className="kelly-cta">
          <div>
            <h2>Bateu a fome?</h2>
            <p>Chame no WhatsApp e faça seu pedido direto com a Kelly Burgueria e Lanchonete.</p>
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
