# S03 / M09 final — lab-notebooks review service (reviser stage)

Case S03 "lab-notebooks", arm A-M09-B treatment, method M09 v1 analogical-outline-interviews.
This is the single coherent final deliverable of the stage chain research → critic → reviser
(2026-10-09). It is self-contained: every claim is stated in full here, with source anchors
(S01–S13) pointing at the retained evidence extracts; anchors never replace text. All 13
source IDs are immutable across the run; usage/billing unobserved, null, for every source.
The full criticism record was adjudicated with evidence rather than automatic obedience
(§12); every repair below is traceable to that record.

**Evidence basis (retained extracts, all re-read by this stage):** S01 ReviewNB product page —
PR-based notebook review, cell/line comments, renders committed outputs, GitHub
(cloud + Enterprise Server) and Bitbucket cloud supported, GitLab unsupported (API
limitations), Docker self-hosting with offline license, and explicitly "NO code execution: no
kernels; committed outputs are only rendered" (marketing page — vendor claims carry a caveat,
see §10). S02 nbdime 4.0.4 docs — notebook-aware diff/merge with git integration and
`nbdiff-web`; its index page makes no statement about executing notebooks. S03 nbgrader 0.9.5
user guide — workflow create → assign → release → fetch/submit → **autograde (programmatic)**
→ manual grading; cell metadata (grade ids) central to assigning and autograding; nothing in
it says the exchange medium is Git. S04 repo2docker configuration docs (unpinned "latest") —
detects `environment.yml`, `install.R`, `DESCRIPTION`, `Project.toml`, `Pipfile(.lock)`,
`requirements.txt`, `pyproject.toml`, `setup.py`, `apt.txt`, `runtime.txt`, `default.nix`,
`Dockerfile`, `postBuild`, `start`, "roughly in the order of build priority"; renv.lock is
**not listed — not detected natively per this page**; a present Dockerfile is listed last and
overrides everything. S05 repo2docker usage docs (unpinned) — builds a reproducible
computational environment from a Git repository URL (REES spec). S06 nbconvert 7.17.1
execute API — ExecutePreprocessor default per-cell timeout "30 s" (raisable or disable via
None/-1); `allow_errors` defaults to False, so an error "will stop the execution" and raise
`CellExecutionError`; kernel obtained from notebook metadata. S07 renv introduction —
`renv.lock` records R version, repositories, and per-package version/source/hash/commit-SHA;
`renv::restore()` installs "exactly the same version of every package"; renv tracks but
**cannot install or switch the R version itself** and does not cover pandoc/OS/system
libraries. S08 GHSA-hwvq-6gjx-j797 (CVE-2021-32798) — untrusted notebook "could run code
simply when opened" via special-element injection in output sanitization; CVSS 7.8; affected
<5.7.11 and ≥6.0.0 <6.4.1; patched 5.7.11 and 6.4.1 (2021). S09 Jupyter blog — maliciously
crafted notebooks trigger arbitrary code execution when viewed, bypassing the notebook trust
mechanism; coordinated patches: Notebook 6.4.1+/5.7.11+, JupyterLab 3.1.4+/3.0.17+/2.3.2+/
2.2.10+/1.2.21+, PyPI 2021-08-05, advisory 2021-08-09. S10 Whole Tale 1.2 — a "Tale"
composes computational environment + datasets + narrative, reproduced and published as one
package. S11 Renku Session Basics, URL-pinned 0.19.1, **retained via search-result
extraction** after direct fetches DNS-failed — sessions "defined using Docker, so they can be
shared and reproducibly re-created", auto-save to RenkuLab, knowledge-graph topic guides
(immutable project/code/dataset/result connections), official JupyterLab and RStudio images.
S12 mybinder.org docs index — fetched page lists **no** memory/CPU/time limits; the
"Usage guidelines" page was never fetched, so public whole-session resource defaults are not
grounded in this run. S13 Code Ocean — two access attempts (HTTP 404 on /product, HTTP 403
on /); **no primary evidence retained**; excluded from grounded findings on that discipline.

## 1. Case and deliverable obligations

The brief asks for a **lightweight computational notebook review service for an academic
ecology group**: mixed Python/R projects arrive with data references; laptops differ;
reviewers should reproduce **a selected result** without granting uploaded notebooks
unrestricted access; authorship and annotations must be preserved; offline export must be
allowed; resource use must be predictable; existing tools plus environment/history evidence
must be investigated.

