# Complete research draft — S11 accessibility-video

**Assignment:** ER11 A-M05-B treatment/research; method M05 retained investigator  
**Plan compared:** the exact frozen own-case plan in revealed-plan.md.  
**Discovery status:** discovery.md was frozen by reveal-plan.py before this comparison and is not revised here.

## Recommended product and editorial direction

Build the forty-video library around approved MP4 revisions with sidecar timed text, an accessible transcript presented on the video page, and a review-controlled update route. WebVTT is a sensible delivery format for browser HTML tracks, but the site must encode which media revision, track kind, language, and approved text it belongs to. The player choice remains conditional on a real comparison: native HTML controls are a good low-dependency candidate; Able Player v5.0.0 adds transcript, caption preference, language, and keyboard features that are relevant to this product; Video.js is a possible custom framework if actual streaming or player extensibility needs justify its additional work. A stable public playback experience should not rely on provider caption APIs alone.

Use a format-aware editor and, optionally, local recognition or translation as a draft aid. Each published caption and translation needs a human who can review its language against the video. Keep draft/review/approved/published states separate. Viewers may suggest changes; only authorized authors and reviewers can replace an approved public track.

The scanner in the thin plan can cover some web-structure failures. It cannot judge caption truth, sound completeness, timing, language quality, transcript visual descriptions, rights, or whether users can operate the real player. Automated and human evidence need separate reports. No automated score is a substitute for Deaf/hard-of-hearing and blind/low-vision user review.

## Exact plan-clause dispositions

### P1 — “Host MP4 files and WebVTT captions.”

**Disposition: Already covered, with conditions.** This is a practical baseline for a small static or CMS-hosted library: HTML tracks take WebVTT, and Subtitle Edit v5.2.0 handles WebVTT alongside common interchange formats [S04, S05, S12]. Keep this clause's MP4 plus VTT approach, but make it an approved versioned asset relationship, not just an upload. Every sidecar must match the exact final media timing and an explicit language/kind. Use distinct caption, subtitle, description, and chapter files; the WebVTT specification says a file carries one kind of data [S05]. Record the file and media revision hashes so a replaced encode triggers retiming review.

**Conditions and changes to its implementation:** verify ownership/permission to host each MP4 and its audio/visual contributions before publishing; choose the same origin for track/media where practical; set correct WebVTT MIME type and test 404/CORS behavior; track cue duration against video duration; expose a readable transcript and correction route alongside the player. If a syndication or platform partner requires another format, preserve VTT as the site copy and convert a release copy from it with a round-trip comparison. Use IMSC/TTML only for a demonstrated partner need or an identified styling/interchange requirement [S06]. HTML requires only one default caption/subtitle track per media element; ensure unique readable label/language pairs [S04].

**Not established:** the organization's host, file-size/bandwidth profile, media rights, whether all forty sources are MP4, any platform ingestion requirement, and the desired translation languages. MP4 is a format decision, not proof that bandwidth, video delivery, privacy or rights requirements are met.

### P2 — “Use the browser default player.”

**Disposition: User decision, pending comparative validation.** It is a reasonable low-complexity choice, but this research does not prove the exact browser/mobile controls are consistently keyboard and screen-reader friendly for this audience. The HTML Standard says user-agent controls should provide playback, seek, volume, caption selection, and other functions; actual UI support must still be observed in each chosen browser [S04]. Keep native controls as the baseline prototype, with explicit visible transcript link, caption tracks and no page-level keyboard shortcuts.

Compare that prototype with Able Player v5.0.0 [S08, S09]. Its documented controls include keyboard labels and focus indicators, caption-language selection and user appearance settings, plus an interactive transcript. Cue-by-cue transcript keyboard support is optional/off by default to avoid a long tab sequence. Able Player therefore fits the transcript and customization requirements better on paper; its ES2022 release target, integration needs, and recent provider regressions on develop mean that its exact pinned package needs testing [S09, S10]. The issue reporter says the regressions were on develop, absent in 5.0.0, and working fixes were in a fork; it is not evidence that the current v5.0.0 release is broken. A stale checked-in build also masked the errors, so compare the actual released package and fresh build.

