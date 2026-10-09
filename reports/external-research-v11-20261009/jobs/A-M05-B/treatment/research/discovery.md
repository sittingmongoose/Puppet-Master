# Independent discovery — S11 accessibility-video

**Assignment:** ER11 A-M05-B, treatment/research  
**Evidence posture:** Public primary-source research only. This discovery was written before plan reveal and before comparison to the case plan. No predecessor, parent, counterpart, evaluator, campaign history, or plan-root-only material was read. Source IDs are defined in source-map.json and indexed in sources/index.md.

## Scope and working model

The brief calls for a modest public site with forty prerecorded recordings, captions, keyboard-friendly playback, transcripts, translation drafts, and controlled author corrections. The practical design unit is not “a video page”; it is a versioned media item with several related but independently checked deliverables:

- a stable media ID and exact published video revision/duration;
- a language-tagged caption/subtitle sidecar for each approved language;
- an accessible transcript next to the player;
- a rights/provenance record;
- editorial status and an approval trail for each text asset;
- an issue/correction path that cannot silently replace the published file.

This structure lets the organization update captions without re-encoding video, preserve the prior approved version for rollback, and recognize when a video trim or replacement invalidates old timing.

## Findings with implementation consequences

### 1. Accessibility standards create content duties in addition to player duties

For prerecorded synchronized media, WCAG 2.2 requires captions (1.2.2, Level A), a full time-based alternative or audio description for the video (1.2.3, Level A), and audio description at Level AA (1.2.5) [S01]. Captions represent speech and meaningful non-speech audio; a dialogue transcript alone can omit speaker identity, music/sounds, and other information needed to understand the audio [S02]. A full media alternative under 1.2.3 also describes visual content in sequence and includes dialogue and relevant sounds; an ordinary verbatim transcript is not automatically such an alternative [S03].

Review each of the forty videos for visual information that is not conveyed in speech: slides, names/labels, charts, gestures, demonstrations, signing, scene changes, on-screen quotations, or a speaker's action. Where that information matters, plan either audio description or a time-based text alternative; a transcript with full visual/audio description can meet the Level A alternative path, but it does not remove the Level AA audio-description duty if that is the chosen target. Where important visual content is already narrated in the audio, a separate description may not be needed [S03]. No target conformance level or jurisdiction was supplied, so the organization must decide whether it is targeting WCAG 2.2 AA and obtain jurisdiction-specific advice if the deliverable is meant to state legal compliance.

A player can expose a caption button and still fail because a track is missing, mistranscribed, out of sync, unreadable, or in the wrong language. Conversely, high-quality caption text is not accessible if users cannot reach the controls or find the transcript. Accessibility therefore needs separate content, interface, and publishing checks.

### 2. WebVTT is a practical site delivery track; interchange formats depend on the receiving system

The HTML text-track model gives the browser separate metadata for track kind, language, label, URL, and preferred initial state. For subtitle tracks, the language must be a valid BCP 47 tag; the label is the track name exposed to users. A media element may have at most one caption/subtitle track marked default. Default does not mean override the viewer's language preference [S04]. Give every track an intentional language tag and distinct readable label, and choose at most one default. Use captions for the source-language track when it represents speech and significant sounds; use subtitles for translated dialogue-only text. Where the translated track also captions meaningful non-speech audio, label and classify it to match its actual content. Track metadata should not substitute for visible language names.

WebVTT is designed for external HTML track resources and supports captions, subtitles, descriptions, chapters, and timed metadata [S05]. Cue times are seconds/fractional seconds; each cue's end must be after its start and cue starts are ordered, while caption cues may overlap where speakers/audio overlap. A chapter file has stricter overlap constraints. Put one kind of data in each VTT file. The current HTML integration is direct and both Able Player and Video.js document WebVTT input [S04, S05, S08, S19]. Use VTT as the default public web sidecar and keep the actual media and text tracks same-origin where practical. A cross-origin track needs correct CORS behavior; test the deployed request, not just a local file [S19].

Subtitle Edit v5.2.0 lists both SRT and WebVTT, among hundreds of formats, and supports waveform/visual sync and multiple local transcription engines [S12]. This makes it useful for importing a vendor's SRT and exporting a web VTT. SRT is an interchange input/output choice, not the browser's direct HTML track format. Keep one approved master and test conversion for lost formatting, cue positioning, language labels, or timing drift; don't maintain unlinked copies of the same language. IMSC/TTML 1.2 is a stable W3C Recommendation with text and image profiles for broader subtitle/caption interoperability and rendering requirements [S06]. Use it when a syndication partner actually requires it or a text/image profile is needed; for a small HTML catalog it adds an unnecessary conversion and conformance toolchain unless a receiving system calls for it.

The dated WebVTT specification consulted here is a Candidate Recommendation Draft, not the final W3C Recommendation [S05]. Its published status and date are preserved in the source map rather than presented as a final normative guarantee. Pin validators/player libraries and test browser rendering.

