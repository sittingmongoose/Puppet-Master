# Shard 017: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/Orchestrator_Page.md`

Source lines: L2404-L2621

Source SHA256: `cd66bb447f461b390142bf4edc41ced7d57085e271e0085e54aab67885c58689`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 orchestrator controls (problems-only filter, ledger export, plan compile replay, and the safe-point retry confirmation) into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### OP-030 - Problems-Only Graph Filter

```yaml
plan_unit_id: OP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator graph toolbar exposes a Problems only toggle that filters the Node Graph view projection to problem-state elements: nodes and lanes whose state is attention_required, blocked, or degraded. The toggle is off by default, applies to the rendered view projection only, and resets rather than persisting across focused-run changes; it is never persisted globally across unrelated projects. Enabling the filter hides non-problem elements from the rendered view without mutating run state, node state, or the underlying projection data, and disabling it restores the unfiltered projection.
gui_related: true
gui_classification_reason: The Problems only toolbar toggle and the filtered graph view are user-visible GUI.
depends_on: []
unblocks: []
acceptance_criteria:
  - The graph toolbar shows a Problems only toggle that is off by default.
  - With the toggle enabled, the view shows only nodes and lanes whose state is attention_required, blocked, or degraded.
  - Disabling the toggle restores the unfiltered projection without any run, node, or projection mutation.
  - The toggle resets across focused-run changes and is not persisted globally across unrelated projects.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator problems-only graph filter fixture suite
risk_class: orchestrator_problem_filter_drift
reasoning_tier: standard
context_scope: orchestrator_graph_problem_filter
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: orchestrator_problems_only_filter
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/17-page-orchestrator.part.html"
  - "Plans/Orchestrator_Page.md:98"
  - "Plans/Orchestrator_Page.md:219"
  - "Plans/Orchestrator_Page.md:228"
preserved_exact_tokens:
  - Problems only
  - attention_required
  - blocked
  - degraded
negative_constraints:
  - Do not mutate run, node, or projection state from the filter; it is a view-only projection filter.
  - Do not persist the control globally across unrelated projects.
  - Do not treat the filtered view as evidence that hidden non-problem nodes ceased to exist.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```

### OP-031 - Ledger Export JSON Action

```yaml
plan_unit_id: OP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator Ledger tab exposes an Export JSON action that produces a download of the visible filtered ledger projection: the rows currently visible under the active filters and sort, serialized as JSON. Exported rows carry their usage_event_ref-style provenance fields, including usage_event_ref, usage_record_id, and related correlation refs, where the underlying rows have them, so exported data remains traceable to canonical records. The export is a projection export: it does not include raw records, evidence payloads, or secrets, and it confers no usage, billing, or ledger authority.
gui_related: true
gui_classification_reason: The Ledger tab Export JSON action and its download are user-visible GUI.
depends_on: []
unblocks: []
acceptance_criteria:
  - The Ledger tab shows an Export JSON action that downloads the visible filtered ledger projection as JSON.
  - Exported rows preserve usage_event_ref, usage_record_id, and related provenance/correlation fields where present on the source rows.
  - The export contains no raw records, evidence payloads, or secrets beyond the visible projection.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator Ledger export fixture suite
risk_class: orchestrator_ledger_export_drift
reasoning_tier: standard
context_scope: orchestrator_ledger_export
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: orchestrator_ledger_export_action
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/17-page-orchestrator.part.html"
  - "Concepts/pm6-build/parts/29x-pm6-js-orchestrator.part.html"
  - "Plans/Orchestrator_Page.md:2139-2156"
  - "Plans/Orchestrator_Page.md:2347"
preserved_exact_tokens:
  - Export JSON
  - Ledger
  - usage_event_ref
negative_constraints:
  - Do not silently include raw records or evidence in ordinary exports.
  - Do not export secrets, unauthorized provider/account details, or data outside the user's permissions.
  - Do not let the export confer usage, billing, or ledger authority; the Ledger tab remains a projection consumer.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/usage-feature.md
```

### OP-032 - Plan Compile Replay Projection

