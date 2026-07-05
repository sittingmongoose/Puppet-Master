# Shard 015: Implementation Readiness Gate Addendum - 2026-07-05

Source: `Plans/Planning_Wizard.md`

Source lines: L1437-L1506

Source SHA256: `3a46978d5e3bb44d6cda74fc357e1a7bd98f1d44db70da59e978b3c5c2f277b4`

---

## Implementation Readiness Gate Addendum - 2026-07-05

This addendum installs the Planning Wizard buildability gate without creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime dispatch, production build tasks, generated governance seal artifacts, or executable PlanCompile artifacts.

### PWIZ-018 - Approve And Build Buildability Gate

```yaml
plan_unit_id: PWIZ-018
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Captured source, plan-complete documentation, PlanUnit indexes, semantic closure, schema existence, wiring JSON
  existence, and validator success are separate preconditions and none of them prove implementation buildability.
  Planning Wizard final review must represent the ladder as Captured != Plan-complete != Buildable. The
  `cmd.planning_wizard.approve_and_build` control is disabled unless
  `Plans/.implementation_readiness/buildability_gate_report.json` reports `buildability_gate_passed=true`.
  When disabled, the final-review state projection must list each currently open blocker family and the exact owner
  docs from the buildability report. `PNC-019` from `Plans/.plan_index/node_readiness_report.json` is a hard disabled
  reason only while the report's node_readiness.hard_disabled projection is true, until executable lifecycle
  certification evidence proves Approve And Build through PlanCompile, Executor intake, activation, Orchestrator
  projection, testing evidence, cancellation/restart, and negative-case rejection. PNC-019 bootstrap authority for
  the compiler/harness/certifier path is not ordinary Approve And Build enablement and must remain disabled for
  product work unless the buildability gate passes.
gui_related: true
gui_classification_reason: Defines final-review button enablement and disabled reason behavior in the Planning Wizard GUI.
depends_on: [PWIZ-010, PWIZ-012, PWIZ-014, PNC-019, PNC-022]
unblocks: [UIW-009, PG-060]
acceptance_criteria:
  - Planning Wizard distinguishes Captured, Plan-complete, and Buildable states.
  - Approve And Build is disabled whenever buildability_gate_passed is false.
  - The disabled reason lists currently open blocker families and exact owner docs from Plans/.implementation_readiness/buildability_gate_report.json.
  - PNC-019 appears as a hard disabled reason while node readiness remains blocked_runtime_certification_incomplete.
  - PNC-019 bootstrap authority does not enable ordinary product Approve And Build or suppress open blocker-family disabled reasons.
  - Closed or accepted_risk readiness-blocker rows may remain as historical evidence without keeping Approve And Build disabled.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks are created by this gate.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-index.py validate
risk_class: false_buildability_enablement
reasoning_tier: high
context_scope: planning_wizard_final_review_buildability_gate
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/.implementation_readiness/buildability_gate_report.json
  - Plans/.implementation_readiness/readiness_blockers.jsonl
  - Plans/.plan_index/node_readiness_report.json
node_compile_hint:
  mode: approve_and_build_buildability_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - source_ref:chat:2026-07-05-implementation-readiness-buildability-gate
  - Plans/Plan_To_Node_Compilation.md#PNC-019
preserved_exact_tokens:
  - "Captured != Plan-complete != Buildable"
  - "Approve And Build is disabled unless buildability gate passes"
  - "blocker families and exact owner docs"
  - "PNC-019"
negative_constraints:
  - Do not treat source preservation, schema existence, wiring JSON existence, semantic closure, or passing validators as proof of implementation buildability.
  - Do not allow Approve And Build to emit PlanApproved or create/bind PlanCompileRun while the buildability gate is blocked.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from this gate.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Progression_Gates.md
```
