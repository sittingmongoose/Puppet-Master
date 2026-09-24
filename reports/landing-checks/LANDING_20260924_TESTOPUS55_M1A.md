# Landing record: TestOpus5.5 onboarding, milestone M1a, 2026-09-24

Branch `concept/testopus55-onboarding-m1a-20260924`, rebased onto `main` `b688606877` and checked at tip `44539138b3`.
This record is a report-only commit on top of that tip, and `main` is fast-forwarded to it. The branch touches only
`Concepts/onboarding/opus-5.5/**` and the generated `Concepts/TestOpus5.5PmConcept.html`: 58 paths, no `Plans`,
`scripts` or `tests` file.

## Procedure

1. Landing lock taken at 2026-09-24T06:57:58Z (holder refreshed at 10:33:00Z after a usage-limit pause; nobody else
   held or took it meanwhile).
2. `git fetch`, `git rebase origin/main`: clean. `tools/build.py --check` passes on the rebased tree.
3. Shared checkout: no uncommitted entry among the branch's paths. `git merge --ff-only` to `44539138b3`.
4. Shard check: pass, 99 documents, 2,720 shards.
5. `python3 scripts/pm-landing-check.py --base origin/main` exits **2**. Output:
   `/mnt/Cursor/PuppetMaster-Evidence/tests/testopus55-onboarding-20260924/m1a/landing-check-44539138b3.txt`,
   SHA-256 `bd10ea5c2f53123ef69babcc593b7de21ab474527940d4943c49efc75d983412`.
6. Before pushing, `origin/main` was confirmed unchanged at `b688606877`.

## Why nothing reported here is this branch's

Rows naming a path this branch touches: **0**. Every total equals what `main` already reported at the landing of
`ca57806bfe` (`LANDING_20260924_POST_AUDIT_REPAIR.md`); `b688606877` after it added only a report file.

| Check | Recorded at `ca57806bfe` | This landing |
|---|---:|---:|
| `run-gates` total | 3,217 | 3,217 |
| `audit-governance` total | 3,217 | 3,217 |
| `plan-migration-validate` (run 017) | 33,072 | 33,072 |
| evidence / plan graph (truncated) | 847 / 847 | 847 / 847 |
| plan-migration subcheck | 31 | 31 |
| Spec Lock | 10 | 10 |

The six items the baseline (`75bcda93bc`) does not excuse are the same inherited rises the two earlier landings
today classified: the truncated evidence and plan-graph totals 665 → 847 (authorized and proved in
`LANDING_20260924_DL070_FOLLOWUPS.md` and `LANDING_20260924_POST_AUDIT_REPAIR.md`), the
`event_authority_currentness_source_drift` bucket 4 → 9, and the `storage_value_registry_spec_lock_hash_stale`
bucket 1 → 2. The branch adds nothing to any of them. No reseal request comes from this landing; the baseline is
not refreshed.

## What landed

The rebuilt onboarding for `Concepts/TestOpus5.5PmConcept.html` (see `Concepts/onboarding/opus-5.5/README.md`):
every chapter, branch and sub-flow in pilot art. 33 of 33 acceptance scenarios pass by real clicks with no page
errors and no refused owner commands, and the 11 drafts they captured validate against
`Plans/product_onboarding_contracts.schema.json`. Evidence:
`/mnt/Cursor/PuppetMaster-Evidence/tests/testopus55-onboarding-20260924/m1a/` (`SHA256SUMS` inside).
