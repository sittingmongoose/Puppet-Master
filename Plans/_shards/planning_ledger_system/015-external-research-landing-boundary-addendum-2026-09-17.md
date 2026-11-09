# Shard 015: External Research Landing Boundary Addendum (2026-09-17)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1436-L1539

Source SHA256: `d4acb783778655f5d892991e4a76793ac3a8249dfaf033c09e7e4d1ae1a3731e`

---

## External Research Landing Boundary Addendum (2026-09-17)

Every external research wave that changes canon lands through a ledger registered here (`Plans/External_Research.md`, `ERS-006`). The ledger is the landing record, not the research result: it carries the corrections as correction records with the finding ids they repair, the design atoms and decisions that compiled them, the questions the wave raised with their answers and answer bases, and the compile queue that names the owner PlanUnits produced. Research artifacts, adjudication bundles and run manifests stay where they were published and are cited by path and SHA-256; they are never copied into the ledger as canon. A ledger is not the authorization: a correction lands under the standing repair authorization after its currentness re-check and independent review, and a capability or product choice lands only after the user's recorded answer.

### PLS-023 - External Research Landing Boundary

```yaml
plan_unit_id: PLS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: An external research wave that changes canon is landed through a registered v2 ledger carrying its corrections, design atoms, decisions, questions with their answer bases, and the compile queue naming the owner PlanUnits produced. Research bundles and run manifests remain published where they were produced and are cited by path and SHA-256 rather than copied into the ledger. The ledger records the landing; it does not authorize it, because a correction lands under the standing repair authorization only after its currentness re-check and independent review, and a capability or product choice lands only after the user's recorded answer.
gui_related: false
gui_classification_reason: Ledger landing boundaries are planning-governance behavior, not GUI work.
split_recommended: false
depends_on: [PLS-001, ERS-006]
unblocks: []
acceptance_criteria:
  - A research landing has a registered ledger whose correction records name the finding ids they repair.
  - Every cited research artifact appears by path and SHA-256 and is not copied into the ledger as canon.
  - The ledger records, and never substitutes for, the currentness re-check, the independent review and the user's answer.
  - Open questions the wave raised are ledger question records, not placeholders left in canon text.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py
  - python3 scripts/pm-plan-index.py validate
risk_class: source_authority_drift
reasoning_tier: high
context_scope: planning_ledger
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/External_Research.md, Plans/ledgers/v2/ledger_registry.json]
node_compile_hint: {mode: governance_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/External_Research.md:ERS-006
  - reports/jujutsu-research-2026-09-11/continuation3-landing/README.md
preserved_exact_tokens: ["standing repair authorization", "currentness", "independent review", "ledger question record"]
negative_constraints:
  - Do not treat a ledger record as the authorization for a canon change.
  - Do not copy a research bundle into the ledger as canonical prose.
  - Do not leave a research wave's open question as a placeholder in canon instead of a ledger question record.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/External_Research.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/External_Research.md

### PLS-024 - Application Deep Plan Ledger Custody And Lineage

```yaml
plan_unit_id: PLS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The Assistant Deep Plan profile admits a DeepPlanLedgerSession in application scope with project_id=null,
  actual Server/thread/Computer, exact assistant_plan_id/plan_version and source_hash. It reuses the existing design-atom/decision/question/correction/research/current-state
  registry, statuses and question counter; regular Plan opens no ledger. Scope belongs to the session's execution/custody
  wrapper and is not a Project sentinel. App canonical records use the same bounded retention/holds/backup owners.
  A source app ledger stays immutable when sealed; N25 carries an explicit linked destination session/source map
  or a separately owner-admitted binding and never reinterprets accepted source bytes. Runtime Deep Plan does not
  run the PM bootstrap transfer pipeline or write product Plans/**, owner docs, shards, .plan_index, .evidence or
  Spec_Lock.json. Scoped ledger/bundle details remain secondary to the readable Assistant Plan.
gui_related: false
gui_classification_reason: Defines identity, custody, admission or compiler boundaries; visual placement is consumed
  from GUI owners.
depends_on:
- PLS-020
- AI-069
unblocks: []
acceptance_criteria:
- App Deep Plan session keeps exact Plan/version/source and shared question state through restart/export/backup.
- Regular Plan creates no ledger; conversion preserves sealed source and exact destination lineage.
- No runtime operation writes product canon or governance.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N21-N22; Plan-Deep-Plan
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
preserved_exact_tokens:
- DeepPlanLedgerSession
- project_id=null
- assistant_plan_id/plan_version
- source_hash
- N25
- Plans/**
- .plan_index
- .evidence
- Spec_Lock.json
negative_constraints:
- No bootstrap-ledger reuse, Project sentinel, duplicated question counter or canonical-product authority.
owner_hints:
- Plans/Planning_Ledger_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md#PLS-024, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md
