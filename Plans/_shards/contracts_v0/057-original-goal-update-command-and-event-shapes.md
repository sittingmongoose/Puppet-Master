# Shard 057: Original Goal update command and event shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22544-L23249

Source SHA256: `24349309dfdaa4bc51f03a479a4c42bdc839b9f078e8805186f9a865ea5c2a09`

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

### CV-343 - Exact historical goal.progressed writer exclusion

```yaml
plan_unit_id: CV-343
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The exact registered goal.progressed whole v2 root remains unchanged authoritative historical validation.
  GRS-069 independently prohibits every current writer; reject before dedupe, CAS, outbox or append. SP-300 supplies
  only the original historical observation with complete current generic source authority and truthful original
  validation. No alias, event admission, new lifecycle or durable effect follows.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-069
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.progressed` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A current blocked/active/paused Goal, a To-Do transition, an unchanged
  fingerprint, or a schema-valid old running pair cannot authorize a current append. Historical task IDs do not
  become active To-Dos, Goal children or percentages.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_progressed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_progressed_historical_authority_confusion
reasoning_tier: high
context_scope: goal_progressed_historical_contract
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.progressed
- pm.goal_runtime_event.goal_progressed.schema.v2
- storage.goal_progressed_history_read.v1@1.0.0
- D-R08
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

For exactly `goal.progressed`, qualify CV-287, the 21-root schema roster and D-R08 under GRS-069: the whole `Plans/event_payloads/goal_runtime/goal_progressed.schema.json#` (`pm.goal_runtime_event.goal_progressed.schema.v2`) and family revision `2.0.0` remain registered historical validation authority. Current emission is prohibited before dedupe success, CAS, outbox or append, including a retry whose original idempotency key matches historical custody. Preserve the exact original header n -> n+1/current-CAS predicates, event identity, all outer/inner joins, original runtime/actor/account/correlation/causation/thread evidence, whole row fields, references and original acceptance oracle as historical semantics. No present-state alias, Goal-specific role cast, inferred original source or receipt may replace missing original evidence. EventRecord 2.0.0 and the exact original supported envelope/legacy route retain their own contracts; no alias or new compatibility conversion is introduced.

SP-300 expressly adopts actual SP-278 root/current generation/dataset, immutable row birth anchor, complete advancing global frontier/source token and the final after-helper source/admission/access boundary for `storage.goal_progressed_history_read.v1@1.0.0`. Its family checkpoint is individually `none_required` because this exact owner assigns zero durable effect. Full original validation is mandatory for verified history; unresolved or unavailable results confer no current authority. Reader withdrawal preserves original source and registry/retention membership, admits no new writer and settles no other event.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-069, ContractName:Plans/storage-plan.md#SP-300, SchemaID:pm.goal_runtime_event.goal_progressed.schema.v2

### CV-344 - Exact historical goal.replanned writer exclusion

```yaml
plan_unit_id: CV-344
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The exact registered goal.replanned whole v2 root remains unchanged authoritative historical validation.
  GRS-070 independently prohibits every current writer; reject before dedupe, CAS, outbox or append. SP-301 supplies
  only the original historical observation with complete current generic source authority and truthful original
  validation. No alias, event admission, new lifecycle or durable effect follows.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-070
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.replanned` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. Current material objective change or workflow replan cannot append
  this exact old Goal event, and missing original child/evidence/currentness facts cannot be backfilled with present
  workflow state.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_replanned.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_replanned_historical_authority_confusion
reasoning_tier: high
context_scope: goal_replanned_historical_contract
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.replanned
- pm.goal_runtime_event.goal_replanned.schema.v2
- storage.goal_replanned_history_read.v1@1.0.0
- D-R10
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

For exactly `goal.replanned`, qualify CV-287, the 21-root schema roster and D-R10 under GRS-070: the whole `Plans/event_payloads/goal_runtime/goal_replanned.schema.json#` (`pm.goal_runtime_event.goal_replanned.schema.v2`) and family revision `2.0.0` remain registered historical validation authority. Current emission is prohibited before dedupe success, CAS, outbox or append, including a retry whose original idempotency key matches historical custody. Preserve the exact original header n -> n+1/current-CAS predicates, event identity, all outer/inner joins, original runtime/actor/account/correlation/causation/thread evidence, whole row fields, references and original acceptance oracle as historical semantics. No present-state alias, Goal-specific role cast, inferred original source or receipt may replace missing original evidence. EventRecord 2.0.0 and the exact original supported envelope/legacy route retain their own contracts; no alias or new compatibility conversion is introduced.

SP-301 expressly adopts actual SP-278 root/current generation/dataset, immutable row birth anchor, complete advancing global frontier/source token and the final after-helper source/admission/access boundary for `storage.goal_replanned_history_read.v1@1.0.0`. Its family checkpoint is individually `none_required` because this exact owner assigns zero durable effect. Full original validation is mandatory for verified history; unresolved or unavailable results confer no current authority. Reader withdrawal preserves original source and registry/retention membership, admits no new writer and settles no other event.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-070, ContractName:Plans/storage-plan.md#SP-301, SchemaID:pm.goal_runtime_event.goal_replanned.schema.v2

### CV-345 - Exact historical goal.stopped writer exclusion

```yaml
plan_unit_id: CV-345
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The exact registered goal.stopped whole v2 root remains unchanged authoritative historical validation.
  GRS-071 independently prohibits every current writer; reject before dedupe, CAS, outbox or append. SP-302 supplies
  only the original historical observation with complete current generic source authority and truthful original
  validation. No alias, event admission, new lifecycle or durable effect follows.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-071
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.stopped` append is refused before dedupe/CAS/append with no state, receipt, provider,
  Usage, scheduling, Goal or workflow effect. A user Stop, cleared dependency, quota reset, execution window, recovery
  receipt or retained resumable=true never authorizes current stopped Goal state, resume/stop-epoch clearing or
  a new settlement/receipt.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_stopped.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_stopped_historical_authority_confusion
