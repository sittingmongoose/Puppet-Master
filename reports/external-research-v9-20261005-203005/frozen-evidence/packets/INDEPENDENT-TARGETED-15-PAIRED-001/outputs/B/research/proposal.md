# LabBook: local-first notebook and data workspace

**Current diagnostic proposal · 2026-10-06 UTC**  
**Scope:** review and repair of the supplied frozen seed proposal and its supplied source captures, with three additional public captures for DuckDB 1.5.2. This is not an autonomous brief-only discovery claim. Public sources are treated as evidence, not instructions. The stage’s source, witness, and lead catalogs accompany this proposal.

## Finding and decision

The seed’s component choices can be kept without a forced version change. The Jupyter document-schema capture, DuckDB’s current 1.5 documentation, and the DuckDB 1.5.2 package/release evidence address different but compatible questions. The v1.0.0 and v1.1.0 DuckDB tags are historical issue-chain evidence, not the proposed runtime version. I find no source-supported reason to downgrade the data engine or replace `.ipynb` with another storage format.

I make the initial prototype’s data-engine choice explicit as **`duckdb==1.5.2`**, with a per-platform artifact hash in the eventual environment lock. PyPI records 1.5.2, `Requires-Python >=3.10`, and CPython wheels including 3.11–3.13 [S23]. DuckDB’s captured current docs identify the 1.5 line [S20], and its 1.5.2 source tag contains the regression test for the CSV row-count issue followed below [S24, S25]. This is a coherent starting pin, not a claim that this prototype or package was installed or tested here.

Three repairs matter to correctness. PEP 723 specifies metadata embedded in a single Python script; it does not define a project’s `labbook.toml` or resolve and lock an environment [S17]. DuckDB’s local-file concurrency model is one read-write process and multiple read-only processes, while the same current docs also describe a separate Quack remote protocol, beta as of 1.5.2 [S3]. Papermill supplies a useful separate-output execution pattern; the proposed static-DAG scheduler is LabBook behavior and must be built and validated separately [S14, S6].

### Evidence labels

- **[F] Source fact:** supported by the cited pinned capture. Source IDs and exact locators appear in `sources.json`.
- **[I] Engineering inference:** reasoned from source facts; not itself an external guarantee.
- **[C] Product choice:** a proposed LabBook rule.
- **[W] Executed by this candidate:** none in this Goal. The frozen seed contains summaries of earlier candidate checks; those are identified as prior claims, not current executions or complete receipts.
- **[V] Proposed / UNEXECUTED:** validation for a real implementation.

## Dependency set and source applicability

| Area | Proposed choice | Applicability and limit |
|---|---|---|
| Document interchange | `.ipynb`, nbformat major 4, minor 5 or later; validate the supported 4.5 subset against the pinned schema [S4]. | The schema defines document structure, displayed cell order, outputs, and nullable execution counters. It says nothing about a live kernel, the full event history, output freshness, or replay semantics. “4.5” is a document-format revision, not a Python package version. |
| Tabular engine | Prototype pin `duckdb==1.5.2`; lock the selected wheel hash per OS/architecture/Python. Do not install the optional `[all]` extras unless a later feature requires them [S23]. | The package metadata supports Python 3.10+; the product’s proposed initial support is narrower, 3.11–3.13. Current DuckDB docs identify their current line as 1.5 [S20]. The 1.5.2 test source is evidence that a test is present, not that a binary passed it [S25]. |
| Python support | Product choice: support CPython 3.11–3.13 initially; consider 3.14 only after the full notebook stack is exercised. | Python’s developer guide describes the five-year support policy; the captured lifecycle snapshot places 3.10 EOL on 2026-10-01 and 3.11–3.13 later [S15, S16]. Papermill’s captured README says 3.10+ [S14], and DuckDB 1.5.2 advertises wheels covering the proposed range [S23]. This is a proposed support matrix, not test coverage. |
| Notebook runtime | A fresh, isolated Python kernel for replay plus a logged interactive kernel. The exact `ipykernel`, `jupyter_client`, notebook reader/writer, and kernel-broker versions remain a pre-build lock decision. | None of the supplied captures establishes a complete, pinned runtime stack. Do not imply that the nbformat schema or papermill README pins one. |
| Reactive analysis | Use marimo’s static references/definitions DAG as a bounded design precedent, not as a runtime dependency [S5, S6]. | marimo stores notebooks as `.py`; its DAG is independent of the Jupyter JSON document format. Its docs explicitly say mutations and attribute assignments are not tracked and global definitions must be unique. LabBook must define an analyzable subset and a conservative fallback. |
| Clean execution pattern | Keep the papermill-inspired idea of producing a separate replay artifact [S14]. | Papermill is not selected as a dependency or claimed to schedule cells topologically. Its example executes an input notebook to a separate output notebook; LabBook owns replay ordering, isolation, provenance, and status. |
| Script metadata | PEP 723 may be an optional interchange aid for a standalone `.py` script [S17]. | It is not the project environment record and does not supply a resolver or lock. Never auto-install metadata from an untrusted shared project. |
| SQL | SQL is a view over the registered data sources using the same DuckDB engine, not a second notebook kernel [S2, S23]. | First release supports local data paths and a bounded query/export workflow. No separate SQL runtime or server is required. |

