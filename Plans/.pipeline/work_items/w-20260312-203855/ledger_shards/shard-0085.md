## Research Progress - 2026-03-17 - execution-core and main surface seam: Executor Protocol, Orchestrator Page

### Targeted docs read
- `Plans/Executor_Protocol.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- `Plans/Executor_Protocol.md` is now far less tier-era than several adjacent docs:
  - canonical dispatch already uses scored ready-set selection, not pure lexical `node_id`
  - `attempt_id` is first-class
  - `scheduler_lane` is first-class
  - safe-point, remediation, worktree-conflict, and blocked/runtime state are already present
  - lexicographic `node_id` is explicitly demoted to final tiebreak only
- But `Plans/Executor_Protocol.md` still has owner-level drift in the same file:
  - the doc title and role model still say `Overseer Protocol` with `Builder`, `Verifier`, and `Overseer` as the primary execution framing
  - the opening sections still teach node completion semantics without the newer `Package Overseer` / `Seam Overseer` governance split
  - the canonical execution context replacement for `TierContext` still is not named here as a first-class owner contract
- `Plans/Orchestrator_Page.md` remains one of the strongest stale surface owners:
  - still defines a six-tab page with `Tiers`
  - still says tabs `1, 2, 4, 5, 6` are widget-based
  - still makes `Tiers` the second tab and centers `widget.tier_tree`
  - still defines Evidence, History, and Ledger as widget tabs rather than native tabs
  - still describes Progress widgets in phase/task/subtask terms:
    - `widget.current_task`
    - `widget.progress_bars`
    - current tier
    - phase/task/subtask completion bars
  - still keys multiple surfaces and filters to `tier_id`
  - still carries stale worker identity fields:
    - `requested_persona_id`
    - `effective_persona_id`
    - `provider`
    - `model`
  - still treats HITL requests as keyed by `request_id`
  - still cites `PuppetMasterEvent::TierChanged` and `PuppetMasterEvent::UserInteractionRequired` as primary live-state inputs
- The lower `Orchestrator_Page.md` addenda are closer to the rewrite:
  - blocked/recovery rows use `allowed_action_ids[]`
  - requested vs effective identity is called out later
  - lane/worktree, receipt, and cross-surface lineage concepts are present
- That makes `Orchestrator_Page.md` another same-file supersession case, not just an outdated page spec.

### Impacted docs
- Primary docs:
  - `Plans/Executor_Protocol.md`
  - `Plans/Orchestrator_Page.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/Widget_System.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- The execution core is now ahead of the main Orchestrator page spec, so the page doc is still teaching a surface model that the runtime core has already outgrown.
- `Executor_Protocol.md` still names only the older `Overseer` execution role at the top even though governance has split into package and seam overseers elsewhere.
- `Orchestrator_Page.md` still turns stale ontology into tab structure, widget structure, event sources, filter keys, and worker identity fields.

### Candidate fixes to carry forward
- Reconciliation should use `Executor_Protocol.md` as the stronger runtime baseline and pull `Orchestrator_Page.md` toward it, not the reverse.
- `Executor_Protocol.md` needs:
  - explicit owner placement for the execution-unit context replacing `TierContext`
  - clear relationship between runtime scheduler/execution roles and the newer package/seam overseer governance model
- `Orchestrator_Page.md` needs:
  - `Tiers` retired and replaced by `Seams`
  - only `Progress` kept widget-composed
  - `Evidence`, `History`, and `Ledger` treated as native tabs
  - `tier_id` filters and worker identity fields replaced with canonical node/attempt/runtime identity
  - blocked/runtime event sources elevated over request-centric HITL and `TierChanged` event assumptions

### Do-not-forget details
- `Executor_Protocol.md` is no longer the main source of tier-era drift. `Orchestrator_Page.md` is now the much larger multiplier.
- The page doc still contains enough lower aligned material that reconciliation should collapse same-file contradictions instead of replacing the whole thing blindly.


## Research Progress - 2026-03-17 - remaining high-risk stale consumers: Run Graph, Widget System, Usage, Assistant Chat

