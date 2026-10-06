# LabBook: local notebooks with explicit run and data provenance

**Stage:** D-V06-B-DEFERRED-R001-control-diagnostic-a001-CLOCK-R002  
**Basis:** frozen candidate draft, its source and witness catalogs, and the supplied public-source captures. This stage integrates that material; it does not establish autonomous source discovery. Source IDs below resolve to exact capture pins and locators in `sources.json`.

## Evidence labels

- **[F] Source fact:** directly stated or shown in a cited capture.
- **[I] Engineering inference:** reasoning from cited facts, with limits stated.
- **[C] Product choice:** proposed behavior, not an external component guarantee.
- **[W] Executed by candidate:** a check run in this stage's admitted isolated Python executor. These are component checks, not application tests.
- **[V] Proposed / UNEXECUTED:** implementation validation still required.

## Decision

**[C]** Build a local-first folder workspace around standard `.ipynb` documents, one supported Python kernel, a sidecar run-event journal, and an embedded DuckDB-based tabular path shared by Python transforms and optional SQL. Use static dependency analysis to help identify affected cells, but do not treat an inferred graph or saved notebook outputs as proof of execution history. A clean replay runs in a fresh process and writes a separate notebook artifact. Keep originals read-only and bind visible outputs to explicit successful run events.

This combines independent mechanisms: nbformat describes a portable notebook document without defining a runtime [S4]; marimo documents static reference/definition analysis and stale marking without tracking arbitrary mutation [S6]; DuckDB contributes an in-process SQL and file-query engine with explicit CSV error/reject handling [S2]. Papermill demonstrates executing a notebook to a distinct output document [S14]. None of those mechanisms alone supplies the proposed status, event, or isolation contract.

## Bounded correction: a saved notebook is not a run log

**Correction.** Do not recover the historical run order by sorting the saved `execution_count` values, and do not use those counts or saved outputs as proof that displayed outputs came from a clean replay. The nbformat v4.5 schema defines a per-cell `execution_count` that can be null and stores outputs in the document [S4]. It does not define an append-only history of cell executions or kernel state. **[I]** A cell's final count/output can retain only its latest visible execution; repeated runs and the intervening state changes are lost. A newly created or imported notebook also cannot prove which kernel state produced its saved output.

**[W]** A synthetic counterexample executed in the admitted isolated executor ran cells `A, B, A`. The final document had counts `A=3, B=2`; sorting those two final counts gave `B, A`, omitting the first `A` and the three-event history. Receipt `exec-8qnmkm6k` and exact code/input details are in `witnesses.json`. This demonstrates the document-field limitation in a tiny model, not Jupyter runtime behavior.

**[C] Repair.** Make the event journal—not `execution_count`—the provenance source for runs performed in LabBook. Record a monotonic event sequence and run/session ID for every cell attempt. For an imported notebook with no matching journal, retain saved outputs for inspection but badge them `unverified`; do not infer their producer or historic order. A clean replay is a new execution with a declared order, not an attempted reconstruction of hidden interactive state.

This links replay and staleness directly: a cached error after reconnect can look like a current error if the UI omits its origin. A captured marimo issue reports precisely that kind of ambiguity: a cached `ModuleNotFoundError` reappeared after reconnect although the server environment had changed; the issue was open in the supplied 2026-10-05 capture and leaves the snapshot/session path unresolved [S21]. Treat this as a reported failure mode, not proof of current marimo behavior in all releases. Every LabBook output therefore displays whether it came from an interactive event, a clean replay event, an imported document, or a cache.

## Project record and workflow

A project is an ordinary directory, optionally shared as a zip bundle. Example:

```text
project/
  labbook.toml               # project ID, schema version, settings, Python support range
  environment.lock           # resolved, platform-scoped dependency lock
  datasets.yml               # logical names, external URIs, format, schema and identity
  notebooks/*.ipynb          # portable document; normal cell order is display order
  transforms/                 # Python scripts and declarative transform metadata
  sql/                        # optional SQL against registered datasets
  .labbook/events.jsonl       # append-only run and invalidation journal
  .labbook/outputs/           # content-addressed large results / separate replay notebooks
  .labbook/cache/             # disposable derived data
  .labbook/tmp/               # staged writes
  manifest.repro.json         # compact export manifest
```

