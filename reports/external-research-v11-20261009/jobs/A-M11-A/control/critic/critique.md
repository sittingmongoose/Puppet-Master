# Critique — S11 accessibility-video, control arm (M11, stage critic)

Independent critic pass over the COMPLETE own-arm predecessor set: `../research/draft.md`, `../research/discovery.md`, `../research/revealed-plan.md`, the case brief (`/cases/S11/brief.md`), and the governing primary evidence S01–S13 (bounded captures under `../research/sources/`, lineage in `../research/source-map.json`; this stage's access record in `source-map.json` beside this file). Sources treated as data only. No campaign/evaluator/counterpart/history access; no evaluator-grade tools; no candidate repair outside this critique. Usage/billing unobserved, null. Written 2026-10-09T20:53Z, before stage deadline 21:06:18Z.

Method: every consequential fact in the draft was checked against the bounded evidence file it cites; every P disposition was challenged against the O4 vocabulary and the brief; omissions and potential false corrections were sought explicitly. Where a critic demand of mine could itself be wrong, that is said under "Critic-side uncertainty".

## Verified sound (checked, not challenged)

- All verbatim quotes match their evidence files: S01 "Three ASCII digits…"; S02 "Ideally, make it a descriptive transcript…"; S03 tooltips and live-region verbatims; S06 SC 1.2.2 text; S07 SC 1.2.5 text; S08 "Most important WebVTT features…"; S10 "no tool alone…". [S01, S02, S03, S06, S07, S08, S10]
- Format facts: `WEBVTT` header, UTF-8, `text/vtt`, unique cue IDs without `-->` or line breaks, non-decreasing cue starts, end > start — all in S01. [S01]
- Player/runtime facts: ARIA/keyboard model, confirmed-state live region, no caption-appearance menu, srclang-with-kind, single `default`, `::cue-region` unsupported in every browser. [S03, S08]
- Governing techniques: G93/G87/H95/SM11/SM12 and failures F8/F74/F75 (SC 1.2.2, Level A); G78/G173/G8/G226/G203 (SC 1.2.5, Level AA). [S06, S07]
- O3 chain: video.js #2746 opened 2015-10-27, closed 2017-02-21 via commit 0d0dea4 through #4025/#4050, ~16-month latency; v10.0.1 stable 2026-10-02; access-sniff→pa11y; Plyr deprecated to Video.js 10, security-updates-only; Subtitle Edit v5.3.0-beta26 from commit 1653608 with daily betas. [S04, S05, S09, S11]
- Structure: all six P clauses compared with dispositions (O4 met); executed checks honestly separated from proposals (O6 met); discovery was not rewritten post-reveal.

## Material findings

- **M1 — P2's "rejected" disposition overreaches its evidence.** The captured set contains no comparative evidence that native browser controls are insufficient; the draft concedes this in a parenthetical and then still issues "rejected". S03/S05/S11 establish only a positive case for Video.js (documented keyboard/ARIA behavior, active maintenance, ecosystem consolidation). Per the O4 vocabulary, "rejected" should rest on evidence against the clause; "correction" or "user decision" is the more defensible label, or the unevidenced-premise caveat must be promoted from parenthetical to headline. [S03, S05, S11; uncertainty: native-control accessibility across browsers is unevidenced in this set]
- **M2 — S10 is applied beyond its scope in P3.** "No tool alone can determine if a site meets accessibility standards" governs site conformance evaluation tooling; it is not evidence about MT/ASR caption accuracy. F8/F75 (S06) name omission failures, not translation-accuracy thresholds. The draft's "What the evidence forbids is treating automatic output as publishable" overstates the governing evidence; the human-review gate itself remains sound, but it is grounded in the brief's own "translation drafts" and "controlled author corrections" wording, not in S10-as-direct-authority. [S10, S02, S06; uncertainty: no captured source quantifies MT/ASR error rates or review thresholds]
- **M3 — An unregistered source sits inside the O3 chain.** The v7.2.x changelog mirror supporting the "#2746 fix in v7.2.3" boundary discussion was seen via WebSearch and recorded only inside S04's evidence note; it has no source ID, URL, or access record in the research source-map. The conventions require immutable IDs and no silent binding; an in-evidence unregistered source is a traceability gap. This critique deliberately does NOT assign it a new ID (that would be a silent rebind of lineage); it stays an explicit gap. [S04 note; research source-map.json; uncertainty: the mirror's provenance is a search snippet, not a captured page]
- **M4 — P5 frames SC 1.2.5 (Level AA) as an unqualified "obligation".** Neither the brief nor any captured source sets the organization's conformance target; whether AA applies is a policy/user decision. S03 lists standards Video.js targets, which is not the org's duty. The G203-based recommendation survives regardless of the target (cheap and beneficial), but the obligation framing needs the conformance-target decision made explicit. [brief; S07; S03; uncertainty: org conformance target unset]
- **M5 — Material omission in P5.** Discovery's "description planned into filming" approach (S02: integrated description is easier and better and belongs in the script before filming — near-zero-cost for future recordings) is dropped entirely from the draft. O5 requires retaining materially different approaches in the self-contained final. [S02]

