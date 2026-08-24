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

// Recortes com fundo transparente, derivados das fotos originais removendo o
// branco ligado à borda. São preferidos porque a moldura do cartão é colorida:
// a foto original desenha um retângulo branco dentro dela.
const cutoutImages = import.meta.glob("../assets/products-cut/*.webp", {
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

const cutoutAssets = Object.entries(cutoutImages).map(([path, url]) => ({
  url,
  key: normalize(path.replace(/^.*\//, "")),
}));

// Os recortes entram antes na lista, então vencem o empate por chave.
localAssets.unshift(...cutoutAssets);
localAssets.push(...productAssets);

const cutoutKeys = new Set(cutoutAssets.map(item => item.key));

function cutoutKeyFor(product: Product): string | undefined {
  const candidates = [
    product.slug ? normalize(String(product.slug)) : "",
    normalize(product.name || ""),
    normalize([product.name, product.brand, product.size].filter(Boolean).join(" ")),
  ].filter(key => key.length >= 8);

  for (const candidate of candidates) {
    if (cutoutKeys.has(candidate)) return candidate;
  }
  for (const candidate of candidates) {
    const key = [...cutoutKeys].find(k => k.includes(candidate) || candidate.includes(k));
    if (key) return key;
  }
  return undefined;
}

/** Indica se o produto tem uma foto local recortada, sem fundo branco. */
export function hasCutout(product: Product) {
  return Boolean(cutoutKeyFor(product));
}

/** A imagem sem fundo branco do produto, quando existe uma. */
export function resolveCutoutImage(product: Product): string | undefined {
  const key = cutoutKeyFor(product);
  if (!key) return undefined;
  return cutoutAssets.find(item => item.key === key)?.url;
}

const publicFallbacks = [
  { terms: ["aguasanitaria", "ype", "1l"], url: "/products/agua-sanitaria-ype-1l.jpg" },
  { terms: ["aguasanitaria", "ype", "2l"], url: "/products/agua-sanitaria-ype-2l.jpg" },
  { terms: ["bisteca"], url: "/products/bisteca.jpg" },
  { terms: ["arroz", "tiojoao"], url: "/products/arroz-tio-joao-5kg.png" },
  { terms: ["arroz", "bernardo"], url: "/products/arroz-branco-bernardo-1kg.jpg" },
  { terms: ["cafe", "3coracoes"], url: "/products/cafe-3-coracoes-500g.jpg" },
  { terms: ["leite", "empo", "italac", "integral", "400g"], url: "/products/leite-em-po-italac-integral-400g.webp" },
  { terms: ["leite", "italac"], url: "/products/leite-italac-1l.jpg" },
  { terms: ["feijao", "kicaldo"], url: "/products/feijao-kicaldo-1kg.jpg" },
  { terms: ["feijao", "bernardo"], url: "/products/feijao-carioca-bernardo-1kg.jpg" },
  { terms: ["acucar", "uniao"], url: "/products/acucar-uniao-1kg.jpg" },
  { terms: ["detergente", "ype"], url: "/products/detergente-ypx-neutro-500ml.jpg" },
] as const;

// Alguns cadastros antigos receberam a URL de outro produto. Uma empada não
// deve herdar uma foto genérica/vermelha só porque existe uma URL no banco.
// Mantemos o estado neutro da interface até haver um arquivo identificável
// como empada, evitando informação visual enganosa para o consumidor.
function hasKnownImageMismatch(product: Product) {
  const productIdentity = normalize([product.name, product.slug].filter(Boolean).join(" "));
  if (!productIdentity.includes("empada")) return false;
  return Boolean(product.image_url && !normalize(product.image_url).includes("empada"));
}

export function resolveProductImage(product: Product): string | undefined {
  const identity = normalize([product.name, product.brand, product.size].filter(Boolean).join(" "));

  // A arte antiga da cebola roxa contém uma etiqueta promocional incorporada
  // ("400g / 2 a 3 unid.") com textos sobrepostos. Forçamos a fotografia limpa
  // já existente no projeto em todos os cards, modais e páginas do produto.
  if (identity.includes("cebolaroxa")) {
    const cleanRedOnion = localAssets.find(asset => asset.key === "cebolaroxakg");
    if (cleanRedOnion) return cleanRedOnion.url;
  }

  // A imagem vinculada ao cadastro do produto é sempre a fonte principal.
  // Os arquivos locais existem apenas como contingência para cadastros sem foto.
  if (product.image_url && !hasKnownImageMismatch(product)) return product.image_url;
  const publicFallback = publicFallbacks.find(item => item.terms.every(term => identity.includes(term)));
  if (publicFallback) return publicFallback.url;

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
