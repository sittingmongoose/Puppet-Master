# Final — S03 lab-notebooks review service (M03 critic-finalizer complete final)

Self-contained coherent final for this scope. Supersedes `draft.md` as the planning deliverable; `discovery.md` remains frozen pre-reveal evidence (see `plan-reveal.json`). Incorporates all critic dispositions from `critique.md` (C1–C9, all accepted, none rejected, no findings dropped). Source IDs S01–S19 ground claims via `source-map.json` + `sources/`; prose below stands alone.

Brief: lightweight computational notebook review service for academic ecology group; mixed Python/R with data references; heterogeneous laptops; reviewers reproduce a selected result without unrestricted access; preserve authorship/annotations; offline export; predictable resources.

## 1. Exact per-P dispositions (O4)

P1 "Store notebooks in Git." — PARTIAL / CORRECTION + OPTIONAL ENHANCEMENT.
Retain Git for source. Require nbdime content-aware diff/merge + git drivers (`config-git --enable --global`, `nbdiff-web`, `nbmerge-web`, valid-JSON conflicts, image diffs, counter auto-resolve) [S04]. Preserve notebook metadata/authorship on every transform. Keep large data out of Git (see P4). Optional: ReviewNB SaaS for PR visual diffs + cell-inline comments synced to GitHub (vendor claims teams/free-for-OSS not independently verified) [S05], or self-hosted comment store; Marimo .py for new Python-only work as git-friendlier reactive alternative (deterministic, script-runnable, WASM-capable, Python-only) [S16]. Rejected: "Git alone suffices". Uncertain: GitHub-mandated vs generic-Git review UI.

P2 "Run each notebook in a Docker container using the latest dependencies." — CORRECTION + REJECTED SUBCLAUSES.
Retain containerized execution as default server path. Reject "latest dependencies" and "each notebook" whole-run. Require: (a) selected-result execution via Papermill/nbclient (injected-parameters cell, CLI `-p`, explicit `kernel_name`, cwd; `start_timeout` 60 s is kernel-startup wait, cell cap is separate nbclient `timeout`, default 30 s, `None`/`-1` disables and is forbidden) [S01,S02]; (b) locked envs: conda-lock multi-platform solves + solveless install [S10] with explicit `@EXPLICIT` lock for micromamba-only builds alongside readable lock [S18]; REES placement (root/`binder/`/`.binder/`) human-reproducible [S03]; R via `renv.lock` snapshot/restore (R Version/Repos/Packages/Hash) [S11] plus separate R-version pin (base-image digest or rig) + CRAN snapshot, pak only as installer (no lockfile) [S19], with explicit `R --version` assert + record at build (C1); (c) single named sandbox profile (C2): `--runtime=runsc` where available (Docker ≥17.09) [S09] + `--network=none --read-only --cap-drop=ALL --security-opt=no-new-privileges --pids-limit --memory --cpus` (units b/k/m/g, default unconstrained with OOM risk) [S08] + wall-clock timeout. Weaker tiers (bubblewrap/nsjail/plain runc) MUST max at amber with tier label; only runsc-or-stronger may show green. Optional: Repo2Docker/BinderHub builds; Nix/pixi/uv noted, not primary for mixed R. Uncertain: base digest, R version, CRAN date, native deps. User decision: gVisor-required hosts vs allow weak-tier amber.