**[C]** The project record stores a stable project ID, notebook and transform hashes, logical dataset references, declared schemas/parser options, environment lock and execution settings. Dataset identity is a streamed content digest plus byte size; modification time may prompt a recheck but is not identity. External data remain at their source unless the user explicitly bundles them. A moved project can resolve relative dataset references; missing or changed external files are reported and affected results become stale or unverified. A bundle can include small outputs and the manifest without silently copying a large private dataset.

The normal workflow is:

1. **Create.** Scaffold the directory, project ID and environment declaration.
2. **Register data.** Select CSV, newline-delimited JSON or Parquet; inspect a bounded schema/preview; explicitly pin or edit the schema, parser options and logical source path. Registration does not rewrite source bytes.
3. **Author.** Edit a notebook, Python transform or optional SQL query. Display order is document order. The dependency view marks inferred cell references and known data dependencies; dynamic constructs are identified as incomplete coverage.
4. **Preview and interact.** Preview reads only a bounded sample and says `sample`. Interactive runs execute in the live kernel, record actual event order, show progress and errors, and let the user cancel.
5. **Clean replay.** Start a fresh process from the declared environment, execute code cells in displayed order, and write a separate result notebook plus event record. Do not silently reorder an imperative Jupyter notebook from a static graph. If unsupported magics or unresolved prerequisites prevent a clean run, report the error and leave outputs unverified.
6. **Compare and save.** Show code/source/environment differences, row counts and output diffs; save atomically. The manifest records the selected run, output associations and checksums.
7. **Reopen and export.** On another machine, verify notebook, lock and dataset identities. Missing event history, unresolved data, a nonmatching environment, or a changed source downgrades output status. Export results and the small manifest; do not imply external data were included.

## Data contract and tabular path

**[C] Source identity and immutability.** Register URI, detected/declared format, full streamed SHA-256, byte size, schema contract and parser/engine settings. Read source files read-only. Write transforms to new, versioned artifacts. Rehash before a run when the source can change; size/mtime are only quick hints.

**[C] Schema and conversion.** Inference is a suggestion based on a bounded sample, never a whole-file guarantee. Require review and pin names, types, nullability, timestamp format/time zone and parser settings into the dataset contract. Schema changes require an explicit diff and approval; existing outputs remain bound to the previous contract. Cast failures stop by default and report source location, field, reason and raw record where safe. Never silently delete malformed rows. If the user explicitly selects a permissive mode, write each rejected row/reason/offset to a reject ledger and mark the result as filtered. DuckDB's captured CSV documentation describes structural and cast errors, stop-and-throw defaults, reject-table support, and a projection-pushdown caveat where an unselected bad field may escape a cast error [S2]. Therefore a full contract-validation action scans every declared field rather than relying on the columns used by one query.

Keep absent fields distinct from explicit nulls; preserve Unicode; parse timestamps only under a declared rule; use an explicit variant type for heterogeneous values. Report unsupported encodings, malformed records and schema drift instead of coercing silently. For CSV quoted multiline records, use parser-provided record locations rather than assuming physical line number is a record number.

**[C] Row identity and ordering.** Preserve source row ordinal/byte location as lineage when a streaming transform can do so; prefer a declared business key if one exists. Record output row count and a digest over a canonical typed encoding, including null/missing distinctions. A streaming map may preserve input order and call it *stable for that source version*. Filters retain relative order only when the engine path guarantees it. Joins, aggregates and unordered SQL have no meaningful order unless the query supplies a total sort key; call output *deterministic* only when that key breaks ties. A preview or sample-derived statistic never proves a full-dataset property.

**[C] Engine and independent data opportunity.** Use DuckDB as the first implementation candidate for file scans, bounded preview, SQL and transforms over CSV/NDJSON/Parquet. SQL is a query surface over the same registered sources and provenance, not another notebook kernel. The captured CSV docs support error/reject mechanisms [S2], while a tagged source capture shows buffer-pool eviction and a memory limit [S13]. These are useful mechanisms, not evidence that every operator streams or that a 5 GB workload meets the envelope. An independent opportunity is an inspectable reject-ledger/data-quality pane backed by the same read path; it adds value even if the notebook runtime choice changes.

