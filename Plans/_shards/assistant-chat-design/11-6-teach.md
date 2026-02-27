## 6. Teach

- **Concept:** Users can ask the Assistant how to use Puppet Master (platform, modes, queues, etc.). No separate "Teach" sidebar or inline tips component is required.
- **Implementation:** Give the chat bot access to information on how Puppet Master works (e.g. inject or retrieve from docs: REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections, mode descriptions). The same chat surface is used; the user just asks ("How does Plan mode work?", "How do I add to the queue?"). **Build requirement:** The documentation that Teach uses (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, and any other canonical docs referenced above) must be built or validated when the rest of the project is built so it is always available to the Assistant.
- **Document rendering rule (required):** Chat must not render full document bodies for requirements, PRD, phase docs, contract seeds, or other long artifacts. Teach responses use concise summaries plus pointers to review surfaces.
- **Optional enhancements (in chat):** Structured tips tied to current mode/platform, short copy-pasteable "how to" snippets, and "How does [platform] work?" or "How does Plan mode work?" flows that inject a short summary/snippet with pointers, not full documents. All of this is delivered **through the chat**, not a separate UI.
- **Export conversation:** The user can **export the current thread** (messages and optionally agent tool summary) to **Markdown or JSON** for backup, sharing, or compliance. Available via slash command (e.g. `/export`) or a menu action.

---

