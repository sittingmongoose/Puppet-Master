# Draft — plan comparison (case S03, block A-M09-B, control arm, research stage)

Method M09, post-reveal comparison. Inputs: `cases/S03/brief.md`, frozen `discovery.md`
(pre-reveal, unchanged), `revealed-plan.md` (P1–P6), public primary evidence `S01–S13`
(`source-map.json`, bounded excerpts in `sources/`). This is a complete planning deliverable for
the research scope; later stages may correct it. Executed checks are separated from proposals in
§6; no product runtime exists, and nothing below pretends one ran.

## 1. The thin plan vs the brief

The plan: P1 store notebooks in Git; P2 run each notebook in a Docker container using the latest
dependencies; P3 capture stdout and HTML as proof; P4 resolve data URLs at execution time; P5
show a green reproduction badge when exit code is zero; P6 add collaborative annotations later.
The brief additionally requires: mixed Python/R with data references; reproduction from differing
laptops without granting uploaded notebooks unrestricted access; preservation of authorship and
annotations; offline export; predictable resource use; and environment/history evidence. Each P
is compared against both, with the disposition vocabulary from O4: correction, optional
enhancement, user decision, already-covered, rejected, uncertain.

## 2. Exact per-P disposition

**P1 — Store notebooks in Git. Disposition: already-covered, with a correction refinement.**
Git is the right substrate and the discovery evidence assumes it everywhere: repo2docker builds
from git repositories (S01), nbdime ships one-command git integration and accepts git refs so
`nbdiff-web <commit> <commit>` is already a review primitive (S04), and ReviewNB is a GitHub/Bitbucket
PR app (S10). Refinement (correction, not contradiction): raw git diffs of .ipynb JSON are
meaningless — nbdime exists precisely because line tools handle notebooks poorly, and it must
auto-resolve machine-generated values like execution counters (S04). P1 is viable only paired
with content-aware diffing (nbdime) or paired plain-text twins (jupytext's py:percent, whose
diffs "look like ordinary script diffs"; S11). Condition: review tooling must never render raw
JSON diffs to a reviewer.

