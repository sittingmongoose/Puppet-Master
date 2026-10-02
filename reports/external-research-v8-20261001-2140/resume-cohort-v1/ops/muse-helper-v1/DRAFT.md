# External research v8 — paused accounting summary (publisher draft)

**State: PAUSED_BY_EXPLICIT_USER_REQUEST. Integrated research results NOT_RUN. No qualified recipe, productive route, winner, or quality grade claimed.**

This note is mechanical documentation by a Muse helper. It is not a counted candidate, canary start, evaluator, or research result, and adds no starts, usage, or grades.

Historical assessed freeze — two failed native canaries: HOLD/HOLD; 2 native starts; 1354.3749742507935 cumulative occupied seconds; 0/24 integrated executions; 0/12 comparisons. Per `attempts.json` and `economics.json`: v1 occupied 816.6492922306061s vs 480s cap, physical 450.307123673s; v2 occupied 537.7256820201874s vs 480s cap, parent 450.33003837s; both over cap; generated usage UNKNOWN; research_quality UNASSESSED.

v2 cleanup was late: `CANARY_V2_CLEANUP_ADDENDUM.json` records `release_on_time:false`, `lease_released:true`, 537.7256820201874s occupied; `CANARY_V2_ACCOUNTING_PROJECTION.json` shows hard_deadline 1790913885.8900976, released 1790913943.6157796; `CANARY_V2_TERMINAL_MANIFEST.json` lists 8 missing positive receipts including RESULT.md and metrics; qualification FAILED infrastructure not model quality, HOLD_POSITIVE_TERMINAL_METRICS_MISSING.

Latest paused ledger observation — three starts, 1427.4393529891968 occupied seconds, active_jobs empty per `README.md`, `CHECKPOINT.md`, `economics.json`. Pause recorded 2026-10-02T04:15:02Z, epoch 1790914502.1696212; resume unset; pause_duration null. Third-canary actual outcome/evaluation pending; not graded here. No pause duration, deadline extension/reset, model realization, or productive-route acceptance inferred. Stated prospective deadline 2026-10-02T13:40:09Z preserved as stated.

Reservations vs usage: 84 reserved starts and 151200 reserved occupied seconds for 24 initial + 4 holdout pipelines are prospective only, not starts/usage. All tokens/costs null/UNKNOWN; unknown is not zero. Prospective authority cites 144 starts / 172800s and 6 helpers; historical caps cite 48 starts / 57600s and 32 helpers; clocks, usage and frozen caps not reset.

Reviewer navigation — supplied evidence in this packet: `README.md`, `CHECKPOINT.md`, `attempts.json`, `economics.json`, `recovery-results-cohort-v2/README.md`, `recovery-results-cohort-v2/ops/execution-recovery-v1/CANARY_V2_ACCOUNTING_PROJECTION.json`, `CANARY_V2_TERMINAL_MANIFEST.json`, `CANARY_V2_CLEANUP_ADDENDUM.json`.

All other report-relative links visible therein — e.g. `RESULTS.md`, `methods.json`, `comparisons.json`, `schedule.json`, `FAILURES.md`, `BEST_RECIPE.md`, `REPRODUCE.md`, `protocol/README.md`, `authority/AUTHORIZATION.json`, `code-cohort-v1/README.md`, `route-cohort-v1/README.md`, `canary-controller-cohort-v1/README.md`, `tranche-cohort-v2/README.md`, `paused-checkpoint-20261002/README.md`, `.../AUTHORITY_AMENDMENT.json`, `.../RESTART.json`, `.../canary-v2-review.json`, `.../controller-v2-source-acceptance.json`, `.../OVERLAY_V2.json`, `.../USER_PAUSE_20261002.json` — are navigation only, not verified evidence here.

## Inconsistencies / missing data for publisher review

- `attempts.json` freezes 2 attempts at `ONGOING_RECOVERY_V2`; `economics.json` / `README.md` / `CHECKPOINT.md` report 3 starts paused. No third-start receipt supplied; implied increment is 73.0643787384033s, unverified.
- `CHECKPOINT.md` tranche paragraph cites one-start / 816.6492922306061s observed usage; superseded by two-start 1354.3749742507935s freeze and three-start 1427.4393529891968s ledger. Temporal scope needs publisher label.
- `economics.json` `observed_physical_canary_seconds` 450.307123673 matches v1 only; v2 parent 450.33003837s and wrapper-through-quiet 449.993576701s separate. Scope ambiguous.
- Pause epoch 1790914502.1696212 vs 2026-10-02T04:15:02Z conversion, resume time, and pause duration not verifiable from supplied files; all null/unset preserved.
- Reconciliation of 84 / 151200 reservations vs 144 / 172800 prospective limits vs 48 / 57600 historical limits not in supplied files.
- All token/money fields null/UNKNOWN; key reviews and overlays named but not supplied: `canary-v2-review.json`, `native-canary-proof.json`, `AUTHORITY_AMENDMENT.json`, `OVERLAY_V2.json`, `USER_PAUSE_20261002.json`.
