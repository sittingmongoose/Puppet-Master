## Rewrite alignment (2026-02-21)
This plan remains authoritative for *what* tool discovery/testing support must exist, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- tool discovery, permissions, and validation live in the **central tool registry + policy engine** (not per-provider special cases)
- tool execution results normalize into the **unified event model** and store through seglog -> projections (redb/Tantivy)
- tool latency and errors from the unified event model feed analytics scan jobs and dashboard rollups
- UI wiring details should be re-expressed in Slint (not Iced) without changing feature semantics
- auth policy remains subscription-first, with Gemini API key as the explicit allowed exception; Gemini itself is one provider with mixed OAuth/API-key account pools and requested/effective auth/account identity that must remain consistent with the shared provider runtime
- for this task, deliverables remain **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
