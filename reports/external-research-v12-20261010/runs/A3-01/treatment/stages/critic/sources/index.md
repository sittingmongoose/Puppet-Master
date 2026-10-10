# Critic-stage source index — A3-01-treatment

Critic observations use C01–C11 in the adjacent source-map.json. Investigator source IDs S01–S19 keep their original meanings in the frozen investigator source map; no IDs were rebound. Access window for this independent check: 2026-10-10T04:18:48Z through 2026-10-10T04:23:12Z. This is a navigable direct-link index, not a raw web capture. Each source record includes its locator, observed operation, applicable condition/default/exception, release boundary, and scope limitation.

## SQLite FTS5 and write behavior

- [C01 — FTS5 build, tokenizer, content modes, triggers, repair, and snippets](https://www.sqlite.org/fts5.html): sections 2.1, 3, 4.3.1, 4.4, 5.1.3, 6.7, and 6.12.
- [C02 — SQLite 3.43.0 release record](https://www.sqlite.org/releaselog/3_43_0.html): contentless-delete introduced, release date, source ID.
- [C03 — SQLite ON CONFLICT REPLACE](https://www.sqlite.org/lang_conflict.html): REPLACE deletes the conflicting row; whether its delete triggers fire depends on recursive-trigger configuration.
- [C04 — SQLite recursive_triggers pragma](https://www.sqlite.org/pragma.html#pragma_recursive_triggers): query/set setting and documented historical default caveat.
- [C11 — SQLite transaction guarantees](https://www.sqlite.org/transactional.html): single-SQLite-transaction crash/power-loss atomicity scope.
- [C10 — SQLite WAL operation and constraints](https://www.sqlite.org/wal.html): commit records, checkpoint default, same-host shared-memory constraint, attached-database atomicity limit.

## Tantivy 0.26.2 and released history

- [C05 — Tantivy 0.26.2 IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html): commit, delete, opstamp, recovery point.
- [C06 — Tantivy 0.26.2 IndexReader](https://docs.rs/tantivy/0.26.2/tantivy/struct.IndexReader.html): delayed reload behavior and explicit reload.
- [C07 — Tantivy 0.26.2 tokenizers](https://docs.rs/tantivy/0.26.2/tantivy/tokenizer/index.html): default and explicit tokenizer/filter behavior.
- [C08 — Tantivy 0.26.2 TopDocs](https://docs.rs/tantivy/0.26.2/tantivy/collector/struct.TopDocs.html): BM25 direction and internal-address tie break.
- [C09 — upstream issue 3031](https://github.com/quickwit-oss/tantivy/issues/3031): malformed-query panic report, exact older versions, issue status, and fork-linked change provenance.
- [S07 and S15 — inherited release/package and issue/fork source identities](../../investigator/source-map.json): retained original evidence records for the Tantivy 0.26.2 release commit/dependency range and the version-bounded malformed-query report.

## Evidence boundary

No documents, source pages, user notes, application databases, or downloaded code were modified or executed. The application’s shipped SQLite/Tantivy versions, schema, trigger configuration, and writer paths are unknown. Product validations in the investigator matrix remain proposed.

