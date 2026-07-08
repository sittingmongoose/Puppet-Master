# Shard 021: PlanUnits

Source: `Plans/LSPSupport.md`

Source lines: L1084-L7028

Source SHA256: `85edce0f0aafbd82839fca9a59aaebb0f40ad381d63ed7393f8411a68c01f98c`

---

## PlanUnits

### LSPS-002 - MVP Scope Authority And Phasing

```yaml
plan_unit_id: LSPS-002
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP is in scope for the desktop MVP, including desktop editor integration, full LSP integration in the Chat Window, diagnostics for Assistant and Interview context, and the ordered implementation phases, while full editor implementation details remain owned by FileManager.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-002 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: mvp_scope_authority_and_phasing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0017
preserved_exact_tokens:
- LSP is MVP
- desktop MVP
- full LSP integration in the Chat Window
- LSP in the Chat Window
- Out of scope here
- Phasing
- FileManager.md
- assistant-chat-design.md
negative_constraints:
- Full editor implementation details stay in FileManager.md rather than this LSP-specific plan.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP scope and protocol/client constraints; Plans/FileManager.md owns full editor implementation details.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-003 - Authored Copy Alignment Boundary

```yaml
plan_unit_id: LSPS-003
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Authored tooltip, help, settings, and explanatory LSP copy follows the FinalGUISpec dual ELI5/Expert copy contract, while dynamic server-returned hover and diagnostic payloads are outside authored dual-copy enforcement.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-003 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: authored_copy_alignment_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0001
preserved_exact_tokens:
- ELI5/Expert copy alignment
- tooltip/help text
- FinalGUISpec.md §7.4.0
- server-returned hover/diagnostic payloads
- outside authored dual-copy enforcement
negative_constraints:
- Server-returned hover or diagnostic payloads are dynamic external content and are not authored dual-copy strings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FinalGUISpec.md owns the authored dual-copy contract; LSPSupport owns where that boundary applies to LSP surfaces.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md'
```

### LSPS-004 - Core LSP Capability Inventory

```yaml
plan_unit_id: LSPS-004
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP MVP capability inventory includes diagnostics, hover, autocomplete, navigation, inlay hints, semantic highlighting, code actions, code lens, signature help, timeout/cancellation, LSP status UI, per-server disable, fallback behavior, and diagnostics for LLM/Assistant context.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-004 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: core_lsp_capability_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0002
preserved_exact_tokens:
- Diagnostics
- Hover
- Autocomplete
- Navigation
- Inlay hints
- Semantic highlighting
- Code actions
- Code lens
- Signature help
- Request timeout and cancellation
- LSP status in UI
- Per-server enable/disable
- Fallback when LSP unavailable
- Diagnostics for LLM/Assistant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-005 - Feature Behavior Matrix And Fallback Contract

```yaml
plan_unit_id: LSPS-005
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Each LSP feature preserves its input, output, success, failure, edge-case, config-key, and fallback behavior, including timeout handling, stale-response discard, no-server behavior, and the shared fallback contract when LSP is unavailable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-005 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: feature_behavior_matrix_and_fallback_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0003
preserved_exact_tokens:
- Feature specification (inputs, outputs, behavior)
- Inputs
- Outputs
- Success
- Failure / edge cases
- Config keys
- Fallback when LSP unavailable
- lsp.<id>.disabled
- 'lsp: false'
- lsp.hoverTimeoutMs
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
- stale
- Timed out
negative_constraints:
- Unavailable LSP must not fabricate diagnostics, hover, completion, or healthy semantic capability state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### LSPS-006 - LSP Client Product Boundary

```yaml
plan_unit_id: LSPS-006
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Puppet Master is the LSP client and lifecycle owner for mainstream language servers, not a language-analysis engine or custom language server; default servers run as local stdio RPC processes by default, while remote workspaces use SSH placement, host-aware path mapping, and worktree-aware root resolution.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-006 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lsp_client_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0004
preserved_exact_tokens:
- LSP client
- language-analysis
- custom language-server
- rust-analyzer
- pyright
- gopls
- clangd
- slint-lsp
- stdio RPC processes
- /SSH
- /worktree-aware
- Semantic /symbols
- negotiated server capabilities
negative_constraints:
- PM must not act as a custom language-analysis engine for mainstream languages.
- Remote workspaces must not use a hidden local mirror as the LSP authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-007 - OpenCode Reference Input Boundary

```yaml
plan_unit_id: LSPS-007
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode LSP documentation and behavior are retained as reference input for built-in servers, diagnostics into LLM context, config schema, custom servers, automatic download controls, and license placement notes without making OpenCode the product owner.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-007 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_reference_input_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0006
preserved_exact_tokens:
- OpenCode Does It
- opencode.ai/docs/lsp/
- LLM can interact with the codebase
- diagnostics
- 30+ languages
- OPENCODE_DISABLE_LSP_DOWNLOAD=true
- Custom servers
- intelephense/license.txt
negative_constraints: []
compatibility_only_notes:
- OpenCode findings are reference input; Puppet Master retains its own supervised host-aware client architecture.
stale_retired_dispositions: []
owner_boundary_notes:
- OpenCode docs are external reference input; Plans/LSPSupport.md owns Puppet Master LSP behavior.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-008 - Server Catalog And Shipping Posture

```yaml
plan_unit_id: LSPS-008
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP server catalog supports the OpenCode-style built-in set plus slint-lsp while separating broad discovery/config support from the out-of-box default-managed or bundled set and from legal, toolchain, download, and manual-provisioning constraints.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-008 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: server_catalog_and_shipping_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0007
preserved_exact_tokens:
- Built-in LSP servers (full table)
- slint-lsp
- Broad catalog support
- GraphQL
- Dockerfile / Docker config
- TOML
- YAML
- Markdown
- /discovery/config
- /bundles/manages
- /auto-install
- /install
- /download
- /legal
- support target
- shipping posture
negative_constraints:
- Broad catalog support does not mean every server is bundled, auto-downloaded, or managed by default.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-009 - Host Aware Root Discovery

```yaml
plan_unit_id: LSPS-009
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP root discovery resolves sessions by host, server, and root identity from file context, server heuristics, explicit overrides, and remote host roots, with fallback to the nearest .git directory only after language-specific markers fail.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-009 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: host_aware_root_discovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0008
preserved_exact_tokens:
- Root discovery
- session reuse key
- (host_id, server_id, root_identity)
- remote host roots
- MUST NOT silently attach against a hidden local mirror
- package.json
- Cargo.toml
- go.mod
- pyproject.toml
- nearest `.git`
negative_constraints:
- Remote-mode projects use remote host roots and MUST NOT silently attach against a hidden local mirror.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Contracts_V0.md'
```

### LSPS-010 - Extension Conflict Visibility

```yaml
plan_unit_id: LSPS-010
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Overlapping LSP servers are resolved through explicit selection metadata, capability-family ownership, compatible supplementary families, and user-visible effective state in Settings > LSP and status surfaces.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-010 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: extension_conflict_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0009
preserved_exact_tokens:
- selection_mode
- selection_family
- primary_priority
- context_markers
- supplementary_families
- capability_profile
- degraded_attach_rules
- Settings > LSP
- status surfaces
negative_constraints:
- Remote or degraded attach rules must be explicit; the client must not fabricate healthy capability state when a server is disabled, unavailable, or partially attached.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md'
```

### LSPS-011 - Effective ServerSpec Selection Algorithm

```yaml
plan_unit_id: LSPS-011
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Effective ServerSpec selection records selectors, file/context conditions, command/env/init options, root discovery, platform restrictions, version and position-encoding metadata, provisioning hints, lifecycle state, and the closed selection_mode vocabulary before choosing primary and supplementary attachments.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-011 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: effective_serverspec_selection_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- ServerSpec
- language/extensions/selectors
- /extensions/selectors
- /files/conditions
- selection_mode
- standalone_primary
- contextual_primary
- supplementary_diagnostics
- standalone_diagnostics
- primary_priority
- server_id
- /specificity
- ts-js
- deno.json
- deno.jsonc
negative_constraints:
- Persisted registry values use underscore spellings rather than ad hoc short names or hyphenated storage values.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-012 - Diagnostics Source Identity And Merge Boundary

```yaml
plan_unit_id: LSPS-012
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostics integration preserves per-server source identity in storage and merges only for presentation surfaces such as Problems, editor markers, and Assistant/Interview context; diagnostics-only sidecars do not imply full completion, navigation, hover, or semantic capability.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-012 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostics_source_identity_and_merge_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- diagnostics-integration
- per `(server_id, session/root, uri)`
- Problems
- editor markers
- Assistant/Interview context
- supplementary_diagnostics
- standalone_diagnostics
- /cap/truncation
- per-server source identity
negative_constraints:
- Diagnostics integration is not a storage-flattening rule and must not erase per-server source identity.
- Diagnostics-only attachments must not imply full completion, navigation, hover, or semantic capability.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-013 - Native Client Architecture And Protocol Guardrails