The six obligations, and where this final materially satisfies each:

- **O1** (discover useful unfamiliar tools and materially different approaches beyond the
  thin plan) — §2's two analogy taxonomies and §9's category map: ReviewNB, nbdime, nbgrader,
  repo2docker, renv, nbconvert's execution defaults, the 2021 CVE chain, Whole Tale, Renku,
  and the mybinder limits gap — none of which the thin plan mentions — plus the two
  identified-but-ungrounded members (Code Ocean, managed data notebooks) handled in §9.
- **O2** (consequential primary-source behavior, governing defaults, units/types, limits,
  applicability) — the governing defaults are stated with units and limits in §5: 30 s **per
  cell** (seconds), fail-fast on error via exception, kernel from notebook metadata (S06);
  config-file detection priority and Dockerfile override (S04); renv.lock field-level
  contents and its blind spots (S07); per-page scope of every docs claim.
- **O3** (at least one issue/fix/regression/release or evolution chain; absence stated) —
  §6: chain A (CVE-2021-32798, the coordinated 2021 Jupyter security release), chain B (the
  renv.lock detection drift), chain C declared **absent** (no ReviewNB or nbgrader release
  history was fetched).
- **O4** (compare every exact P clause after plan reveal; distinguish correction, optional
  enhancement, user decision, already-covered, rejected, uncertain) — §4, one section per
  clause, each with a primary disposition from exactly O4's six kinds.
- **O5** (retain alternatives, conditions, original constraints, disagreement, uncertainty in
  one self-contained coherent final; no text replaced by IDs) — this document: registers in
  §7–§10, disagreement recorded as the committed-outputs-vs-semantic-diff tension (§5.2).
- **O6** (meaningful discriminating validations; executed separated from proposed; honest
  about runtime) — §11: three structural/retrieval checks were executed this run; six
  validations are proposed; **no notebook was executed, no image built, no badge rendered —
  nothing proposed has run**. Scope is this small product brief, not unlimited production
  guarantees.

## 2. Method and retrieved taxonomies (O1)

M09 retrieved **two** analogous real taxonomies with one investigator, same tools, no added
scouts, no search cap; every later lens question was conditioned on the preceding sourced
answer, and irrelevant categories were explicitly rejected (§9).

