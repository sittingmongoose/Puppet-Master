# ER11 A-M03-A control/reviser — Final (S03 lab-notebooks)

Case S03 lab-notebooks; method M03 v1 critic-finalizer, reviser stage.
Brief: lightweight computational notebook review service for an academic
ecology group — mixed Python/R arrivals with data references, heterogeneous
laptops, reviewer reproduction of a selected result without granting uploaded
notebooks unrestricted access, authorship/annotation preservation, offline
export, predictable resources, existing-tools + environment/history evidence.

This final is ONE coherent, complete, self-contained planning deliverable. It
covers every brief obligation O1–O6 and every exact P clause of the revealed
thin plan in full material text — no finding is stated by ID alone. It is the
product of the draft (post-reveal), the frozen pre-reveal discovery, and the
independent critique, with every criticism explicitly accepted, amended,
rejected, or retained as uncertainty on evidence (§7). All six P dispositions
from the draft STAND (the critic found no false correction or false
rejection, and my independent verification agreed); what changed is sourcing
weight, mechanism exactness, and recorded conditions — never the dispositions.

Revealed thin plan (exact, from revealed-plan.md):

- P1: Store notebooks in Git.
- P2: Run each notebook in a Docker container using the latest dependencies.
- P3: Capture stdout and HTML as proof.
- P4: Resolve data URLs at execution time.
- P5: Show a green reproduction badge when exit code is zero.
- P6: Add collaborative annotations later.

Source basis: research S01–S10, critic C01–C08 (both read in full from the
declared source roots; IDs referenced, never redefined), plus reviser R01–R06
(source-map.json, sources/): repo2docker configuration index (fetched),
renv/Posit lockfile docs (fetched), systemdspawner README (fetched), ReviewNB
homepage (fetched) + blog (search), DVC mechanism (search), Quarto
freeze/cache (search; primary fetch inconclusive, honestly softened).
Validations separate executed checks (documentation/source reads only) from
proposals. No runtime was available in any stage; nothing below claims an
execution that did not happen.

Disposition vocabulary: keep (already-covered), correct (keep intent, fix
mechanism), extend (optional enhancement), user-decision, reject, uncertain.

## 1. Per-P disposition (exact)

### P1: "Store notebooks in Git." — KEEP intent, CORRECT mechanism

What is right: git is the correct history substrate for review (branches per
submission, pull-request review, blame, signed commits). Keep.

What must change:

- Raw `.ipynb` in git is JSON blobs: line-diff is unreadable, outputs bloat
  history, merges conflict spuriously. Correct to git + notebook-aware review:
  cell-aware diff in the confirmed nbdime pattern (`nbdiff`/`nbmerge`, terminal
  + rich diff, `nbdime config-git` git integration — critic search-confirmed)
  and pull-request notebook rendering, plus paired plain-text companions in
  the confirmed JupyText pattern (`ipynb,py:percent`, `--set-formats`,
  `--sync` — critic search-confirmed) so history stays legible. The draft's
  cautious "evaluate and adopt" is now a firm commit for nbdime + JupyText:
  two independent stages agree and the mechanism descriptions match.
- Pull-request rendering fork (new condition from verification): SaaS
  ReviewNB vs self-hosted nbdime is a genuine cost/hosting fork. Verified
  from the ReviewNB primary homepage (R04): the product supports GitHub AND
  Bitbucket (the critic's single-secondary-source "GitHub-only" is superseded
  — rejected as outdated), offers a 14-day free trial, prices its Team plan
  at $79 with per-interacting-user counting, and advertises a self-host path
  behind a contact form. Secondary blog sources agree it is free for open
  source repositories and paid for private ones. Rule: public repos may use
  SaaS ReviewNB; private group repos must either budget the paid plan or take
  the self-hosted nbdime branch. Re-verify price and self-host terms from the
  primary docs before committing by name (mutable marketing page).
- Merge path (default, stated once): concurrent reviewer edits resolve in the
  paired plain-text companion first (standard git merge driver on text);
  `.ipynb`-level conflicts fall back to manual `nbmerge`-pattern web
  resolution; a custom git merge driver for notebooks is NOT the default
  (unverified, extra machinery). Reviewers are told which path applied.
