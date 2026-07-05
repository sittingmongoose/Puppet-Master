# Shard 008: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Plan_Document_System.md`

Source lines: L958-L1010

Source SHA256: `8dda51d9140a2df2970dbf942bd8c161a3164ed371ec1ce622d86a5756fbcabe`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PDS-018 - PDS-018

```yaml
plan_unit_id: PDS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: >-
  The import preserves raw target_docs exactly, but future compile must adjudicate 12 empty target-doc rows, pathless aliases, missing placeholders such as Terminal_Integration.md / Context_Management.md / Skill_System.md, process-governance placeholders, and conditional owner docs before writing canonical Plans.
gui_related: false
gui_classification_reason: Backend/orchestration import guardrail; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0122 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: high
context_scope: import_guardrail
implementation_surfaces:
- Plans/Plan_Document_System.md
node_compile_hint:
  mode: atom_0122
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0122
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0122
- subagent:019f297e-fc1f-7e70-a9ab-ddd11d446df3
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0122
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- 12 rows have empty target_docs
- Terminal_Integration.md
- Context_Management.md
- Skill_System.md
- Spec_Lock / governance seal docs
- Future compile must adjudicate missing and stale target docs
negative_constraints: []
compile_disposition: create_new_planunit
```
