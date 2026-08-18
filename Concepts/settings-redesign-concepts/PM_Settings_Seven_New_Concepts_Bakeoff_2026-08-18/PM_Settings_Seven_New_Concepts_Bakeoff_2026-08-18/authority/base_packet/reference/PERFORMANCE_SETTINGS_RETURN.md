# Full-Thread Return Handoff — PMConcept7 Settings Redesign

**Date:** 2026-08-08  
**Purpose:** carry the complete PMConcept7 factory, Settings-performance, provider/tool lifecycle, server insertion, renderer, storage, loading, and concurrent-Plan boundaries into the Settings thread  
**Status:** handoff only; preserve the current concept workload; do not regenerate its prompt/packet solely from this file

Read `02_FULL_THREAD_CURRENT_DECISION_REGISTER.md` with this targeted handoff.

## 1. Do not expand the concepts already in flight indiscriminately

The current Settings concept agents already have a large assignment. Record insertion contracts and reusable manager grammar for newly arriving systems rather than forcing every Server, Project Move, renderer-recovery, full concurrent-Plan, Doctor, or Installation screen into the current bakeoff.

The later dedicated Goal will integrate against the selected Settings grammar and newest owner-thread outputs.

## 2. Exact PMConcept7 first-open factory state

For a fresh or untouched demo workspace:

- default theme is **Basic Dark**;
- Assistant Chat is open;
- only Editor Panel 1 is visible;
- Panels 2–4 remain available;
- Editor Panel 1 contains all seven default file tabs:
  - `src/main.rs`
  - `src/routes/recipes.rs`
  - `web/src/routes/+page.svelte`
  - `Cargo.toml`
  - `src/models/recipe.rs`
  - `docker-compose.yml`
  - `Dockerfile`
- visible browser tab `localhost:5173` (`workspace_preview`) is hosted in Editor Panel 1;
- hidden `[auto] test-runner` (`automation_session`) and its automation/browser-session behavior move with it;
- later opening Panels 2–4 creates/uses another empty/new split target rather than duplicating factory tabs.

These are factory defaults and missing/corrupt-state fallbacks, not launch-time overrides of user-customized theme/layout.

Update together:

- authored PMConcept7 base/transform/build inputs;
- default theme bootstrap and Settings demo values;
- layout factory and recovery fallback;
- persisted-state version/migration for untouched old defaults;
- editor owner/buffer model;
- tab markup and active-buffer state;
- browser toolbar/content/session mounting;
- Panel-2-specific helpers such as `ensureBrowserTab`, `switchEditorPane2Tab`, code-area IDs, and routing assumptions;
- demo actions and tests; and
- regenerated `PMConcept7.html`.

Keep the semantic browser command pane-independent: `cmd.browser.open_workspace_preview`, not an Editor-1 alias.

## 3. Left Activity Bar and side-panel performance

Current shell canon:

- Activity Bar is the left vertical rail;
- one left side-panel occupant at a time;
- Source Control and GitHub Actions remain separate occupants;
- Dashboard/Home is primary content, not another panel identity;
- preserve `cmd.panel.switch`, `cmd.panel.undock`, and `cmd.panel.redock` ownership.

Retire stale right-hand prose and `ui_location` strings in later canonical/wiring work.

Performance:

- inactive panels are not fully laid out/hydrated/subscribed;
- selected detail hydrates separately from compact pinned/rail summaries;
- undocked views share backend subscriptions;
- reorder/More tray/Ctrl-number changes do not cause full shell layout/persistence storms;
- splitter drag updates immediate geometry and defers expensive observers where safe.

## 4. Settings Home and manager performance model

Opening Settings creates compact destination summaries, not complete models for all managers.

Suggested `ManagerSummaryProjection`:

```text
manager/destination ID
human category/title
ready / attention / unavailable / refreshing summary
attention count
freshness / last verified
scope/effective/inherited summary
primary action/deep link
active ObservableWork refs
```

Suggested `IntegrationSummaryProjection`:

```text
product label
host/environment
ready/setup/repair/update state
version
account identity when relevant
last verified/freshness
one primary action
```

Raw binary paths, package records, endpoint scoring, logs, large schemas/catalogs, and provenance hydrate only in Details.

Required behavior:

- cached Settings Home first;
- lazy selected-manager hydration;
- virtualized lists;
- generation IDs/latest-request-wins cancellation;
- byte-bounded projections/caches;
- domain-local refresh/failure;
- no full catalog/probe because one row became visible;
- no per-row repaint storm after bulk mutation;
- retain last-known values while refreshing;
- hidden managers release heavy state; and
- no all-provider/all-host/all-tool scan at process startup.

