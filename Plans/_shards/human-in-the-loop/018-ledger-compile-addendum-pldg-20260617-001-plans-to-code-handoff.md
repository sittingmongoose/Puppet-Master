# Shard 018: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/human-in-the-loop.md`

Source lines: L2415-L2461

Source SHA256: `7aaa04e47769b1e276e701736ff33f9200125da8385a05d5fe9c5eb0be5c87f6`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### HITL-036 - Explicit HITL Checkpoints For Plans-To-Code

```yaml
plan_unit_id: HITL-036
unit_type: requirement
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: >-
  HITL remains an explicit mode for plans-to-code execution. When enabled, it may add configured package, seam, promotion, destructive-operation, or critical certification checkpoints, but these checkpoints are not required for correctness in default hands-off mode. HITL consumes Permissions_System critical-escalation policy and Goal_Runtime_System autonomy policy; it does not replace internal Auditor, Overseer, test, source-control, or high-effort repair loops.
  Configured checkpoints may pause for credentials/secrets or other critical authority blockers only when HITL policy enables them or critical escalation policy requires them.
gui_related: true
gui_classification_reason: HITL checkpoints, approvals, and continuation prompts are user-visible interaction surfaces.
depends_on: [PS-116]
unblocks: [OP-024]
acceptance_criteria:
  - HITL checkpoints are opt-in mode behavior.
  - Default mode stays hands-off and critical-only for user escalation.
  - HITL does not short-circuit internal repair, audit, test, source-control, or high-effort routes unless configured checkpoint policy requires a pause.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future HITL checkpoint review
risk_class: hitl_required_for_correctness_drift
reasoning_tier: standard
context_scope: plans_to_code_hitl
implementation_surfaces: [Plans/human-in-the-loop.md, Plans/Permissions_System.md, Plans/Goal_Runtime_System.md]
node_compile_hint: {mode: explicit_hitl_checkpoints, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "HITL"
  - "hands-off"
  - "configured checkpoints"
  - "critical authority blockers"
negative_constraints:
  - Do not make HITL required for default correctness.
owner_hints:
  - Plans/human-in-the-loop.md
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Goal_Runtime_System.md
