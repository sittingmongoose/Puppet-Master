# Shard 027: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Contracts_V0.md`

Source lines: L17632-L17699

Source SHA256: `f5da31183d992c2a90a5f65d54da61652301e8b9736cb27a0025cc6809342648`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### CV-291 - Discovery Schema, Enums, Events, And Receipt Payloads

```yaml
plan_unit_id: CV-291
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the promoted shared discovery enum, event, and receipt envelope terms used by DiscoveryService and discover_paths. Discovery-local surface_type values are assistant_chat_thread, assistant_chat_file_mention, quick_open, search_path_filter, file_manager, planning_wizard_source_picker, prd_builder_source_picker, orchestrator_agent, executor_agent, worknode_intake, runtime_artifacts, and agent_tool. Discovery-local target_kind values are file, directory, file_or_directory, module, test, doc, config, content_candidate, and mixed, and they must not alter the existing route_target.target_kind enum. Receipt events include discovery.invoked, discovery.candidates_returned, discovery.selected, discovery.fallback, discovery.verified, discovery.disabled, discovery.unsupported, and discovery.backpressure. Receipt payloads preserve request_id, consumer_id, project/worktree or remote identity, query_digest, visible post-policy candidate_count, opaque/redaction-profiled selected_result_ids, freshness_state, fallback_state, policy_decision, source_index_generation, cache/ranking/policy/ignore/identity versions when cached, permission_snapshot_id, approval_scope_key, redaction_profile, SSH host trust fields when applicable, budget_ms, elapsed_ms, error_code, and verification_receipt_ref when available.
gui_related: false
gui_classification_reason: This is schema and event envelope ownership, not GUI presentation.
depends_on: [CV-006, CV-038, CV-097, CV-101, CV-285, T-161]
unblocks: [T-161, ACD-422, ATS-011, RAP-031]
acceptance_criteria:
  - Discovery enum values are namespaced as discovery-local and do not mutate route/open target enums.
  - Receipt payloads use post-policy candidate counts and opaque selected_result_ids.
  - SSH/remote trust and credential fields carry references only and never secret material.
validation_surfaces:
  - PYTHONPATH=/tmp/pm_pyyaml python3 scripts/pm-plan-index.py validate
  - Future discovery schema and receipt envelope tests.
risk_class: contract_schema_drift
reasoning_tier: standard
context_scope: shared_discovery_contracts
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Tools.md, future discovery receipt schemas]
node_compile_hint: {mode: shared_contract_envelope, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0051
  - pldg-20260622-001-fff:atom-0035
  - pldg-20260622-001-fff:atom-0036
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:atom-0095
  - pldg-20260622-001-fff:state/precision_contract.json#exact_value_registry
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Helmholtz
source_atom_ids: [atom-0035, atom-0036, atom-0051, atom-0063, atom-0076, atom-0088, atom-0090, atom-0091, atom-0095]
preserved_exact_tokens:
  - "surface_type"
  - "assistant_chat_thread"
  - "assistant_chat_file_mention"
  - "quick_open"
  - "search_path_filter"
  - "file_manager"
  - "planning_wizard_source_picker"
  - "prd_builder_source_picker"
  - "orchestrator_agent"
  - "executor_agent"
  - "worknode_intake"
  - "runtime_artifacts"
  - "agent_tool"
  - "target_kind"
  - "file_or_directory"
  - "content_candidate"
  - "fallback_state"
  - "policy_decision"
  - "candidate_count visible post-policy only"
  - "selected_result_ids as opaque/redaction-profiled ids"
  - "credential_handle_ref without secret material"
negative_constraints:
  - Do not merge DiscoveryRequest.target_kind with route_target.target_kind.
  - Do not expose raw selected paths or blocked counts through receipt payloads.
  - Do not store or display SSH secret material in cache keys, receipts, diagnostics, or prompts.
owner_hints: [Plans/Contracts_V0.md, Plans/Tools.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```
