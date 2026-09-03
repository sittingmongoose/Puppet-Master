# Shard 004: Canonical data-shape reconciliation

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L109-L150

Source SHA256: `3109298d54ea966d7161ce851efa826bbb71ce09feba86cc2cc2b79fdaa307a2`

---

## Canonical data-shape reconciliation

### Required data shape

#### Stable account identity and credential references
- Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`.
- GitHub identity is account-keyed, not login-keyed: stable internal `account_id` is the durable join key, while login and disclosure-only provider metadata remain display/audit descriptors.
- Canonical GitHub runtime and mutation envelopes carry `requested_account_id`, `effective_account_id`, stable `account_id`, `credential_ref`, `account_type`, `account_login`, `execution_role`, `operational_identity`, and `account_switch_lineage[]`.
- `account_login` and any provider-native handle stay descriptive only; `credential_ref` points to the credential-store entry that actually authorizes the GitHub account.
- GitHub auth retry and failover follow multi-account policy: bare-context fallback may start without a persona only when the owning runtime contract permits it; Docker `/media/provider` and provider `/model` flows carry account-resolution lineage instead of stopping at provider/model labels.
- The requested-vs-effective admin capability UI displays stable `account_id`, effective-account, and switch-reason; login-keyed handles are display-only, and blocked-state copy explains why a requested account was skipped, clamped, or fell through.

#### Recovery context and mutation gating

- Run Graph and Orchestrator GitHub actions normalize onto `cmd.runtime` / `cmd.runtime.*` plus `cmd.orchestrator.open_in_` / `cmd.orchestrator.open_in_*` bindings with a mutation action envelope and trust-state gating.
- Trust/degraded-state split: low-risk read-only inspection may run on refreshing, stale, and sometimes degraded projections; deep-linking is allowed when target identity remains valid; live mutation, approval, recovery, retry, and cleanup require `current` or direct canonical-runtime validation.
- GitHub mutations and Orchestrator handoffs include `/degraded-state` gating and concern handoff rules before execution.
- Gating level `none` is limited to safe navigation or `/focus` actions and low-risk presentation actions that do not touch user-data and do not mutate live-runtime state.
- `contextual-help-only` guidance may appear on individual graph badges, narrow panel chips, trust-state chrome, widget-specific filter fields, and per-surface action gating messages, but it never upgrades a disabled or degraded action into an executable mutation.
- GitHub recovery payloads consume `execution_unit_context` as the runtime-facing union of immutable attempt handoff identity, active blocked `/recovery/runtime` gating anchors, and workspace `/isolation` anchors.
- Runtime-era command wiring/gate contracts require reverse `matrix-to-catalog` coverage, precondition `/freshness/mutation-risk` fields, stale-blocking policy, explicit dispatcher obligations, and machine-verifiable allowed-action selection before dispatch.
- GitHub-facing Orchestrator, widget, and Run Graph consumers read the shared `projection-health` / `trust-state` record family for action gating and fallback instead of inventing surface-local degraded-state checks.
- Historical-run rendering, idle widget rendering, and `/degraded-mode` projection gates are surface-level GitHub requirements as well as storage concerns; GitHub-facing views must show historical-run and degraded projection state before enabling mutation-capable actions.
- Multi-account GitHub and widget data sourcing must not fall back to pre-rewrite or single-account-only identity rules; cross-surface `/GitHub` and `/integration` pivots carry lane, package, `/runtime`, degraded-trust, `/package/degraded-trust`, and stale-data state into mutation gating and concern ownership.
- Mutation and `/recovery` audits carry stable workspace and provider-attempt anchors, because deferred provider work cannot be repaired correctly from GitHub login, branch, or panel state alone.
- Blocked `/HITL/policy` flows re-anchor on canonical node `/attempt` identifiers and the current blocked sequence before GitHub recovery, approval, retry, or cleanup continues.
- GitHub operations that traverse `/skills/formatters`, DAE, mixed mutation semantics, or runtime tool reachability inherit runtime safety and capability contracts; those capability boundaries must not remain under-owned or be recreated as GitHub-local auth rules.
- Orchestrator and Source Control stay intentionally asymmetric: Orchestrator owns package `/governance/execution` truth, while Source Control owns concrete Git `/worktree` inspection and mutation; GitHub routes preserve that split rather than treating repository hosting as the graph authority.
- Routing, blocked-family, and attribution flows reconcile end-to-end across owner and consumer docs before GitHub-facing commands claim a recoverable, attributable, or safe-to-mutate state.


- Add recovery context payload and trust/degraded-state gating for GitHub mutations.
- Every write-capable GitHub request carries `recovery_context { blocked_sequence, blocked_episode_id, recovery_handshake_state, trust_state, degraded_state, approval_id?, dae_jail_posture }`.
- A GitHub mutation may proceed only after the startup recovery handshake rebinds the current blocked episode, `trust_state` is writable, `degraded_state` is false, and any approval or DAE jail gate has been cleared.

#### Runtime identity and blocked-policy transfer
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- GitHub write attempts mint or reuse the current `blocked_sequence`; startup recovery must rebind that same sequence before resuming deferred work.
- Carry usage switch-history and usage execution-role follow-through.
- Usage and audit rows record `execution_role`, requested/effective account identity, switch history, pressure owner, and the GitHub `account_id` / `credential_ref` pair that actually executed the call.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md
