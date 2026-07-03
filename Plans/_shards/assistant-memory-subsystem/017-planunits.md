# Shard 017: PlanUnits

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L547-L2328

Source SHA256: `c7f89c2068357690c163ae7d5ca4471fbc527d6562e7b72bdd8b90f62b8553f2`

---

## PlanUnits

### AMS-001 - Assistant-Only Memory Subsystem (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: AMS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after
  Phase 2B atomized assistant-memory-subsystem-S0001 through
  assistant-memory-subsystem-S0042 into AMS-002 through AMS-041. AMS-001
  remains only as migration lineage for the retired bridge span and must not
  re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - AMS-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior source coverage remains carried by AMS-002 through AMS-041.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 012 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0043
preserved_exact_tokens:
  - "AMS-001"
  - "source_preserving_planunit"
  - "AMS-002"
  - "AMS-041"
negative_constraints:
  - "Do not remap atomized assistant-memory-subsystem spans back to AMS-001."
  - "Do not treat the retired bridge as implementation-ready product coverage."
  - "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
  - "The old source-preserving bridge is retained only so migration lineage and historical references to AMS-001 remain auditable."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-002 - Assistant Memory SSOT Authority

```yaml
plan_unit_id: AMS-002
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Assistant Memory remains the canonical Assistant-only memory subsystem SSOT,
  preserving the document title, compliance posture, status, cross-references,
  and 2026-02-26 revision packet for Evidence-Backed Gists, MemoryGist plus
  EvidenceRef, AutoRunBoundary/AutoMilestone, Tantivy/USearch, and the GUI Gist
  Review panel.
gui_related: true
gui_classification_reason: The authority packet names the GUI Gist Review panel and user-visible memory subsystem scope.
depends_on: []
unblocks: [AMS-003, AMS-005, AMS-021]
acceptance_criteria:
  - The document remains the canonical SSOT for Assistant-only memory behavior.
  - The 2026-02-26 revision packet is preserved with its named model, trigger, index, and GUI concepts.
  - Compliance, status, and cross-reference authority remain visible in the source body.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_authority
reasoning_tier: standard
context_scope: plan_authority
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: assistant_memory_ssot_authority
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0002
preserved_exact_tokens:
  - "Assistant-Only Memory Subsystem (Canonical SSOT)"
  - "Evidence-Backed Gists"
  - "MemoryGist + EvidenceRef"
  - "AutoRunBoundary/AutoMilestone"
  - "Tantivy/USearch"
  - "GUI Gist Review panel"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-003 - Assistant Memory Scope Separation

```yaml
plan_unit_id: AMS-003
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory is Assistant-only continuity and project state, separate from rules assembly, non-Assistant execution paths, seglog storage, system redb/Tantivy projections, and the shared rules pipeline.
gui_related: false
gui_classification_reason: Scope separation is backend architecture and owner-boundary behavior.
depends_on: [AMS-002]
unblocks: [AMS-005, AMS-018, AMS-024]
acceptance_criteria:
  - Assistant memory is separate from rules assembly and non-Assistant execution paths.
  - Assistant memory does not replace or redefine seglog, system redb/Tantivy projections, or the shared rules pipeline.
  - The storage, DRY, and agent-rules ContractRefs remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: architecture
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/agent-rules-context.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_memory_scope_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0003
preserved_exact_tokens:
  - "Assistant-only"
  - "continuity/project-state subsystem"
  - "seglog"
  - "redb"
  - "Tantivy"
  - "ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts"
negative_constraints:
  - "Assistant memory must not replace or redefine system event storage, system KV/search projections, or the shared rules pipeline."
owner_hints:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
```

### AMS-004 - Assistant Memory Local Storage Boundary

```yaml
plan_unit_id: AMS-004
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory must run fully in-process and local-only; it must not require external servers and must not use SQLite.
gui_related: false
gui_classification_reason: Local-only and no-SQLite rules are storage/runtime constraints.
depends_on: [AMS-003]
unblocks: [AMS-007, AMS-022]
acceptance_criteria:
  - Assistant memory runs fully in-process.
  - Assistant memory is local-only.
  - Assistant memory does not require external servers and does not use SQLite.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_boundary
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: assistant_memory_local_storage_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0003
preserved_exact_tokens:
  - "fully in-process"
  - "local-only"
  - "MUST NOT require external servers"
  - "MUST NOT use SQLite"
  - "SchemaID:Spec_Lock.json#locked_decisions.storage"
negative_constraints:
  - "Assistant memory must not require external servers."
  - "Assistant memory must not use SQLite."
owner_hints:
  - Plans/assistant-memory-subsystem.md
  - Plans/rewrite-tie-in-memo.md
```

### AMS-005 - Memory Provider Capability Boundary

```yaml
plan_unit_id: AMS-005
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  The memory provider contract defines MemoryProvider, RealMemoryProvider, and
  NullMemoryProvider, with Assistant prompt assembly routed to real memory and
  Orchestrator, Interviewer, requirements builder, and subagents routed to null
  memory with no Assistant memory forwarding.
gui_related: false
gui_classification_reason: Provider routing and no-forwarding rules are runtime wiring behavior.
depends_on: [AMS-003]
unblocks: [AMS-018, AMS-024]
acceptance_criteria:
  - MemoryProvider, RealMemoryProvider, and NullMemoryProvider remain named interface concepts.
  - The required logical method surface is preserved.
  - Assistant prompt assembly routes to RealMemoryProvider.
  - Orchestrator, Interviewer, requirements builder, and all subagents route to NullMemoryProvider.
  - Assistant memory is not forwarded through prompts, tools, handoffs, or hidden metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: memory_provider_capability_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0005
