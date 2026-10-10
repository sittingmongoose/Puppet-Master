# Shard 045: Open Exact Plan Version Command Record (2026-10-09)

Source: `Plans/Commands_System.md`

Source lines: L7556-L7615

Source SHA256: `66b67be5f108e166ccde44690b9cb4ba4b6784ac3b0e7261322001bb32415aa5`

---

## Open Exact Plan Version Command Record (2026-10-09)

The owner's decision DL-157 gives a bound Goal's Open exact Plan · Vn, and every Open plan button, a command of their own. Its central contract record is in the table of central command contract records above; this unit states its boundary for this owner.

### CS-088 - cmd.chat.plan.open_version Opens One Exact Plan Version's Document

```yaml
plan_unit_id: CS-088
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.chat.plan.open_version is registered as a navigation_wrapper owned by Plans/Assistant_Plan_Runtime.md, with the
  sole future handler handlers::assistant_plan::plan_open_version and the typed pair AssistantPlanVersionRoute ->
  RouteResult in Plans/assistant_plan_runtime_contracts.schema.json, the same pending owner schema as its neighbour
  cmd.chat.plan.open_details. It keeps handler_unavailable until native evidence exists and expected_event_types=[]:
  opening a version's document is a route, never a Plan, run, Goal, To-Do or artifact mutation. Its source surfaces
  are plan_card and schedule_manager, for every Open plan button (the card's action row, its Build-started and
  Plan-revised receipts, a build schedule's row), and goal_activity and goal_hover, for the bound Goal's Open exact
  Plan · Vn (UCC-176). It is not an alias of cmd.chat.plan.open_details, which opens Plan Details, and no
  chat-local or Goal-owned peer command for opening a Plan version exists. The concept's goal-open-plan-version and
  pd-open-version action names are concept lineage under CS-079, not command identities.
gui_related: true
gui_classification_reason: "Registers the bound Goal's exact-Plan opener as its own command record."
split_recommended: false
depends_on: [UCC-176, DL-157, CS-079]
unblocks: [WM-065]
acceptance_criteria:
  - "The central contract records hold exactly one row for cmd.chat.plan.open_version, naming handlers::assistant_plan::plan_open_version and AssistantPlanVersionRoute -> RouteResult."
  - "cmd.chat.plan.open_version keeps handler_unavailable and expected_event_types=[]."
  - "No alias or peer command opens a Plan version from a Goal surface, and every Open plan button raises cmd.chat.plan.open_version."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-ui-command-response
risk_class: invented_command_identity
reasoning_tier: medium
context_scope: goal_bound_plan_open_20261009
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_disposition_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-157"
  - "Plans/UI_Command_Catalog.md#UCC-176"
preserved_exact_tokens:
  - "cmd.chat.plan.open_version"
  - "handlers::assistant_plan::plan_open_version"
  - "AssistantPlanVersionRoute"
negative_constraints:
  - "Do not register cmd.chat.plan.open_version as an alias of cmd.chat.plan.open_details."
  - "Do not register the concept actions goal-open-plan-version or pd-open-version as command identities."
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-176, ContractName:Plans/Decision_Log.md#DL-157, ContractName:Plans/Commands_System.md#CS-079, ContractName:Plans/Assistant_Plan_Runtime.md
