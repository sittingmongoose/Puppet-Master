  - `requested_persona_id`
  - `effective_persona_id`
- `Plans/Orchestrator_Page.md` still asks consumers to bind worker and verifier identity using stale/local names:
  - `requested_persona_id`
  - `effective_persona_id`
  - `provider`
  - `model`
- `Plans/Run_Graph_View.md` still presents worker/verifier identity in older shorthand:
  - `Provider / Model`
  - `worker_provider`
  - `worker_model`
  - `verifier_provider`
  - `verifier_model`
  - usage and reasoning fields are split in the graph model without clearly tying back to the canonical requested/effective snapshot contract
- `Plans/Prompt_Pipeline.md` is mostly aligned on field names, but it still carries stale scope wording:
  - run envelope still says `tier`
  - `persona_override_owner_id` still allows `tier_id`

### Impacted docs
- Primary stale consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
- Strong owner docs with residual stale scope wording:
  - `Plans/Prompt_Pipeline.md`
- Canonical owner:
  - `Plans/Contracts_V0.md`

### Contradictions / gaps surfaced
- The docs now have two simultaneous identity drifts:
  - field-name drift
  - scope-language drift
- Consumer docs are still asking for provider/model shorthand where the rewrite now expects requested/effective identity disclosure.
- `requested_persona_id` and `effective_persona_id` are still being named in consumer docs even though the owner contract already disallows them as canonical fields.
- `tier` is still present in owner-level prompt/runtime wording, which keeps leaking stale execution scope back into downstream docs.

### Candidate fixes to carry forward
- Reconcile worker/verifier identity consumers to the canonical requested/effective field set.
- Keep any graph-local display structs derived from the canonical runtime snapshot rather than naming parallel canonical fields.
- Remove `requested_persona_id` / `effective_persona_id` from consumer requirements.
- Reconcile Prompt Pipeline scope language so run-envelope and override-owner wording stop using `tier` / `tier_id` as canonical scope labels.

### Do-not-forget details
- This is now a direct owner-versus-consumer mismatch. The canonical field names already exist.
- The next reconciliation pass for graph and Orchestrator should fix field names and scope language together, not separately.

## Research Progress - 2026-03-17 - Owner docs still leak tier-era scope language into canonical runtime wording

### Targeted docs read
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Run_Modes.md`

### Key findings
- The owner docs now have a split between modern canonical field names and stale canonical scope language.
- `Plans/Prompt_Pipeline.md` still uses tier-era scope in owner-level text:
  - run envelope still says `tier`
  - assembly stages still say `tier/mode/platform/model`
  - orchestration rules still say the prompt flow must not create new execution tiers
  - Persona resolver text still refers to stage/tier/task context
  - `persona_override_owner_id` still allows `tier_id`
- `Plans/Contracts_V0.md` is mixed:
  - it correctly locks canonical requested/effective runtime field names
  - it still names `run.tier_started` / `run.tier_completed` and `run.persona_stage_changed`
  - its examples still include `tier_id` / `tier_type`
- `Plans/storage-plan.md` is the strongest carrier of stale canonical scope:
  - early canonical event table still centers `tier_id`
  - several runtime events are still defined as tier-boundary or tier-start records
  - `tier_runtime_record` is still named as canonical
- `Plans/Run_Modes.md` is relatively less affected, but it still references `HITL tier-boundary approvals`

### Impacted docs
- Primary owner docs:
  - `Plans/Prompt_Pipeline.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
- Strong adjacent owner:
  - `Plans/Run_Modes.md`

### Contradictions / gaps surfaced
- The system now has canonical field-name modernization without canonical scope modernization.
- That is why downstream docs keep mixing:
  - requested/effective runtime identity
  - tier-era execution scope and event families
- As long as owner docs still speak canonically in `tier` terms, consumer docs will keep reconstructing tier-shaped surfaces and payloads even when their field names are updated.

### Candidate fixes to carry forward
- Reconcile owner docs so canonical runtime wording is graph/node/package/seam/lane aligned rather than tier-aligned.
- Keep any surviving `tier` language explicitly marked as compatibility or derived-view vocabulary.
- Reconcile event-family names and examples that still teach `tier_id` / `tier_type` as canonical scope anchors.
- Reconcile Prompt Pipeline scope terms and override-owner wording at the same time as graph/Orchestrator identity cleanup.

