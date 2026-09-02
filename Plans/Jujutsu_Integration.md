# Jujutsu Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes the neutral source-control contract in `Plans/Source_Control_System.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Jujutsu-native change, commit, operation, workspace, bookmark, snapshot, conflict, undo, operation-restore, Git interop, and colocated mutation-authority semantics.

## 0. Scope

Jujutsu is a first-class local source-control backend, exactly `scm_backend=jujutsu`. It is not a Git command skin, a forge, an Origin mode, a branch alias, or a compatibility-only feature. Every JJ operation preserves change ID, immutable commit ID, operation ID, workspace ID, bookmarks, expected operation/revision, writer lease, topology identity, Permissions decision, FileSafe decision, and idempotency.

JJ workspaces are not Git worktrees. JJ bookmarks are not Git branches. `jj undo` and `jj op restore` are backend-native recovery mechanisms; FileSafe safe points complement them but do not replace, replay, or silently override them. In a colocated repository with an active `.jj` store, Jujutsu is the sole mutation authority by default. Git reads may coexist; Git mutation requires an explicit compatibility preflight and exact pre/post JJ operation IDs. In the Jujutsu 0.44.0 colocated profile, `jj git import` and `jj git export` requested capability remains typed but effective capability is false by default because upstream disables those commands for a race condition. There is no implicit reconciliation or fallback Git mutation; only an exact certified adapter gate plus exact live probe can admit either capability.

ContractRef: ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md, SchemaID:pm.source_control.repository_context.v1

## 1. Ownership And Consumers

### 1.1 Owned here

- JJ change, immutable commit, operation, workspace, bookmark, snapshot, and conflict identities;
- JJ command behavior and results behind the neutral command boundary;
- workspace create/open/switch/remove and backend-native move/resume checkpoints;
- change new/describe/edit/split/squash/rebase/abandon/restore;
- bookmark create/move/rename/delete/track/untrack;
- operation log/show/undo/restore;
- `jj git` clone/fetch/push/import/export semantics;
- colocated Git/JJ mutation authority, compatibility preflight, and operation fencing;
- JJ setup/certification projections, adaptive UI sections, recovery, and migration; and
- `cmd.jj.*` compatibility normalization.

### 1.2 Retained owners and consumers

`Plans/Source_Control_System.md` owns common repository context, writer/credential leases, neutral commands, setup grammar, Source Control placement, and Settings manager routing. `Plans/WorktreeGitImprovement.md` owns Git worktrees and Git mutation semantics. `Plans/Shared_Integration_Runtime.md` owns installation lifecycle and `ObservableWork`. Permissions and FileSafe remain independent owners. Forge owners consume only published JJ/Git transport and immutable revision identities; they do not control local mutation authority.

`Plans/Backup_Restore_System.md` owns backup repositories/bytes, manifests, RestoreRun, browse/delivery, staging, activation, rollback, RecoverySet custody, and restore readiness. This owner supplies JJ operation/object/workspace closure, capture-barrier and GC-fence truth, isolated restore verification, sanitized activation disposition, and native conflict/collision receipts. It does not create JJ-private Backup commands or handlers.

Source Control, Settings, Assistant Chat, Orchestrator, Executor, File Manager, LSP, Runtime Artifacts, Onboarding, and Doctor consume JJ state by ContractRef. None may translate a bookmark into a branch, infer workspace identity from a path, issue direct `jj` subprocesses outside the adapter, or mutate Git directly in a colocated JJ repository.

ContractRef: ContractName:Plans/Source_Control_System.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Shared_Integration_Runtime.md

## 2. Canonical PlanUnits

### JJI-001 - Jujutsu Native Owner Boundary

```yaml
plan_unit_id: JJI-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  Plans/Jujutsu_Integration.md is the sole owner for Jujutsu-native change, immutable commit, operation,
  workspace, bookmark, snapshot, conflict, undo, op restore, Git interop and colocated mutation-authority
  semantics. Neutral source-control context and leases remain owned by Plans/Source_Control_System.md.
gui_related: true
gui_classification_reason: The boundary determines JJ-specific visible sections and actions in Source Control.
depends_on: [SCS-001, PDS-003]
unblocks: [JJI-002, JJI-003, JJI-004, JJI-005, JJI-006]
acceptance_criteria:
  - JJ-native identities remain distinct from Git fields and forge identities.
  - No consumer duplicates JJ command or colocation semantics.
  - Jujutsu is addressable as scm_backend=jujutsu through the neutral facade.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json]
risk_class: jujutsu_as_git_alias_or_parallel_owner
reasoning_tier: high
context_scope: jujutsu_owner
implementation_surfaces: [Plans/Jujutsu_Integration.md, future JJ adapter]
node_compile_hint: {mode: jujutsu_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-02, source_ref:egolite-register:TS-03]
preserved_exact_tokens: [scm_backend=jujutsu, change ID, immutable commit ID, operation ID, workspace ID, bookmarks]
negative_constraints: [Do not make Jujutsu a Git command skin., Do not make Jujutsu a forge., Do not alias bookmarks to branches.]
owner_hints: [Plans/Jujutsu_Integration.md, Plans/Source_Control_System.md]
```