preserved_exact_tokens:
  - "MemoryProvider"
  - "RealMemoryProvider"
  - "NullMemoryProvider"
  - "build_capsule(project_id, now) -> WorkingSetCapsule"
  - "search(project_id, query, now, k) -> Vec<MemoryGistHit>"
  - "set_verification_state(project_id, gist_id, verification_state, now) -> Result"
negative_constraints:
  - "Assistant memory MUST NOT be forwarded to subagents through prompts, tools, handoffs, or hidden metadata."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-006 - EvidenceRef Pointer Only Model

```yaml
plan_unit_id: AMS-006
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: EvidenceRef is a structured pointer to verification evidence, not an evidence store, and must not embed large diffs, logs, or artifact bodies.
gui_related: false
gui_classification_reason: EvidenceRef shape and payload limits are backend data-model constraints.
depends_on: [AMS-003]
unblocks: [AMS-014, AMS-015, AMS-016]
acceptance_criteria:
  - EvidenceRefs point to canonical evidence stored elsewhere.
  - Supported variants include Commit, Diff, TestRun, BuildRun, LintRun, Artifact, PlanRef, Issue, and PR.
  - EvidenceRefs remain compact pointers and do not embed large payloads.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: evidence_pointer
reasoning_tier: high
context_scope: data_model
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: evidenceref_pointer_only_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0011
preserved_exact_tokens:
  - "EvidenceRefs"
  - "Commit { hash, repo_id }"
  - "Diff { run_id, repo_id, paths[], stats }"
  - "TestRun { run_id, command, exit_code, summary_hash }"
  - "BuildRun { run_id, command, exit_code, summary_hash }"
  - "LintRun { run_id, command, exit_code, summary_hash }"
  - "Artifact { path, change_type, content_hash? }"
  - "PlanRef { file_path, anchor_id? }"
  - "Issue { provider, id }"
  - "PR { provider, id }"
negative_constraints:
  - "EvidenceRefs MUST be small pointers and MUST NOT embed large diffs/logs/artifact bodies."
  - "MemoryGist records MUST NOT persist large diffs, full logs, or large artifacts."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-007 - Assistant Memory Physical Stores

```yaml
plan_unit_id: AMS-007
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Assistant memory uses separate per-project physical stores for
  assistant_memory.redb, assistant_memory_index, and
  assistant_memory_vectors.usearch, preserving the system.redb project-state
  note, file-level separation, and atomic project switching.
gui_related: false
gui_classification_reason: Physical storage paths and project switching are backend storage behavior.
depends_on: [AMS-004]
unblocks: [AMS-008, AMS-012, AMS-013]
acceptance_criteria:
  - Assistant memory DB, Tantivy index, and USearch index paths are preserved.
  - Assistant memory stores remain separate from system state stores.
  - Project switching swaps active memory stores atomically at the project boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_layout
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_memory_physical_stores
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0007
preserved_exact_tokens:
  - ".puppet-master/project/state/assistant_memory.redb"
  - ".puppet-master/project/state/assistant_memory_index/"
  - ".puppet-master/project/state/assistant_memory_vectors.usearch"
  - "system.redb"
  - "file-level physical separation"
  - "project switching"
negative_constraints:
  - "Assistant memory must not couple its physical store to system state stores."
owner_hints:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
```

### AMS-008 - MemoryGist Canonical Record

```yaml
plan_unit_id: AMS-008
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  MemoryGist is the canonical Assistant memory record, with required identity,
  classification, verification, time/access, decay, tags, claims,
  summary/details, evidence, provenance, and embedding/index version fields.
gui_related: false
gui_classification_reason: MemoryGist field shape is backend data-model behavior.
depends_on: [AMS-007]
unblocks: [AMS-009, AMS-010, AMS-011, AMS-012, AMS-014]
acceptance_criteria:
  - MemoryGist remains the canonical record.
  - Required field groups from the source span are preserved.
  - Provenance and embedding/index versioning fields remain part of the contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_data_model
reasoning_tier: high
context_scope: data_model
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: memorygist_canonical_record
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0009
preserved_exact_tokens:
  - "MemoryGist"
  - "verification_state"
  - "half_life_days"
  - "claims[]"
  - "summary"
  - "details"
  - "evidence_refs[]"
  - "AutoRunBoundary"
  - "AutoMilestone"
  - "embedding_version"
  - "embed_text_hash"
  - "text_hash"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-009 - Memory Prompt Injection Summary Boundary

```yaml
plan_unit_id: AMS-009
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Prompt injection uses only Verified gists' derived summary text; details are never auto-injected, and summary/hash caches are deterministic and invalidated when their source fields change.
gui_related: false
gui_classification_reason: Prompt injection and cache invalidation are backend prompt/data behavior.
depends_on: [AMS-008]
unblocks: [AMS-018, AMS-019]
acceptance_criteria:
  - Automatic prompt injection uses only Verified gists' derived summary text.
  - Details are never auto-injected.
  - Summary, embed_text_hash, and text_hash are deterministic and invalidated when kind, tags, or claims change.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_injection
reasoning_tier: high
context_scope: prompt
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: memory_prompt_injection_summary_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0009
preserved_exact_tokens:
  - "Verified"
  - "summary"
  - "details"
  - "MUST NOT auto-inject `details`"
  - "embed_text_hash"
  - "text_hash"
negative_constraints:
  - "Automatic prompt injection MUST use only Verified gists' derived `summary` text and MUST NOT auto-inject `details`."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-010 - MemoryGist GUI Operations Canonical Writes

```yaml
plan_unit_id: AMS-010
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: GUI memory operations for listing, editing, verifying, pinning, deleting, and half-life edits must read and write MemoryGist records in assistant_memory.redb as the canonical source.
gui_related: true
gui_classification_reason: List, edit, verify, pin, delete, and half-life edits are user-visible GUI operations.
depends_on: [AMS-008]
unblocks: [AMS-021]
acceptance_criteria:
  - GUI memory operations read MemoryGist records from assistant_memory.redb.
  - GUI memory operations write MemoryGist records back to assistant_memory.redb.
  - The listed operations include list, edit, verify, pin, delete, and half-life edits.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_gui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: memorygist_gui_operations_canonical_writes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0009
