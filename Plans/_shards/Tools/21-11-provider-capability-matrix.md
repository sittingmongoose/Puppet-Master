## 11. Provider capability matrix

### 11.1 Provider classes, defaults, and fallback disclosure
This section defines the canonical contract for this surface.

Core rules:
- The global provider stack is user-changeable in Settings, while per-operation priority reordering is not MVP and the MVP priority order must not be treated as immutable product policy.
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- DuckDuckGo capability rows must preserve native-ish search, PM-composed research/fetch/extract, and partial crawl behavior instead of flattening those cells to unsupported.
- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- global provider stack is user-changeable in Settings
- per-operation priority reordering is NOT MVP
- global MVP provider priority is not immutable product policy
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- fallback-only
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`
- native (model)
- pm-composed
- DuckDuckGo `websearch` is `native-ish`
- DuckDuckGo `webresearch` is `pm-composed`
- DuckDuckGo `webfetch` / `webextract` remain PM-composed or partial rather than flattened to `unsupported`
- DuckDuckGo partial crawl behavior must not disappear
- display label `Google`
- Google is a pluggable adapter slot
- Google official search is not a strategic backend
- Google `webfetch` keeps the pm-composed support semantics from the ledger
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- availability plus support-tier visibility in Settings
- availability plus support-tier visibility in `/web` help/autocomplete
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
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
