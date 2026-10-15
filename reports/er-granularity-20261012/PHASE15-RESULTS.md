# Phase 15 — scale-optimized stack, held-out caseC (2026-10-14)

Design: `PHASE15-PREREG.md` — dossier-first extraction (JSONL record
store, no SQLite), picker-preselected slices, slice-level entailment
before integration, mutation-expectation adversary, full repair budget,
per-stage measurement. Held-out caseC: sync and backup of local app
state across the user's machines. Forced inclusions pre-declared:
Syncthing, Automerge, restic. Frozen: flash render
`a32ec8b6…0823e` (draft `a1813b9f…9748`), Sol final `6616acac…8455`,
gold `1490d71c…15c7` (Sol, independent, post-freeze; 17/17 input hashes
host-re-verified).

## Outcome vs pre-registered criteria

| Arm | Grades (Astra 6 Max ×2) | Diagnostic | Material errors |
|---|---|---|---|
| Flash (G1) | PASS_WITH_LIMITATIONS 22/40 + PASS_WITH_LIMITATIONS 24/40 | 22, 24 (mean 23) | 0 in both |
| Sol premium (G2) | PASS_WITH_LIMITATIONS 29/40 + FAIL 28/40 | 29, 28 (mean 28.5) | 1 confirmed on review (below) |

**Zero-material-error criterion: MET for the flash arm** — the first
flash PASS in the held-out series (P12: FAIL/PASS split on a quote;
P13: FAIL/FAIL with two substantive errors). Both graders found no
fabricated evidence, no false execution claim, and no source-condition
reversal; all 81 chunk citations resolve and appendix bytes verify.

**Diagnostic criterion (flash ≥ Sol−5): NOT met.** By grader pair:
a-pair 22 vs 29 (gap 7, fails), b-pair 24 vs 28 (gap 4, passes); by
means 23.0 vs 28.5 (gap 5.5, fails by half a point). Overall
pre-registered success is therefore **not met**, but the failure moved
again: from wrong claims (P13) to shallow coverage. Both flash graders
score eight propositions 0–1, all in one cluster — embedded-store and
journal donor mechanics (P05–P10 redb/RocksDB modes, batches, WAL and
recovery; P17–P18 journal identity/sealing). The flash bundle answered
those questions from dossier records only (the ≥3-record-hits rule),
and integration cited just five records in two bullets. Where slices
ran, flash often matches or beats Sol (P14 restic copy/chunker: flash
2/2, Sol 0/0 in both grades; P01, P02, P12, P13, P16, P20 all 2/2) —
but not universally: P04, P11, P15, and P19 score flash 1/1 against
Sol 2/2 despite slices, and the eight-proposition cluster accounts
for 4.5 of the 5.5 mean gap points, not all of it (Sol review F07).

**Sol grader split, resolved by independent Sol review.** G2-b's
single material error: Sol's "Corrupt originals are preserved by
rotation" (final L70) drops the journal source's modal, best-effort
wording ("should immediately rotate… should be left around so that as
little data as possible is lost", JOURNAL_FILE_FORMAT.md L84–87; gold
F02/F13, P18). The host initially judged this a borderline flattening
because no unsafe app guarantee follows; the Sol review (F03) shows
gold §3 makes a qualifier omission material when the retained claim
is unsafe **or false**, and the donor assertion as written is false
to its source. The host accepts that adjudication: **M1 stands
confirmed; the Sol arm has one confirmed material error** on the
retained raw grades (PASS 29 + FAIL 28). No scores were altered. The
flash criteria are unaffected either way.

## Repair budget, spent in full (the P13 lever, now measured)

Three critic→repair rounds, host-adjudicated, host diff-audited,
quotes re-rendered and byte-verified each round (81/81 chunks):
hunter dry all four panels; entailment 85/88 → 179/179 → 190/190 →
190/190; adversary composed rows 7 → 3 → 1 → 0, high-severity
Direction-A scenarios 2 → 2 → 4 → 0 (each round's repairs exposed
deeper gate-observability scenarios; R3 residuals are five medium
Direction-A and one medium + three low Direction-B items, recorded
here as limitations at the pre-registered cap). The three R0
flattened claims (RocksDB `verify_with_checksum` ×2, restic
tree-dedup conditions) — exactly the P13 ME01 class — were caught by
the new slice/final entailment audits and repaired in R1. No P13
ME02-class composed oracle survived: the mutation-expectation
adversary closed every composed row by R3.