```yaml
plan_unit_id: LSPS-013
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Puppet Master owns the LSP client architecture through host, supervisor, session, registry, workspace resolver, document store, sync engine, request broker, capability registry, diagnostics store, intelligence facade, and trace service, with conservative protocol lifecycle and FileSafe routing for mutation-capable edits.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-013 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: native_client_architecture_and_protocol_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- LspHost
- LspSupervisor
- LspSession
- LspSessionRegistry
- LspRegistry
- WorkspaceResolver
- DocumentStore
- DocumentSyncEngine
- LspRequestBroker
- CapabilityRegistry
- DiagnosticsStore
- LanguageIntelligenceFacade
- LspTraceService
- initialize -> initialized -> normal traffic -> shutdown -> exit
- FileSafe
- lsp-types
- tokio
- CancellationToken
negative_constraints:
- Dynamic registration stays disabled until PM can handle /unregister.
- Over-advertising unsupported snippets, resolve support, progress, workspace edit, or workspaceFolders behavior is forbidden.
- Rename, format, code action, and workspace edits always route through FileSafe.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-014 - OpenCode Compatibility Inputs And Rejections

```yaml
plan_unit_id: LSPS-014
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode-style registry findings are compatibility input for built-in/custom definitions, stdio transport, lazy spawn, root discovery, and diagnostics into Assistant context, while full-buffer or disk resync, uncontrolled auto-downloads, process duplication, weak status visibility, and unbounded backoff are rejected.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-014 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_compatibility_inputs_and_rejections
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- OpenCode-style registry findings
- built-in and custom server definitions
- local stdio transport
- lazy spawn
- per-server root discovery
- diagnostics into Assistant context
- /full-buffer-or-disk-resync
- uncontrolled auto-downloads
- session/process duplication
- weak status visibility
- unbounded /backoff/eviction
negative_constraints:
- PM must not copy weak OpenCode behavior such as uncontrolled auto-downloads, duplicate sessions/processes, weak status visibility, or unbounded backoff.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-015 - Tool Internal Event Ownership Boundary

```yaml
plan_unit_id: LSPS-015
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP internal-tool boundaries preserve run-scoped tool event records, mutation_capable apply-edit separation, formatter-vs-LSP ownership, DAE non-triggering host writes, plugin/tool telemetry, workspace-tab routing, and resolver-priority inputs without bypassing adjacent tool subsystems.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-015 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: tool_internal_event_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0010
preserved_exact_tokens:
- internal-tool
- run_id
- tool.invoked
- 'mutation_capable: bool'
- formatter-vs-LSP ownership
- DAE non-triggering host writes
- Formatters_System.md
- Plugins_System.md
- tool.* telemetry
- plugin tool IDs
- /workspace-tab
- multi-project routing
- apply-edit paths
- Resolver priority inputs
negative_constraints:
- Formatter, plugin, telemetry, policy, workspace-tab, multi-project, mutation-capable, and apply-edit paths must not bypass one another.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-016 - ESLint JS TS Reinforced Support

```yaml
plan_unit_id: LSPS-016
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: ESLint is reinforced as the primary lint and diagnostics LSP for ECMAScript/JavaScript and common TypeScript/Vue projects, with v10 flat-config root discovery, Problems/Assistant diagnostics integration, and JavaScript/TypeScript preset alignment.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-016 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: eslint_js_ts_reinforced_support
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0011
preserved_exact_tokens:
- ESLint
- ECMAScript/JavaScript
- ESLint v10
- flat config only
- eslint.config.js
- eslint.config.mjs
- eslint.config.ts
- 'Node.js: ^20.19.0, ^22.13.0, or >=24'
- VS Code ESLint server
- Problems panel
- LLM/Assistant context
- JavaScript/TypeScript preset
negative_constraints:
- Do not rely on legacy .eslintrc* for ESLint v10 projects.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-017 - Slint LSP Support

```yaml
plan_unit_id: LSPS-017
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Because the GUI rewrite is Rust plus Slint, slint-lsp is included for .slint files with diagnostics, completion, goto definition, live-preview, formatting support, PATH-based command availability, and Settings > LSP toggles/configuration.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-017 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: slint_lsp_support
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0012
preserved_exact_tokens:
- Rust + Slint
- slint-lsp
- .slint
- stdio
- Diagnostics
- code completion
- goto definition
- live-preview
- Code formatting
- cargo install slint-lsp
- Settings > LSP
negative_constraints:
- slint-lsp has no special command-line arguments; editors spawn the binary and use LSP over stdio.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-018 - OpenCode Server Ts Lazy Spawn Model

```yaml
plan_unit_id: LSPS-018
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: OpenCode server.ts remains an implementation reference for id/extensions/root/spawn registry shape, nearest-root discovery, one supervised process per host/server/root identity, lazy spawn, initialize handshake, config overrides, env, and initialization options.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-018 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: opencode_server_ts_lazy_spawn_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0013
preserved_exact_tokens:
- packages/opencode/src/lsp/server.ts
- id
- extensions[]
- root(file, host_context) -> root identity
- spawn(session_key)
- NearestRoot
- one process per effective host/root identity
- Lazy spawn
- initialize handshake
- initializationOptions
negative_constraints:
- The supervised session key remains host-aware even when OpenCode examples use a simpler discovered-root key.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-019 - Rust Client Stack Baseline

```yaml
plan_unit_id: LSPS-019
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The GUI-side LSP client baseline uses lsp-types plus an evaluated async stdio client stack, with tower-lsp and lsp-server style crates reserved for optional custom-server use rather than the desktop client foundation.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-019 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rust_client_stack_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0014
preserved_exact_tokens:
- Rust Stack (Client Side)
- lsp-types
- lsp-client
- async_lsp_client
- lsp-client-rs
- stdio
- tower-lsp
- lsp-server
- GUI-side client foundation
negative_constraints:
- tower-lsp and lsp-server are server-oriented and rejected as GUI-side client foundations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-020 - Editor DocumentStore And FileSafe Boundary

```yaml
plan_unit_id: LSPS-020
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The editor integrates LSP through a shared authoritative document store, sync barriers, document-scoped request gating, and FileSafe-backed workspace edit paths for rename, format, and code actions while preserving Search, diff/review, and chat restore ownership outside LSP.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-020 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_documentstore_and_filesafe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- shared authoritative document store
- sole authority for open-document text
- sync barriers
- stale document versions
- workspace edits
- FileSafe-backed mutation path
- LSP never becomes the owner of Search, diff/review, or chat restore semantics
negative_constraints:
- LSP never becomes the owner of Search, diff/review, or chat restore semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-021 - Editor UI Fallback Search And Index Separation

```yaml
plan_unit_id: LSPS-021
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Editor UI integration routes breadcrumbs, outline, symbols, hover, references, code actions, diagnostics, Problems, status copy, fallback navigation, code index, Search, and grep terminology through distinct owners so degraded LSP never masquerades as healthy semantic intelligence.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-021 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_ui_fallback_search_and_index_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- breadcrumbs
- outline
- go-to-symbol
- hover
- references
- code actions
- Problems
- fallback navigation/index behavior
- code index remains a SEPARATE /state-owning subsystem from LSP
- Search remains text-first
- grep
- Status-bar /search-language copy
negative_constraints:
- Fallback navigation/index behavior must not masquerade as healthy LSP state.
- Search remains text-first and must not become a second default symbol browser.
- grep and Search regex acceleration must not be labeled as LSP symbol health.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-022 - Rewrite Era LSP Consumer Routing

```yaml
plan_unit_id: LSPS-022
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Rewrite-era LSP consumers route stale FileManager references, Orchestrator/Tiers compatibility wording, storage/runtime identity, widget layout compatibility, event/addendum supersession, runtime artifacts, Crosswalk/Decision_Log traceability, and project status labels through current owner docs rather than preserving stale ownership.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-022 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rewrite_era_lsp_consumer_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0015
preserved_exact_tokens:
- Stale references to `FileManager.md §12.1.4`
- current FileManager §10 navigation/fallback contract
- Orchestrator_Page.md
- Tiers
- compatibility inputs only
- widget_layout:v1:orchestrator:progress
- Event/addendum supersession
- Runtime_Artifacts_Panel.md
- Decision_Log.md
- Crosswalk.md
- Project /status labels
negative_constraints:
- Cross-doc LSP consumers must not inherit stale Orchestrator UI ownership or tier-keyed widgets as concrete LSP presentation owners.
- Project health/status, code-index state, LSP attach state, and runtime capability state remain separate.
compatibility_only_notes:
- Legacy FileManager section references and Tiers/task/subtask vocabulary are compatibility inputs only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-023 - Chat LSP Capability And Placement

```yaml
plan_unit_id: LSPS-023
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat LSP provides read-only language-intelligence features in chat and assistant context when a thread has an associated project with running LSP servers, using editor server instances, real file URIs or virtual documents, degraded-state disclosure, Problems placement, status-bar health, and chat as a context/navigation consumer.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-023 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_lsp_capability_and_placement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0016
preserved_exact_tokens:
- Chat LSP
- read-only intelligence
- associated project
- LSP servers running
- code blocks
- virtual-document contract
- /Problems
- status-bar indicator
- chat is a context/navigation consumer
- Problems footer link
- /remote/status/chat
negative_constraints:
- Chat LSP is read-only for MVP and does not spawn a separate chat-only server pool.
- Chat is not another diagnostics owner.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-024 - Diagnostic To Chat Payload And Mutation Boundary

```yaml
plan_unit_id: LSPS-024
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostic-to-chat packaging uses the same diagnostic entry shape as the LSP evidence schema with session and URI refs; any later quick fix, code action, rename, or workspace edit from chat must open preview/confirmation and apply only through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-024 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostic_to_chat_payload_and_mutation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0016
preserved_exact_tokens:
- Diagnostic-to-chat pipeline behavior
- to-chat
- path
- line
- character
- severity
- message
- source
- code
- Error
- Warning
- Info
- Hint
- read-only for MVP
- preview/confirmation
- workspace/applyEdit
negative_constraints:
- Chat diagnostic context must not mutate directly from the message; later mutation workflows require explicit preview/confirmation and FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-025 - Registration Before Spawn Invariant

```yaml
plan_unit_id: LSPS-025
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: An LSP server is registered in the session map before its process is spawned; asynchronous startup registers a cancellable lifecycle-tracker before subprocess creation or watcher launch, and spawn or handshake failure marks or cleans up the session record.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-025 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: registration_before_spawn_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0019
preserved_exact_tokens:
- Registration-before-spawn invariant
- MUST be registered
- (host_id, server_id, root_identity)
- lifecycle-tracker
- starting
- ready
- failed
- Acquire the session-map write lock
- Spawn the subprocess
negative_constraints:
- Spawning before registration is forbidden because it creates an untracked process window.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md'
```

