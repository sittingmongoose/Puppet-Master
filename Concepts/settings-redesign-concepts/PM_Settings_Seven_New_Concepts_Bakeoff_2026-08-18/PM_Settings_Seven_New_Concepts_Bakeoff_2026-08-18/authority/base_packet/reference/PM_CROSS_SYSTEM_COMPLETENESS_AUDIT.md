# Puppet Master Cross-System Completeness Audit — Pending Integration

**Date:** 2026-08-07  
**Status:** Research and handoff only. No PMConcept7, Plans, command catalog, wiring matrix, DRY rules, settings inventory, packet, or prompt was modified.

## 1. Scope and source basis

This audit rechecked the current `plans(2).zip` corpus rather than treating the previous Settings packet as proof of system completeness. The review indexed:

- 73 top-level Markdown Plan documents;
- 825 Settings inventory rows across 12 current categories;
- 701 distinct `cmd.*` tokens in `Commands_System.md` and `UI_Command_Catalog.md`;
- 643 production wiring entries in `Wiring_Matrix.production.json`;
- the current PMConcept7 concept snapshot and its generated/source-pipeline notes.

The goal was to answer two different questions for each system:

1. Is its **Settings representation** adequate?
2. Is the **underlying non-Settings system** complete enough in ownership, state, commands, wiring, events/storage, recovery, permissions, and tests?

Those are not equivalent. Several systems have strong runtime plans but weak Settings surfaces; others are missing runtime contracts as well.

## 2. Activity Bar and side-panel correction

### What the Activity Bar is

The Activity Bar is the narrow vertical shell rail that selects the current operational side-panel occupant. It is not the side panel itself and it is not a Settings navigation control.

Current canonical occupants are the closed `cmd.panel.switch` `panel_id` vocabulary:

```text
search
chat
files
source_control
github_actions
docker_manager
testing
agents
artifacts
run_debug
```

Dashboard/Home is a primary-content destination, not another side-panel identity.

The Activity Bar supports icon reorder, hiding into the More tray, restoration, and Ctrl+number assignment based on current visible order. The side-panel slot shows one occupant at a time and can be undocked/redocked where supported.

### Current placement canon

`FinalGUISpec.md` PlanUnit **F3-481 — Left-Hand Rail Placement Canon** is explicit:

- Activity Bar and single side-panel slot mount on the **left** shell edge.
- Previous right-hand language is superseded lineage, not current authority.
- The panel width envelope is 240 px minimum, 280 px default, and 480 px maximum where the viewport permits.
- `cmd.panel.switch`, `cmd.panel.undock`, and `cmd.panel.redock` are the canonical shell command family.

### Remaining documentation defect

The current Plans archive still contains older prose and wiring-location strings that call this a right-hand side panel. F3-481 overrides them, but the stale text remains easy for agents to rediscover. This is not merely a visual typo: it can cause future concepts, wiring rows, help copy, and tests to target the wrong shell geometry.

Required later repair:

- rewrite stale right-hand canonical prose rather than relying only on a late supersession PlanUnit;
- update `Wiring_Matrix.md` and production `ui_location` labels as rows are regenerated;
- keep historical right-hand wording only in explicit compatibility/source-lineage notes;
- consume the newest PMConcept7 Home Page Update handoff before any packet is regenerated.

## 3. Packet and prompt process correction

Only these earlier packets were actually used:

- original Usage work;
- original Settings bakeoff;
- Assistant Chat update Revision 2.

The later cumulative packets and split Plan/Build prompts were not used and are now draft research inputs only.

Future deliverables must use **one prompt per topic**. A topic prompt may instruct the agent to:

1. inspect sources and formulate its plan;
2. wait for the platform’s plan acceptance;
3. after acceptance, execute, test, repair, and self-audit under the same original instruction.

Do not issue a second “build” prompt after the plan has been created. Separate later prompts are reserved only for genuinely separate topics, such as a selected-concept independent audit.

