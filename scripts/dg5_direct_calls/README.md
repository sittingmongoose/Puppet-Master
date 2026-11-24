# Direct-call collector input (METHOD-RULING addendum 12 point 3)

`methods.json` is the census's per-method list, copied byte for byte from the edition `census-questions/followup-1/final-a19/methods.json` (sha256 `d4e521aeae0cbcd592bee83e6acd35133a1ff367d66af0cc5f34b23f98df69c6`), with one hand addition (below); the current bytes are sha256 `f184ebb2f8aa2df8c118246f2a2d66485bebc83299900786ffb78da4aadf1806`, pinned in `pm_goal_dg5_direct_calls.METHODS_SHA256`. `load()` refuses any other bytes.

**C4I census correction (2026-11-23; widened by the lead, message 1123220854).** `goal.cancelled.owner_methods` gains `WorkflowCancel.issue_assignment_audit` (module `pm_goal_dg_ca3_route`) with **every owner-corpus direct call site** of the method, both groups: C4I `pm_goal_dg_ca3_inspection_cases.py:158` (the positive), `:194`, `:204`, `:213`, `:222`, `:231` (the five `late_*` negatives); C3 `pm_goal_dg_ca3_cases.py:44` (`until`, the setup calls for later boundaries), `:92` (`positive`), `:244` (`boundary_negatives`, the `boundary_issue_assignment_audit_final_*` cases), `:522` (`audit_fence_lost`, the `:1010` case) and `:528` (`audit_template_drift`). The counts are the call counts of the `ca-C3-0..3` and `ca-C4I` probe runs (61 calls in 61 cases); `cases` 61 and `refusing_cases` 15 are derived from the same runs (15 calls refused inside the call with 15 distinct codes); `decided_rows` 125 is the census field — the guard rows the probe decided inside those calls — derived with `a18.py`'s own `load()` from the per-guard-row `override_labels` those runs record (122/124/122/122/121 per run, 125 union; `c4i-census/DERIVATION-decided_rows.txt`). Two counting differences from the neighbouring rows, for a future rebuild: `cases` is owner-corpus only (the DG5 supplement runs add 29 accepted `until` calls, so an all-runs count is larger), and `call_sites` names authored lines where other rows name the suite frame (`pm_goal_dg_ca_oracles.py:92(negative)`), because the steer asked for authored sites. The census missed the row because the call is a subclass override of the registered entry `AssignedCancel.issue_assignment_audit`: the probe records such a call as `via_entry='override'` (`outside-probe-v7.py:419-421`), not under the case's `direct` map, and `a18.py:234-236` builds `owner_methods` only from the direct maps. The C4I group itself was walked (the `ca-C4I` run is in the a19 run list and its `probe.json` names the method under `direct_sites`). The suite frame that invokes a bound method returned by a case (`pm_goal_dg_ca_oracles.py:92(negative)`) is not an authored call site and is not listed. The regression is `pm_goal_dg5_direct_calls_c4i_selftest.py` (its `only_that_row_added` trial pins the rest of the file to the base edition's canonical digest).

For each family it gives:
- `owner_methods`: the owner methods the family's own authored corpus calls directly. These are the ones the collector records.
- `excluded_construction`: constructors, factories and fixture-class methods. These are never wrapped.

The list is final for every family, and none is `PENDING`. To drop in a new edition:
1. Replace this file.
2. Set `METHODS_SHA256` to its sha256.
3. Say why in the commit.

`construction_by_rule` is kept as a guard: a listed name that the written C1-C3 rules exclude is not wrapped. On `final-a19` it skips nothing.

Review bundle: `covered-later-fix/review/addendum-7/README.md`.
