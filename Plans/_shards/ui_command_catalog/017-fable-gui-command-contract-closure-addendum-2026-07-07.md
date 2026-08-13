# Shard 017: FABLE GUI command contract closure addendum (2026-07-07)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7971-L8099

Source SHA256: `fef0868f7da38b681f9c712a396c6e6017c55441019bf5c4621e2896c5a26fd4`

---

## FABLE GUI command contract closure addendum (2026-07-07)

This addendum closes the command-catalog portion of the FABLE GUI command and wiring repair. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, FileSafe behavior, storage behavior, platform specifications, or production build tasks. Existing FileManager CRUD, runtime allowed-action, PRD Builder, Planning Wizard, and Plan Compile command rows remain canonical; this addendum adds missing command families and supplies field-level payload, result, error, and receipt/event contracts for the launch-critical and GUI-command families named by the FABLE repair.

### Command response and receipt baseline

Every command in this addendum returns the `UICommandResponse` envelope from `Plans/Contracts_V0.md`. The field-level response minimum is `schema_version`, `dispatch_id`, `command_id`, `ack_status`, `result_status?`, `error?`, `event_refs[]?`, `receipt_ref?`, and `ts`. Error codes are closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`. Commands that intentionally emit no persisted domain event still record a dispatch receipt or route/open disposition and must not fabricate `*.command_applied` events.

### Added GUI command families

| Command ID | Payload fields | Result fields | Error/disabled fields | Receipt or event effect |
|---|---|---|---|---|
| `cmd.theme.set_mode` | `project_id?`, `scope`, `mode` (`light`, `dark`, or `auto`), `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_mode`, `effective_variant` (resolved theme; in `auto` it tracks OS `prefers-color-scheme` live), `contrast_profile` | `stale_projection`, `permission_denied`, `invalid_args` | `settings.theme.updated` |
| `cmd.theme.set_accent` | `project_id?`, `scope`, `accent_token`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_accent_token` | `invalid_args`, `stale_projection` | `settings.theme.updated` |
| `cmd.theme.set_density` | `project_id?`, `scope`, `density`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `effective_density` | `invalid_args`, `stale_projection` | `settings.theme.updated` |
| `cmd.theme.preview` | `scope`, `theme_patch`, `preview_surface`, `ttl_ms` | `preview_id`, `expires_at_utc` | `invalid_args`, `handler_unavailable` | explicit dispatch receipt |
| `cmd.theme.reset` | `project_id?`, `scope`, `expected_theme_revision`, `idempotency_key` | `theme_revision`, `reset_scope` | `stale_projection`, `permission_denied` | `settings.theme.updated` |
| `cmd.persona.create` | `project_id`, `persona_spec`, `source_refs[]`, `idempotency_key` | `persona_id`, `persona_revision` | `invalid_args`, `permission_denied`, `stale_projection` | `persona.created` |
| `cmd.persona.update` | `project_id`, `persona_id`, `persona_patch`, `expected_persona_revision`, `idempotency_key` | `persona_id`, `persona_revision` | `stale_projection`, `invalid_args`, `permission_denied` | `persona.updated` |
| `cmd.persona.delete` | `project_id`, `persona_id`, `expected_persona_revision`, `confirmation_token`, `idempotency_key` | `persona_id`, `terminal_state` | `blocked_state_required`, `permission_denied`, `stale_projection` | `persona.deleted` |
| `cmd.persona.select` | `project_id`, `surface`, `persona_id`, `expected_persona_revision?` | `effective_persona_id`, `selection_scope` | `invalid_args`, `stale_projection` | `persona.selected` |
| `cmd.persona.duplicate` | `project_id`, `source_persona_id`, `new_name`, `idempotency_key` | `persona_id`, `persona_revision` | `invalid_args`, `permission_denied` | `persona.created` |
| `cmd.persona.import` | `project_id`, `source_ref`, `import_mode`, `authority_snapshot`, `idempotency_key` | `persona_id`, `persona_revision`, `import_receipt_ref` | `invalid_args`, `permission_denied`, `handler_unavailable` | `persona.imported` |
| `cmd.persona.export` | `project_id`, `persona_id`, `format`, `redaction_profile` | `export_ref`, `persona_revision` | `invalid_args`, `permission_denied` | `persona.exported` |
| `cmd.alert.acknowledge` | `project_id`, `alert_id`, `alert_revision`, `actor_ref`, `idempotency_key` | `alert_id`, `status` | `stale_projection`, `permission_denied` | `alert.acknowledged` |
| `cmd.alert.snooze` | `project_id`, `alert_id`, `alert_revision`, `snooze_until_utc`, `reason`, `idempotency_key` | `alert_id`, `snooze_until_utc` | `invalid_args`, `stale_projection` | `alert.snoozed` |
| `cmd.alert.dismiss` | `project_id`, `alert_id`, `alert_revision`, `dismissal_reason`, `idempotency_key` | `alert_id`, `status` | `stale_projection`, `permission_denied` | `alert.dismissed` |
| `cmd.alert.open_source` | `project_id`, `alert_id`, `route_target`, `OpenSubject` | `route_ref`, `opened_subject_ref` | `invalid_route`, `stale_projection` | explicit route/open receipt |
| `cmd.alert.mute_rule` | `project_id`, `alert_rule_id`, `mute_scope`, `expires_at_utc?`, `reason`, `idempotency_key` | `alert_rule_id`, `mute_state` | `permission_denied`, `invalid_args` | `alert.rule_muted` |
| `cmd.concern.create` | `project_id`, `title`, `severity`, `category`, `source_refs[]`, `idempotency_key` | `concern_id`, `concern_revision` | `invalid_args`, `permission_denied` | `concern.created` |
| `cmd.concern.update` | `project_id`, `concern_id`, `concern_patch`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `concern_revision` | `stale_projection`, `invalid_args` | `concern.updated` |
| `cmd.concern.assign` | `project_id`, `concern_id`, `assignee_ref`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `concern_revision`, `assignee_ref` | `permission_denied`, `stale_projection` | `concern.assigned` |
| `cmd.concern.resolve` | `project_id`, `concern_id`, `resolution_kind`, `evidence_refs[]`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `terminal_state` | `blocked_state_required`, `stale_projection` | `concern.resolved` |
| `cmd.concern.reopen` | `project_id`, `concern_id`, `reopen_reason`, `source_refs[]`, `idempotency_key` | `concern_id`, `concern_revision` | `permission_denied`, `stale_projection` | `concern.reopened` |
| `cmd.concern.link_evidence` | `project_id`, `concern_id`, `evidence_refs[]`, `expected_concern_revision`, `idempotency_key` | `concern_id`, `linked_evidence_refs[]` | `invalid_args`, `stale_projection` | `concern.evidence_linked` |
| `cmd.concern.promote` | `project_id`, `concern_id`, `promotion_target`, `expected_concern_revision`, `idempotency_key` | `promotion_id`, `concern_id` | `permission_denied`, `blocked_state_required`, `stale_projection` | `concern.promoted` |
| `cmd.model.refresh` | `project_id?`, `provider_id?`, `account_id?`, `refresh_reason`, `idempotency_key` | `model_catalog_revision`, `provider_status_refs[]` | `permission_denied`, `handler_unavailable`, `stale_projection` | `model.catalog_refreshed` |
| `cmd.model.list` | `project_id?`, `provider_filter?`, `capability_filter?`, `cache_policy` | `model_catalog_revision`, `model_ids[]`, `degraded_reason?` | `handler_unavailable`, `invalid_args` | explicit dispatch receipt |
| `cmd.chat.send` | `thread_id`, `project_id?`, `message_id`, `content_ref`, `attachment_refs[]`, `model_request_ref?`, `idempotency_key` | `assistant_turn_id?`, `message_id`, `run_or_goal_ref?` | `permission_denied`, `stale_projection`, `handler_unavailable` | `chat.message.submitted` |
| `cmd.chat.stop` | `thread_id`, `run_id?`, `assistant_turn_id?`, `stop_reason_code`, `idempotency_key` | `thread_id`, `stopped_ref?`, `resumable` | `blocked_state_required`, `stale_projection`, `handler_unavailable` | `chat.response_stop_requested` |
| `cmd.panel.undock` | `project_id?`, `panel_id`, `current_host`, `target_window?`, `expected_layout_revision`, `idempotency_key` | `panel_id`, `layout_revision`, `window_id?` | `invalid_args`, `stale_projection` | `panel.undocked` |
| `cmd.panel.redock` | `project_id?`, `panel_id`, `window_id?`, `target_host`, `expected_layout_revision`, `idempotency_key` | `panel_id`, `layout_revision` | `invalid_args`, `stale_projection` | `panel.redocked` |
| `cmd.orchestrator.pause` | `run_id`, `pause_scope`, `pause_reason`, `safe_point_required`, `idempotency_key` | `run_id`, `pause_receipt_ref`, `resumable` | `permission_denied`, `blocked_state_required`, `stale_projection` | `goal_run.stopped` |
| `cmd.orchestrator.resume` | `run_id`, `resume_scope`, `expected_goal_revision`, `wake_reason`, `idempotency_key` | `run_id`, `scheduler_pass_ref?`, `resumed` | `blocked_state_required`, `stale_projection`, `permission_denied` | `scheduler.pass` |
| `cmd.dashboard.add_widget` | `project_id`, `dashboard_id`, `widget_id`, `layout_slot`, `expected_layout_revision`, `idempotency_key` | `widget_instance_id`, `layout_revision` | `invalid_args`, `stale_projection` | `dashboard.widget_added` |
| `cmd.dashboard.catalog` | `project_id?`, `surface`, `filter?`, `cache_policy` | `catalog_revision`, `widget_ids[]` | `handler_unavailable`, `invalid_args` | explicit dispatch receipt |
| `cmd.onboarding.free_models.refresh` | `project_id?`, `provider_filter?`, `account_id?`, `idempotency_key` | `free_model_catalog_revision`, `model_ids[]` | `handler_unavailable`, `permission_denied` | `onboarding.free_models_refreshed` |
| `cmd.onboarding.free_models.retry` | `project_id?`, `failed_refresh_id`, `retry_reason`, `idempotency_key` | `free_model_catalog_revision?`, `retry_receipt_ref` | `blocked_state_required`, `handler_unavailable` | `onboarding.free_models_refresh_retried` |
| `cmd.onboarding.free_models.setup` | `project_id?`, `provider_id`, `return_route`, `setup_intent`, `idempotency_key` | `setup_route_ref`, `return_route` | `invalid_route`, `permission_denied` | `onboarding.provider_setup_opened` |

