# PlanIndivU21 Deepening Summary

- Input: `individual-disposition/shards/indiv_unreg_21.json`
- Rows deepened: 10
- Disposition: 10 `NEEDS_OWNER_VETO`; 0 admissions
- Immutable cohort pins: all 10 rows retain `july248`
- Working bucket: all 10 remain `confirmed_persisted_unregistered`
- Schema normalization: `owner` renamed to `owner_doc`; all 12 evidence dimensions use only `PASS`, `FAIL`, or `OWNER_REQUIRED`; every `PASS` has a field-local `Plans/...` citation
- Independence: every row keeps `analogy_used=false`, `inference_used=false`, and `independent_of_od_ea_003=true`
- Status: non-provisional individual dispositions, fail-closed pending the row-specific owner vetoes in `OWNER_VETOES.jsonl`
