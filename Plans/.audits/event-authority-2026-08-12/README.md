# Event Authority campaign artifacts (2026-08-12)

Canonical campaign workspace under CLAUDE STRICT allowlist (`Plans/**`).

## Rules
- **No `scripts/**` edits.** Existing scripts may be *run*, not modified.
- Independent EA validator lives here: `independent-validator/`.
- Individual dispositions for 253 unreg + 40 unresolved + 2 August live in `individual-disposition/`.
- Admission frozen until non-provisional individual dispositions + one batched owner veto sheet.
- Working-dir copies under `C:/Users/sitti/.omp/run/ea-pnc019-20260812/` are non-canonical scratch only.

## Checkpoint binding note
`scripts/pm_pnc019_currentness.py` currently hardcodes denominator/depth incomplete. Per Advisor-2, that file is **not** edited in this campaign phase. The Plans-side validator is the sole place that may *earn* a clearance receipt. Binding that receipt into currentness/PNC requires a later explicitly authorized scripts change (or other owner-approved maintenance path) — until then existing scripts remain fail-closed when run.

Generated: 2026-08-12T03:56:34Z
