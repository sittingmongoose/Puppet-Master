# Independent source/science review — D-M16-A, frozen final-v3

**Status: DIAGNOSTIC_FAIL.** Six material defects prevent acceptance. Every material scientific claim group in this final and every mapped source identity was assessed at frozen-source scope. Historical execution counts and capture causality remain **UNASSESSED**; this is not a full SourcePASS.

Candidate: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_bundle_join_final-v3/final.md`
SHA-256 verified before assessment and again at write: `621792100eb67a49b91bcbcad3dda405487862811a7081d4b4a98c4f536bad67`. Candidate bytes/grades were not changed.

Original brief: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M16-A/inputs/brief.md`. The original manifest is intentionally empty (`OPEN_DISCOVERY_BRIEF_ONLY`); selected sources/index annotations were untrusted inputs.

The arm/method are visible in paths and content, so the reviewer is not fully method-blind. No other arm, draft, predecessor output, timing, prior review, parent analysis, campaign/helper/history was read. No native Goal, delegated worker, downloaded-code execution, tests, installer, account, purchase, global configuration, repository/canon/WorkNode or third-party write was used. Only primary documents and public tree metadata were fetched.

## Material defects

### D01 — Viewport bounds do not authorize offline acquisition from the OSMF standard tile service (HIGH)

Candidate: final.md:6, final.md:22. Claims: C14, C16.

Adopting the stated compliant offline-save pattern can violate the governing source policy and be blocked. A finite session does not settle permitted purpose.

Primary facts:
- P04 `169-198,251-257`: The policy separates active viewport viewing/local-cache revisits from prohibited offline save/prefetch, and offers self-hosted/explicitly permitted alternatives.
- P11 `139-199`: The cited SaveTiles control saves a bounds/zoom list, potentially at multiple zooms.

Required qualification: Bind acquisition to a provider explicitly permitting offline/prefetch or self-hosted tiles. For tile.openstreetmap.org restrict to active interactive viewing/cache revisits and retain identifying User-Agent/web Referer, caching headers or the minimum seven-day unreadable-header rule. Do not generalize this service policy to every provider.

Inference boundary: Policy clauses applied to the brief’s offline-save purpose; no claim about undisclosed client intent or an actual violation by the candidate.

### D02 — Stored-first display was promoted into unconditional skip-existing acquisition (HIGH)

Candidate: final.md:6, final.md:20, final.md:30 check 3. Claims: C02, C04, C05, C47.

A reader implementing the cited default can repeatedly download committed tiles on restart. Conversely, an unconditional hasTile skip can suppress refresh of a tile known to have a newer version. The Leaflet display guard does not establish acquisition skipping by default; the other cited writes are replacement primitives.

Primary facts:
- P09 `219-225`: Line 220 selects a stored image for display.
- P11 `76,212-218`: Acquisition defaults alwaysDownload=true; disabling it activates the hasTile guard.
- P05 `128-152`: saveFile replaces a tile row.
- P07 `957-1006`: store_tile_async replaces a tile file.

Required qualification: Explicitly adopt/configure acquisition skipping for usable committed tiles that do not need refresh, distinguish storage replacement from download admission, and leave durable/reconstructed queue behavior to the proposed restart check.

Inference boundary: Call-site inspection distinguishes acquisition, storage, and presentation without running any library.

### D03 — An access-denied response was generalized into ordinary missing-validator refresh behavior (HIGH)

Candidate: final.md:9, final.md:23, final.md:30 check 1. Claims: C21, C22, C23, C45.

A denied response may be repeatedly fetched or mistaken for replacement tile content; two different response classes do not establish usable-tile validator instability. The report lacks the governing denial/admission branch and makes fallback mandatory from non-discriminating evidence.

Primary facts:
- P16 `1-8`: The second capture is a denied HTTP 200 PNG response with no-cache/x-blocked; request metadata and body are absent.
- P15 `1-4`: The normal held response has validators and explicit freshness.
- P04 `117-133,148-167`: Identification and source cache requirements govern further requests.
- P03 `183-188`: stale-if-error has a staleness bound and qualifying error conditions.

Required qualification: Retain the denial as a separate observed failure state; keep block cause/client dependence unknown. Use time-based unconditional refresh only for usable, permitted resources without validators, after honoring remaining freshness fields and source policy. Preserve known-good tile bytes subject to allowed stale bounds rather than treating a denial body as the new tile.

Inference boundary: Potential poisoning/retry consequence is a design risk inferred from the missing response-class distinction, not an observed candidate implementation defect.

### D04 — Unsafe-method invalidation was conflated with GET refresh, making re-keying falsely exclusive (HIGH)

Candidate: final.md:18, final.md:26, final.md:30 check 2. Claims: C41, C42, C46.

The report incorrectly predicts old tiles survive until eviction, and the proposed purge-survival check does not discriminate version identity correctness. It may cause unnecessary schema/namespacing changes or skip the actual update path.

Primary facts:
- P01 `930-942,990-1049`: Conditional GET can supply replacement data; HEAD can freshen/invalidate; mandatory unsafe-method invalidation has non-error response and cache-path conditions.
- P05 `128-152,213-244,386-397`: The mapped store replaces data and can clear by source or remove by tile.

Required qualification: State the narrower lack of guaranteed global origin-change notification. Choose explicit new-version namespacing, old-source removal, or same-key validated replacement as applicable. Test that new-version requests cannot select old bytes; physical survival after a chosen purge is a separate retention question.

Inference boundary: The recommendations are alternatives already supported by the held code, not a preset demand to adopt one scheme.

### D05 — Conditional stale-serving permission was turned into a blanket nonblocking rule (MODERATE)

Candidate: final.md:11, final.md:12, final.md:24, final.md:30 check 5. Claims: C27, C30, C31, C32, C49.

The final leaves the expired/forbidden-stale branch unclear while rejecting blocking universally, and its product-window/blanking rationale exceeds the cited authority. A private viewer can also wrongly reject stale use based on shared-only s-maxage.

Primary facts:
- P03 `107-159`: Nonblocking SWR is window-bound; later requests can block when validation is required.
- P01 `790-799,1258-1281,1384-1402`: Stale reuse has permission/prohibition conditions; s-maxage is shared-cache specific; no-cache has qualified/unqualified forms.
- P01 `647-650,1536-1568`: Cache freshness does not by itself mandate a UI redraw or imply map blanking.

Required qualification: Limit the preferred nonblocking path to permitted staleness. State how the product handles an expired or forbidden stale tile (validation/waiting/unavailable or an explicitly defined history presentation). Bind product caps to supplied SWR/SIE permission or another valid contract, distinguish private/shared caches, and label blanking as an untested UI risk.

Inference boundary: The issue is an omitted conditional branch and overbroad claim, not an assertion that every offline viewer must implement a blocking UI.

### D06 — Retention precedents lost their trigger, eligibility, units, and soft-bound conditions (MODERATE)

Candidate: final.md:15, final.md:25, final.md:30 check 6. Claims: C33, C35, C50.

The viewer may treat expires as a guaranteed TTL deletion rule or either library as a hard instantaneous disk cap. A fresh-hit-rate experiment alone does not verify the required storage bound, especially for absent-expiry tiles.

Primary facts:
- P05 `102-124,128-152,660-730`: SQL cleanup is triggered by database size, excludes null expiry, and ordinary cleanup can include unexpired rows.
- P07 `307-321,641-748,1065-1072`: The limit is tile payload bytes, purge is asynchronous, and automatic trigger includes five-million-byte slack.