preserved_exact_tokens:
  - "list/edit/verify/pin/delete/half-life edits"
  - "MemoryGist"
  - "assistant_memory.redb"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-011 - Memory Claims Atomic Model

```yaml
plan_unit_id: AMS-011
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory claims are short, single-purpose, independently verifiable and deduplicable statements with stable claim_id, text, and created_at fields.
gui_related: false
gui_classification_reason: Claims shape is backend data-model behavior.
depends_on: [AMS-008]
unblocks: [AMS-012, AMS-014]
acceptance_criteria:
  - Each claim remains compact and single-purpose.
  - Multi-claim gists keep each claim independently meaningful for verification and deduplication.
  - Minimal claim shape preserves claim_id, text, and created_at.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_data_model
reasoning_tier: standard
context_scope: data_model
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: memory_claims_atomic_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0010
preserved_exact_tokens:
  - "claims[]"
  - "claim_id"
  - "text"
  - "created_at"
negative_constraints:
  - "Claims must not collapse multi-claim gists into non-atomic statements."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-012 - Memory Retrieval Indexes

```yaml
plan_unit_id: AMS-012
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Retrieval uses Tantivy lexical fields and USearch semantic ANN mapping, with deterministic embed_text, embed_text_hash, text_hash, tombstones, and deterministic full rebuild support.
gui_related: false
gui_classification_reason: Retrieval index schemas and rebuild behavior are backend search/index behavior.
depends_on: [AMS-007, AMS-008, AMS-011]
unblocks: [AMS-013, AMS-019, AMS-020]
acceptance_criteria:
  - Tantivy lexical indexed fields are preserved.
  - USearch maps vector entries to MemoryGist IDs and persists mapping/tombstone state.
  - Deterministic embed_text, embed_text_hash, and text_hash formulas are preserved.
  - Full lexical and semantic rebuilds are supported from assistant_memory.redb.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_indexing
reasoning_tier: high
context_scope: search
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: memory_retrieval_indexes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0014
preserved_exact_tokens:
  - "Tantivy"
  - "USearch"
  - "embed_text = kind + \"\\n\" + join(tags) + \"\\n\" + join(claims[].text)"
  - "embed_text_hash"
  - "text_hash"
  - "tombstones"
  - "deterministic periodic full rebuild"
negative_constraints:
  - "Index updates must not become canonical writes that can lose memory data."
owner_hints:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
```

### AMS-013 - Memory Write Then Index Order

```yaml
plan_unit_id: AMS-013
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Canonical writes must succeed to assistant_memory.redb before Tantivy and USearch index updates are enqueued and applied asynchronously, with recoverable index failures.
gui_related: false
gui_classification_reason: Write/index ordering is backend persistence behavior.
depends_on: [AMS-007, AMS-012]
unblocks: [AMS-022]
acceptance_criteria:
  - Canonical MemoryGist changes write to assistant_memory.redb first.
  - Tantivy and USearch index updates are enqueued after the canonical write.
  - Index failures are recoverable without data loss.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_persistence
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: memory_write_then_index_order
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0015
preserved_exact_tokens:
  - "assistant_memory.redb"
  - "Enqueue Tantivy + USearch index updates"
  - "asynchronously"
negative_constraints:
  - "Index failures must be recoverable without data loss."
owner_hints:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
```

### AMS-014 - Memory Verification Rules

```yaml
plan_unit_id: AMS-014
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory injection eligibility is Verified by default; verification_state is Unverified, Verified, or Discarded, and a gist transitions to Verified only when deterministic evidence rules pass.
gui_related: false
gui_classification_reason: Verification rules are backend validation and prompt-eligibility behavior.
depends_on: [AMS-006, AMS-008, AMS-011]
unblocks: [AMS-015, AMS-016, AMS-018, AMS-019]
acceptance_criteria:
  - Only verification_state = Verified gists are eligible for capsule and retrieval injection by default.
  - Verification states remain Unverified, Verified, and Discarded.
  - A gist transitions to Verified only when one of the deterministic evidence rules holds.
  - A gist never transitions to Verified when evidence_refs is empty.
  - Discarded gists are excluded from automatic injection and default search results.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_verification
reasoning_tier: high
context_scope: validation
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: memory_verification_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0021
preserved_exact_tokens:
  - "verification_state"
  - "Unverified"
  - "Verified"
  - "Discarded"
  - "Commit { hash, repo_id }"
  - "exit_code == 0"
  - "assistant.memory.allow_manual_verify_without_evidence"
negative_constraints:
  - "A gist MUST NOT transition to `Verified` if `evidence_refs[]` is empty."
  - "Discarded gists MUST be excluded from automatic injection and default search results."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-015 - AutoRunBoundary Memory Trigger

