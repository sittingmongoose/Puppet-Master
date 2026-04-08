## 12. Web tool routing algorithm
Routing is global and deterministic. PM uses one global provider-priority stack plus capability checks, cache rules, Site Reader precedence, and cost-aware tie-breaking. MVP does not expose per-operation priority reordering.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/assistant-chat-design.md#13.2 Web activity and provenance, ContractName:Plans/FinalGUISpec.md#15.3 Web and diff operation card widget, ContractName:Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)

### 12.1 Routing sequence

1. Validate the request shape and normalize URLs, schemas, `sources[]`, `categories[]`, and source/category filters.
2. Check permissions, blocked-state requirements, and approval gates before any provider selection.
3. Honor `adapter_hint` when the hinted provider is enabled and supports the requested operation/parameters; otherwise record why the hint could not be used.
4. Check the PM-owned cache when the operation is cacheable.
5. For `webfetch`, try the PM-native Site Reader path first when the request needs or benefits from real browser interaction; provider-routed fetch must not reuse the reserved `Reading Site` identity.
6. Build the candidate set from enabled providers and the capability matrix.
7. If no candidate supports the requested operation or parameter family, terminate with a capability-unavailable terminal branch and clear setup guidance describing the missing provider/auth/config requirement.
8. When multiple candidates offer similar capability, choose by the global stack, current health, auth readiness, and cost-aware selection; static priority order is not the only routing input.
9. Execute with the chosen path and record `requested_adapter_id`, `effective_adapter_id`, and `adapter_selection_reason`.
10. If execution falls back, emit a user-visible explanation and populate `provider_fallback_summary`.
11. When search results feed an answer, chat follows search-then-read behavior and final citations come from the actual read path rather than raw search snippets alone.
12. Persist the shared audit payload, refs, `warnings_count`, `error_code`, and projected `projection_freshness` / `projection_health` state.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

### 12.2 Additional routing rules

- no silent fallback is allowed.
- `provider_fallback_summary` is emitted only when a real fallback occurred.
- `webresearch` may stay PM-composed even when a provider-native research path exists, depending on approval, budget, and availability.
- `webfetch` never bypasses Site Reader primacy merely because a provider ranks higher for search or extract.
- the `>100 credits` warning and `500 credits` cap remain aligned with routing when Firecrawl or another credit-bearing provider is selected.
- routing keeps requested versus effective provider disclosure separate from final-answer provenance; answer assembly still cites the actual read path.
- command tables and routing docs must mirror the same mappings.
- NL intents and slash commands hit the same dispatcher: "search the web for X" → `websearch`, "extract this page" → `webextract`, "read this URL" → `webfetch`, "research topic" → `webresearch`. Reading intents MUST resolve to `webfetch`, not `websearch`.
- routing disclosure surfaces `warnings_count`, `error_code`, `projection_freshness`, and `projection_health` alongside requested/effective adapter state.
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

Rules:
- provider-routed fetch must not reuse the reserved native Site Reader identity
- intent phrase
- resolved tool key
- routing keeps requested/effective provider disclosure separate from final-answer provenance
- site/page reading is not search
- Keep this section aligned with Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/assistant-chat-design.md#13.2 Web activity and provenance, Plans/FinalGUISpec.md#15.3 Web and diff operation card widget, and Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)
