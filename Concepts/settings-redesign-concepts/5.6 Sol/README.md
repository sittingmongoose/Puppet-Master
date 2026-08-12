# 5.6 Sol — Puppet Master Settings Bakeoff

This folder contains four final, self-contained Settings concepts for the 5.6 Sol bakeoff. The work is concept-only. It does not edit or claim canonical authority over PMConcept7, Plans, the Settings inventory or schema, the UI command catalog, the wiring matrix, DRY owners, Usage, Assistant Chat, ConceptHub, or another model folder.

The four concepts share a normalized product architecture so they can be compared fairly, but they do not share one visual composition. Each concept has its own information hierarchy, manager grammar, spatial behavior, motion choreography, responsive transformation, and focus treatment.

No winner is selected in this folder.

## Concept map

| Concept | Design thesis | Assigned manager families | Motion character |
|---|---|---|---|
| **Index House** | A stable-address archive for settings, provenance, memory, policy, and delegated behavior. | Providers; Context & Instructions; Memory; Personas; Goal & Automation; Crew; Permissions & FileSafe; Back Seat Driver. | Editorial address transfer, staged directory-to-record arrival, localized evidence crossfades, and restrained archival depth. |
| **Switchboard** | A quiet operational surface for readiness, notification, appearance, input, desktop, and help behavior. | Providers; Notifications & Sounds; Appearance; Spellcheck; Desktop; Teacher & Help. | Signal routing, latching state, local preview choreography, and transactional confirmation without permanent ambient motion. |
| **Wayfinder** | A guided toolchain route with explicit setup, verification, dependency, and recovery checkpoints. | Providers; File Manager; Terminal; LSP; Formatters; Commands & Shortcuts; MCP; Skills; Plugins; Tools; Testing & Debugging. | Route resolution, checkpoint progression, branch disclosure, and clear recovery movement. |
| **Ledger** | A dense requested/effective and provenance folio for lifecycle, storage, source, and runtime systems. | Providers; Storage & Retention; Backup & Restore; Settings Lifecycle; History & Sessions; Runtime Artifacts; Source Control & Worktrees; GitHub Actions; Containers & Registries; Web/Search/Fetch; Project Search Index; Workspace Cleanup; deferred Server insertion shell. | Folio arrival, compact FLIP reflow, rule draws, comparison emphasis, and receipt-oriented state transitions. |

The assignment totals 38 concept placements across 35 distinct manager families. Providers are intentionally repeated in all four concepts so the same product graph can be evaluated through four different visual and interaction systems.

## Shared product architecture

The implementation keeps product semantics independent from the DOM and from any one concept composition.

`_shared/data.mjs` and `_shared/manager-data.mjs` provide deterministic, review-safe fixtures:

- 10 Settings categories and 72 representative setting rows;
- 8 value states and 6 exposure levels;
- 37 registered manager routes and 34 inventory-backed manager systems;
- 35 distinct final-packet manager families assigned across the four concepts;
- 7 provider families, 10 accounts, 10 connections, 11 role assignments, and 7 installation observations;
- 9 evidence-backed Memory Gists with 22 immutable versions;
- 4 Terminal profiles;
- all 8 supplied themes;
- 12 baseline review scenarios;
- 24 named deterministic state triggers;
- 11 reusable transaction templates;
- 3 resumable setup sessions, 8 recent changes, and receipt history.

All provider, account, usage, installation, system, and error data is explicitly concept fixture data. The concepts do not present it as live machine evidence.

## Navigation and workspace model

Every concept includes:

- the quiet Puppet Master application shell;
- Settings Home with destination navigation and compact actionable notices;
- one global Settings search combobox;
- category and subcategory workspace navigation;
- a continuous Settings document with scrollspy;
- exact destination routing to settings, managers, tabs, and resources;
- browser-history-compatible deep links;
- project/global scope and requested/effective state;
- persistent local demo state with a complete authored-state reset;
- narrow drill-in behavior and squeezed-height handling.

Canonical concept routes are:

```text
#home
#category/<category>/<subcategory>
#setting/<setting-id>
#manager/<manager-id>/<tab>?resource=<resource-id>&child=<child-id>
```

Primary destinations are navigation rows, directory entries, stations, route checkpoints, or folio records—not category/filter pills.

## Provider, account, model, and installation graph

Providers use a common semantic graph:

```text
Provider family
  -> account/profile
    -> connection/authentication
      -> entitlement
        -> models and capabilities

Installation
  -> host/environment
  -> discovery evidence
  -> ownership confidence
  -> selected/shadowed state
  -> version/update state
```

