# Independent Critique — Interrupted-upload archive accession

## Review boundary and result

I reviewed the complete original brief, the complete investigator package named in input-map.json, the released revealed-plan.md and plan-reveal.json, and the investigator source index and source map. I independently checked consequential governing claims against the primary sources linked in [the critic source index](sources/index.md); the exact source identities and conditions are in [source-map.json](source-map.json). Critic IDs C01-C19 are separate from, and do not silently rebind, investigator IDs S01-S19.

The revealed discovery and plan bytes match the hashes recorded in plan-reveal.json: discovery SHA-256 42a82081247090e0679e0826c3d84a8f1d6a55a5314c6f8c07c35f6b7ecf5bc9 and revealed-plan SHA-256 13c9e444018c0578380616e96b0a5df493431b8ba1148aec08fdb68c50b05c7f. This local integrity check confirms which inputs were reviewed; it is not product validation.

The proposal corrects the revealed plan's broad S3 assumptions and preserves the named owner choices and negative constraints. I found no material wrong consequential claim in the sources independently checked and no unsupported claim presented as observed archive behavior. Two material incompletenesses remain, one conditional on the additive reading of the brief. Two smaller precision points are noted below. No final was written or repaired in this critic stage.

## Findings

### CI-01 — Material incomplete: checksum part-number condition is omitted from the proposal

**Locator:** draft.md, “Single request versus multipart limits” and “Interruption, abandoned parts, checksums, duplicates, and receipt”; compare discovery.md checksum row and investigator source-map.json S05.

The proposal accurately gives AWS's multipart full-object checksum algorithm scope, warns about the initiation-time algorithm condition, and rejects ETag as whole-object MD5. However, it omits a governing condition carried in the discovery and source map: when AWS multipart checksums are used, part numbers must be consecutive beginning at 1. AWS's integrity guide applies this to checksummed multipart operations; the multipart overview also warns that nonconsecutive numbers can fail completion. This condition affects how the proposed part plan and completion manifest must be formed. Its omission is material because the proposal relies on the checksum flow and discusses persisting a part plan without carrying through this constraint. The condition is AWS-specific and does not establish behavior for the unknown archive provider. See C03 and C12.

### CI-02 — Material incomplete on an additive reading: tus is counted twice

**Locator:** draft.md, “Two realistic routes and an analogous resumable mechanism,” Route B and the following “Analogous transfer mechanism” subsection; revealed-plan.md obligation 2.

The draft has two real intake paths: browser direct to object storage and browser through an archive tusd service to object storage. It then names tus offset-based resumability as the analogous mechanism, but that mechanism is the same protocol already used for Route B. The brief says “two realistic intake routes and one analogous resumable-transfer mechanism”; read additively, it asks for a separately compared analogous mechanism. On that reading the current draft does not provide three distinct comparisons. If the phrase allows one route itself to be the analog, the draft may satisfy it, but it does not state that interpretation. This is a scope ambiguity with a concrete completeness risk, not evidence that either researched route is infeasible. The user's brief remains the authority; this critique does not prescribe reducing scope.

### CI-03 — Minor locator/wording: sizing illustration uses 40 GiB while the brief says 40 GB

**Locator:** discovery.md, AWS multipart row; draft.md, “Single request versus multipart limits.”

The 8,192-part calculation is exact for 40 GiB divided into 5 MiB parts. The brief's stated maximum is 40 GB. If GB is decimal, the count at the minimum part size is about 7,630 instead. Either illustration is below AWS's 10,000-part ceiling, and the draft correctly says exact bytes and provider constraints must drive sizing. Label 40 GiB as a conservative example rather than the pilot maximum; this is a precision issue, not a changed recommendation.

### CI-04 — Minor locator/wording: make the small-file selection policy explicit

**Locator:** draft.md, recommendation and Route A.

The draft cites Uppy’s default multipart threshold of files larger than 100 MiB, but the pilot starts at 20 MB and the recommendation is phrased as preferring “browser-to-object-store multipart.” Under the cited Uppy default, a 20 MB file uses the single-request path unless the threshold is overridden. The route comparison correctly distinguishes this library default from storage limits, but the recommendation leaves the intended single-request/multipart selection policy implicit. This is a local design choice; no archive threshold can be selected before provider/API confirmation. See C01, C02 and C05.

### Other classifications

- **Material wrong:** none found among consequential claims I independently checked.
- **Unsupported:** none found presented as an observed provider/archive behavior. Local design choices such as accession reservations, idempotency, and receipt contents are described as proposals or inferences rather than S3 guarantees.
- **Honestly unresolved external input:** provider/product/version and supported API subset; actual checksum retrieval/validation and conditional-write behavior; browser CORS and signing configuration; cleanup and retention policy; and cost assumptions. The storage owner and accession curator are assigned these decisions in the brief, and the draft correctly leaves them open.

