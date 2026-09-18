# Continuation 5 adjudication — four process arms, and the production reading

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm. Every manifest was
verified three ways against durable state, every designed stop was confirmed before scoring, and every
credited code fact was verified against the arm's own pinned source.

Continuation 5 asked one question four ways: **against a fixed union, what does changing the process
buy?** The baseline is continuation 4's `claude-hicap` — one expensive model at high effort over the
frozen lead order, 12 admissions, a 160-response ceiling.

# THE PRODUCTION READING

**Plan around the `claude-hicap` configuration. Nothing beat it, and two things that looked like
improvements are noise.**

| Plan around this | Why |
|---|---|
| **One expensive model at high effort, over the frozen lead order** | 45 of 110, **$1.83 per finding**, **3.21 credits per compared lead**, 3,535 s wall. Best on every axis measured. |
| **12 admissions, not 24** | A24 doubled admissions for **1.96× the money** and moved recall by **−2**. Its marginal twelve leads yielded **0.42 credits each** against 2.71 for the first fourteen. |
| **A response ceiling above the observed maximum (≥ 160)** | Nothing ever hit 160. hicap's dearest job used 110, A24's used 131. T80's 80-turn ceiling cost 19 findings, only 2 of them attributable to the ceiling — and the low-ceiling arm was the **slowest of the five**, because the binding constraint was a job that was not turn-bound at all. |
| **No prioritization stage** | Arm P is the only design whose loss is outside the noise band and attributable to the design: ranking pushed whole families below the cut and lost 13 while comparing two *more* leads. |
| **Breadth only if you want to EXTEND the union, not to raise recall** | Arm B's −6 is inside the noise band, and it cost 24% more — but it is the only continuation-5 design that added anything to the campaign union (F027, F060, F110). If the goal is coverage of what nobody has reached, breadth is the only thing that worked. |
| **Budget for variance, not for configuration** | Two runs of the same model on identical inputs with no limit reached differ by **7–8 findings**, measured twice independently. If a decision turns on a difference smaller than that, run the configuration twice rather than changing it. |

**And the hard ceiling:** ten arms across two continuations reached **62 of 110**. The union stopped
growing at the eighth arm — T80 and A24 each added **zero**. The remaining **48** will not be reached by
more compute of the same shape; they need different **inputs**.

## THE VARIANCE FLOOR — read this before any table below

**T80 measured 8. A24 measured 7. Same case, same model, same effort, identical lead sets, no limit
reached by either run.** Two independent estimates on two different job counts.

Therefore **any arm-to-arm difference smaller than about eight findings is not distinguishable from
noise**:

| Comparison | Net | Verdict |
|---|---:|---|
| A24 vs claude-hicap | **−2** | inside the band — **not a real difference** |
| Arm B vs claude-hicap | **−6** | inside the band — **not a real difference** |
| A24 vs Arm B | **+4** | inside the band |
| Arm P vs claude-hicap | **−13** | outside — a real loss |
| T80 vs claude-hicap | **−19** | outside — a real loss |
| A24 vs T80 | **+17** | outside — a real difference |

This applies retrospectively to everything I have published in this campaign, including my own earlier
Arm B report, which read its 6-finding deficit as an effect of the split. It was not.

## Five-arm comparison

All five ran on the same premium artifacts, the same frozen case, 3 workers and the same $20 per job.

