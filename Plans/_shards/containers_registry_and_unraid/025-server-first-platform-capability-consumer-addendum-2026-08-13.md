# Shard 025: Server-First Platform Capability Consumer Addendum - 2026-08-13

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L6413-L6704

Source SHA256: `3ca157a3ab590fb8caab62539b9ff912052fa91b20cfc3309e6e48738f7d698b`

---

## Server-First Platform Capability Consumer Addendum - 2026-08-13

This addendum is the Containers platform-capability consumer of the server-first topology and shared integration-runtime contracts. It does not move, sync, copy, or update Project/app content; those behaviors remain with Project Sync/Backbone. It does not own generic installation, authentication, connection, lifecycle, or reusable projection state; those seams remain with `Plans/Shared_Integration_Runtime.md`. This document owns only container, standalone-Server, WSL/container-environment, Kubernetes-namespace, and host-capability behavior consumed by Docker Manager and Docker/Hosts.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### CRAU-100 - Project Server-First Topology Capability Boundary

```yaml
plan_unit_id: CRAU-100
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Container and host capability is resolved within one Project topology: exactly one Project Home Server and one
  physical Project Vault, with the Home Server as the default Execution Host. A Project may register additional
  Execution Hosts, and every executable operation names an explicit Execution Environment and Source Location rather
  than inferring either from the active Client, a mounted path, container id, or current shell. The Project Vault is
  physical project storage, not an Execution Host, container image layer, Tool Store, CLI-profile store, or generic
  source-location alias. This owner consumes the Shared Integration Runtime's read-only RuntimeTopologyProjection and
  its ProjectHomeServerId, ProjectVaultId, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, and
  TopologyGeneration bindings. Project Sync/Backbone owns Project/app-content sync, move, and update behavior; this
  owner never creates a second runtime-identity projection, content transport, source-location, or move authority.
gui_related: false
gui_classification_reason: This unit owns topology identity and platform-capability semantics, not visible layout or interaction design.
depends_on: [CRAU-090, CRAU-091, SIR-002]
unblocks: [CRAU-101, CRAU-102, CRAU-103]
acceptance_criteria:
  - Every container, server, Kubernetes, and host-capability operation resolves one Project Home Server, one physical Project Vault, one Execution Host, one Execution Environment, and one Source Location.
  - The Home Server is the deterministic default Execution Host; selecting an additional Host is explicit and receipt-visible.
  - Client location, mounted-path location, Source Location, Execution Environment, Execution Host, and physical Vault remain separate identities.
  - Containers consumes RuntimeTopologyProjection freshness and exact identity bindings; unavailable, stale, or conflicted topology cannot be replaced by a local guess.
  - No Containers flow claims ownership of Project Sync/Backbone content sync, move, app-content update, or source relocation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future server-first topology identity fixtures
  - future Docker/Hosts route and receipt fixtures
risk_class: server_first_topology_identity_drift
reasoning_tier: high
context_scope: containers_server_first_topology
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager and Docker/Hosts platform-capability consumers
node_compile_hint:
  mode: containers_server_first_topology_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md#server-first-topology
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#execution-forms
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/SERVER_BACKBONE_INTEGRATION_RUNTIME_RETURN.md
preserved_exact_tokens:
  - "one Project Home Server"
  - "one physical Project Vault"
  - "Home Server as default Execution Host"
  - "additional Execution Hosts"
  - "Execution Environment"
  - "Source Location"
  - "RuntimeTopologyProjection"
  - "TopologyGeneration"
negative_constraints:
  - Do not infer the Execution Host or Environment from the active Client.
  - Do not treat the physical Project Vault as an execution runtime, image layer, Tool Store, profile store, or generic source-location alias.
  - Do not duplicate Project Sync/Backbone sync, move, or app-content ownership.
owner_boundary_notes:
  - "Project Sync/Backbone owns Project and app-content movement; Containers consumes topology identities only."
  - "Shared Integration Runtime owns runtime topology identities plus shared lifecycle and projection seams; Containers owns platform capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
```

### CRAU-101 - Execution Forms, WSL Isolation, And Kubernetes Namespace Scope

