import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { PublicFooter, PublicHeader } from "../reference/ReferenceExperience";
import {
  KELLY_ADDRESS,
  KELLY_CNPJ,
  KELLY_MENU,
  KELLY_MENU_CATEGORIES,
  KELLY_NAME,
  KELLY_PHONE,
  KELLY_WHATSAPP,
  kellyItemImages,
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

        <section className="kelly-hero kelly-hero--banner" aria-label={`${KELLY_NAME}, lanchonete e hamburgueria em Feijó`}>
          <img src="/kelly-burgueria/kelly-hero-banner.jpg?v=20260822b" alt="Kelly Burgueria — hambúrgueres artesanais, carne na chapa e panquecas em Bela Vista, Feijó" width="1600" height="600" />
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
        </section>

        <div className="kelly-notice"><BadgeCheck /><span><strong>Cardápio informativo</strong><small>Preços e itens conforme o cardápio enviado pelo estabelecimento. Confirme disponibilidade e condições diretamente com a Kelly Burgueria antes de fechar o pedido.</small></span></div>

        {groups.map(group => (
          <section className="kelly-menu-group" key={group.category} aria-labelledby={`kelly-cat-${group.category}`}>
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
                return (
                  <li key={item.name} className={image ? "has-image" : undefined}>
                    {image && <span className="kelly-menu-list__thumb"><img src={image} alt="" loading="lazy" width="64" height="64" /></span>}
                    <div className="kelly-menu-list__copy">
                      <strong>{item.name}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <span className="kelly-menu-list__price">{brl.format(item.price)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

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
    </div>
  );
}
