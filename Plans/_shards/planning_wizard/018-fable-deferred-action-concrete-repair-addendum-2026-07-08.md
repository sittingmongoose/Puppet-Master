# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Planning_Wizard.md`

Source lines: L1633-L1642

Source SHA256: `de4da73fc489b3041304f58d5cf5d6563aa152b5ba4bd3256b81f4c1bc43351e`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime Planning Wizard rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-78f02d9a707edd394637f596`: `PlanningRun` fields are `planning_run_id`, `project_id`, `topic_map_ref`, `context_capsule_ref`, `ledger_ref`, `state`, `created_at_utc`, and `updated_at_utc`. `PlanningContextCapsule` fields are `capsule_id`, `source_refs[]`, `constraints[]`, `open_questions[]`, `accepted_defaults[]`, and `redaction_profile_id`.
- Repairs `sfk-9fb886bd6cf16ee54c7e1f0e`: topic card states are `new`, `active`, `needs_user`, `answered`, `accepted`, `deferred`, `blocked`, `superseded`, `compiled`, `sealed`, and `retired`. Commands are `cmd.planning.topic.open`, `cmd.planning.topic.answer`, `cmd.planning.topic.accept`, `cmd.planning.topic.defer`, and `cmd.planning.topic.supersede`.
- Repairs `sfk-4dcdcb5c0b63f442e90451bb`: PWIZ-010 consumes the CAS/idempotency mechanism owned by PWIZ-014; duplicate CAS prose in PWIZ-010 is source-lineage only.
- Repairs `sfk-dfcc395f84654bcabdfbe6aa`: `Plans/Bootstrap_Planning_Migration.md` is legacy migration workflow lineage. Current Planning Wizard + ledger addenda own the live PM ledger conversational flow.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
