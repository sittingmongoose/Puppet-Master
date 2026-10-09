# Critique — accessibility-video plan review

**Case:** S11 · **Block/arm:** A-M05-B / control · **Stage:** critic · **Method:** M05  
**Review date:** 2026-10-09 UTC  
**Decision:** Return for targeted corrections before treating the research draft as final. The draft is strong and covers all six revealed clauses, but its visual-access language needs a normative distinction and a delivery qualification. One citation is not resolvable from the exact predecessor source map.

## Scope and evidence reviewed

I read the assigned S11 brief; the complete own-arm research draft, discovery, revealed plan, and source-map listed by the exact critic input map; and the declared research sources index and evidence notes. I independently checked the public primary sources indexed C01–C09 in the accompanying source-map.json. I did not inspect the supplemental source-map file linked from the index because it is outside the exact predecessor list and declared source root.

This is a source and reasoning critique. I did not run a media player, editor, validator, scanner, source video, browser or assistive technology. I therefore make no runtime or content-QA claims.

## Material findings

### M1 — Separate Level A media alternatives from Level AA audio description

**Affected draft text:** P5 disposition and amendment; “User decisions and unresolved uncertainty”; “Visual access and alternatives” validation proposal 6.

The draft correctly identifies the visual-information gap and cites WCAG 2.2 SC 1.2.3 and 1.2.5. Its proposed wording still risks treating a transcript or a full time-based media alternative as sufficient at any selected conformance level. Under WCAG 2.2, SC 1.2.3 is Level A and permits an audio description or a full time-based media alternative. SC 1.2.5 is Level AA and requires audio description; WAI explains that the Level A text alternative does not replace the AA audio-description requirement. Additional audio description is unnecessary when the important visual information is already conveyed in the existing audio track. A readable transcript is not automatically a full time-based media alternative and is not itself audio description. [C01, C02]

**Required correction:** Make the target conformance level an explicit organization decision, then keep three deliverables distinct: (1) captions for audio, (2) a readable transcript, and (3) visual access by audio description or a qualifying media alternative. For a WCAG 2.2 AA target, decide per video whether existing audio conveys all important visual information; if not, provide audio description in a user-accessible form. A full media alternative alone is the SC 1.2.3 Level A route, not a substitute for SC 1.2.5 at AA. Preserve other jurisdiction/contract requirements as open until the organization identifies them.

This is a correction to the draft’s phrasing, not a claim that every recording necessarily needs newly produced description. The correct result depends on each recording’s content and the organization’s chosen target.

### M2 — Treat descriptions tracks as a delivery mechanism to prove in the target stack

**Affected draft text:** P1 (“WebVTT as the web caption/description/chapter delivery format”), content model’s track advice, and visual-access validation proposal 6.

The HTML Standard defines a descriptions text-track kind, but a valid WebVTT file plus that kind does not by itself demonstrate that the chosen browser, player and assistive-technology combination exposes and plays the description accessibly. WAI lists use of the HTML track element for audio descriptions as an advisory technique; its Understanding material separately describes user-selectable audio tracks and described versions. [C02, C04]

**Required correction:** State that descriptions text tracks are one candidate integration path, subject to the selected support matrix. In the pilot, verify how users discover, enable and perceive the description in every selected browser/player/AT combination. Keep a user-selectable audio-described soundtrack or described video version as a candidate fallback when text-track delivery is unsupported or unusable. Do not count a description track as an AA result until the complete path has been demonstrated. This narrows an implementation implication; it does not reject WebVTT or the HTML track model.

### M3 — Resolve the draft’s S16 references without silently reusing an ID

**Affected draft text:** P5 and validation proposal 6 cite S16.

The exact allowed predecessor ../research/source-map.json contains source IDs S01–S15 and no S16. The permitted sources/index.md points to a supplemental map outside the exact input-map predecessor list; I did not read that file. Thus the two S16 citations cannot be resolved from the evidence set this critic was authorized to inspect. The independently inspected W3C evidence for this finding is recorded under new critic IDs C01 and C02. [C01, C02]

**Required correction:** When revising the research artifact, either cite the verified supplemental record through an explicitly authorized/declared source-map update or add a new immutable source ID with the exact W3C URL, version, locator and access time. Do not silently assign a new source to S16. This is a provenance defect, not evidence that the draft’s WCAG statement is false.

## Clause-by-clause disposition audit

| Exact clause | Critic assessment |
| --- | --- |
| **P1 — “Host MP4 files and WebVTT captions.”** | **Disposition is sound with one qualifier.** WebVTT is a sensible browser delivery format, and the draft properly leaves hosting, codec, rights and media-fallback choices open. Keep the explicit language/kind distinction and local master. Add M2 so “description track” is not read as proven accessible delivery merely because HTML defines the kind. |
| **P2 — “Use the browser default player.”** | **Disposition is sound.** Rejecting “default player” as a complete product requirement is justified by the need to test keyboard, track selection, transcript/navigation and user-agent differences. Comparing native controls with a tagged Able Player build is a proposed discriminating test, not an assertion that either passes. The draft appropriately warns that the Able Player feature list is not evidence of performance on this site. |
| **P3 — “Generate translations automatically.”** | **Disposition is sound and appropriately conditional.** The draft rejects automatic output as the publication/approval rule while retaining machine translation as an optional draft path if languages, rights, processing and human review are approved. It does not wrongly prohibit automation. The needed language and reviewer capacity remain organization decisions. |
| **P4 — “Edit captions in a text editor.”** | **Correction is useful but slightly over-prescriptive.** A media-aware timeline editor is valuable when creating or materially retiming captions. The brief does not state existing cue quality, clip lengths or the amount of timing work; a text editor may be the more direct tool for wording corrections to already synchronized VTT. Phrase the editor recommendation conditionally and measure both workflows on a representative clip. Subtitle Edit 5.2.0 is a candidate, not an evidenced requirement. [C09] |
| **P5 — “Publish one transcript per video.”** | **The transcript recommendation is sound; its relationship to media alternatives/audio description needs M1.** Keep a readable source-language transcript as the minimum product obligation. Treat translation transcripts as separate reviewed deliverables if offered. Do not use “transcript” as shorthand for captions, a full time-based media alternative, or audio description. |
| **P6 — “Run an automated accessibility scanner.”** | **Disposition is sound.** The draft rejects a scanner as the sole gate but retains it as an optional markup check alongside full-content human review, target-browser/AT testing, user feedback and per-item rights/status review. This matches the brief’s constraint that improvement cannot depend on one automated score. |

## Minor findings and uncertainty

1. **Qualify the Able Player release state.** The releases page shows v5.0.0 (8d235f9, 2026-06-21) as the latest stable release, and v5.1.0-beta2 (c4f10ab, 2026-10-06) as a newer pre-release. The draft’s v5.0.0 stable baseline remains defensible, but its alternative table should name the beta as a pre-release available for evaluation and distinguish “latest stable” from “latest release.” The inspected release notes do not establish whether the beta contains PR #778’s YouTube fixes; keep that unverified until the tag/build is inspected or tested. [C06, C08]
2. **Keep regression-history attribution explicit.** This part of the draft is otherwise careful: issue #775 records a reporter’s develop-branch result and says the checked-in build directory was stale; PR #778 merged cd617fc into develop and showed seven checks. These records do not prove an independent reproduction, a tagged stable release containing the fix, or a defect in local-file playback. Keep the draft’s limitations and regression-fence proposal. [C07, C08]
3. **Disambiguate the executed-checks sentence about an input map.** The research draft says “the map declared no predecessors and no source roots,” while this critic’s exact input map lists four predecessors and one source root. Because the draft is labeled as the earlier research stage, the sentence may refer to that stage’s different map; the exact predecessor set does not include it, so I cannot verify or refute the statement. Name the research-stage map (and, if available, its immutable hash) so it is not confused with the current critic map.
4. **Do not overstate tool-feature evidence.** The draft already labels the Able Player and Subtitle Edit statements as documentation claims, qualifies the rolling Subtitle Edit docs, and proposes testing actual builds. Preserve those qualifications. The primary-source review here confirms standards and version/release history only; it does not verify any product’s runtime behavior.

## Coverage, omissions, and validation

The draft compares every exact P1–P6 clause and distinguishes correction, optional enhancement, user decision, already-covered, rejection and uncertainty. It retains the useful alternatives (native HTML controls, Able Player, Subtitle Edit, Amara, YouTube Studio, and format interchange), preserves the forty-recording scope and rights uncertainty, and separates proposed checks from executed checks. Its issue/fix evidence is used with appropriate limits. I found no basis to reject the overall workflow, the proposal to keep portable approved masters, the human review gates, or the scanner’s supporting role.

After M1–M3 are addressed, the most discriminating next work remains proposed, not run: an actual player comparison in the selected browser/AT matrix; per-video review of visual-only information against the chosen WCAG level; and end-to-end tests for cue parsing/rendering, language approval, correction/version history and rights workflow. No runtime or media asset was made available to this critic, so the draft is right to report those as unexecuted.

## Conclusion

The research draft is substantially complete and fits the brief, but it should not be handed forward unchanged. The visual-access clauses need an explicit Level A/AA rule and a tested delivery path, and the S16 citations need a resolvable immutable source record. The editor and Able Player release wording need only the limited qualifications above. No project execution or accessibility validation is claimed by this critique.
