# Shard 040: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/storage-plan.md`

Source lines: L17893-L17949

Source SHA256: `3184c41cc0823c7cc39c93fd44bebed5bed5d784b4ac43e35979ad7b1e47ab94`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum registers the project-scoped persistence key family for classical debugger workspace state (launch profiles, breakpoints, watch expressions) consumed by the rail "Debug & Run" panel and bottom-zone Debug tab whose layout and field schema canon lives in `Plans/FinalGUISpec.md` Run & Debug Revival Addendum (F3-482..F3-496, referenced by unit id only, never restated). It owns only keys, lifetimes, and migration rules, and it creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### SP-244 - Debug Workspace Persistence Keys

```yaml
plan_unit_id: SP-244
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The project-scoped persistence key family for classical debug state is registered as: launch profile
  records under pm.debug.launch_profiles:v1 (project-scoped, survives restart, forward-only migration;
  field schema owned by Plans/FinalGUISpec.md F3-489 and consumed by reference - this unit owns only
  keys, lifetimes, and migration rules and never restates fields); breakpoint records under
  pm.debug.breakpoints:v1 (project-scoped; records keyed by stable breakpoint id carrying
  file/line/type/condition/hit-count/log-message/enabled - the breakpoint record truth that F3-488's
  gutter and shelf renderers sync from, referenced); watch expressions under pm.debug.watches:v1
  (project-scoped ordered list of expression strings); shelf collapse state follows the F3-475
  side-panel persistence key discipline (referenced, not restated); runtime session state (paused
  data, console scrollback) is never persisted - session-ephemeral per F3-483 (referenced); debug
  session records link into the existing dev_session_record.v1 identity family (referenced) via
  dap_session_id.
gui_related: true
gui_classification_reason: Launch profiles, breakpoints, and watch expressions persist the state of user-visible Debug & Run panel shelves and gutter renderers.
split_recommended: false
depends_on: [SP-243]
unblocks: []
acceptance_criteria:
  - All three key strings are project-scoped, survive restart, and carry forward-only migration rules; no session-ephemeral runtime state (paused data, console scrollback) is written to any persisted key.
  - Breakpoint records under pm.debug.breakpoints:v1 are keyed by stable breakpoint id and remain the single record truth that F3-488 gutter and shelf renderers sync from (referenced).
  - Debug session records link into the dev_session_record.v1 identity family via dap_session_id without minting a parallel session identity family.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - No launch-profile field definitions appear in this unit (F3-489 owns the schema).
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces: [Plans/storage-plan.md]
node_compile_hint:
  mode: debug_workspace_persistence_keys
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-482..F3-496; referenced)
preserved_exact_tokens: [pm.debug.launch_profiles:v1, pm.debug.breakpoints:v1, pm.debug.watches:v1]
negative_constraints:
  - Do not restate F3-489 launch-profile fields; the schema is consumed by reference only.
  - Do not own panel collapse keys here; the F3-475 side-panel persistence key discipline is referenced, not restated.
  - Do not persist runtime session state (paused data, console scrollback); it is session-ephemeral per F3-483 (referenced).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
owner_hints: [Plans/storage-plan.md, Plans/FinalGUISpec.md]
```
