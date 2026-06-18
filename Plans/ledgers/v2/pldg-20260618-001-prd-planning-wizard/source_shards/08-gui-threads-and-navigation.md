# GUI, Thread Tree, Progress, and Navigation

## SRC-GUI

The existing Assistant Chat module is reused. Planning Wizard appears as one workspace but stores bounded child threads. The Planning Run parent and topic, integration, review, and audit children are collapsible. Internal audit children are attached and normally summarized.

The interface displays dynamic topics and invalidations, conversion/audit progress, live document previews, selection/context actions, sources, annotations, readiness, and long-running activity. Approve And Build immediately navigates to Orchestrator Plan Compile. Plan Compile shows compile truth; after BuildStarted the execution views own WorkNode activity and visible testing.

## Accepted obligation inventory

### atom-0007: Reuse Assistant Chat for both planning products

PRD Builder and Planning Wizard reuse the existing Assistant Chat message, attachment, selection-context, command, persistence, and thread infrastructure rather than creating new chat subsystems.

- atom_type: `requirement`
- lane: `chat_infrastructure`
- gui_related: `true`
- exact_tokens: ["Assistant Chat", "typed thread"]
- negative_constraints: ["Do not build duplicate PRD Builder or Planning Wizard chat engines."]
- owner_hints: ["Plans/assistant-chat-design.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md"]

### atom-0008: Planning Wizard uses one typed thread family

All Planning Wizard child conversations use thread_type planning_wizard and distinguish intake, topic, final_integration, audit_review, and final_review through thread_role and Planning Run membership.

- atom_type: `requirement`
- lane: `thread_model`
- gui_related: `true`
- exact_tokens: ["thread_type: planning_wizard", "thread_role", "Planning Run"]
- negative_constraints: ["Do not define planning_topic or audit_review as unrelated top-level thread types."]
- owner_hints: ["Plans/assistant-chat-design.md", "Plans/Planning_Wizard.md"]

### atom-0009: Bounded child threads are grouped under one Planning Run

Each planning topic, integration pass, and attached audit/repair activity is a bounded child thread grouped by planning_run_id and thread_group_id under one collapsible Planning Run parent.

