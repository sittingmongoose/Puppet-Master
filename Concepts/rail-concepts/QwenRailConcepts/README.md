# Left-Rail Panel Concepts (`Concepts/rail-concepts/`)

A gallery of **six** theme-aware HTML prototypes that redesign the seven dense
left-rail panels of Puppet Master — **Search, Source Control, GitHub Actions,
Docker Manager, Testing, Agents, and Runtime Artifacts** — so the content fits a
narrow rail cleanly. This folder is illustrative concept work (same status as
`Concepts/PMConcept7.html`); the canonical product spec stays in `Plans/**`.
`PMConcept7.html` was **not** modified.

## How to view

- **Gallery (recommended):** the six previews are embedded in `index.html` as
  iframes, which need an http origin. From this folder run
  `python3 -m http.server` and open `http://localhost:8000`. The gallery's top
  bar retints all six at once (8 themes), drags one rail width across them
  (220 / 280 / 50vw), pins a single panel to compare treatments, and toggles
  reduced motion.
- **Single concept:** each `cN-*.html` opens on its own via `file://`.

## The six concepts

| # | Name | Paradigm | Best for |
|---|------|----------|----------|
| C1 | **Control Room** | Instrumentation deck — LED status strips, right-aligned mono readouts, thin meter bars, category-colored section rails. | A telemetry feel; scan-many-values-at-a-glance. |
| C2 | **Cozy Shelves** | Soft category-tinted shelves, pill banners, lift-on-hover. Tints derive from per-shelf accent so it re-themes without hardcoded pastels. | The friendly/glass families; warmth and breathing room. |
| C3 | **Single Thread** | Focus tunnel — one roomy section fills the panel at a time, chosen from a scrollable depth rail. | Maximum legibility at minimum width. |
| C4 | **Paper Trail** | Dated ledger on a single timeline spine; search hit-nodes carry line numbers, git nodes carry status. | Evidence-heavy panels (source/actions/artifacts). |
| C5 | **Attention Deck** | Triage model — one "now" hero per panel + a severity-ranked deck; calm bulk collapses into "all clear" cards. | Surfacing "what needs you" over categories. |
| C6 | **Split Rail** | Recursive vertical glyph gutter as secondary section-nav beside a dense, keyboard-first column (Arrow Up/Down moves sections). | Orientation without spending horizontal width. |

Each concept rebuilds **all seven panels** in its own language, and every panel
preserves its canonical feature set and command wiring (see coverage below).

## Shared foundation (`_shared/`)

- `themes.css` — the PM6 token contract + all **8 theme tables**
  (friendly/glass/retro/basic × dark/light) extracted **verbatim** from
  `PMConcept7.html` SECTION 2, plus the reduced-motion kill-switch
  (`prefers-reduced-motion` and `html[data-reduced-motion="1"]`, F3-440/446/447).
- `base.css` — app shell, the **PM sprout-menu component** (`.pm6-tb-menu` /
  `.pm6-chat-more-menu`, corner-origin sprout per ACD-439; click-to-open, Esc /
  outside-click close, mutual exclusion), activity bar, status bar, and the
  shared control primitives (buttons, chips, kv-rows, inputs, footnotes).
- `chrome.js` — builds the title bar (with a working theme menu), activity bar,
  drag-resizer, the unchanged **File Manager** panel (with its context menu
  reskinned to the PM family), and the simplified Home backdrop. Exposes
  `PMRail` and a `postMessage` bridge so the gallery can drive theme / width /
  panel / reduced-motion.
