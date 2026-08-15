# Design System: PreçoCerto

## Direction and provenance

PreçoCerto is a hyperlocal buying companion for Feijó. The final 2026 redesign follows the deterministic concept seed **`3859b976`** and is built around a live economy receipt rather than a generic, card-heavy marketplace. Its world is the neighborhood market interpreted with editorial restraint: mineral paper, charcoal ink, one amber action color and documentary local photography.

The product remains evidence-led. Real catalog data, store names, price ranges and collection context do the persuasive work; unsupported savings and decorative metrics do not. Public shopping, authentication, establishment, merchant and administration routes share the same visual vocabulary without changing their business flows.

## Tokens

The canonical global tokens live in `PrecoCertoReform2026.css`. Compatibility aliases (`--blue`, `--gold`, `--green`, `--bg`, `--surface`, `--navy`, `--muted`, `--border`) resolve to these roles so inherited screens remain coherent.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#F3F4F2` | `#111214` |
| Surface / card | `#FFFFFF` | `#191A1E` |
| Dialog | `#FFFFFF` | `#1D1E22` |
| Foreground | `#17181C` | `#F5F3EC` |
| Muted text | `#60656F` | `#B6B8BF` |
| Border | `#D9DCE1` | `#35373D` |
| Primary action amber | `#8A570F` | `#D69A43` |
| Expressive amber | `#B7791F` | `#D69A43` |
| Primary hover | `#6F4309` | `#E7AD58` |
| Primary foreground | `#FFFFFF` | `#17130D` |
| Success / verified saving | `#19733D` | `#61C184` |
| Danger | `#B42335` | `#FF8B98` |
| Focus | `#8A570F` | `#EFB251` |

- Shadows: card `0 12px 32px rgb(23 24 28 / 7%)`, dialog `0 32px 100px rgb(0 0 0 / 35%)`; dark variants increase opacity for separation.
- Radii: controls 8px, cards 10px and panels 14px. Receipt paper intentionally stays nearly square.
- Motion tokens: fast 150ms and normal 240ms, both `cubic-bezier(.2,.8,.2,1)`.
- The browser theme color is charcoal `#17181C`.

## Typography and imagery

- Display: Outfit Variable for headings and brand wordmarks, normally with tight tracking and balanced lines.
- Interface and body: Manrope Variable, with Inter/system UI fallbacks.
- Prices, comparisons and admin KPIs use tabular numerals.
- Product names clamp where needed; metadata remains legible and secondary.
- The home hero uses `/hero-feijo-real-shopper-2026.webp`; the comparison hero uses `/hero-precocerto-comparacao-v2.webp`; establishments use `/marketplace-local-profissional-v2.webp`; authentication uses `/auth-market-hero-v2.webp`.
- The shared canvas uses the lightweight 56 KB `/banners/feijo-marketplace-bg.webp` as a soft-light background layer; the former 2.1 MB PNG is not loaded globally.
- Photography is darkened and desaturated beneath directional charcoal overlays. It supplies locality and atmosphere while preserving foreground contrast.
- Product images declare intrinsic `220 × 180` dimensions, load lazily and fall back to a package icon when unavailable on the home.

## Home and hero

The desktop shell is capped at 1180px with 20px side gutters. The header begins absolute over the hero, includes a compact local-status utility row, and becomes a fixed, blurred charcoal surface after 54px of scroll.

The hero is a 720px editorial field with an asymmetric two-column composition. Its primary copy is the two-line promise **“Compare antes / de comprar.”**, followed by a single decisive search field, live suggestions and quick queries for arroz, café and carnes. The search matches normalized tokens across product name, brand, category, establishment and size, ranks up to 12 suggestions, and exposes results as a labeled listbox.

The right column contains the signature **economy receipt**, populated from the featured product with the largest current price spread. It shows the real saving (`maxPrice - minPrice`), minimum and maximum price, a real offer count when offers exist (otherwise the known establishment), a route to the full comparison and the caveat “Coleta local · verifique antes de sair”. Monospace metadata, dashed rules, a torn-paper edge, a slight desktop rotation and semantic green distinguish it from ordinary cards. On mobile the receipt remains visible, loses the rotation and uses a smaller hard shadow.

Below the hero, verified catalog metrics, leading establishments, products with visible price variation, category shortcuts, the smart-basket story and the merchant invitation continue the same evidence-first narrative. Metrics come from the catalog payload rather than presentation-only constants.

## Search and comparison

