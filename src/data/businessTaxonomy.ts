/* Taxonomia de tipos de comércio — fonte única da verdade.
 *
 * Antes deste arquivo, o "tipo de negócio" de um estabelecimento era decidido
 * em três lugares que não conversavam entre si:
 *   1. o formulário de cadastro do lojista, com 7 opções ('grocery', 'bakery',
 *      'pharmacy', 'food', 'services', 'culture', 'other');
 *   2. a lista de setores, que procurava por outros valores que o formulário
 *      nunca gerava ('market', 'supermarket', 'butcher', 'pizzeria',
 *      'snack_bar', 'restaurant', 'beverage', 'bookstore'…);
 *   3. um pequeno mapa de apelidos em português.
 * O resultado prático: quase nenhum estabelecimento caía no grupo certo.
 * Pior, quando o tipo não era reconhecido o sistema assumia "mercado"
 * silenciosamente — e por isso açougue, padaria, lanchonete e pizzaria
 * apareciam como mercado, ou simplesmente sumiam da navegação.
 *
 * Aqui tudo passa por um vocabulário só, com três camadas de segurança:
 *   - APELIDOS: aceita o valor em qualquer grafia (português/inglês, singular
 *     ou plural, com ou sem acento) e devolve sempre o mesmo tipo canônico.
 *   - INFERÊNCIA PELO NOME: em Feijó (como na maior parte do comércio local) o
 *     nome já diz o que o negócio é — "Açougue do João", "Panificadora
 *     Esperança", "Pizzaria Forno a Lenha". Quando o cadastro vem vazio ou
 *     genérico demais, o nome resolve. Isso conserta o acervo já cadastrado
 *     sem depender de alguém reeditar cada loja no banco.
 *   - "OUTROS" DE VERDADE: o que não dá para classificar vira 'other' e é
 *     mostrado num grupo próprio, em vez de ser fantasiado de mercado.
 */

export type BusinessKind =
  | "supermarket"
  | "grocery"
  | "butcher"
  | "fishmonger"
  | "bakery"
  | "snack_bar"
  | "restaurant"
  | "pizzeria"
  | "beverage"
  | "pharmacy"
  | "culture"
  | "services"
  | "other";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

/* Todo valor que já existe (ou pode existir) no banco, no formulário de
 * cadastro do lojista, no admin ou nos cadastros manuais, apontando para o
 * tipo canônico. Chaves sempre normalizadas (sem acento, minúsculas). */
const KIND_ALIASES: Record<string, BusinessKind> = {
  // Mercados e mercearias
  supermarket: "supermarket", supermercado: "supermarket", supermercados: "supermarket",
  market: "supermarket", mercado: "supermarket", mercados: "supermarket",
  minimercado: "supermarket", mercadinho: "supermarket", hipermercado: "supermarket",
  "auto servico": "supermarket", autoservico: "supermarket",
  grocery: "grocery", mercearia: "grocery", mercearias: "grocery",
  armazem: "grocery", quitanda: "grocery", hortifruti: "grocery",
  sacolao: "grocery", mercantil: "grocery", comercial: "grocery",
  atacado: "supermarket", atacadao: "supermarket", atacarejo: "supermarket",

  // Açougues e peixarias
  butcher: "butcher", butchery: "butcher", acougue: "butcher", acougues: "butcher",
  "casa de carne": "butcher", "casa de carnes": "butcher", carnes: "butcher",
  frigorifico: "butcher", boutique_de_carnes: "butcher",
  fishmonger: "fishmonger", peixaria: "fishmonger", peixarias: "fishmonger",
  pescados: "fishmonger", pescado: "fishmonger",

  // Padarias e confeitarias
  bakery: "bakery", padaria: "bakery", padarias: "bakery",
  panificadora: "bakery", panificacao: "bakery",
  confeitaria: "bakery", confeitarias: "bakery", doceria: "bakery",
  bolos: "bakery", "casa de bolos": "bakery",

  // Lanchonetes, restaurantes e pizzarias
  snack_bar: "snack_bar", "snack bar": "snack_bar", lanchonete: "snack_bar",
  lanchonetes: "snack_bar", lanches: "snack_bar", hamburgueria: "snack_bar",
  burger: "snack_bar", pastelaria: "snack_bar", sorveteria: "snack_bar",
  acaiteria: "snack_bar", food: "snack_bar", delivery: "snack_bar",
  fast_food: "snack_bar", "fast food": "snack_bar", trailer: "snack_bar",
  restaurant: "restaurant", restaurante: "restaurant", restaurantes: "restaurant",
  churrascaria: "restaurant", marmitaria: "restaurant", "self service": "restaurant",
  pizzeria: "pizzeria", pizzaria: "pizzeria", pizzarias: "pizzeria", pizza: "pizzeria",

  // Bebidas
  beverage: "beverage", beverages: "beverage", bebidas: "beverage",
  distribuidora: "beverage", adega: "beverage", "deposito de bebidas": "beverage",

  // Farmácias e saúde
  pharmacy: "pharmacy", pharmacies: "pharmacy", farmacia: "pharmacy",
  farmacias: "pharmacy", drogaria: "pharmacy", drogarias: "pharmacy",
  health: "pharmacy", saude: "pharmacy", manipulacao: "pharmacy",

  // Livros e cultura
  culture: "culture", cultura: "culture", culture_music: "culture",
  books: "culture", books_author: "culture", livros: "culture",
  livraria: "culture", livrarias: "culture", bookstore: "culture",
  publisher: "culture", editora: "culture", autor: "culture", autora: "culture",
  papelaria: "culture", produtora: "culture",

  // Serviços
  services: "services", service: "services", servico: "services",
  servicos: "services", professional: "services", profissional: "services",
  freelancer: "services", autonomo: "services", oficina: "services",
  barbearia: "services", salao: "services", "salao de beleza": "services",
  grafica: "services", assistencia: "services", "assistencia tecnica": "services",
  clinica: "services", petshop: "services", "pet shop": "services",

  // Sem classificação
  other: "other", outro: "other", outros: "other", geral: "other",
};

