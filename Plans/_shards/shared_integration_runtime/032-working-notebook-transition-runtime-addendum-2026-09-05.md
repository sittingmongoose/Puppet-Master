# Shard 032: Working Notebook Transition Runtime Addendum (2026-09-05)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1865-L1938

Source SHA256: `68f490730360190a462e589a2e83adc0276929bc4a170d5a69b7be7d9f502852`

---

## Working Notebook Transition Runtime Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Transition policy is owned by `Plans/Prompt_Pipeline.md` (PP-085); this addendum routes the runtime responsibilities through existing Shared Integration Runtime machinery. A fresh context-window transition is orchestrated like any other durable operation: lifecycle records bind `OperationId`, owner generation, topology generation, projection generation, and an idempotency key; stale generations are rejected with an explicit receipt. Admission of the reconstructed request reuses `ProviderDispatchAdmissionService` unchanged — the exact new visible bytes, route, account, permission snapshot, topology, and mutation evidence are admitted and the single-use receipt is consumed atomically at dispatch; any change invalidates the receipt and forces safe re-admission.

Recovery around a transition reuses §14.2 reconciliation, not new semantics: startup reconciles nonterminal transitions and their in-flight operations against receipts, processes, lease generations, and owner truth, with outcomes `resumed | replayed | rolled_back | cleaned | quarantined | manual_recovery_required | terminal_unknown_with_disclosure`; absence of evidence never becomes success. The required cut points and their durable records are: before checkpoint (nothing durable to consult; request stays `requested`), mid-write (partial notebook writes stay uncommitted; commit barrier per `Plans/storage-plan.md`), after commit before admission (committed checkpoint is consulted; re-admission required), after admission before native activation (receipt re-validated against current generations and the current stop epoch; cancelled if a newer stop epoch exists), after native activation before PM observation (last valid PM checkpoint and authoritative history references are kept; the provider operation outcome is reconciled, never blindly replayed or promised as rollback), after PM observation before resumed turn (reconstructed request re-admitted against current state), and after partial resumed output (normal partial-turn reconciliation; no invented completion). A user Stop always wins over a pending fresh-window continuation, and late results are fenced by generation so they cannot reactivate cancelled work.

Host transfer: notebook and checkpoint records are Project Vault data. After `Plans/Project_Sync_and_Backbone.md` cutover, the old host's lease expires into `expired_pending_reconciliation` and a stale holder cannot renew, release, or mutate notebook state; the destination resumes only after current access/route validation.

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
canonical_text: Notebook and checkpoint records are Project Vault data under existing lease and topology authority. After Project Move cutover the previous host lease enters expired_pending_reconciliation and a stale holder cannot renew, release, or mutate notebook or checkpoint state; the destination host resumes only after current access and route validation. Notebook payloads never contain raw credentials, and account or machine changes revalidate notebook scope, authorization, and route without inferring credentials from notes.
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
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I11
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A47
preserved_exact_tokens: ["expired_pending_reconciliation", "stale holder", "Project Vault data"]
negative_constraints:
  - Do not let an old host keep writing after lease transfer.
  - Do not infer credentials from note or checkpoint content.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Multi-Account.md
