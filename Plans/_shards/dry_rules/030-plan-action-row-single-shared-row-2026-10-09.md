# Shard 030: Plan action row single shared row — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L2724-L2779

Source SHA256: `aa46dc6c87a53db9815b2b512ba4204c1df6a15716779df3d465a60ef415c361`

---

## Plan action row single shared row — 2026-10-09

The Plan card's footer had drifted from the other cards' actions: its Build control was shorter, with smaller type, than the buttons beside it, and the footer drew a tinted band of its own. DL-156 fixes the layout; this rule keeps every Plan surface on the one shared row.

### DR-047 - Plan Actions Use The One Shared Action Row

```yaml
plan_unit_id: DR-047
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Every Plan surface that shows actions draws them with the one action row the wand modules use (F3-566 J-2): the
  transcript Plan card, the editor's sticky footer and its More row, the compact Completed or Canceled card, a
  Building plan's attention actions, the schedule line's decision and the Build-started receipt. The Build control is
  a boxed primary inside that row, not a control with sizes of its own, and the row's spacing rule treats it as one
  (F3-606). A Plan surface supplies its controls and their order only; it never restates the row's height, type,
  padding or gaps, and it never adds a band, inset or one-off button style. A wait or attention line beside the
  actions uses the same mark column as the schedule line (F3-607). The labels, statuses and eligibility stay with
  Assistant_Plan_Runtime and the schedule line's words with SQR-015.
gui_related: true
gui_classification_reason: "Keeps one action-row grammar for every Plan surface."
split_recommended: false
depends_on: [DR-044, F3-566, F3-606, F3-607, DL-156]
unblocks: []
acceptance_criteria:
  - "No Plan surface defines its own button height, type size, padding or gap for its actions."
  - "The Build control's size comes from the shared row, and the row's spacing treats it as a boxed primary."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: medium
context_scope: chat_plan_card_actions_20261009
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-156"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md, SHA-256 4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d"
preserved_exact_tokens:
  - "F3-566"
  - "F3-606"
  - "action row"
negative_constraints:
  - "Do not give a Plan surface its own action sizes or a tinted footer band."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-606, ContractName:Plans/FinalGUISpec.md#F3-607