- Large datasets and outputs do not belong in git objects. Correct to: git
  for code/notebooks/manifests; large blobs via content store with DVC-pattern
  pointer files (small `.dvc` files recording hash + path committed to git,
  data in cache/remote, code via `git pull/push` and data via `dvc pull/push`
  — multi-source search-confirmed, R05; verify against pinned DVC docs at
  build) or external versioned records (Zenodo / Figshare / Dataverse with
  DOIs), pinned by manifest (see P4). git-annex stays a soft "pointer-file
  pattern" mention: no stage sourced it, so it carries no weight.
- Authorship/annotations live in `metadata` (notebook + cell level: authors,
  title, date, cell ids/tags, kernelspec, language_info) per nbformat (S03,
  cross-confirmed: nbconvert's LaTeX path honors notebook-metadata
  authors/title/date, C01). Ingest must validate against a pinned nbformat
  minor, preserve unknown metadata keys round-trip, never drop authors/cell-ids
  on re-save, and record validator + version. The JSON-Schema validator backend
  switch is softened to "validator backend (confirm switch mechanism)" — the
  `NBFORMAT_VALIDATOR` env-override detail was adjacent-search-only in both
  prior stages and stays unverified. Optionally sign (`nbformat.sign`) to prove
  "these bytes were seen" — signatures attest custody, not safety.
- Already-covered by discovery §1.2/§2.3/§4; the correction is the mechanism,
  not the git decision.

### P2: "Run each notebook in a Docker container using the latest dependencies." — CORRECT (major): reject "latest", harden "Docker"

Two independent faults:

1. "Latest dependencies" destroys reproducibility. Floating `pip install`
   rebuilds differently over time; "reproduced" becomes meaningless.
   Correct to lockfiles as the reinstall unit — with the EXACT repo2docker
   integration mechanism now verified (R01), which is the draft's biggest
   gap closed:
   - repo2docker's supported-file list (fetched primary) natively consumes
     `environment.yml`, `requirements.txt`, `install.R`, `DESCRIPTION`,
     `Project.toml`, `Pipfile` and/or `Pipfile.lock`, `pyproject.toml`,
     `setup.py`, `apt.txt`, `runtime.txt`, `default.nix`, `Dockerfile`,
     `postBuild`, `start`. `Pipfile.lock` is the ONLY lockfile natively
     honored. `conda-lock.yml`, `renv.lock`, and `pixi.lock` appear nowhere
     in the list: dropping them into a repo does NOT make the build honor
     them, and a present `environment.yml` WILL be re-solved at build time.
   - Exact mechanism therefore: lockfiles are mandatory at an EXPLICIT
     install step, not assumed native. Pipfile.lock flows through the native
     path; conda-lock/renv.lock/pixi.lock are applied via explicit ordering
     (e.g. `postBuild` install step and/or a file layout repo2docker does not
     auto-solve — secondary discourse evidence shows the conda-lock workaround
     is to keep the spec out of the `environment.yml` filename and install
     the explicit lock; treat as hypothesis V1 must prove). The build record
     states for each stack which path applied.
   - R half now primary-confirmed (R02, Posit): `renv::snapshot()` saves the
     library state to `renv.lock`; `renv::restore()` restores exactly the
     recorded packages; `renv.lock` is committed to git and shared; isolated
     per-project libraries; `renv::history()`/`revert()` recover prior locks.
     Mixed Python/R coverage: Python via conda-lock/pixi/Pipfile.lock +
     requirements-with-hashes, R via renv.lock (repo2docker R side natively
     reads `install.R`/`DESCRIPTION` — confirmed on the same primary page).
     pixi stays a lead: "conda-based environment/task tool (verify before
     commit)" — its "hyper-sandboxed task runner" phrasing rested on a
     secondary snippet and is not repeated as fact.
   - Record with every build: pinned repo2docker version + base image,
     digest-pinned (not tag-pinned) image reference, repo URL, resolved
     commit/DOI, config files found, lockfile path + application path, kernel
     versions. Reviewer rebuilds from the lock, never from "latest".
     Rebuild-twice determinism is validation V1, with functional equivalence
     (same lock-resolved package set) as the primary assertion and
     bit-identical digests as a best-effort secondary ("or explain drift":
     OCI rebuilds are rarely bit-identical).
