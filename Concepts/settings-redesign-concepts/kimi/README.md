# Settings Redesign Bakeoff — Kimi

Four genuinely different interactive concepts for the Puppet Master Settings redesign, built on one shared system. This folder follows `Concepts/CONCEPT_RULES.md`; the requirements come from the `settings_bakeoff/` packet. **No ranking** — this is a comparison surface.

## The four concepts

| Page | Name | IA thesis | Managers realized richly |
|---|---|---|---|
| `concept-01-atlas.html` | **Atlas** | Directory IA — settings as an annotated reference work | Providers (master–detail + tabs), Memory, MCP |
| `concept-02-constellation.html` | **Constellation** | Command-center IA — the query is the home | Providers (mission surface + side brief), Context & Instructions, Terminal (live preview) |
| `concept-03-ledger.html` | **Ledger** | Document IA — settings as a typographic document | Providers (appendix + stamps), Personas, Skills/Plugins/Tools/Commands |
| `concept-04-workbench.html` | **Workbench** | Ops-console IA — settings framed by system health | Providers (control room + diagnostics drawer), Crew, Media |

All four implement: the Settings Home, the full workspace (one category as a continuous document with navigation + scrollspy), the Provider/Agent/Model manager, global fuzzy search with deep links, all nine row states and six exposure levels, all eight themes, reduced motion, and the quiet surrounding Puppet Master shell (rail, side panel, Assistant panel, bottom panel — the top and status bars never hide).

## Shared architecture

```
shared/
  css/pm-themes.css      8 themes as semantic tokens; reduced-motion kill switch; focus-settle treatment
  css/pm-shell.css       quiet fake-PM app frame (width-constrained by the Hub width control)
  css/pm-components.css  shared primitives: rows, badges, controls, notices, destinations, tables…
  lib/pm-bridge.js       ConceptHub bridge (pm-concept-ready / pm-concept-state)
  lib/pm-shell.js        shell behavior: theme/motion/width controls, panel toggles, squeeze fallback
  lib/pm-store.js        pub/sub demo store, sessionStorage persistence, honest simulated receipts
  lib/pm-search.js       subsequence fuzzy search + <mark> ranges + deep-link normalization
  lib/pm-scrollspy.js    IntersectionObserver scrollspy + controlled jump (oscillation-safe)
  lib/pm-views.js        shared view layer: settings rows/controls, notices, provider renderers,
                         search wiring, spellcheck widget, pop-up menus
  data/pm-settings-demo.js  the shared dataset: 11 categories, 129 settings, 7 provider families,
                         notices, recents, roles, usage snapshots, memory gists, personas, crews,
                         context sources, MCP/LSP/skills/plugins/tools/commands, terminal, media
```

Concept pages keep their own CSS/JS under `concepts/<name>/` and compose the shared layer into their own information architecture. Semantic state never lives in DOM geometry; edits persist per concept in `sessionStorage` (`pm.settings-demo.<name>`) and **Reset demo data** restores the seed.

## Try this in every concept

1. Search “verifier” or “spellcheck” → Enter opens the owning category, jumps, and focuses the exact row (non-flashing settle).
2. Scroll a workspace and watch the scrollspy instrument (outline / minimap / TOC / sticky headers + accordion) track position; click a subcategory for a controlled jump.
3. Providers: switch Anthropic Personal ↔ Work (“future requests only” receipt), refresh the OpenAI catalog (rows stay visible during refresh), favorite/alias/reorder models, open the unavailable model’s reason.
4. Open Appearance → Input and spellcheck: click an underlined word — suggestions never auto-replace; the code token and the path are never underlined.
5. Toggle all eight themes and reduced motion from the top-bar controls; squeeze the width with the Hub control (or the width select standalone) down to 760 px — navigation becomes a drawer, nothing clips.

## Simulated on purpose

Every action that would touch a real system — sign-in, install, purchase, reconnect, catalog refresh, diagnostics, guided setup — reports an honest receipt saying it was simulated. No fake success states.

## Validation

```bash
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/kimi
```

See `TEST_REPORT.md` for the full matrix, `FINDINGS.md` for IA analysis, and `IMPACT_REGISTER.json` for recorded (not applied) implications for Plans, inventory, commands, wiring, DRY, and schemas.
