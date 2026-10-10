# Shard 025: Working Notebook Wiring Disposition Addendum (2026-09-05)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1465-L1498

Source SHA256: `f42c8d685755e74d180b637669e5d695d5823ba6e7fbdcea8927e4ececa0abb3`

---

## Working Notebook Wiring Disposition Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. The three Working Notebook command rows (`cmd.chat.open_working_notebook`, `cmd.chat.request_fresh_context`, `cmd.orchestrator.open_notebook`) are catalog-registered candidates awaiting runtime wiring: no production rows are added to `Plans/Wiring_Matrix.production.json` in this Plans wave because no handlers exist, and rows here would fabricate registration. Until their production rows land, any surfaced control naming them renders disabled with `command_not_registered` (fail-closed, per Rule 2 and the Assistant redesign disabled-render rule). No view-local shadow intents are declared for notebook actions; UI/slash/palette paths reuse the same authoritative commands where offered.

```yaml
plan_unit_id: UIW-019
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Working Notebook commands are catalog-registered candidates without production wiring rows; this wave adds none because no handlers exist. Surfaced controls fail closed with command_not_registered until production rows land, no view-local shadow intents are declared, and UI/slash/palette/NL paths reuse the same authoritative commands.
gui_related: true
gui_classification_reason: Wiring rules govern interactive UI element behavior.
depends_on: [UIW-018, UCC-158]
unblocks: []
acceptance_criteria:
  - No production wiring row exists for a command without a registered handler.
  - Candidate controls render disabled with truthful reasons rather than silently working.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fabricated_registration
reasoning_tier: high
context_scope: ui_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: wiring_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X05
preserved_exact_tokens: ["command_not_registered", "fail-closed", "view-local intent"]
negative_constraints:
  - Do not add wiring rows that claim handlers which do not exist.
owner_hints: [Plans/UI_Wiring_Rules.md]
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/UI_Command_Catalog.md