## 4. Completeness summary

| System | Non-Settings completeness | Settings/GUI completeness | Main remaining defect |
|---|---|---|---|
| Activity Bar / side panel | Strong, with stale placement text | Strong shell concept | Right-hand remnants conflict with F3-481 left-hand canon |
| Notifications & Sounds | Strong command/storage foundation | Missing mandatory manager proof | Sound library, destinations, PeonPing/OpenPeon import, routing, tests not required by bakeoff |
| Appearance / themes | Theme engine and PlanUnits strong | Manager/action flow partial | Custom theme lifecycle commands and wiring incomplete |
| Desktop behavior | Scattered but substantial | Weak | Tray, close/quit, restore, startup, panel behavior not one coherent manager |
| Settings lifecycle | Partial | Weak | Import/export/reset/migration transaction not fully owned or wired |
| Permissions / FileSafe | Very strong runtime | Manager under-demonstrated | Scope/inheritance/effective policy editor must be mandatory |
| Commands / shortcuts | Strong command runtime | Manager under-demonstrated | Custom-command and keybinding management actions lack closed command/wiring families |
| Binary/system installation lifecycle | Discovery owner exists; lifecycle not canonical | Weak and too technical | Shared proof-based detect/install/auth/update/repair/rollback system needed |
| Storage / retention / recovery | Very strong backend | Manager missing | Legal holds, quarantine, pressure, recovery, migration need coherent UI |
| File Manager / editor | Strong | Settings integration partial | Mostly presentation/inventory integration, not a core runtime gap |
| Formatters | Moderate owner spec | Weak | No complete command/wiring and health/test lifecycle |
| LSP | Strong | Manager optional and shallow | OMP-derived edit/diagnostic transaction and manager proof still needed |
| Source Control / worktrees | Strong | Strong panel, Settings fragmented | Shared installation/update family and stale provider boundaries |
| GitHub Actions | Strong | Strong panel, settings partial | Keep separate from local SCM and coordinate provider/update ownership |
| Docker / Podman / Kubernetes | Broad and detailed runtime plan | Manager lifecycle fragmented | Must use shared CLI/system detect/login/update lifecycle |
| Web search/fetch/crawl | Strong runtime contracts | Setup/manager partial | Search-provider onboarding and progressive provider health/setup |
| Project search index | Partial | Weak | Dedicated index service, states, recovery, commands, and progress incomplete |
| Testing / Debug | Strong plans and command families | Settings manager not mandatory | Shared capability/session manager and resource ownership integration |
| Chat history / sessions | Strong Chat behavior | Retention and administration weak | History policy, archival, deletion, export, rebuild manager |
| Runtime artifacts / outputs | Strong owners and schemas | Administration weak | Retention/version/export/cleanup actions and manager coverage |
| Workspace cleanup | Under-specified | Missing | Safe dry-run plan, commands, receipts, recovery, GUI all incomplete |
| Skills / Plugins / Tools / MCP | Strong narrative owners | Manager/runtime command integration incomplete | Installation/lifecycle commands, production wiring, trust/provenance management |
| Media | Strong capability/routing owner | Manager optional | Command/wiring, provider setup, requested/effective route management |
| Teacher / help | GUI intent exists | Under-specified | Help-entry registry, guided overlays, commands, wiring, tests |
| DRY Method | Strong governance owner | Small Settings surface exists | Exact visible state vocabulary and manager integration need proof |
| Accessibility / input / spellcheck | Accessibility broad; spellcheck absent | Partial | Shared local spell service and dictionary manager are new work |
| App/content updates | Release supply chain strong | Deferred | Project Syncing and Updates owns GUI and lifecycle integration |
| Onboarding | Existing F3-411 is detailed but will be redesigned | Deferred | New thread owns flow and popup; current plan is input, not final freeze |
| Doctor | Existing compact Health concept is stale/incomplete | Deferred | Must absorb handoffs from all active system threads |

