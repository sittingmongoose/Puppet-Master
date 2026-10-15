# Phase 10 — premium baselines, independent reviews, corrections (2026-10-13)

Three tasks set by Jared before any next step: (1) further improvement
levers (`PHASE10-LEVERS.md` + three independent lever memos), (2) same-prompt
discovery baselines from Astra 6 Max and Sol 6.1 Max (both
sittingmongoose@gmail), (3) independent reviews by Opus 5.5 xhigh
(sittingmongoose@me) and Sol 6.1 Max. Cost framing per Jared: dollars don't
matter; same-model speed/output volume is the proxy. Evidence:
`discovery2/disc-{astra,sol}-base.md`, `reviews/{review,levers}-{opus,sol}.md`,
`reviews/levers-astra.md` in the sandbox.

## 1. Discovery baselines — premium is better per context, not categorically

Identical brief-only two-axis prompt as the flash runs. Scored against the
earlier Sol reference list (53 products, itself built with a beefed-up
"be thorough" prompt). Wall times from host launch/file timestamps.

| Run (1 context unless noted) | Nominations | Matched /53 | Valid outside reference | Wall time | Output |
|---|---|---|---|---|---|
| Luna Max (flash) | 18 | 18 | 0 | ~9 min | 26 KB |
| GLM-5.3-Flash Max | 24 | 19 | 4 (+Warp cross-axis) | ~16 min | 27 KB |
| DeepSeek V4.1 Flash | 32 | 21 | 11 | ~6 min | 50 KB |
| Flash union (3 contexts) | 42 distinct | 28 | 14 | ~16 min parallel | 103 KB |
| **Astra 6 Max** | 34 | **31** | 3 (Roo Code, Atuin, Mosh) | ~18 min | 53 KB |
| **Sol 6.1 Max** | 40 | **33** | 7 (incl. gpui-libghostty, libvtty, Muxy, Keepty, Replit, Godot terminal) | ~30 min | 76 KB |

Readings:
- One premium context beats any one flash context (31–33 vs 18–21 matched)
  and slightly beats the 3-context flash union on matched recall (28),
  while the flash union still contributes more novel finds (14 vs 3–7).
- **Single-run variance is large even for premium:** Sol with the plain
  prompt missed 20 of the 53 products its own beefed-prompt reference run
  listed, and added 7 neither list had. The known universe grew to 74
  products; no single run — premium included — covers more than ~72% of
  it. "What would premium find?" has no single-run answer; union-of-runs
  is the right shape at every tier.
- Speed at equal task: DeepSeek ~6 min is the outlier; premium runs took
  2–5× longer for +50% matched recall over the best flash run.

## 2. Independent reviews — where they agree with me, where they don't

Both reviewers (Opus 5.5 xhigh, Sol 6.1 Max; files in sandbox `reviews/`)
independently verified artifacts rather than trusting reports. Points of
agreement across both, host-adjudicated:

**Confirmed:** the six passing grades are real artifacts (verdicts, scores
independently re-summed, candidate bytes identical to arm finals,
conditions 8/8); the GLM F13 split-FAIL was a genuine defect; Phase 9A
recall figures reproduce; slice quotes are verbatim; cache snapshots are
real. Extraction/carriage/bookkeeping results hold.

**Corrections I accept (my earlier reports overstated these):**
1. **"Fresh case" (Phases 7–8) is overstated.** The host-written skeleton
   (identical across arms, sha `a308b256…`) encodes gold/Phase-4-grade
   content: its seed mutations include the two the Phase 6 adversaries
   demonstrably missed (two-raw-name collision, interrupted retrieval),
   its restore protocol tracks GOLD item 9 nearly word for word, and its
   "no reference data inside the artifact" rule is GOLD ME04. My PHASE7
   claim "seeded from adversary output, never from gold" is contradicted
   by the files. Corrected claim: flash models can fill a skeleton that
   already encodes the acceptance architecture, without material errors.
   Whoever writes that skeleton per new topic is the untested top layer.