### JJI-002 - Native Revision, Workspace, Bookmark, And Snapshot Semantics

```yaml
plan_unit_id: JJI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  A JJ revision fence carries change_id, immutable commit_id, operation_id, workspace_id and bookmarks.
  Workspace status is derived from an exact JJ snapshot and operation, never from path/focus or a Git index.
  Change identity may survive rewritten commits, while immutable commit identity and operation identity fence
  evidence, mutation, retry, move, resume and recovery.
gui_related: false
gui_classification_reason: This unit defines backend-native identity and revision semantics.
depends_on: [JJI-001, SCS-002]
unblocks: [JJI-003, JJI-004, JJI-005]
acceptance_criteria:
  - Every JJ mutation compares the expected operation and immutable commit identity.
  - Snapshot and workspace identity cannot be synthesized from a filesystem path.
  - Move/resume checkpoints carry the exact operation and workspace reconstruction evidence.
validation_surfaces: [JJ repository context fixtures, stale operation tests, move and resume fixtures]
risk_class: jj_revision_or_workspace_aliasing
reasoning_tier: high
context_scope: jujutsu_native_identity
implementation_surfaces: [Plans/source_control_contracts.schema.json, future JJ adapter]
node_compile_hint: {mode: jujutsu_native_revision_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-001..003, source_ref:egolite-register:SCM-006..007]
preserved_exact_tokens: [change_id, commit_id, operation_id, workspace_id, bookmarks, snapshot]
negative_constraints: [Do not use a Git index as JJ state., Do not call a mutable change ID an immutable revision., Do not infer a workspace from the focused directory.]
owner_hints: [Plans/Jujutsu_Integration.md]
```

### JJI-003 - Canonical JJ Commands And Observable Work

```yaml
plan_unit_id: JJI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  JJ actions use canonical cmd.jujutsu.* identities. Every mutation consumes RepositoryContext, expected JJ
  revision, writer lease, Permissions, FileSafe and idempotency, and emits before/after operation identities.
  Multi-step workspace, rebase, typed import/export, fetch/push and recovery actions expose ObservableWork rather
  than local timers or terminal prose. Colocated import/export dispatch additionally requires its exact effective
  capability to be true under the current certified adapter gate. The Jujutsu owner schema supplies one closed,
  discriminated request/result/error/availability family for all 31 canonical commands while reusing the neutral
  Source Control revision and context contracts by reference.
gui_related: true
gui_classification_reason: The commands map to user-visible actions, progress, disabled states, and receipts.
depends_on: [JJI-002, SCS-003]
unblocks: [JJI-004, JJI-005, JJI-006]
acceptance_criteria:
  - Each primary JJ command has one schema-valid request path and one rejected negative fixture; request/result/error/availability/disabled-reason shapes are closed without per-command object duplication.
  - Each primary JJ command still requires exactly one future native handler and explicit central registration; schema validity does not prove either.
  - cmd.jj.* aliases normalize before policy and receive no separate handler or receipt.
  - Effect-unknown or stale-operation results block automatic retry.
  - >-
    `cmd.jujutsu.git.clone` preserves a current JJ adapter/catalog fence and exact caller
    route/focus/continuation context through success or cancellation, and never normalizes to the ordinary Git clone.
  - A typed import/export command remains rejected before effect when its effective capability is false; it does not fall through to Git mutation or implicit reconciliation.
validation_surfaces: [Plans/jujutsu_integration_contracts.schema.json, Plans/jujutsu_integration_contract_fixtures.json, alias normalization tests, future ObservableWork terminal tests]
risk_class: duplicate_dispatch_or_unfenced_jj_mutation
reasoning_tier: high
context_scope: jujutsu_commands
implementation_surfaces: [Plans/jujutsu_integration_contracts.schema.json, Plans/jujutsu_integration_contract_fixtures.json, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Wiring_Matrix.production.json, future JJ adapter]
node_compile_hint: {mode: jujutsu_command_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:TS-03, source_ref:egolite-register:CT-01]
preserved_exact_tokens: [cmd.jujutsu.*, cmd.jj.*, ObservableWork, before operation ID, after operation ID]
negative_constraints: [Do not register cmd.jj.* as a primary command., Do not scrape terminal prose for state., Do not retry an unknown effect.]
owner_hints: [Plans/Jujutsu_Integration.md, Plans/Source_Control_System.md, Plans/Shared_Integration_Runtime.md]
```

