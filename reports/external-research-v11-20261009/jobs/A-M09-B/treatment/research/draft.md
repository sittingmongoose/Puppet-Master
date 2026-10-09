# S03 / M09 draft — plan comparison (post-reveal)

Deliverable for the research stage of `er11-20261009-116bb1e4/jobs/A-M09-B/treatment/research` (case S03 "lab-notebooks", method M09). Written after `reveal-plan.py` froze discovery and revealed the case plan (frozen at 2026-10-09T18:40:26Z; frozen discovery `discovery.md` sha256 `b40894b4…73a5c1`, 18000 bytes, recorded by the reveal script in `plan-reveal.json`). **Discovery was not rewritten after the reveal.** This draft is a complete planning deliverable for this scope; later stages may correct it.

Evidence basis (self-contained; full extracts under `sources/`, indexed in `source-map.json`): **ReviewNB** product page (S01) — notebook PR review, cell/line comments, renders committed outputs, *no execution*; **nbdime** 4.0.4 (S02) — notebook-aware diff/merge; **nbgrader** 0.9.5 (S03) — assign→release→submit→autograde→manual workflow keyed to cell metadata; **repo2docker** docs (S04/S05) — environment-file detection "roughly in the order of build priority" (`environment.yml`, `install.R`, `DESCRIPTION`, `requirements.txt`, …, `Dockerfile` last and overriding), builds an image from a Git repo; **nbconvert** 7.17.1 execute API (S06) — per-cell timeout default **30 seconds**, `allow_errors` default **False** (an error stops execution with `CellExecutionError`), kernel from notebook metadata; **renv** (S07) — `renv.lock` records R version, repositories, per-package version/source/hash/commit-SHA, `renv::restore()` reinstalls exact versions, but cannot install the R version itself nor OS/system libraries; **CVE-2021-32798** advisory + Jupyter blog (S08/S09) — an untrusted notebook could execute code merely on open (output-sanitization bypass; fixed in notebook 5.7.11/6.4.1, JupyterLab 3.1.4+ etc., PyPI 2021-08-05, advisory 2021-08-09); **Whole Tale** 1.2 (S10) — a "Tale" composes environment + data + narrative as a publishable, exportable unit; **Renku** session basics (S11) — sessions defined by Docker images "so they can be shared and reproducibly re-created", datasets as first-class entities, immutable knowledge graph, JupyterLab and RStudio images; **mybinder.org docs** (S12) — fetched page lists no resource limits (gap); **Code Ocean** (S13) — identified but not accessed (404/403), excluded from grounded findings.

## 1. Exact plan text (revealed verbatim)

> P1: Store notebooks in Git. P2: Run each notebook in a Docker container using the latest dependencies. P3: Capture stdout and HTML as proof. P4: Resolve data URLs at execution time. P5: Show a green reproduction badge when exit code is zero. P6: Add collaborative annotations later.

## 2. Per-P disposition

| P | Exact clause (abridged quote) | Disposition | One-line reason |
|---|---|---|---|
| P1 | Store notebooks in Git | **already-covered + correction** | Right substrate; but review threads must anchor to stable cell IDs, and stored outputs are untrusted content |
| P2 | Run each notebook in Docker with **latest** dependencies | **correction (material)** | "Latest" defeats reproduction; pin environments; "each notebook" overshoots the brief's "a selected result"; R lockfile needs glue |
| P3 | Capture stdout and HTML as proof | **correction** | Proof should be the executed notebook's cell outputs (rich MIME) plus execution log; HTML rendering is a sanitizer-sensitive surface |
| P4 | Resolve data URLs at execution time | **correction + user decision** | Execution-time URL resolution is nondeterministic and blocks offline export; pin references, allow volatile ones explicitly |
| P5 | Green reproduction badge when exit code is zero | **correction + uncertain** | Zero exit is necessary but far from sufficient; badge must state what was verified; meaning of "reproduced" needs a user decision |
| P6 | Add collaborative annotations later | **rejected as sequenced / optional enhancement reframed** | Anchor schema (cell IDs) is structural and cheap now; deferring it makes retrofitting costly; defer only real-time co-editing |

### P1 — "Store notebooks in Git." (already-covered + correction)

