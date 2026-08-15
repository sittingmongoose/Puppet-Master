# Shard 010: FABLE Residual GitHub Auth Cleanup Addendum - 2026-07-07

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L885-L953

Source SHA256: `9a1b15ff570170004e106ad168572e399378dfbe596bbd6d66b10f9e5437e899`

---

## FABLE Residual GitHub Auth Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE GitHub API auth rows for OAuth device-code mechanics, scope enumeration, and credential-store key naming. Values were checked against official GitHub OAuth documentation during the repair pass.

### GAAAF-014 - OAuth Device Flow, Scope Matrix, And Credential Keys

```yaml
plan_unit_id: GAAAF-014
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  GitHub API auth uses the OAuth device-code flow with explicit device-code request, user-code display,
  interval-governed polling, closed polling errors, operation-specific scope requests, MissingScopes blocked
  behavior, and OS credential-store key naming. Raw tokens and device-code secrets never enter PM storage,
  logs, prompts, exports, or runtime artifacts.
gui_related: true
gui_classification_reason: Device login, missing-scope recovery, and credential health are user-visible auth/setup behavior.
depends_on: [GAAAF-002, GAAAF-006, UCC-030, PS-131]
unblocks: []
acceptance_criteria:
  - Device auth requests and polling use GitHub's documented device-code endpoints and respect returned poll interval.
  - Polling handles authorization_pending, slow_down, expired_token, unsupported_grant_type, incorrect_client_credentials, incorrect_device_code, access_denied, and network_or_rate_limited.
  - Operation scope requests are explicit for repo, workflow, read:org, user:email, and admin:repo_hook.
  - Missing scopes produce blocked_reason_code = missing_scopes with missing_scopes[], credential_ref, account_id, operation_ref, and allowed_action_ids[].
  - Credential storage uses OS credential-store APIs through keyring, service name puppet-master.github_api, and keys github_api/{host}/{account_id}/{credential_ref}.
  - Stored PM records contain credential_ref and metadata only, never raw tokens or device_code secrets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_github_auth_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Multi-Account.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_github_oauth_device_flow_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1251
  - fablereport.md:1252
  - fablereport.md:1253
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
  - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "OAuth device-code"
  - "authorization_pending"
  - "slow_down"
  - "expired_token"
  - "repo"
  - "workflow"
  - "read:org"
  - "OS credential store"
  - "credential_ref"
negative_constraints:
  - Do not store raw OAuth tokens, raw device codes, or client secrets in seglog, redb, Tantivy, logs, prompts, exports, runtime artifacts, or closure evidence.
  - Do not treat GitHub Copilot auth or local Git credential helpers as authorization for GitHub API platform mutations.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Multi-Account.md
  - Plans/Permissions_System.md
```
