import { useEffect } from "react";
import { supabase } from "../lib/roles";

type OnlineMerchant={id:string;name:string;establishment_id:string|null;establishments?:{name?:string|null}|null};
function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim()}
function injectStyle(){if(document.getElementById("pc-online-merchant-links"))return;const style=document.createElement("style");style.id="pc-online-merchant-links";style.textContent=`.pc-buy-online-link{display:inline-flex;align-items:center;justify-content:center;gap:5px;margin-left:7px;padding:6px 9px;border-radius:9px;background:var(--pc-color-foreground);color:var(--pc-color-surface)!important;text-decoration:none!important;font-size:11px;font-weight:850;line-height:1;box-shadow:0 5px 14px rgba(24,61,43,.15);white-space:nowrap}.pc-buy-online-link:hover{filter:brightness(1.08);transform:translateY(-1px)}@media(max-width:680px){.pc-buy-online-link{padding:6px 8px;font-size:10px}}`;document.head.appendChild(style)}
function addLinks(merchants:OnlineMerchant[]){
 const names=merchants.map(m=>({merchant:m,names:[m.name,m.establishments?.name||""].map(normalize).filter(Boolean)}));
 const candidates=document.querySelectorAll<HTMLElement>(".professional-result-store, a[href^='/estabelecimento/'], .store-name, .offer-store, .offer-store-name, .result-store, [data-store-name]");
 candidates.forEach(el=>{
   if(el.querySelector(".pc-buy-online-link")||el.parentElement?.querySelector(`.pc-buy-online-link[data-anchor-id="${el.dataset.pcCommerceAnchor||""}"]`))return;
   const label=normalize(el.getAttribute("data-store-name")||el.textContent||"");if(!label)return;
   const match=names.find(entry=>entry.names.some(name=>name&&label.includes(name)));
   if(!match)return;
   const anchorId=el.dataset.pcCommerceAnchor||crypto.randomUUID();el.dataset.pcCommerceAnchor=anchorId;
   const link=document.createElement("a");link.href=`/loja/${match.merchant.id}`;link.className="pc-buy-online-link";link.dataset.anchorId=anchorId;link.textContent="Comprar online";link.title=`Comprar em ${match.merchant.name}`;link.addEventListener("click",event=>event.stopPropagation());
   if(el.tagName==="A")el.insertAdjacentElement("afterend",link);else el.appendChild(link);
 });
}

export function OnlineMerchantLinks(){
 useEffect(()=>{
  if(!supabase)return;let active=true;let observer:MutationObserver|undefined;injectStyle();
  void supabase.from("merchants").select("id,name,establishment_id,establishments(name)").eq("status","active").not("establishment_id","is",null).then(({data,error})=>{
    if(!active||error||!data)return;const merchants=data as unknown as OnlineMerchant[];const render=()=>addLinks(merchants);render();observer=new MutationObserver(()=>render());observer.observe(document.body,{childList:true,subtree:true});
  });
  return()=>{active=false;observer?.disconnect()};
 },[]);
 return null;
}
