# ER11 A-M03-A control/critic — Critique (S03 lab-notebooks)

Method M03 v1 critic-finalizer, critic stage. Independent review of the
own-arm research draft (post-reveal), frozen pre-reveal discovery, revealed
thin plan, and governing primary evidence, plus independently chosen public
primary sources fetched/searched in this stage (C01–C08, see source-map.json).

Inspected in full: `cases/S03/brief.md`; `control/research/draft.md`;
`control/research/discovery.md`; `control/research/source-map.json`;
`control/research/revealed-plan.md`; all ten `control/research/sources/S*.md`
plus index. No parent/counterpart/evaluator/campaign/history read. No repair
of the candidate outside this critique (reviser acts on it).

Access window (UTC): 2026-10-09T18:49Z–18:51Z. No runtime execution available
in this stage; all verification below is documentation/source-observed.

## Verdict

The draft's direction is sound and honestly evidenced. All six P dispositions
are defensible; **no false correction or false rejection found**. The fetched
primaries I re-verified (nbconvert, Docker constraints, repo2docker) match the
draft's claims nearly verbatim, and I independently confirmed four items the
research stage honestly left as unverified/snippet-level (nbdime, JupyText,
ReviewNB, conda-lock, gVisor/runsc). The findings below are therefore
strengthen-and-condition, not overturn: tighten sourcing on the R half of the
lock story, verify repo2docker × lockfile compatibility, verify or downgrade
the SystemdSpawner lean, record ReviewNB's platform/cost conditions, fix one
dangling citation, and verify Quarto freeze semantics. None stops the design.

## Independent verification results (what I checked myself)

- V-C1 nbconvert (C01, fetched primary): CONFIRMED. 5.x default html, 6.0
  removed default (`--to` required, `--to=html` restores), formats list,
  templates lab (default)/classic/basic, `--theme` default light,
  `--embed-images` base64, LaTeX authors/title/date + pandoc, webpdf via
  `nbconvert[webpdf]` Playwright Chromium, `--template-file` compat mode.
  Draft §1/P3 and the O3 chain quote this page accurately.
- V-C2 Docker constraints (C02, fetched primary): CONFIRMED. Default no
  constraints; integer + `b/k/m/g` units; hard vs soft memory; OOM priority
  lowered for daemon, not containers (container killed first); kernel/cgroup
  gating via `docker info`. Draft P2 caps rest on solid ground.
- V-C3 repo2docker (C07, fetched primary): CONFIRMED. Reproducible user-env
  OCI images from repos; config-file driven; providers GitHub/GitLab,
  Zenodo, Figshare, Dataverse, Software Heritage; Dockerfile allowed but
  discouraged; backs JupyterHub/BinderHub; Podman noted. Draft S01 claims
  accurate (same 8925-byte front page).
- V-C4 nbdime (C03, search): CONFIRMED real, matching draft description:
  `nbdiff`/`nbmerge`/web variants, terminal + rich diff, `nbdime
  config-git` git integration. Upgrades research S08 (nbdime leg) from
  unverified lead to confirmed.
- V-C5 JupyText (C04, search): CONFIRMED real, matching draft description:
  paired formats `ipynb,py:percent`, `--set-formats`, `--sync`,
  `--to py:percent` / `--to ipynb`. Upgrades S08 (JupyText leg) to confirmed.
- V-C6 ReviewNB (C08, search): CONFIRMED real (PR rich diffs, bot button,
  cell comments) WITH new conditions the draft does not state: one source
  reports GitHub-only and paid for private repositories (see M1). Upgrades
  S08 (ReviewNB leg) to confirmed-with-conditions; the conditions need a
  primary check before hard commitment.
- V-C7 conda-lock (C05, search): CONFIRMED real: per-platform `conda solve`,
  reproducible lockfiles, `environment.yml` is intent not a lock. Upgrades
  S10 (conda leg) to confirmed. renv.lock/pixi.lock NOT verified by me —
  still leads (see M2).
- V-C8 gVisor/runsc (C06, search): CONFIRMED as a Docker/container runtime
  for untrusted code (user-space kernel, syscall interception), widely
  described as the boundary above plain `runc`. Upgrades S06 (gVisor leg)
  to confirmed. Firecracker figures, Kata, nsjail specifics, E2B/Modal
  details remain snippet-level (see m3).

## Material findings

