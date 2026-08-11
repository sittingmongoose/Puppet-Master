# Usage Page — Design Concepts (`Concepts/usage-concepts/`)

Theme-aware redesign prototypes of Puppet Master's **Usage** page, plus a comparison
gallery, a verification record, and a research corpus. Illustrative concept work — same
status as `Concepts/rail-concepts/` and `Concepts/PMConcept7.html`. `Plans/**` remains the
canonical spec; these prototypes explore how the Usage page could look and behave. Verified
facts live in [`verification/`](./verification/); the research corpus lives in
[`research/`](./research/); load-bearing findings and open gaps are summarized in
[`FINDINGS.md`](./FINDINGS.md).

## How to view

The pages use relative includes and an iframe gallery, so they need an http origin (not
`file://`):

```bash
cd Concepts/usage-concepts
python3 -m http.server 8000      # then open http://localhost:8000
```

- **`index.html` — the gallery (start here).** Embeds all nine concepts. The top bar retints
  every concept across all **8 themes** (friendly / glass / retro / basic × dark / light),
  drives one **page-width** slider (900 / 1280 / 1700 / 2200 / 2500) across them, and toggles
  **reduced motion**. **Compare** shows them side-by-side (filter by family); **Focus** drives
  one concept full-size (default is U9 Deck); **open full →** opens any concept standalone.
- **Standalone:** each `uN-*.html` opens on its own and carries the full app shell (title bar
  with the Usage tab active, status bar with a page-fit width harness + reduced-motion toggle,
  theme menu).

## The nine concepts

Seven are **active** (U3–U9). **U1 and U2 are FROZEN (rejected)** — not edited this pass and
excluded from the verification gate, but still live in the gallery and still importing the
shared infrastructure below.

| # | Name | Family | Status | Organizing idea |
|---|------|--------|--------|-----------------|
| **U1** | Signal | Triage | FROZEN | Severity is the layout axis: a status line, a single "now" hero, a severity-ranked deck, then a calm "all clear". |
| **U2** | Stream | Timeline | FROZEN | The event ledger is the page — a vertical spine grouped into 5-hour billing blocks with a burn-rate readout. |
| **U3** | Cockpit | Telemetry | active | A gauge-hero cockpit: one large pressure gauge leads a 2×2 dial bank, an LED quota readout, a scrolling ticker, and threshold lamps — a fixed composition, not a card grid. |
| **U4** | Focus | Focus | active | One roomy section at a time via a depth rail; maximum legibility, deep content per pane. |
| **U5** | Cozy Console | Cozy | active | The cozy rework: warm shelf-cards with recessed KPI pockets and a hearth spend-pulse hero; the warmth is designed per theme (CRT-phosphor in retro, frosted in glass). |
| **U6** | Workspace | Workspace | active | Master–detail triage: a pressure-sorted, searchable subject index beside a full context dossier that swaps on selection. |
| **U7** | Board | Widgets (grid) | active | An orderly instrument board on the shared **grid** engine — uniform modules on a fixed grid with live module numbers and a bench readout strip; drag-reorder / resize / configure / add / remove, density that adapts to size, persisted. |
| **U8** | Canvas | Widgets (grid) | active | A varied-span **bento mosaic** on the shared **grid** engine — 10 distinct spans (incl. thin 1-col rails and a wide ledger band), dense hole-free packing, drag-reorder, free grid-span resize with a Custom chip, a bespoke 26px dot-grid ground with per-category spine chrome, and a focal hero number. |
| **U9** | Deck | Widgets (deck) | active | A curated tabbed deck — five topical tabs (`PMTabs`) over per-tab curated boards on the grid engine; usage-first, with cost one tab away. |

Every active concept renders the **same canonical dataset** (`_shared/usage-data.js`), so the
differences are purely design — you are comparing paradigms, not data. File roles and line
counts are catalogued in [`research/concept-inventory.md`](./research/concept-inventory.md).

## Shared foundation (`_shared/`) — 16 files

