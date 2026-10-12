# Critic source index — B07-P01-treatment

This index retains the investigator's stable source IDs and identities. Original source URLs, versions, locators, access timestamps, conditions and applicability remain in [source-map.json](../source-map.json); critic observations are added without rebinding IDs.

- [SRC01 — csv 1.4.0 Reader source](#src01): defaults and record reads.
- [SRC02 — csv Position](#src02): trace coordinates.
- [SRC03 — csv Reader/StringRecord](#src03): UTF-8 and raw bytes.
- [SRC04 — issue #395](#src04): CRLF line position.
- [SRC05 — issue #377](#src05): duplicate header discussion.
- [SRC06 — rust_decimal 1.43.0](#src06): exact decimal conversion.
- [SRC07 — encoding_rs 0.8.42](#src07): strict/streaming decoding.
- [SRC08 — Polars 0.55.2](#src08): inference and parser errors.
- [SRC09 — SQLite transactions](#src09): transaction states and errors.
- [SRC10 — SQLite atomic commit](#src10): conditional atomic behavior.
- [SRC11 — OWASP CSV Injection](#src11): formula risk and export limits.
- [SRC12 — Calamine 0.36.0](#src12): future XLSX alternative.
- [SRC13 — PR #433](#src13): proposed CRLF fix, not released.

## SRC01
URL: https://docs.rs/csv/1.4.0/src/csv/reader.rs.html  
Version/locator: csv 1.4.0; ReaderBuilder source around lines 47–55 and delimiter/header/flexible/iterator methods.  
Operation/condition/applicability: Opened versioned source. Comma, headers-on, fixed-width are defaults; configurable, record-oriented reads are supported. App still validates shape and fields.

## SRC02
URL: https://docs.rs/csv/1.4.0/csv/struct.Position.html  
Version/locator: csv 1.4.0; Position description and byte/line/record methods, lines 59–93.  
Operation/condition/applicability: Opened exact API page. Byte and record indices are zero-based, line one-based. Prefer byte/record with physical line secondary due SRC04.

## SRC03
URL: https://docs.rs/csv/1.4.0/csv/struct.Reader.html  
Version/locator: csv 1.4.0; record and UTF-8/error docs, lines 73–103, plus versioned StringRecord docs.  
Operation/condition/applicability: Checked docs. StringRecord enforces UTF-8; ByteRecord permits arbitrary bytes; another encoding requires explicit transcoding.

## SRC04
URL: https://github.com/BurntSushi/rust-csv/issues/395  
Version/locator: issue opened 2025-04-02; reproduction/explanation around lines 160–186; Open at review.  
Operation/condition/applicability: Opened issue/status. CRLF can leave post-read line position at prior line. Keep byte/record anchors and test the pinned release.

## SRC05
URL: https://github.com/BurntSushi/rust-csv/issues/377  
Version/locator: issue opened 2024-12-21; example/maintainer response around lines 156–184; Open at review.  
Operation/condition/applicability: Opened issue/status. Response says vector deserialization is uncertain and may be ambiguous with tail capture. Positional review is conservative, not a parser guarantee.

## SRC06
URL: https://docs.rs/rust_decimal/1.43.0/rust_decimal/struct.Decimal.html  
Version/locator: rust_decimal 1.43.0; from_str_exact lines 616–625.  
Operation/condition/applicability: Opened method docs. Rejects unrepresentable underflow/scale; locale must be validated first.

## SRC07
URL: https://docs.rs/encoding_rs/0.8.42/encoding_rs/struct.Encoding.html  
Version/locator: encoding_rs 0.8.42; strict no-replacement decode and streaming Decoder guidance.  
Operation/condition/applicability: Exact Encoding page did not render; checked versioned docs.rs search result and Decoder docs. Malformed input is reported by no-replacement paths; replacement paths substitute U+FFFD.

## SRC08
URL: https://docs.rs/polars-io/0.55.2/polars_io/csv/read/struct.CsvReadOptions.html  
Version/locator: polars-io 0.55.2; with_infer_schema_length lines 254–256 and with_ignore_errors lines 269–271.  
Operation/condition/applicability: Opened versioned API. 100-row inference default and ParserError continuation option confirmed; force text schema and surface errors if used.

## SRC09
URL: https://www.sqlite.org/lang_transaction.html  
Version/locator: current unversioned docs; sections 2.2–3; accessed 2026-10-12.  
Operation/condition/applicability: Opened transaction docs. Default DEFERRED; busy/error paths vary. Conditional example only until actual database is known; verify rollback state.

## SRC10
URL: https://www.sqlite.org/atomiccommit.html  
Version/locator: current unversioned docs; introduction and rollback-mode scope; accessed 2026-10-12.  
Operation/condition/applicability: Opened atomic-commit docs. Transaction changes appear atomic under SQLite assumptions; WAL uses a different mechanism; a filesystem ledger is not atomic with DB writes.

## SRC11
URL: https://community.owasp.org/attacks/CSV_Injection  
Version/locator: current OWASP Community page; formula risk and mitigation tradeoff, lines 18–64; accessed 2026-10-12.  
Operation/condition/applicability: Opened page. Spreadsheet apps may execute formula-leading cells; behavior/mitigations vary and can alter cell values. Treat import as text; validate export separately.

## SRC12
URL: https://github.com/tafia/calamine/releases/tag/v0.36.0  
Version/locator: Calamine 0.36.0, tag commit 2872ac1; release notes.  
Operation/condition/applicability: Opened release notes. XLSX cell/formula streaming added and MSRV raised to 1.88; future workbook route only, not formula evaluation.

## SRC13
URL: https://github.com/BurntSushi/rust-csv/pull/433  
Version/locator: open PR, contributor commit 815ddab; status/summary/changed files; no reviews displayed.  
Operation/condition/applicability: Opened PR/status. Proposed CRLF fix remains unreleased; contributor tests were not independently run.
