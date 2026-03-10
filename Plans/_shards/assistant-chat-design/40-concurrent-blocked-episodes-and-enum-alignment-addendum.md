## Concurrent Blocked Episodes and Enum Alignment Addendum

### Concurrent blocked episode rendering

When multiple nodes are simultaneously blocked, each with its own `blocked_notice` message:

1. The thread message list MUST render each `blocked_notice` as a separate, distinct system message.
2. Each `blocked_notice` message shows its own `blocked_reason_code`, explanation, and action buttons mapped from `allowed_action_ids[]`.
3. blocked_notice messages MUST NOT be collapsed, merged, or deduplicated -- even if they share the same `blocked_reason_code`.
4. The thread selector sidebar badge for a thread with blocked nodes shows the total blocked count (e.g., "3 blocked").
5. Resolving one blocked episode (via any `allowed_action_ids[]` action) updates only that specific `blocked_notice` message; other blocked messages remain active.

### Enum cross-references

- `blocked_reason_code` values include `validation_blocked` and `remediation_ceiling_exceeded` per Plans/Contracts_V0.md.
- `attempt_terminal_state` values (`completed_success`, `completed_failed`, `interrupted_by_restart`, `stale_historical`) per Plans/Contracts_V0.md.
- `restore_outcome` values (`restored_clean`, `restored_with_conflicts`, `restore_failed`, `restore_skipped`) per Plans/Contracts_V0.md.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md


**Artifacts panel and cost_usage:** Per-thread usage (context circle, thread Usage tab) aligns with the cost_usage runtime artifact. The Artifacts panel offers "Show in Ledger" and "Show in Usage" for cost_usage items; see Plans/usage-feature.md and Plans/Runtime_Artifacts_Panel.md.
