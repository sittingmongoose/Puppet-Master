## 17. UICommand IDs

| Command ID | Args | Behavior |
|-----------|------|----------|
| `cmd.graph.select_node` | `{ node_id: string }` | Select node in graph + table |
| `cmd.graph.deselect` | `{}` | Deselect all |
| `cmd.graph.zoom` | `{ level: float }` | Set zoom level (0.25 to 4.0) |
| `cmd.graph.fit_to_screen` | `{}` | Fit all nodes in viewport |
| `cmd.graph.layout_preset` | `{ preset: string }` | Switch layout preset |
| `cmd.graph.focus_node` | `{ node_id: string }` | Center viewport on node |
| `cmd.graph.filter` | `{ states: string[], search: string }` | Apply filters |
| `cmd.graph.retry_node` | `{ node_id: string }` | Retry a failed node |
| `cmd.graph.replan_node` | `{ node_id: string }` | Replan a failed/escalated node |
| `cmd.graph.reopen_node` | `{ node_id: string }` | Reopen a passed/skipped node |
| `cmd.graph.approve_hitl` | `{ node_id: string, rationale: string }` | Approve HITL request |
| `cmd.graph.deny_hitl` | `{ node_id: string, rationale: string }` | Deny HITL request |

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand), ContractName:Plans/UI_Command_Catalog.md

---

<a id="18-acceptance-criteria"></a>
