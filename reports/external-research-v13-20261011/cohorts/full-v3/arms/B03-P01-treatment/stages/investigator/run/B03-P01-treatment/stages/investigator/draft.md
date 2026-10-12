# Draft proposal: Incremental search for a research notebook

## Review status and evidence boundary

This draft responds to the single released comparison plan, read only from revealed-plan.md. The reveal reported discovery SHA-256 64a0601d9cb4c96bb1e07a4e6dd115f67ac3e06f22f0f999343cded363ef1aa2, plan SHA-256 b0efb8261b14a8f968b4ccff9a188ebf1e7ce47309d0c9344d0ccb9f64cba43f, and one-time reveal at 2026-10-12T01:07:19.940Z. discovery.md is frozen and must not be edited. This is a source-backed proposal for review, not an implementation, benchmark, or deployment instruction.

No editor repository, app callers, app tests, note data, or private notebook were inspected. The plan does not identify the note-store engine, existing note identity, transaction model, tag schema, supported platforms, or packaging. The findings below separate observed source behavior from architecture recommendations and decisions that only the product owner can settle. Source IDs remain stable and are navigable through sources/index.md and source-map.json.

## Per-clause disposition of the released plan

| Clause | Disposition | Review, correction, or open question |
|---|---|---|
| P1.1 — Maintain a derived index beside the notebook store. | Accept with boundary. | Treat the index as disposable derived data. It stores terms/postings, immutable note ID, indexed revision, generation, and only necessary filter metadata. It must not store the note body/title as an authoritative or user-visible copy. Tantivy can omit STORED text fields; FTS5 default storage copies content unless external/contentless mode is selected (S01, S08–S10). Whether “beside” means same database or sidecar file is an owner/architecture decision. |
| P1.2 — Each note has an internal ID, title, and content revision. | Accept and make identity rule explicit. | The ID must be immutable across title/filename changes and stable across rebuilds. Revisions must be monotonic per note or derived from a monotonic source change sequence, and cover every field that affects a result, including tags if tags are indexed. Titles and paths are mutable display/navigation data. Existing store identity/revision support is unknown. |
| P1.3 — Queue updates after the authoritative save. | Accept the ordering; strengthen durability. | Saving canonical data first protects authority, but an in-memory or separately committed queue can be lost if the app crashes between save and enqueue. Prefer an outbox/change record in the same authoritative transaction as save and revision increment. If the store cannot do that, require a durable source sequence plus startup reconciliation before claiming complete coverage. A Tantivy commit cannot be atomic with a separate source store; replay and idempotence are required (S08, S11). |
| P1.4 — Query free text with a tag filter; link through ID rather than path. | Accept. | Search returns note IDs, not stored document copies. Resolve each result against the current canonical store, suppress deleted IDs, and use the current title. Tag filters use stable tag IDs. If tags are indexed in a sidecar, tag changes enter the same update/revision path; alternatively filter against canonical tag relations. Measure with the actual tag distribution. |
| P1.5 — Saved query retains query text/filter expression, not current results. | Accept and version the meaning. | Persist display text and a versioned structured query/parser representation; store tag IDs, not mutable tag labels. A saved search remains a search when a title changes. If a saved object means one particular note, store its immutable ID. Decide whether a title-scoped query should match the old title text, the renamed title, or both. |
| P1.6 — No hosted service. | Accept as hard constraint. | Do not transmit note text to a hosted search or embedding service. A local daemon is not selected either; it adds process/recovery work without a demonstrated need. |
| P2.1 — Replace the indexed document on a new revision. | Accept with ordering/freshness rules. | Apply the latest authoritative note snapshot. Use one bounded writer and serialize operations for a given ID. Tantivy update is delete-by-exact-ID plus add, visible at commit; the library does not enforce unique IDs. FTS5 delete/update rules differ between external-content and contentless-delete modes and depend on SQLite version (S01, S08, S11). |
| P2.2 — Batch requests in a background worker and show pending work. | Accept; add coverage and failure state. | The worker must not block editing, must coalesce repeated changes safely, and must report indexed-through sequence/time, pending notes, failed notes, and last successful commit. Batch/commit size and freshness latency require measurement. A pending count alone must not hide failed work. |
| P2.3 — Assume queue order matches save order, even when an old update retries late. | Reject this assumption; replace with monotonic revision checks. | Durable queues can replay late or out of order; never apply an old event snapshot over a newer document. On dequeue, re-read the latest source row and compare source revision with indexed revision. A late older event resolves to the latest snapshot or is discarded as superseded. Serialize same-ID writes and acknowledge only after commit. If source revision changes while indexing, keep/requeue the latest revision and do not report the note current. Search hits carry indexed revision and are checked against current note revision; suppress stale hits or mark them while the UI says results may be incomplete. Crash after commit but before queue acknowledgement is handled by idempotent latest-snapshot replay. Tantivy commit provides index visibility boundaries, not source/index transaction coupling (S08, S09, S11). |
| P2.4 — Delete through the queue and reconcile identifiers at startup. | Accept; retain durable deletion evidence. | A queued delete remains a tombstone until committed. Startup uses durable source sequence/index progress to replay missed work. If there is no reliable change log, reconcile source IDs to index IDs; measure cost and move a full scan to background if needed. Keep failures until deletion is verified. |
| P2.5 — Freshness proof and tag-update flow are unresolved. | Resolve as implementation requirements; mechanism depends on the store. | Record per-note indexed revision and a global sequence/generation. Tags participate in indexed revision or have their own versioned update record. Test tag add/remove/rename while a note update is in flight. Owner must choose AND/OR semantics and behavior for deleted/renamed tags. |
| P3.1 — Start with “language-neutral” splitting/case folding; evaluate stemming/other tokenizers. | Keep as a measurable baseline only; reject blanket language-neutral claims. | FTS5 unicode61 is based on Unicode 6.1, removes Latin diacritics by default, and does not transliterate Polish Ł to L. It is not language-aware segmentation. Tantivy default splits punctuation/whitespace, lowercases, and drops tokens longer than 40 characters; en_stem is English-specific and slower. FTS5 silently truncates tokens longer than 32,768 bytes. Test required scripts and long tokens; do not promise language coverage. Stemming/ngrams are optional choices whose recall, precision, storage, and query meaning must be evaluated (S01, S06, S10). |
| P3.2 — Build a second index and swap when complete. | Accept; specify the handoff rule. | Capture source sequence at build start, scan canonical notes with bounded reads, replay every durable change after that sequence, verify the candidate caught up to the live sequence, then atomically switch the active-generation pointer. Keep the last good generation until the switch is durable; normal outbox processing continues after cutover. Editing must not wait for the rebuild. For FTS5 contentless-delete, stream the source into a fresh table because there is no content table for FTS5 REBUILD; external-content REBUILD is a different mode that requires synchronization (S01–S03). |
| P3.3 — Keep failed records visible in an index-status view. | Accept and operationalize. | Preserve failed note ID/revision, error, last attempt, and retry state. Use bounded retry/backoff but do not erase exhausted records. Keep the last good generation usable with clear incomplete/degraded status; offer retry/rebuild. Never turn an indexer error into an empty successful search (S01, S08, S09). |
| P3.4 — Proposed validation covers rename, repeated edits, delayed retry, deletion, multilingual queries, interrupted rebuild. | Accept and expand; all are proposed, none executed. | Add stale retry after a newer commit, crash at source-save/index-commit/ack boundaries, title rename during build, tag changes during build, cached hit after delete, duplicate replay, old-index compatibility, corruption, and rebuild while editing. Use synthetic 20,000-note fixtures; the brief disallows a private-notebook benchmark. Include exact scripts/tokenization cases the owner selects. |
| P3.5 — No engine selected and no performance measured. | Accept. | Keep the decision open. Prototype FTS5 if source store/build fit; compare Tantivy if analyzer/lifecycle benefits justify two-store recovery. Keep a source scan as correctness baseline/degraded option. Issue #2932 reports many segments after per-record writer creation/commit in one downstream workload; measure commit policy rather than inferring a universal threshold (S02–S04, S08–S14). |
| P3.6 — Separate query semantics, indexing reliability, and optional semantic features. | Accept and keep tracks separate. | Define literal/advanced query behavior, saved-query parser version, tag rules, and ranking before worker tuning. Reliability/freshness and analyzers are independent validation tracks. Defer semantic search until lexical results show a measured need and owner sets local inference/storage budgets. |
| P4.1 — Provisional review draft; resolve assumptions with primary evidence and keep user-data questions open. | Accept. | This uses official SQLite/Tantivy docs, pinned crate source/example, SQLite release/test history, and issue reports. It does not infer the notebook's schema or call graph. Open questions below require product/store evidence or an owner decision. |
| P4.2 — No future deployment requested. | Accept. | This is a software proposal only. No deployment or source changes are requested or performed. |

