# Direct-call collector input (METHOD-RULING addendum 12 point 3)

`methods.json` is the census follow-up's per-method list (`census-questions/followup-1/methods.json`), copied byte for byte. It is pinned in `pm_goal_dg5_direct_calls.METHODS_SHA256`. For each family it gives:
- `owner_methods`: the owner methods the family's own authored corpus calls directly. These are the ones the collector records.
- `excluded_construction`: constructors, factories and fixture-class methods. These are never wrapped.

**Run Cancelled** (`goal_run.cancelled`) is listed in `pm_goal_dg5_direct_calls.PENDING`. Its reruns are finishing on Nas1, so nothing of that family is wrapped yet. To drop its final list in:
1. Replace this file with the final `methods.json`.
2. Set `METHODS_SHA256` to the new file's sha256.
3. Remove `goal_run.cancelled` from `PENDING`.

`load()` refuses any other bytes.
