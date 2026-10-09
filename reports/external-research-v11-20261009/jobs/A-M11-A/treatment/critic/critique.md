# critique.md — S11 "accessibility-video" — M11 critic stage (A-M11-A / treatment / critic)

Written 2026-10-09T20:49Z. Critic role per assignment: complete independent inspection of the
own-arm predecessor chain (discovery.md, source-map.json, revealed-plan.md, draft.md — all read in
full; discovery sha256 e3fff5db… and plan sha256 93ba5630… re-verified against the frozen hashes
quoted in draft.md; the verbatim plan quote in draft.md is character-identical to revealed-plan.md),
challenge of consequential facts/defaults/conditions, every P disposition, discovery/alternatives,
omissions, false corrections/rejections, and validation applicability — against the retained source
captures (research/sources, S01–S22) and independently chosen public primary sources (S23–S34,
this run). No campaign/history/evaluator/counterpart read; no candidate repair outside this
recipe; all writes confined to this stage_path.

Verdict in one line: the predecessor's structure, honesty discipline, and every primary P
disposition survive adjudication, but six material defects require correction — one stale tool
default with a silently-broken pipeline path, one stale version-recommendation premise, a +2-year
date error inherited from the deep source into two documents, two source-support misattributions,
and one wrong platform premise.

## 0. Disposition of dispositions (brief O4)

| P | Predecessor disposition | Critic adjudication |
|---|---|---|
| P1 | already-covered + correction (kind) + conditions | Holds. Kind correction verified (S23/S07/S24); "SRT fails silently" softened (m1); speaker-ID re-attributed (m2); H95 nuance added (m3); release-chain dates corrected (M3). |
| P2 | correction + alternatives + user decision | Holds as disposition, stale in substance: v5.0.0 stable exists (M2); v4.4/v4.5 dates wrong (M3). Keystone transcript capability verified live (S23). |
| P3 | rejected as published-output + corrected to draft+review | Rejection substance confirmed (S30: translate = "X->English"); "explicitly draft-grade" misattributed (M4); new turbo/translate condition (M6); clause ambiguity unacknowledged (m9). |
| P4 | correction + guarded fallback | Tool choice defensible, platform premise wrong: Subtitle Edit is cross-platform (M5); feature list remains snippet-depth. |
| P5 | already-covered + optional enhancement | Holds; keystone verified (S23); "media-alternative path" phrasing looser than S09 text (m11). |
| P6 | correction + optional battery | Holds; WAI quote verified verbatim (S25/S15); "discriminating pairs" overclaims items 4–6 (m10). |

No disposition needs reversal. M1–M6 require correction of support, dates, or conditions.

## 1. Material findings (challenge the predecessor's substance; each must be repaired or rebutted)

**M1 — Whisper default model is `turbo`, not `small`.** ER-10 (S04 locator: CLI usage) and draft
§P3/§3 state the packaged default is `--model small`. The live main-branch source says otherwise:
`parser.add_argument("--model", default="turbo", ...)` (S30, whisper/transcribe.py, main,
accessed 2026-10-09T20:48Z), and the README prose agrees ("The default setting (which selects the
turbo model)", S31, accessed 20:44Z). S04 itself was flagged "retrieval summary; re-verify" — the
drift is now measured. Consequence: the draft's model-tier advice (small default; prefer
medium/large-v3, ER-13) omits the turbo tier and misstates the packaged default; pipeline steps
must pin the model explicitly. Residual uncertainty: an installed pinned release may differ from
main; the draft's "verify against the installed build" condition remains correct practice.

**M2 — Able Player v5.0.0 stable exists; "stay on v4.8.x (v5 is RC)" is stale.** Draft P2 and
§consolidated-4 recommend the v4.8.x line because v5 is at "RC status (2026-05-28, breaking
changes)". GitHub's release API shows v5.0.0 published 2026-06-21 (S28: created/published
2026-06-21; body = NPM/ESM breaking changes), plus v5.1.0-beta1 2026-09-23 and v5.1.0-beta2
2026-10-06 (S26, releases list, accessed 20:45Z) — all before this run's S02 deep read
(20:24:45Z), whose locator nevertheless stops at v5.0.0-RC1. The real decision is v4.8.x vs
v5.0.0 stable (3.5 months old at research time), with the same breaking-change migration budget.
Sources: S02 locator vs S26/S28. Uncertainty: low — three independent API reads agree.

**M3 — v4.4/v4.4.1/v4.5 release dates are wrong by exactly +2 years, inherited from S02 into
ER-09 and draft P1/P2.** S02 says 2023-11-16 / 2023-11-21 / 2024-11-11; the GitHub API says
v4.4 published 2021-11-16T22:37:45Z (S27) and v4.5 published 2022-11-11T21:52:55Z (S29), with
v4.4.1 at 2021-11-21 (S26). Month/day match exactly; year is off by two — a transcription error
in the one deep-read source, then propagated. The release CONTENTS are confirmed (S26 bodies:
"CRITICAL: Restore support for captions and subtitles hosted on YouTube" in v4.4; Web Speech API
description in v4.5), so the O3 chain survives; the dates do not. Sources: S02 vs S26/S27/S29.

