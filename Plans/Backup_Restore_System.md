# Backup And Restore System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes retained owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical product owner for Project Backup, Full Server Backup, independent backup repositories and multi-destination attempts, backup destinations and policies, portable backup manifests, repository encryption and RecoverySet/Recovery Kit custody orchestration, verification and test restore, portable-secret envelope orchestration, restore preview and modes, browse/retrieve delivery, restore identity/source/credential resolution, recovery-point receipt projection, retention decisions, backup/restore commands, and backup/restore readiness. Storage retains physical persistence and internal recovery mechanics; Settings transfer, Project Move, Duplicate With History, update safe points, authentication/credentials, and security policy retain their named owners.

## 0. Scope

Puppet Master has four distinct products that must never collapse into one export/import flow:

1. Storage-owned internal recovery snapshots and recovery points for crash, migration, pre-copy, pre-update, and pre-restore safety;
2. Settings-owned one-time Project Settings copy/transfer;
3. portable verified Project Backup for one Project Vault plus selected adjacent source state; and
4. portable verified Full Server Backup for the Server Catalog, selected/all Project Vaults, and selected Server-global state.

Project Move and Duplicate Project With History are also distinct user semantics even where they reuse manifest, hashing, encryption, staging, transfer, import, verification, or recovery primitives.

Backup/Restore owns portable product orchestration and receipts, not storage-engine internals. Storage physically separates `recovery/`, `restore-points/`, and `backups/`, performs atomic persistence and internal recovery, and exposes recovery evidence. Project Sync and Backbone owns Project Move authority transfer. Security and credential owners decide whether a secret/profile adapter is portable and authorize access. Backup owns the separate encrypted container and its manifest, never ordinary secret custody.

Accepted scope does not imply executable readiness. Until exact central commands, Event Authority admissions, storage families, sole handlers, production wiring, and runtime evidence exist, affected actions remain disabled with an exact missing-contract reason.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Settings_System.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Server_System.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Backup_Restore_System.md` owns:

- the product separation and user semantics for Project Backup and Full Server Backup versus internal recovery, Settings transfer, Project Move, and Duplicate With History;
- `BackupDestination`, `DestinationFamilyProfile`, `BackupRepositoryBinding`, `BackupPolicy`, `BackupRun`, `BackupDestinationAttempt`, `BackupManifest`, `BackupRetentionDecision`, `BackupScheduleOccurrence`, `RetentionPreview`, `RestoreRun`, `RestorePreview`, `BackupBrowseOperation`, `RecoverySetPublicRecord`, `RecoveryKitDeliverySession`, `PortableSecretEnvelope`, and the legacy-compatible `RecoveryKeyRecord` product contracts;
- required receipts `BackupReceipt`, `BackupVerificationReceipt`, `RestorePreviewReceipt`, `RestoreReceipt`, and `RecoveryPointReceipt`;
- canonical inclusion/exclusion classifications, consistency boundaries, source-code inclusion modes, incremental/parent relationships, version/compatibility metadata, relative path/size/hash evidence, and destination capability requirements;
- backup and restore state machines, safe-point/quiesce rules, phase journals, crash convergence, cancellation, retry, quarantine, rollback, verification, test restore, browse/verify-only, and derived-state rebuild;
- restore modes and identity/source/credential readiness resolution, including the exact post-restore classifications `Ready`, `Download/Verify Required`, `External Reattachment Required`, and `Sign-in Required`;
- opt-in portable-secret envelope orchestration, selected-subject manifest, security-profile reference, recovery-key record, adapter portability evidence, redaction, and restore authorization boundary; and
- backup/restore commands, Event Authority candidates, compact UI/Settings projections, history/details, disabled reasons, and acceptance evidence.

### 1.2 Retained owners

| Domain | Retained owner | Boundary consumed here |
|---|---|---|
| Physical persistence, seglog/redb/Tantivy, internal recovery, journals, atomic replacement, storage migration | `Plans/storage-plan.md` | Backup orchestrates portable products and consumes physical snapshot/restore primitives and receipts. |
| Project Settings transfer and ordinary setting semantics | `Plans/Settings_System.md` | Settings copy remains a configuration transaction, not a backup or Project byte transfer. |
| Project/Vault/app-content movement and Project Move one-writer cutover | `Plans/Project_Sync_and_Backbone.md` | Move may reuse portable primitives but keeps its own preflight, authority transfer, reconnection, and cutover receipt. |
| Server Catalog, Server/Client/trust records and classifications | `Plans/Server_System.md` | Full Server Backup consumes exact inclusion classes; it does not redefine identity or trust. |
| Runtime topology, resource admission, truthful work | `Plans/Shared_Integration_Runtime.md` | Backup/restore use exact topology and `ObservableWork`; they do not create a peer governor. |
| Permissions, FileSafe, credential/auth/profile portability and secret custody | Their named owner docs | Backup stores only selected encrypted envelope bytes or external refs after explicit owner authorization. |
| Release/update safe point and update rollback | `Plans/Release_Supply_Chain.md` and update owner | Backup can create pre-update evidence but does not own update activation. |
| Commands, Event Authority, Contracts, storage registry, UI catalog/wiring | Central owner docs | This owner defines domain semantics and schemas; central owners register producers and handlers. |
| Settings and shared GUI | `Plans/Settings_System.md`, `Plans/FinalGUISpec.md` | They render Backup & Restore manager/projections without owning backup behavior. |

### 1.3 Consumers

Settings, Product Onboarding, Doctor, Server System, Project cards, Project Move, Duplicate With History, update/migration safe-point consumers, permanent native/web Clients, command palette, natural-language routing, API/automation, Usage, and Runtime Artifacts consume this owner. Consumers must not create backup-private variants of destinations, policies, manifests, verification, retention, restore modes, receipts, readiness classifications, or secret envelopes.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Automated_Testing_System.md

## 2. Canonical PlanUnits

### BRS-001 - Backup And Restore Authority And Four-Product Separation

```yaml
plan_unit_id: BRS-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Plans/Backup_Restore_System.md is the sole product owner for Project Backup, Full Server Backup, destinations,
  policies, manifests, verification, test restore, portable-secret envelope orchestration, restore preview and modes,
  readiness, retention, and required backup/restore receipts. Internal recovery snapshots/recovery points, Settings
  transfer, Project Backup, and Full Server Backup remain four distinct products. Project Move and Duplicate With
  History also retain distinct semantics. Storage owns physical persistence and internal recovery; Settings owns
  transfer; Project Sync owns Move; credential/security owners retain secret portability and custody decisions.
gui_related: true
gui_classification_reason: The product split determines visible manager destinations, actions, labels, previews, and recovery choices.
depends_on: [PDS-003, PDS-005, SRV-001, SSYS-007, PSB-001]
unblocks: [BRS-002, BRS-003, BRS-004, BRS-005, BRS-006, BRS-007, BRS-008, BRS-009, BRS-010]
acceptance_criteria:
  - Owner maps route Project Backup, Full Server Backup, destination/policy, portable restore, verification, and receipts here.
  - Internal recovery, Settings transfer, Move, Duplicate With History, update, credentials, storage, commands, events, and GUI remain referenced owners.
  - No user flow or schema collapses the four products.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, python3 scripts/pm-plans-verify.py run-gates]
risk_class: backup_product_or_owner_collapse
reasoning_tier: high
context_scope: backup_restore_owner_routing
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json]
node_compile_hint: {mode: backup_restore_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:server-remote-backup-owner-adjudication-2026-08-31
  - source_ref:normalized-register:server-first-2026-08-31:B01-B03
preserved_exact_tokens: [internal recovery snapshot, Settings transfer, Project backup, Full Server backup]
negative_constraints: [Do not collapse the four products., Do not re-own physical storage or Project Move., Do not treat accepted scope as runtime readiness.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Settings_System.md, Plans/Project_Sync_and_Backbone.md]
```

### BRS-002 - Project And Full Server Backup Boundaries

```yaml
plan_unit_id: BRS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Project Backup is a portable verified backup of one Project Vault and, for every newly created normal policy, its
  Project files plus complete recoverable Git/Jujutsu object and operation closure. Advanced PM-data-only and selected-
  source scopes disclose every omitted dependency and never claim complete source/JJ recovery. Existing policies keep
  their prior scope until a human accepts a current scope preview; migration never silently expands cloud upload, and
  old snapshots retain their historical reduced-coverage labels. Included source closure covers dirty tracked files,
  approved untracked files, required LFS/submodule/alternate/shared-store objects, linked workspaces, actual JJ operation
  heads/views, and durable editor-buffer records without manufacturing a commit or operation. Full Server Backup adds
  the Server Catalog, selected or all Project Vaults, global settings/templates, trust metadata under policy,
  backup/update configuration, Integration Catalog and Installation manifests, auth/profile metadata, Runtime/Cluster/
  Registry connection definitions, and external-secret references. Exact included and excluded families are manifest
  data; one Project failure never mutates unrelated Projects.
gui_related: true
gui_classification_reason: Backup type, selected Projects/data, source inclusion, exclusions, and Project isolation are visible preview and details behavior.
depends_on: [BRS-001, SRV-002]
unblocks: [BRS-003, BRS-004, BRS-005, BRS-006]
acceptance_criteria:
  - Project Backup contains exactly one project_id and one Project Vault consistency boundary.
  - A new normal Project policy defaults to PM Project data plus Project files plus complete Git/JJ history; an existing policy requires an explicit scope-review receipt before any expansion.
  - Offline or mutating required sources produce waiting or partial capture truth, never a complete-source badge, while the prior complete backup remains selectable.
  - Full Server Backup names exact Catalog revision, selected/all Project IDs and Vault boundaries, and Server-global family selection.
  - Manifests exclude binaries, live runtime, rebuildable state, ordinary secret bytes, and raw OS credential-store bytes by default.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future one- and multi-Vault boundary tests]
risk_class: incomplete_or_overbroad_backup_boundary
reasoning_tier: high
context_scope: project_and_full_server_backup_boundaries
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, future backup planner]
node_compile_hint: {mode: backup_boundary_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BKP-001
  - source_ref:packet:2026-09-01:BKP-005-BKP-008
  - source_ref:packet:2026-09-01:BKP-011-BKP-012
  - source_ref:normalized-register:server-first-2026-08-31:B04-B07
  - source_ref:packet:backbone_v5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [Project Backup, Full Server Backup, Server Catalog, selected Projects, all Projects, PM data + files + Git/JJ history, Waiting for source]
negative_constraints: [Do not include raw OS keychain bytes., Do not include live PTYs processes ports or browser processes., Do not let one Project backup mutate another Project., Do not silently expand an existing policy., Do not manufacture Git commits or JJ operations., Do not claim complete JJ recovery from a text log Git push mirror clone or Git bundle alone.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Server_System.md, Plans/storage-plan.md]
```

### BRS-003 - Default Secret Exclusion And Portable Secret Envelope

```yaml
plan_unit_id: BRS-003
unit_type: security_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Ordinary Project and Full Server backups exclude secret bytes and CLI-profile roots by default. Normal restore creates
  non-secret profile placeholders and a readiness checklist rather than claiming credentials were restored. Advanced
  opt-in portable-secret backup uses a separate encrypted and authenticated PortableSecretEnvelope with explicit
  provider/secret selection, RecoveryKeyRecord, security-profile and KDF/AEAD metadata references, selected-subject
  manifest, adapter portability evidence, authorization and recovery-key custody refs, and ciphertext integrity proof.
  Raw values never enter ordinary manifests, events, logs, command history, URLs, Chat, Usage, or projections. External
  secret references are preferred. CLI-owned, OS-keychain, workload, cookie, hardware- and machine-bound identities
  remain excluded unless their owner adapter proves portability and authorizes export and restore.
gui_related: true
gui_classification_reason: Opt-in warnings, selection, recovery-key handling, excluded/placeholder state, and post-restore sign-in requirements are visible.
depends_on: [BRS-002, SSYS-008]
unblocks: [BRS-004, BRS-006, BRS-007]
acceptance_criteria:
  - No secret bytes or CLI-profile roots appear without separate advanced opt-in and owner adapter authorization.
  - The portable envelope is independently encryptable/removable and cannot be confused with the ordinary manifest.
  - Restore without the envelope produces placeholders and exact readiness classification, never false Ready.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future secret-redaction and adapter-portability tests]
