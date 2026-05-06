  - `execution_role?`
  - `provider_attempt_ref?`
  - `usage_event_ref?`
- routing / side-effect linkage:
  - `repo_id?`
  - `worktree_id?`
  - `branch_ref?`
  - `workflow_refs?`
  - `docker_refs?`
  - `kubernetes_refs?`
  - `operational_identity?`
- artifact payload metadata:
  - `created_at_utc`
  - `summary?`
  - `detail_ref?`
  - `content_ref?`
  - `source_surface?`

### Recommended contract rule
- the runtime-artifact envelope should be attempt-native by default.
- `artifact_id` is the canonical identity of the renderable artifact object itself.
- `logical_artifact_id` and `linked_artifact_id` are lineage/navigation helpers, not replacements for runtime identity.
- `attempt_id` should be present whenever the artifact came from a concrete execution attempt.
- if there is no concrete attempt, the envelope should still carry the strongest available runtime anchor:
  - `thread_id` for thread-only artifacts
  - wizard/report identity for upstream planning artifacts if those are ever surfaced here

### Recommended family behavior
- `cost_usage`
  - must carry `usage_event_ref` whenever available
  - should also carry `attempt_id?` and `provider_attempt_ref?` when traceable
- `tool_llm_trace`
  - should carry `attempt_id?`, `provider_attempt_ref?`, and `execution_role?`
- `evidence`, `validation_test`, `failed_attempts`, `before_after_snapshot`
  - should be attempt-native whenever produced by a node worker/verifier/reviewer flow
- receipt-like artifacts
  - should carry external linkage refs but still anchor locally on `attempt_id`

### File/open implications
- FileManager’s future `OpenArtifact`-style flow should resolve by:
  - `artifact_id` for the artifact object
  - then through envelope refs to:
    - `content_ref`
    - related runtime attempt/evidence lineage
    - related Source Control / GitHub / Docker / Kubernetes surface when relevant
- that means the envelope, not ad hoc UI glue, should hold the minimum openable routing fields

### Impacted docs
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/storage-plan.md`
- `Plans/FileManager.md`
- `Plans/Contracts_V0.md`
- `Plans/Project_Output_Artifacts.md`

### Contradictions / gaps surfaced
- `Runtime_Artifacts_Panel.md` calls `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, and `logical_artifact_id` the canonical ID set, but that set is still missing the attempt-native/runtime attribution fields the rest of the rewrite now depends on.
- the docs still use `task_id` language in the artifact packet even though wider execution identity is moving toward node/package/seam/lane-native structures.
- `FileManager.md` needs stable identity and open-by-identity semantics, but the artifact docs still do not define enough envelope routing data to support that cleanly.
- `Contracts_V0.md` explicitly declines to define runtime-artifact payloads, which is fine, but some owner doc still needs to define the common envelope strongly enough that per-type schemas do not drift.

### Candidate fixes to carry forward
- Promote the runtime-artifact envelope from a named schema file to a clearly stated common field contract in `Runtime_Artifacts_Panel.md`.
- Make the envelope explicitly attempt-native and bridge-aware.
- Treat `task_id` as legacy/compatibility display metadata where necessary, not the main execution anchor.
- Align FileManager open-by-identity requirements with the runtime-artifact envelope rather than inventing a parallel artifact-opening identity model.

### Do-not-forget details
- The missing piece is no longer “we need schemas”; it is “the common envelope contract is underspecified.”
- `artifact_id` should identify the artifact object, not the runtime attempt.
- runtime-artifact and project-artifact families are staying distinct, but they now need parallel discipline about canonical versus derived identity.

## Research Progress - 2026-03-16 - FileManager open-by-identity contract split

### Targeted docs read
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/storage-plan.md`
- spot-checks against `Plans/Orchestrator_Page.md` and `Plans/usage-feature.md`

### Key findings
- `FileManager.md` still states one canonical open contract:
  - `OpenFile { path: PathBuf, line?, range?, target_group? }`
- But its later addenda already require a second category of opens:
  - attempt-scoped evidence by `attempt_id`
  - safe-point manifests / restore logs by `safe_point_id`
  - remediation lineage summaries by `remediation_root_id`
  - generated non-repo drafts
  - runtime artifacts by `artifact_id`
- That means the docs have already outgrown a path-only open contract, even though the main body still acts as if all opens resolve to a workspace file path first.
- `storage-plan.md` already gives a strong related pattern through preview identity:
  - `preview_subject_id = doc:<document_id> | artifact:<artifact_id>`
  - artifact-backed restore opens `generated://<artifact_id>` unless a backing document exists
- That preview contract is effectively the model FileManager now wants more broadly.

