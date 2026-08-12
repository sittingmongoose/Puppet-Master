# FixAugustIndivRows — August IndividualDisposition repair

## Binding / LEDGER write rule

Writes only under `deepen/FixAugustIndivRows/` plus overwrite of matching `individual-disposition/rows/ROW_*.json`.
No rewrite of canonical `individual-disposition/LEDGER.jsonl` / `OWNER_VETOES.jsonl` / `COVERAGE.json` / `shards/**`.

## Result

| Event | Disposition | `consumers_checkpoints` | `owner_veto` | `cohort_pins` | provisional |
|---|---|---|---|---|---|
| `terminal.workgroup_moved` | `KEEP_REGISTERED` | `OWNER_REQUIRED` | `null` | `["august2"]` | `true` |
| `workspace.layout_changed` | `KEEP_REGISTERED` | `OWNER_REQUIRED` | `null` | `["august2"]` | `true` |

CiteAuthorityLibs field-local citation matrix applied (Advisor-2 blocker).

## Producer (Wiring_Matrix, not semantics-only)

- terminal: `Plans/Wiring_Matrix.production.json:44230-44254` (`handlers::terminal::move_workgroup`)
- workspace: `Plans/Wiring_Matrix.production.json:37154-37175; Plans/Wiring_Matrix.production.json:44230-44254` (bounded reset + move-workgroup; not exhaustive)

## Combined citation strings (not notes-only)

- replay: `Plans/Contracts_V0.md:1016-1019,1027-1030; Plans/storage-plan.md:473-478`
- retention: registry + `Plans/storage_value_registry.json:68-81`
- redaction_custody: registry + `Plans/storage-plan.md:480`
- compatibility_withdrawal: registry + `Plans/Contracts_V0.md:1029-1031`
- consumers_checkpoints: `Plans/storage-plan.md:1519-1524; Plans/event_family_registry.schema.json:305-370` (OWNER_REQUIRED)

## Non-effects

- No ADMIT / invented consumer IDs / OV follow-up label
- No root LEDGER/shards/OWNER_VETOES/COVERAGE writes
- No scripts/** / out/** / residual seeding
