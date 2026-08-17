import { supabase } from "../lib/supabase";
import { fetchCatalog } from "./remoteCatalog";
import type { CatalogPayload, Product, StoreRow } from "./catalog";

export type SectorRule = { id:string; productCategories:string[]; businessKinds:string[] };
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
const kindAliases:Record<string,string>={supermercado:"supermarket",mercado:"market",mercearia:"grocery",acougue:"butcher",açougue:"butcher",farmacia:"pharmacy",farmácia:"pharmacy",padaria:"bakery",lanchonete:"snack_bar",restaurante:"restaurant",servico:"services",serviço:"services"};
export const normalizeStoreKind=(kind?:string)=>kindAliases[normalize(kind||"")]||normalize(kind||"");
export const storeMatchesSector=(store:StoreRow,sector:SectorRule)=>sector.businessKinds.map(normalizeStoreKind).includes(normalizeStoreKind(store.kind));
export const productMatchesSectorTerms=(product:Product,sector:SectorRule)=>{const haystack=normalize(`${product.category||""} ${product.name||""}`);return sector.productCategories.some(term=>haystack.includes(normalize(term)))};
export const productStoreIds=(product:Product)=>new Set([String(product.establishmentId),...(product.offers||[]).map(offer=>String(offer.establishmentId))]);
function requiredKindsForProduct(product:Product){const text=normalize(`${product.category||""} ${product.name||""}`);if(/\b(acougue|carne|carnes|frango|peixe|pescado)\b/.test(text))return new Set(["butcher","butchery"]);return null}
export const productHasSectorOffer=(product:Product,catalog:CatalogPayload,sector:SectorRule)=>{
 if(!productMatchesSectorTerms(product,sector))return false;
 const ids=productStoreIds(product);const required=requiredKindsForProduct(product);
 return catalog.stores.some(store=>{const kind=normalizeStoreKind(store.kind);return ids.has(String(store.id))&&storeMatchesSector(store,sector)&&(!required||required.has(kind))});
};
export const sectorProducts=(catalog:CatalogPayload,sector:SectorRule)=>catalog.products.filter(product=>productHasSectorOffer(product,catalog,sector));
export const sectorStores=(catalog:CatalogPayload,sector:SectorRule)=>{
 const products=sectorProducts(catalog,sector);
 return catalog.stores.map(store=>({store,count:products.filter(product=>{const ids=productStoreIds(product);const required=requiredKindsForProduct(product);const kind=normalizeStoreKind(store.kind);return ids.has(String(store.id))&&(!required||required.has(kind))}).length})).filter(item=>item.count>0&&storeMatchesSector(item.store,sector)).sort((a,b)=>b.count-a.count||a.store.name.localeCompare(b.store.name,"pt-BR"));
};
let enhancedCache:{value:CatalogPayload;expires:number}|null=null;let pending:Promise<CatalogPayload>|null=null;
export async function fetchSectorCatalog(force=false):Promise<CatalogPayload>{
 if(!force&&enhancedCache&&enhancedCache.expires>Date.now())return enhancedCache.value;
 if(!force&&pending)return pending;
 pending=(async()=>{const catalog=await fetchCatalog("",{force});if(!supabase)return catalog;const{data,error}=await supabase.from("establishments").select("id,kind");if(error||!data)return catalog;const kinds=new Map(data.map(row=>[String(row.id),String(row.kind||"")]));const value={...catalog,stores:catalog.stores.map(store=>({...store,kind:kinds.get(String(store.id))||store.kind||"market"}))};enhancedCache={value,expires:Date.now()+60_000};return value;})();
 try{return await pending}finally{pending=null}
}
export function prefetchSectorCatalog(){void fetchSectorCatalog().catch(()=>undefined)}
