# Memory Subsystem (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Change Summary
- 2026-02-26: Revised canonical Assistant-only memory SSOT to use **Evidence-Backed Gists** (MemoryGist + EvidenceRef), deterministic verification, AutoRunBoundary/AutoMilestone triggers, Tantivy/USearch indexing contracts, and GUI Gist Review panel.

**Date:** 2026-02-26  
**Status:** Canonical plan/spec  
**Cross-references:** `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`, `Plans/agent-rules-context.md`, `Plans/rewrite-tie-in-memo.md`, `Plans/Decision_Policy.md`, `Plans/auto_decisions.jsonl`, `Plans/evidence.schema.json`

---

## 0. Scope and boundary

This document is the canonical SSOT for Memory in Puppet Master. DL-475 supersedes the earlier Assistant-only read prohibition; the Assistant remains writer/manager. The two visible levels are This project and Every project. This project binds the actual Project; Every project holds explicitly personal reusable notes for the same user. Availability selection is explicit; no relabeling, automatic promotion of private Project/app-thread content, or implied cross-Project sharing is allowed. Screen secrets and preserve source restrictions before broadening; if safe separation cannot be established, refuse the broader save. Private app-thread notes remain in their existing thread-only scope and never enter Every project by migration.
It defines the data model, verification gates, triggers, indexing, and GUI interactions for Assistant memory.
It does not replace or redefine system event storage (`seglog` SSOT), system KV/search projections (`redb` + Tantivy), or the shared rules pipeline.

Rule: Assistant memory MUST be implemented as a continuity subsystem for an explicitly bound Project or thread-private app working set (AMS-054) that is separate from rules assembly and operational child continuity. Authorized helper read access follows AMS-026; private app-thread working sets remain private.
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts

Rule: Assistant memory MUST run fully in-process and local-only; it MUST NOT require external servers and MUST NOT use SQLite.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/rewrite-tie-in-memo.md

---

<a id="1-capability-boundary"></a>
## 1. Capability boundary (Assistant-only)

Compatibility heading only: Assistant-only is the historical section/shard identifier, retained for frozen references. Current access is owner-managed writes and authorized read-only helpers under AMS-026; it is not an exclusive-reader rule.

### 1.1 Memory provider contract

Canonical interface names:
- `MemoryProvider` (trait/interface)
- `RealMemoryProvider` (Assistant-enabled implementation)
- `NullMemoryProvider` (returns empty results; no-op writes)

The scope-aware successor of the logical MemoryProvider contract takes an exact `memory_scope` rather than an implicit focused Project: a real Project, explicitly personal Every project notes for the same user, or private application scope with null Project and actual Computer/thread under AMS-054. Original Project callers/codecs remain compatibility inputs to that owner adapter.
- `build_capsule(memory_scope, now) -> WorkingSetCapsule`
- `search(memory_scope, query, now, k) -> Vec<MemoryGistHit>`
- `record_access(memory_scope, gist_id, now) -> Result`
- `upsert_gist(memory_scope, gist) -> Result`
- `delete_gist(memory_scope, gist_id, now) -> Result`
- `set_verification_state(memory_scope, gist_id, verification_state, now) -> Result`

Rule: Compile-time wiring MUST route Assistant prompt assembly to `RealMemoryProvider`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: The Assistant remains the writer and manager. Crews, reviews and the chat assistant's other helpers may read the current Project's notes and the user's personal notes at Every project, read-only, subject to current source, actor, phase and permission restrictions. This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/agent-rules-context.md

Rule: Authorized helper reads and their derivatives MUST retain source restrictions across prompts, tools, handoffs and metadata. Private app-thread and denied Project material MUST NOT be forwarded.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, PolicyRule:Decision_Policy.md§2

### 1.2 Pointer evidence boundary

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

Amended 2026-10-31 (DL-270): these are project-scoped stores, so each `.puppet-master/project/state/...` path above resolves to `<data root>/projects/<project_id>/state/...`, and the data root is fixed per OS by SP-015 (`.noindex` on macOS, Local AppData on Windows, the XDG data directory on Linux). The paths keep their written form in AMS-007 and resolve through that one rule.

Note: This document does not change the canonical system-storage default in `Plans/storage-plan.md` (app-global redb layout). The `system.redb` path above is the project-state reference path for memory-local packaging/project-scoped state mode.

Rule: Assistant memory MUST use separate physical stores from system state stores to avoid writer contention and coupling.
ContractRef: ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md§2

Rule: Shared crates/libraries MAY be reused across subsystems, but file-level physical separation MUST remain in place.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout

Rule: Memory bodies stay Project-scoped when bound to a Project and thread-private in the AMS-054 app working set. Switching place atomically selects the correct isolated view; conversion adopts destination memory only with explicit restricted gist/capsule carry-over and lineage. An app preferences row or read grant cannot select another thread's memory store.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#8-integration-points, ContractName:Plans/assistant-chat-design.md#11-threads-and-chat-management

---

<a id="3-data-model"></a>
## 3. Data model (Evidence-Backed Gists; GUI-first)

Canonical record: `MemoryGist`.

### 3.1 `MemoryGist` fields (required)

Required fields (conceptual contract):
- Identity/scope:
  - `id` (stable ID)
  - exact scope envelope: actual Project identity, explicit same-user personal Every project identity, or `project_id=null` with actual Computer/thread identity for private AMS-054 app memory; physical separation never substitutes for explicit access identity
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
  - `half_life_days` (kind-defaulted; internal behavior, no user editor)
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

Rule: Memory list/Add/Edit/Delete MUST read and write canonical `MemoryGist` records in `assistant_memory.redb`; no Verify/Pin/half-life controls remain. Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its suppression. Delete all in the list menu names and confirms the exact selected scope and target set, using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits precede asynchronous derived indexes.
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
- Amended 2026-10-31 (DL-270): the `gist_id -> vector_slot` mapping and ANN tombstone state are derived and rebuildable, so they live in a separate derived redb file next to `assistant_memory_vectors.usearch`, not in `assistant_memory.redb` (SP-340: canonical and derived families live in two redb files). The derived file can be deleted and rebuilt from canonical gists and is not backed up (BRS-031). `assistant_memory.redb` holds canonical gists only.

Deterministic embed text:
- `embed_text = kind + "\n" + join(tags) + "\n" + join(claims[].text)` (exclude `details`)
- `embed_text_hash = sha256_utf8(embed_text)` as lowercase hex SHA-256 over the exact UTF-8 bytes
- `text_hash = sha256_utf8(kind + "\n" + join(tags) + "\n" + join(claims[].text) + "\n" + summary + "\n" + details_or_empty)` as lowercase hex SHA-256 over the exact UTF-8 bytes

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
It evaluates useful reusable lessons from run artifacts; zero candidates is valid. Temporary task progress stays in Working Notebook and a finished reply is not itself a reason to save a note.

Rule: AutoRunBoundary MUST run at the end of each Assistant run and MUST create/update at most **one** `MemoryGist` per run with `source = AutoRunBoundary`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: AutoRunBoundary MUST deduplicate candidates across runs using `embed_text_hash` and normalized EvidenceRefs (no duplicate persisted gist for identical claim/evidence sets).
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#4-retrieval-indexes, PolicyRule:Decision_Policy.md§2

Rule: AutoRunBoundary MUST evaluate deterministic verification rules (§5.3) before persisting and MUST set `verification_state` to `Verified` when the rules are satisfied; otherwise it persists as `Unverified`.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

Rule: Useful candidate retention is built in; `assistant.memory.auto_save_unverified` is compatibility lineage, not a user setting. All automatic capture respects memory off and durable deletion suppression.
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

Rule: A gist MUST transition to `Verified` if and only if ALL of the following hold:
1) Explicit user preferences/statements are supported only as what that user said by the actual saved input/version under AMS-044, not as proof of an independent world fact. Other claims have per-claim support evaluated per AMS-044: each claim carries `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` covering what the supporting references actually establish, and a `currentness` value of `current` (see the Claim-Level Verification and Notebook Boundary Addendum, AMS-044/AMS-045).
2) Each supporting reference is resolvable and structurally valid: a `Commit { hash, repo_id }` EvidenceRef resolves in `repo_id`; a `TestRun`/`BuildRun` EvidenceRef has `exit_code == 0`; a `PlanRef` EvidenceRef resolves to an accepted Plan record.
3) The support is semantically scoped to the claim: a commit supports only claims about that commit's existence/content; a successful test or build supports only claims within the tested scope; a valid artifact hash supports only claims about that artifact. Reference existence alone is structural evidence, never semantic proof of the attached claim text; a claim whose support does not cover it remains `Unverified`.
4) No relevant validity context for the claims is stale: evidence invalidated or superseded per AMS-045 blocks the transition until revalidated.
Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05

> Superseded 2026-09-05 (claim-level verification, AMS-044/AMS-045): the earlier sufficient conditions — "Verified if ANY holds: (1) a `Commit { hash, repo_id }` EvidenceRef; (2) a successful `TestRun`/`BuildRun` (`exit_code == 0`) plus a `Diff` or `Artifact` EvidenceRef; (3) a `PlanRef` EvidenceRef with `kind` `Decision`/`Constraint`/`Preference`/`Landmine`" — are retained here as historical lineage only. They are no longer operative on their own: satisfying one of them establishes at most the structural-validity precondition (condition 2 above) and never the per-claim support, scope, or currentness conditions (1, 3, 4). Builders MUST implement this section as amended, not the retired existence-only rule.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05, PolicyRule:Decision_Policy.md§2

Rule: World facts need scoped resolvable EvidenceRefs; explicit user preferences/statements use their actual user input/version as support only for what the user said. No arbitrary fact becomes proven by being typed.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2

Rule: Legacy gists already labeled `Verified` under the retired existence-only rule are not blindly grandfathered: on their next verification evaluation — injection selection, evidence event, or explicit revalidation — they MUST be reassessed under the amended rule above; unsupported claims stop auto-injecting as current and surface as unverified with their support state, while original history and the state change remain explainable per AMS-045. A gist with `needs_revalidation` or `source_unavailable` support stops auto-injecting until reassessed. Its support state is internal; the Out of date user group is retired and never becomes a fourth verification_state.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05

Rule: Verification is internal. The manual Verify feature and allow_manual_verify_without_evidence bypass are retired, including old true values. Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests, commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal statements take a user-statement support path tied to the actual input and version: they establish what the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck automatically, preserving prior versions and evidence.
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

Inject the tiny **Working Set capsule** for the exact Project, or only the calling app thread under AMS-054:
- Budget default: `350` tokens
- Sections keep their fixed order: Project Capsule bullets (empty for an app thread), Current Thread paragraph, Recent decisions, Recent blockers. Empty Project bullets never source another Project or chat.
- Source: eligible gists selected by pins + activation scoring (eligibility defaults to `verification_state = Verified`)

