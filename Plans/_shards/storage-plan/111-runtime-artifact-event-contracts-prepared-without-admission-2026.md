# Shard 111: Runtime artifact event contracts prepared without admission — 2026-11-04

Source: `Plans/storage-plan.md`

Source lines: L54001-L57248

Source SHA256: `5c118f3f6b4b66bf98fe35bf3b9e2122e98f49473b738bb20cb7f5821098b3bb`

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

### SP-575 - Bundle Revision Requested Custody And History

```yaml
plan_unit_id: SP-575
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: '`bundle.revision_requested` explicitly adopts SP-286 and CV-339 including strict full-value v2
  resolution, SP-336/SP-347 durability classes, and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. NEW owner contract
  under DL-045: producer emitter.bundle_revision_requested@1.0.0 is the document review request handler governed
  by ACD-571. Before any append, require individual family admission and schema support, current project/thread/bundle
  permissions, exact source evidence and CV-590 identity. Freeze the prepared complete EventRecord after original
  source evidence is committed; append through Storage, then resolve the original full-value AppendReceipt before
  publishing the phase as recorded or starting dependent work. No in-memory notification, caller hash, stale currentness
  token or partially delivered receipt establishes success. Missing original after confirmed older restore stays
  unavailable; no replacement receipt or re-execution is inferred. An uncertain start/completion is reconciled with
  existing revision_run and FileSafe recovery evidence, never restarted by this history reader. A single started
  phase cannot settle both completed and interrupted; duplicate delivery returns the original immutable result,
  conflicting semantics fence.


  NEW passive consumer reader.bundle_revision_requested_history@1.0.0 queries only this exact event_type, schema_id/version
  from CV-590, and the authorized project/thread/bundle/revision. It explicitly adopts SP-278 and reuses the existing
  projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0; their physical checkpoint
  is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  and lookup rows are event_record_index.v2 in the current selected generation. Complete source coverage, exact
  root/generation/frontier and actual live ten-field read token must be verified in one read transaction. The generic
  projector alone advances its existing checkpoint and index rows atomically by predecessor CAS, including nonmatching
  source rows; max matching sequence is never coverage. This family owns no filtered durable checkpoint, projection
  or copied body; SP-579 separately materializes its existing original source inventory. No stored read token is
  added; any future durable token must use DL-076''s nine-field projection with no persisted redb_snapshot_id. Consumer
  output is disposable authorized history, not runner state. Source expiry/deletion is a truthful unavailable result;
  never rebuild a document or grant access from history.


  Original document, annotation and revision evidence remain with ACD-049/050, Storage revision_run.v1 and FileSafe.
  Reads recheck current permissions and actual deletion/availability of every reference. Event bodies contain identifiers,
  capability metadata and refs only; no annotations, prompt, secret or document text. Coherent backup includes source
  evidence, original full-value receipt custody and seglog at the same admitted restore boundary; unresolved source/receipt
  skew fences dependent success. Redaction never grants reference access or rewrites original identity.


  Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «retention_policy_ref=PENDING_RETENTION_DECISION.»Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): « Candidate classes are Case L-3 receipt/audit
  authority/source lineage versus Chat content for this Deep Plan review history; no exact family assignment is
  established.» Event lifetime and original source bodies are independent. No TTL/count deletion or indefinite class
  selection is authorized by this draft. Existing generic index/checkpoint retains RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN
  unchanged.


  Withdrawal first cuts off new writer admission for bundle.revision_requested; drain or fence its pending append
  work under the original receipt gate, then withdraw reader.bundle_revision_requested_history@1.0.0 from dispatch.
  No history read or rebuild triggers revision, mutation or Multi-Pass Review. A replacement reader must explicitly
  support retained schemas and authenticate complete SP-278 rebuild/currentness before publication. Cutoff does
  not delete original events or reset the generic shared checkpoint, and does not withdraw siblings. Unsupported
  historical versions remain unavailable with evidence, never rewritten on read. Positive/negative static cases
  live in Plans/bundle_revision_event_fixtures.json; scripts/pm_bundle_revision_events.py checks this family''s
  own full envelope, schema, identity, source custody, terminal settlement and withdrawal predicates. Native append,
  lost acknowledgement, effect-unknown reconciliation, backup/restore, access/deletion, concurrent CAS, source gaps,
  cutoff/rebuild and retention-boundary obligations are authored NOT_RUN, and must be exercised on real adapters
  before native claims. For bundle.revision_requested specifically, SP-579 is adopted as the complete original revision_run
  physical source contract: validate its source slot, original intent/result, typed key, exclusive latest predecessor/value_revision
  CAS and independently authenticated full-value first receipt before publication. Its own producer uses dedupe_by_idempotency_key;
  same identity/digest returns the original full event and receipt, changed semantics conflicts, and unavailable
  dedupe proof refuses. Read replay never executes that writer. The full-envelope/source/terminal/cutoff/reader/rebuild
  static matrix is Plans/dcw_event_contract_fixtures.json, run through scripts/pm_bundle_revision_events.py; all
  normative cases are prepared, with native adapters NOT_RUN.


  PNC-019 s4r retention binding for `bundle.revision_requested` (2026-11-14).


  Event history `retention_policy_ref = RP-AUTHORITY-INDEFINITE@1.0.0`, under Plans/Decision_Log.md#DL-401.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): bundle.revision_requested@1.0.0 is registered for project_only in Plans/event_family_registry.json,
  as recorded by Plans/Decision_Log.md#DL-2229. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; Plans/storage-plan.md#SP-575
  owns the event policy''s existing anchors, counts, holds and deletion rules. Separate stored-value assignment:
  revision_run uses RP-CHAT-THREAD-LIFETIME@1.0.0 under Plans/Decision_Log.md#DL-508; this assigns that stored value,
  not event history. Original sources and coherent backups retain their independent owner policies; the event lifetime
  is not transferred to them. Current append/publication still requires the exact selected schema/scope, original
  custody, current permission, receipt and required producer adoption. Actual missing registration or unresolved
  required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice or governance
  seal follows.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-571
- CV-590
- SP-278
- SP-286
- SP-579
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «This exact family remains unadmitted until
  individual admission; no sibling inference».'
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-576 - Bundle Revision Started Custody And History

```yaml
plan_unit_id: SP-576
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: '`bundle.revision_started` explicitly adopts SP-286 and CV-339 including strict full-value v2 resolution,
  SP-336/SP-347 durability classes, and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. NEW owner contract under DL-045:
  producer emitter.bundle_revision_started@1.0.0 is the targeted revision runner governed by ACD-572. Before any
  append, require individual family admission and schema support, current project/thread/bundle permissions, exact
  source evidence and CV-591 identity. Freeze the prepared complete EventRecord after original source evidence is
  committed; append through Storage, then resolve the original full-value AppendReceipt before publishing the phase
  as recorded or starting dependent work. No in-memory notification, caller hash, stale currentness token or partially
  delivered receipt establishes success. Missing original after confirmed older restore stays unavailable; no replacement
  receipt or re-execution is inferred. An uncertain start/completion is reconciled with existing revision_run and
  FileSafe recovery evidence, never restarted by this history reader. A single started phase cannot settle both
  completed and interrupted; duplicate delivery returns the original immutable result, conflicting semantics fence.


  NEW passive consumer reader.bundle_revision_started_history@1.0.0 queries only this exact event_type, schema_id/version
  from CV-591, and the authorized project/thread/bundle/revision. It explicitly adopts SP-278 and reuses the existing
  projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0; their physical checkpoint
  is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  and lookup rows are event_record_index.v2 in the current selected generation. Complete source coverage, exact
  root/generation/frontier and actual live ten-field read token must be verified in one read transaction. The generic
  projector alone advances its existing checkpoint and index rows atomically by predecessor CAS, including nonmatching
  source rows; max matching sequence is never coverage. This family owns no filtered durable checkpoint, projection
  or copied body; SP-579 separately materializes its existing original source inventory. No stored read token is
  added; any future durable token must use DL-076''s nine-field projection with no persisted redb_snapshot_id. Consumer
  output is disposable authorized history, not runner state. Source expiry/deletion is a truthful unavailable result;
  never rebuild a document or grant access from history.


  Original document, annotation and revision evidence remain with ACD-049/050, Storage revision_run.v1 and FileSafe.
  Reads recheck current permissions and actual deletion/availability of every reference. Event bodies contain identifiers,
  capability metadata and refs only; no annotations, prompt, secret or document text. Coherent backup includes source
  evidence, original full-value receipt custody and seglog at the same admitted restore boundary; unresolved source/receipt
  skew fences dependent success. Redaction never grants reference access or rewrites original identity.


  Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «retention_policy_ref=PENDING_RETENTION_DECISION.»Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): « Candidate classes are Case L-3 receipt/audit
  authority/source lineage versus Chat content for this Deep Plan review history; no exact family assignment is
  established.» Event lifetime and original source bodies are independent. No TTL/count deletion or indefinite class
  selection is authorized by this draft. Existing generic index/checkpoint retains RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN
  unchanged.


  Withdrawal first cuts off new writer admission for bundle.revision_started; drain or fence its pending append
  work under the original receipt gate, then withdraw reader.bundle_revision_started_history@1.0.0 from dispatch.
  No history read or rebuild triggers revision, mutation or Multi-Pass Review. A replacement reader must explicitly
  support retained schemas and authenticate complete SP-278 rebuild/currentness before publication. Cutoff does
  not delete original events or reset the generic shared checkpoint, and does not withdraw siblings. Unsupported
  historical versions remain unavailable with evidence, never rewritten on read. Positive/negative static cases
  live in Plans/bundle_revision_event_fixtures.json; scripts/pm_bundle_revision_events.py checks this family''s
  own full envelope, schema, identity, source custody, terminal settlement and withdrawal predicates. Native append,
  lost acknowledgement, effect-unknown reconciliation, backup/restore, access/deletion, concurrent CAS, source gaps,
  cutoff/rebuild and retention-boundary obligations are authored NOT_RUN, and must be exercised on real adapters
  before native claims. For bundle.revision_started specifically, SP-579 is adopted as the complete original revision_run
  physical source contract: validate its source slot, original intent/result, typed key, exclusive latest predecessor/value_revision
  CAS and independently authenticated full-value first receipt before publication. Its own producer uses dedupe_by_idempotency_key;
  same identity/digest returns the original full event and receipt, changed semantics conflicts, and unavailable
  dedupe proof refuses. Read replay never executes that writer. The full-envelope/source/terminal/cutoff/reader/rebuild
  static matrix is Plans/dcw_event_contract_fixtures.json, run through scripts/pm_bundle_revision_events.py; all
  normative cases are prepared, with native adapters NOT_RUN.


  PNC-019 s4r retention binding for `bundle.revision_started` (2026-11-14).


  Event history `retention_policy_ref = RP-AUTHORITY-INDEFINITE@1.0.0`, under Plans/Decision_Log.md#DL-401.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): bundle.revision_started@1.0.0 is registered for project_only in Plans/event_family_registry.json,
  as recorded by Plans/Decision_Log.md#DL-2230. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; Plans/storage-plan.md#SP-576
  owns the event policy''s existing anchors, counts, holds and deletion rules. Separate stored-value assignment:
  revision_run uses RP-CHAT-THREAD-LIFETIME@1.0.0 under Plans/Decision_Log.md#DL-508; this assigns that stored value,
  not event history. Original sources and coherent backups retain their independent owner policies; the event lifetime
  is not transferred to them. Current append/publication still requires the exact selected schema/scope, original
  custody, current permission, receipt and required producer adoption. Actual missing registration or unresolved
  required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice or governance
  seal follows.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-572
- CV-591
- SP-278
- SP-286
- SP-579
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «This exact family remains unadmitted until
  individual admission; no sibling inference».'
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-577 - Bundle Revision Completed Custody And History

```yaml
plan_unit_id: SP-577
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: '`bundle.revision_completed` explicitly adopts SP-286 and CV-339 including strict full-value v2
  resolution, SP-336/SP-347 durability classes, and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. NEW owner contract
  under DL-045: producer emitter.bundle_revision_completed@1.0.0 is the targeted revision runner governed by ACD-573.
  Before any append, require individual family admission and schema support, current project/thread/bundle permissions,
  exact source evidence and CV-592 identity. Freeze the prepared complete EventRecord after original source evidence
  is committed; append through Storage, then resolve the original full-value AppendReceipt before publishing the
  phase as recorded or starting dependent work. No in-memory notification, caller hash, stale currentness token
  or partially delivered receipt establishes success. Missing original after confirmed older restore stays unavailable;
  no replacement receipt or re-execution is inferred. An uncertain start/completion is reconciled with existing
  revision_run and FileSafe recovery evidence, never restarted by this history reader. A single started phase cannot
  settle both completed and interrupted; duplicate delivery returns the original immutable result, conflicting semantics
  fence.


  NEW passive consumer reader.bundle_revision_completed_history@1.0.0 queries only this exact event_type, schema_id/version
  from CV-592, and the authorized project/thread/bundle/revision. It explicitly adopts SP-278 and reuses the existing
  projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0; their physical checkpoint
  is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  and lookup rows are event_record_index.v2 in the current selected generation. Complete source coverage, exact
  root/generation/frontier and actual live ten-field read token must be verified in one read transaction. The generic
  projector alone advances its existing checkpoint and index rows atomically by predecessor CAS, including nonmatching
  source rows; max matching sequence is never coverage. This family owns no filtered durable checkpoint, projection
  or copied body; SP-579 separately materializes its existing original source inventory. No stored read token is
  added; any future durable token must use DL-076''s nine-field projection with no persisted redb_snapshot_id. Consumer
  output is disposable authorized history, not runner state. Source expiry/deletion is a truthful unavailable result;
  never rebuild a document or grant access from history.


  Original document, annotation and revision evidence remain with ACD-049/050, Storage revision_run.v1 and FileSafe.
  Reads recheck current permissions and actual deletion/availability of every reference. Event bodies contain identifiers,
  capability metadata and refs only; no annotations, prompt, secret or document text. Coherent backup includes source
  evidence, original full-value receipt custody and seglog at the same admitted restore boundary; unresolved source/receipt
  skew fences dependent success. Redaction never grants reference access or rewrites original identity.


  Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «retention_policy_ref=PENDING_RETENTION_DECISION.»Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): « Candidate classes are Case L-3 receipt/audit
  authority/source lineage versus Chat content for this Deep Plan review history; no exact family assignment is
  established.» Event lifetime and original source bodies are independent. No TTL/count deletion or indefinite class
  selection is authorized by this draft. Existing generic index/checkpoint retains RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN
  unchanged.


  Withdrawal first cuts off new writer admission for bundle.revision_completed; drain or fence its pending append
  work under the original receipt gate, then withdraw reader.bundle_revision_completed_history@1.0.0 from dispatch.
  No history read or rebuild triggers revision, mutation or Multi-Pass Review. A replacement reader must explicitly
  support retained schemas and authenticate complete SP-278 rebuild/currentness before publication. Cutoff does
  not delete original events or reset the generic shared checkpoint, and does not withdraw siblings. Unsupported
  historical versions remain unavailable with evidence, never rewritten on read. Positive/negative static cases
  live in Plans/bundle_revision_event_fixtures.json; scripts/pm_bundle_revision_events.py checks this family''s
  own full envelope, schema, identity, source custody, terminal settlement and withdrawal predicates. Native append,
  lost acknowledgement, effect-unknown reconciliation, backup/restore, access/deletion, concurrent CAS, source gaps,
  cutoff/rebuild and retention-boundary obligations are authored NOT_RUN, and must be exercised on real adapters
  before native claims. For bundle.revision_completed specifically, SP-579 is adopted as the complete original revision_run
  physical source contract: validate its source slot, original intent/result, typed key, exclusive latest predecessor/value_revision
  CAS and independently authenticated full-value first receipt before publication. Its own producer uses dedupe_by_idempotency_key;
  same identity/digest returns the original full event and receipt, changed semantics conflicts, and unavailable
  dedupe proof refuses. Read replay never executes that writer. The full-envelope/source/terminal/cutoff/reader/rebuild
  static matrix is Plans/dcw_event_contract_fixtures.json, run through scripts/pm_bundle_revision_events.py; all
  normative cases are prepared, with native adapters NOT_RUN.


  PNC-019 s4r retention binding for `bundle.revision_completed` (2026-11-14).


  Event history `retention_policy_ref = RP-AUTHORITY-INDEFINITE@1.0.0`, under Plans/Decision_Log.md#DL-401.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): bundle.revision_completed@1.0.0 is registered for project_only in Plans/event_family_registry.json,
  as recorded by Plans/Decision_Log.md#DL-2227. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; Plans/storage-plan.md#SP-577
  owns the event policy''s existing anchors, counts, holds and deletion rules. Separate stored-value assignment:
  revision_run uses RP-CHAT-THREAD-LIFETIME@1.0.0 under Plans/Decision_Log.md#DL-508; this assigns that stored value,
  not event history. Original sources and coherent backups retain their independent owner policies; the event lifetime
  is not transferred to them. Current append/publication still requires the exact selected schema/scope, original
  custody, current permission, receipt and required producer adoption. Actual missing registration or unresolved
  required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice or governance
  seal follows.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-573
- CV-592
- SP-278
- SP-286
- SP-579
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «This exact family remains unadmitted until
  individual admission; no sibling inference».'
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-578 - Bundle Revision Interrupted Custody And History

```yaml
plan_unit_id: SP-578
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: '`bundle.revision_interrupted` explicitly adopts SP-286 and CV-339 including strict full-value v2
  resolution, SP-336/SP-347 durability classes, and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. NEW owner contract
  under DL-045: producer emitter.bundle_revision_interrupted@1.0.0 is the targeted revision runner governed by ACD-574.
  Before any append, require individual family admission and schema support, current project/thread/bundle permissions,
  exact source evidence and CV-593 identity. Freeze the prepared complete EventRecord after original source evidence
  is committed; append through Storage, then resolve the original full-value AppendReceipt before publishing the
  phase as recorded or starting dependent work. No in-memory notification, caller hash, stale currentness token
  or partially delivered receipt establishes success. Missing original after confirmed older restore stays unavailable;
  no replacement receipt or re-execution is inferred. An uncertain start/completion is reconciled with existing
  revision_run and FileSafe recovery evidence, never restarted by this history reader. A single started phase cannot
  settle both completed and interrupted; duplicate delivery returns the original immutable result, conflicting semantics
  fence.


  NEW passive consumer reader.bundle_revision_interrupted_history@1.0.0 queries only this exact event_type, schema_id/version
  from CV-593, and the authorized project/thread/bundle/revision. It explicitly adopts SP-278 and reuses the existing
  projector.storage.event_record_index@1.0.0 and reader.storage.event_record_index@1.0.0; their physical checkpoint
  is event_record_index_checkpoint.v1:{storage_instance_id}, value pm.storage_value.event_record_index_checkpoint.v1@1.0.0,
  and lookup rows are event_record_index.v2 in the current selected generation. Complete source coverage, exact
  root/generation/frontier and actual live ten-field read token must be verified in one read transaction. The generic
  projector alone advances its existing checkpoint and index rows atomically by predecessor CAS, including nonmatching
  source rows; max matching sequence is never coverage. This family owns no filtered durable checkpoint, projection
  or copied body; SP-579 separately materializes its existing original source inventory. No stored read token is
  added; any future durable token must use DL-076''s nine-field projection with no persisted redb_snapshot_id. Consumer
  output is disposable authorized history, not runner state. Source expiry/deletion is a truthful unavailable result;
  never rebuild a document or grant access from history.


  Original document, annotation and revision evidence remain with ACD-049/050, Storage revision_run.v1 and FileSafe.
  Reads recheck current permissions and actual deletion/availability of every reference. Event bodies contain identifiers,
  capability metadata and refs only; no annotations, prompt, secret or document text. Coherent backup includes source
  evidence, original full-value receipt custody and seglog at the same admitted restore boundary; unresolved source/receipt
  skew fences dependent success. Redaction never grants reference access or rewrites original identity.


  Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «retention_policy_ref=PENDING_RETENTION_DECISION.»Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): « Candidate classes are Case L-3 receipt/audit
  authority/source lineage versus Chat content for this Deep Plan review history; no exact family assignment is
  established.» Event lifetime and original source bodies are independent. No TTL/count deletion or indefinite class
  selection is authorized by this draft. Existing generic index/checkpoint retains RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN
  unchanged.


  Withdrawal first cuts off new writer admission for bundle.revision_interrupted; drain or fence its pending append
  work under the original receipt gate, then withdraw reader.bundle_revision_interrupted_history@1.0.0 from dispatch.
  No history read or rebuild triggers revision, mutation or Multi-Pass Review. A replacement reader must explicitly
  support retained schemas and authenticate complete SP-278 rebuild/currentness before publication. Cutoff does
  not delete original events or reset the generic shared checkpoint, and does not withdraw siblings. Unsupported
  historical versions remain unavailable with evidence, never rewritten on read. Positive/negative static cases
  live in Plans/bundle_revision_event_fixtures.json; scripts/pm_bundle_revision_events.py checks this family''s
  own full envelope, schema, identity, source custody, terminal settlement and withdrawal predicates. Native append,
  lost acknowledgement, effect-unknown reconciliation, backup/restore, access/deletion, concurrent CAS, source gaps,
  cutoff/rebuild and retention-boundary obligations are authored NOT_RUN, and must be exercised on real adapters
  before native claims. For bundle.revision_interrupted specifically, SP-579 is adopted as the complete original
  revision_run physical source contract: validate its source slot, original intent/result, typed key, exclusive
  latest predecessor/value_revision CAS and independently authenticated full-value first receipt before publication.
  Its own producer uses dedupe_by_idempotency_key; same identity/digest returns the original full event and receipt,
  changed semantics conflicts, and unavailable dedupe proof refuses. Read replay never executes that writer. The
  full-envelope/source/terminal/cutoff/reader/rebuild static matrix is Plans/dcw_event_contract_fixtures.json, run
  through scripts/pm_bundle_revision_events.py; all normative cases are prepared, with native adapters NOT_RUN.


  PNC-019 s4r retention binding for `bundle.revision_interrupted` (2026-11-14).


  Event history `retention_policy_ref = RP-AUTHORITY-INDEFINITE@1.0.0`, under Plans/Decision_Log.md#DL-401.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  Exact stored value `revision_run` retains `RP-CHAT-THREAD-LIFETIME@1.0.0` under DL-508; this does not assign its
  referenced bodies or other values.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): bundle.revision_interrupted@1.0.0 is registered for project_only in
  Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2228. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0;
  Plans/storage-plan.md#SP-578 owns the event policy''s existing anchors, counts, holds and deletion rules. Separate
  stored-value assignment: revision_run uses RP-CHAT-THREAD-LIFETIME@1.0.0 under Plans/Decision_Log.md#DL-508; this
  assigns that stored value, not event history. Original sources and coherent backups retain their independent owner
  policies; the event lifetime is not transferred to them. Current append/publication still requires the exact selected
  schema/scope, original custody, current permission, receipt and required producer adoption. Actual missing registration
  or unresolved required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice
  or governance seal follows.'
