import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, LogIn, X } from "lucide-react";
import type { AuthActionPromptDetail } from "../lib/authActionPrompt";
import "./AuthActionPrompt.css";

function AccountBenefitsIllustration({ action }: { action: AuthActionPromptDetail["action"] }) {
  const title = action === "favorite" ? "Produto salvo com segurança" : "Cesta sincronizada com sua conta";
  return <svg className="pc-auth-illustration" viewBox="0 0 360 210" role="img" aria-label={title}>
    <defs>
      <linearGradient id="pc-auth-bg" x1="40" y1="12" x2="320" y2="202" gradientUnits="userSpaceOnUse"><stop stopColor="#E6F6F1"/><stop offset="1" stopColor="#EAF1FA"/></linearGradient>
      <linearGradient id="pc-auth-bag" x1="132" y1="67" x2="231" y2="174" gradientUnits="userSpaceOnUse"><stop stopColor="#18A087"/><stop offset="1" stopColor="#08715F"/></linearGradient>
      <filter id="pc-auth-shadow" x="80" y="38" width="210" height="172" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#123C35" floodOpacity=".18"/></filter>
    </defs>
    <rect x="8" y="8" width="344" height="194" rx="28" fill="url(#pc-auth-bg)"/>
    <circle cx="62" cy="58" r="22" fill="#F6C85F" fillOpacity=".34"/><circle cx="305" cy="148" r="29" fill="#75B7E8" fillOpacity=".22"/>
    <path d="M30 155c44-31 79-22 112 4 38 29 91 31 188-21" fill="none" stroke="#8CCDBE" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 10"/>
    <g filter="url(#pc-auth-shadow)">
      <path d="M114 84c0-10 8-18 18-18h96c10 0 18 8 18 18v80c0 10-8 18-18 18h-96c-10 0-18-8-18-18V84Z" fill="white"/>
      <path d="M129 96h102l-9 65c-1 7-7 12-14 12h-56c-7 0-13-5-14-12l-9-65Z" fill="url(#pc-auth-bag)"/>
      <path d="M155 105V87c0-14 11-25 25-25s25 11 25 25v18" fill="none" stroke="#075B50" strokeWidth="8" strokeLinecap="round"/>
      {action === "favorite" ? <path d="M180 150s-24-13-24-31c0-13 16-20 24-9 8-11 24-4 24 9 0 18-24 31-24 31Z" fill="#FFE7EC" stroke="#C9486B" strokeWidth="4" strokeLinejoin="round"/> : <g><circle cx="167" cy="145" r="7" fill="#E9C15F"/><circle cx="203" cy="145" r="7" fill="#E9C15F"/><path d="M153 119h12l5 18h36l5-14h-40" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></g>}
    </g>
    <g transform="translate(226 43)"><circle cx="30" cy="30" r="28" fill="#173D4C"/><path d="m18 30 8 8 16-18" fill="none" stroke="#78DBC4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></g>
    <g opacity=".9"><rect x="40" y="91" width="43" height="14" rx="7" fill="#fff"/><rect x="274" y="79" width="46" height="14" rx="7" fill="#fff"/></g>
  </svg>;
}

export function AuthActionPrompt() {
  const [prompt, setPrompt] = useState<AuthActionPromptDetail | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const open = (event: Event) => setPrompt((event as CustomEvent<AuthActionPromptDetail>).detail);
    window.addEventListener("pc:auth-action-required", open);
    return () => window.removeEventListener("pc:auth-action-required", open);
  }, []);

  useEffect(() => {
    if (!prompt) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const screen = document.querySelector<HTMLElement>(".mh26-page,.msearch26-page,.ref-page,.pro-basket-page,.smart-basket-page,.pharmacy-directory-page");
    const previousOverflow = screen?.style.overflowY || "";
    if (screen) screen.style.overflowY = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") setPrompt(null); };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      if (screen) screen.style.overflowY = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [prompt]);

  if (!prompt) return null;
  const destination = prompt.returnTo || `${window.location.pathname}${window.location.search}`;
  const query = encodeURIComponent(destination);
  const favorite = prompt.action === "favorite";

  return createPortal(<div className="pc-auth-prompt" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPrompt(null); }}>
    <section className="pc-auth-prompt__card" role="dialog" aria-modal="true" aria-labelledby="pc-auth-prompt-title">
      <button ref={closeRef} className="pc-auth-prompt__close" type="button" onClick={() => setPrompt(null)} aria-label="Fechar convite"><X aria-hidden="true"/></button>
      <AccountBenefitsIllustration action={prompt.action}/>
      <div className="pc-auth-prompt__copy">
        <span>{favorite ? "SALVE PARA CONSULTAR DEPOIS" : "SUA LISTA EM TODOS OS DISPOSITIVOS"}</span>
        <h2 id="pc-auth-prompt-title">{favorite ? "Crie sua conta para favoritar." : "Crie sua conta para montar a cesta."}</h2>
        <p>{favorite ? "Guarde produtos, acompanhe preços e encontre novamente suas melhores opções." : "Salve seus produtos, quantidades e total estimado com segurança."}</p>
      </div>
      <div className="pc-auth-prompt__benefits" aria-label="Benefícios da conta"><span>✓ Gratuito</span><span>✓ Seus dados sincronizados</span></div>
      <div className="pc-auth-prompt__actions">
        <a className="is-primary" href={`/cadastro?redirect=${query}`}>Criar conta grátis <ArrowRight aria-hidden="true"/></a>
        <a href={`/login?redirect=${query}`}><LogIn aria-hidden="true"/> Já tenho conta</a>
      </div>
      <small>Após entrar, esta ação será concluída automaticamente.</small>
    </section>
  </div>, document.body);
}