The version references do not conflict merely because they have different dates or granularity. The 1.0.0/1.1.0 tags and PR captures explain a 2024 bug and its fix history; the 1.5-line docs and 1.5.2 package/source captures describe the selected prototype line. The proposal must preserve that applicability distinction. The exact `nbformat.v4.5` schema is a format contract; it is not a claim that a particular Python `nbformat` distribution has been selected. [I]

## Useful precedents and their independent mechanisms

1. **Jupyter nbformat schema [F].** The captured v4.5 JSON schema requires cell IDs and code-cell output/count fields, permits `execution_count: null` for never-run code cells, defines four standard output kinds, and specifies kernelspec metadata [S4]. It gives the team portable document interchange and display order. It does not define runtime state or prove that saved output is fresh. The format can be read or written by a runtime other than Jupyter; its document role is independent of the runtime choice.
2. **marimo reactivity [F].** The docs describe static global references/definitions, a directed acyclic graph, stale marking in lazy mode, dependency order independent of page position, cancellation of queued descendants on interrupt, and untracked object mutation [S6]. The README describes pure-Python storage rather than `.ipynb` [S5]. The dependency-graph mechanism can inform LabBook without adopting marimo’s storage or runtime. Because static Python analysis cannot account for every dynamic name, mutation, file read, or extension, LabBook will apply it only to a defined subset.
3. **DuckDB [F].** The CSV docs document a default stop-and-error path, structural error categories, reject tables, and a projection-pushdown caveat: a cast error in an unprojected column may not be detected [S2]. The docs and package metadata establish CSV/JSON/Parquet as a practical tabular-engine direction [S20, S23]. This mechanism is independent of notebooks and can serve preview, transforms, and optional SQL through one engine.
4. **Papermill [F].** Its README documents parameter cells, execution, and writing to a separate output notebook [S14]. That is useful artifact-handling precedent. It does not establish LabBook’s desired graph order, sandbox, freshness model, or reproducibility guarantee.

## Consequential issue → fix → release-source regression test

**DuckDB issue #12596: `null_padding=true` with `parallel=false` produced an extra all-NULL row.** [F]

- The issue report gives a two-column CSV with trailing delimiters and an explicit three-column schema. It reports the expected two rows in the default parallel read but an extra all-NULL row in the single-threaded path; the report names DuckDB 1.0.0 and a nightly build and carries a `reproduced` label [S1, S9]. This is maintainer/user issue evidence, not a test run by this candidate.
- PR #12679 links the fix to the issue and was merged to `main` on 2024-06-24 [S9, S10]. Its patch adds a guard around null-padding validity handling and adds `test_12596.test` plus the fixture [S11].
- The v1.5.2 source commit resolved from the tag is `8a5851971fae891f292c2714d86046ee018e9737` [S24]. At that exact commit, `test/sql/copy/csv/test_12596.test` exists and expects precisely two rows in three cases, including `parallel=false` [S25]. This establishes release-source test presence. Neither the source capture nor the merge record proves the test passed in a built 1.5.2 wheel; no DuckDB binary was run here.
- v1.0.0’s tag commit predates the merge and v1.1.0’s tag is later [S12, S13]. The exact first 1.0.x release containing the fix is unresolved. Use 1.5.2 as the proposed prototype pin; do not infer the first fixed release from commit dates alone.

