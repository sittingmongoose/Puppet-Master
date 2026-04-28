## Canonical owner and consumer reconciliation

This section reconciles GitHub integration consumer semantics with the canonical owner specifications in Plans/Contracts_V0.md, Plans/Executor_Protocol.md, and Plans/Models_System.md.

### Consumer propagation

**Route and open integration**:
- GitHub Integration is a consumer of route_target and OpenSubject semantics.
- When a route_target resolves to a GitHub resource (e.g., `github://owner/repo/file.md`), GitHub Integration interprets the path, fetches the resource, and emits it to the active route (local file, artifact storage, etc.).
- When an OpenSubject references a GitHub concern (e.g., `github://owner/repo/issues/123`), GitHub Integration opens the issue and propagates its metadata (title, labels, state) to the orchestrator's concern record for unified help/escalation.

**Approval scope in GitHub workflows**:
- GitHub Integration respects the active execution_unit_context's approval_scope.
- If approval_scope is 'require_approval' and a GitHub PR review is pending, the approval_id is tied to the GitHub PR review ID so resumption can query the PR status.
- GitHub check runs and CI status are tied to execution_unit_id so the orchestrator can correlate CI outcomes with execution units.

**Account identity and GitHub permissions**:
- GitHub Integration consumes the runtime identity's GitHub_AuthContext (see Plans/GitHub_API_Auth_and_Flows.md).
- All GitHub API calls include the effective_account_id so the audit trail shows which account performed the operation.
- If a GitHub operation requires a different account context (e.g., cross-org access), GitHub Integration triggers a capability check through the runtime identity resolution flow, not a silent re-auth.

**Provider and model in GitHub context**:
- GitHub Integration may invoke providers (e.g., GitHub Copilot, GPT-4) as part of analysis (code review, test generation, etc.).
- Provider selection follows the scoped settings model in Plans/Models_System.md, with GitHub-specific precedence (e.g., prefer GitHub Copilot for GitHub-hosted code).
- Model selection is tied to the active Persona and execution_unit_type, not to the repository or organization.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Models_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md
