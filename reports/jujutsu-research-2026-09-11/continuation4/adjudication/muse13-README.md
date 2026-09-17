# Arm muse13 — adjudication against the continuation-3 union

> **All six arms are now scored. The final comparison table, the recomputed nesting, the six-arm union, all 27 out-of-union candidates and the cross-arm factual verifications are in [`README.md`](README.md)**, which supersedes every comparison table below.

I am an Opus 5 agent acting as adjudicator. I ran no arm. Same method and verification as for the three
arms before it. No model-family relationship between me and the reviewed model here.

## Verification

**Terminal stop checked first, as instructed.** `campaign-terminal.json` and `monitor-state.json` both
record `Stop: admitted_attempt_cap` — a designed gate, not an exception. Safe to score, in contrast to the
quarantined union and glm53 runs whose `stop_reason` is a Python `FileNotFoundError`.

Manifest internal digest `c20aa3925d8a04521fe5314ff993b9a861b80c4c02ca6f1b500b9502659991d3` reproduces from
its 11,510 rows and from my own re-hash of the whole tree (227,493,876 bytes).

Job table rebuilt from durable state; everything reproduced: 12 jobs — **7 reconcile** (J0017, J0018,
J0019, J0020, J0023, J0025, J0027) and **5 compare** (J0021, J0022, J0024, J0026, J0028); 10 finished and 2
ceiling-bound; 366 native responses with receipts equal to responses in all 12; reconcile wall 557.8 s,
compare wall 527.9 s, arm wall 668.7 s, summed 1,693.9 s, average concurrency 2.5330; captured $0.164390;
11 of 12 wrote notes.md; 25 lead deliveries; 12/12 reconciled with $0 unresolved. Every one of the 366
responses records provider `muse-code`, model `muse-spark-1.3-contributor`.

**The `budget_truncated` caveat re-verified from durable state**, as for deepseek41:
`protocol/arm-budgets/muse13.json` has no per-job money ceiling (only `muse13_usd: 50`); $0.164390 captured
against $50 with a per-job maximum of $0.0246; `money_stop_reason` null; and both truncated jobs sit at
40–41 responses while the ten completed sit at 20–38. Both are response-ceiling truncations. J0020's 41st
response is the post-response boundary the runner documented in `corrections.json` C3.

## Assertion corpus — 16 documents, 236,309 bytes, in 11 of 12 jobs

11 notes.md (10,664–37,571 bytes) and 5 `workspace/leads/*.md` (J0017 ×2, J0020 ×3). **J0018-reconcile is
the only job with no assertion document at all** — 40 responses, 41 source-locator receipts, nothing
written. Its lead `L-7dc9a6726cf9` was re-attempted by J0020, which delivered, so no lead was lost to it.

## Credited — 40 of 110 (36.36%)

| Class | Credited | Denominator |
|---|---:|---:|
| Correction | 1 | 5 |
| Optional capability | 3 | 36 |
| Product choice | 1 | 6 |
| Unsupported or already-covered | 35 | 63 |
| **Total** | **40** | **110** |

- **Correction (1/5):** `F107`. Missed: `F001`, `F106`, `F108`, `F109`.
- **Optional capability (3/36):** `F035` `F066` `F090`.
- **Product choice (1/6):** `F032`.
- **Unsupported or already-covered (35/63):** `F002` `F004` `F006` `F007` `F008` `F010` `F011` `F029`
  `F030` `F031` `F033` `F034` `F036` `F037` `F043` `F050` `F051` `F053` `F056` `F059` `F061` `F062` `F072`
  `F073` `F074` `F079` `F080` `F081` `F082` `F084` `F087` `F088` `F089` `F092` `F102`.

Per-finding basis in `muse13-findings.json`. Highlights:

- **F107** — J0028's three SCS-017 repairs: close the page on `>=` rather than exact `==` so a trailer row
  cannot push it past `page_size`/`returned_count`/`maxItems 200`; resume from the next unreturned *stable
  node* with rendered-only rows never advancing the stream offset; bind the continuation to the same
  generation and selected revision. **Adjudicator note:** F107's finite parent-reference expansion clause
  is *not* addressed — unlike claude-hicap, this arm never reaches the elided/missing ancestry question.
