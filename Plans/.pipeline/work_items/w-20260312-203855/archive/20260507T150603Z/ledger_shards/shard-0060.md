- The docs already know what fields matter; they just do not normalize them yet.
- Once normalized, Dashboard, thread badges, and blocked notices should stop behaving like separate navigation systems.

## Research Progress - 2026-03-16 - Crosswalk still lacks route-target / subject-open ownership

### Targeted docs read
- `Plans/Crosswalk.md`
- `Plans/Contracts_V0.md`
- `Plans/FileManager.md`
- `Plans/storage-plan.md`

### Key findings
- `Crosswalk.md` explicitly owns a number of neighboring primitives:
  - `Primitive:UICommand`
  - `Primitive:DocumentPane`
  - `Primitive:DocumentReviewSurface`
  - `Primitive:DocumentCheckpoint`
- But it still has no primitive for:
  - route target / internal navigation payload
  - subject-open / open-by-identity
- That omission now explains a lot of the drift:
  - `Contracts_V0.md` owns only a thin `UICommand` envelope
  - `FileManager.md` over-claims with `OpenFile { path... }`
  - `storage-plan.md` owns subject identity for preview/doc/artifact restore
  - surface docs keep inventing local navigation semantics on top
- The likely stable ownership split now looks much clearer:
  - `Crosswalk.md`: introduces routing primitives and owner boundaries
  - `Contracts_V0.md`: owns canonical route-target / subject-open contract shapes
  - `storage-plan.md`: owns persisted subject identity and restore/projection joins
  - `FileManager.md`: owns workspace-file open semantics and editor realization only
  - consumer docs: only describe how their surfaces use the shared primitives

### Impacted docs
- Primary owners:
  - `Plans/Crosswalk.md`
  - `Plans/Contracts_V0.md`
  - `Plans/FileManager.md`
  - `Plans/storage-plan.md`
- Cross-owner docs implicated by this seam:
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- The Crosswalk is supposed to prevent exactly this kind of ownership drift, but currently leaves the route/subject problem unclaimed.
- Neighboring primitives are already fragmented because no owner doc says where route payloads stop, where subject identity starts, and where file-path opening is merely one realization.
- `OpenFile` is currently acting like a surrogate navigation primitive because the real primitive has no owner.

### Candidate fixes to carry forward
- Add a new Crosswalk primitive for route-target navigation and likely another for subject-open/open-by-identity, or make one primitive explicitly cover both layers if kept tight.
- Make `Contracts_V0.md` the concrete shape owner for those primitives.
- Narrow `FileManager.md` to consumer/realization ownership:
  - file-backed document opening
  - editor/tab/buffer behavior
  - path validation and path-target open behavior
- Keep `storage-plan.md` as the owner of persisted subject identity, projector-derived joins, and restore semantics.

### Do-not-forget details
- This is one of the most actionable owner fixes found in this routing tranche.
- The conceptual work is largely done; the missing piece is declaring the owner split in the docs that are supposed to stop duplication.
- If Crosswalk does not absorb this, future reconciliation will likely keep slipping back into per-surface local routing prose.