gui_related: false
gui_classification_reason: Defines event semantics and persistence, without changing presentation.
depends_on:
- ACD-574
- CV-593
- SP-278
- SP-286
- SP-579
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «This exact family remains unadmitted until
  individual admission; no sibling inference».'
- Static contract fixtures pass; native execution remains NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw
implementation_surfaces:
- Plans/storage-plan.md
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


### SP-579 - Original Targeted Revision Source And Receipt Composition

```yaml
plan_unit_id: SP-579
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEW original source contract under DL-045 for the existing targeted-revision source, not an event-family
  admission. revision_run.v1:{bundle_id}:{revision_id} now has the complete closed value pm.storage_value.revision_run.v1@1.0.0
  in Plans/dcw/revision_run.schema.json. Storage owns the canonical MessagePack value in protected redb; the key
  is the typed tuple (revision_run.v1,bundle_id,revision_id), with the colon form diagnostic only, never an ambiguous
  concatenation. This extracts only revision_run from github_bundle_note_preview_browser_families; the other deferred
  inventory remains deferred. This concrete edition governs new targeted Deep Plan writes; the conceptual SP-121
  fields remain source lineage. Existing trigger, note_reply_index, requested/effective capability, ordered annotations,
  FileChange evidence, creation time and ACD-050 interruption/resume history survive. changes and note_reply_index
  are bounded original FileChange/NoteReply evidence refs; their original values stay in their existing owner custody,
  never fabricated from the event.


  The actual existing document-review request handler owns accepted_request intent; the targeted revision runner
  owns start_authorized, completed and interrupted results. Each source phase stores phase_sequence, exact event_type,
  source_ref, predecessor_event_id, immutable intent_ref, original result and complete prepared EventRecord; result
  holds source document identity/version/SHA-256, actual output document and annotation-outcome refs, safe point
  and original instant. source_ref is revision_run_phase: plus SHA-256 of compact UTF-8 JSON [bundle_id,revision_id,phase_sequence].
  Source result.kind must respectively be accepted_request, start_authorized, completed or interrupted. Completed
  requires nonempty validated output refs and annotation outcomes; interrupted preserves actual safe point/outcomes
  without fabricating completed output. The request trigger for these four writers is resubmit. Intent and results
  are original owner-issued facts, not copied history-reader claims. Authenticate the actual project/thread/bundle/document
  version and permission snapshot plus each eligible durable annotation and FileSafe outcome before reserving a
  phase. The original document hash and ref must resolve independently through the document owner before any mutation.


  Serialize the source writer by actual Storage instance, recovery epoch and typed source key. A redb transaction
  compare-and-swaps value_revision and the exact latest phase; request allocates sequence zero only once, start
  follows the receipted request or receipted interruption, and completed/interrupted reserve the same started predecessor
  exclusively. Append one immutable phase slot before append; never replace or branch that slot after a crash. A
  pending slot fences later phases. completed and interrupted cannot both settle one start; a receipted completed
  revision never reopens. An interrupted revision can resume only through ACD-050 explicit recovery with its original
  revision_id and next phase; it does not replay earlier effects. Sequence allocation and original source result
  commit precede append. Storage assigns the complete EventRecord storage fields under its held append gate before
  first issuance; producer semantic fields remain immutable. No cross-store transaction is assumed.


  Each slot starts publication=prepared with no successful first receipt. SP-286/CV-339 full-value v2 resolution
  authenticates the exact original complete event, original_event_value_commitment, original_segment_ref and unchanged
  eleven-field AppendReceipt. Then a source-key/value_revision CAS attaches that original proof and marks receipted;
  only then may owner phase publication/dependent work proceed. Enforce matching event_id and sequence_id, synced
  receipt, correct durable group/generation/watermark, selected Storage instance and original commitment. A crash
  before append resumes the same prepared slot; append with lost acknowledgement resolves original custody and commits
  the same receipt once; crash after source receipt commit returns it. Unknown external effect, missing proof, conflicting
  full-value bytes or lost custody fences instead of running again or synthesizing success. The source result is
  independent of its later event receipt, so there is no circular source-success test.


  Original source values are non-rebuildable and mandatory coherent backup authority with original documents, annotations,
  FileSafe results, immutable intent/results, seglog identity/dedupe and SP-286 custody. Restore admits one verified
  Storage instance/recovery epoch/boundary; source, complete event, receipt and document version hashes must agree
  at that boundary. A source ahead of seglog, receipt ahead of source, missing required original, epoch mismatch,
  partial group or unverifiable boundary yields unavailable and fences mutation/publication. A confirmed older restore
  preserves covered exact originals; it cannot mint a new source slot or replay missing post-backup effects. Current
  source access/deletion is rechecked at read and recovery. Unavailable bodies remain unavailable; refs do not grant
  access. Retirement never deletes source evidence or clears permanent identities. Legacy values without this complete
  evidence remain read-only compatibility; no guessed copy-forward or receipt backfill. A coordinator may adopt
  only actual complete original evidence after independent equality and restore validation. Unsupported versions
  fence. Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «retention_policy_ref=PENDING_RETENTION_DECISION»
  with Case L-3 receipt/audit/source-lineage versus Chat-content candidates; extraction grants no TTL or indefinite
  retention. SP-340 places revision_run in the canonical redb file, runs_and_goals storage group with its existing
  4 GiB advisory canonical budget, and max_value_bytes=16384. SP-337 governs larger sources. The closed schema selects
  #/$defs/inline for a complete source of at most 16384 canonical MessagePack bytes, or #/$defs/payload_reference
  at the same typed key for the exact complete original source bytes in a content-addressed pack. The reference
  carries the unchanged schema identity, Storage instance, recovery_epoch, value_revision, exact source_key and
  source_payload_ref with a 64-character lowercase-hex BLAKE3 id, byte_size and application/vnd.puppetmaster.revision-run+msgpack
  media_type. Resolved bytes must decode to the closed inline source and agree with every reference/key/identity
  field. Payload bytes and their index are durable before the reference commit, append or publication. Missing,
  unreadable, corrupt, wrong-size/type, undurable or substituted payloads fence; a direct redb value over 16384
  bytes is refused. The same key/value_revision CAS covers either representation. Coherent backup and verified restore
  include the physical source row plus its reachable pack/index and all original source/event/receipt dependencies
  at one boundary; the source inventory hash commits the physical canonical MessagePack row, never a restamped decoded
  replacement. No truncation, split history or new lifetime is authorized. The canonical group budget is advisory,
  never a write refusal or source-pruning trigger. Exact 16384-byte inline and 16385-byte referenced sources pass;
  a 16385-byte direct value and invalid references fail through the full checker. No native implementation or buildability
  follows. A verified restore preserves original source/receipt bytes and their original source recovery_epoch.
  If the selected current epoch is newer, mutation or successful publication additionally requires the actual SP-286/CV-339
  restore_admission covering every dependent original event plus the existing verified backup manifest inventory
  covering the exact typed source key and SHA-256 of its canonical MessagePack source value; a caller-supplied epoch/hash
  cannot authorize that binding. Missing admission, source inventory or exact original receipt coverage fences.
  No original is restamped to the current epoch. Passive history resolves its exact original phase by source_ref
  even when later source phases exist; it never requires an earlier event to become the mutable latest phase. The
  complete immutable original request intent is embedded as intent in the same revision_run value: project/thread/bundle/revision,
  trigger, ordered annotations, requested/effective capability, permission snapshot, authenticated actor, exact
  source-document ref/version/hash and original accepted_at. Every phase intent_ref resolves to that exact embedded
  intent and its independently authenticated original owner observation; it is not an unresolved generic receipt
  or another deferred store. The source edition introduces no replacement annotation/document body authority. Existing
  source access, eligibility and FileSafe checks remain required before original acceptance; history cannot recreate
  unavailable bodies.'
gui_related: false
gui_classification_reason: Defines original event/source custody and read contracts, without a presentation change.
depends_on:
- SP-286
- CV-339
- ACD-049
- ACD-050
unblocks: []
acceptance_criteria:
- 'Prepared without family admission; Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «retention
  remains PENDING_RETENTION_DECISION».'
- The complete positive and negative static oracles pass; native execution is NOT_RUN.
validation_surfaces:
- python3 scripts/pm_bundle_revision_events.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody
reasoning_tier: high
context_scope: event_authority_wave2_dcw_fix1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- revision_run.v1
- SP-286
- CV-339
- PENDING_RETENTION_DECISION
negative_constraints:
- No event admission, retention choice, new UI behavior, native execution claim or governance seal.
```



Current selected assignment (2026-11-19): bundle.revision_completed@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2227. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.

Current selected assignment (2026-11-19): bundle.revision_interrupted@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2228. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.

Current selected assignment (2026-11-19): bundle.revision_requested@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2229. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.

Current selected assignment (2026-11-19): bundle.revision_started@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2230. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### Wizard Opened Original Custody

For this exact source family, SP-340 binds the canonical redb file, runs_and_goals storage group and its existing 4 GiB advisory canonical budget, with max_value_bytes=16384. The closed source schema selects #/$defs/inline for at most 16384 canonical MessagePack bytes, or #/$defs/payload_reference at the same typed source key for SP-337 overflow. That closed reference retains schema identity, Storage instance, recovery_epoch, value_revision, exact source_key and source_payload_ref (64-character lowercase-hex BLAKE3 id, byte_size, media_type=application/vnd.puppetmaster.wizard-open-evidence+msgpack). It resolves the exact complete original canonical MessagePack source, validated against #/$defs/inline and every original identity/key field. Pack bytes and their index are durable before the reference commit, event append or publication; absent, unreadable, corrupt, wrong-size/type, undurable or substituted payloads fence. A direct redb value over 16384 bytes is refused. Both representations use the existing typed-key/value_revision CAS. Mandatory coherent backup/restore includes the physical row, reachable payload pack/index and the original source/event/receipt dependencies at one verified boundary; the source inventory hash commits the physical canonical MessagePack row. The group budget is advisory and cannot refuse canonical writes or prune history. This changes no retention/deletion policy, original source bytes or event payload. Full-checker positives cover exactly 16384 inline bytes and 16385 referenced bytes; negatives cover 16385 direct bytes and invalid references.

NEW original source and event custody contract for `wizard.opened` alone, under DL-045, adopting PWIZ-097 and CV-594. Storage holds `wizard_open_evidence.v1:{project_id}:{planning_run_id}:{request_id}` as a typed key tuple in canonical protected redb, with complete closed value `pm.storage_value.wizard_open_evidence.v1@1.0.0` from `Plans/dcw/wizard_open_evidence.schema.json`. This source is separately materialized in storage_value_registry.json; it is not a disposable projection or a generic deferred receipt. The producer `emitter.wizard_opened@1.0.0` writes the original request, actual child snapshot, canonical seed descriptor and original `opened` result before event append. Original source_ref is `wizard_open_evidence:` plus the CV-594 identity digest. All ref-only snapshots join the same real Project, PlanningRun, Named Plan, thread group and actual intake child; original request/result/seed/child owner evidence must independently resolve. The source descriptor preserves immutable seed version/hash, warnings, lineage, bounded work-intent axes and current project-context snapshot/hash. No raw payload body is copied. Current permission, child revision/hash and seed/context currentness are validated under the existing owner admission gate at reservation; historical reads later preserve those original facts while independently rechecking current access and deletion.

Observe the existing successful open result for the real Project and actual current PlanningRun intake child, after owner route/currentness and permission validation. Opening is not proof of seed acceptance; a route click, attempt or failed open emits nothing. predecessor_event_id is null. This event never creates or selects a child on replay. A serialized Storage-instance/recovery-epoch/typed-key writer compare-and-swaps value_revision and inserts one immutable prepared source for the request. Same request/body returns it; conflicting body fences. Freeze the entire original semantic envelope before Storage append; Storage binds its assigned fields under its gate. This family explicitly adopts SP-286/CV-339 full-value v2 receipt resolution, SP-336/SP-347 durability and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. Order is exact-family admission/current owner guards, original source/result commit, normal append using dedupe_by_idempotency_key, original full-value receipt resolution, source proof CAS, then recorded-event/dependent publication. No cross-store atomic transaction is claimed. Attach the original unchanged eleven-field AppendReceipt, original_segment_ref and original_event_value_commitment; event/sequence, synced group/watermark, full-value equality and actual selected Storage instance must all agree. Pending source rows cannot claim recorded success. Crash before append retries the same frozen event; lost acknowledgement resolves its original receipt; crash after receipt attachment returns it without reopening or loading again. Unknown effects, missing source/custody or changed bytes fence, never invent a result or receipt.

Mandatory coherent backup includes this non-rebuildable source, original command/child/seed/context evidence, seglog permanent identities and SP-286 original full-value receipt custody at one verified boundary. Restore validates Storage instance, recovery epoch, original refs, hashes and complete event/receipt joins; missing originals, source/receipt skew, an unissued group, partial backup or stale epoch fences mutation and successful publication. A confirmed older restore does not replay a lost post-backup action. Incomplete legacy evidence is compatibility-read only and cannot be upgraded by inference. Source refs require current access/deletion checks; unavailable sources return truthful unavailable. No history read recreates a Project, child or seed, grants access, approves/builds or dispatches work. There is no automatic source deletion; Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «retention_policy_ref=PENDING_RETENTION_DECISION», with Case L-3 receipt/audit/source-lineage versus planning/chat-content candidates.

The independent passive consumer is `reader.wizard_opened_history@1.0.0`, selecting only this exact event/schema/version and authorized actual Project/PlanningRun/child/request. It explicitly adopts SP-278, `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` and `pm.storage_value.event_record_index_checkpoint.v1@1.0.0`. The generic projector atomically commits index rows and its prior-value-CAS checkpoint over complete source coverage including nonmatching rows; max matching sequence is never coverage. The reader verifies root/generation/frontier and the actual live ten-field read token in one read transaction. Any durable token is DL-076's nine-field projection without persisted redb_snapshot_id. No family-specific durable cursor/projection is created. Existing RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN assignments remain. Reads and rebuilds are effect-free; compatibility projector_replay_only cannot append or run the owner.

Withdrawal cuts off this exact writer admission first, drains or fences pending original slots under their original receipt gates, then withdraws `reader.wizard_opened_history@1.0.0` from dispatch. No sibling withdrawal, permanent-identity reset or source deletion follows. A replacement reader explicitly supports retained schemas and authenticates complete SP-278 coverage/current root/generation/frontier before publication; gaps, stale CAS/tokens, unsupported versions, lost permission or withdrawn reader refuse without advancement. Partial rebuild is never current. Positive/negative full-envelope, source/receipt, admission, lost-ack, currentness, terminal, compatibility and withdrawal/rebuild cases are independently authored for `wizard.opened` in Plans/dcw_event_contract_fixtures.json; scripts/pm_bundle_revision_events.py runs them. Real native adapters remain NOT_RUN. Neither a static pass nor these source schemas installs a writer, admits a family or authorizes a runtime.


