# Seven New Concepts — Findings (CursorAuto)

Date: 2026-08-18
Packet: `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`
Winner: not selected (`winner_selected: false`)

## Live verification

- Hub: **62267** (`ConceptHub --port 0 --no-runtime-state`; superseded **57642**, **62089**, **64570**, **58882**, **61308**, **61968**, **52958**)
- Profile: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-41432`
- Report: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-report-41432.json`
- Frozen SHA-256: **54/54** match `shared/v2/frozen-baseline.json`
- Responsive/theme matrix: **336/336** pass (`searchDropOk`, `searchEscClosed`, `nestedPopupOk`, overflow, clip, scrollbar, popup, reduced motion)
- Live QA status: `pass`, `failures: []`

## What was added

Seven complete Settings concepts in `P:\Concepts\settings-redesign-concepts\CursorAuto`. Frozen 01–04 (Harbor / Score / Switchboard / Archive) unmodified.

Visible surfaces are concept-native. `shared/v2/pmv2.js` is headless inventory/search/copy/state only.

## Remaining-limit closeout (this pass)

Eight task agents (Pmv2Limits, ProvC06C08, ProvC09C11, SlintCSS, CensusJson, QAScript, EvidenceMatrices, FindFixMisc) plus parent QA repair:

1. **Index completeness (runtime).** `PMv2.assertIndexComplete()`: 828/828 `setting:{id}` present, product index 1007, 2000 synthetic excluded from default search. Live QA `index_complete.ok` on all seven.
2. **Search exactness.** **16** matrix cases per concept from `search-route-matrix.json`, plus Theme / Default / Copy / Ollama: every rendered pickable result routed via `pickResult(immutable id)` (not Playwright DOM click — chrome intercepts). Back restores query. C11 Default shows 30 grouped duplicate labels.
3. **Default copy conflicts.** Default preview (no `import-conflict` demo) always includes host-bound **`general.startup.window-state`** (Remember Window Layout) as the sole conflict. Live `previewConflictCount=1`, `importConflictDemo=false`. `previewCounts`: additions **1**, replacements **1**, unchanged **756**, unavailable **1**, conflicts **1**.
4. **Simulated backend deepened.** `applyCopy` phases committing → verifying → completed | recovery_required. `installOfficialCli` waits; `confirmOfficialCli(app, id)` runs official-source install or stays manual-only. Leftover closeout (hub **62089**) moved copy/CLI/receipts to the RuntimeResourceGovernor client, BinaryLocator live probes, and projectStore `localStorage` (`restorePointId`, `installationIdentity`). Not `sessionStorage`. Not a second ResourceGovernor. Host APIs used when injected.
5. **Provider density.** Live-probed on all seven: Connected / Account / Product / Models / `usage-end` / `routing-fallback` / Setup (latest hub **62089**; prior **64570** superseded).
6. **Slint 1.17.1.** No `position:sticky` in 05–11 CSS. No `box-shadow: inset`. 760px squeeze kept. 09–11 no parchment/brass/steampunk/CRT/terminal-green/binder.
7. **Candidate census.** 13 command entries × 7 concepts with packet §09 fields. 10 wiring traces including search pick, copy preview/apply/rollback, CLI, details, provider routing, Escape, All Settings `setting:` rows.
8. **Matrix popup.** 336 cells record `searchDropOk` (dropdown in viewport), `searchEscClosed`, and `nestedPopupOk`.
9. **Grouped search.** All seven concepts' dropdowns show type header + path + type meta.
10. **C11 `goDomain`** still `app.navigate` (stack not truncated).

## MUST-gap closeout (8-agent audit)

Live hub **61308** / report **17316** closes all MUST gaps from the eight-agent audit:

- **RG (C05/C07):** Pre-apply copy preview now states copy, receipts, and rollback are not live ResourceGovernor (Directory Take 1 and Compendium Workspace).
- **None lists (C06/C07):** Empty-state None lists on Directory Take 2 and Compendium Workspace.
- **Grouped search (C06/C08/C11):** Type header + path + type meta on Directory Take 2, Directory Take 3, and Tabbed Organizer (all seven verified).
- **C08 breadcrumb labels:** Directory Take 3 breadcrumbs show manager/category labels, not raw ids.
- **C11/C08 Home order:** Tabbed Organizer and Directory Take 3 Home destination order matches packet spec.

## SHOULD-gap closeout

Live hub **58882** / report **24532** closes remaining SHOULD gaps (MUST closeout above is unchanged):

- **Snapshot byte-identity vs Plans.** `shared/v2/settings-inventory-snapshot.json` SHA-256 `2f7663ee4b008af8add30e93a4dbb156d358767780eb217556a3aa78fe8c23b3` matches Plans `settings_inventory.json`. Live `snapshot_byte_identity.ok`.
- **All Settings facet completeness.** Domain, kind, exposure, changed-from-default, managed/unavailable, entry type, and attention on all seven concepts. C07 (Compendium Workspace) keeps prior exposure/changed and gained state/entry/attention.
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
3. **Uncapped search.** Search cap 24 removed; uncapped search results are virtualized via `data-search-drop` / `paintSearchDrop`.

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

## Manager coverage

42 `demonstrated` + 9 `deferred_named_owner`. 0 `shared_grammar`. 0 `missing`. Live crawl 47/47.

## Candidate impact (not applied to canon)

Reuse: `cmd.settings.open`, `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh`.

New candidates: `cmd.settings.search.submit`, `cmd.settings.search.pick_result`, `cmd.settings.copy_from_project.preview/.apply/.rollback`, `cmd.provider.cli.install_official`, `cmd.settings.details.open`.

DRY: consume SettingsSearch / ManagerSemantics / ObservableWork / RuntimeResourceGovernor / Project identity. Do not create a second ResourceGovernor. `shared/v2` is headless only.

## Isolation

No iframe. No links to concept-01–04. Packet validator pass. Model-folder behavioral validator pass. ConceptHub validate.py pass. `node --check` pass.

## FLIP / copy-TX / identity / narrow-push closeout

Live hub **62267** / report **41432** (supersedes **57642**, **62089**, **64570**, **58882**, **61308**, **61968**, **52958**; 01–04 remains hub **55939**).

1. **FLIP / shared-element card→header.** `PMv2.captureOrigin` / `playFlip` morph the clicked domain card into `[data-flip-target]` (id-matched when `data-flip-id` is present). Easing `calc(280ms * var(--pm-motion-scale, 1)) cubic-bezier(.22,.61,.36,1)`. Reduced motion skips transform.
2. **Copy verify is a visible transaction.** Restore point → apply atomically → verify destination, each painted with `aria-current="step"` on headings 4/5/6. `applyCopy()` stays atomic for callers; the UI wrapper paints phases. Receipt counts come from the pre-apply preview. Apply is disabled while restore/applying/verifying.
3. **BinaryLocator identity copy is unified.** `PMv2.identityBlock(row, prefix)` always shows Human, Owner, launcher, executable, package, host, evidence, confidence, source layer, plus caption “BinaryLocator discovery for this host.”
4. **Narrow rails push, not overlay.** C05–C11 details at 900/760 hide the previous pane and use `position: relative` (C08 `[data-pane=details]` model). C06 hides the domain rail and uses the domain strip. C07 hides `.cw-body > :not(.cw-details)`. C11 hides `.to-stack` when details are open.

## Known remaining limitations

1. **Winner unselected.** `winner_selected: false`.
2. **No live BinaryLocator host process.** Snapshot + probe order only. Host APIs used when injected. Not a second ResourceGovernor.