## 5. Full manager coverage retained from the completeness audit

The future Settings architecture must provide a coherent destination or explicit insertion contract for every category below. The current bakeoff may distribute deep proofs across concepts, but it must not imply only Provider Manager plus two optional managers is complete.

### Providers, accounts, models, installations

- configured/ready providers only in normal usage surfaces;
- unconfigured/free providers do not appear as active accounts;
- account/connection/product/plan/model identities remain distinct;
- requested versus effective route;
- cached catalog, readiness, freshness, auth, installation, model capability, and Usage telemetry state.

### Notifications & Sounds

- destinations/event routing/quiet hours;
- local preview separate from external test-send;
- sound library/upload/import/export/restore;
- PeonPing/OpenPeon-compatible pack import with provenance/licensing/dedup/repair;
- bounded audio decode/cache and asynchronous pack validation.

### Appearance

- eight built-in variants and Light/Dark/Auto;
- custom theme/font lifecycle, validation, fallback, live reload;
- reversible preview;
- reduced motion;
- renderer diagnostics kept separate from theme family.

### General desktop behavior

- tray, show/hide/quit/restart;
- close-to-tray versus quit;
- ordinary restore versus crash recovery;
- startup and layout precedence;
- global versus Project scope;
- one coherent desktop behavior policy rather than scattered hidden rows.

### Settings lifecycle

- import/export/reset/migration/rollback;
- validate and preview before mutation;
- merge versus replace;
- source version/scope/conflict review;
- managed/read-only values;
- secrets as references, not ordinary strings;
- pre-apply snapshot and bounded crash-safe rollback;
- one coherent projection revision after apply.

### Permissions/FileSafe

- global defaults and per-tool overrides;
- ordered rules/inheritance/requested-versus-effective policy;
- Global, Project, Package, Seam, Lane, Goal, thread, and turn scopes where supported;
- external-directory allowlist;
- Full Access wording without weakening FileSafe;
- Plan/Review read/research/test capability distinct from mutation authority;
- ELI5/Expert backed by one rule model.

### Commands and shortcuts

- user command create/edit/delete/duplicate/enable/disable;
- Global versus Project override;
- dry-run/validation/include resolution;
- keybinding add/edit/remove/reset/conflict resolution;
- import/export/cheat-sheet;
- one command path shared with palette/natural language/automation.

### Storage, retention, recovery

- storage health/root/relocation;
- retention;
- legal holds;
- quarantine;
- compaction/pressure/cleanup;
- recovery snapshots;
- Project removal versus data deletion;
- chat/history retention;
- migration/compatibility/diagnostics.

SQLite is prohibited. Settings presents the selected seglog/redb/Tantivy/content-addressed architecture through human summaries rather than inventing a new store.

### Files & Editor

Organize existing preferences and effective/inherited values. Do not create a duplicate File Manager runtime inside Settings.

### LSP and Formatters

- requested/effective server/formatter;
- host attachment and remote degradation;
- installation/health/restart/test/logs;
- version-aware edits/fresh diagnostics;
- avoid duplicate format routes between formatter and LSP commands.

### Source Control and GitHub Actions

- Source Control provider/tool setup, selected Git installation, hosted accounts, update policy, duplicate installation resolution, health/logs/repair;
- remain separate operational panels;
- GitHub hosting API ownership not silently replaced by `gh`.

### Docker/Podman/Kubernetes/registries

Group normal identities into human products/services/contexts. Consume shared detect/install/auth/update/repair lifecycle while Docker Manager remains operational owner.

### Web search/fetch/crawl

- automatic ordered ready providers;
- capability differences (search/fetch/crawl/map/extract);
- credentials/setup/privacy/cost/credits;
- exact setup destination;
- ready versus Usage telemetry unavailable;
- proxy/certificate/air-gap/browser fallback state.

### Project search index

- identity/scope/location;
- disabled/building/ready/stale/failed;
- exclusions/max size/ignored-hidden-symlink policy;
- disk use/file count/remote cache;
- progress/cancel/pause/resume/rebuild/clear/repair/version compatibility;
- no duplicate index per thread.

### Testing and Run/Debug

- Global/Project Auto/On/Off by capability;
- browser/desktop/simulator/emulator/device/API/DB/network/performance/security capability/session manager;
- shared ResourceGovernor/session/port/recording/evidence infrastructure;
- Testing and Debug remain separate operational surfaces.

### Chat history and sessions

Settings owns retention/archive/deleted window/export/rebuild/filter/scope policy, not thread runtime behavior.

### Runtime artifacts/project outputs

Retention/pin/export/compare/restore/delete/cleanup/provenance/redaction administration while the Artifacts panel owns operational browsing/recording.

