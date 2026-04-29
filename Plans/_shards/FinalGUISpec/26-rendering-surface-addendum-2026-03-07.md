## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0312
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Source Control should be the narrower but deeper Git/worktree inventory and manipulation surface.
  - confirm the highest-pressure owner/consumer docs still match the current blocker inventory
  - Because the inventory is stable and planning blockers remain zero, the next useful stage is `Ledger Condenser`.
  - Ledger Condenser
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The rewrite must treat browser-capable rendering as a shared capability across these surfaces:

- **Chat Panel**: rendered Markdown text, Mermaid cards, source toggle/open actions, and explicit browser-derived capture chips routed into chat
- **File Editor**: source mode, split preview mode, detached preview mode, and browser mode for HTML/workspace browsing
- **Embedded Document Pane**: preview-capable document review surface using the same rendering and preview identity contract
- **Editor-tab Browser surface**: the canonical in-shell host for `workspace_preview`
- **Detached preview/browser windows**: first-class `detached_preview` surfaces linked to the originating browser subject
- **Automation/Auth browser windows**: visible `automation_session` and `auth_session` surfaces that are not counted as normal in-shell browser tabs
- **Bottom-panel browser-adjacent surfaces**: optional logs, evidence, downloads, console/network summaries, or DevTools-adjacent panes that do not own the canonical browsing session

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

### GUI behavior rules

- detached preview/browser windows are part of the intended UX and are not described as degraded workarounds
- the editor/workspace tab surface is the canonical in-shell host for normal browsing and HTML preview
- the bottom panel must not be described as the primary browser host
- HTML/browser mode must visually read as a real browser-capable surface rather than as a static Markdown preview
- users must be able to watch agent-driven browser/testing sessions live when automation is running visibly
- docked DevTools is the default and lives inside the currently focused browser session surface; detached DevTools is an alternate layout
- image viewing remains native and must not inherit unnecessary browser chrome

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

### Embedded document pane behavior

The Embedded Document Pane must reuse the same rendering pipeline and PreviewSession abstraction as the file editor and chat. It is a review/inspection surface, not a separate rendering system.

Required actions:

- open source
- open detached preview
- request re-render/reload
- perform allowed structured edits when the underlying document kind supports them

### Bottom panel browser behavior

The bottom panel is not the canonical host for normal browsing, HTML preview, or click-to-context workflows.

Allowed bottom-panel browser-adjacent roles are:
- console/network summaries for the focused browser session
- downloads, trace/video progress, and evidence activity tied to the focused browser session
- automation activity, step status, or capture status linked to a visible browser session
- DevTools-adjacent panes that complement the focused browser session without becoming a separate browser host

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Wiring_Matrix.md

Rules:
- actions surfaced from the bottom panel must focus or act on the owning browser session rather than invent a separate browser identity
- browser open, detached-open, takeover, promotion, and recovery actions always target the canonical browser session model
- the bottom panel may expose `Open DevTools`, `Focus Browser`, or evidence actions, but it does not own the primary browsing session

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

### Windowing and platform behavior

- the browser runtime expectation is a PM-managed pinned bundled CEF-class Chromium runtime on Windows, macOS, and Linux
- native child-window embedding is the baseline host strategy; offscreen rendering is secondary
- detached browser and detached DevTools windows are first-class surfaces linked to the owning browser session
- GUI copy must not imply that the browser is only available through detached fallback windows or platform-specific system-webview assumptions
- when the bundled browser runtime is damaged or unavailable, the UI must surface `runtime_unavailable` with remediation and keep source/native surfaces usable
- the UI must not rely on hidden pre-created browser panes to feel responsive on platforms where hidden-window behavior is constrained

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md

### Performance and accessibility

- Use lazy rendering and virtualization for long message streams and large documents.
- Preserve scroll positions where feasible when re-rendering preview content.
- Preview controls must be keyboard reachable.
- Diagram export/open/source actions must have explicit labels and accessible tooltips/text.

### Acceptance criteria addendum

- the same logical subject can move between chat card, editor preview, embedded doc pane, editor-tab browser, detached preview, and detached browser without inventing separate rendering contracts
- Mermaid diagrams render consistently across chat, editor, and planning/doc surfaces
- HTML rendered mode behaves like a real browser/workspace preview, not a static screenshot
- the bottom panel is not required as the primary browser host for the feature to work
- platform limitations may change embedding details, but they must not remove the feature or hide requested/effective browser capability differences
- users can watch a live `automation_session`, safely take over, and promote it to normal browsing without losing the visible browser

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

