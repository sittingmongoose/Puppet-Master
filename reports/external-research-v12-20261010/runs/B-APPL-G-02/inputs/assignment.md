# B-APPL-G-02: systemd laptop maintenance timer

Case ID: ER12-B-APPL-G-02-FRESH

Role: Applicability/exception verification

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Scenario and claims
A Linux laptop runs systemd 257. A oneshot cleanup service may take three minutes. The team proposes either an `OnCalendar=daily` timer or an `OnUnitInactiveSec=10min` timer; both set `Persistent=true`. AccuracySec and RandomizedDelaySec are initially unspecified. The machine may be powered off for two days. No service logs or hardware timing data are supplied.

1. `Persistent=true` causes the calendar timer to account for missed activity while the timer was inactive.
2. The same persistence flag gives the monotonic OnUnitInactiveSec timer identical powered-off catch-up semantics.
3. Each timer elapse starts another instance even when the target service remains active.
4. The default AccuracySec admits a one-minute scheduling window rather than promising exact execution at a wall-clock second.
5. OnUnitInactiveSec measures its interval from the target unit’s last deactivation.
6. A syntactically valid daily calendar expression proves completion of cleanup by 00:00:02 after every boot.

## Required output
Save `verification.md`, at most 900 words. Address all six numbered claims independently with disposition, applicable version/configuration, primary citation, corrected bounded wording where necessary, and consequential exceptions. Preserve uncertainty; state what missing evidence would resolve it. Finish with two concrete acceptance checks. Do not silently substitute a different deployment or turn this verification into an architecture redesign.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