2. **"No premium model in the candidate chain" is overstated.** Early
   repair rounds were critic/adversary-driven, but the last 1–3 rounds
   per arm directly followed premium grader findings (timestamps and my
   own repair prompts confirm). Premium grading therefore functioned
   partly as a production input (18 grades for 3 passes), not purely as
   experiment overhead; and "iterate until double-PASS" is a stopping
   rule that makes eventual passes unsurprising — the informative
   numbers are rounds/contexts to converge, which the reports do give.
3. **Double grading does not establish zero material errors** — only
   "none found by two correlated graders". In all four splits one grader
   missed a real single-sentence defect, so single-error documents can
   plausibly pass two graders. (Host adjudication of splits against
   source, which I did, remains load-bearing.)
4. **Phase 9C details:** the fact both shapes missed is in prose
   (`terminal-shell-integration.md:139`), not alt-text-only as I wrote;
   six question-slices do not "tile" three whole documents (profiles file
   barely touched); strict monolith score is 20/24 (Sol recount) vs my
   keyword 21/24. The slices-vs-monolith direction survives; the tiling
   claim does not.
5. **"Union competitive with one premium pass" was generous** — see §1
   numbers. Also two ±1 scoring choices in Phase 9A (Jupyter match,
   Warp axis) should have been disclosed.
6. **Reproducibility gaps:** dispatch prompts were not archived; host
   scripts lived in /tmp. Fixed partially today: `er_lint.py` and
   `er_cache_fetch.py` copied into the sandbox root. Future runs must
   archive every prompt + input/output hashes + timings (all three
   reviewers/levers memos converge on this).

**Where I push back (mildly):** the skeleton leak does not make Phases
7–8 worthless — production was always going to have a host/template
layer; the honest open question is whether that layer can be generated
without gold (Opus lever N8, below), which is now the critical-path
experiment. Likewise grader-driven late repairs mirror how a real
qualification loop would work; the correction is about cost accounting
and claim wording, not about the loop being illegitimate.

## 3. Consolidated lever shortlist (mine + 3 independent memos)

Strong convergence across four independent lists:
- **Gold-free skeleton compiler** (Opus N8; Astra N1 reconcile skeleton
  with acceptance policy — the current skeleton literally invites the
  "owner-accepted risk" sentences graders failed). Build the skeleton
  from brief + records only; retrospective test on A8-01 is cheap.
  *This is now the critical experiment.*
- **Premise-once store** (Astra N2 = Sol N1): each factual premise stored
  once, all uses rendered from it — attacks the stale-premise-in-summary-
  cells class mechanically.
- **Uncited-residue audit** (Opus N4 = Astra N3 = Sol N2): after
  extraction, slice the source passages no record cites.
- **Flash critic panel as loop driver; premium only as adjudicator/held-
  out grade** (Opus N13; Sol top pick = my #8 acceptance-path hunter;
  Sol N6 coach/qualifier split). Removes the 15–30 min grade from every
  round and the fit-to-grader stopping rule.
- **Dependency-graph discovery** (Opus N1, demonstrated live: one
  crates.io reverse-dependency call recovered egui_term/iced_term and
  more) and **entailment audit atoms aimed at the final** (Opus N11).
- Mine stand as written in `PHASE10-LEVERS.md`; reviewers demoted
  record-caching (#11) to "indexing infrastructure, adopt without
  ranking" and shared-prefix caching (#16) as provider-dependent.

Both reviewers independently prescribe the same next experiment, which I
endorse as the Phase 11 design: **pre-registered, held-out briefs;
gold-free generated skeleton; flash-only repair loop with fixed budget;
cross-family graders calibrated on planted defects; a premium baseline
arm on identical inputs; every prompt/hash/timing archived.** That run
— not another tuned-case pass — is what would settle the replacement
claim.
