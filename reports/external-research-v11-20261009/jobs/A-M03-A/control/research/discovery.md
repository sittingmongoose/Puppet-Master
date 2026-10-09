# ER11 A-M03-A control/research — Discovery (S03 lab-notebooks, pre-reveal)

Case: S03 lab-notebooks. Brief asks for a lightweight computational notebook review
service for an academic ecology group: mixed Python/R arrivals with data
references, heterogeneous laptops, reviewer reproduction of a selected result
without granting uploaded notebooks unrestricted access, authorship/annotation
preservation, offline export, predictable resource use, plus existing-tools and
environment/history evidence.

Method: M03 v1 critic-finalizer, research stage. This file was written from the
brief alone plus independently chosen public primary sources listed in
source-map.json. The thin case plan was NOT read before this file was frozen
(plan-root-only.md untouched; reveal via reveal-plan.py only after this file
and source-map.json exist).

Access window (UTC): 2026-10-09T18:38Z–18:45Z. All timestamps in source-map.json.
No runtime/container execution was available in this stage; all behavior below
is documentation/source-observed, not executed. Proposed executions are in §7.

## 1. O1 — Useful unfamiliar tools, products, materially different approaches

Grouped by the brief's jobs: reproduce selected result; isolate untrusted
notebooks; preserve authorship/annotations; offline export; predictable
resources; data references; review UX. Each entry states what is different from
a naive "Jupyter + Docker" baseline.

### 1.1 Reproducible environment builders (beyond hand-written Dockerfiles)

- **repo2docker + BinderHub / mybinder.org.** repo2docker inspects a repository
  for community-standard config files and builds a user-environment container
  image reproducibly; the same images back JupyterHub/BinderHub sessions.
  Content providers include Git servers, Zenodo, Figshare, Dataverse, and the
  Software Heritage Archive; images can be pushed to a registry for reuse.
  Material difference: declarative env from repo files instead of bespoke
  Dockerfiles; on-demand BinderHub builds. Primary: repo2docker latest docs
  front page (S01).
- **conda-lock / pixi / renv lockfiles.** For mixed Python/R, lock the resolved
  graph rather than the loose spec: `conda-lock` (conda), `pixi` (conda-based,
  hyper-sandboxed task runner), `renv.lock` (R). A reviewer rebuilds from the
  lock, not from "latest numpy". Material difference: exact-by-default
  reinstall vs floating `pip install -r requirements.txt`. Primary: Posit renv
  + Quarto docs pattern (S05/S10); pixi behavior noted in community source
  (S11, secondary).
- **Quarto manuscripts / executable documents.** Quarto renders `.qmd` /
  Jupyter notebooks with Python (Jupyter), R (Knitr), Julia, Observable JS to
  HTML/PDF/Word/EPUB/slides/books from one source, with cross-refs, citations,
  parameters. Material difference: the review artifact is a rendered,
  parameterized manuscript with embedded code, not a live notebook that must be
  re-executed to be read. Primary: Quarto guide index (S05).

### 1.2 Review, diff, annotation, provenance

- **nbdime + ReviewNB / nb-viewer flows.** `nbdime` gives cell-aware notebook
  diff/merge (vs line-diff of JSON); ReviewNB renders notebook diffs in pull
  requests. Material difference: reviewable notebook PRs instead of opaque
  `.ipynb` blobs. (S08, docs + release notes.)
- **JupyText paired formats.** Pair `.ipynb` with a plain-text `.md`/`.py:percent`
  companion for clean version control and review, keeping the notebook as the
  execution surface. Material difference: git-legible history without losing
  outputs. (S08 secondary; primary docs cited in source map.)
- **nbformat metadata + signatures.** `.ipynb` is JSON: cells, outputs, and a
  `metadata` dict at notebook/cell level (authorship, kernelspec,
  language_info, custom keys). `nbformat.sign` provides notebook signatures;
  validation is JSON-Schema based. Authorship/annotations live in metadata,
  not in filenames. Material difference: preserve/verify `metadata.authors`,
  cell tags, execution counts as data. Primary: nbformat latest docs (S03).
