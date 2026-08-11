# GLM-5.2 — Puppet Master Settings Redesign Bakeoff

Four genuinely different interactive Settings redesign concepts for Puppet Master. This is a concept bakeoff, not an implementation pass. No concept is ranked here.

- **Model:** GLM-5.2 (folder `glm-5-2`, normalizes to `glm52`)
- **Topic:** `settings-redesign`
- **Open via ConceptHub:** `index.html` (workspace / comparison surface), or open any concept directly.

## The four concepts

| # | Concept | IA thesis | Search treatment | Workspace model | Motion | Manager deep-dives |
|---|---------|-----------|------------------|-----------------|--------|--------------------|
| 01 | **Control Room** | Settings as mission control — one dominant search is the primary verb; destinations are large editorial panels. | Dominant omni-search bar atop Home; results restructure Home; deep-links. | Book-TOC: left vertical category index + continuous document. | Editorial cinematic — staggered reveals, settle-then-text, soft focus flash. | Memory · MCP |
| 02 | **Atlas** | Settings is territory to navigate, not a list to filter — regions with boundaries and a you-are-here marker; size encodes density. | Persistent Cmd+K command overlay (top-center); selecting flies the viewport to the region. | Focus + context: one region fills the canvas, compact minimap keeps the whole map visible. | Cartographic — smooth zoom/pan, scale+position continuity. | Crew · Skills/Plugins/Tools |
| 03 | **Stack** | Settings never navigates away — one surface that expands; disclosure is the whole model. | Search is the head of the single stack; typing filters the stack inline. | Expand-in-place: destinations are expandable rows that grow into the full workspace; one open at a time. | Push/pop depth — FLIP reorders, height-settles-then-content. | Personas · Context & Instructions |
| 04 | **Stream** | Settings is a river to read and jump within. | Search filters/jumps the stream; selecting scrolls the river to the section. | Continuous document; destinations are named sections; managers are channels within their section. | Scroll-linked flow — momentum-eased jumps; nothing animates when calm. | LSP · Terminal · Media |

Every concept also renders the **Provider/Agent/Model** manager in full, and the union of deep-dives across the four covers **all nine** candidate managers (Memory, Personas, Crew, Context & Instructions, MCP, LSP, Skills/Plugins/Tools, Terminal, Media).

## What every concept shares

- **Search is central; no primary category pills.** Destinations read as places you open (title + purpose + status + open affordance), never filter chips.
- **No emoji** (inline SVG icons only), **no colored left-side status borders**, **no raw internal labels**, **no clipped text**, **no fake no-op actions**.
- **All eight themes** (Friendly/Glass/Retro/Basic × Dark/Light) plus **reduced motion**. IA + semantic status language is constant across themes; only material, typography, radius, border, shadow, and motion flavor differ.
- **Required narrow/squeezed (760px) and surrounding-shell states**, with the quiet fake Puppet Master shell always present (top + bottom bars never removed for embed).
- **Uniform manager language** — every dedicated manager renders through one shared shell (search/filter, add/connect, health summary, resource rows, requested-vs-effective state, loading/empty/error/managed/unavailable states, logs/diagnostics, consistent motion).
- **Realistic shared demo data** (`assets/demo-data.js` — one source of truth): Provider→Account→Connection→Product→Model hierarchy, connection groups, multi-account + CLI profiles, continuously-refreshed catalogs, capability evidence, Memory Gists with half-life, Personas with scope, Crew requested-vs-effective, Context admitted/omitted, MCP/LSP/Skills/Terminal/Media resources, and a settings-inventory subset exercising every required row state.
- **Slint-portable** — semantic state is kept separate from DOM geometry; glass uses one backdrop blur over a pre-baked wallpaper (the PMConcept7 technique); no DOM measurement as the source of semantic state, no nested backdrop-filter stacks, no SVG filters, no browser-only physics, no CSS-only behavior.

## Functional controls

- **Search** — live fuzzy discovery across settings/categories/managers/destinations with deep-link jump to the owner category + setting (verified).
- **Category/subcategory navigation** — TOC / minimap / subnav / landmark rail depending on concept, with controlled jump and IntersectionObserver scrollspy (no oscillation).
- **Theme switcher** (all 8) and **reduced-motion** toggle, persisted via localStorage.
- **Shell toggles** — left rail open/closed, Assistant panel open/closed (grid reflows; no clipping).
- **Provider/Agent/Model** — refresh (preserves last-known-good rows during loading), reconnect (returns a visible simulated result), model favorite/alias, model options menu exposing effort + Normal/Fast only when supported, role assignments with requested-vs-effective.
- **Manager actions** — every manager action returns either a visible simulated result or an honest unavailable state.
- **Settings rows** — toggle/select/slider/text exercising Default / Recommended / Inherited / Auto / Not-configured / Managed / Custom / Unavailable / Effective-differs + exposure levels.
- **Spellcheck** — subtle underline in prose fields, no autocorrect (HTML `spellcheck` simulates the concept; production needs a Slint-portable spelling-service abstraction).

## File layout

```
Concepts/settings-redesign-concepts/glm-5-2/
├─ concept-hub.json            # schemaVersion 1 · page width role · hybrid presentation
├─ concept-hub-bridge.js       # ConceptHub bridge (pm-concept-ready / pm-concept-state)
├─ index.html                  # comparison surface (gallery)
├─ concept-01-control-room.html
├─ concept-02-atlas.html
├─ concept-03-stack.html
├─ concept-04-stream.html
├─ assets/
│  ├─ themes.css               # 8 themes + reduced motion + density tokens
│  ├─ shell.css                # quiet PM shell + universal primitives + settings rows
│  ├─ managers.css             # uniform manager shell styling
│  ├─ demo-data.js             # canonical data (single source of truth)
│  ├─ icons.svg.js             # inline SVG icon library (no emoji)
│  ├─ state.js                 # theme reducer, search, scrollspy/jump core
│  ├─ shared.js                # shell + settings-row + manager-promo renderers
│  └─ managers.js              # uniform manager shell + 10 manager renderers
├─ README.md                   # this file
├─ FINDINGS.md                 # IA choices, simulations, Slint risks (no ranking)
├─ IMPACT_REGISTER.json        # Plans/inventory/command/wiring/schema impacts (record only)
└─ TEST_REPORT.md              # test matrix results
```

## Validation

```
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2
```

## How to view

Open the ConceptHub and navigate to the `settings-redesign` topic, or open `index.html` directly:

```
python3 Concepts/ConceptHub/server.py
# open http://localhost:4177/concepts/settings-redesign-concepts/glm-5-2/index.html
```

Width presets (page role): 760 · 900 · 1280 · 1700 · 2200 · 2500. Toggle the left rail and Assistant panel via the activity-bar buttons to test squeezed states.