### Targeted docs read
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`
- `Plans/assistant-chat-design.md`

### Key findings
- `Plans/Run_Graph_View.md` is still strongly tier-era in its core surface contract:
  - worker activity requires `PuppetMasterEvent::Output` filtered by `tier_id`
  - verifier activity is scoped to node `tier_id`
  - `View in Usage` still filters by `tier_id`
  - base data model still includes:
    - `worker_provider`
    - `worker_model`
    - `verifier_provider`
    - `verifier_model`
    - `hitl_request_id`
  - graph interactions still include:
    - `Open that tier in the Tiers tab`
    - `View in Tiers`
    - `Copy tier_id`
  - lower addenda are more aligned:
    - `scheduler_lane`
    - `allowed_action_ids[]`
    - `blocked_sequence`
    - historical lineage preservation
- `Plans/Widget_System.md` remains a major stale hostability owner:
  - still defines `Dashboard, Usage, Orchestrator widget tabs`
  - still includes `widget.tier_tree` for `Orch/Tiers`
  - still persists:
    - `widget_layout:v1:orchestrator:tiers`
    - `widget_layout:v1:orchestrator:evidence`
    - `widget_layout:v1:orchestrator:history`
    - `widget_layout:v1:orchestrator:ledger`
  - still contains the migration contradiction already logged earlier:
    - keep `dashboard_layout:v1` as backup
    - later says legacy key is deleted
  - data sources still rely on `PuppetMasterEvent::TierChanged`, `tier_id`, and phase/task/subtask framing for multiple Orchestrator widgets
- `Plans/usage-feature.md` is still one of the main correlation drifts:
  - `usage.jsonl` and canonical usage discussion still center `tier_id`
  - canonical `UsageRecord` still requires `tier_id`
  - Run Graph and Orchestrator are still said to aggregate by `tier_id` and `attempt_id?`
  - later navigation wording is closer to the rewrite:
    - `usage_event_ref`
    - canonical Usage surfaces
    - run/thread-based opens for `Show in Ledger` and `Show in Usage`
- `Plans/assistant-chat-design.md` is healthier than the other three:
  - thread blocked-state addenda already align to blocked/runtime actions
  - per-thread usage is already one canonical detail surface
  - search/log APIs already key to `thread_id`, `run_id`, `message_id`, and `event_id`
  - remaining drift is concentrated around compatibility-era fields like `resume_url?` in blocked-notice persistence rather than broad ontology problems

### Impacted docs
- Primary docs:
  - `Plans/Run_Graph_View.md`
  - `Plans/Widget_System.md`
  - `Plans/usage-feature.md`
  - `Plans/assistant-chat-design.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- `Run_Graph_View.md` and `usage-feature.md` still reinforce each other through `tier_id`, which keeps the old usage/evidence/runtime correlation alive.
- `Widget_System.md` and `Orchestrator_Page.md` still reinforce each other through the old “all Orchestrator tabs are widget canvases” model.
- `assistant-chat-design.md` is not broadly stale in the same way. Its remaining drift is local and compatibility-oriented.

### Candidate fixes to carry forward
- Reconciliation order for this tranche should be:
  - `usage-feature.md`
  - `Run_Graph_View.md`
  - `Widget_System.md`
  - `assistant-chat-design.md`
- `usage-feature.md` needs:
  - usage correlation moved off `tier_id` as primary cross-surface key
  - run/node/attempt identity and `usage_event_ref` elevated
  - historical/current usage navigation aligned to canonical route/open primitives
- `Run_Graph_View.md` needs:
  - graph detail and usage pivots aligned to node/attempt/runtime identity
  - stale `hitl_request_id`, `View in Tiers`, and `tier_id`-centric event filtering removed
  - worker/verifier identity fields aligned to canonical requested/effective runtime disclosure
- `Widget_System.md` needs:
  - Orchestrator hostability narrowed to `Progress`
  - non-Progress Orchestrator tabs removed from widget layout persistence
  - widget data-source language updated away from `TierChanged` / `tier_id` assumptions
- `assistant-chat-design.md` needs:
  - `resume_url` reduced to transport or compatibility wording where it still survives
  - blocked-thread messages tied cleanly to the shared route/runtime action model

### Do-not-forget details
- `assistant-chat-design.md` should not be over-corrected. It is mostly aligned and is no longer one of the main drift multipliers.
- `Run_Graph_View.md` and `usage-feature.md` are now the highest-risk remaining stale consumer pair because they still share the same old correlation key.


## Research Progress - 2026-03-17 - promoted-shell and feature-summary tranche

### Targeted docs read
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`

### Key findings
- `Plans/Section15_MVP_Promoted_Features_Spec.md` is comparatively disciplined in this seam:
  - it explicitly says it is not the storage, command, permission, or widget SSOT
  - the main risk is not fresh contradictions here; it is stale pass/fail references if upstream specs move and this checklist is not updated
- `Plans/feature-list.md` is still a broad stale-spec mirror:
  - still describes Dashboard/orchestrator layout in widget-card and tier terms
  - still lists `Orchestrator single-page with 6 tabs` including `Tiers`
  - still enumerates stale widgets such as:
    - `widget.tier_tree`
    - `widget.progress_bars` as phase/task/subtask bars
    - `widget.current_task` as active tier
  - still describes Usage by `tier/session` and says tier config shows current usage
  - still mirrors worktree ownership through `tier_id`
- `Plans/newfeatures.md` is also still mirroring older surface/runtime language:
  - Dashboard/widget wording still assumes the older dashboard and widget stack
  - recovery/orchestrator snapshot language still uses phase/task/subtask ids
  - HITL references still point at tier-boundary approval framing
