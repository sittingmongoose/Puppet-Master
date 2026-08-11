# Settings Redesign Bakeoff — Qwen 5.8

Four genuinely different interactive Settings concepts for Puppet Master, built from the `settings_bakeoff/` packet (2026-08-05). Model: **Qwen 5.8**. Read-only baseline: `Concepts/PMConcept7.html`. No canonical files were modified; likely impacts are recorded in `IMPACT_REGISTER.json`.

## Concepts

| # | File | Thesis | Search treatment | Workspace navigation | Featured managers |
|---|---|---|---|---|---|
| 01 | `concept-01-atlas.html` | Settings as a map of places | Crowning field morphs the directory into grouped results | Left table of contents with sliding marker | Providers, Assistant Memory, MCP |
| 02 | `concept-02-deck.html` | Settings as operations | Command palette with grouped dropdown | Sticky horizontal tab strip, auto-centering | Providers, Crew, Terminal, LSP |
| 03 | `concept-03-ledger.html` | Settings as one document | Underlined search rendering an annotated contents list | Margin outline with sliding ink marker | Providers, Context & Instructions, Skills/Plugins/Tools |
| 04 | `concept-04-spoke.html` | Settings organized by intent | Persistent rounded launcher | Right-edge progress ticks | Providers, Personas, Media |

No ranking is implied or recommended.

## Run

Serve through the shared Concept Hub (preferred):

```sh
python3 Concepts/ConceptHub/server.py --port 0 --no-browser
```

Then open the printed address and select the **settings-redesign** topic. The index workspace (`index.html`) links to all four concepts. Each concept also works opened directly as a file.

## Controls

- **Hub width slider** (role `page`): presets 760 / 900 / 1280 / 1700 / 2200 / 2500.
- **Demo tray** (bottom-right inside each concept): theme (all eight), reduced motion, scenario states, left rail, assistant panel.
- **Scenarios**: Default, Needs attention, Calm (no notices), Catalog refreshing, Usage exhausted.
- **Search**: type, use arrow keys, Enter opens the highlighted result and deep-links (owner category loads, jumps, brief focus wash).
- **Workspace**: subcategory nav jumps with a scroll lock (no oscillation); scrolling updates the active nav item; Standard / Advanced / All exposure filter.
- **Spellcheck**: the assistant panel composer and seeded message contain deliberate misspellings; click or press Enter on an underline for suggestions. Actions: replace once, ignore once, ignore for draft, add to personal/project dictionary. Nothing is ever replaced automatically.

## Shared architecture

- `_shared/pm-demo-data.js` — single fixture source: 10 destinations, ~100 settings across all required states, provider register, catalogs, roles, notices, and the eight non-provider manager datasets.
- `_shared/pm-state.js` — mutable store, simulated async (catalog refresh with last-known-good), honest receipts, scenario seeds.
- `_shared/pm-settings-core.js` — search index/scoring, scrollspy with jump lock, focus wash, toasts, setting-state metadata, spellcheck widget.
- `_shared/pm-shell.js` / `pm-shell.css` — quiet surrounding shell (top/bottom bars, rail, assistant panel), eight theme token sets, reduced-motion kill switch, demo tray.
- `_shared/concept-hub-bridge.js` — Hub protocol (`pm-concept-ready` / `pm-concept-state`).

## Deliverables

`README.md` (this file), `FINDINGS.md`, `IMPACT_REGISTER.json`, `TEST_REPORT.md`, `concept-hub.json`, `index.html`, four concept pages, `_shared/`.
