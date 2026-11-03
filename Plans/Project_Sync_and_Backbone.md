# Project Sync and Backbone

> **Authority:** This document is the sole canonical owner for Project/Vault/app-content synchronization, Project move, source relocation, app-content update, and Sync-bundle semantics. It does not own Git operations, shared execution topology, provider lifecycle, secrets, or storage-engine mechanics.

## 1. Ownership boundary

Project Sync and Backbone owns the semantic operation that makes an accepted Project, its one physical Project Vault, and its app-owned Project content converge across an explicitly selected source and destination. It owns: Repointing a Project after its folder was moved outside Puppet Master uses cmd.project.source_location.test then cmd.project.source_location.update with verified stable identity; it moves no content. Moving the content uses PSB-005 cmd.project.move.preflight/start and its verified copy/cutover/rollback lifecycle. Source Location testing is topology evidence, not Git/JJ/remote inspection; SCS-025 owns that inspection.

- Project/Vault content discovery and comparison;
- typed sync, copy, move, source-relocation, and app-content-update plans;
- source/destination identity, direction, inclusion/exclusion, conflict, and deletion policy;
- verified staging, digest/read-back, commit, rollback, and recovery receipts;
- Sync bundles used to transfer or restore Project-owned content;
- currentness projections consumed by onboarding, Server claim/bootstrap, Doctor, Containers, and the Shared Integration Runtime.

It does not own Git commit/branch/worktree/merge semantics (`Plans/WorktreeGitImprovement.md` and Source Control owners), execution identity or environment supervision (`Plans/Shared_Integration_Runtime.md`), transport/container capability (`Plans/Containers_Registry_and_Unraid.md`), credentials (`Plans/Permissions_System.md` and OS credential storage), or redb/seglog/Tantivy migration (`Plans/storage-plan.md`). A mounted path, matching path string, reachable host, or online transport is not proof that Project content is current.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

## 2. Project content identity and topology consumption

Every Project-content operation binds `project_id`, `project_vault_id`, `project_home_server_id`, source and destination `ExecutionHostId`, `ExecutionEnvironmentId`, `SourceLocationId`, `TopologyGeneration`, and an immutable content-selection digest. Project Sync consumes those runtime identities; it does not issue or replace them. The PSB-007 chat-sized app-source variant binds source Server/thread/app writer plus a real destination Project/Vault and the same exact topology/selection/currentness discipline; no Project is invented for the source.

One Project has one physical Project Vault. A cache, worktree, checkout, mount, WSL path, container volume, Kubernetes volume, or remote mirror is a location or projection, not a second Vault. Equal paths on different Hosts or Environments are not interchangeable.

## 3. Transactional sync, move, and update

The operation lifecycle is `discovered`, `planned`, `awaiting_permission`, `awaiting_resource`, `staging`, `verifying`, `committing`, `current`, `blocked`, `failed`, `rollback_pending`, `rolled_back`, or `recovery_required`.

Before mutation, the owner records source and destination inventory digests, free-space/capability preflight, inclusion and exclusion rules, collision policy, expected byte/file counts, permission and FileSafe refs, and a recovery boundary. Mutation stages into the destination filesystem, validates type/size/hash and required metadata, commits by an owner-defined atomic boundary, performs read-back, and only then publishes `current`. Destructive source removal occurs only after destination verification and an explicit move policy. Failure preserves the last verified source and destination states and yields a typed rollback or recovery disposition.

Conflict outcomes are `no_conflict`, `source_wins_approved`, `destination_wins_approved`, `manual_merge_required`, `blocked_identity_mismatch`, or `blocked_policy`. Silent last-writer-wins is prohibited. Deletions are explicit plan entries and cannot be inferred solely from absence in a partial or stale inventory.

## 4. Sync bundles and recovery

A Sync bundle is a versioned manifest plus content-addressed payload references. It records Project/Vault identity, source topology generation, selection digest, entry digests, excluded paths, metadata support, redaction/secret scan result, producer version, and verification instructions. It contains no raw credential or local credential path.

