# Independent Critique — ER12 A1-01 Treatment

Stage: critic  
Run: A1-01-treatment  
Scope: the frozen brief, released plan, investigator discovery and proposal, and the investigator source index.  
Review completed: 2026-10-10 UTC.

## Overall assessment

The proposal is scoped to transfer protocol and local recovery, compares Tus and native multipart by their recovery and completion mechanisms, and recommends Tus behind the existing gateway with an explicit vendor-qualification gate. That recommendation is coherent for the brief’s unspecified S3-compatible service and retains native multipart as a conditional alternative. It does not present its 16 MiB part size, 30-day expiry, retry count, or gateway state machine as measured or sourced defaults.

I found no material wrong claim and no scope breach. The plan preserves the released draft’s constraints and responds to all six required clauses. Two material incomplete details need resolution before the proposal is implementation-ready: checksum algorithm and encryption conditions for an independently verified byte match, and reconciliation of an uncertain native multipart part while that request may still be in flight. Both findings are limited and do not require changing the recommendation.

The investigator correctly treats the absent gateway, storage vendor, and host contracts as unknown. The recommendation remains conditional on those owners confirming the gateway can provide durable Tus sessions and the exact backend supports the chosen integrity and cleanup contract.

## Findings and issue classification

| ID | Classification | Location | Critique and evidence |
|---|---|---|---|
| C1 | Material incomplete | Draft: Completion and integrity contract, item 3 and following paragraph; Evidence, choices, and open owner decisions; last validation-matrix row. | The design is conditional, so it does not make a flat false claim. The missing algorithm and encryption conditions are material because the released draft explicitly asks how ETag integrity changes for multipart, encryption, and a compatible vendor. AWS S3’s multipart overview distinguishes full-object from composite checksums: its listed full-object algorithms are CRC64NVME, CRC32, and CRC32C, while SHA-256 appears under composite checksums. AWS also requires KMS decrypt permissions to retrieve a checksum, and says an SSE-C completion without the required encryption headers creates an object without a returned checksum. Therefore the proposal’s local SHA-256 cannot be assumed to compare directly with an AWS multipart full-object SHA-256. It needs either a provider-supported direct digest contract or read-back and hashing, with the accepted algorithm and encryption permissions made explicit. CRC verification should not silently be described as the same guarantee as a collision-resistant SHA-256 byte comparison. Evidence: S2, checksum sections and multipart API permissions. |
| C2 | Material incomplete | Draft: Native-multipart fallback paragraph under Recovery record; Storage operation retry/reconciliation row under Ownership; validation matrix row for late part results. | AWS ListParts omits parts whose upload request has not finished. Reusing a part number replaces the earlier part, so an uncertain request that remains in flight can race a retry; an empty listing alone does not establish that the original failed. The cancel path does call for draining and reconciling in-flight work, but the normal uncertain-part retry path does not state a corresponding wait, serialization, or operation-state rule. The fallback should make that outcome observable before retry or completion and cover it in the proposed fake-backend case. This applies to the conditional native multipart path. Evidence: S2, part upload and listing sections; S4, abort guidance. |

No separate minor locator or wording issue was material to this review. No unsupported external-behavior claim was found beyond the proposal’s disclosed design choices. The gateway UUID/idempotency behavior, 30-day policy, five-attempt retry cap, and local journaling are recommendations that the proposal labels as choices, not evidence.

## Review against the original clauses

