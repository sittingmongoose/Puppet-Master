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
ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts

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

Rule: A gist MUST transition to `Verified` if and only if ALL of the following hold:
1) Every claim in the gist has per-claim support evaluated per AMS-044: each claim carries `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` covering what the supporting references actually establish, and a `currentness` value of `current` (see the Claim-Level Verification and Notebook Boundary Addendum, AMS-044/AMS-045).
2) Each supporting reference is resolvable and structurally valid: a `Commit { hash, repo_id }` EvidenceRef resolves in `repo_id`; a `TestRun`/`BuildRun` EvidenceRef has `exit_code == 0`; a `PlanRef` EvidenceRef resolves to an accepted Plan record.
3) The support is semantically scoped to the claim: a commit supports only claims about that commit's existence/content; a successful test or build supports only claims within the tested scope; a valid artifact hash supports only claims about that artifact. Reference existence alone is structural evidence, never semantic proof of the attached claim text; a claim whose support does not cover it remains `Unverified`.
4) No relevant validity context for the claims is stale: evidence invalidated or superseded per AMS-045 blocks the transition until revalidated.
Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2, ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05

> Superseded 2026-09-05 (claim-level verification, AMS-044/AMS-045): the earlier sufficient conditions — "Verified if ANY holds: (1) a `Commit { hash, repo_id }` EvidenceRef; (2) a successful `TestRun`/`BuildRun` (`exit_code == 0`) plus a `Diff` or `Artifact` EvidenceRef; (3) a `PlanRef` EvidenceRef with `kind` `Decision`/`Constraint`/`Preference`/`Landmine`" — are retained here as historical lineage only. They are no longer operative on their own: satisfying one of them establishes at most the structural-validity precondition (condition 2 above) and never the per-claim support, scope, or currentness conditions (1, 3, 4). Builders MUST implement this section as amended, not the retired existence-only rule.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05, PolicyRule:Decision_Policy.md§2

Rule: A gist MUST NOT transition to `Verified` if `evidence_refs[]` is empty.
ContractRef: SchemaID:pm.evidence.schema.v1, PolicyRule:Decision_Policy.md§2

Rule: Legacy gists already labeled `Verified` under the retired existence-only rule are not blindly grandfathered: on their next verification evaluation — injection selection, evidence event, or explicit revalidation — they MUST be reassessed under the amended rule above; unsupported claims stop auto-injecting as current and surface as unverified with their support state, while original history and the state change remain explainable per AMS-045. A gist whose last evaluation was `Verified` but which holds a claim whose `currentness` is now `needs_revalidation` or `source_unavailable` MAY be shown under the display group "Out of date" until it is reassessed; that group is derived at read time from `currentness`, its gists do not auto-inject, and it is never stored, emitted or offered as a fourth `verification_state` (AMS-047).
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#claim-level-verification-and-notebook-boundary-addendum-2026-09-05

Rule: Manual “Verify” MUST re-run the amended deterministic validation above — including per-claim support, scope, and currentness checks; if validation fails, the gist MUST remain `Unverified` unless `assistant.memory.allow_manual_verify_without_evidence = true` (default `false`).
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

Deterministic activation score:

`score = (0.50 * normalized_bm25 + 0.50 * normalized_ann + pinned_boost + kind_status_weight + access_weight) * recency_multiplier`

Defaults: `pinned_boost = 0.20` when pinned else `0`; `kind_status_weight = 0.10` for Verified active project gists, `0` for other eligible Verified gists; `access_weight = min(0.15, ln(1 + access_count) * 0.03)`; `recency_multiplier = 0.5 ^ (age_days / effective_half_life_days)`; `effective_half_life_days = half_life_days` unless overridden by the Done rule below. Missing BM25 or ANN scores normalize to `0`; ties sort by newer `updated_at`, then lexical `id`.

Rule: Done-status gists MUST decay faster using `effective_half_life_days = half_life_days * 0.5`.
ContractRef: ConfigKey:assistant.memory.done_decay_multiplier, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

---

<a id="7-gui-and-maintenance"></a>
## 7. GUI + maintenance operations

### 7.1 GUI: Gist Review panel

The GUI must expose a **Gist Review** panel adjacent to (and visually consistent with) Memory + Rules panels.

Display name (2026-09-27, DL-134): on screen the panel and its document are titled "Notes it took" under Memory; "Gist Review" stays the canonical name in records, command ids, routes and these Plans, and the display name never replaces it there (AMS-049).

Required UI elements:
- List of gists with filters: kind/status/tags/pinned/verification_state; the list MAY group rows under the display group "Out of date" (§5.3, AMS-047), which is never a `verification_state` filter value
- Default review filter on panel open: `verification_state = Unverified`
- Toggle: `assistant.memory.auto_save_unverified` (default `true`)
- Actions per gist: `Verify`, `Edit`, `Pin/Unpin`, `Discard`; `Edit` is a versioned claim edit through `cmd.chat.memory.edit` that resets the gist to `Unverified` (AMS-048)
- Half-life controls: per-gist half-life override and per-kind default editor; the per-kind editor is a link to the Settings row `memory.retention.half-life-by-kind` through `cmd.settings.open`, with no memory command of its own (AMS-048)
- “What’s in capsule now” preview with token estimate and hard-cap indicator; its display label is "See what your next message will include" (AMS-047)
- Maintenance actions: rebuild lexical index, rebuild semantic index, verification sweep, dedup sweep, monthly summarize/compress, prune/archive low-activation gists
- Export: one Export action exports the gists, the taught rules or both through the artifact owner with `cmd.chat.memory.export {scope}` (DL-130, AMS-052)

