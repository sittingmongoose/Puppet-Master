- Let object identity and scope pick the thing to show; let destination pick the major surface class; let shell state handle the rest.
- Keep page-tab and panel-subview resolution as destination-layer concepts, not core identity concepts.

### Do-not-forget details
- The route model needs destination intent, but only at the coarse-surface level.
- This is how the model stays useful for cross-surface pivots without becoming a mirror of the whole shell implementation.
- Orchestrator tab routing and side-panel routing both fit cleanly once this coarse vocabulary is recognized explicitly.

## Research Progress - 2026-03-16 - Subviews and panel-local selectors belong to view state, not target identity

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`

### Key findings
- Several major surfaces carry their own persisted subview/selection state:
  - Source Control: `active_subview`, selected repo/worktree, compare target, graph filters
  - GitHub Actions: `active_subview`, current branch, pinned workflows, last opened run/job
  - Docker Manager: `active_subview`, runtime/context/registry/namespace focus, publish state
  - Document pane: selected document, selected view, history selection, approval stage
- Those are real and useful, but they are not the same thing as canonical route identity.
- The clean routing rule is:
  - destination surface may indicate the user should land in `source_control`, `github_actions`, `docker_manager`, or `document_pane`
  - panel-local subviews/selectors then refine the landing inside that destination
  - persisted surface state continues to supply defaults when the route does not override them
- This means `active_subview` and similar fields belong to destination/view-state handling, not to `object_kind`, `subject_id`, or the base route identity contract.

### Impacted docs
- Primary owners:
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Contracts_V0.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Crosswalk.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- Some current commands still package destination selection and panel-local state together as if they were one concept.
- The docs do not yet clearly say when route activation should override a remembered subview versus reuse the current/persisted one.
- Without this rule, route payloads risk absorbing filter/subview noise and becoming surface-shaped again.

### Candidate fixes to carry forward
- Keep `active_subview`, filters, compare targets, pinned selections, and similar fields in destination/view-state contracts.
- Let routes optionally name a destination-local subview only when that is necessary for the task, but treat it as destination refinement, not base identity.
- Reuse persisted project/surface state when the route does not specify a destination-local override.

### Do-not-forget details
- This is the panel/subview analogue of the earlier shell-state boundary.
- The route model should be able to land a user in `Source Control` without becoming a full serialized `source_control.project_state`.
- Destination-local refinement is real, but it is one layer down from canonical target identity.

## Research Progress - 2026-03-16 - Override rule: route-target should override only what is necessary

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- `Plans/assistant-chat-design.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The shell already persists substantial per-project state and is supposed to restore it consistently.
- At the same time, several route actions clearly need to force a change in destination context:
  - `Show in Usage`
  - `Open in Source Control`
  - `Resume Wizard`
  - `focus_thread_usage`
  - `View in Usage` from Orchestrator Ledger
- The clean rule is:
  - route activation overrides remembered state only when required to satisfy the requested destination/object/context
  - otherwise it should reuse persisted shell state and local destination defaults

### Recommended override policy
- MUST override:
  - target object identity
  - destination surface when the action explicitly names a different surface
  - scope required to make the target meaningful, such as `project_id`, `thread_id`, `focused_run_id`, or an explicitly requested panel/tab
- MAY reuse persisted state for:
  - panel docking/floating realization
  - destination-local subview when not specified by the route
  - local filters/sort/layout where they do not hide or distort the requested target
- MUST NOT reuse persisted state when doing so would:
  - land on the wrong object
  - hide the requested target behind the wrong tab/subview
  - silently keep the user on a stale run/thread/project context

### Concrete examples
- `cmd.artifacts.show_in_usage`
  - must open/focus Usage in the correct project/thread/run scope
  - may reuse current Usage layout/filter chrome if it still reveals the requested usage target
- `cmd.orchestrator.open_in_source_control`
  - must land in Source Control with the relevant run/worktree/repo context available
  - may reuse remembered Source Control subview only if it still exposes the requested target clearly
- `Resume Wizard`
  - must override to the wizard surface and the correct wizard/step context
  - must not preserve unrelated current primary-view context just because it was last open
- `cmd.chat.focus_thread_usage`
  - must focus the thread Usage detail surface for that thread
  - may reuse side-panel docking/floating realization

### Impacted docs
- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
- Cross-owner docs implicated by this seam:
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- Current docs imply the right behavior locally, but there is still no general override rule shared across routing consumers.
- Without this rule, implementers could legitimately choose either “always restore old shell state” or “always hard-reset the destination,” and both would look superficially consistent.

