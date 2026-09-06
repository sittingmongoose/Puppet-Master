# Shard 025: Notebook Topic Research Addendum (2026-09-05)

Source: `Plans/Planning_Wizard.md`

Source lines: L2100-L2133

Source SHA256: `e3bd3e17e5ca0dce00a6b7b6776eeec9d67cb2c4283fa8706b180dbfe4604dce`

---

## Notebook Topic Research Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Topic agents may keep scoped Working Notebooks for research progress and rejected directions and may continue across fresh context windows, but the Planning Run ledger remains the canonical record: topic_id-scoped ledger records and global cross-topic decisions/constraints are still written at their owned boundaries, ledger-to-Plan compilation and PlanUnit preparation consume ledger records (not notes), and Approve And Build authority is untouched. Future WorkNode integration with notebooks is described only as readiness metadata; this packet creates no WorkNodes, NodeSeeds, or candidates.

```yaml
plan_unit_id: PWIZ-026
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Topic agents may use scoped Working Notebooks and fresh context windows for research, but topic ledger records, cross-topic decisions, compilation inputs, and Approve And Build authority remain ledger-owned and unchanged. Notebook content never becomes compile authority, and future WorkNode integration is readiness metadata only with no nodes created.
gui_related: false
gui_classification_reason: Planning Wizard authority semantics are workflow behavior, not GUI work.
depends_on: [PWIZ-025, PLS-022]
unblocks: []
acceptance_criteria:
  - Topic requirements and corrections are captured in Planning Run ledger records, not only in notes.
  - Future WorkNode integration is specified without creating any nodes.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: compile_authority_drift
reasoning_tier: standard
context_scope: planning_wizard
implementation_surfaces: [Plans/Planning_Wizard.md, Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md]
node_compile_hint: {mode: workflow_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A41
preserved_exact_tokens: ["Planning Run ledger", "Approve And Build", "no nodes created"]
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, or candidates from notebook integration.
owner_hints: [Plans/Planning_Wizard.md, Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_To_Node_Compilation.md
