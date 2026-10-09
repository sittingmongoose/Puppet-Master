# Final — S03 lab-notebooks review service (M03 critic-finalizer)

Self-contained planning deliverable for this scope: a lightweight computational notebook review
service for an academic ecology group. Mixed Python/R arrivals with data references; reviewer
laptops differ; a selected result must be reproducible without granting uploaded notebooks
unrestricted access; authorship and annotations preserved; offline export; predictable resource
use. Source IDs S01–S19 refer to the research-stage `source-map.json` + `sources/` (reused by
reference, not rebound); CF01–CF02 are this stage's independent re-verifications (own
`source-map.json` + `sources/verify-notes.md`). Prose never replaces findings with IDs alone.

Revealed thin plan (exact): P1: Store notebooks in Git. P2: Run each notebook in a Docker
container using the latest dependencies. P3: Capture stdout and HTML as proof. P4: Resolve data
URLs at execution time. P5: Show a green reproduction badge when exit code is zero. P6: Add
collaborative annotations later.

## Criticism dispositions (every finding explicitly resolved)

Material: F1 ACCEPTED — build gate asserts `R --version` equals lockfile `R.Version`, records
both; badge green requires the assert (§Build, §Badge). F2 ACCEPTED — expected-hash origin
defined: ingest author's claimed executed notebook + artifact SHA-256; green compares rerun
bytes to claimed hashes; no claim means max amber `NO_REFERENCE` (two-run determinism check
retained as option) (§Badge). F3 ACCEPTED — `result-selector` defined as cell tag(s) +
Papermill parameter set + parameter hash + named artifact path(s), recorded in RO-Crate and
badge payload; output-presence assert keys off it (§Result selector). F4 AMENDED — sandbox
tiers corrected to T0 gVisor/microVM, T1 hardened runc named profile, T2 bubblewrap/nsjail
("never silent runc" dropped as misordered); green requires T0 by default with a labeled
deployer override, never silent (§Sandbox, §Badge). F5 ACCEPTED — per-format execution table
added (ipynb→Papermill; Rmd→Rscript render with wall-clock timeout + sessionInfo; qmd→quarto
render with timeout); unsupported formats yield `FORMAT_UNSUPPORTED` (§Execution).
F6 ACCEPTED — data default is manifest + verified-fetch script when license/size unknown;
bundle bytes only when permitted and fitting (§Data). F7 ACCEPTED — badge failure-code enum
added and mapped to validations (§Badge, §Validations). F8 ACCEPTED — authorship record
defined (Git author + notebook metadata.authors + comment author IDs) and carried into RO-Crate
and export (§Review).
Minor: m1 ACCEPTED (ReviewNB vendor-claim caveat everywhere recommended); m2 ACCEPTED (no flag
implies offline; article vs reveal.js tested separately); m3 ACCEPTED (WASM decisive blockers
stated; WASM MUST NOT set badge state); m4 PARTIAL (explicit-cap + recorded-actuals mechanism
required; numeric placeholders labeled illustrative/untuned, not recommendations); m5 ACCEPTED
(Git LFS noted as considered byte transport, declined as provenance story); m6 ACCEPTED
(Marimo "dependency-ordered, no hidden out-of-order state"); m7/m8 NO CHANGE (already correct,
re-verified); m9 ACCEPTED (chain A labeled release-note summary); m10 ACCEPTED (V8 labeled
smoke). Uncertainty retained where evidence is absent (§Uncertainty). No criticism rejected
outright; F4 amended and m4 partial as explained with evidence in `critique.md`.

## Per-P disposition (exact, with O4 labels)

### P1: "Store notebooks in Git." — PARTIAL / CORRECTION + OPTIONAL ENHANCEMENT
- Already-covered: Git as versioned store for notebook source is retained.
- Correction (required): plain Git is insufficient for .ipynb review. Add nbdime content-aware
  diff/merge + git drivers (`nbdime config-git --enable --global`, `nbdiff-web`, `nbmerge-web`,
  valid-JSON conflict handling) [S04]. Preserve notebook metadata/authorship on every transform;
  never strip-and-rewrite without provenance. Keep large data out of Git; version data via
  DataLad/SHA/DOI (§Data).
- Optional enhancement: ReviewNB SaaS for PR visual diffs + cell-inline comments synced to
  GitHub (vendor claims — team list, free-for-OSS — not independently verified) [S05]; or
  self-hosted comment store. Marimo .py notebooks as git-friendlier alternative for new
  Python-only work [S16] — not a forced migration.
