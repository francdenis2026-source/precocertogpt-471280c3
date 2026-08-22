import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
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
    setVisible(inRange && !dismissed);
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
      <Link className="pc-festival-bar__art" to="/buscar" aria-label="Festival do Açaí e Festival de Praia em Feijó. Pesquisar e comparar preços locais.">
        <img src="/banner-festival-acai-feijo-2026.png" width="1024" height="62" alt="" aria-hidden="true" />
        <span><strong>Festival do Açaí e Festival de Praia em Feijó</strong><small>Pesquise e compare preços locais</small></span>
      </Link>
      <button type="button" className="pc-festival-bar__close" onClick={dismiss} aria-label="Fechar aviso do festival">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
