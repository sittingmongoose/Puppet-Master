# LabBook proposal: notebook provenance with explicit data semantics

**Stage:** D-V01-B-control-diagnostic-a001-resource-v13-a002  
**Evidence posture:** This V01 arm is the legacy-workflow comparator: criticism is by reading and reasoning, without a newly added calculation/execution capability. This does not characterize every ordinary agent. I inspected the frozen draft, its supplied source captures and fresh public captures; this work does not establish autonomous discovery independent of those supplied materials. No new check code was executed in this stage.

## Finding from the frozen draft

The proposal’s overall split remains useful: keep `.ipynb` as an interchange document, use a local tabular engine, and store freshness/provenance outside the notebook document. The correction is to make the engine and notebook limits part of the contract rather than claim that a digest, sampled schema, or static cell graph proves more than it does.

| Frozen claim or mechanism | Check against evidence | Required correction |
|---|---|---|
| nbformat distinguishes displayed cell order from execution metadata; `execution_count` may be null. | Supported by the v4.5 schema. Code-cell outputs are stored in the cell, and `execute_result` has its own nullable prompt count; the schema has no run-event ID or freshness field. [S1] | Keep stable cell IDs and notebook outputs, but make the sidecar event sequence authoritative. Treat `execution_count` as document metadata, not proof of current-kernel chronology or output provenance. |
| A rolling SHA-256 over rows plus a row count is enough for result comparison. | Too broad. A rolling hash over serialized rows fingerprints an ordered byte sequence. It can change when an unordered result is permuted, and row count plus a digest is not a proof of multiset equality. Encoding, types, nulls, duplicate multiplicity and ordering must be specified. | Use an ordered sequence digest only when order is contractual. For order-free comparisons, compare canonicalized rows with duplicate multiplicity preserved, using an external sort or another explicitly bounded method; otherwise label the digest as a hint. |
| Order-insensitive sums/counts can stand in for stable results. | Count is order-independent, but DuckDB documents floating-point `sum` and several other aggregates as order-sensitive. `GROUP BY` and joins do not guarantee output order; `ORDER BY` may not be stable for ties. [S4, S5] | Record numeric types and engine/configuration. Do not claim bitwise-stable floating reductions without a defined algorithm and tested tolerance. Require a unique total ordering key for deterministic ordered output. |
| Missing fields and explicit nulls remain distinct in the DuckDB tabular path. | Not automatic. DuckDB’s JSON loading docs state that missing object keys become SQL `NULL`. Once projected to a nullable tabular column, the proposed contract has no presence marker to distinguish absence from null. [S3] | If the distinction matters, retain raw records or a per-field presence bitmap alongside the typed table. Otherwise explicitly define canonicalization as “missing and null both become NULL.” Test the selected parser/version. |
| DuckDB’s CSV reject tables establish the proposed durable reject ledger for all formats. | Only partly supported. CSV `store_rejects` skips faulty rows and records scanner/error details in temporary tables, with a configurable reject limit. The docs also warn that projection pushdown can avoid a cast error in an unselected column. These are CSV-specific mechanisms, not a durable cross-format ledger. [S2] | Keep full-column validation and a product-owned persistent ledger as design choices. Preserve raw bytes/line and error details where possible; if a parser cannot locate or safely isolate a malformed record, stop the import and report that limitation instead of silently omitting it. |
| Static cell analysis gives complete notebook freshness and topological clean replay. | It does not for ordinary Python notebooks. marimo’s refs/defs DAG is a useful precedent, but its docs explicitly say object mutation is not tracked. The nbformat document itself cannot expose arbitrary hidden state or filesystem side effects. [S1, S6] | For `.ipynb`, default clean replay is fresh-process execution in displayed order. A graph may assist invalidation or drive separately declared transform workflows, but unknown/dynamic dependencies must become `unverified` or conservatively invalidate more outputs. |
| The frozen W1–W4 receipts establish runtime behavior. | They are candidate-reported component checks, not a real notebook runtime. W1 is schema-derived; W2 reports app-tracked rows in synthetic input; W3 is a model simulation; W4 says fresh state was emulated and no subprocess isolation was used. Their code and exact inputs are not present in the supplied catalog. | Preserve them as limited candidate-reported receipts. Do not use them as release, memory, runtime-isolation or large-data evidence. |

