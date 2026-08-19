# Seven New Concepts — Test Report (GLM-5.2)

- **Model folder:** `Concepts/settings-redesign-concepts/glm-5-2/`
- **Concepts:** 05 A1 Directory / Take 1, 06 A1 Directory / Take 2, 07 A2 Compendium Workspace / Take 1, 08 A1 Directory / Take 3, 09 Rethemed Tome Tabs, 10 Rethemed Command Suite, 11 Rethemed Tabbed Organizer
- **Packet:** `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18` (complete cumulative authority)
- **Verification date:** 2026-08-18 (completion pass over the interrupted build)
- **Method:** Playwright 1.63-alpha headless Chromium (`chrome-headless-shell` 1234) driving each concept page over a local HTTP server (127.0.0.1:8471). Every probe below ran against the final post-fix code; scratch scripts and raw JSON lived in `.pm-tmp/` outside the repo tree and were deleted after the evidence files were refreshed.

## 1. Theme × width verification matrix (336 cells)

**Matrix:** 7 concepts × 8 themes (friendly/glass/retro/basic × dark/light) × 6 widths (760/900/1280/1700/2200/2500).

**Per-cell checks:** zero console/page errors; no true horizontal overflow (`documentElement.scrollWidth > innerWidth`); no clipped text (computed-style + scroll-vs-client geometry probe on leaf text nodes, ellipsis-aware); no Activity Bar overlap of the stage; PM scrollbar presence; Home composition sanity (search first, destinations dominant, no CTA wall).

**Result: 336/336 pass (effective), reached in two passes:**

| First pass | Cells | Disposition |
|---|---|---|
| Direct pass | 272 | — |
| True horizontal overflow (c05 + c07, 760/900 × 8 themes) | 16 | Fixed (topbar/squeeze CSS + layout corrections, incl. the c05 dispatcher crash fix that surfaced during re-testing); re-verified **16/16 pass** |
| c11 `cta-wall-suspect` (8 themes × 6 widths) | 48 | Probe miscalibration: the probe counted the packet-permitted domain tabstrip as "destinations above search". §03 prohibits scrolling shelves, not nav tabs. A refined probe measuring actual Home composition re-verified **48/48 pass** |

A post-fix spot matrix (2 themes × 6 widths × 7 concepts = 84 cells) re-ran after the virtualization repair: 72/72 real cells pass; the remaining 12 c11 cells were the same known probe artifact, cleared by the refined probe above.

**Zero console/page errors in every cell of every run.**

## 2. Functional layers (all 7 concepts, final run)

| Layer | Probe | c05 | c06 | c07 | c08 | c09 | c10 | c11 |
|---|---|---|---|---|---|---|---|---|
| Search: deep setting row → exact row + calm + focus | `res.set.general.visual.theme` | pass | pass | pass | pass | pass | pass | pass |
| Search: Back restores query + result id | Home input + lastRid | pass | pass | pass | pass | pass | pass | pass |
| Search: duplicate labels → distinct objects by rid | `playground` | pass | pass | pass | pass | pass | pass | pass |
| Search: typo/fuzzy | `aproval` → 29 results | pass | pass | pass | pass | pass | pass | pass |
| Search: manager result | `res.mgr.mgr.terminal` | pass | pass | pass | pass | pass | pass | pass |
| Search: managed object | `res.obj.prov.claude-cli` | pass | pass | pass | pass | pass | pass | pass |
| Search: unavailable result with reason | `res.obj.med.video` | pass | pass | pass | pass | pass | pass | pass |
| Search: setup/repair workflow | → `mgr.provider`/`prov.codex-cli` | pass | pass | pass | pass | pass | pass | pass |
| Search: grouped results (type-grouped, rid selection) | `notifications` | pass | pass | pass | pass | pass | pass | pass |
| Search: keyboard nav (ArrowDown + Enter from Home) | `terminal` | pass | pass | pass | pass | pass | pass | pass |
| Manager isolation crawl | all 38 managers | 38/38 | 38/38 | 38/38 | 38/38 | 38/38 | 38/38 | 38/38 |
| Copy Settings end-to-end | dialog → … → rollback | pass | pass | pass | pass | pass | pass | pass |
| Lazy hydration | managers at load / search hydration | 0 / none | 0 / none | 0 / none | 0 / none | 0 / none | 0 / none | 0 / none |
| Bounded search results | truncated flag | pass | pass | pass | pass | pass | pass | pass |
| State fixtures | 9 status kinds in demo data | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 |
| Reduced-motion parity | manager + toggle under RM | pass | pass | pass | pass | pass | pass | pass |
| Narrow (760) push navigation | overflow + Back | pass | pass | pass | pass | pass | pass | pass |
| Console/page errors | entire run | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### Probe notes (honest scope statements)