Rule: Capsule assembly MUST enforce the configured hard token cap before sending any Assistant prompt.
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: Automatic use requires current scoped support. Explicit user statements are supported as such through AMS-014/044. No pinned or manual bypass permits unsupported auto-injection.
ContractRef: ConfigKey:assistant.memory.allow_pinned_unverified_injection, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 6.2 Per-turn retrieval injection (Verified-only)

Per user turn:
1. Execute lexical search (Tantivy) + semantic search (USearch)
2. Merge/rerank with activation scoring
3. Inject up to `N` gists (`N` default `5`)
4. Inject only derived `summary` text (1–2 sentences each)

Rule: Retrieval injection MUST NOT exceed max item count and MUST remain summary-only.
ContractRef: ConfigKey:assistant.memory.max_injected_items_per_turn, ContractName:Plans/assistant-memory-subsystem.md#3-data-model

Rule: Automatic use requires current scoped support. Explicit user statements are supported as such through AMS-014/044. No pinned or manual bypass permits unsupported auto-injection.
ContractRef: ConfigKey:assistant.memory.allow_pinned_unverified_injection, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, PolicyRule:Decision_Policy.md§2

### 6.3 Activation scoring (required components)

Activation scoring must include:
- `pinned` boost
- kind/status weighting
- recency decay (`half_life_days`)
- access signals (`access_count`, `last_access_at`)
- retrieval blend (BM25 + ANN scores)

Deterministic activation score:

`score = (0.50 * normalized_bm25 + 0.50 * normalized_ann + pinned_boost + kind_status_weight + access_weight) * recency_multiplier`

Defaults: `pinned_boost = 0.20` when pinned else `0`; `kind_status_weight = 0.10` for Verified active project gists, `0` for other eligible Verified gists; `access_weight = min(0.15, ln(1 + access_count) * 0.03)`; `recency_multiplier = 0.5 ^ (age_days / effective_half_life_days)`; `effective_half_life_days = half_life_days` unless overridden by the Done rule below. Missing BM25 or ANN scores normalize to `0`; ties sort by newer `updated_at`, then lexical `id`.

Rule: Done-status gists MUST decay faster using `effective_half_life_days = half_life_days * 0.5`.
ContractRef: ConfigKey:assistant.memory.done_decay_multiplier, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

---

<a id="7-gui-and-maintenance"></a>
## 7. GUI + maintenance operations

### 7.1 GUI: Memory

Memory is one page shared by Settings and the chat Memory button/wand, which opens that same page as a sheet. It contains one Remember things between chats switch, search, a level filter All / This project / Every project, a saved-note list, Add memory, Edit, Delete and a collapsed Archived group. Search includes archived notes. Each note shows its text, level and updated time; title is optional. A quiet total list count is allowed only on the page. No verification queue, confidence/source fields, ranking, pins, conflicts, memory preview, source controls, maintenance workbench or second Notes it took document appears. Instructions, History/privacy, chat capacity controls and Run limits stay in their owners outside Memory.

Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent glyphs, named-note hovers, verification/proof badges or Followed/Missed rule receipts. Only after a durable successful save may one brief Saved to memory · View line appear; View opens the same Memory page as a sheet with the saved note highlighted. A requested save/edit may receive one brief success confirmation. Failed or no-op saves earn no successful-save line; ordinary task evidence and links remain available.

Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its suppression. Delete all in the list menu names and confirms the exact selected scope and target set, using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits precede asynchronous derived indexes.

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-084, ContractName:Plans/assistant-memory-subsystem.md#AMS-141

### 7.2 Maintenance operations (deterministic)

Required operations:
1. Rebuild Tantivy index from `assistant_memory.redb`
2. Rebuild USearch index from `assistant_memory.redb` (re-embed + rebuild)
3. Verification sweep: re-evaluate verification_state for all gists
4. Dedup sweep: merge only eligible identical `embed_text_hash` gists. Keep the oldest by original creation time, breaking ties by the unchanging note ID. Preserve every evidence reference and the merge record. Archive the other eligible originals with identities, evidence references, versions and survivor links retained; history remains available and automatic deletion is forbidden (DL-444, DL-445). Pins stay excluded; skip a merge that pin protection forbids.
5. Monthly summarize/compress: consolidate older low-activation `Note` gists into a monthly `Note` gist (policy-driven; preserve EvidenceRefs)
6. Prune/archive: archive-only under DL-402/403/444–447; preserve originals/evidence and exclude pins. Delete is the user's action; all existing holds remain.
7. Store compaction (amended 2026-10-31, DL-270): follow SP-340's store compaction under the maintenance lease, only while PM is idle and fragmentation passes its threshold: the derived memory redb file is rebuilt, and `assistant_memory.redb` is compacted by copying its live records into a new file swapped in during a brief pause, then the reclaimed bytes are verified. Storage health shows usage, budget, reclaimable bytes and the last compaction (SP-340); the reclaim action is the existing `cmd.storage.compaction.request`, started from there.

Rule: All maintenance operations MUST run in-process and MUST NOT depend on external services.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/rewrite-tie-in-memo.md

Rule: Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses existing support owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive are archive-only, preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447 holds remain: approved answers alone do not enable jobs before their application and remaining definition/review/recording approvals. No immediate automatic maintenance is authorized.
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

Rule: DL-446 answers DL-403 for monthly summary (E-CARDS-2 Card 6.c, option A). Allow monthly summary to select Note memories idle for at least 90 days AND with usefulness score below 0.10. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Keep the existing monthly grouping. Create the monthly summary and archive every selected original, retaining all evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.

Rule: DL-447 answers DL-403 for prune/archive (E-CARDS-2 Card 6.d, option A). Allow prune/archive to select eligible memories of any kind idle for at least 180 days AND with usefulness score below 0.05. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Archive the selected originals only; retain their evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project.

Rule: Usefulness is section 6.3's computed ranking, not a percentage. Use its existing per-kind and Done decay and zero contribution for each missing BM25/ANN score. These approved cutoffs replace the missing-cutoffs condition only. Automatic jobs and Memory-panel buttons remain unavailable until all remaining definition, review and recording approvals pass; actual Project permission, admission, operation/result retention, single-writer/source fences and original-start custody still gate dispatch and effects. A missing authenticated policy binding still refuses `cutoffs_unavailable`; a caller Boolean or arbitrary policy cannot authorize a job.

Source: E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main. Jared's verbatim answer was "i approve all of it"; the deck's fast-reply rule maps that answer to option A.
ContractRef: ContractName:Plans/Decision_Log.md#DL-402, ContractName:Plans/Decision_Log.md#DL-403, ContractName:Plans/Decision_Log.md#DL-444, ContractName:Plans/Decision_Log.md#DL-445, ContractName:Plans/Decision_Log.md#DL-446, ContractName:Plans/Decision_Log.md#DL-447

---

<a id="8-integration-points"></a>
## 8. Integration points

Assistant memory is intentionally separate from child-run continuity, crew shared state, and context-shaping systems.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

### 8.1 Assistant prompt builder

Assistant uses the real memory subsystem as writer/manager. The Assistant remains the writer and manager. Crews, reviews and the chat assistant's other helpers may read the current Project's notes and the user's personal notes at Every project, read-only, subject to current source, actor, phase and permission restrictions. This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### 8.2 Child-run continuity

The Assistant remains the writer and manager. Crews, reviews and the chat assistant's other helpers may read the current Project's notes and the user's personal notes at Every project, read-only, subject to current source, actor, phase and permission restrictions. This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md

Child continuity comes from:
- canonical child records
- reconstructed handoff bundles
- current effective shaping state
- crew shared state when crew mode is active

It does not come from hidden child-local long-term memory.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/orchestrator-subagent-integration.md

### 8.3 Crew shared state

Crew shared state may persist longer than an individual child, but under the disposable-child default it remains explicit coordination state rather than personal memory for disposable subagents.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
## 9. Deterministic defaults

### 9.1 Core defaults

- Physical stores: separate Assistant memory redb + Tantivy + USearch files (per project)
- Capsule budget: `350` tokens
- Retrieval injection: max `5` gists/turn, summary-only, Verified-only
- Helpers: read-only current Project and personal Every project notes under AMS-026; denied/disabled reads use `NullMemoryProvider`, private app-thread memory stays private.
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

Rule: These original owner-key spellings are compatibility lineage. SSYS-040 governs retired-key reads; only memory.retention.enabled remains the live Memory switch. Built-in defaults replace tuning controls and retired bypasses are always false. Preferences never merge memory scopes.
Gemini CLI provider-native settings set `model.compressionThreshold` default to `0.5`; if PM exposes or stores a `90%` compression threshold for assistant memory behavior, that value is an intentional PM override rather than alignment with provider-native defaults.
ContractRef: ContractName:Plans/Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#2-physical-storage-layout

---

<a id="10-acceptance-criteria"></a>
## 10. Acceptance criteria (testable)

1. Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its suppression. Delete all in the list menu names and confirms the exact selected scope and target set, using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits precede asynchronous derived indexes.
2. Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests, commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal statements take a user-statement support path tied to the actual input and version: they establish what the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck automatically, preserving prior versions and evidence.
3. The Assistant remains the writer and manager. Crews, reviews and the chat assistant's other helpers may read the current Project's notes and the user's personal notes at Every project, read-only, subject to current source, actor, phase and permission restrictions. This grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
4. Fading reduces a note's influence; archiving retains an old note outside ordinary automatic use; deletion is the user's action. Keep kind half-life defaults and the Done multiplier 0.5 built in, without per-note/per-kind editors or pin controls. Preserve every existing pin protection internally during migration. Archived notes remain searchable and editable; an edit may make one current again only after internal checks. Never treat fade time as deletion permission.
5. Memory is one page shared by Settings and the chat Memory button/wand, which opens that same page as a sheet. It contains one Remember things between chats switch, search, a level filter All / This project / Every project, a saved-note list, Add memory, Edit, Delete and a collapsed Archived group. Search includes archived notes. Each note shows its text, level and updated time; title is optional. A quiet total list count is allowed only on the page. No verification queue, confidence/source fields, ranking, pins, conflicts, memory preview, source controls, maintenance workbench or second Notes it took document appears. Instructions, History/privacy, chat capacity controls and Run limits stay in their owners outside Memory.
6. Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent glyphs, named-note hovers, verification/proof badges or Followed/Missed rule receipts. Only after a durable successful save may one brief Saved to memory · View line appear; View opens the same Memory page as a sheet with the saved note highlighted. A requested save/edit may receive one brief success confirmation. Failed or no-op saves earn no successful-save line; ordinary task evidence and links remain available.
7. Maintenance remains local and in-process, behind the page. Rebuild/recheck recovery uses existing support owners; there is no user cleanup workbench. Monthly summarize/compress and prune/archive are archive-only, preserve originals and EvidenceRefs, and never archive or merge pinned notes. DL-403/444–447 holds remain: approved answers alone do not enable jobs before their application and remaining definition/review/recording approvals. No immediate automatic maintenance is authorized.
8. Existing local storage, bounded capsule, summary-only injection and rebuild equivalence remain; no stale cached text or deleted note can return after replay/rebuild/restore.

