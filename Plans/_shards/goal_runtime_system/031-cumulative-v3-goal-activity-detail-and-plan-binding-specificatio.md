# Shard 031: Cumulative v3 Goal Activity Detail and Plan Binding Specification (2026-09-07)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L5439-L5501

Source SHA256: `739e3f3675e4b7fc1c2475b6351a80d34571df977313bf76f50de122685f1c07`

---

## Cumulative v3 Goal Activity Detail and Plan Binding Specification (2026-09-07)

This section incorporates the cumulative Goal V2 Activity Detail presentation, concise information
hierarchy, and bound PlanRun synchronization in accordance with APR-059 and retained v2 contracts.

### 18. Goal Activity Detail Presentation and Bound Plan Synchronization (APR-059)

- **Concise Hierarchy and Objective Control:** Goal Activity Detail presents a focused, compact view:
  1. *Objective Headline:* Current approved goal objective with inline Edit affordance.
  2. *Inline Edit Controls:* Save and Cancel controls appearing only when editing the objective text.
  3. *Lifecycle Status and Action Row:* Clear primary status badge and quiet action buttons: Pause,
     Resume, and Cancel.
  4. *Revision History:* Chronological log of objective revisions and lifecycle state transitions.
  5. *Bound Plan Linking:* Direct clickable route link to the bound Plan; Plan Details links back to
     the Goal.
- **Surface Invariants:** No Goal thread card is rendered in the chat transcript. The objective text
  is never duplicated as a Plan card section. Goal and To-Dos reside strictly in the Activity panel,
  preserving hover and pinned detail controls.

```yaml
plan_unit_id: GRS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Activity Detail projects a concise hierarchy featuring objective headline, inline Edit/Save/Cancel
  controls, lifecycle actions (Pause, Resume, Cancel), revision history, and direct bidirectional links
  to the bound PlanRun. Goal state remains strictly in Activity without transcript cards or duplicated
  objective sections on Plan cards.
gui_related: true
gui_classification_reason: Governs Goal Activity Detail presentation, objective editing, and bound Plan navigation.
depends_on: [GRS-057]
unblocks: []
acceptance_criteria:
  - Goal Activity Detail shows objective, inline editing, lifecycle buttons, and revision history.
  - Bidirectional links connect Goal Activity Detail and the bound Plan.
  - No Goal transcript cards are created; objective is not duplicated on Plan cards.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: goal_surface_duplication_or_hierarchy_drift
reasoning_tier: standard
context_scope: goal_ui_projection
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/FinalGUISpec.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: goal_ui_specification
  create_worknodes: false
source_lineage:
  - APR-059
preserved_exact_tokens:
  - "Goal Activity Detail"
  - "inline edit"
  - "bidirectional links"
negative_constraints:
  - Do not render Goal state as a transcript card.
  - Do not duplicate Goal objective text inside the Plan card.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Assistant_Plan_Runtime.md
