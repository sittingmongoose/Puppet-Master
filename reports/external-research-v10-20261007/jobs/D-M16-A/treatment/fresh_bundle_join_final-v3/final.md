# D-M16-A bundle join — bounded tile acquisition/refresh and stale display/retention (fresh_bundle_join_final-v3)

Join of the two predecessor topic comparisons, independently verified: 10 predecessor-frozen bytes hash+size checked; 28 cited locators re-checked (26 pass, 2 refinements, 1 refuted — `spotcheck.md`); 5 fresh captures in `sources/index.json` incl. one bounded header re-probe. Static reading + single-request probes only; nothing executed. Keys **[bracketed]** resolve to this stage's `sources/index.json` or the predecessor indices (bytes verified, locators spot-checked).

## Topic 1 — acquisition (ACCEPTED: bounded per-tile skip-existing + capped retry; REJECTED: bulk, byte-range default)
Every captured client acquires per tile keyed by identity — leaflet.offline `downloadTile`→`saveTile` by URL with `hasTile` skip **[LO-TM:84,97,206,220]**; osmdroid `saveFile` by tilesource+index **[OSQ:128]**; libshumate `store_tile_async` **[SHU:378]**. Resume unit = the tile; no captured client byte-ranges small tiles (negative lead; byte-range stays optional for large rasters — `accept-ranges: bytes` advertised **[OSMH:12][probe2:9]**). Retry, **AMENDED**: osmdroid 6.1.20 ships a per-URL backoff gate (`UrlBackoff.shouldWait/next` **[MTD:14,47,194,199]** — predecessor "no backoff" refuted by its own bytes); connectivity gating is backoff-free **[OSN:33]**; the tuned shape — exponential 1 s→10-min cap, `Retry-After` honored, total-time bound — is viewer-configured **[CURL:2764-2765,1884]**. Boundedness: OSMF policy prohibits bulk download ("scrape") and prefetch **[OSMP:75]**; blocking happens in practice **[probe2:8]**; viewport/session-bounded lists are the compliant pattern **[LO-CS:139,190]**. Conditions: small raster tiles; policy-scoped bounds; identity-keyed skip. Unresolved: queue persistence across restarts (no captured implementation).

## Topic 1 — refresh (ACCEPTED: conditional revalidation; AMENDED: header emission varies per request/client; UNRESOLVED: per-source survey)
Conditional GET with validators **[R9110:5872,5942]** scheduled by stored max-age **[R9111:652,1208]**. The predecessor's probe caught `etag` + `max-age` + stale-while-revalidate/stale-if-error on the canonical OSM endpoint **[OSMH:3,4]**; my same-URL re-probe returned `x-blocked: Access denied` + `cache-control: no-cache` **[probe2:4,8]** — emission is unstable even for one source and can be withheld behind policy gating. Conditional refresh when validators are present; **time-based re-download is the designed default** when absent; stale-if-error is the offline fallback **[R5861:159]**. REJECTED: wholesale scheduled re-download as primary. Unresolved: validator/max-age behavior across other sources (one URL, two probes, two outcomes).

## Topic 2 — stale display (ACCEPTED: bounded serve-stale + background revalidate; AMENDED: ageless stored-first; REJECTED: blocking refresh)
RFC 9111 §4.2.4 permits serving stale while disconnected **[R9111:795]**; per-source `no-cache`/`must-revalidate`/`s-maxage` can still forbid it **[R9111:790]**. leaflet.offline's stored-first `createTile` reads no age **[LO:20,37]** — rejected as pattern, amended to: serve stale, record age (freshness field beside the blob; counterpart `mark_up_to_date` **[SHU:543]**), revalidate in background within stale-while-revalidate bounds **[R5861:104-118]**. Blocking display-path refresh is rejected: revalidation is non-blocking; on intermittent links it would blank the map. Conditions: honor per-source prohibitions; window value is a product choice (RFC 5861 is informational — SHOULD, not MUST).

## Topic 2 — retention (ACCEPTED: bounded purge; REJECTED: unbounded; UNRESOLVED: expiry authority, eviction order)
Captured bounds: libshumate `size_limit` (default 100000000) + async purge **[SHU:356,378,728]**; osmdroid per-tile `expires` + startup cleanup **[OSQ:53,56,102]**. Unbounded keep-everything: no captured precedent — rejected. MBTiles 1.3 carries no freshness/retention columns **[MBT:109]**, so retention schema is viewer-owned. Unresolved: expiry authority (server header vs heuristic vs both) and eviction order (size/rank **[SHU]** vs expiry-time **[OSQ]** — precedent both sides, no discriminator).

