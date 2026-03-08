## 9. Tabs: Editor, Terminal, Browser

### 9A. Browser tab and detached preview normalization (2026-03-08)

Browser-capacity behavior in this section predates the rewrite rendering addendum and is normalized as follows:

- `max browser tabs` refers only to in-shell Browser-tab capacity.
- Detached preview/browser windows are outside the in-shell browser-tab cap.
- The product MUST NOT recycle or retarget an existing preview subject solely because the in-shell browser-tab cap has been reached.
- If in-shell capacity is exhausted, the UI may offer detached-open or explicit user-directed re-use of an existing browser tab, but it MUST NOT silently change the underlying preview subject identity.
- Preview/browser-tab capacity settings and detached-window behavior must align with `Plans/newfeatures.md` §24.4A and `Plans/FinalGUISpec.md` §7.20.

**Done when:** Editor tabs per §2; terminal tabs with pin semantics; browser instances capped and over-cap policy defined. **Max browser instances:** Redb key e.g. `app.editor.max_browser_instances` (redb `settings` namespace; app-level); AutoDecision: default 3. **Settings:** Max browser previews: Settings → Editor or Developer; range 1-10; persist in redb. Terminal tab limit: AutoDecision: default 8; key `app.terminal.max_tabs` (redb `settings` namespace; app-level). **Pin semantics:** AutoDecision: terminal pin matches editor pin (pinned excluded from "Close others" and LRU close when a terminal tab cap exists).

- **Editor tabs:** Multiple open files in the editor are shown as **tabs** per editor group (§2.1, §2.4). Reorder, close (with unsaved prompt), persist per project.
- **Terminal tabs:** The **Terminal** (bottom panel per feature-list/gui-layout) supports **tabs**: multiple terminal sessions (e.g. one per shell or task). User can open a new terminal tab, switch between them, close, and optionally name or **pin**. **Pin semantics:** Pinned terminal tabs are excluded from "Close others" (and optionally from LRU-style close when terminal tab limit exists); align with or explicitly distinguish from editor pin (§12.4). Each tab has its own cwd and history; project context applies when a project is selected.
- **Browser:** The app supports **multiple browser instances** (e.g. multiple preview windows or browser panels). **Cap:** Enforce a **max browser instances** (AutoDecision: default 3; configurable in Settings, persist in redb). **One instance** = one WebView/preview window. When the user tries to open another preview over the cap: AutoDecision: reuse the least-recently-used instance (switch its URL to the new file and focus it; no prompt). No requirement for **tabs within** a single browser. Each instance is the same WebView/browser surface (§8, newfeatures.md §15.18) with click-to-context available.

---

