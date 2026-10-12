# Criticism dispositions — B04-P02 treatment

This file records the complete F1–F5 criticism and O1–O6 coverage from the permitted compact actionable critique. Each decision below applies to the finding and to the corresponding proposition in the investigator draft. The resolved proposal is fully restated in final.md; this file is not a patch list.

## Decision terms

- **Accept:** the criticism is supported and the proposal changes accordingly.
- **Amend:** the criticism is accepted, with a narrower product policy or a condition made explicit.
- **Reject:** the criticism itself is unsupported. No material F1–F5 criticism is rejected.
- **Keep:** a supported original design choice remains in the proposal.
- **Uncertain:** source text establishes the protocol rule, but implementation or product evidence is absent.

## F1 — no-cache, no-store, private, and must-understand

**Disposition: ACCEPT + AMEND + KEEP + UNCERTAIN.**

- **Accept:** The draft was wrong to treat no-cache and no-store identically and to say a no-cache response cannot be stored. RFC 9111 §5.2.2.4 permits storage, but unqualified no-cache prohibits using the response for another request without forwarding it for validation and receiving a successful response. **Rejected draft claim:** “neither can be stored.”
- **Accept + amend:** A qualified no-cache field list has different semantics: the named fields may be excluded from the subsequent response or updated/removed through successful revalidation. V1 will conservatively treat qualified no-cache as whole-response no-cache because selective field removal is not yet planned or tested. The conservative policy is not presented as the RFC definition.
- **Accept:** Response no-store applies to private and shared caches; request no-store covers the request and its response, while RFC 9111 §5.2.1.5 says it does not apply retroactively to an already stored response used for that request.
- **Accept + amend:** Preserve the must-understand/status exception. A cache that implements must-understand should ignore response no-store when it understands and implements the response status's caching requirements. The proposal conditions that exception on a supported, fully implemented status; otherwise it obeys no-store and does not store. This avoids both erasing the exception and applying it to unknown statuses.
- **Accept:** The draft's rejection of private responses was incorrect. Unqualified private excludes shared storage and may permit storage by a private cache subject to the other rules. It is not a privacy guarantee.
- **Keep:** Account partitioning, sign-out isolation, and credential redaction remain required product controls. The protocol's private directive does not provide those controls.
- **Uncertain:** No cache library was audited, so actual directive support, field-list behavior, storage, and must-understand status coverage remain unverified.

**Primary evidence:** RFC 9111 §§3, 3.1, 3.5, 5.2.1.5, 5.2.2.3–5.2.2.7. See matching entries in source-map.json.

## F2 — Vary matching and age

**Disposition: ACCEPT + AMEND + KEEP + UNCERTAIN.**

- **Accept:** A Vary value containing * always fails to match. **Rejected draft claim:** “Vary: * is just another string-valued variant that can be matched.”
- **Keep + amend:** Keep request-header variant selection, absent-versus-present distinction, and representation bytes/encoding metadata. Permit only normalization that the named field's specification says has identical semantics; do not normalize arbitrary values.
- **Accept:** A private cache does not get a receive-time-only age exemption. RFC 9111 §4.2.3 accounts for apparent age from Date, upstream Age, request/response delay, and response residence time. A cache without a clock must revalidate each use.
- **Amend:** Use the RFC age calculation, including the max of apparent age and corrected Age plus response delay. RFC 9111 says malformed Age should be ignored; if the remaining date/clock evidence cannot establish a trustworthy age, the product policy treats the entry as stale and revalidates. Missing or unreliable clock data never makes an entry fresher.
- **Keep:** Fresh reuse remains supported when age is below a usable freshness lifetime and no directive requires validation. Vary matching remains supported for named fields.
- **Uncertain:** Clock behavior across restart, malformed/conflicting header handling, and safe handling of sensitive Vary fields need fixture and platform testing.

**Primary evidence:** RFC 9111 §§4, 4.1, 4.2.1, 4.2.3, 5.1; RFC 9110 §6.6.1. See source-map.json.

## F3 — stale use offline

**Disposition: ACCEPT + AMEND + KEEP.**