**Design consequence [I/C]:** a parser option and parallelism setting can affect row count. Record engine version, reader options, thread/configuration values, source identity, schema, and row count in each run manifest. Set `null_padding` explicitly in the dataset contract; do not depend on an undocumented or disputed default.

## Architecture and project record [C]

A project is an ordinary folder, optionally exported as a portable bundle after save:

```text
project/
  labbook.toml                 # LabBook schema version, project ID, Python range, engine pin
  environment.lock             # resolved package versions and platform artifact hashes
  datasets.yml                  # logical names, URIs, formats, schemas, identity policy
  notebooks/*.ipynb             # standard document; status/provenance stays in sidecars
  scripts/  sql/                # plain source files
  .labbook/
    events.jsonl                # append-only run and state-transition events
    index.json                  # rebuildable mapping from cell/output to latest event/status
    outputs/sha256/              # spilled result/output blobs, content-addressed
    cache/                       # rebuildable derived results
    locks/project.lock           # project writer coordination
  manifest.repro.json            # compact export manifest
```

`labbook.toml` is LabBook’s own project configuration, not a Python packaging standard. `environment.lock` records the concrete interpreter build, OS/architecture, resolved dependencies and artifact hashes, extensions, locale/timezone, engine version/configuration, and relevant thread or memory settings. An unresolved dependency or missing artifact makes the environment unverified; it must not be quietly resolved to latest. A package update changes the lock hash and invalidates results. PEP 723 blocks are accepted only as optional per-script metadata; they are not treated as a project lock [S17].

Dataset registration stores a URI, format, declared schema and parser settings, file size, a cheap mtime/size change hint, and a streaming SHA-256 identity. Multi-file inputs use a canonical sorted list of relative paths and per-file hashes. Hashes identify bytes; paths help locate them. The product does not rewrite or silently copy an original. When a referenced external path is unavailable on another machine, reopening prompts the analyst to locate it or mark outputs unverified. A portable bundle can include only data the user explicitly chooses to package. [C]

Every run event associates a notebook snapshot and graph version with cell IDs/code hashes, execution sequence, upstream event IDs, environment lock hash, source hashes and schemas, parser/transform parameters, engine settings, start/end time, exit/error/cancel state, output hashes, and declared side effects. The sidecar index is derived from this append-only log. If it is absent, corrupt, or inconsistent, visible outputs fall back to `unverified`; stored notebook outputs are retained for inspection, never upgraded to current by opening the file. [C]

## Data contract [C]

