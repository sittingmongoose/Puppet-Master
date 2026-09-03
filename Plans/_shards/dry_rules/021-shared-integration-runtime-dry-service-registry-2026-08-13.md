# Shard 021: Shared Integration Runtime DRY service registry — 2026-08-13

Source: `Plans/DRY_Rules.md`

Source lines: L2073-L2198

Source SHA256: `595e587a48b45dbe60cfa50b0191bdfd70d86f1f7943227f32d39c85dd8ed3ec`

---

## Shared Integration Runtime DRY service registry — 2026-08-13

`Plans/Shared_Integration_Runtime.md` owns the shared mechanics behind the following
service names. Consumers reuse these exact names and delegate domain policy to the
listed owner; they do not create feature-local peers, convenience facades, or
compatibility services for the same responsibility.

| Canonical shared service | Shared-runtime responsibility | Delegated owner boundary | Prohibited peer names or roles |
|---|---|---|---|
| `InstallationResolver` | Exact-target discovery resolution and proof classification | BinaryLocator owns discovery evidence; Release Supply Chain owns provenance; provider owners own the provider-CLI first-acquisition rule | `ProviderInstallationResolver`, feature-local installation resolver |
| `InstallationLifecycleManager` | Consented install/update/repair/rollback mechanics and recovery | Provider owners retain acquisition policy; Multi-Account retains authentication; Storage retains migration | Feature-local lifecycle manager or updater |
| `CapabilityProvisioner` | Non-provider `Off`/`Auto`/`On` provisioning execution | Tools owns capability policy and registries; Permissions and Release Supply Chain independently authorize | `ProgressiveCapabilityRegistry` as a runtime service, provider-CLI auto-installer |
| `EnvironmentConnectionSupervisor` | One fenced transport supervisor per exact Environment | Domain owners retain domain data and synchronization truth; Multi-Account retains auth policy | `DomainSyncCoordinator`, global connection singleton, feature-local reconnect manager |
| `ThreadCommandOutbox` | Durable ordered logical commands, idempotency, retry, and acknowledgement refs | Assistant Chat and Goal owners retain command semantics; Storage owns persistence | Per-surface outbox, `ThreadProjectionStore` as a command owner |
| `ProjectionReplayCoordinator` | Cursor replay/snapshot selection, live-before-replay buffering, and fenced convergence | Storage owns retained history and snapshots; each domain owns its projection | `ReplaySnapshotCoordinator`, per-page replay coordinator |
| `StreamCoalescer` | Adaptive presentation batching without dropping canonical events | Event and domain owners retain canonical ordering and durability | Feature-local token/progress coalescer that changes canonical history |
| `RuntimeResourceGovernor` | Shared policy/admission with enforcement on the exact Execution Host | Run Modes and domain owners provide policy inputs; the host enforces effective limits | `ResourceGovernor`, per-feature scheduler/admission governor |
| `ObservableWork` | Shared truthful phase, wait, progress, cancellation, and outcome projection | Domain owners retain operation semantics and terminal evidence | Feature-local work/progress state machine or spinner-as-truth |
| `LeaseCoordinator` | CAS, generation, expiry, fencing, and reconciliation for shared lease types | Worktree, testing/debug, MCP, Browser, and resource owners retain domain cleanup and authority | `WorktreeProvisioner` as lease owner, per-domain generic lease coordinator |
| `OperationalAwarenessService` | Bounded freshness-labeled correlation of owner projections | Every source domain retains truth and mutation authority | Operational-awareness store that becomes a domain authority |
| `DebugSessionBroker` | Durable DebugSession identity, topology binding, lease, generation, and recovery | Testing/Debug owns DAP protocol and `cmd.run_debug.*` semantics | Generic `DebugSession` command owner, feature-local DAP lifecycle broker |
| `EvalSessionBroker` | Persistent sandboxed EvalSession lifecycle, topology binding, lease, and recovery | Tools owns Eval policy and supported adapters; security owners retain filesystem, network, and permission policy | Hidden global kernel, feature-local Eval lifecycle broker |
| `ProviderDispatchAdmissionService` | Single-use pre-network admission over immutable final provider request bytes | Prompt Pipeline, Permissions, FileSafe, Multi-Account, readiness, and budget owners remain independent decision authorities | Adapter-issued permit, `PacketAdmissionReceipt`, `ImmutableDispatchIntent`, or second provider-permit family |
| `ConditionalRuleEngine` | Versioned conditional-rule matching, bounded intervention, and suppression mechanics | Prompt Pipeline owns prompt/context policy; Permissions retains authority | `TimeTravelRuleEngine`, thread-rewind or restore-point engine |
| `BackSeatDriverService` | Isolated, non-blocking, read-only BSD assignment and evaluation lifecycle | Goal, Chat, Usage, Settings, and provider owners retain their respective policy and presentation | Per-surface BSD service or mutation-capable advisor |

