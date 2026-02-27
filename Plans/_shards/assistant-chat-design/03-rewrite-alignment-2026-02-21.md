## Rewrite alignment (2026-02-21)

This plan's **UX requirements** remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- **Core:** Providers + unified event model + deterministic agent loop (OpenCode-style)
- **Storage/search:** seglog/redb/Tantivy projections (not chat-history SQLite). Implementation checklist and chat mapping: Plans/storage-plan.md.
- **UI:** Rust + Slint (not Iced)
- **Tooling:** central tool registry + policy engine; tool approvals and results flow through the unified event stream
- **Auth:** subscription-first; **Gemini API key is the explicit allowed exception** (subscription-backed)

Any references in this plan to current UI widget implementation details should be treated as illustrative; the behavior and data contracts are what must remain stable.