| File | Role | Used by |
|------|------|---------|
| `base.css` | App-shell chrome: title bar, status bar, sprout-menu chrome, buttons/chips/inputs, glass background, skeleton/hovergraph, accordion, shimmer keyframes | index + U1–U9 (all 10) |
| `themes.css` | All 8 theme tables, elevation tokens, scrollbar hooks, reduced-motion block | all 10 |
| `icons.js` | Shared stroke-SVG icon set (`PMIcons`); the F3-417 no-emoji contract | all 10 |
| `menu.js` | Sprout-menu behavior: click-open, Esc/outside close, mutual exclusion, viewport clamping | all 10 |
| `usage-icons.js` | Usage-page glyphs extending `PMIcons` | index, U1–U8 |
| `usage-shared.css` | Shared Usage layout: responsive column grid, sections, table, meters, value-state vocabulary, tooltips | U1–U9 (not index) |
| `usage-data.js` | Canonical dense dataset (`USAGE`) + formatters + value-state vocabulary + render helpers | U1–U9 |
| `usage-chrome.js` | Usage shell: title bar + page tabs + status-bar fit harness + theme sprout menu; `postMessage` gallery bridge | U1–U9 |
| `usage-context.css` | Context ring + details sprout + message-detail modal chrome | U3–U9 |
| `usage-context.js` | Context popup + More Details behavior (`PMContext`): the ring/details sprouts and modal, incl. command dispatch + redacted Raw | U3–U9 |
| `usage-tabs.css` | Animated tab strip + ink indicator + panel in/out keyframes | U9 only |
| `usage-tabs.js` | Tab logic (`PMTabs`): spring ink, pointer magnify, resync, panel transitions | U9 only |
| `usage-widgets.css` | Widget canvas grid + focus-mode morph overlay | U7–U9 |
| `usage-widgets.js` | The shared widget canvas (`PMWidgets`): the **grid** engine (FLIP drag-reorder, free grid-span pointer resize, focus-mode morph); versioned `{v:2}` `localStorage` persistence + migration + curated default-board reset | U7–U9 |
| `usage-widget-renderers.css` | Widget content styles for the shared renderers | U7–U9 |
| `usage-widget-renderers.js` | Shared widget content renderers (`PMWidgetDefs`) — **17 density-aware renderers** (the union catalog; each ships a default col/row span) | U7–U9 |

**One DRY widget system, three distinct paradigms.** U7, U8, and U9 are all built on the single
widget system above — `PMWidgets` (the grid canvas engine) plus `PMWidgetDefs` (the 17 shared
**area-aware** content renderers). Their earlier per-concept widget code was deleted and U8's broken
persistence was fixed in the migration. All three mount the **same grid engine**; the paradigms
diverge **by composition, navigation, and chrome**, not by seed alone: **U7** is an orderly
**instrument board** (uniform modules, locked rhythm, live module numbers, a bench readout strip);
**U8** is a varied-span **bento mosaic** (10 distinct spans, dense hole-free packing, a bespoke 26px
dot-grid ground with per-category spine chrome, and a focal hero number); **U9** is a curated
**deck** — five topical tabs (`PMTabs`) over per-tab curated grid boards. A widget card is
pixel-identical across all three at a given theme; what differs is the composition, the navigation
layer, the ground/chrome treatment, and the addable-widget capability set. The system treats **free
grid-span resize as the canonical action** (drag = reorder, dense packing); the S / M / L / XL
presets are non-binding shortcuts, and a non-preset size is retained and surfaced as a **Custom**
chip. Reordering is a lift-and-settle **drag**: grabbing a widget's grip lifts a floating copy that
tracks the pointer while its slot becomes a dashed ghost outline, siblings reflow live (FLIP, bodies
never re-render) to preview the landing slot, and drop settles the widget in and persists the order —
Esc reverts, drop-in-place is a no-op, and reduced motion stays fully functional without animation.
Board layouts persist as `{v:2}` with a migration path and a curated default-board reset.

The **17 renderers are area-aware**: each picks a density tier from the widget's live pixel width
and height, so content is composed for the box it is given rather than chopped to fit. Density
variants are purpose-built — headline-first at small sizes, top-N lists with an honest "+N more"
disclosure (the tail rows stay in the DOM behind a one-click reveal; data is folded, never dropped),
column-dropping on narrow tables, and two-up splits on wide tiles. As a result, widget scrolling
dropped from 77% of instances to **7.8%**, and that 7.8% is **all** deliberate ledger/tools table
paging inside a body that itself fits at 1.00×; every widget measures exactly **1.00×** with **0px**
right cut-off. **Value-state chips never clip mid-word**: at width they render the full label, and
below ~340px bodies they collapse to a colored dot whose full state rides a tooltip. The **focus
mode now morphs** — the card is hoisted and travels to its overlay on a compositor FLIP transform
(continuous, ~470ms) with a fading scrim, and Esc returns it exactly to its board slot.

