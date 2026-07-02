# Shard 009: Runtime Decision Rules Addendum (2026-03-08)

Source: `Plans/Decision_Policy.md`

Source lines: L333-L394

Source SHA256: `9ecf3fea83953a6a763b3d4cd902f1c5bba3b041b42ed48244dcc7a480af6030`

---

## Runtime Decision Rules Addendum (2026-03-08)

### 1. No hidden orchestration fallbacks


Runtime and consumer docs must not preserve tier-era or request-era canon as silent fallback behavior once replacement canon is locked.

Provider and account fallback may resolve automatically only when an eligible unit exists and policy permits fallback. Otherwise the terminal blocked reason is one of `no_eligible_account`, `no_eligible_profile`, `policy_forbids_fallback`, `hard_constraint_forbids_fallback`, `provider_unavailable`, `no_eligible_units`, `provider_disabled`, `provider_unconfigured`, `all_units_cooldown`, or `all_units_hard_blocked`.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md

### 2. Deterministic blocked and approval identity


Blocked and approval decisions resolve through runtime blocked episodes.

Rules:
- blocked actions target `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`
- `request_id` is lineage/compatibility only
- `allowed_action_ids[]` is canonical

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md

### 3. No silent runtime identity collapse


Deterministic defaults MUST preserve workflow overlay identity instead of collapsing it into runtime posture. In particular, `Deep Plan` remains a first-class `/workflow` display identity even when its normalized runtime mode is `plan`; any shared lower-level planning mechanics belong in subordinate `/profile` or behavior fields rather than replacing the `deep_plan` workflow identity.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md

### 4. Projection-state action policy
Mutating actions must not rely silently on stale or degraded projections.

Registry promotion flow, Docker Manager drift-detection, and Kubernetes operations are projection-sensitive mutation domains. Container panel state persistence and Docker/K8s event-registration coverage route to `Plans/Containers_Registry_and_Unraid.md` and `Plans/Contracts_V0.md`; Decision_Policy owns the shared guard: stale, partial, unknown, degraded, or account-changed receipt/state/drift evidence returns the action to blocked/preflight-gated posture and requires `/revalidate` immediately before mutation instead of treating a side-panel projection as authority. Registry promotion and drift-detection differentiators remain explicit future-scope anchors until owner docs promote narrower rules.

Setup/auth actions expose an explicit action-state lifecycle: idle, pending, success, failure, disabled, and post-success. A `/auth` action may not be treated as complete merely because a projection updated.

Provider pressure policy uses source-class evidence. An `authoritative_remaining_counter` drives `approaching_threshold` at `<= 20% remaining`; weaker inferred signals may be displayed as pressure but must not masquerade as authoritative counters.

GUI provider/model/account controls belong primarily in Agent-Config; Health and /Usage pages are observability and diagnostics surfaces rather than configuration owners for `/model/account` policy.

Cross-provider overwrite and /repair decisions for PM-managed targets should use explicit managed sections or /files where possible, avoiding broad free-form replacement when a managed target boundary exists.

Provider/account fallback blocks are terminal when no eligible policy-permitted unit exists. Canonical blocked reasons include `no_eligible_account`, `no_eligible_profile`, `policy_forbids_fallback`, `hard_constraint_forbids_fallback`, `provider_unavailable`, `no_eligible_units`, `provider_disabled`, `provider_unconfigured`, `all_units_cooldown`, and `all_units_hard_blocked`.

Question routing, blocked-card, and runtime-display defaults:
- `/G/L` question surfaces use parent-owned `question-flow` routing. Subagent access stays `default-denial`; `sendPrompt` has dual-context semantics for general prompts versus question-flow work and must not let a child answer the user through a child-local ask channel.
- Permission-blocked and HITL-required work presents the blocked state with ordered `allowed_action_ids[]` and an approval path. Approval UX uses the canonical `permission-level` ladder (`deny`, `once`, `for session`, `always`) above any per-command approval card; a separate HITL approval card may summarize the same blocked episode, but it does not replace blocked episode identity.
- Stale recovery action names are compatibility/display labels only: they must resolve to canonical `allowed_action_id` values and ordered `allowed_action_ids[]` in the runtime payload before any recovery button or menu item is executable.
- Approval cards MUST NOT mutate Persona permission profiles; in-chat approval is session/project-scoped in v1 and never persona-scoped.
- Failed command-card states keep the normal status `/meta` presentation. They do not gain extra retry or blocked-recovery affordances unless a higher-precedence blocked rule applies.
- Runtime-display consumers may show `/runtime-disclosure`, but they must not perform runtime-identity re-ownership. Prompt Pipeline and Multi-Account remain the owners for account routing and resolved runtime/account snapshots.
- Chat scroll `auto-follow` is a UI state that follows activity-card and question-card ownership; it is not a source of storage or permission policy.
- Debug `browser-context` auto-ingestion is visible, bounded, and revocable: storage-backed browser capture may feed active Debug investigations only as visible Investigation Context items or chips, never as silent chat capture or hidden messages.
- Debug investigation `blocked` reopen states render canonical blocked-state UI and must not auto-execute until the prerequisite changes.
- When a linked Debug runtime identity no longer exists and no deterministic rebinding target exists, reopen into `attention_required` with reason `target_selection_required`; PM must not silently mint or infer a replacement target.

Provider-owned identity and auth-surface wording must remain subordinate to `AuthState` and the bridge owner. Decision policy may decide fallback posture, but it must not redefine `provider_identity`, `auth_surface`, or bridge capability facts; those checks route to `Plans/Contracts_V0.md` and `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`).

Storage/runtime lock ambiguity resolves through the storage owner: `lock-path` is derived from the canonical `logical-root` and the storage fallback canon, not from surface-local path guesses.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md
