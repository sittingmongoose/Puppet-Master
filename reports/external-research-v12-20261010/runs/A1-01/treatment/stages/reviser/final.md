# Resumable upload for the media intake tool

Run: A1-01-treatment  
Fixture: ER12-A1-01-FRESH  
Status: final proposal and repairable implementation plan; no product implementation or transfer validation has been performed.

## Recommendation and boundary

Add a bounded transfer and local-recovery contract to the existing authenticated gateway. Expose the gateway to the fictional Rust client as the core of Tus 1.0.0. The gateway owns durable session state and the adapter for the unnamed S3-compatible store; it may implement Tus over multipart storage. This gives the client one contiguous, server-authoritative byte offset and keeps storage-specific signing, part tracking, checksums, completion, and cleanup out of the client.

This recommendation is conditional. Before enabling uploads, the gateway owner must establish that the existing gateway can persist session state and offsets through its own restart, bind each session to the same authenticated owner, and return idempotent terminal state. The storage owner must identify the exact provider, endpoint, API/library versions, encryption mode, and behavior needed for multipart completion, checksums, abort, and expiry. “S3-compatible” alone does not establish those behaviors.

If the gateway cannot provide durable Tus state, the alternative is gateway-brokered native multipart after exact-provider qualification. Do not move provider-specific upload credentials or unqualified S3 assumptions into the desktop client. Direct multipart was the released draft’s initial preference; it remains a decision for the gateway/storage owners, not a requirement to reject the HTTP protocol-service option.

Scope is transfer protocol and the client’s local recovery record. The existing UI, identity system, and storage service design remain outside scope. Keep the user-facing surface to progress, retry, and cancel. Use the host application’s existing credentials; do not add an authentication provider, store credentials, access production, upload real files, or invent throughput results.

## Minimal state sketch

Client: New → Hashing → Creating → Active(offset) → Reconciling → Active(offset) → Finalizing → CompleteVerified or CompleteUnverified  
Client pauses: NeedsSource, AuthPaused, RetryPaused, Expired, CancelPending  
Terminal cancel: CancelPending → Aborted, unless completion already won and reconciliation reports Complete

Gateway: Absent → Active(owner, target, length, digest, durable offset, expiry) → Finalizing → Complete(result)  
Gateway terminal alternatives: Aborted or Expired  
The gateway serializes completion and cancellation transitions and stores a durable result so the client can recover from a lost terminal response.

## U1 — upload identity, recovery record, interruptions, changed source

### Identity and local record

Before creating a remote session, the client computes a full-file SHA-256 and SHA-256 values over fixed 16 MiB source blocks. Generate one stable random transfer UUID; send it as the create idempotency key under the existing authenticated identity. The gateway binds that UUID to one authenticated owner, target reference, expected length, source digest, and opaque session. The gateway session ID is distinct from the transfer UUID, local path, filename, object key, and any provider upload ID. Retrying a create after an uncertain result with the same owner and UUID returns the same session.

Keep a versioned, user-private, atomically replaced and durably flushed local record containing: transfer UUID; non-secret gateway session ID; target reference; original path; OS file identity and modification time as hints; byte length; full SHA-256; fixed-block SHA-256 values; backend part size when the gateway uses multipart; cached last acknowledged offset; creation and expiry times; and client state. Filename, path, size, time, and file ID are hints, not content identity. Do not store host credentials, gateway tokens, presigned URLs, or other secrets. A Tus Location must still require the normal gateway authorization. If a deployment uses capability URLs, store only a non-secret session ID and have the authenticated host resolve a usable URL after authentication.

The private record location, permissions, atomic replacement and flush behavior must be implemented and checked for each supported desktop platform. Exact platform semantics are an owner/platform decision, not established by this proposal.

### Source checks and changed-file behavior

On restart, reopen the recorded source and compare its full current length and SHA-256 with the recorded values before resuming. Treat OS file identity, modification time, and path as hints that help find a candidate; do not rely on them for a match. Before sending a range, read the entire containing 16 MiB block, verify it against that block’s saved SHA-256, and send the requested range as a slice of that same verified buffer. This handles offsets that fall inside a block and avoids verifying one buffer but sending bytes from another read. Recheck the complete source before finalization. These extra local reads cost time and I/O on a 6 GiB file; that cost is an explicit design tradeoff for preventing silent source substitution.

