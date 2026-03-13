## 5. Commands (slash commands and custom commands)

This section defines the **reserved slash commands** — built-in actions invoked via `/` in chat. For **User Commands** (user-authored command presets with templated prompts, stored as `.md` files), see `Plans/Commands_System.md` (canonical SSOT). User Commands and reserved slash commands share the chat `/` autocomplete surface; reserved names take precedence and MUST NOT be overridden.

**Distinction:** Reserved slash commands listed below are **UICommand dispatch actions** (each has a `cmd.chat.*` ID in `Plans/UI_Command_Catalog.md` §2.7). User Commands are **prompt presets** — they resolve a template and submit it as a prompt. The two concepts are orthogonal; see `Plans/Commands_System.md` §1.2 for the full distinction.

ContractRef: ContractName:Plans/Commands_System.md#DEF-UICOMMAND-DISTINCTION, ContractName:Plans/UI_Command_Catalog.md

- **Slash commands in the GUI:** The app supports **slash commands** (e.g. `/new`, `/model`, `/export`, `/compact`, `/stop`) invoked by typing `/` in chat or via a command palette. Unlike CLIs, slash commands here are a first-class GUI feature so the user can run actions without leaving the chat.
- **User Commands (presets):** Users can define custom prompt-template commands stored as `.md` files at project level (`.puppet-master/commands/<name>.md`) or global level (`~/.config/puppet-master/commands/<name>.md`). Full schema, template syntax, permissions integration, and GUI requirements are specified in `Plans/Commands_System.md` (SSOT). Custom commands appear in the `/` autocomplete popup alongside reserved commands, prefixed with `/x-` by convention.
- **No conflicting names:** The app does **not** allow the user to define a custom command whose name clashes with a reserved command; if they try, the UI explains why (e.g. "This name is reserved for a built-in command"). Enforcement rules: `Plans/Commands_System.md` §2.4.
- **Reserved Slash Commands (Canonical List):**

| Command | Action | Scope |
|---------|--------|-------|
| `/new` | Start a new thread | Chat |
| `/model` | Switch model for next turn | Chat |
| `/effort` | Set effort/reasoning level | Chat |
| `/mode` | Switch mode (Ask/Plan/Interview/BrainStorm/Crew) | Chat |
| `/export` | Export thread as Markdown/JSON | Chat |
| `/clear` | Clear current thread history | Chat |
| `/help` | Show available commands | Global |
| `/settings` | Open settings panel | Global |
| `/doctor` | Run Doctor health checks | Global |
| `/cancel` | Cancel current run | Chat |
| `/stop` | Stop streaming response | Chat |

User-defined custom commands MUST NOT use any reserved command name. Custom commands are prefixed with `/x-` by convention (e.g., `/x-deploy`).

This list is the SSOT for reserved slash commands. The canonical machine-readable list is in `Plans/UI_Command_Catalog.md`. For User Commands (presets), the SSOT is `Plans/Commands_System.md`.

### 5.1 Git & GitHub Slash Commands

Git and GitHub slash commands are split by surface ownership.

### Source Control commands
- `/git` and related git-local operations target the Source Control surface and reuse the same code path as Source Control actions.
- Chat git commands may open or focus Source Control with repo/worktree context when a visual follow-up is needed.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### GitHub Actions commands
- `/actions` and `/actions logs` target the GitHub Actions surface and must mirror its run/log/admin failure semantics.
- Chat responses for Actions runs must preserve workflow/run/job/step identity so the user can continue in the GitHub Actions surface without losing context.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### Surface boundary rule
- Chat must not present the old combined Git/GitHub panel model as canonical.
- When the user asks to inspect repo state, route to Source Control semantics.
- When the user asks to inspect hosted workflows or GitHub Actions logs/settings, route to GitHub Actions semantics.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md

### 7.1 Capability introspection (`capabilities.get`)

When the user asks about available capabilities, features, or what Puppet Master can do, the Assistant MUST call `capabilities.get` and present the results as a structured list of **enabled** capabilities, **disabled** capabilities with their disabled reasons, and setup guidance (setup hints). This ensures the user gets an accurate, real-time answer rather than a stale or generic one.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM

### 7.2 Natural-language model override (per-message only)

The user may specify a per-message model override inline in their prompt (e.g., *"generate an image using Nano Banana Pro"*). This override applies to the **current `media.generate` invocation only** and MUST NOT change the persistent model configured in Settings. Resolution order: alias → exact model ID → exact displayName → else `MODEL_UNAVAILABLE`. For the full slot-extraction grammar and resolution rules, see `Plans/Media_Generation_and_Capabilities.md` §3.4 (SSOT).

ContractRef: ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#SLOT-EXTRACTION

### 7.3 Media generation invocation model

Media generation (Image, Video, TTS, Music) is invoked primarily by **natural language** — the user describes what they want in the chat, and the Assistant extracts structured parameters via the slot-extraction grammar (`Plans/Media_Generation_and_Capabilities.md` §3). The **capability picker dropdown** in the composer (see `Plans/FinalGUISpec.md` §7.16) is a convenience helper that inserts a guided prompt; it does not bypass the natural-language pipeline.

ContractRef: ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE

### 7.4 External link navigation and repo import (MVP — separate from project-workspace search)

This subsection defines **network-based navigation** (web pages, GitHub links, docs) and **external repo import** as an explicit, user-requested capability. It is **separate** from default **project workspace / project root** search (codesearch, chatsearch, logsearch), which is always scoped to the current project unless the user explicitly asks to go external.

#### 7.4.1 Link navigation: fetch + cite

- **Navigate / fetch:** When the user provides a link (HTTP/HTTPS) and asks the assistant to read it, the assistant MAY invoke `webfetch` to retrieve the content (subject to `webfetch` permissions and allow/deny rules in `Plans/Permissions_System.md` and FileSafe URL rules).
- **Citations:** When fetched content is used for claims, the assistant MUST include citations (URLs and titles) consistent with the cited web-search contract in `Plans/newtools.md §8.2.1`.
- **Audit trail:** Each `webfetch` MUST emit an audit entry in the thread (see §13): URL fetched, HTTP status (if known), bytes fetched or truncation note, and whether content was used as a source.

#### 7.4.2 External repo import: bring a repo into the project so it can be searched

- **User intent required:** Importing a repo is only performed when the user explicitly requests it (e.g., "Pull this repo in so you can inspect it" / "Clone this repo into the project").
- **Resulting scope:** After import, the repo becomes part of the **project workspace** (as a new project, an added workspace root, or a temporary mount) and can then be searched using the **project-scoped** code/log/chat retrieval features described in §10 and §17.
- **Allowed sources:** MVP supports GitHub repositories; additional hosts (GitLab, Bitbucket, arbitrary git remote) are permitted only if explicitly enabled via Settings/Permissions allowlists.
- **Two acquisition paths (both allowed):**
  1. **GitHub API assisted:** Use `GitHubApiTool` (Plans/Tools.md) to resolve repository metadata and determine clone/download URLs (auth per `Plans/GitHub_API_Auth_and_Flows.md`). Then perform an authenticated clone/download using the resolved URL (see below).
  2. **Direct git clone:** Use `bash` to execute `git clone` from an HTTPS remote when permitted (still subject to network/tool approval, FileSafe guards, and audit trail).
- **No `gh` rule:** GitHub CLI (`gh`) remains forbidden for GitHub operations (Plans/Tools.md: GitHubApiTool rules).
- **Private repos / auth:** Private repository import MUST require explicit user approval and an authenticated method (GitHub auth realm `github_api` per `Plans/Contracts_V0.md` + `Plans/GitHub_API_Auth_and_Flows.md`). If auth is missing/expired, the assistant must guide the user through the supported login flow rather than attempting unauthenticated access.
- **Destination and exposure:** Import destinations MUST be under configured workspace roots and must respect external-directory constraints (Permissions `external_directory`). The assistant must never import into a path that violates FileSafe path rules. Imported repos must not silently overwrite existing directories; require explicit confirmation when destination exists.
- **Indexing:** Imported repo contents are eligible for the code index (Tantivy + LSP + ripgrep per Plans/storage-plan.md + Plans/Tools.md) after import completes; indexing progress should be visible (optional spinner/indicator).
- **Audit trail:** Repo import MUST be recorded in the thread (see §13): source URL / repo identifier, chosen acquisition path (API-assisted vs direct clone), destination path, and a summary of what was imported (commit/branch if known).
- **Settings & permissions:** External repo import must be controllable via:
  - Tool permissions (`webfetch`, `websearch`, `bash`, `GitHubApiTool`, and `repo.import` if implemented as a dedicated tool).
  - Host allowlist / denylist for network destinations (Settings/Permissions; default action for unknown hosts remains `ask`).
  - **Secrets policy (mandatory):** All persisted chat/log/index content MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (strict secrets scrubbing before seglog/redb/Tantivy/blob persistence). An optional additional “secret-ish” heuristic redaction setting exists for extra masking (default OFF; see Plans/storage-plan.md + FinalGUISpec.md).

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

---
