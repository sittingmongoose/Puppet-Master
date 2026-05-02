- Strongly implicated adjacent docs:
  - `Plans/Crosswalk.md`
  - `Plans/FileManager.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/usage-feature.md`

### Contradictions / gaps surfaced
- `FileManager.md` still makes `OpenFile` look like the universal open/navigation primitive.
- `FinalGUISpec.md` and adjacent docs already contain enough `doc:` / `artifact:` / `generated://` concepts to imply `OpenSubject`, but there is still no owner contract stating that split directly.
- `resume_url` is currently described as a deep link that restores exact app context, but no owner doc states that it serializes route identity rather than source-open identity.
- Without this separation, later docs could wrongly stuff source-buffer realization details into `route_target`, or shell/destination semantics into `OpenSubject`.

### Candidate fixes to carry forward
- Define `route_target` as the canonical navigation-and-focus contract.
- Define `OpenSubject` as the canonical identity-native source-open contract.
- Keep `OpenFile` as the path-based editor contract only.
- State the resolution chain directly:
  - `route_target` may land on a surface that then invokes `OpenSubject`
  - `OpenSubject` may resolve to `OpenFile`
  - `OpenSubject` may resolve to a transient `generated://<artifact_id>` source buffer
- Keep `subject_id` canonical and stable:
  - `doc:<document_id>`
  - `artifact:<artifact_id>`
- Keep `generated://<artifact_id>` as a transport/open realization, not as the canonical subject identity.

### Do-not-forget details
- The three contracts are now distinct:
  - `route_target` = navigation
  - `OpenSubject` = identity-native source open
  - `OpenFile` = path-based editor open
- If `route_target` starts carrying source-buffer realization details, it will bloat.
- If `OpenSubject` starts carrying panel/tab/shell destination semantics, it will collapse back into a second route contract.

## Research Progress - 2026-03-17 - Exact minimum field set for `OpenSubject`

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/FileManager.md`
- `Plans/assistant-chat-design.md`
- `Plans/Runtime_Artifacts_Panel.md`

### Key findings
- `OpenSubject` needs a minimal field set.
- The canonical minimum is:
  - `subject_id`
  - `open_intent`
- `subject_id` is the canonical identity:
  - `doc:<document_id>`
  - `artifact:<artifact_id>`
- `open_intent` is the caller’s direct purpose for opening the subject. It belongs to the subject-open contract because the same subject can be opened as source, preview, or review entry.
- `OpenSubject` does not carry:
  - `project_id`
  - `thread_id`
  - `run_id`
  - `tab_id`
  - `panel_id`
  - `inspector_target`
  - `origin_surface`
  - `source_kind`
  - `backing_document_id`
  - `last_saved_path`
  - `generated://<artifact_id>`
  - preview persistence state
  - transport mode
- Those fields belong elsewhere:
  - shell and scope belong to `route_target`
  - persistence/provenance belong to storage records and projections
  - transport/open realization belongs to the resolver that executes `OpenSubject`
- The clean intent vocabulary is:
  - `open_source`
  - `open_preview`
  - `open_review`
- `generated://<artifact_id>` is not a subject field. It is a resolved source transport chosen by the `OpenSubject` executor when an artifact subject has no workspace-backed document.
- `backing_document_id` is not an `OpenSubject` field. It is resolver/storage data used to decide whether an artifact subject opens a real document or a transient generated buffer.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/storage-plan.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/FileManager.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- Downstream docs already imply several subject-open intents, but there is still no owner contract that states the minimum shape directly.
- `storage-plan.md` contains resolver-supporting metadata such as `backing_document_id`, `source_kind`, and `last_saved_path`, but those are not part of the canonical open contract.
- `FileManager.md` still centers path open strongly enough that downstream readers can misread all source opening as `OpenFile`.
- `assistant-chat-design.md` and `FinalGUISpec.md` already treat `open_source` as a real action, but the action still lacks a contract owner.

### Candidate fixes to carry forward
- Define `OpenSubject` in `Contracts_V0.md` with:
  - `subject_id`
  - `open_intent`
- Keep the intent vocabulary controlled and small.
- Keep resolver-support metadata out of the contract.
- State the resolution rule directly:
  - `OpenSubject(subject_id = doc:...)` resolves to workspace-backed source opening
  - `OpenSubject(subject_id = artifact:...)` resolves to real document source if one exists
  - otherwise it resolves to transient `generated://<artifact_id>` source opening
- Keep shell/scope routing separate:
  - if a caller needs navigation context, it uses `route_target`
  - if a caller needs subject opening, it uses `OpenSubject`

### Do-not-forget details
- `OpenSubject` is identity plus open intent.
- It is not storage metadata.
- It is not shell routing.
- It is not transport detail.

## Research Progress - 2026-03-17 - Exact minimum field set for `route_target`

### Targeted docs read
- `Plans/.pipeline/work_items/w-20260312-203855/working_ledger.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The earlier `route_target` direction remains correct and now needs firmer closure.
- The canonical minimum field set is:
  - `target_kind`
  - `project_id`
  - one canonical target selector:
    - `subject_id`
    - or `object_kind` + `object_id`
- The narrow scope-restoration fields are:
  - `focused_run_id`
  - `thread_id`
- The narrow focus-refinement fields are:
  - `tab_id`
  - `inspector_target`
- That gives the full bounded shape:
  - `target_kind`
  - `project_id`
  - `focused_run_id`
  - `thread_id`
  - `tab_id`
  - `subject_id`
  - `object_kind`
  - `object_id`
  - `inspector_target`
- Rule:
  - `project_id` is required
  - exactly one canonical target selector is required:
    - `subject_id`
    - or `object_kind` + `object_id`
- `target_kind` is required because the route layer still needs to know what class of destination it is restoring, rather than infer everything from object identity.
- `focused_run_id` and `thread_id` remain route fields because they are scope restorers, not just object metadata.
- `tab_id` remains allowed because top-level tab restoration is part of route/focus behavior.
- `inspector_target` remains allowed because it is a reusable detail-focus field rather than per-surface noise.

### What is NOT a base `route_target` field
- `usage_event_ref`
- `wizard_id`
- `wizard_step`
- `message_id`
- `artifact_id`
- `document_id`
- `workflow_run_id`
- `scheduler_pass_id`
- `safe_point_id`
- `remediation_root_id`
- `line`
- `range`
- per-surface state such as:
  - `active_subview`
  - compare target
  - panel layout
  - browser tab state
  - widget layout

### Why these stay out
- `artifact_id` and `document_id` normalize into `subject_id`.
- `wizard_id`, `message_id`, `scheduler_pass_id`, `safe_point_id`, `remediation_root_id`, and similar identities normalize into `object_kind/object_id`.
- `usage_event_ref` should normalize into a stable `usage_event` object identity rather than remain a top-level special-case field.
- `wizard_step` is sub-selection, not base route identity. It belongs in serialized deep-link detail or another narrower subtarget contract.
- `line` and `range` belong to `OpenFile`, not to `route_target`.
- surface-local state belongs to persisted shell/view state, not to canonical route identity.

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
- Strongly implicated adjacent docs:
  - `Plans/Crosswalk.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/storage-plan.md`
  - `Plans/usage-feature.md`

### Contradictions / gaps surfaced
- Several downstream docs still imply special-case top-level fields such as `usage_event_ref`, `wizard_step`, or direct artifact/document IDs in navigation flows.
- `resume_url` flows are still more concrete than the general route contract, which continues to encourage one-off field choices downstream.
- `UI_Command_Catalog.md` still presents many navigation commands with ad hoc payload shapes that should eventually normalize into this bounded field set.