Rule: The Gist Review panel MUST surface verification_state prominently and MUST make “Verify” and “Discard” first-class actions.
ContractRef: ConfigKey:assistant.memory.auto_save_unverified, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, UICommand:cmd.chat.memory.verify, UICommand:cmd.chat.memory.discard

Rule: On panel open, Gist Review MUST default to `verification_state = Unverified`; any non-default filter state MUST be the result of explicit user action.
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ConfigKey:assistant.memory.auto_save_unverified, ContractName:Plans/UI_Command_Catalog.md, UICommand:cmd.chat.memory.verify, UICommand:cmd.chat.memory.edit, UICommand:cmd.chat.memory.pin, UICommand:cmd.chat.memory.discard, UICommand:cmd.chat.memory.toggle_auto_save_unverified

Rule: Capsule preview MUST report an estimated token count and MUST indicate when truncation occurred due to the configured cap.
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, ContractName:Plans/assistant-chat-design.md#17-context--truncation

Rule: The capsule preview's token count and space meter MUST count memory notes only, against `assistant.memory.capsule_budget_tokens`. Taught rules that ride along with the next message MAY be listed beside the notes, but they come from the rules pipeline and MUST NOT be counted against the memory capsule budget; any figure shown for them names the rules budget it belongs to (Memory is not rules, AMS-018; AMS-047).
ContractRef: ConfigKey:assistant.memory.capsule_budget_tokens, UICommand:cmd.chat.memory.preview_capsule, ContractName:Plans/assistant-memory-subsystem.md#wand-modules-redesign-addendum-2026-09-27

Rule: In chat, memory is never a card and never a pop-up. A reply that saved a note carries a small "Noted" mark in its meta row that relaxes to the glyph alone after 3 s; a milestone that verifies a note earns one "Verified: …" line, once; a note going out of date makes no chat noise (AMS-047). The one memory event that earns a decision line is a note's proposal to change a rule the user locked, and that rule never changes unless the user changes it (DL-130, AMS-050).
ContractRef: ContractName:Plans/assistant-memory-subsystem.md#wand-modules-redesign-addendum-2026-09-27, ContractName:Plans/assistant-chat-design.md

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

Assistant memory is intentionally separate from child-run continuity, crew shared state, and context-shaping systems.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

### 8.1 Assistant prompt builder

Assistant uses the real memory subsystem. Assistant memory remains Assistant-only.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### 8.2 Child-run continuity

Subagents, Interview, Orchestrator, requirements builder, and crew members use `NullMemoryProvider` and receive no Assistant memory payload.

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
Gemini CLI provider-native settings set `model.compressionThreshold` default to `0.5`; if PM exposes or stores a `90%` compression threshold for assistant memory behavior, that value is an intentional PM override rather than alignment with provider-native defaults.
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
16. **Default review filter behavior:** Opening the Gist Review panel defaults to `verification_state = Unverified` until the user explicitly changes filters.

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

---
## 12. Runtime Owner Reference Map

Assistant memory remains Assistant-only, but its design must stay aligned with runtime owner docs through explicit evidence_refs rather than hidden orchestration memory. The memory subsystem reference set includes `Plans/Models_System.md:58-80`, `Plans/Executor_Protocol.md:134-178`, `/Models_System.md:58-80`, `/Executor_Protocol.md:134-178`, `Plans/Crosswalk.md:88-94`, `Plans/storage-plan.md:294`, `Plans/Contracts_V0.md:649`, `Plans/Orchestrator_Page.md:12-13`, `Plans/WorktreeGitImprovement.md:62-66`, `Plans/WorktreeGitImprovement.md:78-80`, `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31`, `Plans/orchestrator-subagent-integration.md:28-41`, `/Orchestrator_Page.md:12-13`, `/WorktreeGitImprovement.md:62-66`, `/WorktreeGitImprovement.md:78-80`, `/GUI_Rebuild_Requirements_Checklist.md:31`, `/Crosswalk.md:88-94`, `/Contracts_V0.md:649`, `/orchestrator-subagent-integration.md:28-41`, `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/Models_System.md`, `Plans/Orchestrator_Page.md`, `Plans/Executor_Protocol.md`, `Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md`.

