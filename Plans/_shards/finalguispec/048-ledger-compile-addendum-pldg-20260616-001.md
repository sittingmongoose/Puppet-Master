# Shard 048: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/FinalGUISpec.md`

Source lines: L27389-L27446

Source SHA256: `30fc010686ea17ae38b61544a99e01519fe3ff49ef9e792d83b1a1f6c18223cd`

---

## Ledger Compile Addendum - pldg-20260616-001

### F3-393 - Goal Mode Worker And Verifier Model Selectors

```yaml
plan_unit_id: F3-393
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The two Goal Mode worker and verifier/adjudicator model selectors are retired with the Goal role cast.
  Goals use the ordinary Assistant chat choice, and independent checking uses the Review sheet and
  Checking finished work default. Read old ai.models.goal-worker-model and ai.models.goal-verifier-model
  as inert compatibility data only, never reconstituting Goal-owned model or certification-tier policy.
  No Goals model selectors appear in Settings, search, All Settings, reset or new transfer writes.
gui_related: true
gui_classification_reason: This unit defines visible Settings GUI controls for Goal Mode model selection.
depends_on:
- GRS-049
- MS-108
unblocks: []
acceptance_criteria:
- No separate Goal worker/verifier model selector is exposed.
- Goals use the ordinary chat model and independent Review selections remain separate work requests.
- Old saved selectors remain inspectable as retired compatibility data without affecting a run.
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
- Do not recreate retired Goal model-role or certification-tier settings.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
```