### M1 — P1 disposition STANDS; upgrade nbdime/JupyText to confirmed, add ReviewNB conditions

P1 ("Store notebooks in Git") keep-intent/correct-mechanism is correct: raw
`.ipynb` JSON diffs poorly and outputs bloat history, so notebook-aware diff
plus paired plain-text companions is the right correction, and large blobs
do not belong in git objects. My V-C4/V-C5 confirm the two mechanism legs
the research stage honestly flagged as unverified — the reviser may now
commit more firmly than "evaluate and adopt" for nbdime + JupyText.

New condition for the ReviewNB leg (V-C6): evidence indicates GitHub-only
integration and paid plans for private repositories. For an academic group
whose review repos may be private, SaaS-ReviewNB vs self-hosted nbdime is a
genuine cost/hosting fork the draft underplays (it names ReviewNB only as a
"pattern"). Critic demand: reviser records this fork with its condition
(public GitHub repos vs private/self-hosted) and verifies ReviewNB's current
pricing/platform from its primary docs before recommending it by name.
Demand validity: the existence claims are multi-source confirmed; the
pricing/platform limits rest on a single secondary source, so they are
flagged as verify-before-commit, not as settled fact.

### M2 — P2 "latest" rejection STANDS; the repo2docker × lockfile joint is the draft's biggest unverified joint

Rejecting "latest dependencies" is correct and load-bearing: floating
resolves make "reproduced" meaningless, and conda-lock's confirmed semantics
(per-platform solve; `environment.yml` is not a lock) support the lockfile
half of the fix. Two gaps remain in the fix itself:

1. The draft asserts lockfiles as "the reinstall unit" consumed through
   "repo2docker from lockfiles + config files," but no evidence row shows
   repo2docker natively consuming `conda-lock.yml` / `renv.lock` /
   `pixi.lock`. Research S01 shows repo2docker reading `environment.yml`,
   `requirements.txt`, `DESCRIPTION`/`install.R`, etc. Whether the lockfile
   is honored inside the repo2docker build or applied as a separate
   install step (e.g. `postBuild` / custom buildpack ordering) is
   unexamined. If repo2docker re-solves `environment.yml` at build time,
   the determinism claim fails exactly where it matters.
2. The R half is unsourced: `renv.lock` was a snippet-only lead (S10) and
   I did not verify it either. Mixed Python/R is a brief requirement, so
   half the lock story covering half the brief's stacks rests on a lead.

Critic demand: reviser verifies (a) repo2docker's lockfile handling against
its configuration/buildpack docs and states the exact mechanism (native
support vs explicit install step), and (b) renv's lockfile semantics from
its primary docs — or softens the P2 fix to "lockfiles mandatory at the
install step; exact repo2docker integration TBD" with V1 as the
discriminating check. This demand is valid even though the disposition
stands: the rejection of "latest" needs no further evidence, but the
proposed replacement mechanism does. Proposed V1 (rebuild twice, with and
without lockfiles) is exactly the right discriminator and should be kept.

### M3 — P2 sandbox tier direction STANDS; escalation specifics stay honestly thin

Plain hardened Docker as a floor with gVisor/microVM escalation is the
right tiering, and V-C8 confirms the gVisor/runsc leg (including the spirit
of "--cap-drop is not a hostile-input boundary": multiple sources state
Docker alone is insufficient for untrusted multi-tenant code). The draft is
appropriately honest that S06 is snippet-level and demands version-pinning
before building. Residual gap: Firecracker/Kata/nsjail/E2B/Modal specifics
are still snippets, and the ops-cost side of "a VM per execution" for a
small academic group is unstated. Critic demand (minor-material): reviser
adds the ops/cost condition to escalation tier selection (managed sandbox
data-egress + cost review is already noted; extend the same treatment to
self-hosted microVM ops burden) and drops or verifies the "~125ms boot"
figure (see m3). No change to the tiering itself.

### M4 — P4 rejection STANDS; DVC/git-annex alternative is unsourced

Rejecting execution-time URL resolution in favor of ingest-time
manifest-pinned fetch with hash verification and fail-closed semantics is
correct (drift, offline failure, silent substitution, exfiltration channel
are all real consequences). The provider leg (Zenodo/Figshare/Dataverse/
Software Heritage declaratively reachable) is confirmed by V-C3. The
network story is internally consistent: builds need network (discovery
§2.4 limits say so), verification runs use `--network none` against local
blobs. One sourcing gap: DVC/git-annex pointers appear as the large-dataset
mechanism with no source-map row at all (neither stage sourced them).
Critic demand: reviser adds a primary row for the pointer-file mechanism or
softens it to "pointer-file pattern (verify before commit)". Low risk to
the design either way.