Git storage is the correct substrate and is already covered by every reviewed analogy: ReviewNB reviews GitHub/Bitbucket PRs (S01), nbdime integrates notebook diffing with git (S02), nbgrader's fetch/submit cycle is git-based (S03). Corrections the discovery adds: (a) generic git line diffs are inadequate for notebooks — GitHub's own rich diff "doesn't render interactive HTML/JavaScript outputs" and times out on large diffs (S01), so the service must render notebook-aware semantic diffs (nbdime-class, S02); (b) authorship and annotation preservation (an explicit brief obligation) survives through git attribution **plus cell-level metadata identities** — nbgrader keys grading to cell metadata that survives assign/autograde cycles (S03); (c) stored committed outputs are untrusted content: the CVE-2021-32798 chain shows notebook outputs have executed code on mere viewing (S08/S09), so the review viewer must sanitize regardless of storage. Conditions: per-repository access limiting (ReviewNB's model, S01) or self-hosting for institutional data. Alternatives retained: Bitbucket support (S01), self-hosted Docker deployment with offline license (S01).

### P2 — "Run each notebook in a Docker container using the latest dependencies." (correction, material)

The containerization half is grounded and correct in kind: repo2docker builds an image from declared config files in the repo (S04/S05); Renku pins sessions as Docker images (S11). Two corrections. **First, "latest dependencies" contradicts both reproduction and the brief**: the reviewed stack pins environments — repo2docker detects `environment.yml`/`requirements.txt`/`install.R`/`DESCRIPTION` in priority order (S04); renv.lock records exact package versions, sources, hashes, even commit SHAs, restored by `renv::restore()` (S07). "Latest" means the reviewer's run and the author's run can diverge, so a "reproduction" service built on latest-deps cannot certify anything. Drift finding (O3 chain B): repo2docker's detection list has **no native `renv.lock`** (S04) — for the ecology group's mixed Python/R projects, R lockfiles need a glue step (`install.R`/`postBuild` invoking `renv::restore()`), plus an explicitly pinned R base image, because renv tracks but cannot install the R version and does not cover pandoc/OS/system libraries (S07); otherwise the `Dockerfile` override escape hatch (S04) is the only fully-pinned route. **Second, "run each notebook" overshoots the brief** — reviewers should reproduce "a selected result". Full-corpus re-execution is an optional capability (see §6, user decision), with per-cell budget consequences from the execution defaults (30 s/cell, fail-fast on error, S06). Conditions: execution must occur in a disposable sandboxed runner the service controls — never the reviewer's laptop — because opening untrusted notebooks has been a code-execution surface (S08/S09).

### P3 — "Capture stdout and HTML as proof." (correction)

The proof artifact of record for a notebook is the **executed notebook itself**: cell inputs with their rich outputs (figures, tables, interactive HTML) stored in the `.ipynb`, as the review tools render committed outputs (S01) and semantic diffs compare (S02). Capturing only stdout and HTML loses structure: ReviewNB's headline capability is rendering interactive outputs (Plotly, ipywidgets) that plain HTML export flattens or loses (S01); nbgrader's workflow keeps per-cell outputs attached to cell identities for grading (S03). Correction: capture the executed notebook (cell outputs in place) plus the execution log (stdout/stderr with cell timing), and render both through a notebook-aware, sanitizing viewer. Uncertainty: standalone HTML export of executed notebooks (nbconvert-family) was adjacent but not separately grounded in this run — retained as an alternative export path with that caveat. Condition: any HTML rendering of outputs is sanitizer-sensitive territory (Chain A, S08/S09), so the viewer's sanitizer must be on the service's patch cadence.

### P4 — "Resolve data URLs at execution time." (correction + user decision)

Execution-time URL resolution makes every run a moving target: the referenced data can change or vanish between author run and reviewer run, which silently breaks "reproduce a selected result", and it directly conflicts with the brief's offline-export obligation. The grounded analogies do it differently: Renku treats datasets as first-class, resolvable entities with an immutable knowledge graph linking project/code/dataset/result (S11); Whole Tale bundles the data into the Tale that gets published/exported as a unit (S10). Correction: data references should be declarative (ID/URL + version or content hash), resolved and recorded at **registration/build time** into a manifest, and the runner consumes the manifest. User decision retained: whether to allow "volatile" references resolved at execution time (e.g. live sensors — plausible in ecology), which must then be visibly flagged in the proof artifact as not pinned. Condition: absolute local paths from the author's laptop are review-blocking; the service must reject them and ask for a resolvable reference (this is exactly the "data references arrive with the project" condition in the brief).

### P5 — "Show a green reproduction badge when exit code is zero." (correction + uncertain)

Exit code zero is necessary but nowhere near sufficient, and the discovery supplies precise grounding: nbconvert/nbclient already fails execution on cell errors (`allow_errors` default False, S06), so a zero exit proves only that cells ran without exceptions **within the budget** — not that the *result* matched (numbers, figures, statistics can differ), not that the environment was pinned (P2), and not that data references were resolved as declared (P4). Correction: the badge should encode **what** was verified, e.g. tri-state (reproduced / ran-but-diverged / failed) backed by recorded checks: pinned environment resolved, data manifest satisfied, selected cells executed within the per-cell timeout budget (S06), and — where the author declared expected outputs — a comparison. What "reproduced" means for scientific results is genuinely a product decision (exact-match vs tolerance vs reviewer judgment); the nbgrader analogy is instructive: programmatic autograding is followed by human review, never replaced by it (S03). Uncertain: badge semantics without a user decision would be invented, not grounded — recorded as uncertain rather than resolved. Predictability condition: a run that hits the 30 s default per-cell budget must badge as failed/incomplete, not green (S06).

### P6 — "Add collaborative annotations later." (rejected as sequenced; optional enhancement reframed)

"Annotations later" is rejected **as a sequencing claim**, not as a feature. The review surface and annotation anchoring are structural: comments attach to cells/lines (S01) and stay meaningful across revisions only if anchored to stable cell identities (nbgrader's metadata-keyed model, S03); nbdime's semantic diff is what makes a moved cell a move rather than delete+insert (S02). Retrofitting an anchor schema after review threads exist is the expensive path. Reframe: design the **cell-ID anchor schema now** (cheap, structural, invisible to users), and defer the *collaborative* layer — real-time co-editing — which discovery explicitly rejected as an analogy category (same-team co-editing, not reviewer reproduction; §3 of discovery). Disposition split: anchor schema = correction to the plan's sequencing; real-time collaboration = optional enhancement, deferred.

## 3. Retained findings (consolidated, O5)

1. Review tooling in the wild does not execute notebooks (ReviewNB, S01) — execution belongs to a runner service, and the review UI renders untrusted outputs.
2. Governing execution defaults exist and are strict: 30 s per cell, fail on first error, kernel from notebook metadata (nbconvert 7.17.1, S06) — a ready-made per-run budget model.
3. Environment pinning is the field's answer to "laptops differ": declarative config files with documented detection priority, Dockerfile as override (repo2docker, S04/S05); R-side lockfiles (renv.lock) carry the finest provenance (commit SHAs) but are not natively detected by repo2docker and cannot pin the R runtime themselves (S07, S04) — evolution/drift chain B.
4. Notebook outputs have been a live code-execution surface (CVE-2021-32798 chain: untrusted notebook executes on open; fixed notebook 5.7.11/6.4.1, JupyterLab 3.1.4+; S08/S09) — chain A.
5. Data and environment travel together in the mature platforms: Renku datasets + knowledge graph + Docker-pinned sessions (S11); Whole Tale's exportable Tale bundles environment+data+narrative (S10).
6. Review comments need stable anchors (cell IDs); line anchors and raw git diffs are notebook-hostile (S01–S03).
7. Tension retained: displaying committed outputs (S01) vs recomputing semantic diffs (S02) — a service must name one as the display of record.

## 4. Conditions register

- Execution in disposable, sandboxed, service-controlled runners; outputs always treated as untrusted (Chain A).
- R environments need glue (install.R/postBuild → `renv::restore()`) plus a pinned R base image; or the Dockerfile override with full system pinning (renv's documented blind spots: R version itself, pandoc, OS libraries — S07).
- Data references must be resolvable declaratively; absolute local paths reject the review.
- Reviewer access scoped per repository, or self-hosted deployment for sensitive field data (S01's models).
- Badge truthfulness: never green on timeout/error/pinned-check-failure.

## 5. Alternatives register (retained, not chosen)

- **Environment strategy**: conda `environment.yml` (native detection, covers R via conda) vs renv.lock+glue (finest R provenance) vs full Dockerfile (only route pinning OS/system layer) — S04/S07.
- **Proof artifact**: executed `.ipynb` as record of truth vs HTML/PDF export bundle (Whole Tale-style package export for offline, S10) — not mutually exclusive; export bundle recommended for the offline obligation.
- **Runner placement**: server-side ephemeral runners vs reviewer-local `repo2docker` builds (S05) vs render-only review (S01) — render-only fails the brief; local builds inherit the trust surface; server-side favored.
- **Data handling**: Renku-style first-class datasets + knowledge graph (S11) vs Whole Tale bundling (S10) vs repo-in-repo data (implicit in repo2docker, S05).
- **Badge**: single green/red (P5) vs tri-state with recorded checks (recommended) vs nbgrader-style programmatic+human hybrid (S03).

## 6. Optional capabilities and user decisions

- **User decision (P5)**: definition of "reproduced" — exact output match, numeric tolerance, or reviewer adjudication after programmatic checks. Drives badge semantics.
- **User decision (P4)**: whether volatile/live data references may be resolved at execution time (flagged visibly), or all references must be pinned.
- **Optional capability (P2)**: full-corpus re-execution ("each notebook") vs selected-result reproduction only — the brief asks for the latter; the former is a costed extra with budget implications (S06 defaults × corpus size).
- **Optional capability (P6)**: real-time collaborative co-editing layer — explicitly out of the review-service core; anchored review threads are the core.
- **Optional capability (P1)**: Bitbucket/self-hosted deployment surface for institutional data (S01).

## 7. Uncertainty register

- Whole-session memory/CPU caps: no public default grounded in this run (mybinder docs page fetched lists none, S12; Renku limits not grounded, S11) — the per-cell 30 s default (S06) is the only grounded budget.
- repo2docker docs track "latest"; the exact released version backing the detection list was not pinned (mutable drift noted in source-map; S04/S05).
- ReviewNB claims (e.g., "stores no repository contents") come from a marketing page and were not independently verified (S01).
- Renku evidence was retained via search-result extraction because `docs.renku.co` and `renkul.io` DNS-failed from this sandbox; the URL-pinned version (0.19.1) may lag current Renku (S11).
- nbclient's native (non-nbconvert) timeout default was not separately grounded — the 30 s figure is ExecutePreprocessor-documented (S06).
- Code Ocean (computation-capsule taxonomy) inaccessible (404/403, S13): if the revealed plan had centered on capsule platforms, this would be a material gap; for the revealed thin plan it is not load-bearing.
- Standalone HTML-export pipeline (nbconvert family) inferred as adjacent to S06's docs family, not separately grounded.

## 8. Discriminating validations — proposed vs executed

**Executed in this stage (all deterministic, no runtime for notebooks):** source retrieval and extraction with recorded operations/timestamps (source-map.json); acceptance checks on artifact structure (JSON validity, 13 immutable IDs, evidence-file presence, navigable index); checksum freezing of discovery before reveal (`plan-reveal.json` records the same sha256 the pre-reveal checksum did). **No notebook was executed, no Docker image was built, no badge was rendered — nothing below has run.**

Proposed (O6; none executed):
1. **P2/P4 discriminator (strongest)**: take one real mixed Python/R ecology project; run it twice through a repo2docker-class builder — once with "latest" deps, once with pinned lockfiles + pinned R base image + data manifest — and diff resolved package versions and result outputs. Discriminates: whether "latest" (P2) and execution-time URL resolution (P4) actually change results in this corpus.
2. **P5 discriminator**: craft a notebook whose cells exit cleanly but whose declared result diverges (changed data seed); run under the P5 rule and under the tri-state rule. Discriminates: whether exit-code-zero green-badges a non-reproduction.
3. **P1/P6 discriminator**: open a PR that moves a cell with existing comments; compare line-anchored vs cell-ID-anchored thread survival. Discriminates: whether the anchor schema must precede collaboration features.
4. **P3 discriminator**: render a proof artifact containing hostile output (modeled on the CVE-2021-32798 class, S08) through the viewer; verify no script executes. Discriminates: whether the sanitizer requirement is binding on the review surface.
5. **Chain B probe**: fetch repo2docker release notes/issues for a first-party `renv.lock` detector; run one renv.lock project through `install.R`-glue build. Discriminates: drift-with-workaround vs already-resolved.
6. **L4 probe**: publish a per-cell budget (30 s default, S06) against the group's slowest real result; measure whether per-cell or whole-session budgets better predict "predictable resource use". Discriminates: the ungrounded session-cap question (S12).

## 9. Open questions for later stages

1. The user decision on "reproduced" semantics (P5) — cannot be settled from sources alone.
2. Whether volatile data references are needed by this ecology group's workflows (P4).
3. Whether full-corpus re-execution is ever in scope or selected-result only (P2).
4. Session-level resource budgets: pick defaults after validation 6, since no public default was grounded (S12).