**A1 — peer review of executable notebooks (workflow taxonomy; S01–S03).** Shared stages:
submission as a version-controlled artifact (GitHub/Bitbucket PRs; nbgrader's
release/fetch/submit cycle for courses); notebook-aware diff rendering (nbdime's dedicated
diff/merge; GitHub's native rich diff "doesn't render interactive HTML/JavaScript outputs"
and times out on large diffs — a vendor-sourced claim from S01's comparison page, plausible
and indirectly corroborated by nbdime's existence but not verified by an affected party);
commenting at cell and line level with resolution status (S01), grading attached to stable
cell metadata identities (S03); adjudication by human approve/comment (S01) or
programmatic-then-manual grading (S03); notification and feedback (email, feedback notebooks).

**A2 — reproducible execution capsules (product taxonomy; S04, S05, S10, S11).** Shared
stages: declarative environment specification in the repo (S04's detection list; Renku's
Docker-defined sessions); build from the repo's Git URL (S05); data referencing as
first-class entities — Renku datasets linked in an immutable knowledge graph (S11, extract
scope per §10) or bundled into the publishable unit (S10); interactive/re-execution sessions
(Binder-style ephemeral, Renku auto-saving sessions, Whole Tale run environments);
certification and export of the whole package (S10's Tale). Code Ocean belongs in this
taxonomy by identification only and is **excluded from grounded findings for lack of
retrievable evidence** (S13) — the same treatment the managed-data-notebook category gets in
§9.

Key structural finding of A1 (narrowed to exactly what the evidence supports, per
adjudication M1): **the review-UI layer of the one directly grounded product (ReviewNB, S01)
executes no notebook code — it renders committed outputs only.** nbgrader's autograde stage
(S03) is programmatic execution, so execution in this class belongs to grading/runner
components, not the review surface itself. Whether nbdime has any execution capability is
**unknown** — its index-page extract makes no statement either way.

## 3. The revealed plan (exact text)

> P1: Store notebooks in Git. P2: Run each notebook in a Docker container using the latest dependencies. P3: Capture stdout and HTML as proof. P4: Resolve data URLs at execution time. P5: Show a green reproduction badge when exit code is zero. P6: Add collaborative annotations later.

## 4. Per-clause dispositions (O4)

Summary row then material text per clause. Dispositions use O4's exact six kinds; a clause
may carry one primary disposition plus labeled secondary findings.

| Clause | Primary disposition | Secondary findings |
|---|---|---|
| P1 | already-covered | correction (diff/anchor/untrusted-output); condition (Git host support) |
| P2 | correction (material) | user decision (full-corpus vs selected-result) |
| P3 | correction | condition (sanitizer cadence); uncertain (HTML export path) |
| P4 | correction | user decision (volatile references) |
| P5 | correction | uncertain (badge semantics, exit-code mapping); user decision ("reproduced") |
| P6 | correction (of sequencing) | optional enhancement (deferred co-editing) |

### P1 — "Store notebooks in Git." (already-covered; corrections + condition)

Git storage is the correct substrate and is already covered by every reviewed analogy: S01
reviews commits/PRs on GitHub/Bitbucket via the hosts' APIs; nbdime's diff/merge integrates
with Git (S02); nbgrader's fetch/submit cycle is built for distributed coursework (S03 —
note: the extract grounds the workflow stages, not the exchange medium; the git grounding
for the review class comes from S01/S02). Three corrections. (a) Generic git line diffs are
notebook-hostile: per S01 (vendor claim, §10 caveat), GitHub's rich diff does not render
interactive HTML/JavaScript outputs and times out on large diffs, so the service must render
notebook-aware semantic diffs (nbdime-class, S02), where a moved cell is a move rather than
delete+insert. (b) Authorship and annotation preservation survives through Git attribution
**plus cell-level metadata identities**; nbgrader keys assigning and autograding to cell
metadata (S03) — that grade-id metadata is central to those steps is extract fact, that it
*survives* the cycles is a reasonable inference (autograding student submissions requires
persistent ids) and is labeled as such. (c) Stored committed outputs are untrusted content:
the 2021 CVE chain showed crafted notebook outputs could execute code on mere viewing
(S08/S09), so the review viewer must sanitize outputs regardless of how they are stored.
Condition: **host support** — the grounded review surface (S01) covers GitHub (cloud +
Enterprise Server) and Bitbucket cloud only and states GitLab is unsupported (API
limitations); if the ecology group's repositories live on GitLab, the S01-class integration
is unavailable and the service must build its review UI on nbdime-class components (S02)
and/or self-hosted deployment. P1's "already-covered" is therefore a **GitHub/Bitbucket-world
finding**. Alternatives retained: Bitbucket support and Docker-based self-hosting with
offline license (S01).

### P2 — "Run each notebook in a Docker container using the latest dependencies." (correction, material)

The containerization half is right in kind: repo2docker builds an image from declared config
files in a Git repo (S04/S05), and Renku defines sessions as Docker images so they are
"shared and reproducibly re-created" (S11, extract scope). Two corrections. **First,
"latest dependencies" contradicts reproduction**: the reviewed stack pins environments —
repo2docker detects declared files in priority order with the Dockerfile as override (S04);
renv.lock records exact package versions, sources, hashes, even commit SHAs, restored by
`renv::restore()` (S07). "Latest" lets the reviewer's run diverge from the author's, so a
reproduction service built on latest-deps cannot certify anything. The R-side drift finding
is stated at **page scope** (adjudication M4): repo2docker's detection list on the fetched
latest docs page as of 2026-10-09 does **not** include renv.lock; whether any released
builder version detects it natively is unresolved until the chain-B probe (§11.5) runs —
absence on one unpinned page does not establish absence in released behavior. For mixed
Python/R projects this means: R lockfiles need a glue step (`install.R`/`postBuild`
invoking `renv::restore()`), an explicitly pinned R base image (renv tracks but cannot
install the R version, and does not cover pandoc/OS/system libraries, S07), or the
Dockerfile override as the only fully-pinned route (S04). **Second, "run each notebook"
overshoots the brief**, which asks reviewers to reproduce "a selected result"; full-corpus
re-execution is retained as a costed optional capability (§8), with budget consequences
from the 30 s/cell default (S06). Condition: execution happens in a disposable sandboxed
runner the service controls — never the reviewer's laptop — because crafted notebooks have
executed code on mere opening (S08/S09).

### P3 — "Capture stdout and HTML as proof." (correction)

The proof artifact of record is the **executed notebook itself**: cell inputs with rich
outputs (figures, tables, interactive HTML) stored in place in the `.ipynb`, as the review
tools render committed outputs (S01) and semantic diffs compare them (S02); nbgrader keeps
per-cell outputs attached to cell identities for grading (S03). Capturing only stdout and
HTML loses structure — S01's headline capability is rendering interactive outputs (Plotly,
ipywidgets) that flat HTML export loses. Correction: capture the executed notebook plus the
execution log (stdout/stderr with per-cell timing), and render both through a notebook-aware,
sanitizing viewer. Condition: any HTML rendering of outputs is sanitizer-sensitive territory
(§6 chain A), so the viewer's sanitizer must be on the service's patch cadence. Uncertain:
standalone HTML export of executed notebooks (nbconvert family) was adjacent to S06's docs
family but not separately grounded — retained as an alternative export path with that
caveat.