### LSPS-026 - Server Failure Timeout Recovery UI

```yaml
plan_unit_id: LSPS-026
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP failure and timeout handling marks server state, clears diagnostics for owned documents, refreshes Problems and gutter, shows Error or Waiting states in status surfaces, offers restart behavior with bounded backoff, logs stderr details, and never blocks the UI thread.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-026 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: server_failure_timeout_recovery_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Server crash or exit
- Error
- DiagnosticsCache
- Problems panel
- gutter
- Restart language server
- 1s, 2s, 4s, cap 30s
- Server slow or unresponsive
- Timed out
- Waiting for language server...
- never block UI thread
- stderr tail
negative_constraints:
- LSP requests must never block the UI thread.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-027 - Document Scale And Sync Pressure Controls

```yaml
plan_unit_id: LSPS-027
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP client controls scale pressure by limiting open documents per server, sending didClose on buffer eviction, capping initialize roots, debouncing didChange at the default interval, preferring incremental contentChanges when supported, and avoiding thousands of initialize paths.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-027 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: document_scale_and_sync_pressure_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Many open documents
- max 50 open docs per server
- didClose
- Large workspace at init
- capped at 10
- do not send thousands of paths
- didChange flood
- 100 ms
- contentChanges
- full content
negative_constraints:
- Initialize must not send thousands of paths.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-028 - FileManager Fallback Symbol Boundary

```yaml
plan_unit_id: LSPS-028
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: When LSP diagnostics and symbols are unavailable, FileManager remains responsible for regex, heuristic, or indexed fallback symbol navigation and optional install hints, while the LSP client does not own the symbol index path.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-028 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: filemanager_fallback_symbol_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
preserved_exact_tokens:
- Symbol index staleness (without LSP)
- FileManager §10.2
- Diagnostics and symbols come from server
- regex/heuristic symbol path
- optional install hint
- 'Client: No action for index'
- fallback is editor/FileManager responsibility
negative_constraints:
- Fallback symbol behavior must not claim healthy LSP diagnostics or semantic symbol state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FileManager.md owns fallback symbol navigation; Plans/LSPSupport.md owns the LSP unavailable boundary.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-029 - Stdio Bridge TCP Boundary

```yaml
plan_unit_id: LSPS-029
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The MVP LSP client speaks stdio only; TCP-only servers such as Godot are supported through custom stdio bridge commands like godot-lsp-stdio-bridge, while native TCP/socket support remains out of scope for MVP.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-029 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stdio_bridge_tcp_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0024
preserved_exact_tokens:
- TCP-only servers
- Godot
- GDScript LSP
- npx godot-lsp-stdio-bridge
- .gd
- .gdshader
- stdio-to-TCP bridge
- Binary-safe buffers
- auto port discovery
- 6005, 6007, 6008
- Windows URI normalization
- Native TCP/socket
- Out of scope for MVP
- use a bridge
negative_constraints:
- Native TCP/socket support is out of scope for MVP.
- The MVP client does not implement TCP transport; it documents bridge usage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-030 - MVP Operation Inventory And Result Envelope

```yaml
plan_unit_id: LSPS-030
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The canonical MVP LSP surface preserves its operation inventory, normalized parameter fields, and result status envelope using operation, query, path, position, newName, status, and the ok, partial, unavailable, or error status values.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-030 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: mvp_operation_inventory_and_result_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0021
preserved_exact_tokens:
- operation
- query
- path
- position
- newName
- status
- ok | partial | unavailable | error
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename
negative_constraints:
- Stale aliases, short names, or ad hoc result envelopes are retired in favor of the canonical status envelope.
compatibility_only_notes: []
stale_retired_dispositions:
- Stale aliases, short names, or ad hoc result envelopes are retired in favor of LSPSupport §9.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-031 - Rename Alias And Approval Gate

```yaml
plan_unit_id: LSPS-031
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The write-capable rename operation is approval-gated, requires path, position, and newName, and treats lsp_rename as a legacy alias for rename rather than a second operation over the nine read-only operation surface.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-031 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: rename_alias_and_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0021
preserved_exact_tokens:
- nine read-only operations
- one write/approval-gated `rename`
- lsp_rename
- legacy alias
- not a second operation
- path + position + newName
- approval-gated
negative_constraints:
- lsp_rename must not become a second operation distinct from rename.
- rename is write-capable and approval-gated.
compatibility_only_notes: []
stale_retired_dispositions:
- The packetization label `10 read-only + 1 write-gated (lsp_rename)` is reconciled by treating `lsp_rename` as a legacy alias.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-032 - Phase 1 Core LSP Outcome

```yaml
plan_unit_id: LSPS-032
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 ships the core LSP client, server registry, document sync, diagnostics, hover, completion, Problems integration, status UI, and explicit fallback behavior as the foundation before navigation and chat enhancements.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-032 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_core_lsp_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 1 -- Core LSP
- Rust LSP client crate
- Server registry
- Document sync
- didOpen / didChange
- Diagnostics
- Problems panel
- Hover
- Completion
- LSP status in UI
- Fallback when LSP unavailable
- Phase 1 outcome
negative_constraints:
- Phase 1 must retain explicit fallback behavior when no server is available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-033 - Phase 2 Editor Chat Settings Outcome

```yaml
plan_unit_id: LSPS-033
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 adds editor navigation and editing features, inlay and semantic features, code actions and code lens, signature help, timeout/cancellation, per-server enable/disable, Settings > LSP, bridge pattern, Chat LSP, and diagnostics for Assistant/Interview context.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-033 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_editor_chat_settings_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 2 -- Editor navigation + Chat LSP
- textDocument/references
- Find references
- Rename with FileSafe
- textDocument/formatting
- Inlay hints
- semantic highlighting
- code actions
- code lens
- signature help
- Settings > LSP
- Chat LSP
- Diagnostics for LLM/Assistant
- Phase 2 outcome
negative_constraints:
- Rename and formatting use FileSafe-backed paths rather than direct mutation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-034 - Phase 3 Optional Evidence And Chat Enhancements

```yaml
plan_unit_id: LSPS-034
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 3 optional enhancements may add the LSP diagnostics verification gate, LSP snapshot in evidence, chat fix/rename/usage/format affordances, lsp tool promotion, and advanced protocol requests without moving optional work into MVP foundations.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-034 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_optional_evidence_and_chat_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Phase 3 -- Additional enhancements (§9.1)
- LSP diagnostics verification gate
- LSP snapshot in evidence
- Chat "Fix all"
- Rename
- Where is this used?
- Format file
- promote lsp tool
- Go to type definition
- call hierarchy
- document highlight
- Interview "structure of file"
negative_constraints:
- Optional Phase 3 enhancements must not be treated as required before the MVP LSP foundation and Phase 2 surfaces.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-035 - Implementation Checklist Non Executable Guide

```yaml
plan_unit_id: LSPS-035
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation checklist is an ordered non-executable guide that preserves LSP feature and edge-case inventory without creating WorkNodes, queues, node manifests, or production build tasks.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-035 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: implementation_checklist_non_executable_guide
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0027
preserved_exact_tokens:
- Implementation checklist
- Choose and integrate Rust LSP client crate
- Implement server registry
- Document sync
- Diagnostics
- Hover
- Completion
- Navigation
- Inlay hints
- Semantic highlighting
- Code actions
- Code lens
- Signature help
- Request timeout and cancellation
- Per-server enable/disable
- Additional enhancements (§9.1)
negative_constraints:
- The checklist is not a WorkNode, NodeSeed, executable queue, final node manifest, or production build task.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-036 - Settings LSP Registry Controls

```yaml
plan_unit_id: LSPS-036
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Settings > LSP is a searchable registry-management surface with global enable/disable, support-catalog search and filtering, per-server toggles, custom server add/edit/remove, command/config validation, and requested versus effective attach-state disclosure.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-036 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: settings_lsp_registry_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- Settings > LSP
- searchable registry-management surface
- globally enable or disable LSP
- search and filter the full support catalog
- enable or disable catalog entries
- add custom servers
- requested vs effective attach state
- Settings > LSP lists all servers and custom entries with validation
- global master toggle
- /filterable
- add custom server /form
- malformed command/config validation
negative_constraints:
- Settings > LSP is not a flat toggle list.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-037 - Registry Row Inspector Metadata

```yaml
plan_unit_id: LSPS-037
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP registry rows and inspector detail panes expose languages, selectors, source and classification badges, install/toolchain provenance, effective state, path/exclusion controls, built-in override and reset actions, canonical names, aliases, provisioning, platform, command/env/init fields, and validation errors.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-037 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: registry_row_inspector_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- /languages
- /selectors
- Microsoft
- OpenCode
- PM
- Custom
- Default managed
- Manual/toolchain
- Experimental
- /install
- /toolchain
- /effective-state
- Override
- Reset to catalog defaults
- two-level Settings navigation model
- /filtering
- /filter/grouping
- lifecycle state
- /provisioning
- platform restrictions
- validation errors
negative_constraints:
- Settings detail panes must not become the SSOT for runtime attachment.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-038 - Cross Surface LSP Owner Boundaries

