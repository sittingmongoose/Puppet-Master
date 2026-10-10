# Shard 043: Open Exact Plan Version Wiring (2026-10-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L5435-L5495

Source SHA256: `f9af971e0328db881e9488ebbabbf57685cc317d6b0a5a21c3d468e26247c799`

---

## Open Exact Plan Version Wiring (2026-10-09)

The owner's decision DL-157 gives a bound Goal's Open exact Plan · Vn, and every Open plan button, the command `cmd.chat.plan.open_version` (UI_Command_Catalog UCC-176, Commands_System CS-088). This addendum adds its one production wiring entry, `assistant.redesign.cmd.chat_plan_open_version`, to `Plans/Wiring_Matrix.production.json`. It keeps `handler_unavailable` and `expected_event_types=[]`; nothing here claims a native dispatcher, handler or event.

### WM-065 - Open Exact Plan · Vn Raises The Open Plan Version Entry

```yaml
plan_unit_id: WM-065
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  assistant.redesign.cmd.chat_plan_open_version binds cmd.chat.plan.open_version to the sole future handler
  handlers::assistant_plan::plan_open_version with AssistantPlanVersionRoute -> RouteResult. Its producers are exactly
  every Open plan button, on the Plan card's action row and its Build-started and Plan-revised receipts (plan_card)
  and on a build schedule's row in the Scheduled manager (schedule_manager), each sending the version it names, and
  a bound Goal's Open exact Plan · Vn in Goal Activity Detail (goal_activity) and in the activity bar's Goal preview
  (goal_hover), each sending the GoalPlanBinding's assistant_plan_id, plan_version and plan_hash. The route result
  opens that version's document, the Plan's own tab while it is current and its retained read-only document once a
  later version exists, and never Plan Details or a newer version (UIW-026). The existing
  assistant.redesign.cmd.chat_plan_open_details entry gains no Goal producer. The new entry keeps handler_unavailable
  and expected_event_types=[].
gui_related: true
gui_classification_reason: "Wires every Open plan button and the bound Goal's Open exact Plan · Vn to their own command entry."
split_recommended: false
depends_on: [UCC-176, CS-088, UIW-026, DL-157]
unblocks: []
acceptance_criteria:
  - "Wiring_Matrix.production.json holds one entry assistant.redesign.cmd.chat_plan_open_version for cmd.chat.plan.open_version, raised from plan_card, schedule_manager, goal_activity and goal_hover only."
  - "assistant.redesign.cmd.chat_plan_open_details has no Goal producer."
  - "The entry keeps handler_unavailable and expected_event_types=[]."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: wand_module_surface_drift
reasoning_tier: medium
context_scope: goal_bound_plan_open_20261009
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-157"
  - "Plans/UI_Command_Catalog.md#UCC-176"
preserved_exact_tokens:
  - "assistant.redesign.cmd.chat_plan_open_version"
  - "cmd.chat.plan.open_version"
  - "goal_activity"
  - "goal_hover"
negative_constraints:
  - "Do not let a Goal surface raise assistant.redesign.cmd.chat_plan_open_details."
  - "Do not add a chat-local alias entry for opening a Plan version."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-176, ContractName:Plans/Commands_System.md#CS-088, ContractName:Plans/UI_Wiring_Rules.md#UIW-026, ContractName:Plans/Decision_Log.md#DL-157
