# Source-check review — D-V11-B

Scope: source-check the supplied seed proposal and its witness/lead claims for the named notebook capability and malformed-data diagnostic. The public captures are evidence only; this does not establish autonomous source discovery. The review preserves claims that the admitted sources support and narrows claims that overreach those sources.

## Supported corrections

### R1 — Missing fields are not always distinguishable from NULL in the selected engine

The seed’s D7 says explicit nulls and missing fields remain distinct, and W2 reports that its synthetic NDJSON transform exercised both. That is a valid contract goal and a limited component check, but it does not establish that DuckDB’s readers preserve that distinction.

- DuckDB’s captured JSON loading docs say missing object keys become `NULL` in the table result (`read_json` example with explicit columns; final-proposal source S6). Thus ordinary table output does not retain the distinction between an absent key and a JSON `null` value.
- DuckDB’s CSV docs distinguish a short row as `MISSING COLUMNS` when strict parsing is active, and document `null_padding` as the way to pad short rows (S5). The pinned v1.5.2 option header sets `null_padding=false` and `null_str={""}` by default (S10). The CSV scanner source has a branch that pads a short row when that option is on (S11). Consequently, padding alone yields NULL values without an error record that can serve as the missing-field provenance.
- CSV empty fields need an explicit null convention too: the v1.5.2 option header’s default null string is the empty string. Treating every blank as NULL would merge blank text and null; treating blank as text requires overriding and testing the reader’s defaults.

Correction: retain the requirement to distinguish absent fields, explicit nulls, configured null tokens, and empty strings, but place it in a raw-record presence map / reject ledger captured before normalization. For CSV, use explicit strict settings and reject/ledger short rows by default; optional padding must preserve an absent-field bitmap. For JSON/NDJSON, record per-object key presence before DuckDB maps missing keys to NULL, or disclose that a selected contract deliberately conflates them. Do not claim the existing W2 or DuckDB result table proves presence preservation.

### R2 — Projection can suppress errors in unselected CSV columns

The seed correctly cites DuckDB’s projection-pushdown caveat: the faulty-CSV docs show a bad `age` cast that errors when selected, then show `SELECT name` returning both rows because `age` is not cast (S5, section “Using the ignore_errors Option”). The captured scanner source also contains a projected-column branch that skips unselected values (S11). This directly defeats a universal claim that any ordinary query or preview discovers every malformed value.

Correction: keep a separate, full-contract validation pass that requests and checks every declared field, uses explicit schema and recorded reader options, and captures reject information. State that this is a product rule requiring implementation and test; it is not an automatic guarantee from projection pushdown, `ignore_errors`, or a sample preview. For arbitrary SQL queries, the result only validates fields actually read unless the full pass has run.

### R3 — `null_padding` default is versioned; do not leave the selected pin ambiguous

A 2023 DuckDB PR in the supplied search capture says `null_padding` defaults to true; the current faulty-CSV docs’ generated error block prints `null_padding=0` (S5 and the search capture in final-proposal S13). The v1.5.2 source header resolves the default for that exact tag: `bool null_padding = false`; it also sets `null_str` to the empty string (S10). The historical PR text alone is not a statement about all releases.

Correction: pin the prototype engine to DuckDB v1.5.2 / commit `8a5851971fae891f292c2714d86046ee018e9737`, pass `null_padding=false` explicitly in strict import/validation paths, and record all reader options in the data contract. The exact historical release in which the default changed is not established and does not need to be for this design.

### R4 — Keep the DuckDB regression chain, but state what was actually established

The issue capture reports an extra all-NULL row for `null_padding=true, parallel=false`, with reproduction on DuckDB 1.0.0 and nightly (S13). The timeline records a `reproduced` label and a link to PR #12679, merged 2024-06-24 (S14). The PR patch adds the `chunk_col_id > 0` condition around final null padding and adds `test_12596.test` (S15). To establish later release applicability, I fetched the v1.5.2 tag object and read its exact scanner, header, fixture, and regression-test files: the guard is present and the tagged test still expects exactly two padded rows for parallel and single-thread paths (S9–S12). The test and code are source evidence, not a test run by this candidate.

Correction: retain this as an issue → fix → regression-test → tagged-source chain. Say the bug was reported against 1.0.0/nightly, the fix merged to `main`, and the fix/test are present in the v1.5.2 source. Do not claim this stage executed DuckDB’s test suite or prove behavior for uninspected intermediate releases. The issue report and test cover this specific fixture/configuration, not all CSV parser cases.

## Preserved valid content and limits

- The nbformat v4.5 schema supports the seed’s document-level claims: cell array order is document order; code cells require an `execution_count` that can be null; the schema defines output forms and kernelspec fields (S1). It does not encode live kernel state, output freshness, or a full execution history.
- marimo’s docs support a static references/definitions DAG, stale marking, dependency order, and the warning that mutation is not tracked; interrupts cancel queued dependent cells (S2). This is a useful independent runtime precedent, not proof that a static analyzer covers arbitrary Jupyter Python.
- papermill’s captured README supports parameterization and an API taking separate input and output notebook paths (S4). The product must still implement fresh-process execution, sandboxing, provenance, and cancellation.
- DuckDB’s captured concurrency docs support the single-process read/write versus multi-process read-only boundary and warn about locks on shared/network filesystems (S8). A project lock and read-only second opener remain product decisions.
- PEP 723 standardizes inline script metadata fields, but explicitly does not define a runner; auto-installing dependencies from an untrusted script can execute downloaded code (S16). It cannot be used as an environment resolver or sandbox claim.
- The supplied W1–W4 inventory reports prior candidate checks. Its summaries are useful scoping context, especially W2’s synthetic-only limit, but the supplied inventory has no actual code/input payloads in this stage. I do not promote those reports as checks executed by this current stage. The new witness below is the only current executed check.

## Affected dependencies and unresolved work

The architecture still depends on (a) implementing presence capture before DuckDB normalization, particularly for NDJSON absent keys; (b) explicit CSV null-token and padding options; (c) a separate all-column validation path; (d) a pinned DuckDB distribution with required JSON/Parquet extensions available locally; and (e) an OS-level sandbox selected and escape-tested by the product team. The 5 GB envelope, full-sort/global-distinct resource behavior, crash recovery, cross-machine reopen, and production notebook runtime are not validated by source inspection or by the isolated component check. The proposed real-engine and system validation remains UNEXECUTED in the final proposal and witnesses catalog.