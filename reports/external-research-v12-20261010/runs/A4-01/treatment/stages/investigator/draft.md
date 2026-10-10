# Interrupted-upload archive accession: research proposal

**Status:** Investigator-stage proposal, not implementation. This draft reconciles the complete brief and exact released plan with the independent discovery in [discovery.md](discovery.md). The stable evidence index is [sources/index.md](sources/index.md), with full URLs, versions/commits, locators, access times, operations, governing conditions, and applicability in [source-map.json](source-map.json). The release helper ran once at 2026-10-10T04:13:50.289Z and recorded discovery SHA-256 42a82081247090e0679e0826c3d84a8f1d6a55a5314c6f8c07c35f6b7ecf5bc9 (11,323 bytes); released plan SHA-256 13c9e444018c0578380616e96b0a5df493431b8ba1148aec08fdb68c50b05c7f (5,986 bytes). Discovery was not changed after release.

## Recommendation

For the 20 MB–40 GB pilot, make browser-to-object-store multipart the preferred candidate only after the archive storage owner confirms the exact provider/version, supported API subset, CORS and signing requirements, multipart limits, checksum behavior, conditional writes, consistency, and cleanup/retention. Keep signing and accession state in the archive application. Persist a unique accession reservation, destination key, upload ID, expected length, checksum plan, and the application-owned completion manifest. On reconnect, reconcile server/provider state and resume; on abandonment, abort explicitly and use a configured lifecycle backstop.

Treat object completion as an intermediate state. Verify final object identity, length, checksum algorithm and scope using provider-supported evidence. Only after that verification should the application create the authoritative, idempotent receipt. The accession curator must define that exact evidence and state transition. A progress bar, successful part responses, HTTP status alone, or multipart ETag alone cannot issue a receipt.

Compare a second route: browser-to-archive resumable server intake using tus/tusd. It offers offset-based recovery and a centralized policy point, but transfers load to archive networking and adds temporary disk, capacity, consistency, expiry, and distributed-lock requirements. It still needs a proven object-store backend. Keep a curator-authorized CLI fallback available as an optional candidate for the largest files when provider compatibility, narrow authorization, checksums, operating support, and a tested procedure are confirmed. Do not make it mandatory or claim it works on this archive yet.

## Exact clause-by-clause disposition

### 1. Single request versus multipart limits — corrected

The released plan’s “5 GB limit on every upload route” is rejected. AWS documentation scopes 5 GB to a single PutObject request; its separate console workflow is documented at 160 GB. AWS multipart has a separate part-count/size model: quota documentation lists 10,000 parts, 5 MiB–5 GiB each, no minimum on the final part, and 48.8 TiB maximum, while the upload overview says 5 MB–50 TB (S01–S02). Those pages’ decimal/binary expressions are preserved as written. At 40 GiB, 5 MiB minimum parts imply roughly 8,192 parts, below AWS’s 10,000-part quota, but exact byte length and provider rules must drive sizing. No AWS number is an archive-service guarantee. R2 is only an illustration: its guide says 5 TiB while a separate limits page says 4.995 TiB; 40 GB is below both (S12–S13).

Checksum and completion claims also need operation and release scope. AWS multipart supports full-object CRC64NVME/CRC32/CRC32C in the documented flow, while SHA-256 is composite-only; multipart ETag is not whole-object MD5. If the algorithm is omitted at initiation, some completion checksum headers can be accepted without validation/storage (S05). AWS direct REST CompleteMultipartUpload can begin with HTTP 200 and later embed an Error; its SDK handles that response (S06). These behaviors must be tested on the chosen provider/client before relying on them.

### 2. Two realistic routes and an analogous resumable mechanism — expanded

**Route A: browser directly to object storage.** A browser client such as Uppy can request short-lived per-operation signatures from an archive endpoint and transfer parts directly. Its current docs describe a 100 MiB default multipart threshold, CORS requirements, and ETag exposure (S07). This is a library default, not a storage limit; docs are unversioned and show a CDN example pinned to v5.2.1, so pin and test the intended release. Browser file persistence is its own constraint: Uppy Golden Retriever documents a 10 MiB default IndexedDB file limit and warns that references for larger files are temporary and may not survive browser crash/restart; the user may have to reselect the source (S08). Do not present this as an S3 part limit.

