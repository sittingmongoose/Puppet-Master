# Independent primary evidence — A3-01 control

E01–E19 are reviewer retrievals, distinct from original S/C/V IDs. Full original responses and readable derivatives are retained. SHA-256 identifies retrieved bytes; conclusions come from source semantics. No downloaded code was executed.

[Assessment](../assessment.md) · [Structured assessment](../assessment.json) · [Source map](../source-map.json) · [Original inspection manifest](../original-inspected-manifest.json)

<a id="e01"></a>
## E01 — SQLite FTS5

- Primary URL: [SQLite FTS5](https://www.sqlite.org/fts5.html)
- Version/commit context: Living official manual, accessed 2026-10-10; target dependency not selected
- Locator: Sections 2.1, 3.1–3.7, 4.3.1, 4.4.1–4.4.4, 5.1, 6.7, 6.12–6.13, 7.1
- Access UTC: 2026-10-10T04:34:32.861612+00:00; HTTP 200.
- Local original: [E01-original.html](E01-original.html); readable: [E01-readable.txt](E01-readable.txt).
- Original SHA-256: `92b7e721147d5119781a80273b43708f2f146314d150abb4d3e6eff1503d6fe6`; 215354 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: FTS5 build enablement, grammar, Unicode61, external-content lifecycle, ranking, excerpts, integrity, rebuild, tokenizer API.
- Governing condition/default/exception: FTS5 amalgamation support starts at 3.9.0; build enablement is conditional. External content queries a same-database object and requires application synchronization. Default Unicode61 uses Unicode 6.1 L*/N*/Co categories and remove_diacritics=1; option 2 fixes a legacy multi-diacritic case. Category prose alone does not capture the combining-diacritic implementation exception (E15/E19). Contentless-delete starts in 3.43.0, supports DELETE/INSERT OR REPLACE and all-column UPDATE, and excludes the special delete command. External-content REPLACE uses ABORT. Rank=1 enables external-content integrity comparison; discrepancies produce SQLITE_CORRUPT_VTAB. Rebuild is unavailable for contentless tables. BM25 returns a real score with smaller being better. Snippet bound is tokens, 1–64, not the final custom 160-scalar limit. FTS secure-delete defaults to 0; enabling it affects format compatibility with pre-3.42.0 readers.
- Applicability: Governs the preferred released-component proposal and old-plan corrections; does not establish any deployed binary or schema.

<a id="e02"></a>
## E02 — SQLite build options

- Primary URL: [SQLite build options](https://www.sqlite.org/compile.html)
- Version/commit context: Living official manual
- Locator: SQLITE_ENABLE_FTS5 entry, readable lines 1348–1354
- Access UTC: 2026-10-10T04:34:32.866872+00:00; HTTP 200.
- Local original: [E02-original.html](E02-original.html); readable: [E02-readable.txt](E02-readable.txt).
- Original SHA-256: `c15500023d05072c838f9b9c5fdf3e14b150a485f9eed36d3dbe96877f78505e`; 135471 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Compile-time FTS5 enablement.
- Governing condition/default/exception: Defining SQLITE_ENABLE_FTS5 in the amalgamation adds FTS5. The arbitrary system or bundled binary is not thereby qualified.
- Applicability: Supports conditional recommendation and per-OS build qualification.

<a id="e03"></a>
## E03 — SQLite transactions

- Primary URL: [SQLite transactions](https://www.sqlite.org/lang_transaction.html)
- Version/commit context: Living official manual, last-update text 2026-02-18
- Locator: Sections 2.1–2.3 and 3
- Access UTC: 2026-10-10T04:34:32.868233+00:00; HTTP 200.
- Local original: [E03-original.html](E03-original.html); readable: [E03-readable.txt](E03-readable.txt).
- Original SHA-256: `b65dc308fd9e0ce471844c97366a4f5ad3a1f42833a3b19486ad7d6555a8e24e`; 27068 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Same-database write atomicity and BEGIN IMMEDIATE fence.
- Governing condition/default/exception: One simultaneous write transaction, multiple readers. BEGIN IMMEDIATE takes the write transaction immediately or returns SQLITE_BUSY; existing read transactions see a historical snapshot. Commit may be busy and may require retry; errors can roll back a statement or whole transaction.
- Applicability: Supports trigger/outbox transactions and cutover inference; not a cross-store atomicity guarantee.

<a id="e04"></a>
## E04 — SQLite atomic commit

- Primary URL: [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html)
- Version/commit context: Living official technical article
- Locator: Introduction, sections 2–4 and 9.1–9.3
- Access UTC: 2026-10-10T04:34:32.869358+00:00; HTTP 200.
- Local original: [E04-original.html](E04-original.html); readable: [E04-readable.txt](E04-readable.txt).
- Original SHA-256: `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`; 77968 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Crash recovery and storage assumptions.
- Governing condition/default/exception: The detailed article describes rollback mode, while WAL provides atomicity by a different mechanism. Locking, flush and filesystem assumptions matter.
- Applicability: Supports qualified crash discussion; no target VFS/journal configuration has been tested.

<a id="e05"></a>
## E05 — SQLite release history

- Primary URL: [SQLite release history](https://www.sqlite.org/releaselog/3_43_0.html)
- Version/commit context: SQLite 3.43.0, 2023-08-24
- Locator: Release item 1; source-ID field
- Access UTC: 2026-10-10T04:34:32.870537+00:00; HTTP 200.
- Local original: [E05-original.html](E05-original.html); readable: [E05-readable.txt](E05-readable.txt).
- Original SHA-256: `a3a5619b15570a64c864514ce4716c37929d7f8918e68ee5bec63ecc40cd87d9`; 6966 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Introduction of contentless-delete.
- Governing condition/default/exception: 3.43.0 adds contentless-delete FTS5 indexes. It is a distinct configuration from external content.
- Applicability: Supports version-qualified correction without imposing a needless 3.43.0 minimum on the preferred mode.

<a id="e06"></a>
## E06 — Tantivy tokenizer APIs

- Primary URL: [Tantivy tokenizer APIs](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html)
- Version/commit context: Tantivy 0.26.2
- Locator: Default/raw/custom-tokenizer sections and filter list
- Access UTC: 2026-10-10T04:34:32.871734+00:00; HTTP 200.
- Local original: [E06-original.html](E06-original.html); readable: [E06-readable.txt](E06-readable.txt).
- Original SHA-256: `28f76a147756bc1247bc8c0a03f6eb54e8bb542b433ad27e83fcfc7b017dc57e`; 47675 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Per-field analyzers and typed-query normalization.
- Governing condition/default/exception: Default analyzer lowercases and drops tokens over 40 characters; the final explicit SimpleTokenizer/LowerCaser/AsciiFoldingFilter pipeline does not include RemoveLongFilter. Field tokenizer names must be registered. Folding does not imply Unicode61 parity.
- Applicability: Supports comparator and explicit analyzer proposal; target Cargo version/features remain open.

<a id="e07"></a>
## E07 — Tantivy BooleanQuery implementation

- Primary URL: [Tantivy BooleanQuery implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/boolean_query/boolean_query.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: BooleanQuery documentation; intersection/union methods, raw lines 218–230
- Access UTC: 2026-10-10T04:34:33.094711+00:00; HTTP 200.
- Local original: [E07-original.txt](E07-original.txt); readable: [E07-readable.txt](E07-readable.txt).
- Original SHA-256: `6905f9a33c60c21dafd9c9329fce2c5ccc95c376e2346de456a05e89cca5160b`; 17913 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Nested typed Boolean queries.
- Governing condition/default/exception: Must intersects required clauses; Should supports alternatives under the occurrence/minimum-required-clause rules. Typed terms are supplied by the caller rather than automatically analyzed by these constructors.
- Applicability: Supports AND across atoms and title/body alternatives; no raw parser is needed.

<a id="e08"></a>
## E08 — Tantivy PhraseQuery implementation

- Primary URL: [Tantivy PhraseQuery implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/phrase_query/phrase_query.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: PhraseQuery::new, ::new_with_offset_and_slop, raw lines 29–57; phrase_weight position check
- Access UTC: 2026-10-10T04:34:33.121202+00:00; HTTP 200.
- Local original: [E08-original.txt](E08-original.txt); readable: [E08-readable.txt](E08-readable.txt).
- Original SHA-256: `74fb5880b381da11a238f934879466dff81345d5b765b3b58bf8b51e318935c8`; 5313 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Exact phrase construction and exceptions.
- Governing condition/default/exception: All terms must share a field; positions must be indexed; slop defaults to zero. Constructors require more than one term and assert for a singleton/empty list.
- Applicability: Governs final line 30; the unhandled one-term quoted phrase is F3.

<a id="e09"></a>
## E09 — Tantivy IndexWriter API

- Primary URL: [Tantivy IndexWriter API](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html)
- Version/commit context: Tantivy 0.26.2
- Locator: add_document, delete_term, commit, commit_opstamp
- Access UTC: 2026-10-10T04:34:33.136184+00:00; HTTP 200.
- Local original: [E09-original.html](E09-original.html); readable: [E09-readable.txt](E09-readable.txt).
- Original SHA-256: `f2b22513e42f73f9efb998d901bc8cb33cf7f804a2a92a9faece3a55abfd72bf`; 111454 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Mutation order, publication and persistence.
- Governing condition/default/exception: Commit waits for pending documents to be published/persisted and returns an opstamp. delete_term affects prior documents and additions earlier in the same commit. Publication is not an automatic guarantee that an existing IndexReader/Searcher is reloaded (E13).
- Applicability: Supports outbox replay and its cross-store boundary; also identifies the need to investigate reader visibility.

<a id="e10"></a>
## E10 — Tantivy snippet implementation

- Primary URL: [Tantivy snippet implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/snippet/mod.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: Snippet::to_html raw lines 149–164; DEFAULT_MAX_NUM_CHARS and SnippetGenerator
- Access UTC: 2026-10-10T04:34:33.147279+00:00; HTTP 200.
- Local original: [E10-original.txt](E10-original.txt); readable: [E10-readable.txt](E10-readable.txt).
- Original SHA-256: `7b2bda5b56fa47489f99253138fef66be62f71297f797ac4195aed70a97fdd94`; 31929 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Excerpt safety and default bound.
- Governing condition/default/exception: The default bound is documented as 150 characters. to_html escapes fragment text through encode_minimal, but inserts configured prefix/postfix markup. It does not provide authoritative current SQLite text.
- Applicability: Final custom escaped/plain-text rendering is sound; no universal absence of safe built-in rendering is inferred.

<a id="e11"></a>
## E11 — Tantivy release history

- Primary URL: [Tantivy release history](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/CHANGELOG.md)
- Version/commit context: Changelog at upstream tag 0.26.2; historical release 0.20.1
- Locator: Raw lines 283–285
- Access UTC: 2026-10-10T04:34:33.179727+00:00; HTTP 200.
- Local original: [E11-original.txt](E11-original.txt); readable: [E11-readable.txt](E11-readable.txt).
- Original SHA-256: `702320ebbfe1ab5057d646c7647a834024e07c5741ab040a4113f5d3e446c645`; 59164 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Windows mmap build-fix history.
- Governing condition/default/exception: The 0.20.1 entry records a Windows mmap build fix linked to issue 2070. It is not proof of a defect or successful target deployment at 0.26.2.
- Applicability: Meets the implementation/history obligation and motivates per-OS validation.

<a id="e12"></a>
## E12 — Tantivy TopDocs implementation

- Primary URL: [Tantivy TopDocs implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/collector/top_score_collector.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: TopDocs doc comment raw lines 26–29; order_by_score lines 225–227
- Access UTC: 2026-10-10T04:34:33.195524+00:00; HTTP 200.
- Local original: [E12-original.txt](E12-original.txt); readable: [E12-readable.txt](E12-readable.txt).
- Original SHA-256: `98e11e76083154af5a00e95e843df74b7163eef0f0e8b324e2b1f0ee3c352cce`; 70605 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Score direction and tie key.
- Governing condition/default/exception: Score order is decreasing BM25 similarity; equal sort keys use ascending DocAddress. This is an index-location identity, not public note ID.
- Applicability: Supports collecting/sorting by stable application ID before pagination.

<a id="e13"></a>
## E13 — Tantivy IndexReader implementation

- Primary URL: [Tantivy IndexReader implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/reader/mod.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: ReloadPolicy and default raw lines 15–29, 47–55; IndexReader::reload/searcher lines 277–303
- Access UTC: 2026-10-10T04:34:33.258072+00:00; HTTP 200.
- Local original: [E13-original.txt](E13-original.txt); readable: [E13-readable.txt](E13-readable.txt).
- Original SHA-256: `8a064863b7c59d829133652c7f5eae281381c939055a7f6681b368a487580b9d`; 10474 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Committed versus loaded search state.
- Governing condition/default/exception: Default OnCommitWithDelay asynchronously reloads after commit; Manual never automatically reloads. searcher() lends the last loaded segment snapshot, and a fresh searcher should be acquired for each query. A writer commit watermark can be newer than the actual searcher.
- Applicability: Source-backed F2: writer-applied/source watermark equality alone does not prove query completeness.

<a id="e14"></a>
## E14 — Tantivy SimpleTokenizer implementation

- Primary URL: [Tantivy SimpleTokenizer implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/tokenizer/simple_tokenizer.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: search_token_end and TokenStream::advance, raw lines 33–58
- Access UTC: 2026-10-10T04:34:33.259664+00:00; HTTP 200.
- Local original: [E14-original.txt](E14-original.txt); readable: [E14-readable.txt](E14-readable.txt).
- Original SHA-256: `0c9d5fcf250ae4879c25a155133ec0baa947cf03e76db63523c004b6e28a0a34`; 2641 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Exact token boundaries.
- Governing condition/default/exception: Token characters are selected through char::is_alphanumeric; other characters delimit tokens. Thus a decomposed combining mark can split a token before the later folding filter is applied.
- Applicability: Shows why the comparator analyzers are not definitionally equivalent and why the Unicode61 exception matters.

<a id="e15"></a>
## E15 — SQLite Unicode61 tokenizer implementation

- Primary URL: [SQLite Unicode61 tokenizer implementation](https://raw.githubusercontent.com/sqlite/sqlite/version-3.43.0/ext/fts5/fts5_tokenize.c)
- Version/commit context: SQLite source tag version-3.43.0
- Locator: fts5UnicodeTokenize raw lines 507–517
- Access UTC: 2026-10-10T04:34:33.282220+00:00; HTTP 200.
- Local original: [E15-original.txt](E15-original.txt); readable: [E15-readable.txt](E15-readable.txt).
- Original SHA-256: `e456059ed3af8cb57bd570fed345cab23942b122b3cc699d8c39b990ff02531b`; 38035 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Combining-diacritic continuation.
- Governing condition/default/exception: While inside a token, recognized diacritics are accepted independently of the category test and then folded. With removal enabled the mark can disappear without splitting the token.
- Applicability: F1 governing released-source exception; not a claim that every combining mark or every spelling is canonically equivalent.

<a id="e16"></a>
## E16 — Tantivy IndexWriter implementation

- Primary URL: [Tantivy IndexWriter implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/indexer/index_writer.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: commit/delete_term/add_document methods
- Access UTC: 2026-10-10T04:34:33.303294+00:00; HTTP 200.
- Local original: [E16-original.txt](E16-original.txt); readable: [E16-readable.txt](E16-readable.txt).
- Original SHA-256: `c90b2fbb9e6b905de2cd24e655bfc2444d4943d2d60fcbd19cb1506f5a06422f`; 98059 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Cross-check of API lifecycle.
- Governing condition/default/exception: Writer operation ordering and its own commit boundary are implemented within the Tantivy index; there is no SQLite transaction integration here.
- Applicability: Corroborates outbox inference; not executed code.

<a id="e17"></a>
## E17 — Tantivy ASCII folding implementation

- Primary URL: [Tantivy ASCII folding implementation](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/tokenizer/ascii_folding_filter.rs)
- Version/commit context: Upstream tag 0.26.2
- Locator: Filter declaration, transform and token stream; raw lines 5–70
- Access UTC: 2026-10-10T04:34:33.303662+00:00; HTTP 200.
- Local original: [E17-original.txt](E17-original.txt); readable: [E17-readable.txt](E17-readable.txt).
- Original SHA-256: `403efac42fd2c33a4803f4cdecef32630f0b3a4ca099134bfe1629738274bbef`; 203312 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Folding after tokenization.
- Governing condition/default/exception: Alphabetic, numeric and symbolic characters with ASCII equivalents can be transformed by this filter. The filter acts on emitted tokens and cannot reconnect tokens split by SimpleTokenizer.
- Applicability: Supports bounded folding policy and lack of presumed backend parity.

<a id="e18"></a>
## E18 — Tantivy TopDocs API

- Primary URL: [Tantivy TopDocs API](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html)
- Version/commit context: Tantivy 0.26.2
- Locator: TopDocs/order_by_score
- Access UTC: 2026-10-10T04:34:33.371124+00:00; HTTP 200.
- Local original: [E18-original.html](E18-original.html); readable: [E18-readable.txt](E18-readable.txt).
- Original SHA-256: `045ca07362ee79de6e93dcb81fa4afc5777887cbe0d584e2f41d67a13f9ceb93`; 114082 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Score-order API cross-check.
- Governing condition/default/exception: The public collector exposes decreasing similarity-score ordering and DocAddress results.
- Applicability: Independent pinned confirmation of original latest-docs S11 conclusion.

<a id="e19"></a>
## E19 — SQLite Unicode61 folding tables

- Primary URL: [SQLite Unicode61 folding tables](https://raw.githubusercontent.com/sqlite/sqlite/version-3.43.0/ext/fts5/fts5_unicode2.c)
- Version/commit context: SQLite source tag version-3.43.0
- Locator: sqlite3Fts5UnicodeIsdiacritic raw lines 98–106; UnicodeFold lines 240–242; fts5_remove_diacritic mapping
- Access UTC: 2026-10-10T04:35:23.136995+00:00; HTTP 200.
- Local original: [E19-original.txt](E19-original.txt); readable: [E19-readable.txt](E19-readable.txt).
- Original SHA-256: `e86bc679d585a927a4fd7dccac85bd02dcf6831ed973f76ec920cdbca1f64ed4`; 42074 bytes.
- Observed operation: independent HTTPS GET; source data only. Semantic inspection: Recognized-diacritic domain and removal.
- Governing condition/default/exception: A bitmap recognizes a bounded set of diacritical modifiers in U+0300–U+0331, including U+0301; enabled diacritic folding can map them to zero. Together with E15 this prevents the claimed separator behavior for that domain.
- Applicability: F1 exact subject/domain/exception evidence; no universal language-quality claim.

## Reviewer witnesses and integrity controls

- [Synthetic FTS5 result](reviewer-synthetic-fts5.json): executed reviewer-only in-memory check; candidate validation remains unrun.
- [Freeze verification](freeze-verification.json): all recorded original bytes/hash matches, not semantic proof.
- [Reviewer actual active Goal response](reviewer-native-goal-active.json).
- Reviewer actual terminal Goal response is saved after assessment completion as reviewer-native-goal-terminal.json.
- [Retrieval records](retrievals.json): request identity, access timestamps and local captures.
