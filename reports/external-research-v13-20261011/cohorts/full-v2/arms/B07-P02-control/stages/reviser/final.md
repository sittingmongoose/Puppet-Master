# Proposal: accessible local recording review annotations

## Recommendation

Build the workflow around a local, immutable media revision and a keyboard-operated annotation list with named start/end controls. Each comment is its own record with a stable ID and half-open interval, including when ranges overlap or coincide. A waveform and transcript can add navigation routes to the same records; neither is required to create, edit, navigate, or export comments.

Keep the playback engine and waveform component replaceable behind adapters. Do not select a product winner from the available evidence: the desktop shell, supported platforms and formats, acceptable seek residual, and packaging constraints remain undecided. This is a proposal, not an implementation.

## Evidence-based disposition of the independent critique

- **Canonical media coordinate and player conversion — accept and amend.** The draft described exact coordinates but left their relationship to player/decoder timelines conditional on reliability. GStreamer documents that seek flags change approximation, segment start, and work required; AVPlayer accepts a tolerance window and can take longer for zero-tolerance requests. These are backend-specific behaviors, not a common storage mapping [SRC-010, SRC-011, SRC-013, SRC-014, SRC-017–SRC-019]. Before implementation, select the supported media matrix and define, for each supported format/backend, the asset presentation origin, conversion from playback cursor to persisted time, exact timebase, rounding rule, treatment of any offset/discontinuity, and how unavailable or unreliable positions are surfaced. A stored integer/rational value is exact only in its declared coordinate; it does not promise the decoder lands on or audibly presents that exact sample. Set an owner-approved residual tolerance and measure it. If a format cannot provide a stable mapping, decide whether to exclude it or allow an explicitly labeled approximate mode; never silently save an apparently exact interval.
- **Announcement behavior — accept and amend.** The prior “research obligation addressed” wording was too strong. WCAG 2.2 SC 4.1.3 is relevant to markup-based views: it concerns status messages made programmatically determinable so assistive technology can present them without focus [SRC-016]. APG is informative and warns that some touch assistive technologies may not operate sliders as expected [SRC-004, SRC-020]. These sources do not specify a native toolkit announcement event. Define message intent (explicit seek, boundary mark, save, actionable error), keep focus stable, suppress routine playback-tick speech, avoid duplicate announcements, then choose and test the supported platform’s accessibility mechanism. Named time fields and buttons remain the reliable route.
- **Source-map locator and release wording — accept.** The Web Annotation Recommendation labels Text Position Selector §4.2.5, not §4.2.10. The pinned Peaks API source alone does not establish v4 beta release status; separate release-history record SRC-015 does. The investigator index’s Apple URL has a stray closing parenthesis. Original IDs and observations remain preserved; reviser rechecks are separately recorded [SRC-002, SRC-005, SRC-015, SRC-016–SRC-021].
- **Critique’s overall agreement — retain as an assessment, not authority.** Keep the investigator’s supported corrections, incorporate both material gaps, and leave decisions open where sources cannot settle runtime or product policy.

## Product behavior and data model

### Media revisions and annotation records

Treat each exact local byte sequence as a media revision. Store a stable asset UUID and locally computed SHA-256. Keep path and filename as editable display metadata, not identity. Record available container/codec, duration, channel count, sample rate, and source timebase or presentation-timeline facts. Read and hash locally; do not transmit audio or hash.

Each annotation has a durable UUID independent of its interval, media-revision UUID, start and end in that revision’s declared coordinate, comment text, edit metadata, and optional channel/transcript association. Require start < end and known-duration bounds. Intervals are half-open [start,end); overlap and identical coordinates are valid and never merge or deduplicate. For PCM, integer sample-frame coordinates with the sample rate recorded are a candidate exact representation. For compressed media, select a declared rational/integer presentation timebase per supported format and define its mapping to the player. Avoid floating-point values as the persistence key. Milliseconds are useful for input, display, and export, but are not a universal precision guarantee [SRC-001, SRC-017–SRC-019].

A changed hash creates a new revision even if filename and duration match. Preserve the old revision and comments. Show comments attached to changed media as unresolved; do not reuse offsets automatically. Exact byte identity recognizes the same byte sequence. A different hash indicates a different revision but does not prove whether content can be aligned. A sample-rate change alters sample coordinates and decoder behavior; it does not by itself justify multiplying elapsed seconds by a rate ratio. A changed lead-in needs an explicit alignment decision.

