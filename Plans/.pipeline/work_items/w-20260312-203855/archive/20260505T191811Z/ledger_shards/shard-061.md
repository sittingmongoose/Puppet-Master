- generated/staged document:
  - `subject_id = artifact:<artifact_id>`
- persisted workspace document:
  - `subject_id = doc:<document_id>`
- thread jump:
  - `object_kind = thread`
  - `object_id = <thread_id>`
- wizard resume:
  - `object_kind = wizard`
  - `object_id = <wizard_id>`
  - step selection should ride in a specialized subtarget/detail field or in serialized `resume_url`, not as a universal base field
- usage row focus:
  - prefer `object_kind = usage_event`
  - `object_id = <usage_event_ref or stable usage id>`
  - rather than a dedicated top-level `usage_event_ref`

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`
- Cross-owner docs implicated by this seam:
  - `Plans/FileManager.md`
  - `Plans/storage-plan.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- Many current commands and deep-link descriptions still expose raw local IDs directly because there is no normalized target object yet.
- Some existing payloads probably carry both context and target in a way that should be split once `route_target` exists.
- `line`/`range` are useful, but they belong to path/document-open specialization much more than to the canonical base route object.

### Candidate fixes to carry forward
- Keep `route_target` intentionally small and force normalization pressure through `subject_id` and `object_kind/object_id`.
- Let specialized contracts carry specialized selectors:
  - `OpenFile` owns `path`, `line`, `range`
  - `OpenSubject` owns `subject_id` and subject realization rules
  - object-family commands may still carry family-specific anchors when they are truly not reusable
- Avoid adding a generic nested “extra args” bag to `route_target`; that would recreate the same drift under a different name.

### Do-not-forget details
- The key quality bar here is restraint.
- If the base target object grows too large, it stops being canonical and just becomes a new dumping ground.
- Most current navigation payloads can be normalized more aggressively than the existing docs currently do.

## Research Progress - 2026-03-16 - Controlled vocabulary for `subject_id` families and `object_kind`

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/assistant-chat-design.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The rewrite now has enough stable object families that `object_kind` can no longer stay informal.
- The key guardrail is to keep `subject_id` narrow and open-oriented, while `object_kind` covers non-subject domain objects that need navigation, focus, or inspection.
- `subject_id` should not become a second generic object taxonomy. It should stay for openable/renderable content subjects.
- Many current payloads already expose stable canonical IDs that can map directly into `object_kind/object_id` without inventing route-local IDs.

### Recommended `subject_id` families
- Keep the initial canonical set deliberately small:
  - `doc:<document_id>`
  - `artifact:<artifact_id>`

Optional later expansion only if a real cross-surface need appears:
- avoid adding `thread:`, `run:`, `wizard:`, `safe_point:`, etc. as `subject_id` families when those are better modeled as `object_kind/object_id`

### Recommended early `object_kind` set
- conversational / planning:
  - `thread`
  - `message`
  - `wizard`
  - `usage_event`
- execution/runtime:
  - `run`
  - `node`
  - `attempt`
  - `scheduler_pass`
  - `blocked_episode`
  - `safe_point`
  - `remediation`
- rewrite-era orchestration objects:
  - `feature_seam`
  - `work_package`
  - `lane`
  - `worktree`
  - `concern`
  - `promotion`
  - `graph_patch`
  - `graph_generation`

### What should generally NOT be `object_kind`
- raw UI container state:
  - panel ids
  - tab ids
  - split ratios
  - layout keys
- transport/serialization artifacts:
  - `resume_url`
  - `generated://...`
- provider/runtime disclosure fields:
  - effective model/account/persona values are attributes of objects, not usually target kinds by themselves

### Recommended normalization rules
- `object_id` should use the canonical domain identity already present in the docs:
  - `thread_id`
  - `message_id`
  - `wizard_id`
  - `run_id`
  - `attempt_id`
  - `scheduler_pass_id`
  - `safe_point_id`
  - `remediation_root_id`
  - `lane_id`
  - `worktree_id`
  - concern/promotion/graph-patch ids when defined
- Avoid route-local surrogate IDs if a canonical domain ID already exists.
- If a target requires both identity and sub-selection, keep the main identity in `object_kind/object_id` and use `inspector_target` or a specialized verb for the sub-selection.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/FinalGUISpec.md`

### Contradictions / gaps surfaced
- Some current surfaces still behave as if every target kind needs its own bespoke payload shape.
- `subject_id` will become muddy if it expands beyond renderable/openable content too early.
- Several rewrite-era object families now clearly need stable target kinds even though older docs still mostly pivot by `run_id`, `tier_id`, or file path.

### Candidate fixes to carry forward
- Declare the initial `subject_id` families narrowly and explicitly.
- Declare an early canonical `object_kind` enum family in the contract layer, with room for later controlled extension.
- Prefer extending `object_kind` deliberately over adding new top-level route fields.
- Keep UI container state (`tab_id`, panel focus, inspector section) as view context around the target, not as the target taxonomy itself.

### Do-not-forget details
- The vocabulary split is what keeps the new routing model from collapsing back into “just pass whatever ids you have.”
- `subject_id` should stay sparse; `object_kind` should do most of the cross-surface identity work.
- Rewrite-era objects like `Feature Seam`, `Work Package`, `Concern`, and `Graph Patch` now deserve first-class target kinds, not just ad hoc filters.

## Research Progress - 2026-03-16 - Sub-selection and `inspector_target` should stay secondary

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`

### Key findings
- Several important surfaces need more than just “open object X”:
  - Node Graph wants a detail panel / subsection selection
  - document pane restore wants history selection / approval-stage context
  - wizard resume wants a specific step / clarification focus
  - chat/thread search wants a specific message focused
  - file opens want line/range
- But these are not all the same kind of data, and they should not all become first-class target identity.
- The clean split is:
  - canonical target identity gets you to the right object/surface
  - secondary focus/sub-selection tells that surface what part to reveal or highlight
- `inspector_target` is still useful, but it should stay for reusable detail-pane or subsection focus, not as a universal dumping ground for all feature-local anchors.

### Recommended rule
- `route_target` owns the main identity/scope only.
- Sub-selection is handled by one of three mechanisms:
  - `OpenFile` specialization for `line` / `range`
  - `inspector_target` for reusable detail-surface focus
  - object-family-specific anchor fields only when the anchor is truly domain-local and not reusable

### Good fits for `inspector_target`
- selected detail section / subsection
- evidence tab vs history tab vs review tab within an inspector
- node detail subsection
- document pane view mode / selected pane subsection when that is a stable reusable UI concept

### Poor fits for `inspector_target`
- `wizard_step` as the primary object identity
- `message_id` when the real target is the message itself
- `line` / `range`
- raw provider/account disclosure fields
- arbitrary per-feature payload blobs

### Recommended normalization direction
- thread search hit:
  - `object_kind = message`
  - `object_id = <message_id>`
  - thread context stays in `thread_id`
- wizard resume:
  - `object_kind = wizard`
  - `object_id = <wizard_id>`
