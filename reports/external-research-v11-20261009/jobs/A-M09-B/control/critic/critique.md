# Critique — draft vs plan vs primary evidence (case S03, block A-M09-B, control arm, critic stage)

Method M09 critic pass, written 2026-10-09T18:56Z. Basis: complete inspection of the research-stage
draft (`research/draft.md`), frozen discovery (`research/discovery.md`), exact revealed plan P1–P6
(`research/revealed-plan.md`), the brief (`cases/S03/brief.md`), all 13 bounded evidence captures
(`research/sources/S01–S13`, indexed in that source-map.json), plus this stage's two independent
live re-fetches (jupyter-resource-usage and nbval READMEs, access 2026-10-09T18:52:30Z, both
matching the predecessor captures verbatim). Row-level check results: `verify-log.md` (24 rows).
This critique challenges; it does not repair the candidate (assignment constraint).

## 1. What was challenged and held

Every P disposition was re-derived from the cited evidence before being challenged. P1's tooling
claims (nbdime git-ref diffs and counter auto-resolution, S04; jupytext paired-text diffs, S11) and
P2's rejection of "latest" (renv hash-pinned lockfile and "not a panacea" quote, S02; MRAN
retirement with pre-2018-12-07 snapshot loss, R default 4.2→4.4, buildx switch, S12 — checked
entry-for-entry) are supported as written. The display-vs-enforcement split (S03 "can display a
memory limit (but not enforce it)"; S09 `*_guarantee`→requests, `*_limit`→limits, defaults None)
is the draft's load-bearing pair for P2/P5 and was re-confirmed live at 18:52:30Z. nbval's
per-cell pytest semantics, strict/lax modes and sanitize files (S08) were likewise re-confirmed
live, verbatim. P4's archival-host support (Zenodo/Figshare/Dataverse/Software Heritage, S01) and
webR filesystem pre-bundling (S06) are in evidence. P6's ReviewNB mechanics and pricing (S10,
the only usage/billing observation) match the capture. The draft's honesty claims hold: executed
checks are correctly declared empty; the rOpenSci 404 is consistently recorded in the registry's
failed_fetches and no peer-review claim is cited. No false correction or rejection was found:
all five draft disputes of the plan (P2 "latest", P3 proof standard, P4 timing, P5 badge, P6
sequencing) rest on captured primary evidence.

## 2. Material findings

**MF1 — Alternative B's security characterization overstates its evidence (draft §2.3, §4-B; S05, S06).**
The draft claims the WASM path "eliminates server access by construction" and "removes the access
problem by construction — the uploaded notebook's code runs in a worker sandbox in the reviewer's
browser." Neither S05 nor S06 makes any security-isolation claim: the captures establish
browser-only execution, static hosting, and RAM/API limits, not that executing untrusted notebook
code in the reviewer's browser is safe. The claim is true for server-side access but silently
relocates execution of untrusted code onto the reviewer's own session — a different risk surface
with no captured evidence. Uncertainty: the underlying sandboxing may well be adequate; the finding
is about evidence, not about WASM being unsafe. Consequence: Alternative B's "no access problem by
construction" must be downgraded to an inference with the untrusted-code-execution question named,
or Alternative B's advantage over the container path is argued from something the sources do not say.

**MF2 — The brief's "preserve authorship" clause is never explicitly disposed of (brief; draft §1, §2-P1/P6; S04, S10, S11).**
The draft's §1 lists "preservation of authorship and annotations" as a brief requirement, and P6
covers annotations thoroughly — but authorship (who wrote which cell/change) receives no disposition
under O4's vocabulary. The evidence captured covers diffs, comments and merge validity, not
attribution; git commit history (P1) plausibly provides it, yet the draft never says so, and none
of S04/S10/S11 addresses authorship. Uncertainty: this may be covered implicitly by the P1
disposition; but O4 requires every exact clause to be compared, and a clause that survives only by
silence is an omission, not a disposition. Consequence: either P1's disposition text should absorb
authorship via VCS history (with the caveat that squashed or rebased histories weaken it), or the
clause needs its own disposition in the final deliverable.