**Route B: browser to archive resumable service, then object storage.** The tus 1.0 protocol resumes through HEAD-reported Upload-Offset and PATCH, with known Upload-Length for a selected file; checksum, expiration and termination are optional advertised extensions (S09). tusd v2.10.1’s S3 backend holds metadata, uses multipart, writes PATCH bodies to temporary disk, requires strong read-after-write consistency, and needs distributed locking for multiple instances (S10). The final object is not exposed until backend completion. These archive-server and backend requirements are operational costs and risks. The docs call out R2’s equal-size nonfinal parts and a 50 MiB optimal part-size recommendation; apply that only to the named backend/provider context.

**Analogous transfer mechanism:** tus offset-based resumability is the comparison point for recovery semantics. Its checksum extension checks a PATCH body/chunk, not a final whole-file digest by itself; the receipt still needs final-object verification. It is not a substitute for proving object-store operations or full-file integrity.

### 3. Interruption, abandoned parts, checksums, duplicates, and receipt — specified

For direct multipart, save upload ID, part plan and part metadata durably. AWS reusing a part number replaces that part; ListParts is paginated at 1,000 and is for state inspection, not the completion manifest. AWS does not expire incomplete uploads by default; parts remain billable until complete/abort. Configure explicit abort and lifecycle cleanup after the storage owner sets retention (S03–S04). R2’s seven-day automatic abort is provider-specific, not an archive default (S12).

Declare the checksum algorithm at initiation where required, preserve its scope, and verify the completed object with a provider-supported full-object check or independent digest. Do not treat ETag as the checksum. For a browser restart, check original source identity/length and reconcile current provider state; large-file browser recovery may require file reselection (S08).

Reserve a unique accession ID and destination key in application storage before issuing authorization. Make retry/replay idempotent. Use provider conditional final writes where supported as a second guard, but AWS conditions do not cover CreateMultipartUpload or UploadPart, and an in-progress MPU is not an existing object (S11). Duplicate or racing submissions should return the already verified receipt or a curator-reviewed conflict, not silently create two accepted accessions. This is a local design proposal, not a behavior guaranteed by S3-compatible APIs.

The receipt should record accession ID, provider and object/version identity, object key, size, checksum value plus algorithm/scope, verification result, and authoritative time. Issue it only after final object verification under the curator’s rule. A progress bar, part success, or “upload complete” client state is not acceptance.

### 4. Compatibility failure/fix history — bounded, versioned

The MinIO issue reports that with RELEASE.2024-09-13T20-26-02Z, a trailing SHA-256 checksum on AWS .NET SDK PutObject appeared in the immediate response but not later listing/get/attributes, while AWS S3 returned it. PR #20456 / commit f246ee7 merged a persistence fix on 2024-09-19. No containing release tag was identified (S17–S18). This is a reported single-PutObject/retrieval mismatch and a code-level fix, not evidence that an arbitrary MinIO package or the archive has the fix.

The released tusd v2.10.1 tag (commit 388a27c, 2026-09-16) includes PR #1385 fixing silent truncation of deferred-length uploads in its S3 store (S10, S19). This is the bounded released failure/fix chain; test the deployed tag and relevant mode. Neither example licenses a claim that “S3-compatible” guarantees identical operations.

### 5. Optional curator-authorized CLI fallback — retained, conditional

The released plan’s reminder that “supported” means authorized optional scope, not established technical capability, is accepted. Investigate AWS CLI v2 as one candidate only: docs describe 8 MB multipart threshold/chunk defaults and a 5 MB minimum upload part, checksum behavior, plus endpoint/profile options (S14–S16). These are CLI release/configuration statements and AWS-context behavior, not proof the archive endpoint implements the needed API. Version references differ across the current docs (v2.37.5–v2.37.10); the exact package must be pinned.

Recommendation: retain the fallback if the owner confirms compatibility and the curator authorizes a documented, supportable workflow using short-lived, least-privilege access, explicit checksum verification, safe retry, and the same receipt gate. If that evidence fails, document the specific incompatible operation and keep the path unenabled pending a better client/provider test; do not remove the allowed option merely because compatibility is unknown. No CLI was installed or used.

