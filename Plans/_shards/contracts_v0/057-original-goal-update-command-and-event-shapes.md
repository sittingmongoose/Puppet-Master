# Shard 057: Original Goal update command and event shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22434-L22509

Source SHA256: `083dc7844e67d48919a9d0f5b6b9cd37f013bb40f35ad2da6ee465e68e3466f9`

---

## Original Goal update command and event shapes

CV-342 adds the already referenced `GoalUpdateRequestV2` and `GoalUpdateResultV2` definitions in `Plans/goal_runtime_contracts.schema.json`, preserving the two existing start definitions exactly. Their existing command/handler registration remains singular. `Plans/goal_update_command_custody.schema.json` supplies source, original request content, before/after body, frozen producer input/publication, immutable progress/head/selector, typed result, original outcome/response and four physical wrapper definitions. SP-299/GRS-068/SIR-049 own their mandatory cross-record origin, semantic equality, exact codecs and transaction predicates beyond JSON shape.

Existing `event-family-goal-updated` alone advances to revision 3.0.0 / `pm.goal_runtime_event.goal_updated.schema.v3`. Its outer EventRecord remains pm.event.v0 version 2.0.0, Project scope and unchanged indefinite audit retention. Payload has no objective text, retired child/delta/budget fields, borrowed workflow authority or future own first receipt. Exact original accepted source and body/accepted-revision facts precede the frozen event input; actual Storage fields and first receipt come from their original owners. The complete old v2 resource remains under `#/$defs/legacy_v2_reader`, including its original ID/definitions/conditions. Old common-v2 minima, D-R14 and v2 fixture expectations apply only to that retained interpretation. Other event rows and schemas are unchanged.

The update result's Goal identity is the actual requested existing Goal even on no-effect. Empty and unchanged accepted replacements are revisions, not invented no_op. Actual succeeded/no_effect/recovery_required facts join original outcome, response, error status, owner-result reference and RFC-8785 result hash under CV-333. A body receipt proves its narrow body effect, not event or command success. Event refs contain only originally issued evidence; no-effect has none. A known unsupported exact result-number route refuses before effects where knowable; late discovery retains original progress/effects with terminal unavailable rather than fabricating a recovery terminal with the same unrepresentable numbers.

The exact selected local schema graph in `Plans/goal_update_schema_resources.json` includes the original shared-runtime dependency and explicit absolute retrieval of the unchanged relative updated-v3 resource ID. No schema alias is guessed and no remote fallback is allowed. Goal-created reader dependency metadata simultaneously pins the actual expanded central file; its existing start definitions and every selected reader validation object are unchanged. This metadata update does not rerun or enlarge the prior reader capture.

Current updated-event consumers/projectors/checkpoints, actual agent approval provider, native source/transaction/backup implementation and complete event-depth remain separate obligations. Central request/result definitions and a production-intent row do not establish runtime availability.

### CV-342 - Original Goal Update Request Result And Event Contract
```yaml
plan_unit_id: CV-342
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The existing Goal update command uses exact central request/result definitions and original
  update custody; only its existing event family selects active-v3 content-free accepted-change facts
  while preserving the entire historical-v2 resource and exact original CV-333 result/effect meaning.
gui_related: false
gui_classification_reason: Defines existing-command source, event, storage and result publication without
  a new visual surface.
depends_on:
- CV-333
- CV-341
- CV-339
- GRS-064
unblocks: []
acceptance_criteria:
- Exactly the two already referenced update central definitions are added; both existing start definitions
  and all unrelated event rows/schemas remain unchanged.
- Active-v3 payload joins actual accepted source, before/after body/accepted-history and original body
  receipt without objective text, retired fields or future own append receipt.
- Whole-v2 ID, definitions and validation conditions remain intact for historical interpretation; D-R14
  and old current-write assumptions do not authorize v3.
- Original result/outcome/response/error/receipt/event joins preserve succeeded, proved no-effect and
  immutable unknown meanings under CV-333, including nonnull requested Goal identity.
- Exact physical and typed-result hash domains stay separate; unsupported numeric terminals preserve actual
  effects without rounding, caps or fabricated committed-body recovery results.
- The complete local resource/retrieval graph pins actual bytes and preserves selected Goal-created/start
  validation; schema or wiring adoption grants no native provider, event reader or runtime readiness.
validation_surfaces:
- Plans/goal_update_command_custody.schema.json
- Plans/goal_update_schema_resources.json
- reports/event-authority-20260911/step-08-goal-update-validation.md
- reports/event-authority-20260911/step-08-goal-update-checks.json
risk_class: false_original_update_or_lost_accepted_effect
reasoning_tier: high
context_scope: original_goal_update_request_result_event_shapes
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/goal_update_command_custody.schema.json
node_compile_hint:
  mode: original_goal_update_prerequisite_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/Goal_Runtime_System.md#GRS-064
negative_constraints:
- Do not infer accepted source or native atomicity from a schema, copied owner map, result-shaped value
  or fixture.
- Do not reconstruct disposed input, change original terminal outcomes, borrow creation authority or claim
  current event-consumer depth.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Shared_Integration_Runtime.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-342, ContractName:Plans/storage-plan.md#SP-299, ContractName:Plans/Goal_Runtime_System.md#GRS-068, ContractName:Plans/Shared_Integration_Runtime.md#SIR-049, ContractName:Plans/goal_update_schema_resources.json
