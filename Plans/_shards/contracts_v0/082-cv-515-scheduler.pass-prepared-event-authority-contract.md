# Shard 082: CV-515 — scheduler.pass prepared Event Authority contract

Source: `Plans/Contracts_V0.md`

Source lines: L31518-L34632

Source SHA256: `63bb4a86f8dafb1a617be00b88cbc647e197e542ac522ace4ea4e0e84b0ac3a5`

---

## CV-515 — scheduler.pass prepared Event Authority contract

Newly authored owner contract: `scheduler.pass@1.0.0` uses the independently closed schema `Plans/event_payload_scheduler_pass.schema.json` (schema id `https://puppetmaster.local/schemas/event_payloads/scheduler_pass/1.0.0`). It is a proposed payload version only, and grants no current write permission. Both candidate and selected score shapes enforce the existing integer manual_priority range 0..100 inclusive and document default 50; these score fields remain required-present. Required, optional and closed enum fields in that schema reconcile this family's existing minima; additional fields and wrong versions reject. Shape descriptors are redacted structural labels, opaque refs are not retrieval authority, and freeform reason/outcome codes must resolve their actual owner domain; no secrets, source bodies, local absolute paths or capability content may be embedded.

For `scheduler.pass` independently, every timestamp (including nested score observations) must consume its entire RFC3339 UTC string through the final Z, without stripping, normalization or ignored trailing LF/CR/whitespace. Date/time validity remains mandatory. The exact-end schema guard and full-string format checker both apply; source-consistent trailing-LF negatives and isolated schema-field negatives run through the full semantic checker.


`project_id` equals EventRecord.project_id and scope_partition is the Storage project partition for that exact Project. Every payload run_id/thread_id/attempt_id equals the corresponding envelope value when present; no fabricated node/attempt for pre-attempt work. Existing runtime snapshot refs resolve immutable pm.requested_effective_runtime with its package/seam/lane/worktree/account joins; execution_unit_context_ref resolves the versioned Executor schema. All present refs must resolve under source permission/deletion checks. Conditional minima in EP-225 remain normative beyond schema shape checks.

Exact legacy alias for this family: `run.scheduler_analysis`. Import normalization uses Case L-5's existing legacy identity recipe, preserves original bytes/IDs and records source provenance; current writers reject aliases and unsupported revisions. Current writes use the schema above only after separate family admission; no upgrading old payloads on read or silent enum/string substitution.

Pass-two source contract for `scheduler.pass`: EP-225 and `executor.scheduler_pass.source_adapter.v1@1.0.0` bind every source join and conditional presence; the exact companion row supplies the lifecycle table and source roles. Static normalized read captures in `Plans/executor_event_semantic_fixtures.json` are not runtime packets or persisted schema substitutes. Existing payload version/schema, closed enum domains, whole runtime/execution schemas and historical import provenance remain authoritative. No silent alias, discarded original discriminator or missing join may enter a current writer. Run `python3 scripts/pm_executor_event_semantics.py` for this family's own source/transition and receipt/replay/withdrawal oracles.

For `scheduler.pass` independently, current timestamps use the complete UTC grammar `[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z`, with Gregorian calendar validity, hours 00..23, minutes/seconds 00..59, and one or more fractional digits when the dot is present. Leap seconds, missing zones, alternate separators/basic dates, out-of-range dates/times and trailing bytes reject. The standalone schema boundary enforces calendar validity without an optional format plugin. Backoff clock observations require canonical uppercase T and final Z, with the same calendar and range checks, before comparison. Retained records use their authenticated write-time numeric/format edition from SP-515; v0 spelling-only schema checks and its original semantic clock checks remain frozen, so format tightening cannot rewrite or reject a then-valid original. CV-1101 enforcement: every current timestamp of this family, at the payload-schema format boundary and at every owner clock, is checked by the shared `pm_event_datetime.date_time` predicate under the `storage_utc_z` profile and then by the stricter rules above (no second 60; uppercase T for backoff clock observations); a retained original's frozen date-time edition is the one SP-1101 dispatch selects from its authenticated recipe tuple.

```yaml
plan_unit_id: CV-515
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: scheduler.pass@1.0.0 has the exact family-local prepared contract
  in this unit, without Event Authority admission.
gui_related: false
depends_on:
- DL-045
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- scheduler.pass uses its own closed payload, immutable identity, source-backed reader
  and publication/withdrawal fences.
validation_surfaces:
- Plans/executor_event_contract_fixtures.json
- scripts/pm_executor_event_contracts.py
risk_class: unadmitted_or_duplicate_executor_effect
reasoning_tier: high
context_scope: event_authority_wave2_DX
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- scheduler.pass
negative_constraints:
- No admission, runtime proof, retention choice, WorkNode or governance seal.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-225, ContractName:Plans/Contracts_V0.md#CV-515, ContractName:Plans/storage-plan.md#SP-515


### CV-650 - memory.dedup_sweep.completed payload contract

```yaml
plan_unit_id: CV-650
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.dedup_sweep.completed@1.0.0 under
  DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_completed
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is the same-operation started_event_id. Source revision is the
  hash of the frozen canonical corpus revision selected at acceptance; a current snapshot substituted on retry fails.
  occurred_at_utc is strict UTC and is frozen at first logical publication, not retry time. Inline payload only;
  payload_ref=null. The producer validates root, dates, permission, joins and no-secret metadata before append.
  Completed result_ref/hash use this family's SP-bound memresult_ identity and immutable operation outcome;
  status/ref/hash and frozen time must exactly equal the operation and retained original full value. The ref never grants body access. Reject terminal-before-start, mismatched Project/operation/source revision, missing receipt, changed request
  bytes or unsupported version. Event identity and ordered recovery are defined for this family by SP-630, not borrowed
  from another event.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-100
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-651 - memory.dedup_sweep.started payload contract

```yaml
plan_unit_id: CV-651
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.dedup_sweep.started@1.0.0 under
  DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_started
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is null. Source revision is the hash of the frozen canonical
  corpus revision selected at acceptance; a current snapshot substituted on retry fails. occurred_at_utc is strict
  UTC and is frozen at first logical publication, not retry time. Inline payload only; payload_ref=null. The producer
  validates root, dates, permission, joins and no-secret metadata before append. Completed result_ref/hash resolve
  the immutable original outcome under authorized custody and never imply body access. Reject terminal-before-start,
  mismatched Project/operation/source revision, missing receipt, changed request bytes or unsupported version. Event
  identity and ordered recovery are defined for this family by SP-631, not borrowed from another event.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-101
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-652 - memory.index.lexical.rebuild.completed payload contract

```yaml
plan_unit_id: CV-652
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.index.lexical.rebuild.completed@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_completed
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is the same-operation started_event_id. Source revision is the
  hash of the frozen canonical corpus revision selected at acceptance; a current snapshot substituted on retry fails.
  occurred_at_utc is strict UTC and is frozen at first logical publication, not retry time. Inline payload only;
  payload_ref=null. The producer validates root, dates, permission, joins and no-secret metadata before append.
  Completed result_ref/hash use this family's SP-bound memresult_ identity and immutable operation outcome;
  status/ref/hash and frozen time must exactly equal the operation and retained original full value. The ref never grants body access. Reject terminal-before-start, mismatched Project/operation/source revision, missing receipt, changed request
  bytes or unsupported version. Event identity and ordered recovery are defined for this family by SP-632, not borrowed
  from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-102
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-653 - memory.index.lexical.rebuild.started payload contract

```yaml
plan_unit_id: CV-653
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.index.lexical.rebuild.started@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_started
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is null. Source revision is the hash of the frozen canonical
  corpus revision selected at acceptance; a current snapshot substituted on retry fails. occurred_at_utc is strict
  UTC and is frozen at first logical publication, not retry time. Inline payload only; payload_ref=null. The producer
  validates root, dates, permission, joins and no-secret metadata before append. Completed result_ref/hash resolve
  the immutable original outcome under authorized custody and never imply body access. Reject terminal-before-start,
  mismatched Project/operation/source revision, missing receipt, changed request bytes or unsupported version. Event
  identity and ordered recovery are defined for this family by SP-633, not borrowed from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-103
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-654 - memory.index.semantic.rebuild.completed payload contract

```yaml
plan_unit_id: CV-654
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.index.semantic.rebuild.completed@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_completed
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is the same-operation started_event_id. Source revision is the
  hash of the frozen canonical corpus revision selected at acceptance; a current snapshot substituted on retry fails.
  occurred_at_utc is strict UTC and is frozen at first logical publication, not retry time. Inline payload only;
  payload_ref=null. The producer validates root, dates, permission, joins and no-secret metadata before append.
  Completed result_ref/hash use this family's SP-bound memresult_ identity and immutable operation outcome;
  status/ref/hash and frozen time must exactly equal the operation and retained original full value. The ref never grants body access. Reject terminal-before-start, mismatched Project/operation/source revision, missing receipt, changed request
  bytes or unsupported version. Event identity and ordered recovery are defined for this family by SP-634, not borrowed
  from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-104
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-655 - memory.index.semantic.rebuild.started payload contract

```yaml
plan_unit_id: CV-655
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.index.semantic.rebuild.started@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_started
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is null. Source revision is the hash of the frozen canonical
  corpus revision selected at acceptance; a current snapshot substituted on retry fails. occurred_at_utc is strict
  UTC and is frozen at first logical publication, not retry time. Inline payload only; payload_ref=null. The producer
  validates root, dates, permission, joins and no-secret metadata before append. Completed result_ref/hash resolve
  the immutable original outcome under authorized custody and never imply body access. Reject terminal-before-start,
  mismatched Project/operation/source revision, missing receipt, changed request bytes or unsupported version. Event
  identity and ordered recovery are defined for this family by SP-635, not borrowed from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-105
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-656 - memory.verification_sweep.completed payload contract

```yaml
plan_unit_id: CV-656
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.verification_sweep.completed@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_completed
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is the same-operation started_event_id. Source revision is the
  hash of the frozen canonical corpus revision selected at acceptance; a current snapshot substituted on retry fails.
  occurred_at_utc is strict UTC and is frozen at first logical publication, not retry time. Inline payload only;
  payload_ref=null. The producer validates root, dates, permission, joins and no-secret metadata before append.
  Completed result_ref/hash use this family's SP-bound memresult_ identity and immutable operation outcome;
  status/ref/hash and frozen time must exactly equal the operation and retained original full value. The ref never grants body access. Reject terminal-before-start, mismatched Project/operation/source revision, missing receipt, changed request
  bytes or unsupported version. Event identity and ordered recovery are defined for this family by SP-636, not borrowed
  from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-106
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-657 - memory.verification_sweep.started payload contract

