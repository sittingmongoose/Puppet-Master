# Plan, Command ID, Wiring, and DRY Impact

Concept agents track impacts; they do not edit canon.

## Plan owners

Audit at minimum:

```text
assistant-chat-design
FinalGUISpec
Models System
Multi-Account
Prompt Pipeline
Assistant Memory
Personas
Goal Runtime
Orchestrator/Subagents
Planning Wizard
PRD Builder
Permissions
FileSafe
Tools/MCP/Skills/Plugins
Media
Usage
Worktrees/Git
Testing/Browser/Artifacts
Server/Project Sync integration
Notifications
Settings inventory
```

## Candidate command families

Before final implementation, census existing catalog and adjudicate exact IDs.

Likely families:

```text
cmd.chat.thread.create
cmd.chat.thread.request
cmd.chat.thread.await
cmd.chat.thread.branch
cmd.chat.thread.rewind
cmd.chat.restore_point.create
cmd.chat.history.pin
cmd.chat.history.unpin
cmd.chat.artifact.open
cmd.chat.artifact.close
cmd.chat.question.answer
cmd.chat.question.skip
cmd.chat.question.cancel
cmd.chat.question.submit
cmd.chat.goal.start/pause/resume/stop/update/replan
cmd.chat.context.compact_now
cmd.chat.context.source.add/remove
cmd.chat.route.select
cmd.chat.access.set
cmd.chat.bsd.set
cmd.chat.redirect
cmd.chat.attachment.resolve
cmd.chat.attachment.route
cmd.chat.crew.start
cmd.chat.cross_project.request
```

Reuse canonical Goal, account, provider, worktree, browser, test, artifact, and Settings commands rather than cloning them under Chat.

## Wiring

Trace:

```text
Chat control
→ typed command
→ owning service
→ permission/FileSafe/route validation
→ durable thread/Goal/outbox state
→ event/receipt
→ Chat projection
→ Usage/diagnostics
→ retry/recovery
```

Offline commands require stable IDs and idempotency.

Thread requests/spawns preserve source/target/parent lineage and do not inherit hidden context.

## DRY components/services

Candidate roles:

```text
ThreadShell
ThreadDetailSubscription
PinnedHistorySurface
ArtifactWorkspace
Composer
ModelRoutePicker
AccessPicker
BSDPicker
ContextRing
ContextLens
CompactWorkCluster
GoalSummary
TodoGroup
SubagentGroup
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

Runtime owners include Thread service, Goal Runtime, Orchestrator, Provider routing, Context Admission, Outbox, RuntimeResourceGovernor, ObservableWork, FileSafe, Permissions, Usage, and Artifact service.

## Required concept outputs

```text
impact-register.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
demo-trigger-report.json
interaction-test-report.json
```
