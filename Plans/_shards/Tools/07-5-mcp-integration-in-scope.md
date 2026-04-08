## 5. MCP integration (in scope)

MCP canon is owned by `Plans/MCP_Integration.md`. This section is a consumer cross-reference for tool-registry and permission integration only.

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

Consumer rules:
- requested versus effective MCP availability is resolved through the owner document; this section does not redefine it
- credential binding and invalidation semantics are owner-defined in `Plans/MCP_Integration.md`
- tool names use the underscore-only form `{server_slug}_{tool_name}`
- slash-separated aliases are not canonical and must not remain live examples
