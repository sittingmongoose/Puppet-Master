# Shard 050: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/FinalGUISpec.md`

Source lines: L27684-L27802

Source SHA256: `faba71dc4ce3fe68b94ea0639e20e448c3f9f3c74a8343e647aa275704933a7a`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### F3-396 - Plans-To-Code Model Settings Placement

```yaml
plan_unit_id: F3-396
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Settings exposes seven plans-to-code controls in one Default models list: Default Model, Overseer Model, Worker Model, Low-Effort Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, and Auditor Model. The GUI must not expose an Executor Model setting. Explanatory labels route Planning Wizard ledger-to-Plans conversion, PRD Builder conversion, Plan Compile supervision, seam/split/merge decisions, execution supervision, and blocked-state reasoning to Overseer Model; the Auditor audit-to- repair loop, verification, certification, quality gates, and evidence review route to Auditor Model; normal WorkNode implementation routes to Worker Model; GUI/frontend/UX/layout/visual WorkNodes route to GUI / Frontend Worker Model; difficult, broad, repo-wide, high-risk, or high-reasoning WorkNodes route to High-Effort Worker Model. Settings copy must describe the Auditor loop as repeating audit, bounded repair, and re-audit until completion is certified or a critical block or authority boundary stops the loop; legacy source may refer to the same loop as audit/repair/audit. Old Pass 1 / Pass 2 / Pass 3 labels may appear only as compatibility aliases in imported legacy source or search, not as visible model controls. Settings copy must describe repo-wide reasoning for High-Effort Worker Model and state that Executor deterministic runtime behavior does not create an Executor Model control. Low-Effort Worker Model is labelled Easy, routine jobs and inherits Everyday building when blank; it is restricted to small, low-risk, non-design implementation, never checking. The list has Everywhere and This project tabs, then naming, explaining, BSD and enabled media rows. Every Settings model picker reuses the chat composer picker as ACD-438 defines it: one open picker keeps the model list visible while showing the selected route’s supported depth levels beside the list on desktop and inside the same picker on phone. Model and depth are chosen and committed as one atomic value; the same picker stays open throughout model and depth choice. A model without supported levels shows none, and unknown capability stays unknown. Settings saves the pair atomically in the row’s declared scope, with no separate effort Settings row and no page reflow. Blank rows name their fallback source and current model/depth. Exact unlisted names require one small successful call before saving; a refused or unreachable name is never saved, and acceptance proves no capability. Helpers have no model or depth Settings row, and Persona/command model fields are removed. Presets and nicknames remain below the list, with What actually ran a visible run-history link. The PRD Builder, Planning Wizard, building and Scout use the common defaults and allow overrides; no redesign of those screens is specified here.
gui_related: true
gui_classification_reason: This unit defines visible Settings labels and help text for model routing.
depends_on:
- MS-110
- ACD-438
unblocks:
- OP-023
acceptance_criteria:
- 'Settings displays exactly seven named controls for this flow: Everyday model and the six jobs.'
- No Executor Model control is shown.
- GUI/frontend and high-effort roles have clear Settings labels without exposing internal subrole sprawl.
- Auditor settings copy describes an audit-to-repair loop until certified or critical block; legacy Pass 1 / Pass 2 / Pass 3 labels are compatibility/search aliases only, not model selectors.
- 'Every Settings model picker reuses the chat composer picker as ACD-438 defines it: one open picker keeps the model list visible while showing the selected route’s supported depth levels beside the list on desktop and inside the same picker on phone. Model and depth are chosen and committed as one atomic value; the same picker stays open throughout model and depth choice. A model without supported levels shows none, and unknown capability stays unknown.'
- A route without proven effort levels shows no effort choices; unknown capability stays unknown.
validation_surfaces:
- python3 scripts/pm-plans-verify.py run-gates
- future Settings model selector review
risk_class: settings_model_role_drift
reasoning_tier: standard
context_scope: model_settings_gui
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Models_System.md
node_compile_hint:
  mode: settings_model_role_controls
  create_worknodes: false
source_lineage:
- pldg-20260617-001-plans-to-code-handoff:atom-0018
- pldg-20260617-001-plans-to-code-handoff:atom-0021
- pldg-20260617-001-plans-to-code-handoff:atom-0022
- pldg-20260617-001-plans-to-code-handoff:atom-0023
- pldg-20260617-001-plans-to-code-handoff:corr-0001
- pldg-20260617-001-plans-to-code-handoff:corr-0003
- DL-476; settings batch3 fix round r1, 2026-11-12
preserved_exact_tokens:
- Default Model
- Overseer Model
- Worker Model
- GUI / Frontend Worker Model
- High-Effort Worker Model
- Auditor Model
- Auditor audit-to-repair loop
- audit/repair/audit
- critical block
- No Executor Model
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