```yaml
plan_unit_id: CRAU-101
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Execution-capable forms include native Windows, native macOS, native Linux, standalone Server, Docker/TrueNAS/Unraid
  Server, Kubernetes Server, optional WSL2 environments, optional Apple Linux containers, and trusted SSH/remote
  Execution Hosts. Every standalone or container Server is execution-capable by default subject to proof-based
  readiness, policy, and host-local admission; it is not reduced to storage or a passive integration endpoint. Native
  Windows remains first-class and WSL Off is healthy. Each WSL distribution is an optional environment-specific
  Execution Environment: Windows-native and WSL tools, paths, profiles, resources, capability snapshots, and receipts
  never collapse together, and user-owned versus PM-managed distributions remain distinct. Kubernetes behavior is
  namespace-scoped and project/workload-focused by default; cluster-admin and cluster-wide mutation are not implied by
  Server capability or by the Docker Manager cluster-wide observation toggle.
gui_related: false
gui_classification_reason: This unit defines accepted execution forms, environment isolation, and Kubernetes capability scope rather than GUI presentation.
depends_on: [CRAU-091, CRAU-100, SIR-002]
unblocks: [CRAU-102, CRAU-103]
acceptance_criteria:
  - Native Windows, macOS, and Linux plus standalone and container Server forms each expose capability probes without being forced through WSL or Docker.
  - WSL Off passes as a healthy supported state and no flow silently enables, converts, resets, shuts down, or globally reconfigures a distribution.
  - Windows-native and each WSL distribution retain distinct Installation, profile, path, resource, capability, and receipt identities.
  - Kubernetes discovery and actions bind the selected context plus namespace and project/workload identity; no namespace is inferred for mutation.
  - Cluster-wide observation does not grant cluster-admin mutation or escape namespace-scoped policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future execution-form and WSL separation fixtures
  - future Kubernetes namespace-scope and permission-negative fixtures
risk_class: execution_environment_scope_drift
reasoning_tier: high
context_scope: containers_execution_forms_wsl_kubernetes
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future RuntimeHostFamilyProfile and Kubernetes capability probes
node_compile_hint:
  mode: execution_forms_environment_scope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md#server-first-topology
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#execution-forms
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#wsl
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/EGOLITE_INTEGRATION_RUNTIME_RETURN.md#8-wsl-and-environment-profiles
preserved_exact_tokens:
  - "Native Windows"
  - "Native macOS"
  - "Native Linux"
  - "Standalone Server"
  - "Docker/TrueNAS/Unraid Server"
  - "Kubernetes Server"
  - "Optional WSL2 environment"
  - "WSL Off is healthy"
  - "namespace-scoped"
  - "project/workload-focused"
negative_constraints:
  - Do not require WSL for native Windows execution.
  - Do not silently convert WSL1, change the default distribution, rewrite global .wslconfig, reset a distribution, or shut down every distribution.
  - Do not collapse Windows-native and WSL installations, tools, paths, profiles, resources, or receipts.
  - Do not promote namespace-scoped Kubernetes support into cluster-admin authority.
owner_boundary_notes:
  - "Shared Integration Runtime owns Installation, profile, connection, and reusable capability-projection lifecycles."
  - "Containers owns which platform forms are execution-capable and the Kubernetes namespace-scoped capability envelope."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### CRAU-102 - Host-Local Governor And Old-Hardware Capability Profiles

```yaml
plan_unit_id: CRAU-102
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Every Execution Host enforces RuntimeResourceGovernor admission locally before container, Server, Kubernetes, WSL,
  build, test, or provisioning work starts and throughout the operation. A remote coordinator or Client may request
  work but cannot bypass the target Host's physical CPU, memory, disk, process, network, thermal, or concurrency
  ceiling. Environments sharing one physical parent, including Windows plus WSL and sibling containers, consume one
  parent budget without double-counting capacity. RuntimeHostFamilyProfile capability is paired with explicit
  old-hardware profiles, including old-x86 and low-memory modes, that lower concurrency, pool size, cache size, probe
  cadence, log/artifact pressure, and optional-capability defaults. Unsupported optimized kernels or architecture
  paths degrade to proven compatible implementations; they never become readiness by assumption.
gui_related: false
gui_classification_reason: This unit defines local admission, physical budget sharing, and hardware capability policy rather than a visible resource UI.
depends_on: [CRAU-091, CRAU-100, CRAU-101, SIR-006, SIR-012]
unblocks: [CRAU-103]
acceptance_criteria:
  - The target Execution Host records a local governor admission or rejection for every execution-capable platform operation.
  - Remote requests cannot widen or bypass the target Host's effective governor ceiling.
  - Windows/WSL and container siblings share physical-parent budgets and cannot each advertise the full parent capacity.
  - Old-x86 and low-memory fixtures prove reduced concurrency, caches, probes, logs/artifacts, and optional-capability defaults.
  - Architecture-specific acceleration is selected only after runtime capability proof and has a compatible bounded fallback.
  - Governor decisions preserve the shared admitted, admitted_reduced, queued, blocked, and rejected outcomes with effective limits and reevaluation evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future host-local governor admission and physical-parent budget fixtures
  - future old-x86 and low-memory RuntimeHostFamilyProfile fixtures
risk_class: host_local_resource_admission_drift
reasoning_tier: high
context_scope: containers_host_local_governor_profiles
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future RuntimeHostFamilyProfile capability and governor consumers
node_compile_hint:
  mode: host_local_governor_old_hardware_profiles
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#performance
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#wsl
preserved_exact_tokens:
  - "RuntimeResourceGovernor"
  - "host-local"
  - "physical parent budgets"
  - "old-x86"
  - "low-memory"
  - "runtime-dispatched optimized kernels"
  - "no startup probe storm"
  - "admitted_reduced"
