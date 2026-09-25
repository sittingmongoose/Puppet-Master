# Independent review of a ledger-to-Plan compile (blind)

You are an independent reviewer of a draft compile of a planning ledger into canon. Read ONLY the files your packet manifest lists (under ~/PM-Experiments/jev-pilot-20260917/wave3/trial/packets/<packet>/): the ledger records (design atoms, corrections, decisions, questions), the findings and authorization shards, and for each affected PlanUnit or Decision Log entry its text before the edit (base) and in the draft. Do not open anything else in the pilot directory or the repository, and do not search the web. You will not be told what any tool said about the draft; do not guess.

Review the complete scope: every affected unit, edited or not, and every ledger obligation. Record every finding in ONE JSON line each, appended to the output file named in the manifest:
{"finding_id": "R-01", "unit": "<PlanUnit or DL id>", "kind": "<lost_obligation | weakened_obligation | ledger_obligation_missing | unauthorized_change | wrong_reference | inconsistency | record_or_receipt | other>", "severity": "<blocking | should_fix | note>", "claim": "<one or two sentences: what is wrong>", "evidence": "<quote the source sentence and the draft passage, or say what is absent>", "suggested_repair": "<one sentence>"}
When you have reviewed everything, append a final line {"summary": true, "units_reviewed": [...], "verdict": "<land | fix_then_land | do_not_land>", "n_findings": <n>}.

Practical rules: name any helper file with your packet name; write findings incrementally; reply with "<n> findings, verdict <verdict>" only.
