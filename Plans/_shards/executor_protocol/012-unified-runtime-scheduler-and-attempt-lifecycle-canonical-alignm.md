# Shard 012: Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment (2026-03-09)

Source: `Plans/Executor_Protocol.md`

Source lines: L728-L778

Source SHA256: `3ec1bdf87e2f0987f906375739d62055c38b721088d672f1d2d6209251ce0036`

---

## Unified Runtime Scheduler and Attempt Lifecycle Canonical Alignment (2026-03-09)


Compatibility/source-lineage disposition: this historical lifecycle addendum preserves attempt, tier-era, blocked-episode, approval, and provider/model carry-through tokens. It remains a source-lineage section subordinate to the consolidated executor/runtime owner boundary.

This addendum deprecates tier-era vocabulary and extends execution_unit_context, blocked-episode continuity, approval scope, and precedence/worktree ownership semantics.

### Tier-era compatibility retirement

Normative rules:
- Introduce execution_unit_context as canonical runtime-facing context object.
- The canonical dispatch/runtime packet carries execution_unit_context.
- The retired tier-era context object is a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context.
- The retired tier-era context object and the retired tier-era identifier are not canonical runtime fields; execution_unit_context together with execution_unit_type defines authoritative runtime scope.
- Worker spawn MUST mint or receive execution_unit_context before dispatch, and recovery plus remediation MUST rehydrate that same packet rather than reconstruct runtime scope from retired tier-era compatibility fields.
- Coordination services, scheduler joins, and UI inspection surfaces MUST read one shared execution_unit_context instance so restart, approval, blocked-episode continuity, and audit views resolve the same runtime unit.
- Compatibility adapters MAY derive the retired tier-era context object only for legacy selector translation or decomposition, but they MUST NOT persist, exchange, or rehydrate it as the live runtime contract.
  ContractRef: Primitive:ExecutionContext
  ContractRef: ContractName:Plans/Executor_Protocol.md

### Blocked episode identity and restart recovery


#### Blocked episode acceptance carry-through
- Make blocked_sequence canonical per run_id/node_id blocked episode
- Restore unresolved blocked episodes on restart without reminting them
- Keep request_id as subordinate compatibility handle only
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Separate blocked-episode approval scope from session-wide policy scope
- Persist durable approver identity fields on approval and rejection events

### Provider/model precedence and parallel worktree assignment

#### Provider/model acceptance carry-through
- Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Tie that section to parallel-node worktree assignment and ownership transitions
- Provider and event records for dispatched work must be promotion-aware and preserve requested/effective account resolution across package and seam overseer delegation; `Phase/Task/Subtask/Iteration` remains legacy taxonomy, not canonical runtime ownership.
- Actor resolver inputs include actor type, package overseer, seam overseer, node worker, verifier/`/reviewer`, corroborator, graph patch planner, recovery actor, operation type, scope level, language/framework, repo `/domain`, and GUI, backend-heavy, or infra-heavy hints. Planning and `/patching` are explicit operation types rather than hidden fallbacks.
- The high-level persona defaults remain policy defaults, not vague prompts: package overseer is biased toward package-local delivery and `/governance` readiness truth, seam overseer toward cross-package integration truth, node worker toward `/implementation` by language and `/framework/work`, verifier/`/reviewer` toward review, corroborator toward `/challenge`, recovery actor toward `/recovery`, and graph patch planner toward `/architecture`.
- `auto` resolution must be explainable through an actor-type mapping. When `auto` selects an account/model/persona for an overseer or worker, the receipt records the resolved actor-type basis so overseer-heavy rewrite roles do not feel arbitrary.

Persisted executor/runtime events consume the canonical EventRecord envelope in `Plans/Contracts_V0.md#EventRecord` and the machine-readable schema in `Plans/event_record.schema.json`. Executor-owned records may define event semantics and receipts, but they must not copy the EventRecord field set or store raw secrets in event payloads.

### Run-level deferred rule
- if any node is runnable, the run remains active.
- if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal.
- prerequisite resolution, restore completion, remediation completion, auth recovery, or capacity change wakes the scheduler.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md
