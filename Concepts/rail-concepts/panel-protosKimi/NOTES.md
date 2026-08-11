# panel-protosKimi — Side-Panel Redesign Prototypes

6 design families x 7 left side panels = 42 redesign concepts for the
PMConcept7 activity-bar panels: **Search, Source Control, GitHub Actions,
Docker Manager, Testing, Agents, Runtime Artifacts**.

Open `index.html` in a browser. Everything is static + working chrome (menus,
tabs, accordions, filters, hovers); there is no demo engine.

## Harness controls

- **Activity bar** (left, 48px canon width) — switch panels. Files / Chat /
  Run & Debug are greyed placeholders (not in this redesign round).
- **Variant menu** (title bar) — the 6 concepts for the current panel.
  Variant memory is per-panel, so you can mix; **apply to all** pins the
  current variant number across every panel (family-consistent review).
- **Width presets** — 200 (PMConcept7 resizer floor) / 240 (canonical
  FinalGUISpec clamp) / 320 (default) / 480 (canonical max). The drag handle
  on the panel's right edge free-resizes 200-480; double-click resets.
- **Density** — Demo (seeded content) / Busy (+4 rows per list) / Crowded
  (+12 rows per list, with deliberately long branch/file/container names).
  Rows are cloned family-natively (each family's own row markup) from
  per-panel corpora, so crowding looks real in every variant. This is the
  stress test the old designs failed.
- **Theme menu** — all 8 themes (PM menu, of course).

Motion: PM sprout menus (corner-origin, overshoot open, reduced-motion
instant), accordion expand fade/slide, tab-view crossfade, hover
transitions, pulsing running-dots. Focus Mode (v6) drill-in is fully
functional: nav item -> full-height section, crumb -> back home.

## The 6 families

| v | Name | Idea |
|---|------|------|
| 1 | **Ledger** | The current accordion, fixed: strict two-column KV grids, right-aligned values, clamped metas, clean section rhythm. The low-risk baseline. |
| 2 | **Rail Tabs** | Each panel's canonical subviews become an icon-tab strip under the header. One view at a time; no accordion towers. |
| 3 | **Receipt Feed** | Everything is a uniform compact card (title / meta / status / hover actions) in one filterable feed. |
| 4 | **Data Grid** | Sticky section bands, fixed columns (dot / label / right-aligned mono meta), selected-row accent bar. Densest. |
| 5 | **Command Bar** | Status stats + primary actions pinned under the header; below, a single quiet flat list. |
| 6 | **Focus Mode** | Only one section exists at a time: a home screen (or header section menu) drills into full-height views. Best narrow-width readability. |

## What every variant keeps (spec traceability)

- **Search** (F3-045/046/048): index freshness states
  (`indexed/stale/unindexed/fallback`), `(unindexed)` annotation owned by the
  results pane, query + toggleable replace row, `.*`/`Aa`/`\b` flags, scope
  picker (**PM menu, was a native select**), grouped grep rows with line
  numbers + match highlights, Replace/Replace all, Prev/Next, Rebuild index.
- **Source Control** (W-014/031/032/033/034): branch picker (**PM menu, was a
  native select**) with read-only owned branches, staged/unstaged groups with
  per-file actions, advisory AI commit, Pull/Push/Fetch + incoming/outgoing +
  "git mutations do not join editor undo", remote projection badges
  (freshness/health), worktree rows (status pill, branch, owner, expand for
  path/base/PR + actions, Remove disabled-with-reason), ownership filters,
  history, mini graph, branches & stash.
- **GitHub Actions** (GI-006/008/012/015/017, GAAAF-007/014): connection card
  (requested = effective, scope matrix), missing-workflow-scope blocked state
  + reconnect CTA, current-branch readiness + snapshot transport/age, run
  rows, auto-expanded failure triage (job/step/log/changed files/likely next
  + Rerun/Compare last green/Open in browser), status checks empty state,
  workflows with Dispatch disabled `not_configured`, secrets/variables
  names-only with set/missing chips.
- **Docker Manager** (CRAU-007/009/011/012/013/022/029/035/063): runtime
  detection banner, Containers (lifecycle actions, restart-loop attention),
  Images (digest note, Pull, Cleanup Advisor dry-run/protected assets),
  Compose (services, Compose up, scenarios incl. stale-disabled Run),
  Registries (capability-blocked ghcr with reason + recovery), Build/Bake
  (target/tag/digest, buildx note), Publish/Unraid (5-stage chain, hard gate,
  template states, missing-link note), Advanced foldouts
  (Networks/Volumes/Contexts), Docker/Hosts as a routed-page deep link.
- **Testing** (F3-451, ATS panel regions, RM-049): `show_when_possible`
  policy, last-run receipt (status/result/when), suites, history
  (failed->fixed), Run tests control, Watch/Cancel disabled unless running,
  Open failure/receipt, blocked != failed, redaction note.
- **Agents** (F3-452): mirrors the subagent registry — active subagents
  (state chip from the canonical taxonomy), available types, lineage
  entrypoints (Run Graph / thread), Open Chat. Never keeps own state.
- **Runtime Artifacts** (RAP-003/008/012/026/030/045): compact receipts with
  family chip, trust badges (freshness/health), typed rows `api_web_call`
  (provenance chips agent_judgment/scope/approved + Sources/Open in Chat) and
  `browser_recording` (Open/Watch), live slot, investigation bundle
  (baseline/repro/diagnosis/fix/verification + Orchestrator Evidence link),
  All/Web/Browser/Evidence filters, payload-on-demand previews.

Cross-cutting: blocked = disabled-with-reason + recovery CTA (never hidden);
canonical status vocabulary; 24px min hit targets; ellipsis truncation;
empty-state taxonomy; no emojis; inline SVG only.

## Native `<select>` inventory (PMConcept7)

**Replaced in these prototypes** (all panel instances):
1. Search scope (All Files / Open Files / src / web) -> PM menu
2. Run & Debug launch config -> (panel not in this round; PM menu pattern ready)
3. Source Control branch switcher -> PM menu

**Deferred — page-level, same PM menu component applies** (9):
Projects: `projectsSortBy`, `projectsFilterLang`, `projectsFilterStatus`.
Orchestrator: `pm6OrchEvFamily`, `pm6OrchLedgerFilter`.
Usage: `pm6UsageLedgerPlat`, `pm6UsageLedgerType`, `pm6UsageLedgerRep`.
Plus one JS string-built select in the wizard page (~line 20682).

## Slint 1.17.1 mapping notes

- All theming is token-driven (`:root` + `[data-theme]` ports of the PM7
  token tables); component CSS never branches on theme. Slint: one `Theme`
  global + per-variant precomputed tables (F3-426).
- No runtime `color-mix` in new component styles (chips/dots use it in the
  token layer only, matching PM7's own approach; bake to constants for Slint).
- Layouts are flex/grid that map to `VerticalLayout`/`HorizontalLayout`/
  `GridLayout`; lists are uniform rows -> `Repeater` + model.
- PM menus (`.pp-menuwrap` pattern) = custom trigger + popup, sprout motion
  per ACD-439 (corner origin, ~300ms overshoot open, ~220ms close, reduced
  motion instant). Slint: `PopupWindow`, never native `ComboBox`.
- No backdrop-filter anywhere inside panels (glass = step-1/2 plain fills per
  F3-427); no SVG filters; animations only opacity/translate/height.

## Verification (verify/capture.mjs)

- **Overflow sweep: 1,722 states** — 1,344 demo-density (7 panels x 6
  variants x 8 themes x 4 widths) + 378 crowded (3 spacing-extreme themes x
  3 narrow widths x all variants) — 0 horizontal-overflow failures, 0
  console errors. Report: `verify/report.json`.
- **Screenshots: 306** in `verify/shots/` — variant matrix at friendly-dark
  (168), every family x theme at 200/480 on Source Control (96), crowded
  matrix at 240 (42). Probe shots (`_anim-*`) capture the sprout menu
  mid-animation; `_fix-*` shots verify the narrow-width chip-wrap fix.
- **Visual audit (2026-07-24):** every variant inspected at 320px plus
  theme extremes (retro/basic at 200, glass/friendly at 480) and the full
  crowded matrix. Findings fixed: crowd-clone markers leaked onto composite
  cards (triage/status/investigation/cleanup-advisor — removed, clones now
  only replicate plain rows); wrapped status chips lost to inline-style
  margin at <280px (fixed with !important); Command Bar stat labels
  truncated (shortened); duplicated worktree state chip on the Source v6
  home card (now "needs PR"); corpus HTML entities literalized by
  textContent writes (switched to literal characters).
- Gates: `node --check` on all JS; zero `<select>`/`<option>`/`<datalist>`
  in the folder; `pm6-build/checks/check_no_emoji.py` clean.
- Gates: `node --check` on all JS; zero `<select>`/`<option>`/`<datalist>` in
  the folder; `pm6-build/checks/check_no_emoji.py` clean.
- Re-run: `node verify/capture.mjs --modules <dir-with-playwright>`
  (`--sweep-only` for the fast pass).
