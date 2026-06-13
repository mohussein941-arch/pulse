# Pulse Design Spec

Single source of truth for every UI pass. All token names match `src/ui.jsx` `:root` exactly.

---

## 1. Foundations

### Type Scale (1.25 ratio, base 12)

| Name | px | Weight | Line-height | Used for |
|---|---|---|---|---|
| micro | 10–10.5 | 600 | 1.2 | `SectionLabel` — uppercase section headers only |
| caption | 12 | 400–500 | 1.4 | Field labels (`Fld`), meta lines, badge text |
| body | 13 | 400–600 | 1.5 | All component copy — buttons, inputs, list rows, tab labels |
| base-emphasis | 15 | 700 | 1.4 | Dialog headings, alert titles, confirm questions |
| heading | 19 | 700 | 1.3 | Section titles, card headings, modal `<h1>` |
| display | 24 | 500 | 1.15 | Account/record name, primary metric value (Health + ARR only) |

Global body base is `14px` (declared on `body`). Component text defaults to **body (13px)**; never write ad-hoc font sizes outside this scale.

**Mono font (`--font-mono: 'DM Mono', monospace`)** is reserved exclusively for:
- Record/log IDs
- Log timestamps
- Activity type chips (e.g., `Call`, `Email`) when presented as a code-style tag

Do not use mono for section labels, metric labels, navigation items, or any decorative purpose.

---

### Spacing Scale (4px base)

| Token (use inline px values) | px | Named use |
|---|---|---|
| xs | 4 | Icon-to-text gap, tight inline spacing |
| sm | 8 | Inline element gap, button icon gap |
| md | 12 | Intra-card element spacing |
| base | 16 | Default card padding component, intra-card section gap |
| lg | 24 | Card padding (`Card` default = 20, breathable = 24), inter-card gap |
| xl | 32 | Page section gap, inter-zone vertical spacing |
| 2xl | 48 | Top-of-page breathing room, modal vertical margin |

**Rule**: every `margin`, `gap`, and `padding` in the app uses only these values. No 14px, no 18px, no 6px (exception: SignalCard body marginTop=6 is a contained internal value; new code should snap to 8).

---

### Color Usage Rules

**Neutrals carry ~90% of every screen.** Most surfaces, borders, text, and metric values use `--bg`, `--bg2`, `--bg3`, `--bg4`, `--border`, `--text`, `--text2`, `--text3`.

**`--indigo` (accent)** appears only on:
- Interactive primary elements: `Btn` primary variant, focus rings, active tab underline, links
- The `accent` tone of `SignalCard`
- Nowhere else — not on metric values, not on section labels

**Semantic colors** (`--rose`, `--amber`, `--emerald`) appear **only** on genuine status signals:
- `--rose`: overdue, critical health (<40), churn risk >65%, 30+ days no contact
- `--amber`: at-risk, health 40–55, approaching renewal (<60d)
- `--emerald`: healthy, completed steps, success toasts

**Anti-pattern: threshold-colored metric values in headers.** A health score of 38 displayed in `--rose` inside the primary header card or a KPI tile is forbidden. The metric value itself is always `var(--text)`. Status color may appear on a `Ring`, a `SignalCard`, or a dedicated status badge — never on the raw number.

**`--sky`, `--violet`, `--teal`** are scenario/playbook accent colors defined in `SCENARIO_CFG`. Use only within those contexts.

---

## 2. Metric Hierarchy Rule

Every view that shows account metrics applies this rule without exception.

**Primary metrics: Health score + ARR**
- Rendered at display size (24px), weight 500–700
- Health gets a `Ring` indicator (visual, not a colored number)
- ARR rendered with `fmtMoney()` helper, ink is `var(--text)`
- Prominent placement: top-left of the header card, above the secondary cluster

**Secondary metrics: Churn %, NPS, CES, Usage %**
- Rendered at body size (13px) or smaller (12px label + 16px value max)
- Ink is `var(--text)` for values, `var(--text3)` for labels
- Grouped quietly beside or below the primaries — never competing for visual weight
- No color coding on the value itself

### Worked Example — Detail Header Card

```
┌─────────────────────────────────────────────────────┐
│  [Avatar]  Acme Corp                    [Stage]     │
│            E-Commerce · Enterprise      [Ring/38]   │  ← name: 24px, weight 500
│                                                     │
│  ARR          Health      Churn %                   │
│  $84k         78          22%                       │  ← display (24) for first two,
│                                                     │     body (13) label + 16px val
│  NPS          CES         Usage %                   │
│  72           4.2         85%                       │  ← all caption label + body value
│                                                     │
│  Renews in 47d · Last contact 3d ago · 1 open ticket│  ← 12px, var(--text3)
└─────────────────────────────────────────────────────┘
```