If the source is missing or a full-file or block digest differs, stop sending and do not finalize. Offer to locate the matching original, or let the editor explicitly cancel the existing transfer and start a distinct transfer with a new UUID. Never overwrite the saved fingerprint with the newly selected file’s fingerprint during resume. A stale journal must never cause bytes from a changed source to be accepted as the original upload.

### Tus restart, request loss, and acknowledgement

For the recommended Tus flow, after process death, network loss, a lost PATCH response, or any uncertain PATCH outcome, issue authenticated HEAD and use the returned Upload-Offset; the cached local offset is only a hint. If a PATCH timed out after the gateway accepted it, HEAD identifies the accepted offset. If it did not advance, retry from that offset. On 409 Conflict, do not replay from a guessed point; HEAD and reconcile. Permit one active writer for a transfer. A gateway that cannot restore its durable offset and corresponding stored bytes after its own crash does not satisfy this contract.

For uncertain create, repeat with the same transfer UUID and same authenticated owner. For uncertain finalization, query gateway session status and return the recorded terminal result; do not blindly complete again or create a replacement. If host credentials expire, the host application owns refresh. Pause on 401/403, refresh through the host, and resume the same session only as the same authenticated owner. A changed account cannot take over. No credentials are written to the recovery record.

### Conditional native-multipart recovery

If gateway-brokered multipart is selected, use a different recovery set: provider upload ID, selected part size, and every completed part number with its returned ETag and checksum. Query and paginate ListParts after restart, but do not treat it as the completion manifest: AWS says ListParts is capped at 1,000 per response, omits parts whose requests are unfinished, and should not replace the client’s recorded part-number/ETag list. Reconcile all successful parts; never continue from the largest saved part number because successful parts can be noncontiguous. Reuse of an AWS part number overwrites that part.

**Uncertain in-flight part rule, amended after critique C2:** represent each backend operation as Pending, Succeeded, Failed, or Unknown and serialize attempts for one logical part number. An empty ListParts result is not proof an unknown request failed. Do not retry the same part number or finalize while the original request could still be in flight. First wait for a definitive operation result and reconcile the listed part and expected checksum. If the gateway cannot establish that the request settled, retire that multipart upload ID and create a new upload ID rather than racing a same-number retry; keep the old ID on a cleanup queue. Stop submitting work to a canceled or retired ID. For AWS, in-flight UploadPart calls can still succeed or fail after stopping an upload, so cleanup must revisit the old ID after tracked calls settle to release any remaining parts. The exact provider’s behavior and cleanup procedure must be qualified; this conservative retirement path is a design choice, not a universal storage guarantee.

For AWS S3, a candidate 16 MiB backend part size gives 384 parts at 6 GiB and a 4 MiB final part at 20 MiB. That fits the documented AWS 10,000-part, 5 MiB minimum for non-final parts, and 5 GiB maximum; it is not validation for the unknown vendor and not a measured optimum. Where AWS multipart checksums are used, part numbers must be consecutive starting at 1, even though general multipart part numbers need not be consecutive. [S2] [S3]

## U2 — mechanism comparison and choice

| Approach | Recovery and completion mechanism | Tradeoff for this one-transfer workflow |
|---|---|---|
| Resumable HTTP service, recommended as gateway-facing Tus | HEAD returns the current contiguous Upload-Offset; PATCH resumes at that offset; a mismatching offset gets 409 without mutation. | Simple client recovery state and a clear gateway-auth boundary. The gateway must durably keep session and offset state and hide storage details. Core Tus is sequential; parallel transfer needs the optional concatenation extension or another design. Creation, expiration, checksum, termination, and concatenation are optional advertised extensions, not automatic core guarantees. [S1] |
| Object-store native multipart | Initiate returns a provider upload ID; numbered parts can be independently retried and potentially uploaded in parallel; Complete assembles the ordered part list. | Supports part-level retries and parallelism, but requires provider-specific part sizing, upload ID and complete-part bookkeeping, ListParts pagination, checksums, ordered completion, abort and lifecycle cleanup. It is suitable behind the gateway if its exact adapter and scoped permissions are qualified. Do not assume direct client permissions solve compatibility or cleanup. [S2] [S3] [S4] |

