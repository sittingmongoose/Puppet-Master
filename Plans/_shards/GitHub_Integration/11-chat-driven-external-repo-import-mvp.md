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

Deferred or GitHub-seeded wizard/runtime flows must preserve blocked-state identity, recovery context, and local generated artifacts.

**recovery binding** record:
- `project_id`
- `focused_run_id?`
- `wizard_id?`
- `thread_id?`
- `run_id?`
- `node_id?`
- `attempt_id?`
- `account_id`
- `credential_ref`
- `login`
- `resume_url?`
- deferred payload ref
- `blocked_sequence?`
- `replan_generation?`
- clearing status

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Rules:
- deferred wizard launch paths must support both `attention_required` and `blocked`
- any stored `resume_url` or preloaded wizard payload must survive blocked-state recovery and deep-link reopening
- if a GitHub-seeded wizard becomes blocked, resume MUST return to the same wizard instance/context rather than creating a fresh blank flow
- if the blocked state is tied to a runtime node/attempt, the deferred GitHub context remains linked to that originating node/attempt
- auth-blocked GitHub actions surface canonical recovery actions rather than integration-specific fallback loops
- repo-import or workflow-generation flows that become blocked preserve local generated artifacts and mark remote steps as blocked explicitly
- the binding is created before handing control to deferred GitHub auth/import/launch flows
- if the deferred flow blocks, the runtime blocked episode references this binding
- the binding is cleared only when the deferred flow completes successfully, the owning blocked episode is abandoned, or the wizard/run context is cancelled or superseded
- approval or auth resolution wakes the scheduler/event consumer immediately; it is not a polling loop

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Acceptance criteria:
- no-wizard/deferred GitHub entry paths do not lose blocked-state recovery
- deep links and preloaded payloads remain stable across blocked/unblocked transitions

Required fields:
- project_id
- focused_run_id
- account_id
- credential_ref
- login
- resume_url

Canonical terms and values:
- route_target
- account_id
- credential_ref
- login
- resume_url

Labels:
- recovery binding

ContractRef: Plans/Contracts_V0.md#7.3 `route_target`, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Behavioral rules:
- Deep-link recovery must serialize canonical route identity rather than inventing a second routing model.
- GitHub reconnect context must use stable internal account identity rather than login-keyed recovery.