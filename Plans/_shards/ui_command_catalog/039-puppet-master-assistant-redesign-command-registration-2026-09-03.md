# Shard 039: Puppet Master Assistant Redesign Command Registration - 2026-09-03

Source: `Plans/UI_Command_Catalog.md`

Source lines: L15452-L15779

Source SHA256: `c4b3d3c6fe4f3dfa169b498f7d98f0cbe5de95057424ad835055a045300aa72d`

---

## Puppet Master Assistant Redesign Command Registration - 2026-09-03

This addendum registers the exact command IDs required by the approved Puppet Master Assistant redesign. Every row below is a canonical owner request with a single named future target handler. None of these rows asserts that a native dispatcher, handler, runtime, receipt, or rendered control exists. Until the central command contract layer, Event Authority, storage registration, and production wiring close for a row, its GUI controls remain disabled with `command_not_registered`, and no page-local handler, alias, or toast may simulate success.

Three of the IDs in this wave already exist in this catalog: `cmd.chat.goal.start`, `cmd.chat.goal.update`, and `cmd.bsd.set`. They are reconciled in place to their revised request and result contracts. They receive no duplicate row, no peer control, and no second handler target. An alias census was run over all live `Plans/**` before registration and found no other collision for the remaining eighty-one IDs.

Mutating `domain_action` rows in this wave apply the catalog-wide projection-freshness gating clause in §2.0B before dispatch, read their owner availability and exact disabled reason from the declared state selectors, provide identical keyboard and pointer behavior, and return to the exact initiating route and focus.

### Simplified Goal Runtime

Goal V2 is one text-only objective plus durable host continuation. `cmd.chat.goal.start` and `cmd.chat.goal.update` are EXISTING registered command IDs whose request/result contracts are revised to the V2 shapes; they are contract revisions, not new registrations, and no second peer row is created for them.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.goal.start` | Start Goal | Creates one text-only Goal objective for the active thread and begins durable host continuation until completion, pause, block, or cancel. | `assistant_chat_available && goal_runtime_available && no_active_goal_on_thread` | `domain_action` | `Plans/Goal_Runtime_System.md` | `Plans/application_workflow_contracts.schema.json#/$defs/GoalStartRequestScopeV2` → `Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2` | `handlers::goal_runtime::goal_start` |
| `cmd.chat.goal.update` | Update Goal | Applies a user-approved objective revision from the Goal Activity Detail editor, or an agent proposal that the user has already approved. | `goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted)` | `domain_action` | `Plans/Goal_Runtime_System.md` | `GoalUpdateRequestV2` → `GoalUpdateResultV2` | `handlers::goal_runtime::goal_update` |
| `cmd.chat.goal.propose_update` | Propose Goal Update | Lets the agent runtime request an objective change; it opens the existing approval dialog and never mutates the Goal by itself. | `goal_present && agent_runtime_active && approval_surface_available` | `domain_action` | `Plans/Goal_Runtime_System.md` | `Plans/application_workflow_contracts.schema.json#/$defs/GoalUpdateProposalRequestScopeV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ApprovalRequestScopeV2` | `handlers::goal_runtime::goal_propose_update` |
| `cmd.chat.goal.pause` | Pause Goal | Pauses host continuation for the Goal without discarding the objective, revision history, or workflow-owned state. | `goal_present && goal_status == active` | `domain_action` | `Plans/Goal_Runtime_System.md` | `Plans/application_workflow_contracts.schema.json#/$defs/GoalControlRequestScopeV2` → `Plans/application_workflow_contracts.schema.json#/$defs/GoalControlResultScopeV2` | `handlers::goal_runtime::goal_pause` |
| `cmd.chat.goal.resume` | Resume Goal | Resumes host continuation after a user pause; it is refused when a manual stop is the reason the Goal is not running. | `goal_present && goal_status == paused && !manual_stop_latched` | `domain_action` | `Plans/Goal_Runtime_System.md` | `Plans/application_workflow_contracts.schema.json#/$defs/GoalControlRequestScopeV2` → `Plans/application_workflow_contracts.schema.json#/$defs/GoalControlResultScopeV2` | `handlers::goal_runtime::goal_resume` |
| `cmd.chat.goal.cancel` | Cancel Goal | Ends the Goal permanently, records the terminal reason, and leaves workflow-owned records under their own owners. | `goal_present && goal_status in {active, paused, blocked}` | `domain_action` | `Plans/Goal_Runtime_System.md` | `Plans/application_workflow_contracts.schema.json#/$defs/GoalCancelRequestScopeV2` → `Plans/application_workflow_contracts.schema.json#/$defs/GoalCancelResultScopeV2` | `handlers::goal_runtime::goal_cancel` |

Source surfaces for this family: `agent_runtime`, `approved_agent_proposal`, `goal_activity`, `goal_activity_editor`, `goal_control`, `goal_hover`, `natural_language`, `slash`, `wand`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Assistant Plan Runtime

