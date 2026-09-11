# Step 08 — restore-point summary reader registry correction

The existing restore-point retention-summary registry now names the three current v2 routes already adopted by SP-281, Chat and Runtime Artifacts. SP-269 explicitly states that they read the unchanged v1 summary through SP-278. The prior v1 routes remain available under their existing compatibility/owner restrictions. Branch-from-restore remains excluded from terminal-summary consumption, and this correction admits no sibling event reader or future summary format.

Validation confirms that only the summary row’s consumers changed in the 95-family registry. Its schema, key, writer, all existing values, all 24 retention policies and every other registry field are preserved. Only SP-269’s canonical text changes among existing PlanUnits; all acceptance criteria are preserved. This corrects a registry omission in the prior reader-adoption landing. It adds no event-family closure or native execution result.

Scope assertions are recorded in `step-08-summary-reader-routes-checks.json`. Shard verification passes at 98 documents and 2,245 shards. The regenerated index preserves 6,537 PlanUnits and 25,106 criteria; all non-Storage unit rows remain identical, and only SP-269 changes semantically. The current depth-report supplement now points to the already completed two-family adoption. Actual source authentication, native transactions, recovery and retention remain NOT_RUN; no governance seal or frozen audit result is changed.

Cost: root review and metadata integration; no new agent or native runs. Exact billed cost is unavailable in the task tools.
