import { useEffect } from "react";
import { ShoppingBasket } from "lucide-react";
import { createRoot, Root } from "react-dom/client";
import { fetchCatalog } from "../data/remoteCatalog";
import { parseMeasure } from "../lib/pricing";
import "./HomeProductModalProMaxEnhancer.css";

const ACTIVE_ITEMS_KEY = "precocerto:active_basket_items";

type Mount = { root: Root; node: HTMLSpanElement };

function readBasket() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVE_ITEMS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function HomeProductModalProMaxEnhancer() {
  useEffect(() => {
    let mount: Mount | null = null;
    let locked = false;
    let scrollY = 0;

    const unlock = () => {
      if (!locked) return;
      const body = document.body;
      document.documentElement.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      window.scrollTo(0, scrollY);
      locked = false;
    };

    const lock = () => {
      if (locked) return;
      scrollY = window.scrollY;
      const body = document.body;
      document.documentElement.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      locked = true;
    };

    const addToBasket = async (button: HTMLButtonElement) => {
      const modal = document.querySelector<HTMLElement>(".true-home .th-product-modal");
      const title = modal?.querySelector<HTMLElement>("#th-product-modal-title")?.textContent?.trim();
      if (!title) return;
      button.disabled = true;
      const original = button.innerHTML;
      button.textContent = "Adicionando…";
      try {
        const catalog = await fetchCatalog();
        const product = catalog.products.find(item => item.name.trim().toLocaleLowerCase("pt-BR") === title.toLocaleLowerCase("pt-BR"));
        const measure = parseMeasure(product?.size, product?.unit);
        const current = readBasket();
        const existing = current.find((item: any) => item.productName?.toLocaleLowerCase?.("pt-BR") === title.toLocaleLowerCase("pt-BR"));
        if (!existing) current.push({
          productName: title,
          category: product?.category || modal?.querySelector<HTMLElement>(".th-product-modal__eyebrow")?.textContent?.trim() || "Geral",
          quantity: 1,
          unit: measure?.base || "un",
          preferredBrands: product?.brand ? [product.brand] : undefined,
          isEssential: false,
        });
        localStorage.setItem(ACTIVE_ITEMS_KEY, JSON.stringify(current));
        window.dispatchEvent(new StorageEvent("storage", { key: ACTIVE_ITEMS_KEY, newValue: JSON.stringify(current) }));
        button.innerHTML = existing
          ? `<span class="th-modal-basket-check">✓</span> Já está na cesta`
          : `<span class="th-modal-basket-check">✓</span> Inserido na cesta`;
        button.classList.add("is-added");
        window.setTimeout(() => {
          button.disabled = false;
          button.classList.remove("is-added");
          button.innerHTML = original;
        }, 1800);
      } catch {
        button.disabled = false;
        button.textContent = "Tentar novamente";
        window.setTimeout(() => { button.innerHTML = original; }, 1600);
      }
    };

    const ensure = () => {
      const modal = document.querySelector<HTMLElement>(".true-home .th-product-modal");
      if (!modal) {
        mount?.root.unmount();
        mount?.node.remove();
        mount = null;
        unlock();
        return;
      }
      lock();
      const actions = modal.querySelector<HTMLElement>(".th-product-modal__actions");
      if (!actions || (mount && document.contains(mount.node))) return;
      const node = document.createElement("span");
      node.className = "th-modal-basket-mount";
      actions.prepend(node);
      const root = createRoot(node);
      root.render(
        <button type="button" className="th-modal-basket-button" onClick={(event) => void addToBasket(event.currentTarget)}>
          <ShoppingBasket aria-hidden="true" /> Inserir na cesta
        </button>,
      );
      mount = { root, node };
    };

    const observer = new MutationObserver(ensure);
    observer.observe(document.body, { childList: true, subtree: true });
    ensure();
    return () => {
      observer.disconnect();
      mount?.root.unmount();
      mount?.node.remove();
      unlock();
    };
  }, []);

  return null;
}