These rows serve the six exact Plan strategies, the read-only Plan document, the single Build control, and the explicit Planning Wizard handoff. No row creates a WorkNode, a Plan Compile run, or an Orchestrator effect.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.plan.strategy.set` | Set Plan Strategy | Selects one of the six exact Plan strategies before a Plan is created. | `assistant_chat_available && mode_menu_available` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanStrategySetV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanStrategySetV3Result` | `handlers::assistant_plan::plan_strategy_set` |
| `cmd.chat.plan.create` | Create Plan | Creates the thread's current Assistant Plan under the selected strategy and produces a read-only Plan document. | `assistant_plan_runtime_available && no_unfinished_current_plan_on_thread` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCreateRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCreateResultScopeV2` | `handlers::assistant_plan::plan_create` |
| `cmd.chat.plan.request_revision` | Revise Plan | Routes the user's revision feedback through the ordinary composer to the agent; it never edits Plan content directly. | `current_plan_present && plan_status != building && composer_available` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanRequestRevisionV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanRequestRevisionV3Result` | `handlers::assistant_plan::plan_request_revision` |
| `cmd.chat.plan.view.set` | Set Plan View | Switches the Plan document between the default Rich Text view and the read-only Markdown view. It is view state, not a domain command: it emits no Plan event and changes no Plan revision or hash (CDRY-006). It is the only registered row for a document view toggle; the Review and BrainStorm Formatted and Plain text toggles have no row (CDRY-021). | `current_or_historical_plan_present` | `shell_view` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanViewRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanViewResultScopeV2` | `handlers::assistant_plan::plan_view_set` |
| `cmd.chat.plan.build` | Build Plan | Admits the exact current Plan revision for execution and drives the single Build control through Building… to Completed or Canceled. `execution_topology` is `agent` by default; `goal_driven` is the Build as Goal path and atomically creates one simple Goal, one PlanRun, and one GoalPlanBinding (PGOAL-002..003). No `build_as_goal` peer command exists. | `plan_present && plan_build_admissible && expected_plan_version_current` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildResultScopeV2` | `handlers::assistant_plan::plan_build` |
| `cmd.chat.plan.build_with_crew` | Build With Crew | Admits the exact current Plan revision for execution through a configured Crew run instead of the single-agent build path. Its GUI producer is the Crew configuration sheet in Build With Crew mode: that sheet's Start dispatches this command, never `cmd.collaboration.start`, so the PlanRun and the CrewRun commit together (MODAL-013, UCC-169). | `plan_present && plan_build_admissible && collaborative_runtime_available` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCrewBuildRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanBuildResultScopeV2` | `handlers::assistant_plan::plan_build_with_crew` |
| `cmd.chat.plan.cancel` | Cancel Build | Cancels an admitted or running Plan build; the Build control settles on Canceled and the Plan document is unchanged. | `plan_present && plan_status in {admitted, building}` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCancelRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanCancelResultScopeV2` | `handlers::assistant_plan::plan_cancel` |
| `cmd.chat.plan.export` | Export Plan | Exports the exact Plan revision through the artifact owner. `content_kind` is `plan_document` (default) or `execution_report`; the existing format discriminator keeps PDF and Markdown. The execution report is a separate versioned artifact and exporting never alters `plan_hash` (PPROG-015..016, CDRY-005). | `plan_present && artifact_export_available` | `domain_action` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanExportRequestScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/ArtifactExportResultScopeV2` | `handlers::assistant_plan::plan_export` |
| `cmd.chat.plan.open_details` | Open Plan Details | Navigates to Plan details, hidden ledger or scoped-PlanUnit information, and artifact lineage. | `plan_present` | `navigation_wrapper` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanRouteScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/RouteResultScopeV2` | `handlers::assistant_plan::plan_open_details` |
| `cmd.chat.plan.open_version` | Open Plan Version | Opens the document of one exact Plan version in the editor: the Plan's own tab, deduplicated, while that version is still the Plan's version, otherwise that version's retained read-only document. Every Open plan button raises it with the version its surface names: the Plan card's action row and its Build-started and Plan-revised receipt lines (`plan_card`), a build schedule's row in the Scheduled manager (`schedule_manager`), and a bound Goal's Open exact Plan · Vn with the GoalPlanBinding's `assistant_plan_id`, `plan_version` and `plan_hash` (UCC-176, DL-157). It never opens Plan Details and never substitutes a newer version; a version that cannot be resolved returns a typed error and opens nothing. | `plan_present && exact_plan_version_retained` | `navigation_wrapper` | `Plans/Assistant_Plan_Runtime.md` | `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/AssistantPlanVersionRouteScopeV2` → `Plans/assistant_plan_runtime_contracts.schema.json#/$defs/RouteResultScopeV2` | `handlers::assistant_plan::plan_open_version` |

Source surfaces for this family: `artifact_details`, `composer`, `crew_modal`, `goal_activity`, `goal_hover`, `mode_menu`, `natural_language`, `plan_card`, `slash`, `targeted_composer`. `goal_activity` and `goal_hover` raise only `cmd.chat.plan.open_version` and `cmd.chat.plan.request_revision`. Every Open plan button, on `plan_card`, `schedule_manager`, `goal_activity` or `goal_hover`, raises `cmd.chat.plan.open_version` (DL-157); the Plan title, Expand and Details links keep their existing route. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### To-Do Runtime

