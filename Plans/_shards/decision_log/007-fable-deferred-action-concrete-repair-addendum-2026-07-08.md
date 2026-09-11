# Shard 007: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Decision_Log.md`

Source lines: L2741-L2748

Source SHA256: `69f6778ea974bf0fa51216b40973674b21744688b02588de46bde85bec3b2ba9`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime decision-log rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6f04565ca3fcaa8bf3a4f6d`: `DecisionRecord` fields are `decision_id`, `title`, `status`, `owner_doc_ref`, `decided_at_utc`, `supersedes[]`, `rationale_ref`, `affected_policy_axes[]`, and `gui_surface_ref?`. GUI visibility is through Settings > Governance > Decisions when surfaced by FinalGUISpec.
- Repairs `sfk-1608f2e00293837927ad2df5`: "timestamped and final" applies to the historical decision entry, not to generated PlanUnit splits. Split-recommended PlanUnits may create derived records without mutating the original decision text.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