The **context popup + More Details** surface is likewise shared across U3–U9 (`PMContext` in
`usage-context.*`), with command dispatch and a redacted Raw view. That redacted Raw preview is the
one canonical machine-field reference surface, so it is deliberately **excluded** from the
no-underscore UI-prose rule (its identifiers are code tokens, not UI copy). **Motion tokens are
centralized** (durations / easings / springs + reduced-motion variants). Each theme family carries
its own **typography voice** with a **loaded numeric font** (no OS-font fallback on hero numbers)
and a real type scale, so the concepts read as hierarchical compositions, not grids of equal cards.
The glass language is aligned to `PMConcept7` and deliberately de-blurred for Slint portability (the
two Slint blockers are documented in `research/slint-1.17.1-verification.md`).

**Per-concept imports:** `index.html` loads the five chrome/icon files (`base.css`,
`themes.css`, `icons.js`, `menu.js`, `usage-icons.js`). U1 and U2 add `usage-shared.css`,
`usage-data.js`, and `usage-chrome.js` (an 8-file set). U3–U6 add `usage-context.css` and
`usage-context.js` (10 files). U7 and U8 add the four widget files (14 files). U9 loads 15 of
the 16 files — everything except `usage-icons.js`, plus `usage-tabs.css` / `usage-tabs.js`.

**Frozen-concept blast radius:** the 8 files imported by U1/U2 (`base.css`, `themes.css`,
`usage-shared.css`, `usage-data.js`, `usage-chrome.js`, `icons.js`, `usage-icons.js`,
`menu.js`) can change the frozen concepts if edited. The `usage-context.*`, `usage-tabs.*`,
`usage-widgets.*`, and `usage-widget-renderers.*` files are not imported by U1/U2 and are safe
to evolve without touching them.

## Verification

Three automated gates plus an agent-led visual review. Run them from this directory:

```bash
node verification/run-matrix.mjs    # base matrix (needs local Chrome; spins up its own server)
node verification/run-states.mjs    # interactive states (needs local Chrome)
node verification/data-unit.mjs     # semantic/data assertions (pure node, no browser)
```

- **Base matrix** (`verification/run-matrix.mjs`) — **7 pages (U3–U9) × 8 themes × 5 widths
  (900/1280/1700/2200/2500) = 280 cases, 280/280 pass, 0 failures.** Per case it asserts in the
  rendered DOM: meter-group **alignment** (equal left and right edges within 2px), **zero
  underscores** in any text node (including hidden panes), **zero root overflow** of
  non-decorative content, and **zero console/page errors**. 280 screenshots under
  `verification/screenshots/`. See `verification/report.md` + `verification/results.json`.
- **Interactive states** (`verification/run-states.mjs`) — **393 passed / 0 failed / 171
  legitimate N/A.** Per concept: tabs/panes, sort asc+desc, filter menus, the context popup
  (hover no-open; aligned "Usage remaining" 5h + Weekly bars; Compact not fired on open), More
  Details (Curated + redacted Raw + command dispatch), one-popup-at-a-time, widget kebab (all
  items), the add-widget picker, Configure, S/M/L/XL + free resize with a non-preset **Custom**
  chip retained, focus enter/exit + scrim, reduced-motion toggle, and low-height 650/1400. The
  gallery's compare/focus/open-full modes and both sliders are covered too. Results in
  `verification/state-results.json`; screenshots under `verification/screenshots-states/`.
- **Semantic / data-unit** (`verification/data-unit.mjs`) — **1003 assertions, 0 failures.**
  used-tokens measured **source-aware at 160,090** (the old double-counting total, 156,310, is
  absent everywhere); the three-way cost reconciles exactly — **61,850,000 (API-billed) +
  125,570,000 (plan-included) = 187,420,000 = the single `cost_microdollars`**; **≥36 provenance
  chips per concept**; **0 underscores in prose** across all 7.
