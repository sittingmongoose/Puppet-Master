## 11. Provider capability matrix

### 11.1 Provider classes, defaults, and fallback disclosure
Provider classes are displayed as:
- `account-backed` - model providers that reuse existing PM account auth for web capabilities.
- `API-backed` - Exa, Tavily, Firecrawl, and the pluggable adapter slot with display label `Google`.
- `no-key` - DuckDuckGo fallback, always available without setup.

Defaults and ordering:
- the default global provider stack is `Exa > Tavily > Firecrawl > Anthropic/OpenAI > Google > DuckDuckGo`.
- Firecrawl identity: Provider ID `firecrawl`; Display name `Firecrawl`; Default priority below Exa, Tavily; above DDG (user-adjustable); Default state disabled (requires API key or self-hosted URL).
- the global provider stack is user-changeable in Settings.
- per-operation priority reordering is NOT MVP.
- the global MVP provider priority is a default, not immutable product policy.

Fallback disclosure:
- `provider_fallback_summary` stays visible in chat and audit logs whenever a fallback occurs.
- provider fallback is explanatory rather than silent; rate-limit and health failures include a user-facing recovery hint.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md

Rules:
- provider_id
- display_name
- Keep this owner section feeding Plans/FinalGUISpec.md#7.4.4 Settings (Unified) panel specification, Plans/Models_System.md#4.5 Web tool provider capability alignment, and Plans/newtools.md#8.2 GUI/settings alignment
### 11.2 Support-tier vocabulary

Support tiers are:
- `native` - provider exposes the operation as a first-class path that PM can map directly.
- `native (model)` - the selected model/provider already exposes the capability and PM reuses the same account/auth surface.
- `native-ish` - provider has a near-equivalent path but PM still normalizes or supplements it.
- `pm-composed` - PM assembles the behavior from lower-level provider/search/fetch capabilities.
- `fallback-only` - provider path exists only as backup and is not the preferred posture.
- `partial` - provider supports only a reduced subset of the operation family.
- `unsupported` - no supported path exists in MVP.

Capability tier and routing posture are separate dimensions. Site Reader primacy for `webfetch` is a routing rule, not a capability erasure.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/assistant-chat-design.md

### 11.3 Capability matrix

| Operation | Exa | Tavily | Firecrawl | Anthropic / OpenAI | Google | DuckDuckGo |
|---|---|---|---|---|---|---|
| `websearch` | `native` | `native` | `native` | `native (model)` | `native` | `native-ish` |
| `webfetch` | `native-ish` | `native-ish` | `native-ish` | `fallback-only` | `pm-composed` | `pm-composed` |
| `webextract` | `native-ish` | `native` | `native` | `pm-composed` | `unsupported` | `pm-composed` |
| `webresearch` | `native-ish` | `native` | `native` | `pm-composed` | `pm-composed` | `pm-composed` |
| `webcrawl` | `native` | `native` | `native` | `unsupported` | `unsupported` | `partial` |
| `webmap` | `unsupported` | `native` | `native` | `unsupported` | `unsupported` | `unsupported` |

Matrix interpretation:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy.
- Tavily `webfetch` capability is not erased by Site Reader primacy.
- Exa `webfetch` capability is not erased by Site Reader primacy.
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`.
- DuckDuckGo `websearch` is `native-ish`; DuckDuckGo `webresearch` is `pm-composed`; DuckDuckGo `webfetch` / `webextract` remain PM-composed rather than flattened to `unsupported`; DuckDuckGo partial crawl behavior remains visible.
- the display label is `Google`; it is a pluggable adapter slot, not a strategic backend requirement, and Google `webfetch` keeps the `pm-composed` support semantics.
- `fallback-only` is reserved for true backup-only paths and must not replace real fetch capability where the provider has a real fetch path.
- model-native rows reuse the already-selected model account/auth when that provider exposes search or browse capability; PM does not create a second auth silo for the same model account.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