### JJI-004 - Colocated Repository Mutation Authority And Git Fencing

```yaml
plan_unit_id: JJI-004
unit_type: invariant
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  When an active .jj store is verified in a colocated repository, Jujutsu is the sole mutation authority by
  default. Read-only Git inspection may remain available. Any Git mutation requires an explicit compatibility
  preflight, the same current source-control writer lease, exact pre-mutation JJ operation ID, mutation scope,
  Git expected revision, an explicit separately certified reconciliation path, exact post-mutation JJ operation ID
  and terminal receipt. `jj git import` or `jj git export` is never assumed as reconciliation. In a colocated 0.44.0
  workspace both are effective false by default; a late or unmatched Git mutation quarantines the workspace.
gui_related: true
gui_classification_reason: Colocation authority and quarantine determine visible disabled reasons and recovery actions.
depends_on: [JJI-002, JJI-003]
unblocks: [JJI-005, JJI-006]
acceptance_criteria:
  - Two mutation authorities cannot be active for one colocated workspace generation.
  - Git mutation without compatible preflight and pre/post JJ operation IDs is blocked before effect.
  - Late mutation, failed import/export, or operation mismatch enters quarantine and preserves evidence.
  - Unsupported or uncertified import/export blocks reconciliation and never triggers a fallback mutation.
validation_surfaces: [colocation writer race tests, Git compatibility preflight fixtures, late mutation quarantine tests]
risk_class: colocated_dual_writer_corruption
reasoning_tier: high
context_scope: jujutsu_git_colocation
implementation_surfaces: [future JJ and Git adapters, future LeaseCoordinator integration]
node_compile_hint: {mode: colocated_single_mutation_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-006..007]
preserved_exact_tokens: [.jj, one mutation authority, JJ by default, read-only Git, pre/post JJ operation IDs, quarantine]
negative_constraints: [Do not allow concurrent JJ and Git mutation., Do not treat Git import/export as implicit., Do not reassign a quarantined workspace.]
owner_hints: [Plans/Jujutsu_Integration.md, Plans/WorktreeGitImprovement.md, Plans/Source_Control_System.md]
```

### JJI-005 - Undo, Operation Restore, Conflicts, FileSafe, And Recovery

```yaml
plan_unit_id: JJI-005
unit_type: requirement
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  jj undo and jj op restore operate on exact operation-log identities and produce new operation receipts.
  FileSafe safe points protect exact external file effects and complement JJ recovery; they never replace the
  operation log, silently rewind JJ state, or claim recovery without post-restore snapshot and conflict proof.
  Conflicts remain typed JJ conflicts with materialized-file and backend state explicitly distinguished.
gui_related: true
gui_classification_reason: Undo, restore, conflict, quarantine, and recovery state are visible actions and statuses.
depends_on: [JJI-003, JJI-004]
unblocks: [JJI-006]
acceptance_criteria:
  - Undo and restore reject stale operation IDs and emit before/after operation identities.
  - FileSafe restore and JJ operation restore have distinct commands, decisions, and receipts.
  - Conflict resolution proves current snapshot, expected conflict identity, and terminal reconciliation.
validation_surfaces: [undo/op restore fixtures, FileSafe complement tests, conflict and restart recovery tests]
risk_class: destructive_or_false_jj_recovery
reasoning_tier: high
context_scope: jujutsu_recovery
implementation_surfaces: [future JJ adapter, Plans/FileSafe.md, future Runtime Artifacts projections]
node_compile_hint: {mode: jujutsu_recovery_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-02]
preserved_exact_tokens: [jj undo, jj op restore, FileSafe safe points, operation log, conflict]
negative_constraints: [Do not let FileSafe replace JJ undo., Do not restore by newest-operation heuristic., Do not call a materialized file clean while JJ conflict state remains.]
owner_hints: [Plans/Jujutsu_Integration.md, Plans/FileSafe.md]
```

### JJI-006 - JJ Setup, GUI Projection, Compatibility, And Migration

