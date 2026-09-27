# Shard 013: PERF-001 Named Plan join consumer (2026-09-27)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L1676-L1745

Source SHA256: `244ef6d88c377b3416c039b2b877204fbb152accf376f3ac8bc21b84f30df2fd`

---

## PERF-001 Named Plan join consumer (2026-09-27)

PlanCompile is a Named Plan consumer through the single NPLAN-006 owner-join contract, not
through a duplicated Plan state machine. Every PlanCompileRun, NodeSeed candidate draft,
WorkGraph draft, and WorkNodeRequest carries the explicit immutable `project_id` plus
`named_plan_id` parent edge it was resolved under, with exact child ref, kind, revision, and
currentness hash; compile scope selection filters by that resolved Plan identity, and a
wrong-Plan same-Project, wrong-Project, stale revision or hash, orphan, kind mismatch, or
focus-only join fails certification closed instead of compiling under an assumed Plan.

The join proves lineage only: compile stage semantics, candidate review, graph/request
certification, Executor intake, activation, and the design-only versus runtime-enabled
boundaries stay owned here and by their existing owners. Compile scope admission is mutate
intent and requires a current-edge accept; a historical edge authorizes read inspection only.
This section adds no lifecycle, no commands, no storage keys, no events, and no handlers, and
it changes no PNC-019 certification or buildability gate.

ContractRef: ContractName:Plans/Named_Plan_System.md#NPLAN-006, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-010

### PNC-026 - PlanCompile Parent Edge Through Single Owner-Join Contract

```yaml
plan_unit_id: PNC-026
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Every PlanCompileRun, NodeSeed candidate draft, WorkGraph draft, and WorkNodeRequest carries
  an explicit immutable project_id plus named_plan_id parent edge resolved through the single
  NPLAN-006 owner-join contract against the actual owner record and aggregate edges; scope
  selection filters by resolved Plan identity and any rejected join fails certification closed.
  The join proves lineage only and changes no compile, intake, activation, certification, or
  buildability boundary.
gui_related: false
gui_classification_reason: Parent-edge lineage for compile artifacts is a compiler identity contract, not visual presentation.
depends_on: [PNC-010, NPLAN-006]
unblocks: []
acceptance_criteria:
  - Compile artifacts carry explicit project_id plus named_plan_id with exact child ref, kind, revision, and hash.
  - Scope selection admits only artifacts whose join resolves accepted under the resolved Plan identity.
  - Wrong-Plan, stale, orphan, kind-mismatch, and focus-only joins fail certification closed.
  - No Plan state machine, lifecycle, command, storage key, event, or handler is duplicated here.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 -m unittest tests.test_named_plan_semantics
risk_class: plancompile_plan_lineage_drift
reasoning_tier: high
context_scope: plancompile_named_plan_join
implementation_surfaces:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Named_Plan_System.md
node_compile_hint:
  mode: plancompile_named_plan_join_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "packet:PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08#PERF-001"
preserved_exact_tokens:
  - "PlanCompileRun"
  - "named_plan_id"
  - "project_id"
negative_constraints:
  - Do not compile under an assumed or focused Plan without a resolved join.
  - Do not duplicate Plan lifecycle or child state machines for compile lineage.
  - Do not admit compile scope on a historical-edge join; admission requires a current-edge accept.
  - Do not change PNC-019 certification or buildability gates through this lineage.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Named_Plan_System.md
```
