# D-M10-A — Final reconciliation

## Bounded answer from the RFCs

Assuming “private cache” means an HTTP private cache for one user, `Authorization` alone does not prevent storage. RFC 9111 §3 still requires understood method/status rules, no applicable prohibition, and a cacheability basis; `private` permits private storage even without heuristic cacheability, subject to those gates. Defined cache extensions can override §3 requirements. A shared cache may store/reuse an authenticated response only with `public`, `must-revalidate`, or `s-maxage`, and must obey that directive.

Reuse requires the same target URI, a usable method, and matching nominated `Vary` fields. Matching permits whitespace changes, combining field lines, and semantics-preserving normalization; absence matches only absence, and `Vary: *` never matches. The response must be fresh, permitted stale, or successfully validated; response `no-cache` requires validation. Freshness uses shared-cache `s-maxage`, then `max-age`, then `Expires` relative to `Date`, then permitted heuristics; it is fresh only when `freshness_lifetime > current_age`. On validation, stored entity tags MUST be sent; `Last-Modified` SHOULD be sent under §4.3.1’s conditions. A suitable 304 updates the identified response; a full response satisfies the request and MAY be stored under §3.

A cache may serve stale only while disconnected or when the client/origin explicitly permits it (including an out-of-band contract), unless prohibited by a response directive. Response `no-cache` and `must-revalidate` prohibit stale reuse; disconnected `must-revalidate` requires an error (SHOULD be 504 unless another status fits). `s-maxage` and `proxy-revalidate` stale restrictions apply to shared caches. Request directives are advisory; request `no-store` bars intentional storage of the exchange and requires best-effort prompt removal from volatile storage after forwarding, but not use of an existing entry. Response `no-store` bars storage/later reuse and likewise calls for best-effort volatile removal, subject to `must-understand`.

## Reconciliation — eight material findings

1. **Amended — storage eligibility.** The proposal correctly separates storage from reuse and lists §3 gates/cacheability bases. Its `no-store`-absent rule needs §5.2.2.3: a cache implementing `must-understand` SHOULD ignore `no-store` when it understands and implements that status code’s caching requirements. This narrow exception does not make every cache eligible.

2. **Accepted — Authorization boundary.** A private cache is not barred from storing an otherwise eligible authenticated response. A shared cache MUST NOT store/use such a response without `public`, `must-revalidate`, or `s-maxage`, and must obey the chosen directive. RFC 9110 §12.5.5 says `Authorization` need not be in `Vary` because reuse for a different user is prohibited. The RFCs do not specify how a multi-account application keys local entries; account-switch isolation remains an application requirement.

3. **Accepted — language variants.** The proposal correctly requires `Accept-Language` matching under RFC 9111 §4.1, treats absent as matching only absent, and identifies `Vary: *` as nonmatching. A mismatch cannot be used without validation; the cache may forward a validating request.

4. **Amended — freshness and reuse.** URI, method, nominated fields, response `no-cache`, and freshness/stale/validation are the right gates. Tighten the comparison: a response is fresh only while current age is less than its lifetime. Qualified response `no-cache` can allow reuse while excluding listed fields; validation-before-reuse describes unqualified `no-cache`.

5. **Amended — validation.** ETag and Last-Modified are correctly identified, but their force differs: relevant entity tags MUST be sent; Last-Modified SHOULD be sent for a single stored response, non-subrange request when present. A 304 updates suitable responses identified by validators and permits reuse after normal gates; a full response MUST satisfy the request and MAY be stored under §3.

6. **Amended — directives and offline behavior.** The distinctions are right: response `no-cache` allows storage but requires validation; response `no-store` bars storage/later reuse; `must-revalidate` bars stale use and requires a disconnected error; `s-maxage`/`proxy-revalidate` are shared-cache restrictions. Add SHOULD-504 for `must-revalidate`. Request directives are advisory; request `no-store` bars storing that exchange and calls for best-effort volatile removal, but does not invalidate/prevent use of an existing entry. Request `no-cache` is advisory; response `no-cache` is normative.

7. **Accepted — proposed fixtures.** The candidate’s fixtures cover language selection, account switching, fresh/stale ETag validation, offline stale behavior, and the main directives. Add (a) shared-cache authenticated responses with and without each of the three enabling directives, (b) `must-understand` plus `no-store` for understood and unimplemented status semantics, and (c) request `no-store` with an already-stored matching entry. These are proposed checks only; none were executed against an application.

8. **Unresolved — application behavior and process limitation.** The RFCs do not set product retention, account-keying, or offline UX policy, and do not prove an app implements these rules. Blind critic-first order was not preserved: the evidence answer and candidate were read in the same parallel batch before my independent RFC derivation. I do not claim a blind review; claim checks above use the frozen RFC text.

**Disposition summary.** Accepted: the core private/shared, Vary, freshness, validation, and stale rules. Amended: the exceptions, comparison, validator/update conditions, and request `no-store` effect. Rejected: no central claim outright; reject only a blanket response `no-store` rule omitting `must-understand`. Unresolved: application behavior and the blinding limitation.

## Minimal checks to run when implementation is available

1. Store authenticated `200 GET` with `private, max-age=60`, `Vary: Accept-Language`, and ETag; verify matching-language fresh reuse, different/absent-language non-reuse, and no cross-account response.
2. Expire online: send `If-None-Match`; on matching 304 update metadata/reuse the selected body; on changed 200 use the new representation and check storage under §3.
3. Offline, compare ordinary stale, response `no-cache`, and `must-revalidate`; only ordinary stale is eligible absent a permission/prohibition change, and `must-revalidate` returns an error when validation is unavailable.
4. Contrast response `no-store`, request `no-store` with an existing entry, `private`, and `must-understand` plus `no-store`; add shared-cache Authorization cases for `public`, `must-revalidate`, `s-maxage`, and none.

## Sources and run record

- RFC 9111 (June 2022), §§3, 3.5, 4–4.3.4, 5.2.1–5.2.2: [text](https://www.rfc-editor.org/rfc/rfc9111.txt); capture SHA-256 `aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e`.
- RFC 9110 (June 2022), §§11.6.2, 12.5.5, 13.1.2, 15.4.5: [text](https://www.rfc-editor.org/rfc/rfc9110.txt); capture SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.

Both hashes matched the manifest. No extra primary-source check was needed. Source operations: 8 permitted file reads (map, brief, manifest, boundary, evidence, proposal, two RFC captures), 2 hash checks, 4 heading scans, 4 RFC excerpt reads. Actual T3 requestedAt `2026-10-07T21:37:22.775Z`; common T0 `2026-10-07T21:20:48.636Z`; 1200 s stage deadline `2026-10-07T21:57:22.775Z`, earlier than case deadline `2026-10-07T22:00:48.636Z`. Artifact-ready checkpoint was `21:42:58Z` (about 335 s after stage request). Cold aggregate basis: 40 min/arm, full shared seed charged per cold run/once per campaign. Billing unknown; input/cache/generated splits null. Pre-completion `get_goal` at `21:42:58Z`: same Goal active, raw cumulative `tokensUsed=79,869`, `timeUsedSeconds=315`; separate from unknown billing/input/cache/generated splits. No outside source was opened; no config/profile/account/repo/canon/main/WorkNodes/campaign state, downloaded code, or app was accessed/executed.