```yaml
plan_unit_id: AMS-015
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: AutoRunBoundary runs exactly once at Assistant run end, creates or updates at most one gist, deduplicates by embed_text_hash plus normalized EvidenceRefs, verifies deterministically, and respects assistant.memory.auto_save_unverified.
gui_related: false
gui_classification_reason: AutoRunBoundary is an Assistant run-end backend trigger.
depends_on: [AMS-014]
unblocks: [AMS-016]
acceptance_criteria:
  - AutoRunBoundary runs once at the end of each Assistant run.
  - AutoRunBoundary creates or updates at most one MemoryGist per run.
  - Candidate deduplication uses embed_text_hash plus normalized EvidenceRefs.
  - Unverified persistence respects assistant.memory.auto_save_unverified.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_trigger
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: autorunboundary_memory_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0019
preserved_exact_tokens:
  - "AutoRunBoundary"
  - "exactly once"
  - "at most one"
  - "embed_text_hash"
  - "normalized EvidenceRefs"
  - "assistant.memory.auto_save_unverified"
negative_constraints:
  - "AutoRunBoundary must not create multiple gists for a single Assistant run."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-016 - AutoMilestone Memory Trigger

```yaml
plan_unit_id: AMS-016
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: AutoMilestone is an idempotent promotion trigger rate-limited to once per run, deduplicated per gist/evidence pair, able to create or promote one Outcome gist, and ordered before AutoRunBoundary persistence.
gui_related: false
gui_classification_reason: AutoMilestone trigger ordering and idempotence are backend runtime behavior.
depends_on: [AMS-014, AMS-015]
unblocks: [AMS-017]
acceptance_criteria:
  - AutoMilestone is idempotent per gist_id and evidence_ref pair.
  - AutoMilestone is rate-limited to at most once per run.
  - AutoMilestone may create or promote one Outcome gist per run.
  - AutoMilestone executes before AutoRunBoundary persistence when triggered in a run.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_trigger
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: automilestone_memory_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0020
preserved_exact_tokens:
  - "AutoMilestone"
  - "(gist_id, evidence_ref)"
  - "at most **once per run**"
  - "Outcome"
  - "before AutoRunBoundary persistence"
negative_constraints:
  - "AutoMilestone must not reprocess the same gist/evidence pair more than once."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-017 - AutoMilestone GUI Done Source

```yaml
plan_unit_id: AMS-017
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: User confirmation of done through a GUI action is a valid AutoMilestone milestone source alongside tests, commits, PRs, and artifacts.
gui_related: true
gui_classification_reason: User confirms done via GUI action is a user-visible trigger source.
depends_on: [AMS-016]
unblocks: []
acceptance_criteria:
  - User confirms done via GUI action remains a valid AutoMilestone milestone source.
  - The GUI source does not replace other milestone sources such as tests, commits, PRs, or artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_gui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: automilestone_gui_done_source
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0020
preserved_exact_tokens:
  - "user confirms “done” via GUI action"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-018 - Memory Capsule Injection Boundary

```yaml
plan_unit_id: AMS-018
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory is continuity and project state, not rules; the always-loaded capsule uses a default 350-token hard cap, fixed section order, and Verified-only eligibility by default.
gui_related: false
gui_classification_reason: Capsule assembly and prompt boundaries are backend prompt behavior.
depends_on: [AMS-003, AMS-005, AMS-009, AMS-014]
unblocks: [AMS-019, AMS-021]
acceptance_criteria:
  - Memory remains a distinct context source separate from rules pipeline output.
  - Capsule budget default remains 350 tokens.
  - Capsule sections preserve fixed order.
  - Capsule assembly enforces the hard token cap before sending any Assistant prompt.
  - Capsule assembly excludes non-Verified gists by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_injection
reasoning_tier: high
context_scope: prompt
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/assistant-chat-design.md
  - Plans/agent-rules-context.md
node_compile_hint:
  mode: memory_capsule_injection_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0023
preserved_exact_tokens:
  - "Memory is continuity and project state. Memory is not rules."
  - "350"
  - "Project Capsule bullets"
  - "Current Thread paragraph"
  - "Recent decisions"
  - "Recent blockers"
  - "Verified-only"
negative_constraints:
  - "Unverified gists may be included only by explicit user action."
  - "Pinned Unverified gists must not be auto-included unless assistant.memory.allow_pinned_unverified_injection = true."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-019 - Per Turn Memory Retrieval Injection

```yaml
plan_unit_id: AMS-019
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Per-turn retrieval injection runs lexical and semantic search, merges and reranks results, injects up to the default five gists, and remains summary-only and Verified-only unless explicitly allowed by configuration or user action.
gui_related: false
gui_classification_reason: Retrieval injection is backend prompt assembly behavior.
depends_on: [AMS-012, AMS-014, AMS-018]
unblocks: [AMS-020]
acceptance_criteria:
  - Per-turn retrieval executes Tantivy lexical search plus USearch semantic search.
  - Retrieval results are merged and reranked.
  - Default max injected gists per turn remains five.
  - Retrieval injection is summary-only.
  - Retrieval injection excludes non-Verified gists by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_injection
reasoning_tier: high
context_scope: prompt
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: per_turn_memory_retrieval_injection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0024
preserved_exact_tokens:
  - "Tantivy"
  - "USearch"
  - "N default `5`"
  - "summary-only"
  - "Verified-only"
negative_constraints:
  - "Retrieval injection MUST NOT exceed max item count and MUST remain summary-only."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-020 - Memory Activation Scoring

```yaml
plan_unit_id: AMS-020
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Activation scoring includes pinned boost, kind/status weighting, recency decay, access signals, and BM25 plus ANN retrieval blend; Done status applies a 0.5 half-life multiplier.
gui_related: false
gui_classification_reason: Activation scoring is backend retrieval/ranking behavior.
depends_on: [AMS-012, AMS-019]
unblocks: []
acceptance_criteria:
  - Activation scoring includes pinned, kind/status, recency, access, and retrieval blend components.
  - Retrieval blend includes BM25 and ANN scores.
  - Done-status gists apply effective_half_life_days = half_life_days * 0.5.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_retrieval
