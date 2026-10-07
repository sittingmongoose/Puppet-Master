# Independent source review: D-M15-A frozen control-v3

**Overall: FAIL. Full declared material scope assessed.** Five distinct defects prevent PASS; all eight primary sources and all forty consequential claim groups were checked. This is the first review of the exact frozen version. No candidate feedback or rescue round occurred.

Frozen final: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/final.md`
SHA-256 verified before assessment: `6fd7b4ff379feafda1135147f69891b3c71105215709c7ec397039705eb310f0`. Candidate bytes and grades were not modified.

## Assessment extent and limits

Original brief and empty open-discovery manifest, exact full final, mapped index and all eight raw captures were read. Governing primary sections were checked beyond candidate-selected locators, including negative/adverse conditions. No unrelated RFC chapters or exhaustive unknown answer key are claimed. **Unassessed remainder within the declared material scope: none.** Runtime/app/server behavior and historical candidate actions remain unverified, as explicitly outside this document review.

Arm/method are visible in the supplied path and content; this review is independent but not method blind. No other arms, cases, drafts, timings, grades, parent analysis, prior reviews or campaign helpers were read. Own current-run T3 metadata was read with no timeline items, solely for the start/deadline. M14 authored-set/projection comparison is not applicable.

## Six axes

| Axis | Disposition | Assessment |
|---|---|---|
| A1 All required obligations | FAIL | All six topics appear; O3 is substantiated, while O1/O2/O4/O5/O6 have material gaps. Appearance and the candidate coverage assertion are not fulfillment. |
| A2 Consequential claims and full release/default/type/unit/path/authority conditions | FAIL | Forty grouped claims covering the complete final were checked against the primary corpus. Source editions and authority corroborated. File SHOULD/errors, curl hard-time limits, opaque ETag semantics and GET/upload direction contradict key claims. Exact byte offsets, seconds, upload URL/MIME/header conditions and optional extensions are recorded in E01-E22. |
| A3 Bounded useful discovery, negative and optional yield | PARTIAL | Eight bounded findings, useful HTTP/tus versus object-lifecycle discovery, and relevant negative leads are present. Windows/server capabilities are correctly unresolved. Generic-HTTP impossibility and draft unshippability are overstated if read literally; checksum/termination options and capture conditions are retained in review evidence. No exhaustive unknown answer key or preferred component is assumed. |
| A4 Wrong rejection, correction and unjustified abstention | FAIL | Adding reset as declared application policy and avoiding uncontracted partial PUT are reasonable. Categorically excluding every row/path identity without a digest is unsupported. Draft status justifies a stability preference, not a universal deployment ban. No unjustified abstention from the module was found. |
| A5 Preservation, traceability, uncertainties and options | FAIL | Hashes, source identities and F1-F8 traceability are good and independently corroborated. Preservation is overstated for File API; F5/F8 uncertainty about ETag agreement is retained but then violated by the central reconciliation. Immutable-byte retention, descriptor lifetime and exact upload resource/current revision bindings remain consequential. |
| A6 Proposed versus executed checks | FAIL | The final clearly labels target tests as proposed and makes no claim they passed. Candidate execution history cannot be authenticated within scope; source hashes/anchors/quotes were reproduced by reviewer. Validation choices are materially non-discriminating as described in D04; no target server/app/code was executed. |

## Obligation coverage

| Obligation | Disposition | Evidence and assessment |
|---|---|---|
| O1 Address interrupted transfers and bounded retries. | PARTIAL | final.md:11, final.md:12, F2, F3 — Resume and retry are addressed, but the claimed wall-clock guarantee omits active-attempt bounds and failure-state reconciliation. |
| O2 Address replacement/version identity during resume. | PARTIAL | final.md:9, final.md:10, final.md:17, F5, F7, F8 — Local byte identity/retention is a useful design; web preservation and remote/version bindings are materially misstated. |
| O3 Investigate transport-side and local-object-side mechanisms independently. | PASS | F1-F4, F5-F7, sources/index.json rows 0-7 — Both transport and local-object/lifecycle source families are substantively examined. No independent claim about historical investigation order.  |
| O4 Reconcile their overlap instead of concatenating two answers. | FAIL | final.md:17 — The final actively reconciles the families, but through an invalid digest/ETag/snapshot equivalence and insufficient upload/version binding. |
| O5 Return at most eight supported material findings with negative leads/uncertainty retained. | PARTIAL | F1-F8, final.md:44 — Eight findings and useful negative leads/uncertainties are retained, but material findings F3/F7 are not supported as stated. |
| O6 Give a bounded recommendation and discriminating validation without building a full sync service. | PARTIAL | final.md:5-13, final.md:30-44 — Scope is appropriately bounded and checks are clearly proposed, but they do not discriminate their declared assumptions. |

## Material defects

### D01 — File API snapshot state is promoted to guaranteed old-byte preservation (HIGH)

Candidate: final.md:17, final.md:27. Primary evidence: E19, E20.

The disk-backed File rule is SHOULD at creation/reference time; snapshot mismatch and deletion/readability failures are explicitly defined. The candidate instead promises readable old bytes and snapshot-at-transfer-start semantics.

Consequence: The stated cross-platform preservation guarantee can fail before a digest-bound job reads/resumes the old bytes. A correctly quoted phrase supports a materially wrong conclusion.

Reviewer inference: This requires an actual preserved byte snapshot/object or defined failure handling; a File reference and snapshot-state metadata alone are insufficient. This is not a claim that every browser necessarily fails every rename.

Deduplication: C17/C27 and the local part of C32 repeat this single defect.

### D02 — Local digest, remote validator and upload-resource/version bindings are conflated (HIGH)

Candidate: final.md:7, final.md:17, final.md:25, final.md:28, final.md:37. Primary evidence: E01, E02, E04, E05, E08, E22.

Strong ETags need not be content-derived. If-Match tests the current target representation; tus binds a URL and current accepted offset, not the job content digest. The reconciliation treats these as one content-derived identifier despite its retained uncertainty.

Consequence: Using a new-body digest as a current ETag can falsely reject writes; treating a changed full download as the old job can violate its identity; lack of an explicit upload-job/current-attachment binding leaves old-A completion versus replacement-B publication unresolved.

Reviewer inference: A useful bounded invariant distinguishes local snapshot digest, logical attachment revision/current pointer, server-issued validator, upload URL and confirmed byte offset. Old jobs must not become current merely because their bytes completed. This is a semantic gap, not a request for a full sync service.

Deduplication: Do not separately count the incomplete checksum-to-ETag assumption, stale publication binding or download restart identity as three additional defects.

### D03 — Claimed wall-clock retry bound is not supplied by the cited curl mechanism (HIGH)

Candidate: final.md:12, final.md:23, final.md:42. Primary evidence: E12, E13, E14, E07.

--retry-max-time limits admission of additional retries; an active transfer may exceed it. --max-time supplies a separate attempt limit. The final omits this governing condition while promising wall-clock bounds. It also paraphrases a named status list as 5xx-class and mislabels reset as timeout.

Consequence: An attempt on a failed rural connection can continue past the stated budget even with retry count/time options. This directly weakens obligation 1.

Reviewer inference: A hard job deadline or per-attempt cap tied to the remaining budget is needed. Adding reset as explicit application policy is sensible, but replay remains conditional on server-accepted state/idempotency.

Deduplication: Status-list/reset source inaccuracies are related supporting issues, not additional high-materiality failures.

### D04 — Validation does not discriminate the transport capability or identity assumptions it claims to decide (HIGH)

Candidate: final.md:35, final.md:36, final.md:37. Primary evidence: E02, E03, E04, E08, E10, E22.

GET Range measures download behavior, not tus upload support. A lone 206 does not test stale If-Range enforcement; full 200 can be correct. Checksum agreement does not establish ETag derivation. The A/B test exercises one completion policy rather than proving the supersede/abandon choice.

Consequence: The proposed tests can approve a server that ignores validators, select the wrong-direction protocol, or leave stale completion/current attachment identity undetected.

Reviewer inference: A bounded check set can independently test matched/stale download validators with range metadata, tus capabilities plus lost-response HEAD/PATCH offset recovery, local read invalidation and late A completion after B publication. This describes discrimination gaps rather than executing tests or feeding a candidate rescue round.

Deduplication: All three proposed checks are assessed; their limitations share this one validation-design defect.

### D05 — Digest-free path/row identity is categorically rejected without distinguishing immutable version binding (MEDIUM)

Candidate: final.md:17, final.md:43. Primary evidence: E01, E08, E16, E21.

RFC strong revision identifiers and upload-specific resource identifiers support valid identity schemes that need not be content hashes. An unversioned mutable row/path is unsafe, but no source makes a digest the sole safe choice.

Consequence: The recommendation wrongly excludes feasible version/validator-bound designs and mistakes a particular implementation preference for a source-imposed safety condition.

Reviewer inference: The acceptance condition is binding resumes to one immutable representation; digest is a reasonable recommendation, not a required universal proof. No preset component/adoption outcome is imposed.

Deduplication: Related to D02, but distinct: D02 is an unsafe equivalence across bindings; D05 is a wrong rejection of alternatives.

## Independent source provenance

Eight review-time public GETs succeeded. Seven body hashes equal the mapped captures. The draft raw hash differs only in one Cloudflare challenge script line; complete script-excluding document text matches (semantic SHA-256 `79bf4227bc16f1c4f3c078dd6534634b1df79c44bfa131cd5914d8ecb5c2d446`). Scripts were never executed. Current public response headers corroborate candidate Last-Modified/ETag claims; historical capture timestamps and the candidate historical procedure remain claims. See `sources/capture_audit.json` and `sources/independent_fetch_index.json`.

Each source below is the mapped primary path and hash; independent bytes/URL/headers/time/hash are recorded separately. Raw HTML anchor line numbers and projection hashes are retained in the audit.

### S1 — rfc9110.html

URL: https://www.rfc-editor.org/rfc/rfc9110.html

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/rfc9110.html`
SHA-256: `d431760660ea44e130f6e919dab216df2d0b3a490567a98089267523368fe1e5`

