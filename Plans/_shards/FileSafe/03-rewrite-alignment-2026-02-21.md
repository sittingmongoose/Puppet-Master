## Rewrite alignment (2026-02-21)

This plan remains authoritative for **FileSafe safety policy only**. As the rewrite lands, FileSafe is implemented primarily through:
- the **central tool registry + policy engine** for permissions, validation, and normalized tool outcomes
- the **patch/apply/verify/rollback pipeline** rather than ad-hoc guardrails in UI code
- emitting guard decisions, violations, and remediation into the canonical seglog event stream

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Context compilation, delta-context selection, cache heuristics, marker files, skill bundling, and compaction strategy are owned by `Plans/Prompt_Pipeline.md`. FileSafe may reference those flows only to define where safety checks run against compiled output.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

Any UI or storage examples in this plan are illustrative unless they describe guard behavior, fail-closed execution, canonical logging, or explicit FileSafe-owned payload contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md

