# Closed-slot ledger v1

Finite offline reporting adapter for the original ER10 40-slot / 80-arm index. Original judgments remain unchanged. Five final GLM slots remain `HELD_OR_LIVE`; this bundle makes no terminal campaign claim or new recommendation.

## Files

* `ledger.py` — Python 3 standard-library adapter; no external dependencies, network, accounts, Goals or workers.
* `CLOSED_SLOT_LEDGER.json` — one row per immutable slot, in original order; separate control/treatment final-authorized records, histories, exceptions and denominator memberships.
* `FIELD_MAP.json` — exact original JSON pointers, source document SHA-256 hashes, transformations and precise missing-field reasons for every evidence cell.
* `INPUT_IDENTITIES.json` — original and frozen input identities, linked capture lineage and unavailable references.
* `REPORTING_NOTES.md` — count boundaries, original distinctions, version rules and economic limitations.
* `validation.json` — mechanical source/mapping/count checks and replay results.
* `config.json`, immutable `INPUTS.json`, `inputs/`, `captures/`, `CAPTURE_MANIFEST.json` — retained control inputs and byte-exact evidence required for offline replay. Keep these with the adapter.

## Offline use

Run from any working directory:

```sh
python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/final-report/closed-slot-ledger-v1/ledger.py build
python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/final-report/closed-slot-ledger-v1/ledger.py validate
```

`build` reads only the retained bundle and regenerates the four JSON reporting artifacts. `validate` checks the saved ledger/map and rewrites validation results. Both write only beside `ledger.py`. Exit 0 means the mechanical checks pass; exit 1 reports failed checks. Whole-ledger and field-map replay identities are checked, not just counts. The entire folder is relocatable: source metadata keeps its original campaign path identity while replay loads local frozen files.

`capture` is the bounded original closed-metadata capture operation, already completed. It opens only exact permitted metadata links, excludes every held GLM case, enforces the 180-file / 32-MiB caps, and refuses further reads at the absolute writing-reserve cutoff. Reproduction uses `build` and `validate`, without recapturing mutable campaign files.

## Reading a row

An evidence cell has `value`, `state`, `original.source`, `original.pointer`, `original.sha256` and `transformation`. `KNOWN_NULL` preserves an explicit original null; `UNKNOWN` names the exact missing/nonboolean field. A boolean true reports an explicit original flag or listed categorical declaration; it does not create a scientific pass. Candidate final metadata records retain declared identities and hashes without reopening candidate bodies.

Use `original_grade_string` for the verbatim categorical judgment, `original_grade_record` for its original object/value, and `original_assessment_dimensions` for independent coverage, obligations, process and runtime limits. `original_grade_context` identifies treatment-only standalone exceptions. Such exceptions cannot promote paired eligibility. Native, provenance, timing, reviewer delivery and economic records remain separate.

`version_history` and `review_history` retain original source-bound outcomes. Retests and review rounds do not add logical slots or replace earlier grades. Aggregate true/false/unknown membership lists expose each distinct denominator. Original cohort/attempt counters remain in `original_authority_counters`; see `REPORTING_NOTES.md` before combining them.

C01 control deliberately keeps original defect count 0 and missing grade, with assessment `UNASSESSED` and normalized material count null. C02's O1 remainder and C03's native `blocked`/comparative `HOLD` remain visible independently of their original science judgments.
