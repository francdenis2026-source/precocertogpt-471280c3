import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { FooterDeveloperInfo } from "./components/FooterDeveloperInfo";
import { ProductCardQuickActions } from "./components/ProductCardQuickActions";
import { UserAccountHub, UserAccountPage } from "./components/UserAccountExperience";
import { AdminLoginRedirect } from "./components/AdminLoginRedirect";
import { AdminProductEditorOverlay } from "./components/AdminProductEditorOverlay";
import { SeoRouteManager } from "./components/SeoRouteManager";
import { HomeSmartBasketSpotlight } from "./components/HomeSmartBasketSpotlight";
import { FavoritesProvider } from "./features/favorites/FavoritesProvider";
import { ReferenceAuthPage, ReferenceBasketPage, ReferenceFavoritesPage, ReferenceHome, ReferenceInfoPage, ReferenceMerchantDashboard, ReferenceNotFound, ReferenceSearchPage, ReferenceStoresPage } from "./reference/ReferenceExperience";
import { ProductDetailProfessional } from "./reference/ProductDetailProfessional";
import { StoreDetailProfessional } from "./reference/StoreDetailProfessional";
import { CulturalProfilePage } from "./reference/CulturalProfilePage";
import { MarketplaceExplorePage, MarketplaceSectorLanding, marketplaceSectors } from "./reference/MarketplaceSectors";
import { MerchantOnboarding } from "./reference/MerchantOnboarding";
import { AdminControlCenter } from "./reference/AdminControlCenter";
import { AdminCatalogWorkspace, AdminEnvironmentsPage } from "./reference/AdminCatalogWorkspace";
import { SmartBasketPage } from "./reference/SmartBasketPage";
import "./reference/FooterSignatureRefinement.css";
import "./reference/FavoritesAndSectorStability.css";
import "./reference/ExploreViewportFit.css";
import "./reference/AdminCatalogWorkspaceEnhancements.css";
import "./reference/AdminPerformance.css";
import "./reference/MobileProfessionalRefinement.css";

function RouteFocusManager(){const location=useLocation();useEffect(()=>{if(location.pathname.startsWith('/admin'))return;const main=document.querySelector<HTMLElement>("#conteudo-principal, main");if(!main)return;if(!main.id)main.id="conteudo-principal";main.setAttribute("tabindex","-1");window.scrollTo({top:0,left:0,behavior:"auto"});window.requestAnimationFrame(()=>main.focus({preventScroll:true}));},[location.pathname]);return null;}
export default function App(){return <BrowserRouter><FavoritesProvider><a className="pc-skip-link" href="#conteudo-principal">Pular para o conteúdo</a><SeoRouteManager/><RouteFocusManager/><AdminLoginRedirect/><AdminProductEditorOverlay/><ProductCardQuickActions/><FooterDeveloperInfo/><UserAccountHub/><HomeSmartBasketSpotlight/><Routes>
<Route path="/" element={<ReferenceHome/>}/><Route path="/buscar" element={<ReferenceSearchPage/>}/><Route path="/explorar" element={<MarketplaceExplorePage/>}/><Route path="/mercados" element={<MarketplaceSectorLanding sector={marketplaceSectors[0]}/>}/><Route path="/farmacias" element={<MarketplaceSectorLanding sector={marketplaceSectors[1]}/>}/><Route path="/padarias" element={<MarketplaceSectorLanding sector={marketplaceSectors[2]}/>}/><Route path="/livros" element={<MarketplaceSectorLanding sector={marketplaceSectors[3]}/>}/><Route path="/servicos" element={<MarketplaceSectorLanding sector={marketplaceSectors[4]}/>}/>
<Route path="/produto/:identifier" element={<ProductDetailProfessional/>}/><Route path="/estabelecimentos" element={<ReferenceStoresPage/>}/><Route path="/estabelecimento/:identifier" element={<StoreDetailProfessional/>}/><Route path="/loja/:identifier" element={<StoreDetailProfessional/>}/><Route path="/cesta" element={<ReferenceBasketPage/>}/><Route path="/cesta-basica" element={<ReferenceBasketPage/>}/><Route path="/cesta-inteligente" element={<SmartBasketPage/>}/><Route path="/favoritos" element={<ReferenceFavoritesPage/>}/><Route path="/minha-conta" element={<UserAccountPage/>}/>
<Route path="/login" element={<ReferenceAuthPage mode="login"/>}/><Route path="/cadastro" element={<ReferenceAuthPage mode="register"/>}/><Route path="/registrar" element={<ReferenceAuthPage mode="register"/>}/><Route path="/lojista" element={<MerchantOnboarding/>}/><Route path="/cadastro-lojista" element={<MerchantOnboarding/>}/><Route path="/quero-vender" element={<MerchantOnboarding/>}/><Route path="/painel-lojista/*" element={<ReferenceMerchantDashboard/>}/><Route path="/admin/catalogo" element={<AdminCatalogWorkspace/>}/><Route path="/admin/ambientes" element={<AdminEnvironmentsPage/>}/><Route path="/admin/*" element={<AdminControlCenter/>}/>
<Route path="/colaborar" element={<ReferenceInfoPage kind="collaborate"/>}/><Route path="/contato" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/fale-conosco" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/meus-pedidos" element={<ReferenceInfoPage kind="orders"/>}/><Route path="/cultura/*" element={<ReferenceInfoPage kind="culture"/>}/><Route path="/fremix-producoes" element={<CulturalProfilePage kind="fremix"/>}/><Route path="/autora/*" element={<CulturalProfilePage kind="dorinha"/>}/><Route path="/dorinha-barroso" element={<CulturalProfilePage kind="dorinha"/>}/><Route path="*" element={<ReferenceNotFound/>}/>
</Routes></FavoritesProvider></BrowserRouter>}
