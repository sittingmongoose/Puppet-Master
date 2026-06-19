# Shard 028: PlanUnits

Source: `Plans/FileSafe.md`

Source lines: L2718-L12977

Source SHA256: `a1ef3a9cbb332706dc5b6576c5211914693efc0ea1cdd00fe066a56bb4b861e3`

---

## PlanUnits

### F2-002 - FileSafe Document Authority And Status

```yaml
plan_unit_id: F2-002
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe.md is a Plan Document Only implementation plan for Puppet Master with CRITICAL
  priority, deterministic defaults under Decision_Policy, and no open questions while retaining
  FileSafe as the source for the described safety policy.
gui_related: false
gui_classification_reason: >-
  This unit records document governance and status rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_document_authority_and_status
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0001"
preserved_exact_tokens:
- "FileSafe -- Implementation Plan"
- "Puppet Master"
- "No open questions"
- "deterministic defaults"
- "CRITICAL"
- "Plan Document Only"
- "Plans/DRY_Rules.md"
- "Plans/Contracts_V0.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FileSafe.md follows DRY_Rules and references SSOT contracts in Contracts_V0."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-003 - DRY Implementation Compliance

```yaml
plan_unit_id: F2-003
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe implementation work must follow DRY principles by tagging reusable functions, data
  structures, and helpers, using platform_specs functions for platform data instead of hardcoding,
  and checking the GUI widget catalog before creating new UI widgets.
gui_related: true
gui_classification_reason: >-
  The span includes the user-visible docs/gui-widget-catalog.md UI widget creation rule.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: dry_implementation_compliance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0002"
preserved_exact_tokens:
- "// DRY:FN:<name>"
- "// DRY:DATA:<name>"
- "// DRY:HELPER:<name>"
- "platform_specs::"
- "docs/gui-widget-catalog.md"
- "never hardcode"
- "All code in this plan MUST follow DRY principles."
negative_constraints:
- "Platform data must use platform_specs:: functions and must not be hardcoded."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-004 - Rewrite Era FileSafe Authority Boundary

```yaml
plan_unit_id: F2-004
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  In the rewrite, FileSafe remains authoritative only for safety policy and is implemented
  primarily through the central tool registry and policy engine, the patch/apply/verify/rollback
  pipeline, and canonical seglog guard events while Prompt Pipeline owns context compilation and
  related heuristics.
gui_related: false
gui_classification_reason: >-
  This unit defines safety-policy and runtime ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: rewrite_era_filesafe_authority_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "FileSafe safety policy only"
- "central tool registry + policy engine"
- "permissions, validation, and normalized tool outcomes"
- "patch/apply/verify/rollback pipeline"
- "canonical seglog event stream"
- "Context compilation"
- "Prompt_Pipeline.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Prompt_Pipeline.md owns context compilation, delta-context selection, cache heuristics, marker files, skill bundling, and compaction strategy."
- "FileSafe may reference adjacent flows only to define where safety checks run against compiled output."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-005 - Guard Ready Adjacent Inputs And Fail Closed Seams

```yaml
plan_unit_id: F2-005
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe consumes adjacent owner-doc contracts only as guard-visible inputs for mutation
  authorization, rollback, reveal/open routing, runtime dispatch, recovery, or event logging, and
  it fails closed when required inputs are absent or stale while packet-level elaboration remains
  non-authoritative until owners expose guard-ready contracts.
gui_related: false
gui_classification_reason: >-
  This unit defines guard input contracts and fail-closed seams.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: guard_ready_adjacent_inputs_and_fail_closed_seams
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "FileManager shared-buffer /file-tree behavior"
- "preview /file-type behavior"
- "/cache/offline/LSP/degraded-state"
- "/watchers/degraded-state"
- "/snapshot"
- "/trust/fallback"
- "Guard-visible inputs"
- "/open/reveal/save"
- "/dirty/recovery/on-disk"
- "/undo"
- "/redo"
- "/symlink/case-sensitivity"
- "/IME/accessibility"
- "/browser/session"
- "/webview"
- "search-in-diff"
- "heat-map"
- "/change-marker"
negative_constraints:
- "FileSafe must fail closed when guard-visible inputs are absent or stale."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "External implementation-reference findings do not create FileSafe ownership over FileManager, FinalGUI, preview/browser, terminal, platform-adapter, diff/review, SSH/remote, preview/media, drag/drop, or file explorer correctness."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-006 - Portable Rust And Slint Guard Boundary

```yaml
plan_unit_id: F2-006
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe implementation guidance keeps a hard boundary between portable product ideas and
  implementation patterns tied to Electron or DOM-heavy stacks so guard logic, canonicalization,
  mutation safety, durability, atomic write, optimistic concurrency, and event logging remain safe
  for Rust + Slint across macOS, Linux, and Windows.
gui_related: false
gui_classification_reason: >-
  This unit constrains implementation portability rather than visual behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: portable_rust_and_slint_guard_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "Rust + Slint"
- "macOS/Linux/Windows"
- "DOM process"
- "browser storage"
- "Electron-only lifecycle behavior"
- "Guard logic"
- "canonicalization"
- "mutation-safety"
- "/durability"
- "atomic write"
- "optimistic concurrency"
- "event logging"
negative_constraints:
- "FileSafe guard behavior must not depend on DOM process, browser storage, or Electron-only lifecycle behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-007 - Command And Route Input Normalization

```yaml
plan_unit_id: F2-007
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Cross-surface commands and routing/open seams are guard-visible only when arguments derive from
  shared route schemas and owner-doc contracts; route_target must not carry source-buffer
  realization details, file/evidence and attempt/generated surfaces must expose first-class
  identity, and open-by-identity plus wiring normalization must come from owner docs.
gui_related: false
gui_classification_reason: >-
  This unit defines route and command verification inputs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: command_and_route_input_normalization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "cmd.orchestrator.open_in_source_control"
- "shared route schema"
- "custom arg shapes"
- "route_target"
- "source-buffer"
- "/file/evidence"
- "/attempt/generated"
- "/open-by-identity"
- "/wiring"
negative_constraints:
- "route_target must not carry source-buffer realization details."
- "Open-by-identity and wiring normalization must come from owner-doc contracts rather than addendum-only concepts."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Cross-surface command argument shapes are guard-visible inputs, not separate FileSafe command contracts."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-008 - Projection Trust And Hostability Context

```yaml
plan_unit_id: F2-008
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Projection trust and hostability become FileSafe guard-visible context when actions launch from
  FinalGUISpec, Widget_System.md, or Orchestrator_Page.md, requiring trust-state coverage for
  projection-backed tabs, widgets and panels, terminal widget identity, Dashboard and Progress
  hostability, filters, focused-run scope, and widget-local display config.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible shell, projection, widget, tab, and hostability context needed
  for safe FileSafe actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: projection_trust_and_hostability_context
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "trust-state"
- "FinalGUISpec"
- "Widget_System.md"
- "Orchestrator_Page.md"
- "projection-backed tabs"
- "/widgets/panels"
- "terminal widget identity"
- "/Dashboard"
- "Progress hostability"
- "page/tab/global"
- "/tab/global"
- "focused-run"
- "widget-local display config"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec, Widget_System.md, and Orchestrator_Page.md provide projection and hostability context that FileSafe consumes when relevant to guard decisions."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-009 - Runtime Blocked Identity And Decision Authority

```yaml
plan_unit_id: F2-009
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Orchestrator live-status dependencies for FileSafe-relevant actions bind through canonical
  runtime blocked identity, request-centric HITL bindings and blocked-projection bindings cannot
  compete, and Decision_Policy.md remains the authority for concern acknowledgements, promotion
  revocation, corroboration outcomes, and blocked-state ownership before guard recovery or
  promotion-related actions are allowed.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked identity and decision authority rather than presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_blocked_identity_and_decision_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "live-status"
- "canonical runtime blocked identity"
- "HITL"
- "blocked-projection bindings"
- "Decision_Policy.md"
- "concerns"
- "revoke promotions"
- "corroboration outcomes"
- "blocked states"
- "guard recovery"
negative_constraints:
- "Request-centric HITL bindings and blocked-projection bindings cannot compete or decide recovery authority independently."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Decision_Policy.md owns concern acknowledgement, promotion revocation, corroboration outcomes, and blocked states under the overseer model."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-010 - Ordered Open By Identity Reconciliation And Spec Integrity

```yaml
plan_unit_id: F2-010
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe treats routing/open-by-identity reconciliation as ordered rather than broad invention:
  close the owner-doc structural gap, then command and wiring normalization, then accept bounded
  stale consumer reconciliations as guard-ready inputs; runtime-era concepts are insufficient
  until registration, verification, or routing owners expose them, and missing owner sections are
  spec-integrity failures when FileSafe relies on them.
gui_related: false
gui_classification_reason: >-
  This unit defines spec integrity and reconciliation ordering.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: ordered_open_by_identity_reconciliation_and_spec_integrity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "routing/open-by-identity tranche"
- "ordered reconciliation"
- "owner-doc structural gap"
- "command/wiring normalization gap"
- "runtime-era"
- "/verification/routing"
- "spec-integrity"
- "Orchestrator_Page.md"
- "runtime-artifact schemas"
- "command catalog references"
negative_constraints:
- "FileSafe must record missing owner sections as spec-integrity failures when relying on those claims for guard-visible routing or verification."
compatibility_only_notes: []
stale_retired_dispositions:
- "Stale consumer reconciliations are accepted only after owner-doc structural and command/wiring gaps are closed."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-011 - Execution Transport Guard Boundary

```yaml
plan_unit_id: F2-011
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Execution/runtime transport remains a separate seam with explicit request, response, and error
  ownership before spawn, and FileSafe may block terminal-first, Unix-native, browser-runner,
  auth, polling, asset serving, persistence, remote bootstrap, packaging, startup, or
  portability-dependent paths that bypass canonical scope, recovery, or event logging.
gui_related: false
gui_classification_reason: >-
  This unit defines execution transport safety boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: execution_transport_guard_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0003"
preserved_exact_tokens:
- "Execution/runtime transport"
- "request/response/error ownership"
- "terminal-first"
- "Unix-native"
- "single-snippet"
- "/browser-runner"
- "/bin/sh"
- "Unix signals"
- "VTE/TTY"
- "/input/cursor/selection"
- "IME"
- "/reveal"
- "/compile"
- "/auth"
- "/polling"
- "asset serving"
- "remote /bootstrap"
- "packaging/startup"
negative_constraints:
- "FileSafe may block execution/runtime paths that bypass canonical scope, recovery, or event logging."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-012 - Canonical Guardrail Summary And Prompt Boundary

```yaml
plan_unit_id: F2-012
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe is the canonical guardrail layer for blocking destructive commands, constraining write
  scope, filtering sensitive access, validating compiled prompt content, and recording guard
  outcomes in the canonical event stream, while Prompt_Pipeline.md owns context selection and
  compilation algorithms and doc-change mutation authority is narrowed to Contracts_V0 payloads
  plus FileSafe guard outcomes.
gui_related: false
gui_classification_reason: >-
  This unit defines guardrail and prompt-boundary contracts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: canonical_guardrail_summary_and_prompt_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0004"
preserved_exact_tokens:
- "canonical guardrail layer"
- "blocks destructive commands"
- "constrains write scope"
- "filters sensitive file access"
- "validates compiled prompt content"
- "canonical event stream"
- "Prompt/context compilation"
- "structured attachments"
- "run/node/attempt identity"
- "Doc-change mutation surfaces"
- "Contracts_V0.md"
negative_constraints:
- "Other docs may consume doc-change mutation records but must not mint a competing doc-change authority."
compatibility_only_notes:
- "Prompt/context compilation is adjacent but separately owned by Prompt_Pipeline.md."
stale_retired_dispositions: []
owner_boundary_notes:
- "Prompt_Pipeline.md owns run/work-package/node/attempt-scoped context selection, delta compilation, cache heuristics, skill bundling, and compaction behavior."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-013 - Core FileSafe Function Set

```yaml
plan_unit_id: F2-013
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Part A FileSafe owns the core guard function set: command blocklist, write scope, security
  filter, compiled prompt checking, and verification/override integration.
gui_related: false
gui_classification_reason: >-
  This unit enumerates core safety functions rather than UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: core_filesafe_function_set
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0005"
preserved_exact_tokens:
- "Part A -- FileSafe"
- "FileSafe: Command blocklist"
- "FileSafe: Write scope"
- "FileSafe: Security filter"
- "Compiled prompt checking"
- "Verification and override integration"
- "canonical allowed-file scope"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Permissions_System.md, Tools.md, and Run_Modes.md are referenced for permissions, tooling, and run-mode behavior."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-014 - Compiled Context Safety Boundary

```yaml
plan_unit_id: F2-014
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Part B FileSafe checks the fully compiled prompt after Prompt Pipeline assembly and before
  provider dispatch, validates structured attachments, forwarded document selections, and file
  references against security and write-scope policy, and emits structured allow/block outcomes to
  seglog.
gui_related: false
gui_classification_reason: >-
  This unit governs prompt-dispatch safety checks rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: compiled_context_safety_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0006"
preserved_exact_tokens:
- "Part B -- Compiled-context safety boundary"
- "fully compiled prompt"
- "after Prompt Pipeline assembly"
- "before provider dispatch"
- "structured attachments"
- "forwarded document selections"
- "file references"
- "allow/block outcomes"
- "seglog"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Prompt_Pipeline.md owns assembly; FileSafe owns the post-assembly safety boundary before provider dispatch."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-015 - Three Layer Defense And Pre Execution Primacy

```yaml
plan_unit_id: F2-015
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe architecture uses a three-layer defense with pre-execution guard, agent prompt rules,
  and post-execution audit, and Layer 1 is primary because it blocks destructive commands before
  execution regardless of model behavior.
gui_related: false
gui_classification_reason: >-
  This unit defines guard architecture rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: three_layer_defense_and_pre_execution_primacy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0009"
preserved_exact_tokens:
- "Pre-execution guard"
- "Agent prompt rules"
- "Post-execution audit"
- "Deterministic (regex match)"
- "Probabilistic (model compliance)"
- "Layer 1 is the fix"
- "Before every Bash/command call"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-016 - Effective Runtime Configuration Rendering

```yaml
plan_unit_id: F2-016
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe GUI configuration recomputes predicted requested and effective state for
  effective-runtime interactions when provider, account, model, threshold, or effort settings
  change, preserving account/model/threshold/effort context and keeping inherit/override,
  requested/effective, and provider honored/skipped/clamped states visually distinct.
gui_related: true
gui_classification_reason: >-
  This unit governs visible FileSafe GUI configuration state and labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: effective_runtime_configuration_rendering
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0010"
preserved_exact_tokens:
- "FileSafe GUI configuration"
- "requested/effective"
- "/account/model/threshold/effort"
- "inherit/override"
- "honored/skipped/clamped"
- "/override"
- "/effective"
- "/skipped/clamped"
negative_constraints:
- "inherit/override, requested/effective, and provider honored/skipped/clamped labels must not be collapsed into one toggle state."
compatibility_only_notes: []
stale_retired_dispositions:
- "FileSafe GUI configuration must not show stale requested/effective state after provider/account/model/threshold/effort changes."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-017 - Runtime Identity And Provider Account Normalization

```yaml
plan_unit_id: F2-017
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Runtime snapshots may include model, auth, and account credentials, but FileSafe also records
  non-provider operational identities when write scope, prompt safety, or recovery depends on
  account, instruction bundle, runtime binding, lane, or policy layer, and it consumes shared
  provider_account_id identity rather than minting local provider or account IDs.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime identity and guard logging contracts.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_identity_and_provider_account_normalization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0010"
preserved_exact_tokens:
- "/model/auth/account"
- "provider_account_id"
- "account, instruction bundle, runtime binding, lane, or policy layer"
- "guard logs"
- "runtime snapshots"
- "tier_id"
negative_constraints:
- "FileSafe must not mint local provider/account IDs for guard logs or runtime snapshots."
- "Execution correlation must not drift back to tier-era labels; tier_id is human-readable grouping metadata only."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-018 - Lane Aware Model And Worktree Isolation Inputs

```yaml
plan_unit_id: F2-018
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Model and provider enforcement is lane-aware, a Security Lane may require a specific model
  before FileSafe allows execution, and WorktreeGitImprovement.md owns worktree strategy so source
  labels, explicit no-worktrees, and per-subtask worktrees cannot override FileSafe guard-visible
  isolation.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime lane and worktree isolation policy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: lane_aware_model_and_worktree_isolation_inputs
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0010"
preserved_exact_tokens:
- "Security Lane"
- "Plans/Models_System.md"
- "Plans/WorktreeGitImprovement.md"
- "chain-wizard-flexibility"
- "chain-wizard-flexibility.md"
- "no-worktrees"
- "per-subtask worktrees"
- "guard-visible isolation contract"
negative_constraints:
- "Source labels, explicit no-worktrees, and per-subtask worktrees cannot override FileSafe guard-visible isolation."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Worktree strategy is resolved by Plans/WorktreeGitImprovement.md."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-019 - Multi Node Role Specific Write Scope

```yaml
plan_unit_id: F2-019
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe write scope is multi-node and role-specific: sharded node scopes under
  puppet-master/project/plan_graph/ and /project/plan_graph/ map by Task/Subtask/Iteration, active
  node or work package, and allowed-file metadata rather than one monolithic puppet-master plan
  file.
gui_related: false
gui_classification_reason: >-
  This unit defines write-scope policy and allowed-file metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: multi_node_role_specific_write_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0010"
preserved_exact_tokens:
- "multi-node and role-specific"
- "puppet-master/project/plan_graph/"
- "/project/plan_graph/"
- "/Task/Subtask/Iteration"
- "active node/work package"
- "allowed-file metadata"
- "one monolithic puppet-master plan file"
negative_constraints:
- "FileSafe write scope must not collapse to one monolithic puppet-master plan file."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-020 - Account Instruction Runtime Override Policy

```yaml
plan_unit_id: F2-020
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Agent-Config shell ownership remains in FinalGUISpec.md, but FileSafe configuration carries
  account/instruction/runtime context when guard decisions depend on it, and provider-specific
  divergence requires an explicit Manual Override toggle before FileSafe permits behavior outside
  the shared state model.
gui_related: true
gui_classification_reason: >-
  This unit governs visible Agent-Config shell state and Manual Override behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: account_instruction_runtime_override_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0010"
preserved_exact_tokens:
- "Agent-Config"
- "Plans/FinalGUISpec.md"
- "/account/instruction/runtime"
- "Manual Override"
- "provider-specific divergence"
- "provider-specific GUI wording/flows"
- "account/runtime model"
negative_constraints:
- "Provider-specific divergence requires an explicit Manual Override toggle before FileSafe allows behavior that departs from the shared state model."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec.md owns Agent-Config shell state; FileSafe consumes the account/instruction/runtime contract for write-scope and prompt-safety decisions."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-021 - BaseRunner Pre Spawn Guard Hook

```yaml
plan_unit_id: F2-021
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The guard integration point is before process spawn in BaseRunner::execute_command, where
  bash_guard.check_command blocks destructive commands and returns a Destructive command blocked
  error; the old puppet-master-rs path is preserved as a legacy implementation reference that must
  be validated against the Rust + Slint rebuild before implementation.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime integration and legacy codepath reference.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_pre_spawn_guard_hook
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0011"
preserved_exact_tokens:
- "BaseRunner::execute_command()"
- "puppet-master-rs/src/platforms/runner.rs"
- "CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command"
- "bash_guard.check_command"
- "Destructive command blocked"
- "Before spawning the process"
- "line ~266"
negative_constraints: []
compatibility_only_notes:
- "The puppet-master-rs CodePath is preserved as legacy/path reference and must be validated against the Rust + Slint rebuild before implementation."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-022 - Startup And Orchestrator Guard Initialization

