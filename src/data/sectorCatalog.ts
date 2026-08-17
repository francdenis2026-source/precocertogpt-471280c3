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
export const productHasSectorOffer=(product:Product,catalog:CatalogPayload,sector:SectorRule)=>{
 if(!productMatchesSectorTerms(product,sector))return false;
 const ids=productStoreIds(product);
 return catalog.stores.some(store=>ids.has(String(store.id))&&storeMatchesSector(store,sector));
};
export const sectorProducts=(catalog:CatalogPayload,sector:SectorRule)=>catalog.products.filter(product=>productHasSectorOffer(product,catalog,sector));
export const sectorStores=(catalog:CatalogPayload,sector:SectorRule)=>{
 const products=sectorProducts(catalog,sector);
 return catalog.stores.map(store=>({store,count:products.filter(product=>productStoreIds(product).has(String(store.id))).length})).filter(item=>item.count>0&&storeMatchesSector(item.store,sector)).sort((a,b)=>b.count-a.count||a.store.name.localeCompare(b.store.name,"pt-BR"));
};
let enhancedCache:{value:CatalogPayload;expires:number}|null=null;let pending:Promise<CatalogPayload>|null=null;
export async function fetchSectorCatalog(force=false):Promise<CatalogPayload>{
 if(!force&&enhancedCache&&enhancedCache.expires>Date.now())return enhancedCache.value;
 if(!force&&pending)return pending;
 pending=(async()=>{const catalog=await fetchCatalog("",{force});if(!supabase)return catalog;const{data,error}=await supabase.from("establishments").select("id,kind");if(error||!data)return catalog;const kinds=new Map(data.map(row=>[String(row.id),String(row.kind||"")]));const value={...catalog,stores:catalog.stores.map(store=>({...store,kind:kinds.get(String(store.id))||store.kind||"market"}))};enhancedCache={value,expires:Date.now()+60_000};return value;})();
 try{return await pending}finally{pending=null}
}
export function prefetchSectorCatalog(){void fetchSectorCatalog().catch(()=>undefined)}
