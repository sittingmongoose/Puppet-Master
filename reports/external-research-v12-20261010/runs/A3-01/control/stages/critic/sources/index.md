# Critic source index — A3-01-control

Full source identity, version, locator, access record, conditions, and applicability are in [source-map.json](../source-map.json). Original S01–S11 bindings are preserved; direct critic checks use C01–C13.

| ID | Primary source | Reviewed evidence |
|---|---|---|
| C01 | [SQLite FTS5 manual](https://www.sqlite.org/fts5.html) | Grammar, Unicode61, external content, delete, rank, rebuild, excerpts |
| C02 | [SQLite compile options](https://www.sqlite.org/compile.html) | FTS5 build condition |
| C03 | [SQLite transactions](https://www.sqlite.org/lang_transaction.html) | Transaction and writer behavior |
| C04 | [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) | Rollback-mode scope and storage assumptions |
| C05 | [SQLite 3.43.0 release log](https://www.sqlite.org/releaselog/3_43_0.html) | Contentless-delete history |
| C06 | [Tantivy 0.26.2 tokenizer docs](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html) | Per-field analyzer and folding |
| C07 | [Tantivy BooleanQuery 0.26.2 source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/boolean_query/boolean_query.rs) | Typed Boolean semantics |
| C08 | [Tantivy PhraseQuery 0.26.2 source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/query/phrase_query/phrase_query.rs) | Adjacency and positions |
| C09 | [Tantivy IndexWriter 0.26.2 docs](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html) | Commit visibility and persistence |
| C10 | [Tantivy SnippetGenerator 0.26.2 docs](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.SnippetGenerator.html) | Bounds and HTML example |
| C11 | [Tantivy 0.26.2 changelog](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md) | Historical Windows mmap fix |
| C12 | [Tantivy TopDocs 0.26.2 docs](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html) | Score direction and result identity |
| C13 | [Tantivy TopDocs 0.26.2 source](https://raw.githubusercontent.com/quickwit-oss/tantivy/0.26.2/src/collector/top_score_collector.rs) | Score-tie rule
