# Sources index (navigable) — critic stage

Stage: A-M04-B / treatment / critic. Method M04 v1 (amendment-preservation).
All critic fetches 2026-10-09 ~19:37–19:38 UTC via `web_fetch` (HTTP GET, observed status captured per file) plus one `web_search` used only to locate the primary OpenRefine manual section. Source IDs C01–C03 are immutable in this map version; no rebinds. Predecessor IDs S01–S11 (research stage) were inspected in place under the declared source root and are cited as `Sxx (predecessor)` where the critique relies on them; they are not redefined here.

| ID | File | Primary source | Version / locator observed |
|----|------|----------------|----------------------------|
| C01 | [C01-duckdb-csv-current.md](C01-duckdb-csv-current.md) | DuckDB CSV reader reference | docs "current" (stable redirects to current); parameter table incl. allow_quoted_nulls, force_not_null, rejects_*, header, sample_size, max_line_size |
| C02 | [C02-openrefine-reusing-operations.md](C02-openrefine-reusing-operations.md) | OpenRefine official manual, Running page | current manual; "Reusing operations" section (Extract…/Apply… JSON, limits, batch clients) |
| C03 | [C03-ms-date-systems.md](C03-ms-date-systems.md) | Microsoft Support, Date systems in Excel | live Support article; 1900 vs 1904 systems, 1462-day offset, per-workbook flag; serial-60/epoch/code-path NOT on this page |

Failed/redirect observations (recorded, not silently dropped):

- `https://duckdb.org/docs/stable/data/csv/overview.html` → redirect notice to `/docs/current/data/csv/overview.html` (113 bytes); C01 uses the current target.
- `https://learn.microsoft.com/en-us/office/troubleshoot/excel/1900-and-1904-date-system` → "Content retirement" page (HTTP 200, retired-content body); C03 uses the live Support replacement above.
- `https://docs.openrefine.org/manual/running/` → redirect to `https://openrefine.org/docs/manual/running/`; C02 uses the redirect target.

Mutable-drift note: C01 ("current") and C02/C03 (live manual/support pages) can drift; version pins above are what was observed at fetch time. Where behavior matters (DuckDB NULL/rejects defaults, OpenRefine JSON limits, Excel date-system flag), critique.md carries the observed values and marks what still needs a pinned recheck at build.
