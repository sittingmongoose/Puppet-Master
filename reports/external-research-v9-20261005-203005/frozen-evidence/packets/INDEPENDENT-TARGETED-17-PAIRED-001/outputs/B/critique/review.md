# Diagnostic critique — D-V11-B

## Scope and evidence

This review checks the admitted seed proposal against the full captured DuckDB CSV faulty-data contract, DuckDB's issue/fix/test chain, the pinned nbformat schema, and marimo's reactivity guide. Exact captures and locators are recorded in the current `sources.json`. The targeted counterexample search covers `inputs/source_context/0000.body`, `0006.body`, `0015.body`, `0017.body`, `0018.body`, `0024.body`, and a fresh public fetch of the DuckDB v1.1.0 regression test and scanner source. This is a bounded source check, not an exhaustive repository search or proof of autonomous discovery.

## Supported claims preserved

- The nbformat v4.5 schema is a portable document contract, not a kernel-state or output-freshness contract [S7].
- marimo's documented static refs/defs DAG and stale behavior are a useful independent runtime precedent. Its docs explicitly say object mutations and attribute assignments are not tracked; interrupts cancel queued dependents [S9].
- DuckDB documents stop-and-throw CSV reading by default, explicit `ignore_errors` row skipping, and a separate `store_rejects` path with line/byte positions and original line content [S1]. Projection pushdown can avoid a cast error when the bad column is not read [S1].
- DuckDB issue #12596 → PR #12679 → source guard and regression test is a consequential failure/fix/test chain. The regression test and guard are present in the v1.1.0 tagged source [S2–S6].
- An output provenance/status overlay and clean-run artifact remain sound product choices; a synthetic check cannot validate a real notebook kernel or data engine.

## Corrections and affected dependencies

1. **Missing columns and nulls are conditional behaviors.** The docs classify too few columns as `MISSING COLUMNS`, while DuckDB also supports `null_padding`; the original PR says its default was true, whereas a later docs error example prints `null_padding=0` [S1–S2]. Do not claim a universal default or that every short row must fail. Pin the option explicitly for each supported engine version. Keep absent keys/columns distinct from explicit nulls; if padding is accepted, preserve a presence marker because the typed result can collapse both to NULL. This affects the import contract, schema migration, provenance, and validation tests.

2. **Skipping is not automatically auditable.** `ignore_errors` skips bad rows; `store_rejects` is the documented skip-and-record mode, with its own reject limit [S1]. The seed's statement that an `ignore_errors`-style mode writes the same ledger is a proposed wrapper behavior, not an engine guarantee. Default to failure; allow a quarantine path only when the product can prove the ledger is complete. This affects error policy, result counts, and export manifests.

3. **Validation must cover unprojected fields.** DuckDB's projection-pushdown caveat is a concrete counterexample to treating a successful selected-column query as full-schema validation [S1]. Run an explicit all-column validation pass or report validation scope as partial. This affects preview claims and current/fresh output status.

4. **The 5 GB evidence was overstated in the seed.** The cited v1.1.0 commit capture is a commit/patch record for allocator bulk-deallocation flushing, not a workload benchmark and not evidence that a 5 GB input or every global operator meets the workstation target [the commit capture is not used as proof here]. DuckDB's captured performance guide does document larger-than-memory spill support for grouping, joining, sorting, and windowing, but this remains general guidance rather than a measurement for the proposed workload [S11]. Keep the target explicitly unverified; benchmark the exact version, file format, operator, memory cap, disk, and concurrency.

5. **Notebook order and dependency graphs need scoped claims.** nbformat `execution_count` is a prompt number and may be null; it is not by itself a complete execution history [S7]. Store actual order in run events. marimo's DAG is based on static global refs/defs and documented mutation blind spots [S9]; do not claim that such a graph captures all Python effects. Use it conservatively for staleness hints, and replay `.ipynb` in document order unless the user explicitly chooses a different plan.

6. **Sandbox claims remain proposed.** The admitted executor receipt describes isolation for this candidate check, not a product sandbox. No source or check here establishes that a future product blocks undeclared filesystem access. Preserve the valid rejection of import blacklists as an isolation boundary, but change “sandbox blocks it” to a proposed OS-level policy plus an unexecuted escape/permission test. This affects execution guarantees and the clean-replay boundary.

7. **Prior seed witness receipts are not adopted.** The new witness inventory includes only the check executed in this Goal with its actual tool receipt. The seed W1–W4 claims are not evidence for this stage because their code/input receipts were not independently supplied as current execution results.

## Fix-chain version/applicability correction

The issue reports the extra all-NULL row for DuckDB 1.0.0 and a nightly, with `null_padding=true` and `parallel=false` [S2]. PR #12679 merged to `main` as `2532c30fa649ac6296c7ab2b55976b4337ff46ce` on 2024-06-24; the patch adds a `chunk_col_id > 0` guard and a fixture/test covering both parallel and serial reads [S3–S4]. The test file and guard are present in the v1.1.0 tag [S5–S6], so v1.1.0 applicability is directly evidenced. The supplied evidence does not establish the first earlier 1.0.x release that contained the fix. No DuckDB runtime was executed here; the issue reproduction and merged regression test are source evidence, not a fresh reproduction.

## Preserved design and bounded alternative

Keep the local-folder project, one Python notebook runtime, shared tabular engine for optional SQL, explicit event/output association, conservative invalidation, read-only inputs, and standard notebook interchange. Keep marimo as a plausible alternative if the team is willing to make `.py` reactive documents its primary form. The current proposal tightens the row contract and removes unsupported capability/performance guarantees without discarding those useful mechanisms.
