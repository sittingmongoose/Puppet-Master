# Resumable upload for the media intake tool

## Recommendation and scope
Add a bounded transfer/recovery contract to the existing authenticated gateway and expose it to the Rust client as Tus 1.0.0. The gateway owns durable session state and a vendor-specific object-store adapter; it may use S3 multipart internally. This keeps the desktop client independent of the unnamed S3-compatible service and gives resume one authoritative byte offset. It does require the existing gateway to provide durable session state or an equivalent backing store. If it cannot, the conditional fallback is gateway-brokered native multipart with a tested exact-vendor adapter—not an unqualified direct S3 client.

This proposal changes only transfer protocol and the client recovery record. It does not add a new identity provider or design the rest of the intake UI. The fictional client uses the host’s existing credentials. No production access, implementation, upload, or validation was performed for this report.

## Minimal state sketch

```text
Client:  New -> Creating -> Active(offset) -> Reconciling -> Active
                              |                    |
                              v                    v
                       Finalizing -> CompleteVerified
                                  -> CompleteUnverified (if no remote byte check)
                       CancelPending -> Aborted
                       NeedsSource / AuthPaused / Expired / RetryPaused

Gateway: Absent -> Active(durable offset, owner, target, length, digest, expiry)
                 -> Finalizing -> Complete(digest result)
                 -> Aborted | Expired
```

The gateway binds one authenticated owner, a stable transfer UUID, a target reference, expected length and source SHA-256 to one opaque session. The client’s transfer UUID is the retry/idempotency key; the gateway session identifier is different from the local path, filename, and eventual object key. Repeating create with the same authenticated owner and transfer UUID returns the same session. A Tus `Location` must require normal gateway authorization; it cannot itself be a bearer credential. If the implementation instead issues a capability URL, the recovery record stores only a non-secret session ID and the host resolves the URL after authentication.

### Recovery record and source identity (U1)
Store a versioned, user-private local record with: transfer UUID; non-secret gateway session ID; target reference; original path; OS file identity and modification time as hints; byte length; full SHA-256; fixed-block SHA-256 values for 16 MiB source ranges; chosen backend part size; last acknowledged offset as a cache; creation/expiry times; and client state. Use atomic write/flush/replace. Do not store gateway tokens, host credentials, presigned URLs, or other secrets. A path/name, size, timestamp, inode/file ID, or ETag alone is not file identity.

Before first session creation, hash the source and its 16 MiB blocks. Before a restart resumes, hash the full current source and compare it with the saved digest. Before a send, load the containing full 16 MiB source block, hash that entire buffer, compare with its saved digest, and send the requested range as a slice from that same verified buffer. This also handles a server offset that falls inside a block after a partial write. Recheck the full file before the final PATCH/finalization. This costs extra local reads, especially on a 6 GiB file, but prevents metadata-only matching from silently accepting a changed file. If the source is missing or any digest differs, stop transfer and do not complete: offer to locate the matching original or let the editor explicitly cancel and start a distinct transfer. Never replace the saved fingerprint with the newly selected file’s fingerprint during resume.

For Tus, on every restart, lost response, or uncertain patch result, issue authenticated `HEAD` and use the returned `Upload-Offset`, never the cached offset, to seek the next source range. If a request timed out after the gateway accepted it, `HEAD` reveals the accepted range; if the offset did not advance, retry that range. On `409 Conflict`, do not resend from a guessed point; `HEAD` and reconcile. The Tus core uses the server’s current offset for resumption (S1). Require one active writer per transfer. If the gateway cannot give a durable offset after its own crash, it does not meet this contract.

A native-multipart fallback needs a different recovery field set: provider upload ID, selected part size, and each completed part number with returned ETag and checksum. After restart, query `ListParts` (including pagination where needed) and reconcile every part; never continue from the largest locally saved part number, since successes can be noncontiguous. Reupload a missing/uncertain part only after the storage state is known. Submit the complete part list in ascending order. For AWS S3, 16 MiB yields 384 parts at 6 GiB and a 4 MiB final part at 20 MiB; both fit its documented 10,000-part / 5 MiB minimum for non-final parts rule. This is a candidate setting, not evidence that another service accepts it (S2, S3).

