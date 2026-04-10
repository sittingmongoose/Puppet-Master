## 9. MVP LSP features (summary)

This section defines the canonical contract for this surface.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope; `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` requires `path` + `position` + `newName` with approval gating.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- rename

Rules:
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
