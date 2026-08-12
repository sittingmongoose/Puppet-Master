# Exclusion revalidation coverage note

**Generated:** 2026-08-12T11:16:00Z  
**Universe:** july68 exact + july26 non-exact = **94** (`july68_pin_count=68`, `july26_pin_count=26`, `total_rows=94`).
**Ledger:** `EXCLUSION_REVALIDATION_LEDGER.jsonl` (94 rows, `2026-08-12T07:41:47Z`).

## Result
- **92/94** pass (`all_revalidated=false`, `fail_count=2`)
- Ledger split:
  - 61 `exact_excluded` / `RECONFIRM_EXCLUDE`
  - 26 `non_exact_excluded` / `RECONFIRM_EXCLUDE`
  - 5 `persisted_unregistered_quarantine` / `RECLASSIFY_TO_UNREGISTERED_QUEUE` (`auth.github.*`)
  - 2 `exact_excluded` / `OWNER_DECISION_REQUIRED`

## Remaining owner rows (not admitted)
1. `done.budget_exceeded` → sheet `EXCL-OD-done_budget_exceeded`  
   Citations: `Plans/Run_Modes.md:399,406,414`; `Plans/Contracts_V0.md:2238-2243` (range `13279-13312` is a stale landing; do not silently restamp).
2. `stop.identical_failure` → sheet `EXCL-OD-stop_identical_failure`  
   Citations: `Plans/Run_Modes.md:257`; `Plans/Executor_Protocol.md:452`.

## Why census `exact_excluded` is 63, not 68
`68 − 5 auth.github reclass − 0 other = 63` live exact-excluded in census-adjudication, plus the 2 owner-pending rows still `actual_category=exact_excluded` in the exclusion ledger (`61 RECONFIRM + 2 OWNER_DECISION_REQUIRED = 63`). The 5 `auth.github.*` tokens moved to persisted-unregistered quarantine (`auth_github_reclass_count=5`) and are in the J248 owner-veto pack, not missing exclusions.

## Drift-census impact
`FREEZE_CURRENTNESS.md` marks citation homes **unchanged**:
- `Plans/Run_Modes.md`
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`

The 10 drifted Plans sources do **not** include those homes. No exclusion re-run is required from the 10:34Z drift extract. Do not restamp the 92 passing rows.

## Non-claims
Defaults are **not** auto-applied. Do not flip the exclusion ledger to 94/94 before explicit `owner_response.chosen_option` on both EXCL-OD IDs. `ADMIT` is not a sheet option.
