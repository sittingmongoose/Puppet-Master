# ER9 mechanical cost snapshot

Snapshot: 2026-10-06T08:44:54.730916+00:00

Known values include failed attempts and cache exactly once. Cancelled/unexposed tails and billing remain UNKNOWN. Provider, UI, Goal, and supervisor totals are separate counters.

| Category | Attempts | Known native Goals | Unknown starts | Known tokens | Unknown usage rows |
|---|---:|---:|---:|---:|---:|
| candidate_attempt | 253 | 235 | 0 | 640,014,652 | 31 |
| route_canary | 2 | 2 | 0 | 57,240 | 0 |
| route_canary_or_metadata | 11 | 5 | 3 | 690,126 | 3 |
| route_probe | 2 | 0 | 0 | 0 | 0 |

I01 full four actual stages: 7,992,185 known tokens. Luna D14 first four native attempts: 19,152,242 known tokens.

Actual interrupted turn statuses are preserved; completion notifications do not establish completed turns or Goals. Occupied-time sums are not critical-path duration. Cleanup reserve is not observed cleanup. Failed effort is retained without asserting that all time was wasted.

Validation: 0 errors.


Capture interval: {'end': '2026-10-06T08:44:54.385525+00:00', 'start': '2026-10-06T08:44:53.739814+00:00'}

The03:26 counts-only checkpoint is separate. Current captured source stability is listed per source; this is a bounded sequential capture, not an atomic global transaction. Prior012 changed-source flag is preserved separately. Historical011 attempts/costs remain; ten confirmed historical zero controlled-stage activations joined by pinned conjunction. Saved native statuses are not live occupancy or pipeline credit. TD2/TD3/TD7/TD8/TD10 and draft neutral clocks are nested references, not added costs. Root supplied22,351,369 tokens/31,124 seconds at05:07:54Z is separately recorded; helper inclusion UNKNOWN.

017 exactcapture08:44:53.739814–08:44:54.385525Z:253attempts/235confirmedstarts/640,014,652known tokens+31usageUNKNOWN. Every confirmedstart has positive native activation receipt or actualactivation journal event, not attempt counter alone. Prior016221starts239attempts/date unchanged. Capturedroot journal08:32:56 31,081,640tokens/43,226seconds is separate; root-supplied08:43 31,944,862/43,863 is unjournaled reference, never added. Exact C03/DEC016 terminal/release/quiet proofs are operational metadata only, not passcredit; unknown/cancelled tails/billing/helpers remain UNKNOWN. Warm4 inclusiveP2796.266980257 exceeds600by196.266980257; report382.475863119subset does not provewithin-cap requiredhandoff, UNKNOWN. All reviewerwhole/check/source clocks overlap and are not summed.
