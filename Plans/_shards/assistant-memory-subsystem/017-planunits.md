# Shard 017: PlanUnits

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L556-L2597

Source SHA256: `6fb2d744ee0ee1ba56c1bc0bbc38d8996e8bc0af660efe7d4bbdd21ac67e9911`

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
canonical_text: 'This document owns Memory: reusable facts, preferences, lessons and decisions, learned
  when useful or saved at the user''s request. MemoryGist, EvidenceRef, AutoRunBoundary/AutoMilestone
  and existing local Tantivy/USearch storage remain internal contracts. The old Assistant-only title is
  historical; authorized helper reads follow AMS-026.'
gui_related: true
gui_classification_reason: >-
  Names the current saved-note Memory boundary; Gist Review in the historical authority packet does
  not create a second GUI surface.
depends_on: []
unblocks: [AMS-003, AMS-005, AMS-021]
acceptance_criteria:
- Memory is the canonical reusable-note owner, with Assistant writes, authorized helper reads and existing
  local storage.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
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
canonical_text: Memory remains separate from written Instructions, conversations, Working Notebook task
  notes, Goal/Plan/ledger state, system seglog/redb and the shared rules pipeline. The two visible levels
  are This project and Every project. This project binds the actual Project; Every project holds explicitly
  personal reusable notes for the same user. Availability selection is explicit; no relabeling, automatic
  promotion of private Project/app-thread content, or implied cross-Project sharing is allowed. Screen
  secrets and preserve source restrictions before broadening; if safe separation cannot be established,
  refuse the broader save. Private app-thread notes remain in their existing thread-only scope and never
  enter Every project by migration. The Assistant remains the writer and manager. Crews, reviews and the
  chat assistant's other helpers may read the current Project's notes and the user's personal notes at
  Every project, read-only, subject to current source, actor, phase and permission restrictions. This
  grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: Scope separation is backend architecture and owner-boundary behavior.
depends_on: [AMS-002]
unblocks: [AMS-005, AMS-018, AMS-024]
acceptance_criteria:
- Written rules, conversations, task notes and reusable Memory stay distinct.
- Project/personal helper reads do not expose private app-thread or other Project memory.
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
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "Assistant-only"
  - "continuity/project-state subsystem"
  - "seglog"
  - "redb"
  - "Tantivy"
  - "ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts"
negative_constraints:
- Do not merge private app-thread content into Every project notes.
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
canonical_text: MemoryProvider and RealMemoryProvider retain the existing local provider operations with
  explicit memory scope; Assistant writes stay owner-checked. The Assistant remains the writer and manager.
  Crews, reviews and the chat assistant's other helpers may read the current Project's notes and the user's
  personal notes at Every project, read-only, subject to current source, actor, phase and permission restrictions.
  This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: Provider routing and no-forwarding rules are runtime wiring behavior.
