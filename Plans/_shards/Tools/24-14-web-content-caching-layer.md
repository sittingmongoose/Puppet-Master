## 14. Web content caching layer

Web caching is PM-owned and storage-backed. Provider caches are subordinate hints beneath this contract.

ContractRef: ContractName:Plans/storage-plan.md

#### Canonical cache identity

The durable cache record stores `(normalized_url, formats_hash, adapter_id)`, but lookup is intentionally two-phase.

Two-phase lookup rules:
- Step 4 of routing checks `(normalized_url, formats_hash)` only
- after provider selection, PM validates `adapter_id` against the chosen provider
- mismatched provider entries are discarded rather than served under the wrong effective provider
- If request includes `actions`, skip cache entirely (always fresh-execute) because interactive state is not cache-safe

#### TTL defaults

| Operation | Default TTL |
|---|---|
| `webfetch` | `4 hours` |
| `webextract` | `4 hours` |
| `webcrawl` | `24 hours` |
| `webmap` | `24 hours` |
| `websearch` | `1 hour` |
| `webresearch` | `Not cached` |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md#12-web-tool-routing-algorithm

#### State vocabulary and invalidation

State vocabulary:
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`

Rules:
- PM cache takes precedence for serving cached content.
- Firecrawl cache serves as provider-side optimization only.
- Cache STORE still applies to the final result after actions execute.
- PM cache precedence remains above provider-local cache hints
- invalidation is available by URL, domain, and project scope
- expired entries may still be retained for change detection and surfaced as `expired_used_for_diff`
- per-project storage survives restart and defaults to a `500 MB` footprint ceiling
- provider hints such as Firecrawl `storeInCache` and `minAge` do not replace PM cache identity, TTL ownership, or invalidation behavior

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