## Shared substrate — identity, freshness, reuse invalidation
All captured stores key tiles flatly by (source, z, x, y) or resolved URL **[MBT:109][LO:49][OSQ:128]**; freshness is out-of-band metadata from max-age or heuristics **[R9111:652,1208]**, cheaply checkable via validators **[R9110:3362,3480,3570]**. Automatic reuse invalidation fires only on non-GET methods **[R9111:1017]**: a GET-only viewer gets none — a source/version change must re-key identity explicitly, or old tiles persist until retention removes them.

### Finding 1 — The resume unit is per-tile skip-existing on identity; no captured client byte-ranges small tiles **[LO-TM:220][OSQ:128][SHU:378]**.
### Finding 2 — AMENDED: a per-URL backoff gate exists in captured code (osmdroid `UrlBackoff` **[MTD:47,194]**); gating is backoff-free **[OSN:33]**; exponential/Retry-After/total-bound tuning is viewer-owned **[CURL:2764-2765]**.
### Finding 3 — Bulk acquisition is policy-prohibited **[OSMP:75]**, blocks happen in practice **[probe2:8]**; viewport/session-bounded lists are the compliant bound **[LO-CS:139,190]**.
### Finding 4 — OSM-class headers vary per request/client: validators+max-age, then `x-blocked`+no-cache on the same URL **[OSMH:3-4][probe2:4,8]** — conditional refresh when headers exist, time-based re-download as default fallback; cross-source survey open.
### Finding 5 — Stale display while disconnected is spec-permitted **[R9111:795]** with per-source prohibitions **[R9111:790]**; ageless stored-first rejected/amended to serve-stale + recorded age + bounded background revalidate **[R5861:104-118][LO:20,37]**; blocking display-path refresh rejected.
### Finding 6 — Bounded retention has captured precedent (size-cap **[SHU:356,728]** / expiry **[OSQ:53,102]**); MBTiles 1.3 ships neither field — schema viewer-owned **[MBT:109]**.
### Finding 7 — Flat identity with out-of-band freshness **[MBT:109][LO:49]**; GET-only viewers get no automatic reuse invalidation **[R9111:1017]** — source/version changes must re-key.
### Finding 8 — One freshness record (age+max-age+validator), two independent policies: producer-side bounds network work, consumer-side bounds shown staleness and store size; shared evidence does not settle topic-2 window/authority/eviction choices.

## Topic comparison and discriminating checks
Same substrate, different binding point: acquisition/refresh binds freshness on network work (skip/validate/retry — bounded by policy and backoff); display/retention on user-visible truth (what may be shown stale, what is evicted). Proposed, not executed: (1, shared) minimal policy-compliant validator/max-age probes of several endpoints — kept few, since gating blocks aggressive clients; (2, shared) change tile-source version, check old-version tiles survive purge — validates the re-key requirement; (3, T1) kill/restart mid-acquisition — skip-existing completes without duplicates; (4, T1) inject failures — retry waits per a `UrlBackoff`-style gate and stops at the total-time bound; (5, T2) serve stale with window = max-age vs fixed constant — compare shown-staleness bounds; (6, T2) overfill the store — size-rank vs expiry eviction, compare fresh-tile hit rate. Checks 1–2 test the shared substrate; 3–4 topic-1; 5–6 topic-2.

## Proposed vs actually executed
Executed this stage: 10 predecessor bytes hash+size verified; 28 locator spot-checks (26 pass, 2 refinements, 1 refutation); 5 fresh captures incl. one single-URL re-probe (body discarded). Predecessor-reported (captures hash-verified here): the OSMH probe; 10 indexed captures with locators. Not executed by anyone: checks 1–6 — no code executed, no bulk requests.

## Obligation coverage
| Obligation (verbatim) | Where satisfied |
|---|---|
| "Give a separate disposition for acquisition and refresh." | Topic 1 sections. |
| "Give a separate disposition for stale display and retention." | Topic 2 sections. |
| "Identify shared identity/freshness dependencies and reuse invalidation." | Shared substrate; Findings 7–8. |
| "Preserve topic-specific uncertainties instead of assuming shared evidence settles both." | Per-section Unresolved; Finding 8; checks 3–6. |
| "Return at most eight distinct material findings across the bundle." | Exactly eight Findings. |
| "Deliver a bounded topic comparison and discriminating checks, counting shared discovery and synthesis." | Six checks (two shared, two per topic). |

## Source identities
Fresh, sha256-frozen (`sources/index.json`): **[probe2]** OSM tile headers 22:15:39Z; **[OSMP]** OSMF tile policy; **[OSN]** NetworkAvailabliltyCheck 6.1.20; **[LO-CS]** ControlSaveTiles v3.2.1; **[LO-TM]** TileManager v3.2.1. Predecessor-frozen (verified, spot-checked): **[OSMH][MTD][CURL]**; **[R5861][R9111][R9110][SHU][OSQ][MBT][LO]**. Optional leads: byte-range resume for large rasters; If-Range partial reuse; libshumate cache_key namespacing for re-keying; osmdroid cleanOnStartup retention variant.
