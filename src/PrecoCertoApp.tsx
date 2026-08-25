

import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleDollarSign, Clock3, CreditCard, Database, Download, Edit, ExternalLink, Flag,
  Heart, Home, Info, LayoutDashboard, LineChart, ListChecks, Loader2, LockKeyhole, MapPin, Menu, Moon, PackageSearch,
  Plus, Printer, Receipt, RotateCcw, Save, Search, Settings, Share2, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Sparkles, Store, Sun, Trash2, TrendingDown, TrendingUp, Truck, Upload, UserRound, Users, X,
} from "lucide-react";



import { FormEvent, ReactNode, useEffect, useMemo, useState, useRef, type ChangeEvent, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { buildCatalog, verifiedDatasetMetrics, type PlatformMetrics, type Product, type StoreRow } from "./data/catalog";
import { fetchCatalog } from "./data/remoteCatalog";
import { supabase } from "./lib/supabase";
import { isEnabled } from "./config/features";
import { priceFreshness, unitPrice, type FreshnessState } from "./lib/pricing";
import { normalizeSearchText, searchProducts, suggestProducts } from "./lib/productSearch";
import { priceReportReasons, submitPriceReport } from "./data/priceReports";
import { loadSessionProfile, requestPasswordReset, signIn, signInMerchantWithCpf, signOut, type SessionProfile } from "./lib/roles";
import { loadMerchantMembership, resolveAuthenticatedHome, loadDeliveryZones, createMarketplaceOrder, startMercadoPagoCheckout, type DeliveryZone } from "./lib/merchantPlatform";
import { CustomerOrders } from "./components/CustomerOrders";
import { PriceHistorySection } from "./components/PriceHistorySection";

import { optimizeBasket, saveBasket, getBasketSnapshot, type OptimizationMode, type BasketItemConfig, type BasketResult } from "./lib/smartBasket";
import { jsPDF } from "jspdf";
import { planBasketPdf, renderPlanToPdf } from "./lib/basketPdf";
import { getPdfOrientation, setPdfOrientation as savePdfOrientation } from "./lib/pdfPrefs";
import { AdminStoreCatalog } from "./components/AdminStoreCatalog";
import { getStoreLogoUrl } from "./data/storeLogos";
import { AdminUserManagement } from "./components/AdminUserManagement";
import { DorinhaAuthorStore } from "./components/DorinhaAuthorStore";
import FavoritesPage from "./pages/FavoritesPage";


const initialCatalog = buildCatalog();
const initialProducts: Product[] = initialCatalog.products;

const initialStores: StoreRow[] = initialCatalog.stores;

const adminRouteNames: Record<string, string> = {
  "/admin": "Visão geral", 
  "/admin/gestao": "Licenças e assinaturas", 
  "/admin/acessos-temporarios": "Acessos temporários",
  "/admin/analytics": "Analytics", 
  "/admin/auditoria": "Auditoria geral", 
  "/admin/auditoria-acessos": "Auditoria de acessos",
  "/admin/auditoria-numeros": "Consistência de números", 
  "/admin/cadastro-foto": "Cadastro por foto",
  "/admin/catalogo": "Catálogo de produtos", 
  "/admin/fotos-pendentes": "Fotos Pendentes",
  "/admin/categorizacao": "Categorização inteligente", 
  "/admin/cesta": "Cesta básica",
  "/admin/cesta-auditoria": "Auditoria da cesta", 
  "/admin/clientes": "Contas e clientes", 
  "/admin/cobertura": "Cobertura por loja",
  "/admin/consistencia": "Consistência operacional", 
  "/admin/contas": "Contas e segurança", 
  "/admin/conversoes": "Conversões",
  "/admin/cupom": "Leitura de cupom", 
  "/admin/cupom-lote": "Cupons em lote", 
  "/admin/historico-precos": "Histórico de preços",
  "/admin/ia": "Inteligência artificial", 
  "/admin/icones-categoria": "Ícones de categoria", 
  "/admin/image-jobs": "Fila de imagens",
  "/admin/importacoes": "Importações", 
  "/admin/lote-inserir": "Inserção em lote", 
  "/admin/metricas": "Métricas",
  "/admin/operacao": "Operação", 
  "/admin/preco-rapido": "Preço rápido", 
  "/admin/precos": "Gestão de preços",
  "/admin/promocoes": "Promoções", 
  "/admin/promocoes-codigos": "Códigos promocionais", 
  "/admin/rank-check": "Validação de ranking",
  "/admin/reports": "Denúncias de preço", 
  "/admin/sinonimos": "Sinônimos de busca", 
  "/admin/vitrine": "Vitrine pública", 
  "/admin/webhooks": "Webhooks",
};

function money(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function count(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }

function StoreMark({ store, small = false }: { store: Pick<StoreRow, "name" | "color">; small?: boolean }) {
  const logoUrl = getStoreLogoUrl(store.name);
  const initials = store.name.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();
  return <span className={`store-logo${small ? " small" : ""}${logoUrl ? " has-image" : ""}`} style={{ background: store.color }}>
    {logoUrl ? <img src={logoUrl} alt={`Logomarca ${store.name}`} loading="lazy" /> : initials}
  </span>;
}

/**
 * Registra uma entrada no log de auditoria persistente.
 */
function addAuditLog(action: string, type: "success" | "warning" | "error" = "success", user: string = "Franc D’Nis") {
  try {
    const key = "precocerto:admin_logs";
    const logs = JSON.parse(localStorage.getItem(key) ?? "[]");
    const newLog = { action, type, user, at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify([newLog, ...logs].slice(0, 100)));
  } catch (err) {
    console.error("Erro ao salvar log de auditoria:", err);
  }
}


import ypeNeutroAsset from "./assets/ype-neutro.png.asset.json";
import frangoSearaAsset from "./assets/frango-seara.png.asset.json";

import pinhoSolFloralAsset from "./assets/pinho-sol-floral.png.asset.json";
import alpesLavandaAsset from "./assets/alpes-lavanda.png.asset.json";
import alpesLimaoAsset from "./assets/alpes-limao.png.asset.json";
import alpesMacaAsset from "./assets/alpes-maca.png.asset.json";
import minuanoMarinhaAsset from "./assets/minuano-marinha.png.asset.json";
import ypeLimaoAsset from "./assets/ype-limao.png.asset.json";

import alcatraAsset from "./assets/alcatra.jpg.asset.json";
import alhoAsset from "./assets/alho-_kg_.jpg.asset.json";
import arrozTioUrbano5kgAsset from "./assets/arroz-tio-urbano-branco-5kg.jpg.asset.json";
import biscoitoAtrevidosAsset from "./assets/biscoito-atrevidos-sabores-90g.jpg.asset.json";
import cebolaAsset from "./assets/cebola-_kg_.jpg.asset.json";
import frangoSadiaAsset from "./assets/caixa-de-frango-sadia.jpg.asset.json";
import frangoSearaPackAsset from "./assets/caixa-de-frango-seara.jpg.asset.json";
import escureto35gAsset from "./assets/biscoito_escureto_35g.png.asset.json";
import esponjaBrilhusAsset from "./assets/esponja_brilhus.png.asset.json";
import paoCestaAsset from "./assets/pao_cesta.png.asset.json";
import nissinCarneAsset from "./assets/nissin_lamen_carne.png.asset.json";

import itamaratyMorangoAsset from "./assets/biscoito_itamaraty_morango.png.asset.json";

const productImages: Record<string, string> = {
  // Pack 2 Mappings
  "844d8729-b2a0-4a60-9c23-a074c9e0979a": "/products/rabo.jpg",
  "294e5690-ed74-4898-a079-263f6060c2b5": "/products/biscoito-wafer-bauducco-sabores-70g.jpg",
  "7a2666ab-25f7-4e0a-bf35-cf916fab9396": "/products/biscoito-cookies-bauducco-chocolate-60g.jpg",
  "47444638-2e10-4f56-9723-52bad766b205": "/products/carne-bovina-em-conserva-anglo-320g.jpg",
  "9a971a21-3377-431a-a1b8-48034499c194": "/products/carne-bovina-em-conserva-bertin-320g.jpg",
  "b6744248-6d22-4a38-975a-7a92ec4a90fa": "/products/molho-de-tomate-tarantella-tradicional-300g.jpg",
  "29c90c81-d06d-45e1-a64a-8867de7ab896": "/products/arroz-branco-bernardo-1kg.jpg",
  "5d272a4b-0409-4e04-ab01-8e8c4114c484": "/products/leite-condensado-piracanjuba-semidesnatado-395g.jpg",
  "29a5e459-5c1b-4cbf-86cf-e258de75b47d": "/products/patinho.jpg",
  "27f126f7-dfb3-42e4-bd1b-ef0d34d80731": "/products/lava-roupas-minuano-concentrado-1,6kg.jpg",
  "itamaraty-morango": itamaratyMorangoAsset.url,
  "escureto-35g": escureto35gAsset.url,
  "esponja-brilhus": esponjaBrilhusAsset.url,
  "pao-cesta": paoCestaAsset.url,
  "nissin-carne": nissinCarneAsset.url,
  "alcatra": alcatraAsset.url,
  "alho-kg": alhoAsset.url,
  "arroz-tio-urbano-5kg": arrozTioUrbano5kgAsset.url,
  "biscoito-atrevidos": biscoitoAtrevidosAsset.url,
  "cebola-kg": cebolaAsset.url,
  "frango-sadia-caixa": frangoSadiaAsset.url,
  "frango-seara-caixa": frangoSearaPackAsset.url,
  "4b5508ae-5214-4bb0-9857-38eee60743bb": "/products/biscoito-itamarati-recheado.jpg",
  "2b13198e-2499-437c-ae9f-baeabec7b783": "/products/biscoito-brandini-salt-plus-360g.jpg",
  "639fa99b-96ea-4488-922f-f22f091f5da1": "/products/biscoito-vitarella-cream-cracker-330g.jpg",
  "927e73ff-e6a8-4fe5-ad2a-1f331a77ec41": "/products/biscoito-galo-cream-cracker.jpg",
  "88d74a86-11ae-44e7-9ddc-4a42c38894e2": "/products/coco-ralado-sococo-100g.jpg",
  "ab9ed77b-3b80-4f43-ad09-7c119a566e11": "/products/salsicha-bordon-180g.jpg",
  "d63f2de8-957c-4894-aed6-98c1934e6bf9": "/products/carne-bovina-pampeano-320g.jpg",
  "8b3c4919-7562-421d-8a15-3339cb3d5ad3": "/products/aveia-quaker-flocos-finos-450g.jpg",
  "e1d650e2-b0ed-47f7-81b9-9317ebfc5cc7": "/products/shampoo-clear-men-queda-control-200ml.jpg",

  // Mapeamento manual para o catálogo local (seed)
  "arroz-tio-joao-5kg": "/products/arroz-tio-joao-5kg.png",
  "cafe-3-coracoes-500g": "/products/cafe-3-coracoes-500g.jpg",
  "leite-italac-1l": "/products/leite-italac-1l.jpg",
  "feijao-kicaldo-1kg": "/products/feijao-kicaldo-1kg.jpg",
  "oleo-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "oleo-soja-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "acucar-uniao-1kg": "/products/acucar-uniao-1kg.jpg",
  "detergente-ype-500ml": ypeNeutroAsset.url,

  // Mapeamento por UUID para dados do Supabase (conforme auditoria)
  "c1d78817-20b9-40b2-b12d-a9bc73152d47": ypeNeutroAsset.url,
  "8519fc88-a26f-433d-a992-6cad775efc83": "/products/neston-3-cereais-nestle-360g.jpg",
  "0ce0efbf-2c25-4b0a-a80f-c5402bc128d1": "/products/biscoito-spantoo-80g.jpg",
  "c309be5b-38cf-4447-b361-e7ce38934f29": "/products/biscoito-spantoo-chocolate-30g.jpg",
  "7f0013fe-c0b4-4226-8df3-1cf90500aa7a": "/products/agua-sanitaria-ype-2l.jpg",
  "28237267-da30-46f7-b87c-9c92efa870eb": "/products/agua-sanitaria-ype-1l.jpg",
  "7b21cc10-79a7-42a5-9c8b-71efea6942f3": "/products/cenoura.jpg",
  "4c142243-a950-4b89-9a09-a022f39153fb": "/products/leite-uht-integral-piracanjuba-1l.jpg",
  "e0398ca5-3dcd-44f5-ab76-f87eb161d885": "/products/papel-higienico-cotton-deluxe-folha-dupla-4-unidades.jpg",
  "6d2f0fc9-22d0-47a4-bcfa-b4bb1c19a893": "/products/papel-higienico-deluxe-cotton-folha-dupla-leve-12-pague-11.jpg",
  "1c56c1c7-35c5-45e5-8be6-5e0da6cb2759": "/products/vinagre-de-maca-toscano-750ml.jpg",
  "ce2c94b7-0814-40b5-8092-a20e0c48fd04": "/products/vinagre-de-alcool-toscano-aromas-750ml.jpg",
  "7e9904bf-cd6a-418a-af72-eb9533d55f2d": "/products/vinagre-de-alcool-castelo-750ml.jpg",
  "5271abc6-2ba0-451b-bf94-f19700072b7a": "/products/sabao-em-po-tixan-ype-maciez-400g.jpg",
  "6aedd90a-c64b-480d-a193-dbadda7b93e2": "/products/sabao-em-po-tixan-ype-primavera-400g.jpg",
  "fbb25f65-4bd5-4d63-8549-3af2a077378d": "/products/detergente-vida-limao-500ml.jpg",
  "0cb7a39c-9f06-4b18-9472-b3ed904ae7b1": "/products/agua-sanitaria-cristal-1l.jpg",
  "a974921f-7c92-4d2d-8944-1a856fb41a53": "/products/cereal-matinal-moca-flakes-120g.jpg",
  "b9facf19-aa5d-4891-9fdf-b3ef94c142ba": "/products/cereal-matinal-nescau-120g.jpg",
  "d2a41d39-9395-4928-b5a2-39509415c609": "/products/cereal-matinal-snow-flakes-120g.jpg",
  "9f56dec0-c98a-400a-aae5-a2ea6088411a": "/products/leite-em-po-ninho-integral-instantaneo-380g.jpg",
  "6fd81e2d-c147-4059-a383-38bd6972acc9": "/products/limpador-urca-multiuso-2l.jpg",
  "e206b8a7-fb93-447e-93cf-2a2d2751783f": "/products/salsicha-ao-molho-bordon-300g.jpg",
  "28026257-183e-4e4b-b957-ea8cb545169f": "/products/almondegas-de-carne-bovina-pampeano-320g.jpg",
  "3de65489-fb83-4c00-b4fd-759fd248e99c": "/products/carne-bovina-em-conserva-target-320g.jpg",
  "9714fa33-34ea-48f9-a61b-38ec83502e60": "/products/milho-verde-em-conserva-ole-200g.jpg",
  "9ed0f34c-9ff1-49cc-b354-eca072e3fd89": "/products/biscoito-cream-cracker-vivale-300g.jpg",
  "5f642e0b-4586-4c08-a44b-b3624300dde4": "/products/batata-inglesa.jpg",
  "66ed0c4d-6cb6-4474-a5c5-9edc98225cf4": "/products/inseticida-raid-base-agua-300ml.jpg",
  "0e3d3cfc-3a67-41ed-a9e1-c23c37176644": "/products/inseticida-mat-inset-multi-300ml.jpg",
  "849adcfe-0deb-473d-9aa8-000a1ee03dfd": "/products/inseticida-baygon-acao-total-360ml.jpg",
  "2c6ca30f-393d-4e20-82ad-62083d65c973": "/products/biscoito-salgado-mirim-300g.jpg",
  "143bcb52-bd86-4027-8e81-665d0ba063c9": "/products/biscoito-agua-e-sal-dallas-300g.jpg",
  "36facb08-a950-4a91-8e3a-22742a3c9661": "/products/kit-dabelle-liso-arrasador-(shampoo-250ml-+-condicionador-175ml).jpg",
  "3e7852ff-61aa-4a6c-86a7-986a4a8f9a50": "/products/bisteca.jpg",
  "cb2200d1-9e1b-4db1-b140-f4fd9c359f4e": "/products/kit-dabelle-abacate-nutritivo-(shampoo-+-condicionador).jpg",
  "09ab7d64-54f1-43ee-8c20-cbb2e0c03705": "/products/macarrao-espaguete-miragina-500g.jpg",
  "12c777b0-3c5a-4b36-89d0-89a52031605c": "/products/margarina-delicia-com-creme-de-leite-1kg.jpg",
  "818e1399-ccc3-4b93-9fae-5b14926b94dd": "/products/macarrao-instantaneo-nissin-lamen-galinha-85g.jpg",
  "b6f5b793-2f80-4132-97e1-db427206d2e5": "/products/macarrao-instantaneo-nissin-lamen-frango-assado-com-limao-85g.jpg",
  "b4926d43-5005-4471-970b-9905e0636ead": "/products/massa-para-lasanha-dona-benta-500g.jpg",
  "a9e5ce2c-5099-440a-97d1-ce4ef6da5ff8": "/products/lava-roupas-em-po-tixan-ype-primavera-2.4kg.jpg",
  "7e5a5851-b545-4ebe-a731-611d74543ce0": "/products/lava-roupas-em-po-tixan-ype-primavera-4kg.jpg",
  "2248bfe3-b8c8-49bb-bee0-c00b8ad7ab96": "/products/limpador-multiuso-casa-&-perfume-500ml.jpg",
  "b36a8f23-3441-475e-9053-9a970646953d": "/products/leite-de-coco-bom-coco-200ml.jpg",
  "ea19f422-4c32-4f17-98a6-b6510e356e4c": "/products/cup-noodles-nissin-bolonhesa-70g.jpg",
  "8c2a31b4-774f-49f5-aec6-592104283209": "/products/cup-noodles-nissin-galinha-caipira-picante-70g.jpg",
  "159e9aa1-7848-4b39-b101-291e21f8b217": "/products/cup-noodles-nissin-costela-70g.jpg",
  "72a3291b-4f84-433c-9ba3-e445935fe0d9": "/products/seleta-de-legumes-em-conserva-ole-200g.jpg",
  "054fdaa5-99b2-45a8-909e-30981c8b7625": "/products/feijao-carioca-bernardo-1kg.jpg",
  "pinho-sol-floral-500ml": pinhoSolFloralAsset.url,
  "alpes-lavanda-500ml": alpesLavandaAsset.url,
  "alpes-limao-500ml": alpesLimaoAsset.url,
  "alpes-maca-500ml": alpesMacaAsset.url,
  "minuano-marinha-500ml": minuanoMarinhaAsset.url,
  "ype-limao-500ml": ypeLimaoAsset.url,
};

function ProductImage({ product, size = "default", eager = false }: { product: Product | any; size?: "compact" | "default" | "hero" | "basket"; eager?: boolean }) {
  const fallback = "/products/arroz-tio-joao-5kg.png";
  
  const lowerName = product.name?.toLowerCase() || "";
  const isDetergent = lowerName.includes("detergente") || product.category?.toLowerCase().includes("limpeza");
  const isBean = lowerName.includes("feijao");
  const isOil = lowerName.includes("oleo");
  const isChicken = lowerName.includes("frango");
  const isBiscuit = lowerName.includes("biscoito") || lowerName.includes("bolacha");
  const isPasta = lowerName.includes("macarrão") || lowerName.includes("macarrao") || lowerName.includes("nissin") || lowerName.includes("lámen") || lowerName.includes("lamen");
  const isBread = lowerName.includes("pão") || lowerName.includes("pao");
  const isSponge = lowerName.includes("esponja");
  
  // Specific fallbacks based on brand/scent/type
  let detergentFallback = ypeNeutroAsset.url;
  if (lowerName.includes("pinho sol")) detergentFallback = pinhoSolFloralAsset.url;
  else if (lowerName.includes("alpes")) {
    if (lowerName.includes("lavanda")) detergentFallback = alpesLavandaAsset.url;
    else if (lowerName.includes("limão") || lowerName.includes("limao")) detergentFallback = alpesLimaoAsset.url;
    else if (lowerName.includes("maçã") || lowerName.includes("maca")) detergentFallback = alpesMacaAsset.url;
  }
  else if (lowerName.includes("minuano")) detergentFallback = minuanoMarinhaAsset.url;
  else if (lowerName.includes("ypê") || lowerName.includes("ype")) {
    if (lowerName.includes("limão") || lowerName.includes("limao")) detergentFallback = ypeLimaoAsset.url;
  }

  let biscuitFallback = "/products/biscoito-wafer-bauducco-sabores-70g.jpg";
  if (lowerName.includes("itamaraty") && lowerName.includes("morango")) biscuitFallback = itamaratyMorangoAsset.url;
  else if (lowerName.includes("escureto")) biscuitFallback = escureto35gAsset.url;

  let pastaFallback = "/products/molho-de-tomate-tarantella-tradicional-300g.jpg"; // Generic fallback
  if (isPasta && (lowerName.includes("carne") || lowerName.includes("nissin"))) pastaFallback = nissinCarneAsset.url;

  const spongeFallback = esponjaBrilhusAsset.url;
  const breadFallback = paoCestaAsset.url;
  const beanFallback = "/products/feijao-kicaldo-1kg.jpg";
  const oilFallback = "/products/oleo-liza-900ml.jpg";
  const chickenFallback = frangoSearaAsset.url;

  let selectedFallback = fallback;
  if (isDetergent) selectedFallback = detergentFallback;
  else if (isBean) selectedFallback = beanFallback;
  else if (isOil) selectedFallback = oilFallback;
  else if (isChicken) selectedFallback = chickenFallback;
  else if (isBiscuit) selectedFallback = biscuitFallback;
  else if (isPasta) selectedFallback = pastaFallback;
  else if (isBread) selectedFallback = breadFallback;
  else if (isSponge) selectedFallback = spongeFallback;

  const src = product.image_url || 
              productImages[product.slug] || 
              productImages[String(product.id)] || 
              selectedFallback;
  
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    
    // Skip processing on mobile or modest devices for performance
    if (window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)) {
      setProcessedSrc(src);
      return;
    }

    // Skip local assets that are already "clean" enough or if it's already a blob
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setProcessedSrc(src);
      return;
    }

    const removeBackground = async (imageSrc: string) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // Set a timeout for loading
          setTimeout(() => reject(new Error("Timeout loading image")), 5000);
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return imageSrc;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const corners = [
          [0, 0], [canvas.width - 1, 0], 
          [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
        ].map(([x, y]) => {
          const idx = (y * canvas.width + x) * 4;
          return [data[idx], data[idx + 1], data[idx + 2]];
        });

        const bgR = corners.reduce((sum, c) => sum + c[0], 0) / 4;
        const bgG = corners.reduce((sum, c) => sum + c[1], 0) / 4;
        const bgB = corners.reduce((sum, c) => sum + c[2], 0) / 4;

        const threshold = 45; 

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) + 
            Math.pow(g - bgG, 2) + 
            Math.pow(b - bgB, 2)
          );

          if (diff < threshold) {
            data[i + 3] = 0; 
          } else if (diff < threshold + 20) {
            data[i + 3] = ((diff - threshold) / 20) * 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
      } catch (err) {
        console.warn("Background removal skipped/failed:", err);
        return imageSrc;
      }
    };

    removeBackground(src).then(setProcessedSrc);
  }, [src]);

  const priceDisplay = product.minPrice ? money(Number(product.minPrice)) : '---';

  return (
    <div className={`product-photo product-photo--${size}`}>
      <img 
        src={processedSrc || src} 
        alt={`Embalagem de ${product.name}`} 
        loading={eager ? "eager" : "lazy"} 
        crossOrigin="anonymous"
        className={processedSrc ? "is-processed" : ""}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== selectedFallback) {
            target.src = selectedFallback;
          }
        }} 
      />
      <div className="product-photo-overlay" aria-hidden="true" />
      
      {/* Padronização visual do preço no card se em modo compacto/default */}
      {(size === "default" || size === "compact") && product.minPrice > 0 && (
        <div className="card-price-overlay" style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          padding: '2px 8px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--green)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 2
        }}>
          {priceDisplay}
        </div>
      )}
    </div>
  );
}

