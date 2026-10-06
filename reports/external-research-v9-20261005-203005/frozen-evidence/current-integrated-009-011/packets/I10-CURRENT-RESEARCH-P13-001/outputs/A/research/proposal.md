# Proposal — Local-first reproducible notebook + data workspace (research stage)

Stage: research (fresh ER9 role, brief B). Deliverable set: `out/research/proposal.md`, `sources.json`, `witnesses.json`, `leads.json`.
Evidence labels used inline: **[S#]** source fact (see `sources.json` for URL, pin, capture sha256, exact locator); **[INF]** engineering inference; **[CHOICE]** product choice; **[EXEC W#]** executed by candidate (isolated component check; see `witnesses.json`); **[UNEXEC P#]** proposed, not executed. Nothing here is a verified performance result.

## 1. Summary and recommendation

Build the workspace as three independent layers: (1) a **project record** — an ordinary folder whose identity lives in a small `.repro/` journal of content digests and execution events; (2) a **data plane** — an embedded DuckDB 1.5.6 engine that reads CSV/NDJSON/Parquet in place (references, not copies) and streams; (3) a **notebook runtime** — a single Python kernel in a restricted subprocess, whose saved outputs are inert data pinned to cell id + source hash + environment id + input-dataset digests. The reproducibility contract is deliberately narrow: a *clean replay* guarantees re-execution of the current cell sources, in displayed order, on a freshly started pinned kernel, against datasets whose content digests match those recorded at save time — and the product must label every visible output `current / stale / failed / unverified` instead of implying more. [CHOICE]

Research found two independently useful precedents — the Jupyter notebook document format (nbformat v4.5 schema, pinned at release v5.11.1) and the DuckDB 1.5 data engine — plus a packaging standard (PEP 751, Final) for environment binding. It also found a live, on-topic defect: DuckDB issue #25824 reports that CSV values beyond the sniffer's ~20,480-row sample are silently rounded/truncated while the sniffer itself would reject them — concrete evidence that *preview sampling is not proof of a full-dataset property* even inside mature engines, which became a design driver. [S7, S9]

## 2. Architecture overview [CHOICE]

```
my-project/                      ordinary folder = the project record (portable by zip/copy)
  notebooks/*.ipynb              nbformat v4.5 documents (cell ids required)
  transforms/*.sql|*.py          named, versioned data-preparation scripts
  data/
    events.csv                   original datasets: NEVER mutated by the tool
    refs.json                    dataset references: path, format, digests, sniffed options
  outputs/                       large results persisted as Parquet sidecars (truncated in UI)
  .repro/
    manifest.json                reproducibility manifest (atomic tmp+rename writes; see §8)
    events.jsonl                 append-only execution events (runs, restarts, cancels)
    quarantine/                  rejected records + reasons (never silently deleted)
  pylock.toml                    PEP 751 environment lock (+ requirements.txt export)
```

Components: **Project Store** (folder + journal + locking), **Data Plane** (embedded DuckDB, read-only attach of originals), **Notebook Runtime** (one restricted kernel subprocess per notebook session), **Replay Runner** (clean-run orchestrator), **Boundary Guard** (filesystem/network/resource policy for the kernel), **Status Deriver** (pure function from journal + digests to per-output statuses). Bounded alternative kept visible: the notebook runtime layer can initially be reused from Jupyter's `nbclient` execution stack rather than built; the journal and status layer are ours either way. [INF]

## 3. Precedents investigated

### P1 — Jupyter nbformat v4.5 document format (pin: nbformat v5.11.1)

Source facts [S1, S2]: the schema (byte-identical between `main` and tag `v5.11.1`, same body sha256) shows: code cells carry stable `id` strings (`^[a-zA-Z0-9-_]+$`, 1–64 chars); `execution_count` is "The code cell's prompt number. Will be null if the cell has not been run."; outputs are one of four inert types (execute_result, display_data, stream, error) stored *inside the document*; the cells array defines displayed order; `nbformat_minor >= 5`. Mechanism contributed: a stable interchange format that already separates displayed order (array position) from execution order (`execution_count`) and gives every cell an identity that survives reordering — exactly the keys a provenance layer needs. What it does **not** settle [INF, and per brief]: it records nothing about which kernel session produced an output, whether the environment matched, or whether outputs are current — a saved `.ipynb` after a kernel restart looks identical to one freshly executed. That gap is why the workspace adds its own journal and status layer; adopting the format is necessary, not sufficient.

### P2 — DuckDB 1.5 embedded data engine (pin: v1.5.6)

Source facts [S3, S4, S5, S6]: latest release v1.5.6 (2026-09-28); docs channel "1.5 current" also exposes an LTS channel (1.4) and a 2.0-dev preview; `read_csv` supports auto-inference and explicit `columns = {name: TYPE}` schemas; the CSV sniffer "detects the dialect... types of each of the columns... whether the file has a header" with overridable options; concurrency model: **one process may read+write a database file; multiple processes may read only** (`access_mode='READ_ONLY'`), with MVCC/optimistic concurrency *inside* that single writer process. Mechanisms contributed: (a) in-place, streaming, columnar reads of files larger than RAM (SQL over files, no import-copy step); (b) sniffer + explicit-schema duality that maps directly onto our data-contract design (§5); (c) a precise, documented cross-process locking model to plan around. Independence from P1: nbformat solves nothing about data engines; DuckDB solves nothing about notebook documents — the two compose without circular dependency. [INF]

### P3 — PEP 751 `pylock.toml` environment binding (standard, Final)

Source facts [S10]: status **Final** (resolution 31-Mar-2025), lock file must be `pylock.toml` (or `pylock.<name>.toml`), designed so installers compute what to install *without install-time resolution*, with hashes; the canonical spec now lives on the PyPA specs page. Mechanism contributed: a standard, human-readable, machine-generated lock record to put inside the exchanged project folder. Per the brief's warning: adopting the format does not settle runtime behavior — we still pin the interpreter and verify the environment at open time (§9, §10). Which tools consume it at pin time is unverified [L6].

## 4. Real issue/fix/regression-test chains

### C1 — duckdb#1015: "CSV Loader would wrongly assume column with all sample values null to be Bool" (issue → fix → regression tests)

Chain [S7, S8]: filed 2020-10-15 as PR-with-context; **merged 2020-10-16** (`pull_request.merged_at`). The diff (`src/execution/operator/persistent/buffered_csv_reader.cpp`, `SniffCSV`) adds `SQLNULL` to the type candidates and — the actual fix — when *no* candidate type ever matched (i.e., `best_sql_types_candidate.size() == type_candidates.size()`: every sampled value was null/empty), falls back to `VARCHAR` instead of silently keeping the last candidate (`BOOLEAN`). The same patch adds three regression tests: `test/sql/copy/csv/auto/test_auto_voter.test` (new; 5,300-row real `voter.tsv` must load with `COUNT(*)=5300`), an updated `test_sample_size.test` (a previously `statement error` sparse-column case becomes `statement ok` with explicit `typeof()` expectations), and a new `int_bol.csv` type-detection case — plus fixtures.

Applicability and limits: the merge is API-evidenced at exact metadata level; the first *release* containing the fix is **not established** by the captured evidence (no release tag ↔ merge mapping was captured; DuckDB's 0.x-era release containing 2020-10-16 master is inferred, not proven). The regression file still exists at pin v1.5.6 [S9], but its expectations have *changed* since 2020 (e.g., `TestInteger` now expects `BIGINT`, not `INTEGER`), which is itself a finding: sniffer behavior is version-sensitive, so any engine upgrade requires re-running the dataset contract corpus, not just trusting history. This motivates proposed witness P5. [INF]

### C2 — duckdb#25824 (OPEN): silent rounding/truncation past the sniffer's sample

Chain status [S7]: filed 2026-09-17, **still open** at capture. The report (author-run, not independently rerun here) claims: the sniffer fixes a column's type from the first `sample_size` lines (default claimed 20,480); values further down that parse *non-strictly* are silently converted (`1.5`→`2` in a BIGINT column, timestamps truncated to DATE, leading zeros and `1_000` absorbed) with zero rejects recorded even under `store_rejects=true`, while non-parseable strings (`abc`) do raise; reproducible at defaults across 1.1.3 → main dev builds, with `sample_size=-1` recovering the correct type. Design consequences regardless of the issue's eventual fix: (a) never present a preview or sampled schema as a full-dataset property; (b) record the effective sniffer options with every dataset reference; (c) offer a "verify on full data" pass or a declared schema for any dataset used in saved work; (d) treat `IGNORE_ERRORS`-style silent dropping as forbidden by our data contract — quarantined rows go to `.repro/quarantine/` with reasons. This is the strongest research-found justification for the brief's rule, discovered in the wild. [S7; limits in L1]

## 5. Data contract [CHOICE, implemented with P2 mechanisms]

- **Schema assumptions.** Two tiers: *declared* (user or prior verified contract; authoritative) and *sniffed* (engine inference over a bounded sample). Every dataset reference stores: format, dialect options, tier, the exact sample window used if sniffed, and a `verified_full_scan: bool`. Imports default to sniffed + flagged; any dataset used by a *saved* run must be declared or full-scan-verified, otherwise the manifest records `schema_assumption: sampled` and replays treat it as a known risk (visible, not hidden). [S4, S5, S7]
- **Type conversions.** Explicit widening ladder VARCHAR ← INTEGER ← DOUBLE ← temporal, applied only where lossless; lossy casts (float→int, timestamp→date) require an explicit transform step and are recorded in the journal. Nulls: empty field vs quoted empty vs missing key (NDJSON) are distinct null provenances, preserved as provenance, not collapsed. Timestamps: ISO-8601 with offset; naive values get an explicit project-default zone recorded. Unicode: bytes-preserving reads; no silent normalization. [INF]
- **Row/order identity.** Every import assigns an ordinal `rowid` (file order). *Stable ordering* = operations may reorder only where the transform says so; ties under a non-total sort key preserve input rowid order (Python-style stable sort; demonstrated in W2). *Deterministic ordering* = a recorded total key (rowid or declared business key) such that any machine produces the same sequence; exports always state which guarantee they carry. Business-key duplicates are counted, not deduplicated silently. [EXEC W2]
- **Error handling.** Malformed records are **quarantined** (`.repro/quarantine/` with rowid, raw bytes, reasons) and counted in the manifest; nothing is silently deleted; originals are opened read-only (DuckDB read-only attach; single-writer applies only to our `.duckdb` work files) [S6]. Mirrors the C1 regression direction (sparse/null columns must not crash or lie) and avoids C2's silent conversion (quarantine-and-flag instead). [S7, S8; EXEC W1]

## 6. Notebook provenance, statuses, invalidation [CHOICE on P1 mechanism]

Four distinct notions, all first-class: (1) **displayed order** = cells array [S1]; (2) **execution order** = the ordered list of `(cell_id, execution_count)` in the last run event; (3) **kernel state** = live session id + a `kernel_epoch` counter incremented on every start/restart/interrupt; (4) **output provenance** = per output: cell_id, cell source hash, kernel_epoch, execution order index, env lock digest, and the digests of every input dataset the run touched.

Statuses (derived, never hand-set): `current` (provenance matches all current inputs), `stale` (an input changed: upstream cell edited, dataset digest changed, transform changed), `failed` (last run errored; nbformat `error` output type [S1]), `unverified` (outputs exist but no matching run event — after kernel restart, interrupted execution, import of a foreign `.ipynb`, or a manifest/journal mismatch). **A kernel restart or interrupted run never silently leaves outputs `current`**: the kernel-epoch bump forces `unverified` at minimum. [INF from S1; restart-behavior citation gap recorded as L9]

Invalidation rules (table, [CHOICE]): upstream cell edit → all downstream outputs `stale`; source dataset content change (digest) → all outputs of dependent runs `stale`; environment lock change → all outputs `unverified` (must re-run to become current); kernel restart/interrupt → `unverified`; cancel → the in-flight cell's output is `failed(canceled)` and previously completed cells keep their provenance.

Clean replay guarantee boundary: **inside** — same cell sources, displayed order, fresh kernel process, pinned lock digest, recorded dataset digests, resource caps, no network unless the run declares it. **Outside** (the product says so, per cell/run): wall-clock time, entropy/randomness, external services, unpinned or mutable packages, undeclared filesystem access, floating-point/BLAS variation across hardware, and anything the kernel does that our journal cannot see. A passing synthetic witness (W1/W2) does not prove any of this at scale. [INF]

## 7. Minimum workflow coverage [CHOICE]

1. **Create project** → folder + `.repro/` skeleton + pylock.toml. 2. **Import/identify data without copying** → reference + digest; DuckDB reads in place; Parquet metadata gives instant schema; CSV/NDJSON get sniffer + optional full-scan verify. 3. **Author** → nbformat notebooks (cell ids mandatory; upgrade path enforced on open [S1]) and SQL/Python transforms. 4. **Bounded preview** → `LIMIT`-style sample with persistent "bounded sample — not a full-dataset property" banner [L5, S7]. 5. **Interactive run** → live kernel, progress, cancel. 6. **Clean replay** → Replay Runner: fresh process, recorded inputs; per-output status derivation. 7. **Compare provenance** → side-by-side of two run events (inputs, env, exec order, output diffs). 8. **Save** → atomic manifest + journal append (§8). 9. **Reopen elsewhere** → verify digests, install from pylock.toml, statuses re-derived (never trusted from the document). 10. **Export results + manifest** → small JSON manifest (schema §8) + Parquet/CSV exports carrying order guarantees.

## 8. Data plane at the envelope, caching, locking, recovery

- **5 GB target on 8-core/16 GB** [UNEXEC P1; explicitly a target, not a result]: streaming SQL (filter/project/aggregate) is expected to stay within RAM with spill for larger intermediates; unsupported global operations (e.g., full cross-product, unbounded sort without spill) get an *explicit different bound*: the run refuses with the estimated requirement rather than thrashing. Engine capability for out-of-core execution is inferred from the engine's design and docs presence, not measured here.
- **Large-result truncation**: UI shows first N rows + full shape; complete results persist to `outputs/*.parquet` with digest; exports reference the sidecar.
- **Caching/invalidation**: derived artifacts keyed by content hash `(input digests, transform hash, env id, engine version)`; any key-component change is a new key — no stale cache can be served because the key *is* the validity proof. [INF]
- **Concurrency/locking**: one workspace process holds the DuckDB write handle (single-writer model [S6]); a project-level lock file (`flock`, pid + heartbeat) guards the journal; collaborators open read-only (DuckDB `READ_ONLY` attach) and are told writes are unavailable, not silently queued.
- **Interrupted save/recovery**: manifest writes are tmp-file + atomic commit; a torn tmp is quarantined and the last complete manifest stands; demonstrated at component scale [EXEC W2; limits recorded]. The same pattern covers notebook saves (write new, fsync, rename, keep previous). [INF for OS-level durability]
- **Exchange**: ordinary folders; zip bundle = same layout; on open, digest mismatches are shown per file (repair = re-fetch/re-copy by explicit user action).

## 9. Untrusted execution boundary [CHOICE + brief-mandated honesty]

Notebook code runs in a dedicated subprocess (per notebook session) with: filesystem allowlist = project dir + designated cache dir (read for originals, write only for `outputs/` and `.repro/runs/`); **network default-deny**, per-run explicit opt-in recorded in the journal; resource caps (CPU seconds, memory, wall) enforced by the OS (the experiment's own admitted execution capability does exactly this — cgroup/bwrap-level limits, not code inspection [EXEC receipts' `limits` field]). **An import blacklist does not supply isolation** and is not offered as such — arbitrary stdlib/attribute access defeats it; the enforcement point is the process/OS boundary. Usability trade-offs: allowlist prompts on first file access outside the project, network opt-in friction per run, and hard caps that kill genuinely heavy cells (with a clear "raise cap" dialog instead of silent OOM). Source browsing (docs, dataset preview) runs in the host process with **no** code execution — the two are separate surfaces by construction. [INF; boundary claims scoped to design, not to a tested product]

## 10. SQL relationship and Python support boundary [CHOICE]

SQL is supported **through the data plane, not as a second notebook kernel**: transforms are SQL files run by DuckDB (the same engine that powers imports), and the SQL-consuming colleague can open the project folder with the stock `duckdb` CLI in read-only mode against the same files — interop by shared format, not by building another kernel. Broad language support stays out of scope (brief). Python support: pin per project in `pylock.toml` [S10]; initial support window 3.11–3.13, extendable to 3.14/3.15 where dependencies allow — chosen against the devguide fact that main is currently 3.16 (so 3.15 is newest stable) [S11]; exact EOL dates to be verified before release [L2]. Coherent pin set bound in this stage: nbformat **v5.11.1** (schema byte-identical at tag) [S1, S2], DuckDB **v1.5.6** (docs channel 1.5-current; regression test present at tag) [S3, S9], PEP 751 Final [S10]. Migration watch: DuckDB 2.0-dev exists; 1.4 LTS is the conservative fallback [L8].

## 11. Executed checks (isolated, candidate-authored)

- **W1** [EXEC]: sample-vs-full type inference divergence (3-row sample INTEGER vs full DOUBLE — the same shape as duckdb#25824), malformed row quarantined with reasons, no silent deletion, Unicode preserved. Final run exit 0 (`exec-mbd_3xbb`); two earlier failed iterations are recorded honestly in `witnesses.json`. Scope: 6 synthetic rows, stdlib reimplementation of a sniffer.
- **W2** [EXEC]: interrupted-save recovery — torn tmp (60%-written) never applied; committed manifest byte-identical through the crash; retry commits v2; stable tie-order vs total-order demonstrated. Exit 0 (`exec-dk81lqfj`). Scope: in-memory emulation of write/commit semantics; not an OS-crash test.

Neither check establishes full application behavior, a real engine's behavior, or large-scale performance. [EXEC scope limits in `witnesses.json`]

## 12. Proposed validation — UNEXECUTED

P1: 5 GB CSV streaming pass + aggregate with spill, RSS/time/quarantine measured at pin v1.5.6. P2: cross-machine reopen from a zip bundle with digest verification. P3: clean-replay determinism suite incl. invalidation transitions (edit upstream → downstream `stale`). P4: two-process locking conformance (writer + read-only readers; project lock prevents the conflict). P5: reproduce duckdb#25824 at pin v1.5.6 and after any upgrade. P6: Unicode/null/timestamp golden-corpus round-trip. All lack receipts by construction; see `witnesses.json`.

## 13. Opportunities and alternatives

**Opportunities** (not obligations): real-time collaboration via a CRDT document layer with single-writer execution (L7); hosted/scheduled clean replays reusing the same manifest contract; provenance-diff as the primary review artifact for data changes. **Plausible alternative architecture**: keep notebooks on the existing Jupyter execution stack (`nbclient`) and add only our journal/status layer — lower build cost, weaker boundary control (network/fs policy then depends on Jupyter config rather than our sandbox). **Considered and rejected**: building multi-language kernels (violates team-size reality); treating SQLite as the data plane (no documented out-of-core story at the needed scale); presenting sample-based schema as verified (contradicted by C2); import blacklists as isolation (§9). **Rejected-alternative record kept visible** per brief; none of the opportunities is a requirement.

## 14. Critical dependencies and uncertainties

DuckDB sniffer semantics are version-sensitive (C1 expectations changed between 2020 and v1.5.6 [S8, S9]) — the dataset contract must re-verify per engine upgrade (P5). Live defect C2 may or may not be fixed upstream; our design does not depend on it being fixed. pylock.toml tool support unverified [L6]. Python EOL dates unverified [L2]. Jupyter trust-doc successor page not found (404 recorded) [S12, L3]; restart-stale semantics cite only the document format [L9]. NDJSON reader specifics uncaptured [L4]. First release containing the C1 fix not pinned (reported as uncertainty in §4). Out-of-core capability of the engine is design-inferred, not measured (P1 pending).

## 15. Sources

All citations `[S#]` resolve in `out/research/sources.json` (URL, pin, exact locator, capture sha256, delivery-truncation notes). Headlines: nbformat v4.5 schema @ v5.11.1 [S1,S2]; DuckDB v1.5.6 release + CSV docs + concurrency docs (1.5-current channel) [S3–S6]; issue search incl. #25824 (open) and PR #1015 (merged 2020-10-16, diff with regression tests) [S7–S9]; PEP 751 Final [S10]; devguide versions (main=3.16) [S11]; 404 on legacy Jupyter security page [S12].
