# Accessible recording review annotations

**Status:** research-backed software proposal for owner review. This is not implementation approval or a deployment plan. It does not assume a winning playback or annotation product. The assigned brief, exact revealed plan, complete investigator discovery/draft/source map, and complete independent critique/source map were read. See the [source index](sources/index.md) and [complete source records](source-map.json).

## Proposal

Build a local review-record layer around a replaceable playback adapter. Make the keyboard editor and text comment list complete without a waveform or transcript. Let a waveform and timed transcript add optional ways to find a passage. Keep each comment separately addressable even when ranges overlap. Bind every saved time to an identified recording version, and mark annotations unmatched when that version changes. Export readable comments with enough timing context to interpret them.

This structure addresses long recordings, keyboard and screen-reader use, optional transcripts, local files, occasional stereo media, and an unspecified playback engine. The exact supported players, codecs, platforms, and seek tolerance remain owner decisions. Nothing here claims those combinations have been tested.

### Annotation and recording identity

Use one durable annotation ID per comment, body text, start and end values, interval kind, and explicit time basis. Retain creation and edit provenance if the owning product needs audit history. Overlapping annotations remain independent objects and can share timestamps; never merge them because their ranges intersect.

For the conservative default, calculate SHA-256 over the exact local recording bytes and associate annotations with that digest. Keep filename as a display label, not identity; duration and sample rate are descriptive metadata, not proof of identity. A changed digest puts annotations into a visible unmatched state, preserving their old times but preventing silent seeking against the replacement. This includes a same-name, same-duration file with a new lead-in and a resampled or otherwise rewritten file. Require a person to listen and deliberately reattach or recreate a comment before it targets changed content.

This exact-byte rule is a product safety recommendation, not a W3C requirement. It intentionally treats metadata rewrites and transcodes as changed sources. Whether a future decoded-audio equivalence or time-remapping feature is wanted is an owner decision; do not infer equivalence or remap times in this proposal. Byte-identical files moved to another path can share the digest if the owner adopts content identity independent of path.

Record useful source metadata alongside the binding: displayed filename, digest algorithm and digest, duration, media format, sample rate, channel count, and the adapter's reported timeline origin or normalization. The time basis should be media-presentation time relative to a documented zero. If the selected engine exposes a different origin, normalize it explicitly and preserve the conversion metadata. Default comments to the whole recording and all channels; channel-specific targeting is optional and should be added only if reviewers need it.

### Time, seeking, and editing

Represent ordinary interval comments with integer milliseconds from that documented media-relative origin, with a half-open range [start, end): the start is included and the end is excluded. Require start < end and reject reversed or empty comment intervals with an editable explanation. If a point marker is later wanted, give it a separately named kind rather than quietly making an interval zero length. W3C Media Fragments uses seconds/NPT and half-open temporal ranges; its colon time form is only a convenience and does not imply frame accuracy [MEDIA-01]. The local model may adopt the same boundary convention without claiming that the web standard dictates local storage.

Millisecond storage is a chosen representation and display resolution, not a promise of sample accuracy or playback accuracy. The WHATWG media standard represents positions in seconds, permits duration to be unavailable or unbounded, exposes seekable ranges, and defines asynchronous seeking. A target outside seekable ranges may move to the nearest available point; its fast-seek operation trades precision for speed [HTML-01]. This is evidence about that standard's media element model, not a guarantee for the unspecified desktop player in the brief.

Have the playback adapter report readiness, duration, current time, timeline origin, seekable ranges, channel/sample-rate information where available, unsupported/error states, and seek completion plus the actual resulting position. Retain requested and completed positions where observable. If they differ, tell the reviewer the actual position and do not label the requested value exact. Establish an accepted tolerance separately for every supported player/format combination using distinguishable audio events. If the owner requires sample-accurate marks, select a rational timebase or source-frame representation tied to the exact source version, then demonstrate that the decoder and playback route preserve the requested semantics. A decimal number of places alone cannot supply that evidence.

Keyboard review should work as follows:

1. Provide named Play/Pause, coarse seek, current-time display, smaller/larger nudge, Mark start, Mark end, Cancel range, and Save comment controls. Expose editable labeled start/end time fields.
2. Mark start records the current player time and announces a pending start. Mark end records the second bound. The reviewer can cancel or edit before saving.
3. Scope mark shortcuts to the review-control context and suspend them in comment text, transcript search, and other text entry. Offer a discoverable shortcut reference; resolve host conflicts before assigning defaults.
4. Preserve focus on the selected control while playback advances. Do not rebuild or reorder a focused row on each playback tick and do not announce every tick. After a completed seek or mark, provide a concise status with the actual time.
5. Show a chronological comment list, sorted by start, then end, then stable ID. Each separately navigable row has a text label with its range and comment. Row actions can seek to the beginning, edit text/time, and move to previous/next comments. Overlap stays understandable with color disabled.
6. Every operation required to create, edit, select, and navigate comments works without mouse dragging or waveform focus. A seek slider can be optional and must have a useful time label and keyboard operation. The WAI-ARIA APG lists arrow keys, Home/End, optional Page Up/Down, and a media time value example, while warning that assistive-technology behavior can vary and calling for manual testing [WAI-01].

### Transcript, privacy, and export

A transcript is a second route, never a prerequisite. Associate only a supplied, versioned transcript segment and its documented timecodes. Selecting it requests a seek to its supplied start, waits for completion, and reports a different actual position. Keep segment ID and transcript version identity when available. An untimed transcript can be searched and read, but text position, order, or guessed speech timing must never become a media seek time. A reviewer may mark a time while listening. Text quote or position selectors can help find transcript text, but text positions can go stale after edits; treat changed transcript identity as needing review.

The Web Annotation Data Model offers target/body structure and media fragment or text selectors. It explicitly does not prescribe the transport protocol [ANNOT-01]. Use it as an optional local JSON-LD interchange form if interoperability is useful; it supplies no player, local persistence, media identity rule, accessible comment editor, or rationale to add remote services.

Load the source read-only. Compute hashes, optional waveform peaks, and annotation data on the local machine. Do not transmit audio, transcript, waveform, or comments to a remote service. Never alter source bytes. A local project database or sidecar can hold annotations; select one with the owner and define backup/restore behavior before implementation. The proposal does not claim network isolation has been tested.

Export a static UTF-8 TSV or CSV with one row per comment: stable ID, display filename, recording digest, explicit time basis/origin, interval convention, readable start/end, text, and any explicit channel scope. Use hours that can exceed 24 and fixed three-digit milliseconds in readable timestamps. Escape tabs, quotes, line breaks, and non-ASCII text correctly. Omit a sensitive absolute path and never include audio. Keep exact machine values, transcript linkage/provenance, and other structured fields in an optional local JSON sidecar. Audacity's manual provides a tab-delimited start/end-seconds/text precedent and documents combined multi-track export; its issue #5690 is a historical selection/export report, so treat export as this product's contract to test rather than inherited behavior [AUD-LABEL-01] [AUD-ISSUE-01].

### Alternatives and fit

