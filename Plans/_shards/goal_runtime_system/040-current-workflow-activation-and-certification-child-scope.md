# Shard 040: Current Workflow activation and certification child scope

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6951-L7007

Source SHA256: `becb9e14dcd4774151473072c3c6c239eae4e9f14f3608f0ac46d540cd76add0`

---

## Current Workflow activation and certification child scope

GRS-052 retires child Goals and parent completion authority, and GRS-053 gives internal callers the same Goal engine. Neither the older GRS-026/GRS-027 Workflow envelope nor GRS-065's retained complete receipt grammar supplies an exception. Their child-Goal wording is compatibility/source lineage in the current runtime. Workflow stages, WorkGraph dependencies, bounded To-Dos and collaborative participants remain with their existing owners; none is renamed to a child Goal.

Every current original activation, required-set publication, verification/completion decision, certification source issuer and Standard capture must independently read the complete original owner graph and requirements and prove that child Goal/GoalRun parent edges and required-child sets are empty. A supplied empty list, omitted field, absent index or missing source does not prove that fact. Nonempty or unknown original child requirements refuse before new publication, current-writer replay or dependent activation/completion; they are preserved for original history or owner correction, never silently dropped, coerced or converted to another work kind. Every directly callable participant repeats its complete source/owner/currentness predicate after all returning helpers and before its own release/commit; outer publication rechecks the complete joint result. Earlier genuine effects remain preserved on later refusal.

The current Standard writer selects CV-340's `current_standard_certification_custody_v2` refinement, requiring empty `original_certification.child_receipt_refs` and `legacy_goal_receipt.child_receipt_refs` in addition to the independently authenticated empty original requirement set. The stored v2 identity, complete original generic v1 and Standard v2 grammars, source hash recipe, immutable bytes, and retained read routes remain unchanged. Historical reads may return genuine original child refs under their original interpretation and current disclosure permission; they cannot authorize current Goal creation, activation, completion or a new receipt/event. A schema-valid historical row is not an exception to retirement. No new event or registry membership follows.

### GRS-075 - Current Workflow Child-Goal Retirement Admission

```yaml
plan_unit_id: GRS-075
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Current Workflow activation, completion and certification apply GRS-052's retirement of child
  Goals and parent completion authority. Complete original child-Goal requirements and receipt
  arrays must authenticate as empty before new publication or current-writer replay; nonempty
  or unknown sources refuse without coercion. Exact generic and historical receipt grammars and
  original retained disclosure remain separate and confer no current action authority.
gui_related: false
gui_classification_reason: Defines internal current source admission and retained interpretation, with no new visual surface.
depends_on: [GRS-052, GRS-053, GRS-065, CV-340, SP-289]
unblocks: []
acceptance_criteria:
  - Complete original owner graph and required-child sets prove current emptiness; supplied empty arrays or missing sources do not.
  - Nonempty, unknown, omitted or incoherent current child requirements refuse before new publication or writer replay without modifying source history.
  - Each original issuer and final joint publisher repeats complete current source and candidate checks after returning helpers.
  - Current Standard schema and role routing require both child-receipt arrays empty while retained v1/v2 grammar and original bytes remain unchanged.
  - Workflow participants, To-Dos and WorkGraph dependencies are never relabeled child Goals.
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_receipt_version_routes.json
  - Plans/goal_certification_current_scope_fixtures.json
  - reports/event-authority-20260911/step-08-current-child-scope-validation.md
risk_class: retired_child_goal_authority_reintroduced
reasoning_tier: high
context_scope: current_workflow_activation_and_certification_child_scope
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Goal_Runtime_System.md#GRS-052
  - Plans/Goal_Runtime_System.md#GRS-053
  - reports/event-authority-20260911/step-08-current-child-scope-validation.md
negative_constraints:
  - No child Goal, parent-completion authority, new lifecycle, event, runtime instance, or historical conversion.
  - No native/depth/readiness claim, validator modification, frozen audit rewrite or governance seal.
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-052, ContractName:Plans/Goal_Runtime_System.md#GRS-053, ContractName:Plans/Goal_Runtime_System.md#GRS-065, ContractName:Plans/Contracts_V0.md#CV-340, ContractName:Plans/storage-plan.md#SP-289
