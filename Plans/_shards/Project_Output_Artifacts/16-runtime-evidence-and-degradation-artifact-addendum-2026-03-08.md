## Runtime Evidence and Degradation Artifact Addendum (2026-03-08)

### 1. Optional projection artifacts for runtime analysis

Canonical truth remains in seglog + projections, but the system may materialize optional human-readable exports for runtime diagnosis.

Allowed optional exports:
- scheduler analysis report for a run
- remediation lineage report for a run or node
- decomposition degradation report for draft planning

If materialized, they MUST be faithful projections of canonical event/projection data.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md

### 2. Decomposition degradation report

When draft decomposition degrades before canonical graph lock, the system may export a degradation report.

Minimum contents:
- source stage
- reason code
- original shape summary
- degraded fallback shape summary
- evidence refs / supporting diagnostics
- note that the degraded artifact is pre-canonical only

### 3. Remediation lineage report

If materialized, the remediation report MUST include:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md
- remediation root ID
- generations
- origin failure event
- linked finding IDs
- safe-point refs used for retries
- final resolution/outcome

### 4. Canonical boundary rule

Any degradation artifact MUST explicitly state whether it refers to:
ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Project_Output_Artifacts.md
- pre-canonical draft planning, or
- canonical execution

Canonical execution artifacts must never present degraded graph structure as if it were valid canonical graph truth.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Executor_Protocol.md
