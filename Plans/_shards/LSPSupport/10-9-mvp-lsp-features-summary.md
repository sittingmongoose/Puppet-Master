## 9. MVP LSP features (summary)
The MVP LSP surface is one canonical read/navigation set plus approval-gated rename. The long-name operation set below is canonical; short-name aliases do not replace it.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

### 9.1 Canonical operations

| Operation | Kind | Normalized success payload |
|---|---|---|
| `goToDefinition` | read/navigation | `locations[]` |
| `findReferences` | read/navigation | `locations[]` |
| `hover` | read/inspect | `hover_markdown`, optional `range` |
| `documentSymbol` | read/inspect | `symbols[]` |
| `workspaceSymbol` | read/inspect | `symbols[]` |
| `goToImplementation` | read/navigation | `locations[]` |
| `prepareCallHierarchy` | read/inspect | `call_hierarchy_items[]` |
| `incomingCalls` | read/inspect | `call_edges[]` |
| `outgoingCalls` | read/inspect | `call_edges[]` |
| `rename` | write-gated | `workspace_edit`, `change_count`, `file_count` |

Normalization rules:
- single-location and multi-location LSP responses are normalized to `locations[]`
- symbol-returning operations normalize to `{ name, kind, uri, range, selection_range? }`
- call-hierarchy results normalize to stable items and edges rather than exposing server-specific wire shapes
- `rename` remains approval-gated and returns the normalized workspace edit summary instead of a provider-specific patch object

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md

### 9.2 Normalized tool-result envelope

| Field | Type | Notes |
|---|---|---|
| `operation` | `string` | One canonical operation name from the table above. |
| `status` | `ok | partial | unavailable | error` | Normalized result status. |
| `server_id?` | `string` | Effective language-server identifier. |
| `root_identity?` | `string` | Effective root binding used for the request. |
| `locations[]?` | `array` | Used by navigation operations. |
| `symbols[]?` | `array` | Used by symbol operations. |
| `hover_markdown?` | `string` | Markdown-safe hover payload. |
| `call_hierarchy_items[]?` | `array` | Output of `prepareCallHierarchy`. |
| `call_edges[]?` | `array` | Output of `incomingCalls` or `outgoingCalls`. |
| `workspace_edit?` | `object` | Normalized rename edit set. |
| `warnings[]?` | `array` | Non-fatal issues or downgraded capabilities. |
| `error?` | `{ code, message, retryable? }` | Normalized failure envelope. |

Error rules:
- an operation with zero hits returns `status: 'ok'` and an empty payload family, not a synthetic error
- server missing or disabled returns `status: 'unavailable'` with `error.code: 'lsp_unavailable'`
- request timeout returns `status: 'error'` with `error.code: 'timeout'`
- stale document or root mismatch returns `status: 'error'` with `error.code: 'stale_document'`
- rename denied by approval or FileSafe returns `status: 'error'` with `error.code: 'rename_rejected'`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
Parameter carry-through:
- `workspaceSymbol` requires `query`.
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

Rules:
- query
- `rename` is approval-gated because it applies edits.
- PM intentionally keeps `rename` as an extension.
- read/navigation operations stay read-only while rename keeps approval gating
- Keep LSP consumers anchored to this summary section for canonical operation names and parameter carry-through
