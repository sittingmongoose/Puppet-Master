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
