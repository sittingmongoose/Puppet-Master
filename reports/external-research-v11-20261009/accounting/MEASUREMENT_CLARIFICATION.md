# ER11 reporting clarification

The finite publication audit found an ambiguous legacy pair field. `strict_time_eligible` in early v2 snapshots required both source passes as well as all timing ceilings; pending or failed source grades yielded false even when measured timing passed. It was not a timing-only result. Original published values and all candidate/evaluator grades are unchanged.

Current v2 arithmetic adds `paired_time_eligible`, independent of source grades, and nullable `source_and_time_eligible`. The legacy field remains explicitly labeled for historical replay. C-01/C-02 both meet their measured stage/whole/occupied ceilings; their source grades determine scientific comparability separately. UNKNOWN is not converted to a timing failure in the new fields.

Mutable queue statuses now report completed attempted execution and retain their previous scheduling values. `QUEUE_ORIGINAL.json` is untouched. Final tables link each terminal assessment even where an original arm grade is null. A-M12-B/treatment has no authored scientific artifact: its six axes are ungradable, rather than an available-stage quality review. All eight unseen-final qualities remain null.

[Previous immutable accounting snapshot](https://github.com/sittingmongoose/Puppet-Master/blob/34704eccafc094e5635ada4a7ce458977ee83390/reports/external-research-v11-20261009/accounting/v2/TIMING.json) preserves the predecessor. The audit's own results and root dispositions are under helpers/publication-audit. No clock, original failure, authored output or scientific grade was repaired.
