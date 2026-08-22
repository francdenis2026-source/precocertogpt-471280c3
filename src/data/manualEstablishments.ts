// Estabelecimentos cadastrados manualmente — cobre negócios reais que ainda não
// têm um cadastro próprio no banco (Supabase) desta sessão, mas que já devem
// aparecer em produção: diretório de estabelecimentos, busca, cesta e página
// própria do comércio. Some daqui quando o negócio ganhar cadastro oficial no
// painel do lojista, para não duplicar o registro.
//
// Primeiro negócio: Kelly Burguearia e Lanchonete (Feijó-AC), cardápio enviado
// pela proprietária em 22/08/2026 — dados a seguir são o cardápio oficial.

import type { CatalogPayload, Product, ProductOffer, StoreRow } from "./catalog";

export const KELLY_ID = "kelly-burgueria-lanchonete";
export const KELLY_NAME = "Kelly Burgueria e Lanchonete";
export const KELLY_NEIGHBORHOOD = "Bela Vista";
export const KELLY_COLOR = "#e7b400";
export const KELLY_ADDRESS = "Rua José Leopoldino Guimarães, Feijó - AC, 69960-000";
export const KELLY_CNPJ = "42.755.163/0001-24";
export const KELLY_PHONE = "(68) 99939-5494";
export const KELLY_WHATSAPP = "5568999395494";
export const KELLY_INSTAGRAM = "https://instagram.com/kellyburgueria";

export type MenuItem = { name: string; category: string; price: number; description?: string };

export const KELLY_MENU_CATEGORIES = [
  "Hambúrgueres",
  "Carne na Chapa",
  "Lanches Rápidos",
  "Panquecas",
  "Monte sua Batata",
  "Adicionais",
  "Bebidas",
  "Suco Natural",
] as const;

