# Decision Policy (Canonical)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DETERMINISTIC DECISION POLICY

Goal: remove deferred-decision ambiguity by defining deterministic defaults.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This policy applies whenever a plan or implementation encounters an ambiguity that is not resolved by Spec Lock, Crosswalk, DRY Rules, or Glossary.

ContractRef: PolicyRule:Decision_Policy.md

---

## 1. Precedence (non-negotiable)
Resolve ambiguity in this order:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. This policy

ContractRef: SchemaID:Spec_Lock.json

---

<a id="2"></a>
## 2. Deterministic defaults (must be autonomous)
When multiple valid choices exist and higher-precedence sources do not decide:

1) **Prefer the simplest safe default** that does not expand scope.
   - Example: choose a single host (GitHub.com) rather than adding multi-host abstractions.

2) **Prefer API-only over CLI subprocesses** when both are possible and Spec Lock forbids the CLI.

3) **Prefer idempotent behavior**.
   - If an operation can be repeated safely, implement it as idempotent (no double-side-effects).

4) **Prefer bounded retries**.
   - Retries MUST have explicit limits and backoff.
   ContractRef: PolicyRule:Decision_Policy.md§2

5) **Prefer stable IDs over inferred labels**.
    - UI commands use `cmd.*` IDs; event types use stable `type` strings.
    - For OpenCode `/server-bridge` decisions, prefer `connection_profile_id` for persisted account/server identity and use `selectable_unit_id` only as an additive scheduler `/debug` field, not as a user-facing replacement for `account_id`.
    - Provider-account policy decisions keep `usage_record` growth attribution-relevant: add fields only when they materially affect rollups, explanation, or cross-surface attribution.
    - Provider/account `/identity`, execution role, and operational identity remain distinct; `Plans/Prompt_Pipeline.md` (`/Prompt_Pipeline.md`) owns effective runtime record and `/account` resolution steps for binding/identity semantics.
    - Debug investigation IDs use `investigation_id` as the grouping identity across evidence, attachments, verification steps, fixes, and existing session IDs; `thread_id`, `run_id`, `dev_session_id`, `terminal_session_id`, and `browser_session_id` remain linked identifiers rather than replacing that grouping key.

6) **Prefer current provider/account policy over stale provider tables**.
   - Section `6. Provider-specific behavior` rows for Codex/Copilot/Gemini/Cursor/OpenCode are advisory when stale; current selection policy is owned by Contracts, Multi-Account, Models, and provider contracts.
   - Remaining provider-table cleanup is an edge-case review for collisions and provider-specific awkward raw names, not a blocker for the core requested/effective account contract.

### 2.1 Runtime trust and identity defaults

Operational identity is a separate policy layer from provider-account identity. `Multi-Account.md` distinguishes `github_api`, registry identity, Kubernetes context, provider-account routing, and operational side-effect identity; the shared effective-resolution record must not collapse those into `/model/persona/auth/account` or a generic GPT provider field family. Runtime and `/attempt` packets must carry `execution_role` when role-by-provider, role-by-account, and execution-role-aware policy decide the route.

Approval and recovery policy treat `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) drift as a field-name and field-family normalization problem: `allowed_action_ids` is canonical over `allowed_actions`, and recovery, replay, storage, approval identity, and persistence semantics must share one compatible shape. HITL is off by default; users may configure `/review` or `/approval` checkpoints at work-package or feature-seam level, but automation remains the normal path and humans surface only for critical failure-class-to-restore, major `/decision`, or safe-point `/resolution` cases with GUI, `/thread`, and `/settings` implications visible.

Projection trust policy allows read-only navigation on `stale` or some `degraded` projections only when the UI says so clearly. Live mutating or decision-bearing actions must tighten on trust state and use copy such as `Warning: provider pressure high`, `Blocked: waiting on user approval`, `View may be stale; refresh before acting`, and `Projection degraded; showing canonical history only` when those states apply.

Orchestrator semantic scope is page-owned, not widget-owned. Page and `/router` state owns `project_id`, `focused_run_id`, historical-run mode, and object focus; widgets may add presentation or sub-filter choices, but they must not secretly select a different `/run` or redefine operational scope.

Permission, model, and account policy must keep execution context explicit: `Plans/Permissions_System.md` (`/Permissions_System.md`) needs runtime-overlay terminology, identity linkage, approval cache scoping, and multi-actor execution support; `Plans/Models_System.md` (`/Models_System.md`) needs transport `/upstream` identity cleanup to prevent projection ambiguity. `account_pressure_episode` tracks pressure state and confidence `/source` over time, while `account_switch_event` records the actual routing change or failed-switch decision.

Conversational and tooling surfaces share one degraded-trust and concern-escalation bridge. Blocked overlays, approval prompts, and tool-health disclosures must expose runtime-trust, `/concern`, and degraded-trust state consistently, and chat threads need a natural place for switch events, concern notices, and trust-staleness explanation when runtime state is projection-derived.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md

### 2.2 Runtime ownership and action gating defaults

`Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`) is a consumer of canonical execution and `/runtime` context, not the owner of a mixed runtime object. It may keep local selection and `/decomposition` helpers for subagent policy, but route, identity, approval, blocked, and recovery semantics come from the canonical runtime and policy contracts.

Approval identity must not be reconstructed from `request_id + tier_id + tier_type`, ambient tier labels, or a `one-off` `resume_url`. `request_id`, `tier_id`, `tier_type`, `resume_url`, `/wizard`, and `/object` values are compatibility, lineage, or derived route/object data under blocked-episode identity; they are not primary execution scope. Tier and `/group` surfaces consume pointers into the canonical contract instead of rebuilding runtime identity from `tier_id` plus ambient state.

Runtime blocked reasons remain runtime truth even when Source Control or SCM surfaces display remediation. `dirty_worktree` and `worktree_conflict` stay exact blocked reasons, remain visible in both surfaces, and must not be softened into generic SCM errors; Source Control surfaces the condition and allowed remediation actions while Orchestrator owns blocked consequences.

Concern closure requires action policy as well as lifecycle labels. A `dismissed` concern needs required rationale, a `resolved` concern needs `resolution_kind`, and `merge`, `split`, and `supersede` actions need explicit lineage policy so related concerns do not silently lose ancestry or semantic distinction.

`Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) must carry actor, `/lane/account`, approval provenance, and concurrency-safe queue and `/scope` rules as part of its blocked-episode approval model. `Plans/interview-subagent-integration.md` (`/interview-subagent-integration.md`) must preserve runtime identity parity and a stable `routing-key` whenever interview-specific phases project into shared orchestration, approval, or recovery policy.

