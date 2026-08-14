# PreçoCerto Design System

## Architecture

`src/styles/DesignTokens.css` uses primitive, semantic and component layers. Components consume semantic roles; hard-coded colors are limited to authored imagery overlays and the receipt artifact.

## Core system

| Role | Value | Use |
|---|---|---|
| Canvas | `#F1EADF` | page atmosphere |
| Surface | `#FBF8F1` | controls, products, dialog |
| Ink | `#18211C` | main copy |
| Primary | `#17493A` | action and verified best price |
| Accent | `#A84D2C` | primary conversion and emphasis |
| Border | `#D9D0C1` | structure |

Display uses Outfit Variable; interface copy uses Manrope Variable. Prices use tabular numerals. Touch targets are at least 44×44px.

## Responsive contract

- 360–520px: single-column content, 3 compact product rows, modal becomes bottom sheet.
- 768px: 2-column product grid and stacked hero.
- 1024px: 4 products, mobile navigation, split hero.
- 1440px: 1180px shell and 5 products.

All headings use balanced wrapping. Long product names clamp to 2 lines. No viewport may introduce horizontal page scrolling.

## Interaction contract

- Search keeps a visible programmatic label, keyboard listbox behavior and URL-backed navigation.
- Dialog traps focus, closes on Escape or backdrop and restores focus.
- Loading has a polite live status and skeletons matching the final cards.
- Focus is visible, dark mode maps semantic tokens and reduced motion removes displacement.
