# Reviser adjudication ledger — A-M09-B/control/reviser (case S03, M09)

Ticket 1 wrote this ledger with evidence citations and PENDING verdicts. Ticket 2 adjudicated every
row: each criticism now carries a verdict (accept / amend / reject / retain-uncertainty), an
independent check describing what was executed first-hand and what result would have flipped the
verdict, and the consequence for the final deliverable. Write root respected: this file and
siblings live only under `reviser/`.

## Inputs read (exact, per input-map.json)

- Brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S03/brief.md`
- Draft: `../../research/draft.md` (plan comparison, P1–P6 dispositions, Alternatives A/B/C, V1–V6)
- Discovery (frozen, pre-reveal): `../../research/discovery.md`
- Revealed plan (exact): `../../research/revealed-plan.md` (P1–P6 thin plan)
- Research source registry: `../../research/source-map.json` (S01–S13 immutable; 3 failed fetches)
- Critic source registry: `../../critic/source-map.json` (inherits S01–S13 unchanged; live re-checks
  of S03 and S08 at 2026-10-09T18:52:30Z, no drift)
- Critique: `../../critic/critique.md` (MF1–MF4 material, m1–m7 minor, 4 flagged invalid demands)
- Evidence roots: `../../research/sources/` (S01–S13 + index.md), `../../critic/sources/`
  (INDEX.md + S03/S08 recheck captures)

Independence method: every verdict rests on first-hand reads of both halves of the criticism —
the target quote in `draft.md` (grep/line-verified this ticket) and the cited capture passage
(verified in ticket 1, re-cited here). Each row states what was checked and what would have
flipped the verdict, so none is obedience to the critique's authority.

## Material findings

### MF1 — Alternative B's security characterization overstates its evidence
- Raised: critique.md §2 MF1. Targets: draft lines 115 ("eliminates server access by
  construction") and 128 ("no uploaded-notebook access problem by construction — … in a worker
  sandbox in the reviewer's browser", §2.3/§4-B).
- Evidence basis: `research/sources/S05-jupyterlite.md` and `S06-webr.md` contain no
  security-isolation/sandbox/untrusted-code claim (grep: zero matches, ticket 1); S06's only
  "worker" wording (line 7) is "worker-based JS communication" — a mechanism, not a safety
  property.
- Independent check: confirmed the exact draft sentences at lines 115/128; confirmed S06 line 7.
  Would have flipped to reject if either capture had made a sandbox/security claim, or if the
  draft had already named the untrusted-code risk.
- Verdict: **ACCEPT**, scoped: the literal half — no server-side execution of submitted code
  (static hosting, browser execution, S05/S06) — is supported and stays; only the security
  connotation of "worker sandbox"/"access problem" exceeds the captures.
- Final consequence: Alternative B in final.md keeps "no server-side execution", reframes the
  sandbox adequacy as uncaptured platform inference, and names the relocated risk (untrusted code
  executes in the reviewer's own browser session) as retained uncertainty alongside the honest
  gVisor/Firecracker absence (discovery §4). V2's framing and retained finding 5 pick this up.

### MF2 — The brief's "preserve authorship" clause is never explicitly disposed of
- Raised: §2 MF2. Targets: draft §1 (requirement listed at line 15) vs P1/P6 dispositions
  (silent on authorship).
- Evidence basis: draft grep — "authorship" appears once, only in the brief restatement;
  `S04-nbdime.md`, `S10-reviewnb.md`, `S11-jupytext.md` — zero authorship/attribution matches.
  S10's captured review surface (lines 6–8) covers cell comments/resolution, not attribution.
- Independent check: confirmed both absences this ticket. Would have flipped if any capture
  addressed attribution, or if any P disposition text had disposed of the clause.
- Verdict: **ACCEPT** — a clause surviving only by silence is an O4 omission.
- Final consequence: final.md gives "preserve authorship" its own explicit disposition: preserved
  via VCS history when intake is git-based (marked uncaptured inference, weakened by squash/rebase);
  for archival-DOI intake (MF3), attribution rests on submission metadata (uncaptured). Uncertainty
  retained, not manufactured evidence.

### MF3 — Storage substrate is a real user decision the draft's §5 list omits
- Raised: §2 MF3. Targets: draft §2-P1 ("already-covered") + §5 user-decision list (4 items).
- Evidence basis: `S01-repo2docker.md` line 11: "Source hosts supported: GitHub, GitLab, Zenodo,
  Figshare, Dataverse installations, Software Heritage Archive"; brief line 3 says projects
  "arrive with data references" — arrival format unstated; S04/S10 review flows presuppose
  git/forge hosting.
- Independent check: re-read S01 line 11 and the brief clause; checked §5's list has no intake
  item. Would have flipped if the brief had fixed submissions as git repos, or if §5 already
  listed the substrate decision.
- Verdict: **ACCEPT** — genuine scope/ingest decision, distinct from Alternative C's
  adopt-vs-build.
- Final consequence: §5-equivalent in final.md gains user decision (5): intake substrate —
  git-only vs archival-DOI vs hybrid — with the tooling consequence stated (nbdime/ReviewNB flows
  presuppose git/forge); P1 stays "already-covered for git-submitted work", scope named.

### MF4 — The lax verification contract has an unstated fabrication window in unmarked cells
- Raised: §2 MF4. Targets: draft §2-P3 ("lax+marker … realistic reproduction contract") and V1.
- Evidence basis: `critic/sources/S08-recheck-nbval.md` lines 14–15 verbatim: "`--nbval-lax`: runs
  notebooks and checks for errors, but only compares the outputs of cells with a
  #NBVAL_CHECK_OUTPUT marker comment" — unmarked cells error-checked only (no drift at 18:52:30Z);
  `research/sources/S08-nbval.md` lines 7, 9 agree.
- Independent check: both captures read directly (ticket 1); the errors-only semantics make a
  fabricated exit-0 stored output in an unmarked cell pass lax, and V1 (one notebook, strict vs
  lax, no unmarked-fabrication arm) cannot surface it. Would have flipped if lax compared all
  outputs, or if V1 already had such an arm.
- Verdict: **ACCEPT**.
- Final consequence: P3's proof standard states the window explicitly (lax = errors-only outside
  marked cells); V1 gains an unmarked-cell fabrication arm; P5 badge semantics must disclose the
  unchecked share of cells, not just "lax-checked on N marked cells".

## Minor findings

### m1 — JupyterLite support policy absent from Alternative B's conditions
- Evidence: `S05-jupyterlite.md` line 11: "Support policy: only two most recent core releases
  (0.7.0, 0.6.0)."
- Independent check: capture line re-read; draft §4-B conditions verified to omit it. Flip
  condition: §4-B already carrying the support-policy condition.
- Verdict: **ACCEPT** (additive). Final consequence: Alternative B conditions gain the
  support-policy maintenance-risk line.

### m2 — S08's pytest-xdist constraint uncited
- Evidence: `S08-nbval.md` line 10: parallel execution needs `--dist loadscope` (same kernel for
  all cells).
- Independent check: capture line re-read; confirmed absent from the draft. Flip condition: draft
  already citing the constraint.
- Verdict: **ACCEPT** (additive). Final consequence: execution layer of final.md notes
  parallelism is across submissions, not within one notebook; relevant to batch validation design.

### m3 — S09's extra_resource_guarantees/limits uncited
- Evidence: `S09-kubespawner.md` line 9: dicts for arbitrary resources (e.g. nvidia.com/gpu).
- Independent check: capture line re-read; confirmed absent. Flip condition: resource story
  already covering GPU-class traits.
- Verdict: **ACCEPT** (additive). Final consequence: resource-predictability story gains the
  GPU-step trait citation (ecology workloads can need it).

### m4 — "repo2docker builds from git repositories (S01)" slightly exceeds the capture
- Evidence: draft line 23–24 vs `S01-repo2docker.md` line 7 ("from source code repositories") and
  line 11 (non-git hosts listed separately).
- Independent check: both texts read side by side this ticket. Flip condition: S01 literally
  saying "git repositories".
- Verdict: **ACCEPT** (wording fix). Final consequence: final.md says "source repositories (git
  or archival)", which also keeps P1 consistent with the MF3 substrate decision.

### m5 — "annotations… survive export" via jupytext is an inference, not a captured property
- Evidence: draft line 96 ("plain-text home that survives export (S11)") vs `S11-jupytext.md`
  line 11 ("text notebooks do not preserve outputs"; inputs/metadata only).
- Independent check: both texts read side by side. Flip condition: S11 stating comment-as-text
  persistence.
- Verdict: **ACCEPT** (reframe). Final consequence: comment-as-text survival presented as a design
  choice in final.md, not a captured property; offline-export clause unaffected (it does not rest
  on this).

### m6 — Missed corroboration: S12's "DOI resolution via REST APIs" supports P4
- Evidence: `S12-repo2docker-releases.md` line 8 (2025.08.0 entry).
- Independent check: entry re-read; confirmed it is direct corroboration of build-time DOI
  resolution, and absent from the draft's P4 citation set. Flip condition: entry not actually
  about archival DOI resolution.
- Verdict: **ACCEPT** (additive citation). Final consequence: P4's disposition in final.md cites
  S01 + S12.

### m7 — Presentational: P4's user decision is embedded inside a correction disposition
- Evidence: draft §2-P4 (decision embedded mid-disposition) vs §5 (listed properly).
- Independent check: structure re-read; confirmed §5 already lists it, so O4 distinguishability
  holds — the finding is presentational only. Flip condition: decision absent from §5 too.
- Verdict: **ACCEPT** (structural). Final consequence: final.md keeps dispositions and decisions
  in separate sections with cross-references, so each P's disposition count is unambiguous.

## Flagged invalid critic demands (reviser upholds or amends each flagging)

### D1 — "Run V1–V6 before accepting the draft"
- Critic's flagging: invalid (no runtime; O6 requires executed/proposed separation).
- Independent check: brief.md O6 text re-read ("do not pretend proposals ran"); draft §6 declares
  executed checks empty. Flip condition: a runtime actually being available to this stage (it is
  not — nothing in the environment provides the product stack).
- Verdict: **ACCEPT the flagging; the demand is rejected.** Final consequence: final.md keeps
  V1–V6 as proposals, executed checks section stays honestly empty of product runs.

### D2 — "Re-verify all 13 sources against the live web"
- Critic's flagging: invalid on deadline (captures minutes old; two highest-leverage re-fetched
  clean).
- Independent check: timestamps compared — research captures 18:31–18:42Z, critic re-fetches
  18:52:30Z both clean (`critic/source-map.json` recheck blocks); the reviser's own checks were of
  the captures, not the live web. The kernel worth keeping — 11 of 13 sources rest on
  same-day predecessor captures — is retained as U1. Flip condition: any drift signal between
  captures and rechecks, or a much older capture set.
- Verdict: **ACCEPT the flagging; the demand is rejected, with the underlying uncertainty
  retained (U1).** Final consequence: final.md's uncertainty section states the 11-of-13 basis.

### D3 — "Repair the draft's omissions in place"
- Critic's flagging: invalid (critic challenges, does not repair; findings handed back).
- Independent check: assignment.md re-read — the reviser stage is where the coherent final is
  authored; the critic stage had no repair mandate. Flip condition: none found.
- Verdict: **ACCEPT the flagging; the demand is rejected** (repair happens here, via final.md,
  on the evidence above). Final consequence: none structural.

### D4 — "Add gVisor/Firecracker-class sandbox evidence before any isolation claim"
- Critic's flagging: invalid as a gate (O6 scopes to the small product brief; absence honestly
  recorded).
- Independent check: discovery §4 absence list re-read; brief O6 scope sentence re-read. The
  demand and MF1 are consistent: MF1 forces the text to claim no more than captured evidence, D4
  refuses to gate the deliverable on heavyweight new captures. Flip condition: O6 not scoping the
  work, or a cheap capture having been available and skipped.
- Verdict: **ACCEPT the flagging; the demand is rejected as a gate** — while MF1 still amends the
  overclaiming sentence. Final consequence: isolation claims stay at the evidenced
  repo2docker/JupyterLite/webR level with absence stated.

## Carried uncertainty (critique §5)

- U1: 11 of 13 sources rest on predecessor bounded captures (18:31–18:42Z, same day); live
  re-verification covered S03/S08 only. Status: RETAINED — final.md states this.
- U2: MF1–MF4 target what the draft's text asserts vs what its captures support, not tool
  behavior. Status: RETAINED — verdicts above amend the final's text accordingly.
- U3: The P dispositions themselves (P1 covered+refined; P2/P3/P4/P6 corrected; P5 rejected as
  specified) are sound on the captured evidence. Status: RETAINED — final changes are
  additive/clarifying; no P verdict is overturned by this adjudication.

## Coverage check (ticket-2 acceptance)

All 15 criticism rows (MF1–MF4, m1–m7, D1–D4) now carry: a non-empty verdict with an evidence
citation, an independent-check line stating what was executed and the flip condition, and a
final-deliverable consequence covering the affected dependencies. No row is obedience to the
critique's authority: each verdict rests on first-hand reads of both the target quote and the
capture passage, and D2/D4 record what was kept from partially-accepted demands rather than
blanket rulings. U1–U3 retained. No P disposition overturned; changes to final.md are additive or
clarifying per U3.
