# Shard 013: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/GitHub_Integration.md`

Source lines: L2066-L2075

Source SHA256: `6859cad9e197dd144a2ce1ef3d0be988354d8527b30ccaf5bf7abc22f0cefcf8`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 316` (repaired; source line 1082; `sfk-9e19da53b708f174b92bbe76`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L1015-1073,126-128: confirmed via grep zero occurrences of "webhook" or "poll" anywhere in the file; Actions readiness/staleness states are named but the actual observation transport and interval are never specified anywhere, including GI-012 ("Actions Readiness Re
- `registry_line 317` (explicitly_deferred; source line 1083; `sfk-a27bc5c5401709bfa6f09922`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L84-227: no field-level schema for `compare_origin`, `graph_patch_request/result`, or pinned-workflow record every payload named, never typed.
- `registry_line 318` (repaired; source line 1084; `sfk-4ca6da4b81de5f8665c4ae9f`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1022,1046-1063: 13-14 `actions_*` blocked-reason codes listed as bare tokens with no severity/retry-eligibility/user-message table.
- `registry_line 319` (repaired; source line 1085; `sfk-218bd2f9b09b060a43aa18b8`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1126-1177: worktree topology view and `cmd.git.worktree.*` commands named with zero trigger/confirmation/state detail.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