The bounded workflow does not establish a need for parallelism, so use one Tus offset stream initially. The released user preference of at most three concurrent native multipart requests can remain an optional gateway setting after order/retry tests and controlled measurement. Do not enable or claim a performance benefit without that evidence. Tus concatenation is another optional capability only if the endpoint advertises it and later product decisions justify its complexity.

## U3 — completion and integrity

1. **Acknowledged chunk:** a successful Tus PATCH response and returned offset mean the server accepted and processed the bytes in that upload resource according to the protocol. The acknowledgement alone does not prove persistence across a gateway crash, a completed remote object, or a whole-file byte match. The gateway’s durable-offset/data behavior must be validated separately. A lost response leaves the result unknown until HEAD reconciliation. [S1]
2. **Remote object complete:** the gateway reports terminal success only after storage CompleteMultipartUpload or its equivalent succeeds and final target, object size, and session checks agree. It records an idempotent terminal result so a lost response can be recovered from session status. Under AWS S3, parts do not form an object until successful completion, and a multipart ETag is not necessarily an MD5 of the full object. Neither statement establishes identical behavior for another compatible service. [S2] [S4]
3. **Independently verified byte match:** compare the preflight local SHA-256 with a storage-validated SHA-256 of the exact completed byte sequence if the named provider provides that whole-object contract; otherwise read the completed object through an authorized gateway verification path and compute SHA-256. Do not call a composite checksum an ordinary whole-file SHA-256. If neither a matching strong full-object digest nor read-back is available, report “complete, integrity not independently verified.” A provider’s CRC checksum can be recorded as storage-checksum evidence, but it is not the proposed SHA-256 byte-match result.

**Checksum clarification, amended after critique C1:** the current AWS multipart overview lists CRC64NVME, CRC32, and CRC32C as full-object checksum types and SHA-256 among composite types. Therefore AWS multipart’s SHA-256 value cannot simply be presumed to equal the client’s SHA-256 of the concatenated file. AWS validates a supplied supported full-object checksum and stores it, but the selected algorithm and type must be explicit. AWS KMS multipart access requires KMS permissions, including decrypt and data-key permissions; checksum retrieval needs decrypt permission. For SSE-C, CompleteMultipartUpload must include the customer-provided encryption headers or AWS creates the object without returning a checksum. Verify the exact encryption headers and permission path against the selected provider. These are AWS-specific conditions. [S2]

Tus’s optional checksum extension checks a PATCH request body (at least SHA-1 is required when the extension is implemented); it does not itself verify the assembled full file. Require it only if advertised and if its algorithm/role fits the gateway contract. Never use ETag as the whole-file integrity promise. [S1] [S2]

## U4 — cancellation, expiry, cleanup, and retry ownership

Thirty days is a proposed absolute gateway-session lifetime, not a sourced default. Advertise the expiry in Upload-Expires at creation and each successful PATCH as required by the Tus expiration extension; the client uses it before resume. After expiry, have the gateway return 410 when it tracks expiry, release backend state, and retain local history. The client offers an explicit new transfer with a new UUID; no silent replacement. The product/storage owner chooses the final finite retention period and compatible cleanup policy. [S1]

