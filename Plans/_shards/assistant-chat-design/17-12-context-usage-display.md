## 12. Context usage display
ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md

Per-thread usage uses one canonical detail surface.

Rules:
- the context indicator lives in the chat header for the active thread
- hover shows summary values
- activation opens the thread Usage surface in the chat side panel or equivalent canonical in-shell region
- a separate detached usage pop-out is not the canonical model
- streaming updates may show in-progress or updating states, but must converge into the same canonical Usage surface
- the same thread Usage identity is used by cost_usage artifact deep-links and app-wide Usage navigation

Required content for the thread Usage surface:
- total tokens and context-window fill when available
- input/output/reasoning/cache breakdown when reported
- per-turn or per-segment history when the upstream usage record supports it
- link to app-wide Usage with the same thread/run filters in scope
