## Runtime Enum and Counter Alignment Addendum

### Attempt terminal state enum

The orchestrator MUST classify completed or interrupted attempts using the canonical `attempt_terminal_state` enum: `completed_success`, `completed_failed`, `interrupted_by_restart`, `stale_historical`. These values are defined in Plans/Contracts_V0.md and Plans/Executor_Protocol.md.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### Restore outcome enum

When the orchestrator triggers a safe-point restore, the `safe_point.restored` event MUST include a `restore_outcome` field with one of: `restored_clean`, `restored_with_conflicts`, `restore_failed`, `restore_skipped`.

ContractRef: EventType:safe_point.restored, ContractName:Plans/Contracts_V0.md

### Counter relationship

The orchestrator's attempt counting MUST satisfy: `attempt_count = automatic_retry_count + prerequisite_resume_count + manual_resume_count + remediation_retry_count + 1 (initial attempt)`. Each sub-counter increments at attempt start.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### Event ordering

The orchestrator MUST emit all events for a given `node_id` in sequential order. Cross-node events have no guaranteed relative order. Consumers MUST be idempotent.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
