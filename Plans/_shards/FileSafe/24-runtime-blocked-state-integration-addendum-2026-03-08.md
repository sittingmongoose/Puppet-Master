## Runtime Blocked-State Integration Addendum (2026-03-08)

### 1. FileSafe outcomes are first-class blocked outcomes

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0228
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - no-backup-account outcomes
  - `attempt_id` is first-class
  - attempt_id
  - `scheduler_lane` is first-class
  - scheduler_lane
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

FileSafe decisions must integrate with the shared runtime blocked taxonomy.

Required rule:
- a FileSafe block becomes `blocked_reason_code = filesafe_blocked`
- it is not an execution failure and is not auto-retryable

### 2. Recovery options

When FileSafe allows user recovery, runtime/UI surfaces must expose exact options.

Allowed examples:
- `Approve once`
- `Approve & add to list`
- `Cancel`

If recovery is not allowed for the specific guard, the runtime must say so explicitly.

### 3. Event and analytics requirements

FileSafe event payloads must remain rich enough for both analytics and runtime recovery surfaces.

Minimum fields:
- `guard_type`
- `pattern_id` or pattern name
- `timestamp`
- `command_or_path_summary`
- `recovery_allowed`
- `allowed_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md
### 4. Safe-point interaction

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0239
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - safe-point restore must target the exact worktree/baseline
  - no required safe-point restore targeting that worktree/baseline
  - safe-point manifests / restore logs by `safe_point_id`
  - safe_point_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

A FileSafe block that occurs before execution does not consume a mutation safe point and does not require rollback.

### 5. Acceptance criteria

- FileSafe blocks appear as blocked outcomes with explicit reason codes.
- FileSafe blocks are not auto-retried.
- Recovery-capable FileSafe blocks present exact allowed actions.
- FileSafe analytics data remains usable after runtime integration.