Packet candidate roles that are absent from the table remain with their existing
domain owners: stable-prefix planning belongs to Prompt Pipeline;
progressive capability registries and typed recovery envelopes belong to Tools;
LSP write coordination belongs to LSP Support; MCP lifecycle belongs to MCP
Integration; Browser sessions belong to the PM-native Browser owner; worktree
provisioning belongs to Worktree/Git; and authentication belongs to Multi-Account
and provider owners. A value type such as `ToolRecoveryEnvelope` is not a service.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#15.2, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Multi-Account.md

### Shared-runtime command-name normalization boundary

DRY normalization does not register commands or aliases. Packet candidate names
resolve only through the command owner as follows:

| Packet candidate or generic role | Canonical normalization/disposition |
|---|---|
| `cmd.lsp.server.restart` | Rejected candidate; use `cmd.lsp.restart_server`. |
| `cmd.lsp.server.diagnose` | Compatibility intent; use `cmd.lsp.open_problems`. |
| `cmd.debug.session.start` | Normalize to `cmd.run_debug.start`. |
| `cmd.debug.session.stop` | Normalize to `cmd.run_debug.stop`. |
| `cmd.debug.session.action` | Rejected generic action; select the exact existing `cmd.run_debug.*` verb. |
| `cmd.worktree.provision` | Normalize to `cmd.git.worktree.create`; a thread-scoped caller may use only the existing thread wrapper. |
| `cmd.worktree.release` | Normalize to `cmd.git.worktree.release`. |
| `cmd.context.receipt.open` | Normalize to `cmd.nav.open_subject` for a document/artifact subject, or to `cmd.nav.open_usage_subject` only for event-backed Usage/Ledger identity carrying stable `usage_event_ref`; current PMConcept7 aggregate provider/account/panel cards stay local. |
| `cmd.remote.reconnect` | Retained exact-`ExecutionEnvironmentId` compatibility wrapper over canonical `cmd.environment.reconnect`; it owns no peer lifecycle. |

The 26 generalized Environment, outbox, installation, Eval, MCP, resource, BSD,
and related commands are registered only by `Plans/Commands_System.md` and
`Plans/UI_Command_Catalog.md`. This DRY registry does not create or alias them.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#15.1, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/WorktreeGitImprovement.md

### Unresolved schema and Event Authority boundary

`Plans/shared_runtime_contracts.schema.json` currently materializes only its closed
root definitions. Its `x-puppet-master-blocked-definitions` entries remain
non-implementation-ready identity skeletons until their owning lifecycle enums are
adjudicated. This DRY registry neither fills those enums nor creates a peer schema.

The Event Authority denominator remains `UNKNOWN_OPEN`. No event family is inferred,
registered, or declared emitted from a service name in this registry. Producers use
receipts/projections that already have owner-approved contracts, or remain
non-emitting until individual Event Authority adjudication.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/shared_runtime_contracts.schema.json, ContractName:Plans/event_family_registry.json, ContractName:Plans/storage-plan.md

### DR-037 - Shared Runtime Service Name And Delegation Registry

```yaml
plan_unit_id: DR-037
unit_type: owner_boundary
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: The sixteen Shared Integration Runtime service names are the sole reusable shared-runtime roles; consumers delegate domain policy to existing owners, reject feature-local peers, and normalize packet command candidates through canonical command owners without creating commands or events.
gui_related: false
gui_classification_reason: This unit governs backend service reuse, ownership delegation, and command-name normalization rather than visual presentation.
split_recommended: false
depends_on: [SIR-001]
unblocks: [SIR-012]
acceptance_criteria:
  - Every service in Shared Integration Runtime section 15.2 appears exactly once with its retained domain-owner boundary.
  - Packet candidate peer roles are either normalized to a canonical service or returned to a named domain owner.
  - LSP, DAP, worktree, context, and remote-wrapper candidates normalize exactly as the command-owner canon specifies.
  - The registry creates no command, alias, event family, schema peer, WorkNode, NodeSeed, or executable queue.
  - Blocked shared-runtime schema definitions and the UNKNOWN_OPEN Event Authority denominator remain explicit gaps rather than inferred closure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py lint-path-refs
risk_class: shared_runtime_parallel_owner_drift
reasoning_tier: high
context_scope: shared_runtime_dry_registry
implementation_surfaces:
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: shared_runtime_service_name_and_delegation_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Shared_Integration_Runtime.md#15.2
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/08_GUI_PLAN_COMMAND_WIRING_DRY_SCHEMA_EVENTS.md#DRY-services
preserved_exact_tokens:
  - RuntimeResourceGovernor
  - ObservableWork
  - ProviderDispatchAdmissionService
  - cmd.lsp.restart_server
  - cmd.run_debug.*
  - cmd.git.worktree.create
  - cmd.remote.reconnect
  - UNKNOWN_OPEN
negative_constraints:
  - Do not create feature-local peers for a canonical shared-runtime service.
  - Do not treat service naming as command, event, schema, permission, or domain-policy ownership.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/Shared_Integration_Runtime.md
```

<a id="usage-candidate-role-dispositions"></a>
