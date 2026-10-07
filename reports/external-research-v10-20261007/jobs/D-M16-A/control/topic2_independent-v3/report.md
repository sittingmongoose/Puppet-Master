# D-M16-A Topic 2 (independent): stale-tile display and local retention

Stage `D-M16-A/control/topic2_independent-v3`, open discovery (`OPEN_DISCOVERY_BRIEF_ONLY`). No other topic's answer, shared inventory, or predecessor report was consulted; evidence is 7 public primaries captured with SHA-256 and locators in `sources/index.json`. Interaction conditions are left unjoined for the later merge.

## Question and scope
A small offline raster viewer holds downloaded tiles; a newer version exists server-side. Decide (a) when it may display a locally stale tile and (b) how long it retains superseded versions. Bounded diagnostic, not an application plan.

## Material findings (8)
- **F1 — Tile identity carries no version.** Slippy z/x/y keys identify placement, not content revision [osm-wiki-slippy-tilenames.html: z/x/y scheme, zoom-level table]. "A newer version exists" is knowable only from an out-of-band freshness signal; the viewer cannot detect staleness from identity alone. Condition: standard raster schemes; vector/MBTiles out of scope.
- **F2 — Freshness must be declared; validation is the fallback.** RFC 9111 makes the reuse window explicit (`max-age`/`Expires`) and forbids reuse of a stale response without successful validation (`must-revalidate`, `no-cache`) [rfc9111-http-caching.txt §4, §5.2]. Freshness is server-asserted metadata stored beside the tile, never inferred. Condition: headers must have been captured at acquisition.
- **F3 — HTTP defines bounded stale display.** `stale-while-revalidate` permits serving a stale tile while revalidation runs in the background; `stale-if-error` covers failed revalidation [rfc5861-stale.txt §3–4]. The standards-based pattern for the display question. Conditions: Informational RFC, not universally implemented; bounds are wall-clock seconds, not tile generations.
- **F4 — Server tiers declare different freshness for the same tile.** Mapbox raster tiles set a browser cache TTL of 12 h against a CDN TTL of 5 min [mapbox-raster-tiles-api.html: caching section]. An offline viewer should adopt the stricter client-facing TTL since it cannot act as the CDN. Condition: vendor-specific numbers; the tier-split pattern, not values, generalizes.
- **F5 — Production tile servers compute expiry per tile, not per layer.** mod_tile "estimates when the tile is next likely to be rendered and adds the appropriate HTTP cache expiry headers," a configurable heuristic [mod_tile-README.rst: tile-expiry section]. Expiry is heterogeneous (busy areas go stale sooner). Condition: heuristic values are deployment-specific.
- **F6 — A recognized public floor for local retention exists.** OSMF's policy: cache tiles per HTTP headers or "at least 7 days" if headers cannot be read, and honor Cache-Control/Expires/ETag [osmf-tile-policy.html: caching section]. A bounded default TTL is normal practice. Conditions: binds OSMF endpoints; not generalizable without checking each provider.
- **F7 — Offline storage libraries give mechanics, not policy.** leaflet.offline makes maps "still available when you are offline" and stores tiles in browser storage via its idb dependency ("To store the tiles with promises") [leaflet-offline-README.md: overview and Dependencies]; its README documents no version tracking, staleness, or eviction rule (the API list itself is only generated from the repo, not captured). Retention is a viewer-level decision. Condition: single-library sample; storage mechanics assumed transferable to any store.
- **F8 — Nothing in HTTP governs offline retention of superseded versions.** RFC 9111's model ends at validation or discard [rfc9111-http-caching.txt §4]; keeping the previous version is outside the standard, so any keep-N/keep-by-age rule is a local design decision needing its own quota justification. Condition: absence of evidence, noted as such, not contradiction.

## Dispositions
**Stale display — ACCEPT, bounded.** Display a stale tile (a) during its `stale-while-revalidate` window after a check finds a newer version, or (b) whenever the viewer is offline at render time, with a visible "as of" freshness marker. Do not keep displaying stale when revalidation definitively fails with 404/410 (tile removed); other failures fall back to stale display per `stale-if-error` [F2, F3].

**Retention — ACCEPT, bounded.** Keep the current tile per its display bounds; keep exactly one superseded version per tile until the next successful revalidation completes (rollback window), then evict the oldest; enforce a quota with LRU eviction of superseded tiles first. Quota numbers are unresolved (see ledger). Mechanism: any storage backend supporting deletion of stored tiles; the capture establishes offline storage mechanics only [F7].

**Acquisition and refresh — AMENDED (topic-1 adjacent, bounded).** Acquisition scheduling belongs to topic 1. For this topic, refresh is conditional revalidation (If-None-Match/If-Modified-Since against ETag/Last-Modified), the header-honoring flow the sources describe [F2, F6]. Amendment: refresh outcomes here are consumed as display/retention events, not fetch scheduling.

**Shared identity/freshness dependencies and reuse invalidation.** Both topics key on the same z/x/y identity with no embedded version [F1] and both depend on one freshness record per tile. Reuse invalidation: a single revalidation result (200 → new version; 304 → unchanged) should atomically update display state and trigger retention pruning — one invalidation event, two consumers. Preserved condition: whether topic 1's resumable acquisition reuses that same record is a join-time question.

## Topic-specific uncertainties (preserved, not assumed settled by shared evidence)
- Server-side "newer version exists" is unverifiable while offline; SWR bounds are approximations [F3].
- Vendor TTLs are not generalizable [F4]; per-tile heuristics vary by deployment [F5].
- The 7-day floor is provider policy, not a universal norm [F6].
- Optimal retention depth and quota are unresolved; no captured evidence addresses rollback value.
- Whether `stale-if-error` should govern non-404/410 revalidation failures is unresolved.

## Topic comparison and discriminating checks (bounded; topic 1 known only from the brief)
Topic 1 decides when bytes move (resumable acquisition/refresh under intermittent links); topic 2 decides what is shown and kept (stale display/retention of superseded versions). Shared discovery: identity scheme (F1), header freshness (F2), conditional revalidation (F6). Discriminating checks: (1) kill the link mid-refresh — topic 1 fails into resume; topic 2 must still render the stale tile with no network attempt. (2) Serve 304 — topic 1 counts no bytes; topic 2 leaves display state and retention untouched. (3) Serve 200 with new content — topic 1 records completion; topic 2 swaps display at next render and demotes the old version to the rollback slot. Interaction conditions preserved for join: ownership of the shared freshness record; whether retention eviction may discard tiles topic 1 still needs for resume.

## Validation — proposed vs executed
Executed: 7 primaries captured with SHA-256, versions, locators, limits (`sources/index.json`, checksums verified); locator spot-checks (RFC 5861 SWR, Mapbox TTLs, mod_tile expiry lines, OSMF sentences). Proposed, not executed: a fixture viewer implementing bounded SWR + keep-1 rollback passing the three discriminating checks; measuring real TTL distributions.

## Disposition ledger
- **Accepted:** stale display via bounded SWR + offline marker; retention keep-1 + LRU quota eviction.
- **Amended:** acquisition/refresh narrowed to conditional revalidation, respecting the topic-1 boundary.
- **Rejected:** a fixed global TTL for all layers (contradicted by per-tile expiry, F5); unbounded retention (unsupported and quota-unsafe, F8).
- **Unresolved:** quota values; `stale-if-error` scope; rollback depth; offline detectability of newer versions.