Runtime traceability also depends on `Plans/Tools.md:866-920`, `Plans/Tools.md:1262-1288`, `Plans/Contracts_V0.md:778-806`, `Plans/storage-plan.md:1330-1391`, `Plans/storage-plan.md:1548-1568`, `Plans/Orchestrator_Page.md:1-44`, `Plans/FinalGUISpec.md:2737-2739`, `Plans/human-in-the-loop.md:22-49`, `Plans/UI_Command_Catalog.md:29-90`, `Plans/Executor_Protocol.md:110-175`, `Plans/Orchestrator_Page.md:428-475`, `Plans/UI_Command_Catalog.md:617-622`, `Plans/assistant-chat-design.md:1784`, `Plans/Glossary.md:30-127`, `Plans/FinalGUISpec.md:2092`, `Plans/usage-feature.md:104-127`, `Plans/usage-feature.md:228-242`, `Plans/usage-feature.md:714-720`, `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, `Plans/human-in-the-loop.md`, `Plans/UI_Command_Catalog.md`, `Plans/GitHub_Integration.md`, and `Plans/assistant-chat-design.md`.

Blocked notice, route, and usage joins use the broader anchor set `Plans/storage-plan.md:1289-1300`, `Plans/GitHub_Integration.md:251-258`, `Plans/assistant-chat-design.md:2213-2240`, `Plans/usage-feature.md:233-245`, `Plans/usage-feature.md:346-389`, `Plans/Runtime_Artifacts_Panel.md:63-93`, `Plans/Project_Output_Artifacts.md:16-24`, `Plans/interview-subagent-integration.md:1686-1698`, `Plans/Tools.md:1131-1135`, `Plans/Contracts_V0.md:461-465`, `Plans/storage-plan.md:1322-1391`, `Plans/UI_Command_Catalog.md:29-95`, `Plans/Executor_Protocol.md:134-160`, `Plans/assistant-chat-design.md:808-818`, `Plans/Glossary.md:30-70`, `Plans/usage-feature.md:690-705`, `Plans/Runtime_Artifacts_Panel.md:61-93`, `Plans/Project_Output_Artifacts.md`, and `Plans/Runtime_Artifacts_Panel.md`.

Route/open and worktree-adjacent memory evidence uses `Plans/Contracts_V0.md:557-624`, `Plans/storage-plan.md:1650-1654`, `Plans/Orchestrator_Page.md:1-150`, `Plans/UI_Command_Catalog.md:214-223`, `Plans/assistant-chat-design.md:2218-2242`, `/Contracts_V0.md:557-624`, `/FinalGUISpec.md:2737-2739`, `Plans/Glossary.md:34-85`, `Plans/usage-feature.md:233-249`, `/FinalGUISpec.md:2092`, `Plans/Contracts_V0.md:50-58`, `Plans/Contracts_V0.md:800-806`, `Plans/storage-plan.md:323-337`, `Plans/storage-plan.md:941-954`, `Plans/storage-plan.md:1389-1396`, `Plans/Orchestrator_Page.md:209-230`, `Plans/Orchestrator_Page.md:270-270`, `Plans/GitHub_Integration.md:258-258`, `Plans/WorktreeGitImprovement.md:142-144`, `Plans/WorktreeGitImprovement.md:704-708`, `Plans/assistant-chat-design.md:814-818`, `Plans/assistant-chat-design.md:1784-1784`, `/Contracts_V0.md:50-58`, `/Contracts_V0.md:800-806`, `/Orchestrator_Page.md:209-230`, `Plans/Glossary.md:30-90`, `Plans/usage-feature.md:346-382`, and `Plans/Runtime_Artifacts_Panel.md:57-65`.

Memory injection and storage references must preserve `Plans/Tools.md:866-916`, `Plans/Tools.md:1262-1284`, `Plans/storage-plan.md:330-337`, `Plans/storage-plan.md:468-590`, `Plans/storage-plan.md:788-817`, `Plans/FinalGUISpec.md:1842-1845`, `Plans/FinalGUISpec.md:2924-2925`, `Plans/Orchestrator_Page.md:258-266`, `Plans/Orchestrator_Page.md:358-377`, `Plans/Glossary.md:30-67`, `Plans/Glossary.md:34-67`, `Plans/Glossary.md:102-126`, `Plans/usage-feature.md:234-239`, `Plans/usage-feature.md:715-717`, `/Contracts_V0.md:778-806`, `/Executor_Protocol.md:110-175`, `/UI_Command_Catalog.md:617-622`, `/storage-plan.md:330-337`, `/storage-plan.md:468-590`, `/usage-feature.md:104-127`, `Plans/usage-feature.md:714-717`, `Plans/Tools.md:1131-1135`, `Plans/storage-plan.md:324-337`, `Plans/storage-plan.md:541-590`, `Plans/storage-plan.md:1289-1391`, `Plans/UI_Command_Catalog.md:29-92`, `Plans/Orchestrator_Page.md:200-209`, `Plans/Project_Output_Artifacts.md:485-530`, `Plans/orchestrator-subagent-integration.md:374-391`, and `Plans/interview-subagent-integration.md`.

The export/open path and HITL reference set includes `Plans/Contracts_V0.md:55-60`, `Plans/Contracts_V0.md:800-807`, `Plans/storage-plan.md:1616-1625`, `Plans/FinalGUISpec.md:2092-2092`, `Plans/FinalGUISpec.md:2736-2739`, `Plans/Orchestrator_Page.md:171-171`, `Plans/Orchestrator_Page.md:209-209`, `Plans/Orchestrator_Page.md:230-230`, `Plans/UI_Command_Catalog.md:617-623`, `Plans/WorktreeGitImprovement.md:134-150`, `/Contracts_V0.md:55-60`, `/Contracts_V0.md:800-807`, `/FinalGUISpec.md:2092-2092`, `Plans/storage-plan.md:325`, `Plans/storage-plan.md:894-897`, `Plans/human-in-the-loop.md:96`, `Plans/storage-plan.md:1335-1383`, `Plans/human-in-the-loop.md:29-33`, `Plans/Orchestrator_Page.md:16-43`, `Plans/UI_Command_Catalog.md:67-91`, `Plans/Executor_Protocol.md:110-130`, `Plans/Orchestrator_Page.md:451-474`, `Plans/UI_Command_Catalog.md:224-246`, `Plans/orchestrator-subagent-integration.md:209-235`, `Plans/orchestrator-subagent-integration.md:380-402`, `Plans/Contracts_V0.md:684-692`, `Plans/Contracts_V0.md:1218-1229`, `Plans/Executor_Protocol.md:548-557`, `Plans/Orchestrator_Page.md:439-446`, `/Contracts_V0.md:684-692`, `/Contracts_V0.md:1218-1229`, `/Executor_Protocol.md:548-557`, `/Orchestrator_Page.md:439-446`, `/Tools.md:866-920`, `/assistant-chat-design.md:2213-2240`, `/usage-feature.md:233-245`, and `Plans/Tools.md`.

Assistant memory must also preserve post-reconciliation anchors `Plans/FinalGUISpec.md:2924-2928`, `Plans/Orchestrator_Page.md:437-437`, `Plans/assistant-chat-design.md:2233-2240`, `/FinalGUISpec.md:2924-2928`, `/Orchestrator_Page.md:171-171`, `/Orchestrator_Page.md:209-209`, `/Orchestrator_Page.md:230-230`, `/Orchestrator_Page.md:270-270`, `Plans/Glossary.md:30-85`, `Plans/usage-feature.md:694-701`, `Plans/FinalGUISpec.md:728-735`, `/FinalGUISpec.md:728-735`, `/human-in-the-loop.md:22-49`, `Plans/storage-plan.md:322-337`, `Plans/storage-plan.md:941-956`, `/storage-plan.md:322-337`, `/storage-plan.md:941-956`, `/orchestrator-subagent-integration.md:374-391`, `/usage-feature.md:346-389`, `/interview-subagent-integration.md:1686-1698`, `Plans/assistant-chat-design.md:1112-1120`, `/assistant-chat-design.md:1112-1120`, `Plans/Project_Output_Artifacts.md:1-24`, `/Project_Output_Artifacts.md:1-24`, `/Runtime_Artifacts_Panel.md:63-93`, `/interview-subagent-integration.md:1686-1698`, `Plans/orchestrator-subagent-integration.md:379-391`, `/orchestrator-subagent-integration.md:379-391`, `Plans/interview-subagent-integration.md:1692-1698`, `/interview-subagent-integration.md:1692-1698`, `Plans/agent-rules-context.md`, `Plans/LSPSupport.md`, `/LSPSupport.md`, and `/agent-rules-context.md`.

Plan-local obligations in memory are narrow: `plan-local` `/event/command` items belong in canonical state/event/command owners before memory consumes them. `assistant-memory-subsystem`, `assistant-memory-subsystem.md`, `system-prompt`, `newfeatures.md`, and `NullMemoryProvider` remain the durable boundary for memory prohibition versus stateful orchestration. Remaining Gemini-only docs are not low-value leftovers; many still hide active owner gaps in `/checklists/policies` and subsystem plans.

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

Display pointer (2026-09-27): "Out of date" is a display group over these three states for Verified gists whose claim support went stale, never a fourth state; see AMS-047.

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

Preview pointer (2026-09-27): the capsule preview counts notes only against this budget; taught rules shown beside them are never counted against it; see AMS-047.

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
canonical_text: >-
  P1-MEMORY-TIERING-CONTRACT (P1) is compiled as canonical Puppet Master intent for Agent memory, goal memory, project memory, conversation history: Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics. The preserved PM gap/delta is: PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set. The observed external-repo signal remains source-lineage evidence: Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A giant chat/session file is compacted or paged before app crash.
- Memory search timeout returns degraded result, not hung turn.
- Project ledger facts are not injected as personal memory.
- Superseded/stale memory cannot silently override current Plan canon.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A giant chat/session file is compacted or paged before app crash.
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
canonical_text: >-
  P1-MEMORY-STORE-CRUD-VERSION-CITATIONS (P1) is compiled as canonical Puppet Master intent for Agent memory store management, version history, and citation surfacing: Imported external-repo finding extrepo-20260703-0083 / P1-MEMORY-STORE-CRUD-VERSION-CITATIONS (P1). The preserved PM gap/delta is: MemoryTierContract covered layers and budgets, but not enough about memory CRUD/versioning/citations as user-visible objects. The observed external-repo signal remains source-lineage evidence: Warp Oz updates add memory store management commands and memory citations. | Codex changelog moved memory state to a dedicated SQLite DB and gated dedicated memory tools in config. | Agent Zero shows memory/history bloat and silent memory consolidation failure risks.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- User can list/get/update/delete memory stores and individual memories with version history, provenance, redaction, and rollback.
- Model responses that use memories can surface citations or evidence receipts.
- Memory consolidation failures are typed, retryable or surfaced, and never silently drop required memories.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- User can list/get/update/delete memory stores and individual memories with version history, provenance, redaction, and rollback.
- Model responses that use memories can surface citations or evidence receipts.
- Memory consolidation failures are typed, retryable or surfaced, and never silently drop required memories.
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
negative_constraints: []
observed_signal: Warp Oz updates add memory store management commands and memory citations. | Codex changelog moved memory state to a dedicated SQLite DB and gated dedicated memory tools in config. | Agent Zero shows memory/history bloat and silent memory consolidation failure risks.
pm_gap_or_delta: MemoryTierContract covered layers and budgets, but not enough about memory CRUD/versioning/citations as user-visible objects.
relationship_to_prior_reports: Extends memory budget/governance into user-visible store operations.
compile_disposition: create_new_planunit
```

## Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. This addendum amends §5.3 (amended in place on 2026-09-05; the retired existence-only sufficient conditions there are historical lineage only). A resolvable evidence reference is structural evidence, not universal semantic proof of the attached claim text. Verification therefore records per-claim support: each `claim` gains `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` (what the references actually cover) and a `currentness` value (`current | needs_revalidation | source_unavailable`). A `Commit { hash, repo_id }` EvidenceRef supports only claims about that commit's existence/content; a successful `TestRun`/`BuildRun` supports only claims within the tested scope; a valid `Artifact` hash supports only claims about that artifact. A commit existing, an unrelated green test, or a valid artifact hash alone cannot verify a broader attached claim; unsupported semantic text stays `Unverified`, and claims without adequate support surface as unverified with their support state rather than being silently treated as proven. Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.

Correction and invalidation: when a claim, its evidence, or its relevant validity context changes (source mutated, revoked, pruned, or staleness re-detected), derived summary/index eligibility is recomputed and stale auto-injection stops; the original history is preserved and the revalidation status is explainable. Migrated or legacy gists marked Verified under the weaker rules are reassessed against the per-claim semantics on their next verification evaluation: unsupported ones stop auto-injecting, keep their original evidence/history, and move to a truthful state — an old Verified label is not blindly grandfathered. Notebook interaction boundaries are unchanged and reinforced: promotion from Working Notebook content runs only through the existing AutoRunBoundary/AutoMilestone trigger contracts and evidence gates (Working Notebook capture never bypasses them, and details never become default memory injection because they were once notes); notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly; and the Assistant-only boundary holds — notebook sharing, summaries, tool outputs, checkpoints, and handoffs never forward Assistant-only memory payloads into workers or shared surfaces (`NullMemoryProvider` wiring unchanged), and worker notebooks gain no memory access through paraphrase or hidden metadata.