The To-Do rows are thread-local. None of them accepts a whole-list replacement, a verification status, a source group, or a cross-thread aggregation.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.todos.open` | Open To-Dos | Navigates to the thread-local To-Do Activity domain or its detail panel. | `activity_available` | `navigation_wrapper` | `Plans/ToDo_Runtime.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::todo_runtime::todos_open` |
| `cmd.chat.todos.toggle_parent` | Expand To-Do | Expands or collapses a parent To-Do; this is local or shared view state, never a status change and never a To-Do domain event (CDRY-006). | `todo_list_present && parent_todo_present` | `shell_view` | `Plans/ToDo_Runtime.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::todo_runtime::todos_toggle_parent` |
| `cmd.chat.todos.open_work` | Open To-Do Work | Navigates to the admitted work record bound to a To-Do leaf. | `todo_present && work_binding_present` | `navigation_wrapper` | `Plans/ToDo_Runtime.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::todo_runtime::todos_open_work` |

Source surfaces for this family: `activity_bar`, `todo_activity`, `todo_hover`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Collaborative Workflows

Crew, BrainStorm, Review and Chat Room share the `cmd.collaboration.*` lifecycle rows and add only kind-specific protocol rows. There are not four lifecycle families.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.collaboration.configure` | Configure Workflow | Opens the kind-specific configuration modal populated from Settings defaults for Crew, BrainStorm, Review, or Chat Room, and validates/previews a local WorkflowLaunchDraft only. It creates no run, provider request, Usage record, durable event, card, installed package, or settings write (MODAL-001..003). | `collaborative_runtime_available && settings_readable` | `shell_view` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationConfigureResultScopeV2` | `handlers::collaboration::configure` |
| `cmd.collaboration.start` | Start Workflow | Starts a collaborative run from a committed configuration and freezes the effective participant roster and the Review target identity/hash at Start, not at modal open. Repeating the same idempotency binding returns the original run; the same key with changed configuration is rejected; a failed Start creates no card and no partial participant records (MODAL-005, MODAL-009..010, MODAL-017). | `configuration_committed && permission_ceiling_satisfied` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResultScopeV2` | `handlers::collaboration::start` |
| `cmd.collaboration.pause` | Pause Workflow | Pauses a running collaborative workflow without discarding participant transcripts or artifacts. | `run_present && run_status == running` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationPauseResultScopeV2` | `handlers::collaboration::pause` |
| `cmd.collaboration.resume` | Resume Workflow | Resumes a paused collaborative workflow; refused when the pause came from a manual stop. | `run_present && run_status == paused && !manual_stop_latched` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationResumeResultScopeV2` | `handlers::collaboration::resume` |
| `cmd.collaboration.cancel` | Cancel Workflow | Ends a collaborative run, preserving transcripts, dissent, and partial artifacts under their owners. A Chat Room can also cancel while waiting between rounds, at exhaustion or at its stop condition (CWR-044, DL-231). | `run_present && (run_status in {running, paused} or (run_kind == chat_room && run_status == waiting))` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationCancelResultScopeV2` | `handlers::collaboration::cancel` |
| `cmd.collaboration.message` | Message Workflow | Targets the ordinary composer at a run or participant; composer chrome visibly changes and names the destination. | `run_present && composer_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationMessageResultScopeV2` | `handlers::collaboration::message` |
| `cmd.collaboration.open` | Open Workflow | Opens the collaborative run's full panel from a card, the Activity bar, or a deep link. | `run_present` | `navigation_wrapper` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationOpenRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationOpenResultScopeV2` | `handlers::collaboration::open` |
| `cmd.collaboration.participant.open` | Open Participant Transcript | Opens one participant's own transcript from the card, panel, or Activity row. | `run_present && participant_present` | `navigation_wrapper` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationParticipantOpenRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationParticipantOpenResultScopeV2` | `handlers::collaboration::participant_open` |
| `cmd.collaboration.export` | Export Workflow | Exports the run's artifact set through the artifact owner without inventing a new artifact store. | `run_present && artifact_export_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationExportResultScopeV2` | `handlers::collaboration::export` |
| `cmd.collaboration.reconfigure` | Reconfigure Workflow | Applies a configuration change only while a run is waiting, running, blocked or paused; a completed, cancelled or failed run is refused (CWR-031). Records the requested-versus-effective delta. Chat Room set_pause_between_rounds switches pause_between_rounds on or off at the next round boundary without cancelling a turn (DL-231, UCC-207). It also owns explicit participant retry (new attempt identity), replacement (new assignment revision), waiver (actor/reason/currentness), and coordinator or moderator replacement. It never silently substitutes a failed or unavailable slot (PART-003..005, PART-017..018). | `run_present && run_status in {waiting, running, blocked, paused}` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationReconfigureResultScopeV2` | `handlers::collaboration::reconfigure` |
| `cmd.brainstorm.next_round` | Next BrainStorm Round | Advances the BrainStorm protocol to its next proposal, research, debate, or voting round. | `brainstorm_run_present && round_budget_remaining` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormRoundResultScopeV2` | `handlers::collaboration::brainstorm_next_round` |
| `cmd.brainstorm.synthesize_plan` | Synthesize Plan | Synthesizes the BrainStorm result into exactly one Deep Plan document owned by the Assistant Plan Runtime. **Historical wording; current rule: UCC-173: Write the plan (DL-138).** | `brainstorm_run_present && synthesis_admissible && no_unfinished_current_plan_on_thread` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/BrainstormSynthesisRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/AssistantPlanCreateResultScopeV2` | `handlers::collaboration::brainstorm_synthesize_plan` |
| `cmd.review.create_todos` | Create To-Dos From Findings | Creates To-Dos from selected review findings; Review itself never repairs anything. | `review_run_present && findings_present && todo_runtime_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewCreateTodosResultScopeV2` | `handlers::collaboration::review_create_todos` |
| `cmd.review.send_findings_to_agent` | Send Findings To Agent | Fills the source thread's empty composer from Review findings or saved missed taught-rule checks; never sends. UCC-172 owns both source variants and composer_not_empty refusal. The former send-to-agent wording and CollaborationMessageResult are historical only (DL-125, DL-138). | `composer_available && source_variant_eligible` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewSendFindingsRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ComposerBufferResultScopeV2` | `handlers::collaboration::review_send_findings_to_agent` |
| `cmd.review.run_again` | Run Another Review | Starts a fresh review pass against a newly frozen target pack; it cannot merge across target versions. **Historical wording; current rule: UCC-173: Run Another Review (DL-138).** | `review_run_present && target_pack_freezable` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ReviewRunAgainRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CollaborationStartResultScopeV2` | `handlers::collaboration::review_run_again` |
| `cmd.chat_room.next_round` | Next Chat Room Round | Starts exactly one next round under the unchanged turn policy while Pause between rounds is on and the room waits between rounds; otherwise run_state_invalid. Start begins round 1 (after Grill Me Confirm if enabled); automatic round starts dispatch no command (CWR-044, DL-231). | `chat_room_run_present && run_status == waiting && waiting_between_rounds && pause_between_rounds && completed_rounds >= 1 && round_budget_remaining && !stop_condition_met && turn_policy != ask_everyone_once` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomRoundResultScopeV2` | `handlers::collaboration::chat_room_next_round` |
| `cmd.chat_room.summarize` | Summarize Now | Produces a room summary artifact without promoting anything. **Historical wording; current rule: UCC-173: Summarize Now (DL-138).** | `chat_room_run_present && artifact_owner_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomSummarizeRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ArtifactResultScopeV2` | `handlers::collaboration::chat_room_summarize` |
| `cmd.chat_room.promote_to_plan` | Promote To Plan | Explicitly promotes room output into an Assistant Plan; ordinary discussion never does this implicitly. | `chat_room_run_present && explicit_user_action && assistant_plan_runtime_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromotePlanResultScopeV2` | `handlers::collaboration::chat_room_promote_to_plan` |
| `cmd.chat_room.promote_to_todo` | Promote To To-Do | Explicitly promotes room output into the thread's To-Do list. | `chat_room_run_present && explicit_user_action && todo_runtime_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteTodoResultScopeV2` | `handlers::collaboration::chat_room_promote_to_todo` |
| `cmd.chat_room.promote_to_goal` | Promote To Goal | Explicitly promotes room output into a Goal objective through the ordinary Goal authority rules. | `chat_room_run_present && explicit_user_action && goal_runtime_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/ChatRoomPromoteGoalResultScopeV2` | `handlers::collaboration::chat_room_promote_to_goal` |
| `cmd.chat.crew_auto.set` | Set Crew Auto | Commits only the discriminated Project configuration, saved app-thread configuration or thread override after current validation; no optimistic activation or run. | `collaborative_runtime_available && multi_agent_menu_available` | `domain_action` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetRequestScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoSetResultScopeV2` | `handlers::collaboration::crew_auto_set` |
| `cmd.chat.crew_auto.open_config` | Configure Crew Auto | Opens the Crew Auto criteria and ceiling configuration surface. | `collaborative_runtime_available` | `shell_view` | `Plans/Collaborative_Workflows.md` | `Plans/collaborative_workflows_contracts.schema.json#/$defs/CrewAutoConfigRouteScopeV2` → `Plans/collaborative_workflows_contracts.schema.json#/$defs/RouteResultScopeV2` | `handlers::collaboration::crew_auto_open_config` |