```yaml
plan_unit_id: JJI-006
unit_type: validation
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  JJ setup is exact-Host/Environment and independently reports installation, owner, version, adapter,
  authentication, repository eligibility and mutation certification. Source Control uses Bookmarks and
  Operation Log and removes Git-only staging and stash. A verified .jj workspace migrates to Jujutsu authority;
  ambiguous or unsupported colocation remains blocked with a typed reason and recovery actions. Setup reports
  requested and effective import/export capabilities separately; Jujutsu 0.44.0 colocated import/export defaults
  effective false unless the exact adapter and live environment have current certification evidence.
gui_related: true
gui_classification_reason: This unit controls JJ setup rows, visible sections, labels, compatibility limits, and migration status.
depends_on: [JJI-004, JJI-005, SCS-004, SCS-005]
unblocks: []
acceptance_criteria:
  - JJ sections use Bookmarks and Operation Log, never Branches or Stash aliases.
  - Setup and migration preserve exact Host/Environment and current catalog evidence.
  - Unsupported object formats, versions, helpers, or colocation states degrade reads and fail mutations closed.
  - A disabled colocated import/export capability remains visible with the upstream-race reason and no fallback action.
validation_surfaces: [JJ setup fixtures, adaptive GUI fixtures, colocation migration fixtures, compatibility matrix]
risk_class: jujutsu_ui_or_migration_misrepresentation
reasoning_tier: high
context_scope: jujutsu_setup_gui_migration
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, future Source Control UI]
node_compile_hint: {mode: jujutsu_setup_gui_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-003, source_ref:egolite-register:UI-01]
preserved_exact_tokens: [Install Jujutsu, Use Jujutsu here, Bookmarks, Operation Log, Ready with limits, Needs attention]
negative_constraints: [Do not install or mutate silently., Do not show Git-only staging or stash., Do not promote Preview certification without current evidence.]
owner_hints: [Plans/Jujutsu_Integration.md, Plans/Source_Control_System.md, Plans/Settings_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/jujutsu_integration_contracts.schema.json` owns the Jujutsu-specific discriminated command request, result, error, availability, disabled-reason, exact-target, currentness, exact caller-return, confirmation, affected-identity, and import/export admission shapes. It references the `jujutsu_revision` definition in `Plans/source_control_contracts.schema.json`; it does not copy or re-own neutral `RepositoryContext`, revision, writer-lease, credential-lease, Permissions, FileSafe, receipt persistence, or EventRecord behavior. `Plans/jujutsu_integration_contract_fixtures.json` supplies one valid request and one mechanically rejected permission-negative for every canonical command plus clone success/cancellation/return, stale-operation, lease, credential, confirmation, alias, interop, recovery, effect-unknown, and secret-boundary negatives.

A future JJ adapter result must expose exact before/after operation IDs for mutation, including a recovery operation. The existing neutral capability snapshot binds exact version/profile/current catalog, requested versus effective import/export, certified-adapter and exact-live-probe refs, disposition, disabled reason, and the no-implicit-reconciliation/no-fallback-mutation policy. Static schema closure does not establish a native adapter or handler.

### 3.1 Canonical command inventory

```text
cmd.jujutsu.status.refresh
cmd.jujutsu.diff.open
cmd.jujutsu.history.open
cmd.jujutsu.change.new
cmd.jujutsu.change.describe
cmd.jujutsu.change.edit
cmd.jujutsu.change.split
cmd.jujutsu.change.squash
cmd.jujutsu.change.rebase
cmd.jujutsu.change.abandon
cmd.jujutsu.change.restore
cmd.jujutsu.bookmark.create
cmd.jujutsu.bookmark.move
cmd.jujutsu.bookmark.rename
cmd.jujutsu.bookmark.delete
cmd.jujutsu.bookmark.track
cmd.jujutsu.bookmark.untrack
cmd.jujutsu.workspace.list
cmd.jujutsu.workspace.create
cmd.jujutsu.workspace.open
cmd.jujutsu.workspace.switch
cmd.jujutsu.workspace.remove
cmd.jujutsu.operation.log
cmd.jujutsu.operation.show
cmd.jujutsu.operation.undo
cmd.jujutsu.operation.restore
cmd.jujutsu.git.clone
cmd.jujutsu.git.fetch
cmd.jujutsu.git.push
cmd.jujutsu.git.import
cmd.jujutsu.git.export
```

`cmd.jj.<suffix>` is compatibility-only and normalizes to `cmd.jujutsu.<suffix>` before availability, policy, dispatch, telemetry, event, and receipt handling.