Resume and recovery compare journal state, bundle/source digests, destination read-back, and the current topology generation. Outcomes are `resumed`, `replayed`, `rolled_back`, `quarantined`, `manual_recovery_required`, or `terminal_unknown_with_disclosure`. Missing evidence never becomes success.

## 5. Onboarding, Doctor, and platform consumers

- Product Onboarding/New Project and app-chat conversion may request import/move, but only PSB-005/007 transfers content. source_location.update repoints an outside move and Source Control owns repository inspection; neither is a content-transfer alias.
- Server Claim/Bootstrap may request initial Project/Vault binding and an initial sync, but the sync remains owned here.
- Doctor consumes bounded currentness, conflict, capability, and recovery summaries and routes remediation to this owner.
- Containers, WSL, Kubernetes, SSH, and native-host owners expose capability and exact topology; they do not sync Project/app content.
- Storage persists this owner's accepted values and receipts but does not decide direction, collision, selection, or deletion policy.

## 6. PlanUnits

```yaml
plan_unit_id: PSB-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Project Sync and Backbone is the sole owner of Project/Vault/app-content sync, move, source relocation, update, and Sync-bundle semantics; it consumes runtime topology and does not re-own Git, transports, secrets, or storage engines.
gui_related: false
depends_on: [SIR-002]
unblocks: []
acceptance_criteria:
  - Every Project-content movement operation has one semantic owner.
  - Equal paths, mounts, online transports, and caches cannot become a second Project Vault or proof of currentness.
  - Git, Shared Runtime, Containers, Permissions, FileSafe, and Storage boundaries remain non-duplicated.
validation_surfaces: [owner-routing audit, Project identity contract fixtures]
risk_class: parallel_sync_owner
reasoning_tier: high
context_scope: project_sync_owner_boundary
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: project_sync_owner_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/EGOLITE_INTEGRATION_RUNTIME_RETURN.md#8-wsl-and-environment-profiles
```

```yaml
plan_unit_id: PSB-002
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Project sync, move, relocation, and update are explicit exact-topology transactions with immutable selection, collision and deletion policy, staged verification, read-back, rollback, and truthful recovery.
gui_related: true
gui_classification_reason: Sync conflict, progress, verification, rollback, and recovery state require user-visible projections.
depends_on: [PSB-001, SIR-006]
unblocks: []
acceptance_criteria:
  - A stale or partial inventory cannot authorize deletion or claim currentness.
  - Destructive source removal follows verified destination commit and explicit move policy.
  - Conflict and recovery outcomes use the closed vocabularies in this owner.
validation_surfaces: [sync fixture validation, interrupted-move recovery fixtures, conflict negative fixtures]
risk_class: project_content_loss
reasoning_tier: high
context_scope: transactional_project_sync
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md, Plans/FileSafe.md, Plans/Permissions_System.md]
node_compile_hint: {mode: transactional_project_sync, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md
```

```yaml
plan_unit_id: PSB-003
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Versioned Sync bundles preserve Project/Vault identity, exact source topology, immutable entry digests, exclusions, metadata capability, security scan, verification, and recovery without containing credentials or local credential paths.
gui_related: false
depends_on: [PSB-001, PSB-002]
unblocks: []
acceptance_criteria:
  - A Sync bundle cannot silently change Project, Vault, topology, selection, or entry identity.
  - Recovery never infers success from missing journal, digest, or read-back evidence.
  - Doctor and onboarding consume bounded status and route mutations back to this owner.
validation_surfaces: [bundle schema fixtures, secret/path negative fixtures, restart recovery fixtures]
risk_class: sync_bundle_custody_loss
reasoning_tier: high
context_scope: project_sync_bundle
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md, Plans/storage-plan.md]
node_compile_hint: {mode: project_sync_bundle, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
```

