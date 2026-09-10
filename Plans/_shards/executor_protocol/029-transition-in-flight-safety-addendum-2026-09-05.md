# Shard 029: Transition In-Flight Safety Addendum (2026-09-05)

Source: `Plans/Executor_Protocol.md`

Source lines: L7227-L7263

Source SHA256: `83949ad194756c4c2addb257dade79c089dc9f1bb3ce21bd36fced9b192382e5`

---

## Transition In-Flight Safety Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A fresh context-window transition (Plans/Prompt_Pipeline.md PP-085) is allowed only at a safe boundary: before discarding active context, the executor identifies a safe point, reconciles or retains every in-flight operation under its existing receipt identity (worktree, tool, and external operations keep their `attempt_id`-bound receipts; unknown external outcomes enter normal reconciliation, never blind re-execution), and persists required checkpoints. Context changes alone never create a new attempt; whether a true retry starts a new `attempt_id` remains the executor's decision under the existing attempt-identity rule. Late tool results and external callbacks arriving after a transition are fenced by `replan_generation`/stop epoch and cannot reactivate cancelled or superseded work; recovery after a transition consults durable attempt records and safe points, never notebook prose.

```yaml
plan_unit_id: EP-115
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: Fresh-window transitions occur only at safe boundaries. In-flight operations keep their existing operation/receipt identities across the transition and reconcile through the normal paths; unknown side-effect outcomes are never blindly re-executed. Context changes alone do not create a new attempt; the executor decides retry identity per the existing attempt-identity rule. Stop/cancel, permissions, topology, and relevant generations are re-checked at final dispatch, and late results are fenced and cannot reactivate cancelled work.
gui_related: false
gui_classification_reason: Executor safety is runtime behavior, not GUI work.
depends_on: [EP-086, SIR-036]
unblocks: []
acceptance_criteria:
  - In-flight mutations during a transition request wait for a safe boundary or retain receipt identity for reconciliation.
  - Late results do not reactivate cancelled work.
  - Crash recovery around transitions repeats no mutation and invents no completion.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: duplicate_side_effect
reasoning_tier: high
context_scope: executor_protocol
implementation_surfaces: [Plans/Executor_Protocol.md, Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A24
preserved_exact_tokens: ["safe boundary", "attempt_id", "replan_generation", "blind re-execution"]
negative_constraints:
  - Do not replay a mutation merely to reconstruct context.
  - Do not treat a context change as a new attempt by itself.
owner_hints: [Plans/Executor_Protocol.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Prompt_Pipeline.md
