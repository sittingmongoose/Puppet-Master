# Ledger compile witnesses, first run (2026-09-17)

`scripts/pm-ledger-compile-witness.py` adds two static checks for a v2 ledger compile, both derived from the Jev pilot's wave-3 replay trial on the continuation-4 corrections compile (evidence: `~/PM-Experiments/jev-pilot-20260917/wave3/trial/REPORT.md`, SHA-256 `94154b38d216c62a8f29142f4ffa4581f25c5966b0ac093564d4737f0fd315f8`). Neither uses a model.

1. Repairs versus targets: a findings record that names a PlanUnit as repaired must have that unit among the compile queue targets of the record's atoms, and, with `--base`, the unit must differ from the base revision.
2. Exact tokens: every exact token of a compiled atom must appear in the owner unit's prose and in its `preserved_exact_tokens` registry; tokens present only in schema or fixture companions are reported as such.

Run: `python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/<ledger_id> --base origin/main` (exit 0 pass, 2 findings, 1 error; `--json` for the full report). Test: `python3 -m unittest tests.test_pm_ledger_compile_witness`.

First run on `pldg-20260917-001-jujutsu-continuation4-corrections` at main 61bea7aabc with base 2a92905501 (`pldg-20260917-001-jujutsu-continuation4-corrections.witness.json`): witness 1 fires on 5 of 11 records (SCS-014 named by records 4/5, 8 and 13 but never targeted; JJI-004 named by record 9, never targeted and unchanged; SCS-015 named by record 10, never targeted); witness 2 finds 44 of 79 atom-token by owner-unit pairs missing from the owner prose (42 of them present only in the schema and fixture companions) and 76 missing from the registries. Two independent blind reviews of the same compile raised the same two classes; the compile's own landed review did not. This bundle records the witness output only; nothing in canon was changed by this landing.