reasoning_tier: standard
context_scope: search
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: memory_activation_scoring
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0025
preserved_exact_tokens:
  - "pinned"
  - "kind/status weighting"
  - "recency decay"
  - "access_count"
  - "last_access_at"
  - "BM25 + ANN scores"
  - "effective_half_life_days = half_life_days * 0.5"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-021 - Gist Review Panel

```yaml
plan_unit_id: AMS-021
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The GUI exposes a Gist Review panel adjacent to Memory and Rules panels, with filters, default Unverified review filter, auto-save toggle, gist actions, half-life controls, capsule preview, and maintenance actions.
gui_related: true
gui_classification_reason: Gist Review panel, filters, actions, toggles, and previews are user-visible GUI requirements.
depends_on: [AMS-010, AMS-014, AMS-018]
unblocks: [AMS-023]
acceptance_criteria:
  - Gist Review appears adjacent to Memory and Rules panels.
  - Panel filters include kind, status, tags, pinned, and verification_state.
  - Opening the panel defaults to verification_state = Unverified until explicit user action changes filters.
  - Verify, Edit, Pin/Unpin, Discard, half-life controls, capsule preview, and maintenance actions are exposed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_gui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gist_review_panel
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0027
preserved_exact_tokens:
  - "Gist Review"
  - "Memory + Rules panels"
  - "verification_state = Unverified"
  - "assistant.memory.auto_save_unverified"
  - "Verify"
  - "Edit"
  - "Pin/Unpin"
  - "Discard"
  - "What's in capsule now"
negative_constraints:
  - "Any non-default filter state must be the result of explicit user action."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-022 - Memory Maintenance Operations

```yaml
plan_unit_id: AMS-022
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory maintenance operations include Tantivy rebuild, USearch rebuild, verification sweep, dedup sweep, monthly summarize/compress, and prune/archive, all in-process with no external services and pinned gists protected from deletion.
gui_related: false
gui_classification_reason: Maintenance operation semantics are backend storage/index behavior.
depends_on: [AMS-004, AMS-013]
unblocks: [AMS-023]
acceptance_criteria:
  - Required maintenance operations are preserved.
  - Maintenance operations run in-process and do not depend on external services.
  - Prune/archive never deletes pinned gists.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_maintenance
reasoning_tier: standard
context_scope: storage
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: memory_maintenance_operations
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0028
preserved_exact_tokens:
  - "Rebuild Tantivy index"
  - "Rebuild USearch index"
  - "Verification sweep"
  - "Dedup sweep"
  - "Monthly summarize/compress"
  - "Prune/archive"
negative_constraints:
  - "All maintenance operations MUST run in-process and MUST NOT depend on external services."
  - "Prune/archive must never delete pinned gists."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-023 - Memory Maintenance GUI Invocation

```yaml
plan_unit_id: AMS-023
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory maintenance operations are user-invokable in the GUI and callable by internal maintenance jobs with explicit success and failure status.
gui_related: true
gui_classification_reason: User-invokable GUI maintenance actions and success/failure status are visible UI behavior.
depends_on: [AMS-021, AMS-022]
unblocks: []
acceptance_criteria:
  - Maintenance operations are user-invokable in GUI.
  - Internal maintenance jobs can call maintenance operations.
  - Both GUI and internal invocations expose explicit success/failure status.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_gui
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: memory_maintenance_gui_invocation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0028
preserved_exact_tokens:
  - "user-invokable in GUI"
  - "internal maintenance jobs"
  - "explicit success/failure status"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-024 - Memory Integration Boundary Intro

```yaml
plan_unit_id: AMS-024
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory remains separate from child-run continuity, crew shared state, and context-shaping systems; detailed integration behavior starts in the next batch.
gui_related: false
gui_classification_reason: Integration boundary is backend owner/consumer scope.
depends_on: [AMS-003, AMS-005]
unblocks: []
acceptance_criteria:
  - Assistant memory remains separate from child-run continuity.
  - Assistant memory remains separate from crew shared state.
  - Assistant memory remains separate from context-shaping systems.
  - This unit does not absorb the S0030 Assistant prompt builder details.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: standard
context_scope: integration
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Prompt_Pipeline.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: memory_integration_boundary_intro
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0029
preserved_exact_tokens:
  - "Assistant memory is intentionally separate from child-run continuity, crew shared state, and context-shaping systems."
negative_constraints:
  - "S0030 Assistant prompt builder details are not imported into this batch."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-025 - Assistant Prompt Builder Memory Routing