Video.js is an alternative if a customized player, extension or stream integration becomes a real product need [S19, S20]. It supplies track and accessibility components but puts more UI assembly and QA responsibility on the site team; current docs are not commit-pinned, and its release/project pages leave v10 maturity unclear [S21, S22]. Do not pick a version until the project's supported stable line and matching docs are clear.

**Pilot requirement:** test native controls and one specific, pinned Able Player release on actual target browsers, mobile devices, keyboard-only operation and screen readers. Ask the organization to choose its support matrix and decide based on results. If controls are inconsistent or transcript/caption customization is needed, prefer the candidate that passes with the least custom control code. Do not claim player accessibility just from feature lists.

### P3 — “Generate translations automatically.”

**Disposition: Rejected as a publish rule; optional as draft assistance.** Neither auto-translation nor ASR can be treated as approved captions. The brief asks for translation drafts, which supports automation as an optional starting point. It does not authorize auto-publication. Machine output can omit/reverse negation, alter numbers/names, mistranslate disability-related or proper terms, fail to capture speaker/sound information, or exceed the target language's readable timing. Translation can preserve a wrong source transcription with fluent grammar.

Subtitle Edit v5.2.0 documents local and cloud speech-to-text and translation paths, as well as original-text preservation, waveform editing, WebVTT export and a transcription-quality report [S12, S13]. A local model may reduce transmission to a cloud provider after the organization verifies model/server configuration; cloud engines require vendor, privacy, contract, retention and permission review. Amara offers collaboration and translation workflows but entails a hosted content workflow; it is a choice only if the team approves its terms, roles, export, retention, privacy, and costs [S15, S16]. No target language, budget or engine was specified.

**Amendment:** create explicit statuses of machine draft, language/editor review, approved, published and retired. A fluent reviewer checks every translated track before publication against source speech and the approved transcript, then checks its own timing and placement. Clearly label working translations internally as draft. No unreviewed machine translation appears as an approved language option.

**Rights condition:** clear both the video and permission to make and publish translations/derivative text. This is a particularly important prior step where a video contains music, quoted text, participant terms or third-party visuals [S17, S18].

### P4 — “Edit captions in a text editor.”

**Disposition: Correction.** A plain-text editor can edit VTT characters but does not guide caption segmentation, waveform timing, visual synchronization, conversion or readable-rate checks. Use a timed-text editor such as Subtitle Edit 5.2.0 for authoring and repair. Its versioned FAQ lists WebVTT/SRT, waveform generation when FFmpeg is present, local engines, constant offset adjustment, point sync and visual sync for drift [S12]. Its latest release adds more WebVTT editing and review aids, but is fresh and should be piloted before standardizing [S13]. Confirm system dependencies and acceptable languages/fonts before adopting. Amara is a possible private-team/web editor when multiple people need shared review, subject to data and plan checks [S15, S16].

**Required process around any editor:** store the approved source separately from exports; preserve reviewer/author, version, date and reason; do not replace an approved file from an editor export until human review and staging. Check editor-produced timing against the exact published MP4, not the earlier source recording. If a transcript or captions are edited after a video trim, re-run timing QA at beginning/middle/end. Have one authorized person publish; public corrections enter a queue, not the editor or live path.

### P5 — “Publish one transcript per video.”

**Disposition: Correction with the original minimum retained.** A transcript is a useful and explicitly requested deliverable. At minimum, every video must expose a visible transcript in the language of its source audio. If the library contains multiple source languages, “one transcript per video” needs to mean at least one appropriate original-language transcript per video, not an English-only global default. When a translation track is publicly approved, decide whether a transcript in that language is also required for equal access and user utility; it should carry the same status and language metadata as its timed captions.

If the transcript is meant to provide the 1.2.3 full time-based alternative, it must describe visual information and relevant sounds in sequence, not only copy spoken dialogue [S01, S03]. If targeting AA, a static transcript alone does not discharge 1.2.5's audio-description requirement when important visual content isn't conveyed in the main audio [S01, S03]. Review all forty video contents to decide whether existing audio already describes the important visual information; include separate audio description where needed or identify a complete-text alternative for the Level A path. A normal transcript remains valuable even when video description isn't needed.

