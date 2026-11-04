# DO — Event Authority wave 2, 2026-11-04

**Branch:** `plans/ea-w2-orchestrator-20261104`, based on `origin/main` `be4766513f`. Prepared without admission. No registry, Decision Log, admission record, governance seal or main push. Worktree retained for integration at `/home/sittingmongoose/pm-worktrees/DO`.

## Per-row result

| Family | Owner | Outcome | Self-grade | New operating reader |
|---|---|---|---|---|
| `config.validation.failed` | OSI-680 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.config_validation_failed.history.v1@1.0.0` |
| `crew.board_message_posted` | OSI-681 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.crew_board_message_posted.history.v1@1.0.0` |
| `crew.board_message_read` | OSI-682 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.crew_board_message_read.history.v1@1.0.0` |
| `crew.board_messages_archived` | OSI-683 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.crew_board_messages_archived.history.v1@1.0.0` |
| `parser.error` | OSI-684 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.parser_error.history.v1@1.0.0` |
| `phase.force_completed` | OSI-685 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.phase_force_completed.history.v1@1.0.0` |
| `subagent.budget_warning` | OSI-686 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_budget_warning.history.v1@1.0.0` |
| `subagent.cancelled` | OSI-687 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_cancelled.history.v1@1.0.0` |
| `subagent.completed` | OSI-688 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_completed.history.v1@1.0.0` |
| `subagent.context_warning` | OSI-689 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_context_warning.history.v1@1.0.0` |
| `subagent.escalated` | OSI-690 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_escalated.history.v1@1.0.0` |
| `subagent.failed` | OSI-691 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_failed.history.v1@1.0.0` |
| `subagent.message_received` | OSI-692 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_message_received.history.v1@1.0.0` |
| `subagent.message_sent` | OSI-693 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_message_sent.history.v1@1.0.0` |
| `subagent.model_switched` | OSI-694 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_model_switched.history.v1@1.0.0` |
| `subagent.output_truncated` | OSI-695 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_output_truncated.history.v1@1.0.0` |
| `subagent.paused` | OSI-696 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_paused.history.v1@1.0.0` |
| `subagent.progress` | OSI-697 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_progress.history.v1@1.0.0` |
| `subagent.resumed` | OSI-698 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_resumed.history.v1@1.0.0` |
| `subagent.retried` | OSI-699 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_retried.history.v1@1.0.0` |
| `subagent.spawned` | OSI-700 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_spawned.history.v1@1.0.0` |
| `subagent.started` | OSI-701 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_started.history.v1@1.0.0` |
| `subagent.timeout` | OSI-702 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_timeout.history.v1@1.0.0` |
| `subagent.tool_called` | OSI-703 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_tool_called.history.v1@1.0.0` |
| `subagent.tool_completed` | OSI-704 | register (prepared without admission) | 10 PASS; retention PARTIAL; membership ABSENT | `reader.orchestrator.subagent_tool_completed.history.v1@1.0.0` |

## Newly authored owner contracts and search evidence

Every row has its own OSI unit and closed schema definition. Each unit independently states producer/ordering, scope and identity, receipt recovery, read/index/checkpoint adoption, custody, retention dependency, transitions, compatibility, withdrawal and exact-family oracles. No family is inferred from a sibling.

Before drafting, each exact family was searched independently across current Plans Markdown and JSON, including Contracts, Storage, schema and value-registry definitions. Source-lineage/generated hits were inspected only as leads; they do not supply authority. The existing subagent and board payload-minima tables were reused; diagnostics reuse the Orchestrator parser, config-validation and soft-cap passages. Exact new reader identifiers and the ea-do-v1 identity recipe had no prior definition. The complete per-family negative/positive search transcript is external evidence below. No existing family-local closed schemas or complete family-local writer/reader contracts were found for these 25 rows.

