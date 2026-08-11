# 5.6 Sol — Settings Bakeoff Findings

No concept is ranked or recommended in this document.

## Packet-fidelity result

The implementation was reconciled against `Concepts/CONCEPT_RULES.md`, PMConcept7 as a read-only baseline, and every file in the supplied `settings_bakeoff/` packet. The final concept lane contains the required Home, full one-category workspace, Provider/Agent/Model manager, Memory manager, Terminal manager, and additional inventory/detail managers. Search, navigation, scrollspy, setting controls, manager state, motion, shell controls, themes, narrow states, and simulation receipts are interactive rather than screenshot-only.

No critical or high functional, motion, accessibility, responsive, or packet-fidelity finding remains open in the concept implementation. The remaining items below are promotion boundaries, native-port considerations, deterministic-demo limits, or manual test limitations—not hidden concept defects.

## Information-architecture findings

### 5.6 Sol — Index House

Index House treats Settings as a stable place system. Numbered Home destinations carry purpose, status, and an explicit forward affordance rather than behaving like filters. The same number and title become the workspace address.

Search is the dominant entry point on Home and remains beside workspace and manager navigation. A result resolves through the owner category and subcategory to a setting or manager resource. In the workspace, the directory controls major-category replacement and semantic subcategory jumps; the continuous record preserves reading flow; scrollspy moves the address marker; the evidence inspector atomically changes title, description, source, scope, exposure, effects, and requirements.

Providers become an addressable catalogue, Memory an evidence archive, Terminal a profile shelf with a working preview, and supporting inventories a room directory. At middle widths the evidence pane becomes a drawer; at squeezed widths navigation becomes a one-column navigator and evidence moves inline.

Its motion thesis is “directory to room”: the selected address survives the transition, panes stage in sequence, and inspector facts crossfade without remounting the whole page. Reduced motion uses the final geometry plus static address emphasis and a brief focus cue.

### 5.6 Sol — Switchboard

Switchboard treats Settings as an operational control surface. Search is a command console above rectangular destination bays; derived readiness summaries and action-led status strips answer what is usable and what should happen next without converting every preference into an alert.

The station bar switches major categories, the vertical signal track controls subcategory jumps, and the active signal follows scrollspy. A persistent effective-state tray explains requested/effective values, source, and future-versus-in-flight routing.

The Provider manager is a connection topology with health lanes, retained last-known-good rows, and a seven-stage refresh/readiness story. Memory is a verification queue, Terminal is a live profile instrument, and supporting managers become operational queues with meaningful actions and receipts. The provider master/detail layout is used only above a 1350 px effective main width; below that it becomes one column and then explicit narrow drill-in.

Its motion thesis is “finite signal, then latch”: a destination bay becomes a station, a signal travels once, and content appears only after the station is established. Refresh stages connection, catalogue, and readiness while existing rows stay mounted. Reduced motion immediately installs the latched marker and final state.

### 5.6 Sol — Wayfinder

Wayfinder treats Settings as routes toward human outcomes—make PM feel right, connect intelligence, control agents, keep context, plan and verify, coordinate work, extend capabilities, create media, and diagnose or recover. Canonical owner names remain visible so the humanized layer does not erase expert orientation.

Search is the map origin and returns both the exact target and its route. The journey map switches categories, checkpoints control continuous chapters, and “you are here” follows scrollspy. Expert disclosure is a visible branch, not a second hidden settings system.

Provider, Memory, and Terminal surfaces become guided connect, inspect, verify, preview, and repair journeys with direct expert branches. Supporting managers use the same journey grammar without inventing persistent wizard state. Three columns become two, then a navigator drawer with compact inline checkpoint context.

Its motion thesis is “origin to waypoint”: the selected waypoint becomes the route banner, the route line resolves after layout, and the first checkpoint arrives. Expert detail grows as a branch; scrollspy moves the current-location marker. Reduced motion shows the completed route and current waypoint immediately.

### 5.6 Sol — Ledger

Ledger treats Settings as a reference and comparison system. Home combines a masthead search, a destination register, and an adjacent attention/recent-change ledger. Search can temporarily become the primary filtered register without changing category controls into pills.

A pinned directory replaces the active major-category folio; a continuous document preserves chapter reading; a right-margin minimap controls semantic jumps and mirrors scrollspy. Requested/effective values, source, scope, evidence freshness, and history are intentionally prominent.

Providers use expandable hierarchy records, Memory uses an immutable evidence/version ledger, and Terminal compares saved and draft values side by side. At squeezed widths, tables reflow into labelled ledger entries and navigation becomes an outline menu; horizontal clipping is not used as the fallback.

Its motion thesis is “reference to folio”: the selected register reference becomes the folio masthead, geometry reflows through FLIP, a rule draws once, and text settles afterward. Reorder and version changes get compact line emphasis. Reduced motion uses immediate reflow with a changed rule and row tint.

