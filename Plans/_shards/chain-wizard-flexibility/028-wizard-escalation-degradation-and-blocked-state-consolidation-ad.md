# Shard 028: Wizard Escalation Degradation and Blocked-State Consolidation Addendum (2026-03-09)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2204-L2240

Source SHA256: `15df9ed3508b90683979c3b365810cd89cba46ef428dc390c6a6e969e33f5058`

---

## Wizard Escalation Degradation and Blocked-State Consolidation Addendum (2026-03-09)

This section defines canonical Wizard Blocked Lifecycle.

<a id="cwf-escalation-canonical-wizard-status"></a>
### Canonical `wizard_status`
See canonical `wizard_status` definition in §2.1.

<a id="cwf-escalation-canonical-blocked-state"></a>
### Canonical blocked state
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
A wizard blocked record MUST persist:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `clarification_round_count`
- `report_ref`
- `resume_url?`
- `decomposition_degraded`
- `degradation_reason?`
- `replan_generation?`
- `attempted_recovery_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

<a id="cwf-escalation-blocked-clear-rule"></a>
### Blocked clear rule
A wizard leaves `blocked` only when:
- materially new user input creates a new issue set
- the external prerequisite named by `blocked_reason_code` is actually resolved
- a new `replan_generation` begins for the wizard context
- the wizard is cancelled

Reopening the same blocked wizard without one of those changes does not clear blocked state and does not reset `clarification_round_count`.
