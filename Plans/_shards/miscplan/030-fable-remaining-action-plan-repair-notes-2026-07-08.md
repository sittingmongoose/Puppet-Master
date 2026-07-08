# Shard 030: FABLE Remaining Action Plan Repair Notes (2026-07-08)

Source: `Plans/MiscPlan.md`

Source lines: L6385-L6396

Source SHA256: `e000b23c3e58fd317135ea6ee6b09b748cdffcb3ead602e933ae42367e00047e`

---

## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 232` (repaired; source line 832; `sfk-d75fd32061dc8e608952bd68`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L696-719 vs L583-648: 7.10 (backend) is a thin ContractRef-only stub pointing to the nonexistent Skills_System.md, while 7.8 (GUI) still has the full detailed model (discovery paths, name regex, permission integration) inline doc contradicts itself on where the model
- `registry_line 233` (repaired; source line 833; `sfk-83bf8b6fcb84de178c4cc3a6`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L629-631 vs L696-719: two different placement authorities stated for the same Skills tab/section location (this doc vs. Skills_System.md/FinalGUISpec via a compatibility note).
- `registry_line 235` (repaired; source line 835; `sfk-d83a6f558caf190c0a68b9c6`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L735 vs L773: Shortcuts export version-mismatch handling is stated as ambiguous ("implementation must decide") in one place and definitively "reject" in another same feature, two confidence levels in the same doc.
- `registry_line 236` (repaired; source line 836; `sfk-cd3164782a4ef1c0059005e0`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L6053,6081 (M-079): debug instrumentation lifecycle subsystem explicitly marked "not treated as grounded MVP behavior until this contract exists," with no contract defined in-range.
- `registry_line 237` (explicitly_deferred; source line 837; `sfk-f2adc94f674eb81b2fc0686f`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L6356-6365,6379 (M-083): platform_specs injection contract lists field names only, zero schema; `list_skills_for_agent` flagged stub with no resolving owner doc.
- `registry_line 238` (repaired; source line 838; `sfk-3a059c95c88e113587672e6b`): Owner-doc note repairs the stale absence/open-reference claim by naming the current owner or by making the stale pointer non-authoritative. Source summary: - [HIGH] L6307-6317 (M-082): doc documents its own "duplicate References/Implementation status sections" and a missing 9.1.20 (confirmed absent via grep) but defers fixing it rather than doing so.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
