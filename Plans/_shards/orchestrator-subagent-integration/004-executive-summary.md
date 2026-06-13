# Shard 004: Executive Summary

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L28-L75

Source SHA256: `1b766e341ccbcc8592cd42f2e5be62eaffb068675017ee4bfa70384f01ab2c1f`

---

## Executive Summary
Internal multi-agent orchestration in Puppet Master is PM-native. Parent and child supervision, timeout propagation, thread and run lineage, shell isolation, cancellation, and crew scheduling are owned by this document together with `Plans/Contracts_V0.md` and `Plans/storage-plan.md`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

References to external bridge or A2A mapping material are adapter guidance only. They MUST NOT be read as approval for PM-internal child orchestration, child-run control messages, budget propagation, or crew coordination to move onto A2A semantics.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md

Every child spawn, retry, cancellation, timeout, pause, resume, and completion path MUST preserve PM lineage fields (`run_id`, `thread_id`, `parent_run_id`, `child_run_id`) plus requested/effective runtime descriptors where applicable. Parent oversight and audit visibility are mandatory even when a child is executing through a bridged provider surface.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

Child sessions may be re-entered for explicitly supported multi-turn continuation only through PM-owned resume envelopes. Re-entry preserves lineage, narrowed-or-equal permissions, and current runtime snapshots; it does not create hidden inter-agent channels, implicit shared state, or an unbounded task queue outside the crew board contract.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Child effective-authority is clamped before dispatch and audited after completion. Parent restrictions clamp the canonical `child-permission` envelope: child tool policy, write scope, FileSafe scope, mode ceiling, provider/model/account availability, and crew admission. Pre-dispatch budget denial, post-response budget-overrun recording, completion, cancellation, kill, terminal cleanup, child-session / provider-process teardown, and `budget-outcome` supervision all use the same canonical runtime outcome taxonomy.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

The stale later-stage example `Enforce maximum concurrent crews (e.g., 20 total)` from `Gap #45: Crew performance and scalability` is non-canonical. Crew and child admission use the executionLimits owner contract; no later-stage prose may reintroduce parallel caps that compete with that SSOT.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

Task-tool delegation must honor per-target deny rules and must reject unsafe self-dispatch loops. A long-running task that returns a `session_id` is still governed by the same child lifecycle, resume, timeout, and parent supervision rules rather than becoming an unowned detached session.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

#### Task tool contract alignment

Task and question escalation remain parent-owned. Subagents may request clarification only by escalating through the parent orchestrator; they do not address users directly, and task alignment follows the parent `/question` flow plus the child lifecycle contract instead of a child-local ask channel.

Child launch context carries a normalized effective skill/tool/permission/MCP snapshot plus cache-affinity, cache-hit, compaction-state, compaction-regression, and subagent context visibility context when provider-side caching, ordinary compaction, or dynamic context shrinking affects the handoff. These are propagation inputs to the PM child-run record and handoff bundle; they do not create provider-specific hidden channels or bypass the parent permission ceiling.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Prompt_Pipeline.md

AgentCard-style capability advertisement is allowed only as an inspectable capability summary for PM subagent selection. AgentCard data does not replace the registry, permission ceiling, runtime snapshot, or provider capability contract.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md

The legacy duplicate heading string `#### Task-envelope timeout contract` is retired as a separate live heading. The singular child timeout envelope above is the non-contradictory owner contract: terminal elapsed-time completion is `done.task_timeout`, while pre-dispatch and post-response budget outcomes follow the budget taxonomy. Any wording that under-specifies or over-summarizes this by reviving `done.timeout` or alternate timeout headings is non-canonical.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

The crew message board is the normative subagent-collaboration surface. BrainStorm, Crew, and Assistant projections may show collaborative summaries, but schema, routing, priority, rate limiting, orchestrator visibility, and parent mediation remain owned by this orchestrator contract.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md
