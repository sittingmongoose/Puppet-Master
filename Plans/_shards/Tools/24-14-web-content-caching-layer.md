## 14. Web content caching layer
This section defines the canonical contract for this surface.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- adapter_id
- 500 MB

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- If request includes `actions`, skip cache entirely (always fresh-execute)
- Cache STORE still applies to the final result after actions execute
- PM cache takes precedence for serving cached content
- Firecrawl cache serves as provider-side optimization only
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`
