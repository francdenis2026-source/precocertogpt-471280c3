import { MapPin } from "lucide-react";
import "./LocationSwitcher.css";

// O catálogo público atende somente Feijó. Enquanto não houver uma segunda
// cidade com dados reais, a localização é informação de cobertura, não ação.
export function LocationSwitcher() {
  return <div className="pc-location" aria-label="Área atendida: Feijó, Acre">
    <div className="pc-location__chip">
      <MapPin aria-hidden="true" />
      <span><small>ATENDIMENTO LOCAL</small><strong>Feijó, AC</strong></span>
    </div>
  </div>;
}
