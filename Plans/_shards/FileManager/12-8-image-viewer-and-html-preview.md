## 8. Image viewer and HTML preview

**§8.1 Done when:** Image file opens in image tab; zoom/fit work; unsupported format shows message (e.g. "Unsupported image format"). **Load failed / corrupt image:** Show placeholder with message; offer "Open in system viewer" or close tab. **§8.2 Done when:** HTML opens in browser; hot reload refreshes after debounce. **Local server or file URL failure:** If preview cannot load (e.g. CORS, invalid path), show error in browser panel and optional "Retry." **Hot-reload debounce key:** `app.editor.hot_reload_debounce_ms` (redb `settings` namespace; default 400). **Settings:** Dedicated image pane: Settings → Editor; default off (MVP: same tab area).

### 8.1 Image files

- **Opening images:** Selecting an image file in File Manager (or clicking image path in chat) opens it in an image viewer, not the text editor. Formats at minimum: PNG, JPEG, GIF, WebP, SVG (optionally BMP, ICO). Viewer shows image at sensible size (fit to pane or 1:1 with zoom).
- **Placement (MVP):** Image viewer uses the **same tab area as the editor** -- an image opens as a tab that shows the viewer instead of text. Switching tabs or opening a text file works as in §2. Optional setting (e.g. Settings → Editor) for **dedicated image pane** in a later release.
- **Behavior:** View only (no in-app pixel editing). Zoom in/out, fit-to-width/fit-to-pane. Optional: copy image to clipboard, open in system viewer.

### 8.2 HTML in browser and hot reload

- **Open HTML in browser:** When user opens an HTML file, app can open it in system or embedded browser (or "Open in browser" / "Preview" action). Use file: URL or local HTTP server so relative paths resolve.
- **Edit + hot reload:** User opens HTML in editor; optionally preview in browser. When user saves the HTML file or any **linked** file, browser view refreshes automatically after a debounce. **Linked files:** Files that trigger refresh are the HTML file itself and any resource referenced by it (e.g. `<link href="...">`, `<script src="...">`) that lie under the project or the same directory; implementation may use a simple same-dir + referenced-path rule. **Debounce:** **400 ms** default (per file, per preview instance); configurable in Settings → Editor or Developer (e.g. 100-2000 ms); persist in redb. Rapid saves result in one refresh after the last save within the window. Tight loop: edit → Save → see result in browser.
- **Scope:** One or more HTML files per project; embedded vs system browser is implementation choice. Local resources only; no remote deployment in MVP.
- **Security:** Preview in sandboxed/local context (file: or localhost). Document any restrictions (e.g. no file:// to paths outside project).

### 8.3 Same browser surface as built-in browser and click-to-context

The HTML preview uses the **same built-in browser** as in **Plans/newfeatures.md §15.18** (Built-in Browser and Click-to-Context). One WebView/browser panel for: (1) Local HTML preview and hot reload (§8.2), (2) **Click-to-context for the Assistant**: user can **click on parts of the page** and **send that element's context to the Assistant chat** (DOM, attributes, rect, etc.) via the same mechanism as §15.18 (modifier key or "Send element to chat" toggle). When viewing your HTML design in this browser, you can click an element and add it as context for the next message. Edit → Save → hot reload → click section → send to Assistant. Element context schema, capture mode, security, and Assistant integration are in newfeatures.md §15.18. **Web app testing:** Same browser surface aligns with web app testing/verification (Playwright, browser verifier, GUI tool catalog per feature-list and newtools.md).

### 8.4 Click-to-context when viewing HTML

When viewing a local HTML file in the built-in browser (with or without hot reload), **clicking an element** (with same modifier or toolbar as newfeatures.md §15.18) **sends that element's context to the Assistant**. The Assistant receives a structured summary (tag, id, class, text, role, rect, parent path, optional HTML snippet) so the user can ask for changes or explanations about that part of the page. Same behavior as "launch webapp and click to send context"; here the "webapp" is the user's local HTML file.

---

