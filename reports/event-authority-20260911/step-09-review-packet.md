# Step 9 — partial dispositions and complete review inventory

Reviewed against `45b9d3984f0247e17669eee3a83bf8c4c0a32b66` on 2026-09-11. This records progress; Step 9 is incomplete.

All 252 assigned events were individually reviewed. This landing records six cited semantic exclusions and twenty rows on two unanswered product cards. No event was registered. The remaining 226 retain KEEP_QUARANTINED with their specific technical gaps and evidence listed in the three row reports. Technical work remaining is not a fourth final outcome.

The six exclusions use the existing RECLASSIFY_TO_EXCLUDED disposition. Their historical buckets and immutable cohort pins remain intact. The frozen census validator still derives its denominator from those buckets, so this landing claims zero represented denominator removals. Fixing that representation requires separate authority; the validator and freeze hashes were not edited.

## Progress by owner document

| Owner | Reviewed | Registered | Excluded | Carded | Remaining |
|---|---:|---:|---:|---:|---:|
| Plans/Contracts_V0.md | 9 | 0 | 0 | 0 | 9 |
| Plans/Executor_Protocol.md | 16 | 0 | 0 | 0 | 16 |
| Plans/FileManager.md | 12 | 0 | 0 | 0 | 12 |
| Plans/FileSafe.md | 9 | 0 | 0 | 0 | 9 |
| Plans/FinalGUISpec.md | 9 | 0 | 0 | 0 | 9 |
| Plans/Formatters_System.md | 1 | 0 | 0 | 0 | 1 |
| Plans/GitHub_API_Auth_and_Flows.md | 5 | 0 | 0 | 0 | 5 |
| Plans/LSPSupport.md | 1 | 0 | 0 | 0 | 1 |
| Plans/Models_System.md | 1 | 0 | 0 | 0 | 1 |
| Plans/Orchestrator_Page.md | 7 | 0 | 0 | 0 | 7 |
| Plans/Personas.md | 6 | 0 | 0 | 0 | 6 |
| Plans/Planning_Wizard.md | 3 | 0 | 3 | 0 | 0 |
| Plans/Plugins_System.md | 8 | 0 | 0 | 0 | 8 |
| Plans/Progression_Gates.md | 4 | 0 | 0 | 0 | 4 |
| Plans/Project_System.md | 2 | 0 | 0 | 0 | 2 |
| Plans/Prompt_Pipeline.md | 2 | 0 | 0 | 0 | 2 |
| Plans/Runtime_Artifacts_Panel.md | 19 | 0 | 0 | 19 | 0 |
| Plans/Section15_MVP_Promoted_Features_Spec.md | 23 | 0 | 0 | 0 | 23 |
| Plans/Settings_System.md | 2 | 0 | 0 | 0 | 2 |
| Plans/Source_Control_System.md | 1 | 0 | 0 | 0 | 1 |
| Plans/ToDo_Runtime.md | 1 | 0 | 1 | 0 | 0 |
| Plans/Tools.md | 4 | 0 | 0 | 0 | 4 |
| Plans/Widget_System.md | 1 | 0 | 0 | 0 | 1 |
| Plans/WorktreeGitImprovement.md | 3 | 0 | 0 | 0 | 3 |
| Plans/assistant-chat-design.md | 21 | 0 | 2 | 1 | 18 |
| Plans/assistant-memory-subsystem.md | 20 | 0 | 0 | 0 | 20 |
| Plans/chain-wizard-flexibility.md | 8 | 0 | 0 | 0 | 8 |
| Plans/human-in-the-loop.md | 4 | 0 | 0 | 0 | 4 |
| Plans/newtools.md | 7 | 0 | 0 | 0 | 7 |
| Plans/orchestrator-subagent-integration.md | 40 | 0 | 0 | 0 | 40 |
| Plans/storage-plan.md | 2 | 0 | 0 | 0 | 2 |
| Plans/usage-feature.md | 1 | 0 | 0 | 0 | 1 |
| **Total** | **252** | **0** | **6** | **20** | **226** |

## Product decisions returned

These cards are available for review now; the one-at-a-time interactive questions remain queued behind the pending Step 8 account-history question. No answer has been inferred.

| Owner | Question | Rows | Card |
|---|---|---:|---|
| Assistant Chat | Should task-failure notifications be rebuilt from canonical child-run history, or have a separate durable event? | 1 | [Task failure](step-09-execution-cards.md#ea-s09-exec-task-failure--task-failure-history) |
| Runtime Artifacts with Storage | Should all nineteen artifact event types receive the recommended indefinite retention policy, subject to existing access, redaction, hold and deletion rules? | 19 | [Artifact retention](step-09-runtime-artifact-retention-card.md) |

A card outcome returns a genuine product question. It neither supplies a response nor waives the remaining event contract requirements. The artifact payloads can contain text; deleting a linked body does not automatically remove inline content.

The existing unanswered Step 8 questions are account-switch history, the Continue-loop diagnostic and Doctor media-check output; their full cards remain in [the ambiguous-queue packet](step-08-ambiguous-cards.md). The Settings and historical To-Do identity answers were applied at `bf898b16`.

## Recorded exclusions

- `chat.plan_todo_updated` — Jared approved the historical-read/future-To-Do transition in DL-042. TDR-012 makes chat.plan_todo_updated a historical readable identity, routes future durable mutations through individually admitted ToDoController events, and expressly forbids fallback new legacy appends. The current producer identity is retired; historical access, retention, deletion rules and original bytes remain preserved. No alias to todo.updated or another event is inferred.
- `context.compaction.failed` — The Command Catalog expressly retires the former started/completed/failed emission instruction and retains context.compaction.failed as a non-emitting historical spelling. Existing failure, retry and receipt state remains visible. This is retirement of this exact current producer requirement, not an alias to the registered completion event.
- `context.compaction.started` — The Command Catalog expressly retires the former started/completed/failed emission instruction and retains context.compaction.started as a non-emitting historical spelling. Existing in-progress result/receipt state remains visible. This is retirement of this exact current producer requirement, not an alias to the registered completion event.
- `onboarding.free_models_refresh_retried` — The exact free-model retry effect is retained only in the retired cmd.onboarding.free_models.retry row. Current typed local Onboarding actions route actual work to existing target-owner commands. The former retry spelling remains source lineage, with no current producer, handler, alias or production row.
- `onboarding.free_models_refreshed` — The exact free-model refresh effect is retained only in the retired cmd.onboarding.free_models.refresh row. The current catalog replaces those former command rows with typed local Onboarding actions and routes actual work to existing target-owner commands; this retired effect receives no producer or production row.
- `onboarding.provider_setup_opened` — The exact provider-setup-open effect is retained only in the retired cmd.onboarding.free_models.setup row. Current Onboarding routes through the existing target-owner command and typed local action boundary. This former effect remains source lineage rather than a current EventRecord producer requirement.

Exact owner citations and preserved-row evidence are in [the exclusion application](step-09-semantic-exclusion-application.json); [the card application](step-09-card-application.json) binds the twenty NEEDS_OWNER_VETO records to the two cards.

## Remaining work by owner

Every event below remains unfinished. Its linked row report supplies the event-specific reason, cited owner text, payload status, retention and binding gaps. Names alone are not evidence of registration or a complete contract.

### Plans/Contracts_V0.md

- `debug.investigation.context_item_added` — [step-09-extensions-rows.jsonl, row 8](step-09-extensions-rows.jsonl)
- `debug.investigation.context_item_state_changed` — [step-09-extensions-rows.jsonl, row 9](step-09-extensions-rows.jsonl)
- `debug.investigation.exported` — [step-09-extensions-rows.jsonl, row 10](step-09-extensions-rows.jsonl)
- `debug.investigation.imported` — [step-09-extensions-rows.jsonl, row 11](step-09-extensions-rows.jsonl)
- `debug.investigation.instrumentation_state_changed` — [step-09-extensions-rows.jsonl, row 12](step-09-extensions-rows.jsonl)
- `debug.investigation.started` — [step-09-extensions-rows.jsonl, row 13](step-09-extensions-rows.jsonl)
- `debug.investigation.state_changed` — [step-09-extensions-rows.jsonl, row 14](step-09-extensions-rows.jsonl)
- `debug.investigation.target_bound` — [step-09-extensions-rows.jsonl, row 15](step-09-extensions-rows.jsonl)
- `debug.investigation.verification_recorded` — [step-09-extensions-rows.jsonl, row 16](step-09-extensions-rows.jsonl)

### Plans/Executor_Protocol.md

- `attempt.completed` — [step-09-execution-rows.jsonl, row 1](step-09-execution-rows.jsonl)
- `attempt.started` — [step-09-execution-rows.jsonl, row 2](step-09-execution-rows.jsonl)
- `node.blocked` — [step-09-execution-rows.jsonl, row 3](step-09-execution-rows.jsonl)
- `node.completed` — [step-09-execution-rows.jsonl, row 4](step-09-execution-rows.jsonl)
- `node.started` — [step-09-execution-rows.jsonl, row 5](step-09-execution-rows.jsonl)
- `node.unblocked` — [step-09-execution-rows.jsonl, row 6](step-09-execution-rows.jsonl)
- `plan.decomposition_degraded` — [step-09-execution-rows.jsonl, row 7](step-09-execution-rows.jsonl)
- `remediation.resolved` — [step-09-execution-rows.jsonl, row 8](step-09-execution-rows.jsonl)
- `remediation.spawned` — [step-09-execution-rows.jsonl, row 9](step-09-execution-rows.jsonl)
- `run.completed` — [step-09-execution-rows.jsonl, row 10](step-09-execution-rows.jsonl)
- `run.graph_integrity_failed` — [step-09-execution-rows.jsonl, row 11](step-09-execution-rows.jsonl)
- `run.node_backoff_expired` — [step-09-execution-rows.jsonl, row 12](step-09-execution-rows.jsonl)
- `run.node_backoff_started` — [step-09-execution-rows.jsonl, row 13](step-09-execution-rows.jsonl)
- `run.node_ready` — [step-09-execution-rows.jsonl, row 14](step-09-execution-rows.jsonl)
- `run.node_retry_scheduled` — [step-09-execution-rows.jsonl, row 15](step-09-execution-rows.jsonl)
- `scheduler.pass` — [step-09-execution-rows.jsonl, row 16](step-09-execution-rows.jsonl)

### Plans/FileManager.md

- `file.copied` — [step-09-extensions-rows.jsonl, row 22](step-09-extensions-rows.jsonl)
- `file.created` — [step-09-extensions-rows.jsonl, row 23](step-09-extensions-rows.jsonl)
- `file.deleted` — [step-09-extensions-rows.jsonl, row 24](step-09-extensions-rows.jsonl)
- `file.exported` — [step-09-extensions-rows.jsonl, row 25](step-09-extensions-rows.jsonl)
- `file.moved` — [step-09-extensions-rows.jsonl, row 26](step-09-extensions-rows.jsonl)
- `file.renamed` — [step-09-extensions-rows.jsonl, row 27](step-09-extensions-rows.jsonl)
- `folder.copied` — [step-09-extensions-rows.jsonl, row 35](step-09-extensions-rows.jsonl)
- `folder.created` — [step-09-extensions-rows.jsonl, row 36](step-09-extensions-rows.jsonl)
- `folder.deleted` — [step-09-extensions-rows.jsonl, row 37](step-09-extensions-rows.jsonl)
- `folder.exported` — [step-09-extensions-rows.jsonl, row 38](step-09-extensions-rows.jsonl)
- `folder.moved` — [step-09-extensions-rows.jsonl, row 39](step-09-extensions-rows.jsonl)
- `folder.renamed` — [step-09-extensions-rows.jsonl, row 40](step-09-extensions-rows.jsonl)

### Plans/FileSafe.md

- `filesafe.command_denied` — [step-09-extensions-rows.jsonl, row 28](step-09-extensions-rows.jsonl)
- `filesafe.destructive_override_denied` — [step-09-extensions-rows.jsonl, row 29](step-09-extensions-rows.jsonl)
- `filesafe.destructive_override_granted` — [step-09-extensions-rows.jsonl, row 30](step-09-extensions-rows.jsonl)
- `filesafe.destructive_override_requested` — [step-09-extensions-rows.jsonl, row 31](step-09-extensions-rows.jsonl)
- `filesafe.guard_init_failed` — [step-09-extensions-rows.jsonl, row 32](step-09-extensions-rows.jsonl)
- `filesafe.path_denied` — [step-09-extensions-rows.jsonl, row 33](step-09-extensions-rows.jsonl)
- `filesafe.policy_degraded` — [step-09-extensions-rows.jsonl, row 34](step-09-extensions-rows.jsonl)
- `safe_point.created` — [step-09-execution-rows.jsonl, row 17](step-09-execution-rows.jsonl)
- `safe_point.restored` — [step-09-execution-rows.jsonl, row 18](step-09-execution-rows.jsonl)

### Plans/FinalGUISpec.md

- `alert.acknowledged` — [step-09-interaction-rows.jsonl, row 1](step-09-interaction-rows.jsonl)
- `alert.dismissed` — [step-09-interaction-rows.jsonl, row 2](step-09-interaction-rows.jsonl)
- `alert.rule_muted` — [step-09-interaction-rows.jsonl, row 3](step-09-interaction-rows.jsonl)
- `alert.snoozed` — [step-09-interaction-rows.jsonl, row 4](step-09-interaction-rows.jsonl)
- `bundle.annotation_state_changed` — [step-09-interaction-rows.jsonl, row 20](step-09-interaction-rows.jsonl)
- `bundle.note_created` — [step-09-interaction-rows.jsonl, row 21](step-09-interaction-rows.jsonl)
- `bundle.note_status_changed` — [step-09-interaction-rows.jsonl, row 22](step-09-interaction-rows.jsonl)
- `panel.redocked` — [step-09-interaction-rows.jsonl, row 61](step-09-interaction-rows.jsonl)
- `panel.undocked` — [step-09-interaction-rows.jsonl, row 62](step-09-interaction-rows.jsonl)

### Plans/Formatters_System.md

- `format.applied` — [step-09-extensions-rows.jsonl, row 41](step-09-extensions-rows.jsonl)

### Plans/GitHub_API_Auth_and_Flows.md

- `auth.github.authenticated` — [step-09-interaction-rows.jsonl, row 5](step-09-interaction-rows.jsonl)
- `auth.github.device_code.issued` — [step-09-interaction-rows.jsonl, row 6](step-09-interaction-rows.jsonl)
- `auth.github.disconnected` — [step-09-interaction-rows.jsonl, row 7](step-09-interaction-rows.jsonl)
- `auth.github.failed` — [step-09-interaction-rows.jsonl, row 8](step-09-interaction-rows.jsonl)
- `auth.github.token.polling` — [step-09-interaction-rows.jsonl, row 9](step-09-interaction-rows.jsonl)

### Plans/LSPSupport.md

- `lsp.server.lifecycle_changed` — [step-09-extensions-rows.jsonl, row 47](step-09-extensions-rows.jsonl)

### Plans/Models_System.md

- `model.catalog_refreshed` — [step-09-extensions-rows.jsonl, row 68](step-09-extensions-rows.jsonl)

### Plans/Orchestrator_Page.md

- `concern.assigned` — [step-09-interaction-rows.jsonl, row 46](step-09-interaction-rows.jsonl)
- `concern.created` — [step-09-interaction-rows.jsonl, row 47](step-09-interaction-rows.jsonl)
- `concern.evidence_linked` — [step-09-interaction-rows.jsonl, row 48](step-09-interaction-rows.jsonl)
- `concern.promoted` — [step-09-interaction-rows.jsonl, row 49](step-09-interaction-rows.jsonl)
- `concern.reopened` — [step-09-interaction-rows.jsonl, row 50](step-09-interaction-rows.jsonl)
- `concern.resolved` — [step-09-interaction-rows.jsonl, row 51](step-09-interaction-rows.jsonl)
- `concern.updated` — [step-09-interaction-rows.jsonl, row 52](step-09-interaction-rows.jsonl)

### Plans/Personas.md

- `persona.created` — [step-09-extensions-rows.jsonl, row 70](step-09-extensions-rows.jsonl)
- `persona.deleted` — [step-09-extensions-rows.jsonl, row 71](step-09-extensions-rows.jsonl)
- `persona.exported` — [step-09-extensions-rows.jsonl, row 72](step-09-extensions-rows.jsonl)
- `persona.imported` — [step-09-extensions-rows.jsonl, row 73](step-09-extensions-rows.jsonl)
- `persona.selected` — [step-09-extensions-rows.jsonl, row 74](step-09-extensions-rows.jsonl)
- `persona.updated` — [step-09-extensions-rows.jsonl, row 75](step-09-extensions-rows.jsonl)

### Plans/Plugins_System.md

- `plugin.hook.blocked` — [step-09-extensions-rows.jsonl, row 76](step-09-extensions-rows.jsonl)
- `plugin.hook.error` — [step-09-extensions-rows.jsonl, row 77](step-09-extensions-rows.jsonl)
- `plugin.hook.invoked` — [step-09-extensions-rows.jsonl, row 78](step-09-extensions-rows.jsonl)
- `plugin.load_failed` — [step-09-extensions-rows.jsonl, row 79](step-09-extensions-rows.jsonl)
- `plugin.loaded` — [step-09-extensions-rows.jsonl, row 80](step-09-extensions-rows.jsonl)
- `plugin.permission.override` — [step-09-extensions-rows.jsonl, row 81](step-09-extensions-rows.jsonl)
- `plugin.tool.collision` — [step-09-extensions-rows.jsonl, row 82](step-09-extensions-rows.jsonl)
- `plugin.tool.registered` — [step-09-extensions-rows.jsonl, row 83](step-09-extensions-rows.jsonl)

### Plans/Progression_Gates.md

- `gate.evaluation_started` — [step-09-execution-rows.jsonl, row 19](step-09-execution-rows.jsonl)
- `gate.failed` — [step-09-execution-rows.jsonl, row 20](step-09-execution-rows.jsonl)
- `gate.passed` — [step-09-execution-rows.jsonl, row 21](step-09-execution-rows.jsonl)
- `requirements.clarification_requested` — [step-09-execution-rows.jsonl, row 22](step-09-execution-rows.jsonl)

### Plans/Project_System.md

- `project.added` — [step-09-interaction-rows.jsonl, row 66](step-09-interaction-rows.jsonl)
- `project.created` — [step-09-interaction-rows.jsonl, row 67](step-09-interaction-rows.jsonl)

### Plans/Prompt_Pipeline.md

- `subagent.context_rehydrated` — [step-09-execution-rows.jsonl, row 23](step-09-execution-rows.jsonl)
- `subagent.context_shrunk` — [step-09-execution-rows.jsonl, row 24](step-09-execution-rows.jsonl)

### Plans/Section15_MVP_Promoted_Features_Spec.md

- `browser.context_captured` — [step-09-interaction-rows.jsonl, row 10](step-09-interaction-rows.jsonl)
- `browser.context_share_revoked` — [step-09-interaction-rows.jsonl, row 11](step-09-interaction-rows.jsonl)
- `browser.context_shared` — [step-09-interaction-rows.jsonl, row 12](step-09-interaction-rows.jsonl)
- `browser.session.closed` — [step-09-interaction-rows.jsonl, row 13](step-09-interaction-rows.jsonl)
- `browser.session.created` — [step-09-interaction-rows.jsonl, row 14](step-09-interaction-rows.jsonl)
- `browser.session.navigated` — [step-09-interaction-rows.jsonl, row 15](step-09-interaction-rows.jsonl)
- `browser.session.promoted` — [step-09-interaction-rows.jsonl, row 16](step-09-interaction-rows.jsonl)
- `browser.session.resized` — [step-09-interaction-rows.jsonl, row 17](step-09-interaction-rows.jsonl)
- `browser.session.state_changed` — [step-09-interaction-rows.jsonl, row 18](step-09-interaction-rows.jsonl)
- `browser.session.takeover_state_changed` — [step-09-interaction-rows.jsonl, row 19](step-09-interaction-rows.jsonl)
- `catalog.install.completed` — [step-09-extensions-rows.jsonl, row 1](step-09-extensions-rows.jsonl)
- `catalog.install.started` — [step-09-extensions-rows.jsonl, row 2](step-09-extensions-rows.jsonl)
- `catalog.remove.completed` — [step-09-extensions-rows.jsonl, row 3](step-09-extensions-rows.jsonl)
- `catalog.remove.started` — [step-09-extensions-rows.jsonl, row 4](step-09-extensions-rows.jsonl)
- `catalog.update.completed` — [step-09-extensions-rows.jsonl, row 5](step-09-extensions-rows.jsonl)
- `catalog.update.started` — [step-09-extensions-rows.jsonl, row 6](step-09-extensions-rows.jsonl)
- `dev.session.restarting` — [step-09-extensions-rows.jsonl, row 17](step-09-extensions-rows.jsonl)
- `dev.session.started` — [step-09-extensions-rows.jsonl, row 18](step-09-extensions-rows.jsonl)
- `dev.session.stopped` — [step-09-extensions-rows.jsonl, row 19](step-09-extensions-rows.jsonl)
- `dev.session.stopping` — [step-09-extensions-rows.jsonl, row 20](step-09-extensions-rows.jsonl)
- `preview.session.refreshed` — [step-09-interaction-rows.jsonl, row 63](step-09-interaction-rows.jsonl)
- `preview.session.started` — [step-09-interaction-rows.jsonl, row 64](step-09-interaction-rows.jsonl)
- `preview.session.stopped` — [step-09-interaction-rows.jsonl, row 65](step-09-interaction-rows.jsonl)

### Plans/Settings_System.md

- `settings.theme.updated` — [step-09-interaction-rows.jsonl, row 68](step-09-interaction-rows.jsonl)
- `settings.updated` — [step-09-interaction-rows.jsonl, row 69](step-09-interaction-rows.jsonl)

### Plans/Source_Control_System.md

- `git.clone.completed` — [step-09-interaction-rows.jsonl, row 57](step-09-interaction-rows.jsonl)

### Plans/Tools.md

- `tool.denied` — [step-09-extensions-rows.jsonl, row 85](step-09-extensions-rows.jsonl)
- `tool.execution_completed` — [step-09-extensions-rows.jsonl, row 86](step-09-extensions-rows.jsonl)
- `tool.execution_started` — [step-09-extensions-rows.jsonl, row 87](step-09-extensions-rows.jsonl)
- `tool.invoked` — [step-09-extensions-rows.jsonl, row 88](step-09-extensions-rows.jsonl)

### Plans/Widget_System.md

- `dashboard.widget_added` — [step-09-interaction-rows.jsonl, row 56](step-09-interaction-rows.jsonl)

### Plans/WorktreeGitImprovement.md

- `config.migrated` — [step-09-interaction-rows.jsonl, row 53](step-09-interaction-rows.jsonl)
- `worktree.created` — [step-09-interaction-rows.jsonl, row 74](step-09-interaction-rows.jsonl)
- `worktree.deleted` — [step-09-interaction-rows.jsonl, row 75](step-09-interaction-rows.jsonl)

### Plans/assistant-chat-design.md

- `bundle.selection_forward_blocked` — [step-09-interaction-rows.jsonl, row 27](step-09-interaction-rows.jsonl)
- `bundle.selection_sent_to_chat` — [step-09-interaction-rows.jsonl, row 28](step-09-interaction-rows.jsonl)
- `chat.message` — [step-09-interaction-rows.jsonl, row 29](step-09-interaction-rows.jsonl)
- `chat.response_stop_requested` — [step-09-interaction-rows.jsonl, row 31](step-09-interaction-rows.jsonl)
- `chat.thread_archived` — [step-09-interaction-rows.jsonl, row 32](step-09-interaction-rows.jsonl)
- `chat.thread_created` — [step-09-interaction-rows.jsonl, row 33](step-09-interaction-rows.jsonl)
- `chat.thread_deleted` — [step-09-interaction-rows.jsonl, row 34](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_bound` — [step-09-interaction-rows.jsonl, row 35](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_create_failed` — [step-09-interaction-rows.jsonl, row 36](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_merge_failed` — [step-09-interaction-rows.jsonl, row 37](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_merged` — [step-09-interaction-rows.jsonl, row 38](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_pr_created` — [step-09-interaction-rows.jsonl, row 39](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_pr_failed` — [step-09-interaction-rows.jsonl, row 40](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_pre_merge_test_failed` — [step-09-interaction-rows.jsonl, row 41](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_pre_merge_test_passed` — [step-09-interaction-rows.jsonl, row 42](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_pre_merge_test_started` — [step-09-interaction-rows.jsonl, row 43](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_renamed` — [step-09-interaction-rows.jsonl, row 44](step-09-interaction-rows.jsonl)
- `chat.thread_worktree_unbound` — [step-09-interaction-rows.jsonl, row 45](step-09-interaction-rows.jsonl)

### Plans/assistant-memory-subsystem.md

- `memory.dedup_sweep.completed` — [step-09-extensions-rows.jsonl, row 48](step-09-extensions-rows.jsonl)
- `memory.dedup_sweep.started` — [step-09-extensions-rows.jsonl, row 49](step-09-extensions-rows.jsonl)
- `memory.gist.discarded` — [step-09-extensions-rows.jsonl, row 50](step-09-extensions-rows.jsonl)
- `memory.gist.pinned` — [step-09-extensions-rows.jsonl, row 51](step-09-extensions-rows.jsonl)
- `memory.gist.unpinned` — [step-09-extensions-rows.jsonl, row 52](step-09-extensions-rows.jsonl)
- `memory.gist.updated` — [step-09-extensions-rows.jsonl, row 53](step-09-extensions-rows.jsonl)
- `memory.gist.verification_failed` — [step-09-extensions-rows.jsonl, row 54](step-09-extensions-rows.jsonl)
- `memory.gist.verification_requested` — [step-09-extensions-rows.jsonl, row 55](step-09-extensions-rows.jsonl)
- `memory.gist.verified` — [step-09-extensions-rows.jsonl, row 56](step-09-extensions-rows.jsonl)
- `memory.gist_state_changed` — [step-09-extensions-rows.jsonl, row 57](step-09-extensions-rows.jsonl)
- `memory.index.lexical.rebuild.completed` — [step-09-extensions-rows.jsonl, row 58](step-09-extensions-rows.jsonl)
- `memory.index.lexical.rebuild.started` — [step-09-extensions-rows.jsonl, row 59](step-09-extensions-rows.jsonl)
- `memory.index.semantic.rebuild.completed` — [step-09-extensions-rows.jsonl, row 60](step-09-extensions-rows.jsonl)
- `memory.index.semantic.rebuild.started` — [step-09-extensions-rows.jsonl, row 61](step-09-extensions-rows.jsonl)
- `memory.monthly_summary.completed` — [step-09-extensions-rows.jsonl, row 62](step-09-extensions-rows.jsonl)
- `memory.monthly_summary.started` — [step-09-extensions-rows.jsonl, row 63](step-09-extensions-rows.jsonl)
- `memory.prune_archive.completed` — [step-09-extensions-rows.jsonl, row 64](step-09-extensions-rows.jsonl)
- `memory.prune_archive.started` — [step-09-extensions-rows.jsonl, row 65](step-09-extensions-rows.jsonl)
- `memory.verification_sweep.completed` — [step-09-extensions-rows.jsonl, row 66](step-09-extensions-rows.jsonl)
- `memory.verification_sweep.started` — [step-09-extensions-rows.jsonl, row 67](step-09-extensions-rows.jsonl)

### Plans/chain-wizard-flexibility.md

- `bundle.revision_completed` — [step-09-interaction-rows.jsonl, row 23](step-09-interaction-rows.jsonl)
- `bundle.revision_interrupted` — [step-09-interaction-rows.jsonl, row 24](step-09-interaction-rows.jsonl)
- `bundle.revision_requested` — [step-09-interaction-rows.jsonl, row 25](step-09-interaction-rows.jsonl)
- `bundle.revision_started` — [step-09-interaction-rows.jsonl, row 26](step-09-interaction-rows.jsonl)
- `wizard.blocked` — [step-09-interaction-rows.jsonl, row 70](step-09-interaction-rows.jsonl)
- `wizard.deferred_payload.loaded` — [step-09-interaction-rows.jsonl, row 71](step-09-interaction-rows.jsonl)
- `wizard.opened` — [step-09-interaction-rows.jsonl, row 72](step-09-interaction-rows.jsonl)
- `wizard.unblocked` — [step-09-interaction-rows.jsonl, row 73](step-09-interaction-rows.jsonl)

### Plans/human-in-the-loop.md

- `approval.denied` — [step-09-execution-rows.jsonl, row 45](step-09-execution-rows.jsonl)
- `approval.granted` — [step-09-execution-rows.jsonl, row 46](step-09-execution-rows.jsonl)
- `approval.requested` — [step-09-execution-rows.jsonl, row 47](step-09-execution-rows.jsonl)
- `approval.timeout` — [step-09-execution-rows.jsonl, row 48](step-09-execution-rows.jsonl)

### Plans/newtools.md

- `doctor.custom_headless.checked` — [step-09-extensions-rows.jsonl, row 21](step-09-extensions-rows.jsonl)
- `live.artifact.created` — [step-09-extensions-rows.jsonl, row 42](step-09-extensions-rows.jsonl)
- `live.session.completed` — [step-09-extensions-rows.jsonl, row 43](step-09-extensions-rows.jsonl)
- `live.session.degraded` — [step-09-extensions-rows.jsonl, row 44](step-09-extensions-rows.jsonl)
- `live.session.started` — [step-09-extensions-rows.jsonl, row 45](step-09-extensions-rows.jsonl)
- `live.step.updated` — [step-09-extensions-rows.jsonl, row 46](step-09-extensions-rows.jsonl)
- `tool.custom_headless.skipped` — [step-09-extensions-rows.jsonl, row 84](step-09-extensions-rows.jsonl)

### Plans/orchestrator-subagent-integration.md

- `config.validation.failed` — [step-09-extensions-rows.jsonl, row 7](step-09-extensions-rows.jsonl)
- `coordination.agent_aborted` — [step-09-execution-rows.jsonl, row 49](step-09-execution-rows.jsonl)
- `coordination.agent_crashed` — [step-09-execution-rows.jsonl, row 50](step-09-execution-rows.jsonl)
- `coordination.agent_file_ownership_updated` — [step-09-execution-rows.jsonl, row 51](step-09-execution-rows.jsonl)
- `coordination.agent_operation_updated` — [step-09-execution-rows.jsonl, row 52](step-09-execution-rows.jsonl)
- `coordination.agent_registered` — [step-09-execution-rows.jsonl, row 53](step-09-execution-rows.jsonl)
- `coordination.agent_status_updated` — [step-09-execution-rows.jsonl, row 54](step-09-execution-rows.jsonl)
- `coordination.agent_unregistered` — [step-09-execution-rows.jsonl, row 55](step-09-execution-rows.jsonl)
- `crew.board_message_posted` — [step-09-execution-rows.jsonl, row 56](step-09-execution-rows.jsonl)
- `crew.board_message_read` — [step-09-execution-rows.jsonl, row 57](step-09-execution-rows.jsonl)
- `crew.board_messages_archived` — [step-09-execution-rows.jsonl, row 58](step-09-execution-rows.jsonl)
- `crew.completed` — [step-09-execution-rows.jsonl, row 59](step-09-execution-rows.jsonl)
- `crew.coordination` — [step-09-execution-rows.jsonl, row 60](step-09-execution-rows.jsonl)
- `crew.disbanded` — [step-09-execution-rows.jsonl, row 61](step-09-execution-rows.jsonl)
- `crew.formed` — [step-09-execution-rows.jsonl, row 62](step-09-execution-rows.jsonl)
- `crew.member_added` — [step-09-execution-rows.jsonl, row 63](step-09-execution-rows.jsonl)
- `crew.member_removed` — [step-09-execution-rows.jsonl, row 64](step-09-execution-rows.jsonl)
- `parser.error` — [step-09-extensions-rows.jsonl, row 69](step-09-extensions-rows.jsonl)
- `phase.force_completed` — [step-09-execution-rows.jsonl, row 65](step-09-execution-rows.jsonl)
- `subagent.budget_warning` — [step-09-execution-rows.jsonl, row 66](step-09-execution-rows.jsonl)
- `subagent.cancelled` — [step-09-execution-rows.jsonl, row 67](step-09-execution-rows.jsonl)
- `subagent.completed` — [step-09-execution-rows.jsonl, row 68](step-09-execution-rows.jsonl)
- `subagent.context_warning` — [step-09-execution-rows.jsonl, row 69](step-09-execution-rows.jsonl)
- `subagent.escalated` — [step-09-execution-rows.jsonl, row 70](step-09-execution-rows.jsonl)
- `subagent.failed` — [step-09-execution-rows.jsonl, row 71](step-09-execution-rows.jsonl)
- `subagent.message_received` — [step-09-execution-rows.jsonl, row 72](step-09-execution-rows.jsonl)
- `subagent.message_sent` — [step-09-execution-rows.jsonl, row 73](step-09-execution-rows.jsonl)
- `subagent.model_switched` — [step-09-execution-rows.jsonl, row 74](step-09-execution-rows.jsonl)
- `subagent.output_truncated` — [step-09-execution-rows.jsonl, row 75](step-09-execution-rows.jsonl)
- `subagent.paused` — [step-09-execution-rows.jsonl, row 76](step-09-execution-rows.jsonl)
- `subagent.progress` — [step-09-execution-rows.jsonl, row 77](step-09-execution-rows.jsonl)
- `subagent.resumed` — [step-09-execution-rows.jsonl, row 78](step-09-execution-rows.jsonl)
- `subagent.retried` — [step-09-execution-rows.jsonl, row 79](step-09-execution-rows.jsonl)
- `subagent.spawn_completed` — [step-09-execution-rows.jsonl, row 80](step-09-execution-rows.jsonl)
- `subagent.spawn_requested` — [step-09-execution-rows.jsonl, row 81](step-09-execution-rows.jsonl)
- `subagent.spawned` — [step-09-execution-rows.jsonl, row 82](step-09-execution-rows.jsonl)
- `subagent.started` — [step-09-execution-rows.jsonl, row 83](step-09-execution-rows.jsonl)
- `subagent.timeout` — [step-09-execution-rows.jsonl, row 84](step-09-execution-rows.jsonl)
- `subagent.tool_called` — [step-09-execution-rows.jsonl, row 85](step-09-execution-rows.jsonl)
- `subagent.tool_completed` — [step-09-execution-rows.jsonl, row 86](step-09-execution-rows.jsonl)

### Plans/storage-plan.md

- `coordination.debug_mirror_exported` — [step-09-execution-rows.jsonl, row 87](step-09-execution-rows.jsonl)
- `run.background_enqueued` — [step-09-execution-rows.jsonl, row 88](step-09-execution-rows.jsonl)

### Plans/usage-feature.md

- `usage.event` — [step-09-extensions-rows.jsonl, row 89](step-09-extensions-rows.jsonl)

## Validation and limits

Root validation passes: exact 252-row coverage, 1,430 citations across 77 source files, exactly 26 changed individual/census records, unchanged evidence cells and unrelated records, and twenty owner-veto records for two questions. The registry, schema and independent-validator bytes are unchanged. Shard verification passes for 98 documents and 2,167 shards.

The unchanged independent validator fails with six errors: `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_owner_veto_blocking`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete`, `unexpected_august_set`. These failures are retained as evidence; no Step 10 certification or seal is authorized by this result.

The review applies no general authority to invent consumer, projector or checkpoint identifiers. The existing DL-040 exception remains confined to compaction. Further technical work must establish exact existing bindings or obtain a bounded clarification where exhaustive source review demonstrates none. The [proposed technical-authority clarification](step-09-binding-authority-question.md) lists a fixed 285-family scope across Step 8 and Step 9; it is unanswered and changes no disposition or product decision.

Raw verification evidence (path plus SHA-256):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09/final-integration/post-rebase-45b/root-application-validation.json` — `308e4085cdd9d3bf04cde66918e930da2660a84832c5330fdd1e72657b1e1ad1`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09/final-integration/post-rebase-45b/independent-validator.stdout` — `96751a1728d1b5163fcce7e7c6fd0952d9eec0baae946237cdaefdf18f654ed1`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09/final-integration/post-rebase-45b/independent-validator-receipts/event_authority_validator_receipt.json` — `a9a8c8a9e56b158e260998f68f983e51f63d68d9c14081cefc236eefd13d68ed`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09/final-integration/post-rebase-45b/shard-check.stdout` — `30fa5fdacb748eaf9036b7b2b97ab5268051d2d86fe0f6cfddbe006848af0644`

Cost: three Astra medium review agents plus root adjudication and integration; token/dollar billing unavailable.
