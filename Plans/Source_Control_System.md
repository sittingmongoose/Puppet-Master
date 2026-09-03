# Source Control System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes shared envelopes from `Plans/Contracts_V0.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for backend-neutral source-control identity, repository/workspace context, revision fencing, writer and credential leases, setup projections, neutral commands/events/receipts, and the adaptive Source Control surface. Git-specific worktree mechanics remain with `Plans/WorktreeGitImprovement.md`; Jujutsu-native semantics remain with `Plans/Jujutsu_Integration.md`; hosted-service behavior remains with `Plans/Forge_Integrations.md` and provider owners.

## 0. Scope

Puppet Master supports two independent local source-control backends, exactly `scm_backend=git|jujutsu`. Hosted service selection is a separate axis, exactly `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|cursor_origin|none`. Forgejo and Gitea are distinct provider and adapter identities; a permanent `forgejo_or_gitea` identity is forbidden. The generic word `provider` is not a durable discriminator for either axis, and bare `origin` never means Cursor Origin.

Every source-control operation resolves an exact Project, Plan/Goal/run/agent lineage when present, Project Home Server, Execution Host, Execution Environment, Source Location, `repo_id`, `scm_backend`, backend-native `workspace_id`, backend-native immutable revision, installation/adapter/credential binding, independent repository-forge binding, optional independent `automation_binding_ref`, expected revision, writer lease, topology generation, permission decision, FileSafe decision, and idempotency key. `RepositoryForgeBinding` remains repository-hosting authority; `AutomationBinding` remains Forge-owned automation authority and may name a different provider, instance, account, or service. Paths, current directories, selected tabs, focused workspaces, remote names, branch labels, and account display names are descriptive only.

Git identity is object format, full immutable commit OID, exact refs/branch when applicable, and index generation. Jujutsu identity is change ID, immutable commit ID, operation ID, workspace ID, and bookmarks. A Git branch and JJ bookmark are not aliases. Git worktrees and JJ workspaces share a backend-neutral projection only after their native identities remain intact.

This document authorizes contracts and pre-build fixtures only. It creates no WorkNodes, NodeSeeds, executable queues, runtime handlers, provider connections, installations, or readiness/certification claims.

ContractRef: ContractName:Plans/Source_Control_System.md, SchemaID:pm.source_control.repository_context.v1, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.automation_binding.v1, SchemaID:pm.forge.provider_instance_profile.v1

## 1. Ownership And Consumers

### 1.1 Owned here

- independent `scm_backend` and `forge_provider` identity axes;
- backend-neutral `RepositoryContext`, revision union, writer lease, credential lease, setup state, operation request/receipt, and Source Control projection;
- canonical neutral command and event families under `cmd.source_control.*` and `source_control.*`;
- one backend-neutral ordinary Git clone entrypoint, `cmd.source_control.repository.clone {scm_backend=git}`, whose neutral namespace does not erase Git semantics and never absorbs Jujutsu clone;
- repository/workspace overlap planning, move/resume checkpoints, expected-revision fences, and recovery-required outcomes;
- HTTPS/SSH source-control credential-helper boundaries and brokered one-operation credential leases;
- Source Control panel adaptive section grammar and the Settings Source Control manager domain inventory;
- legacy Git-first migration rules into explicit backend/forge bindings; and
- typed unavailable/degraded/security outcomes common to Git and Jujutsu.

### 1.2 Retained owners

| Domain | Canonical owner | This owner consumes |
|---|---|---|
| Git worktrees, Git common-dir administration, FileSafe Git restore, Git conflicts | `Plans/WorktreeGitImprovement.md` | Git adapter behavior behind neutral context and commands. |
| Jujutsu changes, bookmarks, workspaces, operation log, colocation, undo/op restore | `Plans/Jujutsu_Integration.md` | JJ adapter behavior and native revision receipts. |
| Forge authority, capabilities, reviews, pipelines, apps, webhooks, mirrors | `Plans/Forge_Integrations.md` and provider-specific owners | `RepositoryForgeBinding`, independent `AutomationBinding`, provider-instance currentness, and provider-neutral projections. |
| Backup bytes, manifests, RestoreRun, browse/delivery, activation and rollback | `Plans/Backup_Restore_System.md` | Source closure/barrier truth, sanitized restore rebind/merge planning, remote validation, and backend-native collision/conflict receipts without a private Backup handler. |
| GitHub API/auth and GitHub Actions | `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md` | GitHub remains one forge provider; GitHub Actions semantics render inside the Forge-owned `repository_automation` / **Actions & Pipelines** shell. |
| Installation discovery, lifecycle, rollback, host/environment binding, `ObservableWork` | `Plans/Shared_Integration_Runtime.md`, `Plans/BinaryLocator_Spec.md`, `Plans/Release_Supply_Chain.md` | Exact target and runtime lifecycle receipts; no private installer. |
| Permission, FileSafe, secret and credential-store authority | `Plans/Permissions_System.md`, `Plans/FileSafe.md`, `Plans/Multi-Account.md` | Non-secret refs and independent decisions; no raw credential custody. |
| Command registry, production wiring, event envelope, persistence | `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.production.json`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md` | Registered identities and durable envelopes; this doc does not edit catalogs. |
| Settings shell/manager grammar and GUI tokens | `Plans/Settings_System.md`, `Plans/FinalGUISpec.md` | Domain descriptors and projections; no duplicate layout/theme owner. |

`Plans/Settings_System.md`, Source Control, Assistant Chat, Orchestrator, File Manager, LSP, Executor, Search, Runtime Artifacts, Onboarding, and Doctor consume the neutral context. A consumer may pass a filesystem path as an execution input, but it must also preserve the `repo_id`, `workspace_id`, source location, lease generation/epoch, and topology generation that authorize it.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Forge_Integrations.md

## 2. Canonical PlanUnits

### SCS-001 - Neutral Source Control Authority And Identity Axes

```yaml
plan_unit_id: SCS-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Plans/Source_Control_System.md is the sole owner for backend-neutral source-control identity, context,
  commands, leases, setup projections, receipts, and adaptive Source Control behavior. scm_backend and
  forge_provider are independent closed axes; provider, path, focus, remote name, and bare origin are not
  identity authority. Git, Jujutsu, and each forge retain their native owner contracts behind this facade.
gui_related: true
gui_classification_reason: The owner boundary also determines the adaptive user-visible Source Control and Settings projections.
depends_on: [PDS-003, SIR-001]
unblocks: [SCS-002, SCS-003, SCS-004, SCS-005, SCS-006, JJI-001, FGI-001]
acceptance_criteria:
  - Every repository context carries explicit scm_backend and independent forge_provider.
  - Paths, focus, remote names, and display handles cannot satisfy identity fields.
  - Git, JJ, and forge fields cannot cross their tagged schema branches.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json]
risk_class: source_control_parallel_owner_or_identity_drift
reasoning_tier: high
context_scope: neutral_source_control_owner
implementation_surfaces: [Plans/Source_Control_System.md, future source-control facade]
node_compile_hint: {mode: source_control_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-01, source_ref:scm-origin-reaudit:2026-08-31]
preserved_exact_tokens: [scm_backend, forge_provider, git, jujutsu, cursor_origin, none, repo_id, workspace_id]
negative_constraints: [Do not overload provider., Do not use bare origin for Cursor Origin., Do not infer durable identity from a path or focused UI state.]
owner_hints: [Plans/Source_Control_System.md]
```

### SCS-002 - Repository Context And Backend-Native Revision Fences

```yaml
plan_unit_id: SCS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  RepositoryContext binds Project, optional Plan/Goal/run/agent, Home Server, Execution Host, Environment,
  Source Location, topology generation, repo_id, scm_backend, backend-native workspace and immutable revision,
  writer lease, credential binding, independent repository-forge binding, and optional independent
  automation-binding reference. Git uses object format, full OID, refs and index generation. JJ uses change ID,
  immutable commit ID, operation ID, workspace ID and bookmarks.
gui_related: false
gui_classification_reason: This unit defines runtime identity and mutation fencing rather than presentation.
depends_on: [SCS-001]
unblocks: [SCS-003, SCS-005, JJI-002, FGI-002]
acceptance_criteria:
  - A Git context rejects JJ revision fields and a JJ context rejects Git revision fields.
  - Every mutation compares the full expected native revision and topology generation.
  - An optional automation_binding_ref never has to resolve to the repository forge host and never replaces RepositoryForgeBinding.
  - Move/resume recreates an exact backend-native checkpoint rather than claiming live process migration.
validation_surfaces: [repository_context schema fixtures, cross-backend negative fixtures, future move and resume receipts]
risk_class: stale_or_cross_backend_mutation
reasoning_tier: high
context_scope: repository_workspace_revision_identity
implementation_surfaces: [Plans/source_control_contracts.schema.json, future source-control context resolver]
node_compile_hint: {mode: tagged_repository_context_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-001..003, source_ref:egolite-register:SCM-018..019]
preserved_exact_tokens: [RepositoryContext, RepositoryForgeBinding, AutomationBinding, automation_binding_ref, Source Location, topology generation, object format, full immutable OID, change ID, immutable commit ID, operation ID, bookmarks]
negative_constraints: [Do not store a JJ change ID in a Git commit field., Do not call a branch and bookmark aliases., Do not claim live stack or process migration.]
owner_hints: [Plans/Source_Control_System.md, Plans/WorktreeGitImprovement.md, Plans/Jujutsu_Integration.md]
```

### SCS-003 - Writer Leases, Credential Leases, Commands, Events, And Receipts

```yaml
plan_unit_id: SCS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Every source-control mutation requires one current writer lease with repository/workspace/backend, holder,
  generation, epoch, expiry and reconciliation state; one expected native revision; Permissions and FileSafe
  decisions; and one idempotent command instance. HTTPS and SSH credentials are brokered as expiring,
  revocable, operation- or GoalRun-scoped leases. Async work uses ObservableWork and every terminal attempt
  emits a typed operation receipt even when the effect is unknown or recovery is required. The nineteen
  canonical cmd.source_control backend/repository/status/diff/history/workspace/remote identities use one
  owner-DRY discriminated scope plus generic request/result/error/availability/disabled-reason schemas; this
  static contract does not establish central catalog rows, native handlers, production wiring, admitted events,
  or runtime proof.
gui_related: true
gui_classification_reason: Commands expose visible actions, progress, disabled reasons, and recovery routes.
depends_on: [SCS-002, SIR-008]
unblocks: [SCS-005, JJI-003, JJI-004]
acceptance_criteria:
  - Lease loss or stale generation blocks mutation before effect.
  - Credential leases contain only non-secret refs and expire or revoke independently of account records.
  - Accepted async commands point to ObservableWork; terminal receipts carry before/after native revisions and event refs.
  - Command scopes preserve exact Project/Home Server/Host/Environment/Source Location/repository/backend/workspace/revision/currentness/lease/credential identities as applicable, while path/focus/newest/remote text and generic provider fields cannot satisfy identity.
  - Read-only and pre-repository commands do not inherit mutation-only writer or transport requirements; command-specific requirements are selected only by the exact command_id discriminator.
