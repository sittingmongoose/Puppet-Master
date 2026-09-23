# Landing record: Event Authority source-current, 2026-09-23

Branch `plans/event-authority-source-current-20260921` is rebased onto `origin/main` `d247d57ebd`. The machine-readable companion is [landing-record-20260923.json](landing-record-20260923.json), which lists every finding below by key.

**Authority.** Jared confirmed each ruling in the DL-039 takeover conversation on 2026-09-23. The coordinator session (PM Low cost/complexity process) proposed the rulings:
- Land under the exceptions below: "Confirm, land it".
- The 42-family checkpoint: "Approved, separate branch".
- The currentness edition and Step 10 reseal: "Yes, designate me", after this landing.

## Landing check

In my own full worktree, `pm-landing-check.py --base origin/main` exits **2 with 15 blocking items**. The count matches the classes excused below and nothing else. The check is repeated in the shared checkout at landing.

## Excused, reported, and not blocking

1. **Scoped exception: 45 Storage registry findings on `Plans/storage_value_registry.json`.**
   - The set: 31 `storage_value_registry_*` findings and 14 `storage_value_secret_material_*` findings.
   - All 45 are also present on `main` with the same error, path and family. Three census rows differ only in their counts, because the branch adds 12 families.
   - The branch removes 40 other findings in the same file: 85 on `main`, 45 on the branch.
   - The validator is unchanged. Owner: Storage registry owner, repair in a later branch.
2. **Kept: the `goal_run.certified` v3 payload-ref mismatch** and its kernel-membership row. These stand on the precedent of `goal_run.started` and `goal_run.cancelled`, which carry the same failure on `main` since `e686963ad5` and `a3c511657f`. All four rows are listed together. Owner: the same.
3. **Governance staleness: 13 `event_authority_currentness_source_drift` rows and the two truncated readiness totals.**
   - The totals read 124 → 179. That baseline was recorded at `b29eab7b99` without the ignored currentness audit inputs.
   - With identical inputs, `pm-implementation-readiness.py validate` gives **218 on `main` and 179 on the branch**: 41 removed, 2 added.
   - This comes with a reseal request.

## Reseal request

These documents need a reseal:

- `Plans/00-plans-index.md`
- `Plans/Automated_Testing_System.md`
- `Plans/Backup_Restore_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/event_family_registry.json`
- `Plans/goal_certified_family_composition.json`
- `Plans/goal_certified_original_scope_dispatch.json`
- `Plans/storage-plan.md`
- `Plans/storage_value_registry.json`
- From the coordinator's landing: `Plans/Planning_Wizard.md`, `Plans/Bootstrap_Planning_Migration.md` and `Plans/Decision_Log.md`

The takeover agent does the reseal after this landing, as a separate landing.

## Not in this landing

- **The 42-family checkpoint.** Registry revision `2026-09-11.2`, SHA-256 `1972a6aa6ef168a46091be5347bc9cff657985a1c21ab1b84665b9ed96c1ed3a`, is approved. Recording it, the Decision Log entry and the repair of `scripts/pm_pnc019_currentness.py` lines 48–49 go in the next small branch.
- **The draft branches** `plans/browser-created-sp278-20260923` and `plans/terminal-workgroup-depth-20260923` stay unlanded until they pass blind review. The terminal draft also needs its cycle and ID fixed.
- **The queued DL-036 product cards** are with Jared.
- **Cleanup after the landing:** delete `plans/event-authority-certified-source-20260920` on origin, and remove this worktree.
