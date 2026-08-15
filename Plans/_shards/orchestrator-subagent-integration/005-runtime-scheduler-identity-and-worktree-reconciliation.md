# Shard 005: Runtime scheduler, identity, and worktree reconciliation

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L81-L126

Source SHA256: `36eec1750405a528e563326af1b4b751fba863cf823ee12780f0416e633a4498`

---

## Runtime scheduler, identity, and worktree reconciliation
Orchestrator consumes canonical runtime fields and event names from shared contracts; it must not revive local page-spec ownership such as `PuppetMasterEvent::*`, PuppetMasterEvent, `/type`, or `/schema` as first-class runtime schema. Exact transfer rows that mention exact_items, exact-missing, missing_data_shape, missing-owner-heading, gap-001, gap-002, gap-003, gap-004, gap-005, gap-007, gap-008, result_id, audit-stable, `/lineage`, anti-pattern residue, and lifecycle-boundary must resolve into explicit owner headings and runtime records instead of remaining ledger-only defect names.

### Cross-surface receipt record

The scheduling model is graph-native: runnable graph nodes, DAG readiness, scored ready-set selection, and runtime-selection use plan-graph, plan_graph, project_plan_graph_index, project_plan_graph_index.schema.json, plan_graph.schema.json, `/project/plan_graph/index.json`, puppet-master/project/plan_graph/index.json, `/node`, `/node/runtime`, node shard files, and sharded-only execution inputs. Any `Phase / Task / Subtask / Iteration`, Phase, Task, Subtask, Iteration, tier_id, active-tier, TierChanged, tier-scoped, tier-keyed, tier-native, runnable-unit, or TierContext language is derived display or compatibility context only. Lexicographic-style selection is retired in favor of the scored ready-set.

Runtime identity carry-through is mandatory across orchestrator, interview, and usage. Plans/usage-feature.md, /usage-feature.md, Plans/interview-subagent-integration.md, /interview-subagent-integration.md, Plans/orchestrator-subagent-integration.md, /orchestrator-subagent-integration.md, execution_unit_context, requested_account_policy, requested_account_binding, persona_override_owner_id, plan_or_tier_default, SSOT, `select_for_tier()`, select_for_tier, account_id, requested_account_id, operational_identity, runtime-identity, runtime-role, billing-identity, `/account-history`, `/effective`, tool_use_id, and carry-through fields must preserve requested/effective account and role disclosure rather than narrowing to one local packet.

Worktree allocation is package-based by default with seam/lane exceptions documented by policy. SCM and /worktree behavior uses Plans/WorktreeGitImprovement.md, /WorktreeGitImprovement.md, package-based lane pools, branch-per-tier compatibility notes, contamination quarantine, restore-before-reuse, same-cycle event-driven update, file-lease rejection, first-class `/update`, `/backoff`, steady-state avoidance, worktree-native isolation, and safe-point-aware `/transition` recovery. Dependent nodes stay same-lane by default; promote-then-fork occurs only when it improves safe parallelism.

Delegated work and memory loops remain parent-owned. Fresh-iteration loops may read `/plan`, append-only progress, reusable-pattern summaries, repo state, git history, `/gotchas`, and files changed, but they do not create hidden orchestrator memory beyond assistant-memory-subsystem, assistant-memory-subsystem.md, /State, system-prompt, and newfeatures.md owner boundaries. Task/run/subagent, package-level overrides, run scope, subagent scope, and multi-project package-lane execution must not collapse into FIFO chat ordering.

Provider and permission boundaries stay explicit. Plans/Provider_Stream_Mapping_External_Reference_A2A.md and /Provider_Stream_Mapping_External_Reference_A2A.md are adapter references only; hard-wires to tier scope are non-canonical when they drop /account/trust metadata. Permissions_System.md and Permissions_System consumer rows must project blocked-reason, safe-point, event-family, tier_type compatibility labels, `/event/usage`, policy-visible role routing, UI_Command_Catalog, UI_Command_Catalog.md, per-command route meaning, and `MUST VERIFY` / VERIFY inspection requirements through shared runtime events.

Packet emission is gated by target-level fidelity. Packet artifacts may be useful planning state, but they are not faithful-emission-safe until packet-planning inputs remove contradictions in owner docs, target-level runtime fields, and /graph scheduling records. The orchestrator therefore treats packet-planning as a preflight contract, not as proof that downstream packet emission can proceed.

