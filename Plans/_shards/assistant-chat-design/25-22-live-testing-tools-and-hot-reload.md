## 22. Live Testing Tools and Hot Reload
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Live testing and hot reload are dev-session operations.

Rules:
- assistant-invoked dev actions map to stable UI commands and visible shell state changes
- `start hot reload dev mode`, `start dev server`, and `run tests in watch mode` are user-facing intents that must resolve to canonical `cmd.*` IDs in the UI command catalog
- the chat surface shows whether a dev session is starting, active, failed, stopping, or stopped
- output routes into the canonical terminal/output/ports surfaces owned by the shell; chat does not create a parallel dev-output model
- project switch or workspace-tab close must surface explicit consequences for any active dev session