```yaml
plan_unit_id: CV-657
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored closed payload owner contract for exactly memory.verification_sweep.started@1.0.0
  under DL-045, searched independently in reports/event-authority-20261104/DMEM-search.json. Payload schema Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_started
  is a distinct closed definition; schema_version and event_type are exact constants. All listed properties are
  required and unknown properties fail. Project id must equal the project_only EventRecord envelope, operation_id
  must equal its correlation_id, causation_event_id is null. Source revision is the hash of the frozen canonical
  corpus revision selected at acceptance; a current snapshot substituted on retry fails. occurred_at_utc is strict
  UTC and is frozen at first logical publication, not retry time. Inline payload only; payload_ref=null. The producer
  validates root, dates, permission, joins and no-secret metadata before append. Completed result_ref/hash resolve
  the immutable original outcome under authorized custody and never imply body access. Reject terminal-before-start,
  mismatched Project/operation/source revision, missing receipt, changed request bytes or unsupported version. Event
  identity and ordered recovery are defined for this family by SP-637, not borrowed from another event.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- AMS-107
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### CV-658 - memory.prune_archive.completed Card 1b contract

```yaml
plan_unit_id: CV-658
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.prune_archive.completed@1.0.0, prepared
  without admission. Search and negative evidence: this exact family''s row in reports/event-authority-20261104/DMEM-card1b-search.json.
  Semantic owner is Plans/assistant-memory-subsystem.md section 7.2, as amended by DL-402, DL-403 and DL-447. This
  unit owns this family''s payload and storage contract. Its producer is MemoryMaintenance.prune_archive.completed.v1@1.0.0
  through cmd.chat.memory.prune_archive, the same authenticated in-process handler for GUI and internal maintenance.
  Project-only edition, never a synthetic Project for AMS-054 app-thread memory; application editions and their
  count bucket require separate owner work.


  Archive eligible very low-activation originals in place with their versions and EvidenceRefs; never delete them.
  Never archive or merge a pinned memory. The optional UCC-085 policy argument may only identify the approved cutoff
  policy, never override it or introduce deletion. Both jobs only archive and only the user deletes a memory (DL-402);
  pins still permit verification, index rebuilds and out-of-date marking. The separate duplicate-sweep survivor and archive disposition follow DL-444 and DL-445; they do not set these archive-job cutoffs.


  Explicit adoption for this exact family: adopt every producer, first-append, operation-CAS, outcome, replay, redaction,
  backup/restore, access, generic checkpoint, compatibility and withdrawal obligation in Plans/storage-plan.md#SP-636,
  including its round-4 start custody gate, and the closed payload/joins of Plans/Contracts_V0.md#CV-656, with the
  following exhaustive substitutions. Replace verification_sweep by prune_archive, command_id by cmd.chat.memory.prune_archive,
  current family by memory.prune_archive.completed, counterpart by memory.prune_archive.started, operation definition
  by Plans/memory_maintenance_operation.schema.json#/$defs/prune_archive, operation family by memory_prune_archive_operation,
  schema_id by pm.storage_value.memory_prune_archive_operation.v1, and history consumer by reader.memory.prune_archive.completed.history.v1@1.0.0.
  No verification action or index target/selector behavior is adopted: this is the four-phase non-index atomic gist
  transaction accepted -> started -> effect_committed -> completed. The payload is its own closed definition Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_prune_archive_completed;
  all declared fields required, additionalProperties=false, version=1.0.0, payload_ref=null. Completed status/result
  ref/hash and started_event_id equal the frozen operation and retained original. Started payload uses the frozen
  acceptance time. Every identifier has exact lengths or full-input guards, including trailing-LF negatives. Ordinary
  inline payloads and operation values stay within 16 KiB under SP-337/SP-340; oversized data uses Storage''s SP-337
  payload-reference protocol rather than embedding memory/evidence bodies, but this bounded edition never accepts
  an oversized inline body or silently changes its schema.


  Identity for exactly memory.prune_archive.completed: event_id="evt_mem_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.prune_archive.completed"]);
  idempotency_key="memory-maintenance:"+the same lower-hex digest. The caller-supplied semantic EventRecord fields
  and payload alone participate in retry equality; sequence_id, observed_at_utc and persisted_at_utc are Storage-assigned
  and excluded. Scope joins use project~{base64url_no_pad(UTF8(project_id))}, never a raw Project or an Application
  key. Replay policy is dedupe_by_idempotency_key. Exact payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_prune_archive_completed.
  Current append and retry refuse projector_replay_only as replay_only_not_appendable, before any original return
  or effect. The closed operation key is memory_prune_archive_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)}
  in memory_maintenance_operations; its schema is admitted only by StorageMigrationCoordinator. Add immutable cutoff_ref
  and cutoff_sha256 to this family''s row; bind the approved cutoff and exact command arguments into the accepted
  request digest. No separate gist store or command journal.


  Start custody gate for exactly memory.prune_archive.completed@1.0.0: CV-658 explicitly adopts SP-286/CV-339 and
  the whole SP-636 start custody rule for this exact operation, not a sibling''s admission. On every path after
  first start admission, resolve the full-flush original memory.prune_archive.started under this operation key through
  storage.first_append_receipt.resolve_full_value.v1. Check recomputed identity, digest, exact Project/operation/source/command/frozen
  time, lawful phase, settled receipt, and all later causation/started_event_id joins; fence withdrawal of either
  edition. Before and again at commit, missing/corrupted/mismatched custody refuses start_receipt_missing, withdrawal
  permission_or_withdrawal; no append, CAS, effect, output or reissuance. The only absence relaxation is memory.prune_archive.started''s
  first append from accepted with no receipt and no later original; an original already present is always verified.
  The terminal advance, retries of either original, recovery in every phase, canonical writer, boundary and history
  read all use this rule. The counterpart''s own unit is CV-659.


  DL-447 answers DL-403 for this exact job with E-CARDS-2 Card 6.d option A. Allow prune/archive to select eligible memories of any kind idle for at least 180 days AND with usefulness score below 0.05. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Archive the selected originals only; retain their evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project. The usefulness ranking is the existing section 6.3 formula, including per-kind and Done decay and zero contribution for missing retrieval scores; captured scores are owner-declared numeric values compared directly with the approved threshold, not integer identity inputs. Do not round scores or introduce a lane-local score range, number cap or serializer.

  The authenticated cutoff binding remains additional to admission and start custody. The missing-cutoffs product decision is resolved, but automatic and Memory-panel dispatch remain unavailable until all remaining definition, review and recording approvals pass. Resolve the exact authenticated owner policy for this job and Project, freeze its ref/content hash and captured selection inputs in the accepted operation/source/request binding, and recheck it before each current writer/effect boundary. If the binding is unavailable, refuse cutoffs_unavailable with unchanged durable state and no output; the panel explains the actual missing approval/binding. Direct invocation, a Boolean, caller policy argument, wrong-scope ref, altered digest or sibling-job approval cannot bypass this gate. Lookup key, resolved self-reference and frozen operation ref identify exactly one owner record; resolved job/scope/Project and recomputed hash agree with every operation/request/start/terminal copy. A coherent rehash cannot authorize contradictory refs. Fixtures inject synthetic resolver authority only to exercise the approved cutoffs, never runtime admission. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main. History reads do not
  require a currently available cutoff: a retained authentic event valid when written remains readable after cutoffs,
  source, request or live counters change; withdrawal, revoked permission, missing start custody or forgery still
  refuses.


  This family''s exact reader reader.memory.prune_archive.completed.history.v1@1.0.0 explicitly adopts SP-278: reader.storage.event_record_index@1.0.0,
  projector.storage.event_record_index@1.0.0, checkpoints/event_record_index_checkpoint.v1:{storage_instance_id},
  Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, atomic root/frontier CAS and generation-qualified
  event_record_index.v2@{generation_id}. Nine-field durable token excludes redb_snapshot_id; ten-field live token
  stays in its read transaction. No family-owned cursor or checkpoint. Join the actual event''s storage identity
  and root; mismatches fail. Preserve BRS-031 coherent canonical memory/operation/receipt/EventRecord boundaries;
  derived indexes rebuild and cannot resurrect deleted gists. All history/ref disclosure rechecks current access,
  deletion/hold state and withdrawal, and never exposes note, prompt, embedding, path, secret or EvidenceRef bodies.
  Result refs are opaque and grant no access.


  Retention for this exact Project event is RP-OPERATIONAL-2555D@1.0.0 under DL-401/G04, landed in Plans/Decision_Log.md on main with the CA-RET assignment in Plans/storage-plan.md and Plans/storage_value_registry.json
  (read on this lane at origin/plans/ea-retention-cards1-20261104 2663667e14346235daaa561d193e959422640b6e): 2,555 days, terminal-transition anchor, 2,000,000 per Project, refuse
  new records at cap, all existing holds/live/recovery/backup references override expiry. Counts/outcomes only,
  never memory text. This supersedes only SP-636''s pending EVENT assignment for this adoption. Canonical operation/result
  custody retention remains PENDING_RETENTION_DECISION and native activation stays fenced until its owner resolves
  that independent policy; no retention rule for underlying memories is selected. Generic index/checkpoint policies
  stay RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN. Application count bucket is unresolved and no Application event
  edition is prepared.


  Only exact edition 1.0.0 is specified. Incompatible/unknown editions fail closed while original bytes survive
  authorized historical reads. Withdrawal first fences this family''s command/writer, retains unresolved original
  custody without reissue, then fences its exact reader and invalidates its live tokens under the same maintenance/read
  fence; other generic readers continue. A successor requires explicit admission and retained-source rebuild; no
  alias or migration by resemblance. Oracles are ATS-316 and scripts/pm_memory_archive_events.py, including positive
  conditional lifecycle, failed outcome, original retry, crash/recovery, historical independence, archive/evidence/pin
  negatives, unavailable buttons and guard-removal proof. Native execution is NOT_RUN. Membership is ABSENT; no
  admission or readiness follows from this unit. The started and completed payloads also require cutoff_ref and
  cutoff_sha256 exactly equal to the immutable operation fields, so start custody freezes the selected approval
  across recovery and retries.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer''s returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage''s sealed custody of that exact retained record, never from the record''s schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader''s, or a recipe with no installed verifier refuses at the site''s custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row''s frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe''s frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  Before archive selection and post-state validation, every resolved memory''s pinned and archived fields in both input and output must have the exact Boolean type. A malformed flag refuses the whole settlement without state change or output; correctly typed pins and all original versions/EvidenceRefs retain the existing DL-402 preservation rules.'
