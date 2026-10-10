# Final recommendation and repairable transfer plan

Fixture ER12-A1-01-FRESH · run A1-01-control · stage reviser. This is a complete proposal for the finalized brief and released plan; see [source-map.json](source-map.json) and [sources/index.md](sources/index.md).

## Recommendation and boundary

Use a gateway-owned, provider-qualified native multipart session as the first candidate. The existing authenticated gateway journals one session, allocates a unique object key, retains the provider upload ID, authorizes bounded parts, reconciles remote state, completes/aborts, and owns expiry and orphan cleanup. The desktop client keeps a local recovery record. Direct client-to-store writes are allowed only when the exact endpoint profile proves grants can be scoped, fenced, drained, and reconciled; otherwise proxy part bodies through the gateway or keep that provider disabled.

Keep a gateway-backed tus 1.0.0 service viable if it can durably couple accepted bytes and offsets and bridge/stage data to object storage at acceptable cost. Do not implement both transports first. If neither is qualified, defer uploads for that provider. “S3-compatible” alone is not qualification.

Carry the released plan’s 16 MiB part size as an initial application-level candidate, not a measured optimum, wire-size limit, or demonstrated fix. On Amazon S3, 20 MiB is 16 MiB plus a 4 MiB final part; 6 GiB is 384 parts, within the documented 10,000. This is AWS-only arithmetic. Multipart part size and SDK aws-chunked streaming-frame size/HTTP encoding are separate. Capture both with the pinned Rust SDK and exact HTTPS endpoint. Start serially; retain three concurrent requests only as a ceiling after recovery and cleanup races pass. No throughput result is claimed.

Scope is protocol and local recovery. UI, identity system, and storage service are outside implementation scope. Expose progress/state, retry, cancel, source-changed, expired, completed, and integrity status for the existing UI. Do not add an authentication provider, persist credentials, silently replace a file, or assume vendors behave alike.

## State, identity, and local recovery

Proposed states: PREPARED → INITIATING → UPLOADING → FINALIZING → COMPLETED with integrity full_match, transfer_checks_only, or unverified. Uncertain responses enter RECONCILING. SOURCE_CHANGED, CANCEL_PENDING, EXPIRED, ABORTED, and CLEANUP_UNRESOLVED preserve distinct causes. If completion wins cancel, return already_completed; never delete the completed object as abort cleanup.

Client creates random client_upload_id before networking and reuses it as idempotency key. Gateway binds it to existing principal, server session_id, unique generated key, profile version, expected length/digest, part size, expiry, and raw provider upload ID. Same-principal retries return the same session; another principal cannot adopt it. Filename is metadata, not a reusable destination key. Final key/collision policy is an owner decision.

Versioned local JSON stores client/session IDs, source path/length and fast metadata, whole-file SHA-256, per-part SHA-256 and ranges, acknowledged part numbers plus opaque ETags/checksums, profile ID/version, expiry, and state. It is recovery data, not authorization: no credentials, tokens, raw provider upload ID, or signed URLs. Restrict permissions; write temp, flush, atomically rename. Persist confirmed part results before advertising them as durable. Gateway journal and qualified remote reconciliation win over stale local acknowledgements.

Before create, hash the entire source and planned parts. Before each send/retry, spool at most one candidate 16 MiB range, hash it, compare with the manifest, and send those exact bytes. Remove the spool after reconciliation. Rehash the full source before resume and completion. Size/mtime/file ID are rejection hints, not proof. Any mismatch marks SOURCE_CHANGED, sends no more parts, and forbids completion. Require explicit new-upload intent; do not change or retarget the old source. Full-file rehash cost is a design choice; snapshot/locking alternatives need owner review and cannot silently weaken identity.

### U1 — interruption behavior

- **Process death:** after host reauthentication, verify principal/session/source, query gateway state, and reconcile the complete remote part set; resume only missing parts. A part in flight at death is uncertain. Paginate ListParts even though 384 parts are below AWS’s 1,000-entry page size.
- **Network loss/lost response:** bounded client backoff; query uncertain part state first, then retry the same part number with identical manifest bytes if absent. AWS documents same-number replacement; use only in a qualified adapter. Never infer acceptance from local socket write. Retry create with the same idempotency key. Lost completion response enters RECONCILING before any retry or new session.
- **Changed file:** verify whole digest on resume/finalization and spooled part before send. Mismatch blocks bytes/completion; require new-upload intent and request old-session cleanup.
- **Credential/grant expiry:** host auth expiry pauses for existing host reauthentication. Gateway can issue a fresh short-lived session/part-scoped grant only to the same principal/session. A different principal is denied. Grant expiry is distinct from session expiry; never persist grants.

### U2 — mechanism-level comparison

