# Shard 083: Runtime artifact event contracts prepared without admission — 2026-11-04

Source: `Plans/Contracts_V0.md`

Source lines: L38380-L41075

Source SHA256: `4623d6a821793daf4f7eaeeecbb64981e0a86fcd21d2f483f414d14bebe1982f`

---

## Runtime artifact event contracts prepared without admission — 2026-11-04

### CV-520 — runtime_artifact.api_web_call

```yaml
plan_unit_id: CV-520
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.api_web_call@1.0.0 only: Plans/runtime_artifact_api_web_call.schema.json, schema ID pm.runtime_artifact.api_web_call.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.api_web_call; payload.schema_id=pm.runtime_artifact.api_web_call.schema.v1, payload.artifact_type=api_web_call, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-100 owns the exact producer owner.runtime_artifacts.api_web_call.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-520 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-100", "SP-520", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.api_web_call"
```


### CV-521 — runtime_artifact.artifact_version

```yaml
plan_unit_id: CV-521
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.artifact_version@1.0.0 only: Plans/runtime_artifact_artifact_version.schema.json, schema ID pm.runtime_artifact.artifact_version.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.artifact_version; payload.schema_id=pm.runtime_artifact.artifact_version.schema.v1, payload.artifact_type=artifact_version, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-101 owns the exact producer owner.runtime_artifacts.artifact_version.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-521 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-101", "SP-521", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.artifact_version"
```


### CV-522 — runtime_artifact.before_after_snapshot

```yaml
plan_unit_id: CV-522
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.before_after_snapshot@1.0.0 only: Plans/runtime_artifact_before_after_snapshot.schema.json, schema ID pm.runtime_artifact.before_after_snapshot.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.before_after_snapshot; payload.schema_id=pm.runtime_artifact.before_after_snapshot.schema.v1, payload.artifact_type=before_after_snapshot, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-102 owns the exact producer owner.runtime_artifacts.before_after_snapshot.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-522 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-102", "SP-522", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.before_after_snapshot"
```


### CV-523 — runtime_artifact.browser_recording

```yaml
plan_unit_id: CV-523
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.browser_recording@1.0.0 only: Plans/runtime_artifact_browser_recording.schema.json, schema ID pm.runtime_artifact.browser_recording.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.browser_recording; payload.schema_id=pm.runtime_artifact.browser_recording.schema.v1, payload.artifact_type=browser_recording, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-103 owns the exact producer owner.runtime_artifacts.browser_recording.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-523 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
  Current source consistency for this exact family additionally adopts RAP-103 field-by-field copied/derived source agreement on the resolved logical object. Current publication rejects any contradiction before fresh append; a pack digest or assumed source_valid flag cannot substitute for those joins. This adopted overlay leaves historical schema files and supported historical originals unchanged.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-103", "SP-523", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.browser_recording"
```


### CV-524 — runtime_artifact.code_diff

```yaml
plan_unit_id: CV-524
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.code_diff@1.0.0 only: Plans/runtime_artifact_code_diff.schema.json, schema ID pm.runtime_artifact.code_diff.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.code_diff; payload.schema_id=pm.runtime_artifact.code_diff.schema.v1, payload.artifact_type=code_diff, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-104 owns the exact producer owner.runtime_artifacts.code_diff.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-524 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-104", "SP-524", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.code_diff"
```


### CV-525 — runtime_artifact.context_snapshot

```yaml
plan_unit_id: CV-525
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.context_snapshot@1.0.0 only: Plans/runtime_artifact_context_snapshot.schema.json, schema ID pm.runtime_artifact.context_snapshot.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.context_snapshot; payload.schema_id=pm.runtime_artifact.context_snapshot.schema.v1, payload.artifact_type=context_snapshot, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-105 owns the exact producer owner.runtime_artifacts.context_snapshot.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-525 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-105", "SP-525", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.context_snapshot"
```


### CV-526 — runtime_artifact.cost_usage

```yaml
plan_unit_id: CV-526
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.cost_usage@1.0.0 only: Plans/runtime_artifact_cost_usage.schema.json, schema ID pm.runtime_artifact.cost_usage.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.cost_usage; payload.schema_id=pm.runtime_artifact.cost_usage.schema.v1, payload.artifact_type=cost_usage, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-106 owns the exact producer owner.runtime_artifacts.cost_usage.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-526 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
  Newly authored exact provider-hash representation for runtime_artifact.cost_usage under DL-045: type_payload.authority.provider_payload_hash is required-present null when the original Usage settlement source has no known digest; otherwise it is exactly 71 ASCII characters, the literal lowercase prefix "sha256:" followed by 64 lowercase hexadecimal digits encoding SHA-256 of the exact redacted provider-payload bytes sealed by that source. Preserve the original source digest and null; never guess a digest from display text, synthesize one for missing evidence, normalize whitespace/case, or hash unredacted secrets. Enforce full-match sha256:[0-9a-f]{64} plus exact length 71 at this current Project-writer and payload-resolution boundary, in addition to every existing schema rule; empty, opaque, bare-hex, other-algorithm, uppercase, nonhex, short/long and trailing-LF values refuse. The historical schema file and ID remain unchanged: this is an explicit adopted current-writer lexical guard, not a rewrite or reinterpretation of retained events. A supported historical decoder preserves values valid under their original contract and still requires authentic original provenance, current read authorization and an installed non-withdrawn reader; current live owner status is not a historical-validity test.
  Current source consistency for this exact family additionally adopts RAP-106 field-by-field copied/derived source agreement on the resolved logical object. Current publication rejects any contradiction before fresh append; a pack digest or assumed source_valid flag cannot substitute for those joins. This adopted overlay leaves historical schema files and supported historical originals unchanged.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-106", "SP-526", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.cost_usage"
```


### CV-527 — runtime_artifact.document

```yaml
plan_unit_id: CV-527
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.document@1.0.0 only: Plans/runtime_artifact_document.schema.json, schema ID pm.runtime_artifact.document.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.document; payload.schema_id=pm.runtime_artifact.document.schema.v1, payload.artifact_type=document, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-107 owns the exact producer owner.runtime_artifacts.document.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-527 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-107", "SP-527", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.document"
```


### CV-528 — runtime_artifact.evidence

```yaml
plan_unit_id: CV-528
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.evidence@1.0.0 only: Plans/runtime_artifact_evidence.schema.json, schema ID pm.runtime_artifact.evidence.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.evidence; payload.schema_id=pm.runtime_artifact.evidence.schema.v1, payload.artifact_type=evidence, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-108 owns the exact producer owner.runtime_artifacts.evidence.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-528 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-108", "SP-528", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.evidence"
```


### CV-529 — runtime_artifact.failed_attempts

```yaml
plan_unit_id: CV-529
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.failed_attempts@1.0.0 only: Plans/runtime_artifact_failed_attempts.schema.json, schema ID pm.runtime_artifact.failed_attempts.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.failed_attempts; payload.schema_id=pm.runtime_artifact.failed_attempts.schema.v1, payload.artifact_type=failed_attempts, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-109 owns the exact producer owner.runtime_artifacts.failed_attempts.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-529 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-109", "SP-529", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.failed_attempts"
```


### CV-530 — runtime_artifact.hitl_approval

```yaml
plan_unit_id: CV-530
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.hitl_approval@1.0.0 only: Plans/runtime_artifact_hitl_approval.schema.json, schema ID pm.runtime_artifact.hitl_approval.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.hitl_approval; payload.schema_id=pm.runtime_artifact.hitl_approval.schema.v1, payload.artifact_type=hitl_approval, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-110 owns the exact producer owner.runtime_artifacts.hitl_approval.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-530 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-110", "SP-530", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.hitl_approval"
```


### CV-531 — runtime_artifact.implementation_plan

```yaml
plan_unit_id: CV-531
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.implementation_plan@1.0.0 only: Plans/runtime_artifact_implementation_plan.schema.json, schema ID pm.runtime_artifact.implementation_plan.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.implementation_plan; payload.schema_id=pm.runtime_artifact.implementation_plan.schema.v1, payload.artifact_type=implementation_plan, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-111 owns the exact producer owner.runtime_artifacts.implementation_plan.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-531 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-111", "SP-531", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.implementation_plan"
```


### CV-532 — runtime_artifact.reasoning_summary

```yaml
plan_unit_id: CV-532
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.reasoning_summary@1.0.0 only: Plans/runtime_artifact_reasoning_summary.schema.json, schema ID pm.runtime_artifact.reasoning_summary.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.reasoning_summary; payload.schema_id=pm.runtime_artifact.reasoning_summary.schema.v1, payload.artifact_type=reasoning_summary, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-112 owns the exact producer owner.runtime_artifacts.reasoning_summary.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-532 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-112", "SP-532", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.reasoning_summary"
```


### CV-533 — runtime_artifact.restore_point

```yaml
plan_unit_id: CV-533
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.restore_point@1.0.0 only: Plans/runtime_artifact_restore_point.schema.json, schema ID pm.runtime_artifact.restore_point.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.restore_point; payload.schema_id=pm.runtime_artifact.restore_point.schema.v1, payload.artifact_type=restore_point, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-113 owns the exact producer owner.runtime_artifacts.restore_point.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-533 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-113", "SP-533", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.restore_point"
```



### CV-534 — runtime_artifact.screenshot

```yaml
plan_unit_id: CV-534
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.screenshot@1.0.0 only: Plans/runtime_artifact_screenshot.schema.json, schema ID pm.runtime_artifact.screenshot.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.screenshot; payload.schema_id=pm.runtime_artifact.screenshot.schema.v1, payload.artifact_type=screenshot, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-114 owns the exact producer owner.runtime_artifacts.screenshot.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-534 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-114", "SP-534", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.screenshot"
```


### CV-535 — runtime_artifact.subagent_lineage

```yaml
plan_unit_id: CV-535
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.subagent_lineage@1.0.0 only: Plans/runtime_artifact_subagent_lineage.schema.json, schema ID pm.runtime_artifact.subagent_lineage.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.subagent_lineage; payload.schema_id=pm.runtime_artifact.subagent_lineage.schema.v1, payload.artifact_type=subagent_lineage, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-115 owns the exact producer owner.runtime_artifacts.subagent_lineage.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-535 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-115", "SP-535", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.subagent_lineage"
```


### CV-536 — runtime_artifact.suggested_next_steps

```yaml
plan_unit_id: CV-536
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.suggested_next_steps@1.0.0 only: Plans/runtime_artifact_suggested_next_steps.schema.json, schema ID pm.runtime_artifact.suggested_next_steps.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.suggested_next_steps; payload.schema_id=pm.runtime_artifact.suggested_next_steps.schema.v1, payload.artifact_type=suggested_next_steps, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-116 owns the exact producer owner.runtime_artifacts.suggested_next_steps.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-536 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-116", "SP-536", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.suggested_next_steps"
```


### CV-537 — runtime_artifact.tool_llm_trace

```yaml
plan_unit_id: CV-537
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.tool_llm_trace@1.0.0 only: Plans/runtime_artifact_tool_llm_trace.schema.json, schema ID pm.runtime_artifact.tool_llm_trace.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.tool_llm_trace; payload.schema_id=pm.runtime_artifact.tool_llm_trace.schema.v1, payload.artifact_type=tool_llm_trace, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-117 owns the exact producer owner.runtime_artifacts.tool_llm_trace.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-537 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
  Newly authored exact provider-hash representation for runtime_artifact.tool_llm_trace under DL-045: type_payload.raw_payload.provider_payload_hash is required-present null when the original Tool/provider trace source has no known digest; otherwise it is exactly 71 ASCII characters, the literal lowercase prefix "sha256:" followed by 64 lowercase hexadecimal digits encoding SHA-256 of the exact redacted provider-payload bytes sealed by that source. Preserve the original source digest and null; never guess a digest from display text, synthesize one for missing evidence, normalize whitespace/case, or hash unredacted secrets. Enforce full-match sha256:[0-9a-f]{64} plus exact length 71 at this current Project-writer and payload-resolution boundary, in addition to every existing schema rule; empty, opaque, bare-hex, other-algorithm, uppercase, nonhex, short/long and trailing-LF values refuse. The historical schema file and ID remain unchanged: this is an explicit adopted current-writer lexical guard, not a rewrite or reinterpretation of retained events. A supported historical decoder preserves values valid under their original contract and still requires authentic original provenance, current read authorization and an installed non-withdrawn reader; current live owner status is not a historical-validity test.
  Current source consistency for this exact family additionally adopts RAP-117 field-by-field copied/derived source agreement on the resolved logical object. Current publication rejects any contradiction before fresh append; a pack digest or assumed source_valid flag cannot substitute for those joins. This adopted overlay leaves historical schema files and supported historical originals unchanged.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-117", "SP-537", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.tool_llm_trace"
```


### CV-538 — runtime_artifact.validation_test

```yaml
plan_unit_id: CV-538
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Payload dispatch prepared for runtime_artifact.validation_test@1.0.0 only: Plans/runtime_artifact_validation_test.schema.json, schema ID pm.runtime_artifact.validation_test.schema.v1, root object with additionalProperties=false. The current Project edition root is the exact logical payload, with no generic subtype, wrapper or open extension map. EventRecord remains pm.event.v0@2.0.0 with event_type=runtime_artifact.validation_test; payload.schema_id=pm.runtime_artifact.validation_test.schema.v1, payload.artifact_type=validation_test, payload.project_id equals the non-null project envelope identity. The closed schema's required and optional fields remain unchanged; optional metadata is not an identity fallback. App definitions under $defs (where present) remain separate explicitly selected source contracts under CV-366, not implicit Project-event alternatives.
  Envelope joins for this exact family: payload_schema_id equals the logical payload schema ID; replay_policy=dedupe_by_idempotency_key and redaction_profile=no_secrets. Explicitly adopt SP-337 store-once packs for this family. Newly authored exact dispatch binding under DL-045: encode the unchanged logical payload as RFC 8785 canonical JSON, UTF-8 without BOM/newline. At <=16,384 bytes store that object in payload and payload_ref=null. Above 16,384 bytes store payload={} and payload_ref as the exact string "pm.payload_pack.v1:blake3:<64 lowercase hex>:<canonical decimal byte size>:application/json"; byte size is the uncompressed canonical UTF-8 payload length. No base64 or inline body bypass is allowed. This string fits the existing EventRecord payload_ref type; it adds no envelope field or stored-value family. Decode the referenced exact bytes without duplicate keys, validate UTF-8/JSON and canonical encoding, verify BLAKE3 id, size and media type, then validate the resolved object against this family's unchanged closed logical schema before applying any joins or exposing metadata. The schema applies to the resolved object, never the external placeholder; all payload field joins below refer to that object. Reject nonempty placeholder, both/neither routes, noncanonical/wrong-size/wrong-digest/wrong-media/missing bytes or a wrong-family decoded schema. Pack bytes and index are durable before acknowledgement through SP-337's pack-first sync or same-group segment staging/seal protocol. Retained EventRecord references keep the full logical metadata reachable under DL-075 even when externalized; linked source bodies retain their own separate deletion/revocation policy. Current source authorization, holds and coherent backup/restore cover the pack reference and bytes; no recreation from a deleted linked body. Retries freeze the original payload route/ref/bytes as producer-semantic inputs; no repacking or re-encoding may silently change the original digest or first receipt. Envelope run_id/attempt_id/thread_id/node_id equal the corresponding payload values or required-present null for absent optional fields; occurred_at_utc equals payload.created_at_utc. actor_ref names the actual producer actor, not the viewer; observed_at_utc, persisted_at_utc and sequence_id remain Storage-owned. producer_semantic_digest uses the unchanged EventRecord producer-owned semantic-field recipe including its optional/null presence rules, never a hash of the complete envelope.
  RAP-118 owns the exact producer owner.runtime_artifacts.validation_test.publish@1.0.0, identity framing, original-source joins, privacy/deletion checks, compatibility and withdrawal. SP-538 explicitly adopts SP-278 and SP-286/CV-339 full-value v2 without inventing a physical value or giving the deferred artifact projector authority. Until a later separate exact registry admission, producer append is refused; these drafts register no family. Positive/negative schema and semantic oracles are Plans/runtime_artifact_event_drafts.fixtures.json and scripts/pm-runtime-artifact-event-drafts.py, owned by ATS-260. Native obligations remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["RAP-118", "SP-538", "ATS-260"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
preserved_exact_tokens:
  - "runtime_artifact.validation_test"
```

