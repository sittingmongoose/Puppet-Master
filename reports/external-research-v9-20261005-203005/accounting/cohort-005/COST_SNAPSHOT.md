# ER9 mechanical cost snapshot

Snapshot: 2026-10-05T23:09:13.462647+00:00

Known values include failed attempts and cache exactly once. Cancelled/unexposed tails and billing remain UNKNOWN. Provider, UI, Goal, and supervisor totals are separate counters.

| Category | Attempts | Known native Goals | Unknown starts | Known tokens | Unknown usage rows |
|---|---:|---:|---:|---:|---:|
| candidate_attempt | 42 | 34 | 0 | 115,902,364 | 2 |
| route_canary | 2 | 2 | 0 | 57,240 | 0 |
| route_canary_or_metadata | 11 | 5 | 3 | 690,126 | 3 |
| route_probe | 2 | 0 | 0 | 0 | 0 |

I01 full four actual stages: 7,992,185 known tokens. Luna D14 first four native attempts: 19,152,242 known tokens.

Actual interrupted turn statuses are preserved; completion notifications do not establish completed turns or Goals. Occupied-time sums are not critical-path duration. Cleanup reserve is not observed cleanup. Failed effort is retained without asserting that all time was wasted.

Validation: 0 errors.


Cold seed inference costs: 17,725,511 known tokens across 2 actual attempts, already included once in candidate totals. Registered downstream dependency consumers started: 0. Eligibility/quality is not inferred from costs or partial files.

Direct saved GLM Goal-status evidence is joined by exact Goal identity and source selector/time/hash. Original router outcomes remain separate. Original quiescence flags remain unchanged by later permit-release supplements. Earlier001–004 `quiescent` represented native-cgroup quiet only;005 exposes all captured flags and retains false held-group results.