```yaml
plan_unit_id: OP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Plan Compile tab offers a read-only replay of compile waves as a projection: the user can step or play through the recorded compile-wave progression to review how the compile unfolded. Replay never re-executes compilation, never creates or rebinds a PlanCompileRun, and never mutates compile records or the compile projection; replay position and playback state are view-local and are discarded with the view. Replay frames are labeled as historical replay so they are never mistaken for live compile state.
gui_related: true
gui_classification_reason: Plan Compile replay controls and replayed wave frames are user-visible GUI.
depends_on: []
unblocks: []
acceptance_criteria:
  - Plan Compile replay steps or plays through recorded compile waves as a read-only projection.
  - Replay never re-executes compilation and never creates, rebinds, or mutates a PlanCompileRun or compile records.
  - Replay position and playback state are view-local and are not persisted as run or project state.
  - Replay frames are visibly labeled as historical replay, distinct from live compile status.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Plan Compile replay projection fixture suite
risk_class: orchestrator_compile_replay_drift
reasoning_tier: standard
context_scope: orchestrator_plan_compile_replay
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: orchestrator_plan_compile_replay_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/17-page-orchestrator.part.html"
  - "Concepts/pm6-build/parts/29x-pm6-js-orchestrator.part.html"
  - "Plans/Orchestrator_Page.md:44"
  - "Plans/Orchestrator_Page.md:48-50"
  - "Plans/Orchestrator_Page.md:1571"
preserved_exact_tokens:
  - Plan Compile
  - Replay
negative_constraints:
  - Do not re-execute compilation or create, rebind, or duplicate PlanCompileRuns from replay controls.
  - Do not mutate compile records or the compile projection from replay.
  - Do not present replay frames as live compile state; label them as historical replay.
compatibility_only_notes:
  - "Slint compatibility: replay stepping animates via retained-scene updates and jumps discretely under reduced motion; no arbitrary-content backdrop blur, no SVG filters, color math precomputed."
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Planning_Wizard.md
```

### OP-033 - Safe-Point Retry Confirmation Modal

```yaml
plan_unit_id: OP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The confirmation modal for cmd.orchestrator.safe_point_retry names the safe point id, the affected node and run, and the follow-up action that will occur on confirm, before any retry is dispatched. The action's disabled reasons are exactly safe_point_missing, state_changed, permission_denied, and operation_in_progress, and the invoking control or modal surfaces the applicable reason instead of failing silently. Confirmation copy is specific per the safe-point retry repair row: it names the safe point and the affected node/run rather than showing generic retry text.
gui_related: true
gui_classification_reason: The safe-point retry confirmation modal, its copy, and its disabled states are user-visible GUI.
depends_on: []
unblocks: []
acceptance_criteria:
  - The confirmation modal names the safe point id, the affected node and run, and the follow-up action before dispatch.
  - Disabled reasons are exactly safe_point_missing, state_changed, permission_denied, and operation_in_progress, surfaced on the invoking control or modal.
  - No cmd.orchestrator.safe_point_retry dispatch occurs without explicit confirmation through the modal.
  - Wrapper input contains the exact canonical project/run/node/blocked/attempt/safe-point/repo/worktree fields and baseline_target safe_point plus optional permission_snapshot_id only.
  - Admission validates and consumes optional permission_snapshot_id, then dispatches the exact canonical payload to handlers::runtime::restore_safe_point_then_retry.
  - The compatibility alias applies the identical transform; both spellings share the runtime result, safe_point.restored producer, effects, idempotency, and admission.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future safe-point retry confirmation fixture suite
risk_class: orchestrator_safe_point_retry_confirmation_drift
reasoning_tier: standard
context_scope: orchestrator_safe_point_retry_confirmation
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: orchestrator_safe_point_retry_confirmation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/17-page-orchestrator.part.html"
  - "Concepts/pm6-build/parts/29x-pm6-js-orchestrator.part.html"
  - "Plans/Orchestrator_Page.md:2322"
preserved_exact_tokens:
  - cmd.orchestrator.safe_point_retry
  - safe_point_missing
  - state_changed
  - permission_denied
  - operation_in_progress
negative_constraints:
  - Do not dispatch cmd.orchestrator.safe_point_retry without the named confirmation.
  - Do not extend, rename, or substitute the four disabled reasons without owner-doc revision.
  - Do not show generic confirmation copy that omits the safe point id, affected node, or run identity.
  - Do not create an Orchestrator restore handler, peer receipt-only/no-event execution path, or wrapper-specific retry dimension.
compatibility_only_notes:
  - "Slint compatibility: the modal overlay uses opaque or precomputed scrim styling; no arbitrary-content backdrop blur, no SVG filters, color math precomputed."
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/UI_Command_Catalog.md
```