reasoning_tier: high
context_scope: goal_stopped_historical_contract
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.stopped
- pm.goal_runtime_event.goal_stopped.schema.v2
- storage.goal_stopped_history_read.v1@1.0.0
- D-R12
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

For exactly `goal.stopped`, qualify CV-287, the 21-root schema roster and D-R12 under GRS-071: the whole `Plans/event_payloads/goal_runtime/goal_stopped.schema.json#` (`pm.goal_runtime_event.goal_stopped.schema.v2`) and family revision `2.0.0` remain registered historical validation authority. Current emission is prohibited before dedupe success, CAS, outbox or append, including a retry whose original idempotency key matches historical custody. Preserve the exact original header n -> n+1/current-CAS predicates, event identity, all outer/inner joins, original runtime/actor/account/correlation/causation/thread evidence, whole row fields, references and original acceptance oracle as historical semantics. No present-state alias, Goal-specific role cast, inferred original source or receipt may replace missing original evidence. EventRecord 2.0.0 and the exact original supported envelope/legacy route retain their own contracts; no alias or new compatibility conversion is introduced.

SP-302 expressly adopts actual SP-278 root/current generation/dataset, immutable row birth anchor, complete advancing global frontier/source token and the final after-helper source/admission/access boundary for `storage.goal_stopped_history_read.v1@1.0.0`. Its family checkpoint is individually `none_required` because this exact owner assigns zero durable effect. Full original validation is mandatory for verified history; unresolved or unavailable results confer no current authority. Reader withdrawal preserves original source and registry/retention membership, admits no new writer and settles no other event.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-071, ContractName:Plans/storage-plan.md#SP-302, SchemaID:pm.goal_runtime_event.goal_stopped.schema.v2

### CV-346 - Exact historical goal.verification_decided writer exclusion

```yaml
plan_unit_id: CV-346
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: The exact registered goal.verification_decided whole v2 root remains unchanged authoritative historical
  validation. GRS-072 independently prohibits every current writer; reject before dedupe, CAS, outbox or append.
  SP-303 supplies only the original historical observation with complete current generic source authority and truthful
  original validation. No alias, event admission, new lifecycle or durable effect follows.
gui_related: false
gui_classification_reason: This is an internal historical source/validation contract with no new visual surface.
split_recommended: false
depends_on:
- GRS-072
- DL-039
- DL-045
unblocks: []
acceptance_criteria:
- Current schema-valid `goal.verification_decided` append is refused before dedupe/CAS/append with no state, receipt,
  provider, Usage, scheduling, Goal or workflow effect. A current reviewer result, VerificationCycle.status, valid
  Workflow receipt, or old passed payload cannot append this Goal event, mutate Goal state, create a required Goal
  verifier/adjudicator role, or claim completion.
- Given an actually lawfully admitted original historical event, its complete source and original applicable owner
  proof, the exact historical reader returns that original value with verified historical provenance under a current
  full SP-278 token and permitted disclosure. This is a normative conditional oracle, not a claim that such an instance
  exists.
- Missing original required predecessor/receipt/source/decision proof reports unresolved historical validation;
  current data cannot invent it. Invalid envelope/payload/source rejects truthful inspection without this read writing
  quarantine or a checkpoint.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
- Plans/event_record_index_checkpoint.schema.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_verification_decided_historical_authority_confusion
reasoning_tier: high
context_scope: goal_verification_decided_historical_contract
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: historical_source_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
- Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima
preserved_exact_tokens:
- goal.verification_decided
- pm.goal_runtime_event.goal_verification_decided.schema.v2
- storage.goal_verification_decided_history_read.v1@1.0.0
- D-R15
- RP-AUTHORITY-INDEFINITE
- none_required
negative_constraints:
- No current writer, event-derived Goal state, retired topology/role/stage, new event admission, historical byte
  rewriting, or original-admission inference from schema/hash/timestamp.
- No durable reader effect, family checkpoint, read-triggered recovery/quarantine, native proof, WorkNode/readiness
  admission or governance seal.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
```

For exactly `goal.verification_decided`, qualify CV-287, the 21-root schema roster and D-R15 under GRS-072: the whole `Plans/event_payloads/goal_runtime/goal_verification_decided.schema.json#` (`pm.goal_runtime_event.goal_verification_decided.schema.v2`) and family revision `2.0.0` remain registered historical validation authority. Current emission is prohibited before dedupe success, CAS, outbox or append, including a retry whose original idempotency key matches historical custody. Preserve the exact original header n -> n+1/current-CAS predicates, event identity, all outer/inner joins, original runtime/actor/account/correlation/causation/thread evidence, whole row fields, references and original acceptance oracle as historical semantics. No present-state alias, Goal-specific role cast, inferred original source or receipt may replace missing original evidence. EventRecord 2.0.0 and the exact original supported envelope/legacy route retain their own contracts; no alias or new compatibility conversion is introduced.

SP-303 expressly adopts actual SP-278 root/current generation/dataset, immutable row birth anchor, complete advancing global frontier/source token and the final after-helper source/admission/access boundary for `storage.goal_verification_decided_history_read.v1@1.0.0`. Its family checkpoint is individually `none_required` because this exact owner assigns zero durable effect. Full original validation is mandatory for verified history; unresolved or unavailable results confer no current authority. Reader withdrawal preserves original source and registry/retention membership, admits no new writer and settles no other event.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-072, ContractName:Plans/storage-plan.md#SP-303, SchemaID:pm.goal_runtime_event.goal_verification_decided.schema.v2

### CV-347 - Current cancelled-v3 and exact cancellation resource graph