risk_class: backup_secret_exposure_or_false_credential_readiness
reasoning_tier: high
context_scope: portable_secret_envelope
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, future security adapter registry]
node_compile_hint: {mode: portable_secret_envelope_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:B07-B09
  - source_ref:packet:backbone_v5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [PortableSecretEnvelope, RecoveryKeyRecord, KDF, AEAD, Sign-in Required]
negative_constraints: [Do not include secrets by default., Do not export unapproved CLI profiles or raw keychain bytes., Do not expose secret material in ordinary evidence surfaces.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Permissions_System.md, Plans/FileSafe.md, Plans/Multi-Account.md]
```

### BRS-004 - Destination, Policy, Manifest, Retention, And Verification

For exactly `cmd.backup.destination.test` and `cmd.backup.destination.remove`, a closed original preserves selected Server/destination/generation, permission/currentness and caller with explicit action operands. Test preserves `read_only` or `approved_canary`; only the latter may consume authentic destination-owner scratch admission for one named random canary under the approved prefix. Existing BRS-013/018 prohibitions remain exact: no repository initialization/deletion, ACL/public-access change, billable-resource creation or guessed capability. Actual per-capability observations remain distinct from untested/unsupported/failed outcomes. Partial/unknown canary effects and cleanup obligations survive failure/cancellation; cleanup touches only the same admitted object and uncertain effects require reconciliation, not blind repeat.

Removal consumes the actual reviewed configuration/generation and existing owner-resolved dependency consequences, explicit `delete_data=false` and existing confirmation. It removes only destination registration, never external repository data or credential-owner state, and cannot silently rewrite policies/repository bindings or choose a replacement. Missing dependency authority is a blocked prerequisite, not an invented cascade. Actual registry absence is a typed owner observation, not a fabricated disabled destination or erased original state. Existing BackupDestination v2/v3, BackupPolicy and BackupRepositoryBinding values retain their meanings; the v3 update-custody edition is not a test/removal receipt.

The new narrow destination lifecycle receipt and SIR original/common-response binding explicitly materialize actual test/disconnect outcome, state/membership, partial/unknown effects, cleanup and safe error/recovery evidence. They are not capture/verification/restore receipts. Original identity/arguments, canonical digest, authentic admission, native source/effect proof and current final disclosure remain mandatory; accepted asynchronous work requires genuine ObservableWork and is never terminal success. Caller loss/replay cannot repeat a canary or disconnect. Logical receipt/original custody requires separate physical admission before persistence; no store, retention duration, crypto/default, new command, native handler, EventRecord or readiness is introduced by this specification.

`Plans/backup_destination_lifecycle_contracts.schema.json` materializes exactly destination test/removal. The closed request composes the unchanged Backup command authority with operation identity, authentic before-destination reference and explicit test/removal operands. `pm.backup.destination_lifecycle.receipt.v1` is the newly named DestinationLifecycleReceipt, binding the admitted original/SIR binding, actual observation, effects, error/currentness and safe nullable UI error. It is not a capture/restore receipt. Typed scratch admission, eleven independent capability observations, same-canary cleanup evidence, reviewed typed existing Policy/RepositoryBinding dependencies and actual registry membership preserve the BRS013/018 rules. The result's explicit known/unknown effects are independent of success/failure/cancellation. Unknown effects retain reconciliation, and a failed cleanup does not erase an existing canary. A completed read-only test cannot manufacture tested write/delete/lock behavior, and unsupported is not failed/unavailable/not-run. Read-only may preserve an optional selected nonsecret prefix but gains no scratch mutation admission. No test edits destination configuration; owner-derived health/currentness may change only under actual native authority. Removal represents observed absence, not a disabled destination or a policy/repository/credential rewrite.

For the Doctor read-only owner-query protocol, BackupCoordinator owns
`pm.backup_restore_system.repository_read_request.v1` in
`Plans/doctor_query_controller_contracts.schema.json#/$defs/backup_repository_read_request`.
The query selects the exact repository binding, repository, Server and original
currentness under its unique query identity. It returns the authentic existing
`backup_repository_binding`, not a reconstructed binding or a Doctor-authored
health result. The owner validates the requested identity/currentness and actual
read admission before reading and checks current disclosure after resolution.
This is a bounded nonsecret metadata read only: it does not unlock, discover or
scan repositories, verify snapshots, alter maintenance authority or imply that
stored data is healthy or recoverable. Query completion, the binding's observed
state and verified Backup health remain distinct. Doctor's common envelope
cannot widen this leaf query; native owner issuance, storage/currentness fences
and permission proof remain required.

```yaml
plan_unit_id: BRS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  A BackupDestination identifies one admitted destination-family profile, non-secret locator, owning Server, auth/profile
  references, repository discovery/currentness, and evidenced capabilities. Each Project has an independently recoverable
  BackupRepositoryBinding; Full Server Backup uses a separate Catalog repository/set. Sharing a destination, credential,
  bucket, account, or RecoverySet does not merge repository authority, writer locks, retention, corruption fate, or
  recovery identity. BackupPolicy binds Project or Server scope, manual/automatic mode, an ordered non-empty list of
  repository/destination bindings, selected families, source inclusion, portable-secret option, schedule, retention,
  verification, and expected revision. One BackupRun records independent per-destination attempts; a failed destination
  cannot erase or turn successful copies green. BackupManifest records backup ID/type/time, Server and Project identities, app/storage/
  protocol versions and compatibility range, consistency boundaries, included/excluded families, relative object paths,
  sizes and hashes, encryption/security metadata refs, source Host/Environment, source-code inclusion mode, verification,
  and parent/incremental relationship. Retention is a durable decision with protected/held generations never deleted.
  cmd.backup.destination.update consumes the selected destination, its expected current generation and an explicit
  typed nonsecret patch of destination-owned editable configuration. Identity alone or focused form state cannot
  supply the edit. The actual destination owner validates the patch and all referenced configuration against its
  current field, auth and permission contracts; caller-supplied health or capability claims are not configuration.
  The result preserves destination identity and unedited configuration fields and binds the applied patch and resulting generation.
  Owner-derived health, capabilities, test disposition and currentness describe the actual resulting effective configuration;
  a previous test remains current only when its authentic test scope remains applicable to that configuration.
  A matching receipt reference or a formerly ready state cannot supply that applicability. This does not require a new test for a label-only edit
  when the owner establishes that its existing proof remains applicable, and no fixed generation increment is implied.
  An edit grants no implicit credential issuance, repository reassignment, backend deletion or successful test.
  Doctor may read an exact existing nonsecret repository binding through BackupCoordinator's typed metadata
  query under current read/disclosure authority; query completion cannot manufacture verification or health.
gui_related: true
gui_classification_reason: Destination, policy, schedule/retention, selected data, storage use, verification, protection, and history are visible manager behavior.
depends_on: [BRS-002, BRS-003]
unblocks: [BRS-005, BRS-006, BRS-007, BRS-008]
acceptance_criteria:
  - Destination test verifies declared capabilities and write/read/delete or protection behavior without destructive guessing.
  - Destination test preserves the explicit read_only or approved_canary selection and, for a canary, the approved scratch-prefix binding; the existing bounded-safe-test and cleanup rules apply. Destination removal reviews the exact configuration/generation and removes only that binding, never repository data. Discovery binds the selected destination and approved prefix; any continuation remains scoped to that same selection rather than discovering an implicit different destination.
  - Each Project repository and the separate Catalog repository can be unlocked, verified, quarantined, retained, pruned, and restored without coupling an unrelated Project.
  - A multi-destination run preserves each attempt's immutable snapshot ID, upload state, failure, and evidence independently.
  - Destination update requires the actual typed nonsecret patch and exact current destination/Server/generation; a missing operand, stale target or unauthorized referenced configuration cannot apply.
  - An applied destination result resolves the actual owner output and preserves every unedited configuration field; no-change is explicit and neither outcome creates readiness, credentials or remote data effects.
  - A changed locator or authorization premise cannot inherit an inapplicable ready, capability or test claim; a label-only edit may retain authentic applicable evidence without implying a new test or fixed generation increment.
  - Manifest covers every included object with relative path, byte size, digest, family, and consistency boundary and names exclusions.
  - Retention cannot delete protected, held, active-parent, last-known-good, or recovery-required generations.
  - Explicit snapshot deletion consumes the existing RetentionPreview for the exact selected immutable candidate set and repository/policy revisions, candidate hash, current confirmation and maintenance lease. A backup label or confirmation alone cannot choose a different set. Existing protected/held/required-generation exclusions remain mandatory; this contract introduces no hold override.
  - The selected-delete successor for `cmd.backup.delete` resolves every original selected immutable snapshot through its actual snapshot owner and joins the resulting repository snapshot references to the entire RetentionPreview candidate set, ignoring order but rejecting duplicates, substitutions, missing members and extra members. Snapshot IDs, repository snapshot references and evaluated backup IDs are not interchangeable. Actual repository/policy revisions, candidate hash, preview expiry/currentness, confirmation, maintenance lease and retention exclusions are checked by their existing owners before effects; a confirmation cannot waive a protected, held, active-parent, last-known-good or recovery-required generation.
  - Selected deletion has a dedicated typed effect observation and receipt, not a capture BackupReceipt. The result accounts for every original selected member and preserves known partial effects, unresolved members and unknown effects across failure or cancellation. Unknown effects require reconciliation of the same operation rather than blind repeat. Snapshot forgetting does not authorize reachability prune, backend byte reclamation, destination removal or credential deletion. The companion also binds the actual original SIR identity/request/caller, result/receipt, accepted work where applicable, common outcome and safe nullable error disclosure; references alone do not close these joins. Native authority/effect/disclosure and physical custody remain separate implementation obligations, with no new store or retention period implied.
  - The Doctor repository metadata query binds exact repository, binding, Server and currentness to the authentic returned binding and cannot unlock, scan, verify, mutate or label Backup healthy merely because its read completed.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, Plans/doctor_query_controller_contracts.schema.json, Plans/doctor_query_controller_contract_fixtures.json, future offline partial-write protection and retention tests]
risk_class: destination_partial_write_or_manifest_omission
reasoning_tier: high
context_scope: backup_destination_policy_manifest
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, future destination adapter and retention service]
node_compile_hint: {mode: backup_destination_manifest_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BKP-003
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-089
  - source_ref:packet:2026-09-01:BKP-009
  - source_ref:packet:2026-09-01:CLOUD-001-CLOUD-008
  - source_ref:normalized-register:server-first-2026-08-31:B09-B11
  - Plans/newtools.md#N2-152
  - source_ref:packet:backbone_v5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [BackupDestination, BackupPolicy, BackupManifest, BackupRetentionDecision, incremental, parent, cmd.backup.destination.update]
negative_constraints: [Do not use absolute source paths as portable object paths., Do not delete protected or held backups., Do not call an unverified partial write complete., Do not collapse repository authority or multi-destination attempts into one scalar state., Do not make a remote backup backend canonical PM state.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md]
```

### BRS-005 - Backup State, Consistency, Safe Points, And Crash Convergence

```yaml
plan_unit_id: BRS-005
unit_type: recovery_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  BackupRun uses the superseding primary phases planned, waiting_for_source, waiting_for_unlock,
  acquiring_capture_barrier, capturing, staged, encrypting_uploading, committing_remote_snapshot,
  verifying_structure, verifying_data, completed, partial, failed, and cancelled. Capture completeness, every
  destination upload state, integrity verification level, and isolated restore-test status are independent axes; a
  committed snapshot is neither verified data nor restore-tested by implication. Destructive or migration/update-safe
  operations require a verified RecoveryPointReceipt before staging or activation. The Server coordinates a consistency fence across the Catalog and selected Vault generations,
  settles or journals in-flight mutation, records exact included generations, writes destination staging, verifies, and
  atomically publishes a completion marker. A durable phase journal makes restart converge to resume, complete,
  completed/partial, rollback/cleanup, quarantine, failed, or recovery_required. Missing evidence and destination
  disappearance never become success. Cancellation is phase-aware and cannot delete the last verified generation.
gui_related: true
gui_classification_reason: Backup phase, wait reason, determinate/indeterminate progress, cancellation, verification, quarantine, and recovery state are visible.
depends_on: [BRS-004, SIR-006, SIR-012]
unblocks: [BRS-006, BRS-007, BRS-009]
acceptance_criteria:
  - Multi-Vault Full Server consistency records exact Catalog and Vault generations under one manifest boundary.
  - Process death, ENOSPC, EIO, destination loss, and partial write at every phase converge without false completion.
  - Completed means capture scope and all required remote commits completed; verification and restore-test badges are derived only from their independent evidence axes.
  - A committed but unverified snapshot, a structurally verified but unread snapshot, and a snapshot without a restore drill remain visibly distinct.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future per-phase crash and consistency-fence tests]
risk_class: inconsistent_backup_or_false_completion
reasoning_tier: high
context_scope: backup_state_and_crash_convergence
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/storage-plan.md, future backup coordinator]
node_compile_hint: {mode: backup_crash_convergence_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BKP-004-BKP-005
  - source_ref:packet:2026-09-01:BKP-009-BKP-010
  - source_ref:normalized-register:server-first-2026-08-31:B02-B11
  - source_ref:packet:B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md
preserved_exact_tokens: [planned, waiting_for_source, waiting_for_unlock, acquiring_capture_barrier, capturing, staged, encrypting_uploading, committing_remote_snapshot, verifying_structure, verifying_data, completed, partial, failed, cancelled, RecoveryPointReceipt, recovery_required]
negative_constraints: [Do not call an unverified backup verified., Do not activate destructive work without the BRS-023 recovery prerequisite., Do not infer success from missing journal or destination evidence., Do not inherit verification or drill evidence across snapshots., Do not collapse per-destination failure into aggregate success.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Shared_Integration_Runtime.md]
```

### BRS-006 - Restore Preview, Modes, Quarantine, Derived Rebuild, And Rollback

```yaml
plan_unit_id: BRS-006
unit_type: recovery_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  RestoreRun has exactly four mutating modes: as_new, in_place, selective, and server_full. Settings merge/replace is an
  orthogonal settings_strategy used only where the selected families support it. Browse, verify, download, extract,
  compare, export, and archive retrieval are separate read/delivery operations and never RestoreRun modes. Every mutating restore reads and verifies the manifest,
  checks compatibility, produces RestorePreviewReceipt, obtains approval, satisfies the BRS-023 verified recovery-point
  prerequisite or its narrowly validated emergency-consent alternative, stages into quarantine, verifies staged hashes
  and schema/storage compatibility, resolves identity, credentials, and source locations, quiesces the target, activates
  atomically where supported or through a journaled recoverable boundary otherwise, rebuilds derived state, performs
  post-restore verification, invalidates stale Client caches, and exposes rollback only when a real recovery point exists. Restore as New creates a new
  project_id and rewrites identity-bearing refs; selective restore accepts only independently valid families;
  Read-only browse/retrieve never activates content. Restart uses the phase journal to resume, rollback, quarantine, or recovery_required.
gui_related: true
gui_classification_reason: Restore preview, mode selection, conflicts, approval, quarantine, progress, readiness, rollback, and verify-only state are visible workflows.
depends_on: [BRS-003, BRS-004, BRS-005]
unblocks: [BRS-007, BRS-008, BRS-009]
acceptance_criteria:
  - Browse/retrieve operations perform no activation and emit bounded read/delivery evidence independently of RestoreRun.
  - Restore preview production preserves the original selected immutable snapshots, mode, target and requested path/identity mapping in the actual RestorePreview and its typed source/target changes. Execution consumes that same approved preview; server_full uses its existing identity_policy and fenced identity-resolution contract, never a duplicate conflicting request policy or a fifth mode.
  - Every mode requires the BRS-023 pre-staging recovery prerequisite; emergency consent never creates a recovery point or rollback capability, and activation truth follows BRS-019.
  - All nineteen phases persist without requiring evidence from a future phase; completed and mutation-applied states retain their actual prerequisites and verification evidence.
  - as_new rewrites every identity-bearing reference and cannot collide with an existing project_id.
  - Derived state is rebuilt from canonical restored bytes and is never trusted as portable authority.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, tests/test_pm_restore_phase_contracts.py, future native restore-mode and per-phase crash tests]
risk_class: destructive_restore_or_identity_collision
reasoning_tier: high
context_scope: restore_preview_modes_and_recovery
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/storage-plan.md, future restore coordinator]
node_compile_hint: {mode: restore_safety_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-001-REST-009
  - source_ref:normalized-register:server-first-2026-08-31:B12-B16
  - source_ref:packet:B5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [as_new, in_place, selective, server_full, settings_strategy, Browse never activates]
negative_constraints: [Do not model browse or retrieve as a mutating restore mode., Do not restore without the BRS-023 recovery prerequisite., Do not activate unverified staged data., Do not trust portable derived indexes., Do not restore tsnet identity by default.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Server_System.md]
```

### BRS-007 - Required Receipts And Post-Restore Readiness

```yaml
plan_unit_id: BRS-007
unit_type: contract_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Required durable types are BackupReceipt, BackupVerificationReceipt, RestorePreviewReceipt, RestoreReceipt, and
  RecoveryPointReceipt. Receipts bind stable operation, backup, manifest, destination, Server, Project, Vault, policy,
  topology and generation identities; correlation/idempotency; phase/terminal status; exact included/excluded families;
  verification and test-restore evidence; started/completed timestamps; currentness; failure, quarantine, recovery and
  rollback refs; and redaction profile. RestoreReceipt classifies every restored integration/profile/connection as
  Ready, Download/Verify Required, External Reattachment Required, or Sign-in Required. A restored manifest or
  installation definition cannot by itself produce Ready. Receipts contain no raw secret, recovery credential, absolute
  source path, callback URL, session token, or protected-browser content.
gui_related: true
gui_classification_reason: Receipt drill-through, verification, failure/recovery, rollback, and readiness checklists are user-visible.
depends_on: [BRS-003, BRS-005, BRS-006]
unblocks: [BRS-008, BRS-010]
acceptance_criteria:
  - All five required receipt definitions exist in the machine schema with exact names and terminal rules.
  - Ready requires fresh post-restore evidence; absent or stale evidence resolves to one of the three non-ready classifications.
  - Receipt redaction rejects raw secret/callback/session/absolute-path fields.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future receipt/currentness and readiness tests]
risk_class: false_backup_or_restore_receipt
reasoning_tier: high
context_scope: backup_restore_receipts_and_readiness
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, future receipt persistence and UI]
node_compile_hint: {mode: backup_restore_receipt_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:B15
  - source_ref:normalized-register:server-first-2026-08-31:G08
preserved_exact_tokens: [BackupReceipt, BackupVerificationReceipt, RestorePreviewReceipt, RestoreReceipt, RecoveryPointReceipt, Ready, Download/Verify Required, External Reattachment Required, Sign-in Required]
negative_constraints: [Do not call a restored manifest Ready., Do not omit non-ready classifications., Do not include secret or machine-local path material in receipts.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### BRS-008 - Canonical Backup Restore Commands, Events, And UI

```yaml
plan_unit_id: BRS-008
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Settings, Onboarding, Doctor, Server and Project cards, native/web UI, palette, natural-language routing, API, and
  automation use the exact 41 cmd.backup and cmd.restore IDs listed here. One owner-DRY discriminated schema now specifies
  typed request/result/error/availability records; action classes require exact target identity, currentness, preview,
  recovery point, approval, confirmation, destination generation, and policy revision where applicable. Runtime still requires
  ObservableWork, one sole handler, admitted event or explicit receipt-only effect, production wiring, accessibility and
  focus return, native/web parity, and regression evidence. Normal Data Backup and Retention shows Automatic Backups,
  explicit Server/Project scope, protected data, destination cards, Encryption enabled, Last complete remote backup,
  verification level/time, Recovery Kit status, Back Up Now, Restore, and Add Destination. History/Browse, Destinations,
  Schedule/Retention/Holds, Recovery and Keys, and Advanced/Diagnostics own detailed work. Missing executable
  contracts disable the affected action without reverting accepted scope.
  Current dispatch of cmd.backup.destination.update, cmd.backup.verify, cmd.backup.test_restore and
  cmd.backup.file.compare requires the actual owner-defined selection and operation operands below, not only a
  generic target or receipt reference. The actual owner joins original command instance, selected input, current
  authority and resolved operation/result evidence. Historical requests lacking these operands remain readable;
  reading, replay or migration cannot invent a patch, verification level, snapshot set, drill target/coverage or
  comparison revision, or admit such a historical request as a current effect. The other 37 command contracts
  and the exact 41 command IDs remain unchanged by this input-depth requirement. BRS-030 owns the corresponding
  original-operation, source resolution, result custody and replay protocol; an input schema alone does not satisfy it.
gui_related: true
gui_classification_reason: This unit defines all visible backup/restore actions, compact cards, advanced manager fields, progress, receipts, and disabled states.
depends_on: [BRS-004, BRS-005, BRS-006, BRS-007]
unblocks: [SSYS-012]
acceptance_criteria:
  - All 41 exact command IDs validate through one owner-DRY request/result/error/availability schema and action-specific negative fixtures.
  - Every listed command has one central command/UI row, sole handler, permission path, receipt/event disposition, and production wiring row before enablement.
  - Compact UI preserves the four-product distinction and does not imply secrets are included by default.
  - Native/web/palette/NL/API/automation routes share exact identity, handler, receipt, and currentness behavior.
  - The four operand-bearing commands reject missing or substituted selections through current admission and join actual owner results to the original request; matching strings, a caller facts wrapper or a receipt list alone is not proof.
  - Historical read compatibility cannot bypass these four current input contracts; other command semantics, sole handlers, permission owners, event dispositions and runtime-unavailable boundaries remain unchanged.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future production wiring reverse coverage, future native web UI tests]
risk_class: backup_action_without_safety_or_wiring
reasoning_tier: high
context_scope: backup_restore_commands_events_and_ui
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: backup_restore_command_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BGUI-001-BGUI-005
  - source_ref:packet:2026-09-01:ACT-088-ACT-128
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-004
  - source_ref:normalized-register:server-first-2026-08-31:B17-B18
  - source_ref:normalized-register:server-first-2026-08-31:G05-G08
