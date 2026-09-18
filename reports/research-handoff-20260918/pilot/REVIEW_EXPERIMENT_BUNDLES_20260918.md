# Experiment bundles — four reports-only branches

I am an Opus 5 agent. I produced none of these bundles and ran no arm. Everything below is read-only: I wrote
nothing under `~/PM-Experiments/`, nothing in `/mnt/Cursor/PuppetMaster`, and created no branch. Bundle contents
were extracted with `git archive` into my scratchpad rather than checked out.

| # | branch | tip | verdict |
| --- | --- | --- | --- |
| 1 | `research/continuation5-20260917` | `ae54b3df2f` | **fix first** — one wrong count word, everything else reproduces |
| 2 | `research/jj-c5-adjudication-20260917` | `72a7a13205` | **land** |
| 3 | `research/topic2-20260917` | `4742fc84fb` | **land** |
| 4 | `research/topic2-adjudication-20260917` | `3fcfde3e3b` | **land** |

All four are reports-only: `git diff --name-only <merge-base>..<tip>` returns **zero** paths outside `reports/`
for every branch. No secrets in any added line across all 24 commits. Every commit on every branch carries the
required co-author line (7/7, 4/4, 12/12, 1/1).

---

## 1. `research/continuation5-20260917` — the continuation-5 runner bundle

**Verdict: fix first.** One sentence miscounts. Every figure I sampled reproduces from durable state.

### The fix

`reports/jujutsu-research-2026-09-11/continuation5/README.md:367` reads "**Four** attempts are archived unscored
and preserved with their manifests" — and the same sentence then correctly names **three**: "b-compare attempt 1,
T80 attempt 1, A24 attempt 1". Three is right. `arm-history/` holds exactly three archived trees, each with its
manifest (`a24-attempt-1`, `b-compare-attempt-1`, `t80-attempt-1`), and each of the three `*-attempts.json` files
in the bundle records exactly two attempts with `scored: false` on the first. Change "Four" to "Three".

Nothing else in the bundle depends on the number, and the enumeration beside it is correct — which is why this is a
word fix rather than a figure problem.

### What reproduces

**Nine runs.** Eight directories under `runs/` plus the separate `prioritization/J0001-prioritize-20260917-043645`
tree, which ran on a different runtime (omp/18.2.2) and is therefore its own run. 8 + 1 = 9.

**134 jobs.** This one needs care, because each run tree also carries the *inherited* frozen premium artifacts the
arms were handed as input, and the b-compare tree additionally carries the 30 b-breadth jobs that feed it. Counting
only jobs that actually executed on 2026-09-17, and excluding inherited trees:

| | jobs |
| --- | ---: |
| scored arms: p-depth 12, b-breadth 30, b-compare 12, t80 12, a24 24 | 90 |
| archived attempts: a24-1 24, t80-1 7, b-compare-1 12 | 43 |
| prioritization | 1 |
| **total** | **134** |

Exact. I confirmed the b-compare trees separately: each shows 42 jobs dated 09-17, of which 12 are compare jobs and
30 are the inherited breadth stage, so the bundle's 12 is the arm's own output and does not double-count.

**Per-arm cost lines — all five reconcile to full float precision.** The bundle carries two distinct cost figures
per arm, and both match the durable `priced-usage-final.json`:

| arm | `captured_upper_usd` | durable `observed_upper_usd` | unresolved | durable |
| --- | ---: | ---: | ---: | ---: |
| p-depth | 85.501148000 | 85.501148000 | 0.00 | 0.00 |
| b-breadth | 0.360562602 | 0.360562602 | 0.00 | 0.00 |
| b-compare | 102.196700000 | 102.196700000 | 0.00 | 0.00 |
| t80 | 76.452737000 | 76.452737000 | 12.00 | 12.00 |
| a24 | 162.149745000 | 162.149745000 | 0.00 | 0.00 |

Zero mismatches. The separate `runtime_reported_cost_usd` (what the CLI itself reported) is carried alongside and
differs where it should — $72.13 against a captured $76.45 for t80, $0.00 against $0.36 for the Muse arm — which is
the honest way to publish two measurements of the same thing rather than silently picking one.

**Stop reasons** match `campaign-terminal.json` for all five arms. **No archived attempt is scored**: every scored
run is the surviving attempt (`a24-…-233922`, `b-compare-…-133734`, `t80-…-191342`).

---

## 2. `research/jj-c5-adjudication-20260917` — the continuation-5 adjudication

**Verdict: land.**

**`SHA256SUMS` verifies completely** — `sha256sum -c` reports zero non-OK lines across the bundle.

**Every headline figure reproduces from `campaign-union.json`:**

| arm | stated | in the bundle |
| --- | ---: | ---: |
| P (prioritized depth) | 32 | 32 |
| B (breadth + compare) | 39 | 39 |
| T80 | 26 | 26 |
| A24 | 43 | 43 |
| claude-hicap (baseline) | 45 | 45 |