## Recommended component shape

1. Canonical note store: immutable ID, mutable title/body, monotonic revision/change sequence, tag relations, and durable outbox/tombstone. Source text remains authoritative.
2. Derived search generation: token postings plus stable ID, indexed revision, generation and minimal filter metadata. No hosted index and no stored body/title. Add format/schema/tokenizer version.
3. One background writer: bounded batch/memory, per-ID serialization, latest-snapshot reads, monotonic freshness checks, durable retry state, and acknowledgement only after publication.
4. Query path: explicit literal-search semantics with optional advanced mode; stable tag IDs; ID+revision hits joined to current notes. Fetch title/content from canonical store. Suppress deleted/stale hits or label last-good results incomplete.
5. Recovery: retain last known-good generation; build shadow from source; replay post-start changes; verify coverage; atomically switch. On corruption/incompatibility report degraded state and rebuild; source data remains intact.
6. User feedback: freshness watermark, pending/failed counts, last success, rebuild progress/status, retry action, and honest empty/partial/error states.

### Candidate comparison without selecting a winner

- **SQLite FTS5:** first prototype if the note store is SQLite and shipped library includes FTS5. External-content avoids a second body copy but requires synchronization and trigger-order testing. Contentless-delete (SQLite 3.43.0+) permits deletion without stored text but has distinct rebuild rules. FTS5 build availability is a packaging condition. WAL still has one writer. Tokenizer/query defaults need explicit language decisions (S01–S07).
- **Tantivy 0.26.2:** embedded Rust sidecar; index IDs/revisions, not note bodies. Batch delete+add and commit; reader reload, segment/merge policy, and index-format migration are lifecycle work. Research package source SHA is 72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d; this is not an app dependency approval or claim about the version the app must ship. A package example is source evidence, not performance testing. A watcher-thread report is limited to 0.22.1 and index evict/reopen churn (S08–S15).
- **Store scan:** simplest correctness oracle and possible temporary/degraded mode, subject to measured latency and note-size distribution at 20,000 entries.
- **Semantic retrieval:** not in initial build. A local model avoids hosted transfer but adds inference/storage and another update dependency. No need or cost budget is established.

