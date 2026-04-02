## Rewrite alignment (2026-02-21)
This plan's **UX requirements** remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md` with the following reconciled assumptions:

- **Core:** providers + unified event model + deterministic agent loop remain the base architecture.
- **Storage/search:** seglog/redb/Tantivy projections remain the persistence/search stack; JSONL mirror is derived only.
- **UI:** Rust + Slint remain the intended shell implementation.
- **Tooling:** tool registry, approvals, and results normalize through the unified event stream and shared permission/runtime contracts.
- **Auth/runtime taxonomy:** subscription-first remains the default posture, but Gemini is not one mixed provider. The concrete runtime platforms are `gemini` (**Gemini Direct**; direct API-key transport) and `gemini_cli` (**Gemini CLI**; CLI-wrapped OAuth/API-key/Google-credential flows). Consumers MAY group them under `provider_family_id = gemini`, but chat/runtime surfaces MUST display the concrete requested/effective platform instead of collapsing them into a single generic Gemini badge.
- **Identity disclosure:** requested/effective runtime identity, account binding, and auth state are imported from the shared runtime contracts. Assistant Chat must not invent a parallel provider/auth field set.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md

Any references in this plan to current UI widget implementation details should be treated as illustrative; the behavior and data contracts are what must remain stable.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
