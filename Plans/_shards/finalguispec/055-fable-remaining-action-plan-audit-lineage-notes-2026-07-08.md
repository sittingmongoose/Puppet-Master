# Shard 055: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/FinalGUISpec.md`

Source lines: L27251-L27260

Source SHA256: `763b51630fa42fcad43ab1bc37c8580746c527a33fd0c9b126e1d07ba07c3f35`

---

## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 39` (source_lineage_only; source line 315; `sfk-dbfb199dce43d628bb3dc410`): PMConcept Settings alternatives are source-lineage only; live canon remains the unified Settings registry, two-level/sidebar model, and separate Agent Config placement. Source summary: 1. **Settings IA** concept ships three alternate Settings prototypes (`.page-settings-a/-b/-c`, CSS 73377345) plus an 18-card bento grid + slide-in inspector (1343614450) plus a Project Settings Modal (10380) plus a separate 7-tab Agent Config page (12694). Plans canon is a s
- `registry_line 44` (repaired; source line 321; `sfk-abfc2f6cec0ea06de128b05e`): Dashboard widget canon repaired: PMConcept twenty-widget/sub-tab variants are source-lineage only; the default Dashboard set is exactly widget-orchestrator-progress, widget-active-lanes, widget-recent-results, and widget-custom-metrics. Source summary: 7. **Dashboard widgets** concept ~20 bespoke widgets across Main/Metrics/Monitoring sub-tabs (990110163) vs plans-locked catalog of exactly 4 dashboard widgets (F3-277/279) + 13 `progress.*` widget ids (F3-099), and plans themselves disagree 3-vs-4 on the default set (GUI-1 ME
- `registry_line 83` (repaired; source line 447; `sfk-fa1be2ed51683d179c169cb8`): Dashboard reorder precedence repaired: F3-275 full widget grid behavior supersedes the F3-252 drag-handle/click-to-swap mitigation; the latter remains migration-risk lineage only. Source summary: - [HIGH] L17073-18305 (F3-252 vs F3-275): Dashboard widget-grid reorder is locked to "drag-handle + click-to-swap, full DnD deferred" in one accepted unit while a later accepted unit requires full drag-to-reorder + edge resize + grid snapping as required MVP no precedence state
- `registry_line 84` (repaired; source line 448; `sfk-4c1d61c95c67c91b36401598`): Add Widget flow repaired: visible entrypoints dispatch cmd.dashboard.add_widget through catalog.dashboard_add_widget; the flow opens catalog, chooses widget, chooses or accepts slot/size, and persists layout. Source summary: - [HIGH] L18470-18474: "Add Widget" has three undecided entry points (menu/FAB/toolbar) with no command ID and a flow contradiction (choose-then-place vs auto-place-then-move) FIX: decide entrypoint, register `dashboard.add_widget`, sequence the flow.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