- **F008** — the partial-resolve lead states it in its own words: "`cmd_resolve()` rewrites the commit and
  awaits `tx.finish()` **before** returning that partial-resolution error — a nonzero native outcome need
  not mean no native mutation. Abandoning a later file must not be described as rolling back earlier
  accepted resolutions."
- **F090** — "materialize closure through a separately authorized capability", grounded in the promisor
  thread's real, fallible hydration routes.
- **F056** — J0022 quotes JJI-005 at length and names it: "This is the requirement-level prohibition on
  substituting file text for native conflict state."

Eight partials: `F001` `F022` `F028` `F044` `F069` `F076` `F083` `F094`.

## Candidates outside the union — 5

Recorded with evidence, not added to the union. Full text in `muse13-candidates.json`. Notably, three of
the five were reached independently by claude-hicap, which strengthens them: C4M-01 (JJI-008 states the
ends of closure completeness but names no decision procedure), C4M-04 (bookmark controls have the hooks
for scope disclosure but none of the content), C4M-05 (divergent-change identity is unrepresentable).
C4M-02 (the closure manifest records neither the resolved backend paths nor the environment that resolved
them, and the same relative path resolves differently against the object database than against the Git
directory) is this arm's own. C4M-03 is flagged as partly duplicative, but its **Option B** — scope
`diff.open` and the merge-editor routes as read-only or built-in-only with a typed disabled reason — is a
genuine second disposition no other arm offered.

## Two cross-arm observations

**1. The four new arms nest.** claude (18) ⊂ muse13 (40) ⊂ claude-hicap (46), and deepseek41 (33) ⊂ muse13
too. claude and deepseek41 are the only pair that are *not* comparable (claude alone held `F051` against
deepseek41). The four-arm union is exactly claude-hicap's 46 — **no arm contributed a finding claude-hicap
missed.** On this union the review arms differ in depth, not in kind.

**2. muse13 did not make the UNIX_EPOCH error both Claude arms made.** Both Claude arms concluded that
`op_store().gc(head, UNIX_EPOCH)` prunes everything unreachable from the head; deepseek41 read the
implementation and got it right. muse13 does not make the claim at all — it records the fact of the call
("runs `op_store().gc(keep=[head], UNIX_EPOCH)` while deliberately NOT running `store().gc()`") and draws
only the conclusion the evidence supports: "Do not treat sync as ready-made backup." That is a third
distinct outcome across four arms on one code fact, and declining to characterise an unread implementation
is the right behaviour.

## Shared versus unique coverage

| | Count |
|---|---:|
| muse13 ∩ premium | 39 |
| muse13 ∩ hybrid | 31 |
| muse13 ∩ premium only | 9 — `F008` `F031` `F032` `F033` `F034` `F036` `F053` `F084` `F090` |
| muse13 ∩ hybrid only | 1 — `F073` |
| **Unique to muse13** | **0** |
| Held by premium, missed | 39 |
| Held by hybrid, missed | 59 |

## Request-limited coverage and reached delivery

2 of 12 jobs were ceiling-bound; zero money truncations; one job (J0018) produced nothing.

| Measure | Value |
|---|---|
| Distinct leads admitted to a reconcile job | 14 → **14 delivered (100%)** |
| Distinct leads admitted to a compare job | 11 → **11 delivered (100%)** |
| Of the 88 input leads: reached a saved comparison | **11/88 (12.5%)** |

**One named structural loss.** The GitButler triple (`L-732df4469871`, `L-3c0712b66649`,
`L-0eb0bdc5ba1a`) was reconciled in full by J0027 but never admitted to a compare job — the 12-admission
cap ran out after five compares. Its credits (`F010`, `F011`, `F080`, `F089`, `F090`, `F102`) therefore
rest on reconcile-stage assertions, and no canon-contract correction came out of that lead group.
deepseek41 lost the graph triple's compare the same way.

## Comparison table

**The current, full comparison table now lives in `union-README.md` (source: `adjudication/union/README.md`)** and supersedes the one below. The `union` arm is the first continuation-4 arm that is NOT a review replacement: it ran the full pipeline from discovery on the frozen case, so its recall is not bounded by the premium arm's artifacts and it belongs beside premium and hybrid, not beside the review arms. It scored 43/110 (39.09%), added 11 findings no review arm reached, and contributed ZERO findings unique to itself — every credit sits inside premium union hybrid. Five-arm union 57/110 (51.82%).

Premium and hybrid rows are continuation 3's own numbers.