### CV-590 - Bundle Revision Requested Closed Event Contract

```yaml
plan_unit_id: CV-590
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '`bundle.revision_requested` has payload schema Plans/event_payloads/bundle_revision/revision_requested.schema.json,
  schema_id pm.event_payload.bundle.revision_requested.v1, schema_version 1.0.0. All listed properties are required-present;
  safe_point_id is nullable and predecessor_event_id follows ACD-571. additionalProperties is false. annotation_ids
  is an ordered, unique, nonempty list of eligible durable annotations; preserve request order through every phase.
  requested_revision_capability is the actual non-secret capability identifier, never rewritten to the effective
  enum. ts is the original UTC instant of this phase, reused verbatim on retry. source_ref is an authorized immutable
  evidence reference; it never contains body text, a URL credential or a local absolute path. project_id/thread_id/bundle_id/revision_id
  and permission_snapshot_id must resolve through their existing owners. Project scope is mandatory: EventRecord
  scope_kind=project, project_id and thread_id equal payload values, run_id/attempt_id are null; application or
  focus fallback is refused. actor_ref names the authenticated review owner for request, targeted revision runner
  otherwise. correlation_id=revision_id and causation_event_id=predecessor_event_id. payload follows the SP-337 representation below, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key.


  NEW technical identity contract under DL-045: identity bytes are UTF-8 of the compact JSON array ["bundle.revision_requested",project_id,thread_id,bundle_id,revision_id,phase_sequence]
  with ensure_ascii=false and separators comma/colon; digest=SHA-256 of those bytes. event_id="evt_bundle_revision_"+digest
  and idempotency_key="bundle.revision_requested:"+digest. Original timestamp, ordered annotations, capability fields,
  permission snapshot and source evidence are frozen at preparation. Retry uses the same full EventRecord and producer
  semantic digest; same identity with any changed semantic value is a conflict. A distinct new request gets a fresh
  revision_id with existing source-owned lineage. Interrupted revision recovery preserves revision_id and uses the
  next phase_sequence; completed revisions never reopen by replay. NEW technical phase_sequence is a nonnegative
  integer: request is zero; every later phase is exactly predecessor.phase_sequence+1. Under the existing revision
  recovery writer fence, predecessor must be the latest committed event for this exact revision, not an arbitrary
  older start. An interrupted revision may start again with the same revision_id, a new phase_sequence and the interrupted
  event as predecessor; completed never starts again. Every retry preserves the prepared sequence; unresolved source/receipt
  custody cannot allocate a replacement sequence. Same-lifecycle predecessor, annotation order, capabilities and
  snapshot joins must hold before append. ACD-571 defines this family''s phase predicate; SP-575 defines the exact
  receipt/read/withdrawal protocol. Unsupported payload versions fail closed, never coerce or alias sibling payloads.
  The schema is prepared without registry admission. Normal append refuses projector_replay_only as replay_only_not_appendable;
  compatibility history remains passive and cannot select the writer. EventRecord follows Contracts_V0.md#EventRecord
  and Plans/event_record.schema.json, without a local envelope schema. Envelope event_type and payload_schema_id
  equal this exact payload; node_id, requested_account_ref and effective_account_ref are null; all
  migration fields are null for current native writes; parent_event_id equals predecessor_event_id, producer_sequence_id
  equals phase_sequence, occurred_at_utc equals ts. Actor is the original authenticated owner frozen in SP-579 source,
  not a reader or retry actor. Storage alone assigns sequence/observed/persisted fields. Source/result/prepared-event
  equality is mandatory under SP-579.


  NEW SP-337 event-body binding for bundle.revision_requested under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.bundle-revision-requested+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-571
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains unadmitted until individual admission; no sibling inference.
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#ACD-049
- Plans/assistant-chat-design.md#ACD-050
preserved_exact_tokens:
- bundle.revision_requested
negative_constraints:
- No event admission, new UI behavior, retention choice, native execution proof or governance seal.
```

### CV-591 - Bundle Revision Started Closed Event Contract

```yaml
plan_unit_id: CV-591
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '`bundle.revision_started` has payload schema Plans/event_payloads/bundle_revision/revision_started.schema.json,
  schema_id pm.event_payload.bundle.revision_started.v1, schema_version 1.0.0. All listed properties are required-present;
  safe_point_id is nullable and predecessor_event_id follows ACD-572. additionalProperties is false. annotation_ids
  is an ordered, unique, nonempty list of eligible durable annotations; preserve request order through every phase.
  requested_revision_capability is the actual non-secret capability identifier, never rewritten to the effective
  enum. ts is the original UTC instant of this phase, reused verbatim on retry. source_ref is an authorized immutable
  evidence reference; it never contains body text, a URL credential or a local absolute path. project_id/thread_id/bundle_id/revision_id
  and permission_snapshot_id must resolve through their existing owners. Project scope is mandatory: EventRecord
  scope_kind=project, project_id and thread_id equal payload values, run_id/attempt_id are null; application or
  focus fallback is refused. actor_ref names the authenticated review owner for request, targeted revision runner
  otherwise. correlation_id=revision_id and causation_event_id=predecessor_event_id. payload follows the SP-337 representation below, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key.


  NEW technical identity contract under DL-045: identity bytes are UTF-8 of the compact JSON array ["bundle.revision_started",project_id,thread_id,bundle_id,revision_id,phase_sequence]
  with ensure_ascii=false and separators comma/colon; digest=SHA-256 of those bytes. event_id="evt_bundle_revision_"+digest
  and idempotency_key="bundle.revision_started:"+digest. Original timestamp, ordered annotations, capability fields,
  permission snapshot and source evidence are frozen at preparation. Retry uses the same full EventRecord and producer
  semantic digest; same identity with any changed semantic value is a conflict. A distinct new request gets a fresh
  revision_id with existing source-owned lineage. Interrupted revision recovery preserves revision_id and uses the
  next phase_sequence; completed revisions never reopen by replay. NEW technical phase_sequence is a nonnegative
  integer: request is zero; every later phase is exactly predecessor.phase_sequence+1. Under the existing revision
  recovery writer fence, predecessor must be the latest committed event for this exact revision, not an arbitrary
  older start. An interrupted revision may start again with the same revision_id, a new phase_sequence and the interrupted
  event as predecessor; completed never starts again. Every retry preserves the prepared sequence; unresolved source/receipt
  custody cannot allocate a replacement sequence. Same-lifecycle predecessor, annotation order, capabilities and
  snapshot joins must hold before append. ACD-572 defines this family''s phase predicate; SP-576 defines the exact
  receipt/read/withdrawal protocol. Unsupported payload versions fail closed, never coerce or alias sibling payloads.
  The schema is prepared without registry admission. Normal append refuses projector_replay_only as replay_only_not_appendable;
  compatibility history remains passive and cannot select the writer. EventRecord follows Contracts_V0.md#EventRecord
  and Plans/event_record.schema.json, without a local envelope schema. Envelope event_type and payload_schema_id
  equal this exact payload; node_id, requested_account_ref and effective_account_ref are null; all
  migration fields are null for current native writes; parent_event_id equals predecessor_event_id, producer_sequence_id
  equals phase_sequence, occurred_at_utc equals ts. Actor is the original authenticated owner frozen in SP-579 source,
  not a reader or retry actor. Storage alone assigns sequence/observed/persisted fields. Source/result/prepared-event
  equality is mandatory under SP-579.


  NEW SP-337 event-body binding for bundle.revision_started under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.bundle-revision-started+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-572
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains unadmitted until individual admission; no sibling inference.
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#ACD-049
- Plans/assistant-chat-design.md#ACD-050
preserved_exact_tokens:
- bundle.revision_started
negative_constraints:
- No event admission, new UI behavior, retention choice, native execution proof or governance seal.
```

### CV-592 - Bundle Revision Completed Closed Event Contract

```yaml
plan_unit_id: CV-592
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '`bundle.revision_completed` has payload schema Plans/event_payloads/bundle_revision/revision_completed.schema.json,
  schema_id pm.event_payload.bundle.revision_completed.v1, schema_version 1.0.0. All listed properties are required-present;
  safe_point_id is nullable and predecessor_event_id follows ACD-573. additionalProperties is false. annotation_ids
  is an ordered, unique, nonempty list of eligible durable annotations; preserve request order through every phase.
  requested_revision_capability is the actual non-secret capability identifier, never rewritten to the effective
  enum. ts is the original UTC instant of this phase, reused verbatim on retry. source_ref is an authorized immutable
  evidence reference; it never contains body text, a URL credential or a local absolute path. project_id/thread_id/bundle_id/revision_id
  and permission_snapshot_id must resolve through their existing owners. Project scope is mandatory: EventRecord
  scope_kind=project, project_id and thread_id equal payload values, run_id/attempt_id are null; application or
  focus fallback is refused. actor_ref names the authenticated review owner for request, targeted revision runner
  otherwise. correlation_id=revision_id and causation_event_id=predecessor_event_id. payload follows the SP-337 representation below, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key.


  NEW technical identity contract under DL-045: identity bytes are UTF-8 of the compact JSON array ["bundle.revision_completed",project_id,thread_id,bundle_id,revision_id,phase_sequence]
  with ensure_ascii=false and separators comma/colon; digest=SHA-256 of those bytes. event_id="evt_bundle_revision_"+digest
  and idempotency_key="bundle.revision_completed:"+digest. Original timestamp, ordered annotations, capability fields,
  permission snapshot and source evidence are frozen at preparation. Retry uses the same full EventRecord and producer
  semantic digest; same identity with any changed semantic value is a conflict. A distinct new request gets a fresh
  revision_id with existing source-owned lineage. Interrupted revision recovery preserves revision_id and uses the
  next phase_sequence; completed revisions never reopen by replay. NEW technical phase_sequence is a nonnegative
  integer: request is zero; every later phase is exactly predecessor.phase_sequence+1. Under the existing revision
  recovery writer fence, predecessor must be the latest committed event for this exact revision, not an arbitrary
  older start. An interrupted revision may start again with the same revision_id, a new phase_sequence and the interrupted
  event as predecessor; completed never starts again. Every retry preserves the prepared sequence; unresolved source/receipt
  custody cannot allocate a replacement sequence. Same-lifecycle predecessor, annotation order, capabilities and
  snapshot joins must hold before append. ACD-573 defines this family''s phase predicate; SP-577 defines the exact
  receipt/read/withdrawal protocol. Unsupported payload versions fail closed, never coerce or alias sibling payloads.
  The schema is prepared without registry admission. Normal append refuses projector_replay_only as replay_only_not_appendable;
  compatibility history remains passive and cannot select the writer. EventRecord follows Contracts_V0.md#EventRecord
  and Plans/event_record.schema.json, without a local envelope schema. Envelope event_type and payload_schema_id
  equal this exact payload; node_id, requested_account_ref and effective_account_ref are null; all
  migration fields are null for current native writes; parent_event_id equals predecessor_event_id, producer_sequence_id
  equals phase_sequence, occurred_at_utc equals ts. Actor is the original authenticated owner frozen in SP-579 source,
  not a reader or retry actor. Storage alone assigns sequence/observed/persisted fields. Source/result/prepared-event
  equality is mandatory under SP-579.


  NEW SP-337 event-body binding for bundle.revision_completed under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.bundle-revision-completed+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-573
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains unadmitted until individual admission; no sibling inference.
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#ACD-049
- Plans/assistant-chat-design.md#ACD-050
preserved_exact_tokens:
- bundle.revision_completed
negative_constraints:
- No event admission, new UI behavior, retention choice, native execution proof or governance seal.
```

### CV-593 - Bundle Revision Interrupted Closed Event Contract