```yaml
plan_unit_id: CV-347
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Register current goal.cancelled family revision 3.0.0 with complete content-free v3 payload
  and preserve the entire original v2 schema under legacy_v2_reader. The single existing Cancel handler gains
  closed GoalCancelRequestV2/GoalCancelResultV2 references. All 107 cancellation and execution-source definitions
  and the 19-document plus three embedded-resource graph are required alongside complete relational source/owner/codec
  predicates.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- GRS-073
- SP-304
- SP-305
- CV-333
- DL-039
unblocks: []
acceptance_criteria:
- Exactly one existing registry row changes to current v3; whole old v2 schema and every other row remain exact.
- The central Cancel request is closed with fourteen original fields and no Update-only conditional; all original
  central definitions remain unchanged.
- Every transitive reference resolves from complete explicitly registered local resources, including the custom
  whole cancellation-v2 container.
- Complete key/scope/source/epoch/body/Stop/event/receipt/result/codec equality is checked beyond structural
  schemas.
- No new Goal integer cap, generic command, alias, EventRecord field, retention policy or native proof follows
  from these declarations.
validation_surfaces:
- Plans/goal_cancel_command_custody.schema.json
- Plans/goal_execution_binding_custody.schema.json
- Plans/goal_cancel_schema_resources.json
- python3 scripts/pm-plan-index.py validate
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: cv-347_original_cancel_contract
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No fifth Goal state, objective/body revision mutation, child/tool settlement list, new command or peer handler.
- No raw Goal content in indefinite audit, new retention limit, silent codec substitution or fabricated original
  receipt.
- No native execution proof, full event-depth verdict, WorkNode/readiness admission or governance seal.
```

The exact schema owners are `Plans/goal_cancel_command_custody.schema.json` and `Plans/goal_execution_binding_custody.schema.json`. The central `Plans/goal_runtime_contracts.schema.json` adds only `GoalCancelRequestV2` and `GoalCancelResultV2`; all old central definitions and actual Start/Update schemas remain exact. No generic Pause/Resume contract is inferred. The active event is `pm.goal_runtime_event.goal_cancelled.schema.v3`; its whole unchanged `pm.goal_runtime_event.goal_cancelled.schema.v2` is selected only at `#/legacy_v2_reader` for actual historical reads. This existing event changes revision, not family count, aliases, EventRecord envelope, legacy joins or indefinite event retention.

`Plans/goal_cancel_schema_resources.json` selects all nineteen complete local schema documents by actual retrieval URI/path/hash and separately enrolls all three whole embedded historical resources by containing-document hash and exact pointer. Use a standard offline JSON Schema registry with these explicit registrations; no network fetch, basename guessing, lexical fallback or inferred custom-container crawling is allowed. The current cancellation, execution-association, selected body-control, original Start/Update callers, body/history/currentness readers, SIR/append/migration/backup and retained historical readers require the actual corresponding complete graph/role installation. File hashes and role strings are necessary bindings, not native installation or authority evidence.

GRS-064's local arbitrary-precision Goal JSON qualification is preserved in the new local codec. EventRecord producer semantics and CV-333 owner-result hashes retain RFC8785, and the complete event/first receipt retain their original MessagePack formats. SP-305 must prove the actual complete possible assignment domain, not rely on current small values. Unsupported valid Goal values are an unavailable codec route, never a corrupt Goal or a new schema limit. SP-304/SP-305 own complete full-value versus semantic hash preimages and the final cross-object predicates; shape-only agreement cannot admit original source, currentness, side effects, result, replay or disclosure.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/storage-plan.md#SP-304, ContractName:Plans/Contracts_V0.md#CV-347, ContractName:Plans/storage-plan.md#SP-305

### CV-348 - Complete bound Plan cancellation source and preparation contracts

The canonical complete Plan source resource is `Plans/assistant_plan_cancel_custody.schema.json` at `https://puppetmaster.local/schemas/assistant_plan_cancel_custody/1.0.0/schema.json`. The canonical bound entry resource is `Plans/assistant_plan_cancel_bound_entry.schema.json` at `https://puppetmaster.local/schemas/assistant_plan_cancel_bound_entry/1.0.0/schema.json`. `Plans/assistant_plan_cancel_schema_resources.json` registers the full declared offline graph, including exact whole current and embedded legacy resources. Standard Draft 2020-12 resolution must use that registration; walking arbitrary nested objects for $id is not resource installation. Existing resource IDs and schemas remain unchanged.

`Plans/assistant_plan_cancel_contracts/methods.json`, `Plans/assistant_plan_cancel_contracts/physical-families.json`, `Plans/assistant_plan_cancel_contracts/owner-field-map.json`, `Plans/assistant_plan_cancel_contracts/numeric-paths.json`, `Plans/assistant_plan_cancel_contracts/semantic-obligations.json`, `Plans/assistant_plan_cancel_contracts/future-slot-rules.json` and `Plans/assistant_plan_cancel_contracts/publication-dependencies.json` under that same contracts directory are the typed method, field, numeric, slot and dependency contracts. `Plans/assistant_plan_cancel_contracts/bound-method-adoptions.json` and `Plans/assistant_plan_cancel_contracts/bound-semantic-obligations.json` bind the original C/SIR entry profile. Schema shape alone never establishes original issuance or native permission.

The four full native logical records retain all 61 fields and all existing primitive types. The 15-field PlanRun remains unchanged. `StoragePlanRun.run_completion_anchor` and `StoragePlanCancelResult.original_operation_identity` are physical-wrapper metadata, not new logical record fields. Whole native source wrappers use the SP-306 original JCS exact route. Source origin, effect and result hashes include these complete wrapper fields. An actually installed older/different source shape requires its own authentic original migration before using this profile; unknown fields cannot be trimmed and missing required fields cannot be filled from guessed time or state.

#### Original complete preparation

BeforeStopSources consumes actual current StorageBodyControlV2, host Stop, binding control/revision/origin, whole writer domain/head, exact original GoalPlanBinding and genuine C-source SourceAudit. The actual original Goal/project/thread/PlanRun association authenticates their joins. IDs are not inferred from native Run, GoalRun or thread proximity. Whole ordinary pending and cancellation_pending stay separate. The actual all-writer domain, owner epochs and complete shared control/Stop/deletion/hold/permission sources are independently read at each entry and final boundary. An existing unrelated cancellation pending, missing source, changed binding or unaccounted writer makes preparation unavailable. The declared operation’s own later C-stop pending is admitted only through the exact original canonical transition and receipt. Stop absence or safe-stop completion cannot be inferred from a serialized control or receipt alone.