A verified restore preserves original source/receipt bytes and their original source recovery_epoch. If the selected current epoch is newer, mutation or successful publication additionally requires the actual SP-286/CV-339 restore_admission covering every dependent original event plus the existing verified backup manifest inventory covering the exact typed source key and SHA-256 of its canonical MessagePack source value; a caller-supplied epoch/hash cannot authorize that binding. Missing admission, source inventory or exact original receipt coverage fences. No original is restamped to the current epoch.


Current selected assignment (2026-11-19): wizard.deferred_payload.loaded@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2430. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.

Current selected assignment (2026-11-19): wizard.opened@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2431. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### Wizard Deferred Payload Loaded Original Custody

For this exact source family, SP-340 binds the canonical redb file, runs_and_goals storage group and its existing 4 GiB advisory canonical budget, with max_value_bytes=16384. The closed source schema selects #/$defs/inline for at most 16384 canonical MessagePack bytes, or #/$defs/payload_reference at the same typed source key for SP-337 overflow. That closed reference retains schema identity, Storage instance, recovery_epoch, value_revision, exact source_key and source_payload_ref (64-character lowercase-hex BLAKE3 id, byte_size, media_type=application/vnd.puppetmaster.wizard-seed-load-evidence+msgpack). It resolves the exact complete original canonical MessagePack source, validated against #/$defs/inline and every original identity/key field. Pack bytes and their index are durable before the reference commit, event append or publication; absent, unreadable, corrupt, wrong-size/type, undurable or substituted payloads fence. A direct redb value over 16384 bytes is refused. Both representations use the existing typed-key/value_revision CAS. Mandatory coherent backup/restore includes the physical row, reachable payload pack/index and the original source/event/receipt dependencies at one verified boundary; the source inventory hash commits the physical canonical MessagePack row. The group budget is advisory and cannot refuse canonical writes or prune history. This changes no retention/deletion policy, original source bytes or event payload. Full-checker positives cover exactly 16384 inline bytes and 16385 referenced bytes; negatives cover 16385 direct bytes and invalid references.

NEW original source and event custody contract for `wizard.deferred_payload.loaded` alone, under DL-045, adopting PWIZ-098 and CV-595. Storage holds `wizard_seed_load_evidence.v1:{project_id}:{planning_run_id}:{request_id}` as a typed key tuple in canonical protected redb, with complete closed value `pm.storage_value.wizard_seed_load_evidence.v1@1.0.0` from `Plans/dcw/wizard_seed_load_evidence.schema.json`. This source is separately materialized in storage_value_registry.json; it is not a disposable projection or a generic deferred receipt. The producer `emitter.wizard_deferred_payload_loaded@1.0.0` writes the original request, actual child snapshot, canonical seed descriptor and original `seed_loaded` result before event append. Original source_ref is `wizard_seed_load_evidence:` plus the CV-595 identity digest. All ref-only snapshots join the same real Project, PlanningRun, Named Plan, thread group and actual intake child; original request/result/seed/child owner evidence must independently resolve. The source descriptor preserves immutable seed version/hash, warnings, lineage, bounded work-intent axes and current project-context snapshot/hash. No raw payload body is copied. Current permission, child revision/hash and seed/context currentness are validated under the existing owner admission gate at reservation; historical reads later preserve those original facts while independently rechecking current access and deletion.

Observe the existing successful acceptance/loading result of one PWIZ-001 canonical seed into the actual current PlanningRun intake child. The original successful open event and its exact first receipt must already resolve; predecessor_event_id is that wizard.opened event for the same original request, child, Project, Named Plan, seed and context. Loading is distinct from opening; route-open, a stale seed, unsupported raw legacy payload or failed load emits nothing. Receipt-backed acceptance is not a compile/approval/execution grant. A serialized Storage-instance/recovery-epoch/typed-key writer compare-and-swaps value_revision and inserts one immutable prepared source for the request. Same request/body returns it; conflicting body fences. Freeze the entire original semantic envelope before Storage append; Storage binds its assigned fields under its gate. This family explicitly adopts SP-286/CV-339 full-value v2 receipt resolution, SP-336/SP-347 durability and Case L-2/SP-026/SP-236 SeglogFrameV2 bytes. Order is exact-family admission/current owner guards, original source/result commit, normal append using dedupe_by_idempotency_key, original full-value receipt resolution, source proof CAS, then recorded-event/dependent publication. No cross-store atomic transaction is claimed. Attach the original unchanged eleven-field AppendReceipt, original_segment_ref and original_event_value_commitment; event/sequence, synced group/watermark, full-value equality and actual selected Storage instance must all agree. Pending source rows cannot claim recorded success. Crash before append retries the same frozen event; lost acknowledgement resolves its original receipt; crash after receipt attachment returns it without reopening or loading again. Unknown effects, missing source/custody or changed bytes fence, never invent a result or receipt.

Mandatory coherent backup includes this non-rebuildable source, original command/child/seed/context evidence, seglog permanent identities and SP-286 original full-value receipt custody at one verified boundary. Restore validates Storage instance, recovery epoch, original refs, hashes and complete event/receipt joins; missing originals, source/receipt skew, an unissued group, partial backup or stale epoch fences mutation and successful publication. A confirmed older restore does not replay a lost post-backup action. Incomplete legacy evidence is compatibility-read only and cannot be upgraded by inference. Source refs require current access/deletion checks; unavailable sources return truthful unavailable. No history read recreates a Project, child or seed, grants access, approves/builds or dispatches work. There is no automatic source deletion; Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «retention_policy_ref=PENDING_RETENTION_DECISION», with Case L-3 receipt/audit/source-lineage versus planning/chat-content candidates.

The independent passive consumer is `reader.wizard_deferred_payload_loaded_history@1.0.0`, selecting only this exact event/schema/version and authorized actual Project/PlanningRun/child/request. It explicitly adopts SP-278, `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` and `pm.storage_value.event_record_index_checkpoint.v1@1.0.0`. The generic projector atomically commits index rows and its prior-value-CAS checkpoint over complete source coverage including nonmatching rows; max matching sequence is never coverage. The reader verifies root/generation/frontier and the actual live ten-field read token in one read transaction. Any durable token is DL-076's nine-field projection without persisted redb_snapshot_id. No family-specific durable cursor/projection is created. Existing RP-EVENT-INDEX-SOURCE/RP-PROJECTION-3GEN assignments remain. Reads and rebuilds are effect-free; compatibility projector_replay_only cannot append or run the owner.

Withdrawal cuts off this exact writer admission first, drains or fences pending original slots under their original receipt gates, then withdraws `reader.wizard_deferred_payload_loaded_history@1.0.0` from dispatch. No sibling withdrawal, permanent-identity reset or source deletion follows. A replacement reader explicitly supports retained schemas and authenticates complete SP-278 coverage/current root/generation/frontier before publication; gaps, stale CAS/tokens, unsupported versions, lost permission or withdrawn reader refuse without advancement. Partial rebuild is never current. Positive/negative full-envelope, source/receipt, admission, lost-ack, currentness, terminal, compatibility and withdrawal/rebuild cases are independently authored for `wizard.deferred_payload.loaded` in Plans/dcw_event_contract_fixtures.json; scripts/pm_bundle_revision_events.py runs them. Real native adapters remain NOT_RUN. Neither a static pass nor these source schemas installs a writer, admits a family or authorizes a runtime.


A verified restore preserves original source/receipt bytes and their original source recovery_epoch. If the selected current epoch is newer, mutation or successful publication additionally requires the actual SP-286/CV-339 restore_admission covering every dependent original event plus the existing verified backup manifest inventory covering the exact typed source key and SHA-256 of its canonical MessagePack source value; a caller-supplied epoch/hash cannot authorize that binding. Missing admission, source inventory or exact original receipt coverage fences. No original is restamped to the current epoch.


Current selected assignment (2026-11-19): wizard.deferred_payload.loaded@1.0.0 is registered for project_only in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2430. Its event history selects RP-AUTHORITY-INDEFINITE@1.0.0; exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### SP-550 - filesafe.command_denied persistence and read contract

```yaml
plan_unit_id: SP-550
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'filesafe.command_denied adopts SP-286 strict full-value custody and SP-278 generic index proof;
  storage.filesafe_command_denied_history_read.v1@1.0.0 is passive with none_required family checkpoint. Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «Project history adopts RP-OPERATIONAL-2555D
  (DL-422); application history remains PENDING_RETENTION_DECISION.»


  PNC-019 s4r retention binding for `filesafe.command_denied` (2026-11-14).


  Event history selects Application = RP-FILESAFE-BLOCKED-COMMAND-APPLICATION-2555D@1.0.0 (anchor_kind=creation,
  cardinality_scope=instance), Project = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project)
  as recorded by Plans/Decision_Log.md#DL-2301, under DL-422, DL-460.


  Use the existing policy object unchanged: {"anchor_kind": "terminal_transition", "cardinality_scope": "project",
  "expiry_action": "compact", "max_cardinality": 2000000, "overflow_action": "fail_closed", "ttl_seconds": 220752000}.


  Only an already owner-supported application edition selects `RP-FILESAFE-BLOCKED-COMMAND-APPLICATION-2555D@1.0.0`;
  Project records select the Project policy and never count in both allowances.


  Application counting, storage-pressure refusal, explicit separately confirmed Server-scoped authorized deletion,
  immediate hiding, 24-hour active-copy and 30-day backup purge, restore-before-disclosure tombstones and every
  independent protection follow DL-460 in full. Ordinary file/chat/Project deletion cannot delete this separate
  application history; this creates no application-wide wipe control.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): filesafe.command_denied@2.0.0 is registered for application_or_project
  in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2301. Its event history selects Application
  = RP-FILESAFE-BLOCKED-COMMAND-APPLICATION-2555D@1.0.0 (anchor_kind=creation, cardinality_scope=instance), Project
  = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project); Plans/storage-plan.md#SP-550
  owns the event policy''s existing anchors, counts, holds and deletion rules. Original sources and coherent backups
  retain their independent owner policies; the event lifetime is not transferred to them. Current append/publication
  still requires the exact selected schema/scope, original custody, current permission, receipt and required producer
  adoption. Actual missing registration or unresolved required custody refuses; native execution remains NOT_RUN.
  No native adoption, new retention choice or governance seal follows.'
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-422
- CV-550
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-422
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.command_denied` only.** `CV-550` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.command_denied` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.command_denied`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.command_denied", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_command_denied_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.command_denied` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — Card 2 item 2.a, DL-422 (review round 7).** Project-scoped `filesafe.command_denied` is seven-year troubleshooting history: `retention_policy_ref = RP-OPERATIONAL-2555D`, reusing the exact existing Storage registry object (fixed_ttl, terminal_transition, 220752000 seconds = 2,555 days, 2,000,000 records per Project, fail_closed overflow, hold_eligible, compact expiry). For this binding the terminal-transition anchor is the saved original refusal or startup-failure result at its first successful durable save, never a retry, reprocessing, recovery, later append or observation time. Expiry is inclusive at that anchor plus 2,555 days. Remove only expired entries that no investigation, active reference, recovery or backup protects; existing legal holds, preserved/recent-run, rollback and maintenance references still override eligibility. If full and no entry may expire, refuse new entries rather than evict an unexpired or protected row. The extra troubleshooting entry may disappear only after expiry and protection checks; its original approval or action result keeps its own lifetime. Supporting approvals, source snapshots and recovery logs retain their own policies. Jared answered "i approve all of it"; the presented deck maps approve all to option A. The accepted answer is landed in `Plans/Decision_Log.md#DL-422` (batch 1); this unit applies its exact option A and shared conditions. This applies exactly item 2.a and Card 2's shared conditions. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «It adds no counting or deletion rule for future entries outside Projects. **Application scope remains PENDING_RETENTION_DECISION and may not record this event until exact approved rules exist.** Exact remaining question: What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.command_denied` history?» A Project policy must not be inferred for it. No original body, snapshot, transaction, generic index or checkpoint lifetime is reopened.

**Withdrawal and rebuild.** Cut off new `filesafe.command_denied` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_command_denied_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.command_denied` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.command_denied`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.command_denied`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_command_denied.contract.json` and `CV-550` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «The static admission oracle still returns missing_event_registration for this exact family; Application PENDING_RETENTION_DECISION independently blocks application admission; Project retention is decided by DL-422.»

ContractRef: ContractName:Plans/Contracts_V0.md#CV-550, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.command_denied` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.



### SP-551 - filesafe.destructive_override_denied persistence and read contract

```yaml
plan_unit_id: SP-551
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'filesafe.destructive_override_denied adopts SP-286 strict full-value custody and SP-278 generic
  index proof; storage.filesafe_destructive_override_denied_history_read.v1@1.0.0 is passive with none_required
  family checkpoint. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «Project
  history adopts RP-AUTHORITY-INDEFINITE (DL-423); application history remains PENDING_RETENTION_DECISION.»


  PNC-019 s4r retention binding for `filesafe.destructive_override_denied` (2026-11-14).


  Event history selects Application = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null),
  Project = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null) as recorded by Plans/Decision_Log.md#DL-2302,
  under DL-423, DL-461.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Only an already owner-supported application edition selects `RP-AUTHORITY-INDEFINITE@1.0.0`; Project records select
  the Project policy and never count in both allowances.


  Application counting, storage-pressure refusal, explicit separately confirmed Server-scoped authorized deletion,
  immediate hiding, 24-hour active-copy and 30-day backup purge, restore-before-disclosure tombstones and every
  independent protection follow DL-461 in full. Ordinary file/chat/Project deletion cannot delete this separate
  application history; this creates no application-wide wipe control.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): filesafe.destructive_override_denied@2.0.0 is registered for application_or_project
  in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2302. Its event history selects Application
  = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null), Project = RP-AUTHORITY-INDEFINITE@1.0.0
  (anchor_kind=creation, cardinality_scope=null); Plans/storage-plan.md#SP-551 owns the event policy''s existing
  anchors, counts, holds and deletion rules. Original sources and coherent backups retain their independent owner
  policies; the event lifetime is not transferred to them. Current append/publication still requires the exact selected
  schema/scope, original custody, current permission, receipt and required producer adoption. Actual missing registration
  or unresolved required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice
  or governance seal follows.'
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-423
- CV-551
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-423
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_denied` only.** `CV-551` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.destructive_override_denied` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.destructive_override_denied`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.destructive_override_denied", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_destructive_override_denied_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.destructive_override_denied` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — Card 2 item 2.b, DL-423 (review round 7).** Project-scoped `filesafe.destructive_override_denied` is permanent proof of the request, refusal or failure: `retention_policy_ref = RP-AUTHORITY-INDEFINITE`, reusing the exact existing Storage registry object (indefinite, no TTL or count limit, fail_closed overflow, hold_eligible, no expiry action). It never expires by age or count, remains inspectable after seven years, and survives deletion of the file or chat it describes. Only explicit **Delete Puppet Master project data** removes this Project history under existing authorization, deletion and protection rules; **Remove project from list** does not delete that data. If space runs out, refuse new entries instead of dropping old ones. Supporting approvals, source snapshots and recovery logs retain their own lifetimes; permanent EventRecord proof grants no access to a deleted or inaccessible linked body. Jared answered "i approve all of it"; the presented deck maps approve all to option A. The accepted answer is landed in `Plans/Decision_Log.md#DL-423` (batch 1); this unit applies its exact option A and shared conditions. This applies exactly item 2.b and Card 2's shared conditions. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «It adds no counting or deletion rule for future entries outside Projects. **Application scope remains PENDING_RETENTION_DECISION and may not record this event until exact approved rules exist.** Exact remaining question: What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.destructive_override_denied` history?» A Project policy must not be inferred for it. No original body, snapshot, transaction, generic index or checkpoint lifetime is reopened.

**Withdrawal and rebuild.** Cut off new `filesafe.destructive_override_denied` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_destructive_override_denied_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.destructive_override_denied` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.destructive_override_denied`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.destructive_override_denied`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_destructive_override_denied.contract.json` and `CV-551` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «The static admission oracle still returns missing_event_registration for this exact family; Application PENDING_RETENTION_DECISION independently blocks application admission; Project retention is decided by DL-423.»

ContractRef: ContractName:Plans/Contracts_V0.md#CV-551, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.destructive_override_denied` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.



### SP-552 - filesafe.destructive_override_granted persistence and read contract

```yaml
plan_unit_id: SP-552
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: filesafe.destructive_override_granted adopts SP-286 strict full-value custody and SP-278 generic
  index proof; storage.filesafe_destructive_override_granted_history_read.v1@1.0.0 is passive with none_required
  family checkpoint. Event-history retention uses RP-AUTHORITY-INDEFINITE under the existing Case L-3 exact-kind
  default.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- CV-552
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_granted` only.** `CV-552` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.destructive_override_granted` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.destructive_override_granted`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.destructive_override_granted", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_destructive_override_granted_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.destructive_override_granted` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention.** `retention_policy_ref = RP-AUTHORITY-INDEFINITE` for this event history. Current Case L-3 (Approval, receipt, audit authority) supplies indefinite retention with no count eviction and storage pressure failing closed. CV-552 defines authenticated operator authorization, the original grant receipt and prerequisite audit; F2-052/F2-213 retain those premises. This is an existing exact-kind assignment, not a new deletion decision. Original source bodies, holds, snapshot records, generic index RP-EVENT-INDEX-SOURCE and checkpoint policies remain independently governed. No registry admission follows.

