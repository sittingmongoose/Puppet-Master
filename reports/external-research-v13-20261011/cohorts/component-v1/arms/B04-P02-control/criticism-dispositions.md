# Criticism dispositions — B04-P02 control

All five findings in the conventional full critique were reviewed against the approved RFC 9111 and RFC 9110 source copies. The final accepts the corrections and preserves useful scope where the draft was sound. Local line locators refer to the hash-verified copies named in source-map.json.

## F1 — Directive model and private caching

| Material criticism | Decision | Disposition, evidence, and reason |
|---|---|---|
| The draft treats no-cache and no-store as identical storage bans. | Amend | Separate validation-before-reuse from no-retention. RFC 9111 §5.2.2.4 says unqualified no-cache can be stored but requires successful validation before reuse; §5.2.2.5 says no-store bars storing/reuse. |
| Qualified no-cache has different field-level semantics. | Amend | Preserve recognition of the quoted field list, but choose full-response validation as a conservative v1 policy instead of implementing selective field removal/revalidation. This is stricter than the RFC’s qualified option and is labeled as a local policy. RFC 9111 §5.2.2.4. |
| must-understand can override no-store only under a status-specific condition. | Accept | State the exception exactly: a cache that implements must-understand and understands/conforms to the response status caching requirements should ignore no-store. V1 uses it only when those requirements are implemented and conformance fixtures pass; otherwise it honors no-store. RFC 9111 §§3, 5.2.2.3, 5.2.2.5. |
| The draft discards all private responses. | Amend | Keep eligible private responses in the single-user partition. RFC 9111 §5.2.2.7 forbids unqualified private storage by shared caches and permits private caches to store subject to §3. |
| Account isolation and sign-out must remain. | Keep | Preserve distinct anonymous/account partitions, key revocation, read denial, and in-flight write fencing as product security constraints. RFC 9111 §§1, 2, and 7.3 support private-cache scope and sensitivity; the exact account/session mechanics are implementation design, not mandated by RFC. |
| Define qualified-directive and unsupported-status policy. | Amend | V1 treats qualified no-cache as unqualified, stores only understood complete 200 GET responses, treats 304 as update-only, and does not store statuses whose caching requirements are unimplemented. RFC 9111 §§3, 4.3.4, 5.2.2.3–5.2.2.5. |

The draft’s categorical rejection of private caching and its equation of no-cache with no-store are rejected as inaccurate protocol claims.

## F2 — Variants and age

| Material criticism | Decision | Disposition, evidence, and reason |
|---|---|---|
| Vary: * never matches. | Amend | Remove the draft’s reusable string-variant treatment. Treat Vary: * as an unconditional miss; it cannot select a stored response. RFC 9111 §4.1. |
| Named Vary fields, absence, and safe normalization matter. | Keep and amend | Preserve named-field variants and distinguish absent from present. Allow only whitespace/field combination or normalization known by that field’s specification to preserve semantics. RFC 9111 §4.1. |
| Receive-time-only age is incorrect. | Amend | Compute apparent age, corrected Age plus response delay, corrected initial age, then resident time. This includes Age accumulated in upstream caches and time in transit. RFC 9111 §4.2.3. |
| Clock and malformed-field behavior needs a conservative rule. | Amend | Use monotonic in-process elapsed time, persist safe age state, saturate arithmetic, and mark freshness unusable after rollback/reboot ambiguity or malformed timing data; validate online rather than grant a fresh hit. The specific clock persistence policy is an engineering choice to validate, not RFC text. RFC 9111 §§1.2.2, 4.2.3, 5.1. |

The useful fresh-hit behavior and named variants remain. The unsupported claim about Vary: * and the receive-time-only age calculation are rejected.

## F3 — Offline reuse

| Material criticism | Decision | Disposition, evidence, and reason |
|---|---|---|
| must-revalidate cannot be bypassed while disconnected. | Amend | Never serve stale must-revalidate content offline; surface unavailable/error, normally 504 where applicable. RFC 9111 §5.2.2.2. |
| no-cache similarly requires successful validation. | Amend | No-cache entries can be retained, but never satisfy another request without successful validation; the qualified form is conservatively treated the same. RFC 9111 §5.2.2.4. |
| Stale offline use needs an explicit policy and must honor prohibitions. | Amend | Allow stale use only while disconnected under the reader’s explicit stale-offline preference, with clear stale age and last retrieval/validation. The preference never overrides no-cache, must-revalidate, no-store, a variant mismatch, or account isolation. RFC 9111 §4.2.4. |
| Permanent export is distinct from cache behavior. | Keep and amend | Keep export as a possible separate product action with explicit consent/provenance/privacy governance; it is not an override. V1 disables export of no-store responses. RFC 9111 §§5.2.2.5, 6, 7.3. |

The draft’s suggestion that user-selected offline mode defeats must-revalidate is rejected.

## F4 — 304 selection and metadata

| Material criticism | Decision | Disposition, evidence, and reason |
|---|---|---|
| A 304 must select only applicable stored responses. | Amend | Restrict candidates to responses that could have been chosen for the request and apply RFC strong, weak, and absent-validator matching rules. Do not treat a validator as a global URL key. RFC 9111 §4.3.4; RFC 9110 §8.8.1. |
| Supplied 304 fields update metadata. | Amend | Replace the draft’s “ignore new fields” rule. Update supplied fields according to RFC 9111 §3.2 and §4.3.4 exceptions, then recompute age, freshness, Vary, and eligibility. RFC 9110 §15.4.5 says a 304 has no content but identifies headers used for cache updates. |
| A 304 has no body; absent a selected body, fetch normally. | Keep and amend | Preserve the no-new-body insight, but reuse the selected stored body only after valid selection. If no corresponding body is available, make an unconditional GET. RFC 9110 §15.4.5; RFC 9111 §§4.3.3–4.3.4. |

The draft’s claim that 304 metadata is irrelevant is rejected; the draft’s unconditional-GET fallback and validator association principle are kept and made precise.

## F5 — Scope, alternatives, history, and validation honesty

| Material criticism | Decision | Disposition, evidence, and reason |
|---|---|---|
| Preserve single-user scope, GET-only boundary, account separation, redaction, sign-out, representation bytes, quota, and atomic ownership. | Keep | All appear in final sections 1–2. RFC 9111 §§1–3, 3.1, 3.5, and 7.3 ground cache scope and storage/security; encryption, quota, and generation fencing are product design. |
| Compare a mature library and narrow custom cache without claiming an audit. | Keep | Both alternatives remain, with a version-specific library audit as a future gate. RFC 9111 §6 leaves application-level caching behavior to the application and encourages defining its relation to HTTP directives; no library has been audited, so its suitability is uncertain. |
| Retain URL-only history, live fallback, and export alternative. | Keep and amend | Record the earlier URL-only key as proposal history; live retrieval remains fallback; export stays separate and does not override no-store. |
| Preserve meaningful fixture plans and report execution honestly. | Keep and amend | Expand fixtures to cover corrected Vary, age, directive, offline, status, 304, storage, and account behaviors. No cache implementation or fixture replay ran, so every test result remains unknown. |
| Retain uncertainty about clocks, libraries, measurements, and deployment. | Keep | Final sections 8–9 name these unresolved questions. |

No claim is made that an implementation, HTTP client, fixture runner, library audit, network test, latency benchmark, or deployment test has passed.