## 8. MCP Support and GUI Settings

This section is a consumer guide only. `Plans/MCP_Integration.md` is the current MCP SSOT.

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/FinalGUISpec.md

### 8.1 Owner document

- `Plans/MCP_Integration.md` is live canon now; it is not future-tense planned work
- naming, availability, credential binding, config schema, and supported flows defer to that owner

### 8.2 GUI/settings alignment
This GUI/settings alignment section mirrors the linked owner contract and stays aligned with it.

ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing

Core rules:
- global provider stack is user-changeable in Settings.
- per-operation priority reordering is NOT MVP.
- global MVP provider priority is not immutable product policy.
- row-level health/error disclosure and last-failure messaging remain visible in Settings.
- availability plus support-tier visibility in Settings and availability plus support-tier visibility in `/web` help/autocomplete remain mirrored here.
- MCP availability vocabulary points back to `Plans/MCP_Integration.md`.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
- {server_slug}_{tool_name}

Labels and values:
- GUI/settings alignment
- requested availability
- effective availability
- credential binding

Rules:
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
### 8.2.1 Cited-search and search-provider note
This cited-search and search-provider note is non-normative consumer guidance.

ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Required note:
- cited-search wording does not replace provider capability, routing, provenance, or billing canon owned elsewhere.
- The cited web search contract from §8.2.1 cited web search remains a consumer note only.
- See Plans/newtools.md §8 for full list.
- Plans/MCP_Integration.md is live canon now; it is not future-tense planned work.
- this section is non-normative consumer guidance, not the owner landing for search-provider canon.
### 8.3 Research session variant reference

Research-session behavior references the shared `research_session` contract in `Plans/Section15_MVP_Promoted_Features_Spec.md`; MCP settings do not redefine it.
