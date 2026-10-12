# Proposal: incremental local search for a research notebook

**Stage:** investigator / B03-P01-control  
**Basis:** released brief and one-time released plan in revealed-plan.md.  
**Evidence:** source IDs point to primary-source notes in sources/index.md and source-map.json. The plan is provisional; this does not authorize deployment.

## Proposed design

Keep the notebook store authoritative. Give every note a permanent opaque ID independent of filename, path and title, plus a monotonically increasing revision. Store note text only in the notebook. The local index keeps token postings and stable ID/revision needed to find a match; do not store a second title/body copy or use the index as the source for opening a note or rendering a snippet. Resolve every hit through the canonical store. A rename/move retains the same ID and opens the current note; a deleted or stale hit is reported and removed/retried.

Persist an ordered durable change event in the same authoritative transaction as each edit where the store permits it: sequence, stable ID, revision, and upsert/delete operation. The event need not contain note text. A single bounded local worker coalesces changes by note ID, reads the latest canonical revision, indexes only that version, and acknowledges the source event only after index commit succeeds. Recheck source revision before commit; if newer content or a tombstone arrived, supersede the older job. This makes replay idempotent and prevents a delayed retry from replacing newer content. Keep delete tombstones until acknowledged. Startup ID reconciliation is a repair check, not the deletion mechanism: an event gap must not lose the ID of a deleted note.

Keep tags as exact stable IDs. Preferred first design: keep the canonical note-tag relation authoritative and apply the tag intersection through that relation or a batched ID filter after lexical candidate retrieval. If measurement shows that is too slow, mirror stable tag IDs into the index and give tag changes durable events that refresh every affected note. Never tokenize tag labels as a substitute for exact membership. The efficient option depends on the actual store and query shape, which were not supplied.

Do not select an engine before identifying the actual store, supported OSes and shipped SQLite runtime. Prototype a scan baseline, then:

- **SQLite FTS5** if the app already uses SQLite and the shipped build includes FTS5. External-content mode reads from a same-database table and avoids a second row-content copy, but the app must keep it synchronized. Triggers do not backfill old notes; FTS5 rebuild deletes the current index before rebuilding it. Inspect the full trigger graph: SQLite records a specific problematic case where a second same-table AFTER UPDATE trigger performs a nested write; fold that mutation into the original update or avoid that pattern. [S-SQLITE-NESTED-TRIGGER-ISSUE] If asynchronous lag is required, a contentless local sidecar plus ID map/outbox is a candidate; contentless FTS5 cannot use the documented rebuild command and must be rebuilt as a new generation. [S-SQLITE-FTS5]
- **Tantivy 0.26.2** as a separate embedded Rust index where independent local files and custom tokenizer control are useful. Use one writer, index stable IDs, omit stored title/body, replace by delete-ID plus add-current-version, commit bounded batches, and then publish/reload the reader. Tantivy does not enforce primary-ID uniqueness; synchronization and deduplication remain app responsibilities. [S-TANTIVY-RELEASE-0262, S-TANTIVY-INDEXWRITER-0262, S-TANTIVY-UPDATE-EXAMPLE-0262]
- **Canonical-store scan** as a correctness oracle and possible first implementation if it meets measured latency at 20,000 notes. The count alone does not tell us text volume or responsiveness.

For either index, build a shadow generation while the current index remains searchable and editing stays enabled. Capture a consistent source snapshot and change-sequence watermark; page through the snapshot in bounded batches; apply later events to the shadow; reach a cutover barrier; verify integrity and coverage; atomically switch the active-generation pointer; retain the prior generation until the new reader opens. On cancel/failure, keep the old generation and show an actionable error. If the store cannot provide a consistent snapshot plus ordered change stream, solve that store-specific problem before promising a non-blocking rebuild. Do not use an in-place destructive rebuild as the user-facing recovery workflow.

### Query contract and saved queries

Keep query interpretation separate from indexing and reliability. Persist original query text plus a versioned parsed representation: explicit text mode (for example all terms, phrase or prefix), target fields, stable tag IDs, optional stable note IDs, and parser/tokenizer schema version. Compile this representation to FTS5 or Tantivy. Bind SQL values as parameters and separately validate engine query syntax; show parse errors rather than silently widening an invalid query. A saved query stores criteria, not current results. A note-title rename does not change its definition or a referenced note ID. If free text searches title content, the result set may naturally change when the title does; render the live title. Store tag IDs, not labels, as saved filters.

