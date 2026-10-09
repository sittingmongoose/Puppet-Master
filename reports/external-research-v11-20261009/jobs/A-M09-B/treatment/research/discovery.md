# S03 / M09 discovery — lab-notebooks review service

Stage: `er11-20261009-116bb1e4/jobs/A-M09-B/treatment/research`, case S03, method **M09 v1 analogical-outline-interviews**. Written 2026-10-09, deadline day; all fetch timestamps UTC (see `source-map.json`). This document is **frozen before plan reveal**: the case plan (`plan-root-only.md`) was never accessed, and no P-clause comparison appears here (O4 is deferred to `draft.md`, written after `reveal-plan.py`). Investigator context: **one** investigator, same tools throughout, no added scouts, no search cap. Usage/billing: unobserved, null for every source. Evidence extracts retained under `sources/` (S01–S13); IDs are immutable and indexed in `source-map.json`.

## 0. Brief restatement and obligations

Case S03 "lab-notebooks": a lightweight computational notebook review service for an academic ecology group. Incoming conditions from the brief: mixed Python/R projects arrive with data references; laptops differ; reviewers should reproduce a selected result without granting uploaded notebooks unrestricted access; authorship and annotations must be preserved; offline export must be allowed; resource use must be predictable; existing tools and environment/history evidence must be investigated.

- **O1** Independently discover useful unfamiliar tools, products and materially different approaches beyond the thin plan.
- **O2** Investigate consequential primary source/code behavior and governing defaults, units/types, limits and applicability for selected mechanisms.
- **O3** Investigate at least one relevant issue/fix/regression/release or evolution chain; say when evidence is absent/inapplicable.
- **O4** Compare every exact P clause after plan reveal; distinguish correction, optional enhancement, user decision, already-covered, rejected and uncertain findings.
- **O5** Retain useful alternatives, conditions, original constraints, disagreement and uncertainty in one self-contained coherent final; do not replace text with IDs.
- **O6** Propose meaningful discriminating validations and separate executed checks from proposed work. No runtime is available here; nothing below pretends a proposal ran.

## 1. Retrieved analogy A1 — peer review of executable notebooks (workflow taxonomy)

Retrieved taxonomy from ReviewNB (S01), nbdime (S02), nbgrader (S03). Shared workflow stages:

1. **Submission**: work arrives as a version-controlled artifact (GitHub/Bitbucket PR; nbgrader's release/fetch/submit cycle for courses).
2. **Diff rendering**: notebook-aware diffs. GitHub's native rich diff "doesn't render interactive HTML/JavaScript outputs" and times out on large diffs (S01); nbdime provides dedicated "diffing and merging of Jupyter notebooks" including `nbdiff-web` (S02, version 4.0.4).
3. **Commenting**: cell-level and line-level comments with resolution status; PR comments post back to the Git host, standalone-notebook comments live in the review tool (S01). nbgrader attaches grading to stable cell identities via notebook metadata (S03, v0.9.5).
4. **Adjudication**: approve/comment-only (ReviewNB) or autograde-then-manually-grade (nbgrader: autograding followed by manual feedback).
5. **Feedback/notification**: email notifications, resolution tracking (S01); feedback notebooks (S03).

Key negative finding: **none of these review tools executes notebook code**. ReviewNB explicitly neither runs kernels nor executes cells; committed outputs are only rendered (S01). The analogy contributes the review surface, not the reproduction capability.

## 2. Retrieved analogy A2 — reproducible execution capsules (product taxonomy)

Retrieved taxonomy from repo2docker (S04, S05), Whole Tale (S10), Renku (S11); Code Ocean was identified as a member but **not accessed** (S13, evidence absent — excluded from grounded findings):

1. **Environment specification**: declared, buildable environment files in the repo — repo2docker detects `environment.yml`, `install.R`, `DESCRIPTION`, `Project.toml`, `Pipfile(.lock)`, `requirements.txt`, `pyproject.toml`, `setup.py`, `apt.txt`, `runtime.txt`, `default.nix`, `Dockerfile`, `postBuild`, `start`, "roughly in the order of build priority"; a present `Dockerfile` overrides everything (S04). Renku sessions are "defined using Docker, so they can be shared and reproducibly re-created" (S11).
2. **Build**: repo2docker "can build a reproducible computational environment for any repository" from its Git URL (S05).
3. **Data referencing**: Renku maintains datasets and a knowledge graph connecting projects, code, datasets and results (S11); Whole Tale composes datasets into the reproducible package (S10).
4. **Interactive session / re-execution**: Binder-style ephemeral sessions (S05 context), Renku sessions with auto-saving back to RenkuLab (S11), Whole Tale run environments (S10).
5. **Certification & export**: Whole Tale 1.2 is for "publishing transparent and reproducible computational research" — the Tale (environment + data + narrative) is the exportable/publishable unit (S10).

## 3. Explicitly rejected analogy categories

- **Real-time collaborative canvases** (Google-Docs-style commenting): rejected — no execution semantics, no untrusted-artifact problem; comments alone were already absorbed into A1's commenting stage.
- **Commercial real-time data notebooks** (Deepnote/Hex/CoCalc class): rejected as an *analogy category* — they optimize same-team co-editing, not a reviewer reproducing a stranger's artifact without access grants. Note: no primary source for this class was fetched in this run, so the rejection rests on category identification, not retrieved evidence.
- **Manuscript peer-review systems** (journal submission portals): rejected — review target is prose, not an executable artifact; reproduction is out of scope there.
- **CI lint/format bots**: rejected — no human reviewer in the loop; they verify style, not scientific results.
- **Code Ocean** specifically: *not rejected as irrelevant* but **excluded for lack of evidence** (S13, 403/404). If the revealed plan centers on compute capsules, this is a known gap to revisit.

## 4. Four inquiry lenses

Each lens maps to the original user obligations and carries a grounded chain: every later question is conditioned on the preceding sourced answer.

### L1 — Untrusted re-execution and access control (analogy A1+A2; obligations: "reviewers should reproduce a selected result without granting uploaded notebooks unrestricted access")

- **Q1 (A1)**: Does the review layer itself execute notebooks? — **A1**: No. ReviewNB renders diffs/comments only; no kernels (S01).
- **Q2 (conditioned on A1)**: If the review UI does not execute, what does execute untrusted notebooks in the analogous stacks, and with what governing defaults? — **A2**: nbconvert's ExecutePreprocessor: default per-cell timeout "is 30 s" (units: seconds per cell; can be raised or disabled via None/-1), `allow_errors` defaults to False so an error stops execution with `CellExecutionError`, and the kernel comes from the notebook metadata unless overridden (S06, nbconvert 7.17.1). Execution happens in an environment built by repo2docker from the repo's own declared config (S04/S05).
- **Q3 (conditioned on A2)**: Is opening/executing such a notebook safe by default on a reviewer's machine? — **A3**: No. CVE-2021-32798: an untrusted notebook "could run code simply when opened" via special-element injection in output sanitization (S08, CVSS 7.8, fixed in notebook 5.7.11/6.4.1); the Jupyter team confirmed the trust mechanism was bypassed (S09). **Implication**: the review service must reproduce selected results in a disposable, sandboxed runner it controls — never on the reviewer's laptop, and the review UI should treat outputs as untrusted content, matching the brief's "without granting unrestricted access."

### L2 — Review surface: authorship and annotation preservation (analogy A1; obligations: "preserve authorship and annotations")

- **Q1 (A1)**: How do analogous tools diff notebooks without destroying context? — **A1**: nbdime does notebook-aware diff/merge with a web view, integrating with git (S02).
- **Q2 (conditioned on A1)**: Where do review comments attach? — **A2**: cell- and line-level threads in ReviewNB, posting back to the Git host (S01).
- **Q3 (conditioned on A2)**: What keeps annotations stable across revisions? — **A3**: nbgrader's workflow keys grading and metadata to notebook cell metadata/identities that survive the assign→autograde cycle (S03). **Implication**: review threads must anchor to stable cell IDs (notebook `nbgrader`-style metadata), not line numbers; authorship survives as git attribution plus cell-level provenance. Tension to carry into the draft: committed-output rendering (S01) shows outputs *as committed*, while a semantic re-diff (S02) recomputes structure — a service must pick one as the display of record and say which.

### L3 — Environment and data-reference capture for mixed Python/R (analogy A2; obligations: "mixed Python/R projects arrive with data references", "laptops differ")

- **Q1 (A2)**: How are Python environments pinned in the analogous stacks? — **A1**: repo2docker detects `environment.yml`/`requirements.txt`/etc. in priority order (S04).
- **Q2 (conditioned on A1)**: How about R, including modern lockfiles? — **A2**: renv.lock records the R version, repositories, and per-package version/source/hash/commit-SHA, and `renv::restore()` reinstates exact versions (S07). **But** repo2docker's detection list contains `install.R` and `DESCRIPTION` and **no renv.lock** (S04) — a drift/evolution finding: renv (S07) postdates repo2docker's R story, and renv itself cannot install or switch the R version (only track it), nor cover pandoc/OS/system libraries (S07). So an R-side lockfile pipeline needs a glue step (e.g. `install.R`/`postBuild` calling `renv::restore()`) plus a separately pinned R base image.
- **Q3 (conditioned on A2)**: How do platforms reference external data instead of the author's laptop files? — **A3**: Renku treats datasets as first-class and records project/code/dataset/result links in an immutable knowledge graph (S11); Whole Tale bundles datasets into the Tale (S10). **Implication**: the service should accept declarative data references (IDs/URLs + versions) resolvable at build time, and reject absolute local paths as review-blocking, with the reference map retained for reproducibility.

### L4 — Predictable resources and offline export (obligations: "make resource use predictable", "allow offline export")

- **Q1**: What execution-predictability defaults already exist? — **A1**: per-cell 30 s timeout and fail-fast error semantics (S06) — a natural per-run budget knob with stated units.
- **Q2 (conditioned on A1)**: What whole-session caps exist in public stacks? — **A2**: evidence gap: the mybinder docs page fetched lists no memory/CPU/time limits, and its "Usage guidelines" page was not fetched (S12); Renku is platform-configured (auto-save, Docker-pinned sessions; limits not grounded here, S11). **Uncertainty recorded**: public whole-session memory defaults are NOT grounded in this run.
- **Q3 (conditioned on A2)**: What does offline export look like? — **A3**: Whole Tale's unit of export is the whole Tale — environment + data + narrative — published as a package (S10). **Implication**: export as a self-contained archived bundle (notebooks + environment spec + data-reference manifest + results), not just `.ipynb` files.

## 5. Issue/fix/release chains (O3)

**Chain A (grounded):** Caja-sanitizer era → CVE-2021-32798 (special element injection; untrusted notebook executes code on load; CVSS 7.8; affected <5.7.11, ≥6.0.0 <6.4.1; patched 5.7.11/6.4.1) (S08) → coordinated Jupyter security release: Notebook 6.4.1+/5.7.11+ and JupyterLab 3.1.4+/3.0.17+/2.3.2+/2.2.10+/1.2.21+, patched to PyPI 2021-08-05, advisory 2021-08-09 (S09). Governing lesson: viewing notebook outputs is a code-execution surface; trust mechanisms have been bypassed before. Applicability: directly shapes L1.

**Chain B (grounded, evolution/drift):** repo2docker R support grew around `install.R`/`DESCRIPTION`/`runtime.txt` (S04), while the R ecosystem's lockfile standard moved to renv (`renv.lock`, exact-version restore incl. commit SHAs, S07); renv.lock is absent from repo2docker's detection list in the fetched docs (S04). Evidence for a first-party renv.lock detector in any released repo2docker version is **absent in this run's sources** — stated as absent, not asserted. Workaround condition recorded: glue via install.R/postBuild + explicit base-image R pinning, because renv tracks but does not install R (S07).

**Chain C (evidence absent):** ReviewNB release/changelog history — not fetched; if the revealed plan needs a review-tool evolution chain, this is the gap. nbgrader release history — not fetched; its docs version (0.9.5) is grounded but its fix chain is not.

## 6. Obligation → lens/evidence map

| Obligation | Lenses | Grounded sources | Alternatives surfaced | Notes |
|---|---|---|---|---|
| O1 discovery | all | S01–S12 | Renku, Whole Tale, renv, nbdime, nbgrader, ReviewNB found beyond any thin plan | Code Ocean identified, not accessed (S13) |
| O2 defaults/behavior | L1, L3, L4 | S04, S06, S07, S08 | timeout units (s/cell), allow_errors, kernel-from-metadata, detection priority, Dockerfile override, renv.lock fields | Whole-session memory caps ungrounded (S12) |
| O3 issue/fix/release | L1, L3 | S08, S09 (chain A); S04+S07 (chain B) | — | Chain C absent; stated |
| O4 per-P comparison | — | after reveal | — | deferred to draft.md |
| O5 coherent retention | all | this file + sources/ | tensions listed in L2, L3 | self-contained prose, no bare IDs |
| O6 discriminating validations | L1–L4 | see §8 | executed vs proposed separated | nothing proposed has run |

## 7. Alternatives, conditions, disagreements, uncertainty (retained)

- **Runner placement alternatives**: (a) sandboxed server-side runner reproducing selected cells (L1/A2 shape), (b) reviewer-local ephemeral container via repo2docker-like build (S05) with the brief's access limits, (c) no-execution review with committed outputs only (S01). Conditions: (a) needs per-run budgets and untrusted-output handling (S06/S08); (b) inherits the CVE-era lesson that local opening is a risk surface (S08/S09); (c) fails the brief's "reviewers should reproduce a selected result".
- **R environment alternatives**: renv.lock + glue (S07/S04) vs conda `environment.yml` covering R via conda channels (S04 supports it natively) vs `Dockerfile` override escape hatch (S04) — the last is the only one that pins OS/system libs, which renv explicitly does not (S07).
- **Data references**: Renku-style first-class datasets + knowledge graph (S11) vs Whole Tale bundling (S10) vs repo2docker's implicit "data already in repo" (S05).
- **Disagreement/tension**: committed-output rendering (S01) vs semantic re-diff (S02) as the review display of record; execute-then-review vs review-then-execute ordering (nbgrader autogrades before humans grade, S03 — the opposite order from ReviewNB's execute-never, S01).
- **Uncertainty**: whole-session resource caps (S12); exact repo2docker release backing the docs pages (S04/S05 "latest"); ReviewNB marketing-page claims unverified by use; S11 evidence retained via search extraction because direct Renku fetches DNS-failed in this sandbox (operation recorded honestly in S11).

## 8. Self-criticism (ordinary full criticism)

Two analogies is the method's floor, not a saturation claim; a third (e.g. continuous-execution notebooks like Vercel-for-data or Ploomber) might change L4. Single-investigator retrieval is exposed to the categories I already knew (retrieval bias toward Jupyter-ecosystem tools); the rejected-categories list partially compensates. S01 is a product marketing page — feature claims (e.g., "stores no repository contents") are unverified beyond the page. The 30 s default (S06) is documented for ExecutePreprocessor; native nbclient defaults may differ and were not separately grounded. Mybinder/JupyterHub memory defaults remain ungrounded (S12). None of §4's implications has been executed; all validations below are proposed.

## 9. Proposed discriminating validations (O6 — none executed)

1. **L1**: execute a notebook whose output contains malicious HTML on (a) an unpatched (<6.4.1) notebook build vs (b) a patched sandboxed-runner build; discriminator: code execution in (a) must not reproduce in (b)'s runner. Grounds the sandbox requirement against Chain A (S08/S09).
2. **L3**: build one mixed Python/R project twice through repo2docker — once with `install.R` glue calling `renv::restore()`, once with conda `environment.yml` — and diff resolved package versions; discriminator: whether the renv path reproduces commit-SHA-pinned GitHub deps (S07) that conda cannot, and whether the glue survives the Dockerfile-override rule (S04).
3. **L2**: open one PR containing a moved cell with nbdime diff + ReviewNB-style thread anchors; discriminator: whether cell-ID-anchored comments survive the move where line anchors break (S01–S03).
4. **L4**: run the S06 defaults (30 s/cell) against the group's slowest published result; discriminator: whether a per-cell budget discriminates "predictable" better than a whole-session cap, whose public default is currently ungrounded (S12).
5. **O3**: fetch repo2docker's release notes/issues for a first-party renv.lock detector; discriminator: presence/absence changes whether Chain B is drift-with-workaround or already-resolved.

## 10. Freeze statement

This discovery is complete as of writing and was saved **before** running `reveal-plan.py`; `plan-root-only.md` was not accessed at any point. No clause of the case plan is quoted, compared, or characterized here. O4 comparison happens next, in `draft.md`, against the revealed plan only.
