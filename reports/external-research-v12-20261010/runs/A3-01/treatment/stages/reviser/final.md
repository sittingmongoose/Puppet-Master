# Final recommendation — offline note-search adapter

Run: A3-01-treatment. Fixture: ER12-A3-01-FRESH. This is a complete recommendation and bounded plan for a local search adapter over 50,000 short notes. It is not an application implementation, editor build, sync build, benchmark, or completed validation.

## Recommendation

Use SQLite FTS5 external-content indexing as the first candidate, provided the exact SQLite library shipped in the Linux and Windows applications exposes FTS5 and the proposed query contract passes on those builds. Keep the existing SQLite database and note rows authoritative. Index title and body only; keep stable note IDs and collection membership in canonical SQLite rows/tables. An external-content FTS5 table stores tokens and postings without a second full copy of title/body, reads source values from a same-database content table for auxiliary operations such as snippets, and can be rebuilt from that content table. The index still consumes disk and needs trigger maintenance and reconciliation. [S01, S03, S04]

Keep Tantivy as a meaningful alternative if FTS5 is unavailable in a shipped build, its tested lexical behavior is inadequate, or a measured benefit justifies the sidecar lifecycle. Tantivy 0.26.2 at commit 72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d is a research reference, not a selected dependency. A Tantivy index lives separately from SQLite, so no SQLite transaction can atomically commit both stores. It needs a durable ordered outbox, idempotent replay, a reader-freshness barrier, a versioned rebuild path, and explicit handling of every indexed collection-membership change. No performance winner has been measured. [S07, S08, C05, R06]

This preference is conditional, not a finding that the deployed app currently has FTS5. The application binding, bundled/system library, version, build flags, schema, tag representation, journal mode, and actual write operations have not been supplied or probed. Do not select a dependency or assert target capability until Linux and Windows builds are identified and tested.

## S1 — bounded query and text policy

Offer an app-owned grammar instead of passing free-form user input directly to either engine.

- Limit input to 256 Unicode scalar values, at most 16 atoms, and at most 40 UTF-8 bytes per searchable token. Reject empty or punctuation-only input, unmatched or nested quotes, too many atoms, and over-limit input/tokens with an ordinary validation message. Malformed input must never become a match-all query.
- Split on whitespace and punctuation both outside and inside quotes. Unquoted tokens are ANDed in any order. A balanced quoted atom is an adjacent ordered phrase after tokenization. For example, canoe-kayak means both terms, while “old desk” requires the two adjacent tokens. Reject delimiter quotes inside a phrase in version one rather than inventing an escape syntax.
- Treat words such as AND, OR, and NOT as literal terms. Do not expose engine operators, field names, negation, wildcards/prefixes, NEAR, regex, arbitrary SQL, or match-all syntax.
- Parse once into typed terms and phrase atoms. For FTS5, serialize generated terms/phrases as quoted FTS expressions, escape an embedded FTS quote if that contract ever permits one, and bind the resulting MATCH value to fixed SQL. Binding prevents SQL injection but does not constrain FTS5's own query language. For Tantivy, construct typed term/phrase/Boolean queries; do not send raw user text into its broader QueryParser grammar. Tantivy 0.26.2 documents Boolean operators, field qualifiers, negation, ranges, phrases, prefix/slop, and a plain-star match-all query. The old malformed-query panic report is version-bounded and does not establish that 0.26.2 is affected or fixed. [S02, S10, S15, R07]
- For FTS5, explicitly choose unicode61 with remove_diacritics 2. The documented tokenizer uses Unicode 6.1 categories, splits spaces/punctuation, folds case, and removes Latin diacritics; option 2 addresses the documented multi-diacritic exception. This is not universal transliteration.
- For Tantivy, explicitly pin a SimpleTokenizer pipeline with lowercase, ASCII folding, and a 40-byte long-token rule. Pin filter order and apply the same query-length validation. Tantivy's filters and FTS5's Unicode tables are not equivalent by promise. Test precomposed/decomposed accents, ø, ß, combining marks, punctuation, and non-Latin text before making broader claims. Longer source tokens remain in authoritative notes but are outside the searchable contract. [S01, S09, C07]
- Do not add stemming, synonyms, fuzzy matching, substring search, or semantic retrieval without a demonstrated need and a new decision. Lexical matching and BM25 do not provide semantic understanding.

A collection filter is a required capability of the adapter, but the brief does not say that a user must select one for every search. Whether an absent filter searches all notes or is rejected, and whether multiple selected collections mean any or all, remain owner decisions. Keep the filter separate from free-text syntax. FTS5 can join by the canonical note key and bind the selected collection ID; Tantivy can combine the lexical query with an exact collection term/facet. Prefer immutable collection IDs for indexed terms and fetch display names from SQLite. If tags are stored or changed separately from a note row, the Tantivy event path must cover those changes too. [C05, R06]

## S2 — mechanism comparison and consistency cost

| Concern | SQLite FTS5 external content | Tantivy sidecar |
|---|---|---|
| Placement and content | FTS5 virtual table in the same database, over title/body. External content points at a same-database content table; it stores index entries, not a private title/body copy. | Rust search library with its own local index directory. Its schema and stored-field choices are separate from SQLite. |
| Create/update/delete | Insert/update/delete triggers keep token entries in the same SQLite transaction as the source row. Triggers do not backfill earlier rows; run a rebuild after installing them. | A single writer applies ordered operations from an SQLite outbox and commits to the index directory. A note update is delete-by-stable-ID plus add-current-document; a delete is delete-by-ID. Commit makes operations visible to readers. |
| Recovery and derived-data consistency | Compare against canonical content with FTS5 integrity-check using rank=1. Rebuild index entries from the content table. Neither operation deletes authoritative notes. | Acknowledge outbox sequence only after Tantivy commit. Replay after a crash, validate a sequence watermark, and rebuild a fresh index from an SQLite snapshot when needed. SQLite and Tantivy do not have a shared atomic commit. |
| Query behavior | MATCH has its own phrase, Boolean, column, NEAR, and prefix language. The adapter must serialize only its bounded AST. | QueryParser has a broader grammar; typed queries can express only the adapter's terms, phrases, conjunctions, and filter. |
| Collection changes | Keep membership outside full text and filter canonical rows. | If membership is indexed in each document, every membership insert/delete, note-embedded tag update, and any indexed rename must cause an ordered document refresh. A source-side join is possible only if candidate retrieval continues until the filtered result set is complete; a top-K search followed by dropping wrong-collection hits can silently omit matches. |
| Storage and excerpts | External content avoids a second full text copy; postings remain. FTS5 can obtain source-column text for snippets. | Built-in snippet examples store text in Tantivy. To reduce duplication, fetch canonical text by stable ID and produce a bounded plain-text excerpt in the adapter; measure either choice. |
| Cost | One transaction domain, subject to the selected SQLite journal, VFS, filesystem, and durability settings. | More lifecycle code: queue capture, lag, replay, watermarks, migration/versioning, platform tests, backups, and reconciliation. |

The FTS5 preference follows from SQLite already being the source of truth and the need for deletion, excerpts, and rebuild. It is not based on measured latency. Choose Tantivy only if the exact FTS5 capability or behavior is insufficient, or comparative measurements on a deterministic 50,000-note fixture support the extra lifecycle.

## S3 — write, crash, freshness, and rebuild plan

### Preferred FTS5 path

Use an external-content table over title and body. It needs a stable row key that can be represented by the FTS5 rowid/content_rowid mapping; the current SQLite schema is unknown. Preserve the public note ID in the canonical row and return it from there. If the app schema has no suitable integer key, decide on a surrogate key or another mapping before implementation.

Install database triggers for note insertion, title/body update, and deletion. For update/delete, remove old FTS token entries using the old rowid and old text, and add replacement values where applicable. Run trigger work in the same transaction as the canonical row write. Collection-only changes need no FTS rewrite when collection membership is not indexed as text and filtering reads canonical rows. After creating the table and triggers, run FTS5 rebuild inside a controlled migration/write boundary to populate existing notes. Triggers alone do not backfill old notes. On suspected drift, run external-content integrity-check with rank=1, rebuild from canonical content if it fails, then check again. Search-result joins suppress stale IDs but cannot detect missing indexed rows, so retain integrity/reconciliation. Never delete or modify authoritative notes as an index repair. [S03]

**M1 accepted and incorporated, conditional on the actual writer.** SQLite REPLACE deletes conflicting canonical rows before inserting the replacement. Its delete triggers fire only if recursive triggers are enabled. If a note write uses INSERT OR REPLACE and the effective setting is off, old FTS postings can survive while the insert trigger adds new postings. The schema and write SQL were not provided, so this is not an observed application defect. Either prohibit REPLACE for the indexed notes table and use explicit UPDATE/DELETE operations, or explicitly configure and test the necessary trigger behavior on every shipped connection, including conflicts on each unique key. The recursive_triggers setting affects statements on that connection; set/check it before preparing application statements if choosing that route. Do not infer its default from a generic page: SQLite's current pragma documentation, old release notes, and an earlier forecast do not support one universal deployment default. [C03, C04, R01–R05]

Record and test the actual journal_mode and synchronous setting. If WAL is used, keep the database and its WAL/SHM companion files together while connections are open; WAL is same-host, not a network-filesystem mode. SQLite's rollback-journal atomic-commit explanation has VFS/filesystem assumptions and does not describe WAL. FULL and NORMAL differ in power-loss durability, so choose deliberately and test the selected mode on both target OSes. A single SQLite transaction can couple the note row to FTS triggers; it cannot couple SQLite to a Tantivy directory. [S05, S16, S17, C10, C11]

For tokenizer or schema changes, create a new derived FTS table with the selected configuration, populate it from canonical notes, validate, then switch generations and remove obsolete derived state according to a migration plan. The authoritative database and notes do not need replacement. Ordinary contentless tables lack the content needed by FTS5's rebuild command; for contentless-delete, use a source-driven reindex procedure and validate it on the selected release. This is a derived-index migration, not a reason to replace the note database. [S03, R08]

### Tantivy alternative path

Keep SQLite authoritative. Add a monotonically ordered search-change sequence in SQLite and append an event in the same SQLite transaction as every change that can alter an indexed document: create/update/delete, title/body updates, and all collection-membership changes. If membership lives in a relation table, triggers on membership insert/delete must enqueue refreshes for the affected note IDs. If an indexed collection label is renamed, either use stable IDs so the indexed value does not change, or enqueue refreshes for affected documents. This is the correction for M2; the actual tag schema is unknown.

Use one local Tantivy writer. Consume events in sequence, refresh documents from canonical SQLite state, commit Tantivy, then acknowledge the applied sequence in SQLite. Do not advance the watermark before commit. If a process dies before commit, events remain pending. If it dies after Tantivy commit but before SQLite acknowledgement, replay; delete-by-exact-ID then add-current-document must be idempotent. Tantivy 0.26.2 documents that add/delete operations are published only on commit and that deletes affect earlier committed or earlier same-commit documents. It does not subscribe to SQLite relationships; the requirement to emit tag events is an application-level inference from this boundary. [S08, C05, R06]

On startup, validate index schema/tokenizer metadata and compare its applied source sequence with SQLite. Replay pending events in order. If the index or checkpoint is invalid, read all notes and collection membership from a consistent SQLite snapshot at sequence G, build a fresh versioned local index, drain events after G, validate it, and publish it only after it is caught up. Keep a prior generation until handoff succeeds. A sequence watermark must cover all relevant note and membership changes. An index join that suppresses deleted IDs does not detect missing documents; use reconciliation/counts/checksums or rebuild.

For each search request, capture a target SQLite change sequence. Return Tantivy results as complete only when the committed and reader-visible index watermark reaches that sequence; otherwise wait/retry or say search is updating. Recheck the source sequence before returning, or use a consistent snapshot rule that prevents a concurrent newer change from invalidating the claim. The default reader reload is delayed; explicit reload is available. Test this barrier and tag-change behavior. [S08, S18, C06]

Keep the sidecar in a local application-owned path. Do not host search or export notes or query text. On backup/restore, treat SQLite as authority and verify or rebuild the sidecar locally. Filter stale IDs against SQLite if useful, but do not treat that as missing-row detection.

## S4 — identity, order, and excerpt safety

Return the stable canonical note ID, title, collection context, score/rank, and one short excerpt. Never expose FTS rowid, Tantivy DocAddress, or the outbox sequence as note identity.

For FTS5, sort BM25 ascending because smaller numeric values are better, then use the canonical note ID as an explicit tie-breaker under one documented fixed collation. For Tantivy, order BM25 descending and tie-break on the canonical note ID with a custom collector or by sorting all matching candidates before applying the result limit. TopDocs ties use ascending internal DocAddress; that is not a cross-rebuild public identity. Scores depend on the corpus and analyzer. Promise a stable order only for an unchanged corpus, index schema, tokenizer, engine version, and collation. [S04, S11, C08]

The following excerpt limit is a proposed contract, not a brief requirement: at most 24 lexical tokens and 180 grapheme clusters, cut at safe text boundaries. FTS5 snippet accepts at most 64 tokens and can read external-content values; use no match markers for a plain-text excerpt or escape every segment before markup. Tantivy can fetch canonical text by ID and form the same bounded plain-text excerpt. Its Snippet fragment/highlight ranges do not establish that the HTML helper safely escapes user notes; do not render returned HTML without verifying escaping. Render note content as text, not markup. Test script-like text, quotes, controls, emoji, and long combining clusters. Do not claim universal language quality. [S04, S12, S19]

## S5 — component, version, configuration, and history limits

The latest observed upstream evidence snapshots are SQLite 3.53.4 (released 2026-07-24; source ID recorded as S06) and Tantivy 0.26.2 (released 2026-09-08; tag commit recorded as S07). These are documentation/release references, not app dependencies. Before claiming a feature exists in the product, record the runtime SQLite version/source ID, FTS5 create/drop probe, build options, library binding and system/bundled source on Linux and Windows. If Tantivy is selected, record Cargo.lock, crate/tag, target/toolchain, schema, tokenizer/filter order, and sidecar version. Those facts are currently UNKNOWN.

Relevant implementation/history boundaries:

- SQLite 3.43.0 introduced contentless-delete FTS5 indexes. Ordinary contentless tables do not support SQL UPDATE/DELETE and return NULL for their columns other than rowid; REPLACE is treated like an insert. Contentless-delete supports DELETE and INSERT OR REPLACE, and UPDATE only when all user-defined FTS columns are supplied; it does not support the FTS5 delete command. The current documentation says new code should prefer contentless-delete over ordinary contentless, not over external-content. External-content better fits canonical-text excerpts and content-table rebuild. This distinction corrects the user's unqualified “cannot delete or replace” assumption without claiming the app supports any mode. [S03, C01, C02, R08]
- An external-content table fetches needed values from its same-database content table; a plain contentless table cannot supply source text from its own columns. A contentless design can still fetch excerpt text by joining the canonical row, but it loses that convenience and source-driven repair still needs an explicit procedure. Changing a tokenizer calls for rebuilding/replacing the derived index generation; it does not require replacing authoritative notes or the SQLite database. [S03, S04]
- SQLite REPLACE/delete-trigger behavior depends on recursive_triggers. The 3.6.18 release note confirms the conditional. An older SQLite news item forecast that triggers would become recursive by default in 3.7.0, but the 3.7.0 release summary does not list that change; the current pragma documentation says they were initially OFF and may be turned on in a future version. An upstream SQLite Fossil source artifact shows SQLITE_DEFAULT_RECURSIVE_TRIGGERS defaults to 0 when the macro is undefined, but the artifact’s exact release association is unknown; build configuration can therefore affect the initial setting. This still does not identify the app build. [R09] Treat this as a source-history conflict and query/configure the actual shipped connection; the adapter design must not rely on a universal default. [R01–R05]
- Tantivy's malformed-query issue #3031 names Tantivy 0.22.1 / tantivy-query-grammar 0.22.0 for the reported panic; the linked fix-like commit is in a contributor fork. Tantivy 0.26.2's version-pinned QueryParser documentation gives its broad grammar and a Result error contract, but that does not prove this particular input cannot panic or establish whether the fork change shipped. Retain exact-version malformed-input/fuzz tests; claim neither current persistence nor current fix. [S07, S15, R07]
- Tantivy issue #2847 is an open report naming version 0.25.0 on Windows 10/11 NTFS during rapid commit/background-merge atomic writes. It is a targeted regression-test lead, not evidence that 0.26.2 is affected or fixed. Issue #3079 is an open, version-unspecified user report about files around a pre-commit process kill, not a confirmed recovery guarantee. Preserve both as bounded follow-ups if Tantivy is selected. [S13, S14]
- The earlier S10 source-map URL points to docs.rs/latest and is mutable. Its source ID remains unchanged and is not used as the pinned basis here; this final uses the versioned Tantivy 0.26.2 QueryParser URL in R07. [S10, R07]

## Exact released-plan dispositions and critic findings

| Item | Disposition | Final treatment |
|---|---|---|
| Preference to reuse SQLite; sketch with ID/title/body/collection search rows | Accept the preference; amend the sketch. | Prefer FTS5 external content over title/body. Stable note ID and collection relations remain canonical; filtering joins SQLite. There is still posting-list storage. |
| Avoid duplicating full note bodies | Accept as a disk goal with limits. | External content avoids a second full body copy. Contentless-delete remains an optional measured alternative if the owner accepts canonical-row excerpt retrieval and a source-driven reindex path. Do not trade away delete/recovery correctness. |
| “Contentless cannot support deletion or replacement” | Amend; configuration-specific. | True for ordinary contentless SQL UPDATE/DELETE constraints, but false without qualification because SQLite 3.43.0 contentless-delete supports DELETE and INSERT OR REPLACE, with a narrower UPDATE rule. No app capability is inferred. |
| “Excerpts require text inside the index” | Reject as universal. | FTS5 external content can fetch source values; contentless FTS columns do not return them, so join canonical SQLite. Tantivy can store body text or fetch by ID. |
| “Changing tokenizer always forces replacing the database” | Reject. | Rebuild or switch a derived-index generation from canonical notes; do not replace authoritative SQLite data. |
| Space-split AND queries and quoted phrases | Accept and refine. | Punctuation also separates terms; phrases use the chosen analyzer's adjacency; malformed input is rejected; engine operators remain inaccessible. |
| Collection is a separate filter | Accept with U1 unresolved. | A filter option must exist. Mandatory selection, all-collections behavior, multiple-selection any/all, tag cardinality, and rename semantics need owner/schema decisions. |
| Relevance order alone is sufficient | Amend. | Specify score direction and tie-break by canonical note ID. Limit rank-stability claims to fixed corpus/configuration. |
| Update a separate index after each SQLite commit | Reject as incomplete, not as an implementation fact. | Use a durable same-transaction outbox, ordered replay, commit-before-ack, complete watermark, and rebuild. Include every indexed collection change. |
| Authority, recovery, and no-partial-result concerns | Accept and preserve. | SQLite remains authoritative; stale-hit filtering cannot find missing rows; only serve sidecar results after a complete source-sequence barrier. |
| All S1–S6 clauses and negative constraints | Accept. | Each is explicitly mapped below; no scope clause is dropped. |
| Disk savings do not authorize broken delete/excerpt/recovery | Accept. | Storage is measured only alongside correct lifecycle behavior. |
| No benchmark or installed-build capability is verified | Accept as current status. | No performance or deployment capability claim is made. |
| Proposed synthetic validation from the plan | Accept as proposed work. | Equal scores, accents, punctuation, phrase boundaries, two collections, repeated edits/deletes, missing rows, interrupted writes, malformed input, and markup excerpts remain in the matrix below. None has been run. |

### Critic finding dispositions

- **M1 — SQLite REPLACE and trigger behavior: accept.** Independently checked SQLite ON CONFLICT documentation and the recursive-trigger pragma/release history. The failure mode is real if a conflicting REPLACE write occurs with the effective setting disabled; the application schema and writes are unknown. The plan now forbids such a write or requires explicit per-connection configuration and regression checks.
- **M2 — collection-membership events for Tantivy: accept.** Tantivy 0.26.2's writer accepts document operations and publishes changes on commit. It does not observe SQLite relations. The conclusion that a separate membership change needs an outbox/document refresh is an architecture inference from that boundary. Whether the actual schema separates membership is unknown.
- **U1 — mandatory/optional collection selection: accept as unresolved.** The brief requires a collection filter capability but does not specify whether selecting one is mandatory or whether several mean any/all. Do not silently set that product behavior.
- **U2 — polarity wording for negative constraints: accept and correct.** Each negative constraint below is marked accepted/complied. The prior draft's “rejected” labels were ambiguous and do not describe its actual design.
- **U3 — mutable docs.rs/latest locator: accept.** Preserve S10 unchanged for lineage; use the version-pinned 0.26.2 page R07 for parser claims. Do not silently rebind S10.

The critic's general view that FTS5 external-content is a defensible conditional preference and no principal capability correction was material-wrong is retained, with the two conditional completeness corrections above. Agreement is not treated as authority; the disputed claims were rechecked in primary documentation and release history. The source conflict about the recursive-trigger default is recorded rather than settled by whichever page looks newest. An upstream SQLite source artifact shows a compile-time default of 0 when its macro is undefined, but its release association is UNKNOWN; it cannot stand in for the app’s actual connection setting. [R09]

## Negative constraints — all accepted

| Exact constraint | Disposition |
|---|---|
| No hosted service. | Accepted. Keep all search/index operations local. |
| No network export of notes. | Accepted. Do not transmit notes or query text. |
| No whole editor or sync build. | Accepted. Scope remains the adapter, schema/index boundary, and validation plan. |
| No direct execution of user text as SQL. | Accepted. Use fixed prepared SQL, bound filter/limit values, an app-owned parser, and only generated FTS MATCH syntax. |
| No claim that lexical search provides semantic understanding. | Accepted. Describe token matching and BM25 only. |
| No deletion of authoritative notes during index repair. | Accepted. Rebuild or replace derived search state from canonical SQLite rows. |
| No unsupported universal capability-absence claim. | Accepted. Tie each capability to component/version/build/configuration/operation and retain deployment unknowns. |

## Owner decisions still open

1. Which SQLite binding and library source will ship on Linux and Windows; exact versions, source IDs, FTS5 build/extension policy, and runtime probe results.
2. Whether the canonical note table has a suitable integer FTS rowid mapping, whether note IDs are immutable, and how stable IDs sort.
3. Tag cardinality and schema: one/many tags, membership table versus note column, stable IDs, rename behavior, and which writes can affect membership.
4. Whether a collection must be selected for every query; if several are selected, whether they mean any or all.
5. Query/token limits, punctuation and quote policy, stopwords, accent behavior, combining marks, non-Latin text, and long tokens.
6. Result limit, title/body weighting, tie collation, and whether recency affects order.
7. Excerpt source (title/body), exact limit, highlighting policy, grapheme segmentation implementation/version, and rendering safety.
8. If Tantivy is selected, acceptable freshness lag, which component owns the outbox/replay worker, snapshot/catch-up protocol, and sidecar backup lifecycle.
9. Journal mode, synchronous setting, VFS/filesystem assumptions, backup behavior, and power-loss expectations.
10. Search-index/tokenizer migration window and criteria for retaining an older generation.
11. Whether synthetic 50,000-note measurements justify Tantivy or contentless-delete, and which latency/size/write/rebuild targets are acceptable.
12. For Tantivy snippets, whether body text is stored in the sidecar or fetched from canonical SQLite. Storage and privacy implications require measurement and review.

## S6 — validation matrix and execution status

No adapter test, application build, dependency installation/fetch, benchmark, Linux/Windows capability probe, or executable witness was run in this reviser stage. Read-only documentation and release-history review was performed. Every row below is proposed validation, not a completed check.

| Proposed check | Operation and observable result | Status |
|---|---|---|
| Runtime component/build provenance | On Linux and Windows record SQLite version/source ID, binding and bundled/system origin, build options, and successful FTS5 temporary virtual-table create/drop. If Tantivy is selected, record Cargo.lock, crate/tag, target/toolchain, schema and analyzer. | Proposed; not run |
| Query contract | Test AND, quoted adjacency, punctuation such as canoe-kayak, accents (café/cafe, decomposed forms, ø, ß), controls, operator-looking words, empty/punctuation-only input, unmatched/nested quotes and all length limits. Malformed input returns a validation error, not match-all or panic. | Proposed; not run |
| Collection filter and membership | Same lexical terms across two collections; no filter; one filter; multi-select any/all cases; membership insert/delete, move, and rename. Assert the documented semantics and that every Tantivy membership change is covered by the watermark. | Proposed; not run |
| Identity, score, and tie order | Equal-score notes; repeat search; update, insert/delete, and rebuild. Assert canonical note IDs, score direction, and stable ID tie-break for a fixed corpus/configuration. | Proposed; not run |
| CRUD and FTS trigger coupling | Create, title/body update, collection-only change, delete, bulk import, and every replacement/upsert path. If REPLACE exists, test conflict keys with recursive triggers on/off or reject the path. Assert source and derived state match. | Proposed; not run |
| Crash boundaries and freshness | Interrupt between source transaction and external index operation, before Tantivy commit, and after commit before acknowledgement. Restart/replay and issue a query while the watermark lags. Assert no incomplete result is called complete. | Proposed; not run |
| Missing/stale rows and rebuild | Deliberately omit/stale derived rows. Run FTS5 integrity-check rank=1/rebuild or Tantivy sequence reconciliation and snapshot rebuild. Assert search converges to SQLite and no note is deleted. | Proposed; not run |
| Safe excerpt and privacy | Markup-like text, quotes, controls, emoji and combining clusters. Assert token/grapheme bounds, plain-text/escaped rendering, and no note/query network export or body logging. | Proposed; not run |
| Release/platform regressions | Fuzz the exact pinned bounded parser; if Tantivy, stress rapid commits/merges on Windows for issue #2847's operation pattern and recover after process termination. Test exact FTS5/journal settings on both OSes. | Proposed; not run |
| Scale | Deterministic 50,000 short-note fixture for both viable approaches: cold/warm query latency, filter latency, index size, update/delete cost, and rebuild time. Record owner thresholds before selection. | Proposed; not run |

## Exact S1–S6 clause mapping

| Clause | Exact requested clause | Coverage |
|---|---|---|
| S1 | Describe a bounded query language, tokenization/normalization policy, and behavior for punctuation, accents, malformed queries, and a collection filter. | S1 defines the parser, limits, punctuation/phrase rules, analyzer choices, accent caveats, malformed-input handling, and separate collection filter with unresolved semantics. |
| S2 | Compare indexing/update mechanisms and query semantics of the two approaches; explain the cost of keeping derived content consistent with the source database. | S2 compares FTS5 triggers and Tantivy outbox/sidecar behavior, query models, storage, and consistency/recovery costs. |
| S3 | Define create/update/delete, crash recovery, and rebuild behavior, including stale or missing search rows. | S3 covers trigger updates, REPLACE caveat, outbox/replay, crash boundaries, freshness, reconciliation, and rebuild from SQLite. |
| S4 | Specify result identity, rank/order stability, and safe excerpt generation without claiming universal language quality. | S4 uses canonical IDs, explicit score directions/ties, fixed-scope stability, bounded excerpts, safe text rendering, and lexical-only claims. |
| S5 | Tie capability and limitation claims to the actual component, deployed version, build/configuration, and operation. Include one relevant implementation or release/history detail. | S5 distinguishes upstream SQLite/Tantivy references from the unknown app deployment, and records version-gated contentless-delete, Tantivy issue history, and SQLite recursive-trigger history. |
| S6 | Provide a small validation matrix and distinguish checks actually run from checks merely proposed; preserve explicit unresolved questions and decisions. | S6 labels every product check proposed/not run, records documentation review separately, and retains owner decisions above. |

## Sources and evidence

The source IDs S01–S19 and C01–C11 are copied with their original meanings and full identity metadata into the reviser source map. New independent checks use R01–R09. The index at sources/index.md links the sources, predecessor maps, locators, release boundaries, and source conflicts. No raw web capture was saved; no downloaded code was executed. Treat live documentation as live documentation, not a version pin.

## Native Goal activation record

The native Goal creation tool directly returned the following fields before substantive review:

- threadId: 01a1240e-3105-75a0-9bcf-55014555aa35
- objective: ER12 reviser stage, run A3-01-treatment: execute ER12_RUNTIME/runs/A3-01/treatment/stages/reviser/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.
- status: active
- tokensUsed: 0
- timeUsedSeconds: 0
- createdAt: 1791606303
- updatedAt: 1791606303
- remainingTokens: null
- completionBudgetReport: null

The frozen requested route was providerInstanceId AUTHORIZED_PROVIDER_INSTANCE, model gpt-6-luna, reasoningEffort max, serviceTier priority. Actual native Goal provider/model provenance was not exposed: UNKNOWN. Native ISO-formatted timestamp fields were not exposed: UNKNOWN. Raw returned numeric timestamp fields are retained above. The required science was saved before Goal completion; T3 task completion is not being used as proof of native Goal activation or terminal completion.