### M5 — P5 rejection STANDS; strengthen the bundle with seed control

Exit code 0 does not imply reproduction; the graded green/amber/red
attestation with output hashes, provenance, and bounds is the correct
replacement, and keeping tolerances as a user decision with conservative
defaults is the right uncertainty posture. No external evidence is needed
for this reasoning finding. Critic demand (minor-material): reviser adds
random-seed/parameter capture to the verification bundle's required rows
(stochastic ecology notebooks otherwise defeat hash comparison even when
"tolerances" are set), since the bundle already lists params, hashes, and
bounds — seeds belong with them. V2 remains the right discriminator.

### M6 — P3 correction STANDS; Quarto freeze semantics need a primary check

"Necessary but insufficient as proof" is correct, and every nbconvert
mechanism claim is verified verbatim (V-C1), including the offline-bundle
recipe (`--to html --embed-images` + PDF + source + manifest). The Quarto
alternative (`quarto render` with `freeze`/`cache` as the offline record)
is plausible but its specifics rest on the S05 guide-index fetch plus
adjacent search, not on the execution-options primary. Critic demand:
reviser verifies `freeze`/`cache`/params semantics against Quarto's
execution-options docs or softens to "Quarto execution options (verify
freeze semantics before commit)". The nbconvert leg needs no change.

### M7 — P6 correction STANDS; authorship-in-metadata cross-confirmed

The brief explicitly requires authorship/annotation preservation, so
deferring all of it to "later" contradicts the brief — the phase split
(phase-1 preservation + append-only review notes; rich real-time collab
later) is the correct disposition. Cross-confirmation found in my own
fetch: nbconvert's LaTeX path honors notebook-metadata
`authors/title/date` (C01), corroborating the `metadata.authors[]`
convention the draft attributes to nbformat (S03). The
`NBFORMAT_VALIDATOR` env-override note remains adjacent-search-only (see
m2) but is low-stakes config detail. No demand beyond m2.

### M8 — P1 git-history mechanism: conflict/merge story is thin (minor-material)

The draft correctly notes `.ipynb` merges "conflict spuriously" and names
`nbmerge`-pattern merging, but never states the merge driver story (custom
git merge driver vs manual `nbmerge-web` resolution vs conflicts resolved
in paired text). Since "store notebooks in Git" with multiple reviewers
implies concurrent edits, the reviser should state which merge path is
default. Small addition; no disposition change.

### M9 — SystemdSpawner lean rests on an unfetched README (material sourcing gap)

