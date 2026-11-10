# Shard 090: Runtime artifact event contracts prepared without admission — 2026-11-04

Source: `Plans/storage-plan.md`

Source lines: L29716-L30438

Source SHA256: `5df291dcd562b9e42d587cfbbbcf3cf4677641d3a8b3859bdc3c3148ff00f089`

---

## Runtime artifact event contracts prepared without admission — 2026-11-04

### SP-520 — runtime_artifact.api_web_call

```yaml
plan_unit_id: SP-520
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.api_web_call@1.0.0 only. owner.runtime_artifacts.api_web_call.publish@1.0.0 and reader.runtime_artifacts.api_web_call.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-100; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.api_web_call.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.api_web_call only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-521 — runtime_artifact.artifact_version

```yaml
plan_unit_id: SP-521
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.artifact_version@1.0.0 only. owner.runtime_artifacts.artifact_version.publish@1.0.0 and reader.runtime_artifacts.artifact_version.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-101; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.artifact_version.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.artifact_version only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-522 — runtime_artifact.before_after_snapshot

```yaml
plan_unit_id: SP-522
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.before_after_snapshot@1.0.0 only. owner.runtime_artifacts.before_after_snapshot.publish@1.0.0 and reader.runtime_artifacts.before_after_snapshot.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-102; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.before_after_snapshot.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.before_after_snapshot only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-523 — runtime_artifact.browser_recording

```yaml
plan_unit_id: SP-523
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.browser_recording@1.0.0 only. owner.runtime_artifacts.browser_recording.publish@1.0.0 and reader.runtime_artifacts.browser_recording.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-103; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.browser_recording.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.browser_recording only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-524 — runtime_artifact.code_diff

```yaml
plan_unit_id: SP-524
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.code_diff@1.0.0 only. owner.runtime_artifacts.code_diff.publish@1.0.0 and reader.runtime_artifacts.code_diff.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-104; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.code_diff.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.code_diff only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-525 — runtime_artifact.context_snapshot

```yaml
plan_unit_id: SP-525
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.context_snapshot@1.0.0 only. owner.runtime_artifacts.context_snapshot.publish@1.0.0 and reader.runtime_artifacts.context_snapshot.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-105; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.context_snapshot.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.context_snapshot only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-526 — runtime_artifact.cost_usage

```yaml
plan_unit_id: SP-526
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.cost_usage@1.0.0 only. owner.runtime_artifacts.cost_usage.publish@1.0.0 and reader.runtime_artifacts.cost_usage.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-106; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.cost_usage.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.cost_usage only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-527 — runtime_artifact.document

```yaml
plan_unit_id: SP-527
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.document@1.0.0 only. owner.runtime_artifacts.document.publish@1.0.0 and reader.runtime_artifacts.document.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-107; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.document.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.document only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-528 — runtime_artifact.evidence

```yaml
plan_unit_id: SP-528
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.evidence@1.0.0 only. owner.runtime_artifacts.evidence.publish@1.0.0 and reader.runtime_artifacts.evidence.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-108; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.evidence.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.evidence only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-529 — runtime_artifact.failed_attempts

```yaml
plan_unit_id: SP-529
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.failed_attempts@1.0.0 only. owner.runtime_artifacts.failed_attempts.publish@1.0.0 and reader.runtime_artifacts.failed_attempts.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-109; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.failed_attempts.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.failed_attempts only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-530 — runtime_artifact.hitl_approval

```yaml
plan_unit_id: SP-530
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.hitl_approval@1.0.0 only. owner.runtime_artifacts.hitl_approval.publish@1.0.0 and reader.runtime_artifacts.hitl_approval.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-110; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.hitl_approval.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.hitl_approval only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-531 — runtime_artifact.implementation_plan

```yaml
plan_unit_id: SP-531
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.implementation_plan@1.0.0 only. owner.runtime_artifacts.implementation_plan.publish@1.0.0 and reader.runtime_artifacts.implementation_plan.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-111; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.implementation_plan.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.implementation_plan only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-532 — runtime_artifact.reasoning_summary

```yaml
plan_unit_id: SP-532
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.reasoning_summary@1.0.0 only. owner.runtime_artifacts.reasoning_summary.publish@1.0.0 and reader.runtime_artifacts.reasoning_summary.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-112; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.reasoning_summary.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.reasoning_summary only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-533 — runtime_artifact.restore_point

```yaml
plan_unit_id: SP-533
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.restore_point@1.0.0 only. owner.runtime_artifacts.restore_point.publish@1.0.0 and reader.runtime_artifacts.restore_point.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-113; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.restore_point.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.restore_point only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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



