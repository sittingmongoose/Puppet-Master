## Tool Field Name and Taxonomy Alignment Addendum

### Field name correction

All references to `allowed_actions[]` in this document are replaced by the canonical runtime field name `allowed_action_ids[]`. The deprecated name MUST NOT be used in new tool contracts.

### validation_blocked alignment

`validation_blocked` is a canonical `blocked_reason_code` value (added to Plans/Contracts_V0.md). When tool output fails post-execution validation (schema check, safety scan, or constraint check), the tool layer MUST emit a blocked payload with `blocked_reason_code: validation_blocked` and the appropriate `allowed_action_ids[]`.

### mutation_capable tool registry field

Each tool definition in the tool registry MUST include a `mutation_capable: bool` field (default `false`). This field is the source of truth for the scheduler's decision to create safe points before attempts that invoke this tool.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
