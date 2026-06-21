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

**Timing:** Clarification questions surface during Planning Wizard finalization or a legacy Chain Wizard / Interview compatibility flow, before any orchestrator run begins.

**Blocking rule:** If a clarification question cannot be resolved before an orchestrator run begins, the run MUST NOT start. The wizard state transitions to `attention_required` and blocks the "Start Run" action.

ContractRef: `PolicyRule:Decision_Policy.md§4`, `ContractName:Plans/chain-wizard-flexibility.md`

---

### 6.4 Requirements quality report boundary, severity, and persistence


The `requirements_quality_report` is a pre-execution artifact. It MUST be generated during the mandatory Auditor invariant loop defined in `Plans/chain-wizard-flexibility.md §12` after Contract Unification and before any orchestrator run, plan-node execution, or user-visible "Start Run" action begins. Legacy references to the former three-pass anchor are compatibility aliases only and do not revive fixed Pass 1 / Pass 2 / Pass 3 scheduling.

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

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4, PolicyRule:no_secrets_in_storage, Invariant:INV-002, ContractName:Plans/chain-wizard-flexibility.md#12-auditor-invariant-loop-mandatory-invariant-sweep

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

### DP-002 - Canonical Name And Policy Scope Signals

```yaml
plan_unit_id: DP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy preserves the canonical Puppet Master naming rule, compliance
  posture, and source-scope statement for deterministic ambiguity resolution.
gui_related: false
gui_classification_reason: This unit defines naming and policy scope, not UI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Policy text keeps Puppet Master as the only canonical platform name.
  - Legacy naming may be referenced only as legacy naming without quoting the retired name.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_name_drift
reasoning_tier: standard
context_scope: decision_policy_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: canonical_name_policy_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0001
preserved_exact_tokens:
  - "`Puppet Master`"
  - "`legacy naming`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Contracts_V0.md`"
negative_constraints:
  - "Do not quote older platform names; refer to them only as legacy naming."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-003 - Ambiguity Scope And Decision Policy Contract

```yaml
plan_unit_id: DP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy applies when ambiguity is unresolved by Spec Lock, Crosswalk,
  DRY Rules, or Glossary, and exposes PolicyRule:Decision_Policy.md as the
  governing policy reference.
gui_related: false
gui_classification_reason: This unit defines policy applicability and contract routing.
split_recommended: false
depends_on: [DP-002]
unblocks: []
acceptance_criteria:
  - Ambiguity resolution only falls to Decision Policy after higher-precedence sources do not decide.
  - PolicyRule:Decision_Policy.md remains the contract reference for this scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: policy_scope_drift
reasoning_tier: standard
context_scope: ambiguity_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: ambiguity_scope_policy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0002
preserved_exact_tokens:
  - "`Spec Lock`"
  - "`Crosswalk`"
  - "`DRY Rules`"
  - "`Glossary`"
  - "`ContractRef: PolicyRule:Decision_Policy.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-004 - Precedence Stack And Spec Lock Priority

```yaml
plan_unit_id: DP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Ambiguity resolution must follow the fixed precedence stack:
  Plans/Spec_Lock.json, Plans/Crosswalk.md, Plans/DRY_Rules.md,
  Plans/Glossary.md, then Decision Policy.
gui_related: false
gui_classification_reason: This unit defines policy ordering only.
split_recommended: false
depends_on: [DP-003]
unblocks: []
acceptance_criteria:
  - The five-source precedence stack remains ordered and non-negotiable.
  - The mechanical alias id 2 remains preserved for downstream anchors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: precedence_order_drift
reasoning_tier: high
context_scope: policy_precedence
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: precedence_stack
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0003
preserved_exact_tokens:
  - "`Plans/Spec_Lock.json`"
  - "`Plans/Crosswalk.md`"
  - "`Plans/DRY_Rules.md`"
  - "`Plans/Glossary.md`"
  - "`ContractRef: SchemaID:Spec_Lock.json`"
  - "`<a id=\"2\"></a>`"
negative_constraints:
  - "Do not reorder the precedence stack."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-005 - Safe Autonomous Default Ordering

```yaml
plan_unit_id: DP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  When higher-precedence sources do not decide, deterministic defaults prefer
  the simplest safe non-scope-expanding choice, API-only paths over forbidden
  CLI subprocesses, idempotent behavior, and bounded retries with explicit
  backoff.
gui_related: false
gui_classification_reason: This unit defines backend policy defaults.
split_recommended: false
depends_on: [DP-004]
unblocks: []
acceptance_criteria:
  - Defaults prefer a simplest safe choice that does not expand scope.
  - Retries have explicit limits and backoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: autonomous_default_drift
reasoning_tier: standard
context_scope: deterministic_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: safe_autonomous_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`GitHub.com`"
  - "`API-only`"
  - "`idempotent`"
  - "`bounded retries`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2`"
negative_constraints:
  - "Do not expand product scope while resolving an implementation ambiguity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-006 - Stable Identity And Attribution Defaults

```yaml
plan_unit_id: DP-006
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Stable IDs win over inferred labels: UI commands use cmd.* IDs, event types
  use stable type strings, OpenCode bridge persistence prefers
  connection_profile_id, usage_record growth stays attribution-relevant, and
  debug investigations group by investigation_id.
gui_related: true
gui_classification_reason: This unit includes user-visible UI command identity and bridge/debug identity labels.
split_recommended: false
depends_on: [DP-005]
unblocks: []
acceptance_criteria:
  - UI commands keep cmd.* IDs and event types keep stable type strings.
  - connection_profile_id is the persisted account/server identity for OpenCode bridge decisions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_attribution_drift
reasoning_tier: high
context_scope: stable_identity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: stable_identity_attribution_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`cmd.*`"
  - "`type`"
  - "`connection_profile_id`"
  - "`selectable_unit_id`"
  - "`usage_record`"
  - "`investigation_id`"
negative_constraints:
  - "Do not replace persisted account/server identity with selectable_unit_id."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-007 - Provider Policy Stale-Table Retirement

```yaml
plan_unit_id: DP-007
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Provider-specific behavior tables for Codex, Copilot, Gemini, Cursor, and
  OpenCode are advisory when stale; current selection policy is owned by
  Contracts, Multi-Account, Models, and provider contracts, with remaining
  provider-table cleanup limited to edge-case review.
gui_related: false
gui_classification_reason: This unit retires stale provider-policy tables, not UI presentation.
split_recommended: false
depends_on: [DP-006]
unblocks: []
acceptance_criteria:
  - Stale provider rows do not override current owner contracts.
  - Remaining cleanup is not a blocker for requested/effective account policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_provider_policy_drift
reasoning_tier: standard
context_scope: provider_policy_cleanup
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: stale_provider_table_retirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0004
preserved_exact_tokens:
  - "`Codex/Copilot/Gemini/Cursor/OpenCode`"
  - "`advisory when stale`"
  - "`Contracts, Multi-Account, Models, and provider contracts`"
negative_constraints:
  - "Do not let stale provider tables override current selection policy."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-008 - Operational Identity And Execution Role Separation

```yaml
plan_unit_id: DP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Operational identity is separate from provider-account identity; runtime and
  attempt packets carry execution_role when role-aware policy decides the route
  and must not collapse operational side effects into model/persona/auth/account
  fields.
gui_related: false
gui_classification_reason: This unit defines runtime identity policy.
split_recommended: false
depends_on: [DP-006]
unblocks: []
acceptance_criteria:
  - Runtime identity keeps github_api, registry, Kubernetes, provider-account, and operational side-effect identity distinct.
  - Runtime and attempt packets carry execution_role when required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_collapse
reasoning_tier: high
context_scope: runtime_identity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: operational_identity_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`github_api`"
  - "`execution_role`"
  - "`/model/persona/auth/account`"
  - "`ContractName:Plans/Multi-Account.md`"
negative_constraints:
  - "Do not collapse operational identity into provider-account identity."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
```

### DP-009 - HITL Recovery Defaults And Projection Trust Copy

