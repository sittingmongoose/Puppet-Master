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
- **webfetch/websearch:** The domain (`https://<domain>/*`). Example: URL `https://docs.rs/tokio/latest` → pattern `"https://docs.rs/*"`.
- **webextract/webresearch/webcrawl/webmap:** the normalized target origin and scope. Single-target extraction uses the concrete URL origin (`https://<domain>/*`); bounded crawl/map rules use the approved origin plus an explicit crawl-scope discriminator, never a naked wildcard.
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

Durable approvals created through `create_project_rule` or `create_global_rule` are persisted in their owning config layer as metadata-bearing records with the logical fields `{ tool_pattern, action, scope_key?, created_at, created_by_thread_id }`. File-level TOML projections MAY additionally expose these rules in the simpler per-tool tables shown below, but the stored rule identity and audit metadata remain part of the canonical durable record.

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