gui_related: true
gui_classification_reason: Binds unavailable Memory-panel buttons as well as typed maintenance events.
depends_on:
- DL-045
- SP-636
- CV-656
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Exact family has its own conditional contract; approved DL-447 cutoff; no admission.
- Archive-only, pin/evidence preservation and cutoff refusal pass ATS-316.
validation_surfaces:
- python3 scripts/pm_memory_archive_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_DMEM_card1b_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-card1b-search.json
- DL-402/DL-403 on origin/plans/ea-cards1-answers-20261104 at b6332f391a7870bad5f01a29a7e9d080050dac27
preserved_exact_tokens:
- memory.prune_archive.completed
- cutoffs_unavailable
- RP-OPERATIONAL-2555D@1.0.0
negative_constraints:
- No admission, automatic deletion, user deletion policy expansion, app edition or native proof.
```


### CV-659 - memory.prune_archive.started Card 1b contract

```yaml
plan_unit_id: CV-659
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.prune_archive.started@1.0.0, prepared
  without admission. Search and negative evidence: this exact family''s row in reports/event-authority-20261104/DMEM-card1b-search.json.
  Semantic owner is Plans/assistant-memory-subsystem.md section 7.2, as amended by DL-402, DL-403 and DL-447. This
  unit owns this family''s payload and storage contract. Its producer is MemoryMaintenance.prune_archive.started.v1@1.0.0
  through cmd.chat.memory.prune_archive, the same authenticated in-process handler for GUI and internal maintenance.
  Project-only edition, never a synthetic Project for AMS-054 app-thread memory; application editions and their
  count bucket require separate owner work.


  Archive eligible very low-activation originals in place with their versions and EvidenceRefs; never delete them.
  Never archive or merge a pinned memory. The optional UCC-085 policy argument may only identify the approved cutoff
  policy, never override it or introduce deletion. Both jobs only archive and only the user deletes a memory (DL-402);
  pins still permit verification, index rebuilds and out-of-date marking. The separate duplicate-sweep survivor and archive disposition follow DL-444 and DL-445; they do not set these archive-job cutoffs.


  Explicit adoption for this exact family: adopt every producer, first-append, operation-CAS, outcome, replay, redaction,
  backup/restore, access, generic checkpoint, compatibility and withdrawal obligation in Plans/storage-plan.md#SP-637,
  including its round-4 start custody gate, and the closed payload/joins of Plans/Contracts_V0.md#CV-657, with the
  following exhaustive substitutions. Replace verification_sweep by prune_archive, command_id by cmd.chat.memory.prune_archive,
  current family by memory.prune_archive.started, counterpart by memory.prune_archive.completed, operation definition
  by Plans/memory_maintenance_operation.schema.json#/$defs/prune_archive, operation family by memory_prune_archive_operation,
  schema_id by pm.storage_value.memory_prune_archive_operation.v1, and history consumer by reader.memory.prune_archive.started.history.v1@1.0.0.
  No verification action or index target/selector behavior is adopted: this is the four-phase non-index atomic gist
  transaction accepted -> started -> effect_committed -> completed. The payload is its own closed definition Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_prune_archive_started;
  all declared fields required, additionalProperties=false, version=1.0.0, payload_ref=null. Completed status/result
  ref/hash and started_event_id equal the frozen operation and retained original. Started payload uses the frozen
  acceptance time. Every identifier has exact lengths or full-input guards, including trailing-LF negatives. Ordinary
  inline payloads and operation values stay within 16 KiB under SP-337/SP-340; oversized data uses Storage''s SP-337
  payload-reference protocol rather than embedding memory/evidence bodies, but this bounded edition never accepts
  an oversized inline body or silently changes its schema.


  Identity for exactly memory.prune_archive.started: event_id="evt_mem_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.prune_archive.started"]);
  idempotency_key="memory-maintenance:"+the same lower-hex digest. The caller-supplied semantic EventRecord fields
  and payload alone participate in retry equality; sequence_id, observed_at_utc and persisted_at_utc are Storage-assigned
  and excluded. Scope joins use project~{base64url_no_pad(UTF8(project_id))}, never a raw Project or an Application
  key. Replay policy is dedupe_by_idempotency_key. Exact payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_prune_archive_started.
  Current append and retry refuse projector_replay_only as replay_only_not_appendable, before any original return
  or effect. The closed operation key is memory_prune_archive_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)}
  in memory_maintenance_operations; its schema is admitted only by StorageMigrationCoordinator. Add immutable cutoff_ref
  and cutoff_sha256 to this family''s row; bind the approved cutoff and exact command arguments into the accepted
  request digest. No separate gist store or command journal.


  Start custody gate for exactly memory.prune_archive.started@1.0.0: CV-659 explicitly adopts SP-286/CV-339 and
  the whole SP-637 start custody rule for this exact operation, not a sibling''s admission. On every path after
  first start admission, resolve the full-flush original memory.prune_archive.started under this operation key through
  storage.first_append_receipt.resolve_full_value.v1. Check recomputed identity, digest, exact Project/operation/source/command/frozen
  time, lawful phase, settled receipt, and all later causation/started_event_id joins; fence withdrawal of either
  edition. Before and again at commit, missing/corrupted/mismatched custody refuses start_receipt_missing, withdrawal
  permission_or_withdrawal; no append, CAS, effect, output or reissuance. The only absence relaxation is memory.prune_archive.started''s
  first append from accepted with no receipt and no later original; an original already present is always verified.
  The terminal advance, retries of either original, recovery in every phase, canonical writer, boundary and history
  read all use this rule. The counterpart''s own unit is CV-658.


  DL-447 answers DL-403 for this exact job with E-CARDS-2 Card 6.d option A. Allow prune/archive to select eligible memories of any kind idle for at least 180 days AND with usefulness score below 0.05. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Archive the selected originals only; retain their evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project. The usefulness ranking is the existing section 6.3 formula, including per-kind and Done decay and zero contribution for missing retrieval scores; captured scores are owner-declared numeric values compared directly with the approved threshold, not integer identity inputs. Do not round scores or introduce a lane-local score range, number cap or serializer.

  The authenticated cutoff binding remains additional to admission and start custody. The missing-cutoffs product decision is resolved, but automatic and Memory-panel dispatch remain unavailable until all remaining definition, review and recording approvals pass. Resolve the exact authenticated owner policy for this job and Project, freeze its ref/content hash and captured selection inputs in the accepted operation/source/request binding, and recheck it before each current writer/effect boundary. If the binding is unavailable, refuse cutoffs_unavailable with unchanged durable state and no output; the panel explains the actual missing approval/binding. Direct invocation, a Boolean, caller policy argument, wrong-scope ref, altered digest or sibling-job approval cannot bypass this gate. Lookup key, resolved self-reference and frozen operation ref identify exactly one owner record; resolved job/scope/Project and recomputed hash agree with every operation/request/start/terminal copy. A coherent rehash cannot authorize contradictory refs. Fixtures inject synthetic resolver authority only to exercise the approved cutoffs, never runtime admission. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main. History reads do not
  require a currently available cutoff: a retained authentic event valid when written remains readable after cutoffs,
  source, request or live counters change; withdrawal, revoked permission, missing start custody or forgery still
  refuses.


  This family''s exact reader reader.memory.prune_archive.started.history.v1@1.0.0 explicitly adopts SP-278: reader.storage.event_record_index@1.0.0,
  projector.storage.event_record_index@1.0.0, checkpoints/event_record_index_checkpoint.v1:{storage_instance_id},
  Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, atomic root/frontier CAS and generation-qualified
  event_record_index.v2@{generation_id}. Nine-field durable token excludes redb_snapshot_id; ten-field live token
  stays in its read transaction. No family-owned cursor or checkpoint. Join the actual event''s storage identity
  and root; mismatches fail. Preserve BRS-031 coherent canonical memory/operation/receipt/EventRecord boundaries;
  derived indexes rebuild and cannot resurrect deleted gists. All history/ref disclosure rechecks current access,
  deletion/hold state and withdrawal, and never exposes note, prompt, embedding, path, secret or EvidenceRef bodies.
  Result refs are opaque and grant no access.


  Retention for this exact Project event is RP-OPERATIONAL-2555D@1.0.0 under DL-401/G04, landed in Plans/Decision_Log.md on main with the CA-RET assignment in Plans/storage-plan.md and Plans/storage_value_registry.json
  (read on this lane at origin/plans/ea-retention-cards1-20261104 2663667e14346235daaa561d193e959422640b6e): 2,555 days, terminal-transition anchor, 2,000,000 per Project, refuse
  new records at cap, all existing holds/live/recovery/backup references override expiry. Counts/outcomes only,
  never memory text. This supersedes only SP-637''s pending EVENT assignment for this adoption. Canonical operation/result
  custody retention remains PENDING_RETENTION_DECISION and native activation stays fenced until its owner resolves
  that independent policy; no retention rule for underlying memories is selected. Generic index/checkpoint policies
  stay RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN. Application count bucket is unresolved and no Application event
  edition is prepared.


  Only exact edition 1.0.0 is specified. Incompatible/unknown editions fail closed while original bytes survive
  authorized historical reads. Withdrawal first fences this family''s command/writer, retains unresolved original
  custody without reissue, then fences its exact reader and invalidates its live tokens under the same maintenance/read
  fence; other generic readers continue. A successor requires explicit admission and retained-source rebuild; no
  alias or migration by resemblance. Oracles are ATS-316 and scripts/pm_memory_archive_events.py, including positive
  conditional lifecycle, failed outcome, original retry, crash/recovery, historical independence, archive/evidence/pin
  negatives, unavailable buttons and guard-removal proof. Native execution is NOT_RUN. Membership is ABSENT; no
  admission or readiness follows from this unit. The started and completed payloads also require cutoff_ref and
  cutoff_sha256 exactly equal to the immutable operation fields, so start custody freezes the selected approval
  across recovery and retries.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer''s returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage''s sealed custody of that exact retained record, never from the record''s schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader''s, or a recipe with no installed verifier refuses at the site''s custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row''s frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe''s frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  Before archive selection and post-state validation, every resolved memory''s pinned and archived fields in both input and output must have the exact Boolean type. A malformed flag refuses the whole settlement without state change or output; correctly typed pins and all original versions/EvidenceRefs retain the existing DL-402 preservation rules.'
gui_related: true
gui_classification_reason: Binds unavailable Memory-panel buttons as well as typed maintenance events.
depends_on:
- DL-045
- SP-637
- CV-657
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Exact family has its own conditional contract; approved DL-447 cutoff; no admission.
- Archive-only, pin/evidence preservation and cutoff refusal pass ATS-316.
validation_surfaces:
- python3 scripts/pm_memory_archive_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_DMEM_card1b_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-card1b-search.json
- DL-402/DL-403 on origin/plans/ea-cards1-answers-20261104 at b6332f391a7870bad5f01a29a7e9d080050dac27
preserved_exact_tokens:
- memory.prune_archive.started
- cutoffs_unavailable
- RP-OPERATIONAL-2555D@1.0.0
negative_constraints:
- No admission, automatic deletion, user deletion policy expansion, app edition or native proof.
```


### CV-660 — doctor.custom_headless.checked closed payload.

```yaml
plan_unit_id: CV-660
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  doctor.custom_headless.checked closed payload.
  Exact schema pm.ds15.doctor_custom_headless_checked.payload.v1 at Plans/ds15_doctor_custom_headless_checked.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_doctor_custom_headless_checked_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-217, with Plans/storage-plan.md#SP-640. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 doctor.custom_headless.checked: adopt Plans/newtools.md#N2-217 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-660
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-661 — tool.custom_headless.skipped — withdrawn DS15 draft; DT question reference

```yaml
{
  "plan_unit_id": "CV-661",
  "unit_type": "contract",
  "status": "superseded",
  "owner_doc": "Plans/Contracts_V0.md",
  "canonical_text": "Historical withdrawal of the unsupported tool.custom_headless.skipped draft. DL-436 (deck-2 item 4.f) now resolves first-absent-check eligibility/reset/import/restore; the newly authored DS15 owner contract is Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-326. DT cites DS15 rather than holding a separate row. This old unit id remains retired and is not reused; it grants no admission.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "No DS15 draft remains; DT question stays unresolved."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/Contracts_V0.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "CV-661"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/Contracts_V0.md"
  ]
}
```


### CV-662 — live.session.started closed payload.