**Withdrawal and rebuild.** Cut off new `filesafe.destructive_override_granted` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_destructive_override_granted_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.destructive_override_granted` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.destructive_override_granted`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.destructive_override_granted`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_destructive_override_granted.contract.json` and `CV-552` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The static admission oracle still returns missing_event_registration for this exact family»; The resolved retention assignment does not supply registry admission or native adoption.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-552, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.destructive_override_granted` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.




Current selected assignment (2026-11-19): filesafe.destructive_override_granted@2.0.0 is registered for application_or_project in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2303. Its event history selects Application = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null), Project = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null); exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### SP-553 - filesafe.destructive_override_requested persistence and read contract

```yaml
plan_unit_id: SP-553
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'filesafe.destructive_override_requested adopts SP-286 strict full-value custody and SP-278 generic
  index proof; storage.filesafe_destructive_override_requested_history_read.v1@1.0.0 is passive with none_required
  family checkpoint. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «Project
  history adopts RP-AUTHORITY-INDEFINITE (DL-424); application history remains PENDING_RETENTION_DECISION.»


  PNC-019 s4r retention binding for `filesafe.destructive_override_requested` (2026-11-14).


  Event history selects Application = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null),
  Project = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null) as recorded by Plans/Decision_Log.md#DL-2304,
  under DL-424, DL-462.


  Use the existing policy object unchanged: {"anchor_kind": "creation", "cardinality_scope": null, "expiry_action":
  "none", "max_cardinality": null, "overflow_action": "fail_closed", "ttl_seconds": null}.


  Only an already owner-supported application edition selects `RP-AUTHORITY-INDEFINITE@1.0.0`; Project records select
  the Project policy and never count in both allowances.


  Application counting, storage-pressure refusal, explicit separately confirmed Server-scoped authorized deletion,
  immediate hiding, 24-hour active-copy and 30-day backup purge, restore-before-disclosure tombstones and every
  independent protection follow DL-462 in full. Ordinary file/chat/Project deletion cannot delete this separate
  application history; this creates no application-wide wipe control.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): filesafe.destructive_override_requested@2.0.0 is registered for application_or_project
  in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2304. Its event history selects Application
  = RP-AUTHORITY-INDEFINITE@1.0.0 (anchor_kind=creation, cardinality_scope=null), Project = RP-AUTHORITY-INDEFINITE@1.0.0
  (anchor_kind=creation, cardinality_scope=null); Plans/storage-plan.md#SP-553 owns the event policy''s existing
  anchors, counts, holds and deletion rules. Original sources and coherent backups retain their independent owner
  policies; the event lifetime is not transferred to them. Current append/publication still requires the exact selected
  schema/scope, original custody, current permission, receipt and required producer adoption. Actual missing registration
  or unresolved required custody refuses; native execution remains NOT_RUN. No native adoption, new retention choice
  or governance seal follows.'
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-424
- CV-553
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-424
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.destructive_override_requested` only.** `CV-553` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.destructive_override_requested` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.destructive_override_requested`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.destructive_override_requested", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_destructive_override_requested_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.destructive_override_requested` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — Card 2 item 2.c, DL-424 (review round 7).** Project-scoped `filesafe.destructive_override_requested` is permanent proof of the request, refusal or failure: `retention_policy_ref = RP-AUTHORITY-INDEFINITE`, reusing the exact existing Storage registry object (indefinite, no TTL or count limit, fail_closed overflow, hold_eligible, no expiry action). It never expires by age or count, remains inspectable after seven years, and survives deletion of the file or chat it describes. Only explicit **Delete Puppet Master project data** removes this Project history under existing authorization, deletion and protection rules; **Remove project from list** does not delete that data. If space runs out, refuse new entries instead of dropping old ones. Supporting approvals, source snapshots and recovery logs retain their own lifetimes; permanent EventRecord proof grants no access to a deleted or inaccessible linked body. Jared answered "i approve all of it"; the presented deck maps approve all to option A. The accepted answer is landed in `Plans/Decision_Log.md#DL-424` (batch 1); this unit applies its exact option A and shared conditions. This applies exactly item 2.c and Card 2's shared conditions. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «It adds no counting or deletion rule for future entries outside Projects. **Application scope remains PENDING_RETENTION_DECISION and may not record this event until exact approved rules exist.** Exact remaining question: What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.destructive_override_requested` history?» A Project policy must not be inferred for it. No original body, snapshot, transaction, generic index or checkpoint lifetime is reopened.

**Withdrawal and rebuild.** Cut off new `filesafe.destructive_override_requested` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_destructive_override_requested_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.destructive_override_requested` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.destructive_override_requested`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.destructive_override_requested`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_destructive_override_requested.contract.json` and `CV-553` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «The static admission oracle still returns missing_event_registration for this exact family; Application PENDING_RETENTION_DECISION independently blocks application admission; Project retention is decided by DL-424.»

ContractRef: ContractName:Plans/Contracts_V0.md#CV-553, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.destructive_override_requested` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.



### SP-554 - filesafe.guard_init_failed persistence and read contract

```yaml
plan_unit_id: SP-554
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'filesafe.guard_init_failed adopts SP-286 strict full-value custody and SP-278 generic index proof;
  storage.filesafe_guard_init_failed_history_read.v1@1.0.0 is passive with none_required family checkpoint. Historical
  preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «Project history adopts RP-OPERATIONAL-2555D
  (DL-425); application history remains PENDING_RETENTION_DECISION.»


  PNC-019 s4r retention binding for `filesafe.guard_init_failed` (2026-11-14).


  Event history selects Application = RP-FILESAFE-GUARD-FAILURE-APPLICATION-2555D@1.0.0 (anchor_kind=creation, cardinality_scope=instance),
  Project = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project) as recorded
  by Plans/Decision_Log.md#DL-2305, under DL-425, DL-463.


  Use the existing policy object unchanged: {"anchor_kind": "terminal_transition", "cardinality_scope": "project",
  "expiry_action": "compact", "max_cardinality": 2000000, "overflow_action": "fail_closed", "ttl_seconds": 220752000}.


  Only an already owner-supported application edition selects `RP-FILESAFE-GUARD-FAILURE-APPLICATION-2555D@1.0.0`;
  Project records select the Project policy and never count in both allowances.


  Application counting, storage-pressure refusal, explicit separately confirmed Server-scoped authorized deletion,
  immediate hiding, 24-hour active-copy and 30-day backup purge, restore-before-disclosure tombstones and every
  independent protection follow DL-463 in full. Ordinary file/chat/Project deletion cannot delete this separate
  application history; this creates no application-wide wipe control.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): filesafe.guard_init_failed@2.0.0 is registered for application_or_project
  in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2305. Its event history selects Application
  = RP-FILESAFE-GUARD-FAILURE-APPLICATION-2555D@1.0.0 (anchor_kind=creation, cardinality_scope=instance), Project
  = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project); Plans/storage-plan.md#SP-554
  owns the event policy''s existing anchors, counts, holds and deletion rules. Original sources and coherent backups
  retain their independent owner policies; the event lifetime is not transferred to them. Current append/publication
  still requires the exact selected schema/scope, original custody, current permission, receipt and required producer
  adoption. Actual missing registration or unresolved required custody refuses; native execution remains NOT_RUN.
  No native adoption, new retention choice or governance seal follows.'
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-425
- CV-554
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-425
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.guard_init_failed` only.** `CV-554` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.guard_init_failed` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.guard_init_failed`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.guard_init_failed", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_guard_init_failed_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.guard_init_failed` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — Card 2 item 2.d, DL-425 (review round 7).** Project-scoped `filesafe.guard_init_failed` is seven-year troubleshooting history: `retention_policy_ref = RP-OPERATIONAL-2555D`, reusing the exact existing Storage registry object (fixed_ttl, terminal_transition, 220752000 seconds = 2,555 days, 2,000,000 records per Project, fail_closed overflow, hold_eligible, compact expiry). For this binding the terminal-transition anchor is the saved original refusal or startup-failure result at its first successful durable save, never a retry, reprocessing, recovery, later append or observation time. Expiry is inclusive at that anchor plus 2,555 days. Remove only expired entries that no investigation, active reference, recovery or backup protects; existing legal holds, preserved/recent-run, rollback and maintenance references still override eligibility. If full and no entry may expire, refuse new entries rather than evict an unexpired or protected row. The extra troubleshooting entry may disappear only after expiry and protection checks; its original approval or action result keeps its own lifetime. Supporting approvals, source snapshots and recovery logs retain their own policies. Jared answered "i approve all of it"; the presented deck maps approve all to option A. The accepted answer is landed in `Plans/Decision_Log.md#DL-425` (batch 1); this unit applies its exact option A and shared conditions. This applies exactly item 2.d and Card 2's shared conditions. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «It adds no counting or deletion rule for future entries outside Projects. **Application scope remains PENDING_RETENTION_DECISION and may not record this event until exact approved rules exist.** Exact remaining question: What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.guard_init_failed` history?» A Project policy must not be inferred for it. No original body, snapshot, transaction, generic index or checkpoint lifetime is reopened.

**Withdrawal and rebuild.** Cut off new `filesafe.guard_init_failed` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_guard_init_failed_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.guard_init_failed` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.guard_init_failed`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.guard_init_failed`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_guard_init_failed.contract.json` and `CV-554` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «The static admission oracle still returns missing_event_registration for this exact family; Application PENDING_RETENTION_DECISION independently blocks application admission; Project retention is decided by DL-425.»

ContractRef: ContractName:Plans/Contracts_V0.md#CV-554, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.guard_init_failed` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.



### SP-555 - filesafe.path_denied persistence and read contract

```yaml
plan_unit_id: SP-555
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'filesafe.path_denied adopts SP-286 strict full-value custody and SP-278 generic index proof; storage.filesafe_path_denied_history_read.v1@1.0.0
  is passive with none_required family checkpoint. Historical preparation snapshot (2026-11-19, stale wording in
  received dfea17a6c4): «Project history adopts RP-OPERATIONAL-2555D (DL-426); application history remains PENDING_RETENTION_DECISION.»


  PNC-019 s4r retention binding for `filesafe.path_denied` (2026-11-14).


  Event history selects Application = RP-FILESAFE-DENIED-PATH-APPLICATION-2555D@1.0.0 (anchor_kind=creation, cardinality_scope=instance),
  Project = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project) as recorded
  by Plans/Decision_Log.md#DL-2306, under DL-426, DL-464.


  Use the existing policy object unchanged: {"anchor_kind": "terminal_transition", "cardinality_scope": "project",
  "expiry_action": "compact", "max_cardinality": 2000000, "overflow_action": "fail_closed", "ttl_seconds": 220752000}.


  Only an already owner-supported application edition selects `RP-FILESAFE-DENIED-PATH-APPLICATION-2555D@1.0.0`;
  Project records select the Project policy and never count in both allowances.


  Application counting, storage-pressure refusal, explicit separately confirmed Server-scoped authorized deletion,
  immediate hiding, 24-hour active-copy and 30-day backup purge, restore-before-disclosure tombstones and every
  independent protection follow DL-464 in full. Ordinary file/chat/Project deletion cannot delete this separate
  application history; this creates no application-wide wipe control.


  This paragraph supersedes earlier pending statements only for the exact assigned facets above. All independent
  source, receipt, referenced-body and backup lifetimes remain with their own owners. Legal/investigation holds,
  required references, recovery, rollback, maintenance, protected backups and latest-25-run protection override
  cleanup without granting access. No unexpired/protected eviction for space, no retry anchor renewal, no hold release,
  admission, native proof or governance clearance is granted.



  Current selected assignment (2026-11-19): filesafe.path_denied@2.0.0 is registered for application_or_project
  in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2306. Its event history selects Application
  = RP-FILESAFE-DENIED-PATH-APPLICATION-2555D@1.0.0 (anchor_kind=creation, cardinality_scope=instance), Project
  = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project); Plans/storage-plan.md#SP-555
  owns the event policy''s existing anchors, counts, holds and deletion rules. Original sources and coherent backups
  retain their independent owner policies; the event lifetime is not transferred to them. Current append/publication
  still requires the exact selected schema/scope, original custody, current permission, receipt and required producer
  adoption. Actual missing registration or unresolved required custody refuses; native execution remains NOT_RUN.
  No native adoption, new retention choice or governance seal follows.'
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-426
- CV-555
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-426
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `filesafe.path_denied` only.** `CV-555` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.path_denied` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.path_denied`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.path_denied", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_path_denied_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.path_denied` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — Card 2 item 2.e, DL-426 (review round 7).** Project-scoped `filesafe.path_denied` is seven-year troubleshooting history: `retention_policy_ref = RP-OPERATIONAL-2555D`, reusing the exact existing Storage registry object (fixed_ttl, terminal_transition, 220752000 seconds = 2,555 days, 2,000,000 records per Project, fail_closed overflow, hold_eligible, compact expiry). For this binding the terminal-transition anchor is the saved original refusal or startup-failure result at its first successful durable save, never a retry, reprocessing, recovery, later append or observation time. Expiry is inclusive at that anchor plus 2,555 days. Remove only expired entries that no investigation, active reference, recovery or backup protects; existing legal holds, preserved/recent-run, rollback and maintenance references still override eligibility. If full and no entry may expire, refuse new entries rather than evict an unexpired or protected row. The extra troubleshooting entry may disappear only after expiry and protection checks; its original approval or action result keeps its own lifetime. Supporting approvals, source snapshots and recovery logs retain their own policies. Jared answered "i approve all of it"; the presented deck maps approve all to option A. The accepted answer is landed in `Plans/Decision_Log.md#DL-426` (batch 1); this unit applies its exact option A and shared conditions. This applies exactly item 2.e and Card 2's shared conditions. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «It adds no counting or deletion rule for future entries outside Projects. **Application scope remains PENDING_RETENTION_DECISION and may not record this event until exact approved rules exist.** Exact remaining question: What counting scope, capacity/overflow behavior and deletion/protection rules govern application-scoped `filesafe.path_denied` history?» A Project policy must not be inferred for it. No original body, snapshot, transaction, generic index or checkpoint lifetime is reopened.

**Withdrawal and rebuild.** Cut off new `filesafe.path_denied` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_path_denied_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.path_denied` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.path_denied`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.path_denied`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_path_denied.contract.json` and `CV-555` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, stale wording in received dfea17a6c4): «The static admission oracle still returns missing_event_registration for this exact family; Application PENDING_RETENTION_DECISION independently blocks application admission; Project retention is decided by DL-426.»

ContractRef: ContractName:Plans/Contracts_V0.md#CV-555, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.path_denied` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.



### SP-556 - filesafe.policy_degraded persistence and read contract

```yaml
plan_unit_id: SP-556
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: filesafe.policy_degraded adopts SP-286 strict full-value custody and SP-278 generic index proof;
  storage.filesafe_policy_degraded_history_read.v1@1.0.0 is passive with none_required family checkpoint. Event-history
  retention uses RP-OPERATIONAL-2555D@1.0.0 under the existing Case L-3 exact-kind default. Project records
  count in their Project partition. DL-2450 gives Application records one dedicated app:filesafe_policy_degraded
  bucket per Puppet Master Server.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-2450
- CV-556
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-2450
preserved_exact_tokens: []
negative_constraints:
- No event registry append or native admission. DL-2450 supplies the Application count only.
```

**Newly authored owner contract under DL-045 for `filesafe.policy_degraded` only.** `CV-556` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `filesafe.policy_degraded` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `filesafe.policy_degraded`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "filesafe.policy_degraded", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.filesafe_policy_degraded_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `filesafe.policy_degraded` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention.** Case L-3 supplies `RP-OPERATIONAL-2555D@1.0.0` for this non-authoritative advisory degradation history. CV-556 requires authoritative enforcement to stay intact. Project records keep the 2,555-day terminal-transition window and the 2,000,000 limit in their Project partition. Under DL-2450, Application records count in their family's own `app:filesafe_policy_degraded` bucket, one per Puppet Master Server. The Application bucket retains records for 2,555 days (220,752,000 seconds) from the existing terminal-transition anchor and admits at most 2,000,000 retained records. An append that would exceed the limit fails closed if no expired unheld member is eligible for compaction. Overflow neither evicts unexpired or held records nor borrows room from or refuses writes to another bucket. Original bodies, holds, generic index RP-EVENT-INDEX-SOURCE and checkpoint policies remain under their existing owners.

**Withdrawal and rebuild.** Cut off new `filesafe.policy_degraded` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.filesafe_policy_degraded_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `filesafe.policy_degraded` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `filesafe.policy_degraded`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `filesafe.policy_degraded`.** Adopt the complete source graph `Plans/filesafe_event_sources/filesafe_policy_degraded.contract.json` and `CV-556` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The static admission oracle still returns missing_event_registration for this exact family»; The resolved retention assignment does not supply registry admission or native adoption.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-556, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286

**Physical numbers and retained reads for `filesafe.policy_degraded` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.




Current selected assignment (2026-11-19): filesafe.policy_degraded@2.0.0 is registered for application_or_project in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2307. Its event history selects Application = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, count in app:filesafe_policy_degraded, one dedicated bucket per Puppet Master Server under DL-2450), Project = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project, count in the Project partition). The Application bucket retains records for 2,555 days (220,752,000 seconds) from the existing terminal-transition anchor and admits at most 2,000,000 retained records. An append that would exceed the limit fails closed if no expired unheld member is eligible for compaction. Overflow neither evicts unexpired or held records nor borrows room from or refuses writes to another bucket. Exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### SP-557 - safe_point.created persistence and read contract

```yaml
plan_unit_id: SP-557
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: safe_point.created adopts SP-286 strict full-value custody and SP-278 generic index proof; storage.safe_point_created_history_read.v1@1.0.0
  is passive with none_required family checkpoint. History adopts RP-RUNTIME-365D under DL-401 G28.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-401
- CV-557
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-401
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.created` only.** `CV-557` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `safe_point.created` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `safe_point.created`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "safe_point.created", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.safe_point_created_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `safe_point.created` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — DL-401 G28 (sweep part 1, R7-B1).** `safe_point.created` EventRecord history adopts `retention_policy_ref = RP-RUNTIME-365D`, the existing Run year policy: one year (31,536,000 seconds) after the actual run completes, up to 1,000,000 records per run and the applicable 5,000,000 records per Project, then history continues in a linked successor without dropping records early. Both Project and application safe points require their real run identity; an application run does not acquire a fabricated Project or Orchestrator identity, and the Project count applies only when there is a real Project. A running run has no completion expiry anchor. Legal holds, recovery anchors, the automatic keep on each Project's latest 25 runs, live references and backups override expiry; existing authorized retention extensions and rollback/maintenance protections remain. Retries, replay, recovery and observation do not reset run completion. This is the approved G28 row, "The 2 restore-point records: Run year," applied to the two original RT-G28 safe-point names, not to the separate Chat restore_point.* families. The source premises remain CV-557, FileSafe F2-213 and the required real run in the closed own payload. Released snapshot/body lifetimes and original restore journals remain separate under their existing policies. This binding decides no application-scope FileSafe security-event retention rule and grants no access to deleted or inaccessible bodies.

**Withdrawal and rebuild.** Cut off new `safe_point.created` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.safe_point_created_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `safe_point.created` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `safe_point.created`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `safe_point.created`.** Adopt the complete source graph `Plans/filesafe_event_sources/safe_point_created.contract.json` and `CV-557` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The static admission oracle still returns missing_event_registration for this exact family»; DL-401 G28 resolves this history classification; registry admission and native adoption remain separate prerequisites.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-557, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Decision_Log.md#DL-401

**Physical numbers and retained reads for `safe_point.created` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.




Current selected assignment (2026-11-19): safe_point.created@2.0.0 is registered for application_or_project in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2394. Its event history selects Application = RP-RUNTIME-365D@1.0.0 (anchor_kind=run_completion, cardinality_scope=run), Project = RP-RUNTIME-365D@1.0.0 (anchor_kind=run_completion, cardinality_scope=run); exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### SP-558 - safe_point.restored persistence and read contract

