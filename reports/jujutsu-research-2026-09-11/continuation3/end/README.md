# Jujutsu continuation 3 — bounded runtime result and partial adjudication

Both arms ran on the original frozen case `bc7569b3f5`, using the same reviewed protocol, three workers, at most three assigned leads and the 10,000-character packet bound. Both continuation review stages used `gpt-6-astra` at `xhigh`. Own-arm history was preserved; DL-043 and D5 were outside every worker input. The [launch-gate report](../gate/README.md) records the bounded repair, offline review and one two-request qualification.

**The research runs are terminal; finding adjudication is incomplete.** Eleven of 22 jobs received finding-note review. Eleven remain unreviewed, and supplemental coverage is itemized in [the bulk inventory](adjudication/remaining17-bulk-review.json). Unreviewed outputs are unknown, never negative findings. The phase allowance limited the remaining adjudication; this is not a completed expanded-union comparison.

## Runtime and cost

Amounts use the preserved standard API-equivalent valuation, not a cash invoice. New unresolved charges are additional to captured usage. Historical unknowns retain their prior valuation and remain visible.

| Arm | New admissions | Completed / request-limited / interrupted | Job-end reconciled / unresolved | Increment captured | Lifetime captured / cap | New unresolved | Captured + new unresolved |
|---|---:|---:|---:|---:|---:|---:|---:|
| Premium | 12/12 | 7 / 5 / 0 | 10 / 2 | $81.583790 | $121.923954 / $250 | $24.00 | $145.923954 |
| Hybrid | 10/12 | 2 / 5 / 3 | 7 / 3 | $70.126680 | $73.723142 / $100 | $36.00 | $109.723142 |

**Hybrid exceeded its accounted $100 cap by $9.723142368 after three terminal unresolved charges.** Captured usage alone remained below $100. The phase guard interrupted three jobs; each lacked one final native receipt and retained its $12 charge. No further arm requests were made after termination. This outcome does not establish a hard total-spend guarantee for the admission estimates.

Premium stopped on its twelve-admission grant. Hybrid stopped on the global phase allowance after ten admissions; two admissions remain unused and its original clock is retained. The internal closing reserve was reallocated once from $20 to $15 after completed premium work; the $80 phase cap, usage start, accumulated charges, arm caps, clocks and grants were not renewed. [Allocation record](reserve-allocation.json).

All 22 jobs retained notes. Premium has eight historical unknown-usage records; hybrid has one. [Runtime detail](runtime-summary.json), [independent audit](terminal-metrics-review.json), and [pending intake/delivery state](pending-progress.json) retain the evidence references and hashes.

## Timing

Wall time is the admission-to-terminal span for that stage. Summed time is the total recorded job duration; average concurrency is sum divided by wall. Interleaved stages overlap, so their wall times are not additive.

| Arm / stage | Jobs | Wall minutes | Summed job minutes | Average concurrency |
|---|---:|---:|---:|---:|
| Premium / reconcile | 6 | 48.186 | 87.298 | 1.812 |
| Premium / compare | 6 | 53.615 | 98.065 | 1.829 |
| Premium / overall | 12 | 66.346 | 185.362 | 2.794 |
| Hybrid / reconcile | 6 | 42.341 | 84.332 | 1.992 |
| Hybrid / compare | 4 | 27.546 | 41.962 | 1.523 |
| Hybrid / overall | 10 | 42.343 | 126.294 | 2.983 |

No discovery, implementation or history jobs were newly admitted in this increment. Historical intervals were not reconstructed or filled in.

## Finding coverage

The fixed, previously adjudicated 105-finding reference union remains the denominator. The reviewed subset demonstrates premium support for **at least 74/105 (70.48%)**, versus its original 73/105; hybrid retains **at least 86/105 (81.90%)**. Premium directly rediscovered F001, the terminal-receipt correction already fixed in Plans. Remaining outputs may increase either count.

Observed shared support is 55 findings; observed unique support is 19 premium and 31 hybrid. These are provisional classifications within reviewed records, not certified uniqueness after the whole continuation. Unsupported/rejected coverage is at least 51/63 in each arm; that class includes already-covered proposals and is not a false-positive rate. Optional-capability support is at least 19/35 premium and 30/35 hybrid; product-choice support is at least 3/6 and 5/6; correction support is at least 1/1 and 0/1. [Machine-readable coverage](reference-union-coverage.json).

Budget-limited coverage consists of five request-limited premium jobs, and five request-limited plus three globally interrupted hybrid jobs. Their saved assertions remain eligible for review; raw statuses are preserved. Per-job and affected-lead inventories are in the runtime detail. Finding-level attribution from all budget-limited outputs remains incomplete.

One new restore-readiness schema defect was reproduced against the frozen schema and independently against the reviewed current Plans snapshot: readiness can coexist with a blocked workspace map, blocked dual writer/identity collision, or an unverified working-copy relationship. Positive and negative controls passed. This is one correction obligation with three counterexamples, distinct from F001. [Validation](restore-readiness-validation.json). Expanded-union placement and symmetric arm scoring remain unfinished.

A hybrid graph-schema relational-validation candidate is retained in the bulk review and still requires current-owner/validator adjudication. A claimed Git-gated conflict-command defect was withdrawn: the Source Control owner explicitly preserves those commands as Git-only absent normalization. Optional proposals remain unapproved. No canonical Plans were edited during this continuation.

## Remaining work and limits

Finish the exact eleven-job unread inventory and pending supplements, adjudicate the graph candidate and remaining proposals against current owner contracts, then rescore both arms symmetrically against any expanded union. The present run is one case with unequal inherited history and unequal terminal coverage; it does not establish a general model-quality ranking.

The recorded phase checkpoint is $76.733038 of $80 at 2026-09-11T22:40:16.327202+00:00; later publication usage is excluded. [Checkpoint](phase-cost-checkpoint.json). All prior phase costs remain separate and unchanged.
