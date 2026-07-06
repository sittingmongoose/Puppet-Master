# Shard 007: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Plan_Document_System.md`

Source lines: L795-L956

Source SHA256: `4dca51cb80155e1161f5ae8d6be071e799127202dc2a376584eac6938b829f3a`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PDS-016 - Planning Implementation Readiness And Claim Traceability

```yaml
plan_unit_id: PDS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: 'The primary PRD contains Summary, Problem or Opportunity, Goals, Users or Actors, Scope, Non-Goals, Functional Requirements, Non-Functional Requirements, UX Expectations, Data or Integration or Environment Constraints, Acceptance Criteria, Assumptions, Risks and Dependencies, Open Questions, and Source Notes. At topic closure, a separate Overseer conversion agent transforms accepted topic ledger records into a versioned Topic Plan Draft or PlanUnit candidates with exact source lineage, assumptions, open non-blocking items, and cross-topic impacts. After required topics are Ready, a fresh Overseer agent reconciles topic drafts into a coherent Final Plan Pack, resolves duplicates and owner boundaries, and computes cross-topic dependencies, consistency, and compile readiness. Images are supporting references; any requirement, decision, constraint, flow, or acceptance implication introduced by an image must also be written into the
  planning ledger and canonical Plan text. Final Plan Pack audit covers PRD and ledger fidelity, exact details, unsupported inventions, owner and consumer placement, cross-topic conflicts, implementation readiness, testing readiness, security/data/permissions consistency, repository currentness, source lineage, schemas, mechanics, and future compile readiness. Implementation readiness requires behavior, actors and identity, data and state transitions, edge and failure cases, permissions, currentness and idempotency, UI commands and states where applicable, adapters and side effects, validation surfaces, acceptance evidence, dependencies, and handoff contracts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Create Plans/PRD_Builder.md and
  Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
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
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_Document_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0024
- pldg-20260618-001-prd-planning-wizard:atom-0058
- pldg-20260618-001-prd-planning-wizard:atom-0063
- pldg-20260618-001-prd-planning-wizard:atom-0066
- pldg-20260618-001-prd-planning-wizard:atom-0132
- pldg-20260618-001-prd-planning-wizard:atom-0141
- pldg-20260618-001-prd-planning-wizard:atom-0142
- pldg-20260618-001-prd-planning-wizard:atom-0158
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0024
- atom-0058
- atom-0063
- atom-0066
- atom-0132
- atom-0141
- atom-0142
- atom-0158
- atom-0160
decision_refs:
- dec-0008
- dec-0012
- dec-0028
- dec-0029
correction_refs:
- corr-0008
preserved_exact_tokens:
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Open Questions
- Source Notes
- Topic Plan Draft
- topic closure
- Overseer
- Final Plan Pack
- cross-topic integration
- supporting reference
- text remains canonical
- semantic fidelity
- implementation readiness
- source lineage
- behavior
- state transitions
- failure cases
- idempotency
- acceptance evidence
- traceability
- unsupported claim
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- PlanProfile
- doc-impact pass
negative_constraints:
- Do not leave a material requirement only inside an image.
- Do not certify invented planning details with no source or explicit assumption.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Plan_Document_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```

### PDS-017 - Retired Compatibility Retrieval Exclusion

```yaml
plan_unit_id: PDS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_Document_System.md
canonical_text: 'Retired compatibility/source-lineage documents may remain in Plans for auditability, but active product, runtime, implementation, RAG, and search consumers must not retrieve them as current authority. Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md are retained only as compatibility and source-lineage evidence after the PRD Builder and Planning Wizard owner map; product search, runtime-contract search, Plan Compile retrieval, and implementation-agent context builders must exclude those paths or label returned snippets as retired compatibility evidence before use. The exclusion choice is represented in Plans/prd_planning_runtime_contracts.json and validated by scripts/pm-prd-planning-runtime-validate.py; compacting either file to tombstone-only form remains a separate owner decision, not a prerequisite for this bounded repair.'
gui_related: false
gui_classification_reason: Search/index/retrieval governance, not visual presentation.
depends_on: [PDS-016, PNC-018]
unblocks: []
acceptance_criteria:
- Retired Chain Wizard docs are listed in the runtime contract packet retired_search_exclusions.
- Active PRD Builder and Planning Wizard owner docs remain the product authority.
- Compatibility snippets from retired docs cannot be consumed as current runtime/implementation instructions.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_legacy_retrieval
reasoning_tier: standard
context_scope: retired_compatibility_search_exclusion
implementation_surfaces:
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/prd_planning_runtime_contracts.json
- scripts/pm-prd-planning-runtime-validate.py
node_compile_hint:
  mode: retired_retrieval_exclusion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- Plans/PRD_Builder.md#PRDB-001
- Plans/Planning_Wizard.md#PWIZ-001
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-019
preserved_exact_tokens:
- Chain Wizard
- compatibility/source-lineage
- retired_search_exclusions
- PRD Builder
- Planning Wizard
negative_constraints:
- Do not use retired Chain Wizard docs as active product or implementation authority.
- Do not move legacy prose into PRD Builder or Planning Wizard owner docs.
owner_hints:
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/prd_planning_runtime_contracts.json
```
