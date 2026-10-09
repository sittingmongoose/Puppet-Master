# Independent critique — S11 accessibility-video

**Assignment:** ER11 A-M05-B, treatment/critic; M05 retained-investigator method.  
**Inputs inspected:** the exact S11 brief and revealed six-clause plan, the complete treatment research discovery and draft, its source map and bounded primary-source notes, plus independent public W3C/WAI primary sources.  
**Disposition:** substantial research is useful and mostly evidence-bounded. The consequential weakness is plan interpretation: several “corrections” criticize stronger claims than the six clauses actually make. The retained investigator should preserve the research while revising those dispositions and keeping product choices conditional.

## Material findings

### 1. P3 does not say that machine translations will be published without review

The clause is **“Generate translations automatically.”** In isolation it could mean machine-generated draft text or automatic publication. The brief explicitly asks for translation drafts, so draft generation is consistent with the stated scope. The research draft appropriately recommends human review before publication, but its heading “Rejected as a publish rule” risks attributing a publish rule to the plan that is not there. The source record supports available draft-generation routes and their limits; it does not resolve what the plan author meant.

**Adjudication:** mark P3 **ambiguous / user decision**, retaining machine generation as an optional draft aid and rejecting only automatic publication without review. If output stays an internal draft, do not make final translation QA a release gate. If it is published, verify meaning, language, timing, and rights first. Human review is the safe release condition, not a reason to reject automated draft creation. Preserve that distinction in the final.

### 2. P4’s “text editor” is not inherently an error

The clause is **“Edit captions in a text editor.”** WebVTT is a UTF-8 text-based timed-cue format, so a plain text editor can make valid content edits and retain timing. The research draft says text editors do not guide timing or segmentation; that is a sound reason to recommend a subtitle editor for synchronization work, but it does not establish that the plan’s tool is unusable or incorrect. In this small project, the distinction matters: a specialty application adds an installation, staff training, and workflow choice.

**Adjudication:** change P4 from **Correction** to **already covered for text-only edits; optional enhancement for timing-heavy authoring**. Recommend a timed-text editor such as the evidenced Subtitle Edit release for waveform/visual sync and conversion, while allowing minor VTT wording repairs in a text editor when existing timings are preserved and the changed file is parsed and watched against the final encode. Do not claim a specialized editor is a standards requirement.

### 3. P5 already meets the brief’s transcript count

The clause is **“Publish one transcript per video.”** That is the minimum expressly requested by the brief. The draft calls this a correction and then correctly explains two possible additions: a transcript offered in each approved translation language, and a descriptive time-based alternative where needed for WCAG 1.2.3. Neither addition follows from the clause or the supplied product brief as a universal requirement. The existing transcript may also be useful without being the WCAG full media alternative.

**Adjudication:** mark P5 **already covered as the minimum, with conditional enhancements**. Keep the standards distinction: if claiming the transcript satisfies 1.2.3, it needs correctly sequenced auditory and visual information and interaction outcomes; an ordinary dialogue transcript is not enough. If target conformance is AA, assess audio-description needs under 1.2.5. Additional translated transcripts, source-language policy for mixed-language recordings, and the player’s transcript presentation remain product decisions. Do not downgrade the plan’s explicit transcript deliverable while expanding it.

### 4. P6 asks for a scanner; it does not claim a scanner proves accessibility

The clause is **“Run an automated accessibility scanner.”** The draft’s warning against treating a scan as conformance proof is correct, but the plan itself does not say the scan is sufficient. Calling P6 a correction therefore overstates the defect. Independent W3C WAI guidance says tools can find potential issues but cannot automatically check every aspect, can mislead, and need human judgment. This supports the draft’s proposed separation of automated page checks from human media/content checks, not a rejection of the plan clause.

**Adjudication:** mark P6 **already covered, with clarification**: retain one selected scanner for detectable page/player-shell checks and report its version, scope, and findings; pair it with track integrity checks, keyboard/screen-reader evaluation, actual caption listening, and user review. Narrow the draft’s claim that a scanner catches “keyboard issues” to particular detectable failures; general keyboard operation must be tried. A web-page scanner should not be represented as testing VTT accuracy, visual description, translation quality, or media rights.

### 5. Rights language needs to stay jurisdiction- and use-conditional

The draft correctly says the assignment supplies no jurisdiction, rights chain, or license and that its U.S. sources cannot resolve global obligations. Some sentences nevertheless make clearance sound like a categorical precondition to even internal transcription (“Rights clearance comes before transcription and translations”). The cited U.S. sources describe exclusive rights subject to exceptions; they do not determine this organization’s rights, exceptions, or whether an internal draft versus a public derivative requires separate permission.

**Adjudication:** retain a per-asset rights and consent check before public distribution or external upload, especially for translations, music, third-party text, and commissioned work. Phrase it as a fact to establish with the owner/jurisdiction, not a legal conclusion that every caption edit requires a separate license. Internal draft work, public release, and sending media to a hosted vendor are distinct decisions. No legal conclusion can be made from the supplied facts.

## Clause-by-clause disposition review

