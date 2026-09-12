# Shard 057: Original Goal update command and event shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22434-L22520

Source SHA256: `28dd60a4c3db0d01a42799aeb95bf30b35200fd8bc578aa8a58bfaf9c6991fca`

---

## Original Goal update command and event shapes

CV-342 adds the already referenced `GoalUpdateRequestV2` and `GoalUpdateResultV2` definitions in `Plans/goal_runtime_contracts.schema.json`, preserving the two existing start definitions exactly. Their existing command/handler registration remains singular. `Plans/goal_update_command_custody.schema.json` supplies source, original request content, before/after body, frozen producer input/publication, immutable progress/head/selector, typed result, original outcome/response and four physical wrapper definitions. SP-299/GRS-068/SIR-049 own their mandatory cross-record origin, semantic equality, exact codecs and transaction predicates beyond JSON shape.

Existing `event-family-goal-updated` alone advances to revision 3.0.0 / `pm.goal_runtime_event.goal_updated.schema.v3`. Its outer EventRecord remains pm.event.v0 version 2.0.0, Project scope and unchanged indefinite audit retention. Payload has no objective text, retired child/delta/budget fields, borrowed workflow authority or future own first receipt. Exact original accepted source and body/accepted-revision facts precede the frozen event input; actual Storage fields and first receipt come from their original owners. The complete old v2 resource remains under `#/$defs/legacy_v2_reader`, including its original ID/definitions/conditions. Old common-v2 minima, D-R14 and v2 fixture expectations apply only to that retained interpretation. Other event rows and schemas are unchanged.

The update result's Goal identity is the actual requested existing Goal even on no-effect. Empty and unchanged accepted replacements are revisions, not invented no_op. Actual succeeded/no_effect/recovery_required facts join original outcome, response, error status, owner-result reference and RFC-8785 result hash under CV-333. A body receipt proves its narrow body effect, not event or command success. Event refs contain only originally issued evidence; no-effect has none. A known unsupported exact result-number route refuses before effects where knowable; late discovery retains original progress/effects with terminal unavailable rather than fabricating a recovery terminal with the same unrepresentable numbers.

The exact selected local schema graph in `Plans/goal_update_schema_resources.json` includes the original shared-runtime dependency and explicit absolute retrieval of the unchanged relative updated-v3 resource ID. No schema alias is guessed and no remote fallback is allowed. Goal-created reader dependency metadata simultaneously pins the actual expanded central file; its existing start definitions and every selected reader validation object are unchanged. This metadata update does not rerun or enlarge the prior reader capture.

Named current updated-v3 consumer composition is explicitly adopted below and in GRS-064/GRS-068/SP-299/SIR-049; it assigns no additional event-built Goal projector or durable checkpoint. Actual agent approval provider, native source/read-release/transaction/backup implementation and complete event-depth remain separate obligations. Central request/result definitions and a production-intent row do not establish runtime availability.

`Plans/goal_updated_consumer_contracts.schema.json` supplies the independently adopted SP-299 update-only selected-event observation, precise existing audit/input selectors and their transient result/private-witness shapes. Its `EventObservation.payload` imports the entire unchanged active-v3 payload; `PrivateEventReadWitness.source_read_token` imports the entire original SP-278 `read_token` with its nested source_selection, not a Goal-created or shortened mirror. Original SourceAudit/Progress/ProgressHead/Terminal/InputContent/body-receipt/EventRecord/first-publication definitions remain exact imports. The new `Plans/goal_updated_consumer_resources.json` pins the complete local graph; the original writer graph and every original schema byte/ID/variant remain unchanged. No alias or remote fallback issues source authority.

The transient envelopes adopt the exact arbitrary-precision `pm.goal.canonical_json.v1` API representation specified by SP-299. They introduce no stored family, producer/event/result digest, new current Goal writer, command request variant or numerical revision cap. Original Goal semantic/physical, SP-278 binding, SP-286 full-event and CV-333 result hashes stay separate. Every primitive/unknown-key/encoding check and complete semantic cross-record identity/value/epoch/ref comparison remains mandatory beyond JSON Schema, with the actual owner source preserved after all helpers through joint final release. Unsupported transport cannot round or omit admitted facts; it returns unavailable without changing any original accepted effect or immutable result. Whole-v2 is preserved without admitting it through this new active-only observation. Named consumer normative composition is supplied by GRS-064/GRS-068/SP-299/SIR-049; it is not native installation or complete event-depth evidence.


### CV-342 - Original Goal Update Request Result And Event Contract
```yaml
plan_unit_id: CV-342
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The existing Goal update command uses exact central request/result definitions and original
  update custody; only its existing event family selects active-v3 content-free accepted-change facts
  while preserving the entire historical-v2 resource and exact original CV-333 result/effect meaning.
  Exact transient updated-consumer shapes import original source/receipt/epoch contracts and the complete
  shared source token without widening writer schemas or adding an event-derived Goal projector.
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
- The original writer graph and schema bytes remain unchanged; the separate exact updated-consumer graph directly imports
  complete shared source/receipt and update custody definitions with no created-profile inheritance or remote fallback.
- Named read composition preserves arbitrary-precision Goal API values and every separate original hash domain;
  schema or wiring adoption grants no native provider/read-release or runtime readiness.
validation_surfaces:
- Plans/goal_update_command_custody.schema.json
- Plans/goal_update_schema_resources.json
- Plans/goal_updated_consumer_contracts.schema.json
- Plans/goal_updated_consumer_resources.json
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
