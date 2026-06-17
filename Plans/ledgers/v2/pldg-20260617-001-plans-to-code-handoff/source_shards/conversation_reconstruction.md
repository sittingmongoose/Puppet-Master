# Conversation Reconstruction — pldg-20260617-001-plans-to-code-handoff

This source shard records the design decisions from the June 17, 2026 planning conversation about the next Puppet Master design phase. It is source/planning memory only, not canonical Plan prose.

## Scope

The requested next step is to design the process that converts approved Plans into work nodes, while keeping two adapters separate: a Codex bootstrap adapter for building Puppet Master and a native Puppet Master adapter launched by the future Plan Wizard. The system must remain design-only for now; it must not create executable WorkNodes, NodeSeeds, queues, final node manifests, implementation code, or production build tasks.

## Settled decisions

- Use one shared Plans-to-work compiler core with two adapters: Codex bootstrap and native Puppet Master runtime.
- The compiler must be a durable, resumable, code-backed state machine because low-quality, low-context agents must be able to continue the process safely.
- Agents perform bounded semantic work; the compiler owns state, routing, continuation, validation, evidence, and handoff.
- PlanCompile means only approved Plans to PlanUnits/NodeSeeds/WorkNode requests/WorkGraph draft. It does not execute WorkNodes or generate code.
- PlanCompile remains disabled/design-only until explicitly enabled later.
- Use Plan Wizard terminology going forward; do not create new references or meta-comments using the old name.
- Plan Wizard approval later starts native PlanCompile invisibly, but not until runtime enablement exists.
- Orchestrator gets a dedicated Plan Compile tab for the long Plans-to-work conversion. It should be polished, heavily animated, and show live progress, speed, stage status, counts, blockers, warnings, ETA confidence, work type distribution, model lane status, test capability status, and handoff readiness.
- The Plan Compile tab is scoped to node creation only. Existing Orchestrator execution tabs show Executor/Worker progress through the WorkNodes and code generation.
- User-facing model settings must be condensed to six: Default Model, Overseer Model, Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, Auditor Model.
- Plan Wizard validation pass settings are replaced by one Auditor Model and an audit/repair/audit loop.
- The Plan Compiler role maps internally to the Overseer Model. The same Overseer Model also covers ledger-to-Plans conversion and PRD Builder structured conversion.
- The Executor should not have its own user-facing model setting. Executor is deterministic scheduler/runtime machinery. Overseer is the model-backed process supervisor.
- Codex bootstrap may emit external GUI-agent CLI requests for Antigravity, Claude Code, Cursor, OpenCode, or custom CLI providers. Built Puppet Master must not expose this bridge as a setting and must route GUI/frontend work through its native GUI / Frontend Worker Model.
- WorkNode requests need first-class work_type, GUI/frontend flags, effort class, reasoning tier, risk class, model/capability lane, and requested/effective model resolution receipts.
- Build order must be explicit in WorkNode request metadata and graph dependencies. The Executor should schedule deterministically from readiness and dependency metadata.
- Tests are first-class. Automated test capability discovery, harness probing, test strategy generation, test binding, test run receipts, visual/browser/device evidence, and automatic verification must exist before WorkNode execution can be certified.
- Testing must be platform-capability-discovery-first. Slint is only an example for Puppet Master itself, not the default focus. Web projects should use Puppet Master built-in browser automation as primary once available; Playwright can be optional/fallback/project-native, not native default.
- Tests must be fully automated. Human eyeballing cannot be a required completion step. If no automatic oracle exists, create a test capability blocker or test-harness WorkNode.
- Source control, worktrees, safe points, snapshots, rollback, FileSafe, and GitHub are execution contracts, not PlanCompile contracts.
- GitHub is optional promotion/output; local source-control/worktree state remains execution truth.
- Default operation is hands-off. HITL is a mode/setting that can add user checkpoints, but default user escalation is last-resort for critical authority blockers only.
- Loop breakers escalate internally first through repair, Auditor classification, Overseer review, graph patching/splitting/reordering/lane changes/safe-point restore/clean worktree allocation, high-effort repair, and only then critical user escalation unless HITL policy requires earlier intervention.
- Add a Plans-to-Code Handoff Matrix proving every transition has source artifact, destination artifact, owner, validator, receipt, retry route, rollback route, and user-escalation condition.
- Add a Goal Completion Certification contract defining code-complete: all WorkNodes terminal with valid receipts, all automated tests passed/dispositioned, all source-control receipts valid, rollback/safe-point requirements satisfied, Auditor passed, no active blockers, no stale Plan/WorkGraph mismatch, final source state clean or intentionally preserved, final summary/evidence written.

## Candidate owner docs

Primary candidate owner docs include Plans/Plan_To_Node_Compilation.md, Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Models_System.md, Plans/FinalGUISpec.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/GitHub_Integration.md, Plans/GitHub_API_Auth_and_Flows.md, Plans/Permissions_System.md, Plans/Tools.md, Plans/Contracts_V0.md, Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/00-plans-index.md, and a new Plans/Automated_Testing_System.md if the compiler/test policy does not already have a better SSOT.

## Non-negotiable negative constraints

- Do not build WorkNodes from this ledger.
- Do not run PlanCompile.
- Do not emit executable queues, final node manifests, production build tasks, or implementation code.
- Do not expose Codex external GUI-agent bridge in built Puppet Master settings.
- Do not create a separate Executor Model setting.
- Do not keep old Plan Wizard validation pass model settings.
- Do not over-focus test strategy on Slint; Slint is only one adapter/example.
- Do not route default failures to user decision before Overseer/Auditor/internal repair paths are exhausted.