**[W]** A small candidate-authored streaming component check consumed 200 generated NDJSON lines through a generator, retained batches of at most 32 rows, recorded the malformed line at line 74/byte offset 7197, accepted the other 199, and labeled a five-row preview as a sample. It exercised Unicode, explicit null, a missing field and timestamp text. Receipt `exec-pn8dp9hx` is detailed in `witnesses.json`. This verifies only this Python harness; it does not measure RSS, read a 5 GB file, validate DuckDB, or prove format compatibility.

**[C] Envelope and operations.** Target 8 cores/16 GB RAM. Hashing large inputs is a streaming read; cache only when the complete key (source hash, schema/parser contract, transform code, locked environment, engine version and parameters) matches. Cache entries are disposable and never authoritative. Classify operators before execution as bounded-streaming, spillable, or requiring an explicit limit. A 5 GB scan/filter and selected aggregates are targets for measurement; global sort, exact distinct, large joins and high-cardinality aggregation may spill or exceed disk/RAM bounds. Show estimates/limits and allow cancellation. Large outputs spill to content-addressed project storage with a preview, digest and pointer; never embed unbounded result tables in notebook JSON.

**Concurrency and recovery [C].** Use a project-level single-writer lock; secondary opens are read-only. Do not place a live writable database on a shared/network filesystem unless its locking semantics are validated. DuckDB documents single-process read/write versus multi-process read-only access and cautions around shared-directory locking [S3]. Save through temp file, flush/fsync where supported, atomic replace, then append a checksummed event record; on recovery, ignore/truncate an incomplete trailing journal frame and mark affected outputs unverified. These filesystem guarantees need platform-specific validation. Real-time multiwriter editing is optional.

## Notebook semantics, output status, and replay

The UI distinguishes four things:

- **Displayed order:** cell-array position in the notebook document [S4].
- **Interactive event order:** exact cell attempt sequence captured by LabBook's event journal. `execution_count` is retained for interchange but is not the journal.
- **Kernel state:** process-local mutable state, discarded on restart and never treated as saved provenance.
- **Visible output origin:** an association to a producing run event, or `unverified` if no association exists.

**[C] Output status.** Status belongs to a particular displayed result and its producer:

| Status | Meaning |
|---|---|
| `current` | A successful recorded run matches current cell code, declared dependency/input identities, environment lock and relevant settings. |
| `stale` | A known upstream code, data, schema, transform or environment input changed after the producer event. |
| `failed` | The displayed result is an error from the latest attempt for that cell/input fingerprint. If an older successful value is retained, label it separately as stale/unverified. |
| `unverified` | Origin or dependency coverage is missing, the kernel restarted, a run was interrupted/cancelled, an event journal is missing, or inputs/environment cannot be checked. |

A status badge includes event ID, run kind, time, environment fingerprint and source identities, with accessible text as well as color. Errors expose message and traceback; rejects expose row location and reason. Diff saved/current outputs with exact equality where bounded and with row count, schema and digest for large results; do not call a sample diff a full-result proof.

**[C] Invalidation.** Editing a cell marks its prior result stale and invalidates known descendants in the static dependency graph. Changing a dataset content digest or schema invalidates all known readers and descendants. Changing the lock, Python, engine or material runtime settings invalidates affected outputs; if the scope cannot be determined, mark the notebook unverified. Restart marks every existing output unverified until rerun. Cancellation/interrupt marks the active cell and any not-yet-run dependent work unverified. A run error creates a failed attempt; it does not make an older successful output current. Persisted outputs stay visible with their old status rather than being silently cleared or relabeled.

Marimo describes static refs/defs analysis, stale marking in lazy mode, and explicitly says variable mutation is not tracked [S6]. **[I]** This is useful impact analysis but not a sound dependency oracle for arbitrary Jupyter Python. For dynamic imports, hidden file reads, mutation or reflective code, show incomplete graph coverage and conservatively invalidate more broadly; require declared inputs for files/services. A merged marimo reload fix used per-cell generations to prevent a late invalidation from re-staling cells that had already rerun [S21]. Reuse the race-control idea only as an implementation hypothesis; test our own state transitions.