| Approach | Evidence and fit | Limits and conditions |
|---|---|---|
| Keyboard-first time fields, mark controls, and semantic comment list | Best baseline for transcript-free and waveform-free use. It directly supports named keyboard actions, overlapping records, and text ranges. Audacity's keyboard table/mark commands and ELAN's typed-time entry are useful precedents [AUD-KBD-01] [ELAN-UI-02]. | The product must build its own focus behavior, row actions, validation, status announcements, and accessibility. These precedents do not prove this interface accessible. |
| WaveSurfer.js Regions, pinned 8.0.2 | Optional visual region layer. Source has second-based region positions and drag/resize defaults; its cited Cypress file checks pointer-style creation/dragging, markers, IDs, and a stereo fixture [WS-CODE-01] [WS-TEST-01]. README warns that full decoding can exceed memory on large clips and that VBR media can misalign waveform and audio; local precomputed peaks merit evaluation [WS-README-01]. | It is not a keyboard comment editor. Keep the semantic controls/list independent. Long-file issue #2737 concerned 6.6.1 and was not a validated 8.0.2 defect/fix; use it only as historical motivation to test long-file audio/playhead alignment [WS-ISSUE-01]. |
| Peaks.js segments/points | Versioned 3.4.2 API describes a custom player, local/precomputed waveform data, multichannel display, and optional keyboard controls. GitHub's checked release view lists 3.4.2 stable and 4.0.0-beta.2 prerelease; its README says development moved to Codeberg [PEAKS-API-01] [PEAKS-STATE-01]. | Keyboard defaults off, and an enabled nudge value does not supply a semantic overlapping-comment list. Issue #573 is an open user report of a custom-seek mismatch without a stated exact library version or confirmed general cause [PEAKS-ISSUE-01]. Check the maintained upstream and actual adapter before choosing it. |
| Audacity-style labels | Useful precedent for compact keyboard marking and readable tab-separated time/text export [AUD-KBD-01] [AUD-LABEL-01]. | Its editor and multi-track export model need not be copied. The historical issue is a regression-test prompt, not evidence of current behavior or a defect in this proposal [AUD-ISSUE-01]. |
| ELAN/EAF tiers | Useful where structured transcription and aligned tiers are central. The recovered official manual supports typed hh:mm:ss:ms boundaries and describes tier-dependent edits [ELAN-UI-02]. EAF source-map evidence describes tier and time-slot rules [EAF-SPEC-01]. | Same-tier top-level alignable annotations are described as non-overlapping, while richer tier stereotypes have their own constraints. That model can be cumbersome for arbitrary overlapping free comments. Direct PDF text was unavailable in the reviewed source pass, so verify exact tier behavior before designing an import/export contract. |
| Web Annotation JSON-LD | Optional standards-based selectors for media fragments and transcript text; supports portable representation [ANNOT-01]. | It is a data model, not the playback adapter, local store, identity policy, review UI, or transport. |

No option should be selected as a complete product on this evidence alone. Keep annotation and identity semantics independent of the visual component, then validate the actual local player and supported media matrix.

### Integration sequence

1. Decide the supported platforms/media/player matrix, timeline origin contract, stored precision and acceptance tolerance, digest/equivalence policy, channel need, and local storage/backup model.
2. Implement and verify stable comment IDs, exact-source binding, half-open range validation, mismatch/orphan state, and time conversion.
3. Implement the read-only media adapter with explicit readiness/error states, seekable ranges, completion/readback, and actual-position reporting.
4. Implement the keyboard mark/edit workflow and independently navigable text-labeled comment list. Complete this without a transcript or waveform.
5. Add optional timed-transcript association, then optional local waveform/peaks integration. Keep untimed transcript search independent of media time.
6. Add readable export and optional structured sidecar.
7. Run proposed fidelity, accessible interaction, privacy, and export validation for every declared platform and media combination before any deployment decision.

### Owner decisions and safe defaults

- **Seek tolerance and time precision:** Choose supported players/formats and acceptable measured seek error. Default to integer milliseconds with explicit origin and readback; use a rational/frame representation only if a demonstrated requirement calls for it.
- **Accessibility matrix:** Choose target operating systems, screen readers, and input modes. Until tested, claim no conformance or accessible-operation result.
- **Source equivalence:** Decide whether exact-byte identity is enough or whether a separately designed equivalence/remap feature is wanted. Default to SHA-256 of local file bytes and manual review for every changed digest.
- **Channel scope:** Confirm whether interview comments must distinguish stereo channels. Default to all channels, with explicit text if an optional channel-specific scope is added.
- **Persistence and backup:** Choose local database versus sidecar and define source-move, backup, and restore semantics. No cloud or remote audio path is in scope.

## Exact revealed-plan disposition

Each plan clause is reproduced and resolved; the full plan was released once at the declared comparison point. “Keep” means retain the requirement in the proposal, not that it has been implemented.