For `cmd.review.send_findings_to_agent`, `source_variant_eligible` requires a Review run and selected findings for `review_findings` (also the legacy absent discriminator), or a source reply with saved failed taught-rule checks for `taught_rule_check`; the latter never requires Review IDs (UCC-172).

Source surfaces for this family: `activity`, `brainstorm_card`, `brainstorm_panel`, `chat_room_card`, `chat_room_panel`, `composer`, `crew_auto_modal`, `message_chrome`, `multi_agent_menu`, `review_card`, `review_panel`, `workflow_card`, `workflow_modal`, `workflow_panel`. `message_chrome` produces only the `taught_rule_check` variant of `cmd.review.send_findings_to_agent`; its `review_findings` variant retains `review_card` and `review_panel` origins (UCC-172). Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Back Seat Driver

`cmd.bsd.set` is an EXISTING registered command ID reconciled to the Off/Auto/On policy contract; it receives no second peer row. Every BSD row is read-only with respect to the project: none of them authorizes, mutates, certifies, or substitutes for required review or testing.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.bsd.set` | Set Back Seat Driver Mode | Sets the Back Seat Driver advisor to Off, Auto, or On for the active scope. | `bsd_available` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BackSeatDriverModeSetRequest` → `BackSeatDriverModeSetResult` | `handlers::back_seat_driver::set_mode` |
| `cmd.bsd.configure` | Configure Back Seat Driver | Updates the BSD policy: model, Persona, trigger sensitivity, catch-up, cooldown, transcript retention, and self-compaction threshold. | `bsd_available && settings_writable` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDPolicyUpdateRequest` → `BSDPolicyUpdateResult` | `handlers::bsd::configure` |
| `cmd.bsd.workflow.configure` | Configure BSD Stages | Binds or unbinds BSD to individual PRD Builder, Planning Wizard, ledger/PlanUnit, Plan Compile, WorkNode, audit, execution, verification, remediation, and certification stages. | `bsd_available && workflow_stage_present` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDWorkflowBindingRequest` → `BSDWorkflowBindingResult` | `handlers::bsd::workflow_configure` |
| `cmd.bsd.assignment.pause` | Pause BSD Assignment | Pauses one BSD assignment without affecting the primary flow. | `bsd_assignment_present && assignment_status == active` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDAssignmentControlRequest` → `BSDAssignmentControlResult` | `handlers::bsd::assignment_pause` |
| `cmd.bsd.assignment.resume` | Resume BSD Assignment | Resumes a paused BSD assignment; refused after a manual stop. | `bsd_assignment_present && assignment_status == paused && !manual_stop_latched` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDAssignmentControlRequest` → `BSDAssignmentControlResult` | `handlers::bsd::assignment_resume` |
| `cmd.bsd.assignment.retry` | Retry BSD Assignment | Retries a failed or quarantined BSD assignment from its recorded cursor. | `bsd_assignment_present && assignment_status in {failed, quarantined}` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDAssignmentRetryRequest` → `BSDAssignmentRetryResult` | `handlers::bsd::assignment_retry` |
| `cmd.bsd.assignment.stop` | Stop BSD Assignment | Stops one BSD assignment; the primary flow continues regardless of BSD health. | `bsd_assignment_present && assignment_status in {active, paused}` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDAssignmentControlRequest` → `BSDAssignmentControlResult` | `handlers::bsd::assignment_stop` |
| `cmd.bsd.finding.open` | Open BSD Finding | Opens one BSD finding, including its held-and-reconfirmed history and the generation it was raised against. | `bsd_finding_present` | `navigation_wrapper` | `Plans/Back_Seat_Driver.md` | `BSDFindingRoute` → `RouteResult` | `handlers::bsd::finding_open` |
| `cmd.bsd.open_usage` | Open BSD Usage | Navigates to the Usage view filtered to the distinct Back Seat Driver attribution. | `usage_available` | `navigation_wrapper` | `Plans/Back_Seat_Driver.md` | `BSDUsageRoute` → `RouteResult` | `handlers::bsd::open_usage` |
| `cmd.bsd.open_transcript` | Open BSD Transcript | Opens the isolated BSD advisor transcript. | `bsd_transcript_retained` | `navigation_wrapper` | `Plans/Back_Seat_Driver.md` | `BSDTranscriptRoute` → `RouteResult` | `handlers::bsd::open_transcript` |