“All terms” as a default is a proposal, not an approved product decision. Phrase/prefix semantics, fields, case/diacritic behavior and error copy need owner approval before implementation. FTS5 and Tantivy expose engine-specific grammars, not a shared product query language. [S-SQLITE-FTS5, S-TANTIVY-TOKENIZERS-0262]

### Tokenization and language claims

Do not call an unspecified splitter “language-neutral” or promise coverage from Unicode support alone. FTS5 defaults to unicode61, based on Unicode 6.1: contiguous Unicode letters, numbers and private-use characters form tokens; punctuation and spaces separate them. It case-folds and removes Latin diacritics by default. It documents a rare multi-diacritic compatibility exception; option 2 changes that case but is not a general segmenter. The Polish ł/Ł forum report is a concrete fixture. [S-SQLITE-FTS5, S-SQLITE-DIACRITIC-ISSUE]

Tantivy 0.26.2 default splits on punctuation/whitespace, lowercases and drops tokens longer than 40 characters. Its en_stem is slower and English-specific. A historical CJK issue described a query/parser mismatch with a custom segmenter; that report is not proof of a current 0.26.2 defect. [S-TANTIVY-TOKENIZERS-0262, S-TANTIVY-CJK-ISSUE-718] For scripts without spaces, neither default should be assumed to split human words as desired. Build indexing and query fixtures for each declared script before claiming support. If needed, add a versioned custom tokenizer with migration/rebuild support. Evaluate stemming per language/field; do not stem all languages globally.

FTS5 trigram may help substring or identifier search, but changes semantics: full-text queries shorter than three Unicode characters cannot match, and some LIKE/GLOB patterns scan. It is an optional measured mode, not a replacement for lexical word search. FTS5 option parsing had a malformed-trigram-argument crash fixed in SQLite 3.46.1; pin/check the app runtime and test schema creation. [S-SQLITE-FTS5, S-SQLITE-TRIGRAM-ISSUE, S-SQLITE-CHANGES]

### Scheduling, status and recovery

Bound worker memory and CPU. Debounce repeated changes to one ID; batch by count, bytes and maximum delay. Prioritize editing over backlog drain. Record per-note failure, attempts, next retry and last error. Retry transient errors with capped backoff, allow manual retry, and never advance completeness past an unhandled record.

While stale/rebuilding, show indexed/total count where available, last successful sequence/time, oldest queue age, pending and failed counts, and rebuild progress. Keep last-good search usable but label it “updating” or “incomplete”; expose errors and retry/rebuild actions. Do not silently omit failures. Results contain stable IDs/revisions; opening fetches the current note. Missing or moved notes must not leave dead paths in the index.

Validate index schema, tokenizer version and structure before use. If missing, corrupt or incompatible, retain canonical data and build a replacement from it plus later events. Keep the old searchable generation until replacement is ready. For Tantivy, replay source events not acknowledged after commit; an open 2026 crash report illustrates why commit-level acknowledgement matters. Test the exact selected release rather than generalizing from an issue report. [S-TANTIVY-CRASH-ISSUE-3079, S-TANTIVY-INDEXWRITER-0262]

Contentless does not mean term-free: a local lexical index still exposes indexed terms. SQLite notes that deleted/updated postings can remain until merge unless FTS5 secure-delete is enabled. If at-rest recovery of erased terms is in scope, review that setting and SQLite core secure-delete with their cost. This is separate from the prohibition on making a competing content copy. [S-SQLITE-FTS5]

## Exact plan clause disposition

The clauses below follow the released plan in order. “Keep” means sound goal; “Correction” changes an unsafe/incomplete mechanism; “Optional” is evidence-gated; “Owner decision” remains unresolved.

