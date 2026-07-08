# Shard 031: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/FileSafe.md`

Source lines: L13231-L13279

Source SHA256: `a7b6a7430d1b95fb4cf3a3896953797dcf2ffee60752c3b7b566446934cb2fd4`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### F2-189 - Safe Point And Rollback Policy For WorkNode Execution

```yaml
plan_unit_id: F2-189
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Mutation-capable WorkNode attempts must create or verify a safe point before risky execution, support restore_safe_point_then_retry where required, and record rollback_available in source-control and execution receipts. FileSafe owns the file mutation, safe-point, restore, rollback, evidence, and dirty-state guard inputs consumed by Executor after WorkNode requests are accepted. PlanCompile may reference safe-point requirements in request metadata but does not create safe points or mutate source control.
  Safe-point receipts preserve safe_point_id as the canonical safe-point identity for rollback and retry evidence.
gui_related: false
gui_classification_reason: Safe-point and rollback guard inputs are filesystem/runtime safety contracts.
depends_on: [F2-188, W-072]
unblocks: [EP-100, EP-103, POA-048]
acceptance_criteria:
  - Mutation-capable attempts create or verify a safe point before risky execution.
  - restore_safe_point_then_retry is available where policy requires rollback before retry.
  - Receipts record rollback availability and safe-point identity.
  - PlanCompile does not create safe points or mutate source control.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future safe_point_receipt validation
risk_class: unrecoverable_mutation
reasoning_tier: high
context_scope: worknode_safe_point_rollback
implementation_surfaces: [Plans/FileSafe.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: safe_point_rollback_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0035
  - pldg-20260617-001-plans-to-code-handoff:atom-0037
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "safe_point_id"
  - "restore_safe_point_then_retry"
  - "rollback_available"
  - "source-control execution contract"
  - "safe points"
  - "rollback"
negative_constraints:
  - Do not let PlanCompile create source-control safe points.
owner_hints:
  - Plans/FileSafe.md
  - Plans/Executor_Protocol.md
  - Plans/WorktreeGitImprovement.md
```

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md
