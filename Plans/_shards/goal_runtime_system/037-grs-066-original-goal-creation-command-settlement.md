# Shard 037: GRS-066 - Original Goal creation command settlement

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6152-L6215

Source SHA256: `51a12e64668bec85a61dd810af0ca8919c1d8bfc2a40c010ae261448603b9baa`

---

## GRS-066 - Original Goal creation command settlement

```yaml
plan_unit_id: GRS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Original text-only Goal creation settles its accepted revision, original goal.created event/first
  receipt and immutable command result once. A body accepted before later refusal remains preserved; successful
  creation settlement plus all current Goal/run/thread/permission/Stop rules precedes first continuation without
  a new Goal state or objective-completion claim.
gui_related: false
gui_classification_reason: Defines original internal command/source/body/event/result and retained audit authority
  without a visual surface.
depends_on:
- GRS-064
- CV-341
- SP-294
- SIR-048
- DL-047
unblocks: []
acceptance_criteria:
- The sole existing start command/handler consumes exact central request/result definitions and genuine original
  creation authority.
- Revision 1 is admitted once, followed by original shared event/first receipt and then actual source/result settlement
  without a receipt bootstrap cycle.
- Creation success is distinct from objective completion and certification; pending or terminal unknown grants no
  first-continuation authority.
- Final dispatch observes actual settled creation and current Goal/run/thread/permission/Stop rules, with Stop taking
  precedence.
- Pre-admission no-effect writes no revision; later refusal preserves the accepted original revision/custody and
  emits no success-shaped receipt or extra revision.
- Active-v3 creation and whole-retained-v2 historical meaning stay separate; other events, commands, projectors
  and native runtime remain independently unclosed.
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
- Plans/Goal_Runtime_System.md
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

<a id="passive-goal-creation-observation"></a>
