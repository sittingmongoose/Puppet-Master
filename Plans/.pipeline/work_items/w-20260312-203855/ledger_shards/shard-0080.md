
### Contradictions / gaps surfaced
- The same consumer docs now rely on canonical blocked/scheduler/remediation lineage in one section and legacy tier-event push streams in another.
- That split keeps teaching implementers that `TierChanged` and `UserInteractionRequired` are the primary operational truth even though the runtime/storage owner docs have already moved to canonical event and projection families.
- This is upstream of several other drifts:
  - `tier_id` worker-output correlation
  - `request_id` approval targeting
  - graph/orchestrator live-status bindings that bypass canonical blocked projections

### Candidate fixes to carry forward
- Reconcile the live-status source tables in graph and Orchestrator docs so they consume canonical runtime records/projections first.
- Keep any surviving `PuppetMasterEvent::*` references explicitly marked as compatibility transport or migration notes, not as the primary operational source.
- Reconcile worker output and evidence update rules so they align with attempt/node/runtime lineage rather than `TierChanged`-driven active-tier state.

### Do-not-forget details
- This seam is now a consumer-doc sourcing problem, not a missing-runtime-contract problem.
- The owner docs already have the stronger source model.

## Research Progress - 2026-03-17 - `Run_Graph_View.md` base view-model still preserves tier-era and request-era fields

### Targeted docs read
- `Plans/Run_Graph_View.md`

### Key findings
- `Plans/Run_Graph_View.md` now has a clear split between:
  - older base view-model definitions
  - later runtime-lineage reconciliation addenda
- The base `GraphNode` struct still preserves stale fields as if they were core model state:
  - `tier_type`
  - `worker_provider`
  - `worker_model`
  - `verifier_provider`
  - `verifier_model`
  - `hitl_request_id`
- The Slint-facing `GraphNodeUI` and callbacks still preserve the same assumptions:
  - `tier_type` string in UI state
  - `hitl_action(node_id, action, rationale)` callback rather than a runtime-native blocked action target
- Later addenda already require the stronger model:
  - `attempt_id`
  - `blocked_reason_code`
  - `allowed_action_ids[]`
  - `safe_point_id`
  - remediation lineage identifiers
  - `replan_generation`
  - queue-analysis and blocked-state rendering rules keyed to canonical runtime records

### Impacted docs
- Primary stale consumer:
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- The document now has an internal model mismatch:
  - the base structs and callbacks still teach tier/request-era identity
  - the later addenda teach attempt/block/runtime-lineage identity
- `hitl_request_id` is now especially out of place because the same doc later centers `blocked_sequence` and canonical runtime commands.
- `tier_type` still appears as a core node UI field even though the broader rewrite direction is to demote tier/phase labels to derived or compatibility-only view context.

### Candidate fixes to carry forward
- Reconcile the base `GraphNode` and `GraphNodeUI` contracts to the later runtime-lineage model.
- Remove request-centric approval identity from the base graph model.
- Keep any surviving tier labels explicitly as derived display/grouping metadata, not as the core runtime identity shape.
- Reconcile the HITL callback model so graph actions normalize through canonical runtime action targets rather than graph-local request callbacks.

### Do-not-forget details
- This is a base-struct problem, not only a prose-table problem.
- The later addenda already define the stronger direction; the base model has not caught up.

## Research Progress - 2026-03-17 - `Orchestrator_Page.md` Progress widgets still center active-tier and tier-targeted terminal semantics

### Targeted docs read
- `Plans/Orchestrator_Page.md`

### Key findings
- The `Progress` tab is already correctly identified as widget-composed, but its default widget contract is still strongly tier-era.
- Default widget semantics still say:
  - `widget.current_task` = active tier title/objective/platform/model
  - `widget.progress_bars` = phase/task/subtask completion bars
  - `widget.agent_terminal` = current worker output
  - `widget.completed_prose` = completed tier summaries
- Terminal widget behavior is also still tier-targeted:
  - terminal instances can be pinned to a specific `tier_id`
  - `auto` follows the most recently started worker
- The same doc already has stronger later sections for:
  - blocked/recovery state
  - scheduler pass lineage
  - remediation lineage
  - evidence summaries as record-backed surfaces
- So the widget layer is now lagging the rest of the page’s own rewrite direction.

### Impacted docs
- Primary stale consumer:
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- The Progress widget contracts still teach “active tier / phase-task-subtask progress / tier-targeted terminal” as the primary operational mental model.
- That conflicts with the rewrite direction where:
  - nodes are the executable unit
  - seams/packages/lanes are the higher-level operational objects
  - worker/runtime detail should key from runtime identity, not only active-tier heuristics
- `widget.completed_prose` is also still described as completed tier summaries even though evidence and summary records are moving toward stronger object-backed surfaces.

