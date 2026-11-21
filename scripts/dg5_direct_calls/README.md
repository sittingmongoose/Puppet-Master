# Direct-call collector input (METHOD-RULING addendum 12 point 3)

`methods.json` is the census's per-method list, copied byte for byte from the edition `census-questions/followup-1/final-a16b/methods.json` (sha256 `4603e2c80a54cf357bc1c361585a8364d1a324d4bbf6fe83e7a1e004f45e663a`). It is pinned in `pm_goal_dg5_direct_calls.METHODS_SHA256`, and `load()` refuses any other bytes.

For each family it gives:
- `owner_methods`: the owner methods the family's own authored corpus calls directly. These are the ones the collector records.
- `excluded_construction`: constructors, factories and fixture-class methods. These are never wrapped.

The list is final for every family, and none is `PENDING`. To drop in a new edition:
1. Replace this file.
2. Set `METHODS_SHA256` to its sha256.
3. Say why in the commit.

`construction_by_rule` is kept as a guard: a listed name that the written C1-C3 rules exclude is not wrapped. On `final-a16b` it skips nothing.

Review bundle: `covered-later-fix/review/addendum-7/README.md`.