The concepts preserve the required provider boundaries:

- provider setup and CLI installation are separate operations;
- provider CLIs are not bundled or installed silently;
- acquisition begins only after explicit user action and uses an official source;
- existing installations and credentials are detected before setup is proposed;
- unknown ownership becomes manual-only rather than being overwritten;
- selected and shadowed installations are both visible;
- account priority and fallback routing are explicit;
- requested and effective model routes are shown separately;
- CLI-owned OAuth is distinguished from Puppet Master direct OAuth;
- Claude and Google Antigravity retain CLI-owned OAuth boundaries;
- OpenAI may expose Puppet Master direct OAuth where supported;
- an external OpenCode server is modeled separately from a bundled provider;
- Free Models is a catalogue/wrapper over underlying providers rather than a synthetic account;
- catalogue freshness, failed refresh, quarantine, and last-known-good data are visible;
- Ask First and idle update policies are distinct;
- verification failure and rollback are first-class states;
- provider readiness remains meaningful when usage information is unavailable;
- Fast/Normal and effort variations are evidence-qualified model routes.

The provider manager exposes Overview, Accounts & Connections, Models, Usage, Routing & Priority, Roles, Support, and Installations. Important actions produce deterministic state changes, receipts, validation, failure, or rollback rather than decorative feedback.

## Manager coverage

### Index House

Index House proves the relationship among admitted context, degrading memory, Persona behavior, Goal defaults, Crew composition, permission boundaries, FileSafe, and Back Seat Driver policy. The information architecture emphasizes stable addresses, source provenance, inherited/effective values, and local evidence rather than a dashboard of disconnected cards.

### Switchboard

Switchboard proves Notifications & Sounds, notification destinations, uploaded audio, PeonPing/OpenPeon-compatible sound-pack states, license and format validation, local preview, explicit test send, Appearance, custom theme/TOML validation, fonts, OS mode, spellcheck without autocorrect, dictionaries, desktop/tray/startup/window behavior, and Teacher/help settings.

The only in-app notification destination represented is Puppet Master’s title-bar notification stack/inbox. Sound audition is local and visibly distinct from a notification test send.

### Wayfinder

Wayfinder proves File Manager/editor integration, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools, and Testing & Debugging. These remain distinct manager families. The concept shows setup, enablement, dependency, conflict, validation, environment scope, restart/reconnect, test, and recovery relationships.

### Ledger

Ledger proves Storage & Retention, Backup & Restore, Settings import/export/merge/replace/reset, Copy Settings From, History & Sessions, Runtime Artifacts, Source Control & Worktrees, GitHub Actions, Containers & Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup, and the deferred Server-module insertion shell.

The Server shell contains insertion destinations for Servers, Execution Hosts, Clients, Project Hosting & Files, Remote Access, and Updates. It deliberately does not invent those modules’ backend state machines.

## Transaction and lifecycle systems

`_shared/state.mjs` owns persistent product state and deterministic transactions independently of visual geometry. It supports:

- import validation, merge/replace choice, conflict review, sensitive-value handling, apply receipt, failure, and rollback;
- Copy Settings From with scoped categories;
- category reset and full-scope reset;
- changed-elsewhere reconciliation;
- provider detect, explicit install, verify, authenticate, select, update, fail verification, and roll back;
- sound-pack inspect, license/format validation, preview, event mapping, apply, and reject;
- theme preview, custom TOML validation, safe fallback, apply, revert, and restore default;
- backup restore, cleanup, deterministic capability testing, and generic manager operations;
- lazy manager hydration;
- namespaced local persistence with schema checks and safe fallback when storage is unavailable.

A reset removes persisted concept state and restores the complete authored baseline: route, selections, theme, density, motion preference, manager data, fixtures, presentation, and receipts.

## Deterministic review states

Every required review condition can be reached without editing source. The 24 named triggers cover:

- selected and shadowed provider installations;
- unknown installation ownership;
- signed-out CLI OAuth;
- explicit installation availability;
- stale provider catalogue and failed refresh with last-known-good data;
- requested/effective route differences;
- validation, managed, unavailable, restart, reconnect, and rollback states;
- changed-elsewhere and import-conflict states;
- invalid sound-pack license;
- invalid custom-theme token and fallback;
- unavailable testing capability;
- protected cleanup scope;
- deferred Server insertion;
- no-result and typo search;
- long-copy stress;
- lazy manager hydration.

