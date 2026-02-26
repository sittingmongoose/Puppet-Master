# Assistant-Only Memory Subsystem (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Change Summary
- 2026-02-26: Revised canonical Assistant-only memory SSOT to use **Evidence-Backed Gists** (MemoryGist + EvidenceRef), deterministic verification, AutoRunBoundary/AutoMilestone triggers, Tantivy/USearch indexing contracts, and GUI Gist Review panel.

**Date:** 2026-02-26  
**Status:** Canonical plan/spec  
**Cross-references:** `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/agent-rules-context.md`, `Plans/rewrite-tie-in-memo.md`, `Plans/Decision_Policy.md`, `Plans/auto_decisions.jsonl`, `Plans/evidence.schema.json`

---

## 0. Scope and boundary

This document is the canonical SSOT for **Assistant-only** memory continuity in Puppet Master.
It defines the data model, verification gates, triggers, indexing, and GUI interactions for Assistant memory.
It does not replace or redefine system event storage (`seglog` SSOT), system KV/search projections (`redb` + Tantivy), or the shared rules pipeline.

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

Required interface surface (logical contract; naming may vary in code):
- `build_capsule(project_id, now) -> WorkingSetCapsule`
- `search(project_id, query, now, k) -> Vec<MemoryGistHit>`
- `record_access(project_id, gist_id, now) -> Result`
- `upsert_gist(project_id, gist) -> Result`
- `delete_gist(project_id, gist_id) -> Result`
- `set_verification_state(project_id, gist_id, verification_state, now) -> Result`

Rule: Compile-time wiring MUST route Assistant prompt assembly to `RealMemoryProvider`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: Orchestrator, Interviewer, requirements builder, and all subagents MUST be wired to `NullMemoryProvider` and MUST receive no Assistant memory payload.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/agent-rules-context.md

Rule: Assistant memory MUST NOT be forwarded to subagents through prompts, tools, handoffs, or hidden metadata.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, PolicyRule:Decision_Policy.md§2

### 1.2 Assistant-only evidence boundary

Assistant memory uses lightweight **EvidenceRefs** to point at verification evidence stored elsewhere (seglog refs, artifacts, commits). It does not become an evidence store.

Rule: MemoryGist records MUST NOT persist large diffs, full logs, or large artifacts; they MUST persist only compact claims/details plus EvidenceRefs to canonical sources.
ContractRef: SchemaID:pm.evidence.schema.v1, ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2

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
## 3. Data model (Evidence-Backed Gists; GUI-first)

Canonical record: `MemoryGist`.

### 3.1 `MemoryGist` fields (required)

Required fields (conceptual contract):
- Identity/scope:
  - `id` (stable ID)
  - `project_id` (optional if DB is physically per-project)
- Classification:
  - `kind` (see §9.2)
  - `status` (e.g., `Active` | `Done` | `Archived`)
  - `pinned` (bool)
- Verification:
  - `verification_state` (see §5.3)
- Time/access:
  - `created_at`, `updated_at`
  - `last_access_at`, `access_count`
- Decay:
  - `half_life_days` (kind-defaulted; user-adjustable)
- Labels:
  - `tags[]`
- Claims-first content:
  - `claims[]` (each claim is a compact, atomic statement; see §3.2)
  - `summary` (derived; cached field allowed)
  - `details` (optional; never auto-injected)
- Evidence:
  - `evidence_refs[]` (see §3.3)
- Provenance:
  - `source` (`AutoRunBoundary` | `AutoMilestone` | `UserManual` | `Import`)
  - `run_id` / `thread_id` (optional, for traceability)
- Embedding/index versioning:
  - `embedding_version`
  - `embed_text_hash`
  - `text_hash`

Rule: Automatic prompt injection MUST use only Verified gists’ derived `summary` text and MUST NOT auto-inject `details`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: `summary` MUST be derivable deterministically from `kind + claims[] (+ minimal tags)` so that re-derivation yields stable injection text.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract

Rule: When `kind`, `tags[]`, or `claims[]` change, any cached derived fields (`summary`, `embed_text_hash`, `text_hash`) MUST be invalidated and re-derived before the next capsule assembly or retrieval injection.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#4-retrieval-indexes, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract

Rule: GUI memory operations (list/edit/verify/pin/delete/half-life edits) MUST read and write `MemoryGist` records in `assistant_memory.redb` as the canonical source.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/storage-plan.md

