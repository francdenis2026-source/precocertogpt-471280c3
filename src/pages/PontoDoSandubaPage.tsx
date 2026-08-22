import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, MessageCircle, ShieldCheck, Store, UtensilsCrossed } from "lucide-react";
import { PublicFooter, PublicHeader } from "../reference/ReferenceExperience";
import {
  SANDUBA_ADDRESS,
  SANDUBA_MENU,
  SANDUBA_MENU_CATEGORIES,
  SANDUBA_NAME,
  SANDUBA_NEIGHBORHOOD,
  SANDUBA_PHONE,
  SANDUBA_WHATSAPP,
  sandubaItemImages,
  type MenuItem,
} from "../data/manualEstablishments2";
import "./KellyBurgueriaPage.css";
import "./PontoDoSandubaPage.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// As fotos de fundo do cardápio original trazem preços impressos junto (o
// próprio layout do cardápio sobrepõe texto às fotos), então diferente da
// Kelly Burgueria, aqui os grupos usam o fundo sólido padrão para não
// mostrar um preço "fantasma" errado por trás do título da seção.
const CATEGORY_PHOTOS: Record<string, string> = {};

const CATEGORY_NOTES: Record<string, string> = {
  "Sanduíches": "Feitos na hora, no pão e no ponto que você pedir.",
  "Adicionais": "Complemente seu lanche do jeito que preferir.",
  "Refrigerantes": "Geladinhos, prontos pra acompanhar o pedido.",
  "Suco Natural": "Feito na hora.",
};

const whatsappHref = `https://wa.me/${SANDUBA_WHATSAPP}?text=${encodeURIComponent(`Olá! Vi o cardápio do ${SANDUBA_NAME} no PreçoCerto e queria fazer um pedido.`)}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SANDUBA_NAME}, ${SANDUBA_ADDRESS}`)}`;

export function PontoDoSandubaPage() {
  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of SANDUBA_MENU) {
      const list = byCategory.get(item.category);
      if (list) list.push(item);
      else byCategory.set(item.category, [item]);
    }
    return SANDUBA_MENU_CATEGORIES.map(category => ({ category, items: byCategory.get(category) || [] })).filter(group => group.items.length);
  }, []);

  return (
    <div className="ref-page kelly-page sanduba-page">
      <PublicHeader current="stores" title={SANDUBA_NAME} logo="/branding/ponto-do-sanduba-logo.jpg?v=20260822" />
      <main id="conteudo-principal" className="kelly-shell">
        <Link className="kelly-back" to="/estabelecimentos"><ArrowLeft /> Todos os estabelecimentos</Link>

        <section className="kelly-hero sanduba-hero" aria-labelledby="sanduba-title">
          <div className="kelly-hero__overlay" />
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
        </section>

        <div className="kelly-notice"><BadgeCheck /><span><strong>Cardápio informativo</strong><small>Preços e itens conforme o cardápio enviado pelo estabelecimento. Confirme disponibilidade e condições diretamente com o Ponto do Sanduba antes de fechar o pedido.</small></span></div>

        {groups.map(group => (
          <section className="kelly-menu-group" key={group.category} aria-labelledby={`sanduba-cat-${group.category}`}>
            <header
              className="kelly-menu-group__head"
              style={CATEGORY_PHOTOS[group.category] ? { backgroundImage: `url('${CATEGORY_PHOTOS[group.category]}')` } : undefined}
            >
              <div className="kelly-menu-group__head-veil" />
              <div className="kelly-menu-group__head-copy">
                <h2 id={`sanduba-cat-${group.category}`}>{group.category}</h2>
                {CATEGORY_NOTES[group.category] && <p>{CATEGORY_NOTES[group.category]}</p>}
              </div>
            </header>
            <ul className="kelly-menu-list">
              {group.items.map(item => {
                const image = sandubaItemImages.get(item.name);
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
            <p>Chame no WhatsApp e faça seu pedido direto com o Ponto do Sanduba.</p>
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