```yaml
plan_unit_id: AMS-025
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant prompt builder uses the real memory subsystem while Assistant memory remains Assistant-only.
gui_related: false
gui_classification_reason: Prompt builder routing is backend prompt assembly behavior.
depends_on: [AMS-024]
unblocks: [AMS-026]
acceptance_criteria:
  - Assistant uses the real memory subsystem.
  - Assistant memory remains Assistant-only.
  - Prompt Pipeline, Assistant Chat, and storage ContractRefs are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_integration
reasoning_tier: standard
context_scope: prompt
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Prompt_Pipeline.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: assistant_prompt_builder_memory_routing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0030
preserved_exact_tokens:
  - "Assistant uses the real memory subsystem."
  - "Assistant memory remains Assistant-only."
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-026 - Non Assistant NullMemoryProvider Enforcement

```yaml
plan_unit_id: AMS-026
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Subagents, Interview, Orchestrator, requirements builder, and crew members use NullMemoryProvider and receive no Assistant memory payload.
gui_related: false
gui_classification_reason: NullMemoryProvider routing is backend runtime wiring behavior.
depends_on: [AMS-005, AMS-025]
unblocks: [AMS-027]
acceptance_criteria:
  - Subagents use NullMemoryProvider.
  - Interview, Orchestrator, requirements builder, and crew members receive no Assistant memory payload.
  - Tools, Personas, and Prompt Pipeline ContractRefs are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Tools.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: non_assistant_nullmemoryprovider_enforcement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0031
preserved_exact_tokens:
  - "NullMemoryProvider"
  - "receive no Assistant memory payload"
negative_constraints:
  - "Non-Assistant actors must not receive Assistant memory payload."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-027 - Child Continuity Canonical Sources

```yaml
plan_unit_id: AMS-027
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Child continuity comes from canonical child records, reconstructed handoff bundles, current effective shaping state, and crew shared state, not hidden child-local long-term memory.
gui_related: false
gui_classification_reason: Child continuity source rules are backend runtime state behavior.
depends_on: [AMS-026]
unblocks: [AMS-028]
acceptance_criteria:
  - Child continuity source list remains canonical.
  - Hidden child-local long-term memory is excluded.
  - Storage, Contracts_V0, and orchestrator ContractRefs are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: child_continuity_canonical_sources
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0031
preserved_exact_tokens:
  - "canonical child records"
  - "reconstructed handoff bundles"
  - "current effective shaping state"
  - "crew shared state"
  - "hidden child-local long-term memory"
negative_constraints:
  - "Child continuity does not come from hidden child-local long-term memory."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-028 - Crew Shared State Coordination Boundary

```yaml
plan_unit_id: AMS-028
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Crew shared state may persist longer than an individual child, but it remains explicit coordination state rather than personal memory for disposable subagents.
gui_related: false
gui_classification_reason: Crew shared state boundary is backend runtime coordination behavior.
depends_on: [AMS-027]
unblocks: []
acceptance_criteria:
  - Crew shared state may persist longer than an individual child.
  - Crew shared state remains explicit coordination state.
  - Disposable subagents do not gain personal memory from crew shared state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: standard
context_scope: runtime
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_shared_state_coordination_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0032
preserved_exact_tokens:
  - "Crew shared state"
  - "explicit coordination state"
  - "personal memory for disposable subagents"
negative_constraints:
  - "Crew shared state must not become personal memory for disposable subagents."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-029 - Deterministic Defaults Section Anchor

```yaml
plan_unit_id: AMS-029
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The Deterministic defaults section anchor is preserved as structural coverage; behavior is carried by the child default units in this batch.
gui_related: false
gui_classification_reason: Section-anchor preservation is plan structure, not UI behavior.
depends_on: []
unblocks: [AMS-030, AMS-031, AMS-032, AMS-033]
acceptance_criteria:
  - The Deterministic defaults heading remains covered.
  - No additional behavior is introduced by this structural unit beyond child default units.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_structure
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: deterministic_defaults_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0033
preserved_exact_tokens:
  - "9. Deterministic defaults"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-030 - Core Memory Defaults

```yaml
plan_unit_id: AMS-030
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Core memory defaults preserve separate Assistant memory redb, Tantivy, and USearch stores, 350-token capsule budget, max five retrieved gists, summary-only Verified-only injection, disabled subagent access through NullMemoryProvider, and enabled auto-save for unverified gists.
gui_related: false
gui_classification_reason: Core defaults are backend configuration defaults.
depends_on: [AMS-029]
unblocks: [AMS-031, AMS-032, AMS-033]
acceptance_criteria:
  - Core defaults apply without user prompts unless overridden by persisted config.
  - Physical store, capsule budget, retrieval injection, subagent access, and auto-save defaults are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_defaults
reasoning_tier: standard
context_scope: config
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: core_memory_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0034
preserved_exact_tokens:
  - "350"
  - "max `5` gists/turn"
  - "summary-only"
  - "Verified-only"
  - "NullMemoryProvider"
  - "Auto-save unverified gists: enabled"
negative_constraints:
  - "Defaults must not prompt the user unless explicitly overridden by persisted config."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-031 - Kind Half Life Defaults

