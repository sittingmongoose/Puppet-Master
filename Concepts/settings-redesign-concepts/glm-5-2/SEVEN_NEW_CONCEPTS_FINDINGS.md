# Seven New Concepts — Findings (GLM-5.2)

Honest record of defects found and fixed during the 2026-08-18 verification pass over the interrupted build, probe artifacts that were investigated and cleared, and known limitations. Companion to `SEVEN_NEW_CONCEPTS_TEST_REPORT.md`. No winner is chosen.

## 1. Defects found and fixed in this pass

### 1.1 Concept-09 — all 12 edge-tab labels clipped (fixed)
`.n9-edge-tab .vlabel` capped content at 44px while full category names need ~60–84px, so every edge tab on the tome spine showed clipped text. Fixed with short single-word chapter tab labels (General, AI, Safety, Code, Memory, Planning, Crew, Media, Web, Personas, Skills, System) matching the reference board's one-word tabs, plus a `title` tooltip carrying the full category name; full names remain in Home and the stack bar.

### 1.2 Concept-05 + concept-07 — 760/900px squeeze (16 matrix cells, fixed)
True horizontal overflow at 760/900 widths across all 8 themes (16 cells). Fixed with topbar/squeeze layout corrections; re-verified 16/16 cells.

### 1.3 Shared virtualization pad-height bug — 13 sites across all 7 concepts (fixed)
Every virtualized list computed `pad.style.height = padTop` and never added `padBottom`, so the scroll container's content height collapsed to the visible window: programmatic `scrollTop` jumps were clamped (c07 compendium: target 1636px clamped to 730px with 57 rows) and the scrollbar thumb geometry was wrong at every long list. Manual scrolling masked the bug everywhere except c07's deep links. Fixed at all 13 sites (main lists + copy previews) to `padTop + count*rowH + padBottom`; verified with a single-jump-to-bottom probe on all 7 concepts (e.g. c05: scrollTop 62368 / scrollHeight 63003 over 828 rows).

### 1.4 Concept-05 — render dispatcher missing `domain:"all"` branch (fixed, pre-existing)
`renderAll()` pushed `NAV.go({domain:"all"},{replace:true})`, but the dispatcher fell through to `renderDomain(route)`, whose category lookup returned `undefined` and crashed at `ICONS[c.id]` — a TypeError on **every** "All settings index" click. The DOM survived only because the crash preceded the `app.innerHTML` assignment, leaving stale state. All six sibling concepts have the branch; c05 now matches them (dispatcher branch + `NAV.go` in the click handlers, `NAV.go` removed from `renderAll`).

### 1.5 Concept-07 — compendium deep links (4 defects, fixed)
Deep links to rows past the first screen never landed. Root causes, each fixed:
1. **Virtualization clamp** — the shared padBottom bug (§1.3) prevented scrolling to the row at all.
2. **Calm/focus wiped on scroll** — `drawRows()` rebuilt its innerHTML on every scroll tick, destroying the `v2-calm` highlight and focus. Rows gained `tabindex="-1"` + `aria-selected`, and `drawRows()` re-applies `state.calmRow` within a 700ms window.
3. **No scroll-to-row before select** — the deep-link block selected a row that wasn't rendered. It now scrolls to `idx*ROWH − clientHeight/2`, redraws, then selects.
4. **Circular page-card navigation** — `renderDomain`'s deep-link path used `pr.click()`, chaining an extra page-card hop. Replaced with a direct navigation redirect.

### 1.6 Concept-07 — Back-restore redirect loop (fixed)
The §1.5 redirect used `NAV.go(...)`, which **pushed** a second stack entry, so Back popped to the intermediate route — which redirected again, pushing it back. Back could never reach the previous view. The redirect now uses `{replace:true}`; Back restores Home with the query and selected result id.