### 3.2 `claims[]` model (atomic statements)

A `claim` is a compact statement intended to be independently verifiable and independently deduplicated.

Recommended minimal shape:
- `claim_id` (stable within gist)
- `text` (single sentence)
- `created_at`

Rule: Claims MUST be short, single-purpose statements; multi-claim gists MUST keep each claim independently meaningful for verification and dedup.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 3.3 `EvidenceRef` model (structured, pointers only)

`EvidenceRef` is a structured pointer to verification evidence; it is not the evidence payload itself.

Supported variants (canonical contract):
- `Commit { hash, repo_id }`
- `Diff { run_id, repo_id, paths[], stats }`
- `TestRun { run_id, command, exit_code, summary_hash }`
- `BuildRun { run_id, command, exit_code, summary_hash }`
- `LintRun { run_id, command, exit_code, summary_hash }`
- `Artifact { path, change_type, content_hash? }`
- `PlanRef { file_path, anchor_id? }`
- Optional workflow refs:
  - `Issue { provider, id }`
  - `PR { provider, id }`

Rule: EvidenceRefs MUST be small pointers (IDs, hashes, paths) and MUST NOT embed large diffs/logs/artifact bodies.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2

Rule: `Artifact` EvidenceRefs MUST point to system-captured run artifacts (including evidence bundles) and SHOULD include `content_hash` when available to make verification reproducible.
ContractRef: SchemaID:pm.evidence.schema.v1, ContractName:Plans/Contracts_V0.md#EventRecord, PolicyRule:Decision_Policy.md§2

---

<a id="4-retrieval-indexes"></a>
## 4. Retrieval + indexing contracts

Assistant memory retrieval is implemented as:
- **Tantivy** lexical search over gist text fields
- **USearch** semantic ANN over deterministic embed text

### 4.1 Tantivy (lexical)

Canonical indexed fields (minimum):
- `id` (keyword)
- `kind` (keyword)
- `status` (keyword)
- `verification_state` (keyword)
- `pinned` (bool/keyword)
- `tags` (keyword/text)
- `claims_text` (text; concatenated)
- `summary` (text)
- `details` (text; optional)
- `updated_at` (date/numeric)

Rule: Lexical index updates MUST be delete+add by `id`, and full lexical rebuild MUST be supported from `assistant_memory.redb`.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance

### 4.2 USearch (semantic ANN)

Canonical mapping:
- Vector entry -> `MemoryGist.id`
- Persist ANN state in `assistant_memory_vectors.usearch` via serialize/deserialize
- Persist `gist_id -> vector_slot` mapping (and tombstone state) in `assistant_memory.redb`

Deterministic embed text:
- `embed_text = kind + "\n" + join(tags) + "\n" + join(claims[].text)` (exclude `details`)
- `embed_text_hash = hash(embed_text)`
- `text_hash = hash(kind + "\n" + join(tags) + "\n" + join(claims[].text) + "\n" + summary + "\n" + details_or_empty)`

Rule: USearch embeddings MUST be computed from deterministic `embed_text` and MUST use `embed_text_hash` to detect no-op updates and deduplicate repeated Auto triggers.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers

Rule: Deletes/updates MUST use tombstones and MUST support deterministic periodic full rebuild (re-embed + repack) from canonical `assistant_memory.redb`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, PolicyRule:Decision_Policy.md§2

### 4.3 Canonical write + index update order

Canonical write order:
1. Write canonical `MemoryGist` change to `assistant_memory.redb`
2. Enqueue Tantivy + USearch index updates
3. Apply index updates asynchronously
4. Expose deterministic rebuild operations for recovery

Rule: Canonical writes to `assistant_memory.redb` MUST succeed independently of indexing, and index failures MUST be recoverable without data loss.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/storage-plan.md

---

<a id="5-verification-and-triggers"></a>
## 5. Verification + triggers (Evidence-Backed Gists)

### 5.1 Verification intent

Verification exists to prevent prompt injection of incorrect or stale continuity.

Rule: By default, only `verification_state = Verified` gists are eligible for capsule assembly and per-turn retrieval injection.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, PolicyRule:Decision_Policy.md§2

### 5.2 Trigger contracts

#### 5.2.1 AutoRunBoundary (end of each Assistant run)

AutoRunBoundary is invoked exactly once at the end of each Assistant run (after the Assistant produces its final response).
It builds **one** candidate gist from run artifacts (changed paths, tool results, commits/PR refs when present) so that memory gists can be generated even when no Plans/SSOT files were touched.