| Family | Reused current source | New technical bindings |
|---|---|---|
| `config.validation.failed` | Plans/orchestrator-subagent-integration.md:1336 | OSI-680: `Orchestrator backend config validator / reject unknown subagent`; `reader.orchestrator.config_validation_failed.history.v1@1.0.0`; `config_validation_failed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `crew.board_message_posted` | Plans/orchestrator-subagent-integration.md:4770; Plans/orchestrator-subagent-integration.md:24161; Plans/Contracts_V0.md:3074 | OSI-681: `AgentCoordinator / post board message`; `reader.orchestrator.crew_board_message_posted.history.v1@1.0.0`; `crew_board_message_posted` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `crew.board_message_read` | Plans/orchestrator-subagent-integration.md:4831; Plans/Contracts_V0.md:3075 | OSI-682: `AgentCoordinator / acknowledge board read`; `reader.orchestrator.crew_board_message_read.history.v1@1.0.0`; `crew_board_message_read` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `crew.board_messages_archived` | Plans/orchestrator-subagent-integration.md:4839; Plans/Contracts_V0.md:3076 | OSI-683: `AgentCoordinator / archive stale board messages`; `reader.orchestrator.crew_board_messages_archived.history.v1@1.0.0`; `crew_board_messages_archived` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `parser.error` | Plans/orchestrator-subagent-integration.md:1223; Plans/orchestrator-subagent-integration.md:11762; Plans/orchestrator-subagent-integration.md:11797 | OSI-684: `Provider output parser / record parse failure`; `reader.orchestrator.parser_error.history.v1@1.0.0`; `parser_error` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `phase.force_completed` | Plans/orchestrator-subagent-integration.md:1442; Plans/orchestrator-subagent-integration.md:11526; Plans/orchestrator-subagent-integration.md:11561 | OSI-685: `Interview PhaseManager / enforce soft cap`; `reader.orchestrator.phase_force_completed.history.v1@1.0.0`; `phase_force_completed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.budget_warning` | Plans/Contracts_V0.md:3013; Plans/Contracts_V0.md:16733; Plans/Contracts_V0.md:16761 | OSI-686: `Child budget monitor / report threshold`; `reader.orchestrator.subagent_budget_warning.history.v1@1.0.0`; `subagent_budget_warning` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.cancelled` | Plans/Contracts_V0.md:3005; Plans/Contracts_V0.md:16635; Plans/Contracts_V0.md:16643 | OSI-687: `Child cancellation owner / settle cancellation`; `reader.orchestrator.subagent_cancelled.history.v1@1.0.0`; `subagent_cancelled` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.completed` | Plans/Contracts_V0.md:1471; Plans/Contracts_V0.md:3003; Plans/Contracts_V0.md:9022 | OSI-688: `Child executor / complete child`; `reader.orchestrator.subagent_completed.history.v1@1.0.0`; `subagent_completed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.context_warning` | Plans/Contracts_V0.md:3008; Plans/Contracts_V0.md:16732; Plans/Contracts_V0.md:16759 | OSI-689: `Child context monitor / report threshold`; `reader.orchestrator.subagent_context_warning.history.v1@1.0.0`; `subagent_context_warning` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.escalated` | Plans/Contracts_V0.md:3014; Plans/Contracts_V0.md:16733; Plans/Contracts_V0.md:16762 | OSI-690: `Child escalation owner / notify parent`; `reader.orchestrator.subagent_escalated.history.v1@1.0.0`; `subagent_escalated` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.failed` | Plans/Contracts_V0.md:3004; Plans/Contracts_V0.md:16635; Plans/Contracts_V0.md:16643 | OSI-691: `Child executor / fail child`; `reader.orchestrator.subagent_failed.history.v1@1.0.0`; `subagent_failed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.message_received` | Plans/Contracts_V0.md:3002; Plans/Contracts_V0.md:16685; Plans/Contracts_V0.md:16715 | OSI-692: `Child response collector / record response`; `reader.orchestrator.subagent_message_received.history.v1@1.0.0`; `subagent_message_received` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.message_sent` | Plans/Contracts_V0.md:3001; Plans/Contracts_V0.md:16685; Plans/Contracts_V0.md:16714 | OSI-693: `Parent follow-up dispatcher / record send`; `reader.orchestrator.subagent_message_sent.history.v1@1.0.0`; `subagent_message_sent` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.model_switched` | Plans/Contracts_V0.md:3009; Plans/Contracts_V0.md:16733; Plans/Contracts_V0.md:16760 | OSI-694: `Child runtime resolver / apply model switch`; `reader.orchestrator.subagent_model_switched.history.v1@1.0.0`; `subagent_model_switched` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.output_truncated` | Plans/Contracts_V0.md:3012; Plans/Contracts_V0.md:16686; Plans/Contracts_V0.md:16716 | OSI-695: `Child output collector / bound preview`; `reader.orchestrator.subagent_output_truncated.history.v1@1.0.0`; `subagent_output_truncated` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.paused` | Plans/Contracts_V0.md:3010; Plans/Contracts_V0.md:16636; Plans/Contracts_V0.md:16643 | OSI-696: `Child pause owner / checkpoint child`; `reader.orchestrator.subagent_paused.history.v1@1.0.0`; `subagent_paused` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.progress` | Plans/Contracts_V0.md:2998; Plans/Contracts_V0.md:16684; Plans/Contracts_V0.md:16711 | OSI-697: `Child executor / report progress`; `reader.orchestrator.subagent_progress.history.v1@1.0.0`; `subagent_progress` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.resumed` | Plans/Contracts_V0.md:3011; Plans/Contracts_V0.md:16636; Plans/Contracts_V0.md:16643 | OSI-698: `Child resume owner / resume child`; `reader.orchestrator.subagent_resumed.history.v1@1.0.0`; `subagent_resumed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.retried` | Plans/Contracts_V0.md:3007; Plans/Contracts_V0.md:16732; Plans/Contracts_V0.md:16758 | OSI-699: `Child retry owner / create next attempt`; `reader.orchestrator.subagent_retried.history.v1@1.0.0`; `subagent_retried` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.spawned` | Plans/Contracts_V0.md:1471; Plans/Contracts_V0.md:2996; Plans/Contracts_V0.md:9022 | OSI-700: `Child dispatcher / create child`; `reader.orchestrator.subagent_spawned.history.v1@1.0.0`; `subagent_spawned` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.started` | Plans/Contracts_V0.md:2997; Plans/Contracts_V0.md:16635; Plans/Contracts_V0.md:16643 | OSI-701: `Child executor / start child`; `reader.orchestrator.subagent_started.history.v1@1.0.0`; `subagent_started` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.timeout` | Plans/Contracts_V0.md:3006; Plans/Contracts_V0.md:16636; Plans/Contracts_V0.md:16643 | OSI-702: `Child deadline owner / settle timeout`; `reader.orchestrator.subagent_timeout.history.v1@1.0.0`; `subagent_timeout` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.tool_called` | Plans/Contracts_V0.md:2999; Plans/Contracts_V0.md:16684; Plans/Contracts_V0.md:16712 | OSI-703: `Child tool dispatcher / record invocation`; `reader.orchestrator.subagent_tool_called.history.v1@1.0.0`; `subagent_tool_called` closed payload; exact-family operation_id/occurrence SHA-256 recipe |
| `subagent.tool_completed` | Plans/Contracts_V0.md:3000; Plans/Contracts_V0.md:16684; Plans/Contracts_V0.md:16713 | OSI-704: `Child tool dispatcher / record result`; `reader.orchestrator.subagent_tool_completed.history.v1@1.0.0`; `subagent_tool_completed` closed payload; exact-family operation_id/occurrence SHA-256 recipe |

The new recipes hash RFC8785 JCS identity arrays, retaining the original canonical operation id and observation occurrence across retry. Readers are ephemeral history inspection adapters over the existing actual SP-278 index; no new persisted projection/checkpoint or storage value family is introduced. Thus no storage-value registry rows are needed. They reuse `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}`, its closed checkpoint schema, existing generic CAS/publication, and its existing retention. None may reconstruct canonical child/board state from an event. Every family explicitly adopts SP-286/CV-339 first-receipt custody and SP-278.

## Decision premise checks

- **DL-084:** Contracts still enumerates the same 19 subagent histories and current child-run history semantics. OSI-440 and CV-366 extend scope to application chats without changing chat-lifetime retention. Cite `origin/plans/ea-storage-retention-20261104` (Case L-3 assignment and `reports/event-authority-20260911/step-09-storage-retention-20261104.md`): `RP-CHAT-THREAD-LIFETIME@1.0.0`, including its reuse check/cap/deletion behavior. Not duplicated here.
- **DL-085:** The three board families still describe attributable run-internal board state. OSI-440/SP-351 already define application board custody and the 16 KiB/SP-337 body rule. The current lifecycle still said “archived or deleted”; changed to “archived”, with unresolved blockers remaining visible and archive deleting nothing. Storage policy remains the branch-owned `RP-COORDINATION-180D@1.0.0`.
- **DL-086:** The parser failure, invalid-name rejection and phase soft-cap passages remain current; no later feature retirement found. Bind branch-owned `RP-RUNTIME-365D@1.0.0`. Technical reconciliation preserves the first 500 sanitized Unicode characters plus a reference to all permitted sanitized raw output, under SP-337; it does not pick a new retention/deletion rule.
- **DL-087:** Current Collaborative Workflows still owns shared workflow lifecycle; the retirement branch report explicitly leaves this pointer outstanding. Both duplicated “Crew lifecycle, cleanup, and GUI routing” passages now point to `Plans/Collaborative_Workflows.md` and prohibit separate Crew lifecycle history. No retirement edit from the other branch is duplicated.
- **Child states:** Current Contracts line 2930 owns queued/running/awaiting_parent/blocked/complete/failed/cancelled. Drafts use those states, with timeout a failure reason and pause a cause-based existing waiting state. No new child-state enum.

**Failed premises:** none. **Questions for Jared:** none discovered. The outstanding retention integration dependency is an already answered decision, not a new question.

## Shared-file and owner hunks

- `Plans/Automated_Testing_System.md`: append ATS-360 only, exact-family static and native oracle obligations.
- `Plans/orchestrator-subagent-integration.md`: two DL-087 pointer insertions; one DL-085 wording replacement; append OSI-680..704 in a new end section.
- New files: `Plans/orchestrator_event_payloads.schema.json`, `Plans/orchestrator_event_contract_fixtures.json`, `scripts/pm-orchestrator-event-contracts.py`. No other shared owner/value-registry edit.

## IDs and validation

**Used:** OSI-680..704 and ATS-360. Both blocks checked against main and every fetched origin branch: no collision. SP-720..739, CV-740..759, ATS-361..369 and OSI-705..719 unused.

Currentness edition copied before index generation; all 15 files matched SHA-256. Regeneration changed only the edited Orchestrator and Automated Testing shards and global plan-index artifacts. No test file was edited.

- DO contract checker: exit 0, 25 families, 1,496 static assertions; native NOT_RUN.
- Shard generate: exit 0. Shard check: exit 0, 3,093 shards.
- Index generate: exit 0, top-level pass. Index validate: exit 0, parsed top-level `status: pass`.
- Runtime-integration canon validator: exit 1; see baseline comparison below.
- Coordination checker: exit 1; see baseline comparison below.

The first UTC negative exposed that the installed jsonschema FormatChecker did not enforce date-time. The checker now explicitly validates UTC strings. A preliminary index validation overlapped the later owner regeneration and reported two stale generated artifacts; the final sequential validation supersedes it. The runtime validator was initially invoked without its required validate mode (exit 2), then rerun correctly.

## Integration and limitations

Integrate the Storage retention branch before claiming retention PASS; self-grades intentionally leave that cell PARTIAL. Registry membership remains ABSENT, and all family_id strings in the self-grade are proposed labels only. Native producer/durability/security/replay/withdrawal oracles are authored NOT_RUN. No native writer, new product feature, admission, checkpoint promotion or governance readiness is claimed. Independent Sol/Astra review and batch integration remain the lead’s work. Edited owner hashes and generated artifacts require the separately assigned reseal workflow after landing; no reseal was performed.

## External evidence

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/per-family-search.json` SHA-256 `b210f7025b6efd58b4003d8246270b98d8e91dca81708413c3e84a774a1445c0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/contracts-check.txt` SHA-256 `b28d01702cb851926bc8f1d12bc83664881e972388dc33cf86e7780eca6debb3`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/runtime-canon-check.txt` SHA-256 `bd09795460a0685673e28093e0bf0299343bf8b5ac4c7062440eb9bac412b955`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/runtime-canon-baseline.txt` SHA-256 `bd09795460a0685673e28093e0bf0299343bf8b5ac4c7062440eb9bac412b955`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/coordination-check.json` SHA-256 `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/coordination-baseline.json` SHA-256 `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/shard-generate.txt` SHA-256 `ee8f25c4c314417161da89a187d2b5e131c5b4db3570f2b05f902053f5684cd8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/shard-check.txt` SHA-256 `695c9deda2a5c4fc86fbb855223f1e463d00c0c9fdf27103427d3cb7f41177ad`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/index-generate.txt` SHA-256 `a399f497286727ab48941014f74a90092c5d28d70611d0ed3a6a6583a42ff54c`.

**runtime-canon baseline comparison:** branch 161 failures; unchanged-base owner files 161 failures; exact failure-list equality `True`. Baseline used a temporary external read-only overlay with the two edited owners replaced by origin/main bytes; removed after execution.

**coordination baseline comparison:** branch 2 failures; unchanged-base owner files 2 failures; exact failure-list equality `True`. Baseline used a temporary external read-only overlay with the two edited owners replaced by origin/main bytes; removed after execution.

Final index validation evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/index-validate.json` SHA-256 `b2bb4cff5cb63e94a1a4a72471d1e8b5f608b6c1f2669b4209eeb37c4a6b515f`.

External dependency tips inspected: Storage `d1b0338a21da131e62a0779aa46e822f3a439843`; DL-087/088 retirements `d30028fbb943321df574cc159312c9c103d4de8c`.