| | Resumable HTTP service (tus 1.0.0) | Native multipart (qualified profile) |
|---|---|---|
| Recovery unit | One resource with byte offset. HEAD reports authoritative offset; PATCH must present it; mismatch is 409 without mutation. Optional checksum can reject a chunk without advancing offset. | Independent numbered parts. Reconcile exact set after uncertainty; retry one part without resending earlier parts; completion assembles ordered parts. |
| State burden | Server durably couples bytes and offset, stages bytes or implements a store adapter, then bridges to object storage. Expiry/checksum/termination extensions must be advertised. | Store holds parts, avoiding a second tus staging copy. Gateway still owns identity, grants, journal, reconciliation, completion, abort and cleanup; limits, signatures, checksums, encoding and responses are provider-specific. |
| Tradeoff | Stable offset semantics across backends, with gateway bandwidth/staging or adapter cost and crash-consistency obligation. | Independent retryable parts near destination, with provider-specific compatibility and orphan risk. Amazon S3 MPUs do not expire automatically. |

Choose native multipart only if exact-endpoint qualification passes. If gateway cannot durably own tus offsets/bytes and cannot safely broker multipart, defer rather than guess. User preference remains conditional; tus is retained.

### U3 — completion and integrity

Reject ETag as a whole-file check. Distinguish:

1. **Part acknowledged:** qualified endpoint accepted a particular part and returned its identity/checksum; this does not prove final object visibility.
2. **Object completed:** parsed success or authoritative reconciliation, unique key visible, expected length confirmed. Sending completion or HTTP 200 alone is insufficient: AWS documents HTTP 200 with embedded error. Parse body. On timeout, reconcile. NoSuchUpload can mean invalid, aborted, or already completed; query journal and unique key.
3. **Independent byte match:** compare a provider-supported FULL_OBJECT checksum of the same algorithm/type to local digest after exact-profile testing; otherwise read back and hash. Composite checksum, part ETag, or final multipart ETag is not a whole-file SHA-256 proof. If neither full-object comparison nor readback runs, report “completed, integrity not independently verified”; if only part checks ran, “transfer checks only.”

Checksum type/mode and response fields are unknown until tested. Pin the deployment encryption mode in the profile and verify checksum/readback behavior under it; do not infer byte integrity from ETag under encryption. Do not disable integrity checks to make an endpoint work.

### U4 — cancel, expiry, cleanup, and owners

Use one gateway procedure for cancel, source change, expiry, and orphan recovery:

1. Persist CLEANUP_PENDING with cause, key/upload ID if known, and profile. Atomically fence new grants and completion. If completion won, return already_completed.
2. Drain/invalidate outstanding writes. Direct grants can be invisible to the gateway after issuance. Profile a safe grant-expiry/request-drain boundary; if unavailable, proxy part bodies or disable direct writes.
3. Abort, then list parts. If parts remain or a request raced abort, repeat abort/ListParts until empty. AWS says in-progress parts may succeed or fail after abort, repeated aborts may be needed, and ListParts-empty verifies cleanup. Qualify other endpoints.
4. Bound each worker pass to at most eight abort/list rounds, waits of 1, 2, 4, 8, 16, 32, and 60 seconds, and bounded API timeouts. If unresolved, persist CLEANUP_UNRESOLVED, report pending cleanup, and enqueue another bounded sweep. An abort response alone is not cleanup proof.
5. For create/ID-persist crash gaps, INITIATING already holds the unique key. Profile listing multipart uploads by that key/prefix to find orphans; lifecycle is a backstop.
6. Candidate policy: gateway session deadline seven days from initiation; configured lifecycle abort fourteen days from initiation, strictly later. These values are proposals, not AWS/tus defaults. Verify rule/filter semantics and no live session can be preempted. Without usable reconciliation/sweep or lifecycle backstop, keep provider disabled.

| Action | Accountable owner |
|---|---|
| Client ID, source hashing/journal, exact part spool, part body retry | Client |
| Existing-principal auth, idempotent create, key allocation, scoped grants, session journal, reconciliation, expiry, completion, abort and orphan sweep | Existing gateway |
| Execute multipart APIs and return results | Object store |
| Supply refreshed existing credentials | Host application |
| Configure/verify lifecycle backstop before enablement | Gateway/storage operator |

Client persists cancel intent and stops scheduling. Gateway owns terminal session state and provider retries. Store does not decide application expiry. Never auto-create a session after expiry/source change; require explicit user intent. A completed object is not an incomplete-MPU cleanup target.

### U5 — compatibility boundary and implementation history

Allowlist exact vendor/build, bucket/endpoint/addressing mode, pinned Rust SDK, gateway proxy/signing path, HTTPS body encoding and checksum header/trailer, part limits/pagination, retry/complete/abort behavior, checksum type, and sweep/lifecycle setup. Store profile version on each session; disable a new tuple until its tests pass.

**C1 — accept.** Separate part size from SDK aws-chunked stream-frame size and encoding. MinIO issue #21611 (opened 2025-09-28) names MinIO RELEASE.2025-09-07T16-13-09Z and AWS Go SDK service/s3 v1.73.0+. Its HTTPS report says requests above 16 MiB with STREAMING-UNSIGNED-PAYLOAD-TRAILER fail “chunk too big.” Reproduction is PutObject, not UploadPart; comments distinguish chunks from parts. Issue showed Open; repository archived 2026-04-25. Linked PR #21626 showed Closed, not merged; its proposed larger limit was challenged by maintainers. This is version-specific history, not a Rust SDK result or universal rule. A 16 MiB part does not demonstrate a workaround. Capture actual pinned Rust UploadPart wire encoding/frame size at the exact endpoint; test part and frame boundaries without disabling checksums.

