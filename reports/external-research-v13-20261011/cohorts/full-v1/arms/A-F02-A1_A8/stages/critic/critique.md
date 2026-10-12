# Independent critic review — Oral-history intake and transcript handoff

## Scope and overall assessment

This review covers the complete released brief, the frozen investigator discovery and draft, the carried source map/index, and all 23 clauses of the single revealed plan in the critic input map. The draft is a research proposal, not an implementation. Its central approach is well scoped: keep intake decisions, probe state, playback state, transcript state, and permissions separate; preserve source bytes and correction history; compare parser options against museum data before choosing; defer the catalog adapter until its interface is known; and keep validation proposed rather than claiming it ran.

The draft meets most brief obligations and handles the plan's unsafe automatic transcript match and assumed movable-path references with appropriate caution. It does not make a corpus-specific parser or catalog decision from generic evidence. I found one **material incomplete** operator-message rule, one **minor locator/wording** issue in the BagIt validity summary, and one **minor locator/wording** overbroad plural description of a single open duration report. The museum's identifier contract, rights vocabulary, platform, transcript formats, storage limits, and catalog behavior remain **honestly unresolved external inputs**. I found no material wrong technical recommendation and no material unsupported product-support claim after checking the cited primary sources. These findings do not endorse or replace the draft.

## Review findings

### FI-01 — Material incomplete — playback failure cause in operator status

**Draft locator:** Proposal, paragraph beginning “A file whose read/probe actually fails”; also the File access / probe and Preview rows of the status table.  
**Evidence:** FFprobe's selected error output reports an error encountered while probing, without making the cause a universal media-readability verdict [SRC-01]. The HTML Standard's media-error example separates abort, network, decode (including corruption or unsupported browser features), and source-not-supported (including network/server failure or unsupported format) cases [CR-01].  
**Assessment:** The draft correctly gives probe and preview separate fields and says to preserve diagnostics. Its sample preview message, however, labels a parser-successful file that the player cannot play as “Preview unavailable for this format.” Player failure can have causes besides format support. If that text is applied without a known cause, it can label a damaged or inaccessible preview path as a format limitation. Keep the distinction required by the brief, while conditioning the format-specific wording on an observed unsupported-format reason. When the cause is unknown, preserve a generic preview-unavailable state and diagnostic. Reserve unreadable/read-error wording for evidence that the media could not be read; a probe error or absent field alone is not that evidence.
**Plan impact:** C10; the required unreadable-media versus unsupported-preview warning. This is material incomplete because the proposed visible message can state a cause that the cited source does not establish for every playback failure.

### FI-02 — Minor locator/wording — BagIt validity shorthand

**Draft locator:** Restart, export, and integration, BagIt paragraph; Proposed validation, Handoff row.  
**Evidence:** RFC 8493 requires bag completeness and verification of checksums in every payload manifest and every tag manifest present; it also requires every payload file to appear in each payload manifest [CR-04].  
**Assessment:** The draft's description of opaque payloads and checksummed payload manifests is sound, and BagIt is clearly only a candidate pending catalog-owner agreement. The phrase “the manifest” and the validation row's payload-hash-only wording are shorthand for a valid BagIt bag. A full BagIt-validity claim also depends on required elements and any tag manifests present. Clarify that distinction if the proposal uses “valid BagIt bag”; a custom directory plus its own verified payload manifest can remain a separate proposal.
**Plan impact:** C12/C14. Minor, because no BagIt implementation or conformance claim is made and the proposed package remains subject to an owner-approved interface.

### FI-03 — Minor locator/wording — duration issue scope

**Draft locator:** Format, metadata, and alternatives, MediaInfo paragraph; selected SCW-05.  
**Evidence:** MediaInfo issue #373 remains Open at review access. It contains one user-reported QuickTime/MOV sample, mv8612.mov, with an overall duration of 54:45 and an audio duration of 28:31 versus source duration of 54:45; the report asks about a tkhd/mdhd discrepancy. A maintainer asks whether the audio plays past 30 minutes and notes that playback may honor an edit list [CR-06]. This is an issue report, not a general format rule or a confirmed MediaInfo defect.
**Assessment:** The proposed practice of retaining duration facts with source field/scope and surfacing conflicts is prudent and pilot-testable. The draft should describe the evidence as one open report/example rather than implying multiple confirmed files. This does not undermine the provenance recommendation.
**Plan impact:** C03/C14 duration handling. Minor scope wording.

