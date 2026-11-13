# Shard 090: W3G event authority phase 1 - prepared without admission (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L29605-L31201

Source SHA256: `6b3024c84d258a99ef07009f05bb736cb20bb8cb19b3e0dc7962ff8ebe4ce434`

---

## W3G event authority phase 1 - prepared without admission (2026-11-05)

### SP-1500 - assistant_plan.build_started: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1500
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.build_started alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. assistant_plan.build_started uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is RP-RUNTIME-365D@1.0.0; Case L-3 Runtime/run/node/attempt;
  this exact event requires a real admitted PlanRun and its original completion anchor. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1500
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.build_started
- reader.assistant_plan.build_started.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_run` | `assistant_plan_run.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StoragePlanRun`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_run_application` | `assistant_plan_run.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{hex(plan_run_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRunStorageApplicationV1`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.build_started.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1500, ContractName:Plans/Contracts_V0.md#CV-1500

### SP-1501 - assistant_plan.cancelled: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1501
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.cancelled alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. assistant_plan.cancelled uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17646); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0
  and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not
  extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1501
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.cancelled
- reader.assistant_plan.cancelled.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_run` | `assistant_plan_run.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StoragePlanRun`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_cancel_result` | `assistant_plan_cancel_result.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StoragePlanCancelResult`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_cancel_result_application` | `assistant_plan_cancel_result.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(plan_run_id)}:{hex(cancellation_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanCancelResultStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.cancelled.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1501, ContractName:Plans/Contracts_V0.md#CV-1501

### SP-1502 - assistant_plan.completed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1502
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.completed alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. assistant_plan.completed uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is RP-RUNTIME-365D@1.0.0; Case L-3 Runtime/run/node/attempt;
  the required real PlanRun terminal record supplies the original run-completion anchor. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1502
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.completed
- reader.assistant_plan.completed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_run` | `assistant_plan_run.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(plan_run_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StoragePlanRun`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_run_application` | `assistant_plan_run.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{hex(plan_run_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRunStorageApplicationV1`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.completed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1502, ContractName:Plans/Contracts_V0.md#CV-1502

### SP-1503 - assistant_plan.created: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1503
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.created alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. assistant_plan.created uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17646); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1503
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.created
- reader.assistant_plan.created.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_document_revision_application` | `assistant_plan_document_revision.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{revision_decimal}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanDocumentRevisionStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.created.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1503, ContractName:Plans/Contracts_V0.md#CV-1503

### SP-1504 - assistant_plan.exported: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1504
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.exported alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. assistant_plan.exported uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17646); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1504
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.exported
- reader.assistant_plan.exported.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.exported.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1504, ContractName:Plans/Contracts_V0.md#CV-1504

### SP-1505 - assistant_plan.version_created: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1505
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.version_created alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. assistant_plan.version_created uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17646); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1505
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.version_created
- reader.assistant_plan.version_created.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_document_revision_application` | `assistant_plan_document_revision.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(assistant_plan_id)}:{revision_decimal}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanDocumentRevisionStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.version_created.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1505, ContractName:Plans/Contracts_V0.md#CV-1505