## Corrections, optional improvements, and owner decisions

### Corrections required

- Replace assumed FIFO delivery with revision-checked latest-source-snapshot processing; late retry must never roll back the index.
- Make source save plus durable change record atomic when possible; otherwise require a durable sequence and reconciliation.
- Include tag changes in freshness/version protocol or filter against current canonical tag relations.
- Preserve failures and distinguish pending, failed, stale, empty, and complete search.
- Define replay, verification, and atomic cutover for rebuild while edits continue.
- Treat tokenizers as bounded baseline behavior, not universal language support.
- Version query/analyzer/index format and plan migration/rebuild.
- Verify shipped SQLite FTS5 feature/version if selected. No hosted search.

### Optional improvements to validate

- Keep last good generation searchable during rebuild; expose progress, retry, last-success time, and pause/cancel if useful.
- Keep a scan path as a recovery oracle if it meets latency targets.
- Use one long-lived Tantivy writer and tune commit cadence by measurement; collect segments/cold-open cost.
- Consider SQLite contentless-delete sidecar only when feature/version floor is met; otherwise compare external content or Tantivy.
- Add ranking, prefix, phrase, trigram, stemming, synonyms, or semantic search only where tests show user value.
- Decide whether secure-delete is needed for the notebook threat model. FTS5's default can retain deleted-term entries until merge; secure deletion has performance and compatibility costs (S01).