```yaml
plan_unit_id: CV-593
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: '`bundle.revision_interrupted` has payload schema Plans/event_payloads/bundle_revision/revision_interrupted.schema.json,
  schema_id pm.event_payload.bundle.revision_interrupted.v1, schema_version 1.0.0. All listed properties are required-present;
  safe_point_id is nullable and predecessor_event_id follows ACD-574. additionalProperties is false. annotation_ids
  is an ordered, unique, nonempty list of eligible durable annotations; preserve request order through every phase.
  requested_revision_capability is the actual non-secret capability identifier, never rewritten to the effective
  enum. ts is the original UTC instant of this phase, reused verbatim on retry. source_ref is an authorized immutable
  evidence reference; it never contains body text, a URL credential or a local absolute path. project_id/thread_id/bundle_id/revision_id
  and permission_snapshot_id must resolve through their existing owners. Project scope is mandatory: EventRecord
  scope_kind=project, project_id and thread_id equal payload values, run_id/attempt_id are null; application or
  focus fallback is refused. actor_ref names the authenticated review owner for request, targeted revision runner
  otherwise. correlation_id=revision_id and causation_event_id=predecessor_event_id. payload follows the SP-337 representation below, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key.


  NEW technical identity contract under DL-045: identity bytes are UTF-8 of the compact JSON array ["bundle.revision_interrupted",project_id,thread_id,bundle_id,revision_id,phase_sequence]
  with ensure_ascii=false and separators comma/colon; digest=SHA-256 of those bytes. event_id="evt_bundle_revision_"+digest
  and idempotency_key="bundle.revision_interrupted:"+digest. Original timestamp, ordered annotations, capability
  fields, permission snapshot and source evidence are frozen at preparation. Retry uses the same full EventRecord
  and producer semantic digest; same identity with any changed semantic value is a conflict. A distinct new request
  gets a fresh revision_id with existing source-owned lineage. Interrupted revision recovery preserves revision_id
  and uses the next phase_sequence; completed revisions never reopen by replay. NEW technical phase_sequence is
  a nonnegative integer: request is zero; every later phase is exactly predecessor.phase_sequence+1. Under the existing
  revision recovery writer fence, predecessor must be the latest committed event for this exact revision, not an
  arbitrary older start. An interrupted revision may start again with the same revision_id, a new phase_sequence
  and the interrupted event as predecessor; completed never starts again. Every retry preserves the prepared sequence;
  unresolved source/receipt custody cannot allocate a replacement sequence. Same-lifecycle predecessor, annotation
  order, capabilities and snapshot joins must hold before append. ACD-574 defines this family''s phase predicate;
  SP-578 defines the exact receipt/read/withdrawal protocol. Unsupported payload versions fail closed, never coerce
  or alias sibling payloads. The schema is prepared without registry admission. Normal append refuses projector_replay_only
  as replay_only_not_appendable; compatibility history remains passive and cannot select the writer. EventRecord
  follows Contracts_V0.md#EventRecord and Plans/event_record.schema.json, without a local envelope schema. Envelope
  event_type and payload_schema_id equal this exact payload; node_id, requested_account_ref and effective_account_ref
  are null; all migration fields are null for current native writes; parent_event_id equals predecessor_event_id,
  producer_sequence_id equals phase_sequence, occurred_at_utc equals ts. Actor is the original authenticated owner
  frozen in SP-579 source, not a reader or retry actor. Storage alone assigns sequence/observed/persisted fields.
  Source/result/prepared-event equality is mandatory under SP-579.


  NEW SP-337 event-body binding for bundle.revision_interrupted under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.bundle-revision-interrupted+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-574
- SP-337
unblocks: []
acceptance_criteria:
- This exact family remains unadmitted until individual admission; no sibling inference.
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#ACD-049
- Plans/assistant-chat-design.md#ACD-050
preserved_exact_tokens:
- bundle.revision_interrupted
negative_constraints:
- No event admission, new UI behavior, retention choice, native execution proof or governance seal.
```


### CV-594 - Deferred Intake wizard.opened Payload And Identity

```yaml
plan_unit_id: CV-594
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'wizard.opened has the closed payload Plans/event_payloads/planning_wizard/wizard_opened.schema.json,
  schema_id pm.event_payload.wizard.opened.v1, schema_version 1.0.0; every property is required-present and additionalProperties=false.
  It adopts Contracts_V0.md#EventRecord and Plans/event_record.schema.json unchanged. Current scope_kind=project;
  envelope project_id/thread_id equal the actual source child and payload; run_id/node_id/attempt_id and requested/effective
  account refs are null because this observation is not runtime execution. actor_ref is the authenticated original
  request actor. correlation_id=request_id; causation_event_id=parent_event_id=predecessor_event_id; producer_sequence_id
  is null, occurred_at_utc=ts, payload_schema_id=decoded_payload.schema_id, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key; native migration fields are all null. Storage assigns sequence/observed/persisted
  fields. Payload representation follows the SP-337 binding below; refs never carry bodies, credentials or local paths.


  NEW identity recipe for this exact family: digest is lowercase SHA-256 of UTF-8 compact JSON ["wizard.opened",project_id,planning_run_id,thread_id,request_id]
  with ensure_ascii=false and comma/colon separators. event_id="evt_wizard_opened_"+digest and idempotency_key="wizard.opened:"+digest.
  request_id is the existing immutable command instance identity, not a new id on retry; a genuine distinct user
  open request has its own existing request identity. Freeze all source/result fields, seed version/hash, current
  child revision/hash, actor, permission snapshot, project-context hash, causality and ts at original preparation.
  Same identity and same producer semantic digest returns the original full value and first receipt; changed semantic
  digest is idempotency_conflict, missing dedupe proof is dedupe_unavailable. Normal append refuses projector_replay_only
  with replay_only_not_appendable. Passive readers cannot emit. Observe the existing successful open result for
  the real Project and actual current PlanningRun intake child, after owner route/currentness and permission validation.
  Opening is not proof of seed acceptance; a route click, attempt or failed open emits nothing. predecessor_event_id
  is null. This event never creates or selects a child on replay.


  Every payload ref must resolve to the actual original source request/result in Plans/dcw/wizard_open_evidence.schema.json;
  payload joins compare exact child, Named Plan, thread group, seed identity/version/hash, permission snapshot and
  project context; seed_kind comes from the current PWIZ-001 closed set. No stale source, retired raw payload or
  event-name alias is accepted. Unsupported versions quarantine without reader/checkpoint advance. This is prepared
  without registry admission; retention_policy_ref=PENDING_RETENTION_DECISION with Case L-3 receipt/audit/source-lineage
  versus planning/chat content candidates. The complete positive/negative matrix for this exact family is Plans/dcw_event_contract_fixtures.json,
  checked by scripts/pm_bundle_revision_events.py, with native execution NOT_RUN. Original custody and restore remain
  independently required; a successful static fixture never supplies native source authority.


  NEW SP-337 event-body binding for wizard.opened under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.wizard-opened+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-097
- CV-339
- SP-337
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.opened
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```


### CV-595 - Deferred Intake wizard.deferred_payload.loaded Payload And Identity

```yaml
plan_unit_id: CV-595
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'wizard.deferred_payload.loaded has the closed payload Plans/event_payloads/planning_wizard/wizard_deferred_payload_loaded.schema.json,
  schema_id pm.event_payload.wizard.deferred_payload.loaded.v1, schema_version 1.0.0; every property is required-present
  and additionalProperties=false. It adopts Contracts_V0.md#EventRecord and Plans/event_record.schema.json unchanged.
  Current scope_kind=project; envelope project_id/thread_id equal the actual source child and payload; run_id/node_id/attempt_id
  and requested/effective account refs are null because this observation is not runtime execution. actor_ref is
  the authenticated original request actor. correlation_id=request_id; causation_event_id=parent_event_id=predecessor_event_id;
  producer_sequence_id is null, occurred_at_utc=ts, payload_schema_id=decoded_payload.schema_id, redaction_profile=secret_refs_only,
  replay_policy=dedupe_by_idempotency_key; native migration fields are all null. Storage assigns sequence/observed/persisted
  fields. Payload representation follows the SP-337 binding below; refs never carry bodies, credentials or local paths.


  NEW identity recipe for this exact family: digest is lowercase SHA-256 of UTF-8 compact JSON ["wizard.deferred_payload.loaded",project_id,planning_run_id,thread_id,request_id]
  with ensure_ascii=false and comma/colon separators. event_id="evt_wizard_deferred_payload_loaded_"+digest and
  idempotency_key="wizard.deferred_payload.loaded:"+digest. request_id is the existing immutable command instance
  identity, not a new id on retry; a genuine distinct user open request has its own existing request identity. Freeze
  all source/result fields, seed version/hash, current child revision/hash, actor, permission snapshot, project-context
  hash, causality and ts at original preparation. Same identity and same producer semantic digest returns the original
  full value and first receipt; changed semantic digest is idempotency_conflict, missing dedupe proof is dedupe_unavailable.
  Normal append refuses projector_replay_only with replay_only_not_appendable. Passive readers cannot emit. Observe
  the existing successful acceptance/loading result of one PWIZ-001 canonical seed into the actual current PlanningRun
  intake child. The original successful open event and its exact first receipt must already resolve; predecessor_event_id
  is that wizard.opened event for the same original request, child, Project, Named Plan, seed and context. Loading
  is distinct from opening; route-open, a stale seed, unsupported raw legacy payload or failed load emits nothing.
  Receipt-backed acceptance is not a compile/approval/execution grant.


  Every payload ref must resolve to the actual original source request/result in Plans/dcw/wizard_seed_load_evidence.schema.json;
  payload joins compare exact child, Named Plan, thread group, seed identity/version/hash, permission snapshot and
  project context; seed_kind comes from the current PWIZ-001 closed set. No stale source, retired raw payload or
  event-name alias is accepted. Unsupported versions quarantine without reader/checkpoint advance. This is prepared
  without registry admission; retention_policy_ref=PENDING_RETENTION_DECISION with Case L-3 receipt/audit/source-lineage
  versus planning/chat content candidates. The complete positive/negative matrix for this exact family is Plans/dcw_event_contract_fixtures.json,
  checked by scripts/pm_bundle_revision_events.py, with native execution NOT_RUN. Original custody and restore remain
  independently required; a successful static fixture never supplies native source authority.


  NEW SP-337 event-body binding for wizard.deferred_payload.loaded under DL-045: measure the complete logical body using the exact SP-026 canonical MessagePack bytes Storage stores, never JSON character or serialized JSON size. At most 16,384 bytes (including exactly 16,384) uses that closed logical body inline and payload_ref=null. A larger body cannot append inline: payload is the empty object selected by this schema''s #/$defs/referenced_stub and payload_ref is the UTF-8 compact sorted-key JSON descriptor string {"blake3":"<64 lowercase hex>","byte_size":<encoded byte count>,"media_type":"application/vnd.puppetmaster.event.wizard-deferred-payload-loaded+msgpack"}. #/$defs/payload_reference closes the descriptor; byte_size is at least 16,385, and the BLAKE3 length is exactly 64, so a trailing LF is invalid. This string representation preserves the shared EventRecord shape. CV-1100 governs raw current tokens and each declared integer slot: -0, decimal/exponent tokens, string numbers, booleans and other wrong types refuse without coercion; 01 and -01 are invalid JSON. The family identity retains its exact compact UTF-8 JSON array, ensure_ascii=false and comma/colon separators; the descriptor retains sorted-key compact integer JSON. These local recipes keep their existing IDs, fields and tuple order. CV-317/CV-1100 governs the complete producer-semantic JCS projection and qualifies its exact binary64 and emitted decimal values before effects; it does not impose a source-schema cap. SP-026/SP-236/SP-1100 governs full physical EventRecord/source bytes and CV-339 commitments, preserving the full owner uint64 domain, finite float kind and signed zero where the selected original schema allows them. SP-278 keeps its separate binding wrapper/profile. SP-286/SP-1101 selects one authenticated original schema/resource/number recipe outside request data for retained reads and original receipt recovery; current token/type admission never narrows a lawful retained original. Current caller retry admission remains separate from verifying that original. Descriptor text must equal that canonical encoding, so alternate spelling, key order, whitespace, duplicate keys or escaped numeric text refuses. phase_sequence and byte_size use this same integer-only domain in local and composed validators. Every original-value, prepared-event, source and receipt join compares exact nested types and canonical bytes, never language numeric equality. Every boolean guard checks the exact boolean type before its value; payloads retain their closed object type. It contains metadata only, never a base64 body. payload_schema_id continues to identify this family''s complete logical body, which the reader validates against the same closed payload schema after reference resolution. Verify readable original pack bytes, exact size, BLAKE3, this exact media type, canonical encoding and all original source/identity/actor/causality joins; pack bytes and their index must be durable before the referencing append or successful publication. Missing, corrupt, substituted, wrong-size/type, unreadable or undurable content refuses without append or checkpoint advancement. Source-record overflow references are independent and cannot stand in for this event reference. Freeze this representation and descriptor at original preparation; producer-semantic comparison includes the stored payload and payload_ref, excludes Storage-assigned metadata, and preserves the original full value, commitment and first receipt on retry. Read, compatibility, rebuild and restore resolve the same bytes without rerunning the owner. A compatibility view may change replay_policy only; authenticate every other supplied field against the retained original before checking its recorded full-value commitment and receipt. Historical reads recheck current access/deletion and reader withdrawal, not current writer CAS/effect eligibility. Coherent backup and admitted restore include every reachable event pack/index, exact digest/size/media-type inventory and original source/event/receipt dependencies; missing event-payload inventory fences. No truncation, product limit, retention/deletion answer or admission is added.'
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- PWIZ-098
- CV-339
- SP-337
unblocks: []
acceptance_criteria:
- Prepared without family admission; retention remains PENDING_RETENTION_DECISION.
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- wizard.deferred_payload.loaded
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```


### CV-596 - Planning Run wizard.blocked Complete Event Contract

