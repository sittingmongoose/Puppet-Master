# Independent critique — ER12-A1-01

Run: A1-01-control  
Stage: critic  
Reviewed package: investigator discovery, draft, source map, revealed plan, and plan-release record listed in the critic input map.  
Disposition: the package is broadly complete and preserves the released plan's intent. I found two material incompletenesses to address in the final revision. I found no material false claim. This is a critique only; no final proposal or repair was written.

## Material findings

### C1 — Separate aws-chunked frame sizing from multipart part sizing

**Classification:** material incomplete  
**Draft locator:** Recommendation, paragraph beginning “Use 16 MiB”; U5, compatibility-boundary paragraph; U6, revised-size bullet; proposed validation matrix, final row.  
**Released-plan locator:** Draft sequence, sentence specifying 16 MiB pieces.  
**Evidence:** S07 identifies an HTTPS request using aws-chunked checksum trailers and reports failure for uploads above 16 MiB. Its reproduction is a PutObject request, not an UploadPart test (issue body, lines 157–243). A contributor comment explicitly distinguishes transport chunks from multipart parts and discusses much smaller streaming chunks (lines 258–289). The issue is a version-specific community report; the repository is archived and the issue is Open on the reviewed page. The report does not establish what a 16 MiB UploadPart body becomes on the fictional Rust SDK's wire path.

The draft appropriately calls 16 MiB a candidate and says part size alone is not the compatibility proof. Still, tying the hard per-request part bound to the issue's 16 MiB report risks conflating two different sizes. The final should keep the part size as an unvalidated design candidate, name SDK streaming-frame/chunk size as a separate wire-level property, and test both on the pinned Rust SDK and exact endpoint. The matrix should make the observable request encoding explicit. Do not imply that a 16 MiB MPU part is a demonstrated workaround.

### C2 — Apply abort-race cleanup to expiry and orphan paths

**Classification:** material incomplete  
**Draft locator:** U4 table, Cancel and Session expiry rows; Orphans row; final validation matrix, cancel/expiry row.  
**Released-plan locator:** cancellation paragraph and proposed late-response/cancel-race validation.  
**Evidence:** S08, the Amazon S3 AbortMultipartUpload API reference, says in-progress part uploads may succeed after an abort, that multiple abort calls may be necessary, and that ListParts should be checked until empty to verify part cleanup. This is Amazon S3 behavior and must be profiled for a compatible endpoint.

The draft handles the race for user cancellation: it fences grants, waits for in-flight parts, aborts, and reconciles cleanup. The expiry row only says it fences new parts and invokes abort; the orphan row says the gateway sweeps and aborts. It does not expressly carry the same settle/re-abort/ListParts-empty rule across those paths. Since the brief separately requires expiry, orphan cleanup, and retry ownership, specify one gateway cleanup procedure for cancel, expiry, source-change abort, and orphan recovery, with a bounded retry policy and a durable “cleanup unresolved” state backed by the configured lifecycle rule. Expand validation so expiry and an orphaned create/part race prove cleanup, not merely terminal session status. The seven-day and fourteen-day values remain original proposals, not AWS defaults.

### E1 — Unresolved deployment facts are correctly held open

**Classification:** honestly unresolved external input; not a defect  
**Draft locator:** Recommendation, first paragraph; U5 compatibility-boundary section; U6 owner-decisions list.  
The actual storage vendor/build, endpoint style, pinned Rust SDK and request encoding, gateway journal/grant capability, checksum modes, and lifecycle configuration are unavailable in the fixture. The draft gates enablement on an exact qualified profile and allows gateway-backed tus or deferral if that profile fails. It does not present these unknowns as established facts. Preserve this boundary; do not generalize AWS or S07 behavior to all S3-compatible stores.

## Clause-by-clause and plan disposition

