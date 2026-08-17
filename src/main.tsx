import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "./styles/AppReset.css";
import App from "./App";
import "./reference/DesignSystem2.css";
import "./reference/DesignSystem2Experience.css";

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme === "dark" ? "dark" : "light";
localStorage.setItem("theme", initialTheme);
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

const boot = document.getElementById("pc-boot-screen");
const showOffline = () => {
  document.documentElement.classList.add("pc-boot-offline-mode");
  boot?.classList.remove("is-done");
};
const hideOffline = () => {
  document.documentElement.classList.remove("pc-boot-offline-mode");
  boot?.classList.add("is-done");
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