### Candidate fixes to carry forward
- Reconcile Progress widgets away from active-tier-first semantics.
- Keep Progress widget composition, but bind widgets to canonical runtime and orchestration objects:
  - active work objects
  - blocked/attention items
  - lane/worktree state
  - record-backed summaries
- Reconcile terminal widgets so targeting uses runtime/worker identity rather than `tier_id` as the primary selector.

### Do-not-forget details
- This is one of the clearest remaining consumer-layer pockets where the old execution model still shapes the UI.
- The later sections in the same doc already show the stronger direction, so this is a local reconciliation problem rather than a missing concept.

## Research Progress - 2026-03-17 - `Widget_System.md` still encodes tier-era Orchestrator widget contracts and stale hostability

### Targeted docs read
- `Plans/Widget_System.md`

### Key findings
- `Plans/Widget_System.md` is still carrying a broad pre-rewrite Orchestrator widget model.
- The Dashboard / Orchestrator Progress widget catalog still says:
  - `widget.current_task` = active tier title/objective/elapsed
  - `widget.progress_bars` = phase/task/subtask completion bars
  - `widget.cta_stack` sourced from `PuppetMasterEvent::UserInteractionRequired`
  - `widget.agent_terminal` filtered by `tier_id`
  - `widget.completed_prose` = finished phases/tasks
- The doc also still exposes widgetized non-Progress Orchestrator tabs:
  - `widget_layout:v1:orchestrator:tiers`
  - `widget_layout:v1:orchestrator:evidence`
  - `widget_layout:v1:orchestrator:history`
  - `widget_layout:v1:orchestrator:ledger`
  - `widget.tier_tree` hosted on `Orch/Tiers`
- This conflicts directly with the rewrite direction already logged elsewhere:
  - only `Progress` remains widget-composed
  - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native-purpose tabs
- The widget data contract section is also still sourced from:
  - `PuppetMasterEvent::TierChanged`
  - `PuppetMasterEvent::UserInteractionRequired`
  - tier-targeted PTY filtering

### Impacted docs
- Primary stale owner/consumer hybrid:
  - `Plans/Widget_System.md`

### Contradictions / gaps surfaced
- `Widget_System.md` is still acting as if multiple Orchestrator tabs are widget canvases.
- It still teaches tier-tree and active-tier widget semantics from a doc that is supposed to be a reusable widget SSOT.
- Because this document is cross-cutting, its stale hostability rules can easily reintroduce drift into:
  - `FinalGUISpec.md`
  - `Orchestrator_Page.md`
  - Dashboard/Usage widget reconciliation

### Candidate fixes to carry forward
- Narrow Orchestrator widget hostability to `Progress` only.
- Retire `widget.tier_tree` as a first-class Orchestrator widget in favor of native `Seams` and native graph/history/evidence/ledger tabs.
- Reconcile widget data contracts away from `TierChanged`, `UserInteractionRequired`, and tier-targeted worker filters toward canonical runtime and attention projections.
- Reconcile widget layout persistence keys so stale non-Progress Orchestrator widget-layout keys are not left as live canon.

### Do-not-forget details
- This is a cross-cutting SSOT problem, not just a page-local doc issue.
- `Widget_System.md` can re-spread stale Orchestrator assumptions if it is not reconciled early.

## Research Progress - 2026-03-17 - Widget layout migration contract is internally inconsistent

### Targeted docs read
- `Plans/Widget_System.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The widget layout migration contract now has an exact persistence-rule contradiction.
- `Plans/Widget_System.md` says in section 7.3:
  - convert `dashboard_layout:v1` to `widget_layout:v1:dashboard`
  - keep `dashboard_layout:v1` as backup
- The same section then says in its own SSOT precedence note:
  - after migration, the legacy key is deleted
- `Plans/FinalGUISpec.md` appendix C.5 mirrors the backup-preserving version:
  - keep `dashboard_layout:v1` as backup
  - future reads use `widget_layout:v1:dashboard`
  - widget layout takes precedence

### Impacted docs
- Primary spec-integrity docs:
  - `Plans/Widget_System.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- `Widget_System.md` currently gives two incompatible migration outcomes in the same section:
  - preserve legacy backup
  - delete legacy key
- `FinalGUISpec.md` aligns with only one of those outcomes.
- Because `Widget_System.md` claims SSOT precedence for widget layout key handling, this contradiction is more than editorial drift.

### Candidate fixes to carry forward
- Resolve the migration policy to one deterministic rule.
- Keep the same rule in both:
  - `Plans/Widget_System.md`
  - `Plans/FinalGUISpec.md`
- Treat this as a persistence-contract decision, not as appendix-level wording trivia.