- **Whole Tale / Renku / Code Ocean.** Hosted reproducibility capsules/lineage:
  Whole Tale (data+code+env tales), Renku/RenkuLab (git-lineage reproducible
  data-science projects with environments), Code Ocean (versioned compute
  capsules attached to publications). Material difference: publish-and-rerun
  capsules with DOIs vs "email me the notebook". (S07 survey + platform docs.)

### 1.3 Isolation for untrusted notebooks (reviewer safety)

Naive `docker run image` is NOT a hostile-input boundary. Ordered options:

- **Docker hardening subset (floor, not ceiling):** `--network none`,
  `--memory/--cpus`, `--pids-limit`, `--read-only` + tmpfs, `--cap-drop ALL`,
  `--security-opt no-new-privileges`, non-root user, seccomp profile. Fast,
  familiar, but shares the host kernel; escape surface is real.
- **gVisor (runsc).** User-space kernel intercepting syscalls; Docker runtime
  switch `--runtime=runsc`. Stronger than plain runc for untrusted code with
  moderate overhead; some syscall/GPU gaps. Primary: gVisor + Docker docs (S06).
- **Firecracker / Kata microVMs.** Hardware-virtualized boundary (~125 ms boot,
  snapshot/restore); right answer for actively hostile multi-tenant execution
  (E2B/Modal pattern). Costs a VM per execution. (S06 survey.)
- **nsjail / bubblewrap / Landlock+seccomp.** Process-level jails for
  single-tenant "run this student's notebook once" cases; lighter than a VM,
  weaker than a hypervisor. Do not confuse with full multi-tenant isolation.
- **Managed sandboxes (E2B, Modal, Daytona).** Outsource the hostile-code
  boundary to someone's Firecracker/gVisor fleet via SDK; code leaves the
  machine and billing/metering applies. Material difference: no local
  sandbox engineering, but external dependency + data-egress review.
- **Static pre-checks before any execution:** nbformat validation, kernel
  allowlist, cell-source scan for obvious exfiltration (`socket`, `urllib`,
  `!curl`, `%%bash`), output-size caps, execution-count sanity. These are
  triage, not a sandbox.

### 1.4 Offline export (review without re-execution)

- **nbconvert exporters.** `--to html|latex|pdf|webpdf|slides|markdown|rst|script|
  notebook`, `--template` per exporter, `--embed-images` for single-file HTML.
  LaTeX/PDF path needs pandoc + TeX; webpdf path renders HTML then headless
  Chromium via Playwright (`nbconvert[webpdf]`). Material difference: the
  archive/review copy is static and portable; re-execution is optional.
  Primary: nbconvert latest usage (S04).
- **Quarto render as the offline record.** `quarto render` produces the frozen
  HTML/PDF/Word with figures/tables embedded; parameters make "selected
  result" explicit. (S05.)
- **Data-reference policy for offline bundles:** bundle-by-hash (content
  address), include a manifest (URL, DOI, SHA-256, byte size, license), and
  fail closed when a referenced object is missing rather than silently
  substituting.

### 1.5 Predictable resources

- **Docker cgroup flags as the mechanism:** `--memory`, `--memory-swap`,
  `--memory-reservation` (soft), `--cpus`, `--pids-limit`, `--blkio-*`.
  Default is NO constraint: a container may use whatever the host kernel
  scheduler allows. Units are integer + `b|k|m|g`. Kernel/cgroup support
  gates features (`docker info` warnings, e.g. "No swap limit support").
  The daemon's OOM score is adjusted to be less likely killed; container
  processes are not — expect the container to be OOM-killed first.
  Primary: Docker resource-constraints docs (S02).
- **JupyterHub placement:** SystemdSpawner (cgroup per single-user server via
  systemd; CPU shares equalized across users regardless of process count) or
  KubeSpawner (Kubernetes CPU/memory requests+limits per pod). Material
  difference: per-reviewer quotas at the spawner, not per-cell guesses.
  Primary: systemdspawner README (S09).
- **Queue + timeout + output caps:** one reproduction job = one container/VM
  with wall-clock timeout, memory/CPU caps, log/output byte caps, no network
  by default, wiped scratch afterwards. Predictability comes from the caps,
  not from trusting notebook code.

### 1.6 Data references and history evidence

