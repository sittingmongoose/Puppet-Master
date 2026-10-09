# ER11 A-M03-A control/research — Draft (S03 lab-notebooks, post-reveal)

Case S03 lab-notebooks; method M03 v1 critic-finalizer, research stage.
Brief: lightweight computational notebook review service for an academic
ecology group — mixed Python/R arrivals with data references, heterogeneous
laptops, reviewer reproduction of a selected result without granting uploaded
notebooks unrestricted access, authorship/annotation preservation, offline
export, predictable resources, existing-tools + environment/history evidence.

This draft is a complete, self-contained planning deliverable for this scope;
later M03 stages (critic, reviser) may correct it. It compares every exact P
clause of the revealed thin plan against pre-reveal discovery (frozen
discovery.md, SHA recorded in plan-reveal.json; discovery was NOT rewritten
after reveal). All findings are stated in full text, not by ID. Validations
separate executed checks from proposals. No runtime was available; nothing
below claims an execution that did not happen.

Revealed thin plan (exact, from revealed-plan.md):

- P1: Store notebooks in Git.
- P2: Run each notebook in a Docker container using the latest dependencies.
- P3: Capture stdout and HTML as proof.
- P4: Resolve data URLs at execution time.
- P5: Show a green reproduction badge when exit code is zero.
- P6: Add collaborative annotations later.

Source basis: source-map.json (S01–S10) with bounded excerpts in sources/.
Fetched primaries: repo2docker docs (S01), Docker resource constraints (S02),
nbformat docs (S03), nbconvert usage (S04), Quarto guide (S05). Snippet-only
leads: sandbox options (S06), capsule platforms (S07), systemdspawner (S09).
Unverified leads (honesty-flagged): nbdime/ReviewNB/JupyText (S08),
renv/conda-lock/pixi (S10). O3 evolution chain: nbconvert 5.x→6.0 default
removal (S04).

## 1. Per-P disposition (exact)

Disposition vocabulary: keep (already-covered), correct (keep intent, fix
mechanism), extend (optional enhancement), user-decision, reject, uncertain.

### P1: "Store notebooks in Git." — KEEP intent, CORRECT mechanism

What is right: git is the correct history substrate for review (branches per
submission, pull-request review, blame, signed commits). Keep.

What must change:

- Raw `.ipynb` in git is JSON blobs: line-diff is unreadable, outputs bloat
  history, merges conflict spuriously. Correct to: git + notebook-aware
  review (cell-aware diff in the nbdime pattern; pull-request notebook
  rendering in the ReviewNB pattern) and/or paired plain-text companions
  (JupyText-style `.md`/`.py:percent`) so history stays legible. These are
  S08 leads: commit is to "evaluate and adopt one pairing + one diff path,"
  not to a specific version, until verified.
- Large datasets and outputs do not belong in git objects. Correct to: git
  for code/notebooks/manifests; large blobs via content store with pointer
  files (DVC/git-annex pattern) or external versioned records (Zenodo /
  Figshare / Dataverse with DOIs), pinned by manifest (see P4).
- Authorship/annotations live in `metadata` (notebook + cell level: authors,
  title, date, cell ids/tags, kernelspec, language_info) per nbformat (S03).
  Ingest must validate against a pinned nbformat minor, preserve unknown
  metadata keys round-trip, never drop authors/cell-ids on re-save, and
  record validator + version. Optionally sign (`nbformat.sign`) to prove
  "these bytes were seen" — signatures attest custody, not safety.
- Already-covered by discovery §1.2/§2.3/§4; the correction is the mechanism,
  not the git decision.

### P2: "Run each notebook in a Docker container using the latest dependencies." — CORRECT (major): reject "latest", harden "Docker"

Two independent faults:

1. "Latest dependencies" destroys reproducibility. Floating `pip install`
   rebuilds differently over time; "reproduced" becomes meaningless.
   Correct to: lockfiles as the reinstall unit (`requirements` + hashes /
   `conda-lock` / `pixi.lock` for Python, `renv.lock` for R — S10 leads),
   repo2docker (S01) building from declared config files with a pinned
   repo2docker version + base image, and digest-pinned (not tag-pinned)
   image references recorded with repo URL, resolved commit/DOI, config
   files found, and kernel versions. Reviewer rebuilds from the lock, never
   from "latest". Rebuild-twice determinism is validation V1.
