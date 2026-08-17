import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Code2, Heart, Info, Mail, MapPin, MessageCircle, ShieldCheck, ShoppingBag, Store, UserRound, X } from "lucide-react";
import "./FooterDeveloperInfo.css";

type OpenPanel = "developer" | "contact" | null;

export function FooterDeveloperInfo() {
  const [nav, setNav] = useState<HTMLElement | null>(null);
  const [mobileMenu, setMobileMenu] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<OpenPanel>(null);

  useEffect(() => {
    const locate = () => {
      setNav(document.querySelector<HTMLElement>(".ref-footer nav[aria-label='Navegação do rodapé']"));
      setMobileMenu(document.querySelector<HTMLElement>(".ref-mobile-menu"));
    };
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const openDeveloperFromMobile = () => {
    setOpen("developer");
    const menuButton = document.querySelector<HTMLButtonElement>(".ref-menu[aria-expanded='true']");
    menuButton?.click();
  };

  return <>
    {nav && createPortal(<>
      <button className="pc-footer-contact" type="button" onClick={() => setOpen("contact")} aria-haspopup="dialog">
        <MessageCircle aria-hidden="true" /> <span>Contato</span>
      </button>
      <button className="pc-footer-developer" type="button" onClick={() => setOpen("developer")} aria-haspopup="dialog">
        <UserRound aria-hidden="true" /> <span>Desenvolvedor</span>
      </button>
      <span className="pc-footer-location"><MapPin aria-hidden="true" /> Feito em Feijó-AC</span>
    </>, nav)}

    {mobileMenu && createPortal(
      <button className="pc-mobile-developer" type="button" onClick={openDeveloperFromMobile} aria-haspopup="dialog">
        <UserRound aria-hidden="true" />
        <span><strong>Sobre o desenvolvedor</strong><small>Conheça o projeto e quem criou o PreçoCerto</small></span>
      </button>,
      mobileMenu,
    )}

    {open === "contact" && createPortal(
      <div className="pc-dev-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(null); }}>
        <section className="pc-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-contact-title">
          <button className="pc-dev-close" type="button" aria-label="Fechar contato" onClick={() => setOpen(null)}><X /></button>
          <span className="pc-contact-icon"><Mail aria-hidden="true" /></span>
          <div className="pc-contact-copy"><small>CANAL OFICIAL</small><h2 id="pc-contact-title">Fale com o PreçoCerto</h2><p>Dúvidas, sugestões, parcerias, informações sobre lojas virtuais ou suporte à plataforma.</p></div>
          <a className="pc-contact-email" href="mailto:precocerto-fj@proton.me"><Mail /> <span><small>E-mail</small><strong>precocerto-fj@proton.me</strong></span></a>
          <p className="pc-contact-note"><ShieldCheck /> Utilize este endereço para contatos relacionados ao PreçoCerto.</p>
        </section>
      </div>,
      document.body,
    )}

    {open === "developer" && createPortal(
      <div className="pc-dev-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(null); }}>
        <section className="pc-dev-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-dev-title" aria-describedby="pc-dev-description">
          <button className="pc-dev-close" type="button" aria-label="Fechar informações" onClick={() => setOpen(null)}><X /></button>

          <header className="pc-dev-header">
            <span className="pc-dev-avatar"><Store aria-hidden="true" /></span>
            <div><small>PREÇOCERTO · MARKETPLACE LOCAL</small><h2 id="pc-dev-title">Comércio local em uma plataforma própria.</h2><p>Catálogo, lojas virtuais, gestão de vendas e comparação de preços em um só ecossistema.</p></div>
          </header>

          <p id="pc-dev-description" className="pc-dev-intro">O PreçoCerto nasceu em Feijó-AC para aproximar consumidores, comerciantes e prestadores locais. Além da comparação de preços, a plataforma evolui como marketplace: cada negócio pode criar sua própria loja virtual, organizar produtos e administrar sua presença e suas vendas dentro do ecossistema.</p>

          <div className="pc-dev-grid">
            <article><ShoppingBag /><div><strong>Marketplace local</strong><p>Uma vitrine digital para negócios da cidade, reunindo descoberta, catálogo, comparação e jornada de compra em um ambiente único.</p></div></article>
            <article><Building2 /><div><strong>Loja virtual própria</strong><p>Comerciantes podem estruturar sua presença digital, publicar produtos e ofertas e gerenciar a operação da própria loja dentro da plataforma.</p></div></article>
            <article><ShieldCheck /><div><strong>Clareza para o consumidor</strong><p>Quando um estabelecimento ainda não possui venda direta habilitada, o PreçoCerto identifica a página como catálogo informativo para evitar confusão.</p></div></article>
            <article><Info /><div><strong>Informação para decidir melhor</strong><p>Preços e estabelecimentos são organizados para facilitar a comparação e ajudar o público a tomar decisões de compra com mais contexto.</p></div></article>
            <article><Code2 /><div><strong>Tecnologia da plataforma</strong><p>Aplicação web construída com React, TypeScript, Vite e integração com Supabase, preparada para experiências responsivas e evolução contínua.</p></div></article>
            <article><Heart /><div><strong>Projeto feito em Feijó</strong><p>Uma iniciativa local pensada para fortalecer a presença digital dos negócios e tornar o comércio da cidade mais acessível para quem compra.</p></div></article>
          </div>

          <div className="pc-dev-signature">
            <span><UserRound /> Desenvolvimento e idealização</span>
            <strong>Franc D’nis</strong>
            <small>Assinatura técnica do projeto</small>
          </div>

          <footer className="pc-dev-footer">
            <span><MapPin /> Feijó · Acre · Brasil</span>
            <button type="button" onClick={() => setOpen("contact")}><MessageCircle /> Contato do PreçoCerto</button>
          </footer>
        </section>
      </div>,
      document.body,
    )}
  </>;
}
