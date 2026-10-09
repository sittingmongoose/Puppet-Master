# Final — corrected plan comparison for a notebook review service (case S03, block A-M09-B, control arm, reviser stage)

Method M09 reviser pass, written 2026-10-09. This is the one coherent, complete final for the
research scope. It restates everything load-bearing from the frozen discovery, the plan-comparison
draft and the critique as self-contained text — source IDs (S01–S13) are citations, never
substitutes for material. Every criticism raised by the critic stage is explicitly adjudicated
(§9): accepted findings are embodied in the sections below rather than appended as notes. Executed
checks are separated from proposals (§8); no product runtime exists in this stage and nothing here
pretends one ran.

Inputs this final is built from: the brief (`cases/S03/brief.md`), the frozen pre-reveal discovery,
the revealed thin plan P1–P6, the plan-comparison draft, the critique (MF1–MF4, m1–m7, four flagged
invalid demands), the research source registry (S01–S13) with the critic's two live re-checks
(S03, S08 at 2026-10-09T18:52:30Z, both no-drift), and the bounded evidence captures under
`research/sources/` and `critic/sources/`. Eleven of the thirteen sources rest on same-day
predecessor captures (18:31–18:42Z); only S03 and S08 were independently re-fetched live.

## 1. The product and the brief's constraints

The product is a lightweight computational notebook review service for an academic ecology group.
Mixed Python/R projects arrive with data references; reviewers' laptops differ; reviewers must
reproduce a selected result without granting uploaded notebooks unrestricted access; authorship
and annotations must be preserved; offline export must be possible; resource use must be
predictable; and the investigation must cover existing tools plus environment/history evidence.
Each constraint eliminates a class of tools: anything Python-only or R-only is disqualified as the
core mechanism; local-install instructions are not a reproduction mechanism because the
environment must be built from the submission; and "predictable" has a precise tooling meaning
(request vs limit, display vs enforcement) that several popular tools fail (§4.1).

## 2. The thin plan, exactly as revealed

- P1: Store notebooks in Git.
- P2: Run each notebook in a Docker container using the latest dependencies.
- P3: Capture stdout and HTML as proof.
- P4: Resolve data URLs at execution time.
- P5: Show a green reproduction badge when exit code is zero.
- P6: Add collaborative annotations later.

The brief additionally requires what the plan is silent on: mixed Python/R with data references,
no unrestricted access for uploaded notebooks, authorship/annotation preservation, offline export,
and predictable resources. Dispositions below use this vocabulary: correction, optional
enhancement, user decision, already-covered, rejected, uncertain. Dispositions and decisions are
kept in separate lists (§6 vs §7) so each P's disposition count is unambiguous.

## 3. O1 — Useful unfamiliar tools, products, and materially different approaches

### 3.1 Environment capture for mixed Python/R

**repo2docker (S01).** Builds and runs reproducible container images for interactive computing and
data workflows from source code repositories — it inspects a submission for checked-in
configuration files and builds the image from them, which is what makes reproduction independent
of the reviewer's laptop. Supported source hosts: GitHub, GitLab, Zenodo, Figshare, Dataverse
installations, and the Software Heritage Archive; a Dockerfile path exists as an escape hatch. The
archival hosts matter directly for an ecology group whose projects arrive with DOI'd data
references: a DOI-resolvable submission can become a runnable image without a git clone. It powers
BinderHub and JupyterHub builds, evidencing active maintenance; R-fix commits in its release chain
(S12) evidence active R support.

**renv (S02).** The dominant R-side answer: a per-project library plus a JSON lockfile
(`renv.lock`) carrying the R version, repository list, and per-package version, source, and hash
(GitHub remotes down to ref+SHA), with `snapshot()`/`restore()`. The vignette itself states renv
"is not a panacea for reproducibility": the R version is tracked but not managed, pandoc is not
bundled, OS/system libraries are out of scope, and binary availability can break restores — Docker
is the suggested complement. The lockfile is machine-readable environment evidence a service can
validate at submission time (does restore succeed?) rather than prose to trust. The canonical
pairing for mixed Python/R submissions is renv + requirements/pyproject pinning inside a
repo2docker-style image.

### 3.2 The review surface: three coexisting approaches