```yaml
plan_unit_id: LSPS-038
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: File Manager and editor consume LSP state for semantic affordances, Search remains owner of text search and replace-in-files, Problems remains owner of aggregated diagnostics display, and status surfaces disclose freshness, health, and effective capability state.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-038 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: cross_surface_lsp_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0028
preserved_exact_tokens:
- File Manager and editor consume LSP state
- Search remains the owner of text search and replace-in-files
- Problems remains the owner of aggregated diagnostics display
- status surfaces disclose freshness, health, and effective capability state
- degraded attach conditions
negative_constraints:
- LSP must not take ownership of Search text search/replace-in-files or Problems aggregation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/FileManager.md and editor surfaces consume LSP state; Search and Problems retain their own owner boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-039 - Worktree Root Identity Lifecycle

```yaml
plan_unit_id: LSPS-039
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP sessions for worktree files are keyed by host, server, and canonical on-host worktree root_identity; worktree sessions may warm-start, shut down when the worktree is removed, and remain alive across thread switches until the worktree lifecycle ends.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-039 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: worktree_root_identity_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0030
preserved_exact_tokens:
- Worktree root_identity handling
- (host_id, server_id, root_identity)
- canonical on-host worktree path
- root_identity = worktree_path
- warm-start
- worktree is removed
- shut down gracefully
- Switching threads does NOT kill LSP sessions
- session lifecycle is tied to worktree existence
negative_constraints:
- A worktree LSP root_identity must not use a raw path copied across hosts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
```

### LSPS-040 - Remote SSH Stdio Transport

```yaml
plan_unit_id: LSPS-040
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP uses SSH as a stdio tunnel rather than a port-forwarded secondary protocol, spawning remote servers through the SSH connection, multiplexing channels, reinitializing after reconnect, applying a remote timeout multiplier, and avoiding hidden local sync or mirror behavior.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-040 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_ssh_stdio_transport
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Remote LSP over SSH transport
- stdio over SSH
- rather than exposed by port forwarding
- SSH connection established → remote LSP server spawned → stdio streams connected → initialize handshake → ready
- multiplexed channels
- re-initialized
- timeout multiplier
- default `3x`
- no hidden local sync or mirror
negative_constraints:
- Remote LSP does not use a port-forwarded secondary protocol or hidden local sync/mirror for LSP operations.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-041 - Remote Identity And Path Mapping

```yaml
plan_unit_id: LSPS-041
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP identity preserves user-visible SSH authority, remote-host and working-folder path authority, host-scoped path mapping, and live host/server/root session keys while forbidding hidden mirrors, silent multi-context retargeting, and local-only session-key collisions.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-041 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_identity_and_path_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- user@host:/path/to/project
- /path/to/project
- remote project identity
- remote-host
- working-folder
- user@host:remote/path
- must not create a hidden local `/mirror`
- must not silently retarget `/multi-context` work
- visible `/risk` reason
- stale local-only phrase `(server_id, root)`
- (host_id, server_id, root_identity)
- host-scoped `/path-mapping`
negative_constraints:
- Puppet Master must not create a hidden local mirror, silently retarget multi-context work to local host, or let host-local URI collisions occur.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-042 - Remote Degraded UX And SSH Owner Boundary

```yaml
plan_unit_id: LSPS-042
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Remote LSP degraded and connection-loss states follow FileManager and SSH owner patterns by showing Connection lost, Reconnect, Work offline when a validated cache exists, system keychain/agent credential handling, Settings > SSH capability/degraded copy, and shared read-only/offline vocabulary.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-042 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_degraded_ux_and_ssh_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Connection lost
- Reconnect
- Work offline (cached files only)
- validated cache
- system keychain/agent flows
- ssh_connections
- current SSH remote profile model
- one-auto-retry
- Settings > SSH
- /read-only/offline/refresh
- /offline/degraded
- /enabled
- unavailable vocabulary
negative_constraints:
- Settings > SSH and GUI remote-editor surfaces consume the SSH owner contract instead of redefining it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-043 - Remote Mutation Outage And FileSafe Boundary

```yaml
plan_unit_id: LSPS-043
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: 'Remote LSP mutation and outage modes remain visible and FileSafe-gated: rename, broad format, and multi-file code actions require preview confirmation; partial failures report per-file results; remote modes disclose full, diagnostics-only, or no-LSP state; adjacent Search, Source Control, Problems, buffers, and diffs do not silently fall back.'
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-043 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: remote_mutation_outage_and_filesafe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Remote mutation and availability modes
- preview `/confirmation`
- partial workspace-edit failure reports per-file results
- read-only, locked, unavailable, or `/degraded`
- full_remote_lsp
- degraded_remote_diagnostics_only
- remote_edit_no_lsp
- unsupported local-LSP-on-remote-paths
- must not silently fall back to local Git
- stale snapshots
- /offline/pending-sync
- Hunk-level `/diff` interaction
negative_constraints:
- Remote Source Control must not silently fall back to local Git.
- Preview-worthy remote mutations require the same safe preview/confirmation path as FileSafe edits.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-044 - Stale Browser And Recovery Exclusion

```yaml
plan_unit_id: LSPS-044
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: 'Browser preview and recovery residue must not re-enter LSP wording: browser-panel tokens stay owned by FileManager, FinalGUISpec, or storage cleanup, while recover-unsaved remains an editor/storage recovery contract outside the LSP session key.'
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-044 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stale_browser_and_recovery_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0031
preserved_exact_tokens:
- Bottom Panel Browser tab (§7.20)
- preview_mode = browser_panel
- preview_mode
- recover-unsaved
- editor/storage recovery contract
- outside the LSP session key
negative_constraints:
- Browser and recovery residue must not be reintroduced through LSP wording.
compatibility_only_notes:
- Browser-panel and preview_mode tokens are compatibility cleanup residue owned outside LSPSupport.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-045 - Editor Crate LSP Module Layout

```yaml
plan_unit_id: LSPS-045
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP client and registry live in the same crate as the editor under a dedicated src/lsp module with client, registry, session/server_handle, document/sync files and lsp-types plus tokio dependencies, while tower-lsp is unnecessary unless implementing a server.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-045 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_crate_lsp_module_layout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0032
preserved_exact_tokens:
- same crate as the editor
- src/lsp/
- client.rs
- registry.rs
- session.rs
- server_handle.rs
- document.rs
- sync.rs
- lsp-types
- tokio
- No need for tower-lsp unless implementing a server
negative_constraints:
- tower-lsp is not required for the GUI-side LSP client unless Puppet Master implements an LSP server.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-046 - LSP Data Projection Shapes

```yaml
plan_unit_id: LSPS-046
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Core LSP conceptual structures preserve LspSessionKey, LspSessionProjection, and DocumentBinding fields for project, host, server, root, lifecycle, freshness, health, enablement, capability, restart, error, path, version, and attached server identity.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-046 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lsp_data_projection_shapes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- LspSessionKey
- project_id
- host_id
- server_id
- root_identity
- LspSessionProjection
- lifecycle_state
- freshness
- health
- requested_enabled
- effective_enabled
- capability_summary
- restart_budget
- last_error
- DocumentBinding
- document_id
- version
- attached_servers[]
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-047 - Lifecycle State Machine And Resource Limits

```yaml
plan_unit_id: LSPS-047
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP lifecycle uses canonical user/state names and lower-level state transitions from stopped through ready, degraded, stopping, crashed, and restart, with resource limits for server memory and request CPU time.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-047 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lifecycle_state_machine_and_resource_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- Starting
- Initializing
- Ready
- RestartBackoff
- Degraded
- ShuttingDown
- Stopped
- stopped → starting → initializing → ready → degraded → stopping → crashed
- max 3 attempts
- 2s/4s/8s
- 512MB
- 30s
negative_constraints:
- Only Ready emits normal feature traffic; degraded and restart states expose reduced capability or recovery status.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-048 - Supervisor DocumentStore Authority

```yaml
plan_unit_id: LSPS-048
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LspSupervisor plus DocumentStore is the authority boundary for document panes, editor tabs, chat virtual documents, restore/reload, revert, pending-sync state, virtual/real URI identity, and didSave emission after successful shared-store save.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-048 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: supervisor_documentstore_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0033
preserved_exact_tokens:
- LspSupervisor
- DocumentStore
- /document-pane
- editor tabs
- chat virtual documents
- restore/reload
- /revert
- same authoritative buffer
- pending-sync state
- virtual-doc and real-file URI values do not collide
- didSave is emitted only after the shared document store records a successful save
negative_constraints:
- LSP never reads a second document authority for an open file.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-049 - Async Message Flow And UI Dispatch

```yaml
plan_unit_id: LSPS-049
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP message flow covers open, edit, diagnostics, hover, and completion while keeping all protocol I/O on async tasks and routing UI updates through the Slint event loop rather than blocking the interface.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-049 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: async_message_flow_and_ui_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- User opens file
- User edits
- publishDiagnostics
- User hovers
- User triggers completion
- tokio
- slint::invoke_from_event_loop
- Weak::upgrade_in_event_loop
- Never block UI on LSP
negative_constraints:
- UI must never block on LSP protocol I/O.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-050 - Stale Latest Request Contract

```yaml
plan_unit_id: LSPS-050
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Document-scoped LSP responses carry enough identity to discard stale or superseded replies by session epoch, URI, document version, request generation, and request class; discarded UX replies remain trace-visible and are not automatically re-requested.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-050 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: stale_latest_request_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- Stale response policy
- document_version
- session_epoch
- uri
- request_generation
- latest-of-class marker
- discard
- Do not automatically re-request
- trace `/logs`
- request id
negative_constraints:
- Stale document-scoped responses must not update UI, apply completion, navigate, or auto re-request.
compatibility_only_notes: []
stale_retired_dispositions:
- Late replies are discarded in UX but remain visible in trace logs.
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-051 - DocumentUri And Position Encoding Contract