**Ten-arm union 62** (56.36% of 110), with the cumulative progression `18 → 35 → 40 → 43 → 54 → 57 → 59 → 62 → 62
→ 62` — which is what makes the claim that T80 and A24 each added zero checkable rather than asserted.

**Variance floor 7–8**, measured twice independently: "T80 measured eight on four jobs; A24 measures seven on six."
Two estimates on the same case and model at different job counts.

**49 candidates, 11 flagged.** The 49 is the length of the `candidates` array, split `continuation_4: 27` +
`continuation_5: 22`. The 11 is `inside_or_adjacent_to_a_continuation3_rejection`: 5 + 6.

**The production reading follows from the numbers.** With a 7–8 noise band and the five scores above, A24's −2 and
Arm B's −6 fall inside it and P's −13 and T80's −19 fall outside — which is exactly how the README's verdict table
reads them. The recommendation to plan around `claude-hicap` follows from it being highest on every axis; the
recommendation of 12 admissions over 24 follows from A24 spending 1.96× for −2; the union ceiling claim follows
from the progression. It also retracts its own earlier Arm B report ("which read its 6-finding deficit as an effect
of the split. It was not"), which is the right move and the kind of thing a bundle usually omits.

**No archived attempt is scored.** Each `*-scoring.json` names the surviving run. `b-breadth-compare-scoring.json`
mentions the archived `-123157` only in its isolation record, with `scored_attempt` pointing at `-133734`.

**Cross-bundle:** the adjudication independently re-checked the runner's figures for p-depth, t80 and a24 and
recorded `all_confirmed: true` with `corrections: []`. The a24 figures it confirms (162.1497, $0.00 unresolved, arm
wall 6,617.0 s, summed 19,612.7 s) are the same ones I pulled independently from the durable state and from bundle
1 — three-way agreement.

---

## 3. `research/topic2-20260917` — the Azure DevOps runner bundle

**Verdict: land.**

**All three arms reconcile to full float precision** against their durable `priced-usage-final.json` and
`campaign-terminal.json`:

| arm | captured | durable | unresolved | wall s | summed s | status counts |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| s-full | 111.630098250 | 111.630098250 | 72.00 | 39,549.77 | 16,007.22 | 14 completed, 5 interrupted, 1 null |
| h2-research | 0.154507254 | 0.154507254 | 0.00 | 772.35 | 1,687.51 | 10 budget_truncated, 2 completed |
| h2-review | 43.715604250 | 43.715604250 | 72.00 | 57,154.07 | 6,466.66 | 6 interrupted, 3 completed, 3 cli_error |

**The drain crashes are recorded as drain-induced, and the durable record carries the discriminating evidence.**
`CORRECTION-drain-killed-campaigns.json` supersedes the bundle's own earlier claim that the Opus session limit
killed the campaigns, and attributes all four deaths to `drain_arm.py` lowering `cap_usd` on a live meter, tripping
an identity guard 1–4 seconds later. I checked the durable campaign logs:

- All four drained logs contain `ValueError: Arm monetary identity changed` — the two originals end in it; the two
  resume logs contain it twice and then reach a real terminal with `pending_intake_preserved: true`.
- `h2-research`, the one arm the correction says never had a drain applied, contains **zero** occurrences and
  reached its designed terminal normally.

That control is what turns the attribution from a story into a finding. The correction also states plainly what it
got wrong, names the consequences for the figures (the $72-per-arm residues and the absent `campaign-terminal.json`
are drain-induced, not provider-induced), and ports the working mechanism from continuation 5 — two runners hit the
same guard independently the same day.

**The verified waits carry Jared's attribution and honest intervals.** Three intervals across two arms (one for Arm
S, two for h2-review; the first is the shared 12:00Z outage window applied to both). Each carries
`verified: true`, an `evidence_ref` into `PROGRESS.md`, and `authorized_by: "Jared, verified 2026-09-17 via
coordinator relay"`. The second h2-review wait adds `verified_no_requests_inside: true` and an explicit note that
its end is **the interval Jared verified (18:35:00Z), not the moment of application** — so the arm does not credit
itself the 74 minutes between verification and application. That is the honest choice and it was made against the
arm's own interest.

I tested the intervals rather than taking the claim: **no job of the owning arm started inside any verified wait.**
The only records falling inside are teardown `finished_at` stamps within 6–15 seconds of each interval's start —
the outage cutoff and the drain kill respectively — and, inside h2-review's second wait, sixteen Arm S jobs, which
belong to a different arm running on its own clock. The claim holds for the arm each wait applies to.

The two `pending-verified-wait*.json` files are preserved as the pre-authorization records, each stating "PREPARED,
NOT APPLIED — needs coordinator authorization" and, in the first, why the runner declined to assert a human
verification on its own authority. Keeping those beside the applied waits is good practice.

