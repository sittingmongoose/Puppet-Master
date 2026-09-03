# Shard 037: Additive Correction v4 — Branch-Current Command Census And Dispositions (2026-09-03)

Source: `Plans/Commands_System.md`

Source lines: L6069-L6169

Source SHA256: `f083fc0c7e53c324e4b735dc7df7db49667b8f504ac8c22329fa3aa4f6274487`

---

## Additive Correction v4 — Branch-Current Command Census And Dispositions (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`CDRY-001..013`) to this owner.
The correction is additive to the implemented v2 branch and mints **no new user command**.

### CDRY-001 — The census that preceded these dispositions

The correction packet's proposed IDs were treated as proposals, not as implementation truth. A
census of the branch-current registers (`Plans/UI_Command_Catalog.md`, this document, and
`Plans/Wiring_Matrix.production.json`) was run first, on 2026-09-03, and every command the
correction touches already existed:

| Command | Census result | Disposition |
|---|---|---|
| `cmd.chat.plan.build` | present, one handler `handlers::assistant_plan::plan_build` | revise: add `execution_topology: agent \| goal_driven` |
| `cmd.chat.plan.build_with_crew` | present, one handler `handlers::assistant_plan::plan_build_with_crew` | retain atomic contract; add currentness and participant semantics |
| `cmd.chat.plan.schedule_build` | present, one handler `handlers::scheduling::plan_schedule_build` | revise: `execution_topology`, frozen Crew definition, first-dispatch admission |
| `cmd.chat.plan.export` | present, one handler `handlers::assistant_plan::plan_export` | revise: add `content_kind: plan_document \| execution_report` |
| `cmd.chat.plan.view.set` | present, classified `shell_view` | keep as view state; emits no Plan event |
| `cmd.chat.plan.open_details` | present, classified `navigation_wrapper` | keep; owns no details data |
| `cmd.chat.goal.pause/resume/cancel/update` | present, `handlers::goal_runtime::*` | revise for a bound `PlanRun` |
| `cmd.collaboration.configure` | present | preview only; no run, provider, Usage, event, card, install, or settings effect |
| `cmd.collaboration.start` | present | idempotent admission; freeze targets at Start |
| `cmd.collaboration.reconfigure` | present | extend for retry, replacement, waiver, coordinator/moderator replacement |
| `cmd.chat.crew_auto.set` | present | commit the checkmark only after a Settings transaction |
| `cmd.chat.schedule_message[.update\|.cancel]` | all three present | revise for projection, currentness, and preserved history |
| `cmd.chat.attachment.add` | present, one handler `handlers::chat_attachments::attachment_add` | revise: `semantic_kind: file \| folder` |
| `cmd.chat.add_file_reference` | present, signature-locked | file-only compatibility alias; rejects a folder |
| `cmd.browser.component.send_now / .add_to_composer / .insert_at_cursor / .pick` | all four present | revise for revalidation; `pick` is the recapture flow |
| `cmd.chat.todos.toggle_parent` | present, classified `shell_view` | local or shared view state only |

Absent, and deliberately **not** created: `cmd.chat.plan.build_as_goal`,
`cmd.chat.plan.export_report`, `cmd.chat.plan.progress.set`, `cmd.chat.add_folder_reference`,
`cmd.browser.component.recapture`, and any per-number question-limit command. A census of the
branch found no independent folder effect and no second progress authority; nothing in this
correction justifies minting one.

### CDRY-002..005 — The four reuse rules

Plan progress is a derived projection. No user command and no model tool sets it; the internal
projector action is `internal.plan_progress.recompute`.

The seven question values (six bases plus the Grill Me extension) are ordinary project Settings
written through the generic Settings transaction. No per-number command handler is created.

`Build as Goal` is `cmd.chat.plan.build` with `execution_topology: goal_driven`. `Build With
Crew` keeps its specialised atomic command so that `PlanRun` and `CrewRun` commit together;
decomposing it into `cmd.collaboration.start` followed by `cmd.chat.plan.build` would create a
race and is prohibited.

Plan export reuses `cmd.chat.plan.export` with `content_kind` alongside the existing format
discriminator, so one export owner produces two distinct artifacts.

### CDRY-006 — What stays view state

Modal open and close, the Plan Rich/Markdown toggle, card expand and collapse, hover, local tabs,
and To-Do parent expansion use local or shared view-state primitives and emit no domain event. A
persisted preference uses the shared UI state owner. No domain command is registered for a visual
action, and `local.workflow_modal.close`, `local.plan_card.expand`, and `local.plan_view.toggle`
are local view actions rather than catalog rows.

### CDRY-007..009 — Family reuse

Collaboration start, reconfigure, pause, resume, cancel, message, and export reuse the shared
`cmd.collaboration.*` family. A kind-specific command exists only where the semantics genuinely
differ; thin aliases normalise to one handler and one effect, and four duplicate runtimes are
never built.

Scheduled-message projection reuses the existing create, update, and cancel commands. Card
actions map onto those commands. Dispatch is `internal.scheduler.dispatch_scheduled_message`, an
internal scheduler action with its own idempotency domain — not a second user command, and not a
state-set command.

Folder add reuses `cmd.chat.attachment.add`. Browser stale currentness returns a typed result or
error through the existing component send and pick commands rather than forking attachment or
browser ownership.

### CDRY-010..011 — Contract obligations for every changed command

Each new or changed mutating command carries a typed request, result, and error enumeration, an
availability predicate, expected revision and currentness, a permission snapshot, an idempotency
key, exactly one handler, and a declared effect disposition. Unknown state and unknown errors
fail closed; success is never inferred from a dismissed modal or an accepted dispatch.

Every durable effect has either a centrally admitted `EventRecord` payload authority or an
explicit receipt-only / no-event disposition recorded before implementation-ready status. A
proposed event list is not a registration, and no owner document emits an unregistered event
name.

### CDRY-012..013 — Wiring and the Settings boundary

Production wiring covers the full path for every correction surface: GUI or internal producer →
command or intent → sole handler → owner record, event, or receipt → projector → every GUI
consumer, including the failure and recovery paths. Reverse coverage is required so an orphan
control or an invisible effect is detectable; validating command-to-handler rows alone is
insufficient.

Settings remains the owner of the shell, the inventory, project-scoped values, transactions,
defaults, and manager routing. Domain runtimes own their own records and operations. A manager
action routes to its owner, and participant, run, and schedule truth is never stored as a
settings value.
