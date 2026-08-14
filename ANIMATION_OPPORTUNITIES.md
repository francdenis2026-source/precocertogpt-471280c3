# Animation Opportunities — Homepage

The homepage already animates search suggestions, the mobile menu and the product dialog. This review deliberately recommends only two additions.

## Part 1 — Opportunities

| # | Location | Today | Purpose | Frequency | Suggested motion |
|---|---|---|---|---|---|
| 1 | `src/pages/HomePremium.tsx:355-357` | Metrics replace `—` with final numbers instantly after catalog loading | Preventing a jarring change | Occasional, once per page load | Fade only the metric value from `opacity: .55` to `1` over `180ms var(--pc-ease-out)`. Keep layout dimensions fixed; no count-up animation because users need to read data, not watch it perform. Under reduced motion, use an `80ms` opacity transition without translation. |
| 2 | `src/pages/HomePremium.css:232` | Store rows have hover transition but no tactile press confirmation | Feedback | Tens per day at most | Add `:active { transform: translateY(1px); }` with `transition: border-color 150ms ease-in-out, transform 150ms var(--pc-ease-out)`. Apply only to direct manipulation; no entrance or stagger. |

## Gate record

### 1. Metric resolution

- **Frequency:** occasional — eligible.
- **Purpose:** preventing a jarring change — passes.
- **Speed:** 180ms — inside the UI budget.
- **Function:** opacity bridges loading and data without moving the value — passes.

### 2. Store press feedback

- **Frequency:** tens per day — only near-imperceptible feedback is acceptable.
- **Purpose:** feedback — passes.
- **Speed:** 150ms — inside the press budget.
- **Function:** confirms touch without moving readable price data — passes.

## Part 2 — Rejected candidates

- `src/pages/HomePremium.tsx:470` — product dialog entrance. **Rejected: already animated with a centered 240ms transition; another layer would add delay.**
- `src/pages/HomePremium.tsx:301` — search suggestion results. **Rejected: keyboard-initiated and already animated; repeated motion must remain fast and restrained.**
- `src/pages/HomePremium.tsx:389-425` — price offers and stores entering with stagger. **Rejected: functional data users are scanning; decorative list motion would hinder reading.**
- `src/pages/HomePremium.tsx:355-357` — animated count-up metrics. **Rejected: moving numerical evidence harms legibility and implies performance where a simple state bridge is enough.**
- `src/pages/HomePremium.tsx:335` — pulsing “Atualizado” indicator. **Rejected: perpetual motion would compete with price evidence and could imply live streaming updates that do not exist.**

## Part 3 — Verdict

The homepage is already close to the right motion level. It needs feedback and continuity, not spectacle. The highest-leverage addition is the subtle loading-to-metric opacity bridge because it clarifies data arrival without delaying the user. If implementation is desired, hand off the first row to `improve-animations plan metric loading transition`.