`cmd.jujutsu.git.clone` is the Jujutsu-native clone entrypoint even though its transport consumes a Git remote. It remains `scm_backend=jujutsu`, preserves the Jujutsu operation/snapshot/currentness fence, destination Source Location, writer and credential leases, Permissions/FileSafe decisions, `ObservableWork`, and before/after operation identities. When Product Onboarding invokes it, the request carries one closed caller context and the terminal success or cancellation result echoes the exact surface, route, focus, invocation token, caller-context ref, expected caller revision, and continuation generation. Caller close or navigation does not cancel the operation. A successful receipt may feed `cmd.project.add_existing {registration_kind=jujutsu_clone}`; cancellation proves cleanup and creates no Project row.

The separate ordinary Git command is `cmd.source_control.repository.clone {scm_backend=git}`. Neither command is an alias of the other, and no generic `cmd.project.clone`, `cmd.git.clone`, or `cmd.scm.clone` is admitted.

### 3.2 JJ receipt extension

JJ receipts extend the common operation receipt with adapter-owned facts referenced from the terminal result: exact command argv identity without secrets, workspace snapshot ID, before/after operation IDs, before/after immutable commit IDs, affected change IDs, affected bookmark identities, conflict-state delta, colocation state, import/export result, quarantine disposition, and cleanup/reconciliation proof. Free-form stdout/stderr is diagnostic only and cannot establish state or artifact identity.

### 3.3 Typed command admission and result boundary

The command request enum is exactly the 31 IDs in §3.1. Family-level conditionals require change, bookmark, workspace, operation, transport, or repository targets without repeating 31 object definitions. Reads and navigation carry no writer, credential, FileSafe, confirmation, or interop authority. Mutations require a current catalog, writer lease, FileSafe decision, permission snapshot, exact expected Jujutsu revision, and target identity. Transport requires a bounded credential lease. Destructive/recovery operations require target-bound confirmation. `git.import` and `git.export` additionally require the exact certified-adapter/live-probe gate, `implicit_reconciliation_allowed=false`, and `fallback_mutation=none`; a blocked capability is represented by typed availability/result records and cannot validate as a dispatch-admitted request.

Results distinguish `accepted`, `succeeded`, `blocked`, `failed`, `cancelled`, `recovery_required`, and `effect_unknown`. Acceptance requires `ObservableWork`; successful mutation requires an after revision and receipt ref; `effect_unknown` requires a typed error, null after revision, and `after_reconciliation` retry disposition. Clone results additionally preserve the admitted currentness fence and exact caller return context. Availability uses a closed disabled-reason vocabulary and allowed recovery command IDs. No schema field assigns a persisted event, event family, native handler symbol, direct subprocess, or runtime certification. Those remain central Event Authority, command-owner, adapter, persistence, and evidence work.

## 4. Integration Surfaces

### 4.1 Adaptive Source Control

JJ mode exposes **Changes**, **Workspaces**, **History**, **Bookmarks**, and **Operation Log**. Forge-derived Reviews, Review Versions/Threads, Pipelines/Checks, Source of Truth, and Mirror Health appear only when the effective provider and capability envelope support them. Git-only stage/unstage, index, stash, and Branches sections are absent. Human copy may say “change,” “bookmark,” “operation,” “workspace,” and “conflict”; raw IDs appear only in Technical Details.

### 4.2 Setup and health

Settings actions include exact **Install Jujutsu** and **Use Jujutsu here**. Each row identifies Host/Environment, detected version, ownership, duplicates/shadows, signed catalog generation, adapter compatibility, repository eligibility, colocation authority, and read/mutation capability. Native Windows remains a first-class environment; WSL installations are per distribution and never substitute for Windows.

### 4.3 Forge and transport

Forge integration consumes published repository bindings and immutable revision identities. `jj git` transport still acquires common bounded credential leases. A forge cannot select local mutation authority, bypass the colocation fence, or treat a provider branch field as a JJ bookmark without an explicit adapter mapping. Rejection of colocated import/export cannot be converted into direct Git mutation by a forge, provider, GUI, alias, or generic source-control fallback.

## 5. Validation And Acceptance

Deterministic acceptance covers change lifecycle, bookmark lifecycle, workspace lifecycle, operation log/show/undo/restore, snapshots, conflicts, rebase/split/squash, clone/fetch/push/import/export, stale operation and writer lease, idempotency, clone cancellation/cleanup, exact caller route/focus/continuation return, caller-close non-cancellation, exact currentness, ordinary Git/Jujutsu clone non-aliasing, Project registration handoff, effect unknown, restart, move/resume, FileSafe complement, dual-writer races, late Git mutation, import/export mismatch, Jujutsu 0.44.0 colocated default-false import/export, certified-adapter admission, no implicit reconciliation, no fallback mutation, quarantine, native Windows/WSL/container/remote discovery, version/object-format/helper matrices, adaptive GUI, accessibility, and secret/log negatives.

