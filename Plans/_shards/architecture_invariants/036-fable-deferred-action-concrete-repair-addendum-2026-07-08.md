# Shard 036: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Architecture_Invariants.md`

Source lines: L4546-L4619

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime architecture-invariant rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-60e840c059b6db237485d48c`: raw reconciliation fragments preceding INV-001 are audit-lineage only. The canonical invariant is that correlation, usage, permission, route, and artifact identity must be represented by named owner fields and must not be reintroduced as anonymous prose aliases.
- Repairs `sfk-ddd4dece078c664fd31f6de5`: INV-001 now requires `correlation_id` trace-through across provider/runtime dispatch, persisted EventRecord/domain events, artifacts, receipts, and route/open payloads; event-primary `usage_event_ref` normalizes to `object_kind = usage_event`, while PMConcept7 Ledger attempt-primary routing normalizes `attempt_id` to `object_kind = usage_attempt` and retains the event ref as correlation. Neither is a top-level route special case. Evidence: this section, `AI-004`, and `Plans/Contracts_V0.md` route/runtime identity contracts.
- Repairs `sfk-937c36d705a22bf16645cca2`: `GATE-001`, `GATE-003`, and `GATE-010` are routed through `Plans/Progression_Gates.md`; this section now states that `GATE-003` owns invariant governance while current `run-gates` enforcement remains partial until a dedicated invariant verifier exists.

### AI-069 - Genuine Application Workflows And Actual Target Gates

```yaml
plan_unit_id: AI-069
unit_type: requirement
status: accepted
owner_doc: Plans/Architecture_Invariants.md
canonical_text: 'No project is genuine application scope: scope_kind=application, project_id=null, scope_partition=app,
  with real Server, thread and execution Computer identity. Ask, Agent, Debug, Plan, Deep Plan, Goals, Crew, BrainStorm,
  Review, Chat Room, scheduled messages and scheduled tasks use their existing owners in this scope. Only Planning
  Wizard, PRD Builder and Orchestrator have a no-project workflow gate; Requires a project is retained only for
  those three. Each other action still proves the actual file, directory, repository, connection, target Project
  and capability it needs and passes policy.may_execute_tool() at every nesting depth. No browser, permission, scheduling,
  Goal, Crew or storage engine is duplicated for app work. A settings default supplies a preference, never execution
  authority. Application records have their own writer/lease and bounded counterpart custody, not a Project Home
  Server or Vault. Unsupported native routes remain typed unavailable until admitted. CV-365 owns WorkflowScopeV2;
  its Server-level scope is distinct from the execution context. Pure conversation and internal planning carry an
  explicitly empty admitted-root set and null working_directory until a file/command creates the lazy folder or
  a grant supplies a root; null cwd never launches a process or falls back to HOME, current focus or a Project.
  CV-366 owns the sole selected application record/source/hash editions and Plans/application_workflow_source_graph.json;
  an unbound source, writer, read, backup or retention edge remains specified_unimplemented/unavailable.'
gui_related: false
gui_classification_reason: Defines identity, custody, admission or compiler boundaries; visual placement is consumed
  from GUI owners.
depends_on:
- CV-365
unblocks: []
acceptance_criteria:
- Null Project succeeds for the approved workflow matrix with explicit app identity; missing actual targets still
  refuse with their actual reason.
- Unknown scope, fabricated Project, focus-derived identity and mismatched outer/inner scope refuse.
- Planning Wizard/PRD Builder/Orchestrator remain Project-bound; no app build creates WorkNodes.
validation_surfaces:
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F-delivered semantic fixtures)'
- 'Phase 2: python3 scripts/pm-assistant-contract-check.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Architecture_Invariants.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N1-N24; Q11; N21-N22
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- No project
- scope_kind=application
- project_id=null
- scope_partition=app
- Requires a project
- policy.may_execute_tool()
negative_constraints:
- Do not infer access from a nullable field, global view, settings home, visible Project or a copied record.
- Do not relax exact historical Project codecs or claim native certification.
owner_hints:
- Plans/Architecture_Invariants.md
```

ContractRef: ContractName:Plans/Architecture_Invariants.md#AI-069, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/Contracts_V0.md#CV-366