```yaml
plan_unit_id: CV-662
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  live.session.started closed payload.
  Exact schema pm.ds15.live_session_started.payload.v1 at Plans/ds15_live_session_started.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_live_session_started_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-219, with Plans/storage-plan.md#SP-642. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 live.session.started: adopt Plans/newtools.md#N2-219 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-662
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-663 — live.step.updated closed payload.

```yaml
plan_unit_id: CV-663
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  live.step.updated closed payload.
  Exact schema pm.ds15.live_step_updated.payload.v1 at Plans/ds15_live_step_updated.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_live_step_updated_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-220, with Plans/storage-plan.md#SP-643. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 live.step.updated: adopt Plans/newtools.md#N2-220 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-663
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-664 — live.artifact.created closed payload.

```yaml
plan_unit_id: CV-664
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  live.artifact.created closed payload.
  Exact schema pm.ds15.live_artifact_created.payload.v1 at Plans/ds15_live_artifact_created.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_live_artifact_created_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-221, with Plans/storage-plan.md#SP-644. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 live.artifact.created: adopt Plans/newtools.md#N2-221 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-664
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-665 — live.session.completed closed payload.

```yaml
plan_unit_id: CV-665
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  live.session.completed closed payload.
  Exact schema pm.ds15.live_session_completed.payload.v1 at Plans/ds15_live_session_completed.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_live_session_completed_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-222, with Plans/storage-plan.md#SP-645. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 live.session.completed: adopt Plans/newtools.md#N2-222 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-665
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-666 — live.session.degraded closed payload.

```yaml
plan_unit_id: CV-666
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  live.session.degraded closed payload.
  Exact schema pm.ds15.live_session_degraded.payload.v1 at Plans/ds15_live_session_degraded.schema.json, revision 1.0.0; closed checkpoint Plans/ds15_live_session_degraded_checkpoint.schema.json. Adopt the entire family-specific producer, scope, identity, replay, custody, transitions and withdrawal contract Plans/newtools.md#N2-223, with Plans/storage-plan.md#SP-646. Unknown fields or versions refuse; no alias, admission or native proof. retention_policy_ref = PENDING_RETENTION_DECISION.
  Round 7 live.session.degraded: adopt Plans/newtools.md#N2-223 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-666
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-667 — browser.context_captured closed payload

```yaml
plan_unit_id: CV-667
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  browser.context_captured@1.0.0 uses exact closed Plans/ds15_browser_context_captured.schema.json and checkpoint Plans/ds15_browser_context_captured_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-310 and Plans/storage-plan.md#SP-647 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Chip value binding: Plans/ds15_browser_capture_chip_v2.schema.json governs the typed browser entry inside composer_prep_state.v1:{thread_id}. No browser-owned composer or separate chip storage family. Migration validates actual thread/namespace and preserves sibling entries and draft bytes; unresolved legacy chip stays visibly unavailable, never silently reassigned. Append/passive replay cannot recreate a chip that the user sent or removed. Read/serialization rechecks current permissions, source deletion and chip blocked/expired/scrubbed/revoked state; unavailable chips may remain visible but never serialize as successful attachments.
  Application identity follows CV-366 exactly: application@1:{hex(server_id)}:{hex(owner_operation_id)}, using UTF-8 lowercase hex of OriginalBrowserTransitionSource.server_id and immutable original_operation_id through owner.browser.transition.application@1.0.0. Preserve original source/thread/chip/ordinary user/Computer/profile/BrowserSession joins and SP-286 full-value custody. Wrong or absent original identity and a raw tuple/scope hash refuse. The Project MessagePack recipe remains unchanged; scope_key is a checkpoint namespace only. Append recovery rejects projector_replay_only as replay_only_not_appendable; publication rechecks current permission/source/access while retained receipt resolution remains independent of retired controls.
  Round 7 browser.context_captured: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-310 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-667
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-668 — dev.session.started closed payload

```yaml
plan_unit_id: CV-668
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  dev.session.started@1.0.0 uses exact closed Plans/ds15_dev_session_started.schema.json and checkpoint Plans/ds15_dev_session_started_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-311 and Plans/storage-plan.md#SP-648 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.started: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-311 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-668
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-669 — dev.session.stopping closed payload

```yaml
plan_unit_id: CV-669
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  dev.session.stopping@1.0.0 uses exact closed Plans/ds15_dev_session_stopping.schema.json and checkpoint Plans/ds15_dev_session_stopping_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-312 and Plans/storage-plan.md#SP-649 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.stopping: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-312 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-669
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-670 — dev.session.stopped closed payload

```yaml
plan_unit_id: CV-670
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  dev.session.stopped@1.0.0 uses exact closed Plans/ds15_dev_session_stopped.schema.json and checkpoint Plans/ds15_dev_session_stopped_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-313 and Plans/storage-plan.md#SP-650 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.stopped: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-313 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-670
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-671 — dev.session.restarting closed payload

```yaml
plan_unit_id: CV-671
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  dev.session.restarting@1.0.0 uses exact closed Plans/ds15_dev_session_restarting.schema.json and checkpoint Plans/ds15_dev_session_restarting_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-314 and Plans/storage-plan.md#SP-651 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.restarting: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-314 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-671
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-672 — preview.session.started closed payload

```yaml
plan_unit_id: CV-672
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  preview.session.started@1.0.0 uses exact closed Plans/ds15_preview_session_started.schema.json and checkpoint Plans/ds15_preview_session_started_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-315 and Plans/storage-plan.md#SP-652 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.started: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-315 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-672
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-673 — preview.session.refreshed closed payload

```yaml
plan_unit_id: CV-673
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  preview.session.refreshed@1.0.0 uses exact closed Plans/ds15_preview_session_refreshed.schema.json and checkpoint Plans/ds15_preview_session_refreshed_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-316 and Plans/storage-plan.md#SP-653 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.refreshed: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-316 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-673
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-674 — preview.session.stopped closed payload

```yaml
plan_unit_id: CV-674
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  preview.session.stopped@1.0.0 uses exact closed Plans/ds15_preview_session_stopped.schema.json and checkpoint Plans/ds15_preview_session_stopped_checkpoint.schema.json. Independently adopts entire Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-317 and Plans/storage-plan.md#SP-654 including producer ordering, scope/identity, transitions, replay, original custody, permission/deletion and compatibility/withdrawal. Unknown fields/versions refuse; no admission. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.stopped: adopt Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-317 retained-reader policy, custody on every operation, exact authority types and per-row Storage joins. Plans/ds15_authority_context.schema.json is the closed side-input boundary; schema/value acceptance alone is not custody.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-674
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-675 — Developer workflow/DAP versioned codec

```yaml
plan_unit_id: CV-675
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  dev_session_record.v1 versioned aggregate value binding (newly authored technical closure, DL-045). Section15 owns the developer workflow (209,244-247,9433); Shared Runtime 10.1 owns subordinate DebugSessionBroker mechanics. The physical key remains dev_session_record.v1:{project_id}:{dev_session_id}, value version 2.0.0, schema pm.storage_value.dev_session_record.v2 at Plans/ds15_dev_session_record_v2.schema.json#/$defs/dev_session_record. No parallel root identity or fabricated DAP id. workflow carries its state/revision/operation/outcome and actual optional run/thread/workspace/terminal links; dap is null for non-debug work, else the unchanged complete DAP v1 value with its independent generation/state/waiter evidence. Outer and nested project_id/dev_session_id and DAP topology.project_id must agree. Workflow state is never used as DAP state or PTY liveness. A DAP state change needs its own verified DebugSessionBroker outcome and existing waiter/trigger checks; workflow stop alone authorizes none.
  Migration: keep the original exact closed shared_runtime_contracts.schema.json DAP v1 codec for read-only import. Validate its schema AND existing pm-shared-runtime-contracts.py semantic rules first; copy every DAP field byte-equivalently to dap under the same outer root ids, set workflow=null when no verified workflow source exists, and never infer workflow state from DAP state. A verified legacy Section15 workflow source may populate workflow without DAP; validate exact links/outcome. Ambiguous root joins or missing original outcome refuse. StorageMigrationCoordinator makes a backed-up transaction, verifies canonical MessagePack codec roundtrip and full-value SP-286 outcome/first-receipt custody, then writes the schema/store version last. No lazy rewrite. Original per-transition outcomes remain immutable in adopted SP-286/CV-339 full-value v2 custody; the mutable latest workflow row cannot substitute for an earlier outcome on retry.
  Recovery: this existing canonical_non_rebuildable family retains mandatory backup and disclosure on absent/corrupt bytes; do not rebuild from events or infer live PTY/DAP state. After restart verify runtime owners before any mutation. Writer/reader withdrawal follows each event contract. SP-339/SP-340 existing canonical projects_and_sources profile and 16384-byte encoded ceiling remain. Retention for the expanded v2 workflow/DAP combination is PENDING_RETENTION_DECISION for RT; existing DAP-only v1 remains RP-DEBUG-30D under its unchanged scope, never extended to workflow by inference. No retention/deletion ruling. Static codec/schema/migration vectors in Plans/ds15_value_contract_fixtures.json run through scripts/pm-ds15-event-contracts.py; native execution NOT_RUN.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-675
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-676 — Preview subject UI versioned value

```yaml
plan_unit_id: CV-676
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  preview_state subject/UI v2 technical binding (DL-045). FinalGUISpec:3584 and rewrite-tie-in-memo:231-302 establish subject-owned UI restore intent distinct from runtime PreviewSession and BrowserSession. Canonical write key preview_state.v1:{project_id}:{preview_subject_id}; a legacy preview_id key is read-only input, never a second subject identity. Plans/ds15_preview_state_v2.schema.json closes value version 2.0.0 with actual subject/source ref, restore intent, attachment target, export-prefs ref, scroll sync, last error and historical runtime/revision refs. runtime_verification is always unverified in persisted UI state. Runtime state created/loading/ready/stale/degraded/error/closed belongs to the actual live PreviewSession, not this UI cache. Opening/revealing preserves runtime identity when the existing subject/source_revision/surface-kind/transport tuple is unchanged; source changes use owner-resolved identity, never a guessed old live session. Optional BrowserSession overlay stays independent. No DOM/browser-storage/live instance serialization or automatic automation resume.
  Migration: old preview_state.v1:{project_id}:{preview_id} with legacy starting/running/stopped/error is accepted only with an owner-verified exact mapping of legacy preview_id/source_file to preview_subject_id/source ref, and authoritative saved intent/attachment/export/scroll/error state. Never equate preview_id with preview_session_id. Missing or multiple mappings are unavailable; do not guess a subject, invent UI preferences or a live session. Preserve legacy status for diagnostics, set runtime_verification=unverified and last_preview_session_id=null when no verified historical identity exists. Explicit StorageMigrationCoordinator backup/copy-forward/codec verification writes the new key/version last and records the old key read-only; fail closed on ambiguous migration. Preserve all existing UI preferences and owned refs. Restore uses subject intent and creates a new live runtime as needed through existing commands, never deserializes old running.
  The materialized ds15_preview_subject_ui_state family is canonical UI intent with mandatory backup, bounded to SP-339/SP-340 16384 encoded bytes in canonical redb settings_and_layout; original transition outcomes are held by SP-286/CV-339 full-value v2, not reconstructed from latest UI state. Grouped deferred inventory is lineage only and excludes this now-materialized key. No retention/deletion policy is selected: its new exact policy is PENDING_RETENTION_DECISION for RT. Existing refresh/hot-reload actions bind independently in SMPFS-316; ordinary browser reload uses UCC-117, non-browser refresh never dispatches browser commands. Versioned schema/migration plus runtime/subject mismatch oracles run via scripts/pm-ds15-event-contracts.py; native execution NOT_RUN.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-676
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-677 — catalog.install.started payload contract

```yaml
plan_unit_id: CV-677
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'catalog.install.started@1.0.0 exact closed payload Plans/ds15_catalog_install_started.schema.json and checkpoint
  Plans/ds15_catalog_install_started_checkpoint.schema.json. Independently adopts complete Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-318
  and Plans/storage-plan.md#SP-657: producer/order, actual scope/identity, CV-317 semantic retry, original SP-286 custody,
  historical replay-only compatibility, Storage joins, disclosure/redaction and withdrawal. Exact family context in Plans/ds15_authority_context.schema.json
  validates types before comparisons/hash. No unregistered write or update/remove policy. Native NOT_RUN.'
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- SMPFS-318
- SP-657
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-677
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```


### CV-678 — catalog.install.completed payload contract

```yaml
plan_unit_id: CV-678
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'catalog.install.completed@1.0.0 exact closed payload Plans/ds15_catalog_install_completed.schema.json and
  checkpoint Plans/ds15_catalog_install_completed_checkpoint.schema.json. Independently adopts complete Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-319
  and Plans/storage-plan.md#SP-658: producer/order, actual scope/identity, CV-317 semantic retry, original SP-286 custody,
  historical replay-only compatibility, Storage joins, disclosure/redaction and withdrawal. Exact family context in Plans/ds15_authority_context.schema.json
  validates types before comparisons/hash. No unregistered write or update/remove policy. Native NOT_RUN.'
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- SMPFS-319
- SP-658
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- CV-678
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Contracts_V0.md
```

### CV-680 - alert.acknowledged exact payload and storage route

```yaml
plan_unit_id: CV-680
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: alert.acknowledged 1.0.0 uses only Plans/event_payloads/attention/alert_acknowledged.schema.json,
  schema id pm.attention_event.alert_acknowledged.schema.v1. Root and nested field closure, required fields and
  enums are binding. Semantic currentness, Project/actor/identity joins, result revision succession, exact original
  retry, SP-286/CV-339 full-value custody, SP-278/DL-076 history and withdrawal are individually specified in Plans/storage-plan.md#SP-660;
  Plans/FinalGUISpec.md#F3-700 owns the visible action. These routes grant no admission; retention_policy_ref PENDING_RETENTION_DECISION.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.acknowledged is denied until its own admission; exact identity, custody, recovery and negative paths are
  checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_acknowledged
