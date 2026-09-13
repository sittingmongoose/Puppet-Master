# Shard 012: Compile receipt timing and original dispatch evidence - 2026-09-13

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L1491-L1563

Source SHA256: `06a7df70048390a6a790e364ff8d0544097d7985312401675437137a34b6652d`

---

## Compile receipt timing and original dispatch evidence - 2026-09-13

### PNC-024 - Truthful Compile Worklist Receipt Timing

```yaml
plan_unit_id: PNC-024
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Compile worklists persist only the original assignment and completion receipts actually
  issued at their current lifecycle point. Draft and ready may precede assignment; running
  mandatory parallel work requires the configured minimum distinct non-parent assignments
  and authentic matching assignment receipts before dispatch, at least two. Completion is
  never fabricated before a wave finishes. Completion and certification retain all existing
  required successful receipt, evidence, coverage, currentness and original source checks.
  The adjacent lifecycle and recovery rules are mandatory semantic obligations; a schema
  cardinality lower bound alone cannot prove dispatch or complete coverage.
gui_related: false
gui_classification_reason: Defines compiler source custody, receipt timing and dispatch predicates without a visual surface.
depends_on: [PNC-010, PNC-014, PNC-015, PNC-016, PNC-019, PNC-021, DL-045]
unblocks: []
acceptance_criteria:
  - Draft and ready can retain empty receipt lists and no waves before any original assignment; incremental preparation retains only actual issued receipts.
  - Every persisted wave retains its original typed assignment receipt, and both receipt lists equal the actual receipts belonging to the exact persisted waves.
  - Before dispatch and while running mandatory parallel work, the configured minimum distinct non-parent assignments, at least two, and matching authentic assignment receipts are required.
  - Serial running retains its existing schema behavior; the exact ten broad stages, sixteen stage names and required minimum parallelism remain unchanged.
  - A wave that has not completed needs no completion receipt; completed waves retain the existing complete receipt and durable evidence requirements.
  - Complete worklists and stage or compile certification require all required successful completions, full parallel coverage and original assignment, source and attempt identity.
  - Blocked or cancelled worklists preserve already issued receipts and actual dispatch history; original controller custody distinguishes before-dispatch and after-dispatch cases.
  - Missing, failed, duplicate, foreign, mismatched or stale required evidence never authorizes certification, and required parallel work cannot fall back to one broad parent agent.
  - Existing validator discrepancies remain visible and confer no bypass, lifecycle certification, runtime enablement or readiness clearance.
validation_surfaces:
  - Plans/plans_to_code_handoff.schema.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fabricated_or_premature_compile_receipt
reasoning_tier: high
context_scope: original_compile_receipt_lifecycle
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-045
  - Plans/Plan_To_Node_Compilation.md#PNC-010
  - Plans/Plan_To_Node_Compilation.md#PNC-016
  - reports/event-authority-20260911/step-08-compile-receipt-timing-validation.md
source_atom_ids: []
preserved_exact_tokens: [draft, ready, running, blocked, complete, cancelled, parallelism_required, minimum_parallel_assignments, assignment_receipt_refs, completion_receipt_refs]
negative_constraints:
  - Do not create placeholder receipts, predict their identities or borrow receipts from another wave, stage, attempt or invocation.
  - Do not treat schema checks or retained source contracts as actual dispatch, native installation, completion, certification or governance seal evidence.
  - Do not create WorkNodes, NodeSeeds, GoalRuns, executable queues, runtime launches or production build tasks through this source correction.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md]
```

Draft and ready worklists may have empty assignment and completion receipt lists and no assigned waves. Partially prepared assignments retain only authentic issued receipts. Every persisted wave has its original typed assignment receipt. Receipt lists identify exactly the actual receipts belonging to those persisted waves, preserving original null/presence and parent-only write authority.

Before dispatching a mandatory parallel stage, the controller must possess its configured minimum distinct non-parent assignments, at least two, and their authentic matching assignment receipts. Running requires the same proof. Ready alone does not authorize dispatch. A shortage uses the existing typed block or reduce-scope route. No completion receipt is required for an assignment whose execution has not completed. As results arrive, actual completion receipts and durable evidence join the original assignment identity. Complete worklists and stage or compile certification require every required successful completion, full required parallel coverage, current original source and attempt identity, and existing audit closure. A single arbitrary receipt-list entry cannot establish that coverage.

Blocked or cancelled status does not erase issued receipts or past dispatch obligations. Before-dispatch blocked or cancelled worklists may truthfully have no waves; after dispatch they retain original assignment proof and every completion already received. Recovery uses actual original controller and dispatch custody to distinguish those cases. A status label proves neither historical dispatch nor completion. Failed, foreign, duplicate, stale or mismatched receipts cannot satisfy required successful completion. The sixteen-stage algorithm, mandatory broad-stage parallelism, disabled bootstrap/v1 launch flags, distinct native-runtime enablement, and Executor and Goal Runtime certification boundaries remain unchanged.

The authoritative schema correction is limited to `compile_parallelism_policy` and `compile_worklist` in `Plans/plans_to_code_handoff.schema.json`. Required receipt fields and list types remain. The unconditional nonempty receipt-list predicates are removed from the reusable policy and its broad-stage duplicate; a running or complete worklist with `parallelism_required=true` retains a nonempty assignment list and at least one assigned wave. These structural lower bounds do not replace the configured minimum, distinct original identities, actual dispatch proof or complete successful coverage above. The original complete-worklist condition and entire wave, assignment-receipt and completion-receipt contracts are preserved.

The existing semantic predicate in `scripts/pm-prd-planning-runtime-validate.py` still requires the configured non-parent wave count whenever parallelism is required, including draft and ready before assignment. This is an unresolved validator discrepancy with the truthful pre-assignment contract. Its source-established limitation is not an executed lifecycle result. The current Event Authority task permits no validator edit beyond its already completed Step 3 holding-bucket change; this correction supplies no bypass or green gate claim. A later separately authorized validator correction must preserve exact receipt-set equality, dispatch minimum, original joins and completed-worklist checks. Operational consumers must report this limitation and prove original dispatch and completion custody before authorizing either action.

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md#PNC-010, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-019, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-021, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Decision_Log.md#DL-045
