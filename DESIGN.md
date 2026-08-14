# Design System: PreçoCerto

## Visual world

PreçoCerto is a hyperlocal buying companion for Feijó. Its world is the neighborhood market interpreted with editorial restraint: mineral parchment, rubber-tree green and a single copper signal. The page feels warm and civic, not rustic, futuristic or generic. The homepage persuades through real price evidence; operational areas remain denser and quieter.

The signature object is the **economy receipt**: familiar, factual and connected to live catalog data. Photography provides atmosphere at page scale; UI chrome never competes with it.

## Color roles

- **Mineral parchment** `#F1EADF`: page canvas.
- **Paper** `#FBF8F1`: readable and elevated surfaces.
- **Ink** `#18211C`: primary text.
- **Evidence gray** `#5D675F`: secondary copy and metadata.
- **Quiet line** `#D9D0C1`: structural boundaries.
- **Rubber-tree green** `#17493A`: primary actions, best-price evidence and trust.
- **Copper** `#A84D2C`: the only expressive accent, reserved for primary conversion and meaningful emphasis; dark enough for white action labels.

Dark mode uses `#101914` canvas, `#18231D` surfaces and `#F5EFE5` text. Status colors remain semantic and never become brand decoration.

## Typography

- Display: Outfit Variable, used with restraint at weights 560–650, maximum 6rem and tracking no tighter than `-0.04em`.
- Interface and body: Manrope Variable.
- Prices and comparisons use tabular numerals.
- Headings balance lines; names clamp to 2 lines; metadata never drops below 12px.

## Components and layout

- Shell maximum: 1180px, with adaptive gutters.
- Header: fixed and compact; transparent over hero, opaque with blur after scroll.
- Hero: asymmetric search plus live economy receipt. It is never centered or metric-led.
- Categories: one compact bordered strip, not a card wall.
- Products: 5 columns wide, 4 at 1024px, 2 at tablet, compact horizontal rows on phones.
- Editorial bands: real WebP imagery, strong overlay, DOM copy and real links.
- Modal: 620px maximum, 80vh, focus trapped, Escape closes immediately, mobile bottom sheet.
- Every pressable target is at least 44px, keyboard focus is visible and loading uses geometry-matched skeletons.

## Motion

Motion is crisp and functional. Header opacity communicates scroll state; button compression confirms touch; modal movement prevents a jarring interruption. Search and keyboard actions remain instant. UI motion stays under 300ms with `cubic-bezier(.23,1,.32,1)`. Hover movement is mouse-only. Reduced motion removes displacement but preserves brief opacity feedback.

## Bans

- No navy/lime legacy theme, neon, glow or gradient text.
- No fake metrics, generic benefit cards or unsupported savings.
- No decorative kickers above every heading.
- No repeated entrance animation, `transition: all`, `scale(0)` or movement on keyboard actions.
- No image without dimensions, unlabeled icon action or color-only state.
