# Branch preflight and Usage disposition-ID correction — 2026-09-25

The full-check capture at branch `9ebd4ad9a44027a58aac2323c42794bc3832068d`
completed in 687.415 seconds, exit 2. All three checks finished without timeouts:
run-gates 4,833 failures, audit-governance 4,817, current-run migration 38,012.
Readiness reported 69 failures, compared with 24 in the recorded baseline.
These are diagnostic totals, not counts of newly introduced defects.

This is **not** the required fresh-main failure-key comparison. Branch/main
diverge by 112/72 commits from merge-base `1e5d9b097b46aa58e7af488a9c38a87efb780d5f`;
the check used locally available main `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`
and baseline `792d2fb8b12fc2c12659aeec4b3f0b9f4640d9f8`. Two-dot path matches
also include inverse main-side changes. Four complete validator exports matched
their totals; audit closure (201) and PRD contracts (1,240) remained total-only
comparisons in both aggregate checks. No baseline-export comparison was available.

## Four blocking rows, two causes

- `run-gates|lint_contractrefs|missing_ref|Plans/00-plans-index.md|64a5e35d4c9a`
- `audit-governance|support_refs|missing_ref|Plans/00-plans-index.md|64a5e35d4c9a`
- `run-gates|validate_implementation_readiness|draft_2020_12_schema_validation_failed|Plans/storage_value_registry.json|02c50b14149f`
- `audit-governance|implementation_readiness|draft_2020_12_schema_validation_failed|Plans/storage_value_registry.json|02c50b14149f`

The missing reference is
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`.
Its entire referring paragraph is unchanged across branch, main, merge-base and
baseline; the target is absent from all four Git trees. This is inherited content,
not permission to fabricate evidence, rewrite the historical pointer or waive the
checker. The later local-input check below resolves the path-availability cause;
it does not rewrite the captured aggregate result.

The registry defect was introduced by branch commit `5e160348d`:
`scd.usage.command_transport.v2` violates the existing disposition namespace.
Only that field is corrected to unique `scd.usage.quota_command_transport.v1`.
The existing historical `scd.usage.command_transport.v1` row, current
`pm.usage.command_request.v2` / `pm.usage.command_result.v2` runtime kinds,
schema, all other disposition fields and all physical families are unchanged.
No schema relaxation, new policy, custody admission or native writer is added.

## Verification after the correction

All 17 Usage quota tests pass, including full actual-registry Draft 2020-12
validation, unique disposition IDs and preservation of historical/current runtime
versions. Independent review passes; adverse probes reproduce rejection of the
old ID and detect collision with the historical ID.

The standalone readiness validator still exits 1, but its complete report drops
from 69 to 68 rows. Comparing every `(error,path,source_path,pointer)` key removes
only the schema finding above and adds none. The registry schema self-test now
passes; three existing Case-L event self-test predicates remain false. This is a
before/after branch repair comparison, not an exception proof against main.
Shards regenerate/check successfully: 99 documents, 2,760 shards, only the edited
storage-registry shard root changes. Index generation passes with 6,734 stable
PlanUnits and 26,476 acceptance units; no WorkNodes or NodeSeeds are created.

The full aggregate check was not rerun after this single-field correction. Its
exit 2 is not relabelled as passing. The Settings hash hold,
review-cap decisions and product/source-input questions remain open. No main
fetch/push, lock acquisition, governance binding refresh or baseline refresh occurred.

## Follow-up: authentic ignored audit input restored

The historical audit directory is present in the shared checkout and absent from
Git by `.gitignore:41`, explaining why a clean local worktree lacked it even though
the reference is unchanged. `lint-contractrefs` resolves against the live filesystem,
not Git objects. `LANDING_20260923_BSD_LIFECYCLE.md` records the same clean-checkout
failure. Two independent read-only checks confirmed the shared audit identity and
unchanged report; all 11 embedded local receipt paths match their declared hashes.

Only an ignored worktree-local directory symlink was added, pointing to
`/mnt/Cursor/PuppetMaster/Plans/.audits/audit-20260829-001-pmconcept7-widget-followup`.
No evidence bytes, historical reference, verdict, binding or baseline were edited.
The report still explicitly denies readiness and retains its failure/blocker verdict.
This is local input restoration, not an audit refresh or portable-checkout repair.
Future clean worktrees need this same authentic input made available.

The targeted full `lint-contractrefs` rerun passes, exit 0 in 50.55 seconds, with
zero failures. This resolves the two aggregates' shared missing-reference cause
locally; neither aggregate was rerun, and no landing permission is inferred.
Source audit report SHA-256:
`ef4eeb5f4c13a9baa23ed08f37c04a19c758dedc1dc84508b77169701ed2d294`.
Captured verification:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/audit-input-contractrefs-restored-001/stdout`,
SHA-256 `d22d3fecc6920dd22b61809f415b3bc0998fc29fb506e41dfd12a518236a0322`.

## Evidence

- Full capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/final-branch-preflight-20260925-001/stdout`, SHA-256 `eb5b8c0be35e4ab7ea55d0b7b21f4fc7cbdcf4eb8d29cc870d38174f9016fec2`. Full reports and exports are retained beside it.
- Accounting: `/mnt/Cursor/PM-Experiments/final-branch-preflight-accounting-20260925.md`, SHA-256 `040ef1d01069581b667222883ee81244f54c3d1fbbee92ace0f1eb75f4f8c933`.
- Provenance: `/mnt/Cursor/PM-Experiments/final-preflight-blocker-provenance-20260925.md`, SHA-256 `eed4b9c98ccf12e2ed338d9f0be3f29669c97dbb403da113be0304b10573f397`.
- Independent correction review: `/mnt/Cursor/PM-Experiments/usage-disposition-id-independent-review-20260925.md`, SHA-256 `592f2422b808c16749ee365dd890580f6681cfe67f0432dcc91c6c52dc4e374c`.
- Tests: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/usage-disposition-id-repair-001/stderr`, SHA-256 `b30243e0e911070b586005bb486a5efbadf6d92a6f1d408e1e46de176e960a2f`.
- Complete post-correction readiness report: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/usage-disposition-readiness-after-report-001.json`, SHA-256 `ae724d538c9f768510c7888299efb1854a2abb7cad89c7ce1e604644c377d889`.
