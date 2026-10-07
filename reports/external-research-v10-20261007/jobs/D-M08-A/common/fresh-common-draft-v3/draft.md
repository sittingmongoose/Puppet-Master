# D-M08-A preliminary proposal

**Legitimate test input — untrusted candidate preliminary proposal**

A desktop client should resume a GET only when it can tie saved bytes to the same selected representation. The rules below are a bounded proposal, not an implementation plan.

1. **Preserve representation identity.** Store the effective target resource, the request fields that select its representation (especially `Accept-Encoding` and any fields named by `Vary`), the response validators and coding, and the contiguous byte count beside the partial file. Prefer a strong ETag. A strong validator changes when GET-visible representation data changes, but its uniqueness is scoped to one resource; a matching tag alone does not establish identity across different resources. (RFC 9110 §§3.2, 8.8.1, 12.5.5.)

2. **Guard the range.** Request `Range: bytes=N-` with `If-Range` containing the saved strong ETag. Do not send a weak ETag in `If-Range`; use a date only if there is no entity tag and the date qualifies as a strong validator. If the condition fails, the server ignores `Range` and sends the current full representation rather than a 412. Therefore a full `200` replaces and truncates the partial file; never append it at offset N. (RFC 9110 §§13.1.5, 14.2.)

3. **Validate every `206`.** Inspect status, `Content-Type`, and `Content-Range`. For a single-part byte response, require a valid range beginning at the saved contiguous offset, ensure the received body length matches that interval, and use the reported complete length when known. Write only the bytes described by the range; a server may return only part of what was requested. Invalid or unsupported `Content-Range` values must not be recombined. Combine saved and new ranges only when they share the same strong validator. (RFC 9110 §§14.4, 15.3.7, 15.3.7.1, 15.3.7.3.)

4. **Treat `416` as information, not payload.** Do not append a `416` body. If present, `Content-Range: bytes */N` reports the current selected representation length. It can help diagnose an offset beyond a shorter representation, but does not prove that unvalidated local bytes are current. Restart with a full GET whenever the saved validator is missing, weak, or no longer matches. Also handle a server ignoring Range and returning `200`; clients cannot rely on receiving `416`. (RFC 9110 §§14.4, 15.5.17.)

5. **Keep offsets and lengths in the same byte form.** Byte ranges apply to representation data; `Content-Encoding` is a characteristic of that coded representation. Preserve raw coded bytes consistently, or request identity encoding where supported and verify the response; do not append decoded bytes to an encoded prefix. In a `206`, `Content-Length` describes that message's content, usually not the whole representation; use `Content-Range` for interval and total-length information. (RFC 9110 §§8.4, 8.6, 14.2, 15.3.7.)

6. **Uncertainty and checks.** Servers may ignore ranges, and without a usable strong validator safe cross-response combination may be impossible; the conservative fallback is a fresh full GET. Test unchanged-representation resume, changed ETag with a `200` replacement, a shorter resource with `416`, partial or malformed `206` ranges, mismatched body length, and gzip/automatic-decompression behavior. Optional client advice: request `Accept-Encoding: identity` and disable transparent decompression when the HTTP library allows it, while still validating the actual response coding.

**Source basis.** RFC 9110, *HTTP Semantics*, June 2022, exact frozen capture [httpsem] (`https://www.rfc-editor.org/rfc/rfc9110.txt`), SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`. Source sections cited inline.
