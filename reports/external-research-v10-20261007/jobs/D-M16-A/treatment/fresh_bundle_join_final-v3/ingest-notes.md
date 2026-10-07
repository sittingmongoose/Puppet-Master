# D-M16-A fresh_bundle_join_final-v3 — ingest notes & scope checklist (ticket 1 of 4)

Stage: fresh_bundle_join_final-v3 (treatment), OPEN_DISCOVERY_BRIEF_ONLY. Ingested 2026-10-07 during the
22:08:23Z–22:28:23Z stage window (admission-timing.json: prospective_admitted_at 22:08:23.543415Z,
stage deadline 22:28:23.543415Z, hard/common deadline 22:41:56.716615Z; no reset).

## Scope checklist — every INPUT_MAP-listed path read

| INPUT_MAP field | Path | Status |
|---|---|---|
| original_brief | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M16-A/inputs/brief.md | read in full |
| original_source_manifest | /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M16-A/inputs/sources.json | read; intentionally empty (`sources: []`, open-discovery note) |
| predecessors[0].report | jobs/D-M16-A/treatment/fresh_topic1_comparison-v3/report.md | read in full |
| predecessors[0].source_index | jobs/D-M16-A/treatment/fresh_topic1_comparison-v3/sources/index.json | read; 3 entries (MTD, CURL, OSMH) |
| predecessors[0].source_directory bytes | osmdroid-maptiledownloader-6.1.20.java, curl-manpage.html, osm-tile-headers-20261007.txt | present; sha256+size re-verified against index — all OK |
| predecessors[1].report | jobs/D-M16-A/treatment/fresh_topic2_comparison-v3/report.md | read in full |
| predecessors[1].source_index | jobs/D-M16-A/treatment/fresh_topic2_comparison-v3/sources/index.json | read; 7 entries (R5861, R9111, R9110, SHU, OSQ, MBT, LO) |
| predecessors[1].source_directory bytes | rfc5861-swr-sie.txt, rfc9111-http-caching.txt, rfc9110-http-semantics.txt, libshumate-file-cache-1.7.0.c, osmdroid-sqltilewriter-6.1.20.java, mbtiles-1.3-spec.md, leaflet-offline-TileLayerOffline.ts | present; sha256+size re-verified against index — all OK |
| (assignment-required) admission-timing.json | this job dir | read (deadline facts above) |
| this job's own sources/ | fresh_bundle_join_final-v3/sources/ | empty; to be filled by independent capture (ticket 2) |

## Disallowed paths — confirmation of NOT opened

- No sibling answer of this stage; no control/treatment counterpart arm of the bundle join or of either topic stage.
- No v1/v2 science or failure artifacts; no evaluator facts; no root failure analysis.
- No other cases, reviews, helpers, campaign or history files.
- `fresh_shared_discovery-v3/` (the 12-entry shared candidate inventory the topic-1 report cites) is **not** listed
  in this job's INPUT_MAP predecessors → **not opened**. Its citations are carried below strictly as
  predecessor-asserted inherited evidence, never as bytes I verified. Predecessor claims that they re-verified
  those bytes are recorded as their claims, not as fact.

## Extraction — Topic 1: bounded resumable tile acquisition/refresh under intermittent links

### Accepted (predecessor disposition, with conditions)
- **Acquisition: bounded per-tile skip-existing + capped exponential-backoff retry.**
  - Resume granularity is per tile, not byte-range: leaflet.offline downloadTile→saveTile keyed by URL with
    `hasTile` skip [LO-TM:84,97,206 — inherited]; osmdroid saveFile keyed tilesource+index [OSQ:128];
    libshumate store_tile_async [SHU:957 — inherited]. MapTileDownloader is redirect-aware
    (redirectCount, CantContinueException [MTD:154,172,197]) yet has **no retry/backoff**.
  - Retry shape from public primary semantics: exponential backoff 1 s doubling to a 10-minute cap,
    server `Retry-After` honored, total time bounded by `--retry-max-time` [CURL:2764-2765,1884].
  - Bounds: OSMF policy prohibits bulk downloading ("scraping") [OSMP — inherited]; viewport/session-bounded
    computed tile lists [LO-CS:139 — inherited] are the compliant pattern.
  - Conditions: small raster tiles; bounds are policy- and session-scoped; skip-existing keys on tile identity.
- **Refresh: conditional revalidation.** Conditional GET (If-None-Match/If-Modified-Since [R9110 §13.1.2–13.1.3])
  scheduled by stored max-age [R9111 §4.2]; **amended** by live capture: canonical OSM emits `etag`,
  `cache-control: max-age=526616, stale-while-revalidate=604800, stale-if-error=604800`, `expires`, `age: 11504`,
  varnish HIT [OSMH:3,4,6,15] — so conditional refresh is supported for OSM-class sources today, narrowing the
  predecessor uncertainty from "header emission unverified" to "per-source variation" (single URL, single time,
  dynamic CDN response). stale-if-error is the documented offline fallback [R5861 §4]. Degrades to time-based
  re-download when headers are absent. Connectivity gating in captured code is backoff-free [OSN:33 — inherited];
  backoff is viewer-owned per [CURL].

### Topic-1-specific uncertainties (preserved)
- Header emission across **other** sources (one probe only; dynamic per CDN node/time).
- Acquisition-queue persistence across restarts — no captured implementation (in-memory).
- Byte-range resume: rejected as default for small tiles; kept as optional lead for large rasters
  (`accept-ranges: bytes` advertised [OSMH:12]).
- Backoff design details (from topic-2 arm, shared-marked): captured clients have none to copy.

### Negative leads (topic 1)
- No captured client byte-ranges small tiles. Captured clients ship no backoff [MTD; OSN]. Bulk/mirror
  acquisition prohibited [OSMP].

## Extraction — Topic 2: bounded stale-tile display/retention when a newer tile version exists

### Accepted (predecessor disposition, with conditions)
- **Display: bounded serve-stale + background revalidate.** RFC 9111 §4.2.4 line 795 permits serving stale
  **while disconnected**; line 790 per-source directives (no-cache/must-revalidate/s-maxage) can still forbid it.
  Revalidate window bounded by stale-while-revalidate semantics [R5861 §3 lines 104–125].
  leaflet.offline stored-first `createTile`→`getTileImageSource` reads **no age at all** [LO:20→37] — rejected as
  pattern, **amended** to: serve stale + record age + background revalidate; a freshness field beside the blob is
  required (counterpart: `mark_up_to_date` [SHU:543]). Blocking refresh on the display path is rejected
  (would blank the map on intermittent links; RFC 5861 revalidation is explicitly non-blocking).
  Conditions: per-source directives may forbid stale serving; window value is a product decision.
- **Retention: bounded purge.** libshumate size_limit (default 100000000, line 356) + purge_cache_async [SHU:378,728];
  osmdroid per-tile expires + cleanOnStartup + runCleanupOperation + purgeCache [OSQ:53,56,102,213,480].
  Unbounded keep-everything rejected (no captured implementation does it). MBTiles 1.3 ships no
  freshness/retention columns [MBT:109] → schema is viewer-owned.

### Topic-2-specific uncertainties (preserved)
- Expiry authority: server header vs heuristic vs both.
- Eviction order: size/rank (SHU) vs expiry-time (OSQ) — captured precedent on both sides, no discriminator.
- Revalidate-window normativity: RFC 5861 is informational (SHOULD, not MUST).
- Actual header behavior of tile sources (unprobed in the topic-2 arm; topic-1's OSMH probe covers only one source).

### Negative leads (topic 2)
- Ageless stored-first display [LO:20→37]; blocking display-path refresh; unbounded retention — all rejected.

## Shared substrate (identity / freshness / reuse invalidation) — obligations 3
- Flat identity: (source, z, x, y) or resolved URL; freshness is out-of-band metadata [MBT:109; LO:51/LO-TM:97;
  OSQ:128; SHU:378].
- Freshness lifetime from max-age or heuristics [R9111 §4.2.1 line 652, §5.2.2.1 line 1208]; validators
  ETag/Last-Modified enable cheap conditional checks [R9110 §8.8 lines 3362/3480/3570].
- Automatic reuse invalidation fires only on non-GET methods [R9111 §4.4 line 1017] → a GET-only viewer gets none;
  a source/version change must re-key identity explicitly, else old-version tiles persist until retention removes them.
- One shared freshness record serves two **independent** policies: topic 1 binds it on network work (producer-side:
  skip/validate/retry); topic 2 binds it on user-visible truth (consumer-side: what may be shown stale, what is evicted).

## Inherited-evidence map (drives ticket 2 spot-checks and ticket 3 marking)
- **Bytes present in listed predecessor sources (independently checkable this stage):** rfc5861, rfc9111, rfc9110,
  libshumate-file-cache, osmdroid-sqltilewriter, mbtiles-spec, leaflet-offline-TileLayerOffline,
  osmdroid-maptiledownloader, curl-manpage, osm-tile-headers (10 files, all hash-verified above).
- **Shared-inventory citations WITHOUT bytes in listed predecessors (predecessor-asserted only):**
  [LO-TM] leaflet.offline manager (hasTile/downloadTile/saveTile), [LO-CS] ControlSaveTiles viewport list,
  [OSMP] OSMF tile usage policy, [OSN] osmdroid NetworkAvailabliltyCheck.
  The join must carry these as inherited claims with their locators, or re-derive them from allowed public
  primaries if re-cited — never presented as directly verified here.
- Conflicting-emphasis note for the join: topic-1 arm spot-checked a few topic-2 locators (LO-TL:20, SHU:543) but
  explicitly did **not** re-verify topic 2 beyond that; topic-2 arm marks all topic-1 claims **[shared]** and
  unverified. Shared evidence does not settle either topic's policy bounds (window value, expiry authority,
  eviction order, queue persistence) — those stay topic-specific uncertainties.

## Proposed vs actually executed (predecessor-side, as they report it — not re-verified here)
- Topic-1 arm executed: 12/12 shared-byte hash re-verification (their claim), 3 new captures indexed,
  1 single-URL header probe [OSMH], 5 locator spot-checks (LO-TM:206, LO-TL:20, SHU:543, R9111 §4.4, R5861 §3.1).
- Topic-2 arm executed: 7 fresh sha256-frozen captures with line locators; static reading only; no probes.
- Proposed but not executed by both: multi-endpoint header surveys; kill/restart resume run; failure-injection
  backoff run; serve-stale window comparison (max-age vs constant); eviction-order comparison; source-version
  re-key trial.
