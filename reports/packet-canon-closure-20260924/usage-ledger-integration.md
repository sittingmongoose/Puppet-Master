# Usage Ledger — approved query and central response integration

The approved Ledger filter/search/sort and selected-versus-all-matches export
contract now has typed request/result, fixture and semantic bindings, the actual
central Usage response path, and machine-readable Wiring profile branches.
Historical core v1 and quota-aware v2 behavior stays separate. Only the exact
Ledger profile selects Ledger refs; only the exact quota profile selects v2 refs.
Unknown or core-v1 profiles are not silently recast as quota-v2.

No new command, native handler, event, physical store or custody admission is
claimed. One transient transport disposition increases the logical registry
from 157 to 158. Root comparison confirms all prior rows and every other registry
section remain unchanged, including all 294 physical families.

## Evidence and integration checks

Evidence root:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/usage-ledger-selector-correction-05/`.

- Frozen author patch `changes.patch`: SHA-256
  `f2895e6c7bdf32c131a01db26fdc76dd31ad030426c711da0cf917f021585161`.
- Independent `REVIEW.md`: SHA-256
  `d7453e672750416473d67f9631654a9b1f4e6e53c2469312a84fa3b1e8706a11`.
- Applied `integration/usage-root-88f377886.patch`: SHA-256
  `ce1a671ba9392b91051459770762dea2b49945ddf749e980b135e505ca01b89e`.
- Integration review `integration/README.md`: SHA-256
  `d9286be95e97f86e6202d9c3ebeaeaec4904708b26f958883b37ce53ef2985b0`.

All 14 initial applied files matched the independently tested combined overlay. Shared
scripts preserve SCM and stash branches. The additional historical gate test
retains exact cardinality and uniqueness assertions at 77 pairs / 73 schemas.
The detached-only file-inventory and missing-schema test assumptions now have
explicit full-tree controls; the missing-ref negative uses an isolated missing
schema rather than assuming the integrated root lacks its own new schema.

Root execution exposed one additional test-harness fault: copying the complete
checkout with symlink dereferencing traversed external audit films and filled
`/tmp`. Both failed root-owned temporary copies were removed; original evidence
was untouched. The independently reviewed correction changes only
`tests/test_pm_usage_central_response.py`: overlays copy direct contract JSON
and Python inputs as ordinary independent files, reject symlink inputs, never
traverse nested evidence, and clean up on setup failure. The rerun uses a unique
task-local temporary directory. No contract assertion is removed.

Independent combined review: 222 Usage/historical/SCM/stash tests and nine
provider-gate tests pass; the full 77-pair static contract gate passes. After the
harness repair, root focused regressions pass all 145 tests; the independent
central-only rerun passes 50 tests with its temporary directory empty afterward.
Root Wiring and shard checks pass (99 sources,
2,763 shards); index generation passes (6,744 units, 26,541 acceptance criteria),
with no unit ID delta and changed existing records only for the two edited
Markdown owners. `git diff --check` passes.

Muse used its original Contributor 1.3/max native Goal. The productive turn
completed, but Goal status remained active; this is not a Goal-completion claim.
This record proves bounded static integration, not a native app, governance
seal, current-main full-failure-key comparison or main landing.