- **Schema before conversion.** Inference from a bounded preview is a suggestion, not a whole-file guarantee. The analyst accepts or edits a schema and parser settings, which become part of the data contract. A later full scan validates that contract. A changed field set/type produces a schema diff and requires approval; it does not silently widen or reinterpret old results.
- **Malformed input.** Default behavior is stop and report. DuckDB documents CAST, missing/extra column, malformed quoting, line-size, and encoding errors; it can stop by default or, when explicitly configured, skip and record bad rows in temporary reject tables [S2]. LabBook copies those records into a durable reject ledger before the engine session ends, with source identity, line and byte position when available, field, reason, and original record or a content-addressed reference. An opt-in skip mode must expose the rejected count and ledger in every result. No unlogged `ignore_errors` path is offered. A validation action scans all declared columns because projection pushdown can suppress errors in columns not selected [S2].
- **Missing versus null.** For CSV, short rows, empty fields, and configured null tokens are distinct input conditions. For NDJSON, a missing key and an explicit JSON `null` are different. Preserve field-presence information in the raw/normalized layer; if a chosen SQL representation collapses them, require an explicit conversion rule and record it. Heterogeneous values require a declared variant/union policy; otherwise fail with a row/field diagnostic.
- **Types and values.** Record source and target types, cast rules, date/timestamp format, timezone and null policy. Parse timestamps under an explicit timezone policy; preserve raw input for lossy conversions. UTF-8 is the default; invalid encodings fail with a diagnostic unless the user selects and records a decoder. Unicode strings remain text. Original bytes are read-only; all transforms write new versioned artifacts.
- **Row identity and ordering.** File identity is not row identity. A streaming ingest can attach a source ordinal (file identity + record ordinal/byte position) where the format permits; transformed rows retain lineage where possible. Aggregates or joins without a unique lineage key are labeled as such. A stable order is promised only when the transform preserves a recorded input ordinal. SQL result order is otherwise unspecified. A reproducible ordered result requires an explicit total sort key with a tie-breaker. Record row count and a digest over canonical typed row encodings; specify encoding/schema version and whether the digest includes order.
- **Preview.** Show a bounded first-N or explicitly described sample, schema source, and row/byte limits with a persistent `sample` label. Sample-derived values cannot be presented as full-dataset properties. Full-dataset validation is a separate scan.
- **Unsupported input.** Encrypted files, unsupported codecs/encodings, unreadable paths, malformed data beyond the selected reject policy, incompatible schema evolution, and unsupported nested/variant values stop with a useful error. Do not silently drop records, change the original, or claim the sample proves support for every row.

## Notebook execution, freshness, and replay [C]

Keep four concepts separate:

1. **Displayed order:** position in the notebook’s cell array [S4].
2. **Interactive execution order:** ordered events from the live kernel. The nbformat `execution_count` is a prompt number and may be null; it is not a complete cross-restart event log or a safe basis for sorting arbitrary cells [S4].
3. **Kernel state:** process-local mutable state. It is not durable provenance and is discarded for clean replay.
4. **Saved output provenance:** a sidecar link from `(notebook snapshot, cell id, output hash)` to a run event. A saved output alone is not a reproducibility claim.

The proposed output states are `current`, `stale`, `failed`, and `unverified`. `current` means that the displayed output is associated with a successful event whose code, known upstream dependencies, input identities, schema, environment lock, and relevant settings still match. It does not mean another machine will reproduce the same bytes. A known upstream edit/data/config change makes affected outputs stale. An environment hash change makes them stale when both environments are known and different; a missing or unresolvable environment makes them unverified. A kernel restart marks outputs from that live session unverified while retaining their bytes. A run error marks its cell failed and dependent outputs unverified. Cancel/interrupt marks the running cell and queued descendants unverified and discards incomplete output commits. A lost sidecar or uncertain dependency edge also degrades to unverified.

For simple top-level Python supported by LabBook’s static analyzer, build a DAG from cell references/definitions and invalidate descendants. Record analyzer version and graph hash. Like marimo, the analyzer cannot infer arbitrary runtime behavior; object mutation, dynamic `exec`/`eval`, hidden globals, monkey-patching, and undeclared files can invalidate its assumptions [S6]. Cells with unsupported constructs are marked opaque. For an ordinary Jupyter notebook, clean replay defaults to a fresh kernel executing displayed order, which is a clear sequential policy. Only an explicitly supported reactive subset may replay topologically (ties by displayed order). Do not infer a clean replay order from old execution counters. Editing a dependency-opaque cell conservatively invalidates the notebook’s outputs.

A clean replay starts from a fresh process/kernel and a saved notebook snapshot, selected parameters, explicit dataset identities, a locked environment and recorded engine settings. It writes a new replay notebook/artifact; it never overwrites the analyst’s source notebook. The UI reports queued/running/completed cell progress, elapsed time, errors, and cancellation. The replay event stores the actual sequence. Papermill demonstrates separate input/output notebook handling but does not supply LabBook’s graph order or sandbox [S14].

**Guarantee boundary.** LabBook can guarantee which declared code snapshot, data identities, lock, options, run order, output bytes and errors it recorded, and can report whether two observed output hashes match. It cannot guarantee identical outcomes from unseeded randomness, wall-clock/environment reads, external services, undeclared filesystem access, nondeterministic parallel operations, floating-point/CPU/BLAS variation, an incomplete lock, or a runtime defect. Network is disabled by default; per-run access is explicit and recorded, and reduces the replay claim. A matching manifest is evidence of matched declared inputs, not proof that the program had no hidden effects.