**Implementation:** add a transcript link/section immediately associated with each player, identify its language, preserve speaker labels and meaningful sounds, and use headings/paragraph structure. Able Player can generate an interactive transcript from captions/chapters/descriptions, but remains a player feature rather than the only transcript copy [S08]. No transcript representation, source language, publication languages or audio-description staffing has been specified; decide these before estimates.

### P6 — “Run an automated accessibility scanner.”

**Disposition: Correction; retain as one auxiliary check only.** Run a scanner on the page/player shell to catch some missing labels, structure, contrast declarations and keyboard issues. The scan cannot verify that an ASR output is accurate, contains significant sound, is in sync, stays on-screen, matches the language, describes meaningful visuals, or has correct rights. The player source evidence and WCAG criteria define these media and manual duties [S01-S04, S08, S20]. Able Player and Video.js provide capabilities; neither is a conformance certificate [S08, S20].

Add independent automated and manual records:
- automated: all track URLs load; content parses as VTT; kind/language/label are present and distinct; no unsupported duplicate default; cues have valid times and end before media duration; required transcript/review/rights fields exist; scanner findings and relevant release version are stored;
- human: listen/watch with each published track; inspect speech/sounds/names/numbers, timing, phrase splits, placement, translation meaning and visual description; keyboard and screen-reader evaluation; disabled-user feedback and correction accessibility;
- system process: test all assets, maintain categorized issue and fix counts and review revisions; never boil these into one automated accessibility percentage.

Keep the scanner as a cheap guardrail, not as proof that the full site or its content is accessible.

## Discoveries beyond the thin clauses

1. **Accessible prebuilt player:** Able Player maps directly to multi-language captions, customizable placement/font, playback speed, an optional interactive transcript, audio description and keyboard control. It does not remove the need to author text or validate the target release; provider caption fetch is less complete than local sidecars [S08].
2. **Format-aware desktop editor/local draft workflow:** Subtitle Edit 5.2.0 can edit/synchronize WebVTT and use local recognition options. It reduces timing work without requiring direct upload to a cloud transcription service if a local configuration is chosen, but draft quality remains human-reviewed and the recent release needs a small pilot [S12, S13].
3. **Hosted collaborative workflow:** Amara private teams may support review and roles for distributed contributors; treat account/plan/vendor protections as a dependency, not a free or inherently private assumption [S15, S16].
4. **Custom player framework:** Video.js may suit custom controls or extensions, but live docs and release maturity need confirmation; custom controls create work [S19-S22].
5. **Content record and correction trail:** Stable per-video revision plus per-language track status/rights/review and immutable approved assets directly supports author corrections without exposing production files.
6. **Platform embed/local text split:** An external provider may host the video while local site-controlled VTT/transcript files provide more reliable transcript, search and caption appearance control. This remains subject to provider embed availability, permission and a release-specific regression test [S08, S10].
7. **Context-specific timing guidance:** DCMP gives operational duration and presentation-rate guidance; it is not a universal WCAG timing score. This adds human-readable quality signals without promising one speed works for every script/user [S07].

## End-to-end editorial and publication requirements

**Per-video record:** permanent media ID, media revision/hash, final duration and source URL; language of original audio; each caption/subtitle/transcript/description's language and kind; rights permission/owner/source; author and reviewer; draft/approved/published state; file version/hash and date; media trim or replacement history; related correction tickets. Separate public language labels from internal draft states.

**Author correction:** viewer correction form asks for video, language, timestamp, current phrase if known, suggestion, and contact information optionally. The report is triaged to an editor. The editor accepts, asks for context, or rejects with a reason; accepted change goes through language/media check and a separate reviewer; only a publisher updates the public track/transcript. A publish record includes old/new hashes and rollback pointer. Users should not modify WebVTT directly, and user-submitted text should not be rendered as live markup.

**Translation:** decide languages and whether the public site offers machine-draft labels at all. Use human translation or engine-assisted draft only after permissions/privacy are checked. Preserve source text and meaning, identify approved reviewer, and recheck line division and timing in the target language. Translation needs its own timing; copying source cue durations mechanically may not be readable.

