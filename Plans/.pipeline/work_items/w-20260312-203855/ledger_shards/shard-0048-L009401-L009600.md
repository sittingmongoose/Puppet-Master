
### Do-not-forget details
- `workflow_run_id` is useful grouping identity, but not enough lineage by itself
- validation-pass reports are one of the few upstream artifacts already treated as hard-gating canon, so weak identity here will propagate confusion downstream
- these reports should bridge into execution; they should not be mistaken for execution

## Research Progress - 2026-03-16 - Storage owner gaps for missing record/projection families

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- current `working_ledger.md`

### Key findings
- `storage-plan.md` is now fairly strong on runtime-core records:
  - `attempt_record`
  - `blocked_projection`
  - `scheduler_pass_record`
  - `wizard_runtime_state`
  - cross-surface `orchestrator.receipt.{run_id}.{attempt_id}`
- But several downstream docs already assume additional record/projection families that `storage-plan.md` still does not actually own in concrete form.
- The clearest missing family is the runtime-artifact index side:
  - `Runtime_Artifacts_Panel.md` declares `artifacts_index:v1:{project_id}`
  - declares a projector from `runtime_artifact.*` events
  - declares envelope and per-type schema files
  - `storage-plan.md` still does not clearly register that artifacts index family alongside the other canonical keys, and the broader doc set still shows signs that the schema family itself may not yet exist
- The other major missing family is worktree/lane lifecycle state:
  - `WorktreeGitImprovement.md` now expects durable worktree identity, restart recovery, ownership, conflict state, historical lineage, and cross-surface CTAs
  - `Orchestrator_Page.md` expects `worktree_id` and historical worktree context to survive
  - `storage-plan.md` currently has only adjacent state like `source_control.project_state.{project_id}` and `orchestrator.receipt.{run_id}.{attempt_id}`; it does not yet define a proper durable worktree record/projection family for lifecycle/history/audit
- This means several surfaces are currently leaning on the same narrow bridge object (`orchestrator.receipt`) to explain more than it should:
  - receipts are good for cross-surface pivots
  - they are not enough to replace durable worktree/lane lifecycle records
- A similar pattern exists for the artifact panel:
  - one projector/index key is named
  - but the storage owner doc does not yet make it a first-class family with key registration, lifecycle, and failure/rebuild semantics at the same level as the newer runtime records
- The broader lesson is that storage ownership is lagging behind the rewrite’s stronger UI/runtime object model. Some downstream docs are not merely “too detailed”; they are revealing object families the storage plan now genuinely needs.

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- downstream consumers:
  - Source Control-related docs
  - `Plans/usage-feature.md`
  - `Plans/Project_Output_Artifacts.md`

### Contradictions / gaps surfaced
- `Runtime_Artifacts_Panel.md` names `artifacts_index:v1:{project_id}` as canonical, but `storage-plan.md` does not appear to register/own that family at the same level as other redb families.
- Runtime artifact schema ownership is still split awkwardly:
  - panel doc names required schema files
  - storage doc refers to runtime-artifact payloads but does not fully anchor the family
  - this makes it unclear where authoritative schema registration and projector ownership actually live
- `WorktreeGitImprovement.md` and Orchestrator/Source Control docs now assume durable worktree identity and lineage, but storage only clearly owns surface state (`selected_worktree_id?`) and receipt linkage (`worktree_id?`), not full lifecycle records.
- The current storage families are still more attempt/block/usage-centric than lane/worktree/concern/project-attention-centric, even though the rewrite now relies on those object families elsewhere.

### Candidate fixes to carry forward
- Add explicit first-class storage families for runtime-artifact indexing/projection:
  - canonical redb key registration
  - projector ownership/checkpoint semantics
  - rebuild/failure semantics
  - clear schema ownership boundary
- Add explicit first-class storage families for durable worktree/lane lifecycle:
  - worktree record
  - lane/worktree projection for current state
  - historical lineage retention after archive/remove
  - conflict/suspect/restoring/archive/remove lifecycle support
- Keep `orchestrator.receipt` as the cross-surface bridge object, but stop letting it impersonate missing lifecycle records for artifacts or worktrees.
- Audit `storage-plan.md` for other downstream-assumed families already discussed in research:
  - project summary / attention items
  - concern records/projections
  - account pressure and switch history
  - projection freshness/health fields on projections

### Do-not-forget details
- the storage gap is now about concrete missing object families, not just incomplete wording
- artifacts index and worktree lifecycle look like the clearest missing families right now
- receipt linkage is necessary but not sufficient; it cannot carry the full weight of lifecycle/history/state projection

