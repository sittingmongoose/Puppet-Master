# Settings typed import companion — root integration

Status: focused checks and full contract subcheck PASS. No native Settings
issuer, import/apply, credential custody, GUI or whole-Settings closure claim.

V11 fixes the independent review's duplicate-setting-ID overwrite: a foreign
first binding cannot disappear behind a later valid binding. Independent source
and destination owner-read inputs remain static test inputs, not authenticated
native owner services.

Root verified all 887 inventory rows retain their IDs/order. Changed row fields
are only `management_kind` (819 rows) and `portable_value_forms` (eight rows).
Classification totals: 789 ordinary, ten credential, eight value-dependent,
seven local-environment, four owner-destination, one run-scoped, and 68 action
rows without management classification. Absence is not inferred as ordinary.
The four DRY/formatter destination IDs retain their owner boundary.

Seven non-gate files initially matched frozen V11 bytes exactly; the gate uses
the reviewed five-hunk additive merge, SHA-256
`70a7eabc554026f43ba4b8af20d9515d441099a8044fef598ab18674037be5c2`.
Root AST comparison proves all 87 prior contract pairs remain in exact order,
including Browser and Search; Search's 78-test enrollment remains present.

Installed testing found a detached-harness defect: `tests/gate_loader.py`
injected no-failure stubs for other helpers, causing Search/Browser import
failures and invalidating any claim of full installed verification. Root removed
all stub injection; the loader now imports genuine repository helpers. Root
also replaced an optional absent external-baseline branch with unconditional
Browser/Search pair assertions and corrected detached-only comments. The actual
full pair-preservation comparison was performed separately against HEAD.
Final combined focused run: **124 tests PASS** (29 Settings, 78 Search,
17 Browser), with genuine helpers. Test loader SHA-256
`488eb739b30c464887b01b6efe3932d011fbcf6e28a6af784f6ea9923b26df98`;
Settings test SHA-256
`94e796ff8177a13285d302677278226afea217ce4e21e34be944c6b995cf81f3`.

Evidence root:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/`.

- `jobs/settings-import-typed-owner-value-01/REVIEW-DIFFERENT-SOL-V11.md`: SHA-256 `3871edb94ee1f207f31a77e39e6dbf215a51c31565c47a12892e9b4661ba7eb9`.
- `case-reconciliation/settings-v11-current-root-carry-01/CARRY-REVIEW.md`: SHA-256 `3977ec663a107a8af5c727c39fb0d390f01227acba2d9a4035070ce46a79b01d`; pins all seven original non-gate hashes.
- `case-reconciliation/settings-v11-current-root-carry-01/REVIEW-DIFFERENT-SOL-CARRY.md`: SHA-256 `855fb7ace37bbd694815e6daeec4ba60cd5df262d69d816b2ba6d9b12e0b3ea7`.
- `case-reconciliation/settings-v11-current-root-carry-01/REVIEW-INSTALLED-LOADER.md`: SHA-256 `aa3f6cb69443f59ee4338586e20380056d22e6b529ada77984e4c0daba21067f`.
- `case-reconciliation/settings-v11-current-root-carry-01/REVIEW-INSTALLED-TEST-DELTA.md`: SHA-256 `7b2edc6e635fbabbd0ffe65d94cd09a932c0e7f760373ded894b2ea7e83a0590`; independently accepts the final installed test-only cleanup.

Root full subcheck: `python3 scripts/pm-plans-verify.py validate-new-contracts
--subcheck-timeout-seconds 900 --report <external-report>` PASS: 87 pairs,
1,692 positive cases, 5,017 rejected negative cases, 12 self-tests, 78 Search
causal tests and 15 Search pairwise checks; empty failures and findings.
Full report `case-reconciliation/settings-v11-current-root-carry-01/ROOT-87-SETTINGS-CONTRACTS.json`,
SHA-256 `89fea5b5119046c61d052438da13769aba27f60348f11607bfaff3fbd48b36c8`.

No TCR hash, governance binding, baseline or seal is refreshed. Full repository
aggregate and landing comparison remain separate obligations.

The first commit attempt correctly refused stale derived inventory shards.
Root regenerated them: 99 sources, 2,770 shards, generation PASS. Changed shard
trees are limited to the two edited JSON sources, `settings_inventory` and
`settings_inventory.schema`; no unrelated owner shards changed. They are included
with this repair, without bypassing the commit check.
