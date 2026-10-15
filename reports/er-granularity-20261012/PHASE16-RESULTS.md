# Phase 16 — dossier depth tier, component test (2026-10-14)

Design: `PHASE16-PREREG.md`. Three source-inverted depth slices on the
donor bodies Phase 15 starved, prompts from frozen caseC only, scored
by the host against `p16/CHECKLIST.md` (frozen gold P05–P10/P17/P18
deciding facts, 26 sub-facts; slices never saw it).

## Result — CORRECTED 2026-10-14 per independent Sol review (F01, F04)

**The blind-coverage claim is retracted.** The Sol review's audit of
the actual child task histories shows the redb and RocksDB slice
workers read `p16/CHECKLIST.md` in full before answering (the host
placed the gold-derived scoring key inside the working directory and
the prompts set no read allowlist); the journal worker did not. The
outputs remain useful coached extractions, and the review's own
source comparison confirms the slices do contain the deciding facts
with conditions — but this run **cannot demonstrate blind depth-tier
recovery**, and neither the ≥80% coverage criterion nor the budget
criterion is established. An isolated re-run (Phase 16b: inputs
copied to per-slice directories, explicit read allowlists, post-hoc
read audit) replaces this result.

What was measured, for the record: claims extracted redb 54,
RocksDB 58, journal 60 (172 total, ~11 min parallel); host keyword
pass 26/26 checklist sub-facts with spot-verification of the three
subtlest (PutLogData log-only/no-sequence, process-vs-machine crash
under `WriteOptions::sync`, realtime monotonicity only "modulo
wallclock time jumps") — under checklist exposure for two of three
slices. Raw body input was 254,507 B (redb 44,733; RocksDB 174,927
of which options.h is 152,721; journal 34,847), over the ≤200 KB
budget under either KB reading, before prompts and leaked reads.
The earlier ~92 KB picker projection used Phase 15's invalid 36%
ratio (F04) and is withdrawn; pairing the depth tier with picker
preselection remains a hypothesis for the isolated re-run to test,
not an established production rule:

- Donor mechanics deciding ≥2 clause dispositions always get a
  picker-preselected depth slice, regardless of dossier record hits.
- Dossier records remain lookup-grade only (existence, defaults,
  version facts), never the sole evidence for mechanics claims.
- Integrator input host-renders record conditions verbatim when
  records are cited (Phase 15 finding 2, still untested end-to-end).

Next: Phase 16b isolated re-run of this component test, then the
held-out caseD full-stack run (Phase 17, already frozen) with the
depth-tier allocation treated as the hypothesis under test rather
than an established rule, same gold/grade protocol and success
criteria, per-stage measurement including picker contexts filed.

## P16b isolated rerun (2026-10-14, after Sol review F01)

Original P16 blind-coverage claim RETRACTED: redb/RocksDB workers read p16/CHECKLIST.md (gold-derived key in working dir, no allowlist). Journal run did not.

P16b method: inputs copied to p16b/in/<donor>/; prompts carry explicit read allowlists ("Read ONLY these files"); child activity audited post-hoc BEFORE scoring. Audit result: all three children read only allowlisted files (redb: 5 files + wc/nl on same; RocksDB: 5 files, CHECKLIST refs 0, /p16/ refs 0; journal: 4 files + mkdir/write only).

Blind coverage vs p16/CHECKLIST.md sub-facts (keyword scoring, same patterns as P16):
- redb (DS, 57 claims): 7/7 covered (P05a,P05b,P06a,P06b,P06c,P06d,P07).
- RocksDB (DS, 51 claims): 7/9. Missed: P09c 128MiB WAL discard threshold, P11b checksum masking trims.
- journal (GLM, 58 claims): 4/5. Missed: P13a explicit not-authenticity statement (no origin/authorship phrasing present).
- Total: 18/21 = 85.7% >= 80% prereg threshold, blind and isolated.

Caveats: whole-body depth input totals 254,507 B across donors, already above the 200 KB/topic budget; the picker-pairing projection from P16 remains WITHDRAWN and untested. Depth-tier recovery is supported as a mechanism; its cost at full corpus scale is not yet solved.
