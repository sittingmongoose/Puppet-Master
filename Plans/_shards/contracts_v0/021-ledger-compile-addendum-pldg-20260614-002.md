# Shard 021: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Contracts_V0.md`

Source lines: L16816-L16978

Source SHA256: `f5da31183d992c2a90a5f65d54da61652301e8b9736cb27a0025cc6809342648`

---

## Ledger Compile Addendum - pldg-20260614-002

### CV-281 - Runtime Identity Envelope And Domain Profiles

```yaml
plan_unit_id: CV-281
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime-facing records must carry a shared runtime identity envelope with stable ids for project,
  run, node, attempt, package, seam, lane, worktree, actor, account, provider, requested identity,
  effective identity, execution_role, and subordinate provider-native correlation refs. Domain
  profiles may narrow required fields for permissions, providers, artifacts, routes, plan graph,
  and continuity records, but they must not replace the shared envelope with owner-local identity
  names.
gui_related: false
gui_classification_reason: Runtime identity fields and domain profiles are backend contract data, not visual presentation.
depends_on: [CV-279]
unblocks: []
acceptance_criteria:
  - Runtime records can identify project, run, node, attempt, package, seam, lane, worktree, actor, account, provider, requested/effective identity, and execution_role.
  - Provider-native ids such as OpenCode session ids remain subordinate correlation refs, not replacements for canonical PM ids.
  - Domain profiles document which envelope fields are required, optional, inherited, or forbidden for each owner surface.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: runtime_identity_drift
reasoning_tier: high
context_scope: shared_runtime_identity
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Permissions_System.md, Plans/Provider_OpenCode.md, Plans/Runtime_Artifacts_Panel.md, Plans/Run_Graph_View.md]
node_compile_hint: {mode: runtime_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0031
  - pldg-20260614-002-part-3-fable-cleanup:atom-0047
preserved_exact_tokens: ["runtime identity envelope", "domain profiles", "actor/lane/run/account", "requested/effective identity", "execution_role", "provider_attempt_ref?"]
negative_constraints:
  - Do not let provider-native ids replace canonical PM runtime ids.
  - Do not allow owner-local identity names to diverge from the shared runtime identity envelope.
owner_hints: [Plans/Contracts_V0.md, Plans/Prompt_Pipeline.md, Plans/storage-plan.md]
```

### CV-282 - Runtime Continuity Event And Storage Contract

```yaml
plan_unit_id: CV-282
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Cross-run knowledge continuity must be represented by a versioned runtime continuity contract with
  schema, event family, storage keys, extraction trigger/source rules, actor/runtime_identity,
  project/run/account scope, retention and redaction policy, provenance/evidence refs, reconnect and
  replay behavior, conflict/staleness handling, and canonical runtime storage over stored outputs and
  handoff records. `.puppet-master/memory` is not an active storage target for this contract.
gui_related: false
gui_classification_reason: Continuity schema, storage keys, and event families are runtime/storage contracts, not GUI presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - Continuity extraction has a named event family and storage key family before consumers rely on replay or reconnect.
  - Stored continuity carries actor/runtime_identity, project/run/account scope, provenance, retention, redaction, and staleness metadata.
  - "`.puppet-master/memory` remains explicitly rejected as an active storage target for this contract."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: continuity_schema_gap
reasoning_tier: high
context_scope: cross_run_knowledge_continuity
implementation_surfaces: [Plans/Contracts_V0.md, Plans/orchestrator-subagent-integration.md, Plans/storage-plan.md]
node_compile_hint: {mode: runtime_continuity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0100
  - pldg-20260614-002-part-3-fable-cleanup:atom-0101
preserved_exact_tokens: ["Cross-run knowledge continuity", "no schema, no event family, no storage keys", "extraction approaches listed as undecided alternatives", ".puppet-master/memory"]
negative_constraints:
  - Do not store active runtime continuity in `.puppet-master/memory`.
  - Do not treat undecided extraction alternatives as implementation-ready continuity behavior.
owner_hints: [Plans/Contracts_V0.md, Plans/orchestrator-subagent-integration.md, Plans/storage-plan.md]
```

