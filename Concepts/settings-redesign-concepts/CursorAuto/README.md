# CursorAuto — Settings Redesign Bakeoff

Four original interactive Settings redesign concepts for Puppet Master. Model identity: `CursorAuto`. Folder: `Concepts/settings-redesign-concepts/CursorAuto/`.

This bakeoff follows `Concepts/CONCEPT_RULES.md` and the `settings_bakeoff/` packet. **No ranking.** Concepts do not borrow peer bakeoff layout DNA.

## Concepts

| Page | Name | IA thesis | Featured managers |
|---|---|---|---|
| `concept-01-harbor.html` | **Harbor** | Pier berthing — pier-desk search, triage, berth cards | Providers drydock, Memory locker, Terminal drydock (+ LSP checklist) |
| `concept-02-score.html` | **Score** | Cue / plates / rehearsal marks — hero cue search + movement plates | Ensemble Providers, Personas cast, MCP instruments |
| `concept-03-switchboard.html` | **Switchboard** | Jack / patch — docked `/` search + jack column + patch sheet | Patch-bay Providers, Context matrix, Skills/Tools bay |
| `concept-04-archive.html` | **Archive** | Finding-aid — tickets + collection guides + box document | Catalog Providers, Crew boxes, Media archive |

All four implement Settings Home → Workspace → Managers, fuzzy search deep links, nine row states, six exposure levels, eight themes, reduced motion, States drawer fixtures, and a quiet fake Puppet Master shell.

## How to view

```bash
python3 Concepts/ConceptHub/server.py --port 0 --no-browser
```

Open the printed URL → Settings Redesign → CursorAuto entries. Use the Hub page-width presets (760–2500), theme picker, and reduced-motion switch.

Or open `index.html` / any concept HTML directly. Top-bar controls work standalone. Use the floating **States** control for demo fixtures.

## Shared layer

```
shared/
  css/   pm-themes.css, pm-shell.css, ca-components.css
  lib/   pm-bridge.js, pm-shell.js, pm-store.js, pm-search.js, pm-scrollspy.js,
         ca-views.js, ca-states.js
  data/  pm-settings-demo.js
concepts/<harbor|score|switchboard|archive>/   # hb- / sc- / sw- / ar- only
```

## Try in every concept

1. Search “verifier” or “spellcheck” → deep-link focus.
2. Scroll a workspace; jump via slips / rehearsal marks / jacks / folders.
3. Providers: collapsed expand (Switchboard), usage seven-field snapshot, Free Models six auth routes, account vs thread-local copy.
4. Appearance → Input: spellcheck Normal/Advanced; suggestions never auto-replace.
5. States drawer: Baseline, Calm, Continue-setup, Recommended, Attention-heavy, Usage exhausted, Invocation failed, Managed workspace; Refresh catalogs / Reconnect.
6. Toggle eight themes + reduced motion; squeeze to 760 px.

## Validation

```bash
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/CursorAuto
python3 Concepts/settings-redesign-concepts/CursorAuto/scripts/ca-interactive-qa.py
```

The QA script starts an isolated Hub (`--port 0 --no-runtime-state`) and Playwright Chromium with a unique `/tmp/ca-qa-<pid>` profile; it never touches other agents’ Chrome or Hub runtime.

See `TEST_REPORT.md`, `FINDINGS.md`, and `IMPACT_REGISTER.json` (record-only; no canon edits).