2. Plain `docker run` is not an untrusted-notebook boundary. It shares the
   host kernel; `--cap-drop` alone is not equivalent to a syscall barrier or
   hypervisor for hostile input (S06). Correct to a tiered posture:
   - Default every job: explicit caps (`--memory`, `--cpus`, `--pids-limit`,
     `--network none` unless a declared fetch phase, read-only root + scratch
     tmpfs, `--cap-drop ALL`, `no-new-privileges`, non-root user, wall-clock
     timeout, log/output byte caps, wiped scratch). Docker's default is NO
     constraint (S02); every cap is opt-in, memory units are integer +
     `b|k|m|g`, and containers (not the daemon) are OOM-killed first.
   - Escalation for genuinely untrusted submissions: gVisor (`runsc`
     runtime) or Firecracker/Kata microVMs; managed sandboxes (E2B/Modal
     pattern) as an outsourcing option with data-egress review (S06).
   - Static pre-checks before any run (triage, not a sandbox): nbformat
     validation, kernel allowlist, source scan for egress primitives,
     output-size and execution-count sanity.
   - Placement: single-host per-user cgroups (SystemdSpawner pattern: one
     cgroup per server, CPU equalized across users — S09) with per-user
     quotas; Kubernetes only if multi-host queuing is needed (user decision).

### P3: "Capture stdout and HTML as proof." — CORRECT: necessary but insufficient as "proof"

Keep capturing stdout + HTML; reject them as sufficient proof:

- Stdout proves the process wrote bytes; HTML proves a render happened. Neither
  proves the selected result reproduced (wrong numbers with exit 0, stale
  outputs, nondeterministic ordering, network-dependent success all pass).
- Correct "proof" to a verification bundle: named selected result (parameter
  set, e.g. Quarto params) + exit code + output hashes (figures, tables, key
  scalars) + input manifest hashes + environment record (image digest,
  lockfiles, kernel versions, `pip freeze`/`sessionInfo()`) + execution bounds
  (wall time, peak RSS, caps) + network mode. "Reproduced" = hashes match
  within declared tolerances under declared caps with no network.
- Correct the HTML leg: pass `--to` explicitly (required since nbconvert 6.0;
  5.x defaulted to html — S04 evolution chain), pin exporter + template
  (`lab` default / `classic` / `basic`), `--theme` (default `light`),
  `--embed-images` for single-file portable HTML; LaTeX/PDF needs pandoc +
  TeX, WebPDF needs `nbconvert[webpdf]` (Playwright Chromium). Old 5.x custom
  `.tpl` files need `--template-file` compat mode. Offline bundle = embedded
  HTML + PDF + source `.ipynb` + input manifest, all openable with network
  disabled (validation V5).
- Quarto alternative retained: `quarto render` with frozen outputs
  (`freeze`/`cache`) as the offline record; re-execution is deliberate and
  capped (S05).

### P4: "Resolve data URLs at execution time." — REJECT as stated, CORRECT to manifest-pinned fetch

Live URL resolution at execution time causes drift (mutable URLs), offline
failure, silent substitution, and an exfiltration channel (untrusted notebook
choosing URLs during a networked run). Correct to:

- Ingest-time manifest: every data reference becomes a row (source URL/DOI,
  record version, file SHA-256, byte size, license). Fetch happens in an
  explicit, logged phase (or pre-fetch at submit time), each blob verified by
  hash, failures fail closed with a clear message — never silent substitution.
- Reproduction runs with `--network none` against the verified local blobs.
- Providers already reachable declaratively include Zenodo, Figshare,
  Dataverse, Software Heritage (S01); large ecology datasets via DVC/git-annex
  pointers to a content store. Offline bundles embed blobs the license allows
  and list the rest as explicit absences with hashes.
- Data-license redistribution policy is a user decision (unresolved; §5).

### P5: "Show a green reproduction badge when exit code is zero." — REJECT as stated, CORRECT to graded attestation

