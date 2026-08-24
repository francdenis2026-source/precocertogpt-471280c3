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
const showOffline = () => {
  window.clearTimeout(bootRemovalTimer);
  document.documentElement.classList.add("pc-boot-offline-mode");
  boot?.classList.remove("is-removed");
  boot?.classList.remove("is-done");
};
const hideOffline = () => {
  document.documentElement.classList.remove("pc-boot-offline-mode");
  boot?.classList.add("is-done");
  retireBoot();
};
window.addEventListener("offline", showOffline);
window.addEventListener("online", hideOffline);

if (navigator.onLine) {
  // Notificações não fazem parte do caminho crítico da primeira pintura.
  window.setTimeout(() => {
    void import("./lib/paymentNotifications")
      .then(({ startPaymentNotifications }) => startPaymentNotifications())
      .catch(() => {
        // A interface continua disponível mesmo se o serviço de notificações falhar.
      });
  }, 1_500);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // Oculta a tela de inicialização somente depois que o React assumiu a página.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => boot?.classList.add("is-done"));
  });
} else {
  showOffline();
}