```yaml
plan_unit_id: AMS-044
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Verification is per claim. Each claim records evidence_support (the evidence_refs evaluated as supporting it), support_scope (what those references actually cover), and currentness (current | needs_revalidation | source_unavailable). A commit existing, a successful unrelated test, or a valid artifact hash cannot verify a broader attached claim; unsupported semantic text stays Unverified with visible support state. Deterministic validators prove structural/scope relationships only; no deterministic natural-language entailment proof exists or is attempted.
gui_related: false
gui_classification_reason: Memory verification semantics are runtime behavior, not GUI work.
depends_on: [AMS-001]
unblocks: [AMS-045, AMS-046]
acceptance_criteria:
  - Per-claim support and currentness are available to consumers.
  - A claim about more than its evidence covers remains unverified.
  - No fake deterministic entailment proof is claimed.
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
preserved_exact_tokens: ["evidence_support", "support_scope", "currentness", "Unverified", "not universal semantic proof"]
negative_constraints:
  - Do not verify a claim solely because a referenced commit, test, or artifact exists.
  - Do not present deterministic structural checks as semantic proof.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md

Display pointer (2026-09-27): a claim's `currentness` drives the "Out of date" display group; see AMS-047.

```yaml
plan_unit_id: AMS-045
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: "When claims, evidence, or relevant validity context change, derived summary and index eligibility are invalidated as required and stale auto-injection stops. Superseded claims and migrated or weakly-Verified gists do not auto-inject as current: on their next verification evaluation they are reassessed against per-claim semantics, unsupported ones stop injecting while original evidence and audit history are preserved and the revalidation status is explainable. An old Verified label is not blindly grandfathered, and a correction never destroys audit history."
gui_related: false
gui_classification_reason: Invalidation semantics are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: [AMS-046]
acceptance_criteria:
  - Correction removes stale auto-injection without destroying audit history.
  - Migrated unsupported Verified gists stop auto-injecting and state why.
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
preserved_exact_tokens: ["not blindly grandfathered", "revalidation status", "audit history"]
negative_constraints:
  - Do not grandfather old Verified labels without reassessment.
  - Do not delete original history when correcting.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