If alignment is offered, represent it separately and audibly: old/new revision IDs; offset and optional scale; method/evidence; confidence; reviewer and approval time; and sampled passages checked. A local automated match may suggest alignment but cannot activate it silently. Keep annotations unresolved until a reviewer approves the mapping and its sampled checks.

### Time editing and playback adapter

The authoritative interaction is an ordered list/table with selected annotation, stable row identity, readable range, duration, text, and mapping status. Provide named “Set start to playhead” and “Set end to playhead” actions and directly editable labeled time fields. Users can correct either boundary without a pointer. Provide play/pause, jump, previous/next annotation, play-this-interval, save, and delete. Preserve selection and focus; do not require a timed chord or drag path.

Define a player adapter only after selecting runtime and media matrix. It should expose local open/read-only status, duration and seekable ranges, channels, current position, seek request/completion, supported seek mode/tolerance, errors, and mapping to persisted coordinate. Retain requested and observed positions and report when measured residual exceeds the approved tolerance. Seek completion or displayed milliseconds alone is not evidence of sample accuracy. GStreamer’s KEY_UNIT and ACCURATE flags illustrate speed/precision tradeoffs, including processing from earlier in the stream; Apple’s API illustrates bounded tolerance, extra delay for sample-accurate requests, and interrupted seeks [SRC-010, SRC-013, SRC-014, SRC-017–SRC-019]. Neither backend is selected here.

### Transcript association

Transcript is an optional second route, never a prerequisite. Store transcript revision identity separately, using a local content hash or equivalent. When supplied cue times exist, retain provenance and navigate to the supplied start while keeping the annotation’s own interval authoritative; show whether the cue is approximate. For an untimed transcript, search/select text or use quote/context without seeking or writing a timestamp. Do not synthesize transcript timings. Web Annotation text positions are zero-based, start-inclusive/end-exclusive, and can become brittle after edits; bind such anchors to a transcript revision and retain quote/context [SRC-002]. A missing or stale transcript removes or marks that route unresolved, not keyboard review.

### Accessibility and focus

Every required operation needs a named keyboard route with visible focus, logical order, direct editable times, and a non-color description of ranges/overlap. Do not reserve global letter keys while a comment editor is active. Playback updates must not steal focus or change the selected row. Provide restrained status messages for explicit seeks, start/end marks, saves, and actionable failures; do not announce every playback tick. Review remains possible without transcript or waveform.

For markup-based views, evaluate applicable normative WCAG 2.2 criteria, including keyboard operation, focus order/visibility, use of color, and status messages SC 4.1.3 [SRC-003, SRC-016]. If a slider is offered, keep direct fields and buttons; APG slider guidance is informative and its touch-AT warning requires testing [SRC-004, SRC-020]. For a native toolkit, identify platform accessibility roles/events and equivalent announcement mechanism after toolkit selection; WCAG/APG do not establish native implementation behavior. Verify with supported screen readers/accessibility APIs. No accessibility conformance or user testing has been run.

### Long files, local media, and export

Do not assume full-file decode is inexpensive. Web Audio decodeAudioData accepts encoded audio data and yields PCM resampled to the context rate; it is one possible browser architecture, not a universal codec guarantee [SRC-012, SRC-021]. At 48 kHz, stereo, 32-bit float, one hour of uncompressed samples is about 1.38 GB before overhead. Compare windowed/level-of-detail rendering and locally cached precomputed waveform peaks with full decode on the eventual platform. Waveform generation, caching, and playback remain local.

Export a UTF-8 human-readable report with one row per annotation: display name, revision/hash, stable annotation ID, exact persisted coordinate/timebase, readable HH:MM:SS.mmm start/end and duration, comment, optional channel scope, and current/unresolved mapping status. Sort by start then stable ID without collapsing overlaps. Escape separators and newlines. A machine-readable companion or W3C media-fragment selector is optional, not a replacement for revision identity and mapping history [SRC-001, SRC-002]. Media Fragments uses half-open intervals and seconds; its clock syntax does not signal frame accuracy [SRC-001].

## Alternatives and roles