### Existing launch, recovery, and FileManager command contracts

| Command family | Field-level closure |
|---|---|
| PRD/Planning launch | `cmd.prd_builder.approve_for_planning_wizard`, `cmd.planning_wizard.approve_and_build`, and `cmd.plan_compile.open_build` keep their existing command rows. Their payloads must include CAS/currentness inputs, approval actor, idempotency key, route/build identity where relevant, result identity, `UICommandResponse`, and receipt/event refs. `cmd.plan_compile.open_build` remains route/open or post-build reveal only while runtime activation is disabled; it must not emit `plan_compile.command_applied` as a fabricated success event. |
| Runtime allowed actions | `resume_after_prerequisite`, `restore_safe_point_then_retry`, `start_fresh_attempt`, `replan`, `skip_node`, and `abort_run` map only to the existing `cmd.runtime.*` commands. Payloads carry `run_id`, `node_id?`, `blocked_sequence?`, `attempt_id?`, safe-point/worktree/baseline fields where applicable, result status, and closed error codes. Dispatch emits `node.unblocked`, `safe_point.restored`, `scheduler.pass`, `goal.replanned`, `goal_run.stopped`, or an explicit dispatch receipt; it must not emit `runtime.command_applied`. |
| FileManager CRUD | Existing `cmd.file.new_file`, `cmd.file.new_folder`, `cmd.file.rename`, `cmd.file.delete`, `cmd.file.copy_path`, `cmd.file.copy_nodes`, `cmd.file.cut_nodes`, `cmd.file.paste_nodes`, `cmd.file.open_with`, and `cmd.file.save_local_copy` rows remain canonical. Mutation commands emit their existing file/folder events; clipboard and open commands record explicit no-persist dispatch or route/open receipts. |

