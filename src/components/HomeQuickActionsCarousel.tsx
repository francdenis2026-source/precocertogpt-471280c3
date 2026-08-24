import { useRef, useState, type UIEvent } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid, MapPin, Search, ShoppingBasket, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import "./HomeQuickActionsCarousel.css";

const actions = [
  { title: "Cesta inteligente", copy: "Economize no total da compra", to: "/cesta-inteligente", icon: ShoppingBasket, tone: "green" },
  { title: "Comparar preços", copy: "Encontre o menor valor local", to: "/buscar", icon: Search, tone: "blue" },
  { title: "Onde comprar", copy: "Veja comércios e catálogos", to: "/estabelecimentos", icon: MapPin, tone: "orange" },
  { title: "Ofertas em destaque", copy: "Descubra preços para comparar", to: "/buscar", icon: Tags, tone: "purple" },
  { title: "Explorar categorias", copy: "Mercados, farmácias e mais", to: "/explorar", icon: LayoutGrid, tone: "teal" },
] as const;

export function HomeQuickActionsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".hqa-card"));
    const next = Math.max(0, Math.min(index, cards.length - 1));
    cards[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActive(next);
  };

  const syncActive = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".hqa-card"));
    if (!cards.length) return;
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActive(nearest.index);
  };

  return <section className="hqa" aria-labelledby="hqa-title" aria-roledescription="carrossel">
    <div className="hqa-head">
      <div><small>ATALHOS DO PREÇOCERTO</small><h2 id="hqa-title">O que você quer fazer?</h2></div>
      <div className="hqa-controls" aria-label="Controles do carrossel">
        <button type="button" onClick={() => scrollTo(active - 1)} disabled={active === 0} aria-label="Ver opções anteriores"><ArrowLeft aria-hidden="true" /></button>
        <button type="button" onClick={() => scrollTo(active + 1)} disabled={active === actions.length - 1} aria-label="Ver próximas opções"><ArrowRight aria-hidden="true" /></button>
      </div>
    </div>
    <div className="hqa-track" ref={trackRef} onScroll={syncActive}>
      {actions.map(({ title, copy, to, icon: Icon, tone }, index) => <Link className={`hqa-card hqa-card--${tone}`} to={to} key={title} aria-label={`${title}: ${copy}`}>
        <i aria-hidden="true"><Icon /></i>
        <span><strong>{title}</strong><small>{copy}</small></span>
        <ArrowRight className="hqa-card__arrow" aria-hidden="true" />
        <em>{String(index + 1).padStart(2, "0")}</em>
      </Link>)}
    </div>
    <div className="hqa-dots" aria-label={`Opção ${active + 1} de ${actions.length}`}>
      {actions.map((action, index) => <button key={action.title} type="button" className={active === index ? "is-active" : ""} onClick={() => scrollTo(index)} aria-label={`Ir para ${action.title}`} aria-current={active === index ? "true" : undefined} />)}
    </div>
  </section>;
}
