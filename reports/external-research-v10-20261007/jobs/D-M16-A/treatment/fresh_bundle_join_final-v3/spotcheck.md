# D-M16-A fresh_bundle_join_final-v3 — independent spot-check record (ticket 2 of 4)

Method: static reading of predecessor-frozen bytes (hash-verified in ticket 1) at their cited locators, plus
five fresh captures of my own into `sources/` (single bounded HTTP requests, read-only, nothing executed,
no downloaded code run). No sibling/counterpart/v1v2/evaluator files touched.

## Fresh captures (sources/index.json, all hash-verified via `sha256sum -c index_hashes.txt`)
1. `osm-tile-headers-probe2-20261007.txt` — re-probe of the canonical OSM tile endpoint (one request, body
   discarded). **Differs from predecessor [OSMH]** (different hash, different content): predecessor 21:45Z capture
   had `etag` + `max-age=526616` + stale-while-revalidate/stale-if-error; my 22:15Z probe returned HTTP 200 with
   `x-blocked: Access denied` (L8), `cache-control: no-cache` (L4), `retry-after: 0` (L3), still `accept-ranges:
   bytes` (L9), varnish HIT. The amended "per-source header variation" uncertainty is confirmed and strengthened:
   validators/max-age can be withheld entirely behind policy gating. Header-absent fallback is not an edge case.
2. `osmf-tile-policy-20261007.html` — OSMF tile policy (current canonical URL from the block message). L75
   prohibits bulk download ("scrape") and prefetch features; L51 block-on-heavy-use; L66/117/79 UA rules.
   Converts inherited [OSMP] → independently held bytes.
3. `osmdroid-networkavailabliltycheck-6.1.20.java` — L16/L33 gating methods; whole-file negative check: no
   retry/backoff/sleep. Converts inherited [OSN:33] → verified (OSN half of the "no backoff" lead stands).
4. `leaflet-offline-ControlSaveTiles-v3.2.1.ts` — L139 `_saveTiles()`, L190 viewport bounds list. Converts
   inherited [LO-CS:139] → verified at the exact cited line.
5. `leaflet-offline-TileManager-v3.2.1.ts` — L84 `downloadTile`, L97 `saveTile`, L206 `hasTile`, L220
   `!(await hasTile(key))` skip-existing. Converts inherited [LO-TM:84,97,206] → verified at the exact cited lines.

## Locator spot-checks against predecessor-frozen bytes (28 checks: 26 PASS, 2 refined, 1 claim refuted)
- RFC 9111: L652 freshness §4.2.1, L790 MUST-NOT-stale directives, L795 disconnected exception, L1017 §4.4
  invalidation, L1208 max-age — all PASS.
- RFC 9110: L3362 validators §8.8, L3480 Last-Modified, L3570 ETag, L5872 If-None-Match, L5942
  If-Modified-Since — all PASS.
- RFC 5861: L104 SWR heading, L107/118 SWR semantics (serve stale while refreshing), L159 stale-if-error — PASS
  (predecessor body cite at L112 was a blank line; semantic text is at L107/118 — locator refinement, claim intact).
- MBTiles 1.3 L109 CREATE TABLE with no freshness/retention columns — PASS.
- leaflet.offline TileLayerOffline: L20 createTile, L37 stored-first getTileUrl — PASS; `_getStorageKey` is at
  **L49**, not L51 as the predecessor index said — locator refinement, claim intact (key = resolved tile URL).
- libshumate 1.7.0: L356 size_limit=100000000, L378 new_full, L543 mark_up_to_date, L728 purge_cache_async — PASS.
- osmdroid SqlTileWriter: L53 COLUMN_EXPIRES, L56 cleanOnStartup, L102 runCleanupOperation, L128 saveFile — PASS.
- OSMH predecessor headers: L3 max-age+SWR/SIE, L4 etag, L12 accept-ranges, L15 age — PASS (bytes as captured).
- curl manpage: L2764 exponential backoff (1s→10-min cap), L2765 Retry-After compliance, L1884 --retry-max-time — PASS.

## Refuted predecessor claim (material amendment for the final)
**"MapTileDownloader … contains no retry/backoff" / material finding 3's "[MTD]" half — REFUTED.** The frozen
bytes contain `import org.osmdroid.util.UrlBackoff` (L14), `private final UrlBackoff mUrlBackoff` (L47),
`if (mUrlBackoff.shouldWait(tileURLString))` (L194), `mUrlBackoff.next(tileURLString)` (L199): osmdroid 6.1.20
ships a per-URL backoff gate on the download path. The correct statement: a per-URL wait-gate exists in captured
client code (osmdroid UrlBackoff); NetworkAvailabliltyCheck is backoff-free (verified); the tuned exponential/
Retry-After/total-bound shape is still viewer-owned per [CURL]. The join must amend, not repeat, finding 3.

## Inherited-evidence status after this ticket
[OSMP], [OSN], [LO-CS], [LO-TM] — now independently verified (fresh bytes above).
Still predecessor-asserted only: nothing material remains without either allowed-dir bytes or fresh captures.