```yaml
plan_unit_id: F2-022
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  At startup, the app loads GuiConfig, extracts FileSafeConfig, validates fail-closed guard
  prerequisites, and stores validated config; when the orchestrator starts, it builds runtime
  config from validated GUI config, resolves FileSafe guard inputs and canonical roots, and passes
  FileSafe config into runner construction.
gui_related: false
gui_classification_reason: >-
  This unit defines startup and orchestrator guard initialization flow.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: startup_and_orchestrator_guard_initialization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0013"
preserved_exact_tokens:
- "GuiConfig"
- "FileSafeConfig"
- "fail-closed guard prerequisites"
- "app state"
- "orchestrator starts"
- "validated GUI config"
- "FileSafe guard inputs"
- "canonical roots"
- "runner construction"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Tools.md, Permissions_System.md, Architecture_Invariants.md, orchestrator-subagent-integration.md, Run_Modes.md, and storage-plan.md supply referenced contracts."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-023 - Runtime Guard Construction And Request Binding

```yaml
plan_unit_id: F2-023
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  When BaseRunner is created, FileSafe initializes BashGuard, FileGuard, and SecurityFilter as
  shared runtime objects only after initialization succeeds; per ExecutionRequest, it binds
  canonical allowed-file scope, resolves root/path mode, runs checks before provider process spawn
  or tool dispatch, and emits structured allow/block outcomes to the canonical event stream.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime guard lifecycle and request binding.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_guard_construction_and_request_binding
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0013"
preserved_exact_tokens:
- "BaseRunner"
- "BashGuard"
- "FileGuard"
- "SecurityFilter"
- "shared runtime objects"
- "ExecutionRequest"
- "canonical allowed-file scope"
- "canonical root"
- "path mode"
- "provider process spawn"
- "tool dispatch"
- "structured allow/block outcomes"
- "canonical event stream"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Contracts_V0.md, Tools.md, storage-plan.md, and Runtime_Artifacts_Panel.md provide referenced contracts for guard outcomes and event state."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-024 - Fail Closed Config Scope And Pattern Handling

```yaml
plan_unit_id: F2-024
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe fail-closed handling blocks affected execution paths when a guard cannot initialize,
  allows unreadable external pattern sources only when a bundled canonical baseline remains
  trustworthy, fails requests closed when canonical-root or scope resolution fails, and permits
  invalid config to normalize only to stricter safe defaults.
gui_related: false
gui_classification_reason: >-
  This unit defines fail-closed safety behavior for guard initialization, external pattern
  sources, and request scope resolution.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: fail_closed_config_scope_and_pattern_handling
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0013"
preserved_exact_tokens:
- "Fail-closed error handling"
- "guard cannot initialize"
- "structured startup/runtime error"
- "configured external pattern source is unreadable"
- "bundled canonical baseline"
- "no trustworthy baseline"
- "canonical-root or scope resolution fails"
- "stricter safe default"
- "MUST NOT silently widen authority"
negative_constraints:
- "Invalid config may normalize only to a stricter safe default; it MUST NOT silently widen authority."
- "If no trustworthy baseline exists, destructive-command execution remains blocked."
- "Canonical-root or scope resolution failure must fail closed instead of guessing case mode or write scope."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-025 - FileSafe Module Layout

```yaml
plan_unit_id: F2-025
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The FileSafe module layout is under src-tauri/src/filesafe with mod.rs, types.rs, scope.rs,
  bash_guard.rs, snapshot.rs, and validator.rs, and scope.rs owns scope and canonical-path
  enforcement.
gui_related: false
gui_classification_reason: >-
  This unit defines module architecture and source layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_module_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0014"
preserved_exact_tokens:
- "src-tauri/src/filesafe/"
- "mod.rs"
- "types.rs"
- "scope.rs"
- "bash_guard.rs"
- "snapshot.rs"
- "validator.rs"
- "Scope and canonical-path enforcement"
- "Module Declaration"
- "pub mod bash_guard"
- "pub mod scope"
- "pub mod snapshot"
- "pub mod types"
- "pub mod validator"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-026 - Destructive Pattern Source Resolution And Exports

```yaml
plan_unit_id: F2-026
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Destructive command pattern sources resolve from custom path, project-specific
  .puppet-master/destructive-commands.local.txt, then bundled baseline, with
  bundled/runtime/project-specific locations preserved and fail-closed behavior if no trustworthy
  baseline exists; mod.rs re-exports BashGuard and GuardError.
gui_related: false
gui_classification_reason: >-
  This unit defines pattern source resolution and public guard exports.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: destructive_pattern_source_resolution_and_exports
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0014"
preserved_exact_tokens:
- "Bundled"
- "Runtime"
- "Project-specific"
- ".puppet-master/destructive-commands.local.txt"
- "Resolution order"
- "Custom path → Project-specific → Bundled baseline"
- "fail closed"
- "pub use bash_guard::{BashGuard, GuardError};"
- "FileSafe — guards for preventing destructive operations"
negative_constraints:
- "Pattern resolution must fail closed if no trustworthy baseline exists."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-027 - BashGuard State And GuardError Taxonomy

```yaml
plan_unit_id: F2-027
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BashGuard models the command blocklist state, including regex patterns, destructive override,
  enabled state, approved command list, and GuardError variants for destructive commands,
  out-of-plan files, sensitive file access, and parse errors.
gui_related: false
gui_classification_reason: >-
  This unit defines backend guard data and error taxonomy rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: bashguard_state_and_guarderror_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "DRY:DATA:BashGuard"
- "BashGuard"
- "patterns: Vec<Regex>"
- "allow_destructive"
- "enabled"
- "approved_commands: Vec<String>"
- "GuardError"
- "DestructiveCommand"
- "FileNotInPlan"
- "SensitiveFileAccess"
- "ParseError"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This is a FileSafe guard model and not GUI configuration ownership."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-028 - BashGuard Initialization And Fail Closed Baseline Selection

```yaml
plan_unit_id: F2-028
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BashGuard initialization creates the guard from an optional config path,
  PUPPET_MASTER_ALLOW_DESTRUCTIVE, project-specific or bundled destructive-command patterns,
  loaded patterns, and FileSafeConfig-approved commands, and it fails closed when no trustworthy
  pattern baseline is available.
gui_related: false
gui_classification_reason: >-
  This unit defines backend guard initialization and baseline selection.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: bashguard_initialization_and_fail_closed_baseline_selection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "DRY:FN:new"
- "config_path"
- "PUPPET_MASTER_ALLOW_DESTRUCTIVE"
- ".puppet-master/destructive-commands.local.txt"
- "puppet-master-rs/config/destructive-commands.txt"
- "load_patterns"
- "Pattern file not found"
- "Fail closed until a trustworthy baseline is available"
- "enabled = true"
- "Populated from FileSafeConfig"
negative_constraints:
- "No trustworthy destructive-command baseline means initialization error and fail-closed behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-029 - Bundled Pattern File Lookup Fallbacks

```yaml
plan_unit_id: F2-029
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Bundled destructive-command pattern lookup searches development/build, binary-relative,
  config-relative, and executable-relative locations and returns a fallback path for the caller to
  handle when no candidate exists.
gui_related: false
gui_classification_reason: >-
  This unit defines bundled pattern lookup behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: bundled_pattern_file_lookup_fallbacks
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "DRY:FN:find_bundled_patterns_file"
- "puppet-master-rs/config/destructive-commands.txt"
- "../config/destructive-commands.txt"
- "config/destructive-commands.txt"
- "std::env::current_exe"
- "caller will handle missing file"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit records concrete lookup behavior and does not duplicate the broader pattern-source authority carried by F2-026."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-030 - Deliberate Disabled Guard State

```yaml
plan_unit_id: F2-030
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  A disabled BashGuard instance is only for deliberate config-off states, initializes with empty
  patterns and approved commands, keeps allow_destructive false, and must not be used as an
  initialization-failure fallback.
gui_related: false
gui_classification_reason: >-
  This unit defines backend disabled guard state.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: deliberate_disabled_guard_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "DRY:FN:disabled"
- "explicitly disabled guard instance"
- "deliberate config-off states"
- "not init-failure fallback"
- "enabled: false"
- "patterns: Vec::new()"
- "allow_destructive: false"
negative_constraints:
- "Disabled guard state must not be used as fallback for initialization failure."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-031 - Command Blocklist Evaluation And Error Emission

```yaml
plan_unit_id: F2-031
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  check_command allows execution only when the guard is disabled, destructive override is enabled,
  or an approved command match succeeds before blocklist matching; otherwise matching a
  destructive pattern emits GuardError::DestructiveCommand with the command and pattern.
gui_related: false
gui_classification_reason: >-
  This unit defines command-evaluation behavior and error emission.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: command_blocklist_evaluation_and_error_emission
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "check_command"
- "allow_destructive"
- "approved_commands"
- "commands_match"
- "pattern.is_match(command)"
- "GuardError::DestructiveCommand"
- "command"
- "pattern"
negative_constraints:
- "Commands are allowed only through disabled guard state, destructive override, or approved-command match before blocklist evaluation succeeds."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-032 - Approved Command Match Normalization Compatibility Boundary

```yaml
plan_unit_id: F2-032
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The source helper commands_match normalizes approved and actual commands with trim and
  whitespace collapsing and historically allowed exact or prefix matching; that prefix behavior is
  preserved as source-lineage text only and must not be promoted over later exact-match FileSafe
  canon.
gui_related: false
gui_classification_reason: >-
  This unit records backend command-normalization source lineage and compatibility constraints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: approved_command_match_normalization_compatibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0015"
preserved_exact_tokens:
- "DRY:HELPER:commands_match"
- "exact match"
- "prefix match"
- "normalized whitespace"
- "trim"
- "split_whitespace"
- "c == a || c.starts_with(a.as_str())"
negative_constraints:
- "Do not promote prefix matching as final implementation canon when later FileSafe text requires exact approved_commands matching after normalization."
compatibility_only_notes:
- "Prefix matching is preserved as source-lineage text only because later live FileSafe canon requires approved_commands matching to be exact after normalization."
stale_retired_dispositions:
- "Prefix/substring approved-command matching is stale relative to later FileSafe exact-match canon."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-033 - Pattern File Parsing And Fail Fast Regex Validation

```yaml
plan_unit_id: F2-033
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  load_patterns reads one destructive-command regex pattern per non-empty non-comment line,
  applies case-insensitive matching, preserves full-command-string matching, reports invalid regex
  errors with file and line details, and fails fast rather than silently ignoring invalid
  patterns.
gui_related: false
gui_classification_reason: >-
  This unit defines pattern parser behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: pattern_file_parsing_and_fail_fast_regex_validation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0016"
preserved_exact_tokens:
- "DRY:FN:load_patterns"
- "One regex pattern per line"
- "Lines starting with #"
- "Empty lines are ignored"
- "(?i)"
- "full command string"
- "artisan\\s+migrate:(fresh|reset|refresh)"
- "Invalid patterns stop loading (fail-fast)"
- "Invalid regex pattern"
- "No patterns loaded"
negative_constraints:
- "Invalid regex patterns must fail fast rather than being silently ignored."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-034 - Default And Local Pattern Merge Behavior

```yaml
plan_unit_id: F2-034
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  load_patterns_with_merge loads default bundled patterns first, optionally loads and appends
  local patterns when a local file exists, keeps duplicate patterns without deduplication, and
  reports local-pattern loading failures.
gui_related: false
gui_classification_reason: >-
  This unit defines default/local pattern merge behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: default_and_local_pattern_merge_behavior
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0016"
preserved_exact_tokens:
- "DRY:FN:load_patterns_with_merge"
- "default_file"
- "local_file"
- "Loads default patterns first"
- "local file exists"
- "appends local patterns"
- "Duplicate patterns are kept (no deduplication)"
- "Failed to load local patterns"
- "Merged {} local patterns"
negative_constraints: []
compatibility_only_notes:
- "The next FileSafe configuration span contains additive-only config behavior for missing or unreadable custom paths, so this helper’s local-file error semantics require reconciliation there."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-035 - Backward Compatible FileSafe Config Keys And GUI Labels

```yaml
plan_unit_id: F2-035
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe configuration keeps internal bash_guard and file_guard keys for compatibility while GUI
  labels expose Command blocklist, Write scope, and Security filter, and approved_commands are
  commands approved from Assistant chat that users can add or remove in settings.
gui_related: true
gui_classification_reason: >-
  This unit preserves GUI labels and settings-surface vocabulary for FileSafe configuration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: backward_compatible_filesafe_config_keys_and_gui_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0017"
preserved_exact_tokens:
- "bash_guard"
- "file_guard"
- "Command blocklist"
- "Write scope"
- "Security filter"
- "approved_commands"
- "Commands approved from Assistant chat"
- "user can add/remove in settings"
- "Config keys remain `bash_guard` / `file_guard` for backward compatibility"
negative_constraints: []
compatibility_only_notes:
- "Config keys remain bash_guard / file_guard for backward compatibility while GUI labels use Command blocklist, Write scope, and Security filter."
stale_retired_dispositions: []
owner_boundary_notes:
- "FileSafe owns guard config semantics; visual settings rendering remains a GUI consumer boundary."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-036 - FileSafe Config Defaults And Strict Guard Baselines

```yaml
plan_unit_id: F2-036
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafeConfig contains BashGuardConfig, FileGuardConfig, SecurityFilterConfig, and
  approved_commands; defaults keep guards enabled, allow_destructive false, file guard strict_mode
  true, and security filter allow_during_interview false.
gui_related: false
gui_classification_reason: >-
  This unit defines backend configuration defaults and strict guard baselines.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_config_defaults_and_strict_guard_baselines
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0017"
preserved_exact_tokens:
- "FileSafeConfig"
- "BashGuardConfig"
- "FileGuardConfig"
- "SecurityFilterConfig"
- "enabled: true"
- "allow_destructive: false"
- "strict_mode: true"
- "allow_during_interview: false"
- "default_true"
- "Default: block, not warn"
- "Default: strict even during interview"
negative_constraints:
- "The default FileGuard mode is block, not warn-only."
- "The default SecurityFilter posture is strict even during interview unless explicitly configured."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-037 - GuiConfig To PuppetMasterConfig Runtime Bridge

```yaml
plan_unit_id: F2-037
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The orchestrator reads PuppetMasterConfig YAML rather than GuiConfig and follows the
  WorktreeGitImprovement Option B pattern by building run config from GuiConfig::filesafe into
  PuppetMasterConfig::filesafe and passing FileSafe config to BaseRunner::new via orchestrator
  context.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime config transfer rather than GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: guiconfig_to_puppetmasterconfig_runtime_bridge
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0017"
preserved_exact_tokens:
- "PuppetMasterConfig"
- "YAML"
- "GuiConfig"
- "Option B -- Build run config from GUI"
- "GuiConfig::filesafe"
- "PuppetMasterConfig::filesafe"
- "BaseRunner::new()"
- "puppet-master-rs/src/config/gui_config.rs"
- "puppet-master-rs/src/types/config.rs"
negative_constraints: []
compatibility_only_notes:
- "puppet-master-rs code paths are legacy/path references that must be validated against the Rust + Slint rebuild before implementation."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-038 - FileSafe YAML Keys And Additive Custom Patterns Path

```yaml
plan_unit_id: F2-038
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe YAML uses bashGuard, fileGuard, securityFilter, and approvedCommands keys;
  customPatternsPath is additive-only, so missing or unreadable custom pattern files are ignored
  when bundled patterns remain available and must not disable FileSafe.
gui_related: false
gui_classification_reason: >-
  This unit defines config file and guard behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_yaml_keys_and_additive_custom_patterns_path
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0017"
preserved_exact_tokens:
- "bashGuard"
- "fileGuard"
- "securityFilter"
- "approvedCommands"
- "customPatternsPath"
- ".puppet-master/destructive-commands.local.txt"
- "additive-only"
- "missing/unreadable"
- "bundled patterns"
- "do not disable FileSafe"
- "PolicyRule:Plans/Decision_Policy.md§2"
negative_constraints:
- "Optional custom patterns may be ignored only when bundled baseline remains available; missing or unreadable custom paths must not disable FileSafe."
compatibility_only_notes:
- "Reconcile additive-only customPatternsPath behavior with F2-034 local-pattern failure semantics."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-039 - BaseRunner Guard Attachment And Scope Placeholders

```yaml
plan_unit_id: F2-039
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner attaches BashGuard, initializes it from project-specific destructive-command patterns
  when present, and also initializes write-scope and security-filter placeholders for per-request
  population.
gui_related: false
gui_classification_reason: >-
  This unit defines backend runner guard attachment behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_guard_attachment_and_scope_placeholders
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0019"
preserved_exact_tokens:
- "use crate::filesafe::BashGuard"
- "bash_guard: Arc<BashGuard>"
- ".puppet-master/destructive-commands.local.txt"
- "FileGuard::new(HashSet::new(), true)"
- "SecurityFilter::new()"
- "Pattern file resolution: try project-specific, then bundled"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit adds later example details and does not replace F2-021 pre-spawn authority or F2-023 runtime guard construction."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-040 - Initialization Failure Disabled Fallback Compatibility Boundary

```yaml
plan_unit_id: F2-040
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The BaseRunner example includes disabled fallbacks for failed bash guard and security filter
  initialization, but that disabled-on-init-failure behavior is preserved only as source lineage
  and must not override the fail-closed canon or deliberate config-off-only disabled state.
gui_related: false
gui_classification_reason: >-
  This unit records compatibility/stale source behavior for initialization failure fallbacks.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: initialization_failure_disabled_fallback_compatibility_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0019"
preserved_exact_tokens:
- "Failed to initialize bash guard"
- "Guard disabled"
- "BashGuard::disabled()"
- "Failed to initialize security filter"
- "Filter disabled"
- "SecurityFilter::disabled()"
negative_constraints:
- "Do not use disabled guard fallback for initialization failure in conflict with fail-closed FileSafe canon."
compatibility_only_notes: []
stale_retired_dispositions:
- "Disabled-on-initialization-failure is source-lineage only and must not override F2-024 fail-closed canon or F2-030 deliberate config-off-only disabled state."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-041 - BaseRunner Command String Check And Blocked Command Logging

```yaml
plan_unit_id: F2-041
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner builds the full command string, checks BashGuard before spawning, logs blocked
  destructive commands, records blocked-command events when available, and returns a
  destructive-command-blocked error with override/manual-run guidance.
gui_related: false
gui_classification_reason: >-
  This unit defines backend command string guard checks and blocked-command logging.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_command_string_check_and_blocked_command_logging
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0019"
preserved_exact_tokens:
- "format!(\"{} {}\", self.command, args.join(\" \"))"
- "check_command"
- "BEFORE spawning"
- "log_blocked_command"
- "Destructive command blocked"
- "PUPPET_MASTER_ALLOW_DESTRUCTIVE=1"
- "run the command manually outside Puppet Master"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This extends F2-021 without replacing its pre-spawn authority."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-042 - Platform Runner Compiled Prompt Check And Verification Gate Exception

```yaml
plan_unit_id: F2-042
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Platform runners check the compiled prompt after append_prompt_attachments and before execution,
  blocking destructive prompt content unless the request is a verification-gate operation where
  destructive content is allowed during QA and logged.
gui_related: false
gui_classification_reason: >-
  This unit defines compiled prompt guard behavior at platform runner level.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: platform_runner_compiled_prompt_check_and_verification_gate_exception
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0020"
preserved_exact_tokens:
- "append_prompt_attachments()"
- "CHECK COMPILED PROMPT"
- "check_prompt"
- "verification gate"
- "allow destructive during QA"
- "PUPPET_MASTER_ALLOW_DESTRUCTIVE=1"
- "Destructive command in prompt blocked"
negative_constraints:
- "Destructive prompt content is blocked unless the verification-gate exception applies."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-043 - Security Filter Context File Check And Interview Exception

```yaml
plan_unit_id: F2-043
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Platform runners check context files separately through the security filter, allowing sensitive
  context files during interview only when the operation is an interview and
  allow_during_interview is configured; otherwise sensitive context file access is blocked.
gui_related: false
gui_classification_reason: >-
  This unit defines context file security-filter checks.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: security_filter_context_file_check_and_interview_exception
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0020"
preserved_exact_tokens:
- "CHECK CONTEXT FILES"
- "security_filter.check_file_access"
- "allow_during_interview"
- "is_interview_operation"
- "Sensitive context file blocked"
- "context_file.display()"
negative_constraints:
- "Interview allowance is explicit/configured and is not general sensitive-file access."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-044 - Platform Runner Early Failure And Double Check Ordering

```yaml
plan_unit_id: F2-044
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Platform runner integration checks compiled prompts and context files before building CLI args
  for early failure, respects PUPPET_MASTER_OPERATION_TYPE for verification/interview behavior,
  logs all blocked operations, then relies on BaseRunner to check the final command string again
  before spawning.
gui_related: false
gui_classification_reason: >-
  This unit defines platform-runner check ordering and event logging.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: platform_runner_early_failure_and_double_check_ordering
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0020"
preserved_exact_tokens:
- "before building CLI args"
- "early failure"
- "PUPPET_MASTER_OPERATION_TYPE"
- "Log all blocked operations to event log"
- "BaseRunner will check command string again before spawning"
- "Key Points"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-045 - Request Relative Canonical Write Scope Validation

```yaml
plan_unit_id: F2-045
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner performs FileSafe validation after request expansion but before spawn, resolving
  candidate paths against working_directory, requiring canonicalize before write-scope checks, and
  then applying FileGuard write checks and SecurityFilter access checks.
gui_related: false
gui_classification_reason: >-
  This unit defines request-relative canonical write-scope validation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: request_relative_canonical_write_scope_validation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0021"
