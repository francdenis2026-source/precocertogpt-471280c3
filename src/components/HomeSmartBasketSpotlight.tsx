import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, PiggyBank, ShoppingBasket, Store, UsersRound, WalletCards } from "lucide-react";
import { loadSessionProfile } from "../lib/roles";
import "./HomeSmartBasketSpotlight.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function HomeSmartBasketSpotlight() {
  const location = useLocation();
  const navigate = useNavigate();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [budget, setBudget] = useState(350);
  const [people, setPeople] = useState(2);

  useEffect(() => {
    if (location.pathname !== "/") {
      setTarget(null);
      return;
    }

    const hero = document.querySelector<HTMLElement>(".ref-home .ref-hero");
    if (!hero) return;

    let mount = document.getElementById("pc-home-smart-basket-mount") as HTMLElement | null;
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "pc-home-smart-basket-mount";
      hero.insertAdjacentElement("afterend", mount);
    }
    setTarget(mount);

    return () => {
      mount?.remove();
      setTarget(null);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    let active = true;
    void loadSessionProfile().then(profile => {
      if (active) setAuthenticated(Boolean(profile));
    });
    return () => { active = false; };
  }, [location.pathname]);

  const perPerson = useMemo(() => budget / Math.max(1, people), [budget, people]);

  function startPlanner() {
    sessionStorage.setItem("precocerto:smart-basket-prefill", JSON.stringify({ budget, people }));
    const destination = `/cesta-inteligente?budget=${budget}&people=${people}`;
    navigate(authenticated ? destination : `/login?redirect=${encodeURIComponent(destination)}`);
  }

  if (location.pathname !== "/" || !target) return null;

  return createPortal(
    <section className="home-smart-basket" aria-labelledby="home-smart-basket-title">
      <div className="home-smart-basket__shell">
        <div className="home-smart-basket__copy">
          <span className="home-smart-basket__eyebrow"><ShoppingBasket aria-hidden="true" /> CESTA INTELIGENTE PREÇOCERTO</span>
          <h2 id="home-smart-basket-title">Monte uma cesta que cabe no seu orçamento.</h2>
          <p>Informe quanto pode gastar e o PreçoCerto organiza uma sugestão de compra com itens essenciais, usando os preços cadastrados no comércio local.</p>
          <div className="home-smart-basket__modes" aria-label="Modos de comparação">
            <span><PiggyBank aria-hidden="true" /><b>Maior economia</b><small>Menor preço de cada item, mesmo em lojas diferentes.</small></span>
            <span><Store aria-hidden="true" /><b>Mais praticidade</b><small>Melhor combinação possível em um único estabelecimento.</small></span>
          </div>
          <div className="home-smart-basket__trust"><BadgeCheck aria-hidden="true" /> Ferramenta exclusiva para usuários cadastrados · sua cesta pode ser salva na conta</div>
        </div>

        <div className="home-smart-basket__planner" aria-label="Planejamento rápido da cesta">
          <header><span><WalletCards aria-hidden="true" /></span><div><small>PLANEJAMENTO RÁPIDO</small><strong>Quanto você quer gastar?</strong></div></header>
          <label className="home-smart-basket__money"><span>Orçamento disponível</span><div><b>R$</b><input aria-label="Orçamento disponível" type="number" min="50" step="10" value={budget} onChange={event => setBudget(Math.max(50, Number(event.target.value) || 50))} /></div></label>
          <div className="home-smart-basket__quick-values" aria-label="Valores rápidos">{[150, 250, 350, 500].map(value => <button key={value} type="button" className={budget === value ? "is-active" : ""} onClick={() => setBudget(value)}>{brl.format(value)}</button>)}</div>
          <label className="home-smart-basket__people"><span><UsersRound aria-hidden="true" /> Pessoas na casa</span><select value={people} onChange={event => setPeople(Number(event.target.value))}>{[1,2,3,4,5,6,7,8].map(value => <option key={value} value={value}>{value} {value === 1 ? "pessoa" : "pessoas"}</option>)}</select></label>
          <div className="home-smart-basket__estimate"><span>Referência por pessoa</span><strong>{brl.format(perPerson)}</strong></div>
          <button className="home-smart-basket__cta" type="button" onClick={startPlanner}>{authenticated === false ? "Entrar e montar minha cesta" : "Montar minha cesta"}<ArrowRight aria-hidden="true" /></button>
          <small className="home-smart-basket__note">A ferramenta é de planejamento de compras e não representa recomendação nutricional nem cesta oficial de governo.</small>
        </div>
      </div>
    </section>,
    target,
  );
}
