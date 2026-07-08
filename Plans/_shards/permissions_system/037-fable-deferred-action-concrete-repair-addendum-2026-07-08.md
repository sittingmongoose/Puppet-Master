# Shard 037: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Permissions_System.md`

Source lines: L8949-L9007

Source SHA256: `9e3088ce98d3dd2e465d299adcccda114136be8a4a5159a33ebd6c2f25dca9e3`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical permission spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Durable Approval Section References

Repairs rows `sfk-344077d4e91d4dba8a844f8b`, `sfk-95212a02bf1d39bbc2883d92`, and `sfk-c2365f0841b6e3af70ad6310`.

- The `always` response contract is owned by Section 3.4 and consumed by AC-PM06. Any older `§6.2` reference to `always` is a source-lineage alias for Section 3.4.
- Durable rule creation is owned by Section 9 and command IDs `cmd.permissions.create_project_rule` and `cmd.permissions.create_global_rule`. Any older `§6.4A` reference is a source-lineage alias for Section 9 durable approvals.
- Scope specificity is owned by Section 2.4 plus the deterministic resolution algorithm in Section 8. Any older `§2.4B` reference maps to Section 2.4 scope precedence.
- New references must use these owner sections and command IDs rather than the retired aliases.

### TOML Persistence Failure And Atomicity Rules

Repairs row `sfk-fdf444265abf92192b7160bd`.

- Permission TOML writes use write-temp, fsync-temp, atomic rename, then fsync-parent-directory when the platform exposes it.
- The temp filename is `.permissions.{scope}.{nonce}.tmp` in the same directory as the target file. Cross-filesystem rename is forbidden.
- Parse failure on load quarantines the bad file as `permissions.toml.corrupt.{timestamp_utc}`, loads the last valid redb projection if available, and surfaces `permission_config_parse_failed` with `path`, `line?`, `column?`, and `recovery_action_ids[]`.
- Concurrent write conflict is detected by comparing `loaded_config_hash` to the current file hash before rename. Conflict returns `permission_config_write_conflict` and must not overwrite the newer file.
- If both file and projection are unreadable, default policy is fail-closed for mutation-capable tools and ask/deny according to the guard contract for read-only tools.

### Permissions UI Commands And Error States

Repairs rows `sfk-57ac0d8ad5d91758f6c339a1` and `sfk-6f3fd08bf73eb3f910729299`.

- Settings route: `settings.permissions`.
- Command IDs: `cmd.permissions.open`, `cmd.permissions.create_project_rule`, `cmd.permissions.create_global_rule`, `cmd.permissions.update_rule`, `cmd.permissions.reorder_rule`, `cmd.permissions.delete_rule`, `cmd.permissions.revoke`, `cmd.permissions.pick_external_directory`, and `cmd.permissions.validate_rule`.
- Directory picker dispatch name: `permissions.external_directory.pick`.
- Duplicate path error code: `external_directory_duplicate_path`.
- Invalid glob error code: `external_directory_invalid_glob`.
- Reorder validation errors are `rule_not_found`, `target_index_out_of_range`, and `scope_mismatch`.
- Save dirty state values are `clean`, `dirty`, `saving`, `saved`, `save_failed`, and `conflict_refresh_required`.

### Domain-Sensitive Permission Classes

Repairs row `sfk-613f7652b32c4e3abfe4f6e2`.

| Permission class | Applies to | Never implied by |
| --- | --- | --- |
| `domain.docker_exec` | `docker exec`, `docker attach` | generic command allow, YOLO/session mode |
| `domain.kubernetes_exec` | `kubectl exec`, `kubectl attach` | generic command allow |
| `domain.kubernetes_port_forward` | `kubectl port-forward` | network allow alone |
| `domain.git_destructive_remote` | force push, remote prune, protected branch mutation | ordinary git read/write allow |
| `domain.workflow_admin` | workflow cancel, rerun, admin mutation | hosted-provider auth alone |
| `domain.image_publish` | registry image push, repo create, template publish | local build approval |

Each domain approval records `approval_scope_key`, `permission_snapshot_id`, `target_identity`, `operation_class`, `expires_at_utc?`, and `revocation_rule_id?`.

### Permission Snapshot Reason-Code Enums

Repairs row `sfk-ea6603b7ef92e31beeee32b4`.

- `stop_reason_code` values: `user_stopped`, `policy_denied`, `budget_exhausted`, `safe_point_required`, `permission_snapshot_stale`, `indeterminate_remote_outcome`.
- `blocked_reason_code` values: `approval_required`, `policy_denied`, `preflight_failed`, `state_changed`, `domain_sensitive_action`, `secret_required`, `network_forbidden`, `external_side_effect`, `operation_in_progress`.
- `budget_kind` values: `turns`, `tokens`, `wall_time_seconds`, `parallel_agents`, `cost`.
- `attention_required_reason_code` values: `target_selection_required`, `scope_confirmation_required`, `credential_required`, `policy_owner_required`, `manual_review_required`.
- Transitions: `approval_required -> approved_once|approved_for_session|approved_always|denied`; `permission_snapshot_stale -> refresh_required`; `indeterminate_remote_outcome -> manual_review_required`; `budget_exhausted -> blocked` unless the owner policy grants a bounded extension.
