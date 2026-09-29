# Shard 086: Project automation pause custody — 2026-09-29

Source: `Plans/storage-plan.md`

Source lines: L27238-L27309

Source SHA256: `354348a85edc4cc54de98e1b424104cc92418378295ab3f9c786655cc7fdddf2`

---

## Project automation pause custody — 2026-09-29

The Scheduling owner defines `pm.runtime.project_automation_pause.v1` in SQR-018. Storage assigns its one
project-scoped physical family `project_automation_pause`, with exact key
`project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}` and a closed
`pm.storage_value.project_automation_pause.v1` wrapper. Each hex component is lowercase hex of the complete
original UTF-8 identity, without normalization. The wrapper binds its key, storage instance and project to the
inner `project_id`, `paused`, `user_stop_epoch`, actor, changed time and revision. It is original manual-stop
authority, never a Settings value or an inferred cache. The existing `RP-AUTHORITY-INDEFINITE@1.0.0` class
applies as it does to an exact scheduling instruction; no new retention policy, time limit or count is chosen.

The genuine project-creation path creates the off record under a proven never-born key with the project's
initial stop epoch. A missing record for a project that might already have existed is unavailable, never
silently read as off. Only the Scheduling owner, after authenticating the current whole value and the user's
authority, can compare and swap an actual value change. A new `paused=true` advances the project's
`user_stop_epoch` once in the same durable transaction; a repeated set returns the existing value without a
second advance. `paused=false` clears only this project latch and never clears a per-run stop. A non-user request
is refused. The scheduler reads the current whole project record and epoch at decision and immediately before
automatic dispatch; an unavailable read blocks that dispatch rather than treating it as permission. Native
backup/restore preserves the current latch and epoch under the exact storage instance and project, and cannot
replace a newer true pause with an older off value. The static family row and closed wrapper are companion
contracts; they do not install a native writer or prove restart behavior.

`runtime.automation_pause_changed` remains an unregistered EventRecord candidate under DL-093. Until a
family-specific Event Authority decision and admission close, Storage appends no such event, and the owner result
records `missing_event_registration` without treating its durable record or receipt as an event (DL-138).

### SP-323 - Project automation pause original custody

```yaml
plan_unit_id: SP-323
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage binds SQR-018's pm.runtime.project_automation_pause.v1 to the project_automation_pause family,
  exact key project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}, and closed
  pm.storage_value.project_automation_pause.v1 wrapper (DL-138). It is original project manual-stop
  authority under existing RP-AUTHORITY-INDEFINITE@1.0.0, not Settings. Genuine project birth creates
  the off record under proven never-born custody; missing later custody is unavailable. Only an authorized
  user change uses whole-value compare-and-swap; setting paused true advances user_stop_epoch exactly once,
  an idempotent reset does not advance it, and setting false never clears per-run stops. The scheduler checks
  current project state and epoch before automatic dispatch; missing state blocks dispatch. Backup and restore
  preserve the newer latch and epoch. The static schema/registry row proves no native writer. The candidate
  runtime.automation_pause_changed emits no EventRecord and reports missing_event_registration until its own
  Event Authority admission under DL-093.
gui_related: false
gui_classification_reason: Defines original project stop storage and admission authority, not presentation.
depends_on: [SQR-018]
unblocks: []
acceptance_criteria:
  - The physical key binds complete original storage instance and project identities with lowercase UTF-8 hex and one current record per project.
  - The wrapper binds the exact key and scope to the complete logical pause record under the existing RP-AUTHORITY-INDEFINITE policy.
  - Fresh project birth is proved; missing later custody cannot be treated as an off switch.
  - A user set to paused true advances user_stop_epoch once with the durable value; idempotent set and false clear do not advance it.
  - A stale compare-and-swap, non-user actor, incomplete backup or older restore cannot clear a newer project pause.
  - Before family-specific admission, zero runtime.automation_pause_changed EventRecords append and missing_event_registration is reported.
validation_surfaces: [Plans/storage_value_registry.json, Plans/storage_value_registry.schema.json, Plans/scheduling_and_quota_resume_contracts.schema.json, Plans/scheduling_and_quota_resume_contract_fixtures.json, python3 scripts/pm-plan-index.py validate]
risk_class: project_manual_stop_lost_or_bypassed
reasoning_tier: high
context_scope: project_automation_pause_original_custody
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/Scheduling_and_Quota_Resume.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage:
  - Plans/Scheduling_and_Quota_Resume.md#SQR-018
  - "Plans/Decision_Log.md DL-138; /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c question 9"
  - Plans/storage-plan.md#SP-306
preserved_exact_tokens: [pm.runtime.project_automation_pause.v1, "project_automation_pause.v1:{hex(storage_instance_id)}:{hex(project_id)}", pm.storage_value.project_automation_pause.v1, RP-AUTHORITY-INDEFINITE, user_stop_epoch, runtime.automation_pause_changed, missing_event_registration]
negative_constraints:
  - No Settings value, invented automatic clear, missing-as-off default, alternate physical key, or new retention policy.
  - No EventRecord admission, native writer, runtime/restart proof, readiness clearance or governance seal.
```