### FI-04 — Honestly unresolved external input — identifier and catalog semantics

**Draft locator:** Identifier paragraph and Restart, export, and integration.  
The brief and revealed plan contain no spreadsheet, canonical ID column, cell types, actual identifier examples, destination catalog, or catalog import contract. The normalization rule in the plan can collapse strings that differ only in case or spaces, but the available evidence cannot establish whether those differences are meaningful museum identifiers or whether any real rows collide. Likewise, generic packaging documentation cannot decide whether the receiving catalog can resolve shared references after a handoff moves. The draft properly leaves the owner to establish those facts and proposes tests instead of claiming the decisions are settled. C05/C07 and C12 remain conditional on those inputs.

## SCW-6 v1 records

The five claims below remain the pre-source ordered selection recorded above. No claim was substituted after evidence review. Each record is below 250 words excluding its source identity.

### SCW-01 — Identifier equivalence

**Draft locator:** Identifier, transcript, permission, and channel rules, first paragraph.  
**Exact claim/context:** “Exact equality under the staff-selected rule is the default join. The plan’s lowercase-and-remove-spaces filename-stem rule can collapse distinct identifiers and has no corpus evidence. Until staff confirms uniqueness, treat normalized filename matching only as a suggestion that requires confirmation.”  
**Intended C:** The plan's transform is not injective over all possible identifier strings when case or spaces are identity-bearing; this demonstrates a collision risk, not an observed museum collision.  
**C* and one-selector delta:** “Under the museum's canonical identity contract, case and spaces are insignificant, so the transform does not merge distinct canonical IDs.” Selector: identifier-equivalence contract; old value is unspecified, new value is case/space-insensitive.  
**Evidence identity / scope-bearing excerpt / applicability:** input-map.json brief path ER13_RUNTIME/mechanics/dispatch-v1/admitted/A-F02-A1_A8/run/A-F02-A1_A8/inputs/brief.md, Intake paragraph (“a spreadsheet of recording identifiers and permissions”), and frozen revealed-plan.md C05 at ER13_RUNTIME/mechanics/dispatch-v1/admitted/A-F02-A1_A8/run/A-F02-A1_A8/stages/investigator/revealed-plan.md; the brief supplies no actual spreadsheet, schema, or rows. C05 proposes lowercasing/removing spaces and says uniqueness/consistent IDs are untested. As a direct property of that transform, “A B” and “AB” normalize alike, so C **ENTAILS** as a possible collision. It does not prove an actual museum collision. C* is **UNDETERMINED**: E does not define canonical ID semantics or provide data. No source absence is treated as proof.  

**Disposition:** Qualify unresolved; keep staff-confirmed association and collision checks as a proposal. No replacement join rule is established by E.  
**Affected obligation/decision:** Brief transcript-to-record association; C05/C07.

### SCW-02 — Preview failure diagnosis

