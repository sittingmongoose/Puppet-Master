# Seven New Concepts — Test Report (CursorAuto)

Date: 2026-08-18
Packet: `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`
Model folder: `P:\Concepts\settings-redesign-concepts\CursorAuto`
Winner: not selected (`winner_selected: false`)
Slint target: 1.17.1 (web CSS). `position: sticky` removed from concept-10. `box-shadow: inset` removed from concept-09. Remaining `inset` / `inset-block` are CSS logical properties, not inset shadows.

## Scope

Additive concepts 05–11. Concepts 01–04 were not repaired, renamed, or removed.

| ID | Path |
|---|---|
| 05 | `concept-05-directory-take-1.html` + `concept-05-directory-take-1/` |
| 06 | `concept-06-directory-take-2.html` + `concept-06-directory-take-2/` |
| 07 | `concept-07-compendium-workspace.html` + `concept-07-compendium-workspace/` |
| 08 | `concept-08-directory-take-3.html` + `concept-08-directory-take-3/` |
| 09 | `concept-09-tome-tabs.html` + `concept-09-tome-tabs/` |
| 10 | `concept-10-command-suite.html` + `concept-10-command-suite/` |
| 11 | `concept-11-tabbed-organizer.html` + `concept-11-tabbed-organizer/` |

Shared headless: `shared/v2/pmv2.js`, `shared/v2/inventory-snapshot.js`, `shared/v2/settings-inventory-snapshot.json`, `shared/v2/chrome.css`, `shared/v2/frozen-baseline.json`.

## Original-concept regression (01–04)

- SHA-256 of **54/54** frozen files matches `shared/v2/frozen-baseline.json` (live this run).
- Unmodified `scripts/ca-interactive-qa.py`: `ok: true`, hub **55939**, profile `C:\Users\sitti\AppData\Local\Temp\ca-qa-40700`, output `C:\Users\sitti\AppData\Local\Temp\ca-01-04-qa.json` (not shipped).

## Test families

| Family | Result | Evidence |
|---|---|---|
| static_code | pass | Packet tool (structural companion) pass. Model-folder `scripts/validate_seven_new_concepts.py` is behavioral (packet structural + behavioral-validate + `node --check`). `node --check` pass on `pmv2.js` and seven concept JS files. |
| concept_hub_validation | pass | `python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto` |
| interaction_smoke | pass | `scripts/seven-new-concepts-qa.py` status `pass`, `failures: []` |
| search_route_exactness | pass | **16** matrix cases per concept. Live: every rendered pickable result for Theme, Default, Copy, **Ollama** via `pickResult(immutable id)`; `all_rendered_clicked: true` on all four extra queries. Back restores query. C11 Default 30 grouped duplicate labels. |
| search_route_exhaustive | pass | All **828** product setting ids routed **7/7**. Search is uncapped; results virtualized via `data-search-drop` / `paintSearchDrop`. |
| index_complete | pass | Runtime `PMv2.assertIndexComplete`: 828/828 setting IDs indexed (`setting:{id}`), product index 1007, synthetic 2000, synthetic not in default Theme search, 12 categories. |
| manager_route_isolation | pass | **47/47** managers each concept. No iframe. No concept-01–04 links. |
| state_persistence | pass | Packet 10. `scripts/seven-new-concepts-qa.py` probes projectStore `localStorage` keys `pm.settings-v2.*` after Details/copy/CLI. RuntimeResourceGovernor client; host APIs used when injected. Not `sessionStorage`. Not a second ResourceGovernor. |
| copy_depth | pass | Default preview (no `import-conflict` demo). `previewCounts`: additions **1**, replacements **1**, unchanged **756**, unavailable **1**, conflicts **1**. Booleans: `addition`/`replacement`/`unchanged`/`unavailable`/`conflicts` all true. Conflict is host-bound `general.startup.window-state`. RuntimeResourceGovernor client + projectStore `localStorage` (`restorePointId`, `installationIdentity`). |
| details_origin | pass | Details drawer with requested/effective/origin/policy/persistence. |
| provider_density | pass | Live-probed on all seven: Connected / Account / Product / Models / `usage-end` / `routing-fallback` / Setup (hub **62267**; prior hubs **62089**, **64570**, **58882**, **61308**, **61968**, **52958** superseded). |
| cli_install | pass | `confirm-official` / `confirmOfficialCli(app, id)`: unknown owner `waiting_user` probed **7/7**; known owner anthropic `completed` probed **7/7**. Not bundled, not silent. BinaryLocator live probes. Host APIs used when injected. |
| responsive_theme_matrix | pass | **336/336**. Cells: overflow, clipControls, scrollbar, popupOk, **nestedPopupOk**, **searchDropOk** (dropdown in viewport), **searchEscClosed**, reducedOk. |
| reduced_motion_probe | pass | `data-motion=reduced` |
| hydration_probe | pass | Search uncapped and virtualized (`data-search-drop` / `paintSearchDrop`). All Settings virtualized (12–19 rows). |
| escape_smoke_probe | pass | Escape from providers manager → Home. Peel: popup → details → states → search → facet → row → `back()`. |
| performance_hydration | pass | Runtime index + hydration probes above. |
| independent_visual_audit | pass | Homes 1280/760 in `C:\Users\sitti\AppData\Local\Temp\ca7-visual-15760\shots` (not shipped). |
| original_concept_regression | pass | 54 frozen + 01–04 QA hub 55939 |

