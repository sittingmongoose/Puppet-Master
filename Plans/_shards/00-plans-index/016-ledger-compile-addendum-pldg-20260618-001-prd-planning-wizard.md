# Shard 016: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/00-plans-index.md`

Source lines: L4280-L4472

Source SHA256: `2d6142621ce666c50dbf0ed63daf63d22e9322dfcd71fc4c6654d98f739ee4d1`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### 0PI-059 - PRD Builder And Planning Wizard Owner Map

```yaml
plan_unit_id: 0PI-059
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'Create Plans/PRD_Builder.md and Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows. Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs. After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases. The finished-product feature formerly called
  Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. PRD Builder captures and normalizes planning-intake product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and resolves implementation-ready planning.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/00-plans-index.md
- Plans/Plan_Document_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0158
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0160
- pldg-20260618-001-prd-planning-wizard:atom-0161
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0004
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
source_atom_ids:
- atom-0158
- atom-0159
- atom-0160
- atom-0161
- atom-0001
- atom-0002
- atom-0004
decision_refs:
- dec-0029
- dec-0001
- dec-0002
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- PlanProfile
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- doc-impact pass
- PlanUnit index
- governance seal
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- planning-intake
- Approved PRD Pack
- implementation-ready planning
negative_constraints:
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase.
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not collapse PRD Builder and Planning Wizard into one indistinguishable interview.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- Current owner routing is PRD Builder intake -> Planning Wizard planning -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
```

### Native Discovery Owner Map (2026-06-22)

The native fff-inspired discovery packet compiled from `pldg-20260622-001-fff` uses this owner split:
- `Plans/Tools.md` owns `DiscoveryService`, `discover_paths`, ranking/fallback/freshness behavior, ambient agent use, and the boundary between path/context discovery and content verification.
- `Plans/Contracts_V0.md` owns promoted shared discovery enum, event, and receipt envelope terms.
- `Plans/storage-plan.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FileSafe.md`, and `Plans/Permissions_System.md` own persistence, remote/cache/SSH identity, no-leak filtering, permission snapshots, host trust, credential handles, and redaction.
- `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/UI_Command_Catalog.md`, `Plans/FileManager.md`, `Plans/Planning_Wizard.md`, and `Plans/PRD_Builder.md` consume discovery for user-visible pickers, type-ahead, Assistant Chat activity, and source selection.
- `Plans/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, `Plans/Automated_Testing_System.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/Plan_To_Node_Compilation.md` consume discovery for agent orientation, verification handoff, conformance tests, receipt browsing, and future-boundary-only Plan-to-Node references.

Cursor-style regex acceleration remains the Instant Grep / SparseNgramIndex content-search lane. Direct `fff` and OpenCode implementation details are lineage/reference/prototype-only unless Jared changes direction. Current product prose uses `PRD Builder` and `Planning Wizard`; `Chain Wizard`, `Plan Wizard`, `Requirements Doc Builder`, and `Start Chain` remain historical or compatibility-only terms.

```yaml
plan_unit_id: 0PI-060
unit_type: owner_map
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Native PM-owned fff-inspired discovery is routed as one shared path/context discovery substrate. Tools owns DiscoveryService and discover_paths behavior; Contracts_V0 owns promoted shared enum/event/receipt envelopes; storage, worktree, FileSafe, and Permissions owners govern persistence, remote/cache/SSH identity, no-leak filtering, permission snapshots, host trust, credential handles, and redaction; GUI and agent docs consume the shared substrate without re-owning ranking or schema semantics. Instant Grep, grep, and codesearch remain the content regex and exact content verification owners. Direct fff and OpenCode details are source-lineage/reference/prototype-only, and this compile creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, Spec_Lock, shards, evidence, plan_graph, or auto_decisions.
gui_related: false
gui_classification_reason: This is owner-map and governance routing for discovery behavior, not direct GUI implementation.
depends_on: [0PI-014, 0PI-029]
unblocks: [F3-399, ACD-422, OSI-429, ATS-011]
acceptance_criteria:
  - Owner routing points behavior to Tools and shared schema envelopes to Contracts_V0.
  - Cursor-style regex acceleration remains Instant Grep / SparseNgramIndex, not DiscoveryService.
  - fff and OpenCode are preserved only as source-lineage/reference/prototype evidence unless product direction changes.
  - Current product terms remain PRD Builder and Planning Wizard, with legacy wizard names compatibility-only.
  - CV-291, T-160, T-161, and T-162 are owner-routing references from this index map, not PlanUnit build-order prerequisites.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: standard
context_scope: cross_doc_owner_map
implementation_surfaces: [Plans/00-plans-index.md, Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: owner_map_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0007
  - pldg-20260622-001-fff:atom-0011
  - pldg-20260622-001-fff:atom-0014
  - pldg-20260622-001-fff:atom-0015
  - pldg-20260622-001-fff:atom-0016
  - pldg-20260622-001-fff:atom-0017
  - pldg-20260622-001-fff:atom-0018
  - pldg-20260622-001-fff:atom-0019
  - pldg-20260622-001-fff:atom-0020
  - pldg-20260622-001-fff:atom-0026
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0034
  - pldg-20260622-001-fff:atom-0035
  - pldg-20260622-001-fff:atom-0036
  - pldg-20260622-001-fff:atom-0046
  - pldg-20260622-001-fff:atom-0047
  - pldg-20260622-001-fff:atom-0048
  - pldg-20260622-001-fff:atom-0049
  - pldg-20260622-001-fff:atom-0050
  - pldg-20260622-001-fff:atom-0060
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:atom-0095
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-001
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Helmholtz
source_atom_ids: [atom-0007, atom-0011, atom-0014, atom-0015, atom-0016, atom-0017, atom-0018, atom-0019, atom-0020, atom-0026, atom-0031, atom-0034, atom-0035, atom-0036, atom-0046, atom-0047, atom-0048, atom-0049, atom-0050, atom-0060, atom-0063, atom-0076, atom-0088, atom-0090, atom-0091, atom-0092, atom-0093, atom-0094, atom-0095]
preserved_exact_tokens:
  - "native fff-inspired file discovery"
  - "DiscoveryService"
  - "discover_paths"
  - "Instant Grep"
  - "SparseNgramIndex"
  - "direct fff"
  - "OpenCode"
  - "PRD Builder"
  - "Planning Wizard"
  - "Chain Wizard"
  - "Plan Wizard"
negative_constraints:
  - Do not compile OpenCode or fff prose as product authority.
  - Do not create a second regex/content-search canon beside Instant Grep, grep, or codesearch.
  - Do not revive Chain Wizard, Plan Wizard, Requirements Doc Builder, or Start Chain as current product terms.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, Spec_Lock, shards, evidence, plan_graph, or auto_decisions from this compile.
owner_hints: [Plans/00-plans-index.md, Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
```