preserved_exact_tokens: [Data Backup and Retention, Automatic Backups On / Off, Last complete remote backup, Back Up Now, Restore, Add Destination, cmd.backup.server.create, cmd.restore.server_full]
negative_constraints: [Do not enable unregistered commands., Do not create Settings Doctor Files Projects Source-Control or JJ-local backup handlers., Do not combine backup products into one ambiguous action., Do not expose recovery-key output to models agents NL automation headless API capture logs or ordinary projections.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### BRS-009 - Shared Primitives, Migration, And DRY Boundary

```yaml
plan_unit_id: BRS-009
unit_type: migration_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Project Backup, Full Server Backup, internal recovery, Project Move, Duplicate With History, Settings transfer, and
  update/migration safe points may share hashing, manifests, compression, encryption, staging, verification, transfer,
  import, quarantine, and rollback primitives only through their canonical owners. One version-pinned
  BackupEngineAdapter is selected through governed release evidence; restic is the reference engine, while an already-
  integrated equivalent remains inadmissible until it proves the same format, encryption, snapshot, dedup, lock,
  repository, verification, restore, provenance, SBOM/license, platform, repair, and rollback capabilities. No second
  engine owner or bespoke crypto is installed by default. Product schemas, state machines,
  receipts, permissions, identities, and terminal claims remain distinct. Existing internal backup:{backup_id},
  restore-points, Sync bundles, Settings snapshots, and storage MigrationReceipt are not portable BackupReceipt or
  RestoreReceipt. Schema/storage migration is versioned, backup-before-mutation, resumable, idempotent, crash-safe,
  atomically activated and rollback-capable; each obsolete portable manifest version has explicit compatibility or
  blocked migration disposition. Serialized migration explicitly covers old optional-source policies, scalar
  backup_destination_id, the superseded aggregate BackupRun state, legacy restore-mode values, legacy key records,
  stable Settings routes, Doctor caches, command denominators, and evidence-level labels without manufacturing missing
  source closure, keys, verification, runtime execution, or provider readiness.
gui_related: false
gui_classification_reason: Shared primitive ownership and schema migration are backend governance and recovery contracts rather than GUI implementation work.
depends_on: [BRS-001, BRS-005, BRS-006]
unblocks: [BRS-010]
acceptance_criteria:
  - Shared primitives have one implementation/owner path while product records and receipts remain discriminated.
  - Internal recovery and storage migration receipts cannot validate as portable backup or restore receipts.
  - Every supported manifest/schema version has deterministic compatibility, migration, quarantine, or blocked behavior.
  - Legacy complete_unverified becomes completed plus an unverified integrity axis; unknown legacy states are quarantined/blocked rather than guessed.
  - Existing scalar destinations migrate as ordered singleton destination bindings, and existing policies retain scope until opt-in review.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future cross-product type confusion and migration tests]
risk_class: backup_type_confusion_or_parallel_primitive
reasoning_tier: high
context_scope: backup_restore_dry_and_migration
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: backup_restore_dry_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:MIG-007-MIG-014
  - source_ref:agent_reports/live_backup_reconciliation.md#10
  - source_ref:normalized-register:server-first-2026-08-31:B01-B16
  - source_ref:packet:B5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [backup:{backup_id}, MigrationReceipt, Sync bundle, BackupReceipt, RestoreReceipt]
negative_constraints: [Do not reuse internal recovery identity as Full Server Backup., Do not call a Sync bundle Project Backup., Do not use Settings transfer as backup., Do not create parallel hashing staging scheduler encryption authentication or event services., Do not fabricate a RecoverySet key or retroactive source completeness/verification badge during migration.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Project_Sync_and_Backbone.md, Plans/Settings_System.md]
```

### BRS-010 - Backup Restore Acceptance And Proof Boundary

```yaml
plan_unit_id: BRS-010
unit_type: validation_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Backup/Restore acceptance covers one- and multi-Vault boundaries; destination offline, partial write, protection,
  retention/holds/prune and quarantine; included/excluded/encrypted secrets; source/JJ closure; every destination family;
  multi-destination partial failure; RecoverySet/Recovery Kit custody; verification and test restore; every restore mode;
  pre-restore recovery; identity/source/credential resolution; per-phase crash convergence and rollback; unrelated-
  Project isolation; readiness versus reauthentication; migration; performance; accessibility; native/web parity; and
  fresh recovery ordering; browse/retrieve/cold archive delivery; Doctor and Settings/GUI reverse routes; command/wiring. Static Plans, schemas, fixtures, validators, manifests, or concept UI are not runtime, backup-drill,
  recovery, security, performance, native-platform, readiness, or certification proof. Failures stay failures and
  unavailable lanes remain not_run with named residual risk.
gui_related: true
gui_classification_reason: Acceptance includes visible preview, selection, progress, attention, receipt history, rollback, accessibility, and native/web parity.
depends_on: [BRS-007, BRS-008, BRS-009]
unblocks: []
acceptance_criteria:
  - Positive fixtures validate and negative fixtures fail with the intended invariant.
  - Fresh end-to-end backup, destruction, restore, verification, restart, and rollback drills cover every supported mode before readiness is claimed.
  - Failed, missing, stale, quarantined, and not_run evidence remains explicit with named residual risk.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, Plans/Automated_Testing_System.md, future backup and restore drill receipts]
risk_class: static_backup_contract_promoted_to_recovery_readiness
reasoning_tier: high
context_scope: backup_restore_acceptance
implementation_surfaces: [Plans/Backup_Restore_System.md, future backup restore tests and evidence]
node_compile_hint: {mode: backup_restore_acceptance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:TEST-001-TEST-003
  - source_ref:packet:2026-09-01:OWN-001-OWN-004
  - source_ref:normalized-register:server-first-2026-08-31:V01
  - source_ref:normalized-register:server-first-2026-08-31:V07-V12
preserved_exact_tokens: [failures stay failures, not_run, residual risk, no readiness claim, no certification claim]
negative_constraints: [Do not promote schema or fixture success to a backup drill., Do not hide incomplete restore evidence., Do not claim completeness readiness or certification from Plans-only work.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Automated_Testing_System.md]
```

### BRS-012 - RecoverySet, Recovery Kit, Key Slots, And Human Custody

```yaml
plan_unit_id: BRS-012
unit_type: security_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Every remote BackupRepositoryBinding is encrypted and authenticated by the admitted engine before bytes leave the
  trusted worker. RecoverySetPublicRecord is ordinary redacted metadata that groups repository IDs under an encryption
  domain and records engine key-slot IDs, protected scheduler key-attachment reference, kit confirmation, generation,
  and currentness; it is not Storage's unrelated boot recovery_set_id. The human Backup Recovery Key appears only in an
  audience-bound no-store RecoveryKit delivery session for Save, Copy, Print, or Test Saved Kit. Puppet Master has no
  escrow. Rotation adds/verifies a new engine key slot before removing the old slot; suspected compromise requires a new
  encryption domain and evidenced repository re-encryption, with historical-exposure warning. PortableSecretEnvelope
  remains a separately authorized feature for portable non-backup secrets and never supplies ordinary repository crypto.
gui_related: true
gui_classification_reason: Recovery Kit handoff, masked human reveal, save/copy/print/test, confirmation, rotation, compromise warnings, and key status are visible protected workflows.
depends_on: [BRS-003, BRS-004, SIR-007]
unblocks: [BRS-013, BRS-014, BRS-015]
acceptance_criteria:
  - Remote payload and repository metadata are engine-encrypted before transport; destination credentials cannot decrypt repository contents.
  - Encryption does not hide provider-visible object sizes, timing, account/bucket identifiers or necessary outer format/key-slot metadata. Repository identity and the trusted manifest must bind the selected restore source; detect rollback where trusted local freshness evidence exists, without promising detection after all trusted local freshness state is lost.
  - Public records, commands, events, receipts, Doctor, logs, capture, Chat, Usage, and ordinary GUI contain no recovery credential.
  - Protected scheduler attachment and human kit copies have distinct custody refs; loss warnings state that PM cannot recover all-lost keys.
  - Key export/copy/print/test/rotate/reencrypt are human-only step-up actions and remain handler_unavailable until native protected-channel evidence exists.
  - tsnet node identity, keys, state, and enrollment are excluded; foreign-machine restore creates a new Server/connector identity unless a same-host takeover is explicitly fenced.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future key-slot rotation compromise re-encryption no-store and tsnet-exclusion tests]
risk_class: recovery_key_loss_exposure_or_identity_clone
reasoning_tier: high
context_scope: recovery_set_repository_encryption_and_human_custody
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future RecoverySetKeyService]
node_compile_hint: {mode: recovery_set_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:KEY-001-KEY-007
  - source_ref:packet:2026-09-01:TSX-backup-identity-boundary
preserved_exact_tokens: [RecoverySetPublicRecord, Backup Recovery Key, Recovery Kit, Save Recovery Kit, Copy Recovery Key, Print Recovery Kit, Test Saved Kit, no escrow]
negative_constraints: [Do not store or project raw recovery credentials., Do not reuse Storage boot recovery_set_id identity., Do not treat password rotation as compromise repair., Do not restore tsnet identity by default.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Permissions_System.md, Plans/Remote_Access_System.md]
```

### BRS-013 - Eleven Destination Families And Shared Authentication Consumption

```yaml
plan_unit_id: BRS-013
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  The closed MVP destination-family registry contains exactly aws_s3, s3_compatible, backblaze_b2, azure_blob, gcs,
  google_drive, onedrive, local_nas, sftp, webdav, and rest_server. Each family declares non-secret locator fields,
  engine/transport route, auth/profile reference kinds, list/read/write/commit/lock/delete/version/object-lock/archive/
  stream/resume capabilities, limitations, cost/archive notes, and runtime evidence status. Destination discovery and test
  are bounded, scoped, non-destructive: an approved random canary is confined to a PM scratch prefix; an existing
  repository is offered as Use existing and never initialized over. Backup consumes the existing AuthenticationBroker,
  Multi-Account/profile, CredentialBroker, OS-protected storage, and protected browser/session contracts with exact
  destination/Project/Server/Client/return identity. It creates no duplicate auth owner or cmd.auth_session family.
  Google/Microsoft production registrations, callback infrastructure, provider approvals, and shipped pinned engine/
  transport provenance are Release Supply Chain prerequisites; family presence remains handler_unavailable/NOT_RUN proof.
gui_related: true
gui_classification_reason: Destination chooser/cards, account and decrypt readiness, safe tests, Use existing, unsupported/cold-archive/cost notes, and auth return are visible.
depends_on: [BRS-004, BRS-012, MACS-001]
unblocks: [BRS-014, BRS-015]
acceptance_criteria:
  - Exactly eleven family profiles validate and distinguish GCS from Drive, B2 from consumer Computer Backup, and Amazon S3 from generic compatible services.
  - Capability fields support supported, unsupported, conditional, and not_run truth; no universal S3/object-lock/archive claim is inferred.
  - Safe test never alters ACL/public access, creates billable resources, deletes an existing repository, or treats a missing mount as an empty repository.
  - Destination discovery binds the original Server, actual destination identity/generation, approved nonsecret prefix and optional continuation cursor. Its bounded owner page preserves that selection, observed currentness and actual next cursor; continuation resolves the preceding owner page rather than accepting a cursor from another destination or prefix. An unavailable, unauthorized or unreachable source is not an empty successful listing. Discovered unregistered repositories remain discovered engine identities, not fabricated Project/RecoverySet bindings or proof of unlock, registration or recovery. Discovery neither initializes nor writes a probe.
  - OAuth reuses canonical auth commands/protected browser and returns to the exact destination without exposing URL, code, token, browser content, or client secret.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future real-provider auth capability wrong-account quota throttle and existing-repository tests]
risk_class: destination_capability_overclaim_or_duplicate_auth_owner
reasoning_tier: high
context_scope: destination_family_registry_and_auth_consumption
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, Plans/Multi-Account_Connection_Spec.md, Plans/Release_Supply_Chain.md]
node_compile_hint: {mode: destination_profile_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:CLOUD-001-CLOUD-008
  - source_ref:packet:2026-09-01:ACT-080-ACT-092
preserved_exact_tokens: [Amazon S3, S3-compatible storage, Backblaze B2, Azure Blob Storage, Google Cloud Storage, Google Drive, Microsoft OneDrive, Folder / NAS share, SFTP server, WebDAV / Nextcloud, Self-hosted backup server, Use existing]
negative_constraints: [Do not create a duplicate auth owner., Do not expose OAuth protected content., Do not claim provider readiness from a registry row., Do not initialize over an existing repository.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Multi-Account_Connection_Spec.md, Plans/Multi-Account.md, Plans/Release_Supply_Chain.md]
```

### BRS-014 - Snapshot Browse, Retrieve, Compare, Export, And Archive Delivery

```yaml
plan_unit_id: BRS-014
unit_type: recovery_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  BackupBrowseOperation binds repository_id, immutable snapshot_id, capture_set_id, scope/coverage, path selection,
  destination, Project/Server, owning Host/Environment, initiating Client, authorization, FileSafe decision, currentness,
  return route/focus, and redacted result evidence. Browse and compare are bounded reads. File download delivers to the
  initiating Client; extract runs only on an explicitly selected authorized Host path; export creates a disclosed
  portable artifact without becoming a restore; archive retrieval requires capability, wait/fee projection, and human
  consent before a billable external effect. None selects latest after refresh, activates content, executes restored
  files, or mutates the Project. Files, Projects, Source Control, and JJ consume these Backup-owned routes only.
  cmd.backup.file.compare requires both the immutable backup snapshot/path and an explicit target_revision for
  the selected comparison target. Backup treats that revision as opaque and resolves its actual identity,
  authorized content and currentness through the existing File or Source Control/native revision owner.
  Focused editor state, a current checkout or latest after refresh cannot supply the second operand implicitly.
  The actual compare operation and bounded result preserve both resolved operands and original return/focus;
  changed target authority or revision cannot relabel old comparison evidence as a current result.
gui_related: true
gui_classification_reason: Snapshot tree, download/extract/compare/export, cold-retrieval consent/progress, FileSafe decisions, and exact back-navigation are user-visible.
depends_on: [BRS-006, BRS-012, BRS-013]
unblocks: [BRS-016]
acceptance_criteria:
  - Browse/retrieve actions remain distinct from the four mutating RestoreRun modes and cannot activate or execute content.
  - Archive retrieval reports waiting, external prerequisite, and cost-consent state without hard-coded prices.
  - Reverse navigation returns to the exact immutable snapshot and original Project/repository/filter/focus, never silently latest.
  - The exact-two bounded-read successor in Plans/backup_bounded_read_contracts.schema.json binds original discovery/browse operands, actual source/page/previous-page continuity and a new BackupReadProjectionReceipt. This explicitly materializes the source ReadProjectionReceipt requirement; it is not an existing capture BackupReceipt, verification badge or restore receipt. BackupDestinationRegistry/BackupCoordinator issue the actual nonsecret terminal read receipt with original SIR dispatch/IdentityEnvelope, request/operation/command instance, page identity, observed currentness/time, page disposition and actual failure/error evidence. Discovery neither invents a Project for an unregistered repository nor proves unlock or recovery; browse does not infer a source tree from manifest storage objects.
  - Completed bounded page does not mean an exhausted listing, healthy repository or completed subsequent pages. Partial/unavailable/failed pages retain actual incomplete/failure evidence and map to common failed, never success; cancellation remains cancelled and preserves its reason reference with a null common UI error as required by UICommandResponse. Completed maps to succeeded without inferring no_op. This profile admits terminal pages only, not asynchronous acceptance. Mandatory native original/source/receipt authentication and final current disclosure accompany the static original/page/receipt join. Read receipts and SIR original bindings have only explicit durable-pending logical intent until physical custody is separately admitted; no new store, TTL or native producer is established, and transient pages cannot fabricate missing originals.
  - Browse requests bind the original repository, destination and immutable snapshot, optional safe relative path and optional continuation cursor to the actual BackupBrowseOperation and source-resolution evidence. A null path denotes that snapshot root. Each bounded owner page preserves the resolved capture identity, original path/Client/return/focus, observed currentness and actual next cursor; a continuation joins the preceding page and the same selection. Native source entries are not inferred from storage manifest-object rows, and missing or failed source cannot be represented as a successful empty tree. Current read admission and final disclosure remain required; browse never performs extraction, restoration, activation or billable archive retrieval by implication.
  - Client download and Host extract preserve topology and FileSafe containment; raw keys and foreign absolute paths never enter ordinary evidence.
  - Host extraction resolves its existing target_path_authorization_ref and filesafe_decision_ref against the same original snapshot, selected paths and Host destination before effects. These owner authorizations carry the reviewed extraction boundary; no duplicate generic preview grants additional authority. Browse continuation stays bound to its original repository/snapshot/path selection. Export preserves the explicitly selected snapshot set, destination and dependency scope rather than deriving them from the current view or expanding them silently.
  - The exact `cmd.backup.export` successor in `Plans/backup_portable_export_contracts.schema.json` retains the original `snapshot_ids`, actual selected repository/destination snapshot identities, explicit output `destination_ref`, and `dependency_scope`. Every requested, achieved and delivered member is identified by the full repository/BackupDestination/native-snapshot tuple; `snapshot_ids` is only the selected native-ID set projection and does not assert global native-ID uniqueness. Dependency scope is a per-selected-tuple manifest-backed declaration of family dispositions and object identities, plus the actual native closure evidence; it is not a new user enum or implicit dependency expansion. The admitted engine export/copy operation preserves this exact scope. Unsupported source combinations, closure or encrypted packaging refuse rather than silently changing the selection, choosing a format, re-keying or merging encryption domains. Requested scope and actual output coverage remain separate and must match for completion.
  - Each selected source resolves through the existing immutable source-record joins to the actual repository binding, committed destination attempt, capture origin and manifest. Actual source lifetime, authorization, manifest bytes and repository dependencies require the genuine Backup owner under its native fence. Missing or unresolved selected sources cannot become a successful empty export. Family/object subsets retain explicit omissions and cannot advertise full Project or Full Server coverage; a full Project claim additionally preserves complete Project source closure. No source Project, storage generation or history is mutated, activated or executed, and encrypted export never discloses recovery keys or implicitly exports otherwise excluded credentials.
  - A Backup-owned delivery projection binds the original destination reference to either the initiating Client or the explicitly selected Host/Environment and destination location reference. Its actual Permissions and FileSafe owner decisions authorize precisely this operation and location; a source BackupDestination or a nonsecret path reference grants no output authority. The engine admission binds original selection, dependency scope, destination, actual supported engine/format and encryption metadata references, with no default format or key policy. Destination admission and actual engine effects remain genuine owner interfaces, not caller assertions.
  - A new `BackupExportReceipt` and typed export observation retain the original operation, per-selected-source resolution and actual delivered encrypted outputs, byte sizes/digests, output locations, coverage and native evidence. Only authenticated readback of the actual output can establish completion. Partial, cancelled and unknown effects retain known outputs and reconciliation identity, including delivered resolved members when another original selected member is unavailable. Actual delivered and achieved members require genuine source resolution and engine admission; unresolved peers remain explicit and cannot be advertised as delivered or as a complete export. Unknown effects map to terminal_unknown/recovery_required without blind retry. Cleanup covers only operation-owned temporary output; its actual evidence never authorizes deleting pre-existing user data. Export remains distinct from the four RestoreRun modes and does not claim verified restoration.
  - Original bindings and export effect metadata have explicit durable-pending custody intent; transport and temporary projections are nonpersisted. They contain no raw archive, keys or secret payloads. Storage remains the physical owner; no new physical family, arbitrary TTL, automatic source retention extension or second terminal migration receipt is introduced. Disposed originals cannot be reconstructed from transient projections.
  - Compare rejects a missing or substituted target_revision, wrong target owner/path or stale target binding; its actual owner result joins both immutable selected operands without checkout, restore, activation or other Project mutation.
validation_surfaces: [Plans/backup_portable_export_contracts.schema.json, Plans/backup_portable_export_contract_fixtures.json, Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future traversal symlink archive cost Client Host and reverse-route tests]
risk_class: browse_delivery_mutation_or_wrong_target
reasoning_tier: high
context_scope: snapshot_browse_and_delivery
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/FileManager.md, Plans/Project_System.md, Plans/Source_Control_System.md, Plans/Jujutsu_Integration.md]
node_compile_hint: {mode: backup_browse_delivery_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-111
  - source_ref:packet:2026-09-01:REST-002-REST-005
  - source_ref:packet:2026-09-01:REST-009
  - source_ref:packet:2026-09-01:BGUI-003
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-110
preserved_exact_tokens: [cmd.backup.export, snapshot_ids, destination_ref, dependency_scope, BackupExportReceipt, cmd.backup.file.compare, target_revision]
negative_constraints: [Do not browse latest by implication., Do not activate or execute browsed content., Do not make Files Projects or SCM a backup handler., Do not start billable retrieval without consent.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/FileManager.md, Plans/FileSafe.md]
```

### BRS-015 - Scheduler, Retention, Prune, Verification, And Drill Policy

```yaml
plan_unit_id: BRS-015
unit_type: operational_policy
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  A newly created automatic policy uses versioned seed backup-policy-seed:2026-09-01-7-4-6: timezone-aware daily
  capture retaining seven daily, four weekly, and six monthly recovery points. It is editable and never overwrites an
  existing choice. The Server owns scheduler, unique occurrence ID, durable outbox, credentials, writer/maintenance
  authority, and catch-up after restart independent of Client lifetime. DST repeat/skip, missed-run coalescing,
  permitted hours, and minimum spacing yield at most one occurrence. RetentionPreview binds exact repository/policy
  revisions, candidate snapshot set/hash, holds/pins/last-known-good, reachability estimate, confidence, mutation lease,
  confirmation, and expiry. Prune uses engine reachability under a verified maintenance lease; ordinary writers do not
  gain destructive authority. Structural check, sampled/full data read, and isolated restore drill remain distinct
  evidence levels/timestamps/coverage and never inherit between snapshots.
  cmd.backup.verify requires one actual repository, an explicit nonempty set of selected immutable snapshots and
  the requested level. Source labels structure, sample and full_data map respectively to the existing receipt
  scopes structural, sampled_data_read and full_data_read; none means isolated_restore_drill. The owner resolves
  the actual selected manifests and snapshot membership before work, and reports each selected snapshot's
  requested and achieved level, status, coverage and authentic receipt without dropping failed or missing members.
  cmd.backup.test_restore instead requires one selected immutable snapshot, an explicitly selected isolated
  destination and typed requested drill coverage. The existing Restore, FileSafe and native source owners verify
  the actual target, isolation, authorization, currentness and required closure before their effects. Requested
  coverage cannot waive BRS-021's mandatory native rebuild/retained-operation proof or BRS-024 through BRS-029's
  coherent original-custody, source-lifetime and disclosure boundaries. Missing dependencies remain unproved;
  BRS-022's separately authorized data completion is never silently started by verification or a drill.
  Applicable cost, network and resource admission remains current and owner-bound for both commands. Accepted
  work is not completion; results join the original selected snapshot/target/coverage and actual verification or
  test-restore evidence. An isolated drill cannot activate the live Project or execute untrusted restored hooks,
  and no default target, inherited badge or caller declaration supplies missing selection or proof.
gui_related: true
gui_classification_reason: Automatic Backups, schedule/timezone, 7/4/6 recommendation, missed state, holds, prune preview, verification badges, and drill progress are visible.
depends_on: [BRS-005, BRS-013, SIR-012]
unblocks: [BRS-016]
acceptance_criteria:
  - New-policy seed is exactly daily 7/4/6; existing policies are unchanged unless explicitly edited.
  - DST repeat/skip, sleeping/offline Host, duplicated signal, restart, and multiple Clients produce at most one occurrence ID and truthful missed/catch-up state.
  - Holds, active parents, last-known-good, recovery-required points, concurrent upload/restore, and unrelated Project repositories survive preview/prune rules.
  - Prune requires exact preview hash/currentness, policy/repository revisions, confirmation, and unexpired maintenance lease.
  - Verify rejects missing requested scope, empty/substituted snapshot membership, wrong repository/manifest or borrowed receipts; every selected member retains its own actual outcome and exact requested-versus-achieved evidence level.
  - Test restore rejects missing target/coverage, a live or unauthorized target, stale isolation evidence and mismatched snapshot/coverage receipts; accepted, partial, failed or not-run work cannot be presented as a passed drill.
  - Neither action invents stronger verification, current authority, source bodies, remote completion or retention from a selected reference; all current BRS-019 and BRS-021 through BRS-029 requirements remain independent.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future DST catch-up hold lease prune corruption and isolated-drill tests]
risk_class: duplicate_schedule_or_destructive_prune
reasoning_tier: high
context_scope: server_owned_backup_operations
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: backup_operations_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTO-001-AUTO-006
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-101
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-102
preserved_exact_tokens: [seven daily, four weekly, six monthly, timezone-aware, occurrence ID, coalesced catch-up, last known good, cmd.backup.verify, cmd.backup.test_restore, structural, sampled_data_read, full_data_read, isolated_restore_drill]
negative_constraints: [Do not overwrite existing policy., Do not create one schedule per Client., Do not prune by object age., Do not inherit verification or restore-drill badges., Do not remove locks merely because an owner is temporarily unreachable.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```

### BRS-016 - Serialized Supersession, Fresh Recovery, And Consumer Truth

```yaml
plan_unit_id: BRS-016
unit_type: migration_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  The v2 contract migration is explicit and receipt-backed: new-policy source/JJ defaults do not mutate old policies;
  scalar destinations become ordered singleton bindings; aggregate run state becomes a primary phase plus independent
  capture/upload/integrity/drill axes; legacy settings_merge/settings_replace become settings_strategy and
  verify_browse_only becomes a read-only operation; RecoveryKeyRecord becomes RecoverySetPublicRecord only after exact
  repository/key-slot verification; live-folder sync and text-log/Git-push claims never gain snapshot/history badges;
  tsnet identity stays excluded. Fresh Full Server recovery runs after safe local claim/bootstrap and before Product
  Onboarding, model-provider auth, or new Project creation, then starts in recovery-safe mode until identity/trust/profile
  readiness is reverified. Settings presents one Data Backup and Retention overview with explicit Server/Project scope.
  The existing 38-manager registry is preserved: storage-retention-recovery, server-backup-restore, and project-backup
  remain typed child/detail descriptors and compatibility routes beneath that one visible grouping, not three
  competing normal experiences and not a changed registry denominator. Doctor remains cached-first/read-only and projects separate destination,
  repository, snapshot, recovery-set, policy/source coverage, and restore axes with owner remediation only. GUI/concept/
  schema/fixture evidence remains static and handler_unavailable/NOT_RUN until source-hashed native proof exists.
gui_related: true
gui_classification_reason: Migration warnings, fresh-recovery order, Settings overview/routes, Doctor health axes, recovery-safe state, and truthful disabled/proof labels are visible.
depends_on: [BRS-009, BRS-012, BRS-013, BRS-014, BRS-015]
unblocks: []
acceptance_criteria:
  - Every legacy value has deterministic migrated, compatibility, quarantined, or blocked disposition; no inferred key, history completeness, verification, or provider readiness is created.
  - Project backup creation consumes the exact requested BackupPolicy revision, including its existing scope_review_status and scope_review_receipt_ref where applicable. It preserves that policy's actual Project/family/source/destination scope; it does not require a fabricated fresh scope preview for every run or expand an existing unreviewed policy.
  - Fresh recovery needs no old Catalog or model-provider account and precedes normal Product Onboarding; foreign-machine restore uses new identity and re-pairing.
  - Doctor cannot unlock, decrypt, export, prune, restore, or execute; optional unused destinations/sources are non-degrading unless policy requires them.
  - Settings, Bootstrap, Onboarding, Doctor, Files, Projects, Source Control/JJ, notifications/status, palette, API, and accessibility consumers preserve exact object identity and reverse focus.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future migration fresh-install Doctor Settings GUI semantic and native runtime tests]
risk_class: unsafe_migration_false_recovery_or_consumer_overclaim
reasoning_tier: high
context_scope: backup_v2_migration_and_consumers
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/Settings_System.md, Plans/Planning_Wizard.md, Plans/newtools.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: backup_v2_supersession_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:MIG-007-MIG-014
  - source_ref:packet:2026-09-01:BGUI-001-BGUI-005
  - source_ref:packet:2026-09-01:REST-001
negative_constraints: [Do not run Product Onboarding before the recovery choice., Do not require model-provider auth for recovery., Do not let Doctor mutate or access keys., Do not promote static evidence to runtime truth.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/Settings_System.md, Plans/Planning_Wizard.md, Plans/newtools.md, Plans/FinalGUISpec.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### 3.1 Machine contracts and exact receipt names

`Plans/backup_restore_system_contracts.schema.json` is the Draft 2020-12 machine owner for:

- the closed eleven-row `DestinationFamilyProfile` registry, `BackupDestination`, `BackupRepositoryBinding`, `BackupPolicy`, `BackupRun`, `BackupDestinationAttempt`, `BackupManifest`, and `BackupRetentionDecision`;
- `RecoverySetPublicRecord`, protected/no-store `RecoveryKitDeliverySession`, `BackupScheduleOccurrence`, `RetentionPreview`, `BackupBrowseOperation`, `BackupHealthProjection`, and `BackupContractMigrationRecord`;
- `PortableSecretEnvelope` and `RecoveryKeyRecord`;
- `RestoreRun` and `RestorePreview`; and
- exact required `BackupReceipt`, `BackupVerificationReceipt`, `RestorePreviewReceipt`, `RestoreReceipt`, and `RecoveryPointReceipt`.

`Plans/backup_restore_system_contract_fixtures.json` supplies positive and negative instances for v2 policy defaults/migration, independent repositories, multi-destination axes, destination families/capability truth, RecoverySet/key-slot custody, schedule/DST/catch-up, retention leases, browse no-mutation, migration truth, type discrimination, secret redaction, verification, recovery prerequisites, four-mode restore safety, readiness, and handler-unavailable evidence.

The schema root carries aggregate identity `x-schema-id = pm.backup_restore_system.contracts.v2`. Its v1 predecessor is accepted only through the explicit `BackupContractMigrationRecord` dispositions in BRS-009/BRS-016. The fixture envelope ID `pm.backup_restore_system.contract_fixtures.v2` is test-only; its `contract_schema_id` points to the aggregate owner and is never a runtime record discriminator.

### 3.2 Inclusion and exclusion classes

Canonical included-family tokens are extensible stable IDs, but the initial family set includes:

- Project: `project.settings`, `project.chat_attachments`, `project.memory`, `project.goal_planning_orchestration`, `project.todos_subagents`, `project.usage_receipts`, `project.artifacts_lineage`, `project.permissions_filesafe_policy`, `project.restore_point_history`, `project.required_blobs`, `project.files`, `project.source_git_jj_closure`, `project.source_dirty_tracked`, `project.source_approved_untracked`, `project.source_lfs_submodules`, `project.source_alternates_shared_stores`, `project.source_durable_editor_buffers`, and the compatibility token `project.source_filesafe_state`;
- Server: `server.catalog`, `server.global_settings_templates`, `server.trust_metadata`, `server.backup_update_configuration`, `server.integration_catalog`, `server.installation_manifests`, `server.auth_profile_metadata`, `server.connection_definitions`, `server.external_secret_references`; and
- optional separate envelope: `portable_secret.envelope`.

Default exclusions include `pm.binaries`, `derived.indexes_caches`, `runtime.live_processes_ptys_ports`, `runtime.browser_processes`, `tool_store.reconstructable_binaries`, `cli_profile.secret_payloads`, `cloud_auth.tokens`, `ssh.raw_private_material`, `tsnet.identity_keys_state_enrollment`, `toolchains_images.redownloadable`, `os_credential_store.raw_bytes`, `device.physical_geometry`, and `runtime.host_environment_state`. `source.git_recoverable_from_remote` is a legacy-policy exclusion only and is not a new normal Project-policy default.

Every manifest records reason-coded excluded families. An exclusion is never silently omitted.

### 3.3 Exact states and restore modes

Backup primary phases are exactly `planned`, `waiting_for_source`, `waiting_for_unlock`, `acquiring_capture_barrier`, `capturing`, `staged`, `encrypting_uploading`, `committing_remote_snapshot`, `verifying_structure`, `verifying_data`, `completed`, `partial`, `failed`, and `cancelled`. Each run separately records `capture_completeness`, each `BackupDestinationAttempt.upload_state`, `integrity_verification_level`, and `restore_test_status`.

Restore states are exactly `selecting_backup`, `reading_manifest`, `compatibility_check`, `previewing`, `waiting_for_approval`, `pre_restore_backup`, `staging`, `verifying_staged_data`, `resolving_identity`, `resolving_credentials`, `resolving_source_locations`, `quiescing`, `activating`, `rebuilding_derived_state`, `post_restore_verifying`, `complete`, `rollback_available`, `rolling_back`, `blocked`.

RestoreRun modes are exactly `as_new`, `in_place`, `selective`, and `server_full`. `settings_strategy = not_applicable|merge|replace` is orthogonal. `verify_browse_only`, legacy settings-mode values, and their old labels are migration inputs only; browse/retrieve use `BackupBrowseOperation`.

### 3.3.1 Phase-local evidence and emergency recovery prerequisite

`RestoreRun` is durable from `selecting_backup`, before a backup or manifest is necessarily known. Fields remain present but nullable/empty until their phase can produce authoritative evidence. Entering `reading_manifest` requires a selected backup; `compatibility_check` requires immutable manifest/snapshot/source identity; `previewing` requires selected families; `waiting_for_approval` requires the preview receipt; `pre_restore_backup` requires owner approval; `staging` requires the recovery prerequisite below. Staged verification precedes identity resolution, which precedes credential resolution, then source-location resolution, quiescence, and activation. No phase fabricates a later receipt to satisfy schema validation.

`mutation_applied` remains false through quiescence. When true, including on a `blocked` run or failed terminal receipt, it requires the original selection, preview/approval/recovery prerequisite, staged verification, identity/credential/source resolution, and recorded activation commit boundary. Complete additionally requires derived rebuild, post-restore verification, Client-cache invalidation, a terminal timestamp, and no failure claim. `blocked` before mutation may lack future evidence but must identify the failure. Phase journals and referenced owner receipts resolve the exact transition/retry history; timestamp/shape checks are not crash-recovery proof.

The normal prerequisite is a verified `RecoveryPointReceipt` for the exact target. Only when the owner verifies that this recovery point is unavailable may the existing Permissions/confirmation flow obtain explicit human consent to proceed without it. This is not a general opt-out, an agent/NL grant, or consent inferred from the original Restore click. The human sees the exact mode, Server/Project target, selected preview, verified reason recovery is unavailable, risk of losing the previous state, and lack of rollback. Refusal leaves the target unchanged.

The closed nested `emergency_recovery_consent` binds the existing human consent receipt, verified-unavailability evidence, human actor, authorization and validation receipts, `restore_run_id`, mode, exact Server/Project target set, idempotency key, preview/approval receipts, issue/validation/expiry times, intent `restore_without_pre_restore_recovery`, and scope `this_restore_only`. Validation requires `issued_at_utc <= validated_at_utc < expires_at_utc` and exact equality with the current request/run/receipt bindings; the request actor also matches. Before staging or a new mutation attempt, the owner resolves and revalidates the referenced human authority, currentness, preview, target, and unavailability evidence. A changed target, mode, preview, approval, expired/revoked authority, or new operation requires renewed explicit consent and never reuses the old binding.

`restore_recovery_prerequisite` is shared by run, mutating request, and mutation-applied receipt schemas: exactly one actual recovery receipt or validated emergency-consent binding is present. The preview and safety projection retain `recovery_point_required=true` as the normal default and explicitly expose `emergency_recovery_exception=verified_unavailability_and_scoped_human_consent_only`; a preview does not grant consent. Consent is a reference-bound value under the existing human authority, not a sixth Backup receipt family, secret, new command, or EventRecord. It cannot waive owner approval, destructive confirmation, currentness, target leases, quiescence, FileSafe, staged verification, or protected credentials. `cmd.restore.rollback`, `rollback_available`, and `rolling_back` still require a real verified recovery point and rollback reference; an emergency restore reports rollback unavailable.

Static oracles validate phase prerequisites, direct target/receipt joins, and time ordering. Runtime authority lookup, signed/authorized receipt resolution, crash recovery at every phase, activation atomicity, disk restoration, and rollback remain unproved until executable evidence exists.

### 3.4 Event Authority candidates

The following names are candidate event identities for Event Authority adjudication, not accepted or admitted
`EventRecord` identities:

- `backup.state_changed`
- `backup.destination_changed`
- `restore.state_changed`

They remain non-emitting unless and until Event Authority registers each identity together with its producer, payload,
retention, redaction, and consumer contract. Until that admission, backup/restore evidence is carried only by the typed
receipts owned in section 3.1. `recovery_required` is a recovery state, not a candidate or admitted `EventRecord`
identity; entering that state does not authorize an event emission.

ContractRef: SchemaID:pm.backup_restore_system.contracts.v2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_family_registry.json

## 4. Integration Surfaces

### 4.1 Canonical command families requiring central integration

Root integration must reconcile/register these exact IDs:

`cmd.backup.destination.add`, `cmd.backup.destination.update`, `cmd.backup.destination.test`, `cmd.backup.destination.remove`, `cmd.backup.policy.update`, `cmd.backup.project.create`, `cmd.backup.server.create`, `cmd.backup.cancel`, `cmd.backup.retry`, `cmd.backup.verify`, `cmd.backup.test_restore`, `cmd.backup.browse`, `cmd.backup.delete`, `cmd.backup.protect`, `cmd.backup.open_history`, `cmd.backup.open_details`, `cmd.restore.preview`, `cmd.restore.project_in_place`, `cmd.restore.project_as_new`, `cmd.restore.selective`, `cmd.restore.server_full`, `cmd.restore.cancel`, `cmd.restore.retry`, `cmd.restore.rollback`, `cmd.restore.open_details`.

The post-integration admission adds exactly these 16 Backup-owned primaries:

`cmd.backup.destination.discover`, `cmd.backup.retention.preview`, `cmd.backup.prune`, `cmd.backup.unlock`, `cmd.backup.file.download`, `cmd.backup.extract`, `cmd.backup.file.compare`, `cmd.backup.export`, `cmd.backup.archive.retrieve`, `cmd.backup.recovery_key.export`, `cmd.backup.recovery_key.copy`, `cmd.backup.recovery_key.print`, `cmd.backup.recovery_key.test`, `cmd.backup.recovery_key.acknowledge_saved`, `cmd.backup.recovery_key.rotate`, `cmd.backup.recovery_key.reencrypt`.

Destructive restore requests bind target identities/generations, manifest and preview receipt, expected policy/revision, idempotency/correlation, permission/FileSafe/confirmation, and the BRS-023 recovery prerequisite. Rollback still requires an actual `RecoveryPointReceipt`. Secret selection and recovery credentials use protected input channels and never ordinary command payload/history.

`Plans/backup_restore_system_contracts.schema.json` now defines one generic discriminated `BackupRestoreCommandRequest`, `BackupRestoreCommandResult`, `BackupRestoreCommandError`, and `BackupRestoreCommandAvailability` family over exactly these 41 IDs. The conditional request branches require currentness for every action; repository/destination/policy revisions; exact snapshot/capture-set/RecoverySet/run/preview identities; target Server/Project/Host/Environment/Client and family fields; protected-channel refs for unlock/key actions; retention candidate hash/lease/confirmation for prune; archive consent; and the BRS-023 recovery prerequisite plus approval, confirmation, and preview-currentness receipts for mutating restores. Full Server secret portability remains explicit opt-in and reference-only through encrypted `PortableSecretEnvelope`; repository recovery uses redacted `RecoverySetPublicRecord` plus protected key-delivery refs. Raw keys, passwords, tokens, cookies, auth URLs/codes, callback/session material, protected-browser content, and foreign absolute paths are not ordinary command fields.

These are static owner contracts only. All 41 command-catalog rows and their consumer/reverse rows must agree centrally; Event Authority admissions, native sole handlers, executable production wiring, real destination adapters, backup bytes, restore/rollback/quarantine execution, protected key delivery, and raw runtime receipts remain absent. A schema-valid command therefore remains `handler_unavailable` when its exact native registration or runtime prerequisite is missing. `expected_event_types=[]` remains mandatory until Event Authority separately admits an exact event and payload.

### 4.2 Normal and advanced UI

Normal Data Backup and Retention overview is exactly:

- `Automatic Backups On / Off`
- explicit `Server` or `Project:{id}` scope and `Protected data` summary;
- destination cards and `Encryption enabled`;
- `Last complete remote backup <receipt time>`, verification level/time, and Recovery Kit status; and
- `[Back Up Now] [Restore…] [Add Destination]`.

Detail areas are History and Browse; Destinations; Schedule/Retention/Holds; Recovery and Keys; and Advanced/Diagnostics. They contain destination capability/auth and independent decrypt readiness, selected Projects/data/source coverage, schedule and retention, encryption and portable-secret selection, Recovery Kit custody, verification/test restore, history/failures/storage use, manifest/receipt drill-through, quarantine, rollback, and diagnostics. Project cards remain compact and show only relevant last-complete/attention state.

Truthful states include `Backup Needs Attention`, `Backing up`, `Waiting for source`, `Last complete remote backup`, `Structure verified`, `Full data read verified`, `Restore drill passed`, `Restore awaiting approval`, `Restore blocked`, `Rollback available`, and `Recovery required`. Account readiness and recovery-key unlock readiness are independent. Percent is shown only with a defendable denominator.

### 4.3 Central files intentionally not edited here

The parent/root lane must integrate:

- index/Crosswalk/DRY owner routing;
- exact command/UI catalog rows that consume the typed owner contracts without duplicating them;
- Event Authority entries and payload refs;
- receipt/event Contracts and storage value/retention/redaction/migration registrations;
- one sole handler and production wiring row per command plus reverse coverage;
- Settings manager/search and Onboarding/Doctor projections; and
- PlanUnit index/governance refresh only after live owner files and central integrations stabilize.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

## 5. Validation And Acceptance

| Matrix | Required positive coverage | Required negative/failure coverage |
|---|---|---|
| Product discrimination | all four products and distinct receipts/routes | internal recovery/Settings/Sync/MigrationReceipt accepted as portable backup |
| Boundaries | one Project, selected multi-Vault Full Server, exact global families | unrelated Project mutation, omitted family, inconsistent generations |
| Destination/policy | online, resumable, protected, retention and capability tests | offline, partial write, delete failure, immutable/hold violation, capacity exhaustion |
| Secrets | default exclusion, explicit selection, encrypted envelope, external refs | raw keychain/CLI profile/callback/session/log/event/Chat/Usage exposure |
| Backup state | full phase lifecycle, verification, cancel/retry | kill/ENOSPC/EIO at every phase, missing journal, false complete, last-good deletion |
| Restore modes and browse | four mutating modes as_new/in_place/selective/server_full; orthogonal settings strategy; separate browse/retrieve | identity collision, invalid family, browse activation, unverified activation |
| Safety/rollback | preview, approval, recovery point, quarantine, staged verify, derived rebuild | missing recovery point, corrupt/stale manifest, failed post-verify, rollback failure |
| Readiness | all four exact classifications with fresh evidence | restored manifest or definition alone labeled Ready |
| Commands/wiring | one handler, schema, permission, receipt/event, focus return, native/web parity | private handler, stale revision, missing confirmation, secret route, unexpected event |
| Performance/accessibility | bounded queues/caches, lazy history, old hardware, keyboard/focus/reduced motion | eager all-history hydration, clipped controls, fabricated determinate percent |

End-to-end acceptance includes a destructive test restore into isolated targets and verified recovery/rollback receipts. A manifest parse or hash-only check is not a successful restore drill.

## 6. Plan-To-Node Readiness

| Area | Canonical classification | Required before node-ready |
|---|---|---|
| Owner placement and PlanUnits | `specified` | Central owner map and PlanUnit index integration |
| Record/receipt schemas and fixtures | `specified_static` | Fixture validation plus Contracts/storage/event/command integration |
| Command request/result/error/availability schema | `specified_static` | Central catalog adoption plus native handler and production wiring |
| Commands/events/handlers/wiring | `blocked_integration_missing` | Central registration, sole handlers, production rows, reverse coverage |
| Destination families, engine/repository encryption, OAuth release gates, and portable-secret crypto | `specified_boundary_not_implemented` | Approved adapters/registrations/security profiles and real runtime evidence |
| Backup and restore runtime | `not_implemented_or_proven` | Full phase/failure/migration/restore drills with raw receipts |
| Readiness/certification | `blocked_runtime_certification_incomplete` | Governed runtime lifecycle and clean-room closure including PNC-019 |

All BRS PlanUnits are Plans-only. They create no WorkNodes, NodeSeeds, executable queues, implementation, backup generation, restore mutation, readiness, or certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- The eleven destination families and the new-policy daily 7/4/6 seed are fixed here. Exact engine/transport version selection, provider-specific proven capability state, schedule widget vocabulary, RPO/RTO product claims, optional test-restore cadence, OAuth approvals/registrations, and crypto-suite release admission remain downstream implementation/security/release-owner integrations. The schema uses stable adapter, auth-owner, release-gate, and security-profile refs rather than inventing provider readiness.
- Internal `backup:{backup_id}`, `recovery/`, `restore-points/`, Sync bundles, Settings snapshots, storage `MigrationReceipt`, JSON/JSONL export, and concept fixtures are not Full Server Backup or Project Backup.
- Raw OS keychain/Credential Manager bytes, default CLI-profile payloads, cookies, machine-bound identities, live runtime, device geometry, and rebuildable indexes remain excluded by default. BRS-021 permits explicitly selected captured Jujutsu history indexes only as optional speed aids; correctness-critical rebuild in the isolated drill and complete native closure proof remain mandatory.
- Restore does not silently install tools, authenticate profiles, administer external secret systems, choose new source paths, or claim unavailable integrations Ready.
- Automatic writable multi-Server failover and live-database replication are rejected.
- Static schemas/fixtures and Plans do not authorize production deletion, restore, key rotation, backup retention, or governance seal.

## 8. Source Lineage And Governance

This owner compiles the user-authorized Full Server Backup/Restore scope normalized in the 2026-08-31 Server register, especially B01-B18, G01-G14, and V01/V07-V12. The earlier `Plans/Backup_Restore_System.md`/`BRS` proposal was not self-authorizing; this owner lane explicitly adjudicates it now while preserving Storage, Settings, Project Move, credentials/security, Commands, Events, and GUI boundaries.

Primary lineage:

- `08_UPDATES_BACKUP_RESTORE.md`
- `09_UPDATES_BACKUP_RESTORE_CONTRACT.md`
- `backbone_v5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md`
- `B5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md`
- `04_STORAGE_AND_PROJECT_VAULT_MIGRATION.md`
- `B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md`
- `10_COMMAND_EVENT_RECEIPT_CENSUS.md`

This compile does not edit central commands/events/contracts/storage registries/wiring, generated shards/evidence, PlanUnit indexes, Spec Lock, auto decisions, or runtime implementation. Structural/schema success is not backup-drill, recovery, security, performance, native-platform, visual, readiness, completeness, or certification proof.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Decision_Policy.md, Gate:PNC-019

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 40 primary commands that require future native Backup/Restore handlers: the earlier 24 bindings plus the 16 post-integration admissions below. `cmd.restore.preview` retains its already-adjudicated sole target `handlers::backup_restore::preview_restore`, making exactly 41 Backup/Restore primary commands overall. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, protected key channel, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.backup.browse` | `handlers::backup_restore::backup_browse` | `Plans/backup_bounded_read_contracts.schema.json#/$defs/request` -> `Plans/backup_bounded_read_contracts.schema.json#/$defs/result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.cancel` | `handlers::backup_restore::backup_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.delete` | `handlers::backup_restore::backup_delete` | `Plans/backup_selected_delete_contracts.schema.json#/$defs/request` -> `Plans/backup_selected_delete_contracts.schema.json#/$defs/result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.add` | `handlers::backup_restore::backup_destination_add` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.remove` | `handlers::backup_restore::backup_destination_remove` | `Plans/backup_destination_lifecycle_contracts.schema.json#/$defs/request` -> `Plans/backup_destination_lifecycle_contracts.schema.json#/$defs/result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.test` | `handlers::backup_restore::backup_destination_test` | `Plans/backup_destination_lifecycle_contracts.schema.json#/$defs/request` -> `Plans/backup_destination_lifecycle_contracts.schema.json#/$defs/result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.update` | `handlers::backup_restore::backup_destination_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_request_v2` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_result_v2` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.open_details` | `handlers::backup_restore::backup_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.open_history` | `handlers::backup_restore::backup_open_history` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.policy.update` | `handlers::backup_restore::backup_policy_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.project.create` | `handlers::backup_restore::backup_project_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.protect` | `handlers::backup_restore::backup_protect` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.retry` | `handlers::backup_restore::backup_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.server.create` | `handlers::backup_restore::backup_server_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.test_restore` | `handlers::backup_restore::backup_test_restore` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_request_v2` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_result_v2` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.verify` | `handlers::backup_restore::backup_verify` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_request_v2` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_result_v2` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.cancel` | `handlers::backup_restore::restore_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.open_details` | `handlers::backup_restore::restore_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.project_as_new` | `handlers::backup_restore::restore_project_as_new` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.project_in_place` | `handlers::backup_restore::restore_project_in_place` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.retry` | `handlers::backup_restore::restore_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.rollback` | `handlers::backup_restore::restore_rollback` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.selective` | `handlers::backup_restore::restore_selective` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.server_full` | `handlers::backup_restore::restore_server_full` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.discover` | `handlers::backup_restore::backup_destination_discover` | `Plans/backup_bounded_read_contracts.schema.json#/$defs/request` -> `Plans/backup_bounded_read_contracts.schema.json#/$defs/result` | same owner error / permission; bounded read, exact family/profile/return context |
| `cmd.backup.retention.preview` | `handlers::backup_restore::backup_retention_preview` | same owner request -> result | same owner error / permission; exact repository/policy revision and candidate hash |
| `cmd.backup.prune` | `handlers::backup_restore::backup_prune` | same owner request -> result | same owner error / permission; exact preview hash, confirmation, maintenance lease |
| `cmd.backup.unlock` | `handlers::backup_restore::backup_unlock` | same owner request -> result | same owner error / human step-up; protected submission ref only |
| `cmd.backup.file.download` | `handlers::backup_restore::backup_file_download` | same owner request -> result | same owner error / FileSafe; exact snapshot/path/initiating Client |
| `cmd.backup.extract` | `handlers::backup_restore::backup_extract` | same owner request -> result | same owner error / FileSafe; exact snapshot/path/authorized Host target |
| `cmd.backup.file.compare` | `handlers::backup_restore::backup_file_compare` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_request_v2` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_action_result_v2` | same owner error / permission; immutable snapshot/current-file identities |
| `cmd.backup.export` | `handlers::backup_restore::backup_export` | `Plans/backup_portable_export_contracts.schema.json#/$defs/request` -> `Plans/backup_portable_export_contracts.schema.json#/$defs/result` | same owner error / FileSafe; disclosed non-restore artifact |
| `cmd.backup.archive.retrieve` | `handlers::backup_restore::backup_archive_retrieve` | same owner request -> result | same owner error / consent; retrieval cost/wait and external effect |
| `cmd.backup.recovery_key.export` | `handlers::backup_restore::recovery_key_export` | same owner request -> protected no-store delivery result ref | same owner error / human step-up; no ordinary secret serialization |
| `cmd.backup.recovery_key.copy` | `handlers::backup_restore::recovery_key_copy` | same owner request -> protected no-store delivery result ref | same owner error / human step-up; initiating Client only |
| `cmd.backup.recovery_key.print` | `handlers::backup_restore::recovery_key_print` | same owner request -> protected no-store print-session ref | same owner error / human step-up; no spool/log/capture leak |
| `cmd.backup.recovery_key.test` | `handlers::backup_restore::recovery_key_test` | same owner request -> redacted test receipt | same owner error / human step-up; protected submission ref only |
| `cmd.backup.recovery_key.acknowledge_saved` | `handlers::backup_restore::recovery_key_acknowledge_saved` | same owner request -> redacted confirmation receipt | same owner error / human step-up; exact RecoverySet generation |
| `cmd.backup.recovery_key.rotate` | `handlers::backup_restore::recovery_key_rotate` | same owner request -> redacted key-slot rotation receipt | same owner error / human step-up; add/verify before remove |
| `cmd.backup.recovery_key.reencrypt` | `handlers::backup_restore::recovery_key_reencrypt` | same owner request -> redacted re-encryption receipt/ObservableWork | same owner error / human step-up; preview, confirmation, lease, new RecoverySet |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact 40-command future-handler set (the full 41 minus the retained existing `cmd.restore.preview` binding): `cmd.backup.browse`, `cmd.backup.cancel`, `cmd.backup.delete`, `cmd.backup.destination.add`, `cmd.backup.destination.remove`, `cmd.backup.destination.test`, `cmd.backup.destination.update`, `cmd.backup.open_details`, `cmd.backup.open_history`, `cmd.backup.policy.update`, `cmd.backup.project.create`, `cmd.backup.protect`, `cmd.backup.retry`, `cmd.backup.server.create`, `cmd.backup.test_restore`, `cmd.backup.verify`, `cmd.restore.cancel`, `cmd.restore.open_details`, `cmd.restore.project_as_new`, `cmd.restore.project_in_place`, `cmd.restore.retry`, `cmd.restore.rollback`, `cmd.restore.selective`, `cmd.restore.server_full`, `cmd.backup.destination.discover`, `cmd.backup.retention.preview`, `cmd.backup.prune`, `cmd.backup.unlock`, `cmd.backup.file.download`, `cmd.backup.extract`, `cmd.backup.file.compare`, `cmd.backup.export`, `cmd.backup.archive.retrieve`, `cmd.backup.recovery_key.export`, `cmd.backup.recovery_key.copy`, `cmd.backup.recovery_key.print`, `cmd.backup.recovery_key.test`, `cmd.backup.recovery_key.acknowledge_saved`, `cmd.backup.recovery_key.rotate`, `cmd.backup.recovery_key.reencrypt`.

Exact 40 sole future handler set: `handlers::backup_restore::backup_browse`, `handlers::backup_restore::backup_cancel`, `handlers::backup_restore::backup_delete`, `handlers::backup_restore::backup_destination_add`, `handlers::backup_restore::backup_destination_remove`, `handlers::backup_restore::backup_destination_test`, `handlers::backup_restore::backup_destination_update`, `handlers::backup_restore::backup_open_details`, `handlers::backup_restore::backup_open_history`, `handlers::backup_restore::backup_policy_update`, `handlers::backup_restore::backup_project_create`, `handlers::backup_restore::backup_protect`, `handlers::backup_restore::backup_retry`, `handlers::backup_restore::backup_server_create`, `handlers::backup_restore::backup_test_restore`, `handlers::backup_restore::backup_verify`, `handlers::backup_restore::restore_cancel`, `handlers::backup_restore::restore_open_details`, `handlers::backup_restore::restore_project_as_new`, `handlers::backup_restore::restore_project_in_place`, `handlers::backup_restore::restore_retry`, `handlers::backup_restore::restore_rollback`, `handlers::backup_restore::restore_selective`, `handlers::backup_restore::restore_server_full`, `handlers::backup_restore::backup_destination_discover`, `handlers::backup_restore::backup_retention_preview`, `handlers::backup_restore::backup_prune`, `handlers::backup_restore::backup_unlock`, `handlers::backup_restore::backup_file_download`, `handlers::backup_restore::backup_extract`, `handlers::backup_restore::backup_file_compare`, `handlers::backup_restore::backup_export`, `handlers::backup_restore::backup_archive_retrieve`, `handlers::backup_restore::recovery_key_export`, `handlers::backup_restore::recovery_key_copy`, `handlers::backup_restore::recovery_key_print`, `handlers::backup_restore::recovery_key_test`, `handlers::backup_restore::recovery_key_acknowledge_saved`, `handlers::backup_restore::recovery_key_rotate`, `handlers::backup_restore::recovery_key_reencrypt`.

### BRS-011 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: BRS-011
unit_type: command_binding
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Backup/Restore System owns exactly 41 primary command routes. The already-bound cmd.restore.preview retains handlers::backup_restore::preview_restore; the other 40 map one-to-one to the sole future handlers shown in this addendum. Every route consumes the owner-DRY request/result/error/availability/permission family, starts handler_unavailable absent source-hashed native proof, uses expected_event_types=[], and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Bootstrap, Onboarding/Doctor, Files, Projects, Source Control/JJ, owner workspaces, palette/API, and other named consumers expose some or all of these 41 commands and their exact disabled reasons.
depends_on: [BRS-008, BRS-009, BRS-010]
unblocks: []
acceptance_criteria:
- Every exact command ID in the 41-command set maps one-to-one to its sole target and no competing handler path exists; the admitted delta is exactly 16.
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
- Plans/Backup_Restore_System.md
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

## Lossless backup architecture, recovery, and operations depth - 2026-09-02

### BRS-017 - Coordinator, Capture Barrier, Independent Repositories, And Durable Authority

```yaml
plan_unit_id: BRS-017
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  One PM BackupCoordinator owns capture scope, consistency, retention intent, repository authority, and restore semantics through one version-pinned BackupEngineAdapter. Restic is the reference encrypted snapshot/dedup engine; native object/SFTP/REST backends and bounded rclone transports are adapters, never a second coordinator, custom cryptosystem, canonical PM store, rclone-crypt wrapper, or live Project-Vault sync. Each Project has an independently recoverable repository/set and the Server Catalog has a separate set. Storage owners supply a flush/export/freeze CaptureBarrierService for seglog, non-rebuildable redb, replay watermarks, and CAS manifests; Tantivy and declared derived projections rebuild. Capture freezes an immutable staging generation, releases the application barrier before upload, and records Project create/remove/move races, bounded capacity failure, exact source Host/Environment mappings, dirty files, durable editor-buffer coverage, and the latest Git/JJ operation separately without manufacturing a commit or operation.
gui_related: true
gui_classification_reason: Capture coverage, waiting source/unlock, incomplete source, staging capacity, last complete result, and durable/transient-state disclosure are user-visible status and receipt truth.
depends_on: [BRS-002, BRS-004, BRS-005, BRS-009, SCS-014, JJI-008]
unblocks: []
acceptance_criteria:
  - One BackupCoordinator and one admitted BackupEngineAdapter own each operation; engine format/protocol/version, tool provenance, SBOM, license, platform checks, repair, update, and rollback remain release-gated and runtime-unproved.
  - Per-Project repositories and the separate Catalog repository keep independent lock, retention, prune, corruption, quarantine, and recovery boundaries even when credentials, buckets, accounts, or RecoverySet are shared.
  - A Full Server Capture Manifest names exact capture_set_id, repository_id, snapshot_id, schema version, consistency vector, source coverage, and Project snapshot refs; an arbitrary latest-of-each combination is incoherent and rejected.
  - Capture never copies open redb or seglog opportunistically; it closes/flushes the seglog boundary, exports non-rebuildable redb consistently, pins replay watermarks/CAS manifests, records rebuildable Tantivy/derived projections, freezes staging, and releases the barrier before network upload.
  - SourceSnapshotAdapter captures on the authorized owning Server, NAS, WSL, Apple Linux environment, container/Kubernetes environment, or SSH host, preserving source_location_id and workspace mappings; an offline required source waits or yields explicit partial status without replacing the previous complete recovery point.
  - Server-owned plan, scheduler occurrence, writer/maintenance lease, credential refs, and resumable outbox survive Client loss and update restart; Project Move preflights destinations and transfers or explicitly retains exactly one schedule/writer/prune authority.
  - The captured filesystem image, repository operation state, saved files, durable recoverable editor buffers, and unavailable process-only memory remain distinct; exact history never permits unsafe hooks/helpers/includes, active credentials, hidden commits, or hidden JJ operations.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json#/$defs/backup_architecture_admission_record, Plans/backup_restore_system_contract_fixtures.json, future crash/barrier/GC/source-host/move/staging-capacity/runtime tests]
risk_class: backup_capture_incoherence_or_duplicate_writer
reasoning_tier: high
context_scope: backup_coordinator_capture_and_repository_authority
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future BackupCoordinator and BackupEngineAdapter]
node_compile_hint: {mode: static_backup_architecture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BKP-002-BKP-004
  - source_ref:packet:2026-09-01:BKP-010
  - source_ref:packet:2026-09-01:BKP-012
  - source_ref:packet:2026-09-01:OWN-002
  - source_ref:packet:2026-09-01:OWN-006
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_residue_2.md#2.1
preserved_exact_tokens: [BackupCoordinator, BackupEngineAdapter, CaptureBarrierService, SourceSnapshotAdapter, GitJJClosureValidator, restic, rclone, seglog, redb, Tantivy, CAS, capture_set_id, repository_id, snapshot_id, waiting_for_source, source_location_id]
negative_constraints:
  - Do not design new cryptography, add a second backup owner, use rclone sync on live Project Vaults, or make any remote repository canonical writable Project state.
  - Do not merge repository authority because a bucket, account, credential, or RecoverySet is shared.
  - Do not copy open storage files, hold the capture barrier during cloud upload, fabricate collected state, or claim transient process memory was backed up.
  - Do not treat this static PlanUnit or its fixtures as PROC-001/PROC-002 execution evidence.
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Release_Supply_Chain.md, Plans/Shared_Integration_Runtime.md]
```

### BRS-018 - Destination, Headless Authentication, Recovery Key, And Human Delivery Safety

```yaml
plan_unit_id: BRS-018
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Destination setup is choose service, authenticate/select an existing profile, choose the exact bucket/container/drive/folder/prefix and required region/endpoint, run an approved bounded safe test, review encryption/scope/schedule/cost, then save or explicitly Use existing. Provider methods are capability- and engine-qualified: S3/B2/Azure/GCS use proven scoped credentials or workload attachments; Google Drive and OneDrive use PM-owned production OAuth registrations with PKCE/state and exact return; browser-only/container flows use a registered web callback or provider-supported device flow, never generic Google device/OOB or an end-user developer-console tutorial. SFTP/WebDAV/NAS/REST validate fingerprints, TLS, paths, mounts, protocols, auth, and one-writer behavior. Every remote payload is engine-encrypted/authenticated before egress. A Server-CSPRNG Backup Recovery Key with at least 256 bits belongs to a RecoverySet whose repositories retain independent master keys; human-only Save/Copy/Print/Test Saved Recovery Kit delivery is authenticated, audience-bound, no-store, Client-targeted, separate from browse authority, and never cloud escrow, agent context, URL, logs, browser storage, capture, or generic configuration.
gui_related: true
gui_classification_reason: Destination cards, official sign-in return, safe-test receipts, account/decryption readiness, Recovery Kit handoff, reminders, quota/throttle/archive states, and reconnect actions are visible.
depends_on: [BRS-012, BRS-013, SIR-032]
unblocks: []
acceptance_criteria:
  - Safe tests mutate only a named random canary within an approved PM scratch prefix and clean it with a receipt; read-only tests do not mutate, and no test changes ACL/public access, creates billable resources, destroys a repository, or initializes over an unreachable/existing repository.
  - Provider profiles keep locator/account/region/prefix separately from secret refs and prove the selected engine/transport method; rotation/refresh does not rewrite backup data, endpoint/TLS trust prevents credential exfiltration, and restored missing credentials project Reconnect destination.
  - Google Drive prefers verified drive.file app-created/selected objects and proves rediscovery; OneDrive distinguishes personal/business/tenant and app-folder availability. A retiring shared rclone client, generic OOB flow, fake client ID, or universal scope claim is forbidden.
  - Missing NAS mounts, changed SSH keys, redirected WebDAV origins, incompatible REST protocols, and partially synchronized folders fail safely rather than appearing empty or initializing a new set.
  - Quota full, Retry-After throttling, unavailable, reauth, tenant restriction, user-deleted objects, provider versions/trash, cold retrieval delay/fees, and external archive prerequisites remain distinct; cloud drives are not advertised as ransomware-immutable and lifecycle age never deletes live deduplicated packs.
  - The Recovery Kit contains engine/format version, RecoverySet/repository IDs, destination hints, recovery credential, and instructions but no cloud, forge, model, tailnet, OAuth, or connector credential. Test Saved Kit proves read-only unlock, while human acknowledgement remains a separate state.
  - The Server-generated Backup Recovery Key uses a canonical human-copy encoding of the existing random credential, never a derivation from Project/account names or a custom encryption/KDF scheme. The admitted engine retains its existing key-slot and repository master-key semantics; this rule selects no new encoding alphabet or algorithm.
  - Clipboard auto-clear after an authorized Copy is best effort only and clears only the still-matching copied key content; it must not erase unrelated newer clipboard content. Disclose operating-system clipboard persistence limits rather than promising complete removal from clipboard history or other OS-managed copies.
  - Repository/destination addition or relocation preserves stable IDs and offers an Updated Recovery Kit when locator, format or key scope changes. Existing kits remain useful through repository discovery where supported; a stale locator is not a lost encryption key. This does not broaden ordinary backup inclusion or the existing Server/connector identity exclusions.
  - Key export sessions are short-lived, audience-bound, one-use where practical, creation/redemption authorized, revocable, and no-store; later export requires step-up and protected attachment. Scheduler unlock uses protected Server/OS/admin secret attachment and projects Unlock required when unavailable.
  - Key-slot rotation adds and verifies every new engine slot before retiring an old slot; compromise uses a new encryption domain/repository or explicit copy/re-encryption and never claims to repair already exposed copies.
  - Rotation binds the human-reviewed original RecoverySet generation/repository/key-slot scope before protected delivery or engine effects. Re-encryption additionally binds the explicitly selected new destination references and new RecoverySet to that review. Existing protected submission, step-up, confirmation, maintenance lease and native engine proofs remain independent requirements; the review contains no raw credential and changes no cryptographic algorithm.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json#/$defs/backup_destination_recovery_admission_record, Plans/backup_restore_system_contract_fixtures.json, future provider/OAuth/key-delivery/rotation/capture-isolation runtime tests]
risk_class: destination_credential_exfiltration_or_recovery_key_loss
reasoning_tier: high
context_scope: backup_destination_auth_encryption_and_human_custody
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future destination adapters and RecoverySetKeyService]
node_compile_hint: {mode: static_destination_and_recovery_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:CLOUD-002-CLOUD-004
  - source_ref:packet:2026-09-01:CLOUD-006-CLOUD-008
  - source_ref:packet:2026-09-01:KEY-001-KEY-004
  - source_ref:packet:2026-09-01:KEY-006-KEY-007
  - source_ref:packet:2026-09-01:BGUI-002
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_residue_2.md#2.2
preserved_exact_tokens: [Use existing, Reconnect destination, Backup Recovery Key, RecoverySet, Save Recovery Kit, Copy Recovery Key, Print Recovery Kit, Test Saved Kit, PKCE, drive.file, Retry-After, Unlock required, no-store]
negative_constraints:
  - Do not place secrets on command lines, in URLs/history/telemetry/world-readable rclone files, route context, ordinary receipts, agent context, screenshot automation, browser storage, service-worker caches, or server file pickers presented as Client paths.
  - Do not conflate storage credentials, Backup Recovery Key, forge/model accounts, or tailnet enrollment.
  - Do not silently widen OAuth scopes, switch accounts, enable destinations, start billable archive retrieval, upload the Kit beside backups, or clone tsnet identity.
  - Do not claim a provider registration, callback, cloud account, encryption result, or key delivery is operational from schema-valid static evidence.
owner_hints: [Plans/Backup_Restore_System.md, Plans/Multi-Account_Connection_Spec.md, Plans/Permissions_System.md, Plans/Release_Supply_Chain.md]
```

### BRS-019 - Locate, Browse, Restore, Retention, And Durable Operational Safety

```yaml
plan_unit_id: BRS-019
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Fresh or ordinary recovery follows one bounded order: choose/import destination or untrusted Kit, validate locator/trust, authenticate storage, select an existing repository, unlock through protected Recovery Key submission, load encrypted manifests, select an immutable snapshot, inspect exact coverage/compatibility, preview, and only then restore. SnapshotBrowser is paginated/read-only and treats text, diff, history, HTML, macros, hooks, symlinks, and artifacts as untrusted content. Restore as New, in place, selective, and Full Server modes retain dependency closure, current target revision, path/identity mapping, migrations, disk space, profile/key readiness, secret exclusion, suspended work, owner approval, the BRS-023 recovery prerequisite, target leases, staged verification, FileSafe decisions, and truthful rollback availability. RestoreRun persists immutable selection, phase/retry/validation/outcome receipts on the recovery coordinator and survives Client loss or Full Server replacement through an external recovery endpoint/token. RuntimeResourceGovernor, ObservableWork, durable outbox, per-repository writer/maintenance leases, phase-aware cancellation, cautious stale-lock recovery, retention holds, prune preview, separate destructive authorization, and cold-retrieval consent remain shared-owner consumers.
gui_related: true
gui_classification_reason: SnapshotBrowser, RestorePreview, DestinationCard, ScopeCoverageSummary, RecoveryKitHandoff, VerificationBadge, RetentionPreview, ObservableWorkProgress, costs, failures, and exact completion axes are visible.
depends_on: [BRS-006, BRS-014, BRS-015, BRS-017, BRS-018, SIR-032]
unblocks: []
acceptance_criteria:
  - A Kit is bounded untrusted input; a new endpoint is reviewed before credentials are sent, unreachable or apparently empty repositories are never initialized, and wrong account/key/repository, missing manifest, revoked access, corruption, and unsupported future format are distinct recoverable errors.
  - Snapshot selection binds immutable snapshot_id rather than latest; search/filter includes Project, capture date/time/timezone, host/source, verification and scope; details include PM/source/JJ coverage, unavailable sources, retention/hold, restore-test result, size, and retrieval conditions.
  - Previewed content cannot execute, escape path bounds, enter an active workspace, or reach agents without separate permission; large trees paginate and symlink/reparse/HTML/script/macro/hook hazards fail closed.
  - Restore apply requires current owner approval, the BRS-023 verified recovery-point or scoped verified-unavailability/human-consent prerequisite, target leases/quiescence, staged verification, and atomic activation where supported; cross-filesystem/remote activation uses a journaled recoverable boundary rather than a false atomic claim.
  - FileSafe adjudicates traversal, case/Unicode collisions, reserved names, executable bits, UID/GID/ACL/xattrs, absolute remaps, unsafe Git/JJ config, and untrusted hooks. Every crash/failure exposes the old state, rollback, quarantine, or a precise recovery boundary.
  - RestoreRun persists selection and per-source/destination phase, retry, validation, and outcome; completion separately reports data restored, source verified, indexes rebuilt, auth missing, and workloads paused. Client disconnect, UI refresh, or process-memory loss cannot fabricate resume or success.
  - RuntimeResourceGovernor preserves interactive/resume/approval reserve across capture, compression, encryption, hashing, IO, network, staging, retries, and process leases. Provider throttling, full staging queues, metered/time-window policy, and cost alerts stop/defer boundedly without hard-coded cloud prices.
  - Append-only/versioned/Object Lock claims require a tested engine/backend/maintenance profile; routine writers lack unnecessary delete authority, protected prune uses separate short-lived authorization, and locks are never removed merely because another writer is temporarily unreachable.
  - BackupCoordinator, CaptureBarrierService, SourceSnapshotAdapter/GitJJClosureValidator, BackupEngineAdapter, destination registry/adapters, scheduler/retention owner, RecoverySetKeyService, SnapshotCatalogProjection, and RestoreCoordinator remain the exact Backup DRY components; the exact shared GUI components are DestinationCard, ScopeCoverageSummary, SnapshotBrowser, RestorePreview, RecoveryKitHandoff, VerificationBadge, RetentionPreview, and ObservableWorkProgress.
  - CMDX-001/CMDX-002 require one owner command/handler route and the shared non-secret operation envelope; all Backup routes remain handler_unavailable and event-silent with "expected_event_types=[]" until independent native and Event Authority evidence exists.
  - PROC-001 and PROC-002 remain evidence requirements for a later bounded execution transaction; these static owner/schema/fixture repairs do not satisfy their baseline, acceptance, tranche, diff, release, or executable proof.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json#/$defs/restore_operational_safety_record, Plans/backup_restore_system_contract_fixtures.json, Plans/shared_integration_runtime_expansion_contracts.schema.json, future destructive restore/retention/provider/GUI/runtime tests]
risk_class: unsafe_restore_or_false_operational_completion
reasoning_tier: high
context_scope: backup_restore_browse_retention_and_operations
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/Shared_Integration_Runtime.md, Plans/Contracts_V0.md, Plans/Project_System.md]
node_compile_hint: {mode: static_restore_operations_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-002-REST-003
  - source_ref:packet:2026-09-01:REST-005-REST-006
  - source_ref:packet:2026-09-01:REST-009
  - source_ref:packet:2026-09-01:AUTO-002
  - source_ref:packet:2026-09-01:AUTO-004
  - source_ref:packet:2026-09-01:AUTO-006
  - source_ref:packet:2026-09-01:BGUI-002
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-002
  - source_ref:packet:2026-09-01:OWN-001-OWN-002
  - source_ref:packet:2026-09-01:OWN-005-OWN-006
  - source_ref:packet:2026-09-01:PROC-001-PROC-002
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4
preserved_exact_tokens: [SnapshotBrowser, RestorePreview, DestinationCard, ScopeCoverageSummary, RecoveryKitHandoff, VerificationBadge, RetentionPreview, ObservableWorkProgress, RestoreCoordinator, RuntimeResourceGovernor, outcome_unknown, observed_complete, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not treat browse, preview, manifest parsing, hashes, static schemas, or dispatch acceptance as restore activation, success, drill proof, runtime evidence, or readiness.
  - Do not run hooks/macros/scripts, expose preview content to agents by default, infer latest, bypass FileSafe, or pretend cross-filesystem activation is atomic.
  - Do not duplicate shared governor, ObservableWork, outbox, lease, auth, credential, scheduler, crypto, storage, command-envelope, or GUI component owners.
  - Do not report PROC-001/PROC-002 as implemented without their later execution receipts.
owner_hints: [Plans/Backup_Restore_System.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Contracts_V0.md]
```

## Working Notebook Backup Participation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook records and required notebook checkpoints are owned project data and participate in Project Backup and selected project/thread exports through existing families — not through a separate sync service: `project.working_notebook` (notebook + entry records) and `project.notebook_checkpoints` join the §3.2 project family list, follow the same reason-coded exclusion manifest rules, and stay out of the Settings transfer product (BRS-001 four-product separation). On restore or copy, identity-bearing refs remap per RestoreRun mode (`as_new` rewrites notebook/entry/checkpoint identities and scope bindings; `in_place` retains), provenance and effective restrictions are preserved, unavailable/pruned source evidence is represented explicitly (never fabricated or silently omitted), and no restored note, checkpoint, or transition record carries foreign write authority or triggers execution. Selective exports distinguish missing/excluded source bodies without leaking them.

```yaml
plan_unit_id: BRS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Notebook records and required notebook checkpoints participate in Project Backup and selected exports as owned project data families (project.working_notebook, project.notebook_checkpoints) under existing manifest rules, never through a separate sync service and never in Settings transfer. Restore/copy remaps identity-bearing refs per RestoreRun mode, preserves provenance and restrictions, represents missing evidence explicitly, and confers no foreign write authority or automatic execution.
gui_related: false
gui_classification_reason: Backup participation is data/recovery behavior, not GUI work.
depends_on: [BRS-019, SP-257]
unblocks: []
acceptance_criteria:
  - Restored/copied notes cannot retain foreign write authority and never auto-execute.
  - Selective export distinguishes missing/excluded source bodies without leaking them.
  - Settings transfer carries no note bodies.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-forge-backup-acceptance
risk_class: restore_authority_leak
reasoning_tier: standard
context_scope: backup_restore
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/Project_System.md]
node_compile_hint: {mode: backup_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I12
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A48
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A49
preserved_exact_tokens: ["project.working_notebook", "project.notebook_checkpoints", "as_new", "reason-coded excluded families"]
negative_constraints:
  - Do not create a separate notebook sync service.
  - Do not include note bodies in Settings transfer.
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Project_System.md, ContractName:Plans/Settings_System.md

### BRS-023 - Phase-Local Restore Evidence And Bound Emergency Consent

```yaml
plan_unit_id: BRS-023
unit_type: recovery_requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  Every RestoreRun phase persists only evidence available at that phase. Staging requires the shared
  restore_recovery_prerequisite: a verified target recovery receipt, or verified unavailability plus
  current explicitly authorized human consent bound to this restore, mode, target, preview, approval,
  and idempotency identity. Mutation and completion preserve prior prerequisites and owner verification;
  emergency consent does not create recovery or rollback capability and waives no other safety gate.
gui_related: true
gui_classification_reason: Phase progress, explicit risk/consent, blocked states, and truthful rollback availability are visible.
depends_on: [BRS-006, BRS-008, BRS-019, SIR-015]
unblocks: []
acceptance_criteria:
  - All nineteen phases have direct positive fixtures and validate in all four retained modes without fabricated future evidence.
  - Early blocked runs/receipts can omit unproduced evidence; mutation-applied and complete states cannot use that exception to shed prerequisites.
  - Mutating commands, run records, previews, and receipts consume the same recovery prerequisite and retain exact mode discrimination.
  - Consent requires verified unavailability, human authority, current receipt validation, bounded expiry, exact identity/target/preview/approval/idempotency binding, explicit risk acknowledgement, and this_restore_only scope.
  - Normal recovery stays the default; refusal does not mutate the target and consent never enables cmd.restore.rollback or claims a recovery point.
  - Project, GUI, catalog, and wiring consumers preserve the owner contract and do not introduce another consent service, command, receipt family, or EventRecord.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, scripts/pm_restore_semantics.py, tests/test_pm_restore_phase_contracts.py, future native per-phase crash and human-authority validation traces]
