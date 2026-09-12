# Shard 056: CV-341 - Goal start original command shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22376-L22433

Source SHA256: `083dc7844e67d48919a9d0f5b6b9cd37f013bb40f35ad2da6ee465e68e3466f9`

---

## CV-341 - Goal start original command shapes

```yaml
plan_unit_id: CV-341
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Exact original Goal start request/result, content-free command custody, named logical-member resolution
  and active-v3/whole-retained-v2 payload routes preserve distinct source/body/shared hash and authority domains.
gui_related: false
gui_classification_reason: Defines original internal command/source/body/event/result and retained audit authority
  without a visual surface.
depends_on:
- CV-333
- CV-339
- GRS-064
unblocks: []
acceptance_criteria:
- Exactly the existing GoalStartRequestV2 and GoalStartResultV2 central definitions are materialized without another
  command or GoalRecordV2 field.
- The closed content-free command row has exact key, wrapper, codec and distinct pending/success/no-effect/unknown
  branches.
- Only goal.created selects active content-free v3; the complete prior v2 resource and local definitions remain
  exact retained interpretation.
- Named owner-result and creation-receipt members resolve their exact wrapped locations under original row and current
  audit authority.
- Original body, source/producer/result and shared full-value/receipt hash domains remain distinct; schema validity
  does not grant installed ownership.
validation_surfaces:
- reports/event-authority-20260911/step-08-goal-start-validation.md
- Plans/goal_start_command_custody.schema.json
- Plans/goal_runtime_contracts.schema.json
- Plans/event_payloads/goal_runtime/goal_created.schema.json
- Plans/goal_start_command_contract_fixtures.json
risk_class: false_original_goal_creation_or_lost_command_custody
reasoning_tier: high
context_scope: original_goal_start_command_integration
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/goal_start_command_custody.schema.json
- Plans/storage_value_registry.json
node_compile_hint:
  mode: original_goal_start_prerequisite_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/event-authority-20260911/step-08-goal-start-validation.md
- Plans/Decision_Log.md#DL-047
negative_constraints:
- Do not infer original authority from unchanged invalid values, selected helper results, hashes, schema registration
  or installed-role declarations.
- Do not reconstruct disposed objective/source values, roll back genuine earlier effects, restamp first receipts
  or retry an immutable terminal command.
- Do not claim native installation/dispatch/restore, current event traversal/checkpoint coverage, complete event
  depth, readiness or governance clearance.
```

<a id="goal-update-original-command-shapes"></a>