P3 "Capture stdout and HTML as proof." — CORRECTION + OPTIONAL ENHANCEMENT.
Retain output capture. Require executed .ipynb + selected-result artifact bytes + SHA-256 + env/data pins + sandbox/tier + caps/timeouts + provenance in RO-Crate JSON-LD (`ro-crate-metadata.json`, schema.org, BagIt-archivable, just-enough provenance) [S14]. Assert selected-result output presence (guards Papermill 2.0/nbclient IOPub warn→error silent-success class [S17]). Offline HTML via Quarto `embed-resources` (successor to `self-contained`, size/time cost) + book download tools [S06], with rule: no flag implies offline; only network-disabled open with zero requests passes, article HTML and reveal.js tested separately (reveal.js/math leaked network even with embed flags, #9404) [S07] (C5). Rejected: "HTML presence equals reproduced". Uncertain: canonical HTML format (prefer article HTML for offline).

P4 "Resolve data URLs at execution time." — CORRECTION + REJECTED.
Reject live resolution in sandbox. Require pin-before-execute: DataLad (git+git-annex, `download-url` origin, `run/rerun` provenance, YODA SHA pin, on-demand `get`) [S15] or SHA-256+DOI pin with fetch-then-seal outside sandbox (or allow-listed fetcher), hash-verified, mounted read-only, recorded in crate. Safe default (C8): manifest + verified-fetch script when license/size unknown; bundle bytes only when permitted and fitting. Optional: Zenodo DOI snapshots; DVC where DataLad too heavy. User decision: bundle-vs-manifest default per collection. Uncertain: sizes/licenses.

P5 "Show a green reproduction badge when exit code is zero." — CORRECTION (logic replaced).
Exit 0 necessary, not sufficient. Green MUST require all: exit 0 + `result-selector` output present + artifact hash match + env lock + base digest + Python/R versions (incl. R assert) verified + data SHA/DOI verified + sandbox tier = runsc-or-stronger + caps/timeouts recorded + offline artifact (if claimed) passed network-disabled open. Else amber/red with machine-readable reason. `result-selector` (C3) = cell tags + Papermill parameter hash + named artifact paths, recorded in crate + badge payload, so different selections cannot share a green. Failure codes (C7): TIMEOUT, OOM_LIMIT, MISSING_OUTPUT, HASH_MISMATCH, PIN_MISSING, R_MISMATCH, WEAK_SANDBOX, OFFLINE_FAIL, WASM_UNSUPPORTED (never badge-setting). Rejected: exit-only green. Uncertain: badge copy; weak-tier never green is a MUST.

P6 "Add collaborative annotations later." — CORRECTION (MVP, not later).
Brief requires authorship/annotations; deferral rejected. Require cell-level comments + authorship metadata from day one (nbdime local + ReviewNB-style PR comments with vendor caveat, or self-hosted store) [S04,S05]; carry into RO-Crate/export [S14]. Optional: SaaS vs self-hosted. User decisions: SaaS-vs-self-hosted; retention/visibility; identity (GitHub vs local). Uncertain: auth model.

## 2. Coherent system sketch

Ingest (pins + authorship required, clear reject on missing) → Build/reuse image (REES, exact install commands in exact base, R assert, digests recorded) → Execute selected `result-selector` only (Papermill params + nbclient timeouts, named sandbox profile, data read-only, no net) → Verify (full green gate + failure codes) → Review (nbdime diffs + cell comments, conflict-safe) → Export (Quarto embed-resources HTML and/or RO-Crate; network-disabled validation) → Badge (green/amber/red + reasons + tier + pins + hashes).

## 3. Alternatives, conditions, disagreement, uncertainty (retained, O5)

Alternatives: server sandbox vs WASM preview vs no-exec review. WASM (Pyodide/JupyterLite + separate WebR runtime, static hosting, lazy CDN) is preview-only: no threads/multiprocessing/sockets, removed/crippled stdlib (venv/tkinter/syslog/resource/termios…), CORS-bound fetches, streaming only in Worker + cross-origin-isolated, R/Python split, version skew (`jupyterlite-webr <0.7` vs core 0.8.x) [S12,S13]. WASM MUST never set badge state (C6). DataLad vs DVC vs manifest; Marimo vs Jupyter; Quarto vs nbconvert; SaaS vs self-hosted comments — all retained with trade-offs.
Conditions/constraints: deny by default; locks+containers normalize laptops; authorship/annotations end-to-end; explicit caps; offline truly offline.
Disagreement: SaaS-vs-self-hosted; DataLad depth vs simplicity; Quarto richness vs minimalism; gVisor-required vs weak-amber-allowed.
Uncertainty: exact versions/snapshot/base/data/auth/thresholds — each a named decision with safe default (pin all, deny all, amber max on weak evidence).
Resources bootstrap (C9, tunable): set conservative per-run wall clock + per-cell timeout + memory/CPU/PIDs defaults at deploy, record actuals every run, tune from data; never ship unconstrained or blind 30 s.

## 4. Validations: executed vs proposed (O6, honest, scoped)

Executed: read-only inspection of S01–S19 with excerpts/locators; froze discovery before reveal. No containers built, notebooks executed, sandboxes invoked, or offline renders run. No qualified witness sandbox available. Usage/billing unobserved (null).
Proposed (each discriminates one defect; codes in brackets):
1. Timeout semantics [TIMEOUT]: `sleep(timeout+5)` fails as timeout; `prepare_only` renders params without executing.
2. Silent-success guard [MISSING_OUTPUT/HASH_MISMATCH]: IOPub-flood run fails loudly or completes with outputs + hash match; assert `result-selector` cell + artifact.
3. Sandbox denial [WEAK_SANDBOX + deny log]: host-FS read, egress, fork bomb denied/killed; record denying layer.
4. Lock fidelity [PIN_MISSING/R_MISMATCH]: clean rebuild, frozen/explicit install, `renv::restore()`, `R --version` assert; any solve-at-build fails.
5. Data pin [HASH_MISMATCH]: byte-swapped same-name data fails hash gate.
6. Offline export [OFFLINE_FAIL]: network-disabled open, zero requests, math/plots + authorship/annotations intact; article vs reveal.js separately.
7. Diff/merge: nbdime cell diff + comment preserved; conflicted merge stays valid viewable JSON.
8. Resource envelope [OOM_LIMIT/TIMEOUT]: 3× runs within declared wall/CPU/RAM; breach yields clear limit message, no host instability.
9. WASM boundary (negative) [WASM_UNSUPPORTED]: native/R-heavy in preview → explicit unsupported + server fallback, not hang, no badge change.
10. Provenance round-trip: export crate + SHA, reimport second machine, hash-identical selected result.

Scope is this small ecology-group service, not unlimited production guarantees. Later stages may correct this final.

## 5. Critique dispositions (explicit, M03)
C1 R-version assert/record → §P2 + badge gate. ACCEPTED. C2 single sandbox profile + weak-tier max amber MUST → §P2/P5. ACCEPTED. C3 `result-selector` → §P5/sketch/validations. ACCEPTED. C4 ReviewNB vendor caveat → §P1/P6. ACCEPTED. C5 "no flag implies offline" + two-format rule → §P3. ACCEPTED. C6 WASM never sets badge + decisive blockers → §Alternatives/validations. ACCEPTED. C7 failure-code enum mapped to checks → §P5/validations. ACCEPTED. C8 manifest-first safe default → §P4. ACCEPTED. C9 bootstrap caps + actuals → §Uncertainty. ACCEPTED. No rejections, no silent drops. All draft alternatives/conditions/disagreement/uncertainty preserved.
