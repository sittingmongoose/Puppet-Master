# Resuming interrupted desktop artifact downloads — discovery shortlist

Case ID: ER12-B-DISC-M-01-FRESH. Role: Brief-only discovery. Scope: resume-and-integrity for one artifact (50 MB–2 GB) across pause/restart, signed-URL redirects, same-name replacement; a partial must never read as complete.

## Four-approach shortlist

**A. Single-stream Range resume with validator + whole-file digest gate.**
Persist bytes to `artifact.part` with resume state (URL, ETag, Last-Modified, length, offset). Resume with `Range: bytes=<offset>-` plus `If-Range` holding the stored validator; accept only a matching `206`, else restart. After the last byte, verify a manifest whole-file digest, then fsync and atomic rename. Boundaries: origin ignoring Range (`200` full body), weak ETag, validator changed, expired signed URL, crash between verify and rename. Evidence: RFC 9110 Range/`If-Range`/validator semantics, obsoleting 7233 [S1]; RFC 9530 `Content-Digest`/`Repr-Digest` [S2]; libcurl byte-offset resume [S3]. Inference: temp-plus-rename gating composes these primitives; no one source states the full gate.

**B. Segmented parallel Range with per-piece hashes (Metalink-style).**
A manifest lists mirrors, size, whole-file hash, piece size, per-piece hashes. The client fetches pieces concurrently over Range, verifies each piece, re-fetches only bad pieces, then verifies the whole file before promotion. Boundaries: unsupported piece-hash algorithm, piece-size mismatch after replacement, one stale mirror, piece journaled done before fsync. Evidence: RFC 5854 mirrors, hashes, pieces [S4]. Inference: concurrency and journaling are client design beyond the format.

**C. Immutable content-addressed identity with re-resolution.**
Treat the human name as a pointer; bind resume state to an immutable tuple (content hash or version id, length). Every resume re-resolves name → tuple + fresh signed URL; on tuple change, discard the partial and restart with an "updated on server" message, never append. Boundaries: no version/hash API, post-download hash mismatch, signed-URL clock skew, users expecting same-name-equals-same-bytes. Evidence: RFC 9530 representation-vs-content framing [S2]; Metalink hash-carrying manifests [S4]. Inference: the handshake and wording are proposed.

**D. Server-tracked offset session (tus-pattern, adapted).**
The server owns the session: the client queries the server-known offset, transfers from there, and uses per-chunk checksums; resume never trusts the client byte count alone. Boundaries: session expiry, offset reset after compaction, checksum extension absent — and the protocol targets upload, so download use needs a server contract that may not exist. Evidence: tus v1.0.0 core offset, Creation/Checksum/Expiration [S5]. Inference: the download analogy is the weakest fit here.

## Comparison

| Approach | Resume signal | Integrity signal | Signed URL | Replacement | Cost |
|---|---|---|---|---|---|
| A Range + digest gate | client offset + `If-Range` | whole-file digest at end | re-resolve, keep offset | validator mismatch → restart | low |
| B segmented + piece hashes | per-piece offsets | per-piece + whole-file | re-resolve per piece/set | tuple change → restart pieces | medium |
| C content-addressed | offset valid under same tuple only | tuple hash is identity | re-resolve every resume | first-class new-tuple restart | low-medium |
| D server session | server-reported offset | checksum extension | session re-issue | version/offset reset | high, needs server |

No winner is declared: A is the minimal baseline, B pays off only for large files on flaky links, C alone makes replacement explicit, D needs origin buy-in. Fewer bytes never proves integrity in any row.

## Implementation leads

1. **curl / libcurl resume.** `CURLOPT_RESUME_FROM` byte offset (`_LARGE` beyond 2 GB) and `-C -` auto-resume are the reference single-stream implementation [S3]. Inspect `docs/libcurl/opts/CURLOPT_RESUME_FROM.md` and resume logic in `github.com/curl/curl`; note where it skips identity checks — the gap our digest gate fills.
2. **aria2 segmented + Metalink.** RFC 5854 co-author T. Tsujikawa authors aria2, which implements Metalink mirrors, piece hashes, segmented Range fetching [S4]. Inspect `github.com/aria2/aria2` Metalink parsing and piece picker for per-piece verification and mirror failover.

## Historical / version lead

Range lineage RFC 2068 → 2616 → 7233 → 9110; digest lineage RFC 3230 → 9530. RFC 9110 (June 2022, STD 97) obsoletes 7233 [S1]; RFC 9530 (Feb 2024) obsoletes 3230 and `Digest`/`Want-Digest` [S2]. Validator-strength and `If-Range` exact-match rules hardened along the way; re-check any 2616/3230-era sample code against the current pair.

## Discriminating probes

1. **Range fidelity.** HEAD for length/ETag, GET first bytes via Range, then resume with stale `If-Range`: `206` vs `200`? Validator honored? `Accept-Ranges` advertised? Gates A/B viability.
2. **Same-name replacement.** Seed 50% partial, replace server bytes under the same name, resume: corrupt append, silent restart, or clean "updated" restart? Separates C from naive A.
3. **Crash during finalize.** Kill between last byte, verify, rename across runs: partial ever listed complete? Message understandable? Next launch deterministic? Tests gating discipline in all four.

## Unknowns and next step

Unknown: origin Range/validator/digest support; any version/hash API for C; signed-URL lifetime and re-resolution endpoint; desktop atomic-rename guarantees; allowed failure wording. Next (bounded, no implementation): read-only staging matrix — one HEAD, three Range/`If-Range` variants, one digest-preference request — plus a three-case local crash harness, recorded as request/response pairs. Stop before any product spec.

## Sources

- [S1] IETF RFC 9110, HTTP Semantics, Jun 2022, STD 97, Range/`If-Range`/validators. `https://www.rfc-editor.org/rfc/rfc9110.html`
- [S2] IETF RFC 9530, Digest Fields, Feb 2024, `Content-Digest`/`Repr-Digest`. `https://www.rfc-editor.org/rfc/rfc9530.html`
- [S3] curl project, `CURLOPT_RESUME_FROM` API docs. `https://curl.se/libcurl/c/CURLOPT_RESUME_FROM.html`
- [S4] IETF RFC 5854, Metalink, Jun 2010, mirrors/hashes/pieces. `https://www.rfc-editor.org/rfc/rfc5854.html`
- [S5] tus community, Resumable Upload Protocol v1.0.0, 2016-03-25. `https://tus.io/protocols/resumable-upload`

Five primary pages across three organizations (IETF, curl, tus) within the eight-page cap; one failed fetch (everything.curl.dev resume page, 404) in source-map. Source statements and inference are separated per approach above.