Verified edition: RFC 9110, HTTP Semantics, June 2022.
Authority/conditions: IETF Standards Track RFC; normative HTTP semantics, optional range support.
Version locator: Front matter; #section-8.8.1, #section-13.1.5, #section-14.5.
Capture limit: Single HTML render of the RFC; section text quoted from captured bytes only. Whole-RFC capture (~1.19 MB); no other RFCs captured. No code executed.

### S2 — tus-resumable-upload-protocol.html

URL: https://tus.io/protocols/resumable-upload

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/tus-resumable-upload-protocol.html`
SHA-256: `868947ec6573ff745f31649d730616bfcd7d154af0c22ab39f1af4937f3e3a21`

Verified edition: tus protocol 1.0.0, dated 2016-03-25.
Authority/conditions: Community-owned protocol specification; core required for tus implementations, extensions negotiated; not an IETF RFC.
Version locator: #about-this-version; #status; #core-protocol.
Capture limit: Vendor protocol spec (tus.io), not an IETF standard; describes the 1.0.0 wire protocol only, no server implementation details captured. No code executed.

### S3 — curl-manpage.html

URL: https://curl.se/docs/manpage.html

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/curl-manpage.html`
SHA-256: `0ef77bad12997946fd2663bb2222b4201ab5cf3b2d724595cb099ca2ef58283d`

