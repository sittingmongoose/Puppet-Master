# Shard 027: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1737-L1832

Source SHA256: `2e9c5da5d0b21975070933d08b54fdbc6f97f72aa9f44ec426951fde6864de74`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host evidence projection and receipt browsing boundaries. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### RAP-042 - Containerized Host Evidence Projection And Receipt Browsing Boundary

```yaml
plan_unit_id: RAP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects containerized-host evidence for browsing, inspection, and export without becoming receipt
  truth. Docker/Hosts, Assistant, Orchestrator, Run Graph, Executor, and ATS may open Runtime Artifacts for logs,
  screenshots, browser recordings, traces, health checks, ports, access URLs, command output, stale/gap markers,
  TestRunReceipt, host_preflight_receipt, host_execution_receipt, cleanup_retention_receipt, evidence refs,
  visual_evidence_refs, blocker payloads, and export profiles. The owning receipt, test, storage, executor, and
  container records remain authoritative; stale or missing owner records degrade the view. `blocked != failed` is
  preserved for permission_denied, user_declined, headless_ask_denied, filesafe_blocked, external_side_effect_blocked,
  network_blocked_by_policy, host_unreachable, host_untrusted, test_gap_policy, capability_unavailable,
  projection_stale, needs_review, and indeterminate_remote_outcome. Containerized-host runtime artifact rows link
  `host_preflight_receipt`, `host_execution_receipt`, `cleanup_retention_receipt`, `port_access_record`,
  `permission_snapshot_id`, `filesafe_scope_ref`, `host_assignment_id`, `host_instance_id`, `runtime_context_ref`,
  `blocked_reason_code`, `allowed_action_ids[]`, and `projection_health` back to Docker/Hosts and owner records.
gui_related: true
gui_classification_reason: Runtime Artifacts evidence browsing, logs, screenshots, traces, access URLs, and degraded projection states are user-visible panel behavior.
depends_on: [CV-303, SP-226, ATS-019, EP-109]
unblocks: [ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Runtime Artifacts can show host/test/runtime evidence and receipt refs without replacing owner records as truth.
  - Stale, missing, blocked, and degraded owner records produce visible projection health rather than optimistic success.
  - Manual eyeballing, chat-only observation, and container-started claims cannot certify completion.
  - Blocked permission, FileSafe, policy, host, trust, test-gap, and projection outcomes remain blocked states, not failures.
  - Containerized-host receipt rows expose the receipt family, owning record ref, stale/degraded projection health, blocked reason code, and allowed actions without becoming the receipt authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts containerized-host projection fixtures
  - future blocked != failed projection fixtures
risk_class: runtime_artifact_receipt_authority_drift
reasoning_tier: high
context_scope: containerized_host_artifact_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future Runtime Artifacts containerized-host views
node_compile_hint:
  mode: containerized_host_evidence_projection_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0014
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0020
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0049
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-003-blocker-taxonomy-projection-boundary
source_atom_ids: [atom-0008, atom-0014, atom-0015, atom-0020, atom-0039, atom-0041, atom-0049, atom-0053, atom-0069, atom-0075, atom-0078, atom-0079]
decision_refs: [dec-0008, dec-0014, dec-0015, dec-0020]
preserved_exact_tokens:
  - "Runtime Artifacts as projection/evidence browsing rather than receipt truth"
  - "blocked != failed"
  - "TestRunReceipt"
  - "host_preflight_receipt"
  - "host_execution_receipt"
  - "cleanup_retention_receipt"
  - "logs"
  - "screenshots"
  - "browser recordings"
  - "traces"
  - "health checks"
  - "ports"
  - "access URLs"
  - "stale/gap markers"
  - "visual evidence refs"
  - "permission_denied"
  - "filesafe_blocked"
  - "projection_stale"
  - "indeterminate_remote_outcome"
negative_constraints:
  - Do not make Runtime Artifacts the receipt authority.
  - Do not rely on manual eyeballing or chat-only claims as completion evidence.
  - Do not let stale or missing owner records become final evidence.
  - Do not count blocked permission/FileSafe/policy outcomes as execution failures.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
