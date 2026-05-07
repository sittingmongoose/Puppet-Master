  - `project_id`
  - `provider_id`
  - `account_id`
  - `execution_role?`
  - `source_kind`
  - `signal_confidence`
  - `pressure_kind`
  - `projected_remaining?`
  - `reset_at?`
  - `started_at_utc`
  - `updated_at_utc`
  - `ended_at_utc?`
  - `status` (`active | cooled_down | resolved | invalidated`)
- `account_switch_event`
  - `switch_event_id`
  - `project_id`
  - `provider_id`
  - `execution_role?`
  - `requested_account_id?`
  - `requested_account_binding?`
  - `from_account_id?`
  - `to_account_id?`
  - `switch_reason`
  - `decision_kind` (`switched | stayed | blocked_no_backup | blocked_required_account | failed`)
  - `source_episode_id?`
  - `run_id?`
  - `attempt_id?`
  - `thread_id?`
  - `ts`

### Impacted docs
- `Plans/Multi-Account.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/FinalGUISpec.md`
- consumer docs for History / Ledger / Orchestrator runtime detail

### Contradictions / gaps surfaced
- `account_switch_reason` currently does too much work as a single field.
  - it tries to explain both pressure cause and switch outcome
  - it also collapses current-state and historical-state concerns together
- `provider_accounts.health` is a current-state family, not a durable episode history.
- Notification copy already assumes switch outcomes like `threshold_preemptive_switch` and `no eligible backup`, but there is no canonical durable event family behind that assumption.

### Candidate fixes to carry forward
- Keep `account_switch_reason` on effective/runtime snapshots as the current-run disclosure field.
- Add append-only switch/pressure history families for durable audit and shared UI consumption.
- Let Usage, History, Ledger, and Orchestrator consume the same event family rather than inventing local switch-history views.
- Preserve `signal_confidence` and `source_kind` in the history family so pressure timelines do not overstate certainty.

### Do-not-forget details
- a failed or blocked switch decision is still historically important even when the effective account did not change
- pressure episodes and switch events should support both provider-wide and account-specific views
- this history must not become a second quota system; it should plug into the shared Usage/runtime pipeline
- current-state surfaces can stay simple, but history surfaces need the append-only truth

