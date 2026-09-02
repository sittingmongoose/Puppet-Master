# Shard 031: INV-026 -- Web/provider recovery consumers defer to owner contracts

Source: `Plans/Architecture_Invariants.md`

Source lines: L414-L423

Source SHA256: `6ce7f74c2d708b8bdc9358c3f7e41354630e681db5985087d30bd42654a39c7b`

---

## INV-026 -- Web/provider recovery consumers defer to owner contracts

**Rule:** Web, Firecrawl, provider, and recovery consumers MUST preserve owner boundaries instead of reintroducing stale local assumptions.

- `Plans/FileManager.md` consumes file/browser/rendering repairs and MUST NOT keep stale inline visualizer or terminal-action assumptions; `/browser/rendering` behavior stays routed through the browser/rendering owners and any terminal-action surface remains a consumer of terminal/runtime contracts.
- `Plans/FinalGUISpec.md` consumes Firecrawl billing and audit disclosure; credit-warning and audit-surface UI copy MUST defer to `Plans/Tools.md` for thresholds, provider billing exceptions, cache/routing disclosure, and web-operation audit payload ownership.
- HITL, `Plans/Wiring_Matrix.md`, `Plans/usage-feature.md`, `Plans/assistant-memory-subsystem.md`, `Plans/Widget_System.md`, `Plans/Architecture_Invariants.md`, and `Plans/DRY_Rules.md` remain consumers in the web/provider recovery map: HITL patterns consume the shared approval ladder and batch permission UX; Wiring Matrix carries `research_session` and web-tool wiring; Usage tracks Firecrawl credit model and `/billing`; Assistant Memory persists web research session context without owning provider semantics; Widget System adds only owner-approved card widget types; Architecture Invariants records provider architecture changes; DRY Rules owns external reference policy, including Part Q-style external-reference constraints.
- Consumer drift remains blocking even when owner docs exist: slash-command consumers, questionnaire consumers, provider `/multi-account/runtime-identity` consumers, and log/audit GUI consumers MUST be reconciled in the same packet as the repaired owner docs so stale local assumptions do not mislead implementation.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Widget_System.md, ContractName:Plans/DRY_Rules.md
