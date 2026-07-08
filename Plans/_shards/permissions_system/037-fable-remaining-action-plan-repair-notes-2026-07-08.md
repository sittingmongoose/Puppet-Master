# Shard 037: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Permissions_System.md`

Source lines: L8933-L8950

Source SHA256: `8e9a3f5f46b668dfa38b83eb26a79b5431dc72b5882f9b330136f337f275d438`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 173` (repaired; source line 688; `sfk-344077d4e91d4dba8a844f8b`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [HIGH] L1016,396: "`always` response (6.2)" 6.2 does not exist; derivation actually lives in 3.4 FIX: correct all references.
- `registry_line 174` (repaired; source line 689; `sfk-95212a02bf1d39bbc2883d92`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [HIGH] L1028: "6.4A" does not exist anywhere in the doc; `create_project_rule`/`create_global_rule` only described in unlabeled prose.
- `registry_line 175` (repaired; source line 690; `sfk-c2365f0841b6e3af70ad6310`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [HIGH] L1034: "2.4B" does not exist; scope specificity lives in unlabeled prose inside 2.4.
- `registry_line 177` (repaired; source line 692; `sfk-7f8163685646ce05ce4fe9c4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L728: durable rule record has no `rule_id` field, yet rules must be revocable and `tool_pattern` alone can collide FIX: add a stable UUID field.
- `registry_line 178` (repaired; source line 693; `sfk-fdf444265abf92192b7160bd`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L713-779: TOML persistence layer has no corruption/parse-failure recovery, no concurrent-write conflict handling, no atomic-write/rename strategy.
- `registry_line 179` (repaired; source line 694; `sfk-57ac0d8ad5d91758f6c339a1`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4634-4950 (PS-063/065/068): Permissions tab route, rule-editor add/reorder/delete, and directory-picker all lack exact command/IPC names and validation-error UI states.
- `registry_line 180` (repaired; source line 695; `sfk-37acd88b10f91659e418b02a`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L8606-8704 (new, dated 2026-07-03): AutonomyCeilingReceipt and ProviderEgressPolicy introduced with zero field schema, storage location, or enforcement-point algorithm.
- `registry_line 182` (repaired; source line 697; `sfk-06d806e2c31d2df1b9e763f3`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L7708-7709: `network_access_policy`/`secret_access_policy`/`destructive_command_policy` field names referenced by 3+ units with no single canonical enum/defaults table.
- `registry_line 183` (repaired; source line 698; `sfk-613f7652b32c4e3abfe4f6e2`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1136: runtime-addendum domain-sensitive permission classes (docker exec, kubectl exec, git force-push) don't appear anywhere in the 5 tool-key table a parallel undocumented taxonomy.
- `registry_line 184` (repaired; source line 699; `sfk-ea6603b7ef92e31beeee32b4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1150-1199: permission_snapshot schema exists but reason-code enums (stop_reason_code, blocked_reason_code, budget_kind) lack full value sets/transitions.
- `registry_line 185` (repaired; source line 700; `sfk-6f3fd08bf73eb3f910729299`): Owner-doc note repairs duplicate or ambiguous section authority by requiring title/PlanUnit anchors and retiring numeric-only references. Source summary: - [HIGH] L4899-4950 (PS-068): external-directory picker has no dispatch name, no duplicate-path or invalid-glob error state.
- `registry_line 191` (repaired; source line 720; `sfk-c5e20efd85f389d003c5cf07`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L7423 (N2-132): "deny-code families" for a shared trust/proxy/governance preflight are named but never enumerated, with no link to the exact Permissions_System.md mechanism.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