Required qualification: Carry the precise source defaults/units, size trigger and null-expiry eligibility. Declare the viewer’s desired hard/eventual storage bound independently, and measure storage/cleanup completion as well as fresh hit rate. Keep eviction ranking as a product choice.

Inference boundary: The mapped code supports bounded-purge mechanisms with these conditions; this is not a rejection of those mechanisms.

## Six-axis dispositions

| Axis | Disposition | Assessment |
|---|---|---|
| 1. All required obligations | PARTIAL | All six obligations are structurally addressed; the complete source-linked recommendation has material governing-condition errors. |
| 2. Consequential claims and release/default/type/unit/path/authority conditions | FAIL | 58 claim groups were independently checked against exact source passages/metadata. Several material assertions and inferred requirements fail; source identities alone were not treated as answers. |
| 3. Bounded useful discovery, negative and optional yield | PARTIAL | Useful tile storage, validators, backoff, stale extensions, namespace and purge mechanisms are found; optional leads retained. Offline-provider alternatives and actual denial/fallback distinctions were lost; package-wide negative behavior is not proved. |
| 4. Wrong reject, correction and unjustified abstention | PARTIAL_FAIL | The osmdroid backoff correction is right. Blanket blocking-refresh rejection and exclusive re-key requirement are not. Product retention choice and queue/source surveys appropriately remain open; HTTP freshness precedence itself is already settled by the RFC. |
| 5. Preservation, traceability, uncertainty and options | PARTIAL | Versions, source families, independent topic unknowns and four optional leads survive. Important option defaults, source-policy scope, capture causality, cache types and retention triggers do not. Several locators point to a constructor or adjoining section. |
| 6. Proposed versus executed checks | PARTIAL_WITH_UNASSESSED_PROVENANCE | Six proposed tests are clearly separated from self-reported static/probe work. Historical counts/commands/request headers are not authenticated by the allowed bytes; 28 versus 26+2+1 is ambiguous. This reviewer has not executed the proposed tests. |

## Obligation coverage

| Required obligation | Disposition / candidate location | Assessment |
|---|---|---|
| Give a separate disposition for acquisition and refresh. | STRUCTURALLY_MET_SUBSTANTIVELY_PARTIAL; final.md:5-9 | Acquisition and refresh are separate, but skip/policy/denial conclusions need conditions. |
| Give a separate disposition for stale display and retention. | STRUCTURALLY_MET_SUBSTANTIVELY_PARTIAL; final.md:11-15 | Display and retention are separate, but stale authority and cleanup bounds need conditions. |
| Identify shared identity/freshness dependencies and reuse invalidation. | PRESENT_BUT_MATERIAL_ERROR; final.md:17-18,26-27 | Shared substrate is discussed, but unsafe-method invalidation is confused with refresh and the version test is non-discriminating. |
| Preserve topic-specific uncertainties instead of assuming shared evidence settles both. | MET_WITH_PROTOCOL_AUTHORITY_QUALIFIER; final.md:6,9,15,27,30 | Queue persistence, cross-source survey and product window/retention choices remain independently open; shared evidence does not purport to decide all. |
| Return at most eight distinct material findings across the bundle. | MET; final.md:20-27 | Exactly eight distinct numbered findings; this review has six material defect identities, not a required alternative answer key. |
| Deliver a bounded topic comparison and discriminating checks, counting shared discovery and synthesis. | PARTIAL_DISCRIMINATOR_AND_ACCOUNTING; final.md:29-33 | A useful six-check shared/topic comparison is delivered; check 2 has the wrong discriminant, bounds need precision, and stage counts do not authenticate whole-module execution. |

## Complete consequential claim checks

The rows below independently separate source fact, bounded inference, product choice, and unexecuted proposal. A source reference denotes the exact frozen primary path/hash listed after the checks, not an acceptance based on a citation or index. Repeated final findings are bound to the same checked claim identities.

### C01 — Separate dispositions for acquisition, refresh, stale display, and retention.

Candidate `final.md:5,8,11,14`. **SUPPORTED**. Kind: artifact structure.

All four headings have separate accepted/rejected/unresolved dispositions. Presence is checked directly, independently of their correctness.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

### C02 — Captured clients acquire/store per tile by identity; Leaflet hasTile skip is used as an acquisition-resume precedent.

Candidate `final.md:6,20`. **GRANULARITY_SUPPORTED_SKIP_CONDITION_LOST**. Kind: source assertion.

The all-client claim of tile granularity is supported. The acquisition precedent still loses Leaflet’s option condition and cites its display guard; the other stores demonstrate replacement primitives, not an automatic acquisition skip. No universal skip claim beyond the actual wording is attributed to the candidate.
Defect identity: D02.

Primary evidence:
- P09 `84-105,206-225` — TileManager fetches a complete response blob, saves with IndexedDB put, and separately has a stored-first display helper.
- P11 `64-79,212-218` — The acquisition control defaults alwaysDownload to true; hasTile prevents fetching only when alwaysDownload is not true.
- P05 `128-152` — saveFile replaces the row keyed by tile index and provider, without checking exists.
- P07 `942-1006` — store_tile_async replaces the tile file and accepts coordinates/ETag, without a skip-existing test.

### C03 — Leaflet downloadTile to saveTile uses persistent per-tile identity.

Candidate `final.md:6`. **SUPPORTED_WITH_CONDITIONS**. Kind: source assertion.

Correct persistent primitive. The key is a normalized resolved URL, not necessarily byte-for-byte the fetched URL. A key includes template/options/retina expansion.

Primary evidence:
- P09 `13-43,84-105` — TileInfo has key/url/coordinates/createdAt; IndexedDB object store keyPath is key; download returns a Blob and put persists it.
- P10 `49-55,61-87` — The storage key normalizes the subdomain to the first entry; the requested network URL may use another subdomain.

### C04 — Leaflet hasTile/line 220 establishes skip-existing acquisition and restart behavior.

Candidate `final.md:6,20,30 check 3`. **REFUTED_AS_CITED**. Kind: source assertion and proposed test.

The cited display helper does not prove the acquisition default or durable work-list reconstruction. A restart experiment remains proposed.
Defect identity: D02.

Primary evidence:
- P09 `219-225` — Line 220 chooses the source for display, returning a blob URL on a storage hit.
- P11 `76,212-218` — Actual acquisition skip is conditional on disabling the true alwaysDownload default.

### C05 — osmdroid saveFile provides per-source, per-index storage/resume primitive.

Candidate `final.md:6,20`. **SUPPORTED_WITH_CONDITIONS**. Kind: source assertion.

Storage and identity are real; a caller must decide when to use exists, when to refresh, and when replacement is required. It is not a default skip operation.
Defect identity: D02.

Primary evidence:
- P05 `128-152,181-198,499-505,533-534,559-593` — Rows use provider name plus encoded coordinates. saveFile replaces; exists is a separate operation.

### C06 — libshumate store_tile_async supports per-tile storage; SHU:378 is its locator.

Candidate `final.md:6,20`. **SUPPORTED_MECHANISM_BAD_LOCATOR**. Kind: source assertion.

The mechanism exists elsewhere in the held file. The cited constructor does not establish storage or skipping. Constructor parameter order in discovery index prose also reverses cache_key/cache_dir.

Primary evidence:
- P07 `367-391` — Line 378 is new_full(size_limit, cache_key, cache_dir), the constructor.
- P07 `465-487,942-1006` — Tile filenames include cache directory, cache_key, zoom, x, y; store_tile_async starts at 957.

### C07 — Choose tile-level resumability rather than byte-range default for small raster tiles.