## Research Progress - 2026-03-16 - Exact primitive shape: layered route-target plus specialized open contracts

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/FileManager.md`
- `Plans/storage-plan.md`

### Key findings
- The nearby owner docs point toward a layered design, not a single monolithic “open/navigation” contract.
- `Contracts_V0.md` already wants a small reusable command envelope, which argues for a shared target object under `UICommand.args` rather than every command inventing its own payload.
- `FileManager.md` still legitimately needs a path-based `OpenFile { path... }` contract for real workspace documents.
- `storage-plan.md` already owns subject identity (`doc:<document_id>`, `artifact:<artifact_id>`) and restore rules, which argues for an identity-native contract above path opening, not a replacement of path opening.
- The clean answer is:
  - one shared canonical `route_target` object
  - specialized operations that consume it, especially:
    - `OpenSubject`
    - `OpenFile`
    - focus/open wrapper commands in `cmd.nav.*`
- So the best model is not “two unrelated contracts” and not “one giant contract that does everything.” It is a layered contract family.

### Recommended shape
- `route_target`
  - canonical target/scope object used by navigation/open/focus actions
  - likely fields:
    - `target_kind`
    - `project_id?`
    - `focused_run_id?`
    - `thread_id?`
    - `tab_id?`
    - `object_kind?`
    - `object_id?`
    - `subject_id?`
    - `usage_event_ref?`
    - `inspector_target?`
    - `line?`
    - `range?`
- `OpenSubject`
  - identity-native open contract
  - `subject_id` required
  - resolves through canonical subject/open rules
  - may realize as workspace document, transient `generated://` buffer, or routed non-editor surface
- `OpenFile`
  - workspace-path contract only
  - remains the right tool for real file opens and code-navigation clicks when a canonical workspace path is already known
- `resume_url`
  - serialized transport form of `route_target`, not a stronger parallel primitive

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/FileManager.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- `OpenFile` is currently overextended because the shared `route_target` / `OpenSubject` layer does not exist yet.
- `UICommand.args` is too generic to express reusable navigation semantics without a normalized target object.
- `resume_url` still risks becoming the de facto stronger contract until the layered model is declared canonically.

### Candidate fixes to carry forward
- Add `Primitive:RouteTarget` and likely `Primitive:OpenSubject` to `Crosswalk.md`.
- Add concrete `route_target` and `OpenSubject` shapes to `Contracts_V0.md`.
- Narrow `FileManager.md` so `OpenFile` is explicitly a workspace-document path operation, not the universal object-open primitive.
- Use `cmd.nav.*` or equivalent wrappers to route through `route_target` without forcing every consumer doc to restate the model.

### Do-not-forget details
- The important recommendation here is the layering:
  - shared target object
  - specialized open/navigation verbs above it
  - path-open as one specialization, not the only primitive
- This should let current docs reconcile incrementally instead of forcing a single disruptive replacement of every existing open/navigation rule.

## Research Progress - 2026-03-16 - Minimum canonical field set for `route_target`

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/storage-plan.md`

### Key findings
- The app already uses many identifiers in navigation payloads, but most of them should not become top-level canonical `route_target` fields.
- If `route_target` simply absorbs every current surface-local field (`artifact_id`, `usage_event_ref`, `wizard_step`, `message_id`, `workflow_run_id`, etc.), it will recreate the same drift problem in a new place.
- The stricter direction is:
  - keep the canonical target object small
  - normalize most specific targets into either:
    - `subject_id`
    - `object_kind` + `object_id`
  - keep path/line/range outside the base target object or in specialized open contracts
- This means many existing ad hoc payloads should collapse into a smaller vocabulary rather than being copied verbatim into the new contract.

### Recommended minimum field set
- Required:
  - `target_kind`
- Common scope fields:
  - `project_id?`
  - `focused_run_id?`
  - `thread_id?`
  - `tab_id?`
- Canonical target selector:
  - `subject_id?`
  - or `object_kind?` + `object_id?`
- Optional view/detail selector:
  - `inspector_target?`

### What should NOT be base `route_target` fields by default
- `artifact_id`
- `document_id`
- `usage_event_ref`
- `wizard_id`
- `wizard_step`
- `message_id`
- `workflow_run_id`
- `scheduler_pass_id`
- `safe_point_id`
- `remediation_root_id`
- `line`
- `range`

These should normally normalize into:
- `subject_id`
- `object_kind` + `object_id`
- specialized operation payloads (`OpenFile`, `OpenSubject`, or object-specific commands)
- `inspector_target` only when the field is really a detail-pane selection, not the main identity

### Example normalization direction
- artifact deep-link:
  - `subject_id = artifact:<artifact_id>`
