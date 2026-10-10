# Resuming interrupted desktop artifact downloads

## Scope

Brief-only discovery; no corpus, existing design, or campaign result was supplied or consulted. Separate **locator** (human name or expiring signed URL) from **identity** (which bytes are expected). Stage all received bytes privately and expose them only after an integrity gate. Atomic promotion and crash durability still need investigation.

## Evidence-backed shortlist

| Approach | Mechanism | Tradeoff / boundary |
|---|---|---|
| 1. Sequential HTTP continuation | Save offset and strong ETag; request `Range` plus `If-Range`. | Efficient when ranges and validator remain valid; not a cryptographic identity. |
| 2. Trusted whole-file manifest | Bind length and digest in trusted metadata; verify the full staged object. | Locator can change while identity stays fixed; errors surface only at completion. |
| 3. Per-piece manifest | Verify ordered piece hashes; retain good pieces and fetch gaps. | Enables precise retries; requires trusted manifest and careful piece indexing. |
| 4. Parallel range fan-out | Fetch disjoint ranges concurrently, all bound to one identity. | May improve throughput; increases mixed-version and recovery complexity. |

**1 — Validator-bound sequential resume.** Persist the byte count, strong ETag, expected length, and content-coding choice. After restart, obtain a fresh locator if needed; append only when the response is `206` and its `Content-Range` begins at the saved offset with the expected total. RFC 9110 defines `If-Range` as an exact strong entity-tag comparison; on mismatch the server ignores `Range` and sends the full current representation. Servers may ignore ranges, and `Accept-Ranges` is advisory. Do not append on `200`, a wrong range, changed total, or missing/weak validator; discard and restart or use a trusted digest path. A rotated signed URL is a locator change, not identity evidence. [RFC 9110 §§13.1.5, 14.2–14.3, 15.3.7](https://www.rfc-editor.org/rfc/rfc9110.html)

**2 — Trusted target identity and whole-file verification.** TUF v1.0.36 describes target metadata that binds a length and hash, verifies fetched target bytes, and withholds access from the application until checks finish. Consistent snapshots can hash-prefix target names. This separates a replaceable name or URL from target identity: resume after URL refresh only if trusted target hash and length remain unchanged, then rehash the staged object before release. A corrupt final segment wastes prior bytes because the full hash is the final gate. TUF does not itself specify range resume or crash-safe promotion. [TUF Specification v1.0.36 §§2, 5.7, 6.2](https://theupdateframework.github.io/specification/v1.0.36/)

**3 — Manifest-verified pieces.** RFC 5854 Metalink allows multiple URLs for one file, a whole-file hash, and ordered hashes for contiguous, non-overlapping pieces. Verify each piece before retaining it; retry missing or corrupt pieces, then verify the whole file. That supports restart and multi-source retrieval without treating byte savings as proof. The manifest must be trusted: signatures are optional, and older hash types are permitted. Use SHA-256 or stronger and establish manifest authenticity separately. Test the mapping from piece index to range and the shorter final piece. [RFC 5854 §§1, 4.1.3, 4.2.4, 7.4](https://www.rfc-editor.org/info/rfc5854/)

**4 — Parallel range fan-out.** Fetch disjoint ranges concurrently, but write each only after status and exact `Content-Range` checks; bind all responses to one strong ETag or authenticated immutable manifest. RFC 9110 permits combining partial responses only when they share a strong validator; Metalink offers a precedent for multiple locations serving one file. Parallelism may help high-latency links, but a mirror or redirect serving a replacement can splice versions unless identity is checked per range. Support across refreshed signed URLs is unknown.

## Inspectable implementation and version leads

1. **libcurl:** inspect [`CURLOPT_RESUME_FROM_LARGE`](https://curl.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html) and related `CURLOPT_RANGE`. It accepts a `curl_off_t` byte offset; the offset alone does not preserve representation identity, verify content, or protect publication. The API page records its addition in curl 7.11.0.
2. **Go TUF:** inspect [`Updater.DownloadTarget`](https://github.com/theupdateframework/go-tuf/blob/master/metadata/updater/updater.go) around lines 2045–2138. It can form a hash-prefixed target path, downloads using trusted length, calls `VerifyLengthHashes`, then writes. This is a control-flow lead, not a 2-GB streaming recipe: the path holds data in a byte slice and calls `os.WriteFile`. The page is mutable `master`; exact commit is UNKNOWN.

Historical lead: RFC 9110 (June 2022) obsoletes RFC 7233; compare older range-resume examples with its current `If-Range` and range-combination rules. [RFC 9110 front matter](https://www.rfc-editor.org/rfc/rfc9110.html)

## Three prospective discriminators

1. **Identity change:** stop halfway through version A, expire its signed URL, then redirect to version B under the same name. Repeat with changed, absent, weak, and reused ETags. Require that no mixed output reaches the final path and that a trusted digest catches mismatch.
2. **Range matrix:** simulate valid `206`, ignored-range `200`, wrong start/total, `416`, truncation, and changed content coding. Verify each either appends the correct bytes or discards/restarts. Treat `Accept-Ranges` as advice only.
3. **Finalization interruption:** terminate after last byte, during hashing, before promotion, and after promotion. On restart, require either the old complete artifact or new verified one at the final path, never a partial file; test file and directory durability separately.

**Bounded next investigation:** compare validator-only resume with trusted whole-file-hash resume using a disposable local HTTP fixture and one synthetic object across these cases. Inspect range/redirect behavior, then crash points. None of these checks was executed here.
