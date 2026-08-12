# Settings Redesign Bakeoff — Qwen 5.8 — Final Packet Build

Four genuinely different interactive Settings concepts for Puppet Master, built from the **PM_Settings_Bakeoff_Final_Cumulative_2026-08-08** packet (supersedes the 2026-08-05 build that previously lived in this folder). Model: **Qwen 5.8**. Read-only baseline: `Concepts/PMConcept7.html`. No canonical files were modified; impacts are recorded per concept under `concepts/` and aggregated in `IMPACT_REGISTER.json`. **No winner is recommended anywhere in this folder.**

## Concepts

| # | File | Thesis | Demonstrated manager families |
|---|---|---|---|
| 01 | `concept-01-atlas.html` | Settings as a map of places (directory + left TOC) | Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions & FileSafe, Back Seat Driver |
| 02 | `concept-02-deck.html` | Settings as operations (command center + sticky tab strip) | Notifications & Sounds (+uploads/packs), Appearance, Spellcheck, Desktop/Tray/Window, Teacher/Help |
| 03 | `concept-03-ledger.html` | Settings as one document (§N.M outline + ink marker) | File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts, MCP/Skills/Plugins/Tools, Testing & Debug |
| 04 | `concept-04-spoke.html` | Settings by intent (wings + right tick rail + split views) | Storage, Backup & Restore, Settings Lifecycle, History, Artifacts, Source Control/GitHub Actions, Containers, Web/Search, Index, Cleanup, Future Server shell |

Every concept additionally ships the full product contract: Settings Home (search, destinations, notices, recents), full Workspace (category document, subcategory scrollspy, deep links), the complete Provider/Account/Model/Installation manager (all 17 packet fixtures), the full manager-family vocabulary as shared grammar, 8 themes, reduced motion, narrow/squeezed layouts, persistent demo state, and per-concept impact registers.

## Run

Serve through the shared Concept Hub (preferred):

```sh
python Concepts/ConceptHub/server.py --port 0 --no-browser
```

Then open the printed address and select the **settings-redesign** topic. The index workspace (`index.html`) links to all four concepts. Each concept also works opened directly.

## Controls

- **Hub width slider** (role `page`): presets 760 / 900 / 1280 / 1700 / 2200 / 2500.
- **Demo tray** (bottom-right inside each concept): theme (all eight), reduced motion, scenario states, left rail, assistant panel, **Reset demo data**.
- **Scenarios** (10): Default, Needs attention, Calm, Catalog refreshing, Usage exhausted, Provider update available, Update rolled back, Import conflict, Catalog last-known-good.
- **Search**: fuzzy cross-category with typo tolerance ("notifcation" → Notifications); results carry visible type chips (setting / manager / action / status / diagnostic / setup / unavailable); Enter deep-links with a focus wash.
- **Deep links**: hash URLs `#/w/<category>[/<subcategory>][?setting=|manager=|provider=|model=]`; browser back/forward works; state persists per concept in `localStorage`.
- **Setting rows**: Help (i) toggles the Details disclosure (scope, value state, reason, restart); Reset restores defaults; managed/unavailable rows are honestly read-only.
- **Spellcheck**: underlines only, never autocorrect; personal/project dictionaries persist in demo state; thread override in the assistant panel.

## Shared architecture (`_shared/`)

- `pm-demo-data.js` — single fixture source: 10 canonical destinations (general, notifications, appearance, models, context, behavior, permissions, code, extensions, system), 9 providers with installations/update lifecycle covering all 17 packet fixtures, catalogs, roles, 3-group notices, and all manager datasets. The Media destination is retired; continuation settings moved into the Provider manager.
- `pm-data-extra.js` — family fixtures (destinations/sounds/packs/themes/BSD/permissions/filesafe/files/formatters/commands/shortcuts/testing/storage/backups/import/history/artifacts/source-control/actions/containers/web/index/cleanup/server shell/teacher/general fixtures).
- `pm-state.js` — mutable store with persistence (`pm.settings-demo.<conceptId>`, debounced 300 ms), `PMState.init(conceptId)`, receipts, 40+ actions, 10 scenarios.
- `pm-settings-core.js` — typed search index with Levenshtein typo tolerance, hash router (back/forward), scrollspy with jump lock, lazy `hydrateManager` (skeleton-first), `promptDialog` (no browser dialogs), focus wash, toasts.
- `pm-managers.js` — headless manager builders (provider family card, installation cards, rule editor, sound library, destination form, theme cards, import preview, resource lists) with concept prefix hooks (`at-`/`dk-`/`lg-`/`sp-`) and one delegated `data-act` dispatcher.
- `pm-shell.js` / `pm-shell.css` — quiet surrounding shell, 8 theme token sets, reduced-motion kill switch, demo tray, manager-grammar CSS.
- `concept-hub-bridge.js` — Hub protocol (`pm-concept-ready` / `pm-concept-state`).

## Registers (`concepts/<concept-id>/`)

Each concept carries `impact-register.json`, `manager-coverage.json` (zero `missing` classifications), `candidate-command-delta.json` (census against `Plans/UI_Command_Catalog.md`; no canon minted), `candidate-wiring-delta.json`, `candidate-dry-delta.json`, and `plan-owner-delta.md`. `IMPACT_REGISTER.json` aggregates them.

## Deliverables

`README.md` (this file), `FINDINGS.md`, `IMPACT_REGISTER.json`, `TEST_REPORT.md`, `concept-hub.json`, `index.html`, four concept pages, `_shared/`, `concepts/`.
