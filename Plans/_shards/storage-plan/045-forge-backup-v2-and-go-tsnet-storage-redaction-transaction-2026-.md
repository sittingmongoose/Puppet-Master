# Shard 045: Forge, Backup v2, And Go tsnet Storage/Redaction Transaction - 2026-09-01

Source: `Plans/storage-plan.md`

Source lines: L18600-L18692

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Forge, Backup v2, And Go tsnet Storage/Redaction Transaction - 2026-09-01

This transaction extends the SP-251 disposition layer and SP-253 transform registry without changing the enforced
84-row physical-family membership. The newly detailed durable contract groups remain
`physical_family_registration_pending`; the deferred grouped automation projection remains non-build-blocking and its
physical split remains pending. Registry/schema validity is static planning evidence only. It proves no redb/seglog or
external-artifact writer, migration run, backup/restore, connector, forge adapter, protected channel, native handler,
security result, provider readiness, runtime, or recovery outcome.

No row in this transaction registers an EventRecord. Owner receipts and bounded public projections remain the only
planned durable effects, and every touched or added disposition retains
`event_effect_policy=receipt_only_no_eventrecord_pending_event_authority` and `runtime_evidence=false`.

### SP-254 - Consolidated Forge/Backup/tsnet Durable-Metadata And Redaction Boundary

```yaml
plan_unit_id: SP-254
unit_type: storage_security_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  `Plans/storage_value_registry.json` registers the September 1 Forge, Backup v2, and Go tsnet contract groups as
  public durable metadata or explicit nonpersisted transport without claiming physical materialization. Backup v2
  retains destination/repository/policy/run/manifest, capture-barrier and phase-journal refs, schedule occurrence and
  outbox refs, retention/browse/health, RecoverySet public, no-store Recovery Kit delivery-session metadata, migration,
  restore, and receipt records while snapshot/repository/export bytes remain in Backup-owned external custody and raw
  Recovery Key/Kit/session payloads never persist. StorageMigrationCoordinator performs the explicit v1-to-v2
  disposition without manufacturing a key, source closure, verification, runtime, or provider readiness; Backup's
  `pm.backup_restore_system.recovery_set_public.v2` is never Storage boot recovery `recovery_set_id`. Forge retains
  provider-instance, repository-binding, independent automation-binding/shell, provider-native object, currentness,
  and receipt refs without duplicating PAT/OAuth/SSH/private-CA/credential content; canonical shell state uses
  `repository_automation.project_state.{project_id}` and reads the two GitHub predecessor keys only through an
  idempotent fail-closed migration. Remote Access retains PM-owned connector/Server identity, configuration,
  generations, version/build/protocol facts, redacted authorization-operation metadata, route/health/migration/receipt
  refs, and an opaque `secure_state_ref`; connector IPC, protected URLs, raw tsnet state, tailnet identity, and node/auth/
  pre-auth/IPC keys are nonpersisted or external to ordinary redb/seglog. The registered transforms cover public
  requests, results, errors, availability, receipts, and health/currentness projections and reject key/token/code,
  protected/browser, private path/host, unsafe SCM configuration, and capture content. All three domains remain
  receipt-only and Event Authority silent with `runtime_evidence=false`.
gui_related: false
gui_classification_reason: The unit defines storage custody, migration, redaction, and event-admission boundaries rather than visible presentation.
depends_on: [SP-251, SP-253, BRS-012, BRS-016, FGI-012, RAS-015]
unblocks: []
acceptance_criteria:
  - The storage registry remains schema-valid with exactly the existing 84 physical-family rows; new classifications use contract_family_dispositions and do not claim a materialized family.
  - Backup durable metadata binds the v2 aggregate and exact owner schema IDs, retains only public RecoverySet and no-store delivery-session metadata, keeps repository/snapshot/export bytes external, and excludes every raw key, Kit, protected attachment/submission, and session payload.
  - Backup migration maps every admissible v1 axis explicitly, quarantines ambiguity, and never equates `pm.backup_restore_system.recovery_set_public.v2` with the deterministic Storage boot `recovery_set_id` work-set identity.
  - Forge persistence retains independent repository and automation binding identities/generations plus provider-instance and provider-native object refs, never infers their equality, and never duplicates credential, authorization, SSH, private-CA, or protected-browser contents.
  - repository_automation is the canonical automation shell key; github_actions.project_state.{project_id} and gha_panel_state.v1:{project_id} are read-only copy-forward aliases, canonical data wins, nonconflicting legacy fields merge only with a verified GitHub automation binding, and ambiguity quarantines with a typed migration receipt.
  - Remote Access persists only public connector/Server identity, configuration, state enums, versions, redacted lifecycle/health and receipt facts plus opaque secure-state refs; raw connector state, host Tailscale state, tailnet identity/keys, reusable URLs/queries, cookies, protected browser content, and IPC secrets/payloads have no ordinary durable family.
  - rt.backup_manifest_metadata.v1, rt.scm_forge_metadata.v1, and rt.server_remote_metadata.v1 cover their public requests/results/errors/availability/receipts/health and quarantine prohibited key/token/code/protected/browser/private-path/private-host/unsafe-SCM-config/capture input before persistence, indexing, export, help/copy, GUI, Chat, Usage, Doctor, or evidence reuse.
  - Every touched disposition retains physical-family truth, `runtime_evidence=false`, and `receipt_only_no_eventrecord_pending_event_authority`; every transform remains `contract_only_no_runtime_evidence`.
validation_surfaces:
  - Draft 2020-12 validation of Plans/storage_value_registry.json against Plans/storage_value_registry.schema.json
  - Draft 2020-12 validation of Plans/redaction_transform_registry.json against Plans/redaction_transform_registry.schema.json
  - cross-reference/uniqueness checks for disposition IDs, transform IDs, record schema IDs, redaction refs, event-effect policy, physical status, and runtime_evidence
  - focused assertions for the 84-family denominator, Backup v2/v1 exclusion, RecoverySet identity separation, Forge automation-key aliases, and tsnet secure-state exclusions
risk_class: cross_domain_secret_leak_identity_collision_or_false_persistence_proof
reasoning_tier: high
context_scope: forge_backup_v2_tsnet_storage_and_redaction_transaction
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/redaction_transform_registry.json
node_compile_hint:
  mode: static_storage_redaction_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_backup_reconciliation.md
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md
preserved_exact_tokens:
  - pm.backup_restore_system.recovery_set_public.v2
  - recovery_set_id
  - repository_automation.project_state.{project_id}
  - github_actions.project_state.{project_id}
  - gha_panel_state.v1:{project_id}
  - secure_state_ref
  - receipt_only_no_eventrecord_pending_event_authority
  - runtime_evidence=false
negative_constraints:
  - Do not inline or duplicate any key, Recovery Kit, PAT, OAuth grant/code/token, SSH/private-CA material, connector secure state, protected browser content, or credential contents behind an opaque ref.
  - Do not persist raw host/private path or host/address data, unsafe SCM configuration/hook/environment content, screenshots, capture frames, clipboard/history, print-spool payload, browser data, or raw CLI/provider errors.
  - Do not treat a disposition, schema, receipt, migration description, transform registration, or validator pass as physical registration, executed migration, security proof, runtime evidence, provider readiness, recovery evidence, or Event Authority admission.
  - Do not add an EventRecord family or reinterpret an owner receipt/projection as an EventRecord.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Backup_Restore_System.md
  - Plans/Forge_Integrations.md
  - Plans/Remote_Access_System.md
```