**Draft locator:** Proposal, warning-state paragraph.  
**Exact claim:** “A parser-successful file that the preview engine cannot play should say ‘Preview unavailable for this format; metadata was read. Preview is optional.’”  
**Intended C:** When the chosen player has an observed format-support limitation after metadata probing succeeded, the format-specific message can describe optional preview without changing intake acceptance.  
**C* and one-selector delta:** The same message is appropriate when the player reports decode/corruption failure. Selector: playback failure cause; old value is known unsupported format, new value is decode/corruption failure.  
**Evidence identity / scope-bearing excerpt / applicability:** [CR-01](https://html.spec.whatwg.org/multipage/media.html#mediaerror), WHATWG HTML Living Standard (last updated 2026-10-09), §4.8.8 error example; accessed 2026-10-12T00:48:36Z and reopened 00:51:00Z. Exact excerpt: “corruption problem.” Full locator and record are in source-map.json. The example distinguishes decode from source-not-supported and includes several possible causes. For a known unsupported-format condition, C **ENTAILS** the scoped message. For decode/corruption, C* **CONTRADICTS** the format-specific cause asserted by that message; this web example does not define every native player's diagnostics.

**Disposition:** Scoped correction: retain separate probe and preview axes; use format-specific text only when that cause is known, and keep a generic preview-unavailable state when it is not.  
**Affected obligation/decision:** Required warning distinction; C10.

### SCW-03 — Channel audition platform

**Draft locator:** Identifier, transcript, permission, and channel rules, channel paragraph.  
**Exact claim:** “Thus isolated channel audition does not inherently require writing a converted preview file when the browser can decode the original.”  
**Intended C:** In a web client with successful decoding, route the media-element audio into a Web Audio graph and split its channels for audition.  
**C* and one-selector delta:** The same no-conversion feasibility holds for a native desktop client that decodes the source. Selector: UI/playback platform; old value is browser/web, new value is native desktop.  
**Evidence identity / scope-bearing excerpt / applicability:** [CR-02](https://www.w3.org/TR/webaudio-1.1/), W3C Web Audio API 1.1, §§1.15 and 1.22; accessed 2026-10-12T00:48:36Z and reopened 00:51:00Z. Exact excerpt: “simply splits out channels in the order that they are input.” Full locator and record are in source-map.json. The spec defines a media-element source and per-input-channel outputs. C **ENTAILS** as a web feasibility inference from this live graph path, conditional on browser decode. C* is **UNDETERMINED** because the Web Audio API does not specify a native decoder/player. Neither reading establishes support for every source format.

**Disposition:** Retain with the web/decode condition; qualify native playback as a separate owner/platform validation. No generic native replacement is supported by E.  
**Affected obligation/decision:** Two-channel handling and conversion decision; C13.

### SCW-04 — Timed versus untimed transcript

**Draft locator:** Identifier, transcript, permission, and channel rules, transcript paragraph.  
**Exact claim/context:** “W3C WebVTT gives cues explicit start/end timestamps relative to media playback [SRC-13]; that supports synchronized display when such a timed track is already supplied. Plain text has no cue timing, so do not invent alignment.”  
**Intended C:** For a supplied WebVTT cue track, preserve its cue offsets and use them for synchronization with the linked media.  
**C* and one-selector delta:** The cited WebVTT evidence supports synchronized display for a plain-text transcript with no time values. Selector: transcript timing format; old value is timed WebVTT cues, new value is untimed plain text.  
**Evidence identity / scope-bearing excerpt / applicability:** [CR-03](https://www.w3.org/TR/webvtt1/), W3C WebVTT 1, §4.4 cue timings; accessed 2026-10-12T00:48:36Z and reopened 00:51:39Z. Exact excerpt: “start time offset of the cue.” Full locator and record are in source-map.json. The spec defines both cue offsets and timestamp interpretation against playback. C **ENTAILS** for WebVTT cue timing. C* is **UNDETERMINED**: WebVTT defines its timed-cue format, not the semantics of every plain-text transcript. Its requirements do not establish another format's support or prove the absence of all possible timing metadata.

**Disposition:** Retain with the WebVTT/supplied-time scope; preserve other supplied formats as received and do not synthesize timing.  
**Affected obligation/decision:** Corrected transcript handling and plan C13; the brief does not require synchronized text display.

### SCW-05 — Duration-example scope

**Draft locator:** Format, metadata, and alternatives, MediaInfo paragraph.  
**Exact claim/context:** “Its issue history records QuickTime files whose container and track durations differ [SRC-06]. Preserve each duration value with its source field and scope (container, stream, or derived sample count); if they disagree beyond a chosen tolerance, report the conflict and have staff review it.”  
**Intended C:** One upstream issue report gives a QuickTime/MOV example where overall and audio duration values differ, illustrating a possible review case.  
**C* and one-selector delta:** The issue establishes differing duration behavior across every media/container format. Selector: format scope; old value is the reported QuickTime/MOV sample, new value is all formats.  
**Evidence identity / scope-bearing excerpt / applicability:** [CR-06](https://github.com/MediaArea/MediaInfo/issues/373), MediaInfo issue #373, opened 2019-08-16 and Open at 2026-10-12T00:52:25Z; issue body, mv8612.mov output. Exact excerpt: “Format : QuickTime.” Full locator and record are in source-map.json. The sample also reports overall and audio duration values that differ; the maintainer raises an edit-list/playback question. C **ENTAILS** that one report/example exists. C* is **UNDETERMINED**: a single open issue neither proves nor disproves a universal rule.

**Disposition:** Scoped correction: describe one open report, not a confirmed general parser defect. Keep provenance and conflict review as a pilot hypothesis.  
**Affected obligation/decision:** Duration extraction and review; C03/C14.

## SCW_NOT_RUN

No claim was omitted because of the six-claim cap; five claims were selected. Other reviewed concerns, including catalog-reference portability and BagIt validation scope, are handled in the ordinary critique and C12/C14 dispositions above.

## Brief-obligation coverage

| Brief obligation | Independent assessment | Draft locator / limitation |
|---|---|---|
| Volunteer intake accepts, holds, or rejects donated recordings with an accessible record | Covered as a human decision independent of probe/player state; proposed keyboard table and per-item trail | Status table; Accessibility and textual progress |
| Identify formats despite unreliable extensions; explain support boundaries | Covered through FFprobe, MediaInfo, optional Siegfried, and narrow libsndfile comparison; no museum-specific support asserted | Format, metadata, and alternatives; actual matrix remains a pilot task |
| Extract technical metadata and duration | Covered with raw fields, source scope, tool/build provenance, and conflict review | Format paragraph; FI-03 qualifies one example |
| Handle two channels carrying different speakers | Covered through channel count/layout/order and conditional per-channel audition; speaker identity is not inferred from count/layout | Channel rules; Web Audio claim is browser-only, native path unresolved |
| Associate absent, supplied, and corrected transcripts | Covered with explicit absent state, confirmed ID association, versioned corrections, retained history | Identifier/transcript paragraphs; actual ID and file-format semantics remain open |
| Restart a batch safely | Covered as per-item checkpoints, source/config fingerprints, copy/hash reconciliation, idempotency, and retry; external catalog upsert is deferred | Restart paragraph; tests are proposed |
| Portable catalog handoff | Covered as a directory with relative references, actual required bytes, checksums, and later adapter | Export paragraph; catalog API/acceptance unresolved; BagIt validity wording FI-02 |
| Distinguish unreadable media from unsupported preview | Partly covered; fields and diagnostics are distinct, but the sample format-specific text needs a known-cause guard | Proposal warning paragraph; FI-01 |
| Keep absent transcript separate from audio failure | Covered with “No transcript supplied” and separate transcript/audio axes | Proposal status table and warning paragraph |
| Keyboard operation and meaningful textual status | Covered as a proposal for every review action and accessible status; WCAG claims are conditional on web/markup, with native API mapping proposed | Accessibility and textual progress; no assistive-technology validation run |
| Support normal 40-item batch and possible 500-item batch | Scale is a proposed measurement, with no throughput promise | Proposed validation, Scale row |
| Preserve originals, do not infer permissions, no cloud transcription, no required transcode | All are explicitly preserved; missing rights remain unknown and rights-dependent use is blocked | Proposal, permissions, and channel rules |
| Compare feasible approaches and deliver staged research, not a migration | Covered; parser/catalog choice is deferred; work status correctly says no implementation or tests | Proposal, staged integration, Work actually executed |

## Exact released-plan disposition review

The table quotes each exact clause and checks the investigator's disposition against the brief and evidence. “Keep/correct” below is the draft's proposal, not an endorsement of museum policy.

| ID and exact plan clause | Critic assessment of draft disposition |
|---|---|
| C01 “The draft creates a batch manifest before examining recordings.” | Keep is sound. The draft creates per-spreadsheet-ID rows before probing and later routes missing/duplicate IDs to review. |
| C02 “Each entry stores the donation identifier, original path, permission text supplied by staff, byte hash, and separate probe and preview statuses.” | Keep and extend is sound. The draft adds provenance, transcript version, diagnostics, and intake state; no conflict with brief. |
| C03 “Original media are copied to an intake directory without alteration, then a format-probing process reports container, channels and duration.” | Keep with verification is sound. Hash verification and source-scope retention are appropriate; duration remains a reported fact, not verified listening time. |
| C04 “Preview generation is optional; a successfully cataloged original need not have a playable preview.” | Keep is sound and honors the no-required-transcode constraint. Staff/catalog acceptance conditions remain owner-defined. |
| C05 “A transcript is attached when its filename stem matches the recording identifier after lowercasing and removing spaces.” | Correct is sound as a rejection of automatic matching before semantics/uniqueness are known. The draft correctly leaves actual ID equivalence unresolved (SCW-01). |
| C06 “Later transcripts replace the current association while preserving the prior file in history.” | Correct is sound. A versioned association and staff-confirmed current pointer preserve the correction and its provenance. |
| C07 “This assumes normalized stems remain unique and the spreadsheet identifier is consistently present; neither condition has been checked.” | Retain as an explicit assumption is sound; the proposed owner sample and collision/missing-ID validation are relevant and unexecuted. |
| C08 “Permission fields can stay unknown and block release rather than being inferred.” | Keep and sharpen is sound. The draft distinguishes intake acceptance from rights-dependent release/use and preserves the raw value. |
| C09 “No cloud transcription is planned.” | Keep as a constraint is sound and consistent with the brief. |
| C10 “The proposed interface presents a keyboard-navigable table with text labels for accepted, needs review, unsupported preview and unreadable original.” | Keep/refine is sound; statuses should remain textual and distinct. FI-01 notes the format-specific preview wording still needs a diagnostic condition. |
| C11 “It leaves how progress announcements avoid overwhelming screen-reader users unresolved.” | Resolve by proposal and validate is sound. WCAG 2.2 supports keyboard access and status exposure in markup; announcement cadence remains a human-factors validation question [CR-16]. |
| C12 “Export is a directory with manifest, transcripts and media references; the receiving catalog is assumed to resolve those references after copying the folder.” | Correcting the assumption is sound. Relative references alone are portable only if their targets travel or remain reachable; the draft properly defers the actual catalog contract. FI-02 qualifies the BagIt-validity shorthand. |
| C13 “Channel-specific preview and timing alignment need investigation before deciding whether conversion is necessary.” | Partly resolved is sound. Web Audio supports a conditional web path; it does not answer native decoder behavior. WebVTT supports supplied timed cues, not arbitrary transcript formats (SCW-03/04). |
| C14 “Proposed validation covers renamed extensions, interrupted batch restart, corrupt files, stereo speakers, transcript corrections and keyboard/screen-reader review.” | Keep and expand is sound. The added integrity, permissions, handoff, scale, and status cases cover consequential risks. All remain proposals. |
| C15 “No collection files have been inspected and no validation has been executed.” | Keep is consistent with the stated work status; no collection data or validation result is claimed by the critic review. |
| C16 “This is a provisional draft for review after the declared reveal, not an endorsed answer.” | Keep is sound and preserves proposal status. |
| C17 “Resolve material assumptions through applicable primary evidence; retain open user-data questions when they cannot be answered from sources.” | Keep is sound. The draft distinguishes technical evidence from owner input; the critic does likewise. |
| C18 “Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes.” | Honor is consistent with the stage deadline and work completed within that envelope. |
| C19 “Finish earlier when the complete output is ready.” | Honor is consistent with completing the review and artifacts before expiry. |
| C20 “There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting.” | Honor is consistent; no waiting was used as research. |
| C21 “The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery.” | Honor is consistent; the assignment's absolute stage deadline governs the critic deliverable. |
| C22 “Output quality is assessed independently of elapsed time.” | Honor is consistent; the findings reflect evidence and scope, not elapsed time. |
| C23 “No future product deployment is requested.” | Keep is sound; this review recommends no deployment or migration. |

## Proposed versus executed checks

The investigator's parser comparison, 40/500-item throughput, crash/restart points, byte-hash checks, ID/transcript collision cases, rights cases, moved-package import, screen-reader review, and channel-specific audition are all **proposed validation**, not executed validation. The draft accurately says no collection files, implementation, migration, or validation tests were run. This critic reopened the cited primary sources and reviewed their governing conditions; it did not run downloaded code or perform product validation.

