# Shard 020: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L5656-L5956

Source SHA256: `6c19618bac5e01bd203cecfa94832862fc98fd18b0d540c9542112916d6b7cb5`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles accepted containerized-host ledger atoms into PM-native container, runtime-family, and Docker/Hosts owner requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### CRAU-090 - Containerized Hosts PM-Owned Capability And Source-Lineage Boundary

```yaml
plan_unit_id: CRAU-090
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containerized hosts are a PM-owned native capability inspired by Coasts source-lineage, not a Coasts daemon,
  Coastguard web UI, React/Vite transplant, vendored dependency, adapter target, or upstream execution authority.
  Useful lineage concepts such as Coastfile, Git worktrees, offline-first operation, dynamic/canonical ports,
  build-once/run-many, Host/Instance/Build/Port/Assignment separation, and access quick links may inform PM-native
  contracts only where separately accepted. Upstream privileged DinD, daemon/service authority, SSH tunnel posture,
  command/custom secret extractors, local API/CORS/WebSocket terminal/file controls, passwordless sudo, GatewayPorts,
  docker.sock, and upstream UI are source-lineage or rejected defaults unless PM-owned validation and gates accept them.
gui_related: false
gui_classification_reason: This unit owns container/runtime product boundaries and source-lineage disposition, not visual presentation.
depends_on: [CRAU-002, 0PI-065]
unblocks: [CRAU-091, CRAU-092, CV-303, CV-304, ATS-019, F3-410]
acceptance_criteria:
  - Coasts is cited as source-lineage inspiration only and never as PM execution authority or runtime proof.
  - PM canonical owner docs win conflicts over Coasts, ledger prose, stale `newtools.md`, and concept files.
  - Source-lineage concepts become PM obligations only through accepted PM-native PlanUnits.
  - Privileged, remote, terminal, file, service, secret-extractor, docker.sock, passwordless sudo, and GatewayPorts patterns are blocked, gated, or disabled unless PM-owned validation accepts them.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260630-001-feature-intake
risk_class: source_lineage_boundary
reasoning_tier: high
context_scope: containerized_hosts_source_lineage
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager containerized host capability
node_compile_hint:
  mode: containerized_hosts_source_lineage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0006
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0009
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0010
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0027
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/coasts_upstream_and_plans_inspection_20260630.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json
source_atom_ids: [atom-0006, atom-0009, atom-0010, atom-0027, atom-0051, atom-0054, atom-0056, atom-0065, atom-0074]
decision_refs: [dec-0001, dec-0003, dec-0016, dec-0017, dec-0019]
preserved_exact_tokens:
  - "containerized hosts"
  - "https://github.com/coast-guard/coasts"
  - "Coasts (Containerized Hosts)"
  - "PM-owned native capability"
  - "Coastguard web UI"
  - "Coasts daemon"
  - "Coasts source-lineage"
  - "not proof of PM-supported runtime modes"
  - "newtools.md"
  - "Coastfile"
  - "Git worktrees"
  - "dynamic/canonical ports"
  - "offline-first"
  - "build once, run N instances"
  - "Host/Instance/Build/Port/Assignment"
  - "GatewayPorts"
  - "docker.sock"
negative_constraints:
  - Do not blindly vendor or rely on the upstream Coasts daemon as PM's control plane.
  - Do not make Coasts' web UI the PM product surface.
  - Do not treat Coasts runtime claims as PM-supported runtime evidence.
  - Do not promote `newtools.md` compatibility bridges or stale owner hints into product canon.
  - Do not import Coasts passwordless sudo, GatewayPorts, docker.sock, or upstream daemon/service authority as PM defaults.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### CRAU-091 - RuntimeHostFamilyProfile MVP Matrix And Capability Probes

```yaml
plan_unit_id: CRAU-091
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The containerized-hosts MVP covers the whole runtime surface through a RuntimeHostFamilyProfile or equivalent
  matrix, not a generic container row or post-MVP deferral. Runtime families include Docker/Compose as the default
  local path; Podman as a capability-probed compatible alternate with visible rootless limits; Sysbox as the
  non-privileged/rootless nested-runtime candidate where available; remote Docker over SSH as a trusted remote-host
  path after PM validation and host trust; Kubernetes namespaces as project-scoped namespace/workload support, not
  cluster-admin; CI-hosted containers as an external ephemeral path; Unraid-hosted environments through Publish/Unraid
  and host templates; and privileged DinD as critical-risk disabled until explicit trust/approval. Each row records
  family id, setup inputs, supported operations, preflight probes, trust tier, gates, blocked states, receipt refs,
  cleanup policy, Coasts source-lineage refs only, and row-specific acceptance tests.
gui_related: false
gui_classification_reason: Runtime-family capability matrix and probes are backend/container behavior, not GUI presentation.
depends_on: [CRAU-090, CV-303, PS-126, F2-194]
unblocks: [ATS-019, EP-109, RAP-042]
acceptance_criteria:
  - Every runtime family in the whole-MVP scope has discover, configure, provision, project/worktree binding, start/stop/restart, endpoint exposure, health probe, log stream, bounded command, artifact/receipt, cleanup/retention, blocked/degraded, and acceptance-test behavior.
  - Podman, Sysbox, Kubernetes, remote Docker SSH, CI-hosted, Unraid-hosted, and privileged DinD rows expose capability probes, limitations, blocked states, and gate outcomes instead of parity promises.
  - Privileged DinD is disabled by default and requires explicit trust/approval, risk acknowledgement, and cleanup receipts before any bounded use.
  - Remote Docker SSH and Sysbox do not silently fall back to local Docker or privileged DinD.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future RuntimeHostFamilyProfile schema fixtures
  - future Docker Manager runtime-family preflight fixtures
