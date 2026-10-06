# Research proposal — reproducible notebook and data workspace (Development brief B)

Stage: research (fresh ER9 role). Date of capture: 2026-10-06. All public-source facts below are cited as [S#] into `out/research/sources.json` (URL, pin, exact locator, capture sha256). Labeling used throughout:

- **FACT** — stated by a captured public primary source.
- **INFERENCE** — engineering reasoning from facts; not itself stated by a source.
- **CHOICE** — product decision this proposal makes; a defensible alternative may exist.
- **EXECUTED (candidate)** — small check actually run by this stage in the admitted isolated sandbox; receipt in `out/research/witnesses.json`. Scope limits apply.
- **PROPOSED / UNEXECUTED** — validation planned but not run here.

---

## 1. Summary and architecture choice

**CHOICE.** A local-first **project folder** is the unit of work and exchange. It contains notebooks stored in **nbformat (Jupyter v4.5+ JSON)** [S4], small config/manifest files, and **references** (path + content identity) to tabular datasets that stay in place. Three components:

1. **Notebook layer** — nbformat documents rendered in a viewer; an ipykernel-based interactive kernel for exploratory runs; a **fresh-kernel replay executor modeled on nbclient** (`NotebookClient`: per-cell timeout, `allow_errors=False` default so the first error stops the run, error outputs still saved for inspection) [S2][S3].
2. **Data layer** — **DuckDB embedded, read-only over the original files** (CSV / NDJSON / Parquet) for schema inspection, bounded previews, transforms and the colleague's SQL; no import-copy step for query-style work [S6][S7]. Polars is the bounded alternative for pure-Python transforms (§10).
3. **Provenance layer** — a small JSON **run journal + reproducibility manifest** recorded by the product (not by the kernel): dataset identities, environment pin, execution events, per-output status (`current / stale / failed / unverified`).

**Why not "a notebook product".** The kernel ecosystem is single-language-hostile to small teams (brief: "a small team should not need to build every language kernel"). DuckDB answers the SQL colleague *without a second kernel or a server*: SQL over the same files, in-process [S6][FACT]. nbformat gives interchange compatibility with Jupyter for free [S4][FACT] — but adopting the format does **not** settle runtime behavior; outputs in a saved notebook carry no binding to data or environment state, which is why the provenance layer is the product's own contribution [INFERENCE from S4].

## 2. Implementation precedents, mechanisms, and independence

**Precedent 1 — Jupyter document/execution model (nbformat + nbclient).** Mechanism contributed: the *document model separates identity, order, and execution*:
- Every cell has a stable **`id`** (`^[a-zA-Z0-9-_-]+$`, length 1–64), required in nbformat 4.5 [S4][FACT] — identity that survives reordering and is the join key for provenance.
- Code cells carry **`execution_count`** ("the code cell's prompt number; null if the cell has not been run") and their **`outputs`** inline, with output types `execute_result` (which carries its own `execution_count`), `display_data`, `stream`, and **`error`** [S4][FACT]. So the format itself encodes: displayed order (cell array) ≠ execution order (`execution_count`), and a saved output may be a failure — *the format does not claim an output is reproducible* [INFERENCE].
- **Clean replay exists as a mechanism**: nbclient executes a notebook programmatically against a kernel chosen by name or notebook metadata, with `resources.metadata.path` for the execution directory, a per-cell `timeout` (default 30 s per the guide), and hooks (`on_notebook_start/complete/error`, `on_cell_start/execute/complete/executed/error` with the kernel's `execute_reply`) that are exactly the observability surface a "clean run / cancel / progress" UI needs [S3][FACT]. Default behavior: the first error raises `CellExecutionError` and stops; the partially executed notebook can still be saved, containing outputs up to the failing cell plus the stack trace; `allow_errors=True` (default False) continues and stores error outputs for all failing cells [S3][FACT].
- Kernel communications: by default ZMQ sockets are **local TCP, unencrypted**; "any process on the same host that can reach those ports can connect and read messages, including all IOPub output"; CurveZMQ transport encryption is new in jupyter_client 8.9 and **defaults to disabled**; IPC additionally relies on filesystem permissions [S1][FACT]. The notebook toolchain coordinates execution; **it is not a sandbox** [INFERENCE].

**Precedent 2 — DuckDB file-direct SQL engine.** Mechanism contributed: **query the original data in place**. The current docs open with `SELECT * FROM 'flights.csv';` (auto-inferred) and `read_csv(..., columns = {...})` for explicit schemas, plus read-from-stdin; CSV/JSON/Parquet are all first-class [S6][FACT]. Sniffer defaults visible in real error output: delimiter/quote/escape/new_line/header auto-detected, `sample_size = 20480`, `strict_mode = true`, `ignore_errors = false` [S7][FACT]. The error message itself offers the dangerous escapes — `strict_mode=false`, or **`ignore_errors=true` "to skip this row"** — which is precisely the silent-deletion hazard the brief forbids; our data contract (§5) makes such modes explicit, opt-in, and journaled [CHOICE based on S7].

**Independence.** The two precedents are independent projects, mechanisms, and codebases (Jupyter: document format + kernel protocol client, Python; DuckDB: in-process analytical SQL engine over files, C++). Each is independently useful here: drop the notebook layer and DuckDB still serves data prep + SQL; drop DuckDB and the notebook layer still manages provenance [INFERENCE]. Polars (lazy/streaming engine; docs TOC confirms pages for Lazy API, Schema, "Inspecting a streaming query" / "Monitoring a streaming query") is a **third, partially overlapping** precedent kept as the bounded alternative engine [S10][FACT: page/TOC; body not captured — see leads].

## 3. Traced issue → fix → regression test (with limits)

**Issue: duckdb/duckdb#16476** — "CSV sniffer fails to detect standard use of the escape-by-doubling convention" (opened 2025-03-03, closed 2025-03-12, label `reproduced`) [S7][FACT]. `read_csv` on a standard public government CSV (Cambridge MA open data) failed at **line 171130** with "Value with unterminated quote found": the sniffer auto-detected **`escape = \` even though the backslash never occurs in the file**; the file escapes embedded quotes by doubling per RFC 4180 (rule 7) [S7][S8][FACT].

Consequential chain, each step captured:
1. **Regression window**: a commenter reports DuckDB **1.1.3 read the same file successfully**; another reproduces on **v1.2.0 (build 5f5512b827)**; reporter tested 1.2 / V1.3.0-dev926 (485fcc00e8) [S8][FACT]. So the wrong-escape preference was introduced between 1.1.3 and 1.2.0.
2. **Maintainer dispute, then standard settled it**: the sniffer's escape choice was initially defended as "not the CSV standard"; Postgres `COPY … WITH csv` output demonstrating doubling-by-default and RFC 4180 rule 7 changed the assessment ("I stand corrected") [S8][FACT].
3. **Fix**: commit `7d9d4fc60d1b51e1f18763f4f8f4e3c91112bb37` (GPG-signed, verified; author Mark Raasveldt), PR **#16584**, "Give preference to quote=escape if we can't do better", message references "Fix: …/issues/16476", merged 2025-03-12. It modifies `src/execution/operator/csv_scanner/sniffer/dialect_detection.cpp` (+9 lines: among tied sniffing candidates, prefer one whose **escape == quote**, i.e., escape-by-doubling) [S9][FACT].
4. **Regression test**: the same commit **adds** `test/sql/copy/csv/test_quoted_later_escaped.test` (+35 lines): it builds a file where quotes appear plain for 100 000 rows and the escape-by-doubling evidence appears only **later** (mirroring the reporter's "line 171130" scenario), then asserts `sniff_csv` returns quote `"` and escape `"` for both a 100k-row and a 5k-row variant [S9][FACT].

**Version/branch applicability and evidence limits.** FACT: broken in 1.1.3→1.2.0 window per user reports (1.1.3 OK, 1.2.0 broken), fix merged to main 2025-03-12. **Not established by my captures**: the exact first stable release containing the fix (likely the 1.3.0 line; I did not capture 1.3.0 release notes), nor behavior of the current 1.5 docs build. Also note the fix is a *heuristic preference among tied candidates*, not a guarantee — the bug class ("sniffer infers dialect from a bounded sample; truth appears later in the file") is structural: `sample_size = 20480` is the sniffing sample [S7][FACT]. **Design consequence (the reason this chain matters here):** any schema/dialect inference from a *bounded preview* is a hypothesis, not evidence about the whole file; our data contract therefore (a) pins inferred settings into the dataset record after a full-file validation pass, (b) re-validates lazily in the streaming path so late-in-file violations still surface, and (c) never marks a preview-based claim as a full-dataset property [CHOICE]. Related captured issues of the same class: #10336 (a trailing all-null row flips an inferred column DOUBLE→VARCHAR in 0.9.2) and #11840 (date-format inference depends on column content/order even with `sample_size=-1`) [S7][FACT — issue bodies only; fix status not traced].

## 4. Project record

**CHOICE — layout** (ordinary folder; syncs via git/drive/zip):

```
project/
  project.json          # record: schema version, datasets, env pin, settings
  notebooks/*.ipynb     # nbformat 4.5+ documents [S4]
  manifests/            # reproducibility manifest per saved run (small JSON)
  runs/journal.jsonl    # append-only execution events
  .locks/               # advisory single-writer lock files
  data-ref/*.json       # per-dataset identity records (see §5)
```

- **Record contents**: project id; dataset references (path, format, content hash/size, declared schema, dialect pin); environment binding (Python version + lockfile hash, kernel name); execution events; output associations. The nbformat `metadata.kernelspec` / `language_info` fields stay in each notebook for Jupyter compatibility [S4][FACT]; the project record adds what nbformat lacks (dataset identity, env lock, event log) [INFERENCE].
- **Concurrency / locking**: one advisory lock file per project (`flock`); second opener gets read-only access with a clear banner [CHOICE/INFERENCE]. Rationale: two kernels writing one journal/manifest corrupts provenance; DuckDB's own concurrency page exists but multi-process writes are out of scope for v1 [INFERENCE; lead L7].
- **Recovery after interrupted save**: all record/manifest/notebook writes are **temp-file + atomic rename**; the journal is append-only JSONL with a per-record checksum; on open, the loader replays the journal and flags a torn tail record as an *event gap*, marking affected outputs **unverified** — never current [CHOICE]. PROPOSED/UNEXECUTED: crash-injection test (P4).

## 5. Data contract (schema, conversion, identity, errors, previews)

- **Import without copying**: registering a dataset records path + identity (content hash — for large files, a full-file SHA-256 computed in a bounded-memory pass, size, and for Parquet also footer/statistics) — the original file is opened read-only thereafter; product code never writes to source paths [CHOICE]. DuckDB supports exactly this pattern (query files in place) [S6][FACT].
- **Schema assumptions**: a bounded preview (head + a stride sample) produces a *hypothesis* schema; it is only promoted to the declared contract after one full-file streaming validation pass (field count, type coercibility, dialect). Preview-based claims are always labeled "sample-based; not a full-dataset property" in the UI [CHOICE; forced by S7/S9 chain — the sniffer sample missed evidence at line 171130 [FACT]]. Explicit `columns = {…}` mapping is supported and recommended for known schemas [S6][FACT].
- **Type conversions**: declared per column; missing/empty handling is explicit per dataset (`empty_is_null`), never implicit; null ≠ empty-string ≠ NaN in the manifest's value-encoding rules; timestamps carry declared format + tz policy (store UTC, declare offsets); Unicode is preserved verbatim (UTF-8 end to end). **EXECUTED (candidate, W1)**: stdlib CSV defaults silently fill missing fields with `None` and park extra fields under a `None` key, and `json.dumps` emits the non-standard `NaN` token that strict parsers reject — both demonstrated in the sandbox receipt `exec-bf1b51q9` (exit 0). Scope: tiny synthetic data, stdlib only; proves the *hazard pattern*, not any product build [FACT — receipt].
- **Row/order identity**: rows are addressed as `(dataset_hash, physical_row_index)` with byte-offset anchors recorded per chunk during the validation pass; ordering is by construction *stable* in the streaming path, and any operation whose parallel execution may reorder is marked **unordered** in results and must be made deterministic by explicit sort keys before it feeds an output claimed reproducible [CHOICE/INFERENCE]. "Deterministic" = same inputs+env ⇒ same bytes; "stable" = same inputs ⇒ same order in practice, no guarantee across engine versions [definition — CHOICE].
- **Error handling — no silent deletion**: malformed records fail the run by default with line numbers; the only path to skip is an explicit per-dataset `on_malformed: quarantine` setting that writes offending raw lines to a sidecar file with counts, and the manifest records `rejected_count`; nothing is dropped silently. (DuckDB's own defaults align: `strict_mode=true`, `ignore_errors=false`, and its error text lists skip-modes as *options*, not defaults [S7][FACT].)
- **Schema evolution**: a dataset whose identity hash changes (upstream re-export) invalidates dependents (§6); a *new column* in the same declared schema is a contract event recorded in the dataset record; incompatible changes block runs that relied on the old contract until the user re-binds [CHOICE].
- **Caching / invalidation**: only derived artifacts (previews, validation summaries, materialized transform outputs) are cached, keyed by (input identity, transform hash, engine version); any key change = cache miss. Source data itself is never cached in place of the original [CHOICE].

## 6. Notebook execution model, statuses, invalidation

**FACT.** nbformat keeps displayed order (cell array), per-cell `execution_count` (null if never run), outputs inline including `error` outputs, and stable cell `id`s [S4]. nbclient supplies fresh-kernel programmatic execution with timeout, `allow_errors=False` default, partial-output save after a mid-run error, and cell/notebook hooks [S3].

**CHOICE — status model.** Each saved output is tagged with `{run_id, kernel_session_id, exec_count, input_fingerprint}` where `input_fingerprint` = own cell source hash + recursive upstream output hashes + referenced dataset identities + env pin. Statuses:
- **current** — same session, all upstream fingerprints match, cell hash matches (transitively; see W2).
- **stale** — produced before an edit to its own or any *transitive* upstream cell source, dataset, or environment binding.
- **failed** — the latest attempt in this session errored (an `error` output exists — the format already stores these [S4]).
- **unverified** — outputs from a previous session after kernel restart/interruption/cancel, or after journal repair; **a restart or interrupted execution can never silently re-label old outputs current** [CHOICE; consistent with the format's structural facts S4 and nbclient's fresh-kernel replay semantics S3].

**EXECUTED (candidate, W2)**: component model receipt `exec-2otpd3at` (exit 0): display order `[c0,c1,c2]`, actual execution order `[c2,c0,c1]`; editing c0 marks c0, c1 **and c2** stale (transitive); restart marks all previous-session outputs `unverified`; a failed c0 run leaves c1/c2 `unverified`. Two prior draft receipts (`exec-8__ndg7t`, `exec-tkegitnx`, exit 1) caught two real modeling bugs — staleness must be transitive through the *output* chain, not just direct source hashes — which is the property the shipped model must preserve [FACT — receipts]. Scope: candidate-authored simulation, not a live ipykernel.

- **Clean run** = fresh kernel via the nbclient-style executor; cancel = interrupt then `shutdown`; progress/errors stream through the `on_cell_*` hooks [S3][FACT → UI mapping INFERENCE].
- **Replay guarantee boundary.** The product guarantees: a clean replay runs the *exact saved cell sources, in displayed order, in a fresh kernel, against the pinned datasets and environment*, and records whether it completed; per-cell outputs are tagged with the run that produced them. **Outside the guarantee** (recorded as caveats in the manifest, some detected heuristically, none "fixed" silently): wall-clock time and randomness, network/external services, unpinned packages, undeclared file access, GUI/widget state (widgets render only from stored state; nbclient docs note "Trust Notebook" is involved [S3]), and engine-version drift (e.g., a data engine's type inference changing between releases — the duckdb#16476 class [S7–S9]). Declared-file access is enforced only inside the product's own launcher, and the honest statement is the brief's: **an import blacklist supplies no isolation** (§8).
- **Dataset-side invalidation**: content hash change ⇒ every output whose fingerprint includes that dataset becomes stale; env-side: lockfile hash change ⇒ all outputs of affected notebooks become stale (not unverified — they are still *comparable*, just against a different env) [CHOICE].

## 7. Large data, envelope, ordering, truncation

- **Envelope**: 8-core / 16 GB workstation. **Target (not a result): a 5 GB CSV/NDJSON/Parquet input processed through a bounded/streaming path** (projection, filter, per-group aggregate, row sample) [CHOICE]. DuckDB's file-direct design is the proposed engine [S6]; Polars streaming the alternative [S10; body uncaptured — lead L1].
- **Unsupported global operations** get an explicit different bound: full in-memory sort / global shuffle of a 5 GB input is **not** claimed to fit; such operations either spill to a declared temp dir with a visible "uses ~X× input size on disk" bound or are rejected up front [CHOICE; PROPOSED/UNEXECUTED P1].
- **Large-result truncation**: interactive outputs are truncated (row cap + byte cap per output) with an exact `truncated: {rows_shown, rows_total}` record; the *full* result is written to a dataset artifact with its own identity, and the visible output links to it. Truncation is therefore visible, not silent [CHOICE].
- **Caching/invalidation, schema evolution**: §5. **Ordering**: §5 row identity; any unordered engine path is labeled in results [CHOICE].

## 8. Execution boundary for untrusted notebook code

**FACT.** Jupyter's own docs describe kernel sockets as host-local unencrypted by default — reachable by any local process — with transport encryption only an option (default off) [S1]; nothing in the captured sources claims the notebook toolchain sandboxes user code [INFERENCE]. Our experiment's isolated executor demonstrates the pattern this proposal adopts: OS-level isolation (cgroup/systemd units with memory/wall/CPU limits, fresh network namespace, per-run writable dir), explicitly documented as "kernel isolation supplied by … not AST filters" (execution receipts in `witnesses.json`).

**CHOICE — boundary.** Notebook/kernel code runs in a child OS process per project: read access = project dir + explicitly bound dataset paths; write access = project `runs/`+`outputs/` only; network = disabled by default, per-project opt-in flag journaled in the manifest; resource caps (memory, CPU seconds, wall) enforced by cgroups/RLIMIT. Usability trade-offs, stated plainly: analysts will hit read-permission errors for sibling folders (mitigation: explicit "bind additional path" action, journaled); network-off breaks fetching notebooks (mitigation: declared-fetch allowlist with journaled URLs); resource caps can kill long legit runs (visible reason, easy cap raise). **An import blacklist (blocking `import socket` etc.) is explicitly NOT isolation** — module-level checks miss C-level sockets, subprocess, and file APIs, and this proposal never represents blacklist hits as a security boundary [CHOICE, consistent with brief; supported by S1's demonstration that the stock toolchain has no such boundary]. **Source browsing stays out of the execution sandbox**: the viewer renders notebook JSON and previews via its own process with read-only access, never by executing notebook code [CHOICE].

## 9. Python support boundary and optional SQL

- **FACT**: nbclient's docs state Python 3.6+ support in general terms ("supports python 3.6+ versions", dropping minor versions as sunset) [S2]; the captured docs build is version 0.11 [S2].
- **CHOICE — boundary**: Python-only interactive kernels (ipykernel), current CPython 3.x line (3.11–3.13) pinned per project via lockfile; no second language kernel is built or promised. **SQL is not a second kernel**: it is DuckDB over the same read-only files [S6][FACT], exposed as (a) a dataset-preview/query panel for the SQL colleague, (b) a *transform type* whose text, engine version, and result identity are journaled like any cell. A `.sql` transform failing under a newer DuckDB is an ordinary stale/failed event, handled by the same provenance rules. This keeps "occasionally runs SQL" supported without language-kernel proliferation [CHOICE].

## 10. Portability, workflow, UX

- **Exchange**: the folder *is* the bundle; export = zip + `manifest.json`; reopen on another machine re-verifies dataset hashes (or prompts for re-binding if data was excluded) and rebuilds the env from the lockfile; platform-specific env reconstruction (native wheels) is a known limit, recorded rather than hidden [CHOICE; PROPOSED/UNEXECUTED P2].
- **Minimum workflow mapping**: create project (init record) → import/identify data (hash + contract validation, no copy; DuckDB file-direct [S6]) → author notebook/transform (nbformat [S4]) → bounded preview (labeled sample; §5) → interactive runs (ipykernel; statuses update) → clean replay (fresh-kernel executor [S3]) → compare provenance (manifest diff view) → save (atomic + journal) → reopen elsewhere (hash re-verify) → export results + manifest (small JSON: inputs, env pin, run events, output identities).
- **UX obligations**: a *provenance panel* per output (run id, session, input fingerprints, env pin, dataset hashes); *accessible errors* (error outputs are first-class [S4]; failing cell + stack trace preserved by the replay executor [S3]); *saved-vs-current diff* (re-execute on request, then a structural diff of output mime-bundles; images compared by hash, tables by row-level digest with a bounded sample diff on mismatch) [CHOICE/INFERENCE].
- **Rejected / deferred** (kept visible, not obligations): hosted multi-user service (out: local-first + credentials out of scope), automatic scheduling (out: replay-on-demand suffices), real-time co-editing (opportunity — CRDT-based Jupyter collaboration exists upstream; lead L6), broad language kernels (out; SQL covered via DuckDB), using a hosted registry for env pins (out; lockfile + hash in manifest).

## 11. Opportunities and alternatives

- **Opportunity (recommended follow-up)**: adopt the upstream **streaming-query observability pattern** for the data layer — Polars' docs structure ("Inspecting a streaming query", "Monitoring a streaming query") [S10] mirrors what our run journal should expose for data ops (plan, progress, memory); combining DuckDB query progress with the nbclient hook stream [S3] gives one progress model for both kernel and data engines [INFERENCE].
- **Plausible alternative architecture**: make **Polars lazy/streaming the primary transform engine** and DuckDB only the SQL panel. Pros: single Python-native dependency, expression-level schema tracking. Cons: the SQL colleague's path becomes second-class and two engines' type-inference drift must be reconciled; DuckDB's file-direct SQL with explicit `columns` mapping [S6] is the tighter fit for mixed SQL/Python teams. Kept as a bounded fallback if DuckDB integration proves heavy (lead L1/L2).

## 12. Executed checks (candidate) and proposed validation

**EXECUTED (candidate)** — see `witnesses.json` for code hashes, stdout/stderr, exit codes, scope limits:
- **W1** (`exec-bf1b51q9`, exit 0): stdlib CSV silently defaults malformed rows into plausible data (missing→`None`, extras under `None` key), naive coercion crashes on heterogeneous values, and `json.dumps` emits non-strict `NaN` — motivating the explicit contract + quarantine rules (§5).
- **W2** (`exec-2otpd3at`, exit 0): status model with **transitive** invalidation, restart⇒`unverified`, failure⇒`failed`; two failed drafts (exit 1) document the transitivity requirement.
- **W3** (`exec-07xau1rf`, exit 0): bounded chunked aggregation over a 100k-row synthetic CSV (~1.6 MB in-memory source) with a hard 10k-row chunk bound; exact totals verified. **Scope limit**: miniature scale; says nothing about 5 GB throughput or any real engine.

**PROPOSED / UNEXECUTED**:
- **P1** — 5 GB streaming benchmark on 8-core/16 GB: projection+filter+group-by through the selected engine; record peak RSS, wall time, and spilled bytes; also the explicit-bound rejection test for a global sort. (This stage had no 5 GB corpus and claims no performance numbers.)
- **P2** — two-machine reopen: export bundle, reopen with hash re-verification and env rebuild; assert manifest verification passes and outputs are `unverified` until re-run.
- **P3** — replay equivalence: same notebook, pinned env, fresh kernel twice → identical tabular output digests (deterministic cells only).
- **P4** — crash recovery: kill -9 during save; reopen; assert journal repair marks affected outputs `unverified`, no partial records presented as current.
- **P5** — live regression for the §3 bug class in our stack: file with escape evidence only at line ≥100k; assert our validation pass (not the sniffer sample) catches the true dialect, and that a preview-based schema is marked non-probative.

## 13. Critical dependencies and uncertainties

| Dependency | Status | Fallback |
|---|---|---|
| DuckDB file-direct CSV/JSON/Parquet read, explicit schema pinning | Captured docs current build (v1.5) [S6]; engine behavior otherwise source-limited (§3) | Polars lazy engine [S10] |
| nbclient fresh-kernel replay semantics (`allow_errors=False`, hooks) | Captured docs (v0.11 build) [S3] | Own minimal ZMQ client (higher cost) |
| nbformat 4.5 cell-id/output model | Captured pinned schema v5.11.1 [S4] | Sidecar provenance keyed by cell index (weaker) |
| Fix 7d9d4fc / #16584 first *stable release* | Uncertain (merged to main 2025-03-12; release-notes check not captured) — lead L3 | Pin ≥1.3-line engine and re-run P5 |
| Polars streaming memory bounds | Page body not captured [S10] — lead L1 | DuckDB path only |
| cgroup/RLIMIT enforcement in product | Demonstrated pattern only in this experiment's sandbox receipts [W1–W3 limits] | Documented "no isolation, trust boundary = user account" mode |

Unresolved/optional leads are in `out/research/leads.json` (L1 Polars streaming body + 5 GB claim; L2 DuckDB "Reading Faulty CSV Files" options (`store_rejects`) for quarantine design; L3 release-notes check for #16584; L4 current canonical Jupyter trust-model page (old `security.html` 404s — captured [S11]); L5 restart/clear-output UX upstream; L6 CRDT collaboration; L7 DuckDB order-preservation/concurrency docs for ordering claims; L8 jupyter_client provisioning page for kernel resource limits).
