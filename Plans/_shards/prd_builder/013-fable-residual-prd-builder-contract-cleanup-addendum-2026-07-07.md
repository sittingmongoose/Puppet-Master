# Shard 013: FABLE Residual PRD Builder Contract Cleanup Addendum - 2026-07-07

Source: `Plans/PRD_Builder.md`

Source lines: L798-L859

Source SHA256: `27dacbbe7a1bcad074c650e89c8411bf044858dcacfeb0236b7b9492a590cbda`

---

## FABLE Residual PRD Builder Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High PRD Builder rows for conflict records, scoring defaults, resource defaults, and approval command naming. It does not certify runtime readiness or create build tasks.

### PRDB-011 - Conflict, Scoring, Resource Defaults, And Approval Command Contract

```yaml
plan_unit_id: PRDB-011
unit_type: schema_contract
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder conflict resolution uses a typed ConflictRecord and deterministic scoring defaults before a PRD can
  be approved into Planning Wizard. Conflicts record conflict_id, prd_id, field_path, competing_values[], source_refs[],
  confidence_scores[], detected_at_ms, resolution_state, selected_value?, resolver_actor?, resolved_at_ms?, and
  audit_receipt_ref?. Readiness scoring uses weighted completeness, evidence, conflict, dependency, and resource axes,
  while resource defaults provide explicit time, token, cost, provider, and review placeholders instead of silent nulls.
gui_related: true
gui_classification_reason: PRD conflict review, scoring, and approval are user-visible Planning Wizard handoff surfaces.
depends_on: [PRDB-005, PRDB-007, PRDB-008, PLS-015]
unblocks: []
acceptance_criteria:
  - ConflictRecord tie-break order is explicit user resolution, higher-authority source_ref, latest accepted user correction, higher confidence, then blocked_requires_user_decision.
  - User resolution command is cmd.prd_builder.resolve_conflict with prd_id, conflict_id, selected_value, optional rationale, and actor_ref.
  - Readiness score defaults are completeness 0.35, evidence 0.25, conflicts 0.20, dependencies 0.10, resources 0.10, with approve threshold >= 0.85 and conflicts axis requiring no blocking conflicts.
  - Resource defaults include estimated_tokens = unknown, estimated_cost_microusd = unknown, max_review_minutes = 30, provider_preference = unset, and required_human_review = true when estimates are unknown.
  - The canonical approval command is cmd.prd_builder.approve_for_planning_wizard; compatibility alias cmd.prd_builder.approve_for_planning must project to the canonical command and emit the same approval receipt.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_prd_builder_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: prd_builder_residual_contract_defaults
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1203
  - fablereport.md:1204
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "ConflictRecord"
  - "cmd.prd_builder.approve_for_planning_wizard"
  - "cmd.prd_builder.approve_for_planning"
  - "readiness scoring"
  - "resource defaults"
negative_constraints:
  - Do not approve a PRD with unresolved blocking conflicts by scoring alone.
  - Do not silently substitute resource defaults as runtime capacity proof.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime certification evidence, or production build tasks.
owner_hints:
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/UI_Command_Catalog.md
```