```yaml
plan_unit_id: LSPS-051
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Document identity, freshness, and position conversion use one canonical DocumentUri per document and host, a centralized position-mapping layer, UI 1-based and LSP 0-based boundaries, negotiated position encoding with UTF-16 baseline, and no handler-local code-unit math.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-051 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: documenturi_and_position_encoding_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- DocumentUri
- case
- /slash/drive-letter
- URI spelling
- /path/position
- UI/editor surfaces stay 1-based
- LSP boundary remains 0-based
- position-mapper
- capabilities.positionEncoding
- position_encoding
- UTF-16
- utf-8
- no hand-rolled code-unit math
negative_constraints:
- The same physical file must not gain duplicate identities through case, slash, drive-letter, URI spelling, session/URI pairing, or path/position conversion differences.
- Individual feature handlers must not hand-roll code-unit math.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-052 - Sync Ordering Coalescing And Save Semantics

```yaml
plan_unit_id: LSPS-052
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Sync ordering is FIFO per session, document-scoped requests wait for Ready and sync barriers, soft requests keep only the newest request class, didChange debounce coalesces mutations, whole-document replacement or restart rebases when incremental confidence is lost, and failed saves do not emit didSave or imply synchronization.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-052 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: sync_ordering_coalescing_and_save_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0034
preserved_exact_tokens:
- Sync events are FIFO per session
- Ready
- pending-sync state
- newest pending request per document `/request-class`
- definition, references, rename, format, and `codeAction`
- sync barrier
- resetting `/coalescing`
- whole-document replacement
- restart the session
- Failed save does not emit `didSave`
negative_constraints:
- Failed save does not emit didSave and stale-result handling must not make the UI look saved or synchronized.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-053 - Config Namespace And Legacy Alias

```yaml
plan_unit_id: LSPS-053
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP config uses lsp.enabled and lsp.servers.<id>.* keys for disable, command, extensions, env, and initialization while supporting lsp.<id>.disabled as a read/write compatibility alias aligned with OpenCode schema.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-053 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_namespace_and_legacy_alias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0035
preserved_exact_tokens:
- lsp.enabled
- lsp.servers.<id>.disabled
- lsp.servers.<id>.command
- lsp.servers.<id>.extensions
- lsp.servers.<id>.env
- lsp.servers.<id>.initialization
- lsp.<id>.disabled
- read/write maps
- OpenCode schema
negative_constraints:
- The legacy alias must map to the canonical lsp.servers.<id>.disabled namespace rather than creating a second config family.
compatibility_only_notes:
- lsp.<id>.disabled is a legacy compatibility alias.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-054 - Config Storage And Timeout Controls

```yaml
plan_unit_id: LSPS-054
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP configuration stores app-level and optional project-level overrides with debounced change, hover, completion, workspace symbol, and hover-delay timeout controls documented in Settings or developer-facing implementation guidance.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-054 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_storage_and_timeout_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0035
preserved_exact_tokens:
- redb
- config.lsp
- .puppet-master/lsp.json
- lsp.didChangeDebounceMs
- default 100
- range 50-500
- lsp.hoverTimeoutMs
- default 5000
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
- default 10000
- lsp.hoverDelayMs
- default 300
- range 100-1000
- Settings → Editor or Developer
negative_constraints:
- Timeout and debounce defaults must remain user-configurable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-055 - Trigger And Refresh Behavior

```yaml
plan_unit_id: LSPS-055
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP triggers and refresh behavior cover completion trigger kinds, hover idle delay and cancellation, inlay hint refresh on document activity or visible range, code action requests from UI affordances with diagnostics context, and signature help trigger behavior.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-055 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: trigger_and_refresh_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0036
preserved_exact_tokens:
- Completion
- all characters
- Ctrl+Space
- CompletionContext
- triggerKind
- Hover
- 300 ms
- cancel previous hover request on cursor move
- Inlay hints
- visible range change
- Code actions
- context menu open
- lightbulb click
- CodeActionContext
- Signature help
negative_constraints:
- Hover requests must be delayed and canceled on cursor movement to avoid flooding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-056 - workspaceFolders Initialize Policy

```yaml
plan_unit_id: LSPS-056
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspaceFolders initialization sends only roots with at least one open document, capped at ten roots, with single-root fallback when no files are open and no required reinitialize when later opening files in a new root.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-056 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: workspacefolders_initialize_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0037
preserved_exact_tokens:
- workspaceFolders policy
- only roots that have at least one open document
- capped at 10 roots
- If user has no open files, send project root if single-root, else empty list
- Re-initialize not required
- matching host-aware server session
negative_constraints:
- Initialize should not send broad workspaceFolders beyond the open-document root cap.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-057 - Chat Virtual Document Identity And Creation

```yaml
plan_unit_id: LSPS-057
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat code blocks not backed by project files use dedicated virtual-document URIs, one opaque block identity, language tags, and the effective host/root LSP session for that language; code blocks mapped to real project files use the real file URI instead.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-057 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_virtual_document_identity_and_creation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0038
preserved_exact_tokens:
- Virtual documents (Chat code blocks)
- puppet-master-virtual://chat/{language_id}/{opaque_id}
- language_id
- opaque_id
- UUID or message-id + block index
- real file URI
- same `(host_id, server_id, root_identity)`
- effective host context
- textDocument/didOpen
negative_constraints:
- Virtual URI never points to disk and real project-file snippets use the real file URI instead.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-058 - Chat Virtual Document Lifecycle And Immutability

```yaml
plan_unit_id: LSPS-058
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat virtual documents send didOpen only when a block needs LSP, send didClose on view eviction or idle cleanup, may retain a small recent set, do not send didChange for immutable blocks, and create a new opaque identity when edited content changes.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-058 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: chat_virtual_document_lifecycle_and_immutability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0038
preserved_exact_tokens:
- didOpen
- didClose
- scrolls away
- message is collapsed
- Chat view is closed
- 300 s
- last 5
- Do not send `didChange` for virtual docs
- blocks are immutable
- new opaque_id
- one virtual doc per code block instance
negative_constraints:
- Virtual document blocks are immutable for LSP sync; edited message content is treated as a new block identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-059 - ServerSpec Minimum Field Set

```yaml
plan_unit_id: LSPS-059
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: ServerSpec is the canonical machine-friendly catalog record for built-in and custom LSP servers and includes server identity, provenance, language selectors, platform/requirement/root rules, selection metadata, support classification, enablement, provisioning, launch, initialization, host support, and degraded attach fields.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-059 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: serverspec_minimum_field_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- ServerSpec
- server_id
- display_name
- sources[]
- source_names[]
- aliases[]
- kind
- language_tags[]
- extensions[]
- selectors[]
- file_globs[]
- platforms[]
- requirements[]
- root_rules
- root_discovery_mode
- selection_mode
- selection_family
- primary_priority
- support_classification
- host_support
- degraded_attach_rules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-060 - Catalog Union And Layering SSOT

```yaml
plan_unit_id: LSPS-060
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The effective support catalog is the deduplicated union of Microsoft implementor data, OpenCode catalog data, and Puppet Master overlay metadata; user enablement and custom server settings layer on top, and generated readable/settings/docs views do not replace the registry SSOT.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-060 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: catalog_union_and_layering_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- deduped union
- Microsoft implementor data
- OpenCode catalog data
- Puppet Master overlay metadata
- user enable/disable
- custom-server settings layer on top
- derived prose tables
- /readable
- /settings/docs
- SSOT
negative_constraints:
- Derived prose tables and settings/docs views must not become the catalog SSOT.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-061 - Support Classification And Effective Resolution