The comparison route is denser than the home and focuses on proportional value: price per kilogram, liter or unit is compared only for compatible measures. Search state uses the `q` URL parameter.

Directly under the search field, a horizontally scrollable filter rail presents **Todos** plus up to seven categories derived from the current product catalog. The active category is an `aria-pressed` chip and is synchronized to the `c` URL parameter; selecting Todos removes `c`. The rail also includes a direct **Minha cesta** action. Results are filtered by both query and category, exclude invalid/non-positive prices, and are capped at 48 items.

Cards remain compact, use quiet borders and reveal amber emphasis and shadow on hover. Value groups display compatible package variants, the best proportional offer and calculated saving. Favorites, establishment links and the add-to-basket path remain available.

## Responsive navigation

At 680px and below, the home becomes app-like:

- the utility row and desktop login action are hidden;
- the hero stacks, the search submit becomes an icon action and quick queries scroll horizontally;
- metrics, stores, products and categories become touch-friendly horizontal rails with scroll snapping;
- a fixed 69px bottom dock appears with five destinations: **Início, Buscar, Cesta, Lojas, Favoritos**;
- safe-area insets are respected and only the home reserves 70px of bottom space for its dock;
- the footer reserves additional clearance for the dock.

The mobile menu remains a separate compact navigation path for secondary destinations. At 900px the hero stacks and operational sidebars collapse into the document flow.

## Modals and overlays

Home product details and comparison details render in a portal on `document.body` with `role="dialog"`, `aria-modal="true"` and a product-specific accessible label. The page prevents body scrolling while a product dialog is open. Opening moves focus to the first dialog control, Tab and Shift+Tab remain within it, Escape closes it, and closing restores the previous focus.

Desktop dialog cards are capped at 920px wide and `min(720px, 100dvh - 32px)` high, with contained overscroll, a blurred dark backdrop and a two-column media/detail layout. At 680px and below they become full-width bottom sheets, capped at 88dvh, with a 14px rounded top and a single-column layout.

The hero search suggestions are an anchored listbox, not a modal. Escape closes both suggestions and product details.

## Motion

Home entrance and reveal motion uses GSAP scoped to the home root:

- hero copy rises 22px and fades in over 650ms with a 70ms stagger;
- the receipt enters 30px from the right with a small rotation over 800ms;
- content sections, basket and merchant bands rise 26px and fade once when their top reaches 88% of the viewport, via ScrollTrigger.

CSS interactions use the fast/normal motion tokens and explicit properties. Hover lift is modest and reserved for pointer feedback. When `prefers-reduced-motion: reduce` is active, the GSAP sequence is not created; smooth scrolling is disabled and home/comparison CSS animations and transitions collapse to 0.01ms.

## Shared public and operational surfaces

- **Establishments:** charcoal editorial hero with local market photography, amber kicker/action, compact filters, 8px cards and quiet default shadows. Store cards gain border and shadow only on hover.
- **Authentication:** full-height split surface with photographic brand panel, mineral/charcoal form side, tokenized inputs and restrained 7–10px radii. Login, recovery and role-specific flows are preserved; recovery uses a neutral example address rather than personal data.
- **Merchant and basket:** dense bordered modules, reduced gaps and amber primary actions. Basket steps, summaries and item rows use the same compact surface system.
- **Administration:** charcoal sidebar, amber active state, tokenized cards/dialogs/inputs and tabular KPI, price and positive values. At narrow widths the sidebar returns to normal flow and the main padding tightens.
- **Global chrome:** inherited public headers use translucent tokenized surfaces and blur; footers and the global signature use charcoal with amber emphasis.

## Accessibility and interaction rules

- A visible-on-focus skip link targets `#conteudo-principal`, which is programmatically focusable.
- Keyboard focus uses a 3px tokenized outline with 3px offset.
- Icon-only controls have accessible labels; decorative icons are hidden where appropriate.
- Theme choice is stored in `localStorage`, applied through `data-theme` and mirrored to `color-scheme`.
- Pressable controls use touch manipulation; principal navigation and modal controls preserve comfortable touch geometry.
- Status is never conveyed by color alone, and monetary green remains semantic rather than structural.

## Bans

- No navy/lime legacy theme, neon, glow or gradient text.
- No fake metrics, generic benefit cards or unsupported savings.
- No decorative kicker above every heading.
- No repeated entrance animation, `transition: all`, `scale(0)` or motion on keyboard actions.
- No image without intrinsic dimensions, unlabeled icon action or color-only state.
- Do not describe aspirational accessibility behavior as shipped behavior; document the implementation that exists.