owner.assistant_plan.cancel_bound_run.prepare.v3 has BeforeStopSources -> PreparationResult. It is a private original Plan + Scheduling + Goal + Storage participant, not a peer service or public JSON factory. BeforeStopSources deliberately has no new cancellation receipt, Stop receipt, future receipt hash or completed safe-stop claim. Existing SourceAudit is genuinely issued by original C-source; it is not a new invented Goal request. PreparationScope binds its actual normalized operation/cancellation identity and exact original request/ref/hash. Original Plan/scheduler operation IDs, joint transaction ID and preparation ID are obtained from their actual owners’ real reservations BEFORE any returning helper and before Stop. Identity reservation is not effect publication.

At entry, independently capture the complete authentic original source values, exact native operations/owner/server/root/permissions, all whole preimages including unrelated rows and current installed resource/codec implementations. Privately retain the real all-writer/source exclusion capabilities. Derive the complete independently expected mutation and output set directly from those originals before any returning parser, schema/codec, selector, read, builder, copy or equality helper. The caller cannot select the route, source list, expected candidate or applicability by supplying an object matching these types.

Use the whole PlanExpected and authoritative complete scheduler selection, including every enabled/disabled and terminal schedule/consent, exact original ScheduleRunBinding and in-flight original writers. Sorted full physical-key identity and set completeness are native predicates, not a hash proof. Authenticate empty sets through that same owner. Preserve all unrelated originals and completed effects. Genuine original safe-stop authority must be enlistable without inventing a prior safe point or new owner. If safe-stop requires a mutation of any selected Plan/run/schedule/consent source before the coupled commit, this exact fixed-source preparation is not applicable: an actual original broader preparation must first be bound; do not silently refresh selected sources after Stop. Attempt/tool reconciliation remains original owner work and must satisfy the independently held original safe-stop predicate.

Reserve every future non-time/non-hash scalar identity from its real original owner before Stop: all effect/result IDs and keys, source/origin issuer IDs, operation/transaction IDs, original safe-stop result identity, cancellation/Stop receipt identities, source refs, producer identities, receipt_refs, original observable_work ref and original invalidation reason. Reservations must bind their actual original owner and complete admission domain. Never fabricate a user reason or public PlanCancelRequest; the original Scheduling owner supplies its actual reason. Existing source strings stay byte-exact and do not get normalized or trimmed.

Construct the complete target set from actual source membership, not a provided target list. It contains every changed and preserved whole native wrapper; unchanged schedule correlation wrappers; all newly required original SourceOrigin wrappers; whole PlanEffect and ScheduleQuotaEffect wrappers and origins; whole PlanCancelCommittedResult wrapper and origin; and complete CancellationLink, OwnerSelection, BoundCancelRequest, OwnerSettlement and SettledResult delivery views. Every ordinary schema branch, property, nullable value, array member and nested object is represented in each target’s complete_value_template. Exact native field/schema/key/version/source-revision joins remain enforced. A missing target, extra target, omitted field, duplicate member or role/schema/key mismatch rejects before Stop. FutureSlot cannot inject a number, array, object, optional field or new target.

PreparedTarget.schema_ref selects the exact entire old or successor closed definition, not a reduced projection. Complete templates preserve all copied strings, booleans, nulls and numeric primitive values, all exact keys and all original arrays. The only runtime leaves are narrowly enumerated original timestamps and complete physical SHA-256 values. ConcatTerm is allowed only where the existing exact physical-key grammar includes an already declared complete digest component, such as a SourceOrigin key; no generic string formatting or user text substitution is authorized. Every concat's full prefix/separators/components and corresponding issued source are independently derived. Literal objects/arrays must use the explicit recursive ObjectTerm/ArrayTerm nodes; members are unique and in exact original JCS key order. Scalar UTF-8 is preserved without normalization.

#### Exact full-value domains

Before Stop, derive all mathematical successor values in arbitrary-precision source arithmetic, without first coercing through a floating parser. Each changed current source has exactly source_revision+1; preserved rows have exactly the original revision. PlanRun.plan_run_epoch is exactly original+1. Each active/paused schedule revision is exactly original+1; terminal schedule revisions remain original. Copy these same exact values into every corresponding origin, before/after selector, effect and result field; initial immutable origin revisions follow their actual original source creation rule. PlanCancelCommittedResult.revision stays the unchanged Plan document version. All other numeric native fields—including owner/server epochs, target versions, schedule integers, nullable confidence, consent Stop epoch, To-Do revision and all copied source fields—retain their exact original value and primitive type.

The cancellation receipt’s first user_stop_epoch is derived from the actual original canonical Stop transition and its captured whole Stop source before Stop; it is not the current epoch after any additional Stop. GRS-076 and SIR-051 supply the original bound-compatible C-source/assignment admission. No-bound Plan-version branches remain null; bound Plan-version branches are the exact nonnull original binding singleton, including the complete nested owner-result domain. The original event/result/SIR source and codec predicates remain mandatory. The existing canonical EventRecord MessagePack, Goal/source JSON and JCS projections remain independent and unchanged. No Plan integer is forced through the wrong carrier merely because it appears in the same operation.

Plans/assistant_plan_cancel_contracts/numeric-paths.json is a complete static expansion of selected Plan source/target definitions. For every instantiated numeric leaf and active schema branch, NumericAssignment supplies the exact original and result mathematical values, original source/path and derivation. Proof notation uses exact decimal strings only inside this administrative typed preparation; actual native target fields remain their original integer/number primitives. Nullable absence stays null, not zero. Every leaf is accounted for, including all array instances. The owner compares the generated inventory against the whole installed schema and authentic full candidate. Extra/missing assignments, duplicates, wrong branches or unsupported derivations reject.

