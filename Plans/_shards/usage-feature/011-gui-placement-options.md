# Shard 011: GUI Placement Options

Source: `Plans/usage-feature.md`

Source lines: L415-L432

Source SHA256: `b992d366f78133b51691900eac1e8a6e32e7b48648348bd6984c1acc2ab781d1`

---

## GUI Placement Options
The GUI placement model is fixed.

Canonical placement:
- app-wide Usage is its own page or view
- compact usage visibility appears in shell and status surfaces where appropriate
- thread-scoped context detail lives in the chat flow as the context circle plus the editor-tab Context Detail Pane
- artifact deep-links and chat usage activation land on those same canonical surfaces based on scope

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Non-canonical after this section:
- thread Usage in the chat shell or side panel as the primary detailed surface
- detached usage pop-out as the canonical thread detail model
- direct click on the context circle opening the detail pane; the ring click opens the context status module and only its `More Details` action opens the pane (ACD-441)
- unresolved `tab or panel or pop-out` phrasing that leaves the implementation guessing

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md