### SP-534 — runtime_artifact.screenshot

```yaml
plan_unit_id: SP-534
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.screenshot@1.0.0 only. owner.runtime_artifacts.screenshot.publish@1.0.0 and reader.runtime_artifacts.screenshot.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-114; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.screenshot.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.screenshot only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-535 — runtime_artifact.subagent_lineage

```yaml
plan_unit_id: SP-535
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.subagent_lineage@1.0.0 only. owner.runtime_artifacts.subagent_lineage.publish@1.0.0 and reader.runtime_artifacts.subagent_lineage.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-115; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.subagent_lineage.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.subagent_lineage only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-536 — runtime_artifact.suggested_next_steps

```yaml
plan_unit_id: SP-536
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.suggested_next_steps@1.0.0 only. owner.runtime_artifacts.suggested_next_steps.publish@1.0.0 and reader.runtime_artifacts.suggested_next_steps.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-116; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.suggested_next_steps.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.suggested_next_steps only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-537 — runtime_artifact.tool_llm_trace

```yaml
plan_unit_id: SP-537
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.tool_llm_trace@1.0.0 only. owner.runtime_artifacts.tool_llm_trace.publish@1.0.0 and reader.runtime_artifacts.tool_llm_trace.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-117; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.tool_llm_trace.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.tool_llm_trace only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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


### SP-538 — runtime_artifact.validation_test

```yaml
plan_unit_id: SP-538
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage adoption for runtime_artifact.validation_test@1.0.0 only. owner.runtime_artifacts.validation_test.publish@1.0.0 and reader.runtime_artifacts.validation_test.history@1.0.0 adopt the exact identity, commit/append/receipt barriers, immutable original custody, replay and withdrawal of RAP-118; no admission is performed.
  Reuse projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0 under SP-278, not the deferred runtime_artifact_projector_families row. The exact physical checkpoint is event_record_index_checkpoint.v1:{storage_instance_id} in the checkpoints table; value pm.storage_value.event_record_index_checkpoint.v1@1.0.0 at Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, canonical MessagePack. Its actual current_generation_id selects event_record_index.v2@{generation_id} and checkpoint_ref points to #/generations/{generation_id}. Existing index and checkpoint registry rows already own those values. No new stored value, filtered checkpoint, projection key or compatibility alias is allocated by this family.
  reader.runtime_artifacts.validation_test.history@1.0.0 is stateless across calls. It acquires one current SP-278 read token and reads the complete requested Project partition range against actual canonical frames through that captured frontier, filtering event_type=runtime_artifact.validation_test only after examining the complete range. It verifies source selection, generation membership, payload hash, envelope joins and original source authority. Malformed, unknown, missing, wrong-Project or corrupt values fail the view; they never count as covered gaps. Return captured bounds/currentness and actual gaps; no timestamp approximation or mixed-generation pagination. Revalidate current selection and permissions before returning. No family-local durable advance occurs. The adopted full-index projector advances rows and frontier atomically in one redb transaction with prior-generation/frontier CAS, as SP-278 requires. The live token has ten fields; any durable copy must use DL-076's nine fields, excluding redb_snapshot_id. This consumer persists neither token nor view.
  The reused event_record_index rows retain RP-EVENT-INDEX-SOURCE, source-coupled to the retained EventRecord, with complete target-generation rebuild/remapping at compaction. Only event_record_index_checkpoint generation history uses RP-PROJECTION-3GEN under SP-278: current plus at most two other generations, retirement/hold/reference fences and governed rebuild. Restore/rebuild uses verified CURRENT-selected seglog and authentic receipt custody; never copy an old derived checkpoint into current authority. Missing or corrupt checkpoint is unavailable pending StorageMigrationCoordinator rebuild; actual schema/table installation precedes reading. Canonical event history retains RP-AUTHORITY-INDEFINITE under DL-075, including embedded text, independently of artifact-body policies. Explicitly adopt SP-286 full-value v2 and storage.first_append_receipt.resolve_full_value.v1 for original result recovery; dedupe locators alone are not original receipt authority.
  This exact family changes no artifacts_index/artifacts_project_state/checkpoint.runtime_artifacts physical disposition, grants no action, and never claims that a source-index checkpoint proves a panel projection is current. Native storage, codec, backup, CAS, crash and UI proof remain NOT_RUN.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: [SP-278, SP-286]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/storage-plan.md
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