### Recommended contract split
- keep `OpenFile { path... }` for canonical workspace-file opens
- add a second canonical open contract for identity-native objects, e.g.:
  - `OpenSubject { subject_id, target_group?, open_mode?, location? }`

### Recommended `OpenSubject` identity families
- document/file-backed:
  - `doc:<document_id>`
  - resolves to canonical workspace file/buffer
- artifact-backed:
  - `artifact:<artifact_id>`
  - resolves to:
    - backing document when present, or
    - transient `generated://<artifact_id>` buffer / artifact viewer
- runtime lineage:
  - `attempt:<attempt_id>`
  - `safe_point:<safe_point_id>`
  - `remediation:<remediation_root_id>`
  - `scheduler_pass:<scheduler_pass_id>`
  - these resolve through projections/indexes to the strongest openable target:
    - artifact/document/report
    - detail record
    - generated buffer
    - related surface pivot when file-open is not the right UX

### Recommended behavior rule
- path-based open remains for repo/workspace files
- identity-based open is the canonical entrypoint for:
  - runtime artifacts
  - generated drafts
  - attempt/evidence/safe-point/remediation reports
  - preview/document hybrids
- UI callers should not reconstruct file paths heuristically when a stable identity exists

### Recommended resolution order for identity opens
- resolve subject type
- if file-backed canonical document exists:
  - open/focus workspace buffer
- else if artifact-backed content exists:
  - open transient `generated://...` or specialized viewer
- else if the best target is another surface:
  - route to that surface with exact identity context preserved
- if no valid target exists:
  - fail explicitly with a typed open error, not silent fallback

### Why this matters
- it prevents runtime artifacts from being forced through fake repo paths
- it keeps attempt/safe-point/remediation opens stable across cleanup/archive/remove flows
- it lets FileManager/editor/Artifacts/Orchestrator share one identity model instead of ad hoc open handlers

### Impacted docs
- `Plans/FileManager.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Orchestrator_Page.md`
- likely routing owner:
  - `Plans/Contracts_V0.md`

### Contradictions / gaps surfaced
- `FileManager.md` still describes one internal open-file contract while its own runtime-artifact addendum already requires identity-native opens that cannot be expressed as safe path opens.
- there is currently no canonical `OpenArtifact`/`OpenSubject` contract even though multiple docs implicitly need it.
- `generated://<artifact_id>` exists in preview restore behavior, but that identity pattern has not yet been generalized for other artifact/report opens.
- current “Open in Editor” wording in Orchestrator/Evidence surfaces risks implying raw-path opens even when the correct target is an artifact-backed or report-backed subject.

### Candidate fixes to carry forward
- Split FileManager’s canonical open contract into:
  - workspace path open
  - identity-native subject open
- Reuse the preview subject identity pattern (`doc:` / `artifact:`) as the base instead of inventing a separate parallel scheme.
- Let runtime lineage IDs resolve through indexes/projections to the best openable target rather than forcing every caller to know file paths.
- Update surface copy to distinguish:
  - `Open in Editor` for file/document-backed targets
  - `Open Artifact` / `Open Report` / routed open when the target is identity-native

### Do-not-forget details
- The real seam is no longer “path vs not path”; it is “workspace document open vs subject/identity open.”
- `generated://<artifact_id>` is already the proof that the system needs non-path editor targets.
- This seam now looks tightly connected to routing/deep-link normalization, not just FileManager UX.

## Research Progress - 2026-03-16 - Routing/deep-link normalization with `OpenSubject`

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Commands_System.md`
- `Plans/assistant-chat-design.md`
- `Plans/FinalGUISpec.md`
- spot-checks against `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/usage-feature.md`

### Key findings
- The routing model is now split across at least four partially overlapping mechanisms:
  - `resume_url`
  - command IDs plus ad hoc args
  - deep links from artifacts/usage/search
  - the file-open contract in `FinalGUISpec.md`
- `FinalGUISpec.md` still states one unified `OpenFile { path... }` contract for all file-open actions across the app.
- But wizard/attention flows already use exact deep links via `resume_url`, and Usage/artifact surfaces already imply identity-native jumps using `usage_event_ref` and related canonical refs.
- `UI_Command_Catalog.md` is mostly action-oriented, not target-model-oriented. It has strong runtime action IDs, but no generalized subject-open/routing payload family.
- `assistant-chat-design.md` already expects jump-to-message, canonical runtime action routing, and persistence of `resume_url?` on blocked notices. That is closer to object-first routing than to path-first opening.

### Recommended routing model
- define one canonical internal route/target payload for navigation
- `resume_url` should be one serialized transport form of that payload
- command palette, search, artifact deep-links, blocked notices, and FileManager/Editor opens should all resolve through the same internal target model

### Recommended target split
- path-based target:
