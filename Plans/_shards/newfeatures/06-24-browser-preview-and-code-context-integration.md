## 24. Browser preview and code-context integration

### 24.1 Built-in browser preview
The rewrite includes a built-in browser preview surface for live rendering of web content produced by the active project. This preview is part of the product's visual-debugging and UI-validation loop rather than a detached convenience viewer, so it must participate in shared navigation, evidence capture, and source-opening flows.

### 24.2 Relationship to Built-in Browser and Click-to-Context
The built-in browser preview provides live rendering of web content. Click-to-context allows users to click elements in the browser preview to navigate to the corresponding source code. This bridges the visual output and code representation by making rendered UI state, editable source, and assistant context part of the same troubleshooting and iteration loop instead of three separate tools.

Integration points:
- browser preview ↔ editor (`click-to-source`)
- browser preview ↔ chat (`screenshot-to-context`)
- browser DevTools ↔ debug mode (`DOM inspection as evidence`)

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Glossary.md
