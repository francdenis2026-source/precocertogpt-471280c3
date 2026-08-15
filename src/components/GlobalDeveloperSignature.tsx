import { Code2, MapPin } from "lucide-react";

export function GlobalDeveloperSignature() {
  return (
    <div className="pc-global-signature" role="contentinfo" aria-label="Créditos de desenvolvimento">
      <span><MapPin aria-hidden="true" /> Feijó, Acre</span>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("precocerto:developer-about"))}
        aria-label="Conhecer o desenvolvedor Franc D'nis"
      >
        <Code2 aria-hidden="true" /> Desenvolvido por <strong>Franc D&apos;nis</strong>
      </button>
    </div>
  );
}