Display pointer (2026-09-27): until reassessment, a stale Verified gist is shown under "Out of date" and does not auto-inject; see AMS-047.

```yaml
plan_unit_id: AMS-046
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: "The Assistant-only memory boundary holds against every notebook path: notebook sharing, summaries, tool outputs, checkpoints, and handoffs never forward Assistant-only memory into disallowed agents, directly or through derived notes or paraphrase, and notebook absence is never a reason to wire workers to Assistant memory. Promotion from Working Notebook content runs only through the existing trigger contracts and evidence gates; notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly, and note-derived detail never becomes default memory injection because it was once a note. The verified-only, summary-first model and configured budgets are retained."
gui_related: false
gui_classification_reason: Memory boundaries are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: []
acceptance_criteria:
  - A worker path never receives restricted memory payload directly or via derivative notes.
  - Promotion never bypasses evidence gates; note-derived detail stays out of default injection.
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
preserved_exact_tokens: ["NullMemoryProvider", "Assistant-only", "evidence gates", "separately attributed"]
negative_constraints:
  - Do not wire workers to Assistant memory because a notebook is absent.
  - Do not launder memory through note text, handoffs, or hidden metadata.
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
canonical_text: >-
  The capsule preview ("What's in capsule now") is labelled for people as "See what your next message will include". Its token count and space meter count memory notes only, against assistant.memory.capsule_budget_tokens (default 350); taught rules that ride along may be listed beside the notes but come from the rules pipeline and are never counted against the memory capsule budget, and any figure shown for them names the rules budget it belongs to, because Memory is not rules. A gist whose last evaluation was Verified but which holds a claim whose currentness is needs_revalidation or source_unavailable may be shown under the display group "Out of date" until it is reassessed; the group is derived at read time from currentness, its gists do not auto-inject, and it is never stored, emitted or offered as a fourth verification_state, which stays exactly Unverified, Verified or Discarded. In chat, memory is never a card and never a pop-up: a reply that saved a note carries a "Noted" mark in its meta row that relaxes to the glyph alone after 3 s, a milestone that verifies a note earns one "Verified: …" line once, and a note going out of date makes no chat noise.
gui_related: true
gui_classification_reason: The capsule preview label, the list grouping and the in-chat memory marks are user-visible presentation of memory state.
depends_on: [AMS-014, AMS-018, AMS-021, AMS-044, AMS-045]
unblocks: []
acceptance_criteria:
  - The capsule preview is labelled "See what your next message will include" and its meter counts notes only against assistant.memory.capsule_budget_tokens.
  - No taught rule is counted against the memory capsule budget; a figure shown for rules names the rules budget.
  - A stale Verified gist can appear under "Out of date", does not auto-inject, and no record, event, filter value or export carries "Out of date" as a verification_state.
  - A reply that saved a note shows "Noted" that relaxes to the glyph after 3 s; a verifying milestone prints one "Verified: …" line once; a note going stale prints nothing in chat.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_state_presentation_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (part), B-AMS-03, B-AMS-04, B-AMS-05 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["See what your next message will include", "What's in capsule now", "assistant.memory.capsule_budget_tokens", "Memory is not rules", "Out of date", "verification_state", "needs_revalidation", "source_unavailable", "Noted", "3 s"]
negative_constraints:
  - Do not add "Out of date" or any fourth value to verification_state.
  - Do not count taught rules against the memory capsule budget.
  - Do not render memory as a transcript card or pop-up; a stale note makes no chat noise.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#71-gui-gist-review-panel, ConfigKey:assistant.memory.capsule_budget_tokens, UICommand:cmd.chat.memory.preview_capsule, ContractName:Plans/assistant-chat-design.md

### AMS-048 - Gist Edit And Half-Life Link

```yaml
plan_unit_id: AMS-048
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Edit on a gist is a versioned claim edit through cmd.chat.memory.edit: it writes a new gist version, keeps the prior version and its evidence history, and resets the gist to Unverified, so an edited claim is re-verified before it can auto-inject again. The per-kind half-life editor is a link to the Settings row memory.retention.half-life-by-kind through cmd.settings.open; no memory command is added for it, and the per-gist half-life override stays a gist field. The 2026-09-27 wand redesign draws no Edit or half-life control, so in that wave cmd.chat.memory.edit has no GUI producer; its production wiring stays incomplete under CDRY-012 until a surface draws the control, and the command is not removed.
gui_related: true
gui_classification_reason: Edit and the half-life link are user-visible Gist Review actions.
depends_on: [AMS-010, AMS-014, AMS-021]
unblocks: []
acceptance_criteria:
  - An edited gist is Unverified and does not auto-inject until it verifies again; its previous version and evidence history remain readable.
  - The per-kind half-life editor opens memory.retention.half-life-by-kind through cmd.settings.open and no new memory command exists for it.
  - cmd.chat.memory.edit is reported as lacking a GUI producer in the 2026-09-27 wave rather than as wired.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_edit_bypasses_verification
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 amendment G-30 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["cmd.chat.memory.edit", "Unverified", "memory.retention.half-life-by-kind", "cmd.settings.open", "CDRY-012"]
negative_constraints:
  - Do not let an edited claim keep a Verified label.
  - Do not mint a memory command for the per-kind half-life editor.
  - Do not report cmd.chat.memory.edit as wired to a GUI producer that does not exist.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: UICommand:cmd.chat.memory.edit, UICommand:cmd.settings.open, ContractName:Plans/UI_Wiring_Rules.md

