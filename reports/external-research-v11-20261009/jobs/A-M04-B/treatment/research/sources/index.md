# Sources index (navigable)

Stage: A-M04-B / treatment / research. All fetches 2026-10-09 ~19:27–19:30 UTC
via `web_fetch` (HTTP GET, observed status captured per file). Source IDs are
immutable; no rebinds (v1 of this map).

| ID | File | Primary source | Version / locator observed |
|----|------|----------------|----------------------------|
| S01 | [S01-python-csv.md](S01-python-csv.md) | Python stdlib `csv` docs | 3.15.0 docs; `Lib/csv.py` |
| S02 | [S02-excel-1900-bug.md](S02-excel-1900-bug.md) | Microsoft Learn troubleshooting article | ms.date 2026-03-30; commit 15b7b561 |
| S03 | [S03-polars-read-csv.md](S03-polars-read-csv.md) | Polars `read_csv` API reference | stable docs; py-2.0.0 functions.py L49–530 |
| S04 | [S04-duckdb-csv.md](S04-duckdb-csv.md) | DuckDB CSV reader reference | docs "current" |
| S05 | [S05-xsv.md](S05-xsv.md) | xsv README (BurntSushi/xsv) | repo HEAD at fetch; version UNKNOWN |
| S06 | [S06-openpyxl-optimized.md](S06-openpyxl-optimized.md) | openpyxl optimised-modes docs | 3.1.3 docs |
| S07 | [S07-table-schema.md](S07-table-schema.md) | Frictionless Table Schema spec | spec v1 |
| S08 | [S08-openrefine.md](S08-openrefine.md) | OpenRefine homepage | current page (full, untruncated) |
| S09 | [S09-pandas-read-csv.md](S09-pandas-read-csv.md) | pandas `read_csv` API reference | 3.0.6 docs; readers.py L349–872 @ v3.0.6 |
| S10 | [S10-duckdb-sniffer.md](S10-duckdb-sniffer.md) | DuckDB official blog | 2023-10-27, P. Holanda |
| S11 | [S11-openpyxl-datetime.md](S11-openpyxl-datetime.md) | openpyxl datetime utils API | 3.1.3 docs |

Failed observation (recorded, not silently dropped):

- `https://openrefine.org/docs/manual/introduction` → HTTP 404 in this
  session; replaced by S08 homepage fetch. No claims in this stage depend on
  the 404'd page.

Mutable-drift note: docs labeled "stable"/"current" (S03, S04) and repo HEAD
(S05) can drift; version pins above are what was observed at fetch time.
Where behavior matters (S03 inference window, S04 sniffer defaults, S09
NA/type defaults), the draft carries the observed values and proposes a
version-pinned recheck as validation.
