# D1 usage — both candidates terminal

Synthetic delivery development metadata only; no research-quality benchmark or semantic grade. Both scheduled assignments remain in the denominator.

| Candidate | Native outcome | Parent responses | Native seconds | Reported input | Cache read | Output | Reasoning | Host checks observed |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Muse | goal_complete | 18 | 258.2 | 537,021 | 496,769 | 13,044 | 9,827 | 15/15 true |
| zcode | goal_complete | 17 | 219.6 | 179,662 | 164,992 | 6,835 | 0 | 14/15 true; current_history_separation false |

Muse requested/observed `muse-spark-1.3-contributor` / Max; zcode requested/observed `GLM-5.3-Flash` / Max. Host elapsed: Muse 259.314 seconds; zcode 223.656 seconds. zcode structural_checks_passed remains false. The on-disk zcode result contains 15 named checks with 14 true; no rescoring or source edit occurred.

Total: 2 assignments, 35 parent responses, 477.8 native seconds. Muse host tracing observes 18 parent and 10 reminder-child terminal attempts; observed child models: {"muse-spark-1.3-contributor": 10}. Child token totals remain unknown. zcode exposes usage deltas for 16 of 17 requests; the missing delta is not zero.

Development tokens/cost remain unknown and separate from D1. Formal evaluator assignments/calls/tokens/cost: zero. Candidate monetary cost is unknown. Cached cumulative input is not unique input or subscription spend; input-minus-cache arithmetic is not full cost. A reported zero reasoning counter does not prove absence of reasoning. Native Goal completion does not convert a failed host check into delivery qualification.

`d1-usage.json` pins original VM receipt/result/log paths and hashes. Raw provider logs always remain VM-only. Its content_published=false means this inventory publishes pointers, while compact metadata may later be copied exactly by the parent. No historical campaign main, app/account probe, retry, repair, rescoring or semantic evaluation was run for this metering step.
