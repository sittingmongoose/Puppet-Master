# Phase 18 results — effort-locked, extraction-first, premise store (2026-10-16)

## Verdicts (Astra Max, double blind, anonymized copies)

| Arm | Grades (diagnostic /40) | Material errors | Verdicts |
|---|---|---|---|
| Sol (REPORT-A) | 37, 37 | 0, 0 | PASS_WITH_LIMITATIONS x2 |
| Flash union (REPORT-B) | 28, 27 | 2, 2 (same items) | FAIL x2 |

Preregistered success criterion (zero confirmed material errors AND
diagnostic >= Sol-5, i.e. >=32): **NOT MET on either prong.**
Flash diagnostic mean 27.5 vs Sol 37 (gap 9.5); both graders confirm
the same two material errors in the flash report. Mapping was sealed
before grading (seed recorded in p18/grading/MAPPING-SEALED.txt) and
revealed only after all four grades were terminal and settled.

Versus Phase 17 (flash 25/25, Sol 36/36, gap 11, 2 material errors):
the diagnostic gap narrowed by ~1.5 points and flash absolute score
rose ~2.5, at maximum effort on both arms this time, but the
material-error count did not move. The needle moved diagnostically;
it did not move on the prong that has failed every phase.

## The two confirmed material errors (both synthesis-layer)

- M03-class: a version-unqualified Electron/electron-builder signing
  guarantee (asserted without the recorded path/version conditions).
- M20-class: an asserted block-map-version fallback outcome where the
  evidence establishes only that a full download is required, not a
  demonstrated caller fallback.
Both survived extraction, slices, entailment at slice level,
comparisons, and two repair rounds with draft-level critics. They are
integration-layer overclaims: conditional donor facts compressed into
unqualified mechanism guarantees during final synthesis. Honest
absence handling was explicitly credited by both graders (gaps were
not counted as material errors).

## What the Phase 18 changes did and did not do

- Effort lock worked operationally: every post-lock launch carried
  its maximum option (DeepSeek thinking=max, Luna max, GLM thought=max
  via zcode GLM-5.3-Flash; Sol/Astra Max via codex_gmail), host-asserted.
  The pre-step A/B (p18/EFFORT-AB.md) showed Max effort roughly doubles
  retained deciding evidence at slice level.
- Extraction-first eliminated the picker blind spot as designed:
  7,027 whole-body records + 251 premises from 132 documents / 2,312
  chunks; zero genuinely invalid citations in all extraction groups.
  Discovery recall vs the Sol reference was must 15/27, worth 10/24
  before host bundle additions (APPL/AUTH/CHRM) — discovery, not
  extraction, is now the recall bottleneck.
- Slice under-selection moved down one layer: Luna slices selected
  18-32 claims regardless of candidate load, while DeepSeek and GLM
  at Max sliced exhaustively. Forced per-candidate expansion rounds
  fixed this completely wherever applied (Q1 32->270 claims 613/613
  accounted; Q8 18->176, 304/304; comparisons likewise). Final slice
  set: 1,049 claims, all citation-valid. Cross-model entailment:
  ~97% entailed across slices; residual defects repaired by deletion
  or narrowing (incl. 3 mangled MOZF records quarantined host-side).
- Absence discipline held: SmartScreen correctly NOT IN SOURCE
  (0/2,312 chunks); thin areas (delta limits, rollback-release)
  preserved as gaps; both graders verified absence honesty.
- What did NOT work: final integration still converts conditional
  evidence into unqualified guarantees, and loses diagnostic points
  where the brief wants design synthesis (persistent trust state,
  failed-start recovery, work-safe restart gate) that honest
  UNRESOLVED labels do not satisfy. Draft-level critics (4 in round 1,
  2 in round 2, 65 + 32 bounded repairs, defect-string verification
  host-run) caught many condition drops but not the two graded MEs.

## Cost / speed (honest)

Phase 18 ran ~90 delegated contexts (discovery ~9, extraction 21,
Sol records 8 + final, slices 8 + expansions 4, entailment 8,
slice repairs 8, comparisons 5 + expansions 5, skeleton/adversary/
integration 3, critics 6, draft repairs 2, gold + grades 5), versus
Phase 17's 44 and the ~60-75 min/topic anchor. Extraction-first at
this bundle size (2.6 MB) is far over the speed anchor. Same-model
trend is the wrong direction on context count even where quality
rose. Any production version needs tiered extraction (host keyword
pre-filtering before whole-body extraction) rather than full-corpus
records for every topic.

## Frozen artifacts

- Case E freeze: p18/FREEZE.txt (brief 149e8f92, plan 79a5719d,
  questions 7a7faf10 prefixes).
- Finals: flash-final sha256 770a0ce6... (10,975 words, REPAIR LOG
  stripped host-mechanically from flash-draft-r2 7c2eb0da...),
  sol-final sha256 1b1fc83f... (6,589 words). See FREEZE-FINALS.txt.
- Gold: 20 propositions + 38-item material-error checklist (Sol Max,
  blind to reports). Grades: GRADE-G1/G2-A/B in p18/grading.

## Recommendation

Do not run Phase 19 as a bigger version of the same stack. The two
remaining failure modes are (1) integration-layer guarantee
compression and (2) brief-synthesis propositions that evidence-only
honesty cannot score. Targeted next experiments: (a) a guarantee-
audit critic whose only job is unqualified mechanism guarantees in
the draft, run before freeze with authority to force condition
restores; (b) a separately-gated design-synthesis stage that is
allowed to propose (labeled PROPOSED with named evidence + blind
spots) instead of leaving design propositions at UNRESOLVED;
(c) tiered extraction to recover the speed anchor. The flash-class
union at maximum effort is diagnostically competitive (within ~10
of Sol, was 11 at mixed effort) but has not yet produced a
zero-material-error final.
