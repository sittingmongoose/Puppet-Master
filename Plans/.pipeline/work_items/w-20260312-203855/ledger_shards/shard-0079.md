- Strong stale consumer:
  - `Plans/UI_Command_Catalog.md`
- Strong aligned owner:
  - `Plans/Executor_Protocol.md`

### Contradictions / gaps surfaced
- The docs still leave it ambiguous whether approval acts on:
  - a HITL request object
  - or a blocked/runtime episode
- That ambiguity is no longer harmless because command payloads, restart restore, graph actions, and blocked projections are now split across the two identities.
- `allowed_action_ids[]` has already won at the runtime-command layer, but approval targeting is still split between `request_id` and `blocked_sequence`.

### Candidate fixes to carry forward
- Collapse approval identity onto the runtime/blocked model.
- Keep any surviving `request_id` only as lineage or compatibility metadata for historical replay, not as the primary approval action target.
- Reconcile `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` away from `request_id` args and toward runtime-native blocked identity.
- Reconcile HITL restore/state docs so restart behavior restores blocked approval episodes rather than a competing tier-boundary request object.

### Do-not-forget details
- This is the cleanest remaining bridge between the old HITL plan and the new blocked/runtime command model.
- `Executor_Protocol.md` is already ahead of `human-in-the-loop.md` on this seam.

## Research Progress - 2026-03-17 - Graph and Orchestrator approval consumers still preserve HITL-request-era fields

### Targeted docs read
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/human-in-the-loop.md`

### Key findings
- The graph and Orchestrator surfaces now show a direct mixed-era contract in one place.
- `Plans/UI_Command_Catalog.md` already says:
  - blocked-state buttons across GUI, chat, graph, and orchestrator MUST map from `allowed_action_ids[]` to canonical `cmd.runtime.*` commands
- But the same catalog still preserves graph-specific HITL commands:
  - `cmd.graph.approve_hitl`
  - `cmd.graph.deny_hitl`
  with `request_id` args
- `Plans/Run_Graph_View.md` is internally split:
  - command table uses `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl`
  - data model still carries `hitl_request_id`
  - later addenda already align blocked views on `blocked_sequence` and `allowed_action_ids[]`
- `Plans/Orchestrator_Page.md` shows the same mixed model:
  - live status still says HITL requests are keyed by `request_id`
  - blocked/recovery state already binds to `blocked_sequence` and `allowed_action_ids[]`
- `Plans/human-in-the-loop.md` still feeds the older consumer side with:
  - request-centric button copy
  - request-centric persistence language
  - tier-boundary approval CTA framing

### Impacted docs
- Primary stale consumers:
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/UI_Command_Catalog.md`
- Strong upstream source:
  - `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- Consumer docs now simultaneously claim:
  - blocked-state actions map from canonical `allowed_action_ids[]`
  - graph approval actions target `request_id`
- `hitl_request_id` remains in the graph view-model even though the surrounding blocked/recovery model is already moving toward blocked-episode identity.
- Orchestrator live-status documentation still uses `TierChanged` / `request_id` language beside newer blocked-projection contracts.

### Candidate fixes to carry forward
- Reconcile graph and Orchestrator approval actions onto canonical runtime commands.
- Remove `request_id` as the primary action target from graph command payloads.
- Replace `hitl_request_id` in graph data requirements with blocked/runtime approval identity or explicit compatibility lineage-only fields.
- Reconcile Orchestrator live-status dependencies so request-centric HITL bindings stop competing with blocked-projection bindings.

### Do-not-forget details
- This seam is now purely consumer-side. The runtime command layer already has the stronger model.
- `UI_Command_Catalog.md` currently contradicts itself within the same approval/recovery area.

## Research Progress - 2026-03-17 - `human-in-the-loop.md` now contains direct canon-supersession, not additive refinement

### Targeted docs read
- `Plans/human-in-the-loop.md`

### Key findings
- `Plans/human-in-the-loop.md` now has a sharp internal split between:
  - older base text
  - later canonical correction addenda
- The later sections are not merely additive. They directly supersede the earlier request-centric model.
- Older base text still says:
  - canonical HITL request contract is `request_id` + `tier_id` + `tier_type` + `request_kind`
  - replay/restore and command dispatch are deterministic across `request_id`
  - redb persists checkpoint/approval state keyed by request/tier/request_kind/allowed_actions
  - the UX is fundamentally “pause at tier boundary and approve next tier”
- Later canonical correction text says:
  - `waiting_approval` is a blocked/runtime overlay
  - canonical runtime-facing fields are `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, preserved-local-work, prerequisite metadata, and `detail_ref?`
  - deprecated field names such as `allowed_actions[]` must not appear in new canonical schemas
  - persistence should be through canonical blocked/runtime records
  - visible labels must bind to the shared runtime recovery commands