Candidate `final.md:6,20`. **REASONABLE_PRODUCT_INFERENCE**. Kind: product recommendation, not a normative HTTP requirement.

A useful bounded recommendation. Reliable resume still needs a reconstructed/persisted list, stable identities, committed valid tile bytes, and a rule that does not skip tiles needing refresh. No implementation/restart proof is claimed here.

Primary evidence:
- P09 `84-105` — Fetch/save operates on a whole tile Blob.
- P05 `128-152` — A stream is copied to a whole tile blob and row replacement.
- P02 `6467-6479` — Ranges can recover failed transfers and retrieve large representations; the server may ignore a Range request.

### C08 — No captured client byte-ranges small tiles.

Candidate `final.md:6,20`. **SUPPORTED_ONLY_AS_BOUNDED_NEGATIVE_LEAD**. Kind: bounded absence in captured files; package-wide behavior UNASSESSED.

Whole-file keyword and path inspection found no HTTP Range construction in the seven unique mapped code files. This cannot establish absence in uncaptured delegates, browser transport, entire packages, or all mainstream clients. The explicit negative-lead label is appropriate.

Primary evidence:
- P09 `84-89` — The shown fetch has no Range header.
- P13 `149-169,172-203` — MapTileDownloader delegates transfer to TileDownloader; its shown path has a URL backoff but no Range construction.
- P07 `1-1108` — The captured file is a filesystem cache, not the complete network downloader.

### C09 — Accept-Ranges is advertised and byte-range/If-Range remains optional for large rasters.

Candidate `final.md:6,46`. **SUPPORTED_WITH_CONDITIONS**. Kind: source assertion plus optional product lead.

Advertisement is accurate; no 206/range transfer was tested. Preserve strong-validator/representation consistency and server-ignore fallback if this optional lead is pursued.

Primary evidence:
- P15 `12` — The successful tile response advertises bytes.
- P16 `9` — The blocked 200 response also advertises bytes.
- P02 `6109-6175,6562-6571` — If-Range requires an accompanying Range request and a strong entity tag or qualifying strong date; Accept-Ranges does not guarantee a later partial response.

### C10 — osmdroid 6.1.20 has UrlBackoff.shouldWait/next; correcting a no-backoff assertion is warranted.

Candidate `final.md:6,21`. **SUPPORTED**. Kind: source assertion.

The frozen bytes directly support the correction. Public tag-tree metadata also matches the complete file blob. No prior draft or finding was read; only the correction text in this frozen final was assessed.

Primary evidence:
- P13 `14,47,194-202` — The downloader owns UrlBackoff, checks shouldWait, calls next after a null result, and removes the entry after success.

### C11 — Connectivity gating is backoff-free.

Candidate `final.md:6,21`. **SUPPORTED_WITH_CONDITIONS**. Kind: bounded source assertion.

Accurate for this class, not for the entire downloader/provider. Connectivity permission/platform behavior remains a condition; availability is not proof of origin reachability.

Primary evidence:
- P06 `22-47,51-78` — The class polls connection state; missing ACCESS_NETWORK_STATE permission assumes connectivity; deprecated route check always returns true.
- P13 `180-185` — The caller skips loading when a non-null network checker reports false.

### C12 — Adopt exponential delay from 1 second to 10 minutes, honor Retry-After, configure retry limits.

Candidate `final.md:6,21`. **SUPPORTED_AS_ANALOGY_WITH_CONDITIONS**. Kind: explicit viewer-configured product choice.

The numbers/units are right as a curl policy analogy. They are proposed viewer values, not demonstrated osmdroid defaults or a mandatory tile standard. The real UrlBackoff delay shape was not captured and is not asserted here.

Primary evidence:
- P14 `572,2762-2765,2788-2792` — The held manual identifies curl 8.23.0. Retries require a nonzero retry count (default zero); exponential waits apply when retrying, retry-delay replaces that shape, and Retry-After support was added in 7.66.0.

### C13 — The curl precedent supplies a total-time bound and retry stops at it.

Candidate `final.md:6,21,30 check 4`. **QUALIFY_TIME_BOUND**. Kind: proposed product check; cited implementation has a weaker bound.

Do not equate a retry-start cutoff with a hard operation deadline. A strict viewer deadline needs attempt cancellation/timeouts and its own remaining-budget enforcement. The check is proposed, not an executed result.

Primary evidence:
- P14 `1882-1885,2798-2802` — retry-max-time prevents starting further retries after its limit; an already-started transfer can exceed it. max-time caps an individual attempt and resets when retrying.

### C14 — OSMF prohibits bulk downloading and prefetch.

Candidate `final.md:6,22`. **SUPPORTED_SOURCE_SCOPED**. Kind: source-scoped policy assertion.

Correct only for the specified OSMF service. It does not establish a universal prohibition across all permissible offline providers.
Defect identity: D01.

Primary evidence:
- P04 `75,169-180,251-257` — The prohibition applies to standard raster tiles on tile.openstreetmap.org. Bulk includes pre-emptive fetching beyond currently viewed tiles; other tile services have separate policies.

### C15 — Blocking happens in practice.

Candidate `final.md:6,22`. **SUPPORTED_CAPTURE_OBSERVATION_WITH_LIMITS**. Kind: observed denial marker; causal attribution UNASSESSED.

A captured denial marker supports a denied response, despite status 200. The actual request headers, block cause, client identity, and body content were not preserved; the reason for this particular block is not proven.

Primary evidence:
- P16 `1-8` — The frozen response is HTTP 200 image/png with x-blocked: Access denied, no-cache, and Retry-After: 0.
- P04 `148,167,200` — Generic client identification and prefetch/offline usage can trigger blocking.

### C16 — Viewport/session-bounded save lists are the OSMF-compliant acquisition pattern.

Candidate `final.md:6,22`. **REFUTED_AS_OFFLINE_SAVE_GUIDANCE**. Kind: overextended policy inference.

Finite bounds do not convert offline prefetch into permitted interactive viewing. The recommendation omits the usable alternative provider/self-hosting lead and identification/cache conditions.
Defect identity: D01.

Primary evidence:
- P11 `139-199` — The control computes and saves a bounds/zoom list; saveWhatYouSee can add zoom levels through maxZoom.
- P04 `171-198` — Save-area-for-later offline acquisition is prohibited; active interactive viewport fetch/local-cache revisits are permitted; offline needs self-hosting or a provider explicitly allowing it.

### C17 — Queue persistence across restarts has no captured implementation.

Candidate `final.md:6`. **SUPPORTED_AS_CAPTURE_LIMIT**. Kind: topic-1 uncertainty.

A durable queue is not established by the captured paths. This is appropriately open; it is not proof that no package can persist queues.

Primary evidence:
- P11 `35-58,139-165,202-209` — The candidate tile list/status is in-memory and shifted during acquisition.
- P13 `66-75,209` — The shown downloader configures a queue in an uncaptured base class and removes loaded tiles.

### C18 — Refresh with conditional GET using ETag/Last-Modified.

Candidate `final.md:9`. **SUPPORTED_WITH_PROTOCOL_CONDITIONS**. Kind: source assertion and recommendation.

Sound policy. Validator presence is separate from explicit freshness availability, and a changed version may be returned at the same URI without re-keying.

Primary evidence:
- P02 `5872-5902,5928-5932,5942-5961` — If-None-Match supports weak comparison for GET validation and 304 reuse; If-Modified-Since avoids body transfer and is ignored when If-None-Match is present.
- P01 `930-942,953-988` — 304 refreshes selected matching stored metadata; a full response replaces the response used to satisfy the request.

### C19 — Schedule freshness by max-age or heuristics and share an age/max-age/validator record.