**MF3 — Storage substrate is a real user decision the draft's §5 list omits (draft §2-P1, §5; S01).**
P1 is dispositioned "already-covered", yet the draft's own S01 evidence shows repo2docker builds
from non-git archival sources (Zenodo, Figshare, Dataverse, Software Heritage). An ecology group
whose "projects arrive with data references" may receive DOI-resolvable submissions that are not
git repositories at all; for those, "store notebooks in Git" is not automatically the substrate —
it is a scope/ingest decision (git-only intake vs archival-DOI intake) with different tooling
consequences (ReviewNB and nbdime's review flows presuppose git/forge hosting, S04/S10). The draft
uses S01's archival support for P4 but does not let it challenge P1's "covered" status. Uncertainty:
if the group is GitHub-centric (the draft's Alternative C condition), git-only intake is the sane
default; the finding is that the decision is unstated, not that P1 is wrong.

**MF4 — The lax verification contract has an unstated fabrication window in unmarked cells (draft §2-P3, V1; S08 + live re-fetch 18:52:30Z).**
The draft's corrected proof standard is "executed outputs compared to stored outputs at a declared
strictness", with lax+markers as "the realistic reproduction contract". Per S08 (re-confirmed
live), `--nbval-lax` checks errors-only for every cell and compares outputs only for
`#NBVAL_CHECK_OUTPUT`-marked cells; re-execution does catch fabricated/drifted stored outputs, but
only in compared cells. A notebook whose fabricated or drifted outputs sit entirely in unmarked
cells passes lax cleanly, and V1 as designed (one notebook, strict vs lax) would never surface
this: it has no unmarked-fabrication case. The draft's own V6 false-green probe tests the badge
side but not this contract side. Uncertainty: severity depends on the group's marking discipline;
the draft's P3 condition already calls strictness a real decision, so this is a consequence of
that decision the draft leaves implicit. Consequence: V1 should add an unmarked-cell fabrication
arm, and any "lax-checked" badge semantics should disclose the unchecked share of cells.

## 3. Minor findings

- **m1** — S05's support policy (only the two most recent JupyterLite releases, 0.7.0/0.6.0) is
  captured but absent from Alternative B's conditions; it bears directly on "lightweight path"
  maintenance risk (S05-jupyterlite.md).
- **m2** — S08's pytest-xdist constraint (`--dist loadscope`, all cells of a notebook on one
  worker) is uncited; relevant to a service validating many submissions in parallel
  (S08-nbval.md).
- **m3** — S09's `extra_resource_guarantees/limits` (e.g. GPU) is uncited; ecology workloads with
  GPU steps would need it in the resource-predictability story (S09-kubespawner.md).
- **m4** — Wording overstatement: "repo2docker builds from git repositories (S01)" — the capture
  says "source code repositories" and separately lists non-git hosts; harmless here because the
  draft itself cites the archival hosts under P4, but the sentence as written slightly exceeds
  S01 (S01-repo2docker.md).
- **m5** — "annotations… survive export" via jupytext (draft §2-P6) is an inference: S11 says text
  formats preserve inputs/metadata only, so comment-as-text survival is a design choice, not a
  captured property (S11-jupytext.md).
- **m6** — Missed corroboration: S12's 2025.08.0 entry "DOI resolution via REST APIs" directly
  supports P4's build-time archival-resolution claim, but the draft cites only S01 there
  (S12-repo2docker-releases.md). Not an error; an uncited strengthening.
- **m7** — Presentational: the P4 user decision is embedded inside a correction disposition; §5
  lists it properly, so O4's distinguishability is met, but the embedding invites miscounting the
  dispositions (draft §2-P4, §5).

## 4. Invalid critic demands (flagged, not enforced)

1. **"Run V1–V6 before accepting the draft"** — invalid: no runtime is available; O6 requires
   executed and proposed work to be separated and forbids pretending proposals ran. The draft
   complies; this critique applies the same rule to itself (verify-log re-fetches are the only
   executions here, and they are source reads, not product runs).
2. **"Re-verify all 13 sources against the live web"** — invalid as a demand on this stage's
   deadline: the captures are minutes old (18:31–18:42Z vs 18:52Z), the drift window is negligible,
   and the two highest-leverage sources re-fetched clean. Targeted re-verification of load-bearing
   claims was done instead.
3. **"Repair the draft's omissions in place"** — invalid: the assignment forbids candidate repair
   outside the assigned recipe; findings are handed back, not patched (MF1–MF4, m1–m7 above).
4. **"Add gVisor/Firecracker-class sandbox evidence before any isolation claim"** — invalid as a
   gate: O6 scopes the work to this small product brief, and the discovery honestly recorded those
   captures as absent; demanding them would convert a scope rule into a blocker. The honest state
   is: container-vs-WASM is evidenced only at the repo2docker/JupyterLite/webR level (discovery §4).

## 5. Uncertainty carried forward

Live re-verification covered 2 of 13 sources; the remaining 11 rest on the predecessor's bounded
captures (access 18:31–18:42Z, same day, timestamps in that source-map.json). MF1–MF4 are findings
about what the draft asserts versus what its captures support; none implies the underlying tools
behave otherwise — only that the draft's text claims more, or decides less, than its evidence does.
The dispositions themselves (P1 covered+refined; P2/P3/P4/P6 corrected; P5 rejected as specified)
are, on this evidence, sound; the draft's weaknesses are the unstated decisions (MF2, MF3), the
one overstated construction (MF1), and the one untested contract corner (MF4).