```yaml
plan_unit_id: SP-558
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: safe_point.restored adopts SP-286 strict full-value custody and SP-278 generic index proof; storage.safe_point_restored_history_read.v1@1.0.0
  is passive with none_required family checkpoint. History adopts RP-RUNTIME-365D under DL-401 G28.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation change.
depends_on:
- DL-045
- DL-401
- CV-558
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- 'Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The exact family remains unadmitted until
  independent admission».'
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-401
preserved_exact_tokens: []
negative_constraints:
- No event registry append, unapproved retention decision, or native admission.
```

**Newly authored owner contract under DL-045 for `safe_point.restored` only.** `CV-558` owns semantics and closed payload. A per-family search of current non-generated Plans Markdown/JSON (FileSafe, Contracts, Storage, Decision Log, central registries, payload and application resources) found partial semantic minima, but no exact versioned history-reader binding, identity recipe, SP-286 adoption or withdrawal protocol. Reuse existing `event_record_index` projector and SP-278 checkpoint; existing safe_point_record and safe_point_restore_transaction remain their own canonical/projection owners, not new EventRecord-derived mutation authority.

**Ordered producer and custody.** `safe_point.restored` explicitly adopts SP-286/CV-339 first-AppendReceipt custody, its strict full-value v2 successor, and SP-336/SP-347 current group-commit rules. First establish authentic accepted owner operation and immutable source (safe-point manifest/body record for creation; exact restore journal/equality outcome for restoration; checked guard decision or override request/receipt for security). Persist original intent and prepared full event before append. Use the ordinary SeglogFrameV2 append path; this safety record uses barrier durability. Append only after independent registry admission, settle original first receipt through full-value resolution, then publish dependent terminal receipt/outbox and allow any otherwise authorized continuation. A denied operation stays denied even if audit append is unavailable. No grant or mutation proceeds on an unacknowledged prerequisite. Missing source/receipt/dedupe fences rather than reconstructing an acknowledgement. On crash reconcile the same original operation and SP-286 custody before dispatch; never append replacement history for uncertain issued work.

**Identity and replay.** In Project scope set idempotency_key to `filesafe@2:` + lowercase hex(UTF-8 operation_id); in application scope use CV-366 exactly: `application@1:` + hex(UTF-8 server_id) + `:` + hex(UTF-8 operation_id). Storage lifetime dedupe tuple is (scope_partition, exact event_type `safe_point.restored`, idempotency_key), with Project partition using Storage's reversible project~base64url rule. event_id is `evt_df_` + SHA-256 hex of RFC8785 JSON array ["df-event-v2", scope_partition, "safe_point.restored", idempotency_key]. Use CV-339 producer_semantic_digest over the complete semantic envelope, not payload alone. Equal identity/equal digest resolves original full EventRecord and first receipt; unequal digest is a conflict. A missing authoritative dedupe mapping is dedupe_unavailable with zero effect. Replay never reruns a command, initializes a guard, requests/grants an override, captures a snapshot, restores paths, changes a hold or renews an expiry.

**Exact consumer and checkpoint.** `storage.safe_point_restored_history_read.v1@1.0.0` is the existing FileSafe event-history inspection path's newly named ephemeral consumer. It reads only `safe_point.restored` from SP-278's `projector.storage.event_record_index@1.0.0`; the consumer adopts SP-278 by name including complete generic CURRENT-selected source proof and nine-field durable read token (no persisted redb_snapshot_id). family_checkpoint = none_required: this history reader persists no frontier or read model; every invocation starts with verified current generic coverage. Generic index and its existing checkpoint schema/key/value remain `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`; SP-278 owns atomic redb projection plus complete frontier CAS and durable generic token, rebuild and source generation fences. A read acquires a fresh live redb snapshot and validates all ten live-token fields against the nine stored fields, full generic coverage, source selection and supported payload before returning any row; stale/incomplete/withdrawn source returns unavailable. No guessed zero cursor, local checkpoint or sibling consumer substitutes. FileSafe/Executor mutation recovery uses the original manifest/journal/receipt owners, never this passive history consumer.

**Redaction and custody.** Snapshot bodies stay off-worktree under FileSafe's exact snapshot custody; SP-337 owns packed blobs and body addressing. Events contain only sanitized previews, non-secret identities, bounded reason/diagnostic text, refs and hashes: never raw command credentials, environment, file bytes or secret path material. Original guarded input stays only in its owner custody, not a second event body. FileSafe checks actor authorization and exact Host/root at admission and on every body read; hash/ref possession grants no access. Storage's coherent backup includes original source, source holds, seglog and SP-286 full-value receipt custody under the same backup/restore epoch. Restore of older state cannot recapture missing original work or replay effects. A deleted/inaccessible body is unavailable; history cannot recreate it or defeat a deletion/hold. No independent body deletion policy is authored.

**Retention — DL-401 G28 (sweep part 1, R7-B1).** `safe_point.restored` EventRecord history adopts `retention_policy_ref = RP-RUNTIME-365D`, the existing Run year policy: one year (31,536,000 seconds) after the actual run completes, up to 1,000,000 records per run and the applicable 5,000,000 records per Project, then history continues in a linked successor without dropping records early. Both Project and application safe points require their real run identity; an application run does not acquire a fabricated Project or Orchestrator identity, and the Project count applies only when there is a real Project. A running run has no completion expiry anchor. Legal holds, recovery anchors, the automatic keep on each Project's latest 25 runs, live references and backups override expiry; existing authorized retention extensions and rollback/maintenance protections remain. Retries, replay, recovery and observation do not reset run completion. This is the approved G28 row, "The 2 restore-point records: Run year," applied to the two original RT-G28 safe-point names, not to the separate Chat restore_point.* families. The source premises remain CV-558, FileSafe F2-213 and the required real run in the closed own payload. Released snapshot/body lifetimes and original restore journals remain separate under their existing policies. This binding decides no application-scope FileSafe security-event retention rule and grants no access to deleted or inaccessible bodies.

**Withdrawal and rebuild.** Cut off new `safe_point.restored` admissions first; reconcile prepared operations from original sources and original first receipts without a second effect. Fence `storage.safe_point_restored_history_read.v1@1.0.0` and every generic index generation whose admitted-type selection changes. Retain exact old schema dispatch and immutable historical records/custody. A successor reader activates only after a verified rebuild of the actual retained survivor set and atomic SP-278 generation publication/CAS. An unsupported schema/source, missing receipt or unresolved restore returns unavailable. No zero-cursor reset, sibling substitution, history rewrite, automatic deletion or fence clearance is permitted.

**Recovery and withdrawal authority for `safe_point.restored` (review round 1).** The durable original-operation journal starts pending at owner commit, before preparation, and remains pending until its original receipt and dependent terminal publication are reconciled. Crash discards volatile prepared/event/receipt caches; recovery restores them only from the durable phase and authoritative issued full value plus unchanged first receipt. Recovery refusal persists and fences terminal/outbox publication and every cached retry until explicit successful same-operation recovery. Each subsequent terminal/retry resolves complete SP-286 custody again; presence of an event key or an old memory receipt is insufficient. After issuance, retained duplicate resolution uses issued EventRecord/receipt custody independently of disposed original command, approval or mutation controls, and performs no domain reexecution. A body-dependent read can still be unavailable under its own owner policy.

For `safe_point.restored`, withdrawal captures an independently selected retained-source boundary with exact complete issued values/first receipts and source generation, before consulting the mutable survivor map. A caller-reduced set is not that boundary. Reader withdrawal refuses every pending owner commit, including pre-prepare commits. Rebuild must cover that complete boundary and verify each surviving full-value receipt; loss before rebuild or before cutoff is unavailable, never authenticated deletion or an empty set. Only independently authenticated owner removal evidence could change the retained boundary; this preparation supplies no deletion policy or synthetic removal permission. Publication rechecks complete coverage, the source generation and expected reader generation, then atomically publishes by SP-278 CAS. A racing source/reader generation or changed set keeps the fence. Native durable-source authenticity, removal proof and CAS remain specified_unimplemented/NOT_RUN.

**Exact original/issued joins for `safe_point.restored`.** Adopt the complete source graph `Plans/filesafe_event_sources/safe_point_restored.contract.json` and `CV-558` lifecycle table. Before append, resolve its own original source under the actual storage_instance_id/writer epoch and verify every body ref/hash. No family-owned new storage value is introduced: original domain custody and SP-286 custody remain their sole physical owners. Resolve retry by the lifetime tuple and CV-339 semantic digest; equal returns the original complete EventRecord, original_segment_ref, original_event_value_commitment and unchanged first AppendReceipt, including original acknowledged_at_utc. Different digest conflicts; dedupe or original source unavailable yields zero effect. A caller's re-encoded duplicate never becomes the original. A crash after owner commit but before append resumes that original prepared event only if absence of prior issuance is authoritative. A crash after append or receipt loss uses SP-286 full-value custody: intact issued authority returns the original; missing custody, covered torn frames, older-backup skew or unknown prior issue fences. A crash after receipt before terminal may publish only the same original terminal result; none of these paths reexecutes the domain action.

This family's checker cases in `Plans/filesafe_event_authority_fixtures.json` separately cover schema/source/envelope mismatch, wrong family/scope/Host/root/subject, forged source, missing body/receipt, conflicting retry, changed complete-value commitment, every ordered crash boundary and own writer/reader withdrawal with verified survivor rebuild. Historical preparation snapshot (2026-11-19, received 2bda6aeed0): «The static admission oracle still returns missing_event_registration for this exact family»; DL-401 G28 resolves this history classification; registry admission and native adoption remain separate prerequisites.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-558, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Decision_Log.md#DL-401

**Physical numbers and retained reads for `safe_point.restored` (sweep part 2B numbers).** Storage-assigned sequence, generation and offset integers keep their exact domains end to end under SP-1100: each schema integer slot is admitted by the shared CV-1100 exact-integer call within its own schema bounds, and physical bytes dispatch by purpose (EVENT_VALUE for the CV-339 full-value commitment, APP_PHYSICAL for application bodies) with no float narrowing, signed-zero erasure or lane ceiling; an integer outside a profile's encodable range refuses through its guard row instead of truncating. History reads, retries, recovery and rebuilds resolve every retained original through SP-1101's authenticated dispatcher over the sealed custody catalogue: the recorded write-time edition and frozen resource manifest select the frozen verifier, forged or downgraded custody resolves to no verifier, and current-writer number guards never run on retained bytes. The ordered custody, first-receipt and retention rules above are unchanged. CV-1101 is adopted: observed_at_utc and persisted_at_utc use date_time with the storage_utc_z profile, and every other timestamp this family validates uses date_time with the EventRecord profile. The SP-1101 frozen verifier checks retained originals with those profiles.


Current selected assignment (2026-11-19): safe_point.restored@2.0.0 is registered for application_or_project in Plans/event_family_registry.json, as recorded by Plans/Decision_Log.md#DL-2395. Its event history selects Application = RP-RUNTIME-365D@1.0.0 (anchor_kind=run_completion, cardinality_scope=run), Project = RP-RUNTIME-365D@1.0.0 (anchor_kind=run_completion, cardinality_scope=run); exact original and checkpoint bindings retain their existing Storage assignments. Registry membership supplies no producer adoption or native-installation proof. Missing-registration refusal applies only if the exact current registration is absent.
### SP-429 - Project goal.blocked identity custody and observation

```yaml
plan_unit_id: SP-429
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored goal.blocked v3 identity, SP-286 custody, original-body publication order and read-only
  none_required observation; no event-built Goal state. SP-1120/CV-1120 now define the original blocked source and
  resolver; actual installation/admission remains gated.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-203
- SP-286
- SP-287
- SP-278
unblocks: []
acceptance_criteria:
- Same original operation and semantic body resolve original receipts while Storage-only metadata differs.
- Project v3 and historical whole-v2 stay distinct; writer/reader withdrawal preserves custody.
- No family projection or durable checkpoint; SP-278 remains mandatory for event reads.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_blocked.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm_goal_own_b_oracles.py
risk_class: goal_event_authority
reasoning_tier: high
context_scope: sp-429_event_authority
implementation_surfaces:
- Plans/storage-plan.md
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
- Plans/storage-plan.md
```

**Newly authored exact-family owner contract under DL-045.** Search for `goal.blocked` in GRS-048/050/064, GREPLAY-004..010, SP-287, the old Known-37 recipe, CV-366, Goal source/custody schemas and live Plans found no current event recipe or passive reader for this successor; GRS-203 records the original-source gap. This unit supplies no writer installation.

**Identity and frozen input.** Let D be lowercase SHA-256 of RFC 8785 JCS of `["pm.goal.blocked.lifecycle.v1", "project", storage_instance_id, project_id, thread_id, goal_id, str(before_revision), continuation_id, owning_run_id, next_attempt_ref]`, with the original null next_attempt_ref retained as null. Event ID is `goal.blocked.v1:{D}`, idempotency key `goal.blocked.lifecycle.v1:{D}`. Each string is exact; no Unicode/whitespace normalization or final LF. The original continuation tuple, operation ID and body-mutation intent digest are frozen; a change is a new admitted operation, never an equal retry. CV-339's producer_semantic_digest covers exactly its enumerated caller fields and excludes sequence_id/observed_at_utc/persisted_at_utc. Normal append and retry reject projector_replay_only before dedupe. For equal selected identity/body, synchronously caught-up custody resolves the exact original event and SP-286 first receipt; differing body conflicts; unavailable proof appends nothing. No retry repeats a body mutation, provider call, notification, Usage charge or dispatch. This recipe supersedes the old v2 recipe only for this v3 Project successor, never an app key.

**Custody and publication.** Adopt SP-286 by name for first receipt, immutable complete producer input and independent original full-value commitment. GRS-203's body-before-event order and fenced unknown results are mandatory. The same exact body/control reservation key and ordinary revision/currentness are used across host owners; no second Goal state machine or event-built body exists. SP-287 owns canonical body/history/origin/control and body receipt; Storage owns original EventRecord/first receipt. Coherent backup/identity-preserving restore preserves their joins and original terminal meaning, not guessed current state. Original event/dedupe/receipt authority remains RP-AUTHORITY-INDEFINITE@1.0.0; body and source content retain DL-047 bound-thread lifetime and referenced evidence retains its actual owner clock. Refs create no hold. Current read permission, tombstones, legal holds and reject-unhandled-secrets remain mandatory. A missing original receipt/source is unavailable, not reconstructed from a projection. Inline payloads are capped at 16 KiB by SP-337; oversized body values use its BLAKE3/byte-size/media-type payload-reference ownership, never raw embedded objective/output. This prepared event is bounded metadata; a missing exact payload-reference resolution contract refuses that edition rather than inventing an encoding.

**Consumers and exact checkpoint disposition.** Current Activity/body/history/continuation consume `reader.goal.body@1.0.0` and `reader.goal.objective_history@1.0.0` under GRS-064/SP-287. They read already committed canonical custody; they never build Goal state from this event. The existing SP-339 pm inspect / F3-666 raw record inspector, pm tail and pm export retain their own generic exact EventRecord reads and exact schema dispatch. This family adds no separately needed interpretation adapter or output binding. Generic current lookup independently requires SP-278's complete actual index/root/generation dataset, immutable birth anchor, global frontier/token/source-selection/frame/translation proof and current permission/deletion/hold/secret/maintenance fences, joining all represented Project/thread/Goal/event/sequence/Storage identities. Original body receipt and SP-286 first-receipt/full-value custody retain their separate owners; inspecting the event proves no terminal producer result or current lifecycle authority. Lawful body purge cannot recreate objective/history/source content. The generic inspector's bounded output stays exactly its existing contract; no new output shape is invented.

For this exact family, no family-specific event consumer/projector is required beyond those explicitly adopted generic reads and the existing canonical body consumers. Its family durable checkpoint is individually `none_required`: no projector, replay cursor, acknowledgment, idempotency ledger, outbox or owned write. The generic SP-278 checkpoint remains mandatory. The complete old v2 resource and original predicates keep their separate supported historical dispatch; no v2-to-v3 or app fallback exists. SP-1120/CV-1120/GRS-1120 now supply the original host source contract. Native source/writer availability remains gated on actual whole-bank installation and separate exact selector adoption, independent of this consumer disposition.

**Withdrawal.** A writer cutoff prevents new reservations/append before dedupe, preserving genuinely accepted original pending effects for the exact source/result resolver. It grants no retry under a new identity or event rollback. Reader withdrawal stops this exact binding; source, first receipts, old schemas, original meaning and retention remain. Rebuild may rebuild only the generic disposable index under a new admitted generation and full SP-278 fences; it cannot recreate canonical body, evidence, first receipts or a family projector. App and other payload versions never become fallbacks.

### SP-430 - Project goal.completed identity custody and observation

```yaml
plan_unit_id: SP-430
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored goal.completed v3 identity, SP-286 custody, original-body publication order and read-only
  none_required observation; no event-built Goal state. SP-1121/CV-1121 and separate SP-1122/CV-1122 now define
  ordinary and approved-exception original sources/resolvers, with actual installation/admission gated.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-204
- SP-286
- SP-287
- SP-278
unblocks: []
acceptance_criteria:
- Same original operation and semantic body resolve original receipts while Storage-only metadata differs.
- Project v3 and historical whole-v2 stay distinct; writer/reader withdrawal preserves custody.
- No family projection or durable checkpoint; SP-278 remains mandatory for event reads.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_completed.v3.schema.json
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm_goal_own_b_oracles.py
risk_class: goal_event_authority
reasoning_tier: high
context_scope: sp-430_event_authority
implementation_surfaces:
- Plans/storage-plan.md
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
- Plans/storage-plan.md
```

**Newly authored exact-family owner contract under DL-045.** Search for `goal.completed` in GRS-048/050/064, GREPLAY-004..010, SP-287, the old Known-37 recipe, CV-366, Goal source/custody schemas and live Plans found no current event recipe or passive reader for this successor; GRS-204 records the original-source gap. This unit supplies no writer installation.

**Identity and frozen input.** Let D be lowercase SHA-256 of RFC 8785 JCS of `["pm.goal.completed.lifecycle.v1", "project", storage_instance_id, project_id, thread_id, goal_id, str(before_revision), continuation_id, owning_run_id, next_attempt_ref]`, with the original null next_attempt_ref retained as null. Event ID is `goal.completed.v1:{D}`, idempotency key `goal.completed.lifecycle.v1:{D}`. Each string is exact; no Unicode/whitespace normalization or final LF. The original continuation tuple, operation ID and body-mutation intent digest are frozen; a change is a new admitted operation, never an equal retry. CV-339's producer_semantic_digest covers exactly its enumerated caller fields and excludes sequence_id/observed_at_utc/persisted_at_utc. Normal append and retry reject projector_replay_only before dedupe. For equal selected identity/body, synchronously caught-up custody resolves the exact original event and SP-286 first receipt; differing body conflicts; unavailable proof appends nothing. No retry repeats a body mutation, provider call, notification, Usage charge or dispatch. This recipe supersedes the old v2 recipe only for this v3 Project successor, never an app key.

