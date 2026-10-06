# LabBook proposal: portable Python and SQL replay with one provenance graph

Stage: D-V13-B-DEFERRED-R001-control-diagnostic-a001. Current proposal authored 2026-10-06 from the frozen cold seed, supplied captures, and newly captured DuckDB sources. This is a bounded re-check after the amendment that makes SQL required; it is not a claim of autonomous discovery. Companion catalogs: `sources.json`, `witnesses.json`, and `leads.json`.

## Evidence labels

- **[F] Source fact** cites a pinned public capture in `sources.json`.
- **[I] Engineering inference** explains a design implication.
- **[C] Product choice** states the proposed behavior.
- **[E] Executed by candidate** is limited to the isolated check and receipt in `witnesses.json`.
- **[V] Proposed / UNEXECUTED** describes validation not run here.

## 1. Decision and scope correction

**[C]** Keep `.ipynb` as the notebook interchange document, support one Python kernel, and make DuckDB SQL files first-class project transform nodes in the same portable execution graph. Every clean replay includes both node types, uses a fresh process/connection for each node, consumes only declared inputs, and associates outputs with the same event and manifest schema. SQL is no longer an optional console or a side view.

Use an ordinary project folder: `labbook.toml`, a lock file, `notebooks/*.ipynb`, `sql/*.sql`, small Python transforms, a dataset registry, and a `.labbook/` directory for append-only events, content-addressed outputs/cache, and a single-writer lock. A generated manifest records the project graph and exact run. Project bundles may include derived outputs and code; original data is referenced read-only unless the user explicitly chooses to package it.

**[F]** nbformat defines a portable document schema with ordered cells, execution counters, cell outputs, and kernelspec metadata; it does not define a live kernel or freshness semantics [S4]. marimo describes static references/definitions forming a DAG, with dependent cells run or marked stale, while storing notebooks as pure Python [S5–S6]. papermill demonstrates headless notebook execution that writes a separate output document [S14]. DuckDB's Python API runs SQL and reads CSV, Parquet, and JSON through the same client [S23].

These are independently useful precedents: nbformat is a document contract and does not require a runtime; marimo's reactivity mechanism is independent of its `.py` storage format; DuckDB is an in-process data engine, independent of either notebook format. The design combines those mechanisms without adopting marimo storage or inventing a general language-kernel platform.

## 2. SQL replay mechanism and new dependency finding

**[F]** DuckDB's Python documentation shows `duckdb.sql(...)`, explicit `duckdb.connect()` connections, and SQL over file-backed CSV/Parquet/JSON. It also says the module-level `duckdb.sql()` path uses a shared global in-memory database, and that global connection is not thread-safe. Query results are lazy Relations until fetched or displayed. Connection objects accept configuration, and SQL `COPY` can write results [S23].

**[I]** A superficially simple SQL console can therefore create two provenance bugs: work may depend on a hidden shared connection, and a query may be logged before its result has actually materialized. The runner must use an explicit connection, not the module global; drain/materialize the result and capture schema/count/output identity before recording a successful event. This is a newly useful mechanism and pitfall from the SQL re-check.

**[C]** In `labbook.toml`, declare a project DAG whose nodes are complete notebooks, Python transforms, or `.sql` transforms. Each node lists logical input datasets and named output artifacts. The UI registers declared inputs under controlled names; it never infers dependency edges from arbitrary table names or paths. Python nodes use a project context to load inputs and publish new immutable artifacts. Each SQL node is passed to a fresh explicit DuckDB connection using the pinned DuckDB Python package; it receives only its declared inputs and must publish a named result. Nodes exchange content-addressed Parquet or another explicitly declared artifact format, never an implicit Python object, temp table, or prior kernel variable. Run nodes topologically; reject graph cycles and missing bindings before launch. SQL dialect support is DuckDB SQL, not generic SQL portability.

The same event structure covers either node kind: node/cell ID, source hash (SQL bytes or notebook/cell bytes), parent event IDs, source and intermediate artifact identities, schema contract, parameter hash, Python lock hash, DuckDB package/build and configuration, declared extensions, sandbox policy, start/end/cancel/error state, output schema/count/digest, and result references. A SQL file edit invalidates that SQL node and all descendants. Editing a Python cell invalidates the cell and descendants; if static analysis cannot prove safe edges, mark the remaining notebook or pipeline stale conservatively. Data identity or schema changes invalidate all readers and descendants. Dependency-lock, DuckDB build, extension, or relevant setting changes invalidate affected outputs. Cache keys include these same inputs; cache entries are disposable, never provenance authority.