```yaml
plan_unit_id: CV-596
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED OWNER CONTRACT for wizard.blocked under DL-045 and DL-431; prepared without admission.
  Exact family membership remains ABSENT in Plans/event_family_registry.json: neither this unit nor its schema permits
  a current writer until individual registry admission. Semantic owner is current Plans/Planning_Wizard.md#PWIZ-002,
  extended for this exact event by this unit; payload/persistence binding is this unit plus CV-233. Jared''s only
  quoted words are "i approve all of it". The deck''s approve-all mapping selects A, as recorded in landed Plans/Decision_Log.md#DL-431.
  Answer source is /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md;
  frozen deck E-CARDS-2.as-presented-6db25be3.md SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30.
  The approved option''s explanatory prose is the card''s text, not a Jared quotation.


  Under DL-431 (deck-2 Card 4.a option A), attach Blocked to the whole Planning Run. Save it only when the component
  responsible for planning records a blockage or repair attempt that prevents every otherwise permitted next step.
  A stalled topic does not block the run if another can continue. Count completed repair attempts for that blockage;
  add no three-round trigger. You see the whole run''s blockage and report. This applies to the current Planning
  Wizard, successor of the retired Chain Wizard, not a restored wizard-status lifecycle. wizard_id is the PlanningRun
  planning_run_id; thread_id is nullable incidental context and never selects a topic as the blocked subject. Existing
  route_target owns navigation and blocked/remediation owns the episode identity: blockage_id is that exact owner
  episode, never a new runtime/node identity. CV-233''s report_ref and optional detail refs remain inspection only;
  resume_url is serialized route_target transport, not another navigation primitive.


  All properties of Plans/event_payloads/planning_wizard/wizard_blocked.schema.json are required-present, root additionalProperties=false,
  schema_id=pm.event_payload.wizard.blocked.v1 and schema_version=1.0.0. Preserve CV-233 minima wizard_id, nullable
  thread_id, round_count, report_ref, resume_url and ts. Added project_id, planning_run_id, blockage_id, observation_id,
  source_ref, permission_snapshot_id, predecessor_event_id and route_target_ref bind the actual original observation;
  route_target_ref must resolve through the existing route owner to the same Project/PlanningRun and exact resume_url.
  Reports/routes require independent current access and availability. No report body, prompt, secret, credential,
  raw local path or topic-status snapshot is copied into the event.


  Producer emitter.wizard_blocked@1.0.0 is the responsible Planning Wizard component''s observer of its original
  planning result. It explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody, SP-336/SP-347
  durability and Case L-2/SP-026/SP-236 original frame bytes. Before append require exact family/version admission,
  original observation/permission/current PlanningRun reservation, then commit the original observation and freeze
  the complete EventRecord. Append via Storage; resolve the independently issued original full event, semantic digest,
  full-value commitment, first receipt and durable group before publishing recorded success or allowing a dependent
  observation. A lost acknowledgement resolves the original, never re-executes planning, repair or the clearing
  action. Missing original/dedupe proof is unavailable; changed semantics is idempotency_conflict; unknown effect
  fences publication and goes to the existing owner''s recovery. A confirmed older restore does not replay lost
  post-backup work.


  Scope is project-only, using a real Project under PWIZ-002; application/no-project writes refuse. Adopt Plans/event_record.schema.json
  unchanged. Envelope project_id/thread_id equal payload; runtime run_id/node_id/attempt_id, account refs and producer_sequence_id
  are null. actor_ref is the authenticated original planning observation actor; occurred_at_utc=ts; correlation_id=blockage_id;
  causation_event_id=parent_event_id=predecessor_event_id; payload_schema_id identifies the decoded logical body;
  redaction_profile=secret_refs_only; current replay_policy=dedupe_by_idempotency_key; native migration fields are
  null. Storage alone assigns sequence/observed/persisted values and original receipt metadata. NEW identity recipe
  for wizard.blocked: lowercase SHA-256 of the existing UTF-8 compact JSON string-only array ["wizard.blocked",project_id,planning_run_id,blockage_id,observation_id],
  ensure_ascii=false and comma/colon separators. event_id="evt_wizard_blocked_"+digest; idempotency_key="wizard.blocked:"+digest.
  observation_id is the responsible component''s immutable observation identity reused on delivery/retry, never
  a reader-generated request. It is independent of incidental thread focus. source_ref="wizard_blocked_evidence:"+digest.
  All observed source/actor/causality/time/body/ref fields freeze at preparation.


  Retry compares exactly the producer-owned semantic fields enumerated by CV-339: event_type, scope_kind, project_id,
  thread_id, run_id, node_id, attempt_id, actor_ref, requested_account_ref, effective_account_ref, occurred_at_utc,
  producer_sequence_id, correlation_id, causation_event_id, parent_event_id, idempotency_key, payload_schema_id,
  payload, payload_ref, redaction_profile and migration. It excludes Storage-assigned sequence/observed/persisted
  and receipt metadata. Same identity and semantic digest returns the exact original full value and first receipt,
  with independent full-original authentication. Receipt-only retry reuses the authenticated original reservation
  and first receipt after live value_revision, predecessor, episode-open or effect state has advanced; it never
  reapplies those current effect/CAS gates or re-executes work. Current family admission, writer cutoff/drain, write/read
  permissions and original custody still apply. Missing original proof remains unavailable even after live advancement.
  Both current append and retry refuse projector_replay_only as replay_only_not_appendable. Historical original
  readers accept either retained dedupe_by_idempotency_key or projector_replay_only originals valid under their
  original owner recipe. A compatibility view may alter only replay_policy; all other supplied fields must authenticate
  against the actual retained original before resolving its receipt. No history read reruns planning, modifies run
  status, repairs a condition, resumes work, grants authority or emits an event.


  The planning component''s immutable observation has kind blockage_recorded or repair_attempt_completed and subject_kind=planning_run.
  Its required_conditions, cleared_conditions and complete next_steps describe the actual run at that observation,
  not the focused topic. required_conditions is nonempty; cleared conditions and every step''s preventing conditions
  refer only to that set. There must be an otherwise permitted next step, and every such step must have an unresolved
  required preventing condition. Empty next-step lists, topic-only stalls, ordinary waits while another topic can
  continue, a report edit, page open, reprocessing or three completed rounds alone are not the predicate. round_count
  equals the number of distinct actually completed original repair attempts for this blockage, joined independently
  by project/run/blockage/status; running or proposed attempts do not count. A repair observation requires an actual
  newly completed attempt. Zero, one and more than three completed attempts are supported, with no threshold or
  ceiling. predecessor_event_id is null for the original Blocked observation or the latest receipt-backed Blocked
  observation of this episode for a later observation. Preserve the authenticated episode chain and completed repair
  history. The current PlanningRun value_revision, latest predecessor and open-episode reservation are CAS inputs
  at preparation; a cleared episode cannot append another update under its old reservation. A later new blockage
  uses the planning owner''s distinct episode identity. Receipt reconciliation is not a repeat planning or repair
  action.


  NEW original custody source wizard_blocked_evidence is materialized in Plans/storage_value_registry.json under
  typed key tuple [wizard_blocked_evidence.v1,project_id,planning_run_id,blockage_id,observation_id]. Its complete
  closed logical schema is Plans/dcw/wizard_blocked_evidence.schema.json#/$defs/inline, schema_id=pm.storage_value.wizard_blocked_evidence.v1@1.0.0,
  containing storage_instance_id, recovery_epoch, value_revision, source_ref, original observation, prepared full
  event, publication and exact original receipt/commitment/segment. The authenticated planning observation is independently
  resolved; all Project/run/episode/observation/permission/actor/time joins and every original repair/action/route/ref
  fact must agree field by field. This is canonical non-rebuildable source custody in the existing runs_and_goals
  storage group, existing SP-340 budget, never a disposable status projection. Current access, permission snapshot
  and actual deletion/availability are checked at every read including every predecessor source. Backup captures
  all reachable original planning observations, attempts/actions, routes/reports, sources, full events/first custody
  and payload packs/indexes coherently at one Storage instance and admitted recovery boundary. Restore adopts the
  existing closed restore_admission and exact members plus source/event payload inventories; each member owner_id
  is this event''s exact emitter, owner_operation_id is source_ref and owner_operation_sha256 hashes the complete
  physical original source under SP-026. A claimed source/member hash never substitutes for independently admitted
  original custody; omitted sources, substituted bytes, missing pack/index, unissued receipts, skew or stale boundary
  fences mutation and successful publication. Original absence is truthful unavailable/data loss, never source reconstruction
  from the history.


  SP-337 applies independently to this event and to every source record. Measure complete SP-026 canonical MessagePack
  bytes, not JSON characters. The existing 16,384-byte inline limit includes exactly 16,384. A larger logical event
  uses payload={} and payload_ref as the existing compact sorted-key UTF-8 JSON descriptor string with blake3, byte_size
  and exact media_type application/vnd.puppetmaster.event.wizard-blocked+msgpack; schema #/$defs/payload_reference
  closes the descriptor and #/$defs/referenced_stub closes the empty body. Validate original canonical bytes, BLAKE3,
  complete size/media type and decoded closed payload plus all identity/custody joins. Complete source overflow
  independently selects its source schema #/$defs/payload_reference physical wrapper under the same typed key/CAS
  and exact application/vnd.puppetmaster.wizard-blocked-evidence+msgpack media type. Each physical redb value also
  stays within the same existing inline limit. Both packs and indexes must be durable before reference commit, append
  or publication. Body/source references are not interchangeable, truncated or inline base64 encodings. Missing/unreadable/undurable/wrong
  bytes refuse on every applicable path without checkpoint advance. No new number ceiling, serializer or date-time
  grammar is defined: CV-253 and original Storage byte/number owners apply, with CV-1100/SP-1100/SP-1101 and CV-1101.
  Under CV-1101, ts and occurred_at_utc use pm_event_datetime.date_time with the EventRecord profile; under CV-253,
  Storage observed_at_utc and persisted_at_utc use its storage_utc_z profile, and SP-1101 selects these profiles
  for a retained original. Exact typed original comparisons never use language equality
  across types or normalize physical signed zero.


  NEW passive operating consumer reader.wizard_blocked_history@1.0.0 selects only wizard.blocked at this exact supported
  payload edition and the authorized Project/PlanningRun/blockage. It explicitly adopts SP-278 and DL-076, reusing
  projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0. Physical checkpoint key
  is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  dataset event_record_index.v2 in the current selected generation. Authenticate complete captured source coverage
  across matching/nonmatching families and Projects, exact Storage identity, source bytes/row joins, generation/anchor/frontier,
  transaction and current ten-field live token. The generic projector alone publishes rows and checkpoint atomically
  under predecessor CAS. Max matching sequence is not coverage. No filtered durable checkpoint, durable token or
  copied status projection is introduced; if a token is persisted it is DL-076''s nine-field projection, never redb_snapshot_id.
  Retained originals and every original predecessor authenticate before authorized display. Rebuild is passive,
  requires admitted replacement reader and complete current source coverage, and cannot reconstruct deleted sources
  or grant access.


  Retention is explicit: event retention_policy_ref=PENDING_RETENTION_DECISION. The original wizard_blocked_evidence
  source is explicitly NEW technical class assignment to existing RP-AUTHORITY-INDEFINITE under Case L-3: it is
  non-rebuildable original planning operation/audit/source-lineage custody, refs and commitments only. Keep it indefinitely
  with no count eviction; storage pressure fails closed. This assigns no event-history or report/action-content
  lifetime. Exact question: For wizard.blocked event history, which Case L-3 class/lifetime applies: planning/chat
  content or authority/source-lineage audit, and which release anchor governs deletion? Candidate owners are Case
  L-3 planning/chat content versus immutable receipt/audit/source-lineage classes; that table does not name this
  exact event-history assignment. No TTL/count/indefinite choice is inferred from this deck. Existing original SP-286
  receipt authority retains its own RP-AUTHORITY-INDEFINITE rules; existing generic index/checkpoint retain RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN.
  Report/action/source content retains its actual owner''s independent lifetime and access/hold/deletion policy;
  a held receipt never recreates deleted content.


  Compatibility/withdrawal for wizard.blocked alone: dispatch only explicitly supported exact family/schema/version;
  unknown or incomplete legacy originals are unavailable/quarantined without rewrite or checkpoint advance. No retired
  three-round or wizard-status aliases become writers. Reader eligibility uses the authenticated recipe/edition
  in force at original write, not current writer CAS/live state; historical dispatch cannot be forged to select
  a weaker recipe. Withdrawal cuts off this writer''s new admission first, drains or fences pending work under the
  original-receipt gate, then withdraws this exact reader from dispatch. A replacement must support retained original
  editions and complete authenticated SP-278 rebuild before publication. Cutoff never deletes originals, resets
  the generic checkpoint or withdraws a sibling. Read access/deletion and reader withdrawal still apply after live
  writer state changes.


  Positive/negative static oracles for this exact family are Plans/dcw_blockage_event_fixtures.json and scripts/pm_dcw_blockage_fixtures.py,
  checked by python3 scripts/pm_dcw_blockage_events.py --family wizard.blocked. They cover producer/refusal predicates,
  counts or full clearance, envelope/source identities, original metadata/receipt, independent predecessors, SP-337
  source and event sizes, current retry versus retained history, complete mixed-source index/CAS, access, restore
  and withdrawal. New negatives preserve observational copies and have valid single-fact repair controls. Shared-tool
  predicate-isolation proof remains B3 sweep; no local proof-script rebuild or complete check-11 claim is made.
  These oracles check ts and occurred_at_utc with the CV-1101 EventRecord profile and Storage observed_at_utc and
  persisted_at_utc with storage_utc_z, including retained originals. The number-only bindings below do not change timestamp admission or retained timestamp strings. Native planning adapters, original
  authentication, append/lost-ack, CAS concurrency, actual Storage bytes/CRC, crash recovery, backup/restore, retention-boundary
  and access/deletion campaigns are authored obligations with execution NOT_RUN; static success never supplies native
  authority or admission.

  Number-only adoption: CV-1100 supplies current raw-token and schema integer-slot admission and the complete CV-317 producer projection. Preserve this family''s string-only compact identity array and every existing ID, field and tuple position. SP-026/SP-236/SP-1100 supplies physical EventRecord/source bytes and CV-339 full-value commitments without erasing finite float kind or signed zero allowed by an authenticated original schema. SP-278 remains its own uint-only binding profile. SP-286/SP-1101 authenticates the original edition and exact frozen number/resource recipe before retained read or receipt recovery; request data never chooses a weaker recipe and current caller retry admission stays separate. These bindings add no logical integer cap or history rewrite.
'
gui_related: false
gui_classification_reason: Defines event/source contracts for approved Planning Run behavior; no new presentation
  is designed.
depends_on:
- CV-233
- PWIZ-002
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Exact approved whole-run predicate and independent original custody are enforced.
- No admission or retention policy is inferred; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dcw_blockage_events.py --family wizard.blocked
- python3 scripts/pm-plan-index.py validate
risk_class: planning_run_event_custody
reasoning_tier: high
context_scope: event_authority_dcw_round10
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/dcw/wizard_blocked_evidence.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-431
- Plans/Contracts_V0.md#CV-233
- Plans/Planning_Wizard.md#PWIZ-002
preserved_exact_tokens:
- wizard.blocked
- DL-431
- CV-233
- PENDING_RETENTION_DECISION
negative_constraints:
- No registry append, Decision Log entry, native execution, governance seal or retired lifecycle revival.
```


### CV-597 - Planning Run wizard.unblocked Complete Event Contract

