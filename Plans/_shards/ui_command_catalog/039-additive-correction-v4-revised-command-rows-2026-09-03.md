# Shard 039: Additive Correction v4 — Revised Command Rows (2026-09-03)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12673-L12701

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## Additive Correction v4 — Revised Command Rows (2026-09-03)

`PM_Assistant_v2_Additive_Correction_v4` revises the rows listed below in place, above. No new
user command is registered by this correction; the census that established this is recorded in
`Plans/Commands_System.md`.

| Row | What changed |
|---|---|
| `cmd.chat.plan.build` | `execution_topology: agent \| goal_driven`; `goal_driven` is Build as Goal |
| `cmd.chat.plan.export` | `content_kind: plan_document \| execution_report` beside the format discriminator |
| `cmd.chat.plan.schedule_build` | `execution_topology: agent \| goal_driven \| crew`; frozen Crew definition; nothing runs before first dispatch |
| `cmd.chat.attachment.add` | `semantic_kind: file \| folder` with a bounded folder manifest |
| `cmd.chat.add_file_reference` | file-only compatibility alias; rejects a folder; global folder-exclusion statement retired |
| `cmd.collaboration.configure` | preview only, zero side effects |
| `cmd.collaboration.start` | freeze roster and Review target at Start; idempotent; no card on failure |
| `cmd.collaboration.reconfigure` | owns retry, replacement, waiver, coordinator/moderator replacement |
| `cmd.chat.crew_auto.set` | checkmark commits only after a Settings transaction |
| `cmd.browser.component.send_now` | dispatch-time revalidation; typed `stale_capture`; isolated payload |
| `cmd.chat.todos.toggle_parent` | local or shared view state, never a domain event |

Deliberately not registered: `cmd.chat.plan.build_as_goal`, `cmd.chat.plan.export_report`,
`cmd.chat.plan.progress.set`, `cmd.chat.add_folder_reference`,
`cmd.browser.component.recapture`, and any per-number question-limit command.

Two internal owner actions carry their own idempotency domains and are **not** user commands:
`internal.plan_progress.recompute` and `internal.scheduler.dispatch_scheduled_message`.

Retired planning-depth values: `Light`, `Balanced`, and `Comprehensive` carry no question budget;
the BrainStorm base of 15 and the Grill Me extension of `+10` are replaced by 20 and `+25`.
