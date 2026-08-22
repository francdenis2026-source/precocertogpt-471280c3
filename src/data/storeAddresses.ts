const normalizeStoreName = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const STORE_ADDRESSES: Array<{ aliases: string[]; address: string }> = [
  {
    aliases: ["drogaria ultra popular", "drogarias ultra popular", "ultra popular"],
    address: "Rua Epaminondas Martins, 23, Centro, Feijó - AC, 69960-000, Brasil",
  },
  {
    aliases: ["parceirao", "comercial parceirao"],
    address: "Rua Getúlio Vargas, 620, Centro, Feijó - AC, 69960-000, Brasil",
  },
];

export function getStoreAddress(name: string) {
  const normalized = normalizeStoreName(name);
  return STORE_ADDRESSES.find(entry => entry.aliases.some(alias => normalized === alias || normalized.includes(alias)))?.address;
}

export function getStoreMapQuery(name: string, neighborhood?: string) {
  return getStoreAddress(name)
    || `${name}, ${neighborhood && neighborhood !== "—" ? `${neighborhood}, ` : ""}Feijó - AC, 69960-000, Brasil`;
}
