# Shard 016: PERF-001 Named Plan consumer repair (2026-09-27)

Source: `Plans/PRD_Builder.md`

Source lines: L982-L1058

Source SHA256: `4dd841cf723c7a8898c5c3bbf8c29540623152ebc4ce61cf95a8ee2243db8c70`

---

## PERF-001 Named Plan consumer repair (2026-09-27)

PRD Builder is a Named Plan consumer: the workspace carries a PRD switcher plus `New Plan`
entry scoped by explicit immutable `project_id` plus `named_plan_id`. PRDB-005's one primary
PRD is per selected Named Plan, not a global singleton: each selected Plan shows its own
current primary PRD with supporting assumptions, constraints, questions, traceability, and
readiness, and switching Plans never merges, pauses, or cancels background PRD work in any
Plan. Superseded PRDs of the selected Plan remain reachable as historical refs.

Switching restores the selected Plan's last route, tab, filters, inspector, scroll, and focus,
while background extraction, reduction, and review work continue independently under PRD
authority. Plan lifecycle actions use the existing six `cmd.named_plan.*` commands only; this
repair adds no PRD lifecycle, no approval bypass, no storage keys, no events, and no native
handlers, and route success never implies child completion.

Every PRD ledger record, source manifest, annotation, and Approved PRD Pack carries the explicit
Project+NamedPlan parent edge it was resolved under, and every parent join resolves through the
single NPLAN-006 owner-join contract against the actual PRD owner record and aggregate edges.
PRD content, approval, versioning, and readiness stay owned here; the join proves lineage only.
Approval and Planning Wizard handoff are mutate intent and require a current-edge accept; a
historical edge authorizes read inspection only.

ContractRef: ContractName:Plans/Named_Plan_System.md#NPLAN-006, ContractName:Plans/PRD_Builder.md#PRDB-005

### PRDB-013 - PRD Switcher And New Plan Under Selected Plan Scope

```yaml
plan_unit_id: PRDB-013
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: >-
  PRD Builder exposes a PRD switcher plus New Plan entry scoped by explicit immutable
  project_id plus named_plan_id, with one current primary PRD per selected Named Plan,
  independent background work across switches, and per-Plan restore of route, tab, filters,
  inspector, scroll, and focus. Plan lifecycle actions reuse the existing six cmd.named_plan
  commands with no new lifecycle, and every PRD parent edge resolves through the single
  NPLAN-006 owner-join contract while PRD content, approval, and readiness stay owned here.
gui_related: true
gui_classification_reason: The PRD switcher, New Plan entry, per-Plan restore, and scoped workspace are user-visible.
depends_on: [PRDB-005, NPLAN-006]
unblocks: []
acceptance_criteria:
  - The workspace shows a PRD switcher plus New Plan entry carrying explicit Project+NamedPlan identity.
  - Each selected Plan has exactly one current primary PRD; other Plans' PRDs never merge into it.
  - Switching Plans preserves background work in every Plan and restores route, tab, filters, inspector, scroll, and focus.
  - Plan actions use only the existing six cmd.named_plan commands with no new lifecycle or approval bypass.
  - Every PRD record and Approved PRD Pack carries its resolved parent edge through the NPLAN-006 join.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 -m unittest tests.test_named_plan_semantics
risk_class: prd_plan_scope_drift
reasoning_tier: high
context_scope: prd_builder_named_plan_scope
implementation_surfaces:
  - Plans/PRD_Builder.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: prd_builder_named_plan_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
preserved_exact_tokens:
  - "primary PRD"
  - "New Plan"
  - "Approved PRD Pack"
negative_constraints:
  - Do not treat one primary PRD as a global singleton across Plans.
  - Do not pause, cancel, or merge background PRD work on Plan switch.
  - Do not add PRD lifecycle, approval bypass, storage, events, or handlers for scope.
  - Do not treat route success as PRD completion or approval.
  - Do not approve or hand off on a historical-edge join; approval requires a current-edge accept.
owner_hints:
  - Plans/PRD_Builder.md
  - Plans/Named_Plan_System.md
```