depends_on: [AMS-003]
unblocks: [AMS-018, AMS-024]
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "MemoryProvider"
  - "RealMemoryProvider"
  - "NullMemoryProvider"
  - "build_capsule(project_id, now) -> WorkingSetCapsule"
  - "search(project_id, query, now, k) -> Vec<MemoryGistHit>"
  - "set_verification_state(project_id, gist_id, verification_state, now) -> Result"
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
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
canonical_text: Project memory retains its separate physical stores assistant_memory.redb, assistant_memory_index
  and assistant_memory_vectors.usearch, with written Project paths resolved through DL-270/SP-015 and
  atomic Project-switch behavior. AMS-054 adds explicit app custody and thread-keyed access on the work
  Computer, with separate scope-aware physical keys supplied by storage-plan. Nullable Project never selects
  another thread or a Project store and creates no JSON/SQLite mirror. system.redb remains the separate
  Project-state reference, and project switching selects the correct isolated memory view. Every project
  personal notes use an explicit same-user logical partition within the existing local assistant_memory.redb
  architecture and existing indexes. No new database, service or per-helper store is added; old Project
  and app-thread codecs remain readable and isolated.
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
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N16/N24/N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: MemoryGist retains explicit identity/scope, inferred kind, status, legacy pinned protection,
  internal verification, time/access, built-in half_life_days, claims, summary/details, pointer evidence,
  provenance and hash/index version fields. The two visible levels are This project and Every project.
  This project binds the actual Project; Every project holds explicitly personal reusable notes for the
  same user. Availability selection is explicit; no relabeling, automatic promotion of private Project/app-thread
  content, or implied cross-Project sharing is allowed. Screen secrets and preserve source restrictions
  before broadening; if safe separation cannot be established, refuse the broader save. Private app-thread
  notes remain in their existing thread-only scope and never enter Every project by migration.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: 'Prompt injection is bounded and summary-only; details never auto-inject. Internal verification_state
  remains Unverified, Verified or Discarded. Automatic world-fact use requires current per-claim evidence_support
  and support_scope under AMS-044/045; unrelated tests, commits and artifacts do not prove arbitrary text.
  Explicit user-added or edited preferences and personal statements take a user-statement support path
  tied to the actual input and version: they establish what the user said or prefers, not independent
  world truth. No user Verify chore or manual/pinned bypass exists. Edits invalidate summaries, hashes,
  embeddings and eligibility before the next use; recheck automatically, preserving prior versions and
  evidence.'
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: 'Add writes a new MemoryGist from plain text with inferred kind and optional title at
  an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior evidence/history.
  Delete is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit
  a durable scoped suppression/tombstone, exclude the note and stale versions from all future read/injection
  paths, and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup
  merge cannot silently recreate that deleted note; only a new explicit user save can deliberately replace
  its suppression. Delete all in the list menu names and confirms the exact selected scope and target
  set, using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb
  commits precede asynchronous derived indexes. Memory is one page shared by Settings and the chat Memory
  button/wand, which opens that same page as a sheet. It contains one Remember things between chats switch,
  search, a level filter All / This project / Every project, a saved-note list, Add memory, Edit, Delete
  and a collapsed Archived group. Search includes archived notes. Each note shows its text, level and
  updated time; title is optional. A quiet total list count is allowed only on the page. No verification
  queue, confidence/source fields, ranking, pins, conflicts, memory preview, source controls, maintenance
  workbench or second Notes it took document appears. Instructions, History/privacy, chat capacity controls
  and Run limits stay in their owners outside Memory.'
gui_related: true
gui_classification_reason: >-
  The one Memory page shows note text, two-level availability, updated time, Add/Edit/Delete and
  Archived, without retired verification/pin/decay controls.
depends_on: [AMS-008]
unblocks: [AMS-021]
acceptance_criteria:
- 'Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed
  level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete
  is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable
  scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths,
  and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge
  cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its
  suppression. Delete all in the list menu names and confirms the exact selected scope and target set,
  using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits
  precede asynchronous derived indexes. Memory is one page shared by Settings and the chat Memory button/wand,
  which opens that same page as a sheet. It contains one Remember things between chats switch, search,
  a level filter All / This project / Every project, a saved-note list, Add memory, Edit, Delete and a
  collapsed Archived group. Search includes archived notes. Each note shows its text, level and updated
  time; title is optional. A quiet total list count is allowed only on the page. No verification queue,
  confidence/source fields, ranking, pins, conflicts, memory preview, source controls, maintenance workbench
  or second Notes it took document appears. Instructions, History/privacy, chat capacity controls and
  Run limits stay in their owners outside Memory.'
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens:
  - "list/edit/verify/pin/delete/half-life edits"
  - "MemoryGist"
  - "assistant_memory.redb"
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-011 - Memory Claims Atomic Model

```yaml
plan_unit_id: AMS-011
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Claims remain short single-purpose statements with stable claim_id, text and created_at;
  infer note kind rather than requiring Rule/Decision/Preference. User statements retain their actual
  source/version and limited support scope; task progress remains in Working Notebook.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence.'
gui_related: false
gui_classification_reason: Verification rules are backend validation and prompt-eligibility behavior.
depends_on: [AMS-006, AMS-008, AMS-011]
unblocks: [AMS-015, AMS-016, AMS-018, AMS-019]
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "verification_state"
  - "Unverified"
  - "Verified"
  - "Discarded"
  - "Commit { hash, repo_id }"
  - "exit_code == 0"
  - "assistant.memory.allow_manual_verify_without_evidence"
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

Historical display pointer retired by DL-475: currentness is internal; see AMS-047.

### AMS-015 - AutoRunBoundary Memory Trigger

```yaml
plan_unit_id: AMS-015
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: AutoRunBoundary evaluates once at Assistant run end, persists at most one useful reusable
  candidate, deduplicates by embed_text_hash and normalized evidence, honors deletion suppression and
  the memory-off switch, and applies internal verification. A reply ending is an evaluation opportunity,
  never a reason to manufacture a note. Temporary task progress belongs in Working Notebook. auto_save_unverified
  is built-in candidate handling, not a live toggle.
gui_related: false
gui_classification_reason: AutoRunBoundary is an Assistant run-end backend trigger.
depends_on: [AMS-014]
unblocks: [AMS-016]
acceptance_criteria:
- AutoRunBoundary evaluates once at Assistant run end, persists at most one useful reusable candidate,
  deduplicates by embed_text_hash and normalized evidence, honors deletion suppression and the memory-off
  switch, and applies internal verification. A reply ending is an evaluation opportunity, never a reason
  to manufacture a note. Temporary task progress belongs in Working Notebook. auto_save_unverified is
  built-in candidate handling, not a live toggle.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "AutoRunBoundary"
  - "exactly once"
  - "at most one"
  - "embed_text_hash"
  - "normalized EvidenceRefs"
  - "assistant.memory.auto_save_unverified"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-016 - AutoMilestone Memory Trigger

```yaml
plan_unit_id: AMS-016
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: AutoMilestone evaluates commits, PRs, tests/builds/lint, artifacts or GUI done signals
  for useful reusable content, not automatic milestone summaries. It is idempotent, deduplicated by gist/evidence,
  at most once per run and before AutoRunBoundary persistence; it may promote/create at most one useful
  Outcome gist and never resaves deleted material from old chats.
gui_related: false
gui_classification_reason: AutoMilestone trigger ordering and idempotence are backend runtime behavior.
depends_on: [AMS-014, AMS-015]
unblocks: [AMS-017]
acceptance_criteria:
- AutoMilestone evaluates commits, PRs, tests/builds/lint, artifacts or GUI done signals for useful reusable
  content, not automatic milestone summaries. It is idempotent, deduplicated by gist/evidence, at most
  once per run and before AutoRunBoundary persistence; it may promote/create at most one useful Outcome
  gist and never resaves deleted material from old chats.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "AutoMilestone"
  - "(gist_id, evidence_ref)"
  - "at most **once per run**"
  - "Outcome"
  - "before AutoRunBoundary persistence"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-017 - AutoMilestone GUI Done Source

```yaml
plan_unit_id: AMS-017
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: A GUI done action may trigger AutoMilestone evaluation alongside tests/commits/PRs/artifacts,
  but is not evidence of every claim and does not by itself justify saving any memory.
gui_related: true
gui_classification_reason: User confirms done via GUI action is a user-visible trigger source.
depends_on: [AMS-016]
unblocks: []
acceptance_criteria:
- A GUI done action may trigger AutoMilestone evaluation alongside tests/commits/PRs/artifacts, but is
  not evidence of every claim and does not by itself justify saving any memory.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "user confirms “done” via GUI action"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-018 - Memory Capsule Injection Boundary

```yaml
plan_unit_id: AMS-018
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory is not rules. Keep the existing 350-token capsule ceiling and fixed section order
  as internal limits, with only authorized current eligible summaries, including the same user's explicitly
  personal Every project notes. Private app-thread capsules stay thread-bound. No capsule preview or rule-count
  companion is exposed.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
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
  - "Retired pinned-Unverified/manual-verification bypasses stay disabled under SSYS-059. Internal AMS-014 support and source/permission gating apply; no user pin or verification control admits an unsupported claim."
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

DL-475 retires the capsule preview. Memory and rules still have separate internal budgets.

### AMS-019 - Per Turn Memory Retrieval Injection

```yaml
plan_unit_id: AMS-019
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Per-turn retrieval performs lexical and semantic search, internal reranking and at most
  five eligible derived summaries. Details never auto-inject; no user action or legacy pinned/verification
  setting bypasses current support or source permissions. Memory off prevents memory save/use.
