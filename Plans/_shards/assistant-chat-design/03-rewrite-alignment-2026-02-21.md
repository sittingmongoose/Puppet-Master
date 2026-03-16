## Rewrite alignment (2026-02-21)
This plan's **UX requirements** remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- **Core:** Providers + unified event model + deterministic agent loop (OpenCode-style)
- **Storage/search:** seglog/redb/Tantivy projections (not chat-history SQLite). Implementation checklist and chat mapping: `Plans/storage-plan.md`.
- **UI:** Rust + Slint (not Iced)
- **Tooling:** central tool registry + policy engine; tool approvals and results flow through the unified event stream
- **Auth:** subscription-first; Gemini API key remains the explicit allowed exception, but Gemini itself is one provider with mixed OAuth/API-key account pools, OAuth-first default preference under `auto`, and requested/effective auth/account identity visible to chat/runtime surfaces rather than collapsed into a single generic auth badge

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

Any references in this plan to current UI widget implementation details should be treated as illustrative; the behavior and data contracts are what must remain stable.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md