Source surfaces for this family: `bsd_details`, `context`, `planning_wizard`, `prd_builder`, `usage`, `wand`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Scheduling and quota resume

Every scheduled dispatch binds an exact Plan version and hash or an exact message and attachment snapshot and revalidates before dispatch. A manual pause, cancel or Stop overrides every row in this family.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.plan.schedule_build` | Build At… | Binds an execution schedule to the exact Plan version and hash and revalidates that binding before dispatch. Stores exactly one `execution_topology` of `agent`, `goal_driven`, or `crew`, freezing a validated CollaborationDefinition for `crew`. Creates no PlanRun, Goal, CrewRun, work binding, or provider attempt until first eligible dispatch (PSCHED-001..004). | `plan_present && plan_build_admissible && scheduling_available` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/AssistantPlanScheduleRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionScheduleResultScopeV2` | `handlers::scheduling::plan_schedule_build` |
| `cmd.chat.schedule_message` | Schedule Message | Schedules the exact composer text and attachment snapshot for later dispatch from the wand menu. | `composer_available && scheduling_available && composer_not_empty` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCreateRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCreateResultScopeV2` | `handlers::scheduling::schedule_message` |
| `cmd.chat.schedule_message.update` | Update Scheduled Message | Updates a pending scheduled message and rebinds its exact snapshot. | `scheduled_message_present && dispatch_not_started` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageUpdateRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageUpdateResultScopeV2` | `handlers::scheduling::schedule_message_update` |
| `cmd.chat.schedule_message.cancel` | Cancel Scheduled Message | Cancels a pending scheduled message before dispatch. | `scheduled_message_present && dispatch_not_started` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ScheduledMessageCancelResultScopeV2` | `handlers::scheduling::schedule_message_cancel` |
| `cmd.execution_window.create` | Create Execution Window | Creates a recurring execution window with start, wind-down, days, timezone, and DST policy. | `scheduling_available` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCreateRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCreateResultScopeV2` | `handlers::scheduling::execution_window_create` |
| `cmd.execution_window.update` | Update Execution Window | Updates an execution window without silently changing an in-flight run's admission. | `execution_window_present` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowUpdateRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowUpdateResultScopeV2` | `handlers::scheduling::execution_window_update` |
| `cmd.execution_window.cancel` | Cancel Execution Window | Cancels an execution window; work already admitted continues under its own owner. | `execution_window_present` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCancelRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/ExecutionWindowCancelResultScopeV2` | `handlers::scheduling::execution_window_cancel` |
| `cmd.runtime.quota_resume.set` | Set Quota Auto-Resume | Records the user's opt-in consent to resume automatically when the usage quota resets, subject to manual-stop precedence. | `usage_available && reset_truth_known` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/QuotaResumeConsentRequestScopeV2` → `Plans/scheduling_and_quota_resume_contracts.schema.json#/$defs/QuotaResumeConsentResultScopeV2` | `handlers::scheduling::quota_resume_set` |

Source surfaces for this family: `plan_card`, `plan_schedule`, `quota_strip`, `run_schedule`, `schedule_details`, `settings`, `usage`, `wand`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Assistant attachments and artifacts

