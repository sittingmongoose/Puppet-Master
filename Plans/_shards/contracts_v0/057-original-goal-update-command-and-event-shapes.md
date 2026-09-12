# Shard 057: Original Goal update command and event shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22434-L22820

Source SHA256: `ce738bd2b4603f80caa28b0a5c85a385abb93853550c34c0107f2a980e98e26a`

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