**[C] Clean replay and honest guarantee.** Clean replay means a new process/kernel, captured resolved environment, declared file inputs, network disabled by default, code cells in displayed order, progress per cell, cancel, and a separate output notebook. Papermill is a precedent for parameterized execution to a separate output document; it does not establish our scheduler or status behavior [S14]. A clean replay guarantees that the product launched the recorded code under the recorded declared inputs/settings in a fresh process and associates the produced output/error with that attempt. It can compare output bytes/values and report whether two runs match. It does **not** guarantee identical results merely because a run is called clean.

Results can still differ through randomness, clocks, floating-point/platform variation, GPU/BLAS, engine behavior, unpinned packages, undeclared file access, external services or mutable external data. Lock packages and record interpreter, OS/architecture, engine, relevant settings and input digests; when dependencies float or the environment cannot be rebuilt, show that limitation and do not badge prior outputs current. Any optional network access is explicit, recorded, and lowers reproducibility confidence. Never infer from a successful replay that all interactive histories are reproducible.

## Execution boundary

Notebook code is untrusted. Run it in a separate OS-isolated process with project state writable only where necessary, source datasets read-only, explicit declared input paths, no credentials, network disabled by default, and CPU/memory/time/process limits. Allow a visible opt-in for network or additional filesystem access and record it in the event. Kill on limit/cancel and mark affected outputs unverified. Opening/browsing a project renders notebook JSON and bounded previews; it never executes code or auto-installs dependencies.

An import blacklist is not isolation. The experiment's executor receipt records OS-level Bubblewrap/systemd isolation and resource limits, not an AST filter; this supports the boundary pattern only [W, witnesses.json]. The production primitive, Windows behavior, filesystem mediation and escape resistance are unselected and untested [L1]. Strict no-network/read-only data permissions reduce convenience for workflows that fetch packages/data or write beside inputs; offer explicit grants with provenance rather than silent exceptions.

## Environment, support boundary, and interchange

Support one notebook kernel: Python. Set a maintained support range at implementation time; a reasonable initial policy is Python 3.11–3.13 with 3.14 compatibility testing before claiming support. The supplied policy/date captures show a five-year CPython support lifecycle and Python 3.10 EOL on 2026-10-01, just before this stage date [S15, S16]. Recheck upstream lifecycle dates at release; endoflife.date is an aggregator, not the release authority. Pin interpreter and dependencies in a platform-scoped lock. The project manifest owns dependencies; PEP 723 is an inline **script** metadata convention (`# /// script`), useful for exported scripts but not a complete notebook runtime or lock by itself [S17]. Do not auto-install dependencies from a shared notebook.

Use nbformat 4.5-compatible `.ipynb` for document exchange [S4]. Its schema provides stable cell IDs, document order, output shapes and kernel metadata; runtime order, freshness, locking and replay remain LabBook behavior. SQL is optional DuckDB SQL over the registry and shares its source identity and read-only boundary. Do not build additional language kernels for this team.

## Issue → fix → regression test: CSV null padding

A captured DuckDB issue reports an extra all-null row for a short-row CSV with `null_padding=true` under `parallel=false`, while the parallel path did not show it; the report identifies DuckDB 1.0.0 and was labeled reproduced in the issue timeline [S1, S9]. The captured PR #12679 metadata links the fix and says it merged to `main` on 2024-06-24 [S10]. Its patch adds a `result.chunk_col_id > 0` guard to the null-padding branch, and adds `test_12596.test` plus a fixture; the regression test asserts two expected rows for parallel and serial queries [S11]. This chain justifies recording parser version/configuration and adding row-count/shape checks for contract tests.

**Applicability limit:** a v1.0.0 commit capture predates the fix and a v1.1.0 tag commit capture postdates it [S12, S13], but those timestamps alone do not prove that the fix is ancestral to a particular release tag. The supplied captures do not establish the first shipped release, prove behavior across 1.0.x, or include an execution of DuckDB's regression test. Treat the release boundary and fixed-version behavior as unresolved until tag ancestry or release-specific test evidence is checked [L2]. Do not cite the merged PR alone as release behavior.

## Minimum coverage and realistic validation