/* Padrões de nome, do mais específico para o mais genérico. A ordem importa:
 * "Mercadinho e Açougue Bom Preço" deve cair em açougue (o sinal mais
 * específico) e não em mercado. Por isso açougue/padaria/pizzaria/farmácia
 * vêm antes de mercado/mercearia na lista. */
const NAME_PATTERNS: Array<{ kind: BusinessKind; pattern: RegExp }> = [
  { kind: "pharmacy", pattern: /\b(farmacia|drogaria|drogarias|farma)\b/ },
  { kind: "butcher", pattern: /\b(acougue|acougues|frigorifico|casa de carne|casa de carnes|boi gordo|carnes)\b/ },
  { kind: "fishmonger", pattern: /\b(peixaria|peixarias|pescados?)\b/ },
  { kind: "pizzeria", pattern: /\b(pizzaria|pizzarias|pizza|pizzas)\b/ },
  { kind: "bakery", pattern: /\b(padaria|padarias|panificadora|panificacao|confeitaria|doceria|casa de bolos)\b/ },
  { kind: "snack_bar", pattern: /\b(lanchonete|lanches|lanche|hamburgueria|hamburgueri?a|burgueria|burger|burguer|sanduba|sanduiche|sanduiches|pastelaria|sorveteria|acaiteria|acai|espetinho|trailer)\b/ },
  { kind: "restaurant", pattern: /\b(restaurante|churrascaria|marmitaria|marmitex|self service|cozinha)\b/ },
  { kind: "beverage", pattern: /\b(distribuidora|bebidas|adega|deposito de bebidas)\b/ },
  { kind: "culture", pattern: /\b(livraria|livros|editora|papelaria|producoes|producao cultural)\b/ },
  { kind: "services", pattern: /\b(oficina|mecanica|barbearia|salao|grafica|assistencia|clinica|pet shop|petshop|lava jato|borracharia)\b/ },
  { kind: "supermarket", pattern: /\b(supermercado|mercadinho|hipermercado|atacadao|atacarejo|auto servico|super)\b/ },
  { kind: "grocery", pattern: /\b(mercearia|armazem|quitanda|sacolao|hortifruti|mercantil|comercial|mercado)\b/ },
];

/* Tipos que são "guarda-chuva": o cadastro do lojista oferece só um punhado de
 * opções amplas ("Mercado, mercearia ou açougue" grava 'grocery'; "Alimentação
 * e delivery" grava 'food'), então um açougue e uma pizzaria chegam aqui com um
 * rótulo genérico. Nesses casos o nome do estabelecimento é a informação mais
 * confiável e pode especializar o tipo. Um tipo específico gravado de propósito
 * (ex.: 'pharmacy') nunca é sobrescrito pelo nome. */
const BROAD_KINDS = new Set<BusinessKind>(["supermarket", "grocery", "snack_bar", "other"]);

export function normalizeBusinessKind(kind?: string | null): BusinessKind | null {
  const key = normalize(kind || "");
  if (!key) return null;
  return KIND_ALIASES[key] || KIND_ALIASES[key.replace(/[\s_-]+/g, " ")] || null;
}

export function inferKindFromName(name?: string | null): BusinessKind | null {
  const text = ` ${normalize(name || "").replace(/[^a-z0-9]+/g, " ")} `;
  if (text.trim().length < 2) return null;
  for (const { kind, pattern } of NAME_PATTERNS) if (pattern.test(text)) return kind;
  return null;
}

/* O tipo definitivo de um estabelecimento. Combina o que está gravado com o
 * que o nome revela, e só devolve 'other' quando nenhum dos dois diz nada —
 * nunca "chuta" mercado. */
