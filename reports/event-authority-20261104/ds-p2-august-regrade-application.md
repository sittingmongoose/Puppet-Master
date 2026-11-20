# Lane DS-P2: receipted re-grade of the two August ledger rows (2026-11-04)

**Record:** `ds-p2-august-regrade-application.json`. It has the before and after hashes, the cell statuses, and every citation with its exact quote, line and excerpt hash.
**Pattern:** the step-5 application (`ds-step5-august-ledger-application.json`). It is a receipted row update:
- each row file and its two ledger lines are rewritten byte-for-byte except the changed fields;
- line endings are preserved;
- every citation is an exact single-line quote, located by script at `bef4342ecc`.

**Authority:**
- **DL-039.** The rows stay under `AUG-CP-WLC-001` and `AUG-CP-TWM-001`, unchanged.
- **DL-045.** SP-400 is a newly authored binding.
- **DL-076.** The suite re-freeze.

## What changed

| Row | Cells before (not PASS) | Cells after (not PASS) | Row file SHA-256 before → after | Citations |
|---|---|---|---|---|
| `workspace.layout_changed` | producer FAIL, positive_negative_oracles UNKNOWN | **none (12/12 PASS)** | `52f5b1c0b718607d…` → `b7416f6da4ec464f…` | 48 |
| `terminal.workgroup_moved` | positive_negative_oracles FAIL | positive_negative_oracles FAIL (stopped on an owner question) | `90cc4031819babb1…` → `0882d023d6005e4f…` | 29 |

| File | SHA-256 before | SHA-256 after | Lines changed |
|---|---|---|---|
| `Plans/.audits/event-authority-2026-08-12/individual-disposition/LEDGER.jsonl` | `df8a890d22ad4ce2…` | `92cc8ea83b67ef5e…` | 2 |
| `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` | `d29585810b22b128…` | `6769cee73fc0b7da…` | 2 |

**Changed fields per row:** `evidence`, `citations_checked`, `disposition_rationale` (appended) and `quality_notes` (appended). On the census line only `notes` is appended. The rows keep their disposition (`KEEP_REGISTERED`), `provisional` (false), bucket, cohort pins and owner choices.

## The two cells that change

- **Layout `producer` → PASS.**
  - SP-273 names the writer `home.workspace_layout_commit.v1` and its ordering, and adopts SP-286/CV-339.
  - The one thing that blocked v2 writes was SP-330's unwritten slot and receipt schema. SP-400 writes it (commit `2e5801d7df`). SP-330 and SP-273 now carry dated amendments saying so.
- **Layout `positive_negative_oracles` → PASS.**
  - The suite SP-273 pins is re-frozen as v5 under DL-076 and repinned (commit `bef4342ecc`; receipts `ds-p2-layout-suite-refreeze.*`).
  - SP-273 records that the full-value suite's stored-token copies are superseded.
  - SP-400's fixtures and checker cover the v2 write; ATS-040's fixtures cover the 2.0.0 payload.

## The cell that stays

**Terminal `positive_negative_oracles` stays FAIL.** The cell is stopped on an owner question about what a withdrawn family's oracles are (see `DS.md`). No fixture was written. Its note now cites the conflicting texts.

## Boundaries

No registry row, validator, cohort pin, owner choice or disposition changed, and no analogy or inference was used. No seal or denominator removal is claimed. `individual-disposition/COVERAGE.json` is not regenerated, as in step 5.