**Custody and publication.** Adopt SP-286 by name for first receipt, immutable complete producer input and independent original full-value commitment. GRS-204's body-before-event order and fenced unknown results are mandatory. The same exact body/control reservation key and ordinary revision/currentness are used across host owners; no second Goal state machine or event-built body exists. SP-287 owns canonical body/history/origin/control and body receipt; Storage owns original EventRecord/first receipt. Coherent backup/identity-preserving restore preserves their joins and original terminal meaning, not guessed current state. Original event/dedupe/receipt authority remains RP-AUTHORITY-INDEFINITE@1.0.0; body and source content retain DL-047 bound-thread lifetime and referenced evidence retains its actual owner clock. Refs create no hold. Current read permission, tombstones, legal holds and reject-unhandled-secrets remain mandatory. A missing original receipt/source is unavailable, not reconstructed from a projection. Inline payloads are capped at 16 KiB by SP-337; oversized body values use its BLAKE3/byte-size/media-type payload-reference ownership, never raw embedded objective/output. This prepared event is bounded metadata; a missing exact payload-reference resolution contract refuses that edition rather than inventing an encoding.

**Consumers and exact checkpoint disposition.** Current Activity/body/history/continuation consume `reader.goal.body@1.0.0` and `reader.goal.objective_history@1.0.0` under GRS-064/SP-287. They read already committed canonical custody; they never build Goal state from this event. The existing SP-339 pm inspect / F3-666 raw record inspector, pm tail and pm export retain their own generic exact EventRecord reads and exact schema dispatch. This family adds no separately needed interpretation adapter or output binding. Generic current lookup independently requires SP-278's complete actual index/root/generation dataset, immutable birth anchor, global frontier/token/source-selection/frame/translation proof and current permission/deletion/hold/secret/maintenance fences, joining all represented Project/thread/Goal/event/sequence/Storage identities. Original body receipt and SP-286 first-receipt/full-value custody retain their separate owners; inspecting the event proves no terminal producer result or current lifecycle authority. Lawful body purge cannot recreate objective/history/source content. The generic inspector's bounded output stays exactly its existing contract; no new output shape is invented.

For this exact family, no family-specific event consumer/projector is required beyond those explicitly adopted generic reads and the existing canonical body consumers. Its family durable checkpoint is individually `none_required`: no projector, replay cursor, acknowledgment, idempotency ledger, outbox or owned write. The generic SP-278 checkpoint remains mandatory. The complete old v2 resource and original predicates keep their separate supported historical dispatch; no v2-to-v3 or app fallback exists. SP-1121/CV-1121/GRS-1121 now supply the original host source contract. Native source/writer availability remains gated on actual whole-bank installation and separate exact selector adoption, independent of this consumer disposition.

**Withdrawal.** A writer cutoff prevents new reservations/append before dedupe, preserving genuinely accepted original pending effects for the exact source/result resolver. It grants no retry under a new identity or event rollback. Reader withdrawal stops this exact binding; source, first receipts, old schemas, original meaning and retention remain. Rebuild may rebuild only the generic disposable index under a new admitted generation and full SP-278 fences; it cannot recreate canonical body, evidence, first receipts or a family projector. App and other payload versions never become fallbacks.

### SP-431 - Historical goal.evidence_captured reader custody

```yaml
plan_unit_id: SP-431
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Individually bind storage.goal_evidence_captured_history_read.v1@1.0.0, unchanged whole-v2 original
  predicates, SP-420 custody and full SP-278 proof; current-source admission absence returns unavailable; no owned
  durable effect.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-205
- SP-278
- SP-286
- SP-420
unblocks: []
acceptance_criteria:
- Complete original source/admission/identity and final current disclosure fences precede every answer.
- Lawful retained originals survive writer retirement; forged/withdrawn originals do not.
- Family checkpoint none_required, with mandatory generic checkpoint and unchanged retention.
validation_surfaces:
- Plans/goal_history_reader_outputs.schema.json
- Plans/goal_evidence_captured_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: sp-431_event_authority
implementation_surfaces:
- Plans/storage-plan.md
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
- Plans/storage-plan.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.evidence_captured` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R07/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact historical reader under DL-045.** `storage.goal_evidence_captured_history_read.v1@1.0.0` accepts exactly {project_id, goal_id, event_id, sequence_id} under current Project/audit permission and reads only `pm.goal_runtime_event.goal_evidence_captured.schema.v2` / `goal.evidence_captured` with the original supported EventRecord. The unused app edition has never had an adopted writer; it is not a readable historical fallback. Unsupported app/future/legacy input uses only its separately pre-existing exact route, or unavailable. No default fill, conversion, stripping or rehashing of original bytes.

**Physical identity and independent original proof.** Explicitly adopt SP-278's actual admitted `reader.storage.event_record_index@1.0.0`: key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, partition exactly project~base64url_no_pad(UTF8(project_id)), full source frame cursor/bounds/CRC/durable watermark, actual Storage/root/generation dataset, immutable birth anchor, complete global frontier/source-selection token including other-project/application records, actual source translation and later append suffix. Join selector and all represented envelope/payload identities, complete token Storage/key/ref/generation/dataset and source_selection Storage, authentic original frame/value/digests and generic current checkpoint. A same-generation nonmatching append invalidates an old token. No matching-row maximum, detached hash or coherent obsolete snapshot supplies current authority.

Individually adopt SP-420's two-member proof for this exact record: its own retained original SP-286 first-receipt custody joined on Storage/event/key/type/schema, plus the owner unit accepted at original issue and approved registry checkpoint that admitted this exact writer/version. GRS-205's search finds no such admitted writer today. Missing original admission for this reader is unavailable, not verified and not synthetic unresolved content. If an authentic original pair is later established, validate D-R07's complete original row/source/authority/revision/CAS/runtime/reference/idempotency predicates under that original contract, even when the current writer is retired or the live Goal has changed. Goal evidence collection moved to the actual Workflow/run evidence owner; GoalRecordV2 carries no evidence ledger. Preserve original evidence_kind/source_spans/content_hash/currentness/redaction and optional snapshot/retention refs. Non-validator spans, artifact snapshots, outer/inner redaction equality, provenance/hash/span bounds, original source/permission and nonterminal-state preservation are required. Unknown currentness cannot satisfy verification or completion. Original source/reference/tier/predicate evidence not preserved is unresolved historical validation only if current generic source/access independently permits the complete raw observation. Forged, withdrawn, unavailable or unsupported source is unavailable; current live state is never an original predicate.

**Closed output and final disclosure.** Exactly the eight fields kind, reader_binding, selector, original_event, original_validation, unresolved_obligations, read_token, action_authority, materialized separately at `Plans/goal_history_reader_outputs.schema.json#/$defs/goal_evidence_captured_history_answer`. Binding is `storage.goal_evidence_captured_history_read.v1@1.0.0`; action_authority=none. verified_historical/verified has exact original EventRecord/full SP-278 token and no obligations; unresolved_historical_validation/unresolved has them with a nonempty unique enumerated original obligation list; unavailable/unavailable has null original_event/token and no obligations. Invalid current source/access cannot become unresolved content. Independently capture real original source/admission/selector and current owner/access/deletion/hold/maintenance fences before helpers, derive the whole permitted value before output builders, then compare the complete candidate/source/token/current fence after the last helper in one pure predicate immediately before disclosure. Every independently callable resolver/validator/output helper repeats that boundary for its own actual input and typed result. No helper/witness or unchanged invalid bytes replace native origin proof.

**Consumer, replay and custody.** SP-339 pm inspect / F3-666 call this exact binding for its original event and consume only its historical interpretation. Repeated reads recompute the same observation under current source/fence, never append or replay an action. This family's checkpoint is individually none_required: no durable state projector, cursor, idempotency ledger, acknowledgment, receipt or any owned write. SP-278's generic checkpoint remains mandatory. Canonical source/first receipts retain RP-AUTHORITY-INDEFINITE@1.0.0; lookup/index retains RP-EVENT-INDEX-SOURCE@1.0.0. Referenced evidence/output/receipt retention, thread deletion, permissions, holds, backup and identity-preserving restore follow their existing separate owners. A ref creates no hold or right to reacquire disposed source/control bytes; canonical receipts are not rebuildable from index/events. Reject unhandled secrets rather than partially redacting an original. This reader performs no quarantine/recovery write or payload resurrection. Bodies above the current 16 KiB ingest cap follow SP-337 under their source owner; no new over-limit inline positive or payload-reference codec is claimed here.

**Withdrawal.** Current writers in both scopes are already cut off by GRS-205, before dedupe including equal-key retries. Reader withdrawal or unsupported schema stops this binding and preserves source/schema/retention; it grants no sibling fallback, app adoption or transformed current event. Generic index rebuild remains solely SP-278's owner operation with fresh generation/frontier fences; there is no family state to rebuild. Approved unused app withdrawal is a registry-checkpoint follow-up only.


**DG-OWN-D O6 adoption (2026-11-05, newly authored owner contract).** For exactly `goal.evidence_captured`, this reader explicitly adopts SP-1147 and its separate ATS-1119 `evidence_captured` entry/resolver/row-validator/answer-builder/inspection/disclosure suite, preserving its own SP-420 missing-proof outcome and SP-339 actual consumer. This is an oracle and boundary completion; it grants no current writer, historical instance, new retention, registry or native authority.

### SP-432 - Historical goal.receipt_recorded reader custody

```yaml
plan_unit_id: SP-432
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Individually bind storage.goal_receipt_recorded_history_read.v1@1.0.0, unchanged whole-v2 original
  predicates, SP-420 custody and full SP-278 proof; current-source admission absence returns unavailable; no owned
  durable effect.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-206
- SP-278
- SP-286
- SP-420
unblocks: []
acceptance_criteria:
- Complete original source/admission/identity and final current disclosure fences precede every answer.
- Lawful retained originals survive writer retirement; forged/withdrawn originals do not.
- Family checkpoint none_required, with mandatory generic checkpoint and unchanged retention.
validation_surfaces:
- Plans/goal_history_reader_outputs.schema.json
- Plans/goal_receipt_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: sp-432_event_authority
implementation_surfaces:
- Plans/storage-plan.md
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
- Plans/storage-plan.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.receipt_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R09/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact historical reader under DL-045.** `storage.goal_receipt_recorded_history_read.v1@1.0.0` accepts exactly {project_id, goal_id, event_id, sequence_id} under current Project/audit permission and reads only `pm.goal_runtime_event.goal_receipt_recorded.schema.v2` / `goal.receipt_recorded` with the original supported EventRecord. The unused app edition has never had an adopted writer; it is not a readable historical fallback. Unsupported app/future/legacy input uses only its separately pre-existing exact route, or unavailable. No default fill, conversion, stripping or rehashing of original bytes.

**Physical identity and independent original proof.** Explicitly adopt SP-278's actual admitted `reader.storage.event_record_index@1.0.0`: key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, partition exactly project~base64url_no_pad(UTF8(project_id)), full source frame cursor/bounds/CRC/durable watermark, actual Storage/root/generation dataset, immutable birth anchor, complete global frontier/source-selection token including other-project/application records, actual source translation and later append suffix. Join selector and all represented envelope/payload identities, complete token Storage/key/ref/generation/dataset and source_selection Storage, authentic original frame/value/digests and generic current checkpoint. A same-generation nonmatching append invalidates an old token. No matching-row maximum, detached hash or coherent obsolete snapshot supplies current authority.

Individually adopt SP-420's two-member proof for this exact record: its own retained original SP-286 first-receipt custody joined on Storage/event/key/type/schema, plus the owner unit accepted at original issue and approved registry checkpoint that admitted this exact writer/version. GRS-206's search finds no such admitted writer today. Missing original admission for this reader is unavailable, not verified and not synthetic unresolved content. If an authentic original pair is later established, validate D-R09's complete original row/source/authority/revision/CAS/runtime/reference/idempotency predicates under that original contract, even when the current writer is retired or the live Goal has changed. The actual Workflow/run owns certification and receipts; Goal V2 has no certification tier, child receipt graph or receipt-driven state. Preserve original receipt/kind/tier/output/dependency refs and original certifier decision. Require pre-existing valid original receipt, exact dependency completeness, original exception approval/residual-risk evidence and rejection/block reason evidence. The original running|verifying|repairing|degraded|blocked state is preserved; terminal/created/scheduled/paused/stopped originals reject. Recording receipt history never completes a current Goal. Original source/reference/tier/predicate evidence not preserved is unresolved historical validation only if current generic source/access independently permits the complete raw observation. Forged, withdrawn, unavailable or unsupported source is unavailable; current live state is never an original predicate.

**Closed output and final disclosure.** Exactly the eight fields kind, reader_binding, selector, original_event, original_validation, unresolved_obligations, read_token, action_authority, materialized separately at `Plans/goal_history_reader_outputs.schema.json#/$defs/goal_receipt_recorded_history_answer`. Binding is `storage.goal_receipt_recorded_history_read.v1@1.0.0`; action_authority=none. verified_historical/verified has exact original EventRecord/full SP-278 token and no obligations; unresolved_historical_validation/unresolved has them with a nonempty unique enumerated original obligation list; unavailable/unavailable has null original_event/token and no obligations. Invalid current source/access cannot become unresolved content. Independently capture real original source/admission/selector and current owner/access/deletion/hold/maintenance fences before helpers, derive the whole permitted value before output builders, then compare the complete candidate/source/token/current fence after the last helper in one pure predicate immediately before disclosure. Every independently callable resolver/validator/output helper repeats that boundary for its own actual input and typed result. No helper/witness or unchanged invalid bytes replace native origin proof.

**Consumer, replay and custody.** SP-339 pm inspect / F3-666 call this exact binding for its original event and consume only its historical interpretation. Repeated reads recompute the same observation under current source/fence, never append or replay an action. This family's checkpoint is individually none_required: no durable state projector, cursor, idempotency ledger, acknowledgment, receipt or any owned write. SP-278's generic checkpoint remains mandatory. Canonical source/first receipts retain RP-AUTHORITY-INDEFINITE@1.0.0; lookup/index retains RP-EVENT-INDEX-SOURCE@1.0.0. Referenced evidence/output/receipt retention, thread deletion, permissions, holds, backup and identity-preserving restore follow their existing separate owners. A ref creates no hold or right to reacquire disposed source/control bytes; canonical receipts are not rebuildable from index/events. Reject unhandled secrets rather than partially redacting an original. This reader performs no quarantine/recovery write or payload resurrection. Bodies above the current 16 KiB ingest cap follow SP-337 under their source owner; no new over-limit inline positive or payload-reference codec is claimed here.

**Withdrawal.** Current writers in both scopes are already cut off by GRS-206, before dedupe including equal-key retries. Reader withdrawal or unsupported schema stops this binding and preserves source/schema/retention; it grants no sibling fallback, app adoption or transformed current event. Generic index rebuild remains solely SP-278's owner operation with fresh generation/frontier fences; there is no family state to rebuild. Approved unused app withdrawal is a registry-checkpoint follow-up only.


**DG-OWN-D O6 adoption (2026-11-05, newly authored owner contract).** For exactly `goal.receipt_recorded`, this reader explicitly adopts SP-1148 and its separate ATS-1119 `receipt_recorded` entry/resolver/row-validator/answer-builder/inspection/disclosure suite, preserving its own SP-420 missing-proof outcome and SP-339 actual consumer. This is an oracle and boundary completion; it grants no current writer, historical instance, new retention, registry or native authority.

### SP-433 - Historical goal.tool_check_recorded reader custody

```yaml
plan_unit_id: SP-433
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Individually bind storage.goal_tool_check_recorded_history_read.v1@1.0.0, unchanged whole-v2 original
  predicates, SP-420 custody and full SP-278 proof; current-source admission absence returns unavailable; no owned
  durable effect.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-207
- SP-278
- SP-286
- SP-420
unblocks: []
acceptance_criteria:
- Complete original source/admission/identity and final current disclosure fences precede every answer.
- Lawful retained originals survive writer retirement; forged/withdrawn originals do not.
- Family checkpoint none_required, with mandatory generic checkpoint and unchanged retention.
validation_surfaces:
- Plans/goal_history_reader_outputs.schema.json
- Plans/goal_tool_check_recorded_history_contract_fixtures.json
- python3 scripts/pm_goal_history_reader_fixtures.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: sp-433_event_authority
implementation_surfaces:
- Plans/storage-plan.md
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
- Plans/storage-plan.md
```

**Per-family current-source search (2026-11-04).** Searched all live top-level Plans documents/JSON, exact-family v2 and app resources, Goal/Workflow/Permissions source graphs, production wiring and admission records for `goal.tool_check_recorded` at `0c40a7809826bcf509bbb16483bbdd8f4c48760b`. Found old D-R13/Known-37 schema-minima/identity listings and the unadopted CV-366 application selector; no current original producer, admitted source edition, family read/checkpoint binding or admission record names this exact event. GRS-048/049/052/064 and GRS-065 retain the ownership move in DL-079. E-CARDS-1 Card 3 A (DL-409 on unlanded origin/plans/ea-cards1-answers-20261104) confirms it for both scopes and approves withdrawal of this exact unused app edition at the next registry checkpoint. No new product or retention decision is taken.
**Newly authored exact historical reader under DL-045.** `storage.goal_tool_check_recorded_history_read.v1@1.0.0` accepts exactly {project_id, goal_id, event_id, sequence_id} under current Project/audit permission and reads only `pm.goal_runtime_event.goal_tool_check_recorded.schema.v2` / `goal.tool_check_recorded` with the original supported EventRecord. The unused app edition has never had an adopted writer; it is not a readable historical fallback. Unsupported app/future/legacy input uses only its separately pre-existing exact route, or unavailable. No default fill, conversion, stripping or rehashing of original bytes.

**Physical identity and independent original proof.** Explicitly adopt SP-278's actual admitted `reader.storage.event_record_index@1.0.0`: key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, partition exactly project~base64url_no_pad(UTF8(project_id)), full source frame cursor/bounds/CRC/durable watermark, actual Storage/root/generation dataset, immutable birth anchor, complete global frontier/source-selection token including other-project/application records, actual source translation and later append suffix. Join selector and all represented envelope/payload identities, complete token Storage/key/ref/generation/dataset and source_selection Storage, authentic original frame/value/digests and generic current checkpoint. A same-generation nonmatching append invalidates an old token. No matching-row maximum, detached hash or coherent obsolete snapshot supplies current authority.

