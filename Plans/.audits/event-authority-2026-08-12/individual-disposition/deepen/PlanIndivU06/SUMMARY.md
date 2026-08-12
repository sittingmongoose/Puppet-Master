# PlanIndivU06 individual dispositions

- Source shard: `individual-disposition/shards/indiv_unreg_06.json`
- Rows deepened: 10
- Immutable cohort pin: `july248` on every row
- Working bucket: `confirmed_persisted_unregistered`
- Result: 10 `NEEDS_OWNER_VETO`; 0 admissions; all are non-provisional.
- Evidence: all 12 dimensions are present per row. `doctor.custom_headless.checked` has exact Doctor-producer and positive/negative-oracle citations. Command-catalog expected-event mappings remain contextual citations and do not earn producer PASS because they do not explicitly name producer authority. All other unclosed dimensions fail closed as `OWNER_REQUIRED`.
- Independence: every row sets `independent_of_od_ea_003=true`, `analogy_used=false`, and `inference_used=false`.
- Freeze: no registry, owner-sheet finalization, package disposition, or `scripts/**` change was performed.