| Plan clause | Disposition | Resolution / evidence |
| --- | --- | --- |
| 1. A derived index next to the notebook store. | Keep, conditional | Search state is derived/local. Placement depends on store/runtime; index loss must not lose notes. |
| 2. Each note has an internal identifier, title and content revision. | Correction | Make ID permanent and independent of title/path; revision monotonic and checked at commit. Tantivy example says it does not enforce a primary ID. [S-TANTIVY-UPDATE-EXAMPLE-0262] |
| 3. Queue updates after authoritative save. | Correction | Persist the outbox/change event atomically with canonical save when possible; enqueueing only afterward leaves a crash gap. Event stores ID/revision/op, not text. |
| 4. Queries combine free text with a tag filter. | Keep, clarify | Tokenized text plus exact stable tag-ID membership from canonical relation or synchronized ID mirror. |
| 5. Results link by identifier rather than path. | Keep | Resolve ID through current store at open and render current title/path. |
| 6. Saved query stores query text/filter expression, not result list. | Correction | Keep criteria and no result snapshot, but version AST/parser and use stable tag/note IDs, explicit modes and fields. |
| 7. No hosted service. | Keep, requirement | No note text leaves the local application. |
| 8. Replace indexed document on each new revision. | Keep, guarded | Logical replacement by stable ID; only publish the latest revision. |
| 9. Background worker batches and reports pending work. | Keep, expand | Bound/coalesce queue; show lag/errors/retries and keep editing responsive. Tantivy commit can block and add may block on full pipeline. [S-TANTIVY-INDEXWRITER-0262] |
| 10. Assume queue order matches save order, including older retry. | Reject / Correction | Queue order does not prove freshness. Use durable sequence and per-note revision/tombstone checks; supersede old retry before commit. |
| 11. Delete through same queue; reconcile IDs at startup. | Correction | Persist delete tombstone with authoritative edit and retain through ack. Startup reconciliation is a secondary repair, not sole deletion capture. |
| 12. Revision freshness and tag propagation unresolved. | Resolved recommendation | Compare source revision before commit and requeue if newer. Keep tag relation canonical or mirror with its own durable events. |
| 13. Start with “language-neutral” splitting/case folding. | Reject wording / Owner decision | No universal language-neutral splitting claim. Declare scripts, choose tokenizer and test. FTS5/Tantivy defaults have documented conditions. [S-SQLITE-FTS5, S-TANTIVY-TOKENIZERS-0262] |
| 14. Evaluate stemming or another tokenizer. | Optional, evidence-gated | Per-language/field. FTS5 Porter is English-oriented; Tantivy en_stem is English-specific/slower. Tokenizer changes need versioning/rebuild. |
| 15. Build second index and swap when complete. | Keep, correction | Add snapshot watermark, bounded backfill, concurrent event replay, cutover barrier, coverage/integrity check, atomic pointer switch, old-generation retention. |
| 16. Failed records remain visible in status. | Keep, strengthen | Show failed count/per-note error/retry, lag and incomplete indicator; do not mark complete past failures. |
| 17. Validate rename, edits, retry, deletion, multilingual search and interrupted rebuild. | Keep, expand | Add tag changes, commit/restart boundaries, stale-result handling, tokenizer migration, corruption, malformed query and latency/resource measures below. |
| 18. No engine selected and no performance measured. | Keep for now | No app repo/storage/profile was supplied. Compare scan, FTS5 and Tantivy after inventory; no measurement claimed here. |
| 19. Separate query semantics, reliability and semantic features. | Keep | Treat as separate decisions. Lexical/tag search first; semantic search is not recommended now. |
| 20. Provisional plan; no deployment requested. | Keep | This is a proposal only; no product code, release or deployment was performed. |

## Covered, rejected, optional and uncertain points

- **Already covered and retained from the plan:** derived local index, stable-ID result link, text plus tag search, no hosted service, background batching/status, visible failed records, rebuild into a second generation, proposed rename/edit/delete/multilingual/rebuild checks, no preselected engine or measured winner.
- **Rejected or corrected:** trusting queue order; queuing only after save without a durable outbox; relying on startup reconciliation alone for deletion; vague “language-neutral” splitting; title/path as identity; raw engine grammar as an unversioned saved-query contract; destructive in-place rebuild as the user-facing recovery flow.
- **Optional, evidence-gated:** FTS5 trigram substring mode, English stemming, custom per-script tokenizers, semantic retrieval. Semantic retrieval is not recommended for this scope.
- **Uncertain / owner decisions:** canonical store and transaction/snapshot abilities, target scripts, query modes, platform set, latency budgets, tag relation strategy, at-rest deletion policy, and whether semantic/local model costs are justified.

## Original brief traceability