A small manual counterexample makes the numeric limitation concrete. A left-to-right binary floating-point sum of `[1e16, 1.0, -1e16]` can produce `0.0`, while `[1e16, -1e16, 1.0]` produces `1.0`; they have the same row count and values. This is a desk derivation, **not an executed check**. It does not contradict the frozen W2 claim for its particular undisclosed input and operation; that claim cannot be independently evaluated without its input and code. DuckDB’s current aggregate documentation independently flags floating `sum` as order-sensitive. [S5]

## Architecture and product choices

**[C] Product choice.** Ship a local folder workspace with three cooperating parts:

1. **Notebook document and Python runtime.** Read/write standard nbformat `.ipynb` documents and use one supported Python kernel family. Keep cell outputs in the notebook for exchange, but keep run identity, freshness and dependency information in a regenerable sidecar. Opening or previewing a project never executes notebook code.
2. **Tabular engine.** Pin a DuckDB release and use its local file readers for CSV, NDJSON and Parquet, plus the same engine/version for an optional SQL query pane. Python code may use the Python binding; SQL is a query surface over registered datasets, not a second notebook kernel. DuckDB’s docs show direct Parquet scans, projection/filter pushdown, schema inspection, and JSON table reads; this supports the component choice but does not verify the 5 GB target. [S3, S11]
3. **Provenance controller.** Track source identities, environment locks, execution events, output hashes and conservative status transitions in sidecars. Keep this layer independent of notebook document semantics.

**[F] Independent precedents.** nbformat provides a portable document schema but does not specify kernel state or freshness [S1]. DuckDB provides file/query execution and data-reader behavior without prescribing notebook storage [S2–S5, S11]. marimo contributes a useful static refs/defs DAG and stale-cell UX, independently of `.ipynb` storage, while documenting a key limitation: mutation tracking is not complete [S6]. Papermill demonstrates parameter injection and writing an executed notebook to a separate output path, but its README is not evidence of sandbox isolation or a general reproducibility guarantee. [S7]

**[I] Engineering inference.** These components can interoperate through stable notebook cell IDs, explicit data registry entries and a per-run event record. Their contracts do not combine automatically: the product must define how reader configuration, dependency tracking, output association and replay status interact.

## Project record and minimum workflow

A project remains an ordinary directory, optionally zipped for exchange:

```text
project/
  project.toml                 # project ID, schema version, selected runtime/engine policy
  environment.lock             # exact resolved Python environment; generated, not PEP 723 metadata alone
  datasets.toml                # logical source IDs, URI/path, format, declared schema and read options
  notebooks/*.ipynb
  transforms/*.py
  sql/*.sql
  .labbook/events.jsonl        # append-only run records
  .labbook/index.json          # regenerable cell/output-to-event association
  .labbook/outputs/            # content-addressed large outputs and reject ledgers
  .labbook/cache/              # disposable derived cache
  .labbook/project.lock        # active writer metadata/OS lock
  manifest.repro.json          # small export summary
```

The minimum workflow is:

1. **Create.** Generate project ID and versioned settings.
2. **Register data without copying.** Record path/URI and format; stream SHA-256 over local source bytes for identity, with size and modification time only as change hints. For a directory/glob, identity is a sorted manifest of relative path plus each file’s content hash, not one directory timestamp. Missing or unreadable external data is shown as unavailable; the project never silently substitutes another file.
3. **Inspect and preview.** Show declared and detected schema, reader/version/options, preview limit and sample label. Detection/sample statistics are never presented as full-file guarantees. JSON auto-detection is sampled by default in the captured docs (`sample_size=20480`); that option can be changed, but a full-file scan is a distinct cost. [S3]
4. **Author and run interactively.** Execute Python cells in a live kernel. Record actual per-kernel event sequence independently of page position and `execution_count`. Interactive kernel state is transient; when dependencies or prior state cannot be established, outputs are `unverified`.
5. **Request clean replay.** Start a fresh process/kernel, use the pinned environment, replay notebook code in displayed order, and write a separate run artifact. A declared transform DAG may run topologically as its own workflow; do not silently reorder ordinary notebook cells from static guesses. Show progress, cell errors and cancellation. On cancel/timeout, terminate the managed process group where supported and mark affected outputs `unverified` unless termination and event finalization are confirmed.
6. **Compare provenance and results.** Show code/environment/source changes, input IDs, execution sequence, result shape and output hashes. A bounded result diff must say whether it compares an ordered sequence or an order-free multiset; do not imply that a digest proves semantic equality.
7. **Save and reopen/share.** Write notebook plus sidecars via a recoverable save protocol. On another machine, verify lock/tool versions and source hashes; outputs with missing sidecar, missing data or an unknown runtime become `unverified`. Export a manifest and selected results; source datasets are included only when the user chooses to bundle them.

### Data contract

**[C] Identity and immutability.** Never use mtime/size alone as identity. Open original inputs read-only. Transforms write new artifacts; reject ledgers preserve source location and error facts without editing original bytes. For network sources or files that cannot be read under the declared permissions, report that the product cannot verify their identity.

**[C] Schema and conversions.** A user may declare a schema or accept an inferred schema that is then pinned with the engine version and read options. Show inferred types as provisional until the selected validation scan completes. Schema changes require a visible diff and explicit acceptance; existing results retain the schema/version used to create them. Record explicit casts and null handling. Default conversion failure is stop-and-report, not silent coercion or row deletion. DuckDB’s CSV docs describe stop-on-error by default, list structural error types and show an `ignore_errors` mode; they also describe the projection-pushdown validation pitfall. [S2]

For CSV, `store_rejects` can be an implementation aid, but its documented reject tables are temporary and have a reject limit. The product should persist its own ledger with source identity, record/line/byte location where available, error class/message and raw offending bytes (or a safe excerpt plus a source offset). If validation only checked projected columns, it is not a full schema validation. For NDJSON, the captured docs say parse errors are not ignored by default and `ignore_errors` is available for newline-delimited format; they do not establish a durable ledger mechanism. [S2, S3] Unsupported encoding, malformed boundaries, overlarge JSON objects or parser errors that cannot be safely attributed to a record stop the operation with an actionable error.

**[C] Missing, null, heterogeneous values and time.** Define per-format behavior. For tabular NDJSON, DuckDB documents missing keys becoming SQL `NULL`; preserve absence separately with raw records or presence flags if the workflow needs to distinguish absence from explicit null. Otherwise canonicalize both to SQL NULL and say so in the schema UI. Preserve Unicode input as decoded strings according to an explicit encoding policy. For heterogeneous values, use an explicit tagged/JSON representation or a declared conversion rule; a generic “any” type is not a demonstrated DuckDB contract here. Parse timestamps only under a declared format and timezone policy, retaining original source text when normalization would lose distinctions. These are product requirements awaiting implementation checks, not claims that every reader already preserves the values.

**[C] Row identity and ordering.** Distinguish source record ordinal, logical key and output ordering. An ordinal records a position in one exact source version; it is not a stable identity after source edits. A logical key must be declared and checked for uniqueness if downstream comparisons depend on it. DuckDB docs say insertion order is preserved for some readers by default and configurable, but joins, grouping, whole-table aggregation and other operators do not guarantee order; even `ORDER BY` may not be stable. [S4] Therefore record the engine/configuration and source ordinal where available; use a unique total sort key for deterministic ordered exports. Label input-preserving streaming order as stable only for operators whose documented/configured path preserves it. Keep duplicates and null/type tags in semantic comparisons.

