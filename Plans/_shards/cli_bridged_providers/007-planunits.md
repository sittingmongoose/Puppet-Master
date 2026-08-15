# Shard 007: PlanUnits

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L239-L290

Source SHA256: `2e2169e29bbc60c977d161be0f7d05b1458c6c690dbf079f10e3d47fcee61870`

---

## PlanUnits

### CBP-001 - CLI-Bridged Providers Source-Preserving Bridge Retired

```yaml
plan_unit_id: CBP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized CLI_Bridged_Providers-S0001 through
  CLI_Bridged_Providers-S0010 into CBP-002 through CBP-018. CBP-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CBP-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CBP-002 through CBP-018.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 024 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:CLI_Bridged_Providers-S0013
preserved_exact_tokens:
- CBP-001
- source_preserving_planunit
- CBP-002
- CBP-018
negative_constraints:
- "Do not remap atomized CLI_Bridged_Providers spans back to CBP-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to CBP-001 remain auditable."
owner_hints:
- Plans/CLI_Bridged_Providers.md
```
