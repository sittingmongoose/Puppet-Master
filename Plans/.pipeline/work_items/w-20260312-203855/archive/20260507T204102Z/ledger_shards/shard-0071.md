  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = attempt`
  - `object_id = <attempt_id>`
  - `tab_id = node_graph`
  - `inspector_target = details | evidence | usage | lineage`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/usage-feature.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- `usage_event_ref` still appears in current docs as if it can remain a top-level route field.
- Wizard flows still look like specialized deep-link families instead of normalized object routes with serialized step anchors.
- Some graph/detail pivots still read as tab switches plus local state instead of canonical route restoration.

### Candidate fixes to carry forward
- Rewrite surface docs so these flows use the normalized route patterns above.
- Normalize `usage_event_ref` into `object_kind = usage_event`.
- Keep wizard-step focus in serialized anchor detail, not in the base route contract.

### Do-not-forget details
- These examples are the pressure test for the contract.
- If these normalize cleanly, the rest of the routing model will stay coherent.

## Research Progress - 2026-03-17 - Concrete route normalization for runtime lineage objects

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`

### Key findings
- The runtime lineage objects now need explicit route recipes so older `attempt_id`-only or `tier_id`-only pivots stop reappearing.

### Canonical route examples
- blocked episode:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = blocked_episode`
  - `object_id = <blocked_sequence>`
  - `tab_id = node_graph` or `tab_id = history`
  - `inspector_target = details | history`
  - `node_id` remains object scope within the run and must not be dropped by the resolver
- scheduler pass:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = scheduler_pass`
  - `object_id = <scheduler_pass_id>`
  - `tab_id = history`
  - `inspector_target = lineage | details`
- safe point:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = safe_point`
  - `object_id = <safe_point_id>`
  - `tab_id = history`
  - `inspector_target = lineage | history`
- remediation lineage:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = remediation`
  - `object_id = <remediation_root_id>`
  - `tab_id = history`
  - `inspector_target = lineage`
- graph generation:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = graph_generation`
  - `object_id = <graph_generation_id>`
  - `tab_id = node_graph`
  - `inspector_target = lineage`
- graph patch:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = graph_patch`
  - `object_id = <graph_patch_id>`
  - `tab_id = history`
  - `inspector_target = lineage | details`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- `blocked_sequence` has canonical identity meaning, but current docs still tend to route blocked work through node/attempt views instead of treating blocked episodes as their own targetable object.
- `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` already imply these route identities, but the general route contract still does not own the examples.
- Older docs still assume history pivots can be attempt-only, which is insufficient for scheduler, blocked, and remediation lineage.

### Candidate fixes to carry forward
- Add these lineage examples to the route contract owner docs.
- Keep blocked-episode identity explicit:
  - `blocked_sequence` is the canonical id
  - run and node scope remain required resolver context
- Keep scheduler/safe-point/remediation/patch lineage under `inspector_target = lineage` when the object is already selected.

### Do-not-forget details
- Runtime lineage is now object-first, not attempt-first.
- That change is necessary for blocked episodes, scheduler passes, and graph generations to remain intelligible.

## Research Progress - 2026-03-17 - Concrete route normalization for Source Control and orchestration work objects

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`

### Key findings
- Source Control and rewrite-era orchestration objects need equally explicit route recipes.

### Canonical route examples
- worktree detail:
  - `target_kind = side_panel`
  - `project_id = <project_id>`
  - `object_kind = worktree`
  - `object_id = <worktree_id>`
- lane detail:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = lane`
  - `object_id = <lane_id>`
  - `tab_id = progress` or `tab_id = seams`
  - `inspector_target = details | lineage`
- feature seam:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = feature_seam`
  - `object_id = <feature_seam_id>`
  - `tab_id = seams`
  - `inspector_target = summary | history | reviews`
- work package:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = work_package`
  - `object_id = <work_package_id>`
  - `tab_id = seams`
  - `inspector_target = summary | history | reviews | lineage`
- concern:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = concern`
  - `object_id = <concern_id>`
  - `tab_id = evidence` or `tab_id = ledger`
  - `inspector_target = details | history`
- promotion:
  - `target_kind = page_tab`
  - `project_id = <project_id>`
  - `focused_run_id = <run_id>`
  - `object_kind = promotion`
  - `object_id = <promotion_id>`
  - `tab_id = ledger`
  - `inspector_target = details | history | reviews`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Orchestrator_Page.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/storage-plan.md`
  - `Plans/WorktreeGitImprovement.md`

### Contradictions / gaps surfaced
- `cmd.source_control.select_worktree` is still described like a local selection command even though it is now clearly an object-targeting route action.
- Lane, seam, package, concern, and promotion routes are still mostly implied by UI prose instead of declared as canonical navigation identities.
- The old tier-era surfaces still encourage route descriptions based on containers and filters instead of object-first targeting.

### Candidate fixes to carry forward
- Normalize Source Control worktree selection through `object_kind = worktree`.
- Normalize lane/seam/package/concern/promotion pivots through `object_kind` routes, not filter-shaped payloads.
- Keep tab selection and inspector focus secondary to the object route.

### Do-not-forget details
- Source Control remains worktree-first.
- Orchestrator remains object-first.
- The route model supports both without forcing them into the same list or surface model.