implementation_surfaces:
- Plans/event_payloads/attention/alert_acknowledged.schema.json
- Plans/storage-plan.md#SP-660
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.acknowledged
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### CV-681 - alert.dismissed exact payload and storage route

```yaml
plan_unit_id: CV-681
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: alert.dismissed 1.0.0 uses only Plans/event_payloads/attention/alert_dismissed.schema.json, schema
  id pm.attention_event.alert_dismissed.schema.v1. Root and nested field closure, required fields and enums are
  binding. Semantic currentness, Project/actor/identity joins, result revision succession, exact original retry,
  SP-286/CV-339 full-value custody, SP-278/DL-076 history and withdrawal are individually specified in Plans/storage-plan.md#SP-661;
  Plans/FinalGUISpec.md#F3-701 owns the visible action. These routes grant no admission; retention_policy_ref PENDING_RETENTION_DECISION.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.dismissed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_dismissed
implementation_surfaces:
- Plans/event_payloads/attention/alert_dismissed.schema.json
- Plans/storage-plan.md#SP-661
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.dismissed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### CV-682 - alert.rule_muted exact payload and storage route

```yaml
plan_unit_id: CV-682
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: alert.rule_muted 1.0.0 uses only Plans/event_payloads/attention/alert_rule_muted.schema.json, schema
  id pm.attention_event.alert_rule_muted.schema.v1. Root and nested field closure, required fields and enums are
  binding. Semantic currentness, Project/actor/identity joins, result revision succession, exact original retry,
  SP-286/CV-339 full-value custody, SP-278/DL-076 history and withdrawal are individually specified in Plans/storage-plan.md#SP-662;
  Plans/FinalGUISpec.md#F3-702 owns the visible action. These routes grant no admission; retention_policy_ref PENDING_RETENTION_DECISION.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.rule_muted is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_rule_muted
implementation_surfaces:
- Plans/event_payloads/attention/alert_rule_muted.schema.json
- Plans/storage-plan.md#SP-662
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.rule_muted
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### CV-683 - alert.snoozed exact payload and storage route

```yaml
plan_unit_id: CV-683
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: alert.snoozed 1.0.0 uses only Plans/event_payloads/attention/alert_snoozed.schema.json, schema id
  pm.attention_event.alert_snoozed.schema.v1. Root and nested field closure, required fields and enums are binding.
  Semantic currentness, Project/actor/identity joins, result revision succession, exact original retry, SP-286/CV-339
  full-value custody, SP-278/DL-076 history and withdrawal are individually specified in Plans/storage-plan.md#SP-663;
  Plans/FinalGUISpec.md#F3-703 owns the visible action. These routes grant no admission; retention_policy_ref PENDING_RETENTION_DECISION.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.snoozed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_snoozed
implementation_surfaces:
- Plans/event_payloads/attention/alert_snoozed.schema.json
- Plans/storage-plan.md#SP-663
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.snoozed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### CV-684 - panel.redocked current payload and historical reader

```yaml
plan_unit_id: CV-684
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: panel.redocked current payload 2.0.0 is the closed Plans/event_payloads/panel_redocked_v2.schema.json
  (pm.event.panel_redocked.v2). Only cmd.panel.redock/panel_id=chat is valid. Current receipts audit a settled transient
  host observation, host_state_persisted=false, co-emission=false, no Home revision. Immutable v1 schema stays historical-only
  and dispatches by its own stored schema id/version. The complete independent producer, original receipt/identity/custody,
  SP-286 full-value recovery, SP-278 bounded History, withdrawal and retention-pending contract is SP-664; semantic
  owner F3-704. No admission or native proof.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- SP-664
- CV-361
unblocks: []
acceptance_criteria:
- CV-684 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### CV-685 - panel.undocked current payload and historical reader

```yaml
plan_unit_id: CV-685
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: panel.undocked current payload 2.0.0 is the closed Plans/event_payloads/panel_undocked_v2.schema.json
  (pm.event.panel_undocked.v2). Only cmd.panel.undock/panel_id=chat is valid. Current receipts audit a settled transient
  host observation, host_state_persisted=false, co-emission=false, no Home revision. Immutable v1 schema stays historical-only
  and dispatches by its own stored schema id/version. The complete independent producer, original receipt/identity/custody,
  SP-286 full-value recovery, SP-278 bounded History, withdrawal and retention-pending contract is SP-665; semantic
  owner F3-705. No admission or native proof.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- SP-665
- CV-361
unblocks: []
acceptance_criteria:
- CV-685 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### CV-686 - concern.created closed current payload and authority route

```yaml
plan_unit_id: CV-686
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: concern.created current 1.0.0 selects the existing closed Plans/event_payloads/concern/concern_created.schema.json,
  pm.concern_event.concern_created.schema.v1. OP-002/OP-004 and Executor_Protocol authorize only runtime, package
  overseer, seam overseer, corroboration outcome and graph-patch logic; workers nominate. Owner-kind User/External
  Resource/Recovery labels confer no creator grant. Absent -> active, revision one, creator separate from owner/resolver,
  source event distinct from canonical record and projection. Semantic owner remains Orchestrator_Page; SP-666 is
  the independently authored full original command/identity/digest/producer ordering/SP-286 full-value receipt/custody/SP-278
  consumer/checkpoint/replay/withdrawal/physical-value contract. The complete digest binds original_command, candidate_payload
  and candidate_record without omissions. Record body summary/title and evidence stay authenticated immutable refs
  with SP-337 addressing for large detail. Project-only EventRecord 2.0.0 and encoded project~ partition; dedupe_by_idempotency_key
  current append/retry, projector_replay_only refuses replay_only_not_appendable. No additional direct creator,
  confirmation policy, sibling concern action, admission, retention assignment or native execution proof is authorized.
  Event membership ABSENT; event/operation/checkpoint retention PENDING_RETENTION_DECISION. Static positive and
  negative oracles are independently python3 scripts/pm-concern-created-contracts-check.py and this family's fixture;
  native execution NOT_RUN.
  Current semantic numbers follow CV-1100 and SP-1100, beside the CV-317, CV-339, SP-278 and SP-286 profile owners, as
  exact JSON integer tokens parsed by loads_current_json and admitted by current_integer at each schema integer slot within
  that field's own schema bounds, with no lane-wide cap. Refuse floats (including integral/exponent spellings), Boolean values,
  negative-zero tokens and leading zeros before schema/semantic use, identity hashing or retry comparison; never coerce
  retained originals, whose write-time recipe SP-1101 selects. Storage-assigned sequence/frontier fields retain their u64
  physical domain (SP-1100), with the same exact integer representation. Timestamps follow CV-1101 through the shared date_time predicate with the owner profile of each field. Payload,
  state and record date-time fields, EventRecord occurred_at_utc and the first-receipt acknowledged_at_utc take the
  EventRecord profile (RFC 3339 with T or t, Z, z or a signed offset, real calendar and offset ranges, a legitimate
  offset-adjusted leap second, year 0000 and any number of fractional digits; a missing zone, space separator,
  trailing LF or illegitimate second 60 refuses), and the two Storage-assigned EventRecord instants that CV-253
  binds take its storage_utc_z profile. Strings are never rewritten; instants compare exactly with offsets applied, every
  fractional digit kept and a leap second ordered within its minute. Enforce date-time and UUID formats without
  optional package dependencies.
  The family-specific input-domain and guard oracle is scripts/pm-dg6a-domain-check.py alongside its full family checker.
gui_related: false
gui_classification_reason: Event identity, authority, custody and storage contract; existing GUI action model is
  preserved.