risk_class: fabricated_recovery_or_unscoped_destructive_consent
reasoning_tier: high
context_scope: restore_phase_and_emergency_prerequisite
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, Plans/Project_System.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: restore_phase_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-006
  - source_ref:packet:2026-09-01:REST-009
preserved_exact_tokens: [RestoreRun, RecoveryPointReceipt, emergency_recovery_consent, restore_recovery_prerequisite, this_restore_only]
negative_constraints:
  - Do not infer emergency authority from an agent request or the initial Restore action.
  - Do not substitute consent for a verified rollback point.
  - Do not equate schema-valid references with authoritative runtime resolution or crash-recovery proof.
```

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-019, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, SchemaID:pm.backup_restore_system.contracts.v2

## Jujutsu D5 Owner Requirements (2026-09-11)

These accepted requirements consume the native owner in `Plans/Jujutsu_Integration.md` and the shared Source Control boundary; planning acceptance is not runtime or readiness evidence.

### BRS-021 - Jujutsu History Index Rebuild Verification Policy

```yaml
plan_unit_id: BRS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Correctness-critical Jujutsu history indexes are rebuilt from retained native history in the isolated
  restore drill. Captured indexes may be retained only as an optional speed aid with consistent capture and version
  compatibility checks; they are neither recovery authority nor a substitute for verified object and retained-operation
  closure. This is the DL-043 policy, not an optional verification feature. Backup consumes JJI-008 native closure
  and isolated historical-operation verification, while Storage owns disposable material custody and native index rebuild execution remains with the Jujutsu owner through the PM-owned internal adapter service.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- BRS-017
