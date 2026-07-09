# PMConcept6 build — parts, ownership, conventions

Source: `Concepts/PMConcept4.html` (21,518 lines; sha in checks/pmconcept4.sha256 — MUST remain untouched).
Working copy: `pm6-build/PMConcept6.working.html` (copy of source, stage-0 renamed, then carved).
Ship target: `Concepts/PMConcept6.html` (assembled at Gate G3 only).

## Pipeline
1. `cp PMConcept4.html pm6-build/PMConcept6.working.html`
2. `python3 rename_vocab.py` (stage-0 mechanical renames, exclusions below) — in place on working copy.
3. `python3 carve.py` → `parts/NN-name.part.html` + `manifest.lock` (sha, lines, div-delta per part).
4. Agents edit ONLY their owned parts (+ their own `notes/<agent>.requests.md`).
5. `python3 assemble.py [--gate g0|g1|g2|g3]` → `pm6-build/PMConcept6.assembled.html` + full check suite. G3 additionally copies to `Concepts/PMConcept6.html`.

**Gate G0 invariant:** with stub parts empty, assemble(carve(working)) must be byte-identical to the working copy.

## Parts table (start markers are unique `grep -F` strings in the working copy; each part runs from its marker line (inclusive) to the line before the next part's marker; part 01 starts at line 1; last part ends at EOF)

| # | Part | Start marker | W1 owner |
|---|------|--------------|----------|
| 01 | head-prelude | (file start) | theme-tokens |
| 02 | css-tokens | `<style>` (first occurrence, line ~10) | theme-tokens |
| 03 | css-glass-a | `LIQUID GLASS multi-layer panels` (~455) | theme-glass |
| 04 | css-glass-b | `Glass Dark: colored tint backgrounds + neon glow` (~1447) | theme-glass |
| 05 | css-shell | `* { box-sizing: border-box` (~2879) | FROZEN → polish |
| 06 | css-components-a | `Agent-Config 7-section layout` (~3755) | FROZEN → polish |
| 07 | css-components-b | `Inline diff line backgrounds` (~5478) | FROZEN → polish |
| 08 | css-components-c | `Browser Tab Content (workspace_preview` (~6087) | FROZEN → polish |
| 09 | css-bento-themes | `NEW PANELS CSS` (~8023) | theme-retro-basic |
| 10 | css-settings | `id="pm4-settings-css"` (~8921) | settings |
| 11 | html-shell-open | `</head>` (~9851) | shell-chrome (side-panels agent) |
| 12 | html-side-panels | `id="panel-files"` (~9899) | side-panels |
| 13 | html-shell-mid | `<div class="center-column">` (~10515) | shell-chrome |
| 14 | page-dashboard | `id="panel-dashboard"` (~10522) | dashboard |
| 15 | page-projects | `id="panel-projects"` (~11096) | projects |
| 16 | page-wizard | `id="panel-wizard"` (~11353) | wizard |
| 17 | page-orchestrator | `id="panel-orchestrator"` (~11814) | orchestrator |
| 18 | page-usage | `id="panel-usage"` (~12228; embeds its own style+script — stays whole) | usage |
| 19 | page-settings-shell | `id="panel-settings"` (~13603) | settings |
| 20 | html-bottom-panel | `id="terminalResizer"` (~13637) | bottom-panel |
| 21 | html-chat-panel | `<aside class="chat-panel` (~13816) | chat |
| 22 | html-status-toast | `id="pmToastStack"` (~14317) | bottom-panel |
| 23 | html-floating-chat | `class="floating-chat"` (~14366; incl. `tplThreadTerminalDemo` template) | chat |
| 24 | js-main | `id="pixelGrid"` (~15090) | FROZEN → js-integration |
| 25 | js-terminal-demo | `window.PM_TERMINAL_DEMO = {` (~16648) | demo-engine (adapter shims only) |
| 26 | js-prd-annotations | `function showPRDMock` (~18706) | FROZEN → js-integration |
| 27 | js-shimmer-filters | `Liquid Glass SVG Filters` (~20123) | theme-glass (mostly deleted) |
| 28 | js-settings-data | `<script id="pm4-settings-js">` (~20373; ends after the `window.PM_SETTINGS_DATA = …;` line) | ASSEMBLER-INJECTED from sidecar |
| 29 | js-settings-engine | (line after settings-data assignment) | settings |
| 30 | html-close | `</body>` (last occurrence) | pipeline |