**Player and site surface:** include visible caption/language controls or browser controls proven for the target support set, transcript links, descriptive title/poster text, a no-script/failure fallback where practical, and no autoplay. Captions should be resizable/repositionable or otherwise remain readable against light/dark frame changes. The playback UI and transcript need ordinary keyboard access; do not impose a 300-cue tab sequence by default. If links/controls use headings/landmarks, test their order and labels with screen readers.

**QA dimensions:** accuracy, completeness, synchrony, readability, consistency, placement, localization, visibility in user preferences, and availability. Character/word-per-minute checks or a vendor quality report can alert a reviewer. Human review confirms whether speed and breaks work in each language. A passing syntax check is necessary but not sufficient.

## Uncertainty and user decisions

This research cannot resolve the following without product and rights facts:
- which country/regions govern site operation and which accessibility statutes or exceptions apply;
- required conformance level and any contractual accessibility requirement;
- owners/licenses for the media, soundtrack, participant speech/image, third-party text/music, translations and commissioned correction labor;
- number of source languages and target translations; dialects, language tags, and reviewers available;
- hosting provider, video embeds vs self-hosting, streaming/download use, traffic, file/codec constraints, and ability to set CORS/MIME headers;
- audience device/browser/screen-reader matrix and whether captions should start on or honor browser/user preferences;
- need for audio description for each video and whether full text media alternatives are acceptable for any target;
- correction submitter privacy, editor/reviewer/publisher role ownership, correction turnaround expectation, and whether current CMS supports immutable version and rollback;
- translation/transcription budget, privacy constraints, and hosted SaaS/vendor terms;
- transcript searching, downloading, user-editability, and localization needs.

Primary evidence boundaries: current WCAG and HTML source pages were retrieved on 2026-10-09; the WebVTT edition is a dated Candidate Recommendation Draft; Subtitle Edit v5.2.0 is very recent; Able Player v5.0.0 is recent with an open-source development/release distinction in issue #775; Video.js docs are live and unpinned; Amara article pricing/privacy was not reviewed. These facts should be checked again if implementation slips or a later version is selected. U.S. copyright sources support only a conditional U.S. rights review, not a global legal conclusion. No intended language, accessibility certification, or player choice is inferred from plan clauses.

## Proposed validation, with execution status

| Validation | What it can distinguish | Status |
|---|---|---|
| Parse/check all 40 VTT files and corresponding media records | Wrong syntax, missing/duplicate track metadata, invalid cue ordering, cue duration beyond exact media, broken URL, incomplete rights/review fields | Proposed; no files or runtime tested |
| Deploy one video and compare native controls with pinned Able Player package | Whether controls and caption/transcript/prefs work across selected desktop/mobile browsers and screen readers; whether the new release's runtime/build matches published package | Proposed; not executed |
| Force VTT missing-path, bad MIME and cross-origin CORS failures | Whether public fallback/transcript works and editors receive a repair signal | Proposed; not executed |
| Human playback of each published track and translation | Omitted speech, names/numbers, negation, important sounds, caption timing/readability/placement, localization | Proposed; not executed |
| Blind and disabled-user review of the site, keyboard controls, transcript and correction pathway | Whether implementation works with real assistive technologies and user workflows | Proposed; not executed |
| Subtitling editor pilot on fast speech, overlap, music, accents, names and on-screen text | Local engine limits, timing drift, WebVTT export and human correction effort | Proposed; not executed |
| Role/permission test of correction path | Public cannot alter live tracks, review/publish are distinct, rollback records old version | Proposed; not executed |
| Rights inventory for all 40 | Permission coverage for source media, sound, transcripts, translations and corrections | Proposed; not executed |

**Executed validation:** source-map.json parses and contains 22 unique source IDs. This is a mechanical artifact-integrity check only; no player, captions, content, or accessibility claim was tested.

The discovery file remains frozen. This draft is complete as a planning deliverable for the brief; criticism may change its disposition, not retroactively rewrite the discovery.