These rows wrap the file and artifact owners. They do not become an upload or download engine and do not own artifact version or retention.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.attachment.add` | Attach File Or Folder | Adds a file, folder, or generated artifact to the composer tray through the file owners. `semantic_kind` is `file` or `folder`; a folder carries a bounded manifest with exact root identity, entries/hash policy, exclusions, permissions, and materialization status. Picker, drag-and-drop, and File Manager reference paths all converge here, and `cmd.chat.add_file_reference` is a file-only alias to it (FOLDER-001..004). | `composer_available && file_owner_available` | `domain_action` | `Plans/FileManager.md` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentAddRequestV2` → `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentAddResultV2` | `handlers::chat_attachments::attachment_add` |
| `cmd.chat.attachment.remove` | Remove Attachment | Removes one attachment from the composer tray; a failed removal never clears unrelated buffer data. | `attachment_present && message_not_sent` | `domain_action` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentRemoveV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentRemoveV3Result` | `handlers::chat_attachments::attachment_remove` |
| `cmd.chat.attachment.retry` | Retry Attachment | Retries a failed attachment processing operation from its recorded state. | `attachment_present && attachment_state == failed` | `domain_action` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentRetryV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentRetryV3Result` | `handlers::chat_attachments::attachment_retry` |
| `cmd.chat.attachment.open` | Open Attachment | Opens the attachment in its supported viewer when the type allows it. | `attachment_present && attachment_openable` | `navigation_wrapper` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentOpenV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentOpenV3Result` | `handlers::chat_attachments::attachment_open` |
| `cmd.chat.attachment.download` | Download Attachment | Downloads the exact recorded version of the attachment or generated artifact. | `attachment_present && exact_version_resolvable` | `navigation_wrapper` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentDownloadV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentDownloadV3Result` | `handlers::chat_attachments::attachment_download` |
| `cmd.chat.attachment.details` | Attachment Details | Opens More Info: producer and run, related message or workflow, version, hash, trust and freshness, retention, export history, and context-materialization truth. | `attachment_present` | `navigation_wrapper` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentDetailsV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentDetailsV3Result` | `handlers::chat_attachments::attachment_details` |
| `cmd.chat.attachment.freeze_reference` | Freeze Reference | Freezes a live project-file reference to the exact content that was current at send time. | `attachment_present && attachment_origin == project_reference` | `domain_action` | `Plans/FileManager.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentFreezeReferenceV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/AttachmentFreezeReferenceV3Result` | `handlers::chat_attachments::attachment_freeze_reference` |
| `cmd.chat.attachment.save_to_project` | Save To Project | Saves a generated artifact into the project through FileSafe with its lineage preserved. | `attachment_present && attachment_origin == generated_artifact && filesafe_available` | `domain_action` | `Plans/FileManager.md` | `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentSave_To_ProjectRequestV2` → `Plans/assistant_attachment_contracts.schema.json#/$defs/AttachmentSave_To_ProjectResultV2` | `handlers::chat_attachments::attachment_save_to_project` |

Source surfaces for this family: `attachment_details`, `composer`, `message_chrome`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Assistant chat composer, title and ELI5

Composer destination rows change visible composer chrome and name the destination. There is no user-facing Draft product: per-thread unsent state is invisible `ComposerBuffer` persistence.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.goal.open_editor` | Open Goal Editor | Navigates to Goal Activity Detail in edit mode from the Goal hover menu. | `goal_present && activity_detail_available` | `navigation_wrapper` | `Plans/assistant-chat-design.md` | `Plans/assistant_chat_contracts.schema.json#/$defs/GoalEditorRouteScopeV2` → `Plans/assistant_chat_contracts.schema.json#/$defs/RouteResultScopeV2` | `handlers::assistant_chat::goal_open_editor` |
| `cmd.chat.composer.destination.set` | Set Composer Destination | Points the ordinary composer at a workflow run, a participant or a Plan revision (the destination kinds `Plans/Collaborative_Workflows.md` §4.5 closes), and changes composer chrome to name it. The numbered component list built by `cmd.browser.component.add_to_composer` is message content, never a destination. | `composer_available && destination_target_present` | `domain_action` | `Plans/assistant-chat-design.md` | `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationSetRequestScopeV2` → `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationSetResultScopeV2` | `handlers::assistant_chat::composer_destination_set` |
| `cmd.chat.composer.destination.clear` | Clear Composer Destination | Returns the composer to the ordinary thread destination. | `composer_destination_set` | `domain_action` | `Plans/assistant-chat-design.md` | `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationClearRequestScopeV2` → `Plans/assistant_chat_contracts.schema.json#/$defs/ComposerDestinationClearResultScopeV2` | `handlers::assistant_chat::composer_destination_clear` |
| `cmd.chat.thread.regenerate_title` | Regenerate Title | Explicitly regenerates the thread title, clearing the lock that a manual rename set. **Historical wording; current rule: UCC-173: Name it for me (DL-138).** | `thread_present && title_policy != none && title_model_available` | `domain_action` | `Plans/assistant-chat-design.md` | `Plans/assistant_chat_contracts.schema.json#/$defs/ThreadTitleRegenerateRequestScopeV2` → `Plans/assistant_chat_contracts.schema.json#/$defs/ThreadTitleGenerationResultScopeV2` | `handlers::assistant_chat::thread_regenerate_title` |
| `cmd.chat.eli5.set` | Set ELI5 | Sets the ELI5 conversation override for the active thread independently of the application default. **Historical wording; current rule: UCC-175: sheet/dot producer and chat > project > app resolution (DL-138).** | `assistant_chat_available` | `domain_action` | `Plans/assistant-chat-design.md` | `Plans/assistant_chat_contracts.schema.json#/$defs/ELI5ThreadOverrideRequestScopeV2` → `Plans/assistant_chat_contracts.schema.json#/$defs/ELI5ThreadOverrideResultScopeV2` | `handlers::assistant_chat::eli5_set` |