Individually adopt SP-420's two-member proof for this exact record: its own retained original SP-286 first-receipt custody joined on Storage/event/key/type/schema, plus the owner unit accepted at original issue and approved registry checkpoint that admitted this exact writer/version. GRS-207's search finds no such admitted writer today. Missing original admission for this reader is unavailable, not verified and not synthetic unresolved content. If an authentic original pair is later established, validate D-R13's complete original row/source/authority/revision/CAS/runtime/reference/idempotency predicates under that original contract, even when the current writer is retired or the live Goal has changed. The executing Workflow/run owns tool checks and evidence; Permissions owns policy/approval resolution. Goal V2 has no tool-check loop or Goal-owned worker authority. Preserve tool_call_id/name/check_kind/result/policy_decision and original output/log refs. Passed+allow/not_applicable needs an original output/log; failed/blocked/unknown needs an original log; approval_required needs original common approval/block proof and cannot pass; deny cannot pass. All output stays by reference with original secret handling. Preserve scheduled|running|verifying|repairing|degraded|blocked; any state change was a separately named event. Original source/reference/tier/predicate evidence not preserved is unresolved historical validation only if current generic source/access independently permits the complete raw observation. Forged, withdrawn, unavailable or unsupported source is unavailable; current live state is never an original predicate.

**Closed output and final disclosure.** Exactly the eight fields kind, reader_binding, selector, original_event, original_validation, unresolved_obligations, read_token, action_authority, materialized separately at `Plans/goal_history_reader_outputs.schema.json#/$defs/goal_tool_check_recorded_history_answer`. Binding is `storage.goal_tool_check_recorded_history_read.v1@1.0.0`; action_authority=none. verified_historical/verified has exact original EventRecord/full SP-278 token and no obligations; unresolved_historical_validation/unresolved has them with a nonempty unique enumerated original obligation list; unavailable/unavailable has null original_event/token and no obligations. Invalid current source/access cannot become unresolved content. Independently capture real original source/admission/selector and current owner/access/deletion/hold/maintenance fences before helpers, derive the whole permitted value before output builders, then compare the complete candidate/source/token/current fence after the last helper in one pure predicate immediately before disclosure. Every independently callable resolver/validator/output helper repeats that boundary for its own actual input and typed result. No helper/witness or unchanged invalid bytes replace native origin proof.

**Consumer, replay and custody.** SP-339 pm inspect / F3-666 call this exact binding for its original event and consume only its historical interpretation. Repeated reads recompute the same observation under current source/fence, never append or replay an action. This family's checkpoint is individually none_required: no durable state projector, cursor, idempotency ledger, acknowledgment, receipt or any owned write. SP-278's generic checkpoint remains mandatory. Canonical source/first receipts retain RP-AUTHORITY-INDEFINITE@1.0.0; lookup/index retains RP-EVENT-INDEX-SOURCE@1.0.0. Referenced evidence/output/receipt retention, thread deletion, permissions, holds, backup and identity-preserving restore follow their existing separate owners. A ref creates no hold or right to reacquire disposed source/control bytes; canonical receipts are not rebuildable from index/events. Reject unhandled secrets rather than partially redacting an original. This reader performs no quarantine/recovery write or payload resurrection. Bodies above the current 16 KiB ingest cap follow SP-337 under their source owner; no new over-limit inline positive or payload-reference codec is claimed here.

**Withdrawal.** Current writers in both scopes are already cut off by GRS-207, before dedupe including equal-key retries. Reader withdrawal or unsupported schema stops this binding and preserves source/schema/retention; it grants no sibling fallback, app adoption or transformed current event. Generic index rebuild remains solely SP-278's owner operation with fresh generation/frontier fences; there is no family state to rebuild. Approved unused app withdrawal is a registry-checkpoint follow-up only.

**DG-OWN-D O6 adoption (2026-11-05, newly authored owner contract).** For exactly `goal.tool_check_recorded`, this reader explicitly adopts SP-1149 and its separate ATS-1119 `tool_check_recorded` entry/resolver/row-validator/answer-builder/inspection/disclosure suite, preserving its own SP-420 missing-proof outcome and SP-339 actual consumer. This is an oracle and boundary completion; it grants no current writer, historical instance, new retention, registry or native authority.

### SP-1110 - Original goal_run.stopped operation custody and reference route

```yaml
plan_unit_id: SP-1110
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored DL-045 owner contract for exactly goal_run.stopped Project v3; SP-426 adopts
  this complete SB4 physical contract by name. Each original StopIntent/Control/NativeResult/Origin/Result has
  its own closed 1.0.0 MessagePack wrapper and exact reversible storage/Project/run/operation key in physical-families.json.
  Full original native/D01/cause/Goal and Event sources are independently acquired through SB1; selectors and
  hashes are transport only. Adopt SP-286 eleven-field first AppendReceipt and strict v2 full-value original
  resolution, ordinary SeglogFrameV2/Storage append, CV-339 caller-semantic retry domain and SP-337 durable
  content-addressed packs for every oversized source/Event/terminal part. Measure the complete encoded wrapper
  after externalization against 16 KiB, refusing incomplete or over-limit compact records without truncating
  required members. Original non-rebuildable custody reuses RP-AUTHORITY-INDEFINITE and coherent native/D01/cause/Event/frame/first-receipt/payload
  backup; referenced content keeps its own owner lifetime. Current access/deletion/hold/restore controls apply
  to every read/restore; no missing original is recreated. Same operation returns original results, unknown
  stays recovery_required, withdrawal cuts off new writes at the final predicate and withdraws readers separately.
  Prepared without admission; no registry is changed.
gui_related: false
gui_classification_reason: Defines original event/source/custody and passive projection contracts without a
  visual surface.
split_recommended: false
depends_on:
- CV-1110
- SP-426
- SP-286
- SP-337
- CV-339
unblocks: []
acceptance_criteria:
- Every original operation key and complete wrapper resolves to its own exact schema/version and authentic issuing
  provenance.
- Independently resolved original receipt/Event metadata and every semantic retry field agree; no arbitrary
  digest is trusted.
- All stored parts, SP-337 refs, coherent backup/restore and source lifetime are checked without creating a
  new retention policy.
validation_surfaces:
- Plans/goal_run_stop_block_contracts/protocol.md
- Plans/goal_run_stop_block_contracts/contracts.schema.json
- python3 scripts/pm_goal_own_a_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: original_stop_block_source_custody_and_publication
reasoning_tier: high
context_scope: event_authority_dg_own_a_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_run_stop_block_contracts/
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-080
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No application stopped edition, old-birth enrollment, registry/admission/Decision Log change or retention
  policy.
- No native installation/execution, runtime/readiness, WorkNode, NodeSeed or governance qualification.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-1111, ContractName:Plans/storage-plan.md#SP-426, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-337, ContractName:Plans/Contracts_V0.md#CV-339


### SP-1111 - Original goal_run.blocked operation custody and reference route

```yaml
plan_unit_id: SP-1111
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored DL-045 owner contract for exactly goal_run.blocked Project v3; SP-427 adopts
  this complete SB4 physical contract by name. Each original BlockIntent/Control/NativeResult/Origin/Result
  has its own closed 1.0.0 MessagePack wrapper and exact reversible storage/Project/run/operation key in physical-families.json.
  Full original native/D01/cause/Goal and Event sources are independently acquired through SB1; selectors and
  hashes are transport only. Adopt SP-286 eleven-field first AppendReceipt and strict v2 full-value original
  resolution, ordinary SeglogFrameV2/Storage append, CV-339 caller-semantic retry domain and SP-337 durable
  content-addressed packs for every oversized source/Event/terminal part. Measure the complete encoded wrapper
  after externalization against 16 KiB, refusing incomplete or over-limit compact records without truncating
  required members. Original non-rebuildable custody reuses RP-AUTHORITY-INDEFINITE and coherent native/D01/cause/Event/frame/first-receipt/payload
  backup; referenced content keeps its own owner lifetime. Current access/deletion/hold/restore controls apply
  to every read/restore; no missing original is recreated. Same operation returns original results, unknown
  stays recovery_required, withdrawal cuts off new writes at the final predicate and withdraws readers separately.
  Prepared without admission; no registry is changed.
gui_related: false
gui_classification_reason: Defines original event/source/custody and passive projection contracts without a
  visual surface.
split_recommended: false
depends_on:
- CV-1110
- SP-427
- SP-286
- SP-337
- CV-339
unblocks: []
acceptance_criteria:
- Every original operation key and complete wrapper resolves to its own exact schema/version and authentic issuing
  provenance.
- Independently resolved original receipt/Event metadata and every semantic retry field agree; no arbitrary
  digest is trusted.
- All stored parts, SP-337 refs, coherent backup/restore and source lifetime are checked without creating a
  new retention policy.
validation_surfaces:
- Plans/goal_run_stop_block_contracts/protocol.md
- Plans/goal_run_stop_block_contracts/contracts.schema.json
- python3 scripts/pm_goal_own_a_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: original_stop_block_source_custody_and_publication
reasoning_tier: high
context_scope: event_authority_dg_own_a_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_run_stop_block_contracts/
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-080
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No application stopped edition, old-birth enrollment, registry/admission/Decision Log change or retention
  policy.
- No native installation/execution, runtime/readiness, WorkNode, NodeSeed or governance qualification.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-1112, ContractName:Plans/storage-plan.md#SP-427, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-337, ContractName:Plans/Contracts_V0.md#CV-339


### SP-1112 - Concrete fresh stop/block projection and checkpoint

```yaml
plan_unit_id: SP-1112
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored DL-045 owner contract adopted by SP-428 and GRS-202. SB5 defines owner.goal_run.stop_block.project_prefix.v1
  and sole lower publisher owner.storage.goal_run.stop_block.publish.v1, plus read_historical.v1/read_current.v1
  under owner.goal_run.stop_block, version 1.0.0, and the Storage source reader owner.storage.goal_run.stop_block.read_sources.v1;
  methods.json consumer_methods gives all five their typed arguments, return variants, SBP0-SBP10 entry and final
  predicates and lower calls, with the inherited branch arguments rebound through the consumer realms of resource-map.json
  (amended 2026-11-14, PNC-019 lane s3d, DG-OWN-A review F9). Exact physical row is goal_run_stop_block_projection.v1:K(project_id):K(goal_run_id)
  in goal_run_stop_block_projection.v1@<generation_id>; exact checkpoint in checkpoints is goal_run_stop_block_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id).
  Closed StorageProjection/StorageCheckpoint roots are in contracts.schema.json; the row's lifecycle_metadata carries
  SP-428's stopped (stop_reason_code, resumable, safe_point_ref) or blocked (blocked_reason_code, block_receipt_ref)
  members, copied from the verified original row (DG-OWN-A review F3). Adopt SP-278 and DL-076 full
  nine-field durable tokens including the whole thirteen-field source_selection; no redb_snapshot_id is persisted.
  Actual generic full global prefix, original native birth/profile/cause/first receipt and each complete original
  branch authenticate every row, including off-run no-ops and genuine gap proofs. SB5 fixes anchor/frontier
  recipes, full preimage CAS, atomic row-plus-checkpoint publication, isolated staging/full-scan rebuild and
  complete-current-frontier cutover. Existing v7 roots/generations are immutable. Reuse RP-PROJECTION-3GEN,
  existing 604800-second retired eligibility and true holds; derived values are excluded from backup and rebuilt
  after restore. No current view from a historical prefix or pending original result, and no action authority
  follows.
gui_related: false
gui_classification_reason: Defines original event/source/custody and passive projection contracts without a
  visual surface.
split_recommended: false
depends_on:
- SP-428
- SP-278
- SP-1110
- SP-1111
- GRS-202
unblocks: []
acceptance_criteria:
- Full original source and generic frontier are independently authenticated before helper calls and after the
  last helper at each owner boundary.
- Entire row/root/frontier transaction commits together or neither, and stale generic or own preimages abort.
- Cutover selects only a fully covered staged current frontier; unsupported/malformed rows halt before the row
  without checkpoint progress.
validation_surfaces:
- Plans/goal_run_stop_block_contracts/protocol.md
- Plans/goal_run_stop_block_contracts/contracts.schema.json
- python3 scripts/pm_goal_own_a_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: original_stop_block_source_custody_and_publication
reasoning_tier: high
context_scope: event_authority_dg_own_a_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_run_stop_block_contracts/
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-080
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No application stopped edition, old-birth enrollment, registry/admission/Decision Log change or retention
  policy.
- No native installation/execution, runtime/readiness, WorkNode, NodeSeed or governance qualification.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-428, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-1110, ContractName:Plans/storage-plan.md#SP-1111, ContractName:Plans/Goal_Runtime_System.md#GRS-202

### SP-1120 - Original blocked lifecycle source custody and resolver

```yaml
plan_unit_id: SP-1120
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored exact-family physical source contract for goal.blocked, adopting GRS-1120, SP-429,
  SP-287 and SP-286 including its v2 full-value commitment independently. Prepared without registration or admission.
  Source edition pm.goal.host.blocked_source.v1 and method bank Plans/goal_lifecycle_host_contracts/methods.json
  select closed decision, reservation, pending and result resources; no sibling or application selector is inferred.


  The physical canonical families are goal_lifecycle_blocked_source, goal_lifecycle_blocked_reservation, goal_lifecycle_blocked_pending
  and goal_lifecycle_blocked_result. Keys are goal.lifecycle.blocked.{role}.v1:{partition}:{hex_utf8(goal_id)}:{hex_utf8(operation_id)},
  where role is source|reservation|pending|result, partition is project~ plus unpadded base64url UTF-8 project_id,
  and hex is lowercase exact UTF-8, not a raw Project id. Storage instance comes from the admitted store and is
  joined in every wrapper. Each wrapper has exactly schema_id, schema_version and record, with role/family-specific
  schema roots in CV-1120; schema_version is 1.0.0. DL-270/SP-339 requires native redb MessagePack. The complete
  new source-role wrapper uses the existing Case L-2/SP-026/SP-236 canonical MessagePack value codec, pm.seglog_frame_v2.event_value.canonical_msgpack.v1.
  Existing Goal semantic SHA-256 inputs still use pm.goal.canonical_json.v1; physical bytes never replace those
  semantic hash inputs. The source resource bank selects the original semantic and physical recipe edition by immutable
  installed source, never an untrusted request. Frozen older body/event resources keep original recipes; no numeric
  cap or physical-float normalization is introduced here.


  Capture the host/caller and decision before body work, using original source refs, complete currentness/authority
  snapshots and their hashes. Exact body preimages and afterimages in source/reservation are bound-thread content
  under DL-047, never an independent objective history or retention hold. They are hidden and purged with the shared
  body content; other evidence remains at its real owner. Content-free results cannot recreate those bytes. The
  reservation joins exact operation and continuation tuple, original accepted head, whole-control hash, expected
  ordinary revision/currentness/Stop and source edition; compare whole preimages under the shared writer gate. Body/control/receipt
  commit and lifecycle pending phase body_committed form one narrow atomic transaction. No seglog append occurs
  inside that body transaction. Freeze complete caller-owned EventRecord input only after original body receipt
  resolution; pending stores that exact input or its resolved SP-337 body reference, semantic digest, original body
  receipt and intent. original source -> body receipt -> frozen event -> first event receipt -> final result is
  acyclic; no source digest includes its future receipt.


  Methods independently resolve the actual SP-287 body receipt by Storage/Project/thread/Goal/operation, validate
  the full owner/intent/before/after/currentness/accepted-head fields and hash exact receipt bytes. SP-286 full_value_request
  resolves the original event and first eleven-field AppendReceipt through canonical custody, not supplied metadata
  or a projection. Compare all caller fields, event family/schema/scope/run, full-value commitment and original
  receipt; Storage alone assigns sequence, times and frame/group positions. Semantic equality excludes those assigned
  fields. Current writer selection, root generation and real admission are resolved out of band. A descriptor with
  admitted=true cannot select a writer.


  Every stored part, including source/reservation/pending/result and referenced semantic bodies, is measured in
  encoded bytes under the existing Storage value ceiling; EventRecord inline body is at most 16 KiB. Larger bodies
  use SP-337''s BLAKE3/byte-size/media-type reference with pack bytes durable before referring record acknowledgment.
  Do not externalize only one oversized member and leave another mandatory value above its ceiling. A missing codec/reference
  bank refuses installation. Complete original bytes, hash, size and reference custody are verified before use;
  references do not change evidence/content retention or create a hold.


  Recovery queries the same operation. Pending unavailable/unknown cannot become no_effect; only actual pre-body
  no-effect proof permits that immutable terminal result. After body commit, no caller repeats a body mutation.
  Lost append acknowledgment resolves the existing first receipt and full event; semantic mismatch conflicts. Published
  and terminal unknown/no_effect are immutable; retries return their exact original bytes. Writer cutoff blocks
  new reservations/appends before dedupe; reconciliation of genuine earlier effects requires the installed original
  resolver and does not grant new action. Missing source/receipt stays unavailable. Reader withdrawal disables the
  selected interpretation without deleting source or receipt evidence.


  Original source/reservation content follows DL-047 bound-thread content lifetime, immediate deletion hiding and
  existing hold/purge rules; content-free pending/result/body/Event receipt authority follows RP-AUTHORITY-INDEFINITE@1.0.0.
  Pending reference metadata never retains deleted objective or owner evidence. Backup takes one coherent cut of
  shared body/control/receipt and all four source roles plus original event/first receipt/full-value custody, source
  edition and payload packs. Restore preserves Storage identity and tombstones/holds, authenticates every join before
  exposure, retains pending/unknown and terminal original meaning, and fences incompatible or missing members instead
  of reconstructing receipts. The existing independent SP-287/SP-286 content-free receipt audits survive lawful
  body/source purge under their own current disclosure guards. Composed lifecycle inspection that still requires
  unavailable original source returns unavailable; it never rebuilds source content or proves current completion
  from raw receipt metadata.


  inspect and resolve are separately callable and re-authenticate exact original row/source/receipt edition and
  current access/deletion/hold/secret/maintenance after the final helper. Historical observation uses original lawful
  issue-time predicates despite changed live Goal or retired current writer. Current Activity remains the canonical
  SP-287 body reader; generic EventRecord inspection remains SP-278/SP-339 and this family''s durable checkpoint
  remains individually none_required. No family projector, durable cursor, outbox or event-built Goal state is introduced.
  Native execution, installation and transaction/durability proof remain NOT_RUN.


  DL-270/SP-339 controls the new physical values: canonical MessagePack, using the existing Case L-2/SP-026/SP-236
  value codec. The exact physical reference spelling is blake3:<64 lowercase hexadecimal digits>:<positive decimal
  encoded byte size without a leading zero>:application/msgpack. Pack bytes are the complete selected logical record
  in that codec. The separately selected EventRecord payload_ref spelling ends in application/json and covers the
  existing selected JSON payload bytes. Both resolve exact bytes, BLAKE3, size and media type before decode, with
  pack durability before referring acknowledgment; neither reference silently changes a semantic digest or retained
  recipe.


  This source''s shared_storage_editions in methods.json names five prepared MessagePack outer editions: body/revision/origin/receipt
  schema_version=2.0.0 and control schema_version=3.0.0, with their original schema_id and exact existing SP-287
  key. Each closed three-field wrapper chooses the whole original logical inner schema or a content_ref, so over-limit
  body, accepted revision, reserved control/intent and receipt all resolve their exact original semantics. The five
  own storage_shared_*_msgpack roots are complete physical successor resources, never a replacement of a frozen
  original. Migration is exact semantic identity at the same owning key, with authentic original custody and all
  shared-owner permission/currentness/Stop/maintenance/backup/purge fences; semantic hashes, accepted history and
  original receipt bytes stay unchanged. Actual registry/migration/source installation and every canonical reader/writer''s
  adoption are prerequisites before enabling a source. Unsupported, missing or mixed editions are unavailable; no
  lazy per-request migration or historical relabeling is allowed. No registry or migration admission is performed
  here. The whole-path oracle measures actual MessagePack bytes, including the lawful 4,000-scalar multibyte objective,
  and resolves every over-limit stored part. Shared number-domain and original-edition authentication remain the
  separately authorized sweep, with no lane-local serializer, integer ceiling or physical-float normalization.'