Rule: A change is complete only when all acceptance criteria above are met and verified by deterministic checks.
ContractRef: ContractName:Plans/Progression_Gates.md, ContractName:Plans/assistant-memory-subsystem.md#10-acceptance-criteria

---

## 11. Non-goals

- No helper writes, helper-owned memory, other-Project access or private app-thread exposure.
- No replacement of seglog/redb/Tantivy system storage contracts.
- No external vector DB service.
- No file-bank style requirement that memory must be markdown-file based.

Rule: Implementations MUST keep these non-goals intact.
ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/agent-rules-context.md

---
## 12. Runtime Owner Reference Map

Memory retains owner-controlled writes and authorized helper reads, and its design must stay aligned with runtime owner docs through explicit evidence_refs rather than hidden orchestration memory. The memory subsystem reference set includes `Plans/Models_System.md:58-80`, `Plans/Executor_Protocol.md:134-178`, `/Models_System.md:58-80`, `/Executor_Protocol.md:134-178`, `Plans/Crosswalk.md:88-94`, `Plans/storage-plan.md:294`, `Plans/Contracts_V0.md:649`, `Plans/Orchestrator_Page.md:12-13`, `Plans/WorktreeGitImprovement.md:62-66`, `Plans/WorktreeGitImprovement.md:78-80`, `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31`, `Plans/orchestrator-subagent-integration.md:28-41`, `/Orchestrator_Page.md:12-13`, `/WorktreeGitImprovement.md:62-66`, `/WorktreeGitImprovement.md:78-80`, `/GUI_Rebuild_Requirements_Checklist.md:31`, `/Crosswalk.md:88-94`, `/Contracts_V0.md:649`, `/orchestrator-subagent-integration.md:28-41`, `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/Models_System.md`, `Plans/Orchestrator_Page.md`, `Plans/Executor_Protocol.md`, `Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md`.

Runtime traceability also depends on `Plans/Tools.md:866-920`, `Plans/Tools.md:1262-1288`, `Plans/Contracts_V0.md:778-806`, `Plans/storage-plan.md:1330-1391`, `Plans/storage-plan.md:1548-1568`, `Plans/Orchestrator_Page.md:1-44`, `Plans/FinalGUISpec.md:2737-2739`, `Plans/human-in-the-loop.md:22-49`, `Plans/UI_Command_Catalog.md:29-90`, `Plans/Executor_Protocol.md:110-175`, `Plans/Orchestrator_Page.md:428-475`, `Plans/UI_Command_Catalog.md:617-622`, `Plans/assistant-chat-design.md:1784`, `Plans/Glossary.md:30-127`, `Plans/FinalGUISpec.md:2092`, `Plans/usage-feature.md:104-127`, `Plans/usage-feature.md:228-242`, `Plans/usage-feature.md:714-720`, `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, `Plans/human-in-the-loop.md`, `Plans/UI_Command_Catalog.md`, `Plans/GitHub_Integration.md`, and `Plans/assistant-chat-design.md`.

Blocked notice, route, and usage joins use the broader anchor set `Plans/storage-plan.md:1289-1300`, `Plans/GitHub_Integration.md:251-258`, `Plans/assistant-chat-design.md:2213-2240`, `Plans/usage-feature.md:233-245`, `Plans/usage-feature.md:346-389`, `Plans/Runtime_Artifacts_Panel.md:63-93`, `Plans/Project_Output_Artifacts.md:16-24`, `Plans/interview-subagent-integration.md:1686-1698`, `Plans/Tools.md:1131-1135`, `Plans/Contracts_V0.md:461-465`, `Plans/storage-plan.md:1322-1391`, `Plans/UI_Command_Catalog.md:29-95`, `Plans/Executor_Protocol.md:134-160`, `Plans/assistant-chat-design.md:808-818`, `Plans/Glossary.md:30-70`, `Plans/usage-feature.md:690-705`, `Plans/Runtime_Artifacts_Panel.md:61-93`, `Plans/Project_Output_Artifacts.md`, and `Plans/Runtime_Artifacts_Panel.md`.

Route/open and worktree-adjacent memory evidence uses `Plans/Contracts_V0.md:557-624`, `Plans/storage-plan.md:1650-1654`, `Plans/Orchestrator_Page.md:1-150`, `Plans/UI_Command_Catalog.md:214-223`, `Plans/assistant-chat-design.md:2218-2242`, `/Contracts_V0.md:557-624`, `/FinalGUISpec.md:2737-2739`, `Plans/Glossary.md:34-85`, `Plans/usage-feature.md:233-249`, `/FinalGUISpec.md:2092`, `Plans/Contracts_V0.md:50-58`, `Plans/Contracts_V0.md:800-806`, `Plans/storage-plan.md:323-337`, `Plans/storage-plan.md:941-954`, `Plans/storage-plan.md:1389-1396`, `Plans/Orchestrator_Page.md:209-230`, `Plans/Orchestrator_Page.md:270-270`, `Plans/GitHub_Integration.md:258-258`, `Plans/WorktreeGitImprovement.md:142-144`, `Plans/WorktreeGitImprovement.md:704-708`, `Plans/assistant-chat-design.md:814-818`, `Plans/assistant-chat-design.md:1784-1784`, `/Contracts_V0.md:50-58`, `/Contracts_V0.md:800-806`, `/Orchestrator_Page.md:209-230`, `Plans/Glossary.md:30-90`, `Plans/usage-feature.md:346-382`, and `Plans/Runtime_Artifacts_Panel.md:57-65`.

Memory injection and storage references must preserve `Plans/Tools.md:866-916`, `Plans/Tools.md:1262-1284`, `Plans/storage-plan.md:330-337`, `Plans/storage-plan.md:468-590`, `Plans/storage-plan.md:788-817`, `Plans/FinalGUISpec.md:1842-1845`, `Plans/FinalGUISpec.md:2924-2925`, `Plans/Orchestrator_Page.md:258-266`, `Plans/Orchestrator_Page.md:358-377`, `Plans/Glossary.md:30-67`, `Plans/Glossary.md:34-67`, `Plans/Glossary.md:102-126`, `Plans/usage-feature.md:234-239`, `Plans/usage-feature.md:715-717`, `/Contracts_V0.md:778-806`, `/Executor_Protocol.md:110-175`, `/UI_Command_Catalog.md:617-622`, `/storage-plan.md:330-337`, `/storage-plan.md:468-590`, `/usage-feature.md:104-127`, `Plans/usage-feature.md:714-717`, `Plans/Tools.md:1131-1135`, `Plans/storage-plan.md:324-337`, `Plans/storage-plan.md:541-590`, `Plans/storage-plan.md:1289-1391`, `Plans/UI_Command_Catalog.md:29-92`, `Plans/Orchestrator_Page.md:200-209`, `Plans/Project_Output_Artifacts.md:485-530`, `Plans/orchestrator-subagent-integration.md:374-391`, and `Plans/interview-subagent-integration.md`.

The export/open path and HITL reference set includes `Plans/Contracts_V0.md:55-60`, `Plans/Contracts_V0.md:800-807`, `Plans/storage-plan.md:1616-1625`, `Plans/FinalGUISpec.md:2092-2092`, `Plans/FinalGUISpec.md:2736-2739`, `Plans/Orchestrator_Page.md:171-171`, `Plans/Orchestrator_Page.md:209-209`, `Plans/Orchestrator_Page.md:230-230`, `Plans/UI_Command_Catalog.md:617-623`, `Plans/WorktreeGitImprovement.md:134-150`, `/Contracts_V0.md:55-60`, `/Contracts_V0.md:800-807`, `/FinalGUISpec.md:2092-2092`, `Plans/storage-plan.md:325`, `Plans/storage-plan.md:894-897`, `Plans/human-in-the-loop.md:96`, `Plans/storage-plan.md:1335-1383`, `Plans/human-in-the-loop.md:29-33`, `Plans/Orchestrator_Page.md:16-43`, `Plans/UI_Command_Catalog.md:67-91`, `Plans/Executor_Protocol.md:110-130`, `Plans/Orchestrator_Page.md:451-474`, `Plans/UI_Command_Catalog.md:224-246`, `Plans/orchestrator-subagent-integration.md:209-235`, `Plans/orchestrator-subagent-integration.md:380-402`, `Plans/Contracts_V0.md:684-692`, `Plans/Contracts_V0.md:1218-1229`, `Plans/Executor_Protocol.md:548-557`, `Plans/Orchestrator_Page.md:439-446`, `/Contracts_V0.md:684-692`, `/Contracts_V0.md:1218-1229`, `/Executor_Protocol.md:548-557`, `/Orchestrator_Page.md:439-446`, `/Tools.md:866-920`, `/assistant-chat-design.md:2213-2240`, `/usage-feature.md:233-245`, and `Plans/Tools.md`.

Assistant memory must also preserve post-reconciliation anchors `Plans/FinalGUISpec.md:2924-2928`, `Plans/Orchestrator_Page.md:437-437`, `Plans/assistant-chat-design.md:2233-2240`, `/FinalGUISpec.md:2924-2928`, `/Orchestrator_Page.md:171-171`, `/Orchestrator_Page.md:209-209`, `/Orchestrator_Page.md:230-230`, `/Orchestrator_Page.md:270-270`, `Plans/Glossary.md:30-85`, `Plans/usage-feature.md:694-701`, `Plans/FinalGUISpec.md:728-735`, `/FinalGUISpec.md:728-735`, `/human-in-the-loop.md:22-49`, `Plans/storage-plan.md:322-337`, `Plans/storage-plan.md:941-956`, `/storage-plan.md:322-337`, `/storage-plan.md:941-956`, `/orchestrator-subagent-integration.md:374-391`, `/usage-feature.md:346-389`, `/interview-subagent-integration.md:1686-1698`, `Plans/assistant-chat-design.md:1112-1120`, `/assistant-chat-design.md:1112-1120`, `Plans/Project_Output_Artifacts.md:1-24`, `/Project_Output_Artifacts.md:1-24`, `/Runtime_Artifacts_Panel.md:63-93`, `/interview-subagent-integration.md:1686-1698`, `Plans/orchestrator-subagent-integration.md:379-391`, `/orchestrator-subagent-integration.md:379-391`, `Plans/interview-subagent-integration.md:1692-1698`, `/interview-subagent-integration.md:1692-1698`, `Plans/agent-rules-context.md`, `Plans/LSPSupport.md`, `/LSPSupport.md`, and `/agent-rules-context.md`.

Plan-local obligations in memory are narrow: `plan-local` `/event/command` items belong in canonical state/event/command owners before memory consumes them. `assistant-memory-subsystem`, `assistant-memory-subsystem.md`, `system-prompt`, `newfeatures.md`, and `NullMemoryProvider` remain historical boundary vocabulary; current authorized reads and denied paths are owned by AMS-026. Remaining Gemini-only docs are not low-value leftovers; many still hide active owner gaps in `/checklists/policies` and subsystem plans.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/assistant-memory-subsystem.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

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

## Migration Coverage

Original hash: `61465efe03b13f2ab959ffcf85b46ea4766377211f1f45ea6e501f6ef3ecaeda`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `assistant-memory-subsystem-S0001` through `assistant-memory-subsystem-S0040` are preserved in place and mapped in `coverage_map.jsonl` to `AMS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

