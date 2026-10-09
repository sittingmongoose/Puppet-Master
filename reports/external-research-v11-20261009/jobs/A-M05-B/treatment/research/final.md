# Final research — S11 accessibility-video

**Assignment:** ER11 A-M05-B treatment/research; M05 retained-investigator method  
**Compared plan:** the exact six clauses in revealed-plan.md  
**Review:** incorporates the complete critique at ../critic/critique.md  
**Discovery:** discovery.md was saved before plan reveal and remains frozen. This final updates the plan assessment; it does not revise discovery.

## Recommendation

For the forty-video library, retain approved video revisions with sidecar WebVTT tracks and at least one transcript per video. Associate each caption or subtitle file with the exact video revision, track kind, language, label, review state, and publication history. Keep captions, translated dialogue subtitles, transcripts, and audio description/full media alternatives as distinct deliverables.

Use native browser controls as a low-dependency player candidate and compare them with a pinned accessible-player option using the same video and task list. Able Player v5.0.0 merits that pilot because its documented features include keyboard controls, caption preferences, language selection, and interactive transcripts. Video.js remains an alternative if actual streaming or extensibility needs justify more player assembly and QA. Research does not establish a player choice or a browser support matrix.

Allow machine-generated translation text as an optional internal draft. Do not publish a machine translation without a fluent review against the source and a check of the published timing. Allow plain-text VTT wording edits when timings are preserved and the resulting file is parsed and watched against the final video. Use a time-aware editor when synchronization, conversion, or timing repair is part of the task.

Keep an automated accessibility scanner as one scoped source of evidence for detectable page/player-shell issues. Pair it with structural track checks, direct keyboard and assistive-technology evaluation, listening and watching the published media, and user review. No one scan or score establishes overall accessibility.

Treat asset rights, contributor consent, jurisdiction, and vendor handling as unresolved facts. Before public release or external upload, establish the applicable permissions for each asset and use. This is a research condition, not a legal conclusion that every internal caption draft requires a separate license.

## Evidence boundary

The brief supplies forty recordings as product context, but this research received no recordings, captions, transcript files, runtime, hosting environment, target languages, or target conformance level. It therefore cannot determine the actual visual-description need, review effort, player behavior, rights, browser support, or content error rate.

The evidence record contains S01–S24 in [source-map.json](source-map.json), with source versions or commits, exact URLs, locators, access times, operations, and drift notes. The bounded notes and navigable source index are in [sources/primary-source-notes.md](sources/primary-source-notes.md) and [sources/index.md](sources/index.md). Current or informative pages may change; dated standards, releases, commits, and the observed limits are identified in the map.

WCAG 2.2 is used as a design reference, not as a claim that the organization selected or achieved a conformance level. The WebVTT publication reviewed is a dated Candidate Recommendation Draft, not a final W3C Recommendation. The U.S. copyright sources apply to U.S. law and do not resolve this organization’s rights or exceptions. No legal determination was made.

## Findings and practical design

### Media, tracks, and text alternatives