split_recommended: false
depends_on:
- OP-004
- SP-666
unblocks: []
acceptance_criteria:
- concern.created is prepared without admission; no writer/checkpoint/effect while absent.
- No additional creator or sibling action authority; retention pending and native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-concern-created-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: concern_created
implementation_surfaces:
- Plans/concern_created_contracts/
- Plans/event_payloads/concern/concern_created.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Orchestrator_Page.md#OP-002
- Plans/Orchestrator_Page.md#OP-004
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md#UCC-147
preserved_exact_tokens:
- concern.created
- SP-278
- SP-286
- PENDING_RETENTION_DECISION
negative_constraints:
- No creator expansion, worker direct creation, admission, sibling action grants, retention decision or native proof.
```


### CV-780 - browser.session.created identity replay and withdrawal

```yaml
plan_unit_id: CV-780
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly browser.session.created@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/browser_session_created; Project pm.browser.session.created.payload.v1
  and application pm.browser.session.created.payload.application.v1, version 1.0.0, must match actual scope. Envelope
  Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have Run/Attempt null
  together and no invented node. The existing owner first reserves one original operation ID with its immutable
  source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives restart/recovery/backup.
  Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application idempotency is
  exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes): browser.session.created
  current inputs enter only as exact integer tokens (a -0 token is refused at parsing), and every EventRecord and
  payload integer slot admits only an exact current integer, so an integral float such as 1.0, 1e0 or -0.0 is
  refused at the slot. The retry comparison is the shared qualified producer projection (producer_semantic_bytes /
  producer_semantic_digest); a projection that RFC 8785 cannot carry exactly, for example producer_sequence_id
  2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect, while 2^53 encodes exactly. Storage-
  assigned sequence_id follows SP-1100 and stays outside producer semantics. The idempotency, event_id and CV-366
  key recipes are unchanged. Timestamps and retained originals, sweep 2026-11-11 (CV-1101 beside CV-253 and CV-317;
  SP-1101): every timestamp field uses the shared CV-1101 date_time predicate with its owner''s profile, never a
  lane grammar. occurred_at_utc and payload ts take the broad event_record profile (T or t, Z, z or an hh:mm
  offset, legitimate leap seconds, any fraction length); Storage-assigned observed_at_utc and persisted_at_utc also
  take CV-253''s storage_utc_z profile (terminal uppercase Z only), on the current record, the retry original and
  retained history alike. A retry original and a retained history read are first resolved once through the shared
  SP-1101 RetainedDispatcher from Storage''s sealed write custody (static stand-in
  Plans/card2_original_custody.json, never a request field): a Store outside that custody refuses as
  original_unavailable and a sealed recipe without an installed frozen verifier as recipe_unknown, with no
  fallback, current-then-legacy probing or caller override. The only write-time recipe is card2@1, whose tuple pins
  the EventRecord and family payload schema bytes and these field profiles. Owner-valid lowercase, offset,
  leap-second and long-fraction history stays readable with its exact spelling; an offset or lowercase-z Storage
  timestamp never becomes valid history.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-780
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.created
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### CV-781 - browser.session.state_changed identity replay and withdrawal

```yaml
plan_unit_id: CV-781
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly browser.session.state_changed@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/browser_session_state_changed; Project pm.browser.session.state_changed.payload.v1
  and application pm.browser.session.state_changed.payload.application.v1, version 1.0.0, must match actual scope.
  Envelope Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have Run/Attempt
  null together and no invented node. The existing owner first reserves one original operation ID with its immutable
  source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives restart/recovery/backup.
  Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application idempotency is
  exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes):
  browser.session.state_changed current inputs enter only as exact integer tokens (a -0 token is refused at
  parsing), and every EventRecord and payload integer slot admits only an exact current integer, so an integral
  float such as 1.0, 1e0 or -0.0 is refused at the slot. The retry comparison is the shared qualified producer
  projection (producer_semantic_bytes / producer_semantic_digest); a projection that RFC 8785 cannot carry
  exactly, for example producer_sequence_id 2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect,
  while 2^53 encodes exactly. Storage-assigned sequence_id follows SP-1100 and stays outside producer semantics.
  The idempotency, event_id and CV-366 key recipes are unchanged. Timestamps and retained originals, sweep
  2026-11-11 (CV-1101 beside CV-253 and CV-317; SP-1101): every timestamp field uses the shared CV-1101 date_time
  predicate with its owner''s profile, never a lane grammar. occurred_at_utc and payload ts take the broad
  event_record profile (T or t, Z, z or an hh:mm offset, legitimate leap seconds, any fraction length);
  Storage-assigned observed_at_utc and persisted_at_utc also take CV-253''s storage_utc_z profile (terminal
  uppercase Z only), on the current record, the retry original and retained history alike. A retry original and a
  retained history read are first resolved once through the shared SP-1101 RetainedDispatcher from Storage''s
  sealed write custody (static stand-in Plans/card2_original_custody.json, never a request field): a Store outside
  that custody refuses as original_unavailable and a sealed recipe without an installed frozen verifier as
  recipe_unknown, with no fallback, current-then-legacy probing or caller override. The only write-time recipe is
  card2@1, whose tuple pins the EventRecord and family payload schema bytes and these field profiles. Owner-valid
  lowercase, offset, leap-second and long-fraction history stays readable with its exact spelling; an offset or
  lowercase-z Storage timestamp never becomes valid history.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-781
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### CV-782 - browser.session.closed identity replay and withdrawal

```yaml
plan_unit_id: CV-782
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly browser.session.closed@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/browser_session_closed; Project pm.browser.session.closed.payload.v1
  and application pm.browser.session.closed.payload.application.v1, version 1.0.0, must match actual scope. Envelope
  Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have Run/Attempt null
  together and no invented node. The existing owner first reserves one original operation ID with its immutable
  source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives restart/recovery/backup.
  Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application idempotency is
  exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes): browser.session.closed
  current inputs enter only as exact integer tokens (a -0 token is refused at parsing), and every EventRecord and
  payload integer slot admits only an exact current integer, so an integral float such as 1.0, 1e0 or -0.0 is
  refused at the slot. The retry comparison is the shared qualified producer projection (producer_semantic_bytes /
  producer_semantic_digest); a projection that RFC 8785 cannot carry exactly, for example producer_sequence_id
  2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect, while 2^53 encodes exactly. Storage-
  assigned sequence_id follows SP-1100 and stays outside producer semantics. The idempotency, event_id and CV-366
  key recipes are unchanged. Timestamps and retained originals, sweep 2026-11-11 (CV-1101 beside CV-253 and CV-317;
  SP-1101): every timestamp field uses the shared CV-1101 date_time predicate with its owner''s profile, never a
  lane grammar. occurred_at_utc and payload ts take the broad event_record profile (T or t, Z, z or an hh:mm
  offset, legitimate leap seconds, any fraction length); Storage-assigned observed_at_utc and persisted_at_utc also
  take CV-253''s storage_utc_z profile (terminal uppercase Z only), on the current record, the retry original and
  retained history alike. A retry original and a retained history read are first resolved once through the shared
  SP-1101 RetainedDispatcher from Storage''s sealed write custody (static stand-in
  Plans/card2_original_custody.json, never a request field): a Store outside that custody refuses as
  original_unavailable and a sealed recipe without an installed frozen verifier as recipe_unknown, with no
  fallback, current-then-legacy probing or caller override. The only write-time recipe is card2@1, whose tuple pins
  the EventRecord and family payload schema bytes and these field profiles. Owner-valid lowercase, offset,
  leap-second and long-fraction history stays readable with its exact spelling; an offset or lowercase-z Storage
  timestamp never becomes valid history.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-782
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.closed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### CV-783 - browser.session.promoted identity replay and withdrawal

```yaml
plan_unit_id: CV-783
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly browser.session.promoted@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/browser_session_promoted; Project pm.browser.session.promoted.payload.v1
  and application pm.browser.session.promoted.payload.application.v1, version 1.0.0, must match actual scope. Envelope
  Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have Run/Attempt null
  together and no invented node. The existing owner first reserves one original operation ID with its immutable
  source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives restart/recovery/backup.
  Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application idempotency is
  exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes): browser.session.promoted
  current inputs enter only as exact integer tokens (a -0 token is refused at parsing), and every EventRecord and
  payload integer slot admits only an exact current integer, so an integral float such as 1.0, 1e0 or -0.0 is
  refused at the slot. The retry comparison is the shared qualified producer projection (producer_semantic_bytes /
  producer_semantic_digest); a projection that RFC 8785 cannot carry exactly, for example producer_sequence_id
  2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect, while 2^53 encodes exactly. Storage-
  assigned sequence_id follows SP-1100 and stays outside producer semantics. The idempotency, event_id and CV-366
  key recipes are unchanged. Timestamps and retained originals, sweep 2026-11-11 (CV-1101 beside CV-253 and CV-317;
  SP-1101): every timestamp field uses the shared CV-1101 date_time predicate with its owner''s profile, never a
  lane grammar. occurred_at_utc and payload ts take the broad event_record profile (T or t, Z, z or an hh:mm
  offset, legitimate leap seconds, any fraction length); Storage-assigned observed_at_utc and persisted_at_utc also
  take CV-253''s storage_utc_z profile (terminal uppercase Z only), on the current record, the retry original and
  retained history alike. A retry original and a retained history read are first resolved once through the shared
  SP-1101 RetainedDispatcher from Storage''s sealed write custody (static stand-in
  Plans/card2_original_custody.json, never a request field): a Store outside that custody refuses as
  original_unavailable and a sealed recipe without an installed frozen verifier as recipe_unknown, with no
  fallback, current-then-legacy probing or caller override. The only write-time recipe is card2@1, whose tuple pins
  the EventRecord and family payload schema bytes and these field profiles. Owner-valid lowercase, offset,
  leap-second and long-fraction history stays readable with its exact spelling; an offset or lowercase-z Storage
  timestamp never becomes valid history.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-783
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.promoted
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### CV-784 - browser.session.takeover_state_changed identity replay and withdrawal

```yaml
plan_unit_id: CV-784
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly browser.session.takeover_state_changed@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/browser_session_takeover_state_changed; Project pm.browser.session.takeover_state_changed.payload.v1
  and application pm.browser.session.takeover_state_changed.payload.application.v1, version 1.0.0, must match actual
  scope. Envelope Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have
  Run/Attempt null together and no invented node. The existing owner first reserves one original operation ID with
  its immutable source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives
  restart/recovery/backup. Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application
  idempotency is exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes):
  browser.session.takeover_state_changed current inputs enter only as exact integer tokens (a -0 token is refused
  at parsing), and every EventRecord and payload integer slot admits only an exact current integer, so an integral
  float such as 1.0, 1e0 or -0.0 is refused at the slot. The retry comparison is the shared qualified producer
  projection (producer_semantic_bytes / producer_semantic_digest); a projection that RFC 8785 cannot carry
  exactly, for example producer_sequence_id 2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect,
  while 2^53 encodes exactly. Storage-assigned sequence_id follows SP-1100 and stays outside producer semantics.
  The idempotency, event_id and CV-366 key recipes are unchanged. Timestamps and retained originals, sweep
  2026-11-11 (CV-1101 beside CV-253 and CV-317; SP-1101): every timestamp field uses the shared CV-1101 date_time
  predicate with its owner''s profile, never a lane grammar. occurred_at_utc and payload ts take the broad
  event_record profile (T or t, Z, z or an hh:mm offset, legitimate leap seconds, any fraction length);
  Storage-assigned observed_at_utc and persisted_at_utc also take CV-253''s storage_utc_z profile (terminal
  uppercase Z only), on the current record, the retry original and retained history alike. A retry original and a
  retained history read are first resolved once through the shared SP-1101 RetainedDispatcher from Storage''s
  sealed write custody (static stand-in Plans/card2_original_custody.json, never a request field): a Store outside
  that custody refuses as original_unavailable and a sealed recipe without an installed frozen verifier as
  recipe_unknown, with no fallback, current-then-legacy probing or caller override. The only write-time recipe is
  card2@1, whose tuple pins the EventRecord and family payload schema bytes and these field profiles. Owner-valid
  lowercase, offset, leap-second and long-fraction history stays readable with its exact spelling; an offset or
  lowercase-z Storage timestamp never becomes valid history.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-784
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.takeover_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### CV-785 - memory.gist_state_changed identity replay and withdrawal

