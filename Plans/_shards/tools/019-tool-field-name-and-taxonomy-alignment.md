# Shard 019: Tool Field Name and Taxonomy Alignment

Source: `Plans/Tools.md`

Source lines: L1509-L1530

Source SHA256: `ac31174ea0b530c0b68fb1114c81573d9a9c472889d41690c6487d387cb97b6c`

---

## Tool Field Name and Taxonomy Alignment
Tool-originated blocked and denial paths align with the canonical runtime contract.

### Field name correction


Tool-originated blocked payloads use `allowed_action_ids[]` only. Deprecated names MUST NOT appear in new tool contracts.

### Canonical blocked reasons
Tool-denial or post-validation paths use the shared `blocked_reason_code` family, including `validation_blocked` when post-execution validation fails.

### Mutation capability ownership
Each tool definition MUST include `mutation_capable: bool` (default `false`). This remains the source of truth propagated into planning, safe-point, and recovery decisions.

### Recovery contract
Tool-originated blocked paths:
- MUST NOT invent tool-private action arrays outside the canonical runtime action family
- MUST preserve the blocked state rather than converting it into success-shaped fallback output
- MUST carry prerequisite metadata needed to bind the exact recovery command

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md

