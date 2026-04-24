# Orchestrator Page -- Single-Page 6-Tab Specification

## 1. Scope and canonical model

Orchestrator is the core scheduling, concern tracking, blocked-state handling, and runtime-identity management system. It is not the UI, CLI, or external provider.

### Search, routing, and action policy
- `concern_id` and `blocked_sequence` form the canonical concern anchor; UI search must resolve through concern_id rather than transaction_id or attempt_id.
- Concern routing rules are defined in `Plans/Contracts_V0.md §Concern record family` and applied deterministically by Orchestrator, not by run mode or user whim.
- Approval and action routing depend on approval_scope_key, execution_role, and affected external target (file, provider, GitHub issue) — not on tier_id, request_id, or ephemeral tokens.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

### Current vs historical run behavior
- `active_run_id` and `focused_run_id` govern live vs historical display in the UI.
- Live mode shows current attempt, current approval state, and streaming logs.
- Historical mode shows the final state of a past run, concern snapshots, and blocked episodes as they existed.
- Switching between live and historical does not change the underlying concern identity or approval_scope_key.

ContractRef: ContractName:Plans/Run_Graph_View.md

### Concern and notification model
- Concern notifications are routed by `concern_class`, `concern_reason`, and escalation owner, not by tier or request type.
- A single concern_id may have multiple blocked episodes (blocked_sequence 0, 1, 2, ...); each episode may have its own approval context.
- Notifications MUST preserve concern_id across all episodes and MUST NOT mint a new notification for each episode.

ContractRef: ContractName:Plans/Contracts_V0.md §Concern record family, ContractName:Plans/human-in-the-loop.md

### Project summary, attention, and escalation
- Project summary is scoped by `project_id` and aggregates concern summaries, usage metrics, and promotion/blocking status from all runs in the project.
- Attention view filters concerns by concern_class, escalation ownership, and approval_scope_key rather than by tier or run status.
- Escalation stack is a LIFO queue of escalation frames; each frame records who escalated, when, and from which execution unit.

ContractRef: ContractName:Plans/architecture-invariants.md, ContractName:Plans/Permissions_System.md §Approval scope

### Source Control boundary
- Source control mutations (commits, PRs, branch updates) are external side-effects tied to `route_target` and `OpenSubject` primitives.
- Orchestrator does not directly commit; it routes to a source-control-facing provider or CLI surface.
- Blocked episodes around source control MUST preserve the route_target and OpenSubject context; recovery does not replay the mutation.

ContractRef: ContractName:Plans/Contracts_V0.md §route_target and OpenSubject, ContractName:Plans/FileSafe.md

### glossary/help references
- Help entries are indexed by concern_class and concern_reason, not by request or tier.
- Help entries MUST reference concern_id when specific concern context is required and MUST NOT assume tier or transactional specificity.
- Glossary and Help surfaces MUST defer rendering escalation stack internals unless the user is the escalation owner or the operation is in audit mode.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Onboarding_and_Help.md