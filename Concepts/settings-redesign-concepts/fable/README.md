# fable — Puppet Master Settings bakeoff

Four genuinely different interactive Settings redesign concepts for Puppet Master, built for the 2026-08-05 Settings bakeoff. Model identity: `fable`. Every page renders inside a quiet fake PM shell (title bar, activity rail, Assistant panel, status bar) and carries `data-concept-model="fable"`.

All four concepts replace the current bloom-modal Settings with the packet's three-surface architecture: a search-centric Settings Home, a one-category-at-a-time Settings Workspace with a continuous subcategory document (jump + scrollspy), and dedicated Managers. They share one demo dataset and one semantics layer, and deliberately share nothing else: layout, navigation, editing model, manager relation, and motion are different in each.

## How to view

Via ConceptHub (recommended — gives you the width slider and theme sync):

```bash
python3 Concepts/ConceptHub/server.py --port 0 --no-browser
```

Open the printed `http://127.0.0.1:<port>` URL and pick the "Settings Redesign" tab, then the fable entries. The hub's page-width slider (760-2500), theme picker, and reduced-motion switch all drive the pages live through the concept bridge.

Or open any page directly in a browser — each concept is a self-contained HTML file:

- `c1-atlas.html`
- `c2-mission-control.html`
- `c3-focus-stack.html`
- `c4-ledger.html`
- `index.html` (gallery/comparison surface)

No build step, no external libraries. The Google Fonts stylesheet link is the only external resource; on a blocked network the pages fall back to system fonts and remain fully functional.

## The four concepts

**c1 — fable · Atlas.** Settings as a well-edited reference manual. The humanized taxonomy is the hero: numbered sections ("3.2 Accounts & keys"), a sticky running header naming where you are, and per-row status/flags/scope typeset as marginalia in a dedicated margin column instead of trailing chips. Home is a full-width search bar over a grouped directory that morphs in place into results — no overlay. Editing is inline in the document. Managers are appendices in the same book (Appendix A Providers & models, B Memory, C Connected servers), reached from a distinct Appendices chapter in the leader-dot TOC tree and from inline cross-references. Motion is "Typesetting": content composes once in reading order, then holds still.

**c2 — fable · Mission Control.** Settings as an operational console. A persistent global health strip (provider readiness, usage pressure, notice counts — each chip a live navigation target) sits above every surface. Home leads with a strictly ranked triage stack over rectangular station cards with live health summaries. Search is a docked Ctrl/Cmd-K command palette. In the Workspace the right-edge proportional minimap — built purely from the scrollspy's section registry — is the primary navigation, with a secondary station rail on the left. Managers are the primary surfaces (Providers & Models with the full 15-state matrix, Crew with requested-vs-effective concurrency, Media routes), and plain settings hang off them in Configure drawers. Motion is "Instrumental": one-shot state-driven morphs and region-scoped shimmer only.

**c3 — fable · Focus Stack.** Settings as layered attention. Exactly one surface is live at a time; a left-edge layer spine (Home > Category > Sheet, with a depth counter) makes the stack visible and poppable. Home is nearly empty — a dominant hero search, one collapsed notice queue, oversized typographic destination plates with "resume at" footnotes. The hard rule: disclosure is navigation, never in-place expansion — advanced settings, details, expert confirmations, and free-route setup each push a sheet onto the spine. Managers stress depth as meaning: Personas descend definition > runtime > capsule; Terminal pairs profile list with a live ANSI/font/cursor preview. Motion is "Spatial continuity", with a first-class reduced-motion mode. Lowest density of the four.

**c4 — fable · Ledger.** Settings as an object browser. Every setting, notice, provider, model, and tool is a read-only record in a continuous document; all editing happens in a persistent right inspector showing the full control, a default > global > project > thread provenance chain, requested-vs-effective diffs, capability evidence with source and timestamp, and reset-to-default. The left navigator is a query engine: a never-disappearing query bar plus state chips (Managed / Differs from default / Unavailable / Attention). Home includes a genuinely sortable, lazily paged 133-row settings table. Managers (Context & Instructions, Skills/Plugins/Tools) reuse the identical record/inspector grammar. Motion is "Instantaneous": the CSS declares zero animations, so reduced motion is literally identical. Highest density of the four.

## Folder map

```
Concepts/settings-redesign-concepts/fable/
  concept-hub.json          ConceptHub manifest (width role "page", 760-2500)
  index.html                gallery/comparison surface
  CONTRACT.md               binding shared API + conventions for everything here
  _shared/
    pm-shell.css            8-theme token layer (PM7 SECTION 2 lineage) + quiet shell
    pm-shell.js             shell hydration, theme menu, ConceptHub bridge
    pm-icons.js             inline SVG icon set (no emoji anywhere)
    pm-demo-data.js         one realistic dataset: 11-domain taxonomy, 133 settings,
                            providers/accounts/models, notices, gists, personas, crew,
                            MCP, terminal profiles, media routes, spell dictionaries
    pm-state.js             store + row/notice semantics resolvers + scenarios +
                            simulated receipts + States drawer + shared search
    pm-scrollspy.js         section-registry scrollspy + deep-link reveal pipeline
    pm-spell.js             demo spellcheck service (underline, suggestions, dictionaries)
  c1-atlas.html/.css/.js
  c2-mission-control.html/.css/.js
  c3-focus-stack.html/.css/.js
  c4-ledger.html/.css/.js
  README.md                 this file
  FINDINGS.md               IA choices, divergence map, conflicts, simulations, Slint risks
  IMPACT_REGISTER.json      recorded (never applied) impacts on canon
  TEST_REPORT.md            written by the verification pass from real results
```

## Shared foundation

`CONTRACT.md` is the binding specification: concept pages depend on `_shared/` exactly as written there, and everything not specified is per-concept freedom (divergence is required). The one shared semantics layer — `PMState.resolveRowState` for the nine value-states, `PMState.resolveNotice` for notice anatomy, and the provider 15-state matrix in the demo data — guarantees the four concepts agree on meaning while markup and CSS stay strictly per-concept. `PMSpy` implements scrollspy as cached-offset math over a section registry (no ad-hoc DOM geometry), which is also the documented Slint viewport-offset mapping.

## Exploring the required states

- **States drawer:** every page mounts a floating "States" button (bottom-right, above the status bar). It switches the six scenarios — Baseline (mixed states), Calm, Attention-heavy, Usage exhausted, Invocation failed, Managed workspace — and fires the transient triggers (provider refresh, catalog refresh, reconnect, invocation test). The baseline dataset already exhibits every co-existable state at once; the drawer covers the mutually exclusive globals and transients.
- **Shell controls:** the title bar toggles the left rail, the Assistant panel (which includes the spellcheck demo composer and the per-thread spellcheck-off overflow action), reduced motion, and the theme menu (Friendly / Glass / Retro / Basic, each in Dark and Light).
- **Widths:** page width is owned by the ConceptHub slider (presets 760 / 900 / 1280 / 1700 / 2200 / 2500). Each concept has an explicit narrow mode below 900px of shell width.

## Honesty about simulation

This is a design prototype over demo data. Nothing here performs real OAuth or CLI sign-ins, installs anything, spends money, stores credentials, or calls providers. Every action that cannot truly run returns a visibly labeled simulated receipt instead of pretending — there are no silent no-ops. Staged transitions (catalog refresh over last-known-good, reconnect, invocation test) mutate only the in-page demo store. The only persistence is UI preferences and demo dictionary additions, confined to the `pm.settingsConcepts.fable.*` localStorage namespace. `FINDINGS.md` lists the full simulation boundary.