risk_class: runtime_family_matrix_drift
reasoning_tier: high
context_scope: containerized_hosts_runtime_matrix
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager runtime-family matrix
node_compile_hint:
  mode: runtime_host_family_profile_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0028
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0030
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0031
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0032
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0052
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0059
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#runtime_family_matrix
source_atom_ids: [atom-0028, atom-0030, atom-0031, atom-0032, atom-0033, atom-0035, atom-0052, atom-0059, atom-0068, atom-0077]
decision_refs: [dec-0004, dec-0006, dec-0007, dec-0017, dec-0020]
preserved_exact_tokens:
  - "RuntimeHostFamilyProfile"
  - "whole thing for mvp"
  - "Docker/Compose"
  - "Podman"
  - "rootless limits"
  - "Sysbox"
  - "remote Docker over SSH"
  - "trusted remote-host path"
  - "Kubernetes namespaces"
  - "project-scoped namespace/workload"
  - "not cluster-admin"
  - "CI-hosted containers"
  - "Unraid-hosted environments"
  - "Publish/Unraid"
  - "privileged DinD"
  - "critical-risk"
  - "disabled until explicit trust/approval"
  - "capability-probed compatible alternate"
  - "no-local-fallback"
  - "privileged DinD default-disabled"
negative_constraints:
  - Do not hide broad-runtime support behind one generic container row.
  - Do not claim Podman/Sysbox/Kubernetes/remote parity without capability probes and blocker states.
  - Do not enable privileged DinD by default.
  - Do not silently fall back from remote Docker SSH or Sysbox to privileged DinD.
  - Do not promote Coasts runtime claims into PM-supported runtime evidence.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Automated_Testing_System.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CRAU-092 - Docker/Hosts Routed Detail Destination Boundary

```yaml
plan_unit_id: CRAU-092
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager remains the canonical operational owner, Activity Bar side-panel owner, and `docker_manager` command
  namespace for container, registry, Unraid, Kubernetes, and host capability behavior. `Docker/Hosts` is the native
  Slint routed primary-content page/lab for expanded host profiles, instances, Runtime Matrix, Host Lab Sessions,
  Access & Ports, Receipts & Artifacts, and Settings. It is opened from Docker Manager, command palette/search,
  Orchestrator/Executor run details, ATS sessions, Runtime Artifacts, assistant links, and receipts; it is not a new
  Activity Bar slot, not a separate Coasts website, not a PMConcept.html transplant, and not a separate Unraid panel.
  Dynamic URLs remain visible and usable for running instances while canonical ports/URLs are convenience bindings for
  the active selected or checked-out instance.
gui_related: true
gui_classification_reason: This unit defines the user-visible Docker/Hosts page/lab boundary and navigation relationship to Docker Manager.
depends_on: [CRAU-007, CRAU-090, CRAU-091, F3-410, UCC-105]
unblocks: [ACD-430, OP-028, RGV-015, RAP-042]
acceptance_criteria:
  - Docker/Hosts is reachable as a routed primary-content page/lab from Docker Manager and cross-surface links.
  - Docker Manager remains the Activity Bar side-panel owner and command namespace.
  - Expanded Host Lab detail is not trapped in the small Docker side-panel and does not create a separate website or Unraid shell panel.
  - Access actions use structured port_access_record data and do not guess low-confidence localhost URLs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker/Hosts routing and Docker Manager command namespace fixtures
risk_class: docker_hosts_owner_routing_drift
reasoning_tier: high
context_scope: docker_hosts_routed_detail_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - future Docker/Hosts native Slint page
node_compile_hint:
  mode: docker_hosts_routed_detail_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0070
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#docker_hosts_gui_ia
source_atom_ids: [atom-0015, atom-0036, atom-0046, atom-0061, atom-0070, atom-0075, atom-0080]
decision_refs: [dec-0009, dec-0011, dec-0017, dec-0020]
preserved_exact_tokens:
  - "Docker/Hosts"
  - "Slint"
  - "routed primary-content page"
  - "Docker Manager"
  - "docker_manager"
  - "Activity Bar side-panel owner"
  - "Overview"
  - "Profiles"
  - "Instances"
  - "Runtime Matrix"
  - "Host Lab Sessions"
  - "Access & Ports"
  - "Receipts & Artifacts"
  - "Settings"
  - "Open App"
  - "Open Container"
  - "PMConcept.html"
negative_constraints:
  - Do not create a new Activity Bar slot for Docker/Hosts.
  - Do not reverse Jared accepted Docker/Hosts page placement.
  - Do not make Docker/Hosts a Coasts website transplant.
  - Do not create a separate Unraid panel.
  - Do not copy PMConcept.html HTML/CSS/demo code.
  - Do not rely on canonical localhost ports as the only way to access a test host.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CRAU-001 - Containers, Registry, and Unraid Integration Source-Preserving Bridge Retired

```yaml
plan_unit_id: CRAU-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The former Containers, Registry, and Unraid source-preserving structural
  bridge is retired in place after Phase 2B atomized
  Containers_Registry_and_Unraid-S0001 through
  Containers_Registry_and_Unraid-S0082 into CRAU-002 through CRAU-084 and
  recorded structural dispositions for Containers_Registry_and_Unraid-S0083,
  Containers_Registry_and_Unraid-S0084, and
  Containers_Registry_and_Unraid-S0086. CRAU-001 remains only as migration
  lineage for the retired bridge span and must not re-own atomized source
  coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage; S0085's former mixed GUI/product bridge text is now covered by CRAU-002 through CRAU-084 and should not drive GUI routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - CRAU-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior product source coverage remains carried by CRAU-002 through CRAU-084.
  - Structural spans S0083, S0084, and S0086 are explicitly dispositioned as no-unit structural coverage.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 031 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0085
```
