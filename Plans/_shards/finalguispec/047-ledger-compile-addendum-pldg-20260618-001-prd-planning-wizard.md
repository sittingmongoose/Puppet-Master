# Shard 047: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/FinalGUISpec.md`

Source lines: L25364-L25652

Source SHA256: `b788c81e168d096c1ad7ae242f8539734f138f439804ca862fa26ac3b4576b89`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### F3-398 - PRD Builder And Planning Wizard GUI Surfaces

```yaml
plan_unit_id: F3-398
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. A user with no source documents can start in PRD Builder chat; the agent asks discovery questions, updates the PRD ledger every turn, and continuously renders the PRD projection. A user can upload existing requirements material and have PRD Builder preserve, parse, extract, reconcile, and normalize it into the standard PRD and PRD Pack. Uploads and conversation may be combined at any time in one PRD Builder workspace so users can clarify, correct, extend, override, and source newly introduced requirements without restarting. Ask questions in digestible batches, use existing ledger
  answers before asking, avoid repetition, and prefer questions whose answers materially change the PRD. The primary PRD contains Summary, Problem or Opportunity, Goals, Users or Actors, Scope, Non-Goals, Functional Requirements, Non-Functional Requirements, UX Expectations, Data or Integration or Environment Constraints, Acceptance Criteria, Assumptions, Risks and Dependencies, Open Questions, and Source Notes. The default workspace emphasizes one primary PRD while exposing supporting assumptions and constraints, open questions, source traceability, and quality/readiness views without making users manage many equal documents. The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state. Highlight, comment, ask, request change, replace, remove, move to non-goal, mark unclear, show source, and challenge
  source actions create durable context or annotation records bound to document version and text anchors. When revisions invalidate a highlighted span, mark the anchor stale, attempt evidence-backed remapping, preserve the original selected text, and ask the user only when safe remapping is impossible. PRD Builder exposes Ready, Ready with Warnings, and Blocked based on source extraction, required sections, blocking conflicts, annotations, quality findings, and approval-snapshot ability; accepted warnings carry into Planning Wizard. Planning Wizard derives an initial topic graph from the input pack, project/repository context, work intent, risk, and known defaults rather than enforcing a fixed list of sections. The controller can add, split, merge, rename, defer, reopen, reorder, and mark topics impacted, recording the reason, source refs, dependencies, user-visible origin, and resulting invalidations. The GUI suggests a next topic and
  conversational sequence while the underlying topic map preserves dependencies and allows safe navigation, reopening, and parallel background work. A later decision that changes a prior topic''s assumptions or outputs marks affected topic drafts stale_due_to_dependency_change, stale_due_to_new_scope, or requires_recompile/requires_reaudit and propagates impact through typed topic dependencies. A topic becomes Ready after successful conversion and audit; users may review or reopen any topic, but ordinary flow does not require a user confirmation after every topic. Final planning review uses the shared live document preview, selection context menu, comments, source inspection, challenge, targeted revision, and annotation status system used by PRD Builder. Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness,
  and permissions. Testing capability policy is configurable globally and per project, with project settings inheriting or overriding global values and the effective policy snapshot carried into Planning Wizard, Plan Compile, Executor, and Orchestrator. Each testing capability family supports Auto, On, and Off: Auto discovers and selects or installs within authority; On is required and blocks or asks for authority when unavailable; Off prohibits use and installation for that capability without implying a pass. Settings cover online capability research, automated installation, built-in browser, headed browser, visible browser automation, hot reload, live preview, desktop GUI testing, simulator or emulator, physical device, screenshot or visual comparison, accessibility, API or contract, database, console or network, performance, and security testing. The default testing visibility policy is show_when_possible: when a meaningful headed or visual
  surface exists, expose the active test session rather than hiding all verification in background logs. For web work, open the built-in browser or headed browser view and visibly show navigation, clicks, form input, assertions, screenshots, console and network evidence, and pass/fail progression when supported. For Swift and other native work, show the appropriate live preview, hot-reload surface, simulator, emulator, device stream, application window, interaction trace, screenshots, and relevant logs when available and permitted. The Planning Wizard final approval button and command label is exactly Approve And Build. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. If PlanApproved publication or PlanCompileRun identity has not yet reconciled, the Plan Compile tab shows a pending launch
  shell tied to the approval command and then binds to the durable compile identity without creating a duplicate. Planning Wizard GUI shows a collapsible parent named for the plan or project with child topic threads, dynamically added topics, final integration, final review, and attached audit/repair activity. The user remains in one Planning Wizard workspace with topic map, active Assistant Chat panel, live plan preview, source/annotation/readiness panels, and bounded backend child threads loaded as selected. Topic cards represent not_started, active, ledger_syncing, ledger_synced, compiling, auditing, repairing, ready, impacted, reopened, deferred, and blocked, with clear dependency and origin badges. Long-running topic conversion, audit, repair, final integration, and final audit display active stage, progress counts, assignment counts, findings fixed, current pass, and user-relevant status so the interface never appears stalled.   Audit and repair children are attached under their topic or final Plan Pack and summarized in activity/progress views; detailed agent traces and evidence may be expanded without cluttering the default thread tree. Orchestrator Plan Compile tab shows immutable source pack, current stage, stage timeline, subagent assignments, PlanUnit coverage, NodeSeed candidates, WorkGraph status, WorkNodeRequest count, testing/model/source-control readiness, audit/repair cycles, blockers, receipts, and handoff status. Plan Compile tab owns compilation and handoff progress; after BuildStarted, Orchestrator execution views own WorkNode dispatch, code changes, live testing, repairs, safe points, and completion while Plan Compile remains a historical launch view with an Open Build action. Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request
  bounded recompile, and open resulting build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes. FinalGUISpec, using only PMConcept-derived visual/source-lineage details already reconciled through owner docs and production wiring, replaces the old fixed Project Setup through Start Chain sequence with PRD Builder intake, dynamic Planning Run topics, live topic and plan projections, audits, Approve And Build, and Orchestrator Plan Compile navigation. Reuse and formalize existing role styling, collapsible navigation, phase rows, live document panes, thread differentiation, activity indicators, worktree context, and selection-based chat context where compatible with the new architecture.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/PRD_Builder.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
- Plans/Plan_Document_System.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Automated_Testing_System.md
- Plans/Multi-Account.md
- Plans/Orchestrator_Page.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0017
- pldg-20260618-001-prd-planning-wizard:atom-0018
- pldg-20260618-001-prd-planning-wizard:atom-0019
- pldg-20260618-001-prd-planning-wizard:atom-0021
- pldg-20260618-001-prd-planning-wizard:atom-0024
- pldg-20260618-001-prd-planning-wizard:atom-0026
- pldg-20260618-001-prd-planning-wizard:atom-0028
- pldg-20260618-001-prd-planning-wizard:atom-0036
- pldg-20260618-001-prd-planning-wizard:atom-0037
- pldg-20260618-001-prd-planning-wizard:atom-0038
- pldg-20260618-001-prd-planning-wizard:atom-0046
- pldg-20260618-001-prd-planning-wizard:atom-0048
- pldg-20260618-001-prd-planning-wizard:atom-0049
- pldg-20260618-001-prd-planning-wizard:atom-0055
- pldg-20260618-001-prd-planning-wizard:atom-0061
- pldg-20260618-001-prd-planning-wizard:atom-0064
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0089
- pldg-20260618-001-prd-planning-wizard:atom-0090
- pldg-20260618-001-prd-planning-wizard:atom-0091
- pldg-20260618-001-prd-planning-wizard:atom-0092
- pldg-20260618-001-prd-planning-wizard:atom-0093
- pldg-20260618-001-prd-planning-wizard:atom-0094
- pldg-20260618-001-prd-planning-wizard:atom-0101
- pldg-20260618-001-prd-planning-wizard:atom-0107
- pldg-20260618-001-prd-planning-wizard:atom-0108
- pldg-20260618-001-prd-planning-wizard:atom-0147
- pldg-20260618-001-prd-planning-wizard:atom-0148
- pldg-20260618-001-prd-planning-wizard:atom-0149
- pldg-20260618-001-prd-planning-wizard:atom-0150
- pldg-20260618-001-prd-planning-wizard:atom-0151
- pldg-20260618-001-prd-planning-wizard:atom-0152
- pldg-20260618-001-prd-planning-wizard:atom-0153
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0155
- pldg-20260618-001-prd-planning-wizard:atom-0156
- pldg-20260618-001-prd-planning-wizard:atom-0157
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0001
- atom-0002
- atom-0017
- atom-0018
- atom-0019
- atom-0021
- atom-0024
- atom-0026
- atom-0028
- atom-0036
- atom-0037
- atom-0038
- atom-0046
- atom-0048
- atom-0049
- atom-0055
- atom-0061
- atom-0064
- atom-0068
- atom-0089
- atom-0090
- atom-0091
- atom-0092
- atom-0093
- atom-0094
- atom-0101
- atom-0107
- atom-0108
- atom-0147
- atom-0148
- atom-0149
- atom-0150
- atom-0151
- atom-0152
- atom-0153
- atom-0154
- atom-0155
- atom-0156
- atom-0157
decision_refs:
- dec-0001
- dec-0006
- dec-0007
- dec-0008
- dec-0010
- dec-0018
- dec-0019
- dec-0020
correction_refs:
- corr-0001
- corr-0002
- corr-0015
- corr-0014
- corr-0011
- corr-0012
- corr-0005
- corr-0006
preserved_exact_tokens:
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- conversation-first
- import-first
- normalize
- hybrid
- uploads and conversation
- digestible batches
- gap-driven
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Open Questions
- Source Notes
- primary PRD
- supporting artifacts
- Approve PRD for Planning Wizard
- highlight
- annotation
- text anchor
- stale anchor
- remapping
- Ready
- Ready with Warnings
- Blocked
- dynamic topic map
- topic graph
- add_topic
- split_topic
- merge_topics
- mark_topic_impacted
- suggested order
- dependency graph
- stale_due_to_dependency_change
- requires_recompile
- requires_reaudit
- live document preview
- selection context menu
- local path
- Git repository
- GitHub
- SSH
- global settings
- per-project settings
- effective policy snapshot
- Auto
- 'On'
- 'Off'
- built-in browser
- visible browser automation
- hot reload
- simulator
- accessibility
- performance
- security
- show_when_possible
- clicks
- form input
- assertions
- Swift
- live preview
- emulator
- device stream
- Approve And Build
- Orchestrator
- Plan Compile tab
- pending launch
- compile identity
- collapsible
- Planning Run
- child topic
- one Planning Wizard page
- active chat panel
- ledger_syncing
- compiling
- auditing
- repairing
- impacted
- progress counts
- audit pass
- attached audit child
- collapsed
- stage timeline
- subagent assignments
- WorkNodeRequest count
- Open Build
- BuildStarted
- pause
- cancel
- resume
- inspect evidence
- Start Chain
- collapsible navigation
- live document pane
- selection context
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not force users to choose permanently between upload and chat.
- Do not re-ask answered questions or overwhelm the user with one giant questionnaire.
- Do not leave a topic marked Ready after a material dependency change.
- Do not treat Off as successful verification.
- Do not present every backend subagent or audit thread as a separate top-level app surface.
- Do not mix ongoing WorkNode execution into Plan Compile stage progress.
- Do not retain the old nine-step linear wizard as canonical UX.
stale_retired_dispositions:
- Requirements Doc Builder, Chain Wizard, Plan Wizard, and Start Chain are preserved here only as source-lineage tokens; active product prose uses PRD Builder, Planning Wizard, and Approve And Build.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
- Plans/Plan_Document_System.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/Automated_Testing_System.md
- Plans/Multi-Account.md
- Plans/Orchestrator_Page.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
- Concepts/PMConcept.html
```