```yaml
plan_unit_id: CV-785
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored owner contract, exactly memory.gist_state_changed@1.0.0. Adopt Contracts_V0#EventRecord
  2.0.0 and its complete producer_semantic_digest recipe unchanged, plus SP-026/SP-236 SeglogFrameV2 and SP-286/CV-339
  strict full-value v2 first-AppendReceipt custody. No local envelope or digest is created. Exact family payload/schema
  routing is Plans/card2_event_payloads.schema.json#/$defs/memory_gist_state_changed; Project pm.memory.gist_state_changed.payload.v1
  and application pm.memory.gist_state_changed.payload.application.v1, version 1.0.0, must match actual scope. Envelope
  Project/thread/Run/Attempt joins match the genuine source; non-execution manual operations have Run/Attempt null
  together and no invented node. The existing owner first reserves one original operation ID with its immutable
  source and event obligation; that ID is unique for the lifetime of its actual Home Server and survives restart/recovery/backup.
  Its per-effect component is exact UTF-8 event_type + '':'' + original operation ID. Application idempotency is
  exactly application@1:{hex(server_id)}:{hex(component)} under CV-366; Project uses card2@1:{hex(server_id)}:{hex(component)}
  within the unchanged (scope_partition,event_type,idempotency_key) lifetime. Project partition is project~ plus
  unpadded base64url of exact UTF-8 project_id; application is app. Global event_id is ''card2:'' followed by colon-separated
  lowercase UTF-8 hex of storage_instance_id, server_id, original operation ID and exact event_type. It is reserved
  once, never regenerated from observation/retry time, and cannot be reused for another semantic event. Lost original
  identity never authorizes a new one.

  The producer-owned semantic comparison is precisely the central EventRecord recipe: caller-supplied semantics
  only; exclude Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. Same identity/same semantic
  digest returns the original event/result with zero new effects; a different semantic digest is idempotency_conflict;
  authoritative dedupe unavailable is dedupe_unavailable with zero append/effects. Never select or accept projector_replay_only
  on current append or retry: reject replay_only_not_appendable. Compatibility reading it grants no write/effect
  permission. No-op, failed, refused or unknown owner outcome cannot claim a successful event. After actual family
  admission, order is authenticated owner acceptance/reservation, canonical owner body commit and durable event
  obligation, ordinary Storage append/commit-frame issuance under SP-286, exact first receipt custody, then dependent
  terminal result publication. Pending event obligations retain their original source and retry only append resolution;
  no crash reruns a browser effect or memory edit. An unavailable family refuses execution before a history-dependent
  change; these drafts grant no native writer.

  Compatibility dispatch is exact family/version/schema ID; unrecognized successors quarantine instead of guessing
  or translating a retired spelling. Preserve retained original records and their original source custody; migration
  is forward-only with a separately governed successor. Withdrawal sets an explicit writer admission cutoff before
  stopping the old producer, drains or fences original pending obligations through SP-286, removes that version
  from live acceptance and reader publication, invalidates reader caches, and rebuilds only generic derived metadata
  from still-admitted genuine sources. A removed reader is fenced even for historical events; an authorized retained
  historical reader does not compare the old transition to today''s subject state. Restore preserves cutoff/withdrawal
  and original results; missing source, ambiguous version, incoherent backup, forged receipt or withdrawn source
  refuses. This unit grants no registration and no native proof.

  Before retry returns or recovers an original, authenticate its exact EventRecord from Storage and validate
  its envelope, family/version/payload schema, recomputed event/idempotency identity, original immutable owner
  records and original transition. Verify the original observation byte-for-value against that record; verify
  sequence_id, observed_at_utc and persisted_at_utc independently against the Storage-issued first receipt,
  including integer bounds and real timestamp syntax/calendar validity. These assigned fields remain excluded
  from caller-semantic equality. A changed candidate observation time or sequence does not create a conflict;
  a forged original or receipt never becomes the original result. Historical original validation uses its original
  accepted schema/policy, including genuine compatibility replay-only history, without current live-state or
  current-writer policy guards. Current candidate append/retry still refuses replay_only_not_appendable, and
  withdrawn, forged, foreign or unavailable custody refuses on every path.

  Numbers, sweep 2026-11-10 (CV-1100 beside the unchanged CV-317 and CV-366 recipes): memory.gist_state_changed
  current inputs enter only as exact integer tokens (a -0 token is refused at parsing), and every EventRecord and
  payload integer slot admits only an exact current integer, so an integral float such as 1.0, 1e0 or -0.0 is
  refused at the slot. The retry comparison is the shared qualified producer projection (producer_semantic_bytes /
  producer_semantic_digest); a projection that RFC 8785 cannot carry exactly, for example producer_sequence_id
  2^53+1, 2^60 or 2^64-1, is refused before any append or owner effect, while 2^53 encodes exactly. Storage-
  assigned sequence_id follows SP-1100 and stays outside producer semantics. The idempotency, event_id and CV-366
  key recipes are unchanged. Timestamps and retained originals, sweep 2026-11-11 (CV-1101 beside CV-253 and CV-317;
  SP-1101): every timestamp field uses the shared CV-1101 date_time predicate with its owner''s profile, never a
  lane grammar. occurred_at_utc and payload ts take the broad event_record profile (T or t, Z, z or an hh:mm
  offset, legitimate leap seconds, any fraction length); Storage-assigned observed_at_utc and persisted_at_utc also
  take CV-253''s storage_utc_z profile (terminal uppercase Z only), on the current record, the retry original and
  retained history alike. A retry original and a retained history read are first resolved once through the shared
  SP-1101 RetainedDispatcher from Storage''s sealed write custody (static stand-in
  Plans/card2_original_custody.json, never a request field): a Store outside that custody refuses as
  original_unavailable and a sealed recipe without an installed frozen verifier as recipe_unknown, with no
  fallback, current-then-legacy probing or caller override. The only write-time recipe is card2@1, whose tuple pins
  the EventRecord and family payload schema bytes and these field profiles. Owner-valid lowercase, offset,
  leap-second and long-fraction history stays readable with its exact spelling; an offset or lowercase-z Storage
  timestamp never becomes valid history. The memory record times (created_at, updated_at, last_access_at and
  each claim created_at) name no stricter owner profile, so the shared predicate checks them with the same broad
  event_record profile.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Canonical semantic digest and CV-366 app key remain exact.
- Current append and retry reject projector_replay_only; all family identity/receipt/withdrawal negatives reject.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_cv-785
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- memory.gist_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```

### CV-560 - FileManager exact payload routes

- file.copied@1.0.0: Plans/event_payloads/file_manager/file_copied.schema.json; semantic owner F-150.
- file.created@1.0.0: Plans/event_payloads/file_manager/file_created.schema.json; semantic owner F-151.
- file.deleted@1.0.0: Plans/event_payloads/file_manager/file_deleted.schema.json; semantic owner F-152.
- file.exported@1.0.0: Plans/event_payloads/file_manager/file_exported.schema.json; semantic owner F-153.
- file.moved@1.0.0: Plans/event_payloads/file_manager/file_moved.schema.json; semantic owner F-154.
- file.renamed@1.0.0: Plans/event_payloads/file_manager/file_renamed.schema.json; semantic owner F-155.
- folder.copied@1.0.0: Plans/event_payloads/file_manager/folder_copied.schema.json; semantic owner F-156.
- folder.created@1.0.0: Plans/event_payloads/file_manager/folder_created.schema.json; semantic owner F-157.
- folder.deleted@1.0.0: Plans/event_payloads/file_manager/folder_deleted.schema.json; semantic owner F-158.
- folder.exported@1.0.0: Plans/event_payloads/file_manager/folder_exported.schema.json; semantic owner F-159.
- folder.moved@1.0.0: Plans/event_payloads/file_manager/folder_moved.schema.json; semantic owner F-160.
- folder.renamed@1.0.0: Plans/event_payloads/file_manager/folder_renamed.schema.json; semantic owner F-161.
Each closed root is adopted independently under its own schema_id and schema_version. Opaque references resolve original owner receipt entries, never raw filesystem paths. No family is admitted.

The newly authored closed Plans/filemanager_operation_contracts.schema.json types operation_custody,
accepted_command, settlement, path_snapshot_entry and family_control are adopted by each own F unit
through SP-560. Accepted descriptor/store/epoch and settled payload/path originals are immutable;
only accepted -> effect_settled -> history_settled or accepted -> no_event_settled revision CAS
transitions are permitted; the latter has a closed noncompletion receipt and no completed event. Exact
receipt_ref/key, family/payload discriminator, command/envelope/scope, path coverage and source/
result/container joins are semantic requirements in addition to closed shape validation. Copy result
identity differs from source; create result differs from destination container, including native aliases.
Unknown schemas, unequal retries, unavailable originals, bad joins or late changes fence. The separate
SP-286/CV-339 full_value_request/full_value_result and strict v2 witness remain their original shapes;
resolve.v2 is semantic replay only and cannot establish full-value equality. SP-560 supplies literal
physical keys, resolvers, transaction fences, activation and coherent backup/restore; the generic
receipt_record_baseline supplies none of this authority. No admission is granted.

SP-560 also owns the closed physical operation_custody_value/family_control_value union and its
SP-337 whole-value reference branches; operation_custody/family_control remain resolved logical
contracts. Both physical profiles use canonical redb, coordination_and_storage and max_value_bytes=16384.
The BLAKE3/size/media reference spelling and canonical MessagePack boundary are explicit in SP-560.
A large event uses payload={} and payload_ref, resolving the complete closed family payload before
settlement joins while strict full-value proof keeps the original stored representation. Missing or
changed original pack bytes refuse reading, CAS and terminal publication. Terminal history_settled
binds the exact immutable settlement, original complete EventRecord, original receipt and strict
resolve_full_value.v1 request/result/v2 witness, not merely individually valid shapes. Current writer
and retry reject projector_replay_only with replay_only_not_appendable. CV-339 semantic retry equality
excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc; original-value recovery does not.

Numbers follow CV-1100, SP-1100 and SP-1101 beside the existing CV-317, CV-339, SP-236, SP-286, SP-337 and
SP-339 owners. Each family's identity T stays the RFC 8785 string array of its F unit, qualified by CV-1100:
non-ASCII strings encode exactly and a lone surrogate refuses. The custody_v2 producer_semantic_digest is the
CV-317 producer projection under CV-1100 qualified JCS, so an integer whose binary64 value or emitted JCS
decimal differs from it (for example 2^53+1 or 2^60) refuses before any effect. Every declared integer slot of
a current write is an exact integer within its schema range, and bool, float or decimal values refuse there:
the payload path_snapshot_revision and descendant_count, operation recovery_epoch, revision and every
path_snapshot_revision, and control control_revision, last_admitted_sequence and writer_cutoff_sequence.
EventRecord bodies are measured and referenced with SP-1100 EVENT_VALUE (SP-236) bytes; operation and control
redb values keep SP-339 canonical MessagePack. A retained original is read with the recipe recorded when it
was written (SP-1101); current integer admission never narrows it.

Timestamps follow CV-1101 beside CV-253. Every format: date-time of these routes is checked by the shared
CV-1101 predicate, and a missing zone, a space separator, a trailing LF, an impossible date or clock field
and a false leap second refuse everywhere. The family payload ts, the companion accepted_at_utc and
settled_at_utc, the EventRecord occurred_at_utc and the AppendReceipt acknowledged_at_utc use its
event_record profile: lowercase t or z, offsets, real leap seconds and fractions of any length are accepted
and never rewritten. The Storage-assigned observed_at_utc and persisted_at_utc of every EventRecord these
routes read also take CV-253's storage_utc_z profile, so an offset, a signed zero offset or a lowercase z
refuses there. occurred_at_utc and
settled_at_utc still equal payload ts as exact strings. A retained original is resolved through SP-1101: its
write-time edition and frozen resource manifest come only from Storage's sealed issuance custody, never from
the request; an original without that record is unavailable, and an edition or resource set with no installed
verifier is unsupported, each refused without trying the current recipe. The twelve families have one
write-time edition. Its frozen verifier applies the same CV-1101 and CV-253 profiles, so a format check that
was skipped in the past never admits an invalid original.

