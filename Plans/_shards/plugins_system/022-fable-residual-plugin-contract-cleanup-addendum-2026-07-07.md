# Shard 022: FABLE Residual Plugin Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Plugins_System.md`

Source lines: L4122-L4184

Source SHA256: `bf875f3ffc181eb594657726a7bfe97bf5456d5d06d5422d8705286383679d15`

---

## FABLE Residual Plugin Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High plugin rows for manifest permissions/capabilities, sandboxing, signature verification, and hook-name mapping. It does not create a plugin runtime implementation.

### PLUG-064 - Manifest, Sandbox, Signature, And Hook Mapping Contract

```yaml
plan_unit_id: PLUG-064
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Plugin manifests must declare permissions[], capabilities[], sandbox profile, signature metadata, and hook
  registrations before a plugin can be considered installable. Hook names map to canonical lifecycle points instead
  of prose-only labels, and any mutation hook must emit a receipt and trigger permission re-evaluation.
gui_related: true
gui_classification_reason: Plugin install, permissions, and extension points are user-visible management and extension surfaces.
depends_on: [PLUG-001, PLUG-009, PLUG-017, PLUG-026, PLUG-040, PLUG-063, PS-131]
unblocks: []
acceptance_criteria:
  - Manifest permissions[] entries include permission_id, scope, purpose, default_state, requested_actions[], and approval_scope_key?.
  - Manifest capabilities[] entries include capability_id, provider_surface, hook_refs[], data_access, network_access, fs_access, and command_access.
  - Sandbox profiles are none, ui_extension_only, tool_proxy, filesystem_limited, network_limited, or trusted_local; any trusted_local request requires explicit signed provenance and user consent.
  - Signature verification records signature_algorithm, key_id, trust_root_ref, manifest_sha256, package_sha256, verification_status, and failure_reason_code.
  - Hook aliases map pre_tool_invoke to tool.execute.before, post_tool_invoke to tool.execute.after, pre_attempt_start to attempt.start.before, pre_node_dispatch to node.dispatch.before, and post_attempt_complete to attempt.complete.after.
  - Unknown hooks, unsigned privileged packages, and permission/capability mismatches fail install validation before activation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_plugin_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Plugins_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: plugin_residual_manifest_sandbox_signature_hooks
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:937
  - fablereport.md:938
  - fablereport.md:939
  - fablereport.md:940
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "permissions"
  - "capabilities"
  - "sandbox"
  - "signature"
  - "hook"
  - "pre_tool_invoke"
  - "post_tool_invoke"
negative_constraints:
  - Do not implement plugin execution, plugin marketplace behavior, WorkNodes, NodeSeeds, executable queues, production build tasks, or runtime certification evidence.
  - Do not allow a plugin hook to mutate privileged surfaces without a receipt and permission recheck.
owner_hints:
  - Plans/Plugins_System.md
  - Plans/Permissions_System.md
  - Plans/MCP_Integration.md
```
