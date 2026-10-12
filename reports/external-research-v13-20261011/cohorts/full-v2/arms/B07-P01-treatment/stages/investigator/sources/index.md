# Source index — investigator stage

Access timestamps are UTC capture times recorded after each retrieval batch. Pages may change after access; source-map.json records versions, locators, conditions and applicability. "Current/unversioned" means the source itself did not expose a stable release tag in the page. Source IDs are stable within this stage and are not rebound.

- [SRC01 — Rust csv 1.4.0 source](#src01): ReaderBuilder defaults, delimiter/header controls, streaming record iterator and parser policy.
- [SRC02 — Rust csv Position](#src02): record index and byte-offset fields for row traceability.
- [SRC03 — Rust csv Reader docs](#src03): raw record workflow and UTF-8 versus ByteRecord behavior.
- [SRC04 — rust-csv issue #395](#src04): open CRLF line-position report; use record index/byte offset as audit anchors.
- [SRC05 — rust-csv issue #377](#src05): open duplicate-header deserialization discussion.
- [SRC06 — rust_decimal 1.43.0](#src06): exact decimal conversion after locale validation.
- [SRC07 — encoding_rs 0.8.42](#src07): explicit and strict decoding option.
- [SRC08 — Polars 0.55.2](#src08): 100-row schema inference default and parser-error continuation option.
- [SRC09 — SQLite transactions](#src09): conditional transaction/locking semantics for a SQLite target.
- [SRC10 — SQLite atomic commit](#src10): transaction durability and all-or-none model for a SQLite target.
- [SRC11 — OWASP CSV Injection](#src11): formula execution risk when untrusted cells are opened in spreadsheet software.
- [SRC12 — Calamine 0.36.0 release](#src12): future true-workbook alternative and release/version history.
- [SRC13 — rust-csv PR #433](#src13): open, unmerged patch and tests proposed for SRC04.

## SRC01

**Exact URL:** https://docs.rs/csv/1.4.0/src/csv/reader.rs.html  
**Version/commit:** csv 1.4.0 release; docs.rs versioned source; no commit displayed.  
**Locator:** reader.rs default builder (approx. source lines 47–55); delimiter/header/flexible methods (150–192, 316–319); record iterator (2079–2092); error-policy comments (691–700).  
**Observed operation:** Opened versioned crate source and inspected configuration/defaults and iterator implementation.  
**Condition/default/exception:** Comma delimiter, headers enabled, and fixed record length are defaults; caller can configure delimiter, headers and flexible lengths. Reader supports record-by-record iteration. Its policy aims to return a parse for diverse CSV rather than reject every unusual form, while shape errors remain available with default fixed-width checks.  
**Applicability:** Suitable parsing primitive for delimited text, with application-owned schema validation. Do not treat parser success as validated stock data.

## SRC02

**Exact URL:** https://docs.rs/csv/1.4.0/csv/struct.Position.html  
**Version/commit:** csv 1.4.0.  
**Locator:** Position description and `byte`, `line`, `record` methods, lines 59–93.  
**Observed operation:** Opened exact-version API documentation.  
**Condition/default/exception:** Byte offset and record index start at zero; line starts at one; reader assigns positions.  
**Applicability:** Save byte offset and record index for invalid-row traceability. Physical line should be secondary due SRC04.

## SRC03

**Exact URL:** https://docs.rs/csv/1.4.0/csv/struct.Reader.html  
**Version/commit:** csv 1.4.0.  
**Locator:** Record-oriented interface and UTF-8/error discussion, lines 73–103.  
**Observed operation:** Opened exact-version Reader documentation.  
**Condition/default/exception:** String records enforce UTF-8. ByteRecord permits invalid UTF-8 bytes; explicit other encodings need transcoding.  
**Applicability:** Preserve raw cells; use strict decoding or an explicit alternate encoding.

## SRC04

**Exact URL:** https://github.com/BurntSushi/rust-csv/issues/395  
**Version/commit:** Upstream issue opened 2025-04-02; Open at access; linked PR #433 is also Open and unmerged; no released fix was observed.  
**Locator:** Reproduction and explanation at lines 160–186.  
**Observed operation:** Opened issue and checked status and minimal CRLF example.  
**Condition/default/exception:** Describes a stale line number after reading a CRLF-terminated record. PR #433 proposes a fix but was unmerged at access; see SRC13.  
**Applicability:** Verify source line reporting; prefer byte and logical record index.

## SRC05

**Exact URL:** https://github.com/BurntSushi/rust-csv/issues/377  
**Version/commit:** Upstream issue opened 2024-12-21; Open at access.  
**Locator:** Duplicate header example and maintainer response, lines 156–184.  
**Observed operation:** Opened duplicate-field discussion.  
**Condition/default/exception:** Repeated header names make map/struct deserialization ambiguous; suggested Vec approach was not accepted as a general deserializer solution.  
**Applicability:** Preserve column positions and prompt on duplicate normalized header names.

## SRC06

**Exact URL:** https://docs.rs/rust_decimal/1.43.0/rust_decimal/struct.Decimal.html  
**Version/commit:** rust_decimal 1.43.0.  
**Locator:** `from_str_exact`, lines 616–625.  
**Observed operation:** Read the precise decimal parsing method and underflow note.  
**Condition/default/exception:** Exact decimal text parse rejects values not representable at the scale; no locale selection is supplied.  
**Applicability:** Only after explicit separator rules validate raw text.

## SRC07

**Exact URL:** https://docs.rs/encoding_rs/0.8.42/encoding_rs/struct.Encoding.html  
**Version/commit:** encoding_rs 0.8.42.  
**Locator:** `decode_without_bom_handling_and_without_replacement` and explicit encoding/streaming decode guidance.  
**Observed operation:** Reviewed strict decoding APIs and alternate-encoding selection.  
**Condition/default/exception:** Strict decoder variants signal malformed input; replacement variants change malformed sequences to U+FFFD. Segmented input uses streaming Decoder.  
**Applicability:** Optional explicit encoding path; never silently replace malformed bytes.

## SRC08

**Exact URL:** https://docs.rs/polars-io/0.55.2/polars_io/csv/read/struct.CsvReadOptions.html  
**Version/commit:** polars-io 0.55.2.  
**Locator:** `with_infer_schema_length` lines 254–256; `with_ignore_errors` lines 269–271.  
**Observed operation:** Opened versioned CSV reader options.  
**Condition/default/exception:** Inference samples 100 rows by default; full scan is documented as slow; `ignore_errors` continues after ParserError.  
**Applicability:** Useful dataframe alternative, but importer must keep identifiers as text and surface every error.

## SRC09

**Exact URL:** https://www.sqlite.org/lang_transaction.html  
**Version/commit:** Current SQLite online docs; page is not version-pinned.  
**Locator:** Sections 2–3, including DEFERRED/IMMEDIATE and error rollback behavior.  
**Observed operation:** Read transaction lifecycle, one-writer rule, SQLITE_BUSY and error behavior.  
**Condition/default/exception:** Default is DEFERRED; IMMEDIATE may fail with SQLITE_BUSY; some I/O/full/interruption errors may leave transaction active or cause automatic rollback.  
**Applicability:** Conditional on SQLite being the actual database. Require explicit rollback/retry-state checks.

## SRC10

**Exact URL:** https://www.sqlite.org/atomiccommit.html  
**Version/commit:** Current SQLite online docs; page is not version-pinned.  
**Locator:** Sections 1, 3, and 4; rollback-journal description and recovery.  
**Observed operation:** Reviewed atomic commit guarantee and journal-mode scope.  
**Condition/default/exception:** One transaction appears all-or-none; detailed commit mechanism shown is rollback-mode; WAL uses a different mechanism.  
**Applicability:** Supports a SQLite example if stock updates and import marker are in one DB transaction; does not make separate files atomic.

## SRC11

**Exact URL:** https://community.owasp.org/attacks/CSV_Injection  
**Version/commit:** Current OWASP Community page; no version tag.  
**Locator:** Formula interpretation lines 18–28; Excel tab prefix and data trade-off lines 51–61.  
**Observed operation:** Read untrusted-input formula risk and mitigation limitations.  
**Condition/default/exception:** Spreadsheet software can treat leading formula characters as executable; mitigation may alter data and differs by client.  
**Applicability:** Keep imported values inert; review any later spreadsheet export separately.

## SRC12

**Exact URL:** https://github.com/tafia/calamine/releases/tag/v0.36.0  
**Version/commit:** Calamine 0.36.0, tag commit 2872ac1 as reported in release page.  
**Locator:** v0.36.0 Added/Changed/Fixed notes; streaming formula API, MSRV 1.88 change, formula/name and number-format fixes.  
**Observed operation:** Opened upstream release history and compared true workbook support to the delimited-text scope.  
**Condition/default/exception:** Release adds streaming XLSX cell/formula records and changes dependency/MSRV compatibility.  
**Applicability:** Possible future XLSX path only; not needed for the brief's delimited text and not evaluated on a workbook.

## SRC13

**Exact URL:** https://github.com/BurntSushi/rust-csv/pull/433  
**Version/commit:** Open pull request against master; commit 815ddab on contributor branch (2026-08-30); not merged/released.  
**Locator:** PR summary/status lines 131–178; change/test excerpts lines 257–359 and 415–489.  
**Observed operation:** Reviewed the proposed source diff and tests after discovering it linked from issue #395.  
**Condition/default/exception:** Patch consumes full CRLF before record return and adds CRLF/split-buffer tests; PR remains open and has no reviews shown. Contributor-reported tests were not independently run.  
**Applicability:** Require a released/pinned version and verify the fix before relying on physical line reporting.
