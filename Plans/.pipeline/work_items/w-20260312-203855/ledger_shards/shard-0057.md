  - freshness, mutation-risk, or blocked-action preconditions
- `UI_Wiring_Rules.md` already treats `correlation_id` as part of the command envelope, but the matrix/schema pair has no way to declare or verify passthrough obligations for route payloads, subject IDs, or correlation continuity into downstream events.
- `Wiring_Matrix.md` still contains stale example drift that matters mechanically, not just editorially. The example row for `cmd.orchestrator.switch_tab` reinforces an older command shape even though the broader research already flagged that command family as a ghost/stale-ID risk.
- The addenda in `Wiring_Matrix.md` increasingly ask the matrix to cover runtime producers, blocked/recovery actions, and projection consumers, but the actual schema still models only UI element rows. The prose is now expecting more than `Wiring_Matrix.schema.json` can encode.
- As written, GATE-010 can reasonably verify handler coverage and event emission for one-off command dispatch, but it cannot strongly verify a generalized route/subject navigation system.

### Impacted docs
- Primary owners:
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/Wiring_Matrix.schema.json`
  - `Plans/UI_Command_Catalog.md`
- Cross-owner docs implicated by this seam:
  - `Plans/FileManager.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Progression_Gates.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- The wiring prose is drifting toward producer/consumer/runtime-trace coverage, while the machine-readable schema still only understands interactive-element dispatch rows.
- The matrix cannot encode whether a command is a canonical navigation primitive, a deprecated alias, or a surface wrapper over a shared route target.
- There is still no schema-level place to express argument-contract requirements for subject-open or route-payload commands.
- `correlation_id` is part of the canonical envelope in prose but not part of any matrix-verifiable passthrough requirement.
- GATE-010 currently cannot verify reusable navigation semantics strongly enough to act as a serious guardrail for the route/subject direction.

### Candidate fixes to carry forward
- Extend the wiring schema and rules with route-aware fields, likely along the lines of:
  - `command_arg_contract_ref?`
  - `route_target_kind?`
  - `subject_kind?`
  - `deprecated_alias_for?`
  - `preconditions?`
  - `arg_passthrough_requirements?`
  - `correlation_passthrough?`
- Tighten `UI_Wiring_Rules.md` so reusable navigation commands and subject-open commands are treated as first-class wiring shapes rather than smuggled through generic `args`.
- Clean stale/ghost command examples out of `Wiring_Matrix.md` before relying on it for automated extraction or coverage.
- Decide whether the matrix remains strictly UI-element wiring plus a separate producer/consumer matrix, or whether the schema is intentionally widened to cover both.

### Do-not-forget details
- This is not just a documentation nicety: current wiring artifacts are too weak to verify the navigation architecture the rewrite is converging toward.
- The matrix/schema mismatch is now the same kind of issue as earlier gate/evidence mismatches: prose is promising stronger guarantees than the machine-readable contract can support.
- If `cmd.nav.*` is adopted later, this seam will need reconciliation early, or the catalog/wiring/gate stack will drift immediately.

## Research Progress - 2026-03-16 - GATE-010 and evidence limits for route-aware wiring