- **nbdime (S04, v4.0.4):** content-aware diff/merge that understands notebook structure —
  compares inputs and outputs, hides base64 images in terminal views, renders image diffs in web
  views, and auto-resolves conflicts on machine-generated values such as execution counters. Git
  integration is one command; since v0.3 it accepts git refs, so `nbdiff-web <commit> <commit>` is
  already a notebook code-review primitive. Merged conflicts stay valid notebooks; resolution is
  manual unless the mergetool is used.
- **ReviewNB (S10):** the hosted-product analog — a GitHub/Bitbucket app (11,000+ marketplace
  installs) rendering side-by-side diffs of code, markdown and rendered outputs, including Plotly
  and ipywidgets that GitHub's own diff does not render. It provides cell-level comment threads
  synced to the PR, resolution tracking, and email notifications; pricing observed on the page:
  free for open-source and academic use (10 free PRs after trial), Team $79/mo for 10 users,
  Business $249/mo for 30 users, Enterprise custom with a self-hosted Docker tier. This is the
  closest existing product to the brief's service.
- **jupytext (S11):** the opposite approach — pair each .ipynb with a plain-text `py:percent` (or
  MyST/Quarto markdown) twin so review diffs look like ordinary script diffs and
  linters/formatters can run. Its stated limits: text formats do not preserve outputs (they live
  in the .ipynb; the text twin carries inputs and metadata only), and concurrent edits to the open
  notebook and the paired file raise a conflict prompt.

Authorship/annotation consequence: nbdime proves diff-by-structure is feasible; ReviewNB proves
cell-level comment threads are the expected review interaction; jupytext shows the annotation
surface can be textual — though whether comments live as text and survive export is a design
choice, not a captured property (S11 preserves inputs/metadata only). A service can compose all
three rather than invent a format.

### 3.3 Reproducing a selected result without unrestricted access — two bracketing approaches

- **Server-side container (repo2docker/Binder model, S01+S09+S03):** build an image from the
  submission, spawn it under resource controls, run the selected result. Isolation is enforced by
  the container/spawner layer; the service never gives the notebook shell access to raw uploads.
- **Browser-side WebAssembly (JupyterLite + webR, S05+S06):** JupyterLite is a full JupyterLab
  distribution that runs entirely in the browser (Pyodide or Xeus Python kernel; an Xeus R kernel
  exists for R), deployed as static files from any HTTP host — no application server, no
  orchestrator. webR is R compiled to WebAssembly: the interpreter runs on the reviewer's machine,
  packages load via `library()`, and filesystem data can be pre-bundled onto the virtual
  filesystem for offline use. Stated limits are honest: not all JupyterLab features work, not all
  Python packages are WASM-compatible (S05), webR's API is explicitly subject to change and mobile
  browsers cap WebAssembly RAM (S06).

Adjudicated precision on the WASM path (critique MF1, accepted): what the captures establish is
that no server executes the submitted code — static hosting plus in-browser execution. Neither S05
nor S06 makes any security-isolation claim (their "worker" wording is a communication mechanism,
not a safety property). "The uploaded notebook's code runs in a worker sandbox" is therefore a
platform inference, not captured evidence: the approach removes the service-side access problem by
construction, and in the same motion relocates execution of untrusted code into the reviewer's own
browser session. Whether browser sandboxing is adequate for hostile notebook code is a retained
uncertainty (§7), and the heavier isolation question (gVisor/Firecracker-class) was never captured
(§5).

**Selected-result execution mechanics:** papermill (S07) parameterizes and executes notebooks from
CLI or Python, with parameter translators for Python, R, Julia and Scala — the standard primitive
for "run this notebook with this parameter set and store the executed copy". nbval (S08) is the
verification primitive: each cell becomes a pytest test comparing recomputed outputs against
stored ones (§4.4 for the exact semantics).

### 3.4 Resource predictability

