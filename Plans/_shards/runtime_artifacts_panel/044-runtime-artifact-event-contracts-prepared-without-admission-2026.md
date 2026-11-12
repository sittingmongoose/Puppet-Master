# Shard 044: Runtime artifact event contracts prepared without admission — 2026-11-04

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L3638-L4409

Source SHA256: `2937ee6273963b17ae05260af88dd8d9861572783613076f8eb79461d537ac56`

---

## Runtime artifact event contracts prepared without admission — 2026-11-04

### RAP-100 — runtime_artifact.api_web_call

```yaml
plan_unit_id: RAP-100
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.api_web_call@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A validated redacted web-operation artifact record becomes durable and addressable; success/failure remains payload evidence rather than event-name variation.
  The producer is WebOperation artifact writer, through the newly named handler owner.runtime_artifacts.api_web_call.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_api_web_call.schema.json (pm.runtime_artifact.api_web_call.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=api_web_call, schema_id=pm.runtime_artifact.api_web_call.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.api_web_call.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-520]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-101 — runtime_artifact.artifact_version

```yaml
plan_unit_id: RAP-101
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.artifact_version@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A distinct immutable version record for one source artifact becomes durable.
  The producer is Artifact versioning writer, through the newly named handler owner.runtime_artifacts.artifact_version.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_artifact_version.schema.json (pm.runtime_artifact.artifact_version.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=artifact_version, schema_id=pm.runtime_artifact.artifact_version.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.artifact_version.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-521]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-102 — runtime_artifact.before_after_snapshot

