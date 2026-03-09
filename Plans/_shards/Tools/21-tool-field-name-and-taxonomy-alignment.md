## Tool Field Name and Taxonomy Alignment

### Field name correction
Tool-originated blocked payloads use `allowed_action_ids[]` only. Deprecated names MUST NOT appear in new tool contracts.

### Canonical blocked reasons
Tool-denial or post-validation paths use the canonical `blocked_reason_code` family, including `validation_blocked` when post-execution validation fails.

### Mutation capability ownership
Each tool definition MUST include `mutation_capable: bool` (default `false`). This is the source of truth propagated into node planning and safe-point decisions.

### Recovery contract
Tool-originated blocked paths MUST NOT invent parallel action schemas or tool-private retry categories outside the canonical runtime contract.
