import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Building2, CheckCircle2, LoaderCircle, PiggyBank, Save, ShoppingBasket, Sparkles, Store, WalletCards } from "lucide-react";
import { fetchCatalog } from "../data/remoteCatalog";
import type { Product, ProductOffer } from "../data/catalog";
import { loadSessionProfile, supabase, type SessionProfile } from "../lib/roles";
import "./SmartBasketPage.css";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const normalize = (value:string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

type Essential = { key:string; label:string; keywords:string[]; priority:number; quantity:(people:number)=>number };
type PlannedItem = { product:Product; quantity:number; offer:ProductOffer; subtotal:number; essential:string };
type Plan = { strategy:"multi_store"|"single_store"; total:number; items:PlannedItem[]; stores:string[]; missing:string[]; savings:number; label:string; storeName?:string };

const ESSENTIALS:Essential[] = [
  {key:"arroz",label:"Arroz",keywords:["arroz"],priority:1,quantity:p=>Math.max(1,Math.ceil(p/3))},
  {key:"feijao",label:"Feijão",keywords:["feijao"],priority:2,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"oleo",label:"Óleo",keywords:["oleo de soja","oleo"],priority:3,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"macarrao",label:"Macarrão",keywords:["macarrao"],priority:4,quantity:p=>Math.max(1,Math.ceil(p*1.5))},
  {key:"leite",label:"Leite",keywords:["leite integral","leite"],priority:5,quantity:p=>Math.max(1,p*2)},
  {key:"acucar",label:"Açúcar",keywords:["acucar"],priority:6,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"cafe",label:"Café",keywords:["cafe"],priority:7,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"farinha",label:"Farinha",keywords:["farinha de trigo","farinha"],priority:8,quantity:()=>1},
  {key:"sal",label:"Sal",keywords:["sal refinado","sal"],priority:9,quantity:()=>1},
  {key:"proteina",label:"Proteína",keywords:["frango","carne bovina","carne"],priority:10,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"ovos",label:"Ovos",keywords:["ovos","ovo"],priority:11,quantity:p=>Math.max(1,Math.ceil(p/3))},
  {key:"detergente",label:"Detergente",keywords:["detergente"],priority:12,quantity:p=>Math.max(1,Math.ceil(p/2))},
  {key:"sabao",label:"Sabão",keywords:["sabao em po","sabao"],priority:13,quantity:()=>1},
  {key:"papel",label:"Papel higiênico",keywords:["papel higienico"],priority:14,quantity:()=>1},
];

function candidateFor(products:Product[], essential:Essential){
  const matches=products.filter(product=>{const text=normalize(`${product.name} ${product.category} ${product.brand}`);return essential.keywords.some(k=>text.includes(normalize(k))) && product.minPrice>0;});
  return matches.sort((a,b)=>a.minPrice-b.minPrice || a.name.localeCompare(b.name,"pt-BR"))[0] || null;
}

function desiredItems(products:Product[], people:number){return ESSENTIALS.map(essential=>({essential,product:candidateFor(products,essential),quantity:essential.quantity(people)}));}

function cheapestOffer(product:Product):ProductOffer|null { return product.offers?.filter(o=>o.value>0).sort((a,b)=>a.value-b.value)[0] || (product.minPrice>0?{establishmentId:product.establishmentId,establishmentSlug:product.establishmentSlug,establishment:product.establishment,neighborhood:product.neighborhood,storeColor:product.storeColor,value:product.minPrice,capturedAt:product.capturedAt}:null); }

function buildMulti(products:Product[],people:number,budget:number):Plan{
  const desired=desiredItems(products,people); const items:PlannedItem[]=[]; const missing:string[]=[]; let total=0;
  for(const row of desired){ if(!row.product){missing.push(row.essential.label);continue;} const offer=cheapestOffer(row.product); if(!offer){missing.push(row.essential.label);continue;} let added=0; for(let i=0;i<row.quantity;i++){if(total+offer.value>budget)break; total+=offer.value; added++;} if(added)items.push({product:row.product,quantity:added,offer,subtotal:offer.value*added,essential:row.essential.label}); else missing.push(row.essential.label); }
  const stores=[...new Set(items.map(i=>i.offer.establishment))]; return {strategy:"multi_store",total,items,stores,missing,savings:0,label:"Menor preço em várias lojas"};
}

function buildSingle(products:Product[],people:number,budget:number):Plan{
  const desired=desiredItems(products,people).filter(r=>r.product) as Array<{essential:Essential;product:Product;quantity:number}>;
  const storeNames=new Set<string>(); desired.forEach(r=>r.product.offers?.forEach(o=>storeNames.add(o.establishment)));
  let best:Plan|null=null;
  for(const storeName of storeNames){ const items:PlannedItem[]=[]; const missing:string[]=[]; let total=0; let coveredPriority=0;
    for(const row of desired){ const offer=row.product.offers?.find(o=>o.establishment===storeName); if(!offer){missing.push(row.essential.label);continue;} let added=0; for(let i=0;i<row.quantity;i++){if(total+offer.value>budget)break; total+=offer.value; added++;} if(added){items.push({product:row.product,quantity:added,offer,subtotal:offer.value*added,essential:row.essential.label});coveredPriority+=100-row.essential.priority;} else missing.push(row.essential.label); }
    const candidate:Plan={strategy:"single_store",total,items,stores:items.length?[storeName]:[],missing,savings:0,label:"Melhor cesta em uma loja",storeName};
    const score=coveredPriority*1000+items.reduce((s,i)=>s+i.quantity,0); const bestScore=best?best.items.reduce((s,i)=>s+(100-(ESSENTIALS.find(e=>e.label===i.essential)?.priority||99))*1000+i.quantity,0):-1;
    if(!best || score>bestScore || (score===bestScore&&total<best.total)) best=candidate;
  }
  return best || {strategy:"single_store",total:0,items:[],stores:[],missing:ESSENTIALS.map(e=>e.label),savings:0,label:"Melhor cesta em uma loja"};
}

export function SmartBasketPage(){
  const navigate=useNavigate(); const[profile,setProfile]=useState<SessionProfile|null>(null); const[authLoading,setAuthLoading]=useState(true); const[products,setProducts]=useState<Product[]>([]); const[loading,setLoading]=useState(true);
  const[budget,setBudget]=useState(350); const[income,setIncome]=useState<number|"">(""); const[people,setPeople]=useState(2); const[selected,setSelected]=useState<"multi_store"|"single_store">("multi_store"); const[saving,setSaving]=useState(false); const[message,setMessage]=useState("");
  useEffect(()=>{loadSessionProfile().then(p=>{setProfile(p);setAuthLoading(false);if(!p)navigate("/login?redirect=/cesta-inteligente",{replace:true});});},[navigate]);
  useEffect(()=>{fetchCatalog().then(c=>setProducts(c.products)).finally(()=>setLoading(false));},[]);
  const suggestedBudget=useMemo(()=>income?Math.max(50,Math.round(Number(income)*0.25)):null,[income]);
  const multi=useMemo(()=>buildMulti(products,people,Math.max(0,budget)),[products,people,budget]);
  const single=useMemo(()=>buildSingle(products,people,Math.max(0,budget)),[products,people,budget]);
  const baseline=Math.max(multi.total,single.total); multi.savings=Math.max(0,baseline-multi.total); single.savings=Math.max(0,baseline-single.total); const active=selected==="multi_store"?multi:single;
  async function savePlan(){if(!profile||!supabase||!active.items.length)return;setSaving(true);setMessage("");const payload={user_id:profile.userId,name:`Cesta ${new Date().toLocaleDateString("pt-BR")}`,budget,household_income:income||null,household_size:people,strategy:active.strategy,total:active.total,savings:active.savings,store_count:active.stores.length,items:active.items.map(i=>({product_id:i.product.id,name:i.product.name,quantity:i.quantity,unit_price:i.offer.value,subtotal:i.subtotal,establishment:i.offer.establishment,establishment_id:i.offer.establishmentId}))};const{error}=await supabase.from("smart_basket_plans").insert(payload);setSaving(false);setMessage(error?`Não foi possível salvar: ${error.message}`:"Cesta salva na sua conta.");}
  if(authLoading||loading)return <main className="smart-basket-state"><LoaderCircle className="spin"/><strong>Preparando sua cesta inteligente…</strong></main>;
  if(!profile)return null;
  return <div className="smart-basket-page"><header className="smart-basket-top"><Link to="/cesta-basica"><ArrowLeft/> Minha lista</Link><div><Sparkles/><span><strong>Cesta Inteligente</strong><small>PreçoCerto · Feijó, AC</small></span></div><span className="smart-user"><BadgeCheck/>{profile.name}</span></header>
    <main id="conteudo-principal" className="smart-basket-shell"><section className="smart-basket-hero"><div><small>PLANEJAMENTO DE COMPRA</small><h1>Monte a melhor cesta para o dinheiro que você tem.</h1><p>O sistema prioriza itens essenciais, respeita seu orçamento e compara comprar em uma única loja ou dividir a compra entre estabelecimentos.</p></div><ShoppingBasket/></section>
    <section className="smart-planner"><div className="smart-controls"><label><span><WalletCards/> Quanto você tem disponível?</span><div className="money-input"><b>R$</b><input type="number" min="10" step="10" value={budget} onChange={e=>setBudget(Math.max(0,Number(e.target.value)))}/></div></label><label><span>Renda mensal da família <em>opcional</em></span><div className="money-input"><b>R$</b><input type="number" min="0" step="100" value={income} placeholder="Ex.: 2.500" onChange={e=>setIncome(e.target.value===""?"":Number(e.target.value))}/></div>{suggestedBudget&&<button type="button" className="budget-suggestion" onClick={()=>setBudget(suggestedBudget)}>Usar referência de {brl.format(suggestedBudget)} <small>25% da renda · ajustável</small></button>}</label><label><span>Pessoas na casa</span><select value={people} onChange={e=>setPeople(Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"pessoa":"pessoas"}</option>)}</select></label></div><p className="smart-note">A lista é uma ferramenta de planejamento e comparação de preços. As quantidades são sugestões ajustáveis e não representam recomendação nutricional ou uma cesta oficial de governo.</p></section>
    <section className="smart-results"><header><div><small>COMPARAÇÃO AUTOMÁTICA</small><h2>Escolha como quer comprar</h2></div><strong>Orçamento: {brl.format(budget)}</strong></header><div className="smart-strategies"><button type="button" className={selected==="multi_store"?"is-active":""} onClick={()=>setSelected("multi_store")}><span className="strategy-icon"><PiggyBank/></span><span><small>MAIOR ECONOMIA</small><strong>Menores preços em várias lojas</strong><em>O sistema escolhe a oferta mais barata de cada item.</em></span><b>{brl.format(multi.total)}</b><i>{multi.stores.length} {multi.stores.length===1?"loja":"lojas"}</i></button><button type="button" className={selected==="single_store"?"is-active":""} onClick={()=>setSelected("single_store")}><span className="strategy-icon"><Store/></span><span><small>MAIS PRATICIDADE</small><strong>Melhor compra em uma loja</strong><em>{single.storeName?`Melhor cobertura encontrada em ${single.storeName}.`:"Procura uma loja com a melhor combinação."}</em></span><b>{brl.format(single.total)}</b><i>{single.items.length} itens atendidos</i></button></div></section>
    <section className="smart-plan"><div className="smart-plan-list"><header><span><CheckCircle2/><div><small>CESTA CALCULADA</small><h2>{active.label}</h2></div></span><strong>{active.items.reduce((s,i)=>s+i.quantity,0)} unidades</strong></header>{active.items.map(item=><article key={`${item.product.id}-${item.offer.establishment}`}><div><small>{item.essential}</small><strong>{item.product.name}</strong><em>{item.product.size} · {item.offer.establishment}</em></div><span>{item.quantity} × {brl.format(item.offer.value)}</span><b>{brl.format(item.subtotal)}</b></article>)}{!active.items.length&&<div className="smart-empty">Não encontramos itens suficientes para este orçamento. Aumente o valor ou tente novamente quando houver mais preços cadastrados.</div>}</div><aside className="smart-summary"><small>RESUMO</small><h2>{brl.format(active.total)}</h2><div><span>Saldo do orçamento</span><strong>{brl.format(Math.max(0,budget-active.total))}</strong></div><div><span>Estabelecimentos</span><strong>{active.stores.length}</strong></div><div><span>Itens essenciais não atendidos</span><strong>{active.missing.length}</strong></div>{active.missing.length>0&&<p>Faltaram: {active.missing.slice(0,6).join(", ")}{active.missing.length>6?"…":""}</p>}<button type="button" disabled={saving||!active.items.length} onClick={savePlan}>{saving?<LoaderCircle className="spin"/>:<Save/>}{saving?"Salvando…":"Salvar esta cesta"}</button>{message&&<p className={message.startsWith("Cesta salva")?"success":"error"}>{message}</p>}<Link to="/buscar"><Building2/> Ajustar produtos manualmente</Link></aside></section>
    </main></div>;
}