2. Plain `docker run` is not an untrusted-notebook boundary. It shares the
   host kernel; `--cap-drop` alone is not equivalent to a syscall barrier or
   hypervisor for hostile input (S06; critic-confirmed gVisor/runsc leg:
   user-space kernel, syscall interception, Docker runtime registration, the
   boundary above plain runc). Correct to a tiered posture:
   - Default every job: explicit caps (`--memory`, `--cpus`, `--pids-limit`,
     `--network none` at verify time (see phase boundary below), read-only
     root + scratch tmpfs, `--cap-drop ALL`, `no-new-privileges`, non-root
     user, wall-clock timeout, log/output byte caps, wiped scratch). Docker's
     default is NO constraint (S02/C02); every cap is opt-in, memory units are
     integer + `b|k|m|g`, and containers (not the daemon) are OOM-killed first.
   - Escalation for genuinely untrusted submissions: gVisor (`runsc` runtime)
     or Firecracker/Kata microVMs; managed sandboxes (E2B/Modal pattern) as an
     outsourcing option. Conditions (symmetric, as demanded): managed sandboxes
     carry data-egress + cost + availability review; SELF-HOSTED microVMs carry
     an ops-burden review (a VM per execution: image maintenance, patching,
     capacity, per-job latency) that a small academic group must staff or
     decline. The snippet-only boot-time figure is DROPPED (m3): the
     tiering argument never needed it. Firecracker/Kata/nsjail/E2B/Modal
     specifics remain snippet-level: pin versions before building.
   - Static pre-checks before any run — triage, not a sandbox (label kept
     verbatim everywhere the scan is mentioned, m8): nbformat validation,
     kernel allowlist, source scan for egress primitives, embedded-secret
     scan (added: untrusted notebooks may carry exfiltratable keys),
     output-size and execution-count sanity.
   - Placement: single-host per-user cgroups as the lean — now
     PRIMARY-CONFIRMED via the systemdspawner README (R03, resolves M9 with
     evidence, no downgrade): each single-user server runs in its own systemd
     service/cgroup with equal CPU scheduling across users regardless of
     process count; `mem_limit` (`K`/`M`/`G`/`T` suffixes, `None` default =
     no limit, exposed as `MEM_LIMIT`) and `cpu_limit` (float cores → rounded
     percent, `None` default, exposed as `CPU_LIMIT`); good practice is
     capping at 80–90% of physical memory. Caps are opt-in here too, so the
     service sets them. Kubernetes (KubeSpawner requests/limits per pod) only
     if multi-host queuing is needed (user decision; disagreement preserved).

Phase boundary (stated crisply once, m5): BUILD and FETCH phases are networked
and logged (builds need network + registry + cache; data fetch is an explicit
logged phase with hash verification). VERIFY runs — the reproduction that the
badge attests — execute with `--network none` against verified-local blobs.
P2's "unless a declared fetch phase" and P4's "network-disabled runs" describe
these two different phases and are consistent, not contradictory.

### P3: "Capture stdout and HTML as proof." — CORRECT: necessary but insufficient as "proof"

Keep capturing stdout + HTML; reject them as sufficient proof:

- Stdout proves the process wrote bytes; HTML proves a render happened. Neither
  proves the selected result reproduced (wrong numbers with exit 0, stale
  outputs, nondeterministic ordering, network-dependent success all pass).
- Correct "proof" to a verification bundle: named selected result (parameter
  set, e.g. Quarto params) + RANDOM SEEDS and full parameter capture (added
  per M5: stochastic ecology notebooks otherwise defeat hash comparison even
  with tolerances) + exit code + output hashes (figures, tables, key scalars)
  + input manifest hashes + environment record (image digest, lockfiles +
  application paths, kernel versions, `pip freeze`/`sessionInfo()`) +
  execution bounds (wall time, peak RSS, caps) + network mode. "Reproduced" =
  hashes match within declared tolerances under declared caps with no network.
