# Evidence index — A3-01 investigator

All source IDs are stable. Full identity fields (exact URL, version/commit, locator, access UTC, observed operation, governing condition/default/exception, and applicability) are in [`../source-map.json`](../source-map.json). Research access window: 2026-10-10T03:56:56Z through 2026-10-10T04:14:46Z. The documentation pages that are not version-addressed are identified as live upstream docs; the observed release and the need to recheck the actual app version/build are recorded in each entry.

## SQLite FTS5 and durability

- [S01 — FTS5 build support and unicode61 tokenizer](https://www.sqlite.org/fts5.html): FTS5 enablement by build path; Unicode 6.1 tokenization, punctuation/case behavior, Latin diacritics.
- [S02 — FTS5 query grammar and quoting](https://www.sqlite.org/fts5.html): expression syntax, phrase strings, doubled quotes, operators and column qualifiers.
- [S03 — External-content indexing, triggers, integrity check and rebuild](https://www.sqlite.org/fts5.html): same-database row mapping, update/delete ordering, contentless versus contentless-delete behavior, trigger backfill gap, `rank=1` consistency check, `rebuild` behavior.
- [S04 — BM25 and snippet](https://www.sqlite.org/fts5.html): lower-is-better FTS5 rank and bounded snippet parameters/inserted markers.
- [S05 — SQLite transaction guarantees](https://www.sqlite.org/transactional.html): atomicity of changes inside one SQLite transaction, including the documented crash-test claim.
- [S06 — SQLite 3.53.4 release](https://sqlite.org/releaselog/3_53_4.html): 2026-07-24 release and exact upstream source ID.
- [S16 — SQLite WAL mode](https://www.sqlite.org/wal.html): commit record, 1000-page checkpoint default, same-host limit, `FULL` versus `NORMAL`, companion files.
- [S17 — SQLite rollback-journal atomic commit](https://www.sqlite.org/atomiccommit.html): rollback-mode-only explanation and filesystem/VFS durability assumptions.

## Tantivy

- [S07 — Tantivy 0.26.2 tag commit](https://github.com/quickwit-oss/tantivy/commit/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d) and [package/release metadata](https://docs.rs/crate/tantivy/0.26.2): observed release/tag and declared dependency range. This is a reference version, not the application's selected version.
- [S08 — Tantivy 0.26.2 IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html) and [IndexReader](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html): commit, rollback, delete, opstamp, publication and default delayed reader reload.
- [S19 — Tantivy 0.26.2 snippet generator](https://docs.rs/tantivy/0.26.2/tantivy/snippet/index.html): documented example stores text fields and highlights HTML; its max snippet character length is configurable.
- [S18 — Tantivy 0.26.2 IndexReader reload behavior](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html): default delayed reload means committed changes may take tens of milliseconds to appear.
- [S09 — Tantivy 0.26.2 tokenizers](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html): punctuation/whitespace splitting, lowercasing, long-token behavior, explicit folding/stemming options.
- [S10 — Tantivy QueryParser source](https://docs.rs/tantivy/latest/src/tantivy/query/query_parser/query_parser.rs.html) and [error enum](https://docs.rs/tantivy/latest/tantivy/query/enum.QueryParserError.html): at access the docs header showed 0.26.2; parser returns `Result`, with broad syntax/error variants. Confirm exact tag source if selected.
- [S11 — Tantivy 0.26.2 TopDocs](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html): descending score and stable ties by internal DocAddress.
- [S12 — Tantivy 0.26.2 Snippet](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.Snippet.html): fragment/highlight ranges and HTML-producing method.
- [S13 — Windows commit/merge issue #2847](https://github.com/quickwit-oss/tantivy/issues/2847): open report names 0.25.0 on Windows 10/11 NTFS; do not generalize to 0.26.2.
- [S14 — Pre-commit orphan files issue #3079](https://github.com/quickwit-oss/tantivy/issues/3079): open, version-unspecified report/question; not a confirmed general recovery contract.
- [S15 — Malformed-query issue #3031](https://github.com/quickwit-oss/tantivy/issues/3031): reports panic on `- *` for 0.22.1/grammar 0.22.0; the linked [fix-like commit](https://github.com/puretechteam/tantivy/commit/28b2ed185381b59c17530bb37cb9e481921ac1f2) is from a contributor fork, not proof of an upstream release fix.

## Evidence limit

No web page was saved as a raw capture. The bounded record is the direct-link index plus the source map's locator, observed operation, condition, and applicability notes. Do not infer deployment versions or release fixes from the reference snapshot.