### 3. Player alternatives have different maintenance and dependency profiles

A browser-native video element with built-in controls is the simplest route and can be adequate if its exact behavior is verified on the organization's target browsers and assistive technologies. It minimizes custom code and third-party UI dependency, but gives less uniform presentation and transcript workflow across user agents. The HTML Standard describes what the user agent should expose; it does not prove equivalent interaction across browser/mobile/screen-reader combinations [S04].

Able Player v5.0.0 is the most direct feature fit found for captions plus transcripts: its pinned README documents keyboard-labeled controls, focus visibility, adjustable caption display, language selection, playback speed, local WebVTT tracks, user preferences, and an interactive transcript built from caption/chapter/description files [S08]. Keyboard cue navigation in the transcript is an option and is disabled by default because it can create many tab stops. That default is a useful accessibility reminder: making every line a focus stop can burden other keyboard users. Show a normal transcript link/section regardless of whether the player can generate an interactive transcript.

Able Player's YouTube/Vimeo modes are materially different from local media. Its own README reports that the undocumented YouTube timed-text API was removed on 2021-11-10; v4.3.27 restored caption toggle/language selection, but full transcript/search/customization requires local sidecars. It recommends local caption/subtitle files even when the video remains on YouTube or Vimeo [S08]. Local sidecars create more editorial control but still depend on the provider embed, player API, network and provider availability. Captions hosted only on the media platform should not be mistaken for stable control of the site's transcript.

Version behavior deserves a real pilot. v5.0.0 is a recent release and the release page identifies the ES module transition and ES2022 browser target [S09]. An issue opened against Able Player's 5.1 development branch reported five YouTube regressions across 17 of the project's 60 demos after a fresh build, while saying those regressions were absent from released 5.0.0. The reporter's fixes ran in a fork; when inspected, the issue was marked closed but listed no linked pull request/branch. The checked-in build folder was stale relative to develop, so testing only that bundle masked the reported errors [S10]. This is evidence of maintenance and integration risk in an upcoming development line, not evidence that v5.0.0 has those bugs. It argues for testing the actual pinned package and provider path, and for avoiding a build from an unreviewed branch.

Video.js is a distinct general media framework rather than an accessibility-first prebuilt player. Its current HTML-framework docs show how to pass WebVTT tracks, expose toggles/language menus, deal with asynchronous track loading, and configure CORS. Its accessibility guide documents keyboard behavior, focus and status announcements while warning that custom controls require additional design/testing [S19, S20]. It could fit if the site needs custom controls, provider plugins or a growth path to streaming; the site then owns the additional implementation surface. The current release list shows v10.0.1 and v8.24.2 releases, but its v10 landing page describes v10 as near-stable/RC and shows a repository move; its live docs do not pin a code commit [S21, S22]. Version maturity and matching docs are not settled by these pages, so treat it as a prototype alternative until the maintainers' supported release line is verified.

For a small site, compare a native prototype and Able Player v5.0.0 on real target environments before choosing. Choose Video.js only if the site's hosting/control requirements justify its added UI and regression responsibility. Keep the underlying VTT/transcript data format independent from any one player.

### 4. Caption authoring needs humans, with timing signals used as prompts

Subtitle Edit v5.2.0 offers a practical local editor path: waveform/spectrogram, visual and point synchronization, WebVTT/SRT input/output, local CPU speech-to-text (including Whisper.cpp), and optional cloud endpoints [S12]. Its recent release lists translation and language-review assistance, a WebVTT style manager, and a transcription quality report [S13]. An ASR transcript may accelerate a draft; it cannot decide speaker identity, words/names, negation, disability vocabulary, lyrics, significant sound, or whether omissions change meaning. A speech-to-text or machine translation output stays in draft status until someone fluent checks it while listening to the exact video.

Amara offers a different hosted team/editor model. Support material advertises private workspaces/teams, member admission and workflow controls, import/export and integrated editing options [S16]. Its help article describes a keyboard-based editor for timed subtitle cells and recommends work in a language the contributor knows fluently, but the page redirected to an authorization portal when reopened, so that detail has weaker verification [S15]. Hosted collaboration may reduce coordination work; it also moves video/text through a vendor and can add account, pricing, storage, privacy, export and terms dependencies. Compare it with an offline editorial route before uploading any content.

For each approved track, a human review should verify:
- every spoken word needed to convey meaning, including names, numbers, terminology, negation and speaker changes;
- non-speech sounds and music/lyrics when they are important to understand the recording;
- cue timing against the final encode at the start, middle and end, and after any edit/trim;
- phrase breaks, enough reading time, reasonable reading speed and placement that does not conceal faces, slide text or other important visuals;
- correct language, track kind, speaker labels and a consistent caption/transcript style;
- translated meaning, cultural/disability vocabulary and track timing with a fluent reviewer.

