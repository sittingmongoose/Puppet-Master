# D-M16-A fresh_bundle_join_final-v3 — joined bundle: tile acquisition/refresh and stale display/retention

Join of `topic1_independent-v3` and `topic2_independent-v3` (the listed predecessor comparisons) over their legitimate primary sources: 10 unique documents reused from listed predecessor captures, SHA-256 independently recomputed, all matching (14 files checked; RFC 9111, RFC 5861, OSMF policy byte-identical across arms). Predecessor bindings were not treated as truth: every load-bearing claim was re-spot-checked against the bytes (`sources/index.json` holds locators, limits, one amendment). 8 findings; word count exceeds the 1100 soft ceiling only through retained conditions/citations — the brief forbids omitting governing conditions to fit it.

## Dispositions

**Acquisition — ACCEPTED with amendment (topic 1).** Bounded concurrent whole-tile GET. Range resumability stays conditional: tiles are small (~10–40 KB) and endpoint Range support is unverified, so resume runs at bundle/region level until an `Accept-Ranges`/206 probe proves per-tile support (RFC 9110 §14, §15.5.17). Retries honor `Retry-After` under a token-bucket quota, exponential backoff plus jitter (AWS precedent). OSMF policy bounds acquisition by rule, not only link state: identification, no bulk downloading, caching per headers.

**Refresh — ACCEPTED (topic 1), amended at join.** Conditional GET: `If-None-Match`/ETag preferred; `If-Modified-Since` (1-second resolution) fallback; 304 freshens without payload (RFC 9111 §4.3); 200 replaces entry and validators; full re-download only if no validator was captured. Backoff on 429/503 per `Retry-After`. Join amendment: refresh outcomes are consumed as display/retention events, not fetch scheduling.

**Stale display — ACCEPTED, bounded (topic 2).** Display a stored tile within a bounded `stale-while-revalidate` window while revalidation runs, and whenever offline at render time, with a visible "as of" marker (RFC 5861; RFC 9111 §4.2.4 legitimizes stale serving on disconnect/failure). Revalidation failure other than 404/410 → `stale-if-error` continues stale display; definitive 404/410 (tile removed) ends it.

**Retention — ACCEPTED, bounded, cap unresolved (topic 2).** Keep the current version per display bounds; keep exactly one superseded version per tile as a rollback slot until the next successful revalidation completes; store quota with LRU eviction of superseded versions first. No captured HTTP source imposes a storage bound; `mod_tile expiry: 86400` (1 day) is the only captured numeric precedent; OSMF's "at least 7 days" floor is provider policy, not a norm. Retention is independent of display staleness; quota numbers unresolved.

## Shared identity/freshness dependencies and reuse invalidation

Slippy z/x/y keys placement, not content revision — no version embedded. Identity must carry layer/style/revision plus stored validators (`ETag`/`Last-Modified`) and the freshness record (RFC 9111 §4.2); bare z/x/y conflates "newer version" with another layer's stale hit, breaking both topics. Refresh (topic 1) writes the freshness state display (topic 2) reads. Reuse invalidation: one event, two consumers — revalidation atomically updates display state and triggers retention pruning; 200 swaps display at next render and demotes the old version to the rollback slot; 304 leaves both untouched. Join interaction rules: (a) refresh owns the freshness record, display/retention read-only; (b) eviction never discards in-flight or partially acquired entries topic 1 needs to resume; (c) mid-refresh link loss is simultaneously a topic-1 resume event (quota/backoff) and a topic-2 stale-display event — no network attempt from the display path.

## Material findings (8)

1. **Conditional GET with ETag/`If-None-Match` is the shared refresh primitive**; 304 freshens without payload; `If-Modified-Since` is the 1-second fallback [RFC 9110 §8.8.3, §13.1.2–3; RFC 9111 §4.3]. Check: conditional re-request asserts 304 and unchanged body hash.
2. **Identity carries no version; it must include layer/style/revision plus stored validators**, or cross-version/cross-layer conflation breaks both topics [slippy z/x/y; OSMF correct-URL; RFC 9111 URI keying]. Check: style-switch at identical z/x/y asserts no cross-style hits.
3. **Range/206 resumability is optional per server** — gate on an `Accept-Ranges` probe; default resume granularity is bundle-level [RFC 9110 §14, §15.5.17]. Check: partial-GET resume on a bundle URL asserts 206/416.
4. **`Retry-After` + token-bucket quota with jitter bounds acquisition; OSMF makes rate/identification compliance mandatory** [RFC 9110 §10.2.3; AWS retry reference; OSMF §3–4]. Check: staged 429/503 asserts the wait honors `Retry-After` and the quota halts the queue.
5. **Bounded stale display is standards-based but client-side**: SWR/SIE are RFC 5861 informational extensions absent from RFC 9111's text (grep-verified, re-verified at join), so windows are client policy; §4.2.4 covers disconnect/failure; 404/410 ends display [RFC 5861 §3–4; RFC 9111 §4.2.4]. Check: offline render asserts store display with marker and refetch on reconnect.
6. **Freshness tiers are heterogeneous**: Mapbox declares 12 h browser TTL vs 5 min CDN TTL; mod_tile computes expiry per tile, deployment-specific — fixed global TTL rejected; adopt the stricter client-facing TTL [Mapbox raster docs; mod_tile README]. Check: compare echoed `Cache-Control`/`Expires` across tiles/regions.
7. **Retention has no normative HTTP bound**: RFC 9111's model ends at validation or discard; keep-N/age rules are local decisions needing quota justification; leaflet.offline supplies storage mechanics, not policy; OSMF's 7-day floor binds only OSMF endpoints [RFC 9111 §4; leaflet.offline README; OSMF policy]. Check: store-aging test asserts superseded eviction without deleting in-flight entries.
8. **One revalidation event, two consumers (join synthesis)**: 200 atomically replaces display state and demotes the old version to the rollback slot; 304 is a no-op for both — the single shared invalidation bridging the topics [RFC 9111 §4.3; both predecessor dispositions]. Check: 304/200 fixtures assert display+retention invariants in one transaction.