The in-page fixture tray and `PMSettingsDemo` API expose the same states.

## Review API

Each concept exports:

```js
PMSettingsDemo.dispatch(action)
PMSettingsDemo.applyReviewState(state)
PMSettingsDemo.whenIdle()
PMSettingsDemo.settleForReview()
PMSettingsDemo.snapshot()
PMSettingsDemo.motionSnapshot()
PMSettingsDemo.openHome()
PMSettingsDemo.openCategory(categoryId, subcategoryId)
PMSettingsDemo.openManager(managerId, tab, options)
PMSettingsDemo.openSetting(settingId)
PMSettingsDemo.deepLink()
PMSettingsDemo.applyDeepLink()
PMSettingsDemo.fixtures()
PMSettingsDemo.triggerFixture(fixtureId)
PMSettingsDemo.startFlow(kind, options)
PMSettingsDemo.advanceFlow(options)
PMSettingsDemo.chooseFlow(choice)
PMSettingsDemo.rollbackFlow()
PMSettingsDemo.reset()
```

`whenIdle()` waits for state work, rendering, motion settlement, and two animation frames. `settleForReview()` is a QA-only deterministic final-state hook.

## Visual and motion systems

`_shared/motion.mjs` coordinates 12 semantic motion kinds:

```text
navigate
category
search
jump
scrollspy
disclosure
refresh
save
reorder
drawer
transaction
preview
```

Each concept maps those intents to a different participant sequence and spatial grammar. Motion is used to explain destination, causality, verification, comparison, or recovery. It is not used as indefinite ambience.

The implementation avoids large height animation, simultaneous geometry/text shimmer, permanent status pulsing, and effects that delay focus or state. Reduced motion installs equivalent state and geometry immediately and retains only restrained focus/opacity cues where useful.

The motion design is intended for later Slint 1.17.1 translation through semantic keys, temporary proxy layers, property animation, and finite state-driven sequences rather than browser-specific visual assumptions.

## Responsive and accessibility behavior

The concepts support wide desktop, standard desktop, narrow drill-in, very narrow destination-first, and squeezed-height modes. ConceptHub can exercise widths from 520 through 2500 pixels.

The implementation includes:

- semantic landmarks, headings, tablists, comboboxes, menus, disclosures, dialogs, and current-location state;
- keyboard search traversal and activation;
- Escape behavior and focus restoration;
- visible focus in every theme;
- status announcements for deterministic asynchronous-looking operations;
- focus-accessible help rather than hover-only explanations;
- no essential state conveyed only by color or motion;
- long-label and 135% text-expansion handling;
- RTL handling and direction-safe technical strings;
- coarse-pointer targets;
- forced-color fallbacks;
- reduced-motion parity;
- no horizontal page overflow in the tested width matrix.

## Impact and ownership artifacts

Each concept has a companion directory containing exactly:

```text
impact-register.json
manager-coverage.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
```

The artifacts:

- map every assigned manager to its route, fixtures, action, recovery path, and test probe;
- identify concept-only versus probable canonical owner surfaces;
- census 699 existing `cmd.*` tokens from `Plans/UI_Command_Catalog.md`;
- classify operations as reuse, supersession, or provisional candidate work;
- explicitly adjudicate `cmd.settings.bloom.open` as a supersession/compatibility question;
- trace UI action through validation, owner, durable or ObservableWork state, event/receipt, updated UI, Usage/diagnostic effects, and recovery route;
- identify DRY candidates without declaring canon;
- preserve the deferred Server owner boundary.

Candidate IDs are intentionally provisional. A catalogue token match proves presence, not semantic compatibility.

## Verification

See `TEST_REPORT.md` for the full verification matrix. The final pass includes:

- 23 state and architecture tests;
- ConceptHub structural validation;
- JSON/schema-shape and artifact-count checks;
- browser execution through ConceptHub on an operating-system-assigned port with an isolated persistent profile;
- all four concepts, all eight themes, all assigned manager routes, widths from 520 to 2500 pixels, reduced motion, RTL, 135% text expansion, coarse pointer, forced colors, deep links, history, search, transactions, fixtures, persistence, reset, and actual motion participant checks.

## Prototype boundary

Authentication, software installation, provider updates, filesystem import/export, backup/restore, notification delivery, sound-pack installation, container/registry operations, source-control mutation, testing tools, cleanup, and future Server behavior are deterministic concept simulations. They prove information architecture, state transitions, validation, receipts, recovery, and candidate wiring implications. They do not perform external operations or claim production integration.
