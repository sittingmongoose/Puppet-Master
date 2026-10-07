# Legitimate test input — untrusted candidate preliminary proposal

**Bounded question:** For a private offline document cache using `Authorization` and `Vary: Accept-Language`, when may it store, reuse, validate, or serve stale content?

## Preliminary proposal

1. **Storage eligibility.** A private cache may store an authenticated response only when the cache understands the request method, the response is final (and its status code's cache rules are understood where required), response `no-store` is absent, and the response is cacheable under RFC 9111 §3. A private response directive permits private storage even when the response would not otherwise be heuristically cacheable; other qualifying signals include explicit freshness, an applicable extension, or a heuristically cacheable status. `Authorization` alone does not forbid private-cache storage.

2. **User and shared-cache boundary.** A shared cache MUST NOT use a response to an `Authorization` request unless the response has `Cache-Control: must-revalidate`, `public`, or `s-maxage`, and the cache obeys that directive (RFC 9111 §3.5). RFC 9110 §12.5.5 says `Authorization` need not be listed in `Vary` because reuse for a different user is prohibited. For a local cache that supports account switching, partition authenticated entries by account and do not cross-serve them; the RFCs do not define an application's account-keying scheme.

3. **Language variant matching.** For a response carrying `Vary: Accept-Language`, an unvalidated reuse requires the later request's `Accept-Language` field to match the original request under RFC 9111 §4.1's normalization rules. An absent field matches only another absent field; a `Vary: *` response never matches. Thus an English entry is not a fresh hit for a different language preference merely because the URI is the same (RFC 9110 §12.5.5).

4. **Reuse conditions.** The target URI and method must be eligible, nominated `Vary` fields must match, and response `no-cache` must have been successfully validated. The response must also be fresh, permitted to be served stale, or successfully validated (RFC 9111 §§4, 4.1). Freshness depends on current age versus lifetime, using applicable `max-age`/`Expires` information or permitted heuristics (§§4.2–4.2.2).

5. **Validation.** When an eligible stored response is stale or otherwise cannot be served directly, an online cache can revalidate it with a conditional request using its ETag (`If-None-Match`) or, where applicable, `Last-Modified` (`If-Modified-Since`). A 304 response updates stored metadata and permits reuse; a full response supplies the representation for the request (RFC 9111 §§4.3, 4.3.3–4.3.4). The current authorization and language context still govern whether that representation is appropriate.

6. **Directive and offline distinctions.** Response `no-cache` allows storage but requires successful validation before every reuse; response `no-store` prohibits storage and using that response for another request. Response `must-revalidate` bars stale reuse even while disconnected; the cache returns an error when it cannot validate. More generally, stale service is allowed only while disconnected or when explicitly permitted by a client, origin, or applicable out-of-band contract, and never against a prohibiting response directive (RFC 9111 §§4.2.4, 5.2.2.2, 5.2.2.4–5.2.2.5). `s-maxage` and `proxy-revalidate` impose stale restrictions on shared caches. Request `no-cache` is an advisory preference for validation; request `no-store` restricts storing that exchange but does not erase a response already in the cache (§5.2.1).

7. **Minimal fixtures and uncertainty.** Store Account A's authenticated `200 GET` response to `Accept-Language: en` with `Cache-Control: private, max-age=60`, `Vary: Accept-Language`, and `ETag: "v1"`. Check a same-account `en` fresh hit; a different or absent language miss; expiry followed online by conditional 304 and updated reuse; and offline stale behavior both with and without `must-revalidate`. Add `no-cache` (stored, validation required), `no-store` (not persisted), and account-switch (no cross-serving) cases. These RFCs do not choose the product's offline retention period, account partitioning mechanism, or offline user experience; those need separate requirements.

## Sources

- RFC 9111, June 2022, §§3, 3.5, 4–4.3.4, 5.2.1–5.2.2: https://www.rfc-editor.org/rfc/rfc9111.txt — pinned capture SHA-256 `aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e`.
- RFC 9110, June 2022, §§11.6.2, 12.5.5: https://www.rfc-editor.org/rfc/rfc9110.txt — pinned capture SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.

## Execution record

Requested at 2026-10-07T21:20:48.636Z; proposal authored from the supplied brief and the two listed frozen RFC captures only. Source operations: read INPUT_MAP, listed brief, source manifest, boundary, and relevant RFC sections; verified both capture hashes; no additional primary-source check. Billing, input/cache split, and generated-token split are unavailable here.
