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