**Cross-bundle: the runner adopted both of the adjudication's corrections.** `README.md:168` carries the
13-versus-12 explanation ("that is a scheduler hold, not a model job … **Twelve jobs ran**") and `:112` carries the
wall-clock caveat with a per-stage table against the targets. So the final runner bundle and the final adjudication
agree; no stale figure survives in either.

---

## 4. `research/topic2-adjudication-20260917` — the Azure union

**Verdict: land.**

**`SHA256SUMS` verifies completely** — zero non-OK lines.

**Every figure reproduces, and the arithmetic is internally consistent.** `union_size: 73`, and the `findings`
array has exactly 73 entries. Coverage: shared 19, Arm S unique 31, H2 unique 23 — so **Arm S = 50** and
**H2 = 42**, and 50 + 42 − 19 = 73. The per-class breakdowns sum correctly too (26+6+3+15 = 50; 14+2+5+21 = 42).

**The class split matches the Part 1 candidate record exactly**: 32 correction-shaped, 8 optional capabilities, 4
product choices, 29 already covered = 73. I reviewed that Part 1 record separately and it opens from the same
numbers, so the two agree.

**Method discipline is stated and bounded.** The union is built from `workspace/notes.md` and `workspace/leads/*.md`
only, with handoff, navigation, brief and assignment files explicitly excluded as inputs, and it records that union
propositions can only come from compare-stage documents. Its `manifests_verified_three_ways` block describes an
internal digest recomputed from sorted rows, matched against the runner's quoted value, and an independent re-hash
of the live tree — three agreeing, zero differing files, for all three manifests.

**Its runner-reading notes are honest about their own limits.** On the drain attribution it records: "I did not
re-derive the causal attribution to the drain tool; I record it as the runner's account, and the durable record is
consistent with it." That is the correct boundary for an adjudicator who did not run the campaign — and, as it
happens, I did re-derive it above, and the attribution holds.

---

## Cross-bundle consistency

No inconsistency remains in either pair.

- **Topic 2.** The adjudication raised three runner-reading notes; two were figure corrections (the 13-job count,
  the wall-clock times). Both are carried in the final runner README at `:168` and `:112`. The third was a caveat
  on its own verification scope, not a correction.
- **Continuation 5.** The adjudication re-checked the runner's figures for three arms and needed no corrections at
  all (`all_confirmed: true`, `corrections: []`). The a24 cost, wall and summed figures agree across the runner
  bundle, the adjudication and the durable state.

The only defect I found anywhere is bundle 1's "Four attempts" against the three it names.

---

## Commands run

| command | result |
| --- | --- |
| `git diff --name-only <merge-base>..<tip>` on all four branches | 0 paths outside `reports/` for each |
| `git log --format=%B \| grep -c Co-Authored-By` per branch | 7/7, 4/4, 12/12, 1/1 |
| secret-pattern grep over every added line, all four branches | 0 hits |
| `python3` count of run dirs plus the prioritization tree | 8 + 1 = nine runs |
| `python3` job census filtered to jobs executed 09-17, excluding inherited and breadth-fed trees | 90 scored + 43 archived + 1 = **134** |
| `python3` reconciliation of all five c5 arm cost lines against `priced-usage-final.json` | 0 mismatches on `captured_upper_usd` and `unresolved_charge_usd` |
| `python3` comparison of bundle stop reasons against `campaign-terminal.json` | all five match |
| `ls arm-history/*attempt*` and the three `*-attempts.json` | three archived attempts, each `scored: false` — README says "Four" (the fix) |
| `sha256sum -c SHA256SUMS` in both adjudication bundles | zero non-OK lines in each |
| `python3` read of `campaign-union.json` arms and `ten_arm_union` | P 32, B 39, T80 26, A24 43, hicap 45; union 62; progression ends 62/62/62 |
| `grep` for the variance floor and `python3` read of `totals` | 7 and 8 measured independently; 49 candidates; 5 + 6 = 11 flagged |
| `python3` read of each `*-scoring.json` scored run | every scored run is the surviving attempt; archived runs appear only in isolation records |
| `python3` reconciliation of all three topic-2 arm figures against durable state | exact to full float precision, including both $72.00 residues |
| `grep "Arm monetary identity changed"` across the durable campaign logs | present in all four drained logs, **absent** in the one undrained arm |
| `python3` read of `verified_human_waits` in all three arm budgets | three intervals, each `verified: true` with Jared's attribution and an evidence ref |
| `python3` scan for owning-arm jobs started inside each verified interval | **none**; only teardown stamps 6–15 s after each start, plus another arm's jobs |
| `python3` read of `topic2-union.json` and `topic2-arm-scoring.json` | 73 findings; 19 + 31 = 50, 19 + 23 = 42, 50 + 42 − 19 = 73; class split matches the Part 1 record |
| `grep` of the final topic-2 runner README for the two corrected figures | both carried, at `:168` and `:112` |
| `python3` read of `runner_figures_checked` in the c5 scoring files | `all_confirmed: true`, `corrections: []` for all three arms |
