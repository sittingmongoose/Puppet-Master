# Shard 036: FABLE Residual Permission Consent Cleanup Addendum - 2026-07-07

Source: `Plans/Permissions_System.md`

Source lines: L8702-L8953

Source SHA256: `65f8cfc8efb2bacf69961629152d9bdba0f2c626c8121147d3ec11b2985f1c53`

---

## FABLE Residual Permission Consent Cleanup Addendum - 2026-07-07

This addendum binds skill invocation and other blocked feature actions to the canonical ask/consent flow without creating a Skills-local approval model.

### PS-131 - Invocation-Time Consent Bridge

```yaml
plan_unit_id: PS-131
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Invocation-time consent uses the existing permission ask flow for tools, skills, web operations, and blocked
  feature actions. A blocked invocation carries blocked_reason_code, approval_scope_key, permission_snapshot_id?,
  ordered allowed_action_ids[], requested_permission_state, effective_permission_state, requesting_context, and
  normalized invocation identity. once, for session, and always remain distinct approval leases, while Skills and
  other consumers route to Permissions through command refs instead of local approval dialogs.
gui_related: true
gui_classification_reason: Permission approval cards, remediation actions, and blocked invocation states are user-visible.
depends_on: [PS-041, PS-042, PS-082, SS-035]
unblocks: [SS-035]
acceptance_criteria:
  - Skill `Needs permission` states use the same blocked payload as tool permission prompts.
  - "`cmd.permissions.review_request` opens the canonical approval/settings path with approval_scope_key and requesting_context."
  - "`cmd.permissions.revoke` remains the canonical revocation command for durable rules and must receive rule_id or approval_scope_key plus scope."
  - Approval leases bind to normalized invocation identity, cwd, env digest, namespace, purpose, project/worktree, and retry lineage.
  - Headless ask denial returns a blocked outcome with allowed remediation actions instead of silently failing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: invocation_consent_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
node_compile_hint:
  mode: invocation_time_consent_bridge
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:348
  - fablereport.md:691
  - fablereport.md:696
  - fablereport.md:1047
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "deny"
  - "once"
  - "for session"
  - "always"
  - "approval_scope_key"
  - "allowed_action_ids[]"
  - "cmd.permissions.revoke"
  - "cmd.permissions.review_request"
negative_constraints:
  - Do not create a parallel Skills-only consent dialog.
  - Do not treat approval as reusable CLI privilege outside the normalized invocation identity and approval scope.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
```

### PS-128 - P0-PROVIDER-EGRESS-HTTP-POLICY

```yaml
plan_unit_id: PS-128
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PROVIDER-EGRESS-HTTP-POLICY (P0) is compiled as canonical Puppet Master intent for User-configurable provider endpoint egress, redirect, timeout, and SSRF policy: Imported external-repo finding extrepo-20260703-0076 / P0-PROVIDER-EGRESS-HTTP-POLICY (P0). The preserved PM gap/delta is: ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs. The observed external-repo signal remains source-lineage evidence: Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs. | Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection. | Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 'Provider calls carry ProviderEgressPolicy: redirect behavior, timeout, abort signal, proxy, DNS policy, private-IP/localhost deny-or-allow, certificate policy, allowed host class, and audit receipt.'
- Custom provider URLs cannot follow redirects to unexpected hosts or local metadata endpoints by default.
- Provider transport receipts record effective URL, redirect count, timeout/cancel cause, and policy decision without leaking secrets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- 'Provider calls carry ProviderEgressPolicy: redirect behavior, timeout, abort signal, proxy, DNS policy, private-IP/localhost deny-or-allow, certificate policy, allowed host class, and audit receipt.'
- Custom provider URLs cannot follow redirects to unexpected hosts or local metadata endpoints by default.
- Provider transport receipts record effective URL, redirect count, timeout/cancel cause, and policy decision without leaking secrets.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: p0_provider_egress_http_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0080
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0080
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0076/P0-PROVIDER-EGRESS-HTTP-POLICY@line=76
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0076/P0-PROVIDER-EGRESS-HTTP-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0080
external_atom_id: extrepo-20260703-0076
source_row_id: P0-PROVIDER-EGRESS-HTTP-POLICY
priority: P0
finding_family: User-configurable provider endpoint egress, redirect, timeout, and SSRF policy
target_docs:
- Models_System.md
- Provider_OpenCode.md
- Permissions_System.md
- GitHub_Integration.md
- Contracts_V0.md
- MCP_Integration.md
owner_hints:
- Models_System.md
- Provider_OpenCode.md
- Permissions_System.md
- GitHub_Integration.md
- Contracts_V0.md
- MCP_Integration.md
preserved_exact_tokens:
- extrepo-20260703-0076
- P0-PROVIDER-EGRESS-HTTP-POLICY
- P0
- User-configurable provider endpoint egress, redirect, timeout, and SSRF policy
negative_constraints: []
observed_signal: 'Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs. | Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection. | Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.'
pm_gap_or_delta: ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs.
relationship_to_prior_reports: New P0 network/security edge under the provider work.
compile_disposition: create_new_planunit
```