| Approach | Evidence and limits | Proposed role |
|---|---|---|
| Application-owned list, time fields, player controls | Can support keyboard/screen-reader operation and exact edits without waveform/transcript. Focus, naming, parsing, and announcements need deliberate design and platform tests. | Required source of truth and complete workflow. |
| Peaks.js v3.4.2 | API uses seconds and segments; keyboard support is off by default and nudge defaults to 0.01 seconds. Tagged demo shows segment rows, numeric start/end fields, opt-in keyboard controls, and precomputed data. API/caller do not establish accessible region editing. v4.0.0-beta.2 is separately recorded as prerelease [SRC-005, SRC-006, SRC-015]. | Optional visual overview/detail candidate; keep application list and fields. |
| WaveSurfer.js Regions 8.0.0 | Region IDs and second-based boundaries; drag/resize default on. Inspected plugin has pointer/drag streams and no keydown match, limited to that file. Release notes give seek/region regressions as test cases, not proof of this product [SRC-007, SRC-008]. | Optional visual candidate with app-owned persistent IDs and structured controls. |
| Audacity Label Editor/Label Tracks | Manual documents point/range labels, Tab/Shift+Tab navigation, keyboard-accessible table editor, and text export. It warns labels over 260 characters may not reload, hundreds/thousands can slow the application, and Export Multiple uses the uppermost label track [SRC-009]. | Interaction/import-export precedent, not embeddable component or product limit. |
| W3C Web Annotation and Media Fragments | Selector/interval conventions; do not solve local revision identity, changed-file mapping, player accuracy, or accessible interaction [SRC-001, SRC-002]. | Optional interoperability envelope only. |

No candidate is selected as product winner. Benchmark only after platform, packaging, codec, licensing, and retention decisions.

## Exact released-plan disposition

Clause IDs preserve the investigator’s P1.1–P8.2 map to the released plan in revealed-plan.md.

| Clause | Disposition |
|---|---|
| P1.1 Stable IDs, start/end milliseconds, text, recording hash | **Retain identity/text; amend time.** Durable IDs are independent of intervals; keep milliseconds for readable input/export but persist declared exact per-revision coordinate and timebase. Permit overlaps. |
| P1.2 Key action marks playback position; another closes interval | **Retain and extend.** Named keyboard-operable start/end-to-playhead actions plus directly editable labeled fields; no chord or drag requirement. |
| P1.3 List navigates annotations; overlaps stay separate | **Retain.** Semantic list/table is authoritative; coincident ranges remain separate records with distinct IDs. |
| P1.4 Text labels state ranges | **Retain and specify.** Provide visible/accessibility start/end/duration; color may reinforce but never carry sole meaning. |
| P1.5 Review without transcript; original unchanged and never transmitted | **Retain.** Controls work with no transcript; process locally and open original read-only. |
| P2.1 Supplied timed transcript segments navigate to supplied starts | **Retain with provenance.** Report cue source/approximation and actual landing; do not replace annotation time. |
| P2.2 Untimed transcript is searchable and creates no inferred times | **Retain.** Search and quote/context navigation only; no inferred seek or annotation timestamp. |
| P3.1 Playback API milliseconds assumed stable across formats | **Reject as general premise.** Per-format coordinate conversion, rounding, requested/observed seek, residual, and owner tolerance must be specified and measured. |
| P3.2 Same filename restores; warn only when duration changes | **Reject and replace.** Path/name or equal duration is not identity. Hash mismatch starts new unresolved revision; mapping requires explicit review. |
| P4.1 Static text export with filename, hash, formatted ranges | **Retain and expand.** Human-readable UTF-8 remains required; include stable ID, revision, exact coordinate/timebase, readable times, duration, overlap, escaped text, unresolved state. |
| P4.2 Channel and media-relative basis undecided | **Amend partly; retain owner decision.** Make time relative to identified revision’s declared presentation origin. Decide whether notes apply to combined audio or a channel; do not infer from waveform. |
| P5.1 Predictable focus during playback | **Retain and specify.** Ticks do not steal focus; explicit outcomes may be announced; selection/editor remain stable. |
| P5.2 Seek announcements and interval editing need accessibility research | **Amend; retain uncertainty.** WCAG/APG inform markup/slider path; add SC 4.1.3 where applicable and define native behavior after selection. Testing remains proposed. |
| P6.1 Proposed validation cases | **Retain and expand below.** Add coordinate conversion/origin/rounding, actual seek residual, announcement/focus, and long-file resource cases. |
| P6.2 No recordings or assistive-technology sessions used | **Retain as status.** No recording or assistive-technology test was run in these stages. |
| P7.1 Establish identity before controls | **Retain.** Decide revision, coordinate, annotation ID, transcript revision, and unresolved/mapped states before building views. |
| P8.1 Provisional proposal; no deployment/recruitment requested | **Retain.** Software proposal only; no private recordings, deployment, or subject recruitment. |
| P8.2 Common deadline and no minimum duration | **Retain.** Finish when complete; no wait period is part of the method. |