### P4 — "Resolve data URLs at execution time." (correction; user decision)

Execution-time URL resolution makes every run a moving target: referenced data can change or
vanish between author run and reviewer run, silently breaking "reproduce a selected result",
and it directly conflicts with offline export. The analogies do it differently: Whole Tale
bundles datasets into the Tale that is published/exported as one package (S10); Renku
records datasets and project/code/dataset/result links in an immutable knowledge graph
(S11 — cited at extract scope: the extract grounds Docker-pinned sessions, the
knowledge-graph topic guide, and dataset topic guides, not the stronger "resolvable entity"
phrasing). Correction: data references should be declarative (ID/URL + version or content
hash), resolved and recorded at registration/build time into a manifest, with the runner
consuming the manifest; the manifest design itself is this run's own engineering proposal,
labeled as such (not source-grounded). User decision: whether **volatile** references may
still be resolved at execution time (live sensors are plausible in ecology), visibly flagged
in the proof artifact as unpinned. Condition: absolute local paths from the author's laptop
are review-blocking — the service must reject them and ask for a resolvable reference
(this is the brief's "projects arrive with data references" condition).

### P5 — "Show a green reproduction badge when exit code is zero." (correction; uncertain + user decision)

The grounded execution semantics (S06) are API semantics: an error with `allow_errors=False`
stops execution by raising `CellExecutionError`; exceeding the 30 s per-cell budget raises;
the kernel comes from notebook metadata. **No retained source states how these conditions map
to a process exit code, or which process the plan's "exit code" refers to** (kernel, runner,
container) — that mapping is recorded as UNKNOWN, and the correction below is restated on the
grounded semantics rather than the exit-code premise (adjudication M2): a run that completes
"cleanly" under these semantics has satisfied only that cells ran without exceptions within
the budget — not that the *result* matched (numbers, figures, statistics can differ), not
that the environment was pinned (P2), and not that data references resolved as declared
(P4). What fails a run — exception, timeout, non-zero cell return, missing declared output —
is precisely what badge design must specify. Correction: the badge encodes **what** was
verified, e.g. tri-state (reproduced / ran-but-diverged / failed) backed by recorded checks:
pinned environment resolved, data manifest satisfied, selected cells executed within budget,
and — where the author declared expected outputs — a comparison; plus **run provenance**
(adjudication m8: who ran the reproduction, with which image digest and manifest — the same
metadata class the recorded checks need; the brief's "preserve authorship" obligation reads
most naturally on reviewed notebooks, but the proof artifact's provenance is a service
requirement). Two uncertainties stand: the exit-code mapping (above, UNKNOWN) and badge
semantics without a user decision — what "reproduced" means for scientific results
(exact-match vs numeric tolerance vs reviewer adjudication) is genuinely a product decision;
the nbgrader analogy is instructive: programmatic autograding is followed by human review,
never replaced by it (S03). Predictability condition: a run that hits the per-cell budget
must badge as failed/incomplete, never green (S06).

### P6 — "Add collaborative annotations later." (correction of sequencing; optional enhancement deferred)

