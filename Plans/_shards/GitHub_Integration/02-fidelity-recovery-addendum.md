## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-040: Source Control and worktree handshake

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0335
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - impacted surface: Source Control and GitHub worktree views.
  - clearly separates Source Control from GitHub Actions and places worktree management in Health/Settings, but does not yet express the stronger Orchestrator-vs-Source-Control lane/worktree boundary.
  - worktree prune/remove and cleanup actions should disclose:
  - worktree actions must preserve safe-point and remediation lineage
  - Source Control owns concrete worktree actions and compact inventory display
  - Current docs expose worktree actions and blocked classifications, but they do not yet define the full lane/worktree cleanup lifecycle.
  - active-run ownership must be visible before destructive worktree actions
  - Add the missing schema/record families that docs already require in practice: runtime-artifact schemas, durable worktree records/projections, and command families for account/concern/promotion actions.
  - Source Control is the primary operational surface for worktree inventory and actions
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0336
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Replace GitHub `login` as a stable key with internal `account_id`, while keeping `login` as provider-native disclosure metadata.
  - login
  - account_id
  - Replace mutable display identities like GitHub `login` as storage keys with stable internal account ids while keeping display identities audit-only.
  - the GitHub realm split is still correct; the fix is stable account identity inside each realm, not realm collapse
  - Repair GitHub account identity handling end-to-end:
  - Deferred GitHub Recovery Binding now fits more naturally as blocked-episode `detail_ref` / wizard-blocked attachment than as a new standalone runtime object
  - detail_ref
  - GitHub recovery and command ownership remain under-keyed:
  - GitHub durable identity is still keyed by `login`, conflicting with the stable internal account model.
  - Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`, keeping `login` and provider identity display-only.
  - credential_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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