## Bounded topic comparison

Topic 1 decides when bytes move (resumable acquisition/refresh under intermittent links); topic 2 decides what is shown and kept (stale display/retention). Shared discovery: findings 1, 2, 8 and the RFC-9111-lacks-SWR/SIE negative. Topic-1-specific: 3, 4 (transport). Topic-2-specific: 5–7 (staleness policy). Discriminator: topic 1's open items are server-evidenced capabilities, settled only by live probes; topic 2's are client policy constants, settled only by decision — no shared evidence crosses that line, so neither topic's uncertainties are treated as settled by the other's corpus.

## Discriminating checks (cross-topic)

- Kill the link mid-refresh: topic 1 fails into resume (quota/backoff, no duplicate work); topic 2 renders the stale tile, no network attempt.
- 304: topic 1 counts zero payload bytes; topic 2 leaves display and retention untouched.
- 200 new content: topic 1 records completion; topic 2 swaps display and demotes the old version atomically.
- 404/410: refresh terminates the entry; stale display stops — distinct from the `stale-if-error` path.
- Evict under quota while acquisition is in flight: eviction skips in-flight/partial entries.

## Topic-specific uncertainties preserved

Topic 1 only: endpoint ETag vs Last-Modified-only; `Accept-Ranges`/Range support; observed `Retry-After` values. Topic 2 only: window and quota constants; rollback depth/value; whether SIE governs non-404/410 failures; whether the "as of" marker is required UX; newer-version existence unverifiable offline. Shared negative: no captured source bounds retention or embeds version in identity; windows/caps are client policy.

## Ledger

**Accepted**: conditional-GET refresh; bundle-level bounded acquisition with token-bucket backoff; bounded SWR/offline stale display with marker; keep-1 rollback + LRU quota retention; extended identity with validators. **Amended**: per-tile Range resume demoted to bundle-level conditional; refresh outcomes consumed as display/retention events; fixed global TTL replaced by stricter-client-TTL adoption; AWS "retry quota" count corrected to 15 (case-insensitive) vs topic-1 index's 17. **Rejected**: unbounded retry loops; per-tile Range resume as default; unbounded stale serving; fixed global TTL; unbounded retention. **Unresolved**: all live endpoint capabilities; window/cap/quota numbers; SIE scope; rollback depth; marker requirement.

## Independent discovery vs reuse costs

Both arms independently discovered RFC 9111, RFC 5861, and the OSMF policy (byte-identical captures): the join reused them at verification-only cost. Topic-1-unique sources (RFC 9110, wiki tile-disk-usage, AWS retry) and topic-2-unique sources (slippy tilenames, Mapbox, mod_tile, leaflet.offline) crossed arms only through this synthesis, not by corpus merging. Join-only cost: the two-consumer invalidation rule and the eviction/resume and link-loss reconciliations (finding 8, interaction rules). Corpora were not merged beyond the shared dependency set both reports allowed.

## Validation — executed vs proposed

Executed at join: SHA-256 recomputation over all 14 predecessor files (10 unique), matching; byte-level claim spot-checks (max-stale ×9; SWR absent from RFC 9111 ×0; SWR/SIE ×9 each; Mapbox 12 h/5 min phrase; mod_tile `expir` ×2, `86400` ×2; OSMF `If-Modified-Since` ×1, bulk ×4; slippy z/x/y; AWS counts; leaflet offline/idb); one count amendment recorded. Not executed (proposed, carried from the arms): live endpoint probes (findings 1–4, 6) and behavioral tests (5, 7, 8, discriminating checks) — outside this stage's budget and no-execution policy; they gate promoting conditional dispositions.

## Conditions, negative results, optional leads

Conditions: Range path disabled until probes prove support; window/cap/quota ship as named policy constants; acquisition honors OSMF identification and rate rules; Mapbox/vendor TTLs stay vendor-scoped; mod_tile heuristics stay deployment-scoped. Negative results: RFC 9111 contains no SWR/SIE; nothing in HTTP governs offline retention of superseded versions; identity carries no version; "Tile disk usage" survives only as a redirect into Servers/Tile Rendering (rev 3082592); leaflet.offline documents no staleness/retention policy. Optional leads (not pursued): mod_tile source expiry semantics; CDN intermediary behavior; RFC 9111 §4.3.4 freshening details; measured TTL distributions; a fixture viewer passing the discriminating checks.
