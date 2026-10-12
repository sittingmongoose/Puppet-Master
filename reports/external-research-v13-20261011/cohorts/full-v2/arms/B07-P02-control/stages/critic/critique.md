# Independent critique — B07-P02-control

## Overall assessment

The investigator draft is a strong, scope-preserving proposal. It follows the released plan clause by clause, rejects the risky time and replacement assumptions, keeps annotation review possible without a transcript, and compares realistic alternatives without naming a proven winner. It distinguishes proposed validation from executed work. I found no material wrong correction and no unsupported conclusion that changes the proposal.

Two material items need sharper treatment before implementation: the exact media-coordinate contract and the accessibility announcement contract. Because the draft leaves engine, platform, codec list and seek tolerance open, these are incomplete implementation details and honest external inputs, not reasons to reduce scope. Other findings concern traceability.

## Findings

### Material incomplete — canonical time coordinate and player conversion

**Locations:** Draft “Media and timing limits”; plan P1.1 and P3.1 rows; MediaRevision and PlayerAdapter proposals; validation item 3.

The draft proposes exact per-revision coordinates in a rational timebase while allowing compressed media to use a decoder presentation timeline “where reliable.” It correctly separates stored-value precision from seek accuracy and proposes recording requested and actual positions. The cited GStreamer and Apple documentation confirm backend-specific precision/speed behavior; Web Audio describes decoded PCM at the audio-context rate. None selects a canonical mapping from a player cursor and decoder timeline to the persisted coordinate for the still-unknown formats and engines.

A rational or integer value can be exact in its chosen timebase without guaranteeing that decoder timestamps, timeline origins, priming/padding, seek tolerances, or the heard sample align with it. Before implementation, define per supported format how player position maps to stored media-relative time, the rounding rule, and how unreliable timelines are surfaced. Include non-zero starts and relevant decoder priming/edit-list cases for selected formats, and specify an owner-approved residual tolerance. The draft should avoid implying sample-accurate playback across all media. These are additions to the proposed media matrix, not conclusions available before platform and format choices.

### Material incomplete — announcement behavior needs an accessibility contract

**Locations:** P5.1/P5.2 rows; draft interaction and accessibility validation sections.

The proposal calls for announcements after explicit seeks, mark actions, save and errors, without focus changes or routine playback-tick speech. WCAG 2.2 SC 4.1.3 addresses programmatically exposed status messages without moving focus in markup-based content. The APG slider pattern provides key/value guidance and warns that assistive-technology behavior, especially touch slider behavior, needs testing. These sources do not define native toolkit announcement events for an unselected application platform.

The user-facing goals are sound, but saying the seek-announcement research obligation is “addressed” is ahead of the evidence: the investigator source map omits SC 4.1.3 and no toolkit/platform is selected. Add that criterion if a markup-based view is considered, then specify the equivalent announcement mechanism for any selected native toolkit and test that updates do not steal focus or repeat playback speech. Keep named time fields and buttons as the reliable route.

### Minor locator/wording — source-map details

**Locations:** Investigator source-map SRC-002 and SRC-005; investigator sources index SRC-011.

The Web Annotation Recommendation labels Text Position Selector as §4.2.5 (lines 973-993), not §4.2.10. The pinned Peaks API file does not itself establish the later v4.0.0-beta.2 prerelease statement; the separate upstream release list does. The investigator index’s Apple URL has an extra closing parenthesis. These are traceability defects, not substantive false corrections. This critique preserves SRC-001 through SRC-012 and adds separately identified supplemental entries in the accompanying source map.

## Exact plan disposition review

| Released clause | Assessment |
|---|---|
| P1.1 Stable ID, interval, text, recording hash | Retained and strengthened. UUID identity independent of interval and overlap-safe rows are appropriate. Keep milliseconds for display; complete the stored-coordinate contract above. |
| P1.2 Key marks position; another closes interval | Retained and expanded with named start/end-to-playhead actions and editable fields. No required shortcut chord or drag path is introduced. |
| P1.3 List navigation; overlaps stay separate | Retained. Equal-coordinate comments remain distinct; the list is the authoritative operation route. |
| P1.4 Text labels expose ranges | Retained with visible range text and non-color cues, matching the brief and WCAG color criterion. |
| P1.5 No transcript; source unchanged and never transmitted | Retained. No-transcript operation is complete; local-only/read-only processing, no remote audio service, and no save-back path are explicit. |
| P2.1 Supplied timed segments navigate to supplied starts | Retained with cue provenance and actual-seek reporting. Cues are not made into annotation anchors. |
| P2.2 Untimed transcript is searchable without inferred times | Retained. Text anchors remain text navigation only and are tied to transcript revision/context. |
| P3.1 Milliseconds assumed stable across formats | Correctly rejected as an unqualified premise. Backend precision and measured landing are surfaced; storage-to-player mapping remains incomplete until a platform/media matrix is selected. |
| P3.2 Same filename restores; warn only on duration change | Correctly rejected. Hash mismatch creates a distinct revision and requires explicit reviewed mapping; name and duration do not establish identity. |
| P4.1 Human-readable text export with file/hash/ranges | Retained and expanded with ID, duration, coordinate/timebase, overlaps, escaping and unresolved state. Text remains required; JSON is optional. |
| P4.2 Channel and media-relative basis undecided | Time is usefully made relative to the identified revision. Channel scope remains an honest owner decision, not an inference from waveform display. |
| P5.1 Predictable focus during playback | Retained and specified: ticks do not take focus; explicit events are announced at a restrained rate. Test results remain proposed. |
| P5.2 Research seek announcements and interval editing | Partly addressed: WCAG keyboard/color/focus and APG slider guidance help. Add status-message semantics and platform-specific toolkit research; no target behavior has been established. |
| P6.1 Proposed validation | Retained and expanded across overlap/identity, replacements, media formats, seeking, accessibility, privacy and export. All remain proposals; include coordinate and announcement cases above. |
| P6.2 No recordings or assistive-technology sessions used | Retained accurately. Source research is not presented as audio, accessibility or fidelity testing. |
| P7.1 Establish identity before controls | Retained. Media revision, timebase, transcript revision, mapping state and annotation IDs precede views. |
| P8.1 Provisional proposal; no deployment/recruitment | Retained; no unrequested deployment or recruitment is proposed. |
| P8.2 Common deadline; no minimum duration | Retained without adding a wait period. I did not independently audit the investigator’s reported completion timestamp. |

## Original-brief coverage and execution boundary

The draft addresses time representation and seeking, keyboard interval marking and direct editing, identity and overlap, transcript association, accessible navigation, local stereo/long-file constraints, and human-readable export timing. It compares an application-owned list/fields, Peaks.js, WaveSurfer.js, Audacity’s editor as a precedent, and selective W3C interchange. No alternative is described as a proven winner.

It preserves the explicit constraints: no required dragging, no color-only meaning, no invented transcript times, no modification of originals, and no remote audio transmission. Open decisions remain visible: target shell/platform, engine, supported codecs, seek tolerance, channel scope, scale limits, transcript authority, export format, and library/license/build fit.

The investigator reports no application tests, audio playback, assistive-technology session, export, or benchmark. I checked the listed primary documentation, pinned upstream API/caller/source pages, and release history independently. I did not run downloaded code, upstream tests, a player, audio, screen readers, or any proposed validation. All validation remains proposed, not executed.
