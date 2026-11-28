# Shard 007: Completion Criteria

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L96-L102

Source SHA256: `fa54d28deacb313c7c1ca7c169f563d3e988a23831677867022cb7a8ebbb4b33`

---

## Completion Criteria

This checklist is complete when all rows in the verification table are `PASS` and verifier gates pass.

`PASS` means the row's recorded status is `pass` (or `not_applicable` with a written reason) with an evidence ref that resolves on the current `main`. The verifier gates are `python3 scripts/pm-plans-verify.py run-gates` and the landing check (`python3 scripts/pm-landing-check.py`) with no failure that names this checklist or a cited owner section. The Projection state row remains `fail` until CV-048 applies the separate vocabularies and its citations are rechecked.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
