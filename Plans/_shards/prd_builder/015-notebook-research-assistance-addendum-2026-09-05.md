# Shard 015: Notebook Research Assistance Addendum (2026-09-05)

Source: `Plans/PRD_Builder.md`

Source lines: L947-L980

Source SHA256: `0dddb1aa7bb608605c65e6a5d043ae5afb2c4b91baa39260932698cb7af554ef`

---

## Notebook Research Assistance Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A thread-scoped Working Notebook may assist PRD intake and research (holding research progress, rejected framings, open questions, and evidence locations) and may continue across a fresh context window, but it never changes PRD authority: the PRD ledger is still updated every turn, accepted requirements and corrections are still captured as canonical PRD ledger records and source manifests with lineage, and notebook references are at most explicitly recorded capture sources. Notebook content is never the sole requirement source and never satisfies the approve-for-planning-wizard gate.

```yaml
plan_unit_id: PRDB-012
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: "A Working Notebook may assist PRD intake/research and continue across fresh context windows without altering PRD authority: per-turn PRD ledger updates remain mandatory, accepted requirements and corrections are captured as canonical PRD ledger records with lineage, and notebook content is never the sole requirement source or an approval gate input."
gui_related: false
gui_classification_reason: PRD authority semantics are workflow behavior, not GUI work.
depends_on: [PRDB-011, PLS-022]
unblocks: []
acceptance_criteria:
  - A material requirement discussed in research is captured in the PRD ledger, not left only in notes.
  - Notebook references never replace source manifests or approval gates.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: requirement_leak_to_notes
reasoning_tier: standard
context_scope: prd_builder
implementation_surfaces: [Plans/PRD_Builder.md, Plans/Planning_Ledger_System.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: workflow_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A41
preserved_exact_tokens: ["PRD ledger", "every turn", "sole requirement source"]
negative_constraints:
  - Do not let notebook research substitute for PRD ledger records.
owner_hints: [Plans/PRD_Builder.md, Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/PRD_Builder.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Working_Notebook.md