```yaml
plan_unit_id: RAP-102
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.before_after_snapshot@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A bounded before/after comparison record becomes durable with exact referenced sides and optional typed comparison results.
  The producer is Comparison/capture writer, through the newly named handler owner.runtime_artifacts.before_after_snapshot.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_before_after_snapshot.schema.json (pm.runtime_artifact.before_after_snapshot.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=before_after_snapshot, schema_id=pm.runtime_artifact.before_after_snapshot.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.before_after_snapshot.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-522]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-103 — runtime_artifact.browser_recording

```yaml
plan_unit_id: RAP-103
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.browser_recording@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A browser recording record is sealed with session identity, security class, recording ref, actions, and redaction profile.
  The producer is Browser runtime recorder, through the newly named handler owner.runtime_artifacts.browser_recording.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_browser_recording.schema.json (pm.runtime_artifact.browser_recording.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=browser_recording, schema_id=pm.runtime_artifact.browser_recording.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.browser_recording.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
  Only an ordinary capturable Browser session may seal recording_ref; protected auth_session and transient Computer Use frames are rejected before persistence under current Browser ownership.
  Newly authored current-producer source-agreement binding under DL-045 for runtime_artifact.browser_recording, reusing RAP-021: every actions[].browser_session_id equals the sealed browser_session_id. If an action embeds a PageRepresentation and a page_representation_ref, that ref equals its page_representation_id. Repeated screenshot_artifact_ref, pdf_artifact_ref, console_ref and network_ref at that action and embedded page are copies of the same source ref and must agree when both occur; the embedded redaction_profile_id equals the sealed recording profile. Session provenance and each action invocation are distinct observations and may differ; action timestamps, URLs after redirects, the recording's current page ref, historical action pages, recording artifact_refs and page artifact refs are distinct roles, not equality aliases. Validate these joins on the resolved logical body on both storage routes before fresh publication; no schema-valid contradiction or freshly recomputed pack commitment can waive a join. A supported authenticated historical original keeps its original decoder and bytes.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-523]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-104 — runtime_artifact.code_diff

```yaml
plan_unit_id: RAP-104
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.code_diff@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A code-difference record becomes durable with an exact changed-path census and optional typed diff/base/result detail.
  The producer is Mutation/diff recorder, through the newly named handler owner.runtime_artifacts.code_diff.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_code_diff.schema.json (pm.runtime_artifact.code_diff.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=code_diff, schema_id=pm.runtime_artifact.code_diff.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.code_diff.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-524]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-105 — runtime_artifact.context_snapshot

```yaml
plan_unit_id: RAP-105
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.context_snapshot@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A redacted context snapshot becomes durable at one exact snapshot ref with optional typed scope, revision, and inclusion metadata.
  The producer is Context snapshot writer, through the newly named handler owner.runtime_artifacts.context_snapshot.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_context_snapshot.schema.json (pm.runtime_artifact.context_snapshot.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=context_snapshot, schema_id=pm.runtime_artifact.context_snapshot.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.context_snapshot.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-525]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-106 — runtime_artifact.cost_usage

```yaml
plan_unit_id: RAP-106
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.cost_usage@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A usage/cost artifact record becomes durable as a reference-bound projection of Usage authority, not a replacement usage event.
  The producer is Usage settlement artifact writer, through the newly named handler owner.runtime_artifacts.cost_usage.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_cost_usage.schema.json (pm.runtime_artifact.cost_usage.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=cost_usage, schema_id=pm.runtime_artifact.cost_usage.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.cost_usage.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
  usage_event_ref and usage_record_id join original Usage authority; DL-270/SP-341/UF-108 still own detailed Usage retention and permanent daily rollups. This event neither settles usage nor charges twice, shows expires-in, nor becomes a cost_usage tombstone.
  Newly authored exact provider-hash representation for runtime_artifact.cost_usage under DL-045: type_payload.authority.provider_payload_hash is required-present null when the original Usage settlement source has no known digest; otherwise it is exactly 71 ASCII characters, the literal lowercase prefix "sha256:" followed by 64 lowercase hexadecimal digits encoding SHA-256 of the exact redacted provider-payload bytes sealed by that source. Preserve the original source digest and null; never guess a digest from display text, synthesize one for missing evidence, normalize whitespace/case, or hash unredacted secrets. Enforce full-match sha256:[0-9a-f]{64} plus exact length 71 at this current Project-writer and payload-resolution boundary, in addition to every existing schema rule; empty, opaque, bare-hex, other-algorithm, uppercase, nonhex, short/long and trailing-LF values refuse. The historical schema file and ID remain unchanged: this is an explicit adopted current-writer lexical guard, not a rewrite or reinterpretation of retained events. A supported historical decoder preserves values valid under their original contract and still requires authentic original provenance, current read authorization and an installed non-withdrawn reader; current live owner status is not a historical-validity test.
  Newly authored current-producer source-agreement binding under DL-045 for runtime_artifact.cost_usage, reusing RAP-016 and UF-084/UF-085: root usage_event_ref/usage_record_id and any root provider_attempt_ref/receipt_refs equal their type_payload.refs copies; refs.usage_event_ref/usage_record_id equal the primary type_payload values. refs.run_id/attempt_id/thread_id/node_id, when present, equal the envelope-owner payload values (null for absent optional values); refs.raw_payload_ref equals authority.raw_payload_ref. type_payload.reasoning_tokens mirrors usage.reasoning_tokens; optional total_tokens mirrors usage.provider_total and supplies no extra accounting authority. Recompute input_non_cached from input_total minus the distinct cache_read/cache_write/cache_write_1h buckets only when input_total_includes_cache=yes and all inputs are known; recompute output_visible from output_total minus reasoning_tokens only when output_total_includes_reasoning=yes and both are known. Unknown buckets are never guessed as zero. With provider_total_semantics=derived_input_plus_output, recompute provider_total as input_total+output_total (null if either is unknown), never by adding inclusive subset buckets again. A supplied nonempty complete bucket_costs_microdollars map whose entries are known integer amounts must sum to cost_microdollars. Source-class flags is_provider_reported (provider_reported/provider_header), is_cli_reported, is_local_context_estimate and is_estimated (local_estimated/pricing_estimated) mirror authority.source_class. BYOK, subscription hiding, display policy, quota, raw thoughts counts, context estimates, parent/child attribution and stream delta/cumulative are separate source facts; they are not copies of this event's totals. Recompute a known provider_payload_hash from the exact redacted source bytes selected by authority.raw_payload_ref; a source explicitly declaring no known digest supplies null, never a fabricated digest. These checks apply to resolved inline/packed current publication; preserve authenticated supported historical originals without applying new-writer rules.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-526]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-107 — runtime_artifact.document

```yaml
plan_unit_id: RAP-107
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.document@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A document artifact record becomes durable at one exact document ref with optional typed MIME, kind, format, digest, and source metadata.
  The producer is Document artifact writer, through the newly named handler owner.runtime_artifacts.document.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_document.schema.json (pm.runtime_artifact.document.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=document, schema_id=pm.runtime_artifact.document.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.document.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-527]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-108 — runtime_artifact.evidence

```yaml
plan_unit_id: RAP-108
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.evidence@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: An evidence artifact record of one exact evidence kind becomes durable with optional reference-bound claim, source, digest, and verification metadata.
  The producer is Verifier/evidence writer, through the newly named handler owner.runtime_artifacts.evidence.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_evidence.schema.json (pm.runtime_artifact.evidence.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=evidence, schema_id=pm.runtime_artifact.evidence.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.evidence.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-528]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-109 — runtime_artifact.failed_attempts

```yaml
plan_unit_id: RAP-109
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.failed_attempts@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A bounded failed-attempt aggregation becomes durable without overwriting any attempt record.
  The producer is Attempt evidence aggregator, through the newly named handler owner.runtime_artifacts.failed_attempts.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_failed_attempts.schema.json (pm.runtime_artifact.failed_attempts.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=failed_attempts, schema_id=pm.runtime_artifact.failed_attempts.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.failed_attempts.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-529]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-110 — runtime_artifact.hitl_approval

```yaml
plan_unit_id: RAP-110
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.hitl_approval@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: An already-decided HITL approval receipt projection becomes durable; this event is never the approval command or unblock signal.
  The producer is Approval-owner receipt bridge, through the newly named handler owner.runtime_artifacts.hitl_approval.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_hitl_approval.schema.json (pm.runtime_artifact.hitl_approval.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=hitl_approval, schema_id=pm.runtime_artifact.hitl_approval.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.hitl_approval.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
  Approval is already decided by the approval owner: publication cannot approve, unblock or renew a grant; re-read revocation at access.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-530]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-111 — runtime_artifact.implementation_plan

```yaml
plan_unit_id: RAP-111
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.implementation_plan@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A non-canonical implementation-plan artifact becomes durable at one exact plan ref with optional typed revision, step, dependency, and validation metadata.
  The producer is Planning artifact writer, through the newly named handler owner.runtime_artifacts.implementation_plan.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_implementation_plan.schema.json (pm.runtime_artifact.implementation_plan.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=implementation_plan, schema_id=pm.runtime_artifact.implementation_plan.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.implementation_plan.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-531]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-112 — runtime_artifact.reasoning_summary

```yaml
plan_unit_id: RAP-112
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.reasoning_summary@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A summary-only reasoning artifact becomes durable; private chain-of-thought or raw hidden reasoning is not captured.
  The producer is Agent summary writer, through the newly named handler owner.runtime_artifacts.reasoning_summary.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_reasoning_summary.schema.json (pm.runtime_artifact.reasoning_summary.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=reasoning_summary, schema_id=pm.runtime_artifact.reasoning_summary.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.reasoning_summary.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
  Only the agent-authored visible summary may be sealed. No private chain-of-thought or raw hidden reasoning is admitted.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-532]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-113 — runtime_artifact.restore_point

```yaml
plan_unit_id: RAP-113
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.restore_point@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A restore-point record becomes durable or changes its recorded availability/lifecycle state under the existing field-deep contract.
  The producer is Restore-point owner observation writer, through the newly named handler owner.runtime_artifacts.restore_point.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_restore_point.schema.json (pm.runtime_artifact.restore_point.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the EventRecord 2.0.0 project_id, scope_kind=project; artifact_type=restore_point, schema_id=pm.runtime_artifact.restore_point.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Restore-point run_id/attempt_id remain optional attribution; type_payload.restore_point_id is primary and type_payload.project_id equals the envelope Project. Preserve exact source_thread_id/source_branch_id/source_message_id, record_ref and immutable record_sha256 joins to the Chat-owned rp record. safe_point_id remains lineage only. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Newly authored observation identity under DL-045 explicitly completes RAP-054's unfinished four-member recommendation for this lifecycle-changing family only. The four-member tuple [event_type, project_id, artifact_id, schema_id] remains the stable artifact grouping identity, with one unchanged artifact_id and primary type_payload.restore_point_id. Event identity additionally binds the original owner observation revision in EventRecord.producer_sequence_id. idempotency_key is "ra-observation1:" plus lowercase SHA-256 of the five-member tuple [event_type, project_id, artifact_id, schema_id, decimal(producer_sequence_id)], each exact UTF-8 member prefixed with its uint32 big-endian byte length; decimal is a nonnegative integer with no leading zero except "0". EventRecord.event_id is allocated once by Storage on first accepted append. Only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc.
  Observation revisions are source-backed technical ordinals, not new point versions or artifact rows. Under the actual append-writer/selection fence, the owner reads the complete verified SP-278 history for this Project/artifact, authenticates the previous observation and its SP-286 full-value first receipt, and validates the current canonical rp/source snapshot through the existing Chat/Storage authority. First revision is 0 with parent_event_id=null; each later accepted lifecycle observation is exactly predecessor revision+1 with parent_event_id equal to that original observation's event_id. Correlation stays the four-member ra1 grouping key. Reject a missing/gapped predecessor, changed point/artifact association, invalid source/hash/Project, unsupported source proof, stale snapshot or parallel stale predecessor; no ordinal is reconstructed from timestamps or payload hashes. Recheck source and predecessor under the same fence before append. No new stored counter or pending request is introduced: committed observations and original receipts are the durable ordinal custody.
  The source proof is the actual Chat-owned current rp identity/hash/lifecycle/holds and source visibility, plus genuine creation/lifecycle completion evidence and authorized source/permission selection, not a supplied status or artifact index row. Reuse RAP-059's record@2/SP-285 retained_creation passive_creation route for supported available native points and retained_custody for supported present expired/deleted points; supported historical completion and terminal summaries keep their existing exact predicates. Corrupt/unavailable observations require genuine owner-resolved corruption/source evidence and the unchanged schema's unavailable actions; lack of a supported authentic proof fences publication, never guesses a point transition. No borrowing restore_point.created membership or manufacturing missing capture/companion/custody is permitted.
  Only the already specified first durability or changed recorded lifecycle/availability/source/hold/reference facts can advance an observation; a viewer refresh, clock, summary edit or projection-currentness change cannot. An unchanged source observation returns the original event and eleven-field first receipt. A retry carries its original revision, parent and all frozen producer-owned fields and resolves that exact original EventRecord/receipt before any new observation; the same revision with a different producer-semantic digest conflicts without append. After crash, unavailable original proof fences retry rather than recapturing changed live state as the old observation. A later authentic source observation uses the next ordinal while keeping the same point/artifact identity. These history observations do not add visible artifact/version rows or change row grouping, routing, availability vocabulary, branch/delete/apply preflight, canonical rp custody, holds or any action; passive readers never execute those actions.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.restore_point.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-533]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-114 — runtime_artifact.screenshot

```yaml
plan_unit_id: RAP-114
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.screenshot@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A referenced screenshot artifact becomes durable at one exact media ref with optional typed digest, dimensions, surface, and redaction metadata.
  The producer is Screenshot/capture writer, through the newly named handler owner.runtime_artifacts.screenshot.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_screenshot.schema.json (pm.runtime_artifact.screenshot.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=screenshot, schema_id=pm.runtime_artifact.screenshot.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.screenshot.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-534]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-115 — runtime_artifact.subagent_lineage

```yaml
plan_unit_id: RAP-115
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.subagent_lineage@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A parent-child delegation lineage artifact becomes durable with exact parent/child attempt refs and optional typed agent, objective, lifecycle, and result metadata.
  The producer is Orchestrator lineage writer, through the newly named handler owner.runtime_artifacts.subagent_lineage.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_subagent_lineage.schema.json (pm.runtime_artifact.subagent_lineage.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=subagent_lineage, schema_id=pm.runtime_artifact.subagent_lineage.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.subagent_lineage.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-535]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-116 — runtime_artifact.suggested_next_steps

```yaml
plan_unit_id: RAP-116
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.suggested_next_steps@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A bounded non-executing next-step list becomes durable with optional typed rationale, priority, dependency, and approval metadata.
  The producer is Agent suggestion writer, through the newly named handler owner.runtime_artifacts.suggested_next_steps.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_suggested_next_steps.schema.json (pm.runtime_artifact.suggested_next_steps.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=suggested_next_steps, schema_id=pm.runtime_artifact.suggested_next_steps.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.suggested_next_steps.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-536]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-117 — runtime_artifact.tool_llm_trace

```yaml
plan_unit_id: RAP-117
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.tool_llm_trace@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A redacted reference-based tool/LLM trace artifact becomes durable with lifecycle, settlement, retry, refs, and flags.
  The producer is Tool/provider trace writer, through the newly named handler owner.runtime_artifacts.tool_llm_trace.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_tool_llm_trace.schema.json (pm.runtime_artifact.tool_llm_trace.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=tool_llm_trace, schema_id=pm.runtime_artifact.tool_llm_trace.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.tool_llm_trace.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
  Newly authored exact provider-hash representation for runtime_artifact.tool_llm_trace under DL-045: type_payload.raw_payload.provider_payload_hash is required-present null when the original Tool/provider trace source has no known digest; otherwise it is exactly 71 ASCII characters, the literal lowercase prefix "sha256:" followed by 64 lowercase hexadecimal digits encoding SHA-256 of the exact redacted provider-payload bytes sealed by that source. Preserve the original source digest and null; never guess a digest from display text, synthesize one for missing evidence, normalize whitespace/case, or hash unredacted secrets. Enforce full-match sha256:[0-9a-f]{64} plus exact length 71 at this current Project-writer and payload-resolution boundary, in addition to every existing schema rule; empty, opaque, bare-hex, other-algorithm, uppercase, nonhex, short/long and trailing-LF values refuse. The historical schema file and ID remain unchanged: this is an explicit adopted current-writer lexical guard, not a rewrite or reinterpretation of retained events. A supported historical decoder preserves values valid under their original contract and still requires authentic original provenance, current read authorization and an installed non-withdrawn reader; current live owner status is not a historical-validity test.
  Newly authored current-producer source-agreement binding under DL-045 for runtime_artifact.tool_llm_trace, reusing RAP-043 and the canonical Usage source identity: refs.provider_attempt_ref/usage_event_ref/usage_record_id equal the corresponding primary type_payload values; settlement.usage_event_ref/usage_record_id equal those same usage identities for every retry relation, including explicit null. Any root provider_attempt_ref/usage_event_ref/usage_record_id/receipt_refs are copies of refs and must agree when present. refs.raw_payload_ref equals raw_payload.raw_payload_ref; recompute each known provider_payload_hash from that source's exact redacted bytes, or preserve null for an explicitly unknown source digest. For raw redaction_status=redacted/not_needed, flags.redacted is respectively true/false. A non-null usage event, record or artifact identity requires usage_observed=true; a non-null quota_artifact_ref or nonempty quota_refs requires quota_observed=true. retry.relation=none requires parent_trace_ref=null; retry_of/escalation_of/resume_of require a parent ref. The parent trace is a distinct identity and never excuses disagreements about this trace's own provider/usage source. Tool/LLM call ids, lifecycle times, usage/quota artifact refs and signal-only provider_reported/cli_reported flags are distinct source roles, not alternative Usage authority. Enforce on current resolved inline/packed publication; historical original values keep their supported decoder and provenance.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-537]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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


### RAP-118 — runtime_artifact.validation_test

```yaml
plan_unit_id: RAP-118
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: |-
  Newly authored owner contract under DL-045 for runtime_artifact.validation_test@1.0.0, prepared without admission. This exact family implements only the existing Option 2 transition: A validation artifact becomes durable with an exact test-id census and optional typed command, suite, lifecycle, per-test result, duration, and evidence metadata.
  The producer is Test/validation writer, through the newly named handler owner.runtime_artifacts.validation_test.publish@1.0.0. This handler seals one immutable artifact metadata record; it does not perform the source operation. Validate the closed schema Plans/runtime_artifact_validation_test.schema.json (pm.runtime_artifact.validation_test.schema.v1) and current producer/read permission before commit. Project root edition only: nonempty payload.project_id must equal the canonical CV-317 envelope project_id, scope_kind=project; artifact_type=validation_test, schema_id=pm.runtime_artifact.validation_test.schema.v1. All run/attempt/thread/node/provider/usage refs must resolve to that same owning Project and original source; absent optional refs never inherit focused UI identity. Non-restore artifacts require original run_id and attempt_id. Application successor definitions in CV-366/SP-349/351/352 are separate source/key graphs and are not written into this Project edition; this draft changes none of them.
  Identity adopts the owner-recommended four-member tuple exactly: [event_type, project_id, artifact_id, schema_id]. Each member is encoded as uint32 big-endian UTF-8 byte length followed by its exact UTF-8 bytes, in that order, without normalization; reject length overflow. idempotency_key is "ra1:" plus lowercase SHA-256 of those framed bytes. EventRecord event_id is allocated once by Storage on first accepted append and thereafter returned from original custody; only sequence_id, observed_at_utc and persisted_at_utc are Storage assignments; occurred_at_utc preserves the original producer-authored payload.created_at_utc. Matching identity with changed producer-semantic payload is a conflict, never an overwrite. No timestamp, summary, preview or subtype is an identity substitute.
  The producer validates and durably commits any required referenced body through its existing source owner, then freezes the exact metadata payload. The EventRecord append is the first canonical persistence of artifact metadata; no second metadata or pending-request value is introduced. It then uses ordinary Case L-2 SeglogFrameV2 append with the exact identity, explicitly adopting SP-286/CV-339 and the installed full-value v2 successor including storage.first_append_receipt.resolve_full_value.v1. First receipt issuance is the group's durable commit frame under SP-336/SP-347; the custody transaction follows sync. No terminal artifact publication precedes authentic first-receipt custody and the final source/permission guard. No durable pending-request family is invented. After crash, retry only from the same authentic sealed source identity; no redispatch of its source action. If the original source or receipt cannot be proven, report unavailable and fence publication. Lost acknowledgements return the original EventRecord/receipt through actual first-receipt resolution; replay cannot manufacture a new event_id, body, receipt or external effect.
  The exact passive operating consumer is reader.runtime_artifacts.validation_test.history@1.0.0, for the already specified artifact evidence/history inspection path. It consumes complete EventRecord 2.0.0 source values through reader.storage.event_record_index@1.0.0 and explicitly adopts SP-278. It returns only verified original metadata and authorized refs, never dispatches actions, appends siblings or fills a missing original from a projection. The artifact index and panel projection remain independently deferred; this history reader neither enables nor redefines them.
  Retain this event, including embedded summary/text and original provenance, under RP-AUTHORITY-INDEFINITE@1.0.0 (DL-075 and Case L-3). The payload retention_class describes the artifact/body policy, never the EventRecord policy. Artifact bodies, Usage, original receipts and other source records retain their own existing policies; deleting a linked body does not erase event-embedded text. On each read recheck current authorization, source deletion/revocation and holds; inaccessible bodies remain unavailable and are never reconstructed from the retained event. No new deletion exception or preservation hold is created. Seglog owns original event custody, coherent backup and restore; include original EventRecord and SP-286 receipt custody from the same verified store/source selection. A derived index is not a backup of either. Redact before sealing; refs and summaries must not carry secrets, private reasoning, protected auth-session captures or raw hidden content.
  Compatibility is exact-version only: unsupported schema IDs/versions fail closed with unsupported_schema_version. Existing source-lineage values may be inspected only through their explicitly supported decoder and original provenance, never rewritten as current events. Withdrawal first closes this exact producer's admission under the owner writer lease and drains or fences in-flight publication; preserve original issued receipts and events. Stop this reader before withdrawing its installed SP-278 dependency, invalidate its ephemeral view, then reinstall a versioned compatible reader and perform a complete authorized source read. Rebuild never republishes an event or source operation. No registry entry, native dispatch, PNC-019 or readiness follows this contract.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [DL-045, DL-075, SP-538]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
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