```yaml
plan_unit_id: DP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  HITL recovery defaults normalize allowed_action_ids, keep HITL off by default
  except configured or critical failure cases, and require explicit projection
  trust copy before mutating or decision-bearing actions.
gui_related: true
gui_classification_reason: This unit defines approval prompts, recovery UI, and user-visible trust copy.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - allowed_action_ids is canonical over allowed_actions.
  - Projection trust states use explicit warning, blocked, stale, and degraded copy before action.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_trust_copy_drift
reasoning_tier: high
context_scope: hitl_recovery_projection_trust
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_recovery_projection_trust_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`allowed_action_ids`"
  - "`allowed_actions`"
  - "`HITL is off by default`"
  - "`Warning: provider pressure high`"
  - "`Blocked: waiting on user approval`"
  - "`View may be stale; refresh before acting`"
  - "`Projection degraded; showing canonical history only`"
negative_constraints:
  - "Do not allow live mutating or decision-bearing actions to rely on unclear projection trust state."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-010 - Page-Owned Orchestrator Scope And Permission Identity

```yaml
plan_unit_id: DP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Orchestrator semantic scope is page-owned: page and router state own project,
  focused run, historical-run mode, and object focus, while widgets may only add
  presentation or sub-filter choices.
gui_related: true
gui_classification_reason: This unit governs page, router, widget, and settings behavior.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Widgets do not secretly select a different run or redefine operational scope.
  - Permission, model, and account policy keep runtime-overlay and execution context explicit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_scope_drift
reasoning_tier: high
context_scope: orchestrator_page_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
node_compile_hint:
  mode: page_owned_orchestrator_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`project_id`"
  - "`focused_run_id`"
  - "`historical-run mode`"
  - "`account_pressure_episode`"
  - "`account_switch_event`"
negative_constraints:
  - "Widgets must not secretly select a different /run or redefine operational scope."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
```

### DP-011 - Degraded-Trust Concern Escalation Bridge

```yaml
plan_unit_id: DP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Conversational and tooling surfaces share degraded-trust and concern
  escalation disclosure so blocked overlays, approval prompts, tool health, chat
  threads, switch events, concerns, and trust-staleness explanations stay
  consistent.
gui_related: true
gui_classification_reason: This unit defines user-visible overlays, prompts, disclosures, and chat explanations.
split_recommended: false
depends_on: [DP-009]
unblocks: []
acceptance_criteria:
  - Blocked overlays, approval prompts, and tool-health disclosures expose runtime-trust and concern state consistently.
  - Chat threads have a place for switch events, concern notices, and trust-staleness explanation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: degraded_trust_surface_drift
reasoning_tier: standard
context_scope: trust_concern_bridge
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: degraded_trust_concern_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0005
preserved_exact_tokens:
  - "`/concern`"
  - "`degraded-trust`"
  - "`switch events`"
  - "`trust-staleness explanation`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-012 - Subagent Runtime Consumer Boundary

```yaml
plan_unit_id: DP-012
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Orchestrator subagent integration consumes canonical execution and runtime
  context and may keep local selection or decomposition helpers, but route,
  identity, approval, blocked, and recovery semantics come from canonical
  runtime and policy contracts.
gui_related: false
gui_classification_reason: This unit defines runtime ownership boundaries.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Subagent integration does not own a mixed runtime object.
  - Route, identity, approval, blocked, and recovery semantics route to canonical runtime and policy contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_runtime_ownership_drift
reasoning_tier: standard
context_scope: subagent_runtime_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: subagent_runtime_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/runtime`"
  - "`/decomposition`"
  - "`ContractName:Plans/orchestrator-subagent-integration.md`"
negative_constraints:
  - "Do not make orchestrator-subagent-integration the owner of mixed runtime semantics."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/orchestrator-subagent-integration.md
```

### DP-013 - Blocked Approval Identity And Compatibility Fields

```yaml
plan_unit_id: DP-013
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval identity must not be reconstructed from request_id, tier_id,
  tier_type, ambient labels, one-off resume_url, wizard, or object values;
  those fields are compatibility, lineage, or derived data under blocked-episode
  identity.
gui_related: false
gui_classification_reason: This unit governs approval identity semantics.
split_recommended: false
depends_on: [DP-012]
unblocks: []
acceptance_criteria:
  - request_id, tier_id, tier_type, and resume_url remain non-primary identity fields.
  - Tier and group surfaces consume canonical contract pointers instead of rebuilding runtime identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_identity_reconstruction
reasoning_tier: high
context_scope: blocked_approval_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_approval_identity_compatibility_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`request_id + tier_id + tier_type`"
  - "`one-off`"
  - "`resume_url`"
  - "`/wizard`"
  - "`/object`"
negative_constraints:
  - "Approval identity must not be reconstructed from request_id + tier_id + tier_type or ambient tier labels."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-014 - Runtime Blocked Reasons And Concern Lifecycle

```yaml
plan_unit_id: DP-014
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime blocked reasons stay runtime truth across Source Control and SCM
  remediation surfaces, while concern closure requires rationale, resolution
  kind, and explicit lineage for merge, split, and supersede actions.
gui_related: true
gui_classification_reason: This unit affects Source Control/SCM visible blocked states and concern actions.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - dirty_worktree and worktree_conflict remain exact blocked reasons.
  - Concern dismissal, resolution, merge, split, and supersede actions preserve lineage and semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_reason_softening
reasoning_tier: high
context_scope: blocked_reasons_concern_lifecycle
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: blocked_reason_concern_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`dirty_worktree`"
  - "`worktree_conflict`"
  - "`dismissed`"
  - "`resolved`"
  - "`resolution_kind`"
  - "`merge`"
  - "`split`"
  - "`supersede`"
negative_constraints:
  - "Do not soften dirty_worktree or worktree_conflict into generic SCM errors."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-015 - HITL Interview Approval Scope And Automation Defaults

```yaml
plan_unit_id: DP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  HITL carries actor, lane/account, approval provenance, concurrency-safe queue,
  and scope rules; interview projections preserve runtime identity parity, and
  approval-heavy UX remains optional HITL policy rather than mandatory runtime
  progress.
gui_related: true
gui_classification_reason: This unit defines approval UX defaults and interview shared orchestration behavior.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - Tier-level settings may remain only as user-facing approval-trigger configuration.
  - Automation-first execution remains the default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_heavy_default_drift
reasoning_tier: standard
context_scope: hitl_interview_approval_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: hitl_interview_approval_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/lane/account`"
  - "`routing-key`"
  - "`tier-level`"
  - "`Automation-first execution`"
  - "`model-neutral`"
negative_constraints:
  - "Do not make phase-complete approvals, manual review steps, modal confirmations, or direct-click approvals mandatory runtime checkpoints."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/interview-subagent-integration.md
```

### DP-016 - Actor Account Traceability And Degraded Projection Gating

```yaml
plan_unit_id: DP-016
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Tool, approval, blocked, command, storage, and recovery records use one
  node/actor/account-aware key family, and degraded-projection gating is
  action-class aware with explicit user explanation.
gui_related: true
gui_classification_reason: This unit governs disabled/explained action states and trace-visible runtime records.
split_recommended: false
depends_on: [DP-014]
unblocks: []
acceptance_criteria:
  - Tool events carry actor/account-aware identity instead of under-attributed analytics exhaust.
  - Execution-changing, promotion, recovery, approval, and recovery-state actions require fresh-enough projection state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: actor_account_trace_loss
reasoning_tier: high
context_scope: actor_account_projection_gating
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: actor_account_traceability_projection_gating
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0006
preserved_exact_tokens:
  - "`/actor/account-aware`"
  - "`/identity`"
  - "`allowed_action_ids[]`"
  - "`/promotion/recovery/approval`"
  - "`/navigation/export`"
negative_constraints:
  - "Do not hide degraded projection gating behind generic disabled controls."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
```

### DP-017 - Worker Runtime Identity And Durable Projection Browsing

