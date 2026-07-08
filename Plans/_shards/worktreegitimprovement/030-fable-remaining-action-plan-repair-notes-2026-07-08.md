# Shard 030: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5106-L5114

Source SHA256: `0c41a6b37023f7b438a2774a46c1a88eae020bb5f9d3ff1284fa4ad8d521185d`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 246` (repaired; source line 884; `sfk-b3fbf73ded6ce2be14dd9c88`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L445,464,505: "2.7 (worktree_exists validity)" is referenced 3x but no `### 2.7` heading exists (2.6 jumps to 2.8) add the section defining the actual algorithm.
- `registry_line 247` (repaired; source line 885; `sfk-be3c6367e06fceee5d56722a`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L146 vs L1240-1248 vs 7.14(3): conflict-worktree persistence resolved three different (partially contradictory) ways across the doc state the one resolved decision (in-memory HashSet) and remove open-question framing elsewhere.
- `registry_line 248` (repaired; source line 886; `sfk-6bbb00970054c395801c3aab`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L392-397, W-033/W-036: Source Control > Graph, AI commit batching, Conflict assistant have command IDs but no enabled/disabled logic, payload schema, or failure states.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
