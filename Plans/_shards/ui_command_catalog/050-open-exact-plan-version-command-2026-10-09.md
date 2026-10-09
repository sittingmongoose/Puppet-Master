# Shard 050: Open Exact Plan Version Command (2026-10-09)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L14737-L14807

Source SHA256: `5705578cb997d259f3f92c0269cc237d9b9444008a8134b52a77a08a61654ad0`

---

## Open Exact Plan Version Command (2026-10-09)

On a Goal bound to a Plan (FinalGUISpec F3-593), Open exact Plan · Vn had no command identity: `cmd.chat.plan.open_details` opens Plan Details, and no row opened a Plan's document. The owner decided on 2026-10-09 that it gets a new command (DL-157). The row is in the Assistant Plan Runtime table above; this unit records its contract and its producers.

### UCC-176 - Open Exact Plan Version From A Bound Goal

```yaml
plan_unit_id: UCC-176
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.plan.open_version (Open Plan Version, navigation_wrapper, owner Plans/Assistant_Plan_Runtime.md, request
  AssistantPlanVersionRoute, result RouteResult, sole future target handlers::assistant_plan::plan_open_version) opens
  the document of one exact Plan version in the editor. The request carries the assistant_plan_id, plan_version and
  plan_hash of the Goal's GoalPlanBinding. While that version is still the Plan's version the route opens the Plan's
  own tab, focusing it when it is already open (APR-014); once a later version exists it opens that version's retained
  read-only document. It never opens Plan Details, never substitutes a newer version, and changes no Plan, run, Goal,
  To-Do or artifact state. A version that is not retained, or whose hash no longer matches, returns a typed error and
  opens nothing. Its producers are exactly a bound Goal's Open exact Plan · Vn in Goal Activity Detail (goal_activity)
  and in the activity bar's Goal preview (goal_hover); a press from the preview closes the preview. Plan Details stays
  cmd.chat.plan.open_details, which no Goal surface raises. The command emits no event (expected_event_types=[]).
gui_related: true
gui_classification_reason: "Gives the bound Goal's Open exact Plan · Vn control its own command, distinct from Plan Details."
split_recommended: false
depends_on: [DL-157, F3-593, APR-014]
unblocks: [CS-088, WM-065, UIW-026]
acceptance_criteria:
  - "Open exact Plan · Vn on a bound Goal dispatches cmd.chat.plan.open_version with the binding's plan id, version and hash, from goal_activity and goal_hover only."
  - "The route opens Vn's document: the Plan's own tab while Vn is current, otherwise Vn's retained read-only document; it never opens Plan Details or a newer version."
  - "An unretained or hash-mismatched version returns a typed error and opens nothing."
  - "No Goal surface raises cmd.chat.plan.open_details."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py validate-ui-command-response
risk_class: chat_command_catalog_gap
reasoning_tier: high
context_scope: goal_bound_plan_open_20261009
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Assistant_Plan_Runtime.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Wiring_Rules.md
node_compile_hint:
  mode: chat_composer_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-157"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; data-action goal-open-plan-version)"
preserved_exact_tokens:
  - "cmd.chat.plan.open_version"
  - "AssistantPlanVersionRoute"
  - "handlers::assistant_plan::plan_open_version"
  - "Open exact Plan · Vn"
  - "goal_activity"
  - "goal_hover"
negative_constraints:
  - "Do not bind Open exact Plan · Vn to cmd.chat.plan.open_details."
  - "Do not open a newer Plan version in place of the bound one."
  - "Do not add a chat-local alias for opening a Plan version."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Assistant_Plan_Runtime.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-157, ContractName:Plans/FinalGUISpec.md#F3-593, ContractName:Plans/Assistant_Plan_Runtime.md#APR-014, ContractName:Plans/Commands_System.md#CS-088, ContractName:Plans/Wiring_Matrix.md#WM-065
