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

