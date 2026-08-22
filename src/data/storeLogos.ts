const STORE_LOGO_BASE_URL =
  "https://kqueiohjadwzxafdrrxk.supabase.co/storage/v1/object/public/products/establishments";
const STORE_LOGO_VERSION = "20260818-3";

const normalizeStoreName = (name: string) => name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const STORE_LOGOS = [
  { aliases: ["kelly burgueria e lanchonete", "kelly burgueria", "kelly burgueria lanchonete", "kelly"], local: "/branding/kelly-burgueria-logo.jpg?v=20260822" },
  { aliases: ["ponto do sanduba", "ponto do sanduba hamburgueria", "sanduba"], local: "/branding/ponto-do-sanduba-logo.jpg?v=20260822" },
  { aliases: ["comercio bons amigos", "bons amigos", "comercio ba bons amigos", "ba comercio bons amigos"], local: "/branding/bons-amigos-logo.svg?v=20260818-3" },
  { aliases: ["panificadora bandeira", "padaria bandeira", "bandeira"], local: "/branding/panificadora-bandeira.svg?v=20260818-3" },
  { aliases: ["drogaria pague pouco", "pague pouco"], file: "drogaria-pague-pouco.webp" },
  { aliases: ["doceria doce dia", "doce dia"], file: "doce-dia.webp" },
  { aliases: ["central super"], file: "central-super.webp" },
  { aliases: ["comercial vanderley", "comercial vandereley"], file: "comercial-vanderley.webp" },
  { aliases: ["drogarias ultra popular", "drogaria ultra popular", "ultra popular"], file: "drogaria-ultra-popular.webp" },
  { aliases: ["recanto da carne"], file: "recanto-da-carne.webp" },
  { aliases: ["supermercado 100 feijoense", "100 feijoense", "supermercado 100"], file: "100-por-cento.webp" },
  { aliases: ["comercial claudia", "comercial claudia feijo"], file: "comercial-claudia.webp" },
  { aliases: ["facem comercio f m araujo", "facem comercio", "facem"], file: "facem-comercio.webp" },
  { aliases: ["mercantil reboucas"], file: "mercantil-reboucas.webp" },
  { aliases: ["comercial parceirao", "parceirao"], file: "parceirao.webp" },
  { aliases: ["varejao contamigos", "contamigos"], file: "varejao-contamigos.webp" },
] as const;

export function getStoreLogoUrl(name: string): string | undefined {
  const normalizedName = normalizeStoreName(name);
  const match = STORE_LOGOS.find(({ aliases }) =>
    aliases.some(alias => normalizedName === alias || normalizedName.includes(alias)),
  );
  if (!match) return undefined;
  if ("local" in match) return match.local;
  return `${STORE_LOGO_BASE_URL}/${match.file}?v=${STORE_LOGO_VERSION}`;
}
