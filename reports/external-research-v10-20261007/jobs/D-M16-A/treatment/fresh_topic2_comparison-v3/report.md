# D-M16-A — topic 2 comparison: stale-tile display / local retention (fresh)

Stage fresh_topic2_comparison-v3, OPEN_DISCOVERY_BRIEF_ONLY, 2026-10-07. Question: what bounded stale-tile display and retention policies should a small offline map viewer use when a newer tile version exists, compared against the acquisition/refresh topic on their shared substrate? Sources were chosen during work from the shared candidate inventory's leads and freshly captured as sha256-frozen bytes (`sources/index.json`, 7 public primary sources). Static reading only; nothing executed; no live probes. Claims not re-captured here are marked **[shared]** and used only as topic-1 inputs — shared evidence does not settle topic 2.

## Source identities (frozen)
[R5861] RFC 5861 stale-while-revalidate/stale-if-error; [R9111] RFC 9111 HTTP caching; [R9110] RFC 9110 semantics; [SHU] libshumate shumate-file-cache.c 1.7.0; [OSQ] osmdroid SqlTileWriter.java 6.1.20; [MBT] MBTiles 1.3 spec; [LO] leaflet.offline TileLayerOffline.ts v3.2.1. URLs, versions, capture times, sha256, line locators, limits: `sources/index.json`.

## Shared substrate — identity/freshness/reuse invalidation
Every captured store keys tiles flatly by (source, z, x, y) or resolved URL; freshness is not part of the identity: MBTiles `CREATE TABLE tiles(zoom_level,tile_column,tile_row,tile_data)` [MBT line 109] has no freshness column; leaflet.offline keys by URL [LO line 51]; osmdroid by tilesource+index [OSQ line 128]. Freshness lifetime comes from max-age or heuristics [R9111 §4.2.1 line 652, §5.2.2.1 line 1208]; validators (ETag/Last-Modified [R9110 §8.8 lines 3362/3480/3570]) enable cheap conditional checks. Automatic reuse invalidation fires only on non-GET methods [R9111 §4.4 line 1017], so a GET-only viewer gets none: a tile-source/version change must re-key identity explicitly, or old-version tiles persist until retention removes them.

## Dispositions — topic 2
**Stale display: accepted bounded serve-stale; amended stored-first; rejected blocking refresh and ageless display.** Serving the stored tile is the point of an offline viewer; RFC 9111 §4.2.4 line 795 permits stale **while disconnected** (no-cache/must-revalidate/s-maxage still forbid it, line 790 — honor per-source). But leaflet.offline's stored-first `createTile` [LO lines 20→37] reads no age at all — rejected as the pattern and **amended** to: serve stale, record age, trigger background revalidation bounded by stale-while-revalidate semantics [R5861 §3 lines 104–125]. Blocking the display path on refresh is rejected: RFC 5861 revalidation is explicitly non-blocking, and on intermittent links it would blank the map. Unresolved: the concrete window — RFC 5861 is informational (SHOULD, not MUST), and whether real tile sources emit max-age/validators was not probed; absent headers the window degrades to a viewer-owned heuristic constant.
**Retention: accepted bounded purge; rejected unbounded; unresolved expiry authority and eviction order.** Captured code is uniformly bounded: size_limit (default 100000000) + async purge [SHU 356/378/728], or per-tile expires + startup cleanup and purgeCache [OSQ 53/56/102/213/480]. Unbounded keep-everything is rejected — no captured implementation does it. MBTiles 1.3 ships no freshness/retention fields [MBT 109]; schema is viewer-owned. Unresolved: expiry authority (server header vs heuristic vs both) and eviction order (SHU size/rank vs OSQ expiry-time are different policies with no discriminating evidence between them).

## Dispositions — topic 1 (acquisition / refresh; obligations require them; mostly [shared])
**Acquisition: accepted bounded per-tile with skip-existing resume; rejected bulk.** Per-tile acquire→store with skip-existing resumes across drops **[shared: leaflet.offline hasTile/ControlSaveTiles]**; bulk scraping is prohibited by OSMF policy **[shared]** — per-view/session-bounded lists only. Unresolved **[shared]**: queue persistence across restarts (captured code is in-memory).
**Refresh: accepted conditional revalidation; rejected wholesale re-download; applicability unresolved.** Conditional GET with If-None-Match/If-Modified-Since [R9110 lines 5872/5942] against stored validators, scheduled by stored max-age; OSMF documents conditional use **[shared]**. Unresolved: per-source validator/max-age emission; backoff design **[shared: NetworkAvailabliltyCheck has none]**.