| Need | Proposed mechanism | Evidence status |
|---|---|---|
| Project creation and portable exchange | Ordinary folder, project ID, optional zip, manifest | Product choice; implementation unexecuted |
| Register data without unnecessary copy | External read-only references plus streamed content identity | Product choice; full-file hashing/performance unexecuted |
| Author notebook/transform | `.ipynb`, Python scripts, optional SQL | Format facts [S4]; integration unexecuted |
| Bounded preview | Engine limit and explicit `sample` label | Candidate component check [W]; production query unexecuted |
| Interactive selected work | Live Python process, explicit submitted order and event log | Product choice; real-kernel validation unexecuted |
| Clean replay, cancel, progress, errors | Fresh process, displayed-order replay, separate output artifact | Papermill pattern [S14]; application behavior unexecuted |
| Provenance and staleness | Per-output event association, dependency impact, four statuses | Component model claim inherited from seed; see witness caveat |
| Save/reopen/export | Atomic directory writes, verification and compact manifest | Product choice; crash/reopen matrix unexecuted |
| Data quality and scale | Reject ledger, streaming/spill classifications, source-preserving outputs | DuckDB CSV facts [S2]; 5 GB target unverified |

**[V] Proposed / UNEXECUTED validation:**

1. Build a real minimal notebook runtime test with displayed order different from interactive event order, repeated cell runs, mutation, cached error on reconnect, restart, cancel and environment/source changes. Verify a fresh replay's declared order, new run ID, separate output file, exact stale/failed/unverified transitions, and that no old output becomes current. Include notebooks with dynamic imports and magic commands; test conservative graph fallbacks. The expected correction is that prior order remains available only if captured in the event journal; the document counts cannot reconstruct it.
2. Run the same deterministic notebook twice from a clean locked environment and compare values/bytes, then introduce unseeded randomness, wall-clock use and a changed source. Verify truthful equality reporting and status invalidation, not a promise of deterministic output.
3. Generate representative 5 GB CSV, NDJSON and Parquet datasets under the 8-core/16 GB envelope. Measure hash throughput, preview latency, RSS, temporary disk and cancellation. Check UTF-8, null vs missing, timestamps, schema drift, malformed records and complete reject accounting. Compare results to a small trusted oracle; the synthetic candidate check does not satisfy this gate.
4. Run global sort, distinct and high-cardinality joins; check pre-run bound labels against observed spill/failure and ensure cancellation cleans temporary files. Verify no operation silently materializes the full source in memory.
5. Run the DuckDB #12596 fixture against explicit version pins; also verify each candidate shipped tag's ancestry contains the fix before making a version claim. Test parser configuration and row-shape contracts during engine upgrades.
6. Exercise kill-at-save fault injection, torn event frames, parallel open and lock recovery on supported filesystems; move/copy a project to another machine and check source/environment mismatch, output association and manifest verification.
7. Audit OS sandbox filesystem/network/process/resource limits with escape attempts on each claimed platform. A passing stdlib component check is not a sandbox audit.
8. Run accessibility checks for keyboard access, screen-reader status/error announcements, readable diffs and non-color status cues.

## Opportunity and alternative

**Useful opportunity [C]:** make rejected rows, schema changes and sample/full-scan distinctions a compact data-quality panel that can be inspected before notebook execution. This reuses engine diagnostics and helps analysts catch parser drift without turning preview into a proof claim.

**Plausible alternative [C]:** adopt marimo as the runtime and keep `.ipynb` for import/export. It offers dependency-based execution and stale marking [S5, S6], reducing custom graph work. It makes the team's existing notebooks second-class and still requires explicit provenance rules for cached/reconnected outputs; the captured issue #9881 is a concrete reason not to assume the runtime badge alone closes that gap [S21]. The selected design keeps Jupyter documents and builds a conservative sidecar status layer.

## Boundaries and unresolved items

No real notebook product, DuckDB workload, 5 GB test, package build, sandbox escape test, concurrent writer or crash-recovery test was run here. The supplied W1–W4 summaries are retained in `witnesses.json` as inherited candidate reports, but their code/input and full raw receipts are absent from the supplied catalog; this proposal does not rely on their conclusions as verified evidence. Current candidate-executed checks are W5 (document counterexample) and W7 (synthetic streaming harness). Leads and next evidence steps are listed in `leads.json`.
