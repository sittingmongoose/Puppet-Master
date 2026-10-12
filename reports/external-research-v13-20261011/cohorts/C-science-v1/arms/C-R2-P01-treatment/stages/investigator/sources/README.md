# Sources — C-R2-P01-treatment investigator

Source IDs are immutable within this run. Each ID has a bounded evidence note here and a full identity record (URL, version/commit status, locator, access UTC, observed operation, governing condition/default/exception, applicability) in [source-map.json](../source-map.json). The external primary source is linked on each entry. Full source pages are not copied into this directory.

<a id="s01"></a>
## S01 — Rust csv ReaderBuilder 1.4.0

[ReaderBuilder API docs](https://docs.rs/csv/latest/csv/struct.ReaderBuilder.html). Header handling and equal-width record defaults; configurable parser profile.

<a id="s02"></a>
## S02 — Rust csv Reader 1.4.0

[Reader API docs](https://docs.rs/csv/1.4.0/csv/struct.Reader.html). Incremental reusable record reads, source positions and explicit byte/UTF-8 behavior.

<a id="s03"></a>
## S03 — Rust csv tutorial

[Official crate tutorial](https://docs.rs/csv/latest/csv/tutorial/). Unequal record length errors and no header heuristic.

<a id="s04"></a>
## S04 — RFC 4180

[RFC Editor record](https://www.rfc-editor.org/info/rfc4180/). Informational CSV profile, quoting and implementation variation.

<a id="s05"></a>
## S05 — W3C CSVW metadata

[W3C Recommendation](https://www.w3.org/TR/tabular-metadata/). Dialect, schema, datatypes, required/null markers and metadata risks.

<a id="s06"></a>
## S06 — DuckDB CSV auto-detection

[Current docs](https://duckdb.org/docs/current/data/csv/auto_detection). Sample size, candidate dialects, inferred types and all_varchar option. Rolling documentation, exact build version not shown.

<a id="s07"></a>
## S07 — DuckDB faulty CSV handling

[Current docs](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files). Structural errors, default fail behavior, optional skip/reject paths and maximum line size. Rolling documentation.

<a id="s08"></a>
## S08 — DuckDB issue 13660

[Upstream issue](https://github.com/duckdb/duckdb/issues/13660). Sampled date/type inference and explicit-schema workarounds.

<a id="s09"></a>
## S09 — DuckDB issue 12338

[Upstream issue](https://github.com/duckdb/duckdb/issues/12338). Versioned StringIO/encoding behavior report, later closed by PR 13597; first fixed release not established.

<a id="s10"></a>
## S10 — DuckDB transaction management

[Current docs](https://duckdb.org/docs/current/sql/statements/transactions). Begin/commit/rollback and multi-statement rollback behavior. Rolling documentation.

<a id="s11"></a>
## S11 — DuckDB concurrency

[Current docs](https://duckdb.org/docs/current/connect/concurrency). Optimistic conflict/retry and file-lock cautions. Rolling documentation.

<a id="s12"></a>
## S12 — SQLite transactions

[Official docs](https://www.sqlite.org/lang_transaction.html). Readers coexist; one simultaneous writer.

<a id="s13"></a>
## S13 — SQLite savepoints

[Official docs](https://www.sqlite.org/lang_savepoint.html). Inner release does not independently commit.

<a id="s14"></a>
## S14 — SQLite conflict handling

[Official docs](https://www.sqlite.org/lang_conflict.html). ABORT, FAIL, IGNORE and REPLACE semantics.

<a id="s15"></a>
## S15 — SQLite WAL history

[Official docs](https://www.sqlite.org/wal.html). WAL-reset bug details and fixed SQLite versions.

<a id="s16"></a>
## S16 — Chrono LocalResult 0.4.45

[API docs](https://docs.rs/chrono/latest/chrono/offset/enum.LocalResult.html). Single, ambiguous-fold and no-result-gap mapping.

<a id="s17"></a>
## S17 — UCUM 2.2

[UCUM specification](https://ucum.org/ucum), version 2.2 dated 2024-06-17. Machine unit vocabulary, case and conversion behavior.

<a id="s18"></a>
## S18 — OGC SensorThings 1.1

[Official specification PDF](https://docs.ogc.org/is/18-088/18-088.pdf). Observation context includes event time, feature, observed property and sensor/procedure.

<a id="s19"></a>
## S19 — RFC 3339

[RFC Editor full text](https://www.rfc-editor.org/rfc/rfc3339.html), July 2002. Offset-qualified instants and unqualified local-time limitations.

<a id="s20"></a>
## S20 — Rust csv maintainer Q&A

[Upstream discussion 327](https://github.com/BurntSushi/rust-csv/discussions/327), 2023-06-29. Invalid syntax may be salvaged into an unintended parse.

