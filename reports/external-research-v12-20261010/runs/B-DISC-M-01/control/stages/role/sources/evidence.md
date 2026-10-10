# Bounded primary-source evidence

Retrieval window bounded by adjacent clock observations: 2026-10-10T03:55:15Z–03:59:58Z. The web tool did not expose per-request wall-clock timestamps; exact per-page retrieval UTC is UNKNOWN. Evidence note captured at 03:59:58Z. Sources were inspected through web search/open/find; no source code was downloaded or executed. Notes paraphrase the cited sections and locations.

## HTTP semantics — RFC 9110 (June 2022)

URL: https://www.rfc-editor.org/rfc/rfc9110.html
Locators: §§8.8.1, 13.1.5, 14.2–14.3, 15.3.7.1 and 15.3.7.3; front matter notes RFC 7233 is obsoleted.
Observed: `If-Range` entity-tag matching is strong and exact; a failed condition means the Range field is ignored. A range request may be ignored; `Accept-Ranges` is advice, not a guarantee of a later partial response. A single-range 206 describes its returned offset with Content-Range. Partial responses can be combined only when they share a strong validator. Range byte positions refer to the selected encoded representation when content coding is applied.
Applicability: directly informs HTTP continuation and segmented range preconditions. It does not guarantee a particular origin’s behavior or provide cryptographic artifact identity.

## Metalink — RFC 5854 (June 2010)

URL: https://www.rfc-editor.org/info/rfc5854/
Locators: §§1, 4.1.3, 4.2.4, 7.4.
Observed: file metadata can list multiple URLs, whole-file hashes, and an ordered set of hashes for contiguous pieces with a declared piece length. A URL entry is intended as another location for the same file. Signatures are optional; hash algorithm choice and authenticity of the description remain material.
Applicability: evidence for manifest-bound piece reuse and multi-source transfer, not proof that a service already implements Metalink or that its metadata is trusted.

## The Update Framework — v1.0.36

URL: https://theupdateframework.github.io/specification/v1.0.36/
Locators: §§2, 5.7, 6.2; target metadata data model.
Observed: target metadata binds a file path to length and hashes; the fetch workflow verifies downloaded bytes; the overview withholds access until checks complete; consistent snapshots can use a hash-prefixed target filename.
Applicability: a reference for trusted target identity, full-file verification, and delayed exposure. It does not prescribe resume offsets, streaming, atomic rename, or power-loss guarantees.

## libcurl — `CURLOPT_RESUME_FROM_LARGE`

URL: https://curl.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html
Locator/version: option description, availability says added in curl 7.11.0.
Observed: the option accepts a `curl_off_t` byte offset for where a transfer starts; the same page points to `CURLOPT_RANGE`.
Applicability: concrete offset API lead for large files. The documentation does not claim that setting the offset validates identity or integrity.

## libcurl — `CURLOPT_RESUME_FROM`

URL: https://github.com/curl/curl/blob/master/docs/libcurl/opts/CURLOPT_RESUME_FROM.md
Locator/version: option metadata and description; branch observed as `master`; exact commit UNKNOWN; page records addition in 7.1.
Observed: this older API uses a `long` offset and directs users needing resume beyond 2 GB to `CURLOPT_RESUME_FROM_LARGE`.
Applicability: version/history context for the large-offset API, not evidence of integrity checks.

## go-tuf — target updater source

URL: https://github.com/theupdateframework/go-tuf/blob/master/metadata/updater/updater.go
Locator/version: `Updater.DownloadTarget`, approximately source lines 2045–2138; branch observed as `master`; exact commit UNKNOWN.
Observed: with consistent snapshots and hash prefixing enabled, the target URL is formed using a metadata hash; fetched bytes are passed to `VerifyLengthHashes`; persistent write follows verification. The inspected path holds downloaded content in a byte slice and writes it with `os.WriteFile`.
Applicability: concrete control-flow lead for identity and verification ordering. Memory use, temporary-file behavior, crash safety, and exact current commit were not established. Commit provenance remains UNKNOWN.