| Action | Owner and rule |
|---|---|
| Local recovery, source match, prompt | Client owns private atomic journal updates, strong source hashing, resume prompt, and preserving state while paused. Changed bytes cannot enter an existing transfer. |
| Credentials and refresh | Host application owns credential storage/refresh. Client pauses on authorization failure and reuses the session only under the same identity after reconciliation. |
| Gateway HTTP retry | Client owns a proposed maximum of five attempts with capped exponential backoff and jitter. After the cap it preserves the record and pauses. Uncertain create repeats the same idempotency key; uncertain PATCH uses HEAD; uncertain completion or cancel queries status before replay or claim. This retry count is an original choice, not a sourced setting. |
| Storage retries and reconciliation | Gateway owns provider retry policy, operation status, and idempotency. For multipart it records each part attempt, prevents same-number overlap, reconciles known results, and blocks completion while any part is Pending or Unknown. The storage provider owns its own durability, not the client’s journal. |
| Expiry | Gateway owns absolute expiry and advertises Upload-Expires. Proposal: 30 days. Return 410 for a known expired session, release backend work, and preserve client history. A later transfer has a new UUID. |
| Cancel | Client records CancelPending and stops new sends before requesting authenticated Tus termination. Gateway serializes cancel against completion, drains tracked work, aborts backend parts, records the terminal result, and reconciles a lost response. If completion committed first, report Complete and its verification status; if abort won, report Aborted; if uncertain, query before claiming either. A cancel action cannot undo a committed object. |
| Orphans | Gateway expiry sweeper is the first cleanup owner. Provider lifecycle cleanup is a second safety net after exact-provider semantics are confirmed; configure its retention beyond the gateway’s maximum session life. AWS charges for unfinished parts until complete/abort and documents that an in-flight part can still complete or fail after stop; wait for tracked requests and revisit cleanup as described above. [S2] [S4] |

The Tus endpoint must be feature-probed with OPTIONS. Require core Tus plus the creation, expiration, and termination extensions needed by this contract; require checksum only if the chosen checksum behavior needs the per-request extension. If a required behavior is absent, do not silently fall back to an unqualified mode. Tus URLs and extension support do not establish authorization, durable gateway state, or provider behavior. [S1]

## U5 — implementation/release detail and compatibility boundary

AWS SDK for Rust S3 client v1.69.0, announced by its maintainers on 2025-01-16, enabled an additional checksum by default for Put calls and response validation for Get calls. The maintainers caution that third-party services may not yet handle newly enabled defaults. This supports pinning/configuring the gateway adapter and qualifying its exact endpoint and checksum behavior before release. It does not justify disabling integrity checks without an equivalent verified contract. This history applies only if the gateway or another Rust component actually uses that AWS SDK; the fictional gateway and provider are unknown. [S5]

The separate tusd issue #1315, opened 2025-09-03, reports InvalidPartOrder during completion on a larger AWS S3 upload while using the mutable image tag tusproject/tusd:latest. The issue was open when inspected; exact version and root cause are unknown. Treat it only as a bounded reason to include ordered-completion regression coverage, not evidence of a general tusd, AWS, or compatible-vendor defect. [S6]

The gateway compatibility gate records the exact provider, endpoint, API/model version, storage library and pin, signing mode, encryption configuration, maximum object and part sizes, numbering/order rules, supported whole-object and composite checksum types, checksum retrieval permissions, complete/abort behavior, in-flight-call behavior, lifecycle cleanup, and how results are surfaced to the client. AWS limits, checksums, ETags, encryption rules, and lifecycle behavior apply only to AWS unless the exact service proves otherwise.

## U6 — evidence, design choices, owner decisions, and criticism dispositions

### Evidence-supported behavior

- Tus core HEAD/PATCH offset rules, 409 on offset mismatch without mutation, PATCH acknowledgement, optional extension discovery, expiry response, per-PATCH checksum, DELETE termination, and optional concatenation come from the protocol. See [S1].
- AWS multipart uses upload IDs and part numbers; same-number uploads replace prior parts; completion needs part numbers and ETags; ETag is not necessarily the full object’s MD5; ListParts is paginated and omits unfinished requests; checksum type and encryption conditions apply; AWS limits and cleanup behavior are summarized only for AWS. See [S2], [S3], and [S4].
- The AWS SDK for Rust v1.69.0 default integrity change and its third-party compatibility caveat are maintainer-reported. See [S5].
- tusd issue #1315 is one unresolved report with a mutable version tag and no established root cause. See [S6].

### Original design choices, not sourced defaults or measurements