## 5. System-by-system required deltas

### 5.1 Notifications & Sounds

**Current strengths**

The Plans already define a substantial manager under `Settings → General → Notifications & Sounds`, including destinations, event routing, sound mappings, uploaded sounds, preview, test-send, provenance/licensing, and PeonPing/OpenPeon-compatible pack import. Existing command families include destination CRUD/test/toggle, mapping updates, overrides, sound upload/import/preview/mapping, and sound asset delete/export/restore. Most concrete commands already have production wiring rows.

**Missing or weak**

- The current Settings bakeoff can pass without demonstrating this manager.
- Pack compatibility, license verification, deduplication, hashing, and partial-import repair need one lifecycle owner.
- Destination adapter schemas need normalized health, secret-reference, rate-limit, retry, test receipt, and masked-failure behavior.
- Local preview and external test-send must remain separate operations.
- Title-bar notification stack and inbox sprout are the only in-app notification affordances; do not revive a Notifications side panel or bottom-right toast center.

**Required DRY primitives**

```text
NotificationDestinationCard
NotificationEventRouteRow
SoundAssetRow
SoundPackImportReview
NotificationTestReceipt
QuietHoursPolicyRow
VisibleNonAudioState
```

**Required command/wiring closure**

Preserve existing `cmd.notifications.*`, `cmd.sound.*`, `cmd.settings.open_notifications`, and `cmd.alert.*`. Verify every leaf has typed payload/result/error, projected availability, disabled reason, permission gate, receipt/event effect, accessibility proof, and regression fixture.

**Non-Settings status:** mostly complete, but importer/destination lifecycle and end-to-end tests need consolidation.

### 5.2 Appearance and themes

**Current strengths**

The Plans define eight built-in variants, Light/Dark/Auto, OS appearance following, custom TOML themes, inheritance, validation, safe fallback, startup load, live reload, custom fonts, UI scale, reduced motion, and theme-specific unavailable states.

**Missing or weak**

The current command family covers mode, accent, density, preview, and reset, but not the complete visible file lifecycle already promised by FinalGUI.

**Required commands to close or explicitly map**

```text
cmd.theme.set_family
cmd.theme.open_folder
cmd.theme.create
cmd.theme.import
cmd.theme.export
cmd.theme.reload
cmd.theme.validate
cmd.theme.select_font
```

These are proposed closure IDs; the command owner must reconcile names before canon. File-picker/open-folder wrappers may normalize to shared system/file commands rather than duplicate handlers.

**Required DRY primitives**

```text
ThemeFamilyPicker
ThemeVariantPreview
ThemeFileRow
ThemeValidationIssue
LivePreviewTransaction
FontFallbackEditor
ThemeSpecificSettingLock
```

**Non-Settings status:** theme runtime is strong; command/wiring and manager transaction coverage are incomplete.

### 5.3 General desktop behavior

The Plans contain tray behavior, close-to-tray versus quit, restoration, crash recovery, panel restoration, Activity Bar order, editor-tab caps, and launch behavior, but they are scattered across FinalGUI, storage, and individual settings rows.

Required later owner closure:

- one `DesktopBehaviorPolicy` projection;
- clear global versus project scope;
- deterministic startup precedence;
- crash recovery versus ordinary restore distinction;
- tray actions and status under explicit commands;
- no hidden behavior change caused by a Settings import.

Candidate command families needing owner adjudication:

```text
cmd.app.show
cmd.app.hide
cmd.app.quit
cmd.app.restart
cmd.window.restore_layout
cmd.window.reset_layout
cmd.workspace.restore
cmd.workspace.discard_restore
```

**Non-Settings status:** partial. The behaviors exist, but the service and transaction boundary are not closed.

### 5.4 Settings lifecycle: import, export, reset, migration

This is a genuine runtime gap, not only a missing screen.

Required model:

```text
SettingsExportBundle
SettingsImportPreview
SettingsImportConflict
SettingsMigrationPlan
SettingsSnapshot
SettingsApplyReceipt
SettingsRollbackReceipt
```

Required behavior:

- validate before mutation;
- show source version and scopes;
- choose merge versus replace;
- preview conflicts and managed/read-only values;
- never import secrets as ordinary strings;
- snapshot before apply;
- apply atomically where possible;
- report restart/reconnect requirements;
- roll back on failed validation;
- preserve legacy-name migration evidence.

Candidate command family:

```text
cmd.settings.export
cmd.settings.import.preview
cmd.settings.import.apply
cmd.settings.reset
cmd.settings.rollback
cmd.settings.open_config
```

**Non-Settings status:** incomplete.

### 5.5 Permissions and FileSafe

The safety backend is one of the strongest Plan areas. The missing work is primarily a coherent user surface and updated terminology.

Required Settings manager proof:

- global default and per-tool overrides;
- ordered granular rules and last-match-wins explanation;
- Global, Project, Package, Seam, Lane, Goal, thread, and one-turn scope where relevant;
- requested versus effective policy;
- inheritance and source;
- external-directory allowlist;
- Persona requests shown as requests, never authority;
- Full Access naming without weakening FileSafe;
- Plan/Review read/research/test capabilities shown separately from mutation authority;
- ELI5 and Expert views backed by one canonical rule model.

Existing `cmd.permissions.*` leaves are already largely production-wired. The packet should require their UI proof rather than invent a second permission editor.

**Non-Settings status:** strong.

### 5.6 Commands and keyboard shortcuts

`Commands_System.md` is substantial, but the administration surface lacks a fully closed action family.

Required management operations:

```text
User command create/edit/delete/duplicate/enable/disable
Global versus Project override
Dry-run preview with sample arguments
Validation and include resolution
Keyboard binding create/edit/remove/reset
Conflict inspection and resolution
Import/export and cheat-sheet export
```

Candidate command namespaces:

```text
cmd.user_command.*
cmd.keybinding.*
```

The owner may select different final names. Every manager mutation must use the same command path as natural-language or command-palette changes.

**Non-Settings status:** command execution is strong; administration lifecycle is partial.

### 5.7 Shared executable, service, authentication, and update lifecycle

`BinaryLocator_Spec.md` should remain discovery-only. A separate shared lifecycle must serve provider CLIs, source-control tools, Docker/Podman/Kubernetes tools, and other host integrations.

Internal identity may remain rich:

```text
ToolProduct
Installation
LauncherOrShim
RuntimeService
AuthenticationProfile
Connection
CapabilitySnapshot
UpdateTransaction
```

Normal GUI must collapse these into one human card:

```text
Codex CLI
Installed on This Mac · Version 0.x · Signed in as Personal
Update available
```

Expandable details may show configured command, resolved launcher, actual executable, package manager, host, profile root, and discovery evidence. Do not show those as separate primary identities.

Required shared command family, pending owner naming:

```text
cmd.installation.rescan
cmd.installation.select
cmd.installation.install
cmd.installation.update
cmd.installation.repair
cmd.installation.rollback
cmd.installation.verify
cmd.installation.open_logs
cmd.auth_profile.sign_in
cmd.auth_profile.sign_out
cmd.auth_profile.verify
```

Key rules:

- proof-based installation ownership;
- unknown owner is manual-only;
- exact host and installation binding;
- CLI-owned OAuth remains CLI-owned;
- transactional update with idle drain, verification, and rollback;
- no duplicate per-account updates for a shared installation;
- no raw secret copying during discovery;
- RuntimeResourceGovernor and ObservableWork integration.

**Non-Settings status:** major shared subsystem still needs canonical ownership.

### 5.8 Storage, retention, recovery, legal hold, and quarantine

Backend coverage is strong. The missing piece is a dedicated manager that presents:

```text
Storage health and mode
Current root and relocation
Retention policies
Legal holds
Quarantine
Compaction
Pressure and cleanup
Recovery snapshots
Project removal versus data deletion
Chat/history retention
Migration and compatibility
Advanced diagnostics
```

Existing `cmd.storage.*`, `cmd.project.remove`, and `cmd.project.delete_data` must remain canonical. The GUI must not invent alternative deletion semantics.

Required DRY primitives:

```text
StorageHealthSummary
RetentionPolicyRow
LegalHoldRow
QuarantineItemRow
RecoverySnapshotRow
DestructiveDataPreview
StorageMigrationProgress
```

**Non-Settings status:** strong.

### 5.9 File Manager and editor

The non-Settings plan is detailed and generally strong: tree behavior, open-file routing, changed-on-disk state, large-file handling, drag/drop, tabs, recovery, and command wiring are broadly present.

Remaining Settings work is to organize existing preferences under a coherent Files & Editor area and ensure defaults/effective/inherited states are explicit. Do not create another File Manager manager inside Settings.

**Non-Settings status:** strong.

### 5.10 Formatters

The formatter owner defines built-in/custom formatters and settings, but the system has no comparable closed command and production-wiring family.

Required lifecycle:

```text
Detected
Ready
Not found
Disabled
Misconfigured
Timed out
Failed verification
```

Candidate commands:

```text
cmd.formatter.detect
cmd.formatter.add
cmd.formatter.update
cmd.formatter.remove
cmd.formatter.reset
cmd.formatter.test
cmd.formatter.format_document
cmd.formatter.format_selection
```

Reconcile direct formatter commands with `cmd.lsp.format_document` and `cmd.lsp.format_selection`; the dispatcher must choose the configured effective formatting route rather than run both.

**Non-Settings status:** incomplete command/wiring and runtime-health closure.

### 5.11 LSP

The LSP owner is extensive, and core commands such as definition, references, rename, code action, Problems, restart, and formatting already exist.

Remaining work:

- make the registry/manager a required concept proof;
- incorporate version-aware edit transactions and fresh-diagnostic guarantees;
- separate requested/effective server attachment;
- show host attachment and remote degradation;
- integrate installation lifecycle for language servers without flattening every server binary into the normal GUI;
- verify all leaf commands have production wiring.

**Non-Settings status:** strong with integration deltas.

### 5.12 Source Control, worktrees, and GitHub Actions

Core Source Control/worktree plans and command families are strong. The critical boundaries are:

- Source Control and GitHub Actions remain separate left-rail panels;
- local Git uses the selected Git installation;
- GitHub hosting operations remain API-owned where current canon requires it, not automatically routed through `gh`;
- worktree creation/removal is mediated by the Worktree Manager;
- update/install behavior for Git and any future SCM tools uses the shared installation lifecycle;
- source-control-specific Update families belong to the Egolite & Git Updates owner, not Settings or Project Sync;
- app/content updates belong to Project Syncing and Updates.

**Non-Settings status:** strong, with ownership/update integration work.

### 5.13 Docker, Podman, and Kubernetes

The container owner is broad and detailed. The major missing integration is the shared lifecycle.

Normal GUI should group components rather than show every binary identity:

```text
Docker
  Engine/Desktop, Compose, Buildx, current context
Podman
  CLI, machine/service, Compose compatibility
Kubernetes tools
  kubectl, Helm, selected contexts and authentication
```

The same detection/install/auth/update transaction used for provider CLIs should support:

- Docker Desktop/Engine service detection;
- Docker and Compose/Buildx capability discovery;
- Podman CLI and machine/service state;
- kubectl and Helm installation ownership;
- kubeconfig/context and registry authentication;
- exact host attachment;
- update, verify, repair, rollback, and logs.

Docker Manager remains the left-rail operational owner. Settings owns lifecycle/defaults; it does not duplicate container operations.

**Non-Settings status:** strong container operations; shared installation/auth/update integration incomplete.

### 5.14 Web search, fetch, crawl, and browser routes