Verified edition: curl 8.23.0, explicitly stated by the captured man page.
Authority/conditions: Official tool documentation; describes curl rather than every HTTP client. No installed or target-client release was verified.
Version locator: #VERSION; #--retry; #--retry-max-time.
Capture limit: Documents one client tool's behavior, not a standard; behavior of other HTTP clients (browser fetch, mobile stacks) is NOT covered by this capture. No code executed.

### S4 — draft-ietf-httpbis-resumable-upload.html

URL: https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-resumable-upload

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/draft-ietf-httpbis-resumable-upload.html`
SHA-256: `1710111b176fe87f72259d216330b375c7615d8eba2935d40ae5f9a8e9224e85`

Verified edition: draft-ietf-httpbis-resumable-upload-13, published 2026-10-06, expires 2027-04-09; draft interop version 10.
Authority/conditions: Active HTTP WG Internet-Draft, intended Standards Track; work in progress, not an approved RFC.
Version locator: #section-4; #section-4.7; #appendix-B; front matter Status of This Memo.
Capture limit: Internet-Draft, work in progress: may change or expire; NOT a normative standard. Captured via datatracker render, no .txt variant captured. No code executed.

### S5 — man7-rename.2.html

URL: https://man7.org/linux/man-pages/man2/rename.2.html

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/man7-rename.2.html`
SHA-256: `8772946a809a0db54f4854f200908f10bee758ea452e8df5efd955bc3b8e6e57`

Verified edition: Linux man-pages 6.19, rename(2) page dated 2026-02-08; HTML render 2026-09-09.
Authority/conditions: Linux kernel/libc project documentation; rename() references C11/POSIX.1-2024. No Windows or macOS runtime verification.
Version locator: #DESCRIPTION; #ERRORS; #STANDARDS; #COLOPHON.
Capture limit: Documents POSIX/Linux behavior only; Windows/macOS file-replacement semantics (share modes, replacement locks) are NOT captured. Man page, not a formal standard text.

### S6 — man7-unlink.2.html

URL: https://man7.org/linux/man-pages/man2/unlink.2.html

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/man7-unlink.2.html`
SHA-256: `54342d11f277bc670a1896301752b87abbb27261a1e84e8300f2d4c1b0fbde9b`

Verified edition: Linux man-pages 6.19, unlink(2) page dated 2026-02-08; HTML render 2026-09-09.
Authority/conditions: Linux kernel/libc project documentation; open-unlinked lifetime conditional on retained descriptor. No other-platform verification.
Version locator: #DESCRIPTION; #STANDARDS; #COLOPHON.
Capture limit: POSIX/Linux only; does not cover platform replacement dialogs or cloud-side tombstones. No code executed.

### S7 — w3c-fileapi.html

URL: https://www.w3.org/TR/FileAPI/

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/w3c-fileapi.html`
SHA-256: `975b6f12f51320b7f90af2b97e38a80358b5964bc274caafb5d126b3f3881efc`

Verified edition: W3C File API Working Draft, 2026-09-12; dated edition /TR/2026/WD-FileAPI-20260912/.
Authority/conditions: W3C Working Draft; Blob/File snapshot-state requirements must be read with File SHOULD and normative read errors.
Version locator: #blob-section; #file-section; #dfn-error-codes.
Capture limit: Web-platform spec; relevant only if the app reads attachments through a web/HTML5 stack; Working Draft (not a finished Recommendation).

### S8 — git-internals-objects.html

URL: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects

Mapped primary: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/control/whole_question_research_final-v3/sources/git-internals-objects.html`
SHA-256: `2392ed9763af88229b885e6b9df7b71be550bb34d6be48243305328c73d6a07a`

Verified edition: Pro Git second edition, section 10.2 Git Internals - Git Objects.
Authority/conditions: Author/project-hosted explanatory primary book chapter; content-addressing illustration, not an HTTP or SHA-256 protocol contract.
Version locator: #_objects; #_object_storage.
Capture limit: A book chapter describing Git's design (SHA-1 content addressing); used as the canonical public description of content-addressed identity, not as a wire-protocol spec. No code executed.

## Primary evidence facts

Projection line ranges refer to the hash-linked text files under this review `sources/`. The raw primary HTML anchors control; projections preserve source order and are review locators, not replacements for original bytes.

- **E01 / S1** — #section-8.8.1; #section-8.8.3.1; #section-8.8.3.2; projection lines 2848-2920; 3034-3062. Strong validators change with representation data; strict revision identifiers and collision-resistant content hashes are examples. ETags are opaque and compared character by character. Strong does not mean content-derived or globally unique across resources.
- **E02 / S1** — #section-13.1.5; #section-13.2.2; projection lines 5061-5122; 5166-5203. If-Range accompanies Range. Weak entity tags must not be generated. A strong HTTP-date is permitted only when no entity tag exists. False If-Range causes Range to be ignored and a full selected representation rather than 412 in the ordinary successful GET case.
- **E03 / S1** — #section-14.1.2; #section-14.2; #section-14.3; projection lines 5288-5323; 5361-5457. Byte ranges use zero-based inclusive byte positions and refer to encoded representation data when content coding applies. Range is defined for GET, may be ignored, and support is optional. Accept-Ranges is advisory and cannot guarantee a future partial response.
- **E04 / S1** — #section-14.4; #section-15.3.7; #section-15.3.7.3; #section-15.5.17; projection lines 5458-5513; 5837-5874; 5944-5981; 6401-6427. A client must inspect Content-Type/Content-Range in 206. Invalid ranges must not be recombined. Combining partial content requires a common strong validator; 206 message length is not generally whole-object length. 416 can describe current full length, but servers may send full 200 instead.
- **E05 / S1** — #section-13.1.1; #section-13.1.2; #section-13.2.1; projection lines 4797-4925; 5124-5154. If-Match uses the current selected representation ETag with strong comparison, often for preventing lost updates; false conditions prevent the method, normally 412, with an already-applied-success exception. If-None-Match * can guard creation. Preconditions do not override redirects or ordinary failures.
- **E06 / S1** — #section-14.5; projection lines 5528-5547. Some servers support partial PUT under private agreements. Support is inconsistent, unsupported partial PUT should be rejected, and older behavior may replace the entire representation. Other expressly defined partial update methods or subresources are possible.
- **E07 / S1** — #section-10.2.3; #section-9.2.2; projection lines 4001-4022; 3243-3284. Retry-After can be an HTTP-date or non-negative integer seconds. Automatic retry of a non-idempotent request needs known idempotent semantics or evidence the original was not applied; absence of a response alone is insufficient.
- **E08 / S2** — #core-protocol; #tus-resumable; #head; #patch; projection lines 97-207. Core assumes an existing upload URL. Tus-Resumable is required except OPTIONS, unsupported versions produce 412. Successful HEAD returns non-negative byte Upload-Offset, Upload-Length if known, and no-store; missing/inaccessible resources may return 404/410/403 without an offset. PATCH requires application/offset+octet-stream and an equal current offset; mismatch gives 409 with no modification; success returns the new processed/stored offset.
- **E09 / S2** — #options; #protocol-extensions; #creation; #post; projection lines 208-244; 274-312. OPTIONS advertises Tus-Version and optional extensions/size limits. Creation is an extension; POST carries Upload-Length or deferred length and returns 201 plus an absolute or relative Location for the new resource. These are server capability and upload-resource bindings, not digest guarantees.
- **E10 / S2** — #checksum; #upload-checksum; projection lines 376-408. Checksum is optional and must be advertised. Verification covers each entire PATCH payload, with a named algorithm and Base64 checksum. Unsupported algorithm or checksum mismatch discards that chunk without advancing the offset. Only SHA1 support is required of checksum-extension servers, not SHA-256 or a final-object checksum API.
- **E11 / S2** — #expiration; #upload-expires; #termination; #delete; projection lines 337-375; 433-451. Unfinished uploads may expire; Upload-Expires is an HTTP date, can change, and expired 404/410 resources require a new upload. Negotiated termination permits deletion/freeing of completed or incomplete uploads. Completion rather than cancellation is not a protocol safety requirement.
- **E12 / S3** — #--retry; #--retry-delay; projection lines 2375-2382; 2398-2406. Retry count defaults to zero. Named transient HTTP statuses are 408,429,500,502,503,504,522,524, plus timeout (and FTP 4xx). Backoff starts at one second, doubles to a ten-minute plateau; --retry-delay changes this. Curl honors Retry-After since 7.66.0. Decimal seconds for delay/max-time options are documented since 8.16.0.
- **E13 / S3** — #--retry-max-time; #--max-time; projection lines 2407-2415; 1598-1606. Retry max time is measured in seconds and gates starting further retries, including previous attempts and sleeps. Zero disables retry timeout. An attempt already started may run beyond that limit. --max-time separately limits each transfer and resets for each retry.
- **E14 / S3** — #--retry-all-errors; #--retry-connrefused; #EXIT; projection lines 2383-2397; 3431-3450; 3481-3490. Retry-all-errors warns of duplicate data and non-rewindable redirected IO. Connection refusal is separately opt-in. Partial file, operation timeout, sending failure, and receiving failure are distinct exit categories; a mid-body reset is not defined as just timeout.
- **E15 / S3** — #--continue-at; projection lines 631-640. Continue-at uses a byte offset or local input/output size with -C -. It does not resume HTTP POST/PUT uploads and cannot be combined with --range. Tool resume support is not general server upload capability.
- **E16 / S4** — front matter Status of This Memo; #section-4; #section-4.1.1; #section-4.6; #section-4.7; #appendix-B; projection lines 89-133; 410-426; 643-656; 960-968. Draft -13 is work in progress, with upload-specific temporary resource URLs, application-processed byte offsets, separate resources for separate representations, concurrency rules, offset retrieval after lost responses and a retry-count recommendation. Draft implementations use interop version 10. Draft status prevents describing it as an approved RFC; it does not declare every implementation unshippable.
- **E17 / S5** — #DESCRIPTION; #ERRORS; #BUGS; projection lines 30-50; 189-193; 234-239. Successful rename replaces an existing pathname atomically and leaves already-open descriptors unaffected. This preserves descriptor/name relationships rather than promising immutable contents. Cross-mount rename fails with EXDEV; NFS error responses can be ambiguous about whether rename occurred.
- **E18 / S6** — #DESCRIPTION; projection lines 25-35. After removal of the last link, an open file remains until the last referring descriptor closes. The description supplies a lifetime condition, not a promise to copy or freeze the bytes.
- **E19 / S7** — #blob-section; #snapshot-state; #file-section; projection lines 258-266; 507-520. Blob has snapshot state. Disk-backed File snapshot state SHOULD correspond to disk state at File creation/reference time; the source explicitly says SHOULD rather than MUST because implementing it is nontrivial. Modification can make snapshot state differ from underlying storage; implementation may use timestamps.
- **E20 / S7** — #ErrorAndException; #dfn-error-codes; projection lines 1030-1084. Moved/deleted backing files can be unavailable. SnapshotState mismatch or FileLock failure maps to NotReadableError. Snapshot-state tracking does not guarantee that an old readable byte copy is preserved.
- **E21 / S8** — #_objects; #_object_storage; projection lines 258-348; 463-495. Git illustrates storing both old and new blob contents under content-addressed keys. Its chapter describes SHA-1 over an object-type/length header plus content, not raw-photo SHA-256, HTTP ETags, or cancellation policy.
- **E22 / S1** — #section-8.8.3.3; #section-8.8.2.2; projection lines 2924-2992; 3088-3125. Strong validators are representation-specific, including content-coding distinctions. Last-Modified is implicitly weak unless documented comparison conditions make it strong. Equal checksum values do not establish arbitrary ETag-generation policy or preserve content-negotiation distinctions.

## Every consequential claim and recommendation

Groups cover the whole frozen final, including findings, conditions, dispositions, provenance statements and all proposed checks. Repeated wording is deduplicated, not silently omitted. Source facts and reviewer engineering inferences are distinguished.

### C01 — Open discovery, primary documents selected, quotes checked against captured bytes, no downloaded code executed.

final.md:3 — **PARTLY_VERIFIABLE** (provenance / execution assertion). Evidence: brief/final/index and independent provenance checks.

The original source manifest is empty. Eight source identities are corroborated independently. Hashes and quotations are reproducible; the candidate historical checking process and no-execution statement cannot be independently observed from allowed artifacts. No contrary execution claim is made.

### C02 — Bind each transfer to a snapshot and SHA-256 digest, transferring an identity/bytes pair.

final.md:7,9 — **SUPPORTED_DESIGN_INFERENCE** (engineering inference). Evidence: E21, E01.

A useful design choice if bytes are really materialized or otherwise pinned and immutable for the job. Git supports the content-addressing analogy, not this particular SHA-256 wire contract. Hash exactly the bytes transferred and retain them to terminal state; do not infer preservation from File snapshot state.

### C03 — Every replacement mints a new digest/object name.

final.md:10,25 — **CONDITIONAL** (source fact / recommendation). Evidence: E21.

Changed byte content ordinarily changes content identity; byte-identical replacement reuses the content identity. A distinct user-edit revision is a separate binding if needed. This nuance is not itself a decisive defect.

### C04 — Superseded rather than killed; old job can complete or be abandoned, stop retries and enqueue the new object.

final.md:10,41 — **SUPPORTED_DESIGN_INFERENCE** (engineering inference / lifecycle policy). Evidence: E17, E18, E11. Defects: D02, D03.

This is a permissible policy, not required by POSIX or tus. Finishing or abandoning an immutable upload can both be safe. Stopping future retries is not a bound on an already running attempt, and completing old content must not re-publish it as the current attachment.

### C05 — POSIX rename atomically replaces a pathname and open descriptors remain unaffected.

final.md:10 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E17.

Quotes match. Successful same-mounted-filesystem rename is the documented operation; it does not cover arbitrary in-place overwrites, cross-mount replacement or other OS share modes. Atomic namespace replacement alone is not byte immutability.

### C06 — Deleted-but-open file persists until the final referring descriptor closes.

final.md:10 — **SUPPORTED** (source fact / recommendation). Evidence: E18.

Accurately retains the open-descriptor lifetime condition. The job must retain its descriptor/object; reopening the old pathname after unlink is not promised.

### C07 — Range plus If-Range converts stale download resume into full selected representation instead of 412.

final.md:11 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E02, E03, E04. Defects: D02.

Correct for successful GET/Range processing. A client must treat the 200 body as a replacement, never append it to old partial bytes. It is a new representation, not completion of the old digest-bound job; ordinary errors/redirects still apply.

### C08 — tus HEAD returns authoritative offset; PATCH appends there.

final.md:11,22 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E08, E09.

Correct for a successful, uncached query to the same upload URL. Offset is in bytes and PATCH must match the current value; otherwise 409 without mutation. Lost acknowledgments call for a fresh offset query rather than replaying a guessed offset. An offset verifies progress, not object identity.

### C09 — Optional per-chunk Upload-Checksum.

final.md:11,22 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E10.

Accurate optionality; requires advertised checksum extension and common algorithm. Coverage is a PATCH payload, not necessarily the whole photo; SHA-256 is not mandated by tus. A final checksum exposure API is not promised.

### C10 — Generic HTTP has no dependable standard resumable-upload path; reject reliance on Partial PUT.

final.md:11,22,24,43 — **SUPPORTED_IF_NARROWED** (source fact / recommendation). Evidence: E06, E15, E16.

Sound as a statement that HTTP Range/ordinary PUT do not give portable upload resume. RFC 9110 explicitly allows agreed partial PUT and defined partial-update alternatives. The F2 wording generic HTTP cannot do this must not be read as impossibility: tus itself uses HTTP. Avoiding private partial PUT without a known contract is a reasonable bounded choice.

### C11 — Count and wall-clock bounded retry using curl --retry-max-time.

final.md:12,23 — **CONTRADICTED_AS_HARD_BOUND** (source fact / recommendation). Evidence: E12, E13. Defects: D03.

Count, retry-admission time and backoff are documented. --retry-max-time alone does not stop a running transfer, so it does not establish the claimed wall-clock bound; per-attempt timeout or an absolute application deadline is missing.

### C12 — Curl transient class is timeout plus HTTP 408/429/5xx-class.

final.md:12 — **OVERBROAD_SOURCE_PARAPHRASE** (source fact / recommendation). Evidence: E12. Defects: D03.

The captured class names eight HTTP statuses, not every 5xx. An application can choose a broader class as policy, but must label it as such and avoid attributing all 5xx retry behavior to curl.

### C13 — Backoff starts at one second and doubles; honor Retry-After.

final.md:12,23 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E12, E07.

Source supports it, with a ten-minute plateau and --retry-delay override. Retry-After is an HTTP date or integer seconds and may exceed the remaining job budget. Stop or defer the job at its deadline rather than waiting without bound.

### C14 — Add mid-body connection reset; it fits only timeout in the captured class.

final.md:12,23,42 — **MIXED** (source attribution plus proposed policy). Evidence: E14, E07, E08. Defects: D03.

Explicitly adding resets as application policy is sensible and is not rejected. A reset is not just timeout in curl documentation. Retry must still account for possibly accepted bytes and non-idempotent effects. Rural-link frequency was not measured.

### C15 — Per-attachment transfer module, no full sync service, conflict merge, daemon or offline store.

final.md:13 — **SUPPORTED_SCOPE_CHOICE** (scope choice). Evidence: brief/final/index and independent provenance checks.

Fits the brief. Temporary retention of job bytes is still needed. A full application or persistent offline system is not required by this review.

### C16 — Transport strong validator and local digest are the same content-derived object; local digest is the app-side ETag.

final.md:17 — **CONTRADICTED_AS_PROTOCOL_EQUIVALENCE** (source fact / recommendation). Evidence: E01, E05, E08, E22. Defects: D02.

ETags can be revision IDs or other opaque values. A local checksum is not automatically the current remote ETag; If-Match applies to the current target representation, not the incoming new body digest. tus defines upload URL/offset bindings without this equivalence. F5/F8 acknowledge uncertainty but the reconciliation uses the equivalence as a guarantee.

### C17 — Replacement resolves without per-case analysis: OS/platform keeps old bytes readable, including web snapshot state.

final.md:17 — **CONTRADICTED_FOR_WEB** (source fact / recommendation). Evidence: E17, E18, E19, E20. Defects: D01, D02.

POSIX descriptor survival is conditionally useful. W3C File snapshot tracking explicitly permits changed/deleted/unreadable backing data and requires error handling; it does not supply the old-byte retention claimed here.

### C18 — Next resume carries If-Range/If-Match; mismatch restart or 412 coincides with new local digest job.

final.md:17 — **INCOMPLETE_BINDING** (source fact / recommendation). Evidence: E02, E05, E08, E04. Defects: D02.

If-Range is a download GET condition, whereas tus PATCH resume uses upload resource and offset. If-Match is a separate current-resource precondition where supported. Changed remote representation does not establish what new local bytes should be uploaded. A full 200 response must not be relabeled as the original digest-bound job.

### C19 — Path or row-ID resume without a digest is the one mechanism that must be rejected because it causes corruption.

final.md:17,43 — **UNJUSTIFIED_EXCLUSIVE_REJECTION** (source fact / recommendation). Evidence: E01, E21, E08, E16. Defects: D05.

Unversioned mutable path/row identity is unsafe, but a row ID plus immutable version/revision and server validator or a unique bound upload resource can be safe without a content digest. The fault is lack of a representation binding, not omission of this specific identity mechanism.

### C20 — F1: HTTP range support optional, discovered through Accept-Ranges; If-Range needs strong validator.

final.md:21 — **SUPPORTED_WITH_CONDITIONS** (source fact / recommendation). Evidence: E02, E03.

Correct strength and optionality. Accept-Ranges is only advice, not proof. An actual current response and returned range metadata matter. No per-server support evidence is supplied, as acknowledged.

### C21 — F2: tus 1.0.0 upload mechanism requires server support.

final.md:22 — **SUPPORTED** (source fact / recommendation). Evidence: E08, E09, E10.

A tus-speaking server is required; existing support may be used instead of personally deploying it. Offset/checksum distinctions and optional extensions must be retained.

### C22 — F3: curl documents the full hard-bounded pattern and reset classification.

final.md:23 — **PARTLY_CONTRADICTED** (source fact / recommendation). Evidence: E12, E13, E14. Defects: D03.

Retry admission/backoff are supported, hard job runtime and reset-as-timeout are not. This repeats C11-C14 rather than a separate defect.

### C23 — F4: draft -13 is active and non-normative; reject treating it as shippable.

final.md:24,43 — **STATUS_SUPPORTED_REJECTION_OVERSTATED** (source fact / recommendation). Evidence: E16.

Active, work-in-progress, not an approved standard is verified. It contains normative MUST/SHOULD requirements inside the draft and an interop version. Declining it for a stable recommendation is legitimate; source status alone does not prove any implementation cannot be shipped. No adoption truth is imposed.

### C24 — F5: content identity preserves old and new content; digest snapshot bytes and retain old object until job terminal.

final.md:25 — **SUPPORTED_DESIGN_INFERENCE** (engineering inference). Evidence: E21, E17, E18.

Useful explicit conditions. A digest identifies content and does not itself cause storage retention. The SHA-1 Git analogy is openly identified; SHA-256 is an application choice.

### C25 — F5 negative lead: nothing guarantees server ETag equals the local digest.

final.md:25 — **SUPPORTED** (source fact / recommendation). Evidence: E01, E22. Defects: D02.

This is an important retained uncertainty. It directly limits C16 and prevents using the local digest as an HTTP validator without a server contract.

### C26 — F6: atomic rename, FD isolation, unlink lifetime imply local replacement cannot corrupt an in-flight read.

final.md:26 — **SUPPORTED_ONLY_UNDER_STATED_SNAPSHOT_DESIGN** (source fact / recommendation). Evidence: E17, E18.

True for a completed rename onto a new object while an already-open old object stays unmodified, or for a real byte snapshot. Not a guarantee for in-place writes or an arbitrary storage API. POSIX-only and missing Windows evidence are correctly retained. No durability claim is inferred.

### C27 — F7: Working Draft snapshot state makes replaced-file reads reflect snapshot-at-transfer-start.

final.md:27 — **CONTRADICTED** (source fact / recommendation). Evidence: E19, E20. Defects: D01.

The date/status and quoted phrase match. File snapshot timing is creation/reference time with SHOULD strength, not transfer start. State mismatch can produce NotReadableError; old bytes are not promised. Adding the condition snapshot at start does not turn a metadata snapshot into a materialized byte copy.

### C28 — F8: If-Match is a write-side twin, but server ETag strength/content derivation unresolved until probe.

final.md:28 — **PARTLY_SUPPORTED** (source fact / recommendation). Evidence: E05, E01. Defects: D02, D04.

If-Match can prevent stale writes, using the current remote tag. Content derivation is optional and unnecessary for strength. The proposed GET/status and checksum tests cannot establish every binding or server generation policy.

### C29 — Actually verified eight hashes, extracted quotes, grepped anchors; no server/app execution.

final.md:32 — **REPRODUCIBLE_RESULT_HISTORY_UNVERIFIED** (execution/provenance assertion). Evidence: brief/final/index and independent provenance checks.

Reviewer independently reproduced eight matching capture hashes, matching source-index hash, exact anchors, quotation wording, and final hash. The candidate claimed historical operations cannot be authenticated without reading forbidden execution history. No target service or app test is evidenced.

### C30 — Capability probe GET Range/If-Range: 206 proves validator-bound resume viability.

final.md:35 — **NOT_DISCRIMINATING_ENOUGH** (proposed check). Evidence: E02, E03, E04. Defects: D04.

A positive matching case does not test whether If-Range is enforced. Need a deliberately stale validator/changed representation case and response Content-Range/type/representation checks. A server ignoring the validator could still return 206 in the sole proposed case.

### C31 — Weak ETag or unconditional 200 means not viable; choose offset protocol; probe decides F1-vs-F2.

final.md:35 — **INVALID_DIRECTION_FORK** (proposed check). Evidence: E02, E03, E08. Defects: D04.

F1 is download and F2 is upload; a GET result cannot select tus upload support or replace a download mechanism. A stale If-Range full 200 is healthy behavior and must be distinguished from a server ignoring Range. Weak ETag cannot be used in If-Range, but need not determine upload capability.

### C32 — Slow upload A then replacement B: assert A completes with A digest, B own job, no mixed bytes; decides supersede-vs-abandon.

final.md:36 — **USEFUL_PARTIAL_CHECK** (proposed check). Evidence: E17, E18, E08, E11. Defects: D01, D02, D04.

Good corruption test if expected digest and exact upload-resource binding are known. It exercises a selected finish-A policy rather than discriminating it from safely abandoning A. It misses late completion of A after B has been made current, interrupted acknowledgments/offset reconciliation, and local read invalidation.

### C33 — Compare server checksum and SHA-256 where available; decides F8 assumption.

final.md:37 — **USEFUL_BUT_INSUFFICIENT** (proposed check). Evidence: E01, E10, E22. Defects: D02, D04.

A checksum match validates bytes only for the same algorithm, byte domain, complete object and representation. A per-chunk tus checksum is not a whole-object checksum; checksum agreement is not proof that ETag equals that digest or follows that rule after updates/content negotiation.

### C34 — Accepted digest, supersede policy, validator download resume and offset upload resume.

final.md:41 — **CORE_CHOICES_REASONABLE_WITH_CORRECTIONS** (recommendation disposition). Evidence: E01, E02, E08, E21, E11. Defects: D01, D02, D03, D04.

These choices can form a bounded module, but the source-based guarantees and missing bindings cannot be adopted unchanged. Neither completing A nor abandoning A is mandated by the primary sources.

### C35 — Amended reset classification while keeping count/time bounds.

final.md:42 — **REASONABLE_POLICY_INCOMPLETE_BOUNDS** (recommendation disposition). Evidence: E13, E14, E07. Defects: D03.

Explicit correction of the client-policy class is useful; a hard elapsed deadline and accepted-byte reconciliation are still required.

### C36 — Rejected path/row-ID identity, Partial PUT, draft as shippable.

final.md:43 — **MIXED** (recommendation disposition). Evidence: E01, E06, E16. Defects: D05.

Reject unversioned mutable names and uncontracted partial PUT; do not reject every versioned non-digest identity or claim draft status alone bans deployment.

### C37 — Unresolved server ETag strength, Windows share modes, tus-vs-draft without server control.

final.md:44 — **SUPPORTED_LIMITS_TEST_INCOMPLETE** (uncertainty preservation). Evidence: E01, E08, E16, E17. Defects: D04.

These are genuine scope limitations, with no runtime evidence to resolve them. A download GET alone cannot resolve the supported upload contract. Lack of server control means neither tus nor the draft can simply be selected without compatible endpoint support.

### C38 — Transport and local sources were independently investigated/derived before reconciliation.

final.md:48 — **CONTENT_COVERAGE_SUPPORTED_SEQUENCE_UNVERIFIABLE** (process / obligation assertion). Evidence: brief/final/index and independent provenance checks.

The final and corpus address both families independently. Chronological derivation cannot be independently verified from this frozen artifact and is not assumed from row ordering.

### C39 — Exactly eight supported material findings with retained conditions and uncertainty.

final.md:19-28,48 — **COUNT_SUPPORTED_SUPPORT_FAILS** (obligation assertion). Evidence: brief/final/index and independent provenance checks. Defects: D01, D02, D03.

There are exactly eight labeled findings; final is 1083 whitespace-separated words, within the soft ceiling. F3 and F7 have material source errors; some F6 conditions are implicit and F5/F8 uncertainty conflicts with the reconciliation guarantee.

### C40 — All six obligations fulfilled with one reconciled bounded recommendation and discriminating tests.

final.md:48 — **PARTIAL_SUBSTANTIVE_COVERAGE** (obligation assertion). Evidence: brief/final/index and independent provenance checks. Defects: D01, D02, D03, D04, D05.

All topics appear, but the retry bound, preservation/identity reconciliation, support for all eight findings and discriminating checks fail as detailed below. A full sync service is correctly avoided.

## Preserved uncertainties and options

- Server range/validator and upload support are unmeasured; Accept-Ranges advice alone is insufficient.
- Local content digest is useful, but server-issued strong revision ETags and version-bound resource IDs remain legitimate options.
- tus checksum, expiration and termination extensions need negotiation; SHA-256/final-object checksum support is not guaranteed.
- A genuinely preserved snapshot is distinct from an open descriptor lifetime or web snapshot-state metadata.
- Safe immutable A completion and safe A abandonment are both options; old completion must not change the current B binding.
- Private partial PUT needs an explicit contract; the HTTP resumable-upload draft remains work in progress with interop version 10.
- Windows/macOS and browser runtime behavior are unresolved.

## Proposed versus executed

The final accurately labels service/app checks as proposed. No target server or application check was executed by this reviewer. Candidate historical hash/quote/anchor operations and no-execution statements cannot be authenticated from a frozen report; their resulting source facts and hashes were independently checked. No unsupported allegation about candidate execution is made.

Reviewer executed local hashing/parsing/locators and eight bounded public primary GETs. No downloaded code/test execution, installers, accounts, purchases, global config, repository/canon/WorkNodes or third-party writes occurred.

## Timing and delivery

Actual T3 requestedAt: `2026-10-07T21:21:44.782Z`; startedAt: `2026-10-07T21:21:45.683Z`. First local verification: `2026-10-07T21:21:56.062914570+00:00`. The earlier explicit deadline `2026-10-07T21:41:15.177635+00:00` governs. This review finishes early, without budget reset. Actual operations and elapsed time are recorded in `timings.json`; unknown usage/cache/generated-token/billing values are null and native metadata is separate.

Delivery uses the normal T3 delegated-carrier final assistant result with artifact paths. No delegation, child tasks, own Goal or receipt engineering.

Final artifact integrity check: 2026-10-07T21:30:21.808778+00:00. Frozen final SHA-256 unchanged; all six axes, six obligations, eight sources, forty claim groups, twenty-two source-fact records and five defects cross-reference correctly.