### Targeted docs read
- `Plans/Progression_Gates.md`
- `Plans/evidence.schema.json`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Wiring_Matrix.md`

### Key findings
- `GATE-010` is still written around the original wiring model: schema validation, entry uniqueness, command coverage, handler resolution, expected-event tests, unknown-command rejection, and architectural lints.
- That is enough for a flat `element -> command -> handler` contract, but not for the route-aware/navigation-aware model the rewrite is moving toward.
- `GATE-010` has no explicit notion of:
  - subject-open commands
  - wrapper commands over a canonical navigation primitive
  - route-payload completeness
  - alias/deprecation handling
  - blocked-action admissibility tied to `allowed_action_ids[]`
  - stale/degraded projection revalidation requirements before mutation
- The evidence side is similarly underspecified. `Plans/evidence.schema.json` only gives a generic `checks[]` array with `name`, `result`, `details`, and optional `contract_refs`. That is too weak to carry structured route-aware verification outcomes without each check inventing its own ad hoc text.
- This means the docs currently describe stronger verifiability than the gate/evidence contracts can actually support once navigation ceases to be a set of one-off command handlers.
- There is also a pattern mismatch with later gates: `GATE-011` and `GATE-012` already want machine-readable failure arrays for specific conditions, while `GATE-010` still relies on broad generic check rows.

### Impacted docs
- Primary owners:
  - `Plans/Progression_Gates.md`
  - `Plans/evidence.schema.json`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Wiring_Matrix.schema.json`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/FileManager.md`
  - `Plans/Decision_Policy.md`

### Contradictions / gaps surfaced
- `GATE-010` claims the wiring matrix is “complete, valid, and testable,” but completeness is currently defined too narrowly for route/subject-aware navigation.
- The evidence schema cannot cleanly encode route-payload mismatch reports, alias/deprecation findings, or passthrough/correlation failures in a stable machine-readable form.
- The gate stack is inconsistent about structured failure detail: some later gates demand named machine-readable arrays, but `GATE-010` still has only freeform `details`.
- There is still no canonical gate-level place to express revalidation obligations when UI actions depend on stale or degraded projections.

### Candidate fixes to carry forward
- Expand `GATE-010` so route-aware verification is first-class if `cmd.nav.*` / `OpenSubject` becomes canonical, including checks for:
  - subject/route arg completeness
  - wrapper-to-canonical navigation consistency
  - deprecated alias coverage
  - correlation/route payload passthrough
  - blocked-action admissibility and projection-trust preconditions where relevant
- Either extend `Plans/evidence.schema.json` with structured gate-specific detail blocks, or add a dedicated wiring-evidence schema for richer machine-readable results.
- Align `GATE-010` with the machine-readable-detail pattern already used by `GATE-011` / `GATE-012` instead of relying on text-heavy `details`.
- Decide whether route-aware verification remains part of `GATE-010` or becomes a sibling gate, but stop leaving that boundary implicit.

### Do-not-forget details
- This is now the gate-side version of the same drift pattern seen in the matrix/schema seam: the prose is expanding faster than the verifiable contract.
- If route-aware navigation becomes canonical, keeping `GATE-010` unchanged will make the strongest navigation rules effectively unenforced.
- The `allowed_action_ids[]` and stale/degraded revalidation issues are not just runtime concerns; they also need a verification home.

## Research Progress - 2026-03-16 - Command catalog wrapper/alias gap for navigation

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Commands_System.md`
- `Plans/Contracts_V0.md`

### Key findings
- `UI_Command_Catalog.md` already contains several navigation-like or cross-surface commands:
  - `cmd.artifacts.show_in_ledger`
  - `cmd.artifacts.show_in_usage`
  - `cmd.orchestrator.open_in_source_control`
  - `cmd.orchestrator.open_in_github_actions`
  - `cmd.orchestrator.open_in_docker_manager`
  - `cmd.panel.switch`
- But the catalog still models them as flat peer commands with ad hoc payload tables. There is no stronger notion of:
  - canonical navigation primitive
  - surface-specific wrapper command
  - deprecated alias/wrapper relationship
  - shared route-payload contract
  - shared subject-open/open-by-identity contract
- The document does have some migration vocabulary in isolated places, for example superseded chat usage commands and deprecated recovery namespaces, and `Contracts_V0.md` has explicit alias handling for several runtime events. But that migration/alias discipline has not been elevated into a general command-catalog pattern.
- Because of that, navigation semantics are drifting into prose notes and payload examples instead of being normalized the way event aliasing already is elsewhere.
- `Commands_System.md` is useful mainly as a boundary reminder: user-authored slash/palette commands are a separate concept. The current gap is inside internal `UICommand` modeling, not user command presets.

