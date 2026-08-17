import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "./styles/AppReset.css";
import App from "./App";

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme === "dark" ? "dark" : "light";
localStorage.setItem("theme", initialTheme);
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

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

// Remove a experiência de inicialização somente depois que o React assumiu a página.
window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => {
    const boot = document.getElementById("pc-boot-screen");
    if (!boot) return;
    boot.classList.add("is-done");
    window.setTimeout(() => boot.remove(), 260);
  });
});
