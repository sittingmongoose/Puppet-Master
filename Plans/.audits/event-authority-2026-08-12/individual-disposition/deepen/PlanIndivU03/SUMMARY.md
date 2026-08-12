# PlanIndivU03 deepening summary

- Input: `indiv_unreg_03.json`
- Rows independently deepened: 10
- Immutable cohort pins: all ten rows retain `["july248"]`.
- Working bucket: all ten remain `confirmed_persisted_unregistered`.
- Dispositions: 10 `NEEDS_OWNER_VETO`; 0 admissions or registry appends.
- Evidence: each row has exactly the 12 binding fields using only `PASS`, `FAIL`, or `OWNER_REQUIRED`; five browser rows have field-local producer and positive/negative-oracle PASS evidence, while five bundle rows fail closed with no PASS because their storage descriptions do not name producer/owner authority or paired oracles.
- Every residual is covered by a row-specific stable veto ID.
- All rows set `provisional=false`, `analogy_used=false`, `inference_used=false`, and `independent_of_od_ea_003=true`.
- Fresh-census residual merge remains pending and is not inferred here.
