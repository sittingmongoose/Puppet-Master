# Research proposal — local-first reproducible notebook and data workspace (Brief B)

**Stage:** research (fresh ER9 role, 2026-10-06). **Status:** complete for this stage; critique and final stages may amend with evidence.

**Evidence legend used throughout**
- **FACT** — directly established by a captured public source `[S#]` (see `sources.json` for URL/pin/capture sha256).
- **INFERENCE** — engineering conclusion drawn from facts; assumptions stated.
- **CHOICE** — product decision this proposal recommends; a bounded alternative is given where it matters.
- **EXECUTED** — check run by this candidate in the admitted sandbox (`witnesses.json`, receipts verbatim).
- **PROPOSED/UNEXECUTED** — realistic validation still to run; no receipt exists for it.

---

## 0. TL;DR

Build the workspace around **three independently-motivated, off-the-shelf mechanisms** rather than a custom notebook stack: (1) the **Jupyter notebook document format v4.5+** for stable cell identity, execution-count semantics and structured outputs `[S1]`, executed by **nbclient**'s programmatic replay engine `[S2]`; (2) **PyArrow dataset** as the streaming scan layer for larger-than-RAM CSV/NDJSON/Parquet `[S6]`; (3) **DuckDB** as the single optional SQL surface for the SQL-using colleague, reading files in place with explicit column types and an explicit malformed-row policy `[S7][S8]`. Everything reproducibility-relevant lives in an append-only **execution event log** and per-output **status model** (`current / stale / failed / unverified`) keyed by content hashes of (cell, upstream cells, dataset, environment) — rules validated by EXECUTED check W2. A traced real failure (nbclient #88 → PR #90, kernel death hanging a clean replay forever) shows why the replay engine must actively detect kernel death rather than trust timeouts `[S3][S4][S5]`, and two live DuckDB ingestion bugs show why the data layer must be **version-pinned and validation-profiled**, because even mature engines silently drop or NULL rows under documented conditions `[S8]`.

## 1. Precedents investigated and the mechanism each contributes

### P1 — Jupyter nbformat + nbclient (document format + programmatic replay)
- **FACT** `[S1]`: the v4.5 schema gives every cell a stable `id` (pattern `[a-zA-Z0-9-_]+`, ≤64 chars); code cells carry `execution_count` ("null if the cell has not been run"); saved outputs are one of four structured types; `execute_result` outputs carry the `execution_count` that produced them; errors are structured (`ename/evalue/traceback`).
- **FACT** `[S2]`: nbclient (current line 0.11.0, June 2026) exposes per-cell hooks (`on_cell_executed`, #222), interrupt-to-error control (`error_on_interrupt`, #224), and structured `CellExecutionError` assembly including stream output (#282).
- **Mechanism contributed:** a durable, already-standard encoding of *displayed cell order ≠ execution order* and *output ↔ execution association* (EXECUTED check W1), plus a replay engine we do not have to write.
- **Independence:** this layer knows nothing about tabular engines; it only fixes document identity and kernel lifecycle. It could be swapped for another format without touching the data layer.

### P2 — PyArrow dataset (streaming scan layer)
- **FACT** `[S6]`: the dataset API is built for "tabular, potentially larger than memory, and multi-file datasets"; creating a dataset does not read data; schema is inferred "by default from the first file"; `Dataset.to_batches` yields record batches (default scanner batch 1,000,000 rows) enabling out-of-core aggregation.
- **FACT** `[S6]` (non-guarantees we must design around): **no order guarantee** when files are discovered by scanning a directory (order only for explicitly listed files); **no ACID**; concurrent writes "may have unexpected behavior"; most formats carry trailing magic numbers so partial writes are detectable, but "a partially written CSV file may be detected as valid".
- **Mechanism contributed:** bounded-memory scans, column/row-group projection, and a vocabulary of exactly which ordering and crash guarantees do *not* exist — input to the data contract (§4).
- **Independence:** pure data plane; no notebook or format dependency.

### P3 — DuckDB (optional SQL surface)
- **FACT** `[S7]`: DuckDB 1.5 (current docs) queries CSV directly with per-column explicit types (`columns = {...}`); a dedicated "Reading Faulty CSV Files" reference exists.
- **FACT** `[S8]`: DuckDB has an explicit reject-capture facility (`store_rejects` writing a `reject_errors` table) — the pattern our ingest ledger mirrors — and, at capture time, **two 'reproduced' open defects** on v1.5.5 and v2.0.0-alpha nightlies: (a) with ICU loaded, unparsable `TIMESTAMPTZ`/`TIMETZ` CSV values silently become SQL NULL even with `strict_mode=true` and `ignore_errors=false`, and `store_rejects` records nothing (#26211); (b) an explicit `buffer_size` can **silently drop the final oversized row** with no error and no rejects entry (#25825). Fixes (#26212, #26195) were **open, unmerged PRs** on 2026-10-06.
- **Mechanism contributed:** one embedded engine gives the SQL colleague zero-copy access to the same files (no import step), and its failure modes concretely justify our version-pinning + reject-ledger validation rules.
- **Independence:** DuckDB is optional; the workspace functions (replay, manifests, status) do not depend on SQL existing.

**Independence summary:** P1 fixes notebook-document semantics, P2 fixes scan/stream semantics, P3 fixes SQL-access semantics. Each was developed without the others; each can be replaced (e.g., P2/P3 swap, §8) without breaking the other two.

## 2. Traced real failure chain: nbclient #88 → PR #90 (kernel death hang)

- **Failure (FACT `[S3]`):** issue #88 (2020-06-30, labeled *bug*): running notebooks via nbclient in a Docker container, an OOM-killed kernel **subprocess** was not detected — nbclient "result[s] in an infinite running process."
- **Diagnosis (FACT `[S4]`):** maintainer comment 2020-07-09: with a per-cell timeout the run raises `DeadKernelError("Kernel died")`; without one, the reply-poll simply waits forever. Conclusion: liveness must be checked *independently of the timeout*.
- **Fix (FACT `[S4][S5]`):** PR #90 "Check if kernel is alive during cell execution", **merged 2020-07-10T22:01:24Z** (issue closed one minute later). The diff adds `_async_poll_kernel_alive` — a task that polls liveness every second during each cell and, on death, cancels the reply-poll task so `async_execute_cell` raises `DeadKernelError("Kernel died")` even with no timeout configured.
- **Regression test (FACT `[S5]`):** new fixture `Autokill.ipynb` whose cell executes `os.kill(os.getpid(), signal.SIGTERM)`, plus `test_kernel_death_during_execution` asserting an error is raised (and the pre-existing death-after-timeout test renamed `test_kernel_death_after_timeout`). Dependency floor raised to `jupyter_client>=6.1.5`.
- **Version/branch applicability and evidence limits:** merged 2020-07-10 into nbclient master; the mechanism is still referenced as present on main by open PR #349 (2026) `[S3]`. The **first release containing the fix is not pinned** by captures — the changelog capture reaches back only to 0.5.7 `[S2]` (unresolved lead L1). Mitigation: pin `nbclient>=0.10.4` (corroborated-current line) until the release bisect is done.
- **Design consequence (INFERENCE):** a "clean replay" that merely waits on cell replies can hang forever or, worse, be killed externally leaving half-updated outputs. Our replay engine therefore (i) always enables liveness polling, (ii) records a `kernel_died` execution event, and (iii) marks every output of the aborted replay **`unverified`**, never `current` (W2 R4/R6). Residual gap: PR #349 (open at capture) shows remote/gateway kernels can broadcast an `execution_state="dead"` iopub status that nbclient silently discards because it doesn't match the cell's `parent_msg_id` `[S3]` — for this product, keep kernels **local** in v1 so the fixed local path applies.

## 3. Live-failure pitfalls adopted as requirements (DuckDB)

**FACT** `[S8]`, all open at capture: silent NULLing under ICU (#26211), silent final-row drop with explicit `buffer_size` (#25825), reject-ledger line truncation near 10k chars (#18980), and closing an unfinished result **committing partial writes** on autocommit (#26314, Breaking Change label).

**Requirements derived (CHOICE):**
1. Pin the DuckDB engine version in the project's environment binding; record it in every manifest.
2. The ingestion validation profile must replicate #26211 and #25825 repro cases against the pinned version before any engine upgrade ships (PROPOSED/UNEXECUTED).
3. Clean-replay SQL steps are **read-only against source datasets**; outputs are written to staging files and atomically renamed — sidestepping #26314's partial-commit semantics rather than depending on its open fix (lead L3).
4. The product's own reject ledger (W3) is authoritative for provenance; a `reject_errors` table inside the SQL engine is advisory, never silently trusted.

## 4. Data contract (schema, conversions, row identity, errors, previews)

- **Identity without copying (FACT basis `[S6]`, INFERENCE):** a dataset reference = `{path, format, size_bytes, content_sha256, schema_fingerprint}`. Import registers the file in place (no copy); SHA-256 is computed streaming once at import and re-checked cheaply (size + mtime, full hash on demand). Parquet/IPC carry schema metadata; CSV/NDJSON get a schema fingerprint from a **full-pass** type scan (bounded by the same streaming path), not from the preview.
- **Schema assumptions & conversions:** every read declares explicit expected column types (mirroring DuckDB `columns={...}` `[S7]` and pyarrow schema bypass `[S6]`). Inference results are written to the dataset record as *assumptions*, and any later read whose observed types mismatch the assumption fails loudly or is coerced **with a recorded conversion event** (column, rule, count). Heterogeneous columns stay string-typed until an explicit conversion is authored.
- **Row/order identity (FACT `[S6]`, INFERENCE):** a monotonic `row_index` (0-based physical order of the stream) is attached during ingest; deterministic ordering requires either (a) explicit file list + per-file row order, or (b) a full sort on declared keys — directory-discovered scan order is *unspecified* per `[S6]` and is never presented as stable. **Deterministic vs stable:** operations declare whether their output order is fully determined by inputs+code ("deterministic") or only stable within one engine/version ("stable"); manifests record which claim is made.
- **Malformed records:** never silently deleted. Each violates-the-contract line goes to a reject ledger `{dataset_ref, line_no, reason, raw_prefix}` (EXECUTED W3 reproduces the shape; the `store_rejects`/`reject_errors` vocabulary is FACT `[S8]`). A run with nonempty rejects can still succeed but the ledger is surfaced in the run summary and manifest; `null_padding`/partial-CSV reads are off by default.
- **No source mutation:** original files are opened read-only; processed hashes are re-verified after runs (W3 asserts SHA-256 unchanged). Writes target new files via temp+rename.
- **Preview semantics:** a preview is a *labeled sample* (first-N and, optionally, seeded-stride-N). The UI stamps every preview with "sample of N of M rows — not a full-dataset property". W3 demonstrates concretely why: preview mean 0.5029 vs full mean 1.0000 (gap 0.497) on a 20k-row fixture.
- **Schema evolution:** a dataset's record keeps a versioned list of schema fingerprints; a changed fingerprint marks dependents **stale** (same rule as an upstream cell edit — W2 R2), and diffs old→new fingerprint (added/dropped/retyped columns) are shown in the provenance view.

## 5. Notebook semantics, replay guarantees and the status model

- **Four distinct notions (FACT basis `[S1]`):** displayed order = position in `cells[]`; actual execution order = `execution_count` sequence; current kernel state = live session contents, **not persisted in the notebook file**; output provenance = our execution-event log keyed by (cell `id`, execution event id, `execution_count`). W1 shows reordering preserves all identity/association facts.
- **Clean replay (CHOICE):** fresh kernel, cells executed top-to-bottom by nbclient with liveness polling (§2), per-cell events (`started/finished/failed/cancelled`, timings, input hashes) captured via `on_cell_executed` hooks `[S2]`.
- **What a clean replay guarantees (INFERENCE):** the same cell sources, same pinned environment binding, same registered dataset content hashes, same declared execution order — i.e., *the recorded procedure ran to completion against the recorded inputs*. Structured error outputs make failures first-class `[S1]`.
- **What stays outside the guarantee (per brief, all FACT-grounded):** clock/randomness nondeterminism; external network services (network is default-deny in the sandbox — an allowed-network run is flagged non-reproducible); unpinned packages (env binding is a lockfile + interpreter fingerprint); undeclared file access (declared allowlist only); engine-level silent-data defects like `[S8]`; and preview/sample reasoning (W3).
- **Status model (EXECUTED W2):** every visible output is `current | stale | failed | unverified`. Defined invalidation effects: upstream cell edit → that cell + descendants `stale`; dataset content change or schema-fingerprint change → dependents `stale`; environment change → all `stale`; **kernel restart → every `current` output becomes `unverified`** (kernel state no longer backs it; `failed` stays failed because the error did occur); interrupted/cancelled run → mid-flight cells `unverified`; replay error → cell `failed`, downstream `unverified`. A restart or interrupt therefore can never silently leave `current` labels.
- **Cancel/progress:** cancel sends interrupt then kills; UI shows per-cell progress (hook-driven) and a ledger of what completed before cancel; anything not completed is `unverified`.

## 6. Architecture

```
project/
  notebook.ipynb          # nbformat 4.5+ document [S1]
  transforms/*.py         # versioned, importable pure-python transforms
  datasets/registry.json  # dataset refs: path, format, sha256, schema fingerprints
  environment.lock.json   # python version, package locks, engine pins (duckdb/pyarrow), sandbox profile id
  events/run-*.jsonl      # append-only execution event log (the provenance spine)
  outputs/                # replay artifacts + manifests
  .locks/                 # advisory project lock (flock on open-for-write)
```

- **Project record:** JSON manifests, ordinary folders; a *bundle* = zip of the folder (small config + notebooks + manifests; datasets travel by hash list, with optional inline small files).
- **Environment binding:** lockfile hash + interpreter fingerprint recorded per run; a run whose binding hash differs from the saved one flags all its outputs for review on reopen (W2 R3).
- **Execution events:** every replay/interactive run appends `{run_id, kind: interactive|clean_replay, cell_id, execution_count, cell_hash, input_hashes, status, timings, rejects_count}`. Output association: saved outputs live in the `.ipynb` per `[S1]`, and each carries a `run_id` sidecar pointer, so "which run produced this" is a join, not a guess.
- **Data plane (CHOICE + bounded alternative):** PyArrow dataset scans for Python transforms; DuckDB embedded for optional SQL views over the same files. *Alternative considered:* DuckDB-only (drop PyArrow) — smaller footprint and one engine to pin, but it narrows native Python streaming transforms and couples our contract entirely to DuckDB's CSV edge cases `[S8]`; dual-plane keeps P2/P3 independent. **Support boundary (CHOICE):** Python (ipykernel) as the only first-class notebook language; SQL exists *only as dataset queries* through the embedded engine. The team should not build any further kernels — other languages are file-exchange concerns, not kernel work.
- **Envelope handling (CHOICE, target not measured):** 5 GB CSV via streaming path (chunked/record-batch, W3-pattern at engine scale) is the supported default; global ops that require materialization (e.g., global sort without keys, whole-frame `to_pandas`) run under an explicit alternate bound: hard memory ceiling (~10 GB working set on the 16 GB envelope) with a clear "operation not supported on this dataset size" error and the exact threshold named. Large results are truncated for display (bounded preview of output tables, full result only via file export) — display truncation is recorded in the output sidecar so saved-vs-current diffs never compare against silently cut data.
- **Concurrency & locking:** single-writer advisory lock per project (flock on `.locks/project.lock`), reader-tolerant; concurrent dataset *reads* fine (FACT-consistent `[S6]` "Concurrent reads are fine"); writers use unique per-run output names (basename-template rule `[S6]`).
- **Crash-safe saves:** notebook/manifest saves are journal-then-rename (write temp + fsync + atomic rename); the event log is append-only JSONL so an interrupted save leaves at most an unsealed run record, which reopens as `unverified` (never `current`). CSV-specific risk — "a partially written CSV file may be detected as valid" `[S6]` — is why *products of runs* are Parquet/IPC where possible and source-import verifies size+hash.
- **Execution boundary for untrusted notebook code (CHOICE):** OS-level confinement: dedicated process/group, memory & CPU ceilings, tmpfs scratch, filesystem allowlist = project dir + registered dataset paths (read-only for sources), network default-deny with per-run opt-in flag that marks the run non-reproducible. Usability trade-off: analysts must declare file writes and network needs up front; undeclared access fails with a readable allowlist message instead of succeeding silently. **FACT-adjacent limit (sandbox receipt):** confinement is supplied by OS sandboxing (Bubblewrap/systemd-class), **not** import filtering (lead L7); no blacklist claim is made.
- **Source browsing separation (CHOICE):** the notebook editor's file browser renders metadata only (name, size, hash, schema fingerprint); opening/executing a file's contents is an explicit "run" action through the sandbox. Browsing never executes.
- **User surfaces:** (1) provenance view — per output: producing run, input hashes, env binding, reject counts, status badge; (2) status badges `current/stale/failed/unverified` on every cell (W2 semantics); (3) saved-vs-current diff — re-execute a cell in a scratch sandbox and diff structured outputs (tabular diff limited to sampled+checksummed comparison, full-dataset equality by hash only); (4) reproducibility manifest export — small JSON: project id, notebook hash, cell hash list, dataset hashes, env lock hash, run event ids, status table.

## 7. Minimum workflow coverage

| Step | Mechanism |
|---|---|
| Create project | folder scaffold + empty registry/lockfiles (§6) |
| Import & identify data | register in place, streaming hash + schema fingerprint, no copy (§4) |
| Author notebook/transform | nbformat 4.5+ document; transforms as versioned files (P1) |
| Bounded preview | labeled sample + reject ledger + "not a full-dataset property" stamp (§4, W3) |
| Run interactively | ipykernel session; events logged; outputs associated by cell id + run id (§5) |
| Clean replay | fresh kernel via nbclient, liveness polling, cancel + progress (§2, §5) |
| Compare provenance | event log joins: this run vs saved runs; hashes + statuses (§5) |
| Save | journal+rename; outputs sealed with run ids (§6) |
| Reopen elsewhere | folder/bundle; verify hashes; statuses recomputed; env mismatch flagged (§6) |
| Inspect & export + manifest | provenance view + reproducibility manifest export (§6) |

## 8. Opportunity, alternatives, rejected ideas

- **Opportunity (cheap win):** nbclient's `on_cell_executed` hooks and `error_on_interrupt` `[S2]` give per-cell progress and cancel UX nearly for free — no custom kernel client required (lead L4).
- **Plausible alternative (bounded):** DuckDB-only data plane (single engine, one pin) vs the chosen dual plane. Choose DuckDB-only if the team values minimal footprint over native Python streaming; the contract (§4) is engine-agnostic so the swap is contained.
- **Useful but deferred:** output signing/trust (unverified this stage, L5); data-versioning tools beyond the manifest (L8); real-time collaboration, hosted service, scheduling, non-Python kernels — explicitly out of minimum scope per brief.
- **Rejected:** import-blacklist isolation (L7, and per brief); treating preview statistics as dataset facts (W3 counterexample); silently skipping malformed rows; relying on directory-scan order as deterministic `[S6]`.

## 9. Critical dependencies and unresolved items

| Dependency | Basis | Risk / fallback |
|---|---|---|
| nbformat 4.5+ cell ids & execution_count | FACT `[S1]` | low; format is standard; W1 validates our reliance |
| nbclient ≥0.10.4 pin + liveness behavior | FACT `[S2]`–`[S5]`; L1 | first-release-pin unresolved; fallback: pin current line; PROPOSED test reproduces Autokill scenario |
| pyarrow dataset streaming semantics & non-guarantees | FACT `[S6]` | main-branch docs; PROPOSED 5 GB benchmark is the real gate |
| DuckDB version pin + validation profile | FACT `[S7]` `[S8]`; L2, L3 | live silent-ingestion bugs at capture; fallback: read-only SQL + staging writes; swap to DuckDB-only or pure-Arrow if profile fails |
| OS-level sandbox for untrusted code | CHOICE + sandbox receipts | confinement audit PROPOSED/UNEXECUTED |

Unresolved/optional leads are cataloged in `leads.json` (L1–L8). Honest misses this stage: DuckDB faulty-CSV docs markdown path is dead (S9) and the captured docs page's deep sections were not rendered — error-policy semantics rest on `[S8]` captures; nbclient's changelog tail and DuckDB PR bodies were partially unrendered (per-capture byte ranges in `sources.json`).

## 10. Executed checks vs proposed validation

**EXECUTED by candidate (sandbox receipts in `witnesses.json`):**
- **W1** cell-identity/order/association invariants per the captured v4.5 schema — PASS, exit 0.
- **W2** invalidation state machine (R1–R6 incl. restart→`unverified`, interrupt→not `current`) — PASS, exit 0 (rev 2; rev 1 failed on a harness bug, recorded).
- **W3** streaming ingest with reject ledger, source-hash immutability, preview≠full-dataset demonstration (20k rows, 1 reject captured at line 13335, gap 0.497) — PASS, exit 0 (rev 3; rev 1–2 failed on data-passing and sandbox file-quota limits, recorded).

**PROPOSED/UNEXECUTED:** 5 GB streaming benchmark on the 8-core/16 GB envelope; kernel-death replay integration test modeled on `[S5]`'s `Autokill.ipynb`; DuckDB validation profile replicating #26211/#25825 against the pinned engine; cross-machine reopen drill; crash-mid-save journal-recovery drill; sandbox confinement escape audit. None of these has a receipt; the W3 result does **not** extrapolate to 5 GB or to pyarrow/DuckDB behavior, and W1–W2 do not establish any shipped product's behavior.
