# Shard 018: Plan Mode Strategy & Defaults

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L1046-L1061

Source SHA256: `4e290afe161c830a1ba77a293806ab97f24e67d6668528a1fa94c5530a1f6e87`

---

## Plan Mode Strategy & Defaults

The orchestrator must follow the reconciled PM rule for delegated work in `ask` and `plan`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md

Canonical decision:
- `ask` and `plan` may launch delegated child runs only for read-only research or analysis.
- required planning dependencies may still be child runs when they remain read-only.
- parent mode is a hard ceiling.
- the orchestrator must not silently widen a read-only planning run into execution authority.
- Planning-flow behavior is PM-native: do not justify `todowrite`, `question`, or other planning tools solely by analogy to OpenCode defaults; Plan remains read-only until execution, clarifying questions are first-class, and the plan plus TODO stay visible artifacts during planning.

The orchestrator should classify planning children as `required` or `optional` so planning completion and summarization behave deterministically.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md
