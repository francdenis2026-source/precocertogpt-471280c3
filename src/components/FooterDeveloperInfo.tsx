import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Code2, Heart, Info, MapPin, MessageCircle, ShieldCheck, UserRound, X } from "lucide-react";
import "./FooterDeveloperInfo.css";

export function FooterDeveloperInfo() {
  const [nav, setNav] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const locate = () => setNav(document.querySelector<HTMLElement>(".ref-footer nav[aria-label='Navegação do rodapé']"));
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    {nav && createPortal(<>
      <button className="pc-footer-developer" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <UserRound aria-hidden="true" /> <span>Desenvolvedor</span>
      </button>
      <span className="pc-footer-location"><MapPin aria-hidden="true" /> Feito em Feijó-AC</span>
    </>, nav)}

    {open && createPortal(
      <div className="pc-dev-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className="pc-dev-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dev-title" aria-describedby="pc-dev-description">
          <button className="pc-dev-close" type="button" aria-label="Fechar informações do desenvolvedor" onClick={() => setOpen(false)}><X /></button>

          <header className="pc-dev-header">
            <span className="pc-dev-avatar"><UserRound aria-hidden="true" /></span>
            <div><small>SOBRE O DESENVOLVEDOR</small><h2 id="pc-dev-title">Franc D’nis</h2><p>Desenvolvedor e idealizador do PreçoCerto</p></div>
          </header>

          <p id="pc-dev-description" className="pc-dev-intro">O PreçoCerto é um projeto criado em Feijó, Acre, para organizar informações locais de preços e tornar a comparação mais clara, útil e acessível para a comunidade.</p>

          <div className="pc-dev-grid">
            <article><Info /><div><strong>Sobre o PreçoCerto</strong><p>Catálogo informativo que reúne produtos, estabelecimentos e preços locais para ajudar o consumidor a comparar antes de comprar.</p></div></article>
            <article><ShieldCheck /><div><strong>Transparência</strong><p>Quando não há venda direta habilitada, o site deixa claro que a página é apenas informativa e não representa oficialmente o estabelecimento.</p></div></article>
            <article><Code2 /><div><strong>Tecnologia</strong><p>Aplicação web construída com React, TypeScript, Vite e integração com Supabase, com foco em desempenho, responsividade e proteção dos dados.</p></div></article>
            <article><Heart /><div><strong>Compromisso local</strong><p>Projeto desenvolvido em Feijó-AC com foco em utilidade pública, economia e melhoria contínua da experiência de quem consulta preços.</p></div></article>
          </div>

          <footer className="pc-dev-footer">
            <span><MapPin /> Feijó · Acre · Brasil</span>
            <a href="/fale-conosco"><MessageCircle /> Falar pelo contato do site</a>
          </footer>
        </section>
      </div>,
      document.body,
    )}
  </>;
}
