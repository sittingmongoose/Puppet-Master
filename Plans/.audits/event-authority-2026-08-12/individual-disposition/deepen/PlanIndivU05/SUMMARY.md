# PlanIndivU05 Deep Disposition Summary

- Source: `individual-disposition/shards/indiv_unreg_05.json`
- Rows reviewed: 10
- Immutable cohort pins: all 10 remain `july248`
- Working bucket: all 10 remain `confirmed_persisted_unregistered`
- Disposition: 10 `NEEDS_OWNER_VETO`; 0 admissions or registry changes
- Quality: 10 non-provisional rows; every row has 12 field-local evidence decisions, concrete citations for every PASS, a row-specific stable owner-veto id, and `independent_of_od_ea_003=true`

## Row results

| Event | Established locally | Fail-closed residual |
|---|---|---|
| `concern.updated` | exact handler/emission; command identity is not event scope | owner/membership, persisted-event scope, and product contract |
| `config.migrated` | first-load migration emission | all persisted-event authority dimensions beyond producer |
| `config.validation.failed` | backend invalid-name emission | all persisted-event authority dimensions beyond producer |
| `crew.formed` | exact lineage/scope and payload inventory | explicit owner/producer and remaining product contract |
| `crew.member_added` | exact lineage/scope and payload inventory | membership transition/replay and remaining product contract |
| `crew.member_removed` | exact lineage/scope and payload inventory | removal transition/replay and remaining product contract |
| `crew.coordination` | exact lineage/scope and named fields | close open-ended `details` and remaining product contract |
| `crew.completed` | exact lineage/scope and named terminal fields | terminal transition/replay and remaining product contract |
| `crew.disbanded` | exact lineage/scope and named reason field | disband transition/replay and remaining product contract |
| `dashboard.widget_added` | exact handler/emission; command identity is not event scope | owner/membership, persisted-event scope, and product contract |

Owner vetoes are agent-local inputs only; they do not finalize the combined owner sheet while the admission-filtered census is still running.