Rule: AutoRunBoundary MUST run at the end of each Assistant run and MUST create/update at most **one** `MemoryGist` per run with `source = AutoRunBoundary`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: AutoRunBoundary MUST deduplicate candidates across runs using `embed_text_hash` and normalized EvidenceRefs (no duplicate persisted gist for identical claim/evidence sets).
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#4-retrieval-indexes, PolicyRule:Decision_Policy.md§2

Rule: AutoRunBoundary MUST evaluate deterministic verification rules (§5.3) before persisting and MUST set `verification_state` to `Verified` when the rules are satisfied; otherwise it persists as `Unverified`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: AutoRunBoundary MUST respect `assistant.memory.auto_save_unverified`; when disabled, it MUST drop newly-proposed gists that remain `Unverified` at the end of the run.
ContractRef: ConfigKey:assistant.memory.auto_save_unverified, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

#### 5.2.2 AutoMilestone (promotion event; less frequent)

AutoMilestone is a promotion event that runs when verification-relevant evidence becomes available (commit created, PR opened, tests/build/lint completed, artifact produced, or user confirms “done” via GUI action).
It MAY create/promote an `Outcome` gist and MAY refresh verification_state.

Rule: AutoMilestone MUST be idempotent, MUST be deduplicated per `(gist_id, evidence_ref)` pair, and MUST be rate-limited to at most **once per run**.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: AutoMilestone MUST create/promote at most one `Outcome` gist per run when any milestone occurs: tests transition failing→passing, a commit is created, a PR is opened, or the user confirms “done” via a GUI action.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: If AutoMilestone is triggered in a run, it MUST execute before AutoRunBoundary persistence so the run-end candidate reflects any within-run promotions.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 5.3 Deterministic verification rules

`verification_state` enum:
- `Unverified` (default)
- `Verified`
- `Discarded`

Rule: Auto-generated gists MUST be saved as `Unverified` unless they satisfy a deterministic verification rule below.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers

Rule: A gist MUST transition to `Verified` if and only if ANY holds:
1) It has a `Commit { hash, repo_id }` EvidenceRef.
2) It has a successful `TestRun` or `BuildRun` EvidenceRef (`exit_code == 0`) AND it has a `Diff` or `Artifact` EvidenceRef.
3) It has a `PlanRef` EvidenceRef AND `kind` is `Decision` / `Constraint` / `Preference` / `Landmine`.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2

Rule: A gist MUST NOT transition to `Verified` if `evidence_refs[]` is empty.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2

Rule: Manual “Verify” MUST re-run deterministic validation; if validation fails, the gist MUST remain `Unverified` unless `assistant.memory.allow_manual_verify_without_evidence = true` (default `false`).
ContractRef: ConfigKey:assistant.memory.allow_manual_verify_without_evidence, PolicyRule:Decision_Policy.md§2

Rule: “Discard” MUST set `verification_state = Discarded` and discarded gists MUST be excluded from automatic injection and default search results.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, PolicyRule:Decision_Policy.md§2

---

<a id="6-prompt-injection-contract"></a>
## 6. Prompt injection contract (token protection)

Memory is continuity and project state. Memory is not rules.

Rule: Prompt assembly MUST treat memory as a distinct context source that is separate from application/project rules pipeline output.
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/assistant-chat-design.md#17-context--truncation

### 6.1 Always-loaded capsule (Verified-only by default)

Always inject a tiny **Working Set capsule** for the active project:
- Budget default: `350` tokens
- Sections (fixed order): Project Capsule bullets, Current Thread paragraph, Recent decisions, Recent blockers
- Source: eligible gists selected by pins + activation scoring (eligibility defaults to `verification_state = Verified`)

Rule: Capsule assembly MUST enforce the configured hard token cap before sending any Assistant prompt.
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: Capsule assembly MUST exclude `verification_state != Verified` gists by default. `Unverified` gists MAY be included only by explicit user action; pinned Unverified gists MUST NOT be auto-included unless `assistant.memory.allow_pinned_unverified_injection = true`.
ContractRef: ConfigKey:assistant.memory.allow_pinned_unverified_injection, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 6.2 Per-turn retrieval injection (Verified-only)

Per user turn:
1. Execute lexical search (Tantivy) + semantic search (USearch)
2. Merge/rerank with activation scoring
3. Inject up to `N` gists (`N` default `5`)
4. Inject only derived `summary` text (1–2 sentences each)