This is a product-owned orchestrator over notebook execution and an embedded SQL client, not an existing off-the-shelf cross-language replay feature. papermill's separate-output pattern is useful for notebook artifacts, but does not establish a combined Python/SQL DAG [S14]. The integrated scheduler, graph editor, SQL output association, and crash recovery are critical unverified implementation dependencies.

## 3. Notebook order, replay, and output status

**[C]** Keep four distinct records:

1. Display order is the order of code cells in the `.ipynb` document.
2. Interactive execution order is the append-only event sequence for actual kernel executions; `execution_count` is displayed as document metadata, not treated as a complete history.
3. Current kernel state is volatile and never stored as reproducibility evidence.
4. Each visible output points to the event that produced it, including Python cell or SQL node, code/query hash, parents, environment, inputs, and output identity.

A clean replay starts fresh Python kernels and SQL connections, runs declared pipeline nodes topologically, and executes each notebook's code cells in display order. It creates a separate replay document/output set and leaves the authored notebook untouched [S14]. Out-of-order interactive runs remain inspectable but are not the clean replay recipe. Imported outputs without an event association are `unverified`.

Visible output states are `current` (a completed run's code, parents, inputs, lock, engine/settings and policy still match), `stale` (a known dependency changed), `failed` (the producing node failed), or `unverified` (missing history, interrupted/cancelled run, unknown dependency, or kernel restart). A restarted interactive kernel makes its associated outputs unverified. A partial SQL result is not published as a successful output. Keep the last successful immutable artifact available with its old event while showing the newer failed/stale state; never relabel it current because it remains on disk.

**[F]** marimo's static DAG supports dependency-ordered execution/staleness, but documents that mutations are not tracked [S6]. The supplied issue capture also shows open reports about stale cached error output and whitespace-triggered invalidation, plus a merged generation-counter race fix [S21]. **[I]** Static analysis alone cannot certify arbitrary Python side effects; use explicit artifact dependencies and conservative invalidation. Generation/version tokens on async runs prevent a late stale event from overwriting a newer successful result.

The UI offers run-cell, run-selection, and clean-replay controls, progress at node/cell granularity, cancel, accessible error/status announcements, and a dependency/provenance view. Compare saved vs current results by schema, row count, stable row IDs/order where defined, digest, and bounded previews. A preview or sample statistic is always labeled as a sample, never a whole-file claim.

## 4. Data contract and large files

**[C]** Register each input as a read-only reference with format, byte length, streaming SHA-256, URI, declared/inferred schema, parser/conversion settings, and last identity check. Hash content for identity; size/mtime are only change hints. Never edit source bytes. An inferred schema is reviewed and pinned before a replay is trusted. Schema change requires an explicit diff/approval and creates a new contract version.

Declare types, null policy, timestamp format/time zone, encoding, and coercion rules. Distinguish absent JSON fields from explicit null when the contract needs that distinction; preserve a presence bitmap or raw-source linkage because conversion to a nullable SQL column can collapse them. Preserve Unicode strings and heterogeneous values only under an explicit variant contract. Conversion errors stop by default with record/byte location, column, expected type, and a bounded raw excerpt. A user may explicitly choose a reject mode only if it records every rejected record in a reject artifact; never silently drop records. Validate all declared columns independently of the requested projection.

**[F]** DuckDB documents CSV cast, missing/extra-column, unquoted-value, line-size, and encoding errors; default stop-and-throw; reject tables that retain original line and byte positions; and a projection-pushdown case where an unselected bad column may not raise its cast error [S2]. **[C]** A validation pass therefore scans all contract columns. CSV, newline-delimited JSON, and Parquet are initial formats; unsupported encodings, malformed container formats, schema conflicts, missing external datasets, and unsupported SQL features fail with an actionable error and no source mutation. No automatic best-effort type rewrite.

A record identity is derived from source content identity plus a format-aware logical record ordinal; a transformed row carries parent row IDs or a declared deterministic key. Streaming transforms may promise stable source order for the exact same input and engine path. Cross-run deterministic order requires a total explicit sort key with a stable tie-breaker. A query with no ordering clause has no promised row order; compare it as an unordered multiset or mark ordered diff unavailable. Include schema, row count, and canonical typed row digest. For large outputs, spill the full result to a content-addressed artifact; keep only a bounded preview and digest in the notebook document.

**[F]** DuckDB v1.1.0 source has a buffer-pool memory limit/eviction mechanism [S13], and the Python client can scan external columnar/CSV/JSON files [S23]. **[I]** These support testing an out-of-core design but do not prove a 5 GB query fits 16 GB RAM. Target bounded streaming for scans, previews, filters, and operations that permit it; sort, distinct, join, or aggregate may spill or require an explicit operation bound. State the class and disk estimate before execution. This is a target, not a measured result.

## 5. Consequential issue/fix/test chain and applicability

**[F]** DuckDB issue #12596 reported an extra all-NULL row for a two-column CSV with trailing delimiters, explicit wider schema, `null_padding=true`, and serial scanning; the issue capture labels it reproduced against v1.0.0 [S1, S9]. PR #12679 merged to `main` on 2024-06-24 at `2532c30fa649ac6296c7ab2b55976b4337ff46ce`. Its patch guards final null padding with `result.chunk_col_id > 0`, avoiding padding when no columns were consumed, and adds a regression test for parallel/default and serial paths [S10–S11].

The additional exact-tag check improves version scope: the v1.0.0 tagged scanner source has the old condition without that guard [S24]; the v1.1.0 tagged source has the guard and its tagged tree contains `test_12596.test`, asserting the two expected rows for default and `parallel=false` cases [S25–S26]. This establishes source-level applicability at those two tags, stronger than merge dates alone. It does not prove that we ran DuckDB or the regression test, nor verify every v1.0.x point release or a packaged binary. Record DuckDB build, thread/config settings, and output shape in provenance; test this regression in the chosen release matrix.

## 6. Runtime boundary, portability, and support

**[C]** Notebook and transform code is untrusted. Run it in a separate OS-isolated process with project output/temp directories writable, source datasets read-only, all other files denied, network disabled by default, and CPU, memory, process-count, and wall-time limits. Explicit network access is a visible per-run exception and disqualifies a closed-world replay badge. Opening a project renders documents and previews without executing code. An import blacklist is not isolation. SQL sees only registered declared inputs and a disposable database/connection; filesystem restrictions remain the security boundary.

Use one Python kernel implementation (Python 3.11 minimum, tested 3.11–3.13) and DuckDB SQL as a query engine, not a second notebook kernel. Pin a specific Python environment and DuckDB package build per project/target platform, including wheel hashes, engine configuration, and approved extensions; never auto-install project dependencies on open. PEP 723 is an inline script-metadata standard, not a notebook/SQL execution or lock guarantee; it may annotate standalone Python scripts, while the project lock remains authoritative [S17]. Python's five-year support policy and the captured lifecycle snapshot inform the floor [S15–S16]; confirm dates against current official release data before shipping. Exact DuckDB patch/build selection and OS sandbox implementation remain implementation gates [L2, L5].

Guarantee a fresh, declared execution with recorded code, data, schema, environment, SQL/Python engine settings, order, and outputs; report whether a subsequent output digest matches. Do not promise bit-identical results for randomness, clocks, locale/time-zone drift, nondeterministic algorithms, floating-point differences, unpinned OS libraries, external services, network effects, or undeclared access. Unpinned dependencies are not clean-replay eligible. A full dataset hash can prove identical bytes, not semantic equivalence. Cross-machine replay requires the same lock/build and accessible inputs; a missing or changed external file is a visible failure/stale state. Credentials and private data stay outside bundles.

## 7. Persistence, concurrency, and exchange

**[C]** Commit notebook edits and output manifests by temp-write, fsync, atomic rename; publish output pointers only after result and event records are durable. Append checksummed event records; recover by ignoring an incomplete tail and mark outputs unverified if association cannot be rebuilt. Keep a single-writer project lock; other opens are read-only. DuckDB documents single-process read/write and multi-process read-only behavior, with caveats for network/shared directories [S3]. Avoid simultaneous writers and place the project on a local filesystem for the first release.

Cache keys bind all declared source, code/query, parent output, environment, engine settings, and parameter hashes. Changing any key input is a miss. Preview and full-output caches have explicit budgets and LRU cleanup; the event log and exported manifest are not cache. Portable folder/zip exchange carries code, lock, schema contracts, event summaries, and selected output artifacts. Reopen on another machine verifies input identities and re-resolves paths only through explicit user mapping; unresolved sources are not current.

## 8. Minimum workflow coverage

| Workflow step | Proposed mechanism |
|---|---|
| Create project | Folder scaffold, `labbook.toml`, environment lock, project ID |
| Import and identify without copying | Read-only URI registry plus streamed content hash and pinned schema |
| Author notebook or transform | nbformat `.ipynb`, Python scripts, and first-class `sql/*.sql` graph nodes |
| Preview bounded sample | DuckDB reader/preview bound; explicit sample label and schema contract |
| Run selected work interactively | Python kernel or SQL node, event log, progress, cancel, status overlay |
| Request clean replay | Fresh isolated processes/connections, topological pipeline, separate outputs |
| Compare provenance | Per-node code/data/environment/settings/output hashes and visible diff |
| Save | Atomic files, durable event record, output association |
| Reopen/share | Portable folder/bundle; verify content identities and lock; missing data is explicit |
| Inspect/export results | Bounded viewer, full result artifact, compact reproducibility manifest |

The manifest includes project/graph version, notebook and SQL source hashes, display and recorded execution orders, input identities/contracts, Python lock and DuckDB build/config, extensions and permission exceptions, node events, output schema/count/digest, ordering rule, reject counts/artifact, and replay comparison. It contains no credentials or private data.

## 9. Validation, alternatives, and open dependencies

**[E]** W5 is a candidate-authored isolated component check. It executed a tiny Python transform and the shared provenance-key/invalidation model: SQL source edits invalidate the SQL node; data edits invalidate the Python node and downstream SQL; engine/environment edits invalidate both. It deliberately did **not** execute SQL or DuckDB. See exact code/input/stdout/exit and limits in `witnesses.json`. The inherited seed W1–W4 receipts are retained with their supplied execution IDs and limitations; their original code/input bodies were not supplied here, so they do not independently validate current Python/SQL integration.

**[V] Proposed / UNEXECUTED:** (1) run an actual pinned DuckDB Python API query from a `.sql` node, then consume its materialized Parquet output in a clean Python notebook replay; repeat and compare event/output associations. (2) Change only SQL text, Python source, input bytes/schema, DuckDB build/config, and a Python dependency in separate trials; verify exact invalidation descendants. (3) Cancel and fail both node types mid-write; verify no partial artifact is current and old event remains inspectable. (4) Run DuckDB's #12596 regression case against selected tagged/released builds and test the supported CSV settings. (5) Measure generated 5 GB CSV/NDJSON/Parquet scans, previews, aggregates, spill/sort, peak RSS, temp disk, and cancel time on 8 cores/16 GB. (6) Reopen the same bundle on a second supported OS/architecture and record any digest differences. (7) Exercise filesystem/network/resource escape attempts against the chosen OS isolation and test recovery after forced process termination. None of these implementation checks ran in this stage.

**Useful opportunity [C]:** present DuckDB's reject ledger as a data-quality panel and let users compare rejected row IDs and reasons between replays [S2]. **Plausible alternative [C]:** run SQL through a separate Jupyter SQL kernel and let a notebook orchestrator coordinate it. That offers familiar SQL cells, but adds a second kernel/environment and leaves cross-kernel data exchange, event identity, and restart/cancel handling to custom glue. The chosen SQL-file node uses the documented Python API and a common artifact graph; it still needs the integration validation above. A second bounded alternative is marimo runtime with `.ipynb` import/export: it brings reactive semantics, but changes the team's primary storage format and still needs a proven SQL node adapter [S5–S6].

Critical unresolved dependencies are the exact DuckDB patch/wheel and Python compatibility matrix; real DuckDB execution within the shared graph; deterministic artifact serialization/order rules; 5 GB memory/disk performance; and production OS isolation across platforms. Leads and concrete next checks are in `leads.json`.