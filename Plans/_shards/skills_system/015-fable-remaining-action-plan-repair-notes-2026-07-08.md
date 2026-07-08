# Shard 015: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/Skills_System.md`

Source lines: L2557-L2564

Source SHA256: `9f230f28908e466df2b8d4f3f42cb26788139f5740c8f6a183c7065e1389124f`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 232` (repaired; source line 832; `sfk-d75fd32061dc8e608952bd68`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L696-719 vs L583-648: 7.10 (backend) is a thin ContractRef-only stub pointing to the nonexistent Skills_System.md, while 7.8 (GUI) still has the full detailed model (discovery paths, name regex, permission integration) inline doc contradicts itself on where the model
- `registry_line 233` (repaired; source line 833; `sfk-83bf8b6fcb84de178c4cc3a6`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L629-631 vs L696-719: two different placement authorities stated for the same Skills tab/section location (this doc vs. Skills_System.md/FinalGUISpec via a compatibility note).

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
