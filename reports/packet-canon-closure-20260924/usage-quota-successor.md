# Usage quota-aware command successor

The current refresh/export bindings now select a versioned v2 profile that
preserves attempt rows and admits disjoint execution-free quota rows. Quota
rows resolve actual route/account/window sources; they cannot acquire fake
Attempt/Run/event identities or enter Ledger exports. Historical v1 contracts
remain unchanged. Additional Ledger filter grammar remains unadmitted.

Owner prose precedes companions. Two transient storage dispositions classify
transport and read projections, with no new physical family, source authority,
retention policy or native handler. Native source authentication, Permissions,
caller delivery and physical original custody remain separate prerequisites.

Independent review completed two cycles, including finite-value rejection and
removal of an unsupported transport-to-authority restriction. Review receipt:
`/mnt/Cursor/PM-Experiments/usage-quota-successor-20260925/INDEPENDENT-REVIEW.md`,
SHA-256 `ae8d621e7f79c5f0a74b204ee9ec06370b9daeef1d08f2ce0f58a90c4e820d8e`.
Remaining integration scope proof:
`/mnt/Cursor/PM-Experiments/usage-quota-successor-20260925/integration-scope-proof.json`,
SHA-256 `1088c1f340fe924478fe02542a3309ae45339fed917a3d87842d3c7ecefd07ff`.

Root verification: 40 Usage tests and 9 manifest tests PASS. Parsed JSON
comparison confirms exactly the two Usage wiring rows changed, all previous
storage dispositions and other registry values unchanged. Shard generation/check
PASS: 99 documents, 2,747 shards, only usage-feature, ui_command_catalog and
storage_value_registry roots changed. Index generation PASS: 6,733 PlanUnits,
26,435 acceptance units. Previously reported newer-main retention-validation
findings remain pending rebase; generation is not that validation or a reseal.

Full contract gate PASS: 49 pairs / 45 unique schemas, 1,314 positive cases,
4,423 negative cases all rejected, 12 internal self-tests, zero findings.
Complete capture:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/usage-quota-integrated-gate-001/stdout`,
SHA-256 `9df50724d43927d6cce1bc9d56b6703ac661e71f6c727d2287d357ec2e1b3e0c`.
No aggregate landing pass, native runtime certification, governance refresh or
main landing claimed.