| Exact plan clause | Disposition |
|---|---|
| “The draft stores annotations as stable identifiers with start and end milliseconds, comment text and a recording hash.” | **Keep and clarify.** Preserve stable IDs/text and a local exact-byte SHA-256 recommendation; specify the media-relative origin, half-open range, and that milliseconds are not a seek guarantee. Hash choice remains policy, not a standard mandate. |
| “A keyboard action marks the current playback position; another closes the interval.” | **Keep and specify.** Add pending-range feedback, focus scope, cancel, editable bounds, save, invalid-range handling, and completed-seek/readback behavior. |
| “A list offers navigation to each annotation, overlapping intervals remain separate, and text labels state their ranges.” | **Keep and refine.** Use independent stable rows and deterministic time/ID ordering; row labels state time and comment; do not rely on color. |
| “Review is possible without a transcript.” | **Keep as a hard requirement.** Listening, marking, editing, navigation, and export work with no transcript. |
| “Original local audio is never changed or transmitted.” | **Keep as a hard constraint.** Use read-only local media and local hash/peaks/persistence. Remote audio or annotation services are out of scope. |
| “When a transcript supplies timed segments, selecting a segment seeks to its supplied start time.” | **Keep and bind to transcript identity.** Request only the supplied time, wait for completion, and show the resulting position if different. |
| “Untimed transcripts are searchable text but do not create inferred timings.” | **Keep unchanged.** Search and read text; do not derive a media time from text position or order. |
| “The draft assumes milliseconds reported by the playback API are stable enough for annotation round trips across supported formats.” | **Correct.** Millisecond numeric resolution does not establish heard-position accuracy across an unspecified engine and formats. Define the supported matrix and measured tolerance; use readback and a higher-resolution representation only if needed. |
| “It also proposes restoring annotations after a recording replacement when the filename matches, warning only if duration differs.” | **Reject and replace.** Name/duration cannot prove content identity. A digest mismatch is visibly unmatched and cannot auto-seek, even for equal-duration replacements. |
| “That replacement rule has not been justified, particularly for equal-duration files with changed lead-ins.” | **Accept and resolve conservatively.** Keep the old times, mark unmatched, and require deliberate human review before reattachment. Equivalence/remapping stays an owner decision. |
| “Comments export to a static text report with filename, hash and formatted ranges.” | **Keep and add context.** Include stable ID, time basis/origin, interval convention, readable range and comment text; escape correctly, omit absolute path/audio, and retain an optional local sidecar. |
| “The draft has not decided whether channel information or an explicit media-relative time basis is necessary.” | **Resolve time basis; limit channel scope.** State media-relative origin explicitly. Whole-recording/all-channel comments are the default; channel-specific scope is optional pending owner input. |
| “Focus should remain predictable while playback continues, but seek announcements and interval editing need platform-specific accessibility research.” | **Keep and make testable.** Do not move focus on playback ticks or announce every tick; report meaningful mark/seek results. Platform and assistive-technology matrix remains open. |
| “Proposed validation covers overlapping annotations, seeking near boundaries, different sample rates, replaced media, transcript absence and keyboard/screen-reader operation.” | **Keep and expand.** Add long/VBR media, stereo, seek errors/clamping, equal-duration same-name lead-in replacements, transcript version changes, export escaping/round-trip, byte preservation, and network-path checks. All remain proposals. |
| “No recordings or assistive-technology sessions have been used.” | **Keep as execution status.** No interview/private recording or assistive-technology session was used in this stage; manual validation is unrun. |
| “Implementation should first establish annotation/media identity and then integrate the review controls.” | **Keep.** Identity and time contracts precede adapter and controls; optional layers follow. |
| “This is a provisional draft for review after the declared reveal, not an endorsed answer.” | **Preserve status.** This is an owner-review proposal, not implementation authorization or deployment. |
| “Complete all substantive research and planning obligations within a maximum of 60 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.” | **Followed.** Work was completed within the absolute stage deadline; no wait was used to consume the allowance. |
| “A writing reserve is not a minimum duration.” | **Followed.** The stage is being delivered as soon as the complete output and source index are saved. |

## Independent critique: explicit dispositions

The critic's labels are not treated as authority. The following decisions compare each finding with the brief, the released plan, and the identified evidence.

