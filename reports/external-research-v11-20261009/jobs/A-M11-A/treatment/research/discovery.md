# discovery.md — S11 "accessibility-video" — M11 v1 entity-community-research-synthesis

Case A-M11-A / treatment / research. Written BEFORE plan reveal (no plan-root-only.md or revealed-plan.md read).
Brief: modest public video resource site for a disability advocacy organization; 40 recordings; captions,
keyboard-friendly playback, transcripts, translation drafts, controlled author corrections; investigate
players/editors/caption formats, timing and rights constraints, implementation/fix evidence, validation
methods; accessibility improvement must NOT depend on one automated score.

Evidence conventions: source IDs S01–S22 are immutable (source-map.json). ER records are
`Entity --relation--> Entity` with condition/date/release and sources. Usage/billing for every tool:
unobserved — null. "Not investigated" is stated explicitly wherever it applies.

---

## 1. Entity–relation–entity records

### 1.1 C1 — Playback & keyboard accessibility

- ER-01 Able Player --is--> open-source fully accessible cross-browser HTML5 media player | condition: public site, self-hosted media | release: site current, v5 line | S01
- ER-02 Able Player --builds--> interactive transcript from WebVTT caption + chapter + description files at page load | condition: author-supplied VTT; the player does NOT auto-generate transcripts (issue #282 thread on auto-generation) | S01, S03
- ER-03 Interactive transcript --provides--> click-to-seek and playback-synced highlighting; keyboard navigable | condition: transcript region reachable in tab order | S01
- ER-04 HTML `<track>` --distinguishes--> kind="captions" (dialogue + meaningful non-speech audio, speaker ID) from kind="subtitles" (dialogue/translation only) | S06 W3C WebVTT, S07 H95
- ER-05 HTML `<track>` --accepts--> WebVTT (.vtt) only; SRT fails silently | condition: native HTML5 audio/video elements | S08 MDN
- ER-06 Plyr --binds--> default keyboard shortcuts when focused: 0–9 seek 0–90%, Space/K play-pause, ←/→ ±10s (seekTime default), ↑/↓ volume, M/F/C/I mute/fullscreen/captions/PiP | condition: player focused; `global` option page-wide; per-action disable via `keyboard` option | release: master README 2026-10 | S11
- ER-07 Native browser media controls --provide--> baseline keyboard operability without JS | condition: limited styling/feature control; no built-in transcript UI | derived from S08 context; flagged low-confidence (no dedicated primary fetch this run)
- ER-08 Able Player --shipped--> "user preference to disable keyboard shortcuts" | date: 2026-02-06 | release: v4.8.0, commit bbefd69 | condition: shortcuts can conflict with page-level keys/AT | S02
- ER-09 Able Player --regressed-and-fixed--> YouTube-hosted caption/subtitle support lost, then "CRITICAL: Restore support for captions and subtitles hosted on YouTube" | dates: 2023-11-16 (v4.4, commit b7f9839); v4.4.1 2023-11-21 dependency update | condition: media/captions hosted on YouTube rather than self-hosted | S02

### 1.2 C2 — Caption & transcript pipeline (formats, editors, auto-transcription)

- ER-10 OpenAI Whisper CLI --defaults-to--> `--model small`, `--task transcribe`, `--output_format all` (writes txt, vtt, srt, tsv, json) | condition: CLI as packaged on main branch; verify at implementation time | S04, S05
- ER-11 Whisper --outputs--> WebVTT and SRT natively — no format conversion needed for `<track>` | S04, S05
- ER-12 Whisper --limits--> `translate` task to English output | condition: x→en only; other targets need a separate MT step (see C3) | S04 (retrieval summary; flagged for verification)
- ER-13 Whisper model accuracy --trades-off--> tiny/base/small/medium/large-v3 (size vs accuracy); default `small` is NOT the most accurate tier | S04
- ER-14 Subtitle Edit --edits--> SRT/VTT/ASS/SSA/SUB/STL with waveform timing, translation helpers, OCR of burned-in captions | condition: Windows desktop; open source | S12
- ER-15 subtitle-editor.org --offers--> client-side web SRT/VTT editing with video preview + waveform | condition: browser-only, no install; capacity/limits unobserved (null) | S13
- ER-16 Amara --provides--> hosted team subtitling/translation with subtitle upload, review/versioning | condition: third-party hosting of caption workflow; public platform | S14
- ER-17 Caption timing quality bar --constrains--> minimum on-screen duration ≥ 0.5 s; 20–30 characters/second; ~32 chars/line; never split names/titles | applicability: US TV practice/vendor guidance adopted here as the org's in-house bar | S20 Rev, S21 3Play
- ER-18 WebVTT files --are-a--> security surface when author-edited: Able Player added DOMPurify and shipped "Security updates for search input and VTT files" | date: 2025-03-25 | release: v4.5.1, commit 7d9939d | condition: captions edited/compiled by non-trusted contributors | S02
- ER-19 Able Player WebVTT parser --tolerates--> non-standard single-digit hour in VTT timestamps | date: 2025-09-28 | release: v4.7.0, PR #645 | condition: hand-edited files with `H:MM:SS.mmm` timestamps | S02
- ER-20 Able Player --parses--> WebVTT inline timestamp tags; sanitizer had broken them | date: 2026-02-06 | release: v4.8.0, PR #693 / issue #692 "Fix broken internal timestamp tags due to sanitization" | condition: sanitization pipeline active (post v4.5.1) | S02

### 1.3 C3 — Translation drafts & controlled author corrections

- ER-21 Argos Translate --provides--> offline neural MT drafts (MIT, OpenNMT-based, Python/CLI/GUI) | release: 1.11.0, Python 3.7+ | condition: draft-only output; human review required before publishing | S22
- ER-22 LibreTranslate --wraps--> Argos Translate as an API | condition: self-hostable alternative to cloud MT | S22
- ER-23 Whisper (large tier) --drafts--> transcription and en-translation from audio; Argos --drafts--> non-en target languages from the corrected transcript | condition: chain = ASR → human fix → MT draft → human review | S04, S22
- ER-24 Controlled author corrections --require--> versioned caption artifacts and review states (draft → reviewed → published) with per-change attribution | condition: no single primary product named in sources for "controlled corrections" on self-hosted VTT; nearest evidence: Amara team review/versioning (S14); git-based VTT review is the self-hosted analog (approach, not a sourced product)
- ER-25 Translations/captions of third-party material --are--> derivative works requiring permission; recordings owned by the org avoid the main licensing risk | condition: per-video rights check; consent/privacy for speakers | evidence gap: no primary legal source retrieved this run — retained as reasoned constraint, uncertainty flagged (see §5)

### 1.4 C4 — Standards, timing & rights constraints

- ER-26 WCAG 2.2 SC 1.2.2 Captions (Prerecorded), Level A --requires--> captions for all prerecorded synchronized media except a clearly labeled media alternative for text | S09
- ER-27 WCAG 2.2 SC 1.2.5 Audio Description (Prerecorded), Level AA --requires--> audio description for all prerecorded video | S10
- ER-28 `<track kind="captions">` --satisfies--> SC 1.2.2 intent per technique H95 (captions carry other sounds + speaker ID, not just dialogue) | S07
- ER-29 FCC caption quality --mandates--> accurate, synchronous, complete, well-placed (47 CFR Part 79 metrics) | applicability: FCC-regulated TV/online programming; for this nonprofit site it is a voluntary quality bar, not an automatic duty | S18, S19
- ER-30 Able Player --meets--> WCAG SC 2.5.8 (Pointer Target Spacing) via 24px controls | date: 2025-09-28 | release: v4.7.0 | S02

### 1.5 C5 — Validation beyond one automated score

- ER-31 W3C WAI --states--> "tools can't do it all. Some accessibility checks just cannot be automated and require manual intervention" | S15
- ER-32 W3C Note --explains--> automation limits (e.g., cannot determine a pause/stop/adjust-audio mechanism) → human judgment mandatory for several SCs | S16
- ER-33 WCAG-EM --prescribes--> structured conformance evaluation combining automated + manual steps (scope → explore → sample → audit → report) | S17
- ER-34 Industry automated-coverage estimates --disagree--> ~25–50% (commonly cited) vs ~70–80% (some vendors) | condition: third-party numbers, no primary verification this run — treated as disagreement, not fact; either bound still forbids a single-score gate | search-result capture; low confidence, retained for transparency
- ER-35 No runtime in this research stage --means--> all checks below are PROPOSED, not executed | honesty marker per brief O6 | —

---

## 2. Emergent communities — condition-preserving reports

### C1 Playback & keyboard accessibility
The brief's "keyboard-friendly playback" is directly served by two sourced families. (a) **Native `<video controls>`**: baseline keyboard operability with zero JS (S08 context; ER-07, low confidence — verify at implementation). (b) **JS players**: Plyr (S11, ER-06) documents exact default shortcuts (Space/K, arrows ±10 s, 0–9 %) but is a general player; Able Player (S01/S02, ER-01–03) is media-accessibility-specific: interactive transcript built from the same WebVTT files used for captions (ER-02), long release history of keyboard fixes (v4.6.0 fixed a draggable toolbar "breaking keyboard support"; v4.8.0 added a user preference to disable keyboard shortcuts — ER-08). Condition: Able Player evidence is strong, but v5 is at RC status (2026-05-28, breaking changes) — pin the stable v4.8.x line or budget migration work. Alternative not investigated this run: Video.js, YouTube/Vimeo embeds (the v4.4 regression, ER-09, shows YouTube-hosted caption paths are a regression-prone dependency; self-hosted media avoids that class of failure for an advocacy org that controls its footage).

### C2 Caption & transcript pipeline
Whisper drafts captions directly in WebVTT (ER-10/11), but three governing defaults matter: default model is `small` (not the most accurate), default output is `all` (side files), and defaults must be checked against the packaged CLI at implementation time (S04/S05). The pipeline evidence shows hand-edited VTT is both fragile (single-digit hour timestamps tolerated only from v4.7.0, ER-19; inline timestamp tags broken by sanitization until v4.8.0, ER-20) and a security surface (v4.5.1 VTT sanitization release, ER-18). Therefore: auto-draft → human correction in a waveform editor (Subtitle Edit desktop S12 or client-side web editor S13) → publish as `.vtt` with `kind="captions"` (not `subtitles`, ER-04/28) → keep the player current or sanitizer-compatible. Timing bar for correction review: ≥0.5 s duration, ~20–30 CPS, ~32 chars/line, names unsplit (ER-17); FCC's accurate/synchronous/complete/well-placed as the voluntary quality definition (ER-29). Amara (S14) is the hosted-team alternative if volunteers must collaborate remotely.

### C3 Translation drafts & controlled author corrections
Whisper `translate` reaches English only (ER-12), so non-English drafts need a second hop: Argos Translate 1.9–1.11 offline MT (ER-21) or LibreTranslate self-hosted API (ER-22), chained ASR → human transcript fix → MT draft → human review (ER-23). All MT output is draft-only by policy — publish only reviewed tracks, with `srclang` set (S08). Controlled corrections need versioning + review states + attribution (ER-24); the sourced hosted option is Amara's team review/versioning (S14); the self-hosted analog is version-controlled VTT with a lightweight review flow (proposed approach — flag: no primary product source retrieved for this exact mechanism). Rights condition (ER-25): org-owned recordings avoid most licensing exposure; still confirm per-video speaker consent and any third-party footage; translations of third-party material are derivative works — evidence gap flagged.

### C4 Standards, timing & rights constraints
Binding floor: WCAG 2.2 SC 1.2.2 (Level A captions, ER-26) and SC 1.2.5 (Level AA audio description, ER-27); captions ≠ subtitles in `<track>` semantics (ER-04). Audio description for 40 advocacy videos is a real production cost — SC 1.2.3's alternative (Level A) exists but is Level-A-only; SC 1.2.5 is the AA target. FCC Part 79 (ER-29) does not automatically bind a small nonprofit site (applicability condition), but its accuracy/synchronicity/completeness/placement definition is the best free quality rubric. Timing constraints are practice-based (ER-17), not WCAG-numbered — adopt them as editorial QA.

### C5 Validation beyond one automated score
The brief's "must not depend on one automated score" is directly grounded: W3C states tools cannot do it all (ER-31), conformance of several SCs is not automatable (ER-32), and WCAG-EM prescribes a mixed methodology (ER-33). Coverage percentages from vendors disagree (ER-34) — retained as disagreement, not relied on. Proposed validation battery (see §4) therefore combines automated triage + keyboard-only walkthrough + screen-reader passes + transcript-vs-audio audit + timing QA. Nothing in this stage has been executed (ER-35).

---

## 3. Coherent draft (pre-reveal synthesis)

**Recommended end-to-end approach for the 40-recording site** (every recommendation tied to its source neighborhood):

1. **Player**: self-host the 40 recordings; embed with **Able Player v4.8.x (stable line, not v5 RC)** — gets captions, chapters, audio description support (v4.5 Web Speech API description), and an interactive transcript generated from the same VTT files (S01/S02; conditions: pin version, sanitizer present since v4.5.1, keyboard-shortcut preference available since v4.8.0). Fallback/simpler alternative: native `<video controls>` plus a linked HTML transcript page (lower capability, fewer dependencies; ER-07 low confidence — must verify keyboard behavior).
2. **Caption pipeline**: Whisper (choose model explicitly — default is `small`; prefer `medium`/`large-v3` per hardware) → `.vtt` out of the box → human correction in **Subtitle Edit** (or client-side web editor) against the timing bar (≥0.5 s, ~20–30 CPS, ~32 chars/line) → publish VTT with `kind="captions"`; validate files with a VTT linter before deploy (player-side parser leniency is version-dependent: ER-19/20).
3. **Transcripts**: publish the corrected transcript as a page per recording (from the same VTT data, as Able Player renders it) — satisfies the "transcripts" obligation and doubles as the WCAG media alternative path.
4. **Translation drafts**: `whisper --task translate` for English; **Argos Translate 1.11.0** offline for other targets; all MT output labeled draft until human review; publish reviewed tracks with correct `srclang`.
5. **Controlled corrections**: version-controlled VTT with review states (draft → reviewed → published) and a change log per recording; hosted alternative: Amara teams.
6. **Validation (proposed, not executed)**: automated scan as triage only; keyboard-only pass; two screen readers (e.g., NVDA + VoiceOver — AT choices not sourced this run, flagged); transcript-vs-audio audit on a 10-video sample; caption timing QA against ER-17; re-test after each player upgrade (Able Player's own history shows caption regressions happen: ER-09). Success is the mixed evidence, never one automated score.
7. **Rights/consent checklist** per video before publication (speaker consent, third-party footage, description of identifiable people) — flagged as partially unsourced (ER-25).

**Useful unfamiliar findings surfaced by this discovery** (O1): Able Player's Spoken Captions (v5 RC) and Web Speech API audio description (v4.5); the VTT-as-XSS-vector hardening chain (v4.5.1); VTT parser-leniency chain (v4.7.0/v4.8.0); keyboard-shortcut-disable user preference (v4.8.0); Whisper's English-only translate limit; offline MT via Argos; silent SRT-in-`<track>` failure (S08).

**Absent/inapplicable evidence** (O3 honesty): no Video.js/other-player primary evidence retrieved; whisper.cpp (local, no-account) named but not investigated; derivative-work legal primaries not retrieved; ER-07 and ER-34 are low-confidence records kept visible; all FCC/TV timing numbers are practice guidance, adopted voluntarily.

**Uncertainty & alternatives retained**: player choice (Able vs native vs Plyr) is genuinely open — conditions in C1; correction-workflow product is unsourced (C3); coverage-percentage disagreement (ER-34); Whisper defaults must be re-verified against the installed build; v5-vs-v4.8.x pin decision belongs to the org.

## 4. Obligations status (pre-reveal)

- O1 unfamiliar tools/approaches: covered (see §3 findings list).
- O2 primary behavior/defaults/limits: covered for Whisper defaults, WebVTT/`<track>` semantics, Able Player parser behavior; partially covered for native controls (ER-07 flagged).
- O3 issue/fix/release chain: covered by Able Player v4.4→v5.0.0-RC1 chain with dates/commits (S02); Whisper discussion #388 secondary.
- O4 per-P comparison: pending — requires plan reveal (next stage). Discovery frozen before reveal.
- O5 alternatives/conditions/uncertainty retained in-line: done as marked.
- O6 discriminating validations: proposed set in §3.6; nothing executed this run (ER-35).

*Discovery ends here. This document is not modified after plan reveal.*