Scheduler and account selection fallbacks are deterministic. Graph scheduling uses package-based /graph lane pools, /capacity-aware ready-set filtering, blocked constraints, and wake reasons before dispatch. If a preferred subagent, Persona, provider, or /provider/model candidate is unavailable after capability filtering, the orchestrator falls through to the next eligible candidate while recording requested Persona, effective Persona, selection reason, skipped Persona controls, and any requested_account_policy /control frame that explains how selection occurred.

Scoped overrides have explicit lifecycle boundaries: turn, session, run, task, and subagent overrides are separate records and must not collapse into one sticky runtime setting. TierContext is retained only as a compatibility wrapper that may carry legacy_decomposition_context beside canonical execution_unit_context; storage-side runtime consumers and human-in-the-loop projections must treat execution_unit_context as the owner field.

SCM and worktree policy remains package-based end-to-end. Orchestrator worktree visibility records package-based lane-pool allocation, contamination classification, lane quarantine, safe-point recovery, and restore-before-reuse semantics shared with Source Control, while usage attribution is recorded on /package/seam/attempt/remediation dimensions rather than centering tier_id.

The six-pass owner-doc audit posture is canonical for this integration surface: remaining issues are exact owner-doc structural mismatches and target-level drift, not permission to re-use stale source scaffolding. Orchestrator consumers must route storage-side gaps back to their owner docs and keep follow-up records visible until the owner span is repaired.

Destructive action taxonomy is canonical. `non_reversible` covers durable `/live` state mutation such as deleting records or `/skills/files` without a protected restore path. FinalGUISpec.md, /FinalGUISpec.md, page-spec, Overseer, Package, Lanes, detached_window, project-state, artifact_kind, task_id, and Plans/UI_Command_Catalog.md / /UI_Command_Catalog.md references are consumer or compatibility vocabulary unless this orchestrator section names the runtime owner.

`ActiveAgent`, crew structs, and coordination payloads key first on canonical execution refs such as run/thread/parent-child/node/attempt/package/seam/lane identity. Any `tier-keyed` field is a compatibility label only; it must not outrank `/package/seam` runtime identity or become a primary crew lookup key.

Orchestrator action metadata is `command-owner` bound to `Plans/UI_Command_Catalog.md` / `UI_Command_Catalog`: every Orchestrator action declares whether it is `palette-visible`, `shortcut-worthy`, `context-menu` only, `bulk-safe`, or `bulk-forbidden`, and bulk mutation remains disabled unless the catalog and permission contracts both allow it.

GUI `execution-policy` settings choose retry identity and node worker class explicitly: default retries use a fresh agent/subagent, optional same-agent retries retain prior context only when policy allows, and node execution uses `/subagent` workers by default with a full-agent override recorded as runtime policy rather than hidden state.

Graph schemas must not `hard-code` lexicographic selection as execution authority. The scored `ready-set` is canonical; schemas and consumers preserve `node-first` `runnable-unit` identity, while `/task/subtask` and `Iteration` are display or compatibility lenses only.

Tier `/view` identity is projection-only: `tier_type`, `tier_id`, title/description, and optional parent labels may help UI grouping, but they never replace run/node/package/seam/attempt identity in runtime routing.

Coverage/audit notes for this owner doc treat the remaining partial tail uniformly as `Gemini + Opus + Sonnet`; there is no command-owner or orchestration-tail exception that permits uneven pass coverage after the merge.

Retry and remediation preserve `structured-attempt-handoff`: each failed node attempt emits a receipt of what it did, what changed, why it failed or was `/blocked`, and what to try next. Retries remain policy-driven with `/caps`; some outcomes route to remediation, graph patch, `/worker` replacement, or `/HITL` instead of blind looping, and the `/handoff` artifact remains attached to the next `/subagent` attempt.

Parallelism uses package/seam `lane-pool` capacity rather than stale `per-thread` queues, `per-provider` caps, parallel subtasks, or crews-per-tier as execution owners. Those older shapes may appear only as migration notes that map into package/seam promotion and lane capacity.

Storage receipt and `/activity` gaps reported through this surface are `under-transfer` or anchor failures until the storage owner records the missing receipt contract; they are not total `missing-content` claims against this orchestrator doc.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md