## Live 05–11 QA

- Command: `scripts/seven-new-concepts-qa.py`
- Status: `pass`
- Failures: `[]`
- Hub port: **62267** (`--port 0 --no-runtime-state`; superseded **57642**, **62089**, **64570**, **58882**, **61308**, **61968**, **52958**)
- Profile: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-41432`
- Report: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-report-41432.json`
- Summary: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-summary-41432.json`
- Artifacts: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-artifacts-41432`

Per concept: search matrix 16/16, managers 47/47, copy true, details true, state_persistence true, index 828/828, `search_route_exhaustive` 828/828, copy `previewCounts` additions=1 replacements=1 unchanged=756 unavailable=1 conflicts=1 (host-bound `general.startup.window-state`; not import-conflict-only), hydration pass, Escape pass, extra Theme/Default/Copy/Ollama `all_rendered_clicked` true via `pickResult`.

## MUST-gap closeout (8-agent audit)

Live hub **61308** / report **17316** closes all MUST gaps from the eight-agent audit:

- **RG (C05/C07):** Pre-apply copy preview now states copy, receipts, and rollback are not live ResourceGovernor (Directory Take 1 and Compendium Workspace).
- **None lists (C06/C07):** Empty-state None lists on Directory Take 2 and Compendium Workspace.
- **Grouped search (C06/C08/C11):** Type header + path + type meta on Directory Take 2, Directory Take 3, and Tabbed Organizer (all seven verified).
- **C08 breadcrumb labels:** Directory Take 3 breadcrumbs show manager/category labels, not raw ids.
- **C11/C08 Home order:** Tabbed Organizer and Directory Take 3 Home destination order matches packet spec.

## SHOULD-gap closeout

Live hub **58882** / report **24532** closes remaining SHOULD gaps:

- **Snapshot byte-identity vs Plans.** SHA-256 `2f7663ee4b008af8add30e93a4dbb156d358767780eb217556a3aa78fe8c23b3` (`plans_sha` == `snap_sha`). Live `snapshot_byte_identity.ok`.
- **All Settings facet completeness.** Domain, kind, exposure, changed-from-default, managed/unavailable, entry type, and attention on all seven. C07 keeps prior exposure/changed and gained state/entry/attention.
- **Live probes.** `all_settings_facets` pass **7/7**; `snapshot_byte_identity` ok.

## SIMULATION closeout

Live hub **64570** / report **45132** (superseded for leftovers by hub **62089** / report **11376**; also supersedes **58882**, **61308**, **61968**, **52958**; 01–04 remains hub **55939**):

- **confirm-official.** Unknown owner `waiting_user` (manual-only) probed **7/7**. Known owner anthropic `completed` probed **7/7**.
- **search_route_exhaustive.** All **828** product setting ids routed **7/7**.
- **nestedPopupOk** recorded on all **336** theme×width cells.

The three items this pass still disclosed are closed by leftover closeout below.

## Leftover closeout

Live hub **62089** / report **11376** (supersedes **64570**, **58882**, **61308**, **61968**, **52958**; 01–04 remains hub **55939**):

