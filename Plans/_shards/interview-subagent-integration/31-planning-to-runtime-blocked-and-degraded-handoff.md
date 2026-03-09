## Planning-to-Runtime Blocked and Degraded Handoff

When interview or planning validation escalates beyond ordinary clarification:
- the wizard may transition from `attention_required` to canonical `blocked`
- the transition carries `wizard_step`, `blocked_reason_code`, `clarification_round_count`, `report_ref`, and `replan_generation?`
- degraded draft decomposition remains a pre-lock planning state and retains lineage into later runtime graph lock artifacts
- downstream runtime consumers MUST NOT collapse wizard blocked state back into generic `attention_required`

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
