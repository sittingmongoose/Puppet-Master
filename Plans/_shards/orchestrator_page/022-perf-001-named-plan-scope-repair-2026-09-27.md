# Shard 022: PERF-001 Named Plan scope repair (2026-09-27)

Source: `Plans/Orchestrator_Page.md`

Source lines: L2787-L2876

Source SHA256: `34fb18ebc2ee6a1757c8d61cf908253746bed7f2b9662386037b32b33df80e73`

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
  The Orchestrator header exposes exactly three explicit scopes, All Active, Current Project,
  and Selected Plan, filtering the existing seven tabs without adding a tab or lifecycle. All
  Active shows compact cross-Project Plan cards with name, phase, progress, attention, priority,
  and Project plus short-ID disambiguation; every card and every scoped route carries explicit
  immutable project_id plus named_plan_id. Current versus historical run routing with
  active_run_id, focused_run_id, and focus_mode nests inside the Selected Plan scope, and every
  child join resolves through the single NPLAN-006 owner-join contract. Remembered scope is
  convenience only; stale scope disables scoped mutation until revalidation.
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
