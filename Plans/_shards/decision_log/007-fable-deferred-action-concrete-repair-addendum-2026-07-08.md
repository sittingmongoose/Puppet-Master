# Shard 007: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Decision_Log.md`

Source lines: L6128-L6135

Source SHA256: `0bfa28bd6ea890fb4eb590420ecabf7d2e8b54fce181fa055c95efb0eeb31fd6`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime decision-log rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6f04565ca3fcaa8bf3a4f6d`: `DecisionRecord` fields are `decision_id`, `title`, `status`, `owner_doc_ref`, `decided_at_utc`, `supersedes[]`, `rationale_ref`, `affected_policy_axes[]`, and `gui_surface_ref?`. GUI visibility is through Settings > Governance > Decisions when surfaced by FinalGUISpec.
- Repairs `sfk-1608f2e00293837927ad2df5`: "timestamped and final" applies to the historical decision entry, not to generated PlanUnit splits. Split-recommended PlanUnits may create derived records without mutating the original decision text.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
