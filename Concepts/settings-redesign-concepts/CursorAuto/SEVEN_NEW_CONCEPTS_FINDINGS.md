# Seven New Concepts — Findings (CursorAuto)

Date: 2026-08-18
Packet: `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`
Winner: not selected (`winner_selected: false`)

## Live verification

- Hub: **55050** (`ConceptHub --port 0 --no-runtime-state`)
- Profile: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-42200`
- Report: `C:\Users\sitti\AppData\Local\Temp\ca7-qa-report-42200.json`
- Frozen SHA-256: **54/54** match `shared/v2/frozen-baseline.json`
- Responsive/theme matrix: **336/336** pass (`searchDropOk`, `searchEscClosed`, overflow, clip, scrollbar, popup, reduced motion)
- Live QA status: `pass`, `failures: []`

## What was added

Seven complete Settings concepts in `P:\Concepts\settings-redesign-concepts\CursorAuto`. Frozen 01–04 (Harbor / Score / Switchboard / Archive) unmodified.

Visible surfaces are concept-native. `shared/v2/pmv2.js` is headless inventory/search/copy/state only.

## Remaining-limit closeout (this pass)

Eight task agents (Pmv2Limits, ProvC06C08, ProvC09C11, SlintCSS, CensusJson, QAScript, EvidenceMatrices, FindFixMisc) plus parent QA repair:

1. **Index completeness (runtime).** `PMv2.assertIndexComplete()`: 828/828 `setting:{id}` present, product index 1007, 2000 synthetic excluded from default search. Live QA `index_complete.ok` on all seven.
2. **Search exactness.** **16** matrix cases per concept from `search-route-matrix.json`, plus Theme / Default / Copy / Ollama: every rendered pickable result routed via `pickResult(immutable id)` (not Playwright DOM click — chrome intercepts). Back restores query. C11 Default shows 30 grouped duplicate labels.
3. **Default copy conflicts.** Default preview (no `import-conflict` demo) always includes host-bound **`general.startup.window-state`** (Remember Window Layout) as the sole conflict. Live `previewConflictCount=1`, `importConflictDemo=false`. `previewCounts`: additions **1**, replacements **1**, unchanged **756**, unavailable **1**, conflicts **1**.
4. **Simulated backend deepened.** `applyCopy` phases committing → verifying → completed | recovery_required. `installOfficialCli` waits; `confirmOfficialCli(app, id)` runs official-source install or stays manual-only. Receipts still `sessionStorage`.
5. **Provider density.** All seven concepts render Connected / Account / Product / Models / `usage-end` / `routing-fallback` / Setup in code. Live QA report **42200** live-probed 05/07/10; **QA updated to probe all seven** on the next rerun (06/08/09/11 code verified; not re-run in this pass).
6. **Slint 1.17.1.** No `position:sticky` in 05–11 CSS. No `box-shadow: inset`. 760px squeeze kept. 09–11 no parchment/brass/steampunk/CRT/terminal-green/binder.
7. **Candidate census.** 13 command entries × 7 concepts with packet §09 fields. 10 wiring traces including search pick, copy preview/apply/rollback, CLI, details, provider routing, Escape, All Settings `setting:` rows.
8. **Matrix popup.** 336 cells record `searchDropOk` (dropdown in viewport) and `searchEscClosed`.
9. **Grouped search.** C05/C07/C10 dropdowns show type header + path + type meta.
10. **C11 `goDomain`** still `app.navigate` (stack not truncated).

## Manager coverage

42 `demonstrated` + 9 `deferred_named_owner`. 0 `shared_grammar`. 0 `missing`. Live crawl 47/47.

## Candidate impact (not applied to canon)

Reuse: `cmd.settings.open`, `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh`.

New candidates: `cmd.settings.search.submit`, `cmd.settings.search.pick_result`, `cmd.settings.copy_from_project.preview/.apply/.rollback`, `cmd.provider.cli.install_official`, `cmd.settings.details.open`.

DRY: consume SettingsSearch / ManagerSemantics / ObservableWork / RuntimeResourceGovernor / Project identity. Do not create a second ResourceGovernor. `shared/v2` is headless only.

## Isolation

No iframe. No links to concept-01–04. Packet validator pass. ConceptHub validate.py pass. `node --check` pass.

## Known remaining limitations

1. Copy/CLI/receipts remain **simulated `sessionStorage`**, not live ResourceGovernor / BinaryLocator.
2. Search clicks every **rendered** result for Theme/Default/Copy/Ollama (cap 24), not all 1007 index IDs. All 828 product setting IDs are indexed and routable (`setting:{id}`).
3. Packet validator is **structural only**; behavior is `seven-new-concepts-qa.py`.
4. Theme×width popup check is search-dropdown in-viewport + Escape close, not every nested submenu collision.
5. `confirmOfficialCli` on `local-ollama` stays `waiting_user` when owner is unknown (packet: manual-only).

Winner remains unselected (`winner_selected: false`).