## Research Progress - 2026-03-16 - Opus GUI / Surface Contract Deepening

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`

### Key findings
- Final GUI surface ownership is still materially behind the rewrite:
  - Dashboard and Appendix C still center tier/task/subtask widgets and vocabulary
  - `Tiers` still survives as a first-class tab where the rewrite now wants seam/package/node surfaces
  - the 12-widget rewrite-era Progress set still has no concrete home in `FinalGUISpec.md`
- The concern model is still effectively absent from GUI contracts:
  - no first-class concern record/lifecycle/projection model appears in `FinalGUISpec.md`
  - the shared concern surface split across Progress/Seams/Evidence/History/Ledger still has no GUI contract owner
- Projection freshness and degraded-trust remain under-specified at the command/surface layer:
  - `UI_Command_Catalog.md` still lacks a projection-freshness gating rule for mutating/recovery commands
  - cross-surface route/open commands still do not carry the identity/trust context the ledger now recommends
  - artifact panels and evidence flows still lack runtime-trust/provenance fields strong enough to support direct-record fallback behavior
- Runtime artifact contracts are thinner than the runtime identity model they are supposed to support:
  - artifact envelopes still have no producer identity, role, account, or switch lineage
  - `cost_usage` still does not require a durable usage/switch join key strongly enough to back the promised Usage/Ledger deep links
  - runtime-artifact payload ownership is still split across docs without an actually-populated canonical schema family
- GUI identity projections remain incomplete even after all the identity work upstream:
  - account fields, requested concrete-account truth, role/actor identity, operational identity, switch-history, and trust-state are still missing from many user-facing surfaces that claim to show runtime truth

### Highest-risk impacted docs
- `Plans/FinalGUISpec.md`
  - still the broadest consumer doc and still missing concern, trust, switch/pressure, and rewrite-era widget/tab contracts
- `Plans/UI_Command_Catalog.md`
  - still needs governance families, route-payload normalization, and projection-freshness gating
- `Plans/Runtime_Artifacts_Panel.md`
  - still needs producer identity, trust/provenance, and stronger cross-surface linkage contracts
- `Plans/Orchestrator_Page.md` + `Plans/Widget_System.md`
  - still consume stale tier-era surface assumptions and incomplete identity payloads

### Contradictions / gaps surfaced
- GUI still claims or implies tier/task/subtask surfaces where rewrite-era seam/package/node surfaces are intended.
- No explicit concern model exists in the primary GUI specification.
- Commands that change execution truth still lack a shared stale/degraded-projection gate.
- Artifact envelopes still cannot answer who produced the artifact under which identity/trust state.
- Widget/page drill contracts still lack strong, typed route payloads tied to canonical identity/trust/linkage fields.

### Candidate fixes to carry forward
- Replace tier-era Dashboard/Orchestrator widget vocabulary with the rewrite-era Progress/Seams set.
- Add a concern-model GUI contract and projection-health / degraded-trust contract to `FinalGUISpec.md`.
- Add projection-freshness gating and typed route payloads to `UI_Command_Catalog.md`.
- Extend runtime-artifact envelopes and `cost_usage` linkage with canonical identity/trust/switch fields or refs.
- Normalize GUI consumers onto canonical persona/account/role naming and stop allowing stale local variants.

### Do-not-forget details
- Preview `trust_tier` and runtime projection trust must stay distinct.
- Artifact provenance/trust needs to work even when the live worktree or provider session is gone.
- The Orchestrator/Usage/GitHub deep-link story is now blocked more by missing route payload/trust contracts than by missing page chrome.

## Research Progress - 2026-03-16 - Opus Conversational / HITL / Tooling Deepening

### Targeted docs read
- `Plans/assistant-chat-design.md`
- `Plans/interview-subagent-integration.md`
- `Plans/human-in-the-loop.md`
- `Plans/Tools.md`
- `Plans/Permissions_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`

### Key findings
- Conversational actor docs still lag the shared runtime identity model in concrete ways:
  - assistant chat promises requested/effective auth/account visibility but still does not actually specify the disclosure surface
  - interview runtime contracts still stop at persona/platform/model-level identity and still omit auth/account/switch identity
  - neither doc cleanly projects `execution_role` / `actor_kind` even though the broader runtime now needs it
- Permission and HITL semantics remain unsafe under multi-actor parallelism:
  - HITL requests/resolutions still carry no actor/lane/account identity strong enough to answer who asked, who approved, and under which effective runtime identity
  - permissions still hinge on vague “same session” semantics for `always`, reject-cascade, and doom-loop behavior
  - headless `ask` still cross-wires with tier-bound HITL language in ways that blur tool-approval vs governance-boundary approval
- Tool/event contracts are still too thin for the rewritten runtime:
  - `tool.invoked` / `tool.denied` still omit node/attempt/actor/account context
  - the tool outcome taxonomy still diverges from canonical blocked reason taxonomy
  - `mutation_capable` is declared as authoritative but still barely integrated into schema/event/policy surfaces
- Conversational and tooling docs also still lack a shared degraded-trust and concern-escalation path:
  - blocked overlays, approval prompts, and tool-health disclosures still do not share one runtime-trust/concern bridge
  - chat threads still have no natural place for switch events, concern notices, or trust-staleness explanation when runtime state is projection-derived

### Highest-risk impacted docs
- `Plans/assistant-chat-design.md`
  - still needs explicit auth/account/role disclosure and thread-level switch/trust handling
- `Plans/human-in-the-loop.md`
  - still needs actor/lane/account identity, approval provenance, and concurrency-safe queue/scope rules
- `Plans/Tools.md`
  - still needs richer event payloads, reconciled outcome taxonomy, and DAE tool-event reconstruction
- `Plans/interview-subagent-integration.md`
  - still needs canonical persona naming, account visibility, stage-to-role mapping, and less stale tier vocabulary
- `Plans/Permissions_System.md`
  - still needs scope-keyed approvals and richer requested/effective permission snapshots

### Contradictions / gaps surfaced
- Conversational docs promise or imply requested/effective runtime truth but still omit account/auth details in their concrete sections.
- HITL and permissions still mix tier-boundary governance with tool-level approval semantics.
- Tool events remain under-attributed for node/actor/account-aware audit.
- Approval and blocked records still cannot explain which effective account/identity would have executed the action.
- Concern and trust-state escalation still lack a shared conversational/tooling surface contract.

### Candidate fixes to carry forward
- Add explicit auth/account/role disclosure sections to assistant and interview runtime contracts.
- Add actor/lane/account identity and approver provenance to HITL request/resolution events.
- Define an Approval Scope Key and use it consistently across permissions, HITL, doom-loop, and session approval caching.
- Extend tool events with node/attempt/actor/account context and reconcile tool outcomes with canonical blocked codes.
- Add thread-level switch/concern/trust surfacing paths rather than leaving those only to Orchestrator pages.

### Do-not-forget details
- “Approve for session” is now a correctness bug if it is not scoped properly.
- Persona display is not a substitute for actor/role identity.
- DAE runs still need a clear post-hoc tool-event story or their analytics/blocked truth will drift immediately.

## Research Progress - 2026-03-16 - Opus Orchestrator / Wizard / Worktree Drift Deepening

### Targeted docs read
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Glossary.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`

### Key findings
- The core orchestration architecture docs are still structurally split between node-native ingest and tier-native execution:
  - `orchestrator-subagent-integration.md` already ingests node-sharded plans but still dispatches, tracks agents, and remediates via `tier_id`-keyed constructs
  - `WorktreeGitImprovement.md` is still deeply tier-keyed and still has zero lane awareness even though scheduler and worktree isolation now need to interact directly
  - `Executor_Protocol.md` still assumes singular Overseer / Builder / Verifier semantics and lacks package/seam/corroboration/concern hooks
- Concern/corroboration/promotion semantics are still absent or only gestured at:
  - `Executor_Protocol.md` has no concern model, no corroboration lifecycle, no wake reasons for concern/promotion/governance boundaries, and no dual-overseer actor model
  - `orchestrator-subagent-integration.md` remediation lineage still has no true concern/corroboration object family to attach to
- Wizard/Builder handoff contracts are still incomplete for runtime identity and worktree policy:
  - Contract Unification Pass still lacks concrete provider/model/persona governance
  - downstream wizard handoff still lacks requested/effective account, actor/role, and explicit isolation/worktree mode
  - stale “no change to tier/subtask execution” language still appears in summary tables where it can mislead implementers
- Worktree/source-control contracts still need rewrite-native authority rules:
