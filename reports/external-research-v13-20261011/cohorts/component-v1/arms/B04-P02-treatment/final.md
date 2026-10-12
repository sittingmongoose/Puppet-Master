# HTTP response-cache component for the offline documentation reader

**Case:** B04-P02  
**Arm:** treatment  
**Disposition:** final source-backed proposal for a private, single-user cache  
**Protocol target:** RFC 9110 and RFC 9111

## 1. Recommendation and scope

Put a bounded private response cache in front of an existing HTTP client. Prefer a mature RFC-aware cache implementation if an audit confirms that its exact version can meet this proposal's directive, variant, revalidation, persistence, and account-isolation requirements. If no suitable implementation passes that audit, build a narrow GET cache state machine around the existing HTTP client. Do not build a new HTTP client.

The first release persists only complete 200 OK responses to GET. It does not cache HEAD, ranges or 206 Partial Content, redirects, errors, or other status codes. Other methods and unsupported responses pass through to the HTTP client and can still be shown for the current request. A 304 Not Modified is a bodyless validation result that can update an eligible stored 200; it is never a standalone document entry. This deliberately bounded status profile does not claim general-purpose RFC cache coverage.

The component supports anonymous public documents and authenticated documents. It keeps the cache private to the user agent, never turns it into a shared/server cache, and never builds a second account's lookups on top of an old account's entries. Signing out must make the prior account's cached content inaccessible before another account can use the reader.

## 2. Ownership, keys, and storage

### Partition and variant selection

Select an entry by the effective request target URI, method (GET), an account partition, and the response's Vary dimensions. Use a distinct anonymous partition and an opaque account identifier plus a session generation for authenticated data. A URL that looks public is not enough to join an anonymous response to an authenticated response or to join two accounts.

