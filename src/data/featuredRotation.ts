import type { Product } from "./catalog";
import { resolveProductImage } from "./productImageResolver";

/** Duração de cada ciclo da vitrine. */
export const ROTATION_MS = 60 * 60 * 1000;

/** Índice do ciclo atual — muda a cada 60 minutos e é igual para todos. */
export function currentCycle(now = Date.now()) {
  return Math.floor(now / ROTATION_MS);
}

/** Milissegundos até o próximo ciclo. */
export function msUntilNextCycle(now = Date.now()) {
  return ROTATION_MS - (now % ROTATION_MS);
}

// Gerador determinístico: o mesmo ciclo produz sempre a mesma vitrine, então
// dois visitantes veem a mesma coisa e um recarregar não embaralha tudo.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const storeKey = (product: Product) =>
  (product.establishment || "").trim().toLowerCase() || "sem-estabelecimento";

const normalizeIdentity = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "")
  .trim();

const productKey = (product: Product) => normalizeIdentity([
  product.name,
  product.brand,
  product.size,
].filter(Boolean).join(" ")) || String(product.id);

const imageKey = (product: Product) =>
  resolveProductImage(product)?.split("?")[0].toLowerCase() || `sem-imagem:${productKey(product)}`;

/**
 * Monta a vitrine do ciclo.
 *
 * Duas regras comandam a escolha. A primeira é a imagem: só entram produtos
 * que tenham uma foto resolvível, seja ela cadastrada ou um ativo local seguro.
 *
 * A segunda é a repartição entre estabelecimentos. Sortear produtos direto
 * favoreceria quem tem catálogo maior — uma loja com quarenta itens apareceria
 * muito mais que uma com cinco. Aqui a vitrine é montada em rodadas: cada
 * rodada percorre os estabelecimentos e tira um produto de cada, então todos
 * aparecem antes que qualquer um repita.
 */
export function buildFeatured(products: Product[], cycle: number, size = 6) {
  const comPreco = products.filter(product => product.minPrice > 0);
  const comImagem = comPreco.filter(product => Boolean(resolveProductImage(product)));
  const elegiveis = comImagem;
  if (!elegiveis.length) return [];

  const random = mulberry32(cycle * 2654435761);

  const porLoja = new Map<string, Product[]>();
  for (const product of elegiveis) {
    const key = storeKey(product);
    const lista = porLoja.get(key);
    if (lista) lista.push(product);
    else porLoja.set(key, [product]);
  }

  // Ordem das lojas e ordem interna de cada uma variam por ciclo, para que a
  // vitrine não comece sempre pelo mesmo estabelecimento.
  const lojas = shuffle([...porLoja.keys()], random).map(key => shuffle(porLoja.get(key)!, random));

  const escolhidos: Product[] = [];
  const produtosUsados = new Set<string>();
  const imagensUsadas = new Set<string>();
  const candidatos: Product[] = [];
  for (let rodada = 0; ; rodada += 1) {
    let encontrou = false;
    for (const fila of lojas) {
      const produto = fila[rodada];
      if (!produto) continue;
      candidatos.push(produto);
      encontrou = true;
    }
    if (!encontrou) break;
  }

  for (const produto of candidatos) {
      if (escolhidos.length >= size) break;
      const chaveProduto = productKey(produto);
      const chaveImagem = imageKey(produto);
      // O mesmo item pode existir em várias lojas e variantes podem apontar
      // para o mesmo arquivo. A vitrine mostra cada identidade visual uma vez.
      if (produtosUsados.has(chaveProduto) || imagensUsadas.has(chaveImagem)) continue;
      escolhidos.push(produto);
      produtosUsados.add(chaveProduto);
      imagensUsadas.add(chaveImagem);
  }

  return escolhidos;
}