A rolling digest over canonical row encodings is useful as a compact **ordered-sequence fingerprint**. For order-insensitive comparison, canonicalize rows and preserve duplicate multiplicity, for example with a bounded external sort of encoded rows before hashing. This costs disk and time and is not a proof against hash collision. For floating-point aggregates, display numeric type, algorithm/runtime and explicit tolerance; integer count is exact in its declared range, while floating `sum` may vary with reduction order. [S4, S5]

## Notebook events, output association and invalidation

**[C] Event schema.** Each started/finished/failed/cancelled event should include: event UUID; notebook path/hash; stable cell ID; cell code hash; displayed index; kernel/process/session ID; per-session sequence number; input source/artifact identities; declared dependency IDs; resolved environment-lock hash; Python, notebook client and DuckDB versions/config; resource/network grants; start/end time; exit/error/cancel state; output references and hashes. An event with incomplete inputs or environment fields cannot support a `current` badge.

The `.ipynb` cell’s saved output array is associated with the producing event by `(notebook hash, cell ID, event UUID, output index/hash)` in the sidecar. `execution_count` remains useful notebook metadata, but it is not globally unique and the schema does not connect every output type to a run event. [S1] If the sidecar is missing, invalid or inconsistent with the document, retain the visible saved output and mark it `unverified`.

**[C] Status and invalidation.** Status applies to the saved output group from one producing event:

- `current`: latest successful run for this cell whose code, declared/transparently observed inputs, environment and relevant configuration match the current project. This means its known inputs match; it does not promise deterministic behavior.
- `stale`: a known upstream cell/source/parameter/environment version has changed since the recorded run.
- `failed`: producing run ended with an error; preserve traceback/status accessibly.
- `unverified`: provenance is absent/incomplete, the kernel restarted, execution was interrupted/cancelled, dependencies are dynamic/unknown, or a run did not finish committing.

Editing a cell marks its prior result stale and marks known descendants stale. If arbitrary state, mutation, dynamic imports, external files or side effects make the descendant set uncertain, mark the affected scope unverified or invalidate conservatively. A source content/schema/read-option change stales its consumers and downstream results. A dependency-lock, Python, engine or relevant configuration change stales known affected results; if the prior environment cannot be reconstructed, mark unverified. Kernel restart marks all outputs produced from that session unverified while leaving document bytes intact. A run error marks that output failed and downstream outputs unverified. Cancellation marks the running cell and queued dependents unverified. Never convert old outputs to `current` merely because they remain visible.

marimo is a precedent for statically deriving a DAG from references/definitions, lazy stale marking, execution independent of page order and cancellation of queued dependents; its docs explicitly warn that mutation and attribute assignment are not tracked. [S6] Use that graph only where its limits are visible. For ordinary Python notebooks, expose the graph as an estimate and allow a conservative fallback. Generation IDs on invalidation/run events are a reasonable race-prevention product choice, but a merged upstream fix alone would not establish this product’s correctness.

## Clean replay guarantee and environment

**[C]** A clean replay means the product launched a fresh managed process, ran the recorded notebook in the recorded order with the selected declared environment and source identities, and captured the resulting event/output records. The input notebook is not overwritten until a completed replay artifact is ready; a separate output path follows Papermill’s documented pattern. [S7]

The product can guarantee the recorded replay procedure and bundle it can observe. It cannot guarantee that a future replay will be byte-identical: code may use randomness, time, floating-point reductions, external services, environment variables or data files outside declared inputs. A run should be called reproducible only relative to stated controls and observations. Network access is off by default; any opt-in is visible and recorded. Unpinned dependencies or missing lock artifacts prevent a strong replay claim. PEP 723 standardizes inline `dependencies` and `requires-python` metadata, but does not define a runner or lock/resolution behavior; its security section notes auto-installing untrusted dependencies can run arbitrary code. Treat metadata as a declaration, resolve into a separate lock, and require an explicit environment-creation action. [S8]

**[C] Python support.** Start with one Python kernel family, CPython 3.11–3.13 in CI and user-visible support; qualify 3.14 only after the kernel, engine binding and critical package matrix passes. Recheck this policy at every release. A frozen 2026-10-05 lifecycle snapshot lists Python 3.10 EOL as 2026-10-01 and 3.11–3.14 EOL dates from 2027–2030; Python’s devguide states the five-year support policy. [S9, S10] SQL remains optional query execution over registered files with the same DuckDB release and schema/provenance record; no SQL notebook kernel is required.