```yaml
plan_unit_id: AMS-031
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Half-life defaults by kind preserve the complete kind table, require unset half_life_days to resolve to the kind default, and apply the Done status multiplier of 0.5 for activation scoring.
gui_related: false
gui_classification_reason: Half-life defaults and decay multipliers are backend scoring configuration.
depends_on: [AMS-029, AMS-030]
unblocks: []
acceptance_criteria:
  - All kind/default_half_life_days rows remain preserved.
  - Unset half_life_days resolves to the table default for the kind.
  - Done status applies multiplier 0.5 to half-life for activation scoring.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_defaults
reasoning_tier: standard
context_scope: config
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: kind_half_life_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0035
preserved_exact_tokens:
  - "CurrentThread"
  - "Blocker"
  - "Constraint"
  - "Outcome"
  - "Handoff"
  - "Note"
  - "Decision"
  - "Preference"
  - "Landmine"
  - "status = Done"
  - "0.5"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-032 - Verification Default Configuration

```yaml
plan_unit_id: AMS-032
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Verification defaults set new gists to Unverified, default injection eligibility to Verified-only, pinned-Unverified auto-injection to false, auto-save unverified to true, and manual verify without evidence to false.
gui_related: false
gui_classification_reason: Verification defaults are backend configuration and prompt eligibility rules.
depends_on: [AMS-014, AMS-029, AMS-030]
unblocks: []
acceptance_criteria:
  - New gists default to Unverified.
  - Verified-only auto-injection remains default even when unverified auto-save is enabled.
  - Pinned Unverified auto-injection and manual verify without evidence default to false.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_defaults
reasoning_tier: high
context_scope: config
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: verification_default_configuration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0036
preserved_exact_tokens:
  - "Unverified"
  - "Verified-only"
  - "assistant.memory.allow_pinned_unverified_injection = false"
  - "assistant.memory.auto_save_unverified = true"
  - "assistant.memory.allow_manual_verify_without_evidence = false"
negative_constraints:
  - "Verified-only auto-injection must remain the default behavior even when unverified auto-save is enabled."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-033 - Project Scoped Memory Config Keys

```yaml
plan_unit_id: AMS-033
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory configuration preserves all assistant.memory keys and deterministic project-scoped resolution for memory behavior.
gui_related: false
gui_classification_reason: Memory config keys and project-scoped resolution are backend configuration behavior.
depends_on: [AMS-029, AMS-030]
unblocks: [AMS-034]
acceptance_criteria:
  - All assistant.memory config keys in the source span remain preserved.
  - Config resolution is deterministic.
  - Config resolution is project-scoped for memory behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_defaults
reasoning_tier: standard
context_scope: config
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: project_scoped_memory_config_keys
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0037
preserved_exact_tokens:
  - "assistant.memory.enabled"
  - "assistant.memory.capsule_budget_tokens"
  - "assistant.memory.max_injected_items_per_turn"
  - "assistant.memory.done_decay_multiplier"
  - "assistant.memory.default_half_life_days.<kind>"
  - "assistant.memory.retrieval.blend.bm25_weight"
  - "assistant.memory.retrieval.blend.ann_weight"
  - "assistant.memory.auto_save_unverified"
  - "assistant.memory.allow_manual_verify_without_evidence"
  - "assistant.memory.allow_pinned_unverified_injection"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-034 - Memory Compression Threshold Override Note

```yaml
plan_unit_id: AMS-034
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Gemini CLI provider-native model.compressionThreshold default 0.5 is distinct from any PM-exposed or stored 90 percent assistant memory compression threshold, which is an intentional PM override.
gui_related: false
gui_classification_reason: Compression threshold distinction is provider/config policy, not UI behavior.
depends_on: [AMS-033]
unblocks: []
acceptance_criteria:
  - Gemini CLI provider-native model.compressionThreshold default 0.5 is preserved.
  - PM 90 percent assistant memory compression threshold is treated as intentional override if exposed or stored.
  - The override note does not imply alignment with provider-native defaults.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_config
reasoning_tier: standard
context_scope: config
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: memory_compression_threshold_override_note
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0037
preserved_exact_tokens:
  - "model.compressionThreshold"
  - "0.5"
  - "90%"
  - "intentional PM override"
negative_constraints:
  - "PM override must not be treated as alignment with provider-native defaults."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-035 - Backend Memory Acceptance Criteria

```yaml
plan_unit_id: AMS-035
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Backend acceptance criteria cover provider routing, Verified-only gating, unverified-save behavior, trigger correctness and deduplication, storage layout, canonical data model persistence, summary cache coherence, decay, project isolation, index rebuild equivalence, rules separation, and deterministic completion.
gui_related: false
gui_classification_reason: These acceptance criteria validate backend memory behavior and persistence.
depends_on: [AMS-014, AMS-015, AMS-016, AMS-030, AMS-031, AMS-032, AMS-033]
unblocks: []
acceptance_criteria:
  - Acceptance criteria 1 through 6 are preserved for provider routing, gating, triggers, and deduplication.
  - Acceptance criteria 8 through 9 are preserved for storage layout and canonical data model persistence.
  - Acceptance criteria 11 through 15 are preserved for cache coherence, decay, project isolation, rebuild equivalence, and rules separation.
  - The completion rule requires deterministic verification of all acceptance criteria.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_acceptance
reasoning_tier: high
context_scope: validation
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: backend_memory_acceptance_criteria
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0038
preserved_exact_tokens:
  - "Assistant-only enforcement"
  - "Verified-only gating"
  - "Trigger correctness (no plan edits)"
  - "Trigger dedup"
  - "Storage layout"
  - "Canonical data model"
  - "Summary cache coherence"
  - "Project isolation"
  - "Index rebuild equivalence"
  - "Rules separation"
negative_constraints:
  - "AutoRunBoundary and AutoMilestone operate from run artifacts/evidence refs without requiring edits to Plans/SSOT documents."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-036 - GUI Memory Acceptance Criteria

```yaml
plan_unit_id: AMS-036
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: GUI acceptance criteria cover Verify enforcement, capsule preview token/truncation display, and default Gist Review Unverified filtering.
gui_related: true
gui_classification_reason: Verify enforcement, capsule preview, and Gist Review filtering are user-visible GUI behavior.
depends_on: [AMS-021, AMS-023, AMS-035]
unblocks: []
acceptance_criteria:
  - Attempting to mark a gist Verified without satisfiable EvidenceRefs is rejected unless the manual override config is true.
  - GUI capsule preview shows token estimate and truncation indicator.
  - Opening Gist Review defaults to verification_state = Unverified until explicit user filter changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_acceptance
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: gui_memory_acceptance_criteria
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0038
preserved_exact_tokens:
  - "GUI Verify enforcement"
  - "Capsule cap enforcement"
  - "Default review filter behavior"
  - "verification_state = Unverified"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-037 - Assistant Memory Non Goals