```yaml
plan_unit_id: LSPS-061
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Support classification stays separate from server identity and effective state, using supported-by-registry, default-managed, toolchain-bound/manual, experimental/degraded, and deprecated/replaced outcomes layered through catalog base, global override, project override, runtime availability, and effective-state evaluation.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, routing, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-061 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: support_classification_and_effective_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0039
preserved_exact_tokens:
- Support scope and support classification
- /catalog
- supported-by-registry
- default-managed
- toolchain-bound `/manual`
- experimental `/degraded`
- deprecated or `/replaced`
- catalog base entry
- global override
- project override
- runtime availability
- /effective-state
negative_constraints:
- Support classification outcomes must not fork stable server_id identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-062 - Implementation Foundation Lifecycle And Sync
```yaml
plan_unit_id: LSPS-062
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation phase guide requires a foundation with client crate integration, in-memory registry, config loading, spawn/lifecycle, stdio transport, initialize handshake, shutdown/exit, and document sync with debounce, versioning, didClose, didSave, and incremental sync when supported.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-062 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: implementation_foundation_lifecycle_and_sync
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Foundation
- Spawn and lifecycle
- Document sync
- LSP client crate integrated
- server registry (in-memory)
- config loading
- Spawn server process per (id, root)
- stdio transport
- initialize handshake
- shutdown/exit
- didOpen
- didChange (debounced)
- didClose
- didSave
- version tracking
- incremental sync
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-063 - Diagnostics Problems And Gutter Acceptance
```yaml
plan_unit_id: LSPS-063
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Diagnostics implementation subscribes to publishDiagnostics, stores diagnostics per URI, exposes them to the UI, and accepts completion when Problems shows errors and warnings, gutter markers render, and clicking opens the file at the diagnostic line.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-063 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostics_problems_and_gutter_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Diagnostics
- publishDiagnostics
- store per URI
- expose to UI
- Problems tab
- errors/warnings
- gutter shows markers
- click opens file at line
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-064 - Hover Completion Navigation Acceptance
```yaml
plan_unit_id: LSPS-064
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Hover, completion, documentSymbol, definition, references, breadcrumbs, and go-to-symbol features use LSP when available, enforce timeout/cancel/stale handling, and accept completion when hover, completion, breadcrumbs, symbol, and definition navigation work correctly.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-064 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: hover_completion_navigation_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Hover and completion
- textDocument/hover
- textDocument/completion
- timeout and cancel
- tooltip
- completion list
- stale responses discarded
- Navigation
- documentSymbol
- textDocument/definition
- references
- breadcrumbs
- go-to-symbol
negative_constraints:
- Stale hover/completion/navigation responses must be discarded.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-065 - Editor Semantic Feature Acceptance
```yaml
plan_unit_id: LSPS-065
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Inlay hints, semantic tokens, signature help, code actions, and code lens render or invoke through editor affordances, with code actions and workspace edits routed through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-065 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: editor_semantic_feature_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Inlay hints
- semantic tokens
- signature help
- Code actions and code lens
- codeAction
- codeLens
- workspace/applyEdit through FileSafe
- Quick fixes appear and apply correctly
- code lens links invoke
negative_constraints:
- Code actions and workspace edits must route through FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-066 - Status Fallback Acceptance
```yaml
plan_unit_id: LSPS-066
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Status and fallback behavior show LSP state in the status bar, honor per-server enable/disable, use heuristic fallback when no server is available, and may show optional install hints without claiming healthy LSP capability.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-066 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: status_fallback_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- Status and fallback
- LSP status in status bar
- per-server enable/disable
- fallback to heuristic
- optional install hint
- Status bar shows server state
- disabling server stops LSP
- heuristic outline used when LSP off
negative_constraints:
- Fallback heuristic behavior must not masquerade as healthy LSP state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-067 - LLM Diagnostics Context Acceptance
```yaml
plan_unit_id: LSPS-067
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Current diagnostics are included in Assistant and Interview context so agents receive diagnostic lists for relevant files when composing context.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-067 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: llm_diagnostics_context_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0040
preserved_exact_tokens:
- LLM diagnostics
- Include current diagnostics in Assistant/Interview context
- Agent receives diagnostic list
- relevant files
- composing context
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-068 - Config Location Precedence And Merge Rules
```yaml
plan_unit_id: LSPS-068
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: MVP LSP config closes implementation policy by storing app-level config under config.lsp, project overrides at .puppet-master/lsp.json, applying app then project precedence, replacing arrays, inheriting absent keys, and resolving server-specific settings by server id before language/filetype mapping.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-068 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: config_location_precedence_and_merge_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0042
preserved_exact_tokens:
- config.lsp
- .puppet-master/lsp.json
- Merge order
- app-level `config.lsp`
- project override `.puppet-master/lsp.json`
- scalar keys override
- object keys override by nested key
- arrays replace rather than merge
- absent keys inherit
- server id first
- language/filetype mapping
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-069 - Locked LSP Defaults
```yaml
plan_unit_id: LSPS-069
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The locked LSP defaults are didChangeDebounceMs 100, hoverTimeoutMs 5000, completionTimeoutMs 5000, workspaceSymbolTimeoutMs 10000, hoverDelayMs 300, and workspaceFolders capped at 10 roots with at least one open document.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-069 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: locked_lsp_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0043
preserved_exact_tokens:
- Locked defaults
- didChangeDebounceMs
- '100'
- hoverTimeoutMs
- '5000'
- completionTimeoutMs
- '5000'
- workspaceSymbolTimeoutMs
- '10000'
- hoverDelayMs
- '300'
- workspaceFolders cap
- 10 roots with at least one open document
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-070 - Trigger Refresh Timing Closure
```yaml
plan_unit_id: LSPS-070
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Trigger and refresh policy uses server-advertised completion trigger characters when available, keeps typing and manual invocation fallback, refreshes inlay hints on document open and debounced changes, does not require scroll-only refresh for MVP, and uses canonical hover delay and timeout values.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-070 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: trigger_refresh_timing_closure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0044
preserved_exact_tokens:
- server-advertised trigger characters
- normal typing
- explicit manual invocation
- inlay hints refresh
- document open
- debounced `didChange`
- scroll-only refresh is not required for MVP
- hoverDelayMs
- hoverTimeoutMs
negative_constraints:
- Scroll-only inlay refresh is not required for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-071 - workspaceFolders Overflow Evidence Policy
```yaml
plan_unit_id: LSPS-071
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspaceFolders includes only roots with at least one open document up to the configured cap, and deterministic overflow exclusions are visible in logs and evidence when they affect behavior.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-071 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: workspacefolders_overflow_evidence_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0045
preserved_exact_tokens:
- workspaceFolders
- Only roots containing at least one open document
- cap above
- Overflow roots
- excluded deterministically
- visible in logs/evidence
negative_constraints:
- Overflow workspace roots must not be silently hidden when exclusion affects behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-072 - FileSafe Apply Edit Boundary
```yaml
plan_unit_id: LSPS-072
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: workspace/applyEdit, rename, and code-action application use the same FileSafe-backed apply-edit path as other agent mutations, treating multi-file and destructive edits with the same safety, approval, tool-policy, and blocked-state reporting rules.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-072 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: filesafe_apply_edit_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0046
preserved_exact_tokens:
- workspace/applyEdit
- rename
- code-action application
- FileSafe-backed apply-edit path
- multi-file edits
- multi-file mutations
- destructive edits
- safety and approval rules
- LSP does not bypass FileSafe, tool policy, or blocked-state reporting
negative_constraints:
- LSP does not bypass FileSafe, tool policy, or blocked-state reporting.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-073 - Virtual Document Decision Closure
```yaml
plan_unit_id: LSPS-073
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat and code-block virtual documents keep the existing virtual-document stance and do not reopen that decision; no core runtime LSP behavior remains implementation-defined after the closed implementer decisions section.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-073 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: virtual_document_decision_closure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0047
preserved_exact_tokens:
- Virtual documents
- existing virtual-document stance
- does not reopen that decision
- No core runtime LSP behavior remains implementation-defined
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
```

