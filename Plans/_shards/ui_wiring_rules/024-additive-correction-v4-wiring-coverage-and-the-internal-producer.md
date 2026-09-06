# Shard 024: Additive Correction v4: wiring coverage and the internal-producer register (2026-09-03)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1292-L1409

Source SHA256: `b0c77ecbeb53ef195661544a2bf03d3adc352ca3524d3ccee5e53c5d101ce5d8`

---

## Additive Correction v4: wiring coverage and the internal-producer register (2026-09-03)

`PM_Assistant_v2_Additive_Correction_v4` supplies 51 wiring rows (`CW-001..CW-051`). They split
along the rule already established in the section above: **a production wiring row names one
registered command.** The schema enforces `ui_command_id` against `^cmd\.…`, and inventing a
command identity to satisfy that pattern would make this register assert a registration that
does not exist.

### Command-bearing rows — revised in place

Twenty-seven existing production entries carry the correction. None is new: the branch-current
census found every command the correction touches already registered, so the correction adds
acceptance checks and correction-specific test rows rather than rows.

| Packet rows | Production entry |
|---|---|
| CW-004, CW-009 | `assistant.redesign.w_016.chat_plan_build` |
| CW-022 | `assistant.redesign.w_017.chat_plan_build_with_crew` |
| CW-008, CW-010 | `assistant.redesign.w_018.chat_plan_schedule_build` |
| CW-011 | `assistant.redesign.w_020.chat_plan_export` |
| CW-012 | `assistant.redesign.cmd.chat_plan_open_details` |
| CW-013, CW-048 | `assistant.redesign.cmd.chat_plan_view_set` |
| CW-005 / CW-006 / CW-007 / CW-047 | `…w_007.chat_goal_pause` / `…w_008.chat_goal_resume` / `…w_009.chat_goal_cancel` / `…w_010.chat_goal_update` |
| CW-014, CW-015 | `assistant.redesign.cmd.collaboration_configure` |
| CW-016, CW-019 | the four `…collaboration_start` entries (w_023, w_025, w_030, w_034) |
| CW-024 | `assistant.redesign.cmd.collaboration_reconfigure` |
| CW-018 | `assistant.redesign.w_024.chat_crew_auto_set` |
| CW-029 / CW-030 / CW-031 | the three `chat_schedule_message*` entries |
| CW-033 | `assistant.redesign.w_002.chat_attachment_add` |
| CW-034 | `catalog.chat_add_file_reference` |
| CW-035 / CW-036+CW-049 / CW-050 / CW-037 | the four `browser_component_*` entries |
| CW-051 | `assistant.redesign.cmd.chat_todos_toggle_parent` |

Each revised entry gained the correction's acceptance checks and correction test rows under the
`wiring.correction_v4.*` prefix, covering the negative, race, restart, stale-target, and
provider-degradation paths the correction requires. Their `evidence_required` text now names the
`CW-` rows that produced them and repeats that a production-intent row proves no runtime fact.

### Internal-producer rows — owner-documented, not matrix rows

The remaining twenty-four `CW-` rows have **no command identity**. They are owner-internal
producers, projectors, and reducers. They stay out of this register for the same reason the
sixteen view-local rows did, and their behaviour is specified — with the same
producer → handler → durable effect → consumer → failure shape — in their owner documents:

| Packet rows | Internal producer | Owner |
|---|---|---|
| CW-001 | question admission and budget projection | `Plans/Assistant_Plan_Runtime.md` (QMAX-005..016) |
| CW-002, CW-045 | Settings transaction and question-limit migration | `Plans/Settings_System.md`, `Plans/storage-plan.md` (MIG-001..003) |
| CW-003 | `AssistantPlanProgressProjector` recompute | `Plans/Assistant_Plan_Runtime.md` (PPROG-002, CDRY-002) |
| CW-010 | scheduler plan dispatch | `Plans/Scheduling_and_Quota_Resume.md` (PSCHED-004, PSCHED-013) |
| CW-017 | modal close / draft discard | `Plans/Collaborative_Workflows.md` (MODAL-004) |
| CW-020, CW-021 | ComposerBuffer BrainStorm config and held request | `Plans/Collaborative_Workflows.md` (MODAL-011..012) |
| CW-023 | participant failure and timeout dispositions | `Plans/Collaborative_Workflows.md` (PART-001..006) |
| CW-025, CW-026, CW-027, CW-028 | Review, BrainStorm, Crew and Chat Room reducers | `Plans/Collaborative_Workflows.md` (PART-007..019) |
| CW-032 | `internal.scheduler.dispatch_scheduled_message` | `Plans/Scheduling_and_Quota_Resume.md` (SMSG-006, SMSG-010..011) |
| CW-038, CW-039, CW-040 | To-Do graph mutation, list replacement, late-event gate | `Plans/ToDo_Runtime.md` (TDG-001..012) |
| CW-041, CW-042 | embed render and artifact retention | `Plans/Runtime_Artifacts_Panel.md` (PDET-008..012, PDET-006) |
| CW-043, CW-044 | Goal completion predicate and replay | `Plans/Goal_Runtime_System.md` (GREPLAY-003..010) |
| CW-046 | concept two-build byte check | `Concepts/chat-assistant-concepts/5.6 Pro/build.py` (CONCEPT-017) |

### CDRY-012 — What a complete row covers

Production wiring covers the whole path for every correction surface: GUI or internal
producer → command or intent → sole handler → owner record, event or receipt →
projector → every GUI consumer, including the failure and recovery paths. Reverse
coverage is mandatory, because it is the only thing that detects an orphan control or
an invisible effect; validating command-to-handler rows alone is not sufficient
coverage and never closes this requirement.

### Reverse coverage for the correction

Reverse coverage is what detects an orphan control or an invisible effect, so the correction's
new projections each name their consumers explicitly in the owner document and in the revised
`acceptance_checks`:

- `PlanProgressProjection` → Rich status markers, the Markdown gutter, the Plan card summary, and
  Plan Details. Every consumer reads the same projection; none keeps a private copy, and a stale
  projection is disclosed rather than rendered as current.
- `PlanExecutionAttentionProjection` → the Build control's secondary line and its allowed
  actions.
- `PlanningQuestionBudgetProjection` → the questionnaire host, Plan and Deep Plan Details, and
  the BrainStorm modal.
- `ScheduledMessageProjection` → the thread schedule card and its Details.
- `ParticipantDisposition` and `CollaborationCompletionProjection` → the workflow card,
  participant rows, the full panel, Activity, and Usage.
- `ToDoListReplacementDisposition` → the To-Dos Activity list and, through the projector, Plan
  progress.

### Accessibility

`CONCEPT-020` puts accessibility outside this correction. The `accessibility_contract` block
remains a schema requirement on every entry and is untouched; no correction failure is raised for
accessibility, and no pre-existing accessibility behaviour is removed.

### Additive Correction v4: five tokens that must stay unregistered (2026-09-03)

`validate_wiring_matrix` scrapes `cmd.*` tokens out of `Plans/UI_Command_Catalog.md`
and requires a production row for each. The correction's catalog section ends with an
explicit list of command ids it **forbids creating** — and the scraper read that list
as five new registrations.

Giving them rows would have made this register assert exactly the identities the
correction exists to prevent. They are recorded in
`Plans/Wiring_Matrix.production.exclusions.json` instead, each with its reason:

| Token | Why it must not exist |
|---|---|
| `cmd.chat.plan.build_as_goal` | Build as Goal is `cmd.chat.plan.build` with `execution_topology: goal_driven` (PGOAL-002, CDRY-004). |
| `cmd.chat.plan.export_report` | The execution report is `cmd.chat.plan.export` with `content_kind: execution_report` (CDRY-005). |
| `cmd.chat.plan.progress.set` | Progress is a derived projection; `internal.plan_progress.recompute` is an owner action, not a command (PPROG-018, CDRY-002). |
| `cmd.chat.add_folder_reference` | A folder is added through `cmd.chat.attachment.add` with `semantic_kind: folder` (FOLDER-003). |
| `cmd.browser.component.recapture` | Recapture reuses `cmd.browser.component.pick` so one flow owns identity creation (BSTALE-004). |

This is a fifth exclusion class beside the four the file already recorded: **a token
that appears in the catalog only inside an explicit "deliberately NOT registered"
list.** A future correction that names forbidden ids in prose should add them here at
the same time.