```yaml
plan_unit_id: CV-597
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED OWNER CONTRACT for wizard.unblocked under DL-045 and DL-432; prepared without admission.
  Exact family membership remains ABSENT in Plans/event_family_registry.json: neither this unit nor its schema permits
  a current writer until individual registry admission. Semantic owner is current Plans/Planning_Wizard.md#PWIZ-002,
  extended for this exact event by this unit; payload/persistence binding is this unit plus CV-234. Jared''s only
  quoted words are "i approve all of it". The deck''s approve-all mapping selects A, as recorded in landed Plans/Decision_Log.md#DL-432.
  Answer source is /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md;
  frozen deck E-CARDS-2.as-presented-6db25be3.md SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30.
  The approved option''s explanatory prose is the card''s text, not a Jared quotation.


  Under DL-432 (deck-2 Card 4.b option A), save Unblocked when the responsible planning component records that all
  required blocking conditions for that same run have cleared. Link the authorized action that actually cleared
  it to the original blockage. Clearing another topic, opening a page, reprocessing old history or merely editing
  a report does not count. You see clearance as soon as that work can resume. DL-431 selects the whole Planning
  Run for the card''s run/topic choice. This applies to the current Planning Wizard, successor of the retired Chain
  Wizard. wizard_id is planning_run_id, thread_id is nullable incidental context, and blockage_id is the same original
  blocked/remediation episode. Neither an intake child nor a runtime node becomes the subject. This is the clearance
  boundary itself: it does not wait for the next planning step to finish successfully.


  All properties of Plans/event_payloads/planning_wizard/wizard_unblocked.schema.json are required-present, root
  additionalProperties=false, schema_id=pm.event_payload.wizard.unblocked.v1 and schema_version=1.0.0. Preserve
  CV-234 minima wizard_id, nullable thread_id, resolution_source and ts. Added project_id, planning_run_id, blockage_id,
  observation_id, source_ref, permission_snapshot_id, predecessor_event_id and blocked_event_id bind the exact original
  episode and clearing observation. resolution_source names the authorized original clearing action; predecessor_event_id
  names the latest receipt-backed Blocked observation and blocked_event_id the root of that same authenticated chain.
  No action body, report text, secret, credentials or local path is embedded.


  Producer emitter.wizard_unblocked@1.0.0 is the responsible Planning Wizard component''s observer of its original
  planning result. It explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody, SP-336/SP-347
  durability and Case L-2/SP-026/SP-236 original frame bytes. Before append require exact family/version admission,
  original observation/permission/current PlanningRun reservation, then commit the original observation and freeze
  the complete EventRecord. Append via Storage; resolve the independently issued original full event, semantic digest,
  full-value commitment, first receipt and durable group before publishing recorded success or allowing a dependent
  observation. A lost acknowledgement resolves the original, never re-executes planning, repair or the clearing
  action. Missing original/dedupe proof is unavailable; changed semantics is idempotency_conflict; unknown effect
  fences publication and goes to the existing owner''s recovery. A confirmed older restore does not replay lost
  post-backup work.


  Scope is project-only, using a real Project under PWIZ-002; application/no-project writes refuse. Adopt Plans/event_record.schema.json
  unchanged. Envelope project_id/thread_id equal payload; runtime run_id/node_id/attempt_id, account refs and producer_sequence_id
  are null. actor_ref is the authenticated original planning observation actor; occurred_at_utc=ts; correlation_id=blockage_id;
  causation_event_id=parent_event_id=predecessor_event_id; payload_schema_id identifies the decoded logical body;
  redaction_profile=secret_refs_only; current replay_policy=dedupe_by_idempotency_key; native migration fields are
  null. Storage alone assigns sequence/observed/persisted values and original receipt metadata. NEW identity recipe
  for wizard.unblocked: lowercase SHA-256 of the existing UTF-8 compact JSON string-only array ["wizard.unblocked",project_id,planning_run_id,blockage_id,observation_id],
  ensure_ascii=false and comma/colon separators. event_id="evt_wizard_unblocked_"+digest; idempotency_key="wizard.unblocked:"+digest.
  observation_id is the responsible component''s immutable observation identity reused on delivery/retry, never
  a reader-generated request. It is independent of incidental thread focus. source_ref="wizard_unblocked_evidence:"+digest.
  All observed source/actor/causality/time/body/ref fields freeze at preparation.


  Retry compares exactly the producer-owned semantic fields enumerated by CV-339: event_type, scope_kind, project_id,
  thread_id, run_id, node_id, attempt_id, actor_ref, requested_account_ref, effective_account_ref, occurred_at_utc,
  producer_sequence_id, correlation_id, causation_event_id, parent_event_id, idempotency_key, payload_schema_id,
  payload, payload_ref, redaction_profile and migration. It excludes Storage-assigned sequence/observed/persisted
  and receipt metadata. Same identity and semantic digest returns the exact original full value and first receipt,
  with independent full-original authentication. Receipt-only retry reuses the authenticated original reservation
  and first receipt after live value_revision, predecessor, episode-open or effect state has advanced; it never
  reapplies those current effect/CAS gates or re-executes work. Current family admission, writer cutoff/drain, write/read
  permissions and original custody still apply. Missing original proof remains unavailable even after live advancement.
  Both current append and retry refuse projector_replay_only as replay_only_not_appendable. Historical original
  readers accept either retained dedupe_by_idempotency_key or projector_replay_only originals valid under their
  original owner recipe. A compatibility view may alter only replay_policy; all other supplied fields must authenticate
  against the actual retained original before resolving its receipt. No history read reruns planning, modifies run
  status, repairs a condition, resumes work, grants authority or emits an event.


  The planning component''s immutable conditions_cleared observation identifies the complete required conditions
  for this same whole-run episode, and every required condition is cleared. Authenticate the receipt-backed latest
  Blocked predecessor, its full source and entire original blockage chain, even on append, retry, read, rebuild
  and compatibility paths; blocked_event_id must be the chain''s original Blocked, never another episode or the
  latest update mislabeled as the original. Preserve completed repair history and all original required-condition
  evidence; a later owner observation may add required conditions and cannot silently drop unaccounted original
  conditions. resolution_source is the reference to the independently authenticated authorized action that actually
  cleared the final required conditions, not an invented resolution enum. The action''s original Project, PlanningRun
  and blockage match, authorized is exactly true, effect is conditions_cleared, its actual nonempty remaining_before
  set belongs to the episode, all of that set is cleared by the action and remaining_after is empty. A different
  topic/run/episode, unauthorized action, page open, history reprocessing, report-only edit, failed repair or partial
  clearance emits no Unblocked. The original action may have any already authorized owner action kind; this contract
  creates no new action or permission. A next-step success is unnecessary. Current value_revision/latest predecessor/open-episode
  CAS serializes clearance; duplicate delivery returns the same original result, and another clearing action after
  the episode has closed cannot append a second clearance. The observer records the existing result and never performs
  the clearing action itself.


  NEW original custody source wizard_unblocked_evidence is materialized in Plans/storage_value_registry.json under
  typed key tuple [wizard_unblocked_evidence.v1,project_id,planning_run_id,blockage_id,observation_id]. Its complete
  closed logical schema is Plans/dcw/wizard_unblocked_evidence.schema.json#/$defs/inline, schema_id=pm.storage_value.wizard_unblocked_evidence.v1@1.0.0,
  containing storage_instance_id, recovery_epoch, value_revision, source_ref, original observation, prepared full
  event, publication and exact original receipt/commitment/segment. The authenticated planning observation is independently
  resolved; all Project/run/episode/observation/permission/actor/time joins and every original repair/action/route/ref
  fact must agree field by field. This is canonical non-rebuildable source custody in the existing runs_and_goals
  storage group, existing SP-340 budget, never a disposable status projection. Current access, permission snapshot
  and actual deletion/availability are checked at every read including every predecessor source. Backup captures
  all reachable original planning observations, attempts/actions, routes/reports, sources, full events/first custody
  and payload packs/indexes coherently at one Storage instance and admitted recovery boundary. Restore adopts the
  existing closed restore_admission and exact members plus source/event payload inventories; each member owner_id
  is this event''s exact emitter, owner_operation_id is source_ref and owner_operation_sha256 hashes the complete
  physical original source under SP-026. A claimed source/member hash never substitutes for independently admitted
  original custody; omitted sources, substituted bytes, missing pack/index, unissued receipts, skew or stale boundary
  fences mutation and successful publication. Original absence is truthful unavailable/data loss, never source reconstruction
  from the history.


  SP-337 applies independently to this event and to every source record. Measure complete SP-026 canonical MessagePack
  bytes, not JSON characters. The existing 16,384-byte inline limit includes exactly 16,384. A larger logical event
  uses payload={} and payload_ref as the existing compact sorted-key UTF-8 JSON descriptor string with blake3, byte_size
  and exact media_type application/vnd.puppetmaster.event.wizard-unblocked+msgpack; schema #/$defs/payload_reference
  closes the descriptor and #/$defs/referenced_stub closes the empty body. Validate original canonical bytes, BLAKE3,
  complete size/media type and decoded closed payload plus all identity/custody joins. Complete source overflow
  independently selects its source schema #/$defs/payload_reference physical wrapper under the same typed key/CAS
  and exact application/vnd.puppetmaster.wizard-unblocked-evidence+msgpack media type. Each physical redb value
  also stays within the same existing inline limit. Both packs and indexes must be durable before reference commit,
  append or publication. Body/source references are not interchangeable, truncated or inline base64 encodings. Missing/unreadable/undurable/wrong
  bytes refuse on every applicable path without checkpoint advance. No new number ceiling, serializer or date-time
  grammar is defined: CV-253 and original Storage byte/number owners apply, with CV-1100/SP-1100/SP-1101 and CV-1101.
  Under CV-1101, ts and occurred_at_utc use pm_event_datetime.date_time with the EventRecord profile; under CV-253,
  Storage observed_at_utc and persisted_at_utc use its storage_utc_z profile, and SP-1101 selects these profiles
  for a retained original. Exact typed original comparisons never use language equality
  across types or normalize physical signed zero.


  NEW passive operating consumer reader.wizard_unblocked_history@1.0.0 selects only wizard.unblocked at this exact
  supported payload edition and the authorized Project/PlanningRun/blockage. It explicitly adopts SP-278 and DL-076,
  reusing projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0. Physical checkpoint
  key is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  dataset event_record_index.v2 in the current selected generation. Authenticate complete captured source coverage
  across matching/nonmatching families and Projects, exact Storage identity, source bytes/row joins, generation/anchor/frontier,
  transaction and current ten-field live token. The generic projector alone publishes rows and checkpoint atomically
  under predecessor CAS. Max matching sequence is not coverage. No filtered durable checkpoint, durable token or
  copied status projection is introduced; if a token is persisted it is DL-076''s nine-field projection, never redb_snapshot_id.
  Retained originals and every original predecessor authenticate before authorized display. Rebuild is passive,
  requires admitted replacement reader and complete current source coverage, and cannot reconstruct deleted sources
  or grant access.


  Retention is explicit: event retention_policy_ref=PENDING_RETENTION_DECISION. The original wizard_unblocked_evidence
  source is explicitly NEW technical class assignment to existing RP-AUTHORITY-INDEFINITE under Case L-3: it is
  non-rebuildable original planning operation/audit/source-lineage custody, refs and commitments only. Keep it indefinitely
  with no count eviction; storage pressure fails closed. This assigns no event-history or report/action-content
  lifetime. Exact question: For wizard.unblocked event history, which Case L-3 class/lifetime applies: planning/chat
  content or authority/source-lineage audit, and which release anchor governs deletion? Candidate owners are Case
  L-3 planning/chat content versus immutable receipt/audit/source-lineage classes; that table does not name this
  exact event-history assignment. No TTL/count/indefinite choice is inferred from this deck. Existing original SP-286
  receipt authority retains its own RP-AUTHORITY-INDEFINITE rules; existing generic index/checkpoint retain RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN.
  Report/action/source content retains its actual owner''s independent lifetime and access/hold/deletion policy;
  a held receipt never recreates deleted content.


  Compatibility/withdrawal for wizard.unblocked alone: dispatch only explicitly supported exact family/schema/version;
  unknown or incomplete legacy originals are unavailable/quarantined without rewrite or checkpoint advance. No retired
  three-round or wizard-status aliases become writers. Reader eligibility uses the authenticated recipe/edition
  in force at original write, not current writer CAS/live state; historical dispatch cannot be forged to select
  a weaker recipe. Withdrawal cuts off this writer''s new admission first, drains or fences pending work under the
  original-receipt gate, then withdraws this exact reader from dispatch. A replacement must support retained original
  editions and complete authenticated SP-278 rebuild before publication. Cutoff never deletes originals, resets
  the generic checkpoint or withdraws a sibling. Read access/deletion and reader withdrawal still apply after live
  writer state changes.


  Positive/negative static oracles for this exact family are Plans/dcw_blockage_event_fixtures.json and scripts/pm_dcw_blockage_fixtures.py,
  checked by python3 scripts/pm_dcw_blockage_events.py --family wizard.unblocked. They cover producer/refusal predicates,
  counts or full clearance, envelope/source identities, original metadata/receipt, independent predecessors, SP-337
  source and event sizes, current retry versus retained history, complete mixed-source index/CAS, access, restore
  and withdrawal. New negatives preserve observational copies and have valid single-fact repair controls. Shared-tool
  predicate-isolation proof remains B3 sweep; no local proof-script rebuild or complete check-11 claim is made.
  These oracles check ts and occurred_at_utc with the CV-1101 EventRecord profile and Storage observed_at_utc and
  persisted_at_utc with storage_utc_z, including retained originals. The number-only bindings below do not change timestamp admission or retained timestamp strings. Native planning adapters, original
  authentication, append/lost-ack, CAS concurrency, actual Storage bytes/CRC, crash recovery, backup/restore, retention-boundary
  and access/deletion campaigns are authored obligations with execution NOT_RUN; static success never supplies native
  authority or admission.

  Number-only adoption: CV-1100 supplies current raw-token and schema integer-slot admission and the complete CV-317 producer projection. Preserve this family''s string-only compact identity array and every existing ID, field and tuple position. SP-026/SP-236/SP-1100 supplies physical EventRecord/source bytes and CV-339 full-value commitments without erasing finite float kind or signed zero allowed by an authenticated original schema. SP-278 remains its own uint-only binding profile. SP-286/SP-1101 authenticates the original edition and exact frozen number/resource recipe before retained read or receipt recovery; request data never chooses a weaker recipe and current caller retry admission stays separate. These bindings add no logical integer cap or history rewrite.
'
gui_related: false
gui_classification_reason: Defines event/source contracts for approved Planning Run behavior; no new presentation
  is designed.
depends_on:
- CV-234
- PWIZ-002
- CV-339
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Exact approved whole-run predicate and independent original custody are enforced.
- No admission or retention policy is inferred; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_dcw_blockage_events.py --family wizard.unblocked
- python3 scripts/pm-plan-index.py validate
risk_class: planning_run_event_custody
reasoning_tier: high
context_scope: event_authority_dcw_round10
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/dcw/wizard_unblocked_evidence.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-432
- Plans/Contracts_V0.md#CV-234
- Plans/Planning_Wizard.md#PWIZ-002
preserved_exact_tokens:
- wizard.unblocked
- DL-432
- CV-234
- PENDING_RETENTION_DECISION
negative_constraints:
- No registry append, Decision Log entry, native execution, governance seal or retired lifecycle revival.
```

### CV-550 - filesafe.command_denied closed contract