## Alternatives and compatibility boundary (U2, U5)

| Approach | Recovery mechanism | Main tradeoff for this workflow |
|---|---|---|
| Resumable HTTP service (recommended: Tus core) | The client asks `HEAD` for one authoritative contiguous offset and continues with `PATCH`. Stale offsets are rejected with 409 without mutation. | Simpler client record and gateway-auth boundary; storage implementation is hidden. Gateway must durably track sessions/offsets. The core is sequential; parallelism requires an optional extension or extra design. Creation, expiry, checksum, and termination are optional advertised extensions, not automatic guarantees (S1). |
| Object-store native multipart | Initiate returns an upload ID; independent numbered parts can be retried and parallelized; complete assembles them. | Good fit for large data and independent retries, but recovery and finalization need upload ID, full successful-part list, ETags/checksums, ordered complete, explicit abort, provider-specific size/checksum/signing behavior. It can reduce gateway data forwarding only if the existing gateway safely brokers scoped operations. |

The gateway must be the compatibility boundary: identify the exact provider, endpoint, storage API/model version, signing mode, minimum/maximum part size, numbering/order rules, checksum types (especially full-object vs composite), complete/abort behavior, and cleanup facility; pin the server/client storage library and configure it intentionally; test these behaviors against that service version before enabling uploads. “S3-compatible” is not a sufficient compatibility claim. Keep the desktop client on the gateway contract. AWS’s S3 limits, checksum results, lifecycle behavior, and ETags cannot be generalized to the unspecified vendor.

A relevant Rust implementation-history detail is the AWS SDK for Rust S3 client v1.69.0 change announced 2025-01-16: it enabled default checksums on Put calls and Get validation; AWS maintainers warned third-party service implementations may lag these defaults (S5). If a Rust component uses that SDK against this storage, pin and qualify the exact endpoint/checksum configuration instead of weakening integrity silently. The fictional gateway’s implementation and the target vendor are not known, so applicability is conditional. A separate tusd issue opened 2025-09-03 reports an `InvalidPartOrder` at completion for a larger AWS S3 upload with a mutable `latest` image tag; it remains open in the page inspected and its exact version/root cause are unknown (S6). Treat this as motivation for ordered-completion regression coverage, not as proof of a general S3/tusd defect.

## Completion and integrity contract (U3)

1. **Acknowledged chunk:** a successful Tus `PATCH` response and returned offset mean the service processed/stored the acknowledged bytes according to the advertised protocol. A lost response leaves the result unknown until `HEAD`. This is not proof that a completed object exists or that its bytes match the chosen file.
2. **Remote object complete:** the gateway reports terminal success only after its storage `CompleteMultipartUpload` (or equivalent) succeeds and its final session record/object size/target checks agree. It records a durable idempotent terminal result so retrying a lost completion response cannot create a second transfer. For AWS S3, incomplete multipart parts do not become an object until completion, and the completed ETag is not necessarily a full-file MD5 (S2, S4).
3. **Independently verified byte match:** compare the preflight local SHA-256 with a storage-validated full-object SHA-256 if the exact provider supports that contract; otherwise read the completed object back through a gateway verification path and hash it. AWS S3 can validate a supplied full-object checksum and reject mismatch, but that behavior is AWS-specific (S2). If neither backend check nor read-back is available, report `complete, integrity not independently verified`; do not label it verified. Tus’s optional checksum extension validates an individual PATCH body and does not by itself verify the assembled whole file (S1).

Never use an ETag as the full-file integrity promise. Multipart ETags can be composite/opaque, and an S3-compatible provider may differ further. Per-part ETags/checksums are transport recovery values; the full-file SHA-256 is the source identity and byte-match value.

## Ownership, expiry, retry, and cancel (U4)