## Cross-concept findings

- Search can remain central without making primary destinations look like filters. The four alternatives are an address search, an operational console, a map origin, and a filtered register.
- Major categories and subcategories require different navigation semantics. Loading one major category while presenting all of its subcategories as one continuous document preserves both the category boundary and document flow.
- Scrollspy must reflect semantic anchors rather than own product state. A controlled jump installs the semantic target first, locks observation until the destination settles or is interrupted, then gives observation ownership back.
- One-shot focus requests are essential. A deep link may reveal Advanced content and focus a setting once; later edits must not scroll the user back to the original result.
- Persistent shell and keyed local patches materially improve fidelity. Ordinary controls, provider rows, Memory records, Terminal drafts, receipts, and search options no longer lose focus through a coarse full-app remount.
- Dedicated managers need the same source, scope, requested/effective, availability, history, and receipt language as ordinary settings, but each concept benefits from its own manager composition.
- Provider family, account/profile, connection, product/plan, model route, runtime adapter, and capability evidence must remain separate in semantic state even when the UI simplifies a quiet default view.
- Authentication is not readiness. The demo preserves signed-in but failed invocation, stale last-known-good data, capability evidence freshness, and quarantined refresh results as different states.
- Preferred-account changes are future-only. The captured in-flight route remains visible and unchanged.
- Normal/Fast, effort, modality, and role eligibility must be evidence-gated. Unsupported choices are absent or disabled with a reason; an unqualified low-quality route cannot replace the high-quality PRD/Planning conversation route.
- Memory is better understood through evidence, immutable versions, access history, half-life, and restore-as-new-version behavior than through a flat transcript list.
- Terminal needs saved-versus-draft state, a live preview, dirty-switch handling, and diagnostics; shell and font-size controls alone do not prove the manager system.
- Spellcheck works best as a quiet input service. Explicit suggestions and dictionary scopes are useful; autocorrect, a permanent composer button, and undisclosed provider calls are not.
- Short-lived toasts are insufficient for warnings, errors, and simulations. Persistent inline receipts make every boundary action honest and reviewable.
- Usage is a boundary handoff, not a hidden duplicate manager. Global search can land on Provider → Usage for source-labelled snapshots, focus the destination heading, and preserve provider/account context while the full measured history remains owned by Usage.
- Supporting managers lose credibility when they share synthetic placeholder facts. Context, Personas, Crew, MCP, LSP, extensions/tools, and Media need domain-shaped inventory fields, diagnostics, history, and actions even when their outer accessibility primitives are shared.

## Functional-fidelity findings

- The global combobox uses one central query/open/active-option/surface state and structured destinations, so Home, workspace, and managers cannot diverge in keyboard behavior.
- Structured dispatch results let rendering, focus, announcements, and motion respond to the same action without encoding behavior in string render reasons.
- Twelve scenarios clone the baseline and apply entity overlays. Attention summaries and Home notices are derived from those entities, which prevents a Calm scenario from retaining hidden errors or Setup from contradicting its resumable records.
- Setting state is modeled as Default, Inherited, Auto, Not configured, Managed, Custom, Unavailable, or Effective value differs. Recommendation is independent. Source, scope, defaults, managed/unavailable reasons, restart/reconnect requirements, exposure, and material effects can coexist.
- Separate Restore default and Use inherited value actions avoid the common reset ambiguity. Rejected bounded input remains visible with a connected inline error.
- Every enabled action has one visible result. External boundaries are simulated with persistent receipts; unavailable and model-order boundary controls are disabled with explanatory text.
- Focus consumption is state cleanup, not a visual event. It must not enqueue animation after the deep-link cue has completed.
- Motion evidence needs to witness mounted participants and actual finite animation calls. Stage labels alone cannot prove that a blueprint survives selector drift or that reduced motion uses the intended single cue.

## Accessibility and responsive findings

- The eight themes require semantic tokens, not theme-specific meaning. Text, status, focus, and control boundaries are independent tokens; state is never communicated by color alone.
- Squeezed and zoomed layouts need type floors. Body copy remains at least 16 px, setting labels and descriptions at least 14 px, and essential metadata at least 12 px.
- `100dvh`, `min-height: 0`, bounded internal scrolling, and overlay containment prevent competing page/canvas scroll regions and root overflow at 200%-zoom-equivalent widths.
- Real comboboxes, tablists, disclosures, menus, current-location navigation, drawers, inert hidden shell panels, and focus restoration are necessary because browser appearance alone does not provide the interaction contract.
- Native roles must stay internally coherent: interactive Ledger rows remain buttons rather than acquiring list-item roles, and narrow navigators are real dismissible drawers with a backdrop and focus return.
- Narrow manager list/detail drill-in is more robust than squeezing a desktop split pane. Opening detail focuses the heading; Back or Escape returns focus to the originating row.
- Responsive hiding is acceptable only with an equivalent reachable surface. Index House therefore moves evidence from the wide third pane into a labelled modal drawer at middle widths, then returns it inline in the squeezed document; CSS-only `display:none` is not a valid adaptation.
- Coarse-pointer mode needs 44 × 44 px targets and no hover dependency. Forced-colors, RTL, mirrored directional icons, technical `dir` overrides, and 35% text expansion need explicit fixtures because ordinary responsive testing does not cover them.