**M4 — "Argos explicitly draft-grade" claims source wording that does not exist.** Draft P3:
"Argos Translate 1.11.0 offline MT is explicitly draft-grade (S22)". The S22 capture contains no
such wording, and the live PyPI page (S34, accessed 20:45Z, version 1.11.0 released 2026-02-02)
contains no draft/error hedging either — only a note that pivot translation costs "some loss of
translation quality". Draft-grade remains a defensible engineering characterization; "explicitly"
is a false attribution. Repair: restate as reasoned characterization, or source it to a page that
says it. Sources: S22 (locator: PyPI description) vs S34.

**M5 — Subtitle Edit is cross-platform, not Windows-only.** S12 (snippet-only capture) and draft
P4 say "Subtitle Edit (open source, Windows; …)". The live repo documents Windows 10 22H2+,
macOS 12+ (.dmg bundling mpv/ffmpeg), and Linux (Flatpak/native tar.gz) (S33, accessed 20:45Z).
The P4 user decision ("desktop vs browser editor per volunteer environment") inherits a false OS
constraint. The format list (SRT/VTT/ASS/SSA/SUB/STL) and waveform features remain unconfirmed at
snippet depth (S12; S33 page does not enumerate formats). Sources: S12 vs S33.

**M6 — New condition absent from the predecessor: turbo silently ignores `--task translate`.**
The live README warns the turbo model "will return the original language even if `--task
translate` is specified" (S31; default is turbo per S30, M1). The draft's corrected P3 pipeline
("whisper --task translate for English") therefore no-ops under defaults. Repair: pipeline must
select a non-turbo model for translation (or verify installed behavior). Sources: S31/S30 vs
S04/S05. This is the single most consequential pipeline-correctness finding.

## 2. Predecessor claims challenged that HOLD on independent primary evidence

- **Interactive-transcript keystone (P2/P5)**: "Interactive transcript feature, built from the
  WebVTT chapter, caption and description files as the page is loaded", click-to-seek, sync
  highlighting (S23, Able Player README main, accessed 20:44Z) — matches S01 near-verbatim;
  ER-02's "not auto-generated" correctly means not generated from audio (S03). The load-bearing
  claim that rested on two capture-only sources is confirmed by a deeper primary.
- **`kind` correction (P1)**: default kind is "subtitles"; captions carry sounds/musical
  cues/source (S24, MDN `<track>`, accessed 20:44Z; S07 capture).
- **Whisper translate = X→English (P3)**: argparse help verbatim "X->English translation"
  (S30). ER-12's flagged claim is confirmed by the primary it asked for.
- **WAI quote (P6)**: "However, tools can't do it all. Some accessibility checks just cannot be
  automated and require manual intervention." verbatim (S25/S15; lives in the page's video
  transcript — see m4).
- **v4.6.0 keyboard fix, v4.5.1 DOMPurify, v4.7.0 leniency, v4.8.0 sanitization/timestamp/shortcut
  claims (P1/P2)**: S02 bodies match the API release bodies (S26); only the M3 dates are wrong.
- **FCC applicability (P1/P6)**: accurate/synchronous/complete/well-placed as Part 79 metrics for
  FCC-regulated programming (S18/S19); the voluntary-adoption reading for a nonprofit site is sound.

## 3. Minor findings (precision; no disposition at risk)

- **m1** — "SRT fails silently" is retrieval-summary inference (S08), not documented behavior on
  the live MDN `<track>` page (S24); soften to "unsupported, no documented error surface".
- **m2** — Speaker-ID is attributed to H95 (S07) in draft P1, but H95's page says "dialogue and
  other sounds important to understanding" without literal speaker wording (S32, accessed
  20:45Z); the speaker language lives in the Understanding doc (S09). Re-attribute.
- **m3** — H95's regional note says a subtitle-kind track "would meet the requirements" of SC
  1.2.2 in some labeling conventions, though not best practice (S32); draft P1's "would weaken SC
  1.2.2 conformance" is slightly overstated — kind="captions" is correct semantics, not a
  conformance precondition.
- **m4** — S15 locator says "key statements section"; the verified quote is in the page's video
  transcript (S25). Locator precision only.
- **m5** — One-day offsets: v4.8.0 Feb 6 (S02) vs API 2026-02-07; v5.0.0-RC1 May 28 vs API
  2026-05-29 (S26) — consistent with timezone/display on the releases page. Immaterial next to M3.
- **m6** — S04's output_format list lacks the now-present `jsonl` choice (S30). Folded into M1.
- **m7** — Plyr shortcut table (S11, ER-06) not re-verified live this run; capture-depth retained,
  low consequence (descriptive use).
- **m8** — ER-30 (SC 2.5.8, 24px controls, S02) is never used by draft.md — unused evidence.
- **m9** — P3's rejection never acknowledges the clause ambiguity ("generate translations
  automatically" spans auto-draft and publish-raw readings; brief O5 itself demands drafts). The
  chosen reading (reject raw publication, keep auto-drafting) is defensible and preserved, but the
  ambiguity should be stated. (revealed-plan.md P3 exact clause; brief obligations.)
- **m10** — P6's battery header promises "discriminating pairs" but items 4–6 (timing QA script,
  VTT linter, scanner delta) are QA measures, not discriminating experiments (draft P6 vs its own
  list).
- **m11** — "Transcript doubles as the WCAG media-alternative path" (P5, S09) is looser than the
  capture text, which concerns captions under SC 1.2.2; a static transcript page as media
  alternative is reasonable practice but exceeds the cited source's claim.

## 4. Critic-side uncertainty register (retained, not resolved)

- Vendor timing-bar numbers (≥0.5 s, 20–30 CPS, ~32 chars/line — S20/S21) were not re-verified
  live; they are vendor guidance used as a self-adopted editorial bar, which is how the
  predecessor framed them (ER-17 applicability condition).
- Coverage-percentage disagreement (ER-34) remains third-party and unverified — correctly retained
  as disagreement; either bound forbids a score-gate, so the draft's use is unaffected.
- ER-25 derivative-works/rights: no primary legal source in scope; the predecessor's reasoned
  constraint and honesty flag stand; this critic does not manufacture legal certainty.
- Reveal timestamp (2026-10-09T20:27:19Z "per plan-reveal.json") is unverifiable within the
  declared read scope (plan-reveal.json is not a declared predecessor); the plan hash it would
  attest was independently confirmed (93ba5630…).
- Native-controls keyboard behavior (ER-07) remains low-confidence by the predecessor's own flag;
  the draft correctly routes it to proposed validation 1 rather than asserting it.
- research/index.md exists (5915 bytes) but is outside the declared read set; its existence is
  consistent with the map's evidence_file paths; not read, not judged.
- Whisper installed-build behavior may differ from main (S30/S31 are main-branch, 2026-10); the
  draft's verify-at-installation condition is retained and now more important (M1/M6).

## 5. Invalid critic demands — explained rather than pressed

1. **Demanding regulation-grade backing for the timing bar** would be invalid: S20/S21 are vendor
   guidance, the predecessor labeled them practice-based and self-adopted (ER-17 applicability),
   and the brief asks for practical QA, not legal duty. The correct demand — attribution
   precision — is made in m-level findings instead.
2. **Demanding executed validations** would be invalid: no runtime exists in this stage; the
   draft's O6 honesty marker ("nothing above pretends to have run") is exactly what the recipe
   requires, and ER-35 records it. The critic verifies the separation, not the runs.
3. **Demanding a legal conclusion on derivative works (ER-25)** would be invalid: no primary legal
   source was retrieved, the predecessor flagged the gap and kept the constraint as reasoned
   practice with per-video checks; inventing certainty would violate the honesty discipline.
4. **Demanding live re-verification of every capture-only source (Plyr, Amara, subtitle-editor.org,
   WCAG-EM steps, conformance-challenges examples)** would be invalid as a blanket rule: their
   roles are descriptive/low-consequence (m7), and the critic prioritized the load-bearing and
   contested claims (M1–M6, H1–H5). The depth ceiling is recorded per-source in the critic
   source-map instead.
5. **Rejecting P2's player recommendation for citing a stale RC premise (M2) wholesale** would be
   invalid: the underlying breaking-change facts are real (S26/S28 bodies), the recommendation's
   structure (pin stable, budget migration) is sound; only the version-set premise needs updating.
6. **Treating M3's date error as fabricating evidence** would be invalid: the months/days match
   the API exactly and the release contents are confirmed; the evidence supports transcription
   error in the deep read, not invention — the repair is a date correction, not a source invalidation.

## 6. Sources, evidence, and conduct record

- Inherited sources S01–S22 are immutable (research/source-map.json, sha256 6cf438a6…); no
  rebinding. Depth per source (capture-only vs full read) is recorded in its observed_operations
  and was treated as the authority on evidential weight throughout.
- Newly accessed sources S23–S34 (URL, version, access timestamp, observed operations) are
  registered in this stage's source-map.json; bounded permitted evidence excerpts are retained in
  sources/S23-S34-critic-verifications.md with a navigable index at sources/index.md.
- usage/billing: unobserved, null, for every source accessed this run.
- No evaluator, counterpart, campaign history, or premium access was used. No files outside this
  stage_path were written; no repository/canon edits; no nested agents; no config changes.
- Work notes (input inventory, per-predecessor claim maps, adjudication inventory) are retained
  under work/ for traceability: work/00 through work/05.