Phase 2B atomization run `pds-20260611-002-atomize-planunits` mapped the first bounded window, `assistant-memory-subsystem-S0001` through `assistant-memory-subsystem-S0029` (source lines 1-396), to fine-grained PlanUnits `AMS-002` through `AMS-024`.

The second bounded window, `assistant-memory-subsystem-S0030` through `assistant-memory-subsystem-S0044` (source lines 397-704), is mapped to fine-grained PlanUnits `AMS-025` through `AMS-041`; `assistant-memory-subsystem-S0044` is a structural Migration Coverage section covered as section-only. `AMS-001` is retired in place as a migration-lineage bridge in Phase 2B batch 012 and no longer counts as source-preserving implementation coverage. Assistant Memory's next safe cursor leaves this document and moves to `BinaryLocator_Spec-S0001` at source line 1.

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### AMS-042 - P1-MEMORY-TIERING-CONTRACT

```yaml
plan_unit_id: AMS-042
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: MemoryTierContract retains writer authority, scope, retention/compaction policy, retrieval
  budget, causality/supersession, stale/retired status and failure semantics across transcript/history,
  operational Goal state, project/spec ledger, assistant preference memory, tool/artifact and ephemeral
  working context. The two visible levels are This project and Every project. This project binds the actual
  Project; Every project holds explicitly personal reusable notes for the same user. Availability selection
  is explicit; no relabeling, automatic promotion of private Project/app-thread content, or implied cross-Project
  sharing is allowed. Screen secrets and preserve source restrictions before broadening; if safe separation
  cannot be established, refuse the broader save. Private app-thread notes remain in their existing thread-only
  scope and never enter Every project by migration. Goal/Plan/Crew/schedule/ledger/notebook data never
  silently consolidates into personal memory.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A giant chat/session thread opens through mandatory load-older paging from the derived render-page store (SP-338, ACD-242), never by replaying its events; the first page of a 100k-event thread arrives within 150 ms at p95, warm or cold, reading at most 2 MiB. Conversation compaction alone does not satisfy this.
- Memory search timeout returns degraded result, not hung turn.
- Project ledger facts are not injected as personal memory.
- Superseded/stale memory cannot silently override current Plan canon.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A giant chat/session thread opens through mandatory load-older paging from the derived render-page store (SP-338, ACD-242), never by replaying its events; the first page of a 100k-event thread arrives within 150 ms at p95, warm or cold, reading at most 2 MiB. Conversation compaction alone does not satisfy this.
- Memory search timeout returns degraded result, not hung turn.
- Project ledger facts are not injected as personal memory.
- Superseded/stale memory cannot silently override current Plan canon.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p1_memory_tiering_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0070
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0070
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0066/P1-MEMORY-TIERING-CONTRACT@line=66
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0066/P1-MEMORY-TIERING-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:12
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N16/N24/N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
source_atom_ids:
- atom-0070
external_atom_id: extrepo-20260703-0066
source_row_id: P1-MEMORY-TIERING-CONTRACT
priority: P1
finding_family: Agent memory, goal memory, project memory, conversation history
source_repos:
- Agent Zero
- Pi
- Codex
- Cline
target_docs:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
owner_hints:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
preserved_exact_tokens:
- extrepo-20260703-0066
- P1-MEMORY-TIERING-CONTRACT
- P1
- Agent memory, goal memory, project memory, conversation history
- Agent Zero
- Pi
- Codex
- Cline
negative_constraints: []
observed_signal: Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.
pm_current_coverage: assistant-memory-subsystem is strong on assistant-only memory, scopes, gists, prompt injection, retrieval, scoring, and maintenance. PM bootstrap ledgers also capture durable design memory.
pm_gap_or_delta: 'PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set.'
proposal_or_recommendation: 'Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics.'
compile_disposition: create_new_planunit
```

### AMS-043 - P1-MEMORY-STORE-CRUD-VERSION-CITATIONS

```yaml
plan_unit_id: AMS-043
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Memory CRUD and versioning retain provenance, redaction, durable failure reporting and
  history internally. Add writes a new MemoryGist from plain text with inferred kind and optional title
  at an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior
  evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after one
  confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions from
  all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger replay,
  reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit user
  save can deliberately replace its suppression. Delete all in the list menu names and confirms the exact
  selected scope and target set, using the same deletion owner. Failed writes never report success. Canonical
  assistant_memory.redb commits precede asynchronous derived indexes. Ordinary replies show no memory-use
  citations, chips, counts, previews, ribbons, permanent glyphs, named-note hovers, verification/proof
  badges or Followed/Missed rule receipts. Only after a durable successful save may one brief Saved to
  memory · View line appear; View opens the same Memory page as a sheet with the saved note highlighted.
  A requested save/edit may receive one brief success confirmation. Failed or no-op saves earn no successful-save
  line; ordinary task evidence and links remain available. The external finding extrepo-20260703-0083
  / P1-MEMORY-STORE-CRUD-VERSION-CITATIONS (P1) is source lineage; its citation-surfacing recommendation
  is retired, not a mandate for reply memory citations.'
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 'Memory CRUD and versioning retain provenance, redaction, durable failure reporting and history internally.
  Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed
  level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete
  is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable
  scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths,
  and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge
  cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its
  suppression. Delete all in the list menu names and confirms the exact selected scope and target set,
  using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits
  precede asynchronous derived indexes. Ordinary replies show no memory-use citations, chips, counts,
  previews, ribbons, permanent glyphs, named-note hovers, verification/proof badges or Followed/Missed
  rule receipts. Only after a durable successful save may one brief Saved to memory · View line appear;
  View opens the same Memory page as a sheet with the saved note highlighted. A requested save/edit may
  receive one brief success confirmation. Failed or no-op saves earn no successful-save line; ordinary
  task evidence and links remain available. The external finding extrepo-20260703-0083 / P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
  (P1) is source lineage; its citation-surfacing recommendation is retired, not a mandate for reply memory
  citations.'
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-new-contracts-verify.py"
  - "Users can view/add/edit/delete notes and inspect Archived on the one Memory page at the two allowed levels; store/history/provenance/rollback machinery remains internal."
  - "Only a durable successful save may add Saved to memory · View to a reply; View opens the one Memory page as a sheet. No memory-use citation, receipt, tick, chip, count, source detail, verification or Followed/Missed decoration is shown."
  - "Internal consolidation failures remain typed and never silently drop required data."
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: p1_memory_store_crud_version_citations
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0087
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0087
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0083/P1-MEMORY-STORE-CRUD-VERSION-CITATIONS@line=83
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0083/P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:10
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
source_atom_ids:
- atom-0087
external_atom_id: extrepo-20260703-0083
source_row_id: P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
priority: P1
finding_family: Agent memory store management, version history, and citation surfacing
target_docs:
- assistant-memory-subsystem.md
- Goal_Runtime_System.md
- FinalGUISpec.md
- storage-plan.md
- Contracts_V0.md
owner_hints:
- assistant-memory-subsystem.md
- Goal_Runtime_System.md
- FinalGUISpec.md
- storage-plan.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0083
- P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
- P1
- Agent memory store management, version history, and citation surfacing
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
observed_signal: Warp Oz updates add memory store management commands and memory citations. | Codex changelog moved memory state to a dedicated SQLite DB and gated dedicated memory tools in config. | Agent Zero shows memory/history bloat and silent memory consolidation failure risks.
pm_gap_or_delta: MemoryTierContract covered layers and budgets, but not enough about memory CRUD/versioning/citations as user-visible objects.
relationship_to_prior_reports: Extends memory budget/governance into user-visible store operations.
compile_disposition: create_new_planunit
```

## Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. This addendum amends §5.3 (amended in place on 2026-09-05; the retired existence-only sufficient conditions there are historical lineage only). A resolvable evidence reference is structural evidence, not universal semantic proof of the attached claim text. Verification therefore records per-claim support: each `claim` gains `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` (what the references actually cover) and a `currentness` value (`current | needs_revalidation | source_unavailable`). A `Commit { hash, repo_id }` EvidenceRef supports only claims about that commit's existence/content; a successful `TestRun`/`BuildRun` supports only claims within the tested scope; a valid `Artifact` hash supports only claims about that artifact. A commit existing, an unrelated green test, or a valid artifact hash alone cannot verify a broader attached claim; unsupported semantic text stays `Unverified`, and claims without adequate support surface as unverified with their support state rather than being silently treated as proven. Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.

Correction and invalidation: when a claim, its evidence, or its relevant validity context changes (source mutated, revoked, pruned, or staleness re-detected), derived summary/index eligibility is recomputed and stale auto-injection stops; the original history is preserved and the revalidation status is explainable. Migrated or legacy gists marked Verified under the weaker rules are reassessed against the per-claim semantics on their next verification evaluation: unsupported ones stop auto-injecting, keep their original evidence/history, and move to a truthful state — an old Verified label is not blindly grandfathered. Notebook interaction boundaries are unchanged and reinforced: promotion from Working Notebook content runs only through the existing AutoRunBoundary/AutoMilestone trigger contracts and evidence gates (Working Notebook capture never bypasses them, and details never become default memory injection because they were once notes); notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly; and source restrictions hold across notebook sharing, summaries, tool outputs, checkpoints and handoffs. DL-475/AMS-026 permits read-only Project and personal note access for helpers, while private app-thread and denied material stay unavailable through all derivative paths.

```yaml
plan_unit_id: AMS-044
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence. Reference structural checks do not claim deterministic
  natural-language entailment. Support state stays internal, without a user verification view.'
gui_related: false
gui_classification_reason: Memory verification semantics are runtime behavior, not GUI work.
depends_on: [AMS-001]
unblocks: [AMS-045, AMS-046]
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: false_verification
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-M02
- source_packet:PM-WNC-2026-09-05-v1:WNC-A50
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["evidence_support", "support_scope", "currentness", "Unverified", "not universal semantic proof"]
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md

DL-475: claim currentness is internal; the Out of date display group is retired.

```yaml
plan_unit_id: AMS-045
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence. Legacy Verified labels are not blindly grandfathered.
  Original evidence, audit history and internal revalidation status remain; needs_revalidation/source_unavailable
  blocks automatic use without Out of date display groups or reply notices.'
gui_related: false
gui_classification_reason: Invalidation semantics are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: [AMS-046]
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_injection
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/storage-plan.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-M03
- source_packet:PM-WNC-2026-09-05-v1:WNC-A51
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["not blindly grandfathered", "revalidation status", "audit history"]
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

DL-475: stale support blocks automatic use internally, without an Out of date user group.