In the current implementation all 6 metrics share `fontSize:16, color:var(--text)` — correct on the color rule, undifferentiated on size. Future passes should elevate Health + ARR to display size and reduce the secondaries to the label+value pattern shown above.

---

## 3. Component Anatomy

### `Card`
- Background: `var(--bg2)` · Border: `1px solid var(--border)` · Radius: `var(--r-lg)` (14px)
- Shadow: `var(--shadow-xs)` · Default padding: 20px (pass `pad={24}` for breathable cards)
- **States**: default as above; no hover lift unless wrapped with `.card-hover` class (list cards only); no colored top-border ever

### `Btn`
- Padding: `8px 16px` · Radius: `var(--r)` (10px) · Font: 13px, weight 600, `--font-display`
- **primary**: bg `var(--indigo)`, color white, shadow `var(--shadow-xs)`
- **ghost**: bg `var(--bg3)`, color `var(--text2)`, border `1.5px solid var(--border)`
- **danger**: bg `var(--rose-dim)`, color `var(--rose)`, no border
- **hover** (all): `filter:brightness(0.91)`, `translateY(-0.5px)` — 0.15s ease
- **disabled**: `opacity:0.42`, `cursor:not-allowed`
- **loading**: replace label text with a spinner `Ic`; keep same dimensions

### `Badge`
- Font: 10–11px, weight 600, `--font-display`, `letterSpacing:.01em`
- Padding: `3px 10px` (normal) · `2px 7px` (small prop) · Radius: `var(--r-sm)` (6px)
- Color + background always passed explicitly from config (`SCENARIO_CFG`, `ROLE_CFG`, `STAGE_CFG`)
- **No default indigo badge** — every Badge must have an explicit semantic color

### `SignalCard`
- Border-left: `3px solid {tone-color}` · Background: `{tone}-dim` · Radius: `var(--r)` · Padding: `14px 16px`
- Title: 12.5px, weight 600, `var(--text)` · Body: 12px, `var(--text2)`, lineHeight 1.5
- Tones: `danger`=rose, `warn`=amber, `success`=emerald, `info`=sky, `accent`=indigo
- **Empty state**: if a signal has no content (`children` is null/empty), do not render the SignalCard at all — collapse it entirely. An empty tinted bar with a left border is meaningless noise.
- **Loading state**: render a single-line placeholder in `var(--text3)` inside the card body, no color bar

### `Tabs`
- Container: `borderBottom:1.5px solid var(--border)`, `marginBottom:20`
- Tab button: padding `8px 16px`, fontSize 13, weight 550, `whiteSpace:nowrap`
- **Active**: color `var(--text)`, underline `2px solid var(--indigo)`, `marginBottom:-1.5px`
- **Inactive**: color `var(--text3)`, transparent underline
- **Alert dot**: 6px rose circle, `position:absolute`, top-right of tab, hidden on active tab
- **Hover**: color transitions to `var(--text2)`; transition: `color .15s, border-color .15s`

### `StatStrip`
- Container: `display:flex` · Each cell: `flex:1`, `minWidth:0`, `overflow:hidden`; divided by `1px solid var(--border)` left borders
- Cell padding: `10px 6px` · Content: `alignItems:center`
- Value: fontSize 18, weight 650, `tabular-nums`, `whiteSpace:nowrap`, color prop or `var(--text)` — **never a threshold semantic color**
- Label: fontSize 10, `var(--text3)`, `marginTop:3`, `textAlign:center`

### `Inp` / `Slct`
- Width: 100% · Background: `var(--bg2)` · Border: `1.5px solid var(--border)` · Radius: `var(--r)` (10px)
- Padding: `10px 12px` · Font: 13px, `--font-display` · Color: `var(--text)`
- **Focus**: `border-color:var(--indigo)`, `box-shadow:0 0 0 3px var(--indigo-dim)` — applied via global CSS, no inline override needed
- **Disabled**: opacity 0.42 via global `button:disabled` rule; mirror on inputs with `opacity:.42, cursor:not-allowed`

### `Fld`
- Container: `marginBottom:14` · Label: fontSize 12, weight 500, `var(--text2)`, `marginBottom:6`
- Wraps one `Inp`, `Slct`, or `textarea`; never wraps multiple inputs

### `SectionLabel`
- fontSize 10.5, weight 600, `letterSpacing:.06em`, `textTransform:uppercase`, color `var(--text3)`
- Use only to title a discrete section within a card (stakeholders, activity log, etc.)
- **Do not use** as a metric label, navigation item, or inline decorator — that is the mono micro-label anti-pattern

