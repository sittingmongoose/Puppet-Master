# Captured participant accounting

Captured participant usage on the preserved September 8 basis: **$92.2506 Astra API-equivalent**, or **2,306.265 Codex credits** as an alternative; separately **$0.644651128 DeepSeek Go allowance value**. Actual cash and search/root/evaluation/support costs are unknown. These values must not be added into a bill.

The unchanged collector ran after the controller exited and all eleven admitted jobs were terminal. All eight Astra jobs and three DeepSeek jobs have captured, available valuations; no admitted job failed, timed out or remained active. Captured failed/partial response usage stays included where recorded. Unobserved charges remain unknown.

## Historical basis and arithmetic

The [preserved September 8 basis](evidence/pricing-basis-2026-09-08.md) is not current tariff verification. Astra uses the configured standard/default tier, complete contiguous observed token usage, request input at or below 272,000 and zero cache writes. Per million tokens, uncached input/cached input/output are valued at $10/$1/$50 or 250/25/1,250 credits. Cached input is subtracted from inclusive input once; reasoning is already included in output.

DeepSeek records input, cache reads, cache writes and output as disjoint categories. All 250 captured response intervals fall within the preserved weekday 06:00–10:00 UTC peak window; per-million input/output/cache-read allowance rates are $0.44/$1.32/$0.014. No ambiguous tariff interval or auxiliary usage record occurred in this capture. The runtime catalog estimate is $0.322325564 for the same usage; it is retained separately and is not an additional charge or proof of actual cash.

## Per-job values

| Job | Phase | Invocation seconds | Astra API-equivalent USD | Alternative credits | DeepSeek allowance value USD |
| --- | --- | ---: | ---: | ---: | ---: |
| J0001-discovery | discovery | 1392.941 | — | — | 0.377493904 |
| J0002-implementation | implementation | 537.284 | — | — | 0.108745432 |
| J0003-history | history | 686.241 | — | — | 0.158411792 |
| J0004-reconcile | reconcile | 1230.324 | 7.852968 | 196.3242 | — |
| J0005-reconcile | reconcile | 2246.114 | 18.287064 | 457.1766 | — |
| J0006-reconcile | reconcile | 2064.592 | 14.795508 | 369.8877 | — |
| J0007-reconcile | reconcile | 1754.181 | 12.314092 | 307.8523 | — |
| J0008-compare | compare | 1373.275 | 6.557292 | 163.9323 | — |
| J0009-compare | compare | 1764.069 | 12.188168 | 304.7042 | — |
| J0010-compare | compare | 1684.519 | 11.932156 | 298.3039 | — |
| J0011-compare | compare | 1581.646 | 8.323352 | 208.0838 | — |

## Time accounting

| Measure | Seconds | Meaning |
| --- | ---: | --- |
| Summed job durations | 16315.186 | Includes overlapping implementation/history jobs and adapter overhead |
| Union of native invocation windows | 15777.902410 | Counts overlap once and excludes inter-job gaps |
| First native start to last native finish | 16725.718253 | Includes 947.815843 seconds between invocation windows |
| Controller launch to exit | 18107.240114 | Includes final readiness/fingerprint processing |
| Last native finish to controller exit | 1377.274660 | Post-job controller interval; not measured model inference |

All eleven invocation timestamps/durations are covered. Native execution spans 07:15:34.815596–11:54:20.533849 UTC; the controller exits at 12:17:17.808509 UTC. Observed shared-filesystem waiting explains part of controller/gap time, but no complete causal decomposition or root/support duration is inferred. These measures are not interchangeable and are not model inference time.

## Collector and custody limits

The unchanged legacy collector labels this stable run protocol v1 / transport_prototype_warmup and leaves stable delivery fields null. Those labels are preserved in the JSON caveat; they do not determine completion. Its Codex native_goal_completed lookup also uses the wrong field. [Independent completion evidence](evidence/campaign-completion.json) verifies the actual native Goals, turns and current 24-ID cohort.

[Accounting JSON](accounting.json) contains per-job tokens, request-bound prerequisites, all 250 sanitized DeepSeek response valuations, interval evidence and original artifact/row hashes. Raw native sessions, provider configuration, original machine paths and unedited collector outputs remain external. Only whitelisted numeric/identity fields are exported; no raw message or command bodies are included.
