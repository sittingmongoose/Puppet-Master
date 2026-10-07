# D-M16-A topic1_independent-v3 — bounded two-topic diagnostic: offline map viewer tile policies

Stage: OPEN_DISCOVERY_BRIEF_ONLY, fresh independent Topic-1 research. T0 2026-10-07T21:21:56Z; admission 21:22:08Z; stage deadline 21:51:56Z; pair deadline 22:41:56Z. Six sources captured under `sources/` (index.json: url/version/capture/sha256/locator/limits, hashes verified). At most eight material findings; soft 1100 words.

## Source identities (captured)
- `rfc9110.txt` — RFC 9110, Standards Track, June 2022 (ETag §8.8.3; Retry-After §10.2.3; If-None-Match §13.1.2; If-Modified-Since §13.1.3; Range §14.2; 416 §15.5.17).
- `rfc9111.txt` — RFC 9111, Standards Track, June 2022 (Freshness §4.2; Serving Stale §4.2.4; Validation §4.3; Cache-Control §5.2).
- `rfc5861.txt` — RFC 5861, Informational, April 2011 (stale-while-revalidate §3; stale-if-error §4).
- `osmf-tile-policy.html` — OSMF Tile Usage Policy, live page (sections: Correct tile URL; 3.1 Identification; 3.2 Caching; 3.3 Protocols; 4 Prohibited bulk downloading/offline use; 5 Caching proxies; one If-Modified-Since mention).
- `osm-wiki-tile-disk-usage.html` — OSM wiki Servers/Tile Rendering, revision 3082592 ("Tile disk usage" resolves into it; mod_tile `expiry: false`/`expiry: 86400` config examples).
- `aws-sdk-retry-behavior.html` — AWS SDKs Retry behavior reference (Standard/Adaptive modes; retry-quota token bucket).

## Dispositions

**Acquisition (Topic 1) — ACCEPTED with amendment.** Bounded concurrent acquisition of whole tiles by plain GET; resumable Range/If-Range + 206/416 (RFC 9110 §14.2, §15.5.17) accepted conditionally on server support, amended to apply at bundle/region level because single tiles are ~10–40 KB and endpoint Range support is unverified. Retries honor Retry-After (§10.2.3) under a token-bucket quota with exponential backoff + jitter (AWS precedent); OSMF policy (bulk-download prohibition, identification) bounds acquisition by policy, not only link state.

**Refresh (Topic 1) — ACCEPTED.** Conditional GET: If-None-Match/ETag preferred (strong validator), If-Modified-Since fallback (1-second resolution); 304 freshens the stored entry without payload (RFC 9111 §4.3); 200 replaces entry + validators; full re-download only when no validator exists; backoff on 429/503 per Retry-After.

**Stale display (Topic 2) — ACCEPTED, bounded.** Serve stored tiles within a bounded stale window while revalidating in background — stale-while-revalidate (RFC 5861 §3); on link loss or origin error, stale-if-error (§4) and RFC 9111 §4.2.4 permit continued display. Window length is client policy, not evidence-derived.

**Retention (Topic 2) — ACCEPTED, cap unresolved.** No HTTP source imposes a storage bound; retention is a hard local cap (store size + age). mod_tile `expiry: 86400` (1 day) is the only captured real-world precedent, adopted as candidate age bound only. Retention is independent of display staleness.

**Rejected.** Unbounded retry loops without a quota (token-bucket halting is the captured engineering precedent). Per-tile Range resume as the default (payload size makes it overhead unless endpoint support is proven). Unbounded stale serving (RFC 9111 stale serving is exception-bounded, not indefinite).

**Unresolved.** Endpoint capabilities (ETag vs Last-Modified-only; Accept-Ranges; observed Retry-After values); stale-window length; retention numeric cap; whether displayed-stale marking is required (UX, outside captured sources).

