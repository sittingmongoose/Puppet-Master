# Discovery — lab-notebooks (case S03, block A-M09-B, control arm, stage research)

Written before plan reveal (plan-root-only.md not read; revealed-plan.md does not exist yet).
Method M09 (analogical-outline-interviews): brief-led conventional investigator, following useful
leads from the brief alone, preparing cited discovery ahead of plan comparison.
Sources are cited by immutable IDs (S01–S13); bounded evidence excerpts live in `sources/`,
indexed in `sources/index.md`; exact URLs, versions and access timestamps are in `source-map.json`.

## 1. The brief's obligations read from the brief alone

The product: a lightweight computational notebook review service for an academic ecology group.
The load-bearing constraints, each of which eliminates a whole class of tools:

- Mixed Python/R projects arrive with data references — anything Python-only or R-only is
  disqualified as the core mechanism; anything that cannot resolve external data references
  (ecology data is typically DOI'd/archived) will reproduce nothing.
- Laptops differ — the reproduction environment must be built from the submission, not from the
  reviewer's machine; local-install instructions are not a mechanism.
- Reviewers reproduce a selected result without granting uploaded notebooks unrestricted access —
  this is a sandbox/isolation requirement with two materially different solutions in the wild:
  containers on a server, and WebAssembly in the reviewer's browser (zero server access by
  construction).
- Preserve authorship and annotations — the review surface must diff and comment on notebooks as
  notebooks (cells, markdown, outputs, metadata), not as collapsed JSON.
- Allow offline export — the review artifact and the reproduction result must be exportable
  without the service.
- Make resource use predictable — "predictable" has a precise tooling meaning here: request vs
  limit, guarantee vs display; several popular tools display limits they explicitly do not
  enforce.
- Investigate existing tools plus environment/history evidence — the brief itself asks for
  environment capture (what was installed) and history/provenance evidence (what ran, when, on
  what) as first-class research objects.

## 2. O1 — useful unfamiliar tools, products and materially different approaches

### 2.1 Environment capture for mixed Python/R

**repo2docker (S01).** Builds reproducible container images from a source repository by inspecting
it for configuration files, then building and optionally running them (Jupyter, RStudio, others).
It powers BinderHub and JupyterHub builds and supports GitHub/GitLab but also **Zenodo, Figshare,
Dataverse and the Software Heritage Archive** as source hosts — that is directly relevant to an
ecology group whose projects "arrive with data references": the archival-host support means a
DOI-resolvable submission can be turned into a runnable image without a git clone. A Dockerfile
path exists as an escape hatch. The exact buildpack list (requirements.txt / environment.yml /
install.R / apt.txt) is documented on a separate configuration page not captured here; the
existence of R-fix buildpack commits in the release chain (S12) evidences active R support.