**P2 — Run each notebook in a Docker container using the latest dependencies. Disposition:
correction — keep the container, reject "latest".**
The container half is right: building the image from the submission is the mechanism that makes
reproduction independent of the reviewer's laptop, and repo2docker automates exactly this from
checked-in config files (S01). The "latest dependencies" half is rejected on primary evidence:
renv's lockfile pins per-package version/source/hash precisely because floating installs do not
reproduce (S02), and repo2docker's own release chain shows why "latest" fails even when pinned
files exist — MRAN retired and pre-2018-12-07 R snapshots vanished; the default R version moved
4.2→4.4 between releases; builds switched to docker buildx (S12). A "latest" container reproduces
whatever today's mirrors serve, not what the author got. Correction: pin everything the submission
can pin (renv.lock for R, requirements/pyproject hashes for Python), record the builder version
alongside (P2's environment is itself a mutable dependency, S12), and enforce resources at the
container layer — KubeSpawner maps guarantee→requests and limit→limits, while the memory figure
most Jupyter setups display is explicitly display-only (S09, S03). Condition: any container
default that resolves "latest" at build time must be off for review reproduction.

**P3 — Capture stdout and HTML as proof. Disposition: correction — keep as artifacts, reject as
the proof standard.**
stdout plus an HTML export is a record, not reproduction evidence. The failure mode: a notebook
reruns cleanly (exit 0, HTML rendered) while producing different numbers. nbval's mechanism is
the governing model — each cell becomes a pytest test comparing recomputed outputs against the
stored ones, with `--nbval-lax` restricting comparison to cells marked `#NBVAL_CHECK_OUTPUT` and
regex sanitize-files absorbing nondeterminism (S08). nbdime additionally gives semantic output
diffs (hiding base64, rendering image differences) that a flat HTML capture cannot (S04).
Correction: proof = executed outputs compared to stored outputs at a declared strictness, with
stdout/HTML retained as human-readable evidence. Condition: strictness policy is a real decision
(§4), because strict mode silently demands deterministic notebooks — unrealistic for ecology
analyses with seeds, timestamps, and library drift.

**P4 — Resolve data URLs at execution time. Disposition: correction with an embedded user
decision.**
Execution-time resolution makes every reproduction depend on network reachability and upstream
goodwill at run time — exactly the dependency that broke when MRAN retired (S12), and ecology
data lives on the same kind of third-party archives. repo2docker's support for Zenodo, Figshare,
Dataverse and Software Heritage as sources (S01) shows archival resolution can happen at build
time from a DOI-like reference. Correction: resolve references at submission/build time, record
content hashes, and fail loudly on drift; the webR evidence shows filesystem data can be
pre-bundled onto a virtual filesystem for offline use (S06), so resolved data can also travel
with an export. User decision (genuine, not adjudicable from evidence): very large datasets
common in ecology may be impractical to pre-bundle — on-demand resolution with recorded checksums
is a defensible variant, but it is a policy choice about size thresholds and storage cost, not a
technical discovery.

**P5 — Show a green reproduction badge when exit code is zero. Disposition: rejected as
specified; correction available.**
Exit code zero is the weakest possible reproduction signal and the badge would systematically
lie. nbval fails a cell whose recomputed output differs from the stored output even when
execution is error-free — that is the whole point of the tool (S08); conversely, a notebook can
exit 0 with drifted outputs (P3). The P5 defect also mirrors the resource trap: what the UI
displays (extension-level memory figures, a green badge) is not what is enforced (spawner
limits); conflating display with verification is the same category error documented twice in the
discovery (S03, S09). Correction: badge reflects a declared verification level — e.g. "executed,
lax-checked on N marked cells" vs "strict output match" vs "executed, no output comparison" —
and encodes environment evidence (lockfile presence, builder version) rather than binary green.
Condition: a green badge must never be the only published signal for a review decision.

**P6 — Add collaborative annotations later. Disposition: correction — sequencing is backwards
for this product.**
For a review service, annotations are not a deferred feature; they are the product's core
interaction, and the field evidence shows what they must look like: cell-level comment threads
on rendered diffs, synced to the forge, with resolution tracking (ReviewNB, S10), and merge
semantics that keep the notebook valid while comments and edits interleave (nbdime keeps
conflicted notebooks valid and viewable, S04). jupytext's paired text additionally gives
annotations a plain-text home that survives export (S11). Correction: design the annotation
surface in the first increment (even minimal cell-level comments), because every other P
(badging, proof, diff view) must link to it. Optional enhancement rather than day-one scope:
threaded side conversations, email notification parity with ReviewNB (S10).

## 3. Retained findings carried into the final (self-contained restatements)

1. Reproduction environments for mixed Python/R are buildable from the submission: container
   images from checked-in config (S01), R pinned by hashed lockfile (S02), with the builder
   itself a drift liability proven by release history (S12).
2. "Resource predictability" splits into display and enforcement layers; only the container/
   spawner layer enforces (requests/limits), and the common extension explicitly does not (S03,
   S09).
3. Review of notebooks needs structure-aware diffing; three coexisting approaches — semantic
   diff/merge (S04), hosted cell-comment review (S10), paired plain-text (S11) — are composable.
4. Output-level verification exists as a mature pytest mechanism with explicit nondeterminism
   controls (S08), and execution of "a selected result" is papermill's parameterized execution
   with R among its translator languages (S07).
5. A materially different execution surface — browser-only WebAssembly (JupyterLite with
   Pyodide/Xeus Python and an Xeus R kernel; webR) — eliminates server access by construction
   and hosts as static files (offline export natural), bounded by package coverage and WASM
   memory limits (S05, S06).
6. Fine-grained provenance (code hashes, file accesses, per-cell trials) exists for
   scripts/notebooks via noWorkflow, with real overhead and maturity caveats (S13) — the
   "history evidence" the brief asks for is available but not free.

## 4. Alternatives and conditions

- Alternative A (plan-corrected, container path): pinned repo2docker-style build + spawner
  limits + papermill execution + nbval-lax verification + nbdime/jupytext review + cell
  comments. Covers every brief clause; heaviest infrastructure.
- Alternative B (lightweight browser path): JupyterLite/webR reproduction of the selected result
  in the reviewer's browser; no uploaded-notebook access problem by construction; offline export
  is a static bundle. Condition: applicability limited by WASM package coverage (S05) and
  memory-heavy analyses on constrained devices (S06); hybrid A+B is the honest scope.
- Alternative C (adopt vs build): ReviewNB is free for academic use with a self-hosted Docker
  tier (S10) — a build-vs-adopt decision that changes P1/P6 substantially. Condition: only if
  the group's workflow is GitHub/Bitbucket-centric.
- Condition on all: pinned-data policy (P4) and verification strictness (P3/P5) are decided
  before any badge is shown to authors.

## 5. Optional capabilities and user decisions

User decisions: (1) data pre-bundling vs checksummed on-demand resolution, by size threshold
(P4); (2) verification strictness default — strict output match, lax marked-cells, or executed-only
(P3/P5); (3) build vs adopt for the review surface (Alternative C); (4) container scope vs
browser-WASM share of reproductions (A vs B).
Optional capabilities (evidence-backed, not required by the brief): provenance trials via
noWorkflow-style collection (S13); badge carrying environment-evidence payload (lockfile hash,
builder version); paired-text export of the review record (S11).

## 6. Uncertainty, and discriminating validations vs executed checks

Executed checks (honest): none against product/tool runtimes — no runtime is available here. The
only executions this stage performed are harness steps (reveal script) and source captures;
everything below is proposed, not run.

Uncertainty retained: nbval sanitize-file ergonomics under real ecology notebooks (S08 captured
mechanism, not failure rates); webR/Xeus-R package coverage for the group's actual stack (S06
states the API is unstable; S05 states not all packages work); noWorkflow's pip-installed version
drift and collection overhead in a service context (S13); rOpenSci review-process evidence was
not capturable this stage (devguide 404, recorded in source-map.json) — any peer-review-process
claim remains an uncited lead; KubeSpawner assumes Kubernetes infrastructure the group may not
have (S09).

