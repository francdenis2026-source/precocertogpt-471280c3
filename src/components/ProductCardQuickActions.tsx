import { KeyboardEvent, MouseEvent, PointerEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Heart, LogIn, ShoppingBasket } from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { Product } from "../data/catalog";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { supabase } from "../lib/supabase";
import "./ProductCardQuickActions.css";

type CardTarget = { element: HTMLAnchorElement; identifier: string };
type BasketEntry = { productId: string; quantity: number };
type PendingBasket = { productId: string; returnTo: string; createdAt: number };

const BASKET_KEY = "precocerto:active_basket_items";
const PENDING_BASKET_KEY = "pc:pending_basket_item";
const ACTIONABLE_CARD_SELECTOR = [
  "a.ref-catalog-card[href^='/produto/']",
  ".ref-product-grid > a[href^='/produto/']",
  "a.ref-price-row[href^='/produto/']",
].join(",");

function productIdentifier(href: string) {
  const match = href.match(/\/produto\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as Array<Partial<BasketEntry> & { id?: string | number }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(item => ({ productId: String(item.productId ?? item.id ?? ""), quantity: Math.max(1, Number(item.quantity || 1)) }))
      .filter(item => item.productId);
  } catch {
    return [];
  }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function addBasketItem(productId: string) {
  const current = readBasket();
  const existing = current.find(item => item.productId === productId);
  const next = existing
    ? current.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
    : [...current, { productId, quantity: 1 }];
  writeBasket(next);
  return next;
}

function savePendingBasket(productId: string) {
  const returnTo = `${window.location.pathname}${window.location.search}`;
  const pending: PendingBasket = { productId, returnTo, createdAt: Date.now() };
  sessionStorage.setItem(PENDING_BASKET_KEY, JSON.stringify(pending));
  window.location.assign(`/login?redirect=${encodeURIComponent(returnTo)}`);
}

function keyboardActivate(event: KeyboardEvent<HTMLSpanElement>, callback: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.stopPropagation();
  callback();
}

export function ProductCardQuickActions() {
  const { userId, isFavorite, toggleFavorite } = useFavorites();
  const [targets, setTargets] = useState<CardTarget[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [basketItems, setBasketItems] = useState<BasketEntry[]>(readBasket);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    void fetchCatalog().then(catalog => {
      if (active) setCatalogProducts(catalog.products);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let frame = 0;
    const scan = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>(ACTIONABLE_CARD_SELECTOR));
        const next = cards
          .map(element => ({ element, identifier: productIdentifier(element.getAttribute("href") || "") }))
          .filter(target => target.identifier);
        next.forEach(target => target.element.classList.add("pc-card-has-actions"));
        setTargets(current => {
          const same = current.length === next.length && current.every((item, index) => item.element === next[index]?.element && item.identifier === next[index]?.identifier);
          return same ? current : next;
        });
      });
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const refresh = () => setBasketItems(readBasket());
    window.addEventListener("storage", refresh);
    window.addEventListener("pc:basket-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pc:basket-changed", refresh);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let pending: PendingBasket | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_BASKET_KEY);
      pending = raw ? JSON.parse(raw) as PendingBasket : null;
    } catch {
      pending = null;
    }
    if (!pending?.productId) return;
    if (Date.now() - pending.createdAt > 30 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_BASKET_KEY);
      return;
    }
    const next = addBasketItem(pending.productId);
    setBasketItems(next);
    sessionStorage.removeItem(PENDING_BASKET_KEY);
    setFeedback("Produto adicionado à sua lista.");
  }, [userId]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const productByIdentifier = useMemo(() => {
    const map = new Map<string, Product>();
    catalogProducts.forEach(product => {
      map.set(String(product.id), product);
      if (product.slug) map.set(product.slug, product);
    });
    return map;
  }, [catalogProducts]);

  const basketCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);
  const basketTotal = basketItems.reduce((sum, item) => {
    const product = catalogProducts.find(candidate => String(candidate.id) === item.productId);
    return sum + (product?.minPrice || 0) * item.quantity;
  }, 0);

  const addToBasket = useCallback(async (productId: string) => {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session?.user) {
      setFeedback("Entre para salvar sua lista de compras.");
      savePendingBasket(productId);
      return;
    }
    const next = addBasketItem(productId);
    setBasketItems(next);
    setFeedback("Produto adicionado à lista.");
  }, []);

  const stopPointer = (event: PointerEvent<HTMLSpanElement>) => event.stopPropagation();
  const stopClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return <>
    {targets.map(({ element, identifier }) => {
      const product = productByIdentifier.get(identifier);
      if (!product) return null;
      const id = String(product.id);
      const favorite = isFavorite(id);
      const quantity = basketItems.find(item => item.productId === id)?.quantity || 0;
      return createPortal(
        <span className="pc-card-actions" aria-label={`Ações rápidas para ${product.name}`}>
          <span
            className={`pc-card-action pc-card-action--favorite${favorite ? " is-active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            aria-pressed={favorite}
            title={favorite ? "Remover dos favoritos" : "Favoritar produto"}
            onPointerDown={stopPointer}
            onClick={event => { stopClick(event); void toggleFavorite(id); }}
            onKeyDown={event => keyboardActivate(event, () => { void toggleFavorite(id); })}
          >
            <Heart aria-hidden="true" />
          </span>
          <span
            className={`pc-card-action pc-card-action--basket${quantity ? " is-active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={quantity ? `${product.name}: ${quantity} na lista. Adicionar mais um` : `Adicionar ${product.name} à lista`}
            title={userId ? "Adicionar à lista" : "Entrar para salvar na lista"}
            onPointerDown={stopPointer}
            onClick={event => { stopClick(event); void addToBasket(id); }}
            onKeyDown={event => keyboardActivate(event, () => { void addToBasket(id); })}
          >
            {quantity ? <Check aria-hidden="true" /> : userId ? <ShoppingBasket aria-hidden="true" /> : <LogIn aria-hidden="true" />}
            {quantity > 0 && <b aria-hidden="true">{quantity}</b>}
          </span>
        </span>,
        element,
      );
    })}

    {basketCount > 0 && userId && <a className="pc-basket-running-total" href="/cesta-basica" aria-label={`Abrir lista com ${basketCount} itens, total estimado ${basketTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}>
      <ShoppingBasket aria-hidden="true" />
      <span><small>SUA LISTA · {basketCount} {basketCount === 1 ? "ITEM" : "ITENS"}</small><strong>{basketTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
      <b>Ver lista</b>
    </a>}

    {feedback && <div className="pc-card-action-feedback" role="status" aria-live="polite">{feedback}</div>}
  </>;
}