- BRS-019
- JJI-008
unblocks: []
acceptance_criteria:
- The isolated drill can prove required retained operation heads, views, objects, conflicts, and selected historical-operation
  inspection/restore without relying on captured indexes; missing or corrupt history cannot be masked by a readable
  cache.
- Rebuild and historical restore run only in the disposable restored environment, never against the original active
  repository; retained-operation and object verification remain required even when a captured compatible index accelerates
  other reads.
- Captured index omission does not count as omitted native history when reconstruction is proved; failed reconstruction,
  unavailable native dependencies, incompatible format, or an incomplete drill stays an explicit unproved or failed
  coverage result.
- Optional speed-aid capture does not silently expand an existing backup policy, cloud upload scope, or historical
  snapshot coverage label. Backup completion and activation retain BRS-019 gates.
validation_surfaces:
- future focused BRS-021 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_backup_restore_system
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/Backup_Restore_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

### BRS-022 - Separately Authorized Missing Repository Data Completion

```yaml
plan_unit_id: BRS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Backup offers a separately authorized workflow to obtain missing repository history or large-file
  data for the exact selected source coverage. It consumes the Source Control transport owner and current credential
  authorization, with explicit source, target, missing dependency scope, network cost and potentially large download
  disclosure. Completion is an effectful operation separate from browse, verification, restore and activation. The
  resulting native closure must be recaptured and verified before a new complete-coverage claim; existing incomplete
  snapshots and receipts retain their historical truth.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- BRS-002
- BRS-003
- BRS-019
- BRS-021
- SCS-014
- JJI-008
unblocks: []
acceptance_criteria:
- Admission binds Project, repository, workspace/source Host, exact missing-dependency inventory, expected source
  revision and authorized remote/credential refs. A changed source, target, remote binding, or scope requires current
  preflight and authorization rather than silently broadening the operation.
- Restored remote URLs, hooks, configuration, portable secrets, credential placeholders and foreign identities confer
  no authority. Completion cannot silently reuse restored remotes or secrets, execute repository hooks, or bypass
  current Permissions and FileSafe decisions.
- Transport success or all-ref fetch does not prove closure for retained native operations. Verify every required
  object, operation/view, retained abandoned or rewritten dependency, LFS/submodule/alternate/shared-store dependency
  within the selected closure; unavailable data remains explicitly incomplete.
- Persist exact attempt, retry/idempotency, partial download and verification outcome refs through existing owner
  receipt boundaries. Cancellation, unavailable credentials/remotes, race or indeterminate transport outcome cannot
  become complete source recovery.
- No automatic activation, workload resume, backup-policy expansion, or replacement of the last complete backup
  follows from download completion. Apply BRS-019 isolated verification and restore gates after closure proof.
validation_surfaces:
- future focused BRS-022 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_backup_restore_system
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/Backup_Restore_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-043, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md

### BRS-024 - Coherent original activation custody backup and recovery

BRS-024 defines coherent backup and restore closure for the complete original activation custody in SP-308. All 54 new families are canonical, non-rebuildable original state/receipt/source-lineage authority requiring mandatory coherent backup. Their exact complete values, keys, schema/version, codec, original source/capture/issuer identity, current mutable selections and permitted transition custody must be available to the backup owner before a durable-result, restart or dependent-dispatch promise. Source-contract registration alone does not establish that backup participation or any native recovery capability exists.

The existing 166 family rows and every prior retention/backup policy remain unchanged. Native dependencies on attempt_record, attempt_receipt and execution_unit_context_store retain their actual original owner posture; this unit does not promote their deferred representation or manufacture a missing execution context. Existing BRS-023 phase-local restore evidence, actual target recovery prerequisite, current approval/lease and staged verification remain independently required. Source custody adoption creates no new restore command, consent shortcut or rollback claim.

#### Coherent original capture sets

A captured compiler recovery set contains the complete current native_plan_compile_head and its original origin, the exact selected full immutable checkpoint and origin, every original artifact/compile receipt participant necessary for its next action, and all genuine referenced original source/repair/audit/verification/approval/test/source-control/request/Models dependencies required by that recovery claim. Full inline canonical state and received repair/Auditor bodies retain their complete schemas. A capture binding or digest does not replace an absent original body, and backup must not reconstruct one from current Plans, event/UI projections, sibling results or a new producer operation.

A captured operational input set preserves each complete original primary and original origin, original output/capture identity and required full source dependencies. Same-original preflight reuses its actual existing Source Control primary/origin and independent FileSafe/source-control objects required by the original receipt’s claim; it is not a duplicate newly synthesized receipt. Models receipt and genuine runtime/configuration/capability sources remain independent originals with their own inclusion and lifetime obligations. Capture origins and semantic issuer origins retain their distinct methods and original transaction provenance.

A captured pre-start association/materialization set preserves the complete actual current Goal body/control/history/Stop/binding/writer-domain and Workflow body/control/outbox, original narrow metadata receipt, immutable original binding revision/origin, required accepted source graph/requirements, native rows/controls/per-WorkNode results/global run control/global run result and every authentic original origin/transition participant. Capture and restore must establish whether the real owner committed T0 reservation only, complete T1 birth/association, or complete T2 materialization. A pending reservation, co-issued candidate or partial capture cannot be labeled as a committed later union.

T0 restores only its genuine owning binding reservation and its immutable candidate/original beforeimage commitments under current original owner admission. T1’s joint membership includes complete W0/control/outbox/origins, Goal B1/control/narrow receipt and binding revision/origin/control; T2 includes the exact six native materialization families, their complete required origins and A4 born/materialization/installed-graph/RequiredSet/body/control/transition participants. All six families must be captured and verified explicitly: the presence of 85 schema definitions or a per-WorkNode result does not replace executor_run_operation_result or its origin. Original pending/phase dispositions are recovered through actual owner contracts; restoration never clears pending to fabricate an empty association or retries mutation merely to reconstruct a missing result.

Current Goal and Workflow keys may already contain later authentic values. Their permitted original compact receipts/origins/transition links carry historical commitments without requiring every overwritten B0/W0 payload. GRS-077’s specific B0-to-B1 association bridge and CurrentWorkflowLaunchChainRead govern what the current reader can establish. Indefinite current-state policy does not create an archive of old mutable bodies. A restored historical selector is not a current-read payload and cannot cause older state to overwrite a newer committed/terminal head. Later start/execution/cancellation/certification current-state restore requires its separate original owner contract, beyond this pre-start chain.

#### Original barrier, restore verification and exposure

The actual backup and every original owner authenticate complete Storage/root/backend identity, current registry/schema/codec and writer/owner generations, all relevant original transactions, currentness/permissions, deletion/tombstones/holds and actual capture boundary before helpers. Coherence is determined by the original transaction/capture protocol, not filesystem copy timing or a declaration that all paths were listed. A multi-part capture that cannot prove an actual consistent boundary remains incomplete and grants no recovery promise. This unit does not claim arbitrary cross-backend/network writes are one redb transaction.

Restore stages complete original values and validates exact bytes, semantic/physical digests, keys, schema/version, scope, operation/output identity/revision, original origin/source graph, transaction membership and current mutable selection. Verify every dependency needed for the exact claimed original next action; a retained reference with unavailable content is disclosed and keeps dependent mutation fenced. Current tombstones, lawful content deletion, legal/reference holds, newer original head/terminal/cancellation/supersession truth and root/owner transfer evidence are applied before exposure. Missing, corrupt, foreign, split-generation or ambiguously restored source authority stays unavailable. No schema migration, guessed original origin, row birth, source reinterpretation or value sanitization is implicit in import.

The actual original registration/dispatch writer graph and current native owner must be re-established by their existing installation/migration contract. Backup restores data and original evidence, not process-held leases, locks, reservations as capabilities, source lifetime, authorization grants or current model/tool availability. A persisted native-looking Owner/SourceSelector/Origin/WriterDomain is not its own installation proof. Every original resumed reader/publisher independently checks the complete current guard and source dependencies under CV-349’s separate resource realms before any effect or disclosure. An old same-ID historical control grammar cannot validate current restored Goal authority.

Each directly callable backup, restore verification, current-source/recovery/readback and exposure participant applies its own full entry and after-all-helpers predicate; an outer restore coordinator’s check never substitutes for the original source owner’s check. The entire candidate/exposure union, including preserved/unrelated newer data and policy/tombstone state, must match the independently expected complete result with no subsequent helper, callback or mutable gap before its actual commit/release. Actual original authenticated readback precedes dependent exposure. Failure preserves genuine earlier capture/restore/effect truth and never triggers a new compiler/probe/Models operation to make recovery appear complete.

#### Retention and evidence limits

The new closed canonical state/artifact/report/receipt/origin values retain SP-308’s explicit mapping to existing RP-AUTHORITY-INDEFINITE@1.0.0, non-rebuildable status and mandatory backup. Independent raw source/body content, requested_effective_runtime, FileSafe snapshots, prior design-only wave/delivery records, logs/provider outputs/test artifacts and all other families retain their actual original policies, anchors, holds and backup inclusion. No reference extends a lifetime, creates a new hold or permits reconstructing disposed content. Full canonical text fields within the adopted closed records remain whole; unsafe original content is refused before issuance by its actual owner, never silently redacted after acceptance.

A recovery report states the actual complete/incomplete original capture and restore disposition, the unavailable dependencies and the exact remaining original owner admission required for the requested action. Passive read/recovery results keep action_authority=none. A successful static schema graph or a backup manifest hash is not a restore drill, crash/atomicity proof, native issuer authentication, PNC-019 clearance, Step9 result or global D05 closure. Those claims require their independently scoped genuine execution evidence and remain NOT_RUN here.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: BRS-024
unit_type: schema_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Coherent original activation custody backup and recovery. Backup captures and verifies each complete
  original source/transaction/dependency set necessary for its exact recovery claim before any durable/restart promise.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- BRS-017
- BRS-019
- BRS-023
- SP-308
- GRS-077
- PNC-025
unblocks: []
acceptance_criteria:
- Backup captures and verifies each complete original source/transaction/dependency set necessary for its exact
  recovery claim before any durable/restart promise.
- Restore preserves current tombstone/hold/newer head and terminal truth, and never reconstructs missing original
  sources or overwritten mutable bodies from retained commitments.
- T0/T1/T2 states and every native/global/A4 participant remain explicit; a partial union or restored serialized
  lease cannot grant original current authority.
- Original owner re-admission and independent lower/final predicates precede resumed effects or disclosure, while
  all existing source lifetimes and restore prerequisites remain unchanged.
validation_surfaces:
- Plans/storage_value_registry.json
- Plans/workflow_activation_contracts/physical-families.json
- Plans/workflow_activation_contracts/retention-field-classification.json
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/association-hash-dependencies.json
- Plans/Goal_Runtime_System.md#GRS-077
- Plans/Plan_To_Node_Compilation.md#PNC-025
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: brs_024_activation_original_custody
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/storage_value_registry.json, ContractName:Plans/workflow_activation_contracts/physical-families.json, ContractName:Plans/workflow_activation_contracts/retention-field-classification.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/association-hash-dependencies.json, ContractName:Plans/Goal_Runtime_System.md#GRS-077, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-025

### BRS-025 - Coherent Workflow and bounded safe-stop custody recovery

BRS-025 defines the complete original coherent backup, restore and recovery boundary for the 55 exact physical families in SP-309. Fifty-four hold full closed original authority/control/receipt metadata, including the four compact original-start families. The D06 event candidate holds the complete bounded goal_run.cancelled producer and typed payload and uses that actual event family's existing RP-AUTHORITY-INDEFINITE@1.0.0 policy. Its event_type and payload are closed to goal_run.cancelled/v3 and payload_ref is required null; it is not a generic event producer or an optional raw-content archive. No persisted D06 value contains a native Body/Control or transient mutation snapshot. Both producer and original event remain under their same actual deletion/hold/redaction authority. The final original-start source persists only compact selectors, commitments, controls and original receipt/issuer metadata. Full start producer and native candidates exist only inside the actual original held publication; the goal_run.started EventRecord retains its own RP-RUNTIME-365D lifetime and is never reconstructed from these rows. Five D01 lineage families use their explicit v4 declarations; unadopted v3 proposal values are not canonical migration inputs. The complete closed schemas in the fixed family/source map determine field classification; no classification comes from a prefix alone.

The existing RP-AUTHORITY-INDEFINITE@1.0.0 policy remains byte-for-byte structurally unchanged: creation anchor, indefinite=true, null TTL/cardinality/byte caps, fail_closed overflow, hold eligibility, expiry_action=none. Applying this already defined authority class to qualifying new original custody rows is explicit; an unknown/unregistered policy is materially incomplete and must never default to indefinite. No new TTL, deletion policy, byte budget or eviction behavior is authored here.

Retain complete required, optional, nullable, nested, numeric, array-membership and typed text values. These records are not described as content-free. Full typed reason/context metadata cannot be shortened, stripped or replaced with a hash to make a retention classification easier. The actual original owner must reject unsafe secrets/raw content before issuance. Selectors, issue commitments, references and compact origins do not extend any referenced original lifetime or recreate disposed content. Mutable current rows keep current state and compact permitted transition custody, not successive full historical body archives. Original full EventRecord, files, blobs, logs, provider output, prompts and native source bodies stay under their existing owners and policies.

Every new authoritative family is non-rebuildable and requires mandatory coherent backup while it exists under its explicit policy. Extend the actual original BRS-024/SP-308 boundary to the complete qualifying new family set and all original references, native controls, compact origins, current heads/pointers, pending coordinator transactions and original first-receipt/seglog state required by a genuine operation. A family list or backup flag alone is not coherent backup. Backup preserves exact original family/key/codec/full value and original identity/operation/epoch lineage; it cannot mint a profile, capability, origin, receipt or historical source.

Restore is one original coordinated identity scope: storage instance, project/Goal/run/compile/invocation identity, original source lineage, controls/heads/pending states, actual permissions, tombstone/deletion/hold state, source registration and codec generations must agree. Restore retains original physical keys, including FileSafe .v2.k1 only for originally installed k1 operations. Never rekey old raw FileSafe values, reinterpret old wrappers, create a missing origin or attach an old numeric process ID. Restored bytes do not revive a native lease, child process, external effect capability or runnable release. Current original owners must independently establish the complete current boundary; otherwise admission remains unavailable.

Recovery reads same-original committed custody and distinguishes real pending work from complete original commits. Missing non-rebuildable authority is data loss/unavailable with the existing actual recovery disclosure path; it is not a rebuildable projection, legacy promotion, schema-shaped success or optional backup omission. Process/aggregate crash and required-flush failure retain their original sticky failure semantics. The FileSafe recovery fence is unresolved, not successful effect transfer.

Deletion, holds and redaction remain actual original-owner/Storage policy decisions. None of these registrations authorizes a new raw archive, release of a held safe point, log or blob, early removal of original receipt/dedupe identity, or recreation after tombstone. Janitor, backup, restore and recovery apply the same complete native current-source/owner/permission/registration/hold/deletion boundary independently before and after every helper and before mutation or disclosure. If required authority cannot be retained/decoded/backed up under its real policy, fail closed.

All existing 220 family value schemas, key shapes, codecs and retention policies and all 27 policy objects remain unchanged. Only the four explicitly enumerated owner-reviewed existing rows may have metadata differences: workflow_goal_run_body and workflow_goal_run_control gain original D06/start producer/readers; workflow_original_source_origin and workflow_start_outbox_intent gain bounded read/scope annotations. Their complete stored schemas, keys, codecs and lifetimes remain unchanged. Existing FileSafe safe_point_record, safe_point_restore_transaction and permission_snapshot_record and Process mcp_server_lifecycle_record, seglog_current, seglog_manifest and event_append_receipt_custody remain exactly reused families, not seven new registrations.

The coherent backup set includes the entire registered original family domain and the actually issued rows for this exact original scope, together with authentic source-owner phase/absence custody for not-yet-issued families. It does not demand a fabricated row for a phase or role that genuinely never occurred. Missing expected original custody, an unknown handoff or an unprovable absence remains unavailable; an empty array or reader observation cannot establish nonissuance. Pending original start/cancellation outcomes remain explicitly pending until the real original coordinator establishes its complete outcome.

Start Candidate and Origin use their explicit compact v2 keys/grammars, Commit and Control retain their declared v1 shapes, and the initial StartControl is issued only in the authentic original begin transaction. Its separate unchanged A4 original origin authenticates that exact initial value/key/hash under the before-birth profile. Later current source reads consume compact original start commit/origin plus actual current control/native sources; they do not promise retained historical full producer/native candidate bodies or a full original publication replay. The independently callable lower Storage start participant repeats the whole genuine original union and final fences; an append receipt or a redb commit alone never establishes the joint original outcome.


#### Event and native qualification boundary

GRS-079/SP-311 now adopt the complete original started-v3 reader/consumer, owned durable projection/checkpoint and exact existing-family registry selection. GRS-080/SP-312 now separately adopt the complete positive cancelled-v3 consumer, versioned combined projection/checkpoint and exact existing cancelled-family v3 source selection. Existing started-v3 methods, rows and profiles remain unchanged. The original started RP-RUNTIME-365D and cancelled RP-AUTHORITY-INDEFINITE policies remain unchanged. Neither source adoption nor a registry row clears Event depth, original native source/codec/custody/backup qualification or runtime execution; those independent gates remain unproved. No sibling checkpoint or passive none_required disposition is borrowed.

Native installation/capability authentication, complete original source execution, both final fences and all-writer exclusion, exact codec execution, original atomicity/fsync/crash recovery, current/retained replay, coherent backup/restore and compatible outer Goal terminal integration remain NOT_RUN. RequiredCheckpointSuccess is false in the bounded aggregate. No WorkNode, NodeSeed, executable queue, runtime/readiness admission, global safe-stop closure, Step 9 result or governance seal follows from these source contracts.

```yaml
plan_unit_id: BRS-025
unit_type: schema_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Coherent Workflow and bounded safe-stop custody recovery. Backup covers every genuinely issued original
  custody participant, mutable head/control, pending coordinator and required first-event/barrier state in the exact
  original scope.