Preview or catalog support remains a requested/effective capability. An unsupported mutation may degrade to validated reads only when the capability envelope says so; it must never silently fall through to direct Git mutation.

## 6. Plan-To-Node Readiness

This document and its command schema/fixtures are static planning/contract canon only. The 31 command request paths and negative fixtures are structurally specified, but node readiness remains blocked on central command registration, per-command Event Authority or explicit no-persist disposition, standard-gate registration of the new schema pair, a current signed JJ certification catalog, one clean native adapter/handler route per primary command, writer-lease and FileSafe integration, colocation race tests, migration implementation, production wiring, GUI fixtures, and fresh runtime/security evidence. No WorkNode, handler, event admission, production wiring, native execution, or runtime certification is created here.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Jujutsu `0.44.0` is retained only as an initial packet certification input pending current official re-verification. For a colocated workspace, `jj git import` and `jj git export` are effective false by default because of the upstream race; their typed command model does not authorize dispatch without an exact certified adapter gate and live probe.
- `cmd.jj.*` is compatibility-only. It receives no peer handler, policy path, event family, or receipt identity.
- Direct UI-to-process `jj` execution, free-form CLI scraping, branch/bookmark aliasing, FileSafe-as-JJ-undo, concurrent Git/JJ mutation, implicit import/export reconciliation, and fallback Git mutation are forbidden.
- Origin/JJ mutation remains Preview until the current certification matrix covers clone/fetch/push/bookmark/force-with-lease/colocation/helper/mode/history/object-format behavior. Unsupported combinations return typed degraded or unavailable results.
- This owner does not define forge authority, plugin manifests, installation lifecycle, secret custody, GUI geometry, command registry storage, or event persistence.

### 7.1 Migration

A repository becomes JJ-authoritative only from verified `.jj` store, workspace, and operation evidence. Colocated Git data does not make Git mutation-authoritative. Legacy Git-only records are not automatically converted to JJ because `jj` is installed. Ambiguous workspace paths, incomplete op logs, unsupported object formats, or missing compatibility evidence remain `needs_attention` or `blocked` with a recovery route.

## 8. Source Lineage And Governance

This owner compiles accepted register rows `SCM-02`, relevant portions of `SCM-01`, `SCM-03`, `UI-01`, `CT-01`, and token inventory `TS-03`. Root-owned central registration, indexes, command catalogs, Event Authority decisions, persistence, production wiring, validator-denominator registration, and governance sealing remain separate follow-up. Static document, schema, fixture, and focused-validation success is not native adapter, handler, runtime, GUI, security-isolation, or readiness evidence.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 30 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.jujutsu.bookmark.create` | `handlers::jujutsu::bookmark_create` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.bookmark.delete` | `handlers::jujutsu::bookmark_delete` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.bookmark.move` | `handlers::jujutsu::bookmark_move` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.bookmark.rename` | `handlers::jujutsu::bookmark_rename` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.bookmark.track` | `handlers::jujutsu::bookmark_track` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.bookmark.untrack` | `handlers::jujutsu::bookmark_untrack` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.abandon` | `handlers::jujutsu::change_abandon` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.describe` | `handlers::jujutsu::change_describe` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.edit` | `handlers::jujutsu::change_edit` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.new` | `handlers::jujutsu::change_new` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.rebase` | `handlers::jujutsu::change_rebase` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.restore` | `handlers::jujutsu::change_restore` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.split` | `handlers::jujutsu::change_split` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.change.squash` | `handlers::jujutsu::change_squash` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.diff.open` | `handlers::jujutsu::diff_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.git.export` | `handlers::jujutsu::git_export` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.git.fetch` | `handlers::jujutsu::git_fetch` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.git.import` | `handlers::jujutsu::git_import` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.git.push` | `handlers::jujutsu::git_push` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.history.open` | `handlers::jujutsu::history_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.operation.log` | `handlers::jujutsu::operation_log` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.operation.restore` | `handlers::jujutsu::operation_restore` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.operation.show` | `handlers::jujutsu::operation_show` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.operation.undo` | `handlers::jujutsu::operation_undo` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.status.refresh` | `handlers::jujutsu::status_refresh` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.workspace.create` | `handlers::jujutsu::workspace_create` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.workspace.list` | `handlers::jujutsu::workspace_list` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.workspace.open` | `handlers::jujutsu::workspace_open` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.workspace.remove` | `handlers::jujutsu::workspace_remove` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.jujutsu.workspace.switch` | `handlers::jujutsu::workspace_switch` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_request` -> `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_result` | `Plans/jujutsu_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/jujutsu_integration_contracts.schema.json#/$defs/permission_decision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.jujutsu.bookmark.create`, `cmd.jujutsu.bookmark.delete`, `cmd.jujutsu.bookmark.move`, `cmd.jujutsu.bookmark.rename`, `cmd.jujutsu.bookmark.track`, `cmd.jujutsu.bookmark.untrack`, `cmd.jujutsu.change.abandon`, `cmd.jujutsu.change.describe`, `cmd.jujutsu.change.edit`, `cmd.jujutsu.change.new`, `cmd.jujutsu.change.rebase`, `cmd.jujutsu.change.restore`, `cmd.jujutsu.change.split`, `cmd.jujutsu.change.squash`, `cmd.jujutsu.diff.open`, `cmd.jujutsu.git.export`, `cmd.jujutsu.git.fetch`, `cmd.jujutsu.git.import`, `cmd.jujutsu.git.push`, `cmd.jujutsu.history.open`, `cmd.jujutsu.operation.log`, `cmd.jujutsu.operation.restore`, `cmd.jujutsu.operation.show`, `cmd.jujutsu.operation.undo`, `cmd.jujutsu.status.refresh`, `cmd.jujutsu.workspace.create`, `cmd.jujutsu.workspace.list`, `cmd.jujutsu.workspace.open`, `cmd.jujutsu.workspace.remove`, `cmd.jujutsu.workspace.switch`.

