# Shard 041: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/FinalGUISpec.md`

Source lines: L24680-L24733

Source SHA256: `31f1b356a21a6f30cb90f9f952419f29aca1fa29eebc5d7ebd3883350fb43d61`

---

## Ledger Compile Addendum - pldg-20260616-001

### F3-393 - Goal Mode Worker And Verifier Model Selectors

```yaml
plan_unit_id: F3-393
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings must expose a Goal Mode option with two separate model selections: one for the worker model and one for the verifier/adjudicator model. The verifier/adjudicator model is configured separately from ordinary worker execution. Settings may present inheritance as a convenience only when the inherited worker model satisfies the required certification-tier policy; strong-certification goals must block rather than merely warn if verifier/adjudicator requirements cannot be met.
gui_related: true
gui_classification_reason: This unit defines visible Settings GUI controls for Goal Mode model selection.
depends_on:
  - GRS-010
unblocks: []
acceptance_criteria:
  - Goal Mode settings include separate worker and verifier/adjudicator model selectors.
  - The UI does not collapse verifier/adjudicator and worker model choice into one setting.
  - Any inheritance UI reflects the runtime requirement that certification-tier policy must be satisfied.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Settings GUI review
risk_class: user_visible_config_drift
reasoning_tier: standard
context_scope: goal_mode_settings_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
  - future Settings UI
node_compile_hint:
  mode: goal_mode_model_selector_gui
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0103
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
preserved_exact_tokens:
  - "option for goal mode in the settings gui"
  - "verifier/adjudicator model separate"
  - "other worker model"
  - "two model selections"
  - "worker model"
  - "verifier/adjudicator model"
  - "must block, not merely warn"
negative_constraints:
  - Do not collapse Goal Mode worker and verifier/adjudicator model selection into one setting.
  - Do not present verifier/adjudicator inheritance as valid when certification-tier policy is not satisfied.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
```
