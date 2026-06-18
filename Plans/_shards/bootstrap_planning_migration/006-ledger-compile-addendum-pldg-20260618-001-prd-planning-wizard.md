# Shard 006: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Bootstrap_Planning_Migration.md`

Source lines: L301-L378

Source SHA256: `5464f40f3596d1adc04a4bd4a556ada920d9f5f3c399c4c439809297cadc2bac`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### BPM-008 - Mandatory Parallel Evidence And Prompt Hardening

```yaml
plan_unit_id: BPM-008
unit_type: requirement
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: 'atom-0162: Resume Ledger continues to read compact state first, avoid full event and record scans unless referenced, use Collaborator behavior, update ledger after each substantive turn, and infer gui_related. atom-0163: The ledger-to-Plans Goal prompt must require many bounded read-only subagents in parallel when atom, owner, or document thresholds are exceeded, require assignment/result evidence, and block rather than silently use one broad agent; main agent remains sole writer. atom-0165: The ledger-local governance seal prompt validates this ledger ID when present, seals only after Plans and indexes stabilize, and preserves runtime-disabled readiness unless runtime contracts were explicitly completed. atom-0166: The deep-audit Goal uses many bounded read-only subagents in parallel for atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance, forbidden artifacts, and validator mutability, with the main agent writing
  audit artifacts. atom-0167: The repair Goal builds a complete closure matrix, repairs or adjudicates every finding/detail, updates the semantic closure registry, uses bounded read-only specialist subagents, and does not treat passing validators alone as completion. atom-0168: Ledger-to-Plans compilation writes or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Bootstrap_Planning_Migration.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0162
- pldg-20260618-001-prd-planning-wizard:atom-0163
- pldg-20260618-001-prd-planning-wizard:atom-0165
- pldg-20260618-001-prd-planning-wizard:atom-0166
- pldg-20260618-001-prd-planning-wizard:atom-0167
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0162
- atom-0163
- atom-0165
- atom-0166
- atom-0167
- atom-0168
decision_refs:
- dec-0030
correction_refs: []
preserved_exact_tokens:
- Resume Ledger
- compact state first
- gui_related
- HARD PARALLEL GATE
- main agent is the only writer
- pldg-20260618-001-prd-planning-wizard
- governance seal
- Deep Audit
- many bounded read-only subagents in parallel
- repair_closure_matrix.jsonl
- semantic closure registry
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not reference or invoke superseded experimental planning-pipeline machinery.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
owner_hints:
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
- Plans/Plan_To_Node_Compilation.md
```
