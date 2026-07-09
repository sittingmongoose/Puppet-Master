# Shard 017: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1530-L1617

Source SHA256: `0b4f3de3038366fd021ea32775313d8e728f279f7873af2436dd119ed603b467`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host testing adapter and receipt requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### ATS-019 - Containerized Host Adapter And TestRunReceipt Proof

```yaml
plan_unit_id: ATS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated Testing consumes containerized hosts through Test Capability Discovery, Test Harness Probe, TestStrategy
  required_capability_refs, host_capability_ref, host_profile_id or host requirement shape, host preflight, host
  assignment, host instance launch, port/access URL refs, artifact/log expectations, evidence refs, visual evidence
  refs, cleanup/retention disposition, and blocker payloads. Compose scenarios are the primary ATS path for web app
  preview, dependency stack bring-up, and full E2E, with a broader containerized test host adapter family underneath
  for non-Compose and runtime-specific hosts. TestRunReceipt proves containerized execution with host_capability_ref,
  host_profile_id, host_instance_ref or host_instance_id, host_assignment_ref or host_assignment_id, runtime_family,
  runtime_context_ref, optional compose_scenario_ref, image/build refs, port/access URL refs, preflight receipt ref,
  launch receipt ref, harness probe receipt ref, cleanup receipt ref, retain-on-failure state, evidence refs, visual
  evidence refs, and blocker payload.
gui_related: false
gui_classification_reason: Test adapter and receipt proof fields are ATS/runtime contracts, not GUI visual presentation.
depends_on: [ATS-002, ATS-003, ATS-010, CV-303, CRAU-091, SP-226]
unblocks: [EP-109, RAP-042, F3-410]
acceptance_criteria:
  - Test Capability Discovery can detect containerized-host needs and candidate host families.
  - Test Harness Probe proves selected host profile/scenario launchability before test success can be claimed.
  - TestStrategy binds required_capability_refs plus host_profile_id or host requirement shape.
  - TestRunReceipt cannot certify success without host assignment, preflight, launch/execution, evidence, cleanup/retention, or explicit blocker refs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future containerized-host TestRunReceipt schema fixtures
  - future Compose-primary and non-Compose blocked adapter tests
risk_class: containerized_host_test_proof_gap
reasoning_tier: high
context_scope: automated_testing_containerized_hosts
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future Test Capability Discovery
  - future TestRunReceipt schemas
node_compile_hint:
  mode: containerized_host_ats_adapter_receipt_proof
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0014
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0049
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0071
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#ats_adapter_contract
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-002-testrunreceipt-host-fields
source_atom_ids: [atom-0008, atom-0014, atom-0049, atom-0062, atom-0071, atom-0078]
decision_refs: [dec-0014, dec-0015]
preserved_exact_tokens:
  - "Test Capability Discovery"
  - "Test Harness Probe"
  - "TestStrategy"
  - "required_capability_refs"
  - "host_capability_ref"
  - "host_profile_id"
  - "host_preflight_receipt"
  - "host_assignment_id"
  - "host_instance_id"
  - "TestRunReceipt"
  - "Compose primary"
  - "broader containerized test host adapter family underneath"
  - "web app preview"
  - "dependency stack bring-up"
  - "full E2E environment"
  - "visual evidence refs"
  - "blocker payload"
negative_constraints:
  - Do not make Compose the only possible ATS path.
  - Do not treat a running container as test completion or success without ATS evidence and receipts.
  - Do not require human eyeballing for host/test completion.
  - Do not bind ATS truth to backend container ids.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