Candidate `final.md:9,18,27`. **SUPPORTED_WITH_GOVERNING_CONDITIONS**. Kind: shared product abstraction with source-defined priority.

Useful abstraction if age means corrected current age and directives/Expires/variant context are also retained. A heuristic is not a coequal alternative to supplied explicit freshness. The final does not define the calculation; no wrong zero-age implementation is inferred.

Primary evidence:
- P01 `652-709,719-782` — Freshness priority is applicable shared-cache s-maxage, then max-age, then Expires minus Date; heuristics cannot override explicit expiry. Current age includes upstream Age, transit and resident time.
- P15 `3,6,13,15` — The held successful response includes max-age, Expires, Date and Age: 11504.

### C20 — One held OSM response has validators/max-age/stale directives; another has no-cache/x-blocked.

Candidate `final.md:9,23`. **SUPPORTED**. Kind: frozen capture observation.

Exact header facts match the frozen source locators. Both are one-URL captures, and request metadata/body were not held. Units of all durations are seconds.

Primary evidence:
- P15 `1-4,13,15-18` — The first response has max-age=526616, stale-while-revalidate=604800, stale-if-error=604800, ETag, and CDN age.
- P16 `1-10,12-17` — The second 200 response has no-cache, x-blocked, no ETag/Expires/max-age, and another CDN node.

### C21 — Header emission is unstable per request/client, including withheld validators behind policy gating.

Candidate `final.md:9,23`. **PARTLY_SUPPORTED_CAUSAL_LIMIT**. Kind: inference from two non-controlled captures.

The two observed response classes differ. They do not isolate client-dependent variation, establish ordinary successful-tile validator instability, or survey an OSM-derived source class. Denial may explain the difference; actual cause is unknown.
Defect identity: D03.

Primary evidence:
- P15 `1-22` — First held response has normal tile cache metadata.
- P16 `1-18` — Second held response is explicitly denied and has different cache metadata.

### C22 — Time-based re-download must be the designed default whenever headers/validators are absent.

Candidate `final.md:9,23`. **UNSUPPORTED_UNCONDITIONAL_INFERENCE**. Kind: unsupported default inferred from denied response.

Fallback GET can be a product option for usable permitted resources without validators. A denial needs a separate failure/admission/identification state, not evidence that a valid tile should be periodically re-downloaded. Missing validators alone does not erase Expires/max-age or authorize bypassing them.
Defect identity: D03.

Primary evidence:
- P16 `1-8` — The no-validator example is an access-denied response, not demonstrated usable fresh tile content.
- P04 `117-133,148-167` — The service requires stable valid identification and cache observance; unreadable cache metadata has a minimum seven-day caching rule.
- P01 `652-701,1258-1271` — Missing validators are distinct from freshness calculation; unqualified no-cache cannot be reused without successful validation.

### C23 — stale-if-error is the offline fallback.

Candidate `final.md:9`. **SUPPORTED_WITH_BOUNDS_AND_ERROR_SCOPE**. Kind: optional protocol mechanism.

Useful optional fallback subject to its time bound and source/cache permissions. A policy-denied HTTP 200 does not by itself meet these HTTP error conditions. Locator 159 is preceding section text; section 4 begins at 161.
Defect identity: D03.

Primary evidence:
- P03 `85-88,161-193,195-236` — The extension permits stale reuse on qualifying errors, supplies a delta-seconds upper staleness bound, and identifies 500/502/503/504 outcomes (network/DNS failures are examples).

### C24 — Reject wholesale scheduled re-download as primary.

Candidate `final.md:9`. **REASONABLE_SCOPED_PRODUCT_CHOICE**. Kind: product recommendation.

Reasonable for the requested bounded viewer and OSMF case; not a universal ban on scheduled refresh of a permitted private dataset.

Primary evidence:
- P01 `597-609,803-810` — Fresh reuse and validation reduce unnecessary transfers.
- P04 `130-133,171-198` — The OSMF source requires caching and prohibits offline prefetch.

### C25 — Other sources validator/max-age behavior remains open.

Candidate `final.md:9,23`. **SUPPORTED_UNCERTAINTY**. Kind: topic-1 uncertainty and capture inventory check.

The declared capture set supplies only the same OSM endpoint twice. The final explicitly keeps cross-source surveying open rather than treating shared evidence as conclusive.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

### C26 — RFC 9111 permits stale reuse when disconnected, except applicable prohibitions.

Candidate `final.md:12,24`. **SUPPORTED**. Kind: protocol assertion.

The disconnected exception and overriding constraints are preserved. It is permission, not an obligation to display a stale tile.

Primary evidence:
- P01 `278-280,784-799,1222-1235` — Disconnected caches may serve stale in some circumstances; explicit no-cache/must-revalidate and applicable shared-cache directives still prohibit reuse.

### C27 — no-cache/must-revalidate/s-maxage can forbid stale display.

Candidate `final.md:12,24`. **SUPPORTED_WITH_CACHE_TYPE_QUALIFIER**. Kind: protocol assertion requiring cache-type binding.

For a private local viewer, s-maxage alone is not the same prohibition as for a shared cache. Preserve applicable/private/shared and qualified/unqualified distinctions; do not reject permitted private-cache stale use on s-maxage alone.
Defect identity: D05.

Primary evidence:
- P01 `790-799,1258-1281,1384-1402` — Unqualified no-cache and must-revalidate constrain reuse; s-maxage applies to shared caches. Qualified no-cache may permit reuse with named headers excluded.

### C28 — Leaflet createTile is stored-first with no staleness age test.

Candidate `final.md:12,24`. **SUPPORTED**. Kind: source assertion.

The absence of age gating is established across both held files. Do not confuse absence of an age check with absence of any stored timestamp.

Primary evidence:
- P10 `20-40` — createTile asks getTileImageSource to choose image URL.
- P09 `219-225` — The helper chooses cached blob solely on hasTile.
- P10 `72-87` — TileInfo includes createdAt, but display does not use it to determine age.

### C29 — Record age beside the blob; libshumate mark_up_to_date is a counterpart.

Candidate `final.md:12`. **SUPPORTED_WITH_MECHANISM_PRECISION**. Kind: product recommendation based on source mechanism.

A sound metadata lead; filesystem confirmed-up-to-date mtime is not by itself the full HTTP age calculation or a measured visible-staleness budget.

Primary evidence:
- P07 `530-567,830-845,881-917` — mark_up_to_date changes filesystem mtime without data replacement, intended for a 304. Retrieval returns mtime and ETag.
- P01 `719-782` — HTTP current-age calculation incorporates origin/intermediary age, not just time since writing a blob.

### C30 — Reject blocking display-path refresh; revalidation is non-blocking.

Candidate `final.md:11-12,24`. **OVERBROAD_REJECTION**. Kind: unsupported universalization of a conditional mechanism.

Rejecting blocking as the preferred in-window path is reasonable; declaring refresh universally nonblocking loses the out-of-window/forbidden-stale branch. A product can instead show unavailable/waiting state, but cannot imply RFC-authorized stale reuse after the permitted bound.
Defect identity: D05.

Primary evidence:
- P03 `107-110,123-159` — Nonblocking revalidation is permitted inside an indicated SWR window. After it ends without validation, ordinary handling can block.
- P01 `790-799,1258-1271` — Explicit prohibitions or absent stale permission can require validation before reuse.

### C31 — Blocking refresh on intermittent links would blank the map.

Candidate `final.md:12`. **UNTESTED_PRODUCT_HYPOTHESIS**. Kind: product/UI inference, not observed behavior.