gui_related: false
gui_classification_reason: Retrieval injection is backend prompt assembly behavior.
depends_on: [AMS-012, AMS-014, AMS-018]
unblocks: [AMS-020]
acceptance_criteria:
- Per-turn retrieval performs lexical and semantic search, internal reranking and at most five eligible
  derived summaries. Details never auto-inject; no user action or legacy pinned/verification setting bypasses
  current support or source permissions. Memory off prevents memory save/use.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "Tantivy"
  - "USearch"
  - "N default `5`"
  - "summary-only"
  - "Verified-only"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-020 - Memory Activation Scoring

```yaml
plan_unit_id: AMS-020
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Internal activation keeps BM25/ANN blend, legacy pinned protection/boost, kind/status,
  recency and access signals. Fading reduces a note's influence; archiving retains an old note outside
  ordinary automatic use; deletion is the user's action. Keep kind half-life defaults and the Done multiplier
  0.5 built in, without per-note/per-kind editors or pin controls. Preserve every existing pin protection
  internally during migration. Archived notes remain searchable and editable; an edit may make one current
  again only after internal checks. Never treat fade time as deletion permission.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: 'Memory is one page shared by Settings and the chat Memory button/wand, which opens that
  same page as a sheet. It contains one Remember things between chats switch, search, a level filter All
  / This project / Every project, a saved-note list, Add memory, Edit, Delete and a collapsed Archived
  group. Search includes archived notes. Each note shows its text, level and updated time; title is optional.
  A quiet total list count is allowed only on the page. No verification queue, confidence/source fields,
  ranking, pins, conflicts, memory preview, source controls, maintenance workbench or second Notes it
  took document appears. Instructions, History/privacy, chat capacity controls and Run limits stay in
  their owners outside Memory. Add writes a new MemoryGist from plain text with inferred kind and optional
  title at an explicit allowed level; Edit writes a new version of the targeted note and preserves its
  prior evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after
  one confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions
  from all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger
  replay, reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit
  user save can deliberately replace its suppression. Delete all in the list menu names and confirms the
  exact selected scope and target set, using the same deletion owner. Failed writes never report success.
  Canonical assistant_memory.redb commits precede asynchronous derived indexes. One short help sentence
  explains that saved notes can be browsed, edited or deleted and older notes fade and may be archived.
  Editing availability uses an explicit owner-checked destination scope under AMS-141; a displayed level
  never masquerades as a completed move.'
gui_related: true
gui_classification_reason: Defines the shared Memory page and note actions.
depends_on: [AMS-010, AMS-014, AMS-018]
unblocks: [AMS-023]
acceptance_criteria:
- 'Memory is one page shared by Settings and the chat Memory button/wand, which opens that same page as
  a sheet. It contains one Remember things between chats switch, search, a level filter All / This project
  / Every project, a saved-note list, Add memory, Edit, Delete and a collapsed Archived group. Search
  includes archived notes. Each note shows its text, level and updated time; title is optional. A quiet
  total list count is allowed only on the page. No verification queue, confidence/source fields, ranking,
  pins, conflicts, memory preview, source controls, maintenance workbench or second Notes it took document
  appears. Instructions, History/privacy, chat capacity controls and Run limits stay in their owners outside
  Memory. Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit
  allowed level; Edit writes a new version of the targeted note and preserves its prior evidence/history.
  Delete is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit
  a durable scoped suppression/tombstone, exclude the note and stale versions from all future read/injection
  paths, and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup
  merge cannot silently recreate that deleted note; only a new explicit user save can deliberately replace
  its suppression. Delete all in the list menu names and confirms the exact selected scope and target
  set, using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb
  commits precede asynchronous derived indexes.'
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-022 - Memory Maintenance Operations

```yaml
plan_unit_id: AMS-022
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses
  existing support owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive
  are archive-only, preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447
  holds remain: approved answers alone do not enable jobs before their application and remaining definition/review/recording
  approvals. No immediate automatic maintenance is authorized. Fading reduces a note''s influence; archiving
  retains an old note outside ordinary automatic use; deletion is the user''s action. Keep kind half-life
  defaults and the Done multiplier 0.5 built in, without per-note/per-kind editors or pin controls. Preserve
  every existing pin protection internally during migration. Archived notes remain searchable and editable;
  an edit may make one current again only after internal checks. Never treat fade time as deletion permission.'