```yaml
plan_unit_id: DP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Worker selection follows the provider/model/persona/account policy model, and
  evidence or artifact browsing may survive stale projections only as durable
  canonical records with explicit stale or degraded copy.
gui_related: true
gui_classification_reason: This unit governs visible evidence/artifact browsing and live-status indicators.
split_recommended: false
depends_on: [DP-016]
unblocks: []
acceptance_criteria:
  - Worker routes carry identity, account, role, and permission separation.
  - Evidence and artifact views distinguish canonical history from live-status or new-link claims under stale/degraded projection.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worker_projection_browsing_drift
reasoning_tier: standard
context_scope: worker_identity_durable_projection
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: worker_runtime_identity_durable_projection_browsing
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`/model/persona/account`"
  - "`Evidence`"
  - "`/artifact`"
  - "`/artifacts`"
  - "`View may be stale`"
  - "`Projection degraded`"
negative_constraints:
  - "Do not make new-links or live-status indicators authoritative under degraded projections."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-018 - Route Primitive Ownership And Research-Incomplete Seams

```yaml
plan_unit_id: DP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  GitHub realm isolation remains part of runtime identity, canonical route
  contracts are owned by Contracts_V0, primitive boundaries by Crosswalk, and
  any seam that still needs a new canonical event or record family remains
  research-incomplete.
gui_related: false
gui_classification_reason: This unit defines owner routing and research status, not presentation.
split_recommended: false
depends_on: [DP-017]
unblocks: []
acceptance_criteria:
  - github_api and copilot_github do not collapse into one runtime identity bucket.
  - Route contract ownership stays with Contracts_V0 while primitive boundaries stay with Crosswalk.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_owner_confusion
reasoning_tier: high
context_scope: route_primitive_ownership
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: route_primitive_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`github_api`"
  - "`copilot_github`"
  - "`Contracts_V0.md`"
  - "`Crosswalk.md`"
  - "`/record`"
  - "`research-incomplete`"
negative_constraints:
  - "Do not treat research-incomplete route seams as done."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
```

### DP-019 - Blocked Projection Persistence And Owner-Schema Completion

```yaml
plan_unit_id: DP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Worker output, approval targeting, live graph bindings, approval persistence,
  route/open posture, and persistence-contract decisions flow through canonical
  blocked projections and owner-schema completion rather than same-file stale
  alternatives.
gui_related: false
gui_classification_reason: This unit defines persistence and owner-schema contracts.
split_recommended: false
depends_on: [DP-018]
unblocks: []
acceptance_criteria:
  - tier_id worker-output correlation and request_id approval targeting do not bypass canonical blocked projection identity.
  - attempt_record and tier_runtime_record may coexist only when tier_runtime_record is derived and view-oriented.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persistence_owner_schema_drift
reasoning_tier: high
context_scope: blocked_projection_persistence
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_projection_persistence_owner_schema_completion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0007
preserved_exact_tokens:
  - "`attempt_record`"
  - "`tier_runtime_record`"
  - "`request_id`"
  - "`blocked_sequence`"
  - "`episode-scoped restart persistence`"
  - "`canon-collapse`"
negative_constraints:
  - "Decision Policy must not replace Contracts_V0 as the runtime identity, blocked identity, or route/open contract owner."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

### DP-020 - Runtime Artifact Lineage And Blocked Episode Targetability

```yaml
plan_unit_id: DP-020
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime identity is not replaced by artifact lineage; logical_artifact_id and
  linked_artifact_id remain navigation helpers, while blocked_sequence has
  canonical blocked-episode identity for approval, resume, inspection, and
  remediation.
gui_related: true
gui_classification_reason: This unit governs CTA cards, blocked notices, navigation helpers, and blocked episode interactions.
split_recommended: false
depends_on: [DP-019]
unblocks: []
acceptance_criteria:
  - Artifact lineage IDs do not become runtime or blocked-object identity.
  - Blocked episodes are targetable objects, not only node or attempt views.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_artifact_identity_drift
reasoning_tier: high
context_scope: blocked_episode_targetability
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: runtime_artifact_lineage_blocked_episode_targetability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`logical_artifact_id`"
  - "`linked_artifact_id`"
  - "`CtA card actions`"
  - "`blocked-notice`"
  - "`blocked_sequence`"
negative_constraints:
  - "Artifact lineage must not become runtime identity or blocked-object identity."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
```

### DP-021 - Usage Route Open Object Ownership Cleanup

```yaml
plan_unit_id: DP-021
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Usage routing cleanup includes usage-feature and its duplicated cost_usage
  section, canonical blocked objects carry the cross-family minimum, and
  route/open ownership is subject-first for content subjects and object_kind
  based for non-subject objects.
gui_related: false
gui_classification_reason: This unit defines routing and ownership cleanup rules.
split_recommended: false
depends_on: [DP-020]
unblocks: []
acceptance_criteria:
  - usage-feature cost ownership is normalized with Usage routing.
  - subject_id routes apply to content subjects and object_kind routes apply to non-subject objects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_object_owner_drift
reasoning_tier: high
context_scope: usage_route_open_cleanup
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_route_open_object_ownership_cleanup
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`usage-feature.md`"
  - "`cost_usage`"
  - "`blocked-episode`"
  - "`preview_subject_id`"
  - "`subject_id`"
  - "`object_kind`"
negative_constraints:
  - "Do not invent a second identity model when a subject-first route identity is present."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/usage-feature.md
```

### DP-022 - Tier Compatibility Cleanup Lifecycle And Large-Run Policy

```yaml
plan_unit_id: DP-022
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Tier-shaped objects may survive only as compatibility or selector overlays,
  cleanup lifecycle distinguishes archive, remove, prune, recover, and restore,
  and Orchestrator-wide large-run pagination preserves progress, blocked, and
  evidence navigation.
gui_related: true
gui_classification_reason: This unit governs user-visible selectors, cleanup actions, and large-run navigation behavior.
split_recommended: false
depends_on: [DP-021]
unblocks: []
acceptance_criteria:
  - Tier-shaped selectors point back to canonical run/node/attempt/lane/worktree identity.
  - Cleanup actions distinguish archival, pruning, semantic removal, and recovery or restore posture before mutation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tier_cleanup_large_run_drift
reasoning_tier: standard
context_scope: tier_cleanup_large_run_policy
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: tier_compatibility_cleanup_lifecycle_large_run_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`tier-shaped`"
  - "`/task/subtask/iteration`"
  - "`/remove/prune/recover`"
  - "`large-run`"
  - "`/pagination`"
negative_constraints:
  - "Tier-shaped objects must not pretend to be canonical runtime context."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
  - Plans/Run_Graph_View.md
```

### DP-023 - OpenCode Identity And Redaction Defaults

```yaml
plan_unit_id: DP-023
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  OpenCode and bridged request/runtime bundles carry full auth/account identity
  plus upstream-provider identity rules, and secret-like data is redacted and
  never persisted.
gui_related: false
gui_classification_reason: This unit defines identity and storage safety policy.
split_recommended: false
depends_on: [DP-022]
unblocks: []
acceptance_criteria:
  - Bridge consumers can distinguish upstream provider identity from local account, role, and operational identity.
  - Possible secrets are treated as secrets and are not persisted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: opencode_redaction_identity_drift
reasoning_tier: high
context_scope: opencode_identity_redaction
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: opencode_identity_redaction_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0008
preserved_exact_tokens:
  - "`auth`"
  - "`/account`"
  - "`upstream-provider`"
  - "`Prefer redaction`"
  - "`ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations`"
negative_constraints:
  - "Do not persist data that might be a secret."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Provider_OpenCode.md
```

### DP-024 - Tie-Break Ordering Defaults