The draft leans "single-host SystemdSpawner-style quotas" as the default
placement over Kubernetes, citing S09. But S09 is a search snippet; neither
stage fetched the systemdspawner README, so the cgroup-equalization claim
and the unit-property mechanism are snippet-quoted. A consequential default
placement should not rest on an unfetched primary. Critic demand: reviser
fetches the systemdspawner README (pinned release) and confirms per-user
CPU/memory semantics, or downgrades the lean to provisional ("single-host
cgroup quotas, spawner TBD") with the K8s branch preserved as-is. The
preserved disagreement itself is good practice; only the evidential weight
of the lean is challenged.

### M10 — O3 chain CONFIRMED; no CVE chain required

The nbconvert 5.x→6.0 default-removal chain is verified verbatim including
the `--template-file` compat path (V-C1), the "deliberate evolution, safe
failure mode (hard error)" classification is accurate, and the draft's
explicit honesty about not chasing a CVE-anchored chain is appropriate for
this brief. Critic agrees: no security-advisory chain is owed here. No demand.

### M11 — Validations V1–V7 are discriminating and honestly unexecuted; two applicability notes

The executed-vs-proposed separation is exemplary (docs reads only; nothing
claims to have run). Each proposal discriminates a real fork (V1
determinism, V2 runs-vs-reproduces, V3 runtime tiers, V4 round-trip, V5
offline, V6 sizing, V7 fail-closed). Applicability notes for the reviser:
(a) V3's hostile canaries (bounded fork, egress attempts) can only run
after a sandbox tier exists — state the sequencing (build tier, then
V3-gate it); (b) V1's "identical digests" already hedges with "or explain
drift," which is correct since OCI rebuilds are rarely bit-identical —
keep the hedge and add functional equivalence (same lock-resolved package
set) as the primary assertion. Both minor; keep all seven validations.

### M12 — O4/O5/O6 obligation coverage CONFIRMED; no omitted P clause

All six exact P clauses are quoted and dispositioned with the required
distinctions (correction vs enhancement vs user decision vs already-covered
vs rejected vs uncertain); alternatives/conditions/disagreement/uncertainty
are retained in full text (§2–§5), not by ID; scope stays the small brief.
No P clause omitted, no thin-plan language misquoted (checked against
revealed-plan.md). No demand.

## Minor findings

- m1 — Dangling citation: discovery §1.1 cites "(S11, secondary)" for pixi,
  but source-map.json defines only S01–S10. There is no S11 row. Reviser
  fixes or drops the cite. (Also note: discovery is frozen pre-reveal and
  must not be rewritten — fix belongs in the final's sourcing, with a note.)
- m2 — `NBFORMAT_VALIDATOR=jsonschema` env override is adjacent-search-only
  in S03 and unverified by me. Low stakes; verify or soften to "validator
  backend (confirm switch mechanism)".
- m3 — Firecracker "~125ms boot" figure is snippet-only (S06). Drop the
  number or verify; the tiering argument does not need it.
- m4 — repo2docker R config filenames (`DESCRIPTION`/`install.R`, R
  buildpack) appear in discovery §2.4 but my front-page fetch did not reach
  the config-file list (page truncated past "configuration files" link).
  Verify against the configuration docs alongside M2's lockfile check.
- m5 — Clarity: P2 allows "--network none unless a declared fetch phase"
  while P4 mandates ingest-time fetch with network-disabled runs. These are
  consistent (build/fetch vs verify phases) but the phase boundary should be
  stated crisply once in the final so a reader does not misread them as
  contradictory.
- m6 — pixi characterization ("hyper-sandboxed task runner") rests on a
  secondary snippet; renv/conda-lock/pixi primary docs were never fetched
  (I verified conda-lock only via search, V-C7). The lockfile legs other
  than conda-lock stay leads; do not harden their descriptions without
  primaries.
- m7 — Capsule platforms (S07: Renku/Whole Tale/Code Ocean) remain
  snippet-only in both stages. Acceptable: the draft correctly reserves
  them for archival publication, so evidential weight matches decision
  weight. No action beyond keeping the reservation.
- m8 — Triage-scan evasion: the static pre-check list (source scan for
  egress primitives) is correctly labeled "triage, not a sandbox." The
  final should keep that label verbatim wherever the scan is mentioned so
  no reader mistakes it for a security boundary. Also consider adding
  embedded-secret scanning to the triage list (untrusted notebooks may
  carry exfiltratable keys) — suggestion, not demand.
- m9 — Kernelspec allowlist vs heterogeneous laptops: the draft normalizes
  kernelspecs at ingest but never says what happens to a submission whose
  kernel is not allowlisted (reject vs remap vs amber). One sentence in the
  final.

## Demands on the reviser (ordered)

1. Verify repo2docker × lockfile mechanism + renv primary (M2); soften if
   unverifiable. Highest priority: it is the central P2 fix.
2. Fetch systemdspawner README or downgrade the placement lean (M9).
3. Record ReviewNB GitHub-only/cost fork; verify from primary (M1).
4. Verify Quarto freeze/cache semantics or soften (M6).
5. Source or soften DVC/git-annex (M4); fix S11 dangling cite (m1).
6. Add seed capture to the bundle (M5); state merge path (M8);
   V1-functional-equivalence + V3-sequencing notes (M11); m2–m6, m8–m9
   small items.
7. Change no P disposition: all six stand as written.

## Uncertainty preserved

- Tolerances/defaults still await sizing runs (V6); no numbers invented here.
- Single-host vs Kubernetes and repo2docker-R vs Posit remain genuine forks.
- Data-redistribution policy remains a user decision.
- Pricing/platform limits for ReviewNB are single-secondary-source; flagged,
  not settled.
- renv/pixi semantics, Firecracker figures, capsule-platform details, and
  the nbformat validator switch remain unverified by both stages.
