# Proposal — Bench: a local-first reproducible notebook + data workspace (research stage)

**Role:** research (fresh ER9, brief B). **Date:** 2026-10-06. **Status:** frozen research deliverable.
**Labeling convention used throughout:** **[FACT]** = captured public source; **[INFER]** = engineering inference from facts; **[CHOICE]** = product decision this proposal makes; **[EXEC]** = executed by candidate in the admitted isolated sandbox (receipt in `witnesses.json`); **[PROPOSED/UNEXEC]** = validation not yet run.

---

## 1. Executive summary

Bench is a folder-based research workspace for a 3-person analyst team: notebooks (standard `.ipynb`), a **dataset registry that references rather than copies data**, an append-only **execution journal**, and a **run record** per execution that binds every saved output to the cell code hash, upstream dependency hashes, source-data hash, and environment hash. A derivation engine recomputes per-output status — `current`, `stale`, `failed`, `unverified` — so "why does my colleague's run differ?" has a mechanical answer (compare run records), and "what became stale after my edit?" is a transitive DAG query, not a memory exercise.

Two independently useful precedents drive the design, with different mechanisms:

1. **Jupyter nbformat v4.5** contributes the *document model* [FACT S1]: cells have stable `id`s, code cells carry `execution_count` and outputs; the schema has **no field for data dependency, environment, or output freshness** — adopting the format settles interchange, not runtime behavior.
2. **DuckDB's CSV reader** contributes the *engine + sampling-inference mechanism* [FACT S3–S12]: a single in-process engine reads CSV/NDJSON/Parquet with a sniffer that infers dialect and types from a bounded sample (default 20,480 rows). Its real failure history (#16476 → PR #16584 → regression test → v1.3.0, detailed in §4) shows exactly why Bench must treat sniffed schema as a **pin-able assumption, never as fact about the whole file**, and why the engine version must be pinned in the project record.

DVC is investigated as a third mechanism (declarative stage `deps`/`outs` staleness) but could **not** be verified in this run: the repo now redirects to `treeverse/dvc` [FACT S13] and the schema file 404'd at every path tried [FACT S14, S16–S17]; details are recorded as leads, and DVC appears below only as a clearly-labeled alternative (§11).

A runnable witness suite (3 checks, 6 receipts, all candidate-authored, tiny synthetic data) demonstrates the core mechanisms: strict contract parsing with quarantine, hash-based transitive invalidation with restart→`unverified`, and preview-cannot-prove-full-dataset-properties. **[EXEC]**

---

## 2. Architecture and component choices [CHOICE, grounded in §3 facts]

```
project/
  workspace.json          # project record: id, schema version, member notebook list, settings
  notebooks/*.ipynb       # nbformat 4.5+ (cells have stable ids)          [FACT S1 -> CHOICE]
  datasets.json           # dataset registry: references, NOT copies (§5)
  transforms/             # versioned SQL/Python transform scripts (plain files)
  env/env.json            # environment binding: python, packages -> lockfile w/ hashes, engine pin
  journal/events.jsonl    # append-only execution events (fsync per event)
  runs/<run_id>/          # run record: per-cell code+dep+data+env hashes, exec order, outputs
  outputs/                # content-addressed result artifacts (truncation overflow lives here)
  .bench.lock             # single-writer lock (host, pid, ts)             [CHOICE, §9]
```

Components (all user-space; no daemon required):

