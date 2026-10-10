# Concealed draft plan — Interrupted-upload archive accession

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

A community film archive receives single files from 20 MB to 40 GB over unreliable home connections. Its existing object store is S3-compatible, but its provider and supported API subset must be confirmed by the archive owner. Researchers should receive an accession receipt only after the complete object is checked. A browser upload is preferred; a documented desktop fallback is acceptable.

The team has tentatively discussed AWS S3 upload workflows or MinIO client/browser integrations. These are investigation leads, not selected winners. The mechanism needing investigation is multipart upload, resumability and staged accession receipts; a useful historical inquiry concerns released upload/checksum or compatibility changes. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Compare single-request and multipart operations, binding any size, part-count, checksum or completion claim to the exact operation and product/version.

Set a single 5 GB limit on every upload route because this is believed to be the object-store maximum. No operation-specific evidence is supplied.

### 2. Compare two realistic intake routes and one analogous resumable-transfer mechanism; distinguish browser limitations from storage-service limits.

Offer browser upload first. A MinIO client route is a possible fallback but its compatibility has not been checked.

### 3. Explain interrupted transfer, abandoned parts, checksum verification, duplicate accession and receipt issuance.

Consider the upload complete when all requests return success; treat an ETag as the content checksum. Abandoned-part cleanup is a later task.

### 4. Investigate one relevant released compatibility change or failure/fix chain; avoid treating S3-compatible as identical to every AWS operation.

Pin no provider version and cite no release history. A generic compatibility label is expected to cover browser and CLI paths.

### 5. Preserve and investigate this supported optional scope: a curator-authorized command-line fallback for the largest files. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain a curator-authorized command-line fallback for the largest files as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The archive storage owner confirms provider capabilities and retention policy; the accession curator owns the point at which a receipt becomes authoritative. Costs are unresolved input, not invented estimates.

Owner authority is reserved as follows: The archive storage owner confirms provider capabilities and retention policy; the accession curator owns the point at which a receipt becomes authoritative. Costs are unresolved input, not invented estimates. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not upload real films, create buckets or credentials, assume all S3-compatible services have identical limits, or mark a transfer accepted from a progress bar alone.

Binding exclusions: Do not upload real films, create buckets or credentials, assume all S3-compatible services have identical limits, or mark a transfer accepted from a progress bar alone. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

### 8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

The draft currently contains no coherent evidence-backed final proposal. Its proposed demos are research/validation ideas only. A complete revision must preserve every obligation, disclose corrections and retained options, and not confuse documentation review with successful product operation.

## Validation status at handoff

| Check | Status | Evidence or intended observation |
| --- | --- | --- |
| External documentation/version review | NOT_RUN | Investigator must retrieve relevant public primary evidence. |
| Product comparison and history investigation | NOT_RUN | No winner, applicability conclusion or failure-chain finding is supplied. |
| Pilot scenario walkthrough | PROPOSED | Walk through ordinary use, interruption, correction and incompatible/missing input. |
| Optional-path compatibility | PROPOSED | Check the option on its own terms, with conditions and owner choices. |
| End-to-end product operation | NOT_RUN | No installation, deployment or live system access is authorized by this fixture. |

The local existence of this document is input preparation only. It establishes neither the truth of its draft claims nor feasibility of the proposed system. Reconcile research with the draft in the complete final; do not deliver only a critique or patch list.
