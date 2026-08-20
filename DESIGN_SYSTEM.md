# PreçoCerto Design System — quick reference

See `DESIGN.md` for the full write-up. This file is a short pointer so both don't drift again.

- Tokens: `src/reference/DesignSystem2.css` (`--pc-*` namespace, light/dark via
  `html[data-theme="dark"]`). Legacy `--ref-*` names are bridged onto the same tokens.
- Typography: Outfit Variable (display) + Inter Variable (body). No Manrope.
- Chrome: `PublicHeader` / `PublicFooter` / `AppDock` in `src/reference/ReferenceExperience.tsx`.
- Primitives: `.pc-shell`, `.pc-btn`, `.pc-field`/`.pc-input`, `.pc-card`, `.pc-hero`,
  `.pc-product-card`, `.pc-store-card`, `.pc-kpi-grid`, `.pc-chart` — all in `DesignSystem2.css`.
- Touch targets ≥44×44px; long product names clamp to 2 lines; no viewport introduces
  horizontal page scroll.
- Search keeps a visible label, keyboard listbox behavior and URL-backed state; dialogs trap
  focus, close on Escape/backdrop, and restore focus on close.
