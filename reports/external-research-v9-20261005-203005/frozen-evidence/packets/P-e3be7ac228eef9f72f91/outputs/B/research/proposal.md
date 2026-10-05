# Reproducible Notebook & Data Workspace — Research Proposal (Development Brief B)

Stage: research/proposal, frozen 2026-10-05.
Catalogs: sources in `out/research/sources.json` (cited below as [S01]–[S18]), checks in `out/research/witnesses.json` (W1–W4, U1–U5), open items in `out/research/leads.json` (L1–L9).

**Labeling convention used throughout**
- **[S]** external source fact, verifiable at the cited catalog entry.
- **[I]** engineering inference from source facts (my reasoning; not stated by sources).
- **[P]** product choice (a decision this proposal makes; alternatives noted).
- **[E]** executed by candidate in the admitted isolated sandbox (receipt in witnesses.json).
- **[U]** proposed / UNEXECUTED validation for the real implementation.

---

## 0. Executive summary

The team's three questions — *why did a shared notebook produce a different result, what data and environment did it use, and which outputs went stale* — are answerable with a local-first workspace built from three independently proven mechanisms rather than a new notebook product:

1. **The notebook document format already records execution bookkeeping per cell** (cell id, execution count, outputs including error objects), but records nothing about kernel liveness or session identity [S03, S04]. So "is this output current?" can never be answered from the `.ipynb` alone — it must be answered by a separate, project-owned **provenance record**. [I]
2. **Content-hash dependency tracking with explicit staleness states is a solved, published mechanism** (DVC's `status`: changed deps/outs, with `--with-deps` propagating a code edit to downstream stages) [S05]. We adopt the same hash-diff-report model for cells, datasets, and the environment.
3. **A single embedded columnar engine (DuckDB) covers CSV/NDJSON/Parquet, datasets larger than RAM, quarantine of malformed rows (`store_rejects`), schema drift (`union_by_name`), and — critically — gives the SQL-using colleague the same engine the notebooks use**, so both sides share one data contract and one identity model [S06, S08, S09, S11].

For security, the notebook server literature is explicit that notebook access *is* arbitrary code execution [S15] and outputs travel untrusted with documents [S16]; therefore isolation must be an OS-level sandbox with default-deny network and a filesystem allowlist. Import blacklists are rejected as a mechanism. A real failure chain (PyArrow CVE-2023-47248: untrusted Parquet/IPC deserialization → arbitrary code execution; fixed in 14.0.1 with regression tests added in the fix commit) [S01, S02] both motivates the sandbox and sets a hard `pyarrow>=14.0.1` floor for the Parquet path.

Five small checks were executed in this experiment's isolated sandbox (sampling fallibility, contract quarantine, status machine, ordering determinism, plus one honestly recorded failed attempt); five validations remain **UNEXECUTED** and are scoped for implementation (U1–U5).

---

## 1. Scope and non-goals

**In scope [P]**: local desktop app + project folder layout; Python notebooks via ipykernel; dataset import by reference (no copy); bounded previews; interactive runs; clean replay with provenance comparison; save/reopen across machines via folders or zip bundles; small reproducibility manifest; optional SQL path over the same engine.

**Out of scope (per brief) [P]**: real-time collaboration, hosted service, automatic scheduling, broad language support, credentials/private datasets/shared account profiles. Also rejected: building additional language kernels; notebook-product parity with JupyterLab.

---

## 2. What the sources establish (facts only)

**Notebook document model.** The nbformat v4.5 schema requires, per code cell: `id`, `cell_type`, `metadata`, `source`, `outputs`, `execution_count`; `execution_count` is "The code cell's prompt number. Will be null if the cell has not been run", and outputs are typed `execute_result | display_data | stream | error`; notebook `metadata.kernelspec` names the kernel [S03]. JEP 62 made the cell `id` mandatory at minor version ≥ 4.5 precisely so applications can "associate" state with cells across sessions and "compare a cell's output across multiple runs", including paste/copy collision rules [S04]. **The schema contains no field recording kernel session identity or whether a kernel is alive** [S03 — absence of field]. [I] Therefore displayed cell order (document array), execution order (execution counts), kernel state (process, not in document), and output provenance (our event log) are four distinguishable things, and the document format itself only covers the first two plus the saved output payloads.

**Clean execution semantics.** nbclient (the executor behind clean runs) by default **stops at the first cell error and raises `CellExecutionError`, while still recording the error output in the cell**; `allow_errors`/`force_raise_errors` and the `skip-execution` cell tag modify this; per-cell timing is recorded into cell metadata [S18]. [I] A "clean replay" can therefore be built directly on nbclient's defaults, and a replay that *differs* from a saved notebook (which may contain out-of-order execution history) is detectable by comparing execution counts and output payloads.

**Outputs travel independently of execution truth.** JupyterLab documents that outputs from other machines are untrusted until explicit trust, and ships a "Paste code cells without output" setting because pasting otherwise carries old outputs along [S16]. [I] These are upstream acknowledgments that a saved output is not automatically reproducible or even safe to render — supporting our per-output status model rather than "outputs are current by default".

**Staleness reporting is a published mechanism.** DVC's `status` compares recorded hashes (in `dvc.lock`/`.dvc` files) against the workspace and reports `changed deps` / `changed outs` with sub-states (new/modified/deleted/not in cache); `--with-deps` finds upstream changes (their example: editing `code/featurization.py` marks the downstream `matrix-train.p` stage "changed deps"); imports report "update available" when the source changed [S05].

**Engine capabilities and caveats (DuckDB, current docs, v1.5-era).**
- CSV error handling: structural errors (CAST, MISSING/TOO MANY COLUMNS, UNQUOTED VALUE, LINE SIZE OVER MAXIMUM with default 2,097,152 bytes, INVALID ENCODING); `ignore_errors` skips bad rows; **`store_rejects` writes them to `reject_scans`/`reject_errors` tables with line number, byte position, column, error type, and the original line** [S06]. Documented pitfall: **projection pushdown means selecting only a valid column makes a CAST error vanish** — row validity observed under a projection is not row validity of the full row [S06].
- Sampling: `USING SAMPLE reservoir(n ROWS) REPEATABLE(seed)`; "Samples are probabilistic… the seed only guarantees that the sample is the same if multi-threading is not enabled (`SET threads = 1`)" [S07].
- Concurrency: one process read-write **or** multiple processes read-only; file locks used; caution on shared/network directories; multi-process *write* arrives via the beta Quack protocol (v1.5.2-era docs) [S08].
- Schema evolution: `union_by_name=true` unifies multiple files by column name, filling missing columns with NULL, at increased memory cost [S09].
- Memory: `memory_limit` defaults to **80% of RAM and "only applies to the buffer manager"**; docs recommend 50–60% of system memory and `preserve_insertion_order=false` for large scans; **"some of DuckDB's operations circumvent the database's buffer manager and thus they can reserve more memory than allowed by the memory limit"** [S10, S11]; temp directory size is unlimited by default [S11].

**Environment binding standards.** PEP 723 (inline `# /// script` metadata with `dependencies` and `requires-python`) is **Final** [S12]; PEP 751 (`pylock.toml` lock files, machine-generated, installable without resolution) is **Final** (resolution 31-Mar-2025) [S13]. Frictionless Table Schema v1 provides an interchange vocabulary for tabular data contracts, with the explicit distinction that `missingValues` applies to the *physical* representation while `constraints` apply to the *logical* representation [S14].

**Security posture.** "Since access to the Jupyter Server means access to running arbitrary code, it is important to restrict access to the server." [S15]

**Crash-safe local persistence.** SQLite WAL: changes are appended to a WAL file and "a COMMIT occurs when a special record indicating a commit is appended to the WAL"; readers do not block writers; an uncleanly exited process may leave the WAL file on disk and it "should be kept with the database if the database is copied or moved"; `synchronous=NORMAL` trades per-commit fsync for speed [S17].

---

## 3. Precedents and their independence

| Precedent | Mechanism contributed | What we take | What we do not take |
|---|---|---|---|
| **Jupyter nbformat/nbclient/JEP 62** [S03, S04, S18] | Per-cell identity + execution bookkeeping in an open document format; default stop-on-error clean execution | The `.ipynb` document format as-is; cell ids as provenance join keys; nbclient as the replay executor; error outputs as first-class records | Kernel/state assumptions (no status is derivable from the document); the trust/signing model (output sanitization only) |
| **DVC pipelines** [S05] | Content-hash dependency DAG with explicit, human-readable staleness states and dependency traversal | Hash-diff-report model; per-output "changed because <dep>" reasons; registry-of-imports with update states | Git integration, remotes, `dvc repro` caching machinery |
| **DuckDB** [S06–S11] | Embedded columnar engine: streaming CSV/NDJSON/Parquet readers, quarantine tables, schema union, single-writer locking, memory/temp configuration | One engine for notebooks **and** the SQL colleague; `store_rejects` as the data-quality mechanism; `union_by_name` for drift; documented limits as our envelope constraints | Beta multi-writer protocol [L4]; using it as a durable long-lived server |

**Independence.** These are three unrelated codebases/spec processes (Jupyter; iterative/dvc; DuckDB) with no shared runtime. Each mechanism is documented to work without the others: nbformat carries outputs with no dependency store; DVC computes staleness with no notebook concept; DuckDB processes files with no provenance. Composition is therefore low-risk: our integration is confined to (a) writing hashes into the DAG, (b) invoking the engine, (c) reading documents. [I]

---

## 4. Issue → fix → regression chain: PyArrow IPC/Parquet deserialization RCE (CVE-2023-47248)

- **Issue.** "Deserialization of untrusted data in IPC and Parquet readers in PyArrow versions 0.14.0 to 14.0.0 allows arbitrary code execution. An application is vulnerable if it reads Arrow IPC, Feather or Parquet data from untrusted sources (for example user-supplied input files)." Fix: upgrade to 14.0.1, or `pyarrow-hotfix` on older versions. Affected git range: introduced `a591d76`, fixed `f141709` [S01].
- **Fix.** Commit `f141709` (apache/arrow, 2023-11-06, GH-38607, PR #38608, "Disable PyExtensionType autoload"; 377 additions / 245 deletions) removes pickle-based `PyExtensionType` auto-loading on deserialization; unregistered extension types now fall back to storage types [S02].
- **Regression tests.** The same commit modifies `python/pyarrow/tests/test_extension_type.py` (+220/−93) adding `test_ipc_unregistered` and `test_ipc_registered` and inserting `validate(full=True)` after Parquet reads, plus `test_cffi.py` updates with a `registered_extension_type` helper [S02 — file list and patches observed].
- **Version applicability.** pyarrow ≥ 0.14.0 and ≤ 14.0.0 affected; fixed in 14.0.1 [S01]. Branch caveat [I]: OSV lists the fix commit on the release branch; I did not verify which maintenance branches received backports beyond the 14.0.1 release itself.
- **Limits of the evidence.** The chain is established from the OSV advisory record and the commit/PR metadata and diff (public captures); the vulnerability was **not** reproduced and Arrow's test suite was **not** run here. An issue + patch + tests in a commit does not by itself prove shipped-release behavior in every distribution channel (e.g., distro backports); the defense does not rely on it — see design consequences.
- **Design consequences [P]**: (1) default environment pins `pyarrow>=14.0.1` wherever the Parquet path exists; (2) user-supplied Parquet/IPC files are read **inside the sandbox** like any untrusted input, never by the trusted app process; (3) the manifest records the reader library version used, so old outputs produced by a vulnerable reader are identifiable in provenance; (4) this chain is the concrete argument for why an *import blacklist is not isolation* — the dangerous code path here is in a C++ deserializer reached by simply *loading data*, which no Python-level import filter would have prevented. [I]

---

## 5. Architecture

### 5.1 Project record [P]

A project is an ordinary folder (works in file managers, git-able, zips into a bundle):

```
sensor-project/
  project.json            # schema_version, name, dataset registry refs, env ref, tool versions
  notebooks/*.ipynb       # standard nbformat 4.5+ documents (displayed order + saved outputs)
  transforms/*.py         # PEP 723 inline-metadata scripts [S12]
  data/
    registry.json         # external dataset references: path/URI, sha256, size, sampled schema,
                          #   reader spec (format + options e.g. union_by_name), preview seed
  env/
    python-version        # exact interpreter pin
    pylock.toml           # PEP 751 lock [S13]; requirements.lock generated as fallback [L3]
    kernelspec.json       # kernel name/display_name mirror of notebook metadata
  runs/
    events.sqlite         # SQLite WAL event log: execution events, output records, denials
  cache/                  # content-addressed derived artifacts (parquet chunks, previews)
  manifest.json           # generated reproducibility manifest (export artifact)
```

Rationale: the notebook document stays *standard* (interoperability with colleagues' existing tools [S03]); **all truth about currency lives in `runs/events.sqlite`**, which the notebook cannot fake. [I]

### 5.2 Data contract [P, with S06/S14 grounding]

Each registered dataset carries a contract:

- **Declared schema** (Frictionless-compatible vocabulary [S14]): ordered fields with name, logical type ∈ {int64, float64, utf8, bool, timestamp(ISO-8601), binary, json, unknown}, nullability, `missingValues` tokens (physical-level, e.g. `""`, `"NA"` [S14]).
- **Coercion policy** per field: `strict` (fail) | `coerce` (declared conversions only, e.g. "3" → 3) | `quarantine`. **Default `quarantine`: malformed records are never silently dropped and never mutate the source file**; they are written to a project-owned quarantine store keyed by (dataset_hash, line number, byte position) — mirroring DuckDB's `reject_errors` columns [S06] but persisted by us so quarantines survive the session [L5].
- **Row identity**: `rid = (dataset_hash, row_ordinal)` with byte offsets retained where the reader provides them [S06]. No implicit row order; "deterministic" always means explicit `ORDER BY` with the `rid` tie-break; "stable" means equal keys preserve scan order and is recorded as such. W4 demonstrates why the tie-break is required. [E]
- **Schema assumptions & drift**: the registered schema is advisory; on re-open or re-hash, drift (new/renamed/retyped columns) is surfaced, never silently absorbed. Multi-file datasets with drifting schemas may declare `union_by_name=true` [S09], and the manifest records that option because NULL-filled columns are reader-introduced values, not source values. [I]
- **Timestamps** are normalized to ISO-8601 with explicit offsets at contract application; **Unicode** is preserved verbatim; **nulls** are distinct from missing-fields and from `missingValues` tokens. W2 exercises all of these. [E]
- **Validation rule (from the projection pitfall)**: contract validation runs over **all declared columns** (or a full-row scan mode), because projected reads may not observe errors at all [S06]. [I]
- **Preview disclosure**: every preview is a seeded reservoir sample (`USING SAMPLE reservoir(n ROWS) REPEATABLE(seed)` with `threads=1` for repeatability [S07]); previews are labeled "SAMPLE n of M" in the UI and **sampling never constitutes evidence of a full-dataset property** — W1 shows a seeded 20-row sample missing a category a full scan finds. [E]

### 5.3 Execution model: four notions, one status machine [P]

The product explicitly distinguishes:
1. **Displayed order** — the cell array in the `.ipynb` [S03].
2. **Execution order** — `execution_count` values and the event log sequence; out-of-order interactive runs are legal and recorded.
3. **Current kernel state** — the live process; *never* persisted in the document (nothing in nbformat records it [S03]); its identity (kernel session uuid) lives only in the event log.
4. **Output provenance** — per visible output: the run id, cell id [S04], cell text hash, input hashes (upstream cell ids, dataset hashes, env fingerprint), execution count, timing [S18], and status.

**Output status machine** (W3 demonstrates all transitions [E]):

| Status | Meaning |
|---|---|
| `current` | all recorded input hashes match present state and the output was produced in the recorded kernel session |
| `stale` | a recorded dependency changed (upstream cell text, dataset hash, env fingerprint); the changed dep is named in the UI ("stale because cell:a") |
| `failed` | last run of this cell errored; the error output (ename/evalue/traceback [S03]) is preserved and displayed |
| `unverified` | kernel restarted, run interrupted, event log gap, or bundle opened on a new machine — the product refuses to claim currency |

**Invalidation effects [P]** (modeled on DVC's changed-deps traversal [S05]):
- Edit an upstream cell → downstream outputs become `stale` immediately (text hash diff), upstream output stays `current` until re-run.
- Change a source dataset (re-hash on open, on explicit refresh, or on file-watch) → outputs of every cell depending on it become `stale`.
- Change the environment (lock file edit, interpreter change) → **all** outputs in affected notebooks become `stale`.
- **Kernel restart or interrupted run → affected outputs become `unverified`, never `current`.** This is the design rule the brief mandates; it is enforceable because currency requires the session id recorded at output creation to match the live session [I], and restart issues a new session.
- Save/copy of the document alone (e.g., paste carrying outputs [S16]) never changes statuses; statuses attach to output *records*, not document bytes.

### 5.4 Clean replay: guarantee and its boundary [P]

A clean replay = fresh sandboxed kernel (new session id), environment built from `env/` pins, every code cell executed in **displayed order** (honoring `skip-execution` tags [S18]), default stop-on-first-error with the error output recorded [S18], all results written as a new run in the event log.

**What the product guarantees:** every visible output in the replay record was produced from the current cell text, in a fresh kernel, with the pinned interpreter/lock file, against datasets whose hashes were verified before the run; each output carries complete input hashes; failures are surfaced per cell with tracebacks.

**What remains outside the guarantee** (stated in-product next to the replay button): wall-clock time/locale; RNG or hash seeds not fixed in code; external network services (denied by default; if allowed per-cell, recorded but not reproducible); undeclared file access outside the sandbox allowlist (denied, and denials recorded — but denial cannot retroactively prove earlier outputs didn't depend on something); platform floating-point/BLAS differences across machines; packages not in the lock (e.g., system libraries). [I, grounded in S07's nondeterminism note and S15's arbitrary-code stance]

**Comparing provenance:** the replay view diffs, per cell id: saved execution_count vs replay execution_count (detecting out-of-order original runs [I]), saved vs replay output payloads (hash + visible diff), and input-hash sets, so the team's original question — "why did we get different results?" — has a concrete answer surface.

### 5.5 Engine and the SQL relationship [P]

DuckDB embedded (pinned 1.x line) is the single tabular engine. Notebooks reach it as a library; the SQL colleague reaches the **same registered datasets** through the DuckDB CLI in read-only mode against the same reader specs (CSV/NDJSON/Parquet, `union_by_name`, `store_rejects`). This is *not* a second language kernel: no kernel process, no protocol work — just a documented reader configuration plus the project lock. Justification: DuckDB documents in-process single-writer/multi-reader concurrency [S08], quarantine tables [S06], and multi-file schema union [S09]; a small team gets SQL interchange without building anything per-language (brief requirement). The colleague's ad-hoc queries are, by default, **read-only** (single-writer rule [S08]); writes happen through versioned transforms so the DAG stays complete. [P]

### 5.6 Python support boundary [P]

CPython 3.10–3.12 via ipykernel; one kernel per notebook; replay via nbclient [S18]. No other kernels are built (brief). Transforms declare dependencies inline with PEP 723 [S12]; the project environment is locked with PEP 751 `pylock.toml` plus a generated `requirements.lock` fallback because installer adoption of PEP 751 is not yet verified here [L3]. If `pyarrow` is present anywhere in the tree, the floor is `>=14.0.1` [S01].

### 5.7 Execution boundary (untrusted notebook code) [P]

Notebook and transform code runs in an OS-level sandbox per kernel process:
- **Filesystem**: read-only mounts for source datasets and anything outside the project; read-write only for `cache/` and a scratch tmpfs; the project record itself is written by the trusted app process (the sandboxed kernel cannot edit its own event log). [I — consequence of S15]
- **Network**: default deny; per-cell or per-notebook opt-in grants are recorded as provenance and displayed; denial events are visible in the run feed.
- **Resources**: RLIMIT_AS/threads per kernel sized to the 16 GB envelope (kernel memory cap ≈ 8 GB, DuckDB `memory_limit` ≈ 50–60% per docs guidance [S10]); wall-clock timeouts with interrupt-then-kill.
- **Mechanism**: Linux bubblewrap/systemd scopes; macOS seatbelt; denials surfaced as first-class run events (U5 validates). This mirrors the isolation this very experiment provides for candidate code (bubblewrap/systemd per the execution receipts).

**Usability trade-offs, stated**: matplotlib font caches and compiled extensions need scratch/tmp allowances; pip-installing from a cell is blocked by design (environment changes go through the lock file, keeping env changes reviewable); remote data fetch requires an explicit grant and then becomes non-replayable provenance. [P]

**Rejected**: import/module blacklists as isolation — the PyArrow chain [S01/S02] shows attack surface reached by data loading in native code; Jupyter's own docs frame the server as arbitrary-code execution [S15]; Python-level filters are bypassable and provide no network/FS/resource enforcement. Also rejected: relying on Jupyter's output-trust mechanism [S16] for anything beyond rendering safety — it does not constrain execution.

### 5.8 Storage, caching, truncation, locking, recovery [P]

- **Event store**: SQLite in WAL mode [S17]: append-only `run_started/cell_completed/cell_failed/run_interrupted/kernel_restarted/policy_denied/output_created` events; readers (UI) never block the writer (kernel feed). WAL semantics give crash recovery by replay; the **`-wal` file ships with any bundle copy** per SQLite's explicit instruction [S17].
- **Atomic saves**: notebook/manifest writes are temp-file + atomic rename on the same filesystem; a crash mid-save leaves either the old or new complete file. **Interrupted-save recovery [U2]**: on open, the app replays the WAL, marks any output lacking a terminal event `unverified`, and completes or discards partial files.
- **Caching/invalidation**: cache entries are content-addressed by (reader spec + input hash + transform hash); a cache hit requires the exact dependency hashes, so cache reuse can never mask a stale dependency (statuses still compute from hashes [S05-style]).
- **Large-result truncation**: display shows the first 1,000 rows / 2 MiB of any result with an explicit truncation marker and total counts (W1's marker pattern [E]); full results spill to `cache/` as Parquet with a pointer in the output record. Preview samples are seeded and labeled SAMPLE [S07].
- **Concurrency/locking [U4]**: the project takes an advisory `flock` for read-write sessions; a second opener gets an explicit message and a read-only mode; DuckDB's own file-lock behavior and single-writer rule [S08] is mirrored at project level so the two layers never fight. Shared/network-filesystem caution is surfaced in-app [S08].
- **Envelope for 5 GB inputs [U1]**: bounded operations (scan, filter, aggregate, sample, hash) stream through DuckDB with `memory_limit` 50–60%, `preserve_insertion_order=false` [S10], unlimited temp dir [S11]. Operations without a bounded path (e.g., global interactive sort of an unindexed 5 GB CSV in the UI) get an explicit "requires spill/temp or different bound" declaration rather than a silent attempt — docs note the memory limit is not a total guarantee [S10], so U1 measures actual RSS. [I]

### 5.9 Manifest (export) [P]

`manifest.json` — small, human-auditable: project schema version; dataset hashes + reader specs (incl. `union_by_name` [S09]) + sampled-schema flag; env (python version, `pylock.toml` hash, kernel name [S03]); notebook file hashes; per-output status summary + execution counts; replay records; tool versions (incl. duckdb and, if used, pyarrow ≥ 14.0.1 [S01]); sandbox policy summary. Hash bookkeeping round-trips (W3 [E]). A colleague receiving the folder can answer "what produced this number" without the app. Frictionless Table Schema documents may be attached to datasets for cross-team interchange [S14].

---

## 6. Minimum workflow coverage [P]

| Brief step | Mechanism | Grounding |
|---|---|---|
| Create project | folder + `project.json` scaffold | §5.1 |
| Import & identify data without copying | registry records path + streamed sha256 + sampled schema; file stays in place | §5.2; DVC import analogy [S05] |
| Author notebook/transform | stock `.ipynb` [S03]; PEP 723 transforms [S12] | §5.6 |
| Preview bounded sample | seeded reservoir, SAMPLE-labeled, truncated marker | §5.2; [S07]; W1 [E] |
| Run selected work interactively | sandboxed ipykernel; statuses update live; cancel = interrupt→kill, outputs go `unverified` | §5.3/5.7; W3 [E] |
| Request clean replay | nbclient fresh kernel, displayed order, stop-on-error [S18]; replay record + provenance diff | §5.4 |
| Compare provenance | per-cell id diff of counts, payloads, input hashes [S04] | §5.4 |
| Save / reopen elsewhere | folder or zip bundle incl. WAL; reopen = hashes verified, outputs `unverified` until re-verified | §5.1/5.8; [S17]; U3 |
| Inspect & export results + manifest | manifest.json + export of any result/preview | §5.9 |

---

## 7. Executed checks [E] — summary (full receipts in witnesses.json)

- **W1 `exec-ibi5bnok`, exit 0** — seeded 20-row preview of a 1000-row dataset missed the only rare-category row that a full scan finds; identical seed reproduced the identical sample. Establishes: previews are repeatable but are not proof of dataset properties; truncation markers accompany previews.
- **W2 `exec-g1i97bf6`, exit 0** — contract parser accepted 3 rows (Unicode `naïve ✓` preserved, nulls distinct), quarantined 4 rows (coercion failure, missing required field, non-JSON, impossible date) each with offset + reason + preserved raw line; source array unmutated.
- **W3-attempt-1 `exec-g8sj7v5r`, exit 1** — failed scenario script (KeyError), recorded honestly; superseded by W3.
- **W3 `exec-scuesopl`, exit 0** — status machine timeline: current → downstream stale (named cause) → all stale on dataset mutation → **unverified on kernel restart** → failed with captured error; manifest hash round-trip ok.
- **W4 `exec-wabe9p2h`, exit 0** — key-only sort order depends on physical input order; explicit `rid` tie-break yields identical order across inputs.

Scope: all are stdlib-only component checks on tiny synthetic data in the admitted isolated sandbox; none prove a full runtime, DuckDB behavior, or large-dataset handling.

## 8. Proposed / UNEXECUTED validation [U]

U1 5 GB streaming on the 16 GB envelope (measure actual RSS — the documented buffer-manager caveat [S10]); U2 kill-during-save recovery (WAL replay + atomic rename + `unverified` labeling); U3 two-machine bundle open; U4 two-process project locking; U5 sandbox denial conformance (network/FS/resource, denials visible). These gate the implementation; none are claimed as done.

---

## 9. Opportunities and alternatives

**Opportunities.**
1. **One engine, two user groups** [P]: DuckDB under both notebooks and the colleague's SQL gives the team a shared contract, shared quarantine, and shared identity — the brief's "defensible relationship to optional SQL" without a second kernel [S08]. This is the proposal's headline opportunity.
2. **Quarantine as a first-class data-quality view** [P]: because `store_rejects` records line/byte/column/error [S06], the UI can show "this dataset has 37 quarantined rows, here they are" — turning error handling into a reviewable artifact rather than a log line.
3. *Deferred*: in-browser read-only viewer (JupyterLite-style) for sharing manifests without install; cell-level value lineage (Verdant-style, L6).

**Plausible alternative** (bounded): use **Polars' lazy/streaming engine** for transforms instead of DuckDB, keeping DuckDB only for the SQL colleague. Trade-off: two engines, two dialects, two drift behaviors; rejected for now because one engine covers the same formats plus SQL interchange with documented out-of-core behavior [S10, S11] (L7).

**Rejected alternatives** (kept visible): import blacklists as sandboxing (§5.7); hosted sync/scheduling (out of scope); building non-Python kernels (out of scope); trusting `.ipynb` outputs as current (contradicts S03's missing kernel-state and S16's paste behavior); designing against DuckDB's beta multi-writer protocol [S08, L4].

## 10. Critical dependencies and unsupported inputs

**Dependencies (pinned)**: CPython 3.10–3.12; ipykernel/jupyter_client; nbformat (4.5+ documents) [S03, S04]; nbclient for replay [S18]; DuckDB 1.x [S06–S11]; SQLite (stdlib) with WAL [S17]; pyarrow ≥ 14.0.1 on any Parquet path [S01]; OS sandbox (bubblewrap/seatbelt). **Unsupported critical-design dependencies recorded**: PEP 751 installer adoption (mitigated by fallback lock, L3); DuckDB memory-limit non-guarantee for envelope sizing [S10]; sandbox portability across Linux/macOS (U5).

**Unsupported / explicitly-bounded inputs**: malformed CSV lines beyond declared policy → quarantined, never dropped [S06-style]; lines exceeding `max_line_size` → error with quarantine option; concurrent writers to one project → lock refusal [S08]; languages other than Python; network-dependent cells without a recorded grant; global unbounded operations on huge inputs → explicit different-bound error rather than OOM [S10].

## 11. Uncertainties

See leads L1–L9. The two most load-bearing: (L2) the canonical Jupyter statement on restart-vs-outputs moved/404'd — our requirement rests on the schema's missing kernel-state field [S03] plus the brief, not on that page; (L3) PEP 751 adoption — mitigated by dual lock artifacts [S13]. Per the brief: an issue title, patch, or API example alone is not treated as release-behavior proof; the PyArrow chain's limits are stated in §4.
