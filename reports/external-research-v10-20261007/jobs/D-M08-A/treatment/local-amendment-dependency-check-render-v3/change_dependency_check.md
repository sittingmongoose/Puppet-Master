# Changed-claim dependency check — D-M08-A

## Result

The amended claims below were checked against the exact frozen primary-source files listed by the input map. Their SHA-256 values match the map. The normative claims are supported with the qualifications recorded here. The body-length arithmetic and sidecar metadata policy are local safety recommendations, not requirements stated verbatim by the RFCs. No amendment was needed after this check. The client-library byte-exposure question remains unresolved because no library was named or executed.

## Dependency checks

1. **Target, selector, and validator identity — supported, conservatively scoped.** RFC 9110 §3.2 describes multiple representations for a target selected according to the request; §8.8.1 says a strong validator is unique across versions for a resource but does not imply equivalence across different resources; §12.5.5 describes selecting fields and says Vary: * prevents a recipient from deciding locally whether the response applies to a later request without forwarding it. Therefore the amendment correctly binds partial bytes to the effective target, coding, validators, and known selection context, and does not treat a selector snapshot or Vary: * as proof. Same-target plus matching strong validator is a conservative combination gate; §15.3.7.3 requires a common strong validator for combining partial responses.

2. **If-Range and overwrite behavior — supported with a completion condition.** RFC 9110 §13.1.5 prohibits weak entity tags in If-Range and permits a date only when no entity tag exists and the date is strong (§8.8.2.2). A false condition makes the recipient ignore Range; §14.2 also allows servers to ignore Range. This does not guarantee that every exchange returns a successful body: §15.3.1 says a successful GET 200 carries a representation of the target, while redirects and errors remain possible. A local implementation should replace the old file only after a complete successful full GET has been received and validated; status 200 alone must not cause an interrupted body to be committed. Atomic replacement is a proposed local safeguard, not an RFC requirement.

3. **206 interval and body — supported; arithmetic is an integrity inference.** RFC 9110 §15.3.7 requires inspection of Content-Type and Content-Range; §15.3.7.1 requires Content-Range for a single part. §15.3.7.2 specifies multipart/byteranges and per-part Content-Range. Section 14.4 says an unknown range unit or invalid Content-Range must not be recombined, and permits * when complete length is unknown. A valid byte interval uses inclusive positions (§14.1.2); checking received octets equal last-pos minus first-pos plus one follows from the enclosed range semantics, but is a derived client integrity check. Same strong validator and same target are supported by §15.3.7.3. Fail-closed handling for unsupported multipart parsing is a deliberate client policy.

4. **416 — supported.** RFC 9110 §§14.4 and 15.5.17 say a server SHOULD send Content-Range: bytes */N and define N as the current selected representation length. SHOULD does not make the field mandatory. Section 15.5.17 allows 416 for unsatisfiable ranges or excessive small/overlapping ranges, and notes that a server may ignore Range and return 200. Thus do not use a 416 body as payload, do not infer local-prefix validity from N, and handle an ignored Range/full response separately.

5. **Coding and length — supported.** RFC 9110 §8.4 defines Content-Encoding as a characteristic of the coded representation; §14.1.2 calculates byte offsets over the encoded byte sequence. Section 15.3.7 defines Content-Length in a 206 as the octets in that message's content, usually not the complete representation, while Content-Range carries the interval and possible complete length. Accept-Encoding: identity is advice only; the RFC does not establish which bytes a particular library exposes to an application.

6. **Metadata after combination — supported only within its stated scope.** RFC 9110 §15.3.7.3 sets the response-header source and replacement rules when a client combines matching partial responses. RFC 9111 §3.4 permits cache combination only for a common strong validator and requires updating stored response fields using the new response's fields under §3.2. A sidecar that is not an HTTP cache is not automatically governed by the cache rule. Its refresh/replace policy is therefore a proposal; it must avoid silently carrying stale identity metadata and must re-evaluate append decisions when identity inputs change.

7. **Additional tests — proposed, not executed.** The listed cases exercise the conditions above; neither RFC inspection nor a written proposal is evidence that tests passed. No server or HTTP-library behavior was run.

8. **Library byte exposure — unresolved.** The frozen RFCs define coded representation data and range semantics, but do not identify the unspecified desktop client's API, automatic decompression, or writer byte stream. The amendment correctly makes that a future exact-library test rather than an established fact.

## Source identity and limits

- RFC 9110, *HTTP Semantics*, June 2022 exact frozen capture, URL: https://www.rfc-editor.org/rfc/rfc9110.txt; SHA-256: 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a.
- RFC 9111, *HTTP Caching*, June 2022 exact frozen capture, URL: https://www.rfc-editor.org/rfc/rfc9111.txt; SHA-256: aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e.

Checked sections: RFC 9110 §§3.2, 8.4, 8.6, 8.8.1, 8.8.2.2, 12.5.5, 13.1.5, 14.1.2, 14.2, 14.4, 15.3.1, 15.3.7–15.3.7.3, and 15.5.17; RFC 9111 §3.4. No additional live sources or mutable implementation files were consulted. Limitation: these standards cannot resolve the unspecified client's exposed-byte behavior.

## Execution record

Current-run timing uses the mapped boundary's recent-run requestedAt, 2026-10-07T20:40:14.079Z, and fixed common T0, 2026-10-07T20:28:57.512Z. The 24-minute stage deadline is 21:04:14.079Z; T0+40 minutes is 21:08:57.512Z, so the stage deadline governs. Logical phase ceilings from the request are 20:48:14.079Z (amendment), 20:58:14.079Z (dependency check), and 21:04:14.079Z (render). The supplied critique contains a different embedded prior-run time (20:35:00.918Z); it was not used to set this run's boundary.

Source operations: four section-heading searches; six targeted extraction calls; one SHA-256 command over both frozen sources. No network fetch, tests, server run, or client-library run. Billing and model input/cache/generated usage are unknown/null. Native Goal counters are reported separately from those unknown billing counters.