gui_related: false
gui_classification_reason: Original lifecycle source, receipt custody and protocol predicates.
depends_on:
- GRS-1120
- SP-287
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```

### SP-1121 - Original completed lifecycle source custody and resolver

```yaml
plan_unit_id: SP-1121
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored exact-family physical source contract for goal.completed, adopting GRS-1121, SP-430,
  SP-287 and SP-286 including its v2 full-value commitment independently. Prepared without registration or admission.
  Source edition pm.goal.host.completed_source.v1 and method bank Plans/goal_lifecycle_host_contracts/methods.json
  select closed decision, reservation, pending and result resources; no sibling or application selector is inferred.


  The physical canonical families are goal_lifecycle_completed_source, goal_lifecycle_completed_reservation, goal_lifecycle_completed_pending
  and goal_lifecycle_completed_result. Keys are goal.lifecycle.completed.{role}.v1:{partition}:{hex_utf8(goal_id)}:{hex_utf8(operation_id)},
  where role is source|reservation|pending|result, partition is project~ plus unpadded base64url UTF-8 project_id,
  and hex is lowercase exact UTF-8, not a raw Project id. Storage instance comes from the admitted store and is
  joined in every wrapper. Each wrapper has exactly schema_id, schema_version and record, with role/family-specific
  schema roots in CV-1121; schema_version is 1.0.0. DL-270/SP-339 requires native redb MessagePack. The complete
  new source-role wrapper uses the existing Case L-2/SP-026/SP-236 canonical MessagePack value codec, pm.seglog_frame_v2.event_value.canonical_msgpack.v1.
  Existing Goal semantic SHA-256 inputs still use pm.goal.canonical_json.v1; physical bytes never replace those
  semantic hash inputs. The source resource bank selects the original semantic and physical recipe edition by immutable
  installed source, never an untrusted request. Frozen older body/event resources keep original recipes; no numeric
  cap or physical-float normalization is introduced here.


  Capture the host/caller and decision before body work, using original source refs, complete currentness/authority
  snapshots and their hashes. Exact body preimages and afterimages in source/reservation are bound-thread content
  under DL-047, never an independent objective history or retention hold. They are hidden and purged with the shared
  body content; other evidence remains at its real owner. Content-free results cannot recreate those bytes. The
  reservation joins exact operation and continuation tuple, original accepted head, whole-control hash, expected
  ordinary revision/currentness/Stop and source edition; compare whole preimages under the shared writer gate. Body/control/receipt
  commit and lifecycle pending phase body_committed form one narrow atomic transaction. No seglog append occurs
  inside that body transaction. Freeze complete caller-owned EventRecord input only after original body receipt
  resolution; pending stores that exact input or its resolved SP-337 body reference, semantic digest, original body
  receipt and intent. original source -> body receipt -> frozen event -> first event receipt -> final result is
  acyclic; no source digest includes its future receipt.


  Methods independently resolve the actual SP-287 body receipt by Storage/Project/thread/Goal/operation, validate
  the full owner/intent/before/after/currentness/accepted-head fields and hash exact receipt bytes. SP-286 full_value_request
  resolves the original event and first eleven-field AppendReceipt through canonical custody, not supplied metadata
  or a projection. Compare all caller fields, event family/schema/scope/run, full-value commitment and original
  receipt; Storage alone assigns sequence, times and frame/group positions. Semantic equality excludes those assigned
  fields. Current writer selection, root generation and real admission are resolved out of band. A descriptor with
  admitted=true cannot select a writer.


  Every stored part, including source/reservation/pending/result and referenced semantic bodies, is measured in
  encoded bytes under the existing Storage value ceiling; EventRecord inline body is at most 16 KiB. Larger bodies
  use SP-337''s BLAKE3/byte-size/media-type reference with pack bytes durable before referring record acknowledgment.
  Do not externalize only one oversized member and leave another mandatory value above its ceiling. A missing codec/reference
  bank refuses installation. Complete original bytes, hash, size and reference custody are verified before use;
  references do not change evidence/content retention or create a hold.


  Recovery queries the same operation. Pending unavailable/unknown cannot become no_effect; only actual pre-body
  no-effect proof permits that immutable terminal result. After body commit, no caller repeats a body mutation.
  Lost append acknowledgment resolves the existing first receipt and full event; semantic mismatch conflicts. Published
  and terminal unknown/no_effect are immutable; retries return their exact original bytes. Writer cutoff blocks
  new reservations/appends before dedupe; reconciliation of genuine earlier effects requires the installed original
  resolver and does not grant new action. Missing source/receipt stays unavailable. Reader withdrawal disables the
  selected interpretation without deleting source or receipt evidence.


  Original source/reservation content follows DL-047 bound-thread content lifetime, immediate deletion hiding and
  existing hold/purge rules; content-free pending/result/body/Event receipt authority follows RP-AUTHORITY-INDEFINITE@1.0.0.
  Pending reference metadata never retains deleted objective or owner evidence. Backup takes one coherent cut of
  shared body/control/receipt and all four source roles plus original event/first receipt/full-value custody, source
  edition and payload packs. Restore preserves Storage identity and tombstones/holds, authenticates every join before
  exposure, retains pending/unknown and terminal original meaning, and fences incompatible or missing members instead
  of reconstructing receipts. The existing independent SP-287/SP-286 content-free receipt audits survive lawful
  body/source purge under their own current disclosure guards. Composed lifecycle inspection that still requires
  unavailable original source returns unavailable; it never rebuilds source content or proves current completion
  from raw receipt metadata.


  inspect and resolve are separately callable and re-authenticate exact original row/source/receipt edition and
  current access/deletion/hold/secret/maintenance after the final helper. Historical observation uses original lawful
  issue-time predicates despite changed live Goal or retired current writer. Current Activity remains the canonical
  SP-287 body reader; generic EventRecord inspection remains SP-278/SP-339 and this family''s durable checkpoint
  remains individually none_required. No family projector, durable cursor, outbox or event-built Goal state is introduced.
  Native execution, installation and transaction/durability proof remain NOT_RUN.


  DL-270/SP-339 controls the new physical values: canonical MessagePack, using the existing Case L-2/SP-026/SP-236
  value codec. The exact physical reference spelling is blake3:<64 lowercase hexadecimal digits>:<positive decimal
  encoded byte size without a leading zero>:application/msgpack. Pack bytes are the complete selected logical record
  in that codec. The separately selected EventRecord payload_ref spelling ends in application/json and covers the
  existing selected JSON payload bytes. Both resolve exact bytes, BLAKE3, size and media type before decode, with
  pack durability before referring acknowledgment; neither reference silently changes a semantic digest or retained
  recipe.


  This source''s shared_storage_editions in methods.json names five prepared MessagePack outer editions: body/revision/origin/receipt
  schema_version=2.0.0 and control schema_version=3.0.0, with their original schema_id and exact existing SP-287
  key. Each closed three-field wrapper chooses the whole original logical inner schema or a content_ref, so over-limit
  body, accepted revision, reserved control/intent and receipt all resolve their exact original semantics. The five
  own storage_shared_*_msgpack roots are complete physical successor resources, never a replacement of a frozen
  original. Migration is exact semantic identity at the same owning key, with authentic original custody and all
  shared-owner permission/currentness/Stop/maintenance/backup/purge fences; semantic hashes, accepted history and
  original receipt bytes stay unchanged. Actual registry/migration/source installation and every canonical reader/writer''s
  adoption are prerequisites before enabling a source. Unsupported, missing or mixed editions are unavailable; no
  lazy per-request migration or historical relabeling is allowed. No registry or migration admission is performed
  here. The whole-path oracle measures actual MessagePack bytes, including the lawful 4,000-scalar multibyte objective,
  and resolves every over-limit stored part. Shared number-domain and original-edition authentication remain the
  separately authorized sweep, with no lane-local serializer, integer ceiling or physical-float normalization.'
gui_related: false
gui_classification_reason: Original lifecycle source, receipt custody and protocol predicates.
depends_on:
- GRS-1121
- SP-287
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```

### SP-1122 - Original exception lifecycle source custody and resolver

```yaml
plan_unit_id: SP-1122
unit_type: owner_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored exact-family physical source contract for goal.completed approved_verification_exception,
  adopting GRS-1122, SP-430, SP-287 and SP-286 including its v2 full-value commitment independently. Prepared without
  registration or admission. Source edition pm.goal.host.exception_source.v1 and method bank Plans/goal_lifecycle_host_contracts/methods.json
  select closed decision, reservation, pending and result resources; no sibling or application selector is inferred.


  The physical canonical families are goal_lifecycle_exception_source, goal_lifecycle_exception_reservation, goal_lifecycle_exception_pending
  and goal_lifecycle_exception_result. Keys are goal.lifecycle.exception.{role}.v1:{partition}:{hex_utf8(goal_id)}:{hex_utf8(operation_id)},
  where role is source|reservation|pending|result, partition is project~ plus unpadded base64url UTF-8 project_id,
  and hex is lowercase exact UTF-8, not a raw Project id. Storage instance comes from the admitted store and is
  joined in every wrapper. Each wrapper has exactly schema_id, schema_version and record, with role/family-specific
  schema roots in CV-1122; schema_version is 1.0.0. DL-270/SP-339 requires native redb MessagePack. The complete
  new source-role wrapper uses the existing Case L-2/SP-026/SP-236 canonical MessagePack value codec, pm.seglog_frame_v2.event_value.canonical_msgpack.v1.
  Existing Goal semantic SHA-256 inputs still use pm.goal.canonical_json.v1; physical bytes never replace those
  semantic hash inputs. The source resource bank selects the original semantic and physical recipe edition by immutable
  installed source, never an untrusted request. Frozen older body/event resources keep original recipes; no numeric
  cap or physical-float normalization is introduced here.


  Capture the host/caller and decision before body work, using original source refs, complete currentness/authority
  snapshots and their hashes. Exact body preimages and afterimages in source/reservation are bound-thread content
  under DL-047, never an independent objective history or retention hold. They are hidden and purged with the shared
  body content; other evidence remains at its real owner. Content-free results cannot recreate those bytes. The
  reservation joins exact operation and continuation tuple, original accepted head, whole-control hash, expected
  ordinary revision/currentness/Stop and source edition; compare whole preimages under the shared writer gate. Body/control/receipt
  commit and lifecycle pending phase body_committed form one narrow atomic transaction. No seglog append occurs
  inside that body transaction. Freeze complete caller-owned EventRecord input only after original body receipt
  resolution; pending stores that exact input or its resolved SP-337 body reference, semantic digest, original body
  receipt and intent. original source -> body receipt -> frozen event -> first event receipt -> final result is
  acyclic; no source digest includes its future receipt.


  Methods independently resolve the actual SP-287 body receipt by Storage/Project/thread/Goal/operation, validate
  the full owner/intent/before/after/currentness/accepted-head fields and hash exact receipt bytes. SP-286 full_value_request
  resolves the original event and first eleven-field AppendReceipt through canonical custody, not supplied metadata
  or a projection. Compare all caller fields, event family/schema/scope/run, full-value commitment and original
  receipt; Storage alone assigns sequence, times and frame/group positions. Semantic equality excludes those assigned
  fields. Current writer selection, root generation and real admission are resolved out of band. A descriptor with
  admitted=true cannot select a writer.


  Every stored part, including source/reservation/pending/result and referenced semantic bodies, is measured in
  encoded bytes under the existing Storage value ceiling; EventRecord inline body is at most 16 KiB. Larger bodies
  use SP-337''s BLAKE3/byte-size/media-type reference with pack bytes durable before referring record acknowledgment.
  Do not externalize only one oversized member and leave another mandatory value above its ceiling. A missing codec/reference
  bank refuses installation. Complete original bytes, hash, size and reference custody are verified before use;
  references do not change evidence/content retention or create a hold.


  Recovery queries the same operation. Pending unavailable/unknown cannot become no_effect; only actual pre-body
  no-effect proof permits that immutable terminal result. After body commit, no caller repeats a body mutation.
  Lost append acknowledgment resolves the existing first receipt and full event; semantic mismatch conflicts. Published
  and terminal unknown/no_effect are immutable; retries return their exact original bytes. Writer cutoff blocks
  new reservations/appends before dedupe; reconciliation of genuine earlier effects requires the installed original
  resolver and does not grant new action. Missing source/receipt stays unavailable. Reader withdrawal disables the
  selected interpretation without deleting source or receipt evidence.


  Original source/reservation content follows DL-047 bound-thread content lifetime, immediate deletion hiding and
  existing hold/purge rules; content-free pending/result/body/Event receipt authority follows RP-AUTHORITY-INDEFINITE@1.0.0.
  Pending reference metadata never retains deleted objective or owner evidence. Backup takes one coherent cut of
  shared body/control/receipt and all four source roles plus original event/first receipt/full-value custody, source
  edition and payload packs. Restore preserves Storage identity and tombstones/holds, authenticates every join before
  exposure, retains pending/unknown and terminal original meaning, and fences incompatible or missing members instead
  of reconstructing receipts. The existing independent SP-287/SP-286 content-free receipt audits survive lawful
  body/source purge under their own current disclosure guards. Composed lifecycle inspection that still requires
  unavailable original source returns unavailable; it never rebuilds source content or proves current completion
  from raw receipt metadata.


  inspect and resolve are separately callable and re-authenticate exact original row/source/receipt edition and
  current access/deletion/hold/secret/maintenance after the final helper. Historical observation uses original lawful
  issue-time predicates despite changed live Goal or retired current writer. Current Activity remains the canonical
  SP-287 body reader; generic EventRecord inspection remains SP-278/SP-339 and this family''s durable checkpoint
  remains individually none_required. No family projector, durable cursor, outbox or event-built Goal state is introduced.
  Native execution, installation and transaction/durability proof remain NOT_RUN.


  Before the Goal host source is captured, the original Workflow controller alone issues the separate canonical
  goal_verification_exception_receipt family. Its key is goal.verification_exception.receipt.v1:{partition}:{hex_utf8(goal_id)}:{hex_utf8(owning_run_id)}:{hex_utf8(receipt_id)},
  with the same encoded Project partition and actual Storage target joins. CV-1122 supplies storage_workflow_exception_receipt,
  a closed 1.0.0 wrapper over workflow_exception_receipt containing the exact original source inputs and separately
  typed original exception result. This is source-before-result hashing, not a receipt bootstrap cycle. Use the
  existing canonical MessagePack physical codec and the 16 KiB/BLAKE3 whole-value route; the content-free receipt/identity/authority
  follows existing indefinite receipt custody, while referenced Workflow/evidence/approval content retains its actual
  owner clock and creates no hold. Include this original receipt in the coherent backup/restore/read/withdrawal
  cut. Equal issue returns its exact original bytes, conflicting source input refuses and missing/unknown original
  issue never produces a substitute receipt. This new physical binding is prepared only, without a storage-registry
  write or admission.


  DL-270/SP-339 controls the new physical values: canonical MessagePack, using the existing Case L-2/SP-026/SP-236
  value codec. The exact physical reference spelling is blake3:<64 lowercase hexadecimal digits>:<positive decimal
  encoded byte size without a leading zero>:application/msgpack. Pack bytes are the complete selected logical record
  in that codec. The separately selected EventRecord payload_ref spelling ends in application/json and covers the
  existing selected JSON payload bytes. Both resolve exact bytes, BLAKE3, size and media type before decode, with
  pack durability before referring acknowledgment; neither reference silently changes a semantic digest or retained
  recipe.


  This source''s shared_storage_editions in methods.json names five prepared MessagePack outer editions: body/revision/origin/receipt
  schema_version=2.0.0 and control schema_version=3.0.0, with their original schema_id and exact existing SP-287
  key. Each closed three-field wrapper chooses the whole original logical inner schema or a content_ref, so over-limit
  body, accepted revision, reserved control/intent and receipt all resolve their exact original semantics. The five
  own storage_shared_*_msgpack roots are complete physical successor resources, never a replacement of a frozen
  original. Migration is exact semantic identity at the same owning key, with authentic original custody and all
  shared-owner permission/currentness/Stop/maintenance/backup/purge fences; semantic hashes, accepted history and
  original receipt bytes stay unchanged. Actual registry/migration/source installation and every canonical reader/writer''s
  adoption are prerequisites before enabling a source. Unsupported, missing or mixed editions are unavailable; no
  lazy per-request migration or historical relabeling is allowed. No registry or migration admission is performed
  here. The whole-path oracle measures actual MessagePack bytes, including the lawful 4,000-scalar multibyte objective,
  and resolves every over-limit stored part. Shared number-domain and original-edition authentication remain the
  separately authorized sweep, with no lane-local serializer, integer ceiling or physical-float normalization.'
gui_related: false
gui_classification_reason: Original lifecycle source, receipt custody and protocol predicates.
depends_on:
- GRS-1122
- SP-287
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- Independently resolved original source, complete identity and receipt bytes gate every applicable boundary.
- No partial effect is repeated or promoted to success after an unknown outcome.
- Prepared without admission; existing historical resources and policies remain exact.
validation_surfaces:
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
- Plans/goal_lifecycle_host_contracts/methods.json
- python3 scripts/pm_goal_own_b_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_lifecycle_original_authority
reasoning_tier: high
context_scope: dg_own_b_20261105
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_lifecycle_host_contracts/schemas/contracts.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md
preserved_exact_tokens: []
negative_constraints:
- No registry/admission, new retention policy, native proof, WorkNode, readiness or governance seal.
```
