import { supabase } from "../lib/supabase";
import {
  buildCatalog,
  verifiedDatasetMetrics,
  type CatalogPayload,
  type PlatformMetrics,
  type Product,
  type StoreRow,
} from "./catalog";
import { withManualAdditions } from "./manualEstablishments";

type EstablishmentRow = {
  id: string;
  slug: string | null;
  name: string | null;
  neighborhood: string | null;
  brand_color: string | null;
};

type ProductRow = {
  id: string | number;
  slug: string | null;
  name: string | null;
  brand: string | null;
  category: string | null;
  size: string | null;
  unit: string | null;
  barcode: string | null;
  image_url: string | null;
};

type PriceRow = {
  product_id: string;
  establishment_id: string;
  value: number | string | null;
  previous_value: number | string | null;
  captured_at: string | null;
  source?: string;
};

export type CatalogSource = "supabase" | "local";

export type CatalogResult = CatalogPayload & { source: CatalogSource; error?: string };

const round = (value: number) => Math.round(value * 100) / 100;
const toNumber = (value: number | string | null) => (value === null ? NaN : Number(value));
const DATABASE_PAGE_SIZE = 1000;
const CATALOG_CACHE_TTL_MS = 60_000;

let cachedCatalog: { value: CatalogResult; expiresAt: number } | null = null;
let pendingCatalog: Promise<CatalogResult> | null = null;

export const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// Gera um slug leg\u00edvel ("mercado-rebou\u00e7as" -> "mercado-reboucas") a partir do
// nome, em vez de expor o UUID interno na barra de endere\u00e7os. Quando dois
// registros geram o mesmo slug (nomes iguais/parecidos), acrescenta um sufixo
// curto e est\u00e1vel derivado do id para manter cada URL \u00fanica.
function slugifyName(name: string, fallbackId: string | number) {
  const base = normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `item-${String(fallbackId).slice(0, 8)}`;
}

function assignUniqueSlugs<T>(rows: T[], getName: (row: T) => string, getId: (row: T) => string | number) {
  const seen = new Map<string, number>();
  const slugById = new Map<string | number, string>();
  for (const row of rows) {
    const id = getId(row);
    const base = slugifyName(getName(row), id);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${String(id).replace(/[^a-z0-9]/gi, "").slice(0, 6) || count}`;
    slugById.set(id, slug);
  }
  return slugById;
}

const normalizeCatalogTerm = (value: string) => normalize(value)
  .replace(/\bmistura lactea condensada\b/g, "leite condensado");

const normalizeUnit = (value: string | null | undefined) => {
  const unit = normalize(value || "").replace(/[^a-z]/g, "");
  if (["un", "und", "unid", "unidade", "unidades"].includes(unit)) return "un";
  if (["pct", "pacote", "pacotes"].includes(unit)) return "pacote";
  if (["cx", "caixa", "caixas"].includes(unit)) return "caixa";
  if (["garrafa", "garrafas"].includes(unit)) return "garrafa";
  if (["frasco", "frascos"].includes(unit)) return "frasco";
  if (["lata", "latas"].includes(unit)) return "lata";
  if (["saco", "sacos"].includes(unit)) return "saco";
  return unit || "un";
};

const measurementToken = (amount: number, unit: string) => {
  const normalizedUnit = normalize(unit).replace(/[^a-z]/g, "");
  if (["kg", "quilo", "quilos", "kilograma", "kilogramas"].includes(normalizedUnit)) return `mass:${Math.round(amount * 1000)}g`;
  if (["g", "gr", "grama", "gramas"].includes(normalizedUnit)) return `mass:${Math.round(amount)}g`;
  if (["l", "lt", "litro", "litros"].includes(normalizedUnit)) return `volume:${Math.round(amount * 1000)}ml`;
  if (["ml", "mililitro", "mililitros"].includes(normalizedUnit)) return `volume:${Math.round(amount)}ml`;
  if (["un", "und", "unid", "unidade", "unidades"].includes(normalizedUnit)) return `count:${Math.round(amount)}un`;
  return `${amount}:${normalizedUnit}`;
};

const extractSpecification = (product: ProductRow) => {
  const source = normalize(`${product.size || ""} ${product.name || ""}`).replace(/,/g, ".");
  const unitPattern = "kg|quilo|quilos|kilograma|kilogramas|g|gr|grama|gramas|l|lt|litro|litros|ml|mililitro|mililitros|un|und|unid|unidade|unidades";
  const pack = source.match(new RegExp(`\\b(\\d+)\\s*x\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})\\b`, "i"));
  if (pack) return `pack:${Number(pack[1])}x${measurementToken(Number(pack[2]), pack[3])}`;

  const single = source.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})\\b`, "i"));
  if (single) return measurementToken(Number(single[1]), single[2]);

  const size = normalize(product.size || "").replace(/[^a-z0-9]+/g, "");
  return size && size !== "-" ? `size:${size}` : `unit:${normalizeUnit(product.unit)}`;
};

