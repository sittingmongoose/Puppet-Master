# Compile repair, 2026-09-17

Two compiles landed on 2026-09-17 and both passed independent review. A peer thread then measured them
with the deterministic compile witness (`scripts/pm-ledger-compile-witness.py`, on `main` at `4f5eda0d18`)
and with two blind form-driven reviews per compile. This bundle is the repair of what those found.

- Branch: `plans/compile-repair-20260917`, from `main` at `4f5eda0d18a9deff2349b03ae573f0ffd706ed61`.
- Ledgers repaired: `pldg-20260917-001-jujutsu-continuation4-corrections` (landed `61bea7aabc`) and
  `pldg-20260917-002-external-research-canon` (landed `c9bf2d24e1`).
- Claim boundary: static text, schema, fixture, shard, index and ledger-validator integrity only.
  No governance seal, no runtime certification, no readiness admission. **No schema or fixture
  semantics were changed.** Every machine token named in canon by this repair already existed in the
  shipped schemas and fixtures; naming it makes a promise the unit already made checkable.

## What the witness said, before and after

| ledger | witness | before | after |
|---|---|---|---|
| 001 | 1 repairs vs targets | 5 of 11 records name a unit their atoms never targeted | 0 |
| 001 | 2 exact tokens | 22 of 56 reach no owner prose (all 22 only in schema/fixture companions); 53 reach no owner registry | 0 and 0 |
| 001 | 3 registry hygiene | 5 units, 10 entries absent from their own text | 0 |
| 002 | 1 repairs vs targets | no findings records to check | unchanged |
| 002 | 2 exact tokens | 0 missing from prose; 4 missing from every owner registry | 0 |
| 002 | 3 registry hygiene | 9 units, 16 entries absent from their own text | 0 |

`pm-ledger-compile-witness.py` exits 0 on both ledgers, including with `--base origin/main`, which also
proves every unit a findings record names as repaired really changed on this branch.

Full reports: `witness-before-001.json`, `witness-after-001.json`, `witness-before-002.json`,
`witness-after-002.json`. `verification.json` carries the summaries, the gate and validator lines and
the file hashes.

## What was repaired, and what was judged not to need repair

`findings-dispositions.jsonl` carries one line per blind finding across all six reviewer packets, each
with its disposition: confirmed and repaired, confirmed and deferred with the question id, already
fixed before this branch, or not confirmed with the reason. Every disposition was checked against the
text, not against the reviewer's own quoted evidence.

The proposed repaired blocks in `wave3/trial/packets/writer-full/repaired_blocks.jsonl` were read as
input to judge, not as text to paste; where this branch repairs the same defect the wording is its own.

## What is deliberately not done here

Two obligations would need a schema change and are recorded as open ledger questions rather than
asserted in canon. Neither blocks landing.

- `q-011` on ledger 001: should the effective-capability snapshot carry a recovery-action floor field
  of its own, or keep projecting the floor JJI-003 sets on command availability? `allowed_action_ids`
  exists only on `availability_payload`.
- `q-012` on ledger 001: should the shared version block carry one name end to end? The shared
  definition is `native_toolchain_identity` and the property that carries it is `toolchain_identity`.
  Canon now names both rather than only the property, which is what the blind reviewers raised.

Governance artifacts are untouched. Editing canon makes the Spec Lock, evidence and readiness hashes
stale for the edited documents; that is the designated Plans agent's reseal, not this branch's work.

## Acceptance

Deterministic checks pass, and the branch stops for one blind form-driven review with a cycle cap of
two. Items that survive the review are recorded as open questions rather than repaired in a third pass.
