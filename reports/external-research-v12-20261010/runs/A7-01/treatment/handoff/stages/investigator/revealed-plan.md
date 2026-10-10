# Concealed draft plan — Community workshop printable-project handoff

## Access and status

ROOT-STAGED PLAN INPUT. Withhold this document, its product hints and this fixture's index entry from the brief-only investigator until discovery has been saved. This is a fallible, realistically incomplete sandbox draft to compare against research, not an assessor key. All external behavior claims below are unverified draft assumptions. No implementation, source inspection or product validation has been executed in preparing the draft.

## Pilot intent

A makerspace wants members to hand off small 3D-print projects so another member can inspect the intended geometry, units, materials and assembly relationships before slicing. Members use different CAD tools and slicers. The package should preserve the author’s intent while identifying application-specific settings as such. The pilot is ten noncritical decorative projects.

The team has tentatively discussed 3MF-capable PrusaSlicer or Cura workflows. These are investigation leads, not selected winners. The mechanism needing investigation is geometry package metadata, extension compatibility and slicing separation; a useful historical inquiry concerns released importer/exporter or extension-loss regressions. Do not let these leads prevent discovery of a better fit or an analogous mechanism.

## Exact obligations and current draft treatment

### 1. Compare two CAD-to-slicer handoff routes and an analogous portable-package mechanism with clear interoperability tradeoffs.

Export STL as the complete project record and reconstruct units from a filename. Treat material names as a separate verbal handoff.

### 2. Explain geometry units, object/assembly relationships, materials and application-specific settings; separate design intent from machine instructions.

PrusaSlicer and Cura are listed as receiving tools without testing their package boundaries. A richer package is optional but currently unspecified.

### 3. Identify supported optional preview or metadata capabilities without treating every extension as universally portable.

Retain a preview and project note. Presume any shared package settings are portable to all printers; extension loss has no reporting rule.

### 4. Investigate a relevant released importer/exporter issue or format-compatibility change and its effect on the pilot.

No released importer/exporter history has been read. Opening one file in one slicer is the only proposed acceptance check.

### 5. Preserve and investigate this supported optional scope: a package preview image and human-readable project note for reviewers without the author’s CAD tool. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.

Retain a package preview image and human-readable project note for reviewers without the author’s CAD tool as supported owner-authorized optional scope. Support here means that the brief explicitly permits it; technical support, conditions and interoperability still need research. Do not remove it merely because the baseline route lacks it, or silently promote it to mandatory scope.

### 6. Make owner decisions explicit: The project author owns intended units and materials; the workshop technician owns printer settings. The pilot lead selects a tested receiving-tool matrix rather than claiming universal compatibility.

Owner authority is reserved as follows: The project author owns intended units and materials; the workshop technician owns printer settings. The pilot lead selects a tested receiving-tool matrix rather than claiming universal compatibility. The draft has not obtained these decisions. Its tentative implementation assumptions cannot substitute for them.

### 7. Preserve negative constraints: Do not operate printers, design safety-critical parts, assume STL preserves every project property, or treat saved slicer settings as approved instructions for every machine.

Binding exclusions: Do not operate printers, design safety-critical parts, assume STL preserves every project property, or treat saved slicer settings as approved instructions for every machine. The draft has no complete trace showing that its assumptions comply; revise the proposal wherever necessary to preserve these exclusions.

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
