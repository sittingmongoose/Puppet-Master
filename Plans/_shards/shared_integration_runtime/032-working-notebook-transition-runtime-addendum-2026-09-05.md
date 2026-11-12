# Shard 032: Working Notebook Transition Runtime Addendum (2026-09-05)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2003-L2085

Source SHA256: `ff840c5d2b888750a4b55fb1cd65fcb077a72c155434a39ca91b156f182c6306`

---

## Working Notebook Transition Runtime Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Transition policy is owned by `Plans/Prompt_Pipeline.md` (PP-085); this addendum routes the runtime responsibilities through existing Shared Integration Runtime machinery. A fresh context-window transition is orchestrated like any other durable operation: lifecycle records bind `OperationId`, owner generation, topology generation, projection generation, and an idempotency key; stale generations are rejected with an explicit receipt. Admission of the reconstructed request reuses `ProviderDispatchAdmissionService` unchanged — the exact new visible bytes, route, account, permission snapshot, topology, and mutation evidence are admitted and the single-use receipt is consumed atomically at dispatch; any change invalidates the receipt and forces safe re-admission.

Recovery around a transition reuses §14.2 reconciliation, not new semantics: startup reconciles nonterminal transitions and their in-flight operations against receipts, processes, lease generations, and owner truth, with outcomes `resumed | replayed | rolled_back | cleaned | quarantined | manual_recovery_required | terminal_unknown_with_disclosure`; absence of evidence never becomes success. The required cut points and their durable records are: before checkpoint (nothing durable to consult; request stays `requested`), mid-write (partial notebook writes stay uncommitted; commit barrier per `Plans/storage-plan.md`), after commit before admission (committed checkpoint is consulted; re-admission required), after admission before native activation (receipt re-validated against current generations and the current stop epoch; cancelled if a newer stop epoch exists), after native activation before PM observation (last valid PM checkpoint and authoritative history references are kept; the provider operation outcome is reconciled, never blindly replayed or promised as rollback), after PM observation before resumed turn (reconstructed request re-admitted against current state), and after partial resumed output (normal partial-turn reconciliation; no invented completion). A user Stop always wins over a pending fresh-window continuation, and late results are fenced by generation so they cannot reactivate cancelled work.

Host transfer uses actual custody: Project notebooks/checkpoints remain Project Vault data and app scratch uses SIR-037/055 Server/thread-owned app custody. PSB-006/007 expires/fences the source lease into expired_pending_reconciliation and rejects stale renew/release/mutation; destination resumes only after current access/route/root/Stop checks. No app Vault is fabricated and no transfer auto-resumes paused work.

```yaml
plan_unit_id: SIR-036
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Fresh context-window transitions are durable Shared Runtime operations. Their lifecycle records bind OperationId, owner/topology/projection generations, and an idempotency key; admission of the reconstructed request reuses ProviderDispatchAdmissionService with a single-use receipt bound to the exact new bytes, route, account, permission, topology, and mutation state, and any change forces safe re-admission. Crash and in-flight safety reuse §14.2 reconciliation across the seven transition cut points; unknown provider operation outcomes are reconciled, never blindly replayed or promised as rollback. A user Stop wins over a pending continuation, and late results are generation-fenced so they cannot reactivate cancelled work.
gui_related: false
gui_classification_reason: Transition runtime is backend behavior, not GUI work.
depends_on: [SIR-035, PP-085]
unblocks: [SIR-037]
acceptance_criteria:
  - Crash-before/after-commit and crash-after-activation fixtures reconcile deterministically without duplicate mutation or invented completion.
  - Stop between admission and dispatch discards the stale continuation.
  - Late results never reactivate cancelled work.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: unsafe_recovery
reasoning_tier: high
context_scope: shared_runtime
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C15
preserved_exact_tokens: ["ProviderDispatchAdmissionService", "terminal_unknown_with_disclosure", "cut points", "generation-fenced"]
negative_constraints:
  - Do not replay a mutation merely to reconstruct context.
  - Do not issue dispatch admission from an adapter.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Goal_Runtime_System.md

```yaml
plan_unit_id: SIR-037
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Project notebook/checkpoint records remain in the one Project Vault under its existing lease/topology
  authority. WN-021's app notebook/checkpoint edition lives in the actual Server app store with thread/Computer
  and app writer/lease, no Vault before conversion. PSB-006/007 fences old holders and stale
  renewal/release/mutation; destination access/route/currentness verifies before resume. N25 maps carried
  canonical records explicitly, preserving independently retained source history. Notes carry no raw
  credentials or account/host authority.
gui_related: false
gui_classification_reason: Lease fencing is runtime behavior, not GUI work.
depends_on: [SIR-036]
unblocks: []
acceptance_criteria:
  - A late writer on the previous host is rejected after cutover.
  - No raw credential appears in any notebook or checkpoint payload.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_writer
reasoning_tier: standard
context_scope: shared_runtime
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/Multi-Account.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_packet:PM-WNC-2026-09-05-v1:WNC-I11"
  - "source_packet:PM-WNC-2026-09-05-v1:WNC-A47"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens: ["expired_pending_reconciliation", "stale holder", "Project Vault data"]
negative_constraints:
  - Do not let an old host keep writing after lease transfer.
  - Do not infer credentials from note or checkpoint content.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Multi-Account.md
