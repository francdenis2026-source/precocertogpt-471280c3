# Design System: PreçoCerto

## 1. Visual Theme & Atmosphere

PreçoCerto is a confident hyperlocal price-intelligence product for Feijó. It should feel like a trustworthy civic utility with the energy of a modern consumer service: direct, evidence-led and warm without becoming rustic. Density is **5/10 balanced**, variance is **7/10 asymmetric**, and motion is **3/10 restrained** because people use the product repeatedly, primarily on mobile and sometimes on limited connections.

Use an offset, left-led composition with clear zones for search, evidence and action. The homepage may be expressive; marketplace, checkout, merchant and admin surfaces become progressively quieter and denser. The same tokens and interaction rules connect them.

## 2. Color Palette & Roles

- **Feijó Canvas** (`#F4F5ED`) — warm primary page background.
- **Market Surface** (`#FFFFFF`) — controls, dialogs and elevated product surfaces.
- **Night Ink** (`#0B1020`) — primary text and dark evidence panels; never use pure black.
- **Slate Evidence** (`#465067`) — secondary copy and metadata on light surfaces.
- **Quiet Line** (`#D8DCD2`) — structural dividers and control boundaries.
- **Trust Blue** (`#2457F5`) — primary actions, selected states and navigational emphasis.
- **Electric Saving** (`#D8FF3E`) — the single expressive accent, reserved for verified savings, focus and small high-value highlights.
- **Verified Green** (`#14805E`) — success status only, never a competing brand accent.
- **Attention Amber** (`#A55B08`) — warnings and potentially divergent price evidence.
- **Error Red** (`#C93636`) — destructive and recovery states.

Dark mode uses **Deep Night** (`#080C17`) as canvas, **Night Surface** (`#111827`) and **Soft White** (`#F6F7EF`) for text. Trust Blue shifts to `#7091FF` for contrast. Do not introduce purple, neon gradients or unrelated accent colors.

## 3. Typography Rules

- **Display:** Outfit Variable — confident, compact and editorial. Use weights 650–800, `clamp()` sizing and tracking between `-0.02em` and `-0.04em`.
- **Interface and body:** Manrope Variable — relaxed line-height, direct labels and a maximum reading measure of 70 characters.
- **Numbers:** Manrope with tabular numerals for prices, savings and metrics.
- Headings establish hierarchy through scale and weight; never use gradient text.
- Body copy is at least 16px. Essential metadata is at least 12px and preferably 14px on mobile.
- Do not use Inter as the visible product voice. Do not use generic serif or monospace as decoration.

## 4. Component Stylings

- **Primary buttons:** Trust Blue fill, white label, 12px radius and minimum 44px height. Hover darkens to `#153BC2`; active moves down 1px for 120–150ms. No glow.
- **Secondary buttons:** surface or transparent fill with Quiet Line border. Use when the action is genuinely secondary.
- **Search:** visible label above the field, 48px minimum height, clear submit action and Electric Saving focus ring. Suggestions retain product, price and store context without punctuation-only placeholders.
- **Product surfaces:** prefer native section layout or a single bordered surface. Elevation is reserved for interactive or selected content. Do not build pages from repeated identical cards.
- **Price evidence:** price, store, neighborhood and recency form one semantic group. Savings receive Electric Saving emphasis only when backed by multiple valid offers.
- **Dialogs:** centered surface with 24px radius and soft offset shadow. Focus is trapped, Escape closes, the trigger receives focus on return and background content becomes inert.
- **Loading:** skeletons match final geometry. Use concise live status text when remote data may fail.
- **Empty/error:** explain the missing result or failure and provide a concrete recovery action.
- **Icons:** Lucide only, consistent stroke and optical size; never use emoji as interface icons.

## 5. Layout Principles

- Use CSS Grid for major composition and flex layout for local alignment.
- Contain public pages within 1180–1240px.
- Homepage hero uses an asymmetric split: search-led copy on the left and real price evidence on the right.
- Do not overlap text and images. Every element occupies a stable spatial zone.
- Avoid generic centered heroes and equal three-card feature rows.
- Below 768px, multi-column layouts become one column, controls retain 44px targets and essential evidence appears before decorative media.
- Never allow horizontal page scrolling. Use `min-height: 100dvh` when a full viewport is genuinely needed.
- Section spacing follows `clamp(3rem, 7vw, 5rem)` and shrinks proportionally on mobile.

## 6. Motion & Interaction

Motion exists to clarify feedback, state or spatial continuity. The product is used frequently, so perpetual decorative loops are prohibited despite the generic Stitch baseline.

- Button press: `transform: translateY(1px)` for 120–150ms using `cubic-bezier(.22,1,.36,1)`.
- Search results: enter with opacity and 4px translation over 180ms; remain immediately interactive.
- Dialog: opacity plus scale from `.98` over 220ms, centered transform origin.
- Mobile menu: opacity plus 6px vertical translation over 180ms.
- Skeleton shimmer is allowed only while content is genuinely loading.
- Animate only transform and opacity for interaction motion. Use one authored marketing moment at most.
- Under `prefers-reduced-motion`, remove translation and preserve short opacity/state feedback.

## 7. Anti-Patterns (Banned)

- No pure black, purple neon, outer glows or oversaturated gradients.
- No emojis, custom cursors or mixed icon families.
- No gradient display text or generic AI copy such as “eleve”, “revolucione” or “experiência perfeita”.
- No centered high-variance hero, overlapping content or floating decorative objects that obscure evidence.
- No three identical feature cards as the main page structure.
- No fake metrics, round illustrative claims or savings without valid offer data.
- No broken image placeholders, punctuation-only metadata or “Atualizado” without a date when one exists.
- No animation on prices, data users are reading, keyboard focus jumps or high-frequency navigation.
- No modal when inline disclosure would preserve context better.