gui_related: false
gui_classification_reason: Defines original runtime source, owner, storage and verification semantics without a
  visual surface.
split_recommended: false
depends_on:
- BRS-024
- SP-309
unblocks: []
acceptance_criteria:
- Backup covers every genuinely issued original custody participant, mutable head/control, pending coordinator and
  required first-event/barrier state in the exact original scope.
- Authentic source-owner phase and absence custody distinguishes genuinely unissued records from lost or unknown
  original authority.
- Restore preserves original full values, keys, versions, operation lineage, deletion/hold state and current source
  registrations without reviving native capabilities.
- Unknown source, failed flush, pending transaction or lost non-rebuildable custody remains truthful and fenced.
validation_surfaces:
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
- Plans/storage_value_registry.json
risk_class: original_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: brs_025_original_source_contract
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/executor_cancellation_contracts/methods.json
- Plans/executor_cancellation_contracts/realm-entry-boundaries.json
- Plans/executor_cancellation_contracts/physical-families.json
- Plans/executor_cancellation_schema_resources.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, origin, receipt, current body, native authority or retrospective original enrollment.
- No numeric coercion, lossy codec, hidden effect/census member or required-flush failure removal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/executor_cancellation_contracts/methods.json, ContractName:Plans/executor_cancellation_contracts/realm-entry-boundaries.json, ContractName:Plans/executor_cancellation_contracts/physical-families.json, ContractName:Plans/executor_cancellation_schema_resources.json


