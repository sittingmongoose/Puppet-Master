# ER9 mechanical cost snapshot

Snapshot: 2026-10-06T00:48:22.796888+00:00

Known values include failed attempts and cache exactly once. Cancelled/unexposed tails and billing remain UNKNOWN. Provider, UI, Goal, and supervisor totals are separate counters.

| Category | Attempts | Known native Goals | Unknown starts | Known tokens | Unknown usage rows |
|---|---:|---:|---:|---:|---:|
| candidate_attempt | 74 | 66 | 0 | 183,574,628 | 3 |
| route_canary | 2 | 2 | 0 | 57,240 | 0 |
| route_canary_or_metadata | 11 | 5 | 3 | 690,126 | 3 |
| route_probe | 2 | 0 | 0 | 0 | 0 |

I01 full four actual stages: 7,992,185 known tokens. Luna D14 first four native attempts: 19,152,242 known tokens.

Actual interrupted turn statuses are preserved; completion notifications do not establish completed turns or Goals. Occupied-time sums are not critical-path duration. Cleanup reserve is not observed cleanup. Failed effort is retained without asserting that all time was wasted.

Validation: 0 errors.


Original failed cold seed costs: 17,725,511 known tokens; actual seed-role continuations: 6,407,054 known tokens, each included once in candidate totals. Role imports only reference existing costs; prepared source exposure is not actual uptake.

D08A evaluator STARTED at 2026-10-06T00:44:53.834732Z. No FINISHED receipt or completed clock cost imported. Its 1200/1800-second bounds are authorized limits, not observed cost. Finished earlier evaluator clocks remain separate.

Root supplied counter at 2026-10-06T00:45:27Z: 9,255,770 tokens /15,377 seconds, active, remaining null; helper/cache/input/provider inclusiveness and billing unknown. Never add this cumulative counter to provider candidate or evaluator totals.

Queued/superseded requests are not native Goals. Zero native inference is credited only to positive prelaunch/zero-host proof receipts. Saved native Goal statuses are time-stamped observations, not current occupancy; absent direct Goal evidence remains UNKNOWN. Runtime resource/fit failure costs and unknown canceled tails remain retained.
