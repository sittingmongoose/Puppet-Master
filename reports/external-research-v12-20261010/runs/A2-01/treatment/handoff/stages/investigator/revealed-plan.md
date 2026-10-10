# Concealed draft plan — Reconnect-safe volunteer observation intake

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

A small ecology charity has 25 volunteers surveying footpaths with intermittent connectivity. Each visit records a site code, observation time, structured answers and up to three photographs. Coordinators need to reconcile late submissions and corrected observations without overwriting the original record. Devices are personal Android phones; an occasional desktop import is acceptable.

The team has tentatively discussed ODK Collect/Central or KoboToolbox. These are investigation leads, not selected winners. The mechanism needing investigation is offline form queues, revision identity and attachment transfer; a useful historical inquiry concerns released fixes or issue chains involving reconnect, duplicate submission or edited forms. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Explain how offline creation, retry, late arrival and an explicit correction become distinct coordinator-visible states.

Start with a single online form and instruct volunteers to retry failed sends. A retry is presumed to create the same record; identifiers and correction behavior are not yet specified.

### 2. Compare two usable survey products and one analogous queue/synchronization mechanism, including deployment and export tradeoffs.

ODK is the initial shortlist entry. Kobo is named for later comparison; no deployment or export evidence has been inspected.

### 3. Bind observations to site, visit, form version and attachment identity; address device-clock uncertainty and duplicate detection.

Use the device timestamp as visit identity and filename as photo identity. The coordinator will deduplicate a weekly export manually.

### 4. Describe a bounded failure/release-history example relevant to reconnect or correction, and its actual applicability.

Assume a recent release resolves intermittent-network problems. No released-version or issue-chain investigation is attached.

### 5. Preserve and investigate this supported optional scope: coordinator-reviewed CSV import of legacy observations. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain coordinator-reviewed CSV import of legacy observations as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The field coordinator accepts duplicates for investigation; the data steward decides whether a correction replaces the current view or appears beside it. No silent automatic merge is approved.

Owner authority is reserved as follows: The field coordinator accepts duplicates for investigation; the data steward decides whether a correction replaces the current view or appears beside it. No silent automatic merge is approved. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not require volunteers to remain online, infer precise location from photographs, change personal-device settings, or propose remote deletion of their originals.

Binding exclusions: Do not require volunteers to remain online, infer precise location from photographs, change personal-device settings, or propose remote deletion of their originals. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

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