- Rejected: "Git alone suffices for review/history".
- Uncertain: whether the group mandates GitHub (ReviewNB fits) vs generic Git (self-hosted UI).

### P2: "Run each notebook in a Docker container using the latest dependencies." — CORRECTION + REJECTED SUBCLAUSES
- Already-covered: containerized execution is retained as the default server path.
- Correction (required): (a) Selected result, not "each notebook": execute via the
  `result-selector` (§Result selector) through the per-format path (§Execution): Papermill/
  nbclient parameterized path with injected-parameters cell, explicit `kernel_name`, cwd, and
  per-cell `timeout` — nbclient default 30 s is not a safe implicit choice and `None`/`-1`
  (unlimited) is forbidden here [S01/CF01,S02]. Distinguish kernel `start_timeout` (default
  60 s in Papermill signature) from the cell execution cap. (b) Locked envs, never "latest":
  conda-lock multi-platform solves + solveless install [S10]; explicit `@EXPLICIT` lock for
  micromamba-only builds alongside the readable lock [S18]; Python+R via REES convention
  (root/`binder/"/`.binder/`) with human-reproducible steps [S03]; R via `renv.lock`
  (`snapshot`/`restore`, R Version/Repos/Packages/Hash) [S11/CF02] plus a separate R-version
  pin (base-image digest or rig) and CRAN snapshot, with the F1 build-time `R --version` assert;
  pak only as installer inside an renv-managed project (no lockfile of its own) [S19].
  (c) Sandboxed execution per the §Sandbox tier profile, never plain Docker defaults (which are
  unconstrained with OOM risk and b/k/m/g units) [S08].
- Rejected: "latest dependencies" (non-reproducible, insecure); whole-"each notebook" runs as
  the unit (wasteful, obscures the selected result).
- Optional enhancement: Repo2Docker/BinderHub build path as convention alternative to hand
  Dockerfiles; Nix/pixi/uv noted but not primary for mixed Python/R here.
- Uncertain: exact base-image digest, R version, CRAN snapshot date, ecology native deps
  (GDAL/raster/Stan); cap values pending workload measurement (mechanism + illustrative
  placeholders in §Resources).
- User decision: T0-required hosts vs labeled weaker-tier operation with badge downgrade (§Badge).

### P3: "Capture stdout and HTML as proof." — CORRECTION + OPTIONAL ENHANCEMENT
- Already-covered: capturing outputs is retained.
- Correction (required): stdout+HTML alone is not proof. Must capture executed notebook +
  selected-result artifact bytes + SHA-256 hashes + env/data pins + timeout/cap record +
  provenance (RO-Crate JSON-LD `ro-crate-metadata.json`, schema.org, BagIt-archivable) [S14].
  Assert the `result-selector` output exists (guards the Papermill 2.0-class IOPub
  silent-success failure mode, known via release-note summary [S17], see m9). Offline HTML via
  Quarto `embed-resources` (successor to `self-contained`) with size/time cost noted [S06]; no
  flag implies offline — only a network-disabled open with zero observed requests passes, and
  article HTML vs reveal.js are tested separately [S07].
- Optional enhancement: Quarto book/HTML publishing + download tools for reviewer-friendly
  offline bundles.
- Rejected: "HTML presence equals reproduced".
- Uncertain: canonical offline format (article HTML preferred over reveal.js for the offline
  guarantee, pending per-format validation).

### P4: "Resolve data URLs at execution time." — CORRECTION + REJECTED
- Correction (required): pin data before execution, never live-resolve inside the sandbox. Use
  DataLad datasets (git+git-annex, `download-url` origin, `run`/`rerun` provenance, YODA
  subdataset SHA pin, on-demand `get`) [S15] or minimal SHA-256 + DOI pin with fetch-then-seal:
  fetch outside the sandbox (or via an allow-listed fetcher), verify hash, then execute with
  `--network=none`. Record exact commit/SHA/DOI in RO-Crate. Default: manifest + verified-fetch
  script when license/size unknown; bundle bytes only when license permits and size fits (F6).
- Rejected: execution-time URL resolution (mutable, unpinned, violates sandbox + offline +
  reproducibility).
- Optional enhancement: Zenodo DOI snapshots; DVC where DataLad is too heavy; Git LFS as plain
  byte transport (no run provenance — not the provenance story).
- User decision: per-dataset bundle-vs-manifest choice; default above applies until decided.
- Uncertain: data sizes/licenses; whether ecology data may be redistributed in offline bundles.

### P5: "Show a green reproduction badge when exit code is zero." — CORRECTION (badge logic replaced)
- Correction (required): exit 0 is necessary but not sufficient. Green only when ALL hold:
  exit 0 + `result-selector` output present + artifact hash matches the author-claimed expected
  hash (F2) + env lock digest + base-image digest + R/Python versions verified (incl. F1 R
  assert) + data SHA/DOI verified + sandbox tier T0 (default; F4) + caps/timeouts recorded +
  offline artifact (if claimed) passed network-disabled open. Else amber (partial / weak-sandbox
  / no-reference) or red, each with a machine-readable reason from the §Badge enum. This
  addresses silent success [S17], unpinned env/data (P2/P4) false greens, and undefined
  baselines (F2).
- Already-covered: only the intent (reviewer signal) is retained; none of the badge logic as-is.
- Rejected: exit-code-only green.
- Uncertain: exact badge copy/thresholds (kept as named decisions with safe defaults).

### P6: "Add collaborative annotations later." — CORRECTION (schedule + scope)
- Correction (required): annotations/authorship are MVP, not later — the brief explicitly
  requires both. Ship cell-level review comments + the F8 authorship record (Git author +
  notebook `metadata.authors` + comment author IDs) from day one (nbdime local + ReviewNB-style
  PR comments with vendor-claim caveat, or self-hosted equivalent) [S04,S05]; carry both into
  RO-Crate (`author`/`contributor`) and the offline bundle [S14].
- Optional enhancement: SaaS (fast, external data flow) vs self-hosted comment store (more
  work, data stays in group).
- User decision: SaaS-vs-self-hosted; comment retention/visibility policy.
- Rejected: "later" deferral.
- Uncertain: identity/auth for reviewers (GitHub vs local accounts).

## Retained system design (coherent, self-contained)

Pipeline: Ingest → lock → sandbox-execute selected result → verify → review → offline-export.
1. Ingest .ipynb/.qmd/.Rmd + `renv.lock`/conda-lock + data manifest + author's claimed executed
   outputs/hashes + authorship record; reject on missing pins with a coded reason; record the
   `result-selector`.
2. Build or reuse image: REES-respecting build, explicit locks, base digest recorded; run the F1
   R-version assert; test the exact install commands in the exact base.
3. Execute the selected result only, per-format (§Execution), sandboxed (§Sandbox), data
   pre-pinned and mounted read-only.
4. Verify: full §Badge gate; write RO-Crate with provenance, authorship, annotations, env/data
   digests, selector, and tier.
5. Review: nbdime diffs + cell comments (ReviewNB with caveat, or self-hosted); conflict-safe
   merges.
6. Export: Quarto `embed-resources` HTML and/or RO-Crate bundle; validate offline with network
   disabled per format; badge reflects the full gate, not exit code.

### Result selector
`result-selector` = cell tag(s) + Papermill parameter set + parameter hash + named artifact
path(s). Recorded in RO-Crate and the badge payload. The output-presence assert and the hash
comparison both key off it; a run without a resolvable selector cannot be green.

### Execution (per-format table)
- .ipynb → Papermill (`kernel_name`, cwd, per-cell nbclient `timeout`, `prepare_only` preview
  available) [S01/CF01,S02].
- .Rmd → `Rscript -e 'rmarkdown::render(...)'` under a wall-clock timeout with `sessionInfo()`
  captured to provenance; selected-result artifact = named rendered output + extracted result
  object hash.
- .qmd → `quarto render` under a wall-clock timeout; same capture rules.
- Anything else → `FORMAT_UNSUPPORTED` (amber/red per policy), never a silent skip.

### Sandbox tiers (named profiles, single profile per run)
- T0 (green-eligible): `--runtime=runsc` (Docker ≥17.09 host install [S09]) or equivalent
  microVM (Kata/Firecracker) + `--network=none --read-only --cap-drop=ALL --pids-limit
  --security-opt=no-new-privileges` + explicit `--memory/--cpus` + wall-clock timeout.
- T1 (max amber): the same flag profile on hardened runc (seccomp/AppArmor, userns where
  available) + caps + timeout.
- T2 (max amber): bubblewrap/nsjail single-host profile with equivalent denials, explicitly
  labeled. Default policy: green requires T0; a deployer may allow T1-green only via an
  explicit documented override that the badge discloses (tier + override flag). Never silent.

### Build (lock fidelity + F1 assert)
conda-lock solveless install (explicit lock on micromamba paths) [S10,S18]; `renv::restore()`
+ CRAN snapshot + `R --version`-vs-lockfile assert [S11/CF02,S19]; base-image digest recorded.
Any solve-at-build, snapshot drift, or R mismatch fails the build gate (`PIN_MISSING` /
`R_VERSION_MISMATCH`).

### Badge gate + failure-code enum
Green = exit 0 ∧ selector output present ∧ hash == claimed ∧ env/base/R/Python/data verified ∧
T0 (or disclosed override) ∧ caps recorded ∧ offline-if-claimed passed. Otherwise the most
informative code wins: `TIMEOUT`, `OOM_LIMIT`, `OUTPUT_MISSING`, `HASH_MISMATCH`,
`NO_REFERENCE`, `PIN_MISSING`, `R_VERSION_MISMATCH`, `DATA_HASH_MISMATCH`,
`DATA_LICENSE_UNKNOWN`, `DATA_FETCH_FAILED`, `WEAK_SANDBOX`, `OFFLINE_EXPORT_FAILED`,
`FORMAT_UNSUPPORTED`, `PARAM_MISMATCH`. Amber = partial/weaker-evidence (incl. `NO_REFERENCE`,
`WEAK_SANDBOX`); red = failed verification. Badge payload carries selector, digests, tier,
reason code, and provenance link.

### Review (diff/annotations/authorship)
nbdime content-aware diff/merge with git drivers [S04]; cell-level comments via ReviewNB
(vendor claims unverified — m1) or self-hosted store; Marimo .py (dependency-ordered, no hidden
out-of-order state) for new Python-only work as an option, Jupyter retained for mixed/R
arrivals [S16]. F8 authorship record preserved end-to-end into RO-Crate/export.

### Data
Fetch-then-seal outside the sandbox; DataLad preferred for provenance/nesting [S15], DVC or
DOI+SHA manifest where lighter; default manifest-first (F6); every byte verified before mount;
pins recorded in RO-Crate.

### Resources
Every run declares wall-clock, per-cell timeout, memory, CPU, and PID caps; actuals are
recorded in provenance. Illustrative untuned placeholders ONLY (NOT recommendations — m4):
e.g. per-cell timeout on the order of minutes rather than the 30 s library default, per-run
wall clock on the order of tens of minutes, memory/CPU/PIDs set from the smallest host in the
group. Implementers must measure ecology workloads and replace these before any claim of
predictability. Docker defaults are unconstrained [S08]; shipping without explicit caps is a
release-blocking defect.

### Offline export
Quarto `embed-resources` HTML and/or RO-Crate bundle [S06,S14]; no flag implies offline (m2);
each claimed format passes a network-disabled open with zero observed requests, rendering
math/plots and preserving authorship/annotations; article HTML and reveal.js validated
separately [S07].

## Alternatives retained (not collapsed)
- Server sandbox (T0>T1>T2) vs browser WASM preview vs no-execution review. WASM
  (Pyodide/JupyterLite + separate WebR runtime) suits small dependency-free previews but cannot
  carry threads/multiprocessing/sockets, native R/Python stacks, or CORS-restricted fetches;
  streaming only in Worker + cross-origin-isolated contexts; CDN dependence; version skew
  observed [S12,S13]. WASM is an optional preview and MUST NOT set badge state (m3).
  No-execution review (diff + provenance only) cannot satisfy "reproduce a selected result".
- DataLad vs DVC vs DOI+SHA manifest (vs LFS byte transport): DataLad strongest
  provenance/nesting; DVC simpler; manifest minimal; LFS carries bytes only. All beat live URLs.
- Marimo vs Jupyter: Marimo dependency-ordered/git-friendly/script-runnable [S16] for new
  Python work; Jupyter required for mixed Python/R arrivals.
- Repo2Docker/REES [S03] vs hand Dockerfiles; Quarto vs nbconvert minimalism; SaaS vs
  self-hosted comments; T0-required vs labeled weaker-tier operation.

## Conditions and original constraints (must survive)
No unrestricted access for uploads; heterogeneous laptops normalized by locks+containers, never
by "install latest"; authorship/annotations preserved end-to-end; resource use explicit and
capped; offline export truly offline (validated, not flagged); selected-result scope, not
whole-project rerun.

## Disagreement preserved
SaaS review vs self-hosted; DataLad depth vs simplicity; Quarto vs nbconvert; T0-required vs
labeled weaker tiers with downgrade; reference-comparison (default) vs two-run determinism
check where authors submit no claim; Marimo-vs-Jupyter for new work.

## Uncertainty preserved
Exact package/R/base versions, CRAN date, data sizes/licenses, reviewer hardware, badge
copy/thresholds, auth model, canonical offline format, tuned cap values. Each is a named
decision with a safe default (pin everything, deny by default, amber max on weak evidence,
manifest-first on unknown data). No billing/usage evidence observed (null).

## O3 — Issue/fix/regression/evolution chains
- Chain A (silent success): Papermill 2.0/nbclient 0.1 release note describes IOPub timeouts
  changing from warn-and-continue to error [S17] — release-note summary, not a verified
  issue/CVE number (m9). Before: heavy-output runs could lose outputs/failures yet report
  success. Design response (independent of the note's precision): output-presence assert keyed
  to the `result-selector` + artifact-hash comparison on every green.
- Chain B (offline leak): Quarto #9404 — `embed-resources` + math flags still required network
  for reveal.js [S07]. Response: no-flag-implies-offline rule + per-format network-disabled
  validation.
- Chain C (lock-install mismatch): conda-lock v1 YAML vs micromamba explicit spec [S18].
  Response: emit/test the exact install command and lock format in the exact base image.
- Absent/inapplicable: no verified ecology-specific notebook CVE chain claimed; no
  billing/usage chain observed (null); no notebook-triggered sandbox-escape chain asserted.

## Validations: executed vs proposed (honest, discriminating, scoped to this brief)

Executed (read-only): inspected brief + full predecessor drafts + S01–S19 evidence via declared
source root; independently re-fetched CF01–CF02 with locators/excerpts in `sources/`. No
containers built, no notebooks executed, no network-disabled rendering run, no sandbox invoked.
No qualified witness sandbox was available; no execution is claimed at any stage.

Proposed (each fails for a distinct real defect; run at build/review; mapped to badge codes):
1. Timeout semantics → `TIMEOUT`: `sleep(timeout+5)` cell fails as timeout (not generic
   error); `prepare_only` renders parameters without executing.
2. Silent-success guard → `OUTPUT_MISSING`/`HASH_MISMATCH`: IOPub-flood notebook must fail
   loudly or complete with selector outputs present and hash-matching the claim.
3. Reference-missing → `NO_REFERENCE`: run with no author-claimed outputs yields max amber,
   never green; determinism double-run option compared and reported.
4. Sandbox denial → `WEAK_SANDBOX`/deny: `/etc/passwd` read, outbound HTTP, fork bomb all
   denied/killed; record the denying layer per probe and the tier in the badge.
5. Lock fidelity → `PIN_MISSING`/`R_VERSION_MISMATCH`: clean-host rebuild with
   frozen/explicit install + `renv::restore()` + R-version assert; any solve-at-build fails.
6. Data pin → `DATA_HASH_MISMATCH`: byte-swapped data with same filename fails the hash gate;
   unknown-license data follows the manifest-first path (`DATA_LICENSE_UNKNOWN` if blocked).
7. Offline export → `OFFLINE_EXPORT_FAILED`: network-disabled open of HTML/RO-Crate shows zero
   requests, renders math/plots, preserves authorship/annotations; article HTML and reveal.js
   tested separately.
8. Diff/merge → review path: nbdime diff shows cell change + comment; conflicted merge remains
   valid viewable JSON; authorship record survives the round-trip.
9. Resource envelope (smoke) → `OOM_LIMIT`/`TIMEOUT`: 3× same-result runs under fixed caps stay
   within the declared envelope; OOM breach yields a clear limit message, no host instability.
10. WASM boundary (negative): native/R-heavy notebook in WASM preview yields explicit
    unsupported + server-reproduction fallback, never a hang; badge state untouched.
11. Provenance round-trip → `PARAM_MISMATCH`/`HASH_MISMATCH`: export crate + SHAs, reimport on
    a second machine, reproduce a hash-identical selected result for the same selector.

No unlimited production guarantees are claimed; scope is this small ecology-group review
service. Later work may correct this final; every correction must preserve or explicitly
re-disposition the findings, conditions, options, and uncertainty above.