### UCC-108 - FABLE GUI Command Families And Response Contracts

```yaml
plan_unit_id: UCC-108
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The FABLE GUI command repair registers missing theme, persona, alert, concern, model,
  chat send/stop, panel undock/redock, Orchestrator pause/resume, Dashboard widget,
  Free Models onboarding, launch-chain, runtime recovery, and FileManager command
  contracts with field-level payload, result, error, and receipt/event requirements.
  Existing FileManager CRUD, launch-chain, and runtime allowed-action rows remain
  canonical and are strengthened by the shared UICommandResponse and no fabricated
  command_applied event rule.
gui_related: true
gui_classification_reason: Defines user-visible GUI command families, command payloads, responses, disabled states, and receipts.
depends_on: [UCC-089, UCC-097]
unblocks: [WM-042, PG-061]
acceptance_criteria:
  - All command families named by the FABLE GUI repair have stable `cmd.*` IDs or explicit compatibility dispositions.
  - Every listed command declares payload fields, result fields, closed error handling through UICommandResponse, and receipt or event effects.
  - Runtime allowed_action_ids map only to canonical `cmd.runtime.*` commands.
  - FileManager CRUD commands are not duplicated; existing rows remain canonical and gain the shared response/receipt acceptance bar.
  - No command in this addendum uses or authorizes fabricated `*.command_applied` events.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_command_contract_gap
reasoning_tier: high
context_scope: fable_gui_command_wiring_gate_repair
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - future UI command dispatcher fixtures
node_compile_hint:
  mode: gui_command_contract_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md:fable-20260706-p1-ui-command-catalog-missing-families
preserved_exact_tokens:
  - cmd.theme.*
  - cmd.persona.*
  - cmd.alert.*
  - cmd.concern.*
  - cmd.model.refresh
  - cmd.model.list
  - cmd.chat.send
  - cmd.chat.stop
  - cmd.panel.undock
  - cmd.panel.redock
  - cmd.orchestrator.pause
  - cmd.orchestrator.resume
  - cmd.dashboard.add_widget
  - cmd.dashboard.catalog
  - resume_after_prerequisite
  - restore_safe_point_then_retry
  - start_fresh_attempt
  - replan
  - skip_node
  - abort_run
negative_constraints:
  - Do not duplicate existing FileManager CRUD command rows.
  - Do not treat command-catalog or wiring rows as runtime certification evidence.
  - Do not emit fabricated `*.command_applied` events.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```