Rule: Retrieval injection MUST NOT exceed max item count and MUST remain summary-only.
ContractRef: ConfigKey:assistant.memory.max_injected_items_per_turn, ContractName:Plans/assistant-memory-subsystem.md#3-data-model

Rule: Retrieval injection MUST exclude `verification_state != Verified` gists by default. `Unverified` gists MAY be included only by explicit user action; pinned Unverified gists MUST NOT be auto-included unless `assistant.memory.allow_pinned_unverified_injection = true`.
ContractRef: ConfigKey:assistant.memory.allow_pinned_unverified_injection, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 6.3 Activation scoring (required components)

Activation scoring must include:
- `pinned` boost
- kind/status weighting
- recency decay (`half_life_days`)
- access signals (`access_count`, `last_access_at`)
- retrieval blend (BM25 + ANN scores)

Rule: Done-status gists MUST decay faster using `effective_half_life_days = half_life_days * 0.5`.
ContractRef: ConfigKey:assistant.memory.done_decay_multiplier, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

---

<a id="7-gui-and-maintenance"></a>
## 7. GUI + maintenance operations

### 7.1 GUI: Gist Review panel

The GUI must expose a **Gist Review** panel adjacent to (and visually consistent with) Memory + Rules panels.

Required UI elements:
- List of gists with filters: kind/status/tags/pinned/verification_state
- Toggle: `assistant.memory.auto_save_unverified` (default `true`)
- Actions per gist: `Verify`, `Edit`, `Pin/Unpin`, `Discard`
- Half-life controls: per-gist half-life override and per-kind default editor
- “What’s in capsule now” preview with token estimate and hard-cap indicator
- Maintenance actions: rebuild lexical index, rebuild semantic index, verification sweep, dedup sweep, monthly summarize/compress, prune/archive low-activation gists

Rule: The Gist Review panel MUST surface verification_state prominently and MUST make “Verify” and “Discard” first-class actions.
ContractRef: ConfigKey:assistant.memory.auto_save_unverified, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers

Rule: Capsule preview MUST report an estimated token count and MUST indicate when truncation occurred due to the configured cap.
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, ContractName:Plans/assistant-chat-design.md#17-context--truncation

### 7.2 Maintenance operations (deterministic)

Required operations:
1. Rebuild Tantivy index from `assistant_memory.redb`
2. Rebuild USearch index from `assistant_memory.redb` (re-embed + rebuild)
3. Verification sweep: re-evaluate verification_state for all gists
4. Dedup sweep: merge identical `embed_text_hash` gists (policy-driven; preserve evidence refs)
5. Monthly summarize/compress: consolidate older low-activation `Note` gists into a monthly `Note` gist (policy-driven; preserve EvidenceRefs)
6. Prune/archive: archive or delete very low-activation gists (policy-driven; never delete pinned)

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
1. Write a handoff gist in the old project (`kind = Handoff`)
2. Flush pending memory/index updates for old project
3. Load capsule for the new project

Rule: Project switch handling MUST isolate old/new project memory state and MUST NOT cross-inject records across project boundaries.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout, ContractName:Plans/assistant-chat-design.md#11-threads-and-chat-management

### 8.3 Rules separation

Rule: Rules pipeline output MUST remain unchanged when gists are added/edited; memory appears only in the memory injection path.
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract

---

<a id="9-deterministic-defaults"></a>
## 9. Deterministic defaults

### 9.1 Core defaults

- Physical stores: separate Assistant memory redb + Tantivy + USearch files (per project)
- Capsule budget: `350` tokens
- Retrieval injection: max `5` gists/turn, summary-only, Verified-only
- Subagent access: disabled (always `NullMemoryProvider`)
- Auto-save unverified gists: enabled

Rule: These defaults MUST apply without user prompts unless explicitly overridden by a persisted config value.
ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary

### 9.2 Half-life defaults by `kind` (days)

| kind | default_half_life_days |
|------|-------------------------|
| `CurrentThread` | 14 |
| `Blocker` | 21 |
| `Constraint` | 180 |
| `Outcome` | 180 |
| `Handoff` | 60 |
| `Note` | 45 |
| `Decision` | 180 |
| `Preference` | 365 |
| `Landmine` | 365 |

Status decay rule:
- `status = Done` -> apply multiplier `0.5` to half-life for activation scoring

