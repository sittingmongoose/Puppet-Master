# The seven designs, and how each one is different

The packet's differentiation gate: the seven concepts must differ in **Home
composition, primary navigation geometry, deep-navigation model, manager list/detail
composition, exact-result reveal, narrow-width transformation, motion metaphor, and
density/typography rhythm**. A colour or material swap is not a distinct concept.

Each concept below states its thesis in one sentence and then the eight axes. Build
your own; do not borrow another row's geometry.

---

## 05 — Directory · *Take 1*

Reference: `01_A1_Directory_Take_1_LAYOUT_RECONSTRUCTION.png`
**Thesis: Settings is a directory you can hold in your head.** Crisp, quiet, and dense
enough that the whole product fits on one screen.

- **Home** — search bar full width; one attention block directly under it; then a
  two-column grid of destination cards, each card a title, a one-line purpose, and a
  chevron. Nothing else competes.
- **Navigation** — a compact left rail listing the 12 domains, always present, plus the
  card grid as the primary way in. The rail is text, not icons-only.
- **Deep model** — a card *expands into* the domain workspace: the card's title becomes
  the domain header in place, and the rest of the grid clears away.
- **Manager** — roster on the left at a fixed 280px, the selected object's form filling
  the rest, all in one pane. Subpages are a quiet tab strip above the form.
- **Exact-result reveal** — the destination row lifts by 2px and takes a soft ring that
  fades over 900ms; the ring originates at the row, not at the page.
- **Narrow** — the rail pushes off-screen, the grid becomes one column, and the roster
  and form become two pushed pages with a named Back.
- **Motion** — expand-and-transfer: the thing you pressed becomes the thing you get.
- **Density** — medium-tight. 13px body, 1.45 line height, 12px vertical row rhythm.

---

## 06 — Editorial · *Take 2*

Reference: `02_A1_Directory_Take_2.png`
**Thesis: Settings reads like a well-set page.** A list you can scan without effort,
never a dashboard.

- **Home** — a single column of large destination rows, each with an icon, a title, a
  full sentence of description, and a right chevron. One attention chip may sit inline
  on the row it concerns rather than in a separate block.
- **Navigation** — a narrow, stable left rail (icon + label, ~200px) that never
  changes as you go deeper. No cards anywhere.
- **Deep model** — the rail stays; the content area becomes a restrained sheet.
  Sub-navigation nests *inside* the sheet as a second-level list, so you never leave
  the sheet to go deeper.
- **Manager** — a compact roster (rows, 44px) and a detail sheet with its own quiet tab
  strip; the detail sheet is measured to about 72 characters and centred in its column.
- **Exact-result reveal** — a marker appears in the left gutter beside the row and a
  slow underline sweeps the row's title once.
- **Narrow** — a single-pane editorial push stack: rail → list → sheet → detail, each a
  full page with a named Back.
- **Motion** — vertical slide, 180ms, everything moving in the same direction as
  reading.
- **Density** — airy. 14px body, 1.6 line height, 20px row rhythm, generous section
  spacing.

---

## 07 — Compendium

Reference: `03_A2_Compendium_Workspace_Take_1.png`
**Thesis: Settings is a reference work with a good index.** The best answer to
thousands of settings without making ordinary browsing feel like a database.

- **Home** — "Welcome to Project Settings", the search field, then *Browse by area* as
  a calm two-column grid, then a small *Recently changed* block at the bottom.
- **Navigation** — a left nav where **All Settings** sits second, immediately under
  Home, as a first-class destination rather than a utility.
- **Deep model** — two parallel modes: a domain page (overview → key settings → related
  managers) and the **compendium**: a faceted, virtualized index with filter chips
  across the top (Changed from default, Advanced, Managers, Diagnostics) and a facet
  column (category counts, setting type, status).
- **Manager** — integrated list/detail with a readable metadata block: the detail pane
  carries an *About this setting* explanation, its default, its type, and where it came
  from.
- **Exact-result reveal** — the row lands with a contextual explanation panel beside it
  saying what the setting controls and that it was reached from search.
- **Narrow** — facets collapse into a drawer; the detail pushes over the list.
- **Motion** — facets cross-fade in place (the list must not jump), detail pushes in
  from the right.
- **Density** — two rhythms on purpose: the compendium is dense (32px rows, tabular
  numerals), the domain pages are calm (16px rhythm).

---

## 08 — Broadside · *Take 3*

Reference: `04_A1_Directory_Take_3.png`
**Thesis: Settings is broad and approachable.** Fewer, larger destinations; nothing
cramped.

- **Home** — search, then one attention panel that lists its items with an inline fix
  action each, then six to eight **large** domain cards (icon block, title, two-line
  purpose) in a two- or three-column grid depending on width.
- **Navigation** — a left rail plus a breadcrumb; the cards are the main event and stay
  large at every width.
- **Deep model** — a domain overview made of unmistakable *manager destinations*: each
  is a wide row with an icon, a title, a purpose and a status figure on the right.
- **Manager** — the provider surface is a summary of high-value status cards (Status,
  Default model, Last used, Requests, Tokens, Spend) followed by an explicit
  **Quick actions** row, then the subpages.
- **Exact-result reveal** — the destination card or field is highlighted in place with
  a soft halo and a one-line "found from search" caption above it.
- **Narrow** — the cards become one full-width column and stay large; nothing shrinks
  into pills.
- **Motion** — scale-and-settle: the pressed card scales up slightly as the page
  changes under it.
