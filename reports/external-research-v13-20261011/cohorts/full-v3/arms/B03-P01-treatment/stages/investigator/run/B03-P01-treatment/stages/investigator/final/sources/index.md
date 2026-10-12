# Primary-source index

All source identities below are also machine-readable in [source-map.json](../source-map.json). Access time for the pages in this batch: 2026-10-12T01:03:22Z. Entries are bounded evidence notes; use the exact URLs and locators for surrounding context.

## <a id="s01"></a>S01 — SQLite FTS5 official manual
[Official FTS5 manual](https://www.sqlite.org/fts5.html). Living, unversioned manual. Read build, query grammar, unicode61/trigram, external-content/contentless tables and pitfalls, rebuild/integrity-check, secure-delete. Governs storage-copy defaults, sync responsibilities, tokenization and recovery constraints. See S02 for feature release floor.

## <a id="s02"></a>S02 — SQLite 3.43.0 release notes
[Official SQLite 3.43.0 release notes](https://www.sqlite.org/releaselog/3_43_0.html), source id 0f80b798b3f4b81a7bb4233c58294edd0f1156f36b6ecf5ab8e83631d468778c. Added FTS5 contentless-delete indexes.

## <a id="s03"></a>S03 — SQLite WAL
[Official WAL documentation](https://www.sqlite.org/wal.html). Readers and a writer can overlap; only one writer at a time. Default checkpoint behavior and long-reader limitations matter to concurrent rebuilds.

## <a id="s04"></a>S04 — SQLite compile options
[Official compile options](https://www.sqlite.org/compile.html), SQLITE_ENABLE_FTS5 and diagnostics. FTS5 availability depends on the packaged library.

## <a id="s05"></a>S05 — SQLite integrity-check test history
[SQLite Fossil check-in 782163693f](https://sqlite.org/hctree/info/782163693f37aeb6), exact SHA 782163693f37aeb65209bebbaeb6659a36881b8c4b4bec778b366658488bf966. Changed ext/fts5/fts5integrity.test and made comparison with external content opt-in, matching the current manual's rank=1 condition.

## <a id="s06"></a>S06 — SQLite unicode61 Polish-letter report
[SQLite forum thread](https://sqlite.org/forum/info/e336faf90e60d53f?t=c), posts 1–5. Maintainer explanation says UnicodeData does not decompose Ł/ł to L/l; custom tokenizer is suggested.

## <a id="s07"></a>S07 — SQLite external-content trigger interaction
[SQLite bug-forum thread](https://sqlite.org/bugs/info/d3b14ada9b81056914d0e6f9a6d23b7a804008c82b3481fae225d8a514dbd180?t=c), opened 2026-08-04; corrected reproduction and maintainer diagnosis in posts 2–4. Narrow nested AFTER UPDATE trigger condition; no fix check-in identified.

## <a id="s08"></a>S08 — Tantivy IndexWriter 0.26.2
[Version-pinned API documentation](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html), source SHA in S14. Commit blocks and publishes; delete is visible after commit; adds can block when the indexing queue is full.

## <a id="s09"></a>S09 — Tantivy IndexReader 0.26.2
[Version-pinned reader API](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html), source SHA in S14. Default delayed commit reload and one-searcher-per-query consistency.

## <a id="s10"></a>S10 — Tantivy tokenizer defaults 0.26.2
[Version-pinned tokenizer module](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html), source SHA in S14. Default split/lowercase/long-token behavior, English stemming, custom filters/ngrams and stemmer language list.

## <a id="s11"></a>S11 — Tantivy update example 0.26.2
[Package source: deleting_updating_documents.rs](https://docs.rs/crate/tantivy/0.26.2/source/examples/deleting_updating_documents.rs), source SHA in S14. Example uses exact ID, delete+add, commit, reader reload and assertions; explicitly says uniqueness is not enforced. Read only; not executed.

## <a id="s12"></a>S12 — Tantivy release history 0.26.2
[Package changelog](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md), source SHA in S14. Explicit per-release index compatibility and historical reindex/deletion fixes; do not infer universal forward compatibility.

## <a id="s13"></a>S13 — Tantivy segment issue
[Upstream issue #2932](https://github.com/quickwit-oss/tantivy/issues/2932), opened 2026-05-15, downstream report. Per-record writer/commit is associated in that report with 2k segments and slow cold load; one workload, not a universal benchmark.

## <a id="s14"></a>S14 — Tantivy crate source identity
[Embedded VCS metadata](https://docs.rs/crate/tantivy/0.26.2/source/.cargo_vcs_info.json): version 0.26.2, git SHA 72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d.

## <a id="s15"></a>S15 — Tantivy watcher issue
[Upstream issue #3100](https://github.com/quickwit-oss/tantivy/issues/3100), opened 2026-09-13. Downstream app report is explicitly scoped to Tantivy 0.22.1 and macOS evict/reopen churn; not evidence of a current general library defect.

## <a id="s16"></a>S16 — Tantivy update example, exact 0.26.2 source commit
[Commit-pinned upstream example](https://github.com/quickwit-oss/tantivy/blob/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/examples/deleting_updating_documents.rs), commit 72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d. The independent critic and original-author final recheck confirmed the example states Tantivy does not enforce unique IDs and demonstrates delete-plus-add, commit, and reader reload. Source evidence only; not an app test or performance benchmark.

## Finalization source rechecks

At 2026-10-12T01:32:01Z, the original author re-opened [S01](https://www.sqlite.org/fts5.html) at sections 4.4.2–4.4.3 and 6.12 for contentless-delete, external-content, and REBUILD conditions, and re-opened the exact S16 commit URL above. S01–S15 identities and the original source observations remain unchanged; S16 is a separate appended cross-check.