Exit code 0 ≠ reproduced. A green badge on exit code alone certifies "the
process did not crash," including wrong-output, nondeterministic, and
network-dependent runs. Correct to a graded badge:

- Green ("reproduced"): exit 0 AND output hashes match the declared selected
  result within tolerances AND run respected declared caps/bounds AND
  network-disabled (or declared fetch phase only) AND provenance complete
  (image digest, lockfiles, input manifest).
- Amber ("ran, not verified"): exit 0 but hashes absent/tolerance-exceeded or
  provenance incomplete.
- Red ("failed"): nonzero exit, timeout, OOM, cap breach, or hash mismatch
  beyond tolerance — with the discriminating reason shown, not just red.
- Badge policy thresholds (tolerances for stochastic outputs, required vs
  optional provenance rows) are a user decision; defaults ship conservative
  (fail closed) with the sizing table from validation V6.

### P6: "Add collaborative annotations later." — CORRECT: authorship/annotations are phase-1, rich collab is the optional part

The brief requires authorship + annotation preservation; deferring all of it
loses provenance that cannot be reconstructed later. Correct to:

- Phase-1 (required): preserve + display authorship/cell metadata round-trip
  (P1 mechanism), append-only review notes attached to cell ids / notebook
  version (reviewer, timestamp, resolved-state), execution annotations
  (who ran what params under which caps with which result). No silent
  metadata drops; `nbdime`-pattern diffs show annotation changes (S08 lead).
- Later (optional enhancement): real-time collaborative editing, threaded
  in-cell discussion, suggestion/approval workflows, ORCID-linked identities.
- User decision: identity model (local accounts vs institutional SSO vs ORCID)
  and whether review notes live in-repo (paired files) or in-service (DB with
  export). Either way they export offline with the bundle.

## 2. Retained design (corrected plan, self-contained)

Pipeline: submit → validate+freeze → build → verify-run → attest → export.

1. Submit: `.ipynb` and/or `.qmd` + data references + declared selected result
   (params/named outputs). Laptops only submit/review; the server builds.
2. Validate+freeze: pin nbformat minor, validate (record validator+version),
   normalize kernelspec allowlist, write the input manifest (hashes), freeze
   annotations/authorship, static triage scan. Fail closed with reasons.
3. Build: repo2docker from lockfiles + config files, pinned toolchain, output
   digest-pinned image; record full environment evidence.
4. Verify-run: one job = one capped container/VM, `--network none`, timeout,
   output caps, wiped scratch; compare output hashes to declared result.
5. Attest: graded badge (green/amber/red) with the verification bundle
   attached; every claim links to hashes, digests, and bounds.
6. Export: offline bundle (embedded HTML + PDF + source + manifest + review
   notes) verifiable without network or re-execution.

Original constraints preserved: mixed Python/R (lockfiles per stack, Quarto
dual-engine render), heterogeneous laptops (server-side build/run), selected
result (params, not whole-notebook), authorship/annotations, offline export,
predictable resources (explicit caps + quotas + sizing table).

## 3. Retained alternatives with conditions

- A. repo2docker + capped run (default). Condition: lockfiles mandatory;
  builds need cache/registry; unpinned specs rejected or amber-badged.
- B. Quarto-frozen review + on-demand re-execution. Condition: authors supply
  params + convertible sources; frozen outputs hash-verified.
- C. Capsule publishing per publication (Renku/Whole Tale/Code Ocean pattern,
  S07). Condition: external dependency + heavier than group review; reserve
  for archival publication, not every review.
- D. Managed-sandbox escalation (E2B/Modal pattern, S06). Condition: data
  egress + cost review; for genuinely untrusted submissions.
- E. Plain-Docker-only. Rejected as the untrusted default; retained only for
  trusted/internal re-runs under full caps, or under gVisor/microVM.

## 4. Optional capabilities and user decisions

- Resource defaults (memory/CPU/timeout/output caps): ship conservative
  starting points, then set from sizing runs (V6). User approves the table.
- R stack: repo2docker R buildpack + `renv.lock` (lean) vs separate
  RStudio/Posit path. User decides after a pilot mixed repo.
