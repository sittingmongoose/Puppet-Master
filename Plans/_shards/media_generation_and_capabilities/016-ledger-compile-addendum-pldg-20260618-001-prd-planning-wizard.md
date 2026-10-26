# Shard 016: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6270-L6319

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### MGAC-093 - Planning Visual Reference Artifact Consumers

```yaml
plan_unit_id: MGAC-093
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: 'Planning topics may accept uploaded reference images and generate wireframes, architecture diagrams, data-flow diagrams, state diagrams, or visual references through the existing image system, with artifact IDs, provenance, topic links, version, and status.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0065
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0065
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- uploaded reference image
- generated reference image
negative_constraints: []
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Project_Output_Artifacts.md
```