| Clause / released-plan element | Assessment and locator |
|---|---|
| U1 — identity, recovery record, interruption behavior, changed file | Covered with useful repair. The recommendation and U1 distinguish client ID, gateway session, and store key; record a content manifest and acknowledged part set; and cover process death, lost responses, changed source, and host-token expiry. Replacing “resume from largest piece number” with complete remote-set reconciliation directly fixes the plan's noncontiguous-success gap. The draft correctly treats source metadata as a fast hint, requires content checks, and forbids silent replacement. No material omission found. |
| U2 — compare tus and native multipart | Covered with a mechanism-level comparison in the U2 table. It explains tus HEAD/PATCH offset semantics and the server's durable byte/offset and store-bridging burden, versus independent store parts and provider-specific reconciliation/checksum/cleanup behavior. The recommendation remains conditional and retains tus or deferral; it does not treat the user's initial preference as an answer. Carry C1 into the compatibility rationale. |
| U3 — acknowledgement, completion, independent byte match | Strong correction. The U3 section separates part acknowledgement, parsed/reconciled object completion, and full-object verification. It rejects ETag as a dependable whole-file MD5 and labels unverified completion. AWS's multipart and completion references support these distinctions; the draft preserves the provider qualification. |
| U4 — cancel, expiry, orphans, retries and owners | Mostly covered. The U4 table assigns local source/part retry to the client, session authority and cleanup to the gateway, and storage operations to the store. It distinguishes session expiry from grant/token expiry and does not promise lifecycle cleanup by default. C2 is the material gap: make abort-race reconciliation equally explicit for expiry and orphan sweeps. |
| U5 — implementation/release detail and compatibility boundary | Meets the core requirement with a dated, versioned MinIO issue, exact uncertainty, and an explicit vendor/SDK/wire tuple. However, the draft's S07 locator omits the later issue comments that distinguish streaming chunks from MPU parts; see C1. S07 remains a report, not a normative spec or evidence for the fictional Rust client. |
| U6 — evidence, decisions, questions, proposed vs executed validation | Covered. The draft separates sourced behavior from original policies and unknowns, and labels the matrix proposed, not run. It says the investigator executed source review/reveal work but no code, endpoint, upload, checksum readback, benchmark, or test. I found no passed-test claim. The release record corroborates the revealed-plan release metadata. |
| Direct client parts / existing gateway preference | Preserved conditionally: data may go directly to storage with short-lived scoped authorization while the existing gateway owns the journal/session lifecycle. The draft exposes the gateway's needed capabilities as an owner decision; it does not add another identity provider or assert the gateway already supports them. |
| 16 MiB and three concurrent requests | The exact plan called both preferences, not requirements. The draft keeps 16 MiB as a candidate rather than a measured optimum and starts serially, retaining three only as a tested ceiling. This is a reasonable design choice, subject to C1's distinction between part body and encoded streaming chunks. |
| Local filename/size/mtime/part numbers; resume from maximum; ETag; mark done after completion call | The draft replaces the insufficient fields with IDs, lengths, hashes, ranges, and per-part state; rejects maximum-part-only recovery and ETag-as-file-integrity; and requires completion parsing/reconciliation. These corrections preserve the plan's goal while closing its stated gaps. |
| UI, credentials, cancel intent, validation | The draft keeps UI work outside protocol scope, persists no credentials or signed URLs, includes token renewal and remote cleanup, and retains the proposed fake transport/file-change/late-completion/cancel-race checks. It does not claim those checks ran. Add expiry/orphan cleanup assertions per C2. |

## Discovery, evidence, and fidelity

The discovery is useful and bounded: it identifies the unknown compatibility tuple, separates AWS/tus behavior from original design, gives a mechanism comparison, and proposes a non-performance-based 64 MiB sizing example. The released draft correctly supersedes that preliminary arithmetic with the plan's 16 MiB preference, while retaining it as a candidate rather than an established compatibility result. The draft also preserves the original plan's conditional preference, UI boundary, no-credential rule, no-silent-replacement requirement, and requested small validation matrix.

Direct review confirmed the key tus 1.0.0 conditions (offset mismatch is 409 without mutation; checksum, expiration, and termination are advertised optional extensions); Amazon S3's documented multipart limits; the opaque ETag/composite-checksum caveat; and the embedded-error possibility in CompleteMultipartUpload HTTP 200. These facts remain source-specific. See the independent records S01–S08 in this stage's source-map.json. The additional S08 record is appended; S01–S07 retain their original meanings.

## Native Goal observation

Direct create response: threadId 01a123fd-8430-7280-8fe1-c5ab0b956f89; objective exactly “ER12 critic stage, run A1-01-control: execute ER12_RUNTIME/runs/A1-01/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.”; status active; tokensUsed 0; timeUsedSeconds 0; createdAt 1791605221; updatedAt 1791605221; remainingTokens null. Provider/model provenance and a completion timestamp were not exposed by the create response and are UNKNOWN. This artifact was saved before native Goal completion; terminal status will be reported only from the native update result.

