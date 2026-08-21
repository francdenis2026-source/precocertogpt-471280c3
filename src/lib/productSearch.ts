import type { Product } from "../data/catalog";

export const normalizeSearchText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

export function productSearchScore(product: Product, query: string) {
  const q = normalizeSearchText(query);
  if (!q) return 1;
  const name = normalizeSearchText(product.name);
  const brand = normalizeSearchText(product.brand);
  const category = normalizeSearchText(product.category);
  const barcode = normalizeSearchText(product.barcode ?? "");
  const all = normalizeSearchText([product.name, product.brand, product.category, product.size, product.unit, product.barcode].filter(Boolean).join(" "));
  const tokens = q.split(" ").filter(Boolean);
  if (!tokens.every(token => all.includes(token))) return 0;
  let score = 20;
  if (name === q) score += 120;
  else if (name.startsWith(q)) score += 90;
  else if (name.includes(q)) score += 70;
  if (brand === q || brand.startsWith(q)) score += 35;
  if (category === q) score += 20;
  if (barcode === q) score += 140;
  score += tokens.filter(token => name.includes(token)).length * 12;
  score += tokens.filter(token => brand.includes(token)).length * 5;
  return score;
}

export function searchProducts(products: Product[], query: string) {
  const q = normalizeSearchText(query);
  if (!q) return [...products];
  return products.map(product => ({ product, score: productSearchScore(product, q) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
    .map(item => item.product);
}

/**
 * Sugestões enquanto o usuário digita. Aceita prefixos de palavras ("arr" →
 * "arroz"), mas não aproxima palavras apenas parecidas. Ofertas repetidas em
 * lojas diferentes são consolidadas, mantendo a de menor preço na prévia.
 */
export function suggestProducts(products: Product[], query: string, limit = 6) {
  const q = normalizeSearchText(query);
  if (!q) return [...products].sort((a, b) => a.minPrice - b.minPrice).slice(0, limit);

  const queryTokens = q.split(" ").filter(Boolean);
  const matches = products.filter(product => {
    const nameWords = normalizeSearchText(product.name).split(" ");
    return queryTokens.every(token => nameWords.some(word => word === token || word.startsWith(token)));
  });

  const unique = new Map<string, Product>();
  for (const product of matches.sort((a, b) => productSearchScore(b, q) - productSearchScore(a, q) || a.minPrice - b.minPrice)) {
    const key = normalizeSearchText([product.name, product.brand, product.size].join("|"));
    const saved = unique.get(key);
    if (!saved || product.minPrice < saved.minPrice) unique.set(key, product);
  }
  return [...unique.values()].slice(0, limit);
}

const similarityNoise = new Set([
  "a", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "o", "os",
  "para", "por", "sem", "tipo", "tradicional", "classico", "classica", "sabor",
  "pacote", "garrafa", "frasco", "caixa", "lata", "pote", "sache", "unidade",
  "unidades", "kg", "g", "mg", "l", "ml",
]);

function productFamilyTokens(product: Product) {
  const brandTokens = new Set(normalizeSearchText(product.brand || "").split(" ").filter(Boolean));
  return [...new Set(normalizeSearchText(product.name).split(" ").filter(token =>
    token.length >= 3 &&
    !/^\d+$/.test(token) &&
    !similarityNoise.has(token) &&
    !brandTokens.has(token),
  ))];
}

function similarityScore(reference: Product, candidate: Product) {
  if (String(reference.id) === String(candidate.id)) return 0;

  const referenceCategory = normalizeSearchText(reference.category || "");
  const candidateCategory = normalizeSearchText(candidate.category || "");
  if (referenceCategory && candidateCategory && referenceCategory !== candidateCategory) return 0;

  const referenceTokens = productFamilyTokens(reference);
  const candidateTokens = productFamilyTokens(candidate);
  const shared = referenceTokens.filter(token => candidateTokens.includes(token));

  // Categoria isolada nunca define similaridade: "Mercearia", por exemplo,
  // pode conter arroz, feijão, óleo e biscoito. É obrigatório compartilhar ao
  // menos um termo real da família/natureza do produto.
  if (!shared.length) return 0;

  const referenceIdentity = normalizeSearchText([reference.name, reference.brand, reference.size].join(" "));
  const candidateIdentity = normalizeSearchText([candidate.name, candidate.brand, candidate.size].join(" "));
  if (referenceIdentity === candidateIdentity) return 0;

  const union = new Set([...referenceTokens, ...candidateTokens]).size || 1;
  let score = shared.length * 100 + (shared.length / union) * 60;
  if (referenceTokens[0] && referenceTokens[0] === candidateTokens[0]) score += 45;
  if (normalizeSearchText(reference.brand || "") === normalizeSearchText(candidate.brand || "")) score += 15;
  if (normalizeSearchText(reference.unit || "") === normalizeSearchText(candidate.unit || "")) score += 5;
  return score;
}

/**
 * Retorna somente alternativas com relação lexical real com o produto.
 * Quando não há uma família compatível no catálogo, devolve uma lista vazia
 * em vez de preencher o espaço com itens aleatórios da mesma categoria.
 */
export function findSimilarProducts(products: Product[], reference: Product, limit = 4) {
  return products
    .map(product => ({ product, score: similarityScore(reference, product) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.minPrice - b.product.minPrice || a.product.name.localeCompare(b.product.name, "pt-BR"))
    .slice(0, limit)
    .map(item => item.product);
}
