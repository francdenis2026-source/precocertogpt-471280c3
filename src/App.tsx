import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProductCardQuickActions } from "./components/ProductCardQuickActions";
import { PersistentRadioProvider } from "./components/PersistentRadio";
import { DorinhaCommerceEnhancer } from "./components/DorinhaCommerceEnhancer";
import { UserAccountHub, UserAccountPage } from "./components/UserAccountExperience";
import { AdminLoginRedirect } from "./components/AdminLoginRedirect";
import { SingleBrowserTabGate } from "./components/SingleBrowserTabGate";
import { AdminProductEditorOverlay } from "./components/AdminProductEditorOverlay";
import { AdminVideoQuickAccess } from "./components/AdminVideoQuickAccess";
import { SeoRouteManager } from "./components/SeoRouteManager";
import { AdminMaintenanceControl, PlatformMaintenanceGate } from "./components/PlatformMaintenance";
import { FavoritesProvider } from "./features/favorites/FavoritesProvider";
import { ReferenceAuthPage, ReferenceFavoritesPage, ReferenceInfoPage, ReferenceNotFound, ReferenceStoresPage } from "./reference/ReferenceExperience";
import { MarketplaceSectorLanding, marketplaceSectors } from "./reference/MarketplaceSectors";
import { SectorHub2026 } from "./reference/SectorHub2026";
import { HomeNew2026 } from "./pages/HomeNew2026";
import { KellyBurgueriaPage } from "./pages/KellyBurgueriaPage";
import { PontoDoSandubaPage } from "./pages/PontoDoSandubaPage";
import "./reference/FooterSignatureRefinement.css";
import "./reference/FavoritesAndSectorStability.css";
import "./reference/ExploreViewportFit.css";
import "./reference/AdminCatalogWorkspaceEnhancements.css";
import "./reference/AdminPerformance.css";
import "./reference/MobileSearchStability.css";
import "./reference/MobileExperienceOverhaul2026.css";
import "./reference/UnifiedDesignSystem2026.css";
import "./reference/PublicReform2026.css";
import "./reference/HomeDesignPropagation2026.css";
import "./reference/DesktopLiveSearch2026.css";
import "./reference/MobileBundle2026.css";
import "./reference/LiveSearchOverlayStackFix2026.css";

const SearchDiscovery2026 = lazy(() => import("./reference/SearchDiscovery2026").then(module => ({ default: module.SearchDiscovery2026 })));
const ProductDetailProfessional = lazy(() => import("./reference/ProductDetailProfessional").then(module => ({ default: module.ProductDetailProfessional })));
const StoreDetailProfessional = lazy(() => import("./reference/StoreDetailProfessional").then(module => ({ default: module.StoreDetailProfessional })));
const CulturalProfilePage = lazy(() => import("./reference/CulturalProfilePage").then(module => ({ default: module.CulturalProfilePage })));
const DorinhaEditorialPage = lazy(() => import("./reference/DorinhaEditorialPage").then(module => ({ default: module.DorinhaEditorialPage })));
const MerchantOnboarding = lazy(() => import("./reference/MerchantOnboarding").then(module => ({ default: module.MerchantOnboarding })));
const ReferenceMerchantDashboard = lazy(() => import("./reference/ReferenceExperience").then(module => ({ default: module.ReferenceMerchantDashboard })));
const AdminControlCenter = lazy(() => import("./reference/AdminControlCenter").then(module => ({ default: module.AdminControlCenter })));
const AdminCatalogWorkspace = lazy(() => import("./reference/AdminCatalogWorkspace").then(module => ({ default: module.AdminCatalogWorkspace })));
const AdminEnvironmentsPage = lazy(() => import("./reference/AdminCatalogWorkspace").then(module => ({ default: module.AdminEnvironmentsPage })));
const AdminVideoStudio = lazy(() => import("./reference/AdminVideoStudio").then(module => ({ default: module.AdminVideoStudio })));
const SmartBasketPage = lazy(() => import("./reference/SmartBasketPage").then(module => ({ default: module.SmartBasketPage })));
const ProfessionalBasketPage = lazy(() => import("./reference/ProfessionalBasketPage").then(module => ({ default: module.ProfessionalBasketPage })));