- Recommend gateway-facing Tus; use a stable client transfer UUID; persist server state; one sequential Tus writer; use full SHA-256 and 16 MiB block hashes; rehash source before resume and finalization; treat a 16 MiB backend part as a candidate; allow a proposed five-attempt bounded retry; propose 30-day absolute retention; show complete-but-unverified if no whole-object byte check is available.
- For a native multipart operation whose state cannot be established, conservatively retire that upload ID and start a fresh one rather than retrying the same part number while the old call may still be in flight. This favors safety over bandwidth and requires a provider-specific cleanup implementation.
- Require a common strong full-object digest or authorized read-back SHA-256 for the CompleteVerified label. A storage CRC can be recorded separately without relabeling it as a SHA-256 byte match.
- Keep concurrency out of the initial Tus client; revisit up to three native part requests only after qualification and measured need.

### Explicit criticism disposition

| Criticism | Disposition | Evidence and resulting change |
|---|---|---|
| C1: The draft did not state which checksum algorithms and encryption permissions can actually support a verified byte match. | **Accept and amend.** The critic’s finding is material. I independently reopened the AWS multipart overview and its checksum table, KMS/SSE-C permission notes, and surrounding completion/checksum sections. AWS lists CRC64NVME, CRC32, and CRC32C as full-object types but SHA-256 as composite; it also states KMS/decrypt and SSE-C header conditions. The final contract defines the compared digest and refuses to equate a composite or CRC value with local whole-file SHA-256. Verify the named provider’s own exact semantics. |
| C2: An uncertain native multipart part request may still be in flight even when ListParts omits it, so a blind same-number retry can race and overwrite. | **Accept and amend.** The critic’s finding is material. I independently reopened AWS multipart and abort guidance. AWS says ListParts omits unfinished calls; same-number upload overwrites the prior part; a request in flight may succeed or fail after stop. The fallback now records operation states, blocks retry/completion while Unknown, waits for a result or retires the upload ID, and queues cleanup after the call settles. Do not interpret an absent listing as proof of failure. Confirm equivalent provider behavior. |
| Other criticism or a need to reverse the Tus recommendation. | **Reject as unsupported.** The critique identifies C1 and C2 as its material findings and reports no other material issue. Its agreement does not prove Tus is suitable: the final recommendation remains conditional on gateway persistence, auth, extensions, storage qualification, and owner decisions. |

### Disposition of the released user plan

- **Initial direct-multipart preference and concern about a second durable service:** preserve as an owner architecture question. Recommend Tus through the existing gateway because a durable offset fits this serial workflow and the storage vendor is unknown. If that gateway cannot own durable sessions, retain gateway-brokered native MPU only after exact provider qualification.
- **Transfer identity:** retain and make precise. Client UUID/idempotency key, gateway session ID, and provider upload ID are separate. Retry uncertain creation with the same key under the same owner.
- **16 MiB pieces and at most three concurrent requests:** retain 16 MiB as a candidate backend part/block size because the AWS arithmetic fits; do not call it optimal or vendor-compatible until tested. Do not parallelize the initial Tus offset stream. Retain up to three concurrent native parts as an optional later setting after provider tests and measurement.
- **Filename, size, modification time, and piece numbers in a JSON record:** retain path, OS identity, and time only as hints; add full and per-block SHA-256, target, session, expiry, state, and offset cache; keep the record private and atomic. No credentials or presigned capabilities.
- **Resume from largest saved piece number:** reject. Tus resumes from HEAD’s authoritative offset. Multipart fallback reconciles all parts and recorded ETags/checksums; a largest-part high-water mark does not describe noncontiguous successes or a pending call.
- **Call completion and mark done:** correct to separate acknowledged chunk, completed remote object, and verified byte match; save durable gateway completion status and recover it after lost replies.
- **ETag as integrity check:** reject as a general whole-file digest. Use a defined full-object digest or read-back hash; distinguish checksum evidence from verified byte match.
- **Lost response, retry, token expiry, cancellation and remote temporary-data removal:** add idempotent create/terminal status, HEAD/ListParts reconciliation, host-owned credential refresh, bounded client retries, gateway-owned provider retries, cancel/completion serialization, in-flight drain/reconciliation, expiry sweeper, and provider lifecycle cleanup. Completion that already committed cannot be reported as canceled.
- **Changed source and no local credentials:** retain and strengthen. A digest mismatch blocks resume; locate original or explicitly cancel and start a distinct transfer. Never store credentials.
- **Proposed fake-transport, changed-file, late-result, and cancel-race tests:** retain as proposals below. A fake test does not prove vendor compatibility, true full-object checksum semantics, or performance.
- **Small UI scope:** retain progress, retry, cancel only; no full uploader app.