const baseProductName = (value: string | null) => normalizeCatalogTerm(value || "")
  .replace(/\b\d+\s*x\s*\d+(?:[.,]\d+)?\s*(?:kg|g|gr|l|lt|ml|un|und|unid|unidade|unidades)\b/g, " ")
  .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grama|gramas|l|lt|litro|litros|ml|mililitro|mililitros|un|und|unid|unidade|unidades)\b/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

// Chave usada apenas na comparação: diferenças de espaço ou pontuação não
// podem separar cadastros do mesmo produto ("Dobom" e "Do Bom").
const identityProductName = (value: string | null) => baseProductName(value)
  .replace(/\s+/g, "")
  .replace(/dobon/g, "dobom");
const identityToken = (value: string | null) => normalize(value || "").replace(/[^a-z0-9]+/g, "");
const isLeiteDobom = (product: ProductRow) => identityProductName(product.name) === "leiteempodobom";
const publicProductName = (product: ProductRow) => isLeiteDobom(product)
  ? "Leite em Pó Dobom 400 g"
  : product.name ?? "Produto sem nome";
const identitySpecification = (product: ProductRow) => {
  // O cadastro legado sem gramagem corresponde ao mesmo Leite Dobom 400 g
  // presente nas demais lojas. Sem este alias, ele ficaria isolado como
  // "unit:un" e criaria um segundo cartão com preço divergente.
  if (isLeiteDobom(product)) return "mass:400g";
  return extractSpecification(product);
};

const productIdentity = (product: ProductRow) => product.barcode
  ? `barcode:${normalize(product.barcode)}`
  : [
      `name:${identityProductName(product.name)}`,
      `brand:${identityToken(product.brand)}`,
      `category:${identityToken(product.category)}`,
      `spec:${identitySpecification(product)}`,
    ].join("|");

async function fetchAllRows(
  table: "establishments" | "products" | "prices",
  columns: string,
  orderColumn: string,
) {
  const rows: unknown[] = [];

  for (let from = 0; ; from += DATABASE_PAGE_SIZE) {
    const response = await supabase!
      .from(table)
      .select(columns)
      .order(orderColumn, { ascending: true })
      .range(from, from + DATABASE_PAGE_SIZE - 1);

    if (response.error) return { data: rows, error: response.error };

    const page = response.data ?? [];
    rows.push(...page);
    if (page.length < DATABASE_PAGE_SIZE) return { data: rows, error: null };
  }
}

