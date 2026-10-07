# Evidence-first answer — D-M10-A

## Bounded question

Answer this bounded question from RFC 9111/9110: for a private offline document cache using Authorization and Vary: Accept-Language, when may it store, reuse, validate, or serve stale content?

## Answer

Assumption: “private cache” means an HTTP private cache (single-user), and the stored item is otherwise a cacheable response.

- **Store:** An Authorization request does not by itself bar storage by a private cache. RFC 9111 §3 applies the Authorization restriction only to shared caches. A private cache still needs to meet §3’s general gates: understood method/final status, required status-code understanding, no response no-store, and at least one cacheability basis (for example private, max-age, Expires, or an eligible heuristically cacheable status). Cache-Control: private permits private-cache storage even where the response would not otherwise be heuristically cacheable (§5.2.2.7). Request no-store prohibits storing that request or its response; response no-store prohibits storing and reusing that response (§§5.2.1.5, 5.2.2.5; subject to the must-understand exception in §5.2.2.3). Request no-store does not itself bar using an already-stored response. Response no-cache does not bar storage; it bars reuse until successful validation (§5.2.2.4). A shared cache has a different rule: an Authorization response is storable/reusable only when it has public, must-revalidate, or s-maxage and the cache follows that directive (§3.5).
- **Reuse and language selection:** The request method and target URI must match, and the stored response must be fresh, explicitly allowed stale, or successfully validated (RFC 9111 §4). With Vary: Accept-Language, the new request’s Accept-Language must match the original request’s field value under the field’s defined normalization; an absent field matches only another absent field. A mismatch cannot use that variant without validation; Vary: * never matches (§4.1; RFC 9110 §12.5.5). RFC 9110 §12.5.5 says Authorization need not be listed in Vary because reuse for a different user is prohibited. If one app’s local store serves multiple signed-in accounts, the RFCs do not prescribe how that app represents principal isolation in its persistence layer; test account switching and partition or clear entries so one principal cannot receive another’s content.
- **Freshness and validation:** RFC 9111 §4.2.1 uses shared-cache s-maxage only for shared caches, then max-age, then Expires minus Date; heuristic freshness is possible only under §4.2.2’s conditions. A response is fresh while its current age has not exceeded its freshness lifetime (§4.2). When validation is needed and a connection exists, send supplied entity tags in the applicable precondition (for a validating GET, If-None-Match); §4.3.1 requires the relevant entity tags when provided. Normally send Last-Modified in If-Modified-Since where §4.3.1’s conditions apply. A 304 lets the cache update and reuse the identified stored response; a full response is used for the request and MAY be stored subject to §3 (RFC 9111 §§4.3.1, 4.3.3–4.3.4; RFC 9110 §§8.8.3, 13.1.2, 15.4.5).
- **Stale while offline:** RFC 9111 §4.2.4 allows a cache to serve stale when disconnected, unless an explicit directive prohibits it. Response no-cache and must-revalidate prohibit stale reuse; must-revalidate specifically requires an error while disconnected (SHOULD be 504 unless another error fits; §5.2.2.2). s-maxage and proxy-revalidate are shared-cache rules, not private-cache stale prohibitions. Thus an ordinary stale entry may be served offline, but one marked no-cache or must-revalidate may not.

## Discriminating checks

1. Store responses for the same URI under two Accept-Language values, then request each value and an absent field; verify only the corresponding variant is used.
2. Repeat the same URI/language request as two principals; verify there is no cross-principal reuse in the app’s local store.
3. For a response with an ETag, test fresh hit, stale online revalidation yielding 304, and changed representation yielding 200; confirm the 304 updates metadata while retaining the selected body.
4. Repeat offline with an ordinary stale response, response no-cache, and must-revalidate; verify stale is used only in the first case and prohibited cases fail without serving the old body.
5. Compare no-store, private, and no-cache responses to distinguish storage prohibition, private-cache permission, and validation-before-reuse.

## Sources and limits

- RFC 9111 (June 2022), https://www.rfc-editor.org/rfc/rfc9111.txt — source ID httpcache; capture date 2026-10-07; SHA-256 aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e.
- RFC 9110 (June 2022), https://www.rfc-editor.org/rfc/rfc9110.txt — source ID httpsem; capture date 2026-10-07; SHA-256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a.

I read only the input map, its listed question, source manifest, boundary, and the two listed RFC captures. Both source hashes matched the manifest. No other primary-source check was needed. The answer describes RFC HTTP-cache behavior; it cannot determine whether an application-specific offline store implements those cache semantics or its account-isolation policy.

## Run notes

Boundary requestedAt: 2026-10-07T21:27:27.218Z; stage ceiling 720 seconds; common absolute deadline 2026-10-07T22:00:48.636Z. Source operations: map/question/manifest/boundary read; two SHA-256 checks; targeted heading scans and excerpts from RFC 9111 §§3, 3.5, 4, 4.1, 4.2, 4.3, 5.2.1–5.2.2 and RFC 9110 §§8.8.3, 11.6.2, 12.5.5, 13.1.2, 15.4.5. Billing and separate input/cache/generated counters were unavailable.
