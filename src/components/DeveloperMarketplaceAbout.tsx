import { useEffect, useState } from "react";
import { Code2, Mail, MapPin, MessageCircle, ShoppingBag, Store, Users, X } from "lucide-react";
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
          <div><h2 id="pc-about-title">Comércio local mais perto de você.</h2><p>Descubra produtos, compare opções e fortaleça os negócios de Feijó.</p></div>
        </header>

        <div className="pc-about-modal__body">
          <section className="pc-about-modal__section">
            <h3>O PreçoCerto conecta Feijó.</h3>
            <p>Um marketplace para encontrar produtos, conhecer estabelecimentos e comparar alternativas da cidade com praticidade.</p>
            <ul className="pc-about-modal__features">
              <li><Store /><strong>Comércio local</strong><span>Mais presença digital para estabelecimentos de Feijó.</span></li>
              <li><Users /><strong>Escolhas simples</strong><span>Pesquisa direta para decidir melhor.</span></li>
              <li><ShoppingBag /><strong>Tudo por perto</strong><span>Produtos e negócios em um só lugar.</span></li>
            </ul>
          </section>

          <aside className="pc-about-modal__developer">
            <div className="pc-about-modal__developer-head"><div className="pc-about-modal__avatar"><Code2 /></div><div><span className="pc-about-modal__developer-label">Desenvolvedor</span><h3>Franc D’nis</h3><p className="pc-about-modal__location"><MapPin /> Feijó, Acre</p></div></div>
            <p>Criado por um morador de Feijó para tornar a venda e a descoberta de produtos locais mais simples e conectadas à realidade da cidade.</p>
            <div className="pc-about-modal__contacts">
              <a href="mailto:precocerto-fj@proton.me"><Mail /><span><small>E-mail</small>precocerto-fj@proton.me</span></a>
              <a href="https://wa.me/5568992031340" target="_blank" rel="noreferrer"><MessageCircle /><span><small>WhatsApp</small>(68) 99203-1340</span></a>
            </div>
          </aside>
        </div>
        <footer className="pc-about-modal__footer"><span>Desenvolvido em Feijó, para Feijó.</span><button type="button" onClick={() => setOpen(false)}>Voltar ao PreçoCerto</button></footer>
      </section>
    </div>
  );
}
