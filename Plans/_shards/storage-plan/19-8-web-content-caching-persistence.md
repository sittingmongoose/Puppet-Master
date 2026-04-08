## 8. Web content caching persistence

Storage owns the durable cache record, TTL defaults, and state vocabulary for the web family.

ContractRef: ContractName:Plans/Tools.md

### 8.1 Durable record shape

Each cache record stores:
- `normalized_url`
- `formats_hash`
- `adapter_id`
- `content_ref`
- `content_hash`
- `fetched_at_utc`
- `expires_at_utc`
- `last_accessed_at_utc`
- lightweight metadata needed for change detection and LRU eviction

### 8.2 Two-phase lookup

Storage persists the full `(normalized_url, formats_hash, adapter_id)` identity, but runtime lookup is intentionally split:
- pre-selection lookup checks `(normalized_url, formats_hash)` only
- after routing resolves the effective provider, the cached `adapter_id` is validated against that provider
- mismatched provider entries are discarded and replaced with a fresh fetch

ContractRef: ContractName:Plans/Tools.md#12-web-tool-routing-algorithm, ContractName:Plans/Tools.md#14-web-content-caching-layer

### 8.3 TTL defaults and state vocabulary

| Operation | Default TTL |
|---|---|
| `webfetch` | `4 hours` |
| `webextract` | `4 hours` |
| `webcrawl` | `24 hours` |
| `webmap` | `24 hours` |
| `websearch` | `1 hour` |
| `webresearch` | `Not cached` |

State vocabulary:
- `hit`
- `miss`
- `bypassed`
- `expired_used_for_diff`

### 8.4 Invalidation and retention

- invalidation scopes are URL, domain, and project
- expired records may still retain hashes and metadata for diff/change detection
- action-bearing fetches bypass lookup and are never keyed as if the page were static
- the per-project default storage ceiling remains `500 MB`
- provider-local cache hints remain subordinate to this PM-owned persistence contract

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md