### LSPS-074 - Non Executable Checklist Acceptance Envelope
```yaml
plan_unit_id: LSPS-074
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The implementation-ready checklist is a non-executable guide with acceptance criteria for prerequisites and phases 1-4, including diagnostics caps, Chat affordances, Problems links, and explicit deferral of optional gate, evidence, subagent-bias, and enhancement work.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-074 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: non_executable_checklist_acceptance_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0048
preserved_exact_tokens:
- single, implementation-ready checklist
- Cross-references
- §5.1
- §9.1
- FinalGUISpec §7.16
- FinalGUISpec §7.20
- FinalGUISpec §7.4.2
- FileManager §10
- Acceptance (done when)
- capped 10 files, 50 diagnostics
- explicitly deferred and documented
negative_constraints:
- The checklist is implementation guidance and must not create WorkNodes, NodeSeeds, queues, manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-075 - Prerequisites Checklist
```yaml
plan_unit_id: LSPS-075
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Prerequisites require choosing a Rust stdio-capable LSP client, adding it to Cargo.toml, defining OpenCode-aligned LSP config schema, storing it in redb, and adding debounce/timeout config keys.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-075 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: prerequisites_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0049
preserved_exact_tokens:
- Prerequisites
- lsp-types
- stdio-capable client
- lsp-client
- async_lsp_client
- Cargo.toml
- OpenCode-aligned
- lsp.enabled
- lsp.servers.<id>.disabled
- command
- extensions
- env
- initialization
- redb
- lsp.didChangeDebounceMs
- lsp.hoverTimeoutMs
- lsp.completionTimeoutMs
- lsp.workspaceSymbolTimeoutMs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-076 - Phase 1 Registry Sync Startup Checklist
```yaml
plan_unit_id: LSPS-076
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 checklist implementation includes server registry loading, all built-in servers plus slint-lsp, ESLint and Slint root discovery, document sync, and version tracking.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-076 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_registry_sync_startup_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0050
preserved_exact_tokens:
- 'Phase 1: Core LSP'
- server registry
- id, extensions, root finder, spawn
- load config
- all built-in servers from §3.2
- slint-lsp
- ESLint §3.3
- slint-lsp §3.3.1
- didOpen
- didChange
- default 100 ms
- didClose
- didSave
- track document version
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-077 - Phase 1 Diagnostics Hover Completion Status UI Checklist
```yaml
plan_unit_id: LSPS-077
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 1 user-visible checklist implementation maps diagnostics to underlines, gutter markers, and Problems, implements hover, completion, and LSP status examples in the status bar.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-077 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_1_diagnostics_hover_completion_status_ui_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0050
preserved_exact_tokens:
- textDocument/publishDiagnostics
- editor underlines
- gutter markers
- Problems panel
- FinalGUISpec §7.20
- file, line, message, severity, source
- tooltip at cursor
- inline list
- completionItem/resolve
- status bar
- 'rust-analyzer: Ready'
- Initializing...
- 'Error: ...'
- FinalGUISpec §8.1 StatusBar
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-078 - Phase 2 Definition References Symbols Checklist
```yaml
plan_unit_id: LSPS-078
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 editor navigation implements definition, references, breadcrumbs, documentSymbol, and workspace/symbol with documented keyboard and click affordances plus FileManager fallback.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-078 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_definition_references_symbols_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- 'Phase 2: Editor (navigation and editing)'
- textDocument/definition
- Go to definition
- F12
- Ctrl+Click
- File Editor
- 'Fallback: heuristic/index'
- FileManager §10.2
- textDocument/references
- Find references
- References panel
- Shift+F12
- documentSymbol
- workspace/symbol
- breadcrumbs
- Go to symbol
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-079 - Phase 2 Semantic Actions Checklist
```yaml
plan_unit_id: LSPS-079
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 editor semantics implement code actions, code lens, signature help, inlay hints, and semantic tokens with editor affordances and syntax-only fallback where applicable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-079 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_semantic_actions_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- textDocument/codeAction
- context menu
- lightbulb
- textDocument/codeLens
- actionable links
- textDocument/signatureHelp
- popup
- parameter highlight
- textDocument/inlayHint
- inline decorations
- textDocument/semanticTokens
- fall back to syntax-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-080 - Phase 2 Rename Format FileSafe Checklist
```yaml
plan_unit_id: LSPS-080
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 rename and format implement prepareRename, rename, formatting, and rangeFormatting, show preview where needed, and apply changes through FileSafe-backed workspace/applyEdit.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-080 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_rename_format_filesafe_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- textDocument/rename
- textDocument/prepareRename
- Rename symbol
- F2
- show preview
- workspace/applyEdit (FileSafe)
- textDocument/formatting
- textDocument/rangeFormatting
- Format document / Format selection
- Shift+Alt+F
negative_constraints:
- Rename and format edits must apply through FileSafe-backed workspace/applyEdit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-081 - Phase 2 Timeout Cancel Disable Stale Checklist
```yaml
plan_unit_id: LSPS-081
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 request control honors timeout, cancellation, stale document discard or re-request behavior, per-server enable/disable, lsp.<id>.disabled, and lsp:false.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-081 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_timeout_cancel_disable_stale_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Request timeout and cancellation
- discard or re-request on stale document version
- Per-server enable/disable
- lsp.<id>.disabled
- 'lsp: false'
- Settings > LSP per FinalGUISpec §7.4.2
negative_constraints:
- Per-server disabled state must stop LSP for that language.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-082 - Phase 2 Settings LSP Surface Checklist
```yaml
plan_unit_id: LSPS-082
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 Settings > LSP exposes per-server enablement and custom entries according to the FinalGUISpec Settings contract.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-082 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_settings_lsp_surface_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Settings > LSP
- FinalGUISpec §7.4.2
- per-server enable/disable
- all servers and custom entries
- validation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-083 - Phase 2 Lifecycle Restart Bridge Checklist
```yaml
plan_unit_id: LSPS-083
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Phase 2 server lifecycle spawns on first file open by host/server/root identity, restarts on crash with backoff, supports stdio-to-TCP bridge commands such as Godot, and documents the bridge pattern.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-083 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_2_lifecycle_restart_bridge_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0051
preserved_exact_tokens:
- Server lifecycle
- spawn on first file open
- (host_id, server_id, root_identity)
- restart on crash with backoff
- Bridge pattern
- custom command
- stdio↔TCP bridge
- Godot
- document for users
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-084 - Phase 3 Assistant Interview Diagnostics Context
```yaml
plan_unit_id: LSPS-084
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat LSP phase 3 includes current LSP diagnostics in Assistant and Interview context with file, line, message, severity, and source for project, at-mentioned, or recently edited files.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-084 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_assistant_interview_diagnostics_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- 'Phase 3: Chat LSP (§5.1)'
- Diagnostics in Assistant context
- Assistant/Interview turn
- file, line, message, severity, source
- project or @'d/recently edited files
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-085 - Phase 3 Chat Symbol And Code Block Navigation
```yaml
plan_unit_id: LSPS-085
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat phase 3 uses LSP workspace/symbol for @ symbol results and supports hover and click-to-definition in chat code blocks through virtual documents or real file URIs.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-085 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_chat_symbol_and_code_block_navigation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- '@ symbol with LSP'
- workspace/symbol
- documentSymbol
- path, line, kind
- Code blocks in messages
- LSP hover
- click-to-definition
- Ctrl+Click
- virtual document
- real file URI
- definition opens in File Editor
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-086 - Phase 3 Problems Link Hint And Fallback
```yaml
plan_unit_id: LSPS-086
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Chat phase 3 exposes Problems links or badges and optional compact diagnostics hints for at-mentioned files, while fallback uses text/indexed symbol search, no hover/definition, and omitted diagnostics when LSP is unavailable.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-086 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_3_problems_link_hint_and_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0052
preserved_exact_tokens:
- Problems link from Chat
- N problems
- opens Problems panel
- Optional
- 2 errors in @'d files
- click-through
- Fallback when LSP unavailable
- text-based or indexed symbol search
- code blocks no hover/definition
- omit diagnostics from context
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-087 - Phase 4 Optional Gate Evidence Bias
```yaml
plan_unit_id: LSPS-087
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional phase 4 may add an LSP diagnostics gate, LSP evidence snapshots, and subagent selection bias from LSP diagnostics as optional or explicitly deferred enhancements.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-087 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_gate_evidence_bias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- 'Phase 4: Optional (§9.1)'
- Optional LSP diagnostics gate
- No LSP errors in scope
- Optional LSP snapshot in evidence
- Optional subagent selection from LSP
- subagent bias
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-088 - Phase 4 Optional Chat Quick Actions
```yaml
plan_unit_id: LSPS-088
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional chat enhancements may expose Fix all, LSP rename with confirmation, where-used references, format file, and copying hover type/signature to Chat.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-088 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_chat_quick_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Optional/recommended Chat
- Fix all
- quick fixes from Chat
- Rename X to Y
- LSP Rename symbol with confirmation
- Where is this used?
- Find references
- Format this file
- LSP Format document
- Copy type/signature to Chat
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-089 - Phase 4 Optional LSP Tool Promotion
```yaml
plan_unit_id: LSPS-089
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional tool promotion may expose lsp.references, lsp.definition, lsp.hover, and approval-gated lsp.rename and remove or relax OPENCODE_EXPERIMENTAL_LSP_TOOL only when ready.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-089 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_lsp_tool_promotion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Promote lsp tool to MVP
- Tools.md
- lsp.references
- lsp.definition
- lsp.hover
- lsp.rename with user approval
- OPENCODE_EXPERIMENTAL_LSP_TOOL
negative_constraints:
- lsp.rename remains user-approval gated if promoted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-090 - Phase 4 Optional Interview Advanced Editor Features
```yaml
plan_unit_id: LSPS-090
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Optional Interview and editor enhancements may include structure-of-file via documentSymbol, diagnostics in interview context, type definition, implementation, document links, call hierarchy, folding range, selection range, and document highlight.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-090 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: phase_4_optional_interview_advanced_editor_features
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0053
preserved_exact_tokens:
- Interview "Structure of this file"
- documentSymbol
- diagnostics in interview context
- go to type definition
- implementation
- document links
- call hierarchy
- folding range
- selection range
- document highlight
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-091 - Gate Timing Scope Severity Contract
```yaml
plan_unit_id: LSPS-091
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP diagnostics verification gate runs at configured tier boundaries, defaults to phase boundary only, treats iteration-local preflight as advisory only, checks changed_files, open, or project scope, and blocks by configurable error or error_and_warning severity threshold.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-091 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_timing_scope_severity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0056
preserved_exact_tokens:
- When it runs
- tier boundaries
- phase
- task
- subtask
- 'default: phase boundary only'
- iteration-local preflight
- MUST NOT replace
- changed_files
- open
- project
- No LSP errors
- error
- error_and_warning
negative_constraints:
- Iteration-local preflight MUST NOT replace the configured boundary gate.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-092 - Gate Config Schema Defaults
```yaml
plan_unit_id: LSPS-092
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The LSP gate config lives at verification.lsp_gate with opt-in defaults, changed_files scope, errors-only blocking, phase boundary, 10-second timeout, skip when unavailable, and project override through .puppet-master/config.json.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-092 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_config_schema_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0057
preserved_exact_tokens:
- verification.lsp_gate
- redb
- .puppet-master/config.json
- enabled
- 'false'
- scope
- changed_files
- block_on
- errors
- tier_boundaries
- '["phase"]'
- timeout_seconds
- '10'
- when_unavailable
- skip
- errors_and_warnings
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-093 - Verification Tab LSP Controls
```yaml
plan_unit_id: LSPS-093
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The Verification tab exposes an LSP diagnostics gate subsection with enable, scope, block-on, tier-boundary, and timeout controls bound to the same VerificationConfig blob.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-093 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verification_tab_lsp_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0057
preserved_exact_tokens:
- GUI
- Verification tab
- LSP diagnostics gate
- Enable checkbox
- Scope dropdown
- Changed files
- Open files
- Whole project
- Block on
- Errors only
- Errors and warnings
- Tier boundaries
- Phase, Task, Subtask
- Timeout (seconds)
- VerificationConfig
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-094 - Gate Failure Orchestrator Flow
```yaml
plan_unit_id: LSPS-094
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: When LSP diagnostics fail the gate, the criterion result carries passed false, met false, and an actual diagnostic summary, then follows standard orchestrator retry, escalation, or stop policy with no special LSP-only gate-runner path.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-094 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_orchestrator_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0058
preserved_exact_tokens:
- Gate fails
- 'passed: false'
- 'met: false'
- actual
- 3 LSP errors in scope
- Orchestrator behavior
- retry
- escalate
- stop
- No special case for LSP gate
negative_constraints:
- The LSP gate must use the standard failed-gate flow rather than a special-case orchestrator path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-095 - Gate Failure User Notification
```yaml
plan_unit_id: LSPS-095
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: User-visible LSP gate failures appear through the standard Dashboard and Gate report path, with optional toast copy and attached evidence for inspection.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-095 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_user_notification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0058
preserved_exact_tokens:
- User notification
- Dashboard/Gate report
- optional toast
- 'LSP gate failed: N errors in scope'
- Evidence
- user can inspect
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-096 - Snapshot Evidence Attachment
```yaml
plan_unit_id: LSPS-096
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Whenever the LSP gate runs, pass or fail, it captures and attaches an LSP diagnostics snapshot as evidence, referenced as lsp_snapshot and stored under the planned LSP snapshots evidence location or embedded in gate report artifacts.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-096 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_evidence_attachment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0059
preserved_exact_tokens:
- Evidence attachment
- When the LSP gate runs
- whether it passes or fails
- always capture snapshot
- lsp_snapshot
- .puppet-master/evidence/lsp-snapshots/
- GateReport
- EvidenceStore
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-097 - LspGateVerifier Registry API
```yaml
plan_unit_id: LSPS-097
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LspGateVerifier is registered in VerifierRegistry under lsp or lsp_gate verification_method, runs without changing gate_runner flow, calls the LSP client diagnostics API for resolved paths, and returns VerifierResult with passed, message, and evidence.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-097 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: lspgateverifier_registry_api
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0060
preserved_exact_tokens:
- LspGateVerifier
- lsp_gate_verifier
- VerifierRegistry
- register_defaults
- 'verification_method: "lsp"'
- '"lsp_gate"'
- puppet-master-rs/src/verification/lsp_gate_verifier.rs
- Verifier
- verify(criterion)
- get_diagnostics_for_paths
- VerifierResult { passed, message, evidence }
- No change to gate_runner flow
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-098 - VerificationConfig Criterion Evidence Wiring
```yaml
plan_unit_id: LSPS-098
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Implementer wiring extends VerificationConfig with nested lsp_gate, injects lsp criteria at enabled tier boundaries, dispatches by verification method, and uses existing evidence and GateReport aggregation without adding a new GateReport field.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-098 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verificationconfig_criterion_evidence_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0061
preserved_exact_tokens:
- VerificationConfig
- nested struct
- enabled
- scope
- block_on
- tier_boundaries
- timeout_seconds
- when_unavailable
- build_gate_criteria
- 'verification_method: "lsp"'
- '"lsp_gate"'
- No change to criterion type enum beyond adding this method
- No new GateReport field required
- EvidenceStore
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-099 - Verification Tab Binding
```yaml
plan_unit_id: LSPS-099
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The Verification tab binds LSP diagnostics gate controls to the nested lsp_gate config struct and persists them with the same verification settings blob.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-099 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: verification_tab_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0061
preserved_exact_tokens:
- Verification tab UI
- LSP diagnostics gate subsection
- controls bound to this struct
- Persist in the same blob as other verification settings
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/feature-list.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-100 - Prompt Consumable Evidence Cap
```yaml
plan_unit_id: LSPS-100
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Prompt-consumable LSP/debug evidence may auto-ingest at most the top five evidence items by current relevance or severity; after that cap, additional diagnostics or trace material enter summarization-only mode unless the user explicitly opens the full runtime artifact.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-100 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: prompt_consumable_evidence_cap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0062
preserved_exact_tokens:
- Prompt-consumable LSP/debug evidence
- at most the top five evidence items
- current relevance `/severity`
- summarization-only mode
- unless the user explicitly opens the full runtime artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-101 - Diagnostic Entry Schema
```yaml
plan_unit_id: LSPS-101
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Each LSP evidence snapshot diagnostic entry stores path, line, character, severity, message, source, and optional code with severity values Error, Warning, Info, and Hint.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-101 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: diagnostic_entry_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0063
preserved_exact_tokens:
- Schema (per diagnostic entry)
- path
- line
- character
- severity
- message
- source
- code
- Error
- Warning
- Info
- Hint
- rust-analyzer
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-102 - Evidence Line Display Protocol Boundary
```yaml
plan_unit_id: LSPS-102
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP diagnostic evidence stores and displays line values as 1-based for evidence and UI while converting to 0-based only at the LSP protocol boundary.
gui_related: true
gui_classification_reason: The unit defines user-visible editor, status, Problems, Settings, Chat, copy, evidence display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-102 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: evidence_line_display_protocol_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0063
preserved_exact_tokens:
- line
- 0-based or 1-based per LSP spec
- Decision
- Store and display 1-based in evidence and UI
- convert to 0-based only at the LSP protocol boundary
negative_constraints:
- Do not leak protocol 0-based line display into evidence or UI.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-103 - Snapshot File Location Object Format
```yaml
plan_unit_id: LSPS-103
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP snapshots are stored under .puppet-master/evidence/lsp-snapshots with unique gate or tier/session filenames and JSON object content containing captured_at, scope, project_root, and diagnostics.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-103 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_file_location_object_format
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0064
preserved_exact_tokens:
- File format and location
- .puppet-master/evidence/lsp-snapshots/
- lsp-snapshot-{gate_id}-{timestamp}.json
- lsp-snapshot-{tier_id}-{session_id}.json
- captured_at
- scope
- project_root
- diagnostics
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-104 - Snapshot Capture Timing
```yaml
plan_unit_id: LSPS-104
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: MVP snapshot capture occurs after an iteration when the gate runs and before promotion, with one after-only snapshot per gate run and no required before-run capture.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-104 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: snapshot_capture_timing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0065
preserved_exact_tokens:
- When captured
- 'Before run: Not required'
- 'After run (when gate runs): Yes'
- after iteration, before promotion
- one snapshot per gate run
- 'MVP: after only'
negative_constraints:
- Before-run LSP snapshot capture is not required for MVP.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs: []
```

