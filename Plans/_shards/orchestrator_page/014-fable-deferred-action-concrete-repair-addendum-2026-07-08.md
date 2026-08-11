# Shard 014: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Orchestrator_Page.md`

Source lines: L2326-L2334

Source SHA256: `a678065d5ec532bd6c495df5a4fb52d791586f438ae46d50ecc621c79fe6e49a`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Orchestrator page rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-4ac2b9911ffce6c6ae062b08`: safe-point retry UI shows action `cmd.orchestrator.safe_point_retry` with the canonical project/run/node/blocked/attempt/safe-point/repo/worktree fields, `baseline_target = safe_point`, and optional `permission_snapshot_id`. Admission validates optional permission evidence against current permission state, consumes it, and dispatches the exact canonical payload to `cmd.runtime.restore_safe_point_then_retry` / `handlers::runtime::restore_safe_point_then_retry`. Confirmation copy must name the safe point and affected node/run. Disabled reasons are `safe_point_missing`, `state_changed`, `permission_denied`, and `operation_in_progress`.
- Repairs `sfk-20d70c6eed1de1a86055e838`: Plan Compile launch waits for `PlanApproved` publication for `60000` ms by default. On expiry it enters `plan_compile_launch_expired` with actions `retry_wait`, `open_plan_approval`, and `cancel_launch`.
- Repairs `sfk-e9a741e787bc73207fc9b89a`: core DAG GUI commands are `cmd.run_graph.pan`, `cmd.run_graph.zoom`, `cmd.run_graph.drag_node`, `cmd.run_graph.open_minimap_target`, `cmd.run_graph.open_context_menu`, `cmd.run_graph.keyboard_navigate`, and `cmd.run_graph.set_selection`. Enabled state requires graph data loaded and no modal capture; drag additionally requires editable layout mode.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
