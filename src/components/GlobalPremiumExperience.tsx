import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./GlobalPremiumOverrides.css";

const STYLE_ID = "pc-global-premium-experience";
const STORAGE_KEY = "precocerto-theme";

const secondaryHeroRoutes: Record<string, { title: string; text: string }> = {
  "/buscar": { title: "Compare com calma. Economize com clareza.", text: "Veja preços locais com uma experiência mais limpa e objetiva." },
  "/melhores-precos": { title: "As melhores oportunidades, sem excesso de informação.", text: "Priorize o que realmente muda sua compra." },
  "/cesta-basica": { title: "Planeje a compra inteira.", text: "Use o PreçoCerto para transformar orçamento em decisões melhores." },
  "/planos": { title: "Mais recursos quando você precisar.", text: "Escolha o nível de inteligência e conveniência ideal para sua rotina." },
  "/farmacias": { title: "Saúde local, informação organizada.", text: "Encontre estabelecimentos e opções com mais clareza." },
  "/colaborar": { title: "Ajude o PreçoCerto a ficar melhor.", text: "Informação local de qualidade melhora a experiência de toda a cidade." },
  "/fale-conosco": { title: "Fale com quem está construindo localmente.", text: "O PreçoCerto nasceu para servir Feijó com tecnologia útil e simples." },
};

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root{--pc-bg:#f7faf9;--pc-surface:#fff;--pc-surface-2:#f0f5f3;--pc-text:#102019;--pc-muted:#64748b;--pc-line:#dce6e1;--pc-brand:#0f766e;--pc-accent:#10b981;--pc-shadow:0 12px 34px rgba(15,23,42,.08)}
    html[data-theme="dark"]{--pc-bg:#07131b;--pc-surface:#0d1e27;--pc-surface-2:#102730;--pc-text:#edf6f2;--pc-muted:#9fb2bd;--pc-line:#223842;--pc-brand:#5eead4;--pc-accent:#34d399;--pc-shadow:0 14px 40px rgba(0,0,0,.28);color-scheme:dark}
    html,body{background:var(--pc-bg);color:var(--pc-text)}
    body{transition:background-color .22s ease,color .22s ease}
    .pc-theme-toggle{position:fixed;right:18px;bottom:18px;z-index:2147482000;width:46px;height:46px;border:1px solid color-mix(in srgb,var(--pc-line) 86%,transparent);border-radius:14px;background:color-mix(in srgb,var(--pc-surface) 92%,transparent);color:var(--pc-text);display:grid;place-items:center;box-shadow:var(--pc-shadow);backdrop-filter:blur(14px);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
    .pc-theme-toggle:hover{transform:translateY(-2px) scale(1.025)}
    .pc-theme-toggle:active{transform:scale(.96)}
    .pc-theme-toggle:focus-visible{outline:3px solid color-mix(in srgb,var(--pc-accent) 45%,transparent);outline-offset:3px}
    .pc-theme-toggle svg{width:19px;height:19px}
    .pc-secondary-hero{position:relative;isolation:isolate;overflow:hidden;max-width:1180px;margin:26px auto 34px;min-height:168px;border-radius:24px;background:url('/hero-profissional.png') center 48%/cover no-repeat;color:white;box-shadow:0 18px 48px rgba(2,18,29,.16)}
    .pc-secondary-hero:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(3,18,29,.94),rgba(4,31,39,.82) 55%,rgba(4,31,39,.36))}
    .pc-secondary-hero__inner{min-height:168px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px clamp(20px,4vw,44px)}
    .pc-secondary-hero__copy{max-width:690px}.pc-secondary-hero__copy span{display:block;margin-bottom:7px;color:#79e6bd;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.pc-secondary-hero__copy h2{margin:0;color:#fff;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.04;letter-spacing:-.04em}.pc-secondary-hero__copy p{margin:9px 0 0;color:#d3e0e5;font-size:14px;line-height:1.5}.pc-secondary-hero a{min-height:44px;padding:0 16px;border-radius:12px;display:inline-flex;align-items:center;background:#10b981;color:#042d26;font-weight:850;text-decoration:none;white-space:nowrap;transition:transform .18s ease,filter .18s ease}.pc-secondary-hero a:hover{transform:translateY(-2px);filter:brightness(1.04)}
    body.pc-premium-public :where(.card,.panel,.surface-card,article){transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
    body.pc-premium-public :where(button,a.button,.btn,[role="button"]){transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}
    body.pc-premium-public :where(button,a.button,.btn,[role="button"]):active{transform:scale(.985)}
    html[data-theme="dark"] body.pc-premium-public :where(main,section:not(.pc-secondary-hero),.card,.panel,.surface-card){border-color:var(--pc-line)}
    html[data-theme="dark"] body.pc-premium-public :where(input,select,textarea){background:var(--pc-surface)!important;color:var(--pc-text)!important;border-color:var(--pc-line)!important}
    html[data-theme="dark"] body.pc-premium-public :where(.card,.panel,.surface-card){background:var(--pc-surface)!important;color:var(--pc-text)!important}
    @media(max-width:760px){.pc-theme-toggle{right:12px;bottom:12px;width:44px;height:44px;border-radius:13px}.pc-secondary-hero{margin:18px 14px 24px;min-height:150px;border-radius:18px}.pc-secondary-hero__inner{min-height:150px;align-items:flex-start;flex-direction:column;padding:23px 20px}.pc-secondary-hero a{width:100%;justify-content:center}.pc-secondary-hero__copy p{font-size:13px}}
    @media(prefers-reduced-motion:reduce){body,.pc-theme-toggle,.pc-secondary-hero a,body.pc-premium-public *{transition:none!important;animation:none!important}}
  `;
  document.head.appendChild(style);
}

function mountSecondaryHero(pathname: string) {
  document.querySelector(".pc-secondary-hero")?.remove();
  const data = secondaryHeroRoutes[pathname];
  if (!data) return;
  const main = document.querySelector("main");
  if (!main) return;
  const hero = document.createElement("section");
  hero.className = "pc-secondary-hero";
  hero.setAttribute("aria-label", "Destaque PreçoCerto");
  hero.innerHTML = `<div class="pc-secondary-hero__inner"><div class="pc-secondary-hero__copy"><span>PreçoCerto · Feijó-AC</span><h2>${data.title}</h2><p>${data.text}</p></div><a href="/estabelecimentos">Explorar estabelecimentos</a></div>`;
  main.appendChild(hero);
}

export function GlobalPremiumExperience() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    installStyles();
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const publicRoute = !pathname.startsWith("/admin") && !pathname.startsWith("/painel-lojista");
    document.body.classList.toggle("pc-premium-public", publicRoute);
    const run = () => { mountSecondaryHero(pathname); };
    const timer = window.setTimeout(run, 80);
    return () => { window.clearTimeout(timer); document.body.classList.remove("pc-premium-public"); document.querySelector(".pc-secondary-hero")?.remove(); };
  }, [pathname]);

  if (pathname === "/") return null;
  return <button className="pc-theme-toggle" type="button" aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} title={theme === "dark" ? "Modo claro" : "Modo escuro"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun aria-hidden="true"/> : <Moon aria-hidden="true"/>}</button>;
}
