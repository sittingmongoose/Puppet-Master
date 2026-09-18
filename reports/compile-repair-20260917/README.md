# Compile repair, 2026-09-17

Two compiles landed on 2026-09-17 and both passed independent review. A peer thread then measured them
with the deterministic compile witness (`scripts/pm-ledger-compile-witness.py`, on `main` at `4f5eda0d18`)
and with blind form-driven reviews. This bundle is the repair of what those found.

- Branch: `plans/compile-repair-20260917`, from `main` at `4f5eda0d18a9deff2349b03ae573f0ffd706ed61`.
- Ledgers repaired: `pldg-20260917-001-jujutsu-continuation4-corrections` (landed `61bea7aabc`) and
  `pldg-20260917-002-external-research-canon` (landed `c9bf2d24e1`).
- Claim boundary: static text, schema, fixture, shard, index and ledger-validator integrity only.
  No governance seal, no runtime certification, no readiness admission. **No schema or fixture
  semantics were changed.** Every machine token this repair names in canon already existed in the
  shipped schemas and fixtures; naming it makes a promise the unit already made checkable.

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

## Acceptance

Deterministic checks pass, and the branch stops for one blind form-driven review with a cycle cap of two.
Items that survive the review are recorded as open questions rather than repaired in a third pass.