**C2 — accept.** Apply abort-race reconciliation to cancel, expiry, source change and orphan recovery: fence new grants/completion, establish when existing writes can no longer succeed, abort, repeat abort/ListParts until empty, or persist CLEANUP_UNRESOLVED after bounded attempts. Direct-write profile stays disabled without a safe grant/request drain boundary; proxy or defer.

**E1 — retain uncertainty.** Actual provider/build, endpoint, Rust SDK/wire encoding, gateway journal/grant capability, checksum mode, key policy and lifecycle are absent. Do not fill these with AWS assumptions; architecture stays conditional until owners supply and qualify them.

### U6 — evidence, choices, and validation

**Evidence-supported:** S01 specifies tus 1.0.0 offsets; checksum, expiry, termination are conditional advertised extensions. S02–S06 describe Amazon S3 only. S07 is a bounded issue report; S08 AWS abort-race guidance; S09 a linked closed PR, not release evidence. Exact applicability is in the [source index](sources/index.md) and [source map](source-map.json).

**Original choices:** gateway journal, separate identities, unique key, local manifest/spool, full rehash, serial start, scoped direct grants, 16 MiB part candidate, concurrency ceiling 3, 7-day expiry, 14-day lifecycle, and eight cleanup rounds are proposals. Numeric policies need owner approval, not measured optima/defaults. Discovery’s preliminary 64 MiB/96-part arithmetic is not adopted; released-plan 16 MiB yields 384 parts for 6 GiB. Keep tus optional; do not build both initially.

**Plan fidelity:** preserve conditional direct parts, existing gateway/identity, local JSON, no credentials, concurrency ceiling, tus, cancel/cleanup, changed-source refusal, minimal progress/retry/cancel interface, and proposed fake-transport/file-change/late-completion/cancel-race ideas. Correct largest-part-only resume to full-set reconciliation; metadata-only file identity to content verification; completion-call/HTTP/ETag success to parsed/reconciled object and integrity levels. Reject ETag as whole-file proof, silent replacement, persisted credentials/grants, automatic replacement sessions, universal AWS assumptions, and 16 MiB as aws-chunked fix.

**Owner decisions:** provider/build/endpoint and Rust SDK; gateway journal/direct-grant/proxy capability; final key/collision policy; laptop scan/spool cost; checksum type/readback; grant-drain semantics; expiry/lifecycle/backoff approval; concurrency up to three. Until decided/tested, provider stays disabled.

**Proposed validation matrix — not run**

| Check | Observable invariant | Integration must establish |
|---|---|---|
| Fake transport loses a part before/after receipt; noncontiguous parts/concurrency | Reconcile exact set; never skip by max part number; identical same-part retry; only confirmed parts durable | List consistency, replacement, checksum fields, grant expiry/retry |
| Change/truncate/replace/same-size edit; timestamp-preserving replacement; mutate while spooling | Mismatch blocks bytes/completion; SOURCE_CHANGED; no mixed object/replacement | File race/spool and laptop scan cost |
| Lose/delay completion; HTTP 200 with embedded error | Stay FINALIZING/RECONCILING until parsed success/status; one object; no replacement | SDK parser, provider errors, visibility/checksum |
| Race cancel/expiry/orphan create or part/completion, including live direct grant | Fence work; prove drain boundary; re-abort/list empty or CLEANUP_UNRESOLVED; completion winner is already_completed | Abort race, list-by-key, grant/request lifetime, lifecycle delay/billing |
| Expire host token/grant; resume same/different principal | Same principal renews scoped grant; different denied; no secret/new upload ID | Existing gateway renewal and grant enforcement |
| 20 MiB/6 GiB on exact HTTPS profile with pinned Rust SDK | Limits accepted; request body separated from encoded frame; checksum preserved; full match or explicit unverified | Vendor/build, TLS/header/trailer, endpoint, checksum, completion, abort/lifecycle |

**Executed here:** read frozen assigned inputs and permitted maps; opened AWS AbortMultipartUpload, MinIO issue #21611, and linked PR #21626 in T3 collaborative browser. No code, implementation, fake transport, test suite, account, production credentials, upload, endpoint compatibility check, checksum readback, or throughput run. All validations are proposals, not results; no test is claimed passed.

### Native Goal activation observation

At this file’s save, create response exposed threadId 01a12409-0304-7732-85e3-608bc8196d17; exact objective “ER12 reviser stage, run A1-01-control: execute ER12_RUNTIME/runs/A1-01/control/stages/reviser/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.”; status active; createdAt 1791605973; updatedAt 1791605973; tokensUsed 0; timeUsedSeconds 0; remainingTokens null. Provider/model provenance and completion timestamp were not exposed: UNKNOWN. Terminal status had not yet been requested at this save.

