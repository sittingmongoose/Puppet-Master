# Source Control System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes shared envelopes from `Plans/Contracts_V0.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for backend-neutral source-control identity, repository/workspace context, revision fencing, writer and credential leases, setup projections, neutral commands/events/receipts, and the adaptive Source Control surface. Git-specific worktree mechanics remain with `Plans/WorktreeGitImprovement.md`; Jujutsu-native semantics remain with `Plans/Jujutsu_Integration.md`; hosted-service behavior remains with `Plans/Forge_Integrations.md` and provider owners.

## 0. Scope

Puppet Master supports two independent local source-control backends, exactly `scm_backend=git|jujutsu`. Hosted service selection is a separate axis, exactly `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|none`. Forgejo and Gitea are distinct provider and adapter identities; a permanent `forgejo_or_gitea` identity is forbidden. The generic word `provider` is not a durable discriminator for either axis, and bare `origin` is only a Git remote name and never a provider identity.

Every Project-scoped source-control operation resolves an exact Project, Plan/Goal/run/agent lineage when present, Project Home Server, Execution Host, Execution Environment, Source Location, `repo_id`, `scm_backend`, backend-native `workspace_id`, backend-native immutable revision, installation/adapter/credential binding, independent repository-forge binding, optional independent `automation_binding_ref`, expected revision, writer lease, topology generation, permission decision, FileSafe decision, and idempotency key. `RepositoryForgeBinding` remains repository-hosting authority; `AutomationBinding` remains Forge-owned automation authority and may name a different provider, instance, account, or service. Paths, current directories, selected tabs, focused workspaces, remote names, branch labels, and account display names are descriptive only. SCS-025 separately defines read-only pre-registration inspection with application scope, null Project and actual source-context identity; no Project/worktree mutation or provider binding follows from that read.

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
canonical_text: 'Plans/Source_Control_System.md is the sole owner for backend-neutral source-control identity, context,
  commands, leases, setup projections, receipts, and adaptive Source Control behavior. scm_backend and forge_provider
  are independent closed axes; provider, path, focus, remote name, and bare origin are not identity authority. Git, Jujutsu,
  and each forge retain their native owner contracts behind this facade.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
gui_related: true
gui_classification_reason: The owner boundary also determines the adaptive user-visible Source Control and Settings projections.
depends_on:
- PDS-003
- SIR-001
unblocks:
- SCS-002
- SCS-003
- SCS-004
- SCS-005
- SCS-006
- JJI-001
- FGI-001
acceptance_criteria:
- Every repository context carries explicit scm_backend and independent forge_provider.
- Paths, focus, remote names, and display handles cannot satisfy identity fields.
- Git, JJ, and forge fields cannot cross their tagged schema branches.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
risk_class: source_control_parallel_owner_or_identity_drift
reasoning_tier: high
context_scope: neutral_source_control_owner
implementation_surfaces:
- Plans/Source_Control_System.md
- future source-control facade
node_compile_hint:
  mode: source_control_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:SCM-01
- source_ref:scm-origin-reaudit:2026-08-31
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
preserved_exact_tokens:
- scm_backend
- forge_provider
- git
- jujutsu
- none
- repo_id
- workspace_id
negative_constraints:
- Do not overload provider.
- Do not infer a provider from a Git remote named origin.
- Do not infer durable identity from a path or focused UI state.
owner_hints:
- Plans/Source_Control_System.md
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
  SCS-025 adds read-only source-context repository inspection, including unregistered drafts with application scope and null Project. Its typed source variant binds the actual Computer/Server, Host, Environment, transport, locator and trust/currentness evidence; it does not require a fake repository ID or mutation lease. The neutral command census grows only by repository.inspect and remote.add through the adopted source-control command registration, preserving the existing nineteen historical IDs.
gui_related: true
gui_classification_reason: Commands expose visible actions, progress, disabled reasons, and recovery routes.
depends_on: [SCS-002, SIR-008]
unblocks: [SCS-005, JJI-003, JJI-004]
acceptance_criteria:
  - Lease loss or stale generation blocks mutation before effect.
  - Credential leases contain only non-secret refs and expire or revoke independently of account records.
  - >-
    A credential lease carries the transport evidence its transport requires, as a present field rather than an optional
    one. HTTPS requires `use_http_path`, and SSH requires both `known_hosts_receipt_ref` and `forwarding_disabled`. The
    existing true and non-empty constraints are unchanged, opposite-transport fields stay optional, and a non-empty
    known-host reference is evidence that a decision was recorded, not proof that its referent still resolves.
  - Accepted async commands point to ObservableWork; terminal receipts carry before/after native revisions and event refs.
  - Command scopes preserve exact Project/Home Server/Host/Environment/Source Location/repository/backend/workspace/revision/currentness/lease/credential identities as applicable, while path/focus/newest/remote text and generic provider fields cannot satisfy identity.
  - Read-only and pre-repository commands do not inherit mutation-only writer or transport requirements; command-specific requirements are selected only by the exact command_id discriminator.
  - A succeeded result cannot have effect_state=effect_unknown; an effect_unknown error cannot disguise itself as a known effect. Unknown effects keep retry_allowed=false and offer reconciliation without any retry action until effects are known.
  - Every established terminal source_control_command_result carries a non-secret operation_receipt_ref, including blocked, failed, cancelled, recovery_required and effect_unknown. This is not a requirement for pre-attempt availability or error records.
  - The CV-333 central response consumes only the exact source_control_command_result family for these nineteen commands and joins the original typed request's command instance, discriminated scope, applicable lineage, idempotency key and exact return context to the result and its terminal receipt. A local projection or another owner's result cannot substitute for this join.
  - Optional plan_id and goal_id lineage map exactly to the central named_plan_id and goal_id; omission or null cannot authorize an invented non-null central identity. Run and agent lineage stay in the exact owner request/result scope without inventing fields in the closed central identity.
  - Central projection maps succeeded to succeeded, blocked to rejected, failed/cancelled to their same terminal states, and recovery_required/effect_unknown to terminal_unknown and recovery_required. Any unresolved effect requires terminal_unknown regardless of a failed result label. no_effect alone is not an owner-verified no_op verdict.