No UI behavior was executed or supplied. Latency is plausible; blanking is not a fact established by the standards and should be labeled a design risk/hypothesis.
Defect identity: D05.

Primary evidence:
- P03 `90-93,137-159` — The document discusses hiding validation latency and some requests blocking outside the window.
- P01 `647-650,1536-1568` — HTTP cache freshness does not force the application to redraw or discard its already displayed/history representation.

### C32 — Window value is a product choice because RFC 5861 is informational (SHOULD, not MUST).

Candidate `final.md:12,30 check 5`. **QUALIFY_AUTHORITY**. Kind: product choice constrained by source permission.

A product can choose a narrower cap or obtain client/out-of-band permission; informational publication is not permission to enlarge an origin allowance arbitrarily. A window=max-age versus constant comparison must obey actual source permission.
Defect identity: D05.

Primary evidence:
- P03 `20-30,95-110,123-159,183-188` — The document is informational but defines RFC-2119 keywords. A response SWR allowance is up to its indicated seconds; expired-window continuation is SHOULD NOT absent other information.
- P01 `795-799,1203-1206` — Stale permission must have a basis and defined Cache-Control directives must be obeyed by a cache.

### C33 — libshumate defaults size_limit to 100000000 and can purge asynchronously.

Candidate `final.md:15,25`. **SUPPORTED_WITH_BOUND_TYPE**. Kind: source assertion.

100000000 is decimal bytes (100 MB), not 100 MiB. This is an eventual tile-payload cap with slack/errors/concurrency, not an instantaneous total-filesystem cap.
Defect identity: D06.

Primary evidence:
- P07 `307-321,352-391,448-461,724-748` — The guint limit is in bytes, default 100000000, configurable; purge is asynchronous.
- P07 `1055-1072` — Automatic purge starts with no estimate or after estimated tile bytes exceed the limit plus 5000000.

### C34 — libshumate eviction is size/rank based.

Candidate `final.md:15,25,30 check 6`. **SUPPORTED_WITH_ORDER_PRECISION**. Kind: source assertion.

Rank means access popularity, not FIFO/LRU or age order. Ties have no explicit secondary order. The source is sufficiently discriminating to identify this behavior; the product choice between policies remains open.

Primary evidence:
- P07 `239-266,641-704` — The table tracks size/popularity; reads increment popularity; purge sums sizes, selects in ascending popularity, deletes until size_limit, then adjusts popularity.

### C35 — osmdroid expires plus default startup cleanup is an expiry-based bounded-retention precedent.

Candidate `final.md:15,25,46`. **SUPPORTED_METADATA_OVERSTATED_BOUND**. Kind: source assertion requiring trigger/eligibility binding.

Startup invokes cleanup, not unconditional expired-tile removal. Its volume trigger and row-eligibility conditions materially constrain the claimed bound. Expiry is an ordering field here, not a guaranteed expiry-time deletion policy.
Defect identity: D06.

Primary evidence:
- P05 `53-68,83-125` — cleanOnStartup is a static true default; the no-argument cleanup returns if database file length is at or below configured max bytes.
- P05 `128-152,660-730` — Expiration is optional. Cleanup orders non-null expiry ascending; ordinary no-argument cleanup passes includeUnexpired=true, so it may delete fresh tiles too and cannot select null-expiry rows.

### C36 — Expiry authority and eviction order remain unresolved for the viewer.

Candidate `final.md:15,27`. **SUPPORTED_PRODUCT_UNCERTAINTY_WITH_PROTOCOL_BOUNDARY**. Kind: topic-2 product uncertainty.

Viewer retention TTL/order is open and the precedents do not decide it. HTTP freshness precedence is already specified and must not be reopened as header versus heuristic preference. Separate retention expiry from HTTP validity.

Primary evidence:
- P01 `652-701` — HTTP freshness authority/heuristic precedence is specified.
- P05 `128-152,660-730` — osmdroid accepts externally supplied expiration and orders eligible rows by it.
- P07 `641-704` — libshumate uses tile payload size and access popularity.

### C37 — Unbounded keep-everything has no captured precedent, so reject it.

Candidate `final.md:15`. **REJECTION_REASON_NOT_ESTABLISHED**. Kind: reasonable product rejection with unsupported absence rationale.

Rejecting unbounded retention follows the original bounded brief. The corpus does not establish the stated absence of an unbounded/manual-retention pattern; browser quota and unheld code remain unknown. This weak rationale is recorded separately, not inflated into a mandatory alternative adoption.

Primary evidence:
- P09 `29-46,97-105,192-216` — Leaflet persists tiles and provides explicit remove/truncate operations; no automatic size/expiry eviction is shown in this complete module.
- P05 `692-695` — The captured cleanup path excludes tiles whose expiration is null.

### C38 — MBTiles 1.3 specifies no freshness/retention tile columns; viewer-owned metadata is needed.

Candidate `final.md:15,18,25`. **SUPPORTED_WITH_FORMAT_CONDITIONS**. Kind: source assertion plus reasonable metadata recommendation.

There is no standard per-tile freshness/eviction contract. Preserve that source identity is implicit in a tileset, not an extra mandatory source column, and TMS/XYZ conversion is required if exchanging keys. The source is a moving-master document titled 1.3, frozen by hash.

Primary evidence:
- P08 `39-42,81-97,99-129` — Required tile interface has integer zoom_level/tile_column/tile_row and blob tile_data. Version metadata is optional; extra metadata rows/views are possible. Tile row is TMS, reversed from XYZ Y.

### C39 — All stores have flat source/coordinate or resolved-URL identity.

Candidate `final.md:18,26`. **SUPPORTED_AS_ABSTRACTION_WITH_VARIANT_CONDITIONS**. Kind: product abstraction.

A useful shared abstraction. Sources do not establish one identical raw coordinate system or a universally sufficient URL-only HTTP variant key. Retain source/version namespace and any applicable Vary context.

Primary evidence:
- P08 `99-126` — MBTiles keys z/column/TMS-row within a tileset.
- P10 `49-55,72-85` — Leaflet storage keys are resolved normalized URLs.
- P05 `139-152,559-593,746` — SQL tile keys combine provider name and encoded coordinates.
- P07 `465-487` — Filesystem key includes cache_key, zoom/x/y.
- P01 `251-262,526-534` — HTTP reuse also depends on nominated Vary request fields.

### C40 — Freshness is metadata beside the tile blob and validators enable cheap checks.

Candidate `final.md:18,26-27`. **SUPPORTED**. Kind: source assertion and performance-neutral qualitative inference.

Cheap means potentially avoiding a body transfer, not zero network work or guaranteed freshness. Validation still requires compatible representations and successful server response.

Primary evidence:
- P05 `148-152,538-553` — Expiration is stored beside tile data.
- P07 `239-245,530-567,881-917` — ETag and confirmed-up-to-date mtime are retrievable independently of image bytes.
- P02 `3362-3385,3480-3500,3570-3612` — ETag/Last-Modified describe representation validators and reduce repeated transfer.

### C41 — Automatic invalidation fires only on non-GET methods; GET-only viewers get none.

Candidate `final.md:18,26`. **REFUTED_OR_CONFLATED**. Kind: source assertion and invalid inference.

No automatic global origin-change notification is guaranteed for GET-only clients. That narrower fact does not imply no refresh replacement, and non-GET is not the unsafe-method predicate.
Defect identity: D04.

Primary evidence:
- P01 `1017-1049` — Mandatory invalidation is tied to unsafe or unknown-safety methods and successful/non-error responses, not all non-GET methods; effect is limited to traversed caches.
- P01 `930-942,990-1015` — Conditional GET can update/replace stored responses; HEAD can freshen or invalidate stored GET responses.