| Critique ID | Finding | Disposition and reasoning |
|---|---|---|
| C-01 | Filename plus duration is materially unsafe; keep digest mismatch unmatched. | **Accept.** The brief expressly anticipates a changed lead-in and forbids silent mis-targeting. Equal names/durations are insufficient. Exact-byte SHA-256 is a cautious proposal; it is not a required standard and its changed-file consequences are stated. |
| C-02 | Millisecond-valued player APIs do not guarantee cross-format round-trip position. | **Accept with qualification.** The re-opened WHATWG standard confirms seconds, asynchronous seeking, seekable ranges, possible nearest-range adjustment, and an approximate-for-speed fast seek. This justifies measured tolerance/readback for an HTML-media implementation. It does not establish behavior of an unspecified desktop engine, so the proposal remains conditional. |
| C-03 | Time origin and interval convention were missing. | **Accept and amend.** State an explicit media-presentation origin and [start,end) convention. Media Fragments confirms half-open temporal fragments and notes that its clock-like form does not signal frame accuracy. This convention is a proposal for local data, not a local-storage mandate. |
| C-04 | Player, media, accessibility-platform, source-equivalence, channel, and storage choices remain owner inputs. | **Retain uncertainty.** The brief does not settle these product choices, and the reviewed sources cannot choose them. The proposal records safe defaults and concrete decisions instead of inventing requirements. |
| C-05 | Supplied ELAN boundary URL is unavailable; recovered official URL is distinct. | **Accept.** Preserve ELAN-UI-01 at its exact supplied URL and its access failure. Cite the separately identified ELAN-UI-02 recovered official page for typed bounds/tier conditions. The final source map retains both identities; no silent rebinding occurs. |
| C-06 | No unsupported consequential claim requiring rejection was found by the critic. | **Accept, bounded to inspected evidence.** Independent checks confirmed the central W3C, WHATWG, APG, and recovered ELAN points. This does not establish that all product assumptions are true or that unrun validations passed. |

## Proposed validation; not executed

1. **Keyboard and screen reader:** On every declared platform, manually perform play/pause, coarse/fine seek, interval start/end/edit/cancel, overlap selection, row navigation, transcript-free review, and export with keyboard only and with a screen reader. Check focus order/stability, names/ranges, status messages, shortcut conflicts, errors, and non-color cues.
2. **Timing and media fidelity:** Use synthetic mono/stereo PCM at 44.1 and 48 kHz plus each additional declared rate; include a long file and VBR only where supported. Put distinguishable events at known times. Compare requested mark/seek, completed seek readback, and heard event near boundaries; measure and report per-engine/format tolerance. Exercise unavailable duration, empty/discontinuous seekable ranges, unsupported media, and clamped/different results.
3. **Identity and replacements:** Bind an original fixture, then use a same-filename equal-duration replacement with a changed lead-in and a resampled replacement. Verify changed digest becomes unmatched, old times remain visible, and no selection or transcript link auto-seeks against it. Test byte-identical copies at a new path against the selected identity policy.
4. **Overlap, transcript, and export:** Keep adjacent and overlapping comments independently navigable. Test absent, untimed, and supplied timed transcripts, plus a changed transcript version; only supplied times may drive transcript seeks. Round-trip TSV/CSV and optional sidecar with quotes, tabs, newlines, UTF-8, >24-hour ranges, source identity, and channel scope.
5. **Privacy and immutability:** Compare source bytes before and after review. Inspect the application’s network behavior to confirm audio, transcript, peaks, and comments remain local. This is proposed verification, not a result.

## Work actually executed and limits

The exact frozen native Goal was activated before case/source reading and passed the assigned binding guard. The assigned brief, all predecessor artifacts named by the input map, and both provided source indexes/maps were read. The independent critic and investigator had inspected pinned upstream code/test files and source histories as recorded in their maps; those upstream files were not executed. In this reviser pass, the W3C Media Fragments and Web Annotation pages, WHATWG media-seeking section, WAI-ARIA APG slider page, and recovered official ELAN manual were reopened and checked directly.

No application repository code, product callers, or product test paths were supplied in the input map; this proposal establishes no in-product compatibility. No implementation, build, downloaded code execution, browser playback, synthetic or private recording, keyboard/assistive-technology session, network trace, or media-fidelity test was run. All checks above are proposed, not passed. The reviewed ELAN EAF PDF was not directly readable in the predecessor pass; its tier comparison remains bounded to the recorded official search extract and must be confirmed from the exact format documentation before compatibility work.

Complete source URLs, versions/commits where supplied, locators, UTC access records, observed operations, conditions, and applicability are indexed in [sources/index.md](sources/index.md) and [source-map.json](source-map.json). Research and planning do not recruit interview subjects, deploy a player, or annotate private recordings.

