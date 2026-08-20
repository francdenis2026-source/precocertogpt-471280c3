import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Tag } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ProductBrandIdentity.css";

type BrandRow = { id?: string; slug?: string | null; brand: string | null };
type CardBrand = { element: HTMLAnchorElement; brand: string };

const cleanBrand = (value: string | null | undefined) => {
  const brand = (value || "").trim();
  if (!brand || brand === "-" || brand === "—" || brand.toLocaleLowerCase("pt-BR") === "não identificada") return "";
  return brand;
};

const productIdentifier = (href: string) => {
  const match = href.match(/\/produto\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function ProductBrandIdentity() {
  const location = useLocation();
  const [cards, setCards] = useState<CardBrand[]>([]);
  const [detailTarget, setDetailTarget] = useState<HTMLElement | null>(null);
  const [detailBrand, setDetailBrand] = useState("");

  useEffect(() => {
    let active = true;
    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void scan(), 80);
    });

    const scan = async () => {
      if (!active || !supabase) return;
      const elements = Array.from(document.querySelectorAll<HTMLAnchorElement>(
        ".store-pro-grid a[href^='/produto/'], .search26-grid a[href^='/produto/'], .ref-product-grid a[href^='/produto/']",
      ));
      if (!elements.length) { setCards([]); return; }
      const identifiers = Array.from(new Set(elements.map(el => productIdentifier(el.getAttribute("href") || "")).filter(Boolean)));
      const ids = identifiers.filter(isUuid);
      const slugs = identifiers.filter(value => !isUuid(value));
      const rows: BrandRow[] = [];

      if (ids.length) {
        const result = await supabase.from("products").select("id, slug, brand").in("id", ids);
        if (!result.error && result.data) rows.push(...result.data as BrandRow[]);
      }
      if (slugs.length) {
        const result = await supabase.from("products").select("id, slug, brand").in("slug", slugs);
        if (!result.error && result.data) rows.push(...result.data as BrandRow[]);
      }
      if (!active) return;
      const byKey = new Map<string, string>();
      rows.forEach(row => {
        const brand = cleanBrand(row.brand);
        if (!brand) return;
        if (row.id) byKey.set(String(row.id), brand);
        if (row.slug) byKey.set(String(row.slug), brand);
      });
      setCards(elements.map(element => {
        const brand = byKey.get(productIdentifier(element.getAttribute("href") || ""));
        return brand ? { element, brand } : null;
      }).filter((item): item is CardBrand => Boolean(item)));
    };

    void scan();
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { active = false; window.clearTimeout(timer); observer.disconnect(); };
  }, [location.pathname, location.search]);

  useEffect(() => {
    const match = location.pathname.match(/^\/produto\/([^/?#]+)/);
    if (!match || !supabase) { setDetailTarget(null); setDetailBrand(""); return; }
    let active = true;
    const identifier = decodeURIComponent(match[1]);
    let observer: MutationObserver | null = null;
    const findTarget = () => {
      const node = document.querySelector<HTMLElement>(".pdp-meta");
      if (node && active) setDetailTarget(node);
      return Boolean(node);
    };
    if (!findTarget()) {
      observer = new MutationObserver(() => { if (findTarget()) observer?.disconnect(); });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    const loadBrand = async () => {
      if (!supabase) return;
      const query = supabase.from("products").select("brand");
      const result = isUuid(identifier)
        ? await query.eq("id", identifier).maybeSingle()
        : await query.eq("slug", identifier).maybeSingle();
      if (active && !result.error) setDetailBrand(cleanBrand((result.data as { brand?: string | null } | null)?.brand));
    };
    void loadBrand();
    return () => { active = false; observer?.disconnect(); };
  }, [location.pathname]);

  return <>
    {cards.map(({ element, brand }) => createPortal(
      <span className="pc-brand-chip" aria-label={`Marca ${brand}`}><small>MARCA</small><strong>{brand}</strong></span>,
      element,
    ))}
    {detailTarget && detailBrand ? createPortal(
      <div className="pc-detail-brand"><Tag aria-hidden="true"/><span><small>Marca</small><strong>{detailBrand}</strong></span></div>,
      detailTarget,
    ) : null}
  </>;
}
