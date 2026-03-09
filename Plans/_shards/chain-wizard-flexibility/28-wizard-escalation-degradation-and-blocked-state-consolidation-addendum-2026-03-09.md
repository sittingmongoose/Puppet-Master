## Wizard Escalation Degradation and Blocked-State Consolidation Addendum (2026-03-09)

### Canonical clarification escalation
Remain in `attention_required` while the current issue set can still be resolved within the current flow.

Escalate to `blocked` when either:
- `clarification_round_count >= 3` for the active issue set and step, or
- the next required action cannot be completed inside the current flow

Use `blocked_reason_code = clarification_blocked` for blocked state caused by exhausted clarification.

### Round-count reset rules
Reset `clarification_round_count` only when:
- a materially new issue set is generated
- the wizard advances to a new step
- a new `replan_generation` begins

Reopening the same blocked wizard without a new issue set does not reset the count.

### Persisted blocked/degraded fields
Persist together:
- `blocked_reason_code`
- `attention_required_reason?`
- `clarification_round_count`
- `latest_quality_report_ref`
- `resume_url`
- `attempted_recovery_action_ids[]`
- `decomposition_degraded`
- `degradation_reason`
- active `replan_generation`

### Degraded draft visibility
If draft decomposition degrades before graph lock, the wizard MUST keep that degraded state visible until a valid non-degraded canonical graph replaces it or the wizard is cancelled.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Project_Output_Artifacts.md