Two labeled findings, replacing the draft's split verdict (adjudication M3). **Finding 1 —
correction (of the sequencing claim):** the annotation anchor schema cannot be deferred,
because review threads stay meaningful across revisions only if anchored to stable cell
identities — comments attach to cells/lines (S01), nbdime's semantic diff is what makes a
moved cell a move (S02), and nbgrader's metadata-keyed identities show the anchor pattern in
production (S03). Cell-ID anchoring is structural, cheap, and invisible to users; retrofitting
it after review threads exist is the expensive path. **Finding 2 — optional enhancement,
deferred:** the *collaborative* layer — real-time co-editing — is out of the review-service
core; discovery explicitly rejected same-team co-editing as an analogy category (§9).

## 5. Retained findings (consolidated, O5)

1. The review-UI layer of the directly grounded product (ReviewNB, S01) renders untrusted
   outputs and executes no notebook code; execution belongs to a grading/runner component in
   a service-controlled sandbox (narrowed per M1 — nbgrader's autograde stage is
   programmatic execution, S03).
2. Governing execution defaults exist with units: 30 s **per cell** timeout, fail-fast on
   error via `CellExecutionError`, kernel from notebook metadata (S06) — a ready-made
   per-run budget model; the exceptions-to-exit-code mapping is UNKNOWN (M2).
3. Environment pinning is the field's answer to "laptops differ": declarative config files
   with documented detection priority and Dockerfile override (S04); renv.lock carries the
   finest R provenance (commit SHAs) but is not on the fetched detection page, and renv
   cannot pin the R runtime itself or OS/system libraries (S07) — chain B, §6.
4. Notebook outputs are a code-execution surface as a class (CVE-2021-32798, S08/S09): the
   specific 2021 vector is patched, and the lesson binds the viewer's sanitizer to a patch
   cadence (instance marked historical per m5).
5. Data and environment travel together in mature platforms: Renku datasets +
   knowledge graph + Docker-pinned sessions (S11, extract scope), Whole Tale's exportable
   environment+data+narrative package (S10).
6. Review comments need stable cell-ID anchors; line anchors and raw git diffs are
   notebook-hostile (S01–S03).
7. Tension retained (disagreement, not resolved): displaying committed outputs (S01) vs
   recomputing semantic diffs (S02) — the service must name one as the display of record.

## 6. Evolution chains (O3)

**Chain A (grounded; historical instance, standing class lesson):** output sanitization
bypass → CVE-2021-32798, special-element injection: an untrusted notebook "could run code
simply when opened", CVSS 7.8, affected notebook <5.7.11 and ≥6.0.0 <6.4.1 (S08) →
coordinated Jupyter security release: Notebook 6.4.1+/5.7.11+, JupyterLab 3.1.4+ etc.,
patched to PyPI 2021-08-05, advisory 2021-08-09, trust mechanism confirmed bypassed (S09).
Applicability: shapes L1/P1/P3 — the vector is patched since 2021, so the binding
requirement is the class (untrusted-content handling, sanitizer cadence), not the instance.

**Chain B (grounded, evolution/drift; page-scoped per M4):** repo2docker's R support grew
around `install.R`/`DESCRIPTION`/`runtime.txt` (S04), while the R ecosystem's lockfile
standard moved to renv (S07). On the fetched latest docs page (2026-10-09) renv.lock is not
in the detection list; the draft's stronger categorical form was **amended** to page scope —
the claim graduates to "no released version detects it" only if the §11.5 probe
(release notes/issues + one glue build) confirms it. Workaround condition stands on
positive evidence: glue via install.R/postBuild → `renv::restore()` plus a pinned R base
image (S07).

**Chain C (evidence absent, stated as absent):** ReviewNB and nbgrader release/changelog
histories were never fetched. If review-tool evolution evidence is needed, that is the gap —
declared, not papered over.

## 7. Conditions register

- Execution only in disposable, sandboxed, service-controlled runners; stored and rendered
  outputs always treated as untrusted (chain A).
- R environments: renv.lock + glue (`install.R`/`postBuild` → `renv::restore()`) **plus a
  pinned R base image**, or the Dockerfile override with full system pinning (renv blind
  spots: R version itself, pandoc, OS libraries — S07).