Source surfaces for this family: `composer`, `goal_hover`, `thread_menu`, `wand`, `workflow_card`, `workflow_panel`. The ELI5 row is superseded by UCC-175: only `eli5_sheet` and `composer` produce it; the wand opens its sheet (DL-138). Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Teach and Assistant memory

Teach is user to Puppet Master durable teaching. No row here selects, implies, or switches to the Teacher Persona, which `Plans/Personas.md` owns.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.teach.capture` | Teach | Captures a durable user→Puppet Master teaching from a slash command, natural language, or the message menu. **Historical wording; current rule: UCC-172: opens the Teach sheet and persists nothing (DL-138).** | `assistant_memory_available` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::assistant_memory::teach_capture` |
| `cmd.chat.teach.confirm` | Confirm Teaching | Commits the captured teaching to durable Assistant memory. | `teach_capture_pending` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::assistant_memory::teach_confirm` |
| `cmd.chat.teach.cancel` | Cancel Teaching | Discards the captured teaching without writing memory. | `teach_capture_pending` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::assistant_memory::teach_cancel` |
| `cmd.chat.teach.open_memory` | Open Memory | Navigates to the Assistant memory surface for the captured or automatic memory. | `assistant_memory_available` | `navigation_wrapper` | `Plans/assistant-memory-subsystem.md` | `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2` → `Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2` | `handlers::assistant_memory::teach_open_memory` |

Source surfaces for this family: `message_menu`, `natural_language`, `slash`, `teach_capture`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Planning Wizard direct intake

This is the only route from an Assistant Plan into the full planning, Plan Compile and Orchestrator flow, and it bypasses PRD Builder.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.plan.send_to_planning_wizard` | Send To Planning Wizard | Hands the exact Plan revision to Planning Wizard direct intake, bypassing PRD Builder; this is the only route from an Assistant Plan into Plan Compile and Orchestrator. | `plan_present && planning_wizard_available && explicit_user_confirmation` | `domain_action` | `Plans/Planning_Wizard.md` | `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanWizardHandoffV3Request` → `Plans/projects_refresh_fix_contracts.schema.json#/$defs/PlanWizardHandoffV3Result` | `handlers::planning_wizard::assistant_plan_intake` |

Source surfaces for this family: `plan_card`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### Browser capture and DevTools

Immediate-send rows use an isolated payload and can never send unrelated composer text. The protected authentication browser is excluded from every row in this family.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.browser.capture.full_to_chat` | Capture Screenshot To Chat | Captures the visible viewport, or the full page when selected, and sends it immediately to the current composer destination as an isolated payload. | `browser_runtime_available && !protected_auth_browser && capture_permitted` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::capture_full_to_chat` |
| `cmd.browser.capture.region_to_chat` | Capture Region To Chat | Captures a user-selected region and sends it immediately to the current composer destination as an isolated payload. | `browser_runtime_available && !protected_auth_browser && capture_permitted` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::capture_region_to_chat` |
| `cmd.browser.component.pick` | Pick Component | Enters component selection and highlights the resolvable component under the pointer. | `browser_runtime_available && !protected_auth_browser && component_resolution_available` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::component_pick` |
| `cmd.browser.component.send_now` | Send Component Now | Sends the selected component context immediately using an isolated payload that never includes unrelated composer text. It revalidates session, page, frame, generation, locator, and captured identity first; zero matches, multiple matches, a destroyed frame/page, or an identity mismatch returns typed `stale_capture` with a recapture action through `cmd.browser.component.pick` and admits no message (BSTALE-001..004, BSTALE-008). | `component_selected && composer_destination_resolvable` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::component_send_now` |
| `cmd.browser.component.add_to_composer` | Add Component To Composer List | Appends the selected component to the numbered composer component list and stores its hidden reference. | `component_selected && composer_available` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::component_add_to_composer` |
| `cmd.browser.component.insert_at_cursor` | Insert Component At Cursor | Inserts a component chip at the composer caret position. | `component_selected && composer_available && caret_position_known` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::component_insert_at_cursor` |
| `cmd.browser.component.mode.set_default` | Set Component Mode Default | Persists the last used component action as the initial mode for the next selection. | `settings_writable` | `domain_action` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2` → `Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2` | `handlers::browser_runtime::component_mode_set_default` |
| `cmd.browser.devtools.open` (alias of `cmd.browser.open_devtools` from 2026-10-09, UCC-202) | Open DevTools | Opens ordinary internal browser DevTools under policy control; the protected authentication browser is excluded. | `browser_runtime_available && !protected_auth_browser && devtools_policy_allows` | `navigation_wrapper` | `Plans/Section15_MVP_Promoted_Features_Spec.md` | `BrowserDevToolsOpenRequest` → `RouteResult` | `handlers::browser_runtime::devtools_open` |

Source surfaces for this family: `browser_selection_bar`, `browser_toolbar`. Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

### UCC-156 - Assistant Redesign Command Registration And Alias Census

