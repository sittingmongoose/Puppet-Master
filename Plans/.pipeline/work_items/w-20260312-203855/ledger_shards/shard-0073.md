- Primary owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
- Strongly implicated adjacent docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/FileManager.md`
  - `Plans/storage-plan.md`
  - `Plans/usage-feature.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/WorktreeGitImprovement.md`

### Contradictions / gaps surfaced
- The contract conclusions are now stronger than several owner docs, especially `Contracts_V0.md`, `Crosswalk.md`, `UI_Command_Catalog.md`, and `FinalGUISpec.md`.
- If reconciliation starts from surface docs first instead of owner docs, drift will reappear immediately because the route vocabulary is now cross-cutting rather than page-local.

### Candidate fixes to carry forward
- Reconcile owner docs in this order:
  - `Contracts_V0.md`
  - `Crosswalk.md`
  - `UI_Command_Catalog.md`
  - `FinalGUISpec.md`
  - then consumer docs
- Keep the routing tranche centralized in owner docs before touching broad consumer prose.

### Do-not-forget details
- The routing model now has a clear owner chain.
- Reconciliation should follow that owner chain or it will fragment again.

## Research Progress - 2026-03-17 - Routing collision with tier-era consumer docs

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The canonical routing model is now ahead of several high-traffic consumer docs.
- `Plans/Orchestrator_Page.md` is still structurally tier-era:
  - tab 2 is still `Tiers`
  - the page still describes a six-tab shell with `Progress`, `Tiers`, `Node Graph`, `Evidence`, `History`, and `Ledger`
  - `Progress` widgets still center `active tier`, `phase/task/subtask` progress, and `TierChanged`-driven activity
  - cross-surface CTA language is newer and should normalize through object-first `route_target` behavior instead of tier-local pivots
- `Plans/Run_Graph_View.md` has a direct internal contract split:
  - older sections still drive detail panes, worker activity, verification streams, Usage links, and event correlation by `tier_id` / `tier_type`
  - newer addenda already use `scheduler_pass_id`, `blocked_sequence`, `safe_point_id`, and remediation lineage
  - the doc is carrying two incompatible identity systems at once
- `Plans/FinalGUISpec.md` still preserves `Tiers` as a primary page-level surface and still embeds older standalone-surface assumptions that conflict with the tab-first Orchestrator rewrite
- `Plans/UI_Command_Catalog.md` is internally split:
  - newer runtime commands already use `blocked_sequence`
  - older graph HITL commands still use `request_id`
  - `cmd.source_control.select_worktree` still claims `layout/UI state only`, which conflicts with object-first routing and worktree identity

### Impacted docs
- Primary stale consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
- Owner docs already identified in the routing tranche:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`

### Contradictions / gaps surfaced
- `tier_id` is still treated as canonical execution and navigation identity in places where the rewrite now requires `run_id + node_id + attempt_id? + blocked_sequence?` with object-first routing.
- `request_id` still appears as the HITL approval key in graph commands even though the runtime direction is `blocked_sequence` anchored to the blocked episode.
- `Tiers` survives as a primary Orchestrator tab and as a primary GUI page concept in stale consumer docs even though the rewrite direction is `Seams` plus `Node Graph`, with tiers reduced to derived view context.
- Usage pivots still describe `tier_id` filters in graph/detail docs even though the routing and identity work now requires object-first `usage_event` and runtime-object pivots.
- Source Control worktree selection is still described as UI state only even though worktree identity is now a first-class routed object in the broader model.

### Candidate fixes to carry forward
- Reconcile owner docs first, then update these four consumer docs to consume the canonical route/object model rather than invent page-local identity rules.
- Replace stale `Tiers` tab/page assumptions with the rewrite tab model:
  - `Progress`
  - `Seams`
  - `Node Graph`
  - `Evidence`
  - `History`
  - `Ledger`
- Replace graph/detail uses of `tier_id` as navigation identity with object-first routing to:
  - `node`
  - `attempt`
  - `blocked_episode`
  - `scheduler_pass`
  - `safe_point`
  - `remediation`
- Replace graph HITL command payload identity from `request_id` to blocked-episode anchored identity.
- Reclassify worktree selection and open-in-SCM flows as object navigation, not pure layout state.

### Do-not-forget details
- `Orchestrator_Page.md` mixes newer blocked/remediation lineage work with older `TierChanged` / `active tier` assumptions.
- `Run_Graph_View.md` is one of the strongest internal contradiction sites in the repo because its later addenda already prove the old `tier_id` model is no longer enough.
- `FinalGUISpec.md` will keep reintroducing stale page assumptions until the owner docs are reconciled first.
- `UI_Command_Catalog.md` still exposes the `request_id` versus `blocked_sequence` split directly in user-facing command rows.

## Research Progress - 2026-03-17 - Usage surfaces versus object-first routing

### Targeted docs read
- `Plans/usage-feature.md`

