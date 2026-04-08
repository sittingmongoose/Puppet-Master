## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

Chat and planning surfaces support both Mermaid and the broader inline visualizer, but they are distinct contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 28.1 Canonical split

- Mermaid remains the fenced-diagram rendering path
- the inline visualizer is a separate sandboxed HTML/SVG module
- neither path owns hidden mutable state outside durable source or metadata refs

### 28.2 Inline visualizer bridge
The inline visualizer is a PM-managed renderer distinct from Mermaid. It is not a generic HTML sandbox or a shortcut around PM state.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

Bridge contract:
- bridge messages include at least `requestThemeTokens`, `reportSize`, `emitSelection`, `sendPrompt(text)`, and `openLink(url)`
- theme-token injection is PM-owned so visuals stay aligned with the active theme and accessibility settings
- the renderer reports auto-height and resize events back to PM; chat does not guess iframe height blindly
- question-flow visuals never bypass PM draft state or submit directly to the model

Sandbox and persistence rules:
- the iframe sandbox stays at `sandbox="allow-scripts"`
- `allow-same-origin`, `allow-forms`, `allow-popups`, and `allow-top-navigation` stay denied
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- arbitrary runtime network fetches are not part of the MVP visualizer contract
- persisted state is limited to PM-managed source fragments, metadata, and PM-owned outputs; arbitrary JS heap state is not durable
- visible fallback and error rendering remain mandatory when the visualizer cannot execute or render safely
- Copy source
- Open in editor
- Open detached preview
- Export diagram

Rules:
- Keep this bridge section consuming Plans/FinalGUISpec.md#15.6 Mermaid and inline visualizer widgets