- Correct the HTML leg: pass `--to` explicitly (required since nbconvert 6.0;
  5.x defaulted to html — critic re-verified verbatim, C01), pin exporter +
  template (`lab` default / `classic` / `basic`), `--theme` (default `light`),
  `--embed-images` for single-file portable HTML; LaTeX/PDF needs pandoc + TeX
  (honors notebook-metadata authors/title/date), WebPDF needs
  `nbconvert[webpdf]` (Playwright Chromium). Old 5.x custom `.tpl` files need
  `--template-file` compat mode. Offline bundle = embedded HTML + PDF + source
  `.ipynb` + input manifest, all openable with network disabled (V5).
- Quarto alternative RETAINED but SOFTENED (M6 either/or resolved by soften):
  `quarto render` with execution options as the offline record. Multi-source
  search agreement (R06) supports `freeze: true/auto` reusing a committed
  `_freeze/` folder so another machine renders without a runtime, `cache` for
  per-chunk skips vs `freeze` for per-document skips, and named execution keys
  — but my primary execution-options fetch returned navigation chrome only
  (inconclusive, honestly recorded), so the final commits only to "Quarto
  execution options (verify exact freeze/cache keys and `_freeze/` layout
  against the pinned quarto-cli docs before commit)". The nbconvert leg above
  carries the offline-bundle guarantee meanwhile; frozen outputs, once
  verified, are hash-checked like any other artifact.

### P4: "Resolve data URLs at execution time." — REJECT as stated, CORRECT to manifest-pinned fetch

Live URL resolution at execution time causes drift (mutable URLs), offline
failure, silent substitution, and an exfiltration channel (untrusted notebook
choosing URLs during a networked run). Correct to:

- Ingest-time manifest: every data reference becomes a row (source URL/DOI,
  record version, file SHA-256, byte size, license). Fetch happens in an
  explicit, logged BUILD/FETCH phase (networked, per the phase boundary), each
  blob verified by hash; failures fail closed with a clear message — never
  silent substitution.
- VERIFY reproduction runs with `--network none` against the verified local
  blobs. The network story is internally consistent end to end: builds need
  network (R01-class limits), verification does not have it.
- Providers already reachable declaratively include Zenodo, Figshare,
  Dataverse, Software Heritage (S01; critic re-confirmed, C07); large ecology
  datasets via DVC-pattern pointers to a content store (R05, verify pinned
  DVC docs at build). Offline bundles embed blobs the license allows and list
  the rest as explicit absences with hashes.
- Data-license redistribution policy is a user decision (unresolved; §5).

### P5: "Show a green reproduction badge when exit code is zero." — REJECT as stated, CORRECT to graded attestation

Exit code 0 ≠ reproduced. A green badge on exit code alone certifies "the
process did not crash," including wrong-output, nondeterministic, and
network-dependent runs. Correct to a graded badge:

- Green ("reproduced"): exit 0 AND output hashes match the declared selected
  result within tolerances AND seeds/params captured AND run respected declared
  caps/bounds AND network-disabled (fetch confined to the declared fetch phase)
  AND provenance complete (image digest, lockfiles + application paths, input
  manifest).
- Amber ("ran, not verified"): exit 0 but hashes absent/tolerance-exceeded or
  provenance incomplete (e.g. unpinned spec admitted for a trusted re-run).
- Red ("failed"): nonzero exit, timeout, OOM, cap breach, or hash mismatch
  beyond tolerance — with the discriminating reason shown, not just red.
- Badge policy thresholds (tolerances for stochastic outputs, required vs
  optional provenance rows) are a user decision; defaults ship conservative
  (fail closed) with the sizing table from validation V6. No external evidence
  is needed for this reasoning finding (critic M5); the seed-capture addition
  above is its strengthening.

### P6: "Add collaborative annotations later." — CORRECT: authorship/annotations are phase-1, rich collab is the optional part

The brief requires authorship + annotation preservation; deferring all of it
loses provenance that cannot be reconstructed later. Correct to:

- Phase-1 (required): preserve + display authorship/cell metadata round-trip
  (P1 mechanism), append-only review notes attached to cell ids / notebook
  version (reviewer, timestamp, resolved-state), execution annotations
  (who ran what params/seeds under which caps with which result). No silent
  metadata drops; nbdime-pattern diffs show annotation changes.
- Later (optional enhancement): real-time collaborative editing, threaded
  in-cell discussion, suggestion/approval workflows, ORCID-linked identities.
- User decision: identity model (local accounts vs institutional SSO vs ORCID)
  and whether review notes live in-repo (paired files) or in-service (DB with
  export). Either way they export offline with the bundle.
- Kernelspec policy (one sentence, m9): a submission whose kernel is not on
  the allowlist is REJECTED at ingest with a clear message naming the closest
  allowlisted equivalent, which an operator may approve as an explicit recorded
  remap — kernels are never silently remapped and never amber-badged around.

## 2. Retained design (corrected plan, self-contained)

Pipeline: submit → validate+freeze → build → verify-run → attest → export.

1. Submit: `.ipynb` and/or `.qmd` + data references + declared selected result
   (params + seeds + named outputs). Laptops only submit/review; the server
   builds.
2. Validate+freeze: pin nbformat minor, validate (record validator+version),
   enforce kernelspec allowlist (reject-with-remap-path, P6), write the input
   manifest (hashes), freeze annotations/authorship, static triage scan —
   triage, not a sandbox — including an embedded-secret scan. Fail closed with
   reasons.
3. Build (networked, logged): repo2docker from declared config files with
   lockfiles mandatory via their verified application paths (Pipfile.lock
   native; conda-lock/renv.lock/pixi.lock via explicit install step),
   pinned toolchain, output digest-pinned image; record full environment
   evidence. Data fetch phase: ingest-time manifest, hash-verified blobs.
4. Verify-run: one job = one capped container/VM, `--network none`, timeout,
   output caps, wiped scratch; compare output hashes (with seeds/params) to
   the declared result.
5. Attest: graded badge (green/amber/red) with the verification bundle
   attached; every claim links to hashes, digests, seeds, and bounds.
6. Export: offline bundle (embedded HTML + PDF + source + manifest + review
   notes) verifiable without network or re-execution.

Original constraints preserved: mixed Python/R (lockfiles per stack with
verified application paths, Quarto dual-engine render), heterogeneous laptops
(server-side build/run), selected result (params + seeds, not whole-notebook),
authorship/annotations, offline export, predictable resources (explicit caps +
quotas + sizing table).

## 3. Retained alternatives with conditions

- A. repo2docker + capped run (default). Condition: lockfiles mandatory via
  the verified application paths (§1/P2); builds need cache/registry;
  unpinned specs rejected or amber-badged; V1 must prove the conda/renv
  explicit-install ordering before it is load-bearing.
- B. Quarto-frozen review + on-demand re-execution. Condition: authors supply
  params + seeds + convertible sources; frozen outputs hash-verified; exact
  freeze/cache keys verified against pinned quarto-cli docs before commit
  (softened per R06).
- C. Capsule publishing per publication (Renku/Whole Tale/Code Ocean pattern,
  S07). Condition: external dependency + heavier than group review; reserve
  for archival publication, not every review. Stays snippet-level in all three
  stages — acceptable, because evidential weight matches decision weight (m7).
- D. Managed-sandbox escalation (E2B/Modal pattern, S06). Condition: data
  egress + cost + availability review; for genuinely untrusted submissions.
  Self-hosted microVM alternative carries the symmetric ops-burden review (M3).
- E. Plain-Docker-only. Rejected as the untrusted default; retained only for
  trusted/internal re-runs under full caps, or under gVisor/microVM.

## 4. Optional capabilities and user decisions

- Resource defaults (memory/CPU/timeout/output caps): ship conservative
  starting points, then set from sizing runs (V6). User approves the table.
- R stack: repo2docker R buildpack + `renv.lock` via explicit install step
  (lean, R01/R02) vs separate RStudio/Posit path. User decides after a pilot
  mixed repo.
- Placement: single-host SystemdSpawner-style quotas — now primary-confirmed
  (R03) — vs Kubernetes/BinderHub control plane. User decides on scale needs.