`tier-level` settings may remain as user-facing configuration only when reframed as approval-trigger policy; they are not canonical approval object identity. Automation-first execution remains the default: approval-heavy UX defaults such as phase-complete approvals, manual review steps, modal confirmations, or direct-click approvals are optional HITL boundaries, not mandatory runtime progress checkpoints. The GPT-5.4 audit finding is retained in transfer metadata for this policy rule, but live execution policy is model-neutral.

Tool, approval, and blocked records must be node/actor/account-aware. Tool events must not remain under-attributed analytics exhaust; first-class runtime trace events carry `/actor/account-aware` and `/identity` links plus the effective account/identity that would have executed the approval or blocked action.

Runtime approval and recovery flows normalize one key family across chat/HITL/runtime commands/storage. `/HITL/runtime` approval identity, `/storage` persistence, command payloads, and blocked recovery records must agree on `allowed_action_ids[]`, blocked episode identity, approval scope, and lineage fields before a recovery or approval action is executable.

Degraded-projection action gating is action-class aware. Actions that change execution, `/promotion/recovery/approval` truth, or recovery state require fresh-enough projection state; observational `/navigation/export` actions generally remain safe. UI explanations identify what is stale, why it matters, and the available next action instead of hiding gating behind generic disabled controls.

Cross-surface research and remediation decisions must keep `/surface`, cross-surface lineage, receipts, blocked UX, and `/recovery/remediation` consequences visible until the owner split is settled; page/surface design, runtime state model, and blocked recovery UX are not interchangeable discussion threads.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

### 2.3 Runtime projection, route-owner, and persistence defaults

The provider/model/persona/account policy model also applies to worker policy. Worker selection and execution policy must not stop at `/model/persona/account`; worker routes carry the same identity, account, role, and permission separation expected from provider and runtime decisions.

Evidence and artifact views are durable-first under projection loss. `Evidence`, `/artifact`, and `/artifacts` browsing may survive stale projections because records and artifacts are canonical records, but `new-links` and `/live-status` indicators may not. Copy for these states must be explicit: `View may be stale`, `Projection degraded`, `Live actions unavailable until refresh`, and `Showing canonical history slice`. If a summary surface is `stale`, local `in-app` indicators may remain visible only with staleness wording; if a surface is `degraded`, avoid strong notification claims derived from incomplete rollups and prefer notifications rooted in canonical events or `/blocked` records.

GitHub realm isolation remains part of runtime identity. `multi-account` `/runtime` policy must not collapse `github_api` and `copilot_github` into one identity bucket, and `Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`) must materialize runtime identity through its constructor and `/coordination` path rather than merely declaring that identity.

Route and primitive ownership stay split: `Contracts_V0.md` is the correct owner for the canonical route contract, while `Crosswalk.md` is the correct owner for the primitive boundary declaration. If a seam still requires inventing a new canonical event `/record` family, that seam remains research-incomplete and must not be treated as done.

Worker output, approval targeting, and live graph bindings must flow through canonical blocked projections. `tier_id` worker-output correlation, `request_id` approval targeting, and graph `/orchestrator` `live-status` bindings are upstream drift risks when they bypass canonical blocked projection identity.

Routing and bridge cleanup remains incomplete until schemas, enums, operational policy layers, routing `/bridge` refinement rules, and same-file canon collapse are reconciled. `storage-plan.md` (`storage-plan`) may retain both `attempt_record` and `tier_runtime_record` only if `tier_runtime_record` is explicitly derived and `/view-oriented`, never the hidden owner of runtime identity.

Approval identity is unified across HITL, `/chat/runtime`, and runtime recovery. `request_id`, `blocked_sequence`, and approval scope converge on episode-scoped restart persistence rather than run-scoped persistence, so restart recovery does not lose the blocked episode being approved.

`Decision_Log.md` records explicit rewrite-era owner-boundary decisions as durable records whenever routing, Orchestrator ontology, blocked identity, runtime identity, or projection-trust vocabulary changes. `Plans/Decision_Policy.md` may set deterministic defaults, but durable decision records preserve which owner-boundary was decided and why.

