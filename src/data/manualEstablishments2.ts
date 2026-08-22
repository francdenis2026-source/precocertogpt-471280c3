// Segundo negócio cadastrado manualmente (ver manualEstablishments.ts para o
// contexto completo do porquê deste arquivo existir). Ponto do Sanduba —
// hamburgueria em Feijó-AC, cardápio e logomarca enviados pelo proprietário
// em 22/08/2026.

import type { Product, ProductOffer, StoreRow } from "./catalog";

export const SANDUBA_ID = "ponto-do-sanduba";
export const SANDUBA_NAME = "Ponto do Sanduba";
export const SANDUBA_NEIGHBORHOOD = "Centro";
export const SANDUBA_COLOR = "#f07d17";
export const SANDUBA_ADDRESS = "Travessa Floriano Peixoto, Centro, Feijó - AC, 69960-000";
export const SANDUBA_PHONE = "(68) 99975-4141";
export const SANDUBA_WHATSAPP = "5568999754141";

export type MenuItem = { name: string; category: string; price: number; description?: string };

export const SANDUBA_MENU_CATEGORIES = ["Sanduíches", "Adicionais", "Refrigerantes", "Suco Natural"] as const;

export const SANDUBA_MENU: MenuItem[] = [
  // Sanduíches
  { name: "Tudão Big", category: "Sanduíches", price: 30, description: "Hambúrguer, filé, frango, presunto, queijo, calabresa, bacon, salsicha, ovo, salada, cheddar, catupiry, molho barbecue e banana frita." },
  { name: "X-Tudão", category: "Sanduíches", price: 25, description: "Hambúrguer, filé, frango, presunto, queijo, calabresa, bacon, salsicha, ovo e salada." },
  { name: "X-Triplo X", category: "Sanduíches", price: 25, description: "3 hambúrgueres, 3 ovos e 3 queijos." },
  { name: "X-Moda da Casa", category: "Sanduíches", price: 22, description: "Hambúrguer, frango, presunto, queijo, calabresa, bacon, salsicha, ovo e salada." },
  { name: "X-Filé Especial", category: "Sanduíches", price: 20, description: "Filé, queijo, presunto, ovo e salada." },
  { name: "X-Smash Burg", category: "Sanduíches", price: 20, description: "2 hambúrgueres, bacon, queijo cheddar e queijo." },
  { name: "X-Tudo", category: "Sanduíches", price: 18, description: "Hambúrguer, presunto, queijo, calabresa, bacon, salsicha, ovo e salada." },
  { name: "X-Filé", category: "Sanduíches", price: 18, description: "Filé, presunto, queijo e salada." },
  { name: "X-Bagunça Especial", category: "Sanduíches", price: 16, description: "Hambúrguer, presunto, queijo, calabresa, salsicha, ovo e salada." },
  { name: "X-Bacon Especial", category: "Sanduíches", price: 16, description: "Hambúrguer, presunto, queijo, ovo, bacon e salada." },
  { name: "X-Light", category: "Sanduíches", price: 16, description: "Hambúrguer, frango, presunto, queijo, catupiry, batata palha e salada." },
  { name: "X-Praça 3 Poderes", category: "Sanduíches", price: 16, description: "Hambúrguer, presunto, queijo, cheddar, molho barbecue, cebola e salada." },
  { name: "X-Chico Burguer", category: "Sanduíches", price: 16, description: "Hambúrguer, presunto, queijo, cheddar, banana frita, orégano e salada." },
  { name: "X-Calabresa Especial", category: "Sanduíches", price: 15, description: "Hambúrguer, presunto, queijo, calabresa, ovo e salada." },
  { name: "X-Frango Especial", category: "Sanduíches", price: 15, description: "Frango, presunto, queijo, ovo e salada." },
  { name: "X-Fran Burguer", category: "Sanduíches", price: 15, description: "Hambúrguer, frango, presunto, queijo e salada." },
  { name: "X-Calabresa", category: "Sanduíches", price: 14, description: "Hambúrguer, presunto, queijo, calabresa e salada." },
  { name: "X-Bacon", category: "Sanduíches", price: 14, description: "Hambúrguer, bacon, presunto, queijo e salada." },
  { name: "X-Egg", category: "Sanduíches", price: 14, description: "Hambúrguer, presunto, queijo, ovo e salada." },
  { name: "X-Saladog", category: "Sanduíches", price: 14, description: "Hambúrguer, presunto, queijo, salsicha e salada." },
  { name: "X-Frango", category: "Sanduíches", price: 14, description: "Frango, presunto, queijo, catupiry e salada." },
  { name: "X-Burguer Duplo", category: "Sanduíches", price: 18, description: "2 hambúrgueres, 2 ovos, presunto e queijo." },
  { name: "X-Burguer Especial", category: "Sanduíches", price: 12, description: "Hambúrguer, ovo, presunto e queijo." },
  { name: "X-Salada", category: "Sanduíches", price: 12, description: "Hambúrguer, presunto, queijo e salada." },
  { name: "X-Dog Especial", category: "Sanduíches", price: 12, description: "Presunto, queijo, salsicha, batata palha e salada." },
  { name: "X-Burguer", category: "Sanduíches", price: 10, description: "Hambúrguer, presunto e queijo." },
  { name: "X-Dog", category: "Sanduíches", price: 10, description: "Presunto, queijo, salsicha e salada." },
  { name: "X-Bauru", category: "Sanduíches", price: 10, description: "Presunto, queijo e salada." },
  { name: "X-Misto Duplo", category: "Sanduíches", price: 10, description: "2 presuntos e 2 queijos." },
  { name: "X-Misto", category: "Sanduíches", price: 8, description: "Presunto e queijo." },

  // Adicionais
  { name: "Hambúrguer (adicional)", category: "Adicionais", price: 4 },
  { name: "Filé (adicional)", category: "Adicionais", price: 5 },
  { name: "Bacon (adicional)", category: "Adicionais", price: 3 },
  { name: "Cheddar (adicional)", category: "Adicionais", price: 3 },
  { name: "Calabresa (adicional)", category: "Adicionais", price: 3 },
  { name: "Frango (adicional)", category: "Adicionais", price: 4 },
  { name: "Catupiry (adicional)", category: "Adicionais", price: 3 },
  { name: "Queijo (adicional)", category: "Adicionais", price: 2 },
  { name: "Presunto (adicional)", category: "Adicionais", price: 2 },
  { name: "Ovo (adicional)", category: "Adicionais", price: 2 },
  { name: "Salsicha (adicional)", category: "Adicionais", price: 2 },
  { name: "Salada (adicional)", category: "Adicionais", price: 2 },
  { name: "Cebola (adicional)", category: "Adicionais", price: 2 },
  { name: "Banana (adicional)", category: "Adicionais", price: 2 },

  // Refrigerantes
  { name: "Coca-Cola 2L", category: "Refrigerantes", price: 13 },
  { name: "Coca-Cola 1L", category: "Refrigerantes", price: 9 },
  { name: "Coca-Cola 1,5L", category: "Refrigerantes", price: 10 },
  { name: "Bare 2L", category: "Refrigerantes", price: 8 },
  { name: "Cruzeiro 2L", category: "Refrigerantes", price: 6 },
  { name: "Refrigerante em Lata", category: "Refrigerantes", price: 5 },
  { name: "Água Mineral", category: "Refrigerantes", price: 2 },

  // Suco Natural
  { name: "Suco Natural 300ml", category: "Suco Natural", price: 6 },
  { name: "Suco Natural 400ml", category: "Suco Natural", price: 8 },
  { name: "Adicional de Leite", category: "Suco Natural", price: 3 },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CAPTURED_AT = "2026-08-22T09:00:00-05:00";

export const sandubaStores: StoreRow[] = [
  { id: SANDUBA_ID, slug: SANDUBA_ID, name: SANDUBA_NAME, neighborhood: SANDUBA_NEIGHBORHOOD, color: SANDUBA_COLOR, products: SANDUBA_MENU.length, kind: "snack_bar" },
];

export const sandubaProducts: Product[] = SANDUBA_MENU.map((item) => {
  const id = `sanduba-${slugify(item.name)}`;
  const offer: ProductOffer = {
    establishmentId: SANDUBA_ID,
    establishmentSlug: SANDUBA_ID,
    establishment: SANDUBA_NAME,
    neighborhood: SANDUBA_NEIGHBORHOOD,
    storeColor: SANDUBA_COLOR,
    value: item.price,
    capturedAt: CAPTURED_AT,
  };
  return {
    id,
    slug: id,
    name: item.name,
    brand: "Ponto do Sanduba",
    category: item.category,
    size: item.description || "Porção única",
    unit: "un",
    minPrice: item.price,
    avgPrice: item.price,
    maxPrice: item.price,
    storeCount: 1,
    establishmentId: SANDUBA_ID,
    establishmentSlug: SANDUBA_ID,
    establishment: SANDUBA_NAME,
    neighborhood: SANDUBA_NEIGHBORHOOD,
    storeColor: SANDUBA_COLOR,
    capturedAt: CAPTURED_AT,
    source: "Cardápio oficial (Ponto do Sanduba)",
    offers: [offer],
  } satisfies Product;
});