- **Content-addressed data + repository DOIs:** Zenodo / Figshare / Dataverse
  records with versioned DOIs; manifest pins record version + file SHA-256.
  repo2docker can already fetch from these providers (S01).
- **DVC / git-annex for large ecology datasets:** pointer files in git, blobs
  in content store; reviewer fetches exactly the pinned blobs.
- **Environment/history bundle:** lockfiles + image digest (not tag) + kernel
  versions + `pip freeze`/`sessionInfo()` + cell execution timestamps +
  input manifest hashes. That bundle is the "history evidence" a reviewer
  checks before trusting a green re-run.

## 2. O2 — Consequential primary-source behavior, defaults, limits

### 2.1 Docker resource constraints (S02, Docker Engine docs)

- Default: no constraints. Must opt into every cap.
- Memory flags take positive integer + `b|k|m|g` (bytes … gigabytes).
  Hard (`--memory`) vs soft (`--memory-reservation`); swap via
  `--memory-swap`; combined settings interact (alone vs together differ).
- CPU via `--cpus` (fractional allowed, e.g. 1.5), `--cpu-shares` (relative
  weight), cpuset pinning. Kernel/cgroup support required; check
  `docker info` for disabled capabilities.
- OOM: kernel OOM-killer may kill any process; Docker lowers the daemon's
  OOM priority, not the container's, so the container dies first. Mitigations:
  pre-size hosts, cap every job, treat swap as a buffer not a plan, use
  service-level placement for memory-heavy repros.
- Applicability to S03: every reviewer reproduction runs with explicit
  `--memory`, `--cpus`, `--pids-limit`, `--network none` (unless data fetch is
  an explicit, logged phase), read-only root + writable scratch tmpfs,
  non-root user, timeout kill. Units documented in job records (e.g. `2g`,
  `1.5` CPUs) so "predictable" is auditable.

### 2.2 nbconvert exporters and offline defaults (S04, nbconvert latest)

- `--to` is REQUIRED since 6.0 (no default; 5.x defaulted to `html`). Explicit
  `--to=html` restores old one-arg behavior.
- HTML templates: `--template lab` (default, JupyterLab-like full render),
  `classic`, `basic`. `--theme` defaults to `light` (also `dark`/custom).
  `--embed-images` inlines images as base64 for a single portable file.
- LaTeX: `--template article` (default) / `report`; honors notebook metadata
  `authors/title/date` (CLI overrides `--LatexPreprocessor.*`); needs pandoc.
  PDF = LaTeX path; WebPDF = HTML→headless-Chromium→PDF, needs
  `nbconvert[webpdf]` (Playwright Chromium).
- Applicability: the service's offline bundle should be
  `--to html --embed-images` (always readable) plus `--to pdf` or webpdf for
  archival, plus the source `.ipynb` and input manifest. Old 5.x custom
  `.tpl` templates need `--template-file` compat mode under 6.x.

### 2.3 nbformat: JSON, metadata, validation (S03, nbformat latest)

- `.ipynb` is JSON: top-level `metadata`, `cells[]` (code/markdown/raw with
  `source`, `outputs`, `execution_count`, per-cell `metadata`), `nbformat`,
  `nbformat_minor`.
- Authorship/annotations are metadata conventions (e.g. `metadata.authors[]`
  with `name`, `metadata.title/date`, cell tags/ids), not a fixed schema;
  the service must define and preserve its keys and document which it signs.
- Validation is JSON-Schema; default validator is `fastjsonschema`, switchable
  to `jsonschema` via env `NBFORMAT_VALIDATOR=jsonschema`. `nbformat.sign`
  covers notebook signatures. Programmatic construction via
  `nbformat.v4.new_*` helpers; read/write via `nbformat.read/write`.
- Limits: schema validation catches shape errors, not malicious code; a valid
  notebook can still be hostile. Signatures prove "this bytes was seen", not
  "this code is safe".
- Applicability: ingest validates + normalizes to a pinned `nbformat(_minor)`,
  preserves unknown metadata keys round-trip, records validator + version in
  the review record, and never drops authors/cell-ids during re-save.

### 2.4 repo2docker behavior (S01, repo2docker latest)

- Input: source repo URL/path. Steps: detect config files → select buildpacks
  → build OCI image → optionally push → run. Explicit `Dockerfile` supported
  but discouraged for researchers.