**renv (S02).** The dominant R-side answer: per-project library, a JSON lockfile `renv.lock`
carrying the R version, repository list, and per-package version/source/**hash** (GitHub remotes
down to ref+SHA), with `snapshot()`/`restore()`. Critically, the vignette itself states renv "is
not a panacea for reproducibility": the R version is tracked but not managed, pandoc is not
bundled, OS/system libraries are out of scope, and binary availability can break restores — Docker
is the suggested complement. For the product this yields a finding, not a guess: **renv +
requirements/pyproject pinning inside a repo2docker-style image is the canonical pairing for
mixed Python/R submissions**, and the lockfile hash is exactly the "environment evidence" the
brief asks to investigate.

### 2.2 Review surface: how notebook review is actually done in the wild

Three materially different approaches, all unfamiliar to a thin plan that just says "review":

- **nbdime (S04):** content-aware diff/merge that understands notebook structure — compares inputs
  and outputs, hides base64 images in terminal views, renders image diffs in a web view, and
  auto-resolves conflicts on machine-generated values like execution counters. Git integration is
  one command; since v0.3 it accepts Git refs, so `nbdiff-web <commit> <commit>` is already a
  notebook code-review primitive. Merged conflicts stay valid notebooks; resolution is manual
  unless the mergetool is used.
- **ReviewNB (S10):** the hosted-product analog — a GitHub/Bitbucket app rendering side-by-side
  diffs of code, markdown and rendered outputs (including Plotly/ipywidgets that GitHub's own
  diff does not render), with **cell-level comment threads synced to the PR**, resolution tracking,
  and a free tier for open-source and academic use (then 10 free PRs; Team $79/mo for 10 users;
  self-hosted Docker for enterprise). This is the closest existing product to the brief's service
  and the main "existing tool" the plan must be compared against.
- **jupytext (S11):** the opposite approach — pair each .ipynb with a plain-text `py:percent` (or
  MyST/Quarto markdown) twin so review diffs are ordinary script diffs and linters/formatters can
  run. Its own stated limits: text format drops outputs (they live in the .ipynb), and concurrent
  edits to the open notebook and the paired file raise a conflict prompt. For a review service,
  pairing is attractive precisely because annotations/comments can live as text.

**Authorship/annotation consequence:** nbdime proves diff-by-structure is feasible; ReviewNB
proves cell-level review comments are the expected interaction; jupytext shows the annotations
surface can be textual. A service can compose all three rather than invent a format.

### 2.3 Reproduce-a-selected-result without unrestricted access

Two end-to-end approaches bracket the design space:

- **Server-side container (repo2docker/Binder model, S01+S09+S03):** build an image from the
  submission, spawn it under resource controls, run the selected result. Isolation is enforced by
  the container layer; the reviewer never gets shell access to raw uploaded files.
- **Browser-side WebAssembly (JupyterLite + webR, S05+S06):** JupyterLite is a full JupyterLab
  distribution that "runs entirely in the browser" (Pyodide or Xeus Python kernel; **Xeus R
  kernel** for R), deployed as static files from any HTTP host — no application server, no
  orchestrator. webR is R compiled to WebAssembly: the interpreter runs on the reviewer's machine,
  packages load "in the usual way" via `library()`, and filesystem data can be **pre-bundled onto
  the virtual filesystem for offline use**. This is a materially different approach: for a
  "reviewer reproduces without unrestricted access" requirement, the WASM path removes the access
  problem by construction — the uploaded notebook's code runs in a worker sandbox in the
  reviewer's browser. Stated applicability limits are honest: not all JupyterLab features work,
  not all Python packages are WASM-compatible (S05), webR's API is subject to change and mobile
  browsers cap WebAssembly RAM (S06). So WASM is the low-risk/lightweight path, containers the
  general path — a genuine product decision, not a detail.

**Selected-result execution mechanics:** papermill (S07) parameterizes and executes notebooks from
CLI or Python with parameter translators for Python, R, Julia and Scala — the standard primitive
for "run this notebook with this parameter set and store the executed copy". nbval (S08) is the
verification primitive: each cell becomes a pytest test and recomputed outputs must match the
stored ones; `--nbval-lax` restricts checking to cells marked `#NBVAL_CHECK_OUTPUT`, and regex
sanitize-files absorb nondeterministic output. The strict/lax choice is a governing default: strict
mode implicitly demands deterministic notebooks, which ecology analyses (random seeds, timestamps,
library versions) rarely are — the lax+marker mode is the realistic reproduction contract.

## 3. O2 — primary-source behavior, governing defaults, units and applicability

- **"Predictable resources" has a trap (S03+S09).** jupyter-resource-usage — the extension every
  Jupyter deployment shows in the corner — **displays but explicitly does not enforce** limits:
  `MEM_LIMIT`/`CPU_LIMIT` are display-only, memory is read as PSS on Linux else RSS, and cgroups
  are never mentioned in its README. Enforcement lives one layer down: KubeSpawner's
  `*_guarantee` traits map to Kubernetes **requests** and `*_limit` to **limits** (all default
  `None`), and the docs stress the default LocalProcessSpawner enforces nothing. Units are
  explicit: KubeSpawner bytes with K/M/G/T suffixes; jupyter-resource-usage integer **bytes**;
  cpu in cores (0.5 = half a core). A service that claims predictable resources must therefore
  enforce at the spawner/container layer; setting the env var alone only decorates the UI. This
  is exactly the kind of consequential default the brief asks to derive from primary behavior.
- **renv.lock is structured evidence (S02).** JSON, two sections (R version+repos; Packages with
  version/source/hash), sources CRAN/Bioconductor/GitHub/GitLab/Bitbucket. It is machine-readable
  environment evidence a review service can validate at submission time (does restore succeed?)
  rather than prose to trust.
- **Notebook diffs need semantics, not lines (S04).** nbdime's auto-resolution of execution
  counters as machine-generated values is a concrete example that raw JSON diffing produces
  meaningless conflicts; any review surface must adopt equivalent semantics.
- **WASM applicability boundaries (S05+S06).** Static hosting means offline export is natural
  (cacheable static bundle), but package coverage is the boundary: numpy/matplotlib/plotly-class
  Python works; arbitrary compiled-extension packages may not (S05); R via Xeus R kernel is
  current but young. Applicability rule of thumb evidenced by the docs: pure-Python and
  matrix/stats-heavy ecology workflows are strong WASM candidates; packages with compiled
  dependencies are container-only.

## 4. O3 — issue/fix/release / evolution chain evidence

**repo2docker release chain (S12)** — the strongest captured chain, and it is about exactly the
drift risk this product inherits:

- 2023.06.0 (Apr 2023, breaking): **MRAN retired** → R snapshot repository moved to Posit Package
  Manager; snapshots before 2018-12-07 became unavailable, so dated `runtime.txt` files could
  break. Lesson: date-pinned environments silently depend on third-party archive availability.
- 2025.08.0 (breaking): builds now shell out to **docker buildx**; notebook 7/Node 20; conda
  `defaults` channel excluded; R version "triplets" for 4.3/4.4.
- 2025.12.0 (breaking): requires Python 3.10; **default R 4.2 → 4.4**; `--vanilla` added to R
  calls; pyproject.toml buildpack added.
- 2026.04.0: base image → Ubuntu 24.04 LTS; "allow disabling default buildpack"; R fix replacing
  deprecated `devtools::install_local` with `remotes::local_install`.

Pattern: calendar-versioned with breaking changes in nearly every release, and a demonstrated
upstream-archive migration (MRAN→Posit). Consequence for the service: **the reproduction layer
itself is a mutable dependency**; a submission pinned to repo2docker's behavior at submission time
may not rebuild identically later. The service should record the builder version alongside the
submission's own lockfiles — i.e., environment evidence must cover the tooling, not just the
project.

**Secondary chain:** jupyter-resource-usage's own compat matrix (≥1.0.0 for JupyterLab 4/Notebook
7; pin <1.0.0 for older; S03) shows even the display layer breaks across Jupyter generations.

**Where evidence is absent or inapplicable (honest reporting):**
- rOpenSci's software peer-review guide (the natural "scientific code review process" analog) was
  not captured — the devguide URL returned 404. No claim about its review criteria is cited here.
- No primary capture for BinderHub deployment/security, gVisor/Firecracker-class sandboxing
  internals, or Code Ocean/Whole Tale-class commercial platforms; the container-vs-WASM bracket is
  evidenced only at repo2docker/JupyterLite/webR level.
- noWorkflow (S13) provenance: captures trials (code hashes, file accesses, dependencies, cell
  provenance via `%now_run`) — relevant to "history evidence" — but its own README warns the
  bundled visualization is a Flask dev server and pip installs an older version. Evidence exists
  for the mechanism; fitness for a service backend is not established by this capture.

## 5. Leads retained for plan comparison (not decisions)

1. Composition hypothesis: repo2docker-style image build (submission-derived environment) +
   spawner-enforced request/limit + papermill execution of the selected result + nbval-lax
   verification + nbdime/jupytext review surface + ReviewNB-style cell comments = each brief
   constraint covered by an existing, primary-sourced mechanism.
2. Alternative hypothesis: JupyterLite/webR in-browser reproduction for lightweight results
   (zero access by construction, natural offline export) with container path as fallback for
   compiled packages.
3. Predictability must be enforced at container/spawner layer; the extension layer is display-only.
4. Environment evidence = renv.lock + requirements/pyproject + builder version + data-reference
   resolution (Zenodo/Figshare/Dataverse support exists); history evidence candidate = noWorkflow
   trials, cost-bounded.
5. Open uncertainties carried forward: determinism contract for output comparison; WASM package
   coverage policy; how much of the reproduction runs where (server vs reviewer browser); whether
   provenance collection overhead is acceptable for a "lightweight" service.

Post-reveal obligations (O4 per-P disposition, O5 coherent synthesis, O6 discriminating
validations vs executed checks) belong to the draft and are deliberately not pre-judged here.
Discovery is frozen at this text; `source-map.json` and `sources/` were written before reveal.