Each Plan JCS candidate numeric value is tested against the actual installed original JCS exact representability predicate and output decimal, comparing the parsed exact value to the original mathematical value and primitive type. Current 9007199254740992 and its required successor 9007199254740993 illustrate why checking only a current value is insufficient. A failed successor is unavailable BEFORE Stop; no fixed-width product cap, rounding, clamp, string replacement or alternate codec is introduced. The complete original strings/arrays/objects and every future-slot domain must likewise be qualified under the actual installed full schemas and codec. Exact decode/re-encode equality is additional validation, never a replacement for original-value comparison.

Every FutureSlot is unique, source-bound and occurrence-complete. original_timestamp permits only the genuine original Scheduling commit time for changed consent.updated_at, genuine original owner effect commit times, and genuine original SourceOrigin issuance times at their designated timestamp fields. Their original source must guarantee the entire output domain consists of scalar valid timestamp strings that the installed schema/JCS preserves; no prediction, artificial fixed width, truncation or fabricated time. A timestamp slot may be shared only where the actual owner uses that exact same time. Already existing timestamps remain literals. Actual cancellation accepted time remains the original canonical fixed source time; no new Plan slot overwrites it.

complete_physical_sha256 permits only SHA-256 of a fully specified earlier authentic target or the separately qualified genuine original cancellation/Stop receipt. The entire hash domain is lowercase 64-character hex, with exact slot/path/source correspondence. Physical hashes cover whole original canonical wrappers; they are not semantic hashes. Native source values -> their complete physical hashes -> original origins (and digest-containing keys) -> complete origin hashes -> Plan/Scheduler effects -> effect origins -> original result -> result origin -> passive settlement/delivery. The original cancel/Stop receipt nodes precede Plan effects through the separate canonical actual Stop operation. No target references itself, its own origin, a later descendant or a mutable unknown result. All edges are explicitly derived from targets/slot consumers and checked acyclic before Stop. Unknown future identifiers or text have no slot kind: they must be genuinely reserved/fixed first or preparation is unavailable.

Effect invalidated_reason_sha256 is null iff the actual native resulting ExecutionSchedule.invalidated_reason is null; otherwise SHA-256 covers its exact scalar UTF-8 bytes, without normalization. Compute it before Stop from the independently derived resulting full native reason, including preserved terminal reasons. It is a fixed literal commitment, not a runtime-text slot. The full canonical ExecutionSchedule.invalidated_reason is unchanged. Both the original commit owner and current reader independently compare the complete original reason and its exact commitment. PlanCancelCommittedResult.observable_work is the actual original observable-work reference required by APR, never prose or a generated summary.

Complete ValueTerm trees, exact arithmetic, reservation, slot occurrence completeness and actual installed JCS qualification remain mandatory. Every newly required wrapper field is part of the complete independently derived before/after candidate, every full physical hash and every affected origin/effect/result binding. There is no reduced old wrapper underneath the complete target.

Before Stop, the original source Run and run-origin anchor are genuinely null for this fresh unfinished cancellation. The complete after-Run and run-origin templates contain the full nonnull `RunCompletionAnchor`: all IDs, terminal state, settlement source revision and epoch are fixed exact literals derived/reserved before Stop; only the genuine original settlement time is a narrow declared `original_timestamp` slot. The copied time in the origin uses that same original slot, never a later clock. All other original/new numeric leaves are covered by exact NumericAssignment and full original mathematical-value/JCS comparison before Stop. `complete_assignment_sha256` covers the complete preparation excluding only itself. No runtime slot may inject an ID, integer, array, object, missing property or arbitrary text.

`StoragePlanCancelResult.original_operation_identity` is NEW compact immutable wrapper metadata. Independently copy its complete original canonical NormalizedIdentity from the actual original C-source, and its scope/request ref/hash/idempotency key and Plan/Scheduler/joint operation IDs from that same original operation and real reservations. This is a complete original replay identity, not a supplied reconstructed request. Every field is fixed before Stop and included in the complete stored result candidate and original result-origin commitment. It contains no request/body text. Its record's original `replay_of` remains null forever.

The entire native logical records and strings remain exact. Full `ExecutionSchedule.invalidated_reason` is preserved; the new ScheduleEffect's nullable digest is SHA-256 of its exact original resulting UTF-8 string, null only for actual null. It is computed before Stop, not a future text slot. `observable_work`, receipt refs, operation refs and source refs remain genuine original references rather than prose. Unsupported exact codec domains refuse the route before Stop without a product integer cap, rounding, normalization or alternate codec. The administrative NumericAssignment decimal strings preserve exact fractional proof notation and change no native numerical field or codec.

The later independent Janitor operation has its own complete original input and candidate domain qualification before any mutation. Its retirement timestamp is not a cancellation FutureSlot and never changes the Run completion clock. Every retirement counter, revision, timestamp, identity and full candidate must fit its actual selected schema/codec exactly before atomic compaction.

#### Preparation release and original effect admission

BeforeStopPrepared carries the complete selected originals, genuine reservations, targets, numeric assignments, slots and installed codec/resource bindings. complete_original_input_sha256 covers the full BeforeStopSources using the selected original exact codec after full original source comparison. complete_assignment_sha256 covers the entire prepared object excluding only that hash itself, using the selected Plan JCS after every field is admitted; complete_original_input_sha256 and current_cancel_assignment are included. These commitments are not native leases. No preparation is persisted in an indefinite archive; it contains complete native content and stays in the genuine original native operation under actual source custody.

Before releasing preparation, AFTER ALL returning helpers, the real original owners independently recheck their captured operation/source/preimages, entire independently expected assignment bytes, complete membership, original permissions/deletion/hold/Stop/control, exact installations and whole future domains. The final predicate has no helper, callback, logger or async gap to release into the original C-stop participant. That participant independently performs its own whole-entry and final checks and authenticates the real currently held preparation and original cancellation assignment, not a serialized status. Carrier classification and native enlistment must already be satisfied. Only then may genuine C-stop occur.

