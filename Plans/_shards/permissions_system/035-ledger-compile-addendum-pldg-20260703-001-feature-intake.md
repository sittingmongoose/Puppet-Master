# Shard 035: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Permissions_System.md`

Source lines: L8594-L8864

Source SHA256: `9aaebb4076398655d3e72ea34024342ef2d315b82a167c3390e6a3d78fb4f205`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PS-127 - P0-PLAN-ACT-PERMISSION-BOUNDARY

```yaml
plan_unit_id: PS-127
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PLAN-ACT-PERMISSION-BOUNDARY (P0) is compiled as canonical Puppet Master intent for Plan/Act/autonomy boundaries must be runtime enforced: Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed. The preserved PM gap/delta is: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema. The observed external-repo signal remains source-lineage evidence: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p0_plan_act_permission_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY@line=4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0008
external_atom_id: extrepo-20260703-0004
source_row_id: P0-PLAN-ACT-PERMISSION-BOUNDARY
priority: P0
finding_family: Plan/Act/autonomy boundaries must be runtime enforced
source_repos:
- cline/cline
- openai/codex
- warpdotdev/warp
target_docs:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0004
- P0-PLAN-ACT-PERMISSION-BOUNDARY
- P0
- Plan/Act/autonomy boundaries must be runtime enforced
- cline/cline
- openai/codex
- warpdotdev/warp
negative_constraints: []
observed_signal: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
pm_current_coverage: PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.
pm_gap_or_delta: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.
proposal_or_recommendation: Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.
compile_disposition: create_new_planunit
```

### PS-128 - P0-PROVIDER-EGRESS-HTTP-POLICY

```yaml
plan_unit_id: PS-128
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PROVIDER-EGRESS-HTTP-POLICY (P0) is compiled as canonical Puppet Master intent for User-configurable provider endpoint egress, redirect, timeout, and SSRF policy: Imported external-repo finding extrepo-20260703-0076 / P0-PROVIDER-EGRESS-HTTP-POLICY (P0): None The preserved PM gap/delta is: ProviderCapabilityEpoch and provider policy covered model/account/capability identity, but did not fully specify network-layer egress rules for custom provider URLs. The observed external-repo signal remains source-lineage evidence: Pi issue #6280 requests app-enforced HTTP redirect/error/custom fetch/timeout/cancel policy for provider requests, especially user-configurable OpenAI-compatible URLs. | Codex changelog references approved OpenAI hosts, short-lived remote-control tokens, and browser-origin websocket handshake rejection. | Cline/OpenCode/Pi all expose broad OpenAI-compatible/custom provider surfaces.
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0076/P0-PROVIDER-EGRESS-HTTP-POLICY@line=3
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
  P0-COMMAND-APPROVAL-LEASE (P0) is compiled as canonical Puppet Master intent for Command approval lease bound to normalized command identity: Imported external-repo finding extrepo-20260703-0090 / P0-COMMAND-APPROVAL-LEASE (P0): None The preserved PM gap/delta is: Approval must be a lease over invocation form, cwd/env, namespace, purpose, normalized command hash, and retry lineage. The observed external-repo signal remains source-lineage evidence: Cline posix_spawn bug for structured command string; Codex PRs around shell approval boundaries, PowerShell wrappers, command identity, approval purpose.
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
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0090/P0-COMMAND-APPROVAL-LEASE@line=3
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