Exact sole future handler set: `handlers::jujutsu::bookmark_create`, `handlers::jujutsu::bookmark_delete`, `handlers::jujutsu::bookmark_move`, `handlers::jujutsu::bookmark_rename`, `handlers::jujutsu::bookmark_track`, `handlers::jujutsu::bookmark_untrack`, `handlers::jujutsu::change_abandon`, `handlers::jujutsu::change_describe`, `handlers::jujutsu::change_edit`, `handlers::jujutsu::change_new`, `handlers::jujutsu::change_rebase`, `handlers::jujutsu::change_restore`, `handlers::jujutsu::change_split`, `handlers::jujutsu::change_squash`, `handlers::jujutsu::diff_open`, `handlers::jujutsu::git_export`, `handlers::jujutsu::git_fetch`, `handlers::jujutsu::git_import`, `handlers::jujutsu::git_push`, `handlers::jujutsu::history_open`, `handlers::jujutsu::operation_log`, `handlers::jujutsu::operation_restore`, `handlers::jujutsu::operation_show`, `handlers::jujutsu::operation_undo`, `handlers::jujutsu::status_refresh`, `handlers::jujutsu::workspace_create`, `handlers::jujutsu::workspace_list`, `handlers::jujutsu::workspace_open`, `handlers::jujutsu::workspace_remove`, `handlers::jujutsu::workspace_switch`.

### JJI-007 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: JJI-007
unit_type: command_binding
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  Jujutsu Integration owns exactly 30 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 30 commands and their exact disabled reasons.
depends_on: [JJI-003, JJI-006]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 30-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Jujutsu_Integration.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json

## Backup Closure And Isolated Restore Verification - 2026-09-01

### JJI-008 - Complete JJ Backup Closure Across Layouts And Safe Restore Handoff

