import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, PackageSearch, ShoppingBasket, X } from "lucide-react";
import type { Product } from "../data/catalog";
import { resolveProductImage } from "../data/productImageResolver";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { requestAuthAction } from "../lib/authActionPrompt";
import { supabase } from "../lib/supabase";
import "./ProductQuickViewModal.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Mesma chave/formato usado em ProductDetailProfessional.tsx, para que um
// item adicionado por aqui apareça na cesta normal do site (e vice-versa).
const BASKET_KEY = "precocerto:active_basket_items";
const PENDING_BASKET_KEY = "pc:pending_basket_item";
type BasketEntry = { productId: string; quantity: number };

function readBasket(): BasketEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BASKET_KEY) || "[]") as BasketEntry[];
    return Array.isArray(parsed) ? parsed.filter(item => item?.productId && item.quantity > 0) : [];
  } catch { return []; }
}

function writeBasket(items: BasketEntry[]) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pc:basket-changed"));
}

function QuickViewImage({ product }: { product: Product }) {
  const source = resolveProductImage(product);
  const [failedSource, setFailedSource] = useState("");
  if (source && failedSource !== source) return <img className="pqv-image" src={source} alt={product.name} width="400" height="400" loading="eager" onError={() => setFailedSource(source)} />;
  return <div className="pqv-image-fallback" role="img" aria-label={`Imagem de ${product.name} em atualização`}><PackageSearch /><span>Imagem em atualização</span></div>;
}

/**
 * Modal "visualização rápida" de produto — usado nas páginas dedicadas de
 * Kelly Burgueria e Ponto do Sanduba para permitir clicar em qualquer item
 * do cardápio, ver os detalhes num painel profissional, favoritar e
 * adicionar à cesta sem sair da página. Reaproveita os mesmos mecanismos de
 * favoritos (useFavorites) e cesta (localStorage + evento pc:basket-changed)
 * já usados em /produto/:identifier, então o item favoritado ou adicionado
 * aqui aparece normalmente no resto do site.
 */
export function ProductQuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const favorite = isFavorite(product.id);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleAddToBasket = async () => {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session?.user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(PENDING_BASKET_KEY, JSON.stringify({ productId: String(product.id), returnTo, createdAt: Date.now() }));
      requestAuthAction("basket", returnTo);
      return;
    }
    const current = readBasket();
    const id = String(product.id);
    const existing = current.find(item => item.productId === id);
    if (existing) {
      setMessage("Produto já está na lista. Altere a quantidade na cesta.");
      window.setTimeout(() => setMessage(""), 2200);
      return;
    }
    const next = [...current, { productId: id, quantity: 1 }];
    writeBasket(next);
    setMessage("Produto adicionado à sua lista.");
    window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <div className="pqv-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="pqv-dialog" role="dialog" aria-modal="true" aria-labelledby="pqv-title" ref={dialogRef}>
        <button type="button" className="pqv-close" onClick={onClose} aria-label="Fechar" ref={closeButtonRef}><X aria-hidden="true" /></button>

        <div className="pqv-media"><QuickViewImage product={product} /></div>

        <div className="pqv-body">
          <span className="pqv-kicker">{product.category}</span>
          <h2 id="pqv-title">{product.name}</h2>
          {product.size && <p className="pqv-size">{product.size}</p>}

          <div className="pqv-price-row">
            <span className="pqv-price">{brl.format(product.minPrice)}</span>
            <span className="pqv-store"><MapPin aria-hidden="true" /> {product.establishment}</span>
          </div>

          <div className="pqv-actions">
            <button type="button" className={`pqv-btn pqv-btn--primary${favorite ? " is-active" : ""}`} onClick={() => void toggleFavorite(product.id)}>
              <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} /> {favorite ? "Nos favoritos" : "Favoritar"}
            </button>
            <button type="button" className="pqv-btn pqv-btn--ghost" onClick={() => void handleAddToBasket()}>
              <ShoppingBasket aria-hidden="true" /> Adicionar à cesta
            </button>
          </div>

          {message && <p className="pqv-message" role="status">{message}</p>}

          <Link className="pqv-link" to={`/produto/${product.slug}`} onClick={onClose}>Ver página completa do produto</Link>
        </div>
      </div>
    </div>
  );
}