## Security, scale, persistence and support limits

**[C] Execution boundary.** Treat notebook code as untrusted. Run it in a separate OS-confined process with a project-scoped filesystem view, read-only source mounts, writable temporary/output locations, network disabled by default, and CPU/memory/wall-clock limits. Keep browsing and preview separate from execution. Do not use an import blacklist as isolation. On breach, kill the managed process group and record failure/unverified status. A Linux namespace/bubblewrap-style implementation is a candidate for a first platform; the production mechanism, escape tests and Windows/macOS behavior remain critical unverified dependencies. Strict paths and network defaults add friction for notebooks that fetch remote data or read arbitrary local files; show the required grant and its provenance effect instead of hiding it.

**[C] Large data.** For an 8-core/16 GB target and a 5 GB input, use file scans, projection/filter pushdown, bounded previews and chunked transfer; never materialize the full input in a Python dataframe by default. DuckDB documentation supports file scans and pushdown, but not this product’s peak RSS or the behavior of every global operation. [S3, S11] Before a sort, global distinct, join or other potentially unbounded operation, report whether it is expected to stream, spill, require temporary disk or exceed a configured limit. Truncate visible large outputs but store a content-addressed full artifact when allowed; display row count, truncation and pointer. Do not treat the 50,000-line frozen synthetic witness as evidence for 5 GB or OS-measured memory.

Cache keys include input content identities, transform/code, schema/read options, engine/runtime lock and declared parameters. Cache is disposable and never authoritative; any key change is a miss. Use one project writer lock and read-only behavior for other openers in the first release. DuckDB documents a one-process read-write/multiple-process read-only model and cautions about shared/network directories. [S10] Use OS locking rather than trusting PID alone. Save through a same-filesystem temp file, flush/fsync, atomic rename and a checksummed event append; recover torn final records and mark ambiguous outputs unverified. Atomicity and locking vary by filesystem, so network-shared project editing is unsupported until tested.

**Unsupported or explicitly limited:** arbitrary external services/credentials, undeclared file access, unknown runtime packages, unrecognized formats/encodings, lossless missing-vs-null distinctions without presence metadata, malformed records that cannot be isolated safely, deterministic order without a total key, large results beyond configured storage, and global operators beyond tested memory/disk limits. Credentials, private datasets and shared account profiles are outside this proposal.

## Consequential failure, fix and regression test

DuckDB issue #12596 reported that a two-column CSV with trailing delimiters, explicit three-column schema and `null_padding=true` produced an extra all-NULL row when `parallel=false`; the report named 1.0.0 and a nightly build, and the issue was labeled reproduced. [S12, S13] PR #12679 merged on 2024-06-24 as `2532c30fa649ac6296c7ab2b55976b4337ff46ce`. Its source diff adds a guard requiring `result.chunk_col_id > 0` before padding the unconsumed columns, and adds `test_12596.test` plus a fixture asserting two expected data rows in both parallel and single-threaded cases. [S14, S15]

Version applicability: tag `v1.0.0` points to commit `1f98600c2cf8722a6d2f2d805bb4af5e701319fc`, dated 2024-05-29, before the fix. The GitHub compare capture for `2532c30...fa5c2fe` reports `merge_base_commit` equal to the fix commit, `behind_by: 0`, establishing that DuckDB tag `v1.1.0` (`fa5c2fe15f3da5f32397b009196c0895fce60820`) descends from the fix. Whether any `1.0.x` release backported it remains unresolved. [S16–S18] This establishes repository ancestry, not our own execution of the bug or test, nor behavior of every packaged client. It is a useful caution that reader options and parallel paths belong in the run manifest and regression matrix.

## Validation status and scope

**[W] Candidate-reported executions in the frozen seed, not rerun here:**

