# Post-audit repair: full landing delta, 2026-09-23

Decision: **STOP before landing. The three-file exception is insufficient.** No shared-main merge/push, governance binding refresh, baseline refresh, or reseal was performed by this task during this comparison. The repair remains on its published branch, not on shared main.

- Main tested: `026de6f949a0b1b39b539a9e6d3a4902d8d00fe3`.
- Repair tested: `9174a0f6f1d6bc66c04472c3046c7c31c7eb0663`, branch `fix/post-audit-contract-repair-20260923-land2`.
- Local worktree: `/home/sittingmongoose/pm-worktrees/post-audit-contract-repair-20260921`.
- User authority: only source-hash staleness for `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/touch_closure.json`, and their derived files; readiness growth only if the complete failure-key delta proves that cause. No governance refresh authorized.

## Complete comparison, not the printed sample

Both aggregate commands were run against main and the repair. Their normal `--report` output still compacts subchecks, so an external observer captured every unchanged `run_named_check` return before aggregation. It returned those original values unchanged to the original command. Each saved subcheck's full failure-array length and status was checked against the aggregate report. Comparisons use the landing check's normalizer and Counter differences, preserving duplicate multiplicity. No baseline or validator was changed for this observation.

Both capture summaries report no capture error; HEAD, base, pinned inputs, and shared dirty-tracked hashes stayed stable across their five guard snapshots. Main's unrelated pre-existing dirty files were preserved. The local checkout was not sparse.

| Aggregate | Main | Repair | Added keys | Removed keys | Outside exception |
|---|---:|---:|---:|---:|---:|
| run-gates | 2,875 | 3,063 | 190 | 2 | 2 |
| audit-governance | 2,875 | 3,063 | 190 | 2 | 2 |

The following additions occur independently in **each** aggregate; these are not 380 distinct product defects:

| Added kind | Rows per aggregate | Attribution |
|---|---:|---|
| `artifact_hash_stale` | 176 | 88 evidence + 88 plan-graph rows, authorized owner documents/shards |
| `stale_batch_report_sha256_after` | 7 | Commands_System (3), UI_Command_Catalog (4) |
| `event_authority_currentness_source_drift` | 3 | Exactly the three authorized files |
| `stale_hash` | 3 | Two authorized owner documents; **one verifier script outside scope** |
| `stale_audit_status_index` | 1 | **Outside scope**; local historical-input mismatch described below |

All 190 added rows and both removed rows, including full raw records and normalized keys, are retained in each delta artifact listed below. The removed errors are Browser `preexisting_family_rows_changed` and Touch `central extraction typed UI actions lack rows: ['ui.project.restore_archived']`.

### Readiness proof

Readiness is **79 → 82** in both aggregates, with exactly three added keys and no removed keys:

- `event_authority_currentness_source_drift`: `Plans/Commands_System.md`.
- `event_authority_currentness_source_drift`: `Plans/UI_Command_Catalog.md`.
- `event_authority_currentness_source_drift`: `Plans/touch_closure.json`.

Thus the readiness rise satisfies the user's condition. It does not excuse other out-of-scope rows.

### Rows that prevent use of the exception

1. `stale_hash`, `scripts/pm-plans-verify.py`, in `verify_spec_lock` / `spec_lock`. Expected SHA-256 `d10c009eceea4fcc66de4e55e9db3fabe1226425c3713e66e70a7f0bb55c1ca0`; actual `e678cdf975dc77beceed5b9a85ad0e10de85fc2f53782516847afceb96281c39`. The branch adds the primary-command-catalog validator import and invocation to the wiring check. This is a real branch source change outside the authorized three-file scope; it was not removed to suppress enforcement.
2. `stale_audit_status_index`, `Plans/.audits/_audit_status_index.json`, in `validate_audit_status_index` / `audit_status_index`. Read-only reconstruction proves main's index matches its inputs and the index bytes are identical in both checkouts. Main has 71 historical FINAL_REPORT inputs; the local worktree has 66. All 66 present report rows match exactly. The five missing local historical inputs are from audit IDs `audit-20260827-001-pmconcept7-usage-recovery`, `audit-20260828-001-pmconcept7-usage-successor`, `audit-20260828-002-settings-tome-tabs-preport`, `audit-20260828-003-chat-56-fast-lane`, and `audit-20260829-001-pmconcept7-widget-followup`. This explains an environmental row, not a repair to governance. It remains in the captured totals; no corrected full rerun is claimed.

## Repair verification and boundaries

The rebased repair preserves the earlier authored changes. Upstream adopted `goal_run.certified` v3 at `f6350caf277d662fad531fc9b9af4c82803670fa`; the Browser preservation guard now recognizes that exact sixth reviewed successor fingerprint, without changing the registry or authorizing arbitrary row mutation. Its mutation/rollback tests pass.

Focused results: authentication 4 tests, Touch 50, Browser 37, and primary catalog 19 pass (110 total). Browser CLI, generated plan-index validation, and shard check pass. These captures precede the final report/test-only upstream rebase; non-derived repair changes are unchanged by that rebase. The full aggregates above run on the final rebased repair.

This is not native implementation completion. The historical formal audit covers 13,416 cases and retains its implementation FAIL disposition, 643 runtime residuals, and 51 prepared-but-not-admitted Browser families. Existing audit judgments were not rewritten.

## Evidence custody

All paths below are outside the product repository; every digest is SHA-256.

- Main capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-main-20260923-026de6f9/summary.json` — `4821ad0149e4471a497049067995575cb8b885bdd108008c2737490af86321bf`.
- Repair capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-branch-20260923-9174a0f6/summary.json` — `752a929706a6b56d8410892f7efc919c652596f14cf61c32d2dc21de8a06e86f`.
- Full comparison summary: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260923-9174a0f6/summary.json` — `2b5f4acb7538a3c4d85165175361e8293e5c0c64803b569aa3dcca5a266ad8e7`.
- All run-gates delta rows: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260923-9174a0f6/run-gates-delta.json` — `92012f17986aa30df345c984b38e3e58464377910c8d5c28d1f432b87219e241`.
- All audit-governance delta rows: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260923-9174a0f6/audit-governance-delta.json` — `7b17d44f6b0815079e9e832bf0f68ce44667a0e303da1befe7077bf354cbbf7c`.
- Read-only missing-input diagnosis, including hashes of all five main inputs: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260923-9174a0f6/audit-index-environment.json` — `c4073c4881a9083e7a7e351173571dd6cc910350aa9f494adc706d2e9d28671a`.
- Initial focused capture (includes superseded Browser/index failures): `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-relanding-20260923-565fccc5/summary.json` — `5f51d39318e5fd39717096edba915fe3fc0ed4a4499c5d7e1b677f301be798dc`.
- Corrected focused capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-relanding-final-20260923-9799b80d/summary.json` — `f1257d793a2094da1ca2378f142af9e81bfb29e8639391547c604be0deafa1f2`.
- Earlier ordinary landing preflight, exit 2 (not a landing): `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-relanding-preflight-20260923-9799b80d/summary.json` — `32e95b1a8caaa25f88b24bd19b370b5cc0fee6d107454c7229d442a96870e375`.

## Handoff / reseal request

Request direction on the additional verifier-script `stale_hash`; do not assume expanded authority. Before a later landing, align the five ignored historical inputs without regenerating their index, fetch/rebase onto then-current main, and repeat the required checks. Shared main is not reserved by this task. The designated governance owner should reseal affected source/derived evidence and currentness bindings after an authorized landing; this task has refreshed none of them.