```yaml
plan_unit_id: UCC-156
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The approved Puppet Master Assistant redesign registers eighty-four exact command IDs across simplified Goal, Assistant Plan, To-Do, collaborative workflow, Back Seat Driver, scheduling, attachment, composer, Teach, Planning Wizard intake, and browser-capture families. Each row names exactly one owner document, one request contract, one result contract, and one sole future target handler. An alias census over all live Plans ran before registration and identified exactly three pre-existing IDs -- cmd.chat.goal.start, cmd.chat.goal.update, and cmd.bsd.set -- which are reconciled in place to their revised contracts and receive no duplicate row, peer control, or second handler. Every row remains handler_unavailable and its GUI controls remain disabled with command_not_registered until the central command contract layer, Event Authority, storage registration, and production wiring close for that row.
  Amended 2026-10-09 (DL-180): cmd.browser.devtools.open is an alias of cmd.browser.open_devtools (UCC-202).
gui_related: true
gui_classification_reason: These rows are the reverse-consumer identity for every new Assistant mode menu, wand item, Plan card control, Activity control, workflow modal, BSD surface, scheduling modal, attachment control, and browser capture control.
depends_on: [UCC-155, CS-077, DL-180]
unblocks: []
acceptance_criteria:
  - All eighty-four IDs appear exactly once with label, description, preconditions, command_kind, owner, request/result contracts, and a single named future target handler.
  - The three pre-existing IDs receive no second catalog row, no peer control, no independent disabled state, and no additional handler target.
  - Every named source surface reads the same owner availability and the same exact disabled reason, and renders disabled rather than optimistic when it cannot read them.
  - Mutating domain_action rows apply the catalog-wide projection-freshness gating clause before dispatch and return to the exact initiating route and focus.
  - handler_unavailable and command_not_registered remain explicit; no page-local handler, alias, or toast simulates success.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: assistant_command_alias_collision_or_simulated_success
reasoning_tier: high
context_scope: assistant_redesign_command_registration
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_command_catalog_registration_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:machine/commands.json
  - pm-assistant-implementation-2026-09-02-recovered:03_COMMAND_CATALOG_DELTA.md
  - pm-assistant-implementation-2026-09-02-recovered:DRY-001
  - pm-assistant-implementation-2026-09-02-recovered:DRY-002
preserved_exact_tokens:
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "cmd.bsd.set"
  - "command_not_registered"
  - "handler_unavailable"
  - "domain_action"
  - "navigation_wrapper"
  - "shell_view"
negative_constraints:
  - Do not create a second catalog row, peer control, or alternate handler for a pre-existing command ID.
  - Do not claim a native dispatcher, handler, rendered control, receipt, or runtime from static catalog registration.
  - Do not let a page-local action ID, alias, or toast stand in for an unregistered command.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): cmd.browser.devtools.open becomes an alias."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

### UCC-157 - Assistant Redesign Retired Command Surfaces

```yaml
plan_unit_id: UCC-157
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'The Assistant redesign retires several command surfaces outright. No catalog row may exist
  for a Goal phase, Goal tranche, child-Goal topology, Goal budget, or a Goal-specific planner, evaluator,
  verifier, or adjudicator role. No row may expose direct user editing of Plan Rich Text or Markdown, a fourth
  regular Plan depth, legacy Light/Balanced/Comprehensive Plan labelling, or a Plan status of superseded in
  the thread-card model. No row may expose a To-Do verification status, a To-Do source group, or a separate
  Done section. No row may expose a user-facing composer Draft product or a restore-draft control, because
  unsent per-thread state is invisible ComposerBuffer persistence. Context Lens keeps its own top-level header
  command identity and is not registered as a wand item.


  Current projects-refresh contract: No project is genuine application scope, with a named fixed Computer after
  first message, lazy visible chat folder and no invented Project/Vault. Admit ordinary files/browser/editor/terminal/tools/notebook/history/recovery
  under exact app roots and owner versions, retaining private notebook/memory isolation and counterpart limits.
  Six projects.* read tools return explicit requested/looked_in/not_looked_in/partial coverage; source read
  grants do not authorize writes. Existing cmd.thread.request/spawn Send uses current local previews and receiver
  authority; maximum three automatic round trips. Two equal conversion choices share one manifest/copy-check/cutover/report/Undo
  engine; stop/fence Goal/Crew/Plan/timers and use linked destination records by default. No new work plus
  seven days bounds chat Undo, not independent canonical custody. Screen use is off until exact chat/app/controller/disclosure
  admission, with one targeted Stop. The exact consumer contract is UCC-216/WM-102 and Plans/projects_refresh_command_bindings.json.
  Historical schema/hash/replay resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses
  remain as specified; unavailable handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: This unit prevents retired concepts from re-entering the catalog as controls after
  the redesign lands.
depends_on:
- UCC-156
unblocks: []
acceptance_criteria:
- No catalog row names a Goal phase, tranche, child Goal, Goal budget, or Goal-specific verifier role.
- No catalog row exposes direct Plan content editing, a fourth regular Plan depth, or legacy Plan depth labels.
- No catalog row exposes To-Do verification status, source grouping, or a Done section.
- No catalog row exposes a Draft product or restore-draft control.
- Context Lens remains a top-level header command and is not registered under the wand.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-216; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: retired_assistant_surface_reintroduced_as_command
reasoning_tier: high
context_scope: assistant_redesign_command_retirement
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: static_command_retirement_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pm-assistant-implementation-2026-09-02-recovered:AUTHORITY_AND_PRECEDENCE.md#4
- pm-assistant-implementation-2026-09-02-recovered:AUTH-002
- pm-assistant-implementation-2026-09-02-recovered:AUTH-003
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- Context Lens
- ComposerBuffer
- superseded
negative_constraints:
- Do not reintroduce a retired Goal, Plan, To-Do, or Draft surface as a command row.
- Do not move Context Lens into the wand menu.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/UI_Command_Catalog.md
```
