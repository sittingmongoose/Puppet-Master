# Shard 034: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Tools.md`

Source lines: L11057-L11235

Source SHA256: `cf19b68942a134ccfe3c638fe1036e089b76d66f27b32c3913abd01df85a52b9`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### T-160 - Native DiscoveryService Shared Substrate

```yaml
plan_unit_id: T-160
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Puppet Master owns a native fff-inspired DiscoveryService as one shared substrate for agent tools and GUI surfaces from day one. DiscoveryService provides ranked path/context candidates under the same FileSafe, permissions, ignore, freshness, fallback, remote/cache/SSH, and no-leak policy envelope for Assistant Chat, Planning Wizard, PRD Builder, Orchestrator, Executor, File Manager, Quick Open, and compatible path-picking surfaces. Direct fff remains reference/evidence/prototype-only; product canon does not depend on a direct fff runtime dependency and does not create separate agent and GUI rankers.
gui_related: false
gui_classification_reason: This defines the shared backend/tool substrate; GUI consumers are covered in their owner docs.
depends_on: [T-012, T-014, T-015, T-046, T-050, T-051]
unblocks: [T-161, T-162, CV-291, F3-399, ACD-422, OSI-429]
acceptance_criteria:
  - Agent and GUI discovery consumers can route to the same DiscoveryService contract.
  - The same FileSafe, permissions, ignore, freshness, fallback, remote/cache/SSH, and no-leak policy envelope applies to every consumer.
  - Direct fff and OpenCode details remain source-lineage/reference/prototype-only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: shared_tool_contract_drift
reasoning_tier: standard
context_scope: cross_surface_discovery
implementation_surfaces: [Plans/Tools.md, future DiscoveryService, future discover_paths tool route]
node_compile_hint: {mode: discovery_service_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0012
  - pldg-20260622-001-fff:atom-0014
  - pldg-20260622-001-fff:atom-0018
  - pldg-20260622-001-fff:atom-0019
  - pldg-20260622-001-fff:atom-0020
  - pldg-20260622-001-fff:atom-0022
  - pldg-20260622-001-fff:atom-0026
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0034
  - pldg-20260622-001-fff:atom-0046
  - pldg-20260622-001-fff:atom-0047
  - pldg-20260622-001-fff:atom-0048
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-002
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Helmholtz
source_atom_ids: [atom-0012, atom-0014, atom-0018, atom-0019, atom-0020, atom-0022, atom-0026, atom-0031, atom-0034, atom-0046, atom-0047, atom-0048]
preserved_exact_tokens: ["native PM-owned", "fff-inspired", "DiscoveryService", "one shared substrate", "agent tools", "GUI surfaces", "FileSafe", "permissions", "ignore", "freshness", "fallback", "direct fff", "OpenCode"]
negative_constraints:
  - Do not add a direct fff runtime dependency as the product direction.
  - Do not create separate undisclosed agent and GUI rankers.
  - Do not bypass FileSafe, permission, ignore, freshness, fallback, or no-leak policy envelopes.
owner_hints: [Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
```

### T-161 - discover_paths Operation And Request/Result Behavior

```yaml
plan_unit_id: T-161
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  The agent-facing discovery operation is discover_paths, delegating to DiscoveryService. DiscoveryRequest carries request_id, consumer_id, surface_type, project/worktree or remote identity, query_text, intent, target_kind, limit, budget_ms, current_context, policy_context, redaction_profile, and permission/approval/SSH trust fields where applicable. DiscoveryResult returns ranked candidates with result_id, rank, canonical_path_identity, display_path, path_kind, target_kind, score_total, score_breakdown, match_type, policy-filtered matched_ranges when available, provenance, freshness_state, fallback_state, policy_decision, source_index_generation, requires_exact_verification, and verification_handoff. Discovery receipts use discovery.invoked, discovery.candidates_returned, discovery.selected, discovery.fallback, discovery.verified, discovery.disabled, discovery.unsupported, and discovery.backpressure. The allowed values for discover_paths request, result, receipt_event, and error_code fields come from the CV-291 canonical exact value registry.
gui_related: false
gui_classification_reason: This is the tool/API behavior contract; GUI presentation is owned by GUI docs.
depends_on: [T-160, CV-291, T-072]
unblocks: [OSI-429, EP-106, ATS-011, RAP-031]
acceptance_criteria:
  - discover_paths requests/results use discovery-local enum values from the CV-291 canonical exact value registry.
  - Result payloads always carry freshness_state, fallback_state, policy_decision, provenance, and requires_exact_verification.
  - Ambient invocation is bounded to materially useful repo/source-location tasks and skipped for exact verified paths, pure chat, user denial, policy blocks, disabled/unsupported, or backpressure states.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: tool_schema_drift
reasoning_tier: standard
context_scope: discovery_tool_contract
implementation_surfaces: [Plans/Tools.md, Plans/Contracts_V0.md, future discover_paths tool route]
node_compile_hint: {mode: discover_paths_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0023
  - pldg-20260622-001-fff:atom-0035
  - pldg-20260622-001-fff:atom-0036
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0051
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:state/precision_contract.json
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#shared_agent_tool_discover_paths
source_atom_ids: [atom-0023, atom-0035, atom-0036, atom-0051, atom-0063, atom-0076, atom-0088, atom-0092]
preserved_exact_tokens: ["discover_paths", "DiscoveryRequest", "DiscoveryResult", "request_id", "consumer_id", "surface_type", "intent", "target_kind", "path_kind", "match_type", "score_breakdown", "freshness_state", "fallback_state", "policy_decision", "error_code", "receipt_event", "requires_exact_verification", "verification_handoff", "discovery.invoked", "discovery.candidates_returned", "discovery.selected", "discovery.fallback", "discovery.verified", "discovery.disabled", "discovery.unsupported", "discovery.backpressure"]
negative_constraints:
  - Do not make discover_paths a grep replacement.
  - Do not expose raw private frecency/query/open history to agents by default.
  - Do not interpret ambient discovery as search-everything-every-turn behavior.
owner_hints: [Plans/Tools.md, Plans/Contracts_V0.md]
```

