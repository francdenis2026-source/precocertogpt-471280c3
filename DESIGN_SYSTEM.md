# PreçoCerto Design System

## Architecture

The system uses three token layers in `src/styles/DesignTokens.css`:

1. **Primitive** values define the palette, spacing, type, shape, depth and timing.
2. **Semantic** tokens express product intent such as background, foreground, primary, accent and focus.
3. **Component** tokens define stable contracts for buttons, inputs, cards and dialogs.

Components should consume semantic or component tokens. New hard-coded colors are reserved for exceptional illustrations and must be documented.

## Product character

PreçoCerto combines civic trust with useful price intelligence. The visual signature is deep navy, confident blue and a single electric-lime accent. Interfaces should feel local, direct and evidence-led rather than promotional or futuristic.

## Typography

- Display: Outfit Variable, controlled tracking no tighter than `-0.04em`.
- Interface and body: Manrope Variable.
- Minimum metadata size: 12px; prefer 14px on mobile.
- Body copy: 16px with a maximum measure of 70 characters.
- Monetary values use tabular numerals.

## Components

| Component | Default | Hover | Active | Disabled/loading |
|---|---|---|---|---|
| Primary button | Blue fill, white label | Darker blue | 1px tactile compression | Reduced contrast plus semantic status |
| Secondary button | Transparent or surface fill | Subtle surface shift | 1px tactile compression | Reduced contrast |
| Input | Surface, visible label, neutral border | Stronger border | Lime focus ring | Preserve readable value and status text |
| Product card | Surface or section-native background | Small elevation change | No route-blocking animation | Skeleton matching final geometry |
| Dialog | Surface over dark overlay | n/a | Focus trapped, Escape closes | Background content receives `inert` |

All interactive controls require a visible focus state and a touch target of at least 44×44px.

## Layout

- Mobile-first, single-column below 768px.
- Shell maximum width: 1180–1240px depending on information density.
- Use asymmetric composition for campaign and homepage surfaces.
- Group related evidence tightly; separate distinct tasks generously.
- Avoid horizontal scrolling and equal-card grids as page scaffolding.

## Content and states

- A price must be accompanied by store and recency whenever available.
- Missing metadata is omitted; never render punctuation-only placeholders.
- Remote failure, empty search and loading states must explain what happened and the next available action.
- Never call a single offer a comparison.

## Accessibility

- Normal text contrast: at least 4.5:1.
- UI boundaries and focus indicators: at least 3:1.
- Never encode status by color alone.
- Respect `prefers-reduced-motion` and preserve useful state transitions without decorative movement.