### AMS-049 - Gist Review Display Name

```yaml
plan_unit_id: AMS-049
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  On screen the Gist Review panel and its document are titled "Notes it took", shown under Memory. "Gist Review" stays the canonical name: records, command ids, routes, document identity and these Plans keep it, and the display name never replaces it there. This compiles the owner's decision DL-134 (card p19, E-38), which keeps official words in the data and shows plain words on screen. The panel's behaviour is unchanged: AMS-021's filters, its default Unverified filter, its actions and its capsule preview hold, and the verification_state words stay the state labels, with plain words only as helpers beside them. Card p19 names only Regenerate Title, Synthesize, Save as Default, Gist Review and frozen target pack, so it does not reach the verification states, and the approved design spec draws each Memory row as "state glyph + canonical word" with the plain helper beside the filter value (DESIGN-SPEC §8.10).
gui_related: true
gui_classification_reason: The panel's visible title is user-facing copy.
depends_on: [AMS-021, AMS-047]
unblocks: []
acceptance_criteria:
  - The panel and its document read "Notes it took" on screen, under Memory.
  - No record, command id, route or Plans reference replaces "Gist Review" with the display name.
  - AMS-021's behaviour and preserved tokens are unchanged.
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
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (WAIT part, card p19 E-38) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-134
preserved_exact_tokens: ["Notes it took", "Gist Review", "DL-134", "verification_state"]
negative_constraints:
  - Do not rename Gist Review in records, command ids, routes or Plans.
  - Do not replace the verification_state words as state labels.
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
  A note that proposes changing a taught rule the user locked never changes that rule. Such a proposal is the one memory event that earns a decision line in chat (the "Verified: …" trace of AMS-047 is a notice, not a decision), a single line and never a card or pop-up: "Puppet Master suggests a change to your rule '…'. It won't change unless you say so." with Review, which opens Memory through cmd.chat.teach.open_memory. In Memory the proposing note carries the decision "It suggests changing your rule. It won't change unless you say so." with two answers. Keep my rule discards the proposing note through cmd.chat.memory.discard and leaves the rule as it is. Edit my rule… opens Teach in correct mode through cmd.chat.teach.capture {mode: correct}, so any change to the rule is the user's own edit. Locking and unlocking a rule is the user's command cmd.chat.teach.set_lock, one of the seven commands the owner registered (DL-130, card p15, E-32); a locked rule keeps the explicit-unlock protection of Plans/assistant-chat-design.md §6, and no memory maintenance, summarization or proposal weakens it.
gui_related: true
gui_classification_reason: The chat line and the Memory decision are user-visible, and their answers dispatch commands.
depends_on: [AMS-047, AMS-021]
unblocks: []
acceptance_criteria:
  - A proposal to change a locked rule prints one line in chat with Review, and no card or pop-up.
  - Keep my rule discards only the proposing note; the locked rule is unchanged.
  - Edit my rule… opens Teach in correct mode; the rule changes only when the user saves that edit.
  - Nothing but the user's cmd.chat.teach.set_lock locks or unlocks a rule.
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
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-05 (WAIT part, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-130
preserved_exact_tokens: ["It won't change unless you say so.", "Keep my rule", "Edit my rule…", "cmd.chat.teach.open_memory", "cmd.chat.memory.discard", "cmd.chat.teach.set_lock", "DL-130"]
negative_constraints:
  - Do not let a memory note or any automated step change or unlock a locked rule.
  - Do not render the proposal as a card or pop-up.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: UICommand:cmd.chat.teach.open_memory, UICommand:cmd.chat.memory.discard, UICommand:cmd.chat.teach.capture, UICommand:cmd.chat.teach.set_lock, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-051 - Taught Rules Included In A Reply

```yaml
plan_unit_id: AMS-051
unit_type: schema_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  When the Assistant prompt builder places taught rules in a reply's context, it records them as included_teaching_ids on that reply's context record (the message's canonical usage/context record), each id at the version that was included; an empty list means no taught rule was included. The record states inclusion only: it proves a rule was given to the model, not that the model obeyed it. By the owner's decision DL-116 (card n07, E-36) the reply note about applied rules uses the word "Followed", not "Used", and the Plans define what counts as following before any reply shows it. Inclusion alone never counts as following, so no reply shows "Followed" on the strength of included_teaching_ids alone. What counts as following, and what a reply shows when a rule's check fails or cannot run, is AMS-053.
gui_related: true
gui_classification_reason: The record backs a user-visible note on replies about applied rules.
depends_on: [AMS-018, AMS-025]
unblocks: [AMS-053]
acceptance_criteria:
  - Every reply whose context included taught rules carries included_teaching_ids naming each rule at its included version.
  - No reply shows "Followed" because a rule was included; "Used" is not substituted for it.
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
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-116
preserved_exact_tokens: ["included_teaching_ids", "Followed", "Used", "DL-116"]
negative_constraints:
  - Do not treat inclusion as proof that a rule was followed.
  - Do not show "Used" in place of the owner's word "Followed".
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-052 - Export Memory

```yaml
plan_unit_id: AMS-052
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Export memory is the command cmd.chat.memory.export {scope}, with scope gists | teachings | all, registered by the owner's decision DL-130 (card p15, E-32). One command serves both producers, the Export action of the Memory surface and the Export action of the taught-rules document. It exports the gists, the taught rules, or both that Memory shows for the current project through the artifact owner and returns an ArtifactExportResult; it adds no memory store and never changes, verifies, pins or discards what it exports. Each gist goes out with its verification_state as stored, so an Unverified gist is never exported as Verified, and its EvidenceRef entries go out as the pointers they are (AMS-006), never as copies of the referenced content. The command is available when assistant memory and artifact export are both available (assistant_memory_available && artifact_export_available). Its catalog row belongs to Plans/UI_Command_Catalog.md.
gui_related: true
gui_classification_reason: Export is a user-visible action on the Memory surface and the taught-rules document.
depends_on: [AMS-006, AMS-010, AMS-021]
unblocks: []
acceptance_criteria:
  - Both Export actions dispatch cmd.chat.memory.export with scope gists, teachings or all.
  - Exporting changes no gist, rule, verification_state or pin.
  - Exported gists keep their stored verification_state, and evidence is exported as pointers only.
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
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (WAIT part N-7, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-130
preserved_exact_tokens: ["Export memory", "cmd.chat.memory.export", "gists | teachings | all", "ArtifactExportResult", "verification_state", "DL-130"]
negative_constraints:
  - Do not mutate memory while exporting it.
  - Do not export an Unverified gist as Verified or inline evidence content.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
```

ContractRef: UICommand:cmd.chat.memory.export, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-053 - What Counts As Following A Taught Rule

```yaml
plan_unit_id: AMS-053
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  A taught rule counts as followed by a reply only when it was given to the Assistant for that
  reply in included_teaching_ids at its included version (AMS-051) and the finished reply passed
  that rule's check. The check compares the rule's testable statement at the included version with
  the finished reply; it runs once after completion, never on partial text, and changes no reply,
  rule or memory. For every included rule, rule_check_outcomes on the reply's saved context record
  stores the IncludedTeachingRef pair memory_id and normalized_fact_sha256, plus one outcome:
  passed, failed or could_not_run. Reopening
  the chat reads the saved outcome rather than rerunning the check (DL-138).
  The note uses the owner's Followed word (DL-116), counts only passed checks as Followed and failed checks as Missed. With both kinds, it
  shows one line, "Missed 1 of your rules · followed 2", with the Missed count first. A Missed note
  lets the user see the missed rule. Its ask-for-a-fix link reuses cmd.review.send_findings_to_agent
  with source_kind taught_rule_check, reply_message_id and missed_teaching_refs; it fills only an
  empty composer with an editable fix request and never sends or executes it (CWR-031, DL-138).
  A check that could_not_run earns no tick, counts neither way, and a reply with no passed or failed
  checks shows no rule note. A rule not included is never checked or counted. "Used" is never shown
  in place of Followed or Missed.
gui_related: true
gui_classification_reason: The Followed and Missed notes on a reply, and the way to see which rule was missed and ask for a fix, are user-visible.
depends_on: [AMS-051, AMS-018]
unblocks: []
acceptance_criteria:
  - The saved reply context records passed, failed or could_not_run for each included teaching ID and version, and reopening does not rerun the check.
  - A reply with passed and failed checks shows one line with the Missed count first and followed count second.
  - Asking for a fix fills an empty composer through the taught_rule_check variant and never sends or executes the draft.
  - A rule counts as followed only when it is in the reply's included_teaching_ids and the finished reply passed that rule's check.
  - A reply whose included rule failed its check shows "Missed 1 of your rules" (or the number that failed), lets the user see which rule, and offers a way to ask for a fix.
  - A rule whose check could not run is counted neither as followed nor as missed; with no passed or failed check the reply shows no rule note.
  - No check runs on partial text, and no check changes the reply, the rule or memory.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/FinalGUISpec.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c; DL-138, questions 18-19)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json (SHA-256 4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f)
  - Design lead ruling of 2026-09-27 on the DL-116 follow-up (the definition of following), recorded in Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-116
preserved_exact_tokens: ["Followed", "Missed 1 of your rules", "included_teaching_ids", "rule_check_outcomes", "could_not_run", "Missed 1 of your rules · followed 2", "cmd.review.send_findings_to_agent", "source_kind", "taught_rule_check", "reply_message_id", "missed_teaching_refs", "Used", "DL-116"]
negative_constraints:
  - Do not count a rule as followed because it was included, or because no check could run.
  - Do not hide a failed check behind a Followed count.
  - Do not start a fix, re-send or rewrite a reply from the check itself.
  - Do not show "Used" in place of the owner's word "Followed".
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Decision_Log.md#DL-116
