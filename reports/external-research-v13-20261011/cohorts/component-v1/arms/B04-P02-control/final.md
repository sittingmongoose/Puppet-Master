# HTTP response cache for an offline documentation reader

## Decision

Build a small, private, disk-backed cache for complete GET responses. Keep HTTP caching behavior aligned with RFC 9110 and RFC 9111, and make account partitioning, stale use, and storage limits explicit product rules. Reuse fresh eligible responses without a network request; revalidate stale responses when connected; and show an unmistakable stale or unavailable state when the network cannot validate an entry.

This component is a user-agent cache for one user at a time. A future shared cache or proxy is outside scope. The existing HTTP client remains responsible for transport, authentication, redirects, TLS, and message parsing; this proposal does not rebuild it. Only GET responses are candidates for caching.

## 1. Scope, ownership, and storage

### Request and response boundary

The first release passes non-GET requests through and never caches their responses. It stores only complete, understood 200 responses to GET. A 304 response is an update signal for an already stored response, never a body to store or render. Other statuses, partial responses, incomplete transfers, and status codes whose caching behavior the component does not implement pass through without caching. This is a deliberately small implementation scope; RFC 9111 permits caches to support additional methods and statuses when their rules are implemented. [RFC 9111 §§2–3](https://www.rfc-editor.org/rfc/rfc9111.txt)

Before storing a 200 response, apply RFC 9111’s storage conditions: understood request method, final and understood response status, applicable cache directives, and an RFC-recognized cacheability basis. The first release will not assign heuristic freshness. Without a valid explicit lifetime, a stored response is stale immediately and must be validated for ordinary online reuse. An otherwise cacheable response may still be retained for revalidation. This avoids inventing a freshness lifetime while keeping validators useful. [RFC 9111 §§3, 4.2.1–4.2.2, 5.2.2, 5.3](https://www.rfc-editor.org/rfc/rfc9111.txt)

### Private partitions

Use a cache key containing:

- Request method and target URI.
- A separate anonymous partition or account/security-context partition.
- Every request field named by the selected response’s Vary field, with the matching rules below.

Do not let a response fetched under an account satisfy an anonymous request, another account’s request, or a later session merely because the URI looks public. Public anonymous content may use its own partition. A private cache is dedicated to one user; RFC 9111 permits private caches to store responses marked private and does not apply the shared-cache Authorization restriction to this component. The private directive controls cache scope; it is not itself a confidentiality guarantee. [RFC 9111 §§1, 3, 3.5, 5.2.2.7, 7.3](https://www.rfc-editor.org/rfc/rfc9111.txt)

Protect account data at rest with a per-account encryption key held by the platform’s secure key store. Do not persist raw credentials in cache metadata or logs. If a Vary field contains sensitive values such as Authorization, retain only an encrypted value or a per-account keyed fingerprint that preserves equality checks; apply only normalizations known to preserve that field’s semantics. If the component cannot safely compare a sensitive Vary value, it must miss and fetch from the network. These are product security controls, beyond the RFC’s cache-key minimum.

On sign-out, revoke the account key and deny reads from that partition immediately, cancel or fence in-flight requests and writes with the signed-out session generation, then delete the partition as a best-effort cleanup. A subsequent user must not be able to open the old account’s entries during or after cleanup. Keep entry body and metadata in one atomic generation so a crash cannot pair one account’s body with another generation’s metadata.

### Content variants

For each stored response, retain the original request values for its Vary fields, protected as above. A later request matches only when every named field matches under transformations known to preserve that field’s meaning. A missing field matches only another missing field. Vary: * always fails to match; treat it as a cache miss and do not offer the response as reusable. If multiple stored responses match, choose according to a known preference rule for the nominated field, otherwise use the most recent response as RFC 9111 specifies. Do not normalize arbitrary header values or conflate absent and empty fields. [RFC 9111 §4.1](https://www.rfc-editor.org/rfc/rfc9111.txt)

### Bounded storage and representation integrity

Set a configurable disk quota. Evict least-recently-used complete entries as whole units; never evict a body independently of the metadata needed to interpret it. Write through a temporary generation, verify its digest, and atomically publish body plus metadata. Preserve representation bytes and their Content-Encoding and other interpretation metadata together; do not decode a body and later attach incompatible metadata. RFC 9111 requires caches to retain received fields subject to its stated exceptions and defines how supplied metadata updates a stored response. [RFC 9111 §§3.1–3.2](https://www.rfc-editor.org/rfc/rfc9111.txt)

## 2. Directive and cacheability policy

The following distinctions are central to the implementation:

| Directive or condition | First-release behavior |
|---|---|
| no-cache without arguments | Storage may be allowed when the response otherwise qualifies. Before any reuse, forward a request for successful validation. If validation cannot succeed, do not reuse the response, including while offline. |
| no-cache with field names | Recognize and retain the qualified form, but conservatively handle it as unqualified no-cache: validate the whole response before each reuse. Do not implement the optimization that omits selected fields from a response. |
| no-store | Do not retain any part of the request or response for later reuse; promptly release cache-owned volatile copies. The current network response may be displayed for its current request, but it cannot become an offline entry. |
| must-understand | Store only when the component understands and implements the caching requirements for that response status. The initial supported stored status is complete 200. Do not cache other statuses carrying must-understand. |
| no-store with must-understand | RFC 9111 permits a cache that understands the directive and the status-specific caching requirements to ignore no-store. The first release may use this exception only for status behavior it has fully implemented and passed conformance fixtures; otherwise it honors no-store. If used, record that basis in entry metadata, show a visible “stored under must-understand exception” indicator, and still expose the ordinary fresh/stale/offline status; the exception does not bypass any other directive. This is a scoped implementation choice, not a claim that RFC 9111 universally forbids the exception. |
| private | Keep eligible responses in the private account partition. Do not discard them merely because private is present. Qualified private field names constrain shared caches; they do not turn this user-agent cache into a shared cache. |
| Unknown extension directive | Ignore it as RFC 9111 requires. If the directive field itself cannot be parsed safely, do not make a cache hit until an online request establishes a usable response. |
| Unimplemented response status | Return the network response for the current request but do not cache it. When must-understand is present, lack of status-specific support also bars storage. |

The distinction is not “cache versus do not cache”: no-cache governs reuse and validation, while no-store governs retention and reuse. A qualified no-cache field list could allow selected fields to be omitted or validated separately; treating it as whole-response no-cache is a documented, more conservative v1 policy. Private permits a private cache to store, subject to the remaining rules. RFC 9111’s must-understand exception to no-store is also retained as an explicit, narrowly scoped capability rather than erased or overstated. [RFC 9111 §§3, 5.2.2.2–5.2.2.7](https://www.rfc-editor.org/rfc/rfc9111.txt)

Because this is never a shared cache, shared-only s-maxage and proxy-revalidate rules do not govern it. Still apply every directive that does govern a private cache, especially must-revalidate and no-cache. A request’s own Cache-Control directives also affect lookup: no-cache forces validation; max-age and min-fresh constrain an acceptable hit; max-stale can permit stale use only where response rules allow it; only-if-cached forbids a network fetch and yields an unavailable/cache-miss result when no response can be used. A request no-store prevents storing that exchange. [RFC 9111 §§5.2.1–5.2.2](https://www.rfc-editor.org/rfc/rfc9111.txt)

## 3. Freshness and age

Use the response’s explicit freshness information. A valid max-age takes precedence over Expires; use Expires when max-age is absent. Do not apply s-maxage as though this private cache were shared. A response with no usable lifetime is immediately stale under the first-release no-heuristics policy, though it can remain available for conditional validation. [RFC 9111 §§4.2.1, 5.2.2.1, 5.3](https://www.rfc-editor.org/rfc/rfc9111.txt)

Do not use time since local receipt as the whole age. Compute age using Date, upstream Age, request time, response time, and resident time:

- apparent age = max(0, response time minus Date);
- corrected age value = upstream Age plus response delay;
- corrected initial age = max(apparent age, corrected age value);
- current age = corrected initial age plus resident time.

This accounts for time already spent in upstream caches and in transit. Use monotonic time for request delay and in-process residency. Persist enough state to continue aging across restarts; if clock rollback, reboot state, malformed freshness fields, arithmetic overflow, or missing timing data makes age unreliable, conservatively treat the entry as stale and validate rather than granting a fresh hit. Saturate age arithmetic so overflow can never become a negative age. The RFC’s delta-seconds rules specify saturation behavior for unrepresentable values. [RFC 9111 §§1.2.2, 4.2.3, 5.1](https://www.rfc-editor.org/rfc/rfc9111.txt)

A fresh eligible entry can avoid the network and reduce latency. Record the time retrieved, last successfully validated time, calculated age, freshness deadline when available, selected account partition, and whether the response was reused or revalidated. The interface must not label a stored view “live” merely because it is visible.

## 4. Conditional validation and 304 updates

When an entry is stale or validation is required, send a conditional GET for the matching URI and Vary context. Use the stored ETag in If-None-Match when available and Last-Modified in If-Modified-Since when available; sending both is useful for interoperability. If-None-Match uses weak comparison for cache validation. Validators are associated with stored representations for that resource and selected request context, not treated as globally unique URL tokens. [RFC 9111 §§4.3.1–4.3.3; RFC 9110 §§8.8.1–8.8.2, 13.1.2–13.1.3](https://www.rfc-editor.org/rfc/rfc9111.txt)

A 304 has no content. It means the client can use an applicable stored representation, and its headers may update that representation. Start with only the stored responses that could have been selected for the request, including method, URI, account partition, and Vary match. Then apply RFC 9111’s selection rules: strong validators select stored responses in that candidate set with the same strong validator; absent a strong validator, a matching weak validator selects the most recent matching candidate; with no validator, update only when there is exactly one candidate and it also has no validator. If no applicable stored body is selected, do not show an empty page or attach the 304 to every response for the URL: retry with an unconditional GET. [RFC 9111 §4.3.4; RFC 9110 §§8.8.1, 15.4.5](https://www.rfc-editor.org/rfc/rfc9111.txt)

For each selected response, preserve its body and update supplied response fields using RFC 9111 §3.2’s rules and exceptions, including its special treatment of Content-Length and fields on which stored processing depends. Recompute freshness, age, Vary selection, and reuse eligibility after the update. If a 304 changes Vary, the cache must still be able to associate the stored body with the original request values under the new selection rule; otherwise it should discard that candidate and fetch an unconditional response. A refreshed no-store policy cannot leave an entry available for later offline reuse. [RFC 9111 §§3.2, 4.1, 4.3.4–4.3.5; RFC 9110 §15.4.5](https://www.rfc-editor.org/rfc/rfc9111.txt)

A full 200 response means the nominated stored representation was not the one to reuse. Use the new complete response for this request, replace the corresponding eligible cache entry atomically, and retain it only if all storage and directive requirements pass. If it is no-store or otherwise uncacheable, display it only for the current network request and discard it from cache state.

## 5. Offline behavior and visible states

RFC 9111 permits a disconnected cache to serve some stale responses, but it forbids stale generation when an applicable directive prohibits it. In particular, a stale must-revalidate response cannot be reused while disconnected: generate an error, normally 504 unless another status is more applicable. Unqualified no-cache likewise requires successful validation before reuse. A stale response can be used offline only when disconnected or stale use is explicitly permitted and no applicable directive prohibits it. [RFC 9111 §§4.2.4, 5.2.2.2, 5.2.2.4]

For this reader, an explicit “allow stale copies while offline” preference is the stale policy. It applies only to entries otherwise eligible for stale use. It never overrides no-cache, must-revalidate, no-store, a failed Vary match, or account-partition failure. The user can also request an online refresh. An origin 5xx or transport failure may be treated as a failed validation only where RFC stale-use conditions and this preference permit it; otherwise show the error. [RFC 9111 §§4.2.4, 4.3.3]

| State shown | Behavior |
|---|---|
| Fresh copy | Serve the eligible cached body; show retrieval time and that no live check occurred for this view. |
| Checking for updates | Send the conditional request; do not yet label an old body as refreshed. |
| Updated | On an applicable 304, reuse the selected body with updated metadata; on a full eligible 200, replace it. |
| Offline, stale copy | Only show when the explicit stale preference applies and no directive blocks use. Show the stale badge, age, and last successful retrieval/validation. |
| Unavailable offline | Show when there is no matching response or reuse is prohibited; do not expose a prohibited cached body. Return a 504-style unavailable result when appropriate. |
| Network response not cached | Display the response to the current request, then discard it from cache state if no-store or another rule bars retention. |

A permanent user-requested export is a separate product feature with its own visible consent, provenance, account, and retention rules. It is not a cache override. The first release should not export a no-store response. RFC 9111 encourages applications to define how application-level storage relates to HTTP directives so users and authors are not surprised. [RFC 9111 §§5.2.2.5, 6, 7.3](https://www.rfc-editor.org/rfc/rfc9111.txt)

## 6. Request path

1. Identify the method, target URI, account/security context, request directives, and the response variants that match Vary.
2. If this is not GET, forward it without cache reuse or storage.
3. If only-if-cached is set, do not contact the network. Return a usable matching response or an unavailable/cache-miss result.
4. Apply storage/reuse directives. no-store prevents retention; no-cache or an explicit request refresh requires successful validation; must-revalidate bars prohibited stale reuse.
5. Calculate age and freshness. Serve a fresh eligible response without network access. Otherwise validate it if possible; if no validator exists, issue an unconditional GET.
6. On 304, select and update only applicable stored response(s), preserving the selected body. If no body can be selected, retry unconditionally.
7. On a full response, show it for the current request and commit it only if status, storage conditions, directives, Vary data, account ownership, and quota all allow an atomic entry.
8. On network failure, choose a stale response only through the offline rule above; otherwise show unavailable/error.

## 7. Alternatives and investigation history

| Approach | Benefit | Cost and decision |
|---|---|---|
| Mature RFC-aware HTTP cache library | Reuses maintained protocol logic and can reduce semantic drift. | Audit the exact library and version for private-cache behavior, persistent storage, Vary, Age, directive handling, 304 selection/metadata updates, and account partitioning before adoption. No library audit has been performed, so no library is approved here. |
| Narrow custom GET cache | Makes account partitioning, offline states, bounded storage, and entry lifecycle explicit while limiting the supported surface. | The team owns protocol changes and edge cases. Adopt only with the fixture suite below and a requirement that unsupported behavior fails closed. This is the proposed direction if no audited library fits. |
| Live network only | Simple behavior and no persistent response cache. | No offline access and no cache latency savings. Keep as the fallback for ineligible requests and entries. |
| Explicit export | Gives a user a durable copy independent of routine cache eviction. | Separate user-facing storage, consent, provenance, account, and retention design. It does not change cache directive handling; no-store export is disabled in v1. |

The working draft records that an earlier URL-only key was rejected because account-specific responses and content-negotiated variants can differ. That history is retained as a design decision, not as a claim about a shipped implementation. The useful alternatives remain live retrieval and a mature library; no library is treated as audited or conformant without evidence.

## 8. Validation plan and current evidence

No HTTP cache implementation, synthetic fixture replay, real network/offline test, library audit, latency measurement, or deployment test was run for this proposal. The approved RFC source copies were SHA-256 checked against all 18 input-map entries. The public RFC Editor copies were also opened for primary-source verification. The source map records the RFC versions, local hashes, section locators, scope, and unresolved implementation questions.

Before release, build a deterministic fixture runner with a controllable origin and clock. Use these cases as expected-result checks against RFC 9110/9111:

1. Vary variants for Accept and other named fields; absent versus present fields; only semantics-preserving normalization; Vary: * never matching; multiple candidates and deterministic choice.
2. Age from Date, Age, request/response delay, and resident time; already-aged upstream responses; future Date; malformed values; arithmetic saturation; reboot, clock rollback, and missing timing state.
3. no-cache versus no-store; qualified no-cache whole-response policy; private and private field names; must-revalidate online/offline; must-understand with supported and unsupported status codes; the no-store exception; unrecognized extensions; request no-cache, no-store, max-stale, and only-if-cached.
4. Fresh hit without network; stale conditional request; If-None-Match weak comparison; Last-Modified fallback; 304 with matching strong, weak, or absent validators; several variants; Vary or Cache-Control metadata changes; unmatched validator; no body; no stored candidate; unconditional GET fallback.
5. Authenticated versus anonymous partitions; two accounts at the same URI; sign-out during read/write; credentials absent from logs and cache metadata; encryption-key revocation; corrupted entry; atomic write interruption; quota eviction of complete entries.
6. UI and status results for fresh, revalidating, stale-offline-allowed, stale-prohibited, no-store current response, missing body, 5xx, and transport failure.
7. A dependency review for each candidate library/version and separate latency, storage, and representative-document measurements after protocol correctness passes.

Record each fixture’s expected source section and actual output. Until those tests run, all implementation behavior, library suitability, platform key erasure, offline usability, performance, and deployment compatibility remain unverified.

## 9. Evidence limits and execution route

The normative target is RFC 9110 (HTTP Semantics, STD 97, June 2022) and RFC 9111 (HTTP Caching, STD 98, June 2022). Their official RFC Editor URLs and exact copied-body SHA-256 hashes are in source-map.json. The native Goal create receipt did not expose provider, model, tier, or execution options. The host runtime context reported gpt-6-luna with max reasoning effort; it does not confirm the requested Luna Max Standard service tier. The actual service tier is unknown.