```yaml
plan_unit_id: PSB-004
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Server continuity while the client is offline is readable by Usage as a bounded operational record only; sync, move, relocation, and update time is local operational time and never provider usage, a slow load or a long transfer never becomes a billed provider attempt, and Project Sync and Backbone keeps sole authority over direction, selection, collision, deletion, and recovery while Usage issues no sync mutation.
gui_related: true
gui_classification_reason: Sync currentness and continuity-while-offline appear on the Usage page as explanations for elapsed time.
depends_on: [PSB-001, PSB-002, UF-091, UF-092]
unblocks: []
acceptance_criteria:
  - Usage renders bounded sync currentness and continuity projections and issues no sync, move, relocation, or update mutation.
  - Project sync and transfer time is attributed as operational time and never as provider usage or provider cost.
  - A slow load, a long transfer, or a stale currentness projection never becomes a billed provider attempt or a fabricated cost.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future Usage operational-attribution fixtures for sync continuity]
risk_class: sync_time_misattributed_as_provider_usage
reasoning_tier: high
context_scope: usage_sync_continuity_projection
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md, Plans/usage-feature.md]
node_compile_hint: {mode: usage_sync_continuity_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens: [server_continuity, project_move, current, terminal_unknown_with_disclosure]
negative_constraints:
  - Do not let Usage mutate sync direction, selection, collision, deletion, or recovery.
  - Do not attribute local sync or transfer time to a provider.
  - Do not turn a stale currentness projection into a usage or cost figure.
owner_hints: [Plans/Project_Sync_and_Backbone.md, Plans/usage-feature.md]
```

## 7. Stage boundary

These PlanUnits close canonical ownership only. They create no WorkNodes, NodeSeeds, WorkGraphs, queues, implementation manifests, runtime code, deployment code, or certification evidence. Generated shards, indexes, evidence, and governance seals remain pending the post-PNC seal handoff.

## 8. Server command-gap closure (2026-09-01)

`Plans/project_sync_backbone_contracts.schema.json` owns exactly two DRY typed families for this packet: `ProjectMoveCommandRequest|ProjectMoveCommandResult|ProjectMoveCommandError|ProjectMoveCommandAvailability|ProjectMoveDisabledReason|ProjectMovePermissionDecision` plus `ProjectMoveLocalActionRequest|ProjectMoveLocalActionResult`, and the parallel `ContentUpdate*` family. The schema carries each exact packet source ref and intended semantic; `Plans/project_sync_backbone_contract_fixtures.json` covers the two families without claiming runtime proof.

The Project Move command rows are:

| Row / packet line | Exact command and sole handler | Retained semantic |
|---|---|---|
| 109 / `machine/command_census.json:1254` | `cmd.project.move.cancel` -> `handlers::project_move::cancel` | Cancel the exact current move only when its semantic owner reports it cancellable. |
| 111 / `machine/command_census.json:1266` | `cmd.project.move.pause` -> `handlers::project_move::pause` | Request a durable safe-point pause; never freeze or serialize a live process as proof. |
| 112 / `machine/command_census.json:1272` | `cmd.project.move.preflight` -> `handlers::project_move::preflight` | Build an immutable Project/Vault move plan with exact topology, inventory, capacity, conflict, permission, FileSafe, recovery, and credential-readiness evidence. |
| 113 / `machine/command_census.json:1278` | `cmd.project.move.resume` -> `handlers::project_move::resume` | Resume the same fenced move from its durable continuation and current owner state. |
| 114 / `machine/command_census.json:1284` | `cmd.project.move.retry` -> `handlers::project_move::retry` | Retry the same idempotent move only after revalidating currentness and its typed failure. |
| 115 / `machine/command_census.json:1290` | `cmd.project.move.rollback` -> `handlers::project_move::rollback` | Restore the last verified placement from the exact recovery boundary or report `recovery_required`. |
| 116 / `machine/command_census.json:1296` | `cmd.project.move.start` -> `handlers::project_move::start` | Start the approved staged move while retaining the verified source and one-writer authority until cutover. |

`cmd.project.move.open_details` is not a domain command. It is source spelling for `ui.project.move.open_details`, a typed local bounded/redacted/lazy projection with an exact request/result, no semantic-domain handler, and no domain EventRecord.

The PM content-update rows are:

| Row / packet line | Exact command and sole handler | Retained semantic |
|---|---|---|
| 167 / `machine/command_census.json:2220` | `cmd.update.content.activate` -> `handlers::content_update::activate` | Atomically activate a verified staged PM content/catalog generation while retaining last-known-good rollback state. |
| 168 / `machine/command_census.json:2226` | `cmd.update.content.check` -> `handlers::content_update::check` | Run one coalesced, cached, policy-bounded check for the exact channel or catalog. |
| 169 / `machine/command_census.json:2232` | `cmd.update.content.download` -> `handlers::content_update::download` | Download and verify the selected artifact without activating it early. |
| 171 / `machine/command_census.json:2244` | `cmd.update.content.rollback` -> `handlers::content_update::rollback` | Roll back to a verified retained generation or report `recovery_required`. |

`cmd.update.content.open_details` is retained only as source spelling for `ui.update.content.open_details`, with the same no-domain-handler and no-domain-EventRecord local-action boundary. Project Move consumers are exactly Projects > Move Project, Settings > Hosting & Files, Doctor, and status bar. Content Update consumers are exactly Settings > Updates > Content, content attention/status, and Doctor.

All eleven commands are `handler_unavailable` until the exact named native handler has central registration, schema binding, permission/FileSafe integration, production wiring, and receipt-or-separately-admitted-event evidence. Asynchronous work uses `ObservableWork`; acceptance receipts remain receipt-only until Event Authority separately admits an exact family. Restart, duplicate, stale-generation, race, permission, FileSafe, secret-redaction, and exact-return outcomes fail closed.

The packet source base for every line above is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; the schema preserves each complete `packet_source_ref` byte-for-byte.

### PSB-005 - Project Move And Content Update Command Closure

```yaml
plan_unit_id: PSB-005
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: >-
  Project Sync and Backbone owns seven exact Project Move commands and four exact PM content-update
  commands through two closed DRY request/result/error/availability/disabled/permission families, plus two
  typed presentation-only detail actions. Every command remains handler_unavailable until its named sole
  native handler and complete central integration exist; local actions create neither a semantic-domain
  handler nor a domain EventRecord. Repointing a Project after its folder was moved outside Puppet Master
  uses cmd.project.source_location.test then cmd.project.source_location.update with verified stable
  identity; it moves no content. Moving the content uses PSB-005 cmd.project.move.preflight/start and its
  verified copy/cutover/rollback lifecycle. Source Location testing is topology evidence, not
  Git/JJ/remote inspection; SCS-025 owns that inspection.
gui_related: true
gui_classification_reason: Move/update availability, progress, blockers, recovery, details, and exact return are visible across the named GUI consumers.
depends_on: [PSB-001, PSB-002, PSB-003]
unblocks: []
acceptance_criteria:
  - The owner schema and fixtures cover exactly eleven commands and two local actions from adjudication rows 109-116 and 167-171.
  - Every command binds one named sole handler and remains handler_unavailable without exact native integration evidence.
  - Project Move and Content Update remain separate typed families and preserve exact packet semantics and source refs.
  - Local details actions mutate no domain state, invoke no semantic-domain handler, and emit no domain EventRecord.
  - Permission, FileSafe, idempotency, currentness, ObservableWork, restart/race, redaction, and exact-return negatives fail closed.
validation_surfaces: [Plans/project_sync_backbone_contracts.schema.json, Plans/project_sync_backbone_contract_fixtures.json, focused Server owner-bundle-B validator]
risk_class: project_move_or_content_update_false_success
reasoning_tier: high
context_scope: server_command_gap_project_sync_backbone
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md, Plans/project_sync_backbone_contracts.schema.json, future Project Move and Content Update native handlers]
node_compile_hint: {mode: project_sync_backbone_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_ref:server-command-gap-adjudication:rows-109-116"
  - "source_ref:server-command-gap-adjudication:rows-167-171"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
negative_constraints:
  - Do not claim live-process serialization, early content activation, or success without verified readback.
  - Do not create a domain handler or EventRecord for either typed local details action.
  - Do not make any command available from schema, fixture, catalog prose, or static evidence alone.
```

## Notebook Vault Move Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook, checkpoint, and transition records are Project Vault content and move with the Vault under the existing staged move: one-writer authority is retained until cutover, and after cutover the previous host's lease/generation is fenced so a late notebook or checkpoint writer on the old host is rejected with an explicit receipt (no silent last-writer-wins). The destination host resumes notebook-backed continuation only after current access and route validation, and PM note identities are retained across the move.