gui_related: false
gui_classification_reason: Maintenance operation semantics are backend storage/index behavior.
depends_on: [AMS-004, AMS-013]
unblocks: [AMS-023]
acceptance_criteria:
- 'Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses existing support
  owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive are archive-only,
  preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447 holds remain:
  approved answers alone do not enable jobs before their application and remaining definition/review/recording
  approvals. No immediate automatic maintenance is authorized. Fading reduces a note''s influence; archiving
  retains an old note outside ordinary automatic use; deletion is the user''s action. Keep kind half-life
  defaults and the Done multiplier 0.5 built in, without per-note/per-kind editors or pin controls. Preserve
  every existing pin protection internally during migration. Archived notes remain searchable and editable;
  an edit may make one current again only after internal checks. Never treat fade time as deletion permission.'
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "Rebuild Tantivy index"
  - "Rebuild USearch index"
  - "Verification sweep"
  - "Dedup sweep"
  - "Monthly summarize/compress"
  - "Prune/archive"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-023 - Memory Maintenance GUI Invocation

```yaml
plan_unit_id: AMS-023
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses
  existing support owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive
  are archive-only, preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447
  holds remain: approved answers alone do not enable jobs before their application and remaining definition/review/recording
  approvals. No immediate automatic maintenance is authorized. Internal operations retain truthful success/failure
  state; storage health and real-failure recovery stay with their existing owners.'
gui_related: true
gui_classification_reason: >-
  Internal maintenance and existing recovery remain behind the page; no user-invokable Memory
  workbench or button is planned.
depends_on: [AMS-021, AMS-022]
unblocks: []
acceptance_criteria:
- 'Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses existing support
  owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive are archive-only,
  preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447 holds remain:
  approved answers alone do not enable jobs before their application and remaining definition/review/recording
  approvals. No immediate automatic maintenance is authorized. Internal operations retain truthful success/failure
  state; storage health and real-failure recovery stay with their existing owners.'
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens:
  - "user-invokable in GUI"
  - "internal maintenance jobs"
  - "explicit success/failure status"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-024 - Memory Integration Boundary Intro

```yaml
plan_unit_id: AMS-024
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Memory supplies reusable notes; child-run records and crew shared state supply operational
  continuity. The Assistant remains the writer and manager. Crews, reviews and the chat assistant's other
  helpers may read the current Project's notes and the user's personal notes at Every project, read-only,
  subject to current source, actor, phase and permission restrictions. This grants no other Project access,
  helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled
  path; read-only access cannot call upsert, delete or verification mutations.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
canonical_text: Assistant prompt assembly uses RealMemoryProvider with bounded current summary-only selection;
  written rules remain in the rules pipeline. The Assistant remains the writer and manager. Crews, reviews
  and the chat assistant's other helpers may read the current Project's notes and the user's personal
  notes at Every project, read-only, subject to current source, actor, phase and permission restrictions.
  This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: Prompt builder routing is backend prompt assembly behavior.
depends_on: [AMS-024]
unblocks: [AMS-026]
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "Assistant uses the real memory subsystem."
  - "Assistant memory remains Assistant-only."
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-026 - Non Assistant NullMemoryProvider Enforcement

