import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import "./FestivalAcaiBar.css";

// Faixa sazonal e discreta para a semana do Festival do Açaí + Festival de
// Praia em Feijó. Some sozinha fora do intervalo abaixo — não precisa remover
// o componente depois do evento, só ajustar (ou deixar) estas duas datas para
// o próximo ano.
const FESTIVAL_START = "2026-08-21T00:00:00-05:00";
const FESTIVAL_END = "2026-08-25T00:00:00-05:00";

const DISMISS_KEY = "pc-festival-acai-2026-dismissed";

export function FestivalAcaiBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const inRange = now >= new Date(FESTIVAL_START).getTime() && now < new Date(FESTIVAL_END).getTime();
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Navegação privada ou storage bloqueado: trata como não dispensado.
    }
    // Atualiza após a montagem sem provocar uma renderização encadeada dentro
    // do próprio efeito; o HTML inicial continua estável para o prerender.
    queueMicrotask(() => setVisible(inRange && !dismissed));
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Sem storage disponível: a faixa some só nesta sessão.
    }
    setVisible(false);
  };

  return (
    <div className="pc-festival-bar" role="region" aria-label="Aviso do Festival do Açaí">
      <div className="pc-festival-bar__inner">
        <p>
          <Sparkles aria-hidden="true" />
          <span><strong>Festival do Açaí + Festival de Praia</strong> em Feijó — compare preços antes de comprar.</span>
        </p>
        <Link to="/buscar">Ver preços<span aria-hidden="true"> →</span></Link>
      </div>
      <button type="button" className="pc-festival-bar__close" onClick={dismiss} aria-label="Fechar aviso do festival">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
