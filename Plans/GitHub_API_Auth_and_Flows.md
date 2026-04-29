# Puppet Master -- GitHub API Auth and Flows

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0329
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - GitHub auth retry rules conflict with multi-account failover expectations.
  - Docker/media/provider flows usually stop at provider/model, not account-resolution lineage.
  - likely issue: Source Control ownership and GitHub actions remain branch/worktree-centric, without package/seam/lane-aware visibility.
  - `Plans/GitHub_API_Auth_and_Flows.md`
  - Plans/GitHub_API_Auth_and_Flows.md
  - `Plans/GitHub_API_Auth_and_Flows.md` + `Plans/GitHub_Integration.md`
  - Plans/GitHub_Integration.md
  - GitHub auth docs preserve realm isolation correctly, but still fail to bind GitHub identity to stable internal `account_id` plus disclosure-only provider metadata.
  - account_id
  - Ensure cleanup/archive/remove flows always preserve historical lane/worktree lineage and safe-point/remediation linkage.
  - project identity must stay stable across path moves/rebinds and across worktree-aware flows.
  - `storage-plan.md` defines project state for Source Control, GitHub Actions, and Docker Manager
  - storage-plan.md
  - duplicating provider/account/runtime identity logic for conversational flows
  - GitHub auth/integration docs mostly model effective identity only
  - Re-anchor blocked/HITL/policy flows on canonical node/attempt identifiers where appropriate.
  - recovery snapshots in wizard-driven flows need enough intent/wizard-step state to avoid restoring into the wrong execution mode
  - auth/integration flows model effective GitHub identity weakly or single-account-only
  - GitHub docs have a very specific identity-contract flaw:
  - structural concern actions (`merge`, `split`, `supersede`) likely need guided flows rather than one-click menus because they change search/history/ledger interpretation
  - merge
  - split
  - supersede
  - GitHub remains the sharpest account-identity mismatch:
  - GitHub account identity is still anchored to mutable login at the auth boundary:
  - `cmd.github.connect` is still effectively arg-less even though reconnect must bind back to a blocked run/node/thread/wizard context
  - cmd.github.connect
  - Add a canonical GitHub recovery context payload that can round-trip blocked episode, project, actor kind, auth realm, and effective-account refs.
  - GitHub auth/scope/rate-limit failures likely need concern hooks without collapsing blocked-owner semantics into generic error banners.
  - reset flows should distinguish:
  - wizard flows use serialized `resume_url`
  - resume_url
  - `CLI_Bridged_Providers.md` normalizes auth lifecycle only
  - CLI_Bridged_Providers.md
  - this requested-account model is orthogonal to auth-surface selection; both requested auth mode and requested account can coexist
  - the system also needs operational identity classes like GitHub API identity, registry/namespace identity, and Kubernetes context/cluster identity
  - this seam affects Orchestrator, GitHub Actions, Docker Manager, Usage, History, and Ledger at the same time
  - artifact panels and evidence flows still lack runtime-trust/provenance fields strong enough to support direct-record fallback behavior
  - still lacks canonical mappings/families for HITL, account management, concern flows, promotion flows, and freshness-gated mutation commands.
  - `Progression_Gates.md` remains heavily planning-artifact-centric, with duplicated addenda and zero formal gate coverage for concern/corroboration/promotion/runtime blocked/governance flows.
  - Progression_Gates.md
  - mutation/recovery flows cannot be audited or repaired correctly without stable workspace and provider-attempt anchors
  - `Runtime_Artifacts_Panel.md` already needs canonical linkage into Source Control / GitHub / Docker / Usage, but it still lacks a normalized operational-identity field family.
  - Runtime_Artifacts_Panel.md
  - it keeps attempt/safe-point/remediation opens stable across cleanup/archive/remove flows
  - But wizard/attention flows already use exact deep links via `resume_url`, and Usage/artifact surfaces already imply identity-native jumps using `usage_event_ref` and related canonical refs.
  - usage_event_ref
  - Upstream draft/generation flows already rely on artifact-first behavior, but there is still no single shared contract saying these surfaces open by subject identity first and path second.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `resume_url` and some attention flows are more exact than general-purpose search and cross-surface pivots, which is backwards.
  - `OpenCode_Deep_Extraction.md` source-verified that OpenCode’s SSE bus and auth model are process-global/server-global, making per-session/per-run identity and account binding impossible without explicit PM-side scoping logic.
  - OpenCode_Deep_Extraction.md
  - Several downstream docs still imply special-case top-level fields such as `usage_event_ref`, `wizard_step`, or direct artifact/document IDs in navigation flows.
  - wizard_step
  - `resume_url` flows are still more concrete than the general route contract, which continues to encourage one-off field choices downstream.
  - `resume_url` flows still encode wizard-step detail more concretely than the general route contract.
  - Usage/artifact flows still read as if `usage_event_ref` can stay a first-class top-level route selector instead of normalizing into object identity.
  - restore/history/checkpoint flows are identity-backed and backend-driven
  - Reconcile FileManager so it consumes `OpenSubject` for artifact/document/checkpoint/open-source flows instead of claiming all callers use `OpenFile`.
  - OpenSubject
  - OpenFile
  - Wizard-blocked flows and thread-blocked flows are both using `resume_url`, but the broader route/open rewrite now requires those flows to normalize through canonical object and scope identity first.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - 3. Reconcile routing, blocked-family, and attribution flows end-to-end across owner + consumer docs.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- PLAN DOC REWRITE HEADER

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

LOCKED DECISIONS (DO NOT CHANGE IN THIS DOC):
- GitHub operations: GitHub API provider only; no external auth-shell dependency
- Default auth flow: OAuth device-code
- No secrets in seglog/redb/Tantivy or logs; secrets live only in OS credential store

REWRITE METADATA:
- Doc updated by: GitHub Copilot CLI (deep review pass)
- Legacy intent preserved: YES
- Primary Target Primitives:
  - Provider (GitHub API)
  - Patch Pipeline (local git)
  - Policy Engine / Permissions (redaction, secrets)
  - Session Store (seglog events)
  - UI Surface (commands only; UI holds no business logic)
- Canonical sources referenced (DRY):
  - Plans/Spec_Lock.json
  - Plans/DRY_Rules.md
  - Plans/Contracts_V0.md
  - Plans/Glossary.md
  - Plans/Architecture_Invariants.md
  - Plans/Progression_Gates.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
-->

## Change Summary

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0330
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - At the same time, several route actions clearly need to force a change in destination context:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- 2026-02-25: Added scope-failure UI cross-reference so `MissingScopes` and related auth failures explicitly drive disabled-state behavior for PR/Issues/Actions surfaces in `Plans/GitHub_Integration.md §B`.
- 2026-02-25: Added SSH Remote Dev Server auth context section; added device-code prominence note; cross-references Plans/GitHub_Integration.md §C.

## Purpose
Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.

This document also defines the hard boundary between:
- **Local Git operations** (performed via the local `git` binary), and
- **GitHub hosting operations** (performed via the GitHub HTTPS API).

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

## Canonical data-shape reconciliation

### Required data shape

#### Stable account identity and credential references
- Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`.
- Canonical GitHub runtime and mutation envelopes carry `requested_account_id`, `effective_account_id`, stable `account_id`, `credential_ref`, `account_type`, `account_login`, `execution_role`, `operational_identity`, and `account_switch_lineage[]`.
- `account_login` and any provider-native handle stay descriptive only; `credential_ref` points to the credential-store entry that actually authorizes the GitHub account.

#### Recovery context and mutation gating

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0332
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Deferred GitHub recovery binding still needs `project_id`, `auth_realm`, actor context, and effective-account snapshot/ref to resume safely across projects and actors
  - project_id
  - auth_realm
  - Canonical mutation and audit actions should route by:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Add recovery context payload and trust/degraded-state gating for GitHub mutations.
- Every write-capable GitHub request carries `recovery_context { blocked_sequence, blocked_episode_id, recovery_handshake_state, trust_state, degraded_state, approval_id?, dae_jail_posture }`.
- A GitHub mutation may proceed only after the startup recovery handshake rebinds the current blocked episode, `trust_state` is writable, `degraded_state` is false, and any approval or DAE jail gate has been cleared.

#### Runtime identity and blocked-policy transfer
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- GitHub write attempts mint or reuse the current `blocked_sequence`; startup recovery must rebind that same sequence before resuming deferred work.
- Carry usage switch-history and usage execution-role follow-through.
- Usage and audit rows record `execution_role`, requested/effective account identity, switch history, pressure owner, and the GitHub `account_id` / `credential_ref` pair that actually executed the call.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md