- atom_type: `requirement`
- lane: `thread_model`
- gui_related: `true`
- exact_tokens: ["planning_run_id", "thread_group_id", "collapsible"]
- negative_constraints: ["Do not use one unbounded transcript for the entire Planning Wizard."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/assistant-chat-design.md", "Plans/FinalGUISpec.md"]

### atom-0147: Use a collapsible Planning Run parent-child tree

Planning Wizard GUI shows a collapsible parent named for the plan or project with child topic threads, dynamically added topics, final integration, final review, and attached audit/repair activity.

- atom_type: `requirement`
- lane: `planning_gui`
- gui_related: `true`
- exact_tokens: ["collapsible", "Planning Run", "child topic"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0148: Keep one Planning Wizard page and one active chat panel

The user remains in one Planning Wizard workspace with topic map, active Assistant Chat panel, live plan preview, source/annotation/readiness panels, and bounded backend child threads loaded as selected.

- atom_type: `requirement`
- lane: `planning_gui`
- gui_related: `true`
- exact_tokens: ["one Planning Wizard page", "active chat panel"]
- negative_constraints: ["Do not present every backend subagent or audit thread as a separate top-level app surface."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md", "Plans/assistant-chat-design.md"]

### atom-0149: Expose precise topic progress states

Topic cards represent not_started, active, ledger_syncing, ledger_synced, compiling, auditing, repairing, ready, impacted, reopened, deferred, and blocked, with clear dependency and origin badges.

- atom_type: `requirement`
- lane: `planning_gui`
- gui_related: `true`
- exact_tokens: ["ledger_syncing", "compiling", "auditing", "repairing", "impacted"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0150: Show conversion and audit progress

Long-running topic conversion, audit, repair, final integration, and final audit display active stage, progress counts, assignment counts, findings fixed, current pass, and user-relevant status so the interface never appears stalled.

- atom_type: `requirement`
- lane: `planning_gui`
- gui_related: `true`
- exact_tokens: ["progress counts", "audit pass"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md", "Plans/Orchestrator_Page.md"]

### atom-0151: Keep internal audit threads attached and normally collapsed

Audit and repair children are attached under their topic or final Plan Pack and summarized in activity/progress views; detailed agent traces and evidence may be expanded without cluttering the default thread tree.

- atom_type: `requirement`
- lane: `planning_gui`
- gui_related: `true`
- exact_tokens: ["attached audit child", "collapsed"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md"]

### atom-0152: Plan Compile tab exposes compile-stage truth

Orchestrator Plan Compile tab shows immutable source pack, current stage, stage timeline, subagent assignments, PlanUnit coverage, NodeSeed candidates, WorkGraph status, WorkNodeRequest count, testing/model/source-control readiness, audit/repair cycles, blockers, receipts, and handoff status.

- atom_type: `requirement`
- lane: `plan_compile_gui`
- gui_related: `true`
- exact_tokens: ["Plan Compile tab", "stage timeline", "subagent assignments", "WorkNodeRequest count"]
- negative_constraints: []
- owner_hints: ["Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md", "Plans/Run_Graph_View.md"]

### atom-0153: Plan Compile and execution have separate views

Plan Compile tab owns compilation and handoff progress; after BuildStarted, Orchestrator execution views own WorkNode dispatch, code changes, live testing, repairs, safe points, and completion while Plan Compile remains a historical launch view with an Open Build action.

- atom_type: `requirement`
- lane: `plan_compile_gui`
- gui_related: `true`
- exact_tokens: ["Open Build", "BuildStarted"]
- negative_constraints: ["Do not mix ongoing WorkNode execution into Plan Compile stage progress."]
- owner_hints: ["Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md"]

### atom-0154: Define state-aware Planning Wizard commands

Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery.

- atom_type: `requirement`
- lane: `commands`
- gui_related: `true`
- exact_tokens: ["Approve And Build", "pause", "cancel", "resume", "inspect evidence"]
- negative_constraints: []
- owner_hints: ["Plans/UI_Command_Catalog.md", "Plans/Commands_System.md", "Plans/Planning_Wizard.md", "Plans/Orchestrator_Page.md"]

### atom-0155: Do not force navigation away from an active build view

Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.

- atom_type: `requirement`
- lane: `commands`
- gui_related: `true`
- exact_tokens: ["Open Build"]
- negative_constraints: []
- owner_hints: ["Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md"]

### atom-0156: Replace the old linear wizard concept

PMConcept and FinalGUISpec must replace the old fixed Project Setup through Start Chain sequence with PRD Builder intake, dynamic Planning Run topics, live topic and plan projections, audits, Approve And Build, and Orchestrator Plan Compile navigation.

- atom_type: `requirement`
- lane: `gui_migration`
- gui_related: `true`
- exact_tokens: ["Start Chain", "Approve And Build"]
- negative_constraints: ["Do not retain the old nine-step linear wizard as canonical UX."]
- owner_hints: ["Plans/FinalGUISpec.md", "Plans/PRD_Builder.md", "Plans/Planning_Wizard.md", "Concepts/PMConcept.html"]

### atom-0157: Retain useful existing concept primitives

Reuse and formalize existing role styling, collapsible navigation, phase rows, live document panes, thread differentiation, activity indicators, worktree context, and selection-based chat context where compatible with the new architecture.

- atom_type: `requirement`
- lane: `gui_migration`
- gui_related: `true`
- exact_tokens: ["collapsible navigation", "live document pane", "selection context"]
- negative_constraints: []
- owner_hints: ["Plans/FinalGUISpec.md", "Plans/assistant-chat-design.md", "Concepts/PMConcept.html"]
