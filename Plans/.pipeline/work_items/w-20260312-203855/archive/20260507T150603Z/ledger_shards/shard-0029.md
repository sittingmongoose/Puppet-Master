
## Research Progress - 2026-03-16 - Search Routing and Deep-Link Payload Normalization

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/usage-feature.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/assistant-chat-design.md`
- `Plans/chain-wizard-flexibility.md`

### Key findings
- The docs already contain many navigation and routing mechanisms:
  - command palette
  - `resume_url` deep links for wizard/interview recovery
  - `Show in Ledger` / `Show in Usage`
  - Orchestrator pivots into Source Control / GitHub Actions / Docker Manager
  - chat and thread navigation
  - open-file contract
  - local tab search and filter behavior
- `UI_Command_Catalog.md` already gives several useful route-like commands:
  - `cmd.artifacts.open_panel`
  - `cmd.orchestrator.open_in_source_control`
  - `cmd.orchestrator.open_in_github_actions`
  - `cmd.orchestrator.open_in_docker_manager`
  - graph focus/filter commands
  - chat usage focus/open commands
- What is still missing is one shared destination payload model that can span:
  - search results
  - command palette entries
  - widget drill-downs
  - deep links
  - resume URLs
  - cross-surface “Show in …” pivots

### Main normalization direction
- Strong recommendation:
  - define one shared routing payload contract rather than separate ad hoc payloads per surface
- Reason:
  - the object model is now too broad for loosely similar navigation conventions to stay consistent by accident
- This should apply across:
  - Orchestrator
  - Source Control
  - Usage / Ledger
  - Artifacts
  - chat / Interview / Builder recovery links

### Candidate shared payload fields
- Good common fields:
  - `project_id`
  - `actor_run_kind?`
  - `focused_run_id?`
  - `thread_id?`
  - `wizard_id?`
  - `destination_surface`
  - `destination_tab?`
  - `object_kind?`
  - `object_id?`
  - `record_id?`
  - `artifact_id?`
  - `attempt_id?`
  - `lane_id?`
  - `worktree_id?`
  - `usage_event_ref?`
  - `filter_payload?`
  - `inspector_target?`
  - `scroll_target?`
  - `focus_behavior?`
- Not every route uses every field, but the contract should make these composable rather than reinvented.

### Object-kind direction
- Search and deep-link routing now need object-kind vocabulary to avoid ambiguity.
- Candidate object kinds:
  - `run`
  - `feature_seam`
  - `work_package`
  - `node`
  - `lane`
  - `worktree`
  - `concern`
  - `promotion`
  - `review`
  - `corroboration`
  - `graph_patch`
  - `recovery_record`
  - `blocked_episode`
  - `usage_record`
  - `artifact`
  - `thread`
  - `wizard`
  - `bundle`
- This fits the earlier search/object-first direction and the shared record-envelope work.

### Resume-url implication
- `resume_url` is the clearest existing deep-link contract, but it is too narrow to carry the full cross-surface model by itself.
- Recommended rule:
  - keep human-meaningful deep-link URLs for recovery/resume
  - but normalize their decoded payload into the same routing contract used by in-app search and command routing
- That avoids a split world where URL-based navigation and in-app navigation speak different schemas.

### Search-result direction
- Search results should not merely open a page; they should reconstruct context.
- Good rule:
  - search result activation restores the correct scope before selecting the target
- Example:
  - for historical Orchestrator objects:
    - set `focused_run_id`
    - switch to the correct tab
    - apply any filter payload
    - open inspector on the target object
- Same idea applies to:
  - `Show in Ledger`
  - `Show in Usage`
  - `Resume Wizard`
  - thread message deep links

### Cross-surface pivot direction
- Runtime artifacts and receipts already imply good pivot behavior:
  - preserve canonical usage identity
  - preserve run/thread/attempt/worktree linkage
  - do not invent feature-local routing semantics
- The next-step recommendation is:
  - all “Open in …” / “Show in …” actions should become thin wrappers over the shared routing payload

### Persistence implication
- Because earlier research established `focused_run_id`, historical-run mode, and project-state persistence, routing needs a persistence-aware rule:
  - some route activations should update stored view state
  - others should be transient focus changes only
- Example:
  - explicit search navigation to a historical run likely should update persisted Orchestrator focused-run state
  - hover previews or temporary compare pivots should not necessarily rewrite persistent state

### Trust / stale-data implication
- Routing also intersects with projection trust.
- Good rule:
  - if the target surface is degraded, the route should still land on the canonical fallback representation when possible rather than fail opaque
- Example:
  - deep link to a concern during projection degradation might route to exact record view / Ledger-backed inspector instead of the normal rollup tab presentation

### Contradictions / gaps surfaced
- Current docs have several route-like mechanisms, but they are still defined per feature rather than by one shared navigation payload.
- Without normalization, the app will likely accumulate:
  - inconsistent result activation behavior
  - duplicate context reconstruction logic
  - subtle mismatches between command palette, search, widgets, and deep links
- `resume_url` is currently stronger than some Orchestrator pivots in terms of specificity, which suggests the more generic routing layer is still underdefined.

### Candidate fixes to carry forward
- Define one shared routing/deep-link payload for search, command palette, widget drill-downs, recovery links, and cross-surface pivots.
- Add stable `object_kind` / `object_id` vocabulary for the newer Orchestrator object model and adjacent runtime actors.
- Make route activation restore scope, not just surface.
- Normalize “Open in …” and “Show in …” commands as adapters over the same routing payload.

### Do-not-forget details
- route payloads need to restore context like `focused_run_id`, not merely switch tabs
- URL deep links and in-app search routes should decode to the same internal navigation model
- degraded surfaces should still be routable via canonical fallback views when possible

## Research Progress - 2026-03-16 - Historical Semantic Consistency Across Record Families

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/assistant-chat-design.md`
- `Plans/chain-wizard-flexibility.md`

### Key findings
- Several record families already have strong historical/lineage rules:
  - blocked projections remain historical after resolution and are not overwritten
  - attempts from older generations become `stale_historical` and are never resumable
  - safe-point restore creates a new attempt record rather than mutating the old one
  - historical worktree references must survive live prune/retire operations
  - archived/deleted threads remain distinct storage postures
- At the same time, different subsystems already use their own lifecycle vocabularies:
  - blocked/recovery records
  - attempts/generations
  - wizard blocked state
  - annotation lifecycle (`open -> addressed -> resolved`)
  - thread archival/deletion
- That means the consistency problem is not “make every object use one lifecycle enum.”
- The real need is:
  - define which semantic words are cross-family
  - define which are family-local

### Cross-family semantic core
- The most reusable cross-family historical terms still look like:
  - `historical`
  - `stale_historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `removed`
- Working meaning:
  - `historical`
    - queryable past object/state that is no longer the currently active focus