validation_surfaces: [Plans/source_control_contract_fixtures.json, writer and credential lease fixtures, stale lease tests, prompt suppression tests, command idempotency tests]
risk_class: concurrent_mutation_or_credential_escape
reasoning_tier: high
context_scope: source_control_mutation_authority
implementation_surfaces: [Plans/source_control_contracts.schema.json, future command handlers, future credential broker adapter]
node_compile_hint: {mode: source_control_command_and_lease_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-008..009, source_ref:egolite-register:CT-01..02]
preserved_exact_tokens: [writer lease, generation, epoch, git-credential-puppet-master, credential.useHttpPath=true, pm-ssh, pm-ssh-agent-bridge, ObservableWork, effect_unknown]
negative_constraints: [Do not prompt for ambient credentials., Do not persist private keys or tokens., Do not treat expiry as cleanup proof., Do not retry an effect-unknown mutation automatically.]
owner_hints: [Plans/Source_Control_System.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

### SCS-004 - Exact-Environment Setup And Capability Certification

```yaml
plan_unit_id: SCS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Git and Jujutsu discovery, selection, setup, repair and rollback bind an exact Execution Host and Execution
  Environment. Signed moving certification catalogs own supported mutation versions; historical Git 2.55.0
  and Jujutsu 0.44.0 values are initial packet inputs, not timeless floors. Older user-owned installations may
  be admitted for bounded safe reads only. Installation, ownership, adapter compatibility, authentication,
  capability and forge readiness remain independent states.
gui_related: true
gui_classification_reason: Exact-host setup state and the install/use/repair actions are user-visible Settings behavior.
depends_on: [SCS-001, SIR-004]
unblocks: [SCS-005, JJI-006]
acceptance_criteria:
  - Discovery does not merge Windows, WSL distributions, containers, remote Hosts, or native environments.
  - Duplicate, shadowed, user-managed, PM-managed, read-only, mutation-certified, and unavailable states remain distinct.
  - Current mutation support is derived from a verified signed catalog at execution time.
validation_surfaces: [setup state fixtures, Windows and WSL separation tests, signed catalog currentness tests]
risk_class: wrong_environment_or_stale_version_certification
reasoning_tier: high
context_scope: source_control_setup
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future signed compatibility catalog, future Source Control manager]
node_compile_hint: {mode: exact_environment_setup_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-004..005, source_ref:egolite-register:SCM-010..011]
preserved_exact_tokens: [Git 2.55.0, Jujutsu 0.44.0, Install Git, Install Jujutsu, Use existing Git setup, Use Jujutsu here, Use Git here]
negative_constraints: [Do not rewrite global PATH or user configuration., Do not promote packet version floors as permanently current., Do not equate installation with authentication or readiness.]
owner_hints: [Plans/Source_Control_System.md, Plans/Shared_Integration_Runtime.md, Plans/BinaryLocator_Spec.md, Plans/Release_Supply_Chain.md]
```

### SCS-005 - Adaptive Source Control And Settings Projections

```yaml
plan_unit_id: SCS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control remains one Activity Bar side-panel slot and adapts by backend and forge: Changes,
  Workspaces, History, Git Branches or JJ Bookmarks, Reviews, optional Review Versions and Threads,
  current checks, and conditional Source of Truth and Mirror Health. Hosted automation remains a separate,
  Forge-owned `repository_automation` occupant labeled Actions & Pipelines and binds through AutomationBinding;
  `github_actions` is compatibility-only. Git-only staging and stash are absent for JJ. Settings routes one source-control manager with Local Tools, Repositories, Accounts and
  Sign-In, Hosting Services, Defaults, Automation, Safety, Advanced, and Diagnostics and Receipts.
gui_related: true
gui_classification_reason: This unit defines visible panel sections, labels, Settings manager domains, and disabled/degraded presentation.
depends_on: [SCS-002, SCS-003, SCS-004, FGI-003]
unblocks: [SCS-006]
acceptance_criteria:
  - No backend or forge receives a dedicated Activity Bar panel.
  - Git and JJ fixtures expose only compatible sections and provider-native PR or MR wording.
  - Source Control may link to the selected automation binding but does not render a second pipeline shell or infer automation from the repository host.
  - The source-control manager is the unique operational destination; browser-scm remains a non-owning dependency summary.
validation_surfaces: [source_control_projection fixtures, future Slint panel fixtures, Settings search and route dedupe fixtures]
risk_class: gui_backend_or_owner_misrepresentation
reasoning_tier: high
context_scope: source_control_gui_and_settings
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, future Source Control Slint components]
node_compile_hint: {mode: adaptive_source_control_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01, source_ref:egolite-register:UI-03]
preserved_exact_tokens: [Changes, Workspaces, History, Git Branches, JJ Bookmarks, Review Versions, Threads, current checks, Source of Truth, Mirror Health, repository_automation, "Actions & Pipelines", github_actions, Diagnostics and Receipts]
negative_constraints: [Do not create a panel per forge or backend., Do not show staging or stash for JJ., Do not expose underscore enums or raw IDs in ordinary UI.]
owner_hints: [Plans/Source_Control_System.md, Plans/Settings_System.md, Plans/FinalGUISpec.md]
```

### SCS-006 - Migration, Degradation, And Security Fail Closure

```yaml
plan_unit_id: SCS-006
unit_type: validation
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Legacy Git-first records migrate only from admissible native evidence. A proven Git repository may receive
  scm_backend=git; forge binding requires a separately validated hosted repository identity. Path, remote text,
  focus, or newest record cannot manufacture identity. Ambiguous records become needs_binding or
  ambiguous_blocked. Stale leases, unknown effects, unsupported versions, missing credentials, offline hosts,
  and unavailable forge capabilities preserve typed degraded or blocked results and recovery actions.
gui_related: true
gui_classification_reason: Migration and degradation determine visible status, disabled reasons, and repair actions.
depends_on: [SCS-005]
unblocks: []
acceptance_criteria:
  - Migration fixtures distinguish migrated, needs_binding, and ambiguous_blocked without silent provider inference.
  - Security negatives cover raw secrets, credential prompts, unauthenticated IPC, forwarding, stale lease, and cross-backend fields.
  - Static schema and fixture success is never reported as runtime or production-wiring proof.
validation_surfaces: [Plans/source_control_contract_fixtures.json, future migration fixtures, future IPC and credential security tests]
risk_class: migration_authority_widening_or_false_readiness
reasoning_tier: high
context_scope: source_control_migration_and_fail_closure
implementation_surfaces: [future source-control migration, future acceptance harness]
node_compile_hint: {mode: source_control_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:scm-origin-reaudit:Git-hardcoded-constraints, source_ref:egolite-register:GOV-005..007]
preserved_exact_tokens: [migrated, needs_binding, ambiguous_blocked, blocked, degraded, recovery_required]
negative_constraints: [Do not infer forge_provider from a remote string alone., Do not call schema validation runtime proof., Do not convert a failure into partial success.]
owner_hints: [Plans/Source_Control_System.md, Plans/storage-plan.md, Plans/Automated_Testing_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/source_control_contracts.schema.json` owns the Draft 2020-12 tagged record shapes. `Plans/source_control_contract_fixtures.json` supplies valid and negative examples. The schema now statically specifies the nineteen neutral command request/result/error/availability/disabled-reason shapes through one reusable discriminated scope, with a checkpoint permission decision extension; it owns shapes, not central command registration, native handlers, persistence implementation, production wiring, Event Authority admission, or runtime evidence.

### 3.1 Canonical neutral commands

The command owner must register the following exact primary identities:

```text
cmd.source_control.backend.detect
cmd.source_control.backend.select
cmd.source_control.repository.clone
cmd.source_control.repository.bind
cmd.source_control.repository.unbind
cmd.source_control.status.refresh
cmd.source_control.diff.open
cmd.source_control.history.open
cmd.source_control.workspace.list
cmd.source_control.workspace.create
cmd.source_control.workspace.open
cmd.source_control.workspace.switch
cmd.source_control.workspace.remove
cmd.source_control.remote.fetch
cmd.source_control.remote.sync
cmd.source_control.remote.publish
cmd.source_control.checkpoint.create
cmd.source_control.checkpoint.inspect
cmd.source_control.checkpoint.restore
```

The generic command scope admits only those exact nineteen IDs. It preserves exact Project, Project Home Server, Execution Host, Execution Environment, Source Location, topology generation, repository context, `repo_id`, `scm_backend`, backend-native `workspace_id`, backend-native expected revision, currentness generation, writer lease, credential lease, transport, independent `forge_provider` binding, and checkpoint identity/generation fields as applicable. `backend.detect` and `backend.select` are exact-environment pre-repository branches; status/diff/history/workspace-list/open and checkpoint inspect are read/currentness branches without a fabricated writer lease; mutation, checkpoint create/restore, and remote branches add the exact writer or credential authority they require. Closed `additionalProperties` scopes structurally reject path/focus/newest-record/remote-text/generic-provider substitution.

`cmd.source_control.repository.clone` is the sole backend-neutral ordinary Git clone command. Its scope is nevertheless exactly `scm_backend=git`; it requires a reserved Project/repository/workspace lineage, exact Host/Environment/Source Location and topology generation, current catalog generation/ref/hash, destination writer lease, one-operation credential lease, transport, independent forge binding including `none`, verified remote identity, FileSafe destination Source Location, permission decision, idempotency, and an exact caller return context. Success returns the repository/source identities, `ObservableWork`, and terminal operation receipt needed by Project System to register `registration_kind=git_clone`. Cancellation returns to the exact caller route/focus/continuation after cleanup and creates no Project row. Caller close or navigation does not itself cancel the clone.

Jujutsu cloning remains the distinct `cmd.jujutsu.git.clone` owned by `Plans/Jujutsu_Integration.md`, and its Project handoff is `registration_kind=jujutsu_clone`. Neither `cmd.git.clone`, `cmd.scm.clone`, a generic `cmd.project.clone`, nor any normalization between ordinary Git and Jujutsu clone is admitted.

`cmd.source_control.select_worktree` is compatibility-only and normalizes before policy/dispatch to `cmd.source_control.workspace.switch {backend: git}`. `cmd.scm.*` is forbidden. Existing Git conflict/merge/review/graph/stage/commit/stash/branch/compare commands remain Git adapter commands unless the command owner explicitly normalizes them. Family/glob tokens are documentation groups, never registerable commands.

### 3.2 Canonical events

```text
source_control.backend.detected
source_control.backend.selected
source_control.repository.bound
source_control.repository.unbound
source_control.status.refreshed
source_control.workspace.created
source_control.workspace.opened
source_control.workspace.switched
source_control.workspace.removed
source_control.remote.fetch_started
source_control.remote.fetch_completed
source_control.remote.sync_started
source_control.remote.sync_completed
source_control.remote.publish_started
source_control.remote.publish_completed
source_control.writer_lease.granted
source_control.writer_lease.lost
source_control.checkpoint.created
source_control.checkpoint.restored
```

The event envelope is owned by `Plans/Contracts_V0.md`; persistence and replay are owned by `Plans/storage-plan.md`. The names above remain event candidates pending per-family Event Authority admission; this owner/schema closure does not register or admit them. A command acceptance receipt is not terminal work truth. Long-running fetch, sync, publish, setup, repair, rollback, overlap planning, move, and recovery operations expose `ObservableWork` from `Plans/Shared_Integration_Runtime.md` only after native runtime integration exists.

### 3.3 Credential transport contract

HTTPS invokes the exact helper identity `git-credential-puppet-master` through process-scoped configuration with `credential.useHttpPath=true` and terminal prompting suppressed. SSH invokes exact `pm-ssh`; private keys remain broker-held and each request binds identity, host, repository, known-host decision, no-forwarding posture, operation, lease, and receipt. Optional `pm-ssh-agent-bridge` is ephemeral and operation-scoped.

Broker IPC is an ACL/SID/process/lease-validated Windows named pipe or owner-only peer/lease-validated Unix socket. It is not public ingress. Tokens, private keys, passwords, cookies, raw agent sockets, and credential-bearing environment variables never enter Project files, source-control records, logs, chat, prompts, events, ordinary receipts, or artifacts.

ContractRef: SchemaID:pm.source_control.credential_lease.v1, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

## 4. Integration Surfaces

### 4.1 Operation flow

1. Resolve exact topology and `RepositoryContext`.
2. Resolve backend adapter and current capability certification.
3. Plan workspace overlap and acquire the exact writer lease for mutation; reads carry a currentness fence.
4. Acquire independent Permissions and FileSafe decisions.
5. Acquire a bounded credential lease only if transport is required.
6. Dispatch one canonical command with idempotency and expected native revision.
7. Publish `ObservableWork` for asynchronous work.
8. Emit canonical events and one terminal operation receipt with before/after revision or `effect_unknown`.
9. Reconcile cleanup before reassigning a lease or resuming after restart/move.

### 4.2 Source Control GUI

Source Control is backend- and forge-adaptive, not Git-hardcoded. It never gains a dedicated JJ, GitLab, Azure DevOps, Bitbucket, or Cursor Origin rail item or panel. Human text uses Branches for Git and Bookmarks for JJ; PR or MR follows the effective forge. Underscore enums, hashes, operation IDs, command IDs, raw paths, credential refs, lease IDs, and adapter protocol details remain in Technical Details only.

Every control dispatches one registered command. Disabled controls show an exact human reason and one or more allowed recovery actions. No spinner or elapsed timer invents work progress; setup, fetch, sync, publish, review, pipeline, mirror, and repair rows render `ObservableWork`.

### 4.3 Settings projection

The `source-control` manager domains are exactly **Local Tools**, **Repositories**, **Accounts & Sign-In**, **Hosting Services**, **Defaults**, **Automation**, **Safety**, **Advanced**, and **Diagnostics & Receipts**. It supports search/filter, connect/add, resource/account/repository rows, Details, requested/effective state, and loading/empty/error/managed/unavailable/needs-attention/diagnostic/receipt states.

`browser-scm` is only a Settings dependency summary routing into `source-control`; it owns no duplicate SCM settings or setup workflow. Ordinary Settings never reveal secrets or internal IPC addresses.

### 4.4 Setup flow

Setup follows cached state -> exact Host/Environment discovery -> tool availability/reuse/explicit install -> separate sign-in or official page -> safe validation -> repository and hosted container selection -> capability probe -> binding -> **Ready**, **Ready with limits**, **Needs attention**, or **Not available**. The shared Integration Runtime performs installation and maintenance; Source Control supplies the capability need and renders the result.

Product Onboarding projects this flow as two independent beginner-facing choices. `scm_backend=git|jujutsu` is the local Safe History backend on the selected work computer. `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|cursor_origin|none` is an optional online-copy binding. Local history and an online copy may coexist; selecting a forge never disables local Git/Jujutsu, and selecting local-only never disables Source Control. FileSafe safe points complement Source Control and do not replace Git or Jujutsu. Git and Jujutsu are local tools and have no service accounts; GitHub, GitLab, Azure DevOps, Bitbucket, Forgejo, Gitea, and Cursor Origin are optional services where an account and online repository may exist. Forgejo and Gitea setup preserves distinct typed instance, API, SSH, trust, product/version/schema, Git/API/Actions-state, credential-reference, and currentness fields; an API-disabled instance may still be Git-ready. No Git account, Jujutsu account, Git/Jujutsu signup, or Git/Jujutsu authentication route exists.

For a new local Project, Project System first dispatches `cmd.project.new_local {init_git:true}` and returns the exact Project/repository identities. Source Control may then detect, select, and bind the admitted local backend with `cmd.source_control.backend.detect`, `cmd.source_control.backend.select`, and `cmd.source_control.repository.bind`. `cmd.source_control.repository.init` does not exist and MUST NOT be registered, aliased, dispatched, or shown. Selecting Jujutsu is allowed only when the Jujutsu owner can establish or bind the exact certified repository/workspace state; a missing owner route is `handler_unavailable`/`not_available` with a human recovery route, never an inferred initialization.

An optional online copy uses the common integration, account, forge, and backend owners: existing accounts use `cmd.integration.connection.add` plus `cmd.auth_profile.sign_in`; people without an account may use `cmd.auth_profile.open_official_page` to visit the verified official provider signup page, then return for owner verification/sign-in. Puppet Master never claims to create the provider account. Repository discovery/creation uses `cmd.forge.repository.list|create`; ordinary Git clone/publish uses `cmd.source_control.repository.clone {scm_backend=git}` and `cmd.source_control.remote.publish`; Jujutsu clone/publish remains `cmd.jujutsu.git.clone` and `cmd.jujutsu.git.push`; successful terminal identities feed the exact `cmd.project.add_existing` registration kind. Protected AuthBrowserSession is human-only, non-recordable, non-inspectable, unavailable to agents/adapters, and excluded from capture, logs, receipts, persistence, and concept simulation.

Each onboarding choice is one dispatch. A current terminal owner result returns through the exact revisioned continuation and advances the branch/stage automatically; Source Control does not require an extra preview confirmation, `Continue when ready`, or second `Continue`. Trust, authentication, privacy, destructive, and restore decisions remain explicit where the owner requires them. Concept fixtures and PMConcept7 previews stay `concept_simulated`/`handler_unavailable` and never claim a real account, repository, push, native handler, or production readiness.

## 5. Validation And Acceptance

Acceptance requires, at minimum:

- schema-valid positive and negative fixtures for both backend branches;
- path/focus/remote/account-display identity negative tests;
- Git SHA-1/SHA-256, JJ native ID, expected-revision, stale generation, lease-loss, expiry-reconciliation, idempotency, effect-unknown, restart, move/resume, and overlap fixtures;
- Git/JJ exact Host/Environment discovery across native Windows, each WSL distribution, Linux, macOS, containers, and remote Hosts;
- HTTPS prompt suppression, `credential.useHttpPath=true`, SSH known-host/no-forwarding, IPC ACL/peer/lease, secret leak, and revocation tests;
- adaptive Source Control sections, provider-native vocabulary, Settings route dedupe, keyboard/focus/label/disabled-reason/accessibility, every theme, responsive width, and reduced-motion GUI fixtures;
- command catalog, handler, event family, receipt, persistence, production wiring, deep-link, and migration coverage; and
- Product Onboarding ordinary Git clone versus Jujutsu clone separation, exact caller route/focus/continuation return, catalog-currentness rejection, caller-close non-cancellation, explicit cancellation cleanup, and Project registration handoff; and
- Product Onboarding local-only and local-plus-online combinations; no-Jujutsu-account and nonexistent-repository-init negatives; verified official signup-page return; forge create/list plus Git/Jujutsu publish routing; and one-choice/one-dispatch/terminal-return-auto-advance without redundant confirmation; and
- distinct Forgejo/Gitea, same-named repositories on different instances, API-disabled/Git-ready, scoped private-CA reference, verified SSH known-host/custom-port, redirect-origin credential stripping, restricted localhost/metadata target, stale currentness, read-only token, and independent automation-host fixtures; and
- raw runtime receipts for mutation, cancellation, recovery, and cleanup before any runtime or readiness claim.

Static JSON parsing and schema/fixture validation prove only contract structure. The command schema/fixtures are specified, but the central catalog, native handler implementations, credential broker, Source Control UI, provider/forge connections, Event Authority admission, runtime behavior, security isolation, production wiring, runtime receipts, and visual acceptance remain absent.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/UI_Wiring_Rules.md

## 6. Plan-To-Node Readiness

These PlanUnits have static owner/schema command contracts but are contract-complete enough for indexing only after the plan index, command catalogs, event family registry/Event Authority, storage registry, production wiring, Settings consumer, GUI owner, and provider owners route to them. They remain node-blocked until migration fixtures, native handler ownership and implementation, current signed compatibility catalogs, permission/FileSafe integration, credential-broker implementation, `ObservableWork` integration, clean-room runtime tests, security negatives, and visual acceptance all exist.

No PlanUnit here authorizes a WorkNode or build task. `buildability_gate_passed` remains false unless the canonical readiness owners independently prove otherwise.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Historical Git `2.55.0` and Jujutsu `0.44.0` values are catalog inputs pending current official re-verification; they are not hardcoded timeless floors.
- `cmd.source_control.select_worktree` is compatibility-only; `cmd.scm.*` is retired/forbidden.
- Existing `select_tab` versus `switch_subview`, review alias, conflict entrypoint, and direct WorktreeManager call collisions require command-owner adjudication. `github_actions` is compatibility-only route/bookmark/deep-link input normalized to `repository_automation`; this doc does not create a competing shell or rename GitHub-specific commands/settings.
- This owner does not replace Git worktree semantics, JJ semantics, forge APIs, GitHub APIs/Actions, shared installation lifecycle, Permissions, FileSafe, storage, commands, wiring, Settings shell, or GUI tokens.
- It does not define plugin manifest grammar. Any portable `plugin.json` versus PM-native `pm-plugin.json` distinction is owned solely by `Plans/Plugins_System.md`; Source Control consumes only a validated installed component identity.
- It does not install tools, connect accounts, mutate repositories, create provider apps/webhooks, or certify runtime support.

### 7.1 Migration rules

Legacy records with admissible Git object/worktree evidence may migrate to `scm_backend=git`. A `.jj` repository with a verified JJ workspace and operation identity migrates to `scm_backend=jujutsu`; a colocated repository remains JJ mutation-authoritative as defined by `Plans/Jujutsu_Integration.md`. Forge provider migration requires a validated host/account/provider-repository binding and cannot arise from a display remote alone. Ambiguous records remain disabled with `needs_binding` or `ambiguous_blocked` and preserve source lineage.

## 8. Source Lineage And Governance

This owner compiles the accepted SCM/Origin register rows `SCM-01..05`, `UI-01`, `UI-03`, and `CT-01..02`, plus the neutral command/event inventory, under the 2026-08-31 packet precedence. The packet values and read-only audit are source lineage; this document is the canonical owner prose.

Root-owned follow-up must register the doc and schema/fixture artifacts in central indexes, route consumers, add central command catalog rows, obtain Event Authority decisions, implement native handlers/receipts/persistence/production wiring, and update generated indexes only after ordinary edits stabilize. Generated shards, evidence, plan graph, and Spec Lock are governance outputs and are not hand-edited here.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/DRY_Rules.md

### SCS-007 - Included Git/Jujutsu Baselines And Cross-Domain Workspace Conflict Plan

```yaml
plan_unit_id: SCS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Git and Jujutsu are included PM-managed baseline tools in the persistent Tool Store, each resolved for one exact
  Host and Environment with pinned source/provenance, compatibility, verification, activation, update, rollback,
  and ownership evidence through Shared Integration Runtime. The included baseline remains distinct from any selected
  external installation, changes no global PATH or source-control configuration, and is not ready until its exact
  generation is verified. Before concurrent workspace work is admitted, one conflict plan compares exact resource
  identities across files, migrations, ports, devices, and deployments and returns admit, serialize, isolate, block,
  or manual-resolution with leases and a receipt; paths, focus, labels, and repository proximity never substitute for
  resource identity.
gui_related: true
gui_classification_reason: Baseline availability and conflict/serialization reasons are visible in Source Control and work admission.
depends_on: [SCS-002, SCS-004, SIR-021]
unblocks: []
acceptance_criteria:
  - SCM-005 has separate included `git` and `jujutsu` PM Tool Store baseline rows with exact Host/Environment, provenance, and verified activation.
  - The included rows cover supported native apps, Servers, containers, managed WSL, and managed Execution Hosts through SIR policy without modifying global PATH, Git config, or JJ config.
  - User-managed or externally managed alternatives remain selectable only with explicit ownership/provenance and do not erase the included baseline.
  - SCM-019 evaluates files, migrations, ports, devices, and deployments before admission and binds every collision to stable resource identity, decision, lease/currentness refs, and a conflict-plan receipt.
  - File identity includes canonical source/workspace identity rather than path spelling; migration identity includes target and migration/schema generation; port identity includes Host/Environment, address/protocol and port; device identity is provider-stable; deployment identity includes target and release/environment generation.
  - Migration and deployment collisions default to serialize or block unless an owner-specific isolation proof exists; a device or exclusive port cannot be double-leased.
  - Positive fixtures prove disjoint claims across all five domains can admit and each supported collision returns its deterministic decision; negative fixtures reject a missing domain, path-only equality, stale lease/currentness, double-leased device/port, and a terminal result without a conflict-plan receipt.
  - Static fixture success does not prove installation, conflict detection against live resources, native Git/JJ execution, or safe deployment.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, focused Egolite remediation validator, future included-baseline target matrix, future five-domain conflict positive/negative fixtures, future live overlap and exact-environment fixtures]
risk_class: scm_baseline_absence_or_cross_domain_collision
reasoning_tier: high
context_scope: scm_baselines_and_resource_conflicts
implementation_surfaces: [Plans/Source_Control_System.md, Plans/Shared_Integration_Runtime.md, future Source Control and workspace admission services]
node_compile_hint: {mode: source_control_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:SCM-005, source_ref:egolite-requirement:SCM-019]
preserved_exact_tokens: [Git, Jujutsu, included PM-managed baseline, Tool Store, files, migrations, ports, devices, deployments]
negative_constraints:
  - Do not infer a baseline installation from PATH discovery alone.
  - Do not replace, reconfigure, or silently prefer an external installation merely because the included baseline exists.
  - Do not admit overlapping work from path-only or focus-derived heuristics.
```

## 9. Server command-gap checkpoint and checkout-alias closure (2026-09-01)

The existing DRY `source_control_command_request|source_control_command_result|source_control_command_error|source_control_command_availability|source_control_command_disabled_reason` family now admits the three checkpoint commands below, with `source_control_permission_decision` closing their permission/FileSafe decision shape. The source schema remains `Plans/source_control_contracts.schema.json`; no parallel checkpoint handler family is allowed.

| Row / packet line | Exact command and sole handler | Retained semantic |
|---|---|---|
| 150 / `machine/command_census.json:1998` | `cmd.source_control.checkpoint.create` -> `handlers::source_control::checkpoint_create` | Create a backend-native fenced checkpoint for recovery or handoff without conflating Git and Jujutsu identities. |
| 151 / `machine/command_census.json:2004` | `cmd.source_control.checkpoint.inspect` -> `handlers::source_control::checkpoint_inspect` | Read the bounded current checkpoint identity, backend-native revision, validity, and restore preconditions. |
| 152 / `machine/command_census.json:2010` | `cmd.source_control.checkpoint.restore` -> `handlers::source_control::checkpoint_restore` | Restore one exact backend-native checkpoint under writer lease, FileSafe, permission, topology, and revision fences. |

All three are `handler_unavailable` until exact named native-handler proof, central registration, schema binding, permission/FileSafe routing, production wiring, and receipt-or-separately-admitted-event disposition exist. Checkpoint creation/restoration expose `ObservableWork`; inspect remains bounded. Git checkpoint identity uses Git-native revision fields and Jujutsu uses Jujutsu-native change/commit/operation/workspace identity. A stale topology/revision/checkpoint generation, mismatched backend, expired writer lease, denied permission/FileSafe decision, duplicate binding conflict, `effect_unknown`, restart/race ambiguity, or exact-return mismatch fails closed.

Five packet checkout spellings are approved compatibility aliases only:

| Row / packet line | Source alias -> exact target / sole target handler | Rule |
|---|---|---|
| 98 / `machine/command_census.json:1182` | `cmd.project.checkout.add_worktree` -> `cmd.source_control.workspace.create` / `handlers::source_control::workspace_create` | Create and bind one additional backend-native workspace while preserving Project/repository/Host/Environment/Source Location identity. |
| 99 / `machine/command_census.json:1188` | `cmd.project.checkout.connect_existing` -> `cmd.source_control.repository.bind` / `handlers::source_control::repository_bind` | Bind a verified existing checkout/workspace to the exact Project repository context. |
| 100 / `machine/command_census.json:1194` | `cmd.project.checkout.create` -> `cmd.source_control.workspace.create` / `handlers::source_control::workspace_create` | Create the exact checkout/workspace binding with stable identity, idempotency, and typed receipt. |
| 101 / `machine/command_census.json:1200` | `cmd.project.checkout.remove` -> `cmd.source_control.workspace.remove` / `handlers::source_control::workspace_remove` | Remove the exact binding only with explicit ownership, dependency, active-work, and data-disposition handling. |
| 102 / `machine/command_census.json:1206` | `cmd.project.checkout.verify` -> `cmd.source_control.status.refresh` / `handlers::source_control::status_refresh` | Verify the binding from layered identity, compatibility, provenance, capability, and currentness evidence. |

Every source alias normalizes before policy and dispatch. The invoked token may survive only in compatibility/source receipt identity; `independent_handler_allowed=false` and `independent_wiring_allowed=false`. Policy, availability, permission, dispatch, receipt, event, and result semantics are evaluated once against the exact target. The alias spellings are not additional canonical command registrations.

The exact GUI consumers for all eight rows are Source Control panel, Settings > Source Control, Projects checkout/worktree flow, Doctor, and palette/API.

The packet source base for every line above is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; the schema preserves each complete `packet_source_ref` and intended semantic byte-for-byte.

### SCS-008 - Backend-Native Checkpoints And Checkout Alias Normalization

```yaml
plan_unit_id: SCS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control owns three exact backend-native checkpoint commands through its one DRY command family plus a typed
  permission decision, and normalizes five Project checkout compatibility spellings to existing exact Source Control
  targets before policy and dispatch. New checkpoint commands remain handler_unavailable; aliases receive no second
  handler, policy evaluation, wiring row, receipt family, or EventRecord.
gui_related: true
gui_classification_reason: Checkpoint availability, recovery, disabled reasons, and checkout actions are visible across Source Control, Projects, Settings, Doctor, and palette/API consumers.
depends_on: [SCS-002, SCS-003, SCS-006]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly three checkpoint commands with request/result/error/availability/disabled/permission closure and their sole handlers.
  - Git and Jujutsu checkpoint identities remain backend-native and restore is fenced by writer lease, FileSafe, permission, topology, revision, and checkpoint generation.
  - Exactly five aliases normalize before policy/dispatch to their adjudicated targets with no independent handler or wiring.
  - Restart, race, stale currentness, duplicate/effect-unknown, security, and exact-return negatives fail closed.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, focused Server owner-bundle-B validator]
risk_class: source_control_checkpoint_or_alias_authority_drift
reasoning_tier: high
context_scope: server_command_gap_source_control
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, future Source Control checkpoint native handlers]
node_compile_hint: {mode: source_control_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-98-102, source_ref:server-command-gap-adjudication:rows-150-152]
negative_constraints:
  - Do not conflate Git and Jujutsu checkpoint identity.
  - Do not register a Project checkout alias as a second canonical command or dispatch it to a second handler.
  - Do not claim a native handler, production wiring, runtime execution, or recovery proof from static contracts.
```

## Source-Control Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure assigns the previously unbound neutral commands to exactly one future `SourceControlOperationCoordinator` target each: `cmd.source_control.backend.detect` -> `handlers::source_control::backend_detect`, `cmd.source_control.backend.select` -> `handlers::source_control::backend_select`, and `cmd.source_control.workspace.switch` -> `handlers::source_control::workspace_switch`. They consume the existing `source_control_command_request|source_control_command_result|source_control_command_error|source_control_command_availability|source_control_command_disabled_reason` family in `Plans/source_control_contracts.schema.json`. These planned targets add no executable handler, provider adapter, persistence, event producer, or runtime proof; each remains `handler_unavailable` until exact native dispatcher evidence exists.

### SCS-009 - Neutral Backend And Workspace Sole Future Handlers

```yaml
plan_unit_id: SCS-009
unit_type: command_binding
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: Backend detect, backend select, and workspace switch each have one planned neutral SourceControlOperationCoordinator handler target over the existing owner-DRY source-control command family, without conflating Git and Jujutsu or claiming native execution.
gui_related: true
gui_classification_reason: Source Control setup, workspace switchers, project setup, Settings, Doctor, and palette consumers expose these actions and their exact disabled reasons.
depends_on: [SCS-003, SCS-008]
unblocks: []
acceptance_criteria:
  - Central catalog and production-intent wiring use exactly handlers::source_control::backend_detect, handlers::source_control::backend_select, and handlers::source_control::workspace_switch.
  - Requests preserve backend-native identity, exact topology/revision/currentness, permission, writer-lease where applicable, and exact return settlement.
  - Static target strings do not enable commands or prove native handlers, provider behavior, events, persistence, recovery, or runtime execution.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: source_control_backend_route_split_or_phantom_handler
reasoning_tier: high
context_scope: source_control_neutral_central_binding
implementation_surfaces: [Plans/Source_Control_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:172-182, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#retained_egolite_canonical:cmd.source_control.backend.detect, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#retained_egolite_canonical:cmd.source_control.backend.select, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#retained_egolite_canonical:cmd.source_control.workspace.switch]
negative_constraints:
  - Do not create backend-specific peer primary commands or a second handler for a compatibility alias.
  - Do not treat the planned handler paths as native, runtime, recovery, or provider proof.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 8 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.source_control.diff.open` | `handlers::source_control::diff_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.history.open` | `handlers::source_control::history_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.remote.fetch` | `handlers::source_control::remote_fetch` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.remote.publish` | `handlers::source_control::remote_publish` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.remote.sync` | `handlers::source_control::remote_sync` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.repository.unbind` | `handlers::source_control::repository_unbind` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.workspace.list` | `handlers::source_control::workspace_list` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |
| `cmd.source_control.workspace.open` | `handlers::source_control::workspace_open` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_error` / `Plans/source_control_contracts.schema.json#/$defs/source_control_permission_decision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.source_control.diff.open`, `cmd.source_control.history.open`, `cmd.source_control.remote.fetch`, `cmd.source_control.remote.publish`, `cmd.source_control.remote.sync`, `cmd.source_control.repository.unbind`, `cmd.source_control.workspace.list`, `cmd.source_control.workspace.open`.

Exact sole future handler set: `handlers::source_control::diff_open`, `handlers::source_control::history_open`, `handlers::source_control::remote_fetch`, `handlers::source_control::remote_publish`, `handlers::source_control::remote_sync`, `handlers::source_control::repository_unbind`, `handlers::source_control::workspace_list`, `handlers::source_control::workspace_open`.

### SCS-010 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: SCS-010
unit_type: command_binding
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control System owns exactly 8 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 8 commands and their exact disabled reasons.
depends_on: [SCS-003, SCS-009]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 8-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
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
- Plans/Source_Control_System.md
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

## Product Onboarding Safe History And Online-Copy Addendum - 2026-09-01

### SCS-011 - Independent Local Safe History And Optional Forge Online Copy

```yaml
plan_unit_id: SCS-011
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Product Onboarding projects Source Control as an explicitly local Safe History backend (`git|jujutsu`) plus an
  independent optional forge online-copy provider. A new local Project is created through Project System's
  `cmd.project.new_local {init_git:true}` rather than a nonexistent Source Control init command; detected/selected
  backend binding, account sign-in or verified official signup-page handoff, forge repository list/create,
  backend-native clone/publish, and Project registration remain exact owner-routed operations. Jujutsu is a local
  backend with no Jujutsu account. One user choice dispatches once and a current terminal owner return auto-advances.
gui_related: true
gui_classification_reason: Defines the beginner-facing Source Control setup choices, availability reasons, owner returns, and online-copy/account routes used by Product Onboarding and Settings.
depends_on: [SCS-003, SCS-004, SCS-005]
unblocks: [PWIZ-021]
acceptance_criteria:
  - Safe History copy says it is local and does not imply Git/Jujutsu is disabled or replaced.
  - "`scm_backend=git|jujutsu` and `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|cursor_origin|none` remain independent typed axes with local-only and local-plus-online fixtures."
  - New local Project creation uses `cmd.project.new_local {init_git:true}`; `cmd.source_control.repository.init` has no registration, alias, handler, wiring row, or visible route.
  - Git and Jujutsu retain backend-native clone, bind, publish, revision, workspace, FileSafe, permission, and receipt semantics; FileSafe complements rather than replaces Source Control.
  - Existing-account, sign-in, verified official account-signup page, repository list/create, clone/publish, and Project registration use only their canonical owner commands and exact terminal results.
  - No Git/Jujutsu service account or Git/Jujutsu signup is offered, stored, simulated, or claimed; account flows name the selected forge.
  - Each onboarding option dispatches once; a current terminal owner return auto-advances and no unchanged choice is reconfirmed through preview plus repeated Continue controls.
  - Protected AuthBrowserSession content remains human-only and absent from agents, adapters, capture, logs, receipts, persistence, and concept evidence.
  - Browser-concept simulation never claims a real provider account, repository creation, push, production handler, native Slint binding, or readiness.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future owner-return and protected-auth runtime fixtures]
risk_class: onboarding_local_history_forge_conflation_or_false_account_claim
reasoning_tier: high
context_scope: onboarding_source_control_setup
implementation_surfaces: [Plans/Source_Control_System.md, Plans/Planning_Wizard.md, Plans/product_onboarding_contracts.schema.json, future Product Onboarding native controller]
node_compile_hint: {mode: source_control_onboarding_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/FinalGUISpec.md#F3-520, user-correction:2026-09-01-safe-history-source-control-accounts]
negative_constraints:
  - Do not conflate local Safe History with an online backup or forge repository.
  - Do not claim Git or Jujutsu has a service account.
  - Do not mint cmd.source_control.repository.init.
  - Do not automate or inspect protected account signup/authentication browser content.
  - Do not require redundant confirmation of an unchanged choice.
  - Do not promote concept simulation into native or production evidence.
```

## Product-source acquisition and safety addendum - 2026-09-01

### SCS-012 - Local history, FileSafe, hosted binding, and source-transport separation

```yaml
plan_unit_id: SCS-012
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Product Onboarding always treats local Git or Jujutsu Safe History, FileSafe recovery, optional hosted forge binding,
  Project source acquisition, and backup restore as separate decisions. Git and Jujutsu require no service account.
  FileSafe complements the selected local backend. A hosted copy is Ready only when an explicit verified forge account
  and explicit repository binding both exist. Local, mounted, and SSH project-source transports and the independently
  selected restore transport preserve exact Project, Host, Environment, Source Location, repository, and backend identity.
gui_related: true
gui_classification_reason: Defines the beginner-facing relationship among the four Project entry routes, Safe History, FileSafe, hosted copy, and Advanced SSH source transport.
depends_on: [SCS-001, SCS-002, SCS-003, SCS-011, FGI-001]
unblocks: [PWIZ-024]
acceptance_criteria:
  - Start a new project, Open a folder here, Bring one from online, and Restore a backup remain four distinct Product entry intents and do not collapse into one ambiguous path field.
  - Safe History selects exactly `scm_backend=git|jujutsu` locally and remains valid with `forge_provider=none`; neither backend offers or requires a Git/Jujutsu service account.
  - FileSafe is an independent complementary safety decision around risky changes and restore points; it neither replaces local history nor implies an online copy.
  - Optional hosting is independent from the local backend and is not Ready until the Forge owner returns both a current verified account identity and an exact repository binding; `already_connected` means select and verify both and is never a no-op.
  - Open a folder here may use a local path, an OS-mounted SMB/NFS share, or Advanced SSH transport. Source Control consumes the Project/Storage-owned Source Location and transport result and does not implement a file server, mount manager, or SSH authority.
  - Restore a backup carries an independent backup source and `backup_transport=local|mounted|ssh`; choosing a source folder or network Storage path never silently becomes the restore source.
  - Every repository operation still resolves exact Project, Home Server, Execution Host, Execution Environment, Source Location, `repo_id`, backend-native workspace/revision, optional forge binding, leases, currentness, Permissions, FileSafe, and idempotency.
  - Pre-Review onboarding choices are draft-only; backend selection, clone/fetch/publish, credential use, filesystem mutation, and repository binding dispatch only through their canonical owners after confirmation.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future local/mounted/SSH source and independent restore-transport fixtures]
risk_class: local_history_hosting_or_transport_conflation
reasoning_tier: high
context_scope: onboarding_source_control_and_source_transport
implementation_surfaces: [Plans/Source_Control_System.md, future source-control facade, future Product Onboarding owner adapter]
node_compile_hint: {mode: source_control_onboarding_acquisition_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-project-source-and-safe-history-semantics, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
preserved_exact_tokens: [Safe History, FileSafe, Git, Jujutsu, forge_provider, already_connected, local, mounted, SSH]
negative_constraints:
  - Do not require a forge for local Safe History.
  - Do not call FileSafe a replacement for Git or Jujutsu.
  - Do not treat account verification without repository binding as hosted-copy readiness.
  - Do not conflate project source, network Storage, and backup restore transports.
  - Do not move Project, Storage, Backup/Restore, Forge, credential, or SSH ownership into Source Control.
  - Do not dispatch source-control or filesystem work before Review confirmation.
```

## Forgejo/Gitea And Independent Automation Propagation - 2026-09-01

### SCS-013 - Distinct Hosted Providers And Forge-Owned Automation Reference

```yaml
plan_unit_id: SCS-013
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control admits Forgejo and Gitea as distinct forge_provider values while retaining exactly git and
  jujutsu as local backends. RepositoryContext carries RepositoryForgeBinding as repository-hosting authority and
  may carry a separate automation_binding_ref owned by Forge Integrations; the automation service, provider,
  instance, and account may differ from the repository host and are never inferred from a remote named origin.
  Source Control links current checks and automation context to the sole repository_automation / Actions & Pipelines
  shell without owning that shell, provider adapters, or automation commands.
gui_related: true
gui_classification_reason: The contract controls provider-aware Source Control context and its visible handoff to the separate Actions & Pipelines shell.
depends_on: [SCS-001, SCS-002, SCS-005, SCS-011, SCS-012, FGI-012]
unblocks: []
acceptance_criteria:
  - Forgejo and Gitea validate as separate provider identities for Git and Jujutsu contexts and never validate through forgejo_or_gitea.
  - RepositoryContext may omit automation_binding_ref, bind automation on the same forge, or reference an automation service on a different host/account without changing RepositoryForgeBinding.
  - API-disabled/Git-ready and expired-forge-auth/Git-SSH-ready fixtures keep fetch and publish available while only hosted/API actions require repair.
  - Self-hosted inputs and owner projections retain normalized HTTPS/API paths, custom SSH port, scoped private-CA ref, known-host proof, product/version/API-schema, independent Git/API/Actions state, permission and currentness refs, and no secret bytes.
  - Credentials and Authorization are stripped on redirect-origin change; localhost/metadata targets fail closed without explicit existing policy; FileSafe and execution-time currentness remain mandatory for local writes.
  - repository_automation is the sole canonical automation panel identity; github_actions is migration-read only and no remote name fabricates an Origin Actions service.
  - Static Plans, schema, fixtures, command targets, or wiring do not establish adapters, native handlers, runtime behavior, events, security proof, Slint rendering, readiness, or certification.
validation_surfaces:
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - Plans/forge_integration_contracts.schema.json
  - Plans/forge_integration_contract_fixtures.json
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future Forgejo/Gitea transport/API/security/currentness and repository-automation handoff tests
risk_class: source_control_forge_identity_or_automation_authority_conflation
reasoning_tier: high
context_scope: forgejo_gitea_source_control_and_automation_reference
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future source-control facade]
node_compile_hint: {mode: cross_owner_contract_propagation_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Forge_Integrations.md#FGI-012, source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md]
preserved_exact_tokens: [forgejo, gitea, RepositoryForgeBinding, AutomationBinding, automation_binding_ref, repository_automation, "Actions & Pipelines", github_actions, FileSafe]
negative_constraints:
  - Do not collapse Forgejo and Gitea or infer either from repository names, remote names, URLs, or display labels.
  - Do not infer AutomationBinding from RepositoryForgeBinding or move Forge-owned adapter/automation semantics into Source Control.
  - Do not add a second automation shell, forge-specific rail panel, or provider-specific Source Control runtime.
  - Do not emit a new EventRecord family; owner receipts and expected_event_types=[] remain event-silent until Event Authority acts.
  - Do not claim runtime, native, security, visual, or readiness evidence from static contract propagation.
```

## Backup Source Closure And Restore Reconciliation - 2026-09-01

### SCS-014 - Backup Closure, Rebind, Merge, Remote Validation, And Owner Routes

```yaml
plan_unit_id: SCS-014
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control supplies Backup with backend-native source-closure truth and capture-barrier/GC-fence evidence;
  Backup Restore remains owner of bytes, manifests, RestoreRun, staging, activation, and rollback. Every restored
  repository is verified in an isolated boundary before activation. Restore-as-new creates a new Project/repository
  binding while preserving an external repository identity only as non-authoritative lineage until explicit owner
  rebind and remote validation. In-place or selective restore never performs an implicit byte merge: it binds an exact
  target revision and recovery point, delegates backend-native merge/reconciliation, and records collision/conflict
  receipts before activation. Remote validation is bounded and read-only, uses fresh trust/currentness and credential
  authority, and never pushes, publishes, fans out, or binds hosted automation. Ordinary restore activates no restored
  credential, helper, hook, extraHeader, URL user-info, unsafe include, or secret byte; it creates sanitized inactive
  configuration plus reconnect/owner-validation state. RepositoryForgeBinding and Forge-owned AutomationBinding remain
  separate after restore.
gui_related: true
gui_classification_reason: Source Control and JJ History expose Backup browse/compare pivots, rebind/merge blockers, remote-validation state, and exact collision/conflict recovery routes.
depends_on: [SCS-002, SCS-003, SCS-006, SCS-013, BRS-002, BRS-003, BRS-006, BRS-007, BRS-014, BRS-016, JJI-005]
unblocks: []
acceptance_criteria:
  - A source-inclusive capture binds one BackupManifest/BackupRepositoryBinding reference, exact RepositoryContext/native revision, source layout, capture barrier, GC/prune/rewrite fence, workspace/dependency closure, dirty/approved-untracked/LFS/submodule/alternate/shared-store state, missing dependencies, and a source-closure receipt.
  - Complete source closure rejects a lost barrier/fence or any missing dependency; partial/blocked truth never receives a complete Git/JJ history badge and the prior complete recovery point remains selectable.
  - Restore-as-new allocates new PM Project/repository/workspace identity; copied external forge identity is lineage only until Source Control plus the Forge owner revalidate and explicitly bind it, and automation_binding_ref is independently absent or Forge-resolved.
  - In-place/selective restore binds the immutable Backup snapshot/capture set, current target RepositoryContext/revision, verified recovery point, merge preview/currentness, and backend-native terminal receipt; collision, conflict, stale target, or effect-unknown state blocks activation or routes to exact owner recovery.
  - Remote validation distinguishes not requested, offline/unverified, identity verified but credentials missing, bounded fetch/read verified, write capability checked without write, identity mismatch, and trust/currentness blocked; it never emits a push/publish or treats a successful process exit as remote truth.
  - Ordinary restore yields Sign-in Required or External Reattachment Required when credentials were excluded. Restored non-secret credential references, including an opt-in portable envelope reference, require the credential/profile owner to revalidate portability, account, scope, trust, and a fresh operation lease before use.
  - Mutable Git/JJ configuration is sanitized and inactive by default; credential-bearing URLs, helpers, extraHeaders, unsafe includes, filters/diff drivers, hooks, and raw private material are removed or quarantined with explicit reconnect/review refs while immutable source history remains unchanged and historical-secret warnings remain visible.
  - Backup browse/compare stays on `cmd.backup.browse` and `cmd.backup.file.compare`; neutral rebind/status/remote validation stays on existing `cmd.source_control.repository.bind`, `cmd.source_control.status.refresh`, and `cmd.source_control.remote.fetch`; Jujutsu operation verification stays with its owner; Project registration, Forge binding, credentials, FileSafe, and AutomationBinding stay with their named owners. No `cmd.source_control.backup.*` or private restore handler is admitted.
  - The static source-closure and restore-reconciliation records are receipt-only with `expected_event_types=[]`; every referenced command retains its independently truthful availability, including `handler_unavailable`, and these records create no EventRecord, handler, adapter, native execution, remote call, security proof, visual proof, or readiness evidence.
validation_surfaces:
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - Plans/jujutsu_integration_contracts.schema.json
  - Plans/jujutsu_integration_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/backup_restore_system_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future clean-host closure, GC race, merge/currentness, remote trust, credential reattachment, unsafe-config, collision/conflict, and rollback tests
risk_class: incomplete_source_recovery_or_implicit_remote_mutation
reasoning_tier: high
context_scope: backup_source_closure_and_restore_reconciliation
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future SourceSnapshotAdapter and GitJJClosureValidator]
node_compile_hint: {mode: cross_owner_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:SCM-001-SCM-009
  - source_ref:packet:2026-09-01:BKP-005-BKP-008
  - source_ref:packet:2026-09-01:BKP-011-BKP-012
  - source_ref:packet:2026-09-01:REST-005-REST-009
  - Plans/Backup_Restore_System.md#BRS-002
  - Plans/Backup_Restore_System.md#BRS-003
  - Plans/Backup_Restore_System.md#BRS-006
  - Plans/Backup_Restore_System.md#BRS-014
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.3
preserved_exact_tokens: [BackupManifest, BackupRepositoryBinding, capture barrier, GC fence, RestoreRun, Restore as New, Sign-in Required, External Reattachment Required, RepositoryForgeBinding, AutomationBinding, "expected_event_types=[]"]
negative_constraints:
  - Do not move BackupManifest, RestoreRun, activation, rollback, credential custody, Forge adapters, or AutomationBinding into Source Control.
  - Do not activate restored credentials, hooks, helpers, filters, unsafe includes, extraHeaders, URL user-info, or configuration from ordinary source-history backup.
  - Do not infer a remote, account, forge, automation service, rebind, merge, or successful write from restored config, origin text, matching names, or shared commits.
  - Do not merge into an active repository, select latest, push, publish, resume Goals, or run source hooks during restore validation.
  - Do not claim runtime, native, remote, security, visual, or readiness evidence from static Plans/schema/fixture validation.
```

## Operation Capability, Remote Effects, And Routing Depth Repair - 2026-09-02

### SCS-015 - Effective Capability, Remote Target, And Native Backend Semantics

```yaml
plan_unit_id: SCS-015
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Each fetch, publish, review, merge, CI, or local mutation computes one EffectiveOperationCapability from
  product support, adapter implementation, instance/version/tier/feature configuration, credential scopes,
  repository and branch permissions, Puppet Master policy, current locks/revision, and connectivity. Support,
  evidence, freshness, and availability remain separate. The exact availability vocabulary is ready,
  not_configured, auth_required, permission_denied, policy_blocked, protected, unsupported, adapter_missing,
  external_only, temporarily_unavailable, stale, and unknown; unknown is never flattened to unsupported and
  cached permission never authorizes a mutation. The same revisioned decision feeds GUI, palette, natural
  language, agents, Doctor, and dispatch, and execution rechecks it. RemoteOperationTarget binds the captured
  Project, repository, remote, forge instance/account, immutable revision, distinct fetch URL, one or more
  explicit push URLs/refspecs, and review binding. Fan-out is previewed and receipted per target, is not atomic,
  and never duplicates a push to Cursor Origin and its mapped GitHub authority. Git preserves index/HEAD,
  staged/unstaged, commit, stash, branch/upstream, and worktree semantics. Jujutsu preserves current @, stable
  change ID, current commit ID, describe/new/edit/split/squash/abandon, bookmarks/tracking, conflicts,
  workspaces, and operation history without a fake stage area or hidden Git commit/stash. Colocated Git/JJ
  coordinates locks and imports/exports, and backend adoption is an explicit previewed migration.
gui_related: true
gui_classification_reason: Capability states, remediation, remote previews, and backend-native actions directly determine visible controls and labels.
depends_on: [SCS-002, SCS-003, SCS-004, SCS-013, FGI-012]
unblocks: [SCS-016, F3-529]
acceptance_criteria:
  - A stale or invalid capability revision produces a typed recoverable failure at dispatch rather than a cached authorization.
  - Pending operations retain their captured Project, account, repository, remote, and revision when active selection changes.
  - Partial fan-out identifies exactly which ref reached each target; shared commits never establish repository identity and an Origin mirror never triggers duplicate automatic publication.
  - Paired Git/Jujutsu fixtures retain engine-specific labels, commands, graph selection, and operation-history meaning; Jujutsu undo remains distinct from commit history and Backup restore.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future capability revision, remote fan-out, Git/JJ parity, and migration fixtures]
risk_class: stale_capability_cross_target_publication_or_backend_semantic_loss
reasoning_tier: high
context_scope: effective_capability_remote_target_and_native_backend
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future source-control capability resolver and adapters]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:31-37
  - source_ref:corrected-slice:machine__requirements.json__part-003__lines-000401-000620.txt:57-108
preserved_exact_tokens: [ready, not_configured, auth_required, permission_denied, policy_blocked, protected, unsupported, adapter_missing, external_only, temporarily_unavailable, stale, unknown, current @, change ID, commit ID, outcome_unknown]
negative_constraints:
  - Do not turn unavailable or unknown checks into zero failed checks or unsupported.
  - Do not infer a remote, account, forge, or repository from focus, current branch, display path, remote name, or shared commit objects.
  - Do not make multi-remote publication atomic or retry/duplicate an Origin-mirror write automatically.
  - Do not translate Stage or Commit into Jujutsu squash, snapshot, hidden commit, or stash.
  - Do not claim a runtime resolver, adapter, remote effect, or native GUI from static owner/schema/fixture evidence.
```

### SCS-016 - Lossless Remote Records, Effect Reconciliation, Observation, And Agent Routing

```yaml
plan_unit_id: SCS-016
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Provider-neutral projections materialize ReviewRequest, ReviewThread, Check, AutomationDefinition,
  AutomationRun, JobOrStage, LogSegment, and RemoteArtifact with provider kind, service instance, account,
  repository, immutable external ID, raw and normalized status, exact revision/SHA/change version, canonical URL,
  observed time, native object vocabulary, and preserved vendor extensions. Before push, merge, review, comment,
  dispatch, cancel, or rerun, Puppet Master durably records the intended target and preconditions. It uses a
  provider idempotency key when supported; otherwise timeout enters outcome_unknown and exact remote
  reconciliation by object, commit, run, or correlation evidence. It never blindly repeats a non-idempotent
  effect, treats a successful CLI exit as durable remote truth, or force-writes without current expected head,
  lease, and dangerous-action policy. One Home Server observation service owns webhook, polling, cache, and
  subscription work per authorized binding; authenticated replay/order-checked webhooks are optional
  accelerators, polling remains available, and Funnel/public ingress is never enabled merely for webhooks.
  Cache identity includes instance, account, repository, and revision and shared governors bound pagination,
  logs, retries, 429 backoff, and inactive subscriptions. Local filesystem work executes in the Source
  Location's authorized Environment through the selected installation, Worktree/Workspace Manager, and
  FileSafe; hosting API/CLI work uses its exact egress Host, adapter/profile, credential, and explicit repository
  target and returns durable receipts to the Home Server without making a worker Project authority. Agents
  consume compact typed available actions and blockers through the same commands, never raw registry/log
  dumps or UI scraping, and automated publish/merge/CI requires exact task policy, approval, protected-branch
  enforcement, and CI/cost disclosure. A forge runner is not a Puppet Master Execution Host unless separately configured.
gui_related: true
gui_classification_reason: Normalized provider records, outcome-unknown state, freshness, compact agent blockers, and observation truth feed multiple visible surfaces.
depends_on: [SCS-015, SIR-008, FGI-014]
unblocks: [F3-529]
acceptance_criteria:
  - GitLab Merge requests, Azure stages/jobs, and provider-native statuses/IDs/extensions round-trip without GitHub-shaped fabrication.
  - Timeout-after-success cannot duplicate a review, comment, merge, push, or run, and accepted request remains distinct from observed durable outcome.
  - Many Clients and undocked panels share one underlying authorized Home Server observer; duplicate webhook delivery and repository-switch races do not corrupt projections.
  - A TrueNAS Home Server with a WSL checkout and remote Forgejo instance routes filesystem and API phases to their exact environments and credential roles.
  - An unavailable requested agent action yields a supported alternative or structured blocker, never fabricated success, another account, protected-branch bypass, hidden UI scraping, or silent runner registration.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future normalized roundtrip, timeout/reconcile, webhook replay, cache race, routing, and agent-policy fixtures]
risk_class: semantic_flattening_duplicate_external_effect_or_authority_escape
reasoning_tier: high
context_scope: normalized_remote_effect_observation_routing_and_agents
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future record projector, effect reconciler, observer, and route coordinator]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:39-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:47-53
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:55-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:63-69
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:71-77
  - source_ref:corrected-slice:machine__requirements.json__part-003__lines-000401-000620.txt:109-193
preserved_exact_tokens: [ReviewRequest, ReviewThread, Check, AutomationDefinition, AutomationRun, JobOrStage, LogSegment, RemoteArtifact, raw_status, normalized_status, outcome_unknown, Home Server, Source Location, FileSafe, compact typed available-action summaries]
negative_constraints:
  - Do not key remote objects without service instance, account, repository, immutable external ID, and revision identity.
  - Do not flatten native policy, child-pipeline, environment, gate, stage/job, trace, artifact, or vocabulary extensions.
  - Do not retry an outcome-unknown non-idempotent effect before exact reconciliation or treat process exit as remote proof.
  - Do not start per-Client pollers, enable public ingress for a webhook, reuse Git credentials as API credentials, or let a worker become Project authority.
  - Do not expose whole forge registries/logs to agents or silently turn runners into Execution Hosts.
  - Do not claim runtime, remote, security, performance, or readiness proof from static materialization.
```

### SCS-017 - Bounded Backend-Native Source Graph Projection

```yaml
plan_unit_id: SCS-017
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  SourceGraph is one paginated, virtualized Source Control projection under the existing Source Control owner.
  It binds every page to an exact RepositoryContext, repository, workspace, backend, selected revision, projection
  generation, freshness, and stable node/edge references. Git renders a commit graph with parent/merge edges;
  Jujutsu renders stable change identity, current commit identity, rewrites, abandonment, and conflicts without a
  fake staging model. SourceGraph is source history only: Jujutsu operation history and Backup history remain
  separate owner projections and routes. Repository identity comes from RepositoryContext, never display paths or
  shared commits. Pages are capped at 200 nodes, hydration remains bounded, selection anchors survive pagination,
  and stale or partial pages remain visibly stale or partial. The projection introduces no mutation command,
  handler, persistence owner, domain event, repository-identity inference, or runtime/native evidence claim.
gui_related: true
gui_classification_reason: The typed projection is the reusable model for the virtualized Source Control history-and-graph view.
depends_on: [SCS-002, SCS-015, SCS-016, F3-529]
unblocks: [F3-530]
acceptance_criteria:
  - SourceGraph validates only as `pm.source_control.source_graph_projection.v1` with exact repository/workspace/backend/revision identity, currentness, pagination, bounded nodes/edges, stable references, and virtualization fences.
  - Git pages use `git_commit_graph`, null stable-change references, and parent/merge edges; Jujutsu pages use `jujutsu_change_graph` and require a stable change reference for every node.
  - Jujutsu operation history, source history, and Backup history are explicitly separate, and graph navigation never dispatches a restore, undo, source mutation, or publication.
  - RepositoryContext remains identity authority; display paths and shared commits are explicitly non-authoritative.
  - Static schema and fixtures keep `runtime_evidence_claimed=false` and establish no handler, adapter, native Slint behavior, performance result, scenario result, or readiness claim.
validation_surfaces:
  - Plans/source_control_contracts.schema.json#/$defs/source_graph_projection
  - Plans/source_control_contract_fixtures.json
  - Plans/final_gui_interaction_contracts.schema.json#/$defs/post_integration_dry_component_reconciliation
  - Plans/final_gui_interaction_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future native pagination, stale-page, anchor-preservation, large-graph, Git/Jujutsu parity, accessibility, and frame-pacing tests
risk_class: unbounded_graph_hydration_or_source_history_identity_conflation
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future SourceGraph projector and Slint consumer]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/dry_components.json:17-26
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/semantic_gap_plan_rerun/semantic_gap_plan.json
preserved_exact_tokens: [SourceGraph, RepositoryContext, git_commit_graph, jujutsu_change_graph, source history, operation history, Backup history]
negative_constraints:
  - Do not infer repository, workspace, Host, Environment, remote, account, or authority from graph focus, display path, labels, or shared commit objects.
  - Do not merge Jujutsu operation history or Backup history into SourceGraph or invent a cross-owner undo/restore action.
  - Do not eagerly hydrate an unbounded history, lose selection identity between pages, or paint stale/partial data as current.
  - Do not add a SourceGraph command, handler, state owner, EventRecord family, persistence authority, or runtime/native proof from this static closure.
```