```yaml
plan_unit_id: AMS-046
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The Assistant remains the writer and manager. Crews, reviews and the chat assistant's
  other helpers may read the current Project's notes and the user's personal notes at Every project, read-only,
  subject to current source, actor, phase and permission restrictions. This grants no other Project access,
  helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled
  path; read-only access cannot call upsert, delete or verification mutations. Summaries, notebooks, handoffs,
  tool outputs and caches inherit all restrictions; paraphrase cannot launder private or denied content.
  Promotion from Working Notebook still uses useful-content/evidence gates and deduplicated, separately
  attributed bounded assembly. Notebook absence grants nothing.
gui_related: false
gui_classification_reason: Memory boundaries are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: []
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: memory_laundering
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-M01
- source_packet:PM-WNC-2026-09-05-v1:WNC-M04
- source_packet:PM-WNC-2026-09-05-v1:WNC-A08
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N16/N25/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["NullMemoryProvider", "Assistant-only", "evidence gates", "separately attributed"]
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/orchestrator-subagent-integration.md

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §8.10, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) redraws the Memory surface and its traces in chat. This addendum states what that presentation may and may not mean for this subsystem. AMS-047 and AMS-048 change no verification rule, no injection rule and no command. AMS-049..052 compile the owner's card answers of 2026-09-27: the panel's display name (DL-134), the locked-rule proposal line and memory export (DL-130), and the record of which taught rules a reply included (DL-116); AMS-053 compiles what counts as following a taught rule from the design lead's ruling on DL-116's follow-up. Chat transcript families and the accent rule belong to the Chat WOW addendum in `Plans/assistant-chat-design.md` (ACD-469..475) and are referenced, not restated.

### AMS-047 - Memory Preview, Out Of Date Display Group, And In-Chat Traces

```yaml
plan_unit_id: AMS-047
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent
  glyphs, named-note hovers, verification/proof badges or Followed/Missed rule receipts. Only after a
  durable successful save may one brief Saved to memory · View line appear; View opens the same Memory
  page as a sheet with the saved note highlighted. A requested save/edit may receive one brief success
  confirmation. Failed or no-op saves earn no successful-save line; ordinary task evidence and links remain
  available. Internal currentness remains current / needs_revalidation / source_unavailable; verification_state
  remains exactly Unverified, Verified or Discarded. Out of date, state faces and verification groups
  are retired UI only, never a fourth stored state. Memory is not rules and the 350-token ceiling stays
  internal.
gui_related: true
gui_classification_reason: >-
  Defines the saved-note page and the sole successful-save acknowledgment; no preview, state-face,
  verification group or in-chat use mark is exposed.
depends_on:
- AMS-014
- AMS-018
- AMS-021
- AMS-044
- AMS-045
unblocks: []
acceptance_criteria:
- Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent glyphs, named-note
  hovers, verification/proof badges or Followed/Missed rule receipts. Only after a durable successful
  save may one brief Saved to memory · View line appear; View opens the same Memory page as a sheet with
  the saved note highlighted. A requested save/edit may receive one brief success confirmation. Failed
  or no-op saves earn no successful-save line; ordinary task evidence and links remain available. Internal
  currentness remains current / needs_revalidation / source_unavailable; verification_state remains exactly
  Unverified, Verified or Discarded. Out of date, state faces and verification groups are retired UI only,
  never a fourth stored state. Memory is not rules and the 350-token ceiling stays internal.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base
  origin/main
risk_class: memory_state_presentation_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: memory_contract_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (part),
  B-AMS-03, B-AMS-04, B-AMS-05 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens:
- See what your next message will include
- What's in capsule now
- assistant.memory.capsule_budget_tokens
- Memory is not rules
- Out of date
- verification_state
- needs_revalidation
- source_unavailable
- Noted
- 3 s
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints:
- Plans/assistant-memory-subsystem.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#71-gui-gist-review-panel, ConfigKey:assistant.memory.capsule_budget_tokens, UICommand:cmd.chat.memory.preview_capsule, ContractName:Plans/assistant-chat-design.md

### AMS-048 - Gist Edit And Half-Life Link

```yaml
plan_unit_id: AMS-048
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: cmd.chat.memory.edit is the Memory page's Edit producer, with versioned plain-text edits
  and automatic inference/support checks. Prior versions and evidence remain; changed claims become Unverified
  until internal reevaluation, with explicit user statements supported only as such. No per-gist half-life
  override or memory.retention.half-life-by-kind editor remains; legacy pin protections survive. Native
  wiring still needs real evidence under CDRY-012.
gui_related: true
gui_classification_reason: Defines the plain-text Memory Edit action.
depends_on: [AMS-010, AMS-014, AMS-021]
unblocks: []
acceptance_criteria:
- cmd.chat.memory.edit is the Memory page's Edit producer, with versioned plain-text edits and automatic
  inference/support checks. Prior versions and evidence remain; changed claims become Unverified until
  internal reevaluation, with explicit user statements supported only as such. No per-gist half-life override
  or memory.retention.half-life-by-kind editor remains; legacy pin protections survive. Native wiring
  still needs real evidence under CDRY-012.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_edit_bypasses_verification
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 amendment
  G-30 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (part)
  (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["cmd.chat.memory.edit", "Unverified", "memory.retention.half-life-by-kind", "cmd.settings.open", "CDRY-012"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: UICommand:cmd.chat.memory.edit, UICommand:cmd.settings.open, ContractName:Plans/UI_Wiring_Rules.md

### AMS-049 - Gist Review Display Name

```yaml
plan_unit_id: AMS-049
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The user-facing page and chat sheet are named Memory. Gist Review and Notes it took remain
  historical route/record identifiers only, not another editor or verification workflow. Existing records
  and verification_state values remain readable without exposing their internal groups. This supersedes
  the DL-134 display prescription.
gui_related: true
gui_classification_reason: The panel's visible title is user-facing copy.
depends_on: [AMS-021, AMS-047]
unblocks: []
acceptance_criteria:
- The user-facing page and chat sheet are named Memory. Gist Review and Notes it took remain historical
  route/record identifiers only, not another editor or verification workflow. Existing records and verification_state
  values remain readable without exposing their internal groups. This supersedes the DL-134 display prescription.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_display_name_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (WAIT
  part, card p19 E-38) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-134
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Notes it took", "Gist Review", "DL-134", "verification_state"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-134, ContractName:Plans/assistant-memory-subsystem.md#71-gui-gist-review-panel

### AMS-050 - Locked-Rule Change Proposal

```yaml
plan_unit_id: AMS-050
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Memory never changes or unlocks a retained protected taught rule. Automatic rule-change notices,
  Review links, Keep my rule / Edit my rule decision panels and memory-generated rule proposals are
  retired. A necessary rule change is an ordinary task decision; requested edits use the
  written-instruction owner at Settings > Personas & Crews > Defaults > Standing instructions.
  Legacy cmd.chat.teach.set_lock and locked-record codecs remain internal compatibility/protection
  only, without an ordinary lock/unlock or rollback control. Internal upkeep cannot weaken retained
  protections.
gui_related: true
gui_classification_reason: >-
  Retires the ordinary locked-rule proposal and lock/unlock surfaces while preserving internal
  protections.
depends_on: [AMS-047, AMS-021]
unblocks: []
acceptance_criteria:
  - "Requested written-rule edits use their existing instruction writer; Memory never edits those rules or offers lock/unlock, conflict, source or rollback controls."
  - "Retained protected records keep their internal safeguards; maintenance and summarization never weaken them."
  - "Only a durable successful save may add Saved to memory · View to a reply; View opens the one Memory page as a sheet. No memory-use citation, receipt, tick, chip, count, source detail, verification or Followed/Missed decoration is shown."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: locked_rule_changed_without_user
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-05 (WAIT
  part, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-130
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens: ["It won't change unless you say so.", "Keep my rule", "Edit my rule…", "cmd.chat.teach.open_memory", "cmd.chat.memory.discard", "cmd.chat.teach.set_lock", "DL-130"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: UICommand:cmd.chat.teach.open_memory, UICommand:cmd.chat.memory.discard, UICommand:cmd.chat.teach.capture, UICommand:cmd.chat.teach.set_lock, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-051 - Taught Rules Included In A Reply

```yaml
plan_unit_id: AMS-051
unit_type: schema_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: included_teaching_ids records each rule/version actually included in a reply's context,
  independently of whether it was obeyed. Keep internal records; inclusion proves no compliance. Retire
  ordinary Followed/Missed/Used reply receipts and named-rule hovers; Instructions remains directly inspectable.
gui_related: true
gui_classification_reason: >-
  Internal inclusion records are retained without reply rule/verification receipts; written
  instructions remain directly editable.
