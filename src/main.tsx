import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
import App from "./App";
import { initializeSiteTheme } from "./lib/siteTheme";
import "./reference/DesignSystem2.css";
import "./reference/DesignSystem2Experience.css";
import "./reference/GlobalMineralDark2026.css";
import "./reference/HomepageVisualRefinement2026.css";

initializeSiteTheme();

const boot = document.getElementById("pc-boot-screen");
// A tela de boot precisa sair completamente do fluxo de pintura depois do
// primeiro render. Mantida apenas com opacity/visibility, o navegador continua
// animando a barra de progresso e compondo a imagem de fundo com blur, o que
// consome CPU/GPU e memória durante toda a sessão.
let bootRemovalTimer = 0;
const retireBoot = () => {
  window.clearTimeout(bootRemovalTimer);
  bootRemovalTimer = window.setTimeout(() => boot?.classList.add("is-removed"), 400);
};

// A aplicação sempre monta, mesmo quando navigator.onLine começa como false.
// O catálogo possui base local e estados próprios; bloquear todo o React por
// um sinal instável do navegador transformava uma oscilação de rede em uma
// tela genérica e impedia inclusive o conteúdo que já estava disponível.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Oculta a tela de inicialização somente depois que o React assumiu a página.
window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => {
    boot?.classList.add("is-done");
    retireBoot();
  });
});

const startNotifications = () => {
  if (!navigator.onLine) return;
  void import("./lib/paymentNotifications")
    .then(({ startPaymentNotifications }) => startPaymentNotifications())
    .catch(() => {
      // A interface e o catálogo local continuam disponíveis.
    });
};

// Notificações não fazem parte do caminho crítico da primeira pintura.
window.setTimeout(startNotifications, 1_500);
window.addEventListener("online", startNotifications, { once: true });

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void (async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith("precocerto-")).map(key => caches.delete(key)));
      }

      // Um controlador desregistrado permanece ligado à aba atual até uma
      // navegação. Esta recarga única entrega os assets diretamente da rede.
      if (!navigator.serviceWorker.controller) return;
      const reloadKey = "pc:legacy-worker-removed";
      try {
        if (sessionStorage.getItem(reloadKey)) return;
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
      } catch {
        // Sem armazenamento de sessão, evita-se qualquer risco de loop.
      }
    })().catch(() => {
      // Falhas na limpeza não bloqueiam o funcionamento da aplicação.
    });
  }, { once: true });
}