| Action | Owner and rule |
|---|---|
| Local recovery and changed-source decision | Client owns atomic record updates, source hashing, resume prompting, and preserving the record while paused. It never adopts different bytes into an existing transfer. |
| Host credential refresh | Host application owns credentials and token refresh. On 401/403 the client pauses, asks the host for fresh credentials, and resumes the same session only under the same authenticated identity after `HEAD`. A changed account cannot take over the session. No credentials are written locally. |
| Network retry | Client owns bounded retries for gateway HTTP requests (proposed: at most five attempts with capped exponential backoff and jitter). After the cap it preserves the record and pauses. For uncertain PATCH, it queries `HEAD`; for uncertain create it repeats the same idempotency key; it never retries completion or creates a replacement blindly. |
| Storage operation retry/reconciliation | Gateway owns backend retry policy and idempotency. After uncertain part/complete results it queries provider/session state (`ListParts`, object/session status) before replay; it persists final outcome. The storage service owns its own durability, not the client’s journal. |
| Expiry | Proposal: gateway sets a 30-day absolute session lifetime at creation, returns `Upload-Expires` initially and on each successful PATCH, and returns `410 Gone` after expiry. The client retains history but cannot resume that session; it offers an explicit new transfer, with a new transfer UUID. Thirty days is an original policy choice, not a sourced default; the product/storage owner must approve or select another finite retention. |
| Cancel and orphan cleanup | Client records `CancelPending`, stops new sends, then asks the gateway to terminate the Tus resource. Gateway authorizes and idempotently aborts backend multipart, drains/reconciles in-flight operations, retries abort if a part finishes late, and records `Aborted`. A lost cancel response is reconciled by session status. A gateway sweeper retries expiry/abort; configure backend lifecycle cleanup as a later safety net only after confirming exact-provider semantics and set its age beyond the gateway’s maximum session life. AWS charges for incomplete parts until complete/abort, recommends lifecycle cleanup, and notes in-flight parts may finish around abort (S2, S4). |
| Completion/cancel race | Gateway serializes the terminal state transition. If completion already committed, report completion and its integrity result; if abort won, report aborted; if the outcome is unknown, reconcile before either claim. A cancel click cannot undo a committed object. |

Tus creation, expiration, checksum, and termination are extensions. The client first probes `OPTIONS`; require creation, expiration, and termination support and the gateway’s whole-object digest contract. If the deployed endpoint lacks required behavior, do not silently fall back to an untested mode (S1).

## Per-clause disposition

| Clause | Disposition in this proposal |
|---|---|
| **U1 — identity, recovery record, interruptions, changed source** | Stable client transfer UUID plus authenticated gateway session ID; versioned local record with strong hashes; gateway offset wins; lost/process/network cases reconcile with `HEAD`; source mismatch blocks resume and requires locating the original or explicit new transfer. |
| **U2 — compare at least two approaches** | Compares Tus HTTP and native multipart by recovery/commit mechanism. Recommends Tus at gateway because this transfer needs simple serial resume and the vendor is unknown; retains native multipart behind the gateway or as a conditional fallback. |
| **U3 — completion/integrity meanings** | Separates PATCH acknowledgment, committed object, and independently checked full-file byte match. Rejects ETag-as-file-MD5. Allows explicit complete-but-unverified only when the endpoint cannot provide full verification. |
| **U4 — cancel, expiry, orphan cleanup, retry ownership** | Assigns client, host, gateway, and storage/lifecycle actions in the table; proposes a finite 30-day session lifetime and authenticated idempotent termination; unknown outcomes are reconciled before replay. |
| **U5 — implementation/release history** | Uses AWS Rust SDK S3 v1.69.0 / 2025-01-16 checksum-default change and the unresolved tusd report to justify a pinned gateway adapter and exact-endpoint test boundary. Applicability remains conditional because gateway SDK, provider, and versions are unknown. |
| **U6 — evidence, choices, questions, validation** | Labels evidence separately from original policy choices and unknowns; test matrix below distinguishes proposals from checks actually executed. |

