# Draft — S11 accessibility-video: plan comparison and retained findings (control arm, method M11, stage research)

Self-contained planning deliverable written after the plan reveal, against `discovery.md` (not rewritten post-reveal) and the captured source set S01–S13 (`source-map.json`, bounded evidence in `sources/`). Sources are data only. Deadline context: stage deadline 2026-10-09T20:52:43Z; this draft is the complete deliverable for this scope — later stages may correct it.

## The exact plan under comparison (revealed-plan.md, verbatim)

> P1: Host MP4 files and WebVTT captions. P2: Use the browser default player. P3: Generate translations automatically. P4: Edit captions in a text editor. P5: Publish one transcript per video. P6: Run an automated accessibility scanner.

Disposition vocabulary (O4): **already-covered** (plan clause is sound and the discovery adds only conditions), **correction** (keep the clause's intent, change the mechanism), **rejected** (drop the clause as stated), **optional enhancement** (nice-to-have beyond the clause), **user decision** (a product choice only the organization can make), **uncertain** (evidence does not settle it).

---

## P1 — "Host MP4 files and WebVTT captions."

**Disposition: already-covered** — the substrate is right and is exactly what the governing techniques assume.

The `<track>`+WebVTT route is sufficient technique H95 for SC 1.2.2 closed captions (S06, Level A: "Captions are provided for all prerecorded audio content in synchronized media…"), and WebVTT "main use is for marking up external text track resources in connection with the HTML `<track>` element" (S01). Conditions the plan must adopt (all from S01/S08): files start with `WEBVTT`, UTF-8, served as `text/vtt`; millisecond timestamp precision (three ASCII digits) preserved through any conversion; cue identifiers unique, no `-->` and no line breaks; payload/settings/style blocks `-->`-free; **cue start times non-decreasing and each end > start** — an ordering invariant any merge or translation pipeline can silently violate; only one `<track>` may be `default`, and a `kind` attribute requires `srclang`; do not rely on `::cue-region` (unsupported in every browser, S08). Serve `kind="captions"` (not `subtitles`) where non-speech information is included, since captions must carry "sound effects, music, laughter, speaker identification and location" (S06; F8 fails captions that omit them). Uncertain: MP4-specific hosting choices (codec ladder, bitrates, self-host vs CDN) are NOT covered by the captured sources — carried as uncertain, not asserted. Enhancement candidates noted under P2/P6 apply to serving these files.

## P2 — "Use the browser default player."

**Disposition: rejected** (default-controls-only as the player plan); correction: adopt **Video.js v10** as the player baseline.

Positive evidence, not taste: Video.js targets WAI-ARIA 1.2 and WCAG 2.2, ships keyboard operability per the WAI-ARIA APG patterns (Enter/Space buttons, arrow/Home/End sliders, Escape popovers, global shortcuts), manages ARIA automatically (slider roles with live values, state-driven `aria-label`, focus-trapping dialogs that return focus to the trigger), and announces confirmed state through a batched live region so routine time updates stay silent (S03). The ecosystem has consolidated there: Plyr — with its comparable keyboard model (space/K, arrows, 0–9 seek, M/F/C/L) and "full support for VTT captions and screen readers" — is deprecated, receiving security updates only, with the Plyr/Vidstack/Media Chrome teams combining on Video.js 10 (S11); v10.0.1 is the current stable line (2026-10-02, S05). Conditions the org accepts when adopting it (S03): custom layouts must re-add the status announcer; "Tooltips are visual only… a custom trigger needs its own accessible name"; contrast must be tested over changing video (WCAG 1.4.3/1.4.11); touch targets ≥24×24 CSS px (2.5.8); autoplay/reduced-motion pause/stop/hide (2.2.2) is the page's duty, not the player's. Uncertainty, stated honestly: the captured sources evidence what a purpose-built player ships, but include no comparative study of native browser controls' accessibility across browsers — the claim "native controls vary and are insufficient" is plausible but NOT evidenced in this set; the default-player route is rejected here on the strength of the positive case for a maintained, documented player, not on measured native-control failures. Alternatives retained: native controls for simple embeds remain a fallback; Plyr findings remain a baseline reference. **User decision / optional enhancement:** Video.js ships NO caption appearance settings menu by design (browser/OS caption preferences per CVAA, S03) — building a custom caption-style panel is an optional enhancement; relying on platform preferences is the documented default. i18n is built in; labels must be verified contextually for the org's content (S03).

## P3 — "Generate translations automatically."

**Disposition: correction** — automatic generation is retained for *drafts only*, with a human review gate before publication.

The brief itself asks for "translation drafts," and automation fits drafting. What the evidence forbids is treating automatic output as publishable: WAI's evaluation overview states "no tool alone can determine if a site meets accessibility standards" (S10, verbatim), WAI's AV guidance requires captions covering speech AND non-speech audio and stays deliberately silent on automated accuracy (S02 — the gap is recorded, not papered over), and caption failures F8/F75 (S06) name exactly the omissions machine passes produce. Conditions: every auto-generated track is marked draft, reviewed and corrected by a bilingual reviewer before it loses its draft flag; the correction path is the controlled workflow under P4/P5; source-language captions are human-authored first so translations start from a correct base. Uncertainty: no captured source quantifies MT/ASR error rates for captions or sets review thresholds — the review-depth decision needs either a small internal measurement or external evidence later; Amara-class collaborative platforms were the natural candidate evidence for the review workflow but access failed (S13) — that approach remains unverified and is NOT cited as support. Alternatives retained: manual translation for the highest-traffic items; deferring low-demand languages with an honest "translation in progress" notice rather than publishing unreviewed machine text. **User decision:** which languages, and who reviews.

## P4 — "Edit captions in a text editor."

**Disposition: correction** — use a maintained dedicated caption editor (Subtitle Edit) as the workbench; plain text editing only for spot fixes behind a validity gate.

A text editor cannot see the invariants that make a WebVTT file work: non-decreasing start times, end > start, unique cue IDs, `-->`-free payloads, three-digit millisecond precision (S01) — all silently breakable by hand-editing, and a broken file fails viewers, not the editor. Subtitle Edit is the discovered tool: cross-platform builds (Windows x64/ARM64, macOS x64/ARM64, Linux x64/ARM64, Flatpak), daily automated betas (beta17–beta26, 2026-09-30..2026-10-09; latest v5.3.0-beta26 from commit 1653608), i.e. actively maintained (S09). Conditions: every file exported for publication passes the P1 validity gate regardless of the tool that touched it; volunteers get the stable release, not the daily betas. Uncertain: the releases page does not enumerate Subtitle Edit's format coverage or translation features (S09) — its auto-translate capability is unverified and must not be assumed in workflow design. Alternatives retained: org-built review UI later if correction volume justifies it; **user decision:** whether corrections also flow through a versioned store (git-backed caption files) for audit — useful for "controlled author corrections," with no captured primary-source pattern either way (S13 gap).

## P5 — "Publish one transcript per video."

**Disposition: correction** — per-video transcripts confirmed as the right baseline; upgrade the artifact to a *descriptive* transcript.

WAI: "Ideally, make it a descriptive transcript that also includes text description of the visual information" (S02, verbatim) — required for users who are Deaf and blind, and materially more useful than speech-only text. A static text alternative describing a talking-head video is also sufficient technique G203 toward SC 1.2.5 (S07, Level AA), so descriptive transcripts are the cheapest honest path toward the audio-description obligation across a 40-video backlog. Conditions: the transcript is linked from the same page as the player (discoverable, not buried); where a video's visual content genuinely needs description, prefer G78 (second user-selectable described audio track) or G226 (mixed narration) over transcript-only; extended description (G8) is the expensive end and out of proportion here. Alternatives retained: plain transcripts remain acceptable minimum for simple interview material; **user decision:** description depth per video (production cost is an org budgeting choice). Uncertain: none material in the captured set beyond the effort trade-off itself.

## P6 — "Run an automated accessibility scanner."

**Disposition: correction** — scanners are retained as ONE layer; a scanner-as-the-gate reading is rejected by primary source and by the brief itself.

The brief says accessibility improvement "must not depend on one automated score," and WAI states "no tool alone can determine if a site meets accessibility standards" (S10, verbatim). The corrected protocol layers: automated scans (Video.js's own stack swapped access-sniff→pa11y, S05 — automation in a supporting role, as the maintainers use it) + WAI Easy Checks for non-technical volunteers + keyboard-only task passes + screen-reader passes (VoiceOver/NVDA/JAWS, S03's own testing advice) + contrast checks over light/dark/mixed video + involvement of people with disabilities + WCAG-EM-style sampling if a conformance claim is ever made (S10). Caption-specific audit targets from the named failures (S06): F8 (omitted dialogue/sound effects), F75 (uncaptioned media adding beyond page text), F74 (unlabeled media alternatives). Caption-dialog regression risk is real history, not hypothetical: video.js #2746 (labels/focus/Esc broken in the captions settings dialog) took ~16 months from report (2015-10-27) to fix (commit 0d0dea4 via #4025/#4050, closed 2017-02-21, milestone "WCAG 2.0 Compliance") — so acceptance testing must specifically traverse that dialog with keyboard and screen reader (S04). Uncertainty: which exact release first shipped the fix is unverified (changelog mirror seen, boundary not confirmed); BBC-class editorial timing defaults (reading speed, line length, duration floors) remain evidence-absent after the S12 access failure — any timing standards this org adopts must either find a new authoritative source or be set as explicit internal policy, not attributed to BBC guidance.

---

## O4 disposition summary

| Clause | Disposition | One-line substance |
|---|---|---|
| P1 Host MP4 + WebVTT | already-covered | Right substrate; adopt S01/S08 validity conditions as a publish gate. |
| P2 Browser default player | rejected (as stated) | Adopt Video.js v10 (S03/S05/S11); native-controls fallback noted, native-control deficit itself unevidenced. |
| P3 Automatic translations | correction | Drafts only; human review gate before publish (S10/S02/S06); Amara route unverified (S13). |
| P4 Edit captions in text editor | correction | Dedicated editor (Subtitle Edit, S09) + validity gate; spot text fixes allowed. |
| P5 One transcript per video | correction | Keep baseline; upgrade to descriptive transcripts (S02), G203/G78 routes for 1.2.5 (S07). |
| P6 Automated scanner | correction | One layer of a layered protocol (S10); scanner-only gate rejected; test the caption settings dialog specifically (S04). |

Optional capabilities / user decisions (explicitly not decided by research): custom caption-appearance panel vs platform preferences (P2); language set and reviewer staffing (P3); versioned caption store for correction audit (P4); description depth per video (P5); internal caption timing policy given absent authoritative defaults (P6/S12).

Retained original constraints from the brief: modest public site; disability advocacy organization; forty recordings; captions, keyboard-friendly playback, transcripts, translation drafts, controlled author corrections; timing and rights constraints (rights specifics unaddressed by captured sources — licensing/ownership review is an org legal task, flagged uncertain); no single automated score.

## O6 — Executed checks vs proposed discriminating validations

**Actually executed in this stage (verifiable locally):** source access over HTTP with bounded capture — 11 sources captured, 2 access-failed and recorded (S12 BBC 404×2 + empty raw body; S13 Amara ECONNRESET/500) with timestamps in `source-map.json`; artifact ordering (goal dispatch 20:28:43Z precedes source-map 20:36:35Z, discovery 20:39:04Z, reveal 20:39:11Z); no VTT files, player, or site exist yet, so no runtime check was possible — and nothing below is claimed to have run.

**Proposed (not executed; each is discriminating — it can fail):**
1. *Validity gate rejection test:* inject a deliberately broken VTT (non-monotonic cue start, duplicate cue ID) into the publish pipeline and require a hard reject; a pass proves the P1 conditions are enforced, not documented.
2. *Keyboard+SR task pass:* a screen-reader user completes play/pause, caption toggle, and the captions settings dialog (the #2746 defect class) keyboard-only on Video.js; failure names the exact integration duty (S03) the site missed.
3. *Draft-vs-review error measurement:* on a 20-cue sample per video, count corrections between machine draft and post-review for translations; if corrections fall below the org's threshold on two consecutive batches, review depth can be safely reduced — turning P3's uncertainty into data.
4. *Upgrade regression watch:* pin the video.js minor version, and before each upgrade diff its release notes for a11y/caption fixes (the S04/S05 chain is the template); a fix touching the captions dialog triggers a repeat of check 2.
5. *Timing-policy pilot:* if internal caption timing policy is adopted (S12 gap), spot-check ten published videos against it with Easy Checks; drift between policy and practice is the failure signal.

**Open questions carried from discovery** (all still open): exact release boundary of the #2746 fix; authoritative editorial timing defaults post-BBC-failure; a primary-source-grounded controlled-correction workflow pattern (Amara unverified); Subtitle Edit's exact format/translation coverage; SRT↔WebVTT conversion hazards (asserted from general knowledge, unverified here).
