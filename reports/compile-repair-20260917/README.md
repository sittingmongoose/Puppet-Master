# Compile repair, 2026-09-17

Two compiles landed on 2026-09-17 and both passed independent review. A peer thread then measured them
with the deterministic compile witness (`scripts/pm-ledger-compile-witness.py`, on `main` at `4f5eda0d18`)
and with blind form-driven reviews. This bundle is the repair of what those found.

- Branch: `plans/compile-repair-20260917`, from `main` at `4f5eda0d18a9deff2349b03ae573f0ffd706ed61`.
- Ledgers repaired: `pldg-20260917-001-jujutsu-continuation4-corrections` (landed `61bea7aabc`) and
  `pldg-20260917-002-external-research-canon` (landed `c9bf2d24e1`).
- Claim boundary: static text, schema, fixture, shard, index and ledger-validator integrity only.
  No governance seal, no runtime certification, no readiness admission.
- **The boundary was widened on 2026-09-18 and this is the record of it.** The repair through commit
  `b56be91761` changed no schema or fixture semantics: every machine token it named in canon already
  existed in the shipped schemas and fixtures, and naming it only made a promise the unit already made
  checkable. Two of the questions that repair raised asked for changes it deliberately would not make.
  Jared answered "agree" to all nine recommendations on 2026-09-18, and two of those answers are schema
  and fixture changes: `q-012` renames the `toolchain_identity` property to `native_toolchain_identity`
  across both schemas and both fixture files, and ledger 002's `q-005` adds the
  `declared_other_arm_artifact` input class with a required `declared_source_arm_id` and one positive
  and one negative fixture. Those changes are authorized by
  `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_20260918.md`,
  SHA-256 `ec15e8b383322546eed7eb699550b9444b5a27a9d1ab3e8b504adef095a0639c` as read on 2026-09-18. That
  file is appended to as further answers arrive, so the hash is the reading this branch acted on rather
  than a frozen file, and a later re-hash differs; it is also agent-relayed and not verifiable from inside
  this repository. Cycle 1 of the blind review
  read the schema and fixture changes as contradicting the stated boundary, which they would have been
  without those answers; this paragraph is the correction. Nothing outside the nine answers changed a
  schema or a fixture.

## What the witness said, before and after

| ledger | witness | before | after |
|---|---|---|---|
| 001 | 1 repairs vs targets | 5 of 11 records name a unit their atoms never targeted | 0 |
| 001 | 2 exact tokens | 22 of 56 reach no owner prose, all 22 only in schema or fixture companions; 53 reach no owner registry | 0 and 0 |
| 001 | 3 registry hygiene | 5 units, 10 entries absent from their own text | 0 |
| 002 | 1 repairs vs targets | no findings records to check | unchanged |
| 002 | 2 exact tokens | 0 missing from prose; 4 missing from every owner registry | 0 |
| 002 | 3 registry hygiene | 9 units, 16 entries absent from their own text | 0 |

`pm-ledger-compile-witness.py` exits 0 on both ledgers, with and without `--base origin/main`. The
base-aware run also proves that every unit a findings record names as repaired really changed here.

Full reports: `witness-before-001.json`, `witness-after-001.json`, `witness-before-002.json`,
`witness-after-002.json`. `checks.log` is the whole verification sweep as it ran; `verification.json`
carries the summaries, the check lines, the changed-file list and the bundle hashes.

## The blind findings and what happened to each

`findings-dispositions.jsonl` carries one line per finding across all seven reviewer packets, with the
mechanical evidence it was judged on. Every claim was checked against the text, the shipped schemas and
the shipped validator, never against the reviewer's own quoted evidence.

| | continuation-4 | External Research | total |
|---|---|---|---|
| confirmed and repaired | 50 | 33 | 83 |
| confirmed, deferred to an open question | 0 | 10 | 10 |
| confirmed, recorded and not repaired | 0 | 37 | 37 |
| not confirmed | 2 | 2 | 4 |
| | 52 | 82 | 134 |

The two blind review cycles on this branch itself add 23 more, dispositioned in the same file under
packets `blind-review-cycle-1` and `blind-review-cycle-2`: 19 repaired, 4 recorded as open questions.
Across all nine packets the file holds 157 findings: 102 repaired, 14 deferred to an open question,
37 recorded and not repaired, 4 not confirmed.

Four reviewer claims were checked and rejected, and repairing any of them would have made canon worse:

- Two said `native_toolchain_identity` and `graph_states` occur in no unit in scope. DL-058 carries both.
- One asked that "or a declared owner route" be dropped from JJI-008. `jujutsu_admitted_action_ids()` in
  `scripts/pm-new-contracts-verify.py` admits the command enum together with every
  `x-puppet-master-owner-routes` list, so JJI-008 was right and JJI-003 and JJI-006 were narrower than
  the gate. They were widened to match instead.
- One said `validate-new-contracts` is not separately invocable. It is both a command and a named
  subcheck, so both ATS-054 statements are true.
- One said ERS-008's published-tariff and zero-floor rule is ungrounded. It is stated in a source
  ERS-008 cites, and removing it would orphan the schema's `tariff_floor` valuation basis and its
  negative fixture.

One reviewer arithmetic claim about nineteen candidates reducing to thirteen records does not fail under
the findings shard's own subtraction; the real defect it gestured at, that the two source shards count
different populations without saying so, is repaired in the findings shard.