### Workspace cleanup

- scan and dry-run plan;
- build/cache/generated/stale artifact/log/eligible worktree categories;
- exclusions and protected active-run/evidence/safepoint/lease handling;
- size estimate confidence;
- cancellation/partial receipt/recovery.

### Skills, Plugins, Tools, MCP

- install/update/enable/disable/reload/remove/validate/test/auth/connect/reconnect/catalog/logs;
- provenance/trust/compatibility/permissions/dependencies;
- no manager-private mutation handlers.

### Media

- provider/setup/health/requested-effective route;
- generation/test/cancel/open/reveal;
- alternate-provider privacy/cost confirmation;
- Usage attribution and retention/redaction.

### Teacher/contextual help

- help-entry registry, contextual anchors, tours/overlays, help search, Teacher thread;
- current object/screen context only, not full product manual injection.

### DRY Method

Visible state grammar such as Applied, Degraded, Disabled, Missing owner, Stale reference, Owner resolved, Mutation blocked, with evidence links rather than editable governance prose.

### Accessibility/input/spellcheck

- accessibility/input settings;
- local spell service using OS/local dictionaries;
- personal and Project dictionary;
- thread enable/disable;
- passive underline/context suggestions;
- skip code/paths/URLs/commands/hashes/identifiers/structured data;
- grammar/style separate opt-in provider route.

### App/content updates, Server/remote access, Onboarding, Doctor

Reserve insertion modules and shared grammar. Do not let concept agents invent these owner systems.

## 6. Provider catalog and onboarding performance

- render cached provider/model catalog and known connections first;
- zero broad probes of unconfigured providers during normal startup;
- bound/coalesce keychain/profile/CLI discovery;
- deduplicate by actual Installation/profile/host, not account row;
- detect existing credentials/profile readiness without copying raw secrets;
- preserve stale last-known state while refreshing;
- official allowlisted pages open on active client when owning host is remote;
- generation/model readiness does not wait for Usage telemetry;
- catalog/reference pricing, included-plan Usage, API/plan estimates, and actual settlement remain distinct;
- cookie/fragile telemetry cannot gate setup.

Normal cards should say human things such as Ready, Needs setup, Update available, Waiting for sign-in, Usage details unavailable—not expose internal registry joins.

## 7. Provider CLI and automatic capability boundaries

### Provider CLIs

- not bundled;
- not silently installed by opening a Project;
- deliberate Provider Settings/onboarding action;
- official provider/package source;
- source/publisher/size/license/cost/permissions/target host disclosed;
- authentication separate;
- BinaryLocator discovery/identity after install;
- transactional update/repair/rollback through shared lifecycle.

### Project capabilities

LSPs, formatters, test adapters, media/visual tools, DAPs, simulator/emulator/device adapters, etc. may provision when needed under Global/Project Auto/On/Off.

`Auto` can proceed silently only if trusted recipe and prior grant cover source, license/cost, elevation, credentials, host, FileSafe, and rollback. Otherwise pause once for approval and optionally remember scope.

CEF is bundled and not a provisioning row.

Use a content-addressed component store and coalesce identical operations so projects do not install duplicate copies unnecessarily.

## 8. Shared installation/update manager

Settings owns intent/policy/presentation, not package-manager execution.

One human integration card may summarize internal `ToolProduct`, `Installation`, launcher, service, auth profile, connection, capability snapshot, transaction, and activation generation.

Required states/actions:

- not installed / Install;
- ready;
- setup/sign-in required;
- update available;
- updating when idle;
- waiting for host/package manager/elevation/approval;
- organization managed;
- duplicate/shadowed;
- unknown provenance/manual remediation;
- verification failed with prior version retained;
- rollback/recovery required;
- remote host offline;
- logs/details/repair.

Do not lock a new `cmd.installation.*` namespace until existing source-control/provider/tool handlers and wiring are inventoried.

## 9. Resource/performance Settings

Settings may expose human policy, not raw thread-pool tuning:

- Auto/Performance/Efficiency/Legacy or equivalent behavior profiles;
- global/Project background-work policy;
- focused/background Plan defaults;
- memory/cache limits at understandable levels;
- metered network/battery/Low Power behavior;
- automatic capability policy;
- diagnostics/effective-policy explanation;
- browser/testing/recording defaults where owned.

Do not expose manual P-core/E-core affinity, SIMD selection, Tokio/Rayon counts, or one knob per internal pool in ordinary Settings.

Per-Plan priority/pause belongs beside active Plan/Orchestrator, not a Settings Plan manager.

## 10. Server-first insertion contract

Later Settings surfaces should provide concise modules such as:

- Servers;
- Project Hosting & Files;
- Execution Hosts and Source Locations, with the Project Home Server shown as the default Execution Host when compatible and an explicit control to select other hosts;
- Remote Access;
- Updates;
- Backup & Restore;
- diagnostics.

No multi-master Sync/replica conflict manager.

Show one Server identity with multiple endpoints. Separate private Tailscale from public Funnel. Funnel is off by default and requires explicit concise confirmation.

Settings consumes Server/Vault/endpoint/Project Move/update projections and commands; it does not implement engines.

## 11. Concurrent Plan boundary

Settings may own global/Project defaults for resource priority, automatic provisioning, memory/network/power, and focused/background behavior.

Settings does not own:

- New Plan or Plan switcher;
- PRD/Planning/Compile/Goal lifecycle;
- per-Plan runtime queue;
- Orchestrator scope/focus;
- Goal execution ownership;
- active Plan pause/priority.

Do not add a `PlanWorkstream` manager.

## 12. Truthful loading/progress component

Provide a reusable `ObservableWork` component with:

- operation title and phase;
- queued/wait reason;
- trustworthy units/bytes/stages;
- cancel/background/retry/details when valid;
- last-known values retained;
- heartbeat/stalled/degraded;
- success/failure/rollback/recovery;
- reduced-motion/static alternative;
- no hidden animation clocks.

A generic spinner must never conceal waiting for host, sign-in, package manager, approval, provider reset, foreground work, or network.

## 13. Renderer and installation-size boundary

Do not choose Skia/FemtoVG/software order.

Reserve renderer diagnostics/recovery showing active renderer, init failure, last-known-good, retry/switch/Safe UI, and diagnostics export.

Software rendering is for PM UI recovery/VM/RDP/driver compatibility, not required for headless browser/emulator/simulator testing.

Where Settings shows storage/components, separate PM core, bundled CEF, on-demand managed components, project toolchains, and symbols/diagnostics. Do not misrepresent CEF as an optional pack.

## 14. Onboarding/Installation boundary

Product Onboarding is not Installation/Deployment or Server Claim & Bootstrap. Settings supplies reusable manager cards and return/deep-link context, but should not merge their state machines.

## 15. Commands, wiring, DRY, Plans

For every navigation, setup, mutation, test-send, import/export, install/update, repair, rollback, cleanup, renderer switch, Server action, or destructive data action, return:

- existing command/handler evidence;
- semantic owner;
- payload/result/error;
- explicit scope/target IDs;
- availability/disabled reason;
- permission/FileSafe/confirmation;
- expected revision/idempotency/fencing;
- event/receipt/`ObservableWork`;
- cancel/rollback/recovery;
- route/deep link;
- keyboard/focus/accessibility;
- production wiring/test.

Use the same semantic command path from GUI, natural language, palette, and automation. Do not count a token in Plan prose as wiring proof.

Identify affected Settings inventory/schema, manager component registry, command catalog, wiring matrix, DRY rules, provider/setup records, storage projections, PMConcept authored/generated files, PlanUnits, and stale right-hand/singleton/SQLite assumptions.

## 16. Performance and visual tests

- cached Settings Home P95 target, then lazy selected manager;
- 825+ settings search without manager instantiation;
- 100 installations collapsed to human summaries;
- provider catalog with zero unconfigured startup probes;
- sound pack import/preview during active Goal;
- theme preview/hot reload during Chat stream;
- large import with one coherent projection revision;
- storage/quarantine/legal-hold pagination;
- Project index rebuild with active threads;
- 50 MCP/tool entries progressively disclosed;
- local/remote Docker/Podman/Kubernetes discovery;
- Activity Bar reorder/drag/undock without inactive layout work;
- Server/Funnel/update insertion under poor network;
- old Ivy Bridge/Xeon and modern platforms;
- all eight themes and target widths;
- reduced motion;
- no user custom-state overwrite;
- exact one-editor/browser/automation factory migration;
- no SQLite; and
- command/wiring/DRY closure.

## 17. Return requested

Return:

1. selected Settings navigation/manager/component grammar;
2. complete manager coverage/insertion manifest;
3. lazy projection and performance rules;
4. provider catalog/readiness/CLI/provisioning behavior;
5. shared integration card and `ObservableWork` component;
6. exact PMConcept7 source/migration/tab/browser changes;
7. Server/update/backup/remote-access insertion modules;
8. renderer diagnostics without renderer decision;
9. command/handler/wiring/DRY/PlanUnit deltas;
10. tests and unresolved owner decisions; and
11. confirmation that no multi-master Sync UI or Settings-owned Plan manager was introduced.