### SP-1506 - assistant_plan.wizard_handoff_created: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1506
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for assistant_plan.wizard_handoff_created alone under deck-2 9.a A
  (DL-450); prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload
  store, SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value
  resolution, and SP-336/SP-347 durability-class boundaries. assistant_plan.wizard_handoff_created uses existing
  EventRecord seglog, event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing
  domain values only. It introduces no durable filtered cache, new operation-result family, second canonical state,
  journal, transcript or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families,
  whose schema/key/codec/retention are unchanged. The native original owner settles the named transition and retains
  its actual original typed result/operation identity using its existing source owner; that source/result remains
  unavailable if genuine original custody cannot resolve. No caller-supplied reconstruction is accepted. Before
  mutation verify exact writer/maintenance lease, registration and selected retention completeness, full source/input/semantic
  hash qualification, permissions, Stop, CAS and original intent. The actual owner commit/readback and durable source
  result precede event append; a committed native effect with append pending stays pending under its original result/recovery
  owner and is never rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual
  receipt custody, authenticates the full original EventRecord and first group, and publishes an event success result
  only at the adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut
  distinction; notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication.
  The source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17646); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1506
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- assistant_plan.wizard_handoff_created
- reader.assistant_plan.wizard_handoff_created.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `assistant_plan_record` | `assistant_plan_record.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/assistant_plan_cancel_custody.schema.json#/$defs/StorageAssistantPlanRecord`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `assistant_plan_record_application` | `assistant_plan_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(assistant_plan_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/AssistantPlanRecordStorageApplicationV1`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.assistant_plan.wizard_handoff_created.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1506, ContractName:Plans/Contracts_V0.md#CV-1506

### SP-1507 - external_research.budget_denied: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1507
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for external_research.budget_denied alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. external_research.budget_denied uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-OPERATIONAL-2555D@1.0.0` for its Project records, assigned by
  DL-455 (E-CARDS-3 item 3.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17659 and :17668); seven years (220,752,000 seconds) sharing the existing 2,000,000-entry
  seven-year Project allowance; Storage's Project first-save anchor adapter for that policy (DL-455, DL-457; :17675)
  lists this type among its change, failure and refusal entries (:17681), so the anchor is the entry's own first durable
  save unless an independently saved original supplies its own proved first-save time; retry, reprocessing, recovery and
  restore never restart it. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1507
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- external_research.budget_denied
- reader.external_research.budget_denied.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.external_research.budget_denied.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/External_Research.md#ERS-1507, ContractName:Plans/Contracts_V0.md#CV-1507

### SP-1508 - external_research.finding_classified: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1508
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for external_research.finding_classified alone under deck-2 9.a A
  (DL-450); prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload
  store, SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value
  resolution, and SP-336/SP-347 durability-class boundaries. external_research.finding_classified uses existing
  EventRecord seglog, event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing
  domain values only. It introduces no durable filtered cache, new operation-result family, second canonical state,
  journal, transcript or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families,
  whose schema/key/codec/retention are unchanged. The native original owner settles the named transition and retains
  its actual original typed result/operation identity using its existing source owner; that source/result remains
  unavailable if genuine original custody cannot resolve. No caller-supplied reconstruction is accepted. Before
  mutation verify exact writer/maintenance lease, registration and selected retention completeness, full source/input/semantic
  hash qualification, permissions, Stop, CAS and original intent. The actual owner commit/readback and durable source
  result precede event append; a committed native effect with append pending stays pending under its original result/recovery
  owner and is never rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual
  receipt custody, authenticates the full original EventRecord and first group, and publishes an event success result
  only at the adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut
  distinction; notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication.
  The source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project scope, assigned by
  DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17638 and :17647); no age or count expiry and no new count allowance; explicit Project or
  application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt
  and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1508
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- external_research.finding_classified
- reader.external_research.finding_classified.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.external_research.finding_classified.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/External_Research.md#ERS-1508, ContractName:Plans/Contracts_V0.md#CV-1508

### SP-1509 - external_research.job_terminal: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1509
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for external_research.job_terminal alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. external_research.job_terminal uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-OPERATIONAL-2555D@1.0.0` for its Project records, assigned by
  DL-455 (E-CARDS-3 item 3.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17659 and :17668); seven years (220,752,000 seconds) sharing the existing 2,000,000-entry
  seven-year Project allowance; Storage's Project first-save anchor adapter for that policy (DL-455, DL-457; :17675)
  lists this type among its finish and outcome entries (:17678), so the anchor is the entry's own first durable save
  unless an independently saved original supplies its own proved first-save time; retry, reprocessing, recovery and
  restore never restart it. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint
  RP-PROJECTION-3GEN@1.0.0 and append identity/result custody
  RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime or
  authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1509
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- external_research.job_terminal
- reader.external_research.job_terminal.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.external_research.job_terminal.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/External_Research.md#ERS-1509, ContractName:Plans/Contracts_V0.md#CV-1509

