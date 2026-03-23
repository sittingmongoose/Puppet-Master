## 9. Tabs: Editor, Terminal, Browser

### 9A. Terminal tabs, panes, and sections
Terminal containers are shell-workspace state, not a loose collection of generic bottom-panel tabs.

Rules:
- Puppet Master supports up to two terminal sections/components.
- Each terminal section owns an ordered terminal-tab strip.
- Each terminal tab contains from one to four panes.
- Pane layout supports row and column splits and rebalances deterministically when a pane closes.
- Tabs and panes can be reordered without changing the bound runtime identity.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 9B. Browser tab and detached preview normalization (2026-03-08)
The canonical browser container model is editor/workspace-tab-first for in-shell browsing.

Rules:
- in-shell normal browsing uses browser tabs in the editor/workspace surface, not a free-floating browser-instance pool
- detached preview/browser windows are first-class and outside the in-shell browser-tab cap
- bottom-panel browser hosting is not canonical behavior
- LRU browser-instance reuse is not canonical behavior
- when the browser cap is reached, the user gets an explicit choice or deterministic command failure; the app must not silently replace the current preview subject
- `automation_session` and `auth_session` are not counted as normal in-shell browser tabs

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 9C. Terminal and browser anti-collapse rule
Terminal tabs and browser tabs are nearby shell surfaces, but they are not interchangeable containers.

Rules:
- terminal tab semantics MUST NOT be reused as browser-session semantics
- browser-tab caps and terminal-tab behavior are configured and disclosed independently
- route and focus actions preserve the correct object kind (`browser_session`, `terminal_tab`, `terminal_pane`, `terminal_session`, or `dev_session`) instead of flattening them into one generic tab concept

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