Tool contracts are strong. Setup and administration should use the provider connection manager and future onboarding flow.

Required manager behavior:

- Automatic route plus ordered ready providers;
- per-capability support for search, fetch, crawl, map, and extract;
- explicit privacy/cost/credit state;
- credentials and exact setup destination;
- provider ready versus usage telemetry unavailable;
- air-gap, proxy, certificate, and browser fallback state;
- no raw API key fields in ordinary rows.

Runtime `cmd.web.*` and Chat web commands remain distinct from setup commands.

**Non-Settings status:** strong.

### 5.15 Project search index

This is under-specified beyond Settings.

Required owner contract:

```text
Index identity and project scope
Local/remote index location
Enabled/disabled/building/ready/stale/failed
File count and disk use
Exclusions and max file size
Ignored/hidden/symlink policy
Remote cache policy
Progress and cancellation
Rebuild/clear/repair
Version and compatibility
```

`cmd.search.rebuild_index` and `cmd.search.evict_remote_cache` exist. Candidate closure commands:

```text
cmd.search.clear_index
cmd.search.pause_index
cmd.search.resume_index
cmd.search.repair_index
cmd.search.open_index_details
```

**Non-Settings status:** incomplete.

### 5.16 Testing and Debug

Automated Testing and Run & Debug/DAP command families are already extensive. Remaining work is cross-system:

- one capability/session manager across browser, desktop, simulator, emulator, device, API, DB, network, performance, and security testing;
- RuntimeResourceGovernor owns resource admission;
- session ownership, port leases, recordings, evidence, and background continuation are explicit;
- Settings shows Global/Project Auto/On/Off by capability;
- Debug and Testing remain separate operational surfaces while sharing resource/session infrastructure;
- OMP-derived DAP ordering and durable session mechanics should be reconciled in the runtime owner.

**Non-Settings status:** strong.

### 5.17 Chat history and sessions

Assistant Chat has rich history, search, rewind, restore points, branches, and full durable transcript behavior. Settings should own only policy and administration:

```text
Retention
Auto-archive
Deleted-chat window
Export
Rebuild search/index
Approved-only filters where applicable
All-project versus project scope
```

Do not make history policy changes in one thread mutate other thread runtime choices.

**Non-Settings status:** strong Chat behavior; administration surface partial.

### 5.18 Runtime artifacts and project outputs

The owner docs and schemas are strong. Missing administration commands and Settings coverage include:

```text
Open/reveal
Export
Compare versions
Restore version where valid
Retain/pin
Delete/clean up
Open provenance and source
Inspect redaction
```

Existing `cmd.artifacts.*` handles navigation and recording. The owner should determine whether new mutations belong under `cmd.artifact.*` or another canonical family.

**Non-Settings status:** strong data model; administration lifecycle partial.

### 5.19 Workspace cleanup

This area is incomplete both inside and outside Settings.

Required model:

```text
CleanupScan
CleanupCandidate
CleanupPlan
BlockedCleanupItem
CleanupReceipt
RecoveryReference
```

Required behavior:

- dry-run before mutation;
- categories for build output, cache, generated files, stale artifacts, logs, and eligible worktrees;
- exclusion rules;
- active-run/worktree/lease protection;
- FileSafe and permissions;
- exact freed-space estimate with confidence;
- cancellation and partial-result receipt;
- no deletion of evidence, safe points, or retained artifacts.

Candidate command family:

```text
cmd.cleanup.scan
cmd.cleanup.preview
cmd.cleanup.apply
cmd.cleanup.cancel
cmd.cleanup.exclude
cmd.cleanup.open_receipt
```

**Non-Settings status:** incomplete.

### 5.20 Skills, Plugins, Tools, and MCP

The owner docs are detailed, but command-catalog and production-wiring closure is much weaker than the provider and Source Control systems.

Required lifecycle families:

```text
Skill: discover/import/install/update/enable/disable/remove/validate/open source/review requirements
Plugin: install/update/enable/disable/reload/remove/inspect compatibility/open logs
Tool: enable/disable/configure/test/review permission/open provenance
MCP server: add/edit/remove/connect/reconnect/authenticate/disable/refresh catalog/test/open logs
```

The exact command IDs should be owner-adjudicated; do not let each manager invent private mutation handlers.

Required DRY primitives:

```text
ExtensionResourceRow
TrustAndProvenanceBlock
CompatibilityStatus
PermissionRequirementBlock
DependencySetupFlow
HealthAndLogsDrawer
UpdateAndRollbackState
```

**Non-Settings status:** owner narratives strong; runtime command/wiring and manager lifecycle incomplete.

### 5.21 Media

Media capabilities and routing are well documented, including modality support, requested/effective routes, alternate providers, redaction, outputs, and retention.

Remaining work:

- dedicated Media Provider manager proof;
- setup/health through shared provider lifecycle;
- command and production wiring for provider test, generation, cancellation, output open/reveal, and route override;
- Usage attribution for helper routes;
- privacy/cost confirmation for alternate providers.

**Non-Settings status:** strong capability model, partial command/wiring.

### 5.22 Teacher and contextual help

`F3-403` establishes intent but not a complete system.

Required owner model:

```text
HelpEntry registry
ContextHelpAnchor
GuidedOverlaySession
TeacherExplanationRequest
HelpSearchIndex
```

Candidate commands:

```text
cmd.help.open
cmd.help.search
cmd.help.explain_current_screen
cmd.help.start_tour
cmd.help.stop_tour
cmd.help.open_teacher_thread
```

Help must use current route/object context without injecting the whole screen or product manual into the model prompt.

**Non-Settings status:** incomplete.

### 5.23 DRY Method

The governance owner is strong, and `cmd.settings.agent_rules.dry_method_default_guard.set` already has production wiring.

The visible system still needs exact state grammar:

```text
Applied
Degraded
Disabled
Missing owner
Stale reference
Owner resolved
Mutation blocked
```

The Settings surface should explain effective owner/consumer routing and link to evidence without exposing the full DRY corpus as editable prose.

**Non-Settings status:** strong.

### 5.24 Accessibility, input, and spellcheck

Accessibility is broadly represented, but spellcheck is new.

Required shared local spell service:

```text
Automatic source: OS service, falling back to PM local dictionaries
System-only source
PM-local-only source
Automatic language or explicit language
Personal dictionary
Project dictionary
Thread-level disable
```

Behavior:

- passive underline;
- context-menu suggestions;
- replace once, ignore once, ignore draft, add to dictionary;
- no auto replacement;
- no permanent Chat toolbar button;
- skip code, paths, URLs, commands, hashes, identifiers, structured data, and known PM names;
- ordinary spellcheck creates no provider usage;
- grammar/style is a separate opt-in route.

Candidate command family:

```text
cmd.spelling.add_personal_word
cmd.spelling.add_project_word
cmd.spelling.remove_word
cmd.spelling.import_dictionary
cmd.spelling.export_dictionary
cmd.spelling.set_thread_enabled
```

**Non-Settings status:** new incomplete feature.

### 5.25 App and content updates

Release and supply-chain Plans are substantial, but the Settings/runtime integration belongs to **Project Syncing and Updates**.

Keep these distinct from provider/tool installation updates:

```text
Puppet Master application updates
PM content/catalog updates
Provider and tool installation updates
Source-control provider/tool updates
```

The Settings redesign should reserve a common manager grammar only. Project Syncing and Updates owns app/content behavior, channels, download, verification, migration, rollback, host targeting, and future GUI module.

### 5.26 Onboarding and Doctor

Both are deferred from this packet cycle.

- The new Onboarding thread owns the first-run popup/flow and must receive the provider setup and Settings framework handoff.
- Doctor will be updated only after current handoffs from provider, sync, performance, source-control, testing, FileSafe, storage, and other threads arrive.
- Existing F3-411 is a useful baseline, not a final freeze.

