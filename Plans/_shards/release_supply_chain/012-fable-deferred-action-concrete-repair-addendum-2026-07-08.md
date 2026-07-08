# Shard 012: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Release_Supply_Chain.md`

Source lines: L650-L659

Source SHA256: `b59fb5bef77954bcd7b2734a9c28896b992798094dda0218d26bb31559b76216`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime release/supply-chain rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-1c95c03aec7949b6ad8641a7`: project schemas must use JSON Schema Draft 2020-12 unless a migration fixture explicitly records a legacy dialect. `requirements_quality_report.schema.json` is required to migrate to 2020-12 during the next schema refresh.
- Repairs `sfk-aebb6fb13c915a60c1a5be40`: `plan_graph.change_budget` must reference the canonical `change_budget` shape rather than a bare object. Required fields are `max_files_changed`, `max_plan_units_changed`, `max_generated_artifacts_changed`, and `requires_governance_seal`.
- Repairs `sfk-c347a44e26b08efce550bdfd`: non-executable closure evidence required object fields must be typed with nested properties. Bare required objects are allowed only when explicitly marked `additionalProperties: true` with an owner rationale.
- Repairs `sfk-d62d739e27a728d8ad210435`: `auto_decisions.jsonl` lookup identity is the composite key `{decision_id, created_at_utc, source_ref}` until duplicate historical ids are migrated. New rows must use unique `decision_id`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
