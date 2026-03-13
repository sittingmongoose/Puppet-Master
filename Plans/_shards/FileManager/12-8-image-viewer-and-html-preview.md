## 8. Image viewer and HTML preview

**§8.1 Done when:** Image file opens in image tab; zoom/fit work; unsupported format shows message (e.g. "Unsupported image format"). **Load failed / corrupt image:** Show placeholder with message; offer "Open in system viewer" or close tab. **§8.2 Done when:** HTML opens in browser; hot reload refreshes after debounce. **Local server or file URL failure:** If preview cannot load (e.g. CORS, invalid path), show error in browser panel and optional "Retry." **Hot-reload debounce key:** `app.editor.hot_reload_debounce_ms` (redb `settings` namespace; default 400). **Settings:** Dedicated image pane: Settings → Editor; default off (MVP: same tab area).

### 8.1 Image files

- **Opening images:** Selecting an image file in File Manager (or clicking image path in chat) opens it in an image viewer, not the text editor. Formats at minimum: PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Viewer shows image at sensible size (fit to pane or 1:1 with zoom).
- **Placement (MVP):** Image viewer uses the **same tab area as the editor** -- an image opens as a tab that shows the viewer instead of text. Switching tabs or opening a text file works as in §2. Optional setting (e.g. Settings → Editor) for **dedicated image pane** in a later release.
- **Behavior:** View only (no in-app pixel editing). Zoom in/out, fit-to-width/fit-to-pane. Optional: copy image to clipboard, open in system viewer.

### 8.2 HTML in browser and hot reload

### 8.2A Rewrite normalization for HTML/browser preview (2026-03-08)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

HTML preview and browser preview use the canonical browser surface classes.

Rules:
- file-backed HTML preview uses `workspace_preview` or `detached_preview`
- preview subject identity is not silently retargeted by over-cap behavior
- multiple browser tabs may render distinct preview subjects inside the shell
- preview restore is scoped by project and workspace tab
- auth and automation browser sessions do not become file-manager preview tabs automatically
- click-to-context from HTML preview uses the same capture and share/revoke model as the main browser feature
### 8.3 Same browser surface as built-in browser and click-to-context

The HTML preview uses the **same built-in browser** as in **Plans/newfeatures.md §15.18** (Built-in Browser and Click-to-Context). One WebView/browser panel for: (1) Local HTML preview and hot reload (§8.2), (2) **Click-to-context for the Assistant**: user can **click on parts of the page** and **send that element's context to the Assistant chat** (DOM, attributes, rect, etc.) via the same mechanism as §15.18 (modifier key or "Send element to chat" toggle). When viewing your HTML design in this browser, you can click an element and add it as context for the next message. Edit → Save → hot reload → click section → send to Assistant. Element context schema, capture mode, security, and Assistant integration are in newfeatures.md §15.18. **Web app testing:** Same browser surface aligns with web app testing/verification (Playwright, browser verifier, GUI tool catalog per feature-list and newtools.md).

### 8.4 Click-to-context when viewing HTML

When viewing a local HTML file in the built-in browser, clicking an element still sends `browser_element_context` to the Assistant. The Assistant receives a structured element summary (`tag`, `id`, `class`, `text`, `role`, `rect`, `parent path`, optional HTML snippet) so the user can ask for changes or explanations about that part of the page.

ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/assistant-chat-design.md

Boundary rules:
- This HTML/browser path remains separate from native document review selection handoff.
- Native document surfaces use `document_selection_context` and may also support durable annotations when deterministic source mapping exists.
- Browser/HTML click-to-context does not imply durable annotations or `Resubmit with Annotations` semantics.
- Capture privilege and source-mutation privilege remain separate even for workspace-backed HTML preview.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/rewrite-tie-in-memo.md

---