| Brief obligation | Disposition |
| --- | --- |
| Search text and filter by tag | Local lexical candidate index plus exact stable tag-ID filtering. |
| Navigate to exact note | Opaque stable ID, current canonical lookup, no filename identity. |
| Rename/edit/delete during index work | Durable outbox, per-note revision checks, tombstones, coalescing and replay. |
| Excerpts in different scripts | No broad promise; target-script fixtures and versioned tokenizer choice. |
| 20,000 entries; useful while catching up | Bounded background writer; measured scan/FTS5/Tantivy choice; visible stale/incomplete state. |
| Saved query survives title change | Versioned criteria and stable IDs; do not use title as identity. |
| Rebuild without blocking edits | Shadow generation, change replay, cutover barrier and pointer switch. |
| Store authoritative; no competing content copy | Postings and IDs only; fetch note/snippet from canonical store. |
| No hosted service; no silent failures | Local engine; durable error/retry/status. |
| No permanent filename or unsupported language claim | Stable opaque ID; test every declared script. |
| Semantic search optional | Not recommended initially; later local-only cost/quality case requires owner approval. |
| Compare lexical/indexing approaches | Scan baseline, SQLite FTS5 and Tantivy 0.26.2 with conditions/limits. |
| Measurements and bounded sequence | Proposed metrics and seven integration steps below; no private benchmark. |
| Research proposal, not implementation | This document proposes only. |

## Validation status and proposed measures

**Executed:** Read the brief and released plan, and reviewed sources in sources/index.md. The one-time reveal helper recorded discovery SHA-256 84d177bf8aad0f5945df85d290825c5be3b0106fb3c4e0b6372433e03f5c558f (14,449 bytes). No target editor repository, callers or tests were provided or inspected. No downloaded code, app tests, integration checks, private-notebook benchmark or performance test was run.

**Proposed, not executed:** Compare the scan baseline and viable local engines using deterministic synthetic data, including 20,000 notes and larger headroom, with declared note/body-size distributions. Set budgets first. Measure edit/rename/delete p50/p95/p99 under idle, backlog and rebuild; search p50/p95/p99 cold/warm for common/rare/no-hit, phrase/prefix and tag-filtered queries; queue depth/oldest age/drain rate; rebuild time/cancel/restart; CPU, peak memory, index bytes, sidecar bytes and SQLite WAL/checkpoint growth. Compare result IDs with a canonical scan for every declared fixture.

Proposed race/recovery cases: rename/move retains ID and opens current note; rapid edits plus delayed old retry never publish an old revision; delete during worker read/index/retry leaves no openable hit; tag add/remove is reflected; duplicate/reordered events are idempotent; process death after store save but before indexing replays the event; death during/after index commit advances only an acknowledged cursor; missing/corrupt index or tokenizer mismatch preserves source data and offers rebuild; interruption at every rebuild phase keeps old generation searchable; saved queries load after note/tag renames; invalid query is rejected visibly; fixtures cover script, diacritics, combining marks, long tokens, punctuation, prefix and trigram short-query behavior.

## Bounded integration sequence

1. Inspect the actual editor repository, note-store schema, callers and tests. Record canonical transaction boundary, IDs, revisions, tags, supported OSes and shipped SQLite/FTS5 runtime. These inputs were unavailable here. For FTS5 external-content mode, also inspect current triggers for nested same-table writes before choosing the documented trigger pattern. [S-SQLITE-NESTED-TRIGGER-ISSUE]
2. Set latency/quality budgets and target scripts/query semantics with the owner. Build synthetic text/tag fixtures.
3. Define stable note/tag IDs, revision and ordered change log/outbox; prove durability for save/delete before selecting an engine.
4. Implement scan oracle and adapter returning IDs/revisions only. Compare FTS5/Tantivy only where actual store/platform supports them.
5. Add bounded/coalescing writer, freshness gate, idempotency, retries/tombstones and visible completeness state.
6. Add background shadow rebuild with snapshot/change watermark, catch-up barrier, integrity/coverage check and atomic generation switch.
7. Execute proposed correctness/interruption/performance checks; document limits and select from measured results. Keep semantic retrieval out of scope unless a later owner decision funds a separate local-only proposal.

## Owner decisions and unresolved facts

- Which scripts/languages must be supported, and what counts as a useful match for each?
- What is the canonical store, and can edits/change events share a transaction and consistent snapshot/watermark?
- Which platforms/filesystems must Tantivy support? For Windows, test exact selected version; the reported 0.25.0 ManagedDirectory race is conditional historical evidence, not proof against 0.26.2. [S-TANTIVY-WINDOWS-ISSUE-2847]
- Which query modes and saved-query compatibility are required: all terms, phrase, prefix, substring, fields, case and diacritics?
- What edit/query/catch-up/rebuild budgets define “remain useful”?
- Does data-retention policy require deleting term-posting residue in addition to omitting stored note content?
- Should tag membership be read live from canonical relation or mirrored after measurement?
- Is semantic search desired enough to pay local model/runtime/storage costs? The brief does not establish that need.

These are product decisions or missing implementation facts; none requires treating the provisional plan as endorsed.
