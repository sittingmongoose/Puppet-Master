# Shard 015: PlanUnits

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L377-L427

Source SHA256: `ad4e0b77b672faf847917425be40a12d452f41d9d489bba0879c7e512ac828a5`

---

## PlanUnits

### BS-001 - BinaryLocator Spec (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: BS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after
  Phase 2B atomized BinaryLocator_Spec-S0001 through BinaryLocator_Spec-S0043
  into BS-002 through BS-024. BS-001 remains only as migration lineage for the
  retired bridge span and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - BS-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior source coverage remains carried by BS-002 through BS-024.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 014 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0044
preserved_exact_tokens:
  - "BS-001"
  - "source_preserving_planunit"
  - "BS-002"
  - "BS-024"
negative_constraints:
  - "Do not remap atomized BinaryLocator spans back to BS-001."
  - "Do not treat the retired bridge as implementation-ready product coverage."
  - "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
  - "The old source-preserving bridge is retained only so migration lineage and historical references to BS-001 remain auditable."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```