### BRS-026 - Coherent original Workflow Goal cancellation backup and restore

BRS-026 applies BRS-025 and SP-310 to the GRS-078 original Workflow cancellation profile. The three original audit families retain their genuine accepted V2 routes, old whole values and original keys; the additional V3 routes use the three versioned carriers plus three compact lineage families selected by `Plans/goal_workflow_cancel_contracts/physical-profiles.json`. Its nonstored schema composition grants no new stored envelope, admission or authority. Whole source, key, codec, phase and original accepted profile remain inseparable at backup and restore.

All six profiles use existing `RP-AUTHORITY-INDEFINITE@1.0.0`: actual creation anchor, indefinite retention, no new TTL/count/byte eviction, existing hold eligibility, fail-closed overflow and original privacy/deletion/restore rules. The three audit profiles inherit the original complete command/event audit meaning. The three new metadata profiles use the existing original lineage/assignment authority class. There is no new retention policy or universal content-free category. References and commitments create no hold on Goal/history/Workflow/D05/EventRecord sources and never recreate disposed source bytes. A retained terminal may report original command facts only; it cannot prove a current EventRecord or current native source remains available.

Each authoritative profile is canonical non-rebuildable custody and requires actual mandatory coherent backup. Before admission the genuine Storage owner must enroll the exact family/profile/key/schema/codec/root in its original backup/restore, deletion/hold and migration boundaries. Registry `materialized` is a source-definition classification, not proof of installed native writers or successful backup. An absent registration or missing required authority fails closed; it does not become a default policy or a rebuildable projection.

A coherent capture includes all **actually issued** records for the original scope and authentic phase/absence evidence for profiles that have not yet issued. Capture the existing SourceAudit, Stop/control/receipt, current progress head plus selected immutable epochs, SIR terminal/outcome/response, original event/first custody, versioned control publication and the three compact lineage values at their real phases. Include original positive D06 result/origin and applicable retained D05/start/native sources through their real owners. Full Goal body/control/history/origin and event/source bytes enter only while legitimately retained and required by that original boundary. An early no-effect or unknown outcome cannot be forced to contain a future assignment, D05/D06 success or publication. A family list, empty array, surviving reference or lookup failure is not coherent capture or proof of nonissuance.

Capture and release independently authenticate actual original owner/root/permission/deletion/hold/codec/backup controls before helpers and in the final pure predicate. Restore uses the protected image and genuine original Storage coordinator, applies current tombstones before disclosure, preserves newer Stop/progress/terminal truth and authenticates the original immutable selected epoch and whole outer hash. It cannot silently accept an image missing an issued mandatory family, backfill an origin, alter old keys, manufacture an EventRecord or revive a lease, native process, late reservation, callback capability or runnable release. Missing original authority remains data loss/unavailable under the existing disclosure/recovery path.

A lost or released late reservation cannot be reacquired by this stored audit. Same-owner restart may only resume a genuinely already admitted stage whose complete native fences still hold. Unknown or refused later work preserves every real earlier Stop/receipt/D05/D06/append/control effect and never fabricates no-effect or success. Retained succeeded and unsettled readers keep their distinct complete source prerequisites; neither replays cancellation or demands disposed historical bodies. Withdrawal removes current effect authority while preserving lawful original audit facts and original deletion/hold dispositions.


The SP-310 complete field classification, including actual original typed UICommandError diagnostic text, applies before admission and backup; no content is made admissible by dropping, hashing or rewriting original fields. Whole retained terminal facts do not imply present EventRecord or native source availability. Current tombstones, lawful holds and actual source retention govern release. No policy duration or source retention is extended.

Every independently callable capture, restore, verification or release helper repeats the full authentic source/owner/root/registration/permission/deletion/hold/backup/codec predicate before helpers and as the final pure predicate after every returning helper and after all helpers, without a callback or mutable gap before its own effect or disclosure. Restoration preserves actual earlier effects and immutable original terminal truth; it cannot implicitly enter an action-recovery route.

This source contract does not establish installed native capture/restore, transaction/crash qualification, complete v3 Workflow event consumers/checkpoints, event depth, native runtime/readiness admission or a governance seal. SP-310 records the unchanged readiness validator representation gap.

```yaml
plan_unit_id: BRS-026
unit_type: schema_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Coherent original Workflow Goal cancellation backup and restore. Mandatory original profile enrollment
  and actual phase-sensitive issued-record capture precede authority admission.
gui_related: false
gui_classification_reason: Defines native owner, typed source, physical custody and verification semantics without
  a visual surface.
split_recommended: false
depends_on:
- BRS-025
- SP-310
unblocks: []
acceptance_criteria:
- Mandatory original profile enrollment and actual phase-sensitive issued-record capture precede authority admission.
- Coherent images include full authentic original selected immutable progress and every actually issued required
  custody participant without demanding nonexistent future success records.
- Restore applies current tombstones, preserves newer Stop/progress/terminal facts and authenticates original
  keys, codecs, owner and backup controls.
- No missing source, EventRecord, reservation, lease, process or action capability is recreated from retained
  audit or a protected image.
- Independent capture/restore/release boundaries repeat complete authentic entry and final predicates; native
  crash/restore qualification remains unproved.
validation_surfaces:
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
- Plans/storage_value_registry.json
risk_class: original_goal_workflow_source_custody_or_native_admission_drift
reasoning_tier: high
context_scope: brs_026_original_source_contract
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/goal_runtime_workflow_cancel_contracts.schema.json
- Plans/goal_workflow_cancel_schema_resources.json
- Plans/goal_workflow_cancel_contracts/entry-boundaries.json
- Plans/goal_workflow_cancel_contracts/methods.json
- Plans/goal_workflow_cancel_contracts/numeric-paths.json
- Plans/goal_workflow_cancel_contracts/physical-profiles.json
- Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json
source_atom_ids: []
negative_constraints:
- No public command, event-membership, Goal lifecycle or retention-policy expansion.
- No fabricated source, absence, original acceptance, native authority, receipt, reservation or retrospective
  enrollment.
- No numeric coercion, lossy codec, stored header relabelling, dropped diagnostic branch or rewritten immutable
  terminal.
- No WorkNode/NodeSeed/runtime/readiness/event-depth/global safe-stop or governance claim from source adoption.
```

ContractRef: ContractName:Plans/goal_runtime_workflow_cancel_contracts.schema.json, ContractName:Plans/goal_workflow_cancel_schema_resources.json, ContractName:Plans/goal_workflow_cancel_contracts/entry-boundaries.json, ContractName:Plans/goal_workflow_cancel_contracts/methods.json, ContractName:Plans/goal_workflow_cancel_contracts/numeric-paths.json, ContractName:Plans/goal_workflow_cancel_contracts/physical-profiles.json, ContractName:Plans/goal_workflow_cancel_contracts/schemas/storage-profile-composition.schema.json


### BRS-027 - Source-coupled started projection recovery and disclosure

BRS-025 remains the owner of mandatory coherent backup for original Workflow Start/D01 authority and genuine Event/first-receipt/seglog custody while retained. The two new SP-311 families are disposable projection/checkpoint state, not replacements for that non-rebuildable original set. Existing source family rows, keys, complete schemas, codecs, hold/deletion rules and all 27 retention-policy objects remain unchanged. A derived family backup flag never turns source backup into optional metadata.

Original goal_run.started keeps exactly RP-RUNTIME-365D@1.0.0: 31,536,000 seconds from run completion, 1,000,000 per run, 5,000,000 per project, roll_successor overflow, original holds and compact expiry. Start/D01 compact authority retains its separately declared original policy and authentic issuance. A surviving projection, checkpoint, source selector, original receipt or native commitment cannot disclose or reconstruct an expired/deleted full EventRecord or missing original native custody. No historical native Body/Control, transient producer or whole input-argument archive is added.

The complete StorageProjection contains full original typed started Event content and original commitments/receipt; it is not content-free metadata. Its disclosure remains source-coupled to genuine retained Event and complete original native custody. Exact RP-PROJECTION-3GEN@1.0.0 governs its own generation/checkpoint lifecycle: current has no TTL, retired first actual retirement plus 604800 seconds, maximum three including staged/current/retired, logical-key cap, authentic holds/references and rebuild overflow/expiry. A projection hold creates no Event or original native-source hold. Source expiry/deletion fences derivative content disclosure and requires the governed source-coupled rebuild/removal disposition; a held retained generation cannot bypass that disclosure fence or be reinterpreted as full current source. No field is trimmed or replaced by a hash to fabricate a readable partial success schema.

Checkpoint loss, corrupt row/dataset binding or incomplete generation invalidates projection coverage and triggers rebuild only from the actual complete current generic source and genuine retained native custody. Actual retention-owner gap decisions must agree with the whole SP278 selection/frontier; empty survivor scan does not prove never-started. Rebuild stages an isolated fresh generation, validates every global prefix record and native cause, and atomically cuts over row/dataset/root under the complete original Storage final fence. Unsupported relevant events halt before their row; missing expected original source yields unavailable. Never rebuild the original Event, receipt, native state, origin or capability from the projection. Original missing non-rebuildable authority retains BRS-025 data-loss/unavailable disclosure rather than being mislabeled a disposable projection loss.

If derived rows/checkpoints are included in a backup image, capture them as a coherent optional root/generation/dataset unit with exact physical keys, codecs, full values, immutable anchors, advancing frontier, lifecycle facts and actual hold references. Their restore does not assert currentness: after current tombstones/deletion/permission/holds are applied, independently revalidate original source availability, actual generic selection/frontier, native owner/custody and source registrations. A stale/incomplete derivative unit is refused or lawfully rebuilt; it never overlays newer native controls, invents old bodies or recreates authority. Original protected backup cannot extend current retention or resurrect tombstoned Event content. Each actual backup, restore, janitor and passive disclosure owner independently obtains whole applicable sources before helpers and repeats the full pure predicate after all helpers with no gap to mutation/release.

Historical read returns full original facts only while its actual sources remain retained and current disclosure permitted. Current projected running read also requires the full fresh native and separate Goal controls and complete current global frontier; advanced native/D06 state is unavailable to that bounded view. Backup/restore, Event depth, real native custody, concurrency/crash/TTL/hold behavior and deterministic replay remain NOT_RUN until independently qualified. No governance seal, current runtime admission or action capability follows from these source definitions.

```yaml
plan_unit_id: BRS-027
unit_type: schema_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Complete original started-v3 source and bounded consumer ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Defines original runtime source, custody, replay and retention contracts without a visual surface.
split_recommended: false
depends_on:
- BRS-025
- SP-311
unblocks: []
acceptance_criteria:
- Exact original whole source and retained/current boundary is preserved.
- Only the existing started Event family changes; all other Event rows and all 278 Storage rows and 27 policies remain exact.
- The mandatory durable projection has complete atomic generation/checkpoint ownership.
- Source definitions do not claim installed native authority, Event depth or runtime execution.
validation_surfaces:
- Plans/goal_run_started_consumer_contracts/consumer.schema.json
- Plans/goal_run_started_consumer_contracts/methods.json
- Plans/goal_run_started_consumer_contracts/physical-families.json
- Plans/goal_run_started_consumer_schema_resources.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: original_started_source_or_projection_currentness_drift
reasoning_tier: high
context_scope: original_started_v3_consumer_adoption
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```


### BRS-028 - Whole original cancellation source retention and combined projection recovery

Original non-rebuildable D06/D05/D01/Start/Goal/Storage/effect authority keeps its existing exact family keys, full schemas, native provenance and mandatory backup/disclosure rules under BRS025 and its original owners. The new two combined projection/checkpoint families are disposable derived state with optional coherent derivative backup. Their registration does not make original source backup optional, enlarge an authority or require a historical mutable Workflow/Goal-body archive. All 27 retention-policy objects remain exact.

Original started remains RP-RUNTIME-365D@1.0.0: 31,536,000 seconds from run completion with original 1,000,000/run and 5,000,000/project caps, roll_successor, holds and compaction. Original cancelled remains RP-AUTHORITY-INDEFINITE@1.0.0 with actual original deletion/hold/backup controls. Every original native/Goal/Start compact record, process record, FileSafe journal and raw artifact retains its separate source lifetime. Indefinite cancelled retention or a projection hold does not extend another source, recreate a disposed full journal or retain raw files indefinitely.

CombinedStorageProjection contains a complete original started or cancelled EventRecord/payload plus exact original issuance/receipt/selector facts. Treat the full Event as retained source content, not metadata; do not trim fields to manufacture partial success. Every current, staged, retired or held generation has an independent actual source disclosure fence. Missing/expired/deleted original Event or required full causal/effect source makes dependent reads unavailable and triggers the lawful governed derivative rebuild/removal disposition. A historical commitment may survive its own policy but cannot substitute for missing full source. No read refreshes a source TTL or retirement clock.

The cancelled branch carries original Start metadata selectors, not a duplicate full earlier started Event. A cancellation may remain readable after lawful started Event expiry only if a complete new survivor scan and all full cancellation/native/Goal/effect/retained Start sources remain authentic and available. The started projection branch always requires its own complete original started Event. Neither an old held started generation nor a derived cancelled row may reconstruct or disclose expired original content. An old started-v3 root is not converted into the new combined root; both source contracts remain separately bound.

The existing RP-PROJECTION-3GEN@1.0.0 governs exactly the new generation lifecycle: maximum three including staged/current/retired; current no TTL; original retirement plus 604800 seconds subject to authentic holds/references; immutable first preparation/activation/retirement/successor facts; governed rebuild on expiry/overflow. Whole root/dataset binding, generation anchor and advancing frontier must remain coherent. Checkpoint loss permits only a new isolated derived rebuild from actual complete generic retained source and authentic original causal records, never original Event/native/receipt/origin/capability repair. Actual source retention gaps require the full Storage owner proof; an empty survivor scan is not never-started or never-cancelled. Unsupported relevant events halt before the row and incomplete staged coverage cannot cut over as current.

If backed up, optional derived root/generation/dataset values form one coherent unit with exact physical names, complete bytes/codecs, anchors/frontiers, lifecycle facts and actual hold references. Restore first honors current tombstones, deletion, permissions and holds, then independently revalidates actual generic source/current frontier, original custody and source availability. Stale or incomplete derivative state is refused or rebuilt; it cannot overwrite native/Goal controls, claim currentness from an old root, revive source content or substitute for missing mandatory authority. Original authority loss keeps its owner data-loss/unavailable disclosure; disposable projection loss is a different condition.

