# Direct-call collector input (METHOD-RULING addendum 12 point 3)

`methods.json` is the census follow-up's per-method list (`census-questions/followup-1/methods.json`), copied byte for byte. It is pinned in `pm_goal_dg5_direct_calls.METHODS_SHA256`. For each family it gives:
- `owner_methods`: the owner methods the family's own authored corpus calls directly. These are the ones the collector records.
- `excluded_construction`: constructors, factories and fixture-class methods. These are never wrapped.

**Run Cancelled** (`goal_run.cancelled`) is listed in `pm_goal_dg5_direct_calls.PENDING`. Its reruns are finishing on Nas1, so nothing of that family is wrapped yet. To drop its final list in:
1. Replace this file with the final `methods.json`.
2. Set `METHODS_SHA256` to the new file's sha256.
3. Remove `goal_run.cancelled` from `PENDING`.

`load()` refuses any other bytes.

## Status: work in progress (paused 2026-11-21 for addendum 8, the Method B port fix)
**Done:**
- **The collector:** `pm_goal_dg5_direct_calls.py`, with the install line in each family source.
- **Unit trials:** 11/11 PASS (`pm_goal_dg5_direct_calls_selftest.py`).
- **Real red-first case:** `C3/d06_publish_after_body_moved`.
  - At 0dc66db2c9 it records no direct call and no `ca3_native:997` record.
  - Here, `D06Owner.publish` is recorded as a direct call and is KILLED_CODE, with no J4 patch.
- **Smoke shards:** CF1 CF-01 (629 direct calls recorded) and CA C1 10/64 (6), 0 failures each.
- **The sealing rule:** a direct call with no world or store to seal runs unrecorded, counted under `unsealed_calls`. `ca3_route:workflow_world` creates a store, and running it twice broke the case.

**Still to do:**
1. The byte-identical b50 copy.
2. The dry per-family count of newly recorded rows, from `census-questions/followup-1/gap-classification.json`.
3. The review README.
4. The mail to DG5.