WCAG distinguishes prerecorded captions, alternatives to visual information, and audio description. Captions represent speech and meaningful non-speech audio; dialogue-only subtitles may omit relevant sound and speaker information [S01](https://www.w3.org/TR/WCAG22/), [S02](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded). A transcript is useful but is not automatically the full media alternative described by criterion 1.2.3. To serve that role it must represent relevant auditory and visual information in sequence, including interaction outcomes where applicable [S03](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded).

Criterion 1.2.5 is Level AA. Assess each video to see whether important visual information is already conveyed in its audio; where it is not, audio description may be needed for that AA target [S01](https://www.w3.org/TR/WCAG22/), [S24](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded). This is a content-dependent assessment, not a requirement inferred for every video from the brief alone.

WebVTT is a practical HTML text-track format. HTML track metadata distinguishes kind, source language, user-facing label, and default preference; only one caption/subtitle track per media element may be marked default [S04](https://html.spec.whatwg.org/multipage/media.html). Cue timestamps use seconds and fractional seconds. Those mechanics enable track delivery and structural checks; they do not establish caption accuracy or player usability. The reviewed dated WebVTT text describes caption, subtitle, description, chapter, and metadata tracks, but its publication is explicitly a work-in-progress Candidate Recommendation Draft [S05](https://www.w3.org/TR/2026/CRD-webvtt1-20260520/). Check the current format status and implementation in target browsers before standardizing. IMSC 1.2 is a standards-based interchange alternative where a named partner or richer profile need requires it; it adds conversion and validation work for a simple HTML catalog [S06](https://www.w3.org/TR/2020/REC-ttml-imsc1.2-20200804/).

For the selected host and player, verify final-media timing, correct track kind and language, valid VTT syntax, correct deployed MIME type, and track fetching including any required CORS behavior. Video.js documentation describes cross-origin track-loading conditions, but is live and not pinned to a code commit; verify it again against any selected release [S19](https://videojs.org/docs/framework/html/guides/captions).

DCMP’s Captioning Key offers useful review dimensions such as accuracy, consistency, clarity, readability, and meaning. Its specific frame-duration and educational reading-rate recommendations have a context; they are not universal WCAG limits or a single pass/fail accessibility score [S07](https://dcmp.org/captioningkey/print).

### Player options

- **Native browser controls:** lowest added dependency and a sensible comparison baseline. The HTML Standard describes media controls but does not prove the usability of a particular browser’s rendered controls. The support matrix is not supplied.
- **Able Player v5.0.0:** its pinned README documents keyboard controls, visible focus, caption appearance preferences, language selection, and an interactive transcript. Cue-by-cue transcript keyboard navigation is optional/off by default because it can add many tab stops. The README describes reduced functionality for some provider-hosted caption tracks compared with local sidecars [S08](https://github.com/ableplayer/ableplayer/blob/8d235f977689f310a074b3ddcf68e8d19a7ed4ae/README.md). Release v5.0.0 is recent, uses an ES module and targets ES2022; test the packaged release against the organization’s actual browsers and assistive technologies [S09](https://github.com/ableplayer/ableplayer/releases/tag/v5.0.0).
- **Able Player issue history:** issue #775 reported several YouTube regressions on the development branch in August 2026; the reporter said they were absent from v5.0.0. At retrieval the issue was closed, but no linked fix branch or pull request was displayed. This evidence supports testing a fresh build and pinned release; it does not establish that v5.0.0 has the reported defect [S10](https://github.com/ableplayer/ableplayer/issues/775).
- **Video.js:** viable if a custom framework, player extension, or streaming source is a real requirement. It entails more assembly and QA than adopting a prebuilt player. Documentation and release maturity were not aligned clearly enough in the inspected surfaces to select a version; verify the stable supported line and matching docs before a prototype [S19](https://videojs.org/docs/framework/html/guides/captions), [S20](https://videojs.org/docs/framework/html/concepts/accessibility), [S21](https://github.com/videojs/video.js/releases), [S22](https://github.com/videojs/v10).

A player feature list is not a conformance assessment. Compare candidates on the same representative recording and task list: keyboard-only play/pause/seek/volume/caption selection/full-screen, focus visibility, no keyboard trap, language/default behavior, transcript access, responsive caption appearance, media and track failures, and the selected screen-reader/browser combinations.

### Authoring and translation workflow

Subtitle Edit v5.2.0 is an evidenced desktop alternative for timing-heavy work: its pinned FAQ lists WebVTT and SRT, waveform use when FFmpeg is present, local speech-recognition options, offset adjustment, point sync, and visual synchronization [S12](https://github.com/SubtitleEdit/subtitleedit/blob/v5.2.0/docs/faq.md). The recent v5.2.0 release adds WebVTT and waveform-related work and local/cloud transcription or translation options [S13](https://github.com/SubtitleEdit/subtitleedit/releases/tag/v5.2.0). Pilot its selected workflow, target languages, fonts, dependencies, and export before standardizing. The inspected application license is MIT, but optional bundled model and engine terms require separate review [S14](https://github.com/SubtitleEdit/subtitleedit/blob/v5.2.0/LICENSE).

A text editor can make valid content edits to WebVTT. For a wording correction that should preserve existing timing, permit a text editor followed by a parser check and a watch/listen against the final encoded video. Use a specialist timed-text editor where the work requires waveform alignment, visual synchronization, conversion, or broader timing repair. Neither tool choice is a standards requirement.

Subtitle Edit offers both local and cloud-backed options; “local application” alone does not prove that every selected engine is local. A local engine can avoid sending media to a transcription vendor if its model and configuration are actually local. Confirm language support and dependencies. Amara is a possible hosted collaboration alternative, but one editor-help page could not be reopened without authorization, and current pricing, privacy, retention, roles, export, and contractual terms were not established. Verify those facts before uploading any media [S15](https://support.amara.org/support/solutions/articles/195345-create-captions-and-translations), [S16](https://support.amara.org/support/solutions/articles/25931-create-a-private-team-on-amara-).

Machine translation is within the brief as a way to create drafts. A draft can remain internal and does not need to pass final publication QA merely to exist. If a translation is to be published, a fluent reviewer should compare its meaning with the approved source, check names/numbers/negation and relevant sound information, then check target-language timing and readability. The choice of languages, source language for mixed-language recordings, and whether translated transcripts are required remain product decisions.

### Corrections, review, and rights

A modest correction process should keep working text separate from the currently approved public track. Suggested fields are a stable video ID and revision, language and track kind, file version, status, author/reviewer, review date, and correction reason. A viewer can submit a video/language/timestamp and suggested change; an authorized editor checks it against the media; an authorized person stages publication and retains the prior approved version for rollback. A separate reviewer/publisher is a useful control where staffing permits. With a smaller team, document an equivalent second check or approval step rather than assuming three separate staff roles. These are proposed controls; the brief does not identify a CMS, team size, or correction service target.

Rights and consent need to be established for the actual asset and intended use. In the United States, the inspected law reserves rights including reproduction, derivative-work preparation, distribution, and public performance subject to exceptions; the Copyright Office lists translation as an example of derivative work [S17](https://www.copyright.gov/title17/92chap1.html), [S18](https://www.copyright.gov/circs/circ14.pdf). These sources do not resolve this organization’s ownership, licenses, exceptions, or non-U.S. obligations.

Keep three decisions distinct: creating an internal working draft, publicly distributing caption/transcript/translation material, and sending media to an outside service. Before public release or external upload, establish the relevant permission, consent, privacy, and vendor terms with the rights holder and applicable jurisdiction. Pay particular attention to music, quoted or on-screen third-party text, participant restrictions, translations, and commissioned contributions. Public availability of the original video does not by itself establish permission to redistribute or create a derivative, but this research cannot determine which permissions or exceptions apply.

## Exact clause dispositions

| Plan clause | Final disposition | Assessment |
|---|---|---|
| P1 — “Host MP4 files and WebVTT captions.” | **Already covered, conditional** | Retain as a practical baseline. Bind every sidecar to the final video revision, track kind and language; check timing, serving, MIME/CORS and rights for the actual host. The brief does not establish file/hosting capacity, ownership, or partner ingest requirements. |
| P2 — “Use the browser default player.” | **User decision, pending a declared support matrix** | Native controls are a reasonable baseline, not a verified accessibility result. Compare with a specific pinned alternative against actual supported browsers/devices/assistive technologies. No player is selected by current evidence. |
| P3 — “Generate translations automatically.” | **Ambiguous / user decision** | It may mean generating internal drafts or publishing without review. Draft generation is consistent with the brief. Keep it optional; reject only publication without appropriate review. |
| P4 — “Edit captions in a text editor.” | **Already covered for text-only edits; optional specialist editor** | A text editor can make valid WebVTT wording changes. Preserve timing and parse/watch the result. A time-aware editor can help with waveform/visual synchronization and conversion; it is not a standards requirement. |
| P5 — “Publish one transcript per video.” | **Already covered as the requested minimum, with conditional enhancements** | Retain one transcript per video. Add translated transcripts only if selected as a product requirement. If the transcript is claimed as a WCAG 1.2.3 alternative, it must represent the relevant visual and auditory information in sequence; for an AA target, assess 1.2.5 audio-description need video by video. |
| P6 — “Run an automated accessibility scanner.” | **Already covered, with scope clarification** | Retain one selected scanner for detectable page/player-shell properties and record tool/version, scope, and findings. It is one evidence source, not a content, media-rights, or overall accessibility test. |

### Response to the independent critique

1. **P3:** Accepted. The earlier draft’s “rejected as a publish rule” headline could impute a publishing rule absent from the clause. The final marks it ambiguous, retains machine-assisted internal drafts as optional, and conditions release on review. Final QA is a publication condition, not a prerequisite for creating an internal draft.
2. **P4:** Accepted. The earlier draft called text editing a correction too broadly. The final permits text-only VTT edits with preserved timings plus parse and final-media checks, while treating specialized timing tools as optional enhancements.
3. **P5:** Accepted. The earlier draft called this a correction even though one transcript per video satisfies the brief’s minimum. The final keeps that deliverable and makes full media alternatives, audio description, and extra transcript languages conditional on content and product/conformance choices.
4. **P6:** Accepted. The clause requests a scanner but does not say the scanner proves accessibility. The final retains the scan as a scoped check and pairs it with direct checks. General keyboard operation must be tried; a page scanner may identify particular detectable failures but cannot establish keyboard usability.
5. **Rights:** Accepted. The earlier draft’s “clear rights before transcription and translations” was too categorical for the available facts. The final distinguishes internal drafts, public distribution, and external uploads; it records rights/consent as facts to establish for the owner, jurisdiction, and use, not as a conclusion from U.S. sources.

The critic’s additional cautions are also retained: the scanner does not evaluate VTT accuracy, visual description, translation quality, or rights; DCMP rate/duration values are not universal WCAG limits; a representative pilot does not replace review of every track actually released; small-team review roles can be adapted; Amara’s current terms were not checked; and no language, sign-language, transcript-search, default-caption, correction-response, or audience support policy is inferred.

## Validation plan — all proposed, none executed

**Structural content checks:** once assets and tracks exist, parse each released VTT; check URL and deployed fetch/MIME/CORS behavior; verify kind, language, label and default-track rules; validate cue ordering, positive duration, and end time against that exact video revision. These checks find structural and delivery defects, not caption truth or semantic access.

**Player checks:** select the supported browser/device/assistive-technology matrix first. Compare native controls and one pinned player with the same video and test list. Record version and environment, keyboard operation, focus, caption selection, transcript access, failure behavior, and observed user issues. Do not treat a player’s feature list as passing evidence.

**Human media checks:** listen/watch every caption or translation track that will be published against the final media. Review completeness, meaningful sounds, names/numbers/negation, timing, phrase division, readability, placement, and target-language meaning. Assess visual-description needs from each video. A representative pilot can validate the workflow but cannot substitute for review of each released track. Invite Deaf/hard-of-hearing and blind/low-vision reviewers to evaluate the site and correction route where feasible.

**Workflow and rights checks:** test that a public correction cannot edit the live VTT directly, that approval and rollback leave a retrievable version record, and that external vendors are reviewed before any media is uploaded. Verify rights and consent records for the actual forty assets and intended uses; unresolved records should remain visible as unresolved rather than being inferred from public availability.

WAI guidance supports this division: evaluation tools can identify potential issues but cannot automatically evaluate every aspect, may return false or misleading results, and require human judgment [S23](https://www.w3.org/WAI/test-evaluate/tools/selecting/). A scanner is useful evidence within its documented scope, not a conclusion about the whole service.

**Execution status:** no media, player, site, authoring application, accessibility scanner, parser, or runtime was exercised. No caption/transcript, user, browser, rights, or WCAG conformance validation was performed. All validations above are proposals. Public sources were reviewed as recorded in the source map. The only mechanical artifact check is that the source map parses and its IDs are unique; it does not validate any product claim.

## Decisions still needed

- Required accessibility standard/level and relevant jurisdictions.
- Owner, license, consent, participant, third-party-content, and contribution facts for each video.
- Hosting and playback architecture, expected traffic, file constraints, partner format requirements, and ability to set serving headers.
- Supported browsers, mobile devices, and assistive technologies.
- Source and target languages, reviewers, whether translated tracks/transcripts will be published, and any sign-language interpretation requirement.
- Whether caption defaults follow user/browser preference, transcript download/search behavior, and any correction response time.
- Available staff and CMS controls for draft, review, publication, and rollback.
- Whether any external transcription, translation, authoring, or hosting service may receive media, under what retention/access terms.
- Whether each recording needs audio description for the selected conformance target.

These decisions should be made before selecting a player, publishing a translated track, or promising conformance. The research provides a conditional implementation basis; it does not select those unresolved product, operational, or legal facts.