```yaml
plan_unit_id: PSB-006
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Notebook, checkpoint, and transition records move with the Project Vault under the staged one-writer cutover. After cutover, a stale writer on the previous host is fenced by lease/generation with an explicit receipt, the destination resumes only after access/route validation, and PM note identities are retained.
gui_related: false
gui_classification_reason: Vault move semantics are sync behavior, not GUI work.
depends_on: [PSB-005, SIR-037]
unblocks: []
acceptance_criteria:
  - Old host cannot keep writing notebook state after lease transfer.
  - Destination resumes only after current access/route validation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_writer
reasoning_tier: standard
context_scope: project_sync
implementation_surfaces: [Plans/Project_Sync_and_Backbone.md, Plans/Shared_Integration_Runtime.md, Plans/Server_System.md]
node_compile_hint: {mode: sync_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I11
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A47
preserved_exact_tokens: ["one-writer", "cutover", "fenced"]
negative_constraints:
  - Do not permit silent last-writer-wins on notebook records across hosts.
owner_hints: [Plans/Project_Sync_and_Backbone.md]
```

ContractRef: ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Server_System.md

### PSB-007 - Fenced Chat Sized Transfer Between Servers

```yaml
plan_unit_id: PSB-007
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Sync_and_Backbone.md
canonical_text: Chat-sized application-to-Project transfer reuses this owner's preflight, fencing, staging, verification,
  cutover and rollback discipline. Its immutable manifest names the actual source Server/thread/app writer, destination
  Project/Vault/Home Server/Host/source generation, content selection and per-owner association decisions. It enumerates
  exact notebook entries/checkpoints/payload/restriction refs, selected memory carry-over, owner_thing_previews
  and app search/cache/To-Do/absolute restore dispositions. It covers history, payloads, notebook, Goal/Crew/Plan
  successor or explicit rebind custody, pending schedules and their held dispositions. Every participating Computer
  must answer at start. Suspend timer/continuation admission, settle active operations/helpers to their owner safe
  boundary and fence source claims before staging. Keep source read-only and destination unlisted until verified
  copy/read-back, current permissions and the one-writer cutover claim commit. The new Project must be committed/listed
  before chat cutover. A cutover generation rejects late source writes, helper replies and due timers; replies can
  follow stable thread routes only after current target validation. On one Computer a failure rolls back unchanged
  created content and keeps the original live; across Servers interruption is visible paused work with Resume/Cancel,
  never two live copies or an offline speculative queue. Copy payload bytes across separate stores; same-store shared
  content retains references and holds. Source deletion follows successful verification and the explicit move policy
  only. Undo fences the destination and needs every participating Server; it restores only eligible unchanged content.
  Topology source_location.update repoints an outside move; it does not transfer content or replace Source Control
  inspection.
gui_related: false
gui_classification_reason: Defines identity, custody, admission or compiler boundaries; visual placement is consumed
  from GUI owners.
depends_on:
- SIR-055
- PSB-005
- PSB-006
unblocks: []
acceptance_criteria:
- Fail at each copy/check/cutover phase; source is recoverable and only one writer can resume.
- A timer fire/participant write racing cutover either settles once before the fence or refuses afterwards.
- Cross-Server Resume/Cancel/Undo requires reachable identities and fresh generations, not an earlier preview.
validation_surfaces:
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F-delivered semantic fixtures)'
- 'Phase 2: python3 scripts/pm-assistant-contract-check.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Project_Sync_and_Backbone.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N13-N20-N25; Goals-Crew-Plan-schedules
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
preserved_exact_tokens:
- Resume/Cancel
- source_location.update
- one-writer
- Goal/Crew/Plan
negative_constraints:
- No second Project registry, Vault, sync engine, offline queue or credential transfer.
- Do not rewrite an immutable Goal/Plan/Crew association or delete remote repositories/branches/backups.
owner_hints:
- Plans/Project_Sync_and_Backbone.md
```

ContractRef: ContractName:Plans/Project_Sync_and_Backbone.md#PSB-007, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md
