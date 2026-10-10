# Source index — A3-01-control investigator

Every source ID is stable within `../source-map.json`; see that record for exact URL, version/commit status, UTC access time, locator, observed operation, condition/default/exception, and applicability.

| IDs | Primary-source area | Use in discovery |
| --- | --- | --- |
| S01–S02 | [SQLite FTS5](https://www.sqlite.org/fts5.html), [compile options](https://www.sqlite.org/compile.html) | MATCH grammar, Unicode61, FTS5 availability/build configuration, external-content synchronization, BM25, snippets, integrity/rebuild, secure-delete |
| S03–S05 | [SQLite transactions](https://www.sqlite.org/lang_transaction.html), [atomic commit](https://www.sqlite.org/atomiccommit.html), [3.43.0 release log](https://www.sqlite.org/releaselog/3_43_0.html) | Same-file transaction boundaries and caveats; historical addition of contentless-delete tables |
| S06–S09 | Version-pinned [Tantivy 0.26.2 tokenizer](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html), rendered-as-0.26.2 [BooleanQuery](https://docs.rs/tantivy/latest/tantivy/query/struct.BooleanQuery.html) and [PhraseQuery](https://docs.rs/tantivy/latest/tantivy/query/struct.PhraseQuery.html), version-pinned [IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html) and [SnippetGenerator](https://docs.rs/tantivy/0.26.2/tantivy/snippet/struct.SnippetGenerator.html) | Explicit analyzer and phrase requirements, typed Boolean/phrase construction, post-commit visibility, bounded snippets |
| S10 | [Tantivy 0.26.2 changelog](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md) | Windows mmap build-fix history and release-context caveat |
| S11 | Tantivy 0.26.2-rendered [TopDocs collector](https://docs.rs/tantivy/latest/tantivy/collector/struct.TopDocs.html) | Descending BM25 order and documented DocAddress tie-break; adapter still needs public note-ID tie order |

Research was documentation-only. No app code, tests, builds, crash simulation, note data, or executable validation were run. Version-pinned docs identify a candidate release, not the selected or deployed application dependency.
