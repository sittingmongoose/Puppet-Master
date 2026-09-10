# Shard 005: FABLE Residual Plan-To-Node Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L144-L204

Source SHA256: `196e062d4fb5dd38b28bbed93d6370e3c9205a29169533116b28d46d2c3cc8e2`

---

## FABLE Residual Plan-To-Node Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High Plan-to-Node contract rows for schema authority and disabled-runtime readiness projections. It does not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.

### PNC-023 - FABLE Residual NodeSeed Schema And Readiness Boundary

```yaml
plan_unit_id: PNC-023
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  The authoritative NodeSeed candidate schema is Plans/plans_to_code_handoff.schema.json#/$defs/node_seed_candidate.
  Prose field lists in Plan_To_Node_Compilation are explanatory summaries only and must not drift into a second schema.
  While the WorkNode compiler remains disabled, generated readiness projections may report blocked_runtime_certification_incomplete
  for runtime certification and hard_disabled for runtime gate state; neither status authorizes WorkNode creation or execution.
gui_related: false
gui_classification_reason: Plan-to-Node schema and readiness projection rules are compiler governance contracts, not visual surfaces.
depends_on: [PNC-004, PNC-010, PNC-012, PNC-014, PNC-016, PNC-019, PNC-021]
unblocks: []
acceptance_criteria:
  - NodeSeed candidate contract references resolve to Plans/plans_to_code_handoff.schema.json#/$defs/node_seed_candidate as the single schema authority.
  - PNC prose field lists are explicitly non-authoritative summaries and must include a schema pointer when they name NodeSeed fields.
  - compile_wave_retry_route uses the schema enum values and records route_kind, reason_code, failed_plan_unit_ids[], retry_after_ms?, and owner_doc_refs[].
  - node_readiness_report may retain node_readiness_status = blocked_runtime_certification_incomplete while plan-to-node runtime gates remain hard_disabled.
  - No PlanUnit index, readiness report, or migration proof output may be interpreted as WorkNode, NodeSeed, executable queue, final node manifest, runtime launch, implementation file, or production build task creation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
risk_class: fable_residual_plan_to_node_schema_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
  - Plans/.plan_index/node_readiness_report.json
node_compile_hint:
  mode: residual_node_seed_schema_readiness_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1171
  - fablereport.md:1172
  - fablereport.md:1173
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "NodeSeed"
  - "node_seed_candidate"
  - "compile_wave_retry_route"
  - "blocked_runtime_certification_incomplete"
  - "hard_disabled"
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks.
  - Do not treat schema presence, index generation, or migration hashes as runtime certification.
  - Do not introduce a second NodeSeed schema in prose.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/plans_to_code_handoff.schema.json
```