- **Density** — spacious. 15px body, 1.55 line height, 24px block rhythm, big touch
  targets.

---

## 09 — Codex *(rethemed Tome Tabs)*

Reference: `05_Tome_Tabs_LAYOUT_ONLY_RETHEME_REQUIRED.png`
**Thesis: Settings is a bound volume with chapter tabs — expressed entirely in Puppet
Master's own materials.**

**Borrow only the layout**: persistent edge tabs for major domains, layered page depth,
a broad central reading canvas, domain tabs plus manager-local tabs, list/detail
manager composition, a stepwise copy flow. **Forbidden**: parchment, brass, gears,
sepia, book ornament, skeuomorphic paper, medieval or fantasy wording, drop-shadow
"pages", serif display faces used as decoration.

- **Home** — a broad central canvas with wide margins; the search field sits at the top
  of the canvas; attention items are a single quiet list; domain destinations are
  presented as a two-column reading list.
- **Navigation** — a **persistent vertical tab strip on the right edge**, one tab per
  domain, always visible, current tab visually joined to the canvas.
- **Deep model** — a layered page stack: going deeper adds a page *on top of* the
  canvas, with the previous layer's edge still visible so location is never lost.
- **Manager** — roster plus a tabbed detail page; manager-local tabs sit inside the
  page, visually distinct from the domain edge tabs.
- **Exact-result reveal** — the edge tab activates first, then the page layer lifts,
  then the row takes a ring — three steps that explain where you were taken.
- **Narrow** — the edge tabs become a controlled push navigation: a domain list page
  that pushes the canvas aside.
- **Motion** — layer depth: pages lift and settle on the z-axis, 200ms, bounded shadow.
- **Density** — comfortable. 14px body, 1.55 line height, wide canvas margins, a
  measured 68-character text column.

---

## 10 — Command *(rethemed Command Suite)*

Reference: `06_Command_Suite_LAYOUT_ONLY_RETHEME_REQUIRED.png`
**Thesis: Settings for someone who knows where they are going — keyboard first, panes
left to right.**

**Borrow only the layout**: a command index, keyboard-first movement, multi-pane
left-to-right drill-down, compact legible tables, visible paths and status, an editor
beneath or beside its context, transactional copy panels. **Forbidden**: a fake
terminal, green monochrome, CRT effects, scanlines, monospace body text, code-only
labels, `/ai/providers/openai` style paths as the primary label, ASCII box drawing.
Use ordinary human sentences and PM theme tokens throughout; monospace is allowed only
for genuinely literal values (a file path, a command id, a key fingerprint).

- **Home** — a left index of the 12 domains with keyboard hints, a project context
  block, an *At a glance* panel of four counts, and a *Recently accessed* list.
- **Navigation** — multi-pane drill-down: index → list → detail → editor, up to four
  panes at 2200px+, each pane individually scrollable with its own header.
- **Deep model** — a pane cascade. Going deeper adds a pane on the right and dims
  nothing; going back removes the rightmost pane.
- **Manager** — a compact but legible table (32px rows, aligned numerals, real column
  headers) with the selected row's detail beneath the table in the same pane.
- **Exact-result reveal** — the row is selected in the table and its editor opens
  directly beneath it in context, with the full path shown once above the editor.
- **Narrow** — panes collapse to one, with breadcrumb chips across the top standing in
  for the panes that are off-screen.
- **Motion** — horizontal pane slide, 160ms, with the leftmost pane holding position.
- **Density** — compact tabular. 13px body, 1.4 line height, 32px rows, tabular
  numerals, strong vertical rules between panes.

Keyboard is a first-class requirement here: arrow keys move within a pane, left/right
move between panes, Enter opens, Escape steps back one pane, and a visible focus ring
follows.

---

## 11 — Folio *(rethemed Tabbed Organizer)*

Reference: `07_Tabbed_Organizer_LAYOUT_ONLY_RETHEME_REQUIRED.png`
**Thesis: Settings is well-organised into tabs and sheets that never lose your place.**

**Borrow only the layout**: category tabs, layered sheets that preserve location,
compact home categories with recent changes, domain-level tabs plus a related-manager
strip, a provider roster with detail tabs, deep-link results nested in the same page
stack, copy categories and source project in adjacent panes. **Forbidden**: literal
paper, manila folders, binder rings, staples, paper clips, tab dividers drawn as
physical objects, torn edges, drop shadows imitating stacked sheets, parchment.

- **Home** — a compact grid of category tiles (icon, title, count) above a
  *Recent changes* list showing what changed, where, when, and by whom.
- **Navigation** — **top category tabs** for the domains, and a second row of sub-tabs
  inside a domain. Two levels of tabs, clearly ranked by size and weight.
- **Deep model** — layered sheets: each level is a sheet that slides in while the tab
  row above it stays fixed, so the location indicator never moves.
- **Manager** — roster on the left, detail on the right with its own third-level tab
  row (Overview, Credentials, Models, Limits, Usage, Advanced).
- **Exact-result reveal** — the correct tab and sub-tab auto-select, the sheet slides in
  and the row is ringed — the reveal happens *inside* the existing tab stack, never as
  a new page.
- **Narrow** — the tab rows become a horizontally scrolling chip rail with the current
  chip pinned into view, and sheets push full-width.
- **Motion** — sheet cross-slide: the outgoing sheet slides out as the incoming one
  slides in, 190ms, tabs never move.
- **Density** — medium. 14px body, 1.5 line height, 40px roster rows, clear tab
  hierarchy through size and weight rather than colour.
