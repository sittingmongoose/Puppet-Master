# Critic primary-source index

Independent re-check batch: 2026-10-12T01:26:48Z. Source IDs S01–S12 retain the same meanings and URLs as the investigator map where used; S16 is a separately identified pinned GitHub representation, not a rebinding of S11.

## SQLite

- [S01 — FTS5 manual](https://www.sqlite.org/fts5.html), living official manual. Sections 4.3–4.4, 6.7 and 6.12; Unicode tokenizer, content modes, update sync, integrity comparison, rebuild constraints. Access/operation/conditions in source-map.json.
- [S02 — SQLite 3.43.0 release notes](https://www.sqlite.org/releaselog/3_43_0.html), released 2023-08-24. Item 1 adds contentless-delete. Feature floor only.
- [S03 — WAL documentation](https://www.sqlite.org/wal.html), living manual. Sections on concurrency, single writer, checkpoints and filesystem conditions.
- [S04 — Compile-time options](https://www.sqlite.org/compile.html), living manual. SQLITE_ENABLE_FTS5 build condition.
- [S06 — SQLite forum Ł/ł report](https://sqlite.org/forum/info/e336faf90e60d53f?t=c), posts 1–5, 2020–2021. Maintainer explanation of UnicodeData mapping and custom-tokenizer option.
- [S07 — SQLite bug-forum trigger report](https://sqlite.org/bugs/info/d3b14ada9b81056914d0e6f9a6d23b7a804008c82b3481fae225d8a514dbd180?t=c), opened 2026-08-04; corrected reproduction and maintainer explanation at posts 3–4. Specific nested AFTER UPDATE trigger interaction.

## Tantivy 0.26.2

- [S08 — IndexWriter API](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html), commit/delete/add visibility and blocking behavior.
- [S09 — IndexReader API](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html), reload delay and per-query searcher snapshot.
- [S10 — tokenizer module](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html), default and en_stem behavior, token length and tokenizer options.
- [S11 — original package-source locator](https://docs.rs/crate/tantivy/0.26.2/source/examples/deleting_updating_documents.rs), crate 0.26.2. The web open returned an internal error; see separate S16 for independent verification of the same commit-pinned file.
- [S12 — crate changelog](https://docs.rs/crate/tantivy/0.26.2/source/CHANGELOG.md), crate 0.26.2; compatibility/reindex notes across releases.
- [S16 — pinned upstream example cross-check](https://github.com/quickwit-oss/tantivy/blob/72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d/examples/deleting_updating_documents.rs), exact source commit 72d1ef9a6468aa68bbc69dcc80cdf60aaf64364d, example lines 559–675 and 683–706. States no primary-ID enforcement and demonstrates delete+add, commit and reader reload. This is an additional source identity; S11's URL remains unchanged.