- **Git host support (added per M5):** grounded review surface assumes GitHub/Bitbucket
  (S01; GitLab unsupported per its page) — a GitLab group requires nbdime-class
  self-built review UI or a different integration path.
- Data references must resolve declaratively; absolute local paths reject the review.
- Per-repository access limiting or self-hosted deployment for sensitive field data (S01).
- Badge truthfulness: never green on timeout, exception, or failed pinned-checks; badge
  carries run provenance (m8).
- Any HTML rendering of outputs runs behind a sanitizer on a patch cadence (chain A).

## 8. Optional capabilities and user decisions

- **User decision (P5):** definition of "reproduced" — exact output match, numeric
  tolerance, or reviewer adjudication after programmatic checks. Drives badge semantics.
- **User decision (P4):** whether volatile/live data references may resolve at execution
  time (visibly flagged), or everything must be pinned.
- **User decision (P2):** selected-result reproduction only (brief-faithful reading) vs
  full-corpus re-execution as a costed extra (30 s/cell defaults × corpus size, S06).
- **Optional capability (P6):** real-time collaborative co-editing — deferred; anchored
  review threads are the core.
- **Optional capability (P1):** Bitbucket alongside GitHub; Docker-based self-hosting with
  offline license for institutional data (S01).

## 9. Analogy categories rejected, with evidentiary status (O1/O4 "rejected")

- **Real-time collaborative canvases** (Google-Docs-style): rejected on category properties —
  no execution semantics, no untrusted-artifact problem; commenting already absorbed into A1.
- **Commercial real-time data notebooks** (Deepnote/Hex/CoCalc class): **rejected on
  category identification alone — no primary source was fetched for this class in this run**
  (adjudication M7). The rejection is not overturned (M09's explicit-rejection requirement
  is met), but its evidentiary status is recorded here exactly as Code Ocean's exclusion is:
  revisit if managed data notebooks' review/sharing features become relevant to this brief.
- **Manuscript peer-review portals**: rejected on category properties — review target is
  prose, not an executable artifact.
- **CI lint/format bots**: rejected on category properties — no human reviewer; they verify
  style, not scientific results.
- **Code Ocean** (S13): not rejected as irrelevant; **excluded for lack of evidence** (404/
  403 on both attempts). For the revealed plan (git + Docker + badge, not capsule platforms)
  the absence is not load-bearing.

## 10. Uncertainty register

- **Exit-code mapping (M2):** how S06's exception/timeout semantics map to the plan's
  "exit code", and of which process — UNKNOWN; recorded as a badge-design requirement.
- **Whole-session resource caps:** no public default grounded (S12's fetched page lists
  none; its Usage guidelines page was never fetched — diligence gap m4, retained open;
  validation 6 targets it). The per-cell 30 s default (S06) is the only grounded budget;
  nbclient's native defaults were not separately grounded.
- **repo2docker docs** (S04/S05) track "latest" — exact release backing the detection list
  unpinned (mutable drift); renv.lock absence is page-scoped (M4) pending §11.5.
- **ReviewNB claims** (diff hostility, "stores no repository contents") are vendor-page
  claims, unverified by an affected party (m1) — carried with that caveat wherever used.
- **Renku evidence** (S11) is search-result extraction at URL-pinned 0.19.1 (2021-era,
  likely stale); direct fetches DNS-failed; citations kept at extract scope (m3).
- **Whole Tale** (S10) at 1.2.0.0 announcement; docs track "latest".
- **nbgrader cell-metadata survival** across cycles is inference from its autograding
  design (m2), not extract text.
- **Standalone HTML export** pipeline adjacent to S06's family, not separately grounded.
- **Checksum claim (m9):** the discovery freeze checksum was independently reproduced by the
  critic; the plan-reveal record half remains unverified (undeclared file, not read).
- **nbdime execution capability:** unknown from the index extract; not asserted either way.

## 11. Validations — executed vs proposed (O6)

**Executed in this run (deterministic, structural — no notebooks, no Docker, no badges):**
source retrieval and extraction with recorded operations/timestamps (source-maps);
acceptance checks on artifact structure (JSON validity, 13 immutable IDs, evidence-file
presence, navigable indexes); checksum freezing of discovery before plan reveal
(critic-corroborated, m9). **Nothing below has run.**

Proposed (redesigned where the adjudication required it):