Rule: Any unset `half_life_days` value MUST resolve to the table default for that `kind`.
ContractRef: ConfigKey:assistant.memory.default_half_life_days, ConfigKey:assistant.memory.done_decay_multiplier

### 9.3 Verification defaults

- Default `verification_state` on newly created gists: `Unverified`
- Default injection eligibility: Verified-only
- Default pinned Unverified auto-injection: disabled (`assistant.memory.allow_pinned_unverified_injection = false`)
- Default auto-save behavior: store Unverified gists (`assistant.memory.auto_save_unverified = true`)
- Default manual-verify override: disabled (`assistant.memory.allow_manual_verify_without_evidence = false`)

Rule: Verified-only auto-injection MUST be the default behavior even when unverified auto-save is enabled.
ContractRef: ConfigKey:assistant.memory.auto_save_unverified, ConfigKey:assistant.memory.allow_pinned_unverified_injection, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract

### 9.4 Config keys

- `assistant.memory.enabled` (default `true`)
- `assistant.memory.capsule_budget_tokens` (default `350`)
- `assistant.memory.max_injected_items_per_turn` (default `5`)
- `assistant.memory.done_decay_multiplier` (default `0.5`)
- `assistant.memory.default_half_life_days.<kind>` (defaults per table above)
- `assistant.memory.retrieval.blend.bm25_weight` (default `0.5`)
- `assistant.memory.retrieval.blend.ann_weight` (default `0.5`)
- `assistant.memory.auto_save_unverified` (default `true`)
- `assistant.memory.allow_manual_verify_without_evidence` (default `false`)
- `assistant.memory.allow_pinned_unverified_injection` (default `false`)

Rule: Config resolution MUST be deterministic and project-scoped for memory behavior.
ContractRef: ContractName:Plans/Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout

---

<a id="10-acceptance-criteria"></a>
## 10. Acceptance criteria (testable)

1. **Assistant-only enforcement:** Assistant calls `RealMemoryProvider`; Orchestrator/Interviewer/requirements/subagents call `NullMemoryProvider`; no memory payload is observable in subagent prompts.
2. **Verified-only gating:** Capsule and per-turn retrieval inject only `verification_state = Verified` gists by default.
3. **Unverified save toggle effect:** With `assistant.memory.auto_save_unverified = false`, AutoRunBoundary produces no newly-persisted gists unless they satisfy a `Verified` rule at run end; with it enabled, Unverified gists can be persisted but are not auto-injected.
4. **Trigger correctness (no plan edits):** AutoRunBoundary runs once per Assistant run and AutoMilestone runs at most once per run; both operate from run artifacts/evidence refs without requiring any edits to Plans/SSOT documents.
5. **Trigger dedup:** Re-running AutoRunBoundary with identical candidate claim/evidence does not create duplicates (dedup by `embed_text_hash` + normalized EvidenceRefs).
6. **AutoMilestone idempotence:** AutoMilestone does not reprocess the same `(gist_id, evidence_ref)` more than once.
7. **GUI Verify enforcement:** Attempting to mark a gist Verified without satisfiable EvidenceRefs is rejected unless `assistant.memory.allow_manual_verify_without_evidence = true`.
8. **Storage layout:** For a project with memory enabled, the three Assistant-memory paths in §2 are created or loadable (`assistant_memory.redb`, `assistant_memory_index/`, `assistant_memory_vectors.usearch`); no SQLite file is introduced.
9. **Canonical data model:** Creating/editing/verifying/pinning/discarding a gist updates `assistant_memory.redb` and survives restart.
10. **Capsule cap enforcement:** Capsule assembly enforces the configured token cap and emits deterministic truncation behavior when over budget; GUI capsule preview shows token estimate and truncation indicator.
11. **Summary cache coherence:** Editing `claims[]` cannot cause stale cached `summary` text to be injected (cache invalidation required before injection).
12. **Decay behavior:** Done gists decay faster (`*0.5` half-life) and fall out of activation sooner than equivalent active gists.
13. **Project isolation:** Switching projects writes handoff to old project and loads capsule for new project without cross-project leakage.
14. **Index rebuild equivalence:** Full rebuild of Tantivy and USearch indexes from `assistant_memory.redb` yields retrieval results equivalent (within deterministic tie-break rules) to incremental updates under the same data.
15. **Rules separation:** Rules pipeline output remains unchanged when gists are added/edited; memory appears only in memory injection path.

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
