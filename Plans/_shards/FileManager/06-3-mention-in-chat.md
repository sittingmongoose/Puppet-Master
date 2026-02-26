## 3. @ mention in chat

**Done when:** Typing @ opens file list (same as File Manager); selecting a file adds it to message context; UI explains @ = context vs click = open. **Requires** same file list source as File Manager; full UX in assistant-chat-design. **If file list fails:** Show message in @ popup (e.g. "No project" or "Could not load files"); do not send message with invalid ref. **File deleted after @:** At send time, if file is missing, either resolve to last-known content or warn and allow send without attachment.

- **Trigger:** In the chat input, the user types **@** to open a **small search box** over the file list (same file list as File Manager -- single source of truth).
- **Behavior:** User picks a file (search/filter by name or path); the selected file is **added to the agent's context** for that message (e.g. as an attachment or context reference so the agent can read it). This provides explicit file context without leaving the chat. **@ vs click-to-open:** **@** adds the file to the **message context** (agent can read it); **clicking** a path or code block **opens the file in the editor**. They are intentionally different: context vs open. Explain this in the UI (e.g. tooltip or short hint) so users are not confused.
- **Scope:** Chat-specific; full UX for @ mention is in assistant-chat-design.md. This plan states that @ mention resolution uses the same file list as the File Manager.

---

