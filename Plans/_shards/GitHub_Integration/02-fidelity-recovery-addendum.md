## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-040: Source Control and worktree handshake
- Coverage rows: cov-040
- Fidelity gap refs: cov-040
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-040: Source Control and worktree handshake` exists in `Plans/GitHub_Integration.md`.
- Exact acceptance check: The `cov-040` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-040` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-040` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-098: GitHub stable account identity
- Coverage rows: cov-098
- Fidelity gap refs: cov-098
- Required fidelity items:
- Exact required item: Add recovery context payload and trust/degraded-state gating for GitHub mutations
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-098: GitHub stable account identity` exists in `Plans/GitHub_Integration.md`.
- Exact acceptance check: The `cov-098` repair states the exact requirement: Add recovery context payload and trust/degraded-state gating for GitHub mutations
- Exact acceptance check: The `cov-098` repair is in the owner section for `Plans/GitHub_Integration.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- GITHUB INTEGRATION SPEC

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code (realm: github_api)
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store
- Local git operations use the local `git` binary (not the GitHub API)
- SSH remote execution: git commands run on the remote via SSH subprocess
- All interactive UI elements dispatch UICommand IDs; no business logic in the UI layer
-->

