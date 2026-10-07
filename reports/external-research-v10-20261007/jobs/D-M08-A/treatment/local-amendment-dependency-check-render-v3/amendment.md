# Local amendment record — D-M08-A

This records the candidate critique dispositions and the actual changes to the proposed recommendation. The supplied draft and critique are inputs, not truth; the changed claims still require the primary-source dependency check that follows.

1. **AMEND — representation identity.** Keep the effective target, request-selection context (including Vary fields), content coding, and strong validator with the partial bytes. A selector snapshot is evidence about a request, not proof of representation identity. Treat Vary: * , a changed target, or changed coding as insufficient grounds for reuse; restart unless the same selected representation can be established.

2. **AMEND; REJECT unconditional overwrite — failed If-Range.** Keep the strong-ETag rule; only use a date when no entity tag is available and the date is a strong validator. A false condition causes Range to be ignored. Replace/truncate partial bytes only after receiving and validating an actual full 200; for redirects, errors, or other statuses, neither append their bodies nor overwrite usable partial bytes as if they were a full representation.

3. **ACCEPT with fail-closed detail — 206.** Append only a supported single-part byte response whose Content-Range is valid, starts at the saved contiguous offset, and describes exactly the received body octets. Reject recombination for multipart data outside the supported parser, an unknown range unit, invalid/missing range metadata, or a body/range mismatch. Permit an unknown complete length (*) when the interval itself is valid. Combine only for the same target and matching strong validator.

4. **ACCEPT with qualification — 416.** Never treat its body as range payload. If supplied, Content-Range: bytes */N is diagnostic length information, not proof that the local prefix is current; its absence is allowed. 416 can reject range sets for reasons beyond an offset past a shortened resource. Keep an ignored-Range/full-200 path distinct.

5. **ACCEPT — coding and length.** Keep saved and received bytes in one consistent representation-data form. Do not join decoded bytes to a coded prefix. For 206, use Content-Range for the interval/possible total and treat Content-Length as the message content length. Accept-Encoding: identity and disabling transparent decompression remain optional advice; verify the actual response and library-exposed bytes.

6. **AMEND — metadata dependency.** Bind metadata to the bytes it describes. After a validated combination, refresh or replace response metadata under an explicit sidecar policy; never silently retain a stale validator, coding, selection metadata, or length. If the sidecar claims HTTP-cache behavior, apply the RFC cache update rules; otherwise document the smaller policy it implements. Any identity/validator amendment requires re-evaluating every downstream append decision.

7. **ACCEPT with added proposed checks — coverage.** Retain the original cases and add weak-tag refusal, qualifying strong Last-Modified, 416 without Content-Range, failed If-Range followed by a non-200, multipart/unknown-unit 206, changed Vary or coding, and metadata refresh after combination. These are proposed tests, not executed tests.

8. **UNRESOLVED — client byte exposure.** The selected HTTP library and its decompression behavior are unspecified. Make no claim that a request header guarantees the bytes exposed to the writer. Before implementation, test the exact library path and record status, response coding, configured decoding, and byte form; until then, choose a consistent storage form only as a design requirement.

**Changed dependencies to check next:** target/validator/coding/selector identity; failed-condition status handling; range-unit/interval/body validation; optional complete length; 416 semantics; message versus representation length; metadata update scope; and the limits on HTTP-library behavior. No implementation behavior is asserted as executed.
