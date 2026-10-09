# Draft — S03 lab-notebooks review service (researcher draft, post-reveal)

This is a complete planning deliverable for this scope; later stages may correct it. It compares every exact P clause from `revealed-plan.md` against independent pre-reveal discovery (`discovery.md`, frozen by `plan-reveal.json`) and retains alternatives, conditions, constraints, disagreement, uncertainty, and validations in one self-contained text. Source IDs (S01–S19) refer to `source-map.json` + `sources/`; prose here does not replace findings with IDs alone.

Revealed thin plan (exact):
P1: Store notebooks in Git. P2: Run each notebook in a Docker container using the latest dependencies. P3: Capture stdout and HTML as proof. P4: Resolve data URLs at execution time. P5: Show a green reproduction badge when exit code is zero. P6: Add collaborative annotations later.

## Per-P disposition (exact, with O4 labels)

### P1: "Store notebooks in Git." — PARTIAL / CORRECTION + OPTIONAL ENHANCEMENT
- Already-covered: Git as versioned store for notebook source is retained.
- Correction (required): plain Git is insufficient for .ipynb review. Add nbdime content-aware diff/merge + git drivers (`nbdime config-git --enable --global`, `nbdiff-web`, `nbmerge-web`, valid-JSON conflict handling) [S04]. Preserve notebook metadata/authorship on every transform; never strip-and-rewrite without provenance. Keep large data out of Git; version data via DataLad/SHA/DOI (see P4).
- Optional enhancement: ReviewNB SaaS for PR visual diffs + cell-inline comments synced to GitHub [S05]; or self-hosted comment store. Marimo .py notebooks as git-friendlier alternative for new Python-only work [S16] — not a forced migration.
- Rejected: none of P1 itself; rejected is "Git alone suffices for review/history".
- Uncertain: whether group mandates GitHub (ReviewNB fits) vs generic Git (needs self-hosted review UI).

### P2: "Run each notebook in a Docker container using the latest dependencies." — CORRECTION + REJECTED SUBCLAUSES
- Already-covered: containerized execution is retained as the default server path.
- Correction (required):
  - Selected result, not "each notebook": execute via Papermill/nbclient parameterized path with injected-parameters cell, explicit `kernel_name`, cwd, and per-cell `timeout` (nbclient default 30 s is not a safe implicit choice; `None`/`-1` disables and is forbidden here) [S01,S02]. Distinguish kernel `start_timeout` (default 60 s in Papermill signature) from cell execution cap.
  - Locked envs, never "latest": conda-lock multi-platform solves + solveless install [S10]; for micromamba-only builds use explicit `@EXPLICIT` lock alongside readable lock [S18]; Python+R via REES convention (root/`binder/`/`.binder/`) with human-reproducible steps [S03]; R via `renv.lock` (`snapshot`/`restore`, R Version/Repos/Packages/Hash) [S11] plus separate R-version pin (base-image digest or rig) and CRAN snapshot; pak only as installer inside renv-managed project (no lockfile of its own) [S19].
  - Sandbox hardening, never plain Docker defaults (which are unconstrained with OOM risk and b/k/m/g units) [S08]: `--runtime=runsc` where available (Docker ≥17.09) [S09], plus `--network=none --read-only --cap-drop=ALL --pids-limit --security-opt=no-new-privileges`, explicit `--memory/--cpus`, wall-clock timeout, no privileged caps. Fallback to bubblewrap/nsjail only as explicit weaker tier, never silent runc.
- Rejected: "latest dependencies" (non-reproducible, insecure); "each notebook" whole-run as the unit (wastes resources, obscures selected result).
- Optional enhancement: Repo2Docker/BinderHub build path as convention alternative to hand Dockerfiles; Nix/pixi/uv noted but not primary for mixed Python/R here.
- Uncertain: exact base-image digest, R version, CRAN snapshot date, ecology native deps (GDAL/raster/Stan); caps values pending workload measurement.
- User decision: gVisor-required hosts vs support weaker-sandbox hosts with explicit badge downgrade.