export const KELLY_MENU: MenuItem[] = [
  // Hambúrgueres
  { name: "Guloso", category: "Hambúrgueres", price: 30, description: "Hambúrguer duplo, molho barbecue, ovo duplo, frango, molho cheddar, calabresa, bacon, cebola, banana frita, queijo, presunto, alface, tomate e milho." },
  { name: "Triplo X Burguer", category: "Hambúrgueres", price: 30, description: "3 hambúrgueres, 2 ovos, bacon, queijo, cheddar, alface e tomate." },
  { name: "Super Apimentado", category: "Hambúrgueres", price: 26, description: "Hambúrguer duplo, queijo, presunto, ovos, bacon, banana frita, cebola, tomate, alface e pasta cremosa apimentada." },
  { name: "Tudão", category: "Hambúrgueres", price: 26, description: "Hambúrguer, molho barbecue, frango, cheddar, salsicha, calabresa, bacon, cebola, ovo, banana frita, queijo, presunto, alface, tomate e milho." },
  { name: "Beef Burg", category: "Hambúrgueres", price: 26, description: "Tiras de filé bovino, molho barbecue, cebola, molho apimentado, alface e tomate." },
  { name: "Catupiry", category: "Hambúrgueres", price: 25, description: "Alface, tomate, frango desfiado, presunto, catupiry, queijo, bacon, calabresa e banana da terra." },
  { name: "Picante", category: "Hambúrgueres", price: 23, description: "Hambúrguer, bacon, queijo, presunto, banana comprida, molho cremoso, apimentado e alface." },
  { name: "Fran-Burguer", category: "Hambúrgueres", price: 22, description: "Hambúrguer, frango desfiado, presunto, cebola caramelizada, catupiry, queijo, alface e tomate." },
  { name: "Tudo", category: "Hambúrgueres", price: 22, description: "Hambúrguer, molho barbecue, salsicha, calabresa, ovo, queijo, presunto, alface, tomate e milho." },
  { name: "Bacon-Burguer", category: "Hambúrgueres", price: 20, description: "Hambúrguer, bacon, queijo, presunto, alface, tomate e milho." },
  { name: "Frango", category: "Hambúrgueres", price: 20, description: "Frango, cheddar, batata palha, queijo, presunto, alface, tomate e milho." },
  { name: "Salada Especial", category: "Hambúrgueres", price: 15, description: "Hambúrguer, banana curta caramelizada, queijo, presunto e salada." },
  { name: "Cala-Burguer", category: "Hambúrgueres", price: 15, description: "Hambúrguer, calabresa, queijo, presunto e salada." },
  { name: "Salada", category: "Hambúrgueres", price: 14, description: "Hambúrguer, queijo, presunto e salada." },
  { name: "Burguer", category: "Hambúrgueres", price: 10, description: "Hambúrguer, queijo e presunto." },

  // Carne na Chapa
  { name: "Picanha", category: "Carne na Chapa", price: 40, description: "Na chapa. Acompanhamento a consultar no ato do pedido." },
  { name: "Filé de Boi", category: "Carne na Chapa", price: 40, description: "Na chapa. Acompanhamento a consultar no ato do pedido." },
  { name: "Tiras de Alcatra", category: "Carne na Chapa", price: 38, description: "Na chapa. Acompanhamento a consultar no ato do pedido." },
  { name: "Filé de Frango", category: "Carne na Chapa", price: 35, description: "Na chapa. Acompanhamento a consultar no ato do pedido." },

  // Lanches Rápidos
  { name: "Dogg", category: "Lanches Rápidos", price: 10, description: "Salsicha, batata palha, queijo, presunto e salada." },
  { name: "Americano", category: "Lanches Rápidos", price: 10, description: "Ovo, queijo, presunto e salada." },
  { name: "Misto-Quente", category: "Lanches Rápidos", price: 10, description: "Queijo e presunto." },

  // Panquecas
  { name: "Panqueca de Frango c/ Catupiry e Cheddar", category: "Panquecas", price: 12 },
  { name: "Panqueca de Carne c/ Catupiry e Cheddar", category: "Panquecas", price: 12 },
  { name: "Panqueca de Frango ou Carne c/ Queijo e Banana", category: "Panquecas", price: 12 },
  { name: "Galinha Picante c/ Molho de Panqueca", category: "Panquecas", price: 10 },
  { name: "Panqueca de Frango ou Carne com Catupiry", category: "Panquecas", price: 10 },
  { name: "Panqueca de Frango ou Carne com Cheddar", category: "Panquecas", price: 10 },
  { name: "Panqueca de Carne", category: "Panquecas", price: 8 },
  { name: "Panqueca de Frango", category: "Panquecas", price: 8 },
  { name: "Galinha Picante", category: "Panquecas", price: 8 },

  // Monte sua Batata
  { name: "Fritas Tradicionais 300g", category: "Monte sua Batata", price: 22 },
  { name: "Fritas Tradicionais 100g", category: "Monte sua Batata", price: 12 },

  // Adicionais
  { name: "Bacon (adicional)", category: "Adicionais", price: 8 },
  { name: "Calabresa (adicional)", category: "Adicionais", price: 6 },
  { name: "Cheddar (adicional)", category: "Adicionais", price: 5 },
  { name: "Molho Rosê (adicional)", category: "Adicionais", price: 3 },
  { name: "Maionese (adicional)", category: "Adicionais", price: 2 },

  // Bebidas
  { name: "Coca-Cola 2L", category: "Bebidas", price: 15 },
  { name: "Fanta Laranja 2L", category: "Bebidas", price: 15 },
  { name: "Fanta Uva 2L", category: "Bebidas", price: 15 },
  { name: "Coca-Cola Zero 2L", category: "Bebidas", price: 15 },
  { name: "Coca-Cola 1,5L", category: "Bebidas", price: 13 },
  { name: "Fanta Laranja 1,5L", category: "Bebidas", price: 12 },
  { name: "Tuchaua 2L", category: "Bebidas", price: 12 },
  { name: "Fanta Laranja 1L", category: "Bebidas", price: 12 },
  { name: "Coca-Cola 1L", category: "Bebidas", price: 12 },
  { name: "Coca-Cola 600ml", category: "Bebidas", price: 10 },
  { name: "Fanta Laranja Lata", category: "Bebidas", price: 6 },
  { name: "Fanta Uva Lata", category: "Bebidas", price: 6 },
  { name: "Tuchaua Lata", category: "Bebidas", price: 6 },
  { name: "Coca-Cola Lata", category: "Bebidas", price: 6 },
  { name: "Coca-Cola KS 290ml", category: "Bebidas", price: 5 },
  { name: "Água com Gás", category: "Bebidas", price: 4 },
  { name: "Água Mineral", category: "Bebidas", price: 3 },

  // Suco Natural
  { name: "Suco de Maracujá 300ml", category: "Suco Natural", price: 10 },
  { name: "Adicional de Leite", category: "Suco Natural", price: 2 },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CAPTURED_AT = "2026-08-22T09:00:00-05:00";

export const manualStores: StoreRow[] = [
  { id: KELLY_ID, slug: KELLY_ID, name: KELLY_NAME, neighborhood: KELLY_NEIGHBORHOOD, color: KELLY_COLOR, products: KELLY_MENU.length, kind: "snack_bar" },
];

export const manualProducts: Product[] = KELLY_MENU.map((item) => {
  const id = `kelly-${slugify(item.name)}`;
  const offer: ProductOffer = {
    establishmentId: KELLY_ID,
    establishmentSlug: KELLY_ID,
    establishment: KELLY_NAME,
    neighborhood: KELLY_NEIGHBORHOOD,
    storeColor: KELLY_COLOR,
    value: item.price,
    capturedAt: CAPTURED_AT,
  };
  return {
    id,
    slug: id,
    name: item.name,
    brand: "Kelly Burgueria",
    category: item.category,
    size: item.description || "Porção única",
    unit: "un",
    minPrice: item.price,
    avgPrice: item.price,
    maxPrice: item.price,
    storeCount: 1,
    establishmentId: KELLY_ID,
    establishmentSlug: KELLY_ID,
    establishment: KELLY_NAME,
    neighborhood: KELLY_NEIGHBORHOOD,
    storeColor: KELLY_COLOR,
    capturedAt: CAPTURED_AT,
    source: "Cardápio oficial (Kelly Burgueria e Lanchonete)",
    offers: [offer],
  } satisfies Product;
});

/**
 * Mescla os cadastros manuais (acima) num CatalogPayload já resolvido, seja
 * ele vindo do Supabase ou do catálogo local de fallback. Aplica o mesmo
 * filtro de busca usado no restante do catálogo, para que a Kelly Burgueria
 * apareça normalmente em /buscar, na cesta e no diretório de estabelecimentos.
 */
export function withManualAdditions(payload: CatalogPayload, query = ""): CatalogPayload {
  const q = normalize(query);
  const matchesQuery = (product: Product) =>
    !q || [product.name, product.category, product.brand].some(field => normalize(field || "").includes(q));

  const extraProducts = manualProducts.filter(matchesQuery);
  const alreadyPresent = payload.stores.some(store => store.id === KELLY_ID || normalize(store.name) === normalize(KELLY_NAME));
  if (alreadyPresent) return payload;

  return {
    ...payload,
    products: [...payload.products, ...extraProducts].sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name, "pt-BR")),
    stores: [...payload.stores, ...manualStores],
    metrics: {
      products: payload.metrics.products + manualProducts.length,
      prices: payload.metrics.prices + manualProducts.length,
      stores: payload.metrics.stores + manualStores.length,
    },
  };
}