| | **claude-hicap** (baseline) | Arm P (prioritized depth) | Arm B (breadth → compare) | T80 (ceiling 80) | **A24 (24 admissions)** |
|---|---:|---:|---:|---:|---:|
| **Credited / 110** | **45 (40.91%)** | 32 (29.09%) | 39 (35.45%) | 26 (23.64%) | **43 (39.09%)** |
| corrections / 5 | 2 | 0 | 1 | 1 | **1** |
| optional capability / 36 | 4 | 2 | 6 | 1 | **6** |
| product choice / 6 | 3 | 1 | 1 | 0 | **2** |
| unsupported or covered / 63 | 36 | 29 | 31 | 24 | **34** |
| **Net vs baseline** | — | **−13** | −6 | **−19** | −2 |
| **Real, or noise?** | — | **real loss** | noise | **real loss** | noise |
| Admissions | 12 | 12 | 12 + 30 (two stages) | 12 | **24** |
| Response ceiling | 160 | 160 | 160 | **80** | 160 |
| Max responses used | 110 | 89 | 86 | 80 (the cap) | **131** |
| Leads compared (of 88) | 14 | 16 | **32** | 11 | **26** |
| **Credits per compared lead** | **3.21** | 2.00 | 1.22 | 2.36 | **1.65** |
| Admission order | frozen | Muse ranking | frozen (Muse delivery) | frozen | **frozen** |
| Reconcile model | Opus 5 | Opus 5 | **Muse Spark** | Opus 5 | Opus 5 |
| Jobs cut by a limit | 0 | 1 (account session) | 0 | **3 ceiling + 1 timeout** | 3 (sentinel hold) |
| Captured cost | **$82.52** | $85.50 | $102.56 | $76.45 | **$162.15** |
| **Cost per finding** | **$1.83** | $2.67 | $2.63 | $2.94 | **$3.77** |
| Arm wall | **3,535 s** | 4,193 s | 5,509 s | **6,260 s** | 6,617 s |
| Average concurrency | — | 2.74 | — | 2.05 | **2.96** |
| Unresolved charge | — | $0 | — | $12.00 | **$0** |
| Candidates inside a c3 rejection | — | **4 of 6** | 0 of 6 | 1 half of 4 | 1 half of 6 |
| **New to the campaign union** | — | **0** | **3** | **0** | **0** |

### The three results worth carrying forward

**1. Admissions are the weakest lever, and the measurement is exact.** claude-hicap's 14 compared leads
are a **strict subset** of A24's 26, and the split falls on a job boundary: A24's first six compare jobs
carry precisely hicap's fourteen leads, its last four carry twelve hicap never reached. So the marginal
value of admissions 13–24 is not an estimate — it is **five union findings** (F005, F025, F027, F057,
F086) for twelve leads and roughly $80. Yield per lead falls **2.71 → 0.42**, a 6.5× collapse. One of
those four marginal jobs produced the campaign's sharpest statement about `cancelled` results and
**zero** marginal union credit.

**2. The turn ceiling is the strongest lever, and it is not the ceiling.** T80's 19-finding gap
decomposes as **2** from the 80-turn ceiling, **8** from a 3,600 s timeout on a job that used only 60 of
its 80 permitted responses, **2** capped but confounded with variance, and **8** from jobs that hit no
limit at all. Raising 80 → 160 is worth about **2 findings**, and only for the 1 job in 12 that wants
more than 80. **The real cost of the low ceiling was the timeout it did not prevent.**

**3. Breadth trades recall for reach.** Arm B compared 32 leads to hicap's 14 for 24% more money, landed
6 findings lower (inside the noise band), and is the **only** continuation-5 design that added anything
to the campaign union. Its cheap Muse reconcile stage credited **zero** and structurally could not —
all 23 of its notes are headed "external technical, no Plans comparison" and not one cites a `Plans/`
passage — but it bought 54 reconciled leads for **$0.36**, which is what let the expensive stage compare
32.

## The campaign union across both continuations

Ten arms: continuation 4's six (Arm C, deepseek41, glm53, muse13, union, claude-hicap) and
continuation 5's four (P, B, T80, A24).

| | |
|---|---:|
| **Ten-arm union** | **62 of 110 (56.36%)** |
| Reached by **no** arm | **48** |
| …of which optional capabilities | 26 |
| …of which **corrections** | **3** — F001, F108, F109 |
| Reached by **all ten** arms | 10 — F004 F006 F010 F030 F061 F079 F081 F082 F084 F102 |
| Reached by **exactly one** arm | 10 — F024 F038 F054 F060 F064 F065 F083 F085 F106 F110 |
| Proper subsets among the ten | 7 — **all inside continuation 4** |

**Cumulative union in scoring order:** 18 → 35 → 40 → 43 → 54 → 57 → 59 → **62** → 62 → 62.
The eighth arm closed it. The ninth and tenth added nothing.

**Two cautions on this table.** The ten findings reached by exactly one arm are **single-run events**
and sit inside the variance floor — a unique credit is evidence that one *run* reached it, not that its
*configuration* can. And **no continuation-5 arm is a subset of any other or of any continuation-4
arm**: the process variants diverge rather than nest, which is the clearest structural difference
between the two continuations.

**F001 is the one to look at.** It is a correction — *"require a non-null owner receipt for every
terminal JJ attempt, including failed, cancelled, recovery-required and effect-unknown results"* — and
**NINE of the ten arms came close and every one of them stated it for one case rather than as the
general obligation.** I recorded it as a partial nine times and credited it never. A finding that nine
independent runs almost reach is a finding the case is pushing toward and the prompt is not asking for.

