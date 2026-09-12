# Shard 037: SIR-048 - Original Goal start pending and terminal source custody

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L2592-L2653

Source SHA256: `df688fdfe1afa18b87902bf090df9aa6311c43f52aa5004ff4f1dcbfe0c555cc`

---

## SIR-048 - Original Goal start pending and terminal source custody

```yaml
plan_unit_id: SIR-048
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: For the sole original Goal start command, the explicit Goal-only SIR binding owns authenticated
  source, genuine acknowledgement and immutable terminal outcome production while SP-294 holds content-free original
  custody. Independent whole-result expectations and exact logical result/receipt references preserve source and
  effect distinctions through current final authority checks.
gui_related: false
gui_classification_reason: Defines original internal command/source/body/event/result and retained audit authority
  without a visual surface.
depends_on:
- SIR-042
- CV-333
- SP-294
unblocks: []
acceptance_criteria:
- Only owner.sir.goal_start_pending_custody@1.0.0 delegates this exact command; Home and other command-specific
  owners are not generalized.
- Original source inputs and complete expected state precede helpers; source entries authenticate original birth/seals
  and actual enrolled participants.
- Acknowledgement/source progression is genuine and monotonic, preserving original request/dispatch/scope and content-free
  argument identity.
- Proven pre-execution no-effect and original unknown decisions are distinct immutable outcomes; absent rows never
  establish no-effect.
- Actual source stage, full expected result and CV-333 response join original body/shared evidence before terminal
  publication, preserving genuine earlier effects.
- Retained logical-member reads use original custody and current audit authority without acquiring live input authority
  or dispatching.
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
- Plans/Shared_Integration_Runtime.md
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

<a id="original-goal-update-source-and-terminal-custody"></a>