async function loadCatalog(query = ""): Promise<CatalogResult> {
  const local = buildCatalog(query);

  if (!supabase) {
    return { ...local, source: "local", error: "Supabase não configurado." };
  }

  try {
    const [establishments, products, prices] = await Promise.all([
      fetchAllRows("establishments", "id, name, neighborhood, brand_color", "id"),
      fetchAllRows("products", "id, name, brand, category, size, unit, barcode, image_url", "id"),
      fetchAllRows("prices", "id, product_id, establishment_id, value, previous_value, captured_at", "id"),
    ]);

    const failure = establishments.error ?? products.error ?? prices.error;
    if (failure) {
      return { ...local, source: "local", error: failure.message };
    }

    const storeRows = (establishments.data ?? []) as unknown as EstablishmentRow[];
    const productRows = ((products.data ?? []) as unknown as ProductRow[]).filter(product =>
      normalize(product.name || "") !== "test product",
    );
    const priceRows = ((prices.data ?? []) as unknown as PriceRow[]).filter(row =>
      Number.isFinite(toNumber(row.value)),
    );

    if (!storeRows.length || !productRows.length || !priceRows.length) {
      return { ...local, source: "local", error: "Banco conectado, porém sem dados de preços." };
    }

    const q = normalizeCatalogTerm(query);
    const storesById = new Map(storeRows.map(store => [String(store.id), store]));
    const storeSlugById = assignUniqueSlugs(storeRows, store => store.name || "Estabelecimento", store => String(store.id));
    const pricesByProductId = new Map<string, PriceRow[]>();
    const productIdsByStore = new Map<string, Set<string>>();

    priceRows.forEach(price => {
      const productId = String(price.product_id);
      const storeId = String(price.establishment_id);
      const productPrices = pricesByProductId.get(productId);
      if (productPrices) productPrices.push(price);
      else pricesByProductId.set(productId, [price]);

      const storeProducts = productIdsByStore.get(storeId);
      if (storeProducts) storeProducts.add(productId);
      else productIdsByStore.set(storeId, new Set([productId]));
    });

    const productPriceMap = new Map<string, PriceRow[]>();
    productRows.forEach(product => {
      const key = productIdentity(product);
      const rows = pricesByProductId.get(String(product.id)) || [];
      const groupedRows = productPriceMap.get(key);
      if (groupedRows) groupedRows.push(...rows);
      else productPriceMap.set(key, [...rows]);
    });

    const uniqueProductRows = Array.from(
      productRows.reduce((map, product) => {
        const key = productIdentity(product);
        const current = map.get(key);
        if (!current || (!current.image_url && product.image_url)) map.set(key, product);
        return map;
      }, new Map<string, ProductRow>()).values(),
    );

    const productSlugById = assignUniqueSlugs(uniqueProductRows, product => publicProductName(product), product => String(product.id));

    const mapped = uniqueProductRows
      .map((product): Product | null => {
        const key = productIdentity(product);
        const rows = productPriceMap.get(key) || [];
        if (!rows.length) return null;

        const latestByStore = Array.from(rows.reduce((map, row) => {
          const current = map.get(String(row.establishment_id));
          const incomingTime = Date.parse(row.captured_at || "") || 0;
          const currentTime = Date.parse(current?.captured_at || "") || 0;
          if (!current || incomingTime >= currentTime) map.set(String(row.establishment_id), row);
          return map;
        }, new Map<string, PriceRow>()).values());

        const values = latestByStore.map(row => toNumber(row.value)).filter(Number.isFinite);
        if (!values.length) return null;

        const best = latestByStore.reduce((lowest, row) =>
          toNumber(row.value) < toNumber(lowest.value) ? row : lowest,
        );
        const store = storesById.get(String(best.establishment_id));
        if (!store) return null;

        const previous = toNumber(best.previous_value);
        const normalizedProductName = normalize(product.name || "");
        const normalizedProductSize = normalize(product.size || "").replace(/\s+/g, "");
        const isLimpolPerfumes500ml = normalizedProductName.includes("limpol perfumes")
          && (normalizedProductName.includes("500ml") || normalizedProductSize === "500ml");

        return {
          id: product.id,
          slug: productSlugById.get(String(product.id)) || String(product.id),
          name: publicProductName(product),
          brand: isLeiteDobom(product) ? "Dobom" : product.brand ?? "—",
          category: isLimpolPerfumes500ml ? "Desinfetante" : product.category ?? "Geral",
          size: isLeiteDobom(product) ? "400 g" : product.size ?? "—",
          unit: product.unit ?? "un",
          barcode: product.barcode ?? undefined,
          minPrice: round(Math.min(...values)),
          avgPrice: round(values.reduce((total, value) => total + value, 0) / values.length),
          maxPrice: round(Math.max(...values)),
          storeCount: latestByStore.length,
          establishmentId: store.id,
          establishmentSlug: storeSlugById.get(String(store.id)) || String(store.id),
          establishment: store.name ?? "Estabelecimento",
          neighborhood: store.neighborhood ?? "—",
          storeColor: store.brand_color ?? "#1473E6",
          capturedAt: best.captured_at ?? new Date().toISOString(),
          previousPrice: Number.isFinite(previous) ? round(previous) : undefined,
          image_url: product.image_url || undefined,
          source: "Coleta Manual",
          updated_at: best.captured_at || undefined,
          offers: latestByStore.map(row => {
            const offerStore = storesById.get(String(row.establishment_id));
            const offerPrevious = toNumber(row.previous_value);
            return {
              establishmentId: row.establishment_id,
              establishmentSlug: storeSlugById.get(String(row.establishment_id)) || String(row.establishment_id),
              establishment: offerStore?.name ?? "Estabelecimento",
              neighborhood: offerStore?.neighborhood ?? "—",
              storeColor: offerStore?.brand_color ?? "#1473E6",
              value: round(toNumber(row.value)),
              capturedAt: row.captured_at ?? new Date().toISOString(),
              previousPrice: Number.isFinite(offerPrevious) ? round(offerPrevious) : undefined,
            };
          }).sort((a, b) => a.value - b.value),
          price_history: rows
            .map(row => ({ date: row.captured_at || new Date().toISOString(), value: toNumber(row.value) }))
            .filter(item => Number.isFinite(item.value))
            .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
        };
      })
      .filter((product): product is Product => product !== null)
      .filter(product => {
        if (!q) return true;
        const searchFields = [product.name, product.category, product.brand, product.barcode, product.size].filter(Boolean) as string[];
        const qNoSpace = q.replace(/\s+/g, "");
        return searchFields.some(field => {
          const normalizedField = normalizeCatalogTerm(field);
          return normalizedField.includes(q) || normalizedField.replace(/\s+/g, "").includes(qNoSpace);
        });
      })
      .sort((a, b) =>
        a.minPrice - b.minPrice ||
        a.name.localeCompare(b.name, "pt-BR") ||
        String(a.id).localeCompare(String(b.id)));

    const stores: StoreRow[] = storeRows
      .map(store => ({
        id: store.id,
        slug: storeSlugById.get(String(store.id)) || String(store.id),
        name: store.name ?? "Estabelecimento",
        neighborhood: store.neighborhood ?? "—",
        color: store.brand_color ?? "#1473E6",
        products: productIdsByStore.get(String(store.id))?.size ?? 0,
      }))
      .sort((a, b) => {
        const aHasCatalog = a.products > 0 ? 1 : 0;
        const bHasCatalog = b.products > 0 ? 1 : 0;
        if (aHasCatalog !== bHasCatalog) return bHasCatalog - aHasCatalog;
        if (aHasCatalog && bHasCatalog && a.products !== b.products) return b.products - a.products;
        return a.name.localeCompare(b.name, "pt-BR");
      });

    const metrics: PlatformMetrics = {
      products: productRows.length || verifiedDatasetMetrics.products,
      prices: priceRows.length || verifiedDatasetMetrics.prices,
      stores: storeRows.length || verifiedDatasetMetrics.stores,
    };

    const merged = withManualAdditions({ products: mapped, stores, metrics, updatedAt: new Date().toISOString() }, query);

    return {
      ...merged,
      source: "supabase",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar o banco.";
    return { ...local, source: "local", error: message };
  }
}

export function fetchCatalog(
  query = "",
  options: { force?: boolean } = {},
): Promise<CatalogResult> {
  const canReuse = !query && !options.force;

  if (canReuse && cachedCatalog && cachedCatalog.expiresAt > Date.now()) {
    return Promise.resolve(cachedCatalog.value);
  }
  if (canReuse && pendingCatalog) return pendingCatalog;

  const request = loadCatalog(query);
  if (!query) {
    pendingCatalog = request;
    request.then(value => {
      cachedCatalog = { value, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS };
    }).finally(() => {
      if (pendingCatalog === request) pendingCatalog = null;
    });
  }
  return request;
}