- Config-file driven (per docs): `requirements.txt`, `environment.yml`,
  `Pipfile`, `Project.toml`, `DESCRIPTION`/`install.R` (R), `apt.txt`,
  `postBuild`, `start`, etc. Detection order and buildpack precedence are
  deterministic per release; pin the repo2docker version + base image.
- Providers: GitHub/GitLab, Zenodo, Figshare, Dataverse, Software Heritage,
  generic git/archive. Output is an OCI image usable by JupyterHub/BinderHub
  or any OCI runtime (Docker/Podman noted).
- Limits: builds need network + registry + build cache to be fast; unpinned
  specs rebuild differently over time (lockfiles fix this); R/Python mixes
  need both stacks declared. Not itself a hostile-code sandbox — the built
  image still needs runtime caps (see §1.3/§2.1).
- Applicability: the service's "reproduce" path is repo2docker-build →
  content-hash the image digest → run selected cells/params under caps with
  no network. Record repo URL, resolved commit/DOI, config files found,
  repo2docker version, image digest.

### 2.5 Quarto execution model (S05, Quarto guide)

- Engines: Jupyter for Python/Julia/Observable, Knitr for R; `.qmd` can mix
  via per-block engines. Execution options include `freeze` (reuse prior
  outputs), `cache`, parameters (`params`), `execution-dir`, timeouts.
- Outputs from one source: HTML/PDF/Word/EPUB/slides/dashboards/books/
  manuscripts with figures, tables, citations, cross-refs.
- Applicability: "selected result" = named Quarto parameter set + frozen
  outputs; reviewer re-renders with the same params. `freeze` gives
  offline-stable review; re-execution is a deliberate, capped job.

### 2.6 JupyterHub placement (S09, systemdspawner)

- SystemdSpawner runs each single-user server in its own systemd unit/cgroup;
  CPU scheduling equalizes across users regardless of per-user process count
  (100 processes ≠ 100× CPU). Memory/CPU via unit properties (cgroup v2).
- Alternative KubeSpawner maps to K8s requests/limits per pod.
- Applicability: small ecology group → single-host SystemdSpawner with
  per-user mem/CPU caps is the lightest predictable placement; K8s only if
  multi-host/queue is needed.

## 3. O3 — Issue/fix/regression/release chain (one worked, one noted)

### 3.1 Worked: nbconvert 5.x → 6.0 default-format removal (breaking change)

- Behavior: 5.x `jupyter nbconvert notebook.ipynb` defaulted to HTML. 6.0
  removed the default; the same command now fails unless `--to` is given.
  Migration: add `--to=html`. Custom 5.x `--template foo.tpl` files moved to
  `--template-file` compat mode.
- Why it matters for S03: any "export" automation written against 5.x silently
  breaks (hard error, not wrong output — the safe failure mode) on 6.x. The
  service must pin nbconvert, pass `--to` explicitly, and declare the template
  (`lab`/`classic`/`basic`) + theme explicitly rather than relying on
  defaults. Offline-bundle jobs should assert exporter + template + pandoc/TeX
  or Playwright versions in the job record.
- Evidence: nbconvert latest usage page "Default output format" (§2.2, S04);
  6.x changelog/release notes (S04b in source map). No CVE; a deliberate
  breaking release, not a regression — classified as evolution chain.

### 3.2 Noted: nbformat validator default (fastjsonschema) + env override

- `NBFORMAT_VALIDATOR=jsonschema` switches the JSON-Schema backend. Relevant
  because validation error messages and edge-case acceptance can differ by
  backend/version. The service pins both nbformat and the validator backend
  and logs them. (S03.) Not a bug chain; a configuration-applicability note.

No silent-security-fix claim is made here; Jupyter security advisories were not
needed for the design and were not chased as the O3 chain. If the later plan
comparison demands a CVE-anchored chain, the honest gap is recorded in draft §6.

## 4. Retained alternatives and conditions (pre-reveal)

- **A. repo2docker + capped run (recommended default).** Declarative env,
  digest-pinned image, `--network none` re-run of selected params. Condition:
  lockfiles required for exactness; builds need cache/registry.
