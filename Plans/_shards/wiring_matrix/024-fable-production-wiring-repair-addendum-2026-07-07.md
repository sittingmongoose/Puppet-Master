# Shard 024: FABLE Production Wiring Repair Addendum - 2026-07-07

Source: `Plans/Wiring_Matrix.md`

Source lines: L3387-L3452

Source SHA256: `19194fcefd8d6cea265679176a05cf90c19065b8e276eb8accd9d94a7b8ae9c2`

---

## FABLE Production Wiring Repair Addendum - 2026-07-07

This addendum closes the FABLE production wiring portion of the GUI command/wiring repair. It records contract obligations for `Plans/Wiring_Matrix.production.json` and `Plans/Wiring_Matrix.production.exclusions.json`; it does not create WorkNodes, NodeSeeds, executable queues, runtime handlers, Slint/Rust implementation files, generated governance artifacts, or production build tasks.

### WM-042 - FABLE Production Wiring Semantic Repair

```yaml
plan_unit_id: WM-042
unit_type: validation_rule
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The FABLE production wiring repair requires the production wiring matrix to cover cataloged UI commands after
  exact exclusions, use concrete owner-surface locations instead of generic Cataloged GUI surface rows, remove
  bare namespace-root production rows, replace fabricated command_applied placeholder events with canonical
  event types or explicit no-persist dispatch and route/open receipts, and keep the PRD Builder to Planning Wizard
  to runtime approval to Plan Compile open-build chain wired with projected availability and disabled reasons.
gui_related: true
gui_classification_reason: Defines user-visible command wiring, projected availability, disabled reasons, and route/open behavior.
depends_on: [UCC-108]
unblocks: [PG-061]
acceptance_criteria:
  - validate-wiring-matrix passes against the production matrix and exact exclusion list.
  - No production row uses `Cataloged GUI surface` as a concrete location.
  - No production row emits `*.command_applied` placeholder events.
  - Bare command namespace roots are excluded as parser artifacts or compatibility roots, not represented as production UI rows.
  - Commands with no persisted domain event declare explicit no-persist dispatch or route/open receipts and event-test requirements.
  - Launch-chain rows preserve CAS/currentness, projected availability, disabled reasons, and receipt/event effects without claiming runtime buildability.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: production_wiring_semantic_drift
reasoning_tier: high
context_scope: fable_gui_command_wiring_gate_repair
implementation_surfaces:
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/UI_Command_Catalog.md
  - future UI command dispatcher fixtures
node_compile_hint:
  mode: production_wiring_semantic_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-wiring-matrix-preimplementation-and-placeholder-events
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-launch-approval-chain-preimplementation-proof
preserved_exact_tokens:
  - Cataloged GUI surface
  - "*.command_applied"
  - cmd.prd_builder.approve_for_planning_wizard
  - cmd.planning_wizard.approve_and_build
  - cmd.runtime.approve
  - cmd.plan_compile.open_build
negative_constraints:
  - Do not treat wiring JSON existence as runtime certification or buildability proof.
  - Do not create runtime handlers, WorkNodes, NodeSeeds, executable queues, or production build tasks.
  - Do not fabricate command_applied events for receipt-only or route/open commands.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/PRD_Builder.md
  - Plans/Planning_Wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```