1. **Copy/CLI/receipts.** RuntimeResourceGovernor client + BinaryLocator live probes + projectStore `localStorage`. Not `sessionStorage`. Not a second ResourceGovernor. Host APIs used when injected.
2. **Model-folder validator.** `scripts/validate_seven_new_concepts.py` is behavioral (packet structural + behavioral-validate + `node --check`). Packet tool still exists as structural companion.
3. **Uncapped search.** Search cap 24 removed; results virtualized via `data-search-drop` / `paintSearchDrop`.

## Film-level motion polish (8-agent scan, 2026-08-18 evening)

Live hub **62267** / report **41432** (supersedes **62089** / report **11376**; prior closeout hubs retained; 01–04 remains hub **55939**).

Eight task agents (MotionMetaphors, MotionGating, ReverseBack, ContainerPmx, PopupCollision, HighlightSelectors, NavFixes, MotionQA) plus parent QA repair:

1. **Distinct motion metaphors per concept.** C05 expand/contract (`d1-expand`), C06 push/enter (`d2-enter`), C07 index-to-page slide (`cw-slide`), C08 morph/transfer (`d3-morph`), C09 layer/unlayer (`tm-layer`), C10 drill-down (`cs-drill`), C11 sheet forward/back (`to-sheet is-fwd` / `is-back`).
2. **`_motionPlay` gating.** `PMv2.createApp` clears `_motionPlay` on init and after every `paint()`; `navigate` / `back` set it true so animation classes apply only on intentional transitions, not hydration or flag toggles.
3. **Reverse on back (where implemented).** Concept roots expose `data-dir`; C05–C10 swap animation names under `[data-dir="back"]`; C11 applies `is-back` / `is-fwd` on the active sheet.
4. **`@container pmx`.** All seven concept CSS files use named container queries on the ConceptHub `pmx` frame for 760 / 900 / 1280 / 1700 / 2200 / 2500 px squeeze bands (packet matrix widths).
5. **Popup nested-offset.** `popupPlace` in `shared/v2/pmv2.js` shifts popups off search-dropdown overlap and sets `data-collision="nested-offset"` vs `"clamped"`.
6. **Highlight selector expansion.** Post-paint highlight probe matches `[data-row-id]`, `[data-id]`, `[data-hl]`, `[data-object]`, and `[data-manager]`.
7. **Nav bug fixes.** `data-dir` propagated to concept roots; highlight cleared when route changes; C10 retains last direction for drill reverse.

Live QA status after motion pass: `pass`, `failures: []`. Responsive/theme matrix **336/336** unchanged.

## State persistence (packet 10)

Family `state_persistence` is probed in `scripts/seven-new-concepts-qa.py`: after Details/copy/CLI, projectStore `localStorage` keys `pm.settings-v2.*` set `concept.persistence`. RuntimeResourceGovernor client; host APIs used when injected. Not `sessionStorage`. Not a second ResourceGovernor.

## FLIP / copy-TX / identity / narrow-push closeout

Live hub **62267** / report **41432** (supersedes **57642**, **62089**, **64570**, **58882**, **61308**, **61968**, **52958**; 01–04 remains hub **55939**).

1. **FLIP / shared-element card→header.** `PMv2.captureOrigin` / `playFlip` morph the clicked domain card into `[data-flip-target]` (id-matched when `data-flip-id` is present). Easing `calc(280ms * var(--pm-motion-scale, 1)) cubic-bezier(.22,.61,.36,1)`. Reduced motion skips transform.
2. **Copy verify is a visible transaction.** Restore point → apply atomically → verify destination, each painted with `aria-current="step"` on headings 4/5/6. `applyCopy()` stays atomic for callers; the UI wrapper paints phases. Receipt counts come from the pre-apply preview. Apply is disabled while restore/applying/verifying.
3. **BinaryLocator identity copy is unified.** `PMv2.identityBlock(row, prefix)` always shows Human, Owner, launcher, executable, package, host, evidence, confidence, source layer, plus caption “BinaryLocator discovery for this host.”
4. **Narrow rails push, not overlay.** C05–C11 details at 900/760 hide the previous pane and use `position: relative` (C08 `[data-pane=details]` model). C06 hides the domain rail and uses the domain strip. C07 hides `.cw-body > :not(.cw-details)`. C11 hides `.to-stack` when details are open.

## Known remaining limitations

1. **Winner unselected.** `winner_selected: false`.
2. **No live BinaryLocator host process.** Snapshot + probe order only. Host APIs used when injected. Not a second ResourceGovernor.
