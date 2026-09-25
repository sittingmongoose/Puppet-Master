# Clean post-Usage aggregate and stash reference correction

The standard aggregate completed against clean branch commit `7099de999`.
Report: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/root-run-gates-7099de999.json`,
SHA-256 `3c152d583e03e4f777904b650d929d3bb8aef355fbe2c1d9cdf7dd28002d2b3f`.

25/36 checks passed, including the full contract gate, central response,
Wiring, Usage drift, PM7 GUI fixtures and shards. Failure totals: JSON syntax 16,
Spec Lock 19, graph 1,599, evidence 1,599, path refs 2, PRD/runtime 1,240,
readiness 69, migration 88, Touch 1, audit closure 201 and audit status index 1.
Relative to clean `3a12bb415`, path refs added two, Spec Lock rose 17 to 19,
and readiness rose 68 to 69; other failing totals remained equal. Equal totals
are not proof of equal failure keys, and no rise is waived by this report.

The two path-reference failures were real branch regressions in SCS-024:
descriptive `implementation_surfaces` prose was not a typed path. The correction
replaces only those metadata entries with six exact existing paths and two
recognized `future ` markers for the unbuilt Slint consumer/handler. It changes
no stash behavior. Independent patch:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/stash-companion-correction-01/integration-f178/lint-repair/changes.patch`,
SHA-256 `246b39bbf67197c0dda4e08ec0e0dee92371de8a136b515ff686962f66b5faab`.

After applying it, root shard generation/check and index generation pass;
`pm-plans-verify.py lint-path-refs` passes with zero findings. This focused repair
result does not retroactively turn the earlier aggregate into a passing run.
The saved aggregate still contains sampled leaf failures. A fresh-main complete
failure-key comparison remains required before landing; no governance binding,
baseline, seal or expanded exception was used.
