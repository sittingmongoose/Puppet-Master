# Assistant-Only Memory Subsystem (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Change Summary
- 2026-02-26: Initial canonical Assistant-only memory subsystem specification (boundary, storage, retrieval, decay, prompt injection, maintenance, deterministic defaults).

**Date:** 2026-02-26  
**Status:** Canonical plan/spec  
**Cross-references:** `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/agent-rules-context.md`, `Plans/rewrite-tie-in-memo.md`, `Plans/Decision_Policy.md`, `Plans/auto_decisions.jsonl`

---

## 0. Scope and boundary

This document is the canonical SSOT for Assistant memory continuity in Puppet Master. It defines only Assistant memory contracts and integration points. It does not replace or redefine system event storage (`seglog`), system KV/search projections (`redb` + Tantivy), or the shared rules pipeline.

Rule: Assistant memory MUST be implemented as a continuity/project-state subsystem that is separate from rules assembly and separate from non-Assistant agent execution paths.
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2

Rule: Assistant memory MUST run fully in-process and local-only; it MUST NOT require external servers and MUST NOT use SQLite.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/rewrite-tie-in-memo.md

---

<a id="1-capability-boundary"></a>
## 1. Capability boundary (Assistant-only)

### 1.1 Memory provider contract

Canonical interface names:
- `MemoryProvider` (trait/interface)
- `RealMemoryProvider` (Assistant-enabled implementation)
- `NullMemoryProvider` (returns empty results; no-op writes)

Required interface surface:
- `build_capsule(project_id, now) -> WorkingSetCapsule`
- `search(project_id, user_message, now, k) -> Vec<MemoryItemSummary>`
- `record_access(project_id, memory_id, now) -> Result`
- `upsert_item(project_id, item) -> Result`
- `delete_item(project_id, memory_id) -> Result`

Rule: Compile-time wiring MUST route Assistant prompt assembly to `RealMemoryProvider`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: Orchestrator, Interviewer, requirements builder, and all subagents MUST be wired to `NullMemoryProvider` and MUST receive no Assistant memory payload.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/agent-rules-context.md

Rule: Assistant memory MUST NOT be forwarded to subagents through prompts, tools, handoffs, or hidden metadata.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, PolicyRule:Decision_Policy.md§2

---

<a id="2-physical-storage-layout"></a>
## 2. Physical storage layout (per project)

Per-project memory stores (deterministic default):
- System DB (project-state reference): `.puppet-master/project/state/system.redb`
- Assistant Memory DB (canonical): `.puppet-master/project/state/assistant_memory.redb`
- Assistant Memory Tantivy index: `.puppet-master/project/state/assistant_memory_index/`
- Assistant Memory USearch index: `.puppet-master/project/state/assistant_memory_vectors.usearch`

Note: This document does not change the canonical system-storage default in `Plans/storage-plan.md` (app-global redb layout). The `system.redb` path above is the project-state reference path for memory-local packaging/project-scoped state mode.

Rule: Assistant memory MUST use separate physical stores from system state stores to avoid writer contention and coupling.
ContractRef: ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2

Rule: Shared crates/libraries MAY be reused across subsystems, but file-level physical separation MUST remain in place.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout

Rule: Memory data MUST be project-scoped and project switching MUST swap active memory stores atomically at the project boundary.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#8-integration-points, ContractName:Plans/assistant-chat-design.md#11-threads-and-chat-management

---

<a id="3-data-model"></a>
## 3. Data model (GUI-first records)

Canonical record: `MemoryItem`

Required fields:
- Identity/scope: `id`, `project_id` (optional if DB is physically per-project)
- Classification: `kind`, `status`, `pinned`
- Time/access: `created_at`, `updated_at`, `last_access_at`, `access_count`
- Decay: `half_life_days` (kind-defaulted; user-adjustable)
- Labels: `tags[]`
- Content:
  - `summary` (1–2 sentences; only field eligible for automatic prompt injection)
  - `details` (optional; never auto-injected)
- Provenance/versioning: `source` (`assistant` | `user` | `imported`), `embedding_version`, `text_hash`

Rule: Automatic prompt injection MUST use `summary` only and MUST NOT auto-inject `details`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: GUI memory operations (list/edit/pin/delete/half-life edits) MUST read and write `MemoryItem` records in `assistant_memory.redb` as the canonical source.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-maintenance-operations, ContractName:Plans/storage-plan.md

### 3.1 Suggested redb tables (`assistant_memory.redb`)

- `memory_items` (`id` -> serialized `MemoryItem`)
- `by_kind_status` (secondary index for capsule assembly)
- `by_tag` (secondary index)
- `memory_vectors` (`memory_id` -> vector slot / tombstone metadata)
- `meta` (schema version, index rebuild metadata, last successful maintenance run)

