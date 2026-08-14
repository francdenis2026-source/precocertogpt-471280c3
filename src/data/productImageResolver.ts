import type { Product } from "./catalog";

type AssetMeta = { url?: string; original_filename?: string; content_type?: string };

const assetModules = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,avif}.asset.json", {
  eager: true,
  import: "default",
}) as Record<string, AssetMeta>;

const productImages = import.meta.glob("../assets/products/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\.(png|jpe?g|webp|avif)$/g, "")
  .replace(/[^a-z0-9]+/g, "")
  .trim();

const localAssets = Object.entries(assetModules)
  .map(([path, meta]) => {
    if (!meta?.url) return null;
    const source = meta.original_filename || path.replace(/^.*\//, "").replace(/\.asset\.json$/i, "");
    return { url: meta.url, key: normalize(source) };
  })
  .filter((item): item is { url: string; key: string } => Boolean(item?.url && item.key));

const productAssets = Object.entries(productImages).map(([path, url]) => ({
  url,
  key: normalize(path.replace(/^.*\//, "")),
}));

localAssets.push(...productAssets);

const publicFallbacks = [
  { terms: ["aguasanitaria", "ype", "1l"], url: "/products/agua-sanitaria-ype-1l.jpg" },
  { terms: ["aguasanitaria", "ype", "2l"], url: "/products/agua-sanitaria-ype-2l.jpg" },
  { terms: ["bisteca"], url: "/products/bisteca.jpg" },
  { terms: ["arroz", "tiojoao"], url: "/products/arroz-tio-joao-5kg.png" },
  { terms: ["arroz", "bernardo"], url: "/products/arroz-branco-bernardo-1kg.jpg" },
  { terms: ["cafe", "3coracoes"], url: "/products/cafe-3-coracoes-500g.jpg" },
  { terms: ["leite", "italac"], url: "/products/leite-italac-1l.jpg" },
  { terms: ["feijao", "kicaldo"], url: "/products/feijao-kicaldo-1kg.jpg" },
  { terms: ["feijao", "bernardo"], url: "/products/feijao-carioca-bernardo-1kg.jpg" },
  { terms: ["acucar", "uniao"], url: "/products/acucar-uniao-1kg.jpg" },
  { terms: ["detergente", "ype"], url: "/products/detergente-ypx-neutro-500ml.jpg" },
] as const;

export function resolveProductImage(product: Product): string | undefined {
  const identity = normalize([product.name, product.brand, product.size].filter(Boolean).join(" "));
  const publicFallback = publicFallbacks.find(item => item.terms.every(term => identity.includes(term)));
  if (publicFallback) return publicFallback.url;
  if (product.image_url) return product.image_url;

  const candidates = [
    product.slug ? normalize(String(product.slug)) : "",
    normalize(product.name || ""),
    normalize([product.name, product.brand, product.size].filter(Boolean).join(" ")),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const exact = localAssets.find(asset => asset.key === candidate);
    if (exact) return exact.url;
  }

  // Only use a fuzzy match when both keys are specific enough to avoid
  // assigning an unrelated image to a generic product name.
  for (const candidate of candidates.filter(key => key.length >= 8)) {
    const fuzzy = localAssets.find(asset =>
      asset.key.length >= 8 && (asset.key.includes(candidate) || candidate.includes(asset.key)),
    );
    if (fuzzy) return fuzzy.url;
  }

  return undefined;
}
