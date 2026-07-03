# Shard 016: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L429-L1696

Source SHA256: `e9456832f2a15e65e0158775c6650904e162afa6161f7b115793467ad3ccb3b7`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into binary/provider launcher discovery requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### BS-026 - Provider Launcher Metadata For Antigravity And CLI Runtime Routes

```yaml
plan_unit_id: BS-026
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  Binary/provider launcher discovery must include provider-owned setup-health metadata for active CLI-runtime routes such as Antigravity `agy`, Claude Code `claude`, and Cursor `cursor-agent` while keeping Codex, GitHub Copilot, OpenCode server, and direct coding-plan providers out of required CLI bridge discovery. `agy` discovery is version-gated and records command templates, account-root/env requirements, model-list support, prompt-output proof state, and unsupported format caveats without storing secrets.
gui_related: false
gui_classification_reason: Binary discovery and launcher metadata are backend setup contracts, though GUI consumes status.
depends_on: [CBP-020, CBP-021, CBP-022]
unblocks: [F3-400]
acceptance_criteria:
  - "`agy` is a first-class active CLI-runtime launcher entry."
  - Launcher metadata tracks setup health, version, command templates, output-proof state, and account-root/env requirements.
  - Direct providers are not incorrectly marked as requiring CLI bridge binaries.
  - Secret material is never captured in launcher metadata.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_launcher_discovery_drift
reasoning_tier: standard
context_scope: provider_launcher_metadata
implementation_surfaces: [Plans/BinaryLocator_Spec.md, future binary locator, future provider setup health registry]
node_compile_hint: {mode: provider_launcher_metadata, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0019
  - pldg-20260624-001-provider-updates:atom-0020
  - pldg-20260624-001-provider-updates:atom-0116
source_atom_ids: [atom-0019, atom-0020, atom-0022, atom-0023, atom-0054, atom-0061, atom-0087, atom-0088, atom-0116, atom-0132]
preserved_exact_tokens: ["agy", "Antigravity CLI", "claude", "cursor-agent", "version-gate", "setup-health", "--print-timeout", "agy models", "command templates", "output-level proof"]
negative_constraints:
  - Do not require Copilot CLI discovery for GitHub Copilot direct hosted API support.
  - Do not require Codex CLI discovery for Codex/OpenAI direct provider support.
  - Do not store provider secret material in launcher metadata.
owner_hints: [Plans/BinaryLocator_Spec.md, Plans/CLI_Bridged_Providers.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```

### BS-002 - BinaryLocator Authority, Purpose, And Non-Goals

```yaml
plan_unit_id: BS-002
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator remains the canonical Provider-owned location and validation
  spec for external Provider CLIs, preserving the Puppet Master naming rule,
  deterministic/testable purpose, official-install boundary, usage source
  metadata boundary, and diagnostics non-ownership constraints.
gui_related: false
gui_classification_reason: Provider discovery scope, usage metadata routing, and diagnostics ownership are backend contract boundaries.
split_recommended: false
depends_on: []
unblocks: [BS-006, BS-007, BS-008, BS-009]
acceptance_criteria:
  - The document title and compliance statement preserve the Puppet Master naming and deterministic-default requirements.
  - BinaryLocator locates and validates external Provider CLIs for Cursor Agent and Claude Code across Windows, macOS, and Linux.
  - BinaryLocator does not install, update, uninstall, crawl heuristically, orchestrate providers, authenticate, discover models, or own PM-managed browser runtime health.
  - BinaryLocator only reports detected usage_source_kind availability and does not own canonical usage accounting.
  - BinaryLocator diagnostics do not define /outcome, reason-code taxonomies, bridge-side usage-field mapping, or failure-class mapping.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_scope_boundary
reasoning_tier: high
context_scope: provider
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Run_Modes.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: binarylocator_authority_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0003
preserved_exact_tokens:
  - "BinaryLocator Spec (Canonical)"
  - "Puppet Master"
  - "deterministic, testable"
  - "external Provider CLIs"
  - "Cursor Agent"
  - "Claude Code"
  - "official install methods"
  - "usage_source_kind"
  - "provider_runtime_usage"
  - "provider_quota_api"
  - "provider_usage_api"
  - "provider_error_hint"
  - "project_rollup"
  - "/outcome"
  - "usage-field"
  - "failure-class"
negative_constraints:
  - "BinaryLocator must not install, update, or uninstall Provider CLIs."
  - "BinaryLocator must not perform filesystem crawling or heuristic best-guess scanning beyond enumerated probe layers."
  - "BinaryLocator must not own provider orchestration, authentication, model discovery, PM-managed browser runtime distribution, canonical usage accounting, /outcome taxonomies, bridge-side usage-field mapping, or failure-class mapping."
owner_boundary_notes:
  - "Canonical usage accounting remains owned by Plans/usage-feature.md."
  - "Diagnostics classification remains owned by Plans/Run_Modes.md and Plans/CLI_Bridged_Providers.md."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-003 - BinaryLocator Locked Platform Decisions

```yaml
plan_unit_id: BS-003
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator inherits the locked Puppet Master platform name, Slint 1.17.0 on Rust stable 1.96.1 UI toolkit decision, and seglog/redb/Tantivy storage stack while preserving the SQLite prohibition.
gui_related: true
gui_classification_reason: The locked decision span includes the user-interface toolkit requirement Slint 1.17.0 on Rust stable 1.96.1 and the legacy Iced prohibition.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-005, BS-019]
acceptance_criteria:
  - The platform name remains Puppet Master only.
  - UI toolkit references use Slint 1.17.0 on Rust stable 1.96.1, reverified before implementation, and treat Iced as legacy.
  - Storage references use seglog, redb, and Tantivy.
  - SQLite remains forbidden.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: locked_stack_drift
