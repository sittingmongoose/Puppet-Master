# Project Sync and Backbone

> **Authority:** This document is the sole canonical owner for Project/Vault/app-content synchronization, Project move, source relocation, app-content update, and Sync-bundle semantics. It does not own Git operations, shared execution topology, provider lifecycle, secrets, or storage-engine mechanics.

## 1. Ownership boundary

Project Sync and Backbone owns the semantic operation that makes an accepted Project, its one physical Project Vault, and its app-owned Project content converge across an explicitly selected source and destination. It owns:

- Project/Vault content discovery and comparison;
- typed sync, copy, move, source-relocation, and app-content-update plans;
- source/destination identity, direction, inclusion/exclusion, conflict, and deletion policy;
- verified staging, digest/read-back, commit, rollback, and recovery receipts;
- Sync bundles used to transfer or restore Project-owned content;
- currentness projections consumed by onboarding, Server claim/bootstrap, Doctor, Containers, and the Shared Integration Runtime.

It does not own Git commit/branch/worktree/merge semantics (`Plans/WorktreeGitImprovement.md` and Source Control owners), execution identity or environment supervision (`Plans/Shared_Integration_Runtime.md`), transport/container capability (`Plans/Containers_Registry_and_Unraid.md`), credentials (`Plans/Permissions_System.md` and OS credential storage), or redb/seglog/Tantivy migration (`Plans/storage-plan.md`). A mounted path, matching path string, reachable host, or online transport is not proof that Project content is current.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

## 2. Project content identity and topology consumption

Every operation binds `project_id`, `project_vault_id`, `project_home_server_id`, source and destination `ExecutionHostId`, `ExecutionEnvironmentId`, `SourceLocationId`, `TopologyGeneration`, and an immutable content-selection digest. Project Sync consumes those runtime identities; it does not issue or replace them.

One Project has one physical Project Vault. A cache, worktree, checkout, mount, WSL path, container volume, Kubernetes volume, or remote mirror is a location or projection, not a second Vault. Equal paths on different Hosts or Environments are not interchangeable.

## 3. Transactional sync, move, and update

The operation lifecycle is `discovered`, `planned`, `awaiting_permission`, `awaiting_resource`, `staging`, `verifying`, `committing`, `current`, `blocked`, `failed`, `rollback_pending`, `rolled_back`, or `recovery_required`.

Before mutation, the owner records source and destination inventory digests, free-space/capability preflight, inclusion and exclusion rules, collision policy, expected byte/file counts, permission and FileSafe refs, and a recovery boundary. Mutation stages into the destination filesystem, validates type/size/hash and required metadata, commits by an owner-defined atomic boundary, performs read-back, and only then publishes `current`. Destructive source removal occurs only after destination verification and an explicit move policy. Failure preserves the last verified source and destination states and yields a typed rollback or recovery disposition.

Conflict outcomes are `no_conflict`, `source_wins_approved`, `destination_wins_approved`, `manual_merge_required`, `blocked_identity_mismatch`, or `blocked_policy`. Silent last-writer-wins is prohibited. Deletions are explicit plan entries and cannot be inferred solely from absence in a partial or stale inventory.

## 4. Sync bundles and recovery

A Sync bundle is a versioned manifest plus content-addressed payload references. It records Project/Vault identity, source topology generation, selection digest, entry digests, excluded paths, metadata support, redaction/secret scan result, producer version, and verification instructions. It contains no raw credential or local credential path.

Resume and recovery compare journal state, bundle/source digests, destination read-back, and the current topology generation. Outcomes are `resumed`, `replayed`, `rolled_back`, `quarantined`, `manual_recovery_required`, or `terminal_unknown_with_disclosure`. Missing evidence never becomes success.

## 5. Onboarding, Doctor, and platform consumers

- Product Onboarding may request a Project import or Project move but does not implement content transfer.
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
  Project Sync and Backbone owns seven exact Project Move commands and four exact PM content-update commands through
  two closed DRY request/result/error/availability/disabled/permission families, plus two typed presentation-only
  detail actions. Every command remains handler_unavailable until its named sole native handler and complete central
  integration exist; local actions create neither a semantic-domain handler nor a domain EventRecord.
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
source_lineage: [source_ref:server-command-gap-adjudication:rows-109-116, source_ref:server-command-gap-adjudication:rows-167-171]
negative_constraints:
  - Do not claim live-process serialization, early content activation, or success without verified readback.
  - Do not create a domain handler or EventRecord for either typed local details action.
  - Do not make any command available from schema, fixture, catalog prose, or static evidence alone.
```
