# Shard 011: GUI Placement Options

Source: `Plans/usage-feature.md`

Source lines: L415-L432

Source SHA256: `0f850dcf9674989a11bc3adb101e6db90f01c07eceab680592d9fd9d9969142d`

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
- direct click on the context circle opening the detail pane without the hover/click split
- unresolved `tab or panel or pop-out` phrasing that leaves the implementation guessing

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md