### Open owner decisions and uncertainty

1. Can the existing authenticated gateway persist Tus sessions and byte offsets across its own restart, bind them to the same user, provide idempotent create and terminal status, and expose the required extensions?
2. What are the exact storage vendor, endpoint, API version, signing mode, part limits, order/checksum semantics, encryption permissions, abort/in-flight behavior, and lifecycle cleanup rules?
3. Is a matching whole-object SHA-256 available from the provider, or is authorized object read-back affordable and required? If not, the result must remain complete but not independently byte-verified.
4. What finite expiry and cleanup windows will the product/storage owner choose? Is thirty days acceptable?
5. What token-refresh and account-change behavior does the host application support?
6. Which desktop platforms are supported and how will the local recovery record be private, atomic, and durable on each?
7. Is multipart parallelism worth adding after measurement? There is no throughput evidence.

No unresolved point is converted into an established default. The exact gateway, storage provider, host credential contract, local platform behavior, and implementation versions remain unknown.

## Proposed validation matrix — not executed

| Proposed check | Expected observable invariant | Later integration evidence required |
|---|---|---|
| Tus OPTIONS/create, lost create response, HEAD/PATCH, stale 409, lost PATCH response, gateway process restart, expiry and DELETE | Required extensions are advertised; same key/owner recovers one session; HEAD controls continuation; a stale offset changes nothing; restored offset and bytes survive gateway restart; expired/canceled state has an explicit result. | Exact gateway build, durable store and auth binding; test actual crash/restart, extension support, idempotency and expiry behavior. |
| Replace, truncate, same-size edit, remove source, mutate between check and send | No mismatching source resumes or finalizes; the existing transfer retains its fingerprint; explicitly starting again creates a distinct UUID. | Atomic private record and file semantics on each supported OS; verify byte-mutation races without production data. |
| Native multipart with noncontiguous results, paginated ListParts, unknown/late same-number request, checksum-enabled part ordering, lost completion response | No retry or completion occurs while a part state is Unknown; absence from ListParts is not treated as failure; only resolved parts appear in the ordered completion manifest; uncertain transfer retires the old upload ID when needed. | Exact provider behavior for listing, same-number replacement, request settling, abort races, checksums and repeated cleanup; test ordered completion and durable terminal status. |
| 20 MiB and 6 GiB boundary sizes; 16 MiB candidate parts; full-object checksum and encryption modes | Correct byte count and part limits; completion does not claim SHA-256 match from a composite/CRC value; mismatch fails or read-back detects it; unavailable verification reports unverified. | Named provider/version, signing, encryption headers and permissions, checksum type and retrieval; no assertion from AWS documentation alone. |
| Race cancel, expiry, in-flight part, and completion | One terminal state is recorded and reported after reconciliation; committed object is not reported canceled; unfinished parts eventually reach cleanup. | Exact gateway/provider race behavior, lifecycle retention, cleanup timing and repeated abort handling. |
| Expire/refresh credentials and attempt a different account | Host refresh resumes the same session for the same identity; another identity cannot take over; no credential is present in the local record. | Actual host refresh and gateway authorization contract. |
| Optional concurrency measurement | Compare sequential transfer with at most three native parts under controlled conditions before adopting any concurrency setting. | Reproducible measurements on a named provider/network; no expected throughput gain is assumed. |

## Validation actually executed

This reviser directly inspected the six primary source pages linked in [sources/index.md], then reopened the AWS multipart and abort sections surrounding C1 and C2. No implementation, downloaded code, fake transport, transfer test, provider conformance check, checksum comparison, production access, real upload, or throughput measurement was performed.

The predecessor records say the investigator ran the one-time plan reveal helper after saving discovery and recorded a matching discovery digest/size; the critic reports independently recomputing that artifact identity. Those are plan/artifact checks, not upload validation. This reviser did not rerun the helper or recompute that digest. No unrun validation is presented as passing.
