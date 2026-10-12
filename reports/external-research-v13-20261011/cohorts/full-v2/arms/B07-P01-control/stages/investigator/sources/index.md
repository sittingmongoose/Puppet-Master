# Source index

Access UTC recorded for this focused source pass: **2026-10-12T00:41:17Z**. Direct primary-source links and stable IDs are used so a later stage can cite each observation without rebinding it. The source map in [../source-map.json](../source-map.json) contains the required source identity fields. Sources are bounded to the brief's needs; no supplier file, production application repository, or private data was read.

## Format and profile

- **S01 — RFC 4180 (Informational, 2005).** [Open the RFC](https://www.rfc-editor.org/rfc/rfc4180.html) · §2: optional headers, commas, width expectation, spaces, quoted line breaks/commas/quotes. Use as common-format context, not a universal guarantee.
- **S02 — W3C CSVW metadata (Recommendation, 2015-12-17).** [Open the dated Recommendation](https://www.w3.org/TR/2015/REC-tabular-metadata-20151217/) · dialect description, defaults, schema column titles/types/constraints. A model for a documented profile subset.

## Parser alternatives and source code

- **S03 — Rust csv 1.4.0 ReaderBuilder.** [Versioned API](https://docs.rs/csv/1.4.0/csv/struct.ReaderBuilder.html) · explicit dialect/header settings; unequal-field default and flexible exception.
- **S04 — Rust csv 1.4.0 Position.** [Versioned API](https://docs.rs/csv/1.4.0/csv/struct.Position.html) · byte offset, line and record numbering.
- **S05 — Rust csv 1.4.0 source with inline tests.** [Tagged reader.rs](https://raw.githubusercontent.com/BurntSushi/rust-csv/1.4.0/src/reader.rs) · record iteration, unequal-width check, read_record_unequal_ok test.
- **S06 — Python 3.14.8 csv docs.** [Versioned docs](https://docs.python.org/3.14/library/csv.html) · string records, dialects, Sniffer, strict mode and line_num.
- **S07 — CPython 3.14.8 code/tests.** [Sniffer implementation](https://github.com/python/cpython/blob/v3.14.8/Lib/csv.py) · [CSV tests](https://github.com/python/cpython/blob/v3.14.8/Lib/test/test_csv.py) · sample-based dialect inference; tests for physical line counts, quoted newlines and large fields.
- **S08 — DuckDB CSV Import preview docs.** [Current preview docs](https://duckdb.org/docs/preview/data/csv/overview) · auto detection and sample_size default 20,480, strict mode, explicit types and numeric separators. Moving documentation, not an immutable release.
- **S09 — DuckDB issue #25827.** [Open issue reported 2026-09-17](https://github.com/duckdb/duckdb/issues/25827) · specific report of silent early-row loss when sniffed dialect changes; reported, not independently reproduced.
- **S10 — rust-csv Discussion #402.** [Maintainer answer](https://github.com/BurntSushi/rust-csv/discussions/402) · unequal field counts and the permissive-parser option; discussion, not release history.

## Persistence alternatives

- **S11 — SQLite transactions.** [Current transaction reference](https://www.sqlite.org/lang_transaction.html) · transaction lifecycle and BEGIN IMMEDIATE/SQLITE_BUSY.
- **S12 — SQLite UPSERT.** [UPSERT reference](https://www.sqlite.org/lang_upsert.html) · uniqueness conflicts, update behavior and version history (3.24.0 / 3.35.0).
- **S13 — PostgreSQL 18 COPY.** [Versioned reference](https://www.postgresql.org/docs/18/sql-copy.html) · default errors, ON_ERROR, reject limits and verbose diagnostics.

### Evidence handling

The DuckDB issue is an upstream report and was open/needs-triage when accessed; it is a risk signal, not independently verified product behavior. The Rust discussion is maintainer guidance, not a fixed issue. The preview docs are moving and have no release pin in the page. No application repository or target database version was supplied. No tests or executable code were run.