After real Stop, PreparedBoundCancelRequest pairs the exact same preparation with unchanged BoundCancelRequest/OwnerSelection plus genuine original Stop/cancellation receipts and the actual original safe-stop result identity/hash. Construct CancellationLink only now, from those authentic complete originals. Compare their actual first Stop epoch, normalized request, binding scope, fixed IDs/times and complete physical hashes to the prepared assignment and canonical original owner transition. A receipt alone does not prove Stop effectiveness: the actual current host Stop owner and execution/callback domain must enforce it. Current extra Stops cannot rewrite this first cancellation receipt or reset its epoch. Actual original safe-stop completion is independently observed through the true native owner and complete original operation/result; prepared identity or a receipt hash proves none of it.

The original joint commit consumes the private same-original-operation preparation, actual safe-stop authority and genuine post-Stop originals. Before any returning helper, independently capture its whole authentic entry/preimages and expected full output candidates. All original selected Plan/scheduler values and original domain/owner memberships must still match preparation exactly; only the specifically admitted genuine canonical Stop/control/progress transitions are allowed. Future substitutions are obtained from the exact original owner/source and must be in the already admitted slots/domains. Construct every actual whole candidate using the already admitted template and verify the entire result against its original schema and exact codec. No post-Stop widening, altered IDs/reason, new array member, refreshed Plan source or newly allocated result identity is allowed.

After ALL returning helpers, original Plan + Scheduler + Goal + Storage owners independently check complete original source/currentness/Stop/permissions/owner/domain/preimages; exact safe-stop/callback constraints; the independently expected entire pending write union including unchanged/unrelated rows; every target/slot/numeric/resource membership and exact original result/receipt identities. A single pure predicate has no returning gap to atomic commit. All Plan/run/schedule/consent changes, their original origins, two effects and original result with origins commit together or none of these new effects do. Complete authentic readback and its independently fenced final predicate precede delivery. Each directly callable participant, retained/current read, retry and replay has the same independent entry/before-helper and after-all-helpers obligations; outer validation never substitutes for inner validation.

A lost preparation/native lease before Stop makes the new route unavailable. After Stop, loss never authorizes a new effect or reconstructed preparation; preserve genuine Stop and all earlier effects, use only existing authentic recovery-required/terminal publication if its independently admitted original source/codec authority permits it. An already genuine coupled effect is recovered from original complete result/effect custody with unchanged identities and actual current owner permissions, without requiring an unused pre-Stop capability or replaying mutation. This contract does not invent a restart reassignment profile or claim retained hashes recreate full sources or locks.

Every independently callable original participant captures complete authentic inputs, native participant/root/registration/operation/currentness/permission/deletion/hold sources, all beforeimages and the independently derived full permissible output before any returning helper. After all returning parsers, builders, codecs, resolvers, copies and comparators, it repeats one pure full-native and whole-candidate predicate with no helper, callback, logger or async gap to its own commit or passive disclosure. The outer publisher also checks the complete joined result. Original readback precedes dependent publication. Shape, detached hashes, matching names and serialized leases do not authenticate authority. Refusal preserves every genuine prior effect and unrelated original member.

This is a source-contract integration. Native installation, original issuer authentication, all-writer enrollment, safe-stop/callback exclusion, exact codec execution, redb atomicity/fsync/crash behavior, source/result replay, backup/restore and Janitor execution remain NOT_RUN. No new public command, event, Goal state, WorkNode, NodeSeed, readiness admission, event-depth pass or governance seal follows.

```yaml
plan_unit_id: CV-348
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Complete bound Plan cancellation source and preparation contracts. Complete original schemas,
  method graph, recursive target templates and numeric domains resolve through the declared canonical
  resource graph.
gui_related: false
gui_classification_reason: Defines original owner, schema, storage or verification contracts.
split_recommended: false
depends_on:
- CV-347
unblocks: []
acceptance_criteria:
- Complete original schemas, method graph, recursive target templates and numeric domains resolve through
  the declared canonical resource graph.
- Every source, successor and future-slot primitive preserves exact original mathematical and semantic
  value under the actual installed codec before Stop.
- C assignment precedes Plan preparation without a reverse dependency; every post-Stop substitution belongs
  to its previously admitted original domain.
- No future ID, number, arbitrary text, object, array or missing-field substitution is permitted; all
  physical hash dependencies are acyclic.
- New anchor and replay identity are complete wrapper metadata; original native logical fields and public
  result/event types remain unchanged.
validation_surfaces:
- Plans/assistant_plan_cancel_schema_resources.json
- Plans/assistant_plan_cancel_custody.schema.json
- Plans/assistant_plan_cancel_bound_entry.schema.json
- Plans/assistant_plan_cancel_contracts/numeric-paths.json
- Plans/assistant_plan_cancel_contracts/future-slot-rules.json
- Plans/assistant_plan_cancel_contracts/publication-dependencies.json
risk_class: goal_cancellation_original_authority_or_effect_loss
reasoning_tier: high
context_scope: cv_348_bound_plan_custody
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
negative_constraints:
- No public command, event, Goal or Plan lifecycle expansion, peer owner or fabricated original effect.
- No native field redaction, numeric coercion, new retention policy, full runtime archive or automatic
  deployed migration.
- No model/native execution, WorkNode/NodeSeed/readiness admission or governance seal.
```

### CV-349 - Complete Workflow activation source resources and original method contracts

CV-349 adopts the whole owner schemas and resource bindings selected by `Plans/workflow_activation_schema_resources.json` and the complete physical/method contracts under `Plans/workflow_activation_contracts/`. Every imported schema body, `$id`, lexical `$ref`, required/optional/nullable branch, nested object/array and numeric language is preserved at its declared canonical path. A literal `proposals` or `proposed` token in an adopted identifier remains the exact canonical resource identity; it is not an instruction to fetch an experiment or permission to register arbitrary schemas. The owner declarations below, actual installed method and immutable resource map select the grammar. Existing owner schemas and retained historical graphs remain byte-exact.

| Canonical schema below `Plans/workflow_activation_contracts/schemas/` | Preserved resource identity | Definitions |
|---|---|---|
| `activation-read-result.v4.schema.json` | `https://puppetmaster.local/proposals/workflow_activation_current_reader.v4.schema.json` | 0 |
| `activation-recovery-views.v1.schema.json` | `https://puppetmaster.local/proposals/activation_original_recovery_views.v1.schema.json` | 8 |
| `aggregate-live-input.v1.schema.json` | `https://puppetmaster.local/proposals/aggregate_intake_live_input.v1.schema.json` | 21 |
| `compiler-live-inputs.v1.schema.json` | `https://puppetmaster.local/proposals/compiler_two_live_inputs.v1.schema.json` | 36 |
| `current-goal-guard.v1.schema.json` | `https://puppetmaster.local/proposals/activation_operational_current_goal_guard.v1.schema.json` | 3 |
| `current-materialization.v1.schema.json` | `https://puppetmaster.local/proposals/current_activation_materialization_join.v1.schema.json` | 17 |
| `goal-association-join.v4.schema.json` | `https://puppetmaster.local/proposals/workflow_birth_association_goal_join.v4.schema.json` | 11 |
| `historical-goal-cancel-control.schema.json` | `https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json` | 53 |
| `historical-plans-to-code-handoff.schema.json` | `https://puppetmaster.local/schemas/plans_to_code_handoff.schema.json` | 110 |
| `models-request-live.v1.schema.json` | `https://puppetmaster.local/proposals/activation_models_request_set_live_inputs.v1.schema.json` | 17 |
| `native-worknode-current-activation.v1.schema.json` | `https://puppetmaster.local/proposals/native_worknode_current_activation.v1.schema.json` | 85 |
| `native-worknode-source.v1.schema.json` | `pm.executor.native_worknode_custody.proposed.v1` | 85 |
| `operational-custody.v1.schema.json` | `https://puppetmaster.local/proposals/activation_seven_operational_custody.v1.schema.json` | 70 |
| `operational-custody.v2.schema.json` | `https://puppetmaster.local/proposals/activation_seven_operational_custody.v2.schema.json` | 72 |
| `provisioning-live-inputs.v1.schema.json` | `https://puppetmaster.local/proposals/workflow_provisioning_live_inputs/1.0.0` | 17 |
| `source-control-receipt-custody.v1.schema.json` | `https://puppetmaster.local/proposals/goal_completion_source_control_inputs/1.0.0` | 56 |
| `workflow-activation.v3.schema.json` | `https://puppetmaster.local/proposals/workflow_activation_sources.v3.schema.json` | 78 |
| `workflow-activation.v4.schema.json` | `https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json` | 82 |
| `workflow-birth-materialization-join.v4.schema.json` | `https://puppetmaster.local/proposals/workflow_birth_association_source_join.v4.schema.json` | 12 |

#### Separate whole resource realms

The map supplies four independently closed offline realms. `retained_original_operational_v1` retains the whole original operational graph, including historical handoff/control bodies, for original interpretation only. `current_operational_source` selects the exact current operational-v2 grammar, its whole current handoff aliases and current direct-reader result contracts. `current_materialization_source` adds the complete current native materialization resource, full source join and Workflow birth/transition arguments. `current_goal_control` contains actual current Goal body/history/control/Stop/binding/writer-domain and Goal association arguments. No old same-ID body in a retained native cancellation graph can satisfy current Goal authority.

Every whole-document retrieval URI and embedded resource pointer resolves to the exact pinned canonical file and whole bytes declared by the map. Relative and URN-like references retain their exact effective targets. Two different bodies cannot occupy one retrieval identity inside a realm. There is no network fallback, basename lookup, implicit search path, last-registration-wins alias or recursive validator substitution. Native source and current-control arguments are independently authenticated in their selected realms and joined by actual Storage/project/thread/Goal/run/operation/owner identity; a serialized cross-reference cannot mint native capability or join two unrelated operations.

The complete historical native WorkNode resource has 85 definitions. Its separately adopted current-activation successor retains all 85 and changes only the explicit identity/reference propagation listed in `current-materialization-reference-map.json`; reversing that enumerated mapping restores the whole old resource. It is not a shortened native subset. The complete A4 resource retains all 82 definitions. `current-materialization.v1.schema.json` adds 17 definitions of whole transient arguments and current child refinements; it does not replace native fields or A4 capture provenance. Goal/Workflow association v4 adds whole transient before/candidate/current-read arguments, while its pre-existing physical families, original issuers and source record schemas remain unchanged. The exact original Goal body grammar is used with direct metadata external_authority_ref=null.

#### Exact methods, returns and current refinements

`methods.json` is the native original-method selection authority. It retains the seven complete original input/capture routes and explicitly selects fourteen complete current direct live/audit returns. The current result reference selects the nested `properties/result` schema, including the exact original available/unavailable alternatives; the outer `input_kind/result` inspection wrapper is not added to any existing direct method’s wire return. Existing complete native requests stay unchanged. The inspection-only SevenInputLiveResult, SevenInputAuditResult, SevenInputDurableRequest and SevenInputDurableResult unions are typed joins, not new public dispatcher commands.

| Original input role | Current live direct method | Current retained metadata direct method |
|---|---|---|
| `native_compile` | `reader.workflow.native_compile.live_original.v1` | `reader.workflow.compiler_input.audit_metadata.v1` |
| `compile_certification` | `reader.workflow.compile_certification.live_original.v1` | `reader.workflow.compiler_input.audit_metadata.v1` |
| `aggregate_intake` | `reader.executor.aggregate_intake.live_original.v1` | `reader.executor.aggregate_intake.audit_metadata.v1` |
| `test_capability` | `owner.ats.test_capability.read_live.v1` | `owner.storage.test_capability_capture.read_retained.v1` |
| `model_resolution` | `models.read_live_role_resolution.v1` | `models.storage.read_retained_role_capture.v1` |
| `worknode_request_set` | `goal_runtime.read_live_activation_request_set.v1` | `goal_runtime.storage.read_retained_request_set_capture.v1` |
| `source_control_preflight` | `owner.executor.source_control_preflight.read_live.v1` | `owner.storage.executor_preflight_capture.read_retained.v1` |

