# Sources index — A-M04-B / treatment / reviser (S10 data-import)

Reviser-owned primaries (R01–R07, fetched in this stage; see `source-map.json`).
Predecessor evidence (S01–S11 under `.../treatment/research/sources/`) and critic
evidence (C01–C03 under `.../treatment/critic/sources/`) were inspected in place
under the declared source roots and are cited in `final.md` as
`Sxx (predecessor)` / `Cxx (critic)` — not rebound, not copied.

- [R01 — DuckDB rejects-table schema](R01-duckdb-rejects-schema.md) — `reject_scans`/`reject_errors` columns, params, worked CAST-error row. Grounds P4 store (M2).
- [R02 — DuckDB NULL/empty params](R02-duckdb-null-params.md) — `allow_quoted_nulls=true`, `force_not_null=[]`, `nullstr`, `sample_size`, `max_line_size`. Repairs P3 citation (M3).
- [R03 — OpenRefine reusing operations](R03-openrefine-reuse.md) — Extract/Apply JSON, single-cell-edit + undone-ops limits. Rewrites P5/A4 justification (M1).
- [R04 — openpyxl 1904 flag path](R04-openpyxl-flag-path.md) — `workbookPr`/`date1904`, `Workbook.epoch` getter/setter. Pins C1 flag read (M4).
- [R05 — openpyxl epochs + serial-60 pivot](R05-openpyxl-serial-pivot.md) — `WINDOWS_EPOCH`/`MAC_EPOCH`, `from_excel`/`to_excel` pivot code, serial-60 oracle. Pins C1/V3 Excel half (M4).
- [R06 — xsv archived; qsv fork](R06-xsv-qsv-maintenance.md) — xsv archived Apr 24 2025 read-only; qsv forked Sept 2021, index/sample/slice lineage. Re-bases A3, closes U3 (M8c/M9).
- [R07 — Power Query repeat model](R07-power-query.md) — repeatable query + refresh, host dependence, M language. Second competitor (M8a).