function Brand({ compact = false, inverse = false, className = "", onClick }: { compact?: boolean; inverse?: boolean; className?: string; onClick?: () => void }) {
  return (
    <div 
      className={`brand ${className} ${inverse ? "brand--inverse" : ""} ${compact ? "brand--compact" : ""}`} 
      onClick={() => {
        if (onClick) onClick();
        window.location.href = "/";
      }}
      style={{ cursor: 'pointer' }}
      role="link"
      tabIndex={0}
      aria-label="PreçoCerto — página inicial"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (onClick) onClick();
          window.location.href = "/";
        }
      }}
    >
      <img 
        className="brand__logo-img"
        src={inverse ? "/logo-preco-certo-inversa.svg" : "/logo-preco-certo.svg"}
        alt="PreçoCerto" 
      />
    </div>
  );
}

type ColorTheme = "light" | "dark";

function getInitialTheme(): ColorTheme {
  const saved = localStorage.getItem("precocerto:theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let themeTransitionFrame = 0;

function commitColorTheme(theme: ColorTheme) {
  const root = document.documentElement;
  cancelAnimationFrame(themeTransitionFrame);
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  localStorage.setItem("precocerto:theme", theme);

  themeTransitionFrame = requestAnimationFrame(() => {
    themeTransitionFrame = requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

function useColorTheme() {
  const [theme, setTheme] = useState<ColorTheme>(getInitialTheme);
  useEffect(() => {
    const syncTheme = (event: Event) => setTheme((event as CustomEvent<ColorTheme>).detail);
    window.addEventListener("precocerto:theme", syncTheme);
    return () => window.removeEventListener("precocerto:theme", syncTheme);
  }, []);
  useEffect(() => {
    if (document.documentElement.dataset.theme !== theme) commitColorTheme(theme);
  }, [theme]);
  const toggleTheme = () => {
    const nextTheme: ColorTheme = theme === "light" ? "dark" : "light";
    commitColorTheme(nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent("precocerto:theme", { detail: nextTheme }));
  };
  return { theme, toggleTheme };
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useColorTheme();
  const dark = theme === "dark";
  return <button type="button" className={`theme-toggle ${compact ? "theme-toggle--compact" : ""}`} onClick={toggleTheme} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} title={dark ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={dark}>
    <span className="theme-toggle__track" aria-hidden="true">
      <span className="theme-toggle__indicator" />
      <span className="theme-toggle__option theme-toggle__option--light"><Sun size={14}/></span>
      <span className="theme-toggle__option theme-toggle__option--dark"><Moon size={14}/></span>
    </span>
    {!compact && <span className="theme-toggle__label">{dark ? "Modo escuro" : "Modo claro"}</span>}
  </button>;
}

function useAccountSpace(){
  const [space,setSpace]=useState({href:"/login?redirect=%2Fpainel-lojista",label:"Meu espaço",kind:"guest"});
  useEffect(()=>{let active=true;void(async()=>{const [profile,membership]=await Promise.all([loadSessionProfile(),loadMerchantMembership()]);if(!active)return;if(profile?.isAdmin)setSpace({href:"/admin/plataforma",label:"Administração",kind:"admin"});else if(membership)setSpace({href:"/painel-lojista",label:"Meu negócio",kind:"merchant"});else if(profile)setSpace({href:"/perfil",label:"Minha conta",kind:"consumer"})})();return()=>{active=false}},[]);
  return space;
}


function Header({ basketCount, favoritesCount, user, onLogout, products, favorites, addBasket }: { basketCount: number; favoritesCount: number; user: any; onLogout: () => void; products: Product[]; favorites: string[]; addBasket: (p: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const accountSpace=useAccountSpace();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Listen for history changes if needed, but for simple SPA this works:
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const isHome = currentPath === "/";
  const headerClass = `site-header ${isHome ? "site-header--absolute" : ""} ${scrolled ? "site-header--scrolled" : ""}`;

  const navLinks = [
    { label: "Comparar preços", href: "/buscar" },
    { label: "Ofertas", href: "/melhores-precos" },
    { label: "Açougues", href: "/acougues" },
    { label: "Cesta inteligente", href: "/cesta-basica" },
    { label: "Estabelecimentos", href: "/estabelecimentos" },
    { label: "Planos", href: "/planos" },
    { label: "Dorinha Barroso", href: "/dorinha", special: true }
  ];

  return <header className={headerClass} role="banner">
    <div className="shell header-inner">
      <div className="header-brand-zone">
        <Brand compact className="header-logo-container" onClick={() => localStorage.removeItem("precocerto:last_writer_store")} />
        <div className="header-location-wrapper">
          <button 
            type="button" 
            onClick={() => window.location.href = "/estabelecimentos"} 
            className="header-location"
            aria-label="Ver estabelecimentos em Feijó, Acre"
          >
            <MapPin size={14} aria-hidden="true" /> <span>Feijó, AC</span>
          </button>
        </div>
      </div>
      <nav className="desktop-nav desktop-nav--premium" aria-label="Navegação principal">
        {navLinks.map(link => {
          const isActive = currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href));
          const isDorinhaActive = (link.href === "/dorinha" || link.href === "/escritora") && (currentPath === "/dorinha" || currentPath === "/escritora");
          const finalActive = isActive || isDorinhaActive;
          
          return (
            <a 
              key={link.href} 
              href={link.href} 
              className={`${finalActive ? "active" : ""} ${link.special ? "nav-link--special" : ""}`} 
              aria-current={finalActive ? "page" : undefined}
              style={link.special && finalActive ? { borderColor: 'var(--pc-color-primary)', color: 'var(--pc-color-primary)' } : {}}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
      <div className="header-actions">
        <a className="icon-button header-space-link" href={accountSpace.href} aria-label={accountSpace.label} title={accountSpace.label}>{accountSpace.kind==="admin"?<ShieldCheck size={18}/>:accountSpace.kind==="merchant"?<Store size={18}/>:<UserRound size={18}/>}<span>{accountSpace.label}</span></a>
        
        <a className="icon-button header-action-button header-search-button" href="/buscar" aria-label="Pesquisar produtos" title="Buscar produtos"><Search size={20} aria-hidden="true" /></a>
        
        <div className="favorites-dropdown-container" style={{ position: 'relative' }}>
          <a className="icon-button header-action-button favorites-button" href="/favoritos" aria-label={user ? `${favoritesCount} produtos favoritos` : "Entre para ver favoritos"} title={user ? "Meus Favoritos" : "Entre para ver favoritos"} onClick={(e) => { 
            // Permite acesso mesmo deslogado para ver favoritos locais
            if (!user && favoritesCount === 0) {
              e.preventDefault();
              window.location.href = `/login?redirect=${encodeURIComponent('/favoritos')}`;
            }
          }}>
            <Heart size={20} fill={favoritesCount > 0 ? "currentColor" : "none"} aria-hidden="true" />
            {favoritesCount > 0 && <span className="badge" aria-hidden="true">{favoritesCount}</span>}
          </a>
          {favoritesCount > 0 && (
            <div className="favorites-dropdown-menu">
              <div className="favorites-dropdown-head">
                <strong>Favoritos ({favoritesCount})</strong>
                <a href="/favoritos">Ver todos</a>
              </div>
              <div className="favorites-dropdown-list">
                {products.filter(p => favorites.includes(String(p.id))).slice(0, 5).map(p => (
                  <div key={p.id} className="fav-menu-item" onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: p }))} style={{ cursor: 'pointer' }}>
                    <ProductImage product={p} size="compact" />
                    <div className="fav-menu-info">
                      <span className="name">{p.name}</span>
                      <span className="price">{money(p.minPrice)}</span>
                      <span className="store-tag" style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'block' }}>{p.establishment}</span>
                    </div>
                    <button className="add-mini" onClick={(e) => { e.stopPropagation(); e.preventDefault(); addBasket(p); }} title="Adicionar à cesta"><Plus size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="favorites-dropdown-footer">
                <a href="/favoritos" className="button button--primary button--small w-full" style={{ justifyContent: 'center' }}>Gerenciar Lista Completa</a>
              </div>
            </div>
          )}
        </div>


        <a className="icon-button header-action-button basket-button" href="/cesta" aria-label={`Cesta com ${basketCount} itens`} title="Minha Cesta Inteligente">
          <ShoppingBasket size={20} aria-hidden="true" />
          {basketCount > 0 && <span className="badge" key={basketCount} aria-hidden="true">{basketCount}</span>}
        </a>


        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/perfil" aria-label={`Perfil de ${user.name.split(' ')[0]}`} style={{ fontSize: '0.9rem', color: 'var(--muted)', textDecoration: 'none' }}>Olá, <strong aria-hidden="true">{user.name.split(' ')[0]}</strong></a>
            <button className="text-link" onClick={onLogout} aria-label="Encerrar sessão">Sair</button>
          </div>
        ) : (
          <>
            <a className="text-link header-login-link" href="/login" aria-label="Entrar na sua conta">Entrar</a>
            <a className="button button--primary button--small header-signup-button" href="/cadastro" aria-label="Criar conta gratuita">Começar grátis <ArrowRight size={16} aria-hidden="true" /></a>
          </>
        )}
      </div>
      <button 
        className="mobile-menu-button" 
        onClick={() => setOpen(true)} 
        aria-label="Abrir menu de navegação" 
        aria-expanded={open}
      >
        <Menu aria-hidden="true" />
      </button>
    </div>
    {open && (
      <div 
        className="mobile-drawer" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Menu principal"
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <button className="drawer-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} tabIndex={-1} />
        <div className="drawer-panel">
          <div className="drawer-head">
            <div className="drawer-actions">
              <a className="icon-button" href={accountSpace.href} title={accountSpace.label} onClick={() => setOpen(false)}>
                {accountSpace.kind==="admin"?<ShieldCheck size={20}/>:accountSpace.kind==="merchant"?<Store size={20}/>:<UserRound size={20}/>}
              </a>
            </div>

            <button className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar menu de navegação">
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Links rápidos">
            <a href={accountSpace.href} className="drawer-space-link" onClick={() => setOpen(false)}><Store/> {accountSpace.label}</a>
            <a href="/buscar" onClick={() => setOpen(false)}>Comparar preços</a>
            <a href="/acougues" onClick={() => setOpen(false)}>Açougues e carnes</a>
            <a href="/cesta-basica" onClick={() => setOpen(false)}>Cesta inteligente</a>
            <a href="/estabelecimentos" onClick={() => setOpen(false)}>Estabelecimentos</a>
            <a href="/melhores-precos" onClick={() => setOpen(false)}>Ofertas de hoje</a>
            <a href="/planos" onClick={() => setOpen(false)}>Planos</a>
            <a href="/dorinha" onClick={() => setOpen(false)}>Dorinha Barroso (Livros)</a>
            <a href="/colaborar" onClick={() => setOpen(false)}>Enviar nota fiscal</a>
            <a href="/admin" className="drawer-admin-link" onClick={() => setOpen(false)}>Área Administrativa</a>
          </nav>
          <div className="flex flex-col gap-3 mt-auto pt-6">
            <a className="button button--primary" href="/cadastro" onClick={() => setOpen(false)}>Criar conta gratuita</a>
            <a className="button button--ghost" href="/login" onClick={() => setOpen(false)}>Já tenho uma conta</a>
          </div>
        </div>
      </div>
    )}
  </header>;
}

function Footer({ user }: { user?: any }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand-section">
          <Brand inverse />
          <p className="footer-tagline">Economia inteligente e preços reais em Feijó. Compare e economize todos os dias.</p>
          <div className="footer-location-chip">
            <MapPin size={16} />
            <span>Feijó, Acre</span>
          </div>
        </div>
        <div className="footer-links-group">
          <div className="footer-column">
            <h3>Explorar</h3>
            <nav aria-label="Links de exploração">
              <a href="/buscar">Comparar preços</a>
              <a href="/acougues">Açougues</a>
              <a href="/cesta">Cesta inteligente</a>
              <a href="/estabelecimentos">Lojas locais</a>
            </nav>
          </div>
          <div className="footer-column">
            <h3>Suporte</h3>
            <nav aria-label="Links de suporte">
              <a href="/lojista">Para empresas</a>
              <a href="/fale-conosco">Fale conosco</a>
              <a href="/admin">Painel Administrativo</a>
            </nav>
          </div>
          <div className="footer-column">
            <h3>Sua Conta</h3>
            <nav aria-label="Links da conta">
              {user ? (
                <>
                  <a href="/meus-pedidos">Meus pedidos</a>
                  <a href="/perfil">Meu perfil</a>
                </>
              ) : (
                <>
                  <a href="/login">Entrar</a>
                  <a href="/cadastro">Criar conta</a>
                </>
              )}
              <a href="/planos">Nossos Planos</a>
            </nav>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>SKAES NET TECHNOLOGY • FRANC D’NIS</span>
        <span>© 2026 PreçoCerto. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

function MobileBar({ basketCount, favoritesCount }: { basketCount: number; favoritesCount: number }) {
  const { pathname } = useLocation();
  const accountSpace=useAccountSpace();
  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));
  
  return <nav className="mobile-bar" aria-label="Navegação móvel">
    <a href="/" className={isActive("/") ? "active" : ""} aria-current={isActive("/") ? "page" : undefined}>
      <Home aria-hidden="true" />
      <span>Início</span>
    </a>
    <a href="/buscar" className={isActive("/buscar") ? "active" : ""} aria-current={isActive("/buscar") ? "page" : undefined}>
      <Search aria-hidden="true" />
      <span>Buscar</span>
    </a>
    <a href="/cesta-basica" className={isActive("/cesta-basica") ? "active" : ""} aria-current={isActive("/cesta-basica") ? "page" : undefined}>
      <Sparkles aria-hidden="true" />
      <span>Cesta IA</span>
    </a>
    <a href="/favoritos" className={`mobile-basket ${isActive("/favoritos") ? "active" : ""}`} aria-current={isActive("/favoritos") ? "page" : undefined}>
      <Heart aria-hidden="true" fill={favoritesCount > 0 ? "currentColor" : "none"} />
      {favoritesCount > 0 && <b aria-hidden="true">{favoritesCount}</b>}
      <span>Favoritos</span>
    </a>
    <a href={accountSpace.href} className={isActive(accountSpace.href.split("?")[0]) ? "active" : ""} aria-current={isActive(accountSpace.href.split("?")[0]) ? "page" : undefined}>
      {accountSpace.kind==="admin"?<ShieldCheck aria-hidden="true"/>:accountSpace.kind==="merchant"?<Store aria-hidden="true"/>:<UserRound aria-hidden="true" />}
      <span>Meu espaço</span>
    </a>
  </nav>;
}

function SearchBox({ value, setValue, products, hero = false }: { value: string; setValue: (v: string) => void; products: Product[]; hero?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<any>(null);

  // Debounce para evitar consultas excessivas ao digitar
  useEffect(() => {
    if (localValue === value) return;
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setValue(localValue);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localValue, setValue, value]);

  // Sincroniza valor local se o pai mudar (ex: limpar filtros)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const suggestions = useMemo(() => {
    return suggestProducts(products, localValue, 6);
  }, [localValue, products]);

  function submit(event: FormEvent) { 
    event.preventDefault(); 
    const queryStr = localValue.trim(); 
    setValue(queryStr); // Aplica imediatamente no submit
    const butcherIntent = queryStr && (isButcherQuery(queryStr) || searchProducts(products, queryStr).some(isButcherProduct));
    window.location.href = queryStr
      ? `${butcherIntent ? "/acougues" : "/buscar"}?q=${encodeURIComponent(queryStr)}`
      : "/buscar";
  }

  return <div className={`search-combo ${hero ? "search-combo--hero" : ""}`}>
    <form onSubmit={submit} role="search" className="search-combo__form">
      <div className="search-combo__input-wrapper">
        <Search size={22} className="search-combo__icon" aria-hidden="true" />
        <label className="sr-only" htmlFor={hero ? "hero-search" : "page-search"}>Buscar produto</label>
        <input 
          id={hero ? "hero-search" : "page-search"} 
          className="search-combo__input"
          role="combobox" 
          value={localValue} 
          onChange={e => setLocalValue(e.target.value)} 
          onFocus={() => setFocused(true)} 
          onBlur={() => setTimeout(() => setFocused(false), 200)} 
          placeholder="Busque arroz, café, carne, leite..." 
          autoComplete="off" 
          aria-expanded={focused} 
          aria-controls={hero ? "hero-suggestions" : "page-suggestions"} 
          aria-autocomplete="list" 
        />
        {localValue && (
          <button 
            type="button" 
            className="search-combo__clear" 
            onClick={() => setLocalValue("")}
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button className="button button--primary search-combo__button" type="submit">
        <span className="search-combo__button-text">Comparar preços</span>
        <ArrowRight size={18} />
      </button>
    </form>

    {focused && (
      <div className="search-results-dynamic" id={hero ? "hero-suggestions" : "page-suggestions"} role="listbox">
        <div className="suggestions-header">
          <Sparkles size={14} className="suggestions-header-icon" />
          <span>{localValue ? `${suggestions.length} melhores correspondências` : "Sugestões para você"}</span>
        </div>
        
        {suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map(p => (
              <a 
                role="option" 
                aria-selected="false" 
                href={`${isButcherProduct(p) ? "/acougues" : "/buscar"}?q=${encodeURIComponent(p.name)}`}
                key={p.id}
                className="search-result-item"
              >
                <div className="search-result-item__image">
                  <ProductImage product={p} size="compact" />
                </div>
                <div className="search-result-item__info">
                  <strong className="search-result-item__name">{p.name}</strong>
                  <span className="search-result-item__meta">{p.brand} • {p.category}</span>
                </div>
                <div className="search-result-item__pricing">
                  <b className="search-result-item__price">{money(p.minPrice)}</b>
                  <small className="search-result-item__store">{p.establishment}</small>
                </div>
              </a>
            ))}
          </div>
        ) : localValue.length > 2 ? (
          <div className="suggestions-empty">
            <PackageSearch size={32} />
            <p>Nenhum resultado direto para <strong>"{localValue}"</strong></p>
            <span>Tente usar termos mais genéricos</span>
          </div>
        ) : null}
        
        {localValue.length > 0 && suggestions.length > 0 && (
          <div className="suggestions-footer">
            <a href={`/buscar?q=${encodeURIComponent(localValue)}`}>
              Ver todos os resultados para "{localValue}" <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    )}
  </div>;
}


function PriceBadge({ product }: { product: Product }) {
  if (!product) return null;
  const saving = product.previousPrice ? Math.max(0, ((product.previousPrice - product.minPrice) / product.previousPrice) * 100) : 0;
  if (saving <= 0) return null;
  return <span className="price-badge"><TrendingDown size={13} /> {saving.toFixed(0)}% menor</span>;
}

function ProductStatusBadge({ product }: { product: Product }) {
  const saving = product.previousPrice && product.previousPrice > product.minPrice
    ? (product.previousPrice - product.minPrice) / product.previousPrice
    : 0;
  const capturedAt = Date.parse(product.capturedAt);
  const isNew = Number.isFinite(capturedAt) && Date.now() - capturedAt < 7 * 86400000;
  const isLowest = product.storeCount > 1 && product.minPrice <= product.avgPrice * .95;

  if (saving >= .05) return <span className="product-badge product-badge--sale"><TrendingDown/> {Math.round(saving * 100)}% menor</span>;
  if (isLowest) return <span className="product-badge product-badge--lowest"><CircleDollarSign/> Menor preço</span>;
  if (isNew) return <span className="product-badge product-badge--new"><Sparkles/> Novo</span>;
  return null;
}

function ProductGridSkeleton({ cards = 4 }: { cards?: number }) {
  return <div className="visual-product-grid skeleton-grid" aria-label="Carregando produtos" aria-busy="true">
    {Array.from({ length: cards }, (_, index) => <article className="skeleton-card" key={index} aria-hidden="true"><span className="skeleton skeleton-image"/><div><span className="skeleton skeleton-text"/><span className="skeleton skeleton-text skeleton-text--short"/><span className="skeleton skeleton-price"/><span className="skeleton skeleton-button"/></div></article>)}
  </div>;
}

function useRandomFeatured(products: Product[]) {
  const [randomFeatured, setRandomFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const pickRandom = () => {
      const attractive = products.filter(product => Boolean(resolveProductImage(product))).sort((a, b) => {
        const aSaving = a.previousPrice ? (a.previousPrice - a.minPrice) / a.previousPrice : 0;
        const bSaving = b.previousPrice ? (b.previousPrice - b.minPrice) / b.previousPrice : 0;
        return bSaving - aSaving;
      });

      const selected: Product[] = [];
      const usedStores = new Set();
      
      for (const p of attractive) {
        if (!usedStores.has(p.establishmentId)) {
          selected.push(p);
          usedStores.add(p.establishmentId);
        }
        if (selected.length >= 8) break;
      }
      
      if (selected.length < 8) {
        for (const p of attractive) {
          if (!selected.find(s => s.id === p.id)) {
            selected.push(p);
          }
          if (selected.length >= 8) break;
        }
      }

      setRandomFeatured(selected.sort(() => Math.random() - 0.5));
    };

    pickRandom();
    const interval = setInterval(pickRandom, 3600000); // 60 minutes
    return () => clearInterval(interval);
  }, [products]);

  return randomFeatured;
}

function HomePage({ products, stores, metrics, query, setQuery, addBasket, saveAction, favorites, toggleFavorite, syncStatus }: PageProps & { syncStatus?: string }) {
  const randomFeatured = useRandomFeatured(products);
  const opportunityProducts = [...products]
    .sort((a, b) => ((b.previousPrice ?? b.maxPrice) - b.minPrice) - ((a.previousPrice ?? a.maxPrice) - a.minPrice))
    .slice(0, 3);
  const potentialSaving = opportunityProducts.reduce((total, product) => total + Math.max(0, (product.previousPrice ?? product.maxPrice) - product.minPrice), 0);
  return <>
    <section className="hero" style={{ marginTop: '1.5rem' }}>
      <div className="hero-photo" />
      <div className="hero-wash" />
      <div className="shell hero-content">
        <div className="hero-copy">
          <span className="hero-live"><i /> Preços locais atualizados</span>
          <span className="eyebrow eyebrow--light"><MapPin size={14} /> Feijó • Acre</span>
          <h1>Compare preços.<br/><span>Compre melhor.</span></h1>
          <p>Encontre o menor preço nos comércios de Feijó e monte uma cesta mais econômica em poucos minutos.</p>
          <div className="hero-actions">
            <SearchBox value={query} setValue={setQuery} products={products} hero />
            <a href="/buscar" className="button button--white">Explorar ofertas <ArrowRight size={18} /></a>
          </div>
          <div className="hero-trust"><span><CheckCircle2 /> Preços verificados</span><span><Clock3 /> Atualização contínua</span><span><ShieldCheck /> Dados protegidos</span></div>
        </div>
        <aside className="hero-insight" aria-label="Resumo das melhores oportunidades em Feijó">
          <header className="hero-insight__head"><span><Activity /> Radar de economia</span><em><i /> atualizado</em></header>
          <div className="hero-insight__summary">
            <span><small>Economia potencial</small><strong>{money(potentialSaving)}</strong><em>nas melhores oportunidades</em></span>
            <div><TrendingDown /><b>Compare antes de comprar</b><small>Dados de {count(metrics.stores)} estabelecimentos locais</small></div>
          </div>
          <div className="hero-insight__list">
            <p><span>Oportunidades agora</span><a href="/melhores-precos">Ver todas <ArrowRight /></a></p>
            {opportunityProducts.map((product, index) => <a className="hero-insight__item" href={`/produto/${product.slug}`} key={product.id}>
              <span className="hero-insight__rank">0{index + 1}</span><ProductImage product={product} size="compact" />
              <span className="hero-insight__product"><b>{product.name}</b><small>{product.establishment}</small></span>
              <span className="hero-insight__price"><b>{money(product.minPrice)}</b><small>melhor preço</small></span>
            </a>)}
          </div>
          <footer className="hero-insight__footer"><ShieldCheck /><span><b>Preços verificados</b><small>Informação clara para decidir com segurança.</small></span><a href="/buscar" aria-label="Abrir comparação de preços"><ArrowRight /></a></footer>
        </aside>
      </div>
    </section>

    <section className="benefits-section">
      <div className="shell">
        <div className="benefits-grid">
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="benefit-icon"><CircleDollarSign size={24} /></div>
            <h3>Economia Real</h3>
            <p>Compare preços entre mercados e economize até 30% na sua lista mensal.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="benefit-icon"><Clock3 size={24} /></div>
            <h3>Dados Atualizados</h3>
            <p>Nossa equipe verifica os preços diariamente nos principais comércios de Feijó.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="benefit-icon"><LayoutDashboard size={24} /></div>
            <h3>Cestas Inteligentes</h3>
            <p>Monte sua lista e descubra em qual loja ela sai mais barata automaticamente.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="benefit-icon"><ShieldCheck size={24} /></div>
            <h3>Transparência Total</h3>
            <p>Veja o histórico de preços e saiba se a oferta é realmente vantajosa.</p>
          </div>
        </div>
      </div>
    </section>
    <div className="shell metrics-float" style={{ marginTop: '0', transform: 'translateY(-20px)' }} aria-label="Métricas da plataforma"><div><span className="metric-icon"><Store /></span><strong>{count(metrics.stores)}</strong><span>estabelecimentos cadastrados</span></div><div><span className="metric-icon"><PackageSearch /></span><strong>{count(metrics.products)}</strong><span>itens cadastrados</span></div><div><span className="metric-icon"><Activity /></span><strong>{count(metrics.prices)}</strong><span>preços registrados</span></div><small><span /> Base consolidada até 7 de agosto de 2026</small></div>
    <nav className="shell category-rail" aria-label="Atalhos de compra"><span>Explore por intenção</span><a href="/categoria/mercearia"><PackageSearch /> Mercearia <ArrowRight /></a><a href="/acougues"><Store /> Açougues e carnes <ArrowRight /></a><a href="/cesta-basica"><ShoppingBasket /> Cesta essencial <ArrowRight /></a><a href="/estabelecimentos"><Store /> Mercados locais <ArrowRight /></a></nav>
    <section className="section shell featured-products">
      <div className="section-heading">
        <div>
          
          <h2>Ofertas em destaque</h2>
          <p>Preços verificados e oportunidades reais nos estabelecimentos locais.</p>
        </div>
        <a className="inline-link" href="/melhores-precos">Ver todas as ofertas <ArrowRight /></a>
      </div>
      {syncStatus === "syncing" && products.length === 0 ? <ProductGridSkeleton cards={8}/> : <div className="visual-product-grid stagger-in">
        {(randomFeatured.length > 0 ? randomFeatured : products).slice(0, 8).map((p, index) => (
          <article className="visual-product-card" key={p.id}>
            <button className={`floating-favorite ${favorites.includes(String(p.id)) ? "active" : ""}`} onClick={() => toggleFavorite(String(p.id))} aria-pressed={favorites.includes(String(p.id))} aria-label={favorites.includes(String(p.id)) ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`}>
              <Heart fill={favorites.includes(String(p.id)) ? "currentColor" : "none"} />{favorites.includes(String(p.id)) && <span className="favorite-saved-label">Salvo</span>}
            </button>
            <div 
              className="visual-product-image" 
              onClick={(e) => {
                e.preventDefault();
                // O estado setSelectedProduct está disponível no componente pai SearchPage e na SearchResultCard
                // Para a Home, precisamos garantir que o estado exista ou usar a rota.
                // Como o usuário relatou que o modal NÃO abre, vamos unificar o comportamento.
                window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: p }));
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="position-number">0{index + 1}</span>
              <ProductStatusBadge product={p}/>
              <ProductImage product={p} />
              {p.previousPrice && p.previousPrice > p.minPrice && (
                <span className="price-drop-tag"><TrendingDown size={14}/> -{Math.round((1 - p.minPrice / p.previousPrice) * 100)}%</span>
              )}
              <span className="verified-chip"><ShieldCheck /> Verificado</span>
            </div>

            <div className="visual-product-content">
              <span className="category-tag">{p.category} • {p.size}</span>
              <div 
                className="visual-product-name" 
                onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: p }))}
                style={{ cursor: 'pointer' }}
              >
                {p.name}
              </div>
              <div className="visual-store">
                <span className="market-dot" style={{ background: p.storeColor }} />
                <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span><strong>{p.establishment}</strong><small><MapPin /> {p.neighborhood}</small></span>
                </a>
              </div>

              <div className="visual-price">
                <span><small>a partir de</small><strong>{money(p.minPrice)}</strong></span>
                {p.previousPrice && p.previousPrice > p.minPrice && (
                  <span className="old-price"><small>era</small><s>{money(p.previousPrice)}</s></span>
                )}
              </div>
              <div className="mini-trend">
                <svg viewBox="0 0 180 34" aria-hidden="true">
                  <path d={`M2 ${9 + index % 3 * 3} C24 ${7 + index}, 31 ${22 - index}, 54 18 S86 ${8 + index}, 108 20 S145 ${27 - index}, 178 ${13 + index}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="178" cy={13 + index} r="3" fill="currentColor" />
                </svg>
                <span><TrendingDown /> {Math.max(3, Math.round((1 - p.minPrice / p.maxPrice) * 100))}% abaixo do maior</span>
              </div>
              <div className="visual-product-actions">
                <button className="button button--primary" onClick={() => addBasket(p)}><Plus /> Cesta</button>
                <button 
                  className="icon-button" 
                  title="Compartilhar produto"
                  onClick={() => {
                    const text = `Veja este produto no PreçoCerto Feijó: ${p.name} por ${money(p.minPrice)} em ${p.establishment}. Link: ${window.location.origin}/produto/${p.slug}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  style={{ color: 'var(--muted)', padding: '6px' }}
                >
                  <Share2 size={16} />
                </button>
                <a href={`/produto/${p.slug}`} className="button button--ghost button--small">Comparar</a>
              </div>
            </div>
          </article>
        ))}
      </div>}
    </section>
    <section className="section shell"><div className="section-heading"><div><h2>Cestas otimizadas</h2><p>Combinações que aproveitam o melhor preço de cada mercado de Feijó.</p></div><a className="inline-link" href="/cesta-basica">Ver todas as cestas <ArrowRight /></a></div><div className="basket-grid"><article className="basket-feature"><div className="basket-top"><span className="basket-icon"><ShoppingBasket /></span><PriceBadge product={products[0]} /></div><p>Cesta essencial da semana</p><h3>12 itens em 2 mercados</h3><div className="basket-total"><span>Valor otimizado</span><strong>{money(87.34)}</strong><small>economia estimada de {money(18.62)}</small></div><div className="store-route"><span><b style={{background: stores[0]?.color}}>CS</b> Central Super · 8 itens</span><span><b style={{background: stores[1]?.color}}>MR</b> Rebouças · 4 itens</span></div><a href="/cesta-basica" className="button button--dark">Abrir cesta otimizada <ArrowRight /></a></article><article className="basket-plan"><h3>Quanto você quer gastar?</h3><p>Informe seu orçamento e montamos a melhor cesta possível, explicando cada escolha.</p><div className="budget-chips"><a href="/cesta-basica?orcamento=80">R$ 80</a><a href="/cesta-basica?orcamento=100">R$ 100</a><a href="/cesta-basica?orcamento=150">R$ 150</a><a href="/cesta-basica?orcamento=200">R$ 200</a></div><a href="/cesta-basica" className="inline-link">Montar minha cesta <ArrowRight /></a></article></div></section>
    <section className="shell decision-dock" aria-label="Atalhos para economizar"><div className="decision-dock__visual"><svg viewBox="0 0 160 96" role="img" aria-label="Comparação inteligente de preços"><path d="M18 73h124"/><rect x="25" y="42" width="25" height="25" rx="6"/><rect x="67" y="24" width="25" height="43" rx="6"/><rect x="109" y="34" width="25" height="33" rx="6"/><path d="m31 32 18-12 22 5 24-16 31 8"/><circle cx="126" cy="17" r="4"/></svg></div><div className="decision-dock__copy"><h2>Três caminhos, uma compra mais inteligente.</h2></div><div className="decision-dock__links"><a href="/buscar"><Search/><span><b>Buscar</b><small>um produto</small></span><ArrowRight/></a><a href="/melhores-precos"><TrendingDown/><span><b>Comparar</b><small>melhores preços</small></span><ArrowRight/></a><a href="/cesta-basica"><ShoppingBasket/><span><b>Planejar</b><small>uma cesta</small></span><ArrowRight/></a></div></section>
    <section className="section shell"><div className="section-heading"><div><h2>Estabelecimentos monitorados</h2><p>Preço e disponibilidade perto de você, bairro por bairro.</p></div><a className="inline-link" href="/estabelecimentos">Ver diretório <ArrowRight /></a></div><div className="store-grid">{stores.map(store => <a className="store-card" href={`/estabelecimento/${store.slug}`} key={store.id}><StoreMark store={store} /><span><strong>{store.name}</strong><small><MapPin /> {store.neighborhood}</small></span><ChevronRight /></a>)}</div></section>
    <section className="shell how-compact" id="como-funciona"><div className="how-compact__intro"><h2>Da busca à melhor escolha.</h2><p>Informação local organizada para você decidir com clareza.</p><a href="/buscar">Começar uma comparação <ArrowRight/></a></div><div className="how-compact__steps"><article><svg viewBox="0 0 64 64"><circle cx="28" cy="28" r="17"/><path d="m41 41 13 13M22 28h12M28 22v12"/></svg><span>01</span><div><b>Pesquise</b><small>Encontre o item.</small></div></article><article><svg viewBox="0 0 64 64"><path d="M10 50h44M16 43V28h10v15M28 43V14h10v29M40 43V22h10v21"/></svg><span>02</span><div><b>Compare</b><small>Veja lojas e preços.</small></div></article><article><svg viewBox="0 0 64 64"><path d="M12 20h7l5 25h25l5-17H22M29 52h1M45 52h1"/><path d="m31 32 5 5 10-11"/></svg><span>03</span><div><b>Economize</b><small>Escolha ou monte a cesta.</small></div></article></div></section>
    <section className="shell final-cta final-cta--compact"><div className="final-cta__mark"><svg viewBox="0 0 64 64"><path d="M9 42 24 27l10 9 21-22"/><path d="M42 14h13v13"/><path d="M12 53h40"/></svg></div><div><span className="eyebrow eyebrow--gold">PRONTO PARA COMPARAR?</span><h2>Compre com informação, não no impulso.</h2><p>Pesquise preços locais e escolha com segurança.</p></div><a className="button button--gold" href="/buscar">Pesquisar agora <ArrowRight /></a></section>
    <section className="section shell professional"><div className="section-heading"><div><h2>Painel de inteligência de mercado</h2><p>Acompanhe cobertura, competitividade e oportunidades sem perder o contexto local.</p></div><a href="/lojista" className="button button--outline">Conhecer painel lojista</a></div><div className="dashboard-preview"><div className="preview-sidebar"><Brand compact /><span className="active"><LayoutDashboard />Visão geral</span><span><Store />Lojas</span><span><PackageSearch />Produtos</span><span><LineChart />Tendências</span><span><Settings />Configurações</span></div><div className="preview-main"><div className="preview-title"><div><small>Monitoramento</small><h3>Estabelecimentos</h3></div><button><Plus /> Adicionar loja</button></div><div className="mini-kpis"><span><small>Lojas ativas</small><b>{stores.length}</b></span><span><small>Produtos cobertos</small><b>82%</b></span><span><small>Atualizações hoje</small><b>214</b></span></div>{stores.slice(0,3).map((s,i)=><div className="sync-row" key={s.id}><StoreMark store={s} small /><span><b>{s.name}</b><small>Última sincronização há {i*9+4} min</small></span><em>Ativo</em><span className="insight">{i===0 ? "12 preços líderes" : i===1 ? "Cobertura em alta" : "3 itens para revisar"}</span><button aria-label={`Abrir ${s.name}`}><ChevronRight /></button></div>)}</div></div></section>
  </>;
}

// Interface compartilhada para as páginas que recebem o catálogo e estados globais
interface PageProps {
  products: Product[];
  stores: StoreRow[];
  metrics: PlatformMetrics;
  query: string;
  setQuery: (v: string) => void;
  addBasket: (p: Product) => void;
  saveAction: (action: string, type: string, id: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  user?: any;
}

const modeLabels: Record<OptimizationMode, string> = {
  cheapest_multi: "Mais barata (multiplas lojas)",
  cheapest_single: "Loja unica (conveniencia)",
  best_value: "Melhor custo-beneficio",
  within_budget: "Dentro do orcamento",
};

function BasketPage({ products, addBasket, cart: initialCart, removeBasket, clearBasket, user, syncStatus, stores, setToast }: PageProps & { cart: Product[]; removeBasket:(id:number|string)=>void; clearBasket:()=>void; user: any; syncStatus: string; stores: StoreRow[]; setToast: (msg: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mode, setMode] = useState<OptimizationMode>("cheapest_multi");
  const [budget, setBudget] = useState(250);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const [shareReadOnly, setShareReadOnly] = useState(true);
  const pdfUserKey = user?.email || user?.id || null;
  // Preferência de orientação salva por usuário e reaplicada nas próximas exportações.
  const [pdfOrientation, setPdfOrientationState] = useState<"portrait" | "landscape">(() =>
    getPdfOrientation(pdfUserKey),
  );
  useEffect(() => setPdfOrientationState(getPdfOrientation(pdfUserKey)), [pdfUserKey]);
  const setPdfOrientation = (o: "portrait" | "landscape") => {
    setPdfOrientationState(o);
    savePdfOrientation(o, pdfUserKey);
  };
  
  const [basketItems, setBasketItems] = useState<BasketItemConfig[]>(() => {
    // 1. Tentar reabrir um snapshot específico (link compartilhado ou salvo)
    const reopened = localStorage.getItem("precocerto:basket_reopen");
    if (reopened) {
      const data = JSON.parse(reopened);
      localStorage.removeItem("precocerto:basket_reopen");
      return data.items;
    }

    // 2. Tentar recuperar a sessão de trabalho anterior salva localmente
    const savedSession = localStorage.getItem("precocerto:active_basket_items");
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error("Falha ao carregar cesta salva", e);
      }
    }

    // 3. Fallback para itens do carrinho global (initialCart)
    return initialCart.map(p => ({
      productName: p.name,
      category: p.category,
      quantity: 1,
      unit: (p.unit as any) || "un",
      isEssential: true
    }));
  });

  // Efeito para carregar cesta do banco de dados quando o usuário loga
  useEffect(() => {
    async function loadUserBasket() {
      if (!user || !supabase) return;
      try {
        const { data: baskets, error } = await supabase
          .from('smart_baskets')
          .select('*, items:smart_basket_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (baskets && baskets.length > 0) {
          const latest = baskets[0];
          const mappedItems = latest.items.map((i: any) => ({
            productName: i.product_name,
            category: i.category,
            quantity: i.quantity,
            unit: i.unit,
            isEssential: i.is_essential
          }));
          setBasketItems(mappedItems);
          setMode(latest.optimization_mode);
          setBudget(latest.budget);
        }
      } catch (err) {
        console.error("Erro ao carregar cesta do banco:", err);
      }
    }
    loadUserBasket();
  }, [user]);

  // Persiste itens da cesta no localStorage conforme mudam
  useEffect(() => {
    localStorage.setItem("precocerto:active_basket_items", JSON.stringify(basketItems));
  }, [basketItems]);

  useEffect(() => {
    const reopened = localStorage.getItem("precocerto:basket_reopen_meta");
    if (reopened) {
      const data = JSON.parse(reopened);
      localStorage.removeItem("precocerto:basket_reopen_meta");
      setMode(data.mode);
      setBudget(data.budget);
      setStep(3);
    }
  }, []);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const optimizationResult = useMemo(() => {
    if (basketItems.length === 0) return null;
    const result = optimizeBasket(products, basketItems, mode, budget);
    if (couponDiscount > 0) {
      result.total = Math.max(0, result.total - couponDiscount);
    }
    return result;
  }, [products, basketItems, mode, budget, couponDiscount]);

  // Handler para carregar snapshot da URL se presente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snapshotId = params.get("snapshot");
    const activeSupabase = supabase; // Local stable reference
    
    if (snapshotId && activeSupabase) {
      const loadSnapshot = async () => {
        try {
          const { data, error } = await activeSupabase
            .from('smart_baskets')
            .select('*, items:smart_basket_items(*)')
            .eq('id', snapshotId)
            .single();
          
          if (error) {
            console.error("Erro Supabase ao carregar snapshot:", error);
            // PGRST116: JSON object requested, but no rows returned (RLS filtered or not found)
            if (error.code === 'PGRST116' || error.message.includes("RLS")) {
               window.dispatchEvent(new CustomEvent('pc:set-toast', { detail: { message: "Esta cesta é privada, expirou ou o link foi revogado.", type: "error" } }));
            }
            return;
          }
          if (!data) return;

          // Validação de expiração (5 min) para o parâmetro snapshot
          const createdAt = new Date(data.created_at).getTime();
          const now = new Date().getTime();
          const isExpired = (now - createdAt) > (5 * 60 * 1000);
          
          if (isExpired) {
            window.dispatchEvent(new CustomEvent('pc:set-toast', { detail: { message: "Este link de compartilhamento expirou (5 min).", type: "warning" } }));
            return;
          }

          if (data.coupon_code) {
             setCouponCode(data.coupon_code);
             setCouponDiscount(data.discount || 0);
          }

          if (data.items) {
            const mappedItems = data.items.map((i: any) => ({
              productName: i.product_name,
              category: i.category,
              quantity: i.quantity,
              unit: i.unit,
              isEssential: i.is_essential
            }));
            setBasketItems(mappedItems);
          }
          
          setMode(data.optimization_mode);
          setBudget(data.budget);
          setStep(3);
          window.dispatchEvent(new CustomEvent('pc:set-toast', { detail: { message: "Cesta compartilhada carregada!", type: "success" } }));
        } catch (err) {
          console.error("Erro ao carregar snapshot:", err);
          window.dispatchEvent(new CustomEvent('pc:set-toast', { detail: { message: "Não foi possível carregar a cesta compartilhada.", type: "error" } }));
        }
      };
      loadSnapshot();
    }
  }, [supabase]);

  // Mantém a lista sincronizada com os produtos enviados à cesta em outras páginas.
  useEffect(() => {
    setBasketItems(prev => {
      const missing = initialCart
        .filter(p => !prev.some(i => i.productName === p.name))
        .map(p => ({
          productName: p.name,
          category: p.category,
          quantity: 1,
          unit: (p.unit as any) || "un",
          isEssential: true,
        }));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [initialCart]);

  /** Produto do catálogo correspondente ao item da lista (para foto, preço e loja). */
  const findProduct = (name: string) =>
    initialCart.find(p => p.name === name) || products.find(p => p.name === name);

  const toggleItem = (p: Product) => {
    setBasketItems(prev => {
      const exists = prev.find(i => i.productName === p.name);
      if (exists) return prev.filter(i => i.productName !== p.name);

      // Validação de orçamento para novos itens
      if (mode === 'within_budget') {
        const currentTotal = prev.reduce((sum, i) => {
          const prod = findProduct(i.productName);
          return sum + ((prod?.minPrice || 0) * i.quantity);
        }, 0) + p.minPrice;

        if (currentTotal > budget) {
          window.dispatchEvent(new CustomEvent('pc:budget-exceeded', { 
            detail: { total: currentTotal, budget, itemName: p.name } 
          }));
          return prev;
        }
      }

      return [...prev, {
        productName: p.name,
        category: p.category,
        quantity: 1,
        unit: (p.unit as any) || "un",
        isEssential: true
      }];
    });
  };

  const removeItem = (name: string) => {
    setBasketItems(prev => {
      const removedItem = prev.find(i => i.productName === name);
      if (removedItem) {
        // Registro no histórico
        const historyKey = "precocerto:basket_history";
        const history = JSON.parse(localStorage.getItem(historyKey) ?? "[]");
        history.unshift({
          at: new Date().toISOString(),
          action: `Removeu ${name} da cesta`
        });
        localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));
      }
      return prev.filter(i => i.productName !== name);
    });
    const inCart = initialCart.find(p => p.name === name);
    if (inCart) removeBasket(inCart.id);
  };

  const clearAll = () => {
    if (!basketItems.length) return;
    if (!window.confirm("Limpar todos os itens da cesta?")) return;
    setBasketItems([]);
    clearBasket();
    localStorage.removeItem("precocerto:active_basket_items");
    setStep(2);
  };

  const updateQuantity = (name: string, delta: number) => {
    setBasketItems(prev => {
      const item = prev.find(i => i.productName === name);
      if (!item) return prev;
      
      const newQty = Math.max(1, item.quantity + delta);
      
      // Validação de orçamento (se o modo for within_budget)
      if (mode === 'within_budget') {
        const currentTotal = basketItems.reduce((sum, i) => {
          const p = findProduct(i.productName);
          return sum + ((p?.minPrice || 0) * (i.productName === name ? newQty : i.quantity));
        }, 0);

        if (currentTotal > budget) {
          window.dispatchEvent(new CustomEvent('pc:budget-exceeded', { 
            detail: { 
              total: currentTotal, 
              budget,
              itemName: name
            } 
          }));
          return prev;
        }
      }
      
      const STOCK_LIMIT = 20;
      if (newQty > STOCK_LIMIT) {
        if (typeof (window as any).setGlobalToast === 'function') {
          (window as any).setGlobalToast(`Limite de estoque atingido para ${name} (${STOCK_LIMIT} un).`, "warning");
        }
        return prev;
      }

      // Registro no histórico
      const historyKey = "precocerto:basket_history";
      const history = JSON.parse(localStorage.getItem(historyKey) ?? "[]");
      history.unshift({
        at: new Date().toISOString(),
        action: `Alterou quantidade de ${name}: ${item.quantity} -> ${newQty}`
      });
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));

      return prev.map(i => i.productName === name ? { ...i, quantity: newQty } : i);
    });
  };

  useEffect(() => {
    async function persistToCloud() {
      if (!user || !supabase || basketItems.length === 0) return;
      try {
        await saveBasket(
          user.id,
          "Cesta Ativa (Auto)",
          mode,
          budget,
          basketItems,
          optimizationResult || { total: 0, savings: 0, items: [], storeBreakdown: {} }
        );
      } catch (err) {
        console.error("Erro no autosave:", err);
        // Exibe toast de erro mas mantém os itens na interface (já estão no state/localStorage)
        if (typeof (window as any).setGlobalToast === 'function') {
           (window as any).setGlobalToast("Ops! Erro ao sincronizar cesta com a nuvem. Seus itens continuam salvos localmente.", "error");
        }
      }
    }
    const timer = setTimeout(persistToCloud, 3000); // Debounce de 3s
    return () => clearTimeout(timer);
  }, [basketItems, mode, budget, user, optimizationResult]);

  const handleSaveBasket = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar e compartilhar cestas.");
      return;
    }
    
    if (!optimizationResult) return;

    try {
      setIsSaving(true);
      const basketId = await saveBasket(
        user.id,
        `Cesta ${new Date().toLocaleDateString('pt-BR')}`,
        mode,
        budget,
        basketItems,
        optimizationResult
      );
      
      const link = `${window.location.origin}/cesta/snapshot/${basketId}`;
      setShareLink(link);
      alert("Cesta salva com sucesso em snapshots!");
    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar cesta: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  /** Monta o PDF A4 pronto para impressão (cabeçalho + agrupamento + margens automáticas). */
  const buildPDF = (orientation: "portrait" | "landscape") => {
    if (!optimizationResult) return null;

    const plan = planBasketPdf(optimizationResult, mode, orientation);
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const now = new Date();
    const dateLabel = now.toLocaleDateString("pt-BR");
    const timeLabel = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    renderPlanToPdf(doc, plan, { dateLabel, timeLabel, money });

    return { doc, fileName: `lista-compras-precocerto-${dateLabel.replace(/\//g, "-")}.pdf` };
  };

  const downloadPDF = () => {
    const built = buildPDF(pdfOrientation);
    if (built) built.doc.save(built.fileName);
  };

  const sharePDF = async () => {
    const built = buildPDF(pdfOrientation);
    if (!built) return;
    const blob = built.doc.output("blob");
    const file = new File([blob], built.fileName, { type: "application/pdf" });

    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: "Lista de Compras PreçoCerto" });
        return;
      } catch {
        /* usuário cancelou: cai no fallback */
      }
    }
    // Fallback: abre o PDF em nova aba para salvar/imprimir no celular
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleReopen = async (snapshot: any) => {
    // Transforma itens do snapshot em itens de configuração para nova otimização
    const newItems: BasketItemConfig[] = snapshot.items.map((i: any) => ({
      productName: i.product_name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      isEssential: i.is_essential
    }));
    
    setBasketItems(newItems);
    setMode(snapshot.optimization_mode);
    setBudget(snapshot.budget || 250);
    setStep(3); // Vai direto para o resultado
  };

  const [showBudgetAlert, setShowBudgetAlert] = useState<{ total: number, budget: number, item: string } | null>(null);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [selectedZones, setSelectedZones] = useState<Record<string, string>>({});
  const [zonesMap, setZonesMap] = useState<Record<string, DeliveryZone[]>>({});
  const [orderNotice, setOrderNotice] = useState("");

  useEffect(() => {
    const handler = (e: any) => setShowBudgetAlert(e.detail);
    window.addEventListener('pc:budget-exceeded', handler);
    return () => window.removeEventListener('pc:budget-exceeded', handler);
  }, []);

  useEffect(() => {
    async function loadZones() {
      if (!optimizationResult) return;
      const stores = Object.keys(optimizationResult.storeBreakdown);
      const newZonesMap: Record<string, DeliveryZone[]> = {};
      
      for (const storeName of stores) {
        const store = products.find(p => p.establishment === storeName);
        if (store?.establishmentId) {
          const z = await loadDeliveryZones(String(store.establishmentId));
          newZonesMap[storeName] = z.filter(x => x.active);
        }
      }
      setZonesMap(newZonesMap);
    }
    if (step === 4) loadZones();
  }, [step, optimizationResult]);

  const handleCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setOrderNotice("Entre na sua conta para finalizar a compra.");
      return;
    }
    if (!optimizationResult || optimizationResult.items.length === 0) return;

    setIsSubmittingOrder(true);
    setOrderNotice("");

    const fd = new FormData(e.currentTarget);
    const customerName = String(fd.get("name") || "").trim();
    const customerPhone = String(fd.get("phone") || "").trim();
    const street = String(fd.get("street") || "");
    const number = String(fd.get("number") || "");
    const complement = String(fd.get("complement") || "").trim();

    try {
      // Cria pedidos individuais por loja
      const storeNames = Object.keys(optimizationResult.storeBreakdown);
      const orderResults = [];

      for (const storeName of storeNames) {
        const storeProducts = optimizationResult.items.filter(i => i.establishment === storeName);
        const storeInfo = products.find(p => p.establishment === storeName);
        const zoneId = selectedZones[storeName];
        const zone = zonesMap[storeName]?.find(z => z.id === zoneId);

        const result = await createMarketplaceOrder({
          merchantId: String(storeInfo?.establishmentId || ""),
          deliveryType,
          deliveryZoneId: deliveryType === "delivery" ? zoneId : null,
          deliveryAddress: deliveryType === "delivery" ? {
            street,
            number,
            neighborhood: zone?.neighborhood || zone?.name || "",
            complement,
            reference: complement
          } : null,
          customerName,
          customerPhone,
          customerEmail: user.email || "",
          items: storeProducts.map(i => ({
            merchant_product_id: String(i.product.id), // No PrecoCertoApp, product.id é o ID da oferta do lojista
            quantity: i.quantity
          }))
        });

        if (result.error) throw new Error(`${storeName}: ${result.error}`);
        orderResults.push(result.data);
      }

      // Se apenas um pedido foi gerado, tentamos o checkout MP
      if (orderResults.length === 1 && orderResults[0]?.order_id) {
        const pay = await startMercadoPagoCheckout(String(orderResults[0].order_id));
        if (pay.url) {
          window.location.assign(pay.url);
          return;
        }
      }

      setToast("Pedidos criados com sucesso! Redirecionando para acompanhamento...");
      setTimeout(() => window.location.assign("/meus-pedidos"), 2000);
    } catch (err: any) {
      setOrderNotice("Erro ao processar checkout: " + err.message);
      setIsSubmittingOrder(false);
    }
  };


  return (
    <div className="shell page-shell basket-page">
      {showBudgetAlert && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', color: 'var(--red)', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--red-soft)', padding: '1rem', borderRadius: '50%' }}>
                <AlertTriangle size={48} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Limite de Orçamento!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Ao adicionar <strong>{showBudgetAlert.item}</strong>, o total da cesta chegaria a <strong>{money(showBudgetAlert.total)}</strong>, 
              ultrapassando seu limite de <strong>{money(showBudgetAlert.budget)}</strong>.
            </p>
            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span>Seu Limite:</span>
                <span style={{ fontWeight: 700 }}>{money(showBudgetAlert.budget)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--red)' }}>
                <span>Tentativa:</span>
                <span style={{ fontWeight: 700 }}>{money(showBudgetAlert.total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="button button--primary" onClick={() => { setStep(1); setShowBudgetAlert(null); }}>
                Aumentar Orçamento
              </button>
              <button className="button button--ghost" onClick={() => setShowBudgetAlert(null)}>
                Manter Lista Atual
              </button>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      <header className="page-title">
        <div>
          
          <h1>Planejador de Compras</h1>
          <p>Cálculo matemático para encontrar o menor preço real em Feijó.</p>
        </div>
        <div className="basket-steps">
          <div className={`step-pill ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>1. Modo</div>
          <div className={`step-pill ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>2. Itens</div>
          <div className={`step-pill ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>3. Otimização</div>
          <div className={`step-pill ${step === 4 ? 'active' : ''}`}>4. Checkout</div>
        </div>

      </header>

      <div className="basket-content-layout">
        {step === 1 && (
          <section className="basket-step-view animate-fade-in">
            <div className="step-card-header">
              <h2>Como você quer economizar?</h2>
              <p>Escolha a estratégia que melhor se adapta à sua necessidade hoje.</p>
            </div>
            <div className="mode-selection-grid">
              <button className={`mode-card ${mode === 'cheapest_multi' ? 'active' : ''}`} onClick={() => setMode('cheapest_multi')}>
                <div className="mode-icon"><TrendingDown /></div>
                <div>
                  <strong>Mais barata (Múltiplas lojas)</strong>
                  <p>O menor preço absoluto de cada item, mesmo que precise visitar mais lojas.</p>
                </div>
                {mode === 'cheapest_multi' && <CheckCircle2 className="check" />}
              </button>
              <button className={`mode-card ${mode === 'cheapest_single' ? 'active' : ''}`} onClick={() => setMode('cheapest_single')}>
                <div className="mode-icon"><Store /></div>
                <div>
                  <strong>Loja Única (Conveniência)</strong>
                  <p>Encontra o estabelecimento que oferece o menor total para sua lista completa.</p>
                </div>
                {mode === 'cheapest_single' && <CheckCircle2 className="check" />}
              </button>
              <button className={`mode-card ${mode === 'within_budget' ? 'active' : ''}`} onClick={() => setMode('within_budget')}>
                <div className="mode-icon"><CircleDollarSign /></div>
                <div>
                  <strong>Dentro do Orçamento</strong>
                  <p>Prioriza essenciais e marcas econômicas para não ultrapassar seu limite.</p>
                </div>
                {mode === 'within_budget' && <CheckCircle2 className="check" />}
              </button>
              <button className={`mode-card ${mode === 'best_value' ? 'active' : ''}`} onClick={() => setMode('best_value')}>
                <div className="mode-icon"><MapPin /></div>
                <div>
                  <strong>Custo-Benefício</strong>
                  <p>Considera o preço e o custo estimado de deslocamento entre os bairros.</p>
                </div>
                {mode === 'best_value' && <CheckCircle2 className="check" />}
              </button>
            </div>

            {mode === 'within_budget' && (
              <div className="budget-config animate-slide-up">
                <h3>Defina seu orçamento total</h3>
                <div className="budget-input-group">
                  <strong>{money(budget)}</strong>
                  <input type="range" min="50" max="1000" step="10" value={budget} onChange={e => setBudget(Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="step-actions">
              <button className="button button--primary" onClick={() => setStep(2)}>
                Continuar para escolha de itens <ArrowRight />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="basket-step-view animate-fade-in">
            <div className="builder-split">
              <div className="builder-main">
                <div className="step-card-header">
                  <h2>O que você precisa comprar?</h2>
                  <p>Adicione itens do catálogo para compor sua cesta.</p>
                </div>
                <div className="basket-search-inline">
                  <SearchBox value="" setValue={(v) => {}} products={products} />
                </div>
                <div className="basket-quick-add">
                  <h3>Sugestões e Essenciais</h3>
                  <div className="quick-grid">
                    {products.slice(0, 12).map(p => (
                      <button 
                        key={p.id} 
                        className={`quick-pill ${basketItems.some(i => i.productName === p.name) ? 'active' : ''}`}
                        onClick={() => toggleItem(p)}
                      >
                        {basketItems.some(i => i.productName === p.name) ? <Check size={14}/> : <Plus size={14}/>}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <aside className="builder-sidebar">
                <div className="builder-sidebar-head">
                  <h3>Sua Lista ({basketItems.length})</h3>
                  {basketItems.length > 0 && (
                    <button type="button" className="link-danger" onClick={clearAll}>
                      <Trash2 size={14} /> Limpar cesta
                    </button>
                  )}
                </div>
                <div className="selected-items-list">
                  {basketItems.length === 0 ? (
                    <div className="empty-list">
                      <ShoppingBasket size={32} />
                      <p>Sua lista está vazia</p>
                      <small>Adicione produtos aqui ou pelo botão “Cesta” nas buscas.</small>
                    </div>
                  ) : (
                    basketItems.map(item => {
                      const prod = findProduct(item.productName);
                      return (
                        <div className="basket-list-item" key={item.productName}>
                          {prod && <ProductImage product={prod} size="compact" />}
                          <div className="item-info">
                            <strong>{item.productName}</strong>
                            <small>{item.category}</small>
                            {prod && (
                              <small className="item-price">
                                {money(prod.minPrice)} · {prod.establishment}
                              </small>
                            )}
                          </div>
                          <div className="item-controls">
                            <div className="item-qty">
                              <button onClick={() => updateQuantity(item.productName, -1)} aria-label={`Diminuir ${item.productName}`} disabled={item.quantity <= 1}>-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productName, 1)} aria-label={`Aumentar ${item.productName}`}>+</button>
                            </div>
                            <button className="item-remove" onClick={() => removeItem(item.productName)} aria-label={`Remover ${item.productName}`}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {basketItems.length > 0 && (
                  <div className="builder-sidebar-footer" style={{ 
                    padding: '1.25rem', 
                    background: 'var(--surface-2)', 
                    borderRadius: '16px',
                    marginBottom: '1rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Itens na Cesta ({basketItems.length})
                        </span>
                        {basketItems.length > 0 && (
                          <button 
                            onClick={clearAll}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              padding: '4px',
                              color: 'var(--red)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            className="hover-opacity"
                            title="Limpar cesta"
                          >
                            <Trash2 size={12} /> Limpar
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {basketItems.map((item, idx) => {
                          const prod = findProduct(item.productName);
                          const price = (prod?.minPrice || 0) * item.quantity;
                          return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', background: 'var(--surface-3)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                  <button 
                                    onClick={() => updateQuantity(item.productName, -1)} 
                                    style={{ padding: '0 6px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                                    disabled={item.quantity <= 1}
                                  >-</button>
                                  <span style={{ padding: '0 4px', fontSize: '0.75rem', fontWeight: 700, minWidth: '1.2rem', textAlign: 'center' }}>{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.productName, 1)} 
                                    style={{ padding: '0 6px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                                  >+</button>
                                </div>
                                <span style={{ color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                                  {item.productName}
                                </span>
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--muted)', flexShrink: 0 }}>
                                {money(price)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ 
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Total Estimado</span>
                        {syncStatus === "error" && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Database size={10} /> Modo Offline (Sinc. pausada)
                          </span>
                        )}
                      </div>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--blue)', letterSpacing: '-0.02em', fontWeight: 800 }}>
                        {money(basketItems.reduce((sum, item) => {
                          const prod = findProduct(item.productName);
                          return sum + ((prod?.minPrice || 0) * item.quantity);
                        }, 0))}
                      </strong>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="button button--outline button--small"
                        style={{ flex: 1 }}
                        onClick={downloadPDF}
                        disabled={basketItems.length === 0}
                        title="Exportar PDF do resumo"
                      >
                        <Download size={14} /> PDF
         …34004 tokens truncated…le={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {favProducts.map(p => (
                    <article className="visual-product-card" key={p.id}>
                      <div 
                        className="visual-product-image" 
                        onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: p }))}
                        style={{ height: '120px', cursor: 'pointer' }}
                      >
                        <ProductImage product={p} size="compact" />
                      </div>
                      <div className="visual-product-content" style={{ padding: '1rem' }}>
                        <div 
                          className="visual-product-name" 
                          onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: p }))}
                          style={{ fontSize: '0.9rem', height: '2.5rem', cursor: 'pointer' }}
                        >
                          {p.name}
                        </div>
                        <div className="visual-price">
                          <strong>{money(p.minPrice)}</strong>
                        </div>
                        <div className="visual-product-actions">
                          <button className="button button--primary button--small" onClick={() => addBasket(p)}><Plus size={14}/> Cesta</button>
                          <button className="button button--ghost button--small" onClick={() => {
                            toggleFavorite(String(p.id));
                          }}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-2)', borderRadius: '12px', border: '2px dashed var(--surface-3)' }}>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <Heart size={48} style={{ opacity: 0.1 }} />
                    <Search size={20} style={{ position: 'absolute', bottom: -5, right: -5, color: 'var(--blue)' }} />
                  </div>
                  <h3>Sua lista está vazia</h3>
                  <p style={{ maxWidth: '300px', margin: '0 auto 1.5rem', color: 'var(--muted)' }}>
                    Você ainda não favoritou nenhum produto. Adicione itens para acompanhar preços rapidamente.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <a href="/buscar" className="button button--primary">
                      <Search size={16} /> Explorar Ofertas
                    </a>
                    <a href="/" className="button button--ghost">Ver Início</a>
                  </div>
                </div>
              )
            )}

            {isProfileView && (
              <div className="price-table-card" style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.7rem' }}>Nome Completo</span>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{profileData.name || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.7rem' }}>CPF</span>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{profileData.cpf || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.7rem' }}>Telefone</span>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{profileData.phone || "Não informado"}</p>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.7rem' }}>WhatsApp</span>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{profileData.whatsapp || "Não informado"}</p>
                  </div>
                </div>
                <div>
                  <span className="eyebrow" style={{ fontSize: '0.7rem' }}>Endereço e Referência</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>
                    {profileData.address || "Endereço não informado"}
                    {profileData.referencePoint && <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>{profileData.referencePoint}</span>}
                  </p>
                </div>
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-3)' }}>
                  <button className="button button--ghost button--small" onClick={() => setIsEditingProfile(true)}>Atualizar Meus Dados</button>
                </div>
              </div>
            )}

            <div className="section-heading compact" style={{ marginTop: '3rem' }}>
              <h2>Histórico de Ações Recentes</h2>
            </div>
            <div className="price-table-card">
              {recentActions.map((a: any, i: number) => (
                <div key={i} className="price-row" style={{ padding: '0.75rem 1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     {a.action === 'favorite' ? <Heart size={14} color="var(--red)"/> : <Bell size={14} color="var(--blue)"/>}
                     <span style={{ fontSize: '0.85rem' }}>
                       {a.action === 'favorite' ? 'Favoritou um produto' : 'Ativou alerta de preço'}
                     </span>
                   </div>
                   <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(a.at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <UserBasketHistory user={user} products={products} />
            <PaymentHistory user={user} />
          </section>

          <aside className="generic-aside">
            
            <h2>Configurações</h2>
            
            <div className="aside-stat" style={{ cursor: 'pointer' }} onClick={() => window.location.href = "/alertas"}>
              <span>Alertas de Preço</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{alerts.length} ativos</strong>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="aside-stat">
              <span>Notificações WhatsApp</span>
              <strong style={{ color: 'var(--muted)' }}>Em preparação</strong>
            </div>

            <div className="aside-stat">
              <span>Bairro Preferencial</span>
              <strong>Centro, Feijó</strong>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button className="button button--outline button--full" onClick={() => {
                localStorage.removeItem("precocerto:user");
                window.location.href = "/";
              }}>Sair da Conta</button>
            </div>

            <div style={{ background: 'var(--blue-soft)', padding: '1rem', borderRadius: '12px', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--blue)' }}>
                <ShieldCheck size={16} />
                <strong style={{ fontSize: '0.85rem' }}>Privacidade</strong>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                Seus dados de navegação e preferências são armazenados localmente para garantir sua privacidade.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (path === "/alertas") {
    return (
      <div className="shell page-shell generic-page">
        <section className="generic-hero">
          <span className="generic-icon"><Bell /></span>
          <div>
            
            <h1>Lista de Acompanhamento</h1>
            <p>Receba alertas automáticos quando houver quedas de preço ou quando os dados precisarem de nova verificação em Feijó.</p>
          </div>
        </section>
        <div className="generic-grid">
          <section className="generic-main">
            <div className="section-heading compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Produtos Monitorados ({alertProducts.length})</h2>
                <p>Alertas configurados para variações de preço e validade da informação.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button button--outline" onClick={() => {
                  const csv = [
                    ["Produto", "Marca", "Tamanho", "Estabelecimento", "Preco", "Atualizacao"].join(","),
                    ...alertProducts.map(p => [
                      `"${p.name}"`, `"${p.brand}"`, `"${p.size}"`, `"${p.establishment}"`, p.minPrice, new Date(p.capturedAt).toLocaleDateString()
                    ].join(","))
                  ].join("\n");
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `alertas-precocerto-${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }} title="Exportar para CSV">
                  <Download size={16} /> CSV
                </button>
                <button className="button button--outline" onClick={() => window.print()} title="Imprimir lista (PDF)">
                  <Receipt size={16} /> PDF
                </button>
              </div>
            </div>
            {alertProducts.length > 0 ? alertProducts.map(p => {
               const days = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
               return (
                <article className="compact-product" key={p.id}>
                  <span className="product-visual">{p.category.slice(0,1)}</span>
                  <div>
                    <a href={`/produto/${p.slug}`}>{p.name}</a>
                    <small>{p.brand} • {p.size} • <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'bold' }}>{p.establishment}</a></small>
                    <span style={{ color: days >= 7 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                      {days >= 7 ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>} 
                      {days === 0 ? "Atualizado hoje" : days === 1 ? "Atualizado ontem" : `Atualizado há ${days} dias`}
                    </span>
                  </div>
                  <strong>{money(p.minPrice)}</strong>
                  <button onClick={() => {
                    const saved = JSON.parse(localStorage.getItem("precocerto:actions") ?? "[]");
                    const filtered = saved.filter((a: any) => !(a.action === "alert" && String(a.id) === String(p.id)));
                    localStorage.setItem("precocerto:actions", JSON.stringify(filtered));
                    window.location.reload();
                  }} aria-label="Remover alerta" title="Remover alerta"><Trash2 size={16}/></button>
                  <button className="button button--primary" onClick={() => addBasket(p)}><Plus/> Cesta</button>
                </article>
               );
            }) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--surface-2)', borderRadius: '12px' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Você ainda não possui alertas configurados.</p>
                <a href="/buscar" className="button button--outline" style={{ marginTop: '1rem' }}>Explorar catálogo</a>
              </div>
            )}
          </section>
          <aside className="generic-aside">
            
            <h2>Preferências de Alerta</h2>
            <div className="section-heading compact" style={{ marginTop: '2rem' }}>
              <h3>Central de Notificações</h3>
            </div>
            
            <div className="aside-stat">
              <span>Notificar queda de preço</span>
              <div className="toggle-switch active"></div>
            </div>
            <div className="aside-stat">
              <span>Alerta de dado expirado (7 dias)</span>
              <div className="toggle-switch active"></div>
            </div>
            <div className="aside-stat">
              <span>Alertas via E-mail</span>
              <div className="toggle-switch"></div>
            </div>
            <div className="aside-stat" style={{ background: 'var(--gold-soft)', border: '1px solid var(--gold)', marginTop: '1.5rem', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                <div style={{ background: 'var(--pc-color-success)', color: 'var(--pc-color-primary-foreground)', padding: '6px', borderRadius: '50%' }}><Users size={16} /></div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--pc-color-success)' }}>Alertas via WhatsApp</strong>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.3', color: 'var(--pc-color-foreground)' }}>
                Receba notificações instantâneas de quedas de preço e dados expirados no seu celular.
              </p>
              <button 
                className="button button--small" 
                style={{ background: 'var(--pc-color-success)', color: 'var(--pc-color-primary-foreground)', border: 'none', width: '100%', marginTop: '0.8rem' }}
                onClick={() => window.location.href = "/fale-conosco"}
              >
                Solicitar ativação
              </button>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="pulse-dot" style={{ background: 'var(--green)' }} />
                <strong style={{ fontSize: '0.85rem' }}>Notificações em tempo real</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                {alertProducts.length > 0 ? (
                  <p>Monitorando {alertProducts.length} itens. Última variação checada há 4 min.</p>
                ) : (
                  <p>Aguardando itens para monitoramento...</p>
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>Os alertas são processados localmente baseados nas últimas coletas realizadas em Feijó.</p>
          </aside>
        </div>
      </div>
    );
  }

  if (path.startsWith("/estabelecimento/")) {
    const slug = path.split("/").pop();
    const store = stores.find(s => s.slug === slug);
    return <EstablishmentPage store={store} products={products} addBasket={addBasket}/>;
  }

  return (
    <div className="shell page-shell generic-page">
      <section className="generic-hero">
        <span className="generic-icon">{info[2]}</span>
        <div>
          
          <h1>{info[1]}</h1>
          <p>Informação clara, preços comparáveis e decisões melhores para quem compra e vende em Feijó.</p>
        </div>
        <a className="button button--primary" href="/buscar" style={{ padding: '0.6rem 1.2rem' }}>Comparar agora <ArrowRight size={18}/></a>
      </section>

      <div className="generic-grid">
        <section className="generic-main">
          <div className="section-heading compact">
            <div>
              <h2>{isStore ? "Ofertas em destaque" : isProduct ? "Onde está mais barato" : "Destaques inteligentes"}</h2>
              <p>Seleção automática de produtos com preços atrativos e curadoria local.</p>
            </div>
          </div>
          {(randomFeatured.length > 0 ? randomFeatured : products.slice(0, 4)).map(p => (
            <article className="compact-product" key={p.id}>
              <span className="product-visual">{p.category.slice(0,1)}</span>
              <div>
                <a href={`/produto/${p.slug}`}>{p.name}</a>
                <small>{p.brand} • {p.size} • <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'bold' }}>{p.establishment}</a></small>
                <span><ShieldCheck/> Verificado recentemente</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block' }}>{money(p.minPrice)}</strong>
                {p.previousPrice && p.previousPrice > p.minPrice && (
                  <small style={{ color: 'var(--green)', fontWeight: 600 }}>
                    <TrendingDown size={10}/> -{Math.round((1 - p.minPrice / p.previousPrice) * 100)}%
                  </small>
                )}
              </div>
              <button className={favorites.includes(String(p.id)) ? "active" : ""} onClick={() => toggleFavorite(String(p.id))} aria-pressed={favorites.includes(String(p.id))} aria-label={favorites.includes(String(p.id)) ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`}><Heart fill={favorites.includes(String(p.id)) ? "currentColor" : "none"}/></button>
              <button className="button button--primary" onClick={() => addBasket(p)}><Plus/> Cesta</button>
            </article>
          ))}
        </section>
        <aside className="generic-aside">
          
          <h2>Feijó economiza junto</h2>
          <div className="aside-stat">
            <span>Produtos acompanhados</span>
            <strong>{count(metrics.products)}</strong>
          </div>
          <div className="aside-stat">
            <span>Atualizações hoje</span>
            <strong>214</strong>
          </div>
          <div className="aside-stat">
            <span>Economia potencial</span>
            <strong>14,8%</strong>
          </div>
          <a href="/cesta-basica" className="button button--dark button--full">Montar cesta inteligente</a>
        </aside>
      </div>
    </div>
  );

}

function AuthPage({ path, onAdminAuth, onLogin }: { path: string; onAdminAuth: (success: boolean) => void; onLogin?: (userData?: any) => void }) {
  const register = path === "/cadastro" || path === "/registrar";
  const isAdminLogin = path === "/admin-login";
  const [pin, setPin] = useState("");
  const [cpf, setCpf] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: input user, 2: reset pass
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [merchantLogin, setMerchantLogin] = useState(() => new URLSearchParams(window.location.search).get("perfil") === "lojista");

  useEffect(() => {
    const blocked = localStorage.getItem("precocerto:admin_blocked_until");
    if (blocked) {
      const until = parseInt(blocked, 10);
      if (until > Date.now()) setBlockedUntil(until);
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Acesso bloqueado por segurança. Tente novamente em ${remaining}s.`);
      return;
    }

    if (isAdminLogin && !showForgot) {
      setError("");
      
      const { error: authError } = await signIn(user.trim(), pass);

      if (!authError) {
        const profile = await loadSessionProfile();
        if (profile?.isAdmin) {
          onAdminAuth(true);
          setAttempts(0);
          localStorage.removeItem("precocerto:admin_blocked_until");
          addAuditLog(`Login administrativo autorizado (${profile.roles.join(", ")})`, "success", profile.email ?? user);
          window.location.assign("/admin");
          return;
        }
        await signOut();
        setError("Sua conta não possui permissão administrativa.");
        addAuditLog("Tentativa de acesso administrativo sem papel autorizado", "error", user || "Desconhecido");
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        const until = Date.now() + 60000; // 1 minuto
        setBlockedUntil(until);
        localStorage.setItem("precocerto:admin_blocked_until", until.toString());
        setError("Muitas tentativas falhas. Acesso bloqueado por 1 minuto.");
        addAuditLog("Bloqueio de segurança ativado após 5 falhas no login", "error", user || "Desconhecido");
      } else {
        setError(`Credenciais incorretas. Tentativa ${newAttempts} de 5.`);
      }
    } else if (merchantLogin) {
      setError("");
      const email = user.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Informe o e-mail cadastrado para administrar o estabelecimento.");
        return;
      }
      const { error: authError } = await signIn(email, pass);
      if (authError) {
        setError("E-mail ou senha incorretos. Se o acesso ainda não foi ativado, solicite um convite ao administrador.");
        return;
      }
      const destination = await resolveAuthenticatedHome(new URLSearchParams(window.location.search).get("redirect"));
      if (destination === "/") {
        await signOut();
        setError("Esta conta ainda não está vinculada a um estabelecimento ativo.");
        return;
      }
      window.location.assign(destination);
    } else {
      if (!register) {
        setError("");
        const merchantAuth = await signInMerchantWithCpf(cpf, pin);
        if (!merchantAuth.error) {
          const destination = await resolveAuthenticatedHome(new URLSearchParams(window.location.search).get("redirect"));
          if (destination !== "/") {
            window.location.assign(destination);
            return;
          }
          await signOut();
          setError("A credencial foi reconhecida, mas ainda não está vinculada a um estabelecimento ativo no sistema. Contate o suporte.");
          return;
        } else {
          // O erro 'non-2xx' agora é tratado na lib roles.ts e retorna uma mensagem amigável
          setError(merchantAuth.error);
          return;
        }
      }
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const userData = {
        name: name || (register ? "Novo Usuário" : "Usuário PreçoCerto"),
        cpf: cpf,
        phone: phone || "",
        address: "",
        whatsapp: phone || "",
        referencePoint: ""
      };
      if (onLogin) onLogin(userData);
      const requested = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
    }
  }

  async function handleRecovery(e: FormEvent) {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      setError("Muitas tentativas. Aguarde o desbloqueio.");
      return;
    }

    // Recuperação real: o link de redefinição é enviado pelo provedor de
    // autenticação. A senha nunca é gravada nem trocada no navegador.
    const email = recoveryUser.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe o e-mail cadastrado do administrador.");
      return;
    }

    setIsSendingEmail(true);
    setError("");
    const { error: resetError } = await requestPasswordReset(email);
    setIsSendingEmail(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    addAuditLog("Solicitação de redefinição de senha administrativa enviada", "warning", email);
    setRecoveryStep(2);
  }




  return <div className="auth-page">
    <div className="auth-brand-panel">
      <a className="auth-home-brand" href="/" aria-label="PreçoCerto — página inicial">
        <span className="auth-home-brand__mark"><TrendingDown aria-hidden="true" /></span>
        <span>preço<strong>certo</strong></span>
      </a>
      <div>
        <span className="eyebrow eyebrow--gold">Antes de comprar, compare</span>
        <h1>{isAdminLogin ? "Painel de Controle Restrito" : register?"Economize desde a primeira lista.":"Que bom ter você de volta."}</h1>
        <p>Preços em tempo real, alertas de queda e cestas inteligentes para comprar melhor em Feijó.</p>
        <ul>
          <li><Check/> {isAdminLogin ? "Gestão de inventário e preços" : "Comparação por mercado e embalagem"}</li>
          <li><Check/> {isAdminLogin ? "Auditoria e logs operacionais" : "Histórico e alertas personalizados"}</li>
          <li><Check/> {isAdminLogin ? "Segurança de dados e backups" : "Bônus por envio de nota fiscal"}</li>
        </ul>
      </div>
      <div className="auth-brand-foot">
        <span><MapPin aria-hidden="true" /> Feijó, Acre</span>
        <strong>Escolhas melhores começam com comparação.</strong>
      </div>
    </div>
    <main className="auth-form-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <a className="auth-back" href="/" style={{ margin: 0 }}><ArrowRight/> Voltar ao início</a>
        {!register && !isAdminLogin && <a href="/admin" style={{ fontSize: '0.75rem', color: 'var(--pc-color-border)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--pc-color-muted)'} onMouseOut={e => e.currentTarget.style.color = 'var(--pc-color-border)'}>Acesso Restrito</a>}
      </div>
      <form className="auth-form" onSubmit={showForgot ? handleRecovery : submit}>
        
        <h2>{isAdminLogin ? (showForgot ? "Redefinir Senha" : "Login Administrativo") : register?"Comece grátis":"Entrar no PreçoCerto"}</h2>
        <p>{isAdminLogin ? (showForgot ? "Siga os passos para recuperar o acesso." : "Insira suas chaves de acesso para continuar.") : merchantLogin ? "Use o e-mail e a senha vinculados ao seu estabelecimento." : register?"Leva menos de dois minutos.":"Use seu CPF e PIN de 6 dígitos."}</p>
        
        {error && <div style={{ background: 'color-mix(in srgb,var(--pc-color-danger) 8%,var(--pc-color-surface))', color: 'var(--pc-color-danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> {error}</div>}

        {isAdminLogin ? (
          showForgot ? (
            recoveryStep === 1 ? (
              <>
                <label>E-mail do Administrador<input required type="email" value={recoveryUser} onChange={e=>setRecoveryUser(e.target.value)} placeholder="admin@empresa.com"/></label>
                <div style={{ fontSize: '0.75rem', color: 'var(--pc-color-muted)', marginTop: '0.5rem', background: 'var(--pc-card-bg)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
                  Enviaremos um link seguro de redefinição para este e-mail.
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--pc-color-success)', background: 'color-mix(in srgb,var(--pc-color-success) 7%,var(--pc-color-surface))', border: '1px solid color-mix(in srgb,var(--pc-color-success) 25%,var(--pc-color-border))', padding: '0.85rem', borderRadius: '0.5rem' }}>
                <Check size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/>
                Link enviado. Abra o e-mail e defina a nova senha na página segura.
                <div style={{ marginTop: '0.5rem', color: 'var(--pc-color-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock3 size={12}/> O link expira por segurança.
                </div>
              </div>
            )
          ) : (
            <>
              <label>E-mail do administrador<input required type="email" value={user} onChange={e=>setUser(e.target.value)} placeholder="seu@email.com" autoComplete="username"/></label>
              <label>Senha<input required value={pass} onChange={e=>setPass(e.target.value)} type="password" autoComplete="current-password"/></label>
            </>
          )
        ) : merchantLogin ? (
          <>
            <label>E-mail do responsável<input required type="email" value={user} onChange={e=>setUser(e.target.value)} placeholder="seu@email.com" autoComplete="username"/></label>
            <label>Senha<input required value={pass} onChange={e=>setPass(e.target.value)} type="password" autoComplete="current-password"/></label>
          </>
        ) : (
          <>
            {register&&<label>Nome completo<input name="name" required minLength={3} placeholder="Seu nome e sobrenome"/></label>}
            <label>CPF<input required value={cpf} onChange={e=>setCpf(e.target.value.replace(/\D/g,"").slice(0,11))} inputMode="numeric" placeholder="000.000.000-00"/><small>Usamos seu CPF somente para identificar sua conta.</small></label>
            {register&&<label>Celular<input name="phone" inputMode="tel" placeholder="(68) 99999-9999"/></label>}
            <label>PIN de 6 dígitos<input required value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" type="password" maxLength={6} placeholder="••••••"/><small>Evite sequências como 123456.</small></label>
          </>
        )}

        <button className="button button--primary button--full" type="submit" disabled={(isAdminLogin || merchantLogin) ? (showForgot ? (recoveryStep === 1 ? (!recoveryUser || isSendingEmail) : true) : (!user || !pass)) : (pin.length!==6||cpf.length!==11)}>
          {isAdminLogin ? (showForgot ? (recoveryStep === 1 ? (isSendingEmail ? "Enviando..." : "Enviar link de redefinição") : "Link enviado") : "Autenticar Acesso") : merchantLogin ? "Entrar no painel do negócio" : register?"Criar minha conta":"Entrar com segurança"}
          <ArrowRight/>
        </button>

        {isAdminLogin && !showForgot && <button type="button" onClick={() => setShowForgot(true)} className="center-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>Esqueci minha senha admin</button>}
        {isAdminLogin && showForgot && <button type="button" onClick={() => { setShowForgot(false); setRecoveryStep(1); setError(""); }} className="center-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>Voltar ao login admin</button>}
        
        {!register && !isAdminLogin && <a href="/resgatar" className="center-link">Esqueci meu PIN</a>}
        {!register && !isAdminLogin && <button type="button" onClick={() => { setMerchantLogin(value => !value); setError(""); }} className="center-link" style={{background:"none",border:0,cursor:"pointer",width:"100%"}}>{merchantLogin ? "Entrar como consumidor" : "Sou comerciante ou autora"}</button>}

        <div className="auth-switch">
          {isAdminLogin ? <a href="/login">Voltar para login comum</a> : (register?"Já possui conta? ":"Ainda não tem conta? ")}
          {!isAdminLogin && <a href={register?"/login":"/cadastro"}>{register?"Entrar":"Começar grátis"}</a>}
        </div>
      </form>
    </main>
  </div>;
}


/** Selo de frescor do preço com janela configurável por categoria. */
function FreshnessBadge({ product }: { product: Product }) {
  const { state } = priceFreshness(product.capturedAt, product.category);
  const captured = new Date(product.updated_at || product.capturedAt);
  const label = Number.isFinite(captured.getTime())
    ? `Atualizado em ${captured.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
    : "Sem data de atualização";
  const titles: Record<FreshnessState, string> = {
    fresh: "Preço verificado recentemente para esta categoria.",
    aging: "A janela de confiança desta categoria já passou. Confira na loja.",
    expired: "Preço fora da validade desta categoria. Aguardando nova coleta.",
    pending: "Sem data de verificação registrada.",
  };
  return (
    <span className={`freshness-badge freshness-badge--${state}`} title={titles[state]}>
      <Clock3 size={10} /> {label}
    </span>
  );
}

/** Preço por unidade de medida (R$/kg, R$/L, R$/un). Some quando não é conversível. */
function UnitPriceTag({ product }: { product: Product }) {
  if (!isEnabled("unitPrice")) return null;
  const unit = unitPrice(product.minPrice, product.size, product.unit);
  if (!unit) return null;
  return (
    <span className="unit-price-tag" title="Preço por unidade de medida, calculado sobre o menor preço">
      {money(unit.value)} / {unit.label}
    </span>
  );
}

/** Formulário de denúncia de preço — disponível também para visitantes. */
function PriceReportModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [reason, setReason] = useState(priceReportReasons[0]);
  const [reportedPrice, setReportedPrice] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const parsed = Number(reportedPrice.replace(",", "."));
    const result = await submitPriceReport({
      productId: String(product.id),
      establishmentId: String(product.establishmentId ?? ""),
      reportedPrice: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
      reason,
      comment: comment.trim() || undefined,
    });
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result.error ?? "Não foi possível registrar agora.");
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Informar preço incorreto">
        <div className="admin-modal-head">
          <h3>Informar preço incorreto</h3>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="admin-modal-body">
          {status === "done" ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <CheckCircle2 size={40} color="var(--green)" />
              <h4 style={{ margin: "0.75rem 0 0.25rem" }}>Obrigado!</h4>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Sua informação vai para a moderação e ajuda a manter os preços de Feijó confiáveis.
              </p>
              <button className="button button--primary" style={{ marginTop: "1rem" }} onClick={onClose}>Fechar</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
                <strong>{product.name}</strong> — {product.establishment} · registrado por {money(product.minPrice)}
              </p>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Motivo
                <select value={reason} onChange={e => setReason(e.target.value)} className="admin-input">
                  {priceReportReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Preço encontrado na loja (opcional)
                <input className="admin-input" inputMode="decimal" placeholder="Ex.: 28,90" value={reportedPrice} onChange={e => setReportedPrice(e.target.value)} />
              </label>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Observação (opcional)
                <textarea className="admin-input" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
              </label>
              {status === "error" && (
                <p style={{ color: "var(--red)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
              )}
              <button className="button button--primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Enviando..." : "Enviar informação"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


function SearchPage({ products, stores, metrics, query, setQuery, addBasket, saveAction, favorites, toggleFavorite, fetchError, syncStatus, user }: PageProps & { fetchError?: string | null, syncStatus?: string, user?: any }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);


  const pathname = useLocation().pathname;
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStore, setActiveStore] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [updateRecency, setUpdateRecency] = useState("all"); // 'all', '7d', '24h'
  const [sortBy, setSortBy] = useState<"price" | "avg_price" | "max_price" | "unit" | "date" | "variation">(pathname === "/melhores-precos" ? "variation" : "price");
  const [isSearching, setIsSearching] = useState(false);

  // Usando evento global para unificar comportamento do modal

  const [reportProduct, setReportProduct] = useState<Product | null>(null);

  const randomFeatured = useRandomFeatured(products);
  
  useEffect(() => {
    if (query || activeCategory !== "all" || activeStore !== "all" || activeBrand !== "all") {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [query, activeCategory, activeStore, activeBrand]);


  const categories = useMemo(() => ["all", ...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => ["all", ...new Set(products.map(p => p.brand))], [products]);
  const allStores = useMemo(() => ["all", ...new Set(stores.map(s => s.name))], [stores]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filtered = useMemo(() => {
    let result = searchProducts(products, query).filter(p => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesStore = activeStore === "all" || p.establishment === activeStore;
      const matchesBrand = activeBrand === "all" || p.brand === activeBrand;
      const matchesPrice = p.minPrice >= priceRange[0] && p.minPrice <= priceRange[1];
      
      const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
      const matchesRecency = updateRecency === "all" 
        || (updateRecency === "7d" && daysSinceUpdate <= 7)
        || (updateRecency === "24h" && daysSinceUpdate === 0);

      return matchesCategory && matchesStore && matchesBrand && matchesPrice && matchesRecency;
    });

    if (query && sortBy === "price") {
      // A relevância da pesquisa vem primeiro; o menor preço desempata.
    } else if (sortBy === "price") {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === "avg_price") {
      result.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sortBy === "max_price") {
      result.sort((a, b) => b.maxPrice - a.maxPrice); // Maior preço costuma ser do maior para o menor para ver piores cenários? Ou menor? Usuário pediu "escolher produtos pelo menor, médio ou maior preço", geralmente "por maior" implica descendente. Vamos manter ascendente para consistência com "menor", ou descendente para o "maior".
      // Se ele quer escolher pelo maior, talvez queira ver os mais caros ou os que tem maior teto.
      // Vou fazer: menor (asc), médio (asc), maior (desc).
    } else if (sortBy === "unit") {
      // Menor preço unitário: itens sem medida conversível vão para o fim.
      result.sort((a, b) => {
        const ua = unitPrice(a.minPrice, a.size, a.unit);
        const ub = unitPrice(b.minPrice, b.size, b.unit);
        if (ua && ub) return ua.base === ub.base ? ua.value - ub.value : ua.base.localeCompare(ub.base);
        if (ua) return -1;
        if (ub) return 1;
        return a.minPrice - b.minPrice;
      });
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
    } else if (sortBy === "variation") {
      result.sort((a, b) => {
        const varA = a.previousPrice ? (a.minPrice - a.previousPrice) / a.previousPrice : 0;
        const varB = b.previousPrice ? (b.minPrice - b.previousPrice) / b.previousPrice : 0;
        return varA - varB;
      });
    }
    return result;
  }, [products, query, activeCategory, activeStore, activeBrand, sortBy, priceRange, updateRecency]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const activeFilterCount = [activeCategory, activeStore, activeBrand].filter(value => value !== "all").length
    + (updateRecency !== "all" ? 1 : 0)
    + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setActiveCategory("all");
    setActiveStore("all");
    setActiveBrand("all");
    setPriceRange([0, 1000]);
    setUpdateRecency("all");
    setSortBy(pathname === "/melhores-precos" ? "variation" : "price");
  };

  const toggleComparison = (product: Product) => {
    if (compareList.some(item => item.id === product.id)) {
      setCompareList(current => current.filter(item => item.id !== product.id));
      return;
    }
    if (compareList.length >= 4) {
      alert("Você pode comparar até 4 produtos por vez.");
      return;
    }
    setCompareList(current => [...current, product]);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCategory, activeStore, activeBrand, sortBy, priceRange, updateRecency]);


  const handleShare = (p?: Product) => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (p) {
      url.searchParams.set("q", p.name);
    } else {
      if (query) url.searchParams.set("q", query);
      if (activeCategory !== "all") url.searchParams.set("cat", activeCategory);
      if (activeStore !== "all") url.searchParams.set("store", activeStore);
    }
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("Link de compartilhamento copiado para a área de transferência!");
    });
  };

  useEffect(() => {
    if (reportProduct) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [reportProduct]);

  return (
    <div className={`shell page-shell ${pathname === "/melhores-precos" ? "best-prices-page" : ""}`}>
      {fetchError && (
        <div className="status-banner status-banner--error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'color-mix(in srgb,var(--pc-color-danger) 8%,var(--pc-color-surface))', color: 'var(--pc-color-danger)', borderRadius: '8px', border: '1px solid color-mix(in srgb,var(--pc-color-danger) 28%,var(--pc-color-border))', fontSize: '0.9rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Erro de conexão com o banco de dados:</strong> {fetchError}. 
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Exibindo dados locais de contingência enquanto tentamos restabelecer a conexão.</p>
          </div>
        </div>
      )}
      <section className="search-command">
        <div className="search-command__intro">
          <div>
            <h1>{pathname === "/melhores-precos" ? "Melhores preços, sem ruído." : "Compare antes de comprar"}</h1>
            <p>{pathname === "/melhores-precos" ? "Veja primeiro os produtos com queda real e coleta recente. Compare, confirme a loja e adicione somente o que faz sentido para a sua compra." : `Pesquise em ${metrics.products.toLocaleString("pt-BR")} produtos de ${stores.length} estabelecimentos locais.`}</p>
          </div>
          <div className="search-command__trust"><ShieldCheck/><span><b>{syncStatus === "online" ? "Dados sincronizados" : "Atualização em andamento"}</b><small>Preços com origem e data de coleta</small></span></div>
        </div>
        {pathname === "/melhores-precos" && <div className="best-prices-brief" aria-label="Resumo da seleção"><span><TrendingDown/> Ordenado por queda de preço</span><span><Store/> {stores.length} lojas acompanhadas</span><span><PackageSearch/> {filtered.length.toLocaleString("pt-BR")} ofertas na seleção</span></div>}
        <div className="search-command__box"><SearchBox value={query} setValue={setQuery} products={products} /></div>
        <div className="search-command__actions">
          <button className="search-filter-trigger" onClick={() => setFiltersOpen(open => !open)} aria-expanded={filtersOpen}><SlidersHorizontal/> Filtros {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
          <button onClick={() => handleShare()}><Share2/> Compartilhar busca</button>
          <span><PackageSearch/> {filtered.length.toLocaleString("pt-BR")} resultados</span>
        </div>
      </section>

      <div className={`professional-search-layout ${filtersOpen ? "filters-open" : ""}`}>
        <aside className="professional-filters" aria-label="Filtros da busca">
          <header><div><SlidersHorizontal/><b>Refinar resultados</b></div>{activeFilterCount > 0 && <button onClick={clearFilters}>Limpar</button>}</header>
          <label><span>Categoria</span><select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}>{categories.map(value => <option value={value} key={value}>{value === "all" ? "Todas as categorias" : value}</option>)}</select></label>
          <label><span>Estabelecimento</span><select value={activeStore} onChange={e => setActiveStore(e.target.value)}>{allStores.map(value => <option value={value} key={value}>{value === "all" ? "Todos os estabelecimentos" : value}</option>)}</select></label>
          <label><span>Marca</span><select value={activeBrand} onChange={e => setActiveBrand(e.target.value)}>{allBrands.map(value => <option value={value} key={value}>{value === "all" ? "Todas as marcas" : value}</option>)}</select></label>
          <fieldset><legend>Faixa de preço</legend><div className="professional-price-range"><label><small>Mínimo</small><input type="number" min="0" value={priceRange[0]} onChange={e => setPriceRange([Math.max(0, Number(e.target.value)), priceRange[1]])}/></label><span>—</span><label><small>Máximo</small><input type="number" min="0" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(0, Number(e.target.value))])}/></label></div></fieldset>
          <fieldset><legend>Atualização do preço</legend><div className="professional-radio-list">{[["all","Qualquer data"],["24h","Últimas 24 horas"],["7d","Últimos 7 dias"]].map(([value,label]) => <label key={value}><input type="radio" name="recency" checked={updateRecency === value} onChange={() => setUpdateRecency(value)}/><span>{label}</span></label>)}</div></fieldset>
          <button className="button button--primary professional-filter-apply" onClick={() => setFiltersOpen(false)}>Ver {filtered.length} resultados</button>
        </aside>

        <main className="professional-search-results">
          <header className="professional-results-head"><div><span>Catálogo local</span><h2>{query ? `Resultados para “${query}”` : "Produtos disponíveis"}</h2><small>{filtered.length} itens encontrados • página {Math.min(currentPage, Math.max(totalPages, 1))} de {Math.max(totalPages, 1)}</small></div><label><span>Ordenar por</span><select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}><option value="price">Menor preço</option><option value="avg_price">Preço médio</option><option value="max_price">Maior preço</option><option value="unit">Menor preço por unidade</option><option value="date">Atualização mais recente</option><option value="variation">Maior queda de preço</option></select></label></header>

          {isSearching ? <div className="search-loading"><div className="spinner"/><p>Analisando o catálogo local…</p></div> : paginated.length > 0 ? <>
            <div className="professional-results-grid">
              {paginated.map(product => {
                const selected = compareList.some(item => item.id === product.id);
                const saving = Math.max(0, product.avgPrice - product.minPrice);
                const spread = product.maxPrice > 0 ? Math.round((1 - product.minPrice / product.maxPrice) * 100) : 0;
                const comparedStores = new Set((product.offers || []).map(offer => String(offer.establishmentId))).size || product.storeCount;
                const hasLocalComparison = comparedStores > 1 && product.maxPrice > product.minPrice;
                const history = product.price_history || [];
                const trend = product.previousPrice ? ((product.minPrice - product.previousPrice) / product.previousPrice) * 100 : null;
                return <article className={`professional-result-card ${selected ? "is-selected" : ""}`} key={product.id}>
                  <div className="professional-result-card__visual" onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: product }))}><ProductImage product={product} size="default"/><span className="category-tag">{product.category}</span><button className={`floating-favorite ${favorites.includes(String(product.id)) ? "active" : ""}`} aria-pressed={favorites.includes(String(product.id))} aria-label={favorites.includes(String(product.id)) ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`} onClick={event => {event.stopPropagation();toggleFavorite(String(product.id));}}><Heart fill={favorites.includes(String(product.id)) ? "currentColor" : "none"}/>{favorites.includes(String(product.id)) && <span className="favorite-saved-label">Salvo</span>}</button></div>
                  <div className="professional-result-card__body">
                    <div className="professional-result-card__meta"><span>{product.brand} • {product.size}</span><FreshnessBadge product={product}/></div>
                    <h3 onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: product }))}>{product.name}</h3>
                    <a className="professional-result-store" href={`/estabelecimento/${product.establishmentSlug}`}><Store/><span><b>{product.establishment}</b><small>{product.neighborhood}</small></span><ArrowRight/></a>
                    <div className="professional-price-main"><span><small>Menor preço encontrado</small><strong>{money(product.minPrice)}</strong></span><UnitPriceTag product={product}/></div>
                    {hasLocalComparison ? <div className="professional-price-analysis"><span><small>Média local</small><b>{money(product.avgPrice)}</b></span><span><small>Maior preço</small><b>{money(product.maxPrice)}</b></span><span className="saving"><small>Economia potencial</small><b>{money(saving)}</b></span></div> : <div className="single-price-note"><Store/><span><b>1 preço disponível</b><small>A média e o maior preço aparecerão quando houver outra loja para comparar.</small></span></div>}
                    <div className="professional-insights">
                      {hasLocalComparison && <span><TrendingDown/><b>{spread}%</b> de diferença entre lojas</span>}
                      {trend !== null && <span className={trend <= 0 ? "positive" : "negative"}>{trend <= 0 ? <TrendingDown/> : <TrendingUp/>}<b>{Math.abs(Math.round(trend))}%</b> desde o preço anterior</span>}
                      {history.length > 1 && <button onClick={() => window.dispatchEvent(new CustomEvent('pc:open-product-details', { detail: product }))}><LineChart/> Ver {history.length} registros históricos</button>}
                    </div>
                    <div className="professional-result-card__footer"><button className="button button--primary" onClick={() => addBasket(product)}><Plus/> Adicionar à cesta</button><button className={`professional-compare-button ${selected ? "selected" : ""}`} onClick={() => toggleComparison(product)}>{selected ? <CheckCircle2/> : <LineChart/>}{selected ? "Selecionado" : "Comparar"}</button>{isEnabled("priceReports") && <button className="professional-report-button" aria-label="Informar preço incorreto" onClick={() => setReportProduct(product)}><Flag/></button>}</div>
                  </div>
                </article>;
              })}
            </div>
            {totalPages > 1 && <nav className="professional-pagination" aria-label="Paginação"><button onClick={() => setCurrentPage(page => Math.max(1,page - 1))} disabled={currentPage === 1}><ArrowLeft/> Anterior</button><span>Página <b>{currentPage}</b> de {totalPages}</span><button onClick={() => setCurrentPage(page => Math.min(totalPages,page + 1))} disabled={currentPage === totalPages}>Próxima <ArrowRight/></button></nav>}
          </> : <div className="no-results"><PackageSearch/><h2>Nenhum produto encontrado</h2><p>Revise o termo pesquisado ou remova alguns filtros.</p><button className="button button--outline" onClick={clearFilters}>Limpar busca e filtros</button></div>}
        </main>
      </div>


      {reportProduct && <PriceReportModal product={reportProduct} onClose={() => setReportProduct(null)} />}

      {/* Modal agora é global em PrecoCertoApp */}
      {compareList.length > 0 && (
        <div className="compare-bar" style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-1)', border: '2px solid var(--blue)', padding: '1rem',
          borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '90vw',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
            {compareList.map(p => (
              <div key={p.id} style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <ProductImage product={p} size="compact" />
                <button 
                  onClick={() => setCompareList(prev => prev.filter(i => i.id !== p.id))}
                  style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'var(--pc-color-primary-foreground)', border: 'none', padding: '2px', cursor: 'pointer', borderRadius: '0 0 0 4px' }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {compareList.length} {compareList.length === 1 ? 'produto selecionado' : 'produtos selecionados'}
          </div>
          <button className="button button--primary" disabled={compareList.length < 2} onClick={() => setShowCompareModal(true)}>
            {compareList.length < 2 ? "Selecione mais 1" : "Comparar agora"} <LineChart size={18} />
          </button>
        </div>
      )}

      {showCompareModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="admin-modal-content" style={{ maxWidth: '900px', width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3><LineChart size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Comparativo de Preços e Variação</h3>
              <button className="icon-button" onClick={() => setShowCompareModal(false)}><X/></button>
            </div>
            <div className="admin-modal-body">
              <div className="compare-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Produto</th>
                      {compareList.map(p => (
                        <th key={p.id} style={{ padding: '1rem', textAlign: 'center', minWidth: '150px' }}>
                          <ProductImage product={p} size="compact" />
                          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{p.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Melhor Preço</td>
                      {compareList.map(p => (
                        <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue)' }}>{money(p.minPrice)}</div>
                          <small style={{ color: 'var(--tertiary)', fontWeight: 600 }}><a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.establishment}</a></small>
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Média em Feijó</td>
                      {compareList.map(p => (
                        <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>{money(p.avgPrice)}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Ranking Local</td>
                      {compareList.map(p => {
                        const rank = products.filter(i => i.category === p.category).sort((a,b) => a.minPrice - b.minPrice).findIndex(i => i.id === p.id) + 1;
                        return (
                          <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ background: rank === 1 ? 'var(--blue)' : 'var(--surface-2)', color: rank === 1 ? 'white' : 'inherit', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                              #{rank} na categoria
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Tendência</td>
                      {compareList.map(p => {
                        const diff = p.previousPrice ? ((p.minPrice - p.previousPrice) / p.previousPrice) * 100 : 0;
                        return (
                          <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                            {diff !== 0 ? (
                              <div style={{ color: diff < 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: 700 }}>
                                {diff < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(Math.round(diff))}%
                              </div>
                            ) : 'Estável'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button className="button button--ghost" onClick={() => setCompareList([])}>Limpar comparação</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function PrecoCertoApp() {
  const pathname = useLocation().pathname || "/";
  const [products,setProducts]=useState<Product[]>(initialProducts);
  const [stores,setStores]=useState<StoreRow[]>(initialStores);
  const [metrics,setMetrics]=useState<PlatformMetrics>(verifiedDatasetMetrics);
  const [query,setQuery]=useState("");
  const [cart,setCart]=useState<Product[]>(() => JSON.parse(localStorage.getItem("precocerto:basket") || "[]"));
  const [toast,setToast]=useState("");
  const [syncStatus, setSyncStatus] = useState<"online" | "syncing" | "error">("online");
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [user, setUser] = useState<{name: string} | null>(() => {
    const saved = localStorage.getItem("precocerto:user");
    return saved ? JSON.parse(saved) : null;
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (!localStorage.getItem("precocerto:user")) return [];
    try { 
      const saved = localStorage.getItem("precocerto:favorites");
      return saved ? JSON.parse(saved) : []; 
    }

    catch { return []; }
  });
  // O acesso admin nunca é decidido pelo navegador: consultamos a sessão e os
  // papéis no backend em cada carregamento.
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminCheck, setAdminCheck] = useState<"checking" | "done">("checking");
  const [adminProfile, setAdminProfile] = useState<SessionProfile | null>(null);
  
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin-login"; 
  const isAuth = ["/login","/cadastro","/registrar","/admin-login"].includes(pathname);

  useEffect(() => {
    let alive = true;
    loadSessionProfile().then(profile => {
      if (!alive) return;
      setAdminProfile(profile);
      setAdminAuth(Boolean(profile?.isAdmin));
      setAdminCheck("done");
    });
    return () => { alive = false; };
  }, []);


  useEffect(() => {
    let alive = true;
    let timer: any;

    const load = async () => {
      if (!alive) return;
      setSyncStatus("syncing");
      
      try {
        const data = await fetchCatalog();
        if (!alive) return;
        
        setProducts(data.products);
        setFetchError(data.error ?? null);
        
        if (data.stores && data.stores.length > 0) {
          setStores(data.stores);
        }
        
        setMetrics(data.metrics);
        setSyncStatus("online");

        const params = new URLSearchParams(window.location.search);
        
        const initialQuery = params.get("q");
        if (initialQuery) setQuery(initialQuery);

        const productId = params.get("product_id");
        if (productId) {
          const found = data.products.find(p => String(p.id) === String(productId));
          if (found) {
            console.log("Deep link detected for product:", productId);
            setTimeout(() => {
              if (alive) {
                console.log("Setting selected product from deep link");
                setSelectedProduct(found);
              }
            }, 1000);
            
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("product_id");
            window.history.replaceState({}, "", newUrl.toString());
          }
        }
      } catch (err) {
        if (!alive) return;
        setSyncStatus("error");
        setFetchError(err instanceof Error ? err.message : "Falha na conexão");
      }
      
      timer = setTimeout(load, 120000);
    };

    load();
    return () => { 
      alive = false; 
      clearTimeout(timer);
    };
  }, []);


  useEffect(() => {
    localStorage.setItem("precocerto:basket", JSON.stringify(cart));
  }, [cart]);

  // Carrega favoritos remotos ao logar e sincroniza favoritos locais ao banco
  useEffect(() => {
    if (user) {
      import("./lib/roles").then(async m => {
        const remoteFavs = await m.loadRemoteFavorites();
        const localFavs = JSON.parse(localStorage.getItem("precocerto:favorites") ?? "[]");
        
        // Merge: local + remoto
        const mergedFavs = Array.from(new Set([...localFavs, ...remoteFavs]));
        setFavorites(mergedFavs);
        localStorage.setItem("precocerto:favorites", JSON.stringify(mergedFavs));
        
        // Garante que o banco tem tudo
        await m.syncFavorites(mergedFavs);
      });
    }
  }, [user]);

  const [toastExit, setToastExit] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setToastExit(false);
    const exitTimer = setTimeout(() => setToastExit(true), 2400);
    const clearTimer = setTimeout(() => setToast(""), 2800);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(clearTimer);
    };
  }, [toast]);


  
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setSelectedProduct(null);
        setModalError(null);
        setModalLoading(true);
        
        // Simula carregamento para exibir skeleton (ou faz fetch real se necessário no futuro)
        setTimeout(async () => {
          setSelectedProduct(e.detail);
          setModalLoading(false);
          
          // Se tivermos Supabase, buscar histórico e ofertas reais
          if (supabase && e.detail.id) {
            try {
              const { data: offers } = await supabase
                .from('prices')
                .select(`
                  value,
                  captured_at,
                  establishments (
                    name,
                    neighborhood
                  )
                `)
                .eq('product_id', e.detail.id)
                .order('value', { ascending: true });

              if (offers) {
                const formattedOffers = offers.map((o: any) => ({
                  establishmentId: o.establishment_id || '0',
                  establishmentSlug: '', // Omitido ou buscado se necessário
                  establishment: o.establishments?.name || 'Desconhecido',
                  neighborhood: o.establishments?.neighborhood || '',
                  storeColor: 'var(--pc-color-primary)',
                  value: Number(o.value),
                  capturedAt: o.captured_at
                }));
                
                setSelectedProduct(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    offers: formattedOffers,
                    storeCount: formattedOffers.length,
                    minPrice: Math.min(...formattedOffers.map(o => o.value)),
                    maxPrice: Math.max(...formattedOffers.map(o => o.value)),
                    avgPrice: formattedOffers.reduce((a, b) => a + b.value, 0) / formattedOffers.length
                  } as Product;
                });
              }

              const { data: history } = await supabase
                .from('prices')
                .select('value, captured_at')
                .eq('product_id', e.detail.id)
                .order('captured_at', { ascending: true })
                .limit(20);

              if (history) {
                setSelectedProduct(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    price_history: history.map((h: any) => ({
                      date: h.captured_at,
                      value: Number(h.value)
                    }))
                  } as Product;
                });
              }
            } catch (err) {
              console.error("Erro ao carregar detalhes do produto:", err);
            }
          }

          // Simulação de erro caso o produto não tenha preço mínimo válido
          if (!Number.isFinite(e.detail.minPrice)) {
            setModalError("Dados de preço indisponíveis para este produto.");
          }
        }, 600);
      }
    };
    window.addEventListener('pc:open-product-details', handler);
    
    if (selectedProduct) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      window.removeEventListener('pc:open-product-details', handler);
      document.body.classList.remove('modal-open');
    };
  }, [selectedProduct]);

  // Validação de autenticação para adicionar itens
  async function addBasket(p: Product) {
    // Persistir a loja de origem se for Dorinha Barroso
    if (window.location.pathname === "/dorinha" || window.location.pathname === "/escritora") {
      localStorage.setItem("pc:origin_store", "dorinha");
      localStorage.setItem("pc:post_checkout_redirect", window.location.pathname);
    }

    const nextCart = [...cart];
    if (!nextCart.some(i => i.id === p.id)) {
      nextCart.push(p);
      setCart(nextCart);
      localStorage.setItem("precocerto:basket", JSON.stringify(nextCart));
    }

    if (!user) {
      setToast(`${p.name} na cesta (local). Acesse para sincronizar.`);
      return;
    }

    try {
      // Sincronização imediata com o cloud se logado
      const itemsConfig = nextCart.map(item => ({
        productName: item.name,
        category: item.category,
        quantity: 1,
        unit: (item.unit as any) || "un",
        isEssential: true
      }));

      await saveBasket(
        (user as any).id,
        "Cesta Ativa",
        "within_budget",
        200,
        itemsConfig,
        { total: 0, savings: 0, items: [], storeBreakdown: {} }
      );
      setToast(`${p.name} adicionado e sincronizado.`);
    } catch (err) {
      setToast(`${p.name} salvo localmente.`);
    }
    setUndoAction(null);
  }


  function removeBasket(id: number | string) {
    const itemToRemove = cart.find(i => String(i.id) === String(id));
    if (!itemToRemove) return;

    setCart(current => current.filter(i => String(i.id) !== String(id)));
    setToast(`${itemToRemove.name} removido.`);
    setUndoAction(() => () => {
      setCart(current => [...current, itemToRemove]);
      setToast("Ação desfeita.");
    });
  }

  function clearBasket() {
    const previousCart = [...cart];
    setCart([]);
    localStorage.removeItem("precocerto:basket");
    setToast("Cesta limpa.");
    setUndoAction(() => () => {
      setCart(previousCart);
      setToast("Ação desfeita.");
    });
  }
  
  function saveAction(action:string,type:string,id:string){
    if (action === "favorite") {
      toggleFavorite(id);
      return;
    }
    const key="precocerto:actions";
    const saved=JSON.parse(localStorage.getItem(key)??"[]");
    const isNew = !saved.some((a: any) => a.action === action && a.type === type && a.id === id);
    
    if (isNew) {
      localStorage.setItem(key,JSON.stringify([...saved,{action,type,id,at:new Date().toISOString()}].slice(-200)));
      setToast("Alerta de preço ativado.");
    } else if (action === "alert") {
      setToast("Você já está acompanhando este produto.");
    } else {
      setToast("Item já está nos favoritos.");
    }
  }

  function toggleFavorite(productId: string) {
    setFavorites(current => {
      const removing = current.includes(productId);
      const next = removing ? current.filter(id => id !== productId) : [...current, productId];
      localStorage.setItem("precocerto:favorites", JSON.stringify(next));
      
      // Sincronização com Supabase em segundo plano se logado
      if (user) {
        import("./lib/roles").then(m => m.syncFavorites(next)).catch(err => console.error("Erro sync favoritos:", err));
      }
      
      // Se adicionar aos favoritos, também adiciona à cesta se for um produto do catálogo
      if (!removing) {
        const p = products.find(prod => String(prod.id) === productId);
        if (p) {
          // Pequeno timeout para não conflitar com o estado de favorites
          setTimeout(() => addBasket(p), 100);
        }
      }

      if (removing) {
        const actions = JSON.parse(localStorage.getItem("precocerto:actions") ?? "[]");
        localStorage.setItem("precocerto:actions", JSON.stringify(actions.filter((item: any) => !(item.action === "favorite" && item.id === productId))));
        setToast("Produto removido dos favoritos.");
      } else {
        const key = "precocerto:actions";
        const actions = JSON.parse(localStorage.getItem(key) ?? "[]");
        localStorage.setItem(key, JSON.stringify([...actions, { action: "favorite", type: "product", id: productId, at: new Date().toISOString() }].slice(-200)));
        setToast("Produto adicionado aos favoritos.");
      }
      return next;
    });
  }


  const setUserAndUpdateStorage = (newUser: any) => {
    setUser(newUser);
    localStorage.setItem("precocerto:user", JSON.stringify(newUser));
  };

  const props = useMemo(()=>({products,stores,metrics,query,setQuery,addBasket,saveAction,favorites,toggleFavorite,fetchError,syncStatus,user,setUser: setUserAndUpdateStorage,setToast}),[products,stores,metrics,query,fetchError,syncStatus,user,favorites,setToast]);

  // Toast global listener
  useEffect(() => {
    const handler = (e: any) => {
      const msg = e.detail.message;
      setToast(msg);
    };
    window.addEventListener('pc:set-toast', handler);
    return () => window.removeEventListener('pc:set-toast', handler);
  }, []);

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setAdminAuth(true);
      setAdminCheck("done");
      addAuditLog("Login administrativo realizado");
    }
  };

  const handleUserLogin = (userData?: any) => {
    const newUser = userData || { name: "Usuário PreçoCerto" };
    setUser(newUser);
    localStorage.setItem("precocerto:user", JSON.stringify(newUser));
    try { setFavorites(JSON.parse(localStorage.getItem("precocerto:favorites") ?? "[]")); }
    catch { setFavorites([]); }
    setToast("Bem-vindo ao PreçoCerto!");
    
    // Verifica se havia um salvamento de cesta pendente
    if (localStorage.getItem("pc:pending_save_basket") === "true") {
      localStorage.removeItem("pc:pending_save_basket");
    }

    // Lógica de redirecionamento pós-login (ex: voltar para Dorinha se veio de lá)
    const postLoginRedirect = localStorage.getItem("pc:post_login_redirect");
    const lastStore = localStorage.getItem("precocerto:last_writer_store");
    
    if (postLoginRedirect) {
      localStorage.removeItem("pc:post_login_redirect");
      window.location.href = postLoginRedirect;
    } else if (lastStore && pathname === "/login") {
       // Se o usuário completou uma ação (como checkout) e precisa voltar
       // Esta lógica pode ser expandida conforme necessário
    }
  };


  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    setAdminAuth(false);
    localStorage.removeItem("precocerto:user");
    void signOut();
    window.location.href = "/";
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    setAdminProfile(null);
    void signOut();
    window.location.href = "/login";
  };

  if (isAdmin && adminCheck === "checking") {
    return <div className="admin-boot-gate" role="status" aria-live="polite">
      <ShieldCheck size={22}/> Validando suas permissões...
    </div>;
  }

  if (isAdmin && !adminAuth) {
    window.location.href = "/admin-login";
    return null;
  }

  let page:ReactNode;
  if(pathname==="/") page=<HomePage {...props}/>;
  else if(pathname==="/buscar"||pathname==="/comparador"||pathname==="/melhores-precos") page=<SearchPage {...props} metrics={metrics}/>;
  else if(pathname==="/acougues"||pathname==="/categoria/acougue") page=<ButchersPage {...props}/>;
  else if(pathname==="/planos" && isEnabled("consumerPlans")) page=<PlansPage/>;
  else if(pathname==="/meus-pedidos"||pathname==="/historico-pedidos") page=<CustomerOrders/>;
  else if(pathname==="/perfil") page=<GenericPage {...props} metrics={metrics} path={pathname} user={user} setUser={setUserAndUpdateStorage}/>;
  else if(pathname==="/alertas"||pathname==="/favoritos") page=<FavoritesPage {...props} user={user} />;
  else if(pathname==="/cesta"||pathname==="/cesta-basica"||pathname==="/checkout") page=<BasketPage {...props} cart={cart} removeBasket={removeBasket} clearBasket={clearBasket} user={adminProfile ? { id: adminProfile.userId, name: adminProfile.name } : user} syncStatus={syncStatus} stores={stores} setToast={setToast}/>;
  else if(pathname==="/dorinha"||pathname==="/escritora") page=<DorinhaAuthorStore />;

  else if(pathname.startsWith("/cesta/snapshot/")) page=<SnapshotPage {...props}/>;
  else if(isAdmin) page=<AdminPage path={pathname} onLogout={handleAdminLogout} products={products} stores={stores}/>;
  else if(isAuth) page=<AuthPage path={pathname} onAdminAuth={handleAdminAuth} onLogin={handleUserLogin}/>;
  else page=<GenericPage {...props} metrics={metrics} path={pathname} user={adminProfile ? { id: adminProfile.userId, name: adminProfile.name } : user}/>;

  // Expondo o toast globalmente para o useEffect da BasketPage poder disparar erros de rede
  useEffect(() => {
    (window as any).setGlobalToast = (msg: string, type?: string) => setToast(msg);
  }, []);

  return <div className={`app${isAuth ? " app--auth" : ""}`}>
    {!isAuth && <Header
      basketCount={cart.length} 
      favoritesCount={favorites.length} 
      user={user} 
      onLogout={handleLogout}
      products={products}
      favorites={favorites}
      addBasket={addBasket}
    />}
    <main className={isAuth ? "auth-main" : undefined}><div className="page-transition-enter-active" key={pathname}>{page}</div></main>
    {!isAuth && <Footer user={user}/>}
    {!isAuth && <MobileBar basketCount={cart.length} favoritesCount={favorites.length}/>}

    {toast && (
      <div 
        className={`toast ${toastExit ? "toast--exit" : ""}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-content">
          <CheckCircle2 size={20} color="var(--green)" />
          <span>{toast}</span>
          {undoAction && (
            <button 
              className="toast-undo"
              onClick={() => {
                undoAction();
                setToast("");
                setUndoAction(null);
              }}
              aria-label="Desfazer ação anterior"
            >
              Desfazer
            </button>
          )}
        </div>
        <button 
          className="toast-close" 
          onClick={() => setToast("")}
          aria-label="Fechar notificação"
        >
          <X size={16} />
        </button>
      </div>
    )}

    {(selectedProduct || modalLoading) && (
      <div className="admin-modal-overlay" onClick={() => { setSelectedProduct(null); setModalLoading(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-title" style={{ zIndex: 9999 }}>
        <div className="admin-modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()} tabIndex={-1}>
          <div className="admin-modal-head">
            <h3 id="modal-title">{modalLoading ? "Carregando..." : "Detalhes do Produto"}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!modalLoading && selectedProduct && (
                <button 
                  className="icon-button" 
                  title="Compartilhar este produto"
                  onClick={() => {
                    const text = `Confira ${selectedProduct.name} no PreçoCerto Feijó: ${window.location.origin}/produto/${selectedProduct.slug}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                >
                  <Share2 size={18} />
                </button>
              )}
              <button className="icon-button" onClick={() => { setSelectedProduct(null); setModalLoading(false); }} aria-label="Fechar detalhes"><X/></button>
            </div>
          </div>
          <div className="admin-modal-body">
            {modalLoading ? (
              <div className="skeleton-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1rem' }}>
                <div className="skeleton-image" style={{ height: '250px', background: 'var(--surface-2)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton-line" style={{ height: '24px', width: '40%', background: 'var(--surface-2)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                  <div className="skeleton-line" style={{ height: '40px', width: '90%', background: 'var(--surface-2)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                  <div className="skeleton-line" style={{ height: '20px', width: '60%', background: 'var(--surface-2)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                  <div className="skeleton-line" style={{ height: '80px', width: '100%', background: 'var(--surface-2)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                </div>
              </div>
            ) : modalError ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <AlertTriangle size={48} color="var(--red)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ops! Algo deu errado</h4>
                <p style={{ color: 'var(--muted)' }}>{modalError}</p>
                <button className="button button--primary" style={{ marginTop: '1.5rem' }} onClick={() => { setSelectedProduct(null); setModalError(null); }}>
                  Voltar para a busca
                </button>
              </div>
            ) : selectedProduct && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ProductImage product={selectedProduct} size="default" eager />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="category-tag">{selectedProduct.category}</span>
                      {selectedProduct.previousPrice && selectedProduct.minPrice < selectedProduct.previousPrice && (
                        <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          -{Math.round((1 - selectedProduct.minPrice / selectedProduct.previousPrice) * 100)}% de desconto
                        </div>
                      )}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', fontWeight: 800 }}>{selectedProduct.name}</h2>
                    <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '1rem' }}>{selectedProduct.brand} • {selectedProduct.size}</p>
                    
                    <div className="visual-price" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                      <strong style={{ fontSize: '2.25rem', color: 'var(--green)' }}>{money(selectedProduct.minPrice)}</strong>
                      {selectedProduct.previousPrice && selectedProduct.previousPrice > selectedProduct.minPrice && (
                        <span className="old-price" style={{ color: 'var(--muted)', textDecoration: 'line-through', fontSize: '1.1rem' }}>{money(selectedProduct.previousPrice)}</span>
                      )}
                    </div>

                    <div className="verified-details" style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px' }}>
                      <div className="detail-item" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Store size={16} color="var(--blue)" />
                        <strong style={{ fontSize: '0.95rem' }}>{selectedProduct.establishment}</strong>
                      </div>
                      <div className="detail-item" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <MapPin size={16} color="var(--muted)" />
                        <span>{selectedProduct.neighborhood}, Feijó</span>
                      </div>
                      <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        <Clock3 size={16} />
                        <span>Verificado em: {new Date(selectedProduct.capturedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--surface-3)', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
                      {(selectedProduct.storeCount > 1 || (selectedProduct.offers && selectedProduct.offers.length > 1)) ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mínimo</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--green)' }}>
                              {Number.isFinite(selectedProduct.minPrice) ? money(selectedProduct.minPrice) : '---'}
                            </strong>
                          </div>
                          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Médio</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--blue)' }}>
                              {(() => {
                                const avg = selectedProduct.avgPrice || (selectedProduct.price_history && selectedProduct.price_history.length > 0
                                  ? selectedProduct.price_history.reduce((a: number, b: any) => a + b.value, 0) / selectedProduct.price_history.length
                                  : selectedProduct.minPrice);
                                return Number.isFinite(avg) ? money(avg) : '---';
                              })()}
                            </strong>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Máximo</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--red)' }}>
                              {(() => {
                                const max = selectedProduct.maxPrice || (selectedProduct.price_history && selectedProduct.price_history.length > 0
                                  ? Math.max(...selectedProduct.price_history.map((h: any) => h.value))
                                  : (selectedProduct.previousPrice || selectedProduct.minPrice));
                                return Number.isFinite(max) ? money(max) : '---';
                              })()}
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '4px 0' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Info size={14} /> Oferta exclusiva neste estabelecimento em Feijó
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comparação detalhada por estabelecimento */}
                {(selectedProduct.offers && selectedProduct.offers.length > 1) && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Store size={18} /> Comparação entre estabelecimentos
                    </h4>
                    <div className="price-table-card" style={{ background: 'var(--surface-2)', borderRadius: '12px', overflow: 'hidden' }}>
                      {[...selectedProduct.offers].sort((a, b) => a.value - b.value).map((offer, idx) => (
                        <div key={idx} className="price-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx < selectedProduct.offers!.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{offer.establishment}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{offer.neighborhood}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '1rem', color: offer.value === selectedProduct.minPrice ? 'var(--green)' : 'var(--foreground)' }}>
                              {money(offer.value)}
                            </strong>
                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                              Verificado há {Math.floor((Date.now() - new Date(offer.capturedAt).getTime()) / 86400000)} dias
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href={`/estabelecimento/${selectedProduct.establishmentSlug}`} 
                    className="button button--primary button--full"
                    style={{ textDecoration: 'none', justifyContent: 'center' }}
                  >
                    Ir para a loja <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </a>
                </div>
                {selectedProduct && <PriceHistorySection product={selectedProduct} />}
              </>
            )}
          </div>
          {!modalLoading && selectedProduct && !modalError && (
            <div className="admin-modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button className="button button--primary" style={{ flex: 1, height: '54px', fontSize: '1rem' }} onClick={() => { addBasket(selectedProduct!); setSelectedProduct(null); }}>
                  <Plus size={20} style={{ marginRight: '8px' }} /> Adicionar à Cesta
                </button>
                <button className="button button--outline" style={{ height: '54px', padding: '0 1.5rem' }} onClick={() => { 
                  if (!user) {
                    setToast("Acesse sua conta para favoritar este produto.");
                    return;
                  }
                  toggleFavorite(String(selectedProduct!.id));
                }} aria-label={favorites.includes(String(selectedProduct!.id)) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                  <Heart size={20} fill={favorites.includes(String(selectedProduct!.id)) ? "currentColor" : "none"} />
                </button>
              </div>
              
              {/* Opção de Venda Online / Checkout Direto */}
              {selectedProduct!.establishmentSlug === "reboucas" && (
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <a 
                    href={`/checkout?product=${selectedProduct!.id}`}
                    className="button button--gold"
                    style={{ flex: 1, height: '54px', textDecoration: 'none', justifyContent: 'center' }}
                    onClick={(e) => {
                      e.preventDefault();
                      addBasket(selectedProduct!);
                      window.location.href = "/cesta";
                    }}
                  >
                    <ShoppingBasket size={20} style={{ marginRight: '8px' }} /> Comprar Agora
                  </a>
                  <a 
                    href="https://www.supermercadosreboucas.com.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="button button--outline"
                    style={{ height: '54px', width: '54px', padding: 0, justifyContent: 'center' }}
                    title="Ver no site da loja"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
              
              <button className="button button--ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => { 
                if (!user) {
                  setToast("Acesse sua conta para configurar alertas de preço.");
                  return;
                }
                saveAction("alert", "product", String(selectedProduct!.id)); 
                setSelectedProduct(null); 
              }}>
                <Bell size={18} style={{ marginRight: '8px' }} /> Criar Alerta de Preço
              </button>
            </div>
          )}
        </div>
      </div>
    )}


  </div>;
}

function PaymentHistory({ user }: { user: SessionProfile | null }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) { setLoading(false); return; }
    void (async () => {
      const { data } = await supabase
        .from("merchant_orders")
        .select("*")
        .eq("user_id", (user as any).id)
        .order("created_at", { ascending: false });
      if (data) setPayments(data);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ marginTop: '3rem' }}>
      <div className="section-heading compact">
        <h2>Histórico de Pagamentos</h2>
        <p>Acompanhe suas transações e assinaturas do Marketplace.</p>
      </div>
      
      <div className="price-table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : payments.length > 0 ? (
          payments.map(p => (
            <div key={p.id} className="price-row" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 8, background: 'var(--surface-3)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' 
                }}>
                  <CircleDollarSign size={20} />
                </div>
                <div>
                  <strong style={{ display: 'block' }}>{money(p.amount || 0)}</strong>
                  <small style={{ color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString()}</small>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', 
                  background: p.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: p.status === 'paid' ? 'var(--pc-color-success)' : 'var(--pc-color-danger)',
                  fontWeight: 600
                }}>
                  {p.status === 'paid' ? 'Concluído' : 'Pendente'}
                </span>
                {p.status !== 'paid' && (
                  <button className="button button--ghost button--small" style={{ gap: 4 }}>
                    <RotateCcw size={14} /> Re-tentar
                  </button>
                )}
                {p.status === 'paid' && (
                  <button className="button button--ghost button--small" title="Baixar comprovante">
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Nenhum pagamento registrado.</div>
        )}
      </div>
    </div>
  );
}
