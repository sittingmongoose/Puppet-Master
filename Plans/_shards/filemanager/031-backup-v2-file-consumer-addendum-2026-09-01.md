# Shard 031: Backup v2 File consumer addendum - 2026-09-01

Source: `Plans/FileManager.md`

Source lines: L4974-L5018

Source SHA256: `97e57f4d228363a02b686b62bbf28caa177fb5bde9f17e0898a4fabec6fb96d6`

---

## Backup v2 File consumer addendum - 2026-09-01

### F-081 - Immutable Backup Snapshot Browse And Delivery Consumer

```yaml
plan_unit_id: F-081
unit_type: integration_contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  File Manager consumes Backup-owned immutable snapshot browse, initiating-Client download,
  explicitly authorized Host extraction, snapshot-to-current-file compare, disclosed portable
  export, and consented archive retrieval. Every route preserves repository, snapshot, capture
  set, Project/path/current-file, Client/Host, currentness, return, and focus identity; no Files
  handler, latest-by-implication, RestoreRun mode, Project activation, or content execution is
  created.
gui_related: true
gui_classification_reason: Snapshot tree, download/extract/compare/export/retrieve choices, FileSafe decisions, progress, disabled reasons, and exact reverse focus are visible Files surfaces.
depends_on: [F-055, F-058, F-059, BRS-014, BRS-016]
unblocks: []
acceptance_criteria:
  - Snapshot browse remains read-only and pinned to repository_id, immutable snapshot_id, capture_set_id, exact selected paths, currentness, return route, and focus.
  - cmd.backup.file.download returns only to the initiating Client and never aliases cmd.file.save_local_copy or redirects implicitly to a Host.
  - cmd.backup.extract requires an explicit authorized Host/path plus FileSafe and fails closed for traversal, collision, stale-target, partial-output, cancellation, and rollback ambiguity.
  - cmd.backup.file.compare binds immutable snapshot/path identity and exact current Project/file/version currentness; ambiguity or staleness requires a new choice and never implies latest.
  - cmd.backup.export discloses artifact destination, protection, coverage, closure, and non-restorable limits and cannot activate or execute content.
  - cmd.backup.archive.retrieve requires capability/wait/cost disclosure and human consent before billable external effect, with ObservableWork or indeterminate-outcome recovery.
  - Files owns no private Backup handler or EventRecord; expected_event_types stays empty and static contract evidence remains handler_unavailable without native proof.
validation_surfaces: [Plans/Backup_Restore_System.md, Plans/backup_restore_system_contracts.schema.json, future Files snapshot topology FileSafe currentness reverse-route archive-consent and event-silence tests]
risk_class: backup_snapshot_wrong_target_or_files_owner_leak
reasoning_tier: high
context_scope: file_manager_backup_snapshot_consumer
implementation_surfaces: [Plans/FileManager.md, future File Manager snapshot browser and compare surfaces, future Backup Restore native owner]
node_compile_hint: {mode: filemanager_backup_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:REST-002-REST-005
  - source_ref:packet:2026-09-01:REST-009
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.3
negative_constraints:
  - Do not create FileManager-owned snapshot, fetch, download, extract, compare, export, archive, or restore handlers.
  - Do not infer latest snapshot, current file, Host, Project, path, or successful delivery.
  - Do not activate a Project, execute browsed/exported content, or model delivery as RestoreRun.
  - Do not expose raw Recovery Key/Kit material or foreign absolute paths in ordinary evidence.
owner_hints: [Plans/FileManager.md, Plans/Backup_Restore_System.md, Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Source_Control_System.md]
```