### T-162 - Path Discovery Versus Content Search Boundary

```yaml
plan_unit_id: T-162
unit_type: constraint
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  DiscoveryService is path/context discovery, not a second content regex engine. MVP discovery covers file, directory, file_or_directory, module, test, doc, config, content_candidate, and mixed target kinds for locating candidate paths or context. content_candidate is a handoff hint only and never verified content-search output. Exact content verification remains with Instant Grep, grep, codesearch, AST/LSP, tests, or domain-specific checks before edits, root-cause claims, verifier pass, or final summaries.
gui_related: false
gui_classification_reason: This is a tool boundary and verification rule, not visual presentation.
depends_on: [T-046, T-050, T-051, T-160, T-161]
unblocks: [EP-106, ATS-011]
acceptance_criteria:
  - Search panel path narrowing may use DiscoveryService only to narrow path/context candidates.
  - Final content results and correctness claims come from content-search, AST/LSP, tests, or domain verification owners.
  - content_candidate is never treated as verified text content.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: content_search_boundary_drift
reasoning_tier: standard
context_scope: tools_search_boundary
implementation_surfaces: [Plans/Tools.md, future DiscoveryService, future grep/codesearch/Instant Grep routes]
node_compile_hint: {mode: boundary_constraint, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0041
  - pldg-20260622-001-fff:atom-0050
  - pldg-20260622-001-fff:atom-0060
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-003
source_atom_ids: [atom-0031, atom-0041, atom-0050, atom-0060, atom-0063, atom-0076, atom-0088]
preserved_exact_tokens: ["content_candidate", "Instant Grep", "grep", "codesearch", "AST/LSP", "exact verification", "path/context discovery", "not a second content regex engine"]
negative_constraints:
  - Do not create a second regex/content-search canon beside Instant Grep, grep, or codesearch.
  - Do not allow DiscoveryService ranking to substitute for exact content verification.
owner_hints: [Plans/Tools.md, Plans/LSPSupport.md]
```

### T-163 - Discovery Rollout Scheduler And Backpressure Guardrails

```yaml
plan_unit_id: T-163
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  DiscoveryService adoption uses one shared rollout surface with project/user discovery.enabled, a developer/operator kill switch, explicit discovery.disabled and discovery.unsupported receipt behavior, and no silent behavior drift. Discovery scheduling deduplicates equivalent requests, cancels superseded GUI queries quickly, bounds index refresh concurrency, preserves fairness between GUI and background/agent work, prevents thundering-herd refreshes, and emits over_budget or discovery.backpressure receipts when budgets or resource caps require degraded behavior.
gui_related: true
gui_classification_reason: Scheduler and rollout behavior affect GUI cancellation, visible disabled/unsupported/backpressure states, and user-facing degraded behavior.
depends_on: [T-160, T-161, CV-291]
unblocks: [F3-399, ATS-011]
acceptance_criteria:
  - Disabled, unsupported, over-budget, and backpressure states produce explicit receipts or visible degraded states instead of silent fallback.
  - Superseded GUI discovery queries cancel within the configured cancellation target.
  - Agent/background discovery cannot starve GUI queries or trigger unbounded refresh storms.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future scheduler tests for dedupe, cancellation, fairness, concurrency, and backpressure.
  - Future Assistant Chat and GUI degraded-state tests.
risk_class: rollout_scheduler_drift
reasoning_tier: standard
context_scope: discovery_runtime_guardrails
implementation_surfaces: [Plans/Tools.md, future DiscoveryService scheduler, future GUI query surfaces]
node_compile_hint: {mode: scheduler_guardrail_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0024
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0084
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:state/implementation_gap_defaults.json
  - pldg-20260622-001-fff:state/precision_contract.json#performance_resource_budgets
source_atom_ids: [atom-0024, atom-0081, atom-0084, atom-0089, atom-0092]
preserved_exact_tokens: ["discovery.enabled", "kill switch", "discovery.disabled", "discovery.unsupported", "dedupe", "GUI cancellation", "bounded index refresh concurrency", "GUI/background fairness", "over_budget", "backpressure", "thundering herd"]
negative_constraints:
  - Do not create a parallel discovery canon or bypass the shared DiscoveryService substrate.
  - Do not silently degrade disabled, unsupported, over-budget, or backpressure states into success-shaped results.
owner_hints: [Plans/Tools.md, Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md]
```
