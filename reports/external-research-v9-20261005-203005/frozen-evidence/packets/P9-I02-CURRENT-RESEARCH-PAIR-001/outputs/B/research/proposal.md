# Research proposal — a local-first notebook + versioned-data workspace ("workbench")

Stage: I-02-FRESH-DELIVERY-R001 (research role). Date of capture: 2026-10-06.
Companion catalogs: `out/research/sources.json` (S-ids), `out/research/witnesses.json` (W/P-ids), `out/research/leads.json` (L/O-ids).

**Labeling convention used throughout**

- **[FACT]** — external fact from a captured public primary source, cited as (S#).
- **[INFER]** — engineering inference from facts; stated reasoning, not source text.
- **[CHOICE]** — product decision this proposal makes; a defensible option, not the only one.
- **[EXEC-W#]** — executed by the candidate in the admitted isolated sandbox; scoped per witness.
- **[PROPOSED]** — UNEXECUTED validation (P# in witnesses.json).

---

## 1. Summary

The team's actual pain is not "we lack a notebook" — it is that **nothing distinguishes what a notebook displayed from what it executed, what state it used, and which outputs are still true**. The research found that the standard notebook format already carries the raw material for this distinction (stable cell ids, prompt-number execution order, typed outputs — S5), that a maintained library already exists for deterministic whole-notebook replay separate from any UI (nbclient — S6), that data engines expose exactly the controls needed to make "preview is not proof" an enforceable contract (sampled sniffer, reject tables, explicit schema override, insertion-order guarantee — S9, S1), and that content-addressed pointer files solve share-without-copy data identity (DVC — S8). It also found a **live engine defect that is a direct instance of the brief's core warning**: values past a sniffer's sample are silently rewritten (duckdb#25824 — S1), plus a **closed issue→fix→regression-test chain** proving the value of explicit contracts over sniffed ones (duckdb#15777 → PR #15808 → `test_auto_date.test` — S1–S4).

**Architecture in one paragraph [CHOICE]**: a plain folder ("project record") holding nbformat-4.5-compatible notebook documents; **data references** (pointers + content identity, never copies); an **append-only execution-event journal** (JSONL, fsynced); **content-addressed saved outputs**; a **pinned environment binding**; and a derived **status view** computed by comparing current hashes against recorded events (statuses: current / stale / failed / unverified). Interactive work runs in a real kernel; **clean replay** runs the same documents through a fresh kernel via an nbclient-like executor with the untrusted-code boundary of an OS process sandbox. Tabular work goes through an embedded columnar engine (DuckDB 1.5 line) whose streaming readers and explicit knobs carry the large-data path; SQL is an optional convenience transform recorded as an ordinary event, not a second runtime the team must maintain.

---

## 2. Precedents investigated (mechanisms and independence)

Three independently useful precedents were investigated. Independence = each contributed its mechanism without depending on the others; all three are optional at the interface level.

### 2.1 Jupyter execution stack (nbformat schema + nbclient) — mechanism: the document/execution split

- **[FACT]** The nbformat v4.5 JSON schema requires every cell to carry an `id` (string, `^[a-zA-Z0-9-_]+$`, 1–64 chars); code cells require `outputs` and `execution_count` ("The code cell's prompt number. Will be null if the cell has not been run"); outputs are typed (`execute_result`, `display_data`, `stream`, `error`); notebook metadata carries `kernelspec` and `language_info` (S5).
- **[INFER]** This gives us, for free: stable cell identity that survives reordering (displayed order = array position; actual execution order = recorded `execution_count` prompt numbers, which may be non-contiguous), a typed output model, and an interchange format other tools can read.
- **[FACT]** nbclient is "a client library for programmatic notebook execution", extracted from nbconvert's `ExecutePreprocessor`; `jupyter_client` is a separate layer providing the kernel-protocol API ("starting, managing and communicating with Jupyter kernels"); nbclient currently supports Python 3.10+ (S6).
- **[INFER]** Whole-notebook clean replay is therefore a solved, maintainable mechanism — the product work is wiring it to the event journal and status reducer, not building an executor.
- **[FACT/LIMIT]** Jupyter's own security model states: "Since access to the Jupyter Server means access to running arbitrary code, it is important to restrict access to the server" (S7). The captured page governs server authentication; it does not provide kernel sandboxing.
- **[INFER]** Adopting the document format settles *representation only*. Runtime behavior (state, ordering, staleness, isolation) is *not* settled by the format — that is exactly the gap this proposal fills, and why nbclient/replay and the status reducer are separate components.

### 2.2 DuckDB (embedded columnar engine) — mechanism: contract knobs on a streaming reader

- **[FACT]** The CSV reader's `sample_size` (default **20,480 lines**) bounds auto-detection; `store_rejects` "Skip any lines with errors and store them in the rejects table" (with `rejects_scan`/`rejects_table`/`rejects_limit`); `all_varchar` skips type detection; explicit `columns`/`types` "disables auto detection of the schema"; `union_by_name` aligns columns from multiple files by name; `ignore_errors` default false; `strict_mode` default true (S9).
- **[FACT]** "Order Preservation: The CSV reader respects the `preserve_insertion_order` configuration option... When `true` (the default), the order of the rows in the result set returned by the CSV reader is the same as the order of the corresponding lines read from the file(s). When `false`, there is no guarantee" (S9). This is the engine-level distinction between **stable ordering** (source order preserved) and **no guarantee**; *deterministic* ordering additionally requires the query to impose a total order — [INFER] the workspace must never equate the two.
- **[FACT]** DuckDB 0.9.0 announced "Out-of-Core Hash Aggregate Storage Improvements" (S11) — beyond-RAM aggregation is an explicit engine design goal. **[LIMIT]** performance on the 16 GB/5 GB envelope is unverified (L4); current-version memory_limit/temp_directory semantics were not captured.
- **[FACT]** Current docs version line is 1.5 ("current"), 1.4 is LTS, 2.0-dev is preview; latest observed release v1.5.6 (2026-09-28) (S10, S12).
- **[FACT/DEFECT]** duckdb#25824 (open, 2026-09-17): the sniffer fixes a column's type from the first `sample_size` rows; a value further down that the sniffer would reject is **silently converted by the scanner** when it can be parsed non-strictly — `1.5` read back as `2`, `007` → `7`, `1_000` → `1000`, a full timestamp truncated to DATE; the sniffer and scanner "use different strictness for the same cast"; `store_rejects=true` records zero rejects because no error is raised; `sample_size=-1` and `all_varchar=true` recover correct behavior; reported across 1.1.3 → main@2bbfe6f236 (S1).

### 2.3 DVC — mechanism: content-addressed pointer files for data identity

- **[FACT]** `dvc add` tracks data with `.dvc` files as "lightweight pointers"; a `.dvc` file records an `md5` that corresponds to the content's path in a cache store; directories become one pointer to a `.dir` JSON manifest; reflinks avoid copying file contents; large datasets can be operated on partially; `--to-remote`/`dvc pull` transfer without local staging (S8).
- **[INFER]** This is the shape for "import without copying unnecessarily": the project stores a *reference record* (path, size, content identity, import options, declared schema) and optionally a cache- deduplicated copy only when exchange/staging requires it. Exchange via ordinary folders stays primary; the `.dir`-style manifest makes a zip bundle trivial.

**What the planner gains beyond the brief**: (a) the specific **strict/non-strict cast asymmetry** inside one reader (S1) — a mechanism-level reason preview sampling can lie silently, not just "sampling is approximate"; (b) engine-level **reject tables** as prior art for no-silent-delete; (c) **prompt numbers ≠ display order** encoded in the standard format itself (S5); (d) **reflink no-copy** (S8).

---

## 3. The issue → fix → regression-test chain (followed end-to-end)

**duckdb#15777** (opened 2025-01-17 on DuckDB 1.1.3; labeled "reproduced"; closed 2025-02-06): `COPY ... WITH (dateformat 'AUTO')` fails with conversion errors on files that load fine when the format is *auto-detected*; the reporter's follow-up comment (S2) showed a second, different failure (auto-detected `%d.%m.%y` on a `%Y-%m-%d` file) — the explicit "AUTO" string was being treated as a literal format spec, contradicting the sniffer.

**Fix**: PR #15808 "Accept 'Auto' as date/timestamp format" by a DuckDB member, merged **2025-02-06T07:21:58Z** (S3). The captured diff (merge commit `1c9dcb64a9022c4a0dff1dbea9a8e313876cb91b`, S4) changes `src/execution/operator/csv_scanner/util/csv_reader_options.cpp`: `SetDateFormat` now lowercases the argument and skips strict format parsing when it equals `"auto"`, so an explicitly requested AUTO defers to detection instead of overriding it.

**Regression test**: the same PR adds `test/sql/copy/csv/test_auto_date.test` (108 lines) covering both previously-failing explicit-`AUTO` statements **and** the reporter's second reproduction (the 25-row `device_metadata_1.csv` from S2), with fixtures added under `data/csv/auto_date/` (S4). Report → fix → test are the same bytes chain.

**Version/branch applicability and evidence limits**: merged into main on 2025-02-06; the reporter's failing version was 1.1.3 (S1 items[1]); docs "current" is the 1.5 line (S10). **The exact first release containing the fix was not verified** — merged_at is repository metadata, not a release statement (L1). PR-merge plus in-repo regression test also does not prove the fix persisted into later branches; verification would require tag containment (`git tag --contains 1c9dcb64`), which was not run.

**Complementary live defect**: #25824 (open — S1) is the *converse* lesson: the fix chain shows explicit contracts beating implicit inference, while #25824 shows that trusting inference past its sample silently corrupts values. Both motivate Section 4.

---

## 4. Data contract (imports, identity, schema, errors)

**[CHOICE]** Every dataset used by a project is registered as a **data reference** with: stable ref id; source path/URI; byte size; **content identity**; format + import options; **declared schema**; and an **inference provenance field** recording whether the schema was user-declared, sniffer-proposed-then-confirmed, or confirmed by full scan.

- **Content identity without copying [CHOICE]**: files ≤ 256 MB get a full SHA-256; larger files get an *approximate* identity = size + SHA-256 of head/tail windows + sparse interior windows, explicitly labeled approximate, with exact hashing available as an explicit background operation. **[INFER]** This follows DVC's pointer pattern (S8) while acknowledging that exact hashing of 5 GB is not free; a bundle export computes exact hashes before sealing. Originals are opened read-only; DVC-style reflink/copy occurs only into the exchange cache, never onto the original (S8).
- **Preview sampling is not evidence [CHOICE, reinforced by FACT]**: previews display "first N rows (or a seeded stride)" and every preview/summary carries a machine-readable `coverage: sample` flag. The UI is forbidden from stating full-dataset properties (row counts, type universality, null-freeness) from a sample; such statements require the full-scan path. **[FACT]** This is not paranoia: at defaults the DuckDB reader itself infers types from 20,480 sample lines and can silently rewrite later values (S1), and W2 demonstrated the mechanism at toy scale **[EXEC-W2]**.
- **Schema assumptions & type conversions**: the contract distinguishes the *reader's* working schema from the *declared* schema. A read is contract-clean only if (a) the declared schema is explicit, or (b) inference ran with `sample_size=-1` (full scan) and the user confirmed. Any value that fails conversion goes to the **rejects ledger** (line number, byte offset, reason, ref version) — never silently dropped, originals never mutated. **[FACT]** the engine offers exactly this shape (`store_rejects` + rejects tables; `columns` overrides sniffing — S9); **[CHOICE]** the workspace keeps its own ledger so the guarantee does not depend on engine details (L5).
- **Row / order identity**: every imported row is identified by `(file line/row number, byte offset)` — cheap, stable for immutable sources — recorded for rejects and for any exported result row trace. **Ordering semantics [CHOICE]**: "stable" = preserves source insertion order (the engine guarantees this under `preserve_insertion_order=true`, S9); "deterministic" = same input bytes ⇒ same output order, which requires the operation to impose a total order or an explicit tie-break key. Saved results record which semantics they used; comparisons between two runs require matching ordering semantics.
- **Schema evolution**: re-import that observes a changed header/columns creates a **new ref version** (old version's identity preserved for old events); a diff (added/removed/retyped columns) is shown at import. `union_by_name`-style alignment is offered for multi-file sources (S9). Downstream invalidation follows Section 5. Type *widening* (int→bigint/double) is auto-accepted; narrowing or semantic changes require contract re-confirmation. Nulls, empty strings, Unicode strings, timestamps: the declared schema names exact types and the null-string convention; nothing is coerced implicitly at the contract boundary.

---

## 5. Execution semantics: display order, execution order, kernel state, provenance

Four distinct things, four distinct stores **[CHOICE]**:

1. **Displayed cell order** = the notebook document's cell array (nbformat, stable `id` per cell — S5).
2. **Actual execution order** = the per-cell `execution_count` prompt numbers in the document **plus** the authoritative append-only event journal; a cell edited after execution is detected because the event stored the cell *source hash* at execution time.
3. **Current kernel state** = live and ephemeral; tagged with a monotonically increasing **kernel epoch**. Any restart/reconnect/interrupt bumps the epoch.
4. **Provenance of saved outputs** = each saved output is content-addressed and referenced by an event that records: notebook revision, cell id, cell source hash, kernel epoch, environment hash, data-ref versions read, start/end, status (ok/error/cancelled), output hashes, truncation metadata.

**Output statuses** — computed by a pure reducer over (current document, current ref versions, current env hash, current epoch) vs the latest event per cell; precedence **failed > unverified > stale > current**:

- `current`: source hash matches; all upstream cells' source hashes match; recorded data-ref versions match current; env hash matches; kernel epoch matches the live epoch.
- `stale`: any of the above hash/version comparisons fail **except** epoch/env (downstream propagation: an edit to cell k makes every later cell's saved output stale — W1 **[EXEC-W1]**).
- `failed`: the latest event for the cell is an error/cancel — an error output is *preserved and labeled*, never silently cleared.
- `unverified`: epoch or env hash changed (kernel restart, dependency change). **[CHOICE]** This is the brief's "restart must not silently label old outputs current": a restart downgrades, it never upgrades (W1 case 2 **[EXEC-W1]**). Interactive execution after a restart writes *new* events; the reducer never promotes old events.

**Invalidation effects [CHOICE]**: edit upstream cell ⇒ that cell + all later cells stale. Source dataset content change ⇒ every event referencing that ref version stale (approximate-identity mismatch triggers a re-verify prompt, not silent staleness). Environment dependency change ⇒ all outputs of affected notebooks unverified. Data contract re-confirmation ⇒ treated as a new ref version.

**[FACT]** The document format supports this without extension: per-cell `id` for identity, `execution_count` for prompt order, typed outputs including `error` (S5). **[INFER]** What the format lacks — data versions, env hash, epochs, output-addressable storage — lives in the sidecar journal, keyed by cell id, which is why the standard format alone does not solve runtime behavior.

---

## 6. Clean replay: guarantee boundary

**[CHOICE]** "Clean replay" = fresh kernel process, fresh epoch, executing cells in displayed order from a pristine state (an nbclient-style programmatic execution — S6), with per-cell timeout and stop-on-first-error (cancel = kill process group; partial events recorded and marked cancelled), writing new events and outputs. The user can cancel, and sees per-cell progress/errors from the journal stream.

**The product guarantees after a replay marked `verified`**: the outputs were produced by *these cell sources*, in *this order*, reading *these data-ref versions* (exact content identity for ≤256 MB refs), in *this recorded environment* (interpreter version + hash-pinned dependencies + OS family/arch), under *this engine version*. Re-running on the same machine with the same inputs is byte-comparable via the status reducer.

**Outside the guarantee [CHOICE, honest boundary]**: wall-clock time and hardware variance; nondeterministic algorithms (unseeded randomness, hash randomization, parallel reduction order, GPU/BLAS); anything fetched from the network or read from undeclared filesystem paths (replay records *undeclared access* when the sandbox observes it, but cannot retroactively make it reproducible); floating-point differences across BLAS builds; semantic changes in unpinned packages (unpinned ⇒ replay is labeled `unverified: env drift` by construction). **[INFER]** Declaring this boundary in the manifest is what makes the `current/stale/failed/unverified` labels meaningful rather than aspirational.

---

## 7. Execution boundary for untrusted notebook code

**[FACT]** "Since access to the Jupyter Server means access to running arbitrary code, it is important to restrict access to the server" (S7) — the ecosystem's own model is that notebook code is arbitrary code. **[CHOICE]** Therefore the boundary is an **OS process boundary**, not an in-process filter: notebook code always runs in a separate kernel process; restricted mode launches it with (a) filesystem policy — project dir read/write, registered data refs read-only, temp dir read/write, everything else denied; (b) network — denied by default, per-project opt-in; (c) resource limits — memory/CPU/file-size/process caps; (d) an access observer that logs undeclared file/network attempts into the event stream. Usability trade-off, stated plainly: default-permissive mode (single user, trusted folder) is the zero-friction path and provides **no** containment; restricted mode can break packages that write caches outside the policy or need network, and users will be tempted to widen it — the UI must show which mode ran, because a `verified` replay label means nothing if the sandbox was disabled. **[CHOICE/REJECTED]** An import blacklist (blocking `socket`, `os` etc. inside Python) is explicitly rejected as isolation — it is bypassable and is not what the sandbox receipts mean. **[FACT]** Isolation in this research stage's own checks was supplied by the sandbox runtime, not by code filters — the same principle ([EXEC limitations note in witnesses.json: "kernel isolation supplied by Bubblewrap/systemd, not AST filters"]). **[CHOICE]** Source browsing (viewing notebooks, schemas, events) never requires executing anything; the viewer is a separate, non-executing component.

---

## 8. Large data path, caching, and operations (8 cores / 16 GB envelope)

- **5 GB target [CHOICE]**: default tabular ops (import/identify, bounded preview, filter/project, per-group aggregates, rejects-capturing scans) run on the engine's streaming/out-of-core readers with an explicit `memory_limit` and on-disk temp directory; a full-file ORDER BY or unbounded join is either spilled (if the engine supports it) or **refused with an explicit bound message** — the "explicit different bound" the brief asks for. **[FACT]** beyond-RAM aggregation is a stated engine design goal since 0.9.0 (S11); **[LIMIT]** this envelope performance is unverified — P1 is the proposed benchmark (L4). **[EXEC-W3]** demonstrates the contract shape (bounded chunks, rejects with byte offsets, nothing dropped) but not throughput.
- **Large-result truncation**: cell results above a cap (rows and bytes) are materialized to content-addressed Parquet/CSV in the project's output store; the cell shows a bounded preview + a pointer. Saved outputs record `truncated: true` + full-result hash, so "current" comparisons hash the pointer, not the preview.
- **Caching & invalidation**: the only caches are (a) content-addressed outputs, (b) optional materialized result files, (c) engine temp. All are keyed by the same hashes the reducer uses, so cache invalidation and status invalidation are one mechanism.
- **Concurrency / locking**: single-writer per project via a lock file (O_EXCL create + PID + heartbeat; stale-lock takeover after heartbeat expiry); concurrent read-only inspection is always safe (event log is append-only); two writers on one machine get an explicit "project open elsewhere" error, not merge chaos. **[INFER]** Real-time collaboration is out of scope (brief), so CRDT-class machinery is deliberately not taken on.
- **Interrupted-save recovery**: notebook saves are atomic (temp + fsync + rename); the event journal is append-only with fsync-per-record and a **write-ahead rule** — output bytes are fully written and fsynced *before* the event that references them is appended; on reopen, a torn trailing record is discarded to the last record boundary and flagged in the UI. Committed outputs can never dangle; interrupted runs leave `cancelled`/`unknown` events, never silent `current` labels (P4 proposed to test this).

---

## 9. Support boundary: Python and optional SQL

- **Python [CHOICE]**: support the interpreter window matching the replay library's stated support — nbclient documents "Python 3.10+" with drops as Python sunsets minors (S6); concretely: current stable CPython minors (3.10–3.13 at capture), pinned per project via a hash-pinned lock file; the env hash in the manifest = lock file hash + interpreter version. This is a *defensible* boundary because it is inherited from a maintained precedent, not invented.
- **SQL [CHOICE]**: optional, embedded, single-engine (DuckDB, 1.5 line current / 1.4 LTS — S10). SQL cells are **not** a second kernel: a SQL cell is a transform whose query text, engine version, and input ref versions are recorded as an ordinary execution event; results become ordinary outputs. The team therefore gets the SQL colleague's workflow against the same project record without building/maintaining any additional language kernel — the brief's explicit constraint. **[LIMIT]** engine defects are inherited (Section 3); the data contract's explicit-schema rule exists precisely because of them (S1, L2).
- **Rejected as requirements**: broad language kernels (R/Julia), real-time collaboration, hosted service, automatic scheduling (brief marks these optional; the event journal keeps them possible later — O5).

---

## 10. Minimum workflow mapping (brief ¶9 → mechanism)

1. **Create project** — folder + `workspace.json` (schema version, env ref, ref registry index, lock file).
2. **Import & identify data without unnecessary copying** — data ref pointer + identity (S8 pattern); approximate identity for big files; original untouched.
3. **Author notebook/transform** — nbformat 4.5 documents (stable cell ids — S5); SQL transform cells optional (§9).
4. **Preview bounded sample** — capped rows/bytes, `coverage: sample` labeling; full-scan confirmation path for schema (S9 knobs; W2 **[EXEC-W2]** motivates).
5. **Run selected work interactively** — live kernel, events appended per cell, epoch tagged.
6. **Request clean replay** — fresh-kernel programmatic execution (S6 pattern), timeout/stop-on-error, cancelable, per-cell progress from the journal (§6).
7. **Compare provenance** — event graph diff view: two runs side-by-side by cell id (source hash, data versions, env, output hashes).
8. **Save** — atomic writes; write-ahead outputs-then-event (§8).
9. **Reopen on another machine** — same folder or zip bundle; missing data refs shown as unresolved pointers (data is not silently re-fetched); status reducer marks env-mismatched outputs unverified.
10. **Inspect & export results + reproducibility manifest** — manifest = project/lock hashes, ref identities + schemas + import options, event log digest, output hashes, engine/library versions, sandbox mode used. Small by construction (pointers, not data).

**UX obligations**: dependency/provenance view (per output: "produced by event e123 from sources a,b,c — all hashes matching"); error/status feedback (failed cells keep their typed error outputs — S5's `error` output type — with reducer status); saved-vs-current result diff (hash first, content diff on demand for small results).

---

## 11. Opportunities and alternatives

- **Opportunity O1** (kept, optional): SQL-over-embedded-engine transform cells (§9) — directly serves the SQL colleague with zero extra kernels.
- **Opportunity O2** (kept, optional): portable sealed bundles via `.dir`-style cache manifests (S8) for "reopen on another machine" without a server.
- **Plausible alternative architecture** (bounded, not chosen): *pandas/pyarrow-centric* — chunked CSV readers, Parquet intermediates, no SQL engine; replay via nbclient; statuses via the same reducer. Pros: fewer moving parts, pure-Python pin; Cons: user-implemented streaming, weaker global-op story, and the SQL colleague loses their path. Kept as fallback if P1 shows the engine's envelope behavior is inadequate (L4).
- **Rejected**: import blacklist as isolation (§7); building per-language kernels; treating a sniffer-inferred schema as a contract (S1, S9); representing preview-derived claims as dataset facts (W2).

---

## 12. Validation

**Executed by candidate** (isolated, stdlib-only, tiny synthetic data; full receipts in witnesses.json):

- **[EXEC-W1]** Status reducer: editing an upstream cell marks the whole downstream chain stale; a kernel-epoch bump downgrades every label to unverified, never current. exit 0.
- **[EXEC-W2]** 10-row preview infers INTEGER where the full file is VARCHAR; casting under the preview's assumption silently rewrote `1.5`→`1` (truncating emulation; DuckDB reportedly rounds — the invariant is *silent rewrite*). exit 0 after one honestly-recorded failed run whose wrong expectation (rounding vs truncation) is preserved in witnesses.json. Scope: mechanism emulation mirroring S1; not an engine result.
- **[EXEC-W3]** Bounded 64 KiB-chunk scan of a 5.4 MB synthetic CSV: ≤65,579 bytes resident per step; the one malformed record kept in a rejects ledger with line number + byte offset; nothing silently dropped. exit 0. Scope: contract shape, not throughput.
- **Limits of all three**: isolated component checks; they do not establish full application behavior, engine behavior, or large-data performance.

**Proposed / UNEXECUTED**: P1 5 GB streaming + spill envelope benchmark on DuckDB 1.5.x; P2 pinned-env replay determinism with nbclient; P3 reproduction of duckdb#25824 against 1.5.x plus the contract-path counterexample; P4 crash-recovery of the journal under randomized SIGKILL. All four are scoped and justified in witnesses.json.

---

## 13. Uncertainties carried forward (see leads.json)

L1 first-release attribution of the #15777 fix (unverified; bounded by "present in current 1.5 line, absent in 1.1.3"). L2 duckdb#25824 open — the design does not depend on its fix, but its existence shapes the mandatory explicit-schema rule. L3 nbclient parameter-level semantics uncaptured (README-level only). L4 beyond-RAM envelope performance unverified (S11 is a feature announcement, not a benchmark). L5 rejects-table details uncaptured; workspace keeps its own ledger. L8 nbformat library-version↔schema-4.5 mapping unverified; pin by schema, validate on read. One fetch failed at the network layer (dvc.org) and was replaced by the docs repo source (S8); four documentation paths 404'd and were replaced (sources.json `failed_fetches`).

*Source separation note: every [FACT] above traces to a captured public response in sources.json; no campaign, evaluator, or other-arm material was retrieved or used, and no capture contained any.*
