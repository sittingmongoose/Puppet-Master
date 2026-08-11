# 5.6 Sol — Puppet Master Settings Bakeoff

This folder is a self-contained, concept-only Settings bakeoff. It does not modify or claim authority over PMConcept7, Plans, the settings inventory, ConceptHub, commands, wiring, DRY rules, schemas, Usage concepts, Chat concepts, or another model folder.

## Four independent systems

| Concept | Information architecture | Manager grammar | Signature motion |
|---|---|---|---|
| **5.6 Sol — Index House** | A stable address book of numbered destinations. Search opens a place; the workspace combines a nested directory, continuous record, and evidence inspector. | Providers form an addressable catalogue, Memory is an archive, and Terminal is a profile shelf with a live preview. | The selected destination becomes the workspace address; directory, record, and inspector stage in sequence, while inspector facts crossfade locally. |
| **5.6 Sol — Switchboard** | An operational board organized around readiness, health, and the next useful action. Search is a command console above destination bays. | Providers become a connection topology, Memory a verification queue, and Terminal an effective-state instrument. | A finite signal travels once from bay to station, then latches. Refresh visibly stages connection, catalogue, and readiness without removing last-known-good rows. |
| **5.6 Sol — Wayfinder** | A human-goal map whose routes retain the owning Settings category. Search is the map origin; continuous chapters become checkpoints. | Provider, Memory, and Terminal tasks become guided connect, inspect, verify, preview, and repair journeys with expert branches. | The chosen waypoint becomes a route banner, the line resolves after layout, and the first checkpoint arrives. Expert disclosure grows as a route branch. |
| **5.6 Sol — Ledger** | A dense reference register for comparison, provenance, and requested/effective state. Search can become the active filtered ledger. | Providers use expandable hierarchy records, Memory uses an evidence/version ledger, and Terminal compares saved and draft values. | The register reference becomes the folio masthead; FLIP reflow, a one-time rule draw, and compact row emphasis preserve reading position. |

The concepts are intentionally unranked. Shared semantic state does not dictate composition: each concept owns its Home, workspace, Provider, Memory, Terminal, supporting-manager, responsive, and motion presentation.

## Demo-data and state architecture

`_shared/data.mjs` contains deterministic, normalized review data:

- 10 major categories and 72 settings across 8 value states and 6 exposure levels;
- 6 provider families with accounts, connections, products/plans, model routes, runtime adapters, and capability evidence;
- all 11 packet role assignments, including the protected high-quality planning-conversation route;
- 9 evidence-backed Memory Gists with 22 immutable version snapshots;
- 4 Terminal profiles with saved and draft state;
- 7 supporting inventories for Context & Instructions, Personas, Crew, MCP, LSP, Skills/Plugins/Tools/Commands, and Media;
- 12 deterministic entity-level scenarios, 3 resumable setup sessions, 8 recent changes, and persistent receipt history;
- spelling-service fixtures for all five actions and every required technical-text exclusion.

`_shared/state.mjs` owns product state independently of DOM geometry. Structured dispatch results contain the action, affected scopes, one-shot focus request, announcement, and semantic motion intent. Scenario application clones the baseline before applying deterministic overlays, so calm, setup, degraded, managed, unavailable, exhausted, and requested/effective states cannot contradict their entities.

The stable browser review API preserves the original helpers and exposes:

```js
PMSettingsDemo.dispatch(action)
PMSettingsDemo.applyReviewState(state)
PMSettingsDemo.whenIdle()
PMSettingsDemo.snapshot()
PMSettingsDemo.motionSnapshot() // QA-only semantic motion witness
```

`whenIdle()` resolves only after rendering, controlled scrolling, two animation frames, and the active motion transaction settle. A separate `settleForReview()` hook finishes decorative animation only for exhaustive final-state audits.

## Functional fidelity

- One global Settings combobox is available on Home, beside workspace navigation, and inside every manager. It supports fuzzy results, structured destinations, Arrow keys, Home/End, Enter, Escape, outside dismissal, `aria-activedescendant`, and `Cmd/Ctrl+K`.
- Search and notices resolve to an exact screen, category, subcategory, setting, manager tab, and resource where applicable. The Usage result opens Provider → Usage, focuses its labelled destination, and records an honest simulated handoff to the Usage owner. Deep links reveal required disclosure, install final geometry, focus the labelled setting region, apply a non-flashing cue, and consume the focus request.
- Category changes load one major category. Subcategory clicks use a scrollspy lock, stable sticky offset, interruption handling, and `scrollend`/timeout release. Scrolling then resumes ownership of current-location state.
- Index House keeps evidence reachable at every width: a sticky third pane when wide, a modal evidence drawer with backdrop and Escape/focus restoration at middle widths, and a complete inline inspector when squeezed. Its atomic record includes title, description, source, scope, exposure, material effects, and restart/reconnect requirements.
- Local setting and manager actions patch keyed regions without remounting the active control. Restore default and use inherited value are separate actions; bounded input can remain visible with an associated inline error.
- Theme, density, and reduced motion share the same effective presentation state as the shell and ConceptHub. Effective reduction is explicit reduction or the live OS preference.
- Provider management exposes Overview, Accounts & Connections, Models, Usage, Routing & Priority, Roles, and Support. It demonstrates credential ownership, isolation, future-only account preference, captured in-flight work, conditional model options, last-known-good refresh, quarantine, catalogue history, exhaustion, and honest repair/reconnect receipts.
- Memory supports search/filter, verify, pin, edit/correct, discard with Undo, immutable history, restore as a new version, evidence inspection, access history, capsule preview, half-life explanation, retention/redaction, and simulated rebuild/deduplication.
- Terminal supports four profiles, dirty-switch handling, Apply/Reset, shell and fallback, typography, colors and ANSI palette, material/image, cursor/selection, copy/paste/link behavior, CWD/environment, retention, rendering, startup, live preview, and simulated diagnostics.
- Spelling supports Replace once, Ignore once, Ignore for draft, Add to Personal dictionary, and Add to Project dictionary. It never autocorrects or calls a provider, and it visibly excludes code, URLs, paths, commands, hashes, identifiers, structured data, literal text, and model/provider/Persona/tool names.
- Supporting managers are searchable inventory/detail experiences with health, requested/effective state, loading, empty, error, managed, and unavailable examples; details, history, diagnostics, and local mutations or honest simulations are visible.

