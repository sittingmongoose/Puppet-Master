## 2. Permission model

> **SSOT:** The canonical specification for permission actions (`allow`/`ask`/`deny`), precedence layers, granular rules, wildcard syntax, special guards, ask-flow semantics, deterministic defaults, and resolution algorithm is **`Plans/Permissions_System.md`**. This section provides a summary for tool-registry context; do not duplicate normative detail here.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

### 2.1 Values and semantics (summary)

- **allow** — Tool may run without prompting. FileSafe guards still apply after permission.
- **deny** — Tool is blocked; `tool.denied` event emitted.
- **ask** — User must approve (`deny` / `once` / `for session` / `always`). In headless runs, maps to `deny` unless HITL is enabled.

Full definitions: `Plans/Permissions_System.md` §2.

### 2.2 Config and precedence (summary)

Permission rules are evaluated in a deterministic precedence order: Mode override > Session cache > Persona overrides > Project-level > Global-level > Defaults. Within a single ruleset, last-match-wins. Full precedence table: `Plans/Permissions_System.md` §2.4.

Config is stored in TOML files at deterministic paths (global: `~/.config/puppet-master/permissions.toml`, project: `<project_root>/.puppet-master/permissions.toml`). A `tool_permissions` key in redb `config:v1` is a projection of the merged ruleset. Full schema: `Plans/Permissions_System.md` §9.

### 2.3 Session vs run; subagents

A PM subagent is a child run. It is not a special-case provider-local actor and it is not defined by provider-native agent-file syntax.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Canonical child-run identity fields:
- `child_run_id`
- `parent_run_id`
- `thread_id`
- `batch_id?`
- `subgroup_id?`
- `attempt_id?`
- requested/effective Persona and runtime fields
- effective provider invocation kind as additive adapter metadata

Provider behavior may still differ. A canonical child run may map to:
- a native provider subagent path
- a native provider child-session path
- a plain provider run

That adapter-level difference does not change the PM child-run canon.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md

Subagents are disposable by default. Completion, cancellation, or failure normally ends that child. Follow-up work should usually spawn a new child rather than reopen an old one.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
### 2.4 Interaction with FileSafe

FileSafe runs **in addition to** tool permissions. A tool may be **allowed** by permission but still **blocked** by FileSafe. Tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?". See `Plans/FileSafe.md`. The policy engine applies both layers in order: permission first, then FileSafe. Full integration order: §10.6.

### 2.4.1 Central policy engine contract
Every agent-usable tool attempt MUST pass through one canonical policy engine that resolves permission, approval/HITL, FileSafe, execution, terminal binding when relevant, and result normalization.
ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Canonical order:
1. resolve tool identity and permission
2. evaluate `allow` / `ask` / `deny`
3. if `ask`, resolve approval or headless fallback
4. apply FileSafe and other invocation validation
5. resolve terminal or shell binding for shell-capable actions
6. execute or reject
7. normalize the terminal outcome for persistence, analytics, and reveal-linkback behavior

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md

Shell-binding rules:
- `bash` and any canonical shell-backed execution path resolve through the terminal process-host contract when they create or bind shell state
- non-interactive or hidden shell execution may suppress opening the terminal UI, but it still binds to canonical terminal-session state when execution actually occurs
- denied or blocked shell calls do not mint fake live terminal sessions
- chat command cards and other preview surfaces consume normalized terminal state rather than replacing terminal ownership

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

At minimum, the normalized tool-result taxonomy MUST distinguish:
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

- `allowed_succeeded`
- `allowed_runtime_error`
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `validation_blocked`
- `cancelled`
- `timed_out`
- `post_scan_failure`

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

This document owns the normalized tool-result taxonomy and policy order. Provider docs emit observations; storage docs persist normalized results.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
### 2.5 Cross-plan references

| Plan | Relation to tool permissions |
|------|------------------------------|
| **Permissions_System.md** | Canonical SSOT for allow/ask/deny semantics, precedence, granular rules, defaults, resolution algorithm, GUI, and persistence. |
| **FileSafe.md** | Command blocklist ≈ bash deny; write scope ≈ edit path allowlist; security filter ≈ read path deny (.env). Central policy engine; permission + FileSafe both apply. |
| **FileManager.md** | Workspace roots, open paths; external_directory and path rules may affect File Manager/editor exposure. |
| **assistant-chat-design.md** | YOLO/Regular (§3); canonical approval ladder alignment; bash audit trail and FileSafe. |
| **orchestrator-subagent-integration.md** | Run config snapshot includes tool permissions; headless ask → deny or HITL; node/subagent overrides. |
| **interview-subagent-integration.md** | Same run config and permission snapshot for interview runs. |

---