## 6. Settings inventory schema corrections

The 825-row inventory cannot remain the final runtime shape.

Required record kinds:

```text
persistent_value
manager_destination
one_shot_action
read_only_projection
diagnostic
setup_workflow
```

Required exposure states:

```text
Standard
Advanced
Expert/Risky
Managed/Read-only
Diagnostic
Unavailable
```

Required scopes beyond the current schema:

```text
turn
thread
Goal
PlanningRun
Crew
host
environment
installation
device
worktree/workspace
```

Required secret/auth distinctions:

```text
secret entry
vault/reference selector
CLI-owned authentication
PM-owned OAuth
environment-backed secret
command-helper/vault-backed secret
non-secret text
```

Empty strings must not ambiguously mean Auto, Inherit, Not configured, Disabled, or literal empty.

## 7. DRY component families the redesign should eventually register

The later packet should include a component/contract manifest rather than only prose. At minimum:

```text
SettingsHomeDestination
SettingsNoticeCard
SettingsWorkspaceShell
CategoryAndSubcategoryNavigator
SettingValueRow
DefaultEffectiveInheritedBadge
ManagerShell
ResourceListRow
ResourceDetailPanel
HealthAndFreshnessBlock
RequestedEffectiveBlock
SetupAndRepairFlow
InstallationLifecycleCard
AuthenticationProfileRow
UpdateTransactionProgress
ImportPreviewAndConflictReview
DestructiveActionPreview
SecretReferenceControl
ProvenanceAndTrustBlock
LogsAndDiagnosticsDrawer
ObservableWorkProgress
```

System-specific managers extend these primitives instead of inventing unrelated visual and command grammar.

## 8. Command and wiring closure rule

For every interactive control that causes navigation, mutation, setup, test-send, import/export, install/update, repair, rollback, or cleanup:

1. reuse or register one canonical command ID;
2. define typed payload, result, and error contracts;
3. define projected availability and disabled reason;
4. define permission/FileSafe policy;
5. define persisted event or explicit no-persist receipt;
6. define focus/keyboard/accessibility behavior;
7. define idempotency and stale-revision behavior where relevant;
8. add production wiring evidence and regression tests;
9. use the same command path from GUI, natural language, command palette, and automation when the operation is equivalent.

Do not count a Plan command token as wired merely because it appears in prose.

## 9. Manager coverage gate for the future Settings bakeoff

The old gate—Provider Manager plus two optional managers—is too weak.

A revised bakeoff should use a coverage manifest that distributes deep manager proofs across the four concepts while requiring every concept to show the shared Settings Home/workspace grammar.

Across each agent’s four concepts, the bakeoff must collectively demonstrate:

```text
Providers / Accounts / Models / Installations
Permissions / FileSafe
Memory / Personas / Crew / Context
Notifications & Sounds
Appearance
Storage / Retention / Recovery
Commands / Shortcuts
Tools / Skills / Plugins / MCP
LSP / Formatters / Testing / Debug
Source Control / Worktrees / GitHub Actions
Docker / Podman / Kubernetes / Registries
Media
Settings import/export/reset/migration
```

Project Sync, app/content updates, Onboarding, and Doctor remain named deferred modules with explicit insertion contracts rather than being guessed by the concept agents.

## 10. Pending integration sequence

1. Receive fresh handoffs from Project Syncing and Updates, Egolite & Git Updates, Optimization in Puppet Master, and the other active threads.
2. Reconcile owner boundaries and stale Plan wording.
3. Produce a manager coverage manifest and command/wiring/DRY delta register.
4. Regenerate each topic packet with exactly one prompt.
5. Do not rerun or apply the unused cumulative packets.
6. After a winning Settings concept is selected and refined, generate a fresh independent selected-concept audit packet; do not reuse the older one unchanged.