### C42 — Source/version change must re-key or old tiles persist until retention removes them.

Candidate `final.md:18,26`. **OVERSTATED_EXCLUSIVITY**. Kind: product choice incorrectly presented as exclusive necessity.

Explicit re-keying is sensible for simultaneously retained logical source versions. It is not the only correct way to invalidate/replace old data. Same-identity replacement or explicit source removal is already present in the mapped corpus.
Defect identity: D04.

Primary evidence:
- P05 `63,128-152,213-244,386-397` — Existing expired tiles are overwritten by downloads; saveFile replaces; purge by source and remove by tile are explicit alternatives.
- P01 `803-810,930-942` — Revalidation can obtain a changed full response at the same URI and use it instead of the prior representation.
- P07 `338-346,465-487` — Namespacing offers a genuine version-isolation mechanism.

### C43 — At most eight distinct material findings; exactly eight numbered findings.

Candidate `final.md:20-27,42`. **SUPPORTED**. Kind: artifact structure.

Eight numbered findings correspond to the bundle themes. Repeated section prose/checks do not create extra distinct numbered findings. Word count is 1119 by whitespace split versus a soft ceiling of 1100; no hard word-limit violation is assigned.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

### C44 — One shared freshness substrate has independent producer/consumer policies; shared evidence does not settle both topics.

Candidate `final.md:27,30`. **SUPPORTED_WITH_LIMITS**. Kind: cross-topic synthesis.

Useful synthesis and properly independent unknowns. The shared record must still carry authority/variant/error context; a valid source freshness policy does not choose UI window, restart queue, or retention ranking.

Primary evidence:
- P01 `581-609,647-650,784-810,1536-1568` — HTTP transfer freshness and application presentation have distinct roles.
- P07 `530-567,627-748` — Freshening metadata and purging payloads are distinct operations.

### C45 — Propose a few compliant validator/max-age endpoint probes, shared across topics.

Candidate `final.md:30 check 1`. **REASONABLE_PROPOSED_CHECK**. Kind: proposed, not executed.

Useful discovery discriminator; do not turn a denial into usable-tile refresh evidence. Probe records should retain client headers/method, status/denial marker, Date/Age, source permissions, and response identity. This review made no new tile endpoint request.
Defect identity: D03.

Primary evidence:
- P04 `117-133,148-167` — Identification, caching and source usage conditions govern requests.

### C46 — Change tile-source version and check old-version tiles survive purge to validate re-keying.

Candidate `final.md:30 check 2`. **NON_DISCRIMINATING_AS_WRITTEN**. Kind: proposed check with wrong discriminant.

Survival after an unspecified purge tests the purge policy, not identity correctness. A version check should verify that old bytes are not selected for a new-version request, with replacement/removal or separate namespaces distinguished. Physical old-data survival may be deliberately allowed or deliberately forbidden.
Defect identity: D04.

Primary evidence:
- P05 `213-244` — purgeCache can remove all rows or all rows for a source.
- P07 `641-704` — Size/popularity purge is independent of source version isolation.

### C47 — Kill/restart acquisition; skip-existing completes without duplicates.

Candidate `final.md:30 check 3`. **REASONABLE_CONDITIONAL_PROPOSED_CHECK**. Kind: proposed, not executed.

Tests reconstructed/persisted list behavior plus correct acquisition options. Include an interrupted uncommitted tile and a tile requiring refresh. No such restart was executed here or proven by captures.
Defect identity: D02.

Primary evidence:
- P09 `29-46,97-105` — Committed tiles are persisted by key.
- P11 `76,139-165,212-218` — The list is in memory and skipping is disabled by default.

### C48 — Inject failures and test a URL-backoff gate/total bound.

Candidate `final.md:30 check 4`. **REASONABLE_PROPOSED_CHECK_WITH_BOUND_PRECISION**. Kind: proposed, not executed.

Useful test if failure classes, request timeout/cancellation, Retry-After, and total-budget semantics are specified. The captured files do not prove actual wait values or a hard total deadline.

Primary evidence:
- P13 `194-202` — Failures advance a per-URL gate.
- P14 `2763-2765,2798-2802` — Transient classifications/Retry-After and retry-start budget are distinct from an in-flight deadline.

### C49 — Compare stale window=max-age versus a fixed constant.

Candidate `final.md:30 check 5`. **REASONABLE_ONLY_WITH_SOURCE_BOUNDS**. Kind: proposed, not executed.

Can discriminate product staleness caps within permitted limits. Add boundary/denied-stale/newer-version selection checks; neither candidate numeric scheme may override source permission just because it is a product option.
Defect identity: D05.

Primary evidence:
- P03 `107-110,130-159,183-188` — SWR/SIE bounds are additional allowed staleness, not the fresh max-age duration itself.
- P01 `790-799` — Stale reuse needs permission and respects prohibitions.

### C50 — Overfill; compare size/rank versus expiry eviction by fresh-tile hit rate.

Candidate `final.md:30 check 6`. **USEFUL_BUT_NOT_COMPLETE_BOUND_VERIFICATION**. Kind: proposed, not executed.

A useful policy-performance discriminator. Fresh-hit rate alone does not prove bounded storage: separately observe configured trigger, payload and database bytes, null-expiry eligibility, slack, and completion/failure. Execution remains proposed.
Defect identity: D06.

Primary evidence:
- P07 `641-704,1065-1072` — Purge uses payload size/popularity with asynchronous overshoot.
- P05 `115-124,692-695` — SQL cleanup uses database size trigger and excludes null expiry rows.

### C51 — Ten predecessor bytes were hash/size checked.

Candidate `final.md:3,33`. **HISTORICAL_EXECUTION_UNASSESSED**. Kind: candidate self-report, not independently authenticated.

Topic-1 and topic-2 indices contain three and seven entries respectively, compatible with a ten-file input count. This reviewer independently checked their bytes. That does not prove what the candidate actually read or checked historically. Candidate logs/timings/predecessor artifacts are excluded.

Primary evidence:
- P15 `1-22` — A held header capture exists.
- P13 `1-226` — A held downloader source exists.

### C52 — 28 locator checks: 26 pass, 2 refinements, 1 refutation.

Candidate `final.md:3,33`. **HISTORICAL_EXECUTION_UNASSESSED_COUNT_AMBIGUITY**. Kind: candidate self-report; no SourcePASS from counts.

The displayed categories sum to 29 if disjoint; overlap is not explained. The referred spotcheck.md is not a mapped permitted source and was not read. No prior reviewer findings or earlier final versions were consulted. All current material claims were independently examined instead.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

### C53 — Five fresh captures, including one bounded header re-probe.

Candidate `final.md:3,33,46`. **INVENTORY_SUPPORTED_EXECUTION_UNASSESSED**. Kind: candidate self-report plus verified inventory.

The final-stage index has five entries, four byte-identical to earlier mapped source identities and one new denied-header record. It establishes inventory, not how many network operations occurred or whether the body was discarded.

Primary evidence:
- P16 `1-18` — A dated second header record exists.
- P04 `1-267` — The policy capture is identical by SHA-256 to the shared capture.

### C54 — Only static reading and single probes were executed; nobody ran checks 1-6 or code.

Candidate `final.md:3,33`. **SEPARATION_CLEAR_HISTORICAL_NEGATIVE_UNASSESSED**. Kind: proposed/executed distinction with provenance limit.

