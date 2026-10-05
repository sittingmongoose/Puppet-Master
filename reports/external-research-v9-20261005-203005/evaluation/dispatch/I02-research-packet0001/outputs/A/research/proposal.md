# Proposal — LabBook: a local-first notebook + versioned-data workspace

Stage: research/proposal (frozen under `out/research/`). Companion catalogs: `sources.json`, `witnesses.json`, `leads.json`.

Label key used throughout:

- **[F]** source fact — traceable to a pinned public capture in `sources.json` (`[S#]`).
- **[I]** engineering inference — my reasoning from facts; not itself sourced.
- **[C]** product choice — a decision this proposal makes; bounded alternatives are given.
- **[W]** executed by candidate — ran in the experiment's admitted isolated sandbox (`witnesses.json`); component-level evidence only, never proof of full-product behavior.
- **[V]** proposed validation — **UNEXECUTED**; what a real implementation team should run.

Everything here was authored by the candidate model from the brief plus independently discovered public sources. No evaluator material was consulted.

---

## 1. Problem restatement and thesis

Three analysts run Python notebooks; one collaborator occasionally runs SQL over tabular data. Today they cannot answer: *why does the shared notebook produce a different result on my machine, what data and environment did it use, and which outputs went stale after my edit?*

Thesis **[C]**: the four questions are answered by four cheap, composable mechanisms — none of which require building a notebook product from scratch:

1. **Content identity for data** (hash-based dataset identity, never mtime alone), so "the same dataset" is checkable.
2. **An execution event log** (append-only), so every saved output points at the run that produced it.
3. **A static dependency graph over cells** (marimo-style), so edits and data changes have a defined, explainable invalidation effect.
4. **A single embedded data engine for tabular work** (DuckDB-informed) so preview, transform, and the SQL colleague all run the same code path on files that may exceed RAM.

The design deliberately adopts the Jupyter **document format** without adopting the Jupyter **runtime semantics**, and adopts **reactive staleness semantics** without adopting marimo's storage format. This split is the central architectural move **[C]**.

## 2. Implementation precedents investigated and their independence

### 2.1 Precedent A — nbformat (Jupyter) document schema [F]