For each field named by Vary, retain enough information from the request that produced the entry to compare it with a later request. Apply only the normalizations permitted by that field's specification, such as permitted whitespace changes, combining repeated field lines, or case normalization where the field's values are case-insensitive. An absent field matches only an absent field. A Vary value containing * never matches; the first release skips persisting such a response because it cannot be reused. These rules and the protocol meaning of Vary are in [RFC 9111 §4.1](https://www.rfc-editor.org/rfc/rfc9111.html#section-4.1).

Never persist raw Authorization or Cookie values in cache keys, metadata, filenames, telemetry, or logs. If a response varies on a sensitive field, use a keyed, non-reversible fingerprint under an OS-protected per-account key only after that mechanism is implemented and tested. Treat the fingerprint as private data and clear it at sign-out. If a safe comparison cannot be made, do not persist or reuse that response. The RFC defines variant matching; this credential-handling rule is application policy.

### Sign-out and account changes

On sign-out, first invalidate the in-memory account session and block reads from its partition; cancel outstanding validation and storage work; drop body and metadata references; then purge that account's disk entries and variant fingerprints. Do not let a subsequent anonymous or authenticated session address the old partition. If purge fails, leave the partition denied and report that cleanup is pending; do not fall back to reading it. Destroy per-account cache keys if encrypted storage is used. Do not promise physical secure erasure from flash storage unless the platform's storage guarantees have been verified.

The RFC's private directive prohibits shared-cache storage; it explicitly permits a private cache to store a response subject to the other rules. It is not an encryption or account-isolation guarantee. The account partition and sign-out barrier are additional product controls. RFC 9111's special Authorization restrictions in §3.5 are specifically for shared caches, so they do not replace these controls in this private cache.

### Representation and bounded persistence

Keep the received representation bytes and the metadata that describes their content encoding together. Decode for display after retrieval; do not silently transform the cached representation. Store each complete body and its metadata as one immutable generation, then atomically publish a manifest that points to that generation. An interrupted write must leave either the old complete generation or a miss, never a body paired with unrelated metadata. Corrupt or incomplete entries become misses.

Enforce hard byte, entry-count, and per-entry ceilings. Proposed starting limits are 512 MiB total, 10,000 entries, and 64 MiB per body; these are unmeasured product defaults to confirm against representative documentation and target-device storage before release. If an item exceeds a limit, stream it to the current request without retaining it. When space is needed, evict least-recently-used complete entries, never fragments of an entry. Count metadata and variant records toward the total.

## 3. Cache eligibility and directive policy

Apply the RFC storage conditions to every candidate: understood method and status, final response, applicable cacheability, and all relevant response and request directives. The first-release 200 profile is a deliberate subset. Do not infer that every received response may be persisted.

| Condition or directive | First-release behavior |
|---|---|
| Response no-cache without a field list | It may be stored if otherwise eligible, but it cannot satisfy another request until successful validation. Online, validate on every reuse; offline, show an unavailable/validation-required state. It is not equivalent to no-store. |
| Qualified response no-cache (field list) | The protocol permits reuse if the listed fields are excluded from the subsequent response or successfully revalidated. Because selective field removal is easy to get wrong, v1 conservatively treats it as unqualified no-cache and validates the whole response. This is an explicit stricter product policy, not the directive's full definition. |
| Response no-store | Do not persist it or reuse it for another request; make the best effort to remove transient cache copies promptly, except when the must-understand exception below is implemented for a supported status. |
| Request no-store | Do not store the request or a response to it. Per RFC 9111 §5.2.1.5, this alone does not prohibit satisfying the request from an already stored eligible response; the directive does not apply retroactively to that entry. |
| must-understand | The v1 support table is 200 as a stored representation and 304 only as metadata for a matched stored 200. With must-understand plus no-store, RFC 9111 §5.2.2.3 says a cache that implements the directive should ignore no-store when it understands and implements that status's caching requirements. V1 will take that exception for 200 only after its full cache path passes the directive, age, Vary, and revalidation fixture suite; until that release gate passes, it fails closed and does not persist the response. A 304 is never stored as a standalone representation, and any other or unsupported status is not stored. |
| private | This is compatible with the private user-agent cache, subject to other eligibility rules. It does not permit a shared cache to store the response and does not itself promise confidentiality. |
| must-revalidate | A stale entry must be successfully validated before reuse. If disconnected, return an error/unavailable state rather than showing the stale body; RFC 9111 says the generated status should be 504 unless another error is more applicable. |
| s-maxage and proxy-revalidate | These shared-cache rules do not become private-cache rules. Do not apply them as if this were a shared cache. |

An incoming request with Cache-Control: no-cache asks that a stored response not be used without successful origin validation; v1 honors that preference by validating. A response-level no-cache requirement remains stronger: no successful validation means no reuse. A no-store response is not made available offline, except where the narrowly conditioned must-understand exception above is deliberately implemented for a supported status. Even then, stale-use rules still apply; this is not a general offline override.

For the private cache, calculate freshness using max-age, otherwise Expires relative to Date (using receipt time when Date is absent as specified by HTTP). Do not use shared-cache s-maxage. V1 does not assign heuristic freshness: without explicit freshness, an otherwise storable entry is immediately treated as needing validation. Keep such an entry only when it has a useful validator; otherwise bypass persistent storage. Conflicting or invalid freshness directives are treated conservatively as stale. The response is fresh only while freshness_lifetime > current_age.

Do not define age as elapsed time since local receipt alone. Implement RFC 9111 §4.2.3 using the request time, response time, Date, Age, and current time:

    apparent_age = max(0, response_time - date_value)
    response_delay = response_time - request_time
    corrected_age_value = age_value + response_delay
    corrected_initial_age = max(apparent_age, corrected_age_value)
    resident_time = now - response_time
    current_age = corrected_initial_age + resident_time

An absent Age value is zero. RFC 9111 §5.1 says an invalid Age value should be ignored; use the remaining valid inputs, and fail closed as stale if no trustworthy age can be established. Use a monotonic clock for in-process residence time. If a restart, wall-clock rollback, or missing clock makes age uncertain, require validation; a cache without a clock must revalidate on every use. If the cache exposes a response through HTTP semantics, generate Age from current age rather than leaving an obsolete stored value. If the renderer receives only a body object, retain current age and the last successful retrieval/validation time in cache metadata for the UI without fabricating downstream HTTP headers.

## 4. Revalidation and 304 handling

For a stale, no-cache, or request-no-cache entry, validate the selected URI/account/variant candidate with the current GET and its relevant request fields. Send its ETag in If-None-Match; weak entity tags are valid for GET validation because If-None-Match uses weak comparison. When a single stored response has Last-Modified, send If-Modified-Since as appropriate, optionally alongside ETag for interoperability; If-None-Match takes precedence. Bind every validator to its selected response and variant, never to a URL-wide or global ETag. If there is no usable validator, perform a full GET.

A 304 contains no content or trailers. It is not a new representation body. On receipt, begin with the stored responses that could have been selected for the request, then apply RFC 9111 §4.3.4's matching rules: matching strong validators identify all corresponding stored responses for update; if there is no strong validator, a matching weak validator selects the most recent matching response; without any validator, update only when there is exactly one eligible stored response and it also has no validator. If a supplied strong validator matches none of the eligible stored responses, do not apply the 304 to any of them.

For each identified response, update its stored header fields with the 304 metadata according to RFC 9111 §§3.2 and 4.3.4. Do not ignore fields such as Date, ETag, Vary, Cache-Control, or Expires when supplied. Keep the existing body; apply the RFC field-update exceptions, including Content-Length, and preserve representation integrity if an updated field would make the stored bytes inconsistent. Recompute freshness from the validation exchange and updated metadata; do not simply reset an elapsed-time counter to zero. If Vary changes, reevaluate it against the triggering request; if safe variant identity cannot be established for an entry, leave it unselectable and fetch a full representation rather than guessing. If no eligible stored body exists, or matching/update rules reject every candidate, retry once with an unconditional GET. Never return an empty document or invent a 304 body.

A full 200 response replaces the selected generation only if the new response is eligible; publish body and metadata atomically. Keep unrelated variants isolated. For a validation failure or 5xx, surface the actual error by default. Stale fallback is allowed only when the cache is disconnected or the client/origin explicitly permits it and no directive forbids it. In particular, no-cache and must-revalidate prohibit stale reuse.

## 5. User-visible states and graceful failure

- **Fresh cached:** show the representation and identify it as cached/fresh, with its last retrieval or validation time. Never describe it as a live fetch.
- **Validation pending:** for entries that require validation, show progress without exposing a body that cannot legally be reused yet. On 304, update metadata and then show the retained body; on 200, show the new body.
- **Offline, stale but permitted:** offer a visibly labelled “Open stale copy” action only when disconnected and no directive prohibits reuse. Show its age and last successful retrieval/validation.
- **Offline, stale prohibited or no matching entry:** show a clear unavailable/validation-required message; do not show the body. For must-revalidate, use 504 unless another error status is more applicable.
- **Transport/server failure:** show the error and last successful time. Use a stale copy only if the protocol and explicit product policy permit it. No-cache/must-revalidate entries stay unavailable until validation succeeds.

These states retain useful offline behavior without silently presenting prohibited content as current.

## 6. Alternatives and non-cached requests

**Mature RFC-aware cache/library.** This is the preferred option if an audit of the exact version confirms the required handling of no-cache/no-store/private/must-understand, Vary, age, conditional validation, 304 metadata, disk behavior, and account-partitioned storage. It reduces protocol maintenance, but it does not remove the need to audit persistence, sign-out, cache-control configuration, and user-visible failure states. No library or version has been selected or audited in this review.

**Narrow custom GET cache.** This can keep the product-specific scope and storage model small, but it still owes every applicable rule stated above. It must use the existing HTTP client's parsing/transport and pass the fixture suite before release. Do not reduce it to URL plus local receipt time or treat 304 as “ignore headers and reset age.”

Do not persist unsafe methods, non-GET requests, ranges/partial responses, unsupported statuses, oversized bodies, Vary: *, or responses whose sensitive variant cannot be matched safely. Pass them through and show their current result. Request no-store prevents new persistence but, as noted above, can still use an eligible preexisting cache hit. Response no-store prevents future cache reuse, subject only to the specifically implemented must-understand exception. A no-cache response can be retained for validation; it is not classified as no-store.

The rejected URL-only cache remains rejected: it conflates account ownership and content-negotiation variants. The original draft's retained choices also remain: GET-only scope, account separation, representation bytes and encoding metadata, complete-entry LRU eviction, mature-library-versus-custom comparison, live fetch for entries that cannot be reused, and explicit separation between HTTP cache and a future user-requested export.

## 7. Validation plan and present evidence status

Use a local synthetic protocol fixture server as the first oracle, with the pinned RFC sections as the expected behavior. These are planned tests; none ran in this review.

1. **Directive and eligibility matrix:** compare request and response no-store, no-cache versus no-store, qualified no-cache under the conservative whole-response policy, private in the private-cache context, must-understand with supported and unsupported statuses, freshness directives, and stale must-revalidate. Assert that a forbidden body is never returned offline.
2. **Variants:** verify exact URI/account isolation; absent versus present Vary fields; repeated fields and only valid field-specific normalization; distinct language/encoding values; Vary changes; and that Vary: * never selects an entry.
3. **Age and freshness:** calculate apparent age, upstream Age, request/response delay, residence time, max-age/Expires precedence, equality at expiry, missing Date, invalid Age handling, conflicting/invalid freshness fields, and clock rollback/restart. Assert that uncertainty leads to validation rather than a false fresh state.
4. **Conditional requests and 304:** cover If-None-Match weak comparison, Last-Modified fallback/precedence, strong match to multiple entries, weak match to the most recent entry, no-validator single-entry matching, nonmatching validators, changed Vary and Cache-Control/Expires/Date/ETag metadata, the Content-Length exception, bodyless 304, and one unconditional retry when no valid body can be updated. Assert the old body is paired only with compatible metadata.
5. **Network and UI behavior:** test offline fresh entries, eligible stale entries, no-cache/must-revalidate prohibition, 304 success, full 200 replacement, timeout, 5xx, and last-successful-time labels.
6. **Ownership and storage:** sign out with open views and in-flight writes, switch accounts on the same URI, test authorization-varying content, enforce byte/count/entry caps, LRU whole-entry eviction, corrupt metadata/body, process termination during publication, and purge failure. Assert the prior partition remains unreadable after sign-out even if cleanup is pending.
7. **Integration and measurement:** audit the chosen library/version or run the same suite against the custom layer. After protocol correctness passes, measure storage and representative latency using a documented public-document corpus. Do not infer protocol correctness from a speed or size benchmark.

**Evidence actually obtained:** the frozen primary text copies of RFC 9110 and RFC 9111 were inspected at the locators listed in source-map.json. No HTTP implementation, library audit, synthetic fixture, replay, benchmark, or real network/offline test ran. The proposal makes no claim that these future checks passed.

**Execution route record:** the requested route was Luna Max Standard. The native Goal receipt returned an active Goal/thread ID and objective but no provider/model/tier or option fields; the T3 runtime identifies this agent as gpt-6-luna with max reasoning effort. The actual service tier is not exposed by the Goal tools and remains unknown; no route change was made by this review.