validation_surfaces: [Plans/source_control_contract_fixtures.json, writer and credential lease fixtures, stale lease tests, prompt suppression tests, command idempotency tests]
risk_class: concurrent_mutation_or_credential_escape
reasoning_tier: high
context_scope: source_control_mutation_authority
implementation_surfaces: [Plans/source_control_contracts.schema.json, future command handlers, future credential broker adapter]
node_compile_hint: {mode: source_control_command_and_lease_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:egolite-register:SCM-008..009
- source_ref:egolite-register:CT-01..02
- source_ref:pldg-20260916-001-jujutsu-continuation-corrections:atom-credential-lease-transport-evidence-109
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [writer lease, generation, epoch, git-credential-puppet-master, credential.useHttpPath=true, pm-ssh, pm-ssh-agent-bridge, ObservableWork, effect_unknown]
negative_constraints: [Do not prompt for ambient credentials., Do not persist private keys or tokens., Do not treat expiry as cleanup proof., Do not retry an effect-unknown mutation automatically.]
owner_hints: [Plans/Source_Control_System.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

The source-control response fixture adapter consumes the central authenticated
normalized request/hash binding; it is not a second request DTO or digest policy.
Native admission must still resolve the actual request, applicable policy/leases,
typed operation receipt and backend evidence. In-memory joins do not prove those
lookups, persistence/recovery, Event Authority admission or native availability.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/source_control_contracts.schema.json, ContractName:Plans/ui_command_response.schema.json

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
  The Computer label names the Server doing the work, while exact Host/Environment remains required for tool installation, native reads and credential readiness. Every inspected route reports actual backend and content limitations through SCS-025/JJI-023; a UI choice never certifies a backend or selects an installation on another Computer.
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
source_lineage:
- source_ref:egolite-register:SCM-004..005
- source_ref:egolite-register:SCM-010..011
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  Amended 2026-10-09 (DL-163): in the left rail each engine's sections show as its own tab strip, one view at a
  time: Git Changes, Worktrees, History and Branches, and JJ Changes, Workspaces, History, Bookmarks and Operation
  Log (Plans/FinalGUISpec.md F3-623 and F3-624). Git keeps the label Worktrees and JJ uses Workspaces; neither
  strip is the other relabelled. Reviews, review versions, threads, checks and publication render together as the
  always-visible Publish and review card at the foot of both views rather than as a tab.
gui_related: true
gui_classification_reason: This unit defines visible panel sections, labels, Settings manager domains, and disabled/degraded presentation.
depends_on: [SCS-002, SCS-003, SCS-004, FGI-003]
unblocks: [SCS-006]
acceptance_criteria:
  - No backend or forge receives a dedicated Activity Bar panel.
  - Git and JJ fixtures expose only compatible sections and provider-native PR or MR wording.
  - Source Control may link to the selected automation binding but does not render a second pipeline shell or infer automation from the repository host.
  - >-
    Bookmark controls disclose their scope in ordinary words, the owner rule set in DL-057. The bookmark state
    vocabulary is exactly `synced`, `unsynced`, `tracked per remote`, `combined` and `absent`. Every control and
    confirmation names the remotes it affects before dispatch: untrack on a combined bookmark confirms every remote by
    name, untrack on one unsynced remote confirms that remote, rename on a tracking bookmark discloses that it untracks
    first, and push and fetch say whether they reach all remotes or one. Delete-local and forget-remote never share one
    control. Pseudo-remotes and non-fetchable remotes are not presented as ordinary remotes, and an unsynced, untracked
    or absent reference is never folded silently into a combined chip. This adds no command: forget-remote stays out of
    the frozen Jujutsu inventory, and the disclosure is carried by the confirmation record the existing commands
    already require, in its `disclosed_remote_scope` field - `no_remote`, `one_remote` or `all_remotes` - and its
    `disclosed_remote_identity_refs` list.
  - >-
    The five bookmark words name one axis, a bookmark's scope across its remotes (DL-163). A conflicted bookmark
    (JJI-019) and a bookmark deleted here while a remote still has it are separate states shown beside that word,
    not additions to it, and a bookmark on the current change says so; no bookmark is called current. Rename and
    delete confirmations are built from the bookmark's own remote set: rename says it renames here only, names every
    remote where the old name stays until its deletion is pushed there and says the new name is on no remote until
    pushed; delete names every remote whose copy stays until the deletion is pushed; a bookmark on no remote says
    that nothing on any remote changes.
  - The source-control manager is the unique operational destination; browser-scm remains a non-owning dependency summary.
validation_surfaces: [source_control_projection fixtures, future Slint panel fixtures, Settings search and route dedupe fixtures]
risk_class: gui_backend_or_owner_misrepresentation
reasoning_tier: high
context_scope: source_control_gui_and_settings
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, future Source Control Slint components]
node_compile_hint: {mode: adaptive_source_control_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01, source_ref:egolite-register:UI-03, source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-bookmark-disclosure-dl057, 'Plans/Decision_Log.md#DL-163 (2026-10-09; per-engine tab strips, footer card, bookmark state axes)']
preserved_exact_tokens: [Changes, Workspaces, History, Git Branches, JJ Bookmarks, Review Versions, Threads, current checks, Source of Truth, Mirror Health, repository_automation, "Actions & Pipelines", github_actions, Diagnostics and Receipts, synced, unsynced, tracked per remote, combined, absent, disclosed_remote_scope, disclosed_remote_identity_refs]
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
cmd.source_control.repository.inspect
cmd.source_control.remote.add
```

The historical v1 generic command scope retains those exact nineteen IDs. The scope-aware successor admits only those IDs plus cmd.source_control.repository.inspect and cmd.source_control.remote.add as defined by SCS-025. It preserves exact Project, Project Home Server, Execution Host, Execution Environment, Source Location, topology generation, repository context, `repo_id`, `scm_backend`, backend-native `workspace_id`, backend-native expected revision, currentness generation, writer lease, credential lease, transport, independent `forge_provider` binding, and checkpoint identity/generation fields as applicable. `backend.detect` and `backend.select` are exact-environment pre-repository branches; status/diff/history/workspace-list/open and checkpoint inspect are read/currentness branches without a fabricated writer lease; mutation, checkpoint create/restore, and remote branches add the exact writer or credential authority they require. Closed `additionalProperties` scopes structurally reject path/focus/newest-record/remote-text/generic-provider substitution.

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

The neutral credential lease records that binding rather than assuming it. An HTTPS lease requires `use_http_path`, and an SSH lease requires both `known_hosts_receipt_ref` and `forwarding_disabled`; an omitted field is not an unconstrained field. The existing true/non-empty value constraints are unchanged, the opposite transport's fields stay optional, and this adds no broker, raw askpass path, secret-bearing field, persisted record, or ambient fallback.

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

Source Control is backend- and forge-adaptive, not Git-hardcoded. It never gains a dedicated JJ, GitLab, Azure DevOps, Bitbucket, or a provider-specific rail item or panel. Human text uses Branches for Git and Bookmarks for JJ; PR or MR follows the effective forge. Underscore enums, hashes, operation IDs, command IDs, raw paths, credential refs, lease IDs, and adapter protocol details remain in Technical Details only.

Every control dispatches one registered command. Disabled controls show an exact human reason and one or more allowed recovery actions. No spinner or elapsed timer invents work progress; setup, fetch, sync, publish, review, pipeline, mirror, and repair rows render `ObservableWork`.

### 4.3 Settings projection

The `source-control` manager domains are exactly **Local Tools**, **Repositories**, **Accounts & Sign-In**, **Hosting Services**, **Defaults**, **Automation**, **Safety**, **Advanced**, and **Diagnostics & Receipts**. It supports search/filter, connect/add, resource/account/repository rows, Details, requested/effective state, and loading/empty/error/managed/unavailable/needs-attention/diagnostic/receipt states.

`browser-scm` is only a Settings dependency summary routing into `source-control`; it owns no duplicate SCM settings or setup workflow. Ordinary Settings never reveal secrets or internal IPC addresses.

### 4.4 Setup flow

Setup follows cached state -> exact Host/Environment discovery -> tool availability/reuse/explicit install -> separate sign-in or official page -> safe validation -> repository and hosted container selection -> capability probe -> binding -> **Ready**, **Ready with limits**, **Needs attention**, or **Not available**. The shared Integration Runtime performs installation and maintenance; Source Control supplies the capability need and renders the result.

Product Onboarding projects this flow as two independent beginner-facing choices. `scm_backend=git|jujutsu` is the local Safe History backend on the selected work computer. `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|none` is an optional online-copy binding. Local history and an online copy may coexist; selecting a forge never disables local Git/Jujutsu, and selecting local-only never disables Source Control. FileSafe safe points complement Source Control and do not replace Git or Jujutsu. Git and Jujutsu are local tools and have no service accounts; GitHub, GitLab, Azure DevOps, Bitbucket, Forgejo and Gitea are optional services where an account and online repository may exist. Forgejo and Gitea setup preserves distinct typed instance, API, SSH, trust, product/version/schema, Git/API/Actions-state, credential-reference, and currentness fields; an API-disabled instance may still be Git-ready. No Git account, Jujutsu account, Git/Jujutsu signup, or Git/Jujutsu authentication route exists.

For a new local Project, the reviewed commit uses Project System's `cmd.project.new_local` and its exact current setup binding. Project System resolves the confirmed draft's history choice under PJCT-009: Git and Jujutsu are equal, existing verified history wins, and a folder without a repository still initializes the reviewed Git-or-Jujutsu backend. No no-history setup option is offered. A consumer must not force `init_git:true` over a reviewed Jujutsu choice or silently substitute Git for Jujutsu. After the owner returns the actual identities, Source Control may detect, select, and bind the requested admitted local backend with `cmd.source_control.backend.detect`, `cmd.source_control.backend.select`, and `cmd.source_control.repository.bind`. `cmd.source_control.repository.init` does not exist and MUST NOT be registered, aliased, dispatched, or shown. Selecting Jujutsu is allowed only when the Jujutsu owner can establish or bind the exact certified repository/workspace state; a missing owner route is `handler_unavailable`/`not_available` with a human recovery route, never an inferred initialization.

An optional online copy uses the common integration, account, forge, and backend owners: existing accounts use `cmd.integration.connection.add` plus `cmd.auth_profile.sign_in`; people without an account may use `cmd.auth_profile.open_official_page` to visit the verified official provider signup page, then return for owner verification/sign-in. Puppet Master never claims to create the provider account. Repository discovery/creation uses `cmd.forge.repository.list|create`; ordinary Git clone/publish uses `cmd.source_control.repository.clone {scm_backend=git}` and `cmd.source_control.remote.publish`; Jujutsu clone/publish remains `cmd.jujutsu.git.clone` and `cmd.jujutsu.git.push`; successful terminal identities feed the exact `cmd.project.add_existing` registration kind. Protected AuthBrowserSession is human-only, non-recordable, non-inspectable, unavailable to agents/adapters, and excluded from capture, logs, receipts, persistence, and concept simulation.

A draft choice is not dispatch. Before Project commit, only bounded read-only source access and individually consented selected-source sign-in/verified official-page work may run through PWIZ-021 and MACS-005. They never create a Project/destination, initialize history, create a repository, clone/import, publish, bind sync, apply Settings or set up unrelated AI providers. Project-scoped IntegrationConnection add/activation requires the actual post-consent reserved Project identity; no fake Project/account/installation is supplied to an older request. Each explicit owner action or reviewed commit is one logical dispatch through the existing owner chain. A current terminal owner result returns through the exact revisioned continuation and advances the branch/stage automatically; Source Control does not require an extra preview confirmation, `Continue when ready`, or second `Continue`. Trust, authentication, privacy, destructive, and restore decisions remain explicit where the owner requires them. Concept fixtures and PMConcept7 previews stay `concept_simulated`/`handler_unavailable` and never claim a real account, repository, push, native handler, or production readiness.

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
canonical_text: 'Product Onboarding projects Source Control as an explicitly local Safe History backend (`git|jujutsu`)
  plus an independent optional forge online-copy provider. A new local Project is created through Project System''s `cmd.project.new_local`
  with the exact reviewed Project-owned setup binding rather than a nonexistent Source Control init command; detected/selected
  backend binding, account sign-in or verified official signup-page handoff, forge repository list/create, backend-native
  clone/publish, and Project registration remain exact owner-routed operations. Jujutsu is a local backend with no Jujutsu
  account. Draft choices do not dispatch; one explicit authorized owner action or reviewed commit dispatches once and
  a current terminal owner return auto-advances.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.
  The same reviewed owner setup binding serves Onboarding and PWIZ-037 New Project, with equal Git/Jujutsu choices and existing verified history taking precedence. PJCT-010 defines the offered non-GitHub create and GitHub/GHES fork chains. The explicit N15 Later journey may set up AI in application scope on the named Computer; that does not waive real-Project requirements for Project-scoped SCM binding.'
gui_related: true
gui_classification_reason: Defines the beginner-facing Source Control setup choices, availability reasons, owner returns,
  and online-copy/account routes used by Product Onboarding and Settings.
depends_on:
- SCS-003
- SCS-004
- SCS-005
unblocks:
- PWIZ-021
acceptance_criteria:
- Safe History copy says it is local and does not imply Git/Jujutsu is disabled or replaced.
- '`scm_backend=git|jujutsu` and `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|none`
  remain independent typed axes with local-only and local-plus-online fixtures.'
- New local Project creation uses `cmd.project.new_local` and honors the confirmed history/backend choice without a consumer-forced
  Git default; `cmd.source_control.repository.init` has no registration, alias, handler, wiring row, or visible route.
- Git and Jujutsu retain backend-native clone, bind, publish, revision, workspace, FileSafe, permission, and receipt
  semantics; FileSafe complements rather than replaces Source Control.
- Existing-account, sign-in, verified official account-signup page, repository list/create, clone/publish, and Project
  registration use only their canonical owner commands and exact terminal results.
- No Git/Jujutsu service account or Git/Jujutsu signup is offered, stored, simulated, or claimed; account flows name
  the selected forge.
- Each explicit authorized owner action or reviewed commit dispatches once; draft options stay local; a current terminal
  owner return auto-advances and no unchanged choice is reconfirmed through preview plus repeated Continue controls.
- Protected AuthBrowserSession content remains human-only and absent from agents, adapters, capture, logs, receipts,
  persistence, and concept evidence.
- Browser-concept simulation never claims a real provider account, repository creation, push, production handler, native
  Slint binding, or readiness.
- Precommit source browsing and selected-source authentication are bounded by PWIZ-021/MACS-005; repository/history/clone/publish/binding
  mutation remains commit-fenced and broad provider setup remains post-Project.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- future owner-return and protected-auth runtime fixtures
- tests/test_pm_onboarding_phases.py
risk_class: onboarding_local_history_forge_conflation_or_false_account_claim
reasoning_tier: high
context_scope: onboarding_source_control_setup
implementation_surfaces:
- Plans/Source_Control_System.md
- Plans/Planning_Wizard.md
- Plans/product_onboarding_contracts.schema.json
- future Product Onboarding native controller
node_compile_hint:
  mode: source_control_onboarding_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/FinalGUISpec.md#F3-520
- user-correction:2026-09-01-safe-history-source-control-accounts
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  Product Onboarding always treats local Git or Jujutsu Safe History, FileSafe recovery, optional hosted forge binding, Project source acquisition, and backup restore as separate decisions. Git and Jujutsu require no service account. FileSafe complements the selected local backend. A hosted copy is Ready only when an explicit verified forge account and explicit repository binding both exist. Local, mounted, and SSH project-source transports and the independently selected restore transport preserve exact Project, Host, Environment, Source Location, repository, and backend identity.
  All local, Server, SSH/PM, SMB/NFS and mounted sources consume SCS-025 inspection before reviewed registration or acquisition. A found remote remains evidence until explicit account/repository verification and chosen bind. Acquisition provenance names online_import or fork_contribute independently of git_clone/jujutsu_clone registration and hosting. A duplicate registered-copy match offers Open on its named Computer without blocking this copy.
gui_related: true
gui_classification_reason: Defines the beginner-facing relationship among the four Project entry routes, Safe History,
  FileSafe, hosted copy, and Advanced SSH source transport.
depends_on:
- SCS-001
- SCS-002
- SCS-003
- SCS-011
- FGI-001
unblocks:
- PWIZ-024
acceptance_criteria:
- Start a new project, Open a folder here, Bring one from online, and Restore a backup remain four distinct Product
  entry intents and do not collapse into one ambiguous path field.
- Safe History selects exactly `scm_backend=git|jujutsu` locally and remains valid with `forge_provider=none`; neither
  backend offers or requires a Git/Jujutsu service account.
- FileSafe is an independent complementary safety decision around risky changes and restore points; it neither replaces
  local history nor implies an online copy.
- Optional hosting is independent from the local backend and is not Ready until the Forge owner returns both a current
  verified account identity and an exact repository binding; `already_connected` means select and verify both and
  is never a no-op.
- Open a folder here may use a local path, an OS-mounted SMB/NFS share, or Advanced SSH transport. Source Control
  consumes the Project/Storage-owned Source Location and transport result and does not implement a file server,
  mount manager, or SSH authority.
- Restore a backup carries an independent backup source and `backup_transport=local|mounted|ssh`; choosing a source
  folder or network Storage path never silently becomes the restore source.
- Every repository operation still resolves exact Project, Home Server, Execution Host, Execution Environment, Source
  Location, `repo_id`, backend-native workspace/revision, optional forge binding, leases, currentness, Permissions,
  FileSafe, and idempotency.
- Precommit draft choices may request bounded source reads and separately consented selected-source account authentication;
  backend mutation, clone/fetch/publish, filesystem mutation and repository/sync binding require the reviewed commit
  and their canonical owners.
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- future local/mounted/SSH source and independent restore-transport fixtures
risk_class: local_history_hosting_or_transport_conflation
reasoning_tier: high
context_scope: onboarding_source_control_and_source_transport
implementation_surfaces:
- Plans/Source_Control_System.md
- future source-control facade
- future Product Onboarding owner adapter
node_compile_hint:
  mode: source_control_onboarding_acquisition_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- user-correction:2026-09-01-project-source-and-safe-history-semantics
- Plans/product_onboarding_contracts.schema.json
- Concepts/pm7-tools/onboarding_cinematic_source.py
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- Safe History
- FileSafe
- Git
- Jujutsu
- forge_provider
- already_connected
- local
- mounted
- SSH
negative_constraints:
- Do not require a forge for local Safe History.
- Do not call FileSafe a replacement for Git or Jujutsu.
- Do not treat account verification without repository binding as hosted-copy readiness.
- Do not conflate project source, network Storage, and backup restore transports.
- Do not move Project, Storage, Backup/Restore, Forge, credential, or SSH ownership into Source Control.
- Do not dispatch source-control/filesystem mutations before reviewed commit, or widen selected-source read/auth
  permission into broad provider or Project authority.
```

## Forgejo/Gitea And Independent Automation Propagation - 2026-09-01

### SCS-013 - Distinct Hosted Providers And Forge-Owned Automation Reference

```yaml
plan_unit_id: SCS-013
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Source Control admits Forgejo and Gitea as distinct forge_provider values while retaining exactly git
  and jujutsu as local backends. RepositoryContext carries RepositoryForgeBinding as repository-hosting authority and
  may carry a separate automation_binding_ref owned by Forge Integrations; the automation service, provider, instance,
  and account may differ from the repository host and are never inferred from a remote named origin. Source Control links
  current checks and automation context to the sole repository_automation / Actions & Pipelines shell without owning
  that shell, provider adapters, or automation commands.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
gui_related: true
gui_classification_reason: The contract controls provider-aware Source Control context and its visible handoff to the
  separate Actions & Pipelines shell.
depends_on:
- SCS-001
- SCS-002
- SCS-005
- SCS-011
- SCS-012
- FGI-012
unblocks: []
acceptance_criteria:
- Forgejo and Gitea validate as separate provider identities for Git and Jujutsu contexts and never validate through
  forgejo_or_gitea.
- RepositoryContext may omit automation_binding_ref, bind automation on the same forge, or reference an automation service
  on a different host/account without changing RepositoryForgeBinding.
- API-disabled/Git-ready and expired-forge-auth/Git-SSH-ready fixtures keep fetch and publish available while only hosted/API
  actions require repair.
- Self-hosted inputs and owner projections retain normalized HTTPS/API paths, custom SSH port, scoped private-CA ref,
  known-host proof, product/version/API-schema, independent Git/API/Actions state, permission and currentness refs, and
  no secret bytes.
- Credentials and Authorization are stripped on redirect-origin change; localhost/metadata targets fail closed without
  explicit existing policy; FileSafe and execution-time currentness remain mandatory for local writes.
- repository_automation is the sole canonical automation panel identity; github_actions is migration-read only and no remote name creates a hosted automation service.
- Static Plans, schema, fixtures, command targets, or wiring do not establish adapters, native handlers, runtime behavior,
  events, security proof, Slint rendering, readiness, or certification.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
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
implementation_surfaces:
- Plans/Source_Control_System.md
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- future source-control facade
node_compile_hint:
  mode: cross_owner_contract_propagation_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Forge_Integrations.md#FGI-012
- source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
preserved_exact_tokens:
- forgejo
- gitea
- RepositoryForgeBinding
- AutomationBinding
- automation_binding_ref
- repository_automation
- Actions & Pipelines
- github_actions
- FileSafe
negative_constraints:
- Do not collapse Forgejo and Gitea or infer either from repository names, remote names, URLs, or display labels.
- Do not infer AutomationBinding from RepositoryForgeBinding or move Forge-owned adapter/automation semantics into Source
  Control.
- Do not add a second automation shell, forge-specific rail panel, or provider-specific Source Control runtime.
- Do not emit a new EventRecord family; owner receipts and expected_event_types=[] remain event-silent until Event Authority
  acts.
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
  Source Control supplies Backup with backend-native source-closure truth, capture barrier evidence and GC fence
  evidence; Backup Restore remains owner of bytes, manifests, RestoreRun, staging, activation, and rollback. Every restored
  repository is verified in an isolated boundary before activation. Restore as New creates a new Project/repository
  binding while preserving an external repository identity only as non-authoritative lineage until explicit owner
  rebind and remote validation. In-place or selective restore never performs an implicit byte merge: it binds an exact
  target revision and recovery point, delegates backend-native merge/reconciliation, and records collision/conflict
  receipts before activation. Remote validation is bounded and read-only, uses fresh trust/currentness and credential
  authority, and never pushes, publishes, fans out, or binds hosted automation. Ordinary restore activates no restored
  credential, helper, hook, extraHeader, URL user-info, unsafe include, or secret byte; it creates sanitized inactive
  configuration plus reconnect/owner-validation state. RepositoryForgeBinding and Forge-owned AutomationBinding remain
  separate after restore.
  The BRS-006 rewrite applies to PM-internal identities and references; external forge host/account/repository identifiers retain their external meaning only as non-authoritative lineage until fresh revalidation. N13 converted chat history and N25 destination records join Project Backup through their owners without moving source approval, credential or execution authority.
gui_related: true
gui_classification_reason: Source Control and JJ History expose Backup browse/compare pivots, rebind/merge blockers, remote-validation state, and exact collision/conflict recovery routes.
depends_on: [SCS-002, SCS-003, SCS-006, SCS-013, BRS-002, BRS-003, BRS-006, BRS-007, BRS-014, BRS-016, JJI-005]
unblocks: []
acceptance_criteria:
  - A source-inclusive capture binds one BackupManifest/BackupRepositoryBinding reference, exact RepositoryContext/native revision, source layout, capture barrier, GC/prune/rewrite fence, workspace/dependency closure, dirty/approved-untracked/LFS/submodule/alternate/shared-store state, missing dependencies, and a source-closure receipt.
  - Complete source closure rejects a lost barrier/fence or any missing dependency; partial/blocked truth never receives a complete Git/JJ history badge and the prior complete recovery point remains selectable.
  - >-
    A held fence states what it covered, not only that it held. `gc_fence_outcome` `held_during_capture` carries
    `gc_fence_covered_paths`, which enumerates the writer paths the fence covered - the native JJ process
    (`native_jj_process`), a colocated Git writer (`colocated_git`), and any registered external or automation path
    (`registered_external_automation`) - each reported `covered`, `uncovered` or `unknown`, and each covered path naming
    the evidence that it was covered. A fence claim that enumerates no path is rejected. Where any known path is reported
    `uncovered` or `unknown` the closure is `partial` with that path named, because a fence held truthfully over one writer while another
    was never covered is a true sentence about an incomplete capture.
  - >-
    The isolated boundary this unit requires before activation is a resolved boundary, not an asserted one. Where the
    backend is Jujutsu, verification admits `isolated_verification` only when every store location pointer the capture
    followed was resolved again inside the boundary and recorded `resolved_inside_boundary` true, under JJI-008's
    `store_pointer_resolution` rule. A pointer that resolves outside the boundary is never followed and surfaces
    through the existing missing-dependency and blocking receipt refs rather than through a silently narrower closure.
  - >-
    Sanitization reaches inside the native store tree, not only the configuration surface. A restored repository
    activates no entry classified `machine_local` or `ephemeral` under JJI-008's store-entry disposition rule, so a
    restored copy carries no other machine's store identity, and an `unrecognized` entry makes the capture `partial`
    with the entry named rather than complete.
  - >-
    Complete source closure has a decision procedure behind it, not only an end state. Where the backend is Jujutsu,
    the completeness this unit rejects a missing dependency against is decided by JJI-008's `closure_expansion` - its
    verified stages, its four typed blockers and its dependency-safe `materialization_order` - so complete here and
    complete in the native closure record mean the same thing, and a closure carrying any typed blocker never receives
    a complete history badge.
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
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-gc-fence-coverage-c4-07
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-store-pointer-resolution-c4-04
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-store-entry-disposition-c4-06
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-closure-decision-procedure-c4-11
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [BackupManifest, BackupRepositoryBinding, capture barrier, GC fence, RestoreRun, Restore as New, Sign-in Required, External Reattachment Required, RepositoryForgeBinding, AutomationBinding, gc_fence_outcome, held_during_capture, gc_fence_covered_paths, native_jj_process, colocated_git, registered_external_automation, isolated_verification, store_pointer_resolution, resolved_inside_boundary, machine_local, ephemeral, unrecognized, closure_expansion, materialization_order, "expected_event_types=[]"]
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
canonical_text: 'Each fetch, publish, review, merge, CI, or local mutation computes one EffectiveOperationCapability
  from product support, adapter implementation, instance/version/tier/feature configuration, credential scopes, repository
  and branch permissions, Puppet Master policy, current locks/revision, and connectivity. Support, evidence, freshness,
  and availability remain separate. The exact availability vocabulary is ready, not_configured, auth_required, permission_denied,
  policy_blocked, protected, unsupported, adapter_missing, external_only, temporarily_unavailable, stale, and unknown;
  unknown is never flattened to unsupported and cached permission never authorizes a mutation. The same revisioned decision
  feeds GUI, palette, natural language, agents, Doctor, and dispatch, and execution rechecks it. RemoteOperationTarget
  binds the captured Project, repository, remote, forge instance/account, immutable revision, distinct fetch URL, one
  or more explicit push URLs/refspecs, and review binding. Fan-out is previewed and receipted per target, is not atomic,
  and never duplicates a push through an admitted mirror and its mapped authority. Git preserves index/HEAD, staged/unstaged,
  commit, stash, branch/upstream, and worktree semantics. Jujutsu preserves current @, stable change ID, current commit
  ID, describe/new/edit/split/squash/abandon, bookmarks/tracking, conflicts, workspaces, and operation history without
  a fake stage area or hidden Git commit/stash. Preserving a native semantic here is a statement about the backend''s
  meaning, not a promise that a canonical command dispatches it. Colocated Git/JJ coordinates locks and imports/exports,
  and backend adoption is an explicit previewed migration.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.
  Publication consumes the single Permissions admission from PS-146/147/148. YOLO can create the needed repository and push/publish without repeated human yes; Y1 force-with-lease is restricted to a branch PM created for this work, never main/default/protected, and rejects a lost lease. Prune/delete/destructive discard retain ordinary asks unless an exact separately approved build grant covers a verified created resource. No mode changes product support, credentials, FileSafe, current target or backend mutation authority.'
gui_related: true
gui_classification_reason: Capability states, remediation, remote previews, and backend-native actions directly determine
  visible controls and labels.
depends_on:
- SCS-002
- SCS-003
- SCS-004
- SCS-013
- FGI-012
unblocks:
- SCS-016
- F3-529
acceptance_criteria:
- A stale or invalid capability revision produces a typed recoverable failure at dispatch rather than a cached authorization.
- Pending operations retain their captured Project, account, repository, remote, and revision when active selection changes.
- '`merge_editor_available` is owned here and means exactly one thing: Puppet Master''s own built-in structured merge
  editor is present and usable for the selected conflicted file on this Host and Environment. It is not a statement about
  any external merge tool, and the Git conflict-assistant preference that opens an external tool never sets it. The owner
  rule set in DL-056: on a Jujutsu workspace the diff-open, merge-editor-open and Git external-merge-tool preference
  surfaces are read-only or built-in-editor-only, so no external tool is handed a Jujutsu workspace to write into. A
  control disabled by that scoping carries the typed reason `conflict_surface_read_only_on_jujutsu` rather than appearing
  unavailable without explanation, and its safe next action is the value the existing closed vocabulary already has,
  `inspect`; no new safe-next-action value is introduced. The save-back contract for a Jujutsu conflict is deferred until
  the built-in editor''s save path is designed, and until then nothing writes conflict content back through these surfaces.'
- Partial fan-out identifies exactly which ref reached each target; shared commits never establish repository identity
  and a mirror never triggers duplicate automatic publication.
- Split is preserved as a Jujutsu semantic and is not dispatchable today, and canon says both. The canonical command
  `cmd.jujutsu.change.split` expresses only a change id, while the native command with no path arguments opens an interactive
  editor the workbench cannot host, so JJI-003 disables it before effect with `interactive_editor_session_required`.
  The preserved-semantics sentence in this unit is therefore read as expressible-but-not-dispatchable for split until
  a content-selection vocabulary is landed, which is an optional capability outside this correction.
- Paired Git/Jujutsu fixtures retain engine-specific labels, commands, graph selection, and operation-history meaning;
  Jujutsu undo remains distinct from commit history and Backup restore.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- future capability revision
- remote fan-out
- Git/JJ parity
- and migration fixtures
risk_class: stale_capability_cross_target_publication_or_backend_semantic_loss
reasoning_tier: high
context_scope: effective_capability_remote_target_and_native_backend
implementation_surfaces:
- Plans/Source_Control_System.md
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- future source-control capability resolver and adapters
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:15-21
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:23-29
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:31-37
- source_ref:corrected-slice:machine__requirements.json__part-003__lines-000401-000620.txt:57-108
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-conflict-surface-scope-dl056
- source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-no-interactive-editor-session-c4-08
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- ready
- not_configured
- auth_required
- permission_denied
- policy_blocked
- protected
- unsupported
- adapter_missing
- external_only
- temporarily_unavailable
- stale
- unknown
- current @
- change ID
- commit ID
- merge_editor_available
- conflict_surface_read_only_on_jujutsu
- inspect
- cmd.jujutsu.change.split
- interactive_editor_session_required
negative_constraints:
- Do not turn unavailable or unknown checks into zero failed checks or unsupported.
- Do not infer a remote, account, forge, or repository from focus, current branch, display path, remote name, or shared
  commit objects.
- Do not make multi-remote publication atomic or retry/duplicate an admitted-mirror write automatically.
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
  repository, immutable external ID, raw_status and normalized_status, exact revision/SHA/change version, canonical
  URL where the provider publishes one, observed time, native object vocabulary, and preserved vendor extensions. A
  provider can materialize a record with no human-facing page at all, so a record may carry no canonical URL
  provided it states why, and a synthesized portal deep link is admissible only when it is labelled synthesized. Before push, merge, review, comment,
  dispatch, cancel, or rerun, Puppet Master durably records the intended target and preconditions. It uses a
  provider idempotency key when supported; otherwise timeout enters outcome_unknown and exact remote
  reconciliation by object, commit, run, or correlation evidence. It never blindly repeats a non-idempotent
  effect, treats a successful CLI exit as durable remote truth, or force-writes without current expected head,
  lease, and dangerous-action policy. One Home Server observation service owns webhook, polling, cache, and
  subscription work per authorized binding; authenticated replay/order-checked webhooks are optional
  accelerators, polling remains available, and Funnel/public ingress is never enabled merely for webhooks.
  Cache identity includes instance, account, repository, and revision and shared governors bound pagination,
  logs, retries, 429 backoff, and inactive subscriptions. Local filesystem work executes in the
  Source Location's authorized Environment through the selected installation, Worktree/Workspace Manager, and
  FileSafe; hosting API/CLI work uses its exact egress Host, adapter/profile, credential, and explicit repository
  target and returns durable receipts to the Home Server without making a worker Project authority. Agents
  consume compact typed available-action summaries and blockers through the same commands, never raw registry/log
  dumps or UI scraping, and automated publish/merge/CI requires exact task policy, mode or grant authority resolved by PS-146/147/148, protected-branch enforcement, and CI/cost disclosure. Regular asks where required; requested YOLO publication and listed build-grant actions do not add a second human confirmation. A forge runner is not a Puppet Master Execution Host unless separately configured.
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
  - >-
    A record whose provider publishes no human-facing page carries a null canonical URL, a canonical_url_origin of
    absent and a stated url_absent_reason, rather than a synthesized link presented as the provider's own. A Check
    row's normalized status comes from the closed gate vocabulary and keeps requirement_bypassed apart from
    not_applicable, so a status the provider could not produce is not folded into failure.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future normalized roundtrip, timeout/reconcile, webhook replay, cache race, routing, and agent-policy fixtures]
risk_class: semantic_flattening_duplicate_external_effect_or_authority_escape
reasoning_tier: high
context_scope: normalized_remote_effect_observation_routing_and_agents
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future record projector, future effect reconciler, future observer, future route coordinator]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:39-45
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:47-53
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:55-61
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:63-69
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/02_SOURCE_CONTROL_CAPABILITY_MODEL.md:71-77
- source_ref:corrected-slice:machine__requirements.json__part-003__lines-000401-000620.txt:109-193
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [ReviewRequest, ReviewThread, Check, AutomationDefinition, AutomationRun, JobOrStage, LogSegment, RemoteArtifact, raw_status, normalized_status, outcome_unknown, Home Server, Source Location, FileSafe, compact typed available-action summaries, canonical_url_origin, url_absent_reason, requirement_bypassed]
negative_constraints:
  - Do not key remote objects without service instance, account, repository, immutable external ID, and revision identity.
  - Do not flatten native policy, child-pipeline, environment, gate, stage/job, trace, artifact, or vocabulary extensions.
  - Do not present a synthesized deep link as the provider's own canonical URL, and do not leave an absent URL unexplained.
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
  Jujutsu renders stable change identity, current commit identity, rewrites, abandonment, divergence, and conflicts
  without a fake staging model. SourceGraph is source history only: Jujutsu operation history and Backup history remain
  separate owner projections and routes. Repository identity comes from RepositoryContext, never display paths or
  shared commits. Pages are capped at 200 nodes, hydration remains bounded, `node_ref` is unique within a page,
  selection anchors survive pagination, and stale or partial pages remain visibly stale or partial. The projection
  introduces no mutation command,
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
  - >-
    A page is internally consistent, not merely within its per-field bounds. `page.returned_count` equals the number of
    emitted nodes, that count does not exceed the requested `page.page_size`, and `page.page_size` does not exceed the
    200-node cap.
  - >-
    A page whose `currentness.state` is `current` and whose `page.has_more` is true carries a usable continuation, so
    `page.next_cursor_ref` is a non-null reference. Unavailable, partial, and stale pages keep their existing owner
    semantics and are not generalized into this rule.
  - >-
    `node_ref` is unique within one page, the owner rule set in DL-053. Two nodes on the same page cannot share a
    `node_ref`, whether or not they carry the same `revision_ref`; a page never emits the same node row twice. A
    repeated reference breaks stable node identity and selection anchoring however alike the two rows are, so an
    exact duplicate is rejected on the same rule as a conflicting one.
  - >-
    Parent-reference expansion is finite, so a bounded page cannot carry unbounded adjacency behind
    `unbounded_hydration=false`. A node declares at most 32 `parent_refs` in one page, the owner bound set in DL-052.
    A node with more parents sets `parent_refs_truncated=true`, carries the full 32 references, and carries a non-null
    `parent_expansion_cursor_ref`; a node that is not truncated carries a null one. Truncation is only reached, never
    chosen early: a producer may not truncate a parent list before it holds all 32, the owner rule set in DL-054, so
    `parent_refs_truncated=true` always accompanies a full list and a short list always means the node has no more
    parents. A parent may legitimately live on another page; presence in the same page is not required.
  - >-
    The remaining parents of a truncated node are fetched by
    `pm.source_control.source_graph_parent_expansion_request.v1`, a bounded read fenced exactly as page continuation
    is. It carries the same RepositoryContext, repository, workspace, backend, selected revision and projection
    identity as the page that truncated the node, and the page's own `parent_expansion_cursor_ref`. Its
    `projection_currentness` echoes the page's `currentness` field for field, `state`, `projection_generation`,
    `observed_at_utc` and `expires_at_utc`, the owner rule set in DL-054, so the freshness horizon is readable from
    the request alone and nothing about the page's currentness has to be inferred. It is admitted only while that
    projection is `current`, asks for at most 32 references at a time, and claims no mutation, no repository-identity
    authority and no runtime evidence.
  - >-
    A divergent change is representable. More than one visible commit may carry one stable change reference, which is
    ordinary Jujutsu state rather than an error, and a node in that condition reports `node_state` `divergent` instead
    of being mislabelled `normal` or dropped from the page. The surface's Jujutsu `graph_states` list carries
    `divergent` appended after the states it already froze, so the projection's node state and the surface's state
    vocabulary name the same thing and no existing frozen position shifts. The `divergent` state is Jujutsu-only: a Git
    page keeps its existing `normal` or `conflicted` node states. Divergence is reported, never resolved here; the projection
    introduces no convergence command and SCS-017 continues to introduce no mutation command at all.
  - Static schema and fixtures keep `runtime_evidence_claimed=false` and establish no handler, adapter, native Slint behavior, performance result, scenario result, or readiness claim.
validation_surfaces:
  - Plans/source_control_contracts.schema.json#/$defs/source_graph_projection
  - Plans/source_control_contracts.schema.json#/$defs/source_graph_parent_expansion_request
  - Plans/source_control_contract_fixtures.json
  - Plans/final_gui_interaction_contracts.schema.json#/$defs/post_integration_dry_component_reconciliation
  - Plans/final_gui_interaction_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - >-
    The continuation rule and the parent-reference bound are enforced by
    `Plans/source_control_contracts.schema.json`. The count/page-size arithmetic and the in-page `node_ref`
    rule are relational obligations that JSON Schema cannot express; they are enforced by the
    `source_control_contracts` branch of `contract_semantic_failures` in
    `scripts/pm-new-contracts-verify.py`, with one authored negative fixture per rule.
  - future native pagination, stale-page, anchor-preservation, large-graph, Git/Jujutsu parity, accessibility, and frame-pacing tests
risk_class: unbounded_graph_hydration_or_source_history_identity_conflation
reasoning_tier: high
context_scope: bounded_source_graph_projection
implementation_surfaces: [Plans/Source_Control_System.md, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, future SourceGraph projector and Slint consumer]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/dry_components.json:17-26
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/semantic_gap_plan_rerun/semantic_gap_plan.json
  - source_ref:pldg-20260916-001-jujutsu-continuation-corrections:atom-source-graph-page-consistency-107
  - source_ref:pldg-20260916-001-jujutsu-continuation-corrections:q-001
  - source_ref:pldg-20260916-001-jujutsu-continuation-corrections:q-003
  - source_ref:pldg-20260916-001-jujutsu-continuation-corrections:q-004
  - source_ref:pldg-20260916-001-jujutsu-continuation-corrections:q-005
  - Plans/Decision_Log.md#DL-052
  - Plans/Decision_Log.md#DL-053
  - Plans/Decision_Log.md#DL-054
  - source_ref:pldg-20260917-001-jujutsu-continuation4-corrections:atom-jj-divergent-change-representable-c4-02
preserved_exact_tokens: [SourceGraph, RepositoryContext, git_commit_graph, jujutsu_change_graph, source history, operation history, Backup history, parent_refs_truncated, parent_expansion_cursor_ref, node_state, divergent, graph_states]
negative_constraints:
  - Do not infer repository, workspace, Host, Environment, remote, account, or authority from graph focus, display path, labels, or shared commit objects.
  - Do not merge Jujutsu operation history or Backup history into SourceGraph or invent a cross-owner undo/restore action.
  - Do not eagerly hydrate an unbounded history, lose selection identity between pages, or paint stale/partial data as current.
  - Do not present a truncated parent list as complete, expand a page that is not current, or change the 32-reference bound without a new owner decision.
  - Do not truncate a parent list before it holds all 32 references, and do not send an expansion request that omits any field of the page's currentness.
  - Do not emit two rows with the same `node_ref` in one page, and do not treat an exact duplicate row as harmless because its fields agree.
  - Do not add a SourceGraph command, handler, state owner, EventRecord family, persistence authority, or runtime/native proof from this static closure.
```

## DL-043 Accepted Jujutsu Planning Addendum - 2026-09-11

This addendum compiles the specified DL-043 answers as accepted planning requirements. It does not change current command/provider enums, admit typed schema variants, register handlers/events, implement runtime behavior or claim readiness. Conditions remain acceptance criteria. Declined dispositions receive no PlanUnits. Cross-owner command, GUI, wiring, Contracts, Permissions/FileSafe and Backup amendments remain with their canonical owners.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/FinalGUISpec.md

### SCS-018 - D5 Planning Admission And Exact Effect Envelope

```yaml
plan_unit_id: SCS-018
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: DL-043 accepts the specified D5 behavior for planning. The existing Jujutsu request enum remains
  exactly 31 commands. A new action or request meaning remains unavailable for dispatch until its owner supplies
  a closed typed extension, positive and rejected fixtures, central catalog and sole-handler wiring, explicit event
  or no-persist disposition, Permissions/FileSafe closure, current exact-environment qualification and runtime validation.
  Existing commands may be reused only where their admitted request meaning already matches the action; a convenience
  surface cannot smuggle an extra effect through a read or loosely interpreted command.
gui_related: false
gui_classification_reason: The unit defines owner service, identity, authorization, or native effect semantics.
depends_on:
- SCS-002
- SCS-003
- SCS-015
- SCS-016
- JJI-003
- JJI-007
unblocks: []
acceptance_criteria:
- Future projections and requests retain RepositoryContext, Project, Home Server, Execution Host, Environment, Source
  Location, topology generation, repo_id, scm_backend=jujutsu, workspace_id, change_id where applicable, immutable
  commit_id, operation_id and exact selected target identities. A display path, label, abbreviated ID, content hash,
  current focus, or newest object cannot replace that identity.
- Every native write, including managed preview object writes and repair, compares exact expected operation/revision
  and topology, current capability revision, writer lease generation/epoch/expiry, Permissions and FileSafe decisions
  and idempotent command instance at dispatch. Destructive or recovery effects also require exact target-bound confirmation.
  No additional writer is created for a separate service.
- Validated reads use read authorization and no writer, credential, FileSafe or confirmation authority; a read that
  would migrate, snapshot, reconcile, fetch or rebuild in the source store must reject or use a separately admitted
  effect path. PM metadata writes, disposable storage writes and export writes require their own scoped owner authorization/FileSafe
  decision rather than pretending to be source reads.
- Asynchronous accepted work references ObservableWork. Every established terminal attempt keeps JJI-003 receipt
  rules, including blocked, failed, cancelled, recovery_required and effect_unknown, without inventing an operation
  for a no-effect attempt. Interruption persists known phase effects. An effect_unknown result requires reconciliation before any retry; a confirmed applied effect returns its original result without re-execution, a proven unapplied effect may be retried only under fresh currentness/authorization fences, and an unresolved effect remains blocked.
- Preview/application bind one immutable proposal identity, exact inputs, target and expected native state. Selection,
  source content, configuration/capability, workspace, topology or operation change invalidates application; recomputation
  and new confirmation replace stale intent. Accepted work never retargets when focus changes.
- Support, implementation, freshness and availability remain distinct under SCS-015. Unknown/stale cannot become
  unsupported or ready; absent native qualification is an explicit blocker, not permission to use an upstream version
  guess, direct Git fallback, raw subprocess or external client.
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- Plans/jujutsu_integration_contracts.schema.json
- Plans/source_control_contracts.schema.json
- future all-terminal, stale selection, duplicate, lease-loss, interruption and unknown-effect fixtures
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: d5_planning_admission_and_exact_effect_envelope
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Source_Control_System.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d022
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Source_Control_System.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add a supported read-only browsing mode
- Add named markers on existing checkpoints
- Group display and provide verified group undo
- Add recent actions and supported redo
- Add simple action and time filters
- Add structured descriptions from existing receipts
- Diagnose growth and offer explicit maintenance
- Add an explicit adoption and repair flow
- Add hide and unhide
- Add guided convergence when supported
- Add a duplicate action
- Add a merge action
- Add absorption with preview
- Add a back-out action
- Add a version-to-version comparison
- Add a focused evolution view
- Add bounded attribution and file history
- Add conservative matching with stale markers
- Add a structured hunk selection interface
- Own a separate internal service
- Block by default; add an advanced path only for qualified compatible targets.
- Add a guided picker only if it clarifies rather than hides the target states.
- Add explicit lane priorities
- Add native query assistance
- Add previewed drag actions and keyboard equivalents
- Add pinned comparison and selected-change details
- Add explicit sanitized export
- Add an optional technical log view
- Add one explicitly supported forge workflow at a time.
- Add only for a concrete user workflow and keep local history independent.
- Add a separately labeled reverse-selected-operation action
- Add an explicitly managed rewrite preview and apply workflow
- Add a clearly labeled earlier-state browsing mode
```

### SCS-019 - Bounded Graph Priorities Queries And Pinned Comparison

```yaml
plan_unit_id: SCS-019
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: Add explicit lane priorities, native query assistance, and pinned comparison and selected-change
  details through the existing bounded SourceGraph and comparison projections. Preference and selection state never
  becomes revision or mutation authority.
gui_related: true
gui_classification_reason: The unit defines user-visible history, selection, comparison, or availability behavior.
depends_on:
- SCS-017
- SCS-018
- JJI-017
unblocks: []
acceptance_criteria:
- Lane priority resolves exact revision references or qualified native priority expressions at a captured graph
  generation, intersects the result with currently visible nodes and preserves stable fallback ordering across refreshes.
  Hidden/missing/pruned references cannot force hydration or fabricate nodes.
- Native query assistance identifies the qualified backend/version grammar, supplies bounded completions and syntax
  diagnostics, and separates validation from execution. Queries have page/node, work/time and cancellation limits;
  unsupported syntax, expensive/truncated results, filters and elisions remain explicit. No advanced operation-query
  language is added by source revset help.
- Keep SCS-017 200-node page cap and bounded hydration, stable anchors and currentness. An old completion or pagination
  result cannot overwrite a changed query/repository generation.
- Pinned comparison stores exact repository/workspace and immutable compared commits with operation/snapshot context,
  comparison kind and base. Refresh never moves pins to newest versions silently; missing/stale targets remain labeled.
  Selected-change details keep explicit bookmark/tracking/conflict identities and physical untracked-file state
  without inventing a Git stage area.
- 'Design default grounded in SCS-017: lane priorities affect layout only and pins affect selection only; native
  graph membership and source identity remain unchanged. All mutation from a selection uses a new current exact
  owner preview.'
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- future hidden-priority intersection, bounded invalid revset, stale completion, pin-on-rewrite, missing pin and
  untracked-file projection fixtures
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: bounded_graph_priorities_queries_and_pinned_comparison
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Source_Control_System.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Source_Control_System.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add explicit lane priorities
- Add native query assistance
- Add pinned comparison and selected-change details
```

### SCS-020 - Bounded Attribution File History And Conservative Review Matching

```yaml
plan_unit_id: SCS-020
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: Add bounded attribution and file history, and conservative matching with stale markers. File history
  and attribution retain native repository/version/path provenance; review marks retain their originally reviewed
  immutable version and may record only proven correspondence to another version.
gui_related: true
gui_classification_reason: The unit defines user-visible history, selection, comparison, or availability behavior.
depends_on:
- SCS-017
- SCS-018
- JJI-017
- FGI-004
unblocks: []
acceptance_criteria:
- Attribution/file-history requests bind exact repository, operation visibility, immutable commit, file identity/path/range,
  backend/profile and projection generation. Paginate and bound work with cancellation, explicit incomplete/missing/unsupported
  rename history, binary or unsupported file types and no assertion of measured performance from research.
- A review mark/annotation records original immutable revision, path/range, reviewed content context, author and
  existing review scope. Candidate matching to a rewritten version requires exact repository and native lineage
  plus unambiguous qualified content/range correspondence; content hash or stable change ID alone cannot authorize
  transfer.
- 'Design default grounded in FGI-004: preserve the original mark and add a derived correspondence record, never
  overwrite its evidence identity. Only exact unambiguous unchanged correspondence can appear matched; ambiguous,
  altered or missing regions are stale or orphaned with the original available for inspection and explicit user
  re-review.'
- Local correspondence never moves hosted approvals, test/capture/audit evidence, thread resolution or Ready status
  to a new ForgeReviewRevision. A forge provider continues to own its exact-version review effects and policy; read-side
  matching grants no remote mutation authority.
- Missing predecessor/rename proof, duplicate text, normalization ambiguity, partial results or stale projection
  never produces a current reviewed claim. Matching remains bounded and can fail conservatively without losing original
  notes.
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- future duplicate-text, rename/merge ambiguity, changed range, orphan mark, unsupported attribution, cancellation
  and no-approval-transfer fixtures
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: bounded_attribution_file_history_and_conservative_review_matching
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Source_Control_System.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Source_Control_System.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add bounded attribution and file history
- Add conservative matching with stale markers
```

### SCS-021 - Sanitized Diagnostic Export And Optional Technical Log

```yaml
plan_unit_id: SCS-021
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: Add explicit sanitized export and an optional technical log view over existing source-control receipts.
  Neither surface parses terminal output into authoritative state or creates native operations merely to add descriptions.
  Export is an explicit owner-authorized file/artifact effect; viewing remains a read of already authorized redacted
  data.
gui_related: true
gui_classification_reason: The unit defines user-visible history, selection, comparison, or availability behavior.
depends_on:
- SCS-003
- SCS-016
- SCS-018
- JJI-003
unblocks: []
acceptance_criteria:
- Capture export scope by exact repository, selected operation/receipt IDs, time bounds and completeness. Preview
  included categories and destination before writing, require scoped export authorization and FileSafe destination
  handling, and produce an artifact identity/digest plus sanitization and omitted-field summary in the receipt.
- 'Design default grounded in existing non-secret receipt boundaries: export an allowlisted structured diagnostic
  subset; omit credentials, tokens, secret-bearing URLs/environment/argv, private absolute paths and source content
  by default. Sanitize native descriptions and errors as untrusted text; unsafe fields are omitted rather than assuming
  generic token masking is enough.'
- Technical log exposes bounded authorized secret-free argv identity, command/attempt, timestamps, before/after
  operation refs, terminal outcome and receipt links. It labels unmatched native actions or unavailable diagnostics
  and preserves effect_unknown without inferring success from exit code or prose.
- Export is local artifact creation/sharing preparation, not permission to send/upload to a service or alter retention.
  Destination collisions, denied writes, cancellation, partial files and restart have explicit cleanup/receipt behavior;
  repeat command identity does not duplicate an export blindly.
- Repository/account switches invalidate unscoped cached views; filtering and pagination cannot leak another authorized
  context. Private path/content handling and redaction negatives are required before availability.
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- future credential-in-argv/URL/error/name, private path/content, bounded-log, cross-repository cache, denied destination
  and partial export fixtures
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: sanitized_diagnostic_export_and_optional_technical_log
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Source_Control_System.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Source_Control_System.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add explicit sanitized export
- Add an optional technical log view
```

## DL-051 Accepted New-Repository Object Format Choice - 2026-09-16

This addendum compiles the DL-051 format requirements for the Settings Source Control surface; DL-297 supersedes its earlier setup-picker placement. It admits no command, request meaning, handler, event, certified engine version or runtime capability; SCS-018 admission requirements apply. The exact engine, command-line and repository-format qualification requirement is a prerequisite owned by SCS-004 and SCS-015 and is referenced, not restated. Nothing here changes a default object format, authorizes cross-format migration, or claims universal SHA-256 support.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

### SCS-022 - New Repository Object Format Choice In Settings

```yaml
plan_unit_id: SCS-022
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Settings Source Control setup alone offers object format and permanence acknowledgement for a new repository. Other setup consumers show only the owner-resolved choice or discovered effective format. It is one surface in the existing Settings Source Control flow, not a separate
  wizard or a New Project picker, and binds the exact Execution Host and Execution Environment. Every offered
  format comes from an owner-owned format profile, so a choice is enabled or disabled by current capability evidence
  and never by assumption; an uncertified or not-yet-known format is shown disabled with its reason rather than hidden
  or silently substituted. The copy states that the object format of a repository is permanent once it is created, and
  confirming records that the user was shown it. Cancelling or abandoning setup records no chosen format anywhere. An
  existing repository shows only what discovery found, and says the format is not yet known rather than showing the engine
  default as though it had been observed. DL-259, Jared 2026-10-31: D2 A: repository object-format selection and its
  permanence acknowledgement belong in Settings, not onboarding. Existing-repository format observation, unknown/capability
  handling and the Source Control owner’s safeguards remain unchanged.
  P4 and DL-297 make Settings the sole object-format choice and permanence-acknowledgement surface, including New Project re-entry; all setup consumers carry only that owner-resolved selection/profile or discovered format. A repository already present is never re-created or converted by this choice.'
gui_related: true
gui_classification_reason: The unit is a visible setup-flow control, its disabled states and reasons, its discovered-format display and its permanence copy.
depends_on: [SCS-004, SCS-005, SCS-015, SCS-018, JJI-006, JJI-021, JJI-022, DL-051]
unblocks: []
acceptance_criteria:
- The choice appears only in Settings Source Control for a repository being created, with the exact Execution Host
  and Execution Environment. Onboarding and New Project show only the owner-resolved choice or discovered format.
- Every offered or disabled format is backed by a `pm.source_control.repository_object_format_profile.v1` record; the
  flow offers no format it has no profile for.
- A disabled format shows a reason code from its profile, and an unknown capability state is shown as unknown rather
  than folded into supported or unsupported.
- Confirming a choice requires the acknowledged permanence copy, so `lifecycle_state=confirmed` carries a chosen format,
  `permanence_acknowledged=true` and at least one offered profile reference.
- Cancelling records no chosen format and no acknowledgement, and leaves nothing partially chosen behind.
- An existing repository carries a discovered format or an explicit unknown, and never a chosen format.
- The record changes no default object format, requests no cross-format migration, and claims no runtime evidence.
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version, or
  runtime capability; SCS-018 admission requirements apply.
- 'DL-259, Jared 2026-10-31: D2 A: repository object-format selection and its permanence acknowledgement belong in Settings,
  not onboarding. Existing-repository format observation, unknown/capability handling and the Source Control owner’s
  safeguards remain unchanged.'
validation_surfaces:
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - scripts/pm-new-contracts-verify.py
  - future exact-host setup, disabled-choice, cancellation and discovered-format tests; static prose is not runtime proof
risk_class: permanent_repository_format_chosen_without_evidence_or_consent
reasoning_tier: high
context_scope: new_repository_object_format_selection
implementation_surfaces:
  - Plans/Source_Control_System.md
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - future Source Control setup surface and Slint consumer
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-051
- source_ref:pldg-20260916-002-jujutsu-object-format-picker:atom-object-format-setup-surface-110
- reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json:c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [object format, discovered effective format, permanent, sha1, sha256, use_jujutsu_here]
negative_constraints:
  - Do not offer a format the current capability evidence does not certify, and do not disable one by assumption instead of by evidence.
  - Do not show the engine default as a discovered format, and do not hide an unknown behind a plausible value.
  - Do not record a chosen format from a cancelled or abandoned setup.
  - Do not change a default object format, migrate an existing repository between formats, or claim universal SHA-256 support.
  - Do not restate the exact engine, command-line and repository-format qualification requirement; it belongs to SCS-004 and SCS-015.
owner_hints:
  - Plans/Source_Control_System.md
  - Plans/Jujutsu_Integration.md
  - Plans/FinalGUISpec.md
```

## DL-062 Accepted Gate List Planning Addendum - 2026-09-18

This addendum compiles the seven accepted Azure DevOps decision-card answers of 2026-09-18 as accepted planning requirements. It does not change current command or provider enums, admit typed schema variants, register handlers or events, implement runtime behavior or claim readiness. Conditions remain acceptance criteria. The deferred branch-policy read receives no PlanUnit. Cross-owner command, GUI, wiring and contract amendments remain with their canonical owners.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Forge_Integrations.md

### SCS-023 - One Gate List With A Source Column And An Enforcement Column

```yaml
plan_unit_id: SCS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  The current checks region stays one region and is one gate list. Every row carries the provider surface it came
  from and its enforcement, which is required, advisory, not enforced or unknown, so the question of what blocks
  this merge is answered in one place. No provider-neutral policies region is added and no new section vocabulary
  is introduced, which is what SCS-005's rule against a panel or section per backend already asks for. An
  enforcement value the provider does not publish reads unknown rather than being inferred as required or
  advisory. The final interface specification names the same two columns, and the Azure grouping of ADO-007 is a
  composition of this one list rather than a second region.
gui_related: true
gui_classification_reason: The region, its columns and the words in them are what a person reads to find what will block a merge.
depends_on: [SCS-005, SCS-016, FGI-005]
unblocks: []
acceptance_criteria:
  - The current checks region is one gate list whose rows each carry a source and an enforcement value, and no second policies region is added.
  - Enforcement is stated rather than inferred; a row whose enforcement the provider does not publish reads unknown.
  - The final interface specification names the same source and enforcement columns, with no third vocabulary between the two owners.
  - A truncated gate list is shown as truncated rather than as a complete one, on the flag-and-cursor rule this owner already states for a bounded list.
  - No command, handler, event or runtime behaviour is admitted by this unit, and no WorkNode or NodeSeed is created.
validation_surfaces:
  - >-
    no validator surface in this landing; recorded as `q-020`. The shapes this unit describes are not in any schema or fixture pack, because the addendum admits no typed schema variant, so the unit is stated and not yet falsifiable. Neither source-control contract file carries an enforcement or gate-list shape, and
    Plans/Source_Control_System.md is not a sharding_config source, so the shard check never reads this document.
  - future gate-list projection and accessibility fixtures
risk_class: section_proliferation_or_unstated_enforcement
reasoning_tier: high
context_scope: source_control_gate_list_presentation
implementation_surfaces: [Plans/Source_Control_System.md, Plans/FinalGUISpec.md, future Source Control Slint components]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-062, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-004]
preserved_exact_tokens: [current checks, gate list, enforcement, required, advisory, not enforced, unknown]
negative_constraints: [Do not add a second policies region or new section vocabulary under this decision., Do not infer an enforcement value the provider does not publish., Do not let the two consumer owners name different columns.]
owner_hints: [Plans/Source_Control_System.md, Plans/FinalGUISpec.md, Plans/Azure_DevOps_Integration.md]
```

## Git Adapter Command Contracts - 2026-09-27 (ACT011/014/015/018/019/020/021)

This addendum resolves the seven packet-sweep command mappings below as static
owner contracts. It admits no native handler, EventRecord, runtime behavior, or readiness claim;
central catalog and production-intent wiring rows are specified separately. The nineteen neutral
commands in `Plans/source_control_contracts.schema.json` are unchanged; the
seven commands here live in the separate Git adapter family
`Plans/git_adapter_command_contracts.schema.json` with fixtures in
`Plans/git_adapter_command_contract_fixtures.json` and the focused validator
`scripts/pm_git_adapter_commands.py`.

| ACT | Command | Resolution |
|---|---|---|
| ACT014 | `cmd.git.stage` | New whole-file stage with `paths[]`; hunk commands do not cover it. |
| ACT015 | `cmd.git.unstage` | New whole-file unstage with `paths[]`; hunk commands do not cover it. |
| ACT011 | `cmd.source_control.remote.update` | New Git-scoped local remote configuration mutation. |
| ACT018 | `cmd.source_control.stash.create` | Canonical equivalent with typed `include_untracked` and `message`. |
| ACT019 | `cmd.source_control.stash.apply` | Canonical equivalent with typed `stash_id` and `preview_ref`. |
| ACT020 | `cmd.source_control.branch.create` | Canonical equivalent with typed `branch` and `base_oid`. |
| ACT021 | `cmd.source_control.branch.delete` | New destructive delete with preview, guards, and dangerous confirmation. |

`cmd.git.stage_hunks` and `cmd.git.unstage_hunks` stage selected hunks of one
tracked file and do not demonstrate whole-file `paths[]` staging or unstaging
of entire untracked or binary files. `cmd.git.stage` and `cmd.git.unstage`
are therefore separate exact primaries. Both carry whole files only
(`whole_file_only=true`); no hunk field exists in this family. Every path is
repo-relative: absolute paths, dot-dot traversal, backslashes, trailing
slashes, NUL/control bytes, and leading or trailing spaces are rejected,
while ordinary interior spaces (for example `docs/meeting notes.md`) are
safe. `paths[]` is chosen from the status snapshot named by
`status_selection_ref`; the selection never substitutes for `repo_id`,
`workspace_id`, expected revision, lease, or currentness identity. Stage
requires an explicit `include_untracked` decision, and declared untracked
paths must be a subset of `paths[]`; unstage forbids untracked admission
fields because untracked files are outside the index.

`cmd.source_control.remote.update` mutates local remote configuration only
(`local_config_only=true`). It carries an exact `remote_id`, one validated
`fetch_url`, a distinct validated `push_urls` array, and an
`expected_config_generation` fenced against the expected Git state. Remote
URLs carry no userinfo or credentials; brokered credential leases remain the
only credential route. The command performs no fetch, publish, fan-out, or
any network effect, and a successful local config write is never reported as
remote truth.

`cmd.source_control.stash.create` carries `include_untracked` and a bounded
`message`. `cmd.source_control.stash.apply` carries a typed `stash_id` and a
current `preview_ref`; a missing or stale preview, a missing stash, a
conflict, or a dirty worktree fails with an exact refusal code, never a
silent partial apply. `cmd.source_control.branch.create` carries a
check-ref-format `branch` name and a `base_oid`.

`cmd.source_control.branch.delete` is admitted only with an immutable
branch/head preview (`preview_ref` plus `expected_branch_head`), the
protected, checked-out, and attached-worktree guards, explicit
`dangerous_confirmation` with `irreversibility_disclosed`, FileSafe, and a
truthful effect receipt naming the deleted branch tip OID. The candidate
`cmd.git.stash.*` and `cmd.git.branch.*` spellings are not primaries and are
rejected by the closed command enum.

`preview_ref` is never opaque. `stash.apply` consumes a typed immutable
`pm.git_adapter.stash_apply_preview.v1` record and `branch.delete` a typed
immutable `pm.git_adapter.branch_delete_preview.v1` record, each produced by
its own owner projection before dispatch, never inside the mutation. A
preview binds repository, workspace, Git-only backend, expected Git state,
target stash or branch head, currentness generation with reference and hash,
permission and FileSafe decision references, produced/expiry timestamps, and
typed findings: stash existence, worktree cleanliness, and conflicting paths
for apply; branch existence, protected, checked-out, and attached-worktree
refs for delete. The preview is immutable: any state, target, currentness,
permission, FileSafe, or finding change requires a new `preview_id`.
Dispatch revalidates the request against the preview exactly, in order:
substitution (wrong record, kind, repository, workspace, or target),
expiry, staleness (moved revision fence, currentness, permission, FileSafe,
or vanished target), guard findings, and only then admission. Each refusal
is typed; a stale or substituted preview is recomputed and reconfirmed,
never repaired in place.

Every scope in this family requires exactly `scm_backend=git`, the exact
`repo_id` and Git-native `workspace_id`, an expected Git state (HEAD OID,
index generation, config generation), currentness generation with reference
and hash, a writer lease reference, permission and FileSafe decision
references, and the action-specific fields above. Requests carry an
idempotency key. Results distinguish `accepted` (admitted, ObservableWork,
no terminal receipt) from terminal success; receipts are terminal only and
leave every after-generation null while the effect is unknown. Errors keep
`effect_unknown` at `retry_allowed=false` with reconciliation-only next
actions, distinct from safe retry after a known fenced refusal such as
`stale_index`.

ContractRef: ContractName:Plans/git_adapter_command_contracts.schema.json, ContractName:Plans/git_adapter_command_contract_fixtures.json

### SCS-024 - Git Adapter Stage, Remote, Stash, And Branch Command Contracts

```yaml
plan_unit_id: SCS-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: >-
  Source Control owns seven Git-only adapter commands in a schema family
  separate from the nineteen neutral commands: whole-file cmd.git.stage and
  cmd.git.unstage with paths[], Git-scoped local cmd.source_control.remote.update,
  canonical cmd.source_control.stash.create and stash.apply with typed fields and
  an apply preview, canonical cmd.source_control.branch.create, and destructive
  cmd.source_control.branch.delete with an immutable branch/head preview,
  protected/checked-out/attached guards, explicit dangerous confirmation, and a
  truthful tip-naming receipt. Every scope fences exact Git backend, repository,
  workspace, HEAD/index/config generations, currentness, writer lease, permission,
  FileSafe, and action-specific fields; accepted never means terminal success and
  effect_unknown never means safe retry. Candidate cmd.git.stash.* and
  cmd.git.branch.* spellings are not primaries.
  The new neutral cmd.source_control.remote.add is separately defined in SCS-025. Existing cmd.source_control.remote.update remains edit-only and Git-scoped; neither verb fetches, pushes, initializes hosting or starts authentication. For a JJ-authoritative repository, only its admitted backend adapter may add a remote under the JJ writer fence, never a direct-Git fallback.
gui_related: true
gui_classification_reason: Staging, remote, stash, and branch actions with their availability, previews, confirmations, and disabled reasons are visible across Source Control, Settings, and palette consumers.
depends_on: [SCS-002, SCS-003, SCS-015, SCS-016]
unblocks: []
acceptance_criteria:
  - Whole-file stage/unstage admit paths[] of entire tracked, untracked, and binary files; hunk commands are not credited with this semantic and no hunk field exists in the family.
  - Every path is repo-relative; absolute, traversal, backslash, trailing-slash, NUL/control-byte, and leading-or-trailing-space spellings are rejected while ordinary interior spaces are safe, and the status selection never substitutes for repository, workspace, revision, lease, or currentness identity.
  - remote.update mutates local remote configuration only with an exact remote_id, one validated fetch URL, a distinct validated push URL array, and a fenced expected config generation; remote URLs carry no userinfo or credentials and no fetch, publish, or network effect occurs.
  - stash.create carries typed include_untracked and bounded message; stash.apply carries typed stash_id and a current preview_ref with exact refusal on missing/stale preview, missing stash, conflict, or dirty worktree.
  - branch.create carries a check-ref-format branch name and base OID; branch.delete additionally requires an immutable branch/head preview, protected/checked-out/attached guards, explicit dangerous confirmation with irreversibility disclosure, and a receipt naming the deleted tip OID.
  - cmd.git.stash.* and cmd.git.branch.* spellings are rejected as primaries; the nineteen neutral command shapes are byte-unchanged.
  - Every scope requires exactly scm_backend=git with expected HEAD/index/config generations, currentness, writer lease, permission, FileSafe, and action-specific fields; every request carries an idempotency key.
  - accepted results carry ObservableWork and no terminal receipt; terminal receipts leave after-generations null while effect_unknown; effect_unknown errors keep retry_allowed=false with reconciliation-only next actions.
  - stash.apply and branch.delete previews are owner-typed immutable records binding repository, workspace, Git state, target, currentness, permission, FileSafe, expiry, and conflict or guard findings; dispatch revalidates request-to-preview exactly with typed substitution, expiry, stale, and guarded refusals, and cross-record join fixtures pin admitted plus each refusal.
  - Every command has positive fixtures and schema plus semantic negative fixtures covering currentness and substitution; the focused validator pins that coverage.
  - Static owner, catalog, and production-intent wiring contracts only: no native handler, event, runtime, security, visual, readiness, WorkNode, or NodeSeed claim.
validation_surfaces: [Plans/git_adapter_command_contracts.schema.json, Plans/git_adapter_command_contract_fixtures.json, scripts/pm_git_adapter_commands.py]
risk_class: git_adapter_command_authority_or_effect_overclaim
reasoning_tier: high
context_scope: git_adapter_stage_remote_stash_branch_commands
implementation_surfaces: [Plans/Source_Control_System.md, Plans/git_adapter_command_contracts.schema.json, Plans/git_adapter_command_contract_fixtures.json, future Git adapter handlers]
node_compile_hint: {mode: static_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:packet-sweep-20260927-cross-contracts:ACT014
- source_ref:packet-sweep-20260927-cross-contracts:ACT015
- source_ref:packet-sweep-20260927-egolite:ACT-011
- source_ref:packet-sweep-20260927-egolite:ACT-018
- source_ref:packet-sweep-20260927-egolite:ACT-019
- source_ref:packet-sweep-20260927-egolite:ACT-020
- source_ref:packet-sweep-20260927-egolite:ACT-021
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [cmd.git.stage, cmd.git.unstage, cmd.source_control.remote.update, cmd.source_control.stash.create, cmd.source_control.stash.apply, cmd.source_control.branch.create, cmd.source_control.branch.delete, paths, whole_file_only, include_untracked, local_config_only, expected_config_generation, preview_ref, pm.git_adapter.stash_apply_preview.v1, pm.git_adapter.branch_delete_preview.v1, dangerous_confirmation, accepted, effect_unknown, reconcile_effects]
negative_constraints:
  - Do not credit hunk commands with whole-file untracked/binary stage semantics.
  - Do not admit cmd.git.stash.* or cmd.git.branch.* as primaries.
  - Do not modify the nineteen neutral command shapes to host these commands.
  - Do not embed userinfo or credentials in remote URLs or perform network effects from remote.update.
  - Do not delete a branch without its preview, guards, dangerous confirmation, and tip-naming receipt.
  - Do not report accepted as terminal success or effect_unknown as safe retry.
  - Do not claim native handler execution, event, runtime proof, or readiness from these static contracts and production-intent rows.
owner_hints: [Plans/Source_Control_System.md]
```


## Projects refresh accepted owner addendum (2026-11-03)

### SCS-025 - Read-only source inspection and local remote addition

```yaml
plan_unit_id: SCS-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: |-
  cmd.source_control.repository.inspect is a read-only Source Control primary with sole future handlers::source_control::repository_inspect. Its closed source-context variant supports unregistered drafts with project_id=null and actual Server/Computer, Execution Host/Environment, source transport/locator, topology/trust/profile refs and observation generation; a registered context binds the actual Project/repository/workspace. The result is a bounded redacted inspection receipt with observed time/hash/currentness/expiry, backend/native revision, branch or bookmark, dirty tracked/untracked state, remotes and detected service/locator evidence, upstream evidence, submodules, Git LFS and hooks, duplicate registered-copy match and completeness/omission reasons. Local folder, Server, SSH/PM, SMB, NFS, mounted source and online source preparation all use it. Native read modes must not create a JJ snapshot, execute hooks/filters/includes or mutate configuration. Listing a URL or origin is not verified identity, hosting binding, credentials or write permission.

  A matching registered copy offers Open on its named Computer without blocking. Only explicitly selected account/repository verification can Link it; Leave it unlinked remains valid. Unknown/unavailable/partial inspection stays so, never empty/no-history/clean by default. Actual source changes stale Review and require a fresh receipt. A pre-copy online inspection may be partial and cannot replace post-acquisition native inspection.

  cmd.source_control.remote.add is a distinct neutral primary with sole future handlers::source_control::remote_add. Its typed local-config mutation binds the actual backend, repository/workspace, expected config and native revision, currentness/writer lease, FileSafe and permission/idempotency, explicit remote name and scrubbed fetch/push locators. Names permit letters, numbers, hyphen, underscore and dot, reject empty/unsafe/taken names and preserve a separately chosen original upstream role; an upstream contribution name cannot collide with origin. Existing remotes require remote.update or a new explicit name, never implicit overwrite. Before/after config and terminal result are receipted with exact caller return. No remote.add/update performs network I/O, authentication, publish or hosting creation. Git uses the admitted Git config writer; JJ uses only an admitted JJ-authoritative adapter under its existing fence. A missing backend route remains handler_unavailable/unsupported, with no direct-Git fallback.

  Both new primaries extend the neutral scope-aware command family deliberately; historical nineteen-ID v1 requests remain exact and the 31 Jujutsu command IDs do not grow. No new EventRecord follows from these receipts. Final dispatch uses the same Permissions admission as other source operations; inspection permission never authorizes add, fork, publish or destination writes.

  Contribution synchronization uses the existing cmd.source_control.remote.sync, sole handlers::source_control::remote_sync and unchanged catalog.source_control_remote_sync identity. Consume the five selected definitions in Plans/source_control_contracts.schema.json: source_control_command_request_v2, source_control_command_result_v2, source_control_command_scope_v2, remote_operation_target_v2 and remote_sync_local_reconcile_target_v2. The closed remote_effect branch retains the exact v1 target; the local_reconcile_only branch binds captured original repository/binding/remote/fetched revision and fetch receipt, fork repository/binding/native workspace and expected native revision, head/base and contribution/review refs, actual generations/lease/permission/FileSafe/Stop and the current preview/expiry/exact return. reconciliation_strategy is the existing resolved native merge/rebase policy ID/revision/hash, admitted by the actual backend capability. Require push_targets=[] and publish_performed=false. Changed original/fork/workspace/revision/strategy/lease or authority refuses rather than silently selecting a newer revision. Owner results retain exact before/after/local receipts and outcome_unknown reconciliation. Publication is a separately admitted cmd.source_control.remote.publish naming the fork; no new sync engine, remote-name role inference, network publication or direct-Git fallback is hidden in local reconciliation. Historical v1 bytes, semantic hashes, results and replay remain exact.

  For existing-Project chat conversion, ACD-510/511 owns the current preview and destination authority. Git defaults to a separate work branch/worktree in the chosen folder; direct main is Advanced only. Inspect the actual destination/history and block unsaved target buffers or a source-history graft before writes. Missing Git name/email remains a named owner blocker. Jujutsu follows JJI-023 and its admitted native adapter; this inspection receipt never authorizes conversion or publication.

  For SSH inspection, authenticated source access consumes only current SRV-018/RAS-017 host-trust and public-key-install results. The separately human-applied cmd.server.ssh.trust / cmd.server.ssh.public_key.install receipts bind actual host/port/key observation, remote account and public-key/currentness refs; a successful install is not itself a complete source inspection or repository binding. This read-only primary never writes known-host trust or authorized_keys, installs keys, accepts a changed fingerprint, unlocks another key, pairs a Client or authorizes mutation. After any prerequisite effect, refresh the actual bounded inspection and Review currentness through the same owner. Missing or uncertain Server-native evidence stays unavailable and cannot be filled by a path, mode/grant, connection.add or a fixture.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- SCS-003
- SCS-004
- SCS-012
- SCS-024
unblocks: []
acceptance_criteria:
- Every source route has a typed read receipt and source currentness, including null-Project drafts; partial/denied
  observations never become clean/none.
- Detected remotes remain unlinked until explicit current account/repository verification.
- remote.add rejects taken/unsafe names, stale config/lease, wrong backend/Host and credentials in URL; performs
  zero transport or implicit publish.
- JJ native read/remote paths preserve one authority and never invoke uncertified Git fallback.
- >-
  Local reconciliation checks both captured repositories/revisions, the fetch receipt and exact policy/lease/currentness/return; wrong original/fork/backend or changed strategy refuses with no implicit publish.
- >-
  Git conversion preserves destination history and unsaved buffers; direct main requires the explicit Advanced choice and normal branch policy.
- >-
  SSH inspection cannot perform trust/key installation or treat its result as repository identity; only current owner-validated prerequisites permit the actual fresh read.
validation_surfaces:
- Plans/source_control_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_scs_025
implementation_surfaces:
- Plans/Source_Control_System.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- '/mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P1/P2/P5; BUILD-SPEC §18.1 #2/3/19; R3'
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-E01'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-E01'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-E01'
- 'Plans/Server_System.md#SRV-018; Plans/Remote_Access_System.md#RAS-017; A interface freeze pm-mail 1103211659-9a77 (2026-11-03)'
preserved_exact_tokens:
- cmd.source_control.repository.inspect
- handlers::source_control::repository_inspect
- cmd.source_control.remote.add
- handlers::source_control::remote_add
- project_id=null
- remote.update
- upstream
- origin
- handler_unavailable
- local_reconcile_only
- reconciliation_strategy
- push_targets=[]
- publish_performed=false
- remote_operation_target_v2
- remote_sync_local_reconcile_target_v2
- source_control_command_request_v2
- source_control_command_result_v2
- source_control_command_scope_v2
- cmd.server.ssh.trust
- cmd.server.ssh.public_key.install
negative_constraints:
- Do not make SIR/topology an SCM inspection engine or infer identity/trust from path/display text.
- Do not fabricate a Project/repository/writer lease for pre-registration reads.
- Do not turn remote.update into create-or-overwrite or promote receipt-only actions into EventRecords.
owner_hints:
- Plans/Source_Control_System.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Source_Control_System.md#SCS-025, ContractName:Plans/Plan_Document_System.md#PDS-003


### SCS-085 - Event Authority git.clone.completed 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: SCS-085
unit_type: event_contract
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: |-
  git.clone.completed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/git_clone_completed.schema.json (pm.event_payload.git_clone_completed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: ordinary Git clone terminal adapter. Observe succeeded cmd.source_control.repository.clone with scm_backend=git only after owner native completion, destination verification and terminal operation receipt. The reserved Project/repository/workspace/Host/Environment lineage is original intent data, never focused Project. This precedes Project registration and cannot certify its success. Jujutsu cmd.jujutsu.git.clone is distinct and never normalized to this spelling. Failed, cancelled, effect_unknown or merely accepted ObservableWork emits no completion. Current Source_Control_System sections 7/9 route the old catalog spelling to this ordinary Git producer without reviving cmd.git.clone.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["git.clone.completed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="git.clone.completed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original ordinary Git clone command operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for git.clone.completed: actor_ref is the non-empty non-secret actor reference retained by the original ordinary Git clone command operation from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original terminal result must join payload.repo_id, workspace_id, host_id, environment_id, source_location_ref and operation_receipt_ref exactly, including the reserved Project identity. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.scm.git_clone_completed@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for git.clone.completed: source location and original terminal receipt remain behind authorized refs; URLs with credentials and private absolute destinations are forbidden; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with ordinary Git clone terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.scm.git_clone_completed@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for git.clone.completed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns ordinary Git clone terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  git.clone.completed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for git.clone.completed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for git.clone.completed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-627
- SP-607
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```

## Prepared Source Control Event Authority contracts — W3B phase 1, 2026-11-05

These are **newly authored owner contracts** for the nineteen deck-2 item 9.a A names. They extend only existing specified behavior after the per-family search recorded in `reports/event-authority-20261105/W3B-search.json`. None is admitted. Existing command rows keep `expected_event_types=[]` and handlers remain unavailable until separately reviewed admission and full native adoption. Application-only repository.inspect remains SCS-025 receipt-only and is not an alias or scope extension of these families. Each definition below stands on its own.

### SCS-1250 — source_control.backend.detected prepared owner contract

```yaml
plan_unit_id: SCS-1250
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.backend.detected@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-004, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.backend.detected;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.backend_detected.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::backend_detect owns this
  exact Host/Environment detection observation. The exact-environment backend-detect handler has completed one bounded
  read and committed its actual detection observation; a request or cached panel alone is insufficient. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.backend.detect
  and its command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner
  acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect.
  The original fact is committed in source_control_backend_detected_fact via SP-1250, before this family''s append
  is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1;
  SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent terminal success before
  the first issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve
  precedes native dispatch; for successful completion facts the native outcome source precedes append and terminal
  publication follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1250 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_backend_detected_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:backend_detected:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-454 (E-CARDS-3 item 2.a, option A):
  RP-TELEMETRY-90D@1.0.0, kept for 90 days from the first successful save that survives a restart, under the existing
  2,000,000-entry Project allowance; retry, reprocessing and restore never restart its clock. The original source fact source_control_backend_detected_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0, the same policy as
  its DL-454 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1250 binds the source fact to the same policy as its event history (DL-510):
  RP-TELEMETRY-90D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One accepted detection operation produces one observation, including a proved empty detected-backends
  set. Partial or unavailable observation remains explicitly partial or unavailable; it never means no backend.
  Detection does not select, install, bind, authenticate or certify a backend. Required predicates for this exact
  family: detected_backends is exactly the observed Git/Jujutsu set in the actual setup-state source; observation_state
  and completeness agree with the original observation; empty is not substituted for unavailable; source Host/Environment/topology
  equals the accepted backend.detect scope. Check every predicate separately; passing schema or a matching supplied
  digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.backend_detected.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.backend_detected.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1250 binds key
  source_control_event.backend_detected.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.backend_detected.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1210 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.backend.detected
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.detected
- pm.source_control_event.backend_detected.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1251 — source_control.backend.selected prepared owner contract

```yaml
plan_unit_id: SCS-1251
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.backend.selected@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-004, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.backend.selected;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.backend_selected.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::backend_select owns this
  exact Host/Environment selected backend. The backend-select handler has committed the explicitly requested effective
  backend for the captured Host/Environment after verifying its current setup evidence. The original request is
  the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.backend.select and its
  command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner acceptance,
  permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect. The original
  fact is committed in source_control_backend_selected_fact via SP-1251, before this family''s append is attempted.
  Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347
  own group issuance and crash behavior. Do not expose this event or dependent terminal success before the first
  issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve precedes
  native dispatch; for successful completion facts the native outcome source precedes append and terminal publication
  follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1251 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_backend_selected_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:backend_selected:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_backend_selected_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1251 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: A committed selection records the old and selected backend, preserving an absent prior selection
  as null. Repeating the same command returns its original result. A view/profile preview, discovery, failed setup
  or implicit Git fallback cannot select a backend; selection alone grants no installation, credential, binding
  or mutation authority. Required predicates for this exact family: selected_backend equals the accepted request,
  verified effective setup and original result; previous_backend equals the saved pre-selection value; selection
  is committed, rather than a presentation-only profile preview. Check every predicate separately; passing schema
  or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.backend_selected.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.backend_selected.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1251 binds key
  source_control_event.backend_selected.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.backend_selected.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1210 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.backend.selected
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.selected
- pm.source_control_event.backend_selected.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1252 — source_control.checkpoint.created prepared owner contract

```yaml
plan_unit_id: SCS-1252
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.checkpoint.created@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-008, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.checkpoint.created;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.checkpoint_created.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::checkpoint_create owns
  this backend-native checkpoint. The checkpoint-create handler has verified and durably saved the exact backend-native
  checkpoint and its generation for recovery or handoff. The original request is the exact v2 legacy_exact wrapper
  over the existing command request; cmd.source_control.checkpoint.create and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_checkpoint_created_fact
  via SP-1252, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1252 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_checkpoint_created_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:checkpoint_created:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_checkpoint_created_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1252 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: The exact checkpoint ID/generation is absent before creation and resolves after it to its saved
  native revision, purpose and source context. Duplicate command returns the original creation, while an occupied
  different checkpoint or stale expected generation refuses. This is not FileSafe safe_point.created or restore_point.created.
  Required predicates for this exact family: checkpoint ID, purpose and expected generation join the original create
  request and saved checkpoint; checkpoint_revision is the actual Git or JJ native saved revision, with the exact
  backend tag; the checkpoint exists durably before the created fact is published. Check every predicate separately;
  passing schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.checkpoint_created.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.checkpoint_created.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1252 binds key
  source_control_event.checkpoint_created.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.checkpoint_created.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1211 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.checkpoint.created
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.created
- pm.source_control_event.checkpoint_created.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1253 — source_control.checkpoint.restored prepared owner contract

```yaml
plan_unit_id: SCS-1253
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.checkpoint.restored@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-008, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.checkpoint.restored;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.checkpoint_restored.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::checkpoint_restore owns
  this restoration of one exact backend-native checkpoint. The checkpoint-restore handler has verified the exact
  selected checkpoint and observed a successful native restoration under current writer, revision, topology, permission,
  FileSafe and confirmation fences. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.checkpoint.restore and its command_instance_id/idempotency/scope must join
  the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential
  evidence before effect. The original fact is committed in source_control_checkpoint_restored_fact via SP-1253,
  before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value
  v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose this
  event or dependent terminal success before the first issued receipt is resolved and joined to the original full
  EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the native
  outcome source precedes append and terminal publication follows receipt. A failure to publish history never reruns
  the native effect.


  C4/C5 payload and identity: CV-1253 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_checkpoint_restored_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:checkpoint_restored:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_checkpoint_restored_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1253 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One original restore command moves the captured workspace from its expected before revision to
  the verified checkpoint-compatible after revision. Preserve original recovery/cleanup receipts. Unknown or partial
  effects produce only the required typed operation outcome, never a restored fact. A later restore is a new operation,
  not replay. Required predicates for this exact family: checkpoint ref, ID and generation resolve the same exact
  selected checkpoint as the accepted restore request; restore_confirmation is true in the original request and
  independent permission/FileSafe decisions admit the restore; after_revision matches independently observed native
  restoration, not merely a zero exit code. Check every predicate separately; passing schema or a matching supplied
  digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.checkpoint_restored.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.checkpoint_restored.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1253 binds key
  source_control_event.checkpoint_restored.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.checkpoint_restored.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1211 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.checkpoint.restored
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.restored
- pm.source_control_event.checkpoint_restored.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1254 — source_control.remote.fetch_completed prepared owner contract

```yaml
plan_unit_id: SCS-1254
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.fetch_completed@1.0.0, prepared without
  admission under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority
  and Contracts_V0.md#EventRecord. Search and negative evidence: reports/event-authority-20261105/W3B-search.json
  entry source_control.remote.fetch_completed; no existing exact closed event, producer/identity/consumer/checkpoint
  or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_fetch_completed.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_fetch owns this
  fetch verified successful completion. The fetch handler has resolved a known successful original operation receipt
  and independently verified the actual target and after revision; CLI exit alone is insufficient. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.remote.fetch
  and its command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner
  acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect.
  The original fact is committed in source_control_remote_fetch_completed_fact via SP-1254, before this family''s
  append is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1;
  SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent terminal success before
  the first issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve
  precedes native dispatch; for successful completion facts the native outcome source precedes append and terminal
  publication follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1254 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_fetch_completed_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_fetch_completed:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_fetch_completed_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1254 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One original started fetch operation reaches verified success. The completed fact resolves that
  exact start and original target; blocked, failed, cancelled, recovery_required or effect_unknown stays in its
  typed terminal receipt and cannot claim successful completion. Required predicates for this exact family: remote_target_ref
  resolves the original captured repository/remote/instance/account/native revision, never remote display text;
  writer, credential, capability, permission and FileSafe evidence joins the actual dispatch target; the original
  successful receipt and native observation prove the exact after revision, with no unresolved effect. Check every
  predicate separately; passing schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_fetch_completed.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.remote_fetch_completed.history.v1@1.0.0 is its operating audit
  reader for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1254 binds
  key source_control_event.remote_fetch_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema
  pm.storage_value.source_control_event.remote_fetch_completed.checkpoint.v1@1.0.0, exact SP-278 full-index publication
  and nine-field durable read token (DL-076, no persisted redb_snapshot_id). Rebuild never executes a command, native
  mutation, network request, lease grant/release, outbox, notification or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1212 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.fetch_completed
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_completed
- pm.source_control_event.remote_fetch_completed.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1255 — source_control.remote.fetch_started prepared owner contract

```yaml
plan_unit_id: SCS-1255
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.fetch_started@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.remote.fetch_started;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_fetch_started.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_fetch owns this
  fetch dispatch start. The fetch handler has committed the exact admitted target, expected native revision, operation
  and ObservableWork before its first native effect. The original request is the exact v2 legacy_exact wrapper over
  the existing command request; cmd.source_control.remote.fetch and its command_instance_id/idempotency/scope must
  join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_remote_fetch_started_fact
  via SP-1255, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1255 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_fetch_started_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_fetch_started:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_fetch_started_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1255 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One accepted fetch operation moves from admitted/no effect to started before native dispatch.
  No second native attempt is authorized by an append retry. An operation that is refused before admission has no
  started fact. Required predicates for this exact family: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the start source is durable before the first native effect. Check every predicate separately;
  passing schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_fetch_started.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.remote_fetch_started.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1255 binds key
  source_control_event.remote_fetch_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.remote_fetch_started.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1212 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.fetch_started
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_started
- pm.source_control_event.remote_fetch_started.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1256 — source_control.remote.publish_completed prepared owner contract

```yaml
plan_unit_id: SCS-1256
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.publish_completed@1.0.0, prepared without
  admission under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority
  and Contracts_V0.md#EventRecord. Search and negative evidence: reports/event-authority-20261105/W3B-search.json
  entry source_control.remote.publish_completed; no existing exact closed event, producer/identity/consumer/checkpoint
  or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_publish_completed.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_publish owns this
  publish verified successful completion. The publish handler has resolved a known successful original operation
  receipt and independently verified the actual target and after revision; CLI exit alone is insufficient. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.remote.publish
  and its command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner
  acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect.
  The original fact is committed in source_control_remote_publish_completed_fact via SP-1256, before this family''s
  append is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1;
  SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent terminal success before
  the first issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve
  precedes native dispatch; for successful completion facts the native outcome source precedes append and terminal
  publication follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1256 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_publish_completed_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_publish_completed:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_publish_completed_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1256 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One original started publish operation reaches verified success. The completed fact resolves that
  exact start and original target; blocked, failed, cancelled, recovery_required or effect_unknown stays in its
  typed terminal receipt and cannot claim successful completion. Fan-out is previewed and receipted per exact target
  and is not atomic. A mirror mapping cannot duplicate publication. Required predicates for this exact family: remote_target_ref
  resolves the original captured repository/remote/instance/account/native revision, never remote display text;
  writer, credential, capability, permission and FileSafe evidence joins the actual dispatch target; the original
  successful receipt and native observation prove the exact after revision, with no unresolved effect; partial fan-out
  cannot be presented as all-target success or automatically retried. Check every predicate separately; passing
  schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_publish_completed.history.v1@1.0.0 writes only this
  family''s filtered passive history; reader.source_control.remote_publish_completed.history.v1@1.0.0 is its operating
  audit reader for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1256
  binds key source_control_event.remote_publish_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)},
  schema pm.storage_value.source_control_event.remote_publish_completed.checkpoint.v1@1.0.0, exact SP-278 full-index
  publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id). Rebuild never executes
  a command, native mutation, network request, lease grant/release, outbox, notification or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1213 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.publish_completed
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_completed
- pm.source_control_event.remote_publish_completed.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1257 — source_control.remote.publish_started prepared owner contract

```yaml
plan_unit_id: SCS-1257
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.publish_started@1.0.0, prepared without
  admission under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority
  and Contracts_V0.md#EventRecord. Search and negative evidence: reports/event-authority-20261105/W3B-search.json
  entry source_control.remote.publish_started; no existing exact closed event, producer/identity/consumer/checkpoint
  or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_publish_started.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_publish owns this
  publish dispatch start. The publish handler has committed the exact admitted target, expected native revision,
  operation and ObservableWork before its first native effect. The original request is the exact v2 legacy_exact
  wrapper over the existing command request; cmd.source_control.remote.publish and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_remote_publish_started_fact
  via SP-1257, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1257 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_publish_started_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_publish_started:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_publish_started_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1257 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One accepted publish operation moves from admitted/no effect to started before native dispatch.
  No second native attempt is authorized by an append retry. An operation that is refused before admission has no
  started fact. Fan-out is previewed and receipted per exact target and is not atomic. A mirror mapping cannot duplicate
  publication. Required predicates for this exact family: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the start source is durable before the first native effect; partial fan-out cannot be
  presented as all-target success or automatically retried. Check every predicate separately; passing schema or
  a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_publish_started.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.remote_publish_started.history.v1@1.0.0 is its operating audit
  reader for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1257 binds
  key source_control_event.remote_publish_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema
  pm.storage_value.source_control_event.remote_publish_started.checkpoint.v1@1.0.0, exact SP-278 full-index publication
  and nine-field durable read token (DL-076, no persisted redb_snapshot_id). Rebuild never executes a command, native
  mutation, network request, lease grant/release, outbox, notification or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1213 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.publish_started
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_started
- pm.source_control_event.remote_publish_started.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1258 — source_control.remote.sync_completed prepared owner contract

```yaml
plan_unit_id: SCS-1258
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.sync_completed@1.0.0, prepared without
  admission under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority
  and Contracts_V0.md#EventRecord. Search and negative evidence: reports/event-authority-20261105/W3B-search.json
  entry source_control.remote.sync_completed; no existing exact closed event, producer/identity/consumer/checkpoint
  or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_sync_completed.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_sync owns this
  sync verified successful completion. The sync handler has resolved a known successful original operation receipt
  and independently verified the actual target and after revision; CLI exit alone is insufficient. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.remote.sync
  and its command_instance_id/idempotency/scope must join the actual source. The separately owned v2 local_reconcile_only
  request is also accepted exactly as SCS-025 defines; it never inherits transport-only v1 fields or invents a command-instance
  field absent from that selected schema.  Native admission freezes actual owner acceptance, permission/FileSafe
  and applicable capability/topology/revision/lease/credential evidence before effect. The original fact is committed
  in source_control_remote_sync_completed_fact via SP-1258, before this family''s append is attempted. Adopt SP-286
  and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own
  group issuance and crash behavior. Do not expose this event or dependent terminal success before the first issued
  receipt is resolved and joined to the original full EventRecord. For started facts append/resolve precedes native
  dispatch; for successful completion facts the native outcome source precedes append and terminal publication follows
  receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1258 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_sync_completed_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_sync_completed:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_sync_completed_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1258 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One original started sync operation reaches verified success. The completed fact resolves that
  exact start and original target; blocked, failed, cancelled, recovery_required or effect_unknown stays in its
  typed terminal receipt and cannot claim successful completion. For sync local_reconcile_only preserve both original
  and fork identities, fetched revision/fetch receipt and resolved native reconciliation strategy; require push_targets=[]
  and publish_performed=false. Publication is a separate admitted operation. Required predicates for this exact
  family: remote_target_ref resolves the original captured repository/remote/instance/account/native revision, never
  remote display text; writer, credential, capability, permission and FileSafe evidence joins the actual dispatch
  target; the original successful receipt and native observation prove the exact after revision, with no unresolved
  effect; local_reconcile_only has an empty push-target set and no publication; resolved strategy and both original/fork
  revisions match the accepted v2 request. Check every predicate separately; passing schema or a matching supplied
  digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_sync_completed.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.remote_sync_completed.history.v1@1.0.0 is its operating audit
  reader for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1258 binds
  key source_control_event.remote_sync_completed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema
  pm.storage_value.source_control_event.remote_sync_completed.checkpoint.v1@1.0.0, exact SP-278 full-index publication
  and nine-field durable read token (DL-076, no persisted redb_snapshot_id). Rebuild never executes a command, native
  mutation, network request, lease grant/release, outbox, notification or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1214 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.sync_completed
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_completed
- pm.source_control_event.remote_sync_completed.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1259 — source_control.remote.sync_started prepared owner contract

```yaml
plan_unit_id: SCS-1259
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.remote.sync_started@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-015 / SCS-016 / SCS-025, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.remote.sync_started;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.remote_sync_started.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::remote_sync owns this
  sync dispatch start. The sync handler has committed the exact admitted target, expected native revision, operation
  and ObservableWork before its first native effect. The original request is the exact v2 legacy_exact wrapper over
  the existing command request; cmd.source_control.remote.sync and its command_instance_id/idempotency/scope must
  join the actual source. The separately owned v2 local_reconcile_only request is also accepted exactly as SCS-025
  defines; it never inherits transport-only v1 fields or invents a command-instance field absent from that selected
  schema.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential
  evidence before effect. The original fact is committed in source_control_remote_sync_started_fact via SP-1259,
  before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value
  v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose this
  event or dependent terminal success before the first issued receipt is resolved and joined to the original full
  EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the native
  outcome source precedes append and terminal publication follows receipt. A failure to publish history never reruns
  the native effect.


  C4/C5 payload and identity: CV-1259 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_remote_sync_started_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:remote_sync_started:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-455 (E-CARDS-3 item 3.a, option A):
  RP-OPERATIONAL-2555D@1.0.0, kept seven years (2,555 days) from the original saved change, under the existing
  2,000,000-entry Project allowance and Storage’s Project first-save anchor adapter; retry, reprocessing and restore
  never restart its clock. The original source fact source_control_remote_sync_started_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter, the same policy as
  its DL-455 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1259 binds the source fact to the same policy as its event history (DL-510):
  RP-OPERATIONAL-2555D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: One accepted sync operation moves from admitted/no effect to started before native dispatch. No
  second native attempt is authorized by an append retry. An operation that is refused before admission has no started
  fact. For sync local_reconcile_only preserve both original and fork identities, fetched revision/fetch receipt
  and resolved native reconciliation strategy; require push_targets=[] and publish_performed=false. Publication
  is a separate admitted operation. Required predicates for this exact family: remote_target_ref resolves the original
  captured repository/remote/instance/account/native revision, never remote display text; writer, credential, capability,
  permission and FileSafe evidence joins the actual dispatch target; the start source is durable before the first
  native effect; local_reconcile_only has an empty push-target set and no publication; resolved strategy and both
  original/fork revisions match the accepted v2 request. Check every predicate separately; passing schema or a matching
  supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.remote_sync_started.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.remote_sync_started.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1259 binds key
  source_control_event.remote_sync_started.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.remote_sync_started.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1214 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.remote.sync_started
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_started
- pm.source_control_event.remote_sync_started.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1260 — source_control.repository.bound prepared owner contract

```yaml
plan_unit_id: SCS-1260
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.repository.bound@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-002, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.repository.bound;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.repository_bound.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::repository_bind owns this
  Project repository/workspace binding. The repository-bind handler has committed a verified repository/native-workspace
  binding to the actual Project and exact source context. The original request is the exact v2 legacy_exact wrapper
  over the existing command request; cmd.source_control.repository.bind and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_repository_bound_fact
  via SP-1260, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1260 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_repository_bound_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:repository_bound:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_repository_bound_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1260 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: An absent binding becomes the verified binding; an identical retry returns the original result
  and a competing binding refuses. Native identity, independent forge identity including none, Home Server and source
  topology are preserved. No implicit hosting connection, clone or new Project is created by this event. Required
  predicates for this exact family: binding resolves the requested Project/repository/backend/workspace and independent
  forge binding; native_revision equals the verified existing checkout, never a path or remote-name guess; a conflicting
  existing binding refuses without overwrite. Check every predicate separately; passing schema or a matching supplied
  digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.repository_bound.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.repository_bound.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1260 binds key
  source_control_event.repository_bound.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.repository_bound.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1215 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.repository.bound
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.bound
- pm.source_control_event.repository_bound.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1261 — source_control.repository.unbound prepared owner contract

```yaml
plan_unit_id: SCS-1261
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.repository.unbound@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-010, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.repository.unbound;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.repository_unbound.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::repository_unbind owns
  this removal of one exact Project repository binding. The repository-unbind handler has committed removal of the
  exact existing binding after resolving dependency and active-work dispositions. The original request is the exact
  v2 legacy_exact wrapper over the existing command request; cmd.source_control.repository.unbind and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_repository_unbound_fact
  via SP-1261, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1261 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_repository_unbound_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:repository_unbound:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_repository_unbound_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1261 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: The exact active binding becomes unbound; its ID and pre-removal context remain in history. This
  event cannot prove deletion of repository bytes, lease cleanup, Project deletion or remote removal. Missing/changed
  binding refuses; an acknowledged retry reads its original result. Required predicates for this exact family: the
  pre-removal binding is the same captured Project/repository/workspace binding; dependency and active-work disposition
  is actually settled in the original disposition receipt; only the selected binding is removed and native repository
  bytes are not inferred deleted. Check every predicate separately; passing schema or a matching supplied digest
  is not source authentication.


  C10 consumers/checkpoints: projector.source_control.repository_unbound.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.repository_unbound.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1261 binds key
  source_control_event.repository_unbound.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.repository_unbound.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1215 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.repository.unbound
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.unbound
- pm.source_control_event.repository_unbound.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1262 — source_control.status.refreshed prepared owner contract

```yaml
plan_unit_id: SCS-1262
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.status.refreshed@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-003, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.status.refreshed;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.status_refreshed.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::status_refresh owns this
  bounded current native status observation. The status-refresh handler has committed the bounded native status
  result for its captured repository and workspace under the read currentness fence. The original request is the
  exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.status.refresh and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_status_refreshed_fact
  via SP-1262, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1262 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_status_refreshed_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:status_refreshed:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-454 (E-CARDS-3 item 2.a, option A):
  RP-TELEMETRY-90D@1.0.0, kept for 90 days from the first successful save that survives a restart, under the existing
  2,000,000-entry Project allowance; retry, reprocessing and restore never restart its clock. The original source fact source_control_status_refreshed_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0, the same policy as
  its DL-454 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1262 binds the source fact to the same policy as its event history (DL-510):
  RP-TELEMETRY-90D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: A fresh observation supersedes display freshness only. Partial, stale and unavailable results
  keep those explicit states; no missing value becomes clean. Refresh performs no staged write, JJ snapshot, lease
  acquisition, selection, publication or command retry. Required predicates for this exact family: status_snapshot_ref
  resolves the original bounded native status result for this repository/workspace; observation_state and native_revision
  agree with the actual observation and completeness; read-only observation did not execute hooks, filters or a
  JJ snapshot. Check every predicate separately; passing schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.status_refreshed.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.status_refreshed.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1262 binds key
  source_control_event.status_refreshed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.status_refreshed.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1216 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.status.refreshed
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.status.refreshed
- pm.source_control_event.status_refreshed.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1263 — source_control.workspace.created prepared owner contract

```yaml
plan_unit_id: SCS-1263
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.workspace.created@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-008, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.workspace.created;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.workspace_created.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::workspace_create owns
  this backend-native workspace creation. The workspace-create handler has verified creation and binding of the
  requested backend-native workspace in its exact source context. The original request is the exact v2 legacy_exact
  wrapper over the existing command request; cmd.source_control.workspace.create and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_workspace_created_fact
  via SP-1263, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1263 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_workspace_created_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:workspace_created:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_workspace_created_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source. Snapshot bodies, native receipts, checkpoint contents, repository files and credential
  resources keep their independently assigned policies; no event reference retains their bodies implicitly. SP-1263 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: A previously absent requested native workspace is created and bound once. Conflict-plan, ownership
  and FileSafe/permission/writer fences precede effect. Git worktree and JJ workspace identities remain native;
  a failed or unknown result cannot claim creation or create an implicit checkout. Required predicates for this
  exact family: created_workspace_id equals the requested_workspace_id and observed native workspace; conflict plan
  and current writer/permission/FileSafe evidence admit that exact destination; original receipt proves known successful
  creation and exact caller return. Check every predicate separately; passing schema or a matching supplied digest
  is not source authentication.


  C10 consumers/checkpoints: projector.source_control.workspace_created.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.workspace_created.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1263 binds key
  source_control_event.workspace_created.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.workspace_created.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1216 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.workspace.created
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.created
- pm.source_control_event.workspace_created.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1264 — source_control.workspace.opened prepared owner contract

```yaml
plan_unit_id: SCS-1264
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.workspace.opened@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-010, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.workspace.opened;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.workspace_opened.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::workspace_open owns this
  opening an existing native workspace. The workspace-open handler has successfully resolved and opened the exact
  existing native workspace with a bounded current read result. The original request is the exact v2 legacy_exact
  wrapper over the existing command request; cmd.source_control.workspace.open and its command_instance_id/idempotency/scope
  must join the actual source.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable
  capability/topology/revision/lease/credential evidence before effect. The original fact is committed in source_control_workspace_opened_fact
  via SP-1264, before this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored
  full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose
  this event or dependent terminal success before the first issued receipt is resolved and joined to the original
  full EventRecord. For started facts append/resolve precedes native dispatch; for successful completion facts the
  native outcome source precedes append and terminal publication follows receipt. A failure to publish history never
  reruns the native effect.


  C4/C5 payload and identity: CV-1264 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_workspace_opened_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:workspace_opened:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-454 (E-CARDS-3 item 2.a, option A):
  RP-TELEMETRY-90D@1.0.0, kept for 90 days from the first successful save that survives a restart, under the existing
  2,000,000-entry Project allowance; retry, reprocessing and restore never restart its clock. The original source fact source_control_workspace_opened_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0, the same policy as
  its DL-454 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1264 binds the source fact to the same policy as its event history (DL-510):
  RP-TELEMETRY-90D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: Opening records successful access to an existing workspace and returns the exact captured caller
  context. It does not create/switch/remove a workspace, acquire a writer lease, initialize a backend or perform
  a native mutation. A later deliberate open has a new operation; receipt replay does not reopen it. Required predicates
  for this exact family: opened_workspace_id equals the existing requested native workspace and original open result;
  native_revision/backend/currentness are actual read evidence; open is not substituted for workspace.switch or
  creation. Check every predicate separately; passing schema or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.workspace_opened.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.workspace_opened.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1264 binds key
  source_control_event.workspace_opened.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.workspace_opened.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1217 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.workspace.opened
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.opened
- pm.source_control_event.workspace_opened.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1265 — source_control.workspace.removed prepared owner contract

```yaml
plan_unit_id: SCS-1265
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.workspace.removed@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-008, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.workspace.removed;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.workspace_removed.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::workspace_remove owns
  this backend-native workspace removal disposition. The workspace-remove handler has completed the exact native
  removal/binding disposition after ownership, dependency, active-work and data-disposition checks. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.workspace.remove
  and its command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner
  acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect.
  The original fact is committed in source_control_workspace_removed_fact via SP-1265, before this family''s append
  is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1;
  SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent terminal success before
  the first issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve
  precedes native dispatch; for successful completion facts the native outcome source precedes append and terminal
  publication follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1265 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_workspace_removed_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:workspace_removed:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_workspace_removed_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source. Snapshot bodies, native receipts, checkpoint contents, repository files and credential
  resources keep their independently assigned policies; no event reference retains their bodies implicitly. SP-1265 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: The selected existing workspace reaches its native owner-defined removed disposition. Retain the
  exact before identity and disposition receipt; removing a binding alone cannot prove deletion of bytes. No cleanup
  proof follows from lease expiry. Failure or effect_unknown is not removed. Required predicates for this exact
  family: removed_workspace_id matches the exact original workspace and native removal result; ownership/dependency/active-work/data-disposition
  checks are independently settled; receipt distinguishes native removal from merely unbinding and does not infer
  cleanup from expiry. Check every predicate separately; passing schema or a matching supplied digest is not source
  authentication.


  C10 consumers/checkpoints: projector.source_control.workspace_removed.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.workspace_removed.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1265 binds key
  source_control_event.workspace_removed.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.workspace_removed.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1217 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.workspace.removed
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.removed
- pm.source_control_event.workspace_removed.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1266 — source_control.workspace.switched prepared owner contract

```yaml
plan_unit_id: SCS-1266
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.workspace.switched@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-009, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.workspace.switched;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.workspace_switched.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / handlers::source_control::workspace_switch owns
  this switch to the exact native workspace. The workspace-switch handler has committed the switch to the explicitly
  requested existing backend-native workspace under the applicable revision/topology and writer fences. The original
  request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.workspace.switch
  and its command_instance_id/idempotency/scope must join the actual source.  Native admission freezes actual owner
  acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect.
  The original fact is committed in source_control_workspace_switched_fact via SP-1266, before this family''s append
  is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1;
  SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent terminal success before
  the first issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve
  precedes native dispatch; for successful completion facts the native outcome source precedes append and terminal
  publication follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1266 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_workspace_switched_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:workspace_switched:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-454 (E-CARDS-3 item 2.a, option A):
  RP-TELEMETRY-90D@1.0.0, kept for 90 days from the first successful save that survives a restart, under the existing
  2,000,000-entry Project allowance; retry, reprocessing and restore never restart its clock. The original source fact source_control_workspace_switched_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-TELEMETRY-90D@1.0.0, the same policy as
  its DL-454 history, so retained history always resolves its original source. Snapshot bodies,
  native receipts, checkpoint contents, repository files and credential resources keep their independently assigned
  policies; no event reference retains their bodies implicitly. SP-1266 binds the source fact to the same policy as its event history (DL-510):
  RP-TELEMETRY-90D@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: The captured previous workspace selection moves to the requested exact workspace; retain both
  identities and actual before/after revision. Focus, path, branch label or the compatibility select_worktree spelling
  cannot dispatch a second operation. No workspace is created or removed. Required predicates for this exact family:
  selected_workspace_id equals the original requested native workspace and observed switch result; previous_workspace_id
  is the captured actual selection, not current UI focus; compatibility select_worktree normalization occurs before
  one canonical command dispatch. Check every predicate separately; passing schema or a matching supplied digest
  is not source authentication.


  C10 consumers/checkpoints: projector.source_control.workspace_switched.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.workspace_switched.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1266 binds key
  source_control_event.workspace_switched.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.workspace_switched.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1218 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.workspace.switched
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.switched
- pm.source_control_event.workspace_switched.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1267 — source_control.writer_lease.granted prepared owner contract

```yaml
plan_unit_id: SCS-1267
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.writer_lease.granted@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-003, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.writer_lease.granted;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.writer_lease_granted.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / WriterLeaseCoordinator::grant owns this grant of
  one native repository/workspace writer lease. The Source Control writer-lease coordinator has committed one active
  lease for the exact repository/workspace/backend, holder, generation, epoch and expiry after reconciling any prior
  authority. original_request is null; the actual authenticated WriterLeaseCoordinator acceptance and original lease
  transition are the source, never a caller-created request.  Native admission freezes actual owner acceptance,
  permission/FileSafe and applicable capability/topology/revision/lease/credential evidence before effect. The original
  fact is committed in source_control_writer_lease_granted_fact via SP-1267, before this family''s append is attempted.
  Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347
  own group issuance and crash behavior. Do not expose this event or dependent terminal success before the first
  issued receipt is resolved and joined to the original full EventRecord. For started facts append/resolve precedes
  native dispatch; for successful completion facts the native outcome source precedes append and terminal publication
  follows receipt. A failure to publish history never reruns the native effect.


  C4/C5 payload and identity: CV-1267 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_writer_lease_granted_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:writer_lease_granted:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_writer_lease_granted_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1267 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: A requested or reconciled lease becomes active only when no competing active writer exists and
  prior obligations are clean. The event is evidence of the original grant; historical replay or backup restore
  never grants a current lease or treats expiry as cleanup proof. Required predicates for this exact family: the
  actual writer lease has the same repository/workspace/backend/holder/generation/epoch as the fact; no competing
  active writer exists and required previous reconciliation is clean; acquired/expiry times and currentness are
  verified by the lease owner, not supplied as payload authority. Check every predicate separately; passing schema
  or a matching supplied digest is not source authentication.


  C10 consumers/checkpoints: projector.source_control.writer_lease_granted.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.writer_lease_granted.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1267 binds key
  source_control_event.writer_lease_granted.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.writer_lease_granted.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1218 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.writer_lease.granted
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.granted
- pm.source_control_event.writer_lease_granted.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```

### SCS-1268 — source_control.writer_lease.lost prepared owner contract

```yaml
plan_unit_id: SCS-1268
unit_type: requirement
status: accepted
owner_doc: Plans/Source_Control_System.md
canonical_text: 'Newly authored owner contract for source_control.writer_lease.lost@1.0.0, prepared without admission
  under deck-2 item 9.a A. Reuse SCS-003, SCS-002/003 native command/lease authority and Contracts_V0.md#EventRecord.
  Search and negative evidence: reports/event-authority-20261105/W3B-search.json entry source_control.writer_lease.lost;
  no existing exact closed event, producer/identity/consumer/checkpoint or withdrawal binding was found.


  C1 membership/version: ABSENT. The proposed scope is project_only and payload pm.source_control_event.writer_lease_lost.payload.v1@1.0.0;
  no alias, sibling admission, app edition or current append is authorized. Backend pre-repository commands use
  their actual command Project lineage and exact Host/Environment, without a fabricated repo/workspace or writer
  lease. SCS-025 null-Project repository.inspect remains a separate receipt-only action.


  C2/C3 owner and producer: SourceControlOperationCoordinator / WriterLeaseCoordinator::lose owns this loss of one
  native repository/workspace writer lease. The Source Control writer-lease coordinator has committed loss of the
  previously active writer authority for the exact lease/holder/generation/epoch. original_request is null; the
  actual authenticated WriterLeaseCoordinator acceptance and original lease transition are the source, never a caller-created
  request.  Native admission freezes actual owner acceptance, permission/FileSafe and applicable capability/topology/revision/lease/credential
  evidence before effect. The original fact is committed in source_control_writer_lease_lost_fact via SP-1268, before
  this family''s append is attempted. Adopt SP-286 and CV-339 by name, including strict stored full-value v2 custody
  and storage.first_append_receipt.resolve_full_value.v1; SP-336/SP-347 own group issuance and crash behavior. Do not expose this event or dependent
  terminal success before the first issued receipt is resolved and joined to the original full EventRecord. For
  started facts append/resolve precedes native dispatch; for successful completion facts the native outcome source
  precedes append and terminal publication follows receipt. A failure to publish history never reruns the native
  effect.


  C4/C5 payload and identity: CV-1268 selects the closed schema and derives every payload field from that original
  source. Original operation identity is allocated once from native owner acceptance, preserved before effect; no
  timestamp, UI focus or fixture-supplied fresh flag identifies an operation. event_id is exactly evt_scs_writer_lease_lost_{hex(storage_instance_id)}_{hex(project_id)}_{hex(owner_operation_id)};
  idempotency_key is exactly scs:writer_lease_lost:{hex(storage_instance_id)}:{hex(project_id)}:{hex(owner_operation_id)}.
  hex means lowercase complete strict UTF-8 byte encoding, without normalization, truncation or delimiter ambiguity.
  Storage owns project~ base64url-no-pad partitioning, global event-ID integrity and scoped type/key lifetime. Use
  CV-317 producer_semantic_digest over exactly its caller-owned semantic fields; exclude Storage-assigned metadata.
  This family defines no new number/time or digest codec. Every required-present EventRecord lineage field joins
  the original source, with actual thread/run lineage when present and null node/attempt where absent; actor and
  requested/effective account refs are the actual authorized non-secret refs. Foreign family, scope, Project, operation,
  source or backend identities refuse.


  C6 replay/idempotency: new writes select dedupe_by_idempotency_key only. Same identity and same CV-317 semantic
  digest returns the exact first original result without effect; different digest is idempotency_conflict. Current
  append and retry reject projector_replay_only as replay_only_not_appendable. Resolve full original value before
  every retry, continuation or recovered terminal; unavailable original authority remains unavailable, including
  after an older backup. A genuinely new post-restore owner operation requires SP-286 fresh-operation admission.
  Retained history verifies its authenticated original schema/recipe edition, independent of changed live setup,
  revision, leases, credentials or retention settings. Historical projector_replay_only records valid when written
  remain passive reads; mismatched source/recipe/withdrawn data refuse.


  C7 retention: the saved event history of this family is bound by DL-453 (E-CARDS-3 item 1.a, option A):
  RP-AUTHORITY-INDEFINITE@1.0.0, kept permanently, with no age or count expiry and no new count allowance; retry,
  reprocessing and restore never restart its clock. The original source fact source_control_writer_lease_lost_fact is kept exactly as long as the history entry that points to it
  (DL-510, E-CARDS-6 E6-1, option A; Jared: "Same as the history"): RP-AUTHORITY-INDEFINITE@1.0.0, the same policy as
  its DL-453 history, so retained history always resolves its original source.
  Snapshot bodies, native receipts, checkpoint contents, repository files and credential resources keep their independently
  assigned policies; no event reference retains their bodies implicitly. SP-1268 binds the source fact to the same policy as its event history (DL-510):
  RP-AUTHORITY-INDEFINITE@1.0.0.


  C8 custody: original fact and original native evidence are held by the actual Home Server canonical store; agents,
  Clients and panels are readers, never alternate source authorities. Preserve immutable source bytes/hash/version
  and first-receipt custody in coherent Backup/restore closure under SCS-014 and SP-286. Revalidate read permission,
  Project deletion/holds and exact source custody on every read/replay/recovery. Store IDs and authorized refs only,
  no file or log bodies, credentials, private keys, tokens, protected auth/browser content, raw IPC endpoints or
  credential-bearing locators. Never reconstruct canonical source or an operation receipt from a projection, index,
  later current snapshot or event. Missing canonical evidence fences/discloses; derived damage quarantines then
  rebuilds.


  C9 transitions: An active lease moves to released, expired_pending_reconciliation, revoked or quarantined and
  mutation is fenced before any further effect. Expiry/revocation does not settle cleanup; retain the actual reconciliation
  state and obligations. Replaying loss neither releases a different lease nor acknowledges cleanup. Required predicates
  for this exact family: prior active lease and resulting non-authorizing state belong to the same original holder/generation/epoch;
  further mutation is fenced before effect after loss; expiry/revocation never becomes clean reconciliation or proof
  of removed resources. Check every predicate separately; passing schema or a matching supplied digest is not source
  authentication.


  C10 consumers/checkpoints: projector.source_control.writer_lease_lost.history.v1@1.0.0 writes only this family''s
  filtered passive history; reader.source_control.writer_lease_lost.history.v1@1.0.0 is its operating audit reader
  for existing Source Control Diagnostics & Receipts and permitted Backup/history inspection. SP-1268 binds key
  source_control_event.writer_lease_lost.checkpoint.v1:{hex(storage_instance_id)}:{hex(project_id)}, schema pm.storage_value.source_control_event.writer_lease_lost.checkpoint.v1@1.0.0,
  exact SP-278 full-index publication and nine-field durable read token (DL-076, no persisted redb_snapshot_id).
  Rebuild never executes a command, native mutation, network request, lease grant/release, outbox, notification
  or usage charge.


  C11 compatibility/withdrawal: retain exact 1.0.0 bytes and original recipe dispatch; no automatic alias, reinterpretation,
  backfill or migration from command results. Unknown editions quarantine. Withdrawal first fences this family''s
  append adapter and drains/quarantines accepted pending work at a recorded canonical cutoff under the owner/Storage
  writer gate, retaining issued original results. Freeze its filtered consumer at the verified cutoff. A separately
  reviewed successor reader and full governed rebuild verify all retained source/token joins before publication;
  only then retire the old reader/checkpoint. Never reset a cursor to zero silently or delete source evidence to
  withdraw a reader. Reader withdrawal cannot reactivate writes or erase retained history.


  C12 oracle plan: ATS-1219 and reports/event-authority-20261105/W3B-oracle-plan.json entry source_control.writer_lease.lost
  enumerate this family''s positive/negative obligations. Phase 2 (2026-11-13) executes them: scripts/pm_w3b_event_oracles.py refuses only through the generated Method B
  guard tables scripts/pm_w3b_table_*.py, whose predicates are the refusal tests; Plans/w3b_event_fixtures.json holds
  the positives and one-defect negatives, Plans/w3b_original_custody.json the sealed custody for SP-1101 retained
  reads, and the gated shared scripts/pm_guard_isolation.py proves the rows. Sol/Astra review of phase 2 is separate.
  Native execution NOT_RUN.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- SCS-003
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Source_Control_System.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.lost
- pm.source_control_event.writer_lease_lost.payload.v1
- DL-510
- SP-286
- SP-278
- projector_replay_only
```
