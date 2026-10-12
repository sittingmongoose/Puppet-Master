# Proposal: incremental local search for a research notebook

**Run/stage:** B03-P01-control / reviser  
**Status:** Conditional software proposal; no implementation or product decision is authorized here.  
**Evidence boundary:** I reviewed the frozen brief, investigator discovery and draft, exact released plan, critic critique and source maps. I independently checked the consequential SQLite and Tantivy claims against the primary documentation, versioned library documentation/code, and the SQLite maintainer record indexed below. The supplied inputs do not identify or include the target notebook application's repository, schema, callers, or tests. I therefore make no claim about their current behavior and cannot complete target-application code/caller/test review. No application code, downloaded code, private notebook, benchmark, or test suite was run.

## Proposal

Make the notebook store the sole authority for note text, titles, paths, tags, and current note state. Search is a local, disposable derived index. Return an opaque permanent note ID and indexed revision from search; on open, resolve that ID through the canonical store and show its current title and location. If the note was deleted or changed since indexing, identify the hit as stale, do not open index-held content, and enqueue repair. Never use a filename, path, or title as permanent identity.

Do not store a second title/body copy or snippets as the route to a note. A lexical index necessarily retains token postings; “contentless” means the FTS table cannot return the original columns, not that it contains no information about indexed terms. If deletion policy requires old terms to become unrecoverable immediately, make that a separate retention requirement and evaluate FTS5 secure-delete and SQLite core secure-delete, including their cost. [S-SQLITE-FTS5](https://www.sqlite.org/fts5.html)

### Identity, updates, and freshness

Give each note a stable ID and monotonically increasing revision. Give tags stable IDs too. When possible, write an ordered change-log/outbox record in the same transaction as the canonical save/delete: sequence, note ID, revision, and upsert/delete operation. The event contains no note text. A rename or move preserves the note ID; a delete leaves a tombstone until its event has been acknowledged. Startup reconciliation can detect drift, but cannot replace a durable delete event because a deleted ID may no longer be discoverable from a current-note scan.

Use one bounded background writer. Coalesce pending events by note ID, fetch the latest canonical record rather than indexing stale UI-event text, and batch by size and maximum delay. Before publication, verify that the fetched revision is still current; discard or supersede stale work. Serialize index publication so an older retry cannot permanently replace a newer revision. If a concurrent edit lands after the last freshness check, its durable event must repair the index; meanwhile, compare the indexed revision with the canonical revision when opening a hit and label or suppress stale results. Acknowledge only events covered by a successful index commit. Keep a contiguous completeness watermark and do not advance it beyond an unhandled failure.

A separate index database cannot be assumed to commit atomically with the canonical database. With SQLite WAL, multi-database transactions are atomic per database file but not as a set; keep the durable outbox in the authoritative store and acknowledge it only after the index commit succeeds. [S-SQLITE-WAL](https://www.sqlite.org/wal.html), [S-SQLITE-ATTACH-ATOMICITY](https://www.sqlite.org/lang_attach.html)

For tags, apply exact stable-ID membership, not full-text token matching of tag labels. Start by joining/filtering against the canonical note-tag relation or by filtering candidate IDs in batches. Mirroring tag IDs into the index is an alternative only if measured query cost justifies the mirror and tag changes have durable propagation events. The required meaning of multiple selected tags—any selected tag or all selected tags—is unspecified and remains an owner decision.

### Query contract and saved queries

Keep query meaning independent of engine syntax and index lifecycle. Persist the original query text plus a versioned representation of its parsed criteria: explicit text mode (for example, all terms, phrase, or prefix), searchable fields, stable tag IDs, optional stable note IDs, and parser/tokenizer schema version. Compile that representation to the selected engine. Bind SQL values and separately validate/escape FTS query syntax. Show parse errors; never turn an invalid query into an unfiltered search.

A saved query stores criteria, not a result snapshot. Title changes do not change a saved query's definition or a referenced note ID. If the query searches title text, matches can naturally change when the title changes; render the current title from the canonical store. The default text mode, fields, phrase/prefix behavior, case/diacritic behavior, and invalid-query wording require owner decisions before implementation. FTS5 exposes its own phrase, prefix, Boolean, and column-filter grammar, so raw FTS syntax should not become the product compatibility contract. [S-SQLITE-FTS5](https://www.sqlite.org/fts5.html)

### Engine alternatives

No engine is selected. First identify the current store, supported platforms, SQLite build, typical note sizes, and save/query paths.

| Candidate | Advantages | Conditions and costs |
|---|---|---|
| Canonical-store scan | No derived-index drift or rebuild; direct correctness oracle and possible first implementation. | Cost grows with total text and query frequency. Twenty thousand notes alone does not prove it too slow. Run it off the UI thread and measure against budgets. |
| SQLite FTS5 | Local lexical search with phrases, prefixes, Boolean syntax, ranking, and relational tag filtering; a strong first prototype if the app already ships SQLite with FTS5. | Confirm the actual runtime/build. External-content FTS5 reads indexed columns from a table/view in the same database and requires the app to keep index and content consistent. Triggers do not backfill existing notes; the documented rebuild deletes the current FTS index before repopulating it. WAL permits concurrent readers and a writer, but only one writer exists, so same-database indexing can contend with edits. |
| Tantivy 0.26.2 | Embedded Rust library with a separate local index, explicit writer/commit lifecycle, and configurable tokenizers. A version-pinned example uses an indexed ID for replacement. | It has no enforced primary ID; uniqueness and canonical synchronization remain app responsibilities. Replace by delete-ID plus add-current-document, publish after commit, and keep title/body out of stored fields if the notebook must remain their only source. Commit blocks and add operations may block when the indexing pipeline is full, so bound and measure writer work. |

For FTS5 external-content mode, inspect the whole trigger graph and test the shipped runtime. A SQLite maintainer record documents a specific corruption report involving the standard FTS sync trigger plus a second same-table AFTER UPDATE trigger that performs a nested same-table write; the report names reproductions on SQLite 3.45.1, 3.45.3, and 3.53.2 and recommends folding the nested mutation into the original update. This is a conditional trigger-graph warning, not evidence that all external-content designs fail. [S-SQLITE-NESTED-TRIGGER-ISSUE](https://sqlite.org/bugs/info/552f36384c7900ef72448f71118f9c6fe8aa2553e7ef617ef7323c3d0f54b104)

If FTS5 needs asynchronous sidecar updates, keep an ID-to-rowid map and durable outbox. Choose the table mode explicitly:
- Ordinary contentless FTS5 tables do not support normal UPDATE or DELETE. The FTS5 delete command needs the original indexed values and rowid; after canonical deletion, those values may not be available.
- Contentless-delete tables, available since SQLite 3.43.0, support DELETE and INSERT OR REPLACE. UPDATE requires new values for every user-defined indexed column. They still cannot return source columns and the documented FTS5 rebuild command is unavailable for contentless tables.
- Therefore verify the shipped version and operation constraints before selecting either mode. Rebuild a sidecar as a new generation populated from a canonical snapshot plus later outbox events; do not issue the destructive in-place rebuild as the user-facing recovery path. [S-SQLITE-FTS5](https://www.sqlite.org/fts5.html)

A hosted search service receiving note text is excluded by the brief. A local service process is not justified by the evidence and adds lifecycle and recovery work. Semantic search is not recommended for the first lexical/tag release: it adds model/runtime size, compute, storage, tuning, and a second ranking behavior without a stated semantic use case. Revisit only with an owner-approved use case and a measured local cost/quality proposal.

### Tokenization and language coverage

Do not promise language coverage from “Unicode” or a generic splitter. SQLite FTS5's default unicode61 tokenizer is based on Unicode 6.1; it treats Unicode letter, number, and private-use runs as tokens, separates punctuation/space, case-folds, and removes Latin diacritics by default. It does not promise word segmentation for every script. Tantivy 0.26.2's default tokenizer splits on whitespace and punctuation, lowercases, and removes tokens longer than 40 characters; its en_stem tokenizer is slower and English-specific, while custom tokenizers can be registered. These defaults are concrete behaviors, not a multilingual quality guarantee. [S-SQLITE-FTS5](https://www.sqlite.org/fts5.html), [S-TANTIVY-TOKENIZERS-0262](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)

Before claiming a script is supported, build fixtures for each declared script and test indexing and query parsing together: terms with/without spaces, mixed-script copied excerpts, composed/decomposed forms, diacritics, punctuation, apostrophes/hyphens, one- and two-character terms, long tokens, and expected prefix or substring behavior. Version tokenizer/parser changes and rebuild the derived index when their schema changes. FTS5 trigram is an optional substring mode with different semantics; measure it separately rather than replacing lexical word search silently.

### Catch-up, failure visibility, and rebuild

Keep editing independent of queue drain and rebuild. Bound memory, CPU, and I/O; debounce repeated changes to one ID; use capped retry for transient failures; record attempts, error category, and next retry; expose permanent errors and manual retry. While indexing is incomplete, show a clear incomplete/updating state with pending and failed counts, last successful sequence/time, oldest pending age or lag, and rebuild progress. Keep last-good search available where possible, but explain that results may be incomplete. Do not report completeness past an unhandled event.

For explicit rebuild, retain the active generation as searchable while a worker builds a shadow generation from a consistent canonical snapshot and sequence watermark in bounded pages. Apply later durable events to the shadow, reach a cutover barrier, verify ID coverage and integrity, and atomically switch the active-generation pointer. Retain the old generation until the replacement opens successfully. On cancellation or failure, keep the old generation and show an actionable error. If the store cannot offer a consistent snapshot plus ordered change stream, design that capability before promising non-blocking rebuild. The same plan applies to a tokenizer/schema migration or a missing, corrupt, or outdated index; never reconstruct canonical note content from search results.

### Responsiveness evidence and proposed checks

No performance measurements or application validations were executed. After the target app is identified, define acceptance budgets before engine selection. Use deterministic synthetic data for 20,000 notes plus larger headroom, with declared note-count and body-size distributions. Compare scan, FTS5, and Tantivy only where the actual store/runtime/platform permits them.

Proposed measurements: editor save/rename/delete p50/p95/p99 with idle, backlog, and rebuild; cold/warm query p50/p95/p99 for common, rare, no-hit, phrase/prefix, and tag-filtered queries; queue depth/oldest age/drain throughput; rebuild and cancel time; CPU, peak memory, index bytes, and SQLite WAL/checkpoint growth. Compare result IDs to the canonical scan for every fixture.

Proposed correctness and recovery cases: exact stable-ID open after rename/move; repeated edits with an older delayed retry; delete during worker read, indexing, and retry; tag add/remove; duplicate and reordered events; process death after canonical save but before index update and before/after index commit; missing/corrupt index; tokenizer migration; failed record and retry; saved query across title/tag rename and parser-version migration; interruption/cancellation at each rebuild phase; invalid query handling; each declared script fixture. These are proposals, not checks run.

### Bounded integration sequence

1. Identify the actual repository, store/schema, callers, tests, canonical transaction boundary, stable-ID/revision model, tag relation, supported platforms, and shipped SQLite/FTS5 build. Inspect relevant save/delete and trigger code before choosing an architecture.
2. Agree on target scripts, query modes (including multi-tag any/all semantics), saved-query compatibility, and latency/quality budgets.
3. Build deterministic synthetic fixtures and a scan correctness oracle; measure scan responsiveness without private notebook data.
4. Prototype FTS5 and Tantivy only if actual store/runtime/platform permit. Compare query quality, edit contention, update lag, recovery, rebuild, and resource use on the same fixtures; choose conditionally from results.
5. Define durable ordered changes, tombstones, revision checks, bounded/coalescing worker, retries, and visible completeness state. Store only IDs/revisions/operations in the outbox.
6. Add shadow-generation rebuild, catch-up barrier, integrity/coverage check, and atomic generation switch; prove interruption and restart behavior while edits continue.
7. Run the proposed correctness and performance checks, record limits and owner decisions, then implement incrementally. Semantic search remains a separate later decision.

## Critique dispositions

- **C-01 — Accept and amend.** The critic correctly identified that contentless FTS5 CRUD behavior was missing. The proposal now distinguishes ordinary contentless from contentless-delete tables, states the SQLite 3.43.0 availability condition and update requirements, retains the rebuild limitation, and makes the candidate conditional on the actual shipped runtime and generation strategy. This is supported by the official FTS5 documentation, not by critic agreement alone.
- **C-02 — Retain as unresolved external input.** The assignment inputs contain no target application repository, callers, schema, or tests. No target-app integration claim is made. The pinned Tantivy library example is library code, not target-app code. Step 1 is the required next investigation.
- **C-03 — Accept wording correction.** The hard brief restriction is that note text must not be sent to a hosted search service. “No hosted service is planned” is a provisional plan statement and is not expanded into a separate blanket requirement about every service that might handle no note text. This proposal chooses no hosted search path.
- **C-04 — Retain uncertainty.** The brief and released plan do not say whether multiple selected tags use any-tag or all-tags semantics. Keep exact stable tag IDs; ask the product owner to decide any/all behavior before fixing query and saved-query compatibility.

## Released plan clause dispositions

| # | Exact plan point | Disposition |
|---|---|---|
| 1 | Derived index next to the notebook store | Keep conditionally; local disposable state; placement depends on store/runtime. |
| 2 | Internal identifier, title, content revision | Correct: permanent ID independent of title/path; monotonic revision. |
| 3 | Updates queued after authoritative save | Correct: durable event in same canonical transaction when possible; post-save enqueue alone has a crash gap. |
| 4 | Free text combined with tag filter | Keep: lexical candidate retrieval plus exact stable tag IDs; multi-tag any/all remains open. |
| 5 | Results link through identifier, not path | Keep: resolve current canonical note by ID at open. |
| 6 | Save query text and filter, not current results | Correct: versioned criteria/AST and stable IDs; do not persist result snapshots. |
| 7 | “No hosted service is planned” | Keep as plan status; separately retain the hard no-note-text-to-hosted-search restriction without upgrading it to a broader requirement. |
| 8 | Replace indexed document for each revision | Keep with freshness guard and idempotent stable-ID replacement. |
| 9 | Background batches and pending status | Keep and expand to bounded work, lag, failure, and retry visibility. |
| 10 | Assume queue order matches save order despite delayed older retry | Reject the assumption; fetch latest canonical revision, serialize publication, guard stale hits, and replay durable events. |
| 11 | Delete through same queue; startup ID reconciliation | Correct: durable tombstone is deletion mechanism; reconciliation is secondary repair. |
| 12 | Revision freshness and tag propagation unresolved | Resolve conditionally: revision checks and durable tag propagation; exact store/cost remain open. |
| 13 | “Language-neutral” splitting and case folding | Reject universal wording; choose/test behavior for declared scripts. |
| 14 | Evaluate stemming or another tokenizer | Keep optional and evidence-gated by language/field. |
| 15 | Build second index and swap; concurrent edits lack handoff | Keep and specify snapshot/watermark, event catch-up, barrier, integrity/coverage, pointer switch, old-generation retention. |
| 16 | Failed records visible in index-status view | Keep and strengthen with per-note failures, retry, lag, and incomplete status. |
| 17 | Validate rename, repeated edits, delayed retry, deletion, multilingual queries, interrupted rebuild | Keep and expand with tag, crash/commit, stale hit, corruption, migration, query, and resource cases. All are proposed, none run. |
| 18 | No engine chosen or performance measured | Keep; compare scan, FTS5, and Tantivy after app inventory; no result is claimed. |
| 19 | Separate query semantics, indexing reliability, optional semantic features | Keep as separate decisions; semantic search is not recommended initially. |
| 20 | Provisional draft; no deployment requested | Keep; this is a research proposal, not implementation or deployment. |

## Original brief coverage

- Search text, filter by tag, and navigate to the exact note: local lexical candidates, exact stable tag IDs, and canonical lookup by permanent note ID.
- Rename/edit/delete races: durable events, revisions, latest-source reads, serialized publication, tombstones, replay, and stale-hit handling.
- Copied excerpts in different scripts: no unsupported language promise; test each declared script with combined index/query fixtures.
- About 20,000 notes and usefulness while indexing catches up: do not infer performance from count; compare approaches against budgets and expose incomplete status.
- Saved-query meaning after title change: stable criteria and IDs; clarify that title-text matches may change while the saved query definition remains the same.
- Recovery and explicit rebuild without blocking edits: keep old generation searchable during background shadow build and catch-up; require snapshot/event-stream capability.
- Canonical store authority and no competing content copy: index postings/IDs only; read current note/title/path from canonical store.
- No hosted note-text search and no silent indexing failures: local design, visible state, per-note errors and retry.
- Filename is not permanent identity: opaque stable ID.
- Semantic search: not recommended initially; any later recommendation needs a local cost/quality case and owner approval.
- Alternative approaches, responsiveness measurements, and bounded sequence: scan/FTS5/Tantivy comparison and proposed metrics/steps above.
- Research proposal, not benchmark or full rewrite: no code, private-data benchmark, product test, or deployment was performed.

## Source index

The structured source identities, locators, exact URLs, access UTC, observed operations, source conditions, and applicability are in [source-map.json](source-map.json). The principal primary sources are [SQLite FTS5](https://www.sqlite.org/fts5.html), [SQLite WAL](https://www.sqlite.org/wal.html), [SQLite ATTACH](https://www.sqlite.org/lang_attach.html), [Tantivy 0.26.2 IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html), [Tantivy 0.26.2 tokenizers](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html), and its [version-pinned update example](https://github.com/quickwit-oss/tantivy/blob/0.26.2/examples/deleting_updating_documents.rs). The SQLite trigger record is a maintainer/forum artifact and is scoped only to its reproduced nested-trigger conditions.