```yaml
plan_unit_id: AMS-037
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory non-goals prohibit memory exposure to non-Assistant agents, replacement of seglog/redb/Tantivy storage contracts, external vector DB services, and markdown-file-bank requirements.
gui_related: false
gui_classification_reason: Non-goals are backend architecture and storage boundaries.
depends_on: [AMS-003, AMS-004, AMS-026]
unblocks: []
acceptance_criteria:
  - Non-Assistant agents receive no Assistant memory exposure.
  - Storage contracts are not replaced.
  - External vector DB service is out of scope.
  - Memory is not required to be markdown-file based.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: memory_boundary
reasoning_tier: high
context_scope: architecture
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/rewrite-tie-in-memo.md
  - Plans/storage-plan.md
  - Plans/agent-rules-context.md
node_compile_hint:
  mode: assistant_memory_non_goals
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0039
preserved_exact_tokens:
  - "No memory exposure to non-Assistant agents."
  - "No replacement of seglog/redb/Tantivy system storage contracts."
  - "No external vector DB service."
  - "No file-bank style requirement that memory must be markdown-file based."
negative_constraints:
  - "Implementations MUST keep these non-goals intact."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-038 - Runtime Owner Reference Map

```yaml
plan_unit_id: AMS-038
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant memory runtime alignment is maintained through explicit evidence_refs and preserved owner-document reference sets, not hidden orchestration memory.
gui_related: false
gui_classification_reason: Runtime owner reference mapping is source-lineage and owner-boundary behavior.
depends_on: [AMS-024]
unblocks: [AMS-039]
acceptance_criteria:
  - Runtime alignment uses explicit evidence_refs.
  - Owner-document reference sets in the Runtime Owner Reference Map remain preserved for audit lineage.
  - Hidden orchestration memory is not introduced.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: governance
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: runtime_owner_reference_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0040
preserved_exact_tokens:
  - "evidence_refs"
  - "hidden orchestration memory"
  - "Runtime Owner Reference Map"
  - "Plans/Models_System.md:58-80"
  - "Plans/Executor_Protocol.md:134-178"
  - "Plans/Contracts_V0.md:649"
negative_constraints:
  - "Assistant memory must not use hidden orchestration memory for runtime alignment."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-039 - Plan Local Obligation Boundary

```yaml
plan_unit_id: AMS-039
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Plan-local event and command obligations belong in canonical state, event, and command owners before memory consumes them; NullMemoryProvider remains the durable boundary for memory prohibition versus stateful orchestration, and Gemini-only docs may still contain active owner gaps.
gui_related: false
gui_classification_reason: Plan-local obligation routing is owner-boundary and governance behavior.
depends_on: [AMS-038]
unblocks: []
acceptance_criteria:
  - plan-local event and command obligations route to canonical owner docs before memory consumption.
  - NullMemoryProvider remains the durable memory-prohibition boundary.
  - Gemini-only docs warning remains preserved as active owner-gap caution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: high
context_scope: governance
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: plan_local_obligation_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0040
preserved_exact_tokens:
  - "plan-local"
  - "/event/command"
  - "NullMemoryProvider"
  - "Remaining Gemini-only docs are not low-value leftovers"
negative_constraints:
  - "Plan-local obligations in memory are narrow and must not bypass canonical state/event/command owners."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-040 - Assistant Memory Owner Consumer Map

```yaml
plan_unit_id: AMS-040
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Assistant-memory-subsystem remains owner for behavior described by its preserved sections, while cross-doc ownership follows preserved ContractRefs and owner/consumer boundary notes.
gui_related: false
gui_classification_reason: Owner/consumer preservation is plan governance behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Memory remains owner for behavior described by preserved sections.
  - Cross-doc ownership follows preserved ContractRefs and boundary notes.
  - ContractRefs to Plan_Document_System and Bootstrap_Planning_Migration remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
  - Plans/Plan_Document_System.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: assistant_memory_owner_consumer_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0041
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "Plans/assistant-memory-subsystem.md"
  - "ContractName:Plans/Plan_Document_System.md"
  - "ContractName:Plans/Bootstrap_Planning_Migration.md"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-041 - Assistant Memory PlanUnits Section Anchor

```yaml
plan_unit_id: AMS-041
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The PlanUnits section heading is preserved as structural coverage for the standardized Assistant Memory PlanUnits section and introduces no product behavior.
gui_related: false
gui_classification_reason: PlanUnits heading coverage is structural plan formatting, not UI behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - The PlanUnits section heading is covered in the migration map.
  - The heading unit introduces no product behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_structure
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: assistant_memory_planunits_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-memory-subsystem-S0042
preserved_exact_tokens:
  - "PlanUnits"
negative_constraints: []
owner_hints:
  - Plans/assistant-memory-subsystem.md
```