### PS-129 - P0-COMMAND-APPROVAL-LEASE

```yaml
plan_unit_id: PS-129
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-COMMAND-APPROVAL-LEASE (P0) is compiled as canonical Puppet Master intent for Command approval lease bound to normalized command identity: Imported external-repo finding extrepo-20260703-0090 / P0-COMMAND-APPROVAL-LEASE (P0). The preserved PM gap/delta is: Approval must be a lease over invocation form, cwd/env, namespace, purpose, normalized command hash, and retry lineage. The observed external-repo signal remains source-lineage evidence: Cline posix_spawn bug for structured command string; Codex PRs around shell approval boundaries, PowerShell wrappers, command identity, approval purpose.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- argv approval does not cover shell string
- PowerShell wrapper one-shot approval cannot silently retry changed command
- Approval purpose mismatch requires new approval
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- argv approval does not cover shell string
- PowerShell wrapper one-shot approval cannot silently retry changed command
- Approval purpose mismatch requires new approval
risk_class: p0_security_release_supply_chain_hardening
reasoning_tier: high
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: p0_command_approval_lease
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0094
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0094
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0090/P0-COMMAND-APPROVAL-LEASE@line=90
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0090/P0-COMMAND-APPROVAL-LEASE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0094
external_atom_id: extrepo-20260703-0090
source_row_id: P0-COMMAND-APPROVAL-LEASE
priority: P0
finding_family: Command approval lease bound to normalized command identity
source_repos:
- Cline
- OpenAI Codex
preserved_exact_tokens:
- extrepo-20260703-0090
- P0-COMMAND-APPROVAL-LEASE
- P0
- Command approval lease bound to normalized command identity
- Cline
- OpenAI Codex
negative_constraints: []
observed_signal: Cline posix_spawn bug for structured command string; Codex PRs around shell approval boundaries, PowerShell wrappers, command identity, approval purpose.
pm_gap_or_delta: Approval must be a lease over invocation form, cwd/env, namespace, purpose, normalized command hash, and retry lineage.
compile_disposition: create_new_planunit
```

### PS-130 - PS-130

```yaml
plan_unit_id: PS-130
unit_type: constraint
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Command approval must be modeled as a GUI-visible runtime/tool lease over normalized invocation form, cwd/env, namespace, purpose, policy snapshot, and retry lineage. Approval never becomes reusable CLI privilege.
gui_related: true
gui_classification_reason: Guardrail affects GUI/user-visible terminal/control surfaces.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0120 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Permissions_System.md
node_compile_hint:
  mode: atom_0120
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0120
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0120
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0120
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- Command approval is a GUI-visible runtime/tool lease
- Approval never becomes reusable CLI privilege
- Command approval is a GUI-visible lease
negative_constraints:
- Do not treat command approval as reusable CLI privilege.
compile_disposition: create_new_planunit
```