### 1.7 Accepted-as-is from the interrupted build
The previous agent's already-in-tree fixes (760px topbar corrections, `NAV.jump` back-stack semantics in `assets/v2/pm-routes.js`) were audited, exercised by this pass's suites, and accepted unchanged.

## 2. Probe artifacts investigated and cleared (not product defects)

- **c11 crawl `no-crumb` ×38** — c11 renders its location as `.pm-crumb` chips inside `#pm-topbar` ("Settings › Home › *manager*"), not a `#crumb` element. Shell retention (topbar, project chip, close, 0 iframes) was verified directly; the probe's selector list was extended.
- **c10 copy `no-copy-entry`** — the copy entry is a Home index item; the probe ran after the manager crawl with a stale `idxFilter` value still filtering the command index. The full copy transaction (dialog → source → category preview → apply → receipt → rollback) passes from Home.
- **c10 keyboard `resultsBefore:0`** — c10 deliberately places universal search on the Home hero; in manager views the visible input is the manager-local index filter. Keyboard navigation from Home (24 results, ArrowDown + Enter → manager) passes.
- **Deep-link probe v1 false failures** — two probe rids were guessed ids not present in the inventory (fixed by extracting real rids from the projection), and the probe read the calm class before `land()`'s poll applied it (fixed with a settle-wait). Both were probe bugs; the c07 failures that survived the probe fix were real (§1.5/§1.6).
- **c11 `cta-wall-suspect` ×48** — the matrix's Home-composition probe counted the domain tabstrip as "destinations above search". §03 prohibits scrolling shelves, not nav tabs; a refined probe measuring real composition cleared all 48 cells.

## 3. Known limitations

1. **Backend interactions are simulations** (concept scope): hydration/refresh/copy waits are timed demos; the ObservableWork projection contract (phase labels, waitReason, denominator-gated determinate progress) is the deliverable, not real telemetry.
2. **c07 compendium is inspect-only by design**: the virtualized table shows every inventory row read-only; editable controls live in the domain Key-settings panels (keyCtl/wireCtl). This is the deliberate reading of the A2 Compendium board — a workspace that inspects the whole inventory while editing stays in domain context.
3. **c11's tabstrip is domain navigation** (packet-permitted); the original matrix probe's CTA-wall heuristic misread it — the refined probe measures actual composition.
4. **c10's universal search lives on the Home hero** with a persistent command-index filter in the topbar; manager views intentionally have no second universal search. This is c10's differentiation, exercised and documented rather than "fixed".
5. **Fuzzy search is heuristic scoring** (substring > word-prefix > bounded edit distance > subsequence), stable but hand-weighted; not ranked language-model relevance.
6. **Hash deep links are browser-only**; the route model itself (`pm-routes.js`) is plain data + an explicit state machine, which is the Slint-portable contract, but URL-hash wiring will not port as-is.
7. **Virtualization is proven on the main lists and copy previews** (all 13 windowed sites); smaller demo lists (drawer contents, short manager rosters) render unwindowed by design.
8. **c09 edge tabs use short labels**; the full category names are in the tooltip, Home, and stack bar — a deliberate trade to keep the spine tabs legible at 44px.
9. **Reduced motion was verified via emulated `prefers-reduced-motion`** (parity of manager surface + toggles); OS-level settings cannot be toggled in a headless run.
10. **The 760/900 squeeze fixes were re-verified at 8 themes × 2 widths**; the other 4 widths were direct first-pass passes and were re-covered by the post-fix spot matrix.
11. **Other model folders show working-tree changes** in the shared repo (parallel bakeoff agents); this pass touched nothing outside `glm-5-2/` + its `.pm-tmp/` scratch (deleted).

## 4. Temporary material

All verification scratch (probe scripts, raw result JSON, logs, debug instrumentation) lived in `/mnt/Cursor/PuppetMaster/.pm-tmp/` outside the model folder and was deleted after the per-concept evidence files were refreshed; only the reports and refreshed evidence remain.