### Do-not-forget details
- This is the upstream language source for several downstream consumer drifts already logged.
- Fixing consumer docs without fixing this owner-language seam will not hold.

## Research Progress - 2026-03-17 - Event-family owners still teach tier-boundary and HITL-request-era semantics

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/human-in-the-loop.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/UI_Command_Catalog.md`

### Key findings
- The event-family layer is still one of the last upstream carriers of stale execution semantics.
- `Plans/storage-plan.md` still teaches canonical event families such as:
  - `run.tier_started`
  - `run.tier_completed`
  - `run.verification_result`
  - `run.persona_stage_changed`
  - `run.qa_cycle_started`
  - `run.qa_cycle_completed`
  all with tier-era payload framing
- `Plans/human-in-the-loop.md` is still explicitly built around:
  - `request_id`
  - `tier_id`
  - `tier_type`
  - `request_kind = tier_boundary_approval`
  - redb restore keyed to tier-boundary approval state
- `Plans/Contracts_V0.md` preserves the same split:
  - blocked/recovery contracts already use ordered `allowed_action_ids[]`
  - HITL contracts still preserve `request_id` and `allowed_actions[]` as a distinct request-era family
- Downstream consumers mirror that split:
  - `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` still take `request_id`
  - `Run_Graph_View.md` still exposes `hitl_request_id`
  - `Orchestrator_Page.md` still describes HITL requests as `hitl.*` events keyed by `request_id`

### Impacted docs
- Primary owner docs:
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/Contracts_V0.md`
- Strong stale consumers:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- The blocked/runtime lineage work already moved toward:
  - `node.blocked`
  - `blocked_sequence`
  - ordered `allowed_action_ids[]`
- But HITL owner docs still describe a parallel request-era approval model centered on `request_id`, `tier_id`, and `tier_type`.
- That leaves the system with two competing approval/blocked ontologies:
  - blocked-episode/runtime-native
  - HITL request/tier-boundary-native
- This split now feeds directly into command payloads, graph detail structs, and orchestrator live-status bindings.

### Candidate fixes to carry forward
- Reconcile owner docs so canonical approval/blocking semantics are runtime-native first.
- Keep any surviving HITL request identifiers as family-local compatibility handles or UI-facing lineage fields, not as the stronger approval identity.
- Reconcile graph and orchestrator approval commands away from `request_id` as the primary action target.
- Reconcile `allowed_actions[]` versus `allowed_action_ids[]` language so owner docs do not keep teaching two peer action vocabularies.

### Do-not-forget details
- This seam is upstream of several earlier findings:
  - blocked-family mismatch
  - scope-language drift
  - graph command payload drift
- `human-in-the-loop.md` is now one of the strongest remaining tier-era owner docs.

## Research Progress - 2026-03-17 - Approval identity still splits between blocked episodes and HITL requests

### Targeted docs read
- `Plans/human-in-the-loop.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`

### Key findings
- The approval seam is now precise: the docs currently describe two different action targets for the same family of approval/recovery behavior.
- The runtime-native side is already clear:
  - `waiting_approval` is a blocked/runtime overlay
  - canonical runtime commands use:
    - `run_id`
    - `node_id`
    - `blocked_sequence`
    - `attempt_id?`
  - blocked-state actions map from ordered `allowed_action_ids[]`
- The older HITL-request side still persists in parallel:
  - `human-in-the-loop.md` still defines a canonical HITL request record centered on:
    - `request_id`
    - `tier_id`
    - `tier_type`
    - `request_kind = tier_boundary_approval`
  - `storage-plan.md` still stores `hitl.*` events in that shape
  - `UI_Command_Catalog.md` still gives `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` args with `request_id`
- `human-in-the-loop.md` itself now contains both eras:
  - early section: request-centric tier-boundary approval
  - later addenda: `waiting_approval` as blocked/runtime overlay, `blocked_sequence`, ordered `allowed_action_ids[]`, and canonical runtime commands

### Impacted docs
- Primary owner docs:
  - `Plans/human-in-the-loop.md`
  - `Plans/storage-plan.md`
  - `Plans/Contracts_V0.md`