### SP-1510 - external_research.packet_delivered: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1510
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for external_research.packet_delivered alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. external_research.packet_delivered uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project scope, assigned by
  DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17638 and :17647); no age or count expiry and no new count allowance; explicit Project or
  application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt
  and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint
  RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1510
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- external_research.packet_delivered
- reader.external_research.packet_delivered.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.external_research.packet_delivered.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/External_Research.md#ERS-1510, ContractName:Plans/Contracts_V0.md#CV-1510

### SP-1511 - external_research.topic_started: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1511
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for external_research.topic_started alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. external_research.topic_started uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project scope, assigned by
  DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17638 and :17647); no age or count expiry and no new count allowance; explicit Project or
  application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt
  and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint
  RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1511
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- external_research.topic_started
- reader.external_research.topic_started.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.external_research.topic_started.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/External_Research.md#ERS-1511, ContractName:Plans/Contracts_V0.md#CV-1511

### SP-1512 - goal.paused: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1512
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for goal.paused alone under deck-2 9.a A (DL-450); prepared without
  admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278 generic
  EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and SP-336/SP-347
  durability-class boundaries. goal.paused uses existing EventRecord seglog, event_record_index, event_record_index_checkpoint,
  event_append_receipt_custody and existing domain values only. It introduces no durable filtered cache, new operation-result
  family, second canonical state, journal, transcript or JSON mirror. The Storage-value reuse rows below enumerate
  the existing registry families, whose schema/key/codec/retention are unchanged. The native original owner settles
  the named transition and retains its actual original typed result/operation identity using its existing source
  owner; that source/result remains unavailable if genuine original custody cannot resolve. No caller-supplied reconstruction
  is accepted. Before mutation verify exact writer/maintenance lease, registration and selected retention completeness,
  full source/input/semantic hash qualification, permissions, Stop, CAS and original intent. The actual owner commit/readback
  and durable source result precede event append; a committed native effect with append pending stays pending under
  its original result/recovery owner and is never rerun. An event is not native effect authority. SP-286 resolves
  ambiguous/lost replies by actual receipt custody, authenticates the full original EventRecord and first group,
  and publishes an event success result only at the adopted durability boundary. Ordinary groups follow segment
  sync and their documented full-flush/power-cut distinction; notebook.checkpoint_committed is barrier-class and
  requires full flush before source disposal/publication. The source's final original-result/identity check follows
  all returning helpers. No local timestamp/uint64/MessagePack/digest code is introduced. Coherent backup/restore
  preserves complete canonical sources, original operation/result, receipt group, payload dependencies, identities
  and current tombstones under the original Storage instance; derived index/checkpoint rebuild cannot mint originals
  or clear a newer Stop. Missing custody fences recovery and reports unavailable, never empty or successful replay.
  Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453
  (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17638 and :17648); no age or count expiry and no new count allowance; explicit Project or
  application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt
  and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0,
  generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- GRS-1512
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- goal.paused
- reader.goal.paused.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `goal_body_record` | `goal_record.v2:{P}:{G}`; `Plans/goal_body_custody.schema.json#/$defs/storage_body`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_control` | `goal_body_control.v1:{P}:{G}`; `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageBodyControlV2`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_mutation_receipt` | `goal_body_mutation_receipt.v1:{P}:{G}:{O}`; `Plans/goal_body_custody.schema.json#/$defs/storage_receipt`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_host_stop_control` | `goal_host_stop_control:k(storage_instance_id):k(project_id):k(thread_id):k(goal_id)`; `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageStopControl`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_record_application` | `goal_body_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/GoalBodyRecordStorageApplicationV1`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_control_application` | `goal_body_control.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/GoalBodyControlStorageApplicationV1`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.goal.paused.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-1512, ContractName:Plans/Contracts_V0.md#CV-1512

### SP-1513 - goal.resumed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1513
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for goal.resumed alone under deck-2 9.a A (DL-450); prepared without
  admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278 generic
  EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and SP-336/SP-347
  durability-class boundaries. goal.resumed uses existing EventRecord seglog, event_record_index, event_record_index_checkpoint,
  event_append_receipt_custody and existing domain values only. It introduces no durable filtered cache, new operation-result
  family, second canonical state, journal, transcript or JSON mirror. The Storage-value reuse rows below enumerate
  the existing registry families, whose schema/key/codec/retention are unchanged. The native original owner settles
  the named transition and retains its actual original typed result/operation identity using its existing source
  owner; that source/result remains unavailable if genuine original custody cannot resolve. No caller-supplied reconstruction
  is accepted. Before mutation verify exact writer/maintenance lease, registration and selected retention completeness,
  full source/input/semantic hash qualification, permissions, Stop, CAS and original intent. The actual owner commit/readback
  and durable source result precede event append; a committed native effect with append pending stays pending under
  its original result/recovery owner and is never rerun. An event is not native effect authority. SP-286 resolves
  ambiguous/lost replies by actual receipt custody, authenticates the full original EventRecord and first group,
  and publishes an event success result only at the adopted durability boundary. Ordinary groups follow segment
  sync and their documented full-flush/power-cut distinction; notebook.checkpoint_committed is barrier-class and
  requires full flush before source disposal/publication. The source's final original-result/identity check follows
  all returning helpers. No local timestamp/uint64/MessagePack/digest code is introduced. Coherent backup/restore
  preserves complete canonical sources, original operation/result, receipt group, payload dependencies, identities
  and current tombstones under the original Storage instance; derived index/checkpoint rebuild cannot mint originals
  or clear a newer Stop. Missing custody fences recovery and reports unavailable, never empty or successful replay.
  Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453
  (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17638 and :17648); no age or count expiry and no new count allowance; explicit Project or
  application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt
  and source keep their own lifetimes. Event index rows keep
  RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- GRS-1513
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- goal.resumed
- reader.goal.resumed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `goal_body_record` | `goal_record.v2:{P}:{G}`; `Plans/goal_body_custody.schema.json#/$defs/storage_body`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_control` | `goal_body_control.v1:{P}:{G}`; `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageBodyControlV2`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_mutation_receipt` | `goal_body_mutation_receipt.v1:{P}:{G}:{O}`; `Plans/goal_body_custody.schema.json#/$defs/storage_receipt`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_host_stop_control` | `goal_host_stop_control:k(storage_instance_id):k(project_id):k(thread_id):k(goal_id)`; `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageStopControl`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_record_application` | `goal_body_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/GoalBodyRecordStorageApplicationV1`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `goal_body_control_application` | `goal_body_control.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(goal_id)}`; `Plans/application_workflow_contracts.schema.json#/$defs/GoalBodyControlStorageApplicationV1`; `RP-GOAL-THREAD-LIFETIME`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.goal.resumed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-1513, ContractName:Plans/Contracts_V0.md#CV-1513