`Plans/Contracts_V0.md` remains the owner-contract seam for runtime identity, blocked identity, and route/open ownership. Decision Policy records deterministic posture for `/open`, approval, recovery, and projection trust, but it does not replace the Contracts schema owner for route/open contracts.

Reconciliation proceeds as a canon-collapse and owner-schema completion pass, not as generic polish. Owner-schema gaps, same-file mixed-era canon, and schema/contract drift are transfer blockers until owner contracts and schemas are reconciled first, then primary consumers collapse their stale same-file alternatives.

Persistence-contract decisions are not appendix-level wording trivia. Any policy that changes durable keys, approval scope, recovery lineage, widget layout persistence, or runtime identity storage is a persistence-contract decision and must be represented in the owning contract/storage/policy documents before downstream UI copy relies on it.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/human-in-the-loop.md

### 2.4 Route-target, blocked-object, and runtime-identity cleanup defaults

Runtime identity is not replaced by artifact lineage. `logical_artifact_id` and `linked_artifact_id` are lineage and `/navigation` helpers only; they may point users to related records but do not become runtime identity or blocked-object identity. CtA card actions and `blocked-notice` actions are first-class consumers of the canonical `route-target` model, and any state they display remains real without becoming canonical route identity.

Blocked episodes are targetable objects. `blocked_sequence` has canonical identity meaning alongside `/attempt`, but blocked work should not route only through node/attempt views when the blocked episode itself is the object being approved, resumed, inspected, or remediated.

Usage routing cleanup includes `usage-feature.md` (`usage-feature`) and its duplicated `cost_usage` section. That normalization must happen with Usage routing so usage/cost decisions do not keep separate, stale ownership surfaces.

Canonical blocked objects carry a cross-family minimum: blocked reason, ordered allowed actions when applicable, `preserved-work` and `local-state` disclosure when applicable, stable `blocked-episode` identity or a `family-local` equivalent, and detail `/report` inspection references. Reconciliation retires request-centric opening contracts and rebuilds around blocked `/runtime` approval identity, canonical runtime action families, and `lineage-preserving` persistence through blocked records.

Route/open ownership is subject-first when the subject is already present. `preview_subject_id` proves subject-first identity is viable; `/open` routes should align to that instead of inventing a second identity model. `subject_id` routes are valid for content subjects only, while `object_kind` routes are valid for `non-subject` objects only. `runtime-artifact` identity language must move away from stale `task_id` framing toward runtime `/object` identity.

Search and deep-link routing require object-kind vocabulary to avoid ambiguity. `object_kind` and object identity decide non-subject routed objects before surface-local search, filter, or deep-link parameters add presentation context.

`tier-shaped` objects may survive only as compatibility or selector overlays for phase/task/subtask/iteration navigation. They must not pretend to be canonical runtime context, and any `/task/subtask/iteration` selector that remains user-visible must point back to canonical run/node/attempt/lane/worktree identity.

Cleanup `/lifecycle` policy must avoid destructive ambiguity between archive/remove/prune/recover behavior. `/remove/prune/recover` actions distinguish visibility archival, physical pruning, semantic removal, and recovery or restore posture before mutating live records or hiding historical lineage.

Large-run interaction policy is Orchestrator-wide. `FinalGUISpec.md` virtualization language elsewhere is not enough; Orchestrator views need a `large-run` and `/pagination` policy that preserves progress, blocked, and evidence navigation without pretending every run graph can render as a single flat view.

OpenCode and bridged request/runtime bundles must carry the full auth `/account` identity block plus explicit `upstream-provider` identity rules in `/runtime`, so bridge consumers can distinguish upstream provider identity from local account, role, and operational identity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Graph_View.md

7) **Prefer redaction**.
   - If data might be a secret, treat it as a secret and do not persist it.

ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations

---

## 3. Tie-break rules (ordering)
If two choices are otherwise equal:
- Choose the option that is already referenced by an existing plan document.
- If still tied, choose lexicographically smallest stable ID.

ContractRef: PolicyRule:Decision_Policy.md§2

### 3.1 Autonomous decision logging contract

When Puppet Master resolves an ambiguity without human input, it MUST emit exactly one schema-valid auto-decision row for that resolved ambiguity.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§2

Two logging scopes exist:
- `Plans/auto_decisions.jsonl` — internal Puppet Master plan-governance decisions.
- `.puppet-master/project/auto_decisions.jsonl` — user-project decisions made while generating or validating project artifacts.

Path selection rule:
- If the decision changes or explains Puppet Master internal SSOT documents, write to `Plans/auto_decisions.jsonl`.
- If the decision changes or explains generated user-project artifacts under `.puppet-master/project/**`, write to `.puppet-master/project/auto_decisions.jsonl`.

Field semantics:
- `scope` MUST identify the decision domain deterministically.
- `inputs_hash` MUST be computed from the ambiguity inputs actually used to make the choice, using a deterministic byte representation chosen by the owning subsystem.
- `decision` MUST name the winning choice in stable language.
- `rationale` MUST state why the winning choice was required by the precedence stack or deterministic defaults.
- `applied_to[]` MUST identify the concrete targets affected by the decision.
- `contract_refs[]` MUST include the authoritative references that justified the choice.