reasoning_tier: standard
context_scope: platform
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_locked_platform_decisions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0005
preserved_exact_tokens:
  - "Canonical references and constraints (SSOT; DRY)"
  - "Puppet Master"
  - "Rust stable 1.96.1"
  - "Slint 1.17.0"
  - "Iced is legacy"
  - "seglog + redb + Tantivy"
  - "SQLite is forbidden"
  - "Invariant:INV-010"
  - "SchemaID:spec_lock"
negative_constraints:
  - "BinaryLocator must not reintroduce Iced or SQLite as valid rewrite choices."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-004 - BinaryLocator Canonical References And Legacy Anchors

```yaml
plan_unit_id: BS-004
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator references primitive, DRY, decision, contract, storage, and
  glossary owners without duplicating them, treats legacy puppet-master-rs paths
  as read-only behavior anchors, and preserves the packet-derived output
  boundary for MUST CHANGE, MUST RECONCILE, and MUST VERIFY material.
gui_related: false
gui_classification_reason: Canonical reference routing, legacy anchors, and packet intent handling are documentation-governance constraints.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-005, BS-009, BS-014, BS-015]
acceptance_criteria:
  - BinaryLocator references canonical owner docs rather than duplicating their contracts.
  - Legacy puppet-master-rs paths remain read-only behavior anchors and not canonical SSOT.
  - Conflict precedence remains Spec Lock, Crosswalk, DRY Rules, Glossary, then Decision Policy defaults.
  - Packet-derived research outputs remain non-canonical unless routed through primary MUST CHANGE or MUST RECONCILE docs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_reference_drift
reasoning_tier: high
context_scope: governance
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Glossary.md
node_compile_hint:
  mode: binarylocator_reference_and_anchor_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0007
preserved_exact_tokens:
  - "Canonical sources (reference, don't duplicate)"
  - "legacy-code behavior anchors"
  - "not the canonical SSOT"
  - "Spec Lock"
  - "Crosswalk"
  - "DRY Rules"
  - "Glossary"
  - "Decision Policy defaults"
  - "MUST CHANGE"
  - "MUST RECONCILE"
  - "MUST VERIFY"
  - "REFERENCE"
negative_constraints:
  - "Legacy puppet-master-rs paths must not become canonical rewrite architecture SSOT."
  - "Derived-only ledger summaries, audit tables, and cross-reference matrices must not become BinaryLocator doc intents."
compatibility_only_notes:
  - "Legacy-code anchors are read-only behavior anchors for compatibility review only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-005 - BinaryLocator Cross-Owner Boundary Constraints

```yaml
plan_unit_id: BS-005
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator preserves routed cross-owner constraints exposed by provider or
  binary-discovery packet material without absorbing runtime, storage, usage,
  permissions, chat, HITL, Run Graph, Orchestrator, command, GUI, or help-copy
  ownership into binary validation behavior.
gui_related: true
gui_classification_reason: The boundary span includes GUI/help copy, assistant chat, wizard, and user-facing Orchestrator surface routing constraints.
split_recommended: false
depends_on: [BS-003, BS-004]
unblocks: [BS-008, BS-014, BS-019]
acceptance_criteria:
  - Agent coordination state remains event-sourced through seglog/redb, with active-agents files/views debug-only.
  - usage_event_ref remains a locator-grade structured locator and not a display string, timestamp heuristic, or opaque replacement ID family.
  - Execution, handoff, route identity, permission scope, chat compatibility drift, HITL, Run Graph, Orchestrator, command, GUI, and help-copy concerns route to their owner docs.
  - BinaryLocator diagnostics may reference owner outcomes without encoding those seams as locator state, binary validation, or provider discovery contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_drift
reasoning_tier: high
context_scope: owner_boundary
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: binarylocator_cross_owner_boundary_constraints
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0008
preserved_exact_tokens:
  - "seglog"
  - "redb"
  - "active-agents.json"
  - "usage_event_ref"
  - "/runtime"
  - "Executor_Protocol.md"
  - "/handshake"
  - "Permissions_System.md"
  - "assistant-chat-design.md"
  - "HITL"
  - "Run Graph"
  - "Orchestrator GUI/help copy drift"
negative_constraints:
  - "BinaryLocator must not absorb Executor_Protocol mint, handshake, or handoff rules while validating provider binaries."
  - "BinaryLocator diagnostics may reference permission results but must not define permission scope."
  - "BinaryLocator must not encode approval/blocking seams as locator state, binary validation, or provider discovery contracts."
compatibility_only_notes:
  - "assistant-chat-design is mostly aligned; remaining compatibility-oriented drift stays with the chat owner."
stale_retired_dispositions:
  - "Stale newfeatures.md four-tier hierarchy and no new tiers claims must not override the chain-wizard-flexibility node-graph model."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-006 - BinaryLocator Terminology And Service Boundary

```yaml
plan_unit_id: BS-006
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator uses Provider, Session, and probe layer terminology and remains a Provider-owned discovery, validation, and trace service.
gui_related: false
gui_classification_reason: Terminology and service ownership are canonical vocabulary and backend boundary requirements.
split_recommended: false
depends_on: [BS-002]
unblocks: [BS-007, BS-008, BS-009]
acceptance_criteria:
  - Provider remains the canonical term and runner is not used.
  - Session remains the canonical user-facing term.
  - Probe layer terminology avoids conflicts with hierarchy naming rules.
  - BinaryLocator remains Provider-owned discovery, validation, and trace service.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminology_drift
reasoning_tier: standard
context_scope: provider
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: binarylocator_terminology_service_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0011
preserved_exact_tokens:
  - "Provider"
  - "runner"
  - "Session"
  - "probe layer"
  - "Provider-owned"
  - "discovery + validation + trace service"
  - "Primitive:Provider"
negative_constraints:
  - "Legacy terminology must not appear in user-facing text."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-007 - BinaryLocateRequest Input Contract

```yaml
plan_unit_id: BS-007
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocateRequest is a conceptual Provider-domain contract with provider_cli and force_rescan required, and workspace_root, override_path, and env_path optional under the stated probing and cache-scope boundaries.
gui_related: false
gui_classification_reason: Request shape is backend provider-domain contract data; GUI manual controls are covered in the Override and UI mapping PlanUnits.
split_recommended: false
depends_on: [BS-006]
unblocks: [BS-010, BS-017]
acceptance_criteria:
  - provider_cli and force_rescan remain required fields.
  - workspace_root is used only for workspace-scoped caching keys.
  - workspace_root must not expand filesystem probing scope.
  - override_path is sourced only from Setup/Health manual path controls for Cursor/Claude.
  - env_path carries the effective PATH string used for PATH lookup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: request_contract_drift
reasoning_tier: standard
context_scope: provider_contract
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocaterequest_input_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0012
preserved_exact_tokens:
  - "BinaryLocateRequest"
  - "provider_cli"
  - "force_rescan"
  - "workspace_root"
  - "override_path"
  - "env_path"
  - "ConfigKey:advanced_config.cli_paths"
negative_constraints:
  - "workspace_root is used only for workspace-scoped caching keys and must not expand filesystem probing scope."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-008 - BinaryLocateResult And Trace Emission Contract

```yaml
plan_unit_id: BS-008
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocateResult exposes deterministic status, resolved path/name, source
  layer, version, validation, and ordered trace fields; trace is returned to
  callers until persisted event writers are available, then emitted as full
  EventRecord diagnostics while still returned for deterministic UX/debuggability.
gui_related: false
gui_classification_reason: Result shape, trace structure, and event emission are provider and storage contract behavior.
split_recommended: false
depends_on: [BS-006]
unblocks: [BS-018, BS-019]
acceptance_criteria:
  - Status values remain Found, NotFound, and FoundButInvalid.
  - Source layers remain Override, PATH, CommonLocations, and Launchers.
  - Trace attempts preserve layer, candidate, probe_kind, and result fields.
  - probe_kind values preserve DirectPath, PATHLookup, DirectoryJoin, and LauncherResolution.
  - Implementations emit full EventRecord diagnostics once persisted event writers are available while readers may accept EventEnvelopeV1 during transition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: result_trace_contract
reasoning_tier: high
context_scope: provider_contract
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocateresult_trace_emission_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0014
preserved_exact_tokens:
  - "BinaryLocateResult"
  - "Found | NotFound | FoundButInvalid"
  - "Override | PATH | CommonLocations | Launchers"
  - "Valid | Invalid(BinaryErrorCode)"
  - "DirectPath | PATHLookup | DirectoryJoin | LauncherResolution"
  - "Hit | Miss | HitButInvalid(BinaryErrorCode)"
  - "EventEnvelopeV1"
  - "EventRecord"
  - "return `trace` only in `BinaryLocateResult`"
compatibility_only_notes:
  - "Readers may accept both EventEnvelopeV1 and EventRecord during transition, but implementations must emit full EventRecord envelopes."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-009 - Probe Order And Tie-Break Rules

```yaml
plan_unit_id: BS-009
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator probes Override, PATH, CommonLocations, then Launchers in that exact order, returns the first Valid hit, and resolves ties by layer, Provider-owned candidate-name order, then enumerated path order.
gui_related: false
gui_classification_reason: Probe ordering and tie-breaks are deterministic backend discovery algorithm behavior.
split_recommended: false
depends_on: [BS-004, BS-006]
unblocks: [BS-010, BS-011, BS-012, BS-013]
acceptance_criteria:
  - Probe layers run in the exact order Override, PATH, CommonLocations, Launchers.
  - The first Valid hit is returned.
  - Earlier probe layer, earlier Provider-owned candidate name, and earlier enumerated path order win ties.
  - Candidate name ordering comes from a single Provider-domain SSOT list.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: discovery_determinism
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_probe_order_tiebreaks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0016
preserved_exact_tokens:
  - "Override"
  - "PATH"
  - "CommonLocations"
  - "Launchers"
  - "first Valid hit"
  - "earlier candidate name wins"
  - "SSOT list"
  - "PlatformSpec.cli_binary_names"
negative_constraints:
  - "Candidate ordering must not be duplicated outside the Provider domain SSOT list."
compatibility_only_notes:
  - "puppet-master-rs/src/platforms/platform_specs.rs PlatformSpec.cli_binary_names is a legacy anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-010 - Override Probe Layer

```yaml
plan_unit_id: BS-010
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The Override probe layer honors explicit Cursor/Claude user selection from
  Setup/Health manual path controls, normalizes paths deterministically, probes
  directory or file overrides as specified, and fails fast without fallback on
  OverrideInvalid or OverrideMissing.
gui_related: true
gui_classification_reason: The override layer includes Setup/Health manual-path controls, a Use manual path checkbox, and a native file picker.
split_recommended: false
depends_on: [BS-007, BS-009]
unblocks: [BS-018, BS-019]
acceptance_criteria:
  - Empty override_path values skip the Override layer.
  - Only Cursor Agent and Claude Code Setup/Health rows may emit override_path.
  - Use manual path checkbox off means callers pass override_path = None.
  - Path normalization expands Unix home, Windows environment tokens, and relative paths only against workspace_root when present.
  - Directory overrides probe override/candidate_name and file overrides probe the exact file path.
  - Missing or invalid overrides return FoundButInvalid with OverrideMissing or OverrideInvalid and do not fall back to later layers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: override_semantics
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_override_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0017
preserved_exact_tokens:
  - "override_path"
  - "Setup/Health"
  - "Use manual path"
  - "native file picker"
  - "override_path = None"
  - "~"
  - "%VAR%"
  - "$Env:VAR"
  - "FoundButInvalid(OverrideInvalid)"
  - "FoundButInvalid(OverrideMissing)"
negative_constraints:
  - "Other tools must not emit override_path."
  - "Invalid or missing override paths must not fall back to other probe layers."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-011 - PATH Probe Layer

```yaml
plan_unit_id: BS-011
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: The PATH probe layer performs OS-native PATH lookup for each candidate name, continues after invalid PATH hits, and proceeds to CommonLocations only when no valid PATH hit exists.
gui_related: false
gui_classification_reason: OS-native PATH lookup is backend filesystem/provider discovery behavior.
split_recommended: false
depends_on: [BS-009]
unblocks: [BS-012]
acceptance_criteria:
  - Each candidate name is resolved using OS-native PATH lookup.
  - Invalid PATH hits do not stop the candidate search.
  - If no valid PATH hit exists, discovery proceeds to CommonLocations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: path_lookup_drift
reasoning_tier: standard
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_path_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0018
preserved_exact_tokens:
  - "PATH"
  - "OS-native PATH lookup"
  - "continue searching other candidate names"
  - "CommonLocations"
  - "which::which()"
compatibility_only_notes:
  - "which::which() is a legacy behavior anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-012 - CommonLocations Probe Layer

```yaml
plan_unit_id: BS-012
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: CommonLocations enumerates Provider-owned official/default candidate paths in stable order, expands home paths, de-duplicates normalized absolutes with first occurrence winning, validates each candidate, and excludes legacy/pre-rewrite binary locations.
gui_related: true
gui_classification_reason: The CommonLocations layer includes official GUI app footprints and install locations that feed user-visible setup/health outcomes.
split_recommended: false
depends_on: [BS-009, BS-011]
unblocks: [BS-013]
acceptance_criteria:
  - Candidate paths come from Provider-owned SSOT data in stable order.
  - Home expansion and normalized absolute path de-duplication are deterministic.
  - Each candidate path is checked for existence and validation.
  - Candidate paths are limited to official/default footprints plus explicit user override path.
  - Legacy/pre-rewrite binary locations are not included.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: common_locations_drift
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_commonlocations_probe_layer
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0019
preserved_exact_tokens:
  - "CommonLocations"
  - "Provider-owned SSOT data"
  - "stable order"
  - "Expand `~`"
  - "De-duplicate by normalized absolute path string"
  - "official/default footprints"
  - "legacy/pre-rewrite binary locations MUST NOT be included"
  - "PlatformSpec.default_install_paths"
  - "get_fallback_directories()"
negative_constraints:
  - "Candidate paths must not include legacy or pre-rewrite binary locations."
compatibility_only_notes:
  - "platform_specs.rs and path_utils.rs fallback directories are read-only legacy anchors."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-013 - Launcher Resolution

```yaml
plan_unit_id: BS-013
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  The Launchers layer is restricted to explicit deterministic rules, supports
  Cursor Agent versioned bundle resolution from OS-specific versions roots using
  byte-order lexicographic child selection, validates cursor-agent executables
  and Windows .cmd/.bat launchers, and returns NotFound when no launcher rule
  yields a valid hit.
gui_related: false
gui_classification_reason: Launcher resolution is deterministic filesystem/provider discovery behavior.
split_recommended: false
depends_on: [BS-009, BS-012]
unblocks: [BS-015, BS-016]
acceptance_criteria:
  - The Launchers layer uses only explicit deterministic rules and no broad filesystem crawling.
  - Cursor Agent versions roots are probed for Unix/WSL and Windows Native.
  - Immediate child directories are treated as opaque strings and selected by lexicographically greatest byte-order comparison.
  - Unix/WSL probes cursor-agent and Windows Native probes cursor-agent.exe under the selected version.
  - .cmd and .bat candidates are treated as launchers and validated through the standard validation contract.
  - NotFound is returned when no launcher rule yields a valid hit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: launcher_resolution_drift
reasoning_tier: high
context_scope: provider_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_launcher_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0022
preserved_exact_tokens:
  - "Launchers"
  - "no broad filesystem crawling"
  - "~/.local/share/cursor-agent/versions/"
  - "%LOCALAPPDATA%\\cursor-agent\\versions\\"
  - "lexicographically greatest name using byte-order string comparison"
  - "opaque strings"
  - "cursor-agent"
  - "cursor-agent.exe"
  - ".cmd"
  - ".bat"
  - "NotFound"
negative_constraints:
  - "Launcher resolution must not perform broad filesystem crawling."
compatibility_only_notes:
  - "puppet-master-rs/src/install/script_installer.rs is a legacy Cursor shim anchor only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-014 - Remote Indexer Binary Locator

```yaml
plan_unit_id: BS-014
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  For non-Git remote projects, BinaryLocator selects, transfers, verifies, and
  optionally cleans up the PM-managed sparse n-gram indexer helper binary while
  GitHub Integration owns remote project flow and storage-plan owns regex-index
  storage/cache semantics.
gui_related: false
gui_classification_reason: Remote helper selection, transfer, verification, fallback, and cleanup are backend deployment behavior.
split_recommended: false
depends_on: [BS-004, BS-005]
unblocks: [BS-015]
acceptance_criteria:
  - The remote indexer is a PM-managed build helper and not a provider CLI.
  - Supported shipped architectures are x86_64 and aarch64.
  - Remote architecture detection runs uname -m over SSH before transfer.
  - PM transfers the matching helper with scp and verifies it using xxh3 hash comparison.
  - PM does not execute binaries received from the remote host.
  - Missing architecture support falls back to unindexed ripgrep over SSH with degraded acceleration surfaced.
  - Cleanup behavior preserves reuse, optional project-close cleanup, and best-effort uninstall cleanup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remote_binary_integrity
reasoning_tier: high
context_scope: remote_project
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/GitHub_Integration.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocator_remote_indexer_binary_locator
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0024
preserved_exact_tokens:
  - "Remote indexer binary locator"
  - "PM-managed build helper"
  - "GitHub_Integration.md"
  - "storage-plan.md"
  - "x86_64"
  - "aarch64"
  - "uname -m"
  - "scp"
  - "xxh3"
  - "MUST NOT execute binaries received from the remote host"
  - "unindexed ripgrep"
negative_constraints:
  - "PM must not execute binaries received from the remote host."
owner_boundary_notes:
  - "Plans/GitHub_Integration.md owns remote project flow."
  - "Plans/storage-plan.md owns regex-index storage/cache semantics."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-015 - Validation Command, Execution, Parsing, And Permission Checks

```yaml
plan_unit_id: BS-015
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator validates candidates using the Provider-owned version command SSOT, executes the resolved path with a five-second timeout and enhanced PATH, parses versions deterministically, and applies lightweight platform permission checks while treating execution as authoritative.
gui_related: false
gui_classification_reason: Command selection, subprocess execution, version parsing, and permission checks are backend validation logic.
split_recommended: false
depends_on: [BS-013, BS-014]
unblocks: [BS-016, BS-018]
acceptance_criteria:
  - Version commands come from a Provider-owned SSOT for each provider_cli.
  - Validation executes <resolved_path> <version_command...> with a 5s timeout.
  - Child process environment sets enhanced PATH to reduce launcher-script false negatives.
  - Version parsing first uses a semantic version regex, then first non-empty stdout line, then first non-empty stderr line, else None.
  - Unix-like and Windows permission checks remain lightweight and execution attempt remains authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_contract_drift
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_validation_command_parsing_permissions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0029
preserved_exact_tokens:
  - "Validation contract (commands, version parsing, permission checks)"
  - "Command selection (SSOT)"
  - "Provider-owned SSOT version command"
  - "<resolved_path> <version_command...>"
  - "5s timeout"
  - "enhanced PATH"
  - '\d+\.\d+\.\d+'
  - "stdout"
  - "stderr"
  - "at least one execute bit"
  - ".exe"
  - ".cmd"
  - ".bat"
compatibility_only_notes:
  - "Legacy version_command, enhanced PATH, and extract_version anchors remain behavior compatibility references only."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-016 - Functional Validation Outcome And WrongBinary Guard

```yaml
plan_unit_id: BS-016
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: A candidate is Valid when the version command completes within timeout and returns success or a non-empty parsed version; otherwise spawn failures, timeouts, and non-zero exits with no parsed version are Invalid, while WrongBinary collision guarding remains disabled until Provider SSOT signatures exist.
gui_related: false
gui_classification_reason: Functional validation outcome and collision guarding are backend provider-validation logic.
split_recommended: false
depends_on: [BS-015]
unblocks: [BS-018, BS-020]
acceptance_criteria:
  - Successful exit or non-empty parsed version within timeout yields Valid.
  - Spawn failures, permission/security blocks, timeouts, and non-zero exits with no parsed version yield Invalid.
  - WrongBinary is optional and disabled by default until Provider SSOT defines deterministic signatures.
  - Implementations do not introduce heuristic string matching beyond the Provider SSOT.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_outcome_drift
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_functional_validation_outcome
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0030
preserved_exact_tokens:
  - "Functional validation outcome"
  - "Valid"
  - "Invalid"
  - "WrongBinary"
  - "disabled by default"
  - "Provider SSOT"
  - "MUST NOT introduce heuristic string matching"
negative_constraints:
  - "Collision guard must remain disabled by default until Provider SSOT defines deterministic WrongBinary signatures."
  - "Implementations must not introduce heuristic string matching beyond that SSOT."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-017 - Cache Scopes, Read Policy, And Invalidation

```yaml
plan_unit_id: BS-017
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator maintains per-user persistent provider_cli caches and per-workspace ephemeral Session caches, bypasses reads when force_rescan is true, fast-validates cached entries, writes through on Found(Valid), and evicts invalid or stale cache entries according to the source policy.
gui_related: false
gui_classification_reason: Cache keys, validation, write-through, and eviction are backend storage/provider behavior.
split_recommended: false
depends_on: [BS-007]
unblocks: [BS-020]
acceptance_criteria:
  - Per-user persistent cache is a durable KV keyed by provider_cli.
  - Per-workspace ephemeral cache is keyed by provider_cli and workspace_fingerprint during the current Session.
  - force_rescan bypasses cache reads.
  - Cached entries are fast-validated before return.
  - Found(Valid), FoundButInvalid, and NotFound outcomes apply the prescribed write-through and eviction rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cache_correctness
reasoning_tier: high
context_scope: provider_cache
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: binarylocator_cache_policy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0031
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0033
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0034
preserved_exact_tokens:
  - "Caching and invalidation"
  - "per-user persistent cache"
  - "durable KV"
  - "provider_cli"
  - "per-workspace ephemeral cache"
  - "workspace_fingerprint"
  - "force_rescan == true"
  - "fast-validated"
  - "write-through"
  - "evict"
negative_constraints:
  - "Cached paths must never be returned without fast validation."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-018 - BinaryLocator Stable Error Codes

```yaml
plan_unit_id: BS-018
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator returns stable BinaryErrorCode values suitable for UI rendering, logs, and evidence bundles, preserving each named code and typical layer mapping.
gui_related: true
gui_classification_reason: The error taxonomy is explicitly suitable for UI rendering and feeds user-visible setup/health failure details.
split_recommended: false
depends_on: [BS-008, BS-010, BS-016]
unblocks: [BS-019, BS-020]
acceptance_criteria:
  - OverrideMissing and OverrideInvalid remain Override-layer codes.
  - NotFound, NotExecutable, BlockedByOSSecurity, Timeout, MissingRuntime, and WrongBinary remain stable codes.
  - Stable codes remain suitable for UI rendering, logs, and evidence bundles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: error_taxonomy_drift
reasoning_tier: standard
context_scope: provider_error
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_stable_error_codes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0035
preserved_exact_tokens:
  - "Error taxonomy (stable codes)"
  - "OverrideMissing"
  - "OverrideInvalid"
  - "NotFound"
  - "NotExecutable"
  - "BlockedByOSSecurity"
  - "Timeout"
  - "MissingRuntime"
  - "WrongBinary"
  - "UI rendering"
  - "logs"
  - "evidence bundles"
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-019 - BinaryLocator UI Mapping Boundary

```yaml
plan_unit_id: BS-019
unit_type: requirement
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator provides stable error codes and trace output as inputs to the canonical UI SSOT and typed commands; Setup and Health/Doctor map Cursor/Claude results to Installed, Not Installed, or Failed, while manual path controls remain Cursor/Claude-only and Playwright health stays out of scope.
gui_related: true
gui_classification_reason: This unit defines user-visible setup/health labels, manual path controls, and UI command/SSOT boundaries.
split_recommended: false
depends_on: [BS-003, BS-010, BS-018]
unblocks: [BS-020]
acceptance_criteria:
  - UI copy, buttons, and view behavior are specified in FinalGUISpec and typed commands, not locally in BinaryLocator.
  - Setup and Health/Doctor map Found to Installed, NotFound to Not Installed, and FoundButInvalid to Failed with BinaryErrorCode and trace details.
  - Manual path controls are Cursor/Claude-only and use Use manual path checkbox plus native file picker.
  - Toggling manual path off clears override_path and reverts to normal probe layers.
  - Playwright installation state is driven by Browser Tools health checks, not Provider CLI lookup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_boundary_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
  - future typed UICommand implementation crate
node_compile_hint:
  mode: binarylocator_ui_mapping_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0036
preserved_exact_tokens:
  - "UI mapping (DRY)"
  - "Plans/FinalGUISpec.md"
  - "crates/ui_commands/"
  - "Installed"
  - "Not Installed"
  - "Failed"
  - "BinaryErrorCode"
  - "trace details"
  - "Use manual path"
  - "native file picker"
  - "Playwright installation state is out of scope"
negative_constraints:
  - "BinaryLocator must not own UI copy, buttons, view behavior, or Playwright installation health."
owner_boundary_notes:
  - "FinalGUISpec plus typed commands own UI behavior."
  - "Browser Tools health checks own Playwright installation state."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-020 - Evidence Gates And Discovery Matrix

```yaml
plan_unit_id: BS-020
unit_type: validation_rule
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator implementation nodes must produce evidence bundles with this spec's ContractRefs, satisfy GATE-009 ContractRef coverage, and preserve the OS/provider install-method discovery matrix through macOS, Linux, Windows Native, and Windows WSL cases.
gui_related: false
gui_classification_reason: Evidence bundles, gates, and discovery matrix rows are validation and test-planning requirements rather than GUI behavior.
split_recommended: false
depends_on: [BS-016, BS-017, BS-018, BS-019]
unblocks: []
acceptance_criteria:
  - Any BinaryLocator implementation node references the ContractRefs in this spec in its evidence bundle.
  - Operational code and updated plan docs satisfy GATE-009 ContractRef coverage.
  - Discovery matrix rows preserve OS, Provider CLI, supported footprint, PATH setup, expected probe layer, and expected resolved path patterns.
  - Matrix paths preserve macOS, Linux, Windows Native, and Windows WSL Cursor Agent and Claude Code cases.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_coverage
reasoning_tier: standard
context_scope: validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_evidence_gates_discovery_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0037
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0039
preserved_exact_tokens:
  - "Acceptance criteria (testable)"
  - "Evidence + gates"
  - "evidence_bundle"
  - "GATE-009"
  - "Discovery matrix (OS x install method)"
  - "~/.local/bin/agent"
  - "/opt/homebrew/bin/agent"
  - "/usr/local/bin/agent"
  - '%LOCALAPPDATA%\\cursor-agent\\agent.exe'
  - "/opt/homebrew/bin/claude"
  - "~/.local/bin/claude"
  - '%APPDATA%\\npm\\claude.cmd'
  - '%LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\claude.exe'
negative_constraints:
  - "Evidence-gate coverage must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks during this migration batch."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-021 - BinaryLocator Functional Acceptance Checks

```yaml
plan_unit_id: BS-021
unit_type: validation_rule
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator functional acceptance requires deterministic repeated results, fail-fast override behavior, version-command validation for Found results, complete ordered trace attempts, fast-validated caches, force_rescan cache bypass, Windows launcher support, Cursor versions subtree resolution, manual-path UX fidelity, and deterministic Setup/Health state mapping.
gui_related: true
gui_classification_reason: The functional checks include manual-path UX and Setup/Health Installed, Not Installed, and Failed state labels.
split_recommended: false
depends_on: [BS-010, BS-013, BS-016, BS-017, BS-019, BS-020]
unblocks: []
acceptance_criteria:
  - Repeated runs on a fixed filesystem snapshot return identical source_layer, resolved_path, and resolved_name.
  - Invalid override returns FoundButInvalid(OverrideInvalid) with no fallback probing.
  - Every Found result passes version-command validation and returns version when parseable.
  - trace includes every attempted candidate in order, including misses.
  - Cached paths are never returned without fast validation and invalid cached paths are evicted.
  - force_rescan=true bypasses caches and updates results even when a cached value remains valid.
  - .cmd and .bat candidates are validated as executable launchers.
  - Cursor versions subtree resolves and validates the latest lexicographic entry when only the versions bundle exists.
  - Manual-path UX emits no override_path when unchecked and exactly the file-picker path when checked.
  - Identical BinaryLocateResult values map to identical Setup/Health labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_coverage
reasoning_tier: high
context_scope: provider_validation
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: binarylocator_functional_acceptance_checks
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0040
preserved_exact_tokens:
  - "Functional acceptance checks"
  - "source_layer"
  - "resolved_path"
  - "resolved_name"
  - "FoundButInvalid(OverrideInvalid)"
  - "trace"
  - "force_rescan=true"
  - ".cmd"
  - ".bat"
  - "versions"
  - "override_path"
  - "file-picker path"
  - "BinaryLocateResult"
  - "Installed"
  - "Not Installed"
  - "Failed"
negative_constraints:
  - "Invalid override must not fall back to other probe layers."
  - "Cached paths must not be returned without fast validation."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-022 - BinaryLocator References And Legacy Anchors

```yaml
plan_unit_id: BS-022
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator references Spec Lock, Crosswalk, DRY Rules, Glossary, Decision Policy, Contracts V0, storage-plan EventEnvelopeV1 compatibility, and read-only legacy behavior anchors without turning those references into local re-ownership.
gui_related: false
gui_classification_reason: Reference lists and legacy behavior anchors are source authority metadata, not GUI implementation work.
split_recommended: false
depends_on: [BS-004]
unblocks: []
acceptance_criteria:
  - References preserve Spec_Lock.json, Crosswalk.md, DRY_Rules.md, Glossary.md, Decision_Policy.md, Contracts_V0.md, and storage-plan.md.
  - EventEnvelopeV1 remains a storage-plan compatibility note.
  - Legacy behavior anchors stay read-only and include the named puppet-master-rs platform, path, detector, and installer files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reference_drift
reasoning_tier: standard
context_scope: governance
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_references_legacy_anchors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0041
preserved_exact_tokens:
  - "References"
  - "Plans/Spec_Lock.json"
  - "Plans/Crosswalk.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Glossary.md"
  - "Plans/Decision_Policy.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "EventEnvelopeV1"
  - "Legacy behavior anchors (read-only)"
  - "puppet-master-rs/src/platforms/platform_specs.rs"
  - "puppet-master-rs/src/platforms/path_utils.rs"
  - "puppet-master-rs/src/platforms/platform_detector.rs"
  - "puppet-master-rs/src/install/script_installer.rs"
negative_constraints:
  - "Reference anchors must not become competing local ownership."
compatibility_only_notes:
  - "Legacy behavior anchors are read-only compatibility evidence."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-023 - BinaryLocator Owner/Consumer Map Preservation

```yaml
plan_unit_id: BS-023
unit_type: constraint
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: BinaryLocator remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: Owner/consumer mapping is documentation governance and routing behavior, not GUI implementation work.
split_recommended: false
depends_on: [BS-004, BS-005]
unblocks: []
acceptance_criteria:
  - Plans/BinaryLocator_Spec.md remains owner for BinaryLocator behavior.
  - Cross-doc ownership follows ContractRefs and boundary notes rather than local duplication.
  - The Plan Document System and Bootstrap Planning Migration references remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: standard
context_scope: owner_boundary
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_owner_consumer_map_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0042
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "Plans/BinaryLocator_Spec.md"
  - "owner doc"
  - "cross-doc ownership"
  - "ContractRefs"
  - "boundary notes"
  - "Plans/Plan_Document_System.md"
  - "Plans/Bootstrap_Planning_Migration.md"
negative_constraints:
  - "Owner/consumer map preservation must not create new local ownership for cross-doc contracts."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```

### BS-024 - BinaryLocator PlanUnits Section Anchor

```yaml
plan_unit_id: BS-024
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: The PlanUnits section anchor is preserved as structural Plan Document System layout and does not introduce additional product behavior beyond the fine-grained BinaryLocator PlanUnits.
gui_related: false
gui_classification_reason: The PlanUnits heading is structural document layout metadata, not GUI implementation work.
split_recommended: false
depends_on: [BS-001]
unblocks: []
acceptance_criteria:
  - The PlanUnits section remains available for Plan Document System indexing.
  - Structural coverage for BinaryLocator_Spec-S0043 is recorded without inventing product requirements.
  - This structural unit creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: structural_anchor
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
node_compile_hint:
  mode: binarylocator_planunits_section_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:BinaryLocator_Spec-S0043
preserved_exact_tokens:
  - "PlanUnits"
negative_constraints:
  - "Do not treat the structural PlanUnits heading as a product requirement."
owner_hints:
  - Plans/BinaryLocator_Spec.md
```
