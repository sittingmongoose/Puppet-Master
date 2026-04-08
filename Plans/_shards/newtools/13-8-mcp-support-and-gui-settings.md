## 8. MCP Support and GUI Settings

This section is a consumer guide only. `Plans/MCP_Integration.md` is the current MCP SSOT.

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/FinalGUISpec.md

### 8.1 Owner document

- `Plans/MCP_Integration.md` is live canon now; it is not future-tense planned work
- naming, availability, credential binding, config schema, and supported flows defer to that owner

### 8.2 GUI/settings alignment
GUI settings disclose requested versus effective MCP availability, server status, debug affordances, underscore-only tool naming, and the current web-provider stack used by `/web` surfaces.

ContractRef: ContractName:Plans/FinalGUISpec.md#744-settings-unified-panel-specification, ContractName:Plans/Tools.md#11-provider-capability-matrix

Alignment rules:
- the global provider stack is user-changeable in Settings.
- per-operation priority reordering is NOT MVP.
- Settings rows for web-capable providers show availability, support tier, health/error state, and last-failure disclosure.
- help/autocomplete for `/web` exposes the same availability plus support-tier visibility so users can predict whether `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, and `webmap` are currently runnable.
Firecrawl alignment note:
- Provider ID `firecrawl`; Display name `Firecrawl`.
- Default priority is below Exa, Tavily; above DDG (user-adjustable).
- Default state is disabled (requires API key or self-hosted URL).

ContractRef: ContractName:Plans/Tools.md#11-provider-capability-matrix, ContractName:Plans/FinalGUISpec.md

Rules:
- provider order shown here mirrors the user-configurable global provider stack
- Keep this consumer note pointed at Plans/Tools.md#11. Provider capability matrix and Plans/FinalGUISpec.md#7.4.4 Settings (Unified) panel specification
### 8.2.1 Cited-search and search-provider note

Older cited-search framing is not normative. MCP-backed search surfaces defer to the MCP owner doc and the web/provider owner docs; this section no longer acts as an owner landing for search-provider canon.

ContractRef: ContractName:Plans/Tools.md#12-web-tool-routing-algorithm, ContractName:Plans/FinalGUISpec.md#744-settings-unified-panel-specification

Required note:
- `/web` help/autocomplete names the currently available providers, their support-tier posture, and any last-failure or setup blockers.
- provider order shown here mirrors the user-configurable global provider stack from Settings rather than implying immutable per-operation order.
- cited-search wording does not replace provider capability, routing, provenance, or billing canon owned elsewhere.
### 8.3 Research session variant reference

Research-session behavior references the shared `research_session` contract in `Plans/Section15_MVP_Promoted_Features_Spec.md`; MCP settings do not redefine it.
