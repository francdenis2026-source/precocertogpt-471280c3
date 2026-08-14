import { useEffect, useState } from "react";
import { Code2, ExternalLink, Mail, MapPin, MessageCircle, ShoppingBag, Store, Users, X } from "lucide-react";
import "./DeveloperMarketplaceAbout.css";

export function DeveloperMarketplaceAbout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("precocerto:developer-about", onOpen);
    return () => window.removeEventListener("precocerto:developer-about", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="pc-about-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="pc-about-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pc-about-title">
        <button className="pc-about-modal__close" type="button" aria-label="Fechar" onClick={() => setOpen(false)}><X /></button>
        <header className="pc-about-modal__hero">
          <div className="pc-about-modal__mark"><ShoppingBag /></div>
          <div><span>PreçoCerto · Feijó, Acre</span><h2 id="pc-about-title">Um marketplace local feito para aproximar pessoas e comércios.</h2><p>Uma plataforma digital pensada para tornar mais simples descobrir produtos, comparar opções e fortalecer as vendas locais.</p></div>
        </header>

        <div className="pc-about-modal__body">
          <section className="pc-about-modal__section">
            <span className="pc-about-modal__eyebrow">Sobre o PreçoCerto</span>
            <h3>Tecnologia útil para o comércio da nossa cidade.</h3>
            <p>O PreçoCerto está evoluindo para um marketplace local de Feijó. A proposta é reunir consumidores e estabelecimentos em um ambiente digital conveniente, onde as pessoas possam encontrar produtos, conhecer lojas, comparar alternativas e acessar novas formas de comprar localmente.</p>
            <div className="pc-about-modal__features">
              <div><Store /><strong>Comércio local</strong><span>Mais presença digital para estabelecimentos de Feijó.</span></div>
              <div><Users /><strong>Feito para pessoas</strong><span>Uma experiência simples para pesquisar e decidir melhor.</span></div>
              <div><ShoppingBag /><strong>Marketplace próximo</strong><span>Produtos e negócios da cidade reunidos em um só lugar.</span></div>
            </div>
          </section>

          <aside className="pc-about-modal__developer">
            <div className="pc-about-modal__avatar"><Code2 /></div>
            <span>Desenvolvedor</span>
            <h3>Franc D’nis</h3>
            <p className="pc-about-modal__location"><MapPin /> Feijó, Acre</p>
            <p>Franc D’nis é morador de Feijó e desenvolveu o PreçoCerto a partir das necessidades locais, com o objetivo de oferecer à população e aos comerciantes uma ferramenta de venda e descoberta digital mais eficaz, conveniente e conectada à realidade da cidade.</p>
            <div className="pc-about-modal__contacts">
              <a href="mailto:precocerto-fj@proton.me"><Mail /><span><small>E-mail</small>precocerto-fj@proton.me</span><ExternalLink /></a>
              <a href="https://wa.me/5568992031340" target="_blank" rel="noreferrer"><MessageCircle /><span><small>WhatsApp</small>(68) 99203-1340</span><ExternalLink /></a>
            </div>
          </aside>
        </div>
        <footer className="pc-about-modal__footer"><span>Desenvolvido localmente, pensando em Feijó.</span><button type="button" onClick={() => setOpen(false)}>Continuar no PreçoCerto</button></footer>
      </section>
    </div>
  );
}