## Disposition of the released user draft

| Released draft item | Correction, retained preference, or owner decision |
|---|---|
| Initial lean toward direct native multipart; Tus is the alternative | Resolved conditionally in favor of Tus at the existing gateway. The alternative is still evaluated; if the gateway cannot supply durable state, choose gateway-brokered MPU only after exact-vendor qualification. Whether the existing gateway can be extended is an owner/architecture decision. |
| Ask gateway for transfer identity | Retain and make explicit: a stable UUID/idempotency key identifies the client attempt; gateway session ID and storage upload ID are separate. Reuse the same key after an uncertain create. |
| Split into 16 MiB pieces | Retain as a candidate backend part size. AWS limits show it fits the requested size range; exact compatible-service constraints remain unknown. It is not a measured optimum. |
| Up to three concurrent requests | Do not enable in the initial Tus client: one offset stream is the simple recovery contract. Native MPU permits part concurrency; three may remain a gateway/provider-configured limit after tests. No throughput evidence supports a claimed gain. |
| Save filename, size, mtime, piece numbers | Correct: filename/size/time/file ID are hints, not identity; add full SHA-256 and fixed-block digests, target, session, expiry, state, offset cache; protect file with atomic local writes; no secrets. |
| Resume from largest saved piece number | Reject. Tus resumes from authenticated `HEAD` offset. MPU fallback reconciles the complete noncontiguous set with `ListParts` and saves each part’s returned ETag/checksum; “largest part” is not sufficient. |
| Call completion and mark done | Correct: gateway persists a finalizing/complete result and the client queries that state after a lost response. “Done” (object committed) is separate from “byte-verified.” |
| ETag as integrity check | Reject. ETag is not a universal whole-object MD5; use full SHA-256 validation or read-back/hash, and expose unverified status if unavailable. |
| Lost response not addressed | Add idempotent creation, HEAD/ListParts/status reconciliation, gateway-side idempotent complete/abort, and bounded retries. |
| Progress, retry, cancel UI | Retain this small UI scope only; make progress offset authoritative, retry pause/resume visible, and cancel outcome explicit. No full uploader app is proposed. |
| Cancellation removes remote temporary data | Define client intent and gateway owner; drain/reconcile in-flight operations, abort backend, retry and sweep; expiry/lifecycle is the orphan backstop. A race that already committed cannot be described as cancelled. |
| Gateway token expiry undecided | Preserve token ownership in host; refresh without creating a new transfer; query the same session under the same identity. On failure/account change, pause without writing credentials. |
| Changed-source safeguard and no stored credentials | Retain and strengthen with content hashes; any change blocks resume, with explicit recovery choices. Never persist authentication or presigned credentials. |
| Proposed fake transport/file/late-result/cancel-race tests | Retain below as proposed invariants. Passing a fake test would not establish provider conformance, real checksum semantics, or throughput. |

## Classification of user draft points

- **Already covered and retained:** a gateway-issued transfer identity, a small progress/retry/cancel surface, no locally stored credentials, protection against stale-source replacement, and 16 MiB as the requested initial sizing preference. The size preference remains subject to provider verification.
- **Corrected or rejected:** local filename/size/mtime and a largest-part high-water mark are insufficient recovery state; ETag is not a whole-file MD5; direct client-to-storage permission is not itself proof of endpoint compatibility; and a timeout does not prove an operation failed. Reconcile with server state and full content hashes.
- **Optional improvements after a first bounded implementation:** up to three concurrent native multipart parts at the gateway (only if the exact service passes order/retry tests and measurement justifies it); Tus per-PATCH checksums if the endpoint advertises the needed algorithm; and tuning part/retry sizes from controlled measurements. None is required for the initial sequential Tus client, and none has measured results here.
- **Owner decisions:** whether the existing gateway can hold durable sessions; exact vendor/version/endpoint; provider part/checksum/abort and lifecycle behavior; verification method/cost; final retention period; host refresh contract; supported platform state path; and whether later parallelism is worth adding.
- **Uncertain:** the gateway implementation and provider are fictional/unspecified; the SDK behavior applies only if that SDK is used; the tusd issue’s exact version and root cause are unresolved; and no current performance or integration behavior is established.