```yaml
plan_unit_id: DP-024
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  If two choices remain otherwise equal, choose the option already referenced by
  an existing plan document, and if still tied choose the lexicographically
  smallest stable ID.
gui_related: false
gui_classification_reason: This unit defines deterministic ordering policy.
split_recommended: false
depends_on: [DP-004]
unblocks: []
acceptance_criteria:
  - Referenced existing plan choices beat unreferenced alternatives.
  - Lexicographically smallest stable ID is the final tie-breaker.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tiebreak_drift
reasoning_tier: standard
context_scope: deterministic_tiebreak
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: tiebreak_ordering_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0009
preserved_exact_tokens:
  - "`referenced by an existing plan document`"
  - "`lexicographically smallest stable ID`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-025 - Autonomous Decision Logging Contract

```yaml
plan_unit_id: DP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Autonomous ambiguity resolution emits exactly one schema-valid auto-decision
  row to the correct internal or user-project path, with deterministic field
  semantics, contract_refs, and no secrets or credential material.
gui_related: false
gui_classification_reason: This unit defines JSONL decision logging policy.
split_recommended: false
depends_on: [DP-024]
unblocks: []
acceptance_criteria:
  - Puppet Master internal SSOT decisions write to Plans/auto_decisions.jsonl.
  - User-project artifact decisions write to .puppet-master/project/auto_decisions.jsonl.
  - Auto-decision rows do not contain secrets in decision, rationale, or applied_to.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auto_decision_logging_drift
reasoning_tier: high
context_scope: autonomous_decision_logging
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/auto_decisions.jsonl
node_compile_hint:
  mode: autonomous_decision_logging_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0010
preserved_exact_tokens:
  - "`pm.auto_decisions.schema.v1`"
  - "`Plans/auto_decisions.jsonl`"
  - "`.puppet-master/project/auto_decisions.jsonl`"
  - "`inputs_hash`"
  - "`contract_refs[]`"
  - "`PolicyRule:no_secrets_in_storage`"
negative_constraints:
  - "Auto-decision rows MUST NOT contain secrets or credential material."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-026 - No Human In Loop Runtime Rule

```yaml
plan_unit_id: DP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime execution plans must not depend on humans making decisions mid-run;
  the spec-lock-update-protocol alias remains preserved for the following
  SpecLock protocol section.
gui_related: false
gui_classification_reason: This unit defines runtime decision policy.
split_recommended: false
depends_on: [DP-025]
unblocks: []
acceptance_criteria:
  - Plans do not depend on humans making decisions during orchestrator execution, agent iterations, or verification gates.
  - The spec-lock-update-protocol anchor remains available.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: human_midrun_dependency
reasoning_tier: high
context_scope: no_human_in_loop_runtime
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: no_human_in_loop_runtime_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0011
preserved_exact_tokens:
  - "`No human in the loop`"
  - "`plans must not depend on humans making decisions mid-run`"
  - "`<a id=\"spec-lock-update-protocol\"></a>`"
negative_constraints:
  - "Plans MUST NOT depend on humans making decisions mid-run."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-027 - Spec Lock Protocol Boundary

```yaml
plan_unit_id: DP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  SpecLock updates are autonomous machine maintenance only after canonical SSOT
  edits, and the operational handling forbids hand-maintained Spec_Lock or
  manual auto_decisions ledger updates outside the protocol.
gui_related: false
gui_classification_reason: This unit defines governance protocol boundaries.
split_recommended: false
depends_on: [DP-026]
unblocks: []
acceptance_criteria:
  - Spec Lock updates are allowed only after canonical SSOT edits.
  - Plans/Spec_Lock.json and Plans/auto_decisions.jsonl are not hand-maintained outside the protocol.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_protocol_boundary_drift
reasoning_tier: high
context_scope: spec_lock_update_protocol
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
  - Plans/auto_decisions.jsonl
node_compile_hint:
  mode: spec_lock_protocol_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0013
preserved_exact_tokens:
  - "`SpecLock Update Protocol`"
  - "`Plans/Spec_Lock.json`"
  - "`Plans/auto_decisions.jsonl`"
  - "`SchemaID:pm.auto_decisions.schema.v1`"
negative_constraints:
  - "Do not hand-edit Spec_Lock or manually maintain auto_decisions outside this protocol."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-028 - Spec Lock Deterministic Update Steps

```yaml
plan_unit_id: DP-028
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  A Spec Lock update loads and rewrites the full JSON object, recomputes
  canonical SSOT hashes, appends one auto-decision row, produces schema-valid
  evidence, and runs verifier gates.
gui_related: false
gui_classification_reason: This unit defines governance update mechanics.
split_recommended: false
depends_on: [DP-027]
unblocks: []
acceptance_criteria:
  - Spec Lock updates rewrite the full JSON object without partial updates.
  - canonical_ssot_hashes, auto_decisions, evidence bundles, and verifier gates are all part of the protocol.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_update_step_loss
reasoning_tier: high
context_scope: spec_lock_update_steps
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
node_compile_hint:
  mode: spec_lock_deterministic_update_steps
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0014
preserved_exact_tokens:
  - "`canonical_ssot_hashes[*].sha256`"
  - "`pm.evidence.schema.v1`"
  - "`Gate:GATE-001`"
  - "`Plans/evidence.schema.json`"
negative_constraints:
  - "Do not partially update Spec_Lock fields."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-029 - Spec Lock Prohibited Behaviors

```yaml
plan_unit_id: DP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Spec Lock updates must not add TBD, Open Questions, or ask-later language and
  must not leave canonical SSOT hashes stale after SSOT docs change.
gui_related: false
gui_classification_reason: This unit defines governance prohibitions.
split_recommended: false
depends_on: [DP-028]
unblocks: []
acceptance_criteria:
  - Spec Lock updates do not add deferred-decision language.
  - Hashes are not left stale after SSOT document changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: spec_lock_prohibited_behavior
reasoning_tier: high
context_scope: spec_lock_prohibitions
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Spec_Lock.json
node_compile_hint:
  mode: spec_lock_prohibited_behaviors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0015
preserved_exact_tokens:
  - "`TBD`"
  - "`Open Questions`"
  - "`ask later`"
  - "`ContractName:Plans/DRY_Rules.md#4-forbidden-patterns-drift-accelerators`"
  - "`SchemaID:Spec_Lock.json#canonical_ssot_hashes`"
negative_constraints:
  - "Do not add TBD, Open Questions, or ask later language as part of a Spec Lock update."
  - "Do not leave hashes stale after changing SSOT docs."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-030 - No Secrets In Persistent Storage

```yaml
plan_unit_id: DP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Persistent stores, including seglog, redb, and Tantivy indexes, must not
  contain tokens, passwords, API keys, OAuth refresh tokens, credentials, or
  other secrets; tokens live only in the OS credential store.
gui_related: false
gui_classification_reason: This unit defines storage safety policy.
split_recommended: false
depends_on: [DP-023]
unblocks: []
acceptance_criteria:
  - Persistent stores do not contain secrets.
  - AuthState tokens are not persisted, and violations are P0 remediation bugs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_persistence
reasoning_tier: high
context_scope: persistent_storage_secrets
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Architecture_Invariants.md
node_compile_hint:
  mode: no_secrets_in_persistent_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0016
preserved_exact_tokens:
  - "`PolicyRule: no_secrets_in_storage`"
  - "`seglog`"
  - "`redb`"
  - "`Tantivy indexes`"
  - "`OS credential store`"
  - "`Architecture_Invariants.md#INV-002`"
  - "`<a id=\"6\"></a>`"
negative_constraints:
  - "Persistent stores MUST NOT contain secrets."
  - "Tokens MUST NOT be persisted in AuthState."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Architecture_Invariants.md
```

### DP-031 - Ambiguity Deterministic Resolution

```yaml
plan_unit_id: DP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Ambiguity exists when multiple valid technical or design choices satisfy user
  intent; resolve it by applying deterministic defaults from section 2 and
  logging to Plans/auto_decisions.jsonl without user interaction.
gui_related: false
gui_classification_reason: This unit defines policy classification and logging, not UI presentation.
split_recommended: false
depends_on: [DP-024, DP-025]
unblocks: []
acceptance_criteria:
  - Ambiguity is resolved by deterministic defaults, not user questions.
  - Examples such as buffer size, retry count, and brand-palette color remain classified as ambiguity when user intent is satisfied.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ambiguity_classification_drift