- Identity: local vs SSO vs ORCID; review-note storage: in-repo vs in-service.
- Badge tolerances for stochastic outputs; required provenance rows.
- Data redistribution: which bundles may embed third-party blobs.
- Capsule publishing (C) and managed sandbox (D) adoption thresholds.
- ReviewNB SaaS (public repos, or private with paid plan) vs self-hosted
  nbdime (no SaaS, private-safe): fork recorded with the R04 conditions; user
  decides after price/self-host re-verification.

## 5. Uncertainty and disagreement (preserved, not hidden)

- Exact CPU/memory/timeout defaults cannot be set from docs; V6 sizing runs
  on real ecology notebooks are required. Any numbers elsewhere are starting
  points.
- Sourcing ledger after three stages: CONFIRMED primaries — repo2docker front
  page + config index, Docker constraints, nbformat docs, nbconvert usage,
  Quarto guide index, renv/Posit, systemdspawner README, ReviewNB homepage.
  Search-confirmed (multi-source, verify pinned primaries at build) — nbdime,
  JupyText, ReviewNB blog terms, conda-lock, gVisor/runsc, DVC mechanism,
  Quarto freeze/cache. Remaining LEADS — pixi semantics, Firecracker/Kata
  figures, nsjail specifics, E2B/Modal details, capsule-platform internals,
  nbformat validator switch mechanism, git-annex. The final commits firmly
  only where primaries exist and conditions everything else.
- Single-host vs Kubernetes, and repo2docker-R vs Posit, are genuine forks;
  this final leans single-host + repo2docker-R with primary-backed reasons,
  and preserves the other branches.
- No CVE-anchored O3 chain was chased; the O3 chain is the nbconvert 5.x→6.0
  breaking release (deliberate evolution, safe failure mode: hard error, not
  wrong output). The critic concurred no security-advisory chain is owed for
  this brief. If a later consumer demands one, that gap is explicit.
- Scope stays a small product brief: no multi-institution federation, GPU
  scheduling, long-lived sessions, plagiarism detection, or IRB workflows.

## 6. Validations: executed vs proposed (O6)