- `menu.js` — the sprout-menu behavior contract (also used for in-panel
  dropdowns and the floating file context menu via `openAt`, which is
  `position: fixed` so it is never clipped by a scrolling pane — the HTML
  stand-in for Slint's `PopupWindow`, F3-424).
- `icons.js` — inline stroke-SVG icon set (`currentColor`, no emoji / no
  pictographs, no network icons).

## Bonus variants (single-panel)

Six extra prototypes that explore alternate designs for the three densest
surfaces, each shown in the gallery as a dashed "single panel · X" card:

- **B1 Staging Board** / **B2 Git Stream** — Source as a two-column kanban board
  with a pinned commit dock; and as a monospace terminal (porcelain / log /
  worktree-list).
- **D1 Fleet Grid** / **D2 Compose Topology** — Docker as a responsive tile grid
  with CPU/MEM meters + a publish pipeline; and as a compose org-chart with a
  release rail.
- **A1 Evidence Wall** / **A2 Audit Log** — Artifacts as a masonry wall of typed
  evidence cards (CSS-only thumbnails, tinted mini-diffs); and as a chronological
  audit log with a time gutter, family stripes, and expandable provenance.

## Density & motion pass

The first cut proved layout only at *thin* data; the old rail broke when full,
so every panel of every concept was re-filled with realistic, stressful volume
and long strings (deep paths, `@sha256` image tags, multi-line panic logs, full
worktree/branch/history sets) and re-validated. A shared motion/craft layer in
`base.css` + `chrome.js` makes the set feel alive and is reduced-motion-safe:
IntersectionObserver **scroll-reveal** with a per-row stagger (auto-tagged by
class, so no per-file markup), **spring accordions** (`grid-template-rows`
0fr→1fr via a JS inner-wrap), a `:has()` **live-row sheen** on any row carrying a
running dot, **shimmer** on in-progress slots, **tabular numerals**, card
top-highlights, hover tactility, and themed `:focus-visible` rings.

## Native-menu replacement

The brief was to remove every OS-level menu and use the in-app sprout menus.
Audit of `PMConcept7.html` (native `<select>` / OS-style menus):

| Site | Line | Status |
|------|------|--------|
| Search scope ("All Files") | 15138 | **Replaced** in every concept |
| Source branch switcher | 15256 | **Replaced** in every concept |
| File-tree context menu | 15053 / 15082 | **Reskinned** in the shared File Manager |
| Run & Debug config | 15200 | Backlog (panel out of redesign scope) |
| Projects sort / lang / status | 16398 / 16404 / 16415 | Backlog (center page) |
| Orchestrator family / ledger | 17150 / 17215 | Backlog (center page) |
| Usage ledger filters | 17598 / 17599 / 17607 | Backlog (center page) |
| JS-built settings select | 20682 | Backlog (settings control) |

The title-bar theme/project menus and the chat more-menu were already PM menus.
The backlog items live on center pages that these concepts deliberately simplify;
they convert with the same shared component in the final fix.

## Theme & spacing

Widths follow **F3-035** (220px min, 50vw max; default 280px here) and the
responsive density tiers of **F3-196** (the harness tags the slot
`data-wtier=min|mid|wide`; at `min` the panel title shrinks and secondary meta
hides so nothing clips). Spacing differences between themes come from
`--grid-gap` (20 vs 24px), `--base-font-size` (14 / 14.5 / 15px),
`--line-height` (1.5–1.6) and `--border-width` (0 / 1 / 2px) — **retro** and
**basic** are the worst cases and were the ones driven to zero-overflow. Panel
titles use a `min-width: max-content` contract with an `overflow: hidden` head
so the title never truncates; the live status pill yields first.

## Slint 1.17.1 portability

Concepts use only Slint-mappable patterns: flexbox rows/columns (→ `Row` /
`Column` / `GridLayout`), `text-overflow: ellipsis`, transform/opacity
animations, token-driven color/radius/shadow. Popups map to `PopupWindow`
(F3-424); glass uses the single sanctioned `backdrop-filter: blur(34px)
saturate(160%)` over the wallpaper (F3-427); all `color-mix()` values are
theme-table precomputes at port time (F3-431). Icons port as bundled SVGs behind
a stable `icon_id` (F3-417). The Google Fonts `<link>` here is a **preview-only**
convenience (identical to PMConcept7); the Slint build bundles those families
locally (F3-430) and drops the link.

## Feature coverage preserved (per panel)

- **Search** — index status (tantivy, doc count, last-indexed, rebuild), query +
  replace row, regex/case/word toggles, scope via PM menu, virtualized results
  grouped by file with line numbers + match highlight, replace / replace-all /
  prev / next (`cmd.search.*`, F3-045/046/047/048).
- **Source** — branch PM-menu, staged/unstaged with per-file stage/unstage/discard
  (discard = destructive confirm), commit + AI + Commit, pull/push/fetch,
  remote projection, worktrees (filters; clean/dirty; owner; blocked-with-reason
  Remove via `blocked_by_gate`), history, graph, branches & stash
  (WorktreeGitImprovement.md / FileManager.md).
- **Actions** — connection card (requested = effective, scopes, missing-`workflow`
  warning + device-code reconnect), branch readiness + snapshot transport, run
  list, auto-expanded failure triage, dispatch blocked-with-reason, secrets
  **names only** (GitHub_Integration.md / GitHub_API_Auth_and_Flows.md).
- **Docker** — runtime context + detection tri-state, the six sub-views
  (containers / images / compose / registries / build / publish), publish chain
  with the repo-creation hard gate + missing-link markers, cleanup advisor
  dry-run, stale scenarios (Containers_Registry_and_Unraid.md).
- **Tests** — `show_when_possible` policy, last-run receipt
  (passed/failed/skipped/error + duration), never render an approved exception
  as "passed", state-driven Run/Watch/Cancel/Receipt/Export, redaction notice,
  evidence link (Automated_Testing_System.md).
- **Agents** — pure mirror of the subagent registry (7-state lifecycle, persona,
  operation text, lane/run ref, elapsed), lineage entrypoints + Open Chat; holds
  no private state (F3-452; orchestrator-subagent-integration.md).
- **Artifacts** — clearable family filter, compact receipt rows (family / label /
  status, mono preview, meta — payloads load on demand), provenance + Sources /
  Watch for web & browser rows, investigation bundle with role rows + Open in
  Orchestrator, freshness × health honesty (Runtime_Artifacts_Panel.md).

## Verification

- **Fit sweep (dense data):** a temporary headless-Chrome harness (playwright-core
  against the system Chrome; not a repo dependency) rendered all **12 files**
  across **8 themes × 3 widths × 7 panels × every in-panel pane**, expanding every
  accordion, and asserted no horizontal overflow, no under-filled pane, and no
  console errors — **0 issues** with the realistic long-string content loaded.
- **No-emoji / pictograph policy:** scanned every character against the same
  blocklist as `scripts/pm-gui-asset-policy.py` (arrows, technical symbols,
  enclosed alphanumerics, geometric shapes, dingbats, emoji supplement) —
  **0 hits** across all 12 files.
- **Gallery E2E:** confirmed all twelve iframes (six rails + six variants) load
  with zero console errors, and that a single broadcast applies theme + width +
  reduced-motion to all of them (panel-compare skips the single-panel variants
  via `data-fixed` so they keep their own surface).

## Next

The six bonus variants are built, so the full menu is now six rails + six
single-panel alternates, all dense. Pick a direction (one concept, or a mix of
mechanics — e.g. C5's triage ordering with C4's timeline history and D1's
container tiles) and I will carry it into the **final fix**: rebuild the seven
rail panels in PMConcept7's lineage, convert the native-menu backlog above, and
port the chosen motion within Slint's constraints.

## Polish & visual-audit pass

After the first build I visually inspected every concept (default + 220/retro,
wide, glass, worst-font) rather than trusting the geometric sweep alone. That
surfaced four real defects, now fixed:

- **Vertical voids** in single-list views — worst in **Agents** (every concept)
  and the tabbed **Docker → containers** view. Agents now carry real F3-452
  semantics that also fill the space: a **Lane Capacity** occupancy panel, a
  **Queued Work** list, and **Recently Completed** (shared `.pm-sumcard` /
  `.pm-occ` / `.pm-li`). Docker's isolated containers tab gets a **Fleet
  Summary** footer (aggregate CPU/MEM + recent events + jump buttons).
- **Wide tier just stretched** — now enriched (F3-196): `.pm-rmetric` adds a
  right-aligned metric (elapsed / CPU%) that appears only at the wide tier, and
  `.pm-2col` gives the fleet summary a two-column layout there.
- **Crushed commit input** — the message field now sits on its own full-width
  line above the AI/Commit row (rails + B1/B2).
- **Receipt-title truncation** at the mid tier — the flanking family/status
  chips shrink via a shared responsive rule; **glass** panels gain a hairline
  edge; the **home backdrop** gained a per-theme tint + a reduced-motion-safe
  shimmer so it isn't dead-gray.

Re-validated after the pass: headless sweep (12 files × 8 themes × 3 widths ×
7 panels, accordions expanded, dense data) = **0 overflow / 0 thin / 0 console
errors**; pictograph scan = **0**; and the four previously-broken cases were
re-screenshotted and confirmed by eye.