```yaml
plan_unit_id: CV-550
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.command_denied owns the prepared closed 2.0.0 payload and
  exact original-source, producer, scope and transition joins. The checked whole normalized
  segment is denied before spawn. Preserve segment index and actual denial code; denial
  never grants an override or runs the command.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.command_denied` only.** Current governing behavior: FileSafe F2-041, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_command_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `BaseRunner command-string guard before spawn` is the sole semantic producer. The checked whole normalized segment is denied before spawn. Preserve segment index and actual denial code; denial never grants an override or runs the command. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-550` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.command_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.command_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.command_denied` only: `Plans/filesafe_event_sources/filesafe_command_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `BaseRunner::check_command -> BashGuard::check_command -> log_blocked_command`. The two private original-source interfaces are `owner.filesafe.filesafe_command_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_command_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_command_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.command_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type`, `normalized_command_identity`, `segment_index`, `permission_snapshot_id`, `filesafe_scope_ref` join the result where applicable. Exact required body roles are `guard_input`, `guard_decision`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.command_denied`.**

| From | To | Required barrier |
|---|---|---|
| checked_segment | denied_no_spawn | Denial is sealed before returning the blocked-command result; spawn remains forbidden, including audit failure. |
| denied_no_spawn | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-550, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.command_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.command_denied` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-551 - filesafe.destructive_override_denied closed contract

```yaml
plan_unit_id: CV-551
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_denied owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. A rejected
  request emits denial and leaves the original guarded command blocked. Missing authentication
  may omit operator/auth realm; absence never becomes anonymous permission.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_denied` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe authenticated destructive-override evaluator` is the sole semantic producer. A rejected request emits denial and leaves the original guarded command blocked. Missing authentication may omit operator/auth realm; absence never becomes anonymous permission. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-551` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_denied` only: `Plans/filesafe_event_sources/filesafe_destructive_override_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::evaluate_destructive_override -> deny_override`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type` join the result where applicable. Exact required body roles are `override_request`, `override_denial`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_denied`.**

| From | To | Required barrier |
|---|---|---|
| request_received | denied_no_grant | Refusal seals the exact request and denial; the original command remains blocked and no receipt can become a grant. |
| denied_no_grant | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

The original override request supplies maximum_expires_at computed by its owner from the accepted duration; no new duration policy is selected. authorized_scope, when present, must be within requested_scope, match normalized command identity and exact root/Host/thread/run/project, and issued_at < expires_at <= maximum_expires_at. A missing request, stale root or expired receipt never grants permission.

ContractRef: ContractName:Plans/storage-plan.md#SP-551, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.destructive_override_denied` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-552 - filesafe.destructive_override_granted closed contract

```yaml
plan_unit_id: CV-552
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_granted owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. Only an
  authenticated operator, exact authorized scope, reason and future expiry can yield
  a grant. The event is audit of the original receipt, never execution authority by
  itself. Expired, mismatched or changed-root grants cannot authorize a command.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_granted` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_granted_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe authenticated destructive-override evaluator` is the sole semantic producer. Only an authenticated operator, exact authorized scope, reason and future expiry can yield a grant. The event is audit of the original receipt, never execution authority by itself. Expired, mismatched or changed-root grants cannot authorize a command. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-552` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_granted` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_granted` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_granted` only: `Plans/filesafe_event_sources/filesafe_destructive_override_granted.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::evaluate_destructive_override -> issue_override_receipt`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_granted.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_granted.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_granted.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_granted` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type`, `auth_realm`, `operator_identity_ref`, `reason` join the result where applicable. Exact required body roles are `override_request`, `override_receipt`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_granted`.**

| From | To | Required barrier |
|---|---|---|
| request_authenticated | grant_receipt_committed | Authentication, reason, exact requested scope, current roots and unexpired duration are checked before committing the grant receipt. Audit completion precedes making it usable; later execution independently revalidates it. |
| grant_receipt_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

The original override request supplies maximum_expires_at computed by its owner from the accepted duration; no new duration policy is selected. authorized_scope, when present, must be within requested_scope, match normalized command identity and exact root/Host/thread/run/project, and issued_at < expires_at <= maximum_expires_at. A missing request, stale root or expired receipt never grants permission.

ContractRef: ContractName:Plans/storage-plan.md#SP-552, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_granted` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.destructive_override_granted` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-553 - filesafe.destructive_override_requested closed contract

```yaml
plan_unit_id: CV-553
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.destructive_override_requested owns the prepared closed 2.0.0
  payload and exact original-source, producer, scope and transition joins. Record
  the authenticated request before evaluation. PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 alone
  is never a grant; requested scope and duration cannot broaden the accepted scope.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_requested` only.** Current governing behavior: FileSafe F2-052, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_destructive_override_requested_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe destructive-override request intake` is the sole semantic producer. Record the authenticated request before evaluation. PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 alone is never a grant; requested scope and duration cannot broaden the accepted scope. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-553` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Exact override scope selection.** The new prepared override scope is a closed Project/application union, following current F2-213. Project retains real project_id with optional (required-present null when unrestricted) run_id, worktree_id and normalized_command_identity; a null restriction is not a missing Project and does not erase actual execution_context. A narrower authorized restriction may be selected only within the original requested restriction and actual context. Application requires scope_kind=application, project_id=null and real server_id/computer_id/thread_id/run_id/host_id/environment_id plus nonempty recorded_roots, each with root_id/root_generation/canonical_path; command restriction is explicit string or null. Every authorized root must be an exact member of the original admitted root set and the execution root must join by identity/generation. No Project source is recast, and a source grant is never transplanted by conversion. This corrects the unadmitted first-pass flat scope, which omitted application Server/Environment/roots and overconstrained Project grants.

**Current-writer eligibility for `filesafe.destructive_override_requested` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.destructive_override_requested` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.destructive_override_requested` only: `Plans/filesafe_event_sources/filesafe_destructive_override_requested.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::request_destructive_override -> record_override_request`. The two private original-source interfaces are `owner.filesafe.filesafe_destructive_override_requested.original_source.project@1.0.0` and `owner.filesafe.filesafe_destructive_override_requested.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_destructive_override_requested.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.destructive_override_requested` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `request_id`, `guard_type`, `normalized_command_identity`, `requested_scope`, `requested_duration`, `reason`, `auth_realm`, `operator_identity_ref` join the result where applicable. Exact required body roles are `override_request`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.destructive_override_requested`.**

| From | To | Required barrier |
|---|---|---|
| request_received | request_recorded | The original request is recorded before evaluation; neither the request event nor PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 authorizes execution. |
| request_recorded | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-553, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.destructive_override_requested` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.destructive_override_requested` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-554 - filesafe.guard_init_failed closed contract

```yaml
plan_unit_id: CV-554
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.guard_init_failed owns the prepared closed 2.0.0 payload
  and exact original-source, producer, scope and transition joins. On initialization
  failure block the affected capability; no disabled fallback. Embedded known-destructive
  baseline does not make a failed authoritative guard healthy.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.guard_init_failed` only.** Current governing behavior: FileSafe F2-024, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_guard_init_failed_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe guard initialization path` is the sole semantic producer. On initialization failure block the affected capability; no disabled fallback. Embedded known-destructive baseline does not make a failed authoritative guard healthy. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-554` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.guard_init_failed` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.guard_init_failed` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.guard_init_failed` only: `Plans/filesafe_event_sources/filesafe_guard_init_failed.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::initialize_guard -> record_guard_init_failure`. The two private original-source interfaces are `owner.filesafe.filesafe_guard_init_failed.original_source.project@1.0.0` and `owner.filesafe.filesafe_guard_init_failed.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_guard_init_failed.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.guard_init_failed` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type` join the result where applicable. Exact required body roles are `guard_configuration`, `initialization_failure`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.guard_init_failed`.**

| From | To | Required barrier |
|---|---|---|
| guard_initializing | capability_blocked | A failed authoritative guard blocks the affected capability before any return; embedded baseline availability never changes this failure to success. |
| capability_blocked | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-554, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.guard_init_failed` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.guard_init_failed` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-555 - filesafe.path_denied closed contract

```yaml
plan_unit_id: CV-555
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.path_denied owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Canonicalize existing path
  or nearest existing parent, verify actual root and recheck TOCTOU before effect.
  Refusal leaves the file untouched and preserves the denial code and permission/scope
  refs.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.path_denied` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_path_denied_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe path guard before file effect` is the sole semantic producer. Canonicalize existing path or nearest existing parent, verify actual root and recheck TOCTOU before effect. Refusal leaves the file untouched and preserves the denial code and permission/scope refs. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-555` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.path_denied` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.path_denied` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.path_denied` only: `Plans/filesafe_event_sources/filesafe_path_denied.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::check_path -> FileGuard::check_operation -> record_path_denial`. The two private original-source interfaces are `owner.filesafe.filesafe_path_denied.original_source.project@1.0.0` and `owner.filesafe.filesafe_path_denied.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_path_denied.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.path_denied` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `guard_type`, `normalized_path`, `canonical_parent`, `path_kind`, `operation`, `permission_snapshot_id`, `filesafe_scope_ref` join the result where applicable. Exact required body roles are `path_request`, `path_denial`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.path_denied`.**

| From | To | Required barrier |
|---|---|---|
| path_resolved | denied_no_file_effect | Resolve the recorded Host/root and canonical parent, including symlink/reparse and create checks; refusal leaves the target unchanged. |
| denied_no_file_effect | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-555, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.path_denied` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.path_denied` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-556 - filesafe.policy_degraded closed contract

```yaml
plan_unit_id: CV-556
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: filesafe.policy_degraded owns the prepared closed 2.0.0 payload and
  exact original-source, producer, scope and transition joins. Valid only while authoritative
  enforcement is intact; an advisory failure or embedded authoritative fallback can
  be reported. Missing or empty allowlists, roots, unresolved canonical paths or failed
  init require refusal, never a degraded success.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.policy_degraded` only.** Current governing behavior: FileSafe CV-245, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/filesafe_policy_degraded_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe policy loader advisory/fallback diagnostic path` is the sole semantic producer. Valid only while authoritative enforcement is intact; an advisory failure or embedded authoritative fallback can be reported. Missing or empty allowlists, roots, unresolved canonical paths or failed init require refusal, never a degraded success. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-556` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `filesafe.policy_degraded` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `filesafe.policy_degraded` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `filesafe.policy_degraded` only: `Plans/filesafe_event_sources/filesafe_policy_degraded.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::load_policy -> record_policy_degradation`. The two private original-source interfaces are `owner.filesafe.filesafe_policy_degraded.original_source.project@1.0.0` and `owner.filesafe.filesafe_policy_degraded.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/filesafe_policy_degraded.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `filesafe.policy_degraded` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `degraded_component`, `fallback_source` join the result where applicable. Exact required body roles are `policy_load`, `enforcement_evidence`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

**Lifecycle barriers for `filesafe.policy_degraded`.**

| From | To | Required barrier |
|---|---|---|
| policy_loading | degraded_enforcing | Only an advisory failure or known-destructive embedded fallback with authoritative enforcement intact may enter degraded_enforcing. Missing roots, empty authoritative scope or failed init refuses. |
| degraded_enforcing | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

ContractRef: ContractName:Plans/storage-plan.md#SP-556, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `filesafe.policy_degraded` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `filesafe.policy_degraded` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-557 - safe_point.created closed contract

```yaml
plan_unit_id: CV-557
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: safe_point.created owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Publish only after immutable
  manifest and blobs verify and the safe_point_record is durably committed. The capture
  precedes mutation; worktree-bound writes carry all four worktree fields. Failed
  or unsupported capture never permits mutation.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.created` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/safe_point_created_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe pre-mutation safe-point writer` is the sole semantic producer. Publish only after immutable manifest and blobs verify and the safe_point_record is durably committed. The capture precedes mutation; worktree-bound writes carry all four worktree fields. Failed or unsupported capture never permits mutation. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-557` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `safe_point.created` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `safe_point.created` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Original snapshot version identity.** snapshot_format_version and content_scope_version retain their original nonempty string types from the complete Project safe_point_record source. Integer coercion is forbidden; this corrects the unadmitted first-pass payload draft, without changing any original native source.

**Exact original source graph (second pass).** Newly authored under DL-045 for `safe_point.created` only: `Plans/filesafe_event_sources/safe_point_created.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::capture_pre_write_safe_point -> commit_safe_point_record`. The two private original-source interfaces are `owner.filesafe.safe_point_created.original_source.project@1.0.0` and `owner.filesafe.safe_point_created.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/safe_point_created.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `safe_point.created` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `safe_point_id`, `run_id`, `node_id`, `attempt_id`, `baseline_ref`, `replan_generation`, `creation_reason`, `snapshot_format_version`, `content_scope_version` join the result where applicable. Exact required body roles are `capture_request`, `snapshot_manifest`, `snapshot_blobs`, `safe_point_record`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

For Project `safe_point.created`, the source view also imports native_project_record through the exact original Project schema bytes selected in its resource manifest. Its original body role is validated in full and joins the explicit original_project_joins table in that family's graph. This additional view preserves original native hash/codec domains. It never fills project_id=null or invents node/attempt IDs for application; the separate application source root rejects native_project_record.

**Complete application originals for `safe_point.created` (review round 1).** Newly authored owner contract under DL-045 after the own-family current-canon search: `Plans/filesafe_event_sources/safe_point_created.schema.json#/$defs/application_records` is a required complete method-output composition, not an event-shaped witness. Its closed application safe_point_record, snapshot_manifest and snapshot_blob_inventory have distinct `.application.v1` / `1.0.0` identities. The safe-point record retains complete capture identity, version, counts/lengths, canonical manifest ref/hash, actor/time, eligibility and holds. Every manifest entry carries immutable absolute path, root/generation, Host/Environment and permission-snapshot identity, presence/type/tracked/ignored/write-set disposition, content ref/hash/length and supported SCM/symlink/executable/POSIX/Windows metadata. Optional SCM is a complete repo/worktree/branch/HEAD/index-stage composition; null means no fabricated repository. Manifest paths are canonical ordered and unique, counts/lengths are exact, ignored entries require authorized write-set membership, and blobs exactly cover every addressed file. For every resolved file blob, recompute `blake3:` plus BLAKE3 of the exact decoded bytes and require equality with both the inventory payload_id and each manifest payload_id, in addition to independent SHA-256 and exact lengths. A forged address, swapped bytes or truncated bytes refuses even if every manifest, SHA-256, count, source commitment and receipt has been coherently repaired. Apply this same verification whenever write, retry, read, rebuild, backup/restore or restore execution resolves original blob bytes; no path may treat an advertised address as proof. Event-only reads/retries/rebuilds do not resolve snapshot bodies or recreate disposed originals. Body-dependent historical reads verify the original composition under its retained commitment recipe and access/availability fences, without current-writer admission or live-epoch checks. FileSafe 11.1.2b remains the complete scope/exclusion/equality owner.

