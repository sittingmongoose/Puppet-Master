# Shard 026: Rendering Surface Addendum (2026-03-07)

Source: `Plans/FinalGUISpec.md`

Source lines: L2612-L2740

Source SHA256: `fe982ae4a1f51adc6c189ebeb7fedce3965972c00355ed9d7a2f5852df787715`

---

## Rendering Surface Addendum (2026-03-07)

This addendum locks how Markdown, Mermaid, HTML, SVG, and image rendering appear in the Slint GUI.

### Surface inventory impact


The rewrite must treat browser-capable rendering as a shared capability across these surfaces:

- **Chat Panel**: rendered Markdown text, Mermaid cards, source toggle/open actions, and explicit browser-derived capture chips routed into chat
- **File Editor**: source mode, split preview mode, detached preview mode, and browser mode for HTML/workspace browsing
- **Embedded Document Pane**: preview-capable document review surface using the same rendering and preview identity contract
- **Editor-tab Browser surface**: the canonical in-shell host for `workspace_preview`
- **Detached preview/browser windows**: first-class `detached_preview` surfaces linked to the originating browser subject
- **Automation/Auth browser windows**: visible `automation_session` and `auth_session` surfaces that are not counted as normal in-shell browser tabs
- **Bottom-panel browser-adjacent surfaces**: optional logs, evidence, downloads, console/network summaries, or DevTools-adjacent panes that do not own the canonical browsing session

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Browser-derived capture chips in the Chat Panel appear in the composer chip strip with a bounded preview, page/source label, capture kind, remove/revoke affordance, and blocked/expired state when applicable. They serialize only when the user sends the message and only through the corresponding structured attachment path.

### GUI behavior rules

- Browser and agent-debugging UX follows the Section15 built-in browser contract rather than `web_search`, `web_fetch`, Site Reader, or raw CDP. The GUI presents the PM-managed CEF runtime, DevTools, visible `automation_session` / `auth_session` surfaces, `/video` evidence, `browser_selection_context`, and `browser_element_context`; capture chips must not auto-send, advanced storage or `/cookie` changes require explicit confirmation, and takeover controls expose pause, `/continue/stop`, and resume as named actions.
- Debug browser-automation defaults favor redacted summary packs, bounded evidence windows, isolated session handoff, `/audit` trails, and least-privilege browser takeover. They do not present broad shared-session control as the default user-facing model.
- Debug attention banners display `attention_required_reason_code` values such as `auth_handoff_required`, `manual_repro_required`, `manual_verification_required`, and `target_selection_required`. Debugger attach loss or manual debugger steering that PM does not own in MVP degrades to `attention_required`.
- An arbitrary URL remains a diagnose/verify-only browser investigation until PM binds it to a workspace-backed target; only then may the GUI offer durable-fix actions.
- detached preview/browser windows are part of the intended UX and are not described as degraded workarounds
- the editor/workspace tab surface is the canonical in-shell host for normal browsing and HTML preview
- the bottom panel must not be described as the primary browser host
- HTML/browser mode must visually read as a real browser-capable surface rather than as a static Markdown preview
- users must be able to watch agent-driven browser/testing sessions live when automation is running visibly
- docked DevTools is the default and lives inside the currently focused browser session surface; detached DevTools is an alternate layout
- Browser/rendered mode carries the required/desired browser capability set: it must open browser-handled content, support highlight/select browser content and screenshot capture into chat through visible chips, allow agent control to fully navigate/use user-locked web-app and website flows through named actions, preserve web-app compatibility including DevTools plus screenshot / console / network inspection, and expose DevTools on Linux, macOS, and Windows.
- Session-class UX distinguishes the same visible browser session the user watches, a separate visible automation window/tab, and hidden/ephemeral automation sessions; hidden/ephemeral sessions are allowed only as separate `automation_session` surfaces with an open/watch affordance, user-facing browser tabs remain the default visible host, and `Open in Detached Browser` is the explicit command when a separate window is needed.
- image viewing remains native and must not inherit unnecessary browser chrome

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Chat panel behavior

Chat messages that contain renderable Markdown/Mermaid content must support:

- readable Markdown formatting
- native Mermaid diagram cards where Mermaid syntax is detected
- actions for copy source, open in editor, open detached preview, and export diagram where relevant
- visible error states for malformed Mermaid instead of silent raw-block disappearance

Chat must not execute arbitrary HTML from message content.

Context Lens placement is fixed in the Chat panel: the control lives in the top-right of the chat window immediately to the right of the search bar, renders as an icon plus dropdown arrow, supports multi-select in all modes, and exposes `Mute`, `Focus`, `Subcompact`, and `Turn Off`.

### File editor behavior

The File Editor view must expose clear mode controls for render-capable files:

- Source
- Preview
- Split
- Detached preview
- Browser/rendered mode for HTML

The mode switch must not change the canonical buffer model. Split mode should preserve shared-buffer editing semantics with the existing document/editor contract.

Preview, browser, and other `/rendered` experiences are derivative of source and `/buffer` state. They may cache view mode, scroll, or export preferences, but they do not become peers with separate canonical content authority.

For local HTML, default `Open` = source editor; explicit `Open in Browser` opens the editor/workspace tabs browser surface, `Open in Detached Browser` opens a secondary detached browser window, and the editor toolbar/action plus agent file-target flow invoke the same canonical open command.

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
- PM browser chrome and any bottom-panel browser-adjacent actions may expose DevTools entry/bridge actions (`Open DevTools`, `Toggle DevTools Dock`, `Focus Browser`) or evidence actions; deeper inspection tools live inside the DevTools UI itself, and these actions must act on the owning `browser_session_id` without making the bottom panel the primary browsing session.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md

### Windowing and platform behavior

- the browser runtime expectation is a PM-managed pinned bundled CEF-class Chromium runtime on Windows, macOS, and Linux
- native child-window embedding is the baseline host strategy; offscreen rendering is secondary
- if the implementation uses a CEF wrapper such as `wef`, user-visible chrome must still present the feature as PM-managed browser capability rather than wrapper branding
- setup, Doctor, update, and installer surfaces must disclose a selected CEF path's roughly ~1 GB app-size impact and provide remediation when runtime install/update verification fails
- offscreen rendering may support capture, evidence, and degraded rendering workflows, but it must not replace the native child-window baseline for the canonical visible browser host
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
