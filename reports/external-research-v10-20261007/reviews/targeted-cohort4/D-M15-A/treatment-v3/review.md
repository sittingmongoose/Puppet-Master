# Independent review — D-M15-A, frozen treatment v3

**Overall: FAIL — full declared scope assessed.** The artifact addresses all six obligations and offers useful complementary mechanisms, but its central identity gate does not bind the bytes checked to the bytes subsequently transferred. Material retry, durability, cleanup, source-attribution and validation errors also remain. This is a full-scope assessment; there is no unassessed declared remainder.

Frozen artifact: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_full_synthesis_final-v3/final.md`
Verified SHA-256 before assessment: `cd06682f9415536d3e0a419ac8d3b2b67b95f2dcfd38181ebe4f04b5a8233e0c`. Candidate bytes were left unchanged.

The original brief has an empty discovery manifest. I checked all 19 mapped captures (10 distinct byte sets), all three source indices, the exact frozen final, and four bounded additional primary-document checks. Every final recommendation, F1–F8, U1–U6, negative lead, disposition and V1–V3 prediction is represented in the claim register below. Relevant primary context and governing conditions were checked; hashes/index entries alone did not determine correctness. M14 authored-set/projection review is not applicable.

## Six axes

| Axis | Disposition | Assessment |
|---|---|---|
| 1. All required obligations | PARTIAL | All six are addressed and the module remains bounded. Retry safety, stable identity, lifecycle cleanup and discriminating validation have material gaps. |
| 2. Consequential claims and release/default/type/unit/path/authority conditions | FAIL | Full claim checking finds an explicit retry-rule omission, incomplete durability, incorrect NFS attribution and unstated path/read/session binding conditions. Version/type/unit defaults were checked independently. |
| 3. Bounded useful discovery, negative and optional yield | PARTIAL | Useful complementary primary corpus and several valid scoped negatives. Optional tus checksum/termination/expiration and S3 lifecycle conditions are not carried into the cleanup guarantee; a public S3 ETag lead is falsely called unpublished. |
| 4. Wrong rejection, correction and unjustified abstention | FAIL | F7’s main byte-identity rejections are justified, with narrower semantics than some wording. NFS is rejected on an unsupported atomicity attribution; descriptor continuity is needlessly left unresolved despite explicit captured text. |
| 5. Preservation, traceability, uncertainties and options | PARTIAL | Finding/uncertainty/validation IDs and most negative leads survive. Captured limits are not consistently preserved: whole-generation binding is not established, optional cleanup is missing, U3 is false documentary uncertainty and U4 broadens source scope. |
| 6. Proposed versus executed checks | PARTIAL | Fault injection is explicitly proposed, and no successful runtime result is asserted. Source hashes are checked, but one quote is not verbatim and acquisition/reverification process is not independently auditable. Proposed tests omit important discriminators. |

## Obligation coverage

| Obligation | Disposition | Assessment |
|---|---|---|
| 1. Address interrupted transfers and bounded retries. | PARTIAL | Interruption, retry caps and residue are discussed; method/replay stopping and cleanup conditions are incomplete. |
| 2. Address replacement/version identity during resume. | PARTIAL | Hash/validator identity is central, but stable source-generation binding and the fallback race are unresolved. |
| 3. Investigate transport-side and local-object-side mechanisms independently. | PASS | Both independent mechanism families were substantively investigated. Source correctness defects are counted on other axes, not erased by this breadth pass. |
| 4. Reconcile their overlap instead of concatenating two answers. | PARTIAL | F6/F8 explicitly reconcile identity/progress and cleanup rather than concatenate two answers, but the join’s safety contract is incomplete. |
| 5. Return at most eight supported material findings with negative leads/uncertainty retained. | PARTIAL | Exactly eight material findings and retained negatives/uncertainties; several findings contain consequential errors or omissions. |
| 6. Give a bounded recommendation and discriminating validation without building a full sync service. | PARTIAL | Bounded recommendation and V1–V3 are present; no service was built. Their missing discriminators allow an unsafe mechanism to pass. |

## Defects and materiality

### D01 — The local identity gate does not bind checked bytes to transferred bytes (high)

Candidate: final.md:7, final.md:19, final.md:21, final.md:29 U1, final.md:33 V1. Evidence: E05, E09, E13, E15, E16, E18.

A user replacement after hashing and before opening/reading can send new-generation bytes to an old session even with a single writer, especially in the explicitly allowed fallback without server whole-generation preconditions. In-place mutation during hashing/reading is likewise not excluded. This defeats the central identity/resume safety recommendation.

The path/descriptor distinctions are explicit facts. The interleaving counterexample is reviewer reasoning, not a reproduced test. Allowed interleaving: remote session has prefix of generation A; the resume gate hashes path -> A; the user atomically replaces that path with generation B; transfer reopens the path and sends B’s suffix into A’s session. If the hash-read descriptor is retained immutably or reads/replacement are synchronized, this interleaving is prevented, but the final does not state that binding.

Bounded correction: State a stable per-generation source/read binding, or synchronize generation selection/hash/read and revalidate before publication; bind the remote URL/uploadId/part ledger to that generation. Separate an opaque server ETag from the local full-file hash. Test replacement after the gate as well as before it; no full sync engine is necessary.

### D02 — The RFC retry conclusion omits an explicit normative stopping recommendation (high)

Candidate: final.md:7, final.md:15, final.md:29. Evidence: E03, E04, E09.

The repeated assertion of no retry bound in RFC 9110 is false and could authorize repeated automatic retries of operations whose method/application state is not known safe. Exact numeric caps are policy, but retry permissions and SHOULD-NOT rules are not entirely client policy.

Explicit text in both mapped RFC views, not a reviewer-selected preferred retry count. SHOULD NOT is not an absolute hard cap and justified exceptions are possible.

Bounded correction: Retain the failed-automatic-retry stopping rule and non-idempotent constraints; distinguish idempotent replays from tus PATCH state reconciliation and upload creation. App caps must be a justified policy within those rules.

### D03 — fsync-before-rename is insufficient to establish durable publication (medium)

Candidate: final.md:7, final.md:17. Evidence: E15, E17, E19.

The mechanism promoted as the durability amendment can lose the published name after a crash because directory-entry durability and syscall error handling are absent. SQLite’s database journal/lock sequence does not prove this shorter recipe.

Directory fsync requirement is explicit primary documentation; applying it to a renamed publication is engineering inference.

Bounded correction: Specify same-filesystem staging, successful file flush, rename and required directory flush after the name change, with storage/API support assumptions; separate atomic visibility from crash durability.

### D04 — The NFS warning is misclassified as an atomicity disclaimer (medium)

Candidate: final.md:17, final.md:29. Evidence: E15.

The final rejects NFS for a source-attributed reason that the primary page does not state, and loses the actual risk: failure does not determine whether rename occurred. This changes both supported rejection and recovery conditions.

Direct semantic discrepancy with the BUGS paragraph. The review does not certify every NFS deployment as suitable.

Bounded correction: Retain ambiguous-result handling and validate filesystem support separately. A conservative local-filesystem scope is an allowable engineering choice, but cannot be called this page’s NFS atomicity prohibition.

### D05 — An explicitly documented descriptor property is left as an uncaptured uncertainty (medium)

Candidate: final.md:17, final.md:29 U3. Evidence: E15, E16.

U3 withholds a documented mechanism directly relevant to independent local-object investigation and the identity race. It conflates unknown app handle use with uncertainty about the captured API contract.

Both captured man pages explicitly answer the documentary question. They do not prove this app keeps a handle or prevents in-place writes.

Bounded correction: Record descriptor continuity as a supported Linux API fact; retain only the app’s generation/handle-lifetime and writer-discipline questions as unresolved.

### D06 — Terminal abandonment lacks protocol capability and cleanup-confirmation conditions (high)

Candidate: final.md:7, final.md:25, final.md:29, final.md:33 V3. Evidence: E10, E12, E14, E21.

With intermittent connectivity, the transfer can stop locally while a remote upload remains. tus termination is optional, and S3 in-flight parts can require repeated abort/verification. The proposed two-sided terminal cleanup is not established merely by an attempt cap or an abort request.

Extension negotiation and abort races are explicit facts. A cleanup-pending lifecycle is a bounded reviewer correction, not a prescribed sync architecture.

Bounded correction: Require/verify cleanup capabilities or retain server expiration/lifecycle as an option; distinguish abandoned locally, cleanup pending and remote cleanup confirmed. Stop/quiesce in-flight work and bound cleanup retries, retaining a session identifier until confirmation/expiry.

### D07 — The proposed checks do not distinguish all mechanisms behind their predicted outcomes (medium)

Candidate: final.md:11, final.md:33 V1–V3. Evidence: E02, E06, E07, E08, E15, E16, E21.

V1 misses the after-gate race and allows descriptor-dependent outcomes. V2 can restart cleanly because Range was ignored, without the proposed validator mechanism. V3 needs unavailable/unsupported cleanup and completion/abort race cases. These checks could pass while the recommendation remains unsafe.

Counterexamples are derived from allowed primary semantics; no fault injection was performed. The checks are correctly marked proposed.

Bounded correction: Use known distinct generation fixtures, force replacements before and after the gate, record source handle/session identity and final digest; inspect 200/206/416, validator and Content-Range handling, including servers ignoring Range; observe remote cleanup separately from local terminal state.

### D08 — A page-limited missing ETag recipe becomes a false global publication negative (medium)

Candidate: final.md:29 U4. Evidence: E14, E22.

U4 states multipart ETag semantics are unpublished, prematurely closing a useful primary-document lead. AWS’s public guide documents them. This does not make an S3 ETag equal to a local whole-file SHA-256 or force adoption of S3.

Original API-page absence is valid; global absence is refuted by a bounded additional primary check. Current documentation lacks an immutable release ID, so this is a captured-current-document correction.

Bounded correction: Retain the original API-page capture limit and ETag-versus-full-file-hash distinction; label the algorithm outside those pages rather than unpublished.

Minor issues do not independently determine the failure: M01 is inaccurate verbatim-quote verification for the tus 409 paraphrase; M02 covers incorrect tus date/occurrence counts and RFC section metadata. All hashes match.

## Supported findings, limits and retained options

F1’s If-Range mismatch rule is supported for retrieval, with client response handling and valid strong validators. F2 correctly distinguishes progress from whole-generation identity; request/part checksums remain useful optional integrity features. F3’s initial idempotent-retry allowance is supported, but its no-bound conclusion is contradicted. F4’s atomic visibility and SQLite rollback facts are supported under their proper filesystem/database conditions. F5 is a supported concurrent-mutation hazard, with outcomes dependent on timing rather than guaranteed corruption. F6 is a useful reconciliation whose stable-source/server binding remains incomplete. F7’s four main byte-identity rejections are justified; semantic equivalence is narrower than byte equality. F8 identifies real residue risk but omits important cleanup conditions.

Retain U1 actual server enforcement, U2 actual replacement/handle discipline, U5 device/size/time behavior and U6 release-tag drift limits. Correct U3 to distinguish the explicit descriptor contract from unknown app usage. Correct U4 to distinguish missing API-page coverage from published AWS semantics. Preserve tus checksum/expiration/termination negotiation, S3 lifecycle options and abort verification, stable local generation/handle choices, and RFC strong-date alternatives. None of these observations forces adoption of a particular architecture.

## Claim-by-claim checking

Each row includes the independently checked source fact, inference classification, exact evidence IDs and consequential defect identity. Evidence IDs below resolve to primary paths, full hashes, sections and derived text locators.

### C01 — Eight primary documents captured and SHA-256 pinned at this stage. 
Candidate: final.md:3,33. **SUPPORTED_CONTENT_BINDING_PROCESS_NOT_AUDITED**. Evidence: frozen artifact / original brief / verified index structure. Defects: none.

The final-stage index contains eight primary document entries; every indexed hash and mapped original hash matches. Ten distinct byte sets exist across all mapped indices. New-fetch timing and who checked them cannot be established from permitted bytes.
Inference/provenance: Integrity observation; capture process remains reported provenance.

### C02 — SHA-256 of final local bytes at enqueue can key one photo-transfer identity. 
Candidate: final.md:7. **SUPPORTED_DESIGN_WITH_CONDITIONS**. Evidence: E01, E18. Defects: D01.

Collision-resistant identity is supported as a design precedent; Git uses SHA-1 of header+content rather than this SHA-256 recipe. Hashing must be over a stable generation.
Inference/provenance: Engineering proposal, not a source-mandated algorithm.

### C03 — Re-hash the attachment path before each resume; equality is sufficient to resume safely. 
Candidate: final.md:7. **INSUFFICIENT**. Evidence: E15, E16, E18. Defects: D01.

An open descriptor can remain attached to an old file while a path names a new one. Checking a path then reopening it has no atomic binding to the checked bytes. Single-writer does not prevent one writer racing a reader.
Inference/provenance: Counterexample inferred from documented path/descriptor semantics; not experimentally executed.

### C04 — On mismatch, abort/terminate the old remote session, remove temp files and start fresh. 
Candidate: final.md:7. **CONDITIONAL_DESIGN_INCOMPLETE**. Evidence: E09, E10, E12, E14, E21. Defects: D06.

New upload/session on a changed generation is useful. tus termination requires advertised optional support; expired uploads may already be gone; remote abort can fail or race active parts.
Inference/provenance: Engineering lifecycle recommendation with missing availability/confirmation conditions.

### C05 — Use byte-range GET with strong ETag If-Range as a transport identity gate. 
Candidate: final.md:7. **SUPPORTED_FOR_DOWNLOADS**. Evidence: E02, E06, E07, E08. Defects: none.

RFC Range/If-Range applies to retrieval, uses opaque representation validators, may be ignored where unsupported, and requires proper 200/206 handling. It does not by itself resume an upload.
Inference/provenance: Valid conditional download mechanism; applicability to the declared upload path remains unresolved.

### C06 — Offset/part protocols can be preconditioned on the local hash where the server accepts preconditions. 
Candidate: final.md:7. **UNESTABLISHED_OPTION**. Evidence: E05, E09, E10, E13. Defects: D01.

If-Match compares an existing representation ETag, not inherently the incoming payload hash. tus offsets/checksums and S3 part checksums do not establish the asserted whole-generation precondition.
Inference/provenance: Conditional custom server-contract proposal, not an existing captured protocol guarantee.

### C07 — fsync-then-rename supplies durable local publication. 
Candidate: final.md:7,17. **INCOMPLETE**. Evidence: E15, E17, E19. Defects: D03.

Same-filesystem rename supplies visibility atomicity. Flushing file contents before rename does not itself persist the changed directory entry; SQLite uses a richer ordered discipline.
Inference/provenance: Incomplete extrapolation from database durability to generic file publication.

### C08 — Bound retries by attempt count and byte-progress floor while honoring Retry-After. 
Candidate: final.md:7. **SUPPORTED_POLICY_WITH_MISSING_GOVERNING_RULES**. Evidence: E03, E04, E09. Defects: D02.

Exact caps are app policy; Retry-After defines date/seconds delay. RFC still supplies method restrictions and a SHOULD-NOT stopping recommendation; tus offsets must be reconciled after errors.
Inference/provenance: Reasonable policy proposal, not an unrestricted standards allowance.

### C09 — Exhaustion/replacement becomes a terminal session with remote abort and local removal. 
Candidate: final.md:7,25. **INCOMPLETE**. Evidence: E10, E12, E14, E21. Defects: D06.

Stopping locally and deleting a temp file does not confirm remote cleanup. Optional termination, unavailable transport and abort races require explicit cleanup-pending/confirmed meaning.
Inference/provenance: Lifecycle design claim with missing conditions.

### C10 — The recommendation remains one bounded diagnostic module, without a full sync service. 
Candidate: final.md:5–7,31–41. **SUPPORTED**. Evidence: frozen artifact / original brief / verified index structure. Defects: none.

The artifact proposes mechanics and three validation scenarios, with no implementation, full application plan or WorkNodes.
Inference/provenance: Structural artifact observation.

### C11 — The quoted If-Range mismatch rule transfers the new selected representation instead of 412. 
Candidate: final.md:11. **SUPPORTED**. Evidence: E06. Defects: none.

The normalized quoted substring is present in both RFC views and its surrounding section gives the matching rule.
Inference/provenance: Direct primary-source fact.

### C12 — Replacement yields clean full re-transfer, never mixed 206, but only if strong ETags exist. 
Candidate: final.md:11. **OVERSTATED**. Evidence: E02, E06, E07, E08. Defects: D07.

Strong comparison and client handling of responses are required. Strong HTTP-date is also allowed under specific conditions. A server may ignore Range; receiving full content is not proof that the client discarded the old prefix.
Inference/provenance: Conditional system-safety inference stated as a source guarantee.

### C13 — tus offset mismatch returns 409 without modifying the upload resource. 
Candidate: final.md:13. **SUPPORTED_PARAPHRASE**. Evidence: E09, E11. Defects: M01.

The source says 409 Conflict status without modifying the resource. The candidate omits status inside quotation marks.
Inference/provenance: Correct semantics; not a verbatim quote.

### C14 — tus core has no content-replacement/version mechanism. 
Candidate: final.md:13,29. **SUPPORTED_SCOPED_NEGATIVE**. Evidence: E09, E10, E11. Defects: none.

Core binds a URL/offset/length and no whole-payload version identity; protocol-version headers are not payload generations. Optional metadata/checksums do not automatically add that binding.
Inference/provenance: Negative within the captured core, not all tus implementations.

### C15 — S3 same-part-number reupload overwrites the part. 
Candidate: final.md:13. **SUPPORTED**. Evidence: E12, E13. Defects: none.

The exact sentence occurs in UploadPart; the scope is the same upload ID/key and valid part-number range.
Inference/provenance: Direct primary fact; silent substitution means no generation comparison, not absence of integrity checks.

### C16 — Offset/part position is content-blind. 
Candidate: final.md:13,21. **SUPPORTED_FOR_GENERATION_IDENTITY_WITH_LIMITS**. Evidence: E09, E10, E12, E13. Defects: none.

Position alone does not select an authored generation. Both protocols do have optional or supported part/request integrity mechanisms; these are different from whole-upload identity.
Inference/provenance: Valid conceptual distinction if checksum and session conditions are retained.

### C17 — No numeric retry count is specified in captured tus or S3 API pages. 
Candidate: final.md:13,29. **SUPPORTED_SCOPED_NEGATIVE**. Evidence: E09, E11, E12, E14. Defects: none.

Core and both captured S3 API documents do not prescribe an attempt-count/backoff policy. SDK behavior is not covered by those pages.
Inference/provenance: Page-bounded negative, not a claim about SDKs.

### C18 — HTTP idempotent requests can be automatically repeated on communication failure. 
Candidate: final.md:15. **SUPPORTED_WITH_CONDITIONS**. Evidence: E03. Defects: D02.

The allowance concerns identical requests after failure before a response is read; method semantics and nonapplication knowledge constrain non-idempotent operations.
Inference/provenance: Direct source rule, incompletely reproduced in the final.

### C19 — HTTP retries are unbounded; no bound exists anywhere in the captured RFC; boundedness is entirely client policy. 
Candidate: final.md:15,29. **CONTRADICTED**. Evidence: E03. Defects: D02.

Both RFC renditions expressly advise a client not to automatically retry a failed automatic retry. This is a normative SHOULD-NOT stopping rule, though not an absolute numeric cap without exceptions.
Inference/provenance: The candidate converts absence of a configurable count into absence of any governing bound.

### C20 — Retry-After is a delay hint, not a retry-count policy. 
Candidate: final.md:15. **SUPPORTED**. Evidence: E04. Defects: none.

It supplies a date or seconds to wait with status-specific semantics, and no attempt count.
Inference/provenance: Direct source fact.

### C21 — Atomic rename is a safe publication primitive. 
Candidate: final.md:17. **SUPPORTED_WITH_CONDITIONS**. Evidence: E15, E16. Defects: none.

Ordinary rename replaces an existing destination atomically without a missing-path gap, on the same mounted filesystem; atomic visibility does not make mutable existing inodes immutable.
Inference/provenance: Design inference from a filesystem API contract.

### C22 — A failed rename leaves newpath in place. 
Candidate: final.md:17. **SUPPORTED_WITH_SCOPE_CAVEAT**. Evidence: E15. Defects: D04.

The statement requires newpath already exists; it guarantees an instance remains. On NFS, failure does not determine whether the rename happened.
Inference/provenance: Source fact with conditions narrower than the short sentence.

### C23 — The rename BUGS section disclaims NFS atomicity, so this mechanism excludes NFS. 
Candidate: final.md:17,29. **CONTRADICTED_ATTRIBUTION**. Evidence: E15. Defects: D04.

BUGS describes a completed rename followed by a crash/retransmission failure. That is ambiguity of observed success/failure, not an atomicity disclaimer.
Inference/provenance: Unsupported generalization and rejection.

### C24 — The rename page contains no durability/fsync statement. 
Candidate: final.md:17,29. **SUPPORTED_SCOPED_NEGATIVE**. Evidence: E15. Defects: none.

Relevant API prose and complete page text have no fsync or crash-durability contract.
Inference/provenance: Bounded absence on this page.

### C25 — SQLite journals before modifying, flushes for power-loss recovery, commits by journal deletion, and hot journals indicate inconsistency. 
Candidate: final.md:17. **SUPPORTED_FOR_DOCUMENTED_ROLLBACK_MODE**. Evidence: E17. Defects: none.

Ordered journal/data flushes and exclusive locking govern this example; deletion is a commit point with documented alternative journal truncation/header invalidation modes. A hot journal has specific existence/lock/header conditions.
Inference/provenance: Database-specific source facts, not a generic upload transaction.

### C26 — SQLite supplies the missing durability of a fsync-then-rename recipe. 
Candidate: final.md:17. **NOT_ESTABLISHED**. Evidence: E17, E19. Defects: D03.

SQLite does not implement the proposed generic two-operation recipe; directory syncing and operating-system/device assumptions are material.
Inference/provenance: Extrapolation beyond the cited mechanism.

### C27 — Open-descriptor continuation across rename is only POSIX-implied and not captured verbatim. 
Candidate: final.md:17,29. **CONTRADICTED**. Evidence: E15, E16. Defects: D05.

rename explicitly says open descriptors are unaffected; open explicitly says the descriptor reference survives pathname removal/rebinding. Actual app use of such a descriptor remains unknown.
Inference/provenance: False documentary uncertainty, distinct from genuine deployment uncertainty.

### C28 — O_TRUNC makes an opened file length zero. 
Candidate: final.md:19. **SUPPORTED_WITH_TYPE_AND_MODE**. Evidence: E16. Defects: none.

This applies to an existing regular file opened with writing allowed, O_WRONLY/O_RDWR. FIFO/terminal and unspecified other cases are not covered by that shorthand.
Inference/provenance: Source fact in the normal regular-photo-file setting.

### C29 — A concurrent reader observes truncated/mixed bytes under in-place replacement. 
Candidate: final.md:19. **SUPPORTED_RISK_NOT_INEVITABLE_OUTCOME**. Evidence: E16. Defects: D01.

Truncation/mutation of the same object creates a possible race; observed output depends on timing, descriptor, offset and buffer behavior.
Inference/provenance: Concurrency inference, not an executed or universally inevitable observation.

### C30 — Identity gating detects replacement but cannot salvage a corrupted old partial. 
Candidate: final.md:19. **CONDITIONAL**. Evidence: E09, E13, E16, E18. Defects: D01.

A before-attempt check can detect a completed change. It does not cover mutation after the check. Transport checks can reject/restart, but do not reconstruct lost original source bytes.
Inference/provenance: Reasonable hazard analysis with missing stable-read condition.

### C31 — Git blob identity hashes header+content and retains both content versions. 
Candidate: final.md:21. **SUPPORTED**. Evidence: E18. Defects: none.

The chapter uses SHA-1 of a blob header with byte length and NUL plus content; the two-version example is explicit.
Inference/provenance: Direct tutorial source fact.

### C32 — Content-addressing makes replacement decidable by hash comparison but says nothing about wire progress. 
Candidate: final.md:21. **SUPPORTED_DESIGN_WITH_CONDITIONS**. Evidence: E01, E09, E12, E18. Defects: D01.

Stable generation data can be compared using a suitable digest, separately from offsets/parts. The chapter actually stores separate content objects; merely storing a digest does not do that.
Inference/provenance: Engineering inference, subject to stable bytes and hash assumptions.

### C33 — One hash keys the session; local gate decides restart and transport gate makes the wire refuse to mix. 
Candidate: final.md:21. **INCOMPLETE**. Evidence: E05, E09, E10, E13, E16. Defects: D01.

No captured tus/S3 operation automatically maps that local full-file hash into a whole-generation precondition. The path-check fallback has a race.
Inference/provenance: Useful conceptual reconciliation whose asserted safety is not established.

### C34 — Neither gate alone suffices; identity without atomic publication still corrupts. 
Candidate: final.md:21. **OVERBROAD**. Evidence: E15, E16, E17, E18. Defects: D01.

An immutable stored generation/read handle can remain stable across rename, and database locking can avoid partial reads. The sources support particular hazards, not impossibility of every single-gate design.
Inference/provenance: Generalization beyond the shown assumptions; does not require adopting another design.

### C35 — Strong validators can change with unchanged data and cause a safe extra transfer. 
Candidate: final.md:21. **SUPPORTED_WITH_WORDING_LIMIT**. Evidence: E01, E06, E08. Defects: none.

Metadata changes can alter a strong validator. If-Range mismatch causes a fresh response; it is not itself a protocol abort. Safety still requires the client response-combination rules.
Inference/provenance: Supported retry/restart consequence, assuming correct client handling.

### C36 — Reject mtime+size as sufficient byte identity: false resume and false abort are possible. 
Candidate: final.md:23. **SUPPORTED_INFERENCE**. Evidence: E01, E20. Defects: none.

Equal-length different byte sequences exist; authorized timestamp restoration/preservation is documented, and timestamps can change without changing desired bytes. RFC weak-validator discussion supports the concern but is not the full filesystem proof.
Inference/provenance: Reviewer independently completed the missing primary support; no app behavior observed.

### C37 — Reject W/ weak ETags for byte resume; a replaced photo is not equivalent. 
Candidate: final.md:23. **REJECTION_SUPPORTED_REASON_OVERSTATED**. Evidence: E01, E02, E06. Defects: none.

Weak tags can group semantically equivalent but byte-distinct representations and are forbidden in If-Range. A replaced/reencoded photo may remain semantically equivalent, so that example is not universally true.
Inference/provenance: Byte-identity rejection valid without the categorical semantic claim.

### C38 — Reject path/filename as a content-generation identifier. 
Candidate: final.md:23. **SUPPORTED**. Evidence: E15, E16. Defects: none.

The same pathname can refer to another file; open descriptions and rename behavior distinguish name from object.
Inference/provenance: Direct API facts support the identity inference.

### C39 — Reject bare offset/part number as sufficient content identity. 
Candidate: final.md:23. **SUPPORTED**. Evidence: E09, E12. Defects: none.

tus offsets and S3 part overwrite do not bind original bytes/generation. F2 supports this; F3 retry rules do not demonstrate substitution.
Inference/provenance: Correct conclusion with one imprecise internal reference.

### C40 — Incomplete S3 multipart parts persist and incur storage charges until complete/abort. 
Candidate: final.md:25. **SUPPORTED_S3_SCOPE**. Evidence: E12, E14. Defects: none.

Both API introductions say this. Configured lifecycle abort is an available server-side option for applicable buckets, so indefinitely manual-only abandonment is not the only route.
Inference/provenance: Vendor-specific fact, not a property of all transports.

### C41 — Local staged/temp files persist when attempts simply stop. 
Candidate: final.md:25. **SUPPORTED_LIFECYCLE_INFERENCE**. Evidence: E18. Defects: none.

Git retains example objects and these protocols do not remove arbitrary local temp files; an application must define its own staging/cleanup behavior. No actual app temp-file persistence was inspected.
Inference/provenance: Engineering risk rather than an observed incident.

### C42 — The Git chapter omits unreachable-object collection. 
Candidate: final.md:25,29. **SUPPORTED_SCOPED_NEGATIVE**. Evidence: E18. Defects: none.

The authored chapter covers object storage/tree/commit construction and no GC/reflog expiry mechanism. Navigation links to other chapters are not that chapter’s coverage.
Inference/provenance: Chapter-bounded negative, not absence of Git GC.

### C43 — A cap should trigger two-sided cleanup rather than merely stop attempts. 
Candidate: final.md:25. **SUPPORTED_GOAL_INCOMPLETE_MECHANISM**. Evidence: E10, E12, E14, E21. Defects: D06.

Remote residue is a real documented lifecycle issue; termination/abort availability, in-flight uploads and confirmation must be distinguished from a local terminal state.
Inference/provenance: Design recommendation needs cleanup conditions and bounded pending behavior.

### C44 — Retry constants are app-tunable and not source-derived; parameterization remains open. 
Candidate: final.md:25,37. **SUPPORTED**. Evidence: E03, E04, E09, E12. Defects: none.

The cited documents do not select app-specific count/progress constants; RFC normative retry rules still apply.
Inference/provenance: Explicit design parameter, not an omission requiring a fabricated numeric answer.

### C45 — Without server validators/preconditions the transport gate collapses to the local gate. 
Candidate: final.md:29 U1. **SUPPORTED_LIMITATION_UNSAFE_FALLBACK**. Evidence: E05, E09, E13, E16. Defects: D01.

No captured server contract establishes whole-hash enforcement for the upload; the proposal explicitly relies on local checking in that case. That fallback is not proven safe against a writer between checking and reading.
Inference/provenance: Availability condition is retained, but its safety implication is incomplete.

### C46 — The app’s replace-via-rename versus in-place behavior is unresolved. 
Candidate: final.md:29 U2. **APPROPRIATE_UNCERTAINTY**. Evidence: E15, E16. Defects: none.

The original brief permits replacement but supplies no implementation. The captured docs describe both mechanisms without establishing which is deployed.
Inference/provenance: Deployment unknown within the permitted input scope.

### C47 — Descriptor continuation is uncertain. 
Candidate: final.md:29 U3. **FALSE_SOURCE_UNCERTAINTY**. Evidence: E15, E16. Defects: D05.

The documentary answer is explicit in two mapped pages; only the app’s handle lifetime/use is unknown.
Inference/provenance: Unjustified documentary abstention.

### C48 — S3 composite ETag semantics are unpublished. 
Candidate: final.md:29 U4. **CONTRADICTED_GLOBAL_NEGATIVE**. Evidence: E14, E22. Defects: D08.

They are absent from the captured API pages but described in a public primary AWS guide, separately captured by this reviewer.
Inference/provenance: A page-bounded negative was wrongly widened to global publication absence.

### C49 — Rehash cost on rural devices is untested and bounded by photo sizes. 
Candidate: final.md:29 U5. **UNCERTAINTY_RETAINED_BOUND_UNQUANTIFIED**. Evidence: E18. Defects: none.

Re-reading a file has work proportional to bytes read; no device timing, app photo maximum, hash implementation or latency budget was provided. Finite photo size is not a measured wall-clock bound.
Inference/provenance: Design cost uncertainty, no measured performance claim accepted.

### C50 — Published tus header is 1.0.0; drift against mutable master/tag is unchecked. 
Candidate: final.md:29 U6. **APPROPRIATE_VERSION_LIMIT**. Evidence: E09, E10, E11. Defects: none.

Both mapped views say 1.0.0 and 2016-03-25; checked relevant semantics agree. No immutable release-tag verification proves historical release identity.
Inference/provenance: Capture/version limit, not evidence of actual drift.

### C51 — Negative leads include no mandated tus chunk size, no rename durability contract, no Git GC, no retry bounds anywhere. 
Candidate: final.md:29. **MIXED**. Evidence: E03, E09, E10, E15, E18. Defects: D02.

The first three negatives are valid in their named scopes; absence of a numeric tus/S3 retry policy is valid. The RFC-wide no-bound claim contradicts its normative stopping recommendation.
Inference/provenance: Scope-sensitive negatives, not an exhaustive unknown-answer key.

### C52 — Every quotation was verified against bytes; no code or live fault injection was executed. 
Candidate: final.md:3,33. **MIXED_PROVENANCE**. Evidence: E11. Defects: M01.

Most quotes are present; the tus quote is a paraphrase. Integrity is verifiable; actual stage execution history was not inspected and absence of code execution cannot be independently certified from these artifacts. Tests are explicitly proposed, not reported results.
Inference/provenance: Artifact declaration separated from independently checked observations.

### C53 — Replace via rename and in place before resume; identity-gated resume restarts cleanly in both, offset-only mixes in at least one. 
Candidate: final.md:33 V1. **USEFUL_BUT_INCOMPLETE_DISCRIMINATOR**. Evidence: E09, E12, E15, E16. Defects: D01, D07.

A completed replacement before hashing is detectable, but mutation/rebinding after the gate is not tested. A retained immutable descriptor can complete coherent old-generation data, and byte outcomes depend on fixtures/schedules.
Inference/provenance: Predicted experimental result, not an observation or inevitable control failure.

### C54 — Server replacement: mixed 206 versus clean restart discriminates strong If-Range deployments. 
Candidate: final.md:33 V2. **NONUNIQUE_DISCRIMINATOR**. Evidence: E02, E06, E07, E08. Defects: D07.

A server can ignore Range and return a full 200 without establishing the proposed validator contract. Client append/reset logic, status, Content-Range and stored validator are required observables; strong HTTP-date is another supported route.
Inference/provenance: Hypothesis needs more discriminating observables and applicability to the actual transfer direction.

### C55 — Connection flaps until caps trigger; compare attempts-to-terminal and remote/local residue with cleanup enabled/disabled. 
Candidate: final.md:33 V3. **USEFUL_WITH_MISSING_CONDITIONS**. Evidence: E03, E10, E21. Defects: D06, D07.

Counting attempts/residue is useful, but local termination is not remote cleanup confirmation. Test unavailable/unsupported abort and in-flight races; S3 documents repeated abort and ListParts verification.
Inference/provenance: Proposed validation, not executed evidence.

### C56 — F1/F3/F5/F6/F8 accepted; F2/F4 amended; F7 candidates rejected; listed deployment parameters unresolved. 
Candidate: final.md:37. **PRESERVED_BUT_NOT_ALL_JUSTIFIED**. Evidence: E03, E15, E19. Defects: D01, D02, D03, D04, D05, D06, D07, D08.

All original finding/disposition IDs are retained in the review. Their self-assigned acceptance does not override source contradictions or missing safety conditions.
Inference/provenance: Candidate judgments independently assessed, no adoption truth assumed.

### C57 — At most eight material findings and all six obligations covered. 
Candidate: final.md:9–25,39–41. **STRUCTURAL_COVERAGE_SUPPORTED_SUBSTANTIVE_COVERAGE_PARTIAL**. Evidence: frozen artifact / original brief / verified index structure. Defects: none.

There are exactly F1–F8 and 1135 whitespace-delimited words, slightly over a soft 1100 ceiling, which is not a rejection basis. Each obligation is addressed, but support/conditions/validation are incomplete as detailed below.
Inference/provenance: Artifact structure independently counted, adequacy reviewed separately.

### C58 — Candidate source identities, versions, locators and capture limits are reliable answers. 
Candidate: sources/index.json; INPUT_MAP.json. **CHECKED_AS_UNTRUSTED_METADATA**. Evidence: E03, E09, E11, E15, E16. Defects: M02.

All 19 mapped files and three indices match their declared hashes; headers identify the claimed documents. Errors include tus date/counts, RFC 412/range section labels, NFS semantics and descriptor uncertainty. Claimed capture timestamps/new-fetch methods lack independently trusted acquisition evidence.
Inference/provenance: Identity/content checks plus explicit provenance limitations, never hash-only SourcePASS.

## Primary evidence and exact locators

Line ranges refer to the retained, normalized reviewer text; the original primary capture path and SHA-256 identify source bytes. These excerpts/locators are evidence aids, not new authorities. The JSON inventory preserves every mapped path and alias through its integrity ledger.

### E01 — RFC 9110 §8.8.1 Weak versus Strong
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 2755–2830.

Strong validators change on observable representation-data changes, may also change for metadata reasons, and are unique per resource across time rather than across all resources. Collision-resistant content hashes can be sufficient. Weak validators need not distinguish every byte change.

### E02 — RFC 9110 §8.8.2.2 and §8.8.3
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 2868–2978.

Last-Modified is implicitly weak but can be deduced strong under specified origin/cache clock and timing conditions. ETags are opaque, default strong, and MUST be marked W/ if weak. Strong comparison requires two nonweak tags and matching opaque values.

### E03 — RFC 9110 §9.2.2 Idempotent Methods
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 3134–3170.

Identical idempotent requests may be retried on communication failure before reading a response. Non-idempotent retry requires known idempotence or nonapplication; a proxy MUST NOT automatically retry non-idempotent requests; a client SHOULD NOT automatically retry a failed automatic retry. This is a normative stopping recommendation, not a configurable numeric hard cap.

### E04 — RFC 9110 §10.2.3 Retry-After
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 3889–3906.

Retry-After is an HTTP-date or nonnegative decimal seconds delay; 503 describes expected unavailability and 3xx asks for a minimum redirect delay. It does not define an attempt count or a whole-transfer deadline.

### E05 — RFC 9110 §13.1.1 If-Match
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 4660–4725.

If-Match compares the selected representation’s current ETag with strong comparison before performing a method; a false condition prevents the operation, with 412 or already-applied-success handling. The validator is not automatically a hash of the incoming upload body.

### E06 — RFC 9110 §13.1.5 If-Range
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 4915–4969.

If-Range mismatch causes Range to be ignored and the new representation to be transferred rather than a precondition-failure response. Weak tags cannot be sent; a strong HTTP-date is also permitted if no ETag exists. Lack of Range support means If-Range is ignored.

### E07 — RFC 9110 §§14.1.2, 14.2, 14.5
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 5122–5177, 5178–5240, 5332–5350.

Byte offsets are zero-based inclusive positions in the encoded representation. Range handling here is defined for GET; a server may ignore it. Unsatisfiable ranges can produce 416. Partial PUT is a private-agreement mechanism with compatibility hazards, not the same as ranged GET.

### E08 — RFC 9110 §§15.3.7 and 15.3.7.3; §15.5.17
Source S06: [https://www.rfc-editor.org/rfc/rfc9110.txt](https://www.rfc-editor.org/rfc/rfc9110.txt).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/rfc9110.txt`.
SHA-256: `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/06-rfc9110.txt`, lines 5642–5659, 5731–5759, 6181–6205.