The provenance view shows cell status, event ID, code/data/environment hashes, run time, output size, and upstream lineage. Diffs compare saved versus current output hashes and structured values when bounded, plus schema and row-count changes; large results are truncated in the notebook and spilled to content-addressed artifacts with an explicit download/export path. Errors and statuses use text labels/icons and screen-reader announcements, not color alone. Reject ledgers and dependency edges have inspectable detail.

## Execution boundary [C]

Notebook code is untrusted. Use an OS-enforced sandbox around each kernel/replay process: no inherited credentials or ambient secrets; network disabled unless the analyst explicitly opts in; read-only binds for declared input files and notebook code; writable scratch/output staging only; project metadata writes mediated by the host; limits for memory, CPU, wall time, process count, and output bytes; process-group cancellation and cleanup. Expose only declared datasets and required code paths, not a broad home directory. On cancellation, limit breach, or process death, retain diagnostic logs and mark the attempted output unverified. Keep browsing/rendering separate from execution; opening a shared project never runs its code.

An import blacklist is not an isolation boundary. The actual production OS mechanism and cross-platform implementation are not selected in these materials. Start with a narrowly supported Linux implementation only after testing namespaces/permissions and escape cases; treat Windows/macOS support as unresolved until equivalent controls are demonstrated. This limits portability/usability but avoids presenting a source-level filter as security. Do not auto-install dependencies from notebook or PEP 723 metadata; review and lock them through a separate environment action [S17].

## Data scale, cache, locking, and recovery [C]

The 5 GB input on an 8-core/16 GB workstation is a **target, not a measured result**. Route preview, hashing, row-wise transforms, filters, and appropriate aggregates through bounded scans. Set engine memory/temp limits and observe whether an operator streams, spills, or fails. Sorts, global distinct, large joins, and wide materializations may have different spill/disk bounds; disclose their expected bound class before running. If there is no tested bound, stop before starting and explain the limit. DuckDB’s PyPI description says it supports larger-than-memory workloads [S23], but that does not establish this workload’s 5 GB performance.

Cache keys include source content identity, schema/parser contract, transform/notebook code hash, environment lock, engine version/configuration, parameters, and declared random seed. Cache entries are immutable and regenerable; they are never the source of truth. Any key change invalidates the cache. Cache integrity is checked by content hash.

Use one LabBook project writer lock for metadata/event/index updates; secondary openers may be read-only. DuckDB’s local database-file docs describe one read-write process and multiple read-only processes, with file-lock cautions on shared/network directories. Quack is a separate multi-process remote protocol, beta as of v1.5.2, and is not needed for the first release [S3]. A folder-level lock is still required even if no DuckDB database file is used. Do not promise multi-writer folder editing on network filesystems.

For local filesystems, stage outputs and manifests to a temporary file, flush/fsync, then atomically rename. Append checksummed events; rebuild the sidecar index from valid events after a crash. Write the commit marker/manifest last. A partial event, missing artifact, stale lock, or interrupted save leaves affected outputs unverified. Recovery should preserve the last committed state and require an explicit stale-lock takeover after checking process/host identity. Bundle export uses a temporary archive then rename. Filesystem durability and atomic rename behavior require platform validation.

## Minimum workflow coverage

| Workflow step | Mechanism |
|---|---|
| Create project | Folder scaffold, project ID/schema version, Python range, locked engine declaration. |
| Import and identify data | Register URI/format/schema/parser settings; stream content hash; keep source read-only and avoid copying by default. |
| Author notebook or transform | `.ipynb` interchange plus scripts; visible dependency graph for analyzable cells. |
| Preview | Bounded sample/schema window with sample label and explicit limits. |
| Run selected work interactively | Isolated Python kernel, event sequence, progress/errors, run/cancel controls. |
| Request clean replay | Fresh kernel, displayed-order replay by default; graph order only for the declared reactive subset; new output artifact. |
| Compare provenance | Event, input/schema/environment hashes, dependency state, row and output diffs. |
| Save and reopen | Atomic save, append-only events, content-addressed artifacts; missing inputs/sidecars degrade status. |
| Share/reopen elsewhere | Ordinary folder or portable bundle; resolve external data explicitly; no secrets/accounts included. |
| Inspect/export results | Bounded notebook output plus content-addressed full result and `manifest.repro.json`. |