- **Registry + contract store** — declares each dataset's identity, schema contract, and error policy (§5).
- **Execution engine** — embedded **DuckDB** (pinned version) as the tabular engine for import/previews/transforms; the SQL colleague queries the same registry through it [FACT S12 → CHOICE].
- **Notebook runtime** — CPython + ipykernel (Jupyter wire protocol) for interactive cells; **clean replay** runs the notebook in a fresh kernel in display order (nbclient-style), never reusing live kernel state [INFER from S1's execution_count semantics; nbclient not directly captured — see leads].
- **Provenance/status engine** — pure functions over run records + current hashes (witnessed: W2 [EXEC]).
- **Sandbox launcher** — OS-level confinement for kernel/replay processes (§8).

---

## 3. Precedents studied (mechanisms and independence)

### P1. Jupyter nbformat v4.5 — the document/interchange mechanism
[FACT S1] The captured schema (main @ `4346f97c9d43…`, described as "Jupyter Notebook v4.5 JSON schema") requires each code cell to carry `id` (1–64 chars, `[a-zA-Z0-9-_]`), `source`, `outputs`, and `execution_count` ("The code cell's prompt number. Will be null if the cell has not been run."), plus root `metadata.kernelspec`. This gives Bench, for free: stable cell identity across edits (ids, not positions), the display-order vs execution-order distinction (`execution_count` is per-cell, so a notebook with counts `3,1,2` is representable), and a portable output container (mimebundles).

**Independence:** it is a file format; it knows nothing about kernels, data, or freshness. [FACT S1] contains no dependency/env/status fields — confirming the brief's warning that adopting a standard document format does not settle runtime behavior. [INFER] Bench therefore stores provenance **outside** the notebook (run records keyed by cell `id`), leaving `.ipynb` diff/merge-friendly and tool-compatible.

### P2. DuckDB CSV reader/sniffer — the streaming-engine + bounded-sampling mechanism
[FACT S12] Current docs (v1.5 "current", 1.4 "LTS" in the version sidebar) document `read_csv` with explicit `columns = {'name': 'TYPE', …}`, `delim`, `header` and auto-infer modes. [FACT S3–S7] The option surface, quoted verbatim in three issue error dumps, includes `sample_size = 20480`, `strict_mode`, `null_padding`, `ignore_errors`, `all_varchar`, `date_format`/`timestamp_format`, `store_rejects` (per #25824). **[INFER]** DuckDB is an in-process columnar engine designed to scan files larger than RAM; a 5 GB input on the 16 GB envelope is its normal operating regime. The docs pages for memory limits/out-of-core behavior were only partially captured (nav-heavy HTML; content bytes retained but not fully read) — this inference is flagged in leads (L2).

**Independence:** an execution engine with explicit knobs for the exact hazards the brief names (sampling, malformed rows, type inference). It is a different layer than P1 (compute vs document) and independently useful: it also gives the SQL colleague a zero-server query path over the same registered datasets. [CHOICE]

### P3 (partial, labeled). DVC — declarative stage-level staleness
[INFER, NOT source-verified this run] DVC's mechanism — pipeline stages declaring `deps`/`outs`, content-hash tracked, with `status`/`repro` recomputing staleness — is the closest prior art for Bench's dataset-level invalidation. This run could only establish the repo's transfer to `treeverse/dvc` and current tags 3.67.1/3.67.0/3.66.1 [FACT S13], plus the 3.59.0 tree layout [FACT S14]; the schema/docs were unreachable (S16–S17, L1). DVC is therefore used in §11 as an **alternative**, not a citation-backed precedent.

---

## 4. Real issue → fix → regression test → release chain (complete, source-pinned)

**Defect (DuckDB #16476, filed 2025-03-03).** [FACT S7] `read_csv` on a public CSV that uses RFC 4180 escape-by-doubling (`""` inside quoted fields) failed with `Value with unterminated quote found`: the sniffer auto-detected `escape = \` **although no backslash occurs in the file**. Reproducer error dump shows `escape = \ (Auto-Detected)`, `sample_size = 20480`. Version applicability at file time: failed on 1.2 and 1.3.0-dev926; commenter (2025-03-03): "1.1.3 imports the same CSV file successfully" — i.e., a **regression introduced in the 1.2 line**; a second user reproduced on v1.2.0 (2025-03-10). Maintainer labeled it `reproduced` (2025-03-05).

**Fix (PR #16584, "Give preference to quote=escape if we can't do better").** [FACT S8, S9] Authored by DuckDB member `pdet`; merged **2025-03-12T08:47:04Z** by `Mytherin`; merge commit `7d9d4fc60d1b51e1f18763f4f8f4e3c91112bb37` (GPG-signed merge payload visible in S10/S11). Two files:
- `src/execution/operator/csv_scanner/sniffer/dialect_detection.cpp` (+9): in `RefineCandidates()`, when multiple candidates parse successfully, prefer a candidate whose `escape == quote` (escape-by-doubling) over one with a different escape.
- `test/sql/copy/csv/test_quoted_later_escaped.test` (+35, **new regression test**): builds files of 100,000 (and 5,000) rows whose only quoted/escaped field appears **beyond the sniffer sample**, then asserts `sniff_csv` reports `quote = "` with `escape = "` (doubling case) and `escape = \` for the genuinely backslash-escaped file. The test is a direct regression guard for "quote/escape evidence that appears late in the file."

**Release applicability (proved via compare API).** [FACT S10] Compare `7d9d4fc6…v1.2.1`: `status: "behind"`, `behind_by: 23` → **the fix is NOT in v1.2.1** (v1.2.1 branched before the fix). [FACT S11] Compare `7d9d4fc6…v1.3.0`: `merge_base_commit == 7d9d4fc6…`, `status: "ahead"`, `ahead_by: 3390`, `behind_by: 0` → **the merge commit is an ancestor of tag v1.3.0**; the fix shipped in v1.3.0, not in the 1.2.x patch line checked.

**Limits of this evidence.** I did not build or run DuckDB; no runtime behavior was executed (the isolated sandbox has no DuckDB). "Not in 1.2.1 / in 1.3.0" is proven by commit ancestry for those two tags only; any intermediate 1.2.x tag was not checked. Bug *presence* in 1.1.3-vs-1.2.0 rests on reporter/ commenter statements, not my own execution.

**Companion findings that shape Bench's data contract.** [FACT S4/S6] Issue #17599 ("CSV sniffer defaults to no quote" — first quoted field beyond the sample) was **closed without a fix** by maintainer `pdet`: *"that's by design, if the sniffer does not encounter any quotes then it decides there are no quotes."* [FACT S5] Issue #25824 (**open** at capture, 2026-09-24) documents silent value corruption: a value past the 20,480-row sample that the sniffer would have rejected (`1.5` under a BIGINT inference) is **silently rounded to `2`** by the scanner, because sniffer and scanner casts use different strictness (reporter cites `type_detection.cpp:182` strict=true vs `string_value_scanner.cpp:335` strict=false, main @ `2bbfe6f236`); same for timestamps silently truncated to DATE. Reporter's version matrix: 1.1.3, 1.5.5, 1.6.0 nightly, main — all affected ("longstanding behaviour").

**Design consequence [CHOICE]:** sampling inference is acceptable only as a *proposal* that the user pins. Bench never lets a sampled schema silently govern full-file reads: the confirmed contract is replayed as explicit `columns`/format parameters (S12), the pinned dialect is stored in the dataset record, and the engine is pinned in the environment binding — otherwise a routine engine upgrade can change parsed values without any code change (exactly the #16476/#25824 class of "why do we get different results?" event Bench exists to explain).

---

## 5. Dataset registry and the data contract [CHOICE; mechanisms witnessed W1/W3 [EXEC]]

**Import = reference, not copy.** Registering a dataset records: relative path (or bundle-external absolute ref), byte size, mtime, and a content hash. Hashing is streaming (constant memory); for files above a configurable size the registry may record `weak identity` = size+mtime+head/tail hash, explicitly labeled, with a background full-hash pass upgrading it [PROPOSED/UNEXEC]. Original files are opened **read-only** by every Bench component; all derived data lands under `outputs/`.

**Two-phase schema.** Import runs a **bounded probe** (first N rows/bytes) and produces a `SchemaProposal`: column names, observed types, nullability, observed dialect — every field annotated `sampled: true, rows_examined: N`. The UI must render proposals with that caveat (W3 shows why: a first-500-rows preview reported "no negative values" while the full 10,000-row file contained one). The user confirms/edits → `SchemaContract`:

- **Types and conversions:** per-column declared type; conversion table fixed in advance (e.g., `""→NULL` only for columns declared nullable; timestamps only with an explicitly declared format string; no format declared → error, not guess). Heterogeneous columns may be declared `VARCHAR` deliberately, but the contract records the widening risk (#25824's silent-rounding class).
- **Error policy per dataset:** `strict` (abort with full bad-line listing) or `quarantine` (good rows proceed; every rejected row written to a sidecar file with original line number, raw bytes, reason — never silently dropped). W1 [EXEC] demonstrates: 2 of 6 malformed rows quarantined with reasons ("val='notanumber': invalid literal…", "column count 1 != 3"), 0 silent deletions, source hash unchanged.
- **Row/order identity:** each parsed row carries `(file line/ordinal, content hash)` (W1). "No copying unnecessarily" plus "no silent mutation" imply original order is *evidence*: Bench treats input order as stable, and any reordering must be an explicit `ORDER BY` with a declared tiebreaker. **Deterministic** = same inputs+code+env → identical bytes; **stable** = well-defined given input order (W3's `sorted_first3` includes a tie example).
- **Schema evolution:** changing a dataset's observed schema vs the stored contract raises a `contract_drift` event; dependent outputs → `stale` (W2's data-hash path) and the diff (old/new columns+types) is shown before any re-run.

## 6. Notebook execution model and provenance [CHOICE; W2 [EXEC]]

Four distinct things, never conflated:
1. **Displayed cell order** — the `cells` array in the `.ipynb` [FACT S1].
2. **Actual execution order** — `exec_seq` per cell in the run record (W2 witnesses runs `A→B` and `B→A` with identical display order).
3. **Current kernel state** — live namespace, owned by the interactive session only; **never** a source of truth for outputs.
4. **Provenance of saved outputs** — per run record: cell `id`, code hash, upstream dep hashes, source-data hashes read (declared via registry imports), env hash, engine hash, timestamps, and output artifact hashes.

**Status derivation** (witnessed logic, W2 [EXEC]): `current` iff own code hash, transitive dep statuses, declared data hashes, and env hash all match the record; `stale` if any mismatch — **stale propagates transitively** through the dependency edge even when a cell's own hashes still match (first W2 attempt failed exactly here; the corrected rule is what shipped); `failed` for cells that raised; `unverified` after kernel restart, interrupted execution, or any undeclared-access flag — **a restart or interrupt must never leave old outputs labeled `current`**. UI shows a fourth practical color for "saved output differs from current re-run" via the compare view (§7).

**Invalidation effects [CHOICE]:** edit upstream cell → downstream `stale` (W2); edit source dataset → all readers `stale` (transitively, W2 `r4`); change environment → all cells `stale` (W2 `r5`). Cancel: run record closed as `interrupted`; that run's outputs are `failed`/`unverified`, superseding any prior `current` label for the touched cells.

## 7. Clean replay: what is guaranteed, what is not [CHOICE]

**Guaranteed (the product's contract):** a clean replay re-executes every code cell **in display order** in a fresh, sandboxed kernel, against hash-verified declared datasets, a locked environment, and a pinned engine, and records the full provenance. The guarantee is about **conditions**, not outcomes: *given* deterministic cells, replay is byte-identical and any difference between two runs is attributable by diffing the two run records (inputs, env, code, engine).

**Explicitly outside the guarantee:** wall-clock time, `random`, dict/parallel iteration nondeterminism, GPU nondeterminism; external network services (blocked by default in the sandbox); unpinned packages (replay **refuses** without a lockfile); undeclared file access (sandbox logs it, run marked `unverified`); sniffer/ engine-version drift (mitigated by engine pinning, §4/§5); saved outputs produced interactively (marked as such; only replay-run outputs can be `current`).

**Compare view:** any two run records (or record vs live re-run) diff cell-by-cell: code hash, data hashes, env hash, output bytes — this is the direct answer to "why does the shared notebook differ for my colleague?" The reproducibility manifest export (§10) is a projection of one run record.

## 8. Execution boundary for untrusted notebook code [CHOICE; trade-offs stated]

Default profile: project dir read-write, registered datasets read-only, cache dir read-write, **no network**, memory/CPU/wall caps; implemented with OS primitives (namespace/bubblewrap/container-style), never by AST inspection or import blacklists — blacklists are trivially escaped (attribute chains, dynamic import, C extensions) and Bench does not claim otherwise. Where OS sandboxing is unavailable, Bench degrades to a **declared-access** mode: runs execute unsandboxed but are labeled `unverified — unsandboxed`, visible in the run record. Trade-off: strict profiles break naive workflows (e.g., reading a sibling directory), so the escape hatch is one click, journaled, and downgrades the run's status. Source browsing/download is a separate UI surface with no code execution attached to it.

## 9. Files, locking, recovery, portability [CHOICE; PROPOSED/UNEXEC mechanics]

- **Locking:** `.bench.lock` (host, pid, timestamp) acquired for mutating operations; second writer gets a read-only notice. Notebooks remain ordinary `.ipynb`, so a crashed session leaves at worst a stale lock file, which the user can clear (contents displayed first). No multi-writer merging in v1 — real-time collaboration is out of scope (§12).
- **Save = atomic:** write temp file + fsync + rename; run records are append-mostly (journal JSONL fsync per event). **Interrupted save recovery:** a notebook file and its journal can disagree; on open, Bench reconciles — outputs whose journal event is absent are labeled `unverified`, never `current` (same rule as restart; W2's `unverified` path is the witnessed core of this mechanism; the crash-during-save test itself is UNEXEC, L5).
- **Exchange:** the project folder is the bundle; `bench export` zips project + manifest + (optionally) small datasets; large datasets stay external and are re-verified by size/hash on first open. No absolute paths inside records; environment rebuild from `env/env.json` lockfile. Reopen-on-another-machine is therefore: copy folder, rebuild env from lock, open — statuses recompute from hashes, so nothing silently claims `current` on new hardware.

## 10. Minimum workflow coverage (brief's 10 steps → mechanisms)

1. **Create project** → `bench init` writes §2 skeleton [CHOICE].
2. **Import/identify without copying** → registry reference + bounded probe + SchemaProposal (§5; W1 [EXEC] for the contract core, W3 [EXEC] for preview labeling).
3. **Author notebook/transform** → standard `.ipynb` (S1) + plain transform files; transforms are first-class cells with their own hashes.
4. **Bounded preview** → engine `LIMIT`/head-scan with explicit "sample ≠ full-file evidence" label (W3).
5. **Run selected work interactively** → kernel in sandbox (§8), journal events per cell.
6. **Clean replay** → fresh kernel, display order, locked env/inputs (§7).
7. **Compare provenance** → run-record diff (§7).
8. **Save** → atomic save + journal reconciliation (§9).
9. **Reopen elsewhere** → folder/bundle + env lock rebuild (§9).
10. **Export results + manifest** → results + `repro_manifest.json`: project id, notebook hash per cell, dataset hashes, env lock hash, engine version, run ids, per-output status/artifact hash.

## 11. Opportunities and alternatives

**Opportunity (chosen) [CHOICE]:** one embedded engine serving both personas — analysts get `read_csv`/Parquet over the registry; the SQL colleague gets a `bench sql` shell over the same registered datasets. Zero extra infrastructure, and the same contract governs both paths (S12). Second opportunity: the cell-DAG provenance view doubles as the dependency/provenance screen the brief requires.

**Plausible alternative (kept visible):** a DVC-style declarative file-stage DAG (notebooks/scripts as stages with `deps`/`outs`, staleness by content hash) instead of the event journal. Coarser (stage-level, not cell-level), but simpler to reason about and battle-tested at scale [INFER — mechanism not source-verified this run, L1]. Bench's run-record design can be projected into that shape later if journals prove too heavy.

**Rejected for v1 (kept visible as non-obligations):** hosted service, real-time collaboration, automatic scheduling, generic multi-language kernel zoo (Python + embedded SQL only, per §8/§13). Import-blacklist "isolation" was considered and rejected as a security claim.

## 12. Support boundary [CHOICE]

- **Python:** CPython 3.11–3.13 via ipykernel/Jupyter protocol; packages pinned by a hash-complete lockfile. No other language kernels in scope; a small team should not maintain a kernel zoo.
- **SQL:** embedded DuckDB only (pinned version, stored in the run record). No generic ODBC/JDBC connections in v1 (they would silently reintroduce external nondeterminism into "clean replay").

## 13. Critical dependencies and unsupported-input behavior

**Critical dependencies (explicitly recorded):** ipykernel/Jupyter protocol stability [INFER; L3]; DuckDB sniffer/reader behavioral stability across versions — *evidence shows it changes* (S7/S10/S11: regression in 1.2, fix only in 1.3.0) → version pinning is load-bearing, not cosmetic; nbformat 4.5 cell-`id` requirement (writers must emit ids; ecosystem tools that drop them would break provenance keys — L4); availability of OS sandbox primitives per platform (§8 degraded mode otherwise).

**Unsupported-input behavior (contract, not silent fallback):** wrong column counts → quarantine/fail with line numbers (W1); empty required fields → error; timestamps without declared format → error; unknown encoding → error (default utf-8, BOM tolerated); dataset > RAM → only declared streaming ops (filter/project/aggregate) [INFER from engine design; L2]; global sorts/aggregations beyond the memory budget → explicit external-merge path with disk budget, else a clear bound error [PROPOSED/UNEXEC]; dataset mutated mid-run → hash mismatch → run `unverified`; notebook outputs exceeding size limit → truncated with overflow artifact + `truncated: true` in output metadata [PROPOSED/UNEXEC].

## 14. Executed checks and proposed validation

**Executed by candidate** (admitted isolated sandbox, stdlib-only, tiny synthetic data; full receipts incl. code sha256, exit codes, stdout in `witnesses.json`; all earlier failed attempts listed honestly):
- **W1** data-contract import (quarantine, row identity, no mutation, nullable-vs-required) — final `exec-yzc08y40`, exit 0 **PASS**; two prior attempts failed on candidate assertion bugs (documented).
- **W2** staleness/invalidation engine (transitive stale, env/data/code triggers, restart→`unverified`, exec-order-vs-display-order) — `exec-uhzn0n65`, exit 0 **PASS**; first attempt failed and correctly exposed the missing transitive-propagation rule (the receipt is kept as evidence the rule was *derived*, not assumed).
- **W3** preview-vs-full property (first-500 preview says "no negatives"; full 10,000-row scan refutes; deterministic recomputation byte-identical) — `exec-sq5n9eh3`, exit 0 **PASS**.

Scope limits: these are isolated component checks of candidate-authored logic on synthetic data; they do **not** establish DuckDB, ipykernel, or any full-product runtime behavior.

**Proposed / UNEXECUTED:** end-to-end clean-replay witness (tiny notebook, two "machines" = two fresh sandboxes) asserting manifest equality; sandbox escape test suite (network/file/cgroup caps); DuckDB version-pin behavior test reproducing the #16476 reproducer on 1.2.1 vs 1.3.0 [PROPOSED — would convert S10/S11 ancestry facts into runtime facts]; 5 GB streaming benchmark on the 8-core/16 GB envelope (target: full scan + filter + aggregate within RAM budget; explicit-bound external sort); crash-during-save recovery test; lockfile rebuild roundtrip.

## 15. Source index

Facts cited above map to catalog entries in `sources.json`: S1 nbformat schema (pin main@4346f97c…), S2 nbformat head commit API, S3 GitHub issue-search capture (issue bodies #17599, #25824, #16476, #15882), S4/S5 issue bodies via S3, S6 #17599 timeline (closed-by-design comment), S7 #16476 timeline (reproduced label, PR cross-ref, version statements), S8 PR #16584 files (patch + new regression test), S9 PR #16584 metadata (merged_at, merge commit, base branch), S10 compare→v1.2.1 (behind 23), S11 compare→v1.3.0 (ancestor), S12 DuckDB CSV docs (v1.5 current, partial capture), S13 DVC tags (treeverse transfer), S14 DVC 3.59.0 tree listing; S15–S17 record failed paths honestly (nbformat 5.10.4 tag-path 404; DVC schema 404s; dvc.org unreachable). Uncertainties and follow-ups: `leads.json`.