function RouteFocusManager(){const location=useLocation();useEffect(()=>{if(location.pathname.startsWith('/admin'))return;const main=document.querySelector<HTMLElement>("#conteudo-principal, main");if(!main)return;if(!main.id)main.id="conteudo-principal";main.setAttribute("tabindex","-1");main.style.setProperty("outline","none","important");window.scrollTo({top:0,left:0,behavior:"auto"});window.requestAnimationFrame(()=>main.focus({preventScroll:true}));},[location.pathname]);return null;}
export default function App(){return <BrowserRouter><SingleBrowserTabGate><PersistentRadioProvider><FavoritesProvider><a className="pc-skip-link" href="#conteudo-principal">Pular para o conteúdo</a><SeoRouteManager/><RouteFocusManager/><DorinhaCommerceEnhancer/><AdminLoginRedirect/><AdminProductEditorOverlay/><AdminMaintenanceControl/><AdminVideoQuickAccess/><ProductCardQuickActions/><UserAccountHub/><PlatformMaintenanceGate><Suspense fallback={<main className="pc-route-loading" aria-label="Abrindo página" aria-busy="true"/>}><Routes>
<Route path="/" element={<HomeNew2026/>}/><Route path="/buscar" element={<SearchDiscovery2026/>}/><Route path="/explorar" element={<SectorHub2026/>}/>{marketplaceSectors.map(sector=><Route key={sector.id} path={sector.href} element={<MarketplaceSectorLanding sector={sector}/>}/>) }
<Route path="/produto/:identifier" element={<ProductDetailProfessional/>}/><Route path="/estabelecimentos" element={<ReferenceStoresPage/>}/><Route path="/kelly-burgueria" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/loja/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/:identifier" element={<StoreDetailProfessional/>}/><Route path="/loja/:identifier" element={<StoreDetailProfessional/>}/><Route path="/cesta" element={<ProfessionalBasketPage/>}/><Route path="/cesta-basica" element={<ProfessionalBasketPage/>}/><Route path="/cesta-inteligente" element={<SmartBasketPage/>}/><Route path="/favoritos" element={<ReferenceFavoritesPage/>}/><Route path="/minha-conta" element={<UserAccountPage/>}/>
<Route path="/login" element={<ReferenceAuthPage mode="login"/>}/><Route path="/cadastro" element={<ReferenceAuthPage mode="register"/>}/><Route path="/registrar" element={<ReferenceAuthPage mode="register"/>}/><Route path="/lojista" element={<MerchantOnboarding/>}/><Route path="/cadastro-lojista" element={<MerchantOnboarding/>}/><Route path="/quero-vender" element={<MerchantOnboarding/>}/><Route path="/painel-lojista/*" element={<ReferenceMerchantDashboard/>}/><Route path="/admin/catalogo" element={<AdminCatalogWorkspace/>}/><Route path="/admin/ambientes" element={<AdminEnvironmentsPage/>}/><Route path="/admin/videos" element={<AdminVideoStudio/>}/><Route path="/admin/*" element={<AdminControlCenter/>}/>
<Route path="/colaborar" element={<ReferenceInfoPage kind="collaborate"/>}/><Route path="/contato" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/fale-conosco" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/meus-pedidos" element={<ReferenceInfoPage kind="orders"/>}/><Route path="/cultura/*" element={<ReferenceInfoPage kind="culture"/>}/><Route path="/fremix-producoes" element={<CulturalProfilePage kind="fremix"/>}/><Route path="/autora/*" element={<DorinhaEditorialPage/>}/><Route path="/dorinha-barroso" element={<DorinhaEditorialPage/>}/><Route path="*" element={<ReferenceNotFound/>}/>
</Routes></Suspense></PlatformMaintenanceGate></FavoritesProvider></PersistentRadioProvider></SingleBrowserTabGate></BrowserRouter>}