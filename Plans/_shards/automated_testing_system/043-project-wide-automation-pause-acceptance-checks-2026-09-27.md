# Shard 043: Project-wide automation pause acceptance checks — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5619-L5701

Source SHA256: `7487921e2cd43463ff3f02057e9a27a73d2c26795811ac23c90cca3d56687a18`

---

## Project-wide automation pause acceptance checks — 2026-09-27

### ATS-064 - Pause All Automations Acceptance Checks

The project-wide "Pause all automations" switch of `Plans/Scheduling_and_Quota_Resume.md` SQR-018 (DL-136) is a
user manual stop at project scope, so its checks are precedence checks and run against server-owned state, never
against a client timer or a page-local flag.

```yaml
plan_unit_id: ATS-064
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The required scheduling suite must prove the project-wide Pause all automations switch of SQR-018 (DL-136) against
  server-owned records. With the switch on, no scheduled message, scheduled build, window resume or quota resume in
  the project dispatches, each refusal records the failed clause project_automation_paused, and a scheduled message
  whose send time arrives is held with that clause. A dispatch decided before cmd.runtime.automation_pause.set
  turned the switch on and delivered after it is discarded because the project's user_stop_epoch advanced. A quota
  reset, a window opening, a schedule time, a Goal, Plan or Crew automatic continuation, a restart and a newly
  created schedule each leave the switch on. A request with paused false from an actor that is not the user is
  refused with permission_denied, and a request that sets the value the switch already has leaves the epoch
  unchanged and emits no runtime.automation_pause_changed. A scheduled build running when the switch is turned on
  pauses at a safe point, never mid-atomic-operation, and a dispatch already started completes. Turning the switch
  on cancels no schedule, invalidates no schedule, disables no quota consent and changes no per-run latch. Work the
  user starts directly acts while the switch is on and leaves it on: a Send now dispatches that one held message
  without the project_automation_paused clause, and a Build the user starts is admitted. Turning the switch off
  releases no per-run manual Pause, Stop or Cancel, fires no backlog burst, and each occurrence that came due
  while it was on follows its recorded missed policy: a message it held stays held naming its missed time under
  hold, dispatches once under next_available or within the grace of cancel_after_grace, and expires past that
  grace. Every item the switch holds shows the reason Pause all automations is on in painted output, a build it
  holds has a Plan card schedule line that begins with Paused, no item keeps that reason once the switch is off,
  and no Settings value stores the switch. These are acceptance obligations only; every command row stays
  handler_unavailable in the catalog, and its controls render disabled with command_not_registered, until its
  catalog, event and wiring rows close.
  DL-138 adds explicit durability and admission assertions: restart reads the saved project pause record and its user_stop_epoch unchanged; repeated absolute-value requests neither advance the epoch nor emit again; a non-user clear returns permission_denied; and while runtime.automation_pause_changed lacks its separate Event Authority admission, an attempted event publication reports missing_event_registration and appends zero EventRecord objects. Turning the switch off re-evaluates each held occurrence under its recorded missed policy at most once, without replaying completed work. The static companion pair may validate these request/result shapes, but these runtime assertions remain NOT_RUN until a runtime executes them.
gui_related: true
gui_classification_reason: The held reason and the switch's own line are visible outcomes the checks read from painted output.
split_recommended: false
depends_on: [SQR-001, SQR-006, SQR-018]
unblocks: []
acceptance_criteria:
  - "Each listed behaviour has at least one automated check against server-owned records or painted output."
  - "No check passes on a client timer, a page-local flag or a dispatch count."
  - "A check proves that turning the switch on leaves every schedule, quota consent and per-run latch unchanged."
  - "A check proves that a user's Send now and Build act while the switch is on and leave it on."
  - "Restart preserves the stored pause and epoch; repeated sets are idempotent and non-user clears are refused."
  - "An unregistered automation-pause event appends zero EventRecord objects and reports missing_event_registration."
  - "Runtime assertions remain NOT_RUN; schema validation is static companion evidence only."
validation_surfaces:
  - node tests/scheduling-verify.mjs
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: automatic_resume_overrides_user_stop
reasoning_tier: high
context_scope: scheduling_precedence_tests
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: test_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138"
  - "Plans/Scheduling_and_Quota_Resume.md#SQR-018"
  - "Plans/Decision_Log.md#DL-136"
preserved_exact_tokens:
  - "DL-138"
  - "missing_event_registration"
  - "NOT_RUN"
  - "project_automation_paused"
  - "cmd.runtime.automation_pause.set"
  - "runtime.automation_pause_changed"
  - "Pause all automations is on"
negative_constraints:
  - "Do not assert a client timer or a page-local pause flag in place of the server-owned record."
  - "Do not treat fixture validation as proof that the pause holds real dispatches."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-018
