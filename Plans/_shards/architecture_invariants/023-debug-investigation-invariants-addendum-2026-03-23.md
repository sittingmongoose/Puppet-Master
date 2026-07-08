# Shard 023: Debug investigation invariants addendum (2026-03-23)

Source: `Plans/Architecture_Invariants.md`

Source lines: L254-L276

Source SHA256: `3f3e3b9f42434b65cdfcdfd03597ce25926979886fe66d28c06cd0f8d23a3cc3`

---

## Debug investigation invariants addendum (2026-03-23)


### Invariant A -- Debug overlay is not a runtime mode


`debug` MUST exist only in overlay identity and UI label state. The canonical runtime-mode enum remains `ask | plan | regular | yolo`.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### Invariant B -- Visible evidence ingress only


Automatically collected Debug evidence MUST become visible Investigation Context or Runtime Artifacts state. PM MUST NOT rely on hidden prompt-only evidence injection for browser/debug payloads.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### Invariant C -- Cross-surface investigation identity


Any PM surface that participates in debugging MUST preserve `investigation_id` and, when applicable, `instrumentation_id` rather than minting surface-local debug identities that cannot be correlated later.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/orchestrator-subagent-integration.md