### Owner decisions and unknowns

- What canonical store/transaction model and immutable note ID already exist? Can the store atomically append an outbox event?
- Are tags queried from source relations or copied as filter metadata? AND/OR behavior? What happens to saved filters after a tag is renamed/deleted?
- What does literal search mean: all/any terms, phrase, prefix, substring, case/accent rules? Is advanced grammar in scope?
- Which scripts and copied-excerpt cases are required? Are 1–2-character queries important? What happens to long tokens?
- What staleness budget and UI wording are acceptable? Should stale candidate hits be suppressed or marked?
- Which platform and bundled SQLite/Tantivy versions are required? Is a separate index file acceptable? What resource limits apply?
- What are search/edit p50/p95, visibility lag, backlog recovery, rebuild duration and peak resource targets?
- What should a saved query mean when title terms change: preserve literal text, follow note ID, or include rename alias? How should analyzer/query-parser upgrades migrate?
- Is there a demonstrated semantic gap after lexical evaluation? Which local model/inference/storage budget is acceptable?

## Validation proposals and executed work

### Proposed checks

- Build state-machine/fault tests with a synthetic 20,000-note corpus. Test rename, edit/edit, stale retry after newer save, delete during update, tag mutation, and duplicate replay.
- Crash-inject before/after source save, outbox commit, index write, index commit, queue acknowledgement, and generation switch. Verify canonical data survives, events replay, and stale revisions never claim currentness.
- Interrupt rebuild during scan and catch-up while edits continue; restart and verify replay/cutover without a full-duration edit lock.
- Run script fixtures for the owner-selected languages, Ł/diacritics, combining marks, no-whitespace excerpts, punctuation, case, short substrings, and overlength tokens. Check both query/index analyzer behavior and warning/error policy.
- Compare cold/warm search p50/p95, edit-save p95, commit-to-visible lag, backlog age, memory/CPU/disk, full rebuild duration/peak disk, SQLite WAL/checkpoint behavior, and Tantivy segments/cold open on packaged target platforms.
- Verify status semantics: pending/failed counts, last successful watermark, stale-result handling, empty vs error, open exact note after rename, retry/rebuild behavior.
- Exercise persisted-index upgrades, old format fixtures, compatibility range, and rebuild fallback. Check actual FTS5 compile feature/version at runtime if selected.

### Actually executed / observed

- Read the exact brief before independent discovery.
- Read primary SQLite FTS5, release, WAL, build, forum/Fossil and version-pinned Tantivy API/source/example/changelog/issue material. Conditions and source identities are in source-map.json.
- Wrote discovery.md and source-map.json before the single plan reveal; checked JSON parsing, source-ID coverage, and discovery byte count. The helper froze discovery SHA-256 64a0601d9cb4c96bb1e07a4e6dd115f67ac3e06f22f0f999343cded363ef1aa2.
- Read only revealed-plan.md after the reveal.
- No app source, caller, app test, benchmark, private notebook, downloaded-code execution, or implementation validation was performed. All checks in the preceding subsection are proposals.

## Remaining review questions

1. Is same-transaction outbox insertion available, or is a durable change sequence/reconciliation required?
2. Should stale hits be hidden or shown with a stale marker?
3. What freshness target permits the product to call results current?
4. Which query/tokenizer contract and script fixtures are required for the first release?
5. Are tag filters resolved from current source or versioned in the index?
6. Which engine is preferred after store/build feasibility and benchmark evidence?

## Proposal boundary

The proposal preserves the brief's constraints: local-only note text, canonical note storage, identity independent of path/title, visible index failures, explicit non-blocking rebuild, no uninvestigated language-coverage promise, semantic search deferred, no private-notebook benchmark, and no full editor rewrite. No implementation or deployment was requested or performed.
