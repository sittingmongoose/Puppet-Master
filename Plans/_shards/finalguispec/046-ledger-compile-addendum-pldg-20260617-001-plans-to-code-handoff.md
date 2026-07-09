# Shard 046: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/FinalGUISpec.md`

Source lines: L25260-L25370

Source SHA256: `7236ee5f73d5999720dab50565a293e5e396ce8833679acb4b42393e21a9c585`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### F3-396 - Plans-To-Code Model Settings Placement

```yaml
plan_unit_id: F3-396
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings exposes the six plans-to-code model controls named by Models_System: Default Model, Overseer Model, Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, and Auditor Model. The GUI must not expose an Executor Model setting. Explanatory labels route Planning Wizard ledger-to-Plans conversion, PRD Builder conversion, Plan Compile supervision, seam/split/merge decisions, execution supervision, and blocked-state reasoning to Overseer Model; the Auditor audit-to-repair loop, verification, certification, quality gates, and evidence review route to Auditor Model; normal WorkNode implementation routes to Worker Model; GUI/frontend/UX/layout/visual WorkNodes route to GUI / Frontend Worker Model; difficult, broad, repo-wide, high-risk, or high-reasoning WorkNodes route to High-Effort Worker Model.
  Settings copy must describe the Auditor loop as repeating audit, bounded repair, and re-audit until completion is certified or a critical block or authority boundary stops the loop; legacy source may refer to the same loop as audit/repair/audit. Old Pass 1 / Pass 2 / Pass 3 labels may appear only as compatibility aliases in imported legacy source or search, not as visible model controls.
  Settings copy must describe repo-wide reasoning for High-Effort Worker Model and state that Executor deterministic runtime behavior does not create an Executor Model control.
gui_related: true
gui_classification_reason: This unit defines visible Settings labels and help text for model routing.
depends_on: [MS-110]
unblocks: [OP-023]
acceptance_criteria:
  - Settings displays exactly the six named controls for this flow.
  - No Executor Model control is shown.
  - GUI/frontend and high-effort roles have clear Settings labels without exposing internal subrole sprawl.
  - Auditor settings copy describes an audit-to-repair loop until certified or critical block; legacy Pass 1 / Pass 2 / Pass 3 labels are compatibility/search aliases only, not model selectors.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Settings model selector review
risk_class: settings_model_role_drift
reasoning_tier: standard
context_scope: model_settings_gui
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Models_System.md]
node_compile_hint: {mode: settings_model_role_controls, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0018
  - pldg-20260617-001-plans-to-code-handoff:atom-0021
  - pldg-20260617-001-plans-to-code-handoff:atom-0022
  - pldg-20260617-001-plans-to-code-handoff:atom-0023
  - pldg-20260617-001-plans-to-code-handoff:corr-0001
  - pldg-20260617-001-plans-to-code-handoff:corr-0003
preserved_exact_tokens:
  - "Default Model"
  - "Overseer Model"
  - "Worker Model"
  - "GUI / Frontend Worker Model"
  - "High-Effort Worker Model"
  - "Auditor Model"
  - "Auditor audit-to-repair loop"
  - "audit/repair/audit"
  - "critical block"
  - "No Executor Model"
negative_constraints:
  - Do not expose a long list of internal subrole settings.
  - Do not create an Executor Model setting.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
```

### F3-397 - Animated Plan Compile Tab UX

```yaml
plan_unit_id: F3-397
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Orchestrator Plan Compile tab must feel polished, animated, and informative rather than a static JSON or log table. Plans flow into PlanUnits, cards sort into lanes, non-executable NodeSeed candidate drafts assemble, dependency edges draw, GUI/frontend badges appear, test gates light up, WorkNode request drafts snap into graph clusters, and handoff pulses toward Executor. The tab presents stage timeline, progress, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness while preserving the scope boundary: Plan Compile shows Plans-to-node draft projection, and existing execution views show code-generation and WorkNode execution progress.
  The tab presents progress/speed/ETA/status panels as the visible summary for progress, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness.
  The presentation is an animated node factory and preserves Plan Compile tab scope: Executor execution progress stays in existing execution views rather than this compile tab.
gui_related: true
gui_classification_reason: This unit defines visible animation, layout, status, and interaction behavior.
depends_on: [OP-023, OP-024, PNC-014, ATS-001]
unblocks: []
acceptance_criteria:
  - The tab uses animated node-factory presentation for PlanUnits, non-executable NodeSeed candidate drafts, dependency edges, test gates, WorkNode request drafts, and Executor handoff.
  - It shows progress/speed/ETA/status panels with progress, speed, ETA confidence, blockers, warnings, model lane status, test capability status, and handoff readiness.
  - It does not duplicate the code-generation dashboard.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Orchestrator UX review
risk_class: static_or_misleading_plan_compile_ui
reasoning_tier: standard
context_scope: plan_compile_tab_ux
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: plan_compile_tab_visual_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0050
  - pldg-20260617-001-plans-to-code-handoff:atom-0051
  - pldg-20260617-001-plans-to-code-handoff:atom-0052
  - pldg-20260617-001-plans-to-code-handoff:corr-0006
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "animated node factory"
  - "Plans flow into PlanUnits"
  - "NodeSeeds assemble"
  - "dependency edges"
  - "GUI/frontend badges"
  - "test gates"
  - "Plan Compile tab"
  - "stage timeline"
  - "throughput"
  - "speed"
  - "ETA confidence"
  - "progress/speed/ETA/status panels"
negative_constraints:
  - Do not implement Plan Compile as a static JSON/log table.
  - Do not overload Plan Compile tab with WorkNode execution/code-generation details beyond handoff status.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Models_System.md, ContractName:Plans/Automated_Testing_System.md