### LSPS-105 - Gate Runner Snapshot Trigger Sequence
```yaml
plan_unit_id: LSPS-105
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The gate runner invokes LspGateVerifier, which gets diagnostics, writes the snapshot JSON, attaches evidence to VerifierResult, and returns pass/fail while EvidenceStore may persist the path and GateReport criteria carry the evidence.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-105 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_runner_snapshot_trigger_sequence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0066
preserved_exact_tokens:
- Who triggers
- Gate runner
- LspGateVerifier
- gets diagnostics from LSP client
- writes snapshot JSON
- .puppet-master/evidence/lsp-snapshots/
- attaches evidence to VerifierResult
- EvidenceStore
- GateReport criteria already carry per-criterion evidence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### LSPS-106 - Subagent Bias Enablement Scope Defaults
```yaml
plan_unit_id: LSPS-106
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: Subagent selection from LSP is off by default behind orchestrator.lsp_subagent_bias and, when enabled, uses explicit node file list, changed files, or open files to derive language bias such as rust-analyzer to rust-engineer.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-106 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_enablement_scope_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Subagent selection from LSP
- orchestrator.lsp_subagent_bias
- default false
- files in scope
- Changed in last iteration
- Open in editor
- Node's file list
- 'Default: changed in last iteration'
- rust-analyzer → rust-engineer
- pyright → python-pro
- prefer_subagents
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-107 - Subagent Bias Owner Runtime Boundary
```yaml
plan_unit_id: LSPS-107
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: orchestrator-subagent-integration remains owner for subagent-selection wiring and runtime structs must carry rewrite execution identity and concern model when LSP diagnostics bias a node.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-107 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_owner_runtime_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Plans/orchestrator-subagent-integration.md
- Subagent selection from LSP
- owner for subagent-selection wiring
- runtime structs
- rewrite execution identity
- concern model
- LSP diagnostics bias a node
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/orchestrator-subagent-integration.md owns subagent-selection wiring; LSPSupport records the LSP diagnostic bias contract.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-108 - Subagent Bias Ranking Explainability Rules
```yaml
plan_unit_id: LSPS-108
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP bias is a ranking hint rather than an absolute selector, yields to explicit plan requirements or required_subagents, uses explicit node file list before changed or open files, defaults to Error threshold, and persists chosen bias inputs and outcomes for explainability.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-108 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: subagent_bias_ranking_explainability_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0067
preserved_exact_tokens:
- Bias rules (canonical)
- tie-breaker / ranking hint
- not an absolute selector
- required_subagents
- Preferred scope order
- explicit node file list
- changed files in current node
- open files
- Default bias threshold
- Error
- Warning when configured
- persisted in run metadata or verification evidence
- explainable
negative_constraints:
- LSP bias must not override explicit plan requirements, node override lists, or required_subagents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The source span contains multiple separable LSP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### LSPS-109 - Gate Failure Modes Implementation Contract
```yaml
plan_unit_id: LSPS-109
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: LSP gate and diagnostics failure modes skip when client is unavailable by default, fail on diagnostics query timeout with partial snapshot if available, treat files without servers as empty diagnostics, follow unavailable config for crashes, pass empty scopes, and implement this in LspGateVerifier and get_diagnostics_for_paths.
gui_related: false
gui_classification_reason: The unit defines LSP runtime, protocol, registry, verification, evidence, or implementation constraints rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through LSPS-109 instead of broad L-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_contract_drift
reasoning_tier: standard
context_scope: lspsupport_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: gate_failure_modes_implementation_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0068
preserved_exact_tokens:
- LSP client not ready
- skip
- 'actual: "LSP client not ready"'
- lsp_gate.when_unavailable
- skip | pass | fail
- default skip
- Timeout when querying diagnostics
- fail
- partial snapshot
- No server for language
- empty list
- Server crash or disconnected
- Empty scope
- passes
- LspGateVerifier
- get_diagnostics_for_paths
negative_constraints:
- The gate does not block on LSP startup by default.
- Timeout querying diagnostics fails the criterion rather than silently passing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/LSPSupport.md owns LSP-specific protocol/client constraints while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/LSPSupport.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md'
```

### L-001 - LSPSupport Retired Source-Preserving Bridge
```yaml
plan_unit_id: L-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: The former LSPSupport source-preserving bridge is retired after Phase 2B atomized LSPSupport-S0001 through S0068 into LSPS-002 through LSPS-109 or structurally/reference dispositioned S0018, S0025, S0026, S0029, S0041, S0054, S0055, and S0069 through S0072. L-001 remains only as migration lineage and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained LSPSupport PlanUnits LSPS-002 through LSPS-109.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- L-001 no longer uses source_preserving_planunit compile mode.
- LSPS-002 through LSPS-109 own product coverage for atomized LSPSupport spans.
- Structural and reference spans are explicit coverage dispositions, not product coverage owned by L-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:LSPSupport-S0071
preserved_exact_tokens:
- L-001
- LSPSupport-S0071
- source_preserving_planunit
- source_preserving_bridge_retired
- LSP Support -- Plan (Rewrite)
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- L-001 must not re-own LSPSupport product coverage.
- L-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- L-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former L-001 residual source-preserving bridge is retired by Phase 2B batch 086.
owner_boundary_notes:
- LSPS-002 through LSPS-109 own atomized LSPSupport product coverage.
- LSPSupport-S0071 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/LSPSupport.md
```
