# Discovery — S03 lab-notebooks review service (pre-plan, from brief alone)

Scope: lightweight computational notebook review service for academic ecology group. Mixed Python/R arrivals with data references; heterogeneous laptops; reviewers reproduce a *selected result* without granting uploaded notebooks unrestricted access; preserve authorship/annotations; offline export; predictable resources; investigate tools + environment/history evidence. Obligations O1–O6 equal in both arms. Plan not yet revealed; no P-clause comparison here (O4 deferred to draft.md after freeze/reveal).

## 1. Constraints derived from brief (no plan read)

- Selected-result reproduction, not whole-project rerun: needs cell/tag/parameter selection + provenance of which result.
- Untrusted upload: must sandbox execution (deny network/host FS by default, cap CPU/RAM/PIDs/time, no privileged caps).
- Mixed Python/R + differing laptops: needs locked envs per language + container or equivalent; R version must be pinned outside renv.
- Data references: must pin exact data version (hash/commit/DOI), support on-demand fetch, avoid embedding large data in notebook JSON.
- Authorship/annotations: must preserve notebook metadata, cell authors, review comments; diffs must be content-aware not line-JSON.
- Offline export: must produce network-independent artifact; validate with network disabled, not by flag name.
- Predictable resources: must set explicit timeouts + memory/CPU/PID caps; defaults are unsafe (Docker unconstrained, nbclient 30 s per-cell may be too short/long depending on ecology workloads).

## 2. O1 — Useful unfamiliar tools/products/approaches (beyond obvious Jupyter+Docker)

Review/diff/annotation:
- nbdime 4.0.4 [S04]: local content-aware diff/merge, git drivers, valid-JSON conflicted notebooks, image diffs, execution-counter auto-resolve. Unfamiliar to groups using plain `git diff` on .ipynb.
- ReviewNB [S05]: SaaS GitHub App, PR visual side-by-side, cell-inline comments synced to GitHub. Different approach from local-only review: outsourced rendering/comment store.
- Marimo [S16]: reactive Python notebooks stored as .py, deterministic order, no hidden state, git-friendly, script-runnable, WASM-capable. Materially different from .ipynb JSON model; Python-only.
- Quarto [S06]: .qmd/.ipynb → HTML/PDF/Word/books/presentations with `embed-resources` single-file path + book download tools. Different from nbconvert-only export.

Reproducible execution/env:
- Repo2Docker/REES + BinderHub [S03]: convention-over-config build from root/`binder/`/`.binder/` config files into Docker images; human-reproducible without tooling. Unfamiliar vs hand-written Dockerfiles.
- Papermill + nbclient [S02,S01,S17]: parameterized selected-result execution via injected-parameters cell, CLI `-p`, per-cell timeouts. Different from manual "run all".
- conda-lock + micromamba explicit locks [S10,S18]: multi-platform solves, solveless install; explicit `@EXPLICIT` spec for micromamba-only paths.
- renv + pak + rig split [S11,S19]: renv snapshots `renv.lock` (R version/Repos/Packages/Hash) but does not manage R versions; pak accelerates installs without lockfile; rig (or container base) pins R itself.
- Nix/pixi/uv noted as alternatives but not primary-selected: stronger hermeticity (Nix) vs operational cost; pixi/uv fast but R story weaker than conda-lock+renv for this mixed brief.

Sandbox/preview:
- gVisor runsc [S09]: user-space kernel boundary via `--runtime=runsc`, pairs with `--network=none --read-only --cap-drop=ALL --pids-limit --security-opt=no-new-privileges` + caps + timeout. Different from plain runc/Docker.
- Lightweight OS sandboxes (bubblewrap/nsjail/systemd-nspawn) noted as lower-dependency alternative where Docker/gVisor unavailable; weaker boundary than gVisor/microVM, must be stated.
- Browser WASM preview: JupyterLite+Pyodide [S12,S13] for Python, WebR for R as separate runtime. Different approach: move untrusted execution to reviewer's browser sandbox instead of server. Limited by no threading/multiprocessing/sockets, CORS, CDN dependence, R/Python runtime split and version caps.