Rule: redb content in `assistant_memory.redb` MUST be the canonical store for memory records and index rebuild source-of-truth.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#4-retrieval-indexes

---

<a id="4-retrieval-indexes"></a>
## 4. Retrieval indexes

### 4.1 Tantivy (lexical)

Indexed fields:
- `id` (keyword)
- `kind` (keyword)
- `status` (keyword)
- `tags` (keyword/text)
- `summary` (text)
- `details` (text)
- `updated_at` (date/numeric)
- `pinned` (bool/keyword)

Rule: Lexical index updates MUST be delete+add by `id`, and full lexical rebuild MUST be supported from `assistant_memory.redb`.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#7-maintenance-operations

### 4.2 USearch (semantic ANN)

Canonical mapping:
- Vector entry -> `MemoryItem.id`
- Persist ANN state in `assistant_memory_vectors.usearch` via serialize/deserialize
- Persist `memory_id -> vector_slot` mapping (and tombstone state) in `assistant_memory.redb`

Rule: Deletes/updates MUST use tombstones and MUST support deterministic periodic full rebuild (re-embed + repack).
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-maintenance-operations, PolicyRule:Decision_Policy.md§2

---

<a id="5-lifecycle-and-performance"></a>
## 5. Lifecycle, durability, and performance constraints

### 5.1 Write triggers

Memory write events are limited to:
1. Explicit user actions in GUI (add/edit/pin/delete)
2. Project switch handoff record creation
3. End-of-session or idle summarization (rate-limited)
4. Optional heuristic triggers (strictly rate-limited)

Rule: Assistant memory MUST NOT write on every streamed token or every turn by default.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-lifecycle-and-performance, PolicyRule:Decision_Policy.md§2

### 5.2 Durability and indexing pipeline

Canonical write order:
1. Write canonical record change to `assistant_memory.redb`
2. Enqueue lexical + semantic index updates
3. Apply index updates asynchronously
4. Expose rebuild operations for recovery

Rule: Explicit user actions MUST use durable writes; auto-generated summaries MAY use relaxed durability but MUST flush on safe boundaries (project switch, app idle flush, graceful shutdown).
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#7-maintenance-operations

Rule: Indexing failures MUST be surfaced as recoverable maintenance state and MUST NOT silently drop canonical writes.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-maintenance-operations, PolicyRule:Decision_Policy.md§2

---

<a id="6-prompt-injection-contract"></a>
## 6. Prompt injection contract (token protection)

Memory is continuity and project state. Memory is not rules.

Rule: Prompt assembly MUST treat memory as a distinct context source that is separate from application/project rules pipeline output.
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/assistant-chat-design.md#17-context--truncation

### 6.1 Always-loaded capsule

Always inject a tiny **Working Set capsule** for the active project:
- Budget default: `350` tokens
- Sections:
  1. Project Capsule bullets
  2. Current Thread short paragraph
  3. Recent Decisions
  4. Recent Blockers
- Source: `by_kind_status` + activation scoring + pins

Rule: Capsule assembly MUST enforce the configured hard token cap before sending any Assistant prompt.
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, ContractName:Plans/assistant-chat-design.md#17-context--truncation

### 6.2 Per-turn retrieval injection

Per user turn:
1. Execute lexical search (Tantivy) + semantic search (USearch)
2. Merge/rerank with activation scoring
3. Inject up to `N` memory items (`N` default `5`)
4. Inject only `summary` text (1–2 sentences each)

Rule: Retrieval injection MUST NOT exceed max item count and MUST remain summary-only.
ContractRef: ConfigKey:assistant.memory.max_injected_items_per_turn, ContractName:Plans/assistant-memory-subsystem.md#3-data-model

### 6.3 Activation scoring (required components)

Activation scoring must include:
- `pinned` boost
- kind/status weighting (including done-state multiplier)
- recency decay (`half_life_days`)
- access signals (`access_count`, `last_access_at`)
- retrieval blend (BM25 + ANN scores)

Reference blend contract:
`activation_score = pin_boost + kind_status_weight + recency_decay + access_signal + retrieval_blend`

Rule: Done-status items MUST decay faster using `effective_half_life_days = half_life_days * 0.5`.
ContractRef: ConfigKey:assistant.memory.done_decay_multiplier, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

---

<a id="7-maintenance-operations"></a>
## 7. Maintenance operations (GUI + internal)

Required operations:
1. Rebuild lexical index from `assistant_memory.redb`
2. Rebuild semantic index from `assistant_memory.redb` (re-embed + rebuild USearch)
3. Prune/archive low-activation old notes (policy-driven)
4. Summarize/compress old notes into deterministic “Monthly Summary” memory items

Rule: All maintenance operations MUST run in-process and MUST NOT depend on external services.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/rewrite-tie-in-memo.md

Rule: Maintenance operations MUST be user-invokable in GUI and callable by internal maintenance jobs with explicit success/failure status.
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

