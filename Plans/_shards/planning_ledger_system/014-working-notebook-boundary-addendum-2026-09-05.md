# Shard 014: Working Notebook Boundary Addendum (2026-09-05)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1374-L1408

Source SHA256: `f536f1cbd2d955bdc370944dd9369f5f2e8e38b88e6aec195de59444a22c1bec`

---

## Working Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. The Working Notebook (`Plans/Working_Notebook.md`) is casual/working-state memory and is distinct from planning ledgers: notebook text never becomes ledger source, canonical Plans prose, or a substitute for design atoms. Mandatory ledger turn writes remain mandatory at their owned boundaries regardless of notebook capture settings; PRD Builder, Planning Wizard, and Deep Plan workflows continue to record accepted requirements, corrections, and decisions in their canonical ledger records, with notebook content at most an explicit capture source referenced by lineage. Notebook content never becomes the sole requirement source, and future WorkNode/audit integration for notebooks is specified as readiness metadata only (no nodes are created by this packet).

```yaml
plan_unit_id: PLS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Working Notebook content is distinct from ledger source memory and canonical Plans prose. Mandatory ledger turn writes remain mandatory at owned boundaries regardless of notebook settings; accepted requirements and corrections are captured in their canonical planning owners with notebook text at most an explicitly referenced capture source. Notebook content never becomes the sole requirement source, and no WorkNodes or NodeSeeds are created for notebooks.
gui_related: false
gui_classification_reason: Ledger boundaries are planning-governance behavior, not GUI work.
depends_on: [PLS-001, WN-011]
unblocks: []
acceptance_criteria:
  - Disabling notebook capture never disables ledger turn writes.
  - Requirements and corrections live in canonical planning owners, not only in notes.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: source_authority_drift
reasoning_tier: high
context_scope: planning_ledger
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/Working_Notebook.md, Plans/PRD_Builder.md, Plans/Planning_Wizard.md]
node_compile_hint: {mode: governance_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A41
preserved_exact_tokens: ["mandatory ledger turn writes", "design atoms", "not a substitute"]
negative_constraints:
  - Do not treat notebook text as ledger source or canonical Plans prose.
  - Do not relax ledger write obligations because notebook capture exists.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Working_Notebook.md