| Measure | Premium | Hybrid | Claude (Arm C) | deepseek41 | **muse13** | claude-hicap | union | glm53 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Review model | gpt-6-astra xhigh | gpt-6-astra xhigh | claude-opus-5 xhigh | deepseek-v4.1-flash max | **muse-spark-1.3 xhigh** | claude-opus-5 xhigh | requeued | requeued |
| Recall / expanded 110 | 78 (70.91%) | 90 (81.82%) | 18 (16.36%) | 33 (30.00%) | **40 (36.36%)** | 46 (41.82%) | – | – |
| Corrections / 5 | 4 | 2 | 0 | 0 | **1** | 3 | – | – |
| Optional capabilities / 36 | 20 | 30 | 1 | 2 | **3** | 4 | – | – |
| Product choices / 6 | 3 | 5 | 0 | 1 | **1** | 3 | – | – |
| Unsupported or already-covered / 63 | 51 | 53 | 17 | 30 | **35** | 36 | – | – |
| Unique to the arm | 20 | 32 | 0 | 0 | **0** | 0 | – | – |
| Reconcile / compare split | 6 / 6 | 6 / 4 | 8 / 4 | 9 / 3 | **7 / 5** | 6 / 6 | – | – |
| Completed / limited / interrupted | 7 / 5 / 0 | 2 / 5 / 3 | 1 / 11 / 0 | 2 / 10 / 0 | **10 / 2 / 0** | 12 / 0 / 0 | – | – |
| Jobs with a saved assertion | 12/12 | 10/10 | 4/12 | 8/12 | **11/12** | 12/12 | – | – |
| Input leads reaching a comparison | – | – | 3/88 (3.4%) | 4/88 (4.5%) | **11/88 (12.5%)** | 14/88 (15.9%) | – | – |
| Assertion documents | – | – | 18 | 19 | **16** | 64 | – | – |
| Reconcile wall (min) | 48.186 | 42.341 | 23.103 | 18.896 | **9.296** | 43.927 | – | – |
| Compare wall (min) | 53.615 | 27.546 | 20.265 | 12.524 | **8.798** | 44.710 | – | – |
| Arm wall (min) | 66.346 | 42.343 | 31.133 | 18.930 | **11.145** | 58.920 | – | – |
| Summed job time (min) | 185.362 | 126.294 | 81.482 | 51.590 | **28.232** | 170.988 | – | – |
| Average concurrency | 2.794 | 2.983 | 2.617 | 2.725 | **2.533** | 2.902 | – | – |
| Per-job limits | continuation-3 regime | continuation-3 regime | 40 resp / 2400 s / $12 | 40 resp / 2400 s | **40 resp / 2400 s** | 160 resp / 3600 s / $20 | – | – |
| Lifetime captured / cap | $121.92 / $250 | $73.72 / $100 | $36.12 / $100 | $0.53 / $50 | **$0.16 / $50** | $82.52 / $150 | – | – |
| New unresolved charges | $24.00 | $36.00 | $0.00 | $0.00 | **$0.00** | $0.00 | – | – |
| Captured $ per credited finding | $1.563 | $0.819 | $2.007 | $0.016 | **$0.004** | $1.794 | – | – |

muse13's per-job limits match Arm C's and deepseek41's, so **its cost and duration are comparable with
those two**. They are *not* comparable with claude-hicap, which ran a deliberately different budget regime.
On that like-for-like basis muse13 is the standout of the three: **2.2× Arm C's recall for 1/220th the
captured cost and a third of the wall time**, and it is the fastest arm in the whole experiment.

## Limits

1. One frozen case; a same-input review replacement bounded by the premium arm's research artifacts.
2. Recall is against the adjudicated continuation-3 union, not an external exhaustive truth set.
3. "Unsupported or already-covered" is a union class, not a false-positive rate.
4. 2 of 12 jobs were response-limited and one produced nothing; reported separately.
5. Cost is a captured upper valuation at the published tariff, not a cash invoice. Comparable with Arm C
   and deepseek41; not with claude-hicap.
6. The arm admitted 14 of 88 input leads, so most of what it missed it was never given.
7. union and glm53 are unscored — both were interrupted and requeued as fresh arms; the clean union rerun
   launched at 22:19:33Z on `openrouter/stealth/union-alpha` as a full arm, with glm53 to follow.