- **Manager isolation crawl** asserts per manager route: `state.manager === expected`, PM shell retained (topbar, project chip, close control, breadcrumb), 0 iframes, 0 location (pathname) changes, and collects rendered state-fixture labels (29–232 distinct labels observed per concept). c11 renders its breadcrumb as `.pm-crumb` chips in `#pm-topbar` rather than a `#crumb` element; the selector list was extended to match — shell retention itself was verified, not skipped.
- **Keyboard navigation** is probed from Home for all concepts because that is where every concept places its universal search. c10's persistent topbar `idxFilter` is a command-index filter, not universal search; typing into it filters the index (its value persists across views by design, matching c05's facet filter persistence).
- **c10 copy entry** is a Home index item; the end-to-end copy flow was verified from Home (dialog → source → category preview with additions/replacements/unchanged/conflicts + reference-credentials copy → apply → receipt with restore point → rollback → Done).

## 3. Exact deep links (28/28)

Each concept loaded four deep-link hash routes straight from a fresh page (no in-app warm-up), then asserted the target row rendered inside the virtualized window with the `v2-calm` non-flashing highlight and focus:

| Concept | Probes (all calm + focused) |
|---|---|
| c05 | `general.visual.theme-preview` · `memory.retention.half-life-by-kind` · `system.advanced.log-verbosity` · `general.interaction.sound-management` |
| c06 | same four |
| c07 | same four (compendium table; inspect-only rows, calm + focus after virtualized scroll-to-row) |
| c08 | same four |
| c09 | same four |
| c10 | same four |
| c11 | same four |

**28/28 pass.** c07 required a real repair first (see FINDINGS): the compendium's virtualized pad omitted `padBottom`, so programmatic `scrollTop` was clamped at 730px and deep rows past the fold never entered the render window.

## 4. Virtualization full-range proof (all 7 concepts)

A single programmatic jump to the bottom of each concept's main virtualized list now reaches the true scroll extent. Example (c05 all-settings index): `scrollTop 62368 / scrollHeight 63003` — 828 rows, last row `system.advanced.inspect-holds-quarantine`, 14 DOM rows at the target. The same probe passes on all 7 concepts (c07 compendium: 42376/43105, 20 DOM rows). Before the fix, `pad.style.height` used `padTop` only, clamping every long jump and distorting scrollbar geometry at all 13 virtualization sites across the 7 concepts.

## 5. Search index and inventory coverage

- **Inventory:** 828 settings projected verbatim from the shared inventory projection (`assets/v2/pm-inventory.js`), all 12 categories + subgroups, per concept.
- **Search index:** 1126 entries per concept (`PM2.search.size()`): 828 settings + 38 managers + managed objects + actions + setup/repair workflows + diagnostics + unavailable-capability entries, each with immutable rid, type, label, complete path, and destination object.
- **Routing:** always by immutable result id → `PM2.routes.planFor(dest)` → concept-native execution (load domain → page → manager → object → section → row → focus → calm highlight); never by rendered array index or grouped position.
- **Search contract cases:** all 9 required cases pass per concept (see §2 and each concept's `search-route-matrix.json`, now carrying measured per-case outcomes).

## 6. Manager coverage

Per concept: **42 families demonstrated natively, 9 deferred to named canonical owners, 0 missing** (`manager-coverage.json`; no `shared_grammar`). All **38 manager routes** verified by the isolation crawl per concept (266 manager-route openings total), each opening inside its own concept with the shell retained, 0 iframes, 0 cross-concept navigation.

## 7. Regression — frozen surfaces

- This pass made **zero modifications outside `glm-5-2/`** (plus the untracked `.pm-tmp/` scratch directory, deleted at the end). `git status` confirms: concepts 01–04 (`glm-5-2/concept-0[1-4]*`), PMConcept7, `Plans/`, Settings inventory/schema, canonical Commands/Wiring/DRY owners, Usage, Assistant Chat, and ConceptHub itself are untouched. Other model folders (`CursorAuto`, `Opus 5`, `Qwen 5.8`, `kimi-k3`) do show working-tree changes, but those belong to parallel bakeoff agents in the shared worktree — none were made by this pass.
- The shared asset `assets/v2/pm-routes.js` carries only the previous (interrupted) agent's additive `Nav.prototype.jump` helper — this verification pass did not modify it or any other `assets/v2/` file.
- Concepts 01–04 load cleanly (their assets are independent of `assets/v2/`, which is new and additive).

## 8. Summary

| Metric | Result |
|---|---|
| Theme × width matrix | 336/336 (272 direct + 16 fixed-and-reverified + 48 refined-probe reverified) |
| Functional layers | all green on all 7 concepts (final post-fix run) |
| Exact deep links | 28/28 with calm + focus |
| Search contract cases | 9/9 × 7 concepts |
| Manager isolation | 38/38 routes × 7 concepts, 0 cross-concept, 0 iframes |
| Copy Settings | full transaction incl. rollback × 7 |
| Virtualization | full-range scroll extent × 7 |
| State fixtures | 9 status kinds × 7 |
| Console/page errors | 0 across every run |

Defects found and fixed during this verification pass, and known limitations, are listed in `SEVEN_NEW_CONCEPTS_FINDINGS.md`. No winner is chosen.
