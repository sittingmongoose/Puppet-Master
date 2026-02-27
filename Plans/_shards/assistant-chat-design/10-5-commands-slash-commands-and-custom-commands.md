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

Git and GitHub commands are available in chat when the active project is a git repository. All git operations executed via chat use the same code path as the Git panel (Plans/GitHub_Integration.md §A) — they are not separate implementations. ContractRef: Plans/GitHub_Integration.md, Plans/DRY_Rules.md

**Git commands (slash commands):**

| Command | Description | Error behavior |
|---------|-------------|----------------|
| `/git status` | Show current branch, staged/unstaged file count, sync state | Shows "(no repo)" if not a git repo |
| `/git commit <message>` | Commit all staged changes with the given message | "Nothing staged" if no staged files |
| `/git stage <file>` | Stage a specific file (or `.` for all) | "File not found" or "Already staged" |
| `/git push` | Push current branch to tracking remote | Shows auth-expired or unreachable error |
| `/git pull` | Pull with rebase (default) | Shows conflict file list on conflict |
| `/git sync` | Pull then push (equivalent to Sync button) | Stops at first error, shows which step failed |
| `/git branch <name>` | Create and switch to a new branch | "Invalid branch name" on bad chars |
| `/git stash` | Stash all uncommitted changes | "Nothing to stash" if working tree clean |
| `/git log [N]` | Show last N commits (default 10) in chat as a formatted list | — |

**GitHub Actions commands:**

| Command | Description | Error behavior |
|---------|-------------|----------------|
| `/actions` | List recent workflow runs for the current repo with status/log summary fields | "Not linked to GitHub" if no github_api auth |
| `/actions run <workflow>` | Trigger a workflow_dispatch workflow by name | "Permission denied" (403) or "No workflow_dispatch trigger" |
| `/actions logs <run-id>` | Fetch and show log tail (last 200 lines) plus status/log summary for the run | "Run not found" |

- GitHub commands require `github_api` auth realm (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split)
- If not authenticated, commands show inline device-code auth prompt
- All command outputs are rendered as structured chat messages (not raw terminal output)
- Command outputs include a "Open Git Panel" / "Open Actions Panel" deep-link button
- `/actions` and `/actions logs` outputs MUST include the same summary fields defined by `Plans/GitHub_Integration.md §B.3`:
  run status, run conclusion, run duration, failed job count, log truncation state, and last log timestamp.
- `/actions` command failures MUST mirror `Plans/GitHub_Integration.md §B.3` failure-state semantics for auth/rate-limit/list/detail/log failures so chat and panel behavior stay consistent.

---

