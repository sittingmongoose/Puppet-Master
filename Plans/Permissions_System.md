# Permissions System (Canonical SSOT)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Requested/effective account identity contract
- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master permission system — the rules that govern when a tool invocation is allowed, requires user approval, or is denied. All other plan documents MUST reference this document by anchor (e.g., `Plans/Permissions_System.md#PERM-ACTIONS`) rather than restating permission action definitions, precedence rules, granular syntax, or default tables.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Tool registry + tool semantics: `Plans/Tools.md`
- FileSafe guards: `Plans/FileSafe.md`
- Run modes: `Plans/Run_Modes.md`
- Persona system: `Plans/Personas.md`
- OpenCode baseline (permissions): `Plans/OpenCode_Deep_Extraction.md` §7C
- GUI specification: `Plans/FinalGUISpec.md`
- CLI-bridged providers: `Plans/CLI_Bridged_Providers.md`

---

## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Add requested_account_id alongside requested_account_policy
- Add requested_account_binding and govern provider_account_id as subordinate provider-native metadata
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- Under `## Canonical data-shape reconciliation` -> `### Required data shape`, explicitly place `requested_account_id` alongside `requested_account_policy`.
- Define `requested_account_binding` and keep `provider_account_id` governed only as subordinate provider-native metadata rather than canonical account identity.
- Require requested/effective account identity to survive runtime, bridged-provider, and permission envelopes.
- State that OpenCode session IDs move into provider-native correlation fields instead of canonical `thread_id`.
- Define `approval_scope_key` across actor/lane/run/account context and require reuse across permissions, HITL, doom-loop, and session approval caching.

### P5 permission authority recovery

Permission prompts are no longer session-centric or under-bound: `ask -> deny unless HITL at current tier boundary` is a deprecated tier-era behavior, and the active blocked-overlay flow requires HITL, `/account`, `/lane/run/account`, shared-runtime, actor, lane, run, account, and operational identity scope on approval snapshots and approval caching.

Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries: the explicit `/actor/lane` scope key includes actor, run, lane, account, and package/seam context before approval reuse. The permission layer must not mix tier-boundary governance with tool-level HITL approval semantics; tier-boundary language is compatibility only, while tool-level approval, HITL approval, and blocked-state approval use the shared approval scope and permission snapshot fields.

Permission resolution and approval carryover/cascade are execution-entity scoped. Lane, package, `/lane/account`, effective-account, and effective account `/identity` facts remain part of the approval snapshot, and blocked cards must explain which effective account/identity would have executed before any `/cascade` or reject-cascade reuse applies.

Runtime artifact permission drill-through preserves `Plans/Runtime_Artifacts_Panel.md`, `/Runtime_Artifacts_Panel.md`, `/schema-family`, attempt-key, envelope family, and deterministic drill-through ownership when a permission prompt points into runtime artifacts.

Runtime state hooks must carry blocked_reason_code?, allowed_action_ids[]?, failure_class?, permission_snapshot_id?, provider_attempt_ref?, blocked_reason_code, allowed_action_ids, failure_class, permission_snapshot_id, and provider_attempt_ref so permission cards and blocked-state records share the same hook vocabulary.

Blocked-state approval actions map from canonical allowed_action_ids[] and allowed_action_ids, while graph approval actions target request_id; consumer surfaces must not split blocked-state authority away from request identity.

Worktree permission policy references `Plans/WorktreeGitImprovement.md`, `/WorktreeGitImprovement.md`, and per-subtask only as lineage; lane pools and parallel toggles must be reconciled before per-subtask worktrees can drive permission scope.

Decision policy integration preserves `Plans/Decision_Policy.md`, `/Decision_Policy.md`, and `/storage/runtime` deterministic policy ownership for executor, storage, and runtime surfaces that consume permission decisions.

Remote side effects and mode-override semantics reconcile `ask/plan -> deny`, `/plan`, `/approval`, external_publish_side_effect, side-effect, and non-bypassable approval behavior so mutating remote publication cannot diverge by surface or mode.

Provider-gap disclosure is separate from overrides: provider-gap states honored, skipped, and clamped describe requested/effective provider behavior and must not be collapsed into generic override wording.

Requested/effective permission display may stay compact only when requested == effective and no control was skipped or `/clamped`; if they differ, the permission UI must expand and `/disclose` the reason visibly on the owning surface.

Degraded-trust and projection-health are permission-visible trust inputs. Permission cards, approval surfaces, Orchestrator, Usage, widgets, and provider surfaces consume one degraded-trust / projection-health / concern bridge so stale, degraded, or restricted-trust render states cannot masquerade as fresh authority. Artifact and `/file` routing must support attempt_id and other runtime object ids directly, and read-only, historical, and restricted-trust rendering must be explicit in the permission disclosure.

DRY reference integrity remains permission-visible: `DRY_Rules.md`, DRY_Rules, ContractRef, ContractName, and cross-reference cleanup must stay internally consistent where permission cards link gates, anchors, or contract examples.

Route contracts keep line `/range` under OpenFile, and object-family-specific anchors must justify themselves instead of defaulting every special case into the base route contract.

GATE-003, GATE, owner-doc, and ContractRef syntax defects are hard owner-doc integrity failures, not style preferences, when permission or gate cards expose contract links.

Search permission surfaces distinguish global object search from tab-local filtering; tab-local and tab-local filtering narrow an already selected surface, while global object search crosses surfaces and needs separate permission disclosure.

Route-target and subject-open permissions approve the exact target they display. Permission cards must preserve route-target, subject-open, `/output`, OpenFile, path-based `/file` opens, `line?` / `range?` targeting when path-based, and editor-group realization as separate target facts instead of hiding them behind a generic file-open prompt.

Navigation approvals inherit the same layered target model: the shared target object comes first, specialized open `/navigation` verbs sit above it, and path-open is one specialization rather than the base primitive.

Small permission surfaces keep canonical terms and compact labels. Source Control remains worktree-first, graph badges and inspector chips stay dense, and `/contextual` help links expand to deeper explanations instead of renaming local jargon.

## 1. Definitions and scope
### 1.1 Path normalization invariants

Before any permission match, path comparison, or scope check, paths MUST be normalized in this order:
1. Expand `~` and `$HOME` to the real home-directory path.
2. Resolve an absolute path and eliminate `.` / `..` components.
3. Resolve symlinks with `realpath()`; this is the symlink-root canonicalization step.
4. Match only against the normalized canonical path.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

Required behavior:
- `realpath()` failure is fail-closed. Broken symlink, permission error, or missing target means deny.
- PM MUST NOT compare against an unresolved path as fallback.
- Unexpanded `~` in a runtime path comparison is always a bug.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md

<a id="DEF-SCOPE"></a>
### 1.2 Tool registry/policy vs Permission rules

The permission system defines when a tool invocation is allowed, requires approval, or is denied. `Plans/Tools.md` defines what tools exist and how dispatch occurs. Tool policy consumes permission rules; permission rules do not depend on tool implementation details.

ContractRef: ContractName:Plans/Tools.md, Primitive:DRYRules

### 1.3 HTE vs DAE applicability

Permission rules apply in both execution strategies. In HTE, Puppet Master is the sole tool dispatcher. In DAE, Puppet Master enforces the resolved permission ceiling through pre-spawn policy injection and post-hoc reconciliation; DAE never creates an execution path that bypasses permission canon.

ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE, ContractName:Plans/Tools.md

Universal invariant: `policy.may_execute_tool()` MUST be applied before every tool dispatch regardless of nesting depth, child-run path, execution strategy, or provider surface. Child, subagent, or crew context is not a bypass.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/orchestrator-subagent-integration.md

### 1.4 Permission-state mutation and hook safety

Any mutable permission state shared across threads or async tasks MUST be protected by an `RwLock` / read-write lock. Unguarded mutation of allowlists, deny rules, session approvals, or cached effective policy state is prohibited.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

Hooks that modify tool arguments or effective invocation context MUST trigger a fresh permission evaluation on the modified arguments before dispatch. Hook execution can narrow permissions, but MUST NOT widen them after the original check has already passed. This is the post-hook permission re-check contract.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md

### 1.5 Executable capability surfaces and trust posture

Discovery is not execution approval. Any auto-discovered executable surface or executable-config entry must clear the permission system before PM loads or runs it. This is the permission-system-level executable-code gate for MCP servers, custom tools, executable configs, and plugin hooks.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md

The following are executable capability surfaces:
- plugin code and hook handlers
- custom tool executables or wrappers
- MCP server binaries or entry commands
- command templates that expand to shell execution
- formatter binaries and other post-write executables

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md

Trust rules:
- first load or first execution requires explicit user approval on the owning surface
- config presence, package discovery, or catalog availability does not imply execution approval
- arg-touching hooks and other execution-modifying surfaces require signed artifacts, `/signing` evidence, or an explicitly elevated approval posture stronger than read-only plugins
- source or version change invalidates prior approval and requires a new decision

Shared `/network/trust` policy covers proxy mode `system`, `manual`, or `off`; `http_proxy`, `https_proxy`, `no_proxy`; proxy credential source from the OS credential store only; and per-domain/per-surface opt-out rules. Trust policy begins with the OS trust store and may add an app custom CA bundle or per-host CA override with validation and expiry reporting, independent of Unraid metadata.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md

### 1.6 Enterprise host, registry, and cluster policy outcomes

Enterprise `/air-gapped` behavior distinguishes four canonical outcomes instead of collapsing them into generic network failure: `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, and `host_untrusted`. Hosted and `/runtime` surfaces may show read-only cached state with freshness markers when prior evidence exists, but cached state MUST NOT be presented as live authority or execution capability.

Enterprise and `/private` registry policy is resolved through `registry_hosts[]`. Each `registry_hosts` entry inherits the shared `/network/trust` posture, `/proxy` mode, app custom CA bundle, per-host CA override, validation and expiry reporting state, host policy, capability snapshot, and default push target from the owning registry contract.

Kubernetes policy is resolved through `k8s_host_policy`. It defines allowed contexts, clusters, namespaces, and `/verb` entries, including `apply`, `exec`, `port_forward`, and `logs`. Policy-denied but otherwise valid `/registry` or Kubernetes actions map to canonical blocked/`/denied` outcomes such as `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted`; they MUST NOT be reported as generic network failure.

Plugin-added, MCP, custom-tool, and other `/extensibility` surfaces that contact external hosts inherit the same host policy, trust, proxy, and blocked-reason checks before dispatch. They may surface blocked `/cards/actions` through ordered `allowed_action_ids[]`, but they do not get plugin-private network exceptions.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plugins_System.md

## 2. Permission actions

<a id="PERM-ACTIONS"></a>

Exactly three permission actions exist. Every tool invocation resolves to exactly one action.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 `allow`

The tool invocation proceeds without user approval. FileSafe guards (`Plans/FileSafe.md`) still apply after permission resolution.

### 2.2 `ask`

The tool invocation is paused pending user approval. The user is presented with the invocation details and MUST choose one of the canonical resolution options: `deny`, `once`, `for session`, or `always` (see §6). If no user is available (headless/Orchestrator run), `ask` maps to `deny` unless a HITL/approval gate is active for the current blocked episode or package/seam decision point and can surface the ordered `allowed_action_ids[]` through the shared approval scope (`Plans/human-in-the-loop.md`).

### 2.3 `deny`

The tool invocation is blocked. The policy engine emits a `tool.denied` event (`Plans/Contracts_V0.md#EventRecord`) and returns an error to the agent. The tool is not executed.

### 2.4 Deterministic precedence across layers

Permission rules are evaluated in a strict layer precedence. The first layer that produces a defined rule for the invocation wins; higher-precedence layers shadow lower layers on a per-rule basis, but they do NOT replace the entire lower ruleset.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md#PERSONA-INJECTION, PolicyRule:Decision_Policy.md§2

| Priority | Layer | Source | Description |
|---|---|---|---|
| 1 | Mode override | `Plans/Run_Modes.md` | `ask` / `plan` clamp mutating capability; `yolo` applies only where policy allows. |
| 2 | Parent/run ceiling | runtime envelope | Parent execution ceiling and inherited restriction patterns. |
| 3 | Session cache | runtime | Prior explicit approvals scoped to the session. |
| 4 | Persona overrides | `Plans/Personas.md` | Named permission profile for the active Persona. |
| 5 | Project-level | `.puppet-master/permissions.toml` | Project-local rules. |
| 6 | Global-level | user config | User-wide rules. |
| 7 | Defaults | this document | Hardcoded fallback table. |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md

Child inheritance rules:
- Child runs inherit both action ceilings and restrictive argument-pattern rules from the parent chain.
- Inheritance is additive-downward and merge-not-replace: a child may narrow authority, but MUST NOT widen or replace away inherited restrictions.
- The permission chain is evaluated as Parent Agent -> Parent Session -> Child Session -> Child Agent, then project/global/default layers.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md

When multiple rules for the same permission key are simultaneously applicable, the most specific scope wins before falling back to the broader layer order in §2.4. Scope specificity is:

`lane:{lane_id}` > `seam:{seam_id}` > `package:{package_id}` > project > global

Role-scoped account policy overrides use the same precedence chain. A rule may carry `allowed_roles`, `disallowed_roles`, `cooldown_policy_override`, and `switch_threshold_override`; these fields narrow which execution roles may use the account/pool and how cooldown or threshold switching applies, but they do not widen the parent/run permission ceiling.

Scope meanings:
- `package:{package_id}` applies only while execution is inside the identified package. A package scope inherits from the enclosing project scope unless explicitly overridden.
- `seam:{seam_id}` applies only at the named seam boundary, including cross-package transitions and other explicitly modeled boundary crossings.
- `lane:{lane_id}` applies only within the identified execution lane and is the narrowest durable scope in the standard precedence model.

This specificity order applies anywhere scoped permission material is evaluated, including session-cache approvals, durable project/global rules, and inherited parent/run ceilings. Ties within the same scope still use the layer order in §2.4 and last-match-wins behavior inside the selected ruleset (§3.1).

ContractRef: Plans/FinalGUISpec.md#10.8 Human-in-the-loop approvals, Plans/Tools.md#10.7A Web-operation approval summary rules

Required fields:
- execution_entity_id
- account_id
- permission_scope
- approval_carryover_scope

Canonical terms and values:
- execution_entity_id
- account_id
- permission_scope
- approval_carryover_scope

Labels:
- account

Behavioral rules:
- Permission resolution and approval carryover must be multi-lane and account-aware rather than session-only.

Permission carry-through:
- execution-entity
- effective-account
### 2.4A Requested vs effective permissioned capability state

The UI and runtime must distinguish requested state from effective state whenever permission, policy, platform, or health constraints change what is actually available.

This rule applies to:
- tool availability
- MCP server/tool availability
- browser trust/capability tiers
- project-scoped overrides after project switch
- Persona-selected profiles and overrides
- orchestration-level child inheritance and nested capability ceilings

Display rule:
- when requested and effective state differ, the effective state is what executes
- the UI must disclose the difference and its reason on the owning surface rather than forcing the user to infer it from missing controls or failed calls
- Approval UI must show which layer governs each tool's permission state, including project defaults, global defaults, user override, admin policy, mode override, session cache, Persona profile, project rule, global rule, and default when that source determines the effective result.

<a id="PRECEDENCE-LAYERS"></a>

`#PRECEDENCE-LAYERS` is an anchor alias for the canonical precedence contract in §2.4. This subsection owns requested-vs-effective disclosure only; it does not redefine the layer table.

Rule: the same effective result produced by §2.4 is what the UI must show as executable capability.

Terminal-owned shell execution and reveal flows use the same `/requested-vs-effective` permission-model disclosure as every other privileged runtime action. `Plans/Permissions_System.md` owns the permission wording, while Section15 owns the terminal session, reveal, and PTY behavior; permission UI must not imply a terminal action is allowed when the effective permission or capability state is clamped.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§2

---

## 3. Granular rules

<a id="GRANULAR-RULES"></a>

A permission rule MAY be a simple action string (`"allow"`, `"ask"`, `"deny"`) or an object containing pattern-based sub-rules that match against invocation context (e.g., file path for `read`/`edit`, command string for `bash`, URL for `webfetch`).

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2

### 3.1 Wildcard syntax and matching
<a id="WILDCARD-SYNTAX"></a>

Pattern matching uses the following syntax:

| Token | Meaning |
|-------|---------|
| `*` | Matches zero or more characters |
| `?` | Matches exactly one character |

**Special case:** A pattern ending with ` *` (space + wildcard) makes the trailing portion optional. Example: `"git *"` matches both `"git"` and `"git status"`.

Tool-family prefix wildcards are valid for MCP/server-provided tools as well as built-ins. Enabling or disabling `github_*` affects every matched tool from the `github` server family, while more specific rules still win according to the precedence and last-match rules below.

**Ordering:** Within a single ruleset (object syntax), rules are evaluated in definition order; the last matching rule wins. This allows broad patterns followed by narrow exceptions.

```toml
[bash]
"*" = "ask"
"git *" = "allow"
"rm *" = "deny"
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into provider permission and secret-custody requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PS-119 - Provider Secret Custody And Route Permission Boundaries

```yaml
plan_unit_id: PS-119
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Provider route credentials, OAuth/session state, API keys, subscription-backed auth, authorization URLs, local account roots, and provider-native tool access are governed by PM permission custody and secret redaction. Plans, ledgers, logs, runtime artifacts, usage rows, and GUI diagnostics may store credential locators, account/profile refs, redacted setup state, and proof metadata, but never raw secrets. Route permissions must distinguish direct API, CLI runtime, server bridge, subscription-backed, and provider-native tool access.
gui_related: true
gui_classification_reason: Permission prompts, setup diagnostics, and redacted provider state are visible GUI behavior.
depends_on: [CV-294, MA-062]
unblocks: [T-164, RAP-032, F3-400]
acceptance_criteria:
  - Provider credentials are referenced by non-secret locators or profile refs.
  - API keys, OAuth URLs, session tokens, and local account secrets are never persisted in Plans, ledgers, logs, usage rows, or runtime artifacts.
  - Provider-native tool access goes through permission snapshots and redaction profiles.
  - Subscription-backed routes have distinct permission/account states from API-key routes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_secret_leak
reasoning_tier: high
context_scope: provider_secret_custody
implementation_surfaces: [Plans/Permissions_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Tools.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_secret_custody_boundaries, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0055
  - pldg-20260624-001-provider-updates:atom-0120
  - pldg-20260624-001-provider-updates:atom-0137
source_atom_ids: [atom-0055, atom-0116, atom-0120, atom-0121, atom-0131, atom-0137, atom-0138]
preserved_exact_tokens: ["Dont put it in the ledger.", "API key", "OAuth", "authorization URL", "credential_locator", "credential_ref", "subscription-backed", "provider-native tools", "redaction_profile", "permission_snapshot_id"]
negative_constraints:
  - Do not store raw provider API keys, OAuth URLs, tokens, account identifiers, or local secrets in Plans, ledgers, logs, artifacts, or diagnostics.
  - Do not treat a subscription-backed route as equivalent to an API-key route for permission custody.
  - Do not bypass permission snapshots for provider-native tools.
owner_hints: [Plans/Permissions_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2

**Case sensitivity:**
- path-based matching follows the canonical filesystem semantics of the resolved root after `realpath()`
- a project on a case-sensitive filesystem uses case-sensitive matching even if the host OS can also mount case-insensitive volumes
- a project on a case-insensitive filesystem uses case-insensitive path matching for path-based permission keys
- non-path tokens such as tool names, URL origins, and bash command prefixes remain bytewise case-sensitive unless their owning subsystem defines a narrower rule

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md

If PM cannot determine a stable canonical root for a path comparison, it fails closed rather than guessing a case mode from the OS or current shell.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md
### 3.2 Home expansion

<a id="HOME-EXPANSION"></a>

The characters `~` and `$HOME` are expanded to the user's home directory **only when they appear at the start of a pattern**. Mid-pattern occurrences are treated as literal characters.

### 3.3 External directory guard

<a id="EXTERNAL-DIR-GUARD"></a>

Any tool invocation that references a path outside the active project's working roots (as defined by the project configuration and workspace) triggers the `external_directory` permission key. Default: `ask` (see §7).

An **external directory allowlist** defines paths that are pre-approved for external access. The allowlist is stored in the permissions config (§9). Paths on the allowlist bypass the `external_directory` guard.

Allowlist entries support wildcard syntax (§3.1). Example:

```toml
[external_directory]
allowlist = [
  "~/.cargo/**",
  "/usr/local/include/**",
]
```

### 3.4 Pattern suggestion contract ("always" approval)

<a id="PATTERN-SUGGESTION"></a>

When a user responds `always` to an `ask` prompt (§6.2), the system derives a suggested approval scope from the invocation context and presents the user with scope-bound approval choices instead of silently minting a session-wide allow. Pattern suggestions are still derived from tool-specific context:

- **bash:** The command prefix (first word + space + `*`). Example: invocation `git commit -m "fix"` → pattern `"git *"`.
- **edit/read/glob/grep:** The directory prefix (`<dir>/**`). Example: invocation path `src/auth/login.rs` → pattern `"src/auth/**"`.
- **websearch/webresearch:** Wildcard discovery scope (`*`) or query/task-category scope when the advanced matcher is implemented, because the URL set is not known before discovery. The wildcard is tool-scoped and never grants unrelated network, file, shell, or mutation authority.
- **webfetch/webextract/webcrawl/webmap:** The normalized target origin and scope. Single-target reads and extraction use the concrete URL origin (`https://<domain>/*`); bounded crawl/map rules use the approved root origin plus an explicit crawl-scope discriminator, never a naked wildcard.
- Web approval pre-population is deterministic: `websearch` and `webresearch` pre-populate `*`; `webfetch` and `webextract` pre-populate `https://<actual-host>/*` derived from the URL; `webcrawl` and `webmap` pre-populate `https://<actual-root-host>/*` derived from `root_url`. The `/suggest` value is a user-editable pre-population convenience, not a lock.

The suggested pattern is displayed to the user during approval confirmation. The user MAY edit the pattern before a durable project/global rule is created, but the canonical approval anchor remains `approval_scope_key` plus blocked-episode identity rather than a UI session id.

### 3.4A Web-operation permission-key derivation
For canonical permission-key derivation, web operations use normalized suffixes rather than raw user-entered URLs:

- `webextract:{domain}` — extraction from a specific domain
- `webresearch:{query_category}` — research grouped by query category, where `query_category ∈ {general, code, docs, news}`
- `webcrawl:{domain}` — bounded crawl authority for a specific domain
- `webmap:{domain}` — site-structure mapping authority for a specific domain

Default web-operation posture remains `ask` where network web tools are enabled: `webextract`, `webresearch`, `webcrawl`, and `webmap` are explicit permission keys alongside `webfetch` and `websearch`. Extract/crawl/map approvals use granular URL/domain pattern rules; search/research may use query/task pattern rules only when the advanced matcher is implemented. Crawl/map fan-out must be visible in permission cards and audit payloads rather than hidden behind generic `webfetch`.

For any URL-derived web key, the runtime MUST extract the host, normalize it to the registrable domain, and use that canonical domain in the derived key. Example: `docs.example.com` normalizes to `example.com`.

Before any URL-derived web operation dispatches, the WebOperation permission check consumes the effective WebEgressPolicy: redirect policy, timeout/abort policy, proxy/trust policy, DNS-rebind check, SSRF/private-host/localhost policy, robots policy, crawl fanout/depth caps, cache/no-secret policy, and redaction profile. Private hosts, link-local IPs, localhost, file URLs, internal metadata endpoints, and DNS rebinding outcomes deny by default unless an explicit configured-provider endpoint or user-approved private-host policy applies. Robots denial, fanout cap, depth cap, cache bypass, and redaction-before-display outcomes are recorded as permission/audit evidence and surfaced in operation, denied, partial, approval, session, or batch cards.

WebOperation permission decisions are standalone receipts as well as nested operation metadata: each receipt preserves `permission_snapshot_id`, `decision`, `invocation_source`, optional `agent_reason`, and `tool_use_id` or `invocation_ref` so approval, denial, resumed, and headless-denied cards can explain whether the operation came from slash, palette, natural language, agent initiative, Goal Runtime, PRD Builder, Planning Wizard, or subagent work.

Wildcard matching for preset and policy authoring MAY use `web*:*` to represent all web-operation permission keys as a family. This wildcard is valid for preset definitions and other broad-scope policy surfaces but does not change the requirement that concrete approvals resolve to normalized derived keys.

ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget

Approval-card summary rules:
- `websearch summary shows tool name + query preview`
- `webfetch/webextract summary shows tool name + target host/URL`
- `webresearch summary shows tool name + task summary + estimated source count when available`
- `webcrawl/webmap summary shows tool name + root URL + page/depth caps`

Session-approval rules:
- `Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern and same tool-key semantics`
- `Approving webresearch For Session does NOT create broad allow for unrelated tools`
- `MVP uses wildcard session approval for search/research; advanced query-pattern support is future only`
- `webfetch` format requests for `screenshot` or `pdf` require `session_granted` tier approval because they invoke browser-runtime capture beyond the default text fetch path.
- Browser-session permission tiers use canonical storage values `always_allowed`, `session_granted`, and `explicit_confirmation`; UI/source aliases `always-allowed`, `session-granted`, and `explicit-confirmation` are lineage labels only and do not revive the retired preview/browser `trust-tier` matrix or replace requested/effective capability disclosure.
- Browser implementation-readiness permissions stay anchored to SSOT ownership: `/design-decision` and `/UI` readiness checklists must cover permission posture, session model, agent contract, watchability, DevTools, artifact capture, persistence, lifecycle, packaging, platform guarantees, command routing, and acceptance criteria without making Permissions_System the owner for non-permission browser details.
- `auth_session` follows the normal browser capture/share/clipboard model: it does not add special `/share` restrictions beyond visible chips and permission disclosure, and select/copy/paste (`/copy/paste` lineage) must work unless effective browser runtime or site policy blocks it.
- Query/task-granular and host-bound allow rules may become advanced-editor refinements later, but they must not block the base approval flow.
- `Once` shows "Approve only this invocation" and approves only the current web invocation.
- `For Session` for `websearch` and `webresearch` shows "Approve this tool for the rest of the current session" with suggested pattern `*`; this wildcard-only, tool-wide session behavior is tool-scoped and does not permit unrelated file/shell/network mutation tools.
- `For Session` for `webfetch` and `webextract` shows "Approve this host/site for the rest of the current session" and approves the normalized host/domain, while `webcrawl` and `webmap` approve the normalized root host/domain; the user-facing pattern suggestion uses host-scoped forms such as `https://host.example/*` or `https://docs.example.com/*`. For example, approving `webcrawl` For Session on `https://docs.example.com/start` approves later crawl/map/extract/fetch calls only when they match the same allowed host pattern and same tool-key semantics.
- The `/crawl/map/fetch` follow-on family shares the same normalized host/site matching rule when a `webcrawl` session approval grants follow-on read operations.
- `Always` shows "Create durable permission rule", surfaces Project/Global scope selection when both scopes are valid, and creates the durable project/global permission rule through canonical permissions storage.
- `Deny` shows "Reject this invocation" and invokes the `reject-all-pending` cascade: reject this invocation and reject any other pending asks in the same approval batch/session that share the same approval ask.

The approval summaries are rendered by `Plans/FinalGUISpec.md#15.7 Permission approval card widget` and the actual consumer sections that display the summaries.

Rules:
- URL-derived web keys normalize to registrable domain
## 4. Special guards

<a id="SPECIAL-GUARDS"></a>

Special guards are synthetic permission keys that are not tied to a specific tool but to a behavioral condition. They are evaluated in addition to tool-specific permissions.

ContractRef: PolicyRule:Decision_Policy.md§2

### 4.1 `doom_loop`

<a id="GUARD-DOOM-LOOP"></a>

**Trigger:** The same tool is called with identical input three consecutive times within a single run or session.

**Default action:** `ask`.

**Behavior:** When triggered, the policy engine pauses execution (or denies in headless mode) and surfaces a warning: "Tool `{name}` called 3× with identical input — possible loop." The user may approve (continue via `once`, `for session`, or `always`), deny this call, or abort the run.

**Configurable:** The repeat threshold (default 3) and the action (`allow`, `ask`, `deny`) are configurable via the `doom_loop` permission key.

### 4.2 `external_directory`

<a id="GUARD-EXTERNAL-DIR"></a>

**Trigger:** A tool invocation references a path outside the project's working roots.

**Default action:** `ask`.

**Behavior:** The policy engine checks the path against the external directory allowlist (§3.3). If the path matches an allowlist entry, the guard is bypassed. Otherwise, the configured action applies.

**Configurable:** The action (`allow`, `ask`, `deny`) and the allowlist are configurable via the `external_directory` permission key and its `allowlist` sub-key.

### 4.3 `external_publish_side_effect`

**Trigger:** A run attempts a remote side effect that changes DockerHub publication state or managed Unraid template-repo remote state.

Covered operations:
- DockerHub repository creation
- DockerHub image push when initiated by an agent/autonomous flow rather than a direct user click
- creation of a managed remote template repository
- remote push of the managed Unraid template repository

**Default action:** `ask`

**Behavior:** This guard is **non-bypassable**. `yolo` mode, scope-bound approval reuse, and generic prior allows MUST NOT suppress it. A direct user click approves only the exact remote side effect named by that clicked control. If one UI flow chains multiple remote side effects, Puppet Master MUST present a separate approval step for each remote side effect in execution order.

**Failure presentation:** When blocked or rejected, the runtime MUST surface an error object that identifies the blocked remote step, the guard name, and the exact recovery actions available from the current surface. Docker Manager and orchestrator surfaces MUST show the blocking reason inline; autonomous/chat-driven flows MUST also surface the block in chat/evidence output.

---

## 5. Tool permission keys


This section defines the canonical contract for tool permission keys.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget

Core rules:
- This section owns tool permission-key taxonomy and preset vocabulary.
- Approval-card summaries and session-approval behavior are owned by `## 6. Ask flow semantics`.
- The durable approval path owns permanent permission reuse. A `for session` grant expires with the session/run context, while an `always` grant is the only approval shape that can be reused permanently and must remain inspectable through the permission/audit surfaces.

Labels and values:
- tool permission keys

Permission rules:
- deny
- once
- for session
- always
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- summary-template and session-approval details are defined in `## 6. Ask flow semantics`

## 6. Ask flow semantics

This section defines the canonical contract for this surface.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget

Core rules:
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- Plan-mode permission behavior removes web tools from any blanket deny: read-only web tools remain ask-gated and are not `blanket-denied` as a family.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools independently visible and ask-gated in plan presets, allow strict read_only/no-network presets to deny them, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Permission preset resolution is mode-dependent across skill, lsp, question, TODO, and web tools: Plan mode may allow information-gathering rows while denying state mutation, and read_only/no-network presets may still deny networked web rows explicitly.
- Preset breadth includes skill plus `/lsp/question/todo/web` carry-through; concrete permission keys remain `skill`, `lsp`, `question`, `todowrite`, `todoread`, and the six web operation keys.

### 6.1 Approval UX, recovery, and audit visibility

The existing low-level permission engine remains the base contract, while approval UI MUST preserve the four-step user choice set: `deny`, `once`, `for session`, and `always`. `once` approves only the current invocation; `for session` creates an ephemeral session-cache allow under the current `approval_scope_key`; `always` is the durable approval path for permanent permission-rule reuse, implemented as a revocable project rule or global rule through canonical permissions storage. When `always` is selected, the UI shows the suggested pattern derived from invocation context, lets the user choose Project or Global when both scopes are valid, and never implements durable approval through ad-hoc FileSafe allowlists or one-off UI side effects.

Blocked-action recovery MUST be direct rather than a passive error string for permission policy, FileSafe, unavailable MCP, unavailable providers or services, and headless ask denial. The blocked payload carries `blocked_reason_code` plus ordered `allowed_action_ids[]`; UI surfaces render only those canonical actions, mapping permission blocks to approval or permission settings, FileSafe blocks to approval or FileSafe settings, unavailable MCP to integration authentication or configuration surfaces, unavailable providers to switch provider or `/model` or open Authentication or `/Health`, and headless ask denial to a message that interactive approval was unavailable plus the user action that can resume execution.

Permission prompts, denials, approvals, and blocked outcomes MUST write the same operational evidence to the audit stream and expose it in two complementary user-facing places: concise, collapsible in-thread transparency and a dedicated log/audit inspector for richer search, filtering, drill-down, and on-demand payload reads. Chat transparency must not be the only place to inspect operational history, and the dedicated inspector must not replace lightweight thread transparency.

`question`, `todowrite`, `todoread`, and user-facing `task` behavior stays in the tool and child-run owner contracts. The permission layer owns their allow/ask/deny posture, inherited ceilings, blocked/unavailable payloads, and audit visibility; it does not redefine their schemas locally. `todo-tool` availability for delegated task/subagent defaults resolves through the `todowrite` and `todoread` permission posture.

Fields:
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"
- single confirmation prompt showing all unique domains in the batch
- For Session grants all listed domains for that session

Rules:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- `urls: string[]` (required; min 1, max 50)
- `concurrency?: number` (default 3; max 10
- `continue_on_error?: boolean` (default true
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

ContractRef: Plans/human-in-the-loop.md#Shared approval-ladder alignment (2026-04-04)

Required fields:
- approval_scope_key
- blocked_sequence
- execution_entity_id
- lane_id
- package_id
- account_id

Canonical terms and values:
- approval_scope_key
- blocked_sequence

Labels:
- Deny
- Once
- For session
- Always

Behavioral rules:
- Approval scope must not silently become same-session if lanes are parallel.
- Chat blocked action buttons derive from ordered `allowed_action_ids[]`.
- Session-wide approval policy must remain distinct from blocked-episode approval.
- Permission-blocked recovery surfaces expose `deny`, `approve_once`, `approve_for_session`, `approve_always`, and `open_permissions` as applicable, corresponding to approve once/for session/always/open permissions in user-facing copy.
- FileSafe-blocked recovery surfaces expose `approve_once`, `filesafe_add_rule`, and `open_filesafe_settings` as applicable, corresponding to approve once/add rule/open FileSafe settings in user-facing copy.

Permission carry-through:
- lane/package/account scope
- `approval_scope_key`
- ordered `allowed_action_ids[]`
## 7. Deterministic defaults

This section defines the canonical contract for this surface.

Plan mode and the Read-only preset are distinct permission concepts. Plan mode must not be treated as `deny-all-except-read`; it may allow information-gathering tools such as read/search/question/web operations and external-read web work while still denying project mutation. Read-only remains the narrower preset when the desired outcome is inspection without network or mutation authority.

Read-only may explicitly set `websearch`, `webresearch`, `webfetch`, `webextract`, `webcrawl`, and `webmap` to `deny` for a strict offline/no-network preset. Entering `plan` mode must not auto-deny those web operations as a family, and `read_only` and `plan` must not be treated as synonyms. Permission settings surfaces render the web tool rows individually, and granular editor help includes host/domain pattern examples such as `https://docs.rs/*` and `https://developer.mozilla.org/*`. Session-approval help explains that search/research may use `*` wildcard scope, while extract/crawl/map/read use host-scoped patterns such as `/crawl/map/read` for the approved host. Provider-specific settings explain that API keys are required for Exa, Tavily, and Firecrawl where configured, not needed for DuckDuckGo fallback, and that provider ordering changes fallback behavior.

Automation-first is the baseline permission posture for non-interactive execution. Compatibility defaults such as HTE-by-default, visible-first local runs, `regular`, `/HTE`, and `visual_mode = auto` must not silently prefer visible runs or mandatory approvals when the effective policy supports automation-first execution; mandatory approval flows remain explicit exceptions surfaced through blocked payloads and allowed_action_ids[].

Owner-level gate wording must stay deterministic. Phrases such as `Execution contract (recommended)`, `targeted for future enforcement`, or other non-deterministic gate language are compatibility notes only and do not weaken required owner-doc enforcement once a permission gate owns the rule.

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

## 8. Resolution algorithm

### 8.0 Composition with precedence layers

The resolution algorithm composes the strict layer precedence from §2.4 with the dispatch checks in this section. The flow is:
1. Build the invocation context from the tool name, normalized arguments, target paths/hosts, runtime mode, parent/run ceiling, session state, Persona, project/global/default rules, and capability snapshot.
2. Apply the mode layer from §2.4 as the first permission candidate: `ask` and `plan` clamp mutating tools to `deny`; `yolo` clamps tool permissions to `allow` where provider/runtime policy permits. Later non-bypassable guards and capability checks may still return blocked/denied outcomes, but they do not rewrite the recorded mode-layer decision.
3. Resolve the effective rule for each permission key through §2.4 layer order plus scope specificity, with inherited parent/run ceilings, role-scoped account policy, and session-cache approvals narrowing authority but never widening it.
4. Run non-bypassable guards and capability gates, including full-string banned-command checks, external-directory checks, domain-sensitive remote-side-effect checks, executable trust checks, host/network policy, and capability availability.
5. Persist requested/effective permission evidence, including `requested_permission_state`, `effective_permission_state`, `downgrade_reason`, `approval_scope_key`, `permission_snapshot_id?`, `blocked_reason_code`, and ordered `allowed_action_ids[]` when applicable.
6. If an approved hook mutates arguments or execution context, re-run §2.4 rule resolution and all applicable guards on the modified invocation before dispatch.
7. Dispatch only when the final effective decision is `allow` and all guards pass; `ask`, `deny`, blocked, unavailable, or capability-failed outcomes emit audit evidence and do not call the underlying tool.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### 8.1 Banned-command full-string check

Banned-command evaluation MUST scan the full command string, not just the first token. The scan includes shell metacharacters and substitution forms such as `;`, `&&`, `||`, `|`, `$()`, and backticks.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md

A command that passes a first-token allowlist but contains a banned destructive sequence in its arguments is still denied. First-token-only checking is prohibited.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

### 8.2 Hook re-check and execution-path invariance

Resolution happens before dispatch and again after any arg-touching hook mutation. The dispatch layer MUST NOT call the underlying tool implementation until both checks pass on the final argument set.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md

Required order:
1. Normalize request context and candidate paths.
2. Evaluate `policy.may_execute_tool()` on the original invocation.
3. Run arg-touching hooks, if any.
4. Re-run permission checks on the modified invocation.
5. Dispatch only if the re-check passes.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

### 8.3 Shell environment isolation routing

Environment isolation for shell/session processes is jointly owned by `Plans/orchestrator-subagent-integration.md` and `Plans/Tools.md`. The permission layer consumes that invariant when evaluating agent/crew execution context, but does not define shell lifecycle behavior itself.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Tools.md

Cleanup-sensitive approval and retention checks are permission-visible. If active-run ownership, unresolved blocked recovery, required safe-point restore, unresolved conflict inspection, or newer lineage dependency still exists, the target remains `retained`, `suspect`, or `restoring`, not cleanup_eligible; approval cards must not offer destructive cleanup as if age alone made it safe.

## 9. Persistence and storage

<a id="PERSISTENCE"></a>

Permission configuration is stored at three durable layers plus one ephemeral layer.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#STORAGE-LAYOUT

| Layer | Location | Format | Lifetime |
|-------|----------|--------|----------|
| **Global** | `~/.config/puppet-master/permissions.toml` | TOML | Until user edits/deletes |
| **Project** | `<project_root>/.puppet-master/permissions.toml` | TOML | Until user edits/deletes |
| **Persona** | Named profiles referenced by `default_permissions_profile` in `PERSONA.md` frontmatter; stored alongside global permissions config at `~/.config/puppet-master/permission-profiles/<profile_id>.toml` | TOML | Until user edits/deletes |
| **Session** | In-memory session cache | Runtime | Current session only; cleared on restart |

Durable approvals created through `create_project_rule` or `create_global_rule` are persisted in their owning config layer as metadata-bearing records with the logical fields `{ rule_id, tool_pattern, action, scope_key?, created_at, created_by_thread_id }`. `rule_id` is a stable UUID generated at rule creation and is the canonical revocation/update key; `tool_pattern` is not unique and MUST NOT be used as the durable identity. File-level TOML projections MAY additionally expose these rules in the simpler per-tool tables shown below, but the stored rule identity and audit metadata remain part of the canonical durable record.

### 9.1 TOML format

Permission config files use the following TOML structure:

```toml
# Simple per-tool permissions
[tools]
read = "allow"
edit = "ask"
bash = "ask"
webfetch = "allow"

# Granular rules (object syntax)


[tools.bash]
"*" = "ask"
"git *" = "allow"
"npm *" = "allow"
"rm *" = "deny"

[tools.read]
"*" = "allow"
"*.env" = "deny"
"*.env.*" = "deny"
"*.env.example" = "allow"

# Special guards
[guards]
doom_loop = "ask"
external_directory = "ask"
external_publish_side_effect = "ask"

# External directory allowlist
[guards.external_directory]
allowlist = [
  "~/.cargo/**",
  "/usr/local/include/**",
]

# Doom loop threshold override
[guards.doom_loop]
threshold = 3
```

### 9.2 Config key in redb

The resolved permission set for the active session (merged from all layers) is also persisted to redb as part of `config:v1` under the key `tool_permissions` for compatibility with the existing config schema defined in `Plans/Tools.md` §10.1. The TOML files are the durable source of truth; the redb key is a projection.

ContractRef: ContractName:Plans/Tools.md

---

## 10. GUI requirements
### 10.10 Effective-state disclosure requirements

Permission disclosure must align with the shared requested/effective state model and the shared projection-state vocabulary.

Disclosures must separate:
- inherited / overridden
- requested
- effective
- honored / skipped / clamped
- `projection_freshness`
- `projection_health`

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Rules:
- stale or degraded projections do not become authoritative just because they are visible in the UI
- mutating actions must revalidate or gate when permission-relevant projections are stale, degraded, or unavailable
- blocked/recovery action visibility must use `allowed_action_ids[]` and blocked-episode identity rather than legacy request-era fields

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/FinalGUISpec.md

### 10.10A Debug Automation Profile disclosure

When a Debug Automation Profile is requested or active, the UI must disclose both requested and effective state.

Required disclosure fields are:
- `investigation_id`
- grant origin (`front_door_approval`, `revalidated_after_resume`, or `not_granted`)
- scope summary (project/worktree, target kind, bound runtime identities)
- requested capability groups
- effective capability groups
- degraded or blocked capability groups with explicit reason codes
- expiry / revocation state

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Surface rules:
- the active Debug thread header shows whether the profile is active, degraded, or blocked
- detailed inspectors and the Permissions surface show requested/effective capability groups and the layer that clamped or denied them
- recovery banners must disclose when a resumed investigation lost prior grants and now requires revalidation
- high-risk actions that remain outside the profile must continue to surface explicit confirmation UI instead of being described as silently covered by the profile

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md

### 10.10B Debug profile target binding and reason codes

The Debug Automation Profile is run-scoped. It is not a new global `/static` permission profile family and must not be appended to the existing global, project, Persona, or default profile layers as durable static policy. Permission disclosure records whether the active run received the profile through front-door approval, resume revalidation, or no grant, and the profile expires with the investigation/run scope unless a separate durable permission rule is explicitly approved.

Debug Investigation Context headers include `stop_reason_code`, `attention_required_reason_code`, `blocked_reason_code`, and `budget_kind` whenever the relevant state exists. Target binding is deterministic: PM auto-selects exactly one highest-precedence target when a single winner exists, reuses the thread-linked target when that is the deterministic tie-breaker, or enters `attention_required` with `attention_required_reason_code = target_selection_required` when multiple same-tier candidates remain. PM must not guess a target under the Debug Automation Profile. Automated debug resolution requires `verification_strength=strong`; weaker or missing verification remains `attention_required`, `failed`, or `failed_cleanup` according to the investigation state.

Implementation-era numeric defaults may be tuned during `/prototyping`, but optional future enhancements remain non-blocking follow-ons unless promoted through the normal planning process. For remote MVP coverage, any Debug profile section that touches dev sessions, terminal `/output` surfaces, tool permissions, or remote execution must show requested/effective capability differences rather than implying broad remote authority.

### 10.1 Dedicated Permissions tab

A **Permissions** tab in Settings MUST provide the following sections as collapsible cards.

### 10.2 Global defaults + per-tool overrides

A two-section layout:

1. **Global wildcard default:** A single dropdown (`Allow` | `Ask` | `Deny`) that sets the fallback action for any tool without an explicit rule. Default: `Ask`.
2. **Per-tool overrides:** A table listing all known tools (built-in canonical names from §5 + MCP-discovered tools). Each row: tool name, category badge, permission dropdown (`Allow` | `Ask` | `Deny`), and an expand chevron for granular rules.

Override display is inline, not modal-only. Each effective permission row shows `Inherited`, `Overridden`, and `Effective` state with `/inheritance/fallback` provenance so users can understand resolution without opening a separate explanation dialog.

### 10.3 Granular rule editor

When a tool row is expanded (§10.2), the granular rule editor appears:

- An ordered list of `{pattern, action}` entries.
- "Add rule" button appends a new row with empty pattern and `Ask` default.
- Drag handles for reordering (last-match-wins, so order matters).
- Delete button per row.
- Pattern input supports wildcard syntax (§3.1); inline help tooltip shows `*` and `?` semantics.

### 10.4 Presets

This section defines the canonical contract for this surface.

Core rules:
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools independently visible and ask-gated in plan presets, allow strict read_only/no-network presets to deny them, and carry the blocked/unavailable payload fields through to permission-card consumers.

Permission rules:
- deny
- once
- for session
- always
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- Read-only preset reconciliation: allow `read` plus `/grep/glob/list/codesearch/chatsearch/logsearch/skill/lsp(ro)`, where `lsp(ro)` means read-only LSP operations only, plus `/question/todoread/todowrite/capabilities.get`; ask `webfetch` plus `/websearch/logread/task`; deny `edit` plus `/bash/repo.import/media.generate`.
- Full preset reconciliation: allow the read/search/skill/lsp/question/todo family; ask `edit`, `bash`, `repo.import`, `media.generate`, `webfetch`, `websearch`, `logread`, and `task`. Preset tables and mode-override text must agree so plan-mode wording does not imply blanket denial of tools expected during planning/research.
### 10.5 External directory allowlist manager

A dedicated card for managing the external directory allowlist (§3.3):

- Scrollable list of allowlisted paths with wildcard support.
- "Add path" button with a text input + optional native directory picker.
- Per-row delete button.
- Home expansion display: show the resolved path next to `~` patterns.

### 10.6 `doom_loop` policy display/config

A card showing:

- Current action (`allow` | `ask` | `deny`) with dropdown to change.
- Repeat threshold (spinner, default 3, range 2–10).
- Explanation text: "Triggers when the same tool is called with identical input N consecutive times."

### 10.7 Per-Persona override editor

A card for managing Persona-specific permission profiles:

- List of named permission profiles (from `~/.config/puppet-master/permission-profiles/`).
- "Create profile" button opens a permission editor (same layout as §10.2 + §10.3) scoped to the new profile.
- Each profile row shows: profile name, tool count with overrides, edit/delete buttons.
- When editing a Persona in the Personas management card (`Plans/Personas.md` §4), the `default_permissions_profile` dropdown is populated from this profile list.

### 10.8 Scope selector

A toggle or tab strip at the top of the Permissions tab:

- **Global** — edits `~/.config/puppet-master/permissions.toml`.
- **Project** (visible when a project is active) — edits `<project_root>/.puppet-master/permissions.toml`.
- **Package** (visible when a package context is active) — edits package-scoped rules nested under the active project's permission configuration; inherits from Project until overridden.
- **Seam** (visible when a seam context is active) — edits seam-boundary rules nested under the active project's permission configuration.
- **Lane** (visible when a lane context is active) — edits lane-scoped rules nested under the active project's permission configuration.

When no active-project context exists, durable `always` approval scope selection MUST offer only **Global**. The **Project** option is hidden/disabled and carries `/disabled` when a reason-code token is needed, preventing orphaned project-scoped rules with no project binding.

Changes are saved to the selected scope's file. The effective (merged) permissions are displayed with layer-of-origin badges when in "Global" scope and a project is active.

The Settings GUI, command-palette, API/CLI, and automation surfaces all mutate permission rules through the same canonical permission commands and storage records. GUI-only affordances must not become the sole management path for durable approval creation, revocation, or inspection.

### 10.9 ELI5/Expert copy

Permissions UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0.

- **ELI5:** Simplified view showing only per-tool dropdowns and presets. Granular rules, profile editor, and allowlist manager are hidden.
- **Expert:** Full view with all sections visible.

Tooltip keys: `tooltip.permissions.*` prefix.

## 10A. Security model

### 10A.1 Trust boundaries and threat model

The permissions system spans four explicit trust boundaries:

1. user intent and explicit approval surfaces
2. Puppet Master runtime policy, projection, and audit machinery
3. tool execution backends
4. external services reached by tools

Threat model summary:
- **Prompt injection:** model output or external content attempts to smuggle tool names, arguments, or approval intents that the runtime did not independently authorize.
- **Privilege escalation:** the model or a child run requests broader permissions than its current ceiling, scope, or durable grants allow.
- **Data exfiltration:** tools attempt to send project/user data to unauthorized files, hosts, domains, or remote services.

### 10A.2 Capability gates and sandbox boundaries

Permissions are necessary but not sufficient. A tool is executable only when it is both capability-registered and permission-allowed; unregistered tools remain non-runnable even if a rule says `allow`.

Sandbox/capability boundary rules:
- `bash` executes in the user's environment and is not sandboxed beyond normal OS-level user permissions.
- file-oriented tools are scoped to the active project root and configured working roots unless explicit policy broadens that access.
- web-oriented tools must respect configured domain allowlists and web-operation scope keys in addition to normal permission decisions.

### 10A.3 Audit trail

Every permission outcome that matters operationally — grant, deny, or prompt — MUST be written to seglog. The audit record MUST include at least `tool_pattern`, `decision`, `scope`, and `requesting_context`, enabling later review of durable-rule creation, inherited narrowing, and denied/externalized execution attempts.

---

## 11. OpenCode baseline and Puppet Master deltas

External OpenCode behavior is reference-only. Puppet Master permission canon is defined here.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md

### 11.1 Baseline status

External examples may inform terminology, but design-evidence from outside PM does not override PM-native terminology, PM's approval ladder, preset matrix, or batch permission behavior.

### 11.2 Puppet Master deltas

- PM uses `deny | once | for session | always`
- PM keeps read-only and plan web operations at `ask`
- batch web approvals list all unique domains in scope and treat `For Session` as a grant for those domains for the session

### 11.3 Acceptance alignment

<a id="AC-PM07"></a>
**AC-PM07:** The `deny` response rejects the current blocked episode and may reject other pending asks only when their `approval_scope_key` exactly matches.

---

## 12. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-PM01"></a>
**AC-PM01:** The resolution algorithm (§8) MUST be deterministic: given identical inputs (tool name, invocation context, config, mode, session state), the result MUST always be the same.

<a id="AC-PM02"></a>
**AC-PM02:** Precedence layer ordering (§2.4) MUST be respected. A Persona override MUST take priority over project-level rules, which MUST take priority over global-level rules.

<a id="AC-PM03"></a>
**AC-PM03:** Within a single ruleset, last-match-wins ordering (§3.1) MUST be applied. A rule appearing later in the list MUST override an earlier matching rule.

<a id="AC-PM04"></a>
**AC-PM04:** The `doom_loop` guard (§4.1) MUST trigger when the same tool is called with identical input 3 consecutive times (configurable threshold). The default action MUST be `ask`.

<a id="AC-PM05"></a>
**AC-PM05:** The `external_directory` guard (§4.2) MUST trigger for paths outside the project's working roots. Paths on the allowlist (§3.3) MUST bypass the guard.

<a id="AC-PM06"></a>
**AC-PM06:** The `always` response (§6.2) MUST bind approval to the canonical blocked episode and MAY reuse it only through an exact `approval_scope_key` match or explicit durable project/global rule creation. It MUST NOT create a blind session-wide allow.

<a id="AC-PM08"></a>
**AC-PM08:** Default `.env` deny rules (§7.1) MUST deny reading `.env` and `.env.*` files while allowing `.env.example`.

<a id="AC-PM09"></a>
**AC-PM09:** The GUI Permissions tab (§10) MUST display all tool permission keys from §5, support granular rule editing (§10.3), and persist changes to the selected scope's config file (§10.8).

<a id="AC-PM10"></a>
**AC-PM10:** In `yolo` mode, all tools MUST resolve to `allow` (§8 step 1). In `ask`/`plan` modes, all mutating tools MUST resolve to `deny` (§8 step 1).

<a id="AC-PM11"></a>
**AC-PM11:** `create_project_rule` and `create_global_rule` (§6.4A) MUST persist durable approval records with `{ tool_pattern, action, scope_key?, created_at, created_by_thread_id }`, survive restart, and be revocable from Settings → Permissions or `cmd.permissions.revoke`.

<a id="AC-PM12"></a>
**AC-PM12:** Web-operation permission keys (§3.4A) MUST derive `webextract:{domain}`, `webresearch:{query_category}`, `webcrawl:{domain}`, and `webmap:{domain}` from canonical normalized inputs, using registrable-domain normalization for URL-derived keys.

<a id="AC-PM13"></a>
**AC-PM13:** Scope specificity (§2.4B) MUST resolve `lane` over `seam`, `seam` over `package`, `package` over `project`, and `project` over `global`; package scope MUST inherit from project unless explicitly overridden.

<a id="AC-PM14"></a>
**AC-PM14:** Context creation MUST run the seven-step narrowing flow in §8.0, and per-invocation dispatch MUST still execute the real-time precedence evaluation in §2.4 for each tool call within that context.

<a id="AC-PM15"></a>
**AC-PM15:** Permission execution MUST be capability-gated as well as permission-gated, and seglog audit entries (§10A.3) MUST record each grant, deny, and prompt decision with `tool_pattern`, `decision`, `scope`, and `requesting_context`.

---

*Document created for planning only; no code changes.*
## 12A. DockerHub / Unraid remote-side-effect guard addendum

This addendum extends §§4, 5, and 7 for DockerHub publication and managed Unraid template-repo flows.

### 12A.1 `external_publish_side_effect`

`external_publish_side_effect` is a special guard for remote side effects that change publication visibility, remote repository state, or remote distribution state.

Covered operations include:

- DockerHub repository creation
- DockerHub image push when initiated by an agent/autonomous flow rather than a direct user click
- creation of a managed remote template repo
- remote push of the managed Unraid template repo

### 12A.2 Behavior

- `push_policy = after_build` does not satisfy the “exact remote side effect requested” rule by itself. A Build click remains approval for local build only; the later auto-dispatched image push still requires `external_publish_side_effect` evaluation at the time it is about to run.
- The same rule applies to follow-on managed template-repo creation and push steps: they are never implicitly approved by earlier local-only actions or by the existence of enabled defaults.

- Default action: `ask`
- This guard is **non-bypassable**
- `yolo` mode MUST NOT auto-allow this guard
- Session-scoped `always` approvals MUST NOT suppress this guard globally
- A direct user click on the exact publish/create/push button counts as approval for **that one requested side effect only**
- Follow-on side effects still require their own approval when they were not part of the same direct user action

Example:
- Clicking **Push image** may approve the image push itself
- It does **not** auto-approve creating a missing DockerHub repo if the repo does not already exist
- It does **not** auto-approve pushing the managed Unraid template repo unless that was the exact user action requested

### 12A.3 Failure behavior

When the guard is rejected:

- local build results remain intact
- local template generation/editing remains intact
- remote side effects do not execute
- the agent/runtime MUST surface a corrected error describing which remote step was blocked

### 12A.4 Canonical key/default additions

Add the following entry to the §5 tool/special-guard key list:

| Key | Category | Scope | Notes |
|---|---|---|---|
| `external_publish_side_effect` | Guard | Remote publication and remote repo mutation | Non-bypassable ask for DockerHub/Unraid remote side effects |

Add the following entry to the §7 defaults table:

| Key | Default | Rationale |
|---|---|---|
| `external_publish_side_effect` | `ask` | Remote publication and repo creation can change privacy/distribution state and require explicit approval |

## Runtime blocked-Outcome Integration Addendum (2026-03-08)

### 1. Policy-denied outcomes are blocked outcomes

When the permission layer prevents execution, the runtime must treat the result as blocked/denied rather than generic failure.

This includes:
- deny rules
- user rejection of `ask`
- headless `ask -> deny`
- `external_publish_side_effect` blocks

### 2. Recovery-option payloads

Permission outcomes that surface to runtime/UI must include canonical blocked-state actions and family identity.

Minimum fields:
- `blocked_family` (`blocked_policy` | `blocked_approval` | `blocked_preflight` | `blocked_governance`)
- `blocked_reason_code`
- `guard_name?`
- `allowed_action_ids[]`
- `approval_scope_key?`
- `approval_target_ref?`
- `permission_snapshot_id?`
- `runtime_identity_context?`
- `revalidation_required?`
- `executed: false`

Rules:
- `allowed_action_ids[]` is canonical; prose-only recovery hints are non-conforming
- Runtime payload field names are closed: legacy `recovery_options[]` and `allowed_actions[]` are compatibility aliases only and MUST NOT replace `allowed_action_ids[]` in new blocked or recovery payloads.
- approval surfaces in chat/dialogs/cards must summarize the exact target, scope, and drift boundary for the request
- UI labels may vary, but the exposed actions must map to the canonical semantics: one-shot approval, reusable scope/session approval when policy allows, and deny/decline
- `blocked_preflight` is used for stale target, undeclared host, drift, or capability/preflight failures discovered before dispatch; these outcomes do not masquerade as `failure_class`
- payload consumers must render blocked family + action ids without inventing local enum families or alias field names
- Domain-sensitive operational sessions use permission classes instead of one generic run-command approval. Read-only inspection, interactive shell `/exec`, and network tunnel exposure are separate classes for `docker exec`, `docker attach`, `kubectl exec`, and `kubectl port-forward`; approvals for one class do not imply approval for another.
- Tool permission and domain approval are separate: generic tool allow, `/session/YOLO`, or headless defaults never approve domain-sensitive Git push/force-push/prune/destructive discard (`/force-push/prune/destructive`), workflow `/cancel/rerun/admin` CRUD, image push/repo create/template push, or Kubernetes `/delete/exec/port-forward` operations. Protection-rule changes, `/namespace/workload` mutations, SCM destructive actions, `docker exec`, `docker attach`, `kubectl exec`, and `kubectl port-forward` require their own domain approval class.
- `/queued` and background approval requests bind to the exact queued attempt, target, guard, and preflight snapshot. Approval may pause one node, block the whole run, or block only a follow-on step according to the blocked payload, but resumption always re-runs preflight when the target, policy, or permission snapshot may have changed.
- Policy-denied, approval-missing, and preflight-failed outcomes remain distinct: `blocked_policy`, `blocked_approval`, and `blocked_preflight` choose different copy, recovery actions, and retry paths instead of collapsing into a generic blocked reason.
- Mutating actions use a per-target in-flight operation key for `/dedupe` across the main window, detached windows, Dashboard, and Orchestrator shortcuts. Identical operations coalesce, while conflicting operations surface `operation_in_progress` with the owning target/action context.
- Every mutating action revalidates stable target identity immediately before execution, including stale table rows, stale cards, and stale `/selections`. If the selected target has materially changed, the action aborts with `state_changed_refresh_required` and requires refresh or reselection.
- Remote-side-effect transports may end as `indeterminate_remote_outcome` when the server-side action might have succeeded but the client lost confirmation. The receipt preserves `requested`, `transport_lost`, and later `reconciled` states, and the UI exposes a `Refresh remote state` recovery CTA rather than labeling the action simply failed.

Policy-field defaults and closed enums:

| Field | Default | Allowed values |
| --- | --- | --- |
| `network_access_policy` | `ask` | `deny`, `ask`, `allow_project_declared`, `allow_session`, `allow_all` |
| `secret_access_policy` | `ask` | `deny`, `ask`, `allow_named_secret`, `allow_session_named_secret` |
| `destructive_command_policy` | `ask` | `deny`, `ask`, `allow_once`, `allow_session_for_target` |
| `filesystem_write_policy` | `ask_project` | `deny`, `ask_project`, `allow_project`, `allow_declared_paths` |
| `database_test_data_policy` | `deny_real` | `deny_real`, `ask_sandbox`, `allow_sandbox` |

Recovery reason-code minima: `blocked_policy`, `blocked_approval`, `blocked_preflight`, `state_changed_refresh_required`, `operation_in_progress`, `indeterminate_remote_outcome`, `budget_exhausted`, and `permission_snapshot_stale`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

A permission snapshot captures the resolved permission state at attempt start for auditability, immutability, and replay-safe approval logic.

After any approval, policy, mode, or project change, a retry creates a new permission snapshot; the prior snapshot stays frozen for historical audit and never mutates in place.

**Schema:**
```json
{
  "snapshot_id": "uuid",
  "attempt_id": "uuid",
  "node_id": "uuid",
  "captured_at": "ISO-8601 timestamp",
  "approval_scope_key": "string?",
  "approval_target_ref": "string?",
  "requested_account_binding": "string?",
  "effective_account_binding": "string?",
  "account_switch_event_ref": "string?",
  "permission_decision_context": {
    "decision_context_ref": "string?",
    "mode_override": "string?",
    "preflight_snapshot_ref": "string?",
    "policy_source_ref": "string?"
  },
  "actor_surface_context": {
    "actor_kind": "assistant | interviewer | builder | orchestrator | subagent | user | system",
    "execution_role": "string?",
    "surface_id": "string?",
    "surface_route": "string?",
    "project_id": "string?",
    "thread_id": "string?",
    "run_id": "string?"
  },
  "runtime_identity_context": {
    "requested_platform": "string",
    "effective_platform": "string",
    "provider_family_id": "string?",
    "requested_runtime_identity": "string?",
    "effective_runtime_identity": "string?",
    "host_ref": "string?",
    "transport_host_ref": "string?",
    "upstream_provider_ref": "string?",
    "repo_id": "string?",
    "worktree_id": "string?"
  },
  "resolved_permissions": {
    "<permission_key>": {
      "requested_permission_state": "allow | deny | ask | unset",
      "effective_permission_state": "allow | deny | ask",
      "downgrade_reason": "string?",
      "resolution": "allow | deny | ask",
      "source": "preset | project | user_override | session",
      "effective_value": true
    }
  }
}
```

`stop_reason_code` values consumed by permission-adjacent blocked receipts are `user_stopped`, `policy_denied`, `budget_exhausted`, `safe_point_required`, `permission_snapshot_stale`, and `indeterminate_remote_outcome`. `blocked_reason_code` values are `approval_required`, `policy_denied`, `preflight_failed`, `state_changed`, `domain_sensitive_action`, `secret_required`, `network_forbidden`, `external_side_effect`, and `operation_in_progress`. `budget_kind` values are `turns`, `tokens`, `wall_time_seconds`, `parallel_agents`, and `cost`.

**Rules:**
1. The snapshot is created before `attempt.started` becomes durable; when a run has no narrower attempt record yet, the effective permission snapshot is frozen before run start becomes durable.
2. The snapshot is immutable after creation; later approval, policy, mode, project, account, target, or runtime-identity changes create a new snapshot and a new attempt/run lineage entry before retry or resume.
3. Approval reuse is valid only while `approval_scope_key`, `approval_target_ref`, and the relevant runtime identity context still match. Drift invalidates the prior approval instead of silently reusing it.
4. Historical run, attempt, chat, and audit views show the frozen permission snapshot that governed that execution; current Settings state must not be presented as historical effective permission state.
5. Requested and effective permission states are both preserved per permission key. `requested_permission_state` records the state before clamping by mode, role, account, FileSafe, headless posture, or runtime capability; `effective_permission_state` records the state actually enforced. When the effective state is narrower than requested, `downgrade_reason` records the canonical reason code or policy source that caused the clamp.
6. `actor_surface_context` identifies the actor and surface that requested the snapshot so approval, blocked, and audit surfaces can distinguish Assistant, Interviewer, builder, Orchestrator, subagent, user, and system requests without inferring that context from prose.
7. `permission_decision_context` records the target, mode, preflight, and policy context used to make the permission decision; consumers may index those refs but must not collapse them into the runtime identity block.
8. `transport_host_ref` names the host or transport boundary that carried the operation, while `upstream_provider_ref` names the provider or adapter whose policy/account state influenced execution. They may match for local providers but remain separate when a bridge, proxy, tunnel, or hosted provider is involved.
9. `Plans/storage-plan.md` owns the durable key family and joins for this record, but this document owns the payload schema, enum sets (`/enums`), and interpretation rules.
10. Chat, provider, and storage surfaces may reference these fields, but they MUST NOT redefine the nested snapshot schema locally.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor

Required fields:
- blocked_sequence
- execution_entity_id
- lane_id
- package_id
- account_id
- allowed_action_ids

Canonical terms and values:
- blocked_sequence
- execution_entity_id
- lane_id
- package_id
- account_id
- allowed_action_ids

Behavioral rules:
- Permission snapshots must preserve blocked-episode identity and scoped approval dimensions together.

Permission carry-through:
- lane/package/account scope
- ordered `allowed_action_ids[]`
### External side-effect wakeup chain

When HITL approval resolves an `external_side_effect_blocked` state:

1. The approval handler MUST emit a `prerequisite_resolved` event with `wake_reason: approval_resolved` and the `node_id` / `attempt_id` of the blocked node.
2. The event bus delivers this to the scheduler.
3. The scheduler runs a wakeup pass and transitions the node from blocked to runnable.

This is an immediate event-driven wakeup, not polling-based.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### Target-bound domain approvals and preflight revalidation

Domain approval and preflight decisions close the historical blind-spot where an action name was approved without the exact mutable target. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, optional `workflow_id`, `run_id`, and `/environment`; Docker approvals carry `runtime`, `registry_host`, `namespace`, `/repository`, and optional `image_ref`; Kubernetes approvals carry `kube_context`, `namespace`, optional `workload_ref`, and optional `resource_ref`. Permission evaluation runs static policy, cheap capability or `/precondition` preflight, approval request only while still actionable, and full execution-time `/revalidate` immediately before mutation. Each approval records a `preflight_revision`; any stale-preflight evidence or changed target identity invalidates reuse and returns the action to blocked state.

## Source Control, GitHub Actions, and Docker Manager Permission Addendum (2026-03-12)


External-side-effect and admin-gated behavior for this packet uses canonical permission and blocked-state rules.

Required mappings:
- GitHub Actions rerun/cancel/dispatch and admin CRUD operations may require explicit capability and may surface blocked outcomes when approval or auth prerequisites are missing
- Docker Hub repository creation, image push, managed template-repo create/push, and Kubernetes mutating actions use the external-side-effect guard model when they produce hosted or remote side effects
- requested vs effective capability disclosure must remain visible whenever a surface control is disabled by partial auth or policy state

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md

### Provider exposure, remote-side-effect provenance, and privileged sessions

Provider/LLM exposure rules apply before any diff, conflict hunk, workflow log, container log, manifest snippet, inspect output, workflow YAML preview, manifest diff, discovered URL, or screenshot is sent to provider-backed features. Such exposure requires explicit permission, `/data-class` labeling, per-feature opt-in, local-only fallback, and `secret-scrub` before provider transmission. Secret scrubbing only before local persistence is insufficient for `LLM` or other provider features.

Review, diff, export, `/evidence/history`, and provider features distinguish ephemeral in-memory view, scrubbed persisted blob, and user-exported file. Anything persisted, indexed, screenshotted through `/screenshots`, exported, or included in evidence/history records the redaction profile, whether mandatory scrub ran, and whether display may hide details.

Remote-side-effect receipts include `approval_source`, `executing_subsystem`, and effective account / credential handle. `approval_source` values include `explicit confirm`, `cached permission`, `policy auto-allow`, and `browser fallback`. `executing_subsystem` values include `git`, `GitHub API`, `docker CLI`, `kubectl`, and `SSH remote`. This applies to push, dispatch, admin changes, publish, repo creation, apply, rollout, and equivalent remote-side-effect actions.

Sensitive metadata minimization covers remote URLs, private repo names, registry namespaces, Docker Hub account identity, kube context names, namespace/workload names, discovered service URLs, port-forward endpoints, screenshots, and downloaded scrubbed artifacts. Exports and screenshots mask sensitive metadata by default unless the user explicitly chooses a fuller export profile.

`/logout/project-delete`, unlink, and project-delete cleanup clear or invalidate non-secret residue that can still identify the user or project: validation snapshots, last-used account identity, workflow admin receipts, registry capability snapshots, kube context selections, discovered endpoints, and downloaded scrubbed artifacts.

Session-style privileged operations include `docker exec/attach`, `kubectl exec`, `kubectl port-forward`, remote SCM-over-SSH mutation sessions, and browser/device auth handoffs. Persist bounded metadata only: actor, target, started/ended timestamps, credential realm, transport, local bind address/port when relevant, and requested vs effective state. Do not persist interactive transcript or `stdin` by default.

Build/deploy secret-handling uses no-persist/no-echo rules for docker build secrets, build args, compose env files, registry auth helpers, kube Secret manifests, and generated deployment YAML containing sensitive values. Secret resources are never rendered back in full, indexed, or included in receipts/evidence beyond kind/name/namespace and redacted status. ConfigMap rendering follows a separate configurable redaction policy because it may contain sensitive plaintext.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Permissions_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PS-002 - Permission SSOT Authority And Compatibility Header

```yaml
plan_unit_id: PS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Plans/Permissions_System.md owns the canonical permission system SSOT, owner-section live specification framing, compatibility-only source vocabulary handling, and the requirement that other docs reference permission anchors rather than restating action definitions, precedence, granular syntax, or defaults."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "PS-002 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_ssot_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0004
preserved_exact_tokens:
- "Permissions System (Canonical SSOT)"
- "Canonical owner-section requirements"
- "Requested/effective account identity contract"
- "Compatibility-only source vocabulary is noncanonical"
- "single canonical source of truth"
- "Plans/Permissions_System.md#PERM-ACTIONS"
- "Puppet Master"
negative_constraints:
- "Other plan documents must reference permission anchors rather than restating permission action definitions, precedence rules, granular syntax, or default tables."
preserved_contractrefs:
- "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
compatibility_only_notes:
- "Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/DRY_Rules.md"
- "Plans/Contracts_V0.md"
- "Plans/Decision_Policy.md"
```

### PS-003 - Permission SSOT Reference Catalog

```yaml
plan_unit_id: PS-003
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions SSOT reference catalog preserves the governing references for Spec Lock, Contracts, DRY, Glossary, Decision Policy, Tools, FileSafe, Run Modes, Personas, OpenCode baseline permissions, GUI specification, and CLI-bridged providers."
gui_related: true
gui_classification_reason: "This unit is GUI-related only because the reference catalog preserves the GUI specification reference; it does not itself define a GUI implementation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-003 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_reference_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0005
preserved_exact_tokens:
- "SSOT references (DRY)"
- "Plans/Spec_Lock.json"
- "Plans/Contracts_V0.md"
- "Plans/DRY_Rules.md"
- "Plans/Glossary.md"
- "Plans/Decision_Policy.md"
- "Plans/auto_decisions.jsonl"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
- "Plans/Run_Modes.md"
- "Plans/Personas.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/FinalGUISpec.md"
- "Plans/CLI_Bridged_Providers.md"
negative_constraints:
- "The reference catalog must not be read as permission behavior that supersedes the owner sections."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
```

### PS-004 - Requested Account Binding And Approval Scope Data Shape

```yaml
plan_unit_id: PS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission data shape requires requested_account_id beside requested_account_policy, requested_account_binding, subordinate provider_account_id metadata, provider-native OpenCode session IDs instead of canonical thread_id, and approval_scope_key across actor, lane, run, and account context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-004 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_account_identity_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0008
preserved_exact_tokens:
- "Canonical data-shape reconciliation"
- "Required data shape"
- "Acceptance carry-through"
- "requested_account_id"
- "requested_account_policy"
- "requested_account_binding"
- "provider_account_id"
- "thread_id"
- "approval_scope_key"
- "HITL"
- "doom-loop"
negative_constraints:
- "provider_account_id is subordinate provider-native metadata, not canonical account identity."
- "OpenCode session IDs must move to provider-native correlation fields instead of canonical thread_id."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
- "Plans/CLI_Bridged_Providers.md"
```

### PS-005 - Actor Lane Approval Scope Key Boundary

```yaml
plan_unit_id: PS-005
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval scope is actor/lane-aware across actor, run, lane, account, package/seam context, shared runtime identity, HITL, and blocked-overlay flow; session-centric and tier-boundary approval language is compatibility-only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-004
unblocks: []
acceptance_criteria:
- "PS-005 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_scope_key_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "P5 permission authority recovery"
- "/actor/lane"
- "/account"
- "/lane/run/account"
- "shared-runtime"
- "actor"
- "lane"
- "run"
- "account"
- "package/seam"
- "ask -> deny unless HITL at current tier boundary"
negative_constraints:
- "The permission layer must not mix tier-boundary governance with tool-level HITL approval semantics."
preserved_contractrefs: []
compatibility_only_notes:
- "Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries."
stale_retired_dispositions:
- "ask -> deny unless HITL at current tier boundary is deprecated tier-era behavior."
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-006 - Execution Entity Approval Snapshot And Carryover

```yaml
plan_unit_id: PS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission resolution, approval carryover, and approval cascade are execution-entity scoped, with lane, package, lane/account, effective-account, and effective account identity facts preserved in approval snapshots and blocked-card explanations."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-006 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: execution_entity_approval_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "execution-entity scoped"
- "Lane"
- "package"
- "/lane/account"
- "effective-account"
- "/identity"
- "approval snapshot"
- "/cascade"
- "reject-cascade"
negative_constraints:
- "Approval carryover must not silently become same-session when lanes are parallel."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-007 - Runtime Artifact Drill Through And Permission State Hooks

```yaml
plan_unit_id: PS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Runtime artifact permission drill-through preserves runtime artifact ownership and hook vocabulary so permission cards and blocked-state records share blocked_reason_code, allowed_action_ids, failure_class, permission_snapshot_id, and provider_attempt_ref."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-005
- PS-006
unblocks: []
acceptance_criteria:
- "PS-007 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: runtime_artifact_permission_drillthrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Plans/Runtime_Artifacts_Panel.md"
- "/Runtime_Artifacts_Panel.md"
- "/schema-family"
- "attempt-key"
- "envelope family"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "failure_class"
- "permission_snapshot_id"
- "provider_attempt_ref"
negative_constraints:
- "Permission cards and blocked-state records must not fork the hook vocabulary."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Runtime_Artifacts_Panel.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
```

### PS-008 - Blocked Action Identity And Cross Owner Policy Routing

```yaml
plan_unit_id: PS-008
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Blocked-state approval actions map from canonical allowed_action_ids while graph approval actions target request_id; worktree and decision-policy routing remain lineage-aware without splitting blocked-state authority away from request identity."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-008 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_action_identity_policy_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "allowed_action_ids[]"
- "allowed_action_ids"
- "request_id"
- "Plans/WorktreeGitImprovement.md"
- "/WorktreeGitImprovement.md"
- "lane pools"
- "parallel toggles"
- "Plans/Decision_Policy.md"
- "/storage/runtime"
negative_constraints:
- "Consumer surfaces must not split blocked-state authority away from request identity."
preserved_contractrefs: []
compatibility_only_notes:
- "Per-subtask worktree references are lineage until lane pools and parallel toggles are reconciled."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Decision_Policy.md"
```

### PS-009 - Mode Override And Remote Side Effect Authority

```yaml
plan_unit_id: PS-009
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mode override semantics reconcile ask/plan to deny, approval, external_publish_side_effect, side-effect, and non-bypassable remote publication approval so mutating remote side effects cannot diverge by surface or mode."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
unblocks: []
acceptance_criteria:
- "PS-009 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: mode_override_remote_side_effect
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "ask/plan -> deny"
- "/plan"
- "/approval"
- "external_publish_side_effect"
- "side-effect"
- "non-bypassable approval"
negative_constraints:
- "Mutating remote publication cannot diverge by surface or mode."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-010 - Provider Gap And Requested Effective Disclosure

```yaml
plan_unit_id: PS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Provider-gap disclosure remains distinct from overrides, and requested/effective permission display may stay compact only when requested equals effective and no control was skipped or clamped."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-009
unblocks: []
acceptance_criteria:
- "PS-010 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: provider_gap_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Provider-gap disclosure"
- "honored"
- "skipped"
- "clamped"
- "requested == effective"
- "/clamped"
- "/disclose"
negative_constraints:
- "Provider-gap states must not be collapsed into generic override wording."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-011 - Permission Trust And Projection Health Disclosure

```yaml
plan_unit_id: PS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Degraded-trust and projection-health are permission-visible trust inputs consumed by permission cards, approval surfaces, Orchestrator, Usage, widgets, and provider surfaces; stale, degraded, and restricted-trust render states cannot appear as fresh authority."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-007
- PS-010
unblocks: []
acceptance_criteria:
- "PS-011 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_trust_projection_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "degraded-trust"
- "projection-health"
- "permission-visible trust inputs"
- "attempt_id"
- "/file"
- "read-only"
- "historical"
- "restricted-trust"
- "fresh authority"
negative_constraints:
- "Stale, degraded, or restricted-trust render states cannot masquerade as fresh authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale or degraded projections do not become authoritative just because they are visible in the UI."
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-012 - Route Search And Target Approval Facts

```yaml
plan_unit_id: PS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission cards approve the exact route, search, subject-open, output, file, navigation, line, range, and editor-group facts they display instead of collapsing them into generic file-open prompts."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-011
unblocks: []
acceptance_criteria:
- "PS-012 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: route_search_target_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "line /range"
- "OpenFile"
- "object-family-specific anchors"
- "tab-local"
- "global object search"
- "route-target"
- "subject-open"
- "/output"
- "line?"
- "range?"
- "editor-group"
- "/navigation"
negative_constraints:
- "Permission cards must not hide route, search, and target facts behind a generic file-open prompt."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-013 - Compact Permission Surface Terminology

```yaml
plan_unit_id: PS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Small permission surfaces keep canonical compact terms and labels while Source Control stays worktree-first, graph badges and inspector chips remain dense, and contextual help expands explanations without renaming local jargon."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-012
unblocks: []
acceptance_criteria:
- "PS-013 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: compact_permission_surface_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0009
preserved_exact_tokens:
- "Small permission surfaces"
- "canonical terms"
- "compact labels"
- "Source Control"
- "worktree-first"
- "graph badges"
- "inspector chips"
- "/contextual"
negative_constraints:
- "Contextual help links expand to deeper explanations instead of renaming local jargon."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-014 - Path Normalization And Fail Closed Matching

```yaml
plan_unit_id: PS-014
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Before any permission match, paths expand home references, resolve absolute components and symlinks through realpath, match only canonical paths, and fail closed on broken symlinks, permission errors, missing targets, unresolved paths, or unexpanded runtime home tokens."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-014 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: path_normalization_fail_closed
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0011
preserved_exact_tokens:
- "Definitions and scope"
- "Path normalization invariants"
- "DEF-SCOPE"
- "realpath()"
- "symlink-root canonicalization"
- "~"
- "$HOME"
- "PM MUST NOT compare against an unresolved path as fallback"
- "fail-closed"
negative_constraints:
- "realpath() failure is fail-closed."
- "PM must not compare against an unresolved path as fallback."
- "Unexpanded ~ in a runtime path comparison is always a bug."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md"
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-015 - Tool Registry Boundary And HTE DAE Enforcement

```yaml
plan_unit_id: PS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions owns when a tool invocation is allowed, asks, or is denied, while Tools owns dispatch; HTE uses Puppet Master as sole dispatcher and DAE enforces the resolved permission ceiling through pre-spawn policy injection and post-hoc reconciliation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-015 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: tool_registry_execution_strategy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0013
preserved_exact_tokens:
- "Tool registry/policy vs Permission rules"
- "HTE vs DAE applicability"
- "policy.may_execute_tool()"
- "HTE"
- "DAE"
- "pre-spawn policy injection"
- "post-hoc reconciliation"
- "Child, subagent, or crew context is not a bypass"
negative_constraints:
- "DAE never creates an execution path that bypasses permission canon."
- "Child, subagent, or crew context is not a bypass."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, Primitive:DRYRules"
- "ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/orchestrator-subagent-integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/Run_Modes.md"
- "Plans/Architecture_Invariants.md"
- "Plans/orchestrator-subagent-integration.md"
```

### PS-016 - Mutable Permission State And Hook Recheck Safety

```yaml
plan_unit_id: PS-016
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mutable permission state shared across threads or async tasks requires an RwLock/read-write lock, and hooks that modify arguments or context must trigger a fresh permission evaluation on modified arguments before dispatch."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-015
unblocks: []
acceptance_criteria:
- "PS-016 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_mutation_hook_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0014
preserved_exact_tokens:
- "Permission-state mutation and hook safety"
- "RwLock"
- "read-write lock"
- "allowlists"
- "deny rules"
- "session approvals"
- "post-hook permission re-check contract"
negative_constraints:
- "Unguarded mutation of allowlists, deny rules, session approvals, or cached effective policy state is prohibited."
- "Hook execution can narrow permissions, but must not widen them after the original check has already passed."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md"
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Architecture_Invariants.md"
- "Plans/storage-plan.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
```

### PS-017 - Executable Capability Surfaces And Network Trust

```yaml
plan_unit_id: PS-017
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Discovery is not execution approval: plugin code, custom tools, MCP server binaries, command templates, formatter binaries, arg-touching hooks, and network trust settings must clear permission and trust posture before load or execution."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-016
unblocks: []
acceptance_criteria:
- "PS-017 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: executable_capability_trust_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0015
preserved_exact_tokens:
- "Executable capability surfaces and trust posture"
- "Discovery is not execution approval"
- "plugin code"
- "custom tool executables"
- "MCP server binaries"
- "command templates"
- "formatter binaries"
- "/network/trust"
- "system"
- "manual"
- "off"
- "http_proxy"
- "https_proxy"
- "no_proxy"
- "OS credential store"
- "custom CA bundle"
negative_constraints:
- "Config presence, package discovery, or catalog availability does not imply execution approval."
- "Source or version change invalidates prior approval and requires a new decision."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileSafe.md"
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
- "Plans/FileSafe.md"
- "Plans/Architecture_Invariants.md"
```

### PS-018 - Enterprise Host Registry And Kubernetes Policy Outcomes

```yaml
plan_unit_id: PS-018
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Enterprise host, private registry, Kubernetes, plugin-added, MCP, and custom-tool external-host actions inherit shared host policy, trust, proxy, and blocked-reason checks with canonical outcomes instead of generic network failure."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-017
unblocks: []
acceptance_criteria:
- "PS-018 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: enterprise_host_policy_outcomes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0016
preserved_exact_tokens:
- "Enterprise host, registry, and cluster policy outcomes"
- "/air-gapped"
- "offline_cached"
- "network_blocked_by_policy"
- "host_unreachable"
- "host_untrusted"
- "registry_hosts[]"
- "k8s_host_policy"
- "apply"
- "exec"
- "port_forward"
- "logs"
- "allowed_action_ids[]"
negative_constraints:
- "Policy-denied but otherwise valid registry or Kubernetes actions must not be reported as generic network failure."
- "Plugin-added, MCP, custom-tool, and other extensibility surfaces do not get plugin-private network exceptions."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Plugins_System.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/Contracts_V0.md"
- "Plans/Plugins_System.md"
```

### PS-019 - Permission Action Triad

```yaml
plan_unit_id: PS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Exactly three permission actions exist: allow proceeds without approval, ask pauses pending canonical user resolution options, and deny blocks execution, emits tool.denied, and returns an error."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
unblocks: []
acceptance_criteria:
- "PS-019 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_action_triad
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0020
preserved_exact_tokens:
- "Permission actions"
- "PERM-ACTIONS"
- "allow"
- "ask"
- "deny"
- "Exactly three permission actions exist"
- "deny"
- "once"
- "for session"
- "always"
- "tool.denied"
negative_constraints:
- "Every tool invocation resolves to exactly one action."
- "The denied tool is not executed."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/FileSafe.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
```

### PS-020 - Precedence Layers And Child Inheritance

```yaml
plan_unit_id: PS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission rules evaluate in strict layer precedence for mode override, parent/run ceiling, session cache, Persona overrides, project, global, and defaults, while child runs inherit restrictive action ceilings and argument-pattern rules additively without widening."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-020 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_precedence_layers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0021
preserved_exact_tokens:
- "Deterministic precedence across layers"
- "Mode override"
- "Parent/run ceiling"
- "Session cache"
- "Persona overrides"
- "Project-level"
- "Global-level"
- "Defaults"
- "ask / plan"
- "yolo"
- "merge-not-replace"
- "Parent Agent -> Parent Session -> Child Session -> Child Agent"
negative_constraints:
- "Higher-precedence layers shadow lower layers on a per-rule basis but do not replace the entire lower ruleset."
- "A child may narrow authority, but must not widen or replace away inherited restrictions."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md#PERSONA-INJECTION, PolicyRule:Decision_Policy.md§2"
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Personas.md"
- "Plans/Tools.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Executor_Protocol.md"
```

### PS-021 - Scope Specificity And Account Aware Carryover Fields

```yaml
plan_unit_id: PS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Scope specificity resolves lane before seam before package before project before global, carries role-scoped account policy overrides, and preserves execution_entity_id, account_id, permission_scope, and approval_carryover_scope for multi-lane account-aware permission carry-through."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
unblocks: []
acceptance_criteria:
- "PS-021 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: scope_specificity_account_carryover
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0021
preserved_exact_tokens:
- "lane:{lane_id}"
- "seam:{seam_id}"
- "package:{package_id}"
- "allowed_roles"
- "disallowed_roles"
- "cooldown_policy_override"
- "switch_threshold_override"
- "execution_entity_id"
- "account_id"
- "permission_scope"
- "approval_carryover_scope"
- "effective-account"
negative_constraints:
- "Permission resolution and approval carryover must be multi-lane and account-aware rather than session-only."
- "Role-scoped account policy override fields narrow authority but do not widen the parent/run permission ceiling."
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#10.8 Human-in-the-loop approvals, Plans/Tools.md#10.7A Web-operation approval summary rules"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Tools.md"
```

### PS-022 - Requested Vs Effective Capability Disclosure

```yaml
plan_unit_id: PS-022
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "UI and runtime distinguish requested from effective permissioned capability state for tools, MCP, browser trust, project overrides, Persona profiles, and child ceilings, and disclose the governing layer on the owning surface."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-020
- PS-021
unblocks: []
acceptance_criteria:
- "PS-022 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: requested_effective_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0022
preserved_exact_tokens:
- "Requested vs effective permissioned capability state"
- "PRECEDENCE-LAYERS"
- "#PRECEDENCE-LAYERS"
- "requested state"
- "effective state"
- "MCP server/tool availability"
- "browser trust/capability tiers"
- "/requested-vs-effective"
- "Section15"
- "terminal action"
negative_constraints:
- "The PRECEDENCE-LAYERS alias does not redefine the layer table."
- "Permission UI must not imply a terminal action is allowed when the effective permission or capability state is clamped."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
```

### PS-023 - Granular Permission Rule Object Shape

```yaml
plan_unit_id: PS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Granular permission rules may be simple action strings or objects containing pattern-based sub-rules that match invocation context such as file path, bash command string, or URL."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-023 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: granular_permission_rule_object
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0023
preserved_exact_tokens:
- "Granular rules"
- "GRANULAR-RULES"
- "allow"
- "ask"
- "deny"
- "file path"
- "read"
- "edit"
- "bash"
- "URL"
- "webfetch"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/Decision_Policy.md"
```

### PS-024 - Wildcard Matching Ordering And Case Mode

```yaml
plan_unit_id: PS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Wildcard matching defines star, question mark, optional trailing command portions, tool-family prefixes, definition-order last-match wins, path case sensitivity from resolved root semantics, and fail-closed behavior when stable roots cannot be determined."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-014
- PS-023
unblocks: []
acceptance_criteria:
- "PS-024 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: wildcard_matching_case_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0024
preserved_exact_tokens:
- "Wildcard syntax and matching"
- "WILDCARD-SYNTAX"
- "*"
- "?"
- "git *"
- "github_*"
- "last matching rule wins"
- "case-sensitive"
- "case-insensitive"
- "bytewise case-sensitive"
- "fail closed"
negative_constraints:
- "If PM cannot determine a stable canonical root for a path comparison, it fails closed rather than guessing a case mode."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2"
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md"
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/FileSafe.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
```

### PS-025 - Home Expansion Pattern Rule

```yaml
plan_unit_id: PS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Home expansion applies only when ~ or $HOME appear at the start of a pattern; mid-pattern occurrences remain literal characters."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-024
unblocks: []
acceptance_criteria:
- "PS-025 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: home_expansion_pattern_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0025
preserved_exact_tokens:
- "Home expansion"
- "HOME-EXPANSION"
- "~"
- "$HOME"
- "start of a pattern"
- "literal characters"
negative_constraints:
- "Mid-pattern ~ and $HOME occurrences must be treated as literal characters."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-026 - External Directory Guard And Allowlist

```yaml
plan_unit_id: PS-026
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Any tool invocation referencing a path outside active project working roots triggers the external_directory permission key with default ask, except paths on the external directory allowlist, whose entries support wildcard syntax."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-014
- PS-024
- PS-025
unblocks: []
acceptance_criteria:
- "PS-026 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_guard_allowlist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0026
preserved_exact_tokens:
- "External directory guard"
- "EXTERNAL-DIR-GUARD"
- "external_directory"
- "Default: ask"
- "external directory allowlist"
- "~/.cargo/**"
- "/usr/local/include/**"
negative_constraints:
- "Paths outside active project working roots must not bypass the external_directory guard unless covered by the allowlist."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-027 - Always Approval Pattern Suggestions

```yaml
plan_unit_id: PS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "An always approval derives a suggested scope from invocation context for bash, edit/read/glob/grep, webfetch/websearch, and webextract/webresearch/webcrawl/webmap, presents scope-bound choices, and binds canonical approval to approval_scope_key plus blocked-episode identity."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-005
- PS-023
- PS-026
unblocks: []
acceptance_criteria:
- "PS-027 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_205
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: always_approval_pattern_suggestion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0027
preserved_exact_tokens:
- "Pattern suggestion contract (\"always\" approval)"
- "PATTERN-SUGGESTION"
- "always"
- "bash"
- "edit/read/glob/grep"
- "webfetch/websearch"
- "webextract/webresearch/webcrawl/webmap"
- "https://<domain>/*"
- "https://<actual-host>/*"
- "approval_scope_key"
- "blocked-episode identity"
negative_constraints:
- "The system must not silently mint a session-wide allow."
- "The canonical approval anchor is approval_scope_key plus blocked-episode identity rather than a UI session id."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-028 - Web Operation Derived Key Taxonomy

```yaml
plan_unit_id: PS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web operation permission keys derive from normalized domains and query categories rather than raw user-entered URLs, with explicit webextract, webresearch, webcrawl, webmap, and broad web*:* authoring vocabulary."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-023
- PS-024
- PS-027
unblocks: []
acceptance_criteria:
- "PS-028 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_operation_key_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Web-operation permission-key derivation"
- "webextract:{domain}"
- "webresearch:{query_category}"
- "webcrawl:{domain}"
- "webmap:{domain}"
- "query_category ∈ {general, code, docs, news}"
- "web*:*"
- "registrable domain"
- "docs.example.com"
- "example.com"
negative_constraints:
- "Concrete approvals must resolve to normalized derived web permission keys."
- "Wildcard family authoring does not change the requirement that concrete approvals resolve to normalized derived keys."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
```

### PS-029 - Web Operation Approval Visibility

```yaml
plan_unit_id: PS-029
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Default web-operation posture remains ask where network web tools are enabled, six web tools stay explicit, and extract/crawl/map fan-out is visible in permission cards and audit payloads rather than hidden behind generic webfetch."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-028
unblocks: []
acceptance_criteria:
- "PS-029 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_operation_approval_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Default web-operation posture remains ask"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "webfetch"
- "websearch"
- "advanced matcher"
- "Crawl/map fan-out"
- "permission cards"
- "audit payloads"
negative_constraints:
- "Crawl/map fan-out must not be hidden behind generic webfetch."
- "Query/task pattern rules require a separate advanced-matcher owner contract before use."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes:
- "Search/research may use query/task pattern rules only after the advanced matcher has an owner-defined contract and validation evidence."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-030 - Web Approval Summary Templates

```yaml
plan_unit_id: PS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval cards render tool-specific summaries for websearch, webfetch/webextract, webresearch, and webcrawl/webmap using query preview, target host or URL, task summary, estimated source count, root URL, and page/depth caps."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-028
- PS-029
unblocks: []
acceptance_criteria:
- "PS-030 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_approval_summary_templates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "websearch summary shows tool name + query preview"
- "webfetch/webextract summary shows tool name + target host/URL"
- "webresearch summary shows tool name + task summary + estimated source count when available"
- "webcrawl/webmap summary shows tool name + root URL + page/depth caps"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-031 - Web Session Approval Semantics

```yaml
plan_unit_id: PS-031
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web Once, For Session, Always, and Deny approvals preserve host-scoped follow-ons, wildcard-only MVP search/research, durable rule creation, and reject-all-pending cascade behavior under approval_scope_key and blocked-episode identity."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-005
- PS-027
- PS-028
unblocks: []
acceptance_criteria:
- "PS-031 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: web_session_approval_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "Once"
- "For Session"
- "Always"
- "Deny"
- "reject-all-pending"
- "approval_scope_key"
- "https://host.example/*"
- "https://docs.example.com/*"
- "MVP uses wildcard session approval for search/research"
- "Approving webcrawl For Session auto-approves crawl/map/extract/fetch"
negative_constraints:
- "For Session websearch and webresearch wildcard behavior does not permit unrelated file, shell, or network mutation tools."
- "Approving webresearch For Session does not create broad allow for unrelated tools."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-032 - Browser Capture And Auth Session Permission Boundary

```yaml
plan_unit_id: PS-032
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Browser capture requests for screenshot or pdf require session_granted approval, browser permission storage values remain canonical while UI/source aliases are lineage only, and auth_session follows normal capture/share/clipboard permission disclosure."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-010
- PS-022
- PS-031
unblocks: []
acceptance_criteria:
- "PS-032 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: browser_capture_permission_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0028
preserved_exact_tokens:
- "screenshot"
- "pdf"
- "session_granted"
- "always_allowed"
- "explicit_confirmation"
- "always-allowed"
- "session-granted"
- "explicit-confirmation"
- "trust-tier"
- "auth_session"
- "/copy/paste"
- "/share"
negative_constraints:
- "Do not revive the retired preview/browser trust-tier matrix."
- "Browser implementation-readiness details stay with browser owner docs, not Permissions implementation ownership."
preserved_contractrefs: []
compatibility_only_notes:
- "UI/source aliases always-allowed, session-granted, and explicit-confirmation are lineage labels only."
stale_retired_dispositions:
- "Retired preview/browser trust-tier matrix is not revived by browser-session permission tiers."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-033 - Special Guard Synthetic Key Family

```yaml
plan_unit_id: PS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Special guards are synthetic permission keys tied to behavioral conditions rather than specific tools and are evaluated in addition to tool-specific permissions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
unblocks: []
acceptance_criteria:
- "PS-033 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: special_guard_family
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0029
preserved_exact_tokens:
- "Special guards"
- "SPECIAL-GUARDS"
- "synthetic permission keys"
- "behavioral condition"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-034 - Doom Loop Guard

```yaml
plan_unit_id: PS-034
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "doom_loop triggers when the same tool is called with identical input three consecutive times, defaults to ask, pauses or denies in headless mode, and allows configurable threshold and action."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
unblocks: []
acceptance_criteria:
- "PS-034 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: doom_loop_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0030
preserved_exact_tokens:
- "doom_loop"
- "GUARD-DOOM-LOOP"
- "identical input three consecutive times"
- "3×"
- "possible loop"
- "once"
- "for session"
- "always"
- "abort the run"
- "threshold = 3"
negative_constraints:
- "Headless mode cannot wait for an unavailable approval and therefore denies when the guard requires ask."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-035 - External Directory Guard Evaluation

```yaml
plan_unit_id: PS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "external_directory triggers when a tool references a path outside project working roots, checks the external directory allowlist first, and otherwise applies the configured allow, ask, or deny action."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-026
- PS-033
unblocks: []
acceptance_criteria:
- "PS-035 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_guard_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0031
preserved_exact_tokens:
- "external_directory"
- "GUARD-EXTERNAL-DIR"
- "project working roots"
- "Default action: ask"
- "external directory allowlist"
- "allow"
- "ask"
- "deny"
- "allowlist"
negative_constraints:
- "Outside-root paths must not bypass the guard unless they match an allowlist entry."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-036 - External Publish Guard Coverage

```yaml
plan_unit_id: PS-036
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "external_publish_side_effect covers DockerHub repository creation, autonomous DockerHub image push, managed remote template repository creation, and managed Unraid template repository remote push as non-bypassable remote side-effect approvals."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-009
- PS-033
unblocks: []
acceptance_criteria:
- "PS-036 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_guard_non_bypassable
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0032
preserved_exact_tokens:
- "external_publish_side_effect"
- "DockerHub repository creation"
- "DockerHub image push"
- "managed remote template repository"
- "managed Unraid template repository"
- "Default action: ask"
- "non-bypassable"
- "yolo"
- "scope-bound approval reuse"
- "generic prior allows"
negative_constraints:
- "yolo mode, scope-bound approval reuse, and generic prior allows must not suppress external_publish_side_effect."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-037 - External Publish Approval And Failure Presentation

```yaml
plan_unit_id: PS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "A direct user click approves only the exact remote side effect named by that control, chained remote side effects require separate approvals in execution order, and blocked or rejected runtime errors identify the blocked step, guard, and recovery actions inline and in chat/evidence output."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-036
unblocks: []
acceptance_criteria:
- "PS-037 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_failure_presentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0032
preserved_exact_tokens:
- "direct user click"
- "exact remote side effect"
- "separate approval step"
- "execution order"
- "Failure presentation"
- "blocked remote step"
- "guard name"
- "recovery actions"
- "Docker Manager"
- "orchestrator surfaces"
- "chat/evidence output"
negative_constraints:
- "A direct click approval must not authorize a different remote side effect in the same chained flow."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/FinalGUISpec.md"
```

### PS-038 - Tool Permission Key Taxonomy

```yaml
plan_unit_id: PS-038
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Tool permission key taxonomy and preset vocabulary remain owned by Permissions, while approval-card summaries and session-approval behavior are owned by Ask flow semantics and durable always reuse remains inspectable through permission/audit surfaces."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-019
- PS-028
unblocks: []
acceptance_criteria:
- "PS-038 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: tool_permission_key_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0033
preserved_exact_tokens:
- "Tool permission keys"
- "tool permission-key taxonomy"
- "preset vocabulary"
- "deny"
- "once"
- "for session"
- "always"
- "question default `allow` only when HITL is available"
- "read_only"
- "plan"
- "websearch"
- "webfetch"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "status: \"unavailable\""
negative_constraints: []
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-039 - Ask Flow Web Summary Ownership

```yaml
plan_unit_id: PS-039
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Web tool permission keys, approval-card summary templates, session-approval semantics, and exact approval-card cross-reference targets remain canonical in Permissions and must not be reinvented from thin tool descriptions or stale Ask UI links."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-030
- PS-031
unblocks: []
acceptance_criteria:
- "PS-039 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: ask_flow_web_summary_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0034
preserved_exact_tokens:
- "Ask flow semantics"
- "Web tool permission keys"
- "approval-card summary templates"
- "session-approval semantics"
- "stale Ask UI links"
negative_constraints:
- "Web tool permission keys, approval-card summary templates, and session-approval semantics must not be re-invented from thin tool descriptions or stale Ask UI links."
preserved_contractrefs:
- "ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-040 - Ask Flow Preset Carry Through

```yaml
plan_unit_id: PS-040
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Ask flow preset behavior carries TODO, plan-mode web, batch webfetch, four-tier approval ladder, web tool visibility, strict read_only/no-network options, blocked/unavailable payload fields, and skill/lsp/question/todo/web keys through permission presets."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-038
- PS-039
unblocks: []
acceptance_criteria:
- "PS-040 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: ask_flow_preset_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0034
preserved_exact_tokens:
- "todowrite"
- "todoread"
- "blanket-denied"
- "Batch webfetch canon"
- "four-tier approval ladder"
- "question default allow only when HITL is available"
- "six web tools"
- "read_only/no-network"
- "skill"
- "lsp"
- "question"
- "todo"
- "web"
negative_constraints:
- "Plan-mode permission behavior removes web tools from any blanket deny."
preserved_contractrefs: []
compatibility_only_notes:
- "TODO behavior is locked so todowrite and todoread use the normalized TODO schema."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-041 - Approval Ladder Durable Always Path

```yaml
plan_unit_id: PS-041
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval UI preserves deny, once, for session, and always; once approves only the current invocation, for session creates an ephemeral session-cache allow under approval_scope_key, and always creates a revocable project or global rule through canonical permissions storage."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-019
- PS-023
- PS-027
unblocks: []
acceptance_criteria:
- "PS-041 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_ladder_durable_always
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Approval UX, recovery, and audit visibility"
- "deny"
- "once"
- "for session"
- "always"
- "approval_scope_key"
- "Project"
- "Global"
- "canonical permissions storage"
- "FileSafe allowlists"
- "one-off UI side effects"
negative_constraints:
- "Durable approval must not be implemented through ad-hoc FileSafe allowlists or one-off UI side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-042 - Blocked Recovery Payload Routing

```yaml
plan_unit_id: PS-042
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Blocked-action recovery uses blocked_reason_code plus ordered allowed_action_ids and surfaces only canonical actions for permission policy, FileSafe, unavailable MCP, unavailable providers/services, and headless ask denial."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-008
unblocks: []
acceptance_criteria:
- "PS-042 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_action_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Blocked-action recovery"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "FileSafe"
- "unavailable MCP"
- "unavailable providers"
- "headless ask denial"
- "open_permissions"
- "open_filesafe_settings"
- "approve_once"
- "filesafe_add_rule"
negative_constraints:
- "Blocked recovery must be direct rather than a passive error string."
- "UI surfaces render only canonical allowed actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/FinalGUISpec.md"
```

### PS-043 - Permission Evidence Audit Visibility

```yaml
plan_unit_id: PS-043
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission prompts, denials, approvals, and blocked outcomes write operational evidence to the audit stream and appear in both concise collapsible thread transparency and a dedicated log/audit inspector."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-007
unblocks: []
acceptance_criteria:
- "PS-043 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_audit_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Permission prompts"
- "denials"
- "approvals"
- "blocked outcomes"
- "audit stream"
- "concise, collapsible in-thread transparency"
- "dedicated log/audit inspector"
- "search"
- "filtering"
- "drill-down"
- "on-demand payload reads"
negative_constraints:
- "Chat transparency must not be the only place to inspect operational history."
- "The dedicated inspector must not replace lightweight thread transparency."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-044 - Question TODO Task Permission Boundary

```yaml
plan_unit_id: PS-044
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Question, todowrite, todoread, user-facing task behavior, and todo-tool availability keep schemas in their owner contracts while Permissions owns allow/ask/deny posture, inherited ceilings, blocked/unavailable payloads, and audit visibility."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-040
unblocks: []
acceptance_criteria:
- "PS-044 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: question_todo_task_permission_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "question"
- "todowrite"
- "todoread"
- "task"
- "todo-tool"
- "Deep Plan markdown"
- "normalized TODO projection"
- "active thread/run"
negative_constraints:
- "The permission layer must not redefine question, TODO, or task schemas locally."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-045 - Batch Web Approval Inputs And Timeout

```yaml
plan_unit_id: PS-045
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Batch web approval preserves domain prompt semantics, required URL list bounds, concurrency limits, continue_on_error default, For Session domain grants, and locked batch timeout formula individual_timeout times min(url_count, 5) capped at 600 seconds."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-031
unblocks: []
acceptance_criteria:
- "PS-045 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: batch_web_approval_timeout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "single confirmation prompt showing all unique domains in the batch"
- "urls: string[]"
- "min 1, max 50"
- "concurrency?: number"
- "default 3"
- "max 10"
- "continue_on_error?: boolean"
- "default true"
- "For Session grants all listed domains for that session"
- "individual_timeout × min(url_count, 5)"
- "cap 600s"
negative_constraints:
- "Batch timeout formula is locked and must not be silently replaced."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-046 - HITL Approval Scope Fields And Labels

```yaml
plan_unit_id: PS-046
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Shared HITL approval ladder alignment carries approval_scope_key, blocked_sequence, execution_entity_id, lane_id, package_id, account_id, Deny/Once/For session/Always labels, and ordered allowed actions without same-session widening."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-005
- PS-042
unblocks: []
acceptance_criteria:
- "PS-046 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: hitl_approval_scope_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0035
preserved_exact_tokens:
- "Shared approval-ladder alignment"
- "approval_scope_key"
- "blocked_sequence"
- "execution_entity_id"
- "lane_id"
- "package_id"
- "account_id"
- "Deny"
- "Once"
- "For session"
- "Always"
- "ordered `allowed_action_ids[]`"
- "lane/package/account scope"
negative_constraints:
- "Approval scope must not silently become same-session if lanes are parallel."
- "Session-wide approval policy must remain distinct from blocked-episode approval."
preserved_contractrefs:
- "ContractRef: Plans/human-in-the-loop.md#Shared approval-ladder alignment (2026-04-04)"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/human-in-the-loop.md"
```

### PS-047 - Plan Mode And Read Only Default Split

```yaml
plan_unit_id: PS-047
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Plan mode and Read-only are distinct permission concepts: Plan may allow information-gathering read/search/question/web operations while denying mutation, and strict read_only/no-network may deny web operations explicitly."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-040
unblocks: []
acceptance_criteria:
- "PS-047 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: plan_readonly_default_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Deterministic defaults"
- "Plan mode"
- "Read-only preset"
- "deny-all-except-read"
- "information-gathering tools"
- "external-read web work"
- "websearch"
- "webresearch"
- "webfetch"
- "webextract"
- "webcrawl"
- "webmap"
- "read_only"
- "plan"
negative_constraints:
- "Plan mode must not be treated as deny-all-except-read."
- "Entering plan mode must not auto-deny web operations as a family."
- "read_only and plan must not be treated as synonyms."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-048 - Permission Settings Web Rows And Provider Help

```yaml
plan_unit_id: PS-048
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission settings surfaces render web tool rows individually, granular editor help includes host/domain pattern examples, session help explains wildcard versus host-scoped approval, and provider settings explain API-key and fallback ordering behavior."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-047
unblocks: []
acceptance_criteria:
- "PS-048 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_settings_web_rows_provider_help
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Permission settings surfaces"
- "web tool rows individually"
- "https://docs.rs/*"
- "https://developer.mozilla.org/*"
- "/crawl/map/read"
- "Exa"
- "Tavily"
- "Firecrawl"
- "DuckDuckGo fallback"
- "provider ordering"
negative_constraints:
- "Provider fallback help must not imply that API-key requirements are uniform across providers."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-049 - Automation First And Deterministic Gate Wording

```yaml
plan_unit_id: PS-049
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Automation-first is the baseline permission posture for non-interactive execution; compatibility defaults and nondeterministic gate phrases are compatibility notes only and do not weaken required owner-doc enforcement."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-047
unblocks: []
acceptance_criteria:
- "PS-049 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: automation_first_gate_wording
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0036
preserved_exact_tokens:
- "Automation-first"
- "non-interactive execution"
- "HTE-by-default"
- "visible-first local runs"
- "regular"
- "/HTE"
- "visual_mode = auto"
- "mandatory approvals"
- "allowed_action_ids[]"
- "Execution contract (recommended)"
- "targeted for future enforcement"
negative_constraints:
- "Compatibility defaults must not silently prefer visible runs or mandatory approvals when effective policy supports automation-first execution."
- "Nondeterministic gate language does not weaken required owner-doc enforcement."
preserved_contractrefs: []
compatibility_only_notes:
- "HTE-by-default, visible-first local runs, regular, /HTE, and visual_mode = auto are compatibility defaults in this context."
- "Execution contract (recommended) and targeted for future enforcement are compatibility notes only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-050 - Resolution Algorithm Composition

```yaml
plan_unit_id: PS-050
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission resolution composes precedence layers with dispatch checks by building invocation context, applying mode and scoped layers, running non-bypassable guards and capability gates, persisting requested/effective evidence, rechecking hook mutations, and dispatching only final allow outcomes."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
- PS-022
- PS-026
- PS-036
unblocks: []
acceptance_criteria:
- "PS-050 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_resolution_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0038
preserved_exact_tokens:
- "Resolution algorithm"
- "Composition with precedence layers"
- "mode layer"
- "ask"
- "plan"
- "yolo"
- "non-bypassable guards"
- "requested_permission_state"
- "effective_permission_state"
- "downgrade_reason"
- "permission_snapshot_id?"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "Dispatch only when the final effective decision is allow"
negative_constraints:
- "ask, deny, blocked, unavailable, or capability-failed outcomes must emit audit evidence and must not call the underlying tool."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### PS-051 - Banned Command Full String Check

```yaml
plan_unit_id: PS-051
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Banned-command evaluation scans the full command string, including shell metacharacters and substitution forms, and denies commands whose arguments contain banned destructive sequences even when the first token is allowed."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-024
unblocks: []
acceptance_criteria:
- "PS-051 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: banned_command_full_string
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0039
preserved_exact_tokens:
- "Banned-command full-string check"
- "full command string"
- "first token"
- ";"
- "&&"
- "||"
- "|"
- "$()"
- "backticks"
- "First-token-only checking is prohibited"
negative_constraints:
- "First-token-only checking is prohibited."
- "A command that passes a first-token allowlist but contains a banned destructive sequence in arguments is still denied."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-052 - Hook Recheck Before Dispatch

```yaml
plan_unit_id: PS-052
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Arg-touching hooks require permission checks on the original invocation and the modified invocation before dispatch, in the required order from context normalization through final dispatch."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-016
- PS-050
unblocks: []
acceptance_criteria:
- "PS-052 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: hook_recheck_before_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0040
preserved_exact_tokens:
- "Hook re-check and execution-path invariance"
- "policy.may_execute_tool()"
- "arg-touching hooks"
- "Re-run permission checks"
- "Dispatch only if the re-check passes"
negative_constraints:
- "The dispatch layer must not call the underlying tool implementation until both checks pass on the final argument set."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Tools.md"
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
- "Plans/Architecture_Invariants.md"
```

### PS-053 - Shell Isolation Owner Boundary

```yaml
plan_unit_id: PS-053
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Shell and session process environment isolation is jointly owned by orchestrator-subagent integration and Tools; Permissions consumes that invariant for agent and crew execution context without defining shell lifecycle behavior."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-050
unblocks: []
acceptance_criteria:
- "PS-053 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: shell_isolation_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0041
preserved_exact_tokens:
- "Shell environment isolation routing"
- "shell/session processes"
- "jointly owned"
- "agent/crew execution context"
- "does not define shell lifecycle behavior itself"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/orchestrator-subagent-integration.md"
- "Plans/Tools.md"
```

### PS-054 - Cleanup Sensitive Retention Approval Gate

```yaml
plan_unit_id: PS-054
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Cleanup-sensitive approval and retention checks are permission-visible: active-run ownership, unresolved blocked recovery, required safe-point restore, unresolved conflict inspection, or newer lineage dependency keep targets retained, suspect, or restoring rather than cleanup_eligible."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-042
- PS-053
unblocks: []
acceptance_criteria:
- "PS-054 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: cleanup_retention_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0041
preserved_exact_tokens:
- "Cleanup-sensitive approval"
- "retention checks"
- "active-run ownership"
- "unresolved blocked recovery"
- "required safe-point restore"
- "unresolved conflict inspection"
- "newer lineage dependency"
- "retained"
- "suspect"
- "restoring"
- "cleanup_eligible"
negative_constraints:
- "Approval cards must not offer destructive cleanup as if age alone made it safe."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-055 - Permission Storage Layer Stack

```yaml
plan_unit_id: PS-055
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission configuration is stored across durable global, project, and persona layers plus an ephemeral in-memory session layer with the specified locations, TOML format, and lifetimes."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
unblocks: []
acceptance_criteria:
- "PS-055 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_storage_layers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0042
preserved_exact_tokens:
- "Persistence and storage"
- "PERSISTENCE"
- "Global"
- "Project"
- "Persona"
- "Session"
- "~/.config/puppet-master/permissions.toml"
- "<project_root>/.puppet-master/permissions.toml"
- "default_permissions_profile"
- "permission-profiles"
- "In-memory session cache"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Personas.md#STORAGE-LAYOUT"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/Personas.md"
```

### PS-056 - Durable Approval Record Metadata

```yaml
plan_unit_id: PS-056
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Durable approvals created through create_project_rule or create_global_rule persist in their owning config layer as metadata-bearing records with tool_pattern, action, optional scope_key, created_at, and created_by_thread_id."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-041
- PS-055
unblocks: []
acceptance_criteria:
- "PS-056 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: durable_approval_record_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0042
preserved_exact_tokens:
- "create_project_rule"
- "create_global_rule"
- "metadata-bearing records"
- "tool_pattern"
- "action"
- "scope_key?"
- "created_at"
- "created_by_thread_id"
- "File-level TOML projections"
negative_constraints:
- "Simpler per-tool TOML projections must not replace stored rule identity and audit metadata."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-057 - TOML Permission Config Format

```yaml
plan_unit_id: PS-057
unit_type: reference
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions TOML format examples preserve simple per-tool permissions, granular object syntax, special guard actions, external directory allowlist, and doom loop threshold override."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
unblocks: []
acceptance_criteria:
- "PS-057 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: toml_permission_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0043
preserved_exact_tokens:
- "TOML format"
- "[tools]"
- "read = \"allow\""
- "edit = \"ask\""
- "bash = \"ask\""
- "webfetch = \"allow\""
- "[tools.bash]"
- "git *"
- "npm *"
- "rm *"
- "[tools.read]"
- "*.env"
- "*.env.*"
- "*.env.example"
- "[guards]"
- "doom_loop"
- "external_directory"
- "external_publish_side_effect"
- "[guards.external_directory]"
- "[guards.doom_loop]"
- "threshold = 3"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-058 - Redb Tool Permissions Projection

```yaml
plan_unit_id: PS-058
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The resolved active-session permission set may be persisted to redb config:v1 under tool_permissions only as a compatibility projection; TOML files remain the durable source of truth."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
unblocks: []
acceptance_criteria:
- "PS-058 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: redb_tool_permissions_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0044
preserved_exact_tokens:
- "Config key in redb"
- "config:v1"
- "tool_permissions"
- "Plans/Tools.md §10.1"
- "TOML files"
- "durable source of truth"
- "redb key"
- "projection"
negative_constraints:
- "The redb tool_permissions key must not become the durable source of truth."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md"
compatibility_only_notes:
- "The redb key is a compatibility projection for the existing config schema."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
```

### PS-059 - Effective State Disclosure And Stale Projection Gate

```yaml
plan_unit_id: PS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission effective-state disclosure separates inherited, overridden, requested, effective, honored, skipped, clamped, projection_freshness, and projection_health, and stale or degraded projections do not become authoritative or bypass mutating-action revalidation."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings help, GUI references, or compact surface behavior."
split_recommended: false
depends_on:
- PS-022
- PS-042
unblocks: []
acceptance_criteria:
- "PS-059 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_206
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: effective_state_disclosure_projection_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0046
preserved_exact_tokens:
- "GUI requirements"
- "Effective-state disclosure requirements"
- "inherited / overridden"
- "requested"
- "effective"
- "honored / skipped / clamped"
- "projection_freshness"
- "projection_health"
- "allowed_action_ids[]"
- "blocked-episode identity"
- "legacy request-era fields"
negative_constraints:
- "Stale or degraded projections do not become authoritative just because they are visible in the UI."
- "Mutating actions must revalidate or gate when permission-relevant projections are stale, degraded, or unavailable."
- "Blocked/recovery action visibility must use allowed_action_ids[] and blocked-episode identity rather than legacy request-era fields."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/FinalGUISpec.md"
compatibility_only_notes:
- "Legacy request-era fields are compatibility only and must not replace allowed_action_ids[] and blocked-episode identity."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Decision_Policy.md"
- "Plans/Prompt_Pipeline.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
- "Plans/FinalGUISpec.md"
```

### PS-060 - Debug Automation Profile Disclosure

```yaml
plan_unit_id: PS-060
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Requested and effective Debug Automation Profile state is disclosed in active Debug headers, detailed inspectors, the Permissions surface, and recovery banners, including grant origin, scope, capability groups, degraded or blocked reasons, and expiry or revocation state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-022
- PS-042
- PS-059
unblocks: []
acceptance_criteria:
- "PS-060 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0047
preserved_exact_tokens:
- "Debug Automation Profile disclosure"
- "investigation_id"
- "front_door_approval"
- "revalidated_after_resume"
- "not_granted"
- "requested capability groups"
- "effective capability groups"
- "active"
- "degraded"
- "blocked"
- "expiry / revocation state"
negative_constraints:
- "High-risk actions outside the profile must continue to surface explicit confirmation UI instead of being described as silently covered by the profile."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
- "ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/human-in-the-loop.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/assistant-chat-design.md"
```

### PS-061 - Debug Profile Run Scoped Grant Boundary

```yaml
plan_unit_id: PS-061
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Debug Automation Profile grants are run-scoped and investigation-scoped rather than durable global/static permission layers, and expire unless a separate durable permission rule is explicitly approved."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
- PS-060
unblocks: []
acceptance_criteria:
- "PS-061 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_run_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0048
preserved_exact_tokens:
- "Debug profile target binding and reason codes"
- "run-scoped"
- "/static"
- "front-door approval"
- "resume revalidation"
- "no grant"
- "global"
- "project"
- "Persona"
- "default profile layers"
negative_constraints:
- "The Debug Automation Profile must not be appended to global, project, Persona, or default profile layers as durable static policy."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-062 - Debug Profile Target Binding And Verification Disclosure

```yaml
plan_unit_id: PS-062
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Debug Investigation Context records stop, attention, blocked, and budget reason codes; target binding is deterministic, unresolved same-tier ties enter attention_required, strong verification is required for automated debug resolution, and remote/dev-session sections disclose requested/effective capability differences."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-061
- PS-049
unblocks: []
acceptance_criteria:
- "PS-062 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: debug_profile_target_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0048
preserved_exact_tokens:
- "stop_reason_code"
- "attention_required_reason_code"
- "blocked_reason_code"
- "budget_kind"
- "target_selection_required"
- "verification_strength=strong"
- "/prototyping"
- "/output"
- "attention_required"
- "failed"
- "failed_cleanup"
negative_constraints:
- "PM must not guess a target under the Debug Automation Profile."
- "Weaker or missing verification remains attention_required, failed, or failed_cleanup according to investigation state."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/assistant-chat-design.md"
```

### PS-063 - Dedicated Permissions Settings Tab

```yaml
plan_unit_id: PS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Settings includes a dedicated Permissions tab whose sections are provided as collapsible cards."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-059
unblocks: []
acceptance_criteria:
- "PS-063 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_tab_structure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0049
preserved_exact_tokens:
- "Dedicated Permissions tab"
- "Permissions"
- "Settings"
- "collapsible cards"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-064 - Global Defaults And Per Tool Overrides UI

```yaml
plan_unit_id: PS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions UI includes a global wildcard default dropdown and a per-tool overrides table with tool category, action dropdown, granular expand affordance, and inline inherited, overridden, and effective provenance."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-038
- PS-055
- PS-063
unblocks: []
acceptance_criteria:
- "PS-064 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_global_tool_overrides
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0050
preserved_exact_tokens:
- "Global defaults + per-tool overrides"
- "Allow"
- "Ask"
- "Deny"
- "Global wildcard default"
- "Per-tool overrides"
- "category badge"
- "expand chevron"
- "Inherited"
- "Overridden"
- "Effective"
- "/inheritance/fallback"
negative_constraints:
- "Override display is inline, not modal-only."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FinalGUISpec.md"
```

### PS-065 - Granular Rule Editor UI

```yaml
plan_unit_id: PS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Expanded tool rows expose an ordered granular rule editor with pattern/action entries, Add rule, reorder handles, delete controls, wildcard input help, and last-match-wins ordering."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-023
- PS-024
- PS-064
unblocks: []
acceptance_criteria:
- "PS-065 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: granular_rule_editor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0051
preserved_exact_tokens:
- "Granular rule editor"
- "{pattern, action}"
- "Add rule"
- "Ask"
- "Drag handles"
- "last-match-wins"
- "Delete button"
- "*"
- "?"
- "wildcard syntax"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-066 - Permission Preset Approval Contract

```yaml
plan_unit_id: PS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission preset surfaces preserve the four-tier approval ladder, HITL-gated question default allow, independently visible ask-gated web tools, strict read_only/no-network denial options, and blocked/unavailable payload fields."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-019
- PS-040
- PS-041
- PS-042
unblocks: []
acceptance_criteria:
- "PS-066 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_preset_approval_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0052
preserved_exact_tokens:
- "Presets"
- "four-tier approval ladder"
- "question default `allow` only when HITL is available"
- "six web tools"
- "ask-gated"
- "read_only/no-network"
- "blocked_reason_code"
- "allowed_action_ids[]"
- "status: \"unavailable\""
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/human-in-the-loop.md"
```

### PS-067 - Read Only And Full Preset Key Matrix

```yaml
plan_unit_id: PS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Read-only and full presets preserve explicit allow, ask, and deny key families across read/search/skill/lsp/question/todo/web/task/media/import tools and keep preset tables aligned with mode-override text."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-038
- PS-047
- PS-066
unblocks: []
acceptance_criteria:
- "PS-067 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_preset_key_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0052
preserved_exact_tokens:
- "Read-only preset reconciliation"
- "Full preset reconciliation"
- "read_only"
- "plan"
- "webfetch"
- "websearch"
- "webextract"
- "webresearch"
- "webcrawl"
- "webmap"
- "lsp(ro)"
- "/question/todoread/todowrite/capabilities.get"
- "repo.import"
- "media.generate"
negative_constraints:
- "Plan-mode wording must not imply blanket denial of tools expected during planning or research."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-068 - External Directory Allowlist Manager UI

```yaml
plan_unit_id: PS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The external directory allowlist manager provides a scrollable wildcard path list, Add path input with optional native directory picker, per-row delete, and resolved home expansion display."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-026
- PS-035
- PS-063
unblocks: []
acceptance_criteria:
- "PS-068 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_directory_allowlist_manager
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0053
preserved_exact_tokens:
- "External directory allowlist manager"
- "external directory allowlist"
- "Scrollable list"
- "wildcard support"
- "Add path"
- "native directory picker"
- "Per-row delete"
- "Home expansion display"
- "~ patterns"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FileSafe.md"
- "Plans/FinalGUISpec.md"
```

### PS-069 - Doom Loop Policy Display Config

```yaml
plan_unit_id: PS-069
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The doom_loop policy card shows current allow, ask, or deny action, a repeat threshold spinner with default 3 and range 2-10, and explanation text for identical-input repeat triggering."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-034
- PS-063
unblocks: []
acceptance_criteria:
- "PS-069 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: doom_loop_policy_display_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0054
preserved_exact_tokens:
- "doom_loop"
- "policy display/config"
- "allow"
- "ask"
- "deny"
- "Repeat threshold"
- "spinner"
- "default 3"
- "range 2–10"
- "same tool is called with identical input N consecutive times"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-070 - Per Persona Override Editor

```yaml
plan_unit_id: PS-070
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Persona-specific permission profiles are listed, created, edited, and deleted from the Permissions surface, with tool override counts and default_permissions_profile integration in Persona management."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-055
- PS-063
unblocks: []
acceptance_criteria:
- "PS-070 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: persona_permission_profile_editor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0055
preserved_exact_tokens:
- "Per-Persona override editor"
- "permission-profiles"
- "Create profile"
- "tool count"
- "edit/delete"
- "Plans/Personas.md §4"
- "default_permissions_profile"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Personas.md"
- "Plans/FinalGUISpec.md"
```

### PS-071 - Permission Scope Selector UI

```yaml
plan_unit_id: PS-071
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The Permissions scope selector exposes Global, Project, Package, Seam, and Lane scopes when applicable, prevents orphan project rules when no project is active, saves selected scope files, and displays effective layer-of-origin badges."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-021
- PS-055
- PS-064
unblocks: []
acceptance_criteria:
- "PS-071 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_scope_selector_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0056
preserved_exact_tokens:
- "Scope selector"
- "Global"
- "Project"
- "Package"
- "Seam"
- "Lane"
- "/disabled"
- "selected scope"
- "layer-of-origin badges"
- "project-scoped rules"
negative_constraints:
- "Durable always approval scope selection must not offer Project when no active project context exists."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/FinalGUISpec.md"
```

### PS-072 - Cross Surface Permission Mutation Parity

```yaml
plan_unit_id: PS-072
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Settings GUI, command palette, API/CLI, and automation surfaces all mutate permission rules through the same canonical permission commands and storage records."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-056
- PS-071
unblocks: []
acceptance_criteria:
- "PS-072 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_mutation_command_storage_parity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0056
preserved_exact_tokens:
- "Settings GUI"
- "command-palette"
- "API/CLI"
- "automation surfaces"
- "canonical permission commands"
- "storage records"
- "durable approval creation"
- "revocation"
- "inspection"
negative_constraints:
- "GUI-only affordances must not become the sole management path for durable approval creation, revocation, or inspection."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/Commands_System.md"
```

### PS-073 - Permissions ELI5 Expert Copy Modes

```yaml
plan_unit_id: PS-073
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permissions UI follows app-level Expert and ELI5 Interaction Mode, with simplified ELI5 views and full Expert sections plus tooltip.permissions.* tooltip namespace."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-063
unblocks: []
acceptance_criteria:
- "PS-073 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permissions_copy_mode
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0057
preserved_exact_tokens:
- "ELI5/Expert copy"
- "Interaction Mode"
- "Expert/ELI5"
- "ELI5"
- "Expert"
- "tooltip.permissions.*"
- "Granular rules"
- "profile editor"
- "allowlist manager"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-074 - Permission Trust Boundaries Threat Model

```yaml
plan_unit_id: PS-074
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The security model defines the Permissions trust boundaries across user intent, runtime policy/projection/audit machinery, tool execution backends, and external services, and tracks prompt injection, privilege escalation, and data exfiltration threats."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-015
- PS-017
unblocks: []
acceptance_criteria:
- "PS-074 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_threat_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0058
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0059
preserved_exact_tokens:
- "Security model"
- "Trust boundaries and threat model"
- "user intent"
- "explicit approval surfaces"
- "Puppet Master runtime policy"
- "projection"
- "audit machinery"
- "tool execution backends"
- "external services"
- "Prompt injection"
- "Privilege escalation"
- "Data exfiltration"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-075 - Capability Gates And Sandbox Boundaries

```yaml
plan_unit_id: PS-075
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission allow is necessary but insufficient: tools must be capability-registered, unregistered tools remain non-runnable, file tools stay scoped to roots unless policy broadens access, and web tools honor domain allowlists and web-operation scope keys."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-017
- PS-028
- PS-035
unblocks: []
acceptance_criteria:
- "PS-075 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: capability_sandbox_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0060
preserved_exact_tokens:
- "Capability gates and sandbox boundaries"
- "capability-registered"
- "permission-allowed"
- "unregistered tools"
- "non-runnable"
- "bash"
- "project root"
- "working roots"
- "domain allowlists"
- "web-operation scope keys"
negative_constraints:
- "Unregistered tools remain non-runnable even if a rule says allow."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/FileSafe.md"
```

### PS-076 - Permission Audit Trail Records

```yaml
plan_unit_id: PS-076
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Every operationally meaningful permission grant, deny, or prompt writes a seglog audit record with at least tool_pattern, decision, scope, and requesting_context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-043
- PS-055
unblocks: []
acceptance_criteria:
- "PS-076 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_audit_trail
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0061
preserved_exact_tokens:
- "Audit trail"
- "seglog"
- "tool_pattern"
- "decision"
- "scope"
- "requesting_context"
- "durable-rule creation"
- "inherited narrowing"
- "denied/externalized execution attempts"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-077 - OpenCode Reference Boundary

```yaml
plan_unit_id: PS-077
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "External OpenCode behavior is reference-only and may inform terminology, but it does not override PM-native terminology, approval ladder, preset matrix, or batch permission behavior owned by Permissions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-002
- PS-019
- PS-040
unblocks: []
acceptance_criteria:
- "PS-077 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: opencode_reference_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0063
preserved_exact_tokens:
- "OpenCode baseline and Puppet Master deltas"
- "External OpenCode behavior"
- "reference-only"
- "PM-native terminology"
- "approval ladder"
- "preset matrix"
- "batch permission behavior"
negative_constraints:
- "External design evidence does not override Puppet Master permission canon."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md"
compatibility_only_notes:
- "External OpenCode examples are terminology and lineage reference only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
- "Plans/Tools.md"
```

### PS-078 - Puppet Master Permission Deltas

```yaml
plan_unit_id: PS-078
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Puppet Master permission deltas preserve deny, once, for session, and always actions, keep read-only and plan web operations at ask, and make batch web For Session grants domain-scoped for all unique domains in scope."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-019
- PS-031
- PS-047
unblocks: []
acceptance_criteria:
- "PS-078 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: pm_permission_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0064
preserved_exact_tokens:
- "Puppet Master deltas"
- "deny | once | for session | always"
- "read-only"
- "plan web operations"
- "ask"
- "batch web approvals"
- "all unique domains"
- "For Session"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-079 - Deny Scope Acceptance Alignment

```yaml
plan_unit_id: PS-079
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "AC-PM07 binds deny response cascade to the current blocked episode and only to other pending asks with exactly matching approval_scope_key."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-005
- PS-006
- PS-042
unblocks: []
acceptance_criteria:
- "PS-079 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: deny_scope_acceptance_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0065
preserved_exact_tokens:
- "AC-PM07"
- "deny"
- "current blocked episode"
- "pending asks"
- "approval_scope_key"
negative_constraints:
- "Deny cannot reject nonmatching pending asks."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-080 - Deterministic Resolution Acceptance Group

```yaml
plan_unit_id: PS-080
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM01, AC-PM02, AC-PM03, AC-PM10, AC-PM13, and AC-PM14 cover deterministic resolution, precedence layer ordering, last-match wins, mode override behavior, scope specificity, and context narrowing."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-020
- PS-021
- PS-024
- PS-047
- PS-050
unblocks: []
acceptance_criteria:
- "PS-080 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: deterministic_resolution_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "Acceptance criteria"
- "ACCEPTANCE"
- "AC-PM01"
- "AC-PM02"
- "AC-PM03"
- "AC-PM10"
- "AC-PM13"
- "AC-PM14"
- "deterministic"
- "Persona override"
- "last-match-wins"
- "yolo"
- "ask/plan"
- "lane"
- "seam"
- "package"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
```

### PS-081 - Guard Defaults And Web Key Acceptance Group

```yaml
plan_unit_id: PS-081
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM04, AC-PM05, AC-PM08, and AC-PM12 cover doom_loop, external_directory, .env deny defaults, and derived web-operation permission keys."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-028
- PS-034
- PS-035
- PS-047
unblocks: []
acceptance_criteria:
- "PS-081 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: guard_default_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM04"
- "AC-PM05"
- "AC-PM08"
- "AC-PM12"
- "doom_loop"
- "external_directory"
- ".env"
- ".env.*"
- ".env.example"
- "webextract:{domain}"
- "webresearch:{query_category}"
- "webcrawl:{domain}"
- "webmap:{domain}"
- "registrable-domain"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
```

### PS-082 - Approval Persistence And GUI Acceptance Group

```yaml
plan_unit_id: PS-082
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criteria AC-PM06, AC-PM09, and AC-PM11 cover always approval scope, Permissions tab display/edit/persist behavior, durable approval record persistence, restart survival, and revocation."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-041
- PS-056
- PS-063
- PS-064
- PS-065
- PS-071
unblocks: []
acceptance_criteria:
- "PS-082 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: approval_gui_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM06"
- "AC-PM09"
- "AC-PM11"
- "Settings → Permissions"
- "cmd.permissions.revoke"
- "tool_pattern"
- "action"
- "scope_key?"
- "created_at"
- "created_by_thread_id"
negative_constraints:
- "always must not create a blind session-wide allow."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
- "Plans/FinalGUISpec.md"
```

### PS-083 - Capability Gate And Audit Acceptance

```yaml
plan_unit_id: PS-083
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Acceptance criterion AC-PM15 requires permission execution to be capability-gated as well as permission-gated and requires seglog audit entries for grants, denials, and prompts with tool_pattern, decision, scope, and requesting_context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-075
- PS-076
unblocks: []
acceptance_criteria:
- "PS-083 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: capability_audit_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0066
preserved_exact_tokens:
- "AC-PM15"
- "capability-gated"
- "permission-gated"
- "seglog"
- "grant"
- "deny"
- "prompt"
- "tool_pattern"
- "decision"
- "scope"
- "requesting_context"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Progression_Gates.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Progression_Gates.md"
- "Plans/storage-plan.md"
```

### PS-084 - External Publish Addendum Guard Coverage

```yaml
plan_unit_id: PS-084
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The DockerHub and Unraid addendum extends special-guard, tool-key, and default sections for remote publication and managed template-repo mutation coverage, reinforcing external_publish_side_effect rather than creating a rival owner."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
- PS-036
unblocks: []
acceptance_criteria:
- "PS-084 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_addendum_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0068
preserved_exact_tokens:
- "DockerHub / Unraid remote-side-effect guard addendum"
- "external_publish_side_effect"
- "DockerHub repository creation"
- "DockerHub image push"
- "managed remote template repo"
- "remote push"
- "publication visibility"
- "remote repository state"
- "remote distribution state"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- "This source addendum reinforces PS-036 and does not create a competing owner for external publish guard semantics."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-085 - External Publish Non Bypassable Behavior

```yaml
plan_unit_id: PS-085
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Local build approval and enabled defaults do not approve later remote publication, external_publish_side_effect defaults to ask, is non-bypassable, and cannot be globally suppressed by yolo or session-scoped always approvals."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-036
- PS-084
unblocks: []
acceptance_criteria:
- "PS-085 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_non_bypassable_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0069
preserved_exact_tokens:
- "push_policy = after_build"
- "Default action: ask"
- "non-bypassable"
- "yolo"
- "Session-scoped always"
- "Build click"
- "remote publication"
- "enabled defaults"
negative_constraints:
- "yolo mode must not auto-allow external_publish_side_effect."
- "Session-scoped always approvals must not suppress this guard globally."
- "Earlier local-only actions or enabled defaults do not implicitly approve follow-on remote side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
```

### PS-086 - Exact Publish Action Approval UI Examples

```yaml
plan_unit_id: PS-086
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Direct user clicks approve only the exact publish, create, or push side effect requested, preserving examples that Push image does not auto-approve creating a missing DockerHub repo or pushing a managed Unraid template repo unless that was the exact action."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, settings UI, GUI controls, or copy behavior."
split_recommended: false
depends_on:
- PS-037
- PS-085
unblocks: []
acceptance_criteria:
- "PS-086 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: exact_publish_action_approval
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0069
preserved_exact_tokens:
- "direct user click"
- "exact publish/create/push button"
- "Push image"
- "DockerHub repo"
- "managed Unraid template repo"
- "one requested side effect only"
- "Follow-on side effects"
negative_constraints:
- "One clicked publish action cannot auto-approve different follow-on side effects."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-087 - External Publish Failure Preservation

```yaml
plan_unit_id: PS-087
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When the external publish guard is rejected, local build results and template edits remain intact, remote side effects do not execute, and the runtime surfaces a corrected error naming the blocked remote step."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-037
- PS-085
unblocks: []
acceptance_criteria:
- "PS-087 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_failure_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0070
preserved_exact_tokens:
- "Failure behavior"
- "local build results remain intact"
- "local template generation/editing remains intact"
- "remote side effects do not execute"
- "corrected error"
- "blocked remote step"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
```

### PS-088 - External Publish Key And Default Additions

```yaml
plan_unit_id: PS-088
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "The tool and special-guard key list and defaults table include external_publish_side_effect as a Guard with default ask for remote publication and remote repository mutation."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-033
- PS-038
- PS-057
- PS-084
unblocks: []
acceptance_criteria:
- "PS-088 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_publish_key_default_additions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0071
preserved_exact_tokens:
- "Canonical key/default additions"
- "Key"
- "Category"
- "Scope"
- "Notes"
- "Default"
- "Rationale"
- "external_publish_side_effect"
- "Guard"
- "Remote publication and remote repo mutation"
- "ask"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
```

### PS-089 - Policy Denied Outcomes Are Blocked Outcomes

```yaml
plan_unit_id: PS-089
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When the permission layer prevents execution, runtime treats the result as blocked or denied rather than generic failure, including deny rules, user ask rejection, headless ask-to-deny, and external_publish_side_effect blocks."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, compatibility, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-042
- PS-076
- PS-084
unblocks: []
acceptance_criteria:
- "PS-089 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_207
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: policy_denied_blocked_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0073
preserved_exact_tokens:
- "Runtime blocked-Outcome Integration Addendum (2026-03-08)"
- "Policy-denied outcomes are blocked outcomes"
- "blocked/denied"
- "generic failure"
- "deny rules"
- "user rejection of `ask`"
- "headless `ask -> deny`"
- "external_publish_side_effect blocks"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
```

### PS-090 - Blocked Recovery Payload Schema And Alias Closure

```yaml
plan_unit_id: PS-090
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission blocked and denied outcomes expose canonical blocked-state payload fields, blocked family, guard details, allowed_action_ids[], optional approval and snapshot refs, revalidation status, and executed: false; legacy recovery_options[] and allowed_actions[] are compatibility aliases only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-042
- PS-089
unblocks: []
acceptance_criteria:
- "PS-090 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_payload_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "blocked_family"
- "blocked_policy"
- "blocked_approval"
- "blocked_preflight"
- "blocked_governance"
- "blocked_reason_code"
- "guard_name?"
- "allowed_action_ids[]"
- "approval_scope_key?"
- "approval_target_ref?"
- "permission_snapshot_id?"
- "runtime_identity_context?"
- "revalidation_required?"
- "executed: false"
- "recovery_options[]"
- "allowed_actions[]"
negative_constraints:
- "Runtime payload field names are closed; legacy recovery_options[] and allowed_actions[] must not replace allowed_action_ids[] in new blocked or recovery payloads."
- "Prose-only recovery hints are non-conforming when allowed_action_ids[] are required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes:
- "legacy recovery_options[] and allowed_actions[] are compatibility aliases only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/Contracts_V0.md"
- "Plans/storage-plan.md"
- "Plans/Decision_Policy.md"
```

### PS-091 - Approval Surface Action Semantics

```yaml
plan_unit_id: PS-091
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Approval surfaces in chat, dialogs, and cards summarize the exact target, scope, and drift boundary while mapping UI labels to canonical one-shot approval, reusable scope or session approval when policy allows, and deny or decline semantics."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-031
- PS-042
- PS-090
unblocks: []
acceptance_criteria:
- "PS-091 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_recovery_action_surface_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "approval surfaces"
- "chat/dialogs/cards"
- "exact target"
- "scope"
- "drift boundary"
- "one-shot approval"
- "reusable scope/session approval"
- "deny/decline"
negative_constraints:
- "UI labels may vary, but exposed actions must map to canonical approval and deny semantics rather than local enum families."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/FinalGUISpec.md"
```

### PS-092 - Domain Sensitive Approval Classes

```yaml
plan_unit_id: PS-092
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Domain-sensitive operational sessions and remote mutations use separate permission classes, so generic tool allow, /session/YOLO, or headless defaults never approve SCM destructive actions, workflow admin CRUD, image or template publish, Kubernetes mutations, docker exec or attach, kubectl exec, or kubectl port-forward."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-018
- PS-037
- PS-084
- PS-085
unblocks: []
acceptance_criteria:
- "PS-092 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: domain_sensitive_approval_classes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "docker exec"
- "docker attach"
- "kubectl exec"
- "kubectl port-forward"
- "/force-push/prune/destructive"
- "workflow /cancel/rerun/admin CRUD"
- "image push"
- "repo create"
- "template push"
- "Kubernetes /delete/exec/port-forward"
- "domain approval class"
negative_constraints:
- "Generic tool allow, /session/YOLO, or headless defaults never approve domain-sensitive remote side effects."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
```

### PS-093 - Queued Approval Preflight Binding

```yaml
plan_unit_id: PS-093
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "/queued and background approval requests bind to the exact queued attempt, target, guard, and preflight snapshot; resumption can pause one node, block the run, or block a follow-on step, but it always re-runs preflight when target, policy, or permission snapshot may have changed."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-006
- PS-042
- PS-090
unblocks: []
acceptance_criteria:
- "PS-093 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: queued_approval_preflight_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "/queued"
- "background approval requests"
- "exact queued attempt"
- "target"
- "guard"
- "preflight snapshot"
- "re-runs preflight"
negative_constraints:
- "Approval reuse must not resume a queued attempt without re-running preflight when target, policy, or permission snapshot may have changed."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
```

### PS-094 - Per Target Mutating Operation Dedupe

```yaml
plan_unit_id: PS-094
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Mutating actions use a per-target in-flight operation key for /dedupe across the main window, detached windows, Dashboard, and Orchestrator shortcuts; identical operations coalesce and conflicting operations surface operation_in_progress with owning target and action context."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-037
- PS-089
unblocks: []
acceptance_criteria:
- "PS-094 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: mutating_operation_dedupe
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "per-target in-flight operation key"
- "/dedupe"
- "main window"
- "detached windows"
- "Dashboard"
- "Orchestrator shortcuts"
- "operation_in_progress"
negative_constraints:
- "Conflicting mutating operations must not silently coalesce as if they were identical operations."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/Orchestrator_Page.md"
```

### PS-095 - Stable Target Revalidation Refresh

```yaml
plan_unit_id: PS-095
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Every mutating action revalidates stable target identity immediately before execution, including stale table rows, stale cards, and stale /selections; material target changes abort with state_changed_refresh_required and require refresh or reselection."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-011
- PS-094
unblocks: []
acceptance_criteria:
- "PS-095 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: stable_target_revalidation_refresh
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "stable target identity"
- "stale table rows"
- "stale cards"
- "stale /selections"
- "state_changed_refresh_required"
- "refresh"
- "reselection"
negative_constraints:
- "A stale visible target must not be treated as authoritative for mutation after material target identity changes."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale rows, cards, and /selections require refresh or reselection before mutation."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
```

### PS-096 - Indeterminate Remote Outcome Recovery

```yaml
plan_unit_id: PS-096
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Remote-side-effect transports may end as indeterminate_remote_outcome when server-side action might have succeeded but the client lost confirmation; the receipt preserves requested, transport_lost, and later reconciled states, and the UI exposes a Refresh remote state recovery CTA instead of labeling the action simply failed."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-089
- PS-095
unblocks: []
acceptance_criteria:
- "PS-096 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: indeterminate_remote_outcome_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "indeterminate_remote_outcome"
- "requested"
- "transport_lost"
- "reconciled"
- "Refresh remote state"
- "recovery CTA"
negative_constraints:
- "Indeterminate remote outcomes must not be labeled simply failed when reconciliation is required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/assistant-chat-design.md"
- "Plans/storage-plan.md"
```

### PS-097 - Permission Snapshot Lifecycle

```yaml
plan_unit_id: PS-097
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "A permission snapshot captures resolved permission state before durable attempt or run start, remains immutable, and creates new snapshot and lineage entries after approval, policy, mode, project, account, target, or runtime-identity changes before retry or resume."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-006
- PS-055
- PS-076
unblocks: []
acceptance_criteria:
- "PS-097 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_snapshot_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "permission snapshot"
- "snapshot_id"
- "attempt_id"
- "node_id"
- "captured_at"
- "attempt.started"
- "immutable after creation"
- "retry"
- "resume"
negative_constraints:
- "Prior permission snapshots never mutate in place after later approval, policy, mode, project, account, target, or runtime-identity changes."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-098 - Permission Snapshot Context Schema

```yaml
plan_unit_id: PS-098
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission snapshot schema preserves approval scope and target refs, requested and effective account bindings, permission_decision_context, actor_surface_context, runtime_identity_context, and resolved_permissions with requested and effective state, downgrade reason, source, and effective value."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-004
- PS-006
- PS-021
- PS-097
unblocks: []
acceptance_criteria:
- "PS-098 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: permission_snapshot_context_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "approval_scope_key"
- "approval_target_ref"
- "requested_account_binding"
- "effective_account_binding"
- "account_switch_event_ref"
- "permission_decision_context"
- "actor_surface_context"
- "runtime_identity_context"
- "resolved_permissions"
- "requested_permission_state"
- "effective_permission_state"
- "downgrade_reason"
negative_constraints:
- "Consumers may index decision-context refs but must not collapse them into the runtime identity block."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### PS-099 - Snapshot Requested Effective Display Rules

```yaml
plan_unit_id: PS-099
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Historical run, attempt, chat, and audit views show the frozen permission snapshot that governed execution, including requested and effective permission states and downgrade reasons; current Settings state must not be presented as historical effective permission state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-022
- PS-098
unblocks: []
acceptance_criteria:
- "PS-099 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: requested_effective_snapshot_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "Historical run"
- "attempt"
- "chat"
- "audit views"
- "frozen permission snapshot"
- "current Settings state"
- "historical effective permission state"
negative_constraints:
- "Current Settings state must not be presented as historical effective permission state."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/storage-plan.md"
```

### PS-100 - Blocked Episode Identity Carry Through

```yaml
plan_unit_id: PS-100
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Permission snapshots preserve blocked-episode identity and scoped approval dimensions together, including blocked_sequence, execution_entity_id, lane_id, package_id, account_id, and ordered allowed_action_ids[] carry-through."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-008
- PS-021
- PS-042
- PS-097
unblocks: []
acceptance_criteria:
- "PS-100 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: blocked_episode_identity_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0074
preserved_exact_tokens:
- "blocked_sequence"
- "execution_entity_id"
- "lane_id"
- "package_id"
- "account_id"
- "allowed_action_ids"
- "ordered allowed_action_ids[]"
- "Permission carry-through"
negative_constraints:
- "Permission snapshots must not separate blocked-episode identity from scoped approval dimensions."
preserved_contractrefs:
- "ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
```

### PS-101 - External Side Effect Wakeup Chain

```yaml
plan_unit_id: PS-101
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "When HITL approval resolves external_side_effect_blocked, the approval handler emits prerequisite_resolved with wake_reason: approval_resolved and node or attempt identity; the scheduler performs an immediate event-driven wakeup pass rather than polling."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-089
- PS-100
unblocks: []
acceptance_criteria:
- "PS-101 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: external_side_effect_wakeup_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0075
preserved_exact_tokens:
- "external_side_effect_blocked"
- "prerequisite_resolved"
- "wake_reason: approval_resolved"
- "node_id"
- "attempt_id"
- "wakeup pass"
- "immediate event-driven wakeup"
- "not polling-based"
negative_constraints:
- "External-side-effect approval wakeup is immediate and event-driven, not polling-based."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### PS-102 - Target Bound Domain Preflight Revalidation

```yaml
plan_unit_id: PS-102
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Domain approval and preflight decisions bind exact mutable targets for SCM, GitHub Actions, Docker, and Kubernetes, run static policy and cheap /precondition before approval, and run execution-time /revalidate before mutation; stale preflight evidence or changed target identity invalidates reuse."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-092
- PS-093
- PS-101
unblocks: []
acceptance_criteria:
- "PS-102 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: target_bound_domain_preflight_revalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0076
preserved_exact_tokens:
- "project_id"
- "repo_id"
- "worktree_id"
- "/worktree/context"
- "branch"
- "commit"
- "repo_remote"
- "workflow_id"
- "run_id"
- "/environment"
- "runtime"
- "registry_host"
- "namespace"
- "/repository"
- "image_ref"
- "kube_context"
- "workload_ref"
- "resource_ref"
- "preflight_revision"
- "/precondition"
- "/revalidate"
negative_constraints:
- "Approval of an action name alone must not approve a changed or under-bound mutable target."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale-preflight evidence or changed target identity invalidates approval reuse and returns the action to blocked state."
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-103 - Admin Side Effect Guard Mappings

```yaml
plan_unit_id: PS-103
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Source Control, GitHub Actions, Docker Manager, Docker Hub, and Kubernetes admin or hosted side effects use canonical permission and blocked-state guard rules when approval, capability, or auth prerequisites are missing."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-084
- PS-088
- PS-089
- PS-102
unblocks: []
acceptance_criteria:
- "PS-103 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: admin_side_effect_guard_mappings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0077
preserved_exact_tokens:
- "Source Control, GitHub Actions, and Docker Manager Permission Addendum (2026-03-12)"
- "GitHub Actions rerun/cancel/dispatch"
- "admin CRUD"
- "Docker Hub repository creation"
- "image push"
- "managed template-repo create/push"
- "Kubernetes mutating actions"
- "external-side-effect guard model"
negative_constraints:
- "External-side-effect and admin-gated behavior for this packet must use canonical permission and blocked-state rules."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/Decision_Policy.md"
```

### PS-104 - Partial Auth Requested Effective Disclosure

```yaml
plan_unit_id: PS-104
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Requested versus effective capability disclosure remains visible whenever a surface control is disabled by partial auth or policy state."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-010
- PS-022
- PS-103
unblocks: []
acceptance_criteria:
- "PS-104 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: partial_auth_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0077
preserved_exact_tokens:
- "requested vs effective capability disclosure"
- "visible"
- "surface control"
- "disabled"
- "partial auth"
- "policy state"
negative_constraints:
- "Controls disabled by partial auth or policy state must not hide requested versus effective capability disclosure."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/GitHub_API_Auth_and_Flows.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-105 - Provider Exposure Permission Scrub Gate

```yaml
plan_unit_id: PS-105
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Provider and LLM exposure rules apply before diffs, hunks, logs, manifests, discovered URLs, screenshots, or equivalent content is sent to provider-backed features; exposure requires explicit permission, /data-class labeling, per-feature opt-in, local-only fallback, and secret-scrub before provider transmission."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-022
- PS-076
- PS-103
unblocks: []
acceptance_criteria:
- "PS-105 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: provider_exposure_permission_scrub_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Provider/LLM exposure"
- "diff"
- "conflict hunk"
- "workflow log"
- "container log"
- "manifest snippet"
- "inspect output"
- "workflow YAML preview"
- "manifest diff"
- "discovered URL"
- "screenshot"
- "explicit permission"
- "/data-class"
- "per-feature opt-in"
- "local-only fallback"
- "secret-scrub"
negative_constraints:
- "Secret scrubbing only before local persistence is insufficient for LLM or other provider features."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Provider_OpenCode.md"
- "Plans/Models_System.md"
```

### PS-106 - Redaction Profile View Export Evidence

```yaml
plan_unit_id: PS-106
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Review, diff, export, evidence/history, and provider features distinguish ephemeral in-memory view, scrubbed persisted blob, and user-exported file; persisted, indexed, screenshotted, exported, or evidence/history records preserve redaction profile, mandatory scrub status, and display-detail hiding rules."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-076
- PS-105
unblocks: []
acceptance_criteria:
- "PS-106 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: redaction_profile_view_export_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Review"
- "diff"
- "export"
- "/evidence/history"
- "ephemeral in-memory view"
- "scrubbed persisted blob"
- "user-exported file"
- "/screenshots"
- "redaction profile"
- "mandatory scrub"
negative_constraints:
- "Persisted, indexed, screenshotted, exported, or evidence/history content must not omit redaction profile and mandatory scrub metadata."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Project_Output_Artifacts.md"
- "Plans/Runtime_Artifacts_Panel.md"
```

### PS-107 - Remote Side Effect Receipt Provenance

```yaml
plan_unit_id: PS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Remote-side-effect receipts record approval_source, executing_subsystem, effective account, and credential handle for push, dispatch, admin changes, publish, repo creation, apply, rollout, and equivalent actions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-100
- PS-103
unblocks: []
acceptance_criteria:
- "PS-107 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: remote_side_effect_receipt_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Remote-side-effect receipts"
- "approval_source"
- "executing_subsystem"
- "effective account"
- "credential handle"
- "explicit confirm"
- "cached permission"
- "policy auto-allow"
- "browser fallback"
- "git"
- "GitHub API"
- "docker CLI"
- "kubectl"
- "SSH remote"
negative_constraints:
- "Remote-side-effect receipts must not omit provenance for approval source, executing subsystem, effective account, or credential handle."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-108 - Sensitive Metadata Export Masking

```yaml
plan_unit_id: PS-108
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Sensitive metadata minimization masks remote URLs, private repo names, registry namespaces, Docker Hub account identity, kube context names, namespace and workload names, discovered service URLs, port-forward endpoints, screenshots, and downloaded scrubbed artifacts by default unless the user explicitly chooses a fuller export profile."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-105
- PS-106
unblocks: []
acceptance_criteria:
- "PS-108 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: sensitive_metadata_export_masking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "remote URLs"
- "private repo names"
- "registry namespaces"
- "Docker Hub account identity"
- "kube context names"
- "namespace/workload names"
- "discovered service URLs"
- "port-forward endpoints"
- "screenshots"
- "downloaded scrubbed artifacts"
- "fuller export profile"
negative_constraints:
- "Exports and screenshots mask sensitive metadata by default unless the user explicitly chooses a fuller export profile."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Project_Output_Artifacts.md"
- "Plans/FinalGUISpec.md"
```

### PS-109 - Project Delete Residue Cleanup

```yaml
plan_unit_id: PS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "/logout/project-delete, unlink, and project-delete cleanup clear or invalidate non-secret residue that can identify the user or project, including validation snapshots, account identity, workflow admin receipts, registry capability snapshots, kube context selections, discovered endpoints, and downloaded scrubbed artifacts."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-055
- PS-076
- PS-107
unblocks: []
acceptance_criteria:
- "PS-109 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: project_delete_residue_cleanup
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "/logout/project-delete"
- "unlink"
- "project-delete cleanup"
- "non-secret residue"
- "validation snapshots"
- "last-used account identity"
- "workflow admin receipts"
- "registry capability snapshots"
- "kube context selections"
- "discovered endpoints"
- "downloaded scrubbed artifacts"
negative_constraints:
- "Project delete cleanup must not retain non-secret residue that can still identify the user or project."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-110 - Privileged Session Metadata Minimization

```yaml
plan_unit_id: PS-110
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Session-style privileged operations persist bounded metadata only for actor, target, timestamps, credential realm, transport, local bind address or port when relevant, and requested versus effective state; interactive transcript and stdin are not persisted by default."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-092
- PS-102
- PS-107
unblocks: []
acceptance_criteria:
- "PS-110 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: privileged_session_metadata_minimization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "docker exec/attach"
- "kubectl exec"
- "kubectl port-forward"
- "remote SCM-over-SSH mutation sessions"
- "browser/device auth handoffs"
- "actor"
- "target"
- "started/ended timestamps"
- "credential realm"
- "transport"
- "local bind address/port"
- "requested vs effective state"
- "interactive transcript"
- "stdin"
negative_constraints:
- "Do not persist interactive transcript or stdin by default for session-style privileged operations."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/storage-plan.md"
```

### PS-111 - Build Deploy Secret No Persist No Echo

```yaml
plan_unit_id: PS-111
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Build and deploy secret handling uses no-persist and no-echo rules for docker build secrets, build args, compose env files, registry auth helpers, kube Secret manifests, and generated deployment YAML containing sensitive values."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PS-105
- PS-108
unblocks: []
acceptance_criteria:
- "PS-111 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: build_deploy_secret_no_persist_no_echo
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Build/deploy secret-handling"
- "no-persist/no-echo"
- "docker build secrets"
- "build args"
- "compose env files"
- "registry auth helpers"
- "kube Secret manifests"
- "generated deployment YAML"
- "sensitive values"
negative_constraints:
- "Sensitive build and deployment values must not be echoed, persisted, rendered back in full, indexed, or included in receipts/evidence beyond allowed redacted identity."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PS-112 - Secret Rendering And ConfigMap Redaction

```yaml
plan_unit_id: PS-112
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Secret resources are never rendered back in full, indexed, or included in receipts or evidence beyond kind, name, namespace, and redacted status; ConfigMap rendering follows a separate configurable redaction policy because it may contain sensitive plaintext."
gui_related: true
gui_classification_reason: "This unit defines user-visible permission disclosure, approval presentation, GUI references, or compact surface wording."
split_recommended: false
depends_on:
- PS-108
- PS-111
unblocks: []
acceptance_criteria:
- "PS-112 remains addressable as a fine-grained Permissions System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_system_drift
reasoning_tier: standard
context_scope: permissions_system_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: secret_resource_rendering_redaction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0078
preserved_exact_tokens:
- "Secret resources"
- "kind/name/namespace"
- "redacted status"
- "ConfigMap rendering"
- "separate configurable redaction policy"
- "sensitive plaintext"
negative_constraints:
- "Secret resources are never rendered back in full, indexed, or included in receipts/evidence beyond kind, name, namespace, and redacted status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
- "Plans/FinalGUISpec.md"
```

### PS-001 - Permissions System Source-Preserving Bridge Retired

```yaml
plan_unit_id: PS-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "PS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 208 because Permissions_System-S0079 through S0082 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated PS-001 bridge, and Migration Coverage. Permissions_System-S0001 through S0078 are covered by PS-002 through PS-112 or explicit structural and split dispositions. PS-001 no longer carries source_preserving_planunit compile mode and must not own product coverage."
gui_related: false
gui_classification_reason: "The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related product tokens."
split_recommended: false
depends_on:
- PS-002
- PS-003
- PS-004
- PS-005
- PS-006
- PS-007
- PS-008
- PS-009
- PS-010
- PS-011
- PS-012
- PS-013
- PS-014
- PS-015
- PS-016
- PS-017
- PS-018
- PS-019
- PS-020
- PS-021
- PS-022
- PS-023
- PS-024
- PS-025
- PS-026
- PS-027
- PS-028
- PS-029
- PS-030
- PS-031
- PS-032
- PS-033
- PS-034
- PS-035
- PS-036
- PS-037
- PS-038
- PS-039
- PS-040
- PS-041
- PS-042
- PS-043
- PS-044
- PS-045
- PS-046
- PS-047
- PS-048
- PS-049
- PS-050
- PS-051
- PS-052
- PS-053
- PS-054
- PS-055
- PS-056
- PS-057
- PS-058
- PS-059
- PS-060
- PS-061
- PS-062
- PS-063
- PS-064
- PS-065
- PS-066
- PS-067
- PS-068
- PS-069
- PS-070
- PS-071
- PS-072
- PS-073
- PS-074
- PS-075
- PS-076
- PS-077
- PS-078
- PS-079
- PS-080
- PS-081
- PS-082
- PS-083
- PS-084
- PS-085
- PS-086
- PS-087
- PS-088
- PS-089
- PS-090
- PS-091
- PS-092
- PS-093
- PS-094
- PS-095
- PS-096
- PS-097
- PS-098
- PS-099
- PS-100
- PS-101
- PS-102
- PS-103
- PS-104
- PS-105
- PS-106
- PS-107
- PS-108
- PS-109
- PS-110
- PS-111
- PS-112
unblocks: []
acceptance_criteria:
- "Permissions_System-S0001 through S0078 remain mapped to fine-grained Permissions System PlanUnits or explicit structural dispositions rather than PS-001."
- "Permissions_System-S0079 through S0082 are generated standardization tail material or retired bridge lineage, not product implementation coverage."
- "PS-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: permissions_system_generated_tail_batch_208
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0079
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0080
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0081
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Permissions_System-S0082
preserved_exact_tokens:
- "source_preserving_planunit"
- "Permissions System (Canonical SSOT) Source-Preserving PlanUnit"
- "Permissions_System-S0079"
- "Permissions_System-S0082"
- "Migration Coverage"
- "PlanUnits"
- "Owner / Consumer Map"
negative_constraints:
- "PS-001 must not provide product implementation coverage for Permissions_System-S0001 through S0078 after Phase 2B batch 208."
- "PS-001 must not override PS-002 through PS-112 or later fine-grained Permissions System PlanUnits."
- "Do not rely on one coarse source_preserving_planunit as the final implementation standard for Permissions_System.md."
preserved_contractrefs:
- "ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated PS-001 span are lineage only and are not promoted as active ContractRefs."
compatibility_only_notes:
- "The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former PS-001 bridge, and Migration Coverage tail spans only."
stale_retired_dispositions:
- "Former generated source-preserving bridge material is retired as migration lineage only."
owner_hints:
- Plans/Permissions_System.md
```

## Migration Coverage

Original hash: `7d57d29a08eee4d90cd25bb6d060b5ad46b82d48ac4dd95e4167e1818fed9134`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

The initial source-preserving standardization preserved `Permissions_System-S0001` through `Permissions_System-S0078` in place under `PS-001`. Phase 2B batch 205 supersedes that coarse mapping for `Permissions_System-S0001` through `Permissions_System-S0027` with fine-grained PlanUnits `PS-002` through `PS-027`, including split coverage for mixed GUI/backend span `Permissions_System-S0009` and precedence span `Permissions_System-S0021`. `PS-001` is narrowed to residual source-preserving coverage for `Permissions_System-S0028` through `Permissions_System-S0078` only and must not override the fine-grained units. Batch 205 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

Phase 2B batch 206 atomized `Permissions_System-S0028` through `Permissions_System-S0046` into fine-grained PlanUnits `PS-028` through `PS-059`, including split coverage for mixed spans `Permissions_System-S0028`, `S0032`, `S0034`, `S0035`, `S0036`, `S0041`, and `S0042`, and structural carry-through for container headings `Permissions_System-S0037` and `S0045`. `PS-001` is narrowed to residual source-preserving coverage for `Permissions_System-S0047` through `Permissions_System-S0078` only and must not override the fine-grained units. Batch 206 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

Phase 2B batch 207 atomized `Permissions_System-S0047` through `Permissions_System-S0073` into fine-grained PlanUnits `PS-060` through `PS-089`, including split coverage for mixed spans `Permissions_System-S0048`, `S0052`, `S0056`, `S0066`, and `S0069`, and structural carry-through for container headings `Permissions_System-S0058` and `S0072`. `PS-001` is narrowed to residual source-preserving coverage for `Permissions_System-S0074` through `Permissions_System-S0078` only and must not override the fine-grained units. Batch 207 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
Phase 2B batch 208 atomized `Permissions_System-S0074` through `Permissions_System-S0078` into fine-grained PlanUnits `PS-090` through `PS-112`, including split coverage for recovery-option payloads, permission snapshots, Source Control/GitHub Actions/Docker Manager addendum behavior, provider exposure, remote-side-effect provenance, sensitive metadata masking, privileged-session metadata minimization, and secret redaction. Batch 208 structurally dispositioned generated tail spans `Permissions_System-S0079`, `Permissions_System-S0080`, and `Permissions_System-S0082`, and retired generated bridge span `Permissions_System-S0081` through `PS-001` as migration-lineage-only compatibility residue. `PS-001` no longer uses `source_preserving_planunit` mode and must not own product coverage. Batch 208 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-002

### PS-113 - Approval Scope Level And Cross-Boundary Carryover

```yaml
plan_unit_id: PS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permission approval reuse must resolve through an `approval_scope_key` schema derived from the
  runtime identity envelope plus tool/context/mode and including actor, lane, package, project, run,
  account, tool, context, mode, requested identity, effective identity, execution_role, and
  `approval_scope_level` inputs. Default carryover is narrow lane/run/actor scope: an approval must
  not cross lane, run, project, or account boundaries unless `approval_scope_level` explicitly
  permits that boundary, the scoped key records it, and the target permission class allows carryover.
  Reject-cascade must evaluate the same scoped key instead of a single-session or single-lane
  assumption.
gui_related: false
gui_classification_reason: Approval scope keys and reject-cascade behavior are permission/runtime contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - "`approval_scope_key` has a defined schema from the runtime identity envelope over actor/lane/package/project/run/account/tool/context/mode/requested/effective identity/execution_role/approval_scope_level."
  - Default carryover remains narrow lane/run/actor scope; crossing lane, run, project, or account boundaries requires explicit `approval_scope_level`, scoped key coverage, and permission-class allowance.
  - Reject-cascade is evaluated against scoped keys rather than global session state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: approval_scope_overreach
reasoning_tier: high
context_scope: permissions_approval_scope
implementation_surfaces: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/human-in-the-loop.md]
node_compile_hint: {mode: approval_scope_key_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0032
  - pldg-20260614-002-part-3-fable-cleanup:atom-0048
preserved_exact_tokens: ["Approval Scope Key", "approval_scope_key", "runtime identity envelope", "tool/context/mode", "narrow lane/run/actor default carryover", "approval_scope_level", "crossing lane, run, project, or account boundaries", "actor/lane/run/account", "session approval carryover", "reject-cascade", "single-session/single-lane"]
negative_constraints:
  - Do not allow approval reuse from a provider session id alone.
  - Do not allow implicit cross-lane, cross-run, cross-project, or cross-account approval carryover.
  - Do not preserve single-session/single-lane reject-cascade behavior without actor/lane/run/account identity scope.
owner_hints: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/human-in-the-loop.md]
```

## Ledger Compile Addendum - pldg-20260616-001

### PS-114 - Goal Runtime Approval Scope Consumer

```yaml
plan_unit_id: PS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns existing approval-scope, permission snapshot, approval reuse, and blocked-action payload rules consumed by Goal Runtime high-risk actions. Goal Runtime invokes approval and blocks invisible goals outside predeclared authority, but it does not redefine the permission ladder, approval-scope carryover, or blocked payload schema.
gui_related: false
gui_classification_reason: Approval scope, permission snapshots, and blocked-action payloads are permission/runtime policy, not visual presentation.
depends_on:
  - PS-113
  - CV-286
  - GRS-020
unblocks: []
acceptance_criteria:
  - Goal Runtime approval requests use permission-owned approval scope and permission snapshot semantics.
  - Invisible/internal goals block outside predeclared authority instead of inventing local permission rules.
  - Approval reuse and blocked-action payloads follow Permissions_System carryover and permission-ladder rules.
  - Goal Runtime source atoms support the approval boundary; Permissions_System remains the owner for approval-scope key shapes, snapshots, reuse, and blocked payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime permission/approval review
risk_class: goal_runtime_permission_scope_drift
reasoning_tier: high
context_scope: goal_runtime_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: goal_runtime_approval_scope_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0008
  - pldg-20260616-001-goal-runtime-system:atom-0108
  - pldg-20260616-001-goal-runtime-system:dec-0022
preserved_exact_tokens:
  - "approval_scope_key"
  - "permission snapshot"
  - "approval reuse"
  - "blocked-action payload"
  - "predeclared authority"
  - "explicit user approval"
negative_constraints:
  - Do not let Goal Runtime redefine the permission ladder.
  - Do not let invisible/internal goals exceed predeclared authority.
  - Do not infer new permission payload schemas solely from Goal Runtime approval-boundary atoms.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
```

## Ledger Compile Addendum - pldg-20260616-002

### PS-115 - GoalRun Write Authority And Lane Blockers

```yaml
plan_unit_id: PS-115
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns GoalRun write authority checks for read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer modes, plus blocked-action payloads for missing lane bindings, overlapping worktree leases, unsafe/destructive scope, and invisible/internal goals that exceed predeclared authority. Permission decisions consume capability_lane and write_mode from contract/storage runtime records and return recoverable blockers where user, Settings, worktree, or approval action can resolve the issue.
gui_related: false
gui_classification_reason: Write authority and blocker payloads are permission/runtime policy; GUI surfaces consume their visible projections.
depends_on:
  - PS-114
  - MS-109
unblocks: []
acceptance_criteria:
  - Permission checks consume write_mode values read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer.
  - Missing capability lanes and overlapping write surfaces produce typed blockers.
  - Invisible/internal goals cannot exceed predeclared authority.
  - Recoverable blockers name the user, Settings, worktree, or approval action needed to proceed.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalRun permission/blocker review
risk_class: goalrun_write_authority_drift
reasoning_tier: high
context_scope: goalrun_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goalrun_write_authority
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0037
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "read_only"
  - "proposal_only"
  - "patch_only"
  - "isolated_worktree"
  - "leased_writer"
  - "parent_writer"
  - "capability_lane"
  - "write_mode"
  - "unconfigured-lane"
negative_constraints:
  - Do not let invisible/internal goals exceed predeclared authority.
  - Do not allow overlapping live writes without a permission-owned lease decision.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/WorktreeGitImprovement.md
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PS-116 - Plans-To-Code Critical Escalation And External Effects

```yaml
plan_unit_id: PS-116
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns critical user-escalation and external-effect policy for plans-to-code execution. Default hands-off execution escalates to the user only for missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval. Execution policy must define network access policy, secret access policy, filesystem write policy, destructive command policy, database/test-data policy, browser profile isolation, real-account versus sandbox-account policy, credential redaction, and artifact privacy/retention policy before risky WorkNode execution proceeds.
  Policy field names include network_access_policy, secret_access_policy, and destructive_command_policy, and critical blockers include configured checkpoints only when explicit HITL or approval policy calls for them.
gui_related: false
gui_classification_reason: Permission, approval, network, secrets, destructive command, and privacy policy are security/runtime behavior.
depends_on: [PS-115]
unblocks: [EP-102, GRS-030, HITL-036]
acceptance_criteria:
  - Default user escalation is critical-only.
  - Network, secrets, filesystem writes, destructive commands, database/test data, browser profile isolation, real/sandbox account, credential redaction, and artifact privacy/retention are explicit policy surfaces.
  - Permission blockers name recoverable user, Settings, worktree, or approval action when one exists.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future external-effects policy validation
risk_class: unsafe_external_effect
reasoning_tier: high
context_scope: plans_to_code_permissions
implementation_surfaces: [Plans/Permissions_System.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md, Plans/FileSafe.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: critical_escalation_external_effects, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:atom-0049
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:dec-0021
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "critical authority blockers"
  - "credentials/secrets"
  - "billing/payment/legal/license"
  - "unsafe destructive operation"
  - "irreversible external side effect"
  - "security-sensitive approval"
  - "network access policy"
  - "secret access policy"
  - "destructive command policy"
  - "browser profile isolation"
  - "credential redaction"
negative_constraints:
  - Do not ask the user for ordinary row-level uncertainty in default mode.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/FileSafe.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PS-117 - Planning Setup Authority, Remote Context, Secrets, And Testing Permissions

```yaml
plan_unit_id: PS-117
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback. Planning, PRD, Plan Pack, WorkNodeRequest, receipts, logs, and UI projections may identify required secret classes or permission scopes but must carry references or ephemeral handles rather than secret values. Test Capability Discovery searches current official
  and primary sources for appropriate live testing, hot reload, live preview, browser automation, GUI automation, simulator, emulator, device, cloud, accessibility, performance, security, and project-native testing methods relevant to the technology stack. Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent install. Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.'
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
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/human-in-the-loop.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0075
- pldg-20260618-001-prd-planning-wizard:atom-0079
- pldg-20260618-001-prd-planning-wizard:atom-0084
- pldg-20260618-001-prd-planning-wizard:atom-0087
- pldg-20260618-001-prd-planning-wizard:atom-0097
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0068
- atom-0070
- atom-0075
- atom-0079
- atom-0084
- atom-0087
- atom-0097
decision_refs:
- dec-0014
- dec-0015
- dec-0017
- dec-0019
correction_refs:
- corr-0013
preserved_exact_tokens:
- local path
- Git repository
- GitHub
- SSH
- authority
- receipt
- git init
- push
- PR creation
- remote host
- no silent local fallback
- secret reference
- ephemeral handle
- official sources
- live testing
- hot reload
- live preview
- privileged installation
- paid service
- license acceptance
- redaction
negative_constraints:
- Do not run against an unrelated local copy when remote context is active.
- Do not persist credentials or secret values in ledgers, Plans, compile artifacts, receipts, logs, or Orchestrator projections.
- Do not rely solely on stale internal model knowledge for current tools, versions, setup methods, or platform availability.
- Do not expose credentials, tokens, personal data, or protected project content through visible testing.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/human-in-the-loop.md
- Plans/Runtime_Artifacts_Panel.md
```

## Ledger Compile Addendum - pldg-20260622-001-fff

### PS-118 - Discovery Permission Snapshot, Host-Trust, And Redaction Fields

```yaml
plan_unit_id: PS-118
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissioned discovery requests, results, and receipts carry permission_snapshot_id, approval_scope_key, requested_remote_identity, effective_remote_identity, host_trust_state or known-host outcome, credential_handle_ref without secret material, remote_command_policy_result, and redaction_profile where applicable. Remote manifest discovery is permission/FileSafe-gated before dispatch, and SSH auth failures, passphrase prompts, known-host changes, remote command denial, host unavailable, manifest missing, and approval-required states emit explicit fallback/error receipts plus user-visible prompts or degraded states where appropriate; they never silently become fresh local success results.
gui_related: false
gui_classification_reason: This is permission, SSH trust, credential-handle, and redaction contract ownership; prompt presentation is consumed by GUI docs.
depends_on: [PS-097, PS-098, PS-105, PS-106, PS-110, PS-117, F2-191]
unblocks: [SP-218, ATS-011, ACD-422]
acceptance_criteria:
  - Discovery never stores or displays secret material in permission fields, cache keys, receipts, diagnostics, or prompts.
  - SSH known-host/auth/passphrase/remote-command failures are explicit policy states, not fresh local successes.
  - Receipts preserve permission snapshots and redaction profiles sufficient for audit without leaking protected paths or credentials.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future permission-gated discovery tests.
  - Future SSH auth, known-host, passphrase, remote command denial, and redaction tests.
risk_class: permission_trust_leak
reasoning_tier: high
context_scope: discovery_permission_envelope
implementation_surfaces: [Plans/Permissions_System.md, future DiscoveryService permission context, future SSH prompt flow]
node_compile_hint: {mode: permission_snapshot_trust_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0057
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/precision_contract.json#ssh_topology
source_atom_ids: [atom-0057, atom-0069, atom-0085, atom-0090, atom-0091]
preserved_exact_tokens: ["permission_snapshot_id", "approval_scope_key", "requested_remote_identity", "effective_remote_identity", "host_trust_state", "known-host outcome", "credential_handle_ref without secret material", "remote_command_policy_result", "redaction_profile", "passphrase prompts", "known-host changes", "remote command denial"]
negative_constraints:
  - Do not store or display secret material in discovery requests, cache keys, receipts, diagnostics, or prompts.
  - Do not allow permission or host-trust failure to become fresh local success results.
owner_hints: [Plans/Permissions_System.md, Plans/FileSafe.md, Plans/WorktreeGitImprovement.md, Plans/assistant-chat-design.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PS-120 - History Permission Redaction And Authority Gates

```yaml
plan_unit_id: PS-120
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: History action authority gates resume, retry, reopen, send-forward, compare, and export against
  currentness, archive/retention, projection freshness, project scope, and user permission. Raw records and evidence
  export requires an explicit evidence/redaction profile. Stale projection blocks compare/export/reopen/send-forward
  until rebuild succeeds. Authority-sensitive actions create or bind live continuations; they never mutate immutable
  historical records in place.
gui_related: true
gui_classification_reason: Defines visible permission/redaction profile choices and authority-blocked action states.
depends_on:
- OP-027
- POA-051
unblocks:
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_permission_leak
reasoning_tier: high
context_scope: history_permission_authority
implementation_surfaces:
- Plans/Permissions_System.md
- future History export/action permission prompts
node_compile_hint:
  mode: history_permission_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0018
- pldg-20260626-001-feature-name:atom-0027
- pldg-20260626-001-feature-name:atom-0042
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- pldg-20260626-001-feature-name:atom-0062
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-export-compare-archive-answers
- chat:history-degraded-mode-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0018
- atom-0027
- atom-0042
- atom-0058
- atom-0059
- atom-0062
decision_refs:
- dec-0003
- dec-0004
- dec-0007
- dec-0010
- dec-0011
- dec-0012
preserved_exact_tokens:
- resuming/retrying
- cloning as a new run
- historical orchestrator runs
- Reopen in Wizard
- Send forward when currentness allows
- currentness allows
- yes, and yes.
- raw records/evidence
- explicit evidence/redaction profile
- sounds good
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
- permissions/redaction profile details
- 'yes'
negative_constraints:
- Do not mutate immutable historical run/document identity in place.
- Do not resume or retry a stale historical run without currentness and authority checks.
- Do not treat clone-as-new-run as the same identity as the original historical run.
- Do not launch Plan Compile, Orchestrator execution, or mutable wizard state directly from stale historical documents
  without currentness checks.
- Do not mutate immutable approved packs or historical document records in place.
- Do not silently include raw records or evidence in ordinary exports.
- Do not bypass permissions or redaction policy when exporting evidence/raw records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
```

### PS-121 - Vision Bridge Image Disclosure Permission

```yaml
plan_unit_id: PS-121
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Before PM sends a local image or screenshot to a separate vision provider, it evaluates project
  policy, sensitivity/redaction state, source class, destination provider/account, and user disclosure permission.
  The popup offers choices like reject, accept, and always accept; exact wording may differ. Always accept is explicit,
  scoped by project_id, user/account identity, source class, destination provider/account or provider-family policy,
  tool id, and sensitivity/redaction class, then remains visible, auditable, and revocable/resettable. PM must not
  silently reroute images to a destination outside the accepted permission scope.
gui_related: true
gui_classification_reason: Defines the user-visible disclosure popup, reject/accept/always-accept choices, settings
  visibility, and revocation UI.
depends_on: []
unblocks:
- RAP-035
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_disclosure_leak
reasoning_tier: high
context_scope: vision_bridge_disclosure_permission
implementation_surfaces:
- Plans/Permissions_System.md
- future bridge disclosure popup
- future permission settings
node_compile_hint:
  mode: vision_bridge_permission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0077
- pldg-20260626-001-feature-name:atom-0079
- pldg-20260626-001-feature-name:atom-0083
- pldg-20260626-001-feature-name:atom-0085
- pldg-20260626-001-feature-name:atom-0087
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
source_atom_ids:
- atom-0077
- atom-0079
- atom-0083
- atom-0085
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- local images
- screenshots
- vision provider
- project policy
- permissions
- redaction
- sensitivity_state
- degraded
- 4. Yes
- reject
- accept
- always accept
- doesnt have to be that exact wording
- when you do always, it stops asking
- pop up
- project_id
- user/account identity
- source class
- destination provider/account
- provider-family policy
- tool id
- sensitivity/redaction class
- revocable/resettable
- 'yes'
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
negative_constraints:
- Do not silently send screenshots containing secrets or sensitive local/project context to another provider route.
- Do not bypass the existing tool permission model just because the bridge is model-assistive.
- Do not serialize revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not make always-accept global, irreversible, hidden, or impossible to revoke.
- Do not create an implicit always-accept rule without an explicit user choice.
- Do not make always-accept hidden, global by accident, irreversible, or impossible to audit.
- Do not keep prompting after an applicable always-accept rule exists.
- Do not make always-accept global across all projects, providers, users, source types, or sensitivity classes by
  accident.
- Do not create a hidden permission rule that cannot be inspected or revoked.
- Do not keep prompting after an applicable remembered permission exists.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/Project_Output_Artifacts.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/usage-feature.md
```

### PS-122 - Teach Guided Mutation Confirmation Gates

```yaml
plan_unit_id: PS-122
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Teacher can guide GUI use through safe route, highlight, focus, scroll, explain, and read-only inspect
  actions. Any mutation, external side effect, settings change, file write, provider disclosure, memory save, or
  command execution requires explicit confirmation or existing policy permission. Degraded states for permission
  denied, unavailable command, missing target, stale navigation, model fallback, missing help entry, or user stop
  must remain visible with a next action rather than silently proceeding.
gui_related: true
gui_classification_reason: Defines visible confirmation and permission gates for Teacher-guided GUI actions.
depends_on:
- CV-297
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_mutation_authority_drift
reasoning_tier: high
context_scope: teach_guided_permission_gates
implementation_surfaces:
- Plans/Permissions_System.md
- future Teacher guided action confirmations
node_compile_hint:
  mode: teach_guided_permission_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0098
- pldg-20260626-001-feature-name:atom-0126
- pldg-20260626-001-feature-name:atom-0142
- pldg-20260626-001-feature-name:atom-0144
- chat:teacher-feature-initial-framing
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md#ACD-410---Internal-Target-Payload-Navigation
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/Permissions_System.md#2.4A-requested-vs-effective-permissioned-capability-state
- Plans/Permissions_System.md#approval-ui
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
source_atom_ids:
- atom-0098
- atom-0126
- atom-0142
- atom-0144
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- teacher can control the Gui to show the user how to do things
- Gui
- show the user how
- OpenSubject
- route_target
- highlight
- spotlight
- safe guided action
- mutation confirmation
- opening a route
- focusing a panel
- scrolling
- highlighting
- previewing
- explicit confirmation
- action name
- affected object
- risk
- rollback/undo
- Cancel
- control the Gui
- open route
- focus panel
- scroll to section
- highlight control/region
- expand non-mutating details
- preview selection
- changing a setting
- saving memory
- approving a permission
- undo/rollback
- target surface unavailable
- route/control no longer exists
- context stale
- selection lost
- permission blocked
- capability unavailable
- help entry missing
- model fallback/clamp
- user stops
negative_constraints:
- Do not let Teacher perform raw uncontrolled GUI mutation outside stable UI command/route contracts.
- Do not allow mutating/destructive GUI actions without confirmation and capability/permission gates.
- Do not use stale or private panel-local route fields when the route/open contract provides canonical targets.
- Do not let `Do it` execute mutations without a confirmation step.
- Do not make confirmation copy vague about the affected object.
- Do not default a destructive confirmation to proceed.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let Teacher execute mutating actions through `Do it` without confirmation.
- Do not let guided GUI actions bypass Permissions_System requested/effective disclosure.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/assistant-chat-design.md
- Plans/Permissions_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Glossary.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Permissions System owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PS-123 - Inline Visualizer Sandbox And Library Allowlist Boundary

```yaml
plan_unit_id: PS-123
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Inline visualizer v2 runs in a sandboxed iframe or equivalent isolation boundary with default library allowlist
  empty. Candidate libraries such as Chart.js, D3, Vega-Lite, ECharts, Plotly, and vis-network require exact
  package/version, bundled asset, SHA-256/SRI, license, security, performance, capability, fallback, upgrade/removal,
  and owner approval before use. Remote CDN loading, cdnjs/jsdelivr/unpkg, dynamic imports, unvetted network access,
  undeclared runtime script injection, `allow-same-origin`, parent document scraping, and raw parent localStorage are
  denied. Rust + Slint builds use the PM-owned isolated webview adapter from CV-300, with postMessage-equivalent
  bridge messages validated for origin_nonce, visualizer_artifact_id, method schema, and permission state before host
  execution. Tone.js and Wavesurfer remain deferred until separately approved.
gui_related: false
gui_classification_reason: Defines execution and permission boundaries for visualizer sandboxing and library approval; GUI rendering is owned elsewhere.
depends_on: [ACD-427, CV-300]
unblocks: [F3-404, ATS-015]
acceptance_criteria:
  - Default visualizer library allowlist is empty.
  - Every allowed library has exact version, bundled asset, hash/SRI, license, security, performance, capability, fallback, upgrade/removal, and owner approval evidence.
  - Native webview adapter bridge calls enforce the same sandbox, origin/nonce, method-schema, and no-parent-access policy as iframe/postMessage calls.
  - Sandboxed visualizers cannot reach parent DOM/localStorage or unvetted network/CDN/import paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer sandbox and library-denial fixtures
risk_class: visualizer_sandbox_escape
reasoning_tier: high
context_scope: inline_visualizer_v2_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future inline visualizer sandbox policy
node_compile_hint:
  mode: inline_visualizer_v2_permission_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-library-allowlist-policy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0059
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0059, atom-0088]
preserved_exact_tokens:
  - "Chart.js"
  - "D3"
  - "Vega-Lite"
  - "ECharts"
  - "Plotly"
  - "vis-network"
  - "Tone.js"
  - "Wavesurfer"
  - "SHA-256"
  - "SRI"
  - "allow-same-origin"
  - "cdnjs"
  - "jsdelivr"
  - "unpkg"
  - "Rust + Slint"
  - "webview"
  - "origin_nonce"
negative_constraints:
  - No remote CDN loading.
  - No dynamic imports or unvetted network access.
  - No undeclared runtime script injection.
  - No parent document scraping.
  - No raw parent localStorage.
  - Do not approve Tone.js or Wavesurfer through this PlanUnit.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### PS-124 - Notification Destination Secret Custody And Live Send Authority

```yaml
plan_unit_id: PS-124
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Notification destinations that send to Slack, Discord, generic webhook, ntfy, Pushover, Telegram, or other remote
  services require explicit destination enablement and live-send authority. Webhook URLs, bot tokens, push tokens,
  and provider credentials are held only through OS credential references or equivalent secret custody. Receipts,
  screenshots, exports, logs, GUI previews, and test-send labels must not expose raw secrets, webhook URLs, tokens,
  private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted identities. External notification
  dismissal never resolves PM blocked episodes or canonical conditions.
gui_related: false
gui_classification_reason: Defines credential custody and send authority for notification integrations rather than visual presentation.
depends_on: [CV-298]
unblocks: [SP-222, F3-405, RAP-039, ATS-016]
acceptance_criteria:
  - Live test-send and remote delivery require an enabled destination plus explicit authority.
  - Receipts and UI surfaces store/display secret refs or masked values only.
  - External provider dismissal cannot resolve canonical PM blocker state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification secret custody and live-send permission fixtures
risk_class: notification_secret_exfiltration
reasoning_tier: high
context_scope: notifications_sounds_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future notification credential custody
node_compile_hint:
  mode: notification_secret_custody_live_send_authority
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-delivery-validation-no-secret-evidence
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
source_atom_ids: [atom-0062, atom-0068, atom-0069, atom-0091]
preserved_exact_tokens:
  - "Slack"
  - "Discord"
  - "generic webhook"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "webhook URLs"
  - "tokens"
  - "OS credential refs"
  - "raw secrets"
  - "External buttons/links"
negative_constraints:
  - Do not expose raw secrets, webhook URLs, tokens, private paths, full prompts, full logs, screenshots, raw diff bodies, or unredacted account identities.
  - Do not let external dismissal resolve PM blocked episodes or canonical conditions.
  - Do not make live send implicit from preview.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models trust, credential, probe, and live-call authority boundaries. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### PS-125 - Free Models Source Trust Credential And Probe Authority

```yaml
plan_unit_id: PS-125
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Free Models Auto Apply trust is limited to the configured upstream source/channel unless a future Advanced/Support plan explicitly pins another source. Free Models does not own underlying provider credentials; credential collection, secret refs, reconnect, and sign-in authority remain with the underlying provider/account/Multi-Account owner. Live probes, quota-spending checks, costed fallback, and generated-adapter activation require the relevant permission/authority state and must be redacted in diagnostics.
gui_related: false
gui_classification_reason: Defines trust, permission, and credential authority, not a visual surface.
depends_on: []
unblocks: []
acceptance_criteria:
  - Auto Apply rejects untrusted forks, arbitrary URLs, and arbitrary scripts unless a later Advanced/Support plan explicitly pins them.
  - Free Models setup delegates credential custody to the underlying provider/account flow.
  - Default refresh is metadata/catalog-only and does not spend quota by default.
  - Live probes or quota-spending checks require explicit authority and produce redacted evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models trusted source permission fixtures
  - Free Models credential custody fixtures
  - Live probe authority and redaction fixtures
risk_class: source_trust_and_secret_custody_drift
reasoning_tier: high
context_scope: free_models_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/FileSafe.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: free_models_source_trust_permissions_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0018, atom-0019, atom-0033, atom-0058, atom-0059, atom-0068, atom-0072, atom-0193, atom-0196, atom-0197, atom-0200, atom-0277, atom-0278, atom-0280, atom-0293, atom-0294]
preserved_exact_tokens:
  - "trusted upstream source"
  - "configured `vava-nessa/free-coding-models` source/channel"
  - "catalog/model metadata only"
  - "underlying provider/account"
  - "secrets/tokens always redacted"
negative_constraints:
  - Do not collect or store underlying provider credentials inside the Free Models provider.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
  - Do not spend quota during default refresh.
  - Do not expose raw secrets, tokens, or raw provider error payloads in normal UI or diagnostics export.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/FileSafe.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host trust, permission, secret, approval, network, and destructive-action gates. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PS-126 - Containerized Host Trust Permission Secret And Approval Gates

```yaml
plan_unit_id: PS-126
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Containerized-host security fails closed. Discovery, configuration, GUI availability, or a selected host profile is
  not execution approval. Host operations require scoped trust state, permission_snapshot_id, approval_scope_key,
  network_access_policy, secret_access_policy, destructive_command_policy, FileSafe scope, target-bound approvals,
  redaction, and receipt logging before mutation, attach, port exposure, image push, remote SSH, Kubernetes, Unraid,
  registry write, Docker socket, privileged DinD, secret injection, or external side effect. Blocked permission,
  FileSafe, trust, policy, network, and test-gap outcomes remain `blocked != failed` and expose allowed_action_ids plus
  blocked_reason_code rather than silent failure.
gui_related: false
gui_classification_reason: Permission, trust, and approval gates are backend policy behavior, not GUI presentation.
depends_on: [CV-303, CV-304, F2-194, RM-048]
unblocks: [CRAU-091, EP-109, T-166, ATS-019, RAP-042]
acceptance_criteria:
  - Discovery/configuration cannot grant execution, attach, expose-port, push, remote, Kubernetes, Unraid, registry, Docker socket, privileged DinD, or secret-injection authority.
  - Every high-risk host action binds approval to target, host profile/capability, runtime family, permission snapshot, trust policy, and expected receipts.
  - Blocked outcomes preserve blocked_reason_code, blocked scope, policy source, required action, allowed_action_ids, and evidence refs.
  - Raw secrets never appear in host profiles, prompts, GUI, logs, receipts, exports, diagnostics, or evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized host permission and blocked-outcome fixtures
  - future privileged DinD default-disabled fixture
risk_class: containerized_host_permission_bypass
reasoning_tier: high
context_scope: containerized_host_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - future host permission policy
node_compile_hint:
  mode: containerized_host_trust_permission_gates
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0018
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0019
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0050
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
source_atom_ids: [atom-0018, atom-0019, atom-0029, atom-0034, atom-0037, atom-0038, atom-0044, atom-0050, atom-0053, atom-0060, atom-0067, atom-0068, atom-0069, atom-0074, atom-0077, atom-0079, atom-0081]
decision_refs: [dec-0005, dec-0008, dec-0017, dec-0020]
preserved_exact_tokens:
  - "approval_scope_key"
  - "permission_snapshot_id"
  - "network_access_policy"
  - "secret_access_policy"
  - "destructive_command_policy"
  - "host trust profile"
  - "discovery is not execution approval"
  - "fails closed"
  - "target-bound approval"
  - "Docker socket"
  - "privileged DinD"
  - "remote SSH"
  - "Kubernetes"
  - "Unraid"
  - "registry writes"
  - "port exposure"
  - "secret injection"
  - "blocked != failed"
  - "permission_denied"
  - "filesafe_blocked"
  - "network_blocked_by_policy"
negative_constraints:
  - Do not equate discovery/configuration/GUI availability with permission to mutate, attach, expose ports, push images, inject secrets, or use remote hosts.
  - Do not allow privileged or remote side effects through generic tool approval or hidden defaults.
  - Do not describe privileged runtime support as a broad trusted mode.
  - Do not count blocked permission/FileSafe/policy outcomes as execution failures.
  - Do not expose raw secrets in records, prompts, GUI, receipts, exports, diagnostics, or evidence.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Contracts_V0.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PS-127 - P0-PLAN-ACT-PERMISSION-BOUNDARY

```yaml
plan_unit_id: PS-127
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PLAN-ACT-PERMISSION-BOUNDARY (P0) is compiled as canonical Puppet Master intent for Plan/Act/autonomy boundaries must be runtime enforced: Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed. The preserved PM gap/delta is: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema. The observed external-repo signal remains source-lineage evidence: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p0_plan_act_permission_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY@line=4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0008
external_atom_id: extrepo-20260703-0004
source_row_id: P0-PLAN-ACT-PERMISSION-BOUNDARY
priority: P0
finding_family: Plan/Act/autonomy boundaries must be runtime enforced
source_repos:
- cline/cline
- openai/codex
- warpdotdev/warp
target_docs:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0004
- P0-PLAN-ACT-PERMISSION-BOUNDARY
- P0
- Plan/Act/autonomy boundaries must be runtime enforced
- cline/cline
- openai/codex
- warpdotdev/warp
negative_constraints: []
observed_signal: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
pm_current_coverage: PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.
pm_gap_or_delta: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.
proposal_or_recommendation: >-
  Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.
compile_disposition: create_new_planunit
```

`AutonomyCeilingReceipt` fields: `receipt_id`, `schema_version`, `attempt_id`, `run_id?`, `requested_mode`, `effective_mode`, `ceiling_source_ref`, `tool_call_ref?`, `provider_message_ref?`, `mutation_class`, `decision` (`allow`, `block`, `require_approval`), `blocked_reason_code?`, `permission_snapshot_id`, `created_at_utc`, and `enforcement_point` (`post_parse_pre_execution`). Storage location is the canonical event stream as an `autonomy.ceiling_checked` payload with redb projection by `attempt_id`. Enforcement order is provider/tool parse, schema validation, autonomy ceiling check, permission/FileSafe check, then dispatch.

## FABLE Residual Permission Consent Cleanup Addendum - 2026-07-07

This addendum binds skill invocation and other blocked feature actions to the canonical ask/consent flow without creating a Skills-local approval model.

### PS-131 - Invocation-Time Consent Bridge

```yaml
plan_unit_id: PS-131
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Invocation-time consent uses the existing permission ask flow for tools, skills, web operations, and blocked
  feature actions. A blocked invocation carries blocked_reason_code, approval_scope_key, permission_snapshot_id?,
  ordered allowed_action_ids[], requested_permission_state, effective_permission_state, requesting_context, and
  normalized invocation identity. once, for session, and always remain distinct approval leases, while Skills and
  other consumers route to Permissions through command refs instead of local approval dialogs.
gui_related: true
gui_classification_reason: Permission approval cards, remediation actions, and blocked invocation states are user-visible.
depends_on: [PS-041, PS-042, PS-082, SS-035]
unblocks: [SS-035]
acceptance_criteria:
  - Skill `Needs permission` states use the same blocked payload as tool permission prompts.
  - "`cmd.permissions.review_request` opens the canonical approval/settings path with approval_scope_key and requesting_context."
  - "`cmd.permissions.revoke` remains the canonical revocation command for durable rules and must receive rule_id or approval_scope_key plus scope."
  - Approval leases bind to normalized invocation identity, cwd, env digest, namespace, purpose, project/worktree, and retry lineage.
  - Headless ask denial returns a blocked outcome with allowed remediation actions instead of silently failing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: invocation_consent_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
node_compile_hint:
  mode: invocation_time_consent_bridge
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:348
  - fablereport.md:691
  - fablereport.md:696
  - fablereport.md:1047
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "deny"
  - "once"
  - "for session"
  - "always"
  - "approval_scope_key"
  - "allowed_action_ids[]"
  - "cmd.permissions.revoke"
  - "cmd.permissions.review_request"
negative_constraints:
  - Do not create a parallel Skills-only consent dialog.
  - Do not treat approval as reusable CLI privilege outside the normalized invocation identity and approval scope.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
```

### PS-128 - P0-PROVIDER-EGRESS-HTTP-POLICY

```yaml
plan_unit_id: PS-128
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PROVIDER-EGRESS-HTTP-POLICY (P0) is compiled as canonical Puppet Master intent for User-configurable provider endpoint egress, redirect, timeout, and SSRF policy: Imported external-repo finding extrepo-20260703-0076 / P0-PROVIDER-EGRESS-HTTP-POLICY (P0). The preserved PM gap/delta is: ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs. The observed external-repo signal remains source-lineage evidence: Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs. | Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection. | Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 'Provider calls carry ProviderEgressPolicy: redirect behavior, timeout, abort signal, proxy, DNS policy, private-IP/localhost deny-or-allow, certificate policy, allowed host class, and audit receipt.'
- Custom provider URLs cannot follow redirects to unexpected hosts or local metadata endpoints by default.
- Provider transport receipts record effective URL, redirect count, timeout/cancel cause, and policy decision without leaking secrets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 'Provider calls carry ProviderEgressPolicy: redirect behavior, timeout, abort signal, proxy, DNS policy, private-IP/localhost deny-or-allow, certificate policy, allowed host class, and audit receipt.'
- Custom provider URLs cannot follow redirects to unexpected hosts or local metadata endpoints by default.
- Provider transport receipts record effective URL, redirect count, timeout/cancel cause, and policy decision without leaking secrets.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: p0_provider_egress_http_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0080
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0080
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0076/P0-PROVIDER-EGRESS-HTTP-POLICY@line=76
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0076/P0-PROVIDER-EGRESS-HTTP-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0080
external_atom_id: extrepo-20260703-0076
source_row_id: P0-PROVIDER-EGRESS-HTTP-POLICY
priority: P0
finding_family: User-configurable provider endpoint egress, redirect, timeout, and SSRF policy
target_docs:
- Models_System.md
- Provider_OpenCode.md
- Permissions_System.md
- GitHub_Integration.md
- Contracts_V0.md
- MCP_Integration.md
owner_hints:
- Models_System.md
- Provider_OpenCode.md
- Permissions_System.md
- GitHub_Integration.md
- Contracts_V0.md
- MCP_Integration.md
preserved_exact_tokens:
- extrepo-20260703-0076
- P0-PROVIDER-EGRESS-HTTP-POLICY
- P0
- User-configurable provider endpoint egress, redirect, timeout, and SSRF policy
negative_constraints: []
observed_signal: 'Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs. | Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection. | Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.'
pm_gap_or_delta: ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs.
relationship_to_prior_reports: New P0 network/security edge under the provider work.
compile_disposition: create_new_planunit
```

### PS-129 - P0-COMMAND-APPROVAL-LEASE

```yaml
plan_unit_id: PS-129
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-COMMAND-APPROVAL-LEASE (P0) is compiled as canonical Puppet Master intent for Command approval lease bound to normalized command identity: Imported external-repo finding extrepo-20260703-0090 / P0-COMMAND-APPROVAL-LEASE (P0). The preserved PM gap/delta is: Approval must be a lease over invocation form, cwd/env, namespace, purpose, normalized command hash, and retry lineage. The observed external-repo signal remains source-lineage evidence: Cline posix_spawn bug for structured command string; Codex PRs around shell approval boundaries, PowerShell wrappers, command identity, approval purpose.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- argv approval does not cover shell string
- PowerShell wrapper one-shot approval cannot silently retry changed command
- Approval purpose mismatch requires new approval
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- argv approval does not cover shell string
- PowerShell wrapper one-shot approval cannot silently retry changed command
- Approval purpose mismatch requires new approval
risk_class: p0_security_release_supply_chain_hardening
reasoning_tier: high
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: p0_command_approval_lease
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0094
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0094
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0090/P0-COMMAND-APPROVAL-LEASE@line=90
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0090/P0-COMMAND-APPROVAL-LEASE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0094
external_atom_id: extrepo-20260703-0090
source_row_id: P0-COMMAND-APPROVAL-LEASE
priority: P0
finding_family: Command approval lease bound to normalized command identity
source_repos:
- Cline
- OpenAI Codex
preserved_exact_tokens:
- extrepo-20260703-0090
- P0-COMMAND-APPROVAL-LEASE
- P0
- Command approval lease bound to normalized command identity
- Cline
- OpenAI Codex
negative_constraints: []
observed_signal: Cline posix_spawn bug for structured command string; Codex PRs around shell approval boundaries, PowerShell wrappers, command identity, approval purpose.
pm_gap_or_delta: Approval must be a lease over invocation form, cwd/env, namespace, purpose, normalized command hash, and retry lineage.
compile_disposition: create_new_planunit
```

### PS-130 - PS-130

```yaml
plan_unit_id: PS-130
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Command approval must be modeled as a GUI-visible runtime/tool lease over normalized invocation form, cwd/env, namespace, purpose, policy snapshot, and retry lineage. Approval never becomes reusable CLI privilege.
gui_related: true
gui_classification_reason: Guardrail affects GUI/user-visible terminal/control surfaces.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0120 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: atom_0120
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0120
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0120
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0120
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- Command approval is a GUI-visible runtime/tool lease
- Approval never becomes reusable CLI privilege
- Command approval is a GUI-visible lease
negative_constraints:
- Do not treat command approval as reusable CLI privilege.
compile_disposition: create_new_planunit
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical permission spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Durable Approval Section References

Repairs rows `sfk-344077d4e91d4dba8a844f8b`, `sfk-95212a02bf1d39bbc2883d92`, and `sfk-c2365f0841b6e3af70ad6310`.

- The `always` response contract is owned by Section 3.4 and consumed by AC-PM06. Any older `§6.2` reference to `always` is a source-lineage alias for Section 3.4.
- Durable rule creation is owned by Section 9 and command IDs `cmd.permissions.create_project_rule` and `cmd.permissions.create_global_rule`. Any older `§6.4A` reference is a source-lineage alias for Section 9 durable approvals.
- Scope specificity is owned by Section 2.4 plus the deterministic resolution algorithm in Section 8. Any older `§2.4B` reference maps to Section 2.4 scope precedence.
- New references must use these owner sections and command IDs rather than the retired aliases.

### TOML Persistence Failure And Atomicity Rules

Repairs row `sfk-fdf444265abf92192b7160bd`.

- Permission TOML writes use write-temp, fsync-temp, atomic rename, then fsync-parent-directory when the platform exposes it.
- The temp filename is `.permissions.{scope}.{nonce}.tmp` in the same directory as the target file. Cross-filesystem rename is forbidden.
- Parse failure on load quarantines the bad file as `permissions.toml.corrupt.{timestamp_utc}`, loads the last valid redb projection if available, and surfaces `permission_config_parse_failed` with `path`, `line?`, `column?`, and `recovery_action_ids[]`.
- Concurrent write conflict is detected by comparing `loaded_config_hash` to the current file hash before rename. Conflict returns `permission_config_write_conflict` and must not overwrite the newer file.
- If both file and projection are unreadable, default policy is fail-closed for mutation-capable tools and ask/deny according to the guard contract for read-only tools.

### Permissions UI Commands And Error States

Repairs rows `sfk-57ac0d8ad5d91758f6c339a1` and `sfk-6f3fd08bf73eb3f910729299`.

- Settings route: `settings.permissions`.
- Command IDs: `cmd.permissions.open`, `cmd.permissions.create_project_rule`, `cmd.permissions.create_global_rule`, `cmd.permissions.update_rule`, `cmd.permissions.reorder_rule`, `cmd.permissions.delete_rule`, `cmd.permissions.revoke`, `cmd.permissions.pick_external_directory`, and `cmd.permissions.validate_rule`.
- Directory picker dispatch name: `permissions.external_directory.pick`.
- Duplicate path error code: `external_directory_duplicate_path`.
- Invalid glob error code: `external_directory_invalid_glob`.
- Reorder validation errors are `rule_not_found`, `target_index_out_of_range`, and `scope_mismatch`.
- Save dirty state values are `clean`, `dirty`, `saving`, `saved`, `save_failed`, and `conflict_refresh_required`.

### Domain-Sensitive Permission Classes

Repairs row `sfk-613f7652b32c4e3abfe4f6e2`.

| Permission class | Applies to | Never implied by |
| --- | --- | --- |
| `domain.docker_exec` | `docker exec`, `docker attach` | generic command allow, YOLO/session mode |
| `domain.kubernetes_exec` | `kubectl exec`, `kubectl attach` | generic command allow |
| `domain.kubernetes_port_forward` | `kubectl port-forward` | network allow alone |
| `domain.git_destructive_remote` | force push, remote prune, protected branch mutation | ordinary git read/write allow |
| `domain.workflow_admin` | workflow cancel, rerun, admin mutation | hosted-provider auth alone |
| `domain.image_publish` | registry image push, repo create, template publish | local build approval |

Each domain approval records `approval_scope_key`, `permission_snapshot_id`, `target_identity`, `operation_class`, `expires_at_utc?`, and `revocation_rule_id?`.

### Permission Snapshot Reason-Code Enums

Repairs row `sfk-ea6603b7ef92e31beeee32b4`.

- `stop_reason_code` values: `user_stopped`, `policy_denied`, `budget_exhausted`, `safe_point_required`, `permission_snapshot_stale`, `indeterminate_remote_outcome`.
- `blocked_reason_code` values: `approval_required`, `policy_denied`, `preflight_failed`, `state_changed`, `domain_sensitive_action`, `secret_required`, `network_forbidden`, `external_side_effect`, `operation_in_progress`.
- `budget_kind` values: `turns`, `tokens`, `wall_time_seconds`, `parallel_agents`, `cost`.
- `attention_required_reason_code` values: `target_selection_required`, `scope_confirmation_required`, `credential_required`, `policy_owner_required`, `manual_review_required`.
- Transitions: `approval_required -> approved_once|approved_for_session|approved_always|denied`; `permission_snapshot_stale -> refresh_required`; `indeterminate_remote_outcome -> manual_review_required`; `budget_exhausted -> blocked` unless the owner policy grants a bounded extension.