- Placement: single-host SystemdSpawner-style quotas (lean) vs Kubernetes/
  BinderHub control plane. User decides on scale needs.
- Identity: local vs SSO vs ORCID; review-note storage: in-repo vs in-service.
- Badge tolerances for stochastic outputs; required provenance rows.
- Data redistribution: which bundles may embed third-party blobs.
- Capsule publishing (C) and managed sandbox (D) adoption thresholds.

## 5. Uncertainty and disagreement (preserved, not hidden)

- Exact CPU/memory/timeout defaults cannot be set from docs; V6 sizing runs
  on real ecology notebooks are required. Any numbers elsewhere are starting
  points.
- S08 (nbdime/ReviewNB/JupyText) and S10 (renv/conda-lock/pixi) were leads at
  freeze, not fetched primaries; draft commits only to "evaluate and adopt"
  for these. S06/S07/S09 are snippet-level; pin versions before building.
- Single-host vs Kubernetes, and repo2docker-R vs Posit, are genuine forks;
  this draft leans single-host + repo2docker-R with reasons, and preserves
  the other branch.
- No CVE-anchored O3 chain was chased; the O3 chain is the nbconvert 5.x→6.0
  breaking release (deliberate evolution, safe failure mode: hard error, not
  wrong output). If a later stage demands a security-advisory chain, that gap
  is explicit, not covered by vague claims.
- Scope stays a small product brief: no multi-institution federation, GPU
  scheduling, long-lived sessions, plagiarism detection, or IRB workflows.

## 6. Validations: executed vs proposed (O6)

Executed in research stage: documentation/source reads only (source-map.json
`observed_operations`; bounded excerpts in sources/). No code run, no image
built, no notebook executed, no badge computed. Everything below is proposed,
designed to discriminate between the retained options; none has run.

- V1 env determinism: build same repo twice (cold vs warm cache, pinned
  toolchain); assert identical digests or explain drift; rebuild with
  lockfiles removed and show drift. Discriminates A vs floating (P2).
- V2 selected-result: parameterized target under `--network none` + caps;
  assert exit code, output hashes, wall time, peak RSS within bounds.
  Discriminates "reproduces" from "runs" (P3/P5).
- V3 isolation canaries: egress attempt, host read, bounded fork, output
  flood; assert deny/contain/kill + alert per runtime (plain vs gVisor vs
  microVM). Discriminates §1.3 tiers honestly (P2).
- V4 authorship round-trip: ingest with authors/cell-ids/tags, re-save,
  assert preservation + signature verify + diff shows only expected changes
  (P1/P6).
- V5 offline bundle: embedded HTML + PDF from same source, opened with
  network disabled, manifest hashes match (P3/P4).
- V6 sizing matrix: small/medium/large ecology notebooks under candidate
  caps; OOM/timeout rates per cap; publish sizing table (P2/P5).
- V7 data-ref integrity: wrong-hash blob + missing DOI version; assert
  fail-closed with clear message, never silent substitution (P4).

## 7. Obligation check

- O1 unfamiliar tools/approaches: repo2docker/BinderHub, Quarto manuscripts,
  nbdime/ReviewNB/JupyText, nbformat signatures, Whole Tale/Renku/Code Ocean,
  gVisor/Firecracker/nsjail/managed sandboxes, lockfiles (conda-lock/pixi/
  renv), DVC/git-annex, Zenodo/Figshare/Dataverse/Software Heritage,
  SystemdSpawner/KubeSpawner quotas.
- O2 primary behavior/defaults/limits: Docker (S02), nbconvert (S04),
  nbformat (S03), repo2docker (S01), Quarto (S05), spawners (S09).
- O3 evolution chain: nbconvert 6.0 default removal + compat path; nbformat
  validator note; no invented CVE chain.
- O4 per-P comparison: §1 (P1 keep+correct; P2 major correct; P3 correct;
  P4 reject+correct; P5 reject+correct; P6 correct phasing).
- O5 self-contained final with alternatives/conditions/disagreement: §2–§5.
- O6 validations separated: §6; scope is this brief, not unlimited guarantees.
