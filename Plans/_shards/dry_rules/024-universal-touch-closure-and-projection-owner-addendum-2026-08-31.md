# Shard 024: Universal touch-closure and projection-owner addendum - 2026-08-31

Source: `Plans/DRY_Rules.md`

Source lines: L2406-L2455

Source SHA256: `595e587a48b45dbe60cfa50b0191bdfd70d86f1f7943227f32d39c85dd8ed3ec`

---

## Universal touch-closure and projection-owner addendum - 2026-08-31

Every capability touched by the Settings, Product Onboarding, Guided Tour, Doctor, Server/WAN/Backup, Browser/Capture, SCM/Forge/Origin, plugin, and full-thread-performance wave must have one machine-readable row in `Plans/touch_closure.json`. A row is complete only when it routes one requirement to one canonical owner and PlanUnit, one DRY schema or typed local UI-action contract, one command/handler path where a domain operation exists, all intended GUI consumers in reverse, and named test/evidence and residual-risk boundaries. Paint, typography, animation tokens, hover-overlay presentation, and local disclosure state remain Final GUI/UI-action concerns and must not be promoted into false domain commands.

Settings, Onboarding, Guided Tour, Doctor, and PMConcept7 remain consumers. They may cache and render owner projections, open exact owner routes, and observe `ObservableWork` and receipts, but they cannot duplicate Server, route, backup, Browser, capture, SCM, forge, plugin, Project, Named Plan, installation, authentication, update, storage, or repair state machines. `AuthBrowserSession` is outside agent, adapter, capture, inspection, replay, export, and restore authority. A concept simulation is not a native handler, production wiring receipt, runtime result, or Slint certification.

The closure validator fails on duplicate command/action IDs, competing owners, orphan controls, command-without-handler, handler-without-command, missing GUI reverse coverage, stale PlanRefs, undocumented local-action exemptions, or incomplete closure dimensions. A row may remain `partial`, `blocked`, or `missing`; it must not be relabeled `implemented` merely because canon, schema, fixtures, PMConcept7 behavior, or browser evidence exists.

ContractRef: ContractName:Plans/touch_closure.json, SchemaID:touch_closure.schema.json, ContractName:Plans/Settings_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

### DR-040 - Universal touch closure and sole-owner projection law

```yaml
plan_unit_id: DR-040
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: Every touched system, command, typed local UI action, route, control, setting, and migration has exactly one Touch Closure row connecting requirement evidence, canonical owner and PlanUnit, one DRY contract, one sole handler route, GUI and reverse coverage, availability and disabled reason, events or receipts, ObservableWork, persistence or migration, tests, evidence class, disposition, and residual risk. Consumer GUIs render or route owner state and never create parallel runtimes. Presentation-only behavior remains a typed local UI action or theme/motion token rather than a false domain command, and concept/browser/static evidence never becomes native runtime or Slint certification.
gui_related: true
gui_classification_reason: Governs every visible control's owner route, action type, disabled state, and evidence boundary.
split_recommended: false
depends_on: [DR-039, UIW-012, WM-045]
unblocks: [UIW-013, WM-046]
acceptance_criteria:
  - Plans/touch_closure.json has one unique complete row for every touched command and typed local UI action.
  - Duplicate owners or IDs, orphan controls, missing handler/command direction, missing GUI reverse coverage, stale PlanRefs, and incomplete dimensions fail verification.
  - Paint, typography, motion, hover-overlay, and local disclosure state are not assigned fake domain commands.
  - Static canon, schemas, fixtures, browser concepts, and browser tests retain distinct evidence classes and cannot imply native runtime or Slint certification.
  - Partial, blocked, and missing dispositions retain named residual risk rather than being promoted to implemented.
validation_surfaces:
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_owner_or_false_touch_closure
reasoning_tier: high
context_scope: universal_touch_closure
implementation_surfaces: [Plans/DRY_Rules.md, Plans/touch_closure.json, Plans/touch_closure.schema.json, scripts/pm-touch-closure-verify.py]
node_compile_hint: {mode: touch_closure_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Dependency_and_Work_Correction_2026-08-13
  - PM_Onboarding_Doctor_Dependency_and_Work_Correction_2026-08-13
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [ObservableWork, AuthBrowserSession, implemented, already_current_with_evidence, superseded, retired_bakeoff_process_only, partial, blocked, missing]
negative_constraints:
  - Do not infer a native handler or production receipt from a concept simulation.
  - Do not create parallel GUI-owned runtime state machines.
  - Do not invent a command for ephemeral presentation behavior.
  - Do not hide incomplete closure behind an aggregate pass.
owner_hints: [Plans/DRY_Rules.md, Plans/Wiring_Matrix.md, Plans/UI_Wiring_Rules.md]
```