Security rule:
- Auto-decision rows MUST NOT contain secrets or credential material in `decision`, `rationale`, or `applied_to[]`.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§1, PolicyRule:no_secrets_in_storage, Invariant:INV-002

---

## 4. "No human in the loop" rule
Plans MUST NOT depend on humans making decisions mid-run.
If a plan describes optionality, it MUST declare a deterministic default and cite this policy.

ContractRef: PolicyRule:Decision_Policy.md§2

---

<a id="spec-lock-update-protocol"></a>
## 5. SpecLock Update Protocol (autonomous; no human readers)

**Rule:** `Plans/Spec_Lock.json` is a lockfile; agents MUST only update it via this protocol and MUST proceed deterministically (no interactive human-decision pauses; deterministic logging remains required where this protocol says to append to `auto_decisions.jsonl`).
ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1

Operational handling: `Plans/Spec_Lock.json` is verified after canonical doc edits and MUST NOT be hand-edit updated outside this protocol. `Plans/auto_decisions.jsonl` is pipeline-managed by deterministic logging and MUST NOT be hand-edit maintained as a manual ledger.

### 5.1 When Spec Lock updates are allowed


Spec Lock updates are allowed only when at least one locked invariant/decision must change to satisfy a higher-level requirement (e.g., a new official toolkit version, a required auth scope change).  
ContractRef: SchemaID:Spec_Lock.json

### 5.2 Required steps (deterministic)
When an update is required, agents MUST:
1. Update `Plans/Spec_Lock.json` fields (no partial updates).  
   ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
2. Recompute and update `canonical_ssot_hashes[*].sha256` for every SSOT file listed in Spec Lock.  
   ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes
3. Append one JSONL row to `Plans/auto_decisions.jsonl` describing the change and its deterministic rationale.  
   ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
4. Produce an evidence bundle for the update (schema-valid) and run the verifier gates.  
   ContractRef: SchemaID:pm.evidence.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

Schema-file binding: `Plans/auto_decisions.schema.json` defines `pm.auto_decisions.schema.v1`, and `Plans/evidence.schema.json` defines `pm.evidence.schema.v1`; schema file paths are existence and validation targets, not competing schema IDs.

### 5.3 Prohibited update behaviors
Agents MUST NOT:
- add `TBD` / `Open Questions` / `ask later` language as part of a Spec Lock update  
  ContractRef: ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators
- leave hashes stale after changing SSOT docs  
  ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes

---

### PolicyRule: no_secrets_in_storage

**Scope:** All persistent stores (seglog, redb, Tantivy indexes).

**Rule:** Persistent stores MUST NOT contain secrets (tokens, passwords, API keys, OAuth refresh tokens). Tokens live only in the OS credential store (platform keyring). Violations are P0 bugs requiring immediate remediation.

**Rationale:** Secrets in persistent stores risk exfiltration via backup, log export, or crash dump. The OS credential store provides encrypted, access-controlled storage.

**Cross-references:**
- Architecture_Invariants.md#INV-002
- Crosswalk.md §3.5 (SessionStore rules)
- Crosswalk.md §3.6 (AuthState rules: "Tokens MUST NOT be persisted in AuthState")

ContractRef: PolicyRule:no_secrets_in_storage, Plans/Architecture_Invariants.md#INV-002

---

<a id="6"></a>
## 6. Ambiguity vs. Missing User Intent


### 6.1 Ambiguity (multiple valid choices)


**Definition:** The specification leaves open a technical or design choice where multiple options would equally satisfy user intent.

**Resolution rule:** Apply a deterministic default from §2. Log to `Plans/auto_decisions.jsonl` with schema `pm.auto_decisions.schema.v1`. No user interaction required.

**Examples:**
- Choosing a buffer size
- Picking a retry count
- Selecting a color within a brand palette

ContractRef: `PolicyRule:Decision_Policy.md§2`, `SchemaID:pm.auto_decisions.schema.v1`

---

### 6.2 Missing User Intent / Insufficient Specification

**Definition:** The user has not expressed what they want — the system cannot infer intent because the choice materially affects product behavior or scope. This is NOT a technical implementation detail; it is a product decision only the user can make.

**Resolution rule:** The system MUST generate a clarification question. It MUST NOT apply a deterministic default. The clarification question is captured in the requirements quality report (`Plans/requirements_quality_report.schema.json`, field `needs_user_clarification[]`).

**Examples:**
- "Should the wizard allow importing from a URL or only local files?"
- "Should failed iterations retry automatically or pause for user review?"

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `PolicyRule:Decision_Policy.md§4`

---

### 6.3 Interaction with the "No Human in the Loop" Rule (§4)

The §4 rule ("plans must not depend on humans making decisions mid-run") applies to **runtime execution** (orchestrator runs, agent iterations, verification gates).

Clarification questions under §6.2 are generated **prior to execution**, during wizard/interview artifact generation. This does NOT violate §4.

**Timing:** Clarification questions surface during Chain Wizard or Interview phase, before any orchestrator run begins.

**Blocking rule:** If a clarification question cannot be resolved before an orchestrator run begins, the run MUST NOT start. The wizard state transitions to `attention_required` and blocks the "Start Run" action.

ContractRef: `PolicyRule:Decision_Policy.md§4`, `ContractName:Plans/chain-wizard-flexibility.md`

---

### 6.4 Requirements quality report boundary, severity, and persistence


The `requirements_quality_report` is a pre-execution artifact. It MUST be generated during the mandatory validation sweep defined in `Plans/chain-wizard-flexibility.md §12` after Contract Unification and before any orchestrator run, plan-node execution, or user-visible "Start Run" action begins.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

Blocking rule:
- Execution MAY continue only when the latest canonical report has `verdict: "PASS"` and `needs_user_clarification[]` is empty.
- If `needs_user_clarification[]` is non-empty, the workflow MUST transition to the clarification/escalation path instead of starting execution.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4

Deterministic severity rules:
- `missing_scenarios`, `missing_boundary`, `missing_anchor`, `missing_acceptance`, and `missing_research` are always `blocking`.
- `contradiction` is `blocking` when it changes product behavior, acceptance expectations, or contract/plan routing; otherwise it MAY be `warning` only when a deterministic autofix resolves it fully.
- `vagueness` is `blocking` when it prevents executable acceptance, boundary declaration, or user-intent resolution; otherwise it MAY be `warning`.

Persistence safety rule:
- Before persisting `description`, `before`, `after`, `context`, or `question` fields in the quality report, Puppet Master MUST redact secret-like values and MUST NOT copy credentials or tokens into the artifact.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:no_secrets_in_storage

Lifecycle note:
- Clarification-round limits and `blocked` transition semantics are owned by `Plans/chain-wizard-flexibility.md §15`; this section defines the pre-execution boundary and severity rules only.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4, PolicyRule:no_secrets_in_storage, Invariant:INV-002, ContractName:Plans/chain-wizard-flexibility.md#12-three-pass-canonical-validation-workflow-mandatory-invariant-sweep

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
## Runtime Recovery Deterministic Defaults Canonical Alignment (2026-03-09)

Where higher-precedence sources do not decide, use these defaults:
- scored event-driven scheduling is the default runtime model
- canonical event names and enum families from `Plans/Contracts_V0.md` win over older aliases
- `watchdog_recheck` may emit redundant wakeups defensively, but MUST NOT become the primary correctness path
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
- no critical-path scheduler term in MVP
- blind retry is forbidden
- default retry ceiling remains `3` attempts unless a higher-precedence contract narrows it
- default remediation ceiling remains `3` generations unless a higher-precedence contract narrows it
- blocked outcomes preserve completed local work by default when execution stopped because a prerequisite or remote side effect was unresolved
- prerequisite resolution always creates a new attempt snapshot rather than mutating an old one in place
- draft decomposition may degrade only before graph lock
- canonical graph integrity failures do not degrade silently
- Mutation-sensitive git snapshot failures are CRITICAL and must not be swallowed: if `git add` or an equivalent snapshot step fails, `/undo` metadata must not advance to a poisoned hash or silently point at a weeks-old state.
- Provider response guards are deterministic: PROV adapters must check `choices.len` before indexing; an empty content-filtered response maps to `FinishReasonContentFilter` instead of a panic or normal completion.

Where earlier policy prose is ambiguous, these defaults win.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
## Canonical Runtime Recovery Matrix Completion


### Additional blocked rows
| classifier family | classifier | automatic next step | counter family | backoff | requires safe-point restore | remediation | terminal / escalation |
|---|---|---|---|---|---|---|---|
| `blocked_reason_code` | `validation_blocked` | wait for corrected input or explicit user action | `manual_resume_count` | none | no | optional | remain blocked |
| `blocked_reason_code` | `remediation_ceiling_exceeded` | no automatic retry | none | none | no | no | remain blocked until replan, manual fix, or abort |
| `blocked_reason_code` | `worktree_conflict` | wait for conflict resolution | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `dirty_worktree` | wait for cleanup or restore action | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `plugin_hook_blocked` | wait for hook resolution or explicit override action | `manual_resume_count` | none | no | no | remain blocked |

### Timeout normalization
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md
`tool_outcome = timed_out` MUST first normalize to `failure_class = provider_transient`, then follow the canonical provider-transient row.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

### Field-level override


When a blocked payload sets `requires_safe_point_restore = true`, that field overrides the row-default rerun path.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

## Source Control, GitHub Actions, and Docker Manager Blocked-State Addendum (2026-03-12)

Additional deterministic blocked defaults for this packet:

| blocked trigger | default posture | required user-visible effect |
|---|---|---|
| `worktree_conflict` | remain blocked until resolution | show Source Control recovery CTA |
| `dirty_worktree` | remain blocked until cleanup or restore action | show Source Control recovery CTA |
| `failure_class = auth_expired` for GitHub-hosted Actions admin/run actions when refresh cannot recover | remain blocked until auth refresh | show GitHub Actions recovery CTA |
| `external_side_effect_blocked` for Docker repo create/push/template push | remain blocked until approval or explicit decline | preserve local build/publish result |
| Kubernetes apply/exec/port-forward prerequisite block | remain blocked until context/prerequisite resolves | show Docker Manager Kubernetes CTA |

Approval/preflight blind-spot defaults are target-bound, not action-name-bound, including in multi-repo projects. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, optional `workflow_id`, `run_id`, and `/environment`; Docker approvals carry `runtime`, `registry_host`, `namespace`, `/repository`, and optional `image_ref`; Kubernetes approvals carry `kube_context`, `namespace`, optional `workload_ref`, and optional `resource_ref`. The deterministic order is static policy check, cheap capability or `/precondition` preflight, approval request only while still actionable, then full execution-time `/revalidate` immediately before mutation. Each approval records a `preflight_revision`; stale-preflight evidence or any changed target identity invalidates the approval and returns the action to blocked state.

Domain-bound approvals also include the attempted operation or action class, not only resource identity. `/admin/domain-sensitive` operations bind SCM `/repositories` and `/worktrees/refs`, GitHub Actions workflow and `/environment` targets, Docker registries/repositories, and Kubernetes clusters/namespaces/verbs plus workload or resource refs to the approval scope; `policy-vs-approval-vs-preflight` outcomes remain distinct blocked families. `/research-safe` plan-mode tools such as `todoread`, `todowrite`, `webfetch`, `webcrawl`, `webmap`, and question-driven planning flows may be allowed for planning without granting mutation authority. Durable approval scope and reuse are governed by `approval_scope_key`, actor/lane/run/account context, requested/effective permission disclosure, and permission-snapshot drift rules in `Plans/Permissions_System.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Decision_Policy.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### DP-001 - Decision Policy (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: DP-001
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: Plans/Decision_Policy.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Decision_Policy.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
- Decision Policy (Canonical)
- 0. Scope
- 'ContractRef: PolicyRule:Decision_Policy.md'
- 1. Precedence (non-negotiable)
- 'ContractRef: SchemaID:Spec_Lock.json'
- 2. Deterministic defaults (must be autonomous)
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 2.1 Runtime trust and identity defaults
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md'
- 2.2 Runtime ownership and action gating defaults
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
- 2.3 Runtime projection, route-owner, and persistence defaults
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/human-in-the-loop.md'
- 2.4 Route-target, blocked-object, and runtime-identity cleanup defaults
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Graph_View.md'
- 'ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations'
- 3. Tie-break rules (ordering)
- 3.1 Autonomous decision logging contract
- 'ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§1, PolicyRule:no_secrets_in_storage, Invariant:INV-002'
- 4. "No human in the loop" rule
- 5. SpecLock Update Protocol (autonomous; no human readers)
- 'ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1'
- 5.1 When Spec Lock updates are allowed
negative_constraints:
- Operational identity is a separate policy layer from provider-account identity. `Multi-Account.md` distinguishes `github_api`, registry identity, Kubernetes context, provider-account routing, and operational side-effect identity; the shared effective-resolution record must not collapse those into `/
- Orchestrator semantic scope is page-owned, not widget-owned. Page and `/router` state owns `project_id`, `focused_run_id`, historical-run mode, and object focus; widgets may add presentation or sub-filter choices, but they must not secretly select a different `/run` or redefine operational scope.
- Approval identity must not be reconstructed from `request_id + tier_id + tier_type`, ambient tier labels, or a `one-off` `resume_url`. `request_id`, `tier_id`, `tier_type`, `resume_url`, `/wizard`, and `/object` values are compatibility, lineage, or derived route/object data under blocked-episode id
- Runtime blocked reasons remain runtime truth even when Source Control or SCM surfaces display remediation. `dirty_worktree` and `worktree_conflict` stay exact blocked reasons, remain visible in both surfaces, and must not be softened into generic SCM errors; Source Control surfaces the condition and
- Tool, approval, and blocked records must be node/actor/account-aware. Tool events must not remain under-attributed analytics exhaust; first-class runtime trace events carry `/actor/account-aware` and `/identity` links plus the effective account/identity that would have executed the approval or block
- The provider/model/persona/account policy model also applies to worker policy. Worker selection and execution policy must not stop at `/model/persona/account`; worker routes carry the same identity, account, role, and permission separation expected from provider and runtime decisions.
- GitHub realm isolation remains part of runtime identity. `multi-account` `/runtime` policy must not collapse `github_api` and `copilot_github` into one identity bucket, and `Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`) must materialize runtime identity throug
- 'Route and primitive ownership stay split: `Contracts_V0.md` is the correct owner for the canonical route contract, while `Crosswalk.md` is the correct owner for the primitive boundary declaration. If a seam still requires inventing a new canonical event `/record` family, that seam remains research-i'
- '`tier-shaped` objects may survive only as compatibility or selector overlays for phase/task/subtask/iteration navigation. They must not pretend to be canonical runtime context, and any `/task/subtask/iteration` selector that remains user-visible must point back to canonical run/node/attempt/lane/wor'
- '- Auto-decision rows MUST NOT contain secrets or credential material in `decision`, `rationale`, or `applied_to[]`.'
- Plans MUST NOT depend on humans making decisions mid-run.
- 'Operational handling: `Plans/Spec_Lock.json` is verified after canonical doc edits and MUST NOT be hand-edit updated outside this protocol. `Plans/auto_decisions.jsonl` is pipeline-managed by deterministic logging and MUST NOT be hand-edit maintained as a manual ledger.'
- 'Agents MUST NOT:'
- 'ContractRef: ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators'
- '**Rule:** Persistent stores MUST NOT contain secrets (tokens, passwords, API keys, OAuth refresh tokens). Tokens live only in the OS credential store (platform keyring). Violations are P0 bugs requiring immediate remediation.'
- '- Crosswalk.md §3.6 (AuthState rules: "Tokens MUST NOT be persisted in AuthState")'
- '**Resolution rule:** The system MUST generate a clarification question. It MUST NOT apply a deterministic default. The clarification question is captured in the requirements quality report (`Plans/requirements_quality_report.schema.json`, field `needs_user_clarification[]`).'
- The §4 rule ("plans must not depend on humans making decisions mid-run") applies to **runtime execution** (orchestrator runs, agent iterations, verification gates).
- '**Blocking rule:** If a clarification question cannot be resolved before an orchestrator run begins, the run MUST NOT start. The wizard state transitions to `attention_required` and blocks the "Start Run" action.'
- '- Before persisting `description`, `before`, `after`, `context`, or `question` fields in the quality report, Puppet Master MUST redact secret-like values and MUST NOT copy credentials or tokens into the artifact.'
- Runtime and consumer docs must not preserve tier-era or request-era canon as silent fallback behavior once replacement canon is locked.
- Mutating actions must not rely silently on stale or degraded projections.
- Provider pressure policy uses source-class evidence. An `authoritative_remaining_counter` drives `approaching_threshold` at `<= 20% remaining`; weaker inferred signals may be displayed as pressure but must not masquerade as authoritative counters.
- '- `/G/L` question surfaces use parent-owned `question-flow` routing. Subagent access stays `default-denial`; `sendPrompt` has dual-context semantics for general prompts versus question-flow work and must not let a child answer the user through a child-local ask channel.'
compatibility_only_notes:
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- Approval identity must not be reconstructed from `request_id + tier_id + tier_type`, ambient tier labels, or a `one-off` `resume_url`. `request_id`, `tier_id`, `tier_type`, `resume_url`, `/wizard`, and `/object` values are compatibility, lineage, or derived route/object data under blocked-episode id
- '`tier-shaped` objects may survive only as compatibility or selector overlays for phase/task/subtask/iteration navigation. They must not pretend to be canonical runtime context, and any `/task/subtask/iteration` selector that remains user-visible must point back to canonical run/node/attempt/lane/wor'
- '- If `needs_user_clarification[]` is non-empty, the workflow MUST transition to the clarification/escalation path instead of starting execution.'
- '- Clarification-round limits and `blocked` transition semantics are owned by `Plans/chain-wizard-flexibility.md §15`; this section defines the pre-execution boundary and severity rules only.'
- '- `request_id` is lineage/compatibility only'
- '- Stale recovery action names are compatibility/display labels only: they must resolve to canonical `allowed_action_id` values and ordered `allowed_action_ids[]` in the runtime payload before any recovery button or menu item is executable.'
stale_retired_dispositions:
- 6) **Prefer current provider/account policy over stale provider tables**.
- '- Section `6. Provider-specific behavior` rows for Codex/Copilot/Gemini/Cursor/OpenCode are advisory when stale; current selection policy is owned by Contracts, Multi-Account, Models, and provider contracts.'
- 'Projection trust policy allows read-only navigation on `stale` or some `degraded` projections only when the UI says so clearly. Live mutating or decision-bearing actions must tighten on trust state and use copy such as `Warning: provider pressure high`, `Blocked: waiting on user approval`, `View may'
- Conversational and tooling surfaces share one degraded-trust and concern-escalation bridge. Blocked overlays, approval prompts, and tool-health disclosures must expose runtime-trust, `/concern`, and degraded-trust state consistently, and chat threads need a natural place for switch events, concern n
- Degraded-projection action gating is action-class aware. Actions that change execution, `/promotion/recovery/approval` truth, or recovery state require fresh-enough projection state; observational `/navigation/export` actions generally remain safe. UI explanations identify what is stale, why it matt
- 'Evidence and artifact views are durable-first under projection loss. `Evidence`, `/artifact`, and `/artifacts` browsing may survive stale projections because records and artifacts are canonical records, but `new-links` and `/live-status` indicators may not. Copy for these states must be explicit: `V'
- Reconciliation proceeds as a canon-collapse and owner-schema completion pass, not as generic polish. Owner-schema gaps, same-file mixed-era canon, and schema/contract drift are transfer blockers until owner contracts and schemas are reconciled first, then primary consumers collapse their stale same-
- Usage routing cleanup includes `usage-feature.md` (`usage-feature`) and its duplicated `cost_usage` section. That normalization must happen with Usage routing so usage/cost decisions do not keep separate, stale ownership surfaces.
- Route/open ownership is subject-first when the subject is already present. `preview_subject_id` proves subject-first identity is viable; `/open` routes should align to that instead of inventing a second identity model. `subject_id` routes are valid for content subjects only, while `object_kind` rout
- '- leave hashes stale after changing SSOT docs'
- Mutating actions must not rely silently on stale or degraded projections.
- Registry promotion flow, Docker Manager drift-detection, and Kubernetes operations are projection-sensitive mutation domains. Container panel state persistence and Docker/K8s event-registration coverage route to `Plans/Containers_Registry_and_Unraid.md` and `Plans/Contracts_V0.md`; Decision_Policy o
- '- Stale recovery action names are compatibility/display labels only: they must resolve to canonical `allowed_action_id` values and ordered `allowed_action_ids[]` in the runtime payload before any recovery button or menu item is executable.'
- Approval/preflight blind-spot defaults are target-bound, not action-name-bound, including in multi-repo projects. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, optional `workflow_id`, `r
owner_boundary_notes:
- '# Decision Policy (Canonical)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'Approval and recovery policy treat `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`) drift as a field-name and field-family normalization problem: `allowed_action_ids` is canonical over `allowed_actions`, and recovery, replay, storage, approval identity, and persistence semantics must share one'
- 'Projection trust policy allows read-only navigation on `stale` or some `degraded` projections only when the UI says so clearly. Live mutating or decision-bearing actions must tighten on trust state and use copy such as `Warning: provider pressure high`, `Blocked: waiting on user approval`, `View may'
- '`Plans/orchestrator-subagent-integration.md` (`/orchestrator-subagent-integration.md`) is a consumer of canonical execution and `/runtime` context, not the owner of a mixed runtime object. It may keep local selection and `/decomposition` helpers for subagent policy, but route, identity, approval, bl'
- Approval identity must not be reconstructed from `request_id + tier_id + tier_type`, ambient tier labels, or a `one-off` `resume_url`. `request_id`, `tier_id`, `tier_type`, `resume_url`, `/wizard`, and `/object` values are compatibility, lineage, or derived route/object data under blocked-episode id
- '`tier-level` settings may remain as user-facing configuration only when reframed as approval-trigger policy; they are not canonical approval object identity. Automation-first execution remains the default: approval-heavy UX defaults such as phase-complete approvals, manual review steps, modal confir'
- 'Cross-surface research and remediation decisions must keep `/surface`, cross-surface lineage, receipts, blocked UX, and `/recovery/remediation` consequences visible until the owner split is settled; page/surface design, runtime state model, and blocked recovery UX are not interchangeable discussion '
- '### 2.3 Runtime projection, route-owner, and persistence defaults'
- 'Evidence and artifact views are durable-first under projection loss. `Evidence`, `/artifact`, and `/artifacts` browsing may survive stale projections because records and artifacts are canonical records, but `new-links` and `/live-status` indicators may not. Copy for these states must be explicit: `V'
- 'Route and primitive ownership stay split: `Contracts_V0.md` is the correct owner for the canonical route contract, while `Crosswalk.md` is the correct owner for the primitive boundary declaration. If a seam still requires inventing a new canonical event `/record` family, that seam remains research-i'
- Worker output, approval targeting, and live graph bindings must flow through canonical blocked projections. `tier_id` worker-output correlation, `request_id` approval targeting, and graph `/orchestrator` `live-status` bindings are upstream drift risks when they bypass canonical blocked projection id
- 'Routing and bridge cleanup remains incomplete until schemas, enums, operational policy layers, routing `/bridge` refinement rules, and same-file canon collapse are reconciled. `storage-plan.md` (`storage-plan`) may retain both `attempt_record` and `tier_runtime_record` only if `tier_runtime_record` '
- '`Decision_Log.md` records explicit rewrite-era owner-boundary decisions as durable records whenever routing, Orchestrator ontology, blocked identity, runtime identity, or projection-trust vocabulary changes. `Plans/Decision_Policy.md` may set deterministic defaults, but durable decision records pres'
- '`Plans/Contracts_V0.md` remains the owner-contract seam for runtime identity, blocked identity, and route/open ownership. Decision Policy records deterministic posture for `/open`, approval, recovery, and projection trust, but it does not replace the Contracts schema owner for route/open contracts.'
- Reconciliation proceeds as a canon-collapse and owner-schema completion pass, not as generic polish. Owner-schema gaps, same-file mixed-era canon, and schema/contract drift are transfer blockers until owner contracts and schemas are reconciled first, then primary consumers collapse their stale same-
- Runtime identity is not replaced by artifact lineage. `logical_artifact_id` and `linked_artifact_id` are lineage and `/navigation` helpers only; they may point users to related records but do not become runtime identity or blocked-object identity. CtA card actions and `blocked-notice` actions are fi
- Blocked episodes are targetable objects. `blocked_sequence` has canonical identity meaning alongside `/attempt`, but blocked work should not route only through node/attempt views when the blocked episode itself is the object being approved, resumed, inspected, or remediated.
- 'Canonical blocked objects carry a cross-family minimum: blocked reason, ordered allowed actions when applicable, `preserved-work` and `local-state` disclosure when applicable, stable `blocked-episode` identity or a `family-local` equivalent, and detail `/report` inspection references. Reconciliation'
- '`tier-shaped` objects may survive only as compatibility or selector overlays for phase/task/subtask/iteration navigation. They must not pretend to be canonical runtime context, and any `/task/subtask/iteration` selector that remains user-visible must point back to canonical run/node/attempt/lane/wor'
- '- If the decision changes or explains Puppet Master internal SSOT documents, write to `Plans/auto_decisions.jsonl`.'
- 'Operational handling: `Plans/Spec_Lock.json` is verified after canonical doc edits and MUST NOT be hand-edit updated outside this protocol. `Plans/auto_decisions.jsonl` is pipeline-managed by deterministic logging and MUST NOT be hand-edit maintained as a manual ledger.'
- 2. Recompute and update `canonical_ssot_hashes[*].sha256` for every SSOT file listed in Spec Lock.
- '- leave hashes stale after changing SSOT docs'
owner_hints:
- Plans/Decision_Policy.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `34fdf55ca635fc59620b14a92475ca59f3c1e2ccb1ba0af1ce503798b8612230`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Decision_Policy-S0001` through `Decision_Policy-S0032` are preserved in place and mapped in `coverage_map.jsonl` to `DP-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