The final explicitly labels six checks proposed. Permitted source bytes contain no test execution evidence. No candidate activity/command logs were supplied or read, so universal historical no-execution assertions cannot be independently verified. This reviewer executed only local metadata/document processing, not any downloaded project code/tests.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

### C55 — Source keys/versions/capture limits resolve to held identities.

Candidate `final.md:45-46`. **MOSTLY_SUPPORTED_WITH_INDEX_CORRECTIONS**. Kind: identity/provenance check, not manifest-based SourcePASS.

All 27 map entries and four source indices match hashes; six document re-captures match; public repository metadata matches seven code blobs at claimed tags. The indices nevertheless contain interpretive errors (notably no curl version header, downloader no-backoff, constructor locator/order, and OSM offline-use characterization). Their annotations were not accepted as source facts.

Primary evidence:
- P14 `572` — The curl manual explicitly identifies version 8.23.0.
- P08 `1,81-97,99-126` — The document identifies MBTiles 1.3, includes optional tileset version metadata, and uses TMS rows.
- P13 `14,47,194-202` — The claimed osmdroid backoff symbols are present.

### C56 — Preserve byte-range and If-Range as optional leads.

Candidate `final.md:46`. **SUPPORTED_WITH_STRONG_VALIDATOR_LIMIT**. Kind: optional lead.

Optional status is preserved; successful future partial reuse remains untested. The denied response advertisement does not validate a real tile range mechanism.

Primary evidence:
- P02 `6109-6175,6467-6479,6562-6571` — Range support is optional and conditional; If-Range requires representation consistency via a strong validator.

### C57 — Preserve libshumate cache_key namespacing and osmdroid cleanOnStartup variant.

Candidate `final.md:46`. **SUPPORTED_WITH_DEFAULTS_AND_TRIGGER**. Kind: optional lead.

Real optional mechanisms; neither is proof of a completed namespace migration or pure TTL-based deletion.

Primary evidence:
- P07 `338-346,367-391,465-487` — cache_key is a tileset ID and a filename namespace, passed before cache_dir to new_full.
- P05 `56-93,102-124` — cleanOnStartup defaults true, is static/settable, and initiates size-triggered cleanup on first initialization.

### C58 — Deliver a bounded topic comparison and discriminating checks counting shared discovery and synthesis.

Candidate `final.md:29-43`. **STRUCTURE_SUPPORTED_AGGREGATE_PROVENANCE_PARTIAL**. Kind: artifact/inventory assessment.

The comparison binds two shared checks, two acquisition/refresh checks, and two display/retention checks. It explicitly synthesizes shared identity/freshness. The permitted indices have 12+3+7+5=27 capture entries but 16 distinct SHA-256 source identities (15 before final join; one added header observation), including provenance tree metadata. The final gives stage-local 10/5 operation self-reports, not a verified complete module operation accounting. No cost/speed/winner inference is made.
Defect identity: D04.

Basis: direct inspection of this frozen final/brief/inventory; no external-source factual proof is claimed.

## Additional qualifications

- **N01 (locator precision):** SHU:378 is the constructor, not store_tile_async (957). RFC5861:159 is preceding text; stale-if-error begins at 161. Traceable held bytes repair the locations, not the acquisition-skip/default conclusion.
- **N02 (version/index discrepancy):** The captured curl page has a version declaration at line 572: 8.23.0. Index descriptions saying no version header exists are false; no candidate-installed curl version was inferred.
- **N03 (unsupported absence rationale):** Unbounded retention is properly rejected by the bounded brief, but absence of a captured manual/unbounded retention pattern is not established (Leaflet explicit remove/truncate only; browser quota unknown). This does not compel adopting an unbounded design.
- **N04 (identity/format condition):** MBTiles source identity is implicit per tileset; TMS tile_row differs from XYZ Y. Optional tileset version metadata is already available. No concrete incompatible migration was supplied, so no separate integration defect is invented.
- **N05 (time-bound condition):** curl retry-max-time is a retry-start cutoff; in-flight transfers may overrun. A hard proposed viewer deadline needs separate attempt timeouts/cancellation. The hypothetical viewer is not proven to use curl, so no executed timeout defect is invented.
- **N06 (shared metadata conditions):** Use corrected current age including received Age/Date/transit/resident time, not merely time since file creation; preserve applicable Vary and cache directives, including storage/no-store eligibility. The final’s age shorthand does not prove a zero-age implementation.
- **N07 (process count limit):** The stage categories 26 pass + 2 refinements + 1 refutation sum to 29 if exclusive, while total is 28. Overlap is possible but unexplained. This is a reporting ambiguity, not evidence of fabricated execution.

## Source identities, versions and exact locators

All 27 map entries and four source indices matched their SHA-256. They represent 16 distinct primary byte identities, including the provenance-only Leaflet tree. Full path/hash and aliases are retained in `review.json` and `sources/input-integrity.json`. Hash checking did not substitute for the semantic checks above.

### P01 — rfc9111-http-caching

Primary URL: https://www.rfc-editor.org/rfc/rfc9111.txt
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/rfc9111-http-caching.txt`
SHA-256: `aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e`; 84477 bytes.
Declared version: RFC 9111 (June 2022), stable.
Mapped positions: 0, 16. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P02 — rfc9110-http-semantics

Primary URL: https://www.rfc-editor.org/rfc/rfc9110.txt
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/rfc9110-http-semantics.txt`
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; 502941 bytes.
Declared version: RFC 9110 (June 2022), stable.
Mapped positions: 1, 17. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P03 — rfc5861-swr-sie

Primary URL: https://www.rfc-editor.org/rfc/rfc5861.txt
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/rfc5861-swr-sie.txt`
SHA-256: `1193f1c8710af162e1b9fb4250d79bc6dd26497df4caeeaaa8bcb2fefdd2529e`; 10359 bytes.
Declared version: RFC 5861 (May 2010), informational, stable.
Mapped positions: 2, 15. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P04 — osm-tile-policy

Primary URL: https://operations.osmfoundation.org/policies/tiles/
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/osm-tile-policy.html`
SHA-256: `43eb4ea02cb38e1e1cc7df34f39d5e8b32202d2302f46935600c19c7f85d5ef2`; 18563 bytes.
Declared version: OSMF Operations tile policy web page, undated, as captured 2026-10-07.
Mapped positions: 3, 23. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P05 — osmdroid-sqltilewriter-6.1.20

Primary URL: https://raw.githubusercontent.com/osmdroid/osmdroid/osmdroid-parent-6.1.20/osmdroid-android/src/main/java/org/osmdroid/tileprovider/modules/SqlTileWriter.java
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/osmdroid-sqltilewriter-6.1.20.java`
SHA-256: `c1b92a4f629542792dd24811cc0c16e6da7cc31bf9fb8fea9ecc5c58007699c6`; 38315 bytes.
Declared version: tag osmdroid-parent-6.1.20.
Mapped positions: 4, 19. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P06 — osmdroid-networkavailabilitycheck-6.1.20

Primary URL: https://raw.githubusercontent.com/osmdroid/osmdroid/osmdroid-parent-6.1.20/osmdroid-android/src/main/java/org/osmdroid/tileprovider/modules/NetworkAvailabliltyCheck.java
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/osmdroid-networkavailabilitycheck-6.1.20.java`
SHA-256: `3a1e67db9a0230ebe4e123dd031e5eaf89c41917465a9b3d5ea1c611f280ff06`; 2846 bytes.
Declared version: tag osmdroid-parent-6.1.20.
Mapped positions: 5, 24. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P07 — libshumate-file-cache-1.7.0