### SP-1514 - notebook.checkpoint_committed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1514
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for notebook.checkpoint_committed alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. notebook.checkpoint_committed uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17649); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0
  and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not
  extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1514
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.checkpoint_committed
- reader.notebook.checkpoint_committed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `notebook_checkpoint_record` | `notebook_checkpoint.v1:{project_id}:{checkpoint_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/notebook_checkpoint_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `working_notebook_entry_record` | `working_notebook_entry.v1:{project_id}:{notebook_id}:{entry_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/working_notebook_entry_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.notebook.checkpoint_committed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1514, ContractName:Plans/Contracts_V0.md#CV-1514

### SP-1515 - notebook.checkpoint_failed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1515
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for notebook.checkpoint_failed alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. notebook.checkpoint_failed uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-OPERATIONAL-2555D@1.0.0` for its Project records, assigned by
  DL-455 (E-CARDS-3 item 3.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608
  (Plans/storage-plan.md:17659 and :17669); seven years (220,752,000 seconds) sharing the existing 2,000,000-entry
  seven-year Project allowance; Storage's Project first-save anchor adapter for that policy (DL-455, DL-457; :17675)
  lists this type among its change, failure and refusal entries (:17681), so the anchor is the entry's own first durable
  save unless an independently saved original supplies its own proved first-save time; retry, reprocessing, recovery and
  restore never restart it. Its application records use `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (DL-455's
  separate 2,000,000-entry application allowance, count key `app:operational_security`, `anchor_kind=creation`, the
  first successful save that survives a restart, 220,752,000 seconds). Event index rows keep
  RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0.
  Those independent existing policies do not extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1515
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.checkpoint_failed
- reader.notebook.checkpoint_failed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `notebook_checkpoint_record` | `notebook_checkpoint.v1:{project_id}:{checkpoint_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/notebook_checkpoint_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `context_transition_record` | `context_transition.v1:{project_id}:{transition_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/context_transition_record`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.notebook.checkpoint_failed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1515, ContractName:Plans/Contracts_V0.md#CV-1515

### SP-1516 - notebook.entry_committed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1516
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for notebook.entry_committed alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. notebook.entry_committed uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17649); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0 and append
  identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the
  event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1516
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.entry_committed
- reader.notebook.entry_committed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `working_notebook_entry_record` | `working_notebook_entry.v1:{project_id}:{notebook_id}:{entry_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/working_notebook_entry_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.notebook.entry_committed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1516, ContractName:Plans/Contracts_V0.md#CV-1516

### SP-1517 - notebook.entry_superseded: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1517
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for notebook.entry_superseded alone under deck-2 9.a A (DL-450); prepared
  without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store, SP-278
  generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution, and
  SP-336/SP-347 durability-class boundaries. notebook.entry_superseded uses existing EventRecord seglog, event_record_index,
  event_record_index_checkpoint, event_append_receipt_custody and existing domain values only. It introduces no
  durable filtered cache, new operation-result family, second canonical state, journal, transcript or JSON mirror.
  The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application
  scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it
  on main f8b2098608 (Plans/storage-plan.md:17638 and :17649); no age or count expiry and no new count allowance;
  explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the
  native record, receipt and source keep their own lifetimes. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic
  checkpoint RP-PROJECTION-3GEN@1.0.0 and append identity/result
  custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not extend the event/body lifetime
  or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1517
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.entry_superseded
- reader.notebook.entry_superseded.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `working_notebook_entry_record` | `working_notebook_entry.v1:{project_id}:{notebook_id}:{entry_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/working_notebook_entry_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.notebook.entry_superseded.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1517, ContractName:Plans/Contracts_V0.md#CV-1517

### SP-1518 - notebook.transition_state_changed: Storage adoption and value reuse

```yaml
plan_unit_id: SP-1518
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract for notebook.transition_state_changed alone under deck-2 9.a A (DL-450);
  prepared without admission. Explicitly adopt SP-026/SP-236 SeglogFrameV2 exact wire codec, SP-337 payload store,
  SP-278 generic EventRecord index/checkpoint, SP-286/CV-339 first-AppendReceipt strict v2 and full-value resolution,
  and SP-336/SP-347 durability-class boundaries. notebook.transition_state_changed uses existing EventRecord seglog,
  event_record_index, event_record_index_checkpoint, event_append_receipt_custody and existing domain values only.
  It introduces no durable filtered cache, new operation-result family, second canonical state, journal, transcript
  or JSON mirror. The Storage-value reuse rows below enumerate the existing registry families, whose schema/key/codec/retention
  are unchanged. The native original owner settles the named transition and retains its actual original typed result/operation
  identity using its existing source owner; that source/result remains unavailable if genuine original custody cannot
  resolve. No caller-supplied reconstruction is accepted. Before mutation verify exact writer/maintenance lease,
  registration and selected retention completeness, full source/input/semantic hash qualification, permissions,
  Stop, CAS and original intent. The actual owner commit/readback and durable source result precede event append;
  a committed native effect with append pending stays pending under its original result/recovery owner and is never
  rerun. An event is not native effect authority. SP-286 resolves ambiguous/lost replies by actual receipt custody,
  authenticates the full original EventRecord and first group, and publishes an event success result only at the
  adopted durability boundary. Ordinary groups follow segment sync and their documented full-flush/power-cut distinction;
  notebook.checkpoint_committed is barrier-class and requires full flush before source disposal/publication. The
  source's final original-result/identity check follows all returning helpers. No local timestamp/uint64/MessagePack/digest
  code is introduced. Coherent backup/restore preserves complete canonical sources, original operation/result, receipt
  group, payload dependencies, identities and current tombstones under the original Storage instance; derived index/checkpoint
  rebuild cannot mint originals or clear a newer Stop. Missing custody fences recovery and reports unavailable,
  never empty or successful replay. Event retention is RP-RUNTIME-365D@1.0.0; Case L-3 Runtime/run/node/attempt
  and SP-256 context_transition_record assignment; require the actual original run lineage/completion anchor, never
  window or provider-session identity. Event index rows keep RP-EVENT-INDEX-SOURCE@1.0.0, generic checkpoint RP-PROJECTION-3GEN@1.0.0
  and append identity/result custody RP-EVENT-IDENTITY-APPROOT@1.0.0. Those independent existing policies do not
  extend the event/body lifetime or authorize a current write.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1518
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Original domain result, event append and first receipt remain distinct with exact pending/lost-reply custody.
- The passive reader validates current index coverage and original history without domain mutation.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.transition_state_changed
- reader.notebook.transition_state_changed.history.v1@1.0.0
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

| Existing value family | Role for this exact family |
|---|---|
| `event_record_index` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`; `Plans/storage_value_registry.json#/families/event_record_index/value_schema`; `RP-EVENT-INDEX-SOURCE`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_record_index_checkpoint` | `event_record_index_checkpoint.v1:{storage_instance_id}`; `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; `RP-PROJECTION-3GEN`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `event_append_receipt_custody` | `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}`; `Plans/event_append_receipt_contracts.schema.json#/$defs/custody_v2`; `RP-EVENT-IDENTITY-APPROOT`. Exact shared Storage owner adoption above; no new value family or private checkpoint. |
| `context_transition_record` | `context_transition.v1:{project_id}:{transition_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/context_transition_record`; `RP-RUNTIME-365D`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |
| `notebook_checkpoint_record` | `notebook_checkpoint.v1:{project_id}:{checkpoint_id}`; `Plans/working_notebook_contracts.schema.json#/$defs/notebook_checkpoint_record`; `RP-AUTHORITY-INDEFINITE`. Original domain source/reference under its existing schema, key, owner and lifetime; no schema widening or row append. |

**Exact consumer.** `reader.notebook.transition_state_changed.history.v1@1.0.0` uses the generic SP-278 publication, full captured global coverage and its live ten-field token. This exact family owns no stored filtered token/projection; no new Storage registry row is needed. A persisted resume token, if later introduced by another admitted contract, must use the nine-field durable token and cannot acquire permission or retention by this text. Read original wire payload plus current lawful payload availability, verify scope/subject/request/result joins and original receipt commitments on every first read, retry, replay, restore and range rebuild. A historical original is not tested against live Plan/Goal/note state, old transient leases or current writer recipe; its original admission/edition and current visibility remain independently required. Under substitution, withdrawal, source loss, unsupported edition, unproven range or tombstone, return unavailable with no durable or external effect.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1518, ContractName:Plans/Contracts_V0.md#CV-1518