- W1-rev1 reports failure sorting `execution_count` values containing `null`; W1-rev2 reports a schema-derived synthetic document check passing after excluding never-run cells from replay ordering.
- W2 reports 50,000 synthetic NDJSON lines, 3 rejects, a 512-row tracked materialization maximum, bounded preview and unchanged source hash. Its own limits say it used a synthetic in-memory corpus and application-side row tracking, not an OS memory measurement or production reader.
- W3 reports a 13-event, 3-cell invalidation state-machine simulation. It tests its encoded rules, not a real editor/kernel.
- W4 reports identical bytes for a pure transform and differing unseeded random values, but says fresh state was emulated and no subprocess isolation was used.

The supplied witness catalog contains execution IDs, code hashes, outcome summaries and limits, but not the check code, exact input bytes or complete stdout/stderr for these entries. They are preserved as candidate-reported receipts, not independently reproducible evidence. None verifies DuckDB release behavior, a notebook runtime, the proposed sandbox, 5 GB performance or complete freshness tracking.

**[V] Proposed / UNEXECUTED validations:**

1. Run a tiny NDJSON fixture through the selected DuckDB version and adapter: one row with `"v": null`, one with `v` absent, one with integer `v`, one with string `v`, Unicode labels and a malformed line. Verify declared coercion/reject behavior, raw-source immutability, and whether a presence sidecar is needed to preserve null-versus-missing. Expected contract: no silent row loss; the two null/absent cases stay distinguishable only if the adapter records presence.
2. Run the floating order pair `[1e16, 1.0, -1e16]` and `[1e16, -1e16, 1.0]` as float64 under the selected engine; record exact results and types. Test row-digest behavior on a two-row relation in opposite orders, then define separate ordered-sequence and unordered-multiset comparators. No result is claimed here.
3. Exercise a real notebook with cells deliberately executed out of display order, then save, restart, edit an upstream cell, change a source hash, fail and cancel runs, and remove/corrupt sidecars. Verify event association and all four statuses in an actual kernel. Dynamic mutation and filesystem access must conservatively degrade status.
4. On a generated 5 GB CSV/NDJSON/Parquet corpus, record peak RSS, preview latency, streaming scan throughput, temporary disk and failure bounds for sort/distinct; verify raw source hashes remain unchanged. The envelope is a target, not a result.
5. Move a project folder between two supported machines and test missing source data, lock mismatch, output truncation, concurrent opener behavior and crash injection during save/recovery.
6. Run sandbox escape/resource tests against the selected OS mechanism and platform matrix. Verify network denial and filesystem allowlists at the OS boundary; an import filter is not a test of isolation.

## Opportunity and alternative

**Useful opportunity [C]:** make reject ledgers and provenance diffs a first-class data-quality view. DuckDB’s CSV reject tables show useful line, byte-position, column and error fields, while the proposal-owned ledger can persist them across runs and relate them to source hashes. [S2]

**Plausible alternative [C]:** adopt marimo as the primary reactive Python runtime and export/import `.ipynb` for interchange. It supplies real DAG execution and stale-cell behavior; the cost is making the team’s existing notebook storage second-class and accepting its documented static-analysis limits around mutation. [S6] The selected proposal keeps ordinary `.ipynb` execution semantics and uses graph assistance only where dependencies are explicit.

## Unresolved design dependencies

- DuckDB version/client matrix and whether CSV/JSON/Parquet behaviors remain stable under the selected pin.
- Persistent per-format reject ledger, especially NDJSON malformed-record location and lossless raw-byte retention.
- Presence metadata for null versus missing values in typed tables.
- Canonical typed row encoding and bounded order-free result comparison.
- 5 GB peak memory, spill/temp-disk limits and unsupported global operations.
- OS sandbox implementation, platform support and verified child-process cancellation.
- Notebook dependency completeness when Python mutates objects, imports dynamic modules or accesses undeclared files.
- Crash-safe sidecar/index recovery and locking behavior on supported filesystems.
- First DuckDB 1.0.x release, if any, containing fix #12596; do not infer it from the 1.1.0 ancestry result.
