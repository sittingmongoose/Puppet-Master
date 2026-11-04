# Shard 022: PERF-001 Named Plan scope repair (2026-09-27)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2821-L2981

Source SHA256: `a0841855cac3cb8cc9d51237aa4b492aa657269eb5b68e69f7df35b73fda52a1`

---

## PERF-001 Named Plan scope repair (2026-09-27)

The header scope offers exactly three explicit scopes over the existing seven tabs
(`Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`):
`All Active`, `Current Project`, and `Selected Plan`. The selected scope filters the existing
tabs; no eighth Orchestrator tab or lifecycle is created. `All Active` shows compact
cross-Project Plan cards carrying human name, derived phase, bounded progress, attention,
priority, and Project plus short-ID disambiguation for duplicate names; each card routes under
explicit immutable `project_id` plus `named_plan_id`. `Current Project` shows the Plans of one
explicit Project; `Selected Plan` shows one explicit Named Plan.

Current versus historical run routing nests inside the Selected Plan scope rather than replacing
it: `active_run_id` / `focused_run_id` with `focus_mode = live | historical` continue to select
the run, and every run route additionally carries the explicit Project+NamedPlan identity the
run was resolved under. Cross-tab deep links and search pivots preserve that Plan identity
alongside the focused run; a scope change re-resolves routes instead of silently re-pointing
them. Focus, selected tab, visible thread, or active Goal never decides Plan identity: every
scoped request carries explicit identity and every child join resolves through the single
NPLAN-006 owner-join contract against the actual owner record and aggregate edges.

Remembered scope and per-Plan view state are convenience only, never authority: stale scope or
a stale join verdict disables scoped mutation under OP-006 projection-trust rules until the
owner surface revalidates. Historical-edge joins authorize read and history inspection only;
any Orchestrator mutation requires a current-edge accept with mutate intent, with owner views
minted by owner adapters rather than the page. This repair adds no commands, no lifecycle, no
storage keys, no events, and no native handlers; Plan switching uses the existing six
`cmd.named_plan.*` commands and background work continues under its owner.

ContractRef: ContractName:Plans/Named_Plan_System.md#NPLAN-006, ContractName:Plans/Orchestrator_Page.md#OP-006, ContractName:Plans/Orchestrator_Page.md#OP-007

### OP-037 - Explicit All Active, Current Project, Selected Plan Scopes

```yaml
plan_unit_id: OP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  The Orchestrator header exposes exactly three explicit scopes, All Active, Current Project, and Selected
  Plan, filtering the existing seven tabs without adding a tab or lifecycle. All Active shows compact
  cross-Project Plan cards with name, phase, progress, attention, priority, and Project plus short-ID
  disambiguation; every card and every scoped route carries explicit immutable project_id plus
  named_plan_id. Current versus historical run routing with active_run_id, focused_run_id, and focus_mode
  nests inside the Selected Plan scope, and every child join resolves through the single NPLAN-006
  owner-join contract. Remembered scope is convenience only; stale scope disables scoped mutation until
  revalidation. The 2026-10-14 theme-matching presentation is FinalGUISpec F3-655's. A current run never
  inherits a historical-run banner from a previous scope; the LIVE mark animates only for a running run.
  No-project chat/Goal/Crew/Assistant Plan/scheduled work appears in OP-038 shared
  Home/Agents/Processes/thread History, not in these Project/NPLAN-006 cards. These three Orchestrator
  scopes and required project_id + named_plan_id are unchanged.
gui_related: true
gui_classification_reason: Header scopes, Plan cards, and scoped tab filtering are user-visible Orchestrator behavior.
depends_on: [OP-002, OP-006, OP-007, NPLAN-006]
unblocks: []
acceptance_criteria:
  - The header offers All Active, Current Project, and Selected Plan and nothing else as Plan scope.
  - The seven-tab set is unchanged; the selected scope filters existing tabs and creates no eighth tab.
  - All Active renders compact cross-Project cards with Project plus short-ID disambiguation for duplicate names.
  - Every scoped route carries explicit project_id plus named_plan_id; focus never supplies identity.
  - Focused-run and historical routing stay coherent inside the Selected Plan scope across tabs, search, and deep links.
  - Stale scope or a rejected join verdict disables scoped mutation until owner revalidation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 -m unittest tests.test_named_plan_semantics
risk_class: orchestrator_plan_scope_drift
reasoning_tier: high
context_scope: orchestrator_named_plan_scope
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: orchestrator_named_plan_scope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
  - "/mnt/Cursor/share/puppet-master/2026-10-13-wizard-orch-theme/NOTES.md, SHA-256 ca7f206e6b92440d26972e4eb4113348722fb45245ba8429dad46633b56b49b8 (approved campaign source lineage; not native implementation evidence)"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "All Active"
  - "Current Project"
  - "Selected Plan"
  - "active_run_id"
  - "focused_run_id"
  - "focus_mode = live | historical"
negative_constraints:
  - Do not add an eighth Orchestrator tab or a parallel Plan lifecycle.
  - Do not build the old run-scoped page without the three explicit scopes.
  - Do not infer Plan identity from focus, tab, thread, or active Goal.
  - Do not treat remembered scope as join authority.
  - Do not retire cross-Project Plan aggregation under the Usage accounting deferral.
  - Do not authorize mutation on a historical-edge join; mutation requires a current-edge accept.
owner_hints:
  - Plans/Orchestrator_Page.md
  - Plans/Named_Plan_System.md
```

### OP-038 - Application Work Projection Without Orchestrator Activation

```yaml
plan_unit_id: OP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: 'The real Project build''s What the build did view consumes Permissions action receipts and shared
  History/ObservableWork, exact targets/outcomes and run-owned Stop/Undo, never a parallel action log. Shared Home,
  Agents, Processes, attention, Usage and thread History projections include app chat/Goal/Crew/Assistant Plan/scheduled
  work with No project, exact work Computer and explicit owner routes. App summaries/attention/pressure/account-switch
  and run-start lookups use admitted app indexes and current scope/visibility; they are not Orchestrator Plan cards
  or new event writers. OP-037 All Active/Current Project/Selected Plan and wizard-document/run History remain real
  Project features: their cards/routes require immutable project_id + named_plan_id and NPLAN-006 owner joins. No-project
  work does not manufacture a NamedPlan, phase, WorkNode, fake progress total or Orchestrator run. Existing historical
  Project readers stay exact; app thread readers use the admitted scope-aware sibling with the same passive evidence/currentness/deletion
  gates. Read-only shared visibility grants no Stop/restart or Project control. Owner attention sentences and counts
  come from the shared work projection, not a page-private list.'
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- SIR-055
- GRS-086
- CWR-045
- APR-073
- SQR-019
unblocks: []
acceptance_criteria:
- App work is discoverable in Home/Agents/Processes/History without an All Active Plan card.
- No-project Orchestrator navigation gives the conversion/select-Project route; conversion alone starts no run.
- Historical app and Project run-start inspection remains passive and cannot reactivate terminal work.
validation_surfaces:
- 'Phase 2: python3 scripts/pm-projects-refresh-contracts.py (F-delivered semantic fixtures)'
- 'Phase 2: python3 scripts/pm-assistant-contract-check.py'
- 'Phase 2: python3 scripts/pm-plan-index.py validate'
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#Q11-Goals-Crew; N21-N22
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning wizard/prd
  builder/orchestrator that isn''t.'
preserved_exact_tokens:
- No project
- OP-037
- project_id + named_plan_id
- NPLAN-006
negative_constraints:
- Do not null OP-037 or Named Plan parent identities, merge History by default or duplicate work state.
- A shared read grants no service/Project mutation authority.
owner_hints:
- Plans/Orchestrator_Page.md
```

ContractRef: ContractName:Plans/Orchestrator_Page.md#OP-038, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md
