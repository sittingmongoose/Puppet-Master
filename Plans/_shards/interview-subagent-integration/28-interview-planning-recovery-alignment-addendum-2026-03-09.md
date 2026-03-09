## Interview / Planning Recovery Alignment Addendum (2026-03-09)

Interview-stage subagents participate in the same blocked, retry, and degradation contracts as runtime execution when their outputs drive draft decomposition.

### Required classification behavior
Interview/planning outputs that are malformed, inconsistent, cyclic, or incomplete MUST be classified explicitly before fallback or escalation.
- draft-stage structural invalidity may trigger deterministic flat draft fallback
- repeated unresolved invalidity after graph lock becomes `graph_integrity` or `replan_required`
- clarification needs remain `attention_required` until escalation conditions are met
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Progression_Gates.md

### Required state handoff
The interview subsystem MUST persist the active generation, degradation status, and user-visible explanation so later runtime surfaces can explain how the final graph was derived.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md
