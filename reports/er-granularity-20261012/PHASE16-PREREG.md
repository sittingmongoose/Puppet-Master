# Phase 16 pre-registration — dossier depth tier (component test, 2026-10-14)

Cause (Phase 15): records-only answers scored 0–1 on every embedded-
store/journal gold proposition (P05–P10, P17–P18); the ≥3-record-hits
rule suppressed the slices that would have carried those mechanics.
This is a component measurement on the already-graded caseC (not a
held-out claim): can source-inverted depth slices — one flash context
per donor body, answering the case questions for that body — recover
the deciding facts with conditions intact, and at what input cost?

Design: three slices (DeepSeek max: redb README+design; DeepSeek max:
RocksDB options.h + write_batch.h; GLM-5.3 Flash max: systemd journal
format). Prompts contain only the frozen caseC brief/plan/questions —
no gold, no checklist, no candidate text. Output: numbered claims
with line locators, conditions/modality preserved verbatim in
substance, explicit NOT IN SOURCE list. Host scores each slice against
`p16/CHECKLIST.md`, extracted mechanically from the frozen gold's
P05–P10/P17/P18 source-fact paragraphs before slices launch.
Baseline to beat: the frozen flash final's coverage of the same facts
(grades: P05 0, P06 1, P07 1, P08 0, P09 1, P10 0, P17 0–1, P18 0–1).
Success: ≥80% checklist-fact coverage with conditions retained, at
≤200 KB total slice input; failure is reported as measured. Also
record wall time per slice vs the Phase 15 per-question slices.
Follow-on if it succeeds: depth tier becomes a slice-allocation rule
(donor mechanics deciding ≥2 clauses always get a depth slice;
records stay lookup-only) and is carried into the next held-out run.