Each entry above retains its exact whole request and selects the full current inner result schema in methods.json. Shared audit method names still select the original whole native role through actual original owner admission; no new public role discriminator is added.

All seven durable routes retain their exact typed request, full available/unavailable result and full source/origin binding. The native compiler’s successful read includes both complete_original_input and the whole complete_operational_checkpoint. A success-only materialization argument can be assembled only after every required whole durable read has actually succeeded. A failed read cannot be silently omitted, rewritten to an empty collection, routed through an old live lease, or represented by capture metadata. Full accepted source and output identity must match the actual original captured input, independent of hash equality or schema validity.

Current operational v2 selects the whole landed PNC-024 handoff grammar through its explicitly enumerated lexical aliases. The five timing corrections admit truthful pre-assignment draft/ready state while preserving original running/complete/serial/blocked/cancelled behavior. No old stored schema bytes or source_mode are migrated by alias adoption. `CurrentCompletionRequirementSource.required_children` and `CurrentRequiredSet.required_child_goal_run_ids` impose their zero-length current branch only on whole genuine sources, accompanied by native original child-authority checks. Neither current array refinement nor an adopted map supplies actual source existence.

`owner.executor.activation.materialize.v1` and `owner.workflow.activation.commit_materialized.v1` use `CurrentMaterializeArgument` in current_materialization_source plus the full actual_bound_goal GuardInput in current_goal_control, and GRS-077’s exact original association bridge. The complete original native MaterializeCurrentCandidates remains nested whole, with every preimage and candidate; the old GoalControlWitness is never the current-control argument. Nine other complete native operation contracts remain dependency declarations with no current activation dispatch selection.

PNC-025 newly defines two internal technical owner methods where the earlier source map supplied complete signatures without named entries: `owner.native_plan_compile_checkpoint.read_recovery.v1` uses the complete CompilerRecoveryRequest/CompilerRecoveryResult, and `owner.native_plan_compile_artifact.read_original.v1` uses the complete CompilerArtifactReadRequest/CompilerArtifactReadResult. These are explicit canonical owner definitions, not claims of pre-existing installed endpoints. The ordinary `owner.native_plan_compile_checkpoint.read_original.v1` retains its exact CompilerReadRequest/CompilerReadResult; there is no caller discriminator, private schema factory or overload of its public shape. CompilerCommitInput/CompilerCommitResult belongs to the actual original state publication with its artifact/head/Storage participants.

#### Preserved original physical-input compatibility contract

A4 `OriginalInputCapture`, its complete `OriginalInputCapturePhysical` wrapper, `workflow_original_input_capture`, original `owner.storage.activation_source.capture_input.v1` issuer alternative and older physical-input reader contracts remain preserved compatibility definitions. They reject every new live capture/origin schema identity. Their inclusion in the complete A4 schema, origin enum, family catalog or resource realm does not select them as any current seven-role live/durable route or create a current legacy reader/issuer. `methods.json.compatibility_original_input` makes that non-selection explicit. Each current role selects only its exact original role-specific whole request/result and durable binding; an unavailable current input cannot fall back to older input/capture readers, retained metadata, another source operation/lease, current Settings or a new producer invocation. Genuine surviving compatibility values retain their original provenance and current disclosure predicates; schema registration cannot manufacture their historical custody.

#### Primitive, codec and original publication semantics

Whole JSON Schema admission includes all original string/null/boolean/integer/object/array languages, exact literals, field presence and every complete physical wrapper. `pm.workflow.activation_source_json.v1` and `pm.executor.native_source_json.v1` retain their separate exact owner recipes, supported arbitrary-precision integer domains, key encodings, ordering, escaping and source hashes. Existing Goal JSON, source certification JSON, JCS projections and EventRecord MessagePack are independent. No native integer is passed through binary64, given a new maximum, rounded, normalized into a timestamp, or coerced merely because another joined record uses a different carrier. Unsupported actual codec domains refuse that source route before its effect; they are not repaired by deleting native fields.

Semantic record hashes, full physical wrapper hashes, currentness hashes, original origin bindings and key components keep their exact distinct preimages. No field may borrow a future event/receipt/BindingOrigin to authorize its own publication. GRS-077’s T0/T1/T2 order and original compiler/receipt hash order must be acyclic over every actual dependency, including transitively referenced permission/Stop/source origins. Complete candidates are fixed before the final pure predicate and actual original timestamps are not resampled afterward. An unavailable native fixed attribution or an extra required back-edge makes the route unavailable; omitting the required member is not a resolution.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: CV-349
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Complete Workflow activation source resources and original method contracts. Every exact schema
  resource and whole reference graph resolves offline in its declared source or current-control realm without conflicting
  alias bodies.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- CV-347
- CV-348
- GRS-075
- PNC-024
unblocks: []
acceptance_criteria:
- Every exact schema resource and whole reference graph resolves offline in its declared source or current-control
  realm without conflicting alias bodies.
- All original native definitions, current whole arguments, physical fields, primitive languages and direct method
  return shapes are preserved.
- The fourteen direct live/audit returns include their full available/unavailable alternatives without an extra
  inspection wrapper.
- Current durable and Goal-control joins require genuine original owner authority; schema identifiers, source hashes
  or copied origins cannot provide it.
validation_surfaces:
- Plans/workflow_activation_schema_resources.json
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/current-materialization-reference-map.json
- Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json
- Plans/workflow_activation_contracts/schemas/current-reader-routes.v1.schema.json
- Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json
- Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: cv_349_activation_original_custody
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_schema_resources.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/current-materialization-reference-map.json, ContractName:Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/current-reader-routes.v1.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/goal-association-join.v4.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/workflow-birth-materialization-join.v4.schema.json
