## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

Chat and planning surfaces support both Mermaid and the broader inline visualizer, but they are distinct contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 28.1 Canonical split

- Mermaid remains the fenced-diagram rendering path
- the inline visualizer is a separate sandboxed HTML/SVG module
- neither path owns hidden mutable state outside durable source or metadata refs

### 28.2 Inline visualizer bridge

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.

ContractRef: Plans/FinalGUISpec.md#15.6 Mermaid and inline visualizer widgets

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