Each actual backup, restore, janitor, retained-custody and passive disclosure helper independently obtains complete applicable real source/candidate/controls before helpers and reevaluates the entire pure final predicate after every helper and immediately before its effect/release with no interleaving gap. Token/hash equality or caller checks alone are insufficient. Full current cancelled disclosure additionally requires complete fresh positive native/D05/Start and separate Goal controls at the held read boundary; historical reads assert no current state and never reconstruct historical mutable bodies. Native codec/atomicity/crash/retention/hold/backup/restore execution and Event-depth qualification remain NOT_RUN. This source adoption changes no policy, validator, runtime admission or governance lock.

```yaml
plan_unit_id: BRS-028
unit_type: schema_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Complete positive original cancelled-v3 source consumer and bounded versioned projector ownership; native execution remains unproved.
gui_related: false
gui_classification_reason: Original runtime custody and derived source currentness contract without visual presentation.
split_recommended: false
depends_on:
- BRS-025
- BRS-027
- SP-312
unblocks: []
acceptance_criteria:
- Whole original Event/native/Goal/effect sources and independent helper entry/final predicates are preserved.
- Only the cancelled Event row changes; two separate derived families preserve all 280 expected predecessor rows and all 27 policies.
- Existing started-v3 profiles and methods remain unchanged, with explicit fresh combined generation/cutover.
- Source adoption does not qualify installed native authority, Event depth, runtime or governance.
validation_surfaces:
- Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json
- Plans/goal_run_cancelled_consumer_contracts/cancelled-causal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/goal-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/filesafe-arguments.schema.json
- Plans/goal_run_cancelled_consumer_contracts/methods.json
- Plans/goal_run_cancelled_consumer_contracts/physical-families.json
- Plans/goal_run_cancelled_consumer_schema_resources.json
- Plans/storage_value_registry.json
- Plans/event_family_registry.json
risk_class: original_cancelled_source_or_combined_projection_currentness_drift
reasoning_tier: high
context_scope: positive_cancelled_v3_consumer_adoption
implementation_surfaces:
- Plans/Backup_Restore_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Executor_Protocol.md#EP-118
- Plans/storage-plan.md#SP-309
- Plans/Backup_Restore_System.md#BRS-025
source_atom_ids: []
```


## BRS-029 — Mandatory original phase custody; optional coherent derived generation, source lifetime and restore ordering (2026-09-21)

```yaml
plan_unit_id: BRS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: Mandatory backup preserves complete original native and compact certified authority/custody at the
  actual phase, including authentic original issuance and whole all-member Event append group, native/D01 commit
  and release. A partial restore is unavailable and mutation-fenced; generic Event-index rebuildability never makes
  original compact receipt/certification custody reconstructible. Preserve existing original source lifetimes and
  exact policies. Optional derived backup is one coherent checkpoint/root/generation/dataset unit, never independently
  selected rows or checkpoints. Apply authentic deletion/tombstone, permission, hold and source-lifetime controls
  before admission, then validate complete original sources, current owner graphs and actual generic/replay frontier
  before current disclosure or cutover. Rebuild derives only from surviving authentic original authorities; it cannot
  recreate missing native bodies, producer source arguments, expired Start events, original operation origins or
  capabilities. No held or indefinitely retained certified record resurrects deleted content or extends another
  source lifetime. This version-scoped complete family supplies the previously unbound certified-v3 identity/coordinator/Event
  selection and passive consumer source roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7
  birth and pm.goal_run_certified.producer_source.v2 prepare.v2 binding. Earlier native-v6 and producer-v1 source
  editions and old started/cancelled branches retain their original closed scope; no existing birth is enrolled
  or cast. The complete methods, protocols, schemas, phase and participant tuples, isolated resource banks and physical/lifetime
  contracts under Plans/goal_certified_event_coordinator_contracts/, Plans/workflow_standard_source_contracts/native-v7/,
  Plans/goal_certified_producer_source_contracts/ (including native-v7/) and Plans/goal_run_certified_consumer_contracts/
  are normative together. Source acceptance and registry classification establish neither installed native authority
  nor execution, codec, transaction, durability, recovery, Event-depth or readiness proof. All such native evidence
  remains NOT_RUN. No WorkNode or NodeSeed is created.
gui_related: false
source_lineage:
- certified-family-placement:sha256:41a4d703b475c2668b243b043934bf0e3a0f22f33c1e663b339aa1aa2395099c
- root-placement-review:sha256:00981271bf2b645c3610804251ce240f83f3d121ab2c654b0fe98b3c5396909c
- accepted-header-source:sha256:dd464f1bec2a1691a045aec1fcd816de1c83feb70f8065f1e37ef0c053b890fe
- producer-repin-source:sha256:ad4c49b5e1fb43425a390c9cb666a95503483699779dfdb860ec770d2e06376a
- consumer-repin-source:sha256:e6f9be4094e68b5d690e93db45ba3199ccff20a1c72fe93264aadf822ed1896d
depends_on:
- PDS-003
- BRS-028
unblocks: []
acceptance_criteria:
- Preserve the complete scoped source and every original entry/final/phase/type/lifetime predicate.
- Use complete canonical resources and exact isolated original retrieval scopes; prove full inverse metadata and
  actual final acyclic hash graph.
- Native installation, authentic original source capabilities, execution, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
validation_surfaces:
- Plans/goal_certified_event_coordinator_contracts/protocol.md
- Plans/goal_certified_event_coordinator_contracts/phase-boundaries.json
- Plans/goal_certified_event_coordinator_contracts/participant-method-tuples.json
- Plans/goal_run_certified_consumer_contracts/protocol.md
- Plans/goal_certified_family_composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: brs-029_whole_certified_family
implementation_surfaces:
- Plans/Backup_Restore_System.md
- Plans/goal_certified_event_coordinator_contracts
- Plans/goal_certified_producer_source_contracts
- Plans/workflow_standard_source_contracts/native-v7
- Plans/goal_run_certified_consumer_contracts
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-029, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json

### BRS-030 - Four-Action Original Operation And Owner Result Protocol

```yaml
plan_unit_id: BRS-030
unit_type: integration_contract
status: accepted
owner_doc: Plans/Backup_Restore_System.md
canonical_text: >-
  cmd.backup.destination.update, cmd.backup.verify, cmd.backup.test_restore and cmd.backup.file.compare bind the
  original admitted domain input to actual owner-resolved sources, effects and outcomes under the protocol below.
  BackupCoordinator owns destination update and verification;
  RestoreCoordinator owns disposable drill target admission and lifecycle; Backup browse/compare consumes real
  File or Source Control target resolution without creating another command handler. Separately typed owner
  metadata, BackupVerificationReceipt and BackupBrowseOperation retain only admitted redacted operation facts,
  never the command transport.
  Historical read compatibility, schema validity, matching references and caller-supplied facts are not current
  admission, authentic source custody or execution proof. Companions and central bindings must satisfy this
  protocol before enablement; absent materialization remains a specification prerequisite, not a completed feature.
gui_related: false
gui_classification_reason: Defines backend operation identity, source resolution, result custody and replay without changing visual presentation.
depends_on: [BRS-004, BRS-007, BRS-014, BRS-015, BRS-017, SP-251]
unblocks: []
acceptance_criteria:
  - All four results join the original admitted operation input and real owner output; swapped instances, operands, sources or evidence fail the join.
  - Destination update preserves identity and unedited configuration, rejects stale concurrent updates, and never preserves an inapplicable test or readiness claim.
  - Verification accounts for every selected snapshot exactly once, including unresolved or failed members, and distinguishes requested from achieved scope.
  - A drill uses a versioned BackupVerificationReceipt branch, not a fabricated live RestoreReceipt or a fifth RestoreRun mode; requested coverage never waives mandatory source closure.
  - Compare preserves both actual operands and supports File-owned targets independently of Git or Jujutsu; it cannot perform checkout, restore or activation.
  - Replay uses genuine retained owner facts with current disclosure permission; missing evidence never causes implicit reexecution or fabricated completion.
  - Transport remains nonpersisted, versioned domain records require explicit storage admission, and all native proof remains NOT_RUN.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, Plans/storage_value_registry.json, future joined-owner source and result validation]
risk_class: substituted_backup_operation_or_false_result_custody
reasoning_tier: high
context_scope: four_backup_action_owner_protocol
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future BackupCoordinator and RestoreCoordinator]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-089
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-101
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-102
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-110
preserved_exact_tokens: [cmd.backup.destination.update, cmd.backup.verify, cmd.backup.test_restore, cmd.backup.file.compare, BackupCoordinator, RestoreCoordinator, BackupVerificationReceipt, BackupBrowseOperation]
negative_constraints: [Do not persist raw command transport., Do not authenticate an owner through caller facts or matching strings., Do not create a sixth receipt family or fifth restore mode., Do not enable an action from static validation.]
owner_hints: [Plans/Backup_Restore_System.md, Plans/storage-plan.md, Plans/FileManager.md, Plans/Source_Control_System.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

#### Original operation and custody

For `cmd.backup.destination.update`, `cmd.backup.verify`, `cmd.backup.test_restore` and `cmd.backup.file.compare`, the sole handler passes the admitted typed action input to its actual domain owner. That owner binds `operation_id`, original `command_id`, `command_instance_id`, `idempotency_key`, actor and permission context, expected currentness, source surface and return route to the exact selected action operands. The binding is immutable for that operation. Later focus, current checkout, latest snapshot, a replacement target or refreshed authority cannot rewrite what was requested or what actually happened.

The owner compares the typed domain input, not a caller's assertion that two hashes or references match. Reusing an idempotency identity with different action operands is rejected. Objects compare by their typed fields, not JSON key order; snapshot selection is a duplicate-free set. An original command instance remains distinguishable from a later transport retry. Retrying disclosure under current read permission does not replace the original effect's actor, permission/currentness evidence or selected input. The actual owner independently resolves and validates its complete inputs and applicable permission, source, target and currentness fences before an effect and before releasing a result; any race must be fenced by that owner's existing concurrency mechanism. Late refusal records genuine prior effects and partial work, not a fictitious no-effect result.

An accepted response identifies work, not completed verification or mutation. Existing ObservableWork correlation applies without changing its owner vocabulary. Completed, failed, cancelled, no-change and partial domain facts must come from the actual operation. Transport responses may be reconstructed from genuine retained owner facts after current disclosure checks; this is not reexecution. Missing original source or outcome evidence yields unavailable/unproved. A receipt list, test-only facts map or serialized `authorized`/`isolated`/`current` claim cannot authenticate an owner or authorize an effect.

`scd.backup_restore.command_transport.v1` remains nonpersisted: request/result/error/availability transport is discarded at terminal or invalidation, and protected payloads expire earlier. Successor transport versions require explicit disposition coverage. Any restart/replay binding is a separately typed, versioned field in the appropriate destination metadata, BackupVerificationReceipt or BackupBrowseOperation, not a nested copy of the public command envelope. Retain only the nonsecret selected operands, original correlation/authority references and actual result facts needed by that domain record. Raw keys, protected submissions, absolute paths/private host locators, capture bodies and browser/auth material remain excluded. No new command-history archive or sixth receipt family is introduced.

The exact versioned record kinds require explicit storage disposition and physical admission under SP-251 before dependent runtime persistence or enablement. The existing Backup durable disposition remains `physical_family_registration_pending`; this protocol does not register a physical writer. Existing Backup retention and authentic holds apply independently to each retained source. A retained reference neither extends another source lifetime nor reconstructs disposed evidence. Repository/snapshot/export bytes remain in external Backup custody, not ordinary command metadata.

#### Destination update producer and result

BackupCoordinator's destination owner retrieves the actual `backup_destination` for the selected Server/destination and checks the expected generation, editable field contract and referenced configuration/auth owners. It applies only the explicit patch under its concurrent-state fence. Its typed result binds the original operation, actual before identity/generation, requested patch, disposition and resulting identity/generation. The separately versioned destination metadata must bind its actual owner-applied result to that operation; a fresh transport result may consume that binding without persisting the transport body. If historical output is no longer retained, a newer current destination does not stand in for it.

No-change is an explicit owner outcome, not a fabricated increment or test. Applied and no-change results preserve identity and all unedited configuration. Health, capabilities, test disposition and currentness are derived from the resulting effective configuration under BRS-004; old test proof survives only if its authentic scope remains applicable. Label-only edits need not force a test. Neither result grants credentials, reassigns repositories, deletes backend data or declares readiness from an old reference. Failure after an actual effect retains its real result/recovery facts and cannot be reported as a rejected pre-effect request.

#### Snapshot resolution and verification producer

BackupCoordinator resolves each selected `(repository_id, backup_destination_id, snapshot_id)` through its actual repository binding, committed destination attempt and commit evidence, originating BackupRun/BackupReceipt and immutable BackupManifest. The join must agree on the actual backup, manifest, capture set, RecoverySet, Server/Project boundary and source custody applicable to that repository. `repository_snapshot_refs` are resolved by their owner to that committed relationship; parsing a suffix or equating opaque strings does not establish membership. Selected path and capture-set claims must match the resolved manifest where applicable. Missing or incompatible source is a resolution failure, never a synthesized manifest.

For `cmd.backup.verify`, the version-pinned BackupEngineAdapter performs the requested structural, sampled-data or full-data check against those resolved bytes. A versioned BackupVerificationReceipt binds the original operation and full selected set, repository/destination, and one outcome per selected snapshot. Each outcome records requested scope, actual achieved scope (or none), status, actual coverage/check evidence and resolved manifest/capture identity when resolution succeeded. Unresolved members retain their selected identity and failure reason with absent resolved evidence. They are not dropped, assigned a borrowed manifest or silently replaced by another snapshot. No unrequested member may inflate coverage. A selected-set pass requires every selected member to pass its requested level with genuine evidence; a weaker check, cancellation, not-run or missing member cannot produce that pass. Verification does not imply an isolated restore drill.

#### Isolated drill target, lifecycle and result

For `cmd.backup.test_restore`, RestoreCoordinator consumes BackupCoordinator's actual resolved snapshot and owns admission and lifecycle of the explicitly selected disposable target. Its internal typed target-admission output binds original operation and selection, actual target identity, Server/Host/Environment and applicable Project/path containment, owner generations/lease, permission and FileSafe decisions, and applicable cost/network/resource admission. The actual topology, FileSafe and Permissions owners supply these decisions. This output is not a transferable authorization token: current owner fences must hold before staging, native verification and cleanup. No focused Project, default path or caller isolation flag supplies the target.

RestoreCoordinator stages only within that authorized disposable target, never activates a live Project and never executes untrusted restored hooks. It records attempted effects, interruption/failure, retained partial artifacts and the actual cleanup disposition. Cleanup cannot claim success without evidence or delete outside the admitted target; inability to clean up remains an explicit residual obligation. Restart reconciles genuine original operation and target custody before any continuation; missing custody does not authorize a replacement target or an automatic fresh drill.

The isolated-drill branch of versioned BackupVerificationReceipt binds original operation input, selected and resolved snapshot/manifest, target admission, requested versus attempted/achieved family/path coverage, actual owner verification evidence, partial effects and cleanup disposition. A passed drill requires completed genuine isolated verification of requested coverage and every mandatory dependency; cleanup disposition remains separately truthful and an outstanding cleanup obligation cannot be presented as an entirely successful operation. Consume SCS-014 and JJI-008 native source-closure/verification evidence where applicable, including `backup_jj_restore_verification_receipt`, and BRS-021 rebuild/retained-operation proof. Narrow requested coverage cannot waive BRS-024 through BRS-029's coherent original-custody, lifetime and disclosure boundaries, nor start BRS-022 separately authorized completion. Requested coverage, verified bytes and required native closure remain distinct facts.

This is a versioned branch of BackupVerificationReceipt, not a completed live RestoreReceipt. No fifth RestoreRun mode is added; the existing four modes and their mutation/activation semantics remain exact. Existing RestoreRun or RestorePreview records are consumed only when genuinely produced under their own contracts, never fabricated merely to satisfy a drill result shape.

#### Compare operands and result

For `cmd.backup.file.compare`, BackupCoordinator resolves the exact immutable snapshot/capture/path source above. The actual File owner resolves a selected file or editor-buffer identity/revision and authorized content; the Source Control/native owner resolves a selected repository target through its `repository_context` and native `git_revision` or `jujutsu_revision` contract when applicable. These are distinct target branches: an ordinary File target does not require fabricated SCM identity. Backup's `target_revision` remains opaque and is validated by the selected target owner, not reinterpreted as a universal Git revision grammar. Unsupported or stale target kinds fail explicitly rather than falling back to current focus or checkout.

A versioned BackupBrowseOperation and its result bind the original operation, both actual resolved operand identities/content revisions, owner evidence, original topology, permission/FileSafe context and return route/focus. The bounded result identifies comparison evidence or the real failure; matching target strings alone cannot substitute for actual authorized operand content. Neither compare nor replay performs checkout, restore, activation or other Project mutation. Replaying an old comparison under current disclosure permission may describe that original comparison only; it cannot relabel old bytes or revisions as a new current comparison.

#### Companion and enablement boundary

The four actions use `backup_action_request_v2` and `backup_action_result_v2` in the aggregate schema. `backup_current_command_request` and `backup_current_command_result` admit those four successor shapes, the exact-two bounded discovery/browse successor in Plans/backup_bounded_read_contracts.schema.json, the two destination lifecycle successors, selected snapshot deletion, portable encrypted export, and the unchanged other 31 v1 command shapes; the aggregate root still decodes historical v1 records. This is current shape admission, not handler enablement. `validate_action_response` requires independent original-operation and actual domain-result resolution, the full corresponding owner validator with genuine source/proof dependencies, authentic response admission and a fresh final disclosure check. The public result retains the invoking command instance separately from the original operation; a disclosure retry cannot change original selection/idempotency or effect evidence. Destination partial effects map to a partial response; verification passes map to completed and cancellations to cancelled; a drill maps its entire operation status, never verification status alone, with recovery-required cleanup mapping to partial. Compare unavailable source is a failed domain outcome, not a fabricated completed comparison. Disabled/rejected/unavailable transport cannot claim a retained terminal result or completed replay. All transport remains nonpersisted.

`Plans/backup_snapshot_result_contracts.schema.json` owns the internal nonpersisted `snapshot_resolution.v1` output and the selected-set `backup_verification_receipt.v2` successor. One authentic original BackupRun or BackupReceipt suffices for its discriminated origin; if both are retrieved their shared identities and selected attempt must agree. Disposed originals remain unavailable, not reconstructed. Actual adapter/source resolution authenticates opaque commit/snapshot associations and manifest bytes; no new commit-body format, suffix grammar or manifest self-hash preimage is invented. The native resolution callback and final disclosure check are required independently of static record joins. A committed selected copy within a partial multi-destination run remains resolvable without claiming complete source coverage or successful verification.

`Plans/backup_compare_result_contracts.schema.json` owns nonpersisted `source_read_result`, File-owned F-085 `file_compare_read_result` and native Source Control-owned `scm_compare_read_result`. SCM output preserves exact `repository_context`/native revision plus selected file and independently pinned content version; repository HEAD/index is not content custody. Its existing writer-lease reference is context, not an instruction to acquire write authority. Source Control uses its existing authorized inspection route; `source_control_permission_decision` applies only to a genuine separately scoped SCM command, never by relabeling `cmd.backup.file.compare`. The `backup_browse_operation_v3` successor retains redacted original read/result references and truthful read effects, not nested content or repository display paths. Every source keeps its independent lifetime. Native producer/resolver, content custody and fenced authorization remain NOT_RUN.

`Plans/backup_drill_result_contracts.schema.json` owns the nonpersisted RestoreCoordinator target-admission output and the `backup_verification_receipt.drill.v2` branch of the existing BackupVerificationReceipt family. Verification status, whole-operation status, actual effects and cleanup are separate; passed verification with unresolved cleanup cannot become a completed operation. Its JJI-008 native verification successor has disjoint genuine live-restore and isolated-drill contexts, preserving the predecessor native field and conditional proof requirements plus finite pointer-chain/unchanged-operation-head checks. An isolated context binds the actual original drill, target admission and snapshot; it does not fabricate live RestoreRun/RestorePreview references, add a fifth mode or waive BRS-021 through BRS-029. Exact requested, attempted and achieved coverage must agree with actual closure evidence. Native authority, bytes, effects, target fencing and cleanup still require the real owners; static callbacks and schema-valid records are not that proof.

These are owner requirements for the successor source/result schemas, joined-record checks and negative fixtures. Current materialization must cover original-operation mismatch, swapped repository/snapshot/manifest, missing selected outcomes, weaker achieved scope, stale destination proof, live/stale drill targets, missing native closure, interrupted cleanup, wrong File/SCM target, and replay after source loss. Static fixtures demonstrate those predicates over supplied records only, not authentic native issuance, real bytes, isolation, concurrency, crash/restart or storage execution; all such proof remains NOT_RUN.

The current admission union must route exactly these four operand-bearing requests to their complete successor contracts while preserving historical v1 read compatibility and the other 37 current commands. Decoder membership alone is not that union. Until exact companions, version dispositions, central request/result bindings and actual owner/storage admission exist, the affected handlers remain unavailable. No new command ID, sole handler, EventRecord, readiness unlock, WorkNode, NodeSeed or governance binding is created here.

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-030, ContractName:Plans/Backup_Restore_System.md#BRS-008, ContractName:Plans/storage-plan.md#SP-251, ContractName:Plans/Source_Control_System.md#SCS-014, ContractName:Plans/Jujutsu_Integration.md#JJI-008