The manifest contains project/notebook snapshot IDs, cell IDs/code hashes and displayed/replay order, run event and status, data URI/format/content hashes/schemas/parser settings, environment lock and engine/configuration, output hashes/row counts/truncation pointers, and declared side effects. It is compact and portable; it never embeds credentials. Private dataset bytes are included only through an explicit user export action.

## Alternatives and opportunity

**Useful opportunity:** expose DuckDB’s reject records as a data-quality pane and let the SQL colleague inspect the same registered source/schema/identity used by notebook cells. This reuses engine/data-contract state instead of creating a second SQL language runtime [S2, S23].

**Plausible alternative:** make marimo the primary notebook/runtime and retain `.ipynb` only for import/export. Its static DAG and stale marking would reduce the amount of runtime freshness logic LabBook owns [S5, S6]. The cost is that the team’s existing `.ipynb` notebooks become conversion/interchange inputs, and the mutation/dynamic-code limits still need clear handling. A lower-risk alternative for compatibility is a standard sequential Jupyter kernel plus event/provenance sidecars and no reactive reordering; it offers weaker automatic invalidation but fewer notebook semantics to invent. Neither hosted collaboration, scheduling, broad language kernels, nor multi-writer service is required.

## Validation and evidence status

**Executed by this candidate in this Goal:** none. Public source retrieval is not code execution. No DuckDB, notebook runtime, 5 GB input, or sandbox was run. The frozen seed’s witness catalog reports earlier checks W1–W4 and W1-rev1, but the supplied catalog contains summaries and code hashes rather than complete code/input/stdout receipts. They are preserved as prior-candidate claims in `witnesses.json`, not represented as current executions or independently verified results.

**Proposed / UNEXECUTED implementation validation:**

1. Resolve and lock the actual Python stack and DuckDB 1.5.2 wheel hashes for supported OS/Python targets. Run the exact release regression fixture from [S25] in every supported environment; record raw stdout/stderr/exit and verify two rows for default and `parallel=false`. The captured file’s presence is not a passing test.
2. Use tiny fixtures first for CSV, NDJSON, and Parquet covering missing-vs-null, Unicode, timestamps/timezones, heterogeneous values, projection-pushdown cast errors, explicit null padding, and reject-ledger preservation. Assert original bytes unchanged and source lineage retained.
3. Generate a 5 GB test file. Measure hash/preview latency and peak RSS on the stated 8-core/16 GB envelope; exercise each operation class and record spill bytes, temp-disk demand, cancellation, and refusal thresholds. Repeat for global sort/distinct/join. This is the gate for any performance statement.
4. Property-test state transitions over edit, upstream dependency, data identity/schema, environment lock, kernel restart, error, cancel, and missing/corrupt sidecar. No saved output may remain current after a known invalidation or interrupted run.
5. Compare fresh replay and interactive execution order on notebooks with reordered cells, null execution counts, failed cells, opaque/dynamic code, and stateful mutations. Verify sequential fallback and graph-subset behavior are explicit and output files do not overwrite source notebooks.
6. Reopen a project on a second machine with resolved/unavailable datasets and lock artifacts; verify exact status degradation, provenance diff, and result export.
7. Fault-inject save interruption at each write/rename boundary and test stale-lock recovery. Run an OS sandbox escape/permission suite for each claimed platform, including network and filesystem checks; an import blacklist is not the test.

**Critical unverified dependencies:** exact notebook reader/kernel/broker pins; the project lock/resolver implementation; production OS sandbox and non-Linux boundary; DuckDB behavior/performance for the 5 GB workload; output-preserving cross-platform save/lock behavior. Keep the proposal conditional until those gates pass.