Executed across all three stages: documentation/source reads only
(research `observed_operations`, critic C01–C08, reviser R01–R06; bounded
excerpts in each stage's sources/). No code run, no image built, no notebook
executed, no badge computed. Everything below is proposed, designed to
discriminate between the retained options; none has run.

- V1 env determinism: build same repo twice (cold vs warm cache, pinned
  toolchain); PRIMARY assertion is functional equivalence (same lock-resolved
  package set, lockfile-vs-solved diff empty); bit-identical digests are a
  best-effort secondary ("or explain drift"). Rebuild with lockfiles removed
  and show drift; rebuild with `environment.yml` present-but-unlocked and show
  the re-solve hazard. Proves the explicit-install ordering for conda/renv
  locks. Discriminates A vs floating (P2).
- V2 selected-result: parameterized + SEEDED target under `--network none` +
  caps; assert exit code, output hashes, wall time, peak RSS within bounds;
  re-run twice and assert hash stability for declared-deterministic targets.
  Discriminates "reproduces" from "runs" (P3/P5).
- V3 isolation canaries: SEQUENCING — build a sandbox tier first, then V3-gate
  it before it carries untrusted jobs. Canaries: egress attempt, host read,
  bounded fork, output flood; assert deny/contain/kill + alert per runtime
  (plain vs gVisor vs microVM). Discriminates §1/P2 tiers honestly.
- V4 authorship round-trip: ingest with authors/cell-ids/tags, re-save,
  assert preservation + signature verify + diff shows only expected changes
  (P1/P6).
- V5 offline bundle: embedded HTML + PDF from same source, opened with
  network disabled, manifest hashes match (P3/P4).
- V6 sizing matrix: small/medium/large ecology notebooks under candidate
  caps; OOM/timeout rates per cap; publish sizing table (P2/P5).
- V7 data-ref integrity: wrong-hash blob + missing DOI version; assert
  fail-closed with clear message, never silent substitution (P4).

## 7. Criticism adjudication (every finding, with evidence)

Verdict key: ACCEPT (change made as demanded) / AMEND (change made in modified
form on new evidence) / REJECT (declined on evidence) / UNCERTAIN (retained as
open uncertainty). No P disposition changed: all six stand as written (demand 7
accepted — my verification agreed with every disposition).

Material findings:

- M1 (P1 stands; upgrade nbdime/JupyText; ReviewNB conditions) — ACCEPT with
  one AMEND. Firm commit to nbdime + JupyText accepted (two stages agree).
  ReviewNB fork recorded as demanded, AMENDED on my primary fetch: the product
  takes GitHub AND Bitbucket (GitHub-only rejected as outdated), Team $79,
  14-day trial, per-interacting-user counting, self-host path behind a form;
  free-OSS/paid-private corroborated by secondary blog sources. Fork rule in
  §1/P1; price/self-host re-verification required before commitment by name.
- M2 (repo2docker × lockfile joint; renv unsourced) — ACCEPT, resolved by
  verification. R01 proves `Pipfile.lock` is the only natively honored lock
  and conda/renv/pixi locks need an explicit install step (`environment.yml`
  present = re-solved); R02 proves renv snapshot/restore semantics from the
  Posit primary. P2 fix restated with the exact mechanism; V1 kept and
  strengthened (functional-equivalence primary). The "latest" rejection itself
  needed and got no new evidence — it stands on reasoning the critic endorsed.
- M3 (sandbox tier stands; thin escalation specifics) — ACCEPT. Symmetric
  ops-burden condition added for self-hosted microVMs; boot-time figure dropped;
  tiering unchanged; snippet-level items stay version-pin-gated.
- M4 (P4 stands; DVC/git-annex unsourced) — ACCEPT. DVC-pattern row added at
  multi-source search level (R05) with a pin-and-verify condition;
  git-annex softened to a pattern mention; disposition and provider leg
  (critic-confirmed) unchanged.
- M5 (P5 stands; add seed control) — ACCEPT. Seeds + full parameter capture
  added to the verification bundle's required rows and to green-badge
  criteria, V2, and the pipeline. Reasoning-only finding; no external
  evidence needed or claimed.
- M6 (P3 stands; Quarto freeze needs primary check) — AMEND via the offered
  soften branch. My execution-options fetch was inconclusive (navigation
  chrome only — honestly recorded in R06), so the Quarto alternative is
  retained on multi-source search agreement with an explicit verify-before-
  commit condition. The nbconvert leg is untouched and carries the guarantee.
- M7 (P6 stands; authorship cross-confirmed) — ACCEPT. Phase split kept; the
  nbconvert-LaTeX cross-confirmation retained; validator-switch softening
  applied via m2. No further demand existed.
- M8 (merge story thin) — ACCEPT. Default stated: paired-text merge first,
  `nbmerge`-pattern manual resolution second, no custom merge driver by
  default (§1/P1).
- M9 (SystemdSpawner lean unfetched) — ACCEPT, resolved by verification (not
  by downgrade). The README fetch (R03) confirms per-user cgroup, CPU
  fairness, mem/cpu limit semantics with None defaults — the lean now rests
  on a primary and is KEPT. K8s branch preserved as-is.
- M10 (O3 confirmed; no CVE chain) — ACCEPT. Chain and classification kept;
  no advisory chain chased; gap explicitness kept (§5).
- M11 (V1–V7 discriminating; two applicability notes) — ACCEPT both. V3
  sequencing (build tier, then V3-gate it) stated; V1 functional-equivalence
  primary + bit-identical hedge kept. All seven validations kept.
- M12 (O4/O5/O6 coverage confirmed) — ACCEPT. No omission found by the critic;
  this final re-covers all six P clauses verbatim with the required
  distinctions (§1), full-text alternatives/conditions/disagreement (§2–§5),
  and separated validations (§6).

Minor findings:

- m1 (dangling S11 cite for pixi) — ACCEPT/FIX. Discovery is frozen pre-reveal
  and was NOT rewritten. This final contains no S11: pixi claims are re-sourced
  to R01 (negative: absent from repo2docker's supported list) and carry lead
  status with softened phrasing.
- m2 (validator env-override unverified) — ACCEPT/SOFTEN. Final says
  "validator backend (confirm switch mechanism)" (§1/P1).
- m3 (Firecracker boot-time figure) — ACCEPT/DROP. Figure removed everywhere.
- m4 (R filenames unverified) — ACCEPT, resolved by verification. `install.R`
  / `DESCRIPTION` confirmed on the fetched config index (R01).
- m5 (network-phase clarity) — ACCEPT. Phase boundary stated crisply once
  (§1/P2): networked logged BUILD/FETCH vs `--network none` VERIFY.
- m6 (pixi/renv lockfile legs) — ACCEPT, split. renv is now primary-confirmed
  (R02); pixi stays a lead with softened description; conda-lock stays
  search-confirmed (critic C05) with pinned-docs verification owed at build.
- m7 (capsule platforms snippet-only) — ACCEPT. Reservation kept; weight
  matches decision weight; no action beyond keeping it (§3/C).
- m8 (triage label; secret scanning) — ACCEPT both. "Triage, not a sandbox"
  kept verbatim at every mention; embedded-secret scan added to the triage
  list (§1/P2, §2).
- m9 (non-allowlisted kernel policy) — ACCEPT. Reject-with-remap-path,
  one sentence, §1/P6.

Uncertainty retained (not papered over): sizing numbers await V6; placement
and R-stack forks stay genuine user decisions; redistribution policy stays
open; ReviewNB price/self-host terms need re-verification at commit time;
pixi, microVM figures, capsule internals, validator switch, and git-annex
stay leads or softer.

## 8. Obligation check

- O1 unfamiliar tools/approaches: repo2docker/BinderHub, Quarto manuscripts +
  execution options, nbdime/JupyText/ReviewNB (now with fork conditions),
  nbformat signatures, Whole Tale/Renku/Code Ocean, gVisor/Firecracker/nsjail/
  managed sandboxes, lockfiles (conda-lock/pixi/renv/Pipfile.lock with
  verified application paths), DVC pointers, Zenodo/Figshare/Dataverse/
  Software Heritage, SystemdSpawner/KubeSpawner quotas.
- O2 primary behavior/defaults/limits: Docker (S02/C02), nbconvert (S04/C01),
  nbformat (S03), repo2docker front page + config index (S01/C07/R01), Quarto
  guide + freeze search (S05/R06), spawners (S09/R03), renv (R02), ReviewNB
  (R04), DVC (R05).
- O3 evolution chain: nbconvert 6.0 default removal + compat path (critic
  re-verified verbatim); nbformat validator note (softened); no invented CVE
  chain, none owed.
- O4 per-P comparison: §1 (P1 keep+correct; P2 major correct; P3 correct;
  P4 reject+correct; P5 reject+correct; P6 correct phasing) with correction /
  enhancement / user-decision / already-covered / rejected / uncertain
  distinguished throughout.
- O5 self-contained final with alternatives/conditions/disagreement: §2–§5 in
  full text; predecessor IDs locate evidence but replace no material text.
- O6 validations separated: §6; executed = documentation/source reads only
  across all three stages; V1–V7 proposed with discriminators, sequencing,
  and corrected assertions; scope is this brief, not unlimited guarantees.

## 9. Sourcing and honesty notes

- Predecessor records read in full: draft.md, discovery.md (frozen, never
  rewritten), revealed-plan.md, both source-maps, critique.md, all S/C
  evidence files plus indexes, from the declared paths/roots only.
- This stage's independent evidence: R01–R06 (fetched primaries R01–R04,
  search-level R05–R06 with an honestly recorded inconclusive primary attempt
  for R06). No silent rebinds: S/C IDs are referenced with their original
  meanings; R IDs are new and immutable.
- No runtime in any stage; no execution claimed. Usage/billing unobserved
  (null) throughout. No campaign/history/evaluator/counterpart read, no nested
  agents, no repo/canon edits, no account/config changes.
- The S11 dangling citation from discovery is fixed by non-carryover plus this
  note, not by editing the frozen file.