A 206 client MUST inspect Content-Type/Content-Range. Partial responses may only safely be combined with the same strong validator. A new 200 response is a complete-representation response, not permission to append it to old partial bytes; 416 cannot be relied on because Range may be ignored.

### E09 — tus core: HEAD, PATCH, Headers, OPTIONS
Source S02: [https://tus.io/protocols/resumable-upload](https://tus.io/protocols/resumable-upload).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_transport_scout-v3/sources/tus-resumable-upload-1.0.0.html`.
SHA-256: `868947ec6573ff745f31649d730616bfcd7d154af0c22ab39f1af4937f3e3a21`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/02-tus-resumable-upload-1.0.0.txt`, lines 101–215, 217–228.

HEAD obtains Upload-Offset in bytes and must not be cached. PATCH applies bytes at current matching offset; mismatch returns 409 Conflict status without modifying the upload. Successful offset advances by bytes actually processed or stored, and network timeout handling is recommended. Core mandates no retry-count cap, content-version identity binding, or fixed chunk size. The 1GB OPTIONS example is a whole-upload limit, not chunk guidance.

### E10 — tus Creation, Checksum, Expiration, Termination, Concatenation
Source S02: [https://tus.io/protocols/resumable-upload](https://tus.io/protocols/resumable-upload).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_transport_scout-v3/sources/tus-resumable-upload-1.0.0.html`.
SHA-256: `868947ec6573ff745f31649d730616bfcd7d154af0c22ab39f1af4937f3e3a21`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/02-tus-resumable-upload-1.0.0.txt`, lines 230–300, 338–406, 429–497.

Creation and other extensions are negotiated via Tus-Extension. Checksums optionally protect each PATCH body, with SHA1 minimum and negotiated algorithms; mismatches discard the chunk without advancing offset. Expiration may remove stale uploads and 404/410 requires a new upload. Termination is optional and must be advertised; DELETE termination resource release is SHOULD. Concatenation preserves specified URL order and does not automatically copy partial metadata. None supplies an automatic whole-upload generation binding.

### E11 — tus raw master header, core and extensions
Source S07: [https://raw.githubusercontent.com/tus/tus-resumable-upload-protocol/master/protocol.md](https://raw.githubusercontent.com/tus/tus-resumable-upload-protocol/master/protocol.md).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/tus-protocol-1.0.0.md`.
SHA-256: `dfc82027d295c80c3ff799f8f6944115e6fb383373a0b41d0eec296200535bb6`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/07-tus-protocol-1.0.0.txt`, lines 1–3, 74–183, 323–395, 425–497.

Version/date are 1.0.0 / 2016-03-25. Relevant HEAD/PATCH/checksum/expiration/termination/concatenation contracts agree with the published captured HTML. The printed 409 quote omits the word status, so it is an accurate paraphrase rather than a verified verbatim substring. No tagged-release drift check was supplied or performed.

### E12 — UploadPart introduction, request parameters and response/example
Source S08: [https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/aws-s3-uploadpart.html`.
SHA-256: `99431e43cb9439f6d103bb647a25e6d1ef707191afbc45bc159ba70b0058dac1`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/08-aws-s3-uploadpart.txt`, lines 7–25, 155–164, 372–373.

Multipart initiation returns an upload ID; parts 1–10000 are identified by part number within that upload and same-number reupload overwrites the previous part. Storage charges stop with complete/abort. Key, bucket, partNumber and uploadId bindings are required; responses provide a per-part ETag to retain for completion.

### E13 — UploadPart Data integrity, Request Syntax and URI Request Parameters
Source S08: [https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/aws-s3-uploadpart.html`.
SHA-256: `99431e43cb9439f6d103bb647a25e6d1ef707191afbc45bc159ba70b0058dac1`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/08-aws-s3-uploadpart.txt`, lines 53–62, 91–95, 108–164, 185–194, 226–236.

Part body integrity is supported through Content-MD5/checksum headers; directory buckets do not support MD5. SHA256 is a Base64-encoded 256-bit checksum, not a whole-upload current-generation If-Match precondition. UploadPart exposes no If-Match in its captured request syntax; 404 NoSuchUpload covers invalid, aborted or completed IDs.

### E14 — CreateMultipartUpload introduction and Response Elements
Source S03: [https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_transport_scout-v3/sources/s3-api-createmultipartupload.html`.
SHA-256: `3f7f3e6a234b8e37d9a7a39e8cf5cac2f3e486acbb67f6356fde8a919c5b8d48`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/03-s3-api-createmultipartupload.txt`, lines 11–29, 565–579.

The upload ID groups all parts for a particular multipart upload; the key and ID are returned/bound separately. Incomplete multipart uploads may be aborted automatically by configured lifecycle rules; directory buckets do not support S3 Lifecycle. The captured page does not publish a final ETag composition recipe or SDK retry-count bound.

### E15 — rename(2) DESCRIPTION, ERRORS/EXDEV and BUGS
Source S04: [https://man7.org/linux/man-pages/man2/rename.2.html](https://man7.org/linux/man-pages/man2/rename.2.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_transport_scout-v3/sources/man7-rename-2.html`.
SHA-256: `8772946a809a0db54f4854f200908f10bee758ea452e8df5efd955bc3b8e6e57`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/04-man7-rename-2.txt`, lines 30–46, 190–193, 233–239.

Open descriptors for oldpath are unaffected by rename. Existing newpath is atomically replaced without a missing-path gap; an existing destination has an instance retained on ordinary failure. EXDEV rejects different mounted filesystems. NFS BUGS warns failure can follow a successful rename when a server crash and retransmitted RPC occur; it does not say NFS rename is non-atomic.

### E16 — open(2) DESCRIPTION and O_TRUNC
Source S05: [https://man7.org/linux/man-pages/man2/open.2.html](https://man7.org/linux/man-pages/man2/open.2.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_transport_scout-v3/sources/man7-open-2.html`.
SHA-256: `d665489cadb85624d98fae03a8d8d06209030f32735cff8aeba949ad8491c789`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/05-man7-open-2.txt`, lines 44–50, 385–393.

An open file description remains referenced by its descriptor when a pathname is removed or changed to refer to a different file. O_TRUNC reduces an existing regular file to zero length when opened O_WRONLY or O_RDWR. This establishes a possible concurrent-read hazard, not a mandatory mixed-byte result for every schedule.

### E17 — Atomic Commit In SQLite §§2, 3.5–3.12, 4.2, 5.2, 9.2, 9.5
Source S09: [https://www.sqlite.org/atomiccommit.html](https://www.sqlite.org/atomiccommit.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/sqlite-atomiccommit.html`.
SHA-256: `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/09-sqlite-atomiccommit.txt`, lines 156–171, 298–347, 350–432, 474–502, 591–595, 1000–1049, 1065–1098.

Rollback-journal content is recorded before modification, journal/data flushing and exclusive locking precede journal invalidation/commit, and a hot journal requires recovery. Directory sync is explicitly used in documented scenarios. Journal deletion is one commit mode; truncation/header invalidation are alternatives. Flush/storage assumptions can fail. These are a database-specific ordered discipline, not proof of a generic two-operation durable rename.

### E18 — Pro Git §10.2 Git Objects / Object Storage
Source S10: [https://git-scm.com/book/en/v2/Git-Internals-Git-Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M15-A/treatment/fresh_object_scout-v3/sources/git-objects-chapter.html`.
SHA-256: `2392ed9763af88229b885e6b9df7b71be550bb34d6be48243305328c73d6a07a`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/10-git-objects-chapter.txt`, lines 269–331, 468–516.

Git content addressing stores keys from SHA-1 of object header plus content; storing changed contents retains both example versions. This is a design precedent for identifying stable bytes, not a guarantee that hashing a mutable pathname creates an immutable snapshot. Chapter body contains no unreachable-object GC policy.

### E19 — fsync(2) DESCRIPTION, RETURN VALUE, ERRORS
Source S11: [https://man7.org/linux/man-pages/man2/fsync.2.html](https://man7.org/linux/man-pages/man2/fsync.2.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-fsync-2.html`.
SHA-256: `f0a986d21500222ecb69580fc7a910f346c6b1ff1005ca515501fb05bb5d91f5`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-fsync-2.txt`, lines 26–39, 51–75, 89–92.

File fsync does not necessarily persist the containing directory entry; the directory needs an explicit fsync. Thus flushing the new file before rename alone does not establish crash-durable publication. Filesystem/hardware support and syscall errors remain conditions.

### E20 — utimensat(2)/futimens(2) DESCRIPTION, timestamp permissions
Source S12: [https://man7.org/linux/man-pages/man2/utimensat.2.html](https://man7.org/linux/man-pages/man2/utimensat.2.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-utimensat-2.html`.
SHA-256: `d8cfbbcb7a7815d74313e02f9b0e20fcfc087bc955b197dd44b30f20ff4fbd64`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-utimensat-2.txt`, lines 30–66.

An owner or privileged caller can set the modification timestamp, and UTIME_OMIT can preserve it. Different equal-length byte sequences can therefore have equal size and chosen equal mtime; a timestamp can also change without the desired content changing. This supports the metadata-identity rejection as an inference, not an observation about this app.

### E21 — AbortMultipartUpload introductory semantics
Source S13: [https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html](https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-s3-abortmultipartupload.html`.
SHA-256: `dce987a4dd51d5f0c41f1efa579e28b05b8c585bcc879f5e503d242c524d0d02`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-s3-abortmultipartupload.txt`, lines 6–13, 42–47.

In-flight part uploads may still finish during abort; repeated aborts and an empty ListParts check can be necessary to establish all storage was freed. The request uses the specific key/uploadId. A disconnected client cannot equate locally stopping attempts with remote cleanup confirmation.

### E22 — S3 User Guide: Full object and composite checksum types; multipart ETag note
Source S14: [https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html).
Primary path: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-s3-object-integrity-upload.html`.
SHA-256: `120bba4c5fffd1ffa8a57aa6e08d1adad866decadc331a77ab195afb27d73c11`.
Review text: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M15-A/treatment-v3/sources/additional-s3-object-integrity-upload.txt`, lines 108–115.

Public AWS documentation describes a multipart ETag derived from part MD5 digests and a part-count suffix. This refutes the global claim that those semantics are unpublished; the original two API pages alone did not specify them. An ETag still cannot be treated as this proposal’s whole-file SHA-256.

## Versions, provenance and blinding

- **S01**: RFC 9110 / STD 97, Standards Track, June 2022. HTML §§8.8.1–8.8.3, 9.2.2, 10.2.3, 13.1.1, 13.1.5, 14, 15.3.7, 15.5.17; relevant rules cross-checked against mapped text rendition. RFC obsoletes 7230 in part, 7231, 7232, 7233 and 7235, not 7234.
- **S02**: tus protocol header 1.0.0, Date 2016-03-25; published 1.0.x web page. Read core and creation, checksum, expiration, termination and concatenation conditions. Rendered/raw master relevant semantics agree; neither is an immutable repository tag. Raw HTML contains 46 Upload-Offset occurrences, not index claims of 24 or 48.
- **S03**: Amazon S3 CreateMultipartUpload API, 2006-03-01 XML namespace; captured unversioned latest documentation. Create/upload/session binding, completion/abort storage lifecycle, configured lifecycle abort, directory-bucket limits. Page HTML is 108900 bytes. No SDK retry behavior or final-object ETag algorithm specified here.
- **S04**: Linux man-pages 6.19, page date 2026-02-08, HTML rendering 2026-09-09. DESCRIPTION explicitly preserves open descriptors; replacement/failure rules; same-mounted-filesystem EXDEV restriction; BUGS concerns ambiguous NFS failure results, not a declaration of non-atomic NFS rename. No fsync/durability contract.
- **S05**: Linux man-pages 6.19, page date 2026-02-08, HTML rendering 2026-09-09. DESCRIPTION open file description survives a pathname referring to another file; O_TRUNC regular-file/write-mode conditions; O_EXCL creation and NFS conditions; O_APPEND NFS caveat; stable directory-fd rationale. API prose, no observed application behavior.
- **S06**: RFC 9110 / STD 97, Standards Track, June 2022, plain-text rendition. Independent mapped view of S01. Source-index TOC/body locators were relocated to actual body. The complete retry section, range units/content coding, If-Match/If-Range, 200/206/416 and combining-parts rules were checked.
- **S07**: tus protocol 1.0.0 header, Date 2016-03-25; captured mutable GitHub master markdown. Index date 2016-03-24 is wrong. Read core plus optional extension conditions, including no-store HEAD, PATCH actual stored-byte offset, checksum algorithm negotiation, expiration, termination, and concatenation order/metadata. Header version alone does not freeze an original release.
- **S08**: Amazon S3 UploadPart API, 2006-03-01 API namespace, unversioned latest documentation capture. Full operation semantics and request/response conditions relevant to resume, uploadId/key/partNumber, same-number overwrite, per-part integrity, ETag completion binding, NoSuchUpload, and cleanup. HTML is 67235 bytes. No If-Match or whole-upload identity precondition is documented on this operation; SDK retry bounds absent.
- **S09**: SQLite Atomic Commit In SQLite; page updated 2026-04-21 10:28:59Z. Checked §§2, 3.5–3.12, 4.2, 5.2, 7, 9.1–9.5. Rollback journal/exclusive-lock/database-flush assumptions and alternate journal invalidation commit points matter. Directory syncing is described. No claim that this is an upload design or a fsync-then-rename recipe.
- **S10**: Pro Git second-edition web chapter 10.2, Git Objects; unversioned capture. Read authored chapter body, key-value content addressing, SHA-1(header+content), two stored versions, tree/commit and object storage. GC/reflog expiry not treated by this chapter; tutorial is primary project documentation, not a normative immutability or collision guarantee.
- **S11**: Linux man-pages 6.19, 2026-02-08; version/date also independently read through web tool. One public HTML prose page; no downloaded code executed; Linux/POSIX contract, no crash test or hardware guarantee
- **S12**: Linux man-pages 6.19; page date 2025-10-29. Additional bounded reviewer primary-document check; server HTML only; no code execution, accounts or service operations
- **S13**: Amazon S3 API reference, API namespace 2006-03-01, current HTML captured 2026-10-07; no immutable doc revision. Additional bounded reviewer primary-document check; server HTML only; no code execution, accounts or service operations
- **S14**: Amazon S3 User Guide, current public HTML captured 2026-10-07; no immutable documentation release ID. Reviewer bounded check of the claim that S3 multipart ETag semantics are unpublished. Current page may postdate candidate capture; no implementation validation or code execution; code examples left inert. Web cached view separately reports crawl three weeks ago.

Method/arm blinding is incomplete: treatment/scout/synthesis paths and final line 3 expose the method. Candidate-selected indices, identities and dispositions were treated as untrusted claims. No cost, winner, other arm/case, parent analysis, prior findings or campaign history was supplied or consulted. This is the first review of these bytes, with no regrade/rescue, candidate feedback, delegation or native Goal. No pending children.

Capture timestamps and acquisition/reverification claims in candidate indices cannot be independently authenticated from source files alone. All mapped hashes and document headers/semantics were checked. Additional reviewer fetches have UTC timestamps and raw hashes in `sources/additional-source-index.json`. No application fault injection was executed; V1–V3 are evaluated as proposed checks. Hardware/filesystem behavior, deployed server capability and actual app writer/read-handle discipline remain deployment questions rather than fabricated observations.

Review completed: 2026-10-07T21:33:55.834593+00:00. Deadline: 2026-10-07T21:41:44.512741+00:00. Expiry was not encountered.