## Shared dependencies and reuse invalidation (Obligation 3)
One store, one identity: URL template (z/x/y + layer/style; OSMF correct-URL + attribution) with stored validators (ETag/Last-Modified) and freshness metadata (RFC 9111 §4.2). Refresh (T1) writes the freshness state display (T2) reads. Reuse invalidation is shared: 304 freshens; 200 replaces atomically. Identity must include layer/style/revision — bare z/x/y conflates "newer version" (T2's trigger) with another layer's stale hit, breaking both topics.

## Topic-specific uncertainties preserved (Obligation 4)
- T1-only: Range/Accept-Ranges support; ETag availability; Retry-After values in practice.
- T2-only: window and cap constants; stale-marking requirement.
- Negative finding disciplining both: stale-while-revalidate/stale-if-error are absent from RFC 9111's text (grep-verified) — they remain RFC 5861 informational extensions with no server opt-in; windows are purely client-side. Shared validator evidence does not settle either topic's open items.

## Material findings (8) with discriminating checks
1. Conditional GET with ETag/If-None-Match is the shared refresh primitive; 304 freshens without payload (9110 §8.8.3/§13.1.2; 9111 §4.3). Check: probe a live tile URL for ETag; assert 304 and unchanged body hash on conditional re-request.
2. If-Modified-Since is the 1-second-resolution fallback without an ETag (9110 §13.1.3). Check: assert 304 when If-Modified-Since equals echoed Last-Modified.
3. Range/206 resumability is optional per server (9110 §14) — usable only if the endpoint supports it. Check: Accept-Ranges probe; partial-GET resume on a large bundle URL asserting 206/416.
4. Retry-After (9110 §10.2.3) + token-bucket quota with jitter shapes T1 backoff; OSMF policy makes honoring limits mandatory. Check: staged 429/503, assert wait honors Retry-After and the quota halts the queue.
5. SWR/SIE are client-implementable RFC 5861 extensions absent from RFC 9111 (grep-verified negative). Check: grep both texts; assert window constants live in client policy, not server headers.
6. RFC 9111 §4.2.4 legitimizes stale serving on disconnection/origin failure — T2's offline-display basis. Check: airplane-mode test asserting display from store within window and refetch on reconnect.
7. Retention has no normative HTTP bound; mod_tile `expiry: 86400` is a server-side 1-day precedent (wiki, rev 3082592). Check: synthetic store aging asserts size/age eviction without deleting in-flight entries.
8. Identity must include layer/style/revision, not bare z/x/y (OSMF correct-URL; 9111 URI keying) or cross-version conflation breaks invalidation for both topics. Check: style-switch test asserting no cross-style hits at identical coordinates.

## Bundle comparison and discriminating checks (Obligation 6)
Shared discovery: findings 1–2 (validators/conditional GET) and 8 (identity). T1-specific: 3–4 (transport acquisition). T2-specific: 5–7 (staleness policy). The discriminator: T1's open items are server-evidenced capabilities settled only by live probes; T2's are client policy choices settled only by decision. No captured shared evidence crosses that line.

## Validation — proposed vs actually executed
Actually executed: source capture with sha256 integrity on all six entries (recomputed, matching); grep-verified RFC 9111 absence of SWR/SIE; content spot-checks (AWS token-bucket/retry-quota text; OSMF If-Modified-Since mention; wiki revision id); wiki redirect resolved and recorded honestly. Not executed (proposed checks above): all live tile-endpoint probes (1–4, part of 8) and behavioral tests (6–7) — not run inside this stage's budget and policy envelope; they are preconditions for promoting the conditional dispositions.

## Conditions, negative results, optional leads, join conditions
Conditions: Range path stays disabled until Accept-Ranges/206 is proven; window and cap ship as named policy constants; acquisition honors OSMF identification and rate rules. Negative results: RFC 9111 lacks SWR/SIE; "Tile disk usage" no longer exists as a standalone wiki page (redirect captured at rev 3082592). Optional leads (not pursued): mod_tile source for expiry semantics; CDN intermediary behavior in front of tile endpoints; RFC 9111 §4.3.4 freshening details. Join conditions: for the later counterpart join, this report shares only the identity/validator/freshness dependency set (findings 1, 2, 8); topic-specific corpora and unresolved lists stay separate and must not be merged by shared evidence.
