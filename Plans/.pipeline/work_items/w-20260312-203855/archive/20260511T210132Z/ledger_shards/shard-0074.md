  - several future crew/message examples still propagate `tier_id` through git/worktree coordination
- The same document also contains rewrite-aligned operational direction:
  - Source Control is the primary operational surface for worktree inventory and actions
  - Orchestrator consumes worktree identity, blocked state, and lineage
  - `dirty_worktree` and `worktree_conflict` must route back to Source Control with the correct worktree in scope
  - historical runs must preserve historical worktree references after prune/remove
- `assistant-chat-design.md` strengthens the same surface boundary at a higher level:
  - repo-state inspection routes to Source Control semantics
  - hosted workflow inspection routes to GitHub Actions semantics
  - chat does not create parallel output/navigation models

### Impacted docs
- Primary stale consumer:
  - `Plans/WorktreeGitImprovement.md`
- Strong aligned adjacent consumer:
  - `Plans/assistant-chat-design.md`
- Owner docs already implicated:
  - `Plans/Orchestrator_Page.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- The worktree doc correctly sets the Source Control versus Orchestrator surface boundary, but its identity model still hangs on `tier_id`.
- That means the doc currently mixes:
  - rewrite-era surface ownership
  - tier-era execution/worktree identity
- The future crew/message examples are especially risky because they would propagate `tier_id` back into git/worktree coordination even after the broader execution-context rewrite.

### Candidate fixes to carry forward
- Replace tier-bound worktree identity in SCM/runtime flows with the newer lane/worktree plus execution-context model.
- Keep Source Control worktree-first, but route by canonical worktree object identity rather than treating worktree selection as shell state or tier metadata.
- Reconcile git/worktree coordination examples so they stop carrying `tier_id` as the operational identity anchor.

### Do-not-forget details
- `WorktreeGitImprovement.md` already contains the correct surface boundary. The stale part is the identity anchor, not the product boundary.
- The git/worktree coordination examples are a high-risk backdoor for reintroducing tier-era identity after reconciliation.

## Research Progress - 2026-03-17 - Artifact preview identity versus navigation primitive ownership

### Targeted docs read
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/storage-plan.md`
- `Plans/Crosswalk.md`
- `Plans/Contracts_V0.md`

### Key findings
- `Plans/storage-plan.md` is already the strongest doc for subject identity:
  - `preview_subject_id = doc:<document_id>` or `artifact:<artifact_id>`
  - artifact-backed restore resolves to transient `generated://<artifact_id>` buffers
  - projectors derive `preview_subject_id` deterministically for restore and UI-state joins
- `Plans/Runtime_Artifacts_Panel.md` is partly aligned:
  - `cost_usage` already routes to canonical Usage/Ledger identity
  - cross-surface receipt linkage already says runtime artifacts must stay on canonical runtime identity
  - but the doc still frames open/link behavior in artifact-panel terms and still uses a `task_id` rule that reflects older task-granularity language
- `Plans/Crosswalk.md` still does not declare the routing/open-by-identity primitives that these behaviors require.
- `Plans/Contracts_V0.md` still has `resume_url`, `detail_ref`, and event-local linkage fields, but it still does not own a named `route_target` or `OpenSubject` contract.

### Impacted docs
- Primary owner-gap docs:
  - `Plans/Crosswalk.md`
  - `Plans/Contracts_V0.md`
- Strong aligned consumer:
  - `Plans/storage-plan.md`
- Strong implicated consumer:
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- Storage already knows canonical subject identity, but Contracts and Crosswalk still do not declare the navigation primitive that consumes it.
- Runtime artifacts already require canonical cross-surface routing, but the shared contract is still missing from the owner docs.
- `task_id` language in the artifacts doc is lagging the broader node/package/seam/lane rewrite and will keep dragging artifact identity toward older decomposition terms unless reconciled.

### Candidate fixes to carry forward
- Put the named `route_target` and `OpenSubject` contracts in `Plans/Contracts_V0.md`.
- Put the primitive boundary declaration for route-target and subject-open navigation in `Plans/Crosswalk.md`.
- Keep `preview_subject_id` and `generated://<artifact_id>` where they belong:
  - storage owns persisted subject identity and restore joins
  - contracts own navigation/open primitives
  - runtime-artifact consumers route through those primitives
- Reconcile runtime-artifact identity language away from stale `task_id` framing and toward runtime/object identity.

### Do-not-forget details
- This is now a clear owner-doc gap, not a vague alignment issue.
- `storage-plan.md` is ahead of `Contracts_V0.md` and `Crosswalk.md` on this seam.

## Research Progress - 2026-03-17 - Routing tranche closure and reconciliation strata

### Key findings
- The routing/open-by-identity tranche is no longer a broad invention problem.
- The remaining work splits into:
  - one owner-doc structural gap
  - one command/wiring normalization gap
  - a bounded set of stale consumer reconciliations

