# Safe resumption for a desktop GET client

**Scope.** Bounded recommendation for a client that saves a partial representation and later requests a byte range. This is a proposal, not an implementation plan.

## Critique disposition

1. **Amended:** bind data to its target and known selection context; a Vary wildcard leaves selection factors unknown.
2. **Amended; rejected the unconditional-overwrite inference:** a false If-Range condition ignores Range, but does not guarantee a successful 200. Replace only on an actual full 200.
3. **Accepted with fail-closed detail:** validate the 206 range, media form, validator, and body octet count before recombination.
4. **Accepted with qualification:** a 416 may omit Content-Range and can reject a range set for reasons beyond an offset past a shortened resource.
5. **Accepted:** keep the stored byte form and range offsets consistent; Content-Length on 206 is message length.
6. **Amended:** refresh combined-response metadata using explicit rules; do not silently preserve stale fields.
7. **Accepted with added proposed cases:** cover condition failures, unusual ranges, selector/coding changes, and metadata refresh.
8. **Unresolved:** the client library’s actual response-byte exposure is unknown and requires testing the selected library path.

## Recommendation

1. **Bind bytes to one selected representation.** Store the target resource URI, request-selection context named by Vary (including Accept-Encoding when applicable), response Vary and Content-Encoding, validator, contiguous byte offset, and the byte form actually written. A strong ETag changes when GET-visible representation data changes, but its uniqueness is scoped to a resource: the same tag on different resources does not prove equal data (RFC 9110 §§3.2, 8.8.1). Vary lists request fields that may select a representation; Vary: * means other, potentially unrecorded factors may matter, so a selector snapshot alone cannot establish identity (§12.5.5). Combine only for the same target with the same confirmed strong validator. A changed target cannot be joined by matching tag alone. If coding or selection context changes and a strong validator does not establish the same data, start a fresh GET.

2. **Guard the resume request.** For a contiguous prefix of N octets, request Range: bytes=N- with If-Range set to the saved strong ETag. Never send a weak entity tag in If-Range. A Last-Modified date is eligible only when there is no entity tag for that representation and the date qualifies as strong under §8.8.2.2. For a client, that requires a saved Date at least one second after Last-Modified plus reason to trust the same clock or adequate margin for clock skew; If-Range then requires an exact date match (§13.1.5). If no usable strong validator exists, do not combine; fetch the full representation. If the condition is false, the recipient ignores Range and handles the request normally. Do not assume the result is a successful full response.

3. **Handle each status before writing.** For 206, inspect Content-Type and Content-Range. Append as a contiguous prefix only for a valid single-part byte range beginning at N, on the same target and byte form, with the same strong validator; verify the received body octet count equals the inclusive interval length. A server may return only part of what was requested. A total length of * is valid when unknown; use a reported total when known. Do not recombine an invalid Content-Range or an unknown range unit. If multipart/byteranges is unexpected or unsupported, do not append it as raw file bytes; parse and validate every part or fail closed (RFC 9110 §§14.4, 15.3.7–15.3.7.3).

   A real 200 is a replacement generation, never an append at N. Stage it separately and replace the old partial only after the response transfer completes and validates; if interrupted, retain it only as a new partial tied to that response’s identity. A redirect, error, or other non-200 response is neither an append nor a replacement. On 416, append no body. Content-Range: bytes */length is recommended and, when present, reports the current selected representation length; it does not validate saved bytes. Its absence is allowed, and 416 can also reject excessive or overlapping range sets. Servers may ignore Range and return 200, so clients cannot depend on 416 (§§14.4, 15.5.17).

4. **Keep encoding and length semantics straight.** Byte ranges address the coded representation when Content-Encoding is applied, not the decoded media bytes (RFC 9110 §§8.4, 14.1.2). Preserve and resume the same octet form, or request identity encoding and verify what was actually received; do not append decoded bytes to a coded prefix. Accept-Encoding: identity and disabling transparent decompression are optional advice, not guarantees. In 206, Content-Length describes that message’s content, usually not the full representation; Content-Range describes the interval and may report the total (§§8.6, 15.3.7).

5. **Refresh metadata when combining.** RFC 9110 §15.3.7.3 chooses header fields from the latest incomplete 200, or from the most recent matching 200 when combining it with a later 206; when combining 206 responses, fields supplied by the new response replace corresponding stored fields other than Content-Range. If combined ranges cover the complete representation, process them as a complete 200 with Content-Length equal to the full length. RFC 9111 §3.4 requires a cache combining partial responses to update stored fields from the new response. If the client sidecar is not an HTTP cache, define its own explicit retain/replace policy, especially for ETag, Vary, Content-Encoding, Content-Length, Content-Range, and target URI; clear or regenerate per-message range metadata rather than retaining it as representation-wide metadata. Reevaluate downstream append decisions after any identity or metadata change.

6. **State uncertainty and test the real path.** The HTTP library is unspecified, so RFCs alone cannot establish whether its response API exposes coded or transparently decoded bytes. Test the exact library path that writes the partial and record observed coding and byte form. Proposed tests: unchanged resume; changed ETag followed by 200 replacement; interrupted 200; weak-tag refusal and an eligible strong Last-Modified date; 416 both with and without Content-Range; failed If-Range followed by redirect/error; valid partial 206, unknown total, malformed/missing range, body-length mismatch, unknown unit and unexpected multipart; changed Vary/target/coding; metadata refresh; and gzip with automatic decompression enabled. These are proposals, not executed tests.

## Checks and sources

Executed here: read the mapped brief, manifest, boundary, draft, and critique; verified both frozen source SHA-256 values; extracted the cited RFC sections. No live server or client-library behavior was checked. The proposed tests above were not run.

- [RFC 9110, HTTP Semantics, June 2022](https://www.rfc-editor.org/rfc/rfc9110.txt), frozen capture SHA-256: 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a.
- [RFC 9111, HTTP Caching, June 2022](https://www.rfc-editor.org/rfc/rfc9111.txt), frozen capture SHA-256: aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e.

