# Shard 057: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/assistant-chat-design.md`

Source lines: L23515-L23523

Source SHA256: `fd771a48f2504c579c3da677bf83d903eea99f103dbb478d0f107d7c25c88e49`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 95` (repaired; source line 480; `sfk-1809229e72ce853d4db0d8d8`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L5120-5161 (ACD-037): PT budget matrix gives numeric ceilings (Light=2, Balanced=4, Comprehensive=6) without stating with certainty what dimension is being counted (questions? research calls? both?) FIX: state explicitly which budget the numbers govern.
- `registry_line 97` (repaired; source line 482; `sfk-de883c170f06a868b598c547`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4860-4900, L7121-7166 (ACD-031, ACD-081): subagent-question "unavailable" status and debug-investigation "explicitly promoted" residue both lack any defined UI surface or command name for the user-facing side of the decision FIX: define the notification path and the p
- `registry_line 99` (repaired; source line 484; `sfk-ab0dd1ec7c643f8e3ae96066`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L8006-8252 (ACD-100,103,104): Investigation Context actions (Open target/Export bundle/Revoke item), "Open in Terminal," and the full operation-card transition table all lack command/IPC IDs or an owner cross-reference FIX: add exact command_id per action and the trans

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
