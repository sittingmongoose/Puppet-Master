# Shard 030: Working Notebook Authority Boundary Addendum (2026-09-05)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5400-L5437

Source SHA256: `62576d2ba5cc5495c0ec34c833274975525938d5686d0e4b45924cbb8a0fed2c`

---

## Working Notebook Authority Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook content never writes Goal state: `objective_text`, revision, state, budgets, and completion are changed only by the two `change_source` owners already defined, and a note, capsule, or checkpoint reference cannot complete, cancel, pause, or edit a Goal. Notes MAY reference Goal revisions read-only. Fresh context-window continuation stays Goal continuation: a transition re-checks the current `user_stop_epoch` immediately before final dispatch (evaluate-time and dispatch-time comparison per the continuation contract), a Stop between admission and dispatch discards the stale continuation, and a fresh window never creates a new Goal, resets Goal state, or adds any phase, tranche, or child-Goal structure — the retired-fields list and the "no workflow state in the Goal" boundary are unchanged.

```yaml
plan_unit_id: GRS-057
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: "Working Notebook content cannot write objective_text, Goal state, budgets, or completion; notes may reference Goal revisions read-only. Fresh-window continuation is Goal continuation under the existing continuation contract: the current user_stop_epoch is captured at evaluation and re-checked at final dispatch, a Stop between admission and dispatch discards the stale continuation, and a fresh window never creates a new Goal, resets Goal state, or reintroduces retired phases/tranches/child Goals."
gui_related: false
gui_classification_reason: Goal authority semantics are runtime behavior, not GUI work.
depends_on: [GRS-051, PP-085]
unblocks: []
acceptance_criteria:
  - A stale continuation note never overrides current objective_text or state.
  - Stop between admission and dispatch wins over pending fresh-window continuation.
  - No new Goal fields or topology appear.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: authority_bypass
reasoning_tier: high
context_scope: goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Prompt_Pipeline.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A32
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A42
preserved_exact_tokens: ["user_stop_epoch", "objective_text", "retired fields"]
negative_constraints:
  - Do not add Goal phases, tranches, child Goals, or a Goal-owned notebook.
  - Do not let note text edit an approved objective or completion state.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md