The pinned schema (`nbformat.v4.5.schema.json`, current default: the repo's `nbformat.v4.schema.json` is byte-identical to the 4.5 schema — same git blob `670bbd35`) gives us, at document level: cells carry a required `id` (`^[a-zA-Z0-9-_]+$`, 1–64 chars — schema ≥ 4.5), `execution_count` ("Will be null if the cell has not been run"), an `outputs` array restricted to exactly four output types (`execute_result`, `display_data`, `stream`, `error`), and root `metadata.kernelspec` requiring `name` + `display_name` [S4]. The schema stores **display order** (array position) and the kernel's **execution counter**, but nothing about kernel state or freshness — it is an interchange format, not a semantics.

**Mechanism contributed:** a portable, tool-agnostic document + the fact that "execution order" and "display order" are already distinct fields in the wild.
**Independence:** the format imposes no runtime; any engine can read/write it.

### 2.2 Precedent B — marimo reactive runtime [F]

marimo statically analyzes each cell for references/definitions, forms a DAG, runs descendants (or **marks them stale** in lazy mode), enforces unique global names, executes in dependency order rather than page order, does **not** track mutations, and deletes a cell's variables on cell deletion ("no hidden state") [S5, S6]. Interrupting a cell cancels queued dependents [S6].

**Mechanism contributed:** compute freshness from a static graph instead of trusting kernel state; stale-marking as a first-class UI state; deterministic replay order derived from the graph.
**Independence:** marimo stores notebooks as pure `.py`, not `.ipynb` — the reactivity mechanism does not depend on the Jupyter document format; the two adopt cleanly apart [S5].
**Pitfalls discovered in the wild (runtime side):** issue #9881 (open as of capture): after reconnect, `marimo edit` replays a stale session's cached error output **indistinguishably from a live one** — a real instance of the brief's "saved output is not automatically reproducible" failure class [S21]. Issue #3140 (open): cells get marked stale on comment/whitespace-only edits — content-hash invalidation granularity is a real UX trade-off [S21]. PR #10912 (merged 2026-10-02): a reload race where late stale-marking flags cells that already re-ran; fixed with per-cell **generation counters** [S21]. PR #10915 (closed 2026-10-05, **not merged** as of capture) attempted to fix cross-app state staleness (#10602) — outcome unresolved [S21, L10].

### 2.3 Precedent C — DuckDB as the tabular engine [F]

DuckDB is an in-process analytical SQL database; single process read-write, multiple processes only `READ_ONLY`, file locks used for concurrent access (with a caution about shared/network directories) [S3]. Its CSV reader has a defined error taxonomy (CAST, MISSING COLUMNS, TOO MANY COLUMNS, UNQUOTED VALUE, LINE SIZE OVER MAXIMUM, INVALID ENCODING), stops-and-throws by default, offers `ignore_errors` (silent skip) and `store_rejects` (faulty lines preserved in `reject_scans`/`reject_errors` tables with line numbers, byte offsets, original line) [S2]. The v1.1.0 tag source shows an evicting buffer pool under a settable memory limit [S13]. `null_padding` (pad short rows with NULLs) was added to mimic pandas' permissiveness [S1].

**Mechanism contributed:** bounded/streaming columnar execution over external files (no import/copy step), with error handling that can preserve instead of silently dropping malformed records; SQL for the collaborator from the same engine.
**Independence:** DuckDB knows nothing about notebooks; it can be driven by a GUI preview path, a Python kernel, or a raw SQL console.

### 2.4 Precedent D — papermill clean-execution pattern [F]

papermill parameterizes and executes notebooks headlessly, writing to a **separate output notebook** (input not overwritten), with an `injected-parameters` cell protocol; supported Python versions track python.org sunsets (currently 3.10+) [S14].

**Mechanism contributed:** clean replay as a separate artifact with recorded parameters — the input document the analyst edits is never mutated by a replay.
**Independence:** pure library over nbformat documents.

### 2.5 Why these four and not others

They are mutually independent (each works without the others), and each contributes one required capability: document portability (nbformat), freshness semantics (marimo), bounded tabular execution (DuckDB), replay-as-artifact (papermill). Alternatives considered are in §14.

## 3. Consequential issue → fix → regression-test chain (followed end to end)

**DuckDB #12596 — "CSV reader: combination of null_padding = true and parallel = false introduces extra row"** [F]

- **Failure:** a 2-column CSV whose rows end with a trailing delimiter, read with explicit 3-column schema + `null_padding=true`, returns an **extra all-NULL row** when `parallel=false`, but not in the default parallel path. Labeled `reproduced`; reported against 1.0.0 and nightly (2024-06-19) [S1 issue body, S9 timeline].
- **Fix:** PR #12679 "[CSV] [Bug-Fix] Fix for issue related with single-threaded execution and null padding", merged 2024-06-24T17:12:33Z into `main`, merge commit `2532c30fa649ac6296c7ab2b55976b4337ff46ce` [S9, S10]. The diff is a one-line guard in `src/execution/operator/csv_scanner/scanner/string_value_scanner.cpp`: null-padding validity masking now also requires `result.chunk_col_id > 0` (don't pad when no columns were actually consumed) [S11].
- **Regression test:** `test/sql/copy/csv/test_12596.test` + fixture `data/csv/bug_12596.csv`, added in the same PR; the test asserts both parallel and `parallel = false` paths return exactly rows `(1,2,NULL),(3,4,NULL)` [S11].
- **Version applicability:** tag `v1.0.0` → commit dated 2024-05-29 (before the fix; bug confirmed by the issue's reproduction); tag `v1.1.0` → commit dated 2024-09-08 (after the merge), so the fix is in the v1.1.0 line [S12, S13]. Whether any 1.0.x bugfix release also carried it is **not established** [L1]. GitHub tag→commit dates are ordering evidence, not release notes; an issue title or merged patch alone would not establish shipped behavior, so I pinned tag commits.
- **Limits of the evidence:** all chain links are GitHub metadata + patch text captured via API; I did not execute DuckDB itself, so "the bug reproduces / the fix works" rests on the maintainer `reproduced` label plus the merged regression test, not on my own run.

**Why this chain matters to the design [I]:** the same input file produced different row counts depending on a **parallelism setting** the analyst never thinks about. Two consequences adopted below: (a) execution-configuration (threads, engine version) belongs in the environment binding; (b) row-count and shape are observable properties worth recording in the manifest so phantom rows are detectable by diff.

## 4. Project record **[C]**

A project is an ordinary folder (portable by copy or zip → `.lbundle`):

```
project/
  labbook.toml              # schema_version, project_id (uuid4), settings, env declaration
  notebooks/*.ipynb         # nbformat 4.5 documents [S4]; per-cell extension fields in metadata
  datasets.yml              # logical name -> {uri, format, declared_schema, identity, opened_utc}
  scripts/, sql/            # plain files; SQL files reference logical dataset names
  .labbook/
    events.jsonl            # append-only execution events (the only write during runs)
    outputs/                # large outputs spilled here, content-addressed
    cache/                  # content-addressed caches; temp file + atomic rename
    locks/project.lock      # single-writer lock (host, pid, boot_id, timestamp)
  manifest.repro.json       # generated on export (§12)
```

Facts recorded per piece of state: notebook documents are standard nbformat 4.5 (interop with Jupyter preserved); freshness lives in a **sidecar index**, not by forking the format: `.labbook/events.jsonl` + a small `index.json` mapping `(notebook, cell_id) -> {last_event_id, code_hash_at_run, status}`. Sidecar metadata is regenerable; if lost, all outputs degrade to `unverified` rather than lying **[I]**.

**Environment binding:** `labbook.toml` declares `requires-python` and dependencies using PEP 723-style metadata (standardized `# /// script` block fields: `dependencies`, `requires-python` [S17]); the resolved environment (interpreter version + locked package set) is recorded as an env-hash in every execution event. Adopting a metadata standard does **not** by itself settle runtime behavior — resolution and installation are the tool's job, and auto-install of declared deps is an acknowledged arbitrary-code risk in PEP 723's own security section [S17].

## 5. Data contract **[C]** (rules; mechanisms justified by §2.3, §3)

**D1 Identity, no copy, no mutation.** Import registers `{uri, format, sha256, bytes}`. Hashing a 5 GB file is a one-time streaming read (~seconds-class on disk); `size+mtime` is recorded as a cheap *change hint* but never as identity. Datasets open read-only; every transform writes a new artifact. Original bytes are never rewritten **[C]**.

**D2 Schema: declared beats inferred.** At import the user either declares a schema (names + types) or accepts an inferred one that is then **pinned** in `datasets.yml`. Auto-detection is sampling and may differ across runs/versions — DuckDB's own error output labels every inferred parameter "Auto-Detected" and suggests pinning types [S2], and its `null_padding` option exists specifically to mimic pandas' silent padding of short rows [S1]. A later engine changing its sniffer is a contract violation the identity/manifest diff can catch.

**D3 Type conversions.** Declared types are enforced with explicit, per-record errors (CAST class). The default is **stop and report** (line number, original line, column, message) — DuckDB's documented default behavior [S2]. Permissiveness (`null_padding`, coercion to null) is opt-in per dataset, recorded in the manifest, and never default **[C]**.

**D4 Malformed records: ledger, never silent deletion.** Rejected records go to a reject ledger (analogous to DuckDB `store_rejects`: line number, byte offset, reason, raw line [S2]). `ignore_errors`-style silent skipping is offered only as an explicit, flagged mode that writes the same ledger. **Projection-dependent validation pitfall [F]:** DuckDB documents that with projection pushdown, a CAST error may not occur at all if the bad column isn't selected [S2]; therefore the product's *validation pass* must scan all declared columns, never reuse a projection's incidental errors.

**D5 Row and order identity.** Each emitted artifact carries: input identity, transform hash, and a row digest (rolling sha256 over row encodings) + row count. Ordering: **stable** = input order preserved by a streaming transform (default); **deterministic** = explicit total sort key, required for anything the user will diff across runs. Aggregates are order-insensitive sums/counts by construction where possible. Unordered engines' output order is treated as unstable and never displayed as meaningful [I, W2].

**D6 Preview is not proof.** Schema/preview endpoints return a bounded first-N (or stride-sampled) window explicitly labeled `sample`; no UI element may phrase a sample-derived statistic as a full-dataset property. (Executed witness W2 keeps this flag in its own receipt [W].)

**D7 Values.** Unicode strings (UTF-8), explicit nulls vs missing fields kept distinct, timestamps stored as ISO-8601 strings with declared format, heterogeneous columns allowed only under an explicitly declared "any/variant" type [W2 exercised all of these].

## 6. Notebook semantics: four different things that must not be conflated **[C]**

1. **Displayed cell order** — nbformat array order [S4]; what the analyst sees.
2. **Actual execution order** — the kernel's `execution_count` sequence, recoverable from the document + event log; witness W1 shows a document where the two orders differ and a never-run cell with `execution_count: null` that must be excluded from replay order, not crash it (rev-1 of the witness failed on exactly this null-sorting bug; the fix is part of the check now) [W].
3. **Current kernel state** — live, unversioned, dies with the process; the product never treats it as durable truth.
4. **Provenance of saved outputs** — each saved output records `{event_id, code_hash, env_hash, input identities, exec_order}`; display happens with a status badge (below).

**Status model per visible output** (witness W3 implements and asserts the transitions [W]):

| status | meaning |
|---|---|
| `current` | produced by an event matching current code hash + current input identities + current env hash |
| `stale` | an upstream cell edit, dataset identity change, or config change postdates the output |
| `failed` | the producing event errored; error output (ename/evalue/traceback per nbformat [S4]) displayed |
| `unverified` | nothing trustworthy is known: fresh cell, **kernel restart**, cancelled/interrupted run, env change, or missing sidecar |

**Invalidation rules:** edit cell X → X and all static descendants `stale` (marimo-style static refs/defs DAG [S6]); dataset identity change → readers and transitive descendants `stale`; env-hash change → **everything** `unverified`; kernel restart → **everything** `unverified` (never silently `current`); interrupt/cancel → the running cell and queued descendants `unverified` (marimo already cancels queued dependents on interrupt [S6]); run error → cell `failed`, descendants `unverified`. Comment/whitespace-only edits still invalidate by default (conservative); a normalized-hash refinement is a deferred option, since marimo's #3140 shows the granularity pain is real but the safe default is strict [S21, C]. Reload/edit races use **generation counters** so a late invalidation cannot re-stale a cell that already re-ran (mechanism proven out by merged marimo PR #10912 [S21]).

Kernel restart deserves emphasis: the document's stored outputs survive restart by design (they are part of the file), so only the *status overlay* changes; nothing is deleted, nothing is relabeled `current` **[I]**.

## 7. Clean replay: what is guaranteed and what is not

**Flow [C]:** "Clean run" = papermill-style headless execution of the current document in a fresh kernel/process, writing `notebook-clean-<event>.ipynb` **next to** the original (original untouched [S14 pattern]), in dependency order (topological; ties broken by display order), with progress, cancel, and per-cell error capture.

**Guaranteed by the product [C]:** replay order recorded; the replay bundle (code hashes, dataset identities, env lock, engine version) is complete and machine-checkable; if two replays with the same bundle produce byte-identical outputs, the manifest says `replay: identical`; executed witness W4 demonstrates identical bytes for a pure transform and flags unseeded RNG as differing [W].

**Explicitly outside the guarantee [C]:** wall-clock/time-dependent code; unseeded randomness (W4 shows two runs differ [W]); external services/network; undeclared file access (the sandbox blocks it, so undeclared access becomes a loud failure, not a silent difference — §9); unpinned packages (env-hash changes → outputs `unverified`, replay runs in a fresh resolved env); floating-point differences across BLAS/CPU architectures; engine-version differences (the DuckDB #12596 class: configuration-path-dependent results [F §3]).

## 8. UX surface required by the brief **[C]**

- **Run controls:** run cell / run selection / clean replay; cancel (marks `unverified`); progress = per-cell queue from the static DAG.
- **Provenance view:** per output: producing event, timestamp, duration, env-hash, input identities; one click → manifest fragment.
- **Status badges:** `current / stale / failed / unverified` (§6), always visible next to each output.
- **Diff saved vs current:** saved output vs a fresh bounded re-computation of the same cell, plus manifest-level diffs (row digest, row count, value histogram drift).
- **Dependency view:** the static DAG (marimo shows this is feasible with static analysis alone [S6]).
- **Accessibility of errors:** error outputs render ename/evalue/traceback [S4]; ledger views for data rejects (§5 D4).

## 9. Execution boundary for untrusted notebook code **[C]**

- Notebook cells run in a **separate OS process** under an isolation primitive (namespace/sandbox), with: filesystem allowlist = project dir (rw for `.labbook/`, ro for source files) + declared dataset paths (ro); **network disabled by default** (per-run opt-in, recorded as `external effects` in the event, which caps the replay guarantee); resource caps (wall/CPU/mem) with kill-and-mark-`unverified` on breach. The experiment's own isolated executor is the working model for this pattern (receipts in `witnesses.json` show memory/wall/network-namespace limits recorded per run) [W].
- **An import blacklist does not supply isolation** — Python is dynamically extensible (`importlib`, ctypes, file builtins); denying `import os` textually blocks nothing serious. Isolation must come from the OS layer, as the executor used for this research states outright ("kernel isolation supplied by Bubblewrap/systemd, not AST filters") [W receipts].
- **Usability trade-offs [I]:** strict ro-datasets + no network makes first-run friction (matplotlib headless setup, one flag for network fetches) — accepted because silent environment drift is the bug being prevented; opt-in escape hatches are recorded and visibly degrade the replay badge to `unverified-replay`.
- **Browsing is never execution [C]:** the viewer/notebook UI renders documents and requests previews from the engine's bounded path; opening a shared project never executes its code (cf. marimo's `--sandbox`/auto-install risk noted in PEP 723's security section [S17]).

## 10. Large data path, caching, concurrency, recovery

- **Envelope:** 8 cores / 16 GB RAM. Target (unverified): a 5 GB CSV/NDJSON/Parquet input streams through bounded-memory operators for import, validation, preview, per-group aggregates, and filters (DuckDB-class engines run columnar scans through an evicting buffer pool with a settable memory limit [S13, I]); **explicitly bounded differently:** full sorts, global distinct, cross joins may spill or exceed the envelope — the product names the operation's bound class *before* running it (streaming | spillable | requires-bound) [V: §13 V2].
- **Large-result truncation:** outputs over a threshold spill to `.labbook/outputs/` content-addressed; the document keeps a bounded slice + digest + full-result pointer; the diff view compares digests, not megabytes **[C]**.
- **Caching & invalidation:** cache key = `(dataset identity, transform code hash, env hash, declared op params)`; content addressing makes reuse safe across machines; any key-component change is automatically a miss. Caches are always regenerable, never authoritative **[C]**.
- **Concurrency/file locking:** one writer per project via `locks/project.lock` (O_EXCL create, host/pid/staleness check); second openers get read-only (mirrors DuckDB's single-writer/multi-reader file model [S3]). Multi-writer real-time collaboration is out of scope (§14).
- **Recovery after interrupted save:** saves are `write temp → fsync → atomic rename`; `events.jsonl` is append-only with per-record checksums; a torn last record truncates cleanly; the manifest is written last, so a crash leaves outputs `unverified`, never falsely `current` **[C]**; fault-injection test V5 (§13).
- **Schema evolution:** dataset re-import with changed inferred/declared schema requires an explicit contract diff approval; old artifacts keep their recorded schema, so old replays explain themselves rather than silently reinterpreting **[C]**.

## 11. Support boundary **[C]**

- **Python:** supported floor 3.11, tested through 3.13, opportunistic 3.14. Justification: endoflife.date (captured 2026-10-05) shows 3.9 EOL 2025-10-31 and **3.10 EOL 2026-10-01 — already past** — with 3.11/3.12/3.13 EOL 2027/2028/2029 [S16]; the Python devguide states the five-year EOL policy [S15]; papermill demonstrates the industry pattern of tracking python.org sunsets [S14]. The research sandbox itself reported CPython 3.14.4 [W receipt], so 3.14 is viable but not required.
- **Languages:** **one** notebook language (Python). The SQL colleague is served by the **same embedded engine** (SQL is a query language over the data engine, not a second notebook kernel) — this is the defensible way a small team avoids building "every language kernel" **[C]**. Optional SQL execution is a view over the dataset registry; it shares identity/validation/manifests with notebooks rather than forming a parallel universe.
- **Interchange:** nbformat 4.5 documents in and out [S4]; single-file exchange can embed deps via PEP 723 blocks [S17]. Adopting formats does not settle runtime behavior — semantics come from our status/event layers.

## 12. Minimum workflow coverage

| Brief step | Mechanism (section) |
|---|---|
| create project | `labbook.toml` + folder scaffold (§4) |
| import & identify without copying | identity registration, read-only opens (§5 D1) |
| author notebook/transform | nbformat 4.5 documents; static DAG build (§6) |
| preview bounded sample | engine bounded path, `sample` label (§5 D6) |
| run selected work interactively | kernel process under sandbox; DAG-driven progress/cancel (§6, §9) |
| request clean replay | headless replay → separate artifact (§7) |
| compare provenance | provenance view + saved-vs-current diff (§8) |
| save | atomic save; event log; status overlay (§10) |
| reopen on another machine | folder/bundle is portable; identities are content hashes; sidecar loss degrades to `unverified` (§4, §5) |
| inspect & export results + manifest | `manifest.repro.json` (W4 shape [W]): notebook hash, per-cell code hashes + exec order + status, dataset identities + declared schema, env binding, replay verdict |

## 13. Validation — executed vs proposed

**Executed by candidate [W]** (isolated component checks; tiny synthetic data; receipts with code/stdout hashes and limits in `witnesses.json`; none establish full-product behavior):

- **W1** document fidelity: nbformat-4.5-derived rules; display vs execution vs replay order; `execution_count: null` handling. rev1 failed (null-vs-int sort) — failure receipt retained; rev2 passes (`exec-6tyxg1kl`, exit 0).
- **W2** streaming transform of 50,000 synthetic NDJSON rows (unicode/nulls/missing/timestamps + injected malformed lines): 512-row bounded chunks, 3 rejects ledgered with line/byte/reason, source hash unchanged, preview labeled sample; stable vs deterministic category ordering compared (`exec-eo7n39wa`, exit 0).
- **W3** invalidation state machine: all §6 transitions asserted across a 13-event scenario including error, dataset change, kernel restart (`exec-vephzgkd`, exit 0).
- **W4** clean replay: byte-identical outputs for a pure transform; unseeded RNG demonstrably differs; manifest shape produced (`exec-0mgh0exa`, exit 0).

**Proposed / UNEXECUTED [V]** (what a real implementation must run):

1. **V1** W2's harness against a real 5 GB generated CSV under a 16 GB envelope: import hash time, preview latency, `count(*)` streaming; record peak RSS.
2. **V2** bound-class audit: run full sort / global distinct on the 5 GB input; confirm the declared bound class (spill vs fail) matches observed behavior.
3. **V3** two-machine reopen: project moved between hosts; all statuses recompute; manifest verifies from content alone.
4. **V4** kill -9 during save at randomized offsets ×1000: assert no state ever reads `current` afterwards; journal always resumes.
5. **V5** invalidation property test: randomized edit/swap/restart sequences vs the W3 rules as an oracle.
6. **V6** upgrade matrix: DuckDB minor-version bumps vs pinned contracts (the #12596 class): dataset contracts detect any row-count/shape drift.
7. **V7** sandbox escape attempt suite (known bypass idioms) to confirm the OS-level boundary, not a blacklist.

**Unsupported critical dependencies (explicit):** the 5 GB streaming target rests on engine capability I inferred from captured code/docs (evicting buffer pool [S13], streaming reader docs [S2]) but never measured; sandboxing quality is delegated to an OS mechanism not chosen or tested here; both are recorded in `leads.json`.

## 14. Opportunities, alternatives, rejected ideas

**Opportunities (useful, not obligations):** (1) surface the engine's reject ledger as a "data quality" pane [S2]; (2) PEP 723 blocks per notebook for single-file sharing [S17]; (3) DAG/minimap view from the static analyzer [S6]; (4) later, multi-writer via a server-backed catalog (DuckDB's Quack protocol is beta; DuckLake is the stable multi-writer route [S3]) — explicitly not a requirement.

**Plausible alternative architecture (bounded):** make marimo's *runtime* the reactive engine and keep `.ipynb` only as an import/export format (i.e., adopt precedent B wholesale, storage included). Pros: staleness semantics battle-tested. Cons: storage becomes `.py` (team's existing Jupyter assets become second-class), and marimo's own open staleness/replay bugs (#9881, #10602) would become our core-path bugs [S21]. Chosen instead: **graph + status layer we own, document format we don't** [C].

**Rejected:** import-blacklist isolation (§9); mtime/size as dataset *identity* (hint only, §5 D1); silent `ignore_errors` defaults (§5 D4); per-language kernels (§11); SQLite as the tabular engine (row-store, weaker external-file/Parquet story than the DuckDB precedent — inference); hosted service / real-time collaboration / scheduling (out of scope by brief).

## 15. Uncertainty register

- First DuckDB release containing the #12596 fix: between 1.0.0 and 1.1.0; 1.0.x series unchecked [L1].
- `null_padding` default value differs between PR #6765's description ("defaults to true") and the current docs' error-sample printout (`null_padding=0`); per-version default unresolved [L2] — does not affect the design, which pins schemas explicitly.
- marimo #9881/#10602 remain open as of capture; their final fixes may differ from PR #10915's approach [L6, L10].
- DuckDB's precise out-of-core behavior for global operators on this envelope: unverified [L5].