- **Visual review** — **280/280 combos pass** (7 concepts × 40). The geometry verdict is the
  automated matrix above, re-run on the final design (alignment, underscores, overflow, console
  errors); the design-quality verdict is the agent design critique in
  `verification/qa-design-critique-final.md` (final) plus the live-browser QA sweep
  (`qa-fit-final.md`, `qa-final-widgets.md`, `qa-final-static.md`, `qa-u9.md`), the widget fit audit
  (`audit-widget-fit.md`), and the finish / alignment / contrast passes. Consolidated in
  `verification/visual-review-ledger.json` (280 entries, all pass; the per-concept
  `verification/visual-review-{page}.json` files are intermediate lineage, the design having evolved
  during the build). This is **agent-done review, not human sign-off**; only low/cosmetic residuals
  remain (see `verification/known-limitations.md`).

**Read [`verification/known-limitations.md`](./verification/known-limitations.md) before
trusting "green"** — it states exactly what each gate does and does not cover (agent-not-human
visual review, the remaining low/cosmetic residuals, Slint documented-not-re-authored, and the U1/U2
freeze).

### Audit corpus (`verification/audit-*.md`)

The gates certify the concepts are mechanically built; the audit reports are the adversarial review
layer that drove the hardening and design elevation. Read them for the honest journey, not just the
green totals:

- **Design:** `audit-design-critique.md` (the harsh pre-elevation critique) →
  `audit-design-recritique.md` (the post-elevation re-evaluation; the current design verdict) and
  `audit-distinctiveness.md` (are the seven concepts genuinely distinct?).
- **Robustness:** `audit-robustness.md` (hostile QA stress-test: rapid input, interrupted
  transitions, resize-during-animation, popup collision, keyboard, extreme widths, gallery).
- **Data semantics:** `audit-data-semantics.md` (adversarial cross-concept accounting + provenance).
- **Accessibility & motion:** `audit-accessibility.md`, `audit-motion.md`, and the post-elevation
  `audit-a11y-motion-recheck.md`; the final contrast work is `contrast-final-cleanup.md`.

## Research corpus (`research/`)

Read-only research, all re-verified against the current corpus on 2026-07-30 (see
[`research/INDEX.md`](./research/INDEX.md)):

- **Plans synthesis:** `plans-usage-synthesis.md` (token / quota / cost / projection semantics),
  `plans-gui-synthesis.md` (GUI surfaces), `plans-gap-and-conflict-register.md`, plus
  `plans-source-ledger.json` and `plans-command-registry.md`.
- **14 external open-source projects** (access-date 2026-07-30, SHA-pinned): batch A
  (`usage-notes-A.md` / `usage-ledger-A.json`) — ccusage, Claude-Code-Usage-Monitor,
  cc-statusline, opencode, claudecodeui, codeburn; batch B (`usage-notes-B.md` /
  `usage-ledger-B.json`) — LiteLLM, Helicone, OpenMeter, Lago, LLM-Token-Counter-VSCode,
  vs-context, copilot-usage-dashboard-v2, github-copilot-usage-tracker.
- **Motion:** `motion-synthesis.md` (principles P1–P12), `motion-token-map.json`,
  `motion-to-slint-map.md`, `motion-source-ledger.json`. Motion tokens are centralized in the
  prototypes' CSS; the Slint re-implementation is future work tied to the chosen concept.
- **Slint 1.17.1:** `slint-1.17.1-verification.md` (re-audit, version-pinned) and
  `slint-portability-audit.md`, with the glass mapping in `glass-slint-mapping.md`. Only **two**
  true missing-capability blockers remain — `backdrop-filter` and element blur; earlier
  "blockers" (transforms, grid auto-placement, FLIP drag/resize, media queries) were downgraded
  to needs-fallback against 1.17.1.
- **Inventory:** `concept-inventory.md` (file roles, line counts, importers).

## Picking one / next steps

Open the gallery, flip themes, drag the width, and live in each paradigm in Focus mode. A chosen
direction (or mix) would next be ported into the PMConcept7 lineage via the `pm6-build` parts
pipeline — not done in this folder. The load-bearing semantics and open gaps to canonicalize in
Plans before implementation are in [`FINDINGS.md`](./FINDINGS.md); proposed future Plans/command
changes are in [`research/proposed-plan-updates.md`](./research/proposed-plan-updates.md).