### Impacted docs
- Primary owners:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
- Cross-owner docs implicated by this seam:
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/FileManager.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- Event contracts already have a recognizable alias/migration pattern, but command contracts do not.
- The catalog can list payload keys, but it cannot currently say whether two commands are different user-facing wrappers over one canonical route target.
- There is still no canonical command family for subject-open or generalized route focus, so cross-surface pivots keep accreting as one-off commands.
- Navigation-related commands are described as layout/UI-state only, but the docs still lack a shared rule for when those commands must carry `project_id`, `focused_run_id`, `thread_id`, or other context needed to restore scope correctly.

### Candidate fixes to carry forward
- Add an explicit command-catalog pattern for:
  - canonical command
  - wrapper command
  - deprecated alias
  - migration rule
- If the route/subject model stays on track, introduce a small canonical family such as `cmd.nav.*` and let surface-specific commands either wrap it or be declared as typed specializations.
- Reuse the event-side alias discipline from `Contracts_V0.md` as the template for command deprecation/migration rules rather than inventing a weaker prose-only pattern.
- Make shared navigation context fields explicit at the catalog level instead of burying them in per-command notes.

### Do-not-forget details
- The command catalog is not hostile to the new navigation model, but it is still too flat to describe it cleanly.
- The strongest comparison point is event aliasing: that discipline already exists and can be copied.
- Without a wrapper/alias model, the catalog, wiring matrix, and route payload work will keep diverging independently.

## Research Progress - 2026-03-16 - Storage/routing handshake for subject-open and preview identity

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/FinalGUISpec.md`

### Key findings
- `storage-plan.md` is already substantially ahead of the routing docs on subject identity. It defines:
  - `preview_subject_id = doc:<document_id>` or `artifact:<artifact_id>`
  - project-scoped preview state keyed by that subject
  - deterministic restore from either `document_id` or `artifact_id`
  - artifact-backed reopen into transient `generated://<artifact_id>` buffers when there is no backing document yet
- `FinalGUISpec.md` aligns with that newer model in the embedded document pane:
  - workspace-backed documents use `doc:<document_id>`
  - planning drafts and unsaved/generated content use `artifact:<artifact_id>`
  - artifact-backed content may open source in transient `generated://<artifact_id>` buffers
- `FileManager.md` is now the main lagging owner. It still presents `OpenFile { path... }` as the single internal open contract for all callers, which is correct for real workspace files but no longer sufficient for generated/runtime/preview-backed subjects.
- `Runtime_Artifacts_Panel.md` also confirms that artifact surfaces are identity-native and project-scoped, but it still does not fully own the open-resolution path. It references File Manager for open-by-artifact identity, which means the open contract boundary is still under-specified.
- The clean architectural split now looks stronger:
  - canonical persisted subject identity = `doc:<document_id>` / `artifact:<artifact_id>`
  - transient source realization = workspace `path` or `generated://<artifact_id>`
  - routing should target the subject identity first, then resolve to the best openable representation
- `generated://<artifact_id>` should remain an ephemeral source buffer transport, not become the canonical persisted identity. The canonical identity is still `artifact:<artifact_id>`.

### Impacted docs
- Primary owners:
  - `Plans/storage-plan.md`
  - `Plans/FileManager.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Runtime_Artifacts_Panel.md`
- Cross-owner docs implicated by this seam:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Project_Output_Artifacts.md`

### Contradictions / gaps surfaced
- The storage/UI model already admits identity-native preview subjects, but the universal open contract in `FileManager.md` still assumes everything meaningful is a path.
- Artifact-backed open/restore behavior exists in storage and GUI prose, but there is no single owner doc that clearly says the resolution order is `subject_id -> backing document or transient generated buffer -> routed surface`.
- `Runtime_Artifacts_Panel.md` depends on artifact identity opens without fully owning the resolver contract, so the open-by-identity behavior still risks being re-invented per surface.