reasoning_tier: standard
context_scope: ambiguity_vs_missing_intent
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: ambiguity_deterministic_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0018
preserved_exact_tokens:
  - "`Ambiguity (multiple valid choices)`"
  - "`pm.auto_decisions.schema.v1`"
  - "`Choosing a buffer size`"
  - "`Picking a retry count`"
  - "`Selecting a color within a brand palette`"
negative_constraints:
  - "Do not ask the user when deterministic defaults resolve the ambiguity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-032 - Missing User Intent Clarification Boundary

```yaml
plan_unit_id: DP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Missing user intent or insufficient specification is a material product choice
  the system cannot infer; it generates a clarification question captured in
  needs_user_clarification and does not apply a deterministic default.
gui_related: false
gui_classification_reason: This unit defines pre-execution clarification policy.
split_recommended: false
depends_on: [DP-031]
unblocks: []
acceptance_criteria:
  - Missing user intent generates a clarification question rather than a deterministic default.
  - The clarification is captured in requirements_quality_report needs_user_clarification.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: missing_intent_defaulting
reasoning_tier: high
context_scope: missing_user_intent
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: missing_user_intent_clarification_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0019
preserved_exact_tokens:
  - "`Missing User Intent / Insufficient Specification`"
  - "`needs_user_clarification[]`"
  - "`pm.requirements_quality_report.schema.v1`"
negative_constraints:
  - "The system MUST generate a clarification question and MUST NOT apply a deterministic default."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-033 - Pre-Execution Clarification And Start-Run Block

```yaml
plan_unit_id: DP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Clarification questions surface before orchestrator execution during Planning
  Wizard finalization or a legacy Chain Wizard / Interview compatibility flow;
  unresolved clarification blocks run start by moving wizard state to
  attention_required and blocking the Start Run action.
gui_related: true
gui_classification_reason: This unit defines user-visible clarification timing and Start Run blocking.
split_recommended: false
depends_on: [DP-032]
unblocks: []
acceptance_criteria:
  - Clarification occurs before any orchestrator run begins.
  - If clarification is unresolved, the run does not start and Start Run is blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pre_execution_clarification_bypass
reasoning_tier: high
context_scope: clarification_start_run_block
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: pre_execution_clarification_start_run_block
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0020
preserved_exact_tokens:
  - "`Chain Wizard`"
  - "`Interview phase`"
  - "`attention_required`"
  - "`Start Run`"
  - "`PolicyRule:Decision_Policy.md§4`"
negative_constraints:
  - "If clarification cannot be resolved before run start, the run MUST NOT start."
  - "Do not use Chain Wizard or Interview as current product terminology outside compatibility/source-lineage contexts."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Planning_Wizard.md
  - Plans/chain-wizard-flexibility.md
```

### DP-034 - Requirements Quality Report Boundary Severity Persistence

```yaml
plan_unit_id: DP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The requirements_quality_report is a pre-execution artifact generated after
  Contract Unification and before run start; execution may continue only on PASS
  with empty needs_user_clarification, and report text is redacted before
  persistence.
gui_related: false
gui_classification_reason: This unit defines validation artifact and persistence policy.
split_recommended: false
depends_on: [DP-030, DP-032, DP-033]
unblocks: []
acceptance_criteria:
  - Execution only continues when the latest canonical report is PASS and needs_user_clarification is empty.
  - Blocking severity and redaction rules are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_quality_report_drift
reasoning_tier: high
context_scope: requirements_quality_report_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: requirements_quality_report_boundary_severity_persistence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0021
preserved_exact_tokens:
  - "`requirements_quality_report`"
  - "`verdict: \"PASS\"`"
  - "`needs_user_clarification[]`"
  - "`missing_scenarios`"
  - "`contradiction`"
  - "`vagueness`"
  - "`PolicyRule:no_secrets_in_storage`"
negative_constraints:
  - "Do not copy credentials or tokens into requirements quality report fields."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/chain-wizard-flexibility.md
```

### DP-035 - Runtime Fallback Prohibition Defaults

```yaml
plan_unit_id: DP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime and consumer docs must not preserve tier-era or request-era canon as
  silent fallback; provider and account fallback is automatic only for eligible
  policy-permitted units and otherwise terminates in explicit blocked reasons.
gui_related: false
gui_classification_reason: This unit defines runtime fallback policy.
split_recommended: false
depends_on: [DP-007, DP-013]
unblocks: []
acceptance_criteria:
  - Replacement canon does not leave silent tier-era or request-era fallbacks.
  - Terminal fallback blocked reasons remain explicit and enumerable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_runtime_fallback
reasoning_tier: high
context_scope: runtime_decision_rules_addendum
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: runtime_fallback_prohibition_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0023
preserved_exact_tokens:
  - "`No hidden orchestration fallbacks`"
  - "`no_eligible_account`"
  - "`policy_forbids_fallback`"
  - "`all_units_hard_blocked`"
negative_constraints:
  - "Runtime and consumer docs must not preserve tier-era or request-era canon as silent fallback behavior."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-036 - Deterministic Blocked Approval Identity Addendum

```yaml
plan_unit_id: DP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blocked and approval decisions resolve through runtime blocked episodes
  targeting run_id, node_id, blocked_sequence, and optional attempt_id, with
  request_id retained only as lineage or compatibility and allowed_action_ids as
  canonical.
gui_related: false
gui_classification_reason: This unit defines blocked and approval payload identity.
split_recommended: false
depends_on: [DP-013]
unblocks: []
acceptance_criteria:
  - Runtime blocked episode identity uses run_id, node_id, blocked_sequence, and attempt_id when present.
  - request_id is lineage/compatibility only and allowed_action_ids[] is canonical.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_approval_identity_drift
reasoning_tier: high
context_scope: blocked_approval_identity_addendum
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: deterministic_blocked_approval_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0024
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
  - "`request_id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "request_id is lineage/compatibility only."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
```

### DP-037 - Workflow Overlay Identity Preservation

```yaml
plan_unit_id: DP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Deterministic defaults preserve workflow overlay identity instead of
  collapsing it into runtime posture; Deep Plan remains a first-class workflow
  display identity even when normalized runtime mode is plan.
gui_related: false
gui_classification_reason: This unit defines workflow identity semantics.
split_recommended: false
depends_on: [DP-008]
unblocks: []
acceptance_criteria:
  - Deep Plan remains first-class workflow display identity.
  - Shared lower-level planning mechanics stay in subordinate profile or behavior fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: workflow_identity_collapse
reasoning_tier: standard
context_scope: workflow_overlay_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
node_compile_hint:
  mode: workflow_overlay_identity_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0025
preserved_exact_tokens:
  - "`Deep Plan`"
  - "`/workflow`"
  - "`plan`"
  - "`deep_plan`"
  - "`/profile`"
negative_constraints:
  - "Do not collapse Deep Plan workflow identity into lower-level plan runtime posture."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-038 - Projection-Sensitive Mutation Guard

```yaml
plan_unit_id: DP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Mutating actions must not rely silently on stale, partial, unknown, degraded,
  account-changed, receipt, state, or drift projections; mutation-sensitive
  domains return to blocked or preflight-gated posture and require revalidate
  immediately before mutation.
gui_related: true
gui_classification_reason: This unit governs visible blocked/preflight action posture for mutation-sensitive surfaces.
split_recommended: false
depends_on: [DP-016]
unblocks: []
acceptance_criteria:
  - Registry promotion, Docker Manager drift detection, and Kubernetes operations are projection-sensitive mutation domains.
  - /revalidate occurs immediately before mutation when projection trust is not authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_projection_mutation
reasoning_tier: high
context_scope: projection_state_action_policy
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: projection_sensitive_mutation_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`stale`"
  - "`partial`"
  - "`unknown`"
  - "`degraded`"
  - "`account-changed`"
  - "`/revalidate`"
negative_constraints:
  - "Mutating actions must not rely silently on stale or degraded projections."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-039 - Auth Action Lifecycle Provider Pressure And Config Ownership

```yaml
plan_unit_id: DP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Setup/auth actions expose idle, pending, success, failure, disabled, and
  post-success lifecycle states; provider pressure distinguishes authoritative
  counters from inferred signals, and GUI provider/model/account controls belong
  primarily in Agent-Config.