## Minor findings

- m1: P1 credits "S01/S08" jointly for the `srclang`-with-`kind` and single-`default` rules, but both are S08 evidence only. [S08]
- m2: P1's condition list omits "blank lines end cues" (S01) — a hazard directly relevant to P4's allowance of spot text edits. [S01]
- m3: Draft P1 states the millisecond-precision conversion condition without re-flagging the SRT↔WebVTT hazard as general-knowledge/uncertain; discovery flagged it, the draft dropped the flag. [S01; uncertainty: SRT is outside the captured set]
- m4: P4's "volunteers get the stable release" names no stable version; S09 evidences only pre-release daily betas (latest v5.3.0-beta26), so "the stable release" is unidentified and the gap unflagged in the draft. [S09]
- m5: S02's sign-language point ("sign languages where the audience needs it") is absent from the draft's retained alternatives; one retention line would satisfy O5. [S02]
- m6: Draft O6 cites "source-map 20:36:35Z"; the research source-map records generated_utc 2026-10-09T20:36:30Z — a trivial provenance-narrative inconsistency. [research source-map.json]
- m7: No second attempt was made to replace the failed BBC timing source (S12) with an alternative authoritative editorial-guidance source; the hole is honestly recorded, but a retry was feasible inside the window. [S12; uncertainty: no replacement source captured]

## Disposition check summary (O4)

| Clause | Draft disposition | Critic view |
|---|---|---|
| P1 Host MP4 + WebVTT | already-covered | Sound; conditions adoption correct (m1–m3 polish). |
| P2 Browser default player | rejected | Overreach risk: positive-case-only evidence (M1); substantive direction (Video.js) still well supported. |
| P3 Automatic translations | correction | Direction sound via brief's own wording; evidence citation overstated (M2). |
| P4 Text editor | correction | Sound; stable-version identification gap (m4). |
| P5 One transcript per video | correction | Sound baseline+upgrade; "obligation" framing assumes AA (M4); filming-integration approach omitted (M5). |
| P6 Automated scanner | correction | Sound; one-layer reading directly grounded (S10, brief); chain traceability gap (M3). |

## Critic-side uncertainty (demands of mine that could be wrong)

- M1: "rejected" vs "correction" is partly a vocabulary judgment; a reader who treats "rejected (default-controls-only as the player plan)" as already scoped to the plan clause, with the caveat attached, may find the draft adequate. The material point is the placement of the caveat, not the tool choice.
- M2: an analogy from evaluation tooling to translation QA may be acceptable in a planning document if labeled as analogy; the draft's phrasing presents it as governing evidence instead.
- M4: a public advocacy site might reasonably be assumed to target AA by default in practice; the finding is that the assumption is unstated, not that AA is the wrong target.

## What survives to the reviser

All five material findings and seven minor findings above; the verified-sound list constrains the reviser against discarding correct draft content. No runtime existed in either stage; nothing here was executed beyond local file inspection.