```yaml
plan_unit_id: CV-560
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  FileManager exact payload routes: the preceding per-family routes and obligations are prepared without admission.
  Each family retains its own semantic contract; retention is PENDING_RETENTION_DECISION.
gui_related: false
gui_classification_reason: Internal event contract routing and static assurance.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - No registry append, policy selection or native readiness claim.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
risk_class: file_event_contract_routing
reasoning_tier: high
context_scope: filemanager_event_authority
implementation_surfaces: [Plans/Contracts_V0.md, Plans/filemanager_operation_contracts.schema.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/FileManager.md, Plans/Decision_Log.md#DL-045]
preserved_exact_tokens: ["PENDING_RETENTION_DECISION"]
negative_constraints:
  - Do not treat prepared contracts as event admission.
owner_hints: [Plans/Contracts_V0.md]
```


### CV-620 - Event Authority format.applied closed payload

```yaml
plan_unit_id: CV-620
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  format.applied closed payload
  format.applied 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/format_applied.schema.json (pm.event_payload.format_applied.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: HTE formatter completion adapter. After a successful HTE write/edit formatter changes the tool output beyond whitespace, capture the tool-output and formatted-output evidence refs before publication. DAE remains unenforceable; whitespace-only changes and failed formatter output emit no format.applied.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["format.applied", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="format.applied:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.timestamp byte-for-byte from the original HTE write/edit operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for format.applied: actor_ref is the non-empty non-secret actor reference retained by the original HTE write/edit operation from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original HTE result must join formatter_id, project-relative file_path, diff_bytes and both output refs exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.evidence.format_applied@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for format.applied: HTE formatter output and formatted body remain behind the two authorized evidence refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with HTE formatter completion adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. file_path, where present, is a FileSafe-approved project-relative display path. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.evidence.format_applied@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for format.applied: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns HTE formatter completion adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  format.applied append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for format.applied: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for format.applied authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for format.applied: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-600
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-621 - Event Authority lsp.server.lifecycle_changed closed payload

```yaml
plan_unit_id: CV-621
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  lsp.server.lifecycle_changed closed payload
  lsp.server.lifecycle_changed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/lsp_server_lifecycle_changed.schema.json (pm.event_payload.lsp_server_lifecycle_changed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. LSP previous_state and state must differ and the original supervisor observation must prove that exact Host/server/root/session edge under LSPSupport section 14.3. A valid enum alone never proves a transition.
  Producer: LspSupervisor lifecycle adapter. Observe one LspSupervisor transition for the exact Host/server/root attachment. Use canonical states Starting, Initializing, Ready, RestartBackoff, Degraded, ShuttingDown, Stopped (LSPSupport section 14.3); legacy stopped/starting/initializing/ready/degraded/stopping map by meaning, and a crash is a reason on RestartBackoff or Stopped rather than a new canonical state. No replay spawns a server, sends initialize, reopens a document or retries a crash.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["lsp.server.lifecycle_changed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="lsp.server.lifecycle_changed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=no_secrets. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.ts byte-for-byte from the original LspSupervisor Host/server/root/session observation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for lsp.server.lifecycle_changed: actor_ref is the non-empty non-secret actor reference retained by the original LspSupervisor Host/server/root/session observation identifying the actual LspSupervisor service for payload.host_id (not the focused editor user). correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original observation must join payload.host_id, server_id, root_identity, lsp_session_id, previous_state, state and ts exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.lsp.lifecycle@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for lsp.server.lifecycle_changed: only opaque attachment identities, canonical states and a sanitized bounded reason code are inline; raw logs, URIs, paths and server stderr are forbidden; redaction_profile=no_secrets is an existing EventRecord value and does not grant source access.
  Custody remains with LspSupervisor lifecycle adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.lsp.lifecycle@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for lsp.server.lifecycle_changed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns LspSupervisor lifecycle adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  lsp.server.lifecycle_changed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for lsp.server.lifecycle_changed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for lsp.server.lifecycle_changed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for lsp.server.lifecycle_changed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-601
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-622 - Event Authority model.catalog_refreshed closed payload

```yaml
plan_unit_id: CV-622
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  model.catalog_refreshed closed payload
  model.catalog_refreshed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/model_catalog_refreshed.schema.json (pm.event_payload.model_catalog_refreshed.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: shared model capability resolver refresh completion adapter. Capture completion of cmd.model.refresh, or the already specified automatic refresh, after the resolver publishes its exact catalog revision and provider status refs. A partial refresh remains partial in those status refs; stale cached entries never imply provider readiness. Failure before a new revision publishes emits no completion.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["model.catalog_refreshed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="model.catalog_refreshed:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For model.catalog_refreshed, server_id is the actual Server identity durably frozen by its original shared model capability resolver refresh completion adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original Models manual or automatic catalog refresh; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for model.catalog_refreshed: actor_ref is the non-empty non-secret actor reference retained by the original Models manual or automatic catalog refresh: the accepted cmd.model.refresh actor for a manual refresh, or the actual resolver service actor for an automatic refresh. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The published original Models revision must join model_catalog_revision, provider_status_refs, provider_id and account_id exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For model.catalog_refreshed, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.models.catalog_refresh@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for model.catalog_refreshed: provider status bodies and sensitive provider/account details remain behind authorized refs; account_id is an opaque Models identifier, never credentials; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with shared model capability resolver refresh completion adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.models.catalog_refresh@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for model.catalog_refreshed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns shared model capability resolver refresh completion adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  model.catalog_refreshed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for model.catalog_refreshed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for model.catalog_refreshed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for model.catalog_refreshed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-602
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-623 - Event Authority subagent.context_rehydrated closed payload

```yaml
plan_unit_id: CV-623
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  subagent.context_rehydrated closed payload
  subagent.context_rehydrated 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_rehydrated.schema.json (pm.event_payload.subagent_context_rehydrated.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime rehydration adapter. When an already supported rehydration restores effective context, bind the original source refs and before/after effective-context revisions to the exact child identity. Source access/deletion checks precede restoration. No source history is rewritten, no missing source is fabricated, and replay never rehydrates or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_rehydrated", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_rehydrated:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_rehydrated, server_id is the actual Server identity durably frozen by its original effective-context runtime rehydration adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context rehydration operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_rehydrated: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context rehydration operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_rehydrated, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.rehydrated@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_rehydrated: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime rehydration adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.rehydrated@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_rehydrated: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime rehydration adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_rehydrated append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_rehydrated: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_rehydrated authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for subagent.context_rehydrated: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-603
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-624 - Event Authority subagent.context_shrunk closed payload

```yaml
plan_unit_id: CV-624
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  subagent.context_shrunk closed payload
  subagent.context_shrunk 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_shrunk.schema.json (pm.event_payload.subagent_context_shrunk.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime shrinking adapter. When the existing effective-context shrinker commits a shorter replacement, preserve source refs and rehydration handles. Automatic default scope remains tool results; optional retrieved/plan blocks require their existing configuration. Protected working-set, system/provider/persona/tool definitions remain immune. No original history is rewritten and replay never shrinks or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_shrunk", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_shrunk:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_shrunk, server_id is the actual Server identity durably frozen by its original effective-context runtime shrinking adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context shrink operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_shrunk: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context shrink operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_shrunk, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.shrunk@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_shrunk: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime shrinking adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.shrunk@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_shrunk: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime shrinking adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_shrunk append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_shrunk: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_shrunk authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for subagent.context_shrunk: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-604
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-625 - Event Authority project.added closed payload

```yaml
plan_unit_id: CV-625
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  project.added closed payload
  project.added 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_added.schema.json (pm.event_payload.project_added.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project registration commit adapter. After cmd.project.add_existing completes atomic projects:v1 identity/config/permission/owner handoff and readback, record its existing-content registration once. A failed registration, temporary mount, list-only open/archive/remove, or unverified restore creates no completion. Restore-as-new requires its verified Backup terminal receipt first. This event observes the completed registration; it does not grant permission, create files or replace the Project result.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.added", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.added:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original completed Project existing-content registration; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.added: actor_ref is the non-empty non-secret actor reference retained by the original completed Project existing-content registration from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.added@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.added: stable config and original registration result remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project registration commit adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.added@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.added: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project registration commit adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.added append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.added: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.added authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for project.added: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-605
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-626 - Event Authority project.created closed payload

```yaml
plan_unit_id: CV-626
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  project.created closed payload
  project.created 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_created.schema.json (pm.event_payload.project_created.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project creation composition terminal adapter. After cmd.project.new_local or an admitted current forge-create composition completes all reviewed owner steps and atomic Project registry/readback, capture the exact new identity and terminal receipt. Remote create alone, effect_unknown, partial failure and merely reserving a Project ID never produce completion. Resume publishes only after verified remaining steps complete under its original root creation intent; retry never repeats forge or filesystem effects. Existing-content add alone produces no project.created. The two Project event candidates are distinct by original semantic action, not command-name aliases.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.created", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.created:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original root Project creation composition; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.created: actor_ref is the non-empty non-secret actor reference retained by the original root Project creation composition from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.created@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.created: stable config, verified creation result and original terminal receipt remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project creation composition terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.created@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.created: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project creation composition terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.created append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.created: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.created authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for project.created: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-606
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### CV-627 - Event Authority git.clone.completed closed payload

```yaml
plan_unit_id: CV-627
unit_type: event_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  git.clone.completed closed payload
  git.clone.completed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/git_clone_completed.schema.json (pm.event_payload.git_clone_completed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: ordinary Git clone terminal adapter. Observe succeeded cmd.source_control.repository.clone with scm_backend=git only after owner native completion, destination verification and terminal operation receipt. The reserved Project/repository/workspace/Host/Environment lineage is original intent data, never focused Project. This precedes Project registration and cannot certify its success. Jujutsu cmd.jujutsu.git.clone is distinct and never normalized to this spelling. Failed, cancelled, effect_unknown or merely accepted ObservableWork emits no completion. Current Source_Control_System sections 7/9 route the old catalog spelling to this ordinary Git producer without reviving cmd.git.clone.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["git.clone.completed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="git.clone.completed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original ordinary Git clone command operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for git.clone.completed: actor_ref is the non-empty non-secret actor reference retained by the original ordinary Git clone command operation from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original terminal result must join payload.repo_id, workspace_id, host_id, environment_id, source_location_ref and operation_receipt_ref exactly, including the reserved Project identity. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.scm.git_clone_completed@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for git.clone.completed: source location and original terminal receipt remain behind authorized refs; URLs with credentials and private absolute destinations are forbidden; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with ordinary Git clone terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.scm.git_clone_completed@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for git.clone.completed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns ordinary Git clone terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  git.clone.completed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for git.clone.completed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for git.clone.completed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for git.clone.completed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-607
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```
