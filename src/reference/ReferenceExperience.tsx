import { FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell, Building2,
  Check, CircleDollarSign, Eye, Heart, LayoutDashboard, ListChecks, LockKeyhole, Map as MapIcon,
  MapPin, Menu, Minus, Moon, PackageSearch, Plus, Search, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Store, Sun, Tag, Trash2, TrendingDown, UserRound, UsersRound, X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product, verifiedDatasetMetrics } from "../data/catalog";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { getStoreLogoUrl } from "../data/storeLogos";
import { loadPlatformSummary } from "../lib/merchantPlatform";
import { loadSessionProfile, requestPasswordReset, signIn, signUp } from "../lib/roles";
import { useFavorites } from "../features/favorites/FavoritesProvider";
import { OnlinePresence } from "../components/OnlinePresence";
import { SectorNavigator, getMarketplaceSector, inferProductSector, type MarketplaceSectorId } from "./MarketplaceSectors";
import "./ReferenceExperience.css";
import "./ReferencePages.css";
import "./ReferencePagesMore.css";
import "./ReferenceResponsive.css";
import "./CompactShell.css";
import "./TypographyScale.css";
import "./HomeStoryRefinement.css";
import "./InteractionPolish.css";
import "./DarkThemeRefinement.css";
import "./ProductCardRefinement.css";
import "./SearchResultsRefinement.css";
import "./MobileAppRefinement.css";
import "./ProductComparisonRefinement.css";
import "./HomepageCompactDensity.css";

const initialCatalog = buildCatalog();
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentage = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("pt-BR");

function ProductRangeSummary({ product }: { product: Product }) {
  const storeCount = product.storeCount || product.offers?.length || 1;
  const min = product.minPrice || product.bestPrice || 0;
  const max = product.maxPrice || product.bestPrice || 0;
  const savings = Math.max(0, max - min);
  return (
    <span className="ref-product-range-summary">
      <small>{storeCount} {storeCount === 1 ? "local" : "locais"}</small>
      <strong>{brl.format(min)}</strong>
      {savings > 0.009 ? <em>economia de {brl.format(savings)}</em> : null}
    </span>
  );
}
