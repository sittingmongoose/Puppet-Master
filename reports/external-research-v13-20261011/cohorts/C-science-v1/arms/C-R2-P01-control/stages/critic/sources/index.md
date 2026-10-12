# Critic source index — C-R2-P01-control

R01–R21 independently review the corresponding investigator source IDs S01–S21; the upstream IDs remain unchanged. R22 adds the SQLite synchronous-setting evidence used for finding C-01. All records include exact URL, release identity, locator, bounded UTC access window, observed operation, governing condition, and applicability in ../source-map.json.

## Formats and interpretation
- [R01] [upstream S01] — [RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files](https://datatracker.ietf.org/doc/rfc4180/).
- [R02] [upstream S02] — [W3C Metadata Vocabulary for Tabular Data](https://www.w3.org/TR/tabular-metadata/).
- [R03] [upstream S03] — [W3C Model for Tabular Data and Metadata on the Web](https://www.w3.org/TR/tabular-data-model/).
- [R17] [upstream S17] — [RFC 3339](https://datatracker.ietf.org/doc/html/RFC3339).
- [R18] [upstream S18] — [RFC 9557](https://datatracker.ietf.org/doc/rfc9557/).
- [R20] [upstream S20] — [UCUM 2.2](https://ucum.org/ucum).
- [R21] [upstream S21] — [Fellegi and Sunter, 1969](https://www.tandfonline.com/doi/abs/10.1080/01621459.1969.10501049).

## Parsers, storage, and support history
- [R04] [upstream S04] — [csv crate ReaderBuilder](https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html).
- [R05] [upstream S05] — [csv crate tutorial](https://docs.rs/csv/1.4.0/csv/tutorial/).
- [R06] [upstream S06] — [rust-csv issue 427: An overflow panic in Reader::read_byte_record](https://github.com/BurntSushi/rust-csv/issues/427).
- [R07] [upstream S07] — [rust-csv issue 422: Miscounting lines with mismatched columns](https://github.com/BurntSushi/rust-csv/issues/422).
- [R08] [upstream S08] — [rust-csv discussion 402: Trying to use different sized headers for malformed CSV](https://github.com/BurntSushi/rust-csv/discussions/402).
- [R09] [upstream S09] — [Apache Arrow CSV reader](https://docs.rs/arrow-csv/59.3.0/arrow_csv/reader/index.html).
- [R10] [upstream S10] — [DuckDB CSV Auto Detection](https://duckdb.org/docs/current/data/csv/auto_detection).
- [R11] [upstream S11] — [DuckDB Reading Faulty CSV Files](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files).
- [R12] [upstream S12] — [SQLite Transaction](https://www.sqlite.org/lang_transaction.html).
- [R13] [upstream S13] — [Atomic Commit In SQLite](https://www.sqlite.org/atomiccommit.html).
- [R14] [upstream S14] — [rusqlite Transaction](https://docs.rs/rusqlite/0.40.2/rusqlite/struct.Transaction.html).
- [R15] [upstream S15] — [SQLite UPSERT](https://www.sqlite.org/lang_UPSERT.html).
- [R16] [upstream S16] — [DuckDB Transaction Management](https://duckdb.org/docs/current/sql/statements/transactions).
- [R19] [upstream S19] — [Chrono 0.4.45 LocalResult docs](https://docs.rs/chrono/0.4.45/chrono/offset/enum.LocalResult.html).
- [R22] — [SQLite PRAGMA synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous); process-crash and power-loss durability depend on settings and storage conditions.