Primary URL: https://gitlab.gnome.org/GNOME/libshumate/-/raw/1.7.0/shumate/shumate-file-cache.c
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/libshumate-file-cache-1.7.0.c`
SHA-256: `da1a4771500ec81d78b7b2cdfe38646d2ff57762d1f203e5f29ff785915039ea`; 32823 bytes.
Declared version: tag 1.7.0.
Mapped positions: 6, 18. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P08 — mbtiles-1.3-spec

Primary URL: https://raw.githubusercontent.com/mapbox/mbtiles-spec/master/1.3/spec.md
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/mbtiles-1.3-spec.md`
SHA-256: `e85a7d169bbaa7c18da5a9f1cb3a565280dc0bbc891f4ffc0c059cc2b5e5889d`; 15807 bytes.
Declared version: MBTiles spec 1.3 (master branch as captured).
Mapped positions: 7, 20. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P09 — leaflet-offline-TileManager

Primary URL: https://raw.githubusercontent.com/allartk/leaflet.offline/v3.2.1/src/TileManager.ts
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/leaflet-offline-TileManager.ts`
SHA-256: `ef245aa489eba8be7786e4770b7661bac689f63dbfb307000afa9334b5043b23`; 5819 bytes.
Declared version: tag v3.2.1.
Mapped positions: 8, 26. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P10 — leaflet-offline-TileLayerOffline

Primary URL: https://raw.githubusercontent.com/allartk/leaflet.offline/v3.2.1/src/TileLayerOffline.ts
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/leaflet-offline-TileLayerOffline.ts`
SHA-256: `55ec6317ff2ec4ef2197b2d1eefed9e0bff05fc9d0ce047dacf5978e179d8b3b`; 2479 bytes.
Declared version: tag v3.2.1.
Mapped positions: 9, 21. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P11 — leaflet-offline-ControlSaveTiles

Primary URL: https://raw.githubusercontent.com/allartk/leaflet.offline/v3.2.1/src/ControlSaveTiles.ts
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/leaflet-offline-ControlSaveTiles.ts`
SHA-256: `3ff2ec26433c5156d4362c03b1b69a2c7c2b2007a7dd067edbb046510eab911c`; 6625 bytes.
Declared version: tag v3.2.1.
Mapped positions: 10, 25. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P12 — leaflet-offline-tree

Primary URL: https://api.github.com/repos/allartk/leaflet.offline/git/trees/v3.2.1?recursive=1
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_shared_discovery-v3/sources/leaflet-offline-tree.json`
SHA-256: `5e50cae7edf2743fc0dbd47906bd6c160aafc5583b12f2dc196a6fd48b3e325d`; 23309 bytes.
Declared version: GitHub git/trees API for tag v3.2.1, as captured.
Mapped positions: 11. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P13 — osmdroid-maptiledownloader-6.1.20

Primary URL: https://raw.githubusercontent.com/osmdroid/osmdroid/osmdroid-parent-6.1.20/osmdroid-android/src/main/java/org/osmdroid/tileprovider/modules/MapTileDownloader.java
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_topic1_comparison-v3/sources/osmdroid-maptiledownloader-6.1.20.java`
SHA-256: `6b8f7c5d7a7dc1d01c00e878667bbe69613fc117f7828b3d9a73d77099a57d07`; 7901 bytes.
Declared version: tag osmdroid-parent-6.1.20.
Mapped positions: 12. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P14 — curl-manpage

Primary URL: https://curl.se/docs/manpage.html
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_topic1_comparison-v3/sources/curl-manpage.html`
SHA-256: `0ef77bad12997946fd2663bb2222b4201ab5cf3b2d724595cb099ca2ef58283d`; 465220 bytes.
Declared version: curl project man page (curl.se, live page as captured 2026-10-07; documents behavior current as of curl 8.x).
Mapped positions: 13. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P15 — osm-tile-headers-20261007

Primary URL: https://tile.openstreetmap.org/0/0/0.png
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_topic1_comparison-v3/sources/osm-tile-headers-20261007.txt`
SHA-256: `e4c9329a58234b1959e87b6149acd3b4de717eb6f8df632e405313df01b52bf2`; 794 bytes.
Declared version: live HTTP response headers from canonical OSM tile endpoint, as returned 2026-10-07T21:45:12Z.
Mapped positions: 14. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

### P16 — osm-tile-headers-probe2-20261007

Primary URL: https://tile.openstreetmap.org/0/0/0.png
Frozen primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M16-A/treatment/fresh_bundle_join_final-v3/sources/osm-tile-headers-probe2-20261007.txt`
SHA-256: `45e1dfafe270826209cf19de207c64817a4b9a0cccbf6a286240015d98e714c7`; 544 bytes.
Declared version: live HTTP response headers from canonical OSM tile endpoint, as returned 2026-10-07T22:15:39Z.
Mapped positions: 22. Original IDs/bindings/capture claims/limits retained verbatim in JSON aliases.

Six additional public primary document GETs match frozen hashes (RFC9110, RFC9111, RFC5861, OSMF policy, curl manual and MBTiles 1.3). Three public repository tree metadata GETs match the seven mapped code files to their claimed tags via independently computed git blob IDs. No new project source code was downloaded or executed. The held Leaflet tree independently matches the three TypeScript file blob IDs. The curl capture actually identifies 8.23.0; MBTiles 1.3 is on a moving master branch; each is frozen by SHA-256.

Additional URLs, capture timestamps, exact bytes/hashes, metadata object locators, headers and bounds are retained in `sources/review-capture-index.json`, `sources/mbtiles-provenance-check.json`, `sources/version-provenance-checks.json`, and `sources/leaflet-captured-tree-check.json`. The GitLab metadata was a bounded one-page request with the target present. No new OSM tile request was made; denial/request causality was not reconstructed.

## Assessment extent and unassessed remainder

All 58 consequential scientific/process claim groups, six obligations, four topic dispositions, shared identity/freshness/invalidation, eight findings, six proposed checks, and four optional leads were covered. Relevant governing specification passages and captured source call paths were read. This is not an audit of every unrelated RFC paragraph or uncaptured package file. M14 projection/preservation review is not applicable: this D-M16-A map contains no such authored set.

- **UNASSESSED: Candidate historical 10-file, 28-locator, 5-capture operation counts, actual read scope, no-code/no-tests historical assertions, body-discard claim.** No admissible activity/command logs; candidate reports and indices are inventory claims, not proof. Unmapped spotcheck, predecessor artifacts, timings and history are explicitly excluded.
- **UNASSESSED: Actual original tile request method/headers/User-Agent, exact denial cause, client dependence and content of discarded response bodies.** The two held header snapshots have no request metadata or bodies. They prove recorded header classes only; this review made no new tile request.
- **UNASSESSED_OUTSIDE_FROZEN_EVIDENCE: End-to-end runtime behavior of uncaptured downloader delegates, queue persistence, deployed viewer UI/storage and future provider survey.** Only bounded source inference is possible; proposed checks were not executed and no implementation was supplied.

The diagnostic grade conservatively retains these provenance limits. No missing historical logs were inferred from file existence, matching hashes, process exit codes or manifests. No preset adoption truth, exhaustive unknown answer key, cost/winner comparison or candidate feedback was used.

## Timing and delivery

The actual T3 requestedAt was 2026-10-07T22:32:37.487Z (startedAt 22:32:38.499Z). The supplied earlier hard deadline, 22:52:15.281664Z, governs. Review was written before expiry; actual local verification/public capture durations and elapsed time are recorded in `timings.json`. Unknown input/cache/output/billing counters remain null, with native counters separate. Final T3 delivery is a concise artifact/status result with no pending children.