**NEW stub parts** (created empty by carve; inserted at assembly):
- `10x-pm6-css-<name>.part.html` for name in: global (theme-tokens W1; polish extends W3), dashboard, projects, wizard, orchestrator, usage, chat, bottom, panels — each a full `<style id="pm6-css-NAME">…</style>` block. Assembled immediately before `</head>` (i.e., between parts 10 and 11), global FIRST.
- `29x-pm6-js-<name>.part.html` for name in: globals (PM_ICONS hoist + window.toast + PM_PAGES — demo-engine agent), demo-engine (PM_DEMO core+DATA+TEXT), dashboard, projects, wizard, orchestrator, usage, chat, bottom, panels — each a full `<script id="pm6-js-NAME">…</script>` block. Assembled after part 29, globals FIRST, demo-engine SECOND, pages after.

## Conventions (all agents)
- **Ownership is absolute.** Never edit a part you don't own. Needs in frozen/foreign parts → append to `notes/<agent>.requests.md` (file is write-only-by-you; format: `- [part NN] request…`).
- **Immutable contracts:** page roots `class="page page-X" id="panel-X"`; `.page-tab[data-page]` tabs; ids listed in HOOKS.md; `id="projectSettingsModal"` + `.visible`; `#pmToastStack`; part boundary marker lines themselves (first line of your part must keep its marker string; part 24's `pixelGrid` line, etc.).
- **Write-size:** any part you rewrite must stay ≤2200 lines; if larger, split into `NN-name-a/-b.part.html` siblings and note it (carve manifest supports siblings; keep order).
- **New ids/classes:** prefix `pm6-<yourname>-` (e.g. `pm6-orch-*`), except contract hooks. New CSS in your pm6-css block ONLY (token-only: no raw hex outside `[data-theme…]`-scoped rules — use vars from TOKENS.md). New JS in your pm6-js block ONLY; may reference `PM_DEMO`/`PM_ICONS`/`toast`/`PM_PAGES` per PM_DEMO_API.md; attach listeners inside your own roots or via `[data-demo-action]` attributes (the global router dispatches).
- **No emojis ever** — `PM_ICONS` SVGs (see ICONS.md). Allowed typographic glyphs: → ← ✓ ✕ ✖ ➜ ⚠ ▾ ▸ ▲ ▼ ● ⋮ ↳ ↧.
- **Vocabulary:** seam/package/node/lane/worktree; Approve And Build; PlanCompileRun; requested-vs-effective; never tier/phase/task-hierarchy/Pass 1-2-3/Compile Settings/Tauri/platform_specs. (`"tier":"simple|advanced"` inside PM_SETTINGS_DATA JSON is a schema field — leave alone.)
- **Demo rules:** every clickable does something (real action, plausible toast, or disabled+reason from: unsupported, not_configured, not_signed_in, busy, blocked_by_gate, already_done, stale, rate_limited, demo_scope). Use `PM_DEMO.guard`.
- **Themes:** your markup must look right in ALL 8 themes — style via tokens, test at least friendly-dark + retro-dark + glass-dark mentally; theme-specific accents via `[data-theme…] .pm6-…` overrides in your own block.

## Vocab rename (stage-0, mechanical; also enforced by check_vocab.py)
Renames: `orch-tier-` → `orch-lane-` (CSS+HTML+JS identifiers), `data-tier=` → `data-lane=`, `interview-phase-step` → `interview-node-step`, `Multi-Pass Review` → `Auditor review loop`, `1 pass`/`Pass 1|2|3` (orchestrator UI copy) → auditor-loop phrasing.
Exclusions (never touch): `"tier":"simple` / `"tier":"advanced` (settings JSON), `AuroraPhase`, `chattier`, `getAuroraPhase`.
Gate regexes (hard-fail G2+): `\btiers?\b`, `\bphases?\b` (case-insensitive, minus exclusions + `phase_history` if introduced by spec text — avoid introducing), `Pass [123]\b`, `Compile Settings`, `platform_specs`, `Tauri`, `Gemini CLI`.