| Clause | Finding |
|---|---|
| U1 — identity, recovery record, interruptions, changed source | Covered. The transfer UUID, distinct gateway session, versioned private record, server-authoritative Tus offset, restart and lost-response reconciliation, and content-hash guard address the required recovery cases. Hashing the same verified block buffer that is sent strengthens the changed-source protection. The native multipart alternative retains a separate per-part recovery record. |
| U2 — compare approaches | Covered. Tus provides a sequential authoritative offset and leaves storage behavior behind the gateway; native multipart offers independently retryable and parallel parts but adds provider-specific bookkeeping, completion, checksum, and cleanup responsibilities. These are mechanism-level tradeoffs. |
| U3 — completion and integrity | Covered with C1. The proposal separates PATCH acknowledgment, remote object completion, and independently checked byte match, rejects ETag as a universal full-object digest, and includes an explicit complete-but-unverified outcome. Specify checksum algorithm and encryption prerequisites before calling the result verified. |
| U4 — cancel, expiry, orphan cleanup, retry ownership | Covered with C2. Client, host, gateway, and storage/lifecycle responsibilities are assigned; 30 days is identified as a policy choice; cancel and completion races are addressed. Clarify normal in-flight part reconciliation for the native fallback. |
| U5 — implementation or release history | Covered. The proposal ties AWS SDK for Rust S3 v1.69.0, announced 2025-01-16, to default checksum behavior and a third-party compatibility boundary. It states that applicability depends on the actual gateway SDK and vendor. S6 is correctly used as one unresolved report that motivates ordered-completion coverage, not as evidence of a general defect. |
| U6 — evidence, choices, questions, validation | Covered. Evidence, design choices, owner decisions, proposed validations, and checks reported as executed are separated. No passing transfer test, real upload, production access, or throughput result is claimed. |

## Released-plan preservation and dispositions

The investigator preserves the user's small progress/retry/cancel surface, stable identity request, no-credential rule, changed-source prohibition, and 16 MiB sizing preference. The 16 MiB value remains a candidate; the AWS calculation of 384 parts for 6 GiB and a 4 MiB final part for 20 MiB is correct for AWS limits, not a compatibility claim for the unnamed service.

The initial preference for direct native multipart is considered and conditionally displaced by Tus at the existing gateway. The draft's three-request concurrency is not imposed on the recommended sequential Tus client; it remains a possible native-backend setting after provider tests and measurement. The largest-saved-part resume rule and ETag-as-whole-file-integrity assumption are rejected with concrete recovery and checksum alternatives. Lost acknowledgements, token expiry, cancellation cleanup, and cancel/complete races receive explicit owners and outcomes. The proposal retains the fake-transport, changed-file, late-completion, and cancellation-race validation ideas, with expected invariants and later integration evidence.

These dispositions preserve the user's instruction to keep the protocol-service option available if research supports it. The Tus choice is an original design recommendation, not an external requirement.

## External inputs that remain honestly unresolved

- Whether the existing authenticated gateway can persist Tus offsets, bind sessions to the same authenticated owner, return authenticated resource URLs, and provide idempotent creation and terminal state.
- The exact compatible storage vendor, endpoint and API version, signing requirements, supported part and checksum modes, encryption configuration and permissions, abort races, and lifecycle behavior.
- Whether gateway-backed full-object digest validation or read-back hashing is available and affordable, and which algorithm satisfies the requested verified state.
- The host's credential refresh and account-change contract; supported desktop platforms' private atomic-record location and file-identity semantics.
- The accepted expiry period and lifecycle/sweeper retention. Thirty days is proposed, not established.
- Whether any concurrency setting is useful; no throughput evidence exists.

## Validation record

The investigator's released execution record reports primary-page inspection and no product code, upload, checksum comparison, fake transport, provider test, or production access. Its plan-reveal record contains one release timestamp and a discovery digest/size; I independently recomputed the discovery file's SHA-256 and byte count and they match that record. This is an artifact identity check, not upload validation. The source-map and freeze JSON parse checks are reported by the investigator; they do not establish transfer behavior.

My independent review opened the six linked primary sources listed in the critic source index. I ran no transfer test, upload, downloaded code, or provider compatibility check. Proposed validations remain proposals.

## Scope and authority

This is an independent critique of the frozen proposal. It does not edit or repair the investigator's final, approve a vendor assumption, or reduce the user's stated scope. The findings identify uncertainty and evidence needed for later decisions.

