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
gui_related: true
gui_classification_reason: Destination, policy, schedule/retention, selected data, storage use, verification, protection, and history are visible manager behavior.
depends_on: [BRS-002, BRS-003]
unblocks: [BRS-005, BRS-006, BRS-007, BRS-008]
acceptance_criteria:
  - Destination test verifies declared capabilities and write/read/delete or protection behavior without destructive guessing.
  - Each Project repository and the separate Catalog repository can be unlocked, verified, quarantined, retained, pruned, and restored without coupling an unrelated Project.
  - A multi-destination run preserves each attempt's immutable snapshot ID, upload state, failure, and evidence independently.
  - Manifest covers every included object with relative path, byte size, digest, family, and consistency boundary and names exclusions.
  - Retention cannot delete protected, held, active-parent, last-known-good, or recovery-required generations.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future offline partial-write protection and retention tests]
risk_class: destination_partial_write_or_manifest_omission
reasoning_tier: high
context_scope: backup_destination_policy_manifest
implementation_surfaces: [Plans/backup_restore_system_contracts.schema.json, future destination adapter and retention service]
node_compile_hint: {mode: backup_destination_manifest_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:BKP-003
  - source_ref:packet:2026-09-01:BKP-009
  - source_ref:packet:2026-09-01:CLOUD-001-CLOUD-008
  - source_ref:normalized-register:server-first-2026-08-31:B09-B11
  - source_ref:packet:backbone_v5/09_UPDATES_BACKUP_RESTORE_CONTRACT.md
preserved_exact_tokens: [BackupDestination, BackupPolicy, BackupManifest, BackupRetentionDecision, incremental, parent]
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
negative_constraints: [Do not call an unverified backup verified., Do not activate destructive work without the required recovery point., Do not infer success from missing journal or destination evidence., Do not inherit verification or drill evidence across snapshots., Do not collapse per-destination failure into aggregate success.]
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
  checks compatibility, produces RestorePreviewReceipt, obtains approval, creates and verifies a pre-restore recovery
  point, stages into quarantine, verifies staged hashes and schema/storage compatibility, resolves identity, credentials,
  and source locations, quiesces the target, atomically activates, rebuilds derived indexes/caches/projections, performs
  post-restore verification, invalidates stale Client caches, and exposes rollback. Restore as New creates a new
  project_id and rewrites identity-bearing refs; selective restore accepts only independently valid families;
  Read-only browse/retrieve never activates content. Restart uses the phase journal to resume, rollback, quarantine, or recovery_required.
gui_related: true
gui_classification_reason: Restore preview, mode selection, conflicts, approval, quarantine, progress, readiness, rollback, and verify-only state are visible workflows.
depends_on: [BRS-003, BRS-004, BRS-005]
unblocks: [BRS-007, BRS-008, BRS-009]
acceptance_criteria:
  - Browse/retrieve operations perform no activation and emit bounded read/delivery evidence independently of RestoreRun.
  - in_place and server_full require a verified pre-restore recovery point and atomic activation/rollback boundary.
  - as_new rewrites every identity-bearing reference and cannot collide with an existing project_id.
  - Derived state is rebuilt from canonical restored bytes and is never trusted as portable authority.
validation_surfaces: [Plans/backup_restore_system_contract_fixtures.json, future restore-mode and per-phase crash tests]
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
negative_constraints: [Do not model browse or retrieve as a mutating restore mode., Do not restore in place without a verified recovery point., Do not activate unverified staged data., Do not trust portable derived indexes., Do not restore tsnet identity by default.]
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
gui_related: true
gui_classification_reason: This unit defines all visible backup/restore actions, compact cards, advanced manager fields, progress, receipts, and disabled states.
depends_on: [BRS-004, BRS-005, BRS-006, BRS-007]
unblocks: [SSYS-012]
acceptance_criteria:
  - All 41 exact command IDs validate through one owner-DRY request/result/error/availability schema and action-specific negative fixtures.
  - Every listed command has one central command/UI row, sole handler, permission path, receipt/event disposition, and production wiring row before enablement.
  - Compact UI preserves the four-product distinction and does not imply secrets are included by default.
  - Native/web/palette/NL/API/automation routes share exact identity, handler, receipt, and currentness behavior.
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
gui_related: true
gui_classification_reason: Snapshot tree, download/extract/compare/export, cold-retrieval consent/progress, FileSafe decisions, and exact back-navigation are user-visible.
depends_on: [BRS-006, BRS-012, BRS-013]
unblocks: [BRS-016]
acceptance_criteria:
  - Browse/retrieve actions remain distinct from the four mutating RestoreRun modes and cannot activate or execute content.
  - Archive retrieval reports waiting, external prerequisite, and cost-consent state without hard-coded prices.
  - Reverse navigation returns to the exact immutable snapshot and original Project/repository/filter/focus, never silently latest.
  - Client download and Host extract preserve topology and FileSafe containment; raw keys and foreign absolute paths never enter ordinary evidence.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future traversal symlink archive cost Client Host and reverse-route tests]