Residual limitations at freeze (R3 adversary, unrepaired by cap):
restore report can omit local-only (unacknowledged) operations;
success accounting does not itself exercise the declared receipt
condition's copy count; Secrets status composition for named blind
spots is ambiguous between a permissive and a strict reading;
authorship wording in the status surface and conflict-visibility
lifetime are unobserved; "unexpected content" namespace for restore
gating is undecided (owner decision 9).

## Efficiency vs Phase 13 (per `p15/MEASURE.md`)

Like-for-like through the first critic panel: **16 flash contexts vs
22** (P13 total was 23 including its single repair), while adding a
stage P13 lacked (2 slice-entailment contexts). Full P15 flash total
through freeze is 28 contexts because the repair budget was spent in
full (3 rounds × (1 repair + 3 critics)) — the quality gain above is
what those 12 contexts bought; P13 froze after 1 of 3 rounds.
Slice-stage input fell from whole-source re-reads (P13: 284,330 B of
full chunk bodies, the 163,778 B FTS5 file read by ~9 contexts;
~2.5 MB total model input as reconstructed in PHASE14, not a filed
per-context measurement) to picker-preselected inputs totalling
**111,734 B** across 5 slices — 60.4% of P15's 185,041 B of unique
full chunk bodies, with donor chunks reused across questions, so it
is an aggregate delivered-input figure, not a per-question retention
ratio (corrected per Sol review F04; the earlier 36% counted picked
copies inside their own denominator). Slice output: 36,074 B (P13:
124,490 B across its eleven Phase-13 slices). Integration draft
40,446 B vs 103,887 B; frozen render 114,627 B vs 299,927 B. Wall
time, stated three ways: elapsed freeze→flash-freeze 7 h 36 m
including the handoff gap between sessions; working windows ≈ 3 h
49 m (prior session 2 h 39 m to first critics, slice stage itself
~4 min for 5 parallel contexts; takeover adjudication + 3 repair
rounds + freeze 11:15–12:24Z, each round ≈ 6 min repair + ≈ 14 min
parallel critic panel + host audit); P13's same frozen boundaries
span 2 h 37 m. **No end-to-end wall-time improvement over P13 is
claimed** — P15 spent its time on two more repair rounds and a new
entailment stage. Against Jared's ~60–75 min/topic allowance, even
the working-window figure is ≈ 3–4× over per topic at current
concurrency caps, still far from a 96-topic pass in days. Dossier reuse is real but
shallow: the store (562 → 645 records) answered whole questions
without slices, and the diagnostic cluster above is the price.
Premium overhead (excluded from flash cost, as before): Sol arm,
one Sol gold context (~17 min), four Astra grades (~10 min parallel).

## Process findings (next levers, in order)

1. **Dossier depth tier.** Records-only answers are lookup-grade, not
   mechanics-grade. Any donor whose mechanics decide ≥2 clause
   dispositions needs a dedicated picked slice regardless of record
   hits; records remain the cache for lookup questions. This is the
   direct cause of the 5.5-point diagnostic gap.
2. **Record-condition expansion at integration.** The integrator saw
   record IDs, not conditions; host-render record conditions into the
   integrator's input the way quotes are host-rendered, so conditions
   survive integration by construction.
3. **Source-inverted slices for body-class donors** (redb design,
   RocksDB headers/HISTORY, journal format): one context per body
   answering all queued questions, instead of per-question slices
   re-reading it — Phase 14 lever 5, now the binding constraint.
4. Repair rounds have diminishing but real returns through round 3
   (highs 2→2→4→0 is adversary depth increasing as shallow defects
   close, not regression); budget them per topic, and expect the
   adversary, not entailment, to be the last panel dry.

Deviations logged: picker contexts were not separately filed (only
`PICKS.txt`), so picker cost is uncounted above; grading copies are
the placeholder draft (flash) and title-anonymized finals, canonical
frozen artifact is the host render; one gold freeze hash was recorded
pre-terminal by the host and corrected transparently in `FREEZE.txt`.
**Blinding was compromised (Sol review F02):** G2 still contains
"Sol extracted records R001-R100" and a `p15/sol/records.md` link,
and G1's header names `p15/flash/`; these grades are preserved as a
run with compromised model/process blinding (no score bias is
evidenced, but successful blinding cannot be claimed). This report
was corrected the same day per the independent Sol review
(`p15/SOL-REVIEW.md`, findings F01–F07): M1 confirmed (F03),
efficiency denominators and clocks (F04), coverage overstatements
(F07); the dossier store carried three modality-wrong records into
this run, corrected in the store 2026-10-14 (F05) — the 190/190
entailment result certifies the candidate, not the whole cache.