### Impacted docs
- Primary owner doc:
  - `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- The older request-centric sections are no longer compatible with the later canonical correction sections.
- If the earlier text remains in place as ordinary prose, downstream readers will keep treating the document as endorsing two peer approval models.
- This is now a document-structure problem as much as a design problem: the later correction needs clear precedence over the earlier sections.

### Candidate fixes to carry forward
- Treat the earlier request-centric text as retired or compatibility-only rather than leaving it as live canonical base prose.
- Reframe the doc around:
  - blocked/runtime approval overlay
  - canonical runtime actions
  - blocked-episode persistence
- Keep any surviving `request_id` text explicitly labeled as compatibility lineage or historical replay support only.

### Do-not-forget details
- This is not a subtle drift. The doc now states mutually incompatible canon in one file.
- Reconciliation must retire or rewrite the earlier sections, not merely append another addendum.

## Research Progress - 2026-03-17 - Graph approval command shapes are now internally inconsistent as well as stale

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`

### Key findings
- The graph approval commands now fail on two separate dimensions:
  - they are stale against the canonical runtime command model
  - they are internally inconsistent between the catalog and the graph spec
- `Plans/UI_Command_Catalog.md` says:
  - `cmd.graph.approve_hitl` args = `{ request_id, node_id, rationale }`
  - `cmd.graph.deny_hitl` args = `{ request_id, node_id, rationale, resolution? }`
- `Plans/Run_Graph_View.md` says:
  - `cmd.graph.approve_hitl` args = `{ node_id: string, rationale: string }`
  - `cmd.graph.deny_hitl` args = `{ node_id: string, rationale: string }`
- Both are already contradicted by the runtime command consolidation:
  - `approve` -> `cmd.runtime.approve` -> `{ run_id, node_id, blocked_sequence, attempt_id? }`
  - `decline` -> `cmd.runtime.decline` -> `{ run_id, node_id, blocked_sequence, attempt_id? }`

### Impacted docs
- Primary stale/inconsistent consumers:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- The graph approval commands do not currently have one stable args contract even before considering the broader runtime-model rewrite.
- The command catalog and the graph spec cannot both be correct.
- The canonical runtime action model has already made both versions obsolete.

### Candidate fixes to carry forward
- Remove the graph-specific approval command contract as a primary action model.
- Reconcile graph approval controls as wrappers over canonical runtime commands.
- If graph-local wrappers remain for UX readability, their normalization target and arg derivation must be explicit and consistent with `cmd.runtime.approve` / `cmd.runtime.decline`.

### Do-not-forget details
- This is a hard spec-integrity defect, not a style issue.
- It is one of the clearest examples where the stale approval model is now breaking exact command contracts.

## Research Progress - 2026-03-17 - Live-status sourcing still mixes canonical runtime records with legacy `PuppetMasterEvent::*` streams

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`

### Key findings
- The live-status layer is still split between:
  - newer canonical runtime records and projections
  - older `PuppetMasterEvent::*` streams from the tier-era orchestrator model
- `Plans/Orchestrator_Page.md` still documents live status primarily through:
  - `PuppetMasterEvent::TierChanged`
  - `PuppetMasterEvent::IterationStart`
  - `PuppetMasterEvent::Output`
  - `PuppetMasterEvent::UserInteractionRequired`
  - `PuppetMasterEvent::EvidenceStored`
- `Plans/Run_Graph_View.md` does the same in its event-update table:
  - `TierChanged`
  - `IterationStart`
  - `GateStart`
  - `GateComplete`
  - `UserInteractionRequired`
  - `EvidenceStored`
- The owner docs already provide a stronger canonical runtime source set:
  - `scheduler.pass`
  - `node.blocked`
  - `safe_point.created`
  - `safe_point.restored`
  - `remediation.spawned`
  - `remediation.resolved`
  - blocked projections keyed by `run_id`, `node_id`, `blocked_sequence`
  - attempt records keyed by `run_id`, `node_id`, `attempt_id`
- Both consumer docs already consume some of the newer runtime lineage concepts in later sections, which makes the early event-source tables internally stale rather than merely incomplete.

### Impacted docs
- Primary stale consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
- Strong owner docs:
  - `Plans/storage-plan.md`
  - `Plans/Contracts_V0.md`