preserved_exact_tokens:
- "after request expansion but before spawn"
- "working_directory"
- "canonicalize()"
- "File write blocked: canonical path required for FileSafe scope checks"
- "check_file_write"
- "security_filter.check_file_access"
- "ContractName:Plans/Permissions_System.md"
- "ContractName:Plans/WorktreeGitImprovement.md"
- "ContractName:Plans/Architecture_Invariants.md"
- "ContractName:Plans/Executor_Protocol.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Permissions_System, WorktreeGitImprovement, Architecture_Invariants, and Executor_Protocol supply referenced path/scope invariants."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-046 - Realpath Required Symlink Scope And Fallback Prohibition

```yaml
plan_unit_id: F2-046
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe-managed write-scope code paths are fail-closed: worktree symlink scope uses the
  OC-FILE-201/202 case-fold comparison posture, canonicalize().unwrap_or_else fallback is
  prohibited, and access is denied if the canonical real path cannot be computed.
gui_related: false
gui_classification_reason: >-
  This unit defines fail-closed realpath and symlink-scope behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: realpath_required_symlink_scope_and_fallback_prohibition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0021"
preserved_exact_tokens:
- "fail-closed"
- "OC-FILE-201/202"
- "case-fold comparison"
- "canonicalize().unwrap_or_else(|_| resolved_path)"
- "prohibited"
- "symlink alias"
- "unresolved relative path"
- "denies access"
negative_constraints:
- "If PM cannot compute the canonical real path, it denies access instead of comparing against a symlink alias or unresolved relative path."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-047 - Multi Provider Compiled Prompt Guard Coverage

```yaml
plan_unit_id: F2-047
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe guard coverage applies across Cursor, Codex, Claude Code, Gemini Direct API, GitHub
  Copilot, and OpenCode server-bridged providers by inspecting compiled prompt content through CLI
  or API request inspection and enforcing guards inside Puppet Master before sending
  server-bridged requests.
gui_related: false
gui_classification_reason: >-
  This unit defines provider-agnostic guard coverage rather than provider UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: multi_provider_compiled_prompt_guard_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0022"
preserved_exact_tokens:
- "Cursor"
- "Codex"
- "Claude Code"
- "Gemini"
- "Direct API provider"
- "GitHub Copilot"
- "OpenCode (server-bridged)"
- "@path"
- "inside Puppet Master before sending requests"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Provider docs own provider taxonomy; FileSafe owns guard enforcement across transports."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-048 - Provider Metadata Is Not FileSafe Authorization

```yaml
plan_unit_id: F2-048
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Provider metadata and projection notes may record session id, selected model, provider effort,
  tokens used, plugin/session/quota signals, and usage evidence quality, but they must not
  authorize actions or carry live overlay/full projection policy inside FileSafe runtime
  snapshots.
gui_related: false
gui_classification_reason: >-
  This unit defines provider metadata evidence boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: provider_metadata_is_not_filesafe_authorization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0022"
preserved_exact_tokens:
- "session id"
- "/provider/effort"
- "tokens used"
- "/plugin"
- "provider_usage_source_kind?"
- "provider_signal_confidence?"
- "live overlay policy"
- "full projection details"
negative_constraints:
- "Provider metadata may be recorded as execution evidence but must not be treated as authorization."
- "provider_usage_source_kind? and provider_signal_confidence? must not cram live overlay policy or full projection details into every runtime snapshot."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-049 - Provider Agnostic Defense In Depth Check Order

```yaml
plan_unit_id: F2-049
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Provider-agnostic FileSafe defense-in-depth checks compiled prompt at platform runner level,
  final command string at BaseRunner level, context files through the security filter, and file
  paths through write-scope plus security-filter checks.
gui_related: false
gui_classification_reason: >-
  This unit defines backend defense-in-depth check ordering.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: provider_agnostic_defense_in_depth_check_order
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0022"
preserved_exact_tokens:
- "compiled prompt"
- "command string"
- "context files"
- "file paths"
- "write scope + security filter"
- "defense-in-depth"
- "platform runner level"
- "BaseRunner level"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-050 - Destructive Command Blocklist File Contract

```yaml
plan_unit_id: F2-050
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The bundled puppet-master-rs/config/destructive-commands.txt blocklist uses one case-
  insensitive regex pattern per line, treats lines starting with # as comments, and ignores
  empty lines.
gui_related: false
gui_classification_reason: >-
  This unit defines backend blocklist file format and parsing behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: destructive_command_blocklist_file_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0023"
preserved_exact_tokens:
- "puppet-master-rs/config/destructive-commands.txt"
- "# Puppet Master Destructive Command Blocklist"
- "One regex pattern per line. Case-insensitive matching."
- "Lines starting with # are comments. Empty lines ignored."
- "4. Pattern File"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FileSafe owns the destructive-command blocklist contract; Tools and provider plans consume guard decisions."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-051 - Bundled Destructive Command Pattern Coverage

```yaml
plan_unit_id: F2-051
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The default destructive-command regex coverage spans PHP/Laravel, Ruby/Rails, Python/Django,
  Prisma, Knex, Sequelize, TypeORM, Drizzle, Go migrate, Diesel, SQLx, Ecto, raw SQL clients,
  MongoDB, Redis, Docker volume destruction, and database-file deletion patterns.
gui_related: false
gui_classification_reason: >-
  This unit preserves backend destructive-pattern coverage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: bundled_destructive_command_pattern_coverage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0023"
preserved_exact_tokens:
- "PHP / Laravel"
- "Ruby / Rails"
- "Python / Django"
- "Node.js / Prisma"
- "Node.js / Knex"
- "Node.js / Sequelize"
- "Node.js / TypeORM"
- "Node.js / Drizzle"
- "Go"
- "Rust / Diesel"
- "Rust / SQLx"
- "Elixir / Phoenix / Ecto"
- "Raw SQL via CLI clients"
- "MongoDB shell"
- "Redis"
- "Docker (volume destruction)"
- "File system (database files)"
- "artisan\\s+migrate:(fresh|reset|refresh)"
- "prisma\\s+db\\s+push\\s+--force-reset"
- "(mysql|psql|sqlite3)\\s+.*DROP\\s+(DATABASE|TABLE)"
- "redis-cli\\s+FLUSH(ALL|DB)"
- "docker\\s+system\\s+prune.*--volumes"
- "rm\\s+(-rf?\\s+)?/var/lib/(mysql|postgresql|mongodb)"
negative_constraints:
- "Do not remove framework/database destructive patterns without source-lineage proof and owner-doc reconciliation."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-052 - PUPPET MASTER ALLOW DESTRUCTIVE Env Override

```yaml
plan_unit_id: F2-052
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  PUPPET_MASTER_ALLOW_DESTRUCTIVE enables destructive-command override only when the environment
  variable value is exactly 1, with missing or other values defaulting to false.
gui_related: false
gui_classification_reason: >-
  This unit defines environment-variable runtime behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: puppet_master_allow_destructive_env_override
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0025"
preserved_exact_tokens:
- "PUPPET_MASTER_ALLOW_DESTRUCTIVE"
- "std::env::var"
- "v == \"1\""
- "unwrap_or(false)"
- "allow_destructive"
negative_constraints:
- "Missing PUPPET_MASTER_ALLOW_DESTRUCTIVE must default to false."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-053 - Unified FileSafe YAML And GUI Toggle Surface

```yaml
plan_unit_id: F2-053
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  puppet-master.yaml exposes filesafe bashGuard, fileGuard, securityFilter, and approvedCommands
  configuration; all FileSafe toggles for Command blocklist, Write scope, and Security filter
  must be configurable from the GUI and easy to turn on or off in one place.
gui_related: true
gui_classification_reason: >-
  This unit explicitly preserves GUI-configurable FileSafe toggle requirements and labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: unified_filesafe_yaml_and_gui_toggle_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0026"
preserved_exact_tokens:
- "puppet-master.yaml"
- "filesafe:"
- "bashGuard"
- "fileGuard"
- "securityFilter"
- "approvedCommands"
- "Command blocklist"
- "Write scope"
- "Security filter"
- "customPatternsPath"
- ".puppet-master/destructive-commands.local.txt"
- "§13.4"
- "§15.5"
- "easy to turn on or off in one place"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit preserves the YAML/GUI toggle surface and does not supersede F2-035 through F2-038 config-key/default canon."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-054 - Project Specific Pattern Extension Loading

```yaml
plan_unit_id: F2-054
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Project-specific destructive patterns extend the default bundled patterns by loading defaults
  first, then loading and appending local patterns from .puppet-master/destructive-
  commands.local.txt when the configured path exists.
gui_related: false
gui_classification_reason: >-
  This unit defines backend pattern loading behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: project_specific_pattern_extension_loading
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0027"
preserved_exact_tokens:
- "Project-Specific Patterns"
- ".puppet-master/destructive-commands.local.txt"
- "Load default patterns"
- "load_patterns(&default_patterns_path)?"
- "custom_patterns_path"
- "local_path.exists()"
- "patterns.extend(local_patterns)"
negative_constraints:
- "Local project patterns extend the bundled baseline and must not replace or disable bundled patterns."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Aligns with F2-034 and F2-038 additive custom pattern behavior."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-055 - FileSafe Event Stream Authority

```yaml
plan_unit_id: F2-055
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe emits a structured event for every block or approved override into the canonical
  seglog EventRecord stream; filesafe-events.jsonl is only a derived projector or diagnostic
  mirror and not an authoritative append log.
gui_related: false
gui_classification_reason: >-
  This unit defines canonical event-stream authority.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_event_stream_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0028"
preserved_exact_tokens:
- "Contract:"
- "structured event"
- "block or approved override"
- "command blocklist"
- "write scope"
- "security filter"
- "compiled-prompt safety check"
- "canonical event stream"
- "seglog"
- "EventRecord"
- "filesafe-events.jsonl"
- "derived projector or diagnostic mirror"
negative_constraints:
- "PM MUST NOT maintain a second authoritative FileSafe append log alongside seglog, and recovery logic MUST NOT prefer a FileSafe-only mirror over the canonical event stream."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-056 - FileSafeEvent Minimum Payload

```yaml
plan_unit_id: F2-056
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The minimum FileSafeEvent payload preserves event_type, guard_type, pattern_matched,
  command_preview, optional agent, timestamp, and allowed fields for canonical event records.
gui_related: false
gui_classification_reason: >-
  This unit defines backend event payload fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafeevent_minimum_payload
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0028"
preserved_exact_tokens:
- "FileSafeEvent payload (minimum canonical fields)"
- "pub struct FileSafeEvent"
- "event_type"
- "guard_type"
- "pattern_matched"
- "command_preview"
- "agent: Option<String>"
- "timestamp: DateTime<Utc>"
- "allowed: bool"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-057 - Logging Call Semantics And History Consumers

```yaml
plan_unit_id: F2-057
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Guard blocks and approved overrides are emitted on the main execution path before the user-
  facing result; event-write failure surfaces as a structured diagnostic, while analytics,
  dashboards, and gate reports consume FileSafe history from the canonical event stream or
  derived projections.
gui_related: false
gui_classification_reason: >-
  This unit defines event emission and consumer semantics rather than UI rendering.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: logging_call_semantics_and_history_consumers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0028"
preserved_exact_tokens:
- "guard blocks"
- "approved overrides"
- "main execution path"
- "before the user-facing result is returned"
- "event-write failure"
- "structured diagnostic"
- "not silently ignored"
- "analytics, dashboards, and gate reports"
- "canonical event stream"
- "derived projections"
negative_constraints:
- "Event-write failure is not silently ignored."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-058 - User Friendly Guard Error Message Templates

```yaml
plan_unit_id: F2-058
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe guard errors produce user-friendly blocked-command and parse-error messages,
  including destructive-command pattern, command preview capped at 100 characters, override
  guidance, manual-run guidance, and the blocklist reference.
gui_related: false
gui_classification_reason: >-
  This unit defines user-facing error text templates, not visual layout or GUI controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: user_friendly_guard_error_message_templates
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0029"
preserved_exact_tokens:
- "User-friendly error messages"
- "GuardError::DestructiveCommand"
- "GuardError::ParseError"
- "Blocked: destructive command detected"
- "Command:"
- "Hint: Set PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 to override"
- "run the command manually outside Puppet Master"
- "config/destructive-commands.txt"
- "command.chars().take(100)"
- "Blocked: cannot validate command"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-059 - FileSafe Unit Test Coverage Matrix

```yaml
plan_unit_id: F2-059
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe unit tests cover destructive command blocking, safe migrate and safe command
  allowance, destructive override behavior, diverse destructive framework patterns, prompt
  extraction, and disabled-guard behavior.
gui_related: false
gui_classification_reason: >-
  This unit defines unit-test coverage for guard behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_unit_test_coverage_matrix
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0031"
preserved_exact_tokens:
- "test_blocks_migrate_fresh"
- "test_allows_safe_migrate"
- "test_respects_override"
- "test_allows_safe_commands"
- "test_blocks_various_destructive_patterns"
- "test_prompt_extraction"
- "test_disabled_guard_allows_all"
- "php artisan migrate:fresh --seed"
- "php artisan migrate"
- "npm install"
- "cargo build"
- "git status"
- "ls -la"
- "rails db:drop"
- "django-admin flush"
- "prisma migrate reset"
- "diesel database reset"
- "mix ecto.drop"
- "BashGuard::disabled()"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-060 - Platform Runner Destructive Command Integration Test

```yaml
plan_unit_id: F2-060
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The platform-runner integration test constructs a Cursor BaseRunner, sends a request prompting
  php artisan migrate:fresh, and requires the result to error with a message containing Blocked.
gui_related: false
gui_classification_reason: >-
  This unit defines integration-test behavior for platform runner blocking.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: platform_runner_destructive_command_integration_test
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0032"
preserved_exact_tokens:
- "test_runner_blocks_destructive"
- "BaseRunner::new(\"php\".to_string(), Platform::Cursor)"
- "ExecutionRequest"
- "Run php artisan migrate:fresh"
- "runner.execute(&request).await"
- "result.is_err()"
- "contains(\"Blocked\")"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-061 - Checklist Authority And Locked Fidelity Blockers

```yaml
plan_unit_id: F2-061
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The implementation checklist tracks already-locked FileSafe canon, must not reopen Sections
  11.1.1 through 11.1.2a as design questions, treats LF-002 and LF-005 as mutation-integrity
  obligations, preserves /alias as retired legacy vocabulary, and maps rewrite-conflict
  presentation to error.concurrent_edit_conflict.
gui_related: false
gui_classification_reason: >-
  This unit defines checklist authority and fidelity-blocker disposition.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: checklist_authority_and_locked_fidelity_blockers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "Implementation Checklist"
- "already-locked FileSafe canon"
- "Sections 11.1.1-11.1.2a"
- "MUST NOT reopen those rules as design questions"
- "LF-002"
- "LF-005"
- "mutation-integrity obligations"
- "/alias"
- "retired legacy vocabulary"
- "rewrite-conflict"
- "error.concurrent_edit_conflict"
negative_constraints:
- "Checklist items must implement the owner rules in Sections 11.1.1-11.1.2a and MUST NOT reopen those rules as design questions."
compatibility_only_notes:
- "Resolved fidelity blockers LF-002 and LF-005 are mutation-integrity obligations, not open checklist design items; /alias wording is retired legacy vocabulary."
stale_retired_dispositions:
- "/alias wording is retired legacy vocabulary for unresolved path aliases."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-062 - FileSafe Module Structure And OpenCode Baseline Port

```yaml
plan_unit_id: F2-062
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe implementation checklist lineage includes the src-tauri filesafe module structure and
  a port from OpenCode backend/src/security/bash.ts pinned to upstream dev checkout baseline
  9330bc5339b3ca82975f768200450d4c9aabcd35, requiring an external-reference currentness refresh
  before changing FileSafe canon for later OpenCode changes.
gui_related: false
gui_classification_reason: >-
  This unit defines implementation checklist lineage and external-reference baseline.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_module_structure_and_opencode_baseline_port
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "src-tauri/src/filesafe/mod.rs"
- "src-tauri/src/filesafe/types.rs"
- "src-tauri/src/filesafe/scope.rs"
- "src-tauri/src/filesafe/bash_guard.rs"
- "src-tauri/src/filesafe/snapshot.rs"
- "src-tauri/src/filesafe/validator.rs"
- "backend/src/security/bash.ts"
- "9330bc5339b3ca82975f768200450d4c9aabcd35"
- "external-reference currentness refresh"
negative_constraints:
- "Later OpenCode changes require an external-reference currentness refresh before changing FileSafe canon."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-063 - BashGuard Implementation Checklist

```yaml
plan_unit_id: F2-063
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BashGuard implementation checklist coverage includes buildScopeRegex, bashCommandBlocks,
  fileEditBlocks, check_bash_command, check_file_edit, PM-specific safe zones, and allowlisted
  temp patterns.
gui_related: false
gui_classification_reason: >-
  This unit defines backend BashGuard implementation checklist items.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: bashguard_implementation_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "Implement BashGuard"
- "buildScopeRegex()"
- "bashCommandBlocks"
- "fileEditBlocks"
- "check_bash_command()"
- "check_file_edit()"
- "PM-specific safe zones"
- "allowlisted temp patterns"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-064 - BaseRunner Guard Integration And Helper Checklist

```yaml
plan_unit_id: F2-064
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner checklist coverage attaches Arc<FileSafe>, initializes FileSafe in runner
  construction, checks compiled prompts and referenced context files after context compilation,
  checks command strings and file paths before spawn, enforces realpath-before-scope and
  optimistic-concurrency invariants, exposes FileSafe helper methods, integrates verification
  gates and plan-apply paths, and returns actionable guard errors.
gui_related: false
gui_classification_reason: >-
  This unit defines backend runner integration checklist items.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_guard_integration_and_helper_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "filesafe: Arc<FileSafe>"
- "Initialize FileSafe in runner construction"
- "after context compilation"
- "Compile context files into a prompt view"
- "verification-gate exempt"
- "BaseRunner::execute_command()"
- "Build the command string"
- "Extract file paths"
- "realpath-before-scope-check invariant"
- "working_directory"
- "canonicalize with fail-closed behavior"
- "optimistic-concurrency and snapshot-integrity contract"
- "git add"
- "git commit"
- "git stash"
- "git checkout"
- "git status --porcelain"
- "FileSafe::check_command(context_files, prompt, command, working_directory)"
- "FileSafe::check_edit(file_path, old_content, new_content, working_directory)"
- "FileSafe::should_exempt_verification_gate(task)"
- "verification gates and plan-apply paths"
- "clear, actionable guard errors"
negative_constraints:
- "Runner integration must reject unresolved or non-canonical worktree aliases instead of falling back to unresolved paths."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This checklist is a consumer of F2-021, F2-042 through F2-046, and Section 11.1 owner canon; it does not duplicate or reopen that authority."
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-065 - FileSafe Settings Configuration Checklist

```yaml
plan_unit_id: F2-065
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe settings checklist coverage includes filesafe.enabled,
  filesafe.verification_gate_exemptions for readonly verification tools, optional
  filesafe.project_scope_overrides, and remote-mode aware scope roots derived from mounted
  project identity.
gui_related: true
gui_classification_reason: >-
  This unit covers user-configurable settings that surface in application settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_settings_configuration_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "Add configuration"
- "filesafe.enabled"
- "filesafe.verification_gate_exemptions"
- "readonly verification tools"
- "filesafe.project_scope_overrides"
- "remote-mode aware scope roots"
- "mounted project identity"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-066 - FileSafe Event Logging Checklist And Safe Point Compatibility

```yaml
plan_unit_id: F2-066
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe event logging checklist coverage emits filesafe.blocked events with reason codes,
  matched rule ids, and resolved path context, emits compatibility snapshot events only when
  they map to Contracts-owned safe_point.created or safe_point.restored payload contracts, and
  distinguishes dry-run validation from hard blocking.
gui_related: false
gui_classification_reason: >-
  This unit defines backend logging checklist and compatibility behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_event_logging_checklist_and_safe_point_compatibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "filesafe.blocked"
- "reason codes"
- "matched rule ids"
- "resolved path context"
- "filesafe.snapshot_created"
- "filesafe.snapshot_conflict"
- "filesafe.snapshot_restore"
- "safe_point.created"
- "safe_point.restored"
- "stable snapshot/safe-point identifiers"
- "conflict or restore outcome fields"
- "dry-run validation"
- "hard blocking"
negative_constraints: []
compatibility_only_notes:
- "Compatibility FileSafe snapshot events are emitted only when they map to Contracts-owned safe_point.created / safe_point.restored payload contracts."
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-067 - FileSafe Verification Coverage Checklist

```yaml
plan_unit_id: F2-067
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe verification checklist coverage includes unit tests for destructive command
  detection, scope validation, verification-gate exemptions, optimistic concurrency, git
  snapshot error handling, and post-stage verification; integration tests cover real shell
  commands, plan apply and rewrite paths, remote-mode mounted project paths, and
  canonicalization failures.
gui_related: false
gui_classification_reason: >-
  This unit defines verification coverage requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_verification_coverage_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0033"
preserved_exact_tokens:
- "Unit tests for destructive command detection"
- "Unit tests for scope validation"
- "Unit tests for verification-gate exemptions"
- "Unit tests for optimistic concurrency conflict detection"
- "Unit tests for git snapshot error handling and post-stage verification"
- "Integration tests with real shell commands"
- "Integration tests for plan apply and rewrite paths"
- "Remote-mode tests covering mounted project paths and canonicalization failures"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-068 - Core Consumer Plan Boundary Notes

```yaml
plan_unit_id: F2-068
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Orchestrator consumes FileSafe through BaseRunner::execute_command without orchestrator-logic
  changes; Interview and Worktree execution are protected without plan-specific changes;
  MiscPlan cleanup policy is complemented by FileSafe prevention before destructive operations
  occur.
gui_related: false
gui_classification_reason: >-
  This unit defines owner/consumer relationships between backend plans.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: core_consumer_plan_boundary_notes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0035"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0036"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0037"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0038"
preserved_exact_tokens:
- "Orchestrator Plan"
- "BaseRunner::execute_command()"
- "No changes needed to orchestrator logic itself."
- "Interview Plan"
- "No interview-specific changes needed."
- "Worktree Plan"
- "No worktree-specific changes needed."
- "MiscPlan"
- "cleanup policies"
- "preventing destructive operations before they occur"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Orchestrator, Interview, Worktree, and MiscPlan consume FileSafe guard behavior; FileSafe remains the safety-policy owner."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-069 - Hooks FileSafe First Boundary

```yaml
plan_unit_id: F2-069
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Plans/newfeatures.md §9 owns hooks as a user/plugin extension point, while dangerous-command
  blocking remains FileSafe core pre-execution guard behavior; PreToolUse can invoke the same
  blocklist and integration point, preserving one blocklist and FileSafe first.
gui_related: false
gui_classification_reason: >-
  This unit defines backend hook and FileSafe ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: hooks_filesafe_first_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0039"
preserved_exact_tokens:
- "Plans/newfeatures.md §9"
- "Hook system"
- "user/plugin extension point"
- "PreToolUse"
- "continue/block/modify"
- "Dangerous-command blocking"
- "FileSafe"
- "core pre-execution guard"
- "same blocklist and extension point"
- "one blocklist and one integration point"
- "FileSafe first"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "newfeatures.md owns hooks as extension points; FileSafe owns dangerous-command blocking."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-070 - Tool Permission And FileSafe Invocation Boundary

```yaml
plan_unit_id: F2-070
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Tools.md owns central tool registry permissions and OpenCode alignment, while FileSafe
  complements tool permissions by deciding whether a specific invocation may proceed, mapping
  command blocklist to bash deny patterns, write scope to edit path allowlist, and security
  filter to read path denial through a single central policy engine.
gui_related: false
gui_classification_reason: >-
  This unit defines backend permission and invocation-safety boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: tool_permission_and_filesafe_invocation_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0040"
preserved_exact_tokens:
- "Plans/Tools.md"
- "central tool registry"
- "permission model (allow/deny/ask)"
- "OpenCode Permissions"
- "FileSafe and tool permissions are complementary"
- "may the agent call this tool?"
- "may this specific invocation proceed?"
- "command blocklist ≈ bash deny patterns"
- "write scope ≈ edit path allowlist"
- "security filter ≈ read path deny (e.g. .env)"
- "single central policy engine"
- "Tools.md §2.4"
- "§2.5"
- "§8.2"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Tools.md owns registry-level permission policy; FileSafe owns invocation-specific guard decisions."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-071 - Assistant YOLO Shared FileSafe Config And Guard Primacy

```yaml
plan_unit_id: F2-071
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Assistant YOLO mode removes permission prompts and the human approval step, so Assistant chat
  and YOLO runs must use the same FileSafe settings as the rest of the app and FileSafe remains
  the primary protection layer for destructive commands, write scope, and sensitive files.
gui_related: false
gui_classification_reason: >-
  This unit defines backend guard primacy and shared config behavior for Assistant YOLO mode.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: assistant_yolo_shared_filesafe_config_and_guard_primacy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0041"
preserved_exact_tokens:
- "YOLO mode"
- "maximum permissions"
- "no permission prompts"
- "no human approval step"
- "primary protection layer"
- "Same FileSafe config for Assistant"
- "Command blocklist"
- "Write scope"
- "Security filter"
- "No separate \"Assistant-only\" bypass unless explicitly configured"
- "10a. FileSafe and Assistant YOLO mode"
negative_constraints:
- "Assistant chat must not have a separate Assistant-only FileSafe bypass unless explicitly configured."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Assistant chat owns chat mode semantics; FileSafe owns guard enforcement and safety state consumed by Assistant YOLO runs."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-072 - YOLO FileSafe Visible State And Explicit Override Surface

```yaml
plan_unit_id: F2-072
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  When YOLO is enabled, the GUI should recommend or warn that FileSafe remain enabled, expose
  active FileSafe state without deep navigation, keep FileSafe toggles easy to find, and allow
  any per-chat FileSafe relaxation only through an explicit clearly labeled non-default setting.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI-visible FileSafe state, warning, and per-context override presentation
  for YOLO mode.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: yolo_filesafe_visible_state_and_explicit_override_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0041"
preserved_exact_tokens:
- "Recommend FileSafe on when YOLO is on"
- "FileSafe protects you when YOLO is on"
- "small indicator"
- "Configurable and visible"
- "§13.4"
- "§15.5"
- "relax FileSafe for this chat only"
- "explicit, clearly labeled setting--not the default"
- "FileSafe should be the main line of defense"
negative_constraints:
- "Per-context FileSafe relaxation is not the default when YOLO is on."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Final GUI and Assistant UI consume FileSafe state visibility requirements; FileSafe owns safety state."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-073 - Dirty Layer Search Results Do Not Weaken Mutation Guards

```yaml
plan_unit_id: F2-073
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Dirty-layer freshness from grep/search acceleration does not weaken FileSafe mutation or
  /path-guard behavior; any accelerated search result that leads to a write, patch, restore, or
  generated edit still passes canonicalization, write-scope, security-filter, and optimistic-
  concurrency checks before mutation.
gui_related: false
gui_classification_reason: >-
  This unit defines backend mutation guard requirements for accelerated search results.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: dirty_layer_search_results_do_not_weaken_mutation_guards
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0043"
preserved_exact_tokens:
- "dirty-layer freshness"
- "grep/search acceleration"
- "/path-guard"
- "write, patch, restore, or generated edit"
- "FileSafe canonicalization"
- "write-scope"
- "security-filter"
- "optimistic-concurrency checks"
- "11.1 FileSafe: Write scope (CRITICAL)"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-074 - Realpath Before Scope Check Owner Invariant

```yaml
plan_unit_id: F2-074
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  All file paths submitted to FileSafe write-scope or security-filter checks resolve through
  realpath before scope comparison, normalize relative paths against working_directory, resolve
  symlinks, fail closed on resolution failure, and never compare unresolved paths against
  allowed_files.
gui_related: false
gui_classification_reason: >-
  This unit is the owner-anchor PlanUnit for backend realpath-before-scope behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: realpath_before_scope_check_owner_invariant
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0044"
preserved_exact_tokens:
- "realpath()"
- "working_directory"
- "resolve symlinks"
- "fail-closed"
- "allowed_files"
- "canonicalize().unwrap_or_else(|_| original_path)"
- "prohibited"
- "11.1.1 Realpath-before-scope-check invariant"
negative_constraints:
- "Never fall back to comparing the unresolved path against allowed_files."
- "The fallback pattern canonicalize().unwrap_or_else(|_| original_path) is prohibited for FileSafe-managed write-scope checks."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md"
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md"
- "F2-046 is earlier integration/consumer coverage; this unit is the owner-anchor for the invariant."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-075 - Atomic Replacement Write Pattern And Direct Write Prohibition

```yaml
plan_unit_id: F2-075
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  All FileSafe-managed file mutations use the atomic write pattern temp -> fsync -> rename in
  the target directory, and direct os.WriteFile-style writes are not allowed for managed
  mutations.
gui_related: false
gui_classification_reason: >-
  This unit defines backend atomic replacement requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: atomic_replacement_write_pattern_and_direct_write_prohibition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0045"
preserved_exact_tokens:
- "Atomic write and /durability contract"
- "temp -> fsync -> rename"
- "target directory"
- "Direct `os.WriteFile`-style writes are not allowed"
- "managed mutations"
negative_constraints:
- "Direct os.WriteFile-style writes are not allowed for managed mutations."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-076 - Managed Overwrite Backup Lineage And Fail Closed Metadata

```yaml
plan_unit_id: F2-076
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  When a managed mutation overwrites an existing target and is not append-only, PM creates a
  recoverable pre-write backup or safe point keyed by session/run/turn and target path; backup
  creation or backup-metadata persistence failure fails closed before modifying the target.
gui_related: false
gui_classification_reason: >-
  This unit defines backend overwrite backup and metadata durability behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: managed_overwrite_backup_lineage_and_fail_closed_metadata
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0045"
preserved_exact_tokens:
- "Managed overwrite safety"
- "recoverable pre-write backup"
- "safe point"
- "session/run/turn"
- "target path"
- "undo and recovery"
- "backup creation"
- "backup-metadata persistence"
- "fails closed before the target path is modified"
negative_constraints:
- "Backup creation or backup-metadata persistence failure must fail closed before the target path is modified."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-077 - Same Directory Temp Lifecycle And Janitor Boundaries

```yaml
plan_unit_id: F2-077
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Replacement writes use same-directory temp files named <target>.tmp.<random>, fsync the temp,
  and atomically rename over the target; startup janitor cleanup may remove stale .tmp.*
  artifacts and emit recovery events but must not delete active session backups or referenced
  safe-point records.
gui_related: false
gui_classification_reason: >-
  This unit defines backend temp-file lifecycle and janitor boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: same_directory_temp_lifecycle_and_janitor_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0045"
preserved_exact_tokens:
- "Temp-file lifecycle rules"
- "same-directory temp files only"
- "<target>.tmp.<random>"
- "fsync(temp)"
- "atomic rename"
- "per-session temp directories"
- "MUST NOT be used for replacement writes"
- "boot/startup janitor"
- "stale `.tmp.*` artifacts"
- "structured recovery event"
- "MUST NOT delete live session backups or safe-point records"
negative_constraints:
- "Per-session temp directories must not be used for replacement writes that rely on same-filesystem atomic rename."
- "Janitor cleanup must not delete live session backups or safe-point records that are still referenced by an active session lineage."
compatibility_only_notes: []
stale_retired_dispositions:
- "Boot/startup janitor and stale-temp cleanup details are recovery lineage that must remain bounded by active-session backup and safe-point preservation."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-078 - Mutable Rewrite CAS Owner Anchor And Read Revision Capture

```yaml
plan_unit_id: F2-078
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  All mutable FileSafe rewrite paths, including plan apply, patch apply, safe auto-fix, context
  file rewrite, and verification-driven rewrite, follow the same optimistic-concurrency CAS
  contract by capturing read_revision={mtime_ns, content_sha256} and current git head state
  before rewrite and rechecking at /pre-promote before rename.
gui_related: false
gui_classification_reason: >-
  This unit defines backend CAS owner-anchor and read-revision capture behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: mutable_rewrite_cas_owner_anchor_and_read_revision_capture
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0046"
preserved_exact_tokens:
- "11.1.2a Optimistic concurrency for mutable rewrites"
- "plan apply"
- "patch apply"
- "safe auto-fix"
- "context file rewrite"
- "verification-driven rewrite"
- "optimistic-concurrency / CAS contract"
- "LFA-002"
- "read_revision={mtime_ns, content_sha256}"
- "current head state"
- "/pre-promote"
- "pre-rename check"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Resolved fidelity blocker LFA-002 makes this anchor the FileSafe owner for managed-mutation integrity."
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-079 - Concurrent Edit Conflict Surface And Post Write State

```yaml
plan_unit_id: F2-079
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  If pre-promote target state no longer matches captured read_revision, the rewrite aborts with
  error.concurrent_edit_conflict, surfaces a structured result for
  reconciliation/retry/escalation, and successful rewrites update tracked post-write state for
  verification, undo, and follow-up actions.
gui_related: false
gui_classification_reason: >-
  This unit defines backend concurrent-edit conflict and post-write state behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: concurrent_edit_conflict_surface_and_post_write_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0046"
preserved_exact_tokens:
- "error.concurrent_edit_conflict"
- "silently overwriting newer content"
- "structured result"
- "request reconciliation"
- "retry from fresh state"
- "escalate to the user"
- "Successful rewrites"
- "tracked post-write state"
- "verification, undo, and follow-up actions"
negative_constraints:
- "Managed rewrites must not silently overwrite newer content."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-080 - Optimistic Concurrency Boundary For Rewrite Vs Append Durability

```yaml
plan_unit_id: F2-080
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe uses optimistic concurrency rather than mandatory file locking for ordinary mutable
  rewrites, while append-only seglog and event writers remain outside this rewrite path and do
  not use error.concurrent_edit_conflict for ordinary append durability.
gui_related: false
gui_classification_reason: >-
  This unit defines the backend boundary between mutable rewrites and append-only durability.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: optimistic_concurrency_boundary_for_rewrite_vs_append_durability
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0046"
preserved_exact_tokens:
- "optimistic concurrency"
- "mandatory file locking"
- "ordinary mutable rewrites"
- "Append-only seglog/event writers"
- "outside this rewrite path"
- "error.concurrent_edit_conflict"
- "ordinary append durability"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-081 - Snapshot And Undo Lineage Isolation

```yaml
plan_unit_id: F2-081
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Snapshot indexes and safe points are scoped to active run/session lineage, restore must not
  invalidate or delete snapshots preserved for other sessions or legal-hold reasons, identifiers
  are unique across retained snapshots, and restore paths cannot assume a single global scratch
  snapshot directory.
gui_related: false
gui_classification_reason: >-
  This unit defines backend snapshot and undo isolation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: snapshot_and_undo_lineage_isolation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0046"
preserved_exact_tokens:
- "Snapshot and undo isolation"
- "active run/session lineage"
- "Restoring one safe point"
- "different sessions"
- "legal-hold reasons"
- "Snapshot identifiers"
- "unique across the retained set"
- "single global scratch snapshot directory"
- "reversible checkpoint"
- "metadata"
negative_constraints:
- "Restoring one safe point must never invalidate or delete other snapshots preserved for different sessions or legal-hold reasons."
- "No restore path may assume a single global scratch snapshot directory."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-082 - Git Snapshot Subprocess Integrity And Reversibility Claims

```yaml
plan_unit_id: F2-082
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Git or shell subprocesses used for reversible checkpoints treat non-zero exits from mutation-
  sensitive commands as hard errors, verify staged state with git status --porcelain after git
  add, and never downgrade real staging, stash, or checkout failures into success-shaped state;
  any path claiming reversibility must satisfy the full contract.
gui_related: false
gui_classification_reason: >-
  This unit defines backend git checkpoint integrity and reversibility claims.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: git_snapshot_subprocess_integrity_and_reversibility_claims
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0046"
preserved_exact_tokens:
- "Git subprocess integrity for snapshot materialization"
- "git add"
- "git commit"
- "git stash"
- "git checkout"
- "hard errors"
- "git status --porcelain"
- "nothing to commit"
- "success-shaped state"
- "local and remote-mode project mutations"
- "claims reversibility"
- "full contract"
negative_constraints:
- "The nothing to commit case must not downgrade real staging, stash, or checkout failures into success-shaped state."
- "Any path that claims reversibility must satisfy the full snapshot and undo contract."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-083 - Filesystem Case Sensitivity Probe And Session Cache

```yaml
plan_unit_id: F2-083
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  At project or worktree root initialization, PM probes filesystem case sensitivity with a
  temporary .pm_case_probe file, checks whether .PM_CASE_PROBE resolves to the same inode,
  defaults to case-sensitive mode if the probe cannot be created, and caches the detected flag
  per project root for FileSafe and permission comparisons within the session.
gui_related: false
gui_classification_reason: >-
  This unit defines backend filesystem case-sensitivity detection.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesystem_case_sensitivity_probe_and_session_cache
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0047"
preserved_exact_tokens:
- "Case-sensitivity detection contract"
- ".pm_case_probe"
- ".PM_CASE_PROBE"
- "same inode"
- "case-insensitive"
- "read-only filesystem"
- "permission error"
- "defaults to case-sensitive mode"
- "cached per project root"
- "project session"
negative_constraints:
- "If the case-sensitivity probe cannot be created, PM defaults to case-sensitive mode."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-084 - Shared NFC Case Fold Path Comparison Contract

```yaml
plan_unit_id: F2-084
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe write-scope checks and Permissions_System path-pattern matching use identical
  filesystem-aware normalization: Unicode NFC plus locale-independent lowercasing on case-
  insensitive filesystems, and byte-for-byte comparison after NFC only on case-sensitive
  filesystems.
gui_related: false
gui_classification_reason: >-
  This unit defines backend shared path normalization requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: shared_nfc_case_fold_path_comparison_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0047"
preserved_exact_tokens:
- "Unicode NFC normalization"
- "locale-independent lowercasing"
- "case-insensitive filesystems"
- "case-sensitive filesystems"
- "byte-for-byte"
- "NFC normalization only"
- "identical in FileSafe write-scope checks and Permissions_System path-pattern matching"
- "Divergence between the two is a security defect"
negative_constraints:
- "Divergence between FileSafe and Permissions_System path normalization is a security defect."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-085 - File Record LRU Cap And Event State Rebuild

```yaml
plan_unit_id: F2-085
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  In-memory file records are bounded by an LRU cap of 10,000 entries, and eviction rebuilds from
  canonical event state on next access without silently losing guard correctness.
gui_related: false
gui_classification_reason: >-
  This unit defines backend file-record lifecycle behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: file_record_lru_cap_and_event_state_rebuild
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0047"
preserved_exact_tokens:
- "In-memory file records"
- "LRU cap of 10,000 entries"
- "Eviction rebuilds"
- "canonical event state"
- "next access"
- "does not silently lose guard correctness"
negative_constraints:
- "LRU eviction must not silently lose guard correctness."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-086 - FileSafe Mutation Owner Boundary And Checklist Anchor Authority

```yaml
plan_unit_id: F2-086
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe 11.1.x mutation-integrity rules consume adjacent runtime, prompt, storage, usage,
  auth, permission, and orchestrator contracts; FileSafe owns whether a mutation may proceed,
  not those owners full policy surfaces, and historical ### 15.12 Integration Checklist lineage
  is superseded by live ## 9. Implementation Checklist authority.
gui_related: false
gui_classification_reason: >-
  This unit defines backend owner-boundary and checklist-anchor authority.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_mutation_owner_boundary_and_checklist_anchor_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "11.1.x mutation-integrity rules"
- "consumers of adjacent runtime, prompt, storage, usage, auth, permission, and orchestrator contracts"
- "FileSafe owns whether a mutation may proceed"
- "not the full policy surface"
- "non-canonical"
- "### 15.12 Integration Checklist"
- "historical checklist lineage only"
- "## 9. Implementation Checklist"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "### 15.12 Integration Checklist is historical checklist lineage only; the live checklist anchor is ## 9. Implementation Checklist."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-087 - Packet Over Scope And Adjacent Owner Routing Dispositions

```yaml
plan_unit_id: F2-087
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Packet anchor-staleness and research_packet.json path-level over-scope are guard evidence
  only, not FileSafe ownership expansion; adjacent owner routing stays outside FileSafe and
  stale extra packet paths such as Plans/MCP_Integration.md do not expand FileSafe ownership
  unless they create a concrete compiled-prompt, executable-surface, write-scope, or mutation-
  safety concern.
gui_related: false
gui_classification_reason: >-
  This unit defines backend owner-routing and stale packet disposition.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: packet_over_scope_and_adjacent_owner_routing_dispositions
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "Packet anchor-staleness"
- "guard evidence"
- "FileSafe ownership expansion"
- "Gap #45"
- "child-runtime"
- "crew-summary"
- "Plans/CLI_Bridged_Providers.md"
- "Plans/Run_Modes.md"
- "Plans/storage-plan.md"
- "Plans/Prompt_Pipeline.md"
- "Plans/assistant-chat-design.md"
- "research_packet.json"
- "Plans/MCP_Integration.md"
- "/MCP_Integration.md"
- "compiled-prompt"
- "executable-surface"
- "write-scope"
- "mutation-safety concern"
negative_constraints:
- "Stale packet over-coverage and stale packet paths do not expand FileSafe ownership."
compatibility_only_notes: []
stale_retired_dispositions:
- "Packet anchor-staleness and research_packet.json path-level over-scope are guard evidence only, not FileSafe ownership expansion."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-088 - LFA 002 Drift Evidence And Under Targeted Packet Replacement

```yaml
plan_unit_id: F2-088
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Drift-risk checks comparing Contracts_V0.md#4.1 AuthState and FileSafe.md#11.1.2a against
  exact contract identifiers are valid verification inputs, but stale packet over-coverage and
  under-targeted stale replacement bodies must be removed or replaced before packetization.
gui_related: false
gui_classification_reason: >-
  This unit defines backend verification evidence handling for LFA-002 drift.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: lfa_002_drift_evidence_and_under_targeted_packet_replacement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "Contracts_V0.md#4.1 AuthState"
- "FileSafe.md#11.1.2a Optimistic concurrency for mutable rewrites"
- "exact contract identifiers"
- "stale packet over-coverage"
- "stale replacement bodies"
- "LFA-002"
- "/pre-promote"
- "pre-rename recheck"
- "read_revision={mtime_ns, content_sha256}"
- "error.concurrent_edit_conflict"
- "git status --porcelain"
- "under-targeted LFA evidence"
- "before packetization"
negative_constraints:
- "Stale packet bodies must be replaced before packetization when they omit required LFA-002 managed-mutation details."
compatibility_only_notes: []
stale_retired_dispositions:
- "Under-targeted stale packet bodies are evidence to replace, not owner text to copy forward."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-089 - Dispatch Gating And Child Runtime Authority Consumption

```yaml
plan_unit_id: F2-089
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Dispatch gating consumes Tools policy application order so validate_tool_args, no-dispatch-on-
  length, compiled-output safety, and FileSafe write-scope checks block before spawn; listener
  and child-run supervision consume orchestrator task-envelope, child-runtime, and parent-
  clamped authority without widening child authority beyond parent policy.
gui_related: false
gui_classification_reason: >-
  This unit defines backend dispatch and child-runtime safety inputs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: dispatch_gating_and_child_runtime_authority_consumption
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "### 8.2 Policy application order and invocation flow"
- "validate_tool_args"
- "no-dispatch-on-length"
- "compiled-output safety"
- "FileSafe write-scope checks"
- "block before spawn"
- "task-envelope"
- "child-runtime"
- "parent-clamped"
- "/listener"
- "budget-overrun handling"
- "similarity-based doom-loop evidence"
- "without widening child authority beyond parent policy"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Tools.md owns policy application order; orchestrator owns listener and child-run supervision authority."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-090 - Prompt Mode Compiled Context Safety Boundary

```yaml
plan_unit_id: F2-090
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe validates the compiled prompt/context safety view, while Run Modes, Prompt Pipeline,
  and assistant chat own mode effects, context assembly, cache preservation, dynamic shrinking,
  on-demand retrieval, cachedContent markers, TTL refresh behavior, non-open-ended cache
  lifetime, and token-savings calculations.
gui_related: false
gui_classification_reason: >-
  This unit defines backend prompt and mode safety ownership boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: prompt_mode_compiled_context_safety_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "## 0. Scope and SSOT status"
- "## 7. Mode effects on context management"
- "## 2. Compaction and pruning"
- "### 2.1 Context assembly and cache preservation"
- "### 2.2 Dynamic context shrinking"
- "/on-demand"
- "cachedContent"
- "TTL refresh behavior"
- "non-open-ended cache lifetime"
- "token-savings calculations"
- "/truncatable"
negative_constraints:
- "FileSafe treats /truncatable context only as a safety input, not as permission to drop protected evidence."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Run_Modes, Prompt_Pipeline, and assistant-chat-design own mode and context behavior consumed by FileSafe."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-091 - Assistant Chat Context Display Consumer Boundary

```yaml
plan_unit_id: F2-091
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Assistant chat owns visible context display and related route references that FileSafe may
  consume as safety inputs, including context usage display, context-detail, concurrent-thread,
  and global context markers.
gui_related: true
gui_classification_reason: >-
  This unit preserves GUI/user-visible assistant chat context-display ownership references.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: assistant_chat_context_display_consumer_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "## 12. Context usage display"
- "context-detail"
- "concurrent-thread"
- "/global"
- "### 23.4 Adopted enhancements"
- "visible context display"
- "FileSafe safety inputs"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- "### 23.4 Adopted enhancements is stale owner-routing evidence when assistant-chat-design owns ## 12. Context usage display."
owner_boundary_notes:
- "Plans/assistant-chat-design.md owns context usage display and visible chat context surfaces."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-092 - Storage Usage Auth Billing Input Boundary

```yaml
plan_unit_id: F2-092
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Storage, usage, auth, and billing owner contracts supply effective runtime inputs to FileSafe,
  but FileSafe does not own or authorize auth state, billing state, usage ledgers, budget
  decisions, or context-compilation state; legacy cost and null-padding examples are display or
  migration evidence only.
gui_related: false
gui_classification_reason: >-
  This unit defines backend storage, usage, auth, and billing input boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: storage_usage_auth_billing_input_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "### Naming and migration rules"
- "app-data-root"
- "/unsafe-filesystem"
- "bounded-collections retention"
- "cost_microdollars: u64"
- "estimated_cost_usd: f64"
- "### 4.1 AuthState"
- "### Billing entity field contract"
- "billing_entity"
- "/presence"
- "/null-padding"
- "auth_realm = null"
- "account_id = null"
- "auth_surface = null"
- "FileSafe-as-owner wording is invalid"
negative_constraints:
- "Legacy estimated_cost_usd and null-padding examples cannot authorize a mutation, budget decision, or usage ledger update."
- "FileSafe-as-owner wording is invalid for auth state, billing state, or context-compilation state."
compatibility_only_notes:
- "estimated_cost_usd: f64 is display or migration evidence only."
- "Null-padded auth and billing example values are stale examples; effective presence or absence is determined by owner contracts."
stale_retired_dispositions:
- "/null-padding, auth_realm = null, account_id = null, and auth_surface = null are stale example values."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-093 - Subagent Scope Credential Cache And Executable Surface Gating

```yaml
plan_unit_id: F2-093
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe consumes subagent tool identity, child-run scope, concurrency caps, credential
  callback modes, TTL-valid tool discovery cache, and explicit approval or signing evidence for
  executable plugin surfaces as safety inputs without redefining crew scheduling or tool
  discovery policy.
gui_related: false
gui_classification_reason: >-
  This unit defines backend subagent, credential, cache, and executable-surface safety inputs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: subagent_scope_credential_cache_and_executable_surface_gating
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "Plans/orchestrator-subagent-integration.md"
- "### 4. Subagent -- Backend"
- "Plans/Tools.md"
- "### 2.3 Session vs run; subagents"
- "max_concurrent_agents_per_crew=8"
- "max_concurrent_crews_per_platform=4"
- "/ephemeral/manual"
- "TTL-bound credentials"
- "clientId"
- "lazy-load LESSON"
- "TTL-valid cache"
- "transient discovery miss"
- "permanent executable access"
- "/custom-tool/plugin/executable"
- "/signing"
negative_constraints:
- "A transient tool discovery miss must not become permanent executable access."
- "Executable plugin surfaces require explicit approval or signing evidence before FileSafe allows execution-modifying behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Subagent scheduling and tool discovery owners define policy; FileSafe consumes effective safety inputs."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-094 - Atomic CAS Restatement And Legacy Audit Evidence Boundary

```yaml
plan_unit_id: F2-094
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  S0048 restates atomic replacement and CAS contracts as safety inputs and classifies stale
  legacy-term audits, escaped legacy fallback wording, EXEC/file-record map concerns, and
  unresolved symlink TODOs as verification evidence rather than independent FileSafe policy.
gui_related: false
gui_classification_reason: >-
  This unit defines backend restatement and stale-audit evidence boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: atomic_cas_restatement_and_legacy_audit_evidence_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0048"
preserved_exact_tokens:
- "temp -> fsync -> rename"
- "/janitor"
- "read_revision={mtime_ns, content_sha256}"
- "concurrent_edit_conflict"
- "error.concurrent_edit_conflict"
- "unwrap_or_else(|_| resolved_path)"
- "canonicalize() failure"
- "unwrap_or_else(\\|_\\| resolved_path)"
- "stale escaped legacy-row wording"
- "Doc-set searches"
- "stale-legacy-term audits"
- "EXEC/file-record"
- "TODO"
- "realpath-before-scope-check"
- "case-folding contracts"
negative_constraints:
- "Doc-set searches and stale-legacy-term audits are verification evidence, not FileSafe policy."
compatibility_only_notes: []
stale_retired_dispositions:
- "unwrap_or_else(\\|_\\| resolved_path) is retained only as stale escaped legacy-row wording."
- "Doc-set searches and stale-legacy-term audits are verification evidence, not FileSafe policy."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-095 - SecurityFilter Access Check And GuardError Emission

```yaml
plan_unit_id: F2-095
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  SecurityFilter stores sensitive path regexes, respects the enabled flag, converts checked
  paths to string form, and returns GuardError::SensitiveFileAccess with the file path and
  matched pattern when a sensitive pattern matches.
gui_related: false
gui_classification_reason: >-
  This unit defines backend SecurityFilter access-check behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: securityfilter_access_check_and_guarderror_emission
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0049"
preserved_exact_tokens:
- "Security Filter (CRITICAL)"
- "DRY:DATA:SecurityFilter — Blocks access to sensitive files"
- "pub struct SecurityFilter"
- "sensitive_patterns: Vec<Regex>"
- "enabled: bool"
- "DRY:FN:check_file_access"
- "file_path: &Path"
- "Result<(), GuardError>"
- "to_string_lossy"
- "GuardError::SensitiveFileAccess"
- "pattern.as_str()"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-096 - Default Sensitive Pattern Set And Case Insensitive Matching

```yaml
plan_unit_id: F2-096
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  SecurityFilter default sensitive patterns are implemented as a fixed list of regex patterns
  compiled once in SecurityFilter::new using case-insensitive path matching, covering env files,
  secret/key/credential paths, key/cert extensions, SSH keys, and secrets directories or config
  files.
gui_related: false
gui_classification_reason: >-
  This unit defines backend sensitive-pattern defaults.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: default_sensitive_pattern_set_and_case_insensitive_matching
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0049"
preserved_exact_tokens:
- "Sensitive patterns (default set)"
- "fixed list of regex patterns"
- "compiled once in `SecurityFilter::new()`"
- "case-insensitive path matching"
- "\\.env(\\..*)?$"
- ".*secret.*"
- ".*key.*"
- ".*credential.*"
- "\\.(pem|key|p12|pfx)$"
- "id_rsa"
- "id_ed25519"
- "\\.pub$"
- "config/secrets\\."
- "secrets/"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-097 - Additive Security Filter Overrides And AGENTS Documentation Hook

```yaml
plan_unit_id: F2-097
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The FileSafe validation layer exposes default_sensitive_patterns() -> Vec<Regex> and supports
  an optional additive-only project override file at .puppet-master/security-filter.local.txt,
  with the behavior documented in AGENTS.md.
gui_related: false
gui_classification_reason: >-
  This unit defines backend security-filter override and documentation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: additive_security_filter_overrides_and_agents_documentation_hook
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0049"
preserved_exact_tokens:
- "FileSafe validation layer"
- "default_sensitive_patterns() -> Vec<Regex>"
- ".puppet-master/security-filter.local.txt"
- "additive patterns only"
- "Document in AGENTS.md"
negative_constraints:
- "Project security-filter overrides are additive-only."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-098 - Prompt And Context Compilation Safety Threat Model

```yaml
plan_unit_id: F2-098
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  ExecutionRequest.prompt and ExecutionRequest.context_files are compiled into the final
  platform prompt, so destructive prompt text and destructive content from context files are in
  FileSafe scope before platform CLI execution.
gui_related: false
gui_classification_reason: >-
  This unit defines backend prompt and context compilation threat model behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: prompt_and_context_compilation_safety_threat_model
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0050"
preserved_exact_tokens:
- "ExecutionRequest.prompt"
- "ExecutionRequest.context_files"
- "append_prompt_attachments()"
- "Final Prompt"
- "platform CLI"
- "destructive commands in their prompts"
- "context files may contain destructive commands"
- "11.3 Prompt Content Checking & Context Compilation"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Aligns with existing compiled-context FileSafe units and does not replace them."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-099 - Platform Attachment Token Format Contract

```yaml
plan_unit_id: F2-099
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  append_prompt_attachments formats context file references with platform-specific token
  prefixes, using empty prefixes for Cursor, Codex, and Claude text attachments and @ path
  tokens for Gemini and Copilot, while Codex must not rely on --add-dir for prompt attachment
  semantics and Claude append-system-prompt-file is only an implementation detail.
gui_related: false
gui_classification_reason: >-
  This unit defines backend platform attachment formatting behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: platform_attachment_token_format_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0050"
preserved_exact_tokens:
- "DRY:FN:append_prompt_attachments"
- "token_prefix"
- "\"\""
- "\"@\""
- "Reference attachments:"
- "@/path/to/file.rs"
- "Cursor"
- "Gemini"
- "Copilot"
- "Codex"
- "Claude"
- "do not rely on `--add-dir`"
- "--append-system-prompt-file"
- "Platform-Specific Context Compilation"
negative_constraints:
- "Codex must not rely on --add-dir for prompt attachment semantics."
- "Claude --append-system-prompt-file usage is an implementation detail only when needed."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-100 - Compiled Prompt FileSafe Integration Point

```yaml
plan_unit_id: F2-100
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe checks the compiled prompt after context compilation and before sending to the
  platform CLI, not just the original prompt, so destructive commands in context files and file
  paths in context attachments are validated.
gui_related: false
gui_classification_reason: >-
  This unit defines backend compiled prompt guard integration.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: compiled_prompt_filesafe_integration_point
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0050"
preserved_exact_tokens:
- "FileSafe integration point"
- "compiled prompt"
- "after context compilation"
- "not just the original prompt"
- "before sending to platform CLI"
- "Destructive commands in context files are caught"
- "File paths in context attachments are validated"
- "final prompt sent to the platform is safe"
negative_constraints:
- "FileSafe must not check only the original prompt."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-101 - Prompt Command Extraction And Deduplication

```yaml
plan_unit_id: F2-101
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BashGuard.check_prompt extracts candidate commands from bash, sh, shell, and SQL code blocks,
  shell prompt lines, SQL statements, and common destructive mentions in prose, then sorts and
  deduplicates commands before checking each against destructive patterns.
gui_related: false
gui_classification_reason: >-
  This unit defines backend prompt command extraction logic.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: prompt_command_extraction_and_deduplication
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0050"
preserved_exact_tokens:
- "DRY:FN:check_prompt"
- "DRY:HELPER:extract_commands_from_prompt"
- "bash|sh|shell|sql"
- "$ "
- "> "
- "DROP"
- "TRUNCATE"
- "DELETE without WHERE"
- "migrate[:.]fresh"
- "db[:.]drop"
- "reset\\s+--hard"
- "commands.sort()"
- "commands.dedup()"
- "Extract potential shell commands from prompt content"
negative_constraints: []
compatibility_only_notes:
- "Preserve the source example/prose mismatch around DELETE without WHERE without resolving it in this standardization batch."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-102 - Effective Request Guard Ordering Example

```yaml
plan_unit_id: F2-102
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The platform runner example clones the request into effective_request, compiles context files
  into prompt, checks the compiled prompt before building CLI args, checks context files
  separately through the security filter, respects verification gate and interview operation
  modes, and only then builds args and continues execution.
gui_related: false
gui_classification_reason: >-
  This unit preserves backend guard-ordering example lineage.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: effective_request_guard_ordering_example
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0050"
preserved_exact_tokens:
- "effective_request"
- "CHECK COMPILED PROMPT HERE"
- "is_verification_gate_operation"
- "Sensitive context file blocked"
- "PUPPET_MASTER_OPERATION_TYPE"
- "before building CLI args"
- "append_prompt_attachments"
- "security_filter.check_file_access"
- "allow_during_interview"
- "Key Points"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This is example/lineage coverage for F2-042 through F2-044 and does not replace their authority."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-103 - Structured Attachment Pre Send FileSafe Gate

```yaml
plan_unit_id: F2-103
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe applies to structured chat attachments as well as freeform prompt text and context-
  file paths, inspecting compiled prompt plus structured attachments together before platform
  send and requiring document_selection_context attachments to pass mandatory secret scrub
  before persistence; blocked forwarding emits an explicit block result and visible reason code
  instead of pretending success.
gui_related: false
gui_classification_reason: >-
  This unit defines backend pre-send attachment safety gates.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: structured_attachment_pre_send_filesafe_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0051"
preserved_exact_tokens:
- "structured chat attachments"
- "freeform prompt text"
- "context-file paths"
- "compiled prompt plus structured attachments"
- "document_selection_context"
- ".env"
- "key/cert"
- "credential files"
- "explicit block result"
- "visible reason code"
- "must not pretend the context was sent successfully"
- "no_secrets_in_storage"
negative_constraints:
- "Blocked attachment forwarding must not pretend the context was sent successfully."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-104 - Structured Attachment Storage And Redaction Defaults

```yaml
plan_unit_id: F2-104
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Heuristic secret-ish redaction stays off by default, mandatory secret scrubbing remains on for
  all structured attachments before persistence, search and indexing store bounded summaries and
  provenance only, and sensitive-storage boundaries apply before send-to-chat chips or
  structured-revision prompts are persisted.
gui_related: false
gui_classification_reason: >-
  This unit defines backend attachment persistence and redaction defaults.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: structured_attachment_storage_and_redaction_defaults
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0051"
preserved_exact_tokens:
- "Heuristic secret-ish redaction remains off by default"
- "Mandatory secret scrubbing remains on"
- "bounded summaries and provenance only"
- "/sensitive-storage"
- "send-to-chat"
- "structured-revision"
- "secret-ish"
- "OFF by default"
- "blocked forwarding uses explicit FileSafe signals"
- "visible block reasons"
negative_constraints:
- "Search/indexing must not store unbounded raw selected text."
- "Blocked forwarding must use explicit FileSafe signals and visible block reasons instead of guessed redaction success."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-105 - Verification Gate Operation Type Guard Exception

```yaml
plan_unit_id: F2-105
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe guards run before verification gates; destructive commands may be allowed only for
  verification gate operations such as QA database resets, detected via
  PUPPET_MASTER_OPERATION_TYPE == "verification_gate", and normal operations remain blocked.
gui_related: false
gui_classification_reason: >-
  This unit defines backend verification-gate guard exception behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: verification_gate_operation_type_guard_exception
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0052"
preserved_exact_tokens:
- "Check guards BEFORE verification gates"
- "test database resets during QA"
- "PUPPET_MASTER_OPERATION_TYPE == \"verification_gate\""
- "Destructive command blocked"
- "verification_gate"
- "normal"
- "Verification gate detection"
negative_constraints:
- "Guards may loosen only for verification_gate operations, not normal operations."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-106 - Attachment Gate Persistence And Visible Recovery

```yaml
plan_unit_id: F2-106
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Attachment gating remains active even during verification gates: sensitive-storage boundaries
  apply before send-to-chat or structured-revision persistence, blocked or unrestorable pending
  selection chips restore as explicit blocked or expired chips, searchable records are bounded
  summaries plus provenance, and the UI records visible reason codes and audit events instead of
  silently redacting intended text into misleading success.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI-visible blocked/expired chip recovery and visible reason-code behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: attachment_gate_persistence_and_visible_recovery
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0052"
preserved_exact_tokens:
- "/sensitive-storage"
- "/expired"
- "/searchable"
- "/provenance"
- ".env"
- "/cert"
- "/redb/index/blob"
- "/audit"
- "heuristic secret-ish redaction stays OFF"
- "Pending selection chips"
- "visible reason code"
- "must not silently redact"
- "misleading successful send"
negative_constraints:
- "The UI must not silently redact intended text into a misleading successful send."
- "Unbounded raw selected text is never stored for search."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FileSafe owns block signals; chat/GUI own chip rendering and visible reasons; storage owns persisted records."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-107 - Blocked Command Event Logging Helper

```yaml
plan_unit_id: F2-107
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The BashGuard event logging helper logs blocked commands through EventLogger by building a
  FileSafeEvent with bash_guard_block event type, a 40-character command preview, matched
  pattern, optional agent, timestamp, and asynchronous log_filesafe_event call.
gui_related: false
gui_classification_reason: >-
  This unit preserves backend blocked-command logging helper behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: blocked_command_event_logging_helper
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0053"
preserved_exact_tokens:
- "EventLogger"
- "log_blocked_command"
- "FileSafeEvent"
- "\"bash_guard_block\""
- "command_preview: command.chars().take(40).collect()"
- "GuardError::DestructiveCommand"
- "pattern_matched"
- "agent: None"
- "Utc::now()"
- "event_logger.log_filesafe_event(event).await"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This helper is lineage only; event stream authority remains F2-055 through F2-057."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-108 - Pattern Matching Accuracy Risk

```yaml
plan_unit_id: F2-108
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe pattern matching accuracy risks include regexes being too broad or too narrow,
  mitigated by testing patterns against real-world command variations, using word boundaries
  where appropriate, documenting pattern rationale in comments, and allowing project-specific
  overrides via local patterns files.
gui_related: false
gui_classification_reason: >-
  This unit captures backend pattern accuracy risk and mitigation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: pattern_matching_accuracy_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0055"
preserved_exact_tokens:
- "Pattern Matching Accuracy"
- "too broad"
- "too narrow"
- "real-world command variations"
- "word boundaries"
- "\\b"
- "pattern rationale"
- "project-specific overrides"
- "local patterns file"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-109 - False Positive Review

```yaml
plan_unit_id: F2-109
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  False-positive risk covers legitimate commands or documentation examples such as migrate:fresh
  matching destructive patterns, mitigated through prompt context checks, environment override,
  block logging, and clear override instructions.
gui_related: false
gui_classification_reason: >-
  This unit captures backend false-positive risk and user-facing error mitigation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: false_positive_review
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0056"
preserved_exact_tokens:
- "False Positives"
- "migrate:fresh"
- "documentation"
- "Check prompt context"
- "environment variable"
- "Log all blocks for review"
- "clear error messages"
- "override instructions"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-110 - Pattern Performance Mitigation

```yaml
plan_unit_id: F2-110
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Pattern matching on every command may add latency, so regex patterns are compiled once at
  initialization, Rust regex is used as the efficient engine, compilation results are cached,
  and hot paths are benchmarked and optimized.
gui_related: false
gui_classification_reason: >-
  This unit captures backend performance risk and mitigation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: pattern_performance_mitigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0057"
preserved_exact_tokens:
- "Performance Impact"
- "latency"
- "Compile regex patterns once at initialization"
- "Rust's regex crate"
- "Cache pattern compilation results"
- "Benchmark and optimize hot paths"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-111 - Multi Platform Prompt Parser Risk

```yaml
plan_unit_id: F2-111
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Different platforms format prompts differently, so FileSafe prompt checking uses platform-
  specific prompt parsers where needed, falls back to simple pattern matching, documents
  platform-specific behavior, and tests across all providers.
gui_related: false
gui_classification_reason: >-
  This unit captures backend multi-platform prompt parsing risk.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: multi_platform_prompt_parser_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0058"
preserved_exact_tokens:
- "Multi-Platform Prompt Checking"
- "Different platforms format prompts differently"
- "Platform-specific prompt parsers"
- "Fallback to simple pattern matching"
- "Document platform-specific behavior"
- "Test across all providers"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-112 - Write Scope Plan Integration Risk

```yaml
plan_unit_id: F2-112
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Write-scope enforcement can be too restrictive when plans do not specify exact file paths, so
  MVP mitigation prefers directory-level permissions, keeps wildcard patterns as a future
  enhancement, gives clear blocked-write messages, and allows override for exploratory phases.
gui_related: false
gui_classification_reason: >-
  This unit captures backend write-scope planning risk.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: write_scope_plan_integration_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0059"
preserved_exact_tokens:
- "Write-scope plan integration"
- "exact file paths"
- "directory-level permissions"
- "wildcard patterns are a future enhancement (not MVP)"
- "clear error messages"
- "exploratory phases"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-113 - Execution Request Operation Metadata Boundary

```yaml
plan_unit_id: F2-113
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Resolved FileSafe request metadata uses ExecutionRequest.env_vars only, does not add a tags
  field, and PUPPET_MASTER_OPERATION_TYPE values are fixed to normal by default,
  verification_gate, and interview, with guard loosening allowed only for verification_gate and
  never for normal.
gui_related: false
gui_classification_reason: >-
  This unit defines backend request metadata and operation type constraints.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: execution_request_operation_metadata_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0060"
preserved_exact_tokens:
- "ExecutionRequest.env_vars"
- "do not add a `tags` field"
- "PUPPET_MASTER_OPERATION_TYPE"
- "normal"
- "verification_gate"
- "interview"
- "never for `normal`"
- "puppet-master-rs/src/types/execution.rs"
negative_constraints:
- "Do not add a tags field to ExecutionRequest metadata."
- "Guards may loosen only for verification_gate and never for normal."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: CodePath:puppet-master-rs/src/types/execution.rs, EnvVar:PUPPET_MASTER_OPERATION_TYPE, EnvVar:PUPPET_MASTER_ALLOWED_FILES"
- "ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-114 - Allowed Files Env Scope Derivation And Fail Closed Strictness

```yaml
plan_unit_id: F2-114
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Allowed write scope is supplied via PUPPET_MASTER_ALLOWED_FILES as a JSON array of repo-
  relative paths and explicit directories; if missing or empty while file_guard.enabled is true,
  FileSafe treats it as an empty allowlist with strict_mode-dependent enforcement, while
  orchestrator derives the env value from current subtask declared files and implicit
  context_files.
gui_related: false
gui_classification_reason: >-
  This unit defines backend allowed-file scope derivation and fail-closed behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: allowed_files_env_scope_derivation_and_fail_closed_strictness
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0060"
preserved_exact_tokens:
- "PUPPET_MASTER_ALLOWED_FILES"
- "JSON array"
- "repo-relative paths"
- "explicit directories"
- "missing or empty"
- "empty allowlist"
- "file_guard.enabled == true"
- "strict_mode"
- "puppet-master-rs/src/core/orchestrator.rs"
- "request.context_files"
- "context files are implicitly allowed"
negative_constraints:
- "Missing or empty PUPPET_MASTER_ALLOWED_FILES must be treated as an empty allowlist when file_guard.enabled is true."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Orchestrator owns allowed-files derivation; FileSafe enforces the effective allowlist."
- "ContractRef: EnvVar:PUPPET_MASTER_ALLOWED_FILES, ConfigKey:filesafe.fileGuard.strictMode"
- "ContractRef: CodePath:puppet-master-rs/src/core/orchestrator.rs, CodePath:puppet-master-rs/src/platforms/context_files.rs"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-115 - Pattern Source Fallback Does Not Disable FileSafe

```yaml
plan_unit_id: F2-115
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  A missing or unreadable custom pattern file is ignored while bundled patterns still apply; if
  bundled patterns are unavailable at runtime, FileSafe falls back to an embedded minimal
  default list, logs a warning, and does not disable FileSafe.
gui_related: false
gui_classification_reason: >-
  This unit defines backend pattern-source fallback behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: pattern_source_fallback_does_not_disable_filesafe
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0060"
preserved_exact_tokens:
- "filesafe.bashGuard.customPatternsPath"
- "missing/unreadable custom pattern file"
- "bundled patterns still apply"
- "embedded minimal default list"
- "log a warning"
- "do not disable FileSafe"
negative_constraints:
- "Missing custom patterns or unavailable bundled patterns must not disable FileSafe."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Reconciles with fail-closed FileSafe canon by treating embedded minimal defaults as fallback baseline, not a disabled guard state."
- "ContractRef: ConfigKey:filesafe.bashGuard.customPatternsPath"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-116 - Approved Commands Exact Normalized Match Boundary

```yaml
plan_unit_id: F2-116
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  approved_commands matching is exact after trim and whitespace-collapse normalization, and
  FileSafe must not use prefix or substring matching.
gui_related: false
gui_classification_reason: >-
  This unit defines backend approved command matching behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: approved_commands_exact_normalized_match_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0060"
preserved_exact_tokens:
- "approved_commands"
- "exact"
- "trim"
- "collapse whitespace"
- "prefix/substring"
- "filesafe.approvedCommands"
negative_constraints:
- "Do not use prefix or substring matching for approved_commands."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Aligns with F2-032 approved command normalization."
- "ContractRef: ConfigKey:filesafe.approvedCommands"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-117 - Chained Command Segment Guard Evaluation

```yaml
plan_unit_id: F2-117
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  For multi-line or chained commands using newline, &&, semicolon, ||, or pipe separators,
  FileSafe checks each segment independently and blocks the whole invocation if any segment is
  blocked.
gui_related: false
gui_classification_reason: >-
  This unit defines backend chained-command evaluation behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: chained_command_segment_guard_evaluation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0060"
preserved_exact_tokens:
- "multi-line or chained commands"
- "\\n"
- "&&"
- ";"
- "||"
- "|"
- "check each segment independently"
- "if any segment is blocked, block the whole invocation"
- "BaseRunner::execute_command"
negative_constraints:
- "If any segment of a chained command is blocked, FileSafe blocks the whole invocation."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-118 - Git Destructive Command Pattern Enhancement

```yaml
plan_unit_id: F2-118
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The Git destructive-command guard enhancement extends the bash guard blocklist with
  destructive git patterns for reset hard, force push, branch deletion, and clean -fd.
gui_related: false
gui_classification_reason: >-
  This unit captures backend git destructive-command enhancement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: git_destructive_command_pattern_enhancement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0062"
preserved_exact_tokens:
- "Git Destructive Commands Guard"
- "destructive-commands.txt"
- "git\\s+reset\\s+--hard"
- "git\\s+push\\s+.*--force"
- "git\\s+push\\s+.*-f"
- "git\\s+branch\\s+-D"
- "git\\s+clean\\s+-fd"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Extends F2-050 and F2-051 blocklist coverage."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-119 - SQL Injection Prompt Pattern Enhancement

```yaml
plan_unit_id: F2-119
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The SQL injection enhancement adds check_sql_injection(prompt) to detect common SQL injection
  patterns such as UNION SELECT and DROP TABLE in prompts.
gui_related: false
gui_classification_reason: >-
  This unit captures backend SQL injection prompt checking enhancement.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: sql_injection_prompt_pattern_enhancement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0063"
preserved_exact_tokens:
- "SQL Injection Pattern Detection"
- "DRY:FN:check_sql_injection"
- "UNION SELECT"
- "DROP TABLE"
- "Result<(), GuardError>"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Extends F2-101 prompt extraction and SQL command checking coverage."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-120 - Guard Violation Rate Limiter Enhancement

```yaml
plan_unit_id: F2-120
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The guard violation rate limiter enhancement tracks repeated destructive command attempts and
  may temporarily increase guard strictness or block the agent using GuardRateLimiter violation
  timestamps, max_violations, and window_seconds.
gui_related: false
gui_classification_reason: >-
  This unit captures backend guard rate-limit enhancement behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: guard_violation_rate_limiter_enhancement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0064"
preserved_exact_tokens:
- "Rate Limiting for Blocked Commands"
- "GuardRateLimiter"
- "violations: HashMap<String, Vec<DateTime<Utc>>>"
- "max_violations"
- "window_seconds"
- "temporarily increase guard strictness or block the agent"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-121 - FileSafe GUI Single Entry Toggle Surface

```yaml
plan_unit_id: F2-121
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe controls are configurable in the GUI, easy to turn on or off, visible from a single
  Config entry point, and expose independent toggles for Command blocklist, Write scope,
  Security filter, destructive override, optional pattern and event-log controls, and shared
  widget reuse.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI configuration surface and control grouping for FileSafe.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_gui_single_entry_toggle_surface
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0065"
preserved_exact_tokens:
- "configurable in the GUI"
- "easy to turn on or off"
- "Single entry point"
- "\"Block destructive commands\""
- "\"Restrict writes to plan\""
- "\"Block sensitive files\""
- ".env`/credentials"
- "strict mode"
- "allow-during-interview"
- "\"Allow destructive commands\""
- "Pattern management"
- "event log viewer"
- "src/widgets/"
- "DRY Method"
- "13.4 GUI Integration (configurable, easy on/off)"
negative_constraints:
- "When a FileSafe feature is toggled off, that guard does not block, restrict, or filter for that feature."
compatibility_only_notes:
- "The earlier dedicated FileSafe tab wording is compatibility-only; F2-132 and FinalGUISpec place FileSafe under Settings > Advanced as a collapsible card."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-122 - Assistant Approved Commands UX And Settings List

```yaml
plan_unit_id: F2-122
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  When Assistant chat blocks a command, the user can approve this run and optionally add the
  command to the approved list; Config exposes viewing, removing, and optionally manually adding
  approved commands, and approved commands are persisted in settings while exact normalized
  matching remains the runtime approval boundary.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI and chat UX for approved commands and settings list management.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: assistant_approved_commands_ux_and_settings_list
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0065"
preserved_exact_tokens:
- "Approved-commands list (Assistant chat)"
- "approve this run"
- "add to approved list"
- "approvedCommands"
- "whitelist overrides blocklist"
- "exact match or normalized match"
- "strip extra whitespace"
- "\"Blocked: <command>\""
- "\"Approve once\""
- "\"Approve and add to list\""
- "scrollable list"
- "remove button per row"
- "filesafe.approvedCommands"
- "puppet-master.yaml"
negative_constraints:
- "Do not weaken F2-116 exact normalized approved-command matching into prefix or substring matching."
compatibility_only_notes:
- "Any dedicated approved-command file is a projection or implementation detail, not a competing settings authority."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-123 - Prompt Pipeline Owns Moved Context Compilation Canon

```yaml
plan_unit_id: F2-123
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The context-compilation and token-efficiency material formerly in FileSafe is no longer
  canonical there; Prompt_Pipeline owns context compilation algorithms, delta context selection,
  cache heuristics, marker-file and compaction-aware reread behavior, skill bundling, and
  prompt-compaction policy, while FileSafe checks the fully compiled prompt and related
  attachments after assembly and before provider dispatch.
gui_related: false
gui_classification_reason: >-
  This unit defines backend owner-doc boundary for moved context compilation canon.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: prompt_pipeline_owns_moved_context_compilation_canon
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0066"
preserved_exact_tokens:
- "no longer canonical here"
- "Plans/Prompt_Pipeline.md"
- "context compilation algorithms"
- "delta context selection"
- "cache heuristics"
- "marker-file / compaction-aware reread behavior"
- "skill bundling and prompt-compaction policy"
- "fully compiled prompt"
- "after Prompt Pipeline assembly"
- "before provider dispatch"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-124 - BaseRunner Pre Spawn Guard Sequence

```yaml
plan_unit_id: F2-124
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner::execute_command integrates FileSafe after circuit breaker, quota, and rate-limit
  checks and before permission audit and spawn, checking the final command string and file paths
  while prompt content remains checked at platform-runner level after context compilation.
gui_related: false
gui_classification_reason: >-
  This unit defines backend BaseRunner pre-spawn guard ordering.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_pre_spawn_guard_sequence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0068"
preserved_exact_tokens:
- "BaseRunner::execute_command()"
- "BEFORE existing checks"
- "Circuit breaker check"
- "QUOTA CHECK"
- "RATE LIMIT"
- "FileSafe"
- "Prompt content is checked at platform runner level"
- "final command string"
- "bash_guard.check_command"
- "FileGuard::load_allowed_files_from_request"
- "check_file_write"
- "check_file_access"
- "PERMISSION AUDIT"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-125 - BaseRunner Guard Runtime Rules And Realpath Prohibition

```yaml
plan_unit_id: F2-125
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner guard runtime rules initialize guards in BaseRunner::new, share guards through Arc,
  log errors through existing logging infrastructure into the canonical event stream, treat
  filesafe-events.jsonl as a derived mirror only, and fail closed with
  GuardError::SymlinkResolution on canonicalize errors without unresolved-path fallback.
gui_related: false
gui_classification_reason: >-
  This unit defines backend BaseRunner guard runtime and fail-closed path behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_guard_runtime_rules_and_realpath_prohibition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0068"
preserved_exact_tokens:
- "BaseRunner::new()"
- "Arc<>"
- "thread-safe sharing"
- "existing logging infrastructure"
- "canonical event stream"
- "filesafe-events.jsonl"
- "derived mirror only"
- "GuardError::SymlinkResolution"
- "canonicalize()"
- "canonicalize().unwrap_or_else(|_| original_path)"
- "prohibited in all FileSafe-managed code paths"
negative_constraints:
- "Fallback to unresolved paths is prohibited for FileSafe-managed code paths."
- "FileSafe-only event log mirrors are not authoritative."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-126 - Verification Gate Operation Env Tagging

```yaml
plan_unit_id: F2-126
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Orchestrator tags verification gate requests by setting
  ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"] to verification_gate, and BaseRunner
  detects the env value via is_verification_gate_operation without adding an ExecutionRequest
  tags field.
gui_related: false
gui_classification_reason: >-
  This unit defines backend verification-gate env tagging behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: verification_gate_operation_env_tagging
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0069"
preserved_exact_tokens:
- "Integration with Orchestrator"
- "Verification Gate Detection"
- "ExecutionRequest.env_vars[\"PUPPET_MASTER_OPERATION_TYPE\"] = \"verification_gate\""
- "no `tags` field"
- "request.with_env"
- "DRY:FN:is_verification_gate_operation"
- "verification_gate"
- "migrate:fresh"
- ".env"
negative_constraints:
- "Do not add an ExecutionRequest.tags field for verification gate detection."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Aligns with F2-105 and F2-113 operation metadata boundary."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-127 - ExecutionRequest Interview Detection And Path Extraction Helpers

```yaml
plan_unit_id: F2-127
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner helper obligations include detecting interview operations from
  PUPPET_MASTER_OPERATION_TYPE and extracting candidate file paths from context_files, prompt
  text patterns, and extra_args while skipping URLs, sorting, and deduplicating the resulting
  paths.
gui_related: false
gui_classification_reason: >-
  This unit defines backend request helper behavior for interview detection and path extraction.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: executionrequest_interview_detection_and_path_extraction_helpers
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0069"
preserved_exact_tokens:
- "DRY:FN:is_interview_operation"
- "DRY:FN:extract_file_paths_from_request"
- "PUPPET_MASTER_OPERATION_TYPE"
- "interview"
- "create FILE"
- "write to FILE"
- "edit FILE"
- "context_files"
- "extra_args"
- "http://"
- "https://"
- "paths.sort()"
- "paths.dedup()"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Path extraction feeds FileSafe checks; operation values remain governed by F2-113."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-128 - Orchestrator Allowed Files Env Handoff

```yaml
plan_unit_id: F2-128
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Write scope receives allowed files through
  ExecutionRequest.env_vars["PUPPET_MASTER_ALLOWED_FILES"], with orchestrator deriving the JSON
  value from current subtask plan metadata and passing it to FileSafe rather than adding an
  allowed_files field to ExecutionRequest.
gui_related: false
gui_classification_reason: >-
  This unit defines backend orchestrator-to-FileSafe allowlist handoff.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: orchestrator_allowed_files_env_handoff
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0069"
preserved_exact_tokens:
- "Write-scope plan integration"
- "do not add an `allowed_files` field"
- "PUPPET_MASTER_ALLOWED_FILES"
- "get_allowed_files_for_current_subtask(&tier_state)"
- "serde_json::to_string(&allowed_files).unwrap_or_default()"
- "request.with_env"
negative_constraints:
- "Do not add an allowed_files field to ExecutionRequest."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Aligns with F2-114; orchestrator derives allowed files, FileSafe enforces the effective allowlist."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-129 - Interview FileSafe Relaxation Config Boundary

```yaml
plan_unit_id: F2-129
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Interview research and architecture phases may allow sensitive reads or relaxed strict file
  guard only through explicit InterviewGuiConfig and InterviewFileSafeConfig settings, with
  allow_sensitive_file_read defaulting true for research and strict_file_guard defaulting false
  when no plan exists.
gui_related: false
gui_classification_reason: >-
  This unit defines backend interview FileSafe config boundary rather than visual layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: interview_filesafe_relaxation_config_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0070"
preserved_exact_tokens:
- "InterviewGuiConfig"
- "InterviewFileSafeConfig"
- "allow_sensitive_file_read"
- "Default: true for research"
- "strict_file_guard"
- "Default: false (no plan yet)"
- "Research may need to read `.env`"
- "Security filter should be more permissive"
- "interview_"
negative_constraints: []
compatibility_only_notes:
- "The starts_with(\"interview_\") helper is source-lineage compatibility only against F2-113 fixed PUPPET_MASTER_OPERATION_TYPE value interview."
stale_retired_dispositions:
- "starts_with(\"interview_\") is stale/compatibility helper wording and must not replace the fixed interview operation value."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-130 - Worktree Aware Write Scope Canonicalization

```yaml
plan_unit_id: F2-130
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Worktree-aware write scope resolves plan paths relative to working_directory, canonicalizes
  fail-closed with GuardError::SymlinkResolution, compares against normalized allowed_files from
  request metadata, and does not store request-scoped allowlists inside FileGuard.
gui_related: false
gui_classification_reason: >-
  This unit defines backend worktree path canonicalization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: worktree_aware_write_scope_canonicalization
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0071"
preserved_exact_tokens:
- "Worktree-aware write scope"
- "working_directory"
- "worktree path"
- "project root"
- "canonicalize()"
- "GuardError::SymlinkResolution"
- "allowed_files"
- "FileGuard does not store request-scoped allowlists"
- "request metadata"
negative_constraints:
- "Worktree write-scope checks must not fall back to unresolved aliases."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-131 - Worktree Cleanup And Evidence Schema Coordination

```yaml
plan_unit_id: F2-131
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Worktree cleanup coordination keeps write-scope violations from preventing cleanup, requires
  cleanup to respect write-scope allowed files, and treats schema and evidence promises as
  enforceable only when machine-readable evidence or wiring contracts represent the same guard,
  gate, or wiring outcome.
gui_related: false
gui_classification_reason: >-
  This unit defines backend worktree cleanup and evidence-contract coordination.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: worktree_cleanup_and_evidence_schema_coordination
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0071"
preserved_exact_tokens:
- "Worktree Cleanup Coordination"
- "write-scope violations should not prevent worktree cleanup"
- "MiscPlan cleanup"
- "cleanup_after_execution"
- "Plans/evidence.schema.json"
- "/evidence.schema.json"
- "wiring-evidence"
- "/schema"
- "/evidence"
- "machine-readable contract"
negative_constraints:
- "Schema and evidence promises are enforceable only when the machine-readable contract can represent the same guard, gate, or wiring outcome."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-132 - FinalGUISpec Authority And Advanced Card Placement

```yaml
plan_unit_id: F2-132
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FinalGUISpec is the canonical GUI authority for FileSafe placement: FileSafe is not a separate
  tab and lives under Settings > Advanced as a collapsible card titled FileSafe Guards alongside
  MCP Configuration, Tool permissions, and Other advanced settings.
gui_related: true
gui_classification_reason: >-
  This unit defines canonical GUI placement for FileSafe controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: finalguispec_authority_and_advanced_card_placement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:11"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:9"
- "Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:18"
preserved_exact_tokens:
- "Plans/FinalGUISpec.md §7.4"
- "§7.16"
- "Config view has 8 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML"
- "not a separate tab"
- "Settings > Advanced"
- "collapsible card"
- "\"FileSafe Guards\""
- "MCP Configuration"
- "Tool permissions"
- "Other (experimental, cleanup, etc.)"
negative_constraints:
- "FileSafe is not a separate tab."
compatibility_only_notes: []
stale_retired_dispositions:
- "The legacy 8-tab Config list is retired compatibility/source-lineage only; FileSafe lives under Settings > Advanced."
owner_boundary_notes:
- "Plans/FinalGUISpec.md owns GUI placement; FileSafe.md aligns with that spec."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-133 - FileSafe Advanced Card Controls And Tooltip Keys

```yaml
plan_unit_id: F2-133
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The FileSafe Advanced card presents three independent product toggles, destructive override
  with warning styling, approved command list controls, optional pattern and event-log controls,
  existing widget reuse, and stable tooltip keys for bash_guard, file_guard, security_filter,
  override, and approved commands.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI controls, widget reuse, and tooltip keys.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_advanced_card_controls_and_tooltip_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
preserved_exact_tokens:
- "bash_guard"
- "file_guard"
- "security_filter"
- "\"Allow destructive commands\""
- "filesafe.approvedCommands"
- "toggler"
- "help_tooltip(tooltip_key, tooltip_variant, theme, scaled)"
- "styled_button"
- "filesafe.bash_guard"
- "filesafe.file_guard"
- "filesafe.security_filter"
- "filesafe.override"
- "filesafe.approved_commands"
- "docs/gui-widget-catalog.md"
- "danger/warning variant"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit preserves visual/control requirements; F2-134 preserves config struct shape."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-134 - FileSafe Config Struct Preservation

```yaml
plan_unit_id: F2-134
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The FileSafe GUI config struct remains GuiConfig.filesafe: FileSafeConfig with
  BashGuardConfig, FileGuardConfig, SecurityFilterConfig, and approved_commands: Vec<String> as
  defined in earlier config sections.
gui_related: false
gui_classification_reason: >-
  This unit defines config schema preservation rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_config_struct_preservation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
preserved_exact_tokens:
- "GuiConfig.filesafe: FileSafeConfig"
- "BashGuardConfig"
- "FileGuardConfig"
- "SecurityFilterConfig"
- "approved_commands: Vec<String>"
- "Config struct (unchanged)"
- "§2.4"
- "§5.2"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Config schema/runtime bridge boundary; not visual layout."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-135 - Assistant Chat YOLO Approval And Terminal Block Output

```yaml
plan_unit_id: F2-135
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Assistant Chat shows a persistent warning chip when YOLO is enabled and FileSafe guards are
  active, renders blocked commands as inline approval cards with orange border and actions to
  approve once or approve and add to list, auto-dismisses after 60 seconds, logs blocked
  commands, and shows terminal blocked output in red with the FileSafe prefix.
gui_related: true
gui_classification_reason: >-
  This unit defines Assistant Chat and terminal user-visible blocked-command behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: assistant_chat_yolo_approval_and_terminal_block_output
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
preserved_exact_tokens:
- "\"[!] YOLO active -- FileSafe guards still apply.\""
- "Orange left border"
- "monospace"
- "\"Approve once\""
- "\"Approve & add to list\""
- "60 seconds"
- "\"Timed out -- command skipped.\""
- "RED"
- "\"[BLOCKED] Blocked by FileSafe\""
- "FinalGUISpec §7.16"
- "FileSafe event log"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-136 - Dashboard Status And FileSafe Message Flow

```yaml
plan_unit_id: F2-136
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The dashboard may show compact FileSafe status linked to Settings > Advanced > FileSafe, and
  FileSafe-related UI messages update guard toggles, destructive override, strict mode,
  interview allowance, approved command removal/addition, event-log viewing, and config
  persistence with other Advanced tab changes.
gui_related: true
gui_classification_reason: >-
  This unit defines GUI status and message/update flow.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: dashboard_status_and_filesafe_message_flow
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
preserved_exact_tokens:
- "\"FileSafe: 3/3 guards active\""
- "Settings > Advanced > FileSafe"
- "FileSafeBashGuardToggled(bool)"
- "FileSafeAllowDestructiveToggled(bool)"
- "FileSafeFileGuardToggled(bool)"
- "FileSafeFileGuardStrictToggled(bool)"
- "FileSafeSecurityFilterToggled(bool)"
- "FileSafeAllowSensitiveDuringInterviewToggled(bool)"
- "FileSafeRemoveApprovedCommand(usize)"
- "FileSafeAddApprovedCommandClicked"
- "FileSafeAddApprovedCommand(String)"
- "FileSafeViewEventLog"
- "Save Changes per tab or global"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-137 - GUI Config To PuppetMasterConfig Runtime Wiring

```yaml
plan_unit_id: F2-137
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe settings and approved commands must flow from GuiConfig into PuppetMasterConfig and
  BaseRunner initialization using the WorktreeGitImprovement Option B build-run-config-from-GUI
  pattern so command blocklist whitelist behavior is applied at runtime.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime config wiring rather than visual UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: gui_config_to_puppetmasterconfig_runtime_wiring
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0072"
preserved_exact_tokens:
- "Config Wiring (Critical)"
- "PuppetMasterConfig"
- "Option B -- Build run config from GUI"
- "Plans/WorktreeGitImprovement.md §5.2"
- "BaseRunner"
- "approved_commands"
- "GuiConfig"
- "orchestrator start"
- "command blocklist whitelist"
negative_constraints:
- "FileSafe settings and approved_commands must not remain GUI-only."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Follows WorktreeGitImprovement Option B runtime config bridge."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-138 - Verification Gate Tagging And Gate Override Config

```yaml
plan_unit_id: F2-138
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Verification-gate operations must be tagged before BaseRunner guard checks so gate-specific
  FileSafe allowances can be applied for legitimate QA and security-audit work without weakening
  normal execution.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: verification_gate_tagging_and_gate_override_config
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0073"
preserved_exact_tokens:
- "run_verification_gate()"
- "ExecutionRequest"
- "BaseRunner"
- "GateOverrideConfig"
- "allow_destructive_during_qa: bool"
- "allow_sensitive_during_security_audit: bool"
- "Default: true"
- "migrate:fresh"
- ".env"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Operation metadata aligns with the env-var tagging model standardized in earlier FileSafe PlanUnits."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-139 - Gate Evidence And GATE-010 FileSafe Detail Arrays

```yaml
plan_unit_id: F2-139
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe blocks during verification gates are gate evidence and GateReport inputs, and GATE-010
  route-aware FileSafe checks must use named machine-readable detail arrays aligned with GATE-011
  and GATE-012 instead of text-heavy freeform details.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: gate_evidence_and_gate-010_filesafe_detail_arrays
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0073"
preserved_exact_tokens:
- "Gate Evidence Integration"
- "GateReport"
- "GATE-010"
- "allowed_action_ids[]"
- "/degraded"
- "route-payload mismatch"
- "alias/deprecation findings"
- "GATE-011"
- "GATE-012"
- "details"
negative_constraints:
- "GATE-010 FileSafe verification details must not fall back to text-heavy freeform details."
compatibility_only_notes: []
stale_retired_dispositions:
- "Route-aware FileSafe checks preserve stale or /degraded revalidation and alias/deprecation findings as verification inputs."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-140 - Seglog Canonical FileSafe State

```yaml
plan_unit_id: F2-140
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe history is canonical in seglog; snapshots, dashboards, diagnostic mirrors, and
  filesafe-events.jsonl are derived or rebuildable projections and must not become a competing
  owner store.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: seglog_canonical_filesafe_state
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0074"
preserved_exact_tokens:
- "seglog"
- "filesafe-events.jsonl"
- "rebuildable mirror"
- "not as an owner store"
- "State snapshots"
- "dashboards"
- "diagnostic mirrors"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
- "FileSafe event history ownership remains with canonical seglog."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-141 - Persistent Guard Config State And Safe Defaults

```yaml
plan_unit_id: F2-141
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Guard configuration persists as part of GuiConfig serialized through puppet-master.yaml, with
  safe defaults that keep guards enabled across sessions.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: persistent_guard_config_state_and_safe_defaults
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0074"
preserved_exact_tokens:
- "GuiConfig"
- "puppet-master.yaml"
- "persist across sessions"
- "guards enabled by default"
- "Default values remain safe"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-142 - Write Scope Plan Metadata Request Context

```yaml
plan_unit_id: F2-142
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Write-scope checks get the current plan allowed-files metadata through canonical request context
  and compare only canonical real paths rooted in the active worktree or project root.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: write_scope_plan_metadata_request_context
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0074"
preserved_exact_tokens:
- "allowed-files list"
- "BaseRunner"
- "canonical request context"
- "canonical real paths"
- "active worktree"
- "project root"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-143 - Cleanup And Write Scope Allowlist Coordination

```yaml
plan_unit_id: F2-143
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Cleanup and write scope are complementary: write scope blocks during execution, cleanup removes
  untracked files after execution, and write-scope allowed files must be included in the cleanup
  allowlist.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: cleanup_and_write_scope_allowlist_coordination
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0075"
preserved_exact_tokens:
- "prepare_working_directory"
- "cleanup_after_execution"
- "git clean"
- "allowlist"
- "DURING execution"
- "AFTER execution"
- "Write-scope allowed files"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-144 - Cleanup Sensitive File Protection

```yaml
plan_unit_id: F2-144
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Cleanup must never delete sensitive files, even when untracked, and security-filter patterns
  must be added to cleanup allowlists to prevent credential deletion.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: cleanup_sensitive_file_protection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0075"
preserved_exact_tokens:
- "Security Filter vs Cleanup"
- "NEVER delete sensitive files"
- "untracked"
- "Security filter patterns"
- "cleanup allowlist"
- "credentials"
negative_constraints:
- "Cleanup must never delete sensitive files even if they are untracked."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-145 - ExecutionRequest Operation Metadata Gap Closure

```yaml
plan_unit_id: F2-145
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Operation classification uses ExecutionRequest env_vars with PUPPET_MASTER_OPERATION_TYPE fixed
  values normal, verification_gate, and interview so guards can distinguish operation context
  without adding new request fields.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: executionrequest_operation_metadata_gap_closure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0077"
preserved_exact_tokens:
- "ExecutionRequest.env_vars[\"PUPPET_MASTER_OPERATION_TYPE\"]"
- "normal"
- "verification_gate"
- "interview"
- "ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE"
negative_constraints:
- "FileSafe operation tagging must not require a new ExecutionRequest metadata field."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-146 - Plan Metadata Access Gap Closure

```yaml
plan_unit_id: F2-146
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner must receive current-plan allowed-file metadata for write-scope enforcement,
  preserving the legacy source wording that metadata may travel via ExecutionRequest or context
  files while standardizing on canonical request context and env/request wiring.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: plan_metadata_access_gap_closure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0078"
preserved_exact_tokens:
- "Write scope needs current plan's allowed files list"
- "BaseRunner"
- "ExecutionRequest"
- "context files"
negative_constraints: []
compatibility_only_notes:
- "The source phrase “via ExecutionRequest or context files” is preserved as lineage and reconciled with the canonical request-context/env-var model."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-147 - Config Wiring Gap Closure

```yaml
plan_unit_id: F2-147
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe GUI settings must be wired into orchestrator runtime configuration using Option B,
  building run config from GUI at orchestrator start so GUI choices apply at runtime.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: config_wiring_gap_closure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0079"
preserved_exact_tokens:
- "FileSafe config in GUI"
- "orchestrator config"
- "Option B config wiring"
- "build run config from GUI at orchestrator start"
- "Plans/WorktreeGitImprovement.md §5.2"
negative_constraints:
- "FileSafe settings from GUI must not be ignored at runtime."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-148 - Worktree Path Resolution Resolved Contract

```yaml
plan_unit_id: F2-148
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Write-scope path checks normalize candidates relative to working_directory, resolve realpath
  before scope checks, deny on canonicalization failure, and compare against the real worktree
  root instead of a symlink alias.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: worktree_path_resolution_resolved_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0080"
preserved_exact_tokens:
- "working_directory"
- "realpath()"
- "deny access"
- "real worktree root"
- "symlink alias"
negative_constraints:
- "Canonicalization failure must deny access rather than permit an unresolved path."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/WorktreeGitImprovement.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-149 - Interview Operation Detection Gap Closure

```yaml
plan_unit_id: F2-149
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Interview operations must be explicitly tagged in ExecutionRequest so any security-filter
  relaxation for research operations is detectable, configured, and scoped.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: interview_operation_detection_gap_closure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0081"
preserved_exact_tokens:
- "interview operations"
- "ExecutionRequest"
- "relaxed security filter"
- "research operations"
- "check tag in guards"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-150 - FileSafe Event Correlation Gap Closure

```yaml
plan_unit_id: F2-150
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe events must correlate with execution context by integrating with the existing event
  logging system or by adding FileSafe events to gate reports rather than staying isolated.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_event_correlation_gap_closure
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0082"
preserved_exact_tokens:
- "FileSafe events logged separately"
- "execution context"
- "existing event logging system"
- "gate reports"
- "FileSafe violations"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-151 - Documentation False Positive Mitigation

```yaml
plan_unit_id: F2-151
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe prompt/content checks must mitigate false positives from documentation and comments by
  checking prompt context, distinguishing code blocks from markdown, allowing explicit override,
  and logging blocks for refinement.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: documentation_false_positive_mitigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0084"
preserved_exact_tokens:
- "destructive commands in documentation or comments"
- "code block vs markdown"
- "environment variable"
- "Log all blocks"
- "pattern refinement"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-152 - Guard Pattern Matching Performance Mitigation

```yaml
plan_unit_id: F2-152
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Pattern matching on commands must avoid unnecessary latency by compiling regex patterns once,
  using Rust regex, benchmarking hot paths, and considering async guard checks when needed.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: guard_pattern_matching_performance_mitigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0085"
preserved_exact_tokens:
- "Compile regex patterns once"
- "Rust's `regex` crate"
- "Benchmark"
- "hot paths"
- "async guard checks"
- "latency"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-153 - Plan File List Completeness Mitigation

```yaml
plan_unit_id: F2-153
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Write-scope enforcement must account for incomplete plan file lists through bounded wildcard or
  directory permissions, clear error messages with override instructions, and a compatibility note
  for warn-only mode.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: plan_file_list_completeness_mitigation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0086"
preserved_exact_tokens:
- "wildcard patterns"
- "directory-level permissions"
- "clear error messages"
- "override instructions"
- "Warn-only mode option"
negative_constraints: []
compatibility_only_notes:
- "Warn-only mode is preserved as source-lineage and must be reconciled with fail-closed/FileSafe blocking policy before implementation."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-154 - Multi Platform Prompt Parsing Risk

```yaml
plan_unit_id: F2-154
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Prompt content checking must handle provider/platform format differences through
  platform-specific parsers, fallback matching, provider tests, and documented platform behavior.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: multi_platform_prompt_parsing_risk
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0087"
preserved_exact_tokens:
- "Platform-specific prompt parsers"
- "Fallback to simple pattern matching"
- "Test across all providers"
- "Document platform-specific behavior"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-155 - Guard Initialization Failure Compatibility Disposition

```yaml
plan_unit_id: F2-155
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The legacy graceful-degradation proposal is retained only as compatibility lineage; canonical
  FileSafe behavior must not silently disable guards on initialization failure and Doctor checks
  validate initialization health.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: guard_initialization_failure_compatibility_disposition
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0088"
preserved_exact_tokens:
- "Graceful degradation"
- "disable guard on init failure"
- "log warning"
- "BashGuard::disabled()"
- "Doctor check validates guard initialization"
negative_constraints:
- "Guard initialization failure must not silently disable FileSafe or widen authority."
compatibility_only_notes:
- "BashGuard::disabled() and graceful degradation are preserved as source-lineage only, not as final fail-open policy."
stale_retired_dispositions:
- "This span conflicts with later fail-closed canon and is retained as retired compatibility guidance."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-156 - FileSafe Doctor Initialization Check

```yaml
plan_unit_id: F2-156
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Doctor checks include FileSafe initialization health by verifying pattern file readability,
  regex compilation, guard initialization, and configuration validity.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_doctor_initialization_check
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0090"
preserved_exact_tokens:
- "src/doctor/checks/"
- "DRY:FN:check_filesafe"
- "pattern file exists and is readable"
- "patterns compile as valid regex"
- "guards initialize without errors"
- "config is valid"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-157 - GateReport FileSafe Violations Payload

```yaml
plan_unit_id: F2-157
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  GateReport can carry FileSafe violations using filesafe_violations entries that record guard
  type, violation type, details, timestamp, and whether an override was applied.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: gatereport_filesafe_violations_payload
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0091"
preserved_exact_tokens:
- "filesafe_violations: Vec<FileSafeViolation>"
- "guard_type"
- "violation_type"
- "details"
- "timestamp"
- "allowed"
- "destructive_command"
- "file_not_in_plan"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-158 - FileSafe Metrics Dashboard Projection

```yaml
plan_unit_id: F2-158
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  GUI status and overview projections may show FileSafe blocked-command counts, guard-type totals,
  common violations, override usage, and an event timeline derived from canonical FileSafe events.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_metrics_dashboard_projection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0092"
preserved_exact_tokens:
- "FileSafe metrics dashboard"
- "GUI status/overview"
- "Count of blocked commands"
- "Most common violations"
- "Override usage statistics"
- "FileSafe event timeline"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "The dashboard is a derived projection over canonical FileSafe event state."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-159 - Plan Generation File List Validation

```yaml
plan_unit_id: F2-159
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Interview and planning phases should generate write-scope file lists, validate completeness
  before execution, and expose Doctor validation for plan file lists.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: plan_generation_file_list_validation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0093"
preserved_exact_tokens:
- "Interview/planning phases"
- "generate file lists for write scope"
- "Validate file lists"
- "before execution"
- "Doctor check validates plan file lists"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-160 - Runtime Profile FileSafe Config Profiles

```yaml
plan_unit_id: F2-160
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe strictness varies by runtime profile through FileSafeProfileSet profiles
  plan_read_only, standard_execution, debug_investigation, delegated_child, and
  maintenance_recovery, selected from run mode, operation class, and capabilities rather than
  deprecated tier names.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_profile_filesafe_config_profiles
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0094"
preserved_exact_tokens:
- "FileSafeProfileSet"
- "plan_read_only"
- "standard_execution"
- "debug_investigation"
- "delegated_child"
- "maintenance_recovery"
- "runtime profile"
- "Phase/Task/Subtask/Iteration"
negative_constraints:
- "maintenance_recovery is reserved for restore/cleanup/recovery flows and must not silently broaden into general execution."
- "Profile selection MUST NOT depend on legacy Phase/Task/Subtask/Iteration naming."
compatibility_only_notes:
- "Profile selection derives from effective run mode, operation class, and target capabilities. It MUST NOT depend on legacy Phase/Task/Subtask/Iteration naming."
stale_retired_dispositions:
- "Allow different guard strictness by runtime profile, not by deprecated tier names."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-161 - Launch Path Env Var Checklist

```yaml
plan_unit_id: F2-161
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Every launch path that constructs an ExecutionRequest populates PUPPET_MASTER_OPERATION_TYPE and
  PUPPET_MASTER_ALLOWED_FILES before BaseRunner executes, and FileSafe does not require new
  ExecutionRequest fields.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: launch_path_env_var_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0095"
preserved_exact_tokens:
- "PUPPET_MASTER_OPERATION_TYPE"
- "PUPPET_MASTER_ALLOWED_FILES"
- "ExecutionRequest"
- "BaseRunner"
- "FileSafe does not require new `ExecutionRequest` fields"
negative_constraints:
- "FileSafe must not add new ExecutionRequest fields for this checklist item."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This checklist is a resolved implementation map and does not reopen design questions."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-162 - BaseRunner Denial And Helper Checklist

```yaml
plan_unit_id: F2-162
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  BaseRunner owns FileSafe guard initialization, rendered-command validation, write-scope checks,
  security-filter checks, helper functions, and canonical blocked outcomes before managed spawn
  paths execute.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: baserunner_denial_and_helper_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0095"
preserved_exact_tokens:
- "BaseRunner"
- "full rendered-command validation"
- "write-scope checks"
- "security-filter checks"
- "is_verification_gate_operation"
- "is_interview_operation"
- "extract_file_paths_from_request"
- "canonical blocked outcome"
negative_constraints:
- "FileSafe denial in BaseRunner must not silently downgrade to a best-effort retry path."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-163 - Orchestrator Interview Integration Checklist

```yaml
plan_unit_id: F2-163
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Orchestrator verification gates tag operation type, pass allowed-file metadata, and report
  FileSafe violations, while interview operations tag context explicitly and require scoped
  relaxation configuration.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: orchestrator_interview_integration_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0095"
preserved_exact_tokens:
- "verification-gate operations"
- "allowed-file metadata"
- "FileSafe violations"
- "interview-owned operations"
- "explicit configuration"
- "scoped to the interview flow"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Permissions_System.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-164 - Worktree Guard Checklist TODO Retirement

```yaml
plan_unit_id: F2-164
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Worktree guard behavior is already locked by owner canon: normalize relative to
  working_directory, canonicalize fail-closed, compare real root, reject unresolved aliases, and
  treat real-root/unresolved-alias TODOs as retired.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: worktree_guard_checklist_todo_retirement
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0095"
preserved_exact_tokens:
- "working_directory"
- "fail-closed"
- "real worktree root"
- "symlink alias"
- "unresolved-path aliases"
- "TODO / TODOs"
negative_constraints:
- "Checklist prose must not present real-worktree-root comparison or unresolved-alias rejection as open TODOs."
compatibility_only_notes: []
stale_retired_dispositions:
- "The stale TODOs for real-worktree-root comparison and unresolved-alias rejection are already-resolved owner canon."
owner_boundary_notes:
- "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-165 - GUI Config And Derived Event Projection Checklist

```yaml
plan_unit_id: F2-165
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  GuiConfig carries FileSafe config, the Config surface owns controls, orchestrator startup
  consumes the config without a second path, FileSafe UI messages are projections, and event-log
  viewers derive from seglog.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: gui_config_and_derived_event_projection_checklist
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0095"
preserved_exact_tokens:
- "GuiConfig"
- "Config surface"
- "FileSafe controls"
- "orchestrator startup"
- "UI messages"
- "event-log viewer"
- "seglog remains the canonical event source"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md"
- "FileSafe-related UI messages remain projections over canonical runtime/FileSafe state."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-166 - Phase 1 Core Guards Non Executable Sequence

```yaml
plan_unit_id: F2-166
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The implementation-order section preserves a non-executable sequencing guide for core guard
  modules, pattern loading, prompt checks, write scope, security filter, config persistence,
  BaseRunner integration, env vars, platform runners, event logging, pattern files, and unit
  tests.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: implementation_sequence_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: phase_1_core_guards_non_executable_sequence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0097"
preserved_exact_tokens:
- "Phase 1 -- Core guards"
- "src/filesafe/"
- "BashGuard"
- "check_prompt"
- "SecurityFilter"
- "GuiConfig"
- "BaseRunner"
- "PUPPET_MASTER_OPERATION_TYPE"
- "FileSafeEvent"
- "config/destructive-commands.txt"
- "Unit tests"
negative_constraints:
- "The implementation-order sequence is not a WorkNode, NodeSeed, executable queue, final node manifest, or production build task."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-167 - Phase 2 Config Wiring And Advanced GUI Sequence

```yaml
plan_unit_id: F2-167
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The implementation-order section preserves a non-executable guide for wiring GuiConfig.filesafe
  into PuppetMasterConfig.filesafe and exposing the Settings Advanced FileSafe Guards controls
  with persistence.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: implementation_sequence_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: phase_2_config_wiring_and_advanced_gui_sequence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0097"
preserved_exact_tokens:
- "Phase 2 -- Config wiring and GUI"
- "GuiConfig::filesafe"
- "PuppetMasterConfig::filesafe"
- "Advanced tab"
- "FileSafe Guards"
- "toggles"
- "warning override"
- "approved commands"
- "tooltips"
- "Persist approved_commands"
negative_constraints:
- "This sequence is planning guidance only and must not become an executable build queue."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-168 - Phase 3 Assistant Chat YOLO Recovery Sequence

```yaml
plan_unit_id: F2-168
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The implementation-order section preserves non-executable Assistant Chat and YOLO recovery
  guidance for warning chips, inline approval cards, terminal blocked output, timeouts, logging,
  and optional dashboard status.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: implementation_sequence_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: phase_3_assistant_chat_yolo_recovery_sequence
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0097"
preserved_exact_tokens:
- "Phase 3 -- Assistant Chat and YOLO"
- "warning chip"
- "YOLO active -- FileSafe guards still apply"
- "orange border"
- "Approve once"
- "Approve & add to list"
- "60s timeout"
- "[BLOCKED] Blocked by FileSafe"
- "Dashboard FileSafe status card"
negative_constraints:
- "This sequence is planning guidance only and must not become an executable build queue."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-169 - Prompt Pipeline Context Follow Up Boundary

```yaml
plan_unit_id: F2-169
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Prompt Pipeline owns context compiler, delta context, cache, handoff schemas, compaction marker,
  and skill bundling; FileSafe participates only through compiled-prompt checks and event logging
  integration.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: owner_boundary_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: prompt_pipeline_context_follow_up_boundary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0097"
preserved_exact_tokens:
- "Phase 4 -- Prompt Pipeline-owned context compilation follow-up"
- "context compiler"
- "delta context"
- "cache"
- "handoff schemas"
- "compaction marker"
- "skill bundling"
- "Plans/Prompt_Pipeline.md"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "Prompt_Pipeline.md owns context compilation follow-up behavior."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-170 - Implementation Risks Summary

```yaml
plan_unit_id: F2-170
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The implementation-order risk summary preserves plan metadata, resolved worktree path,
  OC-FILE-201/202 symlink-scope, and false-positive mitigation notes without reopening resolved
  owner canon.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: implementation_sequence_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: implementation_risks_summary
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0097"
preserved_exact_tokens:
- "Risks and mitigations"
- "get_allowed_files_for_current_subtask"
- "§11.1.1"
- "§11.1.3"
- "OC-FILE-201/202"
- "False positives"
- "Log all blocks"
negative_constraints:
- "Risk notes must not reopen resolved owner canon."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-171 - FileSafe Blocked Outcome Taxonomy

```yaml
plan_unit_id: F2-171
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  A FileSafe block integrates with the shared runtime blocked taxonomy as blocked_reason_code =
  filesafe_blocked, is not an execution failure, and is not auto-retryable.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_blocked_outcome_taxonomy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0099"
preserved_exact_tokens:
- "blocked_reason_code = filesafe_blocked"
- "not an execution failure"
- "not auto-retryable"
- "shared runtime blocked taxonomy"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-172 - Recovery Payload Field Canon

```yaml
plan_unit_id: F2-172
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe blocked-state payloads use canonical blocked fields including blocked_reason_code,
  ordered allowed_action_ids, blocked_sequence, preserved-local-work, prerequisites, and
  detail_ref, while deprecated allowed_actions and blocked_reason fields must not appear.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: recovery_payload_field_canon
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0100"
preserved_exact_tokens:
- "blocked_reason_code"
- "allowed_action_ids[]"
- "blocked_sequence"
- "preserved-local-work"
- "prerequisite metadata"
- "detail_ref?"
- "allowed_actions[]"
- "blocked_reason"
negative_constraints:
- "Deprecated field names such as allowed_actions[] and blocked_reason must not appear in new canonical schemas."
compatibility_only_notes: []
stale_retired_dispositions:
- "Deprecated blocked payload field names are retired for canonical FileSafe schemas."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-173 - Recovery Command Normalization And UI Projection

```yaml
plan_unit_id: F2-173
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Runtime and UI recovery surfaces expose exact recovery options, normalize graph-local labels to
  cmd.runtime command families, and keep UI_Command_Catalog as a projection over canonical
  FileSafe recovery payloads.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: recovery_command_normalization_and_ui_projection
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0100"
preserved_exact_tokens:
- "tool.denied"
- "cmd.runtime"
- "cmd.runtime.*"
- "Retry/Replan/Reopen/Approve/Deny"
- "UI_Command_Catalog.md"
- "Approve once"
- "Approve & add to list"
- "Cancel"
negative_constraints:
- "UI_Command_Catalog copy must not contradict runtime action IDs or allowed-action ordering."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "UI_Command_Catalog is a projection over canonical FileSafe recovery payloads."
owner_hints:
- "Plans/FileSafe.md"
```

### F2-174 - Account Pressure Recovery State Preservation

```yaml
plan_unit_id: F2-174
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe recovery preserves durable switch and account-pressure state including
  threshold_preemptive_switch, no eligible backup, confidence/source, soft or hard switching,
  no-backup-account, policy-disallowed, and role/account interactions.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: account_pressure_recovery_state_preservation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0100"
preserved_exact_tokens:
- "threshold_preemptive_switch"
- "no eligible backup"
- "confidence `/source`"
- "soft vs hard switching"
- "no-backup-account"
- "policy-disallowed"
- "role/account interactions"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-175 - Nonblocking Pressure And Bulk Recovery Preview Constraints

```yaml
plan_unit_id: F2-175
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Non-blocking pressure remains advisory until it changes execution authority, and bulk recovery
  actions require exact target previews rather than a generic confirmation.
gui_related: true
gui_classification_reason: >-
  This unit governs user-visible FileSafe UI or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: nonblocking_pressure_and_bulk_recovery_preview_constraints
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0100"
preserved_exact_tokens:
- "warning banner"
- "optional toast"
- "quiet period"
- "retry-many-node"
- "graph-patch-multiple-scope"
- "approve-many-HITL"
- "cleanup /remove"
- "/worktrees"
- "generic confirm"
negative_constraints:
- "Bulk recovery actions must not share one generic confirm."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-176 - Runtime Recovery Event Analytics Payload

```yaml
plan_unit_id: F2-176
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe event payloads must remain rich enough for analytics and recovery surfaces with
  guard_type, pattern_id or pattern name, timestamp, command_or_path_summary, recovery_allowed,
  and allowed_action_ids.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_recovery_event_analytics_payload
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0101"
preserved_exact_tokens:
- "guard_type"
- "pattern_id"
- "pattern name"
- "timestamp"
- "command_or_path_summary"
- "recovery_allowed"
- "allowed_action_ids[]"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-177 - Pre Execution FileSafe Block Safe Point Non Consumption

```yaml
plan_unit_id: F2-177
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  A FileSafe block that occurs before execution does not consume a mutation safe point and does
  not require rollback.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime, policy, integration, or governance behavior rather than visual
  presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: pre_execution_filesafe_block_safe_point_non_consumption
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0102"
preserved_exact_tokens:
- "pre-execution FileSafe block"
- "mutation safe point"
- "does not require rollback"
- "Safe-point interaction"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-178 - Runtime Blocked Outcome Acceptance Criteria

```yaml
plan_unit_id: F2-178
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe runtime integration is accepted only when blocks appear as blocked outcomes with
  explicit reason codes, are not auto-retried, present exact allowed actions when
  recovery-capable, and preserve analytics usability.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_blocked_outcome_acceptance_criteria
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0103"
preserved_exact_tokens:
- "blocked outcomes"
- "explicit reason codes"
- "not auto-retried"
- "exact allowed actions"
- "FileSafe analytics data remains usable after runtime integration"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-179 - FileSafe Denials As Blocked Outcomes

```yaml
plan_unit_id: F2-179
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe denials that stop execution classify as blocked_reason_code = filesafe_blocked blocked
  outcomes rather than generic execution failures, preserving completed local work when safe and
  emitting allowed recovery actions such as inspect denial, change policy, or rerun.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_denials_as_blocked_outcomes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0104"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0105"
preserved_exact_tokens:
- "FileSafe Blocked Outcome Alignment Addendum (2026-03-09)"
- "blocked outcomes"
- "not generic execution failures"
- "blocked_reason_code = filesafe_blocked"
- "preserve completed local work"
- "inspect denial"
- "change policy"
- "rerun"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-180 - Policy Safe Point Restore Before Retry

```yaml
plan_unit_id: F2-180
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  When policy requires a workspace rollback before retry, FileSafe must require safe-point restore
  before retry and must not silently convert the denial into a retryable transient error.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: policy_safe_point_restore_before_retry
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0105"
preserved_exact_tokens:
- "require safe-point restore before retry"
- "workspace must be rolled back to a known baseline"
- "retryable transient error"
negative_constraints:
- "FileSafe must not silently convert a denial into a retryable transient error."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-181 - Runtime Blocked Restore Override Mapping Scope

```yaml
plan_unit_id: F2-181
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  The FileSafe runtime blocked and restore override consolidation addendum defines FileSafe action
  mapping and persistence for blocked runtime episodes.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: runtime_blocked_restore_override_mapping_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0106"
preserved_exact_tokens:
- "FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)"
- "fileSafe Action Mapping and Persistence"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-182 - Canonical FileSafe Blocked Payload Fields

```yaml
plan_unit_id: F2-182
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe blocked payloads must use the canonical blocked payload fields blocked_reason_code =
  filesafe_blocked, allowed_action_ids, preserved_local_work, requires_safe_point_restore, and
  detail_ref.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: canonical_filesafe_blocked_payload_fields
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0107"
preserved_exact_tokens:
- "blocked_reason_code = filesafe_blocked"
- "allowed_action_ids[]"
- "preserved_local_work"
- "requires_safe_point_restore?"
- "detail_ref?"
- "canonical blocked payload"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-183 - Shared Action IDs And Local Affordance Labels

```yaml
plan_unit_id: F2-183
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Shared runtime action IDs remain the canonical recovery families, while labels such as Approve
  and add to allowlist and Edit and retry are FileSafe-local affordances unless the global action
  enum adopts them.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: shared_action_ids_and_local_affordance_labels
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0108"
preserved_exact_tokens:
- "Shared runtime action IDs"
- "canonical recovery families"
- "Approve and add to allowlist"
- "Edit and retry"
- "FileSafe-local affordances"
- "global action enum"
negative_constraints:
- "FileSafe-local affordance labels are not new shared runtime action IDs unless the global action enum explicitly adopts them."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-184 - FileSafe Blocked Action Mapping And Retired Field Names

```yaml
plan_unit_id: F2-184
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Runtime-facing FileSafe blocks use canonical blocked_reason_code plus ordered allowed_action_ids
  and may map safely offered local recovery to approve_once, filesafe_add_rule, and
  open_filesafe_settings while retiring recovery_options and allowed_actions as shared fields.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: filesafe_blocked_action_mapping_and_retired_field_names
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0108"
preserved_exact_tokens:
- "runtime-facing FileSafe blocks"
- "ordered `allowed_action_ids[]`"
- "approve_once"
- "filesafe_add_rule"
- "open_filesafe_settings"
- "recovery_options[]"
- "allowed_actions[]"
negative_constraints:
- "recovery_options[] and allowed_actions[] are not canonical shared runtime fields."
compatibility_only_notes: []
stale_retired_dispositions:
- "recovery_options[] and allowed_actions[] are retired/noncanonical for shared runtime payloads."
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-185 - Child Run And Rerun Identity Preservation

```yaml
plan_unit_id: F2-185
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  Child runs blocked by FileSafe remain child runs with canonical lineage and status history, and
  rerun or restore behavior preserves canonical child, run, and worktree identities.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: child_run_and_rerun_identity_preservation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0108"
preserved_exact_tokens:
- "child runs blocked by FileSafe"
- "canonical lineage"
- "status history"
- "canonical child/run/worktree identities"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-186 - Restore Override Rerun Path

```yaml
plan_unit_id: F2-186
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  filesafe_blocked is not retryable by default; if local changes happened before the block
  finalized, the projection exposes preserved_local_work and requires_safe_point_restore, and the
  only legal rerun path is restore_safe_point_then_retry.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: restore_override_rerun_path
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0109"
preserved_exact_tokens:
- "filesafe_blocked"
- "not retryable by default"
- "preserved_local_work = true"
- "requires_safe_point_restore = true"
- "restore_safe_point_then_retry"
negative_constraints:
- "When requires_safe_point_restore is true, restore_safe_point_then_retry is the only legal rerun path."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FileSafe.md"
```

### F2-187 - Persistent Runtime Episode And Handoff Reconstruction

```yaml
plan_unit_id: F2-187
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  A FileSafe block remains a persistent blocked runtime episode until resolved or superseded, does
  not define alternate child continuity or memory behavior, and uses canonical handoff
  reconstruction for rerun or restore after denial.
gui_related: false
gui_classification_reason: >-
  This unit defines runtime blocked-state, recovery, persistence, or migration behavior rather
  than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F2-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: filesafe_drift
reasoning_tier: standard
context_scope: filesafe_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: persistent_runtime_episode_and_handoff_reconstruction
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0110"
preserved_exact_tokens:
- "persistent blocked runtime episode"
- "resolved or superseded"
- "alternate child continuity"
- "alternate memory behavior"
- "canonical handoff reconstruction"
negative_constraints:
- "FileSafe does not define alternate child continuity or alternate memory behavior."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
- "Plans/FileSafe.md"
```

### F2-001 - FileSafe Retired Source-Preserving Bridge

```yaml
plan_unit_id: F2-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  F2-001 is retained only as migration-lineage compatibility disposition for the retired FileSafe
  source-preserving bridge. Product coverage has been atomized into F2-002 through F2-187, and
  F2-001 must not re-own FileSafe product spans or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: >-
  This retired bridge records migration lineage only; the old bridge span mentions GUI tokens, but
  product GUI coverage is owned by fine-grained FileSafe PlanUnits.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "F2-001 no longer uses source_preserving_planunit compile mode."
- "FileSafe-S0001 through FileSafe-S0110 remain covered by F2-002 through F2-187 or structural dispositions in coverage_map."
- "F2-001 maps only to retired bridge lineage FileSafe-S0113."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- "Plans/FileSafe.md"
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FileSafe-S0113"
preserved_exact_tokens:
- "F2-001"
- "source_preserving_planunit"
- "source_preserving_bridge_retired"
- "Owner / Consumer Map"
- "PlanUnits"
- "Migration Coverage"
- "FileSafe-S0113"
negative_constraints:
- "F2-001 must not re-own FileSafe-S0001 through FileSafe-S0110 product coverage."
- "F2-001 must not use node_compile_hint.mode=source_preserving_planunit."
- "Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge."
compatibility_only_notes:
- "F2-001 remains only as a retired source-preserving bridge audit record for migration lineage."
- "The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode."
stale_retired_dispositions:
- "The broad source-preserving bridge has been retired after Phase 2B batch 064."
owner_boundary_notes:
- "F2-002 through F2-187 own FileSafe product coverage for FileSafe-S0001 through FileSafe-S0110."
- "FileSafe-S0111, FileSafe-S0112, and FileSafe-S0114 are structural/coverage dispositions, not product coverage owned by F2-001."
owner_hints:
- "Plans/FileSafe.md"
```
