import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProductCardQuickActions } from "./components/ProductCardQuickActions";
import { UserAccountHub, UserAccountPage } from "./components/UserAccountExperience";
import { AdminLoginRedirect } from "./components/AdminLoginRedirect";
import { AdminProductEditorOverlay } from "./components/AdminProductEditorOverlay";
import { AdminVideoQuickAccess } from "./components/AdminVideoQuickAccess";
import { SeoRouteManager } from "./components/SeoRouteManager";
import { AdminMaintenanceControl, PlatformMaintenanceGate } from "./components/PlatformMaintenance";
import { FavoritesProvider } from "./features/favorites/FavoritesProvider";
import { ReferenceAuthPage, ReferenceFavoritesPage, ReferenceInfoPage, ReferenceMerchantDashboard, ReferenceNotFound, ReferenceStoresPage } from "./reference/ReferenceExperience";
import { SearchDiscovery2026 } from "./reference/SearchDiscovery2026";
import { ProductDetailProfessional } from "./reference/ProductDetailProfessional";
import { StoreDetailProfessional } from "./reference/StoreDetailProfessional";
import { CulturalProfilePage } from "./reference/CulturalProfilePage";
import { DorinhaEditorialPage } from "./reference/DorinhaEditorialPage";
import { MarketplaceSectorLanding, marketplaceSectors } from "./reference/MarketplaceSectors";
import { SectorHub2026 } from "./reference/SectorHub2026";
import { MerchantOnboarding } from "./reference/MerchantOnboarding";
import { AdminControlCenter } from "./reference/AdminControlCenter";
import { AdminCatalogWorkspace, AdminEnvironmentsPage } from "./reference/AdminCatalogWorkspace";
import { AdminVideoStudio } from "./reference/AdminVideoStudio";
import { SmartBasketPage } from "./reference/SmartBasketPage";
import { ProfessionalBasketPage } from "./reference/ProfessionalBasketPage";
import { HomeProfessional2026 } from "./pages/HomeProfessional2026";
import { KellyBurgueriaPage } from "./pages/KellyBurgueriaPage";
import { PontoDoSandubaPage } from "./pages/PontoDoSandubaPage";
import "./reference/FooterSignatureRefinement.css";
import "./reference/FavoritesAndSectorStability.css";
import "./reference/ExploreViewportFit.css";
import "./reference/AdminCatalogWorkspaceEnhancements.css";
import "./reference/AdminPerformance.css";
import "./reference/MobileProfessionalRefinement.css";
import "./reference/ImpeccableGlobalRefinement.css";
import "./reference/MobileSearchStability.css";
import "./reference/MobileHomepageCompactFinal.css";
import "./reference/HomeVisualIdentity2026.css";
import "./reference/MobileProMax2026.css";
import "./reference/MobileVisualRefresh2026.css";
import "./reference/SectorProfessional2026.css";
import "./reference/PublicExperienceFinal2026.css";
import "./reference/SearchMobileRequest2026.css";
import "./reference/ProModern2026.css";
import "./reference/TypographyHarmony2026.css";
import "./reference/MobileExperienceOverhaul2026.css";
import "./reference/UiUxProMaxSystem2026.css";
import "./reference/UiStylingSystem2026.css";
import "./reference/UiTypographySystem2026.css";
import "./reference/DesignTasteFrontendSystem2026.css";
import "./reference/EmilDesignEngineeringSystem2026.css";

function RouteFocusManager(){const location=useLocation();useEffect(()=>{if(location.pathname.startsWith('/admin'))return;const main=document.querySelector<HTMLElement>("#conteudo-principal, main");if(!main)return;if(!main.id)main.id="conteudo-principal";main.setAttribute("tabindex","-1");window.scrollTo({top:0,left:0,behavior:"auto"});window.requestAnimationFrame(()=>main.focus({preventScroll:true}));},[location.pathname]);return null;}
export default function App(){return <BrowserRouter><FavoritesProvider><a className="pc-skip-link" href="#conteudo-principal">Pular para o conteúdo</a><SeoRouteManager/><RouteFocusManager/><AdminLoginRedirect/><AdminProductEditorOverlay/><AdminMaintenanceControl/><AdminVideoQuickAccess/><ProductCardQuickActions/><UserAccountHub/><PlatformMaintenanceGate><Routes>
<Route path="/" element={<HomeProfessional2026/>}/><Route path="/buscar" element={<SearchDiscovery2026/>}/><Route path="/explorar" element={<SectorHub2026/>}/>{marketplaceSectors.map(sector=><Route key={sector.id} path={sector.href} element={<MarketplaceSectorLanding sector={sector}/>}/>) }
<Route path="/produto/:identifier" element={<ProductDetailProfessional/>}/><Route path="/estabelecimentos" element={<ReferenceStoresPage/>}/><Route path="/kelly-burgueria" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/loja/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/:identifier" element={<StoreDetailProfessional/>}/><Route path="/loja/:identifier" element={<StoreDetailProfessional/>}/><Route path="/cesta" element={<ProfessionalBasketPage/>}/><Route path="/cesta-basica" element={<ProfessionalBasketPage/>}/><Route path="/cesta-inteligente" element={<SmartBasketPage/>}/><Route path="/favoritos" element={<ReferenceFavoritesPage/>}/><Route path="/minha-conta" element={<UserAccountPage/>}/>
<Route path="/login" element={<ReferenceAuthPage mode="login"/>}/><Route path="/cadastro" element={<ReferenceAuthPage mode="register"/>}/><Route path="/registrar" element={<ReferenceAuthPage mode="register"/>}/><Route path="/lojista" element={<MerchantOnboarding/>}/><Route path="/cadastro-lojista" element={<MerchantOnboarding/>}/><Route path="/quero-vender" element={<MerchantOnboarding/>}/><Route path="/painel-lojista/*" element={<ReferenceMerchantDashboard/>}/><Route path="/admin/catalogo" element={<AdminCatalogWorkspace/>}/><Route path="/admin/ambientes" element={<AdminEnvironmentsPage/>}/><Route path="/admin/videos" element={<AdminVideoStudio/>}/><Route path="/admin/*" element={<AdminControlCenter/>}/>
<Route path="/colaborar" element={<ReferenceInfoPage kind="collaborate"/>}/><Route path="/contato" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/fale-conosco" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/meus-pedidos" element={<ReferenceInfoPage kind="orders"/>}/><Route path="/cultura/*" element={<ReferenceInfoPage kind="culture"/>}/><Route path="/fremix-producoes" element={<CulturalProfilePage kind="fremix"/>}/><Route path="/autora/*" element={<DorinhaEditorialPage/>}/><Route path="/dorinha-barroso" element={<DorinhaEditorialPage/>}/><Route path="*" element={<ReferenceNotFound/>}/>
</Routes></PlatformMaintenanceGate></FavoritesProvider></BrowserRouter>}
