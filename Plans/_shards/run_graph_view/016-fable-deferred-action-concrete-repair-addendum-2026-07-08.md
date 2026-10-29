# Shard 016: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Run_Graph_View.md`

Source lines: L1076-L1082

Source SHA256: `a79d6ebcf126b372314b28118934c716b0b8607db633b63bdbfe8beb8f42ea3e`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Run Graph rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-e9a741e787bc73207fc9b89a`: run-graph interaction commands are `cmd.run_graph.pan`, `cmd.run_graph.zoom`, `cmd.run_graph.drag_node`, `cmd.run_graph.open_minimap_target`, `cmd.run_graph.open_context_menu`, `cmd.run_graph.keyboard_navigate`, and `cmd.run_graph.set_selection`. Disabled reasons are `graph_unloaded`, `modal_capture`, `read_only_layout`, `selection_locked`, and `permission_denied`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