jupyter-resource-usage (S03) — the extension every Jupyter deployment shows in the corner —
displays but explicitly does not enforce limits: `MEM_LIMIT`/`CPU_LIMIT` are display-only, memory
is read as PSS on Linux else RSS, and cgroups are never mentioned. Compatibility: ≥1.0.0 for
JupyterLab 4 / Notebook 7, pin <1.0.0 for older. Enforcement lives one layer down in KubeSpawner
(S09): `*_guarantee` traits map to Kubernetes requests and `*_limit` to limits, all defaulting to
None, and the docs stress the default LocalProcessSpawner enforces nothing. Units are explicit:
KubeSpawner takes bytes with K/M/G/T suffixes, jupyter-resource-usage takes integer bytes, CPU in
cores (0.5 = half a core). KubeSpawner also exposes `extra_resource_guarantees`/`extra_resource_limits`
dicts for arbitrary resources (e.g. nvidia.com/gpu) — the hook ecology workloads with GPU steps
would need. A service claiming predictable resources must enforce at the spawner/container layer;
setting the extension's env vars only decorates the UI.

### 3.5 History/provenance evidence

noWorkflow (S13) captures trials for scripts and notebooks — code hashes, file accesses,
dependencies, and per-cell provenance via the `%now_run` magic. This is the "history evidence"
class the brief asks about, but with real caveats: its own README warns the bundled visualization
is a Flask dev server and that pip installs an older version (newest needs clone/manual setup,
tested on Python 3.12.4; the pip package targets 3.8). Evidence exists for the mechanism; fitness
for a service backend is not established by this capture.

## 4. O2 — Primary-source behavior, governing defaults, units, limits, applicability

1. **Display vs enforcement (S03+S09).** The single most consequential default in this product
   space: what the UI shows (extension memory figures, a green badge) is not what is enforced
   (spawner requests/limits). See §3.4 for the units and the GPU hook.
2. **renv.lock is structured evidence (S02).** Two sections (R version+repos; packages with
   version/source/hash) across CRAN/Bioconductor/GitHub/GitLab/Bitbucket sources — validatable at
   submission time rather than trusted prose.
3. **Notebook diffs need semantics, not lines (S04).** nbdime's auto-resolution of execution
   counters is the concrete proof that raw JSON diffing produces meaningless conflicts; any review
   surface must adopt equivalent semantics.
4. **nbval's exact contract (S08; critic re-check 18:52:30Z, verbatim, no drift).** `--nbval`
   strictly compares all outputs; `--nbval-lax` "runs notebooks and checks for errors, but only
   compares the outputs of cells with a #NBVAL_CHECK_OUTPUT marker comment" — unmarked cells are
   error-checked only. Regex sanitize files (`--nbval-sanitize-with`, ConfigParser format) absorb
   nondeterministic output before comparison. Two governing consequences: strict mode implicitly
   demands deterministic notebooks, which ecology analyses (seeds, timestamps, library drift)
   rarely are; and lax has a fabrication window — fabricated or drifted stored outputs in
   unmarked cells pass cleanly as long as the notebook executes error-free (critique MF4,
   accepted; embodied in P3/P5 and V1).
5. **WASM applicability boundary (S05+S06).** Pure-Python and matrix/stats-heavy workflows are
   strong WASM candidates; packages with compiled extensions are container-only; R via Xeus R is
   current but young; JupyterLite supports only its two most recent core releases (0.7.0, 0.6.0),
   which is a maintenance-risk fact for any "lightweight path" built on it.
6. **The reproduction layer is itself a mutable dependency (S12).** See §5 — a submission pinned
   to repo2docker's behavior at submission time may not rebuild identically later, so environment
   evidence must cover the tooling, not just the project.

## 5. O3 — Issue/fix/release chains and honestly absent evidence

**repo2docker release chain (S12)** — the strongest captured chain, and it is about exactly the
drift this product inherits:

- 2023.06.0 (breaking): MRAN retired; R snapshot repository moved to Posit Package Manager;
  snapshots before 2018-12-07 became unavailable, so dated `runtime.txt` files could break.
  Lesson: date-pinned environments silently depend on third-party archive availability.