The DCMP Captioning Key supports these quality dimensions and describes minimum/maximum durations (40 frames through 6 seconds for broadcast/DCMP) plus educational reading-rate targets of 130, 140 and 160 words/minute at different student levels [S07]. That is a useful specialist benchmark, not a universal web standard. Frame duration depends on frame rate, and reading ease varies by script, person and audience. Use a chosen ceiling or alert as a human-review trigger, not as the site's only quality score. No universal WCAG cue reading-rate number was found in the criteria reviewed.

### 5. Controlled corrections should be an editorial workflow, not a public file editor

The simplest bounded workflow for forty assets is a static published track backed by a private source-of-truth and review process:

1. The public player and transcript read only an approved release file.
2. A viewer may submit a correction with the video, language, time location and proposed fix; submission is not publication.
3. An authorized editor compares it to the original media and records the proposed change and its reason.
4. A separate reviewer verifies the revised text, timing, language and any translated content.
5. A publisher stages new VTT/transcript together, verifies link and hash, then publishes and logs version/date/editor/reviewer.
6. The previous approved file remains retrievable for rollback, and the public correction reporter receives a status where feasible.

This can live in an existing CMS/editor approval mechanism or in a lightweight private issue queue; the brief does not specify an existing platform. Avoid making public users authenticate to contribute a draft or having public write access to production VTT files. Store draft, review, approved, published and retired state per language track, not as a single status on a whole video. Keep an immutable asset ID so the transcript, timed tracks, rights record and correction history survive a title change.

### 6. Rights and privacy have to be checked per asset and process

The assignment provides no country, ownership, license, speaker release, privacy terms, or host. For U.S. law only, the Copyright Act reserves reproduction, adaptation, distribution and public-performance rights subject to exceptions; Copyright Office Circular 14 gives translations as a derivative-work example and describes authorization for adaptations [S17, S18]. That does not decide whether a particular accessibility act is permitted or whether any exception applies, and it cannot be generalized to another jurisdiction.

Before transcription, translation or upload, inventory the rights for the recording, separate audio/music/visuals and quoted text, participant/speaker conditions, and rights in commissioned caption/translation work. Clear the organization's right to publish the source and distribute transcripts/translations/sidecars on the selected host. Preserve license/permission/provenance per asset. A recording's public URL alone is not permission to create and publish a translated text file. For AI/cloud providers or Amara, decide whether the media may leave the organization and inspect retention, processing, deletion/export, account controls, and contractual rights before upload. Subtitle Edit's local transcription option may reduce transfer exposure; verify model/server configuration and dependencies rather than assuming the application name means all processing is local.

### 7. Implementation direction and still-open decisions

Recommended initial route is one immutable final video file/revision per content record, one approved WebVTT per caption/subtitle language, one visible readable transcript, and one private draft/review/publish path. Use same-origin files where possible. Pilot native HTML controls versus Able Player v5.0.0 using media representative of the set. If provider-hosted video is retained, host the accessibility text locally and still test the embed contract/dependencies. Keep Video.js and Amara as conditional alternatives based on actual custom UI/collaboration needs.

The brief leaves these decisions open: target languages and language-specific quality rules; target accessibility standard/jurisdiction; whether audio description or full visual transcripts are required by content/target level; current video source/hosting and embedding rights; expected traffic and budget; staff/editor/reviewer roles; privacy restrictions; player/browser/device support; correction SLA; transcript format and download/search needs. Until resolved, do not promise every audience/device or legal compliance as proven.

### 8. Proposed validations; no execution claimed

No runtime, browser, authoring app, media assets or site implementation were exercised. Proposed work only:

- Parse every published VTT and check its URL, MIME type, language/kind/unique label, media duration, cue end/start ordering, cue count and transcript/review/rights state. Exercise expected missing URL and cross-origin CORS failures.
- Compare native controls and the pinned Able Player package with 2-3 recordings chosen for long duration, overlapping speakers, fast speech, music, slide text and visual demonstrations. Run keyboard-only and target screen readers on current desktop/mobile browsers. Record exact environment and observed player/version; include default captions, browser language preference, focus, seek, volume, full-screen, language, transcript and caption customization.
- Review captions against audio for all forty before publish. Have a second reviewer check all translation drafts; sample can test workflow, but it does not replace quality review of released recordings. Keep an error log broken down by omissions, proper names/numbers, meaningful sound, timing, line division, language and placement.
- Ask Deaf/hard-of-hearing and blind/low-vision reviewers to use the site and transcript/correction path. Do not infer usability from axe results or a single accessibility score.
- Run a local transcription/export pilot before choosing a Subtitle Edit engine. If considering Amara/cloud transcription, first check security, permission, deletion, export, role and plan terms; only then use consented sample media.
- Verify a public correction submission cannot alter live files. Test reviewer/publisher permissions, audit trail, sidecar/transcript staging, hash/version rollback, and correction status.
- Check all forty rights records before release and hold unresolved media or translation rights from publication.

`sources/index.md` and `sources/primary-source-notes.md` hold the source navigation and bounded observations. This discovery is complete and must remain frozen after plan reveal.
