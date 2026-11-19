# Shard 007: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Decision_Log.md`

Source lines: L23689-L23696

Source SHA256: `bb0c9fb557e7aafae1c8a1f70b89ee46878ae25198e5cae15c68130c11db59dd`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime decision-log rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f6f04565ca3fcaa8bf3a4f6d`: `DecisionRecord` fields are `decision_id`, `title`, `status`, `owner_doc_ref`, `decided_at_utc`, `supersedes[]`, `rationale_ref`, `affected_policy_axes[]`, and `gui_surface_ref?`. GUI visibility is through Settings > Governance > Decisions when surfaced by FinalGUISpec.
- Repairs `sfk-1608f2e00293837927ad2df5`: "timestamped and final" applies to the historical decision entry, not to generated PlanUnit splits. Split-recommended PlanUnits may create derived records without mutating the original decision text.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
