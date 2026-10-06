# Research proposal — local-first reproducible notebook & data workspace (Brief B)

Stage: research (I-04-FRESH-DELIVERY-R001). Captured 2026-10-06. This document is self-contained: it presents the architecture, the source evidence, the issue/fix/regression chain, executed checks, and proposed validation, and separates each epistemic type with inline labels:

- **[SF]** source fact — an external, captured primary source says so (cite `S#` from `sources.json`).
- **[EI]** engineering inference — my reasoning from source facts or standard practice; not directly stated by a source.
- **[PC]** product choice — a decision this proposal makes; a bounded alternative is named.
- **[EC]** executed check — candidate-authored code run in the experiment's isolated execution capability, with receipt recorded in `witnesses.json`.
- **[PU]** proposed / UNEXECUTED — planned validation, not yet run.

---

## 1. Problem restatement and design stakes

Three Python-notebook analysts share projects with a colleague who occasionally runs SQL over tabular data. The recurring failures the product must answer: *why does a shared notebook produce a different result here?*, *what data and environment produced this saved output?*, and *which outputs became stale after an edit?* The brief forbids presenting preview evidence as full-dataset proof, forbids silently dropping malformed records, and forbids mutating original datasets.

Two research findings sharpen the stakes beyond the brief's own framing:

1. **Row validity can depend on the query, not just the file.** DuckDB documents that its CSV reader is affected by projection pushdown: selecting only some columns means cast errors in unselected columns never occur, so `SELECT name FROM read_csv(...)` can succeed on a file whose `age` column is broken [SF-S3]. A "the file loaded fine" statement is therefore meaningless unless the validation scan forces all columns. This directly shapes the data contract (§5).
2. **Permissive CSV parsing has a recurring silent-row-loss failure history** in the very engine this proposal selects. Issue duckdb/duckdb#10769 ("Ignore_errors causes empty result in read_csv", DuckDB 0.10.0) showed `ignore_errors=true` returning an *empty* result where strict mode loaded data [SF-S4]; the fix PR #10777 changed the sniffer to prefer dialect candidates generating the fewest errors when `ignore_errors=true` [SF-S5], shipped in v0.10.1 (published 2024-03-18) [SF-S6]. The same failure family was reported again as #11296 (0.10.1) [SF-S7] and as #19880 on DuckDB 1.4.1 (2025-11-21), where the reporter showed `read_csv_auto(ignore_errors=true)` dropping 12,094 of 99,999 rows that strict mode reads successfully [SF-S7]; #19880 was closed without any captured maintainer fix comment — the only captured comment is the reporter asking for deletion because proprietary data was uploaded [SF-S8]. **Limits of the evidence:** for #19880 we have the report and closure, not a fix or regression test; nothing captured establishes whether current DuckDB still exhibits it. Consequence for design (§5.4): the product's default ingestion path must never use skip-on-error semantics; permissive reads are opt-in and always paired with a rejects/quarantine record.

## 2. Precedents investigated and their independence

Three independently useful precedents; each contributes a different mechanism, and the architecture composes them rather than adopting any one wholesale.

### 2.1 Jupyter nbformat v4 — the document model (display order ≠ execution order)
The v4.5 JSON schema stores the notebook as a `cells` array in display order; each code cell carries its own `outputs` array and an `execution_count` ("The code cell's prompt number. Will be null if the cell has not been run."), with stable cell `id`s required since nbformat 4.5 [SF-S1]. Two consequences the design exploits:
- The format itself already *separates displayed cell order from execution order* (the array order vs the recorded `execution_count`), and keeps outputs attached to cells, not to a run. A non-monotonic or duplicate execution_count sequence across cells is directly visible evidence of out-of-order execution — the exact mechanism behind "why does a shared notebook differ" when someone ran cells top-to-bottom after running others out of order.
- The format records almost no provenance: notebook metadata contains only `kernelspec.name/display_name` and `language_info` fields [SF-S1]. **The format cannot answer "what data and environment produced this output."** Adopting nbformat is worth it for interchange (brief §9 anticipated this); it settles nothing about runtime reproducibility.

**Mechanism contributed:** document schema with display/execution-order duality and inline outputs. **Independence:** it is a storage/interchange mechanism; it has no notion of environment pinning, data identity, or staleness.

### 2.2 DVC `dvc.yaml`/`dvc.lock` — content-addressed dependency invalidation
DVC defines stages with `cmd`, `deps`, `outs`, `params`; dependencies are checked for change to decide re-execution (`dvc status`/`dvc repro`), and a generated `dvc.lock` records per-stage definitions, params, and per-output content hashes (`md5`/`etag`/`checksum`) [SF-S2]. Its docs explicitly instruct that reproducible stage code must be deterministic — avoid random numbers, time functions, hardware dependencies — and that stage code should read/write only declared deps/outs [SF-S2]. Notably, DVC's own lock example wraps a notebook as a pipeline stage via `cmd: jupyter nbconvert --execute featurize.ipynb` [SF-S2] — evidence that notebook-replay-as-pipeline is a worked pattern.

**Mechanism contributed:** staleness = compare recorded hashes of (code, params, inputs) against current; replay = re-execute the stage when any hash differs. **Independence:** a pipeline/cache mechanism with no document model and no interactive kernel; it cannot render or diff notebook outputs and does not manage environments.

### 2.3 DuckDB — the bounded-memory tabular engine with explicit error handling
DuckDB reads CSV/NDJSON/Parquet with auto-detection, documents a default full-stop-and-throw on structural errors, an opt-in `ignore_errors` skip, and a `store_rejects` feature that records every faulty line with file line number, byte positions, column, error type, original line text and message [SF-S3]. Its error output shows `sample_size=20480` (schema is auto-detected from a bounded sample) and offers `sample_size=-1` for full-file detection [SF-S3] — the engine itself demonstrates the brief's "preview is not proof" rule. It is embeddable in the Python kernel process, so the SQL colleague can run against the same registered datasets without a second language kernel (§7).

**Mechanism contributed:** streaming/bounded-memory tabular compute on laptop-class machines, plus per-row error accounting (rejects tables) instead of silent deletion. **Independence:** an execution engine; it has no notebook model, no environment pinning, no run ledger.

**Rejected/deferred alternatives** (kept visible per brief): full DVC adoption as the project format (rejected as the core: external CLI, Git-centric cache; retained as an *export* target [PC]); Snakemake/Make DAG tools (same mechanism class as DVC §2.2, heavier setup); building an R/Julia kernel matrix (rejected — brief says a small team need not build every kernel); a hosted service or real-time collaboration (deferred opportunities, §11).

## 3. Architecture

**[PC]** One local desktop app, four processes, one folder format.

```
myproject/                     ← ordinary folder; zip it to share (portable bundle)
  project.json                 ← project record (schema v1): id, dataset registry, env binding ref
  notebooks/*.ipynb            ← nbformat v4.5 documents (source of displayed order + outputs)
  transforms/*.py              ← versioned named transforms (plain files, diffable)
  data/                        ← original datasets, opened read-only; never mutated
    registry.json              ← dataset_id → {path, format, content_hash, schema, declared types, sniffed options}
  runs/                        ← run ledger (append-only JSONL per run + SQLite index)
    <run_id>/events.jsonl      ← execution events (start/cell-end/error/cancel/interrupt/restart)
    <run_id>/outputs/…         ← large outputs spilled here, referenced from the ledger
  .cache/                      ← derived datasets keyed by transform+input+env hash (invalidatable)
  pylock.toml                  ← PEP 751 environment lock [SF-S10]
  manifest.json                ← exported small reproducibility manifest (§9)
```

- **UI/editor process** (untrusted code never runs here): notebook editing, source browsing, schema/preview panels, status badges, provenance views. Source browsing is a separate read-only view path from kernel execution [PC].
- **Kernel process**: one `ipykernel` (Python) per open notebook, spawned as a subprocess; this is where untrusted notebook code runs. The product communicates with it over Jupyter's kernel protocol; on top of it, a thin in-kernel helper intercepts dataset reads/writes so the run ledger can record I/O events.
- **Data engine**: DuckDB embedded *in the kernel process* (in-process library), reading CSV/NDJSON/Parquet directly from `data/` without copying; pandas for small interactive frames. Registered datasets are exposed to user SQL as views over `read_csv(...)`/`read_json_auto(...)`/parquet scans.
- **Supervisor/ledger process**: owns the run ledger, executes *clean replays* (§6) by launching a fresh kernel subprocess with network disabled, appends events, and computes output statuses. Interactive kernel events are mirrored into the same ledger so interactive and replay share one provenance record.

Rationale: keeping the ledger outside the kernel means a kernel crash/restart cannot silently corrupt or erase provenance; keeping DuckDB in-process avoids a server and lets the SQL colleague reuse the same engine via the optional CLI (§7).

## 4. Notebook model: four things that must not be conflated

- **Displayed cell order** = order in the nbformat `cells` array [SF-S1].
- **Actual execution order** = the sequence in the run ledger's events, cross-checked against `execution_count` monotonicity in the document [SF-S1]. The UI renders an execution-order gutter badge; gaps/duplicates are shown as "out-of-order" markers, not hidden.
- **Current kernel state** = live variables in the kernel process; never written into the document; lost on restart by definition. The UI displays kernel state as its own panel with a "live/lost" indicator.
- **Provenance of saved outputs** = for each visible output, the ledger record linking output → run_id → {cell id + code hash, environment hash, input dataset version hashes, timestamps, completion or error/interrupt status}.

**Output statuses** (brief §7) defined as [PC]: `current` (output's recorded (code hash, env hash, input hashes) all match present state, and its run completed that cell without error), `stale` (any recorded hash no longer matches), `failed` (the producing run errored at this cell), `unverified` (default on reopen after kernel restart/interrupt/crash, on partial save detection (§10.3), on undeclared file access during the producing run, or when provenance is missing). A saved output is never automatically `current` — reopening computes statuses from hashes, and a restart *demotes* everything to `unverified` [EC-W2].

**Invalidation rules** [PC]:
- Edit upstream cell → that cell's outputs `stale` (code hash changed) and every downstream cell's outputs `stale` (their recorded input-hash chain includes upstream cell code hashes, in declaration order of the notebook DAG = cell order until the user declares an explicit transform graph).
- Source dataset content change (re-hash on open and on access) → all outputs whose runs recorded that dataset hash become `stale` in the same run [EC-W2]; datasets are content-addressed, so "same data, new file" still matches by hash.
- Environment dependency change (pylock.toml edit or installed-state mismatch) → all outputs from runs under the old environment hash become `stale`.
- Kernel restart, interrupt, crash, or cancel → outputs from the affected live session become `unverified` immediately; nothing may be auto-promoted to `current` without a new completing run [EC-W2].

## 5. Data contract (datasets, schema, conversions, identity, errors)

A dataset enters the project through **registration**: record path, format, content hash (streamed SHA-256, no copy), byte size, and a sniffed schema explicitly labeled `assumed` (DuckDB's sniffer works from a bounded sample, `sample_size=20480` by default [SF-S3]). Registration never mutates the original file [PC].

**Contract fields per dataset** [PC]: declared schema (name → type) with declared null/marker list; conversion policy per column (`strict` | `coerce-with-quarantine` | `keep-string`); row identity policy; error policy. Defaults: strict + quarantine — *nothing is dropped*.

- **Schema assumptions**: any type derived from a sample is recorded as `assumed(sample=N)` until a full-scan verification pass promotes it to `verified`. The verification pass must force all columns (e.g., a `count(*)` scan with `all_varchar=false` over every declared column, or `sample_size=-1` detection), because projection pushdown can otherwise hide cast errors in unselected columns [SF-S3]. Previews are always labeled "sample of first/last N rows" in the UI and are excluded from any full-dataset claim [PC; brief §5].
- **Type conversions**: all conversions happen through declared transforms, not implicitly at read. Values that fail conversion are routed to a quarantine sidecar with file line number, byte offset, column, raw text and error message — mirroring DuckDB's `reject_errors` table fields (line, byte positions, column index/name, error type, original line, message) [SF-S3] — plus the row's content hash so the record survives re-reads. The DuckDB failure history (§1, item 2) is the reason the default path refuses `ignore_errors=true` semantics; permissive reads require an explicit user opt-in and produce the same quarantine artifacts [PC].
- **Row/order identity**: rows are identified by (1-based file line / row-group+row-index, content hash of the raw row) captured at registration of a *dataset version*. Within one immutable version, stable ordering = original file order; deterministic ordering = any total order (e.g., key + row-index tie-break) recorded in the output's manifest. Sorts without a full deterministic key are marked `order: stable-not-deterministic` in run outputs so cross-machine comparisons do not treat row permutation as a content change [EC-W2b demonstrates the distinction; PC for the labeling].
- **Missing/null/Unicode/timestamps/heterogeneous columns**: missing fields and declared null markers map to NULL only via the declared policy (default markers: empty field, `NA`, `NULL`); strings are UTF-8 (NDJSON/CSV); timestamps parse only under a declared format string recorded in the contract; heterogeneous columns are permitted only under `keep-string` or JSON/Parquet native types — silent common-type coercion is off by default. Schema *evolution* = a new dataset version (new content hash, new schema snapshot); the registry keeps old versions, so runs recorded against the old version remain valid statements about that version [PC].

**Unsupported-input behavior** [PC]: undeclared encodings, lines beyond the engine's line-size limit (DuckDB default 2,097,152 bytes [SF-S3]), and undetectable delimiters raise at registration with the recorded scan parameters in the message (the engine's error format already lists which options were auto-detected [SF-S3]); the file is registered as `rejected`, never partially imported.

## 6. Clean replay: what is guaranteed and what is not

**Guaranteed within scope** [PC/EI]: a replay runs the *exact code bytes* of each cell in execution-order, in a fresh kernel subprocess built from `pylock.toml` (PEP 751 lock: machine-generated, install-time-resolution-free, hash-secured by design [SF-S10]) against *frozen registered dataset versions* (content-hash pinned), writing outputs to a new run in the ledger, with progress per cell, cancellable (kill subprocess, mark `cancelled`, all in-flight outputs `unverified`). Replay can be scoped to selected cells downstream of a change.

**Explicitly outside the guarantee** [PC]:
- *Nondeterminism*: RNG, `now()`, hardware/BLAS-dependent floating point. Mitigation is disclosure, not elimination: seeds declared in project config are injected and recorded; DVC's guidance to avoid entropy in reproducible stages is adopted as lint warnings [SF-S2, EI].
- *External services*: replay kernels run with network disabled by default; a cell that attempts network access fails loudly and the run is marked `failed-with-undeclared-access`.
- *Unpinned packages / undeclared file access*: any filesystem write/read outside `data/`-registered paths and `runs/<run_id>/outputs/` is recorded as an undeclared-access event; outputs from such runs cannot be labeled `current` (they stay `unverified`) [PC].
- *Bitwise equality*: the guarantee is "same inputs + same environment ref + same code ⇒ re-executed deterministically to the recorded order", not byte-equality of binaries across machines; result comparison is hash-of-normalized-CSV/Parquet with a documented normalization (no embedded timestamps) [EI].

**Diffing saved vs current**: the provenance view shows old vs new output side-by-side, hash-diff for data outputs, and a field-level summary for tabular outputs (row count, changed rows by row-identity hash) [PC]. (Full nbdime-grade rich-media diffing is a deferred opportunity, §11.)

## 7. Python support boundary and the SQL relationship

**[PC]** Support: CPython (last two stable minor versions), one kernel per notebook, packages installed from `pylock.toml` into a per-project venv. No other language kernels are built. This is defensible because all three analysts are Python users today, and the SQL need is served not by a second notebook kernel but by *the data engine*: DuckDB speaks SQL directly against the registered CSV/NDJSON/Parquet datasets [SF-S3], so the colleague can run SQL through a console view in the same project (and, optionally, the stock `duckdb` CLI against the same files) with zero additional kernel engineering. SQL run through the product is recorded in the same ledger as a run with its own provenance. If a real SQL *kernel* is later wanted, an existing duckdb-sql kernel would be adopted, not built [PC; alternative: read-only SQL console only].

## 8. Execution boundary for untrusted notebook code

Source facts: the Jupyter server documentation states plainly that "access to the Jupyter Server means access to running arbitrary code" and must be restricted accordingly [SF-S9]. The notebook code is untrusted in this design too [brief §13].

**[PC]** Boundary: each kernel/replay runs as an OS subprocess of the invoking user, inside a hardened environment: (a) filesystem — read access limited to the project folder plus the interpreter/venv prefixes; writes limited to `runs/<run_id>/` and `.cache/`; enforced via OS sandboxing (Bubblewrap/`sandbox-exec`-class mechanism, the same class the experiment's own isolated executor uses — its receipt notes isolation is supplied by Bubblewrap/systemd, not by inspecting code [EC-W1 receipt, limitations field]); (b) network — new empty network namespace, disabled by default, opt-in per run with the opt-in recorded in provenance; (c) resources — memory/CPU caps via cgroups, wall-clock limit, result-size truncation (§10.2).

**Usability trade-offs and honesty** [PC/EI]: undeclared-read blocking is coarse (a kernel legitimately reads the venv; distinguishing "reads project CSVs" from "reads ~/.ssh" needs path allowlists, which users will find restrictive), so the default is: reads anywhere are *recorded* and out-of-project reads demote outputs to `unverified`, rather than hard-blocked; writes are hard-blocked outside sanctioned dirs. **Import blacklists are explicitly rejected as isolation** — they do not constrain the interpreter's escape hatches, and our own execution receipt describes kernel isolation as supplied by the OS layer, not by code filters [EC-W1 limitations; brief §13]. Data-plane guarantees (§5) plus process/network/resource limits are the actual boundary; users needing stronger isolation get a documented "container profile" (optional; UNEXECUTED).

## 9. Minimum workflow, mapped

1. **Create project** → folder + `project.json` [§3].
2. **Import/identify data without copying** → register: streamed content hash, size, sniffed schema labeled `assumed`, bounded preview (first/last N) [§5].
3. **Author notebook/transform** → nbformat 4.5 notebooks; transforms are plain `.py` files referenced by cells [§3].
4. **Bounded preview** → UI-limited sample; explicitly not full-dataset evidence [§5].
5. **Run selected work interactively** → live kernel; events mirrored to ledger; status badges live [§4].
6. **Request clean replay** → supervisor launches fresh offline kernel from lock + pinned data versions; cancellable; per-cell progress [§6].
7. **Compare provenance** → two runs' ledger records side-by-side; output hash diff [§6].
8. **Save** → document + journal commit (§10.3); outputs referenced by run_id.
9. **Reopen/share on another machine** → folder/bundle; statuses recomputed from hashes; missing datasets or env → `unverified` with actionable message (rebuild from pylock; re-fetch by hash) [§4].
10. **Inspect & export results + manifest** → `manifest.json`: project id, notebook code hash, pylock hash, dataset version hashes, run events summary, per-output status and content hashes — small by construction (hashes, not data) [PC].

## 10. Envelope, caching, truncation, locking, recovery

- **5 GB on 16 GB RAM**: target, not result [brief §11]. Selected path: DuckDB streaming scans of CSV/NDJSON/Parquet from `data/` with an explicit `memory_limit` set to a fraction of RAM and a project-local temp/spill directory; per-operation bounds: streaming transforms, filters, per-group aggregates, and partitioned writes are expected to stream; a *global sort of 5 GB* either spills to the temp dir or is refused with an explicit bound ("requires ~N×file-size temp space"), never silently swapped to death [PC/EI]. **[PU-W3]** proposes the discriminating benchmark; it is UNEXECUTED here.
- **Large-result truncation**: displayed results capped (e.g., 200 rows rendered, full result written to `runs/<run_id>/outputs/` as Parquet/CSV with its own hash); "truncated" is a first-class badge so a displayed sample is never mistaken for the result [PC; consistent with §5's sample-labeling rule].
- **Caching & invalidation**: `.cache/` entries keyed by sha256(transform code + input version hashes + params + env hash); any key-part change misses; cache hits are recorded in the run ledger; per-user cache pruning never affects correctness because versions are content-addressed [PC; mechanism analogous to DVC's hash-checked deps/outs [SF-S2, EI]].
- **Deterministic vs stable ordering**: see §5; enforced by requiring explicit total-order keys for exported/compared artifacts [EC-W2b].
- **Concurrency / file locking**: one advisory `flock` per project per writer process ("who has it open" badge, read-only mode available); per-notebook kernel is single-owner; DuckDB file-database single-writer assumption respected by keeping the in-process engine per kernel and using files, not a shared DB, as interchange [EI]. *(Unverified dependency: cross-process DuckDB concurrency semantics should be re-checked against the engine's concurrency documentation before implementation — the page exists in the captured docs nav but was not captured [L6].)*
- **Interrupted-save recovery**: saves are journal-then-rename (write `notebook.ipynb.tmp` + fsync + atomic rename, with a small commit record in the ledger). On reopen, a found `.tmp` or ledger/commit mismatch means the last save is incomplete → all affected outputs `unverified`, previous good version retained [PC; consistent with restart-demotion rule [EC-W2]].

## 11. Opportunities and alternatives (visible, not requirements)

- **Opportunity**: Parquet as the universal interchange between the Python analysts and the SQL colleague — DuckDB reads/writes it natively and streaming [SF-S3, EI], so "share the derived table" becomes "share a content-hashed Parquet + one-line SQL", reducing folder-copy drift. **[PU-W5]** would validate round-trip fidelity.
- **Opportunity (deferred)**: real-time collaboration, hosted runs, scheduling — explicitly out of minimum scope [brief §15].
- **Plausible alternative architecture**: keep pandas + sqlite as the engine (no new dependency; worse fit: sqlite lacks typed columnar scans of CSV/Parquet and the rejects-table mechanism; analysts' 5 GB case becomes manual chunking). Chosen DuckDB path is preferred [PC].
- **Alternative rejected**: `pip freeze`-style requirements.txt as the environment binding — PEP 751's motivation section documents requirements files as non-standard, opt-in-hash, and not installer-independent [SF-S10]; pylock.toml chosen [PC]. *(Unverified dependency: current installer support for pylock.toml across pip/uv — not established in this research [L7].)*

## 12. Executed checks (candidate-isolated)

- **[EC-W1+W2+W2b]** (`exec-q8c_9jfp`, exit 0, isolated systemd/Bubblewrap sandbox, stdlib-only, synthetic 6-value/3-row data; full code, stdout, hashes in `witnesses.json`): (1) three type-inference policies over one column produce different per-value types and different sums (57.5 vs 54), and sample-first inference quarantines a late-row value — demonstrating that conversion policy, not the file, determines the schema, and that full validation catches what a bounded sample misses; (2) a hash-ledger marks outputs `current` → `stale` when source-data content changes and uniformly `unverified` after a kernel restart; (3) stable vs deterministic ordering of duplicate keys differ and both are recorded. **Scope limits:** an isolated component check of the *status rules*, not of any real notebook runtime, DuckDB, or large data; the receipts themselves state they do not prove semantic correctness of a full application. A first execution attempt (`exec-kc3bq0pg`, exit 1) failed on an over-strict assertion in my own check code and was corrected; both receipts are recorded honestly in `witnesses.json`.

## 13. Proposed validation (UNEXECUTED)

- **[PU-W3]** 5 GB synthetic CSV through the DuckDB streaming path under a 12 GB memory cap on the 8-core/16 GB envelope: row-count + filtered-aggregate vs a known-answer reference; assert RSS stays under cap; record timing. Discriminates: streaming claim; explicit-bound behavior for a global sort.
- **[PU-W4]** Clean-replay E2E on a 5-cell synthetic notebook: replay twice, assert identical output hashes; then inject an undeclared write and a network attempt, assert `unverified`/`failed-with-undeclared-access`. Discriminates: §6 guarantee scope.
- **[PU-W5]** Cross-machine manifest check: open a bundle on a second environment, rebuild from pylock, compare manifest hashes; assert statuses are `unverified` until datasets re-verify by hash.
- **[PU-W6]** Issue-chain regression check: reproduce the #10769 *class* of behavior with a deliberately ambiguous dialect fixture on the pinned DuckDB version, assert that strict-mode full-scan row count equals quarantine+clean counts. Discriminates that our validation pass catches sniffer ambiguity regardless of engine version.

## 14. Critical dependencies and uncertainties

| Dependency | Status | Bounded fallback |
|---|---|---|
| DuckDB CSV/NDJSON/Parquet streaming + rejects tables | Captured docs [SF-S3]; perf UNVERIFIED [PU-W3] | pandas+chunked reads with manual quarantine file |
| PEP 751 pylock.toml installer support | Spec Final [SF-S10]; tool support UNVERIFIED [L7] | pin via pip-tools-style fully-hashed requirements export |
| DuckDB permissive-read correctness (current versions) | #19880 unresolved in captured evidence [SF-S7/S8] | strict-mode full scan before any permissive read; quarantine by default [§5] |
| OS sandbox profile portability (Linux/macOS) | Standard practice [EI]; not built | document degraded mode: user-owned process + recorded reads |
| DuckDB cross-process concurrency semantics | Not captured [L6] | single-writer-per-project lock already designed [§10] |

## 15. Summary of what the research added beyond the brief

The planner's model ("preview ≠ proof; don't drop bad rows; saved ≠ reproducible") is confirmed and sharpened by three source-backed mechanisms: (1) *query-dependent row validity* via projection pushdown [SF-S3], which forces all-column full-scan validation; (2) a documented, *recurring* silent-row-loss failure history in permissive CSV parsing, with a concrete fix+regression-test+release chain (#10769 → #10777 → v0.10.1) and an unresolved 1.4.1 recurrence (#19880) [SF-S4..S8]; (3) nbformat's own metadata carrying essentially no provenance beyond a kernel name [SF-S1], which justifies the external run ledger + pylock + content-hash registry as the actual reproducibility substrate, with DVC's dep/lock invalidation as the borrowed mechanism [SF-S2].