## Topic comparison and discriminating checks
Same substrate, different consumers: acquisition/refresh is producer-side (bounds on network volume and work); display/retention is consumer-side (bounds on shown staleness and stored size). One shared freshness record (age + max-age + validator) serves both; the two policies stay independent decisions. Proposed checks (not executed): (1) probe candidate tile endpoints for ETag/Last-Modified/Cache-Control — absent validators degrade refresh to time-based re-download and make the display window a pure heuristic (shared-substrate); (2) change the tile-source version and check whether old-version tiles survive purge — validates the re-key requirement (shared-substrate); (3) serve stale with window = max-age vs a fixed constant and compare shown-staleness bounds (topic-2 display); (4) overfill the store and compare size-rank vs expiry eviction on fresh-tile hit rate (topic-2 retention).

## Material findings (eight, distinct)
1. Flat (source,z,x,y)/URL identity with out-of-band freshness is the shared substrate [MBT 109; LO 51; R9111 §4.2.1 652].
2. Offline stale display is spec-conformant: RFC 9111 §4.2.4 line 795 permits stale while disconnected; line 790 directives can still forbid it per-source.
3. Ageless stored-first display [LO 20→37] is accepted only amended: serve stale + record age + background revalidate [R5861 §3].
4. Blocking refresh on the display path is rejected — RFC 5861 revalidation is non-blocking; blocking would blank the map on intermittent links.
5. Bounded retention exists in captured code (SHU size_limit+purge; OSQ expires+cleanup); MBTiles 1.3 ships neither field — schema is viewer-owned.
6. Expiry authority and eviction order are unresolved: server-header vs heuristic expiry and size-rank vs expiry eviction both have captured precedent, no discriminator.
7. Reuse invalidation does not fire for GET-only viewers [R9111 §4.4 1017]; source/version changes must re-key identity or stale tiles persist.
8. Topic-1 dispositions rest on shared evidence not independently re-verified here (skip-existing resume, bulk prohibition, absent backoff **[shared]**); per-source header emission is the dominant uncertainty for both topics.

## Uncertainties preserved (topic-specific)
Topic 2: expiry authority; revalidate-window normativity (RFC 5861 informational); eviction order; actual header behavior of the tile sources (unprobed). Topic 1: queue persistence; backoff design; byte-range resume moot for small tiles **[shared negative, not re-verified]**. Shared substrate evidence does not settle either topic's policy bounds — those are viewer/product decisions.

## Proposed vs actually executed validation
Executed: 7 public primary sources freshly captured, sha256-frozen, with line locators (`sources/index.json`); every load-bearing claim re-verified in those bytes; static reading only. Proposed but not executed: header probes, source-version re-key trial, serve-stale window comparison, retention eviction comparison — no code executed, no server probed, per constraints.

## Optional leads
stale-if-error as an offline fallback [R5861 §4 line 159]; If-Range partial reuse only for large rasters, not standard tiles; libshumate cache_key namespacing as the re-key mechanism; osmdroid cleanOnStartup as a retention trigger variant.

## Obligation coverage (strings verbatim from INPUT_MAP.json)
| Obligation (verbatim) | Where satisfied |
|---|---|
| "Give a separate disposition for acquisition and refresh." | Topic-1 dispositions, stated separately with distinct accept/reject outcomes. |
| "Give a separate disposition for stale display and retention." | Topic-2 dispositions, stated separately with distinct accept/amend/reject outcomes. |
| "Identify shared identity/freshness dependencies and reuse invalidation." | Shared substrate section (identity keys, freshness lifetime, validators, §4.4 non-firing, re-key requirement). |
| "Preserve topic-specific uncertainties instead of assuming shared evidence settles both." | Uncertainties section; unresolved items kept per disposition; [shared] marking; finding 8. |
| "Return at most eight distinct material findings across the bundle." | Exactly eight numbered findings above. |
| "Deliver a bounded topic comparison and discriminating checks, counting shared discovery and synthesis." | Comparison section: four checks (two shared, two topic-2); shared discovery counted in sources/index.json. |