The writer arm's proposed blocks in `wave3/trial/packets/writer-full/repaired_blocks.jsonl` were read as
input to judge, not as text to paste. Its DL-057 proposal is applied in this branch's own wording. Its
DL-058 proposal would have truncated Jared's verbatim answer back to two sentences, undoing review note
N3, and is rejected.

## What the nine answers changed, and what is still open

Eight questions this repair raised were put to Jared and answered "agree" on 2026-09-18; a ninth item
recorded the reseal as owed. What they changed is in the commit log and in `evt-009` on both ledgers, and
the two that widened this repair's boundary are named in the boundary paragraph above. In short: `q-011`
closed with no change, `q-012` renamed the property to `native_toolchain_identity` end to end, `q-013` put
the pseudo-remote clause into ledger 001's own records, `q-005` added the `declared_other_arm_artifact`
input class with its declaration field and two fixtures, `q-006` recorded the Automated Testing consumer
reference in the authorization shard, `q-007` marked `visible_only` a design default, `q-008` recorded the
settings inventory rows as owed to the Settings owner's next wave, and `q-009` gave the three consumer
units their own headings. None of those eight is open any more.

Twelve questions are open across the two ledgers and none blocks landing.

On `pldg-20260917-001-jujutsu-continuation4-corrections`: `q-008`, `q-009` and `q-010` from the landing,
the three obligations that compile left unenforced; `q-014` on which unit should own the closure
definitions SCS-014 and JJI-008 now share, since the declared dependency edge runs the other way and
adding the missing edge would make a cycle; and `q-015` on whether canon states a width for a folded block
scalar, after two review cycles raised the line widths of the four this repair edited and the folding
makes all of it semantically inert.

On `pldg-20260917-002-external-research-canon`: `q-001` through `q-004` from the landing, including
continuation 5's unreported results; `q-010` on whether DL-036 should use its consumers' words, since
DL-036 is a landed decision outside this repair's scope; `q-011` on what enforces the `visible_only`
design-default marking, which both owners now state as a criterion but no fixture tests; and `q-012` on
whether the declared-input rule needs a second negative fixture for the class that must not declare.

Governance artifacts are untouched. Editing canon makes the Spec Lock, evidence and readiness hashes stale
for the edited documents; that reseal is the designated Plans agent's, per Jared's answer of 2026-09-18,
and is not performed here.

## Cycle 1 of the blind review

Verdict fix-then-land: no blocking finding, seven should-fix, five notes. Findings at
`~/PM-Experiments/blind-review-compile-repair-20260918/findings.jsonl`, SHA-256
`aadaf1cfdf6410cae3f560211a90a367042fe42269c315f1708f015beca3ce72`. All twelve are dispositioned in
`findings-dispositions.jsonl` under packet `blind-review-cycle-1`.

Ten are repaired: the ledger registry still recorded `evt-006` and pre-repair timestamps for both ledgers
(R-01); JJI-004 became a compile target with edited text but was missing from ledger 001's compiled-unit
list (R-02); narrative state fields in both ledgers still counted open questions that had since been
answered (R-03, R-04); JJI-008's store-entry criterion demanded a source trace the schema forbids for an
`unrecognized` entry (R-05); ERS-003's contradiction with the run its measurements come from, which the
repair had deferred as `q-005` and Jared's answer resolved with the new input class (R-06); DL-058 priced
the wave at two unenforced obligations where it left three (R-09); the evidence shard's moving
`Plans/Decision_Log.md` row is annotated like its sibling (R-10); four folded scalars are re-wrapped
(R-11); and this receipt is corrected (R-12).

Two notes are recorded as questions rather than repaired: `q-014` on ledger 001 asks which unit should own
the closure definitions SCS-014 and JJI-008 now share, because the declared dependency edge runs the other
way and adding the missing edge would make a cycle; `q-010` on ledger 002 asks whether DL-036 should use
its consumers' words, since DL-036 is a landed decision outside this repair's scope.

## Cycle 2 of the blind review

Verdict fix-then-land: one blocking finding, five should-fix, five notes, all of it tracing to the two
commits since cycle 1. Findings at `~/PM-Experiments/blind-review-compile-repair-20260918/cycle2/findings.jsonl`,
SHA-256 `666e573c6094fa2cfd2b58c80fc3886f255c74511cbffe2b48fc49a96520813f`.

The blocking finding, R2-01, was that the answers wave widened the admitted-input enum in the shipped
schema and in ERS-003 but left the owner document's own contracts section stating the three-value closed
set and omitting `declared_source_arm_id`, so `Plans/External_Research.md` contradicted itself and the
schema it describes. That section now carries the fourth class, the declaration field and the
reconcile-and-compare restriction, and `Plans/Glossary.md` and `Plans/00-plans-index.md` carry the same
widening (R2-02). Nine of the eleven are repaired: the fixture counts in the owner document's validation
section (R2-03), the answers-file citations annotated as a live source (R2-04), SSYS-037's misattached
design-default clause and its absence from the unit itself (R2-05, R2-06), JJI-006's superseded token
(R2-07), and this bundle's own stale section and table (R2-10, R2-11).

Two notes are recorded as questions: `q-015` on ledger 001 asks whether canon states a width for a folded
block scalar, after two cycles raised the four this repair edited and the folding makes all of it inert;
`q-012` on ledger 002 asks whether the declared-input rule needs a second negative fixture for the class
that must not declare.

## Acceptance

Deterministic checks pass and both review cycles are fixed, which exhausts the cycle cap of two. What
survives is recorded as open questions rather than repaired in a third pass, and the branch lands.
