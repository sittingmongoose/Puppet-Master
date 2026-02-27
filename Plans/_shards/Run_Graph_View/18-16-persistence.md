## 16. Persistence

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `graph_view_state:v1:{run_id}` | `{ preset, zoom, pan_x, pan_y, selected_node_id }` | On change (debounced 500ms) |
| `graph_layout_cache:v1:{run_id}:{preset}` | `Vec<NodePosition>` (cached layout) | After layout computation |

On view load: restore preset, zoom, pan, and selection from redb. If no persisted state, use defaults (Layered L-R preset, fit-to-screen, no selection).

ContractRef: ContractName:Plans/storage-plan.md

---

<a id="17-uicommand-ids"></a>
