# CursorAuto · Settings Bakeoff (Final Packet 2026-08-08)

Four concept shells — **Harbor**, **Score**, **Switchboard**, **Archive** — remapped to packet `concept_1..4` featured managers. Visual metaphors and `hb-` / `sc-` / `sw-` / `ar-` prefixes are kept; featured payloads follow `MANAGER_COVERAGE_MATRIX.json`.

## Concepts

| Entry | Metaphor | Featured managers (plus core Providers) |
|---|---|---|
| `concept-01-harbor.html` | Docking / pier berthing | Context, Memory, Personas, Goal & Automation, Crew, Permissions & FileSafe, Back Seat Driver |
| `concept-02-score.html` | Cueing / rehearsal marks | Notifications & Sounds, Sound Library, Appearance, Spellcheck, Desktop/Tray/Window, Teacher/Help |
| `concept-03-switchboard.html` | Patching / jack lights | File Manager, Terminal, LSP, Formatters, Commands, MCP, Skills, Plugins, Tools, Testing & Debug |
| `concept-04-archive.html` | Retrieval / finding aid | Storage, Backup, Settings Lifecycle, History, Artifacts, Worktrees, GitHub Actions, Containers, Web/Search/Fetch, Search Index, Cleanup, Future Server Module Shell |

Media is **not** a primary Home destination. Future Server Module Shell is deferred named-owner insertion cards only.

## Shared foundations

- `shared/data/pm-settings-demo.js` + `pm-settings-demo-extra.js` — fixture SSOT (providers 1–17, installations lifecycle, remapped family datasets)
- `shared/lib/ca-managers.js` — CursorAuto-original rich manager builders (`ca-*`)
- `shared/lib/ca-views.js` — rows, notices, search wiring, spellcheck, providers + installation cards
- `shared/lib/pm-search.js` — data-driven index from `managerMeta` + typed fixture results
- `shared/lib/ca-states.js` — States drawer including import conflict / rollback / sound pack blocked / server shell deferred

## Impact artifacts

Each of `concepts/{harbor,score,switchboard,archive}/` contains:

- `impact-register.json`
- `manager-coverage.json` (zero `missing`)
- `candidate-command-delta.json` (provisional; retires/aliases `cmd.settings.bloom.open`)
- `candidate-wiring-delta.json`
- `candidate-dry-delta.json`
- `plan-owner-delta.md`

Root `IMPACT_REGISTER.json` indexes those paths. **No ranking / no winner.**

## Verify

```bash
python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
python Concepts/settings-redesign-concepts/CursorAuto/scripts/ca-interactive-qa.py
```

QA starts ConceptHub with `--port 0 --no-runtime-state` and a unique Playwright user-data-dir under temp `ca-qa-<pid>`.

## 2026-08-18 addition

Seven additional complete Settings concepts (`concept-05` … `concept-11`) live beside the frozen Harbor/Score/Switchboard/Archive pages. Historical 01–04 reports are unchanged. New evidence and reports use the `SEVEN_NEW_CONCEPTS_*` filenames plus per-stem folders.

| ID | Path |
|---|---|
| 05 | `concept-05-directory-take-1.html` + `concept-05-directory-take-1/` |
| 06 | `concept-06-directory-take-2.html` + `concept-06-directory-take-2/` |
| 07 | `concept-07-compendium-workspace.html` + `concept-07-compendium-workspace/` |
| 08 | `concept-08-directory-take-3.html` + `concept-08-directory-take-3/` |
| 09 | `concept-09-tome-tabs.html` + `concept-09-tome-tabs/` |
| 10 | `concept-10-command-suite.html` + `concept-10-command-suite/` |
| 11 | `concept-11-tabbed-organizer.html` + `concept-11-tabbed-organizer/` |

Verify (concepts 05–11):

```bash
python Concepts/settings-redesign-concepts/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18/tools/validate_seven_new_concepts.py Concepts/settings-redesign-concepts/CursorAuto
python Concepts/settings-redesign-concepts/CursorAuto/scripts/seven-new-concepts-qa.py
python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
```

`validate_seven_new_concepts.py` is structural (7 concepts, 42 manager names, 9 evidence files, 5 model reports). Behavioral coverage — search IDs, managers, copy item lists, hydration, Escape, 336 theme×width cells — is `scripts/seven-new-concepts-qa.py`. Alternate packet path: `C:\Users\sitti\Downloads\PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18\PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18\tools\validate_seven_new_concepts.py`.

Each of `concept-05` … `concept-11` HTML roots sets `data-concept-model="CursorAuto"`. Copy preview, receipts, CLI install, and Details origin persist through simulated `sessionStorage` (`pm.settings-v2.{ns}`), not a live ResourceGovernor. Winner is not selected.

**Fixed:** (a) live index completeness of all 828 setting IDs, (b) default copy preview no longer includes host-bound conflicts, (c) theme matrix searchDropOk / Escape popup-in-viewport, (d) Slint sticky / inset box-shadow.

**Still true:** copy/CLI still simulated via `sessionStorage`; search clicks only rendered results (cap 24, not all 1007 indexed hits); packet validator is structural only; no winner is claimed among concepts 05–11 or the frozen 01–04 set.

Latest behavioral QA reference: ConceptHub port **55050**, report `ca7-qa-report-42200.json` (OS temp, not shipped).