### 6. Owner decisions and unresolved cost — preserved

- **Storage owner:** identify product/provider and deployed version; confirm multipart/single operations, limits, checksum fields and retrieval, conditional writes, consistency, CORS, signing/auth pattern, lifecycle cleanup, and retention/abort policy.
- **Accession curator:** define authoritative receipt evidence and exact issuance point, plus duplicate/conflict handling and whether a stable object version ID is required.
- **Costs:** unresolved. Do not invent estimates. After provider and expected traffic are known, compare retained-part charges, browser/storage egress, relay bandwidth and temporary disk, operational/support burden, and any CLI support costs.

### 7. Negative constraints — retained

No real films, buckets, credentials, account access, purchases, installs, production access, or live writes were used. Do not assume every S3-compatible service has AWS limits or semantics. Do not mark a transfer accepted from progress alone. Any future staging test requires owner authorization and synthetic non-film files.

### 8. Proposal and validation record — complete, with checks separated

| Check | Status | Evidence/result |
|---|---|---|
| Public primary-documentation review | EXECUTED, read-only | AWS operations, multipart, checksum, completion, cleanup and conditional-write behavior; Uppy browser behavior; tus protocol/backend; R2 illustration; AWS CLI docs. See S01–S16. This is documentation review, not product validation. |
| Public release/issue/fix review | EXECUTED, read-only | MinIO issue and merged code fix, with release-tag uncertainty; tusd v2.10.1 release and deferred-length fix. See S17–S19. |
| Source-map integrity check | EXECUTED | source-map.json parsed with Python json.tool; discovery is 11,323 bytes and exceeds the 500-byte requirement. |
| Plan-release helper | EXECUTED once | Helper returned success, frozen discovery hash and revealed plan hash at 2026-10-10T04:13:50.289Z. |
| Provider/API compatibility test | NOT_RUN | Provider is unknown; requires storage-owner identification and authorized staging access. |
| Synthetic transfer/fault test | PROPOSED, NOT RUN | After provider confirmation, test synthetic 20 MB, multipart-boundary and 40 GB non-film files; interrupt/retry/reload; reconcile paginated parts; abort orphan; corrupt data; verify final checksum; and test races/duplicates and completion error parsing. |
| Browser, tusd, and CLI integration tests | PROPOSED, NOT RUN | Pin releases; test CORS/signing, browser reselect recovery, tusd temporary-disk/locking/expiry/backend consistency, and optional CLI endpoint/auth/checksum behavior on the confirmed provider. |
| End-to-end receipt acceptance | PROPOSED, NOT RUN | Confirm no receipt before final verification; verify exact receipt fields and idempotency after successful verification, duplicate retry, and conflicting accession. |

### Plan reconciliation summary

The plan’s tentative AWS and MinIO mentions are retained as research leads only; neither is selected. The “5 GB everywhere” assumption is corrected with operation-specific evidence. Browser and service limits are separated. Tus is added as the required analogous resumable mechanism; MinIO client/browser integrations are not asserted feasible. “Every request succeeded means complete,” “ETag equals checksum,” and delayed cleanup are rejected and replaced with a verified final-object gate, checksum scope, explicit abort, and owner-selected lifecycle policy. The optional CLI fallback, the named owner authorities, unresolved costs, and all negative constraints are preserved. Proposed tests remain proposals; no product validation is claimed.

## Native Goal record

Exactly one native Goal was created with the frozen objective, before substantive work:

- Objective: ER12 investigator stage, run A4-01-treatment: execute ER12_RUNTIME/runs/A4-01/treatment/stages/investigator/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.
- Direct native Goal fields observed while active: threadId 01a123f5-4da1-7a50-a31a-8245389e5430; status active; tokensUsed 311053; timeUsedSeconds 963; createdAt 1791604669; updatedAt 1791605633.
- Native Goal provenance not exposed: UNKNOWN. The createdAt/updatedAt values are recorded as returned; no timezone interpretation is inferred.
- Terminal state is intentionally not asserted here before required files are saved. The native completion result will be reported from its actual tool response.
