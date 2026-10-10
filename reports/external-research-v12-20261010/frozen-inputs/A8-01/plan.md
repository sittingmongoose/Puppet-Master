# Concealed draft plan — Revision-aware exhibition asset deposit

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

An independent gallery needs to preserve the final digital assets for a series of exhibitions: photographs, captions, installation diagrams and catalogue PDFs. Staff may deposit a corrected caption later without losing the earlier deposit. They need a small, inspectable package and a documented way to confirm that a copied deposit is intact. Storage is ordinary local disk plus an existing offsite copy; no new preservation platform is required.

The team has tentatively discussed BagIt-oriented packaging or OCFL-oriented repository tooling. These are investigation leads, not selected winners. The mechanism needing investigation is fixity manifests, version inventory and custody receipts; a useful historical inquiry concerns released manifest/path-handling or version-recovery failures. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Compare two preservation packaging/versioning approaches and an analogous content-identity/custody mechanism suitable for a small gallery.

Create a ZIP for each exhibition and call it immutable once named final. Overwrite a corrected caption inside the current ZIP.

### 2. Explain logical asset identity, corrected versions, manifests and separation of integrity from provenance or completeness.

BagIt is a candidate; OCFL is mentioned without comparing repository versus transfer-package responsibilities.

### 3. Describe a bounded copy/restore validation design and explicit behavior for missing files, changed names or manifest mismatch.

Use one archive checksum as proof that all expected assets are preserved. Retain the optional human inventory, but no reconciliation or restore procedure is specified.

### 4. Investigate a relevant released path/manifest/version-history issue and explain its impact on ordinary local/offsite storage.

No path/manifest history has been investigated. A future successful copy is expected to establish provenance and recovery.

### 5. Preserve and investigate this supported optional scope: a human-readable exhibition inventory that remains usable without specialist repository software. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain a human-readable exhibition inventory that remains usable without specialist repository software as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The exhibition registrar owns completeness and version relationships; the storage custodian owns copy/restore practice. Hash algorithm and package depth are explicit recommendations for owner choice, not a presumed mandate.

Owner authority is reserved as follows: The exhibition registrar owns completeness and version relationships; the storage custodian owns copy/restore practice. Hash algorithm and package depth are explicit recommendations for owner choice, not a presumed mandate. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not move gallery originals, create storage accounts, claim a checksum establishes authorship or backup recoverability, or replace the existing offsite copy with an untested platform.

Binding exclusions: Do not move gallery originals, create storage accounts, claim a checksum establishes authorship or backup recoverability, or replace the existing offsite copy with an untested platform. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

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