### `Modal`
- Overlay: `var(--scrim)` + `backdropFilter:blur(8px)`
- Dialog: bg `var(--bg2)`, radius `var(--r-2xl)` (22px), shadow `var(--shadow-lg)`, border `1px solid var(--border)`
- Default max-width: 560px · Wide variant: 800px · `maxHeight:90vh, overflow:auto`
- Header zone: padding `20px 24px`, `borderBottom:1px solid var(--border)`, sticky; title 16px weight 700
- Body zone: padding `24px`
- **Empty state in modal body**: center a `var(--text3)` message at 13px — never leave a blank white box

### `Avatar`
- Circle, size prop (default 36px) · Background: `hsl({hue},48%,88%)` · Color: `hsl({hue},42%,30%)`
- Font: weight 700, size ≈ `size * 0.34`, `--font-display`

---

## 4. Layout System

### Detail / Record View

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER BAND (full width — account name, stage, Ring, next action)   │
├────────────────────────────┬─────────────────────────────────────────┤
│  SECONDARY RAIL            │  PRIMARY CONTENT COLUMN                 │
│  300px fixed               │  flex:1, minWidth:0                     │
│  (var(--detail-col-w))     │                                         │
│                            │  Tabs                                   │
│  Signal cards              │  ─────────────────────────────────────  │
│  Stakeholders              │  Tab body (tasks, playbook, email, …)   │
│  Metadata                  │                                         │
│                            │                                         │
└────────────────────────────┴─────────────────────────────────────────┘
```

**Recipe**: `display:flex, gap:28, alignItems:flex-start`
- Secondary rail: `width:var(--detail-col-w), flexShrink:0, position:sticky, top:0, alignSelf:flex-start`
- Primary column: `flex:1, minWidth:0`

At a 1000px content area the fixed 300px rail is ≈30%; at 768px it becomes unusably narrow — the rail must collapse to an accordion or sheet below 860px (future responsive pass).

**Header card** (inside the secondary rail, top):
- `Card` with `pad={24}`
- Name at display (24px) · Industry + plan at caption (12px) below
- `Ring` score top-right of name row
- Metric grid (`3×2`) at caption label + 16px value, all `var(--text)` ink
- Meta line (renewal · last contact · tickets) at 12px `var(--text3)` with conditional `var(--rose)` on overdue/stale values only

### Portfolio / List View

- Container: `display:grid, gridTemplateColumns:repeat(auto-fill,minmax(300px,1fr)), gap:12`
- Each card: `Card` + `.card-hover` class
- Card anatomy follows the metric hierarchy rule: account name at heading weight (not display), Health + ARR prominent, secondaries small and quiet
- No colored top-borders on list cards

### Briefing / Dashboard View

- KPI tiles: `Card` components, neutral — **no colored `borderTop`** (fixed rule, no exceptions)
- Tile content: label at caption (12px, `var(--text3)`), value at heading or display depending on primary/secondary hierarchy
- AI summary text: `textAlign:left` always — centered body text is forbidden
- Tile grid gap: 16px (base spacing)

### Page Level

- Max content width: no hard cap at page level; sidebar `--sidebar-w` (232px) is fixed, content fills remainder
- Page-level internal padding: 24px (lg) on sides, 32px (xl) between major sections
- Inter-card gap in any column: 12px (md)
- Section label to first card gap: 8px (sm)

---

## 5. Anti-Patterns — Fixed DON'Ts

**1. Colored top-borders on tiles**
> `borderTop: '4px solid var(--rose)'` on a KPI Card.
> **Instead**: use a `SignalCard` with the appropriate tone, or a status `Badge` inside a neutral `Card`.

**2. Threshold-colored metric values**
> `color: hColor(account.healthScore)` applied directly to a numeric value in a header or tile.
> **Instead**: the number is always `var(--text)`; put the status color on a `Ring`, `Bar`, or `Badge` — never on the raw figure.

**3. Centered body paragraphs**
> `textAlign:'center'` on any multi-line text block (AI summary, empty states, narrative copy).
> **Instead**: `textAlign:left`. Only single-line labels inside a symmetric widget (StatStrip cell, Avatar) may center.

**4. Uppercase mono micro-labels as decoration**
> Using `fontFamily:var(--font-mono), textTransform:uppercase` on section headers, metric labels, or nav items.
> **Instead**: `SectionLabel` (Inter + uppercase) for section headers; mono is reserved for IDs and log timestamps only.

**5. Cramming content into the fixed secondary rail**
> Putting the tab work-area, full activity log, or email composer inside the 300px `--detail-col-w` column.
> **Instead**: the secondary rail holds identity, signals, and metadata only. Long-form content always goes in the primary `flex:1` column behind a Tab.