### Structural gaps still live
- `Plans/Contracts_V0.md` still lacks the named canonical contracts for:
  - `route_target`
  - `OpenSubject`
- `Plans/Crosswalk.md` still lacks the matching primitive-boundary declaration for route-target and subject-open navigation.

### Reconciliation strata
- Stratum 1: owner docs
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
- Stratum 2: command and shell adoption
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
- Stratum 3: source-open and preview consumers
  - `Plans/FileManager.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/storage-plan.md`
  - `Plans/Runtime_Artifacts_Panel.md`
- Stratum 4: runtime and orchestration consumers
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/usage-feature.md`
  - `Plans/WorktreeGitImprovement.md`

### Contradictions / gaps surfaced
- If reconciliation starts in Stratum 3 or Stratum 4 before Stratum 1 is fixed, the consumer docs will keep restating local navigation semantics and drift will recur.
- `storage-plan.md` already contains subject identity that depends on owner-doc contracts that still do not exist by name.
- `UI_Command_Catalog.md` and `FinalGUISpec.md` are the pressure points that will either spread the canonical route/object vocabulary cleanly or re-fragment it.

### Candidate fixes to carry forward
- Treat the routing tranche as structurally closed after the owner-doc contracts are added.
- Treat the rest of the work as ordered reconciliation, not as more concept invention.
- Keep the command layer wrapper-based and domain-facing while normalizing through the shared contracts underneath.

### Do-not-forget details
- The route/object model is now sharp enough to reconcile.
- The blocker is owner adoption, not missing design direction.

## Research Progress - 2026-03-17 - Exact owner-doc insertion points for route/open contracts

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`

### Key findings
- `Plans/Contracts_V0.md` already has the correct attachment point:
  - section `7. UICommand`
  - subsection `7.1 UICommand envelope`
  - subsection `7.2 WiringEntry`
- The document is still missing the canonical route/open contracts entirely.
- The clean contract placement is:
  - keep `7.1 UICommand envelope`
  - add `route_target` and `OpenSubject` as new sibling contract sections inside chapter 7
  - keep `WiringEntry` after those sections so the wiring layer consumes, rather than owns, route/open semantics
- `Plans/Crosswalk.md` already has the adjacent primitive owners that expose the gap:
  - `Primitive:UICommand`
  - `Primitive:DocumentPane`
  - `Primitive:DocumentCheckpoint`
- The clean boundary addition is:
  - add a primitive for route-target / open-by-identity navigation near `Primitive:UICommand` and `Primitive:DocumentPane`
  - explicitly state that:
    - `Contracts_V0.md` owns route/open contract shapes
    - `storage-plan.md` owns persisted refs like `preview_subject_id` and `resume_url`
    - `FileManager.md` owns `OpenFile`
    - consumer docs only realize those primitives

### Impacted docs
- Primary owner docs:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- `Contracts_V0.md` chapter 7 still jumps directly from a thin `UICommand` envelope to `WiringEntry`, which leaves no canonical place for shared route/open payloads.
- `Crosswalk.md` still names `UICommand`, `DocumentPane`, and `DocumentCheckpoint` ownership without naming the route-target / subject-open primitive that sits between them.
- `Crosswalk.md` also still carries stale Orchestrator ownership text:
  - `OrchestratorPage` still says the page has six tabs including `Tiers`
  - that stale primitive text will conflict with the rewrite tab model during reconciliation

### Candidate fixes to carry forward
- In `Plans/Contracts_V0.md`:
  - add canonical `route_target` contract section under chapter 7
  - add canonical `OpenSubject` contract section under chapter 7
  - keep `WiringEntry` after them
- In `Plans/Crosswalk.md`:
  - add a primitive boundary for route-target / open-by-identity navigation
  - update `UICommand` boundary text so command IDs stay stable while route/open semantics live in Contracts
  - update stale `OrchestratorPage` boundary text to the rewrite tab model

### Do-not-forget details
- This is not just a missing paragraph. The owner-doc section order already tells us where the contract belongs.
- `WiringEntry` must consume route/open contracts, not become their surrogate owner.

## Research Progress - 2026-03-17 - Command catalog and GUI-shell adoption points

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`

### Key findings
- `Plans/UI_Command_Catalog.md` is structurally ready for route/open adoption but still classifies several routed object actions as pure layout state:
  - `cmd.source_control.select_worktree`
  - `cmd.chat.open_thread_usage`
  - `cmd.chat.focus_thread_usage`
  - `cmd.panel.switch` with contextual object refs
- The catalog already has a stable command-entry contract and wiring hooks, so the missing piece is command classification and normalization metadata, not a new catalog structure.
- `Plans/FinalGUISpec.md` is carrying two separate stale seams at once:
