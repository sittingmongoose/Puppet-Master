# Source index — A3-01-control reviser

Each entry carries URL, version/commit or version uncertainty, locator, access UTC, observed operation, governing condition/default/exception, and applicability. Original S01–S11 and C01–C13 bindings are preserved; V01–V06 are new rechecks. Full records are in [source-map.json](../source-map.json).

## Original investigator sources S01–S11

### [S01 — SQLite FTS5](https://www.sqlite.org/fts5.html)
- **Version / commit:** Living, unversioned official manual accessed 2026-10-10; SQLite dependency/version in the target app is not selected.
- **Locator:** §2.1, §3–3.7, §4.3.1, §4.4.2–4.4.4, §5.1–5.2, §6.3, §6.7, §6.12–6.13
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened the official FTS5 manual and reviewed its query grammar, Unicode61 configuration, build options, external-content trigger examples/pitfalls, ranking/snippet functions, integrity-check, rebuild, and secure-delete commands.
- **Governing condition/default/exception:** FTS5 is a virtual-table module; same-table query syntax accepts an FTS query string. Default tokenizer is unicode61 (Unicode 6.1), case-independent, with remove_diacritics default 1; value 2 fixes its uncommon multi-diacritic Latin case. External-content indexes must be kept synchronized by the application; trigger creation does not backfill existing content; rank=1 requests external-content comparison for integrity-check; rebuild regenerates from the content table. BM25's better score is numerically lower; absent ORDER BY result order is arbitrary. FTS5 highlight/snippet insert caller-selected markup. secure-delete is off by default and can affect compatibility with older FTS5 formats.
- **Applicability:** Direct candidate evidence for FTS5 search syntax, tokenizer, same-database derived index, explicit maintenance/rebuild, relevance and excerpt risks. App SQLite version, schema, binary configuration and SQL wrapper remain unselected.

### [S02 — SQLite build configuration](https://www.sqlite.org/compile.html)
- **Version / commit:** Living, unversioned official manual accessed 2026-10-10; target SQLite build unknown.
- **Locator:** §7, SQLITE_ENABLE_FTS5 entry (official page lines 448–450 in retrieved version)
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened compile-time options documentation; inspected the FTS5 option description.
- **Governing condition/default/exception:** When SQLITE_ENABLE_FTS5 is defined in the SQLite amalgamation, FTS5 is added to that build. This does not establish that an arbitrary system or bundled SQLite enables it; official FTS5 build instructions also describe source-tree --enable-fts5 and a loadable extension.
- **Applicability:** A target build check is mandatory before selecting FTS5. Record actual SQLite version/source ID and compile options on Linux and Windows.

### [S03 — SQLite transaction model](https://www.sqlite.org/lang_transaction.html)
- **Version / commit:** Living, unversioned official manual accessed 2026-10-10; target SQLite version unknown.
- **Locator:** §2, Transactions; §2.1, read versus write transactions; §3, transaction error response
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened official transaction documentation and reviewed implicit/explicit transaction, one-writer, and error rollback descriptions.
- **Governing condition/default/exception:** Statements are automatically transactional unless a transaction already exists; explicit BEGIN persists until COMMIT/ROLLBACK; a write transaction permits reads and writes; SQLite allows only one simultaneous writer; certain full/I/O/interrupt/memory errors may cause automatic rollback.
- **Applicability:** Supports keeping note mutation and same-file FTS trigger changes in one source transaction. The implementation must still handle errors and selected VFS/storage behavior.

### [S04 — SQLite crash atomicity](https://www.sqlite.org/atomiccommit.html)
- **Version / commit:** Living, unversioned official technical article accessed 2026-10-10; rollback-mode description; target journal mode unknown.
- **Locator:** §1, §3.11, §4, §9.1–9.3
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened atomic-commit article; reviewed commit/recovery description and stated filesystem/VFS caveats.
- **Governing condition/default/exception:** The article's detailed algorithm applies to rollback mode, not WAL. It describes either-all-or-none transaction behavior under stated storage assumptions and automatic hot-journal recovery; it also warns that broken filesystem locking, partial file deletion, or hostile storage behavior can defeat assumptions.
- **Applicability:** Do not overclaim FTS5 crash behavior beyond a same-database transaction on the selected local, supported configuration. Validate the chosen mode on target OSes.

### [S05 — SQLite release history](https://www.sqlite.org/releaselog/3_43_0.html)
- **Version / commit:** SQLite 3.43.0, released 2023-08-24 (official release page)
- **Locator:** Release item 1
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened the official 3.43.0 release log.
- **Governing condition/default/exception:** This release added support for contentless-delete FTS5 indexes. The FTS5 manual says these contentless-delete tables are available as of 3.43.0; they allow deletion and replacement with specific restrictions.
- **Applicability:** Concrete version-history fact. Proposed architecture uses external content, not this table type; do not impose 3.43.0 solely from this unrelated option.

### [S06 — Tantivy tokenizer APIs](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)
- **Version / commit:** tantivy crate 0.26.2 (version-pinned docs.rs page)
- **Locator:** Module tokenizer lines 31–92, 123–152
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened version-pinned API docs for default/custom tokenizer pipelines and available filters.
- **Governing condition/default/exception:** Each text field names its tokenizer. The default tokenizer splits on punctuation/whitespace, lowercases, and removes tokens longer than 40 chars. Explicit pipelines are registrable. AsciiFoldingFilter maps Unicode alphabetic/numeric/symbolic characters to Basic Latin where an equivalent exists. Phrase search needs positional indexing; a field schema must select that option.
- **Applicability:** Candidate comparison only; explicit analyzer must be frozen in the index schema and applied to queries. It is not equivalent by definition to FTS5 unicode61 remove_diacritics=2.

### [S07 — Tantivy structured queries](https://docs.rs/tantivy/latest/tantivy/query/struct.BooleanQuery.html)
- **Version / commit:** docs.rs latest documentation displayed tantivy 0.26.2 at retrieval; direct version-pinned page open was unavailable to the browser tool
- **Locator:** BooleanQuery description/examples; companion PhraseQuery page https://docs.rs/tantivy/latest/tantivy/query/struct.PhraseQuery.html
- **Access UTC:** 2026-10-10T03:59:33Z
- **Observed operation:** Queried version-pinned API documentation for BooleanQuery and PhraseQuery; direct page-open returned an internal tool error for these two URLs, so recorded claims come from the returned docs.rs search-result content, not a successful direct open.
- **Governing condition/default/exception:** BooleanQuery combines Must/Should/MustNot clauses; PhraseQuery requires one field and positions; slop 0 means adjacent terms. Typed query nodes can represent the bounded adapter grammar without exposing Tantivy's raw query parser.
- **Applicability:** Candidate support for conjunctive terms, field alternatives, exact collection filters and phrases. Query layer needs the same tokenizer as indexed fields.

### [S08 — Tantivy writer and commit lifecycle](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html)
- **Version / commit:** tantivy crate 0.26.2 (version-pinned docs.rs page)
- **Locator:** IndexWriter::add_document, ::delete_term, ::commit, ::commit_opstamp
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened version-pinned IndexWriter docs and reviewed operation visibility and commit behavior.
- **Governing condition/default/exception:** Adds/deletes are visible to readers only after commit. A successful commit blocks until pending documents are published and persisted; it returns the opstamp of the last committed document. Delete-by-term affects prior committed docs and earlier operations in the same commit.
- **Applicability:** Tantivy commit lifecycle is separate from SQLite source transaction; application outbox/replay coordination is required to bridge the boundary.

### [S09 — Tantivy excerpt generation](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.SnippetGenerator.html)
- **Version / commit:** tantivy crate 0.26.2 (version-pinned docs.rs page)
- **Locator:** SnippetGenerator::create, ::set_max_num_chars, ::snippet_from_doc; example
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened version-pinned SnippetGenerator API docs and reviewed default bound and HTML example.
- **Governing condition/default/exception:** Default maximum snippet size is 150 characters and can be configured. Example converts the Snippet to HTML with highlight markup; documentation does not make that generated HTML the authoritative note content.
- **Applicability:** Do not blindly insert the result into UI HTML; render escaped source text/structured spans, using SQLite as source of truth.

### [S10 — Tantivy release history](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md)
- **Version / commit:** Version-pinned Tantivy crate changelog 0.26.2; history item Tantivy 0.20.1
- **Locator:** Tantivy 0.20.1 entry: fix building on Windows with mmap (#2070); current 0.26.2 section identifies its own bug fixes
- **Access UTC:** 2026-10-10T03:59:15Z
- **Observed operation:** Opened the version-pinned crate changelog and inspected release history including 0.20.1 and 0.26.2.
- **Governing condition/default/exception:** A historical Windows mmap build issue was fixed in 0.20.1; this is neither a current failure claim nor proof of support for the target's unknown compiler, features, and operating systems.
- **Applicability:** Use as a reason to verify the eventual pinned Tantivy build/open/reopen behavior on Windows and Linux; do not infer a current defect.

### [S11 — Tantivy score collector ordering](https://docs.rs/tantivy/latest/tantivy/collector/struct.TopDocs.html)
- **Version / commit:** docs.rs latest documentation displayed tantivy 0.26.2 at retrieval
- **Locator:** TopDocs description and order_by_score example; default score direction and score-tie DocAddress tie-break
- **Access UTC:** 2026-10-10T04:05:28Z
- **Observed operation:** Queried docs.rs for version-rendered TopDocs scoring/order semantics; result identified 0.26.2 and stated score sorting plus DocAddress tie-breaking.
- **Governing condition/default/exception:** TopDocs keeps top K documents sorted by score; order_by_score is decreasing BM25 similarity. Its documented stable tie-break is ascending DocAddress, not the application's public note ID.
- **Applicability:** The adapter must apply note-ID tie-breaking itself before pagination, or implement a collector using that key. DocAddress order is an index-location tie policy, not a durable public-identity contract.

## Independent critic checks C01–C13

### [C01 — SQLite FTS5](https://www.sqlite.org/fts5.html)
- **Version / commit:** Living, unversioned official manual; retrieved 2026-10-10
- **Locator:** §2.1; §3.1–3.7; §4.3.1; §4.4.1–4.4.4; §5.1; §6.3, §6.7, §6.12–6.13
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened official manual; checked grammar, Unicode61, external-content triggers/backfill, contentless deletion, ranking, integrity, rebuild, snippets, secure-delete.
- **Governing condition/default/exception:** External-content reads from a same-database content table but must be maintained by app; trigger creation does not backfill. Unicode61 defaults to L*, N*, Co; remove_diacritics=2 fixes multi-diacritic Latin cases missed by 1. External integrity comparison needs rank=1; rebuild reads source table; BM25 better scores lower; snippets add markup; secure-delete off by default.
- **Applicability:** Direct candidate evidence for S1–S4 and plan corrections, not evidence of deployed SQLite configuration.

### [C02 — SQLite build configuration](https://www.sqlite.org/compile.html)
- **Version / commit:** Living, unversioned official manual; retrieved 2026-10-10
- **Locator:** §7, SQLITE_ENABLE_FTS5
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened official compile-options manual and checked the FTS5 option.
- **Governing condition/default/exception:** Defining SQLITE_ENABLE_FTS5 for amalgamation includes FTS5; a loadable extension is also possible; arbitrary binary support is not implied.
- **Applicability:** Supports conditional FTS5 and need to inspect shipped Linux/Windows builds.

### [C03 — SQLite transactions](https://www.sqlite.org/lang_transaction.html)
- **Version / commit:** Living, unversioned official manual; retrieved 2026-10-10
- **Locator:** §2–2.1; §3
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened official transaction documentation and checked transaction lifecycle and writer concurrency.
- **Governing condition/default/exception:** Commands run in transactions; explicit transactions persist to commit/rollback; SQLite permits multiple readers but one simultaneous writer.
- **Applicability:** Supports same-database note/FTS transactions; exact app/VFS behavior remains untested.

### [C04 — SQLite crash atomicity](https://www.sqlite.org/atomiccommit.html)
- **Version / commit:** Living, unversioned official article; retrieved 2026-10-10
- **Locator:** §1–4; §9.1–9.3
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened article and checked mode scope and storage/locking assumptions.
- **Governing condition/default/exception:** Detailed algorithm is rollback-mode only; WAL uses a different mechanism. Filesystem and hardware assumptions apply; broken locking/storage can defeat them.
- **Applicability:** Supports the draft's qualifications, not any selected journal mode.

### [C05 — SQLite release history](https://www.sqlite.org/releaselog/3_43_0.html)
- **Version / commit:** SQLite 3.43.0, released 2023-08-24
- **Locator:** Release item 1
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened official 3.43.0 release log.
- **Governing condition/default/exception:** 3.43.0 added contentless-delete FTS5 indexes, which omit content and allow deletion.
- **Applicability:** Supports qualified correction; external-content proposal does not require 3.43.0.

### [C06 — Tantivy tokenizer APIs](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs
- **Locator:** Tokenizer overview; field configuration; AsciiFoldingFilter
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened pinned API docs and checked per-field tokenizer requirement and folding description.
- **Governing condition/default/exception:** AsciiFoldingFilter maps non-Basic-Latin alphabetic/numeric/symbolic chars to ASCII equivalents if available; not equivalent by definition to FTS5 Latin diacritic folding.
- **Applicability:** Supports separate analyzer policy and parity testing, not universal language claims.

### [C07 — Tantivy BooleanQuery source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/boolean_query/boolean_query.rs)
- **Version / commit:** Tantivy source tag 0.26.2
- **Locator:** boolean_query.rs#L3-L20, #L208-L217 (Must/Should and intersection/union)
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened tagged upstream source; checked Must/Should composition and typed query examples.
- **Governing condition/default/exception:** Must clauses intersect; typed BooleanQuery composes TermQuery/PhraseQuery; behavior depends on clause occurrence.
- **Applicability:** Independently verifies bounded query construction claim after original docs.rs page-open trouble.

### [C08 — Tantivy PhraseQuery source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/phrase_query/phrase_query.rs)
- **Version / commit:** Tantivy source tag 0.26.2
- **Locator:** phrase_query.rs#L4-L19, #L60-L74, #L97-L109 (phrase, slop, positions)
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened tagged source; checked adjacency and position requirement.
- **Governing condition/default/exception:** Zero slop requires adjacent terms; positions must be indexed; query targets a field.
- **Applicability:** Supports exact-phrase contract only with suitable schema.

### [C09 — Tantivy IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs
- **Locator:** delete_term, add_document, commit, commit_opstamp
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened pinned docs and checked commit visibility, persistence and opstamp behavior.
- **Governing condition/default/exception:** Adds/deletes become visible after commit; commit blocks until pending documents are published and persisted; it is separate from SQLite commit.
- **Applicability:** Supports outbox/replay rationale, not a cross-store atomicity guarantee.

### [C10 — Tantivy snippets](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.SnippetGenerator.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs
- **Locator:** Example, set_max_num_chars, snippet_from_doc, to_html
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened pinned docs and checked configured bound and HTML example.
- **Governing condition/default/exception:** HTML is generated presentation output, not authoritative note content; API permits a character limit.
- **Applicability:** Supports fetching current SQLite text and safe rendering.

### [C11 — Tantivy release history](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md)
- **Version / commit:** Tantivy 0.26.2 pinned changelog; history item 0.20.1
- **Locator:** 0.20.1 Windows mmap build-fix entry
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened pinned changelog and checked historical item and release context.
- **Governing condition/default/exception:** 0.20.1 records a Windows mmap build fix; it does not show 0.26.2 is broken or universally supported.
- **Applicability:** Supports historical implementation detail and platform validation.

### [C12 — Tantivy TopDocs API](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs
- **Locator:** TopDocs::order_by_score, docs.rs lines 203-206; method result carries DocAddress
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened pinned collector docs; checked decreasing BM25 direction and DocAddress results.
- **Governing condition/default/exception:** order_by_score sorts by decreasing BM25 similarity; DocAddress is an index location, not app identity.
- **Applicability:** Supports explicit app note-ID ordering.

### [C13 — Tantivy TopDocs tie-break source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/collector/top_score_collector.rs)
- **Version / commit:** Tantivy source tag 0.26.2
- **Locator:** top_score_collector.rs#L23-L25 and #L484-L490 (stable equal-score ordering and comparator)
- **Access UTC:** 2026-10-10T04:15:35Z
- **Timestamp note:** Grouped direct retrieval completed immediately before this clock sample; exact per-page request instants unavailable.
- **Observed operation:** Opened tagged source and checked stable ordering.
- **Governing condition/default/exception:** Equal score/sort keys are ordered by ascending DocAddress; this is not durable app note identity.
- **Applicability:** Directly verifies S11 with pinned primary source; original S11 binding remains unchanged.

## Reviser primary-source rechecks V01–V06

### [V01 — SQLite transaction control](https://www.sqlite.org/lang_transaction.html)
- **Version / commit:** Living official manual; last updated 2026-02-18; retrieved 2026-10-10. Target version unknown.
- **Locator:** §2, §2.1, §2.2; lines 32–51.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened official transaction manual; checked transaction lifetime, one-writer limit, and BEGIN IMMEDIATE behavior.
- **Governing condition/default/exception:** SQLite permits multiple readers but only one simultaneous write transaction. BEGIN IMMEDIATE starts a write transaction immediately and may return SQLITE_BUSY when another writer is active. This can fence writes in the same database; queue/retry behavior is application-owned.
- **Applicability:** Independent primary-source support for R1's cutover fence. The race is an architectural inference, not a documented SQLite defect.

### [V02 — SQLite FTS5](https://www.sqlite.org/fts5.html)
- **Version / commit:** Living, unversioned official manual; retrieved 2026-10-10. Target version/build unknown.
- **Locator:** §2.1; §3.1–3.2; §4.3.1; §4.4.2–4.4.4; §6.7; §6.12–6.13; §7.1; lines 455–482, 579–676, 985–995, 1037–1052, 1093–1227.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened official FTS5 manual and located Unicode61 categories, phrase tokenization, tokenizer lookup/tokenization API, external-content behavior, trigger/backfill rules, rank=1 integrity checking, rebuild, and contentless-delete conditions.
- **Governing condition/default/exception:** Unicode61 defaults to Unicode 6.1 letter/number/private-use token categories; punctuation and combining marks outside those categories are separators. xFindTokenizer/xTokenize expose configured tokenization, but arguments must match the FTS table. External-content rows read a same-database source table and remain the app's consistency responsibility; triggers do not backfill. External integrity comparison needs rank=1; rebuild reads the content table. Contentless-delete is version-qualified (3.43.0+) with distinct update/delete constraints.
- **Applicability:** Independent support for R3 and FTS5 query/lifecycle corrections; docs do not prove deployed binary capability.

### [V03 — Tantivy IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs.
- **Locator:** add_document/delete_term/commit; commit lines 178–186 and reader-visibility note.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened pinned IndexWriter docs and checked add/delete visibility and commit publication/persistence.
- **Governing condition/default/exception:** Pending additions/deletions become reader-visible after commit. Successful commit waits until pending documents are published and persisted and returns the last opstamp. It is not atomic with an app's SQLite transaction or outbox acknowledgment.
- **Applicability:** Independent support for R1 generation watermarks and R2 replay; cross-store coordination remains application architecture.

### [V04 — Tantivy tokenizer and analyzer](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)
- **Version / commit:** Tantivy crate 0.26.2, version-pinned docs.rs.
- **Locator:** Tokenizer overview/custom analyzers; TextAnalyzer; SimpleTokenizer; LowerCaser; AsciiFoldingFilter; positional field schema.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened and searched pinned tokenizer docs for analyzer registration, token stream, boundaries, folding, and positional schema.
- **Governing condition/default/exception:** TextAnalyzer tokenizes and modifies token streams. SimpleTokenizer splits on whitespace and punctuation; LowerCaser lowercases; AsciiFoldingFilter maps some alphabetic/numeric/symbolic Unicode characters to Basic Latin. Phrase fields need positions. This does not establish parity with SQLite Unicode61.
- **Applicability:** Independent support for R3's Tantivy analyzer/query construction; parity remains a proposed test.

### [V05 — Tantivy PhraseQuery implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/phrase_query/phrase_query.rs)
- **Version / commit:** Tantivy upstream source tag 0.26.2.
- **Locator:** new_with_offset_and_slop lines 42–58; slop lines 60–74; position requirement lines 97–109.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened tagged source and searched phrase, position, and slop implementation.
- **Governing condition/default/exception:** Phrase terms target one field; zero slop means adjacent terms; the field must index positions or phrase query construction returns a schema error.
- **Applicability:** Independent support for R3's same-field, adjacent phrase proposal.

### [V06 — Tantivy BooleanQuery implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/boolean_query/boolean_query.rs)
- **Version / commit:** Tantivy upstream source tag 0.26.2.
- **Locator:** Typed TermQuery/PhraseQuery examples lines 62–110; intersection/union lines 208–218.
- **Access UTC:** 2026-10-10T04:22:09Z–2026-10-10T04:25:06Z
- **Timestamp note:** Grouped direct retrieval window; exact per-page request times were not exposed. Window begins at the UTC clock sample immediately before the first open and ends at the sample after the final relevant source read.
- **Observed operation:** Opened tagged source and checked Must/Should typed-query composition and intersection/union helpers.
- **Governing condition/default/exception:** Must clauses implement intersection and Should clauses union subject to minimum-required-clause rules; typed query objects support adapter-owned query structure.
- **Applicability:** Independent support for R2's typed query design and R3's bounded Boolean contract.
