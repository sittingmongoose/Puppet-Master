# Shard 012: Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L370-L400

Source SHA256: `13f855b3eefae978205e676db0fdd7c0e7e7fbeb239df31a5023bdb805be3c72`

---

## Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)


Receipt-like artifacts keep canonical runtime identity and bridge fields instead of inventing artifact-local lineage.

### operation_receipt_record envelope

`operation_receipt_record` is a projector and receipt-surface record derived from canonical events, not a replacement for them. Its key joins `run_id`, optional `attempt_id`, `action_family`, and `receipt_id`; the envelope remains cross-surface `/receipt` lineage for Ledger, Usage, Orchestrator, and owner panels.

Minimum identity fields are `receipt_id`, `run_id`, optional `attempt_id`, `action_family`, and `action_name`. Legacy `tier_id` may appear only as derived display/grouping compatibility metadata; it is not a receipt key, approval correlation key, or usage join. Requested and `/effective` fields include `requested_action`, `effective_action`, `requested_target`, `effective_target`, and optional `reason_code`.

SCM lineage fields include optional `repo_id`, `worktree_id`, `worktree_path`, `branch_name`, `branch_ref`, `branch_head_state`, `baseline_commit_oid`, `head_commit_oid`, `safe_point_id`, `changed_files`, `changed_paths`, `conflict_state`, `conflict_refs`, `rollback_available`, `rollback_ref`, `restore_command_or_action`, `compare_target_ref`, and `pr_ref`. GitHub Actions lineage fields include optional `workflow_id`, `workflow_name`, `workflow_path`, `workflow_run_id`, `run_attempt`, `job_id`, `job_name`, `failed_step_name`, and `event_name`. Docker lineage fields include optional `context_name`, `container_id`, `image_ref`, and `registry_host`.

### bridge-field viewer
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `workflow_run_id`

Required actions:
- `Show in Ledger`
- `Show in Usage`

Rules:
- Bridge fields remain joins rather than replacement primary keys.
- Open and focus actions route through canonical receipt and usage identity.
- Usage-linked artifacts consume frozen `effective_*` runtime snapshot fields and `source_confidence` fields. The legacy `usage-source-confidence` spelling remains preserved only as compatibility/source-lineage vocabulary; Agent-Config and Health may display live current values beside the artifact, but they must not rename or rewrite the frozen schema carried by the usage/runtime record.
