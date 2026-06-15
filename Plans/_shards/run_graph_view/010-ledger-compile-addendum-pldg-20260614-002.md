# Shard 010: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Run_Graph_View.md`

Source lines: L763-L802

Source SHA256: `cd3404679f85ba2a60f97c2da958112acf09e2633873690157fd96796bfe29b5`

---

## Ledger Compile Addendum - pldg-20260614-002

### RGV-011 - Historical Run Focus Mode Persistence

```yaml
plan_unit_id: RGV-011
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Selecting a historical run puts Run Graph into explicit `historical_run` focus mode rather than
  reusing live-run mode implicitly. Focus state persists as `orchestrator.project_state.{project_id}`
  with focused_run_ref, mode, selected node/attempt refs, project/run identity, route object, trust/freshness
  disclosure, available actions, and restore/back-stack metadata. Historical mode blocks live mutation
  actions unless an explicit route/action revalidates against current runtime state.
gui_related: true
gui_classification_reason: Historical run focus mode, available actions, and restore behavior are user-visible Run Graph page behavior.
depends_on: [RGV-002, RGV-010, CV-283]
unblocks: []
acceptance_criteria:
  - Historical run selection creates explicit `historical_run` mode with focused_run_ref persistence.
  - Historical focus discloses trust/freshness and distinguishes historical inspection from live mutation.
  - Restore/back-stack behavior uses the shared route object and project state key.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: historical_run_mode_ambiguity
reasoning_tier: high
context_scope: run_graph_historical_focus_mode
implementation_surfaces: [Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: run_graph_historical_focus_mode, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0094
  - pldg-20260614-002-part-3-fable-cleanup:atom-0095
preserved_exact_tokens: ["Orchestrator Historical Run Mode", "Run_Graph_View.md:75-76", "orchestrator.project_state.{project_id}", "focused_run_ref", "historical_run"]
negative_constraints:
  - Do not treat a selected historical run as the live current run.
  - Do not enable live mutation actions from historical focus without revalidation.
owner_hints: [Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/orchestrator-subagent-integration.md]
```