## Inventory, Usage, and canonical boundaries

The packet identifies a real taxonomy tension: the current Settings inventory mixes user goals with implementation boundaries. These concepts propose humanized labels and search aliases while preserving all required domains, but they do not settle canonical category IDs, localization, aliases, migration, or owner placement. Those remain promotion decisions.

Settings may show a compact provider usage snapshot and provider-specific “what happens next” state. Usage continues to own measured/provider-reported balances, history, projections, and forecasts. The concept does not create a second usage calculation system.

CLI-owned OAuth, PM-direct connections, API credential pools, server routes, and Free Models delegation need distinct storage and wiring contracts. Claude and Antigravity remain CLI-owned OAuth examples; the concept does not present them as PM-direct OAuth.

Requested/effective state, capability evidence, catalogue quarantine, future-only provider preference, Memory versions/Undo, Terminal drafts, spelling dictionaries, narrow focus restoration, and semantic motion keys all imply production storage, events, commands, wiring, DRY components, and Slint adapters. `IMPACT_REGISTER.json` records probable owners and uncertainty. Candidate commands are explicitly `NOT_MINTED`; none were added to canon.

## Known simulations

- provider or platform sign-in, installation, update, reconnect, repair, billing, purchase, model invocation, and usage refresh;
- external catalogue discovery, capability qualification, generation, and support-bundle creation;
- shell discovery, command execution, filesystem/CWD mutation, and native Terminal diagnostics;
- operating-system spelling services, dictionary writes, and grammar/style provider assistance;
- durable Memory/storage writes, index rebuild, deduplication, restore, and redaction;
- production command dispatch, organization-policy enforcement, and native persistence.

Fixture-local setting edits, search, navigation, jump/scrollspy, disclosure, provider state transitions, model controls, role gates, Memory versions/Undo, Terminal drafts/preview, spelling actions, themes, shell state, responsive drill-in, announcements, and receipts are real interactions inside the concept.

## Slint 1.17.1 translation

- Semantic state already lives outside DOM geometry. A Slint viewport adapter can emit section positions and controlled-scroll completion while Rust state remains authoritative.
- Long settings, provider, model, Memory, Terminal, and manager inventories should use data-backed `ListModel`/`ListView` recycling. The fixture volume proves structure, not native production-scale performance.
- The ten semantic motion intents map to Slint property animations and temporary proxy components. View Transitions are optional web preview enhancement; WAAPI choreography documents the fallback, not a browser-only requirement.
- Sticky panes, drawers, and table-to-labelled-entry reflow require explicit Slint layout states rather than CSS breakpoint magic.
- Glass uses a bounded web backdrop treatment. Native Slint may use a tinted translucent material if live blur is not appropriate.
- Search scoring, scenario overlays, receipt retention, refresh deduplication/quarantine, future-only routing, model qualification, Memory versioning, Terminal draft validation, and spelling exclusions should move to Rust domain services while views consume normalized models and actions.

## Source conflicts and resolutions

Resolved within this concept lane:

- The packet templates say `CursorAuto`; the direct user instruction names `5.6 Sol`, which is used in the folder, document titles, visible labels, manifest, and every `data-concept-model` marker.
- PMConcept7’s fuzzy search keyboard behavior and live theme/motion precedent are preserved conceptually. Its category pills, horizontal notice rail, and bloom modal are intentionally superseded by the packet’s full Settings architecture. PMConcept7 itself remains unchanged.
- Upstream-product breadth informed fixtures only. No upstream layout was copied one-to-one.

Unresolved for canonical promotion:

- humanized taxonomy aliases, stable canonical category ownership, localization, and migration;
- exact existing command identities, payloads, permission checks, receipts, and Undo semantics for concept actions;
- Settings/Usage summary and deep-link wiring ownership;
- storage/event ownership for requested/effective values, provider catalogue versions and quarantine, future-only routing, Memory versions, Terminal drafts, and spelling dictionaries;
- production qualification sources for provider/model capability, usage, and freshness labels;
- Slint-native virtualization and motion performance thresholds.

No unresolved source conflict prevents review of the four concept artifacts. None of the unresolved items was implemented outside this model folder.