Discriminating validation proposals (each distinguishes between competing dispositions above):
- V1 Determinism probe: run one representative ecology notebook twice via papermill in the same
  built image (S07, S01); compare with nbval strict vs lax (S08). Discriminates P3/P5 policy:
  if strict fails on identical hardware, strict-only badging is disqualified.
- V6 False-green probe (cheap, run first): inject a deliberately altered stored output with exit
  0 and check whether a badge spec would pass it. Discriminates P5: demonstrates the exit-code
  badge defect concretely before design.
- V2 WASM coverage probe: port the same notebook's imports to JupyterLite Pyodide + Xeus R / webR
  (S05, S06); catalog failures. Discriminates Alternative A vs B vs hybrid scope.
- V3 Builder-drift probe: rebuild one fixed submission under two repo2docker releases (e.g.
  2025.12.0 vs 2026.04.0, S12) and diff results. Discriminates whether P2 must pin the builder
  version, not just project dependencies.
- V4 Data-resolution probe: resolve one Zenodo-hosted dataset at build time vs execution time;
  record hashes and drift (S01, S12 analog). Discriminates the P4 user decision with measured
  sizes rather than policy guesswork.
- V5 Diff-quality probe: have two reviewers review one real notebook PR via nbdime web vs raw
  git diff vs jupytext text (S04, S11). Discriminates the P1 refinement choice.

## 7. What later stages may correct

This draft compares a frozen thin plan to pre-reveal discovery; it does not claim runtime
evidence, does not pre-assign implementation tasks, and keeps the brief's O4–O6 obligations
satisfied within the research scope. Retained disagreement with the plan is exactly: P2's
"latest", P3's proof standard, P4's execution-time resolution, P5's exit-code badge, P6's
sequencing — P1 stands as-is with a tooling refinement.