## Out-of-union candidates: 49 across both continuations

27 from continuation 4, 22 from continuation 5. **None was added to the union**; the owner decides.
35 corrections, 7 capabilities, 7 product choices. **Eleven are flagged** as inside or adjacent to
continuation 3's four rejected expansions, and every one of them touches the same cluster — adding a
route, a command or a command class to the closed 31-command Jujutsu inventory. Arm P is the outlier:
**four of its six** sit inside standing rejections. Arm B filed **zero of six**; T80 and A24 one half
each.

Three convergence clusters span both continuations, recorded in `consolidated-candidates.json`:

- **The non-mutating read fence.** Five arms found independently that the read mode the Plans name
  cannot deliver the property the Plans promise — and the campaign then **corrected itself twice**.
  Arm B recommended `--at-op=@ --ignore-working-copy` from jj's own CLI reference; T80 superseded that
  by showing `resolve_op_heads` performs the ancestor-marker cleanup write **before** the `@` resolver
  is reached, so only an explicit operation id is a fence; A24 restated it at the Plans' own v0.44.0
  profile, extended it to the whole read command inventory, and added a before/after op-head equality
  check on capture.
- **Restore-path defects found by reading what the records do not carry** — ten candidates, all the
  same shape. The sharpest is A24's **C5A-03**: a capture blocked for a *non-dependency* reason is
  **unrepresentable in both closure schemas**, because `complete` requires the barrier held and
  `partial`/`blocked` require `missing_dependency_refs` `minItems: 1`, with `additionalProperties:
  false` and no blocked-reason field. I checked all four conditionals on `main`; they hold.
- **Adding a route to the closed inventory** — the standing rejection cluster, six candidates.

## Verification, for all four arms

Every manifest verified three ways — internal digest recomputed from the sorted rows, matched against
the runner's quoted value, and an independent re-hash of the live tree — with **zero differing files**:
Arm P `bb21eaef…` (7,404), Arm B breadth `711302fa…` (18,258) and compare `17b32556…` (20,012), T80
`b5498edb…` (13,222), A24 `b08f2518…` (18,368). All stopped on `admitted_attempt_cap`.

**Two runner labels that must not be read at face value, both checked from the journal:**

- **A24's three `budget_truncated` jobs are the sentinel, not money.** The arm had committed $176.46 of
  a $300 cap when the sentinel pinned a **$145.19** headroom hold on a typed five-hour
  `allowed_warning` at 0.90, taking committed-with-hold to $321.66 and denying the next request. The
  hold fired *after* all 24 admissions were spent, live jobs settled to their own terminals, and all 24
  reconciled with **$0.00 unresolved**.
- **T80's `budget_truncated` jobs are the 80-response ceiling**, and its one real hole is a 3,600 s
  timeout that used 60 of 80 permitted responses.

## Limits

- One frozen case, one run per configuration. Every marginal figure here is a single-sample estimate,
  and the variance floor is itself measured from two samples.
- Recall is measured against continuation 3's fixed 110-finding union, built from premium and hybrid
  output. Every arm can only score inside it, so "0.42 credits per marginal lead" measures what a
  **fixed** union can absorb, not what those leads were worth.
- *"Unsupported or already-covered"* is a union class, not a false-positive rate.
- Arm B differs from the baseline in two ways at once (reconcile model **and** the lead set that
  reached compare), so its effect is not cleanly isolated. A24 and T80 each differ in exactly one.
- Adjudicator and the reviewed model share a family; code facts were verified against pinned bytes.

## Files

| File | Contents |
|---|---|
| `p-depth-README.md`, `b-breadth-compare-README.md`, `t80-README.md`, `a24-README.md` | Per-arm adjudications |
| `*-findings.json`, `*-candidates.json`, `*-scoring.json` | Per-arm credits, candidates and scoring |
| `campaign-union.json` | The ten-arm union, the cumulative progression, the 48 reached by no arm, the nesting analysis |
| `consolidated-candidates.json` | All 49 candidates across both continuations, with rejection checks and three cross-continuation convergence clusters |
| `evidence-manifest.json` | Evidence pointers and hashes |
| `SHA256SUMS` | Bundle hashes |

Runner bundle: branch `research/continuation5-20260917`, final commit `ae54b3df2f`. Continuation 4's
adjudication is on `main` at `reports/jujutsu-research-2026-09-11/continuation4/adjudication/`. Both are
referenced by path; their tables are not duplicated here.
