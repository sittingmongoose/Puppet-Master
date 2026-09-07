# Plan scheduling demo batch 2

Open **Demo Studio → Guided Plan scheduling** in the generated Assistant.

- Schedule and build: bind V1, preview its due time and follow the two tasks.
- Revise a scheduled Plan: keep stale V1 visible, explicitly choose V2, preview its admission.
- Cancel a scheduled build: preserve the canceled record and prove the due-time preview creates no work.

The due-time preview is a gallery tool, not a background provider or scheduler. No global Date replacement is used.

This Assistant-only delivery includes Batch 1. TestPMConcept/Settings and canonical Plans/governance are unchanged. Protected working sources are byte-identical.

See BATCH_02_CHECKPOINT.json and reports/plan-demo-batch2-coverage.json for exact evidence scope and remaining requirements. APR-016 and APR-018 remain globally open.

Source build: `python3 build.py` then `python3 build.py --check`.

## Install
Merge the ZIP’s Concepts folder into the repository root, not inside the existing Concepts folder. Replace the supplied delivery manifests. Review local changes before overwriting; this bundle is based on 61cd18bb26c060982f709953b2495e9fd81a3543. External Settings manifest rows are historical carry-forward, neither supplied nor verified by this batch.

## Continue
Resume from BATCH_02_CHECKPOINT.json. Next bounded proposal is completed Single Agent / Multi-Pass Review demonstrations, followed by remaining collaboration and scheduling scope. Do not restart the 551-row census.