---

<a id="8-integration-points"></a>
## 8. Integration points

### 8.1 Assistant prompt builder

Required calls:
- `build_capsule(project_id, now)`
- `search(project_id, user_message, now, k)`

Rule: Assistant prompt builder MUST invoke both APIs for project-scoped turns and MUST skip both when no project is selected.
ContractRef: ContractName:Plans/assistant-chat-design.md#17-context--truncation, ConfigKey:assistant.memory.enabled

### 8.2 Project switching

On project switch:
1. Write a handoff memory item in the old project (`kind = Handoff`)
2. Flush pending memory/index updates for old project
3. Load capsule for the new project

Rule: Project switch handling MUST isolate old/new project memory state and MUST NOT cross-inject records across project boundaries.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-chat-design.md#11-threads-and-chat-management

### 8.3 GUI contracts

GUI must provide:
- Memory list view (filter/sort by kind/status/tags/pinned)
- Create/edit/delete/pin actions
- “What’s in capsule now” preview
- Half-life controls per item and per kind defaults
- Explicit maintenance actions (rebuild/prune/compress)

Rule: GUI edits MUST write canonical records first and surface index lag/rebuild state to the user when applicable.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#5-lifecycle-and-performance

---

<a id="9-deterministic-defaults"></a>
## 9. Deterministic defaults

### 9.1 Core defaults

- Physical stores: separate Assistant memory redb + Tantivy + USearch files (per project)
- Capsule budget: `350` tokens
- Retrieval injection: max `5` items/turn, summary-only
- Subagent access: disabled (always `NullMemoryProvider`)

Rule: These defaults MUST apply without user prompts unless explicitly overridden by a persisted config value.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary

### 9.2 Half-life defaults by `kind` (days)

| kind | default_half_life_days |
|------|-------------------------|
| `CurrentThread` | 14 |
| `Blocker` | 21 |
| `Decision` | 180 |
| `Preference` | 365 |
| `Landmine` | 365 |
| `Handoff` | 60 |
| `Note` | 45 |

Status decay rule:
- `status = Done` -> apply multiplier `0.5` to half-life for activation scoring

Rule: Any unset `half_life_days` value MUST resolve to the table default for that `kind`.
ContractRef: ConfigKey:assistant.memory.default_half_life_days, ConfigKey:assistant.memory.done_decay_multiplier

### 9.3 Config keys

- `assistant.memory.enabled` (default `true`)
- `assistant.memory.capsule_budget_tokens` (default `350`)
- `assistant.memory.max_injected_items_per_turn` (default `5`)
- `assistant.memory.done_decay_multiplier` (default `0.5`)
- `assistant.memory.default_half_life_days.<kind>` (defaults per table above)
- `assistant.memory.retrieval.blend.bm25_weight` (default `0.5`)
- `assistant.memory.retrieval.blend.ann_weight` (default `0.5`)

Rule: Config resolution MUST be deterministic and project-scoped for memory behavior.
ContractRef: ContractName:Plans/Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout

---

<a id="10-acceptance-criteria"></a>
## 10. Acceptance criteria (testable)

1. **Assistant-only boundary:** Assistant calls `RealMemoryProvider`; Orchestrator/Interviewer/requirements/subagents call `NullMemoryProvider`; no memory payload is observable in subagent prompts.
2. **Storage layout:** For a project with memory enabled, the three Assistant-memory paths in §2 are created or loadable (`assistant_memory.redb`, `assistant_memory_index/`, `assistant_memory_vectors.usearch`); no SQLite file is introduced.
3. **Canonical data model:** Creating/editing/pinning/deleting a memory item updates `assistant_memory.redb` and survives restart.
4. **Capsule budget:** Capsule assembly enforces the 350-token cap and emits deterministic truncation behavior when over budget.
5. **Retrieval cap:** Per-turn retrieval injects at most 5 summaries and never injects `details`.
6. **Decay behavior:** Done items decay faster (`*0.5` half-life) and fall out of auto-injection sooner than equivalent active items.
7. **Project isolation:** Switching projects writes handoff to old project and loads capsule for new project without cross-project leakage.
8. **Maintenance recoverability:** Rebuild lexical and semantic indexes from canonical redb succeeds after simulated index corruption.
9. **Rules separation:** Rules pipeline output remains unchanged when memory entries are added/edited; memory appears only in memory injection path.

Rule: A change is complete only when all acceptance criteria above are met and verified by deterministic checks.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/assistant-memory-subsystem.md#10-acceptance-criteria

---

## 11. Non-goals

- No memory exposure to non-Assistant agents.
- No replacement of seglog/redb/Tantivy system storage contracts.
- No external vector DB service.
- No file-bank style requirement that memory must be markdown-file based.

Rule: Implementations MUST keep these non-goals intact.
ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/agent-rules-context.md
