# draft.md — S11 "accessibility-video" — plan comparison & complete planning deliverable

Case A-M11-A / treatment / research. Comparison phase: discovery.md (frozen, sha256 e3fff5db…, 17287 bytes)
vs revealed-plan.md (plan_sha256 93ba5630…, revealed 2026-10-09T20:27:19Z per plan-reveal.json).
discovery.md is not modified. Dispositions used (brief O4): **correction**, **optional enhancement**,
**user decision**, **already-covered**, **rejected**, **uncertain**. Source IDs S01–S22 = source-map.json
(navigable index: index.md). Everything below is planning; the only executed checks this stage are the
artifact checks recorded at the end — no runtime/product validation has been run (honesty marker, brief O6).

Revealed plan (verbatim):
> P1: Host MP4 files and WebVTT captions. P2: Use the browser default player. P3: Generate translations
> automatically. P4: Edit captions in a text editor. P5: Publish one transcript per video. P6: Run an
> automated accessibility scanner.

## 0. Disposition summary

| P | Clause | Disposition |
|---|--------|-------------|
| P1 | Host MP4 files and WebVTT captions | already-covered, with one correction (track kind) + conditions |
| P2 | Use the browser default player | correction (primary), retained alternative, user decision |
| P3 | Generate translations automatically | rejected as published-output; corrected to auto-draft + human review; user decision on scope |
| P4 | Edit captions in a text editor | correction; plain-text editing retained as guarded fallback |
| P5 | Publish one transcript per video | already-covered, with optional enhancement (transcript page + in-player transcript) |
| P6 | Run an automated accessibility scanner | correction (triage only, never the single score) + optional enhancement (mixed-method battery) |

---

## P1 — "Host MP4 files and WebVTT captions" — already-covered, with correction

The thin plan's storage/format choice matches the discovery's pipeline end-state: self-hosted media with
WebVTT text tracks (S06 WebVTT spec; S08 MDN — `<track>` accepts WebVTT; SRT fails silently). Retained
findings that condition this clause:

- **Correction (must apply):** captions must be tagged `kind="captions"`, not the default-flavored
  "subtitles": captions carry dialogue **plus** meaningful non-speech audio and speaker ID per H95 and the
  WebVTT/`<track>` semantics (S07, S06). The plan is silent on `kind`; treating all tracks as subtitles
  would degrade deaf/hard-of-hearing access and weaken SC 1.2.2 conformance (S09).
- **Condition (format):** MP4 alone is not a strategy — provide capable codec coverage (H.264/AAC baseline is
  the practical default; codec evidence was not independently retrieved this run → uncertain, verify at
  implementation). WebVTT is the only `<track>` format (S08), so the authoring pipeline must emit `.vtt`
  (Whisper does natively, S04/S05).
- **Condition (quality bar):** publishing VTT implies the editorial bar — ≥0.5 s on screen, ~20–30 CPS,
  ~32 chars/line, names unsplit (S20, S21); FCC's accurate/synchronous/complete/well-placed as voluntary
  rubric, since 47 CFR Part 79 governs FCC-regulated programming, not automatically a nonprofit site (S18, S19).
- **Condition (safety/fragility):** author-edited VTT is a security surface — Able Player added DOMPurify
  sanitization for VTT content in v4.5.1 (2025-03-25) (S02); its parser needed leniency fixes for
  non-standard timestamps (v4.7.0 PR #645) and re-parsing of inline timestamp tags after sanitization broke
  them (v4.8.0 PR #693/#692) (S02). Validate every `.vtt` mechanically before deploy.
- **Alternative retained:** SRT master files + conversion to VTT (SRT is widely editable; S04/S05) —
  condition: conversion step adds a silent-failure risk at the `<track>` boundary (S08) if skipped.
- **User decision:** none required for P1 itself beyond the kind correction.

## P2 — "Use the browser default player" — correction; alternative retained; user decision

Native controls give baseline keyboard operability with zero JS (S08 context), but this discovery rates that
claim **low-confidence** (no dedicated primary source retrieved — ER-07 uncertainty), and native controls
provide no interactive transcript, no caption-styling preferences, no audio-description path. The media-
accessibility-specific alternative evidenced in-source is **Able Player**: interactive transcript built from
the same WebVTT caption/chapter/description files at page load, click-to-seek, keyboard navigation (S01,
S03 — transcripts are not auto-generated, they derive from the VTT you already publish under P1); a release
history of keyboard-accessibility maintenance (v4.6.0 fixed a draggable toolbar "breaking keyboard support";
v4.8.0 added a user preference to disable keyboard shortcuts) (S02).

- **Correction:** the plan's player choice is under-specified for the brief's "keyboard-friendly playback".
  Recommended: Able Player **v4.8.x stable line** (S02; v5.0.0-RC1 2026-05-28 has breaking changes — do not
  adopt an RC silently). Pin the version; budget re-validation on upgrades (its own history shows caption
  regressions: v4.4 "CRITICAL: Restore support for captions and subtitles hosted on YouTube", 2023-11-16) (S02).
- **Retained alternative (credible, not rejected):** native `<video controls>` + a linked static transcript
  page — simplest, most robust, zero dependencies; acceptable if the keyboard walkthrough below passes.
  Second alternative: Plyr — documented default shortcuts (Space/K, ←/→ ±10 s via `seekTime`, 0–9 %, C
  captions; per-action `keyboard` config) (S11) — general-purpose, less media-a11y-specific than Able Player.
- **Conditions:** YouTube/Vimeo-embed paths are a regression-prone dependency class (S02 v4.4 chain);
  self-hosting (P1) avoids them for org-owned footage.
- **User decision:** player choice = capability vs simplicity tradeoff (Able Player dependency + upgrades vs
  native minimalism). Decide after the P6 keyboard validation below; either is defensible if validation passes.

## P3 — "Generate translations automatically" — rejected as stated; corrected to draft+review; user decision

Publishing raw machine translations as site content is **rejected**: the brief demands translation *drafts*
and controlled author corrections, and every sourced MT/ASR tool is draft-grade (Whisper `translate` is
English-output-only per the CLI's task definition (S04 — retrieval-summary confidence, re-verify); Argos
Translate 1.11.0 offline MT is explicitly draft-grade (S22); LibreTranslate is its self-hosted API form (S22)).

- **Correction:** pipeline = Whisper transcribe → human transcript fix → MT draft (Whisper `--task translate`
  for English; Argos for other targets) → **mandatory human review** → publish reviewed tracks with correct
  `srclang` (S08). Label anything unreviewed as draft, visibly.
- **Condition (rights):** org-owned recordings avoid most derivative-work licensing exposure; translations of
  third-party material are derivative works — evidence gap: no primary legal source retrieved this run
  (retained uncertainty, see §Uncertainty). Speaker consent/privacy check per video before publication.
- **Optional capability:** hosted team translation/review with versioning via Amara (S14) if volunteers work
  remotely; self-hosted analog is version-controlled VTT with review states (proposed approach — no primary
  product source retrieved; flagged).
- **User decision:** target language list; who reviews (bilingual staff vs volunteers); hosted (Amara) vs
  self-hosted review tooling.

## P4 — "Edit captions in a text editor" — correction; fallback retained

Plain-text editing of VTT is the weakest link the discovery found: the format is whitespace/syntax sensitive,
players differ in parser leniency exactly where hand-editing errs (single-digit hours tolerated only from
Able Player v4.7.0; inline timestamp tags mangled by sanitization until v4.8.0) (S02), and reading-rate/
duration quality (≥0.5 s, 20–30 CPS) is effectively invisible in a text editor (S20, S21).

- **Correction:** correct captions in a waveform/preview editor: **Subtitle Edit** (open source, Windows;
  SRT/VTT/ASS/SSA/SUB/STL, waveform timing, OCR of burned-ins) (S12), or the client-side web editor
  subtitle-editor.org for no-install contexts (S13). Re-validate the file (VTT linter + player render) after
  every edit session.
- **Retained fallback:** plain-text editing is acceptable only as a *guarded* path — small text fixes by a
  known-good author, always followed by the mechanical linter pass (condition), never for timing changes.
- **User decision:** desktop editor (Subtitle Edit) vs browser editor per volunteer environment; whether OCR
  of burned-in captions is ever needed (only if source videos carry baked-in text).

## P5 — "Publish one transcript per video" — already-covered; optional enhancement

Matches discovery: the transcript artifact and the captions share one source of truth — Able Player builds
its interactive transcript from the same WebVTT files used for captions/descriptions (S01; S03 shows it is
not auto-generated beyond those files), and the corrected transcript doubles as the WCAG media-alternative
path (S09) and the base for translation drafts (S04, S22).

- **Optional enhancement:** publish the transcript both ways — in-player interactive transcript (click-to-seek,
  S01) **and** a static per-video transcript page (crawlable, printable, screen-reader-friendly, works
  without JS). Static page is the fallback if the native-player alternative (P2) is chosen.
- **Condition:** transcript must be regenerated/checked after every caption correction round, or the two
  artifacts diverge silently (process condition, no extra tooling).
- **Uncertainty:** whether "one transcript per video" must include non-speech descriptions — recommend the
  corrected captions already carry speaker ID + meaningful sounds (P1 correction), so the transcript inherits
  them; confirm with org editorial policy.

## P6 — "Run an automated accessibility scanner" — correction + optional enhancement

An automated scanner is useful and insufficient: W3C states "tools can't do it all. Some accessibility checks
just cannot be automated and require manual intervention" (S15); the W3C conformance-challenges note shows
whole SC classes needing human judgment (e.g., whether a pause/stop/adjust mechanism exists) (S16); WCAG-EM
prescribes a structured mixed methodology (S17). The brief itself forbids depending on one automated score.
Vendor coverage estimates disagree (~25–50% vs ~70–80% — S-source third-party numbers, unverified; retained
as disagreement — either bound forbids a score-gate).

- **Correction:** scanner = triage layer inside a mixed-method battery (below), never the pass/fail gate.
- **Optional enhancement (proposed validation battery, discriminating pairs in parentheses):**
  1. Keyboard-only walkthrough of playback, captions toggle, transcript interaction, page navigation —
     discriminates P2 (native vs Able Player): if native controls fail keyboard/AT checks, the player
     decision is made by evidence, not preference.
  2. Two screen readers (e.g., NVDA + VoiceOver — AT choice unsourced this run, flagged) over one full video
     page incl. transcript — discriminates transcript-page vs in-player-only presentation (P5).
  3. Transcript-vs-audio audit on a 10-video sample (accuracy, speaker ID, meaningful sounds) — discriminates
     Whisper model tier (small default vs medium/large-v3, S04) and measures editor value (P4).
  4. Caption timing QA script (≥0.5 s, CPS ceiling, line length, name splits) on all 40 VTTs — directly
     checks the P1/P4 editorial bar (S20, S21).
  5. VTT linter + renderer smoke test after every edit — guards the plain-text fallback (P4) and parser-leniency
     risk (S02 ER-19/20).
  6. Scanner delta after each fix round — trend only, never a gate (S15–S17).
- **User decision:** scanner tool choice and cadence; who performs manual passes (staff vs contracted audit).

---

## Optional capabilities & user decisions (consolidated)

1. Player: native vs Able Player v4.8.x vs Plyr — decide via validation 1 (P2).
2. Audio description for SC 1.2.5 (Level AA, S10): Able Player supports description via secondary audio/Web
   Speech API (S01/S02 v4.5) — producing 40 described videos is a real cost; decide target level (1.2.3
   alternative at Level A vs full 1.2.5 AA) and production order.
3. Translation scope: language list, reviewers, hosted (Amara S14) vs self-hosted review flow.
4. v5 migration policy: stay on v4.8.x stable or plan the v5 (ESM/Spoken Captions) migration (S02).
5. Correction workflow tooling: git-based VTT review vs hosted platform (unsourced decision, flagged).

## Uncertainty register (retained, not resolved)

- Native-controls keyboard behavior: low-confidence (ER-07) — resolve with validation 1.
- Whisper CLI defaults (model `small`, output `all`, en-only translate): from official-repo README via
  retrieval summaries + discussion #388 (S04, S05); README not fully rendered this run — re-verify against
  the installed build before scripting the pipeline.
- Automated-tool coverage percentages: conflicting third-party claims, no primary verification (ER-34).
- Derivative-work/rights specifics: reasoned constraint only; no primary legal source retrieved (ER-25).
- Codec/encoding best practice for MP4: not investigated this run.
- Video.js, whisper.cpp (local no-account ASR), YouTube-hosted caption flows: named alternatives, not
  investigated (scope honesty; O1/O3 absence statements).

## Executed vs proposed (brief O6 honesty)

Executed this stage: source retrieval; discovery.md + source-map.json authoring; JSON parse check; reveal
gate run (plan-reveal.json attests discovery sha256 e3fff5db…/17287 bytes); the grep checks below.
**No product, pipeline, or accessibility validation has been executed.** Every item in P6/§battery is
proposed work. Nothing above pretends to have run.

## Obligation cross-check

- O1 unfamiliar tools/approaches: Able Player transcript-from-VTT + spoken captions + Web Speech description (S01/S02), Argos offline MT (S22), client-side web caption editor (S13) — beyond the thin plan.
- O2 primary behavior/defaults/limits: Whisper defaults (S04/S05), WebVTT/`<track>` semantics + silent SRT failure (S06/S07/S08), Able Player parser/sanitization behavior (S02), keyboard defaults (S11).
- O3 issue/fix/release chain: Able Player v4.4→v5.0.0-RC1 with dates/commits (S02); absence statements where evidence was not retrieved (§Uncertainty).
- O4 per-P exact disposition: table §0 + per-P sections.
- O5 alternatives/conditions/uncertainty retained in-line, prose not IDs: done.
- O6 discriminating validations proposed, executed separated: §P6 + Executed-vs-proposed.