### Key findings
- `Plans/usage-feature.md` is partially aligned with the routing rewrite and partially still tied to older usage-local and tier-local identity patterns.
- The strong aligned part:
  - `cost_usage` artifacts already require `Show in Ledger` and `Show in Usage`
  - the doc already treats `usage.event` as canonical identity and says runtime artifacts are attribution records only
  - the page placement model is now fixed and is stronger than earlier Option A/B/C placement language
- The stale part:
  - the doc still describes GUI deep-links as filters and scroll behavior driven by `usage_event_seq`, `usage_event_ref`, or broad `run_id/thread_id/timestamp`
  - `UsageRecord` still keeps `tier_id` as a required cross-surface field
  - Run Graph and Orchestrator consumption still says aggregate by `tier_id` and `attempt_id?`
  - several older rollup sections still speak in `usage.jsonl` and tier-based aggregation language rather than canonical object-first pivots
- There is also a structural doc-quality issue:
  - the `cost_usage runtime artifact and Show in Ledger / Show in Usage` section appears twice with effectively the same content

### Impacted docs
- Primary stale consumer:
  - `Plans/usage-feature.md`
- Owner docs already identified:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- The routing rewrite requires `usage_event` to be a first-class routed object, but `usage-feature.md` still describes usage navigation mostly as page-local filtering behavior.
- `tier_id` is still treated as a required usage identity/correlation key even though the broader runtime and routing direction is object-first and node/attempt/block lineage aware.
- The duplicated `cost_usage` section raises reconciliation risk because one copy can be updated while the other stays stale.

### Candidate fixes to carry forward
- Normalize Usage deep-links through:
  - `object_kind = usage_event`
  - `object_id = canonical usage event id`
- Keep filter/scroll/highlight behavior as destination realization, not as canonical navigation identity.
- Demote `tier_id` from cross-surface navigation identity and realign usage consumers around runtime object routing plus canonical usage-event identity.
- Remove the duplicated `cost_usage` section during reconciliation so there is one authoritative consumer section.

### Do-not-forget details
- `usage-feature.md` is closer to the rewrite than the tier-era graph docs, but it still carries enough `tier_id` language to reintroduce drift if left untouched.
- The duplicate `cost_usage` section is not a cosmetic issue. It is a real reconciliation hazard.

## Research Progress - 2026-03-17 - File open versus subject open consumer split

### Targeted docs read
- `Plans/FileManager.md`
- `Plans/assistant-chat-design.md`

### Key findings
- `Plans/FileManager.md` still states one universal open primitive:
  - `OpenFile { path, line?, range?, target_group? }`
  - it still says all open-file actions share that one internal contract and one code path
- Later content in the same doc and adjacent docs already outgrows that claim:
  - FileManager handoff to Source Control must preserve `repo_id` and `worktree_id`
  - restore/history/checkpoint flows are identity-backed and backend-driven
  - the embedded document pane already shares canonical document identity and backend restore pipelines rather than pure path opens
- `Plans/assistant-chat-design.md` is materially ahead here:
  - `open_source` for non-persisted Deep Plan and non-file artifact classes already resolves to transient `generated://<artifact_id>` buffers
  - chat search and jump behavior is already stable-ID based with `thread_id` and `message_id`
  - `resume_url` already appears as a deep-link/restore concept
- The result is a clear consumer split:
  - FileManager still treats path-open as universal truth
  - assistant-chat already behaves like subject/open-by-identity exists, even if it does not name the primitive directly

### Impacted docs
- Primary stale consumer:
  - `Plans/FileManager.md`
- Strong aligned-but-implicit consumer:
  - `Plans/assistant-chat-design.md`
- Owner docs already identified:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- `OpenFile` is still overclaimed as a universal open contract even though generated artifacts, draft documents, checkpoints, search hits, and runtime artifacts already require identity-native resolution.
- `assistant-chat-design.md` already relies on stable identity for message/search/jump behavior but still lacks the shared named primitive that should connect those behaviors to the route/object model.
- `generated://<artifact_id>` is correctly treated as transport realization in assistant-chat behavior, but FileManager still lacks the matching subject-open model that explains how those buffers are opened without pretending they are normal workspace paths.

### Candidate fixes to carry forward
- Keep `OpenFile` strictly path/editor scoped.
- Introduce `OpenSubject` as the named identity-open contract consumed by FileManager and assistant chat.
- Keep `generated://<artifact_id>` as resolver output, not canonical subject identity.
- Reconcile FileManager so it consumes `OpenSubject` for artifact/document/checkpoint/open-source flows instead of claiming all callers use `OpenFile`.

### Do-not-forget details
- `assistant-chat-design.md` already proves the subject-open split is required.
- `FileManager.md` is now the main stale consumer for this seam.

## Research Progress - 2026-03-17 - Worktree and SCM routing consumers

### Targeted docs read
- `Plans/WorktreeGitImprovement.md`
- `Plans/assistant-chat-design.md`

### Key findings
- `Plans/WorktreeGitImprovement.md` is still structurally tier-era in its low-level ownership model:
  - `get_tier_worktree(tier_id)`
  - worktree paths and branches keyed by `tier_id`
  - recovery/conflict persistence phrased in `tier_id` terms
