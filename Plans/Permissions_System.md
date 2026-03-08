# Permissions System (Canonical SSOT)

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

## 1. Definitions and scope

<a id="DEF-SCOPE"></a>

### 1.1 Tool registry/policy vs Permission rules

Two distinct concepts exist:

- **Tool registry/policy** (`Plans/Tools.md`): Defines *what tools exist* (built-in, MCP-discovered, custom), their schemas, input/output contracts, and how they integrate with the central registry. The tool registry is the consumer of permission rules.
- **Permission rules** (this document): Define *when a tool invocation is allowed, requires approval, or is denied*. Permission rules are evaluated by the policy engine at invocation time. The tool registry consumes these rules; permission rules do not depend on the registry's internal structure.

**Direction of dependency:** Tool policy consumes permission rules, not vice versa. The permission system is policy-layer-only and has no knowledge of tool implementation details.

ContractRef: ContractName:Plans/Tools.md, Primitive:DRYRules

### 1.2 HTE vs DAE applicability

Permission rules apply in both execution strategies defined by `Plans/Run_Modes.md`:

| Strategy | Permission enforcement |
|----------|----------------------|
| **HTE** (Hosted Tool Execution) | Puppet Master evaluates permissions before executing each tool call itself. Full control; the permission engine is the sole gatekeeper. |
| **DAE** (Delegated Agent Execution) | The provider CLI executes tools. Puppet Master enforces permissions via pre-spawn policy injection (CLI args derived from the resolved permission set per `Plans/Tools.md` §10.8) and post-hoc reconciliation (end-of-run scans per `Plans/Run_Modes.md` §5.4). Permission violations detected post-hoc trigger kill conditions. |

ContractRef: ContractName:Plans/Run_Modes.md#STRATEGY-HTE, ContractName:Plans/Run_Modes.md#STRATEGY-DAE, ContractName:Plans/Tools.md

---

## 2. Permission actions

<a id="PERM-ACTIONS"></a>

Exactly three permission actions exist. Every tool invocation resolves to exactly one action.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 `allow`

The tool invocation proceeds without user approval. FileSafe guards (`Plans/FileSafe.md`) still apply after permission resolution.

### 2.2 `ask`

The tool invocation is paused pending user approval. The user is presented with the invocation details and MUST choose one of three responses: `once`, `always`, or `reject` (see §6). If no user is available (headless/Orchestrator run), `ask` maps to `deny` unless HITL is enabled at the current tier boundary (`Plans/human-in-the-loop.md`).

### 2.3 `deny`

The tool invocation is blocked. The policy engine emits a `tool.denied` event (`Plans/Contracts_V0.md#EventRecord`) and returns an error to the agent. The tool is not executed.

### 2.4 Deterministic precedence across layers

<a id="PRECEDENCE-LAYERS"></a>

Permission rules are evaluated in a strict layer precedence. The **first layer that produces a defined rule for the tool invocation** wins. Within a single layer's ruleset, last-match-wins ordering applies (§3.1).

| Priority | Layer | Source | Description |
|----------|-------|--------|-------------|
| 1 (highest) | **Mode override** | `Plans/Run_Modes.md` | `yolo` → all `allow`; `ask`/`plan` → mutating tools `deny`. Applied unconditionally. |
| 2 | **Session cache** | Runtime | "Approve for session" grants from prior `always` responses (§6.2). Assistant-only; ephemeral. |
| 3 | **Persona overrides** | `Plans/Personas.md` §5.2 | The active Persona's `default_permissions_profile` names a profile whose rules are applied. |
| 4 | **Project-level** | `.puppet-master/permissions.toml` | Per-project permission rules. |
| 5 | **Global-level** | `~/.config/puppet-master/permissions.toml` | User-wide permission rules. |
| 6 (lowest) | **Defaults** | §7 of this document | Hardcoded defaults table. |

Rule: Within a single layer, if the layer contains multiple matching rules (e.g., granular patterns), **last-match-wins** ordering applies (§3.1).

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Personas.md#PERSONA-INJECTION, PolicyRule:Decision_Policy.md§2

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

**Ordering:** Within a single ruleset (object syntax), rules are evaluated in **definition order**; the **last matching rule wins**. This allows broad patterns followed by narrow exceptions:

```toml
[bash]
"*" = "ask"        # default: ask for all bash commands
"git *" = "allow"  # override: allow git commands
"rm *" = "deny"    # override: deny rm commands
```

In the above, `git status` matches both `"*"` and `"git *"`; last-match-wins yields `"allow"` only if `"git *"` appears after `"*"`.

**Case sensitivity:** Matching is case-sensitive on Unix-like systems, case-insensitive on Windows.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

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

When a user responds `always` to an `ask` prompt (§6.2), the system inserts a **session-scoped** `allow` rule into the session cache (precedence layer 2, §2.4). The rule uses the tool name and a suggested pattern derived from the invocation context:

- **bash:** The command prefix (first word + space + `*`). Example: invocation `git commit -m "fix"` → pattern `"git *"`.
- **edit/read/glob/grep:** The directory prefix (`<dir>/**`). Example: invocation path `src/auth/login.rs` → pattern `"src/auth/**"`.
- **webfetch/websearch:** The domain (`https://<domain>/*`). Example: URL `https://docs.rs/tokio/latest` → pattern `"https://docs.rs/*"`.

The suggested pattern is displayed to the user during the `always` confirmation. The user MAY edit the pattern before it is saved.

---

## 4. Special guards

<a id="SPECIAL-GUARDS"></a>

Special guards are synthetic permission keys that are not tied to a specific tool but to a behavioral condition. They are evaluated in addition to tool-specific permissions.

ContractRef: PolicyRule:Decision_Policy.md§2

### 4.1 `doom_loop`

<a id="GUARD-DOOM-LOOP"></a>

**Trigger:** The same tool is called with identical input three consecutive times within a single run or session.

**Default action:** `ask`.

**Behavior:** When triggered, the policy engine pauses execution (or denies in headless mode) and surfaces a warning: "Tool `{name}` called 3× with identical input — possible loop." The user may approve (continue), reject (deny this call), or abort the run.

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

**Behavior:** This guard is **non-bypassable**. `yolo` mode, session-scoped `always` approvals, and generic prior allows MUST NOT suppress it. A direct user click approves only the exact remote side effect named by that clicked control. If one UI flow chains multiple remote side effects, Puppet Master MUST present a separate approval step for each remote side effect in execution order.

**Failure presentation:** When blocked or rejected, the runtime MUST surface an error object that identifies the blocked remote step, the guard name, and the exact recovery options available from the current surface. Docker Manage and orchestrator surfaces MUST show the blocking reason inline; autonomous/chat-driven flows MUST also surface the block in chat/evidence output.

---

## 5. Tool permission keys

<a id="TOOL-KEYS"></a>

The following permission keys are recognized by the policy engine. Each key corresponds to a built-in tool or a special guard. MCP-discovered and custom tools use their registered names as permission keys; unknown tools default to `ask` (§7).

Rule: Every built-in tool and special guard MUST have exactly one entry in this table. The table is the canonical key list.

ContractRef: ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§2

| Key | Category | Scope | Notes |
|-----|----------|-------|-------|
| `read` | File I/O | Read file contents | Granular: path patterns |
| `edit` | File I/O | Create/modify/delete files | Granular: path patterns. Covers `write`, `patch`, `multiedit` (same permission). |
| `glob` | Search | File name pattern matching | Granular: path patterns |
| `grep` | Search | Content search | Granular: path patterns |
| `list` | Search | Directory listing | Granular: path patterns |
| `bash` | Execution | Shell command execution | Granular: command patterns. FileSafe applies after. |
| `task` | Execution | Subagent launch | Granular: subagent type patterns |
| `skill` | Context | Load skill content | Granular: skill ID patterns |
| `lsp` | IDE | Language server operations | Read-only ops `allow` by default; `rename` requires separate approval (`Plans/Tools.md` §3.4.1). |
| `webfetch` | Network | Fetch URL content | Granular: URL patterns |
| `websearch` | Network | Web search | Granular: query patterns |
| `codesearch` | Search | Project workspace code/symbol search | Low risk; read-only |
| `chatsearch` | Search | Project chat history search | Low risk; read-only; supports thread/time filters |
| `logsearch` | Search | Project logs (summary) search | Read-only; returns refs to full payload |
| `logread` | Logs | Read full log payload by ref | May contain sensitive data; default `ask` recommended |
| `repo.import` | Workspace | Import external repo into project workspace | Requires explicit user intent; network + filesystem effects; default `ask` recommended |
| `capabilities.get` | Introspection | Capability listing across media + provider tools | Read-only introspection; low risk |
| `media.generate` | Generation | Image/video/tts/music generation | Content generation operation; user-facing output |
| `todoread` | State | Read task state | Subagent default: `deny` |
| `todowrite` | State | Write task state | Subagent default: `deny` |
| `external_directory` | Guard | Paths outside working roots | See §4.2 |
| `doom_loop` | Guard | Identical repeated calls | See §4.1 |

---
## 6. Ask flow semantics

<a id="ASK-FLOW"></a>

When the policy engine resolves a tool invocation to `ask`, the user is presented with the invocation details and three response options.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, PolicyRule:Decision_Policy.md§2

### 6.1 `once`

Approves this single invocation. No persistent rule is created. The tool executes immediately. Future invocations of the same tool still require approval.

### 6.2 `always`

<a id="ASK-ALWAYS"></a>

Approves this invocation AND inserts a session-scoped `allow` rule (§3.4) into the session cache (precedence layer 2, §2.4). The pattern is derived from the invocation context (§3.4) and shown to the user for optional editing.

After the rule is inserted, the policy engine re-evaluates all pending `ask` requests in the same session. Any that now resolve to `allow` are auto-approved.

Session-scoped rules do NOT persist across application restarts.

### 6.3 `reject`

Denies this invocation. The policy engine emits `tool.denied` and returns a rejection error to the agent. If the user provides feedback text, the error includes the feedback (corrected error); otherwise a bare rejection error is returned.

Rule: A `reject` response MUST also reject ALL other pending `ask` requests in the same session. This prevents cascading permission prompts after the user has indicated disapproval.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 7. Deterministic defaults

### 7A. Preview/browser trust-tier capability matrix (2026-03-08)

Preview/browser trust tiers are runtime capability gates. They do not replace tool permissions; they constrain what preview surfaces themselves are allowed to do.

| Capability | `generated_restricted` | `workspace_preview` | `external_browse` |
|---|---|---|---|
| App-bundled JS required for rendering | allow | allow | allow |
| Arbitrary remote network fetches from page content | deny | deny unless user explicitly navigated to allowed workspace preview origin | user-driven only |
| Local asset loading from active workspace preview root | deny | allow | deny by default |
| Cookies / local storage reuse | deny | allow, project-scoped only | separate store from workspace preview |
| Preview mutation bridge (`request_edit`) | allow only through narrow v1 preview bridge | deny by default | deny |
| Open source / export bridge | allow | allow when subject is workspace-backed | deny unless the page is a workspace preview |
| Inspect / capture element context | deny | allow | allow, user-triggered only |
| DevTools | deny | allow when user explicitly opens DevTools | allow when user explicitly opens DevTools |
| Arbitrary host/file API access | deny | deny | deny |

Rules:
- `generated_restricted` and `workspace_preview` MUST NOT share storage/cookies by default.
- `external_browse` MUST NOT inherit source-mutation privileges from workspace preview.
- A GUI toggle or browser feature MUST NOT expand trust-tier capabilities beyond this matrix without an explicit plan update.

<a id="DEFAULTS"></a>

When no rule matches at any precedence layer (§2.4), the following defaults apply. This table is the single source of truth for default permissions.

Rule: Every tool permission key from §5 MUST have exactly one default in this table.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Tools.md

| Key | Default | Rationale |
|-----|---------|-----------|
| `read` | `allow` | Read-only; `.env` deny via §7.1 |
| `edit` | `ask` | File mutations require approval |
| `glob` | `allow` | Read-only search |
| `grep` | `allow` | Read-only search |
| `list` | `allow` | Read-only listing |
| `bash` | `ask` | Shell execution; high risk |
| `task` | `ask` | Subagent launch; resource cost |
| `skill` | `allow` | Context injection; low risk |
| `lsp` | `allow` | Read-only IDE operations |
| `webfetch` | `ask` | Network access |
| `websearch` | `ask` | Network access |
| `codesearch` | `allow` | Read-only project code search |
| `chatsearch` | `allow` | Read-only project chat index search |
| `logsearch` | `allow` | Read-only log-summary search |
| `logread` | `ask` | Full log payload may contain sensitive data |
| `repo.import` | `ask` | Imports external code into workspace; network + filesystem impact |
| `capabilities.get` | `allow` | Read-only capability introspection |
| `media.generate` | `ask` | External API generation; quota/cost impact |
| `todoread` | `allow` | State read (subagent: `deny`) |
| `todowrite` | `allow` | State write (subagent: `deny`) |
| `external_directory` | `ask` | Paths outside project roots |
| `doom_loop` | `ask` | Identical repeated calls |
| `external_publish_side_effect` | `ask` | Remote publication and remote repo mutation require explicit approval even in fast/autonomous modes |
| *(any unknown tool)* | `ask` | Safe default for new/MCP tools |

### 7.1 Default `.env` deny rules

<a id="DEFAULT-ENV-DENY"></a>

The `read` tool has built-in granular defaults that protect sensitive environment files:

```toml
[read]
"*" = "allow"
"*.env" = "deny"
"*.env.*" = "deny"
"*.env.example" = "allow"
```

These defaults apply at the lowest precedence layer. Any explicit rule at a higher layer (global, project, Persona) overrides them. The `.env.example` allowance is intentional — example files contain no secrets.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---
## 8. Resolution algorithm

<a id="RESOLUTION"></a>

The policy engine evaluates permission for a single tool invocation using the following deterministic algorithm. Steps are executed in order; the first step that produces a result terminates the algorithm unless a special guard later applies a more restrictive outcome.

Rule: Given identical inputs (tool name, invocation context, config, mode, session state), the algorithm MUST always produce the same result.

ContractRef: PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§3

1. **Mode override:** If the run mode is `yolo`, return `allow` for tool-permission evaluation only. Non-bypassable special guards are still evaluated in step 7 and may still require approval. If the run mode is `ask` or `plan`, and the tool is mutating (`edit`, `bash`, `task`, `webfetch`, `websearch`, `repo.import`, `media.generate`, `todowrite`), return `deny`.
2. **Session cache (Assistant only):** If this tool+context matches a session-scoped `allow` rule (from prior `always` responses), return `allow`, except that session-scoped allows MUST NOT suppress non-bypassable special guards.
3. **Persona overrides:** If the active Persona has a `default_permissions_profile` that contains a matching rule for this tool+context, use it.
4. **Project-level rules:** If `.puppet-master/permissions.toml` in the active project contains a matching rule, use it.
5. **Global-level rules:** If `~/.config/puppet-master/permissions.toml` contains a matching rule, use it.
6. **Defaults:** Use the default from §7 (including §7.1 granular defaults for `read`).
7. **Special guards:** After steps 1–6, additionally evaluate `external_directory` (§4.2), `doom_loop` (§4.1), and `external_publish_side_effect` (§4.3). If a guard triggers and its action is more restrictive than the result from steps 1–6 (`deny` > `ask` > `allow`), the guard action wins. `external_publish_side_effect` is non-bypassable and cannot be satisfied by a generic prior allow; it requires approval scoped to the exact remote side effect being attempted.

**Post-resolution:** If the result is `allow` (or `ask` approved), FileSafe guards (`Plans/FileSafe.md`) are evaluated as a separate layer. A tool may be permission-allowed but FileSafe-blocked.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md

---
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

<a id="GUI-PERMISSIONS"></a>

The Permissions settings screen is a dedicated tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4). All GUI surfaces described here are normative; `Plans/FinalGUISpec.md` references this section as the SSOT for permissions GUI behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 10.1 Dedicated Permissions tab

A **Permissions** tab in Settings MUST provide the following sections as collapsible cards.

### 10.2 Global defaults + per-tool overrides

A two-section layout:

1. **Global wildcard default:** A single dropdown (`Allow` | `Ask` | `Deny`) that sets the fallback action for any tool without an explicit rule. Default: `Ask`.
2. **Per-tool overrides:** A table listing all known tools (built-in canonical names from §5 + MCP-discovered tools). Each row: tool name, category badge, permission dropdown (`Allow` | `Ask` | `Deny`), and an expand chevron for granular rules.

### 10.3 Granular rule editor

When a tool row is expanded (§10.2), the granular rule editor appears:

- An ordered list of `{pattern, action}` entries.
- "Add rule" button appends a new row with empty pattern and `Ask` default.
- Drag handles for reordering (last-match-wins, so order matters).
- Delete button per row.
- Pattern input supports wildcard syntax (§3.1); inline help tooltip shows `*` and `?` semantics.

### 10.4 Presets

**Presets** apply a batch of permission rules. Preset buttons:

| Preset | Effect |
|--------|--------|
| **Read-only** | `edit`, `bash`, `webfetch`, `websearch`, `task`, `repo.import` → `deny`; all others → `allow`. |
| **Plan mode** | Only `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch` → `allow`; everything else → `deny`. |
| **Full** | All tools → `allow` except `bash`, `edit`, `repo.import` → `ask`. |

Applying a preset overwrites the current ruleset with a confirmation dialog: "This will replace your current permissions. Continue?"

Presets apply to **tool** keys; special guards (`external_directory`, `doom_loop`) remain unchanged (defaults apply unless the user edits them explicitly).
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

Changes are saved to the selected scope's file. The effective (merged) permissions are displayed with layer-of-origin badges when in "Global" scope and a project is active.

### 10.9 ELI5/Expert copy

Permissions UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0.

- **ELI5:** Simplified view showing only per-tool dropdowns and presets. Granular rules, profile editor, and allowlist manager are hidden.
- **Expert:** Full view with all sections visible.

Tooltip keys: `tooltip.permissions.*` prefix.

---

## 11. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7C:

### 11.1 Baseline

OpenCode's permission system uses a `Ruleset` (array of `{permission, pattern, action}` rules) with `fromConfig()` converting config to rules. Wildcard matching via `wildcard.ts`. Ask flow: `once`/`always`/`reject` with reject-all cascade. Default `.env` deny rules. `external_directory` and `doom_loop` as special guards.

### 11.2 Puppet Master deltas

1. **Multi-layer precedence:** OpenCode uses a flat config + session overlay. Puppet Master adds Persona overrides, project-level, and global-level as distinct precedence layers (§2.4).
2. **TOML persistence:** OpenCode stores permissions in JSON config. Puppet Master uses TOML files at deterministic paths (§9), enabling version-control-friendly project permissions.
3. **Named permission profiles:** OpenCode has per-agent permission overrides. Puppet Master formalizes these as named profiles referenced by Personas (§9, §10.7).
4. **Mode integration:** OpenCode has no formal mode system. Puppet Master's mode layer (§2.4 priority 1) provides unconditional overrides from `yolo`/`ask`/`plan` modes.
5. **Dedicated GUI:** OpenCode has no GUI. Puppet Master provides a full permissions settings screen (§10).

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

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
**AC-PM06:** The `always` response (§6.2) MUST insert a session-scoped allow rule that auto-approves matching future invocations within the same session. The rule MUST NOT persist across application restarts.

<a id="AC-PM07"></a>
**AC-PM07:** The `reject` response (§6.3) MUST reject all pending `ask` requests in the same session.

<a id="AC-PM08"></a>
**AC-PM08:** Default `.env` deny rules (§7.1) MUST deny reading `.env` and `.env.*` files while allowing `.env.example`.

<a id="AC-PM09"></a>
**AC-PM09:** The GUI Permissions tab (§10) MUST display all tool permission keys from §5, support granular rule editing (§10.3), and persist changes to the selected scope's config file (§10.8).

<a id="AC-PM10"></a>
**AC-PM10:** In `yolo` mode, all tools MUST resolve to `allow` (§8 step 1). In `ask`/`plan` modes, all mutating tools MUST resolve to `deny` (§8 step 1).

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
