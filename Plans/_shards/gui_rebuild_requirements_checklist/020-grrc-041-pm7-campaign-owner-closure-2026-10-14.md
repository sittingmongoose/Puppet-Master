# Shard 020: GRRC-041 — PM7 campaign owner closure (2026-10-14)

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L2216-L2263

Source SHA256: `43936fa76f55a2a4a9d8c70f4c5e110dd0829dfca4b292a62aaaf67e4534e905`

---

## GRRC-041 — PM7 campaign owner closure (2026-10-14)

```yaml
plan_unit_id: GRRC-041
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  The PM7 campaign is covered through FinalGUISpec F3-650 through F3-658 and the amended notification, hover and
  panel owners; Settings_System SSYS-052 through SSYS-054; storage-plan SP-333; UI_Command_Catalog UCC-204;
  Commands_System CS-102; Wiring_Matrix WM-093; UI_Wiring_Rules UIW-043; and Automated_Testing_System ATS-077.
  The linked registry/census/schema companions must agree before implementation certification. Decision_Log
  DL-189 through DL-201 records the decisions and supersessions. Glass remains requirements pending Jared's
  publication review, GLY-4 remains unanswered, and no concept-only demo or harness becomes a product surface.
  An approved packet is specification evidence, never native implementation proof.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All owner references and companion validation resolve; holds and native evidence gaps remain explicit.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Automated_Testing_System.md#ATS-077
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/Decision_Log.md#DL-201
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-077, ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/Decision_Log.md#DL-201
