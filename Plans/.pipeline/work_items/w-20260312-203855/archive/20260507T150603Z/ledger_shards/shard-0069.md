  - `Plans/FinalGUISpec.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- The concrete wizard deep-link format is defined, but there is still no owner doc that states what class of route data is allowed into serialized transport.
- Stored `resume_url` fields in `storage-plan.md` remain valid, but they still look stronger than the general route contract because the owner contract is not written yet.
- Wizard flows still have the clearest deep-link path in the product, which continues to make generic in-app routing feel under-specified.

### Candidate fixes to carry forward
- Define `resume_url` as serialized `route_target` transport in `Contracts_V0.md`.
- State the allowed serialized data classes directly.
- Keep wizard-step detail as a narrow serialized anchor, not a new top-level base route field.
- Keep `resume_url` portability and persistence, but remove its status as the strongest implicit navigation mechanism.

### Do-not-forget details
- `resume_url` is transport.
- `route_target` is canonical identity.
- Serialization must stay narrower than the internal route model.

## Research Progress - 2026-03-17 - Refreshed canonical `object_kind` vocabulary

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/assistant-chat-design.md`
- `Plans/usage-feature.md`

### Key findings
- The earlier `object_kind` list is directionally correct, but it now needs a firmer canonical refresh against the rewrite-era object set and the newer runtime lineage objects.
- The canonical `object_kind` set is:
  - conversational / upstream:
    - `thread`
    - `message`
    - `wizard`
    - `usage_event`
  - runtime / execution:
    - `run`
    - `node`
    - `attempt`
    - `scheduler_pass`
    - `blocked_episode`
    - `safe_point`
    - `remediation`
  - orchestration rewrite:
    - `feature_seam`
    - `work_package`
    - `lane`
    - `worktree`
    - `concern`
    - `promotion`
    - `graph_patch`
    - `graph_generation`
- This set is enough for the current rewrite surface area.
- `object_id` must use existing canonical ids:
  - `thread_id`
  - `message_id`
  - `wizard_id`
  - `run_id`
  - `attempt_id`
  - `scheduler_pass_id`
  - `blocked_sequence` in `{ run_id, node_id }` scope
  - `safe_point_id`
  - `remediation_root_id`
  - `lane_id`
  - `worktree_id`
  - concern / promotion / graph-patch / graph-generation ids when defined
- `tier`, `tier_id`, raw widget ids, panel ids, and serialization tokens do not belong in `object_kind`.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/storage-plan.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/usage-feature.md`

### Contradictions / gaps surfaced
- Older docs still pivot by `tier_id` in places where `node`, `attempt`, `scheduler_pass`, `blocked_episode`, or rewrite-era objects should now be first-class navigation targets.
- `usage_event_ref` still appears as a special-case route concept in some docs instead of being normalized into `object_kind = usage_event`.
- `blocked_sequence` has canonical runtime meaning, but there is still no explicit owner text saying it is the identity component for `blocked_episode` inside `{ run_id, node_id }` scope.

### Candidate fixes to carry forward
- Define the canonical `object_kind` enum in `Contracts_V0.md`.
- Add the vocabulary to `Glossary.md` so downstream copy and help stop drifting.
- Normalize older route/pivot docs away from `tier_id` and one-off special-case ids.
- State blocked-episode identity directly:
  - `object_kind = blocked_episode`
  - `project_id`
  - `focused_run_id = run_id`
  - `object_id = blocked_sequence`
  - `object scope = node_id within run`

### Do-not-forget details
- `object_kind` now carries almost all non-subject navigation identity in the rewrite.
- If new object families appear, they must be added deliberately, not ad hoc in surface docs.

## Research Progress - 2026-03-17 - Exact `inspector_target` vocabulary

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`

### Key findings
- `inspector_target` needs a controlled vocabulary.
- The canonical vocabulary is:
  - `summary`
  - `evidence`
  - `artifacts`
  - `history`
  - `reviews`
  - `usage`
  - `lineage`
  - `details`
- These values cover the reusable detail-pane and drill-in patterns already present across Orchestrator, graph detail, history/ledger pivots, and evidence/artifact surfaces.
- `inspector_target` is not object identity.
- `inspector_target` is not a per-surface arbitrary bag.
- `inspector_target` does not replace `tab_id`.
- `wizard_step`, `message_id`, `line`, `range`, and compare-target state are not `inspector_target` values.

### Use rules
- Use `inspector_target` only after primary selector identity is already established.
- Use `inspector_target = evidence` when the target object is already selected and the detail focus must land on evidence.
- Use `inspector_target = lineage` for scheduler/remediation/safe-point/patch lineage drill-ins.
- Use `inspector_target = usage` for graph/node/attempt pivots that keep the same object but focus the usage section.
- Use `inspector_target = history` for chronological/detail-history focus inside an already-selected object.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- Current docs still imply free-form subsection focus in a few places, especially around graph detail, wizard resume, and usage pivots.
- Without a closed vocabulary, `inspector_target` will become a second untyped extension bag.

### Candidate fixes to carry forward
- Define the closed `inspector_target` enum in `Contracts_V0.md`.
- Keep all message-step-line-range style anchors out of `inspector_target`.
- Use domain-local serialized anchor detail only when the target cannot be expressed through the closed inspector vocabulary.

### Do-not-forget details
- `inspector_target` is a reusable detail-focus enum.
- It must stay small.
- It must never become a fallback bag for unresolved route design.

## Research Progress - 2026-03-17 - Hard rule for `subject_id` vs `object_kind`

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/usage-feature.md`
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`

### Key findings
- The split needs a hard classification rule.
- Use `subject_id` only when the target is canonical renderable/openable content.
- Use `object_kind` + `object_id` for all runtime, governance, conversational, and workflow objects.
- The canonical `subject_id` families remain:
  - `doc:<document_id>`
  - `artifact:<artifact_id>`
- Everything else routes through `object_kind` + `object_id`.

### Classification rule
- `subject_id`:
  - source/open/preview/review subject
  - document or artifact content identity
  - resolvable through `OpenSubject`
- `object_kind` + `object_id`:
  - thread
  - message
  - wizard
  - usage event
  - run / node / attempt
  - scheduler / blocked / safe point / remediation
  - seam / package / lane / worktree / concern / promotion / graph objects

### Normalization examples
- cost usage row:
  - `object_kind = usage_event`
  - `object_id = <canonical usage event id>`
- chat search result:
  - `object_kind = message`
  - `object_id = <message_id>`
- wizard resume:
  - `object_kind = wizard`