risk_class: browse_delivery_mutation_or_wrong_target
reasoning_tier: high
context_scope: snapshot_browse_and_delivery
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/FileManager.md, Plans/Project_System.md, Plans/Source_Control_System.md, Plans/Jujutsu_Integration.md]
node_compile_hint: {mode: backup_browse_delivery_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-002-REST-005
  - source_ref:packet:2026-09-01:REST-009
  - source_ref:packet:2026-09-01:BGUI-003
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
gui_related: true
gui_classification_reason: Automatic Backups, schedule/timezone, 7/4/6 recommendation, missed state, holds, prune preview, verification badges, and drill progress are visible.
depends_on: [BRS-005, BRS-013, SIR-012]
unblocks: [BRS-016]
acceptance_criteria:
  - New-policy seed is exactly daily 7/4/6; existing policies are unchanged unless explicitly edited.
  - DST repeat/skip, sleeping/offline Host, duplicated signal, restart, and multiple Clients produce at most one occurrence ID and truthful missed/catch-up state.
  - Holds, active parents, last-known-good, recovery-required points, concurrent upload/restore, and unrelated Project repositories survive preview/prune rules.
  - Prune requires exact preview hash/currentness, policy/repository revisions, confirmation, and unexpired maintenance lease.
validation_surfaces: [Plans/backup_restore_system_contracts.schema.json, Plans/backup_restore_system_contract_fixtures.json, future DST catch-up hold lease prune corruption and isolated-drill tests]
risk_class: duplicate_schedule_or_destructive_prune
reasoning_tier: high
context_scope: server_owned_backup_operations
implementation_surfaces: [Plans/Backup_Restore_System.md, Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: backup_operations_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTO-001-AUTO-006
preserved_exact_tokens: [seven daily, four weekly, six monthly, timezone-aware, occurrence ID, coalesced catch-up, last known good]
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

Destructive requests bind target identities/generations, manifest and preview receipt, expected policy/revision, idempotency/correlation, permission/FileSafe/confirmation, and required `RecoveryPointReceipt`. Secret selection and recovery credentials use protected input channels and never ordinary command payload/history.

`Plans/backup_restore_system_contracts.schema.json` now defines one generic discriminated `BackupRestoreCommandRequest`, `BackupRestoreCommandResult`, `BackupRestoreCommandError`, and `BackupRestoreCommandAvailability` family over exactly these 41 IDs. The conditional request branches require currentness for every action; repository/destination/policy revisions; exact snapshot/capture-set/RecoverySet/run/preview identities; target Server/Project/Host/Environment/Client and family fields; protected-channel refs for unlock/key actions; retention candidate hash/lease/confirmation for prune; archive consent; and recovery-point, approval, confirmation, and preview-currentness receipts for mutating restores. Full Server secret portability remains explicit opt-in and reference-only through encrypted `PortableSecretEnvelope`; repository recovery uses redacted `RecoverySetPublicRecord` plus protected key-delivery refs. Raw keys, passwords, tokens, cookies, auth URLs/codes, callback/session material, protected-browser content, and foreign absolute paths are not ordinary command fields.

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
- Raw OS keychain/Credential Manager bytes, default CLI-profile payloads, cookies, machine-bound identities, live runtime, device geometry, and rebuildable indexes remain excluded.
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
| `cmd.backup.browse` | `handlers::backup_restore::backup_browse` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.cancel` | `handlers::backup_restore::backup_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.delete` | `handlers::backup_restore::backup_delete` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.add` | `handlers::backup_restore::backup_destination_add` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.remove` | `handlers::backup_restore::backup_destination_remove` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.test` | `handlers::backup_restore::backup_destination_test` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.update` | `handlers::backup_restore::backup_destination_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.open_details` | `handlers::backup_restore::backup_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.open_history` | `handlers::backup_restore::backup_open_history` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.policy.update` | `handlers::backup_restore::backup_policy_update` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.project.create` | `handlers::backup_restore::backup_project_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.protect` | `handlers::backup_restore::backup_protect` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.retry` | `handlers::backup_restore::backup_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.server.create` | `handlers::backup_restore::backup_server_create` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.test_restore` | `handlers::backup_restore::backup_test_restore` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.verify` | `handlers::backup_restore::backup_verify` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.cancel` | `handlers::backup_restore::restore_cancel` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.open_details` | `handlers::backup_restore::restore_open_details` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.project_as_new` | `handlers::backup_restore::restore_project_as_new` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.project_in_place` | `handlers::backup_restore::restore_project_in_place` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.retry` | `handlers::backup_restore::restore_retry` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.rollback` | `handlers::backup_restore::restore_rollback` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.selective` | `handlers::backup_restore::restore_selective` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.restore.server_full` | `handlers::backup_restore::restore_server_full` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_error` / `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request/properties/permission_snapshot_ref` |
| `cmd.backup.destination.discover` | `handlers::backup_restore::backup_destination_discover` | `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_request` -> `Plans/backup_restore_system_contracts.schema.json#/$defs/backup_restore_command_result` | same owner error / permission; bounded read, exact family/profile/return context |
| `cmd.backup.retention.preview` | `handlers::backup_restore::backup_retention_preview` | same owner request -> result | same owner error / permission; exact repository/policy revision and candidate hash |
| `cmd.backup.prune` | `handlers::backup_restore::backup_prune` | same owner request -> result | same owner error / permission; exact preview hash, confirmation, maintenance lease |
| `cmd.backup.unlock` | `handlers::backup_restore::backup_unlock` | same owner request -> result | same owner error / human step-up; protected submission ref only |
| `cmd.backup.file.download` | `handlers::backup_restore::backup_file_download` | same owner request -> result | same owner error / FileSafe; exact snapshot/path/initiating Client |
| `cmd.backup.extract` | `handlers::backup_restore::backup_extract` | same owner request -> result | same owner error / FileSafe; exact snapshot/path/authorized Host target |
| `cmd.backup.file.compare` | `handlers::backup_restore::backup_file_compare` | same owner request -> result | same owner error / permission; immutable snapshot/current-file identities |
| `cmd.backup.export` | `handlers::backup_restore::backup_export` | same owner request -> result | same owner error / FileSafe; disclosed non-restore artifact |
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
  - Key export sessions are short-lived, audience-bound, one-use where practical, creation/redemption authorized, revocable, and no-store; later export requires step-up and protected attachment. Scheduler unlock uses protected Server/OS/admin secret attachment and projects Unlock required when unavailable.
  - Key-slot rotation adds and verifies every new engine slot before retiring an old slot; compromise uses a new encryption domain/repository or explicit copy/re-encryption and never claims to repair already exposed copies.
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
  Fresh or ordinary recovery follows one bounded order: choose/import destination or untrusted Kit, validate locator/trust, authenticate storage, select an existing repository, unlock through protected Recovery Key submission, load encrypted manifests, select an immutable snapshot, inspect exact coverage/compatibility, preview, and only then restore. SnapshotBrowser is paginated/read-only and treats text, diff, history, HTML, macros, hooks, symlinks, and artifacts as untrusted content. Restore as New, in place, selective, and Full Server modes retain dependency closure, current target revision, path/identity mapping, migrations, disk space, profile/key readiness, secret exclusion, suspended work, owner approval, verified pre-restore recovery, target leases, staged verification, FileSafe decisions, and rollback. RestoreRun persists immutable selection, phase/retry/validation/outcome receipts on the recovery coordinator and survives Client loss or Full Server replacement through an external recovery endpoint/token. RuntimeResourceGovernor, ObservableWork, durable outbox, per-repository writer/maintenance leases, phase-aware cancellation, cautious stale-lock recovery, retention holds, prune preview, separate destructive authorization, and cold-retrieval consent remain shared-owner consumers.
gui_related: true
gui_classification_reason: SnapshotBrowser, RestorePreview, DestinationCard, ScopeCoverageSummary, RecoveryKitHandoff, VerificationBadge, RetentionPreview, ObservableWorkProgress, costs, failures, and exact completion axes are visible.
depends_on: [BRS-006, BRS-014, BRS-015, BRS-017, BRS-018, SIR-032]
unblocks: []
acceptance_criteria:
  - A Kit is bounded untrusted input; a new endpoint is reviewed before credentials are sent, unreachable or apparently empty repositories are never initialized, and wrong account/key/repository, missing manifest, revoked access, corruption, and unsupported future format are distinct recoverable errors.
  - Snapshot selection binds immutable snapshot_id rather than latest; search/filter includes Project, capture date/time/timezone, host/source, verification and scope; details include PM/source/JJ coverage, unavailable sources, retention/hold, restore-test result, size, and retrieval conditions.
  - Previewed content cannot execute, escape path bounds, enter an active workspace, or reach agents without separate permission; large trees paginate and symlink/reparse/HTML/script/macro/hook hazards fail closed.
  - Restore apply requires current owner approval, pre-restore recovery or explicit emergency consent, target leases/quiescence, staged verification, and atomic activation where supported; cross-filesystem/remote activation uses a journaled recoverable boundary rather than a false atomic claim.
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
