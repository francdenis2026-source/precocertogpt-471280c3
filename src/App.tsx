import "./performance/disableClientImageProcessing";
import "./performance/tolerantDomMutations";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PublicOnlineSalesAvailability } from "./components/PublicOnlineSalesAvailability";
import { DeveloperMarketplaceAbout } from "./components/DeveloperMarketplaceAbout";
import { ScrollPerformanceGuard } from "./components/ScrollPerformanceGuard";
import { EstablishmentsNavBridge } from "./components/EstablishmentsNavBridge";
import { FremixDirectoryBridge } from "./components/FremixDirectoryBridge";
import { FremixCuratedVideos } from "./components/FremixCuratedVideos";
import { BasketSessionFlow } from "./components/BasketSessionFlow";
import { AuthorMerchantDashboardWelcome } from "./components/AuthorMerchantDashboardWelcome";
import { MerchantBusinessSetupShortcut } from "./components/MerchantBusinessSetupShortcut";
import { MerchantDemoSwitcher } from "./components/MerchantDemoSwitcher";
import { RouteHead } from "./components/RouteHead";
import { FavoritesProvider } from "./features/favorites/FavoritesProvider";
import { CommerceIntentBridge } from "./features/favorites/CommerceIntentBridge";
import { GlobalDeveloperSignature } from "./components/GlobalDeveloperSignature";

const PrecoCertoApp = lazy(() => import("./PrecoCertoApp"));
const HomeNext = lazy(() => import("./pages/HomeNext").then(module => ({ default: module.HomeNext })));
const SmartCompareSearchProMax = lazy(() => import("./components/SmartCompareSearchProMax").then(module => ({ default: module.SmartCompareSearchProMax })));
const SavedFavoritesPage = lazy(() => import("./features/favorites/SavedFavoritesPage").then(module => ({ default: module.SavedFavoritesPage })));
const EstablishmentsMarketplacePage = lazy(() => import("./components/EstablishmentsMarketplacePage").then(module => ({ default: module.EstablishmentsMarketplacePage })));
const PublicEstablishmentCatalog = lazy(() => import("./components/PublicEstablishmentCatalog").then(module => ({ default: module.PublicEstablishmentCatalog })));
const DorinhaAuthorStoreProMax = lazy(() => import("./components/DorinhaAuthorStoreProMax").then(module => ({ default: module.DorinhaAuthorStoreProMax })));
const FremixProductionsPage = lazy(() => import("./components/FremixProductionsPage").then(module => ({ default: module.FremixProductionsPage })));
const MerchantOnboardingPage = lazy(() => import("./components/MerchantOnboardingPage").then(module => ({ default: module.MerchantOnboardingPage })));
const MerchantOnlineStoreRoute = lazy(() => import("./components/MerchantOnlineStoreRoute").then(module => ({ default: module.MerchantOnlineStoreRoute })));
const MerchantDashboard = lazy(() => import("./components/MerchantDashboard").then(module => ({ default: module.MerchantDashboard })));
const AuthorCatalogEditor = lazy(() => import("./components/AuthorCatalogEditor").then(module => ({ default: module.AuthorCatalogEditor })));
const MerchantManagementCenter = lazy(() => import("./components/MerchantManagementCenter").then(module => ({ default: module.MerchantManagementCenter })));
const MerchantCatalogStudio = lazy(() => import("./components/MerchantCatalogStudio").then(module => ({ default: module.MerchantCatalogStudio })));
const MerchantBusinessSetup = lazy(() => import("./components/MerchantBusinessSetup").then(module => ({ default: module.MerchantBusinessSetup })));
const MerchantOnlineSalesControl = lazy(() => import("./components/MerchantOnlineSalesControl").then(module => ({ default: module.MerchantOnlineSalesControl })));
const CustomerOrders = lazy(() => import("./components/CustomerOrders").then(module => ({ default: module.CustomerOrders })));
const MercadoPagoCallback = lazy(() => import("./components/MercadoPagoCallback").then(module => ({ default: module.MercadoPagoCallback })));
const PlatformAdminDashboard = lazy(() => import("./components/PlatformAdminDashboard").then(module => ({ default: module.PlatformAdminDashboard })));
const AdminMerchantManagement = lazy(() => import("./components/AdminMerchantManagement").then(module => ({ default: module.AdminMerchantManagement })));
const CollaboratePage = lazy(() => import("./components/PublicFooterServicePages").then(module => ({ default: module.CollaboratePage })));
const ContactPage = lazy(() => import("./components/PublicFooterServicePages").then(module => ({ default: module.ContactPage })));
const PharmaciesPage = lazy(() => import("./components/PublicFooterServicePages").then(module => ({ default: module.PharmaciesPage })));

function RouteLoading() {
  return <main className="pc-route-loading" aria-live="polite"><span aria-hidden="true" /><strong>Preparando o PreçoCerto…</strong></main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <CommerceIntentBridge />
        <DeveloperMarketplaceAbout />
        <ScrollPerformanceGuard />
        <PublicOnlineSalesAvailability />
        <MerchantBusinessSetupShortcut />
        <MerchantDemoSwitcher />
        <EstablishmentsNavBridge />
        <FremixDirectoryBridge />
        <FremixCuratedVideos />
        <BasketSessionFlow />
        <AuthorMerchantDashboardWelcome />
        <RouteHead />
        <Suspense fallback={<RouteLoading />}><Routes>
          <Route path="/" element={<HomeNext />} />
          <Route path="/buscar" element={<SmartCompareSearchProMax />} />
          <Route path="/favoritos" element={<SavedFavoritesPage />} />
          <Route path="/estabelecimentos" element={<EstablishmentsMarketplacePage />} />
          <Route path="/estabelecimento/dorinha-barroso-livros" element={<DorinhaAuthorStoreProMax />} />
          <Route path="/estabelecimento/:identifier" element={<PublicEstablishmentCatalog />} />
          <Route path="/cultura/fremix-producoes" element={<FremixProductionsPage />} />
          <Route path="/fremix-producoes" element={<FremixProductionsPage />} />
          <Route path="/autora/dorinha-barroso" element={<DorinhaAuthorStoreProMax />} />
          <Route path="/dorinha-barroso" element={<DorinhaAuthorStoreProMax />} />
          <Route path="/lojista" element={<MerchantOnboardingPage />} />
          <Route path="/loja/:merchantId" element={<MerchantOnlineStoreRoute />} />
          <Route path="/painel-lojista" element={<MerchantDashboard />} />
          <Route path="/painel-lojista/autora" element={<AuthorCatalogEditor />} />
          <Route path="/painel-lojista/gestao" element={<MerchantManagementCenter />} />
          <Route path="/painel-lojista/catalogo" element={<MerchantCatalogStudio />} />
          <Route path="/painel-lojista/configurar-negocio" element={<MerchantBusinessSetup />} />
          <Route path="/painel-lojista/vendas-online" element={<MerchantOnlineSalesControl />} />
          <Route path="/meus-pedidos" element={<CustomerOrders />} />
          <Route path="/integracoes/mercadopago/callback" element={<MercadoPagoCallback />} />
          <Route path="/admin/plataforma" element={<PlatformAdminDashboard />} />
          <Route path="/admin/comercios" element={<AdminMerchantManagement />} />
          <Route path="/colaborar" element={<CollaboratePage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/fale-conosco" element={<ContactPage />} />
          <Route path="/farmacias" element={<PharmaciesPage />} />
          <Route path="*" element={<PrecoCertoApp />} />
        </Routes></Suspense>
        <GlobalDeveloperSignature />
      </FavoritesProvider>
    </BrowserRouter>
  );
}
