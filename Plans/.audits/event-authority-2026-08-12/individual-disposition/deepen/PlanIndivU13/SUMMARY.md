# PlanIndivU13 Deepening Summary

- Input: `individual-disposition/shards/indiv_unreg_13.json`
- Binding controls: `INDIVIDUAL_DISPOSITION_SCHEMA.md` and `ADMISSION_FREEZE.md`
- Rows deepened: 10
- Dispositions: 10 `NEEDS_OWNER_VETO`; 0 `ADMIT`
- Immutable cohort pin: `july248` on every row
- Working bucket: `confirmed_persisted_unregistered` on every row
- Fresh census: separate from IndividualDisposition; these rows are EA-27 coverage inputs only and no census residual is merged here
- Evidence policy: all 12 fields are present; every retained `PASS` has a concrete field-local `Plans/...` citation; missing authority is `OWNER_REQUIRED`; no owner, producer, scope, or payload fact was inferred
- Freeze result: no registry append, admission decision, package owner ask, or consumer-checkpoint advancement is authorized

## Disposition counts

| Disposition | Count |
|---|---:|
| `NEEDS_OWNER_VETO` | 10 |

## Evidence closure retained

- `parser.error`: producer condition and immediate failure/fallback transitions are explicitly cited.
- `phase.force_completed`: producer trigger and force-completion transitions are explicitly cited.
- The remaining event/field pairs fail closed as `OWNER_REQUIRED`; command expected-event declarations are classification support, not semantic authority or closed EventRecord contracts.
