# Shard 030: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Permissions_System.md`

Source lines: L7866-L7906

Source SHA256: `7a7c451c4367fe93257ee08d522f3a37ec275aa46f036130e30060e49b4f0940`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### PS-118 - Discovery Permission Snapshot, Host-Trust, And Redaction Fields

```yaml
plan_unit_id: PS-118
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissioned discovery requests, results, and receipts carry permission_snapshot_id, approval_scope_key, requested_remote_identity, effective_remote_identity, host_trust_state or known-host outcome, credential_handle_ref without secret material, remote_command_policy_result, and redaction_profile where applicable. Remote manifest discovery is permission/FileSafe-gated before dispatch, and SSH auth failures, passphrase prompts, known-host changes, remote command denial, host unavailable, manifest missing, and approval-required states emit explicit fallback/error receipts plus user-visible prompts or degraded states where appropriate; they never silently become fresh local success results.
gui_related: false
gui_classification_reason: This is permission, SSH trust, credential-handle, and redaction contract ownership; prompt presentation is consumed by GUI docs.
depends_on: [PS-097, PS-098, PS-105, PS-106, PS-110, PS-117, F2-191]
unblocks: [SP-218, ATS-011, ACD-422]
acceptance_criteria:
  - Discovery never stores or displays secret material in permission fields, cache keys, receipts, diagnostics, or prompts.
  - SSH known-host/auth/passphrase/remote-command failures are explicit policy states, not fresh local successes.
  - Receipts preserve permission snapshots and redaction profiles sufficient for audit without leaking protected paths or credentials.
validation_surfaces:
  - Future permission-gated discovery tests.
  - Future SSH auth, known-host, passphrase, remote command denial, and redaction tests.
risk_class: permission_trust_leak
reasoning_tier: high
context_scope: discovery_permission_envelope
implementation_surfaces: [Plans/Permissions_System.md, future DiscoveryService permission context, future SSH prompt flow]
node_compile_hint: {mode: permission_snapshot_trust_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0057
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/precision_contract.json#ssh_topology
source_atom_ids: [atom-0057, atom-0069, atom-0085, atom-0090, atom-0091]
preserved_exact_tokens: ["permission_snapshot_id", "approval_scope_key", "requested_remote_identity", "effective_remote_identity", "host_trust_state", "known-host outcome", "credential_handle_ref without secret material", "remote_command_policy_result", "redaction_profile", "passphrase prompts", "known-host changes", "remote command denial"]
negative_constraints:
  - Do not store or display secret material in discovery requests, cache keys, receipts, diagnostics, or prompts.
  - Do not allow permission or host-trust failure to become fresh local success results.
owner_hints: [Plans/Permissions_System.md, Plans/FileSafe.md, Plans/WorktreeGitImprovement.md, Plans/assistant-chat-design.md]
```
