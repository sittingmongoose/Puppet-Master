# Source index — reviser stage, B07-P01-treatment

This is a navigable index for the complete revised proposal. Stable source IDs SRC01–SRC13 are preserved from the investigator packet and critic map without rebinding. Full exact URLs, released versions/commits where applicable, locators, original access UTC, operations, conditions/defaults/exceptions, applicability, lineage, critic review, and reviser rechecks are in [source-map.json](../source-map.json).

Rechecks were accessed in two batches, 2026-10-12 01:09:27 UTC and 01:12:04 UTC. Upstream issue/PR statuses below are time-bound and can change.

- [SRC01 — Rust csv 1.4.0 Reader source](#src01): builder defaults, configurable dialect, record streaming.
- [SRC02 — Rust csv 1.4.0 Position API](#src02): stored byte, line, and record index bases.
- [SRC03 — Rust csv Reader documentation](#src03): string versus byte records and UTF-8.
- [SRC04 — rust-csv issue #395](#src04): CRLF line-position report.
- [SRC05 — rust-csv issue #377](#src05): duplicate-field Serde/deserializer discussion.
- [SRC06 — rust_decimal 1.43.0](#src06): exact decimal parse and representability.
- [SRC07 — encoding_rs 0.8.42](#src07): strict and streaming decode options.
- [SRC08 — polars-io 0.55.2](#src08): schema inference and parser-error handling.
- [SRC09 — SQLite transaction documentation](#src09): DEFERRED, lock, and error behavior.
- [SRC10 — SQLite atomic commit documentation](#src10): conditional transaction atomicity and journal scope.
- [SRC11 — OWASP CSV Injection](#src11): formula interpretation and export mitigation limits.
- [SRC12 — Calamine 0.36.0 release](#src12): possible XLSX streaming route and MSRV change.
- [SRC13 — rust-csv PR #433](#src13): proposed CRLF fix, not released at reviser recheck.

## SRC01 — Rust csv 1.4.0 Reader source

[Exact versioned source](https://docs.rs/csv/1.4.0/src/csv/reader.rs.html)  
**Version/locator:** csv 1.4.0; ReaderBuilder defaults around source lines 47–55; delimiter/header/flexible configuration and record iterator details in [source-map.json](../source-map.json).  
**Evidence:** The investigator and critic opened the versioned source. Comma delimiter, headers enabled, and fixed field count are defaults; custom dialect and record iteration are available.  
**Condition/applicability:** Use only as a parsing primitive. The application must validate row width, fields, mapping, and business rules.

## SRC02 — Rust csv 1.4.0 Position API

[Exact-version API](https://docs.rs/csv/1.4.0/csv/struct.Position.html)  
**Version/locator:** csv 1.4.0; Position description and byte/line/record methods, API lines 59–93.  
**Reviser recheck:** Opened 2026-10-12 01:09:27 UTC; confirmed byte offset and record index start at zero, line starts at one, and the reader assigns each record’s position.  
**Condition/applicability:** Persist raw parser values; calculate staff-facing data-row numbering separately after configured header records.

## SRC03 — Rust csv Reader documentation

[Exact-version Reader API](https://docs.rs/csv/1.4.0/csv/struct.Reader.html)  
**Version/locator:** csv 1.4.0; record and UTF-8/error discussion, versioned API lines 73–103.  
**Evidence:** Critic independently checked that StringRecord enforces UTF-8, ByteRecord preserves arbitrary bytes, and another encoding requires explicit transcoding.  
**Condition/applicability:** Preserve source bytes/text and choose strict decode or explicit transcoding; do not coerce codes or quantities during parsing.

## SRC04 — rust-csv issue #395

[Upstream issue](https://github.com/BurntSushi/rust-csv/issues/395)  
**Version/locator:** issue opened 2025-04-02; CRLF reproduction and explanation near lines 160–186.  
**Reviser recheck:** Opened 2026-10-12 01:09:27 UTC; issue still Open. Its example reports a stale post-read line position with CRLF input.  
**Condition/applicability:** Issue report, not proof every parser version has the defect. Keep byte offset and logical record as primary anchors and test the selected released dependency.

## SRC05 — rust-csv issue #377

[Upstream issue](https://github.com/BurntSushi/rust-csv/issues/377)  
**Version/locator:** opened 2024-12-21; duplicate-field example and maintainer response near lines 156–184.  
**Reviser recheck:** Opened 2026-10-12 01:12:04 UTC; the discussion is Open. The maintainer calls vector deserialization uncertain and potentially ambiguous with tail capture.  
**Condition/applicability:** This is a Serde/deserializer concern, not evidence that positional parsing drops duplicate columns. Explicit positional header review is a conservative product policy.

## SRC06 — rust_decimal 1.43.0

[Exact-version Decimal API](https://docs.rs/rust_decimal/1.43.0/rust_decimal/struct.Decimal.html)  
**Version/locator:** rust_decimal 1.43.0; from_str_exact signature and underflow condition, lines 616–625.  
**Reviser recheck:** Opened 2026-10-12 01:12:04 UTC; confirmed exact parse can fail for a value not representable at the given scale.  
**Condition/applicability:** Conversion follows explicit separator validation; the API does not choose locale.

## SRC07 — encoding_rs 0.8.42

[Versioned Encoding API](https://docs.rs/encoding_rs/0.8.42/encoding_rs/struct.Encoding.html)  
**Version/locator:** encoding_rs 0.8.42; strict no-replacement decode and streaming Decoder guidance.  
**Evidence:** The investigator reviewed strict/streaming decoding APIs. The critic reports that the exact Encoding page failed to render but versioned docs.rs results and Decoder documentation supported its bounded check.  
**Condition/applicability:** Explicitly select any non-UTF-8 label and reject malformed sequences; never silently replace bytes. This optional encoding path still needs implementation-specific validation.

## SRC08 — polars-io 0.55.2

[Exact-version CSV options](https://docs.rs/polars-io/0.55.2/polars_io/csv/read/struct.CsvReadOptions.html)  
**Version/locator:** polars-io 0.55.2; with_infer_schema_length lines 254–256; with_ignore_errors lines 269–271.  
**Reviser recheck:** Opened 2026-10-12 01:12:04 UTC; confirmed inference defaults to 100 rows, full scan is documented as very slow, and ignore_errors continues after ParserError.  
**Condition/applicability:** A viable dataframe option only with suitable forced schema and complete error accounting.

## SRC09 — SQLite transaction documentation

[SQLite transaction docs](https://www.sqlite.org/lang_transaction.html)  
**Version/locator:** current unversioned online docs; sections 2–3.  
**Reviser recheck:** Opened 2026-10-12 01:12:04 UTC; confirmed DEFERRED is default, read-to-write upgrades can return SQLITE_BUSY, and a BUSY commit can leave a transaction active.  
**Condition/applicability:** SQLite-specific example only. The target application database and adapter are unknown; verify its actual transaction and recovery behavior.

## SRC10 — SQLite atomic commit documentation

[SQLite atomic commit](https://www.sqlite.org/atomiccommit.html)  
**Version/locator:** current unversioned online docs; transaction mechanism and rollback-journal scope described in the source map.  
**Evidence:** Investigator and critic opened the primary documentation and distinguish rollback-mode details from WAL.  
**Condition/applicability:** Supports an example only when inventory rows and idempotency markers share the same SQLite transaction. It does not make a separate filesystem ledger atomic with database writes.

## SRC11 — OWASP CSV Injection

[OWASP Community guidance](https://community.owasp.org/attacks/CSV_Injection)  
**Version/locator:** current unversioned page; formula interpretation lines 18–37, mitigation/trade-off lines 38–61.  
**Reviser recheck:** Opened 2026-10-12 01:09:27 UTC; confirmed spreadsheet applications may evaluate formula-leading cells and mitigations differ or alter cell data.  
**Condition/applicability:** Keep import data inert. Any external spreadsheet export needs separate policy and tests.

## SRC12 — Calamine 0.36.0 release

[Upstream release](https://github.com/tafia/calamine/releases/tag/v0.36.0)  
**Version/commit:** Calamine 0.36.0; release tag commit 2872ac1.  
**Reviser recheck:** Opened 2026-10-12 01:12:04 UTC; confirmed XLSX cell/formula streaming additions and MSRV increase from Rust 1.83 to 1.88.  
**Condition/applicability:** Future workbook alternative only; this is not an evaluation of supplier workbook data and is outside the delimited-text brief.

## SRC13 — rust-csv PR #433

[Upstream pull request](https://github.com/BurntSushi/rust-csv/pull/433)  
**Version/commit:** Open PR against master; contributor commit 815ddab from 2026-08-30.  
**Reviser recheck:** Opened 2026-10-12 01:09:27 UTC; still Open, no reviews displayed. It proposes consuming complete CRLF record terminators and adds CRLF/split-buffer tests; tests were not run by this stage.  
**Condition/applicability:** Proposed patch only. Do not claim the change is in a released/pinned dependency until verified.

