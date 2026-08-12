# kimi-k3 — Settings Redesign Bakeoff (4 concepts)

Four genuinely different Puppet Master Settings concepts built from the
final cumulative packet
(`PM_Settings_Bakeoff_Final_Cumulative_2026-08-08.zip`). No winner is
recommended; each concept is a complete, self-consistent take on the same
surface area.

## Run

Serve through ConceptHub (file:// is not a substitute):

```
python Concepts/ConceptHub/server.py
```

Then open the Hub and pick **kimi-k3** — entries: gallery + four concepts.
The concepts are static; all demo state persists in `localStorage` (reset
from the Demo scenarios drawer, "Reset demo data").

## The four concepts

| # | Concept | Identity | Manager families (beyond the shared core) |
|---|---------|----------|-------------------------------------------|
| 01 | **Concord** | Card-wall Home; workspace as tidy card columns | Context & Memory, Personas, Goal runtime, Crew templates, Permissions rules |
| 02 | **Resonance** | Console/meter aesthetic; "master cue" Home | Notifications, Sound library, Appearance/themes, Spellcheck |
| 03 | **Foundry** | Ops bench; dense workbenches | File Manager, Terminal profiles + ANSI palette, LSP, Formatters, Catalog (commands/MCP), Testing |
| 04 | **Vault** | Ledger + timelines; capacity meters, retention bars | Storage & Backup, Settings lifecycle (transfer/reset/copy), Version history, Artifacts, SCM & Containers tools, Servers (deferred shell) |

All four ship: quiet PM shell, Settings Home (search, destinations,
grouped notices, recents), full Settings Workspace (category nav,
scrollspy, deep links, requested/effective inspectors), the complete
Provider/Account/Model/Installation manager, representative setting rows,
persistent demo state, 8 themes, reduced motion, narrow/squeezed layouts,
and six impact registers per concept under `concepts/<name>/`.

## Layout

```
concept-hub.json          Hub manifest (widthControl: page 700–2500)
index.html                Gallery (model-wide overview)
concept-0N-*.html         Concept pages
shared/                   Shared layer: pm-shell/router/bridge/store/views/
                          scrollspy/search, pm-themes/components CSS,
                          pm-core-data.js (settings/accounts/providers/
                          models/installs/notices)
concepts/<name>/          Per-concept css/js/data + the six registers
README.md  FINDINGS.md  TEST_REPORT.md
```

Per-concept registers: `impact-register.json`, `manager-coverage.json`,
`candidate-command-delta.json`, `candidate-wiring-delta.json`,
`candidate-dry-delta.json`, `plan-owner-delta.md`.

## Validation

`python Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/kimi-k3`
→ passes (exit 0). Full probe evidence in `TEST_REPORT.md`.
