## Chat-driven external repo import (MVP)

Puppet Master Assistant Chat supports importing an external repository (typically a GitHub repo) into the **project workspace** when the user explicitly requests it (see `Plans/assistant-chat-design.md` §7.4).

### Requirements

- **Explicit user intent:** The assistant must not import repos opportunistically. Import occurs only when the user asks to pull a repo in for inspection or work.
- **Auth + API rule:** All GitHub HTTPS API calls (repo lookup, forks, PR metadata, archive URLs) MUST use `GitHubApiTool` (Plans/Tools.md). GitHub CLI (`gh`) remains forbidden for these operations.
- **Acquisition methods:** MVP supports:
  1. API-assisted resolution (GitHubApiTool resolves metadata/URLs) + clone/download
  2. Direct `git clone` over HTTPS via `bash` when permitted
- **Placement modes (user-selected):**
  - **new_project**: create a new project rooted at the imported repo
  - **add_workspace_root**: add the imported repo as an additional workspace root under the current project
  - **temporary_mount**: mount/import for read-only inspection without permanently expanding the project roots (still auditable)
- **Permissions:** Import must be governed by:
  - `repo.import` permission key (default ask),
  - network tool permissions (`webfetch`, `websearch`, `bash` as applicable),
  - `external_directory` constraints for destination paths,
  - domain/host allowlists for remote hosts (default ask).
- **Audit trail:** Import actions must be recorded as thread audit entries: source, destination, method used, and (when known) repo owner/name + default branch/commit.

ContractRef: ToolID:GitHubApiTool, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md
