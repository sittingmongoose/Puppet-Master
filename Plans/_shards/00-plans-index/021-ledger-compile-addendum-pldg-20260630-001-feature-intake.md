# Shard 021: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/00-plans-index.md`

Source lines: L4907-L5002

Source SHA256: `4d4d874c5978d9117cfc3992a6422d88dd86c78f35a94819259aa172968d8e27`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum registers the containerized-hosts compile owner map. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, implementation files, runtime dispatch, production build tasks, or a governance seal.

### 0PI-065 - Containerized Hosts Compile Owner Map

```yaml
plan_unit_id: 0PI-065
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  The containerized-hosts ledger compiles into existing owner docs rather than a new Coasts or Hosts plan doc.
  Containers_Registry_and_Unraid owns PM-native containerized-host capability, Docker Manager ownership, the
  RuntimeHostFamilyProfile whole-MVP matrix, and Docker/Hosts operational boundaries. Contracts_V0 owns
  host_capability_ref, host_profile_id, host instance/assignment/receipt/blocker envelopes, HostCapabilityCommand,
  and HostOperationRequest. storage-plan owns persisted host profile, instance, assignment, build artifact,
  port_access_record, receipt, projection, cleanup, and retention records. Permissions_System and FileSafe own host
  trust, approval, secret, mount, network, Docker socket, remote-side-effect, and FileSafe gates. Automated_Testing_System
  owns the containerized-host adapter, Compose-primary test path, and TestRunReceipt proof fields. Executor_Protocol,
  Run_Modes, Tools, orchestrator-subagent-integration, assistant-chat-design, Orchestrator_Page, Run_Graph_View,
  FinalGUISpec, UI_Command_Catalog, and Runtime_Artifacts_Panel consume those owner contracts for execution lanes,
  agent use, visible readiness, routed Docker/Hosts navigation, command envelopes, and evidence projection without
  becoming host mutation authorities.
gui_related: false
gui_classification_reason: This index entry records owner routing and compile lineage; GUI behavior is owned by referenced GUI PlanUnits.
depends_on: [PDS-003, PNC-001]
unblocks: []
acceptance_criteria:
  - Containerized-hosts ownership is registered without creating a separate Coasts website, a new Activity Bar slot, or a new owner doc.
  - "`Docker/Hosts` remains a routed primary-content page/lab opened from Docker Manager and cross-surface links while `docker_manager` remains the Activity Bar side-panel owner and command namespace."
  - Coasts and PMConcept.html remain source-lineage or directional evidence only.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260630-001-feature-intake
  - git diff --check
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: containerized_hosts_compile_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
node_compile_hint:
  mode: containerized_hosts_owner_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/current.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/handoff.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0006
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0017
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0055
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0076
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0082
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json
source_atom_ids: [atom-0006, atom-0017, atom-0051, atom-0054, atom-0055, atom-0056, atom-0076, atom-0082]
decision_refs: [dec-0001, dec-0003, dec-0004, dec-0005, dec-0011, dec-0017, dec-0018, dec-0019, dec-0020]
preserved_exact_tokens:
  - "containerized hosts"
  - "Docker/Hosts"
  - "docker_manager"
  - "Activity Bar side-panel owner"
  - "routed primary-content page"
  - "Coasts source-lineage"
  - "PMConcept.html"
  - "whole thing for mvp"
  - "HostCapabilityCommand"
  - "RuntimeHostFamilyProfile"
negative_constraints:
  - Do not compile containerized-host ownership into a separate Coasts website, vendored Coasts daemon, new Hosts owner doc, new Activity Bar slot, or stale `newtools.md` owner bridge.
  - Do not promote Coasts runtime claims, PMConcept.html concept code, or ledger prose into product canon without PM-owned PlanUnits.
  - Do not call this compile governance sealed until an explicit governance seal phase refreshes generated governance artifacts.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Tools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```