gui_related: true
gui_classification_reason: This unit defines visible auth action states, pressure display, and configuration surface ownership.
split_recommended: false
depends_on: [DP-038]
unblocks: []
acceptance_criteria:
  - Auth actions are not complete merely because a projection updated.
  - authoritative_remaining_counter drives approaching_threshold at <= 20 percent remaining.
  - Health and Usage pages are observability and diagnostics, not primary provider/model/account config owners.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_pressure_config_drift
reasoning_tier: standard
context_scope: auth_pressure_config_ownership
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: auth_lifecycle_provider_pressure_config_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`idle`"
  - "`pending`"
  - "`success`"
  - "`failure`"
  - "`disabled`"
  - "`post-success`"
  - "`authoritative_remaining_counter`"
  - "`approaching_threshold`"
  - "`<= 20% remaining`"
  - "`Agent-Config`"
negative_constraints:
  - "Weaker inferred pressure signals must not masquerade as authoritative counters."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-040 - Question Routing Approval UX And Runtime Display Defaults

```yaml
plan_unit_id: DP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Question routing uses parent-owned question-flow, subagent access stays
  default-denial, blocked and HITL approval surfaces show ordered
  allowed_action_ids and permission-level disclosure, and runtime-display
  consumers do not re-own runtime identity.
gui_related: true
gui_classification_reason: This unit defines question surfaces, approval cards, and runtime disclosure UI.
split_recommended: false
depends_on: [DP-036]
unblocks: []
acceptance_criteria:
  - Child ask channels cannot answer the user through a child-local path.
  - Approval cards do not mutate Persona permission profiles.
  - Runtime-display consumers show disclosure without runtime-identity re-ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_approval_runtime_display_drift
reasoning_tier: high
context_scope: question_approval_runtime_display
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: question_routing_approval_ux_runtime_display_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`/G/L`"
  - "`question-flow`"
  - "`default-denial`"
  - "`sendPrompt`"
  - "`permission-level`"
  - "`deny`, `once`, `for session`, `always`"
  - "`allowed_action_id`"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Subagent access stays default-denial and must not let a child answer through a child-local ask channel."
  - "Approval cards MUST NOT mutate Persona permission profiles."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-041 - Debug Context And Reopen Blocking

```yaml
plan_unit_id: DP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Browser-context auto-ingestion is visible, bounded, and revocable; debug
  blocked reopen states render canonical blocked-state UI and missing linked
  runtime identity reopens into attention_required with target_selection_required
  rather than silently minting a replacement target.
gui_related: true
gui_classification_reason: This unit governs visible Investigation Context chips, blocked UI, and target-selection recovery.
split_recommended: false
depends_on: [DP-038]
unblocks: []
acceptance_criteria:
  - Browser capture appears only as visible Investigation Context items or chips.
  - Debug investigation blocked reopen states do not auto-execute until prerequisites change.
  - Missing linked runtime identity becomes attention_required with target_selection_required unless deterministic rebinding exists.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_context_reopen_drift
reasoning_tier: high
context_scope: debug_context_reopen_blocking
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: debug_context_reopen_blocking
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`browser-context`"
  - "`Investigation Context`"
  - "`blocked`"
  - "`attention_required`"
  - "`target_selection_required`"
negative_constraints:
  - "Browser capture must never be silent chat capture or hidden messages."
  - "PM must not silently mint or infer a replacement target."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-042 - Provider Auth Surface And Storage Lock Owner Boundaries

```yaml
plan_unit_id: DP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Decision Policy may decide fallback posture, but provider identity,
  auth_surface, and bridge capability facts stay subordinate to AuthState and
  bridge owners, while lock-path ambiguity resolves through the storage owner
  from canonical logical-root and storage fallback canon.
gui_related: false
gui_classification_reason: This unit defines provider/auth/storage owner boundaries.
split_recommended: false
depends_on: [DP-023, DP-030, DP-038]
unblocks: []
acceptance_criteria:
  - Provider-owned identity and auth-surface wording route to Contracts_V0 and CLI_Bridged_Providers.
  - lock-path is derived by storage ownership, not surface-local path guesses.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_auth_storage_owner_drift
reasoning_tier: high
context_scope: provider_auth_storage_owner_boundary
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_auth_surface_storage_lock_owner_boundaries
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0026
preserved_exact_tokens:
  - "`AuthState`"
  - "`provider_identity`"
  - "`auth_surface`"
  - "`Plans/CLI_Bridged_Providers.md`"
  - "`lock-path`"
  - "`logical-root`"
negative_constraints:
  - "Decision Policy must not redefine provider_identity, auth_surface, or bridge capability facts."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
```

### DP-043 - Runtime Scheduler Event Canonical Defaults

```yaml
plan_unit_id: DP-043
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Runtime recovery defaults use scored event-driven scheduling, canonical
  Contracts_V0 event names and enum families over older aliases, defensive-only
  watchdog_recheck wakeups, and no critical-path scheduler term in MVP.
gui_related: false
gui_classification_reason: This unit defines runtime scheduler and event policy.
split_recommended: false
depends_on: [DP-035]
unblocks: []
acceptance_criteria:
  - scored event-driven scheduling remains the default runtime model.
  - watchdog_recheck may emit redundant wakeups defensively but is not the primary correctness path.
  - No critical-path scheduler term is introduced for MVP.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_scheduler_default_drift
reasoning_tier: high
context_scope: runtime_recovery_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_scheduler_event_canonical_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`scored event-driven scheduling`"
  - "`watchdog_recheck`"
  - "`critical-path scheduler term`"
  - "`ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md`"
negative_constraints:
  - "watchdog_recheck MUST NOT become the primary correctness path."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-044 - Retry And Remediation Ceiling Defaults

```yaml
plan_unit_id: DP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blind retry is forbidden, default retry ceiling remains 3 attempts, and
  default remediation ceiling remains 3 generations unless a higher-precedence
  contract narrows either ceiling.
gui_related: false
gui_classification_reason: This unit defines runtime retry/remediation policy.
split_recommended: false
depends_on: [DP-043]
unblocks: []
acceptance_criteria:
  - Blind retry is forbidden.
  - Retry and remediation ceilings remain 3 unless narrowed by higher-precedence contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retry_ceiling_drift
reasoning_tier: high
context_scope: runtime_retry_remediation
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: retry_remediation_ceiling_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`blind retry`"
  - "`3`"
  - "`default retry ceiling`"
  - "`default remediation ceiling`"
negative_constraints:
  - "blind retry is forbidden."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-045 - Blocked Outcome Preservation And Attempt Snapshots

```yaml
plan_unit_id: DP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Blocked outcomes preserve completed local work by default when a prerequisite
  or remote side effect is unresolved, and prerequisite resolution creates a new
  attempt snapshot instead of mutating the old attempt in place.
gui_related: false
gui_classification_reason: This unit defines runtime attempt and preservation policy.
split_recommended: false
depends_on: [DP-044]
unblocks: []
acceptance_criteria:
  - Blocked outcomes preserve completed local work by default under unresolved prerequisite or remote side-effect stops.
  - Prerequisite resolution creates a new attempt snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_outcome_preservation_loss
reasoning_tier: high
context_scope: blocked_outcome_attempt_snapshot
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: blocked_outcome_preservation_attempt_snapshots
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`blocked outcomes`"
  - "`completed local work`"
  - "`new attempt snapshot`"
negative_constraints:
  - "Prerequisite resolution must not mutate an old attempt snapshot in place."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-046 - Graph Degradation And Integrity Defaults

```yaml
plan_unit_id: DP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Draft decomposition may degrade only before graph lock, and canonical graph
  integrity failures do not degrade silently.
