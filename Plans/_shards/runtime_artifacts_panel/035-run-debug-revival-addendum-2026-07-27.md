# Shard 035: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2624-L2676

Source SHA256: `2e9c5da5d0b21975070933d08b54fdbc6f97f72aa9f44ec426951fde6864de74`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum closes the cross-cutting "debug adapter model" deferral recorded in this document's consume-list by pointing contract ownership at `Plans/FinalGUISpec.md` Run & Debug Revival Addendum (F3-482..F3-496, referenced by unit id only, never restated). It introduces no artifact schema changes and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### RAP-053 - Debug Adapter Model Deferral Closure

```yaml
plan_unit_id: RAP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The "debug adapter model" contract this document's consume-list previously deferred is now owned by
  Plans/FinalGUISpec.md F3-494 (debug adapter registry, capability gating, portability - consumed by
  reference); runtime artifacts that record debug sessions reference dap_session_id through the
  existing §5A investigation identity discipline (referenced, not restated); no artifact schema
  changes are introduced by this closure.
gui_related: false
gui_classification_reason: This unit records a contract ownership pointer with no visible surface.
depends_on: [RAP-052]
unblocks: []
acceptance_criteria:
  - The consume-list "debug adapter model" deferral resolves to Plans/FinalGUISpec.md F3-494 by reference; no adapter registry, capability, or portability prose is restated here.
  - Debug-session runtime artifacts reference dap_session_id only through the existing §5A investigation identity discipline.
  - No artifact schema change is introduced by this closure.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future debug-session artifact identity fixtures
risk_class: contract_ownership_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_adapter_model_deferral_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:191"
  - Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-494; referenced)
preserved_exact_tokens:
  - dap_session_id
  - debug adapter model
negative_constraints:
  - Do not restate the debug adapter registry, capability gating, or portability contract here; Plans/FinalGUISpec.md F3-494 owns it.
  - Do not mint a new artifact family or identity field for debug sessions; §5A investigation identity discipline is referenced, not restated.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
```
