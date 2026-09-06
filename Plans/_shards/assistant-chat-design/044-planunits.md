# Shard 044: PlanUnits

Source: `Plans/assistant-chat-design.md`

Source lines: L3538-L3589

Source SHA256: `6042b076a4835fecf4c2297bc51de70c98e5f604a4552c5ef425289124ebb4b7`

---

## PlanUnits

### ACD-001 - Assistant & Chat UI -- Design Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ACD-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after
  Phase 2B atomized assistant-chat-design-S0001 through
  assistant-chat-design-S0182 into ACD-002 through ACD-412. ACD-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - ACD-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior source coverage remains carried by ACD-002 through ACD-412.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 010 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:assistant-chat-design-S0183
preserved_exact_tokens:
  - "ACD-001"
  - "source_preserving_planunit"
  - "ACD-002"
  - "ACD-412"
negative_constraints:
  - "Do not remap atomized assistant-chat-design spans back to ACD-001."
  - "Do not treat the retired bridge as implementation-ready product coverage."
  - "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
  - "The old source-preserving bridge is retained only so migration lineage and historical references to ACD-001 remain auditable."
owner_hints:
  - Plans/assistant-chat-design.md
```