### P3: "Capture stdout and HTML as proof." — CORRECTION + OPTIONAL ENHANCEMENT
- Already-covered: capturing outputs is retained.
- Correction (required): stdout+HTML alone is not proof. Must capture executed .ipynb + selected-result artifact bytes + SHA-256 hashes + env/data pins + timeout/cap record + provenance (RO-Crate JSON-LD `ro-crate-metadata.json`, schema.org, BagIt-archivable) [S14]. Assert selected-result output cell exists (guards Papermill 2.0-class IOPub silent-success regression where warn-and-continue could report success with lost outputs [S17]). Offline HTML via Quarto `embed-resources` (successor to `self-contained`) with size/time cost noted [S06], but offline must be validated per format.
- Optional enhancement: Quarto book/HTML publishing + download tools for reviewer-friendly offline bundle.
- Rejected: "HTML presence equals reproduced".
- Uncertain: which HTML format is canonical (article HTML preferred over reveal.js for offline; reveal.js/math showed network leak even with embed flags [S07]).

### P4: "Resolve data URLs at execution time." — CORRECTION + REJECTED
- Correction (required): pin data before execution, never live-resolve inside sandbox. Use DataLad datasets (git+git-annex, `download-url` origin, `run/rerun` provenance, YODA subdataset SHA pin, on-demand `get`) [S15] or minimal SHA-256 + DOI pin with fetch-then-seal: fetch outside sandbox (or allow-listed fetcher), verify hash, then execute with `--network=none`. Record exact commit/SHA/DOI in RO-Crate.
- Rejected: execution-time URL resolution (mutable, unpinned, violates sandbox + offline + reproducibility).
- Optional enhancement: Zenodo DOI snapshots; DVC where DataLad is too heavy.
- User decision: does offline export bundle data bytes or code+provenance+fetch manifest only? Support both; default to manifest + verified-hash fetch script when data is large/restricted.
- Uncertain: data sizes/licenses; whether ecology data can be redistributed in offline bundle.

### P5: "Show a green reproduction badge when exit code is zero." — CORRECTION (badge logic replaced)
- Correction (required): exit 0 is necessary but not sufficient. Green only when ALL hold: exit 0 + selected-result output present + artifact hash matches expected + env lock digest + base-image digest + R/Python versions verified + data SHA/DOI verified + sandbox tier + caps/timeouts recorded + offline artifact (if claimed) passed network-disabled open. Else amber (partial/weak-sandbox) or red with machine-readable reason. This directly addresses silent-success [S17] and unpinned-env/data (P2/P4) false greens.
- Already-covered: none of the badge logic is retained as-is; the *intent* (reviewer signal) is retained.
- Rejected: exit-code-only green.
- Uncertain: exact badge copy/thresholds; whether weak-sandbox success may ever show green (recommendation: no — amber max).

### P6: "Add collaborative annotations later." — CORRECTION (schedule + scope)
- Correction (required): annotations/authorship are MVP, not later — brief explicitly requires preserve authorship and annotations. Ship cell-level review comments + authorship metadata from day one (nbdime local + ReviewNB-style PR comments or self-hosted equivalent) [S04,S05]; carry annotations into RO-Crate/export [S14].
- Optional enhancement: choice of SaaS (ReviewNB, fast but external data flow) vs self-hosted comment store (more work, data stays in group).
- User decision: SaaS-vs-self-hosted for comments; comment retention/visibility policy.
- Rejected: "later" deferral.
- Uncertain: identity/auth for reviewers (GitHub vs local accounts).

## Retained system sketch (coherent, self-contained)

