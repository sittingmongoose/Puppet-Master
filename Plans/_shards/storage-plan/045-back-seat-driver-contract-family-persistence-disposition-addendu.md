# Shard 045: Back Seat Driver Contract-Family Persistence Disposition Addendum - 2026-09-23

Source: `Plans/storage-plan.md`

Source lines: L18844-L18922

Source SHA256: `135cc9135c4202570396eb55f627b14d495b545f3634d5eecf54140f35047506`

---

## Back Seat Driver Contract-Family Persistence Disposition Addendum - 2026-09-23

This addendum owns the physical-persistence disposition for the six `pm.bsd.*` record families declared by the
Back Seat Driver redesign wave (2026-09-03) and machine-bound by `Plans/back_seat_driver_contracts.schema.json`.
The semantic record shapes remain with `Plans/Back_Seat_Driver.md` section 16 and its typed companion; this
addendum proves a machine-readable durable/pending decision only. `physical_family_registration_pending` is a
blocker, not materialized storage. The independent review CCR-01 (2026-09-23) established the requirement: the
materialized `pm.shared_runtime.bsd_runtime_record.v1` is only a completed-review summary and cannot represent
held findings, reconfirmation, quarantine, or restart-restoration state.

No row in this addendum registers an EventRecord family. The Event Authority denominator remains `UNKNOWN_OPEN`
and the physical family census is unchanged: this disposition adds no `families` row, no storage key, no writer,
and no readiness admission. Lifecycle state remains a contract-validation shape until physical registration is
admitted under the SP-251 layer.

### SP-318 - Back Seat Driver Lifecycle Contract-Family Disposition

```yaml
plan_unit_id: SP-318
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The `Plans/storage_value_registry.json#/contract_family_dispositions` row
  `scd.back_seat_driver.durable.v1` classifies the six record families declared by
  `Plans/Back_Seat_Driver.md` section 16 and machine-bound by
  `Plans/back_seat_driver_contracts.schema.json` — `pm.bsd.policy.v1`,
  `pm.bsd.workflow_binding.v1`, `pm.bsd.assignment.v1`, `pm.bsd.review_cycle.v1`,
  `pm.bsd.finding.v1`, and `pm.bsd.quarantine.v1` — as `durable` with
  `physical_family_status` = `physical_family_registration_pending`. The legacy
  completed-review summary `pm.shared_runtime.bsd_runtime_record.v1` is referenced
  only as the existing adjacent family (`existing_family_refs`) and never as a
  lifecycle container: held findings, reconfirmation, quarantine, and restart
  restoration belong to the six typed record families. A durable disposition whose
  physical state is pending cannot be written, restored, advertised as materialized,
  or used to enable a dependent command. No storage key, writer, adapter, or
  EventRecord family is admitted, and the CS-078 `cmd.bsd.*` command rows keep
  `handler_unavailable`.
gui_related: false
gui_classification_reason: This PlanUnit governs storage and contract custody rather than presentation.
depends_on: [SP-251]
unblocks: []
acceptance_criteria:
  - The disposition ID `scd.back_seat_driver.durable.v1` is unique and schema-valid, and the row fixes `runtime_evidence=false`.
  - The row binds all six `pm.bsd.*.v1` record kinds to `Plans/back_seat_driver_contracts.schema.json` and references `bsd_runtime_record` only as an existing family.
  - The durable-pending row cannot be written, restored, advertised as materialized, or used to enable a dependent command; no EventRecord family, storage key, or writer is admitted.
  - The registry physical `families` array membership is unchanged by this disposition (294 rows after the 2026-09-23 Event Authority source-current landing) and the readiness-enforced census is unchanged by it.
  - Lifecycle state (held findings, reconfirmation, quarantine, restart restoration) is never folded into `pm.shared_runtime.bsd_runtime_record.v1`.
  - CS-078 command rows keep `handler_unavailable` and the typed companion contains no command request/result definitions.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-implementation-readiness.py validate-case-l
  - Draft 2020-12 validation of Plans/storage_value_registry.json against Plans/storage_value_registry.schema.json
risk_class: durable_contract_claim_without_physical_family_or_nonpersisted_boundary
reasoning_tier: high
context_scope: bsd_contract_family_persistence_disposition
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/back_seat_driver_contracts.schema.json
node_compile_hint:
  mode: governance_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [source_ref:independent-review:2026-09-23:CCR-01, source_ref:packet:PM-ASSISTANT-CONTRACT-CLOSURE-2026-09-22-v1]
preserved_exact_tokens:
- "scd.back_seat_driver.durable.v1"
- "physical_family_registration_pending"
- "pm.bsd.finding.v1"
negative_constraints:
  - Do not treat the disposition row or the schema file as a storage writer, physical family, migration, replay, restore, backup, or recovery implementation.
  - Do not add a physical family or storage key; do not change the readiness-enforced `families` denominator.
  - Do not extend `pm.shared_runtime.bsd_runtime_record.v1` with lifecycle fields.
  - Do not register an EventRecord family from this storage lane; the Event Authority denominator remains `UNKNOWN_OPEN`.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Back_Seat_Driver.md
  - Plans/storage_value_registry.json
```
