## Canonical owner and consumer reconciliation

Tools are defined SSOT in this document. Consumers in other surfaces (UI, CLI, Help, Permissions) reference this document rather than restating tool definitions.

### Consumer propagation

When a tool is used:
1. Permission system checks the tool's action against `Plans/Permissions_System.md§PERM-ACTIONS` and approval_scope_key.
2. Orchestrator runtime logs the tool invocation in the execution unit context (run, node, seam, or package).
3. Provider surface (CLI-bridged or OpenCode) executes the tool and returns a result.
4. Usage system attributes tokens, calls, and cost to the tool_id and execution_role.
5. Evidence system captures the tool invocation, parameters (if safe), and result in the evidence family.
6. Route/Open surface processes any side-effects (file writes, external updates) and links artifacts.

Rules:
- Tool definitions remain in this document; no tool SHOULD be re-specified in permissions, provider, or UI docs.
- Tool references from other docs MUST use ContractRef with anchor to the specific tool definition.
- Tool-specific permission rules (e.g., "require approval for file mutations") MUST be defined in `Plans/Permissions_System.md`, not duplicated here.
- Tool variants (e.g., different CLI flags for the same logical tool) are treated as separate tools with distinct tool_ids for usage and permission tracking.

### Required data shape

Every tool record MUST preserve:
- `tool_id`: canonical tool identifier (ULID)
- `tool_name`: human-readable name
- `tool_category`: 'file' | 'provider' | 'query' | 'workflow' | 'internal'
- `description`: short description and contract reference
- `signature`: function signature or CLI command
- `safe_parameters`: list of parameter names that may be logged
- `sensitive_parameters`: list of parameter names that MUST NOT be logged
- `output_type`: 'string' | 'json' | 'file' | 'stream'
- `approval_default`: 'auto_approve' | 'require_approval' | 'suggest_only'
- `permission_action`: references to applicable permission actions
- `execution_unit_context`: 'run' | 'node' | 'seam' | 'package' | 'any' (scope where tool may execute)
- `contract_refs`: list of ContractRef anchors to related plans

This owner section is the canonical SSOT for tool registry, tool semantics, and tool propagation rules.

---