gui_related: false
gui_classification_reason: This unit defines graph integrity and degradation policy.
split_recommended: false
depends_on: [DP-045]
unblocks: []
acceptance_criteria:
  - Draft decomposition degradation is allowed only before graph lock.
  - Canonical graph integrity failures do not degrade silently.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_integrity_silent_degradation
reasoning_tier: high
context_scope: graph_integrity_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: graph_degradation_integrity_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`graph lock`"
  - "`canonical graph integrity failures`"
negative_constraints:
  - "Canonical graph integrity failures do not degrade silently."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-047 - Mutation-Sensitive Git Snapshot Failure Criticality

```yaml
plan_unit_id: DP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Mutation-sensitive git snapshot failures are CRITICAL: if git add or an
  equivalent snapshot step fails, undo metadata must not advance to a poisoned
  hash or silently point at a weeks-old state.
gui_related: false
gui_classification_reason: This unit defines source-control mutation safety policy.
split_recommended: false
depends_on: [DP-046]
unblocks: []
acceptance_criteria:
  - Failed git add or equivalent snapshot failure is treated as CRITICAL.
  - undo metadata does not advance to poisoned or stale hashes after a failed snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mutation_snapshot_poisoning
reasoning_tier: high
context_scope: git_snapshot_failure_criticality
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: mutation_sensitive_git_snapshot_failure_criticality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`git add`"
  - "`/undo`"
  - "`poisoned hash`"
  - "`weeks-old state`"
  - "`CRITICAL`"
negative_constraints:
  - "Mutation-sensitive git snapshot failures must not be swallowed."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-048 - Provider Response Guard Determinism

```yaml
plan_unit_id: DP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Provider adapters check choices.len before indexing, and an empty
  content-filtered response maps to FinishReasonContentFilter rather than panic
  or normal completion.
gui_related: false
gui_classification_reason: This unit defines provider adapter response handling.
split_recommended: false
depends_on: [DP-043]
unblocks: []
acceptance_criteria:
  - PROV adapters check choices.len before indexing.
  - Empty content-filtered responses map to FinishReasonContentFilter.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_response_guard_panic
reasoning_tier: high
context_scope: provider_response_guard
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: provider_response_guard_determinism
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0027
preserved_exact_tokens:
  - "`PROV`"
  - "`choices.len`"
  - "`FinishReasonContentFilter`"
negative_constraints:
  - "Empty content-filtered responses must not become a panic or normal completion."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-049 - Additional Blocked Reason Matrix Rows

```yaml
plan_unit_id: DP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The runtime recovery matrix includes blocked rows for validation_blocked,
  remediation_ceiling_exceeded, worktree_conflict, dirty_worktree, and
  plugin_hook_blocked with their manual resume, remediation, safe-point, and
  terminal/escalation behavior.
gui_related: false
gui_classification_reason: This unit defines blocked-reason matrix policy.
split_recommended: false
depends_on: [DP-043, DP-044]
unblocks: []
acceptance_criteria:
  - The five listed blocked_reason_code classifiers remain in the matrix.
  - Matrix rows preserve manual_resume_count, safe-point restore, remediation, and remain-blocked semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_matrix_row_loss
reasoning_tier: high
context_scope: runtime_recovery_matrix
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: additional_blocked_reason_matrix_rows
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0029
preserved_exact_tokens:
  - "`validation_blocked`"
  - "`remediation_ceiling_exceeded`"
  - "`worktree_conflict`"
  - "`dirty_worktree`"
  - "`plugin_hook_blocked`"
  - "`manual_resume_count`"
  - "`remain blocked`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-050 - Timeout Outcome Provider-Transient Normalization

```yaml
plan_unit_id: DP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  tool_outcome = timed_out first normalizes to failure_class =
  provider_transient, then follows the canonical provider-transient row.
gui_related: false
gui_classification_reason: This unit defines backend timeout normalization.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - timed_out outcomes normalize to provider_transient before row handling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: timeout_normalization_drift
reasoning_tier: high
context_scope: timeout_normalization
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: timeout_outcome_provider_transient_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0030
preserved_exact_tokens:
  - "`tool_outcome = timed_out`"
  - "`failure_class = provider_transient`"
  - "`ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
```

### DP-051 - Safe-Point Restore Field Override

```yaml
plan_unit_id: DP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  When a blocked payload sets requires_safe_point_restore = true, that field
  overrides the row-default rerun path.
gui_related: false
gui_classification_reason: This unit defines backend blocked payload override behavior.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - requires_safe_point_restore = true overrides row-default rerun behavior.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_override_loss
reasoning_tier: standard
context_scope: safe_point_restore_override
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: safe_point_restore_field_override
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0031
preserved_exact_tokens:
  - "`requires_safe_point_restore = true`"
  - "`ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
```

### DP-052 - Worktree Blocked Posture Defaults

```yaml
plan_unit_id: DP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  worktree_conflict remains blocked until resolution, and dirty_worktree remains
  blocked until cleanup or restore action.
gui_related: false
gui_classification_reason: This unit defines backend blocked-state posture.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - worktree_conflict and dirty_worktree remain blocked until their listed resolution paths.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_blocked_posture_drift
reasoning_tier: standard
context_scope: source_control_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: worktree_blocked_posture_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`worktree_conflict`"
  - "`dirty_worktree`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-053 - Source Control Recovery CTA Effects

```yaml
plan_unit_id: DP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  worktree_conflict and dirty_worktree blocked states show the Source Control
  recovery CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible Source Control recovery CTA behavior.
split_recommended: false
depends_on: [DP-052]
unblocks: []
acceptance_criteria:
  - Source Control recovery CTA is shown for worktree_conflict and dirty_worktree blocked states.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_cta_loss
reasoning_tier: standard
context_scope: source_control_recovery_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: source_control_recovery_cta_effects
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show Source Control recovery CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-054 - GitHub Actions Auth-Expired Blocked Default

```yaml
plan_unit_id: DP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Unrecoverable failure_class = auth_expired for GitHub-hosted Actions admin/run
  actions remains blocked until auth refresh.
gui_related: false
gui_classification_reason: This unit defines GitHub Actions blocked-state policy.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - Unrecoverable GitHub-hosted Actions auth_expired admin/run actions remain blocked until auth refresh.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_actions_auth_block_drift
reasoning_tier: standard
context_scope: github_actions_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_auth_expired_blocked_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`failure_class = auth_expired`"
  - "`GitHub-hosted Actions admin/run actions`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
```

### DP-055 - GitHub Actions Recovery CTA Effect

```yaml
plan_unit_id: DP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The GitHub Actions auth refresh block shows the GitHub Actions recovery CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible GitHub Actions recovery CTA behavior.
split_recommended: false
depends_on: [DP-054]
unblocks: []
acceptance_criteria:
  - GitHub Actions recovery CTA is shown for unrecoverable auth_expired admin/run action blocks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_actions_cta_loss
reasoning_tier: standard
context_scope: github_actions_recovery_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: github_actions_recovery_cta_effect
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show GitHub Actions recovery CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/GitHub_Integration.md
```

### DP-056 - Docker And Kubernetes Blocked Posture Defaults

```yaml
plan_unit_id: DP-056
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Docker external_side_effect_blocked waits for approval or explicit decline
  while preserving local build/publish result, and Kubernetes
  apply/exec/port-forward prerequisite blocks wait for context or prerequisite
  resolution.
gui_related: false
gui_classification_reason: This unit defines Docker and Kubernetes blocked posture.
split_recommended: false
depends_on: [DP-049]
unblocks: []
acceptance_criteria:
  - Docker repo create, push, and template push side-effect blocks preserve local build/publish result.
  - Kubernetes prerequisite blocks wait for context or prerequisite resolution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_kubernetes_blocked_posture_drift
reasoning_tier: standard
context_scope: docker_kubernetes_blocked_defaults
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_kubernetes_blocked_posture_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`external_side_effect_blocked`"
  - "`Docker repo create/push/template push`"
  - "`preserve local build/publish result`"
  - "`Kubernetes apply/exec/port-forward`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
```

### DP-057 - Docker Manager Kubernetes CTA Effect

```yaml
plan_unit_id: DP-057
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Kubernetes apply, exec, and port-forward prerequisite blocks show the Docker
  Manager Kubernetes CTA.
gui_related: true
gui_classification_reason: This unit defines user-visible Docker Manager Kubernetes CTA behavior.
split_recommended: false
depends_on: [DP-056]
unblocks: []
acceptance_criteria:
  - Docker Manager Kubernetes CTA is shown for Kubernetes prerequisite blocks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_kubernetes_cta_loss
reasoning_tier: standard
context_scope: docker_manager_kubernetes_cta
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_manager_kubernetes_cta_effect
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`show Docker Manager Kubernetes CTA`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Containers_Registry_and_Unraid.md
```

### DP-058 - Target-Bound Approval Identity Fields

```yaml
plan_unit_id: DP-058
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval and preflight blind-spot defaults are target-bound, not
  action-name-bound, and preserve SCM, GitHub Actions, Docker, and Kubernetes
  target identity fields before mutation.
gui_related: false
gui_classification_reason: This unit defines approval identity payload fields.
split_recommended: false
depends_on: [DP-036]
unblocks: []
acceptance_criteria:
  - Approval identity includes target fields for SCM, GitHub Actions, Docker, and Kubernetes domains.
  - Multi-repo projects do not bind approval by action name alone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: target_bound_approval_identity_drift
reasoning_tier: high
context_scope: target_bound_approval_identity
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: target_bound_approval_identity_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`project_id`"
  - "`repo_id`"
  - "`workflow_id`"
  - "`runtime`"
  - "`registry_host`"
  - "`kube_context`"
negative_constraints:
  - "Approval/preflight blind-spot defaults are target-bound, not action-name-bound."
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
```

### DP-059 - Approval Preflight Ordering And Revalidation

```yaml
plan_unit_id: DP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Approval ordering is static policy check, cheap capability or precondition
  preflight, approval request only while still actionable, then full
  execution-time revalidate immediately before mutation; stale-preflight
  evidence or target drift returns the action to blocked state.
gui_related: false
gui_classification_reason: This unit defines approval/preflight execution policy.
split_recommended: false
depends_on: [DP-058]
unblocks: []
acceptance_criteria:
  - The static policy, precondition, approval, and revalidate order is preserved.
  - preflight_revision drift or changed target identity invalidates approval and returns to blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_preflight_order_drift
reasoning_tier: high
context_scope: approval_preflight_revalidation
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: approval_preflight_ordering_revalidation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/precondition`"
  - "`/revalidate`"
  - "`preflight_revision`"
  - "`stale-preflight evidence`"
negative_constraints:
  - "Approval requests occur only while still actionable."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-060 - Domain-Sensitive Approval Scope Separation

```yaml
plan_unit_id: DP-060
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Domain-bound approvals include attempted operation or action class, bind
  domain-sensitive resource targets, and keep policy-vs-approval-vs-preflight
  outcomes as distinct blocked families.
gui_related: false
gui_classification_reason: This unit defines approval scope semantics.
split_recommended: false
depends_on: [DP-058]
unblocks: []
acceptance_criteria:
  - SCM, GitHub Actions, Docker, and Kubernetes approvals bind operation/action class plus target scope.
  - policy-vs-approval-vs-preflight outcomes remain distinct blocked families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: domain_approval_scope_collapse
reasoning_tier: high
context_scope: domain_sensitive_approval_scope
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: domain_sensitive_approval_scope_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/admin/domain-sensitive`"
  - "`/repositories`"
  - "`/worktrees/refs`"
  - "`/environment`"
  - "`policy-vs-approval-vs-preflight`"
negative_constraints:
  - "Domain-bound approvals include the attempted operation or action class, not only resource identity."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-061 - Research-Safe Planning Tool Boundary

```yaml
plan_unit_id: DP-061
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Research-safe plan-mode tools and question-driven planning flows may be
  allowed for planning without granting mutation authority.
gui_related: false
gui_classification_reason: This unit defines planning tool permission boundaries.
split_recommended: false
depends_on: [DP-060]
unblocks: []
acceptance_criteria:
  - Research-safe planning tools do not grant mutation authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: research_safe_tool_boundary_drift
reasoning_tier: standard
context_scope: research_safe_planning_tools
implementation_surfaces:
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: research_safe_planning_tool_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`/research-safe`"
  - "`todoread`"
  - "`todowrite`"
  - "`webfetch`"
  - "`webcrawl`"
  - "`webmap`"
negative_constraints:
  - "Planning tool allowance does not grant mutation authority."
owner_hints:
  - Plans/Decision_Policy.md
```

### DP-062 - Durable Approval Scope Reuse Context

```yaml
plan_unit_id: DP-062
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  Durable approval scope and reuse are governed by approval_scope_key,
  actor/lane/run/account context, requested/effective permission disclosure, and
  permission-snapshot drift rules in Permissions_System and Contracts_V0.
gui_related: false
gui_classification_reason: This unit defines durable approval reuse policy.
split_recommended: false
depends_on: [DP-058, DP-059]
unblocks: []
acceptance_criteria:
  - approval_scope_key and actor/lane/run/account context govern durable approval reuse.
  - Permission disclosure and permission-snapshot drift rules are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: durable_approval_reuse_drift
reasoning_tier: high
context_scope: durable_approval_scope_reuse
implementation_surfaces:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: durable_approval_scope_reuse_context
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0032
preserved_exact_tokens:
  - "`approval_scope_key`"
  - "`actor/lane/run/account context`"
  - "`requested/effective permission disclosure`"
  - "`permission-snapshot drift rules`"
  - "`ContractName:Plans/Permissions_System.md`"
  - "`ContractName:Plans/Contracts_V0.md`"
negative_constraints: []
owner_hints:
  - Plans/Decision_Policy.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
```

### DP-001 - Decision Policy Source-Preserving Bridge Retired

```yaml
plan_unit_id: DP-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Decision_Policy.md
canonical_text: >-
  The former Decision Policy source-preserving bridge is retired in place after
  Phase 2B atomized or structurally dispositioned Decision_Policy-S0001 through
  Decision_Policy-S0036 into DP-002 through DP-062 or explicit structural
  coverage. DP-001 remains only as migration lineage for the retired bridge span
  and must not re-own atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DP-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by DP-002 through DP-062 and structural coverage_map dispositions.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 046 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/Decision_Policy.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Decision_Policy-S0035
preserved_exact_tokens:
- DP-001
- source_preserving_planunit
- source_preserving_bridge_retired
- DP-002
- DP-062
- Decision_Policy-S0001
- Decision_Policy-S0036
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks
negative_constraints:
- "Do not remap atomized Decision_Policy spans back to DP-001."
- "Do not treat the retired bridge as implementation-ready product coverage."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this migration-lineage unit."
compatibility_only_notes:
- "The old source-preserving bridge is retained only so migration lineage and historical references to DP-001 remain auditable."
stale_retired_dispositions: []
owner_boundary_notes:
- "DP-002 through DP-062 and structural coverage_map dispositions own the Decision_Policy source coverage for S0001-S0036."
owner_hints:
- Plans/Decision_Policy.md
```

## Migration Coverage

Original hash: `34fdf55ca635fc59620b14a92475ca59f3c1e2ccb1ba0af1ce503798b8612230`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Decision_Policy-S0001` through `Decision_Policy-S0036` remain preserved in place. Phase 2B batches 044 through 046 atomized or structurally dispositioned `Decision_Policy-S0001` through `Decision_Policy-S0036` into `DP-002` through `DP-062`, retired `DP-001`, and explicit structural coverage_map dispositions. `DP-001` is retained only as migration-lineage compatibility coverage and must not re-own atomized source coverage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
