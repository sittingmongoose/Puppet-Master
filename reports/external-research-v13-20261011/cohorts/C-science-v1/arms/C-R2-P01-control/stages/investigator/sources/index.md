# Source index — C-R2-P01-control / investigator

This index and the root source-map.json share stable source IDs. IDs are immutable; new evidence is appended under new IDs. Access window for the sources below: 2026-10-12 02:38:50–02:42:13 UTC (the browser exposed a bounded retrieval window, not per-page timestamps). Detailed release identity, locator, operation, condition/default/exception and applicability are in source-map.json.

## Formats and interpretation
- S01 — [RFC 4180](https://datatracker.ietf.org/doc/rfc4180/): common CSV syntax, non-universal status.
- S02 — [W3C Tabular Metadata](https://www.w3.org/TR/tabular-metadata/): explicit dialect and schema metadata.
- S03 — [W3C Tabular Data Model](https://www.w3.org/TR/tabular-data-model/): parser defaults, nulls, and variant formats.
- S17 — [RFC 3339](https://datatracker.ietf.org/doc/html/RFC3339): offsets and unqualified local times.
- S18 — [RFC 9557](https://datatracker.ietf.org/doc/rfc9557/): timezone rules and ambiguous local-time mapping.
- S20 — [UCUM 2.2](https://ucum.org/ucum): unit semantics and non-convertible arbitrary units.
- S21 — [Fellegi and Sunter 1969](https://doi.org/10.1080/01621459.1969.10501049): link / non-link / possible-link decisions.

## Parser and transaction candidates
- S04 — [Rust csv 1.4.0 ReaderBuilder](https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html): strict unequal-width default and configuration.
- S05 — [Rust csv 1.4.0 tutorial](https://docs.rs/csv/1.4.0/csv/tutorial/): Result iteration, header behavior, byte records.
- S09 — [Arrow CSV 59.3.0](https://docs.rs/arrow-csv/59.3.0/arrow_csv/reader/index.html): explicit schema and batch iteration.
- S10 — [DuckDB CSV auto-detection](https://duckdb.org/docs/current/data/csv/auto_detection): sample inference and overrides.
- S11 — [DuckDB faulty CSV behavior](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files): stop-on-error default and optional row skipping.
- S12 — [SQLite transactions](https://www.sqlite.org/lang_transaction.html): writer/busy and rollback behavior.
- S13 — [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html): rollback-journal scope.
- S14 — [rusqlite 0.40.2 Transaction](https://docs.rs/rusqlite/0.40.2/rusqlite/struct.Transaction.html): drop rollback default.
- S15 — [SQLite UPSERT](https://www.sqlite.org/lang_UPSERT.html): explicit uniqueness conflict handling.
- S16 — [DuckDB transaction management](https://duckdb.org/docs/current/sql/statements/transactions): ACID commit/rollback and isolation.

## Issue, caller and edge-case history
- S06 — [rust-csv issue 427](https://github.com/BurntSushi/rust-csv/issues/427): open extreme-offset overflow report in seek/read path.
- S07 — [rust-csv issue 422](https://github.com/BurntSushi/rust-csv/issues/422): open line-count report after ragged rows.
- S08 — [rust-csv discussion 402](https://github.com/BurntSushi/rust-csv/discussions/402): maintainer explains that flexible mode disables unequal-width checking.
- S19 — [Chrono 0.4.45 LocalResult](https://docs.rs/chrono/0.4.45/chrono/offset/enum.LocalResult.html): Single/Ambiguous/None time mapping.

No raw webpages were copied locally. The source map is the evidence locator and condition register. The worked documentation examples were inspected only; no example or application test was executed.
