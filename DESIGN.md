# Design System: PreçoCerto

This document describes the design system as it actually exists in the codebase after the
2026 professional redesign. It replaces an earlier version of this file that described a
token file and color palette that were never implemented.

## Direction

PreçoCerto is a hyperlocal price-comparison marketplace for Feijó, Acre. The visual language
is editorial and evidence-led: real catalog data, real store names, and real price ranges do
the persuasive work. The redesign's job was to replace roughly two dozen layered "polish"
CSS files — several of them contradicting each other — with one coherent system, and to
rebuild every page's markup on top of it.

## Tokens

The canonical token file is `src/reference/DesignSystem2.css`, imported once in `src/main.tsx`.
All tokens live under a `--pc-*` namespace and flip automatically for dark mode via
`html[data-theme="dark"]`. Legacy `--ref-*` variable names used throughout older page CSS are
bridged onto the same tokens by a single rule scoped to `.ref-page, .ref-auth, .ref-admin`, so
older files did not all need to be rewritten by hand to benefit from the real tokens.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#f4f6f5` | `#202428` |
| Surface | `#ffffff` | `#292e33` |
| Surface 2 | `#eaf0ed` | `#32383e` |
| Ink | `#17251d` | `#f5f7f5` |
| Muted | `#53645c` | `#c5cbd0` |
| Border | `#d3ded8` | `#4b555e` |
| Primary / verified price | `#17633f` | `#96ceb0` |
| Primary strong | `#104c30` | `#adddc2` |
| Accent | `#b77918` | `#edc778` |
| Alert | `#a63f2b` | `#f0a08a` |

O modo escuro usa uma escala mineral de carvão com luminosidade média, sem preto puro e
sem verde-floresta dominando grandes áreas. Verde é a única cor primária,
ouro é o accent e terracota aparece somente em alerta/erro. A camada
`GlobalMineralDark2026.css`, carregada após os estilos históricos, remapeia as
superfícies legadas para os mesmos papéis semânticos em todas as páginas.

`HomepageVisualRefinement2026.css`, carregado por último, conecta as variáveis
históricas `--nx-*` e `--mh-*` aos tokens canônicos. Ele também unifica player,
avatar, CTAs, categorias e dock sem criar outra paleta local.

Typography uses Manrope Variable as the canonical display/body family. Inter and Outfit remain
loaded for older page-specific rules while those surfaces migrate to the shared tokens.

## Primitives (Fase 1)

`DesignSystem2.css` also defines reusable primitive classes so new pages mostly need JSX, not
bespoke CSS: `.pc-shell` (page width), `.pc-section`, `.pc-btn` (primary/secondary/ghost/
danger/gold, with size variants), `.pc-field`/`.pc-input`/`.pc-select`/`.pc-textarea`,
`.pc-badge`/`.pc-chip`, `.pc-card`, `.pc-hero` (editorial image+scrim+content pattern),
`.pc-product-card`, `.pc-store-card`, `.pc-kpi-grid`/`.pc-kpi`, and a `.pc-chart` family
(line/area/bar) built to the house dataviz rules (single-hue magnitude/time encodings, no
decorative metrics, always paired with real numbers).

## Global chrome

`src/reference/ReferenceExperience.tsx` exports the header, footer and mobile dock used by
every public and account-facing page: `PublicHeader` (sticky, blurred, search/theme/account/
favorites actions, `.ref-header__actions` is a stable portal target for the authenticated
account menu), `PublicFooter`, and `AppDock` (a five-destination bottom bar — Início, Buscar,
Cesta, Lojas, Favoritos — shown only under 680px). Their styling lives in `Chrome2026.css`.
Product-detail and store-detail pages keep a persistent mobile action bar instead of the dock,
since a single conversion-focused CTA outperforms navigation chrome on a detail page.

## Page inventory and treatment

Public shopping pages (home, search, product detail, establishments, cesta, cesta inteligente,
favoritos, setores, institucional) share `PublicHeader`/`PublicFooter` and the primitives above,
and are fully theme-aware (light/dark). Home's hero, search results, product detail, the
establishment directory and the smart-basket planner were rebuilt on `Home2026.css`,
`SearchDiscovery2026.css`, `ProductDetailUltimate2026.css` and `Stores2026.css` respectively —
each page's CSS was consolidated from what was previously 3–5 competing files into one.

Authentication (`ReferenceAuthPage`), the merchant onboarding flow (`MerchantOnboarding`), and
the video-generation studio (`AdminVideoStudio`) use an intentional fixed-dark editorial
treatment rather than toggling with the site theme — the same pattern as the auth page's
photographic story panel. This is a deliberate choice for focused, conversion-oriented flows,
not a bug.

Admin (`AdminControlCenter`, `AdminCatalogWorkspace`) and the merchant dashboard
(`ReferenceMerchantDashboard`) use a navy sidebar with a gold active state, tokenized cards and
tabular KPIs. The admin *shell* is intentionally fixed-light for now (not dark-mode toggled):
these are internal operational tools, not the public storefront, and a partial dark-mode pass
that left cards white with light text would be worse than a consistent light theme. Full
dark-mode support for admin is a scoped follow-up, not attempted here.

## Business logic (unchanged)

The redesign only touched markup and CSS. All real logic was preserved exactly: Supabase-backed
auth and roles (`lib/roles.ts`), the product/store catalog with local fallback
(`data/remoteCatalog.ts`), localStorage-backed basket and smart-basket planner, favorites,
merchant application review, admin price/order/user management, and the Remotion video-export
pipeline. The merchant dashboard's KPI numbers are intentionally mocked, as they were before —
reconnecting them to real metrics is a functionality change outside this redesign's scope.

## Accessibility

- A skip link targets `#conteudo-principal`.
- Icon-only controls carry `aria-label`s; decorative icons are hidden from assistive tech where
  appropriate.
- Theme choice persists in `localStorage`, applied via `data-theme` and mirrored to
  `color-scheme`.
- `prefers-reduced-motion: reduce` is respected by the shared motion layer
  (`InteractionPolish.css`) and by page-specific animations.
- Status is never conveyed by color alone.

## Known follow-ups

- Admin/merchant-dashboard dark-mode support (see above).
- A handful of small, low-traffic surfaces (e.g. the account dropdown menu, error-message
  backgrounds on the auth form) intentionally keep a couple of hardcoded colors because they
  sit on an always-dark or always-neutral surface; this is documented in code rather than
  silently left inconsistent.
- Several now-unreachable CSS rules (from replaced bespoke headers/footers) were removed during
  the rewrite; a handful of very large, rarely-touched files (e.g. full admin CSS) were not
  audited rule-by-rule for leftover dead selectors, since they don't affect what renders.
