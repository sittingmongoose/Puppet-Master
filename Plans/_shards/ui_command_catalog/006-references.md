# Shard 006: References

Source: `Plans/UI_Command_Catalog.md`

Source lines: L1137-L1240

Source SHA256: `96f52e2b968fe4260d733e2f59b3f7e2df24948b428bace7b628a6249a4afc75`

---

## References
- `Plans/Contracts_V0.md#7-uicommand`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/LSPSupport.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/assistant-chat-design.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.schema.json`
- `Plans/Wiring_Matrix.md`

Canonical recovery commands use one shared namespace: `cmd.runtime.*`. Legacy recovery command namespaces are deprecated aliases only.

| `allowed_action_id` | canonical command id | minimum args |
| --- | --- | --- |
| `approve` | `cmd.runtime.approve` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `decline` | `cmd.runtime.decline` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `retry_now` | `cmd.runtime.retry_now` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id, repo_id?, worktree_id?, baseline_target?, safe_point_id?, historical_commit_oid?, expected_head_oid?, expected_state_sha256?, dirty_state_confirmed?, idempotency_key }` |
| `resume_after_prerequisite` | `cmd.runtime.resume_after_prerequisite` | `{ run_id, node_id, blocked_sequence, attempt_id? }` |
| `restore_safe_point_then_retry` | `cmd.runtime.restore_safe_point_then_retry` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: "safe_point", idempotency_key }` |
| `start_fresh_attempt` | `cmd.runtime.start_fresh_attempt` | `{ project_id, run_id, node_id, blocked_sequence, attempt_id?, repo_id?, worktree_id?, baseline_target?, safe_point_id?, historical_commit_oid?, expected_head_oid?, expected_state_sha256?, dirty_state_confirmed?, idempotency_key }` |
| `replan` | `cmd.runtime.replan` | `{ run_id, node_id, attempt_id? }` |
| `skip_node` | `cmd.runtime.skip_node` | `{ run_id, node_id, attempt_id? }` |
| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |
| `open_details` | `cmd.runtime.open_attempt_details` | `{ run_id, node_id, attempt_id? }` |

SCM-targeted retry and `/fresh-attempt` commands support the same worktree reuse policy as restore. `baseline_target` is closed to `safe_point | historical_commit | worktree_head`; the former stale candidate wording is superseded. Conditional payload and effect are exact:

| `baseline_target` | Conditionally required immutable inputs | Effect and successful postcondition |
|---|---|---|
| `safe_point` | `safe_point_id`, `repo_id`, `worktree_id` | FileSafe exact-replaces the complete named-worktree manifest. Only `restored_clean` or zero-mutation `restore_skipped` with target equality may produce the durable baseline receipt used for successor-attempt admission. |
| `historical_commit` | full immutable `historical_commit_oid`, `repo_id`, source `worktree_id` | Preserve the source byte-for-byte and create a distinct isolated clean worktree at that exact commit OID; the durable result carries the new `worktree_id`. No abbreviated, branch, tag, remote, reflog, symbolic, or moving ref is accepted. |
| `worktree_head` | `repo_id`, `worktree_id`, full `expected_head_oid`, `expected_state_sha256`, and `dirty_state_confirmed = true` when dirty | Perform no checkout, reset, stash, clean, branch move, index rewrite, or file mutation. Bind only when the recomputed OID and FileSafe state digest still match exactly. |

`cmd.runtime.restore_safe_point_then_retry` admits only `baseline_target = safe_point`. When `requires_safe_point_restore = true`, it is the only legal rerun command. `cmd.runtime.retry_now` and `cmd.runtime.start_fresh_attempt` accept a target only when the blocked/retry owner admits that verb and every field in the matching row is present. Unknown values, missing conditional fields, stale `blocked_sequence`, repo/worktree mismatch, moving or abbreviated refs, missing/non-commit OIDs, and digest drift refuse without target substitution, successor attempt, cleanup, or automatic replay.

ContractRef: ContractName:Plans/Executor_Protocol.md#approved-baseline-target-retry-and-restore-lifecycle, ContractName:Plans/WorktreeGitImprovement.md#approved-exact-baseline-target-SCM-contract, ContractName:Plans/FileSafe.md#11.1.2b, ContractName:Plans/Contracts_V0.md#safe_point.restored

### Navigation commands
- `cmd.runtime.open_queue_analysis` -> `{ run_id, scheduler_pass_id }`
- `cmd.runtime.open_remediation_lineage` -> `{ run_id, remediation_root_id }`
- `cmd.runtime.open_safe_point_history` -> `{ run_id, safe_point_id? }`
- These runtime navigation commands are route identity examples owned by the catalog and the shared route contract; `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` must not be treated as local graph shortcuts whose route identities are implied but unregistered.

### Pre-attempt blocked rule
When a blocked episode exists before any attempt is created, the recovery target is `blocked_sequence` and MUST NOT fabricate an `attempt_id`.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields)

### Recovery command definitions

Recovery verb semantics are canonical command copy:
- `Retry` repeats the already resolved operation target and parameters under the current validation rules.
- `Resume` continues an existing blocked, paused, or waiting episode after its prerequisite, approval, or recovery condition is satisfied.
- `Recover` invokes a canonical remediation flow advertised by `allowed_action_ids[]`; it does not imply a full rerun.
- `Restore` applies an explicit restore point or preserved state and must disclose the target state before mutation.

Surfaces may add context qualifiers, but they must not use these verbs interchangeably across worktrees, GitHub Actions, Docker publish, Kubernetes, `/Unraid`, or Orchestrator recovery flows.


All blocked-state recovery buttons and menu entries in GUI, chat, graph, and orchestrator surfaces MUST map from `allowed_action_ids[]` to one of the canonical runtime commands above.

No surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics.

ContractRef: ContractName:Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor, ContractName:Plans/Executor_Protocol.md#Wake reasons and coalescing, ContractName:Plans/Contracts_V0.md#`scheduler.pass` (minimum addendum fields), ContractName:Plans/Wiring_Matrix.md#UI command handler rule

Required command metadata:
- `command_kind`
- `normalization.kind`
- `normalizes_to_contract`
- `alias_of_command_id`
- `approval_scope_key`
- `allowed_action_ids[]`
- `route_target`
- `open_subject?`
- `ref_family?`

Canonical terms and values:
- command_kind
- normalization
- approval_scope_key
- route_target
- ref_family

Labels:
- Approve
- Decline
- Resume after prerequisite
- Blocked
- Retry
- Review
- Resolve

Behavioral rules:
- blocked-state recovery buttons and menu entries map from `allowed_action_ids[]` to canonical `cmd.runtime.*` commands
- no surface may introduce a thread-local, graph-local, or provider-local recovery command family for the same action semantics
- recovery commands must bind to blocked-episode identity rather than request-level surrogates
- normalization metadata must survive for wrappers and deprecated aliases
- selector precedence and scoped resolver behavior follow the canonical route payload rules above
- timestamp/run/thread fallback is compatibility-only when stronger route identity is unavailable

Permission carry-through:
- ordered `allowed_action_ids[]`
