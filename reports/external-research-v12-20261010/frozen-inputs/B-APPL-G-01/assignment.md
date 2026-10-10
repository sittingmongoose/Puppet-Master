# B-APPL-G-01: Redis session timeout applicability

Case ID: ER12-B-APPL-G-01-FRESH

Role: Applicability/exception verification

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Scenario and claims
A session service targets Redis Open Source 7.2, one primary with replicas, and stores `sess:42` either as a string or a hash. A successful operation and the command options stated below are the only facts known; no durability configuration, client retry trace, or host benchmark is supplied. Verify this coherent set of proposed documentation claims without assuming the authors are correct:

1. Updating a field with HSET on an existing session hash preserves its existing expiry.
2. Every successful SET replacement preserves a session TTL, even with no expiration option.
3. SET with KEEPTTL lets the string value change while retaining an existing timeout on this deployment.
4. EXPIRE with GT can attach a finite timeout to a persistent session key because any positive duration is greater than no duration.
5. EXPIRE with a zero timeout emits the same key event as ordinary timeout expiry.
6. These sources prove a p99 expired-session cleanup latency below 25 ms for this service under replica failover.

## Required output
Save `verification.md`, at most 900 words. Address all six numbered claims independently: disposition, applicable version/configuration, primary citation, corrected bounded wording where necessary, and consequential exceptions. Explicitly preserve unresolved uncertainty and say what evidence would resolve it. Finish with two concrete acceptance checks for the service. Neither the fixture nor its sources contain assessor verdicts; conduct your own verification. Do not design a new session architecture or infer operational timing from a command reference.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