```yaml
plan_unit_id: AMS-026
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The Assistant remains the writer and manager. Crews, reviews and the chat assistant's
  other helpers may read the current Project's notes and the user's personal notes at Every project, read-only,
  subject to current source, actor, phase and permission restrictions. This grants no other Project access,
  helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled
  path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: NullMemoryProvider routing is backend runtime wiring behavior.
depends_on: [AMS-005, AMS-025]
unblocks: [AMS-027]
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "NullMemoryProvider"
  - "receive no Assistant memory payload"
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
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
canonical_text: Retain separate canonical assistant_memory.redb and rebuildable Tantivy/USearch indexes,
  the internal 350-token capsule and five-note retrieval limits, current supported summary-only injection
  and useful unverified candidate retention. The Assistant remains the writer and manager. Crews, reviews
  and the chat assistant's other helpers may read the current Project's notes and the user's personal
  notes at Every project, read-only, subject to current source, actor, phase and permission restrictions.
  This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: Core defaults are backend configuration defaults.
depends_on: [AMS-029]
unblocks: [AMS-031, AMS-032, AMS-033]
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "350"
  - "max `5` gists/turn"
  - "summary-only"
  - "Verified-only"
  - "NullMemoryProvider"
  - "Auto-save unverified gists: enabled"
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-031 - Kind Half Life Defaults

```yaml
plan_unit_id: AMS-031
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Fading reduces a note's influence; archiving retains an old note outside ordinary automatic
  use; deletion is the user's action. Keep kind half-life defaults and the Done multiplier 0.5 built in,
  without per-note/per-kind editors or pin controls. Preserve every existing pin protection internally
  during migration. Archived notes remain searchable and editable; an edit may make one current again
  only after internal checks. Never treat fade time as deletion permission. Unset half_life_days still
  resolves to the existing full kind table in section 9.2.
gui_related: false
gui_classification_reason: Half-life defaults and decay multipliers are backend scoring configuration.
depends_on: [AMS-029, AMS-030]
unblocks: []
acceptance_criteria:
- Fading reduces a note's influence; archiving retains an old note outside ordinary automatic use; deletion
  is the user's action. Keep kind half-life defaults and the Done multiplier 0.5 built in, without per-note/per-kind
  editors or pin controls. Preserve every existing pin protection internally during migration. Archived
  notes remain searchable and editable; an edit may make one current again only after internal checks.
  Never treat fade time as deletion permission. Unset half_life_days still resolves to the existing full
  kind table in section 9.2.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-032 - Verification Default Configuration

```yaml
plan_unit_id: AMS-032
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence. allow_manual_verify_without_evidence and allow_pinned_unverified_injection
  are always false, including when old stored values were true; auto_save_unverified remains internal
  candidate handling.'
gui_related: false
gui_classification_reason: Verification defaults are backend configuration and prompt eligibility rules.
depends_on: [AMS-014, AMS-029, AMS-030]
unblocks: []
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "Unverified"
  - "Verified-only"
  - "assistant.memory.allow_pinned_unverified_injection = false"
  - "assistant.memory.auto_save_unverified = true"
  - "assistant.memory.allow_manual_verify_without_evidence = false"
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-033 - Project Scoped Memory Config Keys

```yaml
plan_unit_id: AMS-033
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Only memory.retention.enabled remains the live Memory switch, resolved by the existing
  Settings ladder. The other retired memory tuning keys have compatibility reads only under SSYS-040;
  initial built-in defaults retain capsule 350, maximum five summaries, existing kind half-lives and Done
  multiplier 0.5. Old assistant.memory.* owner spellings remain migration lineage, not parallel knobs
  or authority to merge stores. Old source-off/privacy choices migrate to equal or stricter Permissions
  read restrictions before access, never silently enabling sources.
gui_related: false
gui_classification_reason: Memory config keys and project-scoped resolution are backend configuration behavior.
depends_on: [AMS-029, AMS-030]
unblocks: [AMS-034]
acceptance_criteria:
- Only memory.retention.enabled remains the live Memory switch, resolved by the existing Settings ladder.
  The other retired memory tuning keys have compatibility reads only under SSYS-040; initial built-in
  defaults retain capsule 350, maximum five summaries, existing kind half-lives and Done multiplier 0.5.
  Old assistant.memory.* owner spellings remain migration lineage, not parallel knobs or authority to
  merge stores. Old source-off/privacy choices migrate to equal or stricter Permissions read restrictions
  before access, never silently enabling sources.
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
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
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
canonical_text: Backend acceptance covers durable Add/Edit/Delete, user-statement support without world-fact
  promotion, cache invalidation, meaningful-only triggers, deduplication and deletion suppression across
  old transcripts/replay/rebuild/restore. Check automatic fading, archive preservation, legacy pin protection,
  maintenance holds, memory-off save/use refusal, correct Project plus personal helper reads, denied mutations,
  other-Project exclusion and private app-thread separation. Existing local storage/index rebuild equivalence
  and separate rules budgets remain.