```yaml
plan_unit_id: JJI-008
unit_type: integration_contract
status: accepted
owner_doc: Plans/Jujutsu_Integration.md
canonical_text: >-
  A source-inclusive JJ backup records the retained operation/object closure for the exact discovered layout:
  colocated, non-colocated, or shared multi-workspace. The closure includes operation heads/store, referenced views,
  commits/trees/conflicts, non-current abandoned/rebased objects needed by retained operations, underlying Git/common/
  alternate/shared stores when present, workspace maps and captured dirty files, under one capture barrier and GC/prune/
  rewrite fence. Restore verification runs on a clean isolated disposable repository, uses read modes that do not create
  a hidden JJ snapshot, proves a selected historical operation can be inspected and restored, and emits native
  collision/conflict/closure truth before Backup may activate. Restored mutable configuration remains sanitized and
  inactive; credentials and non-secret references require their owners to revalidate/reconnect. Rebind, remote checks,
  Project registration, forge binding, and repository_automation remain separate owner routes, and no restore drill
  pushes, executes hooks, resumes Goals, or mutates the original repository.
gui_related: true
gui_classification_reason: Operation Log and Source Control expose Backup history pivots plus missing-closure, colocation, conflict, credential-reconnect, and activation blockers.
depends_on: [JJI-002, JJI-004, JJI-005, JJI-006, SCS-014, BRS-002, BRS-003, BRS-006, BRS-014]
unblocks: []
acceptance_criteria:
  - Colocated closure binds the active `.jj` store, exact Git common/object store, every linked JJ/Git workspace, one JJ-authoritative barrier, and a GC fence; no late Git mutation, implicit import/export, or fallback Git mutation can be hidden by Backup.
  - Non-colocated closure preserves the JJ operation/object store and every explicitly mapped backing/alternate store without assuming a colocated Git checkout; shared multi-workspace closure preserves stable workspace/source mappings while foreign absolute paths remain non-authoritative.
  - Complete closure includes operation heads/views, commits/trees/conflicts, retained non-current/abandoned/rebased objects, current workspace files, and required dependency stores; a text op log, Git push, mirror clone, Git bundle, current bookmarks, or remote availability alone cannot satisfy it.
  - Capture cannot manufacture a JJ snapshot/commit/operation to align dirty files with the last recorded operation; the closure and restore receipt disclose the captured-files relationship separately.
  - Restore verification is isolated, read-only against the original, version-compatible, and ignore-working-copy where required; a disposable restored copy can list operations, inspect views, and restore the selected historical operation with object verification.
  - Colocation is not inferred after restore. Activation either proves one restored colocated JJ writer, explicitly rebinds as non-colocated through the owner, or blocks as a dual-writer/identity collision.
  - JJ conflicts, filesystem/path collisions, missing object closure, stale target state, and operation mismatch remain distinct receipt refs. A blocked/conflicted result cannot be promoted to successful Backup activation or auto-selected newest operation.
  - Ordinary restore does not activate hooks, aliases, credential helpers, filters, unsafe includes, URL user-info, extraHeaders, SSH material, forge credentials, or provider profiles. Non-secret restored refs and a separately authorized portable envelope remain pending owner validation and a fresh credential lease.
  - Operation History pivots only to existing `cmd.backup.browse`, `cmd.backup.file.compare`, and Project Backup routes; isolated operation inspection/restore uses existing `cmd.jujutsu.operation.show` and `cmd.jujutsu.operation.restore`; neutral rebind/status/remote validation uses Source Control; Forge/AutomationBinding remains Forge-owned. The exact 31-command JJ inventory is unchanged.
  - Machine records require `expected_event_types=[]`; schema and fixture success remains event-silent, handler_unavailable/static, and not runtime, native adapter, clean-host recovery, security, visual, or readiness proof.
validation_surfaces:
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/jujutsu_integration_contract_fixtures.json
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/backup_restore_system_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future colocated/non-colocated/shared-workspace clean-host restore, GC race, historical-operation, unsafe-config, collision/conflict, and no-hidden-snapshot tests
risk_class: incomplete_jj_operation_recovery_or_restore_dual_writer
reasoning_tier: high
context_scope: backup_jj_closure_and_isolated_restore
implementation_surfaces: [Plans/Jujutsu_Integration.md, Plans/jujutsu_integration_contracts.schema.json, Plans/jujutsu_integration_contract_fixtures.json, future JJ SourceSnapshotAdapter]
node_compile_hint: {mode: jujutsu_backup_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:SCM-004
  - source_ref:packet:2026-09-01:BKP-005-BKP-008
  - source_ref:packet:2026-09-01:BKP-011-BKP-012
  - source_ref:packet:2026-09-01:REST-005-REST-008
  - Plans/Backup_Restore_System.md#BRS-002
  - Plans/Backup_Restore_System.md#BRS-006
  - Plans/Backup_Restore_System.md#BRS-014
  - Plans/Source_Control_System.md#SCS-014
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.3
preserved_exact_tokens: [colocated, non-colocated, shared multi-workspace, operation heads, repository views, conflicts, abandoned, rebased, capture barrier, GC fence, ignore-working-copy, "expected_event_types=[]"]
negative_constraints:
  - Do not treat op-log text, a Git push, mirror clone, Git bundle, current bookmark, or reachable forge as complete JJ recovery.
  - Do not run verification or historical operation restore on the original active repository.
  - Do not snapshot the restored working copy implicitly, auto-import/export, fall back to Git mutation, or activate two writers.
  - Do not restore credentials, unsafe configuration, hooks, or secret bytes as active JJ state.
  - Do not add a JJ-private Backup command, handler, event family, manifest, restore coordinator, or automation binding.
  - Do not claim runtime, native, clean-host, security, visual, or readiness evidence from static contracts.
```