Manifest bodies use FileSafe canonical RFC8785 JSON and SHA-256; application request/record/inventory/journal/equality bodies use CV-366 deterministic physical MessagePack. The original request-byte preimage omits only original_input_ref/original_input_sha256, which select those bytes, avoiding a self-hash cycle. The source output supplies complete typed originals and exact body ref/hash/codec/root joins; decode every selected body, validate its closed root and canonical encoding, and require equality with that original output. A role/ref/hash triple, separately supplied metadata dictionary or self-consistent source hash cannot substitute. Each record joins the actual scope, Server and execution context. Original Project schemas, records and physical bytes are unchanged.

The application capture result joins its original capture operation, actor/time, complete safe-point record and decoded manifest hash/content digest/counts/versions; its optional four worktree fields join the actual complete SCM object. The record and manifest/blob composition commit before preparation/append and any dependent mutation. The own graph selects all exact body roots and codecs for this family.

**Lifecycle barriers for `safe_point.created`.**

| From | To | Required barrier |
|---|---|---|
| capture_admitted | capture_committed | Verify immutable manifest and every addressed blob, then commit safe_point_record before append and before mutation. Worktree metadata comes from that manifest. Incomplete capture fences the mutation. |
| capture_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

Worktree-bound creation joins worktree_id/worktree_path/branch_name/HEAD_sha to the original captured manifest as one group; a partial group refuses. All immutable snapshot members must verify; a hash alone never proves capture.

ContractRef: ContractName:Plans/storage-plan.md#SP-557, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045




**Selected-original custody for `safe_point.created` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `safe_point.created` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-558 - safe_point.restored closed contract

```yaml
plan_unit_id: CV-558
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: safe_point.restored owns the prepared closed 2.0.0 payload and exact
  original-source, producer, scope and transition joins. Publish only the journal-proven
  outcome. restored_clean requires target equality, restore_failed pre-restore equality,
  restore_skipped preflight equality without mutation, restore_refused no mutation,
  recovery_required keeps fences. restored_with_conflicts is forbidden. Restart reconciles
  the same transaction before dispatch.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- DL-045
- F2-213
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.restored` only.** Current governing behavior: FileSafe F2-213, F2-213; Contracts safe-point and fail-closed security payloads. Schema `Plans/event_payloads/safe_point_restored_v2.schema.json#`, version 2.0.0, is closed and selects this family only. Current Project minima are retained without nullable widening; this new edition carries explicit application roots required by F2-213/CV-366. It is prepared without admission; no current native writer is enabled.

**Producer and transition.** `FileSafe exact-replace restore coordinator` is the sole semantic producer. Publish only the journal-proven outcome. restored_clean requires target equality, restore_failed pre-restore equality, restore_skipped preflight equality without mutation, restore_refused no mutation, recovery_required keeps fences. restored_with_conflicts is forbidden. Restart reconciles the same transaction before dispatch. Preserve the original operation_id allocated at accepted intake, source receipt/journal and timestamp through restart; no observer, log parser, Client click or EventRecord reader can manufacture accepted source. The native binding remains specified_unimplemented until authentic original owner evidence is available. `SP-558` supplies the ordered first-receipt barrier, identity, custody and history reader.

**Scope and joins.** application_or_project using the exact CV-365 WorkflowScopeV2 at scope, plus execution_context for actual Computer/Host/Environment and known thread/run/root identity/generation/canonical absolute working_directory. In a pre-context denial or startup diagnostic, inapplicable thread/run/root/cwd are explicit null and no effect is authorized; application mutation/grant paths require their genuine non-null admitted roots and execution context. Application project_id is null; Project requires its real project_id. Payload project_id equals scope.project_id and run_id equals execution_context.run_id, where present; envelope scope_kind/project_id equal scope.scope_kind/project_id (the closed EventRecord has no scope object), envelope thread_id/run_id equal execution_context.thread_id/run_id, occurred_at_utc equals ts, payload_schema_id equals the schema's $id, and inline payload validates this exact root. Project safe points require non-null node_id/attempt_id; application safe points carry null for inapplicable Orchestrator ids, never invented nodes. Worktree-bound creation requires worktree_id/worktree_path/branch_name/HEAD_sha together and joins all four to the actual captured manifest. requested_scope/authorized_scope uses the F2-213 discriminated union: Project preserves optional run/worktree/command restrictions, while application joins real Server/Computer/thread/run/Host/Environment and exact recorded roots/paths to the original request; a grant's scope must be a subset of the request and expiry must be after issue and no later than the accepted duration. Permissions and FileSafe still revalidate before any effect.

**Current-writer eligibility for `safe_point.restored` (review round 2).** Explicitly adopt the EventRecord envelope rule: `projector_replay_only` is compatibility-reader-only and MUST return `replay_only_not_appendable` before original-operation acceptance, append or retry/dedupe acknowledgement. Check eligibility independently of the caller-supplied semantic digest; preserve Storage-assigned metadata exclusion and the independent retained-issued full-value lookup after original domain controls are disposed. An identical semantic body cannot make a replay-only candidate appendable.

**SP-337 payload boundary for `safe_point.restored` (review round 3).** Newly authored technical binding under DL-045, adopting the existing 16 KiB rule without changing the closed semantic root or EventRecord envelope. Measure the complete canonical UTF-8 JSON semantic body, including object/array framing, member names and multibyte strings; 16,384 bytes is accepted inline and 16,385 is refused as `inline_payload_too_large` before original-operation acceptance or append. The byte budget is not a character-count schema constraint. The own payload schema describes the complete semantic body; the inline checker enforces its total byte size. A larger body uses SP-337's content-addressed payload store: the stored EventRecord has `payload={}`, the same payload_schema_id, and the existing string payload_ref carries the canonical JSON encoding of the closed descriptor {payload_id, byte_size, media_type}. payload_id is `blake3:` plus 64 lowercase hex digits, byte_size is the exact positive byte length, and media_type is `application/json`. This is the own source schema's payload_reference root; it adds no envelope field, storage family or public API. Independently resolve exact canonical body bytes by that BLAKE3 address and verify digest, byte length, media type, complete semantic schema and original-source joins before acceptance. Selected bytes and their index entry must be durable before the referencing event is acknowledged; missing, changed, noncanonical or non-durable payload custody refuses. Synthetic payloads/durable_payload_ids model that boundary only; native packs, holds, access checks and durability remain NOT_RUN. Verify the same inline limit and reference custody on every retained issued/retained-boundary EventRecord used by recovery, terminal publication, retry or rebuild, even after original domain controls are disposed. Do not copy the resolved large body into any stored EventRecord, and do not replace an oversized body by an unchecked reference string. Full-value custody commits the stored representation, and semantic retry retains Storage's exact field selection. Existing original-body lifetimes and the narrowed retention question are unchanged.

**Compatibility.** Legacy minima and FileSafe snapshot wrapper names are compatibility inputs only, not independent event admission; no historic record is restamped to this edition. Unsupported payload versions are unavailable/quarantined. An application record uses CV-366's original application source and distinct idempotency tuple; nulling a Project record is forbidden. No current registration, Project-to-app recapture or cross-Project fallback follows.

**Exact original source graph (second pass).** Newly authored under DL-045 for `safe_point.restored` only: `Plans/filesafe_event_sources/safe_point_restored.contract.json` selects complete resources by exact URI/path/SHA-256 and defines `FileSafe::restore_exact_replace -> reconcile_restore_transaction`. The two private original-source interfaces are `owner.filesafe.safe_point_restored.original_source.project@1.0.0` and `owner.filesafe.safe_point_restored.original_source.application@1.0.0`. Their exact request/source roots are in `Plans/filesafe_event_sources/safe_point_restored.schema.json`; the result is this family's closed 2.0.0 payload. `capture_at_original_commit` runs inside the original producer operation, `read_same_operation` independently resolves its original request/result/body members, and `recover_same_operation` returns that same original result or unavailable. These are owner read views over existing original intent/receipt/manifest/journal custody, not new public commands, durable tables or an alternative restore engine. All remain specified_unimplemented; native original-source authenticity cannot be established by fixtures.

**Integer admission for `safe_point.restored` (review round 6).** Before any current source commitment, identity, digest or epoch join, validate the closed typed ingress and require every numeric value to be an exact integer; a boolean is not an integer. Refuse floating-point forms such as `1.0`, `1e0` and `-0.0`, including equivalent live writer epochs and numbers inside a decoded SP-337 reference descriptor. Raw JSON `-0` and malformed `01` refuse at the CV-1100 current decoder (see the sweep paragraph at the end of this unit); typed integer zero keeps its existing bytes and commitments. Do not coerce string booleans/numbers, null, arrays or objects into scalar fields. Source schema integer admission includes this exact-type semantic guard; JSON Schema's mathematical integer check alone is insufficient. Source-graph ordinals and independently supplied source/reader generations also require exact integer types before equality or publication. Retained original sources keep the exact versioned commitment recipe and bytes used when written, including the existing typed application-source recipe. Historical source verification validates the exact retained source schema before hash comparisons, never restamps or coerces an old commitment, and never applies the current writer's numeric or live-epoch guard to it. Event-only history, retry and rebuild continue to use immutable issued custody after domain controls are disposed.

The source's original_request, original_result, writer_epoch, storage_instance_id, original_commit_ref and body_members must come from genuine producer custody before the EventRecord exists. Full request and result identities, exact accepted scope and execution context join; the request fields `restore_transaction_id`, `safe_point_id`, `run_id`, `node_id`, `attempt_id`, `target_state_sha256`, `pre_restore_state_sha256` join the result where applicable. Exact required body roles are `restore_request`, `safe_point_record`, `restore_transaction`, `equality_result`; each is a non-secret ref plus original-byte SHA-256. Every member is read and verified under the original owner and current access/hold/backup epoch. A self-consistent caller source or all-true witness is insufficient. The native source reader verifies the exact original storage record/codecs and evidence, including authentic Project FileSafe originals for snapshot/journal subjects; the new application view never rebinds those bytes or converts Project history.

Application `accepted_source_sha256` uses CV-366 accepted_source on the closed preimage {schema_id, schema_version, scope, semantic_record, immutable_identity}: semantic_record is this entire source with only accepted_source_sha256 omitted; immutable_identity is {source_ref, storage_instance_id, operation_id}. Project views commit the same closed preimage by SHA-256 of canonical MessagePack as an additional view commitment, preserving every original Project hash/codec underneath. Neither hash authenticates acceptance or replaces the original native source hash. Graph hashes use CV-366 source_graph excluding only graph_sha256.

For Project `safe_point.restored`, the source view also imports native_project_record through the exact original Project schema bytes selected in its resource manifest. Its original body role is validated in full and joins the explicit original_project_joins table in that family's graph. This additional view preserves original native hash/codec domains. It never fills project_id=null or invents node/attempt IDs for application; the separate application source root rejects native_project_record.

**Complete application originals for `safe_point.restored` (review round 1).** Newly authored owner contract under DL-045 after the own-family current-canon search: `Plans/filesafe_event_sources/safe_point_restored.schema.json#/$defs/application_records` is a required complete method-output composition, not an event-shaped witness. Its closed application safe_point_record, snapshot_manifest and snapshot_blob_inventory have distinct `.application.v1` / `1.0.0` identities. The safe-point record retains complete capture identity, version, counts/lengths, canonical manifest ref/hash, actor/time, eligibility and holds. Every manifest entry carries immutable absolute path, root/generation, Host/Environment and permission-snapshot identity, presence/type/tracked/ignored/write-set disposition, content ref/hash/length and supported SCM/symlink/executable/POSIX/Windows metadata. Optional SCM is a complete repo/worktree/branch/HEAD/index-stage composition; null means no fabricated repository. Manifest paths are canonical ordered and unique, counts/lengths are exact, ignored entries require authorized write-set membership, and blobs exactly cover every addressed file. For every resolved file blob, recompute `blake3:` plus BLAKE3 of the exact decoded bytes and require equality with both the inventory payload_id and each manifest payload_id, in addition to independent SHA-256 and exact lengths. A forged address, swapped bytes or truncated bytes refuses even if every manifest, SHA-256, count, source commitment and receipt has been coherently repaired. Apply this same verification whenever write, retry, read, rebuild, backup/restore or restore execution resolves original blob bytes; no path may treat an advertised address as proof. Event-only reads/retries/rebuilds do not resolve snapshot bodies or recreate disposed originals. Body-dependent historical reads verify the original composition under its retained commitment recipe and access/availability fences, without current-writer admission or live-epoch checks. FileSafe 11.1.2b remains the complete scope/exclusion/equality owner.

Manifest bodies use FileSafe canonical RFC8785 JSON and SHA-256; application request/record/inventory/journal/equality bodies use CV-366 deterministic physical MessagePack. The original request-byte preimage omits only original_input_ref/original_input_sha256, which select those bytes, avoiding a self-hash cycle. The source output supplies complete typed originals and exact body ref/hash/codec/root joins; decode every selected body, validate its closed root and canonical encoding, and require equality with that original output. A role/ref/hash triple, separately supplied metadata dictionary or self-consistent source hash cannot substitute. Each record joins the actual scope, Server and execution context. Original Project schemas, records and physical bytes are unchanged.

This family additionally selects complete target/pre-restore/post-restore manifest compositions (post may be explicit null when equality is unproven), original safe_point_restore_transaction and equality_result roots in its own schema. The journal retains every canonical path operation, expected-before and target type/hash, stage/tombstone ref, state, phase, cursor, lease, timestamps, restart count, outcome, result event, holds and fence. Operation IDs/paths are unique/ordered and cover every target/admission difference. The application safe-point subject key is application@1:hex(UTF-8 server_id):hex(UTF-8 safe_point_id), a scope-safe view identity, not a new physical store. Target/pre/post hashes derive from complete decoded canonical manifests, with SCM equality checked independently. restored_clean requires committed target equality; restore_skipped requires pre=target=post and zero mutations; restore_refused requires unchanged pre-state and zero mutations; restore_failed requires rolled-back pre-state equality; restore_recovery_required requires recovery_required with unproven target/rollback equality, active fence and all safe-point/transaction holds. Transaction/result/event, equality/hold, manifest ref/hash and original lease/cursor joins must all verify. Replay cannot clear recovery holds. A populated restore_transaction.result_event_ref must equal this exact original result EventRecord.event_id; null is supported only as the original source capture before that append, without substituting a different populated result pointer. Derive operation kind from the present before/target entries: create requires absent before and present target; delete requires present before and absent target; replace requires both present; metadata requires both present with unchanged type and content/symlink/gitlink identity. Absent entries normalize to null expected/target types and hashes. Creation/replacement retain their stage; creation has no tombstone; deletion has a transaction-owned tombstone and no stage. Preserve the complete original journal and all owner-required rollback material, mutation fences and holds; this event contract grants no journal disposal or retention change.

**Lifecycle barriers for `safe_point.restored`.**

