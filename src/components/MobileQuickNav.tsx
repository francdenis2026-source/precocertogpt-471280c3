import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, ListChecks, Search, Store, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/buscar", label: "Buscar", Icon: Search },
  { to: "/cesta-basica", label: "Lista", Icon: ListChecks },
  { to: "/estabelecimentos", label: "Estabelecimentos", Icon: Store },
  { to: "/favoritos", label: "Favoritos", Icon: Heart },
  { to: "/explorar", label: "Setores", Icon: SlidersHorizontal },
] as const;

export function MobileQuickNav() {
  const location = useLocation();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const admin = location.pathname.startsWith("/admin") || location.pathname.startsWith("/painel-lojista");
    if (admin) {
      setTarget(null);
      return;
    }
    const header = document.querySelector<HTMLElement>(".ref-header");
    if (!header) {
      setTarget(null);
      return;
    }
    let mount = header.querySelector<HTMLElement>("#pc-mobile-quick-nav-mount");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "pc-mobile-quick-nav-mount";
      header.appendChild(mount);
    }
    setTarget(mount);
    return () => {
      mount?.remove();
      setTarget(null);
    };
  }, [location.pathname]);

  if (!target) return null;

  return createPortal(
    <nav className="ref-header__quick" aria-label="Atalhos rápidos">
      {items.map(({ to, label, Icon }) => {
        const active = location.pathname === to || (to === "/explorar" && ["/mercados", "/farmacias", "/padarias", "/livros", "/servicos"].includes(location.pathname));
        return <Link key={to} to={to} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" /><span>{label}</span></Link>;
      })}
    </nav>,
    target,
  );
}