## Research Progress - 2026-03-16 - Proposed storage families for worktree/lane and artifact index

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The missing storage-owner work is now specific enough to propose concrete families rather than leaving it as a generic gap.
- Two first-class families stand out as structurally necessary:
  - runtime artifact indexing/projection
  - durable worktree/lane lifecycle state

### Recommended artifact-index storage family
- Keep seglog `runtime_artifact.*` events as canonical source.
- Add explicit redb/projector ownership in `storage-plan.md` for:
  - `artifacts_index.v1:{project_id}:{artifact_id}`
    - current lookup/index row for one runtime artifact
  - `artifacts_project_state.v1:{project_id}`
    - optional UI/projector cursor/filter/health metadata if needed
  - `projector.checkpoint.runtime_artifacts:{project_id}`
    - projector checkpoint / rebuild state
- Minimum indexed fields should include:
  - `artifact_id`
  - `artifact_type`
  - `project_id`
  - `run_id?`
  - `thread_id?`
  - `node_id?`
  - `attempt_id?`
  - `created_at_utc`
  - `summary`
  - primary refs (`linked_artifact_id?`, `usage_event_ref?`, receipt/open refs)
  - projection freshness/health markers if projector state is degraded
- Rule:
  - the index is a projection for lookup/filter/navigation
  - it must be rebuildable from seglog
  - missing/corrupt index rows must degrade to record-backed views rather than implying artifact loss

### Recommended worktree/lane storage family
- Keep Source Control worktree-first at the UI level, but storage needs both durable worktree identity and lane lineage.
- Proposed families:
  - `worktree_record.v1:{project_id}:{worktree_id}`
    - durable worktree identity / filesystem / git backing
  - `lane_record.v1:{project_id}:{lane_id}`
    - package/lane operational lineage object
  - `worktree_projection.v1:{project_id}:{worktree_id}`
    - current lifecycle/status projection for the worktree
  - `lane_projection.v1:{project_id}:{lane_id}`
    - current lane lifecycle/status projection
- Minimum `worktree_record` fields:
  - `worktree_id`
  - `project_id`
  - `repo_id`
  - `path_ref` or canonical path snapshot
  - `branch_ref`
  - `baseline_ref?`
  - `created_at_utc`
  - `created_by_run_id?`
  - `created_by_attempt_id?`
  - `lane_id?`
  - `historical_lineage_refs[]?`
- Minimum `worktree_projection` fields:
  - lifecycle state (`active | suspect | restoring | retained | cleanup_eligible | archived | removed`)
  - `dirty_state`
  - `conflict_state`
  - `owner_run_id?`
  - `owner_attempt_id?`
  - latest `blocked_reason_code?`
  - `last_seen_at_utc`
  - `projection_freshness`
  - `projection_health`
- Minimum `lane_record` / `lane_projection` should preserve:
  - package/work-package linkage
  - current baseline
  - active worktree refs
  - historical worktree refs
  - cleanup/archive/remove lineage

### Ownership guidance
- `storage-plan.md` should own:
  - key registration
  - projector/rebuild semantics
  - current vs historical projection rules
- `WorktreeGitImprovement.md` should own:
  - operational behavior
  - cleanup/archive/remove rules
  - UI expectations for Source Control and Orchestrator
- `Runtime_Artifacts_Panel.md` should own:
  - artifact-type semantics
  - panel behavior
  - schema family references
- `orchestrator.receipt` should remain the cross-surface bridge record, not the substitute for these families.

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Orchestrator_Page.md`
- Source Control-related docs

### Contradictions / gaps surfaced
- `artifacts_index:v1:{project_id}` is too underspecified to function as the sole canonical index contract; it needs row identity and projector ownership.
- `selected_worktree_id?` in project UI state is not a substitute for a durable worktree record family.
- `orchestrator.receipt` already carries `worktree_id?`, which is useful, but without a worktree record/projection family there is nowhere canonical for lifecycle/history to live.

### Candidate fixes to carry forward
- Expand `storage-plan.md` with explicit artifact-index and worktree/lane family registration.
- Align artifact ID guidance so `attempt_id?` and `node_id?` are first-class indexed refs where relevant.
- Align worktree docs around `worktree_id` as durable identity and `lane_id` as operational lineage, rather than continuing to let tier IDs or raw paths carry canonical meaning.

### Do-not-forget details
- these families are projections/records that downstream docs are already implicitly depending on
- Source Control being worktree-first in UI does not remove the need for lane lineage in storage
- artifact index rows should degrade cleanly to seglog-backed inspection if projector state is stale or missing
