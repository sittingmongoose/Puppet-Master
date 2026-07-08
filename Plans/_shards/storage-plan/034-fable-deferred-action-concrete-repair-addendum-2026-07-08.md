# Shard 034: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/storage-plan.md`

Source lines: L16591-L16630

Source SHA256: `54bb7fb3dd28d8a3e6ae11d76d14b8b29bb1501dbc5b093655910cf29f413cf9`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical storage spec text for deferred non-runtime FABLE rows. It does not certify runtime lifecycle behavior, does not create WorkNodes, NodeSeeds, queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and does not mark `buildability_gate_passed` true.

### GUI Startup Restore Keys

Repairs row `sfk-047b362fce3b487a9bce5d6b`.

- Canonical startup restore keys are `hotreload_state.v1:{project_id}` and `onboarding_state.v1:{project_id}`.
- Compatibility aliases `hotreload_state:v1:{project_id}` and `onboarding:v1` may be read only during migration and must be rewritten to the canonical dotted-version keys on the next successful settings save.
- `hotreload_state.v1` fields are `project_id`, `workspace_tab_id?`, `last_successful_reload_at_utc?`, `reload_generation`, `watched_root_refs[]`, `last_error_code?`, and `schema_version`.
- `onboarding_state.v1` fields are `project_id`, `onboarding_version`, `completed_step_ids[]`, `dismissed_prompt_ids[]`, `provider_setup_state`, `first_run_completed_at_utc?`, and `schema_version`.
- These keys are GUI state and onboarding state only; they cannot carry runtime liveness, certification, or PNC-019 evidence.

### Terminal Storage Family Reconciliation

Repairs row `sfk-6e2bf4e4dd077d9ae2743668`.

- The terminal key families listed as required for promoted terminal behavior are required product contracts, but remain `deferred_not_build_blocking` for implementation-readiness until their storage-value registry rows are promoted to materialized schemas.
- Minimum canonical family names are `terminal_workspace_state.v1`, `terminal_section_record.v1`, `terminal_tab_record.v1`, `terminal_pane_record.v1`, `terminal_leaf_pane_record.v1`, `terminal_workgroup_record.v1`, `editor_terminal_panel_state.v1`, `terminal_session_record.v1`, and `terminal_command_block.v1`.
- A buildability claim may depend on these families only after each row has a registry `status = materialized`, a schema ref, a retention class, and positive/negative validation coverage.

### Retired Unversioned Baseline Keys

Repairs row `sfk-a01710fdfad63d1badf4fbaf`.

- Unversioned baseline keys such as `run:<run_id>`, `node:<node_id>`, and `attempt:<attempt_id>` are retired compatibility aliases.
- New canonical storage keys must use `{family}.v1:{scope}:{id}` or a more specific versioned key named by the owning value family.
- Reads of an unversioned alias must produce `alias_read = true`, `canonical_key`, and `migration_required = true`; writes to unversioned aliases are forbidden outside a migration test fixture.

### Permission Snapshot Storage Retention

Repairs row `sfk-64e6f7bf2d7cc266e318d39b`.

- `permission_snapshot_record.v1:{project_id}:{snapshot_id}` stores immutable permission evidence for attempts and blocked episodes.
- Storage owns retention only; nested permission fields and enums remain owned by `Plans/Permissions_System.md`.
- Retention rule: keep all snapshots referenced by live `attempt_record`, `blocked_projection`, HITL receipts, or audit receipts indefinitely; keep unreferenced snapshots for at least 90 days; after 90 days they may be compacted only into a redacted hash summary preserving `snapshot_id`, `created_at_utc`, `policy_hash`, and `decision_summary`.
- A snapshot referenced by `attempt_record.permission_snapshot_id` must never be hard-deleted while that attempt record remains queryable.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