negative_constraints:
  - Do not let a coordinator, Client, container, or WSL environment bypass the target Host governor.
  - Do not advertise the same physical capacity independently to sibling Environments.
  - Do not make old-hardware profiles cosmetic labels without measurable policy differences.
  - Do not require an optimized architecture-specific kernel when a bounded compatible path is available.
owner_boundary_notes:
  - "RuntimeResourceGovernor owns resource policy and admission; Containers binds its host-local decisions to platform capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
```

### CRAU-103 - Proof-Based Platform Readiness And Shared Runtime Consumer Boundary

```yaml
plan_unit_id: CRAU-103
unit_type: validation
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager and Docker/Hosts derive platform readiness from current, Host/Environment-bound proof rather than
  configured presence, PATH discovery, process exit zero, remembered success, or a generic connected flag. Proof covers
  executable or service identity, real path and owner/provenance where applicable, version and architecture, effective
  Host and Environment, engine/connection handshake, requested operations, permissions/FileSafe, RuntimeResourceGovernor
  admission, namespace or runtime scope, TopologyGeneration, and capability-snapshot currentness. Binary Locator
  supplies deterministic candidate discovery only. Plans/Shared_Integration_Runtime.md owns RuntimeTopologyProjection,
  InstallationResolver, InstallationLifecycleManager, reusable Installation/Profile/Connection lifecycles,
  CapabilitySnapshot, health projection, and continuation seams; Containers consumes those records and owns
  domain compatibility and post-setup container/Kubernetes/Server capability probes. Ambiguous, stale, unreachable,
  unsupported, unauthorized, or partially proven states remain manual-only, blocked, degraded, or partial capability and
  never project Ready.
gui_related: false
gui_classification_reason: This unit defines readiness evidence and owner routing; user-visible rendering remains a consumer concern.
depends_on: [CRAU-029, CRAU-040, CRAU-091, CRAU-100, CRAU-101, CRAU-102, BS-016, SIR-002, SIR-003, SIR-006]
unblocks: []
acceptance_criteria:
  - Readiness evidence is bound to exact Host, Execution Environment, generation, architecture, and capability scope.
  - Discovery or configured presence alone cannot produce Ready.
  - Binary Locator candidate and trace results are consumed as discovery input and never treated as installation, auth, connection, or domain-capability authority.
  - Shared lifecycle and capability projections are consumed without minting Containers-local duplicate Installation, Authentication, connection, update, or health truth.
  - InstallationResolver states ready, setup_required, approval_required, blocked, conflicted, and unavailable remain distinct inputs; only ready plus current domain proof may project platform Ready.
  - Container, Kubernetes, and Server domain adapters perform compatibility and post-setup capability probes after shared lifecycle verification.
  - Stale, ambiguous, unsupported, unauthorized, unreachable, and partial evidence stays explicitly non-ready.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Host/Environment-bound capability snapshot fixtures
  - future stale-generation, partial-capability, and discovery-not-ready negative fixtures
risk_class: platform_readiness_overclaim
reasoning_tier: high
context_scope: containers_proof_based_readiness
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager and Docker/Hosts readiness consumers
node_compile_hint:
  mode: proof_based_platform_readiness_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md#proof-based-ownership
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md#shared-lifecycle
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/08_GUI_PLAN_COMMAND_WIRING_DRY_SCHEMA_EVENTS.md#gui-projections
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/SERVER_BACKBONE_INTEGRATION_RUNTIME_RETURN.md
  - Plans/BinaryLocator_Spec.md
preserved_exact_tokens:
  - "proof-based readiness"
  - "Host/Environment"
  - "Binary Locator discovers candidates; it does not install"
  - "Partial capability"
  - "Installation"
  - "InstallationResolver"
  - "InstallationLifecycleManager"
  - "AuthenticationProfile"
  - "CapabilitySnapshot"
  - "RuntimeConnection"
  - "ClusterConnection"
  - "RegistryConnection"
negative_constraints:
  - Do not equate configured, discovered, installed, authenticated, connected, compatible, admitted, and Ready.
  - Do not treat process exit zero as capability or login proof.
  - Do not duplicate Shared Integration Runtime lifecycle, connection, or health-projection truth.
  - Do not let stale or partial proof project Ready.
compatibility_only_notes:
  - "The corrected source packet's AuthenticationProfile, RuntimeConnection, ClusterConnection, and RegistryConnection tokens route through the canonical Shared Integration Runtime Profile and Connection identities plus domain-owned subtype semantics; Containers must not mint peer lifecycle records for those source-lineage names."
owner_boundary_notes:
  - "Plans/Shared_Integration_Runtime.md owns shared lifecycle and projection seams."
  - "Plans/Containers_Registry_and_Unraid.md owns platform capability and domain post-setup probes."
  - "Plans/BinaryLocator_Spec.md owns deterministic discovery, not installation or readiness."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```