## Evidence, choices, and open owner decisions (U6)

**Evidence-supported:** Tus offset/409 and optional extension rules (S1); AWS multipart part bookkeeping, completion and ETag/full-checksum behavior (S2); AWS multipart size/part-count boundaries (S3); AWS incomplete-upload charges/cleanup (S4); the specific dated SDK default change (S5); one unresolved tusd completion report with an unspecified mutable version (S6). Those sources do not establish any behavior for the fictional gateway or unnamed compatible service.

**Original design choices in this proposal:** gateway-facing Tus; stable transfer UUID idempotency; 16 MiB backend block candidate; one sequential Tus writer; full source SHA-256 plus per-block digests; rehash before resume/finalization; proposed five-attempt bounded retry; proposed 30-day absolute session lifetime; explicit new-session consent after expiry; full-object verification or visible unverified status. These are recommendations to review, not sourced defaults or measurements.

**Owner decisions still needed:** whether the existing gateway can own durable Tus sessions; target provider, endpoint, signing mode and exact compatibility version; exact backend part-size and checksum capabilities; whether full-object checksum validation or read-back is required/affordable; retention period and lifecycle/sweeper policy; host token-refresh contract; supported local state path/permissions on each desktop platform; whether to add any parallelism after measurement. No row is presented as settled evidence.

## Validation matrix (proposed, not executed)

| Proposed check | Expected observable invariant | Later integration evidence still required |
|---|---|---|
| Fake transport loses a request before acceptance and loses the response after acceptance; restart and resume | `HEAD` determines the next offset; bytes are neither silently skipped nor replayed into the wrong range; an uncertain create returns the same session for the same transfer UUID. | Verify the exact gateway’s durable offset, auth binding and idempotency across its own process restart. |
| Replace, truncate, edit same-size file, or remove it after journaling; mutate between source check and send | No mismatch resumes or finalizes; the existing transfer remains recoverable only with matching original bytes; changed bytes require explicit distinct transfer. | Exercise local file ID, read, atomic-write and permissions behavior on supported operating systems; confirm gateway refuses digest mismatch. |
| Return noncontiguous/late part results and a lost multipart completion result in a fake backend | MPU fallback consults the full part list/status, orders parts for completion, and never marks complete from a local high-water mark. | Against the named provider, test real ListParts pagination, order, retries, completion idempotency and resulting object visibility. |
| Race cancel, in-flight part, expiry, and completion | Exactly one terminal session outcome is reported after reconciliation; abort/expiry eventually releases unfinished storage; a committed object is reported as complete, not falsely cancelled. | Verify provider abort races, lifecycle/sweeper timing, expiry status, and complete-vs-abort behavior. |
| Expire gateway token during transfer, refresh token, and attempt a different account | Same owner resumes same session after host refresh; a different account cannot resume; no credential is in local record. | Verify actual gateway auth and host refresh semantics, including expired and revoked credentials. |
| Exercise 20 MiB and 6 GiB boundaries, per-part/full-object checksums, and unavailable checksum mode in a safe staging environment | Correct byte count; final object does not appear before completion; matching hash is labeled verified; unsupported verification is explicitly unverified; mismatches fail. | Run against the exact vendor/version and gateway/library pin; establish part-size, signing, checksum type, ETag, abort and cleanup behavior. No real/production uploads were run here. |

**Checks actually executed:** no transfer-behavior test ran. The prescribed one-time plan reveal helper succeeded after discovery was saved; its reported discovery SHA-256/byte count match the saved discovery. The source-map and freeze JSON files parsed successfully. No code, fake transport, provider, checksum, or upload test ran. There are no throughput results or passing-test claims.