- **Accept:** A stale response with must-revalidate cannot be reused while disconnected; RFC 9111 requires an error, normally 504 unless another status is more applicable.
- **Accept:** Unqualified response no-cache also blocks reuse without successful validation. The draft's offline-mode override would have violated both directives. **Rejected draft claim:** “offline mode permits use even with must-revalidate.”
- **Amend:** Offline or explicit stale use remains available only when the cache is disconnected or stale use is explicitly authorized and no protocol directive prohibits it. V1 offers an explicit, visibly stale action only for eligible entries; it shows unavailable for no-cache/must-revalidate entries. It does not serve stale on an ordinary 5xx by default.
- **Keep:** Clear fresh/stale/offline labels, last successful retrieval/validation time, graceful failure, and no claim that cached content is live.
- **Uncertain:** Network-disconnected classification and any future stale-on-error product policy require implementation tests; no such behavior was exercised.

**Primary evidence:** RFC 9111 §§4.2.4, 4.3.3, 5.2.2.2, 5.2.2.4. See source-map.json.

## F4 — conditional updates and 304

**Disposition: ACCEPT + AMEND + KEEP + UNCERTAIN.**

- **Accept:** A 304 has no content or trailers, but its supplied header fields guide cache updates. **Rejected draft claim:** “ignore the response's new header fields.”
- **Accept + amend:** Match eligible stored responses using RFC 9111 §4.3.4: strong validators update all matching eligible responses; if no strong validator is supplied, matching weak validators select the most recent matching response; with no validator, only one eligible stored response that itself lacks a validator can be updated. Do not apply a nonmatching strong validator to any entry.
- **Accept:** Apply the 304 fields to the identified stored metadata under §3.2. Recompute freshness/age and policy from the validation exchange. Keep the body only with metadata that remains compatible with its bytes.
- **Keep:** The body remains the previously stored representation; never invent a body for the 304. If no eligible corresponding body survives the match/update rules, perform one unconditional GET rather than returning empty content.
- **Keep + amend:** Validators stay bound to URI, account, and selected variant. If a changed Vary cannot be mapped safely, mark the entry unselectable and fetch the full representation rather than guessing.
- **Uncertain:** No implementation has demonstrated strong/weak/no-validator selection, field merging, Vary changes, or representation-metadata integrity. These are explicit fixture gates.

**Primary evidence:** RFC 9111 §§3.2, 4.3.1–4.3.4; RFC 9110 §§8.8.1, 13.1.2–13.1.3, 15.4.5. See source-map.json.

## F5 — retained scope, history, alternatives, and limits

**Disposition: KEEP + AMEND + UNCERTAIN.**

- **Keep:** Private GET-only cache scope; per-account partitioning; authorization redaction; sign-out isolation; original representation bytes and encoding metadata; bounded whole-entry LRU storage; live-fetch fallback; library-versus-custom comparison; and the proposed protocol, disk, network, and UI fixtures.
- **Keep:** The earlier URL-only cache was rejected because a URL alone does not isolate account ownership or content-negotiation variants. This is design history from the supplied draft, not a new claim about RFC wording.
- **Amend:** “GET-only” is made precise as complete 200 GET bodies in v1; ranges, partial responses, other status codes, and non-GET requests are passed through. The custom option reuses an existing HTTP client. The library option remains preferred if an exact-version audit passes.
- **Uncertain:** There is no implementation, audited library/version, fixture run, benchmark, deployment, or real offline/network test. Quota starter values and sensitive-field fingerprinting are proposed engineering choices, not measured outcomes.

## Coverage and final resolution

- **O1 → F1, F5:** directive/cacheability rules, private-cache scope, account isolation, and implementation alternatives are covered in final.md §§2–3 and 6.
- **O2 → F2, F5:** Vary, age/freshness, representation variants, storage, and validation plan are covered in §§2–3 and 7.
- **O3 → F1, F2, F4:** cache eligibility, variant selection, age, validators, and metadata updates are covered in §§3–4 and 7.
- **O4 → F1, F3:** no-cache/no-store distinction, must-revalidate, stale/offline rules, and UI states are covered in §§3 and 5.
- **O5 → F4, F5:** 304 body/metadata handling, alternatives, and uncertainty are covered in §§4, 6, and 7.
- **O6 → F1, F5:** private/authenticated data, sign-out, non-cached cases, and validation plan are covered in §§2–3 and 6–7.

All five findings have an explicit decision, source basis, and reason. No material criticism was rejected. The false draft statements identified above are rejected as claims; the supported history and design constraints are retained.