| From | To | Required barrier |
|---|---|---|
| restore_prepared | outcome_committed | The original exact-replace journal and equality result own the outcome. restored_clean requires target=post; restore_failed/refused require pre=post; restore_skipped requires target=pre=post without mutation; restore_recovery_required retains its independent hold. Restart reconciles the same transaction before dispatch. |
| outcome_committed | prepared_event | Independently resolve original committed request/result and all body members; freeze original ts, operation and semantic envelope. |
| prepared_event | append | Exact family admission and resolved retention required before native writer operation; use SP-026/SP-236 barrier append. |
| append | first_receipt | Explicitly adopt SP-286/CV-339 strict full-value v2 and SP-336/SP-347; preserve original EventRecord and all eleven first receipt fields. |
| first_receipt | terminal_publication | Full-value resolution must match original issued value before dependent terminal/outbox publication. |
| any uncertain stage | same_operation_recovery | Reconcile original source and issued append custody; missing/torn/skewed evidence fences, never recaptures or performs another effect. |
| admitted reader | withdrawal/rebuild | Writer cutoff, same-operation reconciliation, reader and SP-278 generation fence, retained-survivor rebuild and atomic publication. |

For this family, event scope_kind/project_id/thread_id/run_id/node_id/attempt_id, actor_ref, original ts, schema selector, operation identity and original result all join the selected original source; inapplicable envelope node/attempt are null. EventRecord has no extra scope object. correlation_id is original operation_id; producer_sequence_id/causation_event_id/parent_event_id and account refs are original captured values (explicit null if inapplicable), never retry-generated. SP-286 validates the semantic digest independently of the complete original-value commitment; changed observation/storage fields may be a semantic duplicate but never substitute for the issued original full value.

restore_recovery_required remains a recorded unresolved outcome, never permission to dispatch; replay cannot clear the original recovery hold. Every restore outcome joins the original transaction and full equality evidence; restored_with_conflicts is refused.

ContractRef: ContractName:Plans/storage-plan.md#SP-558, ContractName:Plans/FileSafe.md#F2-213, DecisionID:DL-045


**Selected-original custody for `safe_point.restored` (review round 7, R6-B1).** At current owner acceptance and each original-body read, validate the independently selected source itself under its original source schema and existing original commitment recipe. Recompute that selected record's own accepted_source_sha256 before comparing its complete value to the candidate, recursively preserving exact object/array structure and primitive types: boolean true is never integer 1, and integer 1 is never float 1.0. A caller-valid source or matching Python value comparison cannot authenticate the selected record. A missing, malformed, uncommitted or differently typed selected source refuses. Do not coerce, restamp, replace original custody or apply live-writer admission to retained sources. Authentic retained records keep the recipe they were written with; event-only reads still depend on retained issued EventRecord/receipt custody and remain independent of disposed source bodies. Shared number-domain and authenticated frozen-recipe adoption remain sweep items, not a new lane-local serializer or cap.

**Exact numbers and retained dispatch for `safe_point.restored` (sweep part 2B numbers).** Current inputs follow CV-1100 exactly. Raw JSON text is parsed only by the shared current decoder: `-0`, `01`, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of this family's closed roots is recorded during schema validation and admitted by the shared exact-integer call, with range left to the slot's own schema bounds; a fraction or exponent spelling (`1.0`, `1e0`, `-0.0`) is never folded to an integer, and no blanket integer walk or lane ceiling exists. The complete canonical body, the CV-317 producer digest and every other RFC 8785 use here are CV-1100 qualified RFC 8785: a value that binary64 or the emitted decimal cannot preserve refuses before acceptance. SP-1100 purpose profiles supply the CV-339 full-value commitment and application body bytes; an integer a profile cannot encode refuses through its guard row. Retained originals resolve only through SP-1101: Storage's sealed custody catalogue (write-time edition plus frozen resource manifest) authenticates the original, the installed recipe tuple selects the frozen verifier, application body codecs stay pinned by that catalogue, and no current number guard runs on a retained original. The df-event-v2 identity preimage and the local original-source recipes (Project canonical MessagePack, CV-366 accepted_source) are unchanged. Every timestamp this family validates is checked by the shared CV-1101 predicate date_time: schema format date-time fields, including occurred_at_utc, payload ts and the family's other source timestamps, use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile. The SP-1101 frozen verifier uses those same profiles. datetime_validator and the inventory gate run at batch-2 integration.

### CV-420 - Current goal_run.stopped v3 payload contract

```yaml
plan_unit_id: CV-420
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04). goal_run.stopped binds schema ID pm.goal_runtime_event.goal_run_stopped.schema.v3 at Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json, closed at the root (additionalProperties false, unevaluatedProperties false), on the current GoalRun envelope: expected_goal_run_revision, goal_run_revision and idempotency_key are required; expected_goal_revision and parent_goal_id are gone; goal_revision is the unchanged Goal context revision. The payload keeps goal_run_id, stop_reason_code, resumable and safe_point_ref (required when resumable is true); child_settlement_refs is an empty array (GRS-075); settlement_refs is required. The whole v2 schema stays unchanged as the historical reader. Prepared without admission: the registry row keeps v2 until its own admission landing.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- CV-287
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- The v3 root rejects expected_goal_revision, parent_goal_id and any unknown member.
- goal_run_revision is the successor of expected_goal_run_revision (owner predicate) and idempotency_key equals the event idempotency key (SP-426).
- The v2 schema bytes are unchanged.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_stopped_payload
reasoning_tier: high
context_scope: goal_run_stopped_payload_v3
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "pm.goal_runtime_event.goal_run_stopped.schema.v3"
negative_constraints:
- No change to the v2 schema, the registry or the application edition.
owner_hints:
- Plans/Contracts_V0.md
```

Positive and negative payload cases are in `Plans/goal_run_stop_block_oracle_fixtures.json` (ATS-212).

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-200, ContractName:Plans/storage-plan.md#SP-426, ContractName:Plans/Decision_Log.md#DL-080

### CV-421 - Current goal_run.blocked v3 payload contract

```yaml
plan_unit_id: CV-421
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04). goal_run.blocked binds schema ID pm.goal_runtime_event.goal_run_blocked.schema.v3 at Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json, closed at the root (additionalProperties false, unevaluatedProperties false), on the current GoalRun envelope: expected_goal_run_revision, goal_run_revision and idempotency_key are required; expected_goal_revision and parent_goal_id are gone; goal_revision is the unchanged Goal context revision. The payload fields are those of v2: goal_run_id, blocked_reason_code, blocked_scope, allowed_action_ids, preserved_work_refs and block_receipt_ref. The whole v2 schema stays unchanged as the historical reader. Prepared without admission: the registry row keeps v2 until its own admission landing.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- CV-287
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- The v3 root rejects expected_goal_revision, parent_goal_id and any unknown member.
- goal_run_revision is the successor of expected_goal_run_revision (owner predicate) and idempotency_key equals the event idempotency key (SP-427).
- The v2 schema bytes are unchanged.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_blocked_payload
reasoning_tier: high
context_scope: goal_run_blocked_payload_v3
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "pm.goal_runtime_event.goal_run_blocked.schema.v3"
negative_constraints:
- No change to the v2 schema, the registry or the application edition.
owner_hints:
- Plans/Contracts_V0.md
```

Positive and negative payload cases are in `Plans/goal_run_stop_block_oracle_fixtures.json` (ATS-212).

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-201, ContractName:Plans/storage-plan.md#SP-427, ContractName:Plans/Decision_Log.md#DL-080

### CV-422 - Prepared goal.blocked Project v3 qualification

```yaml
plan_unit_id: CV-422
unit_type: owner_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Qualify only the prepared Project goal.blocked successor; old whole-v2 remains historical and no
  app/native admission follows.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-203
- SP-429
unblocks: []
acceptance_criteria:
- Exact scope/schema, source and body receipt joins precede append/observation.
- All unbound edges and approved-exception completion remain refused.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_blocked.v3.schema.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: cv-422_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Contracts_V0.md
```

**Exact `goal.blocked` qualification, newly authored under DL-045.** The prepared Project successor is `pm.goal_runtime_event.goal_blocked.schema.v3` at `Plans/event_payloads/goal_runtime/goal_blocked.v3.schema.json#`, closed metadata on EventRecord pm.event.v0@2.0.0. GRS-203 exclusively owns its host/lifecycle/evidence/Stop predicates and unbound edges; SP-429 exclusively owns its identity, first receipt and passive observation. Before/after ordinary revision and currentness must join the real shared body receipt; metadata changes preserve accepted objective history. This replaces no current registry selector until integration. The whole old v2 schema/predicates and existing v1 reader are retained unchanged; schema promotion is not producer admission. The dormant application sibling is unchanged and independently refused absent adoption. No current v2 D-R lifecycle rule grants v3 writes. ATS-213 qualifies its oracles and explicitly leaves original host-source materialization and native integration incomplete.

### CV-423 - Prepared goal.completed Project v3 qualification

```yaml
plan_unit_id: CV-423
unit_type: owner_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Qualify only the prepared Project goal.completed successor; old whole-v2 remains historical and
  no app/native admission follows.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-204
- SP-430
unblocks: []
acceptance_criteria:
- Exact scope/schema, source and body receipt joins precede append/observation.
- All unbound edges and approved-exception completion remain refused.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_completed.v3.schema.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: cv-423_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Contracts_V0.md
```

**Exact `goal.completed` qualification, newly authored under DL-045.** The prepared Project successor is `pm.goal_runtime_event.goal_completed.schema.v3` at `Plans/event_payloads/goal_runtime/goal_completed.v3.schema.json#`, closed metadata on EventRecord pm.event.v0@2.0.0. GRS-204 exclusively owns its host/lifecycle/evidence/Stop predicates and unbound edges; SP-430 exclusively owns its identity, first receipt and passive observation. Before/after ordinary revision and currentness must join the real shared body receipt; metadata changes preserve accepted objective history. This replaces no current registry selector until integration. The whole old v2 schema/predicates and existing v1 reader are retained unchanged; schema promotion is not producer admission. The dormant application sibling is unchanged and independently refused absent adoption. No current v2 D-R lifecycle rule grants v3 writes. ATS-213 qualifies its oracles and explicitly leaves original host-source materialization and native integration incomplete.

### CV-424 - Historical-only goal.evidence_captured qualification

```yaml
plan_unit_id: CV-424
unit_type: owner_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Qualify goal.evidence_captured as historical-only in both scopes and retain its original Project
  schema/retention; unused app edition withdrawal is an approved checkpoint follow-up.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-205
- SP-431
unblocks: []
acceptance_criteria:
- CV-366 and all original writer rosters are qualified as historical-only for this exact family.
- No registry, app resource, original historical bytes or retention change here.
validation_surfaces:
- Plans/goal_evidence_captured_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: cv-424_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Contracts_V0.md
```

**Exact `goal.evidence_captured` qualification, newly authored under DL-045 applying DL-079/Card 3 A.** This family is historical-only in both scopes. The v2 root `pm.goal_runtime_event.goal_evidence_captured.schema.v2` is the unchanged whole historical reader resource, never a current writer selection. GRS-205 forbids append/retry/producer adoption before dedupe or any effect, and SP-431 supplies the sole historical consumer `storage.goal_evidence_captured_history_read.v1@1.0.0` with SP-420/SP-278 and individual none_required family checkpoint. Preserve original D-R07 row meaning, v1 compatibility and all original Project bytes/retention. This qualification overrides old Known-37/Goal/CV-287 matrix phrases selecting this exact family for new writes. The CV-366 row is historical_only, not pending future source admission. Card 3 A approves withdrawal of the unused app edition at integration's next registry checkpoint; registry/app source/schema edits are deliberately absent from this draft. ATS-211 and the exact family fixture define conditional historical acceptance and current refusal, not actual writer history or native proof.

### CV-425 - Historical-only goal.receipt_recorded qualification

```yaml
plan_unit_id: CV-425
unit_type: owner_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Qualify goal.receipt_recorded as historical-only in both scopes and retain its original Project
  schema/retention; unused app edition withdrawal is an approved checkpoint follow-up.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-206
- SP-432
unblocks: []
acceptance_criteria:
- CV-366 and all original writer rosters are qualified as historical-only for this exact family.
- No registry, app resource, original historical bytes or retention change here.
validation_surfaces:
- Plans/goal_receipt_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: cv-425_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Contracts_V0.md
```

**Exact `goal.receipt_recorded` qualification, newly authored under DL-045 applying DL-079/Card 3 A.** This family is historical-only in both scopes. The v2 root `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` is the unchanged whole historical reader resource, never a current writer selection. GRS-206 forbids append/retry/producer adoption before dedupe or any effect, and SP-432 supplies the sole historical consumer `storage.goal_receipt_recorded_history_read.v1@1.0.0` with SP-420/SP-278 and individual none_required family checkpoint. Preserve original D-R09 row meaning, v1 compatibility and all original Project bytes/retention. This qualification overrides old Known-37/Goal/CV-287 matrix phrases selecting this exact family for new writes. The CV-366 row is historical_only, not pending future source admission. Card 3 A approves withdrawal of the unused app edition at integration's next registry checkpoint; registry/app source/schema edits are deliberately absent from this draft. ATS-211 and the exact family fixture define conditional historical acceptance and current refusal, not actual writer history or native proof.

### CV-426 - Historical-only goal.tool_check_recorded qualification

```yaml
plan_unit_id: CV-426
unit_type: owner_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Qualify goal.tool_check_recorded as historical-only in both scopes and retain its original Project
  schema/retention; unused app edition withdrawal is an approved checkpoint follow-up.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-207
- SP-433
unblocks: []
acceptance_criteria:
- CV-366 and all original writer rosters are qualified as historical-only for this exact family.
- No registry, app resource, original historical bytes or retention change here.
validation_surfaces:
- Plans/goal_tool_check_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: cv-426_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Contracts_V0.md
```

**Exact `goal.tool_check_recorded` qualification, newly authored under DL-045 applying DL-079/Card 3 A.** This family is historical-only in both scopes. The v2 root `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` is the unchanged whole historical reader resource, never a current writer selection. GRS-207 forbids append/retry/producer adoption before dedupe or any effect, and SP-433 supplies the sole historical consumer `storage.goal_tool_check_recorded_history_read.v1@1.0.0` with SP-420/SP-278 and individual none_required family checkpoint. Preserve original D-R13 row meaning, v1 compatibility and all original Project bytes/retention. This qualification overrides old Known-37/Goal/CV-287 matrix phrases selecting this exact family for new writes. The CV-366 row is historical_only, not pending future source admission. Card 3 A approves withdrawal of the unused app edition at integration's next registry checkpoint; registry/app source/schema edits are deliberately absent from this draft. ATS-211 and the exact family fixture define conditional historical acceptance and current refusal, not actual writer history or native proof.