- **B. Quarto-frozen review + optional re-execution.** Fast offline review of
  frozen outputs; re-run only on demand. Condition: authors provide `.qmd` or
  convertible notebooks + params; freeze must be verifiable (hash of outputs).
- **C. Capsule publishing (Renku/Whole Tale/Code Ocean).** Strongest provenance
  story, DOI-linked. Condition: external platform dependency; heavier than a
  "lightweight" group service; evaluate per-publication, not per-review.
- **D. Managed sandbox execution (E2B/Modal).** Strongest hostile-code story
  with least local engineering. Condition: data egress + cost + availability;
  rejected as the default for a small academic group, retained as an
  escalation path for genuinely untrusted submissions.
- **E. Plain Docker only.** Rejected as the sole boundary for untrusted code;
  retained only for trusted/internal re-runs with caps, or under gVisor/microVM.

Original constraints preserved: mixed Python/R, heterogeneous laptops (so the
server builds the env; laptops only submit/review), selected-result (not
whole-notebook) reproduction, authorship/annotation preservation, offline
export, predictable resources.

## 5. Disagreement and uncertainty (pre-reveal)

- Whether "lightweight" permits a Kubernetes/BinderHub control plane vs a
  single-host SystemdSpawner + job queue. Lean: single host first.
- Whether R support goes through repo2docker's R buildpack + renv, or a
  separate RStudio/Posit path. Lean: repo2docker + renv.lock, Quarto for render.
- Exact CPU/memory defaults cannot be set from docs alone; they need sizing
  runs on real ecology notebooks (see §7). Any numbers in draft are starting
  points, not promises.
- Data-license handling for offline bundles (redistribution rights for
  third-party ecology datasets) is unresolved policy, not a tooling question.

## 6. Scope notes

Small product brief, not unlimited production guarantees. Out of scope:
multi-institution federation, GPU scheduling, long-lived interactive sessions,
plagiarism detection, IRB/human-subjects workflows. Security posture is
"untrusted-notebook" (malicious or compromised author possible), not
"nation-state vs the facility".

## 7. O6 — Discriminating validations: proposed vs executed

Executed in this stage: documentation/source reads only (see source-map.json
`observed_operations`). No code was run, no image built, no notebook executed.
The following proposals discriminate between designs; none has run.

- V1 (env determinism): build the same repo twice (cold cache vs warm) with
  pinned repo2docker; assert identical image digests or explain drift; then
  rebuild with lockfiles removed and show drift. Discriminates A vs E.
- V2 (selected-result): define one parameterized Quarto/nbconvert target; run
  with `--network none` under caps; assert exit code, output hashes, wall time,
  peak RSS within declared bounds. Discriminates "reproduces" from "runs".
- V3 (isolation): execute a canary notebook attempting egress (`socket`,
  `!curl`), host read (`/etc/passwd`, `~/.ssh`), fork bomb (bounded), and
  large-output flood; assert deny/contain/kill + alert on each runtime
  (plain-docker vs gVisor vs microVM). Discriminates §1.3 options honestly.
- V4 (authorship round-trip): ingest a notebook with authors/cell-ids/tags,
  re-save through the service, assert byte-meaningful preservation + signature
  verify + `nbdime diff` shows only expected changes.
- V5 (offline bundle): render HTML-embedded + PDF from the same source;
  open both with network disabled; assert figures/data-manifest present and
  hashes match. Discriminates "offline" claims.
- V6 (resource predictability): run a matrix of small/medium/large ecology
  notebooks under candidate caps; record OOM/timeout rates vs caps; publish
  the sizing table. Sets real defaults for §2.1/§2.6.
- V7 (data refs): substitute a wrong-hash blob and a missing DOI version;
  assert fail-closed with a clear message, never silent substitution.

## 8. Pre-reveal checklist

- [x] Brief obligations O1–O6 addressed from brief + public sources.
- [x] Thin plan NOT read (no plan-root-only.md access before freeze).
- [x] source-map.json written with immutable IDs, exact URLs/versions,
      access timestamps, observed operations; usage/billing null.
- [x] Bounded evidence retained under sources/ with index.
- Next: run reveal-plan.py (freezes this file), read revealed-plan.md, write
  draft.md with per-P disposition without rewriting this file.