### CV-283 - Shared Route Object Navigation Contract

```yaml
plan_unit_id: CV-283
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Cross-surface navigation must use a versioned shared route-object model outside the wizard path.
  Route objects carry route object identity, source surface, destination surface, target object type,
  target identity fields, project/run/package/seam/lane/worktree/account scope, mode/context
  parameters, actor/runtime_identity, permission/visibility boundary, serialization format,
  validation/fallback behavior, stale or missing-target handling, restore/back-stack semantics, and
  compatibility with chain wizard routing.
gui_related: false
gui_classification_reason: The route object is a shared navigation/data contract; individual screens consuming it are GUI-related in their owner docs.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - Wizard, Run Graph, artifacts, usage, ledger, thread, and file surfaces can serialize and validate the same route-object shape.
  - Missing or stale targets produce typed fallback behavior rather than surface-local navigation guesses.
  - Permission and visibility boundaries travel with route objects before target surfaces render details.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: route_model_fragmentation
reasoning_tier: high
context_scope: shared_route_object_navigation
implementation_surfaces: [Plans/Contracts_V0.md, Plans/chain-wizard.md, Plans/chain-wizard-flexibility.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: shared_route_object_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0103
  - pldg-20260614-002-part-3-fable-cleanup:atom-0104
preserved_exact_tokens: ["cross-surface deep-link model", "shared route-object/navigation contract", "source surface", "destination surface", "restore/back-stack semantics"]
negative_constraints:
  - Do not keep route objects wizard-only.
  - Do not let surfaces invent incompatible deep-link payloads.
owner_hints: [Plans/Contracts_V0.md, Plans/chain-wizard.md, Plans/FinalGUISpec.md]
```

### CV-284 - Plan Graph Schema Identity Context

```yaml
plan_unit_id: CV-284
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  `plan_graph.schema.json` and `project_plan_node.schema.json` must add a required identity context
  object and must not remain node-only or seam/lane-blind. That object must carry
  account/project/worktree/package/seam/lane/run identity, runtime identity refs,
  dependency/ownership metadata, validation status, recovery boundaries, promotion boundaries,
  promotion/recovery provenance, and migration compatibility without generating or updating live
  `plan_graph` artifacts during ordinary ledger compile work.
gui_related: false
gui_classification_reason: Plan graph schema identity context is schema/governance data, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - Schema requirements name a required identity context object carrying account, project, worktree, package, seam, lane, run, runtime identity, recovery/promotion provenance, dependency/ownership metadata, validation status, and migration compatibility.
  - Plan graph schema changes are separated from generated `plan_graph` artifact regeneration.
  - Recovery and promotion consumers can validate identity context rather than inferring it from node ids.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: plan_graph_identity_loss
reasoning_tier: high
context_scope: plan_graph_schema_identity
implementation_surfaces: [Plans/Contracts_V0.md, Plans/plan_graph.schema.json, Plans/project_plan_node.schema.json]
node_compile_hint: {mode: plan_graph_schema_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0041
  - pldg-20260614-002-part-3-fable-cleanup:atom-0052
  - pldg-20260614-002-part-3-fable-cleanup:atom-0106
  - pldg-20260614-002-part-3-fable-cleanup:atom-0107
preserved_exact_tokens: ["plan_graph.schema.json", "project_plan_node.schema.json", "required identity context object", "account/project/worktree/package/seam/lane/run identity", "promotion/recovery provenance", "must not remain node-only or seam/lane-blind", "generated `plan_graph`"]
negative_constraints:
  - Do not update generated `plan_graph` artifacts before explicit compile/governance.
  - Do not keep plan graph schemas node-only or seam/lane-blind.
  - Do not infer account, project, worktree, package, seam, lane, or run identity from node id strings alone.
owner_hints: [Plans/Contracts_V0.md, Plans/plan_graph.schema.json, Plans/project_plan_node.schema.json]
```