- 2025.08.0 (breaking): builds shell out to docker buildx; requires Python 3.9; notebook 7 +
  Node 20; conda `defaults` channel excluded; R version "triplets" 4.3/4.4; RStudio 2024.12; DOI
  resolution via REST APIs (this directly corroborates P4's build-time archival resolution below).
- 2025.12.0 (breaking): requires Python 3.10; default R 4.2 → 4.4; `--vanilla` added to R calls;
  pyproject.toml buildpack added.
- 2026.04.0: base image → Ubuntu 24.04 LTS; "allow disabling default buildpack"; R fix replacing
  deprecated `devtools::install_local` with `remotes::local_install`.

Pattern: calendar-versioned with breaking changes in nearly every release, plus a demonstrated
upstream-archive migration (MRAN→Posit). Consequence: record the builder version alongside the
submission's own lockfiles.

**Secondary chain:** jupyter-resource-usage's compat matrix (S03) shows even the display layer
breaks across Jupyter generations.

**Where evidence is absent or inapplicable (honest reporting):** rOpenSci's software peer-review
guide (the natural scientific-code-review-process analog) was not captured — the devguide URL
returned 404, recorded in the registry's failed fetches; no claim about its review criteria is
made anywhere in this final. No primary capture exists for BinderHub deployment/security,
gVisor/Firecracker-class sandboxing internals, or Code Ocean/Whole Tale-class commercial
platforms; the container-vs-WASM bracket is evidenced only at the repo2docker/JupyterLite/webR
level, and all isolation claims below stay at that evidenced level. noWorkflow's service-backend
fitness is unestablished (§3.5).

## 6. O4 — Exact per-P dispositions

**P1 — Store notebooks in Git. Disposition: already-covered for git-submitted work, with two
correction refinements and one scope decision.**
Git is the right substrate for repository-hosted work and all captured review tooling assumes it:
repo2docker builds from source repositories — git or archival (S01 lists both; earlier wording
narrowing this to "git repositories" exceeded the capture and is corrected here) — nbdime accepts
git refs so `nbdiff-web <commit> <commit>` is already a review primitive (S04), and ReviewNB is a
GitHub/Bitbucket PR app (S10). Refinement 1: raw git diffs of .ipynb JSON are meaningless — nbdime
exists precisely because line tools handle notebooks poorly and must auto-resolve machine-generated
values like execution counters (S04); P1 is viable only paired with content-aware diffing
(nbdime) or paired plain-text twins (jupytext's py:percent, whose diffs look like ordinary script
diffs, S11). Condition: review tooling must never render raw JSON diffs to a reviewer. Refinement
2 — authorship (a brief clause the draft left undispositioned; critique MF2, accepted):
"preserve authorship" is disposed of here as VCS history — git records who changed what, which is
the natural authorship evidence for a review service. This is an inference from what git is, not a
captured tool property: none of S04/S10/S11 addresses attribution, and squashed or rebased
histories weaken it. For non-git intake (below), authorship rests on submission metadata, which is
uncaptured. Scope decision (critique MF3, accepted): the brief says projects "arrive with data
references", not that they arrive as git repositories — and S01 shows repo2docker can build from
DOI-resolvable archival sources. Git-only intake vs archival-DOI intake vs hybrid is therefore a
genuine user decision (decision 5, §7), not a settled given; note that nbdime/ReviewNB review
flows presuppose git/forge hosting, so archival-DOI intake changes the tooling consequences.

**P2 — Run each notebook in a Docker container using the latest dependencies. Disposition:
correction — keep the container, reject "latest".**
The container half is right: building the image from the submission is what makes reproduction
independent of the reviewer's laptop, and repo2docker automates it from checked-in config (S01).
The "latest dependencies" half is rejected on primary evidence: renv's lockfile pins
per-package version/source/hash precisely because floating installs do not reproduce (S02), and
repo2docker's own release chain shows why "latest" fails even when pinned files exist — MRAN
retired and pre-2018-12-07 R snapshots vanished; the default R version moved 4.2→4.4 between
releases; builds switched to docker buildx (S12). A "latest" container reproduces whatever today's
mirrors serve, not what the author got. Corrections: pin everything the submission can pin
(renv.lock for R; requirements/pyproject hashes for Python), record the builder version alongside
(P2's environment is itself a mutable dependency, S12), and enforce resources at the
container/spawner layer — KubeSpawner maps guarantee→requests and limit→limits while the memory
figure most Jupyter setups display is explicitly display-only (S09, S03), with
`extra_resource_guarantees/limits` covering GPU-class steps (S09). Condition: any container
default that resolves "latest" at build time must be off for review reproduction. Execution-layer
note (critique m2, accepted): batch validation parallelizes across submissions but not within one
notebook — nbval under pytest-xdist requires `--dist loadscope`, keeping all cells of a notebook
on one worker (S08).

**P3 — Capture stdout and HTML as proof. Disposition: correction — keep as artifacts, reject as
the proof standard.**
stdout plus an HTML export is a record, not reproduction evidence. The failure mode: a notebook
reruns cleanly (exit 0, HTML rendered) while producing different numbers. nbval's mechanism is the
governing model — each cell becomes a pytest test comparing recomputed outputs against stored
ones, with `--nbval-lax` restricting output comparison to `#NBVAL_CHECK_OUTPUT`-marked cells and
regex sanitize files absorbing nondeterminism (S08). nbdime additionally gives semantic output
diffs (hiding base64, rendering image differences) that a flat HTML capture cannot (S04).
Correction: proof = executed outputs compared to stored outputs at a declared strictness, with
stdout/HTML retained as human-readable evidence. Adjudicated consequence (critique MF4, accepted):
the lax contract has an unstated fabrication window — unmarked cells are error-checked only, so
fabricated or drifted stored outputs sitting entirely in unmarked cells pass lax cleanly, and V1
as originally designed (one notebook, strict vs lax, no unmarked-fabrication case) could never
surface this. The corrected proof standard must state the window: lax-checked means "compared on
marked cells, errors-only elsewhere", and the unchecked share is disclosed, not hidden (see P5).
Severity depends on the group's marking discipline — retained uncertainty, not a invented crisis.
Condition: strictness policy is a real decision (§7), because strict mode silently demands
deterministic notebooks — unrealistic for ecology analyses with seeds, timestamps, and library
drift.

**P4 — Resolve data URLs at execution time. Disposition: correction — resolve at
submission/build time, record hashes; a size-threshold decision remains.**
Execution-time resolution makes every reproduction depend on network reachability and upstream
goodwill at run time — exactly the dependency that broke when MRAN retired (S12), and ecology data
lives on the same kind of third-party archives. repo2docker's support for Zenodo, Figshare,
Dataverse and Software Heritage as build sources (S01), corroborated by the 2025.08.0 release's
"DOI resolution via REST APIs" entry (S12; added on critic m6, accepted), shows archival
resolution can happen at build time from a DOI-like reference. Correction: resolve references at
submission/build time, record content hashes, and fail loudly on drift; webR's virtual-filesystem
pre-bundling (S06) shows resolved data can also travel with an offline export. User decision
(genuine, not adjudicable from evidence): very large datasets common in ecology may be impractical
to pre-bundle — on-demand resolution with recorded checksums is a defensible variant, but the size
threshold and storage cost are a policy choice (decision 1, §7).

**P5 — Show a green reproduction badge when exit code is zero. Disposition: rejected as
specified; a corrected badge is available.**
Exit code zero is the weakest possible reproduction signal and the badge would systematically
lie. nbval fails a cell whose recomputed output differs from the stored output even when execution
is error-free — that is the whole point of the tool (S08); conversely, a notebook can exit 0 with
drifted outputs (P3). The P5 defect mirrors the resource trap: what the UI displays (extension
memory figures, a green badge) is not what is enforced or verified (S03, S09) — conflating display
with verification is the same category error twice. Correction: the badge reflects a declared
verification level — e.g. "executed, lax-checked on N marked cells (M cells unchecked)",
"strict output match", "executed, no output comparison" — and encodes environment evidence
(lockfile presence, builder version) rather than binary green. The unchecked-share disclosure is
required by the MF4 adjudication: a "lax-checked" badge that hides how many cells were never
compared inherits the fabrication window silently. Condition: a green badge must never be the
only published signal for a review decision.

**P6 — Add collaborative annotations later. Disposition: correction — the sequencing is backwards
for this product.**
For a review service, annotations are not a deferred feature; they are the product's core
interaction, and the field evidence shows what they must look like: cell-level comment threads on
rendered diffs, synced to the forge, with resolution tracking (ReviewNB, S10), and merge semantics
that keep the notebook valid while comments and edits interleave (nbdime keeps conflicted
notebooks valid and viewable, S04). Correction: design the annotation surface in the first
increment (even minimal cell-level comments), because every other P (badging, proof, diff view)
must link to it. One inference is downgraded per critic m5 (accepted): the draft's claim that
paired-text annotations "survive export" went beyond S11 — text formats preserve inputs/metadata
only, so comments-as-text surviving export is a design choice the product would make, not a
captured property. Optional enhancement rather than day-one scope: threaded side conversations,
email notification parity with ReviewNB (S10).

## 7. O5 — Alternatives, conditions, user decisions, uncertainty (all retained, self-contained)

**Alternatives.**
- **Alternative A (plan-corrected, container path):** pinned repo2docker-style build +
  spawner-enforced requests/limits + papermill execution of the selected result + nbval-lax
  verification with disclosed marking + nbdime/jupytext review + cell-level comments. Covers every
  brief clause; heaviest infrastructure. Condition: KubeSpawner assumes Kubernetes infrastructure
  the group may not have (S09).
- **Alternative B (lightweight browser path):** JupyterLite/webR reproduction of the selected
  result in the reviewer's browser; no uploaded-notebook code ever executes on a server
  (by construction, S05+S06); offline export is a static bundle. Adjudicated framing (MF1): the
  security adequacy of running untrusted notebook code in the reviewer's browser is an uncaptured
  platform inference — this alternative's advantage over A is real on the access axis but must not
  be sold as a verified sandbox. Conditions: applicability limited by WASM package coverage (S05)
  and memory-heavy analyses on constrained devices (S06); webR's API is unstable (S06); and
  JupyterLite supports only its two most recent core releases (0.7.0/0.6.0 — S05), a standing
  maintenance cost (critic m1, accepted). Hybrid A+B is the honest scope.
- **Alternative C (adopt vs build):** ReviewNB is free for academic use with a self-hosted Docker
  tier (S10) — a build-vs-adopt decision that changes P1/P6 substantially. Condition: only if the
  group's workflow is GitHub/Bitbucket-centric.
- **Condition on all:** the pinned-data policy (P4) and verification strictness (P3/P5) are
  decided before any badge is shown to authors.

**User decisions (all five, now including the intake substrate).**
1. Data pre-bundling vs checksummed on-demand resolution, by size threshold (P4).
2. Verification strictness default — strict output match, lax marked-cells (with disclosed
   unchecked share), or executed-only (P3/P5).
3. Build vs adopt for the review surface (Alternative C).
4. Container scope vs browser-WASM share of reproductions (A vs B vs hybrid).
5. Intake substrate — git-only vs archival-DOI vs hybrid (P1/MF3): decides which submissions are
   in scope and pulls the review-surface tooling consequences with it.

**Uncertainty retained (each with its evidence state).**
- Browser-sandbox adequacy for untrusted notebook code: uncaptured; S05/S06 make no security
  claim (MF1).
- nbval sanitize-file ergonomics under real ecology notebooks: mechanism captured, failure rates
  not (S08).
- webR/Xeus-R package coverage for the group's actual stack: API unstable (S06); not all packages
  work (S05).
- The lax fabrication window's practical severity: depends on marking discipline (MF4).
- noWorkflow's version drift and collection overhead in a service context (S13).
- rOpenSci peer-review-process evidence: not capturable (devguide 404, recorded); any
  peer-review-process claim remains an uncited lead.
- KubeSpawner's Kubernetes assumption (S09).
- Freshness: 11 of 13 sources rest on same-day predecessor captures; only S03/S08 were re-fetched
  live (critic re-checks, no drift). Disagreement with the plan is retained verbatim as §6's
  dispositions, not smoothed over: P2's "latest", P3's proof standard, P4's execution-time
  resolution, P5's exit-code badge and P6's sequencing are all disputed on captured evidence; P1
  stands with refinements.

## 8. O6 — Discriminating validations (all proposed; none executed)

**Executed checks (honest): none against product or tool runtimes — no runtime is available in
this stage.** The only executions across the arm are harness steps (the reveal script), source
captures, and the critic's two live re-fetches (source reads, not product runs). Everything below
is proposed, not run.

- **V1 Determinism + fabrication probe (amended per MF4):** run one representative ecology
  notebook twice via papermill in the same built image (S07, S01); compare with nbval strict vs
  lax (S08). Added arm: inject a fabricated stored output into an *unmarked* cell and confirm lax
  passes it — demonstrating the fabrication window concretely before the strictness decision.
  Discriminates the P3/P5 policy; if strict fails on identical hardware, strict-only badging is
  disqualified.
- **V6 False-green probe (cheap, run first):** inject a deliberately altered stored output with
  exit 0 and check whether a badge spec would pass it. Discriminates P5: demonstrates the
  exit-code badge defect before design.
- **V2 WASM coverage probe:** port the same notebook's imports to JupyterLite Pyodide + Xeus R /
  webR (S05, S06); catalog failures. Discriminates Alternative A vs B vs hybrid scope.
- **V3 Builder-drift probe:** rebuild one fixed submission under two repo2docker releases (e.g.
  2025.12.0 vs 2026.04.0, S12) and diff results. Discriminates whether P2 must pin the builder
  version, not just project dependencies.
- **V4 Data-resolution probe:** resolve one Zenodo-hosted dataset at build time vs execution time;
  record hashes and drift (S01, S12 analog). Discriminates the P4 user decision with measured
  sizes rather than policy guesswork.
- **V5 Diff-quality probe:** have two reviewers review one real notebook PR via nbdime web vs raw
  git diff vs jupytext text (S04, S11). Discriminates the P1 refinement choice; observation of
  attribution surfaces would also inform the MF2 authorship disposition.

## 9. Explicit adjudication of every criticism (O4/O5 obligation)

Every critique finding was adjudicated with independently checked evidence (both the targeted
draft text and the cited capture were re-verified first-hand; the full ledger with per-row checks
and flip conditions is `adjudication-ledger.md` alongside this file). Verdicts as embodied here:

| Item | Verdict | Where embodied |
|---|---|---|
| MF1 WASM security overstatement | ACCEPT (scoped) | §3.3, §7 Alt B, §7 uncertainty |
| MF2 authorship never disposed | ACCEPT | §6 P1 refinement 2, V5, §7 uncertainty |
| MF3 substrate decision omitted | ACCEPT | §6 P1, decision 5 |
| MF4 lax fabrication window | ACCEPT | §4.4, §6 P3/P5, V1 |
| m1 JupyterLite support policy | ACCEPT (additive) | §4.5, §7 Alt B condition |
| m2 xdist constraint | ACCEPT (additive) | §6 P2 execution-layer note |
| m3 extra_resource traits | ACCEPT (additive) | §3.4, §6 P2 |
| m4 "git repositories" wording | ACCEPT (wording fix) | §6 P1 |
| m5 annotations-survive-export inference | ACCEPT (reframe) | §3.2, §6 P6 |
| m6 S12 DOI corroboration | ACCEPT (additive citation) | §5, §6 P4 |
| m7 decision embedded in disposition | ACCEPT (structural) | §2, §6 vs §7 separation |
| D1 "run V1–V6 first" demand | demand rejected | §8 keeps validations as proposals (O6) |
| D2 "re-verify all 13 sources" demand | demand rejected, kernel retained | header + §7 freshness uncertainty |
| D3 "repair in place" demand | demand rejected | stage division respected; repair is this file |
| D4 "gVisor evidence as gate" demand | demand rejected as gate | §5 absence stated; isolation claims stay at evidenced level |

No disposition of the underlying plan was overturned by adjudication: P1 covered+refined,
P2/P3/P4/P6 corrected, P5 rejected as specified — all stand on the captured evidence; the accepted
findings amend the draft's overstatements (MF1, m4, m5), close its omissions (MF2, MF3, m1–m3,
m6), and harden its validation design (MF4, m7).

## 10. Scope statement

This final covers the small product brief and its O1–O6 obligations within the research scope. It
claims no runtime evidence, pre-assigns no implementation tasks, invents no discovery beyond the
captured sources and two named platform inferences (git-history authorship, browser sandboxing),
and keeps executed and proposed work separated. Later stages may correct it; the disagreement with
the thin plan is exactly as stated in §6.