Every enabled control does exactly one observable thing: navigate, mutate local review state, disclose content, or produce an inline simulation receipt. Boundary order controls and unavailable actions are disabled with a visible reason.

## Motion and accessibility

`_shared/motion.mjs` coordinates ten semantic intents: navigation, category replacement, search, jump, scrollspy, disclosure, refresh, save, reorder, and drawer. The four concepts have distinct blueprints, mounted participant roles, keyed local targets, and reduced-motion roles; ordinary feedback is 70–120 ms, local change is 160–240 ms, major navigation is 260–420 ms, and visible staggering is capped at six elements and 180 ms. New intent cancels the affected region and invalidates stale callbacks. Focus and state never wait for decoration, and consuming a semantic focus request does not start decorative motion.

View Transitions progressively enhance Home-to-workspace continuity. WAAPI supplies the complete fallback and FLIP reflow. The review harness witnesses actual animation calls and participant roles for all 40 concept/intent combinations instead of accepting markers alone. The Slint mapping is semantic-keyed property animation on temporary proxy components. Reduced motion installs identical state and geometry immediately and retains only one 80–120 ms opacity/focus cue.

Accessibility and resilience include:

- real combobox, tablist, menu, disclosure, drawer, current-location, and focus-restoration semantics;
- inert hidden shell panels and contextual accessible names;
- eight semantic theme palettes with distinct text, status, focus, and control-boundary tokens;
- 16 px squeezed body text, 14 px setting labels/descriptions, and no essential metadata below 12 px;
- forced-colors, coarse-pointer, RTL, mirrored directional icons, `dir="ltr"`/`dir="auto"` for technical content, and 35% text-expansion fixtures;
- `100dvh`, bounded internal scrolling, 200%-zoom-equivalent reflow, and 44 × 44 px coarse-pointer targets;
- concept-specific responsive transformations, including narrow list/detail drill-in with heading focus and Back/Escape focus restoration;
- an accessible compact review popover so theme, scenario, shell, width, and motion controls remain available at squeezed widths.

## Comparison workspace

`index.html` runs four live same-origin previews and broadcasts scenario, theme, page width, rail, Assistant panel, and reduced-motion state. Each page also works standalone through the ConceptHub bridge. `concept-hub.json` declares the `page` width role and presets at 760, 900, 1280, 1700, 2200, and 2500 pixels.

## Known simulations

External sign-in, installation, purchase, billing, provider calls, model generation, provider/platform diagnostics, support-bundle creation, shell execution, filesystem mutation, system dictionary access, and durable Memory/storage writes remain explicitly labelled simulations. Fixture capability, usage, and freshness data are deterministic review content, not live qualification evidence.

## File layout

```text
5.6 Sol/
├── concept-hub.json
├── index.html
├── concept-01-index-house.html
├── concept-02-switchboard.html
├── concept-03-wayfinder.html
├── concept-04-ledger.html
├── _shared/
│   ├── app.mjs
│   ├── components.css
│   ├── concept-hub-bridge.js
│   ├── data.mjs
│   ├── gallery.mjs
│   ├── icons.svg
│   ├── motion.mjs
│   ├── shell.css
│   ├── state.mjs
│   ├── themes.css
│   └── view.mjs
├── styles/
│   ├── gallery.css
│   ├── index-house.css
│   ├── ledger.css
│   ├── switchboard.css
│   └── wayfinder.css
├── verify/
│   ├── browser-smoke.mjs
│   └── state.test.mjs
├── FINDINGS.md
├── IMPACT_REGISTER.json
├── TEST_REPORT.md
└── README.md
```

## Validation

Run from the Puppet Master repository root:

```sh
node --test 'Concepts/settings-redesign-concepts/5.6 Sol/verify/state.test.mjs'
node 'Concepts/settings-redesign-concepts/5.6 Sol/verify/browser-smoke.mjs'
python3 -m unittest discover -s Concepts/ConceptHub/tests -p 'test_*.py'
PYTHONDONTWRITEBYTECODE=1 python3 Concepts/ConceptHub/validate.py 'Concepts/settings-redesign-concepts/5.6 Sol'
```

The browser verifier starts its own shared ConceptHub on an OS-assigned port, uses unique temporary browser/output directories, writes no retained screenshots or traces, terminates only the process it started, and removes its temporary root before exit.