| Clause | Research draft disposition | Critic’s disposition | Assessment |
|---|---|---|---|
| **P1 — “Host MP4 files and WebVTT captions.”** | Already covered, with conditions | **Already covered, conditional** | Sound practical baseline. Keep exact media revision/timing, correct track kind/language, and deployment fetch checks as implementation conditions. MP4 and hosting capacity/rights are not established by the brief; do not imply the format decision resolves those facts. WebVTT’s dated W3C publication is a Candidate Recommendation Draft, not a final Recommendation; this limitation is correctly disclosed. |
| **P2 — “Use the browser default player.”** | User decision, pending comparative validation | **User decision, pending a declared support matrix** | Sound. Native controls are a reasonable low-dependency option, not a verified accessibility result. Able Player and Video.js feature claims are not conformance evidence. Select actual browsers, devices, and assistive technologies before the pilot; compare the same representative recording and task set, then record observations. No player is selected by the evidence. |
| **P3 — “Generate translations automatically.”** | Rejected as publish rule; optional as draft assistance | **Ambiguous / user decision** | The risk is unreviewed publication, which the clause does not explicitly state. Keep optional machine draft generation; distinguish draft and approved states and gate publication on a fluent review. |
| **P4 — “Edit captions in a text editor.”** | Correction | **Already covered for text edits; optional specialist editor** | A text editor can author valid WebVTT. A time-aware tool reduces timing and conversion effort. The research identifies a useful enhancement, not a necessary correction to the plan. |
| **P5 — “Publish one transcript per video.”** | Correction with original minimum retained | **Already covered as the requested minimum** | Keep the transcript. Add a descriptive time-based alternative/audio description only where the content and target require it; decide separately whether translated tracks need companion transcripts. |
| **P6 — “Run an automated accessibility scanner.”** | Correction; one auxiliary check | **Already covered, with scope clarification** | Retain the scanner and make clear it is one source of evidence. The plan does not assert that it replaces content QA or user evaluation. |

## Findings the final should retain

- The distinction among captions (speech plus meaningful audio), translated dialogue subtitles, transcripts, and audio description/full media alternatives is central. A visible caption control alone does not make the text accurate or complete.
- WebVTT is a practical browser delivery format; text tracks have kind/language/label/default semantics, and cue correctness must be checked against the exact published media. Keep one kind of track data per file and verify deployed MIME/CORS behavior when the chosen host is known.
- The native HTML player, Able Player, and Video.js have different control and maintenance surfaces. The recorded Able Player issue concerns development code and is not evidence that v5.0.0 is broken; the draft correctly limits that conclusion. The issue/release history supports a pinned-package pilot.
- Subtitle Edit and Amara are alternatives with different local/hosted workflow and data dependencies. A local transcription option does not guarantee every dependency is local; a hosted team is not assumed private or suitable without checking current terms and roles. Neither tool replaces a human release review.
- Timing-rate/duration guidance is context-specific. Do not turn a DCMP educational/broadcast benchmark or a scanner result into a universal WCAG score. Human review of the actual source audio and final timing remains essential for published captions/translations.
- The draft’s asset/version record, correction queue, rollback, and role controls are useful design suggestions, not all mandatory requirements of the brief or an identified CMS. Preserve them as a modest proposed workflow and flag staffing/role separation as a decision.
- All player, authoring, parser, user, and rights validations are proposals. No implementation, content files, player, or authoring app was tested here; retain that execution status explicitly.

## Minor findings and open questions

1. The brief requests translation **drafts**, not necessarily public translated tracks. Keep them in a draft state until the organization chooses which languages to publish and who can review them. “Review every translation before publication” is sound; “review every internal draft before it exists” is not implied.
2. Requiring a separate reviewer and publisher for every correction is a strong control, but the team size and CMS are unknown. Offer separation as a recommended control when staffing permits; identify a smaller-team approval alternative rather than treating a three-person workflow as settled.
3. The brief says forty recordings but does not provide assets. Proposed “all 40” parsing and review applies once tracks exist; a representative pilot can validate the process, but cannot substitute for review of every track actually released.
4. Sign-language interpretation, exact target languages, language tags, whether transcripts are downloadable/searchable, caption defaults, correction response time, expected traffic, and the support matrix remain open. Do not infer them from “disability advocacy organization.”
5. Rights, vendor privacy/retention, and permitted media use should be documented as unresolved facts. The public availability of a video is not itself evidence of redistribution or derivative-work permission, but the research does not determine which exceptions or agreements apply.

## Validation review

The proposed checks are discriminating and appropriately marked as unexecuted. Keep the split explicit:

- **Static/content checks:** VTT parse, URL/MIME, track metadata, cue ordering/end versus final duration, transcript association, version/review fields. These catch structural defects, not transcription truth or semantic access.
- **Player checks:** test keyboard, focus, seek, captions, language selection, transcript access, failure/fallback, and assistive technology behavior on the organization’s actual chosen support matrix. Native controls and a pinned alternative must use the same media and test cases.
- **Human media checks:** listen/watch each track that is going to be published; review meaningful sounds, names, omissions, timing, line breaks, placement, language, and visual description. Test translations with a fluent reviewer. Invite disabled users to evaluate the resulting site and correction route.
- **Workflow checks:** test that viewer submissions cannot modify live files, that an authorized release has a version/rollback record, and that any external service is approved before media is uploaded.

Do not report a parser, scan, or representative pilot as if it proved content or overall WCAG conformance. The assignment provided no runtime or media assets, so these checks were not performed.

## Primary evidence additions

The independent W3C/WAI source added for this critique is S23 in source-map.json. It supports the scanner boundary above. S24 independently checks the WCAG 2.2 audio-description interpretation used in the predecessor draft: the criterion is Level AA, and WAI explains that description conveys important visual details not understandable from the main soundtrack; where the video information is already in the audio, additional description is unnecessary. This confirms the draft’s conditional reading. Bounded observations and exact locators are in sources/primary-source-notes.md.