Packaging/provenance/data:
- RO-Crate 1.1 + BagIt [S14]: directory + `ro-crate-metadata.json` JSON-LD (schema.org), Identity/Aggregation/Annotation, just-enough provenance, layered validation. Different from ad-hoc zip export.
- DataLad [S15]: git+git-annex datasets, `download-url` origin preservation, `run/rerun` provenance, YODA subdataset SHA pinning, on-demand `get`. Direct fit for "data references + laptops differ".
- Zenodo/DOI + DVC/CML noted: DOI for immutable data snapshots; DVC for Git-adjacent data versioning where DataLad is too heavy.

Resource predictability:
- Docker/cgroup caps [S08]: explicit `--memory/--cpus/--pids-limit`, OOM behavior, suffix units b/k/m/g, kernel-support checks. Different from trusting notebook kernel defaults.

## 3. O2 — Consequential primary-source behavior, defaults, units, limits, applicability

- nbclient [S01]: `timeout` seconds per cell, default 30; `None`/`-1` disables. `kernel_name` overrides metadata. `resources.metadata.path` sets cwd. Applicability: 30 s will kill legitimate ecology cells (model fits, raster IO); must set per-review timeout explicitly and surface timeout vs failure distinctly. Unlimited (`None`) is unsafe for review service.
- Papermill [S02,S17]: `execute_notebook(..., start_timeout=60, request_save_on_cell_execute=True, ...)`. `start_timeout` is kernel-startup wait, not cell cap; cell cap comes from nbclient `timeout`/`--execute-timeout`. `prepare_only` renders parameters without executing — useful for reviewer preview of selected-result parameters. Must not conflate startup vs execution timeouts.
- Docker limits [S08]: default unconstrained; OOM kills container (or worse, host pressure) unless capped. Units: int + b/k/m/g. Must set memory+CPU+PIDs+wall-clock for every reproduction; check `docker info` for missing swap/cgroup support; document host requirements.
- gVisor [S09]: needs Docker ≥17.09, registered `runsc` runtime, invoked per-container. Not a drop-in flag: host must install/configure runtime; some syscalls/perf gaps vs runc. Applicability: best server-side default for untrusted notebooks where available; fallback must be explicit weaker sandbox, never silent runc.
- conda-lock [S10,S18]: lock once per platform set, install without solve. For micromamba-only image builds prefer explicit lock (`conda-linux-64.lock`); keep human-readable `conda-lock.yml` as reference. Pin Python + binary deps; pip section still needs hashes where used.
- renv [S11,S19]: `renv.lock` records R version + repos + package Version/Source/Repository/Hash; `snapshot()` from installed library, `restore()` reinstalls. Does not install/manage R itself; pak changes DESCRIPTION Remote fields and thus record shape. Must pin R via base image/rig + CRAN snapshot (Posit Package Manager/MRAN date) or restore drifts.
- Quarto offline [S06,S07]: `embed-resources: true` inlines assets but increases size/time; legacy `self-contained` naming changed. Even with math-embed flags, reveal.js/math may still fetch from network (issue #9404) — offline must be tested by opening with network disabled and inspecting requests, not by config presence.
- nbdime [S04]: git integration via single `config-git --enable --global`; web diff/merge tools separate from terminal. Merge driver preserves notebook validity under conflict. Applies to reviewer history/diff, not execution.
- Pyodide/JupyterLite/WebR [S12,S13]: no threads/multiprocessing/sockets; removed modules (venv, tkinter, syslog, resource, etc.); sync HTTP via browser subject to CORS, no cert/proxy control; streaming only in Worker + cross-origin-isolated context. R needs WebR, not Pyodide; version skew observed (`jupyterlite-webr <0.7` vs core 0.8.x). Applicability: suitable for small dependency-free previews, not for mixed Python/R + GDAL/raster/native-code ecology workloads.
- RO-Crate/DataLad [S14,S15]: RO-Crate describes/links entities; DataLad versions/retrieves bytes + provenance. Together: DataLad pins bytes by SHA, RO-Crate describes authorship/annotations/result-selection/provenance for export. Neither executes code.

## 4. O3 — Issue/fix/regression/release chains (independent)

- Chain A (selected-result silent success): Papermill 2.0/nbclient 0.1 changed IOPub timeouts from warn-and-continue to error [S17]. Before: heavy-print loops could trigger IOPub timeout, lose outputs/failures, yet report success. After: raises, failing the run. Fix relevance: review service must treat missing-output success as failure, pin nbclient/Papermill versions, and add output-presence assertions for selected result.
- Chain B (offline export leak): Quarto #9404 [S07] — `embed-resources` + `self-contained-math` still required internet for reveal.js. Shows format-specific dependency leaks. Fix posture: per-format offline validation (block network, reload, check console/requests), prefer HTML article over reveal.js for offline guarantee, record Quarto version.
- Chain C (lock-install mismatch): conda-lock v1 YAML vs micromamba explicit spec [S18]. Symptom: setup-micromamba path rejected v1 lock; fix: emit explicit `conda-linux-64.lock` for install while retaining readable lock. Relevance: build must test the exact install command in the exact base image, not just `conda-lock --check`.
- Absent/inapplicable: no verified ecology-specific notebook CVE chain claimed; no billing/usage chain observed (null). gVisor compatibility gaps are documented generally but no single notebook-triggered escape chain is asserted here.

## 5. O5 retained (pre-plan): alternatives, conditions, disagreement, uncertainty

- Alternatives retained: (a) server sandbox (gVisor>plain Docker> bubblewrap/nsjail) vs (b) browser WASM preview vs (c) no-execution review (diff+provenance only). These are not interchangeable: WASM cannot carry R/native stacks; no-execution cannot satisfy "reproduce selected result".
- Conditions: locked envs required for any reproducibility claim; data SHA/DOI required; timeouts+caps required; offline artifact must be validated offline; authorship must survive export (RO-Crate + notebook metadata + review comments).
- Disagreement: Marimo-vs-Jupyter (determinism/git-friendliness vs ecosystem/R support); DataLad-vs-DVC-vs-DOI-only (provenance depth vs learning curve); Quarto-vs-nbconvert (rich publishing vs minimal dependency).
- Uncertainty: exact ecology package set (raster/GDAL/Stan/BRT?) unknown — native deps dominate image size/build time; reviewer hardware unknown — caps must be conservative + configurable; R version + CRAN snapshot date unknown — must be chosen and recorded; whether "offline export" includes data bytes or code+provenance only — keep both paths until decided.

## 6. O6 — Discriminating validations: executed vs proposed (honest)

Executed in this research stage (no runtime witness claimed):
- Read-only primary-source inspection of 19 sources (S01–S19) with locators and excerpts in `sources/`; no code executed, no containers built, no network-disabled rendering run. No qualified sandbox invoked.

Proposed discriminating checks for build/review (must run later, each distinguishes a real failure):
1. Timeout semantics: notebook with `sleep(cell_timeout+5)` fails distinctly as timeout, not generic error; Papermill `prepare_only` renders injected parameters without execution.
2. Silent-success guard: IOPub-flooding notebook (tight print loop) either completes with outputs present or fails loudly; assert selected-result output cell exists and hash-matches expected artifact.
3. Sandbox denial: upload attempts host-FS read (`/etc/passwd`), outbound HTTP, fork bomb; expect deny/kill under `--network=none --read-only --cap-drop=ALL --pids-limit` + runsc where available; record which layer denied each.
4. Lock fidelity: rebuild image from lockfiles on clean host with `--frozen`/explicit install; `conda-lock --check`/micromamba explicit install + `renv::restore()` + R version assert; fail on any solve-at-build.
5. Data pin: swap data file bytes without changing name; reproduction must fail hash/SHA check, not silently use new bytes; `datalad get` fetches exact pinned commit.
6. Offline export: open exported HTML/RO-Crate with network disabled (airplane + local proxy block); assert zero network requests, math/plots render, authorship/annotations present; test both article HTML and any reveal.js variant separately.
7. Diff preservation: `nbdime` diff of annotated notebook shows cell-level change + comment; conflicted merge stays valid JSON openable in viewer.
8. Resource predictability: same selected result 3× under fixed caps records wall/CPU/RAM within declared envelope; OOM-limit breach yields clear "limit exceeded" not host instability.
9. WASM boundary (negative): attempt native/R-heavy notebook in Pyodide/WebR preview; expect explicit unsupported message, not hang; fallback offers server reproduction.
10. Provenance round-trip: export RO-Crate + DataLad SHA, reimport on second machine, reproduce selected result hash-identically.

O4 note: per-P dispositions, corrections, optional enhancements, user decisions, already-covered/rejected/uncertain findings will be written in `draft.md` only after `plan-reveal.json` freeze and `revealed-plan.md` read. This discovery file must not be rewritten after reveal.
