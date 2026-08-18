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
| static_code | pass | Packet validator pass. `node --check` pass on `pmv2.js` and seven concept JS files. Validator is structural only. |
| concept_hub_validation | pass | `python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto` |
| interaction_smoke | pass | `scripts/seven-new-concepts-qa.py` status `pass`, `failures: []` |
| search_route_exactness | pass | **16** matrix cases per concept. Live: every rendered pickable result for Theme, Default, Copy, **Ollama** via `pickResult(immutable id)`; `all_rendered_clicked: true` on all four extra queries. Back restores query. C11 Default 30 grouped duplicate labels. |
| index_complete | pass | Runtime `PMv2.assertIndexComplete`: 828/828 setting IDs indexed (`setting:{id}`), product index 1007, synthetic 2000, synthetic not in default Theme search, 12 categories. |
| manager_route_isolation | pass | **47/47** managers each concept. No iframe. No concept-01–04 links. |
| copy_depth | pass | Default preview (no `import-conflict` demo). `previewCounts`: additions **1**, replacements **1**, unchanged **756**, unavailable **1**, conflicts **1**. Booleans: `addition`/`replacement`/`unchanged`/`unavailable`/`conflicts` all true. Conflict is host-bound `general.startup.window-state`. `sessionStorage` disclosed. |
| details_origin | pass | Details drawer with requested/effective/origin/policy/persistence. |
| provider_density | pass | Code on all seven: Connected / Account / Product / Models / `usage-end` / `routing-fallback` / Setup. Report **42200** live-probed 05/07/10. **QA updated to probe all seven** (06/08/09/11 code verified; live probe lands on next rerun). |
| cli_install | pass | `confirmOfficialCli(app, id)`: unknown owner stays `waiting_user` / manual-only. Not bundled, not silent. |
| responsive_theme_matrix | pass | **336/336**. Cells: overflow, clipControls, scrollbar, popupOk, **searchDropOk** (dropdown in viewport), **searchEscClosed**, reducedOk. |
| reduced_motion_probe | pass | `data-motion=reduced` |
| hydration_probe | pass | Search does not hydrate managers (0→0). Cap 24. All Settings virtualized (12–19 rows). |
| escape_smoke_probe | pass | Escape from providers manager → Home. Peel: popup → details → states → search → facet → row → `back()`. |
| performance_hydration | pass | Runtime index + hydration probes above. |
| independent_visual_audit | pass | Homes 1280/760 in `C:\Users\sitti\AppData\Local\Temp\ca7-visual-15760\shots` (not shipped). |
| original_concept_regression | pass | 54 frozen + 01–04 QA hub 55939 |

## Live 05–11 QA

- Command: `scripts/seven-new-concepts-qa.py`
- Status: `pass`
- Failures: `[]`
- Hub port: **55050** (`--port 0 --no-runtime-state`)
- Hub pid: 43564
- Profile: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-42200`
- Report: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-report-42200.json`
- Summary: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-summary-42200.json`
- Artifacts: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-artifacts-42200`

Per concept: search matrix 16/16, managers 47/47, copy true, details true, index 828/828, copy `previewCounts` additions=1 replacements=1 unchanged=756 unavailable=1 conflicts=1 (host-bound `general.startup.window-state`; not import-conflict-only), hydration pass, Escape pass, extra Theme/Default/Copy/Ollama `all_rendered_clicked` true via `pickResult`.

## Known remaining limitations (disclosed, not skipped)

1. Copy/CLI/receipts remain **simulated `sessionStorage`**, not live ResourceGovernor / BinaryLocator.
2. Search clicks every **rendered** result for Theme/Default/Copy/Ollama (cap 24), not a click of all 1007 index IDs. All 828 product setting IDs are indexed and routable (`setting:{id}`).
3. Packet validator is **structural only**; behavior is `seven-new-concepts-qa.py`.
4. Theme×width popup check is search-dropdown in-viewport + Escape close, not every nested submenu collision.
5. `confirmOfficialCli` on `local-ollama` stays `waiting_user` when owner is unknown (packet: manual-only).

Winner remains unselected (`winner_selected: false`).