export function resolveBusinessKind(store: { kind?: string | null; name?: string | null }): BusinessKind {
  const declared = normalizeBusinessKind(store.kind);
  const fromName = inferKindFromName(store.name);
  if (!declared) return fromName || "other";
  if (fromName && fromName !== declared && BROAD_KINDS.has(declared)) return fromName;
  return declared;
}

/* Os grupos que a pessoa vê na navegação. Um grupo é definido pelos TIPOS DE
 * NEGÓCIO que ele reúne — não por palavras encontradas no nome dos produtos.
 * Essa é a diferença central em relação ao modelo antigo: uma padaria com
 * catálogo é uma padaria, mesmo que os produtos dela estejam cadastrados como
 * "Salgados" ou "Bolo de rolo" em vez de conter a palavra "padaria". */
export type BusinessGroupId =
  | "markets" | "butchers" | "bakery" | "food" | "pharmacies" | "books" | "services" | "other";

export type BusinessGroup = {
  id: BusinessGroupId;
  /** Nome curto, do jeito que as pessoas falam. Usado em chips e menus. */
  shortLabel: string;
  /** Nome completo do grupo. */
  label: string;
  /** O que a pessoa encontra aqui, em uma linha. */
  summary: string;
  href: string;
  kinds: BusinessKind[];
  /** Exemplos concretos de negócios, para dar reconhecimento imediato. */
  examples: string[];
};

export const businessGroups: BusinessGroup[] = [
  {
    id: "markets",
    shortLabel: "Mercados",
    label: "Mercados e mercearias",
    summary: "Compras do mês, mercearia, bebidas e itens de limpeza.",
    href: "/mercados",
    kinds: ["supermarket", "grocery", "beverage"],
    examples: ["Supermercados", "Mercearias", "Distribuidoras de bebidas"],
  },
  {
    id: "butchers",
    shortLabel: "Açougues",
    label: "Açougues e peixarias",
    summary: "Carnes, frango, peixe e cortes do dia.",
    href: "/acougues",
    kinds: ["butcher", "fishmonger"],
    examples: ["Açougues", "Casas de carne", "Peixarias"],
  },
  {
    id: "bakery",
    shortLabel: "Padarias",
    label: "Padarias e confeitarias",
    summary: "Pão, bolo, salgados e doces feitos na hora.",
    href: "/padarias",
    kinds: ["bakery"],
    examples: ["Padarias", "Panificadoras", "Confeitarias"],
  },
  {
    id: "food",
    shortLabel: "Lanchonetes",
    label: "Lanchonetes, pizzarias e restaurantes",
    summary: "Lanches, pizza, refeições e cardápios com preço aberto.",
    href: "/lanchonetes",
    kinds: ["snack_bar", "restaurant", "pizzeria"],
    examples: ["Lanchonetes", "Hamburguerias", "Pizzarias", "Restaurantes"],
  },
  {
    id: "pharmacies",
    shortLabel: "Farmácias",
    label: "Farmácias",
    summary: "Medicamentos, higiene e cuidados pessoais.",
    href: "/farmacias",
    kinds: ["pharmacy"],
    examples: ["Farmácias", "Drogarias"],
  },
  {
    id: "books",
    shortLabel: "Livros e cultura",
    label: "Livros, autores e cultura",
    summary: "Autores, obras e projetos culturais de Feijó.",
    href: "/livros",
    kinds: ["culture"],
    examples: ["Autores", "Livrarias", "Projetos culturais"],
  },
  {
    id: "services",
    shortLabel: "Serviços",
    label: "Serviços e profissionais",
    summary: "Profissionais e prestadores de serviço da cidade.",
    href: "/servicos",
    kinds: ["services"],
    examples: ["Autônomos", "Oficinas", "Assistência técnica"],
  },
  {
    id: "other",
    shortLabel: "Outros comércios",
    label: "Outros comércios",
    summary: "Negócios locais que ainda não têm um grupo próprio.",
    href: "/outros-comercios",
    kinds: ["other"],
    examples: ["Comércio em geral"],
  },
];

const GROUP_BY_KIND = new Map<BusinessKind, BusinessGroup>();
for (const group of businessGroups) for (const kind of group.kinds) GROUP_BY_KIND.set(kind, group);

export function getBusinessGroup(id?: string | null) {
  return businessGroups.find(group => group.id === id) || null;
}

/* O grupo a que um estabelecimento pertence. Sempre devolve um grupo — na
 * pior das hipóteses "Outros comércios", que é honesto, em vez de classificar
 * como mercado algo que não é. */
export function groupForStore(store: { kind?: string | null; name?: string | null }): BusinessGroup {
  return GROUP_BY_KIND.get(resolveBusinessKind(store)) || businessGroups[businessGroups.length - 1];
}

export function storeBelongsToGroup(store: { kind?: string | null; name?: string | null }, group: { id: string }) {
  return groupForStore(store).id === group.id;
}
