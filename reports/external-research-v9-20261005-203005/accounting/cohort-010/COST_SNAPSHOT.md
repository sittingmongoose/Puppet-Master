# ER9 mechanical cost snapshot

Snapshot: 2026-10-06T01:39:41.861661+00:00

Known values include failed attempts and cache exactly once. Cancelled/unexposed tails and billing remain UNKNOWN. Provider, UI, Goal, and supervisor totals are separate counters.

| Category | Attempts | Known native Goals | Unknown starts | Known tokens | Unknown usage rows |
|---|---:|---:|---:|---:|---:|
| candidate_attempt | 92 | 84 | 0 | 266,957,508 | 1 |
| route_canary | 2 | 2 | 0 | 57,240 | 0 |
| route_canary_or_metadata | 11 | 5 | 3 | 690,126 | 3 |
| route_probe | 2 | 0 | 0 | 0 | 0 |

I01 full four actual stages: 7,992,185 known tokens. Luna D14 first four native attempts: 19,152,242 known tokens.

Actual interrupted turn statuses are preserved; completion notifications do not establish completed turns or Goals. Occupied-time sums are not critical-path duration. Cleanup reserve is not observed cleanup. Failed effort is retained without asserting that all time was wasted.

Validation: 0 errors.


D08A finished whole evaluator wall: 1163.017374667 seconds, containing source690.912547327 and Phase2 472.10482734. Eval3 finished whole1762.552529925 seconds includes source794.3574254, Phase2 403.956776389, waits and review preparation. Neither wall interval is model/API occupied time or candidate/provider token cost. No resets or source judgments changed.

D08A selected two-stage2,469,923 tokens and shared original I01 creator2,515,693 are references to already-counted actors, not another global charge. For the selected two-arm comparison view the shared origin is counted once; an explicit equal1/2 descriptive split is1,257,846.5tokens each, not measured per-arm origin inference or complete-pipeline cost. Input provenance is not proof of source uptake or warm-cache benefit.

Root supplied active cumulative counter at 2026-10-06T01:33:20Z:11,397,746tokens/18,250seconds, helper/cache/provider inclusiveness unknown. It is stored in accounting-only supplemental metadata and kept separate from candidate/provider/evaluator totals.

Active Goal usage is only the captured known portion; no tokens, tails, completion, model billing, pipeline success, warm-cache benefit or evaluator cost are invented where telemetry is absent. Later evaluator receipts remain additive checkpoints. Original failed seed17,725,511tokens and actual continuation6,407,054tokens are each already included once.