depends_on: [AMS-018, AMS-025]
unblocks: [AMS-053]
acceptance_criteria:
- included_teaching_ids records each rule/version actually included in a reply's context, independently
  of whether it was obeyed. Keep internal records; inclusion proves no compliance. Retire ordinary Followed/Missed/Used
  reply receipts and named-rule hovers; Instructions remains directly inspectable.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
  - python3 scripts/pm-new-contracts-verify.py
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/Prompt_Pipeline.md, Plans/assistant_memory_contracts.schema.json]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card
  n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-116
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens: ["included_teaching_ids", "Followed", "Used", "DL-116"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-052 - Export Memory

```yaml
plan_unit_id: AMS-052
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Keep cmd.chat.memory.export with existing scope gists | teachings | all, artifact owner
  and ArtifactExportResult, reachable through general data export and the Instructions owner, not an Export
  workbench on Memory. Exports use the authorized explicit Project, personal or calling private app-thread
  view only, never other private chats or an all-Project enumeration. Preserve stored verification_state
  and pointer-only EvidenceRef entries; exporting neither upgrades support nor changes/pins/discards memories.
  Existing availability/handler/permission gates remain; broader unavailable codecs need explicit adoption
  before use.
gui_related: true
gui_classification_reason: Export is a user-visible action on the Memory surface and the taught-rules document.
depends_on: [AMS-006, AMS-010, AMS-021]
unblocks: []
acceptance_criteria:
- Keep cmd.chat.memory.export with existing scope gists | teachings | all, artifact owner and ArtifactExportResult,
  reachable through general data export and the Instructions owner, not an Export workbench on Memory.
  Exports use the authorized explicit Project, personal or calling private app-thread view only, never
  other private chats or an all-Project enumeration. Preserve stored verification_state and pointer-only
  EvidenceRef entries; exporting neither upgrades support nor changes/pins/discards memories. Existing
  availability/handler/permission gates remain; broader unavailable codecs need explicit adoption before
  use.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
  - python3 scripts/pm-new-contracts-verify.py
risk_class: memory_export_mutates_or_leaks
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/assistant_memory_contracts.schema.json]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (WAIT
  part N-7, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-130
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16/N24
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Export memory", "cmd.chat.memory.export", "gists | teachings | all", "ArtifactExportResult", "verification_state", "DL-130"]
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
```

ContractRef: UICommand:cmd.chat.memory.export, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-053 - What Counts As Following A Taught Rule

```yaml
plan_unit_id: AMS-053
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Keep included_teaching_ids and saved rule_check_outcomes (passed / failed / could_not_run)
  internally at the included version. Run checks only after a finished reply; inclusion alone proves nothing,
  could_not_run never becomes success and reopening reads saved results. Remove the ordinary Followed
  and Missed reply lines, counts, rule hovers and taught_rule_check fix-link producer from replies. A
  meaningful rule failure is handled as a task failure through normal task interaction; no automatic resend,
  rewrite or fix starts.
gui_related: true
gui_classification_reason: Retires ordinary rule-check reply receipts while retaining internal records.
depends_on: [AMS-051, AMS-018]
unblocks: []
acceptance_criteria:
- Keep included_teaching_ids and saved rule_check_outcomes (passed / failed / could_not_run) internally
  at the included version. Run checks only after a finished reply; inclusion alone proves nothing, could_not_run
  never becomes success and reopening reads saved results. Remove the ordinary Followed and Missed reply
  lines, counts, rule hovers and taught_rule_check fix-link producer from replies. A meaningful rule failure
  is handled as a task failure through normal task interaction; no automatic resend, rewrite or fix starts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/FinalGUISpec.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c;
  DL-138, questions 18-19)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card
  n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json (SHA-256 4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f)
- Design lead ruling of 2026-09-27 on the DL-116 follow-up (the definition of following), recorded in
  Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-116
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Followed", "Missed 1 of your rules", "included_teaching_ids", "rule_check_outcomes", "could_not_run", "Missed 1 of your rules · followed 2", "cmd.review.send_findings_to_agent", "source_kind", "taught_rule_check", "reply_message_id", "missed_teaching_refs", "Used", "DL-116"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-054 - Thread-Private App Memory And Explicit Carry-Over

```yaml
plan_unit_id: AMS-054
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Private no-project app working sets remain thread-only: project_id=null with actual Computer/thread
  and explicit storage identity, SP-349 keys and original application codecs. The two visible levels are
  This project and Every project. This project binds the actual Project; Every project holds explicitly
  personal reusable notes for the same user. Availability selection is explicit; no relabeling, automatic
  promotion of private Project/app-thread content, or implied cross-Project sharing is allowed. Screen
  secrets and preserve source restrictions before broadening; if safe separation cannot be established,
  refuse the broader save. Private app-thread notes remain in their existing thread-only scope and never
  enter Every project by migration. The Assistant remains the writer and manager. Crews, reviews and the
  chat assistant''s other helpers may read the current Project''s notes and the user''s personal notes
  at Every project, read-only, subject to current source, actor, phase and permission restrictions. This
  grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
  Personal availability is an explicit logical user partition in the existing local memory architecture,
  not a new database/service or per-helper store; it does not imply device sync. Existing private records
  never migrate to that partition automatically. Conversion adopts destination memory only through source-restricted
  owner-checked carry-over with lineage; no relabeling or copied capsule grants authority. Existing original
  codecs remain readable and native source/currentness/retention/backup proofs remain prerequisites.'
gui_related: false
gui_classification_reason: Defines runtime scope, data identity and custody without owning visual presentation.
depends_on:
- AMS-003
- AMS-033
- AMS-042
- AMS-046
- AMS-052
- WN-021
- CV-366
- SP-349
unblocks: []
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16/N24/N25/N26
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#5;7.12
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-B01
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens:
- project_id=null
- MemoryProvider
- NullMemoryProvider
- public_safe
- 350-token
- cmd.chat.memory.export
- gists
- teachings
- all
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints:
- Plans/assistant-memory-subsystem.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#AMS-054, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365


## Command payload definitions (DL-333, 2026-11-05)

### AMS-141 - Assistant Memory Command Payload Definitions

```yaml
plan_unit_id: AMS-141
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Typed payload definitions (DL-333) for the twelve cmd.chat.memory.* commands that
  UI_Command_Catalog UCC-084 and UCC-085 register and UCC-230 routes to this doc: the Gist Review
  actions verify, edit, pin, discard, toggle_auto_save_unverified and preview_capsule, and the
  maintenance commands rebuild_lexical_index, rebuild_semantic_index, verification_sweep,
  dedup_sweep, summarize_monthly and prune_archive. The definitions block below gives each command
  its args, owner request and owner result in pm.command_payload_definitions.v1, with error and
  disabled-reason codes narrowed from the overlay's closed sets. DL-402 binds monthly summary and
  prune archive to archive-only: a memory is deleted only when the user deletes it, originals keep
  their evidence references, and neither job archives or merges a pinned memory. DL-403 holds both
  commands unavailable to internal/support execution until approved cutoffs exist; no Memory-panel
  control is exposed; DL-446 and DL-447 record the returned cutoffs and keep runs waiting for their
  application and the remaining definition, review and recording approvals; the definitions record
  that hold as owner state maintenance_cutoffs_pending, which UCC-230 maps to not_configured
  (DL-341). DL-444 and DL-445 keep dedup_sweep unavailable the same way until their answer is
  applied and the remaining approvals pass, recorded as owner state dedup_hold_pending, also mapped
  to not_configured; each of the three definitions ties its owner state to that code in
  owner_state_codes. The wired owner request ChatOwnerCommandRequestV2 requires a thread_id that the
  Project-scoped catalog rows do not carry, and the rows require a project_id that AMS-054 app
  memory leaves null; each definition records both disagreements in its judgments for the chat and
  memory owners, and chooses no thread_id value. prune_archive's policy can never change DL-447's
  cutoffs, pin exclusion or DL-402's archive-only rule. gist_id is the canon name UCC-230's
  identity_aliases records for the overlay identity memory_item_id, and every judgment is in its
  definition's judgments list (DL-341). DL-475 adds cmd.chat.memory.add and cmd.chat.memory.delete
  and replaces Edit args with explicit memory_scope, plain text, optional title, gist_id and
  expected_revision. The new
  MemoryNoteAddRequestV1/MemoryNoteEditRequestV1/MemoryNoteDeleteRequestV1 and
  MemoryNoteMutationResultV1 in assistant_memory_contracts.schema.json are the concrete owner
  contracts. The owner authenticates the memory scope and source constraints, checks current
  revision before Edit/Delete, infers kind, commits canonical records/tombstones before indexes, and
  returns a durable receipt before acknowledgment. Delete is not Discard; suppression prevents old
  transcripts/replay/rebuild/restore/import from silently resaving the deleted content. Bulk
  deletion freezes the confirmed scope and exact note IDs and uses this same owner for each,
  reporting any incomplete result honestly. Old Verify/Pin/Discard/toggle/preview definitions remain
  support/compatibility contracts with no ordinary UI producer; user dispatch cannot restore them or
  bypass support gates. Maintenance definitions retain their holds and source/admission gaps; this
  change does not enable them. These definitions add no EventRecord writer or native handler proof.
  Edit may supply destination_scope to explicitly request a supported availability change.
  memory_scope always identifies the current source; destination_scope never merely relabels it.
  Recheck both scopes, provenance and privacy, preserve versions and legacy protection, and commit
  destination plus source disposition through the same owner before claiming a move. A failure
  leaves the original available under its original scope; unavailable native cross-scope ownership
  stays handler_unavailable. Private app-thread content never broadens automatically.
gui_related: true
gui_classification_reason: Defines the Memory page, actions or reply presentation.
depends_on: [UCC-230, UCC-084, UCC-085, CV-333, DL-333, DL-402, DL-403, DL-444, DL-445, DL-446, DL-447, DL-341]
unblocks: []
acceptance_criteria:
- The new Add/Edit/Delete requests and result have exactly one owner definition and concrete strict schema.
- No successful-save acknowledgment precedes the durable canonical write receipt.
- Scope/actor/source/read-only helper/stale-revision checks precede mutations; deletion suppression survives
  replay/rebuild/old chats.
- Legacy support commands have no ordinary UI producer; all maintenance holds remain.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- 'T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared''s answer "approve all"
  to Q5'
- /mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens:
- cmd.chat.memory.verify
- cmd.chat.memory.edit
- cmd.chat.memory.pin
- cmd.chat.memory.discard
- cmd.chat.memory.toggle_auto_save_unverified
- cmd.chat.memory.preview_capsule
- cmd.chat.memory.rebuild_lexical_index
- cmd.chat.memory.rebuild_semantic_index
- cmd.chat.memory.verification_sweep
- cmd.chat.memory.dedup_sweep
- cmd.chat.memory.summarize_monthly
- cmd.chat.memory.prune_archive
- cmd.chat.memory.add
- cmd.chat.memory.delete
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not let summarize_monthly or prune_archive delete a memory; deletion stays the user's action (DL-402, DL-445).
  - Do not make summarize_monthly or prune_archive available before approved cutoffs exist and are applied (DL-403, DL-446, DL-447).
  - Do not make dedup_sweep available before the DL-444 and DL-445 answer is applied and the remaining approvals pass (DL-444, DL-445).
  - Do not let a prune_archive policy value select memories outside DL-447's cutoffs, include a pinned memory, or delete anything (DL-402, DL-447).
  - Do not record a judgment in a YAML comment; record it in the definition's judgments list (DL-341).
  - cmd.chat.memory.export keeps its own catalog rows (UCC-171, DL-130); this unit defines no payload for it.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Decision_Log.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: AMS-141
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
  - command_id: cmd.chat.memory.verify
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1133 row args { project_id, gist_id }; UCC-230 common optional project_id
          made required by the row.
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1133 { project_id, gist_id }; UCC-230 identity_aliases: gist_id stands for
          the UCC-084..UCC-088 overlay identity memory_item_id? (UI_Command_Catalog.md:8857; DL-341 resolution 4);
          MemoryGist id (assistant-memory-subsystem.md §3.1)'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'The production wiring row names ChatOwnerCommandRequestV2, which requires thread_id (string 1..256,
        not null; Plans/application_workflow_contracts.schema.json). The 2.8 rows (UI_Command_Catalog.md:1133-1144)
        are Project-scoped and carry no thread_id, except cmd.chat.memory.preview_capsule''s optional thread_id?,
        and the UCC-084..UCC-088 overlay requires none. Canon does not say who supplies the owner request''s thread_id
        for a Project memory command: not the Memory panel''s active thread, not the dispatch envelope, and for
        a Project-wide maintenance job canon names no thread at all. No value is chosen here: the wired request
        and the catalog rows disagree, and the chat and memory owners settle whether these commands need a thread
        or a different owner request.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'The 2.8 rows (UI_Command_Catalog.md:1133-1144) mark project_id required, while the MemoryGist scope
        envelope allows project_id=null with actual Computer/thread identity for AMS-054 app memory (assistant-memory-subsystem.md
        §3.1; AMS-054). Choice: the row''s side, so these commands act on Project memory only and app memory has
        no Gist Review or maintenance command until the memory owner decides. The other side, required: true with
        nullable: true, is not open to this definition: UCC-230 refuses nullable on a restated common optional field,
        and project_id is one. Canon disagrees here and the memory owner settles it.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1133) states no command_kind. Verify emits memory.gist.verification_requested
        and memory.gist.verified or verification_failed, a durable change to the gist.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (assistant-memory-subsystem.md §9.4) is read as not_configured.
  - command_id: cmd.chat.memory.pin
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1135 row args { project_id, gist_id, pinned }; UCC-230 common optional project_id
          made required by the row
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1135; UCC-230 identity_aliases: gist_id stands for memory_item_id (DL-341
          resolution 4); MemoryGist id (assistant-memory-subsystem.md §3.1)'
      pinned:
        type: boolean
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1135 { project_id, gist_id, pinned }; MemoryGist field pinned (bool), assistant-memory-subsystem.md
          §3.1
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1135) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1135)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1135) states no command_kind. Pin emits memory.gist.pinned or
        memory.gist.unpinned, a durable change to the gist.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.discard
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1136 row args { project_id, gist_id }; UCC-230 common optional project_id
          made required by the row
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1136; UCC-230 identity_aliases: gist_id stands for memory_item_id (DL-341
          resolution 4); MemoryGist id (assistant-memory-subsystem.md §3.1). Discard sets verification_state = Discarded
          and excludes the gist from automatic injection and default search results (§5.3).'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1136) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1136)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1136) states no command_kind. Discard emits memory.gist.discarded
        and sets verification_state = Discarded (§5.3).
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no gist-review result payload, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.toggle_auto_save_unverified
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1137 row args { project_id, enabled }; UCC-230 common optional project_id
          made required by the row
      enabled:
        type: boolean
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1137 { project_id, enabled }; sets ConfigKey assistant.memory.auto_save_unverified
          (default true, §9.4); AutoRunBoundary drops newly-proposed Unverified gists when disabled (§5.2.1); emits
          settings.updated
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1137) carries no thread_id. Canon does not say who supplies
        it; no value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1137)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1137) states no command_kind. The toggle sets a ConfigKey and
        emits settings.updated, a durable settings change.
    - key: owner_result
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      gap_note: The wiring row names ChatOwnerCommandResultV2, whose domain payload is only owner_result_ref; canon
        types no result payload for the toggle, so none is defined here.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.preview_capsule
    ucc_units:
    - UCC-084
    command_kind: shell_view
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1138 row args { project_id, thread_id? }; UCC-230 common optional project_id
          made required by the row
      thread_id:
        type: id
        required: false
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1138 { project_id, thread_id? }; restated at its UCC-230 canonical type id,
          optional as the row marks it
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryCapsulePreviewResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1138) makes thread_id optional. When the caller supplies
        thread_id it can fill the owner request''s; canon does not say what fills it when the caller leaves it out.
        No value is chosen here, and the chat and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1138)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: shell_view
      gap_note: The 2.8 row (UI_Command_Catalog.md:1138) states no command_kind; it says 'no persisted domain event
        (preview computation only)', so there is no domain effect to take.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.rebuild_lexical_index
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1139 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Rebuilds the Tantivy index from assistant_memory.redb (§7.2 item 1); runs in-process (§7.2
          rule).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1139) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1139)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1139) states no command_kind. The rebuild emits memory.index.lexical.rebuild.started
        and .completed and rewrites the derived index.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.rebuild_semantic_index
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1140 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Rebuilds the USearch index from assistant_memory.redb, re-embed and rebuild (§7.2 item 2);
          runs in-process (§7.2 rule).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1140) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1140)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1140) states no command_kind. The rebuild emits memory.index.semantic.rebuild.started
        and .completed and rewrites the derived index.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.verification_sweep
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: UI_Command_Catalog.md:1141 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Re-evaluates verification_state for all gists (§7.2 item 3); pins do not stop verification
          (DL-402).
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1141) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1141)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1141) states no command_kind. The sweep emits memory.verification_sweep.started
        and .completed and re-evaluates every gist's verification_state.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: No catalog row states disabled reasons for the memory commands. assistant.memory.enabled=false or
        no memory store for the scope (§9.4) is read as not_configured.
  - command_id: cmd.chat.memory.dedup_sweep
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1142 row args { project_id }; UCC-230 common optional project_id made required
          by the row. Merges identical embed_text_hash gists (§7.2 item 4); survivor and disposition per Plans/Decision_Log.md#DL-444
          and #DL-445: the oldest eligible memory keeps its identity, merged originals are archived with their evidence
          references, never automatically deleted, and a pin-protected merge is skipped.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: dedup_hold_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1142) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1142)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1142) states no command_kind. The sweep emits memory.dedup_sweep.started
        and .completed and merges gists.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'No catalog row states disabled reasons for the memory commands. Plans/Decision_Log.md#DL-444 and
        #DL-445 (approved scope) keep internal automatic/support jobs unavailable until the answer is applied and
        all remaining definition, review and recording approvals pass. The definition shows that hold as owner state
        dedup_hold_pending, which UCC-230''s owner_state_code_map maps to not_configured (DL-444, DL-445; DL-341).
        assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.summarize_monthly
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1143 row args { project_id, month? }; UCC-230 common optional project_id
          made required by the row. Consolidates older low-activation Note gists into a monthly Note gist (§7.2
          item 5). Archive-only per Plans/Decision_Log.md#DL-402: originals stay archived with all their evidence
          references, a pinned memory is never archived or merged, and a memory is deleted only when the user deletes
          it.'
      month:
        type: string
        required: false
        default: none
        provenance: gap
        gap_note: 'UI_Command_Catalog.md:1143 gives the key only ({ project_id, month? }); no format or default
          is stated. DL-446 keeps "the existing monthly grouping" and fixes the selection cutoffs (Note memories
          idle at least 90 days AND usefulness score below 0.10, per Project), not a month format. Choice: an unconstrained
          optional string pending an owner format, candidate YYYY-MM. month only names which monthly group to consolidate;
          it can never change DL-446''s cutoffs, pin exclusion or archive-only rule.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: maintenance_cutoffs_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1143) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1143)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1143) states no command_kind. The job emits memory.monthly_summary.started
        and .completed and archives originals.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'Owner state maintenance_cutoffs_pending, which UCC-230''s owner_state_code_map maps to not_configured
        (DL-403; DL-341 resolution 3): neither job runs, through automatic or internal support execution, until approved
        cutoffs exist, and the internal request stays unavailable with that reason. DL-446 returned the cutoffs and keeps
        runs waiting for their application and the remaining definition, review and recording approvals, so the
        state holds until then. assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.prune_archive
    ucc_units:
    - UCC-085
    command_kind: domain_action
    response_kind: owner_operation
    args:
      project_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: 'UI_Command_Catalog.md:1144 row args { project_id, policy? }; UCC-230 common optional project_id
          made required by the row. Archive-only per Plans/Decision_Log.md#DL-402: deletion stays the user''s action,
          a pinned memory is never archived, and archived originals keep their evidence references and versions
          (DL-447).'
      policy:
        type: string
        required: false
        default: none
        provenance: gap
        gap_note: 'UI_Command_Catalog.md:1144 gives the key only ({ project_id, policy? }) and no canon defines
          a policy shape or what a caller-supplied policy may change. DL-402 fixes archive-only and DL-447 fixes
          the selection (memories of any kind idle at least 180 days AND usefulness score below 0.05, inside each
          Project, pins excluded before scoring). Choice: the field stays an optional string with no accepted value
          until the memory owner defines it; until then the handler refuses any supplied policy with invalid_args,
          and no policy value can ever widen, narrow or replace DL-447''s eligibility test, its pin exclusion or
          DL-402''s archive-only rule.'
    owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: local:MemoryMaintenanceResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    owner_state_codes:
    - owner_state: maintenance_cutoffs_pending
      code: not_configured
    aliases: []
    judgments:
    - key: owner_request
      choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      gap_note: 'As recorded on cmd.chat.memory.verify: the wired ChatOwnerCommandRequestV2 requires a non-null
        thread_id, and this row (UI_Command_Catalog.md:1144) carries no thread_id. Canon does not say who supplies
        it, and for this Project-wide maintenance job canon names no thread; no value is chosen here, and the chat
        and memory owners settle it.'
    - key: field:project_id
      choice: required, not nullable
      gap_note: 'As recorded on cmd.chat.memory.verify: the row marks project_id required (UI_Command_Catalog.md:1144)
        while AMS-054 app memory has project_id=null (assistant-memory-subsystem.md §3.1); the row''s side is taken,
        and UCC-230 refuses nullable on a restated common optional field. The memory owner settles the disagreement.'
    - key: command_kind
      choice: domain_action
      gap_note: The 2.8 row (UI_Command_Catalog.md:1144) states no command_kind. The job emits memory.prune_archive.started
        and .completed and archives memories.
    - key: disabled_reason_codes
      choice:
      - not_configured
      gap_note: 'Owner state maintenance_cutoffs_pending, which UCC-230''s owner_state_code_map maps to not_configured
        (DL-403; DL-341 resolution 3): neither job runs, through automatic or internal support execution, until approved
        cutoffs exist, and the internal request stays unavailable with that reason. DL-447 returned the cutoffs and keeps
        runs waiting for their application and the remaining definition, review and recording approvals, so the
        state holds until then. assistant.memory.enabled=false or no memory store (§9.4) is also not_configured.'
  - command_id: cmd.chat.memory.add
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      text:
        type: string
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          min_length: 1
      title:
        type: string
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteAddRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  - command_id: cmd.chat.memory.edit
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      expected_revision:
        type: integer
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          minimum: 1
      text:
        type: string
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          min_length: 1
      title:
        type: string
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      destination_scope:
        type: contract
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
        required: false
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; explicit availability change under DL-475
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteEditRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  - command_id: cmd.chat.memory.delete
    ucc_units:
    - UCC-084
    command_kind: domain_action
    response_kind: owner_operation
    args:
      memory_scope:
        type: contract
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        ref: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteScopeV1
      gist_id:
        type: id
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
      expected_revision:
        type: integer
        required: true
        default: none
        provenance: canon
        source: Plans/assistant-memory-subsystem.md#AMS-141; DL-475
        constraints:
          minimum: 1
    owner_request: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteDeleteRequestV1
    result:
      response: Plans/ui_command_response.schema.json
      owner_result: Plans/assistant_memory_contracts.schema.json#/$defs/MemoryNoteMutationResultV1
    error_codes:
    - invalid_args
    - permission_denied
    - stale_projection
    - handler_unavailable
    - internal_error
    disabled_reason_codes:
    - not_configured
    aliases: []
  results:
    MemoryCapsulePreviewResultV1:
      fields:
        estimated_tokens:
          type: integer
          required: true
          default: none
          constraints:
            minimum: 0
          provenance: gap
          gap_note: the estimated token count the capsule preview MUST report (assistant-memory-subsystem.md:389),
            counting memory notes only against assistant.memory.capsule_budget_tokens (:392); canon names no field,
            and minimum 0 is chosen here
        truncated:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: whether truncation occurred because of the configured cap, which the preview MUST indicate (assistant-memory-subsystem.md:389);
            canon names no field
        capsule_budget_tokens:
          type: integer
          required: false
          default: none
          constraints:
            minimum: 0
          provenance: gap
          gap_note: the assistant.memory.capsule_budget_tokens value the count is measured against (assistant-memory-subsystem.md:392);
            canon does not say the result carries it
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: dispatch receipt (catalog.chat_memory_preview_capsule); the row persists no domain event
    MemoryMaintenanceResultV1:
      fields:
        status:
          type: enum
          values:
          - succeeded
          - failed
          required: true
          default: none
          provenance: gap
          gap_note: maintenance operations report explicit success/failure status (assistant-memory-subsystem.md:412);
            canon names neither the field nor its values
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: dispatch receipt for the job's started/completed events (UI_Command_Catalog.md:1139-1144)
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-230, ContractName:Plans/UI_Command_Catalog.md#UCC-084, ContractName:Plans/UI_Command_Catalog.md#UCC-085, ContractName:Plans/Decision_Log.md#DL-333, ContractName:Plans/Decision_Log.md#DL-402, ContractName:Plans/Decision_Log.md#DL-403, ContractName:Plans/Decision_Log.md#DL-444, ContractName:Plans/Decision_Log.md#DL-445, ContractName:Plans/Decision_Log.md#DL-446, ContractName:Plans/Decision_Log.md#DL-447, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/application_workflow_contracts.schema.json, ContractName:Plans/Contracts_V0.md#7-uicommand


### AMS-100 - memory.dedup_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-100
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.completed@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.completed.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.completed records the already durably settled success or failure, never a fabricated success.
  No event is an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result
  refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload
  joins are governed by CV-650; persistence and read-only history by SP-630. Existing pinned protection, claim verification,
  NullMemoryProvider and locked-rule rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-101 - memory.dedup_sweep.started semantic contract

```yaml
plan_unit_id: AMS-101
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.started@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.started.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.started records acceptance before any maintenance effect. No event is an instruction to merge,
  verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text, prompts,
  embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by CV-651; persistence
  and read-only history by SP-631. Existing pinned protection, claim verification, NullMemoryProvider and locked-rule
  rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery
  are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-102 - memory.index.lexical.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-102
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.lexical.rebuild.completed records the already durably settled success or failure, never
  a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-652; persistence and read-only history by SP-632. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-103 - memory.index.lexical.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-103
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.lexical.rebuild.started records acceptance before any maintenance effect. No event is an
  instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-653; persistence and read-only history by SP-633. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-104 - memory.index.semantic.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-104
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.semantic.rebuild.completed records the already durably settled success or failure,
  never a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details
  are opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies.
  Event fields and all payload joins are governed by CV-654; persistence and read-only history by SP-634. Existing
  pinned protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion
  remains unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-105 - memory.index.semantic.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-105
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.semantic.rebuild.started records acceptance before any maintenance effect. No event is
  an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-655; persistence and read-only history by SP-635. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-106 - memory.verification_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-106
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.completed.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.verification_sweep.completed records the already durably settled success or failure, never a
  fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-656; persistence and read-only history by SP-636. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-107 - memory.verification_sweep.started semantic contract

```yaml
plan_unit_id: AMS-107
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.started.v1@1.0.0. GUI command and internal job use the
  same authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.verification_sweep.started records acceptance before any maintenance effect. No event is an instruction
  to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text,
  prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by
  CV-657; persistence and read-only history by SP-637. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
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
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-130 - memory.gist_state_changed prepared semantic contract

```yaml
plan_unit_id: AMS-130
unit_type: interface_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.gist_state_changed@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  RealMemoryProvider records one real successful MemoryGist change for each successful verify, edit, pin, unpin,
  discard or automatic mutation, including save/import, claim/evidence currentness, decay/half-life, access count/time
  and derived-field invalidation/re-derivation when they actually change canonical gist state. Exact producer entry
  points are cmd.chat.memory.verify, cmd.chat.memory.edit, cmd.chat.memory.pin, cmd.chat.memory.discard, RealMemoryProvider.upsert_gist,
  RealMemoryProvider.set_verification_state, RealMemoryProvider.record_access, RealMemoryProvider.delete_gist. All
  require the already specified Assistant-only scope and existing permission/verification rules. changed_fields
  names every changed canonical field but contains no field value. A successful verification adopts AMS-044/045
  claim-level support, resolvable scoped current evidence and the existing explicit allow_manual_verify_without_evidence
  exception; it does not invent a second verification rule. Requested verification and failed verification keep
  only their command result and append zero history events; successful verification with no real change also appends
  none. A separate authoritative automatic invalidation that actually changes a gist is one automatic mutation,
  not an event for a failed command. Pin requires false to true, unpin true to false, discard sets verification_state=Discarded;
  edit and automatic require an actual delta. One committed mutation increments the revision once; deferred or unavailable
  maintenance performs no mutation and emits nothing. The seven retired command spellings are not aliases that may
  append. This contract does not change section 7.2 archive/delete policy or decide the duplicate-sweep survivor.

  DL-407 retires memory.gist.verification_requested, memory.gist.verified, memory.gist.verification_failed, memory.gist.updated,
  memory.gist.pinned, memory.gist.unpinned and memory.gist.discarded only under this complete surviving contract.
  A request/failure never creates its own history; do not append either vocabulary twice. Existing memory-body/version
  audit custody is unchanged.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/memory_gist_state_changed, exact Project logical
  schema_id pm.memory.gist_state_changed.payload.v1 and distinct application logical schema_id pm.memory.gist_state_changed.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. Evidence has no 16-reference or other new count cap:
  section 3.1 and section 3.3 retain the complete ordered evidence list. The payload evidence_refs is that complete
  list of opaque owner pointers while the encoded full metadata body fits within the SP-337 16 KiB inline ceiling.
  If it would exceed that ceiling, evidence_refs instead holds the closed SP-337 collection descriptor defined
  by the payload schema: id (lowercase BLAKE3), size_bytes (exact integer byte count), and media_type exactly
  application/vnd.puppetmaster.memory-evidence-refs+msgpack. Its pack bytes are the complete canonical MessagePack
  evidence pointer array using the existing minimal-width/string/array encoding of pm_event_index_binding.binding_bytes,
  not gist text, claim bodies, evidence content or a second memory store. Resolve it in the original authenticated
  Storage/server/scope/thread payload store; recompute BLAKE3, byte count and canonical bytes and require durable
  bytes/index before event acknowledgment under SP-337. Compare the entire resolved array to the immutable source,
  never truncate it or compare only the descriptor. Freeze the selected inline/reference representation with the
  original operation; the unchanged CV-785 semantic digest covers it and retries reuse it. References inherit SP-765
  custody/access/deletion/backup and SP-337 hold/pack rules on append, retry and history. The reference route is
  selected only when the full list would exceed 16 KiB; the resulting full inline metadata body must still fit.
  revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalMemoryMutationSource and MemoryViewApplicationV1 under AMS-054).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  memory.gist_state_changed is read by reader.memory.gist_state_changed.history@1.0.0 for the existing memory GUI
  and audit consumers; prompt assembly reads the current authorized MemoryGist under AMS-054, never an event body
  as injection authority. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
  projector.storage.event_record_index@1.0.0 only for complete generic metadata indexing: checkpoints table, key
  event_record_index_checkpoint.v1:{storage_instance_id}, the uniquely current #/generations/{generation_id} value
  in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, and event_record_index.v2@{generation_id}.
  Verify the original generation birth anchor and actual complete coverage, including nonmatching application/Project
  rows, not a matching-row maximum. Resolve exact scope partition, event_type, event_id, sequence_id, publication_locator,
  source frame/CRC and payload commitment in one redb snapshot under the actual CURRENT/manifest maintenance fence.
  The complete SP-278 live read token contains storage_instance_id, checkpoint_key, checkpoint_ref, generation_id,
  generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and live redb_snapshot_id.
  A persisted read token is only its nine-field durable projection under DL-076; no redb_snapshot_id is stored.
  source_selection binds storage_instance_id, CURRENT path/bytes, selected segment generation, manifest path/bytes/generation,
  recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Generation-only
  comparison is insufficient: a same-generation frontier change invalidates publication. Revalidate access, deletion
  and that complete token at disclosure; changed fences discard the answer. The generic owner''s checkpoint CAS/complete-source
  transaction remains SP-278''s, not this reader''s. Family checkpoint disposition is none_required: the family
  creates no projector, durable history view, family checkpoint, cursor or ACK; its sole effect is an ephemeral
  read answer. It never writes or advances the generic checkpoint. Crash/rebuild reacquires the generic index and
  recomputes the answer, never reruns an owner command, emits an event, restores a lease, charges Usage or injects
  a prompt. Historical validation evaluates the genuine original committed transition under its original schema/policy;
  disappearance or changed current state of the live subject does not invalidate a retained event. Withdrawn or
  forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.


  DL-407 coverage requires complete immutable MemoryGist before/after facts. Before computing any delta,
  validate every resolved record against all required MemoryGist fields in section 3.1, including kind, claims,
  summary and access_count; identity and exact scope live in the independently joined record metadata.
  Two matching projections with the same required field omitted are incomplete sources and refuse on append,
  retry and history. Optional absence remains distinct from explicit null; never supply defaults to repair a source.
  Validate exact field types before values, including booleans versus numbers and complete claim objects.
  Each before and after claim includes claim_id, text, created_at and all three AMS-044 support facts:
  evidence_support is a list of distinct opaque references forming a subset of that same gist version evidence_refs;
  support_scope is a nonempty textual account of what those references cover; currentness is exactly current,
  needs_revalidation or source_unavailable. Claim identities are distinct within a gist. Missing or wrongly typed
  nested facts refuse even when both snapshots omit the same fact. Optional gist-level claim_support/currentness
  summaries never replace the claims; when present their references and currentness use the same valid domain.
  Section 5.3 and AMS-044/045 require every after-claim to have nonempty support and currentness=current for a
  successful verify or new automatic Verified transition, in addition to the genuine owner evaluation of support,
  scope, resolvability and validity context. Only manual verify with the existing explicit configured override
  may bypass that verification gate; it never permits malformed facts, foreign support or an automatic override.
  Noncurrent retained before facts remain valid history, not current verification authority. These are structural
  checks of the existing owner rules, never deterministic natural-language entailment.
  changed_fields is exactly
  the set of canonical semantic fields whose values differ, including presence versus absence; it is never a
  manually selected subset. Revision is checked separately and is not a semantic field. Payload previous_pinned,
  pinned, previous_verification_state, verification_state, source and evidence_refs equal their resolved facts.
  For a new automatic gist, the absent before record makes every present semantic field part of changed_fields;
  previous_verification_state is null and previous_pinned is the false absence sentinel. Edits, pin/unpin, discard,
  successful verify and automatic changes all use the same exact-delta rule, including combined changes and changes
  to claims, provenance, access, evidence/currentness and derived fields. Requested, failed and unchanged verification
  have identical canonical before/after facts, zero history events and a retained command result. The seven
  retirements above depend on these complete coverage and no-event obligations; they grant no maintenance policy.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- AMS-054
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an
  after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct
  real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_ams-130
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
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