gui_related: false
gui_classification_reason: These acceptance criteria validate backend memory behavior and persistence.
depends_on: [AMS-014, AMS-015, AMS-016, AMS-030, AMS-031, AMS-032, AMS-033]
unblocks: []
acceptance_criteria:
- Backend acceptance covers durable Add/Edit/Delete, user-statement support without world-fact promotion,
  cache invalidation, meaningful-only triggers, deduplication and deletion suppression across old transcripts/replay/rebuild/restore.
  Check automatic fading, archive preservation, legacy pin protection, maintenance holds, memory-off save/use
  refusal, correct Project plus personal helper reads, denied mutations, other-Project exclusion and private
  app-thread separation. Existing local storage/index rebuild equivalence and separate rules budgets remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-036 - GUI Memory Acceptance Criteria

```yaml
plan_unit_id: AMS-036
unit_type: validation_rule
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: GUI acceptance checks the single Memory page and sheet, exact This project / Every project
  labels, search including Archived, level filter, Add/Edit/Delete and scoped Delete all, one switch and
  no hidden retired controls in search or All Settings. Verify durable write/restart behavior and only
  successful Saved to memory · View acknowledgments. Check absence of memory-use and Followed/Missed decorations,
  selection previews and cleanup workbench.
gui_related: true
gui_classification_reason: Checks Memory page actions and absence of retired memory decorations.
depends_on: [AMS-021, AMS-023, AMS-035]
unblocks: []
acceptance_criteria:
- GUI acceptance checks the single Memory page and sheet, exact This project / Every project labels, search
  including Archived, level filter, Add/Edit/Delete and scoped Delete all, one switch and no hidden retired
  controls in search or All Settings. Verify durable write/restart behavior and only successful Saved
  to memory · View acknowledgments. Check absence of memory-use and Followed/Missed decorations, selection
  previews and cleanup workbench.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "GUI Verify enforcement"
  - "Capsule cap enforcement"
  - "Default review filter behavior"
  - "verification_state = Unverified"
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints:
  - Plans/assistant-memory-subsystem.md
```

### AMS-037 - Assistant Memory Non Goals

```yaml
plan_unit_id: AMS-037
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: No new database, external memory service, per-helper store, hidden helper-owned memory,
  cross-Project read grant or private app-thread sharing is introduced. Existing seglog/redb/Tantivy/USearch
  storage architecture and bounded context remain. The Assistant remains the writer and manager. Crews,
  reviews and the chat assistant's other helpers may read the current Project's notes and the user's personal
  notes at Every project, read-only, subject to current source, actor, phase and permission restrictions.
  This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
gui_related: false
gui_classification_reason: Non-goals are backend architecture and storage boundaries.
depends_on: [AMS-003, AMS-004, AMS-026]
unblocks: []
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "No memory exposure to non-Assistant agents."
  - "No replacement of seglog/redb/Tantivy system storage contracts."
  - "No external vector DB service."
  - "No file-bank style requirement that memory must be markdown-file based."
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
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
canonical_text: Plan-local events and commands require their canonical owners before consumption. Authorized
  helper reads follow AMS-026 with NullMemoryProvider for denied/disabled paths; no hidden child store
  or event reconstruction supplies memory authority. Existing remaining runtime owner gaps are not closed
  by presentation changes.
gui_related: false
gui_classification_reason: Plan-local obligation routing is owner-boundary and governance behavior.
depends_on: [AMS-038]
unblocks: []
acceptance_criteria:
- Plan-local events and commands require their canonical owners before consumption. Authorized helper
  reads follow AMS-026 with NullMemoryProvider for denied/disabled paths; no hidden child store or event
  reconstruction supplies memory authority. Existing remaining runtime owner gaps are not closed by presentation
  changes.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
  - "plan-local"
  - "/event/command"
  - "NullMemoryProvider"
  - "Remaining Gemini-only docs are not low-value leftovers"
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
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