Ingest → lock → sandbox-execute selected result → verify → review → offline-export:
1. Ingest .ipynb/.qmd/.Rmd + `renv.lock`/conda-lock + data manifest; reject on missing pins with clear message; record authorship.
2. Build or reuse image: REES-respecting build, explicit locks, base digest recorded; test exact install commands in exact base.
3. Execute selected result only: Papermill parameters + nbclient timeouts, sandboxed (runsc + no-net + read-only + caps + PIDs + wall clock), data pre-pinned and mounted read-only.
4. Verify: exit 0 + output presence + hash match + pin verification; write RO-Crate with provenance, annotations, env/data digests.
5. Review: nbdime diffs + cell comments (ReviewNB or self-hosted); conflict-safe merges.
6. Export: Quarto `embed-resources` HTML and/or RO-Crate bundle; validate offline with network disabled; badge reflects full gate, not exit code.

Alternatives retained (not collapsed):
- Server sandbox vs browser WASM preview vs no-execution review. WASM (Pyodide/JupyterLite + separate WebR runtime) suits small dependency-free previews but cannot carry threads/multiprocessing/sockets, native R/Python stacks, or CORS-restricted fetches; streaming only in Worker + cross-origin-isolated contexts; version skew observed [S12,S13]. Use WASM as optional preview, never as reproduction proof for this brief.
- DataLad vs DVC vs DOI+SHA manifest: DataLad strongest provenance/nesting; DVC simpler; manifest minimal. All beat live URLs.
- Marimo vs Jupyter: Marimo deterministic/git-friendly/script-runnable [S16] for new Python work; Jupyter required for mixed Python/R arrivals.

Conditions and original constraints (must survive):
- No unrestricted access for uploads; heterogeneous laptops normalized by locks+containers, not by "install latest"; authorship/annotations preserved end-to-end; resource use explicit and capped; offline export truly offline.

Disagreement preserved:
- SaaS review vs self-hosted; DataLad depth vs simplicity; Quarto vs nbconvert minimalism; gVisor-required vs weak-sandbox-allowed-with-amber.

Uncertainty preserved:
- Exact package/R/base versions, CRAN date, data sizes/licenses, reviewer hardware, badge thresholds, auth model. Each is a named decision with a safe default (pin everything, deny by default, amber max on weak evidence).

## Validations: executed vs proposed (honest, discriminating, scoped to this brief)

Executed in research (read-only):
- Inspected S01–S19 primary sources with locators/excerpts in `sources/`; froze `discovery.md` before reveal (see `plan-reveal.json`). No containers built, no notebooks executed, no network-disabled rendering run, no sandbox invoked. No qualified witness sandbox was available; no execution is claimed.

Proposed (each fails for a distinct real defect; run at build/review):
1. Timeout semantics: `sleep(timeout+5)` cell fails as timeout (not generic error); `prepare_only` renders parameters without executing.
2. Silent-success guard: IOPub-flood notebook must fail loudly or complete with outputs present; assert selected-result cell + artifact hash.
3. Sandbox denial: `/etc/passwd` read, outbound HTTP, fork bomb all denied/killed; record denying layer per probe.
4. Lock fidelity: clean-host rebuild with frozen/explicit install + `renv::restore()` + R-version assert; any solve-at-build fails.
5. Data pin: byte-swapped data with same filename must fail hash/SHA gate, not silently pass.
6. Offline export: network-disabled open of HTML/RO-Crate shows zero requests, renders math/plots, preserves authorship/annotations; test article HTML and reveal.js separately.
7. Diff/merge: nbdime diff shows cell change + comment; conflicted merge remains valid viewable JSON.
8. Resource envelope: 3× same-result runs under fixed caps stay within declared wall/CPU/RAM; OOM breach yields clear limit message, no host instability.
9. WASM boundary (negative): native/R-heavy notebook in WASM preview yields explicit unsupported + server-reproduction fallback, not hang.
10. Provenance round-trip: export crate + SHA, reimport on second machine, reproduce hash-identical selected result.

No unlimited production guarantees are claimed; scope is this small ecology-group review service. Later stages may correct this draft.
