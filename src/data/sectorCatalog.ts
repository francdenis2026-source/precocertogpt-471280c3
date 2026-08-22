import { supabase } from "../lib/supabase";
import { fetchCatalog } from "./remoteCatalog";
import type { CatalogPayload, Product, StoreRow } from "./catalog";
import { businessGroups, groupForStore, type BusinessGroup } from "./businessTaxonomy";

/* Como um estabelecimento entra (ou não) em um grupo da navegação.
 *
 * O modelo antigo exigia DUAS condições ao mesmo tempo para uma loja aparecer
 * num grupo: (1) o tipo do negócio bater com uma lista de palavras e (2) os
 * PRODUTOS dela conterem certos termos no nome ou na categoria. A segunda
 * condição era o erro. O Ponto do Sanduba, por exemplo, cadastra os itens em
 * "Sanduíches", "Refrigerantes" e "Suco Natural"; como nenhuma dessas palavras
 * estava na lista de termos do grupo de alimentação, a lanchonete inteira
 * desaparecia da navegação mesmo tendo cardápio completo. O mesmo acontecia
 * com açougues (o código ainda exigia que carnes só aparecessem em lojas do
 * tipo "butcher", que por sua vez não existia em nenhum grupo — ou seja,
 * carne nunca aparecia em lugar nenhum).
 *
 * Agora vale a regra óbvia: uma padaria é uma padaria, um açougue é um
 * açougue. O grupo vem do TIPO DO NEGÓCIO (ver businessTaxonomy.ts) e os
 * produtos do grupo são simplesmente os produtos vendidos por essas lojas —
 * sem depender de como cada lojista escreveu a categoria do item. */

export type SectorRule = BusinessGroup | { id: string };

export const storeMatchesSector = (store: StoreRow, sector: SectorRule) => groupForStore(store).id === sector.id;

export const productStoreIds = (product: Product) =>
  new Set([String(product.establishmentId), ...(product.offers || []).map(offer => String(offer.establishmentId))]);

/** Um produto pertence ao grupo quando alguma loja que o vende pertence ao grupo. */
export const productHasSectorOffer = (product: Product, catalog: CatalogPayload, sector: SectorRule) => {
  const ids = productStoreIds(product);
  return catalog.stores.some(store => ids.has(String(store.id)) && storeMatchesSector(store, sector));
};

export const sectorProducts = (catalog: CatalogPayload, sector: SectorRule) =>
  catalog.products.filter(product => productHasSectorOffer(product, catalog, sector));

/* Todos os estabelecimentos do grupo, com quantos itens cada um tem no
 * catálogo. Diferente da versão anterior, uma loja NÃO é escondida por ainda
 * não ter produtos cadastrados: um açougue recém-cadastrado continua sendo um
 * açougue e precisa aparecer para quem procura açougue na cidade. Quem quiser
 * só as lojas com catálogo usa `withCatalog`. */
export const sectorStores = (catalog: CatalogPayload, sector: SectorRule) => {
  const counts = new Map<string, number>();
  for (const product of catalog.products) {
    for (const id of productStoreIds(product)) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return catalog.stores
    .filter(store => storeMatchesSector(store, sector))
    .map(store => ({ store, count: counts.get(String(store.id)) || Number(store.products) || 0 }))
    .sort((a, b) => b.count - a.count || a.store.name.localeCompare(b.store.name, "pt-BR"));
};

export const withCatalog = <T extends { count: number }>(rows: T[]) => rows.filter(row => row.count > 0);

/** Quantos estabelecimentos existem em cada grupo — usado para montar a
 *  navegação sem mostrar grupo vazio como se fosse igual aos demais. */
export const groupCounts = (catalog: CatalogPayload) => {
  const totals = new Map<string, { stores: number; withCatalog: number }>();
  for (const group of businessGroups) totals.set(group.id, { stores: 0, withCatalog: 0 });
  for (const store of catalog.stores) {
    const id = groupForStore(store).id;
    const entry = totals.get(id);
    if (!entry) continue;
    entry.stores += 1;
    if ((Number(store.products) || 0) > 0) entry.withCatalog += 1;
  }
  return totals;
};

let enhancedCache: { value: CatalogPayload; expires: number } | null = null;
let pending: Promise<CatalogPayload> | null = null;

export async function fetchSectorCatalog(force = false): Promise<CatalogPayload> {
  if (!force && enhancedCache && enhancedCache.expires > Date.now()) return enhancedCache.value;
  if (!force && pending) return pending;
  pending = (async () => {
    const catalog = await fetchCatalog("", { force });
    if (!supabase) return catalog;
    const { data, error } = await supabase.from("establishments").select("id,kind");
    if (error || !data) return catalog;
    const kinds = new Map(data.map(row => [String(row.id), String(row.kind || "")]));
    // Nada de `|| "market"` aqui: um tipo em branco tem que continuar em
    // branco para que a taxonomia possa deduzir pelo nome ("Padaria X" vira
    // padaria) e, no pior caso, cair honestamente em "Outros comércios". O
    // padrão antigo transformava todo cadastro sem tipo em mercado, que é a
    // origem da maior parte da classificação errada que se via no site.
    const value = {
      ...catalog,
      stores: catalog.stores.map(store => ({ ...store, kind: kinds.get(String(store.id)) || store.kind || "" })),
    };
    enhancedCache = { value, expires: Date.now() + 60_000 };
    return value;
  })();
  try { return await pending; } finally { pending = null; }
}

export function prefetchSectorCatalog() { void fetchSectorCatalog().catch(() => undefined); }