## Obligation-by-obligation and exact-plan review

| Obligation | Revealed-plan assumption or gap | Critic assessment of draft.md |
|---|---|---|
| 1. Single request vs multipart, with exact operation and product/version | Plan asserts a 5 GB limit on every route without operation evidence. | Correctly rejects that claim; separates AWS single PUT (5 GB), console (160 GB), and multipart (guide 5 MB–50 TB versus quota 48.8 TiB), and preserves the R2 5 TiB / 4.995 TiB page difference. Checksum and completion caveats are appropriately AWS/client scoped. Material omission CI-01 remains: the consecutive-from-1 part-number condition is not in the proposal text. |
| 2. Two intake routes and an analogous mechanism | Plan names browser intake and an unchecked MinIO client route. | Adds useful, realistic direct-to-store and server-relay routes, differentiates CORS/browser persistence from storage limits, and treats MinIO/AWS as leads only. The tus protocol is used for Route B and then repeated as the analog; CI-02 records the additive-reading risk. |
| 3. Interruption, orphan parts, checksums, duplicates and receipt | Plan accepts successful requests, treats ETag as checksum, and delays cleanup. | Corrects each: durable upload/part state, paginated reconciliation, explicit abort plus configured cleanup, checksum scope, idempotent accession reservation, provider conditional-write caveats, and receipt only after final-object verification. AWS completion body errors are distinguished from status alone. |
| 4. Released compatibility history | Plan has no versioned history and overgeneralizes compatibility. | The MinIO issue/fix is bounded to single PutObject and later checksum retrieval, and the draft does not pretend the code commit is a packaged release. The separate released tusd v2.10.1 deferred-length S3-store fix is pinned to its tag and path. This satisfies the history requirement without claiming the archive runs either product. |
| 5. Optional curator-authorized CLI fallback | Plan correctly says “supported” means allowed scope, not proven capability. | Retains the option conditionally, investigates AWS CLI defaults and endpoint controls, and does not call them proof of compatibility. It is neither silently removed nor made mandatory. |
| 6. Owner decisions and costs | The named storage-owner and curator authorities remain unresolved; costs must not be invented. | Preserves both decision owners, names their open questions, and treats cost as unresolved input with categories for later comparison. |
| 7. Negative constraints | No real films, bucket/credential creation, universal S3 assumptions, or acceptance from progress alone. | Preserved explicitly; no real or synthetic transfer or live write is claimed. |
| 8. Coherent evidence-backed proposal and validation table | Plan is explicitly not an adequate proposal; its demos are only ideas. | The proposal is coherent and addresses all eight topics, alternatives, owner inputs, source applicability and useful discoveries. The table separates read-only research/process checks from NOT_RUN or proposed product checks. The two material incompletenesses above still need adjudication in any later final stage. |

## Evidence, applicability and validation status

The source review supports the draft's central operation boundaries: AWS's live guide assigns different limits to PutObject, console upload and multipart; AWS checksum behavior has explicit algorithm, type and part-number conditions; CompleteMultipartUpload can embed an error after an initial 200; Uppy browser recovery is limited independently of service part limits; tus checksum covers a PATCH body; and the pinned tusd backend has concrete disk, consistency, locking and R2-specific part-size conditions. The R2 pages really do preserve the distinct 5 TiB and 4.995 TiB wording. The source index keeps the MinIO report, code commit, and released tusd tag separate. See C01-C19 for exact locators and qualifications.

**Executed in this critic stage:** read-only review of the listed artifacts and public primary sources; SHA-256 recomputation of the frozen discovery and revealed plan, matching the release record. I did not run an upload, install or call a product/service. I did not independently rerun the investigator's claimed JSON parse or release helper; their recorded outputs are process claims, not product validation.

**Proposed or NOT_RUN:** provider compatibility, synthetic interrupted transfers, checksum corruption/retrieval, completion-error parsing against the selected provider, duplicate/race behavior, browser reload/reselection, CLI integration, tusd deployment capacity/locking/expiry, and end-to-end receipt ordering. The draft correctly presents these as future authorized staging checks, not completed product tests.

## Native Goal observation at artifact save

Exactly one native Goal was created before substantive review with the frozen objective:

> ER12 critic stage, run A4-01-treatment: execute ER12_RUNTIME/runs/A4-01/treatment/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.

Direct fields returned by get_goal at 2026-10-10 04:24:59 UTC: threadId 01a12406-2a97-78b0-8213-02fd57fd045e; status active; tokensUsed 168846; timeUsedSeconds 516; createdAt 1791605782; updatedAt 1791606299. The objective and active state were also returned directly by create_goal. Goal provenance is UNKNOWN. Timestamp values are preserved as returned; timezone interpretation is UNKNOWN. This record was saved before native Goal completion and asserts no terminal result.