### Candidate fixes to carry forward
- Add a shared route-activation override rule in the contract/GUI owner docs.
- Make destination-local state reuse conditional on not obscuring the requested target.
- Use this same rule across search, artifacts, Usage, attention/CtA cards, and cross-surface pivots.

### Do-not-forget details
- This seam is about predictability.
- The route model should be precise enough to get the user where they asked to go, but restrained enough not to trash unrelated remembered shell state.
- “Override only what is necessary” is the practical rule that ties the routing and shell-state work together.

## Research Progress - 2026-03-16 - Opus final Gemini-only tranche synthesis

### Targeted docs read
- `Plans/BinaryLocator_Spec.md`
- `Plans/DRY_Rules.md`
- `Plans/Decision_Log.md`
- `Plans/Formatters_System.md`
- `Plans/OpenCode_Coverage_Matrix.md`
- `Plans/Plugins_System.md`
- `Plans/Skills_System.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/rewrite-tie-in-memo.md`

### Key findings
- The last Gemini-only docs were not cleanup residue. They still exposed important structural drift, especially where older reference/index/spec docs silently shape downstream understanding.
- Rewrite summary / index / inventory docs are lagging hard enough to misroute future reconciliation work:
  - `Decision_Log.md` is functionally empty for the rewrite era and does not capture major accepted design decisions already present in working memory and downstream addenda.
  - `rewrite-tie-in-memo.md` is itself now stale as a rewrite-alignment owner because it predates seams/packages/lanes/overseers, scopes requested/effective identity too narrowly, and does not surface projection-trust or lane scheduling as rewrite invariants.
  - `feature-list.md` and `newfeatures.md` still carry tier-era execution framing, old widget inventories, stale shell terminology, and promoted-feature phasing contradictions that would actively mislead implementation readers.
- Several support-system SSOTs still hide meaningful runtime and safety gaps:
  - `Formatters_System.md` has unresolved ownership splits with LSP formatting, under-specified DAE behavior, custom formatter subprocess/FileSafe bypass risk, and unregistered `format.*` events.
  - `Plugins_System.md` still has a severe hook/schema split, missing `mutation_capable` on plugin tools, in-process execution ambiguity vs subprocess-sandbox expectations, and prompt/param hooks that can bypass run-mode safety assumptions.
  - `Skills_System.md` still assumes HTE-style tool reachability, does not explain DAE delivery/bundling behavior, and lacks a proper introspection/listing surface for runtime skills.
- Audit/governance meta-docs now show their own integrity failures:
  - `DRY_Rules.md` cross-checking surfaced exact duplicate and mislabeled sections in owner docs, showing that stale/additive layering has become a mechanical doc-integrity issue rather than just a conceptual one.
  - `OpenCode_Coverage_Matrix.md` is no longer broad enough to audit current rewrite concerns because it omits multi-account/runtime-correlation coverage dimensions and now contains stale fix recommendations.
- Even narrowly scoped system docs still picked up rewrite-adjacent tension:
  - `BinaryLocator_Spec.md` now looks stale around OpenCode launcher ownership, dead four-tier naming references, and process/session-scope wording.

### Impacted docs
- Primary docs in this tranche:
  - `Plans/BinaryLocator_Spec.md`
  - `Plans/DRY_Rules.md`
  - `Plans/Decision_Log.md`
  - `Plans/Formatters_System.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Plugins_System.md`
  - `Plans/Skills_System.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
- Repeatedly implicated adjacent owners:
  - `Plans/Executor_Protocol.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Run_Modes.md`
  - `Plans/Tools.md`
  - `Plans/CLI_Bridged_Providers.md`
  - `Plans/Multi-Account.md`
  - `Plans/Glossary.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- The remaining partial surface is now fully confirmed as meaningful; none of these docs should be treated as low-signal leftovers.
- Multiple "owner-of-owners" docs (`Decision_Log`, `rewrite-tie-in-memo`, `feature-list`, `newfeatures`, `OpenCode_Coverage_Matrix`, `DRY_Rules`) are stale enough that they amplify downstream drift rather than containing it.
- Runtime safety and capability contracts are still under-owned in plugins/skills/formatters, especially under DAE, mixed mutation semantics, and runtime tool reachability.

### Candidate fixes to carry forward
- This tranche is strong enough to justify continuing the ordered model sequence on the same docs rather than stopping at Opus.
- Highest-signal continuation docs from this tranche appear to be:
  - `Plans/Decision_Log.md`
  - `Plans/Formatters_System.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Plugins_System.md`
  - `Plans/Skills_System.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/rewrite-tie-in-memo.md`
