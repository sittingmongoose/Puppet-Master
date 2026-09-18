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
  SHA-256 `ec15e8b383322546eed7eb699550b9444b5a27a9d1ab3e8b504adef095a0639c` as read on 2026-09-18,
  which is agent-relayed and not verifiable from inside this repository. Cycle 1 of the blind review
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
| confirmed and repaired | 50 | 32 | 82 |
| confirmed, deferred to an open question | 0 | 11 | 11 |
| confirmed, recorded and not repaired | 0 | 37 | 37 |
| not confirmed | 2 | 2 | 4 |
| | 52 | 82 | 134 |

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

## What is deliberately not done here

Eight obligations need an owner decision or a schema change and are recorded as open ledger questions
rather than asserted in canon. None blocks landing.

On `pldg-20260917-001-jujutsu-continuation4-corrections`:
- `q-011` should the effective-capability snapshot carry a recovery-action floor field of its own, or
  keep projecting the floor JJI-003 sets? `allowed_action_ids` exists only on `availability_payload`.
- `q-012` should the shared version block carry one name end to end? The shared definition is
  `native_toolchain_identity` and the property that carries it is `toolchain_identity`; canon now names
  both rather than only the property, which is what the reviewers raised.
- `q-013` should this ledger's summary of q-007's answer carry the pseudo-remote clause the approved
  decision card contains? Canon carries it and it is authorized; only the ledger summary omits it.

On `pldg-20260917-002-external-research-canon`:
- `q-005` ERS-003's input rule forbids reading another arm's artifacts, which is what continuation 4's
  review arms did. A prose scope qualifier would be enough; a new input class would be a schema change.
- `q-006` is `Plans/Automated_Testing_System.md` inside this compile's authorization? The shard does not
  name it and the compile queue compiles ATS-054 into it.
- `q-007` what establishes the `visible_only` branch of the unresolved-usage disposition?
- `q-008` what authorizes the settings inventory wave SSYS-037 defers its rows to, and what tracks it?
- `q-009` should the three consumer units carry their own markdown headings? Nothing is lost by the
  fenced form, so this is a compile-form decision rather than a defect.

Thirty-seven further External Research findings are confirmed, recorded in the dispositions file and not
repaired in this cycle: mostly prose qualifiers on ERS-001, ERS-010, ERS-011 and ERS-012, ledger-receipt
completeness on the compile queue and PLS-023, and citation form. Six of the citation-form findings are
answered by the document itself, which says paths beginning `PM-Experiments/` are rooted at `/mnt/Cursor/`.

Governance artifacts are untouched. Editing canon makes the Spec Lock, evidence and readiness hashes
stale for the edited documents; that is the designated Plans agent's reseal, not this branch's work.

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

## Acceptance

Deterministic checks pass, and the branch stops for cycle 2 of the blind form-driven review under a cycle
cap of two. Items that survive cycle 2 are recorded as open questions rather than repaired in a third pass.
