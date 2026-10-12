# Source index — C-R2-P01-control / reviser

This index is navigable with source-map.json. Each full source record carries its exact URL, release/version or commit identity, locator, access UTC, observed operation, governing condition/default/exception, and applicability. Raw webpages were not copied locally.

Source IDs are immutable. S01-S21 are the investigator evidence records. R01-R21 are the critic’s independent cross-check records mapped to corresponding S IDs; they do not replace or rebind them. R22 adds the critic’s SQLite synchronous-setting evidence. R23 records this reviser’s direct check of SQLite’s official durability documentation.

## Formats and interpretation

- [S01 / R01 — RFC 4180](https://datatracker.ietf.org/doc/rfc4180/): common CSV syntax and non-universal status.
- [S02 / R02 — W3C Tabular Metadata](https://www.w3.org/TR/tabular-metadata/): declared dialect and schema.
- [S03 / R03 — W3C Tabular Data Model](https://www.w3.org/TR/tabular-data-model/): parser defaults, nulls, and variants.
- [S17 / R17 — RFC 3339](https://datatracker.ietf.org/doc/html/RFC3339): offsets and unqualified local time.
- [S18 / R18 — RFC 9557](https://datatracker.ietf.org/doc/rfc9557/): zone rules and zero/multiple local-time mappings.
- [S20 / R20 — UCUM 2.2](https://ucum.org/ucum): unit semantics and limits of convertibility.
- [S21 / R21 — Fellegi and Sunter, 1969](https://doi.org/10.1080/01621459.1969.10501049): link, non-link, and possible-link decisions.

## Parsing and support history

- [S04 / R04 — Rust csv 1.4.0 ReaderBuilder](https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html): width checks and configuration.
- [S05 / R05 — Rust csv 1.4.0 tutorial](https://docs.rs/csv/1.4.0/csv/tutorial/): Result iteration, headers, byte records, late errors.
- [S06 / R06 — rust-csv issue 427](https://github.com/BurntSushi/rust-csv/issues/427): open extreme caller-supplied seek-offset report.
- [S07 / R07 — rust-csv issue 422](https://github.com/BurntSushi/rust-csv/issues/422): unconfirmed row/line locator report after ragged data.
- [S08 / R08 — rust-csv discussion 402](https://github.com/BurntSushi/rust-csv/discussions/402): maintainer explanation of flexible width mode.
- [S09 / R09 — Apache Arrow CSV 59.3.0](https://docs.rs/arrow-csv/59.3.0/arrow_csv/reader/index.html): explicit-schema batches.
- [S10 / R10 — DuckDB CSV auto-detection](https://duckdb.org/docs/current/data/csv/auto_detection): sample inference and overrides.
- [S11 / R11 — DuckDB faulty CSV behavior](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files): stop-on-error and optional skipped rejects.

## Storage and transactions

- [S12 / R12 — SQLite transactions](https://www.sqlite.org/lang_transaction.html): writer/busy and rollback behavior.
- [S13 / R13 — SQLite atomic commit](https://www.sqlite.org/atomiccommit.html): rollback-journal scope.
- [S14 / R14 — rusqlite 0.40.2 Transaction](https://docs.rs/rusqlite/0.40.2/rusqlite/struct.Transaction.html): explicit commit and rollback-on-drop default.
- [S15 / R15 — SQLite UPSERT](https://www.sqlite.org/lang_UPSERT.html): caller-declared uniqueness conflicts.
- [S16 / R16 — DuckDB transaction management](https://duckdb.org/docs/current/sql/statements/transactions): commit/rollback and isolation.
- [R22 — SQLite PRAGMA synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous): critic’s added evidence on journal/synchronous durability behavior.
- [R23 — SQLite PRAGMA synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous): reviser’s direct primary-source check of FULL, NORMAL, EXTRA, process-crash, system-crash, and power-loss conditions.

The final.md clause and criticism dispositions cite these stable IDs.
