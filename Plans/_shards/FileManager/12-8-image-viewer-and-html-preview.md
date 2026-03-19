## 8. Image viewer and HTML preview

**§8.1 Done when:** Image file opens in image tab; zoom/fit work; unsupported format shows message (e.g. "Unsupported image format"). **Load failed / corrupt image:** Show placeholder with message; offer "Open in system viewer" or close tab. **§8.2 Done when:** HTML opens in browser; hot reload refreshes after debounce. **Local server or file URL failure:** If preview cannot load (e.g. CORS, invalid path), show error in browser panel and optional "Retry." **Hot-reload debounce key:** `app.editor.hot_reload_debounce_ms` (redb `settings` namespace; default 400). **Settings:** Dedicated image pane: Settings → Editor; default off (MVP: same tab area).

### 8.1 Image files

- **Opening images:** Selecting an image file in File Manager (or clicking image path in chat) opens it in an image viewer, not the text editor. Formats at minimum: PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Viewer shows image at sensible size (fit to pane or 1:1 with zoom).
- **Placement (MVP):** Image viewer uses the **same tab area as the editor** -- an image opens as a tab that shows the viewer instead of text. Switching tabs or opening a text file works as in §2. Optional setting (e.g. Settings → Editor) for **dedicated image pane** in a later release.
- **Behavior:** View only (no in-app pixel editing). Zoom in/out, fit-to-width/fit-to-pane. Optional: copy image to clipboard, open in system viewer.

### 8.2 HTML in browser and hot reload

### 8.2A Rewrite normalization for HTML/browser preview (2026-03-08)
HTML preview and browser preview use the canonical browser session-class model and the same PM browser runtime as the built-in browser feature.

Rules:
- `Open` keeps the file in source/editor mode
- `Open in Browser` opens the file in a `workspace_preview`
- `Open in Detached Browser` opens the file in a `detached_preview`
- split browser layout is a second-step layout action after opening, not a separate open command
- file-backed HTML preview is editor-tab-first rather than bottom-panel-first
- preview subject identity is not silently retargeted by over-cap behavior
- multiple browser tabs may render distinct preview subjects inside the shell
- preview restore is scoped by project and workspace tab
- auth and automation browser sessions do not become file-manager preview tabs automatically

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
### 8.3 Same browser surface as built-in browser and click-to-context

HTML preview uses the same built-in browser defined by the promoted browser owner spec rather than a separate WebView or a stale `newfeatures.md` authority path.

- local HTML preview, normal browsing, screenshots, console/network inspection, DevTools, and watchable browser testing all use the same PM browser runtime and session-class model
- `workspace_preview` and `detached_preview` cover normal file-backed HTML browsing
- `automation_session` covers watchable agent-driven browser testing and verification with separate ephemeral state by default
- `auth_session` covers PM-owned auth and provider/device flows without silently turning into a normal preview tab

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md

### 8.4 Click-to-context when viewing HTML

Click-to-context in HTML/browser mode is explicit and uses the same browser capture model as the main built-in browser.

- text selection uses `browser_selection_context`
- element pick uses `browser_element_context`
- capture creates removable composer chips and never silently submits a message
- when no writable active thread/composer exists, PM opens a new thread and places the chips there
- the default combined capture is context plus clipped screenshot; full-page combined capture remains explicit

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Boundary rules:
- the HTML/browser path remains separate from native document review selection handoff
- native document surfaces use `document_selection_context` and may support durable annotations only when deterministic source mapping exists
- browser/HTML click-to-context does not imply durable annotations or `Resubmit with Annotations` semantics
- capture privilege and source-mutation privilege remain separate even for workspace-backed HTML preview
- ordinary browsing clicks must not unexpectedly create or send chat context

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md

---

