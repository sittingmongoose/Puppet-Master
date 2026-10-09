# Source index and bounded observations

Source IDs are immutable in source-map.json. Notes below are paraphrases, not downloaded documents.

| ID | Topic | URL/version locator |
|---|---|---|
| S01 | DuckDB sampling/types/dates | https://duckdb.org/docs/current/data/csv/auto_detection — docs 1.5 current; lines 515–553, 590–653 |
| S02 | DuckDB CSV defaults | https://duckdb.org/docs/current/data/csv/overview — docs 1.5 current; parameter table |
| S03 | DuckDB errors/rejects | https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files — docs 1.5 current; lines 530–577, 622–696 |
| S04 | DuckDB Excel behavior | https://duckdb.org/docs/current/guides/file_formats/excel_import — docs 1.5 current; lines 515–530, 554–610 |
| S05 | DuckDB memory | https://duckdb.org/docs/current/operations_manual/limits ; https://duckdb.org/docs/current/guides/performance/oom — docs 1.5; lines 517–527 and OOM 515 |
| S06 | Rust csv parser | https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html ; https://docs.rs/csv/1.4.0/csv/struct.Reader.html — csv 1.4.0, 2025-10-17 |
| S07 | Arrow CSV | https://arrow.apache.org/rust/arrow_csv/reader/index.html ; https://arrow.apache.org/rust/arrow_csv/reader/struct.ReaderBuilder.html — API 59.1.0 per official result |
| S08 | Calamine value/epoch | https://docs.rs/calamine/0.36.1/calamine/enum.Data.html ; https://docs.rs/calamine/0.36.1/calamine/struct.Xlsx.html — crate 0.36.1 |
| S09 | Calamine stream | https://docs.rs/calamine/0.36.1/calamine/struct.XlsxCellReader.html — crate 0.36.1, lines 40–55 |
| S10 | Power Query type/locale | https://learn.microsoft.com/en-us/power-query/connectors/text-csv ; https://learn.microsoft.com/en-us/power-query/data-types — current docs, updated 2026-08-14 |
| S11 | OpenRefine history/export | https://openrefine.org/docs/manual/running ; https://openrefine.org/docs/manual/exporting — current docs, lines 375–401 / 112–130 |
| S12 | OpenRefine memory | https://openrefine.org/docs/manual/installing ; https://openrefine.org/docs/technical-reference/architecture-4 — current docs, different generations |
| S13 | OpenRefine Excel issue | https://github.com/OpenRefine/OpenRefine/issues/1908 — issue against 3.1, lines 175–206 |
| S14 | OpenRefine fix | https://github.com/OpenRefine/OpenRefine/pull/2909 ; https://github.com/OpenRefine/OpenRefine/commit/306b541 ; https://github.com/OpenRefine/OpenRefine/commit/c5aed37 — merged 2020-07-09 |
| S15 | OpenRefine release | https://github.com/OpenRefine/OpenRefine/releases/tag/3.5.0 — tag d4209a2, 2020-11-07 |
| S16 | OpenRefine CSV issue | https://github.com/OpenRefine/OpenRefine/issues/7042 ; https://github.com/OpenRefine/OpenRefine/pull/7703 — issue/PR, milestone 3.10.2 |

### Retained evidence
- S01: “The default sample size is 20,480 rows.” Seekable files can sample different locations; gzip/stdin samples begin at the start. DuckDB documents ambiguous dates and all-VARCHAR fallback.
- S02: Current parameter table shows store_rejects defaults false, rejects_limit 0 means no cap, strict_mode true, supported UTF encodings and line-size configuration.
- S03: reject records may contain line/byte positions, column, error type, source line and message; collection must be requested.
- S04: DuckDB XLSX infers using value/number format; empty cells default DOUBLE, failed casts with ignore_errors become NULL.
- S05: 80% default applies only to buffer manager; OOM guide suggests lowering to 50–60% in some cases.
- S06: has_headers true, flexible false and no trimming are defaults; read_record supports buffer reuse and row positions; parsed strings are not original bytes.
- S07: Arrow requires schema; batch_size is 1024 records by default; projection/header validation are configurable.
- S08/S09: Calamine Data distinctions include DateTime/DateTimeIso/Empty/Error; workbook epoch available; XLSX cell iterator offers formula and cached-value metadata.
- S10: Power Query exposes first 200/all/Text choices and date Using locale.
- S11: OpenRefine operation JSON can be reapplied; single-cell edits are not extracted; archives preserve history/raw previous values.
- S12: Installing guidance (1 GiB, large >1M cells or >50 MB) and v4 lazy-read architecture describe distinct generations.
- S13/S14/S15: 3.1 Excel date-to-text regression diagnosed as old date type surviving Java 8 type migration; PR changed importer to OffsetDateTime and added tests; 3.5 milestone/release record.
- S16: 3.7-to-3.8 quote-option behavior issue, linked to fix PR; keep compatibility fixtures.

Browser operations were web searches plus exact page opens/finds noted per source in source-map.json. No source files were downloaded. All docs with rolling URLs are labeled as current at access; crate releases and GitHub short commit identifiers are fixed as listed. S06's last exact versioned open returned Internal Error; the map says so and preserves the earlier successful docs.rs observation used.
