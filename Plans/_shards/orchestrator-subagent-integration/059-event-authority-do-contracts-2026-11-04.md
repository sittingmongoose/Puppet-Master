# Shard 059: Event Authority DO contracts — 2026-11-04

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L32160-L33264

Source SHA256: `63e17732b53eb739e96fbd8697cb9b89475f1b00800805c96a586c2898b5d4ee`

---

## Event Authority DO contracts — 2026-11-04

### OSI-680 — config.validation.failed

**OSI-680: `config.validation.failed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/config_validation_failed` (`pm.event_payload.config_validation_failed.v1@1.0.0`) is the closed payload. Project scope only; use the actual Orchestrator/interview Project. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Orchestrator backend config validator / reject unknown subagent` owns the occurrence. Predicate: validation -> refused before child dispatch; invalid_names must be nonempty; do not save an invalid configuration. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"config.validation.failed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.config_validation_failed.history.v1@1.0.0` serves the existing Orchestrator diagnostic inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-RUNTIME-365D@1.0.0` under DL-086, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Keep source and referenced raw output for one year after run completion under the existing run/project caps and successor rule. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `config.validation.failed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-680
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  config.validation.failed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for config.validation.failed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: [config.validation.failed, reader.orchestrator.config_validation_failed.history.v1@1.0.0, RP-RUNTIME-365D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-681 — crew.board_message_posted

**OSI-681: `crew.board_message_posted@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/crew_board_message_posted` (`pm.event_payload.crew_board_message_posted.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Body join.** AgentMessage carries content inline up to 16 KiB, otherwise its SP-337 BLAKE3/byte-size/media-type reference; this event joins the committed message_id in the original Project or SP-351 application crew_board_message record. Subjects/targets/priority equal that committed value. This is not a second board or cross-thread channel.

**Producer and ordering.** `AgentCoordinator / post board message` owns the occurrence. Predicate: message absent -> posted; from_agent_id is an admitted member of this crew; explicit targets stay in this crew; commit attributable AgentMessage before publishing. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"crew.board_message_posted",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.crew_board_message_posted.history.v1@1.0.0` serves the existing crew-board history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-COORDINATION-180D@1.0.0` under DL-085, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Board archival changes visibility only; source keeps the coordination policy and application counterpart bucket of SP-351. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `crew.board_message_posted` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-681
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  crew.board_message_posted@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for crew.board_message_posted.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-085]
preserved_exact_tokens: [crew.board_message_posted, reader.orchestrator.crew_board_message_posted.history.v1@1.0.0, RP-COORDINATION-180D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-682 — crew.board_message_read

**OSI-682: `crew.board_message_read@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/crew_board_message_read` (`pm.event_payload.crew_board_message_read.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `AgentCoordinator / acknowledge board read` owns the occurrence. Predicate: posted -> read_by includes agent_id; require retained message and current member access; repeated same receipt is idempotent. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"crew.board_message_read",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.crew_board_message_read.history.v1@1.0.0` serves the existing crew-board history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-COORDINATION-180D@1.0.0` under DL-085, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Board archival changes visibility only; source keeps the coordination policy and application counterpart bucket of SP-351. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `crew.board_message_read` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-682
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  crew.board_message_read@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for crew.board_message_read.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-085]
preserved_exact_tokens: [crew.board_message_read, reader.orchestrator.crew_board_message_read.history.v1@1.0.0, RP-COORDINATION-180D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-683 — crew.board_messages_archived

**OSI-683: `crew.board_messages_archived@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/crew_board_messages_archived` (`pm.event_payload.crew_board_messages_archived.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `AgentCoordinator / archive stale board messages` owns the occurrence. Predicate: visible -> archived only after 24 hours; unresolved blockers remain visible until resolved; exact message_ids required, no deletion on archive. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"crew.board_messages_archived",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.crew_board_messages_archived.history.v1@1.0.0` serves the existing crew-board history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-COORDINATION-180D@1.0.0` under DL-085, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Board archival changes visibility only; source keeps the coordination policy and application counterpart bucket of SP-351. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `crew.board_messages_archived` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-683
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  crew.board_messages_archived@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for crew.board_messages_archived.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-085]
preserved_exact_tokens: [crew.board_messages_archived, reader.orchestrator.crew_board_messages_archived.history.v1@1.0.0, RP-COORDINATION-180D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-684 — parser.error

**OSI-684: `parser.error@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/parser_error` (`pm.event_payload.parser_error.v1@1.0.0`) is the closed payload. Project scope only; use the actual Orchestrator/interview Project. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Raw-output reconciliation (technical owner binding).** raw_output_preview is the first 500 Unicode characters of the sanitized output (or all if shorter); raw_output_ref addresses the entire sanitized original in SP-337 custody. Both retain DL-086’s one-year lifetime. The raw output is never duplicated into a giant inline body. Original secret handling applies before either representation; preserve all permitted output, not secret bytes.

**Producer and ordering.** `Provider output parser / record parse failure` owns the occurrence. Predicate: parse attempt -> fallback pending; first log this failure, then generic extraction, then at most one same-Provider retry; recording or reading never retries. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"parser.error",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.parser_error.history.v1@1.0.0` serves the existing Orchestrator diagnostic inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-RUNTIME-365D@1.0.0` under DL-086, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Keep source and referenced raw output for one year after run completion under the existing run/project caps and successor rule. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `parser.error` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-684
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  parser.error@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for parser.error.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: [parser.error, reader.orchestrator.parser_error.history.v1@1.0.0, RP-RUNTIME-365D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-685 — phase.force_completed

**OSI-685: `phase.force_completed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/phase_force_completed` (`pm.event_payload.phase_force_completed.v1@1.0.0`) is the closed payload. Project scope only; use the actual Orchestrator/interview Project. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Interview PhaseManager / enforce soft cap` owns the occurrence. Predicate: active phase -> force completed only when configured maximum is finite and question_count > max_questions + 1 without completion signal; preserve all collected answers. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"phase.force_completed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.phase_force_completed.history.v1@1.0.0` serves the existing Orchestrator diagnostic inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-RUNTIME-365D@1.0.0` under DL-086, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Keep source and referenced raw output for one year after run completion under the existing run/project caps and successor rule. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `phase.force_completed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-685
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  phase.force_completed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for phase.force_completed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-086]
preserved_exact_tokens: [phase.force_completed, reader.orchestrator.phase_force_completed.history.v1@1.0.0, RP-RUNTIME-365D@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-686 — subagent.budget_warning

**OSI-686: `subagent.budget_warning@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_budget_warning` (`pm.event_payload.subagent_budget_warning.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child budget monitor / report threshold` owns the occurrence. Predicate: running -> running; budget_used_pct and budget_limit are observations, never budget increases. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.budget_warning",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_budget_warning.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.budget_warning` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-686
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.budget_warning@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.budget_warning.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.budget_warning, reader.orchestrator.subagent_budget_warning.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-687 — subagent.cancelled

**OSI-687: `subagent.cancelled@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_cancelled` (`pm.event_payload.subagent_cancelled.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child cancellation owner / settle cancellation` owns the occurrence. Predicate: queued|running|awaiting_parent|blocked -> cancelled; settle actual child cancellation before terminal publication. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.cancelled",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_cancelled.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.cancelled` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-687
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.cancelled@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.cancelled.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.cancelled, reader.orchestrator.subagent_cancelled.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-688 — subagent.completed

**OSI-688: `subagent.completed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_completed` (`pm.event_payload.subagent_completed.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child executor / complete child` owns the occurrence. Predicate: running -> complete; require committed result and usage references before terminal publication. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.completed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_completed.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.completed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-688
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.completed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.completed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.completed, reader.orchestrator.subagent_completed.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-689 — subagent.context_warning

**OSI-689: `subagent.context_warning@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_context_warning` (`pm.event_payload.subagent_context_warning.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child context monitor / report threshold` owns the occurrence. Predicate: running -> running; record measured context_usage_pct and threshold; warning grants no context mutation. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.context_warning",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_context_warning.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.context_warning` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-689
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.context_warning@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.context_warning.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.context_warning, reader.orchestrator.subagent_context_warning.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-690 — subagent.escalated

**OSI-690: `subagent.escalated@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_escalated` (`pm.event_payload.subagent_escalated.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child escalation owner / notify parent` owns the occurrence. Predicate: running|awaiting_parent|blocked -> same state; target is the actual parent, no widened authority. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.escalated",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_escalated.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.escalated` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-690
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.escalated@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.escalated.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.escalated, reader.orchestrator.subagent_escalated.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-691 — subagent.failed

**OSI-691: `subagent.failed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_failed` (`pm.event_payload.subagent_failed.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child executor / fail child` owns the occurrence. Predicate: running -> failed; preserve failure cause; no success publication. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.failed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_failed.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.failed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-691
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.failed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.failed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.failed, reader.orchestrator.subagent_failed.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-692 — subagent.message_received

**OSI-692: `subagent.message_received@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_message_received` (`pm.event_payload.subagent_message_received.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child response collector / record response` owns the occurrence. Predicate: running|awaiting_parent|blocked -> same state; preserve turn_index and response identity. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.message_received",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_message_received.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.message_received` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-692
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.message_received@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.message_received.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.message_received, reader.orchestrator.subagent_message_received.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-693 — subagent.message_sent

**OSI-693: `subagent.message_sent@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_message_sent` (`pm.event_payload.subagent_message_sent.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Parent follow-up dispatcher / record send` owns the occurrence. Predicate: running|awaiting_parent|blocked -> same state; preserve turn_index and message identity; no hidden peer channel. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.message_sent",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_message_sent.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.message_sent` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-693
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.message_sent@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.message_sent.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.message_sent, reader.orchestrator.subagent_message_sent.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-694 — subagent.model_switched

**OSI-694: `subagent.model_switched@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_model_switched` (`pm.event_payload.subagent_model_switched.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child runtime resolver / apply model switch` owns the occurrence. Predicate: running -> running; from_model equals prior effective model and to_model equals newly admitted effective model. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.model_switched",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_model_switched.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.model_switched` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-694
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.model_switched@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.model_switched.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.model_switched, reader.orchestrator.subagent_model_switched.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-695 — subagent.output_truncated

**OSI-695: `subagent.output_truncated@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_output_truncated` (`pm.event_payload.subagent_output_truncated.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child output collector / bound preview` owns the occurrence. Predicate: running -> running; original_length >= truncated_length; full source custody is preserved. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.output_truncated",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_output_truncated.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.output_truncated` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-695
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.output_truncated@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.output_truncated.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.output_truncated, reader.orchestrator.subagent_output_truncated.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-696 — subagent.paused

**OSI-696: `subagent.paused@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_paused` (`pm.event_payload.subagent_paused.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child pause owner / checkpoint child` owns the occurrence. Predicate: running -> awaiting_parent or blocked according to the canonical pause cause; require the actual run-owned pause checkpoint; paused is an operation description, not a new child state. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.paused",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_paused.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.paused` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-696
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.paused@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.paused.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.paused, reader.orchestrator.subagent_paused.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-697 — subagent.progress

**OSI-697: `subagent.progress@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_progress` (`pm.event_payload.subagent_progress.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child executor / report progress` owns the occurrence. Predicate: running -> running; progress is advisory and never completion evidence. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.progress",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_progress.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.progress` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-697
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.progress@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.progress.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.progress, reader.orchestrator.subagent_progress.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-698 — subagent.resumed

**OSI-698: `subagent.resumed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_resumed` (`pm.event_payload.subagent_resumed.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child resume owner / resume child` owns the occurrence. Predicate: awaiting_parent|blocked -> running; same child, fresh permission and stop-epoch validation, never reopen a terminal child. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.resumed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_resumed.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.resumed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-698
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.resumed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.resumed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.resumed, reader.orchestrator.subagent_resumed.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-699 — subagent.retried

**OSI-699: `subagent.retried@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_retried` (`pm.event_payload.subagent_retried.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child retry owner / create next attempt` owns the occurrence. Predicate: failed -> queued in the same child lineage with strictly increasing attempt_number; never resume or replace a child implicitly. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.retried",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_retried.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.retried` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-699
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.retried@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.retried.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.retried, reader.orchestrator.subagent_retried.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-700 — subagent.spawned

**OSI-700: `subagent.spawned@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_spawned` (`pm.event_payload.subagent_spawned.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child dispatcher / create child` owns the occurrence. Predicate: absent -> queued; allocate child identity once after parent permission and capacity admission. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.spawned",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_spawned.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.spawned` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-700
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.spawned@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.spawned.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.spawned, reader.orchestrator.subagent_spawned.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-701 — subagent.started

**OSI-701: `subagent.started@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_started` (`pm.event_payload.subagent_started.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child executor / start child` owns the occurrence. Predicate: queued -> running; parent and child execution admission must still be current. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.started",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_started.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.started` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-701
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.started@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.started.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.started, reader.orchestrator.subagent_started.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-702 — subagent.timeout

**OSI-702: `subagent.timeout@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_timeout` (`pm.event_payload.subagent_timeout.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child deadline owner / settle timeout` owns the occurrence. Predicate: running -> failed with timeout reason; elapsed deadline is not proof that a provider process has stopped. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.timeout",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_timeout.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.timeout` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-702
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.timeout@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.timeout.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.timeout, reader.orchestrator.subagent_timeout.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-703 — subagent.tool_called

**OSI-703: `subagent.tool_called@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_tool_called` (`pm.event_payload.subagent_tool_called.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child tool dispatcher / record invocation` owns the occurrence. Predicate: running -> running; one admitted tool invocation, preserve invocation identity. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.tool_called",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_tool_called.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.tool_called` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-703
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.tool_called@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.tool_called.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.tool_called, reader.orchestrator.subagent_tool_called.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```

### OSI-704 — subagent.tool_completed

**OSI-704: `subagent.tool_completed@1.0.0` — newly authored owner contract (DL-045), prepared without admission.** This exact family alone adopts the contract below. No current append is allowed until its own registry admission and required native gates. Current payload minima remain in Contracts; this closed definition refines them without admitting a sibling.

**Payload and scope.** `Plans/orchestrator_event_payloads.schema.json#/$defs/subagent_tool_completed` (`pm.event_payload.subagent_tool_completed.v1@1.0.0`) is the closed payload. Application or Project scope follows OSI-440/CV-366; application payloads omit project_id; Project payloads require its real identity. Envelope scope, project_id, run_id, thread_id and occurred_at_utc equal payload values; actor_ref identifies the actual producer. No invented Project/root, null partition or focus-derived scope. Parent/child/crew identities join their original admitted canonical records, not text labels. Requested/effective runtime references resolve retained immutable snapshots when different.

**Producer and ordering.** `Child tool dispatcher / record result` owns the occurrence. Predicate: running -> running; require the same prior invocation_id and actual result; success=false remains a result. Allocate operation_id once at the actual operation boundary and occurrence once per distinct observation in that operation; retries retain both. The existing operation owner commits or settles its canonical result first under its permission/stop/scope fence; this event records that fact and never authorizes another effect. Admit scope/schema/retention/permission and validate payload, durably commit referenced body bytes using SP-337, then append through Case L-5. Explicitly adopt SP-286/CV-339 first-AppendReceipt custody and `storage.first_append_receipt.resolve.v2` with its full-value successor. Retain the prepared full EventRecord and first receipt in the original operation custody; publish this history fact only after the durable receipt. On uncertain append resolve that exact full value before retry or publication; fail closed while unresolved. A body/operation already committed is not repeated to repair a missing history event.

**Identity and replay.** scope_partition is `app` or the exact EventRecord project~ encoding. Identity preimage is `JCS(["ea-do-v1",scope_partition,server_id,thread_id,run_id,"subagent.tool_completed",operation_id,occurrence])`; UTF-8 RFC8785 JCS bytes hashed with SHA-256 give `idempotency_key = "do1:" + lowercase_hex(hash)` and `event_id = "evt_do_" + lowercase_hex(hash)`. The actual canonical operation allocates operation_id with fresh entropy, never recycles it after restore; occurrence is positive and monotonically allocated within it. The first prepared event fixes timestamps, all lineage and semantic digest. Same event/key and full producer-semantic digest returns the original receipt; any changed semantic field is idempotency_conflict. Unreadable dedupe is unavailable. Replay reads history only: no child spawn, provider/tool call, message delivery, phase completion, model switch, budget change, warning notification or usage charge.

**Operating consumer and checkpoint.** `reader.orchestrator.subagent_tool_completed.history.v1@1.0.0` serves the existing child history inspector for this exact family. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`; `projector.storage.event_record_index@1.0.0` remains the sole generic projector. Reuse table checkpoints key `event_record_index_checkpoint.v1:{storage_instance_id}`, closed `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`, index `event_record_index.v2@{generation_id}` and exact source-issued row key. The generic owner alone atomically CAS-advances its frontier/index publication; this reader writes no checkpoint or derived value (`none_required` family cursor). It first validates the complete all-scope dataset, CURRENT, manifest, generation birth anchor, advancing frontier, retained inventory/gaps, synced watermarks, source/frame bytes and immutable row locators, then filters this family. Acquire the complete ten-field read_token in one actual redb snapshot, revalidate all source/access/deletion/hold fences immediately before disclosure; a changed fence discards the answer. A same-generation nonmatching append invalidates the old token. No persisted redb_snapshot_id; any durable shared token uses only SP-278/DL-076 nine fields. Rebuild is the generic owner’s governed rebuild from retained canonical source; absence is unavailable, never empty success or execution truth.

**Retention and custody.** `retention_policy_ref = RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-084, as materialized on `origin/plans/ea-storage-retention-20261104`, report `reports/event-authority-20260911/step-09-storage-retention-20261104.md`. This branch does not duplicate that assignment; integration must include it. Chat deletion releases this history and preview/body refs within 24 hours unless held; apply the Storage branch’s shared per-thread cap/linked-successor rule, including application chats. Existing index and generic checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively; this ephemeral reader owns no retained projection. Original Storage seglog/payload-store and canonical operation owners hold source/body/receipt custody; coherent backup includes those sources and first receipts, not an exported projection. Restore revalidates original scope, admission, identities and held references before publication; never regenerate missing canonical records from history. Redact secrets before append; previews are sanitized disclosures, never credentials. Dereference only under current source permissions, deletion/tombstone and hold checks. Missing/deleted content returns truthful unavailable; holds do not disclose deleted content.

**Compatibility and withdrawal.** Accept only this exact schema/version; old sketches or aliases do not self-upgrade or become lawful history. A historical read requires proof of its original admission/schema and current access. Unsupported version refuses. Withdrawal first cuts off this family’s writer admission, settles any uncertain first receipt, then fences this reader’s publication and invalidates in-memory joins. Retained events remain readable only through an explicitly supported historical contract; no cursor reset, new execution or source deletion follows. A successor needs its own closed schema, owner adoption and verified generic rebuild before publication. Withdrawal does not withdraw the shared index used by other families.

**Oracles.** ATS-360 and `Plans/orchestrator_event_contract_fixtures.json` select only `subagent.tool_completed` cases. Positive payload and negative missing-required/unknown-field/foreign-scope/schema-version cases run via `python3 scripts/pm-orchestrator-event-contracts.py`. Native NOT_RUN obligations: full-value uncertain receipt retry/conflict, producer predicate and canonical-effect ordering, restore entropy, current token/source/access fences, deletion/hold deadline, version/withdrawal races and replay without the effect named above. Static payload success never certifies those native obligations.

```yaml
plan_unit_id: OSI-704
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  subagent.tool_completed@1.0.0 consumes its exact closed payload and the independently stated owner contract immediately above; prepared without admission under DL-045.
gui_related: false
gui_classification_reason: Event identity, custody and read authority; no new visual design.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
- Exact payload, identity, producer predicate, receipt custody and source fences hold for subagent.tool_completed.
- Replay and history inspection have no runtime effect; unsupported admission or source refuses.
validation_surfaces: [python3 scripts/pm-orchestrator-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: exact_event_family
implementation_surfaces: [Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-045, Plans/Decision_Log.md#DL-084]
preserved_exact_tokens: [subagent.tool_completed, reader.orchestrator.subagent_tool_completed.history.v1@1.0.0, RP-CHAT-THREAD-LIFETIME@1.0.0]
negative_constraints: [No event admission or runtime certification follows.]
owner_hints: [Plans/orchestrator-subagent-integration.md]
```
