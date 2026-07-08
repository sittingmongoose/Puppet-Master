# Shard 035: FABLE Gate Registry Repair Addendum - 2026-07-07

Source: `Plans/Progression_Gates.md`

Source lines: L3634-L3698

Source SHA256: `a2bf070ae9a07fdda5dda084bb1a12b33215229c9741f916f70528cb5ad2f53b`

---

## FABLE Gate Registry Repair Addendum - 2026-07-07

This addendum closes the FABLE gate-registry portion of the GUI command/wiring repair. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime certification harnesses, generated governance artifacts, or production build tasks.

### PG-061 - FABLE Gate Registry Tombstones And Manual Traceability Status

```yaml
plan_unit_id: PG-061
unit_type: validation_rule
status: accepted
owner_doc: Plans/Progression_Gates.md
canonical_text: >-
  The FABLE gate-registry repair makes GATE-007 and GATE-008 explicit reserved tombstones, strengthens GATE-010
  to reject generic production wiring locations, fabricated command_applied events, and catalog namespace-root rows,
  and records GATE-011, GATE-012, and GATE-013 as manual-pending traceability gates with named owner docs until
  live generated-project validators exist. A successful run-gates result cannot be reported as PASS evidence for
  tombstoned or manual-pending gates unless a validator explicitly targets that gate.
gui_related: false
gui_classification_reason: Defines gate-registry validation and governance status rather than visual presentation.
depends_on: [PG-034, PG-037, PG-039]
unblocks: []
acceptance_criteria:
  - GATE-007 and GATE-008 have visible anchors, tombstone sections, owners, and no hidden executable semantics.
  - GATE-010 fails semantic wiring defects for generic production locations, fabricated command_applied events, and catalog namespace-root production rows.
  - GATE-011, GATE-012, and GATE-013 state their manual-pending dispositions, owner docs, and the validator evidence needed before they can be script-enforced.
  - run-gates passing is not claimed as PASS evidence for GATE-007, GATE-008, GATE-011, GATE-012, or GATE-013.
  - No FileSafe, storage, platform_specs, GUI implementation, broad PlanUnit boilerplate, WorkNodes, NodeSeeds, executable queues, or runtime certification harnesses are created by this repair.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: gate_registry_drift
reasoning_tier: high
context_scope: fable_gui_command_wiring_gate_repair
implementation_surfaces:
  - Plans/Progression_Gates.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: gate_registry_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-progression-gates-registry-and-run-gates-coverage
preserved_exact_tokens:
  - GATE-007
  - GATE-008
  - GATE-011
  - GATE-012
  - GATE-013
  - manual_pending_traceability_tooling
  - manual_pending_requirements_quality_tooling
  - manual_pending_ambiguity_marker_tooling
negative_constraints:
  - Do not treat run-gates passing as PASS evidence for manual-pending or tombstoned gates.
  - Do not reuse tombstoned gate numbers without a governed migration.
  - Do not create runtime certification harnesses or executable build tasks in this repair.
owner_hints:
  - Plans/Progression_Gates.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Decision_Policy.md
  - Plans/assistant-chat-design.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
