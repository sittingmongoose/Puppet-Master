# Forge registry assertion reconciliation

The creation-composition test now recognizes the two approved same-family
custody upgrades from commit `0679ce672a6496e7dfefe29db639a152393b5be8`.
It still checks all 294 ordered family identities, all 27 retention policies,
every other family against its prior baseline, and the exact approved contents
and migration invariants of the two upgraded families. No product contract,
storage family, runtime admission or governance artifact changed.

The author and a different Sol reviewer each ran the seven-test module
successfully. Root inspected the patch, verified the reviewed file hash and
ran `git diff --check`. The broader Forge run still reported 11 failures in
453 tests; this report does not claim that suite passes.

Independent review:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/FORGE-REGISTRY-TEST-INDEPENDENT-REVIEW.md`,
SHA-256 `4073aadea5d895de067e8dbeb4e809c6925b3c185490c5ab47fec80b140fcb1d`.
Reviewed test SHA-256:
`cc9cc8e4d06035f04e01af545324a53a87cd0a5d5d9288a7dc6dac995060cb30`.

## Subsequent complete Forge regression run

The remaining eleven failures were reconciled without editing product files:
the provider-pack test now checks the declared closed-manifest cardinality,
uniqueness and exact Forge packs instead of a superseded global count; review
creation checks its selected request/result/observation and retained common
receipt, while merge remains unchanged. Four historical delta tests now apply
only the exact reviewed later non-Forge successors from immutable commit
`0f1785d161bc96c1e9035a299dd3b51930085d63`: 18 wiring entries, 24 existing
Touch rows and seven profiles. All unlisted values and all Forge values retain
their earlier expectations. No current working file supplies expected values.
Four new tests verify that boundary, identity preservation and copy isolation.

Different-Sol review accepted both patches. Root's two-module run passed 15
tests; the four binding modules passed 18 tests; the helper passed four tests.
After all changes, root ran
`python3 -m unittest discover -s tests -p 'test_pm_forge_*.py'`:
**453 tests PASS in 95.393 seconds**. This supersedes the earlier eleven-failure
result for this test scope only, not whole-repository or native verification.

Additional independent reviews, beneath the same external evidence directory:

| Artifact | SHA-256 |
| --- | --- |
| `FORGE-TWO-TESTS-INDEPENDENT-REVIEW.md` | `8b92da0c62a3c2b1b99d395813ed9717da47730dacf14fbc13f05b62c6906461` |
| `FORGE-REVIEWED-NONFORGE-EXPECTATIONS-INDEPENDENT-REVIEW.md` | `fe9b4c673ee15b1427cc5b2e2a8b6d3e37418f341bbb85325705c23d13a99e6d` |