1. **P2/P4 discriminator — factorial redesign (was confounded; M6.1).** One real mixed
   Python/R ecology project, three single-variable legs through a repo2docker-class builder:
   (a) latest-deps + pinned data manifest, (b) pinned lockfiles (+ glue + pinned R base
   image) + live URLs, (c) both pinned. Diff resolved package versions and result outputs
   per leg. Discriminates: the isolated effect of "latest" (P2) and of execution-time URL
   resolution (P4) — the original two-leg design could not attribute divergence to either.
2. **P5 discriminator:** a notebook whose cells complete cleanly under S06 semantics but
   whose declared result diverges (changed data seed); run under the exit-cleanly-green rule
   and under the tri-state rule. Discriminates: whether "clean run" green-badges a
   non-reproduction.
3. **P1/P6 discriminator:** a PR that moves a cell carrying existing comments; compare
   line-anchored vs cell-ID-anchored thread survival. Discriminates: whether the anchor
   schema must precede collaboration features.
4. **Sanitizer discriminator (the modern form of the CVE validation; M6.2):** render a proof
   artifact containing hostile output (modeled on the CVE-2021-32798 class, S08) through
   **the service's viewer**; verify no script executes. The previously proposed unpatched
   (<6.4.1) build leg is cut as historical theater — it demonstrates a known-patched 2021
   instance, not a property of this service; retained only as an optional historical
   reproduction, clearly labeled.
5. **Chain B probe (graduation test for M4):** fetch repo2docker release notes/issues for a
   first-party renv.lock detector; run one renv.lock project through an install.R-glue
   build. Discriminates: page-scoped drift-with-workaround vs already-resolved.
6. **L4 budget probe:** publish the 30 s/cell default (S06) against the group's slowest real
   result; measure whether per-cell or whole-session budgets better predict "predictable
   resource use". Discriminates: the ungrounded session-cap question (S12).

## 12. Criticism dispositions (every criticism explicitly resolved, with evidence)

Adjudicated in `notes/adjudication.md` against draft, discovery, and the retained extracts;
summary of record — none rejected, obedience was evidence-checked:

- **ACCEPT:** M1 (universal no-execution narrowed to the review-UI layer; "git-based (S03)"
  citation replaced by S01/S02 grounding), M2 (P5 reframed on S06 exception/timeout
  semantics; exit-code mapping UNKNOWN), M3 (P6 = correction + optional enhancement, two
  labeled findings), M4 (renv.lock absence page-scoped; probe required to graduate), M5
  (GitLab-host condition added to §7), M6.1 (validation 1 redesigned factorial), M6.2
  (unpatched-build leg cut/reframed; validation 4 is the modern form), M7 (Deepnote-class
  rejection labeled category-identification-only in §9), m5 (2021 instance marked
  historical; class framing), m6 (L3 answer-label slip corrected), m7 ("repo-in-repo"
  alternative dropped — absent from S05's extract), m8 (run provenance added to badge
  recorded checks).
- **AMEND:** m1 (diff-hostility and no-storage claims both carried as vendor-page claims),
  m2 (metadata survival labeled inference), m3 (Renku citations at extract scope; S10
  carries the bundling direction).
- **RETAIN-UNCERTAIN:** m4 (mybinder Usage-guidelines page unfetched — diligence gap, not a
  concrete unsupported criticism; validation 6 targets it), m9 (freeze checksum
  corroborated, record half unverified).
- **Critic demands already withdrawn (F1–F4):** no action — P2's "each notebook" reading,
  the 30 s budget-model use, the m4 gap, and the S13 exclusion all stand as the critic
  itself concluded.

No P disposition flips under any of these repairs; the affected dependencies (retained
finding 1, P1/P2/P5/P6 sections, chain B scope, validations 1 and the CVE leg, and the
conditions/alternatives registers) are repaired in place above.

## 13. Open questions for later stages

1. "Reproduced" semantics for the badge (P5) — product decision, not settleable from sources.
2. Whether volatile data references are needed by this group's workflows (P4).
3. Selected-result vs full-corpus execution scope (P2).
4. Session-level resource budgets — pick defaults after validation 6 (S12 gap).
5. Exit-code mapping for the runner harness (M2) — specify what fails a run.
6. Git host of record for the group (M5) — GitHub/Bitbucket-grounded stack vs GitLab
   accommodation.