## Covered constraints, optional work, rejected behavior, and open decisions

The brief’s local-file, keyboard, screen-reader, overlap, optional-transcript, no-invented-time, unchanged-original, no-remote-audio, useful-export, stereo, and long-recording requirements are preserved. Dragging is never required; color is never the sole cue. No participant study, deployment, or private-recording trial is proposed.

Optional improvements: waveform overview/detail, local precomputed waveform peaks, “play around this annotation,” undo for boundary edits, extra JSON/W3C export, and reviewer-confirmed alignment with sampled passages. These are not prerequisites.

Rejected behavior: drag-only editing, color-only identity, merging coincident annotations, silently applying old seconds to changed media, assuming milliseconds guarantee round trips, using filename/duration as identity, inventing untimed-transcript times, remote audio processing, or modifying/re-encoding originals.

Owner decisions: target shell/OS; player and supported formats/codecs; canonical timeline and origin/conversion per format; acceptable seek residual; whether approximate formats are excluded or explicitly supported; maximum duration/count/comment length; channel-specific notes; authoritative transcript/cue formats; export schema/retention; and library licensing/build fit. Audacity’s limits are warnings about that tool, not limits imposed here.

## Validation plan — proposed, not run

1. **Records/round trips:** overlapping, adjacent, coincident-time/different-ID, start-zero, end-duration, reversed, zero-length, out-of-range, and long-comment records; save/reload/export/import; compare exact coordinates/timebases, IDs, ordering, and text.
2. **Coordinate mapping/replacement:** selected PCM and compressed formats; multiple rates, mono/stereo, non-zero timeline starts and any selected format’s edit-list/priming or equivalent offset cases. Check conversion, rounding, origin, duration/bounds, and decoder mapping. Test exact-byte duplicates under renamed paths; same-name/equal-duration files with changed lead-in; rate changes and re-encodes. Verify old annotations stay on old revision, hash changes remain unresolved, and alignment requires review/sampled checks.
3. **Playback:** representative indexed/variable-rate and difficult-seek files, short/long and missing/corrupt/unsupported files; boundary/interior seeks, interrupted requests, end-of-file. Compare requested/observed positions, repeatability, declared tolerance, audible landing, completion/error signals. Report failure against owner-approved threshold; do not call unmeasured accuracy a pass.
4. **Accessibility:** keyboard-only open/play/pause/jump/mark/edit/save/delete/export and overlap navigation without pointer. Check names, focus order/visibility, stable selection, no traps, no shortcut capture in text fields, status announcements without focus movement, no tick speech or duplicate messages. Repeat with supported screen-reader/platform combinations and absent, untimed, supplied-timed transcripts.
5. **Long-file/privacy/export:** measure peak generation, cache size, rendering and memory on target hardware; inspect local-only processing and unchanged original hash. Review UTF-8 export for timing, revision identity, channel decision, overlap, escaping, unresolved mapping.

## Work performed and validation status

I read the assigned brief, discovery, draft, released plan/release record, investigator and critic source maps/indexes, and complete independent critique. I checked disputed time/seek and announcement points against official W3C, GStreamer, Apple, and Web Audio documentation; details are in source-map.json and the source index. I accept both material gaps and locator corrections as above.

The investigator/critic reports document upstream API/caller/source and release-history inspection. No downloaded code was run. In this reviser stage, no repository implementation, media file, playback, upstream test suite, benchmark, screen reader, assistive technology, or export was executed. Every validation above is proposed, not completed.