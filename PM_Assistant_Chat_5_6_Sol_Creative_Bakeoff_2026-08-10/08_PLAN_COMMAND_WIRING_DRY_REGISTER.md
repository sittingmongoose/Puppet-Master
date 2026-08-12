# Plan, Command ID, Wiring, Schema, and DRY Impact

The 5.6 Sol concept agent records impact but does not modify canon.

## Plan owners to inspect

At minimum:

```text
assistant-chat-design
FinalGUISpec
Models_System
Multi-Account
CLI_Bridged_Providers / Provider OpenCode
Prompt_Pipeline
assistant-memory-subsystem
Personas
agent-rules-context
Goal_Runtime_System
orchestrator-subagent-integration
Planning_Wizard / PRD_Builder
Permissions_System / FileSafe
Commands_System / UI_Command_Catalog
MCP / Skills / Plugins / Tools
Media Generation and Capabilities
Usage owners
Worktree/Git/GitHub
Testing / Browser / LSP / DAP / Eval / Artifacts
Server / Project Sync / Integration Runtime
Notifications
Settings inventory and shared popup/scrollbar owners
```

Record newer contracts that supersede old Resend, Yolo/Regular, passive questionnaire expiry, right-panel shell, colored left selection bars, provider-CLI bundling, local-first sync, or Playwright-facade language.

## Candidate command families

First census current catalog. Reuse or alias existing IDs where possible. Do not mint canon in the concept.

Likely provisional families:

```text
cmd.chat.thread.create
cmd.chat.thread.request
cmd.chat.thread.await
cmd.chat.thread.branch
cmd.chat.thread.rewind
cmd.chat.restore_point.create
cmd.chat.history.pin / unpin
cmd.chat.artifact.open / close / switch
cmd.chat.question.answer / navigate / skip / cancel / submit
cmd.chat.goal.start / pause / resume / stop / clear / update / replan
cmd.chat.context.compact_now
cmd.chat.context.source.add / remove
cmd.chat.route.select
cmd.chat.access.set
cmd.chat.bsd.set
cmd.chat.redirect
cmd.chat.attachment.resolve / route
cmd.chat.crew.start
cmd.chat.cross_project.request
cmd.chat.draft.history.open / restore / clear
```

Preserve and reuse canonical Goal, account/profile, provider route, worktree, browser, test, artifact, Settings, approval, and notification commands.

Older questionnaire IDs such as `cmd.questionnaire.expire` require retirement/adjudication; do not revive passive expiry.

## Wiring closure

Every meaningful interaction should be traceable as:

```text
Visible control or system trigger
→ typed command/event
→ canonical owner
→ payload and idempotency key
→ Permissions/FileSafe/route/resource validation
→ durable thread/Goal/outbox state mutation
→ event/receipt
→ Chat projection
→ Usage/diagnostics projection
→ cancellation/retry/restore/recovery
```

Specific concerns:

- Offline/outbox operations replay exactly once.
- Thread request/spawn preserves source/target/parent/Plan/Goal lineage.
- Branch and rewind do not silently mutate workspace files.
- Dock/pop-out remount preserves the same state.
- Route/model changes re-evaluate context, cache, tools, and attachments.
- Provider setup/update actions route to the shared manager, not a Chat-specific installer.
- Cross-project, alternate-provider, Full Access, and persistent grants retain approval receipts.
- UI-local expansion may remain local view state unless persistence/product canon requires a command.

## Candidate DRY components

Presentation candidates:

```text
ThreadShell
FocusedThreadProjection
PinnedHistorySurface
ArtifactWorkspace
Composer
MessageMetaRow
ModelRoutePicker
AccessPicker
BSDPicker
ContextRing
ContextLens
CompactWorkCluster
GoalSummary
TodoGroup
SubagentGroup
CrewSummary
ActivityGroup
DiffSummary
QuestionFlow
ApprovalCard
RouteImpactCard
AttachmentResolutionCard
OfflineOutboxState
ObservableOperation
ReceiptLink
```

Runtime owners remain Thread Service, Goal Runtime, Orchestrator, Provider Routing, Context Admission, Outbox, ResourceGovernor, ObservableWork, FileSafe, Permissions, Usage, Artifact Service, Browser/Test managers, and Settings.

Do not turn a shared visual component into a second source of truth.

## Schemas/events/persistence to track

Potential deltas include:

- message sent/start/first-visible/terminal timestamps;
- worked versus elapsed duration and wait reasons;
- requested/effective provider/account/connection/model;
- edit/supersession/branch lineage;
- long-message and work-group local expansion;
- search query/scope/result restoration;
- Context Lens selection/admitted-source receipt;
- Goal view state and Goal revision/replan;
- questionnaire queue, per-question skip, draft, cancel/submit receipt;
- per-thread draft revision history;
- child aggregate/current activity and thread link;
- Crew member/wave/reducer state;
- artifact path/version/editor target;
- outbox command, cursor, replay/snapshot, idempotency;
- BSD trigger/override/advice/suppression/timeout;
- attachment source/derived/alternate-route lineage;
- cross-project grant scope;
- worktree/port/test/debug/resource conflict refs;
- notification and approval receipt refs.

## Required concept-folder reports

```text
impact-register.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
schema-event-storage-delta.json
demo-trigger-report.json
interaction-test-report.json
visual-test-matrix.json
motion-storyboards.md
concept-theses.json
known-gaps.md
```

Candidate IDs remain provisional until a later catalog and wiring audit.
