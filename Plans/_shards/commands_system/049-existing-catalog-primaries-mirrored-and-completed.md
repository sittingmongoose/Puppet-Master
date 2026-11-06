# Shard 049: Existing catalog primaries mirrored and completed

Source: `Plans/Commands_System.md`

Source lines: L10717-L10724

Source SHA256: `410f49c932dc21c373921dfe81ea7ba8b6f7f890ce2634defde24786e297f8c6`

---

## Existing catalog primaries mirrored and completed

These are already registered UCC identities, not additional new primary IDs. Refresh keeps its existing matrix row; automation pause fills one missing production/Touch row.

| Command | Owner | Sole handler | Request | Result | Effect |
|---|---|---|---|---|---|
| `cmd.project.refresh` | Plans/Project_System.md#PJCT-012 | handlers::project::refresh | Plans/project_system_contracts.schema.json#/$defs/project_action_request_v2 | Plans/project_system_contracts.schema.json#/$defs/project_action_result_v2 | Registry/list read with nullable selected Project; no registration or persistence and no fabricated empty success. |
| `cmd.runtime.automation_pause.set` | Plans/Scheduling_and_Quota_Resume.md#SQR-020 | handlers::scheduling::automation_pause_set | Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/AutomationPauseSetRequestScopeV2 | Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/AutomationPauseSetResultScopeV2 | Canonical exact app Server or Project operational record/receipt; app unavailable result has null pause/projection and zero effect. No new EventRecord; runtime.automation_pause_changed remains non-emitting until admitted